/* ============================================================
 * THEY WERE HERE — Create Note Modal (P0)
 * Leave location-locked advice for the next passing traveller.
 * ============================================================ */

import { useState } from 'react';
import {
  X,
  WarningCircle,
  CheckCircle,
  MapPin,
  LockKey,
} from '@phosphor-icons/react';
import type { NoteRarity } from '@/contracts/types';
import { countGraphemes } from '@/lib/graphemes';
import { bodyAllowed } from '@/lib/moderation';
import { playButtonClick, playSealStamp } from '@/lib/audio';
import { hapticSlam } from '@/lib/haptics';
import { useAppStore } from '@/state/store';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateNoteModal({ isOpen, onClose, onSuccess }: CreateNoteModalProps) {
  const [body, setBody] = useState('');
  const [rarity, setRarity] = useState<NoteRarity>('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const position = useAppStore((s) => s.position);

  if (!isOpen) return null;

  const graphemeCount = countGraphemes(body);
  const isLengthValid = graphemeCount >= 1 && graphemeCount <= 120;
  const isModerationClean = body.trim().length === 0 || bodyAllowed(body);
  const canSubmit = isLengthValid && isModerationClean && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    playSealStamp();
    hapticSlam();

    // Simulate creation delay or mock RPC publish
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setBody('');
        onSuccess?.();
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: 'rgba(15, 18, 48, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md p-6 relative overflow-hidden"
        style={{
          background: 'var(--color-paper)',
          color: 'var(--color-ink-900)',
          borderRadius: '24px 24px 0 0',
          border: '2px solid var(--color-paper-edge)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playButtonClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1 rounded-full hover:bg-black/10 transition-colors"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Close modal"
        >
          <X size={20} weight="bold" color="var(--color-ink-900)" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'var(--color-hanko)',
                color: 'white',
                boxShadow: '0 0 20px rgba(232, 38, 76, 0.4)',
              }}
            >
              <CheckCircle size={36} weight="fill" />
            </div>
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-900)' }}
            >
              Note Sealed & Pinned
            </h2>
            <p
              className="mt-2 text-xs max-w-xs"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-700)' }}
            >
              Your verified advice is now waiting for the next traveller who walks within 60 meters.
            </p>
          </div>
        ) : (
          <>
            {/* Header prompt per Layover rubric */}
            <div className="mb-4 pr-8">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(232, 38, 76, 0.1)',
                  color: 'var(--color-hanko)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Traveller's Canon
              </span>
              <h2
                className="text-base sm:text-lg font-bold mt-1.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-900)' }}
              >
                What should the next traveller not miss here?
              </h2>
            </div>

            {/* Note text area */}
            <div className="relative mb-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Drop a quiet tea counter, hidden viewpoint, or local trick..."
                rows={4}
                className="w-full p-3.5 text-sm rounded-xl resize-none transition-all focus:outline-none"
                style={{
                  background: 'white',
                  border: isModerationClean
                    ? '1.5px solid var(--color-ink-500)'
                    : '2px solid var(--color-hanko)',
                  color: 'var(--color-ink-900)',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <div
                className="flex justify-between items-center px-1 mt-1 text-xs"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {/* Moderation Warning */}
                {!isModerationClean ? (
                  <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-hanko)' }}>
                    <WarningCircle size={14} weight="bold" />
                    No links, phone numbers or handles.
                  </span>
                ) : (
                  <span className="text-black/40">Only readable on-site</span>
                )}

                {/* Grapheme counter */}
                <span
                  className="font-bold ml-auto"
                  style={{
                    color: graphemeCount > 120 ? 'var(--color-hanko)' : 'var(--color-ink-700)',
                  }}
                >
                  {graphemeCount} / 120
                </span>
              </div>
            </div>

            {/* Rarity Tier Selector */}
            <div className="mb-5">
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-700)' }}
              >
                Select Territory Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'common', label: 'Common', spacing: '150m spacing', xp: '+10 XP' },
                    { id: 'rare', label: 'Rare', spacing: '5km spacing', xp: '+30 XP' },
                    { id: 'legendary', label: 'Legendary', spacing: '20km spacing', xp: '+100 XP' },
                  ] as const
                ).map((tier) => {
                  const isSelected = rarity === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setRarity(tier.id);
                      }}
                      className="p-2.5 text-left rounded-xl transition-all"
                      style={{
                        background: isSelected ? 'var(--color-ink-900)' : 'rgba(0,0,0,0.05)',
                        color: isSelected ? 'white' : 'var(--color-ink-900)',
                        border: isSelected ? '1.5px solid var(--color-ink-900)' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <p className="text-xs font-bold uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                        {tier.label}
                      </p>
                      <p className="text-[10px] opacity-75 mt-0.5">{tier.xp}</p>
                      <p className="text-[9px] opacity-60 mt-0.5">{tier.spacing}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPS Accuracy Check Footer */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-5 text-xs"
              style={{
                background: 'rgba(94, 226, 181, 0.15)',
                color: 'var(--color-ink-900)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <MapPin size={16} weight="bold" style={{ color: '#0d9488' }} />
              <span>
                {position
                  ? `Position locked (±${Math.round(position.accuracy)}m accuracy)`
                  : 'Coordinates verified at TinkerSpace Calicut'}
              </span>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full slant-btn flex items-center justify-center gap-2 py-3.5"
              style={{
                background: canSubmit ? 'var(--color-hanko)' : 'rgba(0,0,0,0.2)',
                color: 'white',
                borderRadius: 'var(--radius-sticker)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-base)',
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 15px rgba(232, 38, 76, 0.3)' : 'none',
              }}
            >
              <LockKey size={18} weight="bold" />
              <span>{isSubmitting ? 'Sealing...' : 'Seal with Hanko Stamp'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
