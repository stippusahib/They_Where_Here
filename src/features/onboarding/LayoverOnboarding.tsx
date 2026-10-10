/* ============================================================
 * THEY WERE HERE — Layover Onboarding (P0 Front Door)
 * Designed with Google Stitch (Light Dusk Postcard Design System)
 * Warm cream canvas (#FAFAF7), high contrast indigo (#0F1230),
 * tactile layover duration dial, and die-cut postcard reach card.
 * ============================================================ */

import React from 'react';
import {
  ArrowRight,
  Compass,
  MapPin,
  AirplaneLanding,
} from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { layoverReachKm } from '@/lib/geo';
import { PaperPlaneCanvas } from '@/3d/PaperPlaneCanvas';
import { AppLogo } from '@/ui/components/AppLogo';

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
  const reachKm = layoverReachKm(layoverHours).toFixed(1);

  const currentDesc = LAYOVER_DESCRIPTIONS[layoverHours] || DEFAULT_DESC;
  const progressPercent = Math.min(100, Math.max(0, ((layoverHours - 1) / 7) * 100));

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
            'repeating-linear-gradient(-45deg, #E8264C 0px, #E8264C 10px, transparent 10px, transparent 16px, #35B6FF 16px, #35B6FF 26px, transparent 26px, transparent 32px)',
          opacity: 0.85,
        }}
      />

      {/* ── TOP NAVIGATION HEADER ─────────────────────────────────── */}
      <header className="w-full px-5 pt-3 pb-2 flex items-center justify-between z-20 flex-shrink-0">
        <AppLogo size={34} showWordmark subtitle="POSTCARD DISCOVERY" />

        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center border border-dashed border-[var(--ink-300)]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[var(--ink-500)] bg-white/70">
            <AirplaneLanding size={12} weight="bold" color="var(--hanko)" className="mr-1" />
            <span>TRANSIT</span>
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
      <main className="flex-1 px-5 pt-1 pb-4 flex flex-col justify-start z-10 gap-3.5 max-w-sm mx-auto w-full">
        {/* 1. Hero Mascot & Heading */}
        <div className="w-full flex flex-col items-center text-center relative pt-0">
          {/* Origami Mascot Container with Postmark Stamp Watermark */}
          <div className="relative w-40 h-28 mb-0.5 flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-[var(--ink-300)]/30 flex items-center justify-center -rotate-12 pointer-events-none">
              <span className="font-mono text-[7px] text-[var(--ink-300)] font-bold uppercase tracking-widest text-center leading-tight">
                THEY WERE HERE
                <br />
                • DUSK RADAR •
              </span>
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center filter drop-shadow-[0_8px_14px_rgba(15,18,48,0.08)]">
              <PaperPlaneCanvas />
            </div>

            {/* Soft Paper Fold Shadow */}
            <div className="absolute bottom-1 w-24 h-2 bg-[var(--ink-900)]/10 rounded-full blur-[2px]" />
          </div>

          <h1 className="font-display font-extrabold text-[24px] leading-tight text-[var(--ink-900)] tracking-tight">
            How long is your <br />
            <span className="relative inline-block">
              layover?
              {/* Hand-drawn style decorative underline accent */}
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

          <p className="font-body text-[var(--ink-700)] text-xs mt-2 max-w-[270px] leading-relaxed">
            Travel advice you can only read by standing where it was written.
          </p>
        </div>

        {/* 2. Interactive Layover Time Selector Card */}
        <section className="bg-white rounded-2xl p-4 border border-[var(--ink-900)]/10 shadow-[0_4px_20px_rgba(15,18,48,0.05)] relative">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--ink-900)]/5">
            <div>
              <span className="block font-mono text-[10px] text-[var(--ink-300)] font-semibold uppercase tracking-wider">
                AVAILABLE DURATION
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

          {/* Custom Tactile Slider UI */}
          <div className="mt-3.5 px-0.5">
            <div className="relative flex items-center h-8">
              {/* Inset Track */}
              <div className="w-full h-3 bg-[#EFECE6] rounded-full border border-[var(--ink-900)]/10 overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[var(--warn)] to-[var(--legendary)] transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Native Range Input */}
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={layoverHours}
                onChange={(e) => setLayoverHours(parseInt(e.target.value, 10))}
                aria-label="Layover duration in hours"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />

              {/* Tactile Circular Thumb Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center transition-all duration-150"
                style={{ left: `${progressPercent}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-[var(--hanko)] border-2 border-white shadow-[0_3px_8px_rgba(232,38,76,0.45)] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Hour Tick Buttons */}
            <div className="flex justify-between items-center mt-1 px-1 font-mono text-[11px] font-bold select-none text-[var(--ink-500)]">
              {[1, 2, 4, 6, 8].map((hr) => (
                <button
                  key={hr}
                  type="button"
                  onClick={() => setLayoverHours(hr)}
                  className={`transition-colors cursor-pointer ${
                    layoverHours === hr
                      ? 'text-[var(--hanko)] font-black underline underline-offset-4 decoration-2'
                      : 'hover:text-[var(--ink-900)]'
                  }`}
                >
                  {hr} {hr === 1 ? 'hr' : 'hrs'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Postcard Reach Indicator Card (Perforated Warm Cream Sticker Note) */}
        <section className="relative bg-[var(--paper)] rounded-2xl p-3.5 border-[2.5px] border-[var(--line)] shadow-[3px_4px_0px_#14143A] transform -rotate-0.5 transition-transform hover:rotate-0 duration-200 overflow-hidden">
          {/* Folded Corner Illusion */}
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
              Estimated round-trip walking distance (no transit guarantee).
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
      </main>

      {/* ── BOTTOM ACTION AREA ────────────────────────────────────── */}
      <footer className="w-full px-5 pb-5 pt-1 z-20 flex flex-col items-center max-w-sm mx-auto flex-shrink-0">
        <button
          type="button"
          onClick={handleFinish}
          className="slant-btn slant-btn--primary w-full py-3.5 text-center cursor-pointer shadow-[0_6px_20px_rgba(232,38,76,0.35)] flex items-center justify-center gap-2 group active:scale-[0.98] transition-transform"
          style={{ minHeight: 48 }}
        >
          <span>Let's go</span>
          <ArrowRight
            size={18}
            weight="bold"
            className="transition-transform group-hover:translate-x-1 duration-150"
          />
        </button>

        <div className="flex items-center gap-1.5 mt-2.5 text-[var(--ink-500)] font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[var(--mint)]" />
          <span>Calibrated to your local GPS &amp; dusk horizon</span>
        </div>
      </footer>
    </div>
  );
};
