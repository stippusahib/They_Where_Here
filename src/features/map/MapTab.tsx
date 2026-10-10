/* ============================================================
 * THEY WERE HERE — Map Tab (P0 Main Screen)
 * Interactive location-locked note map, glowing orbs, radar HUD,
 * Layover reach filter, Overnight Wall counter, and Stage Mode.
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import {
  List,
  MapTrifold,
  PaperPlaneTilt,
  SpeakerHigh,
  SpeakerSlash,
  Clock,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import {
  haversineDistance,
  bearing,
  toCardinal,
  layoverReachKm,
  formatDistance,
} from '@/lib/geo';
import { MapView } from '@/map/MapView';
import { HandleChip, WallChip } from '@/ui/components/HudChip';
import { RadarChip } from '@/ui/components/RadarChip';
import { ArrivedBar } from '@/features/notes/ArrivedBar';
import { RarityTag } from '@/ui/components/RarityTag';
import { OrbSheet } from './OrbSheet';
import { RevealModal } from '@/features/reveal/RevealModal';
import { CreateNoteModal } from '@/features/notes/CreateNoteModal';
import type { ExtendedNote } from '@/lib/seedNotes';

export const MapTab: React.FC = () => {
  const position = useAppStore((s) => s.position);
  const setPosition = useAppStore((s) => s.setPosition);
  const profile = useAppStore((s) => s.profile);
  const notes = useAppStore((s) => s.notes);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const isSimulated = useAppStore((s) => s.isSimulated);
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);
  const setIsCreateNoteOpen = useAppStore((s) => s.setIsCreateNoteOpen);
  const activeInspectNote = useAppStore((s) => s.activeInspectNote);
  const setActiveInspectNote = useAppStore((s) => s.setActiveInspectNote);
  const setActiveRevealNote = useAppStore((s) => s.setActiveRevealNote);

  const [isListView, setIsListView] = useState(false);
  const [showLayoverQuickPicker, setShowLayoverQuickPicker] = useState(false);

  // Layover Reach Radius
  const reachKm = useMemo(() => layoverReachKm(layoverHours), [layoverHours]);
  const reachMeters = reachKm * 1000;

  // Filter and sort notes by distance
  const notesWithDistance = useMemo(() => {
    if (!position) return [];
    return notes
      .map((note) => {
        const dist = haversineDistance(position.lat, position.lng, note.lat, note.lng);
        const bear = bearing(position.lat, position.lng, note.lat, note.lng);
        const dir = toCardinal(bear);
        return {
          ...note,
          distanceMeters: dist,
          cardinalDir: dir,
          inReach: dist <= reachMeters,
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [notes, position, reachMeters]);

  // Nearest note within layover reach
  const nearestNote = useMemo(() => {
    return notesWithDistance.find((n) => n.inReach) ?? notesWithDistance[0] ?? null;
  }, [notesWithDistance]);

  const nearestDistance = nearestNote ? nearestNote.distanceMeters : null;

  // Overnight Wall count (notes within 350m)
  const overnightNotesCount = useMemo(() => {
    return notesWithDistance.filter((n) => n.distanceMeters <= 350).length;
  }, [notesWithDistance]);

  const handleOrbClick = (note: ExtendedNote) => {
    setActiveInspectNote(note);
  };

  const handleOpenNote = (note: ExtendedNote) => {
    setActiveInspectNote(null);
    setActiveRevealNote(note);
  };

  const handleTeleportToNote = (note: ExtendedNote) => {
    // Stage Mode shortcut: teleport right next to note (within 20m)
    setPosition({
      lat: note.lat + 0.0001,
      lng: note.lng + 0.0001,
      accuracy: 8,
      heading: 0,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[var(--ink-900)]">
      {/* ── MAP OR LIST LAYER ────────────────────────────────────────── */}
      {!isListView ? (
        <div className="map-layer">
          <MapView
            position={position}
            notes={notes}
            layoverHours={layoverHours}
            reachKm={reachKm}
            nearestNote={nearestNote}
            nearestDistance={nearestDistance}
            onOrbClick={handleOrbClick}
          />
        </div>
      ) : (
        /* ── LIST VIEW (ACCESSIBILITY & DEMO FALLBACK) ── */
        <div className="absolute inset-0 z-10 p-4 pt-24 pb-28 overflow-y-auto bg-[var(--ink-900)]">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-display text-white text-base">
                Notes Near You ({notesWithDistance.length})
              </h2>
              <span className="text-white/50 text-xs">Sorted by distance</span>
            </div>

            {notesWithDistance.map((note) => {
              const isHere = note.distanceMeters <= 60;
              return (
                <div
                  key={note.id}
                  onClick={() => handleOrbClick(note)}
                  className="hud-chip p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-white/10 active:scale-[0.99] w-full"
                  style={{
                    borderColor: isHere ? 'var(--mint)' : 'var(--glass-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        background:
                          note.rarity === 'legendary'
                            ? 'var(--legendary)'
                            : note.rarity === 'rare'
                            ? 'var(--rare)'
                            : 'var(--common)',
                        boxShadow: `0 0 8px currentColor`,
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-white text-sm">
                          {note.title}
                        </span>
                        <RarityTag rarity={note.rarity} size="sm" />
                      </div>
                      <span className="text-xs text-white/60">
                        {formatDistance(note.distanceMeters)} {note.cardinalDir} • By @
                        {note.author_handle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSimulated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeleportToNote(note);
                        }}
                        className="px-2 py-1 rounded text-[10px] bg-white/10 text-white font-display hover:bg-white/20"
                        title="Stage Mode: Teleport within 60m"
                      >
                        Teleport
                      </button>
                    )}
                    {isHere ? (
                      <span className="slant-btn slant-btn--primary px-2.5 py-1 text-xs">
                        OPEN
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs font-display">
                        {formatDistance(note.distanceMeters)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SKY ATMOSPHERE OVERLAY ──────────────────────────────────── */}
      <div className="sky-layer" />

      {/* ── TOP HUD ─────────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between safe-top pointer-events-none">
        {/* Left & Center HUD chips */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <HandleChip
            handle={profile?.handle ?? 'swift_fox'}
            xp={profile?.xp ?? 140}
          />
          <WallChip count={overnightNotesCount} />
        </div>

        {/* Right HUD Controls: Sound & List Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleSound}
            className="hud-chip flex items-center justify-center text-white"
            style={{
              width: 38,
              height: 38,
              padding: 0,
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
          </button>

          <button
            onClick={() => setIsListView((v) => !v)}
            className="hud-chip flex items-center justify-center text-white"
            style={{
              width: 38,
              height: 38,
              padding: 0,
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            aria-label={isListView ? 'Switch to map view' : 'Switch to list view'}
          >
            {isListView ? (
              <MapTrifold size={18} weight="bold" />
            ) : (
              <List size={18} weight="bold" />
            )}
          </button>
        </div>
      </div>

      {/* ── LAYOVER QUICK PICKER ────────────────────────────────────── */}
      <div className="fixed top-16 left-4 z-40 safe-top pointer-events-auto">
        <button
          onClick={() => setShowLayoverQuickPicker((v) => !v)}
          className="hud-chip flex items-center gap-1.5 cursor-pointer"
          style={{
            borderColor: 'rgba(53, 182, 255, 0.4)',
            color: 'var(--rare)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <Clock size={13} weight="bold" color="var(--rare)" />
          <span>
            {layoverHours}h Layover ({reachKm.toFixed(1)} km)
          </span>
        </button>

        {showLayoverQuickPicker && (
          <div
            className="hud-chip mt-2 p-3 flex flex-col gap-2 w-52 shadow-2xl"
            style={{ borderRadius: 'var(--radius-panel)' }}
          >
            <span
              className="text-[11px] text-white/80"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Layover Duration
            </span>
            <input
              type="range"
              min={1}
              max={8}
              value={layoverHours}
              onChange={(e) => setLayoverHours(parseInt(e.target.value, 10))}
              className="accent-[#E8264C]"
            />
            <div className="flex justify-between text-[10px] text-white/60">
              <span>1h</span>
              <span className="text-white font-bold">{layoverHours}h</span>
              <span>8h</span>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM HUD & ACTIONS ────────────────────────────────────── */}
      {/* If note is in range (<= 60m), show docking ArrivedBar */}
      {nearestNote && nearestDistance !== null && nearestDistance <= 60 ? (
        <ArrivedBar
          onOpen={() => handleOpenNote(nearestNote)}
          proximityState="here"
        />
      ) : (
        /* Otherwise show nearest note radar chip */
        <div
          className="fixed left-4 z-40 pointer-events-auto"
          style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px) + 14px)' }}
        >
          <RadarChip
            nearestNote={nearestNote}
            distance={nearestDistance}
            direction={nearestNote?.cardinalDir ?? 'NE'}
            state={
              nearestDistance === null
                ? 'unsure'
                : nearestDistance <= 150
                ? 'close'
                : nearestDistance <= 400
                ? 'near'
                : 'far'
            }
            onClick={() => {
              if (nearestNote) handleOrbClick(nearestNote);
            }}
          />
        </div>
      )}

      {/* Floating Action Button: Leave a note */}
      <button
        className="fab-leave-note"
        onClick={() => setIsCreateNoteOpen(true)}
        aria-label="Leave a note"
      >
        <PaperPlaneTilt size={18} weight="fill" />
        <span>Leave a note</span>
      </button>

      {/* ── MODALS & SHEETS ────────────────────────────────────────── */}
      <OrbSheet
        note={activeInspectNote}
        distanceMeters={
          activeInspectNote && position
            ? haversineDistance(
                position.lat,
                position.lng,
                activeInspectNote.lat,
                activeInspectNote.lng
              )
            : 999
        }
        onClose={() => setActiveInspectNote(null)}
        onOpenNote={handleOpenNote}
      />

      <RevealModal />
      <CreateNoteModal />
    </div>
  );
};
