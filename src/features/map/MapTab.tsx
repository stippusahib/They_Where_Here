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
  ShieldWarning,
  CornersOut,
  Plus,
  Minus,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import {
  POKEMON_GO_TOUCH_RADIUS_METERS,
  POKEMON_GO_APPROACH_RADIUS_METERS,
  POKEMON_GO_RADAR_RADIUS_METERS,
} from '@/contracts/types';
import {
  haversineDistance,
  bearing,
  toCardinal,
  layoverReachKm,
  formatDistance,
} from '@/lib/geo';
import { MapView } from '@/map/MapView';
import { showReachView } from '@/map/geoShapes';
import { HandleChip, WallChip } from '@/ui/components/HudChip';
import { RadarChip } from '@/ui/components/RadarChip';
import { ArrivedBar } from '@/features/notes/ArrivedBar';
import { RarityTag } from '@/ui/components/RarityTag';
import { OrbSheet } from './OrbSheet';
import { LayoverSheet } from '@/features/layover/LayoverSheet';
import { RevealModal } from '@/features/reveal/RevealModal';
import { CreateNoteModal } from '@/features/notes/CreateNoteModal';
import { ARNoteView } from '@/features/ar/ARNoteView';
import { checkLayoverExit } from '@/lib/visaCheck';
import { requestLocationPermission } from '@/lib/locationService';
import { createLocalDemoNotes, type ExtendedNote } from '@/lib/seedNotes';
import { VENUE_CENTER } from '@/config/venue';

export const MapTab: React.FC = () => {
  const position = useAppStore((s) => s.position);
  const setPosition = useAppStore((s) => s.setPosition);
  const locationPermission = useAppStore((s) => s.locationPermission);
  const profile = useAppStore((s) => s.profile);
  const notes = useAppStore((s) => s.notes);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const toggleSound = useAppStore((s) => s.toggleSound);
  const isSimulated = useAppStore((s) => s.isSimulated);
  const layoverHours = useAppStore((s) => s.layoverHours);
  const passportCountry = useAppStore((s) => s.passportCountry);
  const layoverCountry = useAppStore((s) => s.layoverCountry);
  const isCreateNoteOpen = useAppStore((s) => s.isCreateNoteOpen);
  const setIsCreateNoteOpen = useAppStore((s) => s.setIsCreateNoteOpen);
  const activeInspectNote = useAppStore((s) => s.activeInspectNote);
  const setActiveInspectNote = useAppStore((s) => s.setActiveInspectNote);
  const activeRevealNote = useAppStore((s) => s.activeRevealNote);
  const setActiveRevealNote = useAppStore((s) => s.setActiveRevealNote);
  const arAndVoiceEnabled = useAppStore((s) => s.config.ar_and_voice_enabled ?? true);

  const [isListView, setIsListView] = useState(false);
  const [isLayoverSheetOpen, setIsLayoverSheetOpen] = useState(false);
  const [isARModeOpen, setIsARModeOpen] = useState(false);

  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const arrivedBarWrapRef = useRef<HTMLDivElement>(null);

  // Layover Reach Radius & Visa Exit Status
  const reachKm = useMemo(() => layoverReachKm(layoverHours), [layoverHours]);
  const reachMeters = reachKm * 1000;
  const exitAssessment = useMemo(
    () => checkLayoverExit(passportCountry, layoverCountry),
    [passportCountry, layoverCountry]
  );

  // Supply local demo exploration notes around tester's GPS if far from venue (> 15km)
  const effectiveNotes = useMemo(() => {
    if (!position) return notes;
    const hasNearby = notes.some(
      (n) => haversineDistance(position.lat, position.lng, n.lat, n.lng) < 15000
    );
    if (!hasNearby) {
      const localDemos = createLocalDemoNotes(position.lat, position.lng);
      return [...localDemos, ...notes];
    }
    return notes;
  }, [notes, position]);

  // Filter and sort notes by distance
  const notesWithDistance = useMemo(() => {
    if (!position) return [];
    return effectiveNotes
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
  }, [effectiveNotes, position, reachMeters]);

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
    if (!el || !nearestNote || nearestDistance === null || nearestDistance > POKEMON_GO_TOUCH_RADIUS_METERS) {
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
    requestLocationPermission();
    if (mapInstanceRef.current) {
      const targetPos = position || { lat: VENUE_CENTER.lat, lng: VENUE_CENTER.lng };
      mapInstanceRef.current.easeTo({
        center: [targetPos.lng, targetPos.lat],
        zoom: 16.0,
        duration: 700,
      });
    }
  };

  const handleFitAllNotes = () => {
    const map = mapInstanceRef.current;
    if (!map || effectiveNotes.length === 0) return;

    // Filter notes that are within 15km of the user or active cluster
    const localNotes = position
      ? effectiveNotes.filter(
          (n) => haversineDistance(position.lat, position.lng, n.lat, n.lng) <= 15000
        )
      : [];

    const targetNotes = localNotes.length > 0 ? localNotes : effectiveNotes;

    const lngs = targetNotes.map((n) => n.lng);
    const lats = targetNotes.map((n) => n.lat);
    if (position && localNotes.length > 0) {
      lngs.push(position.lng);
      lats.push(position.lat);
    }

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: { top: 90, bottom: 120, left: 50, right: 50 },
        maxZoom: 16.2,
        minZoom: 14.5,
        duration: 800,
      }
    );
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut({ duration: 300 });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{ background: '#FFF6E5' }}>
      {/* ── MAP OR LIST LAYER ────────────────────────────────────────── */}
      {!isListView ? (
        <div className="map-layer">
          <MapView
            position={position}
            notes={effectiveNotes}
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
              const isHere = note.distanceMeters <= POKEMON_GO_TOUCH_RADIUS_METERS;
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
                        title="Stage Mode: Teleport within 40m"
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

      {/* ── 2D MAP HUD & ACTIONS (Hidden when in AR Mode) ─────────── */}
      {!isARModeOpen && (
        <>
          {/* ── TOP HUD ─────────────────────────────────────────────────── */}
          <div className="fixed top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-40 flex items-center justify-between safe-top pointer-events-none">
            {/* Left HUD chips (Profile & Overnight count) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto min-w-0 max-w-[calc(100%-145px)] sm:max-w-none overflow-hidden">
              <HandleChip
                handle={profile?.handle ?? 'swift_fox'}
                xp={profile?.xp ?? 140}
              />
              <WallChip count={overnightNotesCount} />
            </div>

            {/* Right HUD Controls: AR Mode, Sound & List Toggle (Always visible on mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0 ml-auto z-10">
              {/* Switch to AR Mode Button (guarded by config kill-switch) */}
              {arAndVoiceEnabled && (
                <button
                  onClick={() => setIsARModeOpen(true)}
                  className="hud-chip flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid var(--hanko)',
                    color: 'var(--hanko)',
                    boxShadow: '0 2px 10px rgba(210, 63, 90, 0.20)',
                  }}
                  title="Switch to AR Camera Mode (Pokémon GO & GTA Pickup Style)"
                  aria-label="Switch to AR Mode"
                >
                  <Camera size={15} weight="fill" color="var(--hanko)" />
                  <span className="font-display font-black text-xs">AR<span className="hidden sm:inline">&nbsp;Mode</span></span>
                </button>
              )}

              <button
                onClick={toggleSound}
                className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer active:scale-95 transition-transform shrink-0"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EADECA',
                  color: 'var(--ink-700)',
                }}
                aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              >
                {soundEnabled ? <SpeakerHigh size={16} /> : <SpeakerSlash size={16} />}
              </button>

              <button
                onClick={() => setIsListView((v) => !v)}
                className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer active:scale-95 transition-transform shrink-0"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EADECA',
                  color: 'var(--ink-700)',
                }}
                aria-label={isListView ? 'Switch to map view' : 'Switch to list view'}
              >
                {isListView ? (
                  <MapTrifold size={16} weight="bold" />
                ) : (
                  <List size={16} weight="bold" />
                )}
              </button>
            </div>
          </div>

      {/* ── LAYOVER CHIP (Step 1.6: opens Layover Sheet) ─────────────── */}
      <div className="fixed top-14 sm:top-16 left-2.5 sm:left-4 z-40 safe-top pointer-events-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setIsLayoverSheetOpen(true)}
          className="hud-chip flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-sm text-xs"
          style={{
            background: '#FFFFFF',
            border: exitAssessment.canExit ? '1.5px solid #EADECA' : '1.5px solid rgba(210, 63, 90, 0.45)',
            color: 'var(--ink-700)',
          }}
          aria-label="Open Layover Duration and Visa Rules Sheet"
        >
          {exitAssessment.canExit ? (
            <>
              <Clock size={14} weight="bold" color="var(--hanko)" />
              <span className="font-bold">
                {layoverHours}h reach ({reachKm.toFixed(1)} km)
              </span>
            </>
          ) : (
            <>
              <ShieldWarning size={14} weight="bold" color="var(--hanko)" />
              <span className="font-bold text-[var(--hanko)]">
                Airside Only (No Exit)
              </span>
            </>
          )}
        </button>

        {locationPermission !== 'granted' ? (
          <button
            type="button"
            onClick={() => requestLocationPermission()}
            className="hud-chip flex items-center gap-1 text-[10px] px-2.5 py-1 shadow-sm font-bold bg-white text-[var(--hanko)] border border-[var(--hanko)]/40 cursor-pointer active:scale-95 transition-all"
            title="Enable GPS Location"
          >
            <Crosshair size={12} weight="bold" color="var(--hanko)" />
            <span>Enable GPS</span>
          </button>
        ) : position?.accuracy ? (
          <div
            className="hud-chip flex sm:hidden items-center gap-1 text-[10px] px-2 py-1 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid #EADECA', color: 'var(--ink-500)' }}
            title="Real-time GPS Accuracy"
          >
            <Crosshair size={11} weight="bold" color="var(--mint)" />
            <span>±{Math.round(position.accuracy)}m</span>
          </div>
        ) : null}
      </div>

      {/* ── TACTICAL MAP CONTROLS CLUSTER (Recenter, Overview, Zoom) ── */}
      {!isListView && (
        <div className="fixed top-14 sm:top-16 right-2.5 sm:right-4 z-40 safe-top pointer-events-auto flex flex-col gap-2">
          {/* Recenter Live GPS */}
          <button
            type="button"
            onClick={handleRecenterStreetView}
            className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer transition-transform active:scale-95 shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              color: 'var(--hanko)',
            }}
            title="Recenter to Live Street View"
            aria-label="Recenter to Live Street View"
          >
            <NavigationArrow size={16} weight="bold" color="var(--hanko)" />
          </button>

          {/* Fit All Notes Overview */}
          <button
            type="button"
            onClick={handleFitAllNotes}
            className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer transition-transform active:scale-95 shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              color: 'var(--ink-700)',
            }}
            title="Overview: Fit All Notes On Screen"
            aria-label="Overview: Fit All Notes On Screen"
          >
            <CornersOut size={16} weight="bold" color="var(--ink-700)" />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer transition-transform active:scale-95 shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              color: 'var(--ink-700)',
            }}
            title="Zoom In (Detailed View)"
            aria-label="Zoom In"
          >
            <Plus size={15} weight="bold" color="var(--ink-700)" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="hud-chip flex items-center justify-center w-8 h-8 sm:w-[38px] sm:h-[38px] p-0 rounded-full cursor-pointer transition-transform active:scale-95 shadow-md"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADECA',
              color: 'var(--ink-700)',
            }}
            title="Zoom Out (Wide View)"
            aria-label="Zoom Out"
          >
            <Minus size={15} weight="bold" color="var(--ink-700)" />
          </button>
        </div>
      )}

      {/* ── BOTTOM HUD & ACTIONS ────────────────────────────────────── */}
      {/* If note is in range (<= 40m), show docking ArrivedBar */}
      {nearestNote && nearestDistance !== null && nearestDistance <= POKEMON_GO_TOUCH_RADIUS_METERS ? (
        <div ref={arrivedBarWrapRef}>
          <ArrivedBar
            onOpen={() => handleOpenNote(nearestNote)}
            proximityState="here"
          />
        </div>
      ) : (
        /* Otherwise show nearest note radar chip */
        <div
          className="fixed left-2.5 sm:left-4 z-40 pointer-events-auto max-w-[calc(100%-170px)] sm:max-w-none truncate"
          style={{ bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px) + var(--dock-gap))' }}
        >
          <RadarChip
            nearestNote={nearestNote}
            distance={nearestDistance}
            direction={nearestNote?.cardinalDir ?? 'NE'}
            state={
              nearestDistance === null
                ? 'unsure'
                : nearestDistance <= POKEMON_GO_APPROACH_RADIUS_METERS
                ? 'close'
                : nearestDistance <= POKEMON_GO_RADAR_RADIUS_METERS
                ? 'near'
                : 'far'
            }
            onClick={() => {
              if (nearestNote) {
                handleOrbClick(nearestNote);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.easeTo({
                    center: [nearestNote.lng, nearestNote.lat],
                    zoom: 15.5,
                    duration: 800,
                  });
                }
              }
            }}
          />
        </div>
      )}

      {/* Floating Action Button: Leave a note (Hidden when modal or sheet is open) */}
      {!isCreateNoteOpen && !isLayoverSheetOpen && !activeInspectNote && !activeRevealNote && (
        <button
          className={`fab-leave-note ${
            nearestNote && nearestDistance !== null && nearestDistance <= POKEMON_GO_TOUCH_RADIUS_METERS
              ? 'fab-leave-note--docked'
              : ''
          }`}
          onClick={() => setIsCreateNoteOpen(true)}
          aria-label="Leave a note"
        >
          <PaperPlaneTilt size={18} weight="fill" />
          <span>Leave a note</span>
        </button>
      )}
    </>
  )}

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
      {isARModeOpen && arAndVoiceEnabled && (
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
