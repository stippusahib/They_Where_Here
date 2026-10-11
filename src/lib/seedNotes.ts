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

