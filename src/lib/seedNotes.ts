/* ============================================================
 * THEY WERE HERE — Seed Notes Data
 * Authentic Calicut layover notes. Labeled "demo data" per Rule 3.
 * ============================================================ */

import type { MapNote, PassportNote } from '@/contracts/types';

export interface ExtendedNote extends MapNote {
  title: string;
  body: string;
  author_handle: string;
  is_mine?: boolean;
}

export const SEED_NOTES: ExtendedNote[] = [];

export const INITIAL_PASSPORT_NOTES: PassportNote[] = [];

/**
 * Generates local demo exploration notes around the tester's GPS coordinates
 * when no notes are within walking distance (< 15 km).
 * Labeled "demo data" per Rule 3.
 */
export function createLocalDemoNotes(centerLat: number, centerLng: number): ExtendedNote[] {
  return [
    {
      id: 'demo-local-1',
      lat: centerLat + 0.0012,
      lng: centerLng + 0.0014,
      rarity: 'rare',
      stamp: 10,
      tone: 1,
      unlock_count: 0,
      worth_yes: 0,
      worth_no: 0,
      is_seed: true,
      unlocked: false,
      title: 'Neighbourhood Memory (Demo)',
      body: 'A quiet corner under the canopy. Somebody stopped here for tea and watched the rain pass. [demo data]',
      author_handle: 'local_wanderer',
    },
    {
      id: 'demo-local-2',
      lat: centerLat - 0.0011,
      lng: centerLng + 0.0018,
      rarity: 'common',
      stamp: 1,
      tone: 1,
      unlock_count: 0,
      worth_yes: 0,
      worth_no: 0,
      is_seed: true,
      unlocked: false,
      title: 'Chai Stall Marker (Demo)',
      body: 'Fresh hot banana fritters and ginger tea just around the bend. [demo data]',
      author_handle: 'chai_seeker',
    },
    {
      id: 'demo-local-3',
      lat: centerLat + 0.0019,
      lng: centerLng - 0.0016,
      rarity: 'legendary',
      stamp: 7,
      tone: 1,
      unlock_count: 0,
      worth_yes: 0,
      worth_no: 0,
      is_seed: true,
      unlocked: false,
      title: 'Secret Old Tree Hollow (Demo)',
      body: 'An ancient tree with mossy roots. Look inside the hollow to find what was left behind. [demo data]',
      author_handle: 'ancient_trails',
    },
  ];
}

