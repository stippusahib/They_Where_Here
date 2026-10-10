import { describe, it, expect } from 'vitest';
import {
  checkLayoverExit,
  normalizeCountryName,
  POPULAR_PASSPORTS,
  POPULAR_LAYOVER_HUBS,
} from './visaCheck';

describe('visaCheck exit rule engine', () => {
  it('normalizes country names and aliases correctly', () => {
    expect(normalizeCountryName('uae')).toBe('United Arab Emirates');
    expect(normalizeCountryName('usa')).toBe('United States');
    expect(normalizeCountryName('uk')).toBe('United Kingdom');
    expect(normalizeCountryName('korea')).toBe('South Korea');
    expect(normalizeCountryName('India')).toBe('India');
    expect(normalizeCountryName('germany')).toBe('Germany');
  });

  it('correctly rejects exit for India passport in Germany (override)', () => {
    const res = checkLayoverExit('India', 'Germany');
    expect(res.canExit).toBe(false);
    expect(res.status).toBe('cannot_leave');
    expect(res.isAirsideOnly).toBe(true);
    expect(res.headline).toBe("You can't layover there and go out");
    expect(res.ruleText).toContain('leaving the airport still needs a Schengen visa');
  });

  it('correctly handles conditional transit for India passport in UAE (override)', () => {
    const res = checkLayoverExit('India', 'United Arab Emirates');
    expect(res.canExit).toBe(true);
    expect(res.isConditional).toBe(true);
    expect(res.hoursMin).toBe(8);
    expect(res.ruleText).toContain('Free transit visa through the airline on longer layovers (over 8 h)');
  });

  it('correctly allows exit for India passport in Qatar (override)', () => {
    const res = checkLayoverExit('India', 'Qatar');
    expect(res.canExit).toBe(true);
    expect(res.status).toBe('can_leave');
    expect(res.ruleText).toContain('Free visa on arrival');
  });

  it('correctly identifies China 240-hour transit for UK passport (override)', () => {
    const res = checkLayoverExit('United Kingdom', 'China');
    expect(res.canExit).toBe(true);
    expect(res.isConditional).toBe(true);
    expect(res.hoursMax).toBe(240);
    expect(res.ruleText).toContain('240-hour');
  });

  it('correctly resolves matrix for USA in France (matrix Y)', () => {
    const res = checkLayoverExit('United States', 'France');
    expect(res.canExit).toBe(true);
    expect(res.status).toBe('can_leave');
  });

  it('correctly rejects matrix for Afghanistan in United States (matrix N)', () => {
    const res = checkLayoverExit('Afghanistan', 'United States');
    expect(res.canExit).toBe(false);
    expect(res.status).toBe('cannot_leave');
    expect(res.headline).toBe("You can't layover there and go out");
  });

  it('allows domestic/same country layover exit', () => {
    const res = checkLayoverExit('India', 'India');
    expect(res.canExit).toBe(true);
    expect(res.status).toBe('can_leave');
    expect(res.headline).toContain('Home Country');
  });

  it('exposes popular lists for quick selection', () => {
    expect(POPULAR_PASSPORTS).toContain('India');
    expect(POPULAR_LAYOVER_HUBS).toContain('United Arab Emirates');
    expect(POPULAR_LAYOVER_HUBS).toContain('Singapore');
  });
});
