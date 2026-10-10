import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, SealCheck } from '@phosphor-icons/react';
import { RarityTag } from '@/ui/components/RarityTag';
import { VoiceNotePlayer } from '@/ui/components/VoiceNotePlayer';

export interface NoteCardProps {
  body: string;
  rarity: 'common' | 'rare' | 'legendary';
  stamp?: string;
  unlockCount?: number;
  audioUrl?: string;
  audioDuration?: number;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  body,
  rarity,
  stamp,
  unlockCount = 1,
  audioUrl,
  audioDuration,
}) => {
  const rarityColor = {
    common: 'var(--common)',
    rare: 'var(--rare)',
    legendary: 'var(--legendary)',
  }[rarity];

  const rotation = useMemo(() => (Math.random() * 4 - 2).toFixed(1), []);

  return (
    <motion.div
      className="note-card flex flex-col gap-3"
      style={{
        '--card-color': rarityColor,
        '--rotation': `${rotation}deg`,
        background: 'var(--paper)',
        border: '3px solid var(--line)',
        outline: '4px solid #FFFFFF',
        boxShadow: '4px 4px 0 var(--line)',
        borderRadius: 'var(--radius-sticker)',
        padding: '16px',
        color: 'var(--ink-900)',
      } as React.CSSProperties}
      initial={{ scale: 1.35, rotate: 0, opacity: 0 }}
      animate={{ scale: 1, rotate: parseFloat(rotation), opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <div className="note-card-header flex items-center justify-between">
        <RarityTag rarity={rarity} />
        {stamp && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-700)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <SealCheck size={14} weight="fill" color="var(--hanko)" />
            {stamp}
          </span>
        )}
      </div>

      <p className="note-card-body text-sm font-bold leading-relaxed">{body}</p>

      {audioUrl && (
        <VoiceNotePlayer
          audioUrl={audioUrl}
          durationSeconds={audioDuration || 6}
          compact
        />
      )}

      <div className="note-card-footer flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--ink-500)' }}>
        <Users size={14} weight="bold" /> {unlockCount} travellers found this
      </div>
    </motion.div>
  );
};
