// Generates and registers orb images for MapLibre
// Call once after the map style has loaded: map.on('styledata', () => registerOrbs(map))

import type { Map } from 'maplibre-gl';

type OrbVariant = {
  rarity: 'common' | 'rare' | 'legendary';
  opened: boolean;
};

const CONFIG: Record<string, { fill: string; glow: string; pulse: string }> = {
  common:    { fill: '#FFF3D6', glow: 'rgba(255,243,214,0.50)', pulse: 'rgba(255,243,214,0.18)' },
  rare:      { fill: '#35B6FF', glow: 'rgba(53,182,255,0.55)',  pulse: 'rgba(53,182,255,0.20)' },
  legendary: { fill: '#FFC93C', glow: 'rgba(255,201,60,0.60)', pulse: 'rgba(255,201,60,0.22)' },
};

function drawOrb(variant: OrbVariant, size = 60): ImageData {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const cfg = CONFIG[variant.rarity]!;
  const cx = size / 2, cy = size / 2;

  // Outer pulse ring
  const pulse = ctx.createRadialGradient(cx, cy, size * 0.35, cx, cy, size * 0.50);
  pulse.addColorStop(0, cfg.pulse);
  pulse.addColorStop(1, 'transparent');
  ctx.fillStyle = pulse;
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.50, 0, Math.PI * 2); ctx.fill();

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.38);
  glow.addColorStop(0, cfg.glow);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2); ctx.fill();

  // Core circle
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = variant.opened ? 'rgba(255,255,255,0.15)' : cfg.fill;
  ctx.fill();

  // Dark outline
  ctx.strokeStyle = '#14143A';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // White die-cut border (2px inside outline)
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.24 - 2.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.90)';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (variant.opened) {
    // Opened: small checkmark
    ctx.strokeStyle = cfg.fill;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 2, cy + 4); ctx.lineTo(cx + 5, cy - 4);
    ctx.stroke();
  } else {
    // Sealed: envelope flap lines
    ctx.strokeStyle = '#14143A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx, cy + 3); ctx.lineTo(cx + 7, cy - 3);
    ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx - 7, cy + 4); ctx.lineTo(cx + 7, cy + 4); ctx.lineTo(cx + 7, cy - 3);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}

export function registerOrbs(map: Map) {
  (['common', 'rare', 'legendary'] as const).forEach(rarity => {
    [false, true].forEach(opened => {
      const key = `orb-${rarity}-${opened ? 'opened' : 'sealed'}`;
      if (map.hasImage(key)) return;
      const imgData = drawOrb({ rarity, opened }, 72);
      map.addImage(key, imgData, { pixelRatio: 2 });
    });
  });
}
