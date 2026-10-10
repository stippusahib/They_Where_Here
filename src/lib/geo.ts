/* ============================================================
 * LEFT HERE — Geo Utilities
 * Pure functions for distance, bearing, cardinal direction.
 * No side effects — unit testable.
 * ============================================================ */

import type { CardinalDirection } from '@/contracts/types';

/** Earth radius in meters */
const R = 6_371_000;

/** Convert degrees to radians */
export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Haversine distance between two lat/lng points in meters.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Bearing from point 1 to point 2 in degrees (0 = north, clockwise).
 */
export function bearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((toDeg(Math.atan2(y, x)) % 360) + 360) % 360;
}

/**
 * Convert a bearing angle to an 8-point cardinal direction.
 */
export function toCardinal(deg: number): CardinalDirection {
  const dirs: CardinalDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return dirs[index]!;
}

/**
 * Format distance for display.
 * Under 1000m: "480 m". Over: "1.4 km".
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Build guidance text: "480 m north east"
 */
export function guidanceText(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  const dist = haversineDistance(fromLat, fromLng, toLat, toLng);
  const dir = toCardinal(bearing(fromLat, fromLng, toLat, toLng));
  const dirText = dir
    .replace('N', 'north')
    .replace('S', 'south')
    .replace('E', 'east')
    .replace('W', 'west')
    .replace('northeast', 'north east')
    .replace('northwest', 'north west')
    .replace('southeast', 'south east')
    .replace('southwest', 'south west');
  return `${formatDistance(dist)} ${dirText}`;
}

/**
 * Layover Mode reach radius calculation.
 * hours * 4.5 km/h walking speed / 2 (return trip) / 1.3 (30% detour allowance)
 */
export function layoverReachKm(hours: number): number {
  return (hours * 4.5) / 2 / 1.3;
}
