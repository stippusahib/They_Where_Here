/* ============================================================
 * THEY WERE HERE — Leave A Note Modal (P0)
 * 3-step creation flow:
 * Step 1: Place & Tier availability
 * Step 2: Write advice (Prompt: "What should the next traveller not miss here?")
 * Step 3: Seal animation & map pinning
 * ============================================================ */

import { useState } from 'react';
import {
  X,
  MapPin,
  Sparkle,
  PaperPlaneTilt,
  CheckCircle,
  Stamp,
  Smiley,
  Coffee,
  ForkKnife,
  Train,
  Sun,
  Moon,
  Compass,
  Heart,
  Tree,
  Umbrella,
  Camera,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { countGraphemes } from '@/lib/graphemes';
import { bodyAllowed } from '@/lib/moderation';
import { vibrateSuccess } from '@/lib/haptics';
import type { NoteRarity } from '@/contracts/types';
import type { ExtendedNote } from '@/lib/seedNotes';

const STAMPS = [
  { id: 1, icon: Coffee, label: 'Chai' },
  { id: 2, icon: ForkKnife, label: 'Food' },
  { id: 3, icon: Train, label: 'Transit' },
  { id: 4, icon: Sun, label: 'Day' },
  { id: 5, icon: Moon, label: 'Night' },
  { id: 6, icon: Compass, label: 'Route' },
  { id: 7, icon: Heart, label: 'Gem' },
  { id: 8, icon: Tree, label: 'Nature' },
  { id: 9, icon: Umbrella, label: 'Weather' },
  { id: 10, icon: Camera, label: 'View' },
  { id: 11, icon: Smiley, label: 'Secret' },
  { id: 12, icon: Stamp, label: 'Tip' },
];

export function CreateNoteModal() {
  const isCreateNoteOpen = useAppStore((s) => s.isCreateNoteOpen);
  const setIsCreateNoteOpen = useAppStore((s) => s.setIsCreateNoteOpen);
  const position = useAppStore((s) => s.position);
  const profile = useAppStore((s) => s.profile);
  const addNoteLocally = useAppStore((s) => s.addNoteLocally);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rarity, setRarity] = useState<NoteRarity>('common');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedStamp, setSelectedStamp] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCreateNoteOpen) return null;

  const maxChars = rarity === 'legendary' ? 480 : rarity === 'rare' ? 240 : 120;
  const currentChars = countGraphemes(body);
  const isModerated = bodyAllowed(body);
  const isBodyValid = currentChars > 10 && currentChars <= maxChars && isModerated;

  const handleSeal = () => {
    if (!position || !profile) return;
    setIsSubmitting(true);

    if (hapticsEnabled) vibrateSuccess();

    const newNote: ExtendedNote = {
      id: `user-note-${Date.now()}`,
      lat: position.lat,
      lng: position.lng,
      rarity,
      stamp: selectedStamp,
      tone: 1,
      unlock_count: 0,
      worth_yes: 0,
      worth_no: 0,
      is_seed: false,
      unlocked: true,
      title: title.trim() || 'Traveller Advice',
      body: body.trim(),
      author_handle: profile.handle,
    };

    setTimeout(() => {
      addNoteLocally(newNote);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        setTitle('');
        setBody('');
        setIsCreateNoteOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md safe-top safe-bottom animate-fade-in"
      onClick={() => setIsCreateNoteOpen(false)}
    >
      <div
        className="glass w-full max-w-sm p-6 flex flex-col gap-4 text-left relative"
        style={{
          borderRadius: 'var(--radius-panel)',
          background: 'var(--glass-bg)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Step Indicator */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-base)',
                color: 'white',
              }}
            >
              Leave A Note
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Step {step} of 3 • {step === 1 ? 'Tier & Place' : step === 2 ? 'Advice' : 'Seal'}
            </span>
          </div>

          <button
            onClick={() => setIsCreateNoteOpen(false)}
            className="p-1 rounded-full text-white/60 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* STEP 1: Place & Tier Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Location chip */}
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <MapPin size={24} weight="fill" color="var(--color-hanko)" />
              <div>
                <span
                  className="block font-display text-white"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  GPS Position Locked
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Accuracy ±{Math.round(position?.accuracy ?? 10)}m • Outdoors
                </span>
              </div>
            </div>

            {/* Choose Tier */}
            <div>
              <span
                className="block mb-2 font-display text-white text-xs"
              >
                Choose Rarity Tier
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['common', 'rare', 'legendary'] as NoteRarity[]).map((tier) => {
                  const isSel = rarity === tier;
                  const tierColor =
                    tier === 'legendary'
                      ? 'var(--color-legendary)'
                      : tier === 'rare'
                      ? 'var(--color-rare)'
                      : 'var(--color-common)';
                  const charLimit = tier === 'legendary' ? 480 : tier === 'rare' ? 240 : 120;

                  return (
                    <button
                      key={tier}
                      onClick={() => setRarity(tier)}
                      className="p-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all"
                      style={{
                        background: isSel ? `${tierColor}22` : 'rgba(255, 255, 255, 0.04)',
                        border: isSel ? `1.5px solid ${tierColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Sparkle
                        size={18}
                        weight={isSel ? 'fill' : 'regular'}
                        color={tierColor}
                      />
                      <span
                        className="font-display uppercase mt-1"
                        style={{ fontSize: '11px', color: tierColor }}
                      >
                        {tier}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {charLimit} chars
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="slant-btn slant-btn--primary w-full py-3.5 mt-2 text-center cursor-pointer"
            >
              Continue to Write
            </button>
          </div>
        )}

        {/* STEP 2: Write Advice */}
        {step === 2 && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div>
              <label
                className="block mb-1 font-display text-white text-xs"
              >
                What should the next traveller not miss here?
              </label>
              <input
                type="text"
                placeholder="Title e.g. Midnight Sulaimani Tip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                className="w-full p-2.5 rounded-lg bg-black/40 text-white border border-white/20 text-sm focus:outline-none focus:border-[#35B6FF]"
              />
            </div>

            <div>
              <textarea
                placeholder="Write your advice clearly for the next stranger passing through with dead time..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-lg bg-black/40 text-white border border-white/20 text-sm focus:outline-none focus:border-[#35B6FF] resize-none"
              />
              <div className="flex justify-between items-center text-xs mt-1">
                <span
                  style={{
                    color: !isModerated
                      ? 'var(--color-hanko)'
                      : currentChars > maxChars
                      ? 'var(--color-warn)'
                      : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {!isModerated
                    ? 'Note contains blocked words. Keep it kind.'
                    : `${currentChars} / ${maxChars} chars`}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                  Min 10 chars
                </span>
              </div>
            </div>

            {/* Stamp selection */}
            <div>
              <span className="block mb-1.5 font-display text-white text-xs">
                Pick A Stamp Symbol
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {STAMPS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedStamp(id)}
                    className="p-2 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                    style={{
                      background: selectedStamp === id ? 'var(--color-hanko)' : 'rgba(255, 255, 255, 0.08)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    <Icon size={18} weight={selectedStamp === id ? 'fill' : 'regular'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-lg bg-white/10 text-white text-xs font-display cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={!isBodyValid}
                onClick={() => setStep(3)}
                className="slant-btn slant-btn--primary flex-1 py-3 text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Preview & Seal
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Seal & Confirm */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-fade-in text-center">
            {isSuccess ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <CheckCircle size={56} weight="fill" color="var(--color-mint)" />
                <h3 className="font-display text-white text-lg">
                  Sealed & Pinned!
                </h3>
                <p className="text-white/70 text-xs">
                  It's live on the map for the next traveller to find.
                </p>
              </div>
            ) : (
              <>
                {/* Preview card */}
                <div
                  className="p-4 rounded-xl text-left"
                  style={{
                    background: 'var(--color-paper)',
                    color: 'var(--color-ink-900)',
                    border: '2px solid white',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex justify-between items-center text-xs pb-1 mb-2 border-b border-[#E0CFAB]">
                    <span className="font-display uppercase text-[10px] text-red-600">
                      {rarity} SEAL #{selectedStamp}
                    </span>
                    <span className="text-[10px] text-black/60">
                      @{profile?.handle}
                    </span>
                  </div>
                  <h4 className="font-display text-sm mb-1">{title || 'Travel Advice'}</h4>
                  <p className="text-xs text-black/80">{body}</p>
                </div>

                <div className="text-xs text-white/60">
                  Will appear on the map at your current physical location.
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-lg bg-white/10 text-white text-xs font-display cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleSeal}
                    className="slant-btn slant-btn--primary flex-1 py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <PaperPlaneTilt size={18} weight="fill" />
                    <span>{isSubmitting ? 'Sealing...' : 'Seal & Pin Note'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
