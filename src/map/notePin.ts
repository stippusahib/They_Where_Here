/* ============================================================
 * THEY WERE HERE — High-Fidelity Note Pins (MapLibre GL DOM Markers)
 * Radiant anime orbs with tiered rarity glows, hanko wax seals,
 * distance pills, and native 48px touch targets for 100% reliable
 * rendering across all zoom levels and map style reloads.
 * ============================================================ */

import { Marker } from 'maplibre-gl';
import type { ExtendedNote } from '@/lib/seedNotes';

const TIER_CONFIG = {
  common: {
    bg: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FFF3D6 40%, #E6D3A3 100%)',
    border: '#14143A',
    innerBorder: 'rgba(255, 255, 255, 0.95)',
    glow: 'rgba(255, 220, 160, 0.65)',
    sealColor: '#E8264C',
    symbol: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 6L12 13L21 6" stroke="#14143A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="3" y="6" width="18" height="13" rx="1.5" stroke="#14143A" stroke-width="2.2"/>
        <circle cx="12" cy="13" r="3" fill="#E8264C"/>
      </svg>
    `,
  },
  rare: {
    bg: 'radial-gradient(circle at 35% 35%, #D4F1FF 0%, #35B6FF 50%, #007ACC 100%)',
    border: '#14143A',
    innerBorder: 'rgba(255, 255, 255, 0.95)',
    glow: 'rgba(53, 182, 255, 0.75)',
    sealColor: '#FFFFFF',
    symbol: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L20 12L12 21L4 12Z" fill="#FFFFFF" stroke="#14143A" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2.5" fill="#35B6FF"/>
      </svg>
    `,
  },
  legendary: {
    bg: 'radial-gradient(circle at 35% 35%, #FFFBE6 0%, #FFC93C 45%, #D48800 100%)',
    border: '#14143A',
    innerBorder: 'rgba(255, 255, 255, 0.95)',
    glow: 'rgba(255, 201, 60, 0.85)',
    sealColor: '#E8264C',
    symbol: `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15 9L22 9L16.5 14L18.5 21L12 16.5L5.5 21L7.5 14L2 9L9 9Z" fill="#FFF8E1" stroke="#14143A" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="2.5" fill="#E8264C"/>
      </svg>
    `,
  },
} as const;

export function createNotePin(
  note: ExtendedNote,
  distLabel: string,
  onClick: (note: ExtendedNote) => void
): {
  marker: Marker;
  update: (note: ExtendedNote, distLabel: string) => void;
  destroy: () => void;
} {
  const wrap = document.createElement('div');
  wrap.className = 'note-pin-marker-wrap';
  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    pointer-events: auto;
    width: 60px;
    height: 68px;
    will-change: transform;
    z-index: 10;
  `;

  // Breathing Aura Halo behind the pin
  const halo = document.createElement('div');
  halo.className = 'note-pin-halo';
  halo.style.cssText = `
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    filter: blur(6px);
    opacity: 0.65;
    pointer-events: none;
    animation: pinHaloPulse 2.8s ease-in-out infinite;
  `;
  wrap.appendChild(halo);

  // Outer Animated Energy Ring
  const ring = document.createElement('div');
  ring.className = 'note-pin-ring';
  ring.style.cssText = `
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px dashed rgba(20, 20, 58, 0.25);
    pointer-events: none;
    animation: pinRingSpin 16s linear infinite;
  `;
  wrap.appendChild(ring);

  // Core Jewel Disc
  const orb = document.createElement('div');
  orb.className = 'note-pin-orb';
  orb.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.8px solid #14143A;
    box-shadow: 0 4px 12px rgba(15, 18, 48, 0.24);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  wrap.appendChild(orb);

  // White Die-cut Inset Border
  const innerBorder = document.createElement('div');
  innerBorder.style.cssText = `
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.95);
    pointer-events: none;
  `;
  orb.appendChild(innerBorder);

  // Icon container
  const iconWrap = document.createElement('div');
  iconWrap.style.cssText = `
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  orb.appendChild(iconWrap);

  // Distance / Title Pill Badge Below
  const pill = document.createElement('div');
  pill.className = 'note-pin-pill';
  pill.style.cssText = `
    margin-top: 3px;
    padding: 1.5px 6px;
    border-radius: 999px;
    background: #14143A;
    color: #FFFFFF;
    font-family: var(--font-display, sans-serif);
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.02em;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(15, 18, 48, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.35);
    z-index: 3;
    pointer-events: none;
  `;
  wrap.appendChild(pill);

  // Hover & Active micro-animations
  wrap.addEventListener('mouseenter', () => {
    wrap.style.zIndex = '40';
    orb.style.transform = 'scale(1.16) translateY(-2px)';
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.style.zIndex = '10';
    orb.style.transform = 'scale(1) translateY(0)';
  });
  wrap.addEventListener('pointerdown', () => {
    orb.style.transform = 'scale(0.92)';
  });
  wrap.addEventListener('pointerup', () => {
    orb.style.transform = 'scale(1.16)';
  });

  // Tap handler
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick(currentNote);
  });

  let currentNote = note;

  const render = (n: ExtendedNote, label: string) => {
    currentNote = n;
    const config = TIER_CONFIG[n.rarity] || TIER_CONFIG.common;

    halo.style.background = config.glow;
    orb.style.background = n.unlocked
      ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, #D8E2DC 100%)'
      : config.bg;

    iconWrap.innerHTML = n.unlocked
      ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="${config.sealColor}" stroke="#14143A" stroke-width="2"/>
        </svg>
      `
      : config.symbol;

    if (n.unlocked) {
      pill.style.background = '#1B825D';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.8)';
      pill.style.color = '#FFFFFF';
      pill.textContent = label ? `OPENED · ${label}` : 'OPENED';
    } else {
      pill.style.background = '#14143A';
      pill.style.borderColor = 'rgba(255, 255, 255, 0.35)';
      pill.style.color = '#FFFFFF';
      pill.textContent = label || 'NOTE';
    }
  };

  render(note, distLabel);

  const marker = new Marker({
    element: wrap,
    anchor: 'center',
    offset: [0, 12],
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
  }).setLngLat([note.lng, note.lat]);

  return {
    marker,
    update: (updatedNote, updatedLabel) => {
      marker.setLngLat([updatedNote.lng, updatedNote.lat]);
      render(updatedNote, updatedLabel);
    },
    destroy: () => {
      marker.remove();
    },
  };
}
