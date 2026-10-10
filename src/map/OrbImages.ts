/* ============================================================
 * THEY WERE HERE — Radiant Anime Orb Images (MapLibre GL)
 * High-definition procedural canvas orbs with tiered anime energy,
 * multi-layer radiant bloom, bold ink outlines, die-cut borders,
 * and distinct rarity iconography (Common, Rare, Legendary).
 * ============================================================ */

import type { Map } from 'maplibre-gl';

export type OrbVariant = {
  rarity: 'common' | 'rare' | 'legendary';
  opened: boolean;
};

const THEMES = {
  common: {
    coreFill: '#FFF3D6',
    coreShade: '#E6D3A3',
    glowA: 'rgba(255, 243, 214, 0.65)',
    glowB: 'rgba(255, 220, 160, 0.25)',
    accent: '#E8264C', // Hanko red wax seal
    sparkle: '#FFFFFF',
  },
  rare: {
    coreFill: '#35B6FF',
    coreShade: '#007ACC',
    glowA: 'rgba(53, 182, 255, 0.85)',
    glowB: 'rgba(0, 162, 255, 0.35)',
    accent: '#FFFFFF',
    sparkle: '#D4F1FF',
  },
  legendary: {
    coreFill: '#FFC93C',
    coreShade: '#D48800',
    glowA: 'rgba(255, 201, 60, 0.95)',
    glowB: 'rgba(255, 140, 0, 0.45)',
    accent: '#E8264C',
    sparkle: '#FFFBE6',
  },
} as const;

export function drawOrb(variant: OrbVariant, size = 96): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;
  const theme = THEMES[variant.rarity];

  // 1. Outer Atmospheric Bloom (Soft anime aura)
  const outerBloomRadius = size * 0.48;
  const outerBloom = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, outerBloomRadius);
  outerBloom.addColorStop(0, theme.glowA);
  outerBloom.addColorStop(0.5, theme.glowB);
  outerBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = outerBloom;
  ctx.beginPath();
  ctx.arc(cx, cy, outerBloomRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Concentric Energy Shockwave Ring
  const ringRadius = size * 0.34;
  ctx.save();
  ctx.strokeStyle = theme.glowA;
  ctx.lineWidth = variant.rarity === 'legendary' ? 3.5 : 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // For Legendary: Draw 4 Solar Flares / Spikes around the ring
  if (variant.rarity === 'legendary') {
    ctx.save();
    ctx.fillStyle = '#FFEAA7';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const sx = cx + Math.cos(angle) * (ringRadius + 5);
      const sy = cy + Math.sin(angle) * (ringRadius + 5);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Core Jewel Disc (Gradient shaded)
  const coreRadius = size * 0.24;
  const coreGrad = ctx.createRadialGradient(
    cx - coreRadius * 0.3,
    cy - coreRadius * 0.3,
    coreRadius * 0.1,
    cx,
    cy,
    coreRadius
  );

  if (variant.opened) {
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    coreGrad.addColorStop(1, 'rgba(20, 24, 60, 0.7)');
  } else {
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.35, theme.coreFill);
    coreGrad.addColorStop(1, theme.coreShade);
  }

  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();

  // 4. Dark Comic-Ink Border (3px #14143A)
  ctx.strokeStyle = '#14143A';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 5. White Die-Cut Inner Border (2px inset)
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius - 2.5, 0, Math.PI * 2);
  ctx.strokeStyle = variant.opened ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 6. Iconography inside core
  ctx.save();
  if (variant.opened) {
    // Opened: Radiant 4-point Celestial Star / Compass
    ctx.fillStyle = theme.coreFill;
    ctx.strokeStyle = '#14143A';
    ctx.lineWidth = 1.2;

    const starSize = coreRadius * 0.65;
    ctx.beginPath();
    ctx.moveTo(cx, cy - starSize);
    ctx.quadraticCurveTo(cx, cy, cx + starSize, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + starSize);
    ctx.quadraticCurveTo(cx, cy, cx - starSize, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - starSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Sealed: Distinctive Rarity Emblem
    if (variant.rarity === 'common') {
      // Sealed Common: Envelope with red wax stamp
      ctx.strokeStyle = '#14143A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Flap
      ctx.moveTo(cx - 9, cy - 4);
      ctx.lineTo(cx, cy + 3);
      ctx.lineTo(cx + 9, cy - 4);
      // Body
      ctx.moveTo(cx - 9, cy - 4);
      ctx.lineTo(cx - 9, cy + 6);
      ctx.lineTo(cx + 9, cy + 6);
      ctx.lineTo(cx + 9, cy - 4);
      ctx.stroke();

      // Wax stamp dot
      ctx.fillStyle = '#E8264C';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant.rarity === 'rare') {
      // Sealed Rare: Electric Wind / Chevron wings & crystal diamond
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#14143A';
      ctx.lineWidth = 1.5;

      // Crystal Diamond
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 7, cy);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 7, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner gleam
      ctx.fillStyle = '#35B6FF';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sealed Legendary: Majestic Crown Star
      ctx.fillStyle = '#FFF8E1';
      ctx.strokeStyle = '#14143A';
      ctx.lineWidth = 1.8;

      // 5-point Crown / Star
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 3, cy - 2);
      ctx.lineTo(cx + 9, cy - 2);
      ctx.lineTo(cx + 4, cy + 3);
      ctx.lineTo(cx + 6, cy + 9);
      ctx.lineTo(cx, cy + 5);
      ctx.lineTo(cx - 6, cy + 9);
      ctx.lineTo(cx - 4, cy + 3);
      ctx.lineTo(cx - 9, cy - 2);
      ctx.lineTo(cx - 3, cy - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center ruby jewel
      ctx.fillStyle = '#E8264C';
      ctx.beginPath();
      ctx.arc(cx, cy + 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}

export function registerOrbs(map: Map) {
  (['common', 'rare', 'legendary'] as const).forEach((rarity) => {
    [false, true].forEach((opened) => {
      const key = `orb-${rarity}-${opened ? 'opened' : 'sealed'}`;
      if (map.hasImage(key)) return;
      const imgData = drawOrb({ rarity, opened }, 96);
      map.addImage(key, imgData, { pixelRatio: 2 });
    });
  });
}
