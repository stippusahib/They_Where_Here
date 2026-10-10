/* ============================================================
 * LEFT HERE — Venue Configuration
 * Coordinates come from Alfie only (task H7).
 * NEVER invent or guess coordinates.
 * ============================================================ */

/** Default map center: Kozhikode (Calicut) */
export const DEFAULT_CENTER = {
  lat: 11.2588,
  lng: 75.7804,
} as const;

/** Default zoom level */
export const DEFAULT_ZOOM = 12;

/**
 * Venue coordinates — to be filled by Alfie after H7.
 * Until then, DEFAULT_CENTER is used.
 */
export const VENUE_CENTER = {
  lat: 11.2588, // PLACEHOLDER — Alfie must update with real TinkerSpace coords
  lng: 75.7804, // PLACEHOLDER — Alfie must update with real TinkerSpace coords
} as const;

/** Venue zoom for the hunt */
export const VENUE_ZOOM = 17;
