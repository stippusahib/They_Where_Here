/* ============================================================
 * THEY WERE HERE — Layover Sheet
 * In-map inspector for Passport x Layover Country exit rules
 * and safe walking exploration radius calculation.
 * Zero emojis, Phosphor icons, full design system tokens.
 * ============================================================ */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  Footprints,
  IdentificationCard,
  AirplaneLanding,
  ArrowRight,
  ShieldCheck,
  AirplaneTilt,
  Ticket,
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
import { CountrySelectInput } from './CountrySelectInput';
import { LayoverExitCard } from './LayoverExitCard';

interface LayoverSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShowReach: () => void;
  notesInReachCount: number;
}

const QUICK_HOURS = [1, 2, 4, 6, 8];

export const LayoverSheet: React.FC<LayoverSheetProps> = ({
  isOpen,
  onClose,
  onShowReach,
  notesInReachCount,
}) => {
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

  const assessment = useMemo(() => {
    return checkLayoverExit(passportCountry, layoverCountry);
  }, [passportCountry, layoverCountry]);

  const reachKm = layoverReachKm(layoverHours);

  const handleShowReachClick = () => {
    onShowReach();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 max-w-lg mx-auto p-5 rounded-t-3xl border-t shadow-2xl flex flex-col gap-4 safe-bottom overflow-y-auto max-h-[90dvh]"
            style={{
              background: 'var(--sheet-bg)',
              borderColor: 'var(--sheet-border)',
              backdropFilter: 'blur(24px)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Sheet Handle & Close */}
            <div className="flex items-center justify-between border-b pb-3 border-[var(--ink-900)]/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} weight="bold" color="var(--hanko)" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-900)]">
                  Layover Exit Rules &amp; Reach
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[var(--ink-500)] hover:text-[var(--ink-900)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* ── FLIGHT / PNR TICKET AUTO-IMPORT CARD (MENTOR UPGRADE) ── */}
            <div
              className="p-3.5 rounded-2xl flex flex-col gap-2.5"
              style={{
                background: '#FAF7F0',
                border: '1.5px dashed var(--line)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Ticket size={16} weight="fill" color="var(--hanko)" />
                  <span className="text-xs font-display font-bold text-[var(--ink-900)]">
                    Flight / PNR Auto-Import
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--hanko)]/10 text-[var(--hanko)] font-bold">
                  Auto-Sync
                </span>
              </div>

              {/* Input & Search Form */}
              <form onSubmit={handleFlightSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={flightQuery}
                    onChange={(e) => setFlightQuery(e.target.value)}
                    placeholder="Enter Flight No. (e.g. EK564, AI998) or PNR"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white border border-[var(--line)] text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--hanko)]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-display font-bold bg-[var(--hanko)] text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <MagnifyingGlass size={13} weight="bold" />
                  <span>Sync</span>
                </button>
              </form>

              {/* One-Tap Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-mono text-[var(--ink-500)] shrink-0">Popular:</span>
                {POPULAR_FLIGHT_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.flightNumber}
                    type="button"
                    onClick={() => handleApplyFlight(preset)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg shrink-0 border transition-all cursor-pointer ${
                      activeFlight?.flightNumber === preset.flightNumber
                        ? 'bg-[var(--hanko)] text-white border-[var(--hanko)] font-bold'
                        : 'bg-white text-[var(--ink-700)] border-[var(--line)] hover:border-[var(--hanko)]'
                    }`}
                  >
                    {preset.flightNumber} ({preset.layoverHours}h)
                  </button>
                ))}
              </div>

              {/* Active Ticket Readout Banner */}
              {activeFlight && (
                <div className="p-2.5 rounded-xl bg-white border border-[var(--mint)]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AirplaneTilt size={16} weight="fill" color="var(--mint)" />
                    <div>
                      <div className="font-display text-xs text-[var(--ink-900)]">
                        {activeFlight.airline} {activeFlight.flightNumber} • {activeFlight.origin} ➔ {activeFlight.destination}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--ink-500)]">
                        {activeFlight.layoverHours}h Transit • Hub: {activeFlight.hubCountry} • {activeFlight.terminal}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--mint)] px-1.5 py-0.5 rounded bg-[var(--mint)]/10">
                    Synced
                  </span>
                </div>
              )}
            </div>

            {/* Country Selectors */}
            <div className="flex flex-col gap-3">
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
            </div>

            {/* Live Visa Exit Assessment Card */}
            <LayoverExitCard assessment={assessment} />

            {/* If NOT allowed: Explain clearly & provide airside view option */}
            {!assessment.canExit ? (
              <div className="flex flex-col gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/70 border border-[var(--ink-900)]/10 flex flex-col gap-1.5 text-xs text-[var(--ink-700)]">
                  <span className="font-bold text-[var(--hanko)]">
                    Airport Transit Only
                  </span>
                  <span>
                    Because you cannot clear border control without a visa, city notes are inaccessible. You can only view notes placed airside within the terminal gates.
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleShowReachClick}
                    className="slant-btn slant-btn--primary px-5 py-2.5 text-xs cursor-pointer"
                    style={{
                      background: 'var(--ink-700)',
                      color: '#fff',
                    }}
                  >
                    <span>View Airside Map</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If EXIT ALLOWED: Ask hours & show radius */
              <div className="flex flex-col gap-4 pt-1">
                {/* Hours Header & Display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} weight="bold" color="var(--hanko)" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-700)]">
                      How many hours is your layover?
                    </span>
                  </div>
                  <span className="font-display font-black text-xl text-[var(--ink-900)]">
                    {layoverHours} {layoverHours === 1 ? 'hr' : 'hrs'}
                  </span>
                </div>

                {/* Range Slider */}
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center h-8">
                    <input
                      type="range"
                      min={0}
                      max={QUICK_HOURS.length - 1}
                      step={1}
                      value={Math.max(0, QUICK_HOURS.indexOf(layoverHours))}
                      onChange={(e) => setLayoverHours(QUICK_HOURS[parseInt(e.target.value, 10)] ?? 4)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--hanko)] bg-[var(--ink-100)]"
                    />
                  </div>
                  <div className="relative w-full h-5 font-mono text-[11px] font-bold text-[var(--ink-500)]">
                    {QUICK_HOURS.map((h, idx) => {
                      const isSelected = layoverHours === h;
                      const leftPct = (idx / (QUICK_HOURS.length - 1)) * 100;
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setLayoverHours(h)}
                          style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                          className={`absolute top-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'text-[var(--hanko)] font-black underline underline-offset-4 decoration-2'
                              : 'hover:text-[var(--ink-900)]'
                          }`}
                        >
                          {h}h
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex justify-center gap-2">
                  {QUICK_HOURS.map((h) => {
                    const isActive = layoverHours === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setLayoverHours(h)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                        style={{
                          background: isActive ? 'var(--hanko)' : 'rgba(15, 18, 48, 0.06)',
                          color: isActive ? '#fff' : 'var(--ink-700)',
                          border: isActive
                            ? '1.5px solid var(--hanko)'
                            : '1px solid rgba(15, 18, 48, 0.12)',
                        }}
                      >
                        {h}h
                      </button>
                    );
                  })}
                </div>

                {/* Reach explanation & live note count */}
                <div className="p-3.5 rounded-xl bg-[var(--paper)] border border-[var(--paper-edge)] flex flex-col gap-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-900)]">
                    <Footprints size={16} weight="bold" color="var(--hanko)" />
                    <span>
                      Exploration perimeter: <strong className="font-mono">{reachKm.toFixed(1)} km</strong> walking radius (there and back safely).
                    </span>
                  </div>
                  <div className="text-xs text-[var(--ink-700)] font-bold pl-6">
                    {notesInReachCount} {notesInReachCount === 1 ? 'note' : 'notes'} inside your layover reach
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                  <button
                    onClick={handleShowReachClick}
                    className="slant-btn slant-btn--primary px-6 py-2.5 text-xs cursor-pointer flex items-center gap-1.5"
                    style={{
                      background: 'var(--hanko)',
                      color: '#fff',
                    }}
                  >
                    <span>Explore Notes in Reach</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
