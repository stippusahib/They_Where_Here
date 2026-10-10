/* ============================================================
 * THEY WERE HERE — Passport Tab (P0)
 * Sticker book grid of collected notes, cached offline.
 * Filter by rarity, tap card to view verified traveller advice.
 * ============================================================ */

import React, { useState } from 'react';
import { BookOpen, X, CheckCircle, Calendar } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { RarityTag } from '@/ui/components/RarityTag';
import type { NoteRarity, PassportNote } from '@/contracts/types';

export const PassportTab: React.FC = () => {
  const passportNotes = useAppStore((s) => s.passportNotes);
  const [filterRarity, setFilterRarity] = useState<NoteRarity | 'all'>('all');
  const [selectedNote, setSelectedNote] = useState<PassportNote | null>(null);

  const filteredNotes = passportNotes.filter((n) => {
    if (filterRarity === 'all') return true;
    return n.rarity === filterRarity;
  });

  return (
    <div className="passport-screen overflow-y-auto">
      {/* Header */}
      <header className="passport-header safe-top">
        <div>
          <h1 className="passport-title">Passport</h1>
          <p className="passport-count">
            {passportNotes.length} verified traveller advice collected
          </p>
        </div>

        <div className="hud-chip" style={{ fontSize: '11px', padding: '4px 10px' }}>
          Offline Ready
        </div>
      </header>

      {/* Rarity Filter Pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all', 'common', 'rare', 'legendary'] as const).map((r) => {
          const isSel = filterRarity === r;
          return (
            <button
              key={r}
              onClick={() => setFilterRarity(r)}
              className="px-3 py-1 rounded-full uppercase text-[11px] cursor-pointer transition-all shrink-0"
              style={{
                fontFamily: 'var(--font-display)',
                background: isSel ? 'var(--hanko)' : 'rgba(255, 255, 255, 0.08)',
                color: isSel ? 'var(--white)' : 'var(--ink-300)',
                border: isSel ? '1px solid var(--hanko)' : '1px solid var(--glass-border)',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Grid or Empty State */}
      <div className="passport-grid">
        {filteredNotes.length === 0 ? (
          <div className="passport-empty">
            <BookOpen size={52} weight="thin" color="var(--ink-300)" />
            <p>No notes collected yet. Walk toward glowing orbs on the radar to unlock them.</p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => {
            const tilt = ((idx % 5) - 2) * 1.5;
            return (
              <div
                key={note.id}
                data-rarity={note.rarity}
                className="passport-sticker"
                style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex justify-between items-center mb-2">
                  <RarityTag rarity={note.rarity} />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      color: 'var(--ink-500)',
                    }}
                  >
                    #{note.stamp}
                  </span>
                </div>
                <p
                  className="line-clamp-4"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--ink-900)',
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  {note.body}
                </p>
                <div
                  className="mt-auto pt-2 flex items-center justify-between"
                  style={{
                    borderTop: '1px solid rgba(20, 20, 58, 0.1)',
                    fontSize: '10px',
                    color: 'var(--ink-500)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span>{note.unlock_count} unlocked</span>
                  <span>{note.worth_yes} verified</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 safe-top safe-bottom"
          style={{
            zIndex: 'var(--z-sheet)',
            background: 'rgba(15, 18, 48, 0.88)',
            backdropFilter: 'blur(16px)',
          }}
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="note-card relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute -top-10 right-0 glass flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                color: 'var(--white)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={18} weight="bold" />
            </button>

            <div className="note-card-header">
              <RarityTag rarity={selectedNote.rarity} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-700)',
                }}
              >
                STAMP #{selectedNote.stamp}
              </span>
            </div>

            <p className="note-card-body" style={{ margin: '16px 0' }}>
              {selectedNote.body}
            </p>

            <div className="note-card-footer justify-between">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {new Date(selectedNote.unlocked_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-[#228B22]">
                <CheckCircle size={13} weight="fill" /> Verified Travel Advice
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
