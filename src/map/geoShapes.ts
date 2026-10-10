import type { Map as MapLibreMap } from 'maplibre-gl';

export function circlePolygon(lng: number, lat: number, radiusM: number, steps = 64) {
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  const ring = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)];
  });

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ring],
    },
  };
}

export function showReachView(
  map: MapLibreMap,
  center: { lat: number; lng: number },
  reachKm: number
) {
  const dLat = reachKm / 111.32;
  const dLng = reachKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));

  map.fitBounds(
    [
      [center.lng - dLng, center.lat - dLat],
      [center.lng + dLng, center.lat + dLat],
    ],
    {
      padding: { top: 120, bottom: 240, left: 24, right: 24 },
      duration: 900,
    }
  );
}

export function showStreetView(
  map: MapLibreMap,
  center: { lat: number; lng: number }
) {
  map.easeTo({
    center: [center.lng, center.lat],
    zoom: 16,
    duration: 700,
  });
}
