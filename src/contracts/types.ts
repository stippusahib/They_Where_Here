/* ============================================================
 * THEY WERE HERE — Shared Type Contracts
 * This file is the single source of truth for types shared
 * across features. Change only by agreement between agents.
 * ============================================================ */

/** Application name constant — change in one place */
export const APP_NAME = 'They Were Here' as const;

/**
 * Physical Proximity Radii (Pokemon GO Calibration)
 * POKEMON_GO_TOUCH_RADIUS_METERS: 40m (exact PokeStop/Gym interaction disc)
 * POKEMON_GO_APPROACH_RADIUS_METERS: 80m (close radar approach ring)
 * POKEMON_GO_RADAR_RADIUS_METERS: 350m (5-minute walking detection perimeter)
 */
export const POKEMON_GO_TOUCH_RADIUS_METERS = 40 as const;
export const POKEMON_GO_APPROACH_RADIUS_METERS = 80 as const;
export const POKEMON_GO_RADAR_RADIUS_METERS = 350 as const;

/** Minimum characters required for note text */
export const MIN_NOTE_CHARS = 15 as const;

/** Maximum voice recording limit in seconds */
export const MAX_VOICE_DURATION_SECONDS = 30 as const;

/** Note rarity tiers */
export type NoteRarity = 'common' | 'rare' | 'legendary';

/** Note visibility status */
export type NoteStatus = 'live' | 'hidden';

/** Sky theme for time-of-day tinting */
export type SkyTheme = 'night' | 'dawn' | 'day' | 'golden';

/** Proximity state for the nearest sealed note */
export type ProximityState = 'far' | 'near' | 'close' | 'here' | 'unsure';

/** Cardinal direction for guidance text */
export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/** GPS position from the location engine */
export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  timestamp: number;
}

/** A note as returned by notes_in_bounds RPC */
export interface MapNote {
  id: string;
  lat: number;
  lng: number;
  rarity: NoteRarity;
  stamp: number;
  tone: number;
  unlock_count: number;
  worth_yes: number;
  worth_no: number;
  is_seed: boolean;
  unlocked: boolean;
  audio_url?: string;
  audio_duration?: number;
}

/** Result from unlock_note RPC */
export interface UnlockResult {
  body: string;
  rarity: NoteRarity;
  stamp: number;
  tone: number;
  newly_unlocked: boolean;
  xp: number;
  audio_url?: string;
  audio_duration?: number;
}

/** A note in the user's passport (from my_passport RPC) */
export interface PassportNote {
  id: string;
  title?: string;
  body: string;
  rarity: NoteRarity;
  stamp: number;
  tone: number;
  unlocked_at: string;
  unlock_count: number;
  worth_yes: number;
  worth_no: number;
  is_seed: boolean;
  audio_url?: string;
  audio_duration?: number;
}

/** Backward compatibility alias */
export type AlbumNote = PassportNote;

/** User profile from ensure_profile RPC */
export interface UserProfile {
  id: string;
  handle: string;
  avatar: number;
  xp: number;
  unlock_count: number;
  worth_received: number;
  rerolls_used: number;
  created_at: string;
}

/** Leaderboard entry */
export interface LeaderboardEntry {
  id: string;
  handle: string;
  avatar: number;
  xp: number;
  unlock_count: number;
  worth_received: number;
}

/** Tier availability from tier_availability RPC */
export interface TierAvailability {
  common: { allowed: boolean; nearest_m: number | null };
  rare: { allowed: boolean; nearest_m: number | null };
  legendary: { allowed: boolean; nearest_m: number | null };
}

/** Result from create_note RPC */
export interface CreateNoteResult {
  id: string;
  visible_at: string;
}

/** App config key-value pairs */
export interface AppConfig {
  notes_enabled: boolean;
  publish_delay_minutes: number;
  max_notes_per_day: number;
  unlock_radius_m: number;
  max_accuracy_m: number;
  common_spacing_m: number;
  rare_spacing_m: number;
  legendary_spacing_m: number;
  ar_and_voice_enabled?: boolean;
}

/** Location provider interface — implemented by RealGPS, SimulatedGPS, Replay */
export interface LocationProvider {
  start(): void;
  stop(): void;
  onPosition(callback: (pos: GeoPosition) => void): void;
  onError(callback: (error: GeolocationPositionError | Error) => void): void;
}

/** Error codes from RPCs mapped to friendly copy */
export type RPCErrorCode =
  | 'auth_required'
  | 'bad_position'
  | 'low_accuracy'
  | 'note_not_found'
  | 'own_note'
  | 'too_far'
  | 'rate_limited'
  | 'notes_disabled'
  | 'body_rejected'
  | 'tier_blocked'
  | 'daily_cap'
  | 'unsafe_spot';

/** Tab identifiers for the bottom navigation */
export type TabId = 'map' | 'passport' | 'ranks' | 'me';
