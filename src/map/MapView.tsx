/* ============================================================
 * THEY WERE HERE — MapView Component (MapLibre GL)
 * Cinematic anime radar map: styled vector tiles, registered canvas
 * orbs with rarity weights, distance labels, user pin with halo,
 * GeoJSON accuracy ring, and layover reach ring.
 * ============================================================ */

import React, { useEffect, useRef } from 'react';
import {
  Map,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type ErrorEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { VENUE_CENTER } from '@/config/venue';
import { registerOrbs } from './OrbImages';
import { setupMapLayers, updateMapLayerColors } from './layers';
import { createUserPin } from './userPin';
import { createNotePin } from './notePin';
import { circlePolygon } from './geoShapes';
import { haversineDistance, formatDistance } from '@/lib/geo';
import type { ExtendedNote } from '@/lib/seedNotes';
import type { GeoPosition } from '@/contracts/types';
import { useAppStore } from '@/state/store';

// Explicitly register standalone web worker to resolve Vite bundling
setWorkerUrl('/maplibre-gl-worker.mjs');

interface MapViewProps {
  position: GeoPosition | null;
  notes: ExtendedNote[];
  layoverHours: number;
  reachKm: number;
  nearestNote: ExtendedNote | null;
  nearestDistance: number | null;
  onOrbClick: (note: ExtendedNote) => void;
  onMapReady?: (map: Map) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  position,
  notes,
  layoverHours: _layoverHours,
  reachKm,
  nearestNote,
  nearestDistance,
  onOrbClick,
  onMapReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const userPinSetHeadingRef = useRef<((h: number | null) => void) | null>(null);
  const proxyMarkerRef = useRef<Marker | null>(null);
  const notePinsRef = useRef<
    Record<
      string,
      {
        marker: Marker;
        update: (note: ExtendedNote, label: string) => void;
        destroy: () => void;
      }
    >
  >({});
  const isLoadedRef = useRef(false);

  const lastAccuracyUpdateRef = useRef<number>(0);
  const lastNotesUpdateRef = useRef<number>(0);

  const activeTheme = useAppStore((s) => s.activeTheme);
  const currentStyleRef = useRef<string>(activeTheme === 'day' ? '/map-style-day.json' : '/map-style.json');

  const centerLng = position?.lng ?? VENUE_CENTER.lng;
  const centerLat = position?.lat ?? VENUE_CENTER.lat;

  const notesRef = useRef(notes);
  notesRef.current = notes;
  const positionRef = useRef(position);
  positionRef.current = position;
  const onOrbClickRef = useRef(onOrbClick);
  onOrbClickRef.current = onOrbClick;

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialStyle = activeTheme === 'day' ? '/map-style-day.json' : '/map-style.json';
    currentStyleRef.current = initialStyle;

    const map = new Map({
      container: containerRef.current,
      style: initialStyle,
      center: [centerLng, centerLat],
      zoom: 16.0,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.on('error', (e: ErrorEvent) => {
      console.warn('MapLibre event:', e);
    });

    const onStyleData = () => {
      registerOrbs(map);
      setupMapLayers(map);
      isLoadedRef.current = true;
      syncAllSources(true);
      syncUserMarker();
      syncNoteMarkers();
      if (onMapReady) {
        onMapReady(map);
      }
    };

    map.on('load', onStyleData);
    map.on('styledata', () => {
      registerOrbs(map);
      setupMapLayers(map);
      updateMapLayerColors(map);
      syncAllSources(true);
      syncUserMarker();
      syncNoteMarkers();
    });

    // Orb click handler
    map.on('click', 'orbs', (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      if (!feat) return;
      const noteId = feat.properties?.id;
      if (noteId) {
        const found = notesRef.current.find((n) => n.id === noteId);
        if (found && onOrbClickRef.current) onOrbClickRef.current(found);
      }
    });

    map.on('mouseenter', 'orbs', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'orbs', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      Object.values(notePinsRef.current).forEach((pin) => pin.destroy());
      notePinsRef.current = {};
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  // Switch map style when theme changes (Day/Night)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const targetStyle = activeTheme === 'day' ? '/map-style-day.json' : '/map-style.json';
    if (currentStyleRef.current !== targetStyle) {
      currentStyleRef.current = targetStyle;
      map.setStyle(targetStyle);
    }
  }, [activeTheme]);

  // Sync GeoJSON notes source with distance calculation (throttled to 2s)
  const syncNotesSource = (force = false) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const now = Date.now();
    if (!force && now - lastNotesUpdateRef.current < 2000) return;
    lastNotesUpdateRef.current = now;

    const notesSource = map.getSource('notes') as GeoJSONSource | undefined;
    if (notesSource) {
      const features = notes.map((note) => {
        let dist = 0;
        let distLabel = '';
        if (position) {
          dist = Math.round(haversineDistance(position.lat, position.lng, note.lat, note.lng));
          distLabel = formatDistance(dist);
        }
        const icon = `orb-${note.rarity}-${note.unlocked ? 'opened' : 'sealed'}`;
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [note.lng, note.lat],
          },
          properties: {
            id: note.id,
            rarity: note.rarity,
            unlocked: Boolean(note.unlocked),
            icon,
            title: note.title,
            body: note.body,
            dist,
            distLabel,
          },
        };
      });

      notesSource.setData({
        type: 'FeatureCollection',
        features,
      });
    }
  };

  // Sync Reach circle source
  const syncReachSource = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !position) return;

    const reachSource = map.getSource('reach') as GeoJSONSource | undefined;
    if (reachSource) {
      const reachPolygon = circlePolygon(position.lng, position.lat, reachKm * 1000);
      reachSource.setData({
        type: 'FeatureCollection',
        features: [reachPolygon],
      });
    }
  };

  // Sync Accuracy GeoJSON source (throttled to 1s)
  const syncAccuracySource = (force = false) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !position) return;

    const now = Date.now();
    if (!force && now - lastAccuracyUpdateRef.current < 1000) return;
    lastAccuracyUpdateRef.current = now;

    const accuracySource = map.getSource('me-accuracy') as GeoJSONSource | undefined;
    if (accuracySource) {
      // Clamp drawn radius between 8m and 120m
      const clampedRadius = Math.max(8, Math.min(120, position.accuracy || 20));
      const accPolygon = circlePolygon(position.lng, position.lat, clampedRadius);
      accuracySource.setData({
        type: 'FeatureCollection',
        features: [accPolygon],
      });
    }
  };

  const syncAllSources = (force = false) => {
    syncNotesSource(force);
    syncReachSource();
    syncAccuracySource(force);
  };

  useEffect(() => {
    syncNotesSource(true);
  }, [notes]);

  useEffect(() => {
    syncNotesSource(false);
  }, [position]);

  useEffect(() => {
    syncReachSource();
  }, [reachKm, position]);

  useEffect(() => {
    syncAccuracySource(false);
  }, [position]);

  const hasInitialCenteredRef = useRef(false);
  const hasRealGpsCenteredRef = useRef(false);

  // Synchronize User Location Pin (always attached & on top)
  const syncUserMarker = () => {
    const map = mapRef.current;
    if (!map) return;

    const currentPos = positionRef.current || {
      lat: VENUE_CENTER.lat,
      lng: VENUE_CENTER.lng,
      accuracy: 20,
      heading: null,
      timestamp: Date.now(),
    };

    const userPinEl = userMarkerRef.current?.getElement();
    const isAttached = Boolean(userPinEl && document.body.contains(userPinEl));

    if (!userMarkerRef.current || !isAttached) {
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.remove();
        } catch {
          // ignore
        }
      }
      const { marker, setHeading } = createUserPin();
      marker.setLngLat([currentPos.lng, currentPos.lat]).addTo(map);
      marker.getElement().style.zIndex = '100';
      userMarkerRef.current = marker;
      userPinSetHeadingRef.current = setHeading;
      setHeading(currentPos.heading);
      console.log('[UserPin] Mounted fresh user pin marker at', currentPos.lng, currentPos.lat);
    } else {
      userMarkerRef.current.setLngLat([currentPos.lng, currentPos.lat]);
      if (userPinSetHeadingRef.current) {
        userPinSetHeadingRef.current(currentPos.heading);
      }
    }
  };

  // Synchronize Note DOM Pins (with deterministic de-clustering for overlapping coords)
  const syncNoteMarkers = () => {
    const map = mapRef.current;
    if (!map) return;

    const currentPins = notePinsRef.current;
    const currentNotes = notesRef.current;
    const currentNoteIds = new Set(currentNotes.map((n) => n.id));

    // Remove obsolete pins
    for (const id of Object.keys(currentPins)) {
      if (!currentNoteIds.has(id)) {
        currentPins[id]?.destroy();
        delete currentPins[id];
      }
    }

    // Group notes by coordinate proximity (< 0.0001 deg ~10m) to de-cluster overlapping pins
    const coordinateGroups: Record<string, ExtendedNote[]> = {};
    currentNotes.forEach((note) => {
      const key = `${note.lat.toFixed(4)},${note.lng.toFixed(4)}`;
      if (!coordinateGroups[key]) coordinateGroups[key] = [];
      coordinateGroups[key].push(note);
    });

    const pos = positionRef.current;

    currentNotes.forEach((note) => {
      let distLabel = '';
      if (pos) {
        const dist = Math.round(haversineDistance(pos.lat, pos.lng, note.lat, note.lng));
        distLabel = formatDistance(dist);
      }

      // De-cluster notes that share the exact same spot (like TinkerSpace & College AD)
      const key = `${note.lat.toFixed(4)},${note.lng.toFixed(4)}`;
      const group = coordinateGroups[key];
      let displayLat = note.lat;
      let displayLng = note.lng;

      if (group && group.length > 1) {
        const index = group.findIndex((n) => n.id === note.id);
        const angle = (index * 2 * Math.PI) / group.length;
        // 22 meter radius visual separation
        displayLat += Math.sin(angle) * 0.0002;
        displayLng += Math.cos(angle) * 0.0002;
      }

      const displayNote = { ...note, lat: displayLat, lng: displayLng };

      const existing = currentPins[note.id];
      const pinEl = existing?.marker?.getElement();
      const isAttached = pinEl && pinEl.parentElement;

      if (existing && isAttached) {
        existing.update(displayNote, distLabel);
      } else {
        if (existing) {
          existing.destroy();
        }
        const newPin = createNotePin(displayNote, distLabel, (clicked) => {
          if (onOrbClickRef.current) {
            onOrbClickRef.current(clicked);
          }
        });
        newPin.marker.addTo(map);
        currentPins[note.id] = newPin;
      }
    });
  };

  // Manage User Marker & Camera centering on position updates
  useEffect(() => {
    syncUserMarker();

    const map = mapRef.current;
    if (!map || !position) return;

    if (!hasInitialCenteredRef.current) {
      hasInitialCenteredRef.current = true;
      map.easeTo({ center: [position.lng, position.lat], zoom: 16.0, duration: 700 });
    }

    // Detect real device GPS fix away from default placeholder
    const isRealGps =
      Math.abs(position.lat - VENUE_CENTER.lat) > 0.005 ||
      Math.abs(position.lng - VENUE_CENTER.lng) > 0.005;

    if (isRealGps && !hasRealGpsCenteredRef.current) {
      hasRealGpsCenteredRef.current = true;
      map.easeTo({ center: [position.lng, position.lat], zoom: 16.0, duration: 800 });
    }
  }, [position]);

  // Manage Note DOM Markers on notes or position change
  useEffect(() => {
    syncNoteMarkers();
  }, [notes, position, onOrbClick]);

  // Manage Nearest Orb Pulse Proxy Marker (within 400m)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const shouldShow =
      nearestNote &&
      !nearestNote.unlocked &&
      nearestDistance !== null &&
      nearestDistance <= 400;

    if (shouldShow && nearestNote) {
      if (!proxyMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'orb-proxy-marker';
        const marker = new Marker({ element: el, anchor: 'center' })
          .setLngLat([nearestNote.lng, nearestNote.lat])
          .addTo(map);
        proxyMarkerRef.current = marker;
      } else {
        proxyMarkerRef.current.setLngLat([nearestNote.lng, nearestNote.lat]);
      }

      // Add close / here animation classes
      const el = proxyMarkerRef.current.getElement();
      el.classList.remove('state-close', 'state-here');
      if (nearestDistance !== null) {
        if (nearestDistance <= 60) {
          el.classList.add('state-here');
        } else if (nearestDistance <= 150) {
          el.classList.add('state-close');
        }
      }
    } else if (proxyMarkerRef.current) {
      proxyMarkerRef.current.remove();
      proxyMarkerRef.current = null;
    }
  }, [nearestNote, nearestDistance]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ background: 'var(--ink-900)' }}
    />
  );
};
