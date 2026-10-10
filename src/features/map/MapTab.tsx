/* ============================================================
 * THEY WERE HERE — Map Tab (P0 Main Screen + AR Navigator)
 * Interactive location-locked note map, glowing orbs, radar HUD,
 * AR Camera Mode toggle, Layover reach filter, and Stage Mode.
 * ============================================================ */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import {
  List,
  MapTrifold,
  PaperPlaneTilt,
  SpeakerHigh,
  SpeakerSlash,
  Clock,
  NavigationArrow,
  Crosshair,
  Camera,
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
import { showReachView, showStreetView } from '@/map/geoShapes';
import { HandleChip, WallChip } from '@/ui/components/HudChip';
import { RadarChip } from '@/ui/components/RadarChip';
import { ArrivedBar } from '@/features/notes/ArrivedBar';
import { RarityTag } from '@/ui/components/RarityTag';
import { OrbSheet } from './OrbSheet';
import { LayoverSheet } from '@/features/layover/LayoverSheet';
import { RevealModal } from '@/features/reveal/RevealModal';
import { CreateNoteModal } from '@/features/notes/CreateNoteModal';
import { ARNoteView } from '@/features/ar/ARNoteView';
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
  const setIsCreateNoteOpen = useAppStore((s) => s.setIsCreateNoteOpen);
  const activeInspectNote = useAppStore((s) => s.activeInspectNote);
  const setActiveInspectNote = useAppStore((s) => s.setActiveInspectNote);
  const setActiveRevealNote = useAppStore((s) => s.setActiveRevealNote);

  const [isListView, setIsListView] = useState(false);
  const [isLayoverSheetOpen, setIsLayoverSheetOpen] = useState(false);
  const [isARModeOpen, setIsARModeOpen] = useState(false);

  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const arrivedBarWrapRef = useRef<HTMLDivElement>(null);

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

  // Notes inside reach count
  const notesInReachCount = useMemo(() => {
    return notesWithDistance.filter((n) => n.inReach).length;
  }, [notesWithDistance]);

  // Nearest note within layover reach
  const nearestNote = useMemo(() => {
    return notesWithDistance.find((n) => n.inReach) ?? notesWithDistance[0] ?? null;
  }, [notesWithDistance]);

  const nearestDistance = nearestNote ? nearestNote.distanceMeters : null;

  // Overnight Wall count (notes within 350m)
  const overnightNotesCount = useMemo(() => {
    return notesWithDistance.filter((n) => n.distanceMeters <= 350).length;
  }, [notesWithDistance]);

  // Step 1.8: ResizeObserver on arrived bar sets --dock-h
  useEffect(() => {
    const el = arrivedBarWrapRef.current;
    if (!el || !nearestNote || nearestDistance === null || nearestDistance > 60) {
      document.documentElement.style.setProperty('--dock-h', '0px');
      return;
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        document.documentElement.style.setProperty('--dock-h', `${h + 10}px`);
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty('--dock-h', '0px');
    };
  }, [nearestNote, nearestDistance]);

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

  const handleShowReachView = () => {
    if (mapInstanceRef.current && position) {
      showReachView(
        mapInstanceRef.current,
        { lat: position.lat, lng: position.lng },
        reachKm
      );
    }
  };

  const handleRecenterStreetView = () => {
    if (mapInstanceRef.current && position) {
      showStreetView(
        mapInstanceRef.current,
        { lat: position.lat, lng: position.lng }
      );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{ background: '#FFF6E5' }}>
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
            onMapReady={(map) => {
              mapInstanceRef.current = map;
            }}
          />
        </div>
      ) : (
        /* ── LIST VIEW (ACCESSIBILITY & DEMO FALLBACK) ── */
        <div
          className="absolute inset-0 z-10 p-4 pt-24 pb-28 overflow-y-auto"
          style={{ background: '#FAF7F0', color: 'var(--ink-900)' }}
        >
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-display text-base" style={{ color: 'var(--ink-900)' }}>
                Notes Near You ({notesWithDistance.length})
              </h2>
              <span className="text-xs" style={{ color: 'var(--ink-500)' }}>Sorted by distance</span>
            </div>

            {notesWithDistance.map((note) => {
              const isHere = note.distanceMeters <= 60;
              return (
                <div
                  key={note.id}
                  onClick={() => handleOrbClick(note)}
                  className="hud-chip p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-white active:scale-[0.99] w-full"
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${isHere ? 'var(--mint)' : '#EADECA'}`,
                    boxShadow: '0 2px 8px rgba(15, 18, 48, 0.04)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{
                        background:
                          note.rarity === 'legendary'
                            ? 'var(--legendary)'
                            : note.rarity === 'rare'
                            ? 'var(--rare)'
                            : 'var(--common)',
                        border: '1.5px solid var(--line)',
                        boxShadow: `0 0 8px currentColor`,
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm" style={{ color: 'var(--ink-900)' }}>
                          {note.title}
                        </span>
                        <RarityTag rarity={note.rarity} size="sm" />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--ink-500)' }}>
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
                        className="px-2 py-1 rounded text-[10px] font-display hover:opacity-80"
                        style={{ background: '#FAF7F0', border: '1px solid #EADECA', color: 'var(--ink-700)' }}
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
                      <span className="text-xs font-display" style={{ color: 'var(--ink-400)' }}>
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
          {position?.accuracy && (
            <div
              className="hud-chip hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-1"
              style={{
                background: 'rgba(255, 255, 255, 0.90)',
                border: '1px solid #EADECA',
                color: 'var(--ink-700)',
              }}
              title="Real-time GPS Accuracy"
            >
              <Crosshair size={12} weight="bold" color="var(--hanko)" />
              <span>GPS ~{Math.round(position.accuracy)}m</span>
            </div>
          )}
        </div>

        {/* Right HUD Controls: AR Mode, Sound & List Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Switch to AR Mode Button */}
          <button
            onClick={() => setIsARModeOpen(true)}
            className="hud-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer shadow-md active:scale-95 transition-all"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--hanko)',
              color: 'var(--hanko)',
            }}
            title="Switch to AR Camera Mode (Pokémon GO & GTA Pickup Style)"
            aria-label="Switch to AR Mode"
          >
            <Camera size={16} weight="fill" color="var(--hanko)" />
            <span className="font-display">AR Mode</span>
          </button>

          <button
            onClick={toggleSound}
            className="hud-chip flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              padding: 0,
              borderRadius: '50%',
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1px solid #EADECA',
              color: 'var(--ink-700)',
            }}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
          </button>

          <button
            onClick={() => setIsListView((v) => !v)}
            className="hud-chip flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              padding: 0,
              borderRadius: '50%',
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1px solid #EADECA',
              color: 'var(--ink-700)',
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

      {/* ── LAYOVER CHIP (Step 1.6: opens Layover Sheet) ─────────────── */}
      <div className="fixed top-16 left-4 z-40 safe-top pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsLayoverSheetOpen(true)}
          className="hud-chip flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-sm"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #EADECA',
            color: 'var(--ink-700)',
            fontSize: 'var(--text-xs)',
          }}
          aria-label="Open Layover Duration Sheet"
        >
          <Clock size={14} weight="bold" color="var(--hanko)" />
          <span className="font-bold">
            {layoverHours}h reach ({reachKm.toFixed(1)} km)
          </span>
        </button>

        {position?.accuracy && (
          <div
            className="hud-chip flex sm:hidden items-center gap-1 text-[10px] px-2 py-1 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid #EADECA', color: 'var(--ink-500)' }}
            title="Real-time GPS Accuracy"
          >
            <Crosshair size={11} weight="bold" color="var(--hanko)" />
            <span>~{Math.round(position.accuracy)}m</span>
          </div>
        )}
      </div>

      {/* ── MAP RECENTER BUTTON (Returns to Street View) ────────────── */}
      {!isListView && (
        <div className="fixed top-16 right-4 z-40 safe-top pointer-events-auto">
          <button
            onClick={handleRecenterStreetView}
            className="hud-chip flex items-center justify-center transition-transform active:scale-95 shadow-md"
            style={{
              width: 38,
              height: 38,
              padding: 0,
              borderRadius: '50%',
              cursor: 'pointer',
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              color: 'var(--hanko)',
            }}
            title="Recenter Street View"
            aria-label="Recenter Street View"
          >
            <NavigationArrow size={18} weight="bold" color="var(--hanko)" />
          </button>
        </div>
      )}

      {/* ── BOTTOM HUD & ACTIONS ────────────────────────────────────── */}
      {/* If note is in range (<= 60m), show docking ArrivedBar */}
      {nearestNote && nearestDistance !== null && nearestDistance <= 60 ? (
        <div ref={arrivedBarWrapRef}>
          <ArrivedBar
            onOpen={() => handleOpenNote(nearestNote)}
            proximityState="here"
          />
        </div>
      ) : (
        /* Otherwise show nearest note radar chip */
        <div
          className="fixed left-4 z-40 pointer-events-auto"
          style={{ bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px) + var(--dock-gap))' }}
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
      <LayoverSheet
        isOpen={isLayoverSheetOpen}
        onClose={() => setIsLayoverSheetOpen(false)}
        onShowReach={handleShowReachView}
        notesInReachCount={notesInReachCount}
      />

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

      {/* ── INTERACTIVE AR NOTE VIEW (Pokémon GO & GTA Pickups) ────── */}
      {isARModeOpen && (
        <ARNoteView
          onClose={() => setIsARModeOpen(false)}
          onOpenNote={(note) => {
            setIsARModeOpen(false);
            handleOpenNote(note);
          }}
          onDropNote={() => {
            setIsARModeOpen(false);
            setIsCreateNoteOpen(true);
          }}
        />
      )}
    </div>
  );
};
