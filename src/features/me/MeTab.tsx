/* ============================================================
 * THEY WERE HERE — Me Tab (P0)
 * User profile, preferences, sound/haptic toggles, safety sheet,
 * and hidden Stage Mode (5 taps on logo) for demo/judging.
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

  const [logoTaps, setLogoTaps] = useState(0);
  const [showStageControls, setShowStageControls] = useState(isSimulated);
  const [showSafetySheet, setShowSafetySheet] = useState(false);

  // Hidden 5 taps on logo activates Stage Mode (Part 8.5)
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
        {/* Profile Card */}
        <div
          className="glass p-5 rounded-2xl flex items-center justify-between relative overflow-hidden"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--color-hanko)',
                boxShadow: '0 0 16px rgba(232, 38, 76, 0.4)',
              }}
            >
              <UserCircle size={40} color="white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-display text-white"
                  style={{ fontSize: 'var(--font-size-base)' }}
                >
                  @{profile?.handle ?? 'traveller'}
                </h2>
                <button
                  onClick={handleRerollHandle}
                  className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="Reroll handle (up to 3 times)"
                >
                  <ArrowClockwise size={14} />
                </button>
              </div>
              <p
                className="text-xs text-white/60 mt-0.5"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Anonymous Traveller • Level 2 Explorer
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-display text-lg text-[var(--color-legendary)] block">
              {profile?.xp ?? 0}
            </span>
            <span className="text-[10px] text-white/50 uppercase">XP Gained</span>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="flex flex-col gap-2">
          <span className="font-display text-xs text-white/50 uppercase px-1">
            Preferences
          </span>

          <div className="glass rounded-xl overflow-hidden divide-y divide-white/10">
            {/* Sound Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <SpeakerHigh size={20} color="var(--color-rare)" />
                <span className="text-sm font-medium">Sound Effects</span>
              </div>
              <button
                onClick={toggleSound}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: soundEnabled ? 'var(--color-mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
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
                <MusicNote size={20} color="var(--color-rare)" />
                <span className="text-sm font-medium">Ambient Music</span>
              </div>
              <button
                onClick={toggleMusic}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: musicEnabled ? 'var(--color-mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
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
                <Vibrate size={20} color="var(--color-rare)" />
                <span className="text-sm font-medium">Haptic Feedback</span>
              </div>
              <button
                onClick={toggleHaptics}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{
                  background: hapticsEnabled ? 'var(--color-mint)' : 'rgba(255, 255, 255, 0.2)',
                }}
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

        {/* Safety Sheet Trigger (Part 8.5 Screen 10) */}
        <button
          onClick={() => setShowSafetySheet(true)}
          className="glass p-3.5 rounded-xl flex items-center justify-between text-left cursor-pointer hover:bg-white/10"
        >
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck size={20} color="var(--color-mint)" />
            <div>
              <span className="text-sm font-medium block">Safety & Community Guidelines</span>
              <span className="text-xs text-white/50">Outdoor travel rules & honest limits</span>
            </div>
          </div>
        </button>

        {/* Stage Mode (Simulation for Demo / Judging) */}
        {showStageControls && (
          <div
            className="p-4 rounded-xl flex flex-col gap-3 animate-fade-in"
            style={{
              background: 'rgba(232, 38, 76, 0.1)',
              border: '1px solid var(--color-hanko)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xs text-[var(--color-hanko)] uppercase">
                Stage Mode (Judge / Demo Simulator)
              </span>
              <button
                onClick={() => setSimulated(!isSimulated)}
                className="text-xs px-2 py-1 rounded font-display"
                style={{
                  background: isSimulated ? 'var(--color-hanko)' : 'rgba(255, 255, 255, 0.2)',
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
            <span className="font-display text-white/80 text-sm tracking-wider">
              {APP_NAME}
            </span>
          </div>

          <p className="text-[11px] text-white/40 mt-1 max-w-xs">
            Travel advice you can only read by standing where it was written. Built at LAYOVER 2026 by TinkerHub.
          </p>

          <p className="text-[10px] text-white/30 mt-3">
            Build: v0.1.0 • Device Local Storage (No PII)
          </p>
        </div>
      </div>

      {/* Safety Sheet Modal (Part 8.5 Screen 10) */}
      {showSafetySheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSafetySheet(false)}
        >
          <div
            className="glass max-w-sm w-full p-6 rounded-2xl flex flex-col gap-4 text-left"
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
                <Check size={16} color="var(--color-mint)" className="shrink-0 mt-0.5" />
                <span>Stay on public pedestrian paths. Never trespass on private property.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--color-mint)" className="shrink-0 mt-0.5" />
                <span>Look up from your phone while walking near roads and transit stations.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--color-mint)" className="shrink-0 mt-0.5" />
                <span>No coordinates or routes leave your phone — all proximity math runs locally.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} color="var(--color-mint)" className="shrink-0 mt-0.5" />
                <span>All content is moderated against harassment, spam, and offensive language.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
