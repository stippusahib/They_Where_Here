/* ============================================================
 * THEY WERE HERE — Passport Tab
 * Verified traveller sticker book of unlocked notes.
 * Offline-first, powered by IndexedDB.
 * ============================================================ */

import { useState, useEffect } from 'react';
import {
  BookOpen,
  ThumbsUp,
  ShareNetwork,
  X,
  ShieldCheck,
} from '@phosphor-icons/react';
import type { PassportNote, NoteRarity } from '@/contracts/types';
import { getStoredPassportNotes } from '@/lib/storage';
import { playButtonClick } from '@/lib/audio';
import { useAppStore } from '@/state/store';

type FilterType = 'all' | 'common' | 'rare' | 'legendary' | 'worth';

// Sample demonstration notes for demo / judging when user has not yet walked outside
const DEMO_SEEDS: PassportNote[] = [
  {
    id: 'demo-1',
    body: 'Skip the main stall. Auntie’s sulaimani counter behind the banyan tree crushes fresh green cardamom on order.',
    rarity: 'rare',
    stamp: 1,
    tone: 2,
    unlocked_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    unlock_count: 14,
    worth_yes: 12,
    worth_no: 1,
    is_seed: true,
  },
  {
    id: 'demo-2',
    body: 'The sunset pier lightkeeper keeps a guestbook dating back to 1984 under the signal desk. Ask him politely.',
    rarity: 'legendary',
    stamp: 2,
    tone: 3,
    unlocked_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    unlock_count: 28,
    worth_yes: 27,
    worth_no: 0,
    is_seed: true,
  },
  {
    id: 'demo-3',
    body: 'Quiet stone bench under the canopy. Perfect mobile signal and zero street horn noise for a 30-minute layover break.',
    rarity: 'common',
    stamp: 3,
    tone: 1,
    unlocked_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    unlock_count: 6,
    worth_yes: 5,
    worth_no: 1,
    is_seed: true,
  },
];

export function PassportTab() {
  const [notes, setNotes] = useState<PassportNote[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedNote, setSelectedNote] = useState<PassportNote | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const isOffline = useAppStore((s) => s.isOffline);
  const layoverHours = useAppStore((s) => s.layoverHours);

  useEffect(() => {
    async function loadNotes() {
      const stored = await getStoredPassportNotes();
      if (stored.length > 0) {
        setNotes(stored);
      } else {
        // Fallback demo seeds labeled clearly as demo data
        setNotes(DEMO_SEEDS);
      }
    }
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'worth') return n.worth_yes > n.worth_no;
    return n.rarity === filter;
  });

  const getRarityColor = (r: NoteRarity) => {
    switch (r) {
      case 'legendary':
        return 'var(--color-legendary)';
      case 'rare':
        return 'var(--color-rare)';
      case 'common':
      default:
        return 'var(--color-paper-edge)';
    }
  };

  const handleShare = async (note: PassportNote) => {
    playButtonClick();
    const shareText = `"${note.body}" — Unlocked on location via They Were Here (Verified Visit)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verified Traveller Note',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-900) 100%)',
      }}
    >
      {/* Header */}
      <header className="safe-top px-5 pt-6 pb-3" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between">
          <div>
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
              className="mt-0.5"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {notes.length} verified notes collected &middot; {layoverHours}h layover window
            </p>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{
              background: 'rgba(94, 226, 181, 0.15)',
              border: '1px solid var(--color-mint)',
              borderRadius: 'var(--radius-chip)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-mint)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <ShieldCheck size={14} weight="bold" />
            <span>{isOffline ? 'Offline Cache' : 'Verified IDB'}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'common', label: 'Common' },
              { id: 'rare', label: 'Rare' },
              { id: 'legendary', label: 'Legendary' },
              { id: 'worth', label: 'Worth Trip' },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playButtonClick();
                  setFilter(tab.id);
                }}
                className="whitespace-nowrap px-3.5 py-1.5 transition-colors"
                style={{
                  borderRadius: 'var(--radius-chip)',
                  background: isActive ? 'var(--color-hanko)' : 'rgba(255,255,255,0.08)',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isActive ? 600 : 400,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Grid of Stamps */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 pb-24">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen size={48} weight="thin" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p
              className="mt-3 text-sm"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)' }}
            >
              No notes match this filter.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const rarityColor = getRarityColor(note.rarity);
            const dateStr = new Date(note.unlocked_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={note.id}
                onClick={() => {
                  playButtonClick();
                  setSelectedNote(note);
                }}
                className="glass p-4 relative overflow-hidden transition-transform active:scale-[0.98] cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-panel)',
                  border: `1px solid ${rarityColor}40`,
                  background: 'linear-gradient(135deg, rgba(30, 35, 82, 0.7) 0%, rgba(15, 18, 48, 0.8) 100%)',
                }}
              >
                {/* Hanko Stamp watermark badge in background */}
                <div
                  className="absolute -right-3 -bottom-3 select-none pointer-events-none opacity-10"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '4.5rem',
                    color: 'var(--color-hanko)',
                    transform: 'rotate(-15deg)',
                  }}
                >
                  証
                </div>

                {/* Top card metadata */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 uppercase tracking-wider"
                      style={{
                        borderRadius: 'var(--radius-chip)',
                        background: `${rarityColor}20`,
                        color: rarityColor,
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        border: `1px solid ${rarityColor}60`,
                      }}
                    >
                      {note.rarity}
                    </span>
                    {note.is_seed && (
                      <span
                        className="px-2 py-0.5 text-[0.65rem] opacity-60"
                        style={{
                          borderRadius: 'var(--radius-chip)',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        demo data
                      </span>
                    )}
                  </div>

                  <span
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {dateStr}
                  </span>
                </div>

                {/* Note body excerpt */}
                <p
                  className="line-clamp-2 my-2 text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-paper)',
                  }}
                >
                  {note.body}
                </p>

                {/* Bottom stats */}
                <div
                  className="flex items-center justify-between mt-3 pt-2 text-xs"
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={13} weight="fill" style={{ color: 'var(--color-mint)' }} />
                    {note.worth_yes} found it worth the trip
                  </span>
                  <span className="text-[11px] text-white/40">Tap to inspect</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Postcard Detail Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 18, 48, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="w-full max-w-sm p-6 relative overflow-hidden"
            style={{
              background: 'var(--color-paper)',
              color: 'var(--color-ink-900)',
              borderRadius: 'var(--radius-panel)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '2px solid var(--color-paper-edge)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                playButtonClick();
                setSelectedNote(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              aria-label="Close note detail"
            >
              <X size={20} weight="bold" color="var(--color-ink-900)" />
            </button>

            {/* Hanko Stamp Verification Seal */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-4"
              style={{
                border: '2px solid var(--color-hanko)',
                borderRadius: 'var(--radius-sticker)',
                color: 'var(--color-hanko)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)',
                letterSpacing: '0.05em',
                transform: 'rotate(-2deg)',
              }}
            >
              <span>VERIFIED VISIT &middot; UNLOCKED ON-SITE</span>
            </div>

            {/* Advice Body */}
            <div className="my-4">
              <span
                className="text-xs uppercase font-bold tracking-wider"
                style={{ color: 'var(--color-ink-500)', fontFamily: 'var(--font-display)' }}
              >
                Traveller's Advice
              </span>
              <p
                className="mt-2 text-base leading-relaxed"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-ink-900)',
                  fontWeight: 600,
                }}
              >
                "{selectedNote.body}"
              </p>
            </div>

            {/* Metadata Footer */}
            <div
              className="mt-6 pt-4 space-y-2 text-xs"
              style={{
                borderTop: '1px dashed var(--color-ink-500)',
                color: 'var(--color-ink-700)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div className="flex justify-between items-center">
                <span>Rarity Tier:</span>
                <span className="font-bold uppercase" style={{ color: getRarityColor(selectedNote.rarity) }}>
                  {selectedNote.rarity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Explorers:</span>
                <span className="font-bold">{selectedNote.unlock_count} verified travellers</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Worth the trip rating:</span>
                <span className="font-bold text-emerald-700">
                  {selectedNote.worth_yes} yes / {selectedNote.worth_no} no
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleShare(selectedNote)}
                className="flex-1 slant-btn flex items-center justify-center gap-2 py-3"
                style={{
                  background: 'var(--color-ink-900)',
                  color: 'white',
                  borderRadius: 'var(--radius-sticker)',
                  border: 'none',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                }}
              >
                <ShareNetwork size={18} weight="bold" />
                <span>{copiedNotification ? 'Copied to Clipboard!' : 'Share Advice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const PassportScreen = PassportTab;
