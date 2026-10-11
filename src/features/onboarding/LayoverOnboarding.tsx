/* ============================================================
 * THEY WERE HERE — Layover Onboarding (P0 Front Door)
 * Designed with Google Stitch (Light Dusk Postcard Design System)
 * Real-time Passport x Layover Country Exit Rule Assessment,
 * tactile duration slider, and postcard exploration reach card.
 * ============================================================ */

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Compass,
  MapPin,
  AirplaneLanding,
  IdentificationCard,
  WarningCircle,
  Ticket,
  AirplaneTilt,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { layoverReachKm } from '@/lib/geo';
import {
  checkLayoverExit,
  POPULAR_PASSPORTS,
  POPULAR_LAYOVER_HUBS,
} from '@/lib/visaCheck';
import {
  lookupFlightOrPnr,
  POPULAR_FLIGHT_PRESETS,
  type FlightLayoverInfo,
} from '@/lib/flightApi';
import { PaperPlaneCanvas } from '@/3d/PaperPlaneCanvas';
import { AppLogo } from '@/ui/components/AppLogo';
import { CountrySelectInput } from '@/features/layover/CountrySelectInput';
import { LayoverExitCard } from '@/features/layover/LayoverExitCard';

interface LayoverOnboardingProps {
  onComplete: () => void;
}

const DEFAULT_DESC = { badge: 'Optimal Explorer Window', notesEst: 26 };

const LAYOVER_DESCRIPTIONS: Record<number, { badge: string; notesEst: number }> = {
  1: { badge: 'Express Gate Run', notesEst: 4 },
  2: { badge: 'Short Concourse Stroll', notesEst: 10 },
  3: { badge: 'Terrace Explorer', notesEst: 18 },
  4: { badge: 'Optimal Explorer Window', notesEst: 26 },
  5: { badge: 'Wide Perimeter Scan', notesEst: 34 },
  6: { badge: 'Deep City Layover', notesEst: 42 },
  7: { badge: 'Full Dusk Adventure', notesEst: 48 },
  8: { badge: 'Grand Excursion Mode', notesEst: 56 },
};

export const LayoverOnboarding: React.FC<LayoverOnboardingProps> = ({ onComplete }) => {
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);
  const passportCountry = useAppStore((s) => s.passportCountry);
  const setPassportCountry = useAppStore((s) => s.setPassportCountry);
  const layoverCountry = useAppStore((s) => s.layoverCountry);
  const setLayoverCountry = useAppStore((s) => s.setLayoverCountry);

  const [flightQuery, setFlightQuery] = useState('');
  const [activeFlight, setActiveFlight] = useState<FlightLayoverInfo | null>(null);

  const handleApplyFlight = (flight: FlightLayoverInfo) => {
    setActiveFlight(flight);
    setFlightQuery(flight.flightNumber);
    setLayoverHours(flight.layoverHours);
    setLayoverCountry(flight.hubCountry);
  };

  const handleFlightSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!flightQuery.trim()) return;
    const resolved = lookupFlightOrPnr(flightQuery);
    handleApplyFlight(resolved);
  };

  const handleCancelFlight = () => {
    setActiveFlight(null);
    setFlightQuery('');
  };

  const assessment = useMemo(() => {
    return checkLayoverExit(passportCountry, layoverCountry);
  }, [passportCountry, layoverCountry]);

  const LAYOVER_STEPS = [1, 2, 4, 6, 8];
  const stepIndex = Math.max(0, LAYOVER_STEPS.indexOf(layoverHours));
  const reachKm = layoverReachKm(layoverHours).toFixed(1);
  const currentDesc = LAYOVER_DESCRIPTIONS[layoverHours] || DEFAULT_DESC;
  const progressPercent = (stepIndex / (LAYOVER_STEPS.length - 1)) * 100;

  const handleFinish = () => {
    onComplete();
  };

  const handleSkip = () => {
    setLayoverHours(4);
    onComplete();
  };

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between overflow-y-auto bg-[#FAFAF7] text-[var(--ink-900)] selection:bg-[var(--hanko)] selection:text-white safe-top safe-bottom select-none"
      style={{
        zIndex: 'var(--z-onboarding)',
      }}
    >
      {/* ── TOP AIRMAIL STRIPE ACCENT ─────────────────────────────── */}
      <div
        className="w-full h-1.5 flex-shrink-0"
        style={{
          background:
            'repeating-linear-gradient(-45deg, #D23F5A 0px, #D23F5A 10px, transparent 10px, transparent 16px, #35B6FF 16px, #35B6FF 26px, transparent 26px, transparent 32px)',
          opacity: 0.85,
        }}
      />

      {/* ── TOP NAVIGATION HEADER ─────────────────────────────────── */}
      <header className="w-full px-5 pt-3 pb-2 flex items-center justify-between z-20 flex-shrink-0">
        <AppLogo size={34} showWordmark subtitle="LAYOVER RADAR" />

        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center border border-dashed border-[var(--ink-300)]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[var(--ink-500)] bg-white/70">
            <AirplaneLanding size={12} weight="bold" color="var(--hanko)" className="mr-1" />
            <span>TRANSIT RULES</span>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-[var(--ink-900)] hover:text-[var(--hanko)] font-body font-bold text-xs tracking-wide px-2.5 py-1 rounded transition-colors cursor-pointer active:scale-95"
            aria-label="Skip configuration"
          >
            Skip
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────── */}
      <main className="flex-1 px-5 pt-1 pb-6 flex flex-col justify-start z-10 gap-4 max-w-sm mx-auto w-full">
        {/* 1. Hero Mascot & Heading */}
        <div className="w-full flex flex-col items-center text-center relative pt-0">
          <div className="relative w-36 h-24 mb-0.5 flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-[var(--ink-300)]/30 flex items-center justify-center -rotate-12 pointer-events-none">
              <span className="font-mono text-[7px] text-[var(--ink-300)] font-bold uppercase tracking-widest text-center leading-tight">
                THEY WERE HERE
                <br />
                • TRANSIT RADAR •
              </span>
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(15,18,48,0.08)]">
              <PaperPlaneCanvas />
            </div>

            <div className="absolute bottom-1 w-20 h-2 bg-[var(--ink-900)]/10 rounded-full blur-[2px]" />
          </div>

          <h1 className="font-display font-extrabold text-[22px] leading-tight text-[var(--ink-900)] tracking-tight">
            Can you exit during <br />
            <span className="relative inline-block text-[var(--hanko)]">
              your layover?
              <svg
                className="absolute -bottom-1 left-0 w-full h-2 text-[var(--hanko)]"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 100 8"
              >
                <path
                  d="M0 5 Q 50 1, 100 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
            </span>
          </h1>

          <p className="font-body text-[var(--ink-700)] text-xs mt-2 max-w-[280px] leading-relaxed">
            Enter your flight ticket number or select countries below. We automatically calculate your layover transit duration, visa rules, and safe AR reach.
          </p>
        </div>

        {/* ── 2. FLIGHT TICKET / PNR AUTO-IMPORT (MENTOR UPGRADE) ── */}
        <section
          className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(15,18,48,0.06)]"
          style={{
            border: '1.5px dashed var(--line)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ticket size={18} weight="fill" color="var(--hanko)" />
              <span className="font-display font-bold text-xs text-[var(--ink-900)]">
                Flight Ticket / PNR Auto-Import
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--hanko)]/10 text-[var(--hanko)] font-bold">
              Auto-Detect
            </span>
          </div>

          <form onSubmit={handleFlightSearch} className="flex gap-2">
            <input
              type="text"
              value={flightQuery}
              onChange={(e) => setFlightQuery(e.target.value)}
              placeholder="Flight No. (e.g. EK564, AI998) or PNR"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[#FAF7F0] border border-[var(--line)] text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--hanko)]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-display font-bold bg-[var(--hanko)] text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <MagnifyingGlass size={13} weight="bold" />
              <span>Sync</span>
            </button>
          </form>

          {/* Popular Flight Demo Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono text-[var(--ink-500)] shrink-0">Tap to test:</span>
            {POPULAR_FLIGHT_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.flightNumber}
                type="button"
                onClick={() => handleApplyFlight(preset)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg shrink-0 border transition-all cursor-pointer ${
                  activeFlight?.flightNumber === preset.flightNumber
                    ? 'bg-[var(--hanko)] text-white border-[var(--hanko)] font-bold shadow-xs'
                    : 'bg-[#FAF7F0] text-[var(--ink-700)] border-[var(--line)] hover:border-[var(--hanko)]'
                }`}
              >
                {preset.flightNumber} ({preset.layoverHours}h)
              </button>
            ))}
          </div>

          {/* Active Flight Boarding Pass Coupon */}
          {activeFlight && (
            <div className="p-3 rounded-xl bg-white border-2 border-[var(--mint)] flex items-center justify-between text-xs animate-fade-in shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <AirplaneTilt size={18} weight="fill" color="var(--mint)" className="shrink-0" />
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs text-[var(--ink-900)] truncate">
                    {activeFlight.airline} {activeFlight.flightNumber} • {activeFlight.origin} ➔ {activeFlight.destination}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--ink-500)]">
                    {activeFlight.layoverHours}h Transit • Hub: {activeFlight.hubCountry}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold text-[var(--mint)] px-2 py-0.5 rounded bg-[var(--mint)]/10">
                  Active
                </span>
                <button
                  type="button"
                  onClick={handleCancelFlight}
                  className="text-[11px] font-mono font-bold text-[var(--hanko)] hover:underline px-1.5 py-0.5 cursor-pointer"
                  title="Cancel ticket and switch back to manual mode"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── 3. MANUAL PASSPORT & TRANSIT HUB SELECTION (SHADED IF TICKET ACTIVE) ── */}
        <section
          className={`bg-white rounded-2xl p-4 border transition-all duration-200 relative flex flex-col gap-3.5 ${
            activeFlight
              ? 'opacity-35 grayscale pointer-events-none select-none border-[var(--ink-200)] shadow-none'
              : 'border-[var(--ink-900)]/10 shadow-[0_4px_20px_rgba(15,18,48,0.05)]'
          }`}
        >
          {activeFlight && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-3 bg-white/70 backdrop-blur-[1px] rounded-2xl pointer-events-auto">
              <div className="bg-[var(--ink-900)] text-white px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold shadow-md flex items-center gap-1.5">
                <span>Locked by {activeFlight.flightNumber}</span>
                <button
                  type="button"
                  onClick={handleCancelFlight}
                  className="underline text-[var(--warn)] hover:text-white cursor-pointer ml-1"
                >
                  Switch to Manual
                </button>
              </div>
            </div>
          )}

          <div className="text-[10px] font-mono text-[var(--ink-500)] font-bold uppercase tracking-wider">
            {activeFlight ? 'Manual Mode (Disabled while flight ticket is synced)' : 'Or configure passport & hub manually:'}
          </div>

          <CountrySelectInput
            label="Your Passport Country"
            value={passportCountry}
            onChange={setPassportCountry}
            popularList={POPULAR_PASSPORTS}
            icon={<IdentificationCard size={14} weight="bold" />}
          />

          <CountrySelectInput
            label="Layover Transit Hub"
            value={layoverCountry}
            onChange={setLayoverCountry}
            popularList={POPULAR_LAYOVER_HUBS}
            icon={<AirplaneLanding size={14} weight="bold" />}
          />
        </section>

        {/* 3. Live Assessment Verdict Card */}
        <LayoverExitCard assessment={assessment} />

        {/* 4. Conditional Content Based on Assessment */}
        {!assessment.canExit ? (
          /* ── IF NOT ALLOWED TO EXIT ────────────────────────────── */
          <section className="bg-white rounded-2xl p-4 border border-[var(--hanko)]/20 shadow-[0_4px_20px_rgba(210,63,90,0.08)] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--hanko)] uppercase tracking-wider">
              <WarningCircle size={16} weight="bold" />
              <span>Explore Airside or Switch Hub</span>
            </div>

            <p className="font-body text-xs text-[var(--ink-700)] leading-relaxed">
              Because passport control will not permit you to clear immigration without an advance visa, you must stay inside the airport.
            </p>

            {/* Quick preset switches for judging demo */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-[var(--ink-500)] uppercase font-semibold">
                Quick Demo Switches:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPassportCountry('India');
                    setLayoverCountry('Qatar');
                  }}
                  className="px-2.5 py-1 rounded-md text-[10px] font-body font-bold border border-[var(--mint)] bg-[var(--mint)]/10 text-[var(--ink-900)] cursor-pointer"
                >
                  Test Qatar (Free VOA)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPassportCountry('India');
                    setLayoverCountry('United Arab Emirates');
                  }}
                  className="px-2.5 py-1 rounded-md text-[10px] font-body font-bold border border-[var(--warn)] bg-[var(--warn)]/10 text-[var(--ink-900)] cursor-pointer"
                >
                  Test UAE (8h+ Transit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPassportCountry('United Kingdom');
                    setLayoverCountry('China');
                  }}
                  className="px-2.5 py-1 rounded-md text-[10px] font-body font-bold border border-[var(--warn)] bg-[var(--warn)]/10 text-[var(--ink-900)] cursor-pointer"
                >
                  Test UK in China (240h)
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* ── IF EXIT ALLOWED: Ask hours & calculate reach ──────── */
          <>
            <section className="bg-white rounded-2xl p-4 border border-[var(--ink-900)]/10 shadow-[0_4px_20px_rgba(15,18,48,0.05)] relative">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--ink-900)]/5">
                <div>
                  <span className="block font-mono text-[10px] text-[var(--ink-300)] font-semibold uppercase tracking-wider">
                    LAYOVER DURATION
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display font-black text-3xl text-[var(--ink-900)] tracking-tight">
                      {layoverHours}
                    </span>
                    <span className="font-display font-bold text-base text-[var(--ink-700)]">
                      {layoverHours === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--paper)] border border-[var(--paper-edge)] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--warn)] animate-pulse" />
                  <span className="font-body font-bold text-[10px] text-[var(--ink-900)] tracking-tight">
                    {currentDesc.badge}
                  </span>
                </div>
              </div>

              {/* Tactile Slider */}
              <div className="mt-3.5 px-0.5">
                <div className="relative flex items-center h-8">
                  <div className="w-full h-3 bg-[#EFECE6] rounded-full border border-[var(--ink-900)]/10 overflow-hidden relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--warn)] to-[var(--legendary)] transition-all duration-150"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={LAYOVER_STEPS.length - 1}
                    step={1}
                    value={stepIndex}
                    onChange={(e) => setLayoverHours(LAYOVER_STEPS[parseInt(e.target.value, 10)] ?? 4)}
                    aria-label="Layover duration in hours"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                  />

                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center transition-all duration-150"
                    style={{ left: `${progressPercent}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[var(--hanko)] border-2 border-white shadow-[0_3px_8px_rgba(210,63,90,0.45)] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  </div>
                </div>

                {/* Hour Tick Buttons — Centered under exact slider snap points */}
                <div className="relative w-full h-6 mt-1.5 font-mono text-[11px] font-bold select-none text-[var(--ink-500)]">
                  {LAYOVER_STEPS.map((hr, idx) => {
                    const isSelected = layoverHours === hr;
                    const leftPct = (idx / (LAYOVER_STEPS.length - 1)) * 100;
                    return (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => setLayoverHours(hr)}
                        style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                        className={`absolute top-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'text-[var(--hanko)] font-black underline underline-offset-4 decoration-2 scale-105'
                            : 'hover:text-[var(--ink-900)]'
                        }`}
                      >
                        {hr} {hr === 1 ? 'hr' : 'hrs'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Postcard Reach Indicator Card */}
            <section className="relative bg-[var(--paper)] rounded-2xl p-3.5 border-[2.5px] border-[var(--line)] shadow-[3px_4px_0px_#14143A] transform -rotate-0.5 transition-transform hover:rotate-0 duration-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-5 h-5 bg-[var(--paper-edge)] border-l-[2px] border-b-[2px] border-[var(--line)] rounded-bl-sm" />

              <div className="relative z-10 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--line)] text-[var(--paper)] flex items-center justify-center flex-shrink-0">
                    <Compass size={13} weight="bold" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-700)]">
                    DUSK POSTCARD RADIUS
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="font-body text-xs text-[var(--ink-700)] font-medium">
                    You can reach notes up to
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--ink-900)] tracking-tight bg-white/80 px-1.5 py-0.5 rounded border border-[var(--line)]/20 shadow-2xs">
                    {reachKm} km
                  </span>
                  <span className="font-body text-xs text-[var(--ink-700)] font-medium">
                    away
                  </span>
                </div>

                <p className="font-body text-[10px] text-[var(--ink-500)] leading-tight">
                  Calculated round-trip walking radius from airport exit gates.
                </p>

                <div className="pt-0.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-white/80 border border-[var(--line)]/20 rounded-full px-2 py-0.5 shadow-2xs">
                    <MapPin size={11} weight="fill" color="var(--hanko)" />
                    <span className="font-mono text-[9px] font-bold text-[var(--ink-900)]">
                      ~{currentDesc.notesEst} Notes In Range
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--ink-500)]">
                    Walking Speed ~4.5 km/h
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── BOTTOM ACTION AREA ────────────────────────────────────── */}
      <footer className="w-full px-5 pb-5 pt-1 z-20 flex flex-col items-center max-w-sm mx-auto flex-shrink-0">
        {!assessment.canExit ? (
          <button
            type="button"
            onClick={handleFinish}
            className="slant-btn slant-btn--primary w-full py-3.5 text-center cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98] transition-transform"
            style={{
              minHeight: 48,
              background: 'var(--ink-700)',
              color: '#FFFFFF',
            }}
          >
            <span>Enter in Airside Mode</span>
            <ArrowRight
              size={18}
              weight="bold"
              className="transition-transform group-hover:translate-x-1 duration-150"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="slant-btn slant-btn--primary w-full py-3.5 text-center cursor-pointer shadow-[0_6px_20px_rgba(210,63,90,0.35)] flex items-center justify-center gap-2 group active:scale-[0.98] transition-transform"
            style={{
              minHeight: 48,
              background: 'var(--hanko)',
              color: '#FFFFFF',
            }}
          >
            <span>Explore Notes in Reach</span>
            <ArrowRight
              size={18}
              weight="bold"
              className="transition-transform group-hover:translate-x-1 duration-150"
            />
          </button>
        )}

        <div className="flex items-center gap-1.5 mt-2.5 text-[var(--ink-500)] font-mono text-[10px]">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: assessment.canExit ? 'var(--mint)' : 'var(--hanko)' }}
          />
          <span>
            {assessment.canExit
              ? 'Calibrated to your local GPS & dusk horizon'
              : 'Airside transit concourse lock active'}
          </span>
        </div>
      </footer>
    </div>
  );
};
