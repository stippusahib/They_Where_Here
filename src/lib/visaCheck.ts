import rawData from '@/data/layoverExitRules.json';

export type LayoverExitStatus = 'can_leave' | 'cannot_leave' | 'conditional' | 'check';

export interface LayoverExitAssessment {
  passport: string;
  layoverCountry: string;
  status: LayoverExitStatus;
  canExit: boolean;
  isConditional: boolean;
  isAirsideOnly: boolean;
  badgeText: string;
  headline: string;
  ruleText: string;
  noteText?: string;
  hoursMin?: number | null;
  hoursMax?: number | null;
  isSourceOverride: boolean;
}

interface LayoverData {
  meta: {
    name: string;
    matrixLegend: Record<string, string>;
  };
  countries: string[];
  aliases: Record<string, string>;
  matrix: Record<string, string>;
  overrides: Array<{
    passport: string;
    country: string;
    status: LayoverExitStatus;
    rule: string;
    note: string;
    hoursMin: number | null;
    hoursMax: number | null;
  }>;
}

const data = rawData as LayoverData;

export const ALL_COUNTRIES: string[] = data.countries;

export const POPULAR_PASSPORTS: string[] = [
  'India',
  'United Kingdom',
  'United States',
  'Germany',
  'United Arab Emirates',
  'Singapore',
  'France',
  'Australia',
  'Japan',
  'Canada',
];

export const POPULAR_LAYOVER_HUBS: string[] = [
  'United Arab Emirates', // Dubai / Abu Dhabi
  'Qatar',                // Doha Hamad
  'Singapore',            // Changi
  'Germany',              // Frankfurt / Munich
  'France',               // Paris CDG
  'Turkey',               // Istanbul
  'United Kingdom',       // London Heathrow
  'Malaysia',             // Kuala Lumpur
  'Thailand',             // Bangkok
  'China',                // Shanghai / Beijing
];

/**
 * Normalizes user-entered country name using aliases or case-insensitive match.
 */
export function normalizeCountryName(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // 1. Check exact match in list
  const exact = data.countries.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Check alias map
  if (data.aliases[lower]) {
    const aliased = data.aliases[lower];
    const match = data.countries.find((c) => c.toLowerCase() === aliased.toLowerCase());
    if (match) return match;
  }

  // 3. Partial / prefix match if at least 3 letters
  if (lower.length >= 3) {
    const partial = data.countries.find((c) => c.toLowerCase().startsWith(lower));
    if (partial) return partial;
  }

  return null;
}

/**
 * Evaluates whether a traveler with a given passport can exit the airport
 * during a layover in the destination country.
 */
export function checkLayoverExit(passportInput: string, layoverInput: string): LayoverExitAssessment {
  const passport = normalizeCountryName(passportInput) || passportInput.trim() || 'Unknown';
  const layoverCountry = normalizeCountryName(layoverInput) || layoverInput.trim() || 'Unknown';

  // 1. Check verified overrides first
  const override = data.overrides.find(
    (o) =>
      o.passport.toLowerCase() === passport.toLowerCase() &&
      o.country.toLowerCase() === layoverCountry.toLowerCase()
  );

  if (override) {
    const isExitAllowed = override.status === 'can_leave' || override.status === 'conditional';
    const isConditional = override.status === 'conditional';
    const isAirsideOnly = override.status === 'cannot_leave' || override.status === 'check';

    let headline = "You can't layover there and go out";
    let badgeText = 'Airside Only';

    if (override.status === 'can_leave') {
      headline = 'Exit Allowed — Free to Explore';
      badgeText = 'Exit Allowed';
    } else if (override.status === 'conditional') {
      headline = 'Conditional Transit Visa Eligible';
      badgeText = override.hoursMin ? `Transit (${override.hoursMin}h+ min)` : 'Conditional Exit';
    } else if (override.status === 'check') {
      headline = "You can't layover there without visa verification";
      badgeText = 'Check Transit Visa';
    }

    return {
      passport,
      layoverCountry,
      status: override.status,
      canExit: isExitAllowed,
      isConditional,
      isAirsideOnly,
      badgeText,
      headline,
      ruleText: override.rule,
      noteText: override.note,
      hoursMin: override.hoursMin,
      hoursMax: override.hoursMax,
      isSourceOverride: true,
    };
  }

  // 2. Same country check
  if (passport.toLowerCase() === layoverCountry.toLowerCase()) {
    return {
      passport,
      layoverCountry,
      status: 'can_leave',
      canExit: true,
      isConditional: false,
      isAirsideOnly: false,
      badgeText: 'Home Country',
      headline: 'Domestic / Home Country Exit',
      ruleText: 'You hold a passport for this country. You can exit the airport freely without any immigration or visa restrictions.',
      isSourceOverride: false,
    };
  }

  // 3. Fallback to Passport Index matrix
  const matrixString = data.matrix[passport];
  const countryIdx = data.countries.findIndex(
    (c) => c.toLowerCase() === layoverCountry.toLowerCase()
  );

  if (matrixString && countryIdx >= 0) {
    const code = matrixString[countryIdx] || 'N';

    if (code === 'Y') {
      return {
        passport,
        layoverCountry,
        status: 'can_leave',
        canExit: true,
        isConditional: false,
        isAirsideOnly: false,
        badgeText: 'Visa-Free / VOA',
        headline: 'Exit Allowed — Step Outside',
        ruleText: 'Visa-free entry or Visa on Arrival permitted for tourist entry. You can clear immigration and explore during your layover.',
        isSourceOverride: false,
      };
    }

    if (code === 'E') {
      return {
        passport,
        layoverCountry,
        status: 'cannot_leave',
        canExit: false,
        isConditional: false,
        isAirsideOnly: true,
        badgeText: 'Pre-eVisa Required',
        headline: "You can't layover there and go out",
        ruleText: 'An advance electronic visa (e-Visa or eTA) must be approved before travel. You cannot clear border control without a pre-approved visa; remain in the airside transit lounge.',
        isSourceOverride: false,
      };
    }

    if (code === '-') {
      return {
        passport,
        layoverCountry,
        status: 'can_leave',
        canExit: true,
        isConditional: false,
        isAirsideOnly: false,
        badgeText: 'Home Country',
        headline: 'Domestic / Home Country Exit',
        ruleText: 'You hold a passport for this country. No border restrictions.',
        isSourceOverride: false,
      };
    }
  }

  // Default / 'N' / Visa Required
  return {
    passport,
    layoverCountry,
    status: 'cannot_leave',
    canExit: false,
    isConditional: false,
    isAirsideOnly: true,
    badgeText: 'Visa Required',
    headline: "You can't layover there and go out",
    ruleText: "You can't layover there and go out. Consular visa required in advance. You must remain airside in the international transit concourse.",
    isSourceOverride: false,
  };
}
