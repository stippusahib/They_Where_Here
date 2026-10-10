/* ============================================================
 * THEY WERE HERE — Interactive AR Note-Dropping & Navigation
 * Pokémon GO & GTA-inspired Augmented Reality Explorer
 * Designed with Google Stitch & Dusk Postcard Design System
 * Features:
 * - Fullscreen live camera feed + simulated AR sky fallback
 * - 3D Visual Distinction:
 *   * MYSTERY LOCKED NOTE: Obsidian Shadow Silhouette with a glowing
 *     floating White Question Mark (?) and mystic aura.
 *   * PLACED-BY-YOU NOTE: Warm cream origami paper bird with red
 *     Hanko stamp seal and golden beacon.
 *   * UNLOCKED NOTE: Revealed collectible origami with rarity flair.
 * - Pokémon GO-style directional compass guide with bearing dial
 * - Proximity hot/cold indicator & shadow dispelling unlock trigger
 * - Tactical frosted glass bottom HUD with live GPS telemetry
 * - Direct In-AR GPS note dropping
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
  Camera,
  Sun,
  SpeakerHigh,
  MapPin,
  Compass,
  ArrowRight,
  LockKey,
  SealCheck,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { haversineDistance, bearing, formatDistance, toCardinal } from '@/lib/geo';
import type { ExtendedNote } from '@/lib/seedNotes';
import { RarityTag } from '@/ui/components/RarityTag';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';

interface ARNoteViewProps {
  onClose: () => void;
  onOpenNote: (note: ExtendedNote) => void;
  onDropNote: () => void;
}

// Generate high-resolution glowing White Question Mark texture
function createQuestionMarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    // Ethereal circular glow
    const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 120);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(0.4, 'rgba(110, 68, 255, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Bold, sharp white question mark
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

  // Filter notes sorted by distance
  const sortedNotes = useMemo(() => {
    if (!position || notes.length === 0) return [];
    return [...notes]
      .map((n) => ({
        note: n,
        dist: haversineDistance(position.lat, position.lng, n.lat, n.lng),
        bear: bearing(position.lat, position.lng, n.lat, n.lng),
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [position, notes]);

  const currentTarget = sortedNotes[targetIndex] ?? sortedNotes[0] ?? null;
  const targetNote = currentTarget ? currentTarget.note : null;
  const distanceToTarget = currentTarget ? currentTarget.dist : null;
  const targetBearing = currentTarget ? currentTarget.bear : 0;

  // Bearing difference relative to device heading (-180 to +180)
  const bearingDiff = useMemo(() => {
    return ((targetBearing - deviceHeading + 540) % 360) - 180;
  }, [targetBearing, deviceHeading]);

  // Determine note relationship
  const isMine = Boolean(
    targetNote && (targetNote.is_mine || targetNote.author_handle === profile?.handle)
  );
  const isUnlocked = Boolean(
    targetNote && passportNotes.some((pn) => pn.id === targetNote.id)
  );
  const isMysteryLocked = !isMine && !isUnlocked;
  const isHere = distanceToTarget !== null && (distanceToTarget <= 60 || isSimulated);

  // Projected 2D screen coordinate of the 3D note for AR Tag
  const [tagScreenPos, setTagScreenPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Cycle to next nearby note in AR
  const handleNextTarget = () => {
    if (sortedNotes.length > 1) {
      setTargetIndex((prev) => (prev + 1) % sortedNotes.length);
    }
  };

  // 1. Device Compass Orientation
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

  // 2. Camera Stream Initialization
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
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
        console.warn('[ARNoteView] Camera denied/unsupported, using simulated AR sky:', err);
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

  // Toggle Torch/Flashlight if supported
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
      console.warn('Torch toggle not supported:', e);
    }
  };

  // 3. Three.js 3D Scene (Shadow Silhouette vs Origami vs Unlocked)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 3A. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 3B. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff0c4, 2.5);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    const glowColor = isMysteryLocked ? 0x6e44ff : isMine ? 0xffc93c : 0xe8264c;
    const glowLight = new THREE.PointLight(glowColor, isHere ? 4.5 : 2.5, 18);
    glowLight.position.set(0, 0, 2);
    scene.add(glowLight);

    // 3C. Collectible Note Group
    const noteGroup = new THREE.Group();

    // ── GEOMETRY SETUP BASED ON NOTE STATE ──
    let noteMesh: THREE.Mesh;
    let sealMesh: THREE.Mesh | null = null;
    let qMarkMesh: THREE.Mesh | null = null;
    const qMarkTexture = isMysteryLocked ? createQuestionMarkTexture() : null;

    if (isMysteryLocked) {
      // 1. MYSTERY LOCKED: Obsidian Shadow Silhouette
      const noteGeom = new THREE.OctahedronGeometry(1.2, 0);
      const noteMat = new THREE.MeshStandardMaterial({
        color: 0x14182e,
        emissive: 0x27194a,
        emissiveIntensity: 0.6,
        roughness: 0.7,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
        flatShading: true,
      });
      noteMesh = new THREE.Mesh(noteGeom, noteMat);
      noteMesh.scale.set(1.0, 1.35, 0.35);
      noteGroup.add(noteMesh);

      // Core Glowing White Question Mark (?)
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
      // 2. PLACED BY YOU or UNLOCKED: Exquisite Folded Origami Note
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

      // Hanko Red Stamp Seal
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

    // Ground Shockwave Rings
    const ringColor = isMysteryLocked
      ? 0x6e44ff
      : isMine
      ? 0xffc93c
      : isHere
      ? 0x5ee2b5
      : 0xe8264c;

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

    // Vertical Beacon Light Beam
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

    // Rising Particle Sparkles
    const particleCount = 45;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
      particleSpeeds[i] = 0.01 + Math.random() * 0.02;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: isMysteryLocked ? 0x90e0ef : isMine ? 0xffc93c : 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    noteGroup.add(particles);

    scene.add(noteGroup);

    // 3D Raycasting for interactive click on floating note
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0]?.clientX ?? 0 : event.clientX;
      const clientY = 'touches' in event ? event.touches[0]?.clientY ?? 0 : event.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = [noteMesh];
      if (sealMesh) targets.push(sealMesh);
      if (qMarkMesh) targets.push(qMarkMesh);

      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0 && targetNote) {
        onOpenNote(targetNote);
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop: Hover Bobbing + Continuous 360° Spin
    let animId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Continuous 360° Spin
      noteGroup.rotation.y = elapsed * 1.5;

      // Slow Sinusoidal Bobbing Hover
      noteGroup.position.y = Math.sin(elapsed * 2.2) * 0.35;

      // Pulse ground ring
      const pulseSpeed = isHere ? 6.0 : 3.5;
      const pulseScale = 1.0 + Math.sin(elapsed * pulseSpeed) * 0.2;
      ringMesh.scale.set(pulseScale, pulseScale, 1.0);
      ringMat.opacity = 0.35 + Math.sin(elapsed * pulseSpeed) * 0.3;

      // Question mark pulse
      if (qMarkMesh) {
        const qScale = 1.0 + Math.sin(elapsed * 3.5) * 0.12;
        qMarkMesh.scale.set(qScale, qScale, 1.0);
      }

      // Rising sparkles animation
      const posAttr = particleGeom.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i] ?? 0.015;
        const currentY = arr[i * 3 + 1] ?? 0;
        arr[i * 3 + 1] = currentY > 2.5 ? -2.2 : currentY + speed;
      }
      posAttr.needsUpdate = true;

      // Dynamic position offset according to bearing difference
      const targetX = Math.sin((bearingDiff * Math.PI) / 180) * 2.2;
      noteGroup.position.x += (targetX - noteGroup.position.x) * 0.06;

      // Project 3D note position to 2D screen coordinates for floating AR tag
      tempVec.set(noteGroup.position.x, noteGroup.position.y + 1.6, 0);
      tempVec.project(camera);

      const screenX = ((tempVec.x + 1) * width) / 2;
      const screenY = ((-tempVec.y + 1) * height) / 2;

      setTagScreenPos({
        x: screenX,
        y: screenY,
        visible: tempVec.z < 1,
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
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      noteMesh.geometry.dispose();
      (noteMesh.material as THREE.Material).dispose();
      if (sealMesh) {
        sealMesh.geometry.dispose();
        (sealMesh.material as THREE.Material).dispose();
      }
      if (qMarkMesh) {
        qMarkMesh.geometry.dispose();
        (qMarkMesh.material as THREE.Material).dispose();
      }
      if (qMarkTexture) {
        qMarkTexture.dispose();
      }
      ringGeom.dispose();
      ringMat.dispose();
      beamGeom.dispose();
      beamMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [targetNote, bearingDiff, isHere, isMine, isUnlocked, isMysteryLocked, onOpenNote]);

  const targetCardinal = toCardinal(targetBearing);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#FAF7F0] flex flex-col safe-top safe-bottom animate-fade-in select-none">
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
          {/* Simulated Horizon Perspective Grid */}
          <div
            className="absolute bottom-0 w-full h-3/5 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(20,20,58,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,20,58,0.14) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              perspective: '350px',
              transform: 'rotateX(62deg)',
            }}
          />
        </div>
      )}

      {/* ── 2. THREE.JS 3D WEBGL OVERLAY ───────────────────────────── */}
      <div ref={mountRef} className="absolute inset-0 z-10 pointer-events-auto" />

      {/* ── 3. FLOATING AR BILLBOARD TAG (ABOVE 3D NOTE) ────────────── */}
      {targetNote && tagScreenPos.visible && (
        <div
          onClick={() => onOpenNote(targetNote)}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto transition-transform active:scale-95"
          style={{
            left: `${tagScreenPos.x}px`,
            top: `${Math.max(80, tagScreenPos.y)}px`,
          }}
        >
          <div
            className="px-3.5 py-2.5 rounded-2xl flex flex-col gap-1 shadow-xl border backdrop-blur-md animate-fade-in"
            style={{
              background: isMysteryLocked ? 'rgba(20, 24, 46, 0.94)' : 'rgba(255, 255, 255, 0.94)',
              color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
              borderColor: isMine
                ? 'var(--legendary)'
                : isHere
                ? 'var(--mint)'
                : isMysteryLocked
                ? '#6E44FF'
                : 'var(--paper-edge)',
              boxShadow: isMysteryLocked
                ? '0 8px 32px rgba(110, 68, 255, 0.4)'
                : isHere
                ? '0 8px 30px rgba(94, 226, 181, 0.35)'
                : '0 8px 24px rgba(15, 18, 48, 0.12)',
            }}
          >
            {/* Header badges */}
            <div className="flex items-center gap-1.5">
              {isMine ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC93C33] text-[#FFC93C]">
                  <SealCheck size={12} weight="fill" /> PLACED BY YOU
                </span>
              ) : isMysteryLocked ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6E44FF44] text-[#E0D7FF]">
                  <LockKey size={12} weight="fill" /> SHADOW MEMO
                </span>
              ) : (
                <RarityTag rarity={targetNote.rarity} />
              )}

              <span className={`text-[10px] font-mono font-bold ${isMysteryLocked ? 'text-white/70' : 'text-[var(--ink-500)]'}`}>
                #{targetNote.id.slice(0, 4)}
              </span>

              <span className={`text-[10px] ${isMysteryLocked ? 'text-white/60' : 'text-[var(--ink-500)]'}`}>
                • {isMine ? '@you' : isMysteryLocked ? '??? (Locked)' : `@${targetNote.author_handle}`}
              </span>
            </div>

            {/* Note Title or Mystery Clue */}
            <span className="font-display text-xs max-w-[210px] truncate">
              {isMysteryLocked ? 'Shadow Clue: Encrypted Message' : targetNote.title}
            </span>

            {/* Audio Indicator */}
            {targetNote.audio_url && !isMysteryLocked && (
              <span
                className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit"
                style={{ background: '#5EE2B525', color: '#187B57' }}
              >
                <SpeakerHigh size={11} weight="fill" />
                <span>Voice Memo Attached</span>
              </span>
            )}

            {/* Proximity / Unlock instructions */}
            <span
              className="text-[10px] font-mono font-bold"
              style={{
                color: isMine
                  ? '#FFC93C'
                  : isHere
                  ? '#5EE2B5'
                  : isMysteryLocked
                  ? '#00F2FE'
                  : 'var(--hanko)',
              }}
            >
              {distanceToTarget !== null ? formatDistance(distanceToTarget) : '...'} away
              {isMine
                ? ' • TAP TO INSPECT'
                : isHere
                ? ' • DISPEL SHADOW'
                : ' • Walk Within Range (<60m)'}
            </span>
          </div>
        </div>
      )}

      {/* ── 4. TOP HUD: TRACKING STATUS & POKÉMON GO COMPASS ───────── */}
      <div className="relative z-30 flex flex-col gap-2 p-4 pointer-events-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Tracking Status Pill */}
            <div
              className="px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-md backdrop-blur-md"
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                color: 'var(--ink-900)',
                border: '1px solid #EADECA',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#5EE2B5] animate-ping" />
              <Camera size={15} weight="fill" color="var(--hanko)" />
              <span className="text-[11px] font-mono">AR 6DOF LOCKED</span>
            </div>

            {/* Flashlight/Torch toggle */}
            <button
              type="button"
              onClick={toggleTorch}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md border border-[#EADECA] text-[var(--ink-700)] cursor-pointer active:scale-95"
              title="Toggle Flashlight Torch"
              aria-label="Toggle Torch"
            >
              <Sun size={16} weight={torchActive ? 'fill' : 'regular'} color={torchActive ? 'var(--hanko)' : 'currentColor'} />
            </button>
          </div>

          {/* Close AR View */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-900)] bg-white shadow-lg border border-[#EADECA] pointer-events-auto cursor-pointer active:scale-95 transition-transform"
            aria-label="Exit AR Mode"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Pokémon GO-Style Directional Guide Banner with Target Switcher */}
        {targetNote && (
          <div
            className="self-center mt-1 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-xl backdrop-blur-md pointer-events-auto transition-all"
            style={{
              background: isMysteryLocked ? 'rgba(20, 24, 46, 0.94)' : 'rgba(255, 255, 255, 0.94)',
              color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
              border: `2px solid ${
                isMine ? 'var(--legendary)' : isHere ? 'var(--mint)' : isMysteryLocked ? '#6E44FF' : 'var(--hanko)'
              }`,
              maxWidth: '380px',
              width: '100%',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Smooth Rotating Navigation Arrow Needle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform shadow-inner flex-shrink-0"
                style={{
                  background: isHere ? '#5EE2B533' : isMysteryLocked ? '#6E44FF33' : '#E8264C22',
                  transform: `rotate(${bearingDiff}deg)`,
                }}
              >
                <NavigationArrow
                  size={18}
                  weight="fill"
                  color={isHere ? '#5EE2B5' : isMysteryLocked ? '#00F2FE' : 'var(--hanko)'}
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="font-display text-xs truncate max-w-[200px]">
                  {distanceToTarget !== null ? formatDistance(distanceToTarget) : '...'} •{' '}
                  {isMysteryLocked ? 'Shadow Note' : targetNote.title}
                </span>
                <span className={`text-[10px] font-mono font-bold flex items-center gap-1.5 ${isMysteryLocked ? 'text-white/70' : 'text-[var(--ink-500)]'}`}>
                  <Compass size={12} weight="bold" />
                  <span>Bearing {Math.round(targetBearing).toString().padStart(3, '0')}° {targetCardinal}</span>
                  <span>• {isHere ? 'IN RANGE!' : isMine ? 'PLACED BY YOU' : 'NAVIGATING'}</span>
                </span>
              </div>
            </div>

            {/* Cycle to next note if multiple exist */}
            {sortedNotes.length > 1 && (
              <button
                type="button"
                onClick={handleNextTarget}
                className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer active:scale-95 transition-transform"
                style={{
                  background: isMysteryLocked ? '#2B3159' : '#FAF7F0',
                  color: isMysteryLocked ? '#FFFFFF' : 'var(--ink-900)',
                  borderColor: isMysteryLocked ? '#6E44FF' : '#EADECA',
                }}
                title="Switch to next nearby note"
              >
                <span>{targetIndex + 1}/{sortedNotes.length}</span>
                <ArrowRight size={11} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 5. CENTER TARGET RETICLE ───────────────────────────────── */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all animate-spin-slow"
            style={{
              borderColor: isHere
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
              color={isHere ? 'var(--mint)' : isMysteryLocked ? '#00F2FE' : '#E8264C'}
            />
          </div>
          <span className="text-[11px] font-bold text-[var(--ink-900)] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-[#EADECA]">
            {isMine
              ? 'YOUR NOTE • TAP TO VIEW STATS'
              : isHere
              ? 'TAP SHADOW TO DISPEL & REVEAL'
              : 'Aim camera at floating object'}
          </span>
        </div>
      </div>

      {/* ── 6. TACTICAL BOTTOM HUD DECK (STITCH FROSTED GLASS DECK) ── */}
      <div className="relative z-30 p-4 pb-6 flex flex-col gap-3 pointer-events-auto">
        {/* Live GPS Telemetry readout pill */}
        <div
          className="self-center px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-2 shadow-sm backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.90)',
            border: '1px solid #EADECA',
            color: 'var(--ink-700)',
          }}
        >
          <MapPin size={11} weight="fill" color="var(--hanko)" />
          <span>
            GPS {position ? `${position.lat.toFixed(4)}°N, ${position.lng.toFixed(4)}°W` : 'Locating...'}
          </span>
          <span>• ALT 18m</span>
          <span>• ACC ±{position?.accuracy ? Math.round(position.accuracy) : 1}m</span>
        </div>

        {/* Audio Radar Preview if target note has audio and is unlocked */}
        {targetNote?.audio_url && !isMysteryLocked && isHere && (
          <div className="self-center w-full max-w-xs animate-fade-in">
            <VoiceNotePlayer
              audioUrl={targetNote.audio_url}
              durationSeconds={targetNote.audio_duration}
            />
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-2.5">
          {/* Quick toggle back to 2D Map */}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-3 rounded-xl flex items-center gap-2 bg-white text-[var(--ink-900)] font-bold text-xs shadow-md border border-[#EADECA] cursor-pointer active:scale-95 transition-transform"
          >
            <MapTrifold size={17} weight="bold" />
            <span>2D Map</span>
          </button>

          {/* Primary CTA: Contextual based on note state */}
          {targetNote && isHere ? (
            <button
              type="button"
              onClick={() => onOpenNote(targetNote)}
              className="slant-btn slant-btn--primary flex-1 py-3.5 flex items-center justify-center gap-2 shadow-xl animate-pulse cursor-pointer"
            >
              <Sparkle size={18} weight="fill" />
              <span>
                {isMine
                  ? 'Inspect Your Note'
                  : isMysteryLocked
                  ? 'Dispel Shadow & Unlock'
                  : `Open ${targetNote.rarity.toUpperCase()} Note`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDropNote}
              className="slant-btn slant-btn--primary flex-1 py-3.5 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Plus size={18} weight="bold" />
              <span>Drop Note at this Spot</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
