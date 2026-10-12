/* ============================================================
 * LEFT HERE — Banner Component
 * Global banners for simulated GPS, offline, basic map, etc.
 * ============================================================ */

import { Warning, WifiSlash } from '@phosphor-icons/react';

interface BannerProps {
  variant: 'danger' | 'warn' | 'info';
  label: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const VARIANT_STYLES: Record<BannerProps['variant'], { bg: string; icon: typeof Warning }> = {
  danger: { bg: 'var(--color-hanko)', icon: Warning },
  warn: { bg: 'var(--color-warn)', icon: WifiSlash },
  info: { bg: 'var(--color-rare)', icon: Warning },
};

export function Banner({ variant, label, action }: BannerProps) {
  const { bg, icon: Icon } = VARIANT_STYLES[variant];

  return (
    <div
      className="safe-top flex items-center justify-between gap-2 px-4 py-2 text-white"
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
      <div className="flex items-center gap-2 min-w-0 truncate">
        <Icon size={16} weight="bold" className="shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="ml-2 px-2.5 py-0.5 rounded bg-white text-[var(--ink-900)] text-[10px] font-bold tracking-wider hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
