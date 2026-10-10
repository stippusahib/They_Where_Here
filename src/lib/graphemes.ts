/* ============================================================
 * LEFT HERE — Grapheme Utilities
 * Safe grapheme counting and segmentation using Intl.Segmenter.
 * Handles Malayalam, Hindi, and emoji correctly.
 * ============================================================ */

/**
 * Count grapheme clusters in a string.
 * Uses Intl.Segmenter so multi-byte scripts don't break.
 */
export function countGraphemes(text: string): number {
  if (!text) return 0;
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  let count = 0;
  for (const _ of segmenter.segment(text)) {
    count++;
  }
  return count;
}

/**
 * Split a string into individual grapheme clusters.
 * Used for the typing animation in the reveal.
 */
export function splitGraphemes(text: string): string[] {
  if (!text) return [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

/**
 * Truncate a string to a maximum number of graphemes.
 */
export function truncateGraphemes(text: string, max: number): string {
  const graphemes = splitGraphemes(text);
  if (graphemes.length <= max) return text;
  return graphemes.slice(0, max).join('');
}
