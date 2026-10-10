/* ============================================================
 * THEY WERE HERE — Passport Tab (P0)
 * Photomontage travel scrapbook of unlocked notes.
 * Die-cut postcard stickers, arrival postmarks, tone seals,
 * and verified traveller advice cached offline.
 * ============================================================ */

import React, { useState } from 'react';
import { BookOpen, X, Stamp, CheckCircle } from '@phosphor-icons/react';
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
    <div
      className="passport-screen overflow-y-auto h-full flex flex-col"
      style={{
        background: `linear-gradient(
          180deg,
          var(--sky-a) 0%,
          var(--sky-b) 35%,
          var(--ink-900) 100%
        )`,
      }}
    >
      <div className="max-w-md mx-auto w-full px-5 pt-6 pb-28 flex flex-col gap-4">
        {/* Header (Scrapbook Travel Passport Style) */}
        <header className="passport-header safe-top flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Stamp size={20} color="var(--accent)" weight="fill" />
              <h1 className="passport-title font-display text-white text-xl">
                Travel Passport
              </h1>
            </div>
            <p className="passport-count text-xs text-white/60 mt-0.5 font-body">
              {passportNotes.length} verified traveller advice collected
            </p>
          </div>

          <div
            className="hud-chip flex items-center gap-1 text-[11px] px-2.5 py-1 text-white/70"
            style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <CheckCircle size={12} color="var(--mint)" weight="fill" />
            <span>Offline Ready</span>
          </div>
        </header>

        {/* Sentence Case Rarity Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All notes' },
            { id: 'common', label: 'Common' },
            { id: 'rare', label: 'Rare' },
            { id: 'legendary', label: 'Legendary' },
          ].map((r) => {
            const isSel = filterRarity === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setFilterRarity(r.id as NoteRarity | 'all')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all shrink-0"
                style={{
                  background: isSel ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSel ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                  border: isSel
                    ? '1.5px solid rgba(255, 255, 255, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isSel ? '0 2px 8px rgba(210,63,90,0.3)' : 'none',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Grid or Empty State */}
        <div className="passport-grid">
          {filteredNotes.length === 0 ? (
            <div className="passport-empty col-span-2 text-center py-16 px-6 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <BookOpen size={36} weight="light" color="var(--reach)" />
              </div>
              <p className="text-sm text-white/70 max-w-xs font-body">
                No notes collected yet. Walk toward glowing orbs on the radar map to unlock them.
              </p>
            </div>
          ) : (
            filteredNotes.map((note, idx) => {
              const tilt = ((idx % 4) - 1.5) * 1.5;
              return (
                <div
                  key={note.id}
                  data-rarity={note.rarity}
                  className="passport-sticker relative overflow-hidden transition-transform active:scale-95 cursor-pointer"
                  style={{
                    '--tilt': `${tilt}deg`,
                    background: 'var(--paper)',
                    color: 'var(--ink-900)',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                    transform: `rotate(${tilt}deg)`,
                  } as React.CSSProperties}
                  onClick={() => setSelectedNote(note)}
                >
                  {/* Subtle Stamp Watermark in Card Corner */}
                  <div className="flex justify-between items-center mb-2">
                    <RarityTag rarity={note.rarity} size="sm" />
                    <span
                      className="text-[10px] font-mono font-bold text-black/40"
                    >
                      #{note.stamp}
                    </span>
                  </div>

                  <p
                    className="line-clamp-4 text-xs font-bold leading-relaxed text-[#14143A] mb-3"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {note.body}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-black/10 text-[10px] text-black/50 font-body">
                    <span className="capitalize">{note.tone ?? 'honest'} advice</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(note.unlocked_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Note Modal (Full Travel Postcard Stationery) */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 text-left relative shadow-2xl animate-fade-in"
            style={{
              background: '#FFF3D6',
              color: '#14143A',
              border: '4px solid #FFFFFF',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Stamp and Close */}
            <div className="flex justify-between items-center pb-2 border-b border-black/10">
              <div className="flex items-center gap-2">
                <RarityTag rarity={selectedNote.rarity} />
                <span className="text-xs font-mono font-bold text-black/50">
                  #{selectedNote.stamp}
                </span>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded-full text-black/50 hover:text-black cursor-pointer"
                aria-label="Close note preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Note Body */}
            <div className="py-2">
              <p
                className="text-base font-bold leading-relaxed text-[#14143A]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {selectedNote.body}
              </p>
            </div>

            {/* Postcard Metadata Footer */}
            <div className="pt-3 border-t border-black/10 flex flex-col gap-1.5 text-xs text-black/60 font-body">
              <div className="flex justify-between items-center">
                <span>Tone: <strong className="capitalize text-black">{selectedNote.tone}</strong></span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(selectedNote.unlocked_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-black/40">
                <span>Voted {selectedNote.worth_yes} worth the trip</span>
                <span>Unlocked {selectedNote.unlock_count} times</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
