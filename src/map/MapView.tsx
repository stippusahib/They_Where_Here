/* ============================================================
 * THEY WERE HERE — MapView Component (MapLibre GL)
 * Cinematic anime radar map: styled vector tiles, registered canvas
 * orbs, nearest orb proxy pulse marker, user dot & accuracy halo,
 * and layover reach radius.
 * ============================================================ */

import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, type GeoJSONSource, type MapLayerMouseEvent, type ErrorEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { VENUE_CENTER } from '@/config/venue';
import { registerOrbs } from './OrbImages';
import { setupMapLayers } from './layers';
import type { ExtendedNote } from '@/lib/seedNotes';
import type { GeoPosition } from '@/contracts/types';

interface MapViewProps {
  position: GeoPosition | null;
  notes: ExtendedNote[];
  layoverHours: number;
  reachKm: number;
  nearestNote: ExtendedNote | null;
  nearestDistance: number | null;
  onOrbClick: (note: ExtendedNote) => void;
}

function createCircleFeature(lat: number, lng: number, radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  const kmPerLat = 110.574;
  const kmPerLng = 111.32 * Math.cos((lat * Math.PI) / 180);

  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const dLat = (radiusKm * Math.sin(angle)) / kmPerLat;
    const dLng = (radiusKm * Math.cos(angle)) / kmPerLng;
    coords.push([lng + dLng, lat + dLat]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}

export const MapView: React.FC<MapViewProps> = ({
  position,
  notes,
  layoverHours,
  reachKm,
  nearestNote,
  nearestDistance,
  onOrbClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const proxyMarkerRef = useRef<Marker | null>(null);
  const reachMarkerRef = useRef<Marker | null>(null);
  const [, setMapFallback] = useState<string>('none');
  const isLoadedRef = useRef(false);

  const centerLng = position?.lng ?? VENUE_CENTER.lng;
  const centerLat = position?.lat ?? VENUE_CENTER.lat;

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: '/map-style.json',
      center: [centerLng, centerLat],
      zoom: 15,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.on('error', (e: ErrorEvent) => {
      console.warn('Map style error, falling back:', e);
      if (e.error) {
        map.setStyle('https://tiles.openfreemap.org/styles/liberty');
        setMapFallback('basic');
      }
    });

    const onStyleData = () => {
      registerOrbs(map);
      setupMapLayers(map);
      isLoadedRef.current = true;
      updateSources();
    };

    map.on('load', onStyleData);
    map.on('styledata', () => {
      registerOrbs(map);
      setupMapLayers(map);
      updateSources();
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

  // Update GeoJSON sources when notes or reach radius changes
  const updateSources = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Update notes GeoJSON
    const notesSource = map.getSource('notes') as GeoJSONSource | undefined;
    if (notesSource) {
      const features = notes.map((note) => ({
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
        },
      }));

      notesSource.setData({
        type: 'FeatureCollection',
        features,
      });
    }

    // Update layover reach circle
    const reachSource = map.getSource('reach') as GeoJSONSource | undefined;
    if (reachSource && position) {
      const circleFeature = createCircleFeature(position.lat, position.lng, reachKm);
      reachSource.setData({
        type: 'FeatureCollection',
        features: [circleFeature],
      });
    }
  };

  useEffect(() => {
    updateSources();
  }, [notes, reachKm, position]);

  // Manage User Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-marker-wrap';
      const ring = document.createElement('div');
      ring.className = 'accuracy-ring';
      const dot = document.createElement('div');
      dot.className = 'user-dot';
      const dotCore = document.createElement('div');
      dotCore.className = 'user-dot-core';
      dot.appendChild(dotCore);
      el.appendChild(ring);
      el.appendChild(dot);

      const marker = new Marker({ element: el })
        .setLngLat([position.lng, position.lat])
        .addTo(map);

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLngLat([position.lng, position.lat]);
    }

    // Update accuracy halo scale
    const el = userMarkerRef.current.getElement();
    const px = Math.max(30, Math.min(120, (position.accuracy || 20) * 2.5));
    el.style.setProperty('--acc-size', `${px}px`);
  }, [position]);

  // Manage Reach Label Marker (anchored at top of reach circle)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    const labelLat = position.lat + reachKm / 111.32;
    const labelLng = position.lng;

    if (!reachMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'reach-label';
      el.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v40h24A8,8,0,0,1,168,128Z"/>
        </svg>
        <span>${layoverHours}h reach · ${reachKm.toFixed(1)} km</span>
      `;

      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat([labelLng, labelLat])
        .addTo(map);

      reachMarkerRef.current = marker;
    } else {
      reachMarkerRef.current.setLngLat([labelLng, labelLat]);
      const span = reachMarkerRef.current.getElement().querySelector('span');
      if (span) span.innerText = `${layoverHours}h reach · ${reachKm.toFixed(1)} km`;
    }
  }, [position, layoverHours, reachKm]);

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
        const marker = new Marker({ element: el })
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

  return <div ref={containerRef} className="w-full h-full" />;
};
