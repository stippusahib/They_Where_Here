/* ============================================================
 * THEY WERE HERE — Passport Tab (Clean Light Theme & Voice)
 * Photomontage travel scrapbook of unlocked notes.
 * Die-cut postcard stickers, arrival postmarks, tone seals,
 * voice note player, and verified traveller advice cached offline.
 * ============================================================ */

import React, { useState } from 'react';
import { BookOpen, X, Stamp, CheckCircle, SpeakerHigh } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { RarityTag } from '@/ui/components/RarityTag';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';
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
        background: '#FAF7F0',
        color: 'var(--ink-900)',
      }}
    >
      <div className="max-w-md mx-auto w-full px-5 pt-6 pb-28 flex flex-col gap-4">
        {/* Header (Scrapbook Travel Passport Style) */}
        <header className="passport-header safe-top flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Stamp size={22} color="var(--hanko)" weight="fill" />
              <h1 className="passport-title font-display text-xl" style={{ color: 'var(--ink-900)' }}>
                Travel Passport
              </h1>
            </div>
            <p className="passport-count text-xs mt-0.5 font-body" style={{ color: 'var(--ink-500)' }}>
              {passportNotes.length} verified traveller advice collected
            </p>
          </div>

          <div
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
            style={{
              background: '#FFFFFF',
              border: '1px solid #EADECA',
              color: 'var(--ink-700)',
              boxShadow: '0 2px 6px rgba(15, 18, 48, 0.04)',
            }}
          >
            <CheckCircle size={13} color="var(--mint)" weight="fill" />
            <span className="font-medium">Offline Ready</span>
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
                className="px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all shrink-0"
                style={{
                  background: isSel ? 'var(--hanko)' : '#FFFFFF',
                  color: isSel ? '#FFFFFF' : 'var(--ink-700)',
                  border: isSel ? '1.5px solid var(--hanko)' : '1px solid #EADECA',
                  boxShadow: isSel ? '0 2px 8px rgba(232, 38, 76, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
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
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'var(--paper)', border: '1.5px solid var(--paper-edge)' }}
              >
                <BookOpen size={32} weight="light" color="var(--hanko)" />
              </div>
              <p className="text-sm max-w-xs font-body" style={{ color: 'var(--ink-500)' }}>
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
                  className="passport-sticker relative overflow-hidden transition-transform active:scale-95 cursor-pointer flex flex-col justify-between"
                  style={{
                    background: 'var(--paper)',
                    color: 'var(--ink-900)',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '2px solid var(--line)',
                    outline: '3px solid #FFFFFF',
                    boxShadow: '3px 3px 0 var(--line)',
                    transform: `rotate(${tilt}deg)`,
                  } as React.CSSProperties}
                  onClick={() => setSelectedNote(note)}
                >
                  <div>
                    {/* Header: Rarity & Audio Indicator */}
                    <div className="flex justify-between items-center mb-2">
                      <RarityTag rarity={note.rarity} size="sm" />
                      <div className="flex items-center gap-1.5">
                        {note.audio_url && (
                          <span
                            className="p-1 rounded-full bg-[#5EE2B533] text-[#167D59]"
                            title="Voice Note"
                          >
                            <SpeakerHigh size={12} weight="bold" />
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold text-black/40">
                          #{note.stamp}
                        </span>
                      </div>
                    </div>

                    <p
                      className="line-clamp-4 text-xs font-bold leading-relaxed text-[#14143A] mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {note.body}
                    </p>
                  </div>

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-3.5 text-left relative shadow-2xl"
            style={{
              background: 'var(--paper)',
              color: 'var(--ink-900)',
              border: '3px solid var(--line)',
              outline: '4px solid #FFFFFF',
              boxShadow: '6px 6px 0 var(--line)',
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
            <div className="py-1">
              <p
                className="text-base font-bold leading-relaxed text-[#14143A]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {selectedNote.body}
              </p>
            </div>

            {/* Voice Note Player (if voice memo attached) */}
            {selectedNote.audio_url && (
              <VoiceNotePlayer
                audioUrl={selectedNote.audio_url}
                durationSeconds={selectedNote.audio_duration || 6}
              />
            )}

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
