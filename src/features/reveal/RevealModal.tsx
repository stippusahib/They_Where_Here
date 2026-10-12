/* ============================================================
 * THEY WERE HERE — Cinematic Reveal Modal (P0)
 * 60fps cinematic sequence: Slash overlay -> NOTE FOUND slam ->
 * die-cut NoteCard -> "Worth the trip?" vote -> Passport.
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, X } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/state/store';
import { vibrateSuccess } from '@/lib/haptics';
import { playUnlockChime, playButtonClick } from '@/lib/audio';
import { SlashOverlay } from './SlashOverlay';
import { RevealHeading } from './RevealHeading';
import { NoteCard } from './NoteCard';
import { PaperPlaneCanvas } from '@/3d/PaperPlaneCanvas';

export const RevealModal: React.FC = () => {
  const activeRevealNote = useAppStore((s) => s.activeRevealNote);
  const setActiveRevealNote = useAppStore((s) => s.setActiveRevealNote);
  const unlockNoteLocally = useAppStore((s) => s.unlockNoteLocally);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (activeRevealNote) {
      setAnimating(true);
      if (hapticsEnabled) vibrateSuccess();
      playUnlockChime(activeRevealNote.rarity);
    } else {
      setAnimating(false);
      setVote(null);
      setSaved(false);
    }
  }, [activeRevealNote, hapticsEnabled]);

  if (!activeRevealNote) return null;

  const handleVote = (choice: 'yes' | 'no') => {
    playButtonClick();
    setVote(choice);
    if (hapticsEnabled) vibrateSuccess();
  };

  const handleSaveToPassport = () => {
    playButtonClick();
    if (activeRevealNote.unlocked) {
      setActiveRevealNote(null);
      return;
    }
    unlockNoteLocally(activeRevealNote.id);
    setSaved(true);
    if (hapticsEnabled) vibrateSuccess();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E8264C', '#FFC93C', '#35B6FF', '#5EE2B5'],
      });
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      setActiveRevealNote(null);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 safe-top safe-bottom"
      style={{
        zIndex: 'var(--z-reveal)',
        background: 'rgba(15, 18, 48, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Anime Slash Animation */}
      <SlashOverlay rarity={activeRevealNote.rarity} playing={animating} />

      <div className="relative w-full max-w-sm flex flex-col items-center z-10">
        {/* Close button */}
        <button
          onClick={() => setActiveRevealNote(null)}
          className="absolute -top-12 right-0 glass flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            color: 'var(--white)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="Close reveal"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Slam Heading */}
        <RevealHeading
          rarity={activeRevealNote.rarity}
          playing={animating}
          isAlreadyOpened={Boolean(activeRevealNote.unlocked)}
        />

        {/* Demo data badge */}
        {activeRevealNote.is_seed && (
          <span
            className="mb-2 px-2 py-0.5"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-chip)',
              color: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            demo data
          </span>
        )}

        {/* 3D Paper Plane Mascot Cameo on Legendary reveal (Part 11) */}
        {activeRevealNote.rarity === 'legendary' && (
          <div className="w-36 h-20 -mb-2 z-20 pointer-events-none">
            <PaperPlaneCanvas speed={1.5} />
          </div>
        )}

        {/* Die-cut Sticker Note Card */}
        <NoteCard
          title={activeRevealNote.title}
          isAlreadyOpened={Boolean(activeRevealNote.unlocked)}
          body={activeRevealNote.body}
          rarity={activeRevealNote.rarity}
          stamp={`#${activeRevealNote.stamp}`}
          unlockCount={activeRevealNote.unlock_count ?? 1}
          audioUrl={activeRevealNote.audio_url}
          audioDuration={activeRevealNote.audio_duration}
        />

        {/* Voting & Actions */}
        <div className="w-full mt-5 flex flex-col gap-3">
          {/* Worth the trip? */}
          <div
            className="hud-chip flex items-center justify-between w-full"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-panel)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-100)',
              }}
            >
              Worth the trip?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleVote('yes')}
                className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-chip)',
                  background:
                    vote === 'yes'
                      ? 'var(--mint)'
                      : 'rgba(255, 255, 255, 0.12)',
                  color: vote === 'yes' ? 'var(--ink-900)' : 'var(--white)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <ThumbsUp size={14} weight="bold" />
                <span>Yes ({activeRevealNote.worth_yes + (vote === 'yes' ? 1 : 0)})</span>
              </button>
              <button
                onClick={() => handleVote('no')}
                className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                style={{
                  borderRadius: 'var(--radius-chip)',
                  background:
                    vote === 'no'
                      ? 'var(--warn)'
                      : 'rgba(255, 255, 255, 0.12)',
                  color: vote === 'no' ? 'var(--ink-900)' : 'var(--white)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <ThumbsDown size={14} weight="bold" />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Collect Button */}
          <button
            onClick={handleSaveToPassport}
            disabled={saved}
            className="slant-btn slant-btn--primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              fontSize: 'var(--text-base)',
              minHeight: 48,
              opacity: saved ? 0.7 : 1,
            }}
          >
            {saved ? (
              <>
                <CheckCircle size={20} weight="fill" />
                <span>Stamped to Passport!</span>
              </>
            ) : activeRevealNote.unlocked ? (
              <>
                <CheckCircle size={20} weight="fill" />
                <span>In Your Passport · Keep Exploring</span>
              </>
            ) : (
              <span>Collect & Stamp to Passport</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
