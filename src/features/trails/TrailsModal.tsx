/* ============================================================
 * THEY WERE HERE — Curated Layover Trails Modal
 * Hour-sized chains of verified notes designed for travellers with dead time.
 * ============================================================ */

import { X, Clock, Footprints, Check, Compass } from '@phosphor-icons/react';
import { useAppStore } from '@/state/store';
import { playButtonClick } from '@/lib/audio';

interface Trail {
  id: string;
  name: string;
  hours: number;
  distanceKm: number;
  stops: number;
  description: string;
  highlights: string[];
}

const CURATED_TRAILS: Trail[] = [
  {
    id: 'trail-1',
    name: 'TinkerSpace Perimeter Sprint',
    hours: 1,
    distanceKm: 0.5,
    stops: 3,
    description: 'Quick perimeter walk around the hackathon hall and nearby green tea stalls.',
    highlights: ['Banyan Tree Stall', 'Gate Notes', 'Quiet Bench'],
  },
  {
    id: 'trail-2',
    name: 'Calicut Beach & Sunset Pier',
    hours: 2,
    distanceKm: 1.8,
    stops: 4,
    description: 'Breezy coastal route connecting colonial sea piers, ice orathi, and verified viewpoints.',
    highlights: ['Old Pier Ruins', 'Sulaimani Counter', 'Lighthouse Path'],
  },
  {
    id: 'trail-3',
    name: 'Heritage & SM Street Walk',
    hours: 4,
    distanceKm: 3.2,
    stops: 6,
    description: 'Vibrant Malabar commerce and heritage walk through Sweet Meat Street and Mananchira.',
    highlights: ['Halwa Guilds', 'Mananchira Tank', 'Handloom Corners'],
  },
  {
    id: 'trail-4',
    name: 'Full Malabar Layover Odyssey',
    hours: 8,
    distanceKm: 6.8,
    stops: 9,
    description: 'The ultimate deep-dive for travellers with an all-day connection across Calicut.',
    highlights: ['Kappad Point', 'Beypore Dhow Yards', 'Kallayi River'],
  },
];

interface TrailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrailsModal({ isOpen, onClose }: TrailsModalProps) {
  const layoverHours = useAppStore((s) => s.layoverHours);
  const setLayoverHours = useAppStore((s) => s.setLayoverHours);

  if (!isOpen) return null;

  const handleSelectTrail = (trail: Trail) => {
    playButtonClick();
    setLayoverHours(trail.hours);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15, 18, 48, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md p-6 relative overflow-hidden"
        style={{
          background: 'var(--color-paper)',
          color: 'var(--color-ink-900)',
          borderRadius: '24px 24px 0 0',
          border: '2px solid var(--color-paper-edge)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <Compass size={22} weight="bold" color="var(--color-ink-900)" />
            <h2
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-900)' }}
            >
              Layover Trails
            </h2>
          </div>
          <button
            onClick={() => {
              playButtonClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="Close trails modal"
          >
            <X size={20} weight="bold" color="var(--color-ink-900)" />
          </button>
        </div>

        {/* Trail List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {CURATED_TRAILS.map((trail) => {
            const isCurrent = layoverHours === trail.hours;
            return (
              <div
                key={trail.id}
                onClick={() => handleSelectTrail(trail)}
                className="p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.99]"
                style={{
                  background: isCurrent ? 'white' : 'rgba(255,255,255,0.6)',
                  borderColor: isCurrent ? 'var(--color-hanko)' : 'rgba(0,0,0,0.1)',
                  boxShadow: isCurrent ? '0 4px 15px rgba(232, 38, 76, 0.15)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink-900)' }}
                  >
                    {trail.name}
                  </h3>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold"
                    style={{
                      background: isCurrent ? 'var(--color-hanko)' : 'var(--color-ink-900)',
                      color: 'white',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    <Clock size={12} weight="bold" />
                    <span>{trail.hours} hr</span>
                  </div>
                </div>

                <p
                  className="text-xs text-black/70 leading-relaxed mb-2.5"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {trail.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-black/60 pt-2 border-t border-black/5">
                  <span className="flex items-center gap-1">
                    <Footprints size={14} weight="bold" />
                    {trail.distanceKm} km &middot; {trail.stops} verified stops
                  </span>

                  {isCurrent && (
                    <span
                      className="flex items-center gap-1 text-[11px] font-bold"
                      style={{ color: 'var(--color-hanko)' }}
                    >
                      <Check size={14} weight="bold" />
                      Active Window
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
