/* ============================================================
 * THEY WERE HERE — Interactive AR Note-Dropping & Navigation
 * Pokémon GO & GTA-inspired Augmented Reality Explorer
 * Designed with Google Stitch (Light Dusk Postcard & Tactical HUD)
 *
 * Requirements & Constraints:
 * 1. Only notes within 5 minutes walking distance (≤375m) can be read or touched.
 * 2. AR mode requires maximum GPS accuracy (real-time telemetry & calibration).
 * 3. 3D distinction: Obsidian shadow silhouette + glowing white question mark (?)
 *    for locked mystery notes; warm origami paper bird with Hanko seal for placed notes.
 * ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  NavigationArrow,
  MapTrifold,
  Sparkle,
  Crosshair,
  Sun,
  MapPin,
  Compass,
  ArrowRight,
  ShieldWarning,
  Footprints,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { haversineDistance, bearing, formatDistance, toCardinal } from '@/lib/geo';
import { hapticTap } from '@/lib/haptics';
import { playRadarPing, playButtonClick } from '@/lib/audio';
import type { ExtendedNote } from '@/lib/seedNotes';
import { APP_NAME, POKEMON_GO_TOUCH_RADIUS_METERS } from '@/contracts/types';
import { AppLogo } from '@/ui/components/AppLogo';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';
import { requestLocationPermission } from '@/lib/locationService';

interface ARNoteViewProps {
  onClose: () => void;
  onOpenNote: (note: ExtendedNote) => void;
  onDropNote: () => void;
}

/** 5-minute walking distance threshold: 75 m/min * 5 min = 375 meters */
const FIVE_MIN_WALK_METERS = 375;

/** Procedural glowing White Question Mark texture for mystery locked silhouettes */
function createQuestionMarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    // Ethereal circular aura
    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 120);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    grad.addColorStop(0.4, 'rgba(110, 68, 255, 0.40)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Sharp white question mark (?)
    ctx.font = '900 170px "Space Grotesk", "Sora", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 24;
    ctx.fillText('?', 128, 136);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ARNoteView: React.FC<ARNoteViewProps> = ({
  onClose,
  onOpenNote,
  onDropNote,
}) => {
  const position = useAppStore((s) => s.position);
  const notes = useAppStore((s) => s.notes);
  const passportNotes = useAppStore((s) => s.passportNotes);
  const profile = useAppStore((s) => s.profile);
  const isSimulated = useAppStore((s) => s.isSimulated);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAccuracyDialog, setShowAccuracyDialog] = useState(false);

  // 3D Device Orientation & Interaction Tracking refs
  const hasOrientDataRef = useRef(false);
  const manualYawRef = useRef(0);
  const manualPitchRef = useRef(0);
  const [isReticleLockedOn, setIsReticleLockedOn] = useState(false);
  const wasReticleLockedRef = useRef(false);
  const isReticleLockedOnRef = useRef(false);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const interactiveMeshesRef = useRef<THREE.Object3D[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // ── 1. REAL-TIME ACCURACY TIER ASSESSMENT ──────────────────────
  const accuracyMeters = position?.accuracy ?? 15;
  const accuracyTier: 'high' | 'moderate' | 'low' =
    accuracyMeters <= 15 ? 'high' : accuracyMeters <= 25 ? 'moderate' : 'low';

  // ── 2. 5-MINUTE WALKING DISTANCE FILTERING ──────────────────────
  const sortedNotes = useMemo(() => {
    if (!position || notes.length === 0) return [];
    return [...notes]
      .map((n) => {
        const dist = haversineDistance(position.lat, position.lng, n.lat, n.lng);
        return {
          note: n,
          dist,
          bear: bearing(position.lat, position.lng, n.lat, n.lng),
          walkingMinutes: Math.max(1, Math.round(dist / 75)),
          isWithin5Min: dist <= FIVE_MIN_WALK_METERS,
        };
      })
      .sort((a, b) => a.dist - b.dist);
  }, [position, notes]);

  // Notes within the 5-minute walking boundary
  const notesWithin5Min = useMemo(() => {
    return sortedNotes.filter((n) => n.isWithin5Min);
  }, [sortedNotes]);

  // Active target candidate pool: prioritzes notes within 5-min walk
  const activePool = notesWithin5Min.length > 0 ? notesWithin5Min : sortedNotes;
  const currentTarget = activePool[targetIndex] ?? activePool[0] ?? null;
  const targetNote = currentTarget ? currentTarget.note : null;
  const distanceToTarget = currentTarget ? currentTarget.dist : null;
  const targetBearing = currentTarget ? currentTarget.bear : 0;
  const targetWalkingMinutes = currentTarget ? currentTarget.walkingMinutes : 1;
  const isBeyond5Min = currentTarget ? !currentTarget.isWithin5Min : false;

  // Bearing difference relative to device heading (-180 to +180)
  const bearingDiff = useMemo(() => {
    return ((targetBearing - deviceHeading + 540) % 360) - 180;
  }, [targetBearing, deviceHeading]);

  // Note relationship
  const isMine = Boolean(
    targetNote && (targetNote.is_mine || targetNote.author_handle === profile?.handle)
  );
  const isUnlocked = Boolean(
    targetNote && passportNotes.some((pn) => pn.id === targetNote.id)
  );
  const isMysteryLocked = !isMine && !isUnlocked;
  const isHere = distanceToTarget !== null && (distanceToTarget <= POKEMON_GO_TOUCH_RADIUS_METERS || isSimulated);

  // Strict interaction rule: CAN ONLY READ OR TOUCH IF WITHIN 5 MIN & WITHIN UNLOCK REACH
  const canTouchOrRead = Boolean(targetNote && !isBeyond5Min && isHere);

  // ── Live Tracking Refs ──
  const deviceHeadingRef = useRef<number>(0);
  const devicePitchRef = useRef<number>(90);
  const deviceRollRef = useRef<number>(0);
  const userPositionRef = useRef(position);
  const targetNoteRef = useRef(targetNote);
  const initialPlacementHeadingRef = useRef<number | null>(null);
  const tagCardRef = useRef<HTMLDivElement>(null);

  // Sync position and targetNote to refs
  useEffect(() => {
    userPositionRef.current = position;
  }, [position]);

  useEffect(() => {
    targetNoteRef.current = targetNote;
    initialPlacementHeadingRef.current = null;
  }, [targetNote?.id]);

  // Cycle through available targets
  const handleNextTarget = () => {
    if (activePool.length > 1) {
      setTargetIndex((prev) => (prev + 1) % activePool.length);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // iOS Safari permission helper
  const requestOrientationPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      } catch (err) {
        console.warn('[ARNoteView] Permission request:', err);
      }
    }
  };

  // Automatically trigger orientation and high-accuracy GPS fix on AR mode entry
  useEffect(() => {
    requestOrientationPermission();
    requestLocationPermission();
  }, []);

  // ── 3. DEVICE ORIENTATION & COMPASS (Live Gyroscope Tracking) ──
  const filteredAlphaRef = useRef<number | null>(null);
  const filteredBetaRef = useRef<number | null>(null);
  const filteredGammaRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let alpha = e.alpha ?? 0;
      let beta = e.beta ?? 90;
      let gamma = e.gamma ?? 0;

      let headingDeg = 0;

      const anyEvent = e as unknown as { webkitCompassHeading?: number };
      if (typeof anyEvent.webkitCompassHeading === 'number') {
        // iOS Safari: webkitCompassHeading is true 0-360 compass heading
        headingDeg = anyEvent.webkitCompassHeading;
      } else {
        // Android / W3C: alpha is counter-clockwise from North
        headingDeg = (360 - alpha + 360) % 360;
      }

      // Smooth heading with complementary low-pass filter to remove IMU jitter
      if (filteredAlphaRef.current === null) {
        filteredAlphaRef.current = headingDeg;
        filteredBetaRef.current = beta;
        filteredGammaRef.current = gamma;
      } else {
        let dHeading = headingDeg - filteredAlphaRef.current;
        if (dHeading > 180) dHeading -= 360;
        if (dHeading < -180) dHeading += 360;
        filteredAlphaRef.current = ((filteredAlphaRef.current + dHeading * 0.75) + 360) % 360;
        filteredBetaRef.current = (filteredBetaRef.current ?? 90) + (beta - (filteredBetaRef.current ?? 90)) * 0.75;
        filteredGammaRef.current = (filteredGammaRef.current ?? 0) + (gamma - (filteredGammaRef.current ?? 0)) * 0.75;
      }

      const fHeading = filteredAlphaRef.current ?? headingDeg;
      const fBeta = filteredBetaRef.current ?? beta;
      const fGamma = filteredGammaRef.current ?? gamma;

      deviceHeadingRef.current = fHeading;
      devicePitchRef.current = fBeta;
      deviceRollRef.current = fGamma;

      setDeviceHeading(Math.round(fHeading));
      hasOrientDataRef.current = true;
    };

    const targetWindow = window as unknown as EventTarget;
    const isAbsoluteSupported =
      typeof (window as unknown as Record<string, unknown>).ondeviceorientationabsolute !==
      'undefined';

    if (isAbsoluteSupported) {
      targetWindow.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    } else {
      targetWindow.addEventListener('deviceorientation', handleOrientation as EventListener);
    }

    return () => {
      targetWindow.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation as EventListener
      );
      targetWindow.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, []);

  // Aggressively terminate all camera hardware tracks to prevent mobile device overheating
  const stopCameraHardware = () => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('[ARNoteView] Error stopping media tracks:', err);
      }
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (err) {
        console.warn('[ARNoteView] Error detaching video stream:', err);
      }
    }
    setCameraActive(false);
  };

  const handleExitAR = () => {
    stopCameraHardware();
    onClose();
  };

  // ── 4. CAMERA STREAM INITIALIZATION ─────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let localStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API unsupported');
        }

        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 60, min: 30 },
          },
          audio: false,
        });

        if (!isMounted) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = localStream;

        if (videoRef.current) {
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.srcObject = localStream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('[ARNoteView] Camera stream fallback to simulated AR viewport:', err);
        setCameraActive(false);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Toggle Torch/Flashlight if hardware supports it
  const toggleTorch = async () => {
    try {
      const stream = mediaStreamRef.current;
      if (!stream) return;
      const track = stream.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        const nextState = !torchActive;
        const constraints = { advanced: [{ torch: nextState }] } as unknown as MediaTrackConstraints;
        await track.applyConstraints(constraints);
        setTorchActive(nextState);
      }
    } catch (e) {
      console.warn('Torch not supported:', e);
    }
  };

  // ── 5. THREE.JS 3D SCENE & RETICLE INTERACTION ──────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);
    camera.rotation.order = 'YXZ'; // Prevents gimbal lock for device orientation

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff0c4, 2.5);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    const glowColor = isMysteryLocked ? 0x6e44ff : isMine ? 0xffc93c : 0xe8264c;
    const glowLight = new THREE.PointLight(glowColor, isHere ? 4.5 : 2.5, 18);
    glowLight.position.set(0, 0, 2);
    scene.add(glowLight);

    const noteGroup = new THREE.Group();

    // ── 3D Origami Letter Beacon Setup (Taste Standard / Anime Celestial Artifact) ──
    const beaconGroup = new THREE.Group();
    noteGroup.add(beaconGroup);

    let noteMesh: THREE.Mesh;
    let flapMesh: THREE.Mesh | null = null;
    let sealMesh: THREE.Mesh | null = null;
    let sealEmblemMesh: THREE.Mesh | null = null;
    let qMarkMesh: THREE.Mesh | null = null;
    const qMarkTexture = isMysteryLocked ? createQuestionMarkTexture() : null;

    if (isMysteryLocked) {
      // 1. Obsidian Mystery Locked Artifact
      const noteGeom = new THREE.BoxGeometry(1.85, 1.25, 0.16);
      const noteMat = new THREE.MeshStandardMaterial({
        color: 0x14182e,
        emissive: 0x2e1950,
        emissiveIntensity: 0.75,
        roughness: 0.65,
        metalness: 0.3,
        transparent: true,
        opacity: 0.94,
      });
      noteMesh = new THREE.Mesh(noteGeom, noteMat);
      beaconGroup.add(noteMesh);

      // Flap
      const flapGeom = new THREE.ConeGeometry(0.75, 0.45, 3);
      const flapMat = new THREE.MeshStandardMaterial({
        color: 0x1e2442,
        emissive: 0x3d2070,
        emissiveIntensity: 0.6,
        roughness: 0.6,
      });
      flapMesh = new THREE.Mesh(flapGeom, flapMat);
      flapMesh.rotation.z = Math.PI;
      flapMesh.position.set(0, 0.12, 0.10);
      beaconGroup.add(flapMesh);

      if (qMarkTexture) {
        const qGeom = new THREE.PlaneGeometry(1.1, 1.1);
        const qMat = new THREE.MeshBasicMaterial({
          map: qMarkTexture,
          transparent: true,
          side: THREE.DoubleSide,
        });
        qMarkMesh = new THREE.Mesh(qGeom, qMat);
        qMarkMesh.position.z = 0.32;
        beaconGroup.add(qMarkMesh);
      }
    } else {
      // 2. Luminous Folded Origami Travel Envelope with Wax Seal
      const noteGeom = new THREE.BoxGeometry(1.85, 1.25, 0.16);
      const envelopeColor = isMine
        ? 0xfff6e5
        : targetNote?.rarity === 'legendary'
        ? 0xfff0d0
        : targetNote?.rarity === 'rare'
        ? 0xeef9ff
        : 0xffffff;

      const emissiveColor = isMine
        ? 0xffc93c
        : targetNote?.rarity === 'legendary'
        ? 0xffaa00
        : targetNote?.rarity === 'rare'
        ? 0x35b6ff
        : 0x5ee2b5;

      const noteMat = new THREE.MeshStandardMaterial({
        color: envelopeColor,
        emissive: emissiveColor,
        emissiveIntensity: isHere ? 0.45 : 0.25,
        roughness: 0.35,
        metalness: 0.12,
      });
      noteMesh = new THREE.Mesh(noteGeom, noteMat);
      beaconGroup.add(noteMesh);

      // Origami Triangular Envelope Flap
      const flapGeom = new THREE.ConeGeometry(0.78, 0.48, 3);
      const flapMat = new THREE.MeshStandardMaterial({
        color: isMine ? 0xffecd0 : 0xf7f4ec,
        emissive: emissiveColor,
        emissiveIntensity: isHere ? 0.35 : 0.18,
        roughness: 0.4,
        metalness: 0.1,
      });
      flapMesh = new THREE.Mesh(flapGeom, flapMat);
      flapMesh.rotation.z = Math.PI;
      flapMesh.position.set(0, 0.12, 0.10);
      beaconGroup.add(flapMesh);

      // Hanko Vermilion Wax Seal
      const sealGeom = new THREE.CylinderGeometry(0.36, 0.40, 0.12, 32);
      const sealMat = new THREE.MeshStandardMaterial({
        color: 0xe8264c,
        emissive: 0xe8264c,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.15,
      });
      sealMesh = new THREE.Mesh(sealGeom, sealMat);
      sealMesh.rotation.x = Math.PI / 2;
      sealMesh.position.set(0, -0.05, 0.14);
      beaconGroup.add(sealMesh);

      // Embossed Golden Star Crest on the seal
      const emblemGeom = new THREE.CylinderGeometry(0.20, 0.20, 0.05, 16);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        metalness: 0.85,
        roughness: 0.2,
      });
      sealEmblemMesh = new THREE.Mesh(emblemGeom, emblemMat);
      sealEmblemMesh.rotation.x = Math.PI / 2;
      sealEmblemMesh.position.set(0, -0.05, 0.20);
      beaconGroup.add(sealEmblemMesh);
    }

    // ── 3. Dual Revolving Celestial Astrolabe Gyro Rings ──
    const ringAccent = isMysteryLocked
      ? 0x8a5eff
      : targetNote?.rarity === 'legendary'
      ? 0xffc93c
      : targetNote?.rarity === 'rare'
      ? 0x35b6ff
      : 0x5ee2b5;

    const outerRingGeom = new THREE.TorusGeometry(1.85, 0.034, 16, 72);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: ringAccent,
      emissive: ringAccent,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeom, outerRingMat);
    noteGroup.add(outerRingMesh);

    const innerRingGeom = new THREE.TorusGeometry(1.48, 0.024, 16, 56);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: ringAccent,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.7,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeom, innerRingMat);
    noteGroup.add(innerRingMesh);

    // Glowing orbiting satellite jewels
    const satelliteGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const satelliteMat = new THREE.MeshBasicMaterial({
      color: isMysteryLocked ? 0xbaa1ff : 0xffffff,
    });
    const satellite1 = new THREE.Mesh(satelliteGeom, satelliteMat);
    const satellite2 = new THREE.Mesh(satelliteGeom, satelliteMat);
    noteGroup.add(satellite1);
    noteGroup.add(satellite2);

    // ── 4. Ambient Starlight Dust Particles ──
    const particleCount = 28;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.35 + (i % 5) * 0.22;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = ((i % 7) - 3) * 0.32;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: ringAccent,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
    });
    const particleField = new THREE.Points(particleGeom, particleMat);
    noteGroup.add(particleField);

    // Ground Shockwave Ring
    const ringColor = isMysteryLocked ? 0x6e44ff : isMine ? 0xffc93c : isHere ? 0x5ee2b5 : 0xe8264c;
    const ringGeom = new THREE.RingGeometry(1.6, 1.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -2.3;
    noteGroup.add(ringMesh);

    scene.add(noteGroup);
    cameraRef.current = camera;
    interactiveMeshesRef.current = [
      noteMesh,
      flapMesh,
      sealMesh,
      sealEmblemMesh,
      qMarkMesh,
      outerRingMesh,
      innerRingMesh,
      ringMesh,
    ].filter(Boolean) as THREE.Object3D[];

    // ── Animation Loop ──
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow, steady origami hover & yaw
      const hoverY = Math.sin(time * 2.0) * 0.12;
      beaconGroup.position.y = hoverY;
      beaconGroup.rotation.y = time * 0.65;
      beaconGroup.rotation.x = Math.sin(time * 1.5) * 0.06;

      // Astrolabe Gyro Rings counter-rotation
      outerRingMesh.position.y = hoverY;
      outerRingMesh.rotation.x = Math.PI / 4 + Math.sin(time * 0.8) * 0.15;
      outerRingMesh.rotation.y = time * 0.85;

      innerRingMesh.position.y = hoverY;
      innerRingMesh.rotation.x = -Math.PI / 3 + Math.cos(time * 0.7) * 0.15;
      innerRingMesh.rotation.z = -time * 0.95;

      // Satellites orbiting along gyro ring paths
      satellite1.position.set(
        Math.cos(time * 1.4) * 1.85,
        hoverY + Math.sin(time * 1.4) * 0.35,
        Math.sin(time * 1.4) * 1.85
      );
      satellite2.position.set(
        Math.cos(-time * 1.2 + Math.PI) * 1.48,
        hoverY + Math.sin(-time * 1.2) * 0.30,
        Math.sin(-time * 1.2 + Math.PI) * 1.48
      );

      // Particle constellation rotation
      particleField.position.y = hoverY;
      particleField.rotation.y = time * 0.22;

      // Ground shockwave rings (slow floor expansion)
      const ringScale = 1.0 + (time % 2.5) * 0.4;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0, 0.6 - (time % 2.5) * 0.24);

      // Camera tilt pitch & roll from device sensors
      // In portrait: vertical is beta ~ 90 deg -> pitch = 0
      // Tilting down towards floor -> beta > 90 -> camera pitches down
      // Tilting up towards sky -> beta < 90 -> camera pitches up
      const curPitch = devicePitchRef.current;
      const curRoll = deviceRollRef.current;
      const pitchRad = THREE.MathUtils.degToRad(curPitch - 90);
      const rollRad = THREE.MathUtils.degToRad(curRoll);
      camera.rotation.set(pitchRad, 0, -rollRad, 'ZXY');

      // ── Dynamic Polar Geo-Anchoring (Real-World Space Alignment) ──
      // Real Geo-AR positioning: The note's position in camera view is strictly governed
      // by the relative azimuth angle (bearing - heading) and physical GPS distance.
      const target = targetNoteRef.current;
      const pos = userPositionRef.current;
      const heading = deviceHeadingRef.current;

      let isInFront = false;

      if (target && pos) {
        const dist = haversineDistance(pos.lat, pos.lng, target.lat, target.lng);
        let bear = bearing(pos.lat, pos.lng, target.lat, target.lng);

        if (dist < 1.0) {
          if (initialPlacementHeadingRef.current === null) {
            initialPlacementHeadingRef.current = heading;
          }
          bear = initialPlacementHeadingRef.current;
        } else {
          initialPlacementHeadingRef.current = null;
        }

        // Relative horizontal angular offset (-180 to +180)
        const deltaAzimuth = ((bear - heading + 540) % 360) - 180;

        // HARD PHYSICAL VISIBILITY CUTOFF:
        // Notes beyond 100m are completely invisible in 3D AR camera space.
        // The top compass needle still tracks bearing direction, but the 3D model & card are hidden.
        if (dist > 100.0) {
          noteGroup.visible = false;
          isInFront = false;
        } else {
          noteGroup.visible = true;

          // Perspective distance and scale curve: "longer it is, smaller it goes"
          // Close (≤3m): scale 1.0, distance 2.2m
          // Mid (3m < dist ≤ 20m): scale 1.0 down to 0.60, visual distance 2.2m to 9.3m
          // Far (20m < dist ≤ 100m): scale 0.60 down to 0.20, visual distance pushes to 15m
          let visualDist = 2.2;
          let visualScale = 1.0;

          if (dist <= 3.0) {
            visualDist = 2.2;
            visualScale = 1.0;
          } else if (dist <= 20.0) {
            visualDist = 2.2 + (dist - 3.0) * 0.42;
            visualScale = Math.max(0.60, 1.0 - (dist - 3.0) * 0.023);
          } else {
            visualDist = 9.34 + (dist - 20.0) * 0.075;
            visualScale = Math.max(0.20, 0.60 - (dist - 20.0) * 0.005);
          }

          noteGroup.scale.set(visualScale, visualScale, visualScale);

          const rad = THREE.MathUtils.degToRad(deltaAzimuth);

          // Position in camera view:
          // When you pan right -> note shifts LEFT on screen
          // When you pan left -> note shifts RIGHT on screen
          // When you face away -> note is BEHIND camera (posZ > 0)
          const posX = visualDist * Math.sin(rad);
          const posZ = -visualDist * Math.cos(rad);
          const posY = -0.7; // Sitting below eye level on ground

          noteGroup.position.set(posX, posY, posZ);

          isInFront = posZ < 0;
        }
      } else {
        noteGroup.visible = false;
        isInFront = false;
      }

      // True 3D Reticle Lock-On Detection & Screen Projection
      let isLockedOn = false;

      if (target && isInFront && noteGroup.visible) {
        // 1. Center reticle detection (calculates exact distance to screen crosshair in NDC)
        const noteCenterNDC = new THREE.Vector3();
        noteCenterNDC.setFromMatrixPosition(noteMesh.matrixWorld);
        noteCenterNDC.project(camera);

        const distFromCrosshair = Math.hypot(noteCenterNDC.x, noteCenterNDC.y);
        isLockedOn = distFromCrosshair < 0.28 && noteCenterNDC.z > 0 && noteCenterNDC.z < 1;

        // 2. Project floating callout card slightly above note
        const cardPosNDC = noteCenterNDC.clone();
        cardPosNDC.y += 0.22;
        const isOnScreen = Math.abs(cardPosNDC.x) <= 1.05 && Math.abs(cardPosNDC.y) <= 1.05 && cardPosNDC.z < 1;
        const screenX = ((cardPosNDC.x + 1) * width) / 2;
        const screenY = ((-cardPosNDC.y + 1) * height) / 2;

        if (tagCardRef.current) {
          if (isOnScreen) {
            tagCardRef.current.style.display = 'block';
            tagCardRef.current.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -100%)`;
          } else {
            tagCardRef.current.style.display = 'none';
          }
        }
      } else if (tagCardRef.current) {
        tagCardRef.current.style.display = 'none';
      }

      isReticleLockedOnRef.current = isLockedOn;
      if (isLockedOn !== wasReticleLockedRef.current) {
        if (isLockedOn) {
          hapticTap();
          playRadarPing();
        }
        wasReticleLockedRef.current = isLockedOn;
        setIsReticleLockedOn(isLockedOn);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Touch / mouse drag looking fallback for devices without gyro or testing on PC
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      requestOrientationPermission();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      if (!hasOrientDataRef.current) {
        manualYawRef.current = (manualYawRef.current - dx * 0.25 + 360) % 360;
        manualPitchRef.current = THREE.MathUtils.clamp(
          manualPitchRef.current - dy * 0.25,
          45,
          135
        );
        deviceHeadingRef.current = manualYawRef.current;
        devicePitchRef.current = manualPitchRef.current;
        setDeviceHeading(Math.round(manualYawRef.current));
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      cameraRef.current = null;
      interactiveMeshesRef.current = [];
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [targetNote?.id, isMysteryLocked, isMine, isHere]);

  // Handle tap when crosshairs are not aligned with target note
  const handleMissedTap = () => {
    if (!targetNote) return;

    if (isBeyond5Min) {
      showToast(
        `>5 min walk (${distanceToTarget !== null ? formatDistance(distanceToTarget) : ''}). In AR mode, notes can only be touched within a 5-minute walk (≤375m). Use 2D Map!`
      );
      return;
    }

    if (!isHere) {
      showToast(
        `~${targetWalkingMinutes} min walk away (${distanceToTarget !== null ? formatDistance(distanceToTarget) : ''}). Walk within ${POKEMON_GO_TOUCH_RADIUS_METERS}m to touch and dispel shadow!`
      );
      return;
    }

    // Within 40m, but camera is not pointing at the note:
    if (bearingDiff > 15) {
      showToast('No note in crosshairs. Turn right to align with the note.');
    } else if (bearingDiff < -15) {
      showToast('No note in crosshairs. Turn left to align with the note.');
    } else {
      showToast('Aim center crosshairs directly at the note to touch it.');
    }
  };

  // Canvas click handler with Raycasting and reticle verification
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!targetNote) return;

    const container = mountRef.current;
    if (!container || !cameraRef.current) {
      handleMissedTap();
      return;
    }

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    // 1. Raycast direct click on 3D note geometry
    raycasterRef.current.setFromCamera(mouse, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(interactiveMeshesRef.current, true);
    const hit3DNote = intersects.length > 0;

    // 2. Check center proximity and reticle lock-on
    const distFromCenter = Math.hypot(mouse.x, mouse.y);
    const hitCenterLock = distFromCenter < 0.35 && isReticleLockedOnRef.current;

    if (hit3DNote || hitCenterLock) {
      handleTouchNote();
    } else {
      handleMissedTap();
    }
  };

  // Handle touching / clicking the AR note
  const handleTouchNote = () => {
    if (!targetNote) return;

    if (isBeyond5Min) {
      showToast(
        `>5 min walk (${distanceToTarget !== null ? formatDistance(distanceToTarget) : ''}). In AR mode, notes can only be touched within a 5-minute walk (≤375m). Use 2D Map!`
      );
      return;
    }

    if (!isHere) {
      showToast(
        `~${targetWalkingMinutes} min walk away (${distanceToTarget !== null ? formatDistance(distanceToTarget) : ''}). Walk within ${POKEMON_GO_TOUCH_RADIUS_METERS}m to touch and dispel shadow!`
      );
      return;
    }

    // Within 5 min and within 40m: Allowed!
    playButtonClick();
    onOpenNote(targetNote);
  };

  // Handle dropping note with maximum accuracy validation
  const handleAttemptDrop = () => {
    playButtonClick();
    if (accuracyTier === 'low') {
      setShowAccuracyDialog(true);
    } else {
      onDropNote();
    }
  };

  const targetCardinal = toCardinal(targetBearing);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#0F1230] flex flex-col justify-between safe-top safe-bottom select-none"
      style={{ zIndex: 'var(--z-ar, 100)' }}
    >
      {/* ── 1. BACKGROUND: LIVE CAMERA FEED OR SIMULATED AR SKY ────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover ${
          cameraActive ? 'opacity-100' : 'hidden'
        }`}
      />

      {!cameraActive && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `linear-gradient(
              180deg,
              #BDE3F8 0%,
              #E5F4FC 35%,
              #FFF6E5 70%,
              #EDE0C9 100%
            )`,
          }}
        >
          {/* Simulated Perspective Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(15, 18, 48, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 18, 48, 0.25) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'perspective(400px) rotateX(60deg) translateY(80px)',
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      )}

      {/* ── 2. TACTICAL VIEWFINDER CORNER RETICLES & HORIZON GUIDE ─── */}
      <div className="absolute top-16 left-4 w-4 h-4 border-t-2 border-l-2 border-white/50 pointer-events-none z-10" />
      <div className="absolute top-16 right-4 w-4 h-4 border-t-2 border-r-2 border-white/50 pointer-events-none z-10" />
      <div className="absolute bottom-28 left-4 w-4 h-4 border-b-2 border-l-2 border-white/50 pointer-events-none z-10" />
      <div className="absolute bottom-28 right-4 w-4 h-4 border-b-2 border-r-2 border-white/50 pointer-events-none z-10" />

      {/* Artificial Horizon Pitch Guide */}
      <div className="absolute top-[38%] left-4 right-4 h-px bg-white/20 pointer-events-none z-10 flex items-center justify-between px-2">
        <span className="font-mono text-[8px] text-white/50 uppercase">AR 6DOF</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] shadow-xs" />
          <div className="w-6 h-[1px] bg-white/40" />
          <div className="w-2 h-2 border border-white/60 rotate-45" />
          <div className="w-6 h-[1px] bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] shadow-xs" />
        </div>
        <span className="font-mono text-[8px] text-white/50 uppercase">
          {Math.round(deviceHeading)}° {targetCardinal}
        </span>
      </div>

      {/* ── 3. THREE.JS 3D CANVAS VIEWPORT ─────────────────────────── */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
      />

      {/* ── 4. FLOATING 2D AR CALLOUT CARD (ANCHORED TO 3D NOTE) ────── */}
      {targetNote && (
        <div
          ref={tagCardRef}
          className="absolute top-0 left-0 z-30 pointer-events-auto transition-transform duration-75 cursor-pointer active:scale-95"
          style={{ display: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            handleTouchNote();
          }}
        >
          {/* Postcard Glass Callout Card */}
          <div
            className="px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex flex-col gap-1 text-center border-2"
            style={{
              background: isMysteryLocked
                ? 'rgba(15, 18, 48, 0.94)'
                : 'rgba(255, 255, 255, 0.96)',
              color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
              borderColor: isMine
                ? 'var(--legendary)'
                : isHere
                ? 'var(--mint)'
                : isMysteryLocked
                ? '#6E44FF'
                : 'var(--hanko)',
            }}
          >
            {/* Tag Slanted Header */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded tracking-wide"
                style={{
                  background: isMine
                    ? 'var(--legendary)'
                    : isHere
                    ? 'var(--mint)'
                    : isMysteryLocked
                    ? '#6E44FF'
                    : 'var(--hanko)',
                  color: '#0F1230',
                }}
              >
                {isMine
                  ? 'YOUR NOTE'
                  : isMysteryLocked
                  ? 'SHADOW MEMO'
                  : `${targetNote.rarity.toUpperCase()} NOTE`}
              </span>
              <span className="text-[9px] font-mono text-white/70">
                {distanceToTarget !== null ? formatDistance(distanceToTarget) : '...'}
              </span>
            </div>

            {/* Note title / Shadow Clue */}
            <span className="font-display text-xs max-w-[210px] truncate">
              {isMysteryLocked ? 'Shadow Clue: Encrypted Message' : targetNote.title}
            </span>

            {/* Walking reach guidance */}
            <span
              className="text-[10px] font-mono font-bold"
              style={{
                color: isBeyond5Min
                  ? '#FF6B6B'
                  : isHere
                  ? '#5EE2B5'
                  : '#FFC93C',
              }}
            >
              {isBeyond5Min
                ? `>5 MIN WALK (${targetWalkingMinutes}m) • CANNOT TOUCH`
                : isHere
                ? 'IN TOUCH RANGE • TAP TO REVEAL'
                : `~${targetWalkingMinutes} MIN WALK • WALK WITHIN 40M`}
            </span>
          </div>

          {/* Pointer line */}
          <div className="w-0.5 h-4 bg-white mx-auto shadow-sm" />
        </div>
      )}

      {/* ── 5. TOP HUD: STITCH HEADER & POKÉMON GO COMPASS STRIP ───── */}
      <div className="relative z-30 flex flex-col gap-2 p-3 safe-top pointer-events-none">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          {/* Brand + AR Tracking Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#14143A]/15 shadow-sm">
              <AppLogo size={18} showWordmark={false} />
              <span className="font-display font-black text-xs text-[var(--ink-900)] tracking-tight">
                {APP_NAME}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hanko)] animate-pulse" />
            </div>

            {/* GPS Accuracy Tier Pill */}
            <div
              className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 sm:gap-1.5 shadow-sm backdrop-blur-md"
              style={{
                background:
                  accuracyTier === 'high'
                    ? 'rgba(94, 226, 181, 0.20)'
                    : accuracyTier === 'moderate'
                    ? 'rgba(255, 201, 60, 0.20)'
                    : 'rgba(232, 38, 76, 0.25)',
                border: `1px solid ${
                  accuracyTier === 'high'
                    ? 'var(--mint)'
                    : accuracyTier === 'moderate'
                    ? 'var(--legendary)'
                    : 'var(--hanko)'
                }`,
                color: '#FFFFFF',
              }}
              title="Real-time GPS Precision Rating"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  accuracyTier === 'high'
                    ? 'bg-[var(--mint)]'
                    : accuracyTier === 'moderate'
                    ? 'bg-[var(--legendary)]'
                    : 'bg-[var(--hanko)] animate-ping'
                }`}
              />
              <span>
                ±{Math.round(accuracyMeters)}m
                <span className="hidden sm:inline">
                  {accuracyTier === 'high'
                    ? ' • HIGH PRECISION'
                    : accuracyTier === 'moderate'
                    ? ' • MODERATE'
                    : ' • LOW LOCK'}
                </span>
              </span>
            </div>
          </div>

          {/* Right Controls: Torch & Close */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={toggleTorch}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/95 shadow-md border border-[#14143A]/15 text-[var(--ink-700)] cursor-pointer active:scale-95"
              title="Toggle Flashlight Torch"
              aria-label="Toggle Torch"
            >
              <Sun
                size={16}
                weight={torchActive ? 'fill' : 'regular'}
                color={torchActive ? 'var(--hanko)' : 'currentColor'}
              />
            </button>

            <button
              type="button"
              onClick={handleExitAR}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-900)] bg-white/95 shadow-md border border-[#14143A]/15 cursor-pointer active:scale-95"
              aria-label="Exit AR Mode"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Dynamic Pokémon GO-Style Directional Guide Banner */}
        {targetNote && (
          <div
            className="self-center mt-0.5 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-3 shadow-xl backdrop-blur-md pointer-events-auto transition-all w-full max-w-sm"
            style={{
              background: isMysteryLocked ? 'rgba(20, 24, 46, 0.94)' : 'rgba(255, 255, 255, 0.95)',
              color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
              border: `2px solid ${
                isBeyond5Min
                  ? '#FF6B6B'
                  : isMine
                  ? 'var(--legendary)'
                  : isHere
                  ? 'var(--mint)'
                  : isMysteryLocked
                  ? '#6E44FF'
                  : 'var(--hanko)'
              }`,
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* Rotating Compass Needle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform shadow-inner flex-shrink-0"
                style={{
                  background: isBeyond5Min
                    ? '#FF6B6B33'
                    : isHere
                    ? '#5EE2B533'
                    : isMysteryLocked
                    ? '#6E44FF33'
                    : '#E8264C22',
                  transform: `rotate(${bearingDiff}deg)`,
                }}
              >
                <NavigationArrow
                  size={16}
                  weight="fill"
                  color={
                    isBeyond5Min
                      ? '#FF6B6B'
                      : isHere
                      ? '#5EE2B5'
                      : isMysteryLocked
                      ? '#00F2FE'
                      : 'var(--hanko)'
                  }
                />
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs truncate max-w-[170px]">
                    {distanceToTarget !== null ? formatDistance(distanceToTarget) : '...'} •{' '}
                    {isMysteryLocked ? 'Shadow Note' : targetNote.title}
                  </span>
                  {isBeyond5Min ? (
                    <span className="bg-[#FF6B6B]/20 text-[#FF6B6B] font-mono text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      &gt;5 MIN
                    </span>
                  ) : (
                    <span className="bg-[var(--mint)]/20 text-[var(--mint)] font-mono text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      ~{targetWalkingMinutes} MIN
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] font-mono font-bold flex items-center gap-1 mt-0.5 ${
                    isMysteryLocked ? 'text-white/70' : 'text-[var(--ink-500)]'
                  }`}
                >
                  <Compass size={11} weight="bold" />
                  <span>
                    Bearing {Math.round(targetBearing).toString().padStart(3, '0')}° {targetCardinal}
                  </span>
                  <span>• {isBeyond5Min ? 'TOO FAR FOR AR' : isHere ? 'IN RANGE!' : 'NAVIGATING'}</span>
                </span>
              </div>
            </div>

            {/* Target Switcher if multiple notes in range */}
            {activePool.length > 1 && (
              <button
                type="button"
                onClick={handleNextTarget}
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border cursor-pointer active:scale-95 transition-transform"
                style={{
                  background: isMysteryLocked ? '#2B3159' : '#FAF7F0',
                  color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
                  borderColor: isMysteryLocked ? '#6E44FF' : '#EADECA',
                }}
                title="Switch Target"
              >
                <span>
                  {targetIndex + 1}/{activePool.length}
                </span>
                <ArrowRight size={10} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 6. CENTER RETICLE & PROXIMITY TOUCH INSTRUCTION ─────────── */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isReticleLockedOnRef.current) {
                handleTouchNote();
              } else {
                handleMissedTap();
              }
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all pointer-events-auto cursor-pointer active:scale-95 ${
              isReticleLockedOn
                ? 'border-2 border-solid scale-105'
                : 'border-2 border-dashed animate-spin-slow'
            }`}
            style={{
              borderColor: isReticleLockedOn
                ? 'var(--mint)'
                : isBeyond5Min
                ? '#FF6B6B'
                : isHere
                ? 'var(--mint)'
                : isMysteryLocked
                ? '#00F2FE'
                : 'rgba(255, 255, 255, 0.75)',
              boxShadow: isReticleLockedOn
                ? '0 0 35px var(--mint), inset 0 0 15px rgba(94, 226, 181, 0.4)'
                : isHere
                ? '0 0 25px var(--mint)'
                : isMysteryLocked
                ? '0 0 20px #6E44FF'
                : '0 4px 16px rgba(15, 18, 48, 0.15)',
              background: isReticleLockedOn ? 'rgba(94, 226, 181, 0.12)' : 'transparent',
            }}
            aria-label={isReticleLockedOn ? 'Touch Target Note' : 'Center Reticle'}
          >
            <Crosshair
              size={26}
              weight={isReticleLockedOn ? 'bold' : 'regular'}
              color={
                isReticleLockedOn
                  ? 'var(--mint)'
                  : isBeyond5Min
                  ? '#FF6B6B'
                  : isHere
                  ? 'var(--mint)'
                  : isMysteryLocked
                  ? '#00F2FE'
                  : '#D23F5A'
              }
            />
          </button>

          <span
            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md transition-all"
            style={{
              background: isReticleLockedOn
                ? 'var(--mint)'
                : isBeyond5Min
                ? 'rgba(255, 107, 107, 0.90)'
                : 'rgba(255, 255, 255, 0.92)',
              color: isReticleLockedOn
                ? '#14143A'
                : isBeyond5Min
                ? '#FFFFFF'
                : 'var(--ink-900)',
            }}
          >
            {!targetNote
              ? 'NO NOTES NEARBY • DROP A NOTE BELOW'
              : distanceToTarget !== null && distanceToTarget > 100
              ? `${formatDistance(distanceToTarget).toUpperCase()} AWAY • WALK WITHIN 100M VIA 2D MAP`
              : isReticleLockedOn && canTouchOrRead
              ? isMine
                ? 'TARGET LOCKED • TAP TO INSPECT'
                : 'TARGET LOCKED • TAP TO TOUCH'
              : isBeyond5Min
              ? '> 5 MIN WALK • WALK CLOSER VIA 2D MAP'
              : canTouchOrRead
              ? isMine
                ? 'YOUR NOTE • TAP TO INSPECT'
                : 'TAP SHADOW TO DISPEL & TOUCH'
              : `~${targetWalkingMinutes} MIN WALK • WALK WITHIN 40M TO TOUCH`}
          </span>
        </div>
      </div>

      {/* ── 7. FEEDBACK TOAST NOTIFICATION ─────────────────────────── */}
      {toastMessage && (
        <div className="absolute top-28 left-4 right-4 z-40 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-[#0F1230]/95 text-white border-2 border-[var(--hanko)] px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl text-center max-w-xs">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ── 8. TACTICAL FROSTED GLASS BOTTOM HUD DECK ──────────────── */}
      <footer className="relative z-30 p-3 pb-5 flex flex-col gap-2.5 pointer-events-auto max-w-sm mx-auto w-full">
        {/* Live GPS Telemetry Readout Pill */}
        <button
          type="button"
          onClick={() => requestLocationPermission()}
          className="self-center px-3 py-1 rounded-full text-[9px] font-mono font-bold flex items-center gap-2 shadow-xs backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
          title="Live GPS Telemetry (Tap to refresh GPS fix)"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #14143A25',
            color: 'var(--ink-700)',
          }}
        >
          <MapPin size={11} weight="fill" color="var(--hanko)" />
          <span>
            {position
              ? `${Math.abs(position.lat).toFixed(4)}°${position.lat >= 0 ? 'N' : 'S'}, ${Math.abs(position.lng).toFixed(4)}°${position.lng >= 0 ? 'E' : 'W'}`
              : 'GPS Acquiring...'}
          </span>
          <span>• LIVE GPS</span>
          <span
            className={
              accuracyTier === 'high'
                ? 'text-[var(--mint)]'
                : accuracyTier === 'moderate'
                ? 'text-[var(--legendary)]'
                : 'text-[var(--hanko)]'
            }
          >
            • ACC ±{Math.round(accuracyMeters)}m
          </span>
        </button>

        {/* Audio Radar Preview if target note has audio and is in range */}
        {targetNote?.audio_url && !isMysteryLocked && isHere && (
          <div className="self-center w-full animate-fade-in">
            <VoiceNotePlayer
              audioUrl={targetNote.audio_url}
              durationSeconds={targetNote.audio_duration}
            />
          </div>
        )}

        {/* Tactical Bottom Action Deck: Contextual Touch + 2D Map + Leave Note */}
        <div className="flex flex-col gap-2 w-full">
          {/* Contextual Primary Action: Touch / Dispel / Walk Alert */}
          {!targetNote ? (
            <div className="w-full h-11 rounded-xl bg-white/95 text-[var(--ink-900)] border border-[#14143A]/15 shadow-md flex items-center justify-center gap-1.5 text-xs font-bold px-3">
              <Compass size={15} weight="bold" color="var(--hanko)" />
              <span className="truncate">
                No notes in area — tap 'Leave a note' to drop one!
              </span>
            </div>
          ) : canTouchOrRead ? (
            <button
              type="button"
              onClick={() => {
                if (!isReticleLockedOnRef.current) {
                  handleMissedTap();
                  return;
                }
                handleTouchNote();
              }}
              className={`w-full h-12 slant-btn flex items-center justify-center gap-2 shadow-xl cursor-pointer text-xs font-bold transition-all ${
                isReticleLockedOn
                  ? 'slant-btn--primary animate-pulse'
                  : 'bg-white/95 text-[var(--ink-900)] border-2 border-[var(--mint)]'
              }`}
            >
              {isReticleLockedOn ? (
                <>
                  <Sparkle size={16} weight="fill" />
                  <span>
                    {isMine
                      ? 'Target Locked • Inspect Note'
                      : isMysteryLocked
                      ? 'Target Locked • Dispel Shadow'
                      : `Target Locked • Open ${targetNote.rarity.toUpperCase()} Note`}
                  </span>
                </>
              ) : (
                <>
                  <Crosshair size={16} weight="bold" color="var(--mint)" />
                  <span>Aim Crosshair at Note to Touch</span>
                </>
              )}
            </button>
          ) : !isBeyond5Min ? (
            <div className="w-full h-10 rounded-xl bg-white/95 text-[var(--ink-900)] border border-[var(--warn)] shadow-md flex items-center justify-center gap-1.5 text-xs font-bold px-3">
              <Footprints size={15} weight="bold" color="var(--warn)" />
              <span className="truncate">
                Walk within 40m to touch (~{targetWalkingMinutes} min)
              </span>
            </div>
          ) : null}

          {/* Dual Bottom Controls: Always accessible 2D Map & Leave Note */}
          <div className="grid grid-cols-2 gap-2 items-center w-full">
            <button
              type="button"
              onClick={handleExitAR}
              className="h-11 rounded-xl flex items-center justify-center gap-1.5 bg-white text-[var(--ink-900)] font-headline font-bold text-xs shadow-md border border-[#14143A]/15 cursor-pointer active:scale-95 transition-transform"
            >
              <MapTrifold size={16} weight="bold" />
              <span>2D Map</span>
            </button>

            <button
              type="button"
              onClick={handleAttemptDrop}
              className="h-11 rounded-xl flex items-center justify-center gap-1.5 bg-[var(--hanko)] text-white font-headline font-bold text-xs shadow-md border border-white/20 cursor-pointer active:scale-95 transition-transform hover:opacity-95"
              title="Leave a new note at your current location"
            >
              <PaperPlaneTilt size={16} weight="fill" />
              <span>Leave a note</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ── 9. ACCURACY WARNING MODAL (STITCH PROTOCOL) ─────────────── */}
      {showAccuracyDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F0] border-2 border-[var(--line)] rounded-2xl p-5 max-w-xs w-full shadow-2xl flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2 text-[var(--hanko)]">
              <ShieldWarning size={22} weight="fill" />
              <span className="font-display font-extrabold text-sm text-[var(--ink-900)]">
                HIGH AR ACCURACY REQUIRED
              </span>
            </div>

            <p className="font-body text-xs text-[var(--ink-700)] leading-relaxed">
              Current GPS accuracy is{' '}
              <strong className="text-[var(--hanko)]">
                ±{Math.round(accuracyMeters)}m
              </strong>
              . AR note placement requires maximum precision (ideally &lt;15m under
              open sky) to anchor reliably in physical 3D space.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAccuracyDialog(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold text-[var(--ink-700)] bg-white border border-[#14143A]/20 cursor-pointer active:scale-95"
              >
                Wait for Lock
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccuracyDialog(false);
                  onDropNote();
                }}
                className="slant-btn slant-btn--primary px-3 py-2 text-xs font-bold cursor-pointer"
              >
                Drop Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
