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

export const SEED_NOTES: ExtendedNote[] = [
  {
    id: '9a6d676f-7706-4205-8ae1-9198f179fbf0',
    lat: 11.2778,
    lng: 75.7624,
    rarity: 'rare',
    stamp: 10,
    tone: 1,
    unlock_count: 0,
    worth_yes: 0,
    worth_no: 0,
    is_seed: true,
    unlocked: false,
    title: 'Sunset at Kozhikode Beach Pier',
    body: 'Walk out towards the broken pier around 5:45 PM. The crushed ice pickled mango (Uppilittathu) stall near the lighthouse makes the trip worth it.',
    author_handle: 'travel_calicut',
  },
  {
    id: 'ebf78738-cefb-484d-b5a0-e5f6587782ab',
    lat: 11.2438,
    lng: 75.8044,
    rarity: 'common',
    stamp: 1,
    tone: 1,
    unlock_count: 0,
    worth_yes: 0,
    worth_no: 0,
    is_seed: true,
    unlocked: false,
    title: 'Paragon Biryani & Sulaimani Chai',
    body: 'Skip the heavy gravies, order the Malabar mutton biryani with hot Sulaimani chai. The cardamom fragrance here has stayed the same for 40 years.',
    author_handle: 'spice_trail',
  },
  {
    id: 'ba707e7f-da6f-40f9-8900-d3c32b3c6222',
    lat: 11.2318,
    lng: 75.7754,
    rarity: 'legendary',
    stamp: 7,
    tone: 1,
    unlock_count: 0,
    worth_yes: 0,
    worth_no: 0,
    is_seed: true,
    unlocked: false,
    title: 'Secret Pond at Mishkal Mosque',
    body: 'Quiet timber-tiered architecture from the 14th century. Sit on the stone steps by the pond before evening prayer. True peace in the old quarter.',
    author_handle: 'malabar_explorer',
  },
];

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

