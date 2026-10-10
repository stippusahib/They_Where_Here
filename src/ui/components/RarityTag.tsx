/* ============================================================
 * THEY WERE HERE — Rarity Tag Component
 * Common (cream), Rare (sky blue), Legendary (gold).
 * ============================================================ */

import type { NoteRarity } from '@/contracts/types';

interface RarityTagProps {
  rarity: NoteRarity;
  size?: 'sm' | 'md';
}

export function RarityTag({ rarity, size = 'sm' }: RarityTagProps) {
  const isSm = size === 'sm';

  const config = {
    common: {
      bg: 'var(--color-common)',
      color: 'var(--color-ink-900)',
      label: 'COMMON',
    },
    rare: {
      bg: 'var(--color-rare)',
      color: 'var(--color-ink-900)',
      label: 'RARE',
    },
    legendary: {
      bg: 'var(--color-legendary)',
      color: 'var(--color-ink-900)',
      label: 'LEGENDARY',
    },
  }[rarity];

  return (
    <span
      className="inline-flex items-center font-bold tracking-wider uppercase font-display"
      style={{
        background: config.bg,
        color: config.color,
        fontSize: isSm ? '10px' : '12px',
        padding: isSm ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--radius-chip)',
        boxShadow: `0 0 10px ${config.bg}44`,
        transform: 'skewX(-8deg)',
      }}
    >
      <span style={{ transform: 'skewX(8deg)' }}>{config.label}</span>
    </span>
  );
}
