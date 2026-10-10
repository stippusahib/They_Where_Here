/* ============================================================
 * LEFT HERE — App Rules Configuration
 * Single source: all game rules and config defaults live here.
 * Mirrored in the DB table `app_config`.
 * ============================================================ */

import type { AppConfig } from '@/contracts/types';

/** Default configuration — matches the app_config table seed */
export const DEFAULT_CONFIG: Readonly<AppConfig> = {
  notes_enabled: true,
  publish_delay_minutes: 10,
  max_notes_per_day: 5,
  unlock_radius_m: 60,
  max_accuracy_m: 50,
  common_spacing_m: 150,
  rare_spacing_m: 5000,
  legendary_spacing_m: 20000,
};

/** Event Mode overrides for hackathon venue — applied via SQL */
export const EVENT_MODE_CONFIG: Partial<AppConfig> = {
  common_spacing_m: 50,
  unlock_radius_m: 40,
  max_accuracy_m: 35,
};

/** Demo Mode overrides */
export const DEMO_CONFIG: Partial<AppConfig> = {
  publish_delay_minutes: 0,
  max_notes_per_day: 50,
};

/** Note body constraints */
export const NOTE_BODY = {
  /** Maximum grapheme count shown to user */
  MAX_GRAPHEMES: 120,
  /** Hard server cap in code points */
  MAX_CODE_POINTS: 180,
  /** Minimum length */
  MIN_LENGTH: 1,
} as const;

/** XP rewards per rarity */
export const XP_REWARDS = {
  common: 10,
  rare: 30,
  legendary: 100,
  first_finder_bonus: 20,
  worth_vote: 5,
} as const;

/** Proximity distance bands (fixed, not config-driven) */
export const PROXIMITY_BANDS = {
  /** Beyond this = FAR */
  far_threshold_m: 600,
  /** Below far, above close = NEAR */
  near_threshold_m: 150,
  /** Hysteresis: enter HERE at (radius - 5m), leave at (radius + 15m) */
  here_enter_offset_m: -5,
  here_leave_offset_m: 15,
} as const;

/** Ping intervals by proximity state (ms) */
export const PING_INTERVALS = {
  far: null,
  near: 3000,
  close: 1200,
  here: null,
  unsure: null,
} as const;

/** Grid snap for note placement (~22m) */
export const GRID_SNAP_DEGREES = 0.0002;

/** Reroll limits */
export const MAX_HANDLE_REROLLS = 3;

/** Rate limits */
export const UNLOCK_RATE_LIMIT = {
  max: 10,
  window_minutes: 10,
} as const;

/** Teleport detection thresholds */
export const TELEPORT_GUARD = {
  min_distance_m: 3000,
  max_speed_kmh: 350,
} as const;

/** Report threshold to auto-hide */
export const REPORT_HIDE_THRESHOLD = 3;

/** Orb visibility zoom threshold */
export const ORB_ZOOM_THRESHOLD = 13.5;

/** Max notes returned by notes_in_bounds */
export const MAX_NOTES_IN_BOUNDS = 500;

/** Overnight Wall counter radius from venue */
export const WALL_RADIUS_M = 300;

/** Worth-it ratio display threshold */
export const WORTH_DISPLAY_THRESHOLD = 5;
