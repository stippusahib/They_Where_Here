/* ============================================================
 * THEY WERE HERE — Ranks Tab
 * Leaderboards for Hunters (unlocks & XP) and Authors (worth-it votes).
 * ============================================================ */

import { useState } from 'react';
import {
  Compass,
  Heart,
  Crown,
  Medal,
  Sparkle,
  User,
  CaretUp,
} from '@phosphor-icons/react';
import type { LeaderboardEntry } from '@/contracts/types';
import { playButtonClick } from '@/lib/audio';
import { useAppStore } from '@/state/store';

type RankMode = 'hunters' | 'authors';

// Seeded leaderboard entries for live demonstration (Rule 3: labeled demo data)
const DEMO_HUNTERS: LeaderboardEntry[] = [
  {
    id: 'u-1',
    handle: 'Wanderer_Kozhikode',
    avatar: 0,
    xp: 480,
    unlock_count: 24,
    worth_received: 18,
  },
  {
    id: 'u-2',
    handle: 'Malabar_Nomad',
    avatar: 1,
    xp: 390,
    unlock_count: 19,
    worth_received: 14,
  },
  {
    id: 'u-3',
    handle: 'Calicut_Drifter',
    avatar: 2,
    xp: 310,
    unlock_count: 15,
    worth_received: 22,
  },
  {
    id: 'u-4',
    handle: 'Coast_Scout',
    avatar: 3,
    xp: 240,
    unlock_count: 12,
    worth_received: 8,
  },
  {
    id: 'u-5',
    handle: 'Banyan_Seer',
    avatar: 4,
    xp: 190,
    unlock_count: 9,
    worth_received: 11,
  },
  {
    id: 'u-6',
    handle: 'Tea_Stall_Voyager',
    avatar: 5,
    xp: 140,
    unlock_count: 7,
    worth_received: 5,
  },
];

const DEMO_AUTHORS: LeaderboardEntry[] = [
  {
    id: 'u-3',
    handle: 'Calicut_Drifter',
    avatar: 2,
    xp: 310,
    unlock_count: 15,
    worth_received: 22,
  },
  {
    id: 'u-1',
    handle: 'Wanderer_Kozhikode',
    avatar: 0,
    xp: 480,
    unlock_count: 24,
    worth_received: 18,
  },
  {
    id: 'u-2',
    handle: 'Malabar_Nomad',
    avatar: 1,
    xp: 390,
    unlock_count: 19,
    worth_received: 14,
  },
  {
    id: 'u-5',
    handle: 'Banyan_Seer',
    avatar: 4,
    xp: 190,
    unlock_count: 9,
    worth_received: 11,
  },
  {
    id: 'u-4',
    handle: 'Coast_Scout',
    avatar: 3,
    xp: 240,
    unlock_count: 12,
    worth_received: 8,
  },
];

export function RanksTab() {
  const [mode, setMode] = useState<RankMode>('hunters');
  const profile = useAppStore((s) => s.profile);

  const entries = mode === 'hunters' ? DEMO_HUNTERS : DEMO_AUTHORS;
  const topThree = entries.slice(0, 3);
  const remainder = entries.slice(3);

  const getTierTitle = (xp: number) => {
    if (xp >= 400) return 'Master Explorer';
    if (xp >= 250) return 'Wayfarer';
    if (xp >= 150) return 'Pathfinder';
    return 'Scout';
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-900) 100%)',
      }}
    >
      {/* Header */}
      <header className="safe-top px-5 pt-6 pb-2" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xl)',
                color: 'white',
              }}
            >
              Ranks
            </h1>
            <p
              className="mt-0.5"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {mode === 'hunters'
                ? 'Hunters ranked by verified location unlocks'
                : 'Authors ranked by "Worth the trip" votes received'}
            </p>
          </div>

          <span
            className="px-2 py-0.5 text-[10px] tracking-wider uppercase opacity-60"
            style={{
              borderRadius: 'var(--radius-chip)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontFamily: 'var(--font-body)',
            }}
          >
            demo data
          </span>
        </div>

        {/* Toggle Mode */}
        <div
          className="flex p-1 mt-4"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-chip)',
          }}
        >
          <button
            onClick={() => {
              playButtonClick();
              setMode('hunters');
            }}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 transition-all"
            style={{
              borderRadius: 'var(--radius-chip)',
              background: mode === 'hunters' ? 'var(--color-hanko)' : 'transparent',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Compass size={16} weight="bold" />
            <span>Hunters</span>
          </button>

          <button
            onClick={() => {
              playButtonClick();
              setMode('authors');
            }}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 transition-all"
            style={{
              borderRadius: 'var(--radius-chip)',
              background: mode === 'authors' ? 'var(--color-hanko)' : 'transparent',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} weight="bold" />
            <span>Authors</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 pb-28">
        {/* Top 3 Podium */}
        {(() => {
          const first = topThree[0];
          const second = topThree[1];
          const third = topThree[2];
          if (!first || !second || !third) return null;
          return (
            <div className="flex items-end justify-center gap-2 pt-4 pb-2">
              {/* 2nd Place */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-1.5 relative border"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderColor: '#C0C0C0',
                  }}
                >
                  <Medal size={22} weight="fill" color="#C0C0C0" />
                  <span
                    className="absolute -top-2 px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-[#C0C0C0] text-black"
                  >
                    2
                  </span>
                </div>
                <p
                  className="text-xs font-bold text-white truncate max-w-[90px] text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {second.handle}
                </p>
                <p className="text-[11px] text-white/50 mb-1">
                  {mode === 'hunters' ? `${second.xp} XP` : `${second.worth_received} votes`}
                </p>
                <div
                  className="w-full h-16 rounded-t-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, rgba(192,192,192,0.3) 0%, rgba(192,192,192,0.1) 100%)',
                    borderTop: '2px solid #C0C0C0',
                  }}
                >
                  <span className="text-sm font-bold text-white/70">#2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-1.5 relative border shadow-lg"
                  style={{
                    background: 'rgba(255, 201, 60, 0.25)',
                    borderColor: 'var(--color-legendary)',
                    boxShadow: '0 0 15px rgba(255, 201, 60, 0.4)',
                  }}
                >
                  <Crown size={28} weight="fill" color="var(--color-legendary)" />
                  <span
                    className="absolute -top-2 px-2 py-0.2 text-[11px] rounded-full font-bold bg-[#FFC93C] text-black"
                  >
                    1
                  </span>
                </div>
                <p
                  className="text-xs font-bold text-white truncate max-w-[100px] text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {first.handle}
                </p>
                <p className="text-[11px] text-[#FFC93C] font-semibold mb-1">
                  {mode === 'hunters' ? `${first.xp} XP` : `${first.worth_received} votes`}
                </p>
                <div
                  className="w-full h-24 rounded-t-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,201,60,0.35) 0%, rgba(255,201,60,0.1) 100%)',
                    borderTop: '2px solid var(--color-legendary)',
                  }}
                >
                  <span className="text-base font-bold text-white">#1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-1.5 relative border"
                  style={{
                    background: 'rgba(255, 158, 61, 0.15)',
                    borderColor: 'var(--color-warn)',
                  }}
                >
                  <Medal size={22} weight="fill" color="var(--color-warn)" />
                  <span
                    className="absolute -top-2 px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-[#FF9E3D] text-black"
                  >
                    3
                  </span>
                </div>
                <p
                  className="text-xs font-bold text-white truncate max-w-[90px] text-center"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {third.handle}
                </p>
                <p className="text-[11px] text-white/50 mb-1">
                  {mode === 'hunters' ? `${third.xp} XP` : `${third.worth_received} votes`}
                </p>
                <div
                  className="w-full h-12 rounded-t-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,158,61,0.25) 0%, rgba(255,158,61,0.05) 100%)',
                    borderTop: '2px solid var(--color-warn)',
                  }}
                >
                  <span className="text-sm font-bold text-white/70">#3</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Remaining List */}
        <div className="space-y-2">
          {remainder.map((entry, idx) => {
            const rank = idx + 4;
            return (
              <div
                key={entry.id}
                className="glass px-4 py-3 flex items-center justify-between"
                style={{
                  borderRadius: 'var(--radius-panel)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 text-center font-bold text-xs"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}
                  >
                    #{rank}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <User size={16} weight="bold" color="white" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {entry.handle}
                    </p>
                    <span
                      className="text-[10px] text-white/40 uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {getTierTitle(entry.xp)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: mode === 'hunters' ? 'var(--color-mint)' : 'var(--color-rare)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {mode === 'hunters' ? `${entry.xp} XP` : `${entry.worth_received} votes`}
                  </span>
                  <p className="text-[10px] text-white/40">
                    {mode === 'hunters' ? `${entry.unlock_count} notes found` : 'verified useful'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom: User's Own Standing */}
      <footer
        className="glass px-5 py-3 flex items-center justify-between border-t"
        style={{
          borderTopColor: 'rgba(255,255,255,0.15)',
          background: 'rgba(15, 18, 48, 0.95)',
          position: 'fixed',
          bottom: 56, // above tab bar
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--color-hanko)',
              color: 'white',
            }}
          >
            <Sparkle size={18} weight="fill" />
          </div>
          <div>
            <p
              className="text-xs font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {profile?.handle ?? 'You (Anonymous Explorer)'}
            </p>
            <p className="text-[10px] text-white/50">
              {profile ? `${profile.xp} XP · Current standing: #7` : '0 XP · Unlock notes to rank'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <CaretUp size={16} weight="bold" />
          <span>Top 20%</span>
        </div>
      </footer>
    </div>
  );
}
