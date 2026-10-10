/* ============================================================
 * THEY WERE HERE — Ranks Tab (Clean Light Theme)
 * Leaderboard with "Hunters" (XP/Unlocks) and "Authors" (Votes)
 * Top 3 podium, ranking list, own row pinned above the dock.
 * ============================================================ */

import { useState } from 'react';
import { Crown, UserCircle, Trophy } from '@phosphor-icons/react';
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
        background: '#FAF7F0',
        color: 'var(--ink-900)',
      }}
    >
      <div className="max-w-md mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <header className="safe-top px-5 pt-6 pb-3 shrink-0 text-left">
          <div className="flex items-center gap-2">
            <Trophy size={22} color="var(--legendary)" weight="fill" />
            <h1 className="font-display text-xl" style={{ color: 'var(--ink-900)' }}>
              Leaderboard
            </h1>
          </div>
          <p className="mt-1 text-xs font-body" style={{ color: 'var(--ink-500)' }}>
            {boardType === 'hunters'
              ? 'Travellers exploring the most hidden spots'
              : 'Authors whose travel tips are voted "Worth the trip"'}
          </p>

          {/* Sub-Tabs Switch (Sentence Case) */}
          <div
            className="flex p-1 rounded-xl mt-4 max-w-xs"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              boxShadow: '0 2px 6px rgba(15, 18, 48, 0.04)',
            }}
          >
            <button
              onClick={() => setBoardType('hunters')}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all"
              style={{
                background: boardType === 'hunters' ? 'var(--hanko)' : 'transparent',
                color: boardType === 'hunters' ? '#FFFFFF' : 'var(--ink-700)',
              }}
            >
              Hunters
            </button>
            <button
              onClick={() => setBoardType('authors')}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all"
              style={{
                background: boardType === 'authors' ? 'var(--hanko)' : 'transparent',
                color: boardType === 'authors' ? '#FFFFFF' : 'var(--ink-700)',
              }}
            >
              Authors
            </button>
          </div>
        </header>

        {/* Scrollable Content: Top 3 Podium + List */}
        <div className="flex-1 overflow-y-auto px-5 pb-28 flex flex-col gap-5">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-2.5 items-end pt-4 pb-2">
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center relative mb-1.5"
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid #A0AABF',
                    boxShadow: '0 4px 10px rgba(15, 18, 48, 0.08)',
                  }}
                >
                  <UserCircle size={36} color="var(--ink-500)" />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ background: '#7A8FC4' }}
                  >
                    2
                  </span>
                </div>
                <span className="font-display text-xs truncate max-w-[80px]" style={{ color: 'var(--ink-900)' }}>
                  @{top3[1].handle}
                </span>
                <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--ink-500)' }}>
                  {boardType === 'hunters' ? `${top3[1].xp} XP` : `${top3[1].worth_received} votes`}
                </span>
                <div
                  className="w-full h-16 rounded-t-xl mt-2 flex items-center justify-center font-display text-xs font-bold"
                  style={{ background: '#E2E8F0', color: 'var(--ink-700)', border: '1px solid #CBD5E1' }}
                >
                  2nd
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <Crown size={22} color="#D48800" weight="fill" className="animate-bounce" />
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center relative mb-1.5"
                  style={{
                    background: '#FFFFFF',
                    border: '3px solid #FFC93C',
                    boxShadow: '0 4px 14px rgba(255, 201, 60, 0.3)',
                  }}
                >
                  <UserCircle size={44} color="#D48800" />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-sm"
                    style={{ background: '#FFC93C' }}
                  >
                    1
                  </span>
                </div>
                <span className="font-display text-xs truncate max-w-[90px]" style={{ color: 'var(--ink-900)' }}>
                  @{top3[0].handle}
                </span>
                <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--hanko)' }}>
                  {boardType === 'hunters' ? `${top3[0].xp} XP` : `${top3[0].worth_received} votes`}
                </span>
                <div
                  className="w-full h-24 rounded-t-xl mt-2 flex items-center justify-center font-display text-sm font-bold"
                  style={{ background: '#FEF08A', color: '#854D0E', border: '1.5px solid #FDE047' }}
                >
                  1st
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center relative mb-1.5"
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid #CD7F32',
                    boxShadow: '0 4px 10px rgba(15, 18, 48, 0.08)',
                  }}
                >
                  <UserCircle size={36} color="var(--ink-500)" />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ background: '#CD7F32' }}
                  >
                    3
                  </span>
                </div>
                <span className="font-display text-xs truncate max-w-[80px]" style={{ color: 'var(--ink-900)' }}>
                  @{top3[2].handle}
                </span>
                <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--ink-500)' }}>
                  {boardType === 'hunters' ? `${top3[2].xp} XP` : `${top3[2].worth_received} votes`}
                </span>
                <div
                  className="w-full h-12 rounded-t-xl mt-2 flex items-center justify-center font-display text-xs font-bold"
                  style={{ background: '#FED7AA', color: '#9A3412', border: '1px solid #FDBA74' }}
                >
                  3rd
                </div>
              </div>
            )}
          </div>

          {/* Rest of Leaderboard */}
          <div className="flex flex-col gap-2">
            {rest.map((user, idx) => (
              <div
                key={user.id}
                className="p-3.5 rounded-xl flex items-center justify-between"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EADECA',
                  boxShadow: '0 2px 6px rgba(15, 18, 48, 0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--ink-400)] w-4 text-center">
                    {idx + 4}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: '#FAF7F0', border: '1px solid #EADECA' }}
                  >
                    <UserCircle size={28} color="var(--ink-500)" />
                  </div>
                  <div>
                    <span className="font-display text-xs block text-left" style={{ color: 'var(--ink-900)' }}>
                      @{user.handle}
                    </span>
                    <span className="text-[10px] text-[var(--ink-500)] text-left block">
                      {user.unlock_count} notes opened
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-[var(--hanko)]">
                  {boardType === 'hunters' ? `${user.xp} XP` : `${user.worth_received} votes`}
                </span>
              </div>
            ))}
          </div>

          {/* Pinned Own Row */}
          {profile && (
            <div
              className="p-3.5 rounded-xl flex items-center justify-between sticky bottom-2 shadow-md"
              style={{
                background: 'var(--paper)',
                border: '2px solid var(--hanko)',
                boxShadow: '0 4px 14px rgba(232, 38, 76, 0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs text-[var(--hanko)] font-bold">
                  YOU
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--hanko)', border: '2px solid #FFFFFF' }}
                >
                  <UserCircle size={28} color="#FFFFFF" />
                </div>
                <div>
                  <span className="font-display text-xs block text-left" style={{ color: 'var(--ink-900)' }}>
                    @{profile.handle}
                  </span>
                  <span className="text-[10px] text-[var(--ink-500)] text-left block">
                    {profile.unlock_count} notes opened
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-[var(--hanko)]">
                {boardType === 'hunters' ? `${profile.xp} XP` : `${profile.worth_received} votes`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
