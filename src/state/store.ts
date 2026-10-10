/* ============================================================
 * THEY WERE HERE — Global State (Zustand)
 * ============================================================ */

import { create } from 'zustand';
import type {
  GeoPosition,
  UserProfile,
  AppConfig,
  ProximityState,
  SkyTheme,
  TabId,
  PassportNote,
} from '@/contracts/types';
import { DEFAULT_CONFIG } from '@/config/rules';
import { VENUE_CENTER } from '@/config/venue';
import { SEED_NOTES, INITIAL_PASSPORT_NOTES, type ExtendedNote } from '@/lib/seedNotes';

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

  /* ── Simulation / Stage Mode ──────────────────────────── */
  isSimulated: boolean;
  setSimulated: (val: boolean) => void;

  /* ── Connectivity ─────────────────────────────────────── */
  isOffline: boolean;
  setOffline: (val: boolean) => void;

  /* ── Map Notes ────────────────────────────────────────── */
  notes: ExtendedNote[];
  setNotes: (notes: ExtendedNote[]) => void;
  addNoteLocally: (note: ExtendedNote) => void;
  unlockNoteLocally: (noteId: string) => ExtendedNote | undefined;

  /* ── Passport ─────────────────────────────────────────── */
  passportNotes: PassportNote[];
  addPassportNote: (note: PassportNote) => void;

  /* ── Modals & Overlays ────────────────────────────────── */
  activeInspectNote: ExtendedNote | null;
  setActiveInspectNote: (note: ExtendedNote | null) => void;
  activeRevealNote: ExtendedNote | null;
  setActiveRevealNote: (note: ExtendedNote | null) => void;
  isCreateNoteOpen: boolean;
  setIsCreateNoteOpen: (val: boolean) => void;

  /* ── Proximity ────────────────────────────────────────── */
  nearestNote: ExtendedNote | null;
  setNearestNote: (note: ExtendedNote | null) => void;
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

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-traveller-1',
  handle: 'swift_fox',
  avatar: 1,
  xp: 140,
  unlock_count: 1,
  worth_received: 3,
  rerolls_used: 0,
  created_at: new Date().toISOString(),
};

const DEFAULT_POSITION: GeoPosition = {
  lat: VENUE_CENTER.lat,
  lng: VENUE_CENTER.lng,
  accuracy: 14,
  heading: 45,
  timestamp: Date.now(),
};

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  profile: DEFAULT_PROFILE,
  setProfile: (profile) => set({ profile }),

  // Config
  config: DEFAULT_CONFIG,
  setConfig: (config) => set({ config }),

  // Location
  position: DEFAULT_POSITION,
  setPosition: (position) => set({ position }),
  locationPermission: 'granted',
  setLocationPermission: (locationPermission) => set({ locationPermission }),

  // Simulation
  isSimulated: false,
  setSimulated: (isSimulated) => set({ isSimulated }),

  // Connectivity
  isOffline: false,
  setOffline: (isOffline) => set({ isOffline }),

  // Map notes
  notes: SEED_NOTES,
  setNotes: (notes) => set({ notes }),
  addNoteLocally: (newNote) =>
    set((state) => ({
      notes: [newNote, ...state.notes],
      profile: state.profile
        ? { ...state.profile, xp: state.profile.xp + 50 }
        : null,
    })),
  unlockNoteLocally: (noteId) => {
    const state = get();
    const target = state.notes.find((n) => n.id === noteId);
    if (!target) return undefined;

    const updatedNote = { ...target, unlocked: true };
    const passportEntry: PassportNote = {
      id: target.id,
      body: target.body,
      rarity: target.rarity,
      stamp: target.stamp,
      tone: target.tone,
      unlocked_at: new Date().toISOString(),
      unlock_count: target.unlock_count + 1,
      worth_yes: target.worth_yes,
      worth_no: target.worth_no,
      is_seed: target.is_seed,
    };

    set({
      notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
      passportNotes: [passportEntry, ...state.passportNotes],
      profile: state.profile
        ? {
            ...state.profile,
            xp: state.profile.xp + 25,
            unlock_count: state.profile.unlock_count + 1,
          }
        : null,
    });

    return updatedNote;
  },

  // Passport
  passportNotes: INITIAL_PASSPORT_NOTES,
  addPassportNote: (note) =>
    set((s) => ({ passportNotes: [note, ...s.passportNotes] })),

  // Modals
  activeInspectNote: null,
  setActiveInspectNote: (activeInspectNote) => set({ activeInspectNote }),
  activeRevealNote: null,
  setActiveRevealNote: (activeRevealNote) => set({ activeRevealNote }),
  isCreateNoteOpen: false,
  setIsCreateNoteOpen: (isCreateNoteOpen) => set({ isCreateNoteOpen }),

  // Proximity
  nearestNote: SEED_NOTES[0] ?? null,
  setNearestNote: (nearestNote) => set({ nearestNote }),
  proximityState: 'near',
  setProximityState: (proximityState) => set({ proximityState }),
  distanceToNearest: 38,
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
