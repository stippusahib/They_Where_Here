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
  const proxyMarkerRef = useRef<Marker | null>(null);
  const isLoadedRef = useRef(false);

  const lastAccuracyUpdateRef = useRef<number>(0);
  const lastNotesUpdateRef = useRef<number>(0);

  const activeTheme = useAppStore((s) => s.activeTheme);
  const currentStyleRef = useRef<string>(activeTheme === 'day' ? '/map-style-day.json' : '/map-style.json');

  const centerLng = position?.lng ?? VENUE_CENTER.lng;
  const centerLat = position?.lat ?? VENUE_CENTER.lat;

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialStyle = activeTheme === 'day' ? '/map-style-day.json' : '/map-style.json';
    currentStyleRef.current = initialStyle;

    const map = new Map({
      container: containerRef.current,
      style: initialStyle,
      center: [centerLng, centerLat],
      zoom: 15.2,
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
    });

    // Orb click handler
    map.on('click', 'orbs', (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      if (!feat) return;
      const noteId = feat.properties?.id;
      if (noteId) {
        const found = notes.find((n) => n.id === noteId);
        if (found) onOrbClick(found);
      }
    });

    map.on('mouseenter', 'orbs', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'orbs', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
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

  // Manage User Marker (Step 1.2: DOM marker created once, only setLngLat afterwards)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    if (!userMarkerRef.current) {
      const { marker } = createUserPin();
      marker.setLngLat([position.lng, position.lat]).addTo(map);
      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLngLat([position.lng, position.lat]);
    }

    if (!hasInitialCenteredRef.current && position) {
      hasInitialCenteredRef.current = true;
      map.easeTo({ center: [position.lng, position.lat], zoom: 15.5, duration: 700 });
    }
  }, [position]);

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
