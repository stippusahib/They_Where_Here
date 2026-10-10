/* ============================================================
 * THEY WERE HERE — Leave A Note Modal (Light Theme & Voice)
 * 3-step creation flow:
 * Step 1: Place & Tier availability
 * Step 2: Write advice + Voice Note recording
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
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';
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

import { MIN_NOTE_CHARS } from '@/contracts/types';

export function CreateNoteModal() {
  const isCreateNoteOpen = useAppStore((s) => s.isCreateNoteOpen);
  const setIsCreateNoteOpen = useAppStore((s) => s.setIsCreateNoteOpen);
  const position = useAppStore((s) => s.position);
  const profile = useAppStore((s) => s.profile);
  const addNoteLocally = useAppStore((s) => s.addNoteLocally);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const arAndVoiceEnabled = useAppStore((s) => s.config.ar_and_voice_enabled ?? true);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rarity, setRarity] = useState<NoteRarity>('common');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedStamp, setSelectedStamp] = useState(1);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCreateNoteOpen) return null;

  const maxChars = rarity === 'legendary' ? 480 : rarity === 'rare' ? 240 : 120;
  const currentChars = countGraphemes(body);
  const isModerated = bodyAllowed(body);
  const isBodyValid =
    (currentChars >= MIN_NOTE_CHARS || (arAndVoiceEnabled && voiceAudioUrl !== null)) &&
    currentChars <= maxChars &&
    isModerated;

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
      title: title.trim() || (voiceAudioUrl ? 'Voice Travel Tip' : 'Traveller Advice'),
      body: body.trim() || 'A traveller left an audio recommendation for you here.',
      author_handle: profile.handle,
      audio_url: voiceAudioUrl ?? undefined,
      audio_duration: voiceDuration || undefined,
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
        setVoiceAudioUrl(null);
        setVoiceDuration(0);
        setIsCreateNoteOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm safe-top safe-bottom animate-fade-in"
      style={{ zIndex: 'var(--z-onboarding, 90)' }}
      onClick={() => setIsCreateNoteOpen(false)}
    >
      <div
        className="w-full max-w-md p-6 flex flex-col gap-4 text-left relative max-h-[90dvh] overflow-y-auto"
        style={{
          borderRadius: 'var(--radius-panel)',
          background: '#FFFFFF',
          border: '1.5px solid var(--paper-edge)',
          boxShadow: '0 20px 50px rgba(15, 18, 48, 0.16)',
          color: 'var(--ink-900)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Step Indicator */}
        <div className="flex justify-between items-center pb-2 border-b border-[#EADECA]">
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                color: 'var(--ink-900)',
              }}
            >
              Leave A Note
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--ink-500)',
              }}
            >
              Step {step} of 3 • {step === 1 ? 'Tier & Place' : step === 2 ? 'Advice & Voice' : 'Seal'}
            </span>
          </div>

          <button
            onClick={() => setIsCreateNoteOpen(false)}
            className="p-1.5 rounded-full text-[var(--ink-500)] hover:text-[var(--ink-900)] cursor-pointer"
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
              className="p-3.5 rounded-xl flex items-center gap-3"
              style={{ background: 'var(--paper)', border: '1px solid var(--paper-edge)' }}
            >
              <MapPin size={24} weight="fill" color="var(--hanko)" />
              <div>
                <span
                  className="block font-display"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-900)' }}
                >
                  GPS Position Locked
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--ink-500)',
                  }}
                >
                  Accuracy ±{Math.round(position?.accuracy ?? 10)}m • Ready to pin
                </span>
              </div>
            </div>

            {/* Choose Tier */}
            <div>
              <span
                className="block mb-2 font-display text-xs"
                style={{ color: 'var(--ink-700)' }}
              >
                Choose Rarity Tier
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {(['common', 'rare', 'legendary'] as NoteRarity[]).map((tier) => {
                  const isSel = rarity === tier;
                  const tierColor =
                    tier === 'legendary'
                      ? 'var(--legendary)'
                      : tier === 'rare'
                      ? 'var(--rare)'
                      : 'var(--common)';
                  const charLimit = tier === 'legendary' ? 480 : tier === 'rare' ? 240 : 120;

                  return (
                    <button
                      key={tier}
                      onClick={() => setRarity(tier)}
                      className="p-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all"
                      style={{
                        background: isSel ? '#FFF6E5' : '#FAFAF8',
                        border: isSel ? `2px solid var(--ink-900)` : '1px solid #EADECA',
                        boxShadow: isSel ? '0 4px 12px rgba(15, 18, 48, 0.08)' : 'none',
                      }}
                    >
                      <Sparkle
                        size={20}
                        weight={isSel ? 'fill' : 'regular'}
                        color={tier === 'common' ? '#E8C98A' : tierColor}
                      />
                      <span
                        className="font-display uppercase mt-1 text-xs"
                        style={{ color: 'var(--ink-900)' }}
                      >
                        {tier}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--ink-500)',
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
              className="slant-btn slant-btn--primary w-full py-3.5 mt-2 text-center cursor-pointer shadow-md"
            >
              Continue to Write & Record
            </button>
          </div>
        )}

        {/* STEP 2: Write Advice & Voice Recording */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5 animate-fade-in">
            <div>
              <label
                className="block mb-1 font-display text-xs"
                style={{ color: 'var(--ink-700)' }}
              >
                What should the next traveller not miss here?
              </label>
              <input
                type="text"
                placeholder="Title e.g. Midnight Sulaimani Tip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                className="w-full p-2.5 rounded-lg text-sm focus:outline-none transition-all"
                style={{
                  background: '#FAF8F4',
                  border: '1.5px solid #EADECA',
                  color: 'var(--ink-900)',
                }}
              />
            </div>

            <div>
              <textarea
                placeholder="Write your advice clearly for the next stranger passing through with dead time..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg text-sm focus:outline-none resize-none transition-all"
                style={{
                  background: '#FAF8F4',
                  border: '1.5px solid #EADECA',
                  color: 'var(--ink-900)',
                }}
              />
              <div className="flex justify-between items-center text-xs mt-1">
                <span
                  style={{
                    color: !isModerated
                      ? 'var(--hanko)'
                      : currentChars > maxChars
                      ? 'var(--warn)'
                      : 'var(--ink-500)',
                  }}
                >
                  {!isModerated
                    ? 'Note contains blocked words. Keep it kind.'
                    : `${currentChars} / ${maxChars} chars`}
                </span>
                <span style={{ color: 'var(--ink-300)' }}>
                  {arAndVoiceEnabled
                    ? `Min ${MIN_NOTE_CHARS} chars or voice note`
                    : `Min ${MIN_NOTE_CHARS} characters`}
                </span>
              </div>
            </div>

            {/* Voice Note Feature (guarded by config kill-switch) */}
            {arAndVoiceEnabled && (
              <VoiceNoteRecorder
                onAudioRecorded={(url, dur) => {
                  setVoiceAudioUrl(url);
                  setVoiceDuration(dur);
                }}
                onAudioCleared={() => {
                  setVoiceAudioUrl(null);
                  setVoiceDuration(0);
                }}
                initialAudioUrl={voiceAudioUrl ?? undefined}
              />
            )}

            {/* Stamp selection */}
            <div>
              <span className="block mb-1.5 font-display text-xs" style={{ color: 'var(--ink-700)' }}>
                Pick A Stamp Symbol
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {STAMPS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedStamp(id)}
                    className="p-2 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                    style={{
                      background: selectedStamp === id ? 'var(--hanko)' : '#FAF8F4',
                      color: selectedStamp === id ? '#FFFFFF' : 'var(--ink-700)',
                      border: selectedStamp === id ? 'none' : '1px solid #EADECA',
                    }}
                  >
                    <Icon size={18} weight={selectedStamp === id ? 'fill' : 'regular'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-lg text-xs font-display cursor-pointer"
                style={{ background: '#FAF8F4', border: '1px solid #EADECA', color: 'var(--ink-700)' }}
              >
                Back
              </button>
              <button
                type="button"
                disabled={!isBodyValid}
                onClick={() => setStep(3)}
                className="slant-btn slant-btn--primary flex-1 py-3 text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
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
                <CheckCircle size={56} weight="fill" color="var(--mint)" />
                <h3 className="font-display text-lg" style={{ color: 'var(--ink-900)' }}>
                  Sealed & Pinned!
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-500)' }}>
                  It's live on the map for the next traveller to find.
                </p>
              </div>
            ) : (
              <>
                {/* Preview card */}
                <div
                  className="p-4 rounded-xl text-left flex flex-col gap-2.5"
                  style={{
                    background: 'var(--paper)',
                    color: 'var(--ink-900)',
                    border: '2px solid var(--ink-900)',
                    boxShadow: '4px 4px 0 var(--line)',
                  }}
                >
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[#EADECA]">
                    <span className="font-display uppercase text-[10px] text-red-600 font-bold">
                      {rarity} SEAL #{selectedStamp}
                    </span>
                    <span className="text-[10px] text-black/60 font-mono">
                      @{profile?.handle}
                    </span>
                  </div>
                  <h4 className="font-display text-sm">{title || (voiceAudioUrl ? 'Voice Travel Tip' : 'Travel Advice')}</h4>
                  <p className="text-xs leading-relaxed">{body || '(Voice audio note attached below)'}</p>

                  {voiceAudioUrl && (
                    <VoiceNotePlayer
                      audioUrl={voiceAudioUrl}
                      durationSeconds={voiceDuration || 6}
                      compact
                    />
                  )}
                </div>

                <div className="text-xs" style={{ color: 'var(--ink-500)' }}>
                  Will appear on the map at your current physical location.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-lg text-xs font-display cursor-pointer"
                    style={{ background: '#FAF8F4', border: '1px solid #EADECA', color: 'var(--ink-700)' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
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
