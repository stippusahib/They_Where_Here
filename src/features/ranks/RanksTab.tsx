/* ============================================================
 * THEY WERE HERE — Ranks Tab (P0)
 * Leaderboard with "Hunters" (XP/Unlocks) and "Authors" (Votes)
 * Top 3 podium, ranking list, own row pinned above the dock.
 * ============================================================ */

import { useState } from 'react';
import { Medal, Crown, UserCircle, Trophy } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';

interface RankUser {
  id: string;
  handle: string;
  avatar: number;
  xp: number;
  unlock_count: number;
  worth_received: number;
}

const HUNTERS_BOARD: RankUser[] = [
  { id: '1', handle: 'cosmic_wanderer', avatar: 3, xp: 480, unlock_count: 16, worth_received: 24 },
  { id: '2', handle: 'swift_fox', avatar: 1, xp: 340, unlock_count: 12, worth_received: 18 },
  { id: '3', handle: 'calm_otter', avatar: 2, xp: 290, unlock_count: 9, worth_received: 14 },
  { id: '4', handle: 'wise_crane', avatar: 4, xp: 210, unlock_count: 7, worth_received: 31 },
  { id: '5', handle: 'brave_wolf', avatar: 5, xp: 160, unlock_count: 5, worth_received: 9 },
];

const AUTHORS_BOARD: RankUser[] = [
  { id: '4', handle: 'wise_crane', avatar: 4, xp: 210, unlock_count: 7, worth_received: 52 },
  { id: '1', handle: 'cosmic_wanderer', avatar: 3, xp: 480, unlock_count: 16, worth_received: 38 },
  { id: '2', handle: 'swift_fox', avatar: 1, xp: 340, unlock_count: 12, worth_received: 29 },
  { id: '3', handle: 'calm_otter', avatar: 2, xp: 290, unlock_count: 9, worth_received: 21 },
  { id: '6', handle: 'stellar_hawk', avatar: 6, xp: 140, unlock_count: 4, worth_received: 15 },
];

export function RanksTab() {
  const profile = useAppStore((s) => s.profile);
  const [boardType, setBoardType] = useState<'hunters' | 'authors'>('hunters');

  const boardData = boardType === 'hunters' ? HUNTERS_BOARD : AUTHORS_BOARD;
  const top3 = boardData.slice(0, 3);
  const rest = boardData.slice(3);

  return (
    <div
      className="h-full flex flex-col overflow-hidden relative"
      style={{
        background: `linear-gradient(
          180deg,
          var(--sky-a) 0%,
          var(--sky-b) 40%,
          var(--ink-900) 100%
        )`,
      }}
    >
      <div className="max-w-md mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <header className="safe-top px-5 pt-6 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={20} color="var(--legendary)" weight="fill" />
            <h1 className="font-display text-white text-xl">
              Leaderboard
            </h1>
          </div>
          <p className="mt-1 text-xs text-white/60 font-body">
            {boardType === 'hunters'
              ? 'Travellers exploring the most hidden spots'
              : 'Authors whose travel tips are voted "Worth the trip"'}
          </p>

          {/* Sub-Tabs Switch (Sentence Case) */}
          <div
            className="flex p-1 rounded-xl mt-4 max-w-xs"
            style={{
              background: 'var(--sheet-bg)',
              border: '1px solid var(--sheet-border)',
            }}
          >
            <button
              onClick={() => setBoardType('hunters')}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{
                background: boardType === 'hunters' ? 'var(--accent)' : 'transparent',
                color: boardType === 'hunters' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: boardType === 'hunters' ? '0 2px 8px rgba(210,63,90,0.35)' : 'none',
              }}
            >
              Hunters
            </button>
            <button
              onClick={() => setBoardType('authors')}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{
                background: boardType === 'authors' ? 'var(--accent)' : 'transparent',
                color: boardType === 'authors' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: boardType === 'authors' ? '0 2px 8px rgba(210,63,90,0.35)' : 'none',
              }}
            >
              Authors
            </button>
          </div>
        </header>

        {/* Top 3 Podium (Scrapbook Badges) */}
        <div className="flex items-end justify-center gap-3 px-5 py-3 shrink-0">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="flex flex-col items-center flex-1 max-w-[96px]">
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center mb-1.5 shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid #C0C0C0',
                }}
              >
                <Medal size={26} color="#D8D8D8" weight="fill" />
              </div>
              <span className="font-display text-white text-[11px] truncate w-full text-center">
                @{top3[1].handle}
              </span>
              <span
                className="text-[10px] text-white/60 font-body"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {boardType === 'hunters' ? `${top3[1].xp} XP` : `${top3[1].worth_received} votes`}
              </span>
              <div
                className="w-full h-10 rounded-t-xl mt-2 flex items-center justify-center font-display text-white/50 text-sm font-bold"
                style={{ background: 'rgba(255, 255, 255, 0.12)' }}
              >
                #2
              </div>
            </div>
          )}

          {/* Rank 1 (Gold Champion) */}
          {top3[0] && (
            <div className="flex flex-col items-center flex-1 max-w-[104px]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-1.5 relative shadow-xl"
                style={{
                  background: 'color-mix(in srgb, var(--legendary) 20%, transparent)',
                  border: '2.5px solid var(--legendary)',
                  boxShadow: '0 0 20px rgba(255, 201, 60, 0.35)',
                }}
              >
                <Crown size={32} color="var(--legendary)" weight="fill" />
              </div>
              <span className="font-display text-white text-xs truncate w-full text-center font-bold">
                @{top3[0].handle}
              </span>
              <span
                className="text-[11px] text-[var(--legendary)] font-bold font-body"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {boardType === 'hunters' ? `${top3[0].xp} XP` : `${top3[0].worth_received} votes`}
              </span>
              <div
                className="w-full h-16 rounded-t-xl mt-2 flex items-center justify-center font-display text-white text-base font-black shadow-inner"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 201, 60, 0.3) 0%, rgba(255, 201, 60, 0.1) 100%)',
                  borderTop: '2px solid var(--legendary)',
                }}
              >
                #1
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="flex flex-col items-center flex-1 max-w-[96px]">
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center mb-1.5 shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid #CD7F32',
                }}
              >
                <Medal size={26} color="#CD7F32" weight="fill" />
              </div>
              <span className="font-display text-white text-[11px] truncate w-full text-center">
                @{top3[2].handle}
              </span>
              <span
                className="text-[10px] text-white/60 font-body"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {boardType === 'hunters' ? `${top3[2].xp} XP` : `${top3[2].worth_received} votes`}
              </span>
              <div
                className="w-full h-8 rounded-t-xl mt-2 flex items-center justify-center font-display text-white/40 text-sm font-bold"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              >
                #3
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Rest of List */}
        <div className="flex-1 overflow-y-auto px-5 pb-36 flex flex-col gap-2.5">
          {rest.map((user, idx) => (
            <div
              key={user.id}
              className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
              style={{
                background: 'var(--sheet-bg)',
                border: '1px solid var(--sheet-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-display text-white/50 text-xs w-6 text-center font-bold"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  #{idx + 4}
                </span>
                <UserCircle size={24} className="text-white/60" />
                <span className="font-display text-white text-xs">
                  @{user.handle}
                </span>
              </div>

              <span
                className="text-xs font-bold text-white/80"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {boardType === 'hunters' ? `${user.xp} XP` : `${user.worth_received} votes`}
              </span>
            </div>
          ))}
        </div>

        {/* Pinned Current User Row at Bottom (High-Contrast Passport Ribbon) */}
        {profile && (
          <div
            className="absolute left-4 right-4 z-40 p-3.5 rounded-2xl flex items-center justify-between shadow-2xl"
            style={{
              bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px) + var(--dock-gap))',
              background: 'var(--sheet-bg)',
              border: '2px solid var(--accent)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 16px rgba(210,63,90,0.3)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="px-2.5 py-0.5 rounded-md text-[10px] font-display text-white font-bold"
                style={{ background: 'var(--accent)' }}
              >
                YOU
              </span>
              <span className="font-display text-white text-xs font-bold">
                @{profile.handle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-display text-[var(--legendary)] font-bold"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {profile.xp} XP
              </span>
              <span className="text-[11px] text-white/60 font-body">
                • {profile.unlock_count} notes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
