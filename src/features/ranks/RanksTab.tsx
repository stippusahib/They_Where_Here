/* ============================================================
 * THEY WERE HERE — Ranks Tab (P0)
 * Leaderboard with "Hunters" (XP/Unlocks) and "Authors" (Votes)
 * Top 3 podium, ranking list, own row pinned at the bottom.
 * ============================================================ */

import { useState } from 'react';
import { Trophy, Medal, Crown, UserCircle } from '@phosphor-icons/react';
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
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(
          180deg,
          var(--color-sky-night-deep) 0%,
          var(--color-sky-night-mid) 40%,
          var(--color-ink-900) 100%
        )`,
      }}
    >
      {/* Header */}
      <header className="safe-top px-5 pt-6 pb-3 shrink-0">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-xl)',
            color: 'white',
          }}
        >
          Leaderboard
        </h1>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-xs)',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {boardType === 'hunters'
            ? 'Travellers exploring the most hidden spots'
            : 'Authors whose travel tips are voted "Worth the trip"'}
        </p>

        {/* Sub-Tabs Switch */}
        <div className="flex bg-white/10 p-1 rounded-xl mt-4 max-w-xs">
          <button
            onClick={() => setBoardType('hunters')}
            className="flex-1 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer"
            style={{
              background: boardType === 'hunters' ? 'var(--color-hanko)' : 'transparent',
              color: 'white',
            }}
          >
            Hunters
          </button>
          <button
            onClick={() => setBoardType('authors')}
            className="flex-1 py-1.5 rounded-lg text-xs font-display transition-all cursor-pointer"
            style={{
              background: boardType === 'authors' ? 'var(--color-hanko)' : 'transparent',
              color: 'white',
            }}
          >
            Authors
          </button>
        </div>
      </header>

      {/* Top 3 Podium */}
      <div className="px-5 pt-2 pb-4 shrink-0 flex justify-center items-end gap-3">
        {/* Rank 2 */}
        {top3[1] && (
          <div className="flex flex-col items-center flex-1 max-w-[90px]">
            <div className="glass w-12 h-12 rounded-full flex items-center justify-center mb-1 border border-white/20">
              <Medal size={24} color="#C0C0C0" weight="fill" />
            </div>
            <span className="font-display text-white text-[11px] truncate w-full text-center">
              @{top3[1].handle}
            </span>
            <span className="text-[10px] text-white/50">
              {boardType === 'hunters' ? `${top3[1].xp} XP` : `${top3[1].worth_received} votes`}
            </span>
            <div className="w-full h-12 bg-white/10 rounded-t-xl mt-2 flex items-center justify-center font-display text-white/40 text-sm">
              #2
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {top3[0] && (
          <div className="flex flex-col items-center flex-1 max-w-[100px]">
            <Crown size={22} weight="fill" color="var(--color-legendary)" className="mb-0.5 animate-bounce" />
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-1 shadow-lg"
              style={{
                background: 'var(--color-legendary)',
                boxShadow: '0 0 16px var(--color-legendary)66',
              }}
            >
              <Trophy size={28} weight="fill" color="#0F1230" />
            </div>
            <span className="font-display text-white text-xs truncate w-full text-center">
              @{top3[0].handle}
            </span>
            <span className="text-[10px] text-yellow-300 font-bold">
              {boardType === 'hunters' ? `${top3[0].xp} XP` : `${top3[0].worth_received} votes`}
            </span>
            <div
              className="w-full h-16 rounded-t-xl mt-2 flex items-center justify-center font-display text-white text-base"
              style={{ background: 'var(--color-legendary)33', borderTop: '2px solid var(--color-legendary)' }}
            >
              #1
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <div className="flex flex-col items-center flex-1 max-w-[90px]">
            <div className="glass w-12 h-12 rounded-full flex items-center justify-center mb-1 border border-white/20">
              <Medal size={24} color="#CD7F32" weight="fill" />
            </div>
            <span className="font-display text-white text-[11px] truncate w-full text-center">
              @{top3[2].handle}
            </span>
            <span className="text-[10px] text-white/50">
              {boardType === 'hunters' ? `${top3[2].xp} XP` : `${top3[2].worth_received} votes`}
            </span>
            <div className="w-full h-8 bg-white/10 rounded-t-xl mt-2 flex items-center justify-center font-display text-white/40 text-sm">
              #3
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 flex flex-col gap-2">
        {rest.map((user, idx) => (
          <div
            key={user.id}
            className="glass p-3 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-white/40 text-xs w-5 text-center">
                #{idx + 4}
              </span>
              <UserCircle size={24} className="text-white/60" />
              <span className="font-display text-white text-xs">
                @{user.handle}
              </span>
            </div>

            <span className="text-xs font-display text-white/80">
              {boardType === 'hunters' ? `${user.xp} XP` : `${user.worth_received} votes`}
            </span>
          </div>
        ))}
      </div>

      {/* Pinned Current User Row at Bottom */}
      {profile && (
        <div className="absolute bottom-16 left-0 right-0 p-3 bg-black/60 backdrop-blur-md border-t border-white/10 safe-bottom">
          <div className="max-w-md mx-auto flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-display bg-[#E8264C] text-white">
                YOU
              </span>
              <span className="font-display text-white text-xs">
                @{profile.handle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-display text-[var(--color-legendary)]">
                {profile.xp} XP
              </span>
              <span className="text-[11px] text-white/50">
                • {profile.unlock_count} notes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
