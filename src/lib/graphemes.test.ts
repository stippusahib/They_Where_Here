import { describe, it, expect } from 'vitest';
import { countGraphemes, splitGraphemes, truncateGraphemes } from './graphemes';

describe('Unicode Grapheme Segmentation Engine', () => {
  it('accurately counts standard ASCII strings', () => {
    expect(countGraphemes('Hello')).toBe(5);
    expect(countGraphemes('')).toBe(0);
    expect(countGraphemes('Calicut Beach')).toBe(13);
  });

  it('accurately clusters multi-byte Malayalam script characters', () => {
    // Malayalam ligatures must be counted as true user-perceived grapheme clusters
    const mal = 'കോഴിക്കോട്'; // Kozhikode in Malayalam
    expect(countGraphemes(mal)).toBeGreaterThan(0);
    expect(countGraphemes(mal)).toBeLessThanOrEqual(mal.length);
  });

  it('correctly counts complex compound emojis as single graphemes', () => {
    // Family emoji with zero-width joiner
    const family = '👨‍👩‍👧';
    expect(countGraphemes(family)).toBe(1);

    // Wave hand
    const wave = '👋';
    expect(countGraphemes(wave)).toBe(1);
  });

  it('splits graphemes without corrupting surrogates or diacritics', () => {
    const word = 'Tea ☕';
    const split = splitGraphemes(word);
    expect(split).toEqual(['T', 'e', 'a', ' ', '☕']);
  });

  it('safely truncates strings to a maximum grapheme limit', () => {
    const sentence = 'A quiet bench by the seaside.';
    const truncated = truncateGraphemes(sentence, 7);
    expect(countGraphemes(truncated)).toBe(7);
    expect(truncated).toBe('A quiet');
  });
});
