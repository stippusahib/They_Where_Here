/* ============================================================
 * THEY WERE HERE — Me Tab (Clean Light Theme)
 * Traveller Passport Profile, Day/Night Theme Switcher,
 * Sound/Haptic toggles, Safety Sheet, and Stage Mode for judges.
 * ============================================================ */

import { useState, useEffect } from 'react';
import {
  UserCircle,
  SpeakerHigh,
  Vibrate,
  ShieldCheck,
  Compass,
  ArrowClockwise,
  Sun,
  Sparkle,
  DownloadSimple,
  DeviceMobile,
  CheckCircle,
  Camera,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { APP_NAME } from '@/contracts/types';
import { VENUE_CENTER } from '@/config/venue';
import { PaperPlaneCanvas } from '@/3d/PaperPlaneCanvas';

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
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const isSimulated = useAppStore((s) => s.isSimulated);
  const setSimulated = useAppStore((s) => s.setSimulated);
  const setPosition = useAppStore((s) => s.setPosition);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const arAndVoiceEnabled = useAppStore((s) => s.config.ar_and_voice_enabled ?? true);
  const toggleArAndVoice = useAppStore((s) => s.toggleArAndVoice);

  const [logoTaps, setLogoTaps] = useState(0);
  const [showStageControls, setShowStageControls] = useState(isSimulated);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone installed PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsStandalone(Boolean(isStandaloneMode));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    }
  };

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
      className="h-full flex flex-col overflow-y-auto text-left"
      style={{
        background: '#FAF7F0',
        color: 'var(--ink-900)',
      }}
    >
      <div className="safe-top px-5 pt-6 pb-28 max-w-md mx-auto w-full flex flex-col gap-5">
        {/* Traveller Passport ID Card */}
        <div
          className="p-5 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-sm"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #EADECA',
            boxShadow: '0 4px 16px rgba(15, 18, 48, 0.05)',
          }}
        >
          {/* Subtle Vintage Postmark / Seal */}
          <div
            className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border-2 border-dashed pointer-events-none opacity-10 flex items-center justify-center"
            style={{ borderColor: 'var(--hanko)', transform: 'rotate(-15deg)' }}
          >
            <span className="text-[10px] font-display uppercase tracking-widest text-center">
              PASSPORT • VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: 'var(--hanko)',
                border: '2px solid #FFFFFF',
              }}
            >
              <UserCircle size={40} color="white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-display"
                  style={{ fontSize: 'var(--text-base)', color: 'var(--ink-900)' }}
                >
                  @{profile?.handle ?? 'traveller'}
                </h2>
                <button
                  onClick={handleRerollHandle}
                  className="p-1 rounded text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[#F0EBE1] cursor-pointer transition-colors"
                  title="Reroll anonymous handle"
                  aria-label="Reroll handle"
                >
                  <ArrowClockwise size={14} />
                </button>
              </div>
              <span className="text-xs font-mono font-medium" style={{ color: 'var(--ink-500)' }}>
                Level {Math.floor((profile?.xp ?? 0) / 100) + 1} Explorer • {profile?.xp ?? 0} XP
              </span>
            </div>
          </div>

          <div className="text-right relative z-10">
            <span
              className="block font-display text-lg"
              style={{ color: 'var(--hanko)' }}
            >
              {profile?.unlock_count ?? 0}
            </span>
            <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--ink-500)' }}>
              Notes Unlocked
            </span>
          </div>
        </div>

        {/* 3D Paper Plane Mascot Interactive Widget */}
        <div
          className="p-4 rounded-2xl flex items-center justify-between overflow-hidden shadow-sm relative"
          style={{
            background: 'var(--paper)',
            border: '1.5px solid var(--paper-edge)',
          }}
        >
          <div className="flex flex-col gap-1 z-10 max-w-[65%]">
            <div className="flex items-center gap-1.5">
              <Sparkle size={16} weight="fill" color="var(--hanko)" />
              <span className="font-display text-xs" style={{ color: 'var(--ink-900)' }}>
                Pip the Mascot
              </span>
            </div>
            <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--ink-700)' }}>
              Procedural Three.js origami guide. Flies along your journey to uncover memories.
            </p>
          </div>
          <div className="w-24 h-24 absolute -right-2 -bottom-2 z-0 pointer-events-none">
            <PaperPlaneCanvas speed={1.2} />
          </div>
        </div>

        {/* App Preferences */}
        <div className="flex flex-col gap-2">
          <span className="font-display text-xs px-1" style={{ color: 'var(--ink-700)' }}>
            Experience & Atmosphere
          </span>

          <div
            className="rounded-2xl p-1 flex flex-col divide-y divide-[#F0EBE1] shadow-sm"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
            }}
          >
            {/* Theme Switcher: Auto / Day / Night */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sun size={18} color="var(--hanko)" />
                <span className="text-xs font-bold" style={{ color: 'var(--ink-900)' }}>Theme Mode</span>
              </div>
              <div className="flex rounded-lg p-0.5" style={{ background: '#FAF7F0', border: '1px solid #EADECA' }}>
                {(['day', 'auto', 'night'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setThemeMode(m)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-md capitalize cursor-pointer transition-all"
                    style={{
                      background: themeMode === m ? 'var(--hanko)' : 'transparent',
                      color: themeMode === m ? '#FFFFFF' : 'var(--ink-700)',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SpeakerHigh size={18} color="var(--ink-700)" />
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--ink-900)' }}>Sound Effects</span>
                  <span className="text-[10px]" style={{ color: 'var(--ink-500)' }}>Arrival chimes & clicks</span>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{ background: soundEnabled ? 'var(--hanko)' : '#CBD5E1' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 shadow-sm"
                  style={{ transform: soundEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Vibrate size={18} color="var(--ink-700)" />
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--ink-900)' }}>Haptic Feedback</span>
                  <span className="text-[10px]" style={{ color: 'var(--ink-500)' }}>Vibrate upon arrival</span>
                </div>
              </div>
              <button
                onClick={toggleHaptics}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{ background: hapticsEnabled ? 'var(--hanko)' : '#CBD5E1' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 shadow-sm"
                  style={{ transform: hapticsEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            {/* AR & Voice Notes Demo Toggle (Kill Switch) */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera size={18} color="var(--ink-700)" />
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--ink-900)' }}>AR & Voice Notes</span>
                  <span className="text-[10px]" style={{ color: 'var(--ink-500)' }}>Kill switch if sensors flake</span>
                </div>
              </div>
              <button
                onClick={toggleArAndVoice}
                className="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                style={{ background: arAndVoiceEnabled ? 'var(--hanko)' : '#CBD5E1' }}
                aria-label="Toggle AR and Voice Notes"
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 shadow-sm"
                  style={{ transform: arAndVoiceEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Web Application & Installation Card */}
        <div className="flex flex-col gap-2">
          <span className="font-display text-xs px-1" style={{ color: 'var(--ink-700)' }}>
            Web Application & Installation
          </span>

          <div
            className="rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DeviceMobile size={18} color="var(--hanko)" weight="bold" />
                <span className="text-xs font-bold" style={{ color: 'var(--ink-900)' }}>
                  Install They Were Here
                </span>
              </div>
              {isStandalone || installSuccess ? (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[var(--mint)] bg-[var(--mint)]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle size={12} weight="fill" />
                  INSTALLED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-[var(--ink-500)] bg-[#FAF7F0] px-2 py-0.5 rounded-full border border-[#EADECA]">
                  PWA READY
                </span>
              )}
            </div>

            <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--ink-700)' }}>
              {isStandalone || installSuccess
                ? 'Running as standalone web app with full offline cache and real-time GPS telemetry.'
                : 'Install as a lightweight web app on your home screen for quick travel access and offline radar.'}
            </p>

            {!isStandalone && !installSuccess && (
              deferredPrompt ? (
                <button
                  onClick={handleInstallApp}
                  className="slant-btn slant-btn--primary py-2.5 text-xs text-center cursor-pointer flex items-center justify-center gap-2 shadow-sm font-bold"
                >
                  <DownloadSimple size={15} weight="bold" />
                  <span>Install to Device / Home Screen</span>
                </button>
              ) : (
                <div
                  className="text-[11px] p-2.5 rounded-xl flex items-center gap-2"
                  style={{ background: '#FAF7F0', border: '1px solid #EADECA', color: 'var(--ink-600)' }}
                >
                  <DownloadSimple size={14} className="shrink-0" color="var(--hanko)" />
                  <span>
                    Tap browser menu <strong className="text-[var(--ink-900)]">Share</strong> or <strong className="text-[var(--ink-900)]">⋮</strong> &gt; select <strong className="text-[var(--ink-900)]">Add to Home Screen</strong>.
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Safety & Protocol */}
        <div className="flex flex-col gap-2">
          <span className="font-display text-xs px-1" style={{ color: 'var(--ink-700)' }}>
            Safety & Information
          </span>

          <div
            className="rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} color="var(--mint)" weight="fill" />
              <span className="text-xs font-bold" style={{ color: 'var(--ink-900)' }}>Traveller Safety Guidelines</span>
            </div>
            <ul className="text-xs flex flex-col gap-1.5 pl-6 list-disc" style={{ color: 'var(--ink-700)' }}>
              <li>Never place or seek notes near active train tracks or highways.</li>
              <li>Remain aware of your surroundings at night.</li>
              <li>Only post kind, honest, local advice without personal data.</li>
            </ul>
          </div>
        </div>

        {/* Secret Stage Mode for Judges */}
        {showStageControls && (
          <div
            className="p-4 rounded-2xl flex flex-col gap-3 shadow-md border-2"
            style={{
              background: '#FFF6E5',
              borderColor: 'var(--hanko)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={18} color="var(--hanko)" weight="bold" />
                <span className="font-display text-xs" style={{ color: 'var(--ink-900)' }}>
                  Stage Mode (Demo / Testing)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#E8264C22] text-[#E8264C] px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            <p className="text-xs" style={{ color: 'var(--ink-700)' }}>
              Teleports user location directly to the hackathon venue center so all proximity interactions and orbs trigger on stage.
            </p>

            <button
              onClick={handleTeleportVenue}
              className="slant-btn slant-btn--primary py-2.5 text-xs text-center cursor-pointer shadow-sm"
            >
              Teleport to TinkerSpace Venue
            </button>
          </div>
        )}

        {/* Footer & Build info */}
        <div className="text-center pt-2 pb-4">
          <p
            onClick={handleLogoTap}
            className="font-display text-xs cursor-pointer select-none"
            style={{ color: 'var(--ink-400)' }}
            title="Tap 5 times to reveal Stage Mode"
          >
            {APP_NAME} • v0.1.0 Light Dusk Postcard
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-300)' }}>
            Built for Layover 2026 Hackathon • Offline First PWA
          </p>
        </div>
      </div>
    </div>
  );
}
