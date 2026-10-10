/* ============================================================
 * THEY WERE HERE — Passport Tab (P0)
 * Sticker book of collected verified notes, cached offline.
 * ============================================================ */

import { BookOpen } from '@phosphor-icons/react';

/**
 * Passport screen — collected notes in a verified sticker book grid.
 * Offline-first, showing traveller advice unlocked on location.
 */
export function PassportTab() {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-700) 100%)',
      }}
    >
      {/* Header */}
      <header
        className="safe-top px-5 pt-6 pb-4"
        style={{ zIndex: 10 }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-xl)',
            color: 'white',
          }}
        >
          Passport
        </h1>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          0 verified notes collected
        </p>
      </header>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <BookOpen
          size={64}
          weight="thin"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        />
        <p
          className="mt-4"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-base)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Nothing here yet. Find your first note.
        </p>
      </div>
    </div>
  );
}

export const PassportScreen = PassportTab;
