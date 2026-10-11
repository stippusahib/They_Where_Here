/* ============================================================
 * THEY WERE HERE — Flight & PNR Layover Synchronization
 * Resolves Flight Numbers (e.g., EK564, AI998, QR514, 6E1402)
 * and PNR booking codes to auto-populate transit hub,
 * layover duration, and border visa exit conditions.
 * ============================================================ */

export interface FlightLayoverInfo {
  flightNumber: string;
  pnr?: string;
  airline: string;
  origin: string;
  destination: string;
  transitHub: string;
  hubCountry: string;
  layoverHours: number;
  terminal?: string;
  flightStatus: 'On Time' | 'Scheduled' | 'Arrived';
  notesCountInReach?: number;
}

export const POPULAR_FLIGHT_PRESETS: FlightLayoverInfo[] = [
  {
    flightNumber: 'EK 564',
    airline: 'Emirates',
    origin: 'Dubai (DXB)',
    destination: 'Calicut (CCJ)',
    transitHub: 'Calicut Intl Airport',
    hubCountry: 'India',
    layoverHours: 5,
    terminal: 'T1 International',
    flightStatus: 'On Time',
  },
  {
    flightNumber: 'AI 998',
    airline: 'Air India',
    origin: 'Delhi (DEL)',
    destination: 'Calicut (CCJ)',
    transitHub: 'Calicut Intl Airport',
    hubCountry: 'India',
    layoverHours: 4,
    terminal: 'T2 Domestic',
    flightStatus: 'Scheduled',
  },
  {
    flightNumber: 'QR 514',
    airline: 'Qatar Airways',
    origin: 'Doha (DOH)',
    destination: 'Calicut (CCJ)',
    transitHub: 'Calicut Intl Airport',
    hubCountry: 'India',
    layoverHours: 6,
    terminal: 'T1 International',
    flightStatus: 'On Time',
  },
  {
    flightNumber: '6E 1402',
    airline: 'IndiGo',
    origin: 'Mumbai (BOM)',
    destination: 'Calicut (CCJ)',
    transitHub: 'Calicut Intl Airport',
    hubCountry: 'India',
    layoverHours: 2,
    terminal: 'T2 Domestic',
    flightStatus: 'On Time',
  },
  {
    flightNumber: 'SQ 422',
    airline: 'Singapore Airlines',
    origin: 'Mumbai (BOM)',
    destination: 'Singapore (SIN)',
    transitHub: 'Singapore Changi Airport',
    hubCountry: 'Singapore',
    layoverHours: 5,
    terminal: 'T3 Jewel',
    flightStatus: 'On Time',
  },
  {
    flightNumber: 'EK 202',
    airline: 'Emirates',
    origin: 'New York (JFK)',
    destination: 'Dubai (DXB)',
    transitHub: 'Dubai International',
    hubCountry: 'United Arab Emirates',
    layoverHours: 7,
    terminal: 'Concourse A',
    flightStatus: 'On Time',
  },
];

/**
 * Parses user input (Flight Number or 6-character PNR code)
 * and returns matched or procedurally resolved transit layover info.
 */
export function lookupFlightOrPnr(input: string): FlightLayoverInfo {
  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  // 1. Direct match with preset list
  const matched = POPULAR_FLIGHT_PRESETS.find((p) => {
    const presetKey = p.flightNumber.replace(/[^A-Z0-9]/g, '');
    return clean === presetKey || clean.includes(presetKey);
  });

  if (matched) {
    return matched;
  }

  // 2. Airline prefix parsing
  let airline = 'International Airways';
  let origin = 'Transit Origin';
  let destination = 'Calicut (CCJ)';
  let hubCountry = 'India';
  let transitHub = 'Calicut Airport Hub';
  let hours = 4;

  if (clean.startsWith('EK') || clean.startsWith('FZ')) {
    airline = 'Emirates';
    origin = 'Dubai (DXB)';
    destination = 'Calicut (CCJ)';
    hubCountry = 'India';
    hours = 5;
  } else if (clean.startsWith('QR')) {
    airline = 'Qatar Airways';
    origin = 'Doha (DOH)';
    destination = 'Calicut (CCJ)';
    hubCountry = 'India';
    hours = 6;
  } else if (clean.startsWith('AI') || clean.startsWith('IX')) {
    airline = 'Air India';
    origin = 'New Delhi (DEL)';
    destination = 'Calicut (CCJ)';
    hubCountry = 'India';
    hours = 4;
  } else if (clean.startsWith('6E')) {
    airline = 'IndiGo';
    origin = 'Bengaluru (BLR)';
    destination = 'Calicut (CCJ)';
    hubCountry = 'India';
    hours = 2;
  } else if (clean.startsWith('SQ')) {
    airline = 'Singapore Airlines';
    origin = 'Mumbai (BOM)';
    destination = 'Singapore (SIN)';
    hubCountry = 'Singapore';
    transitHub = 'Singapore Changi (SIN)';
    hours = 6;
  } else if (clean.startsWith('BA')) {
    airline = 'British Airways';
    origin = 'London (LHR)';
    destination = 'Dubai (DXB)';
    hubCountry = 'United Arab Emirates';
    transitHub = 'Dubai International (DXB)';
    hours = 5;
  } else {
    // Arbitrary flight code or 6-character PNR
    const numPart = clean.replace(/^[A-Z]+/, '');
    const num = parseInt(numPart, 10);
    hours = isNaN(num) ? 4 : (num % 5) + 2; // Deterministic 2 to 6 hours
  }

  return {
    flightNumber: input.trim().toUpperCase(),
    airline,
    origin,
    destination,
    transitHub,
    hubCountry,
    layoverHours: hours,
    terminal: 'Gate Transit Lounge',
    flightStatus: 'Scheduled',
  };
}
