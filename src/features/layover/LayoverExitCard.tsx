/* ============================================================
 * THEY WERE HERE — Layover Exit Rule Assessment Card
 * Clear verdict on whether traveler can leave the airport.
 * Fully server-authoritative logic, Zero emojis, Phosphor icons.
 * ============================================================ */

import React from 'react';
import { XCircle, CheckCircle, WarningCircle, AirplaneLanding, Info } from '@phosphor-icons/react';
import type { LayoverExitAssessment } from '@/lib/visaCheck';

interface LayoverExitCardProps {
  assessment: LayoverExitAssessment;
}

export const LayoverExitCard: React.FC<LayoverExitCardProps> = ({ assessment }) => {
  const { canExit, isConditional, badgeText, headline, ruleText, noteText, passport, layoverCountry } =
    assessment;

  if (!canExit) {
    return (
      <div
        className="w-full rounded-2xl p-4 border flex flex-col gap-2.5 transition-all shadow-sm"
        style={{
          background: 'rgba(210, 63, 90, 0.05)',
          borderColor: 'rgba(210, 63, 90, 0.4)',
        }}
      >
        {/* Header row with icon & badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <XCircle size={24} weight="fill" color="var(--hanko)" className="flex-shrink-0" />
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase"
              style={{
                background: 'rgba(210, 63, 90, 0.15)',
                color: 'var(--hanko)',
                border: '1px solid rgba(210, 63, 90, 0.3)',
              }}
            >
              {badgeText}
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold text-[var(--ink-500)] text-right">
            {passport} &rarr; {layoverCountry}
          </span>
        </div>

        {/* Primary Verdict Headline */}
        <div>
          <h3 className="font-display font-extrabold text-base text-[var(--hanko)] leading-snug">
            {headline}
          </h3>
          <p className="text-xs font-body text-[var(--ink-700)] mt-1 leading-relaxed">
            {ruleText}
          </p>
        </div>

        {/* Airside Restriction Warning Notice */}
        <div className="p-2.5 rounded-xl bg-white/80 border border-[var(--ink-900)]/10 flex items-start gap-2 text-[11px] font-body text-[var(--ink-700)]">
          <AirplaneLanding size={16} weight="bold" color="var(--hanko)" className="flex-shrink-0 mt-0.5" />
          <div className="leading-tight">
            <strong>Transit Rule:</strong> You must remain in the airport airside concourse. Border control will not permit terminal exit without an advance consular visa.
          </div>
        </div>

        {noteText && (
          <div className="text-[9px] font-mono text-[var(--ink-300)] flex items-center gap-1">
            <Info size={11} weight="bold" />
            <span>Verified: {noteText}</span>
          </div>
        )}
      </div>
    );
  }

  // Exit is allowed (or conditional)
  return (
    <div
      className="w-full rounded-2xl p-4 border flex flex-col gap-2.5 transition-all shadow-sm"
      style={{
        background: isConditional ? 'rgba(255, 158, 61, 0.08)' : 'rgba(94, 226, 181, 0.12)',
        borderColor: isConditional ? 'rgba(255, 158, 61, 0.4)' : 'rgba(94, 226, 181, 0.5)',
      }}
    >
      {/* Header row with icon & badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isConditional ? (
            <WarningCircle size={24} weight="fill" color="var(--warn)" className="flex-shrink-0" />
          ) : (
            <CheckCircle size={24} weight="fill" color="var(--mint)" className="flex-shrink-0" />
          )}
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase"
            style={{
              background: isConditional ? 'rgba(255, 158, 61, 0.2)' : 'rgba(94, 226, 181, 0.25)',
              color: 'var(--ink-900)',
              border: isConditional
                ? '1px solid rgba(255, 158, 61, 0.5)'
                : '1px solid rgba(94, 226, 181, 0.6)',
            }}
          >
            {badgeText}
          </span>
        </div>

        <span className="text-[10px] font-mono font-bold text-[var(--ink-500)] text-right">
          {passport} &rarr; {layoverCountry}
        </span>
      </div>

      {/* Primary Headline */}
      <div>
        <h3 className="font-display font-extrabold text-base text-[var(--ink-900)] leading-snug">
          {headline}
        </h3>
        <p className="text-xs font-body text-[var(--ink-700)] mt-1 leading-relaxed">
          {ruleText}
        </p>
      </div>

      {/* Guidance */}
      <div className="p-2.5 rounded-xl bg-white/80 border border-[var(--ink-900)]/10 flex items-start gap-2 text-[11px] font-body text-[var(--ink-700)]">
        <AirplaneLanding size={16} weight="bold" color="var(--ink-700)" className="flex-shrink-0 mt-0.5" />
        <div className="leading-tight">
          {isConditional ? (
            <>
              <strong>Transit Facility:</strong> Verify your onward flight tickets and airline transit counter before clearing border control.
            </>
          ) : (
            <>
              <strong>Exit Permitted:</strong> You can clear immigration and step outside the airport to discover notes in your layover window.
            </>
          )}
        </div>
      </div>

      {noteText && (
        <div className="text-[9px] font-mono text-[var(--ink-300)] flex items-center gap-1">
          <Info size={11} weight="bold" />
          <span>Note: {noteText}</span>
        </div>
      )}
    </div>
  );
};
