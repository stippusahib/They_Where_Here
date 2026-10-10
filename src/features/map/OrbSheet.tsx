/* ============================================================
 * THEY WERE HERE — Orb Inspection Sheet (P0)
 * Peek/modal sheet shown when tapping an orb on the map.
 * Server authoritative: NEVER displays note body before unlock!
 * ============================================================ */

import { X, LockKey, Sparkle, Flag, Footprints } from '@phosphor-icons/react';
import { RarityTag } from '@/ui/components/RarityTag';
import { useAppStore } from '@/state/store';
import { formatDistance } from '@/lib/geo';
import type { ExtendedNote } from '@/lib/seedNotes';

interface OrbSheetProps {
  note: ExtendedNote | null;
  distanceMeters: number;
  onClose: () => void;
  onOpenNote: (note: ExtendedNote) => void;
}

export function OrbSheet({ note, distanceMeters, onClose, onOpenNote }: OrbSheetProps) {
  const isSimulated = useAppStore((s) => s.isSimulated);

  if (!note) return null;

  const isWithinReach = distanceMeters <= 60 || isSimulated;
  const totalVotes = note.worth_yes + note.worth_no;
  const worthPercent =
    totalVotes >= 5
      ? Math.round((note.worth_yes / totalVotes) * 100)
      : null;

  const rarityColor =
    note.rarity === 'legendary'
      ? 'var(--color-legendary)'
      : note.rarity === 'rare'
      ? 'var(--color-rare)'
      : 'var(--color-common)';

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm safe-bottom animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-sm p-5 flex flex-col gap-4 text-left relative"
        style={{
          borderRadius: 'var(--radius-panel)',
          border: `1.5px solid ${rarityColor}66`,
          background: 'var(--glass-bg)',
          boxShadow: `0 -10px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${rarityColor}33`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <RarityTag rarity={note.rarity} />
              {note.is_seed && (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  demo data
                </span>
              )}
            </div>
            <h3
              className="mt-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-base)',
                color: 'white',
              }}
            >
              {note.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white"
            aria-label="Close sheet"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Lock Status / Distance Guidance */}
        <div
          className="p-3 rounded-xl flex items-center gap-3"
          style={{
            background: isWithinReach
              ? 'rgba(94, 226, 181, 0.12)'
              : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${
              isWithinReach ? 'var(--color-mint)' : 'rgba(255, 255, 255, 0.1)'
            }`,
          }}
        >
          {isWithinReach ? (
            <Sparkle size={24} weight="fill" color="var(--color-mint)" />
          ) : (
            <LockKey size={24} weight="bold" color="var(--color-warn)" />
          )}

          <div className="flex-1">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)',
                color: isWithinReach ? 'var(--color-mint)' : 'white',
              }}
            >
              {isWithinReach
                ? 'YOU ARE HERE! SEAL READY TO BREAK'
                : `${formatDistance(distanceMeters)} AWAY`}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-xs)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {isWithinReach
                ? 'Standing within 60 meters unlocks verified traveller advice.'
                : 'Walk closer to this location to break the seal and read.'}
            </p>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="glass p-2.5 rounded-lg">
            <span
              className="block font-display text-white"
              style={{ fontSize: 'var(--font-size-base)' }}
            >
              {note.unlock_count}
            </span>
            <span
              className="text-white/50"
              style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
            >
              Travellers visited
            </span>
          </div>

          <div className="glass p-2.5 rounded-lg">
            <span
              className="block font-display"
              style={{
                fontSize: 'var(--font-size-base)',
                color: worthPercent && worthPercent > 80 ? 'var(--color-mint)' : 'white',
              }}
            >
              {worthPercent !== null ? `${worthPercent}%` : 'New'}
            </span>
            <span
              className="text-white/50"
              style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
            >
              Worth the trip
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-1 flex flex-col gap-2">
          {isWithinReach ? (
            <button
              onClick={() => onOpenNote(note)}
              className="slant-btn slant-btn--primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg animate-pulse"
              style={{
                fontSize: 'var(--font-size-base)',
                minHeight: 48,
              }}
            >
              <Sparkle size={18} weight="fill" />
              <span>Break Seal & Reveal Note</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xs)',
                cursor: 'not-allowed',
                minHeight: 48,
              }}
            >
              <Footprints size={18} />
              <span>Walk {formatDistance(distanceMeters)} closer</span>
            </button>
          )}

          <div className="flex justify-between items-center px-1 pt-1">
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              Posted by @{note.author_handle}
            </span>
            <button
              className="text-white/40 hover:text-white/70 flex items-center gap-1 text-xs"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => alert('Report submitted for review.')}
            >
              <Flag size={12} />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
