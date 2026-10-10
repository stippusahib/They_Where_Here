/* ============================================================
 * THEY WERE HERE — Procedural Web Audio Synthesizer
 * Zero-asset audio engine for reliable offline & low-latency sound effects.
 * ============================================================ */

import { useAppStore } from '@/state/store';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Prime and unlock the audio context on user interaction.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  useAppStore.getState().setAudioUnlocked(true);
}

function isSoundAllowed(): boolean {
  return useAppStore.getState().soundEnabled;
}

/**
 * Subtle tactile micro-click for button taps.
 */
export function playButtonClick(): void {
  if (!isSoundAllowed()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.04);
}

/**
 * Radar sonar ping when entering proximity to a sealed orb.
 */
export function playRadarPing(): void {
  if (!isSoundAllowed()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.18);
}

/**
 * Heavy, satisfying physical Hanko stamp thump when sealing or stamping a note.
 */
export function playSealStamp(): void {
  if (!isSoundAllowed()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.14);
}

/**
 * Dreamy rising melodic arpeggio for unlocking and revealing a traveller note.
 */
export function playUnlockChime(rarity: 'common' | 'rare' | 'legendary' = 'common'): void {
  if (!isSoundAllowed()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Pentatonic notes based on rarity
  const baseFreqs =
    rarity === 'legendary'
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
      : rarity === 'rare'
      ? [440.0, 554.37, 659.25, 880.0]           // A4, C#5, E5, A5
      : [523.25, 659.25, 783.99, 1046.5];         // C5, E5, G5, C6

  baseFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

    const startTime = ctx.currentTime + idx * 0.08;
    const duration = 0.45;

    gain.gain.setValueAtTime(0.09, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}
