/* ============================================================
 * THEY WERE HERE — Me Tab
 * User profile, avatar selector, layover preference manager,
 * offline cache inspector, and developer stage mode.
 * ============================================================ */

import { useState, useEffect } from 'react';
import {
  UserCircle,
  SpeakerHigh,
  SpeakerSlash,
  MusicNote,
  Vibrate,
  ShieldCheck,
  Compass,
  Camera,
  Footprints,
  Backpack,
  MapTrifold,
  Train,
  SealCheck,
  Clock,
  HardDrive,
  Trash,
  Sparkle,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { env } from '@/config/env';
import { APP_NAME } from '@/contracts/types';
import { layoverReachKm } from '@/lib/geo';
import { playButtonClick } from '@/lib/audio';
import {
  getStorageStats,
  clearPassportStorage,
  saveLayoverHours,
  saveAvatarSticker,
  getStoredAvatarSticker,
} from '@/lib/storage';

const AVATAR_STICKERS = [
  { id: 0, name: 'Compass', icon: Compass },
  { id: 1, name: 'Lantern', icon: Sparkle },
  { id: 2, name: 'Camera', icon: Camera },
  { id: 3, name: 'Footprints', icon: Footprints },
  { id: 4, name: 'Backpack', icon: Backpack },
  { id: 5, name: 'Map', icon: MapTrifold },
  { id: 6, name: 'Train', icon: Train },
  { id: 7, name: 'Hanko', icon: SealCheck },
];

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
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);

  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState({ count: 0, approxBytes: 0 });
  const [logoTaps, setLogoTaps] = useState(0);
  const [stageModeToast, setStageModeToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const stats = await getStorageStats();
      setCacheStats(stats);
      const storedAvatar = await getStoredAvatarSticker();
      if (storedAvatar !== null) {
        setSelectedAvatar(storedAvatar);
      }
    }
    loadStats();
  }, []);

  function handleLogoTap() {
    const next = logoTaps + 1;
    if (next >= 5 && env.allowSim) {
      const nextSim = !isSimulated;
      setSimulated(nextSim);
      setLogoTaps(0);
      setStageModeToast(nextSim ? 'Stage Mode Activated (Simulated GPS)' : 'Stage Mode Deactivated');
      setTimeout(() => setStageModeToast(null), 3000);
    } else {
      setLogoTaps(next);
      setTimeout(() => setLogoTaps(0), 3000);
    }
  }

  const handleSelectAvatar = async (id: number) => {
    playButtonClick();
    setSelectedAvatar(id);
    await saveAvatarSticker(id);
    setIsAvatarPickerOpen(false);
  };

  const handleLayoverChange = async (hours: number) => {
    playButtonClick();
    setLayoverHours(hours);
    await saveLayoverHours(hours);
  };

  const handleClearCache = async () => {
    playButtonClick();
    await clearPassportStorage();
    const stats = await getStorageStats();
    setCacheStats(stats);
  };

  const CurrentAvatarIcon = AVATAR_STICKERS[selectedAvatar]?.icon ?? UserCircle;
  const reachDistance = layoverReachKm(layoverHours).toFixed(1);

  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, var(--color-sky-night-deep) 0%, var(--color-ink-900) 100%)',
      }}
    >
      {/* Toast Notification */}
      {stageModeToast && (
        <div
          className="fixed top-4 left-4 right-4 z-50 py-2.5 px-4 rounded-xl text-center font-bold text-xs shadow-lg transition-all"
          style={{
            background: 'var(--color-hanko)',
            color: 'white',
            fontFamily: 'var(--font-display)',
          }}
        >
          {stageModeToast}
        </div>
      )}

      {/* Header with profile */}
      <header className="safe-top px-5 pt-6 pb-4 text-center">
        <button
          onClick={handleLogoTap}
          className="mx-auto mb-2 relative group"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={`${APP_NAME} avatar`}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed mx-auto"
            style={{
              borderColor: 'var(--color-paper-edge)',
              background: 'rgba(255, 243, 214, 0.1)',
            }}
          >
            <CurrentAvatarIcon
              size={44}
              weight="duotone"
              style={{ color: 'var(--color-paper)' }}
            />
          </div>
          <span
            onClick={(e) => {
              e.stopPropagation();
              playButtonClick();
              setIsAvatarPickerOpen(true);
            }}
            className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: 'var(--color-hanko)',
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}
          >
            Edit
          </span>
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
          className="mt-0.5 text-xs"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {profile ? `${profile.xp} XP collected` : 'Anonymous profile stored on this device'}
        </p>
      </header>

      {/* Settings & Preferences */}
      <div className="px-5 space-y-4 pb-28">
        {/* Layover Window Card */}
        <div
          className="glass p-4"
          style={{
            borderRadius: 'var(--radius-panel)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={18} weight="bold" style={{ color: 'var(--color-rare)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'white',
                }}
              >
                Layover Duration
              </span>
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: 'var(--color-mint)', fontFamily: 'var(--font-display)' }}
            >
              {reachDistance} km radius
            </span>
          </div>

          <p className="text-xs text-white/60 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            Filter how far advice orbs appear so you return before your connection.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 4, 8] as const).map((h) => {
              const isSelected = layoverHours === h;
              return (
                <button
                  key={h}
                  onClick={() => handleLayoverChange(h)}
                  className="py-2 text-center rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: isSelected ? 'var(--color-hanko)' : 'rgba(255,255,255,0.08)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {h} hrs
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <SettingRow
            icon={soundEnabled ? SpeakerHigh : SpeakerSlash}
            label="Sound Effects"
            active={soundEnabled}
            onToggle={toggleSound}
          />
          <SettingRow
            icon={MusicNote}
            label="Ambient Audio"
            active={musicEnabled}
            onToggle={toggleMusic}
          />
          <SettingRow
            icon={Vibrate}
            label="Tactile Haptics"
            active={hapticsEnabled}
            onToggle={toggleHaptics}
          />
        </div>

        {/* Offline Cache Inspector */}
        <div
          className="glass p-4"
          style={{
            borderRadius: 'var(--radius-panel)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive size={18} weight="bold" style={{ color: 'var(--color-mint)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'white',
                }}
              >
                Offline Storage
              </span>
            </div>
            <span className="text-xs text-white/50">
              {(cacheStats.approxBytes / 1024).toFixed(1)} KB
            </span>
          </div>

          <p className="text-xs text-white/60 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
            {cacheStats.count} verified notes cached in IndexedDB. Fully accessible offline.
          </p>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Trash size={14} weight="bold" />
            <span>Clear Offline Passport Cache</span>
          </button>
        </div>

        {/* Safety tips */}
        <div
          className="glass px-4 py-3"
          style={{
            borderRadius: 'var(--radius-panel)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={18} weight="bold" style={{ color: 'var(--color-mint)' }} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-sm)',
                color: 'white',
              }}
            >
              Security Model
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-xs)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
            }}
          >
            Notes are server-sealed with PostGIS verification. No personal data or live routes ever leave your phone.
          </p>
        </div>

        {/* Build info */}
        <div
          className="text-center pt-2"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <p>{APP_NAME} &middot; Layover 2026 Build {env.buildId}</p>
          {isSimulated && (
            <p className="text-amber-400 font-bold mt-1">Stage Mode Active (5 taps to toggle)</p>
          )}
        </div>
      </div>

      {/* Avatar Sticker Picker Modal */}
      {isAvatarPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15, 18, 48, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsAvatarPickerOpen(false)}
        >
          <div
            className="w-full max-w-xs p-5"
            style={{
              background: 'var(--color-ink-900)',
              borderRadius: 'var(--radius-panel)',
              border: '1px solid var(--glass-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-sm font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Choose Traveller Sticker
            </h2>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_STICKERS.map(({ id, name, icon: Icon }) => {
                const isSelected = selectedAvatar === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectAvatar(id)}
                    className="p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                    style={{
                      background: isSelected ? 'var(--color-hanko)' : 'rgba(255,255,255,0.06)',
                      border: isSelected ? '1px solid white' : '1px solid transparent',
                      cursor: 'pointer',
                    }}
                    aria-label={name}
                  >
                    <Icon size={24} weight="bold" color="white" />
                    <span className="text-[9px] text-white/80">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
