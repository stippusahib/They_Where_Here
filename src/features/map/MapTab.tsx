/* ============================================================
 * LEFT HERE — Map Tab (P0)
 * Fullscreen MapLibre map with orbs, user dot, radar chip.
 * ============================================================ */

import { useState } from 'react';
import { MapTrifold, Crosshair, List } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { APP_NAME } from '@/contracts/types';
import { CreateNoteModal } from '@/features/notes/CreateNoteModal';
import { playButtonClick } from '@/lib/audio';

/**
 * Map tab — the main screen of the app.
 * MapLibre integration will be added in M1.
 * This is the P0 placeholder with the correct layout structure.
 */
export function MapTab() {
  const profile = useAppStore((s) => s.profile);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div
      className="relative w-full h-full"
      style={{ background: 'var(--color-ink-900)' }}
    >
      {/* Map container — MapLibre canvas goes here in M1 */}
      <div
        id="map-container"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            var(--color-sky-night-deep) 0%,
            var(--color-sky-night-mid) 50%,
            var(--color-sky-night-light) 100%
          )`,
        }}
      >
        {/* Placeholder map visual */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <MapTrifold size={64} weight="thin" />
            <p
              className="mt-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-lg)',
              }}
            >
              {APP_NAME}
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Map loading in M1...
            </p>
          </div>
        </div>
      </div>

      {/* HUD: Handle chip top-left */}
      {profile && (
        <div
          className="glass absolute top-4 left-4 px-3 py-1.5 flex items-center gap-2"
          style={{
            borderRadius: 'var(--radius-chip)',
            fontSize: 'var(--font-size-sm)',
            zIndex: 10,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)' }}>
            {profile.handle}
          </span>
        </div>
      )}

      {/* HUD: Recenter button top-right */}
      <button
        className="glass absolute top-4 right-4 flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-chip)',
          cursor: 'pointer',
          border: 'none',
          color: 'white',
          zIndex: 10,
        }}
        aria-label="Recenter map"
      >
        <Crosshair size={24} weight="bold" />
      </button>

      {/* HUD: List mode button */}
      <button
        className="glass absolute top-16 right-4 flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-chip)',
          cursor: 'pointer',
          border: 'none',
          color: 'white',
          zIndex: 10,
        }}
        aria-label="Switch to list view"
      >
        <List size={24} weight="bold" />
      </button>

      {/* Radar chip — nearest note guidance */}
      <div
        className="glass absolute left-4 right-4 flex items-center gap-3 px-4 py-3"
        style={{
          bottom: 72,
          borderRadius: 'var(--radius-panel)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--color-common)',
            boxShadow: '0 0 8px var(--color-common)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'white',
          }}
        >
          No notes nearby yet. Leave the first one.
        </span>
      </div>

      {/* Leave a note button */}
      <button
        onClick={() => {
          playButtonClick();
          setIsCreateOpen(true);
        }}
        className="slant-btn slant-btn--primary absolute"
        style={{
          bottom: 132,
          right: 16,
          zIndex: 10,
        }}
        aria-label="Leave a note"
      >
        Leave a note
      </button>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
