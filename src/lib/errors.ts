/* ============================================================
 * LEFT HERE — Error Code Mapping
 * Maps RPC error codes to friendly user-facing copy.
 * Per Part 8.6: plain, active, no apologies, say how to fix it.
 * ============================================================ */

import type { RPCErrorCode } from '@/contracts/types';

/**
 * Friendly error messages for every RPC error code.
 * Never show technical details to the user.
 */
export const ERROR_MESSAGES: Record<RPCErrorCode, string> = {
  auth_required: 'Something went wrong. Try refreshing the app.',
  bad_position: 'Could not determine your location. Try again.',
  low_accuracy: 'GPS is fuzzy. Step outside and wait a few seconds.',
  note_not_found: 'This note is no longer available.',
  own_note: "This one is yours. Others will need to find it.",
  too_far: 'Not close enough yet. Walk closer to the glow.',
  rate_limited: 'Slow down a little. Try again in a few minutes.',
  notes_disabled: 'Posting is paused for a moment. Reading still works.',
  body_rejected: "That note can't be posted. Keep it kind, and skip links and numbers.",
  tier_blocked: 'Another note is too close for this tier. Pick Common or move on.',
  daily_cap: "You've used today's notes. Come back tomorrow.",
  unsafe_spot: "That spot isn't safe to stop at. Pick somewhere you'd happily stand.",
};

/**
 * Get a friendly error message from an RPC error string.
 * Falls back to a generic message for unknown errors.
 */
export function getFriendlyError(errorCode: string): string {
  if (errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as RPCErrorCode];
  }
  return "Something went wrong. Try again.";
}
