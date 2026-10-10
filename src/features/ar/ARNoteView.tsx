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
  Plus,
  Crosshair,
  Sun,
  MapPin,
  Compass,
  ArrowRight,
  ShieldWarning,
  Footprints,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { haversineDistance, bearing, formatDistance, toCardinal } from '@/lib/geo';
import type { ExtendedNote } from '@/lib/seedNotes';
import { APP_NAME } from '@/contracts/types';
import { AppLogo } from '@/ui/components/AppLogo';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';

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
  const isHere = distanceToTarget !== null && (distanceToTarget <= 60 || isSimulated);

  // Strict interaction rule: CAN ONLY READ OR TOUCH IF WITHIN 5 MIN & WITHIN UNLOCK REACH
  const canTouchOrRead = Boolean(targetNote && !isBeyond5Min && isHere);

  // Projected 2D screen coordinate for AR callout card
  const [tagScreenPos, setTagScreenPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

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

  // ── 3. DEVICE ORIENTATION & COMPASS ─────────────────────────────
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const anyEvent = e as unknown as { webkitCompassHeading?: number };
      if (typeof anyEvent.webkitCompassHeading === 'number') {
        setDeviceHeading(anyEvent.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // ── 4. CAMERA STREAM INITIALIZATION ─────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API unsupported');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      mediaStreamRef.current = null;
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
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    // ── Note Mesh Setup ──
    let noteMesh: THREE.Mesh;
    let sealMesh: THREE.Mesh | null = null;
    let qMarkMesh: THREE.Mesh | null = null;
    const qMarkTexture = isMysteryLocked ? createQuestionMarkTexture() : null;

    if (isMysteryLocked) {
      // 1. Obsidian Mystery Locked Silhouette with Glowing ?
      const noteGeom = new THREE.OctahedronGeometry(1.2, 0);
      const noteMat = new THREE.MeshStandardMaterial({
        color: 0x14182e,
        emissive: 0x27194a,
        emissiveIntensity: 0.65,
        roughness: 0.7,
        metalness: 0.2,
        transparent: true,
        opacity: 0.92,
        flatShading: true,
      });
      noteMesh = new THREE.Mesh(noteGeom, noteMat);
      noteMesh.scale.set(1.0, 1.35, 0.35);
      noteGroup.add(noteMesh);

      if (qMarkTexture) {
        const qGeom = new THREE.PlaneGeometry(1.2, 1.2);
        const qMat = new THREE.MeshBasicMaterial({
          map: qMarkTexture,
          transparent: true,
          side: THREE.DoubleSide,
        });
        qMarkMesh = new THREE.Mesh(qGeom, qMat);
        qMarkMesh.position.z = 0.25;
        noteGroup.add(qMarkMesh);
      }
    } else {
      // 2. Warm Folded Origami Bird with Hanko Seal
      const noteGeom = new THREE.OctahedronGeometry(1.15, 0);
      const noteMat = new THREE.MeshStandardMaterial({
        color: isMine ? 0xfff3d6 : 0xffffff,
        emissive: isMine ? 0xffc93c : 0x5ee2b5,
        emissiveIntensity: isHere ? 0.6 : 0.35,
        metalness: 0.1,
        roughness: 0.25,
        flatShading: true,
      });
      noteMesh = new THREE.Mesh(noteGeom, noteMat);
      noteMesh.scale.set(1.0, 1.35, 0.32);
      noteGroup.add(noteMesh);

      const sealGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.45, 16);
      const sealMat = new THREE.MeshStandardMaterial({
        color: 0xe8264c,
        emissive: 0xe8264c,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      sealMesh = new THREE.Mesh(sealGeom, sealMat);
      sealMesh.rotation.x = Math.PI / 2;
      noteGroup.add(sealMesh);
    }

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

    // Vertical Beacon Pillar
    const beamColor = isMysteryLocked ? 0x9370db : isMine ? 0xffe4b5 : 0xffd6a5;
    const beamGeom = new THREE.CylinderGeometry(0.12, 1.4, 5.5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: beamColor,
      transparent: true,
      opacity: isHere ? 0.35 : 0.22,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeom, beamMat);
    beamMesh.position.y = -0.5;
    noteGroup.add(beamMesh);

    scene.add(noteGroup);

    // ── Animation Loop ──
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow 360 spin + smooth floating hover
      noteMesh.rotation.y = time * 0.8;
      noteMesh.rotation.x = Math.sin(time * 1.2) * 0.15;
      noteMesh.position.y = Math.sin(time * 2.0) * 0.25;

      if (sealMesh) {
        sealMesh.position.y = noteMesh.position.y;
        sealMesh.rotation.y = noteMesh.rotation.y;
      }
      if (qMarkMesh) {
        qMarkMesh.position.y = noteMesh.position.y;
        qMarkMesh.rotation.y = time * 0.8;
      }

      // Proximity pulse
      const pulseSpeed = isHere ? 4.5 : 2.0;
      const pulseScale = 1.0 + Math.sin(time * pulseSpeed) * (isHere ? 0.08 : 0.03);
      noteGroup.scale.set(pulseScale, pulseScale, pulseScale);

      // Expand ground shockwave rings
      const ringScale = 1.0 + (time % 2.0) * 0.6;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0, 0.8 - (time % 2.0) * 0.4);

      // Position noteGroup horizontally based on bearing difference
      const clampedBearingDiff = THREE.MathUtils.clamp(bearingDiff, -90, 90);
      const targetX = (clampedBearingDiff / 90) * 3.6;
      noteGroup.position.x = THREE.MathUtils.lerp(noteGroup.position.x, targetX, 0.1);

      // Project 3D vector to 2D screen coordinate for callout HUD card
      const tempV = new THREE.Vector3();
      tempV.setFromMatrixPosition(noteMesh.matrixWorld);
      tempV.y += 1.4;
      tempV.project(camera);

      const isBehind = tempV.z > 1;
      const screenX = ((tempV.x + 1) * width) / 2;
      const screenY = ((-tempV.y + 1) * height) / 2;

      setTagScreenPos({
        x: screenX,
        y: screenY,
        visible: !isBehind && Math.abs(bearingDiff) < 65,
      });

      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bearingDiff, isMysteryLocked, isMine, isHere]);

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
        `~${targetWalkingMinutes} min walk away (${distanceToTarget !== null ? formatDistance(distanceToTarget) : ''}). Walk within 60m to touch and dispel shadow!`
      );
      return;
    }

    // Within 5 min and within 60m: Allowed!
    onOpenNote(targetNote);
  };

  // Handle dropping note with maximum accuracy validation
  const handleAttemptDrop = () => {
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
        onClick={handleTouchNote}
        className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
      />

      {/* ── 4. FLOATING 2D AR CALLOUT CARD (ANCHORED TO 3D NOTE) ────── */}
      {targetNote && tagScreenPos.visible && (
        <div
          className="absolute z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all duration-75 cursor-pointer active:scale-95"
          style={{
            left: `${tagScreenPos.x}px`,
            top: `${tagScreenPos.y}px`,
          }}
          onClick={handleTouchNote}
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
                : `~${targetWalkingMinutes} MIN WALK • WALK WITHIN 60M`}
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
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#14143A]/15 shadow-sm">
              <AppLogo size={20} showWordmark={false} />
              <span className="font-display font-black text-xs text-[var(--ink-900)] tracking-tight">
                {APP_NAME}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--hanko)] animate-pulse" />
            </div>

            {/* GPS Accuracy Tier Pill */}
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md"
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
                {accuracyTier === 'high'
                  ? `±${Math.round(accuracyMeters)}m • HIGH PRECISION`
                  : accuracyTier === 'moderate'
                  ? `±${Math.round(accuracyMeters)}m • MODERATE`
                  : `±${Math.round(accuracyMeters)}m • LOW GPS LOCK`}
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
              onClick={onClose}
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
          <div
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-spin-slow"
            style={{
              borderColor: isBeyond5Min
                ? '#FF6B6B'
                : isHere
                ? 'var(--mint)'
                : isMysteryLocked
                ? '#00F2FE'
                : 'rgba(255, 255, 255, 0.75)',
              boxShadow: isHere
                ? '0 0 25px var(--mint)'
                : isMysteryLocked
                ? '0 0 20px #6E44FF'
                : '0 4px 16px rgba(15, 18, 48, 0.15)',
            }}
          >
            <Crosshair
              size={26}
              color={
                isBeyond5Min
                  ? '#FF6B6B'
                  : isHere
                  ? 'var(--mint)'
                  : isMysteryLocked
                  ? '#00F2FE'
                  : '#E8264C'
              }
            />
          </div>

          <span
            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md"
            style={{
              background: isBeyond5Min
                ? 'rgba(255, 107, 107, 0.90)'
                : 'rgba(255, 255, 255, 0.92)',
              color: isBeyond5Min ? '#FFFFFF' : 'var(--ink-900)',
            }}
          >
            {isBeyond5Min
              ? '> 5 MIN WALK • WALK CLOSER VIA 2D MAP'
              : canTouchOrRead
              ? isMine
                ? 'YOUR NOTE • TAP TO INSPECT'
                : 'TAP SHADOW TO DISPEL & TOUCH'
              : `~${targetWalkingMinutes} MIN WALK • WALK WITHIN 60M TO TOUCH`}
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
        <div
          className="self-center px-3 py-1 rounded-full text-[9px] font-mono font-bold flex items-center gap-2 shadow-xs backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid #14143A25',
            color: 'var(--ink-700)',
          }}
        >
          <MapPin size={11} weight="fill" color="var(--hanko)" />
          <span>
            {position
              ? `${position.lat.toFixed(4)}°N, ${position.lng.toFixed(4)}°W`
              : 'GPS Acquiring...'}
          </span>
          <span>• ALT 18m</span>
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
        </div>

        {/* Audio Radar Preview if target note has audio and is in range */}
        {targetNote?.audio_url && !isMysteryLocked && isHere && (
          <div className="self-center w-full animate-fade-in">
            <VoiceNotePlayer
              audioUrl={targetNote.audio_url}
              durationSeconds={targetNote.audio_duration}
            />
          </div>
        )}

        {/* Primary Action Buttons (2-Column Grid to prevent clipping) */}
        <div className="grid grid-cols-12 gap-2 items-center w-full">
          {/* Quick Return to 2D Map */}
          <button
            type="button"
            onClick={onClose}
            className="col-span-4 h-12 rounded-xl flex items-center justify-center gap-1.5 bg-white text-[var(--ink-900)] font-headline font-bold text-xs shadow-md border border-[#14143A]/15 cursor-pointer active:scale-95 transition-transform"
          >
            <MapTrifold size={16} weight="bold" />
            <span>2D Map</span>
          </button>

          {/* Contextual Primary Action */}
          {targetNote && canTouchOrRead ? (
            <button
              type="button"
              onClick={handleTouchNote}
              className="col-span-8 h-12 slant-btn slant-btn--primary flex items-center justify-center gap-2 shadow-xl animate-pulse cursor-pointer text-xs font-bold"
            >
              <Sparkle size={16} weight="fill" />
              <span>
                {isMine
                  ? 'Inspect Your Note'
                  : isMysteryLocked
                  ? 'Dispel Shadow & Touch'
                  : `Open ${targetNote.rarity.toUpperCase()} Note`}
              </span>
            </button>
          ) : targetNote && !isBeyond5Min ? (
            <button
              type="button"
              onClick={handleTouchNote}
              className="col-span-8 h-12 rounded-xl bg-white/95 text-[var(--ink-900)] border border-[var(--warn)] shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold"
            >
              <Footprints size={16} weight="bold" color="var(--warn)" />
              <span className="truncate">
                Walk &lt;60m to Touch (~{targetWalkingMinutes} min)
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAttemptDrop}
              className="col-span-8 h-12 slant-btn slant-btn--primary flex items-center justify-center gap-1.5 shadow-xl cursor-pointer text-xs font-bold"
            >
              <Plus size={16} weight="bold" />
              <span>Drop Note Here</span>
            </button>
          )}
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
