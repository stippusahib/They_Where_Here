import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, SealCheck } from '@phosphor-icons/react';
import { RarityTag } from '@/ui/components/RarityTag';

export interface NoteCardProps {
  body: string;
  rarity: 'common' | 'rare' | 'legendary';
  stamp?: string;
  unlockCount?: number;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  body,
  rarity,
  stamp,
  unlockCount = 1,
}) => {
  const rarityColor = {
    common: 'var(--common)',
    rare: 'var(--rare)',
    legendary: 'var(--legendary)',
  }[rarity];

  const rotation = useMemo(() => (Math.random() * 6 - 3).toFixed(1), []);

  return (
    <motion.div
      className="note-card"
      style={{
        '--card-color': rarityColor,
        '--rotation': `${rotation}deg`,
      } as React.CSSProperties}
      initial={{ scale: 1.5, rotate: 0, opacity: 0 }}
      animate={{ scale: 1, rotate: parseFloat(rotation), opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <div className="note-card-header">
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
      <p className="note-card-body">{body}</p>
      <div className="note-card-footer">
        <Users size={13} weight="bold" /> {unlockCount} found
      </div>
    </motion.div>
  );
};
