/* ============================================================
 * LEFT HERE — Ranks Tab (P0)
 * Leaderboard for Hunters and Authors.
 * ============================================================ */

import { useState } from 'react';
import { Trophy } from '@phosphor-icons/react';

type RankTab = 'hunters' | 'authors';

/**
 * Ranks screen — leaderboards for Hunters (unlock count)
 * and Authors (worth-it votes received).
 * Full implementation in M3. This is the layout scaffold.
 */
export function RanksTab() {
  const [tab, setTab] = useState<RankTab>('hunters');

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-700) 100%)',
      }}
    >
      {/* Header */}
      <header className="safe-top px-5 pt-6 pb-4">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-xl)',
            color: 'white',
          }}
        >
          Ranks
        </h1>

        {/* Sub-tabs */}
        <div className="flex gap-2 mt-4">
          {(['hunters', 'authors'] as const).map((t) => (
            <button
              key={t}
              className="slant-btn"
              style={{
                background:
                  tab === t ? 'var(--color-hanko)' : 'var(--color-ink-700)',
                color: 'white',
                fontSize: 'var(--font-size-sm)',
                padding: '8px 20px',
                textTransform: 'capitalize',
              }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <Trophy
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
          {tab === 'hunters'
            ? 'No hunters yet. Be the first to find a note.'
            : 'No authors yet. Leave a note worth the trip.'}
        </p>
      </div>
    </div>
  );
}
