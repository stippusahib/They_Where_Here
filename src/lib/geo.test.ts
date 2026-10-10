import { describe, it, expect } from 'vitest';
import { haversineDistance, bearing, toCardinal, layoverReachKm } from './geo';

describe('Geo Utilities', () => {
  it('calculates zero distance between identical points', () => {
    expect(haversineDistance(11.2588, 75.7804, 11.2588, 75.7804)).toBe(0);
  });

  it('calculates cardinal direction and bearing correctly', () => {
    expect(bearing(0, 0, 1, 0)).toBeCloseTo(0, 0);
    expect(toCardinal(0)).toBe('N');
    expect(toCardinal(90)).toBe('E');
    expect(toCardinal(180)).toBe('S');
    expect(toCardinal(270)).toBe('W');
  });

  it('calculates layover reach radius according to spec formula', () => {
    // hours * 4.5 / 2 / 1.3
    const reach4h = layoverReachKm(4);
    expect(reach4h).toBeCloseTo((4 * 4.5) / 2 / 1.3, 2);

    const reach2h = layoverReachKm(2);
    expect(reach2h).toBeCloseTo((2 * 4.5) / 2 / 1.3, 2);
  });
});
