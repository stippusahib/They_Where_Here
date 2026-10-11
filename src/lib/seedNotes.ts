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

