/* ============================================================
 * LEFT HERE — Me Tab (P0)
 * User profile, settings, and hidden controls.
 * ============================================================ */

import { useState } from 'react';
import {
  UserCircle,
  SpeakerHigh,
  SpeakerSlash,
  MusicNote,
  Vibrate,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { env } from '@/config/env';
import { APP_NAME } from '@/contracts/types';

/**
 * Me tab — profile, preferences, safety tips, about.
 * Hidden Stage Mode activation: 5 taps on the logo.
 */
export function MeTab() {
  const profile = useAppStore((s) => s.profile);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const toggleMusic = useAppStore((s) => s.toggleMusic);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);
  const setSimulated = useAppStore((s) => s.setSimulated);
  const isSimulated = useAppStore((s) => s.isSimulated);

  const [logoTaps, setLogoTaps] = useState(0);

  function handleLogoTap() {
    const next = logoTaps + 1;
    if (next >= 5 && env.allowSim) {
      setSimulated(!isSimulated);
      setLogoTaps(0);
    } else {
      setLogoTaps(next);
      // Reset after 3 seconds
      setTimeout(() => setLogoTaps(0), 3000);
    }
  }

  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-700) 100%)',
      }}
    >
      {/* Header with profile */}
      <header className="safe-top px-5 pt-6 pb-6 text-center">
        <button
          onClick={handleLogoTap}
          className="mx-auto mb-3"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={APP_NAME}
        >
          <UserCircle
            size={72}
            weight="thin"
            style={{ color: 'var(--color-paper)' }}
          />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-lg)',
            color: 'white',
          }}
        >
          {profile?.handle ?? 'Anonymous Explorer'}
        </h1>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {profile ? `${profile.xp} XP` : 'Sign in to track progress'}
        </p>
      </header>

      {/* Settings */}
      <div className="px-5 space-y-3 pb-8">
        <SettingRow
          icon={soundEnabled ? SpeakerHigh : SpeakerSlash}
          label="Sound"
          active={soundEnabled}
          onToggle={toggleSound}
        />
        <SettingRow
          icon={MusicNote}
          label="Music"
          active={musicEnabled}
          onToggle={toggleMusic}
        />
        <SettingRow
          icon={Vibrate}
          label="Haptics"
          active={hapticsEnabled}
          onToggle={toggleHaptics}
        />

        {/* Safety tips */}
        <div
          className="glass px-4 py-3 mt-4"
          style={{ borderRadius: 'var(--radius-panel)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={20} weight="bold" style={{ color: 'var(--color-mint)' }} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-sm)',
                color: 'white',
              }}
            >
              Safety
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
            }}
          >
            Never go anywhere unsafe for a note. Your route stays on your phone.
            Clearing browser data resets your progress.
          </p>
        </div>

        {/* Build info */}
        <div
          className="text-center mt-6"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <p>{APP_NAME} &middot; Build {env.buildId}</p>
        </div>
      </div>
    </div>
  );
}

/** Individual setting toggle row */
function SettingRow({
  icon: Icon,
  label,
  active,
  onToggle,
}: {
  icon: typeof SpeakerHigh;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="glass w-full flex items-center justify-between px-4 py-3"
      style={{
        borderRadius: 'var(--radius-panel)',
        border: 'none',
        cursor: 'pointer',
        background: 'var(--glass-bg)',
      }}
      onClick={onToggle}
      aria-label={`${label}: ${active ? 'on' : 'off'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} weight="bold" style={{ color: 'white' }} />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-base)',
            color: 'white',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: active ? 'var(--color-mint)' : 'var(--color-ink-500)',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: 'white',
            position: 'absolute',
            top: 2,
            left: active ? 22 : 2,
            transition: 'left 0.2s ease',
          }}
        />
      </div>
    </button>
  );
}
