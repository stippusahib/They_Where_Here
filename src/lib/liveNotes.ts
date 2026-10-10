/* ============================================================
 * THEY WERE HERE — Live Real-Time Note Synchronization
 * Supabase Realtime WebSocket broadcast & query engine.
 * Ensures notes dropped by user 1 appear instantly across all devices.
 * ============================================================ */

import { supabase } from './supabase';
import { useAppStore } from '@/state/store';
import type { ExtendedNote } from './seedNotes';

interface NoteRow {
  id: string;
  lat: number | null;
  lng: number | null;
  geom?: string | null;
  rarity: 'common' | 'rare' | 'legendary';
  stamp: number;
  tone: number;
  title: string | null;
  body: string | null;
  author_handle: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  is_seed: boolean;
  unlock_count: number;
  worth_yes: number;
  worth_no: number;
  status: string;
  created_at: string;
}

function rowToExtendedNote(row: NoteRow): ExtendedNote {
  return {
    id: row.id,
    lat: Number(row.lat) || 0,
    lng: Number(row.lng) || 0,
    rarity: row.rarity || 'common',
    stamp: Number(row.stamp) || 1,
    tone: Number(row.tone) || 1,
    title: row.title || 'Traveller Note',
    body: row.body || '',
    author_handle: row.author_handle || 'Anonymous Explorer',
    audio_url: row.audio_url || undefined,
    audio_duration: row.audio_duration ? Number(row.audio_duration) : undefined,
    is_seed: Boolean(row.is_seed),
    unlock_count: Number(row.unlock_count) || 0,
    worth_yes: Number(row.worth_yes) || 0,
    worth_no: Number(row.worth_no) || 0,
    unlocked: false,
  };
}

/**
 * Fetches all live notes from Supabase and syncs into the Zustand store.
 */
export async function fetchLiveNotes(): Promise<ExtendedNote[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[LiveNotes] Failed to fetch notes from Supabase:', error.message);
      return [];
    }

    if (Array.isArray(data)) {
      const liveNotes = data
        .filter((row: NoteRow) => row.lat !== null && row.lng !== null)
        .map(rowToExtendedNote);

      useAppStore.getState().setNotes(liveNotes);
      return liveNotes;
    }

    return [];
  } catch (err) {
    console.warn('[LiveNotes] Network exception fetching notes:', err);
    return [];
  }
}

/**
 * Publishes a newly sealed note to Supabase so all players receive it.
 */
export async function publishNote(note: ExtendedNote): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notes').insert({
      id: note.id,
      lat: note.lat,
      lng: note.lng,
      geom: `SRID=4326;POINT(${note.lng} ${note.lat})`,
      rarity: note.rarity,
      stamp: note.stamp,
      tone: note.tone,
      title: note.title,
      body: note.body,
      author_handle: note.author_handle,
      audio_url: note.audio_url ?? null,
      audio_duration: note.audio_duration ?? null,
      status: 'live',
      is_seed: false,
    });

    if (error) {
      console.warn('[LiveNotes] Failed to publish note to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('[LiveNotes] Exception publishing note:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Subscribes to the Supabase Realtime channel for live updates.
 * Any note placed on ANY phone broadcasts instantly to every other phone.
 */
export function subscribeToLiveNotes(): () => void {
  const channel = supabase
    .channel('public:notes:realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
      },
      (payload) => {
        const row = payload.new as NoteRow;
        if (row && row.lat !== null && row.lng !== null && row.status === 'live') {
          const incomingNote = rowToExtendedNote(row);
          useAppStore.getState().addOrUpdateNote(incomingNote);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notes',
      },
      (payload) => {
        const row = payload.new as NoteRow;
        if (row && row.lat !== null && row.lng !== null) {
          const updatedNote = rowToExtendedNote(row);
          useAppStore.getState().addOrUpdateNote(updatedNote);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'notes',
      },
      (payload) => {
        const oldRow = payload.old as { id?: string };
        if (oldRow?.id) {
          useAppStore.setState((state) => ({
            notes: state.notes.filter((n) => n.id !== oldRow.id),
          }));
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[LiveNotes] Supabase Realtime channel subscribed successfully');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Clears all notes from Supabase database and local store.
 */
export async function clearAllNotesEverywhere(): Promise<void> {
  try {
    await supabase.from('notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    useAppStore.getState().clearAllNotes();
  } catch (err) {
    console.warn('[LiveNotes] Failed to clear notes:', err);
    useAppStore.getState().clearAllNotes();
  }
}
