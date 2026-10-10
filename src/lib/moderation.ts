/* ============================================================
 * LEFT HERE — Content Moderation
 * Client and server share the same rules.
 * Normalises input before matching against the blocklist.
 * NEVER echo the offending text back to the user.
 * ============================================================ */

import blocklist from './blocklist.json';

/**
 * Normalise text for moderation matching:
 * - Lowercase
 * - Strip zero-width characters
 * - Map common leetspeak (0→o, 1→i/l, 3→e, 4→a, 5→s, 7→t, @→a, $→s)
 * - Remove separators between letters
 * - Collapse repeated letters
 */
function normalise(text: string): string {
  let s = text.toLowerCase();

  // Strip zero-width characters
  s = s.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');

  // Leetspeak mapping
  const leetMap: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    $: 's',
  };
  s = s.replace(/[013457@$]/g, (c) => leetMap[c] ?? c);

  // Remove common separators between letters
  s = s.replace(/[.\-_*\s]+/g, '');

  // Collapse repeated letters (3+ becomes 1)
  s = s.replace(/(.)\1{2,}/g, '$1');

  return s;
}

/** Patterns that always reject */
const REJECT_PATTERNS = [
  /https?:\/\//i,
  /www\./i,
  /\.com\b/i,
  /\.org\b/i,
  /\.net\b/i,
  /\.in\b/i,
  /\.io\b/i,
  /@\w+/,
  /[\w.+-]+@[\w-]+\.[\w.]+/,
  /\d{8,}/,
];

/**
 * Check if a note body is allowed for posting.
 * Returns true if the body passes moderation.
 */
export function bodyAllowed(text: string): boolean {
  // Check structural patterns on raw text
  for (const pattern of REJECT_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }

  // Normalise then check blocklist
  const normalised = normalise(text);
  for (const term of blocklist) {
    if (normalised.includes(normalise(term))) {
      return false;
    }
  }

  return true;
}
