/* ============================================================
 * LEFT HERE — Supabase Client
 * Uses only the publishable (anon) key. Service role key
 * NEVER appears in client code.
 * ============================================================ */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Ensure the user has an anonymous session.
 * Anonymous sign-ins must be enabled in the Supabase dashboard (task H1).
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('[Left Here] Anonymous sign-in failed:', error.message);
    return null;
  }

  return data.user?.id ?? null;
}

/**
 * Call a Supabase RPC function with typed error handling.
 */
export async function callRPC<T>(
  fnName: string,
  params: Record<string, unknown> = {}
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.rpc(fnName, params);

  if (error) {
    // Extract the RAISE EXCEPTION message from Postgres
    const code = error.message || error.code || 'unknown_error';
    return { data: null, error: code };
  }

  return { data: data as T, error: null };
}
