/* ============================================================
 * THEY WERE HERE — Layover Onboarding (P0 Front Door)
 * "How long is your layover?" slider 1-8 hours.
 * Runs before the user ever sees the map.
 * ============================================================ */

import { NavigationArrow } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { layoverReachKm } from '@/lib/geo';
import { APP_NAME } from '@/contracts/types';
import { PaperPlaneCanvas } from '@/3d/PaperPlaneCanvas';

interface LayoverOnboardingProps {
  onComplete: () => void;
}

export function LayoverOnboarding({ onComplete }: LayoverOnboardingProps) {
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);
  const reachKm = layoverReachKm(layoverHours).toFixed(1);

  const handleFinish = () => {
    onComplete();
  };

  const handleSkip = () => {
    setLayoverHours(4);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col justify-between p-6 safe-top safe-bottom"
      style={{
        zIndex: 'var(--z-onboarding)',
        background: `linear-gradient(
          180deg,
          var(--sky-a) 0%,
          var(--sky-b) 40%,
          var(--ink-900) 100%
        )`,
      }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center pt-4">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-base)',
            color: 'white',
            letterSpacing: '0.05em',
          }}
        >
          {APP_NAME}
        </span>
        <button
          onClick={handleSkip}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Skip
        </button>
      </div>

      {/* Main question and slider card */}
      <div className="flex flex-col items-center text-center my-auto px-2">
        <div className="w-56 h-36 mb-1 flex items-center justify-center">
          <PaperPlaneCanvas />
        </div>

        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--font-size-2xl)',
            color: 'white',
            lineHeight: 1.2,
          }}
        >
          How long is your layover?
        </h1>

        <p
          className="mb-8 max-w-xs"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Travel advice you can only read by standing where it was written.
        </p>

        {/* Current Hours Display */}
        <div className="mb-6">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              color: 'var(--color-legendary)',
            }}
          >
            {layoverHours}
          </span>
          <span
            className="ml-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-lg)',
              color: 'white',
            }}
          >
            {layoverHours === 1 ? 'hour' : 'hours'}
          </span>
        </div>

        {/* Slider */}
        <div className="w-full max-w-xs mb-8">
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={layoverHours}
            onChange={(e) => setLayoverHours(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
            style={{ height: 8 }}
          />
          <div
            className="flex justify-between mt-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-xs)',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <span>1 hr</span>
            <span>4 hrs</span>
            <span>8 hrs</span>
          </div>
        </div>

        {/* Reach Preview (Estimate per spec) */}
        <div
          className="glass p-4 rounded-xl max-w-xs w-full flex items-center gap-3 text-left"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <NavigationArrow
            size={24}
            weight="fill"
            style={{ color: 'var(--rare)', flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              You can reach notes up to {reachKm} km away
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-xs)',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Estimated round-trip walking distance (no transit guarantee)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pb-4 w-full max-w-sm mx-auto">
        <button
          onClick={handleFinish}
          className="slant-btn slant-btn--primary w-full py-4 text-center cursor-pointer"
          style={{
            fontSize: 'var(--font-size-base)',
            minHeight: 48,
          }}
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
