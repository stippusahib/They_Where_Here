/* ============================================================
 * THEY WERE HERE — Cinematic Reveal Modal
 * Location-locked note unsealing sequence with Hanko stamp impact.
 * ============================================================ */

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  SealCheck,
  ShareNetwork,
} from '@phosphor-icons/react';
import type { MapNote, PassportNote } from '@/contracts/types';
import { playUnlockChime, playButtonClick } from '@/lib/audio';
import { hapticSlam } from '@/lib/haptics';
import { savePassportNote } from '@/lib/storage';

interface RevealModalProps {
  note: MapNote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RevealModal({ note, isOpen, onClose }: RevealModalProps) {
  const [hasVoted, setHasVoted] = useState<'yes' | 'no' | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Fallback demo body text if note body not yet unlocked
  const noteBody =
    'Skip the crowded junction stall. Auntie’s sulaimani counter behind the banyan tree crushes fresh cardamom on order.';

  useEffect(() => {
    if (isOpen && note) {
      playUnlockChime(note.rarity);
      hapticSlam();

      // Launch subtle celebratory confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E8264C', '#FFC93C', '#5EE2B5', '#FFF3D6'],
      });

      // Save into offline passport
      const passportEntry: PassportNote = {
        id: note.id,
        body: noteBody,
        rarity: note.rarity,
        stamp: note.stamp,
        tone: note.tone,
        unlocked_at: new Date().toISOString(),
        unlock_count: note.unlock_count + 1,
        worth_yes: note.worth_yes,
        worth_no: note.worth_no,
        is_seed: note.is_seed,
      };
      savePassportNote(passportEntry);
    }
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const handleVote = (vote: 'yes' | 'no') => {
    playButtonClick();
    setHasVoted(vote);
  };

  const handleShare = async () => {
    playButtonClick();
    const shareText = `"${noteBody}" — Verified Visit unlocked on They Were Here`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verified Traveller Note',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 18, 48, 0.90)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-6 relative overflow-hidden animate-scale-up"
        style={{
          background: 'var(--color-paper)',
          color: 'var(--color-ink-900)',
          borderRadius: 'var(--radius-panel)',
          border: '2px solid var(--color-paper-edge)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Close reveal modal"
        >
          <X size={20} weight="bold" color="var(--color-ink-900)" />
        </button>

        {/* Hanko Verification Seal */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded"
            style={{
              background: 'rgba(232, 38, 76, 0.12)',
              border: '1.5px solid var(--color-hanko)',
              color: 'var(--color-hanko)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xs)',
              letterSpacing: '0.05em',
            }}
          >
            <SealCheck size={16} weight="fill" />
            <span>VERIFIED ON-SITE VISIT</span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,0,0,0.06)',
              color: 'var(--color-ink-700)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {note.rarity}
          </span>
        </div>

        {/* Revealed Note Content */}
        <div className="my-4">
          <p
            className="text-base leading-relaxed font-semibold"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-ink-900)',
            }}
          >
            "{noteBody}"
          </p>
        </div>

        {/* Passport Stamped Banner */}
        <div
          className="p-3 rounded-xl mb-5 flex items-center justify-between text-xs"
          style={{
            background: 'rgba(94, 226, 181, 0.2)',
            color: 'var(--color-ink-900)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span>Added to your offline Passport</span>
          <span className="font-bold text-emerald-800">+10 XP</span>
        </div>

        {/* Worth the Trip Voting Section */}
        <div className="pt-3 border-t border-black/10">
          <p
            className="text-xs font-bold text-center mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-ink-700)',
            }}
          >
            Was this advice worth the trip?
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handleVote('yes')}
              disabled={hasVoted !== null}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              style={{
                background:
                  hasVoted === 'yes'
                    ? 'var(--color-mint)'
                    : 'rgba(0,0,0,0.06)',
                color: hasVoted === 'yes' ? 'black' : 'var(--color-ink-900)',
                border: 'none',
                cursor: hasVoted !== null ? 'default' : 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <ThumbsUp size={16} weight={hasVoted === 'yes' ? 'fill' : 'bold'} />
              <span>Worth It</span>
            </button>

            <button
              onClick={() => handleVote('no')}
              disabled={hasVoted !== null}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              style={{
                background:
                  hasVoted === 'no'
                    ? 'rgba(0,0,0,0.2)'
                    : 'rgba(0,0,0,0.06)',
                color: 'var(--color-ink-900)',
                border: 'none',
                cursor: hasVoted !== null ? 'default' : 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <ThumbsDown size={16} weight={hasVoted === 'no' ? 'fill' : 'bold'} />
              <span>Not Really</span>
            </button>
          </div>
        </div>

        {/* Share Button */}
        <div className="mt-4">
          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-black/10"
            style={{
              background: 'transparent',
              color: 'var(--color-ink-700)',
              border: '1px solid rgba(0,0,0,0.15)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
            }}
          >
            <ShareNetwork size={16} weight="bold" />
            <span>{copiedNotification ? 'Copied to Clipboard!' : 'Share Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
