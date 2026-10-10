/* ============================================================
 * THEY WERE HERE — Seed Notes Data
 * Authentic Calicut layover notes. Labeled "demo data" per Rule 3.
 * ============================================================ */

import type { MapNote, PassportNote } from '@/contracts/types';
import { VENUE_CENTER } from '@/config/venue';

export interface ExtendedNote extends MapNote {
  title: string;
  body: string;
  author_handle: string;
}

export const SEED_NOTES: ExtendedNote[] = [
  {
    id: 'seed-note-1',
    lat: VENUE_CENTER.lat + 0.0003,
    lng: VENUE_CENTER.lng + 0.0002,
    rarity: 'common',
    stamp: 1,
    tone: 1,
    unlock_count: 14,
    worth_yes: 13,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: 'Corner Sulaimani Stall',
    body: 'The sulaimani tea stall behind the corner closes at 11 PM. Ask for ginger twist. Best 12 rupees in the city when dead tired.',
    author_handle: 'swift_fox',
  },
  {
    id: 'seed-note-2',
    lat: VENUE_CENTER.lat - 0.0004,
    lng: VENUE_CENTER.lng + 0.0005,
    rarity: 'rare',
    stamp: 2,
    tone: 2,
    unlock_count: 28,
    worth_yes: 27,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: '3-Hour Layover Cloakroom Hack',
    body: 'If you have a 3-hour layover, leave luggage at the railway cloakroom for 30 rupees. Take a direct auto to South Beach for fresh pickled manga and spiced pineapple.',
    author_handle: 'calm_otter',
  },
  {
    id: 'seed-note-3',
    lat: VENUE_CENTER.lat + 0.0008,
    lng: VENUE_CENTER.lng - 0.0006,
    rarity: 'legendary',
    stamp: 3,
    tone: 3,
    unlock_count: 53,
    worth_yes: 52,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: 'Old Town Secret Recipe',
    body: 'Paragon biryani is famous, but the true connoisseur order is the Malabar fish mango curry with pathiri at the old branch. Only available after 1 PM.',
    author_handle: 'wise_crane',
  },
  {
    id: 'seed-note-4',
    lat: VENUE_CENTER.lat - 0.0002,
    lng: VENUE_CENTER.lng - 0.0003,
    rarity: 'common',
    stamp: 4,
    tone: 1,
    unlock_count: 19,
    worth_yes: 18,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: 'Quiet Hackathon Recharge',
    body: 'Quiet corner with four unused wall sockets behind the second pillar upstairs. Ideal when main tables are crowded.',
    author_handle: 'clever_bear',
  },
  {
    id: 'seed-note-5',
    lat: VENUE_CENTER.lat + 0.0012,
    lng: VENUE_CENTER.lng + 0.0015,
    rarity: 'rare',
    stamp: 5,
    tone: 2,
    unlock_count: 31,
    worth_yes: 30,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: 'Clean Washroom Before Train',
    body: 'Walk 200m north past the bakery into the petrol bunk complex for the cleanest washroom in this sector before your midnight sleeper.',
    author_handle: 'brave_wolf',
  },
  {
    id: 'seed-note-6',
    lat: VENUE_CENTER.lat - 0.0015,
    lng: VENUE_CENTER.lng - 0.0011,
    rarity: 'legendary',
    stamp: 6,
    tone: 3,
    unlock_count: 76,
    worth_yes: 75,
    worth_no: 1,
    is_seed: true,
    unlocked: false,
    title: 'Old Sea Pier Breeze',
    body: 'At sunset, walk to the old sea pier ruins. The salt breeze here after an 8-hour bus journey will completely reset your weary spirit.',
    author_handle: 'stellar_hawk',
  },
];

export const INITIAL_PASSPORT_NOTES: PassportNote[] = [
  {
    id: 'seed-unlocked-sample',
    body: 'Welcome traveller! The secret to Calicut is walking slow. Always carry a small umbrella and never leave without tasting halwa freshly cut from the slab.',
    rarity: 'rare',
    stamp: 2,
    tone: 2,
    unlocked_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    unlock_count: 42,
    worth_yes: 41,
    worth_no: 1,
    is_seed: true,
  },
];
