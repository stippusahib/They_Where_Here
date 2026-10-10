/* ============================================================
 * THEY WERE HERE — Layover Sheet
 * In-map inspector for Passport x Layover Country exit rules
 * and safe walking exploration radius calculation.
 * Zero emojis, Phosphor icons, full design system tokens.
 * ============================================================ */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Footprints, IdentificationCard, AirplaneLanding, ArrowRight, ShieldCheck } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { layoverReachKm } from '@/lib/geo';
import {
  checkLayoverExit,
  POPULAR_PASSPORTS,
  POPULAR_LAYOVER_HUBS,
} from '@/lib/visaCheck';
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
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={layoverHours}
                    onChange={(e) => setLayoverHours(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--hanko)] bg-[var(--ink-100)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--ink-500)] px-1 font-mono font-bold">
                    <span>1h</span>
                    <span>2h</span>
                    <span>4h</span>
                    <span>6h</span>
                    <span>8h</span>
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
