/* ============================================================
 * LEFT HERE — Banner Component
 * Global banners for simulated GPS, offline, basic map, etc.
 * ============================================================ */

import { Warning, WifiSlash } from '@phosphor-icons/react';

interface BannerProps {
  variant: 'danger' | 'warn' | 'info';
  label: string;
}

const VARIANT_STYLES: Record<BannerProps['variant'], { bg: string; icon: typeof Warning }> = {
  danger: { bg: 'var(--color-hanko)', icon: Warning },
  warn: { bg: 'var(--color-warn)', icon: WifiSlash },
  info: { bg: 'var(--color-rare)', icon: Warning },
};

export function Banner({ variant, label }: BannerProps) {
  const { bg, icon: Icon } = VARIANT_STYLES[variant];

  return (
    <div
      className="safe-top flex items-center justify-center gap-2 px-4 py-2 text-white"
      style={{
        background: bg,
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--font-size-xs)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        zIndex: 100,
      }}
      role="alert"
    >
      <Icon size={16} weight="bold" />
      <span>{label}</span>
    </div>
  );
}
