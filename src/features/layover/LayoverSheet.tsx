import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Footprints } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { layoverReachKm } from '@/lib/geo';

interface LayoverSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShowReach: () => void;
  notesInReachCount: number;
}

const QUICK_HOURS = [1, 2, 4, 6];

export const LayoverSheet: React.FC<LayoverSheetProps> = ({
  isOpen,
  onClose,
  onShowReach,
  notesInReachCount,
}) => {
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);

  const reachKm = layoverReachKm(layoverHours);

  const handleSkip = () => {
    setLayoverHours(4);
    onClose();
  };

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
            className="fixed left-0 right-0 bottom-0 z-50 max-w-lg mx-auto p-6 rounded-t-3xl border-t shadow-2xl flex flex-col gap-5 safe-bottom"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} weight="bold" color="var(--reach)" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--reach)]">
                  Layover Mode
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Giant Layover Hours Display */}
            <div className="text-center py-2">
              <div
                className="text-[64px] font-black leading-none text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}
              >
                {layoverHours}
              </div>
              <div className="text-sm font-medium text-white/70 mt-1">
                hours of layover
              </div>
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
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--accent)] bg-white/20"
              />
              <div className="flex justify-between text-xs text-white/50 px-1 font-display">
                <span>1h</span>
                <span>4h</span>
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
                    onClick={() => setLayoverHours(h)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                      border: isActive
                        ? '1.5px solid rgba(255, 255, 255, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {h}h
                  </button>
                );
              })}
            </div>

            {/* Reach explanation & live note count */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Footprints size={16} weight="bold" color="var(--reach)" />
                <span>
                  You can reach notes up to <strong className="text-white">{reachKm.toFixed(1)} km</strong> away (estimate, on foot, there and back).
                </span>
              </div>
              <div className="text-xs text-[var(--reach)] font-bold pl-6">
                {notesInReachCount} {notesInReachCount === 1 ? 'note' : 'notes'} inside your reach
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1 gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 text-xs text-white/60 hover:text-white transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleShowReachClick}
                className="slant-btn slant-btn--primary px-6 py-2.5 text-xs"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                Show my reach
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
