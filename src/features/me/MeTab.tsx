/* ============================================================
 * THEY WERE HERE — Me Tab (P0)
 * Traveller Passport Profile, Day/Night Theme Switcher,
 * Sound/Haptic toggles, Safety Sheet, and Stage Mode for judges.
 * ============================================================ */

import { useState } from 'react';
import {
  UserCircle,
  SpeakerHigh,
  MusicNote,
  Vibrate,
  ShieldCheck,
  Compass,
  ArrowClockwise,
  Check,
  Sun,
  Moon,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { APP_NAME } from '@/contracts/types';
import { VENUE_CENTER } from '@/config/venue';

const HANDLES = [
  'swift_fox',
  'calm_otter',
  'wise_crane',
  'brave_wolf',
  'stellar_hawk',
  'gentle_deer',
  'clever_bear',
];

export function MeTab() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const toggleMusic = useAppStore((s) => s.toggleMusic);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const isSimulated = useAppStore((s) => s.isSimulated);
  const setSimulated = useAppStore((s) => s.setSimulated);
  const setPosition = useAppStore((s) => s.setPosition);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const activeTheme = useAppStore((s) => s.activeTheme);

  const [logoTaps, setLogoTaps] = useState(0);
  const [showStageControls, setShowStageControls] = useState(isSimulated);
  const [showSafetySheet, setShowSafetySheet] = useState(false);

  // Hidden 5 taps on logo activates Stage Mode for judges
  const handleLogoTap = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next >= 5) {
      setShowStageControls(true);
      setSimulated(true);
    }
  };

  const handleRerollHandle = () => {
    if (!profile) return;
    const randomHandle = HANDLES[Math.floor(Math.random() * HANDLES.length)] || 'swift_fox';
    setProfile({
      ...profile,
      handle: randomHandle,
      rerolls_used: (profile.rerolls_used || 0) + 1,
    });
  };

  const handleTeleportVenue = () => {
    setPosition({
      lat: VENUE_CENTER.lat,
      lng: VENUE_CENTER.lng,
      accuracy: 10,
      heading: 0,
      timestamp: Date.now(),
    });
  };

  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{
        background: `linear-gradient(
          180deg,
          var(--sky-a) 0%,
          var(--sky-b) 40%,
          var(--ink-900) 100%
        )`,
      }}
    >
      <div className="safe-top px-5 pt-6 pb-28 max-w-md mx-auto w-full flex flex-col gap-5">
        {/* Traveller Passport ID Card (Photomontage Stationery Aesthetic) */}
        <div
          className="p-5 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-xl"
          style={{
            background: 'var(--sheet-bg)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Subtle Vintage Postmark / Seal */}
          <div
            className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border-2 border-dashed pointer-events-none opacity-15 flex items-center justify-center"
            style={{ borderColor: 'var(--accent)', transform: 'rotate(-15deg)' }}
          >
            <span className="text-[10px] font-display uppercase tracking-widest text-center">
              PASSPORT • VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 16px rgba(210, 63, 90, 0.45)',
                border: '2px solid #fff',
              }}
            >
              <UserCircle size={40} color="white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-display text-white"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  @{profile?.handle ?? 'traveller'}
                </h2>
                <button
                  onClick={handleRerollHandle}
                  className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title="Reroll traveller handle"
                  aria-label="Reroll traveller handle"
                >
                  <ArrowClockwise size={14} />
                </button>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Anonymous Traveller • Rank #2 Explorer
              </p>
            </div>
          </div>

          <div className="text-right relative z-10">
            <span
              className="font-display text-xl text-[var(--legendary)] block"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {profile?.xp ?? 0}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">XP gained</span>
          </div>
        </div>

        {/* Day / Night Theme Selector (Step 7 requirement) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-white/60 px-1 font-display">
            Map Atmosphere & Appearance
          </span>

          <div
            className="p-1.5 rounded-2xl flex items-center gap-1.5"
            style={{
              background: 'var(--sheet-bg)',
              border: '1px solid var(--sheet-border)',
            }}
          >
            {[
              { id: 'auto', label: 'Auto (Sun)', icon: Clock, desc: 'Follows sunrise & sunset' },
              { id: 'day', label: 'Day', icon: Sun, desc: 'Warm paper map for daylight' },
              { id: 'night', label: 'Night', icon: Moon, desc: 'Deep ink glowing radar' },
            ].map((t) => {
              const isSelected = themeMode === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeMode(t.id as 'auto' | 'day' | 'night')}
                  className="flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  style={{
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    boxShadow: isSelected ? '0 2px 8px rgba(210,63,90,0.3)' : 'none',
                  }}
                >
                  <Icon size={14} weight={isSelected ? 'bold' : 'regular'} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-white/50 px-2">
            Active theme: <strong className="text-white capitalize">{activeTheme}</strong> mode
          </div>
        </div>

        {/* Audio & Haptic Immersion */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-white/60 px-1 font-display">
            Audio & Feedback
          </span>

          <div
            className="rounded-2xl overflow-hidden divide-y divide-white/10"
            style={{
              background: 'var(--sheet-bg)',
              border: '1px solid var(--sheet-border)',
            }}
          >
            {/* Sound Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <SpeakerHigh size={20} color="var(--reach)" />
                <span className="text-sm font-medium">Sound effects</span>
              </div>
              <button
                onClick={toggleSound}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: soundEnabled ? 'var(--mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Toggle sound effects"
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                  style={{
                    left: soundEnabled ? 22 : 2,
                  }}
                />
              </button>
            </div>

            {/* Music Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <MusicNote size={20} color="var(--reach)" />
                <span className="text-sm font-medium">Ambient music</span>
              </div>
              <button
                onClick={toggleMusic}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: musicEnabled ? 'var(--mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Toggle ambient music"
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                  style={{
                    left: musicEnabled ? 22 : 2,
                  }}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Vibrate size={20} color="var(--reach)" />
                <span className="text-sm font-medium">Haptic vibration</span>
              </div>
              <button
                onClick={toggleHaptics}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: hapticsEnabled ? 'var(--mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Toggle haptic feedback"
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                  style={{
                    left: hapticsEnabled ? 22 : 2,
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Safety & Guidelines */}
        <button
          onClick={() => setShowSafetySheet(true)}
          className="p-3.5 rounded-xl flex items-center justify-between text-left cursor-pointer hover:bg-white/10 transition-colors"
          style={{
            background: 'var(--sheet-bg)',
            border: '1px solid var(--sheet-border)',
          }}
        >
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck size={20} color="var(--mint)" />
            <div>
              <span className="text-sm font-medium block">Safety & community guidelines</span>
              <span className="text-xs text-white/50">Outdoor travel rules & honest limits</span>
            </div>
          </div>
        </button>

        {/* Stage Mode (Judge / Demo Simulator) */}
        {showStageControls && (
          <div
            className="p-4 rounded-xl flex flex-col gap-3"
            style={{
              background: 'rgba(210, 63, 90, 0.12)',
              border: '1.5px solid var(--accent)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xs text-[var(--accent)] uppercase tracking-wider">
                Stage Mode (Judge / Demo Simulator)
              </span>
              <button
                onClick={() => setSimulated(!isSimulated)}
                className="text-xs px-2.5 py-1 rounded font-display"
                style={{
                  background: isSimulated ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}
              >
                {isSimulated ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <p className="text-xs text-white/70">
              Allows indoor presentation and immediate reveal demonstration without walking outdoors.
            </p>
            <button
              onClick={handleTeleportVenue}
              className="py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-display flex items-center justify-center gap-1.5 hover:bg-white/20 cursor-pointer"
            >
              <Compass size={14} />
              <span>Reset GPS to Venue Center (TinkerSpace)</span>
            </button>
          </div>
        )}

        {/* App Info & Hidden Stage Trigger */}
        <div className="pt-2 text-center flex flex-col items-center">
          <div
            onClick={handleLogoTap}
            className="cursor-pointer active:scale-95 transition-transform"
            title="Tap 5 times for Stage Mode"
          >
            <span className="font-display text-white/80 text-sm tracking-wider flex items-center gap-1.5">
              <Sparkle size={14} color="var(--accent)" weight="fill" />
              <span>{APP_NAME}</span>
            </span>
          </div>

          <p className="text-[11px] text-white/40 mt-1 max-w-xs">
            Travel advice you can only read by standing where it was written. Built at LAYOVER 2026 by TinkerHub.
          </p>

          <p className="text-[10px] text-white/30 mt-3 font-mono">
            Build: v0.1.0 • Device Local Storage (No PII)
          </p>
        </div>
      </div>

      {/* Safety Sheet Modal */}
      {showSafetySheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSafetySheet(false)}
        >
          <div
            className="max-w-sm w-full p-6 rounded-2xl flex flex-col gap-4 text-left shadow-2xl"
            style={{
              background: 'var(--sheet-bg)',
              border: '1px solid var(--sheet-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-display text-white text-base">
                Safety Guidelines
              </h3>
              <button
                onClick={() => setShowSafetySheet(false)}
                className="text-white/60 hover:text-white"
              >
                Done
              </button>
            </div>

            <ul className="text-xs text-white/80 space-y-2.5 font-body">
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--mint)" className="shrink-0 mt-0.5" />
                <span>Stay on public pedestrian paths. Never trespass on private property.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--mint)" className="shrink-0 mt-0.5" />
                <span>Look up from your phone while walking near roads and transit stations.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--mint)" className="shrink-0 mt-0.5" />
                <span>No coordinates or routes leave your phone — all proximity math runs locally.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--mint)" className="shrink-0 mt-0.5" />
                <span>All content is moderated against harassment, spam, and offensive language.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
