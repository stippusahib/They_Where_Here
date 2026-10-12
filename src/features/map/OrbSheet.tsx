/* ============================================================
 * THEY WERE HERE — Orb Inspection Sheet (Light Theme & Voice)
 * Peek/modal sheet shown when tapping an orb on the map.
 * Server authoritative: NEVER displays note body before unlock!
 * ============================================================ */

import { X, LockKey, Sparkle, Flag, Footprints, SpeakerHigh, CheckCircle } from '@phosphor-icons/react';
import { RarityTag } from '@/ui/components/RarityTag';
import { useAppStore } from '@/state/store';
import { POKEMON_GO_TOUCH_RADIUS_METERS } from '@/contracts/types';
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

  const isWithinReach = distanceMeters <= POKEMON_GO_TOUCH_RADIUS_METERS || isSimulated;
  const totalVotes = note.worth_yes + note.worth_no;
  const worthPercent =
    totalVotes >= 5
      ? Math.round((note.worth_yes / totalVotes) * 100)
      : null;


  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm safe-bottom animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-5 flex flex-col gap-4 text-left relative"
        style={{
          borderRadius: 'var(--radius-panel)',
          border: '1.5px solid var(--paper-edge)',
          background: '#FFFFFF',
          boxShadow: '0 -10px 40px rgba(15, 18, 48, 0.12), 0 10px 30px rgba(0, 0, 0, 0.08)',
          color: 'var(--ink-900)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <RarityTag rarity={note.rarity} />
              {note.unlocked && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: '#EDFDF6', color: '#1B825D', border: '1px solid #A7F3D0' }}
                >
                  Already Opened
                </span>
              )}
              {note.is_seed && (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--ink-500)',
                    background: 'var(--paper)',
                    border: '1px solid var(--paper-edge)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  demo data
                </span>
              )}
              {note.audio_url && (
                <span
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#5EE2B522', color: '#1B825D' }}
                >
                  <SpeakerHigh size={11} weight="bold" /> Voice Note
                </span>
              )}
            </div>
            <h3
              className="mt-1"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                color: 'var(--ink-900)',
              }}
            >
              {note.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--ink-500)] hover:text-[var(--ink-900)] cursor-pointer"
            aria-label="Close sheet"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Lock Status / Distance Guidance */}
        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{
            background: note.unlocked
              ? 'rgba(94, 226, 181, 0.16)'
              : isWithinReach
              ? 'rgba(94, 226, 181, 0.12)'
              : 'var(--paper)',
            border: `1.5px solid ${note.unlocked || isWithinReach ? 'var(--mint)' : 'var(--paper-edge)'}`,
          }}
        >
          {note.unlocked ? (
            <CheckCircle size={24} weight="fill" color="var(--mint)" />
          ) : isWithinReach ? (
            <Sparkle size={24} weight="fill" color="var(--mint)" />
          ) : (
            <LockKey size={24} weight="bold" color="var(--warn)" />
          )}

          <div className="flex-1">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xs)',
                color: note.unlocked || isWithinReach ? '#167D59' : 'var(--ink-900)',
              }}
            >
              {note.unlocked
                ? 'FOUND & UNLOCKED · IN YOUR PASSPORT'
                : isWithinReach
                ? 'YOU ARE HERE! SEAL READY TO BREAK'
                : `${formatDistance(distanceMeters)} AWAY`}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--ink-500)',
              }}
            >
              {note.unlocked
                ? 'You already discovered this note. Re-read the traveller advice anytime.'
                : isWithinReach
                ? 'Standing within 60 meters unlocks verified traveller advice.'
                : 'Walk closer to this physical location to break the seal and read.'}
            </p>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: '#FAF8F4', border: '1px solid #EADECA' }}
          >
            <span
              className="block font-display"
              style={{ fontSize: 'var(--text-base)', color: 'var(--ink-900)' }}
            >
              {note.unlock_count}
            </span>
            <span
              style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--ink-500)' }}
            >
              Travellers visited
            </span>
          </div>

          <div
            className="p-2.5 rounded-xl"
            style={{ background: '#FAF8F4', border: '1px solid #EADECA' }}
          >
            <span
              className="block font-display"
              style={{
                fontSize: 'var(--text-base)',
                color: worthPercent && worthPercent > 80 ? '#1B825D' : 'var(--ink-900)',
              }}
            >
              {worthPercent !== null ? `${worthPercent}%` : 'New'}
            </span>
            <span
              style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--ink-500)' }}
            >
              Worth the trip
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-1 flex flex-col gap-2">
          {note.unlocked ? (
            <button
              onClick={() => onOpenNote(note)}
              className="slant-btn slant-btn--primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              style={{
                fontSize: 'var(--text-base)',
                minHeight: 48,
                background: '#1B825D',
              }}
            >
              <CheckCircle size={18} weight="fill" />
              <span>Read Opened Note</span>
            </button>
          ) : isWithinReach ? (
            <button
              onClick={() => onOpenNote(note)}
              className="slant-btn slant-btn--primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg animate-pulse"
              style={{
                fontSize: 'var(--text-base)',
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
                background: '#F0EBE1',
                color: 'var(--ink-300)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xs)',
                cursor: 'not-allowed',
                minHeight: 48,
                border: '1px solid #EADECA',
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
                color: 'var(--ink-400)',
              }}
            >
              Posted by @{note.author_handle}
            </span>
            <button
              className="text-[var(--ink-400)] hover:text-red-600 flex items-center gap-1 text-xs"
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
