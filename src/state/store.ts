/* ============================================================
 * LEFT HERE — Global State (Zustand)
 * ============================================================ */

import { create } from 'zustand';
import type {
  GeoPosition,
  UserProfile,
  AppConfig,
  ProximityState,
  SkyTheme,
  MapNote,
  TabId,
} from '@/contracts/types';
import { DEFAULT_CONFIG } from '@/config/rules';

interface AppState {
  /* ── Auth & Profile ───────────────────────────────────── */
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  /* ── App Config (from DB) ─────────────────────────────── */
  config: AppConfig;
  setConfig: (config: AppConfig) => void;

  /* ── Location ─────────────────────────────────────────── */
  position: GeoPosition | null;
  setPosition: (pos: GeoPosition) => void;
  locationPermission: PermissionState | 'unknown';
  setLocationPermission: (state: PermissionState | 'unknown') => void;

  /* ── Simulation ───────────────────────────────────────── */
  isSimulated: boolean;
  setSimulated: (val: boolean) => void;

  /* ── Connectivity ─────────────────────────────────────── */
  isOffline: boolean;
  setOffline: (val: boolean) => void;

  /* ── Map Notes ────────────────────────────────────────── */
  notes: MapNote[];
  setNotes: (notes: MapNote[]) => void;

  /* ── Proximity ────────────────────────────────────────── */
  nearestNote: MapNote | null;
  setNearestNote: (note: MapNote | null) => void;
  proximityState: ProximityState;
  setProximityState: (state: ProximityState) => void;
  distanceToNearest: number | null;
  setDistanceToNearest: (d: number | null) => void;

  /* ── Sky Theme ────────────────────────────────────────── */
  skyTheme: SkyTheme;
  setSkyTheme: (theme: SkyTheme) => void;

  /* ── Audio & Haptics Preferences ──────────────────────── */
  soundEnabled: boolean;
  toggleSound: () => void;
  musicEnabled: boolean;
  toggleMusic: () => void;
  hapticsEnabled: boolean;
  toggleHaptics: () => void;

  /* ── Navigation ───────────────────────────────────────── */
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  /* ── Layover Mode (P0) ────────────────────────────────── */
  layoverHours: number;
  setLayoverHours: (hours: number) => void;
  hasSeenLayoverOnboarding: boolean;
  setHasSeenLayoverOnboarding: (val: boolean) => void;

  /* ── Audio Unlocked ───────────────────────────────────── */
  audioUnlocked: boolean;
  setAudioUnlocked: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  profile: null,
  setProfile: (profile) => set({ profile }),

  // Config
  config: DEFAULT_CONFIG,
  setConfig: (config) => set({ config }),

  // Location
  position: null,
  setPosition: (position) => set({ position }),
  locationPermission: 'unknown',
  setLocationPermission: (locationPermission) => set({ locationPermission }),

  // Simulation
  isSimulated: false,
  setSimulated: (isSimulated) => set({ isSimulated }),

  // Connectivity
  isOffline: !navigator.onLine,
  setOffline: (isOffline) => set({ isOffline }),

  // Map notes
  notes: [],
  setNotes: (notes) => set({ notes }),

  // Proximity
  nearestNote: null,
  setNearestNote: (nearestNote) => set({ nearestNote }),
  proximityState: 'far',
  setProximityState: (proximityState) => set({ proximityState }),
  distanceToNearest: null,
  setDistanceToNearest: (distanceToNearest) => set({ distanceToNearest }),

  // Sky
  skyTheme: 'night',
  setSkyTheme: (skyTheme) => set({ skyTheme }),

  // Preferences
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  musicEnabled: true,
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  hapticsEnabled: true,
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),

  // Navigation
  activeTab: 'map',
  setActiveTab: (activeTab) => set({ activeTab }),

  // Layover Mode (P0)
  layoverHours: 4,
  setLayoverHours: (layoverHours) => set({ layoverHours }),
  hasSeenLayoverOnboarding: false,
  setHasSeenLayoverOnboarding: (hasSeenLayoverOnboarding) =>
    set({ hasSeenLayoverOnboarding }),

  // Audio
  audioUnlocked: false,
  setAudioUnlocked: (audioUnlocked) => set({ audioUnlocked }),
}));
