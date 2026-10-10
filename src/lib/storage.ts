/* ============================================================
 * THEY WERE HERE — Offline Storage Engine (IndexedDB)
 * Powered by idb-keyval for persistent offline-first Passport storage.
 * ============================================================ */

import { get, set, del } from 'idb-keyval';
import type { PassportNote } from '@/contracts/types';

const PASSPORT_KEY = 'twh_passport_notes';
const LAYOVER_HOURS_KEY = 'twh_layover_hours';
const AVATAR_KEY = 'twh_avatar_sticker';

/**
 * Persists an unlocked note into the local IndexedDB passport storage.
 * Deduplicates by note ID and prepends newer unlocks.
 */
export async function savePassportNote(note: PassportNote): Promise<void> {
  try {
    const existing = (await get<PassportNote[]>(PASSPORT_KEY)) || [];
    const filtered = existing.filter((n) => n.id !== note.id);
    const updated = [note, ...filtered];
    await set(PASSPORT_KEY, updated);
  } catch (err) {
    console.warn('[Storage] Failed to save passport note to idb-keyval:', err);
  }
}

/**
 * Retrieves all locally cached passport notes from IndexedDB.
 */
export async function getStoredPassportNotes(): Promise<PassportNote[]> {
  try {
    const notes = await get<PassportNote[]>(PASSPORT_KEY);
    return notes || [];
  } catch (err) {
    console.warn('[Storage] Failed to read passport notes from idb-keyval:', err);
    return [];
  }
}

/**
 * Clears cached passport notes (used for testing or resetting anonymous profile).
 */
export async function clearPassportStorage(): Promise<void> {
  try {
    await del(PASSPORT_KEY);
  } catch (err) {
    console.warn('[Storage] Failed to clear passport storage:', err);
  }
}

/**
 * Calculates storage diagnostics for the user's settings screen.
 */
export async function getStorageStats(): Promise<{ count: number; approxBytes: number }> {
  try {
    const notes = await getStoredPassportNotes();
    const serialized = JSON.stringify(notes);
    return {
      count: notes.length,
      approxBytes: new Blob([serialized]).size,
    };
  } catch {
    return { count: 0, approxBytes: 0 };
  }
}

/**
 * Saves the user's selected layover duration preference.
 */
export async function saveLayoverHours(hours: number): Promise<void> {
  try {
    await set(LAYOVER_HOURS_KEY, hours);
  } catch (err) {
    console.warn('[Storage] Failed to save layover hours:', err);
  }
}

/**
 * Retrieves previously saved layover duration preference.
 */
export async function getStoredLayoverHours(): Promise<number | null> {
  try {
    const hours = await get<number>(LAYOVER_HOURS_KEY);
    return typeof hours === 'number' ? hours : null;
  } catch {
    return null;
  }
}

/**
 * Saves selected avatar sticker index.
 */
export async function saveAvatarSticker(avatar: number): Promise<void> {
  try {
    await set(AVATAR_KEY, avatar);
  } catch (err) {
    console.warn('[Storage] Failed to save avatar sticker:', err);
  }
}

/**
 * Retrieves saved avatar sticker index.
 */
export async function getStoredAvatarSticker(): Promise<number | null> {
  try {
    const avatar = await get<number>(AVATAR_KEY);
    return typeof avatar === 'number' ? avatar : null;
  } catch {
    return null;
  }
}
