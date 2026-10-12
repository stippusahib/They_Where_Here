import React from 'react';
import { motion } from 'motion/react';

export interface RevealHeadingProps {
  rarity: 'common' | 'rare' | 'legendary';
  playing: boolean;
  isAlreadyOpened?: boolean;
}

export const RevealHeading: React.FC<RevealHeadingProps> = ({ rarity, playing, isAlreadyOpened }) => {
  const label = isAlreadyOpened
    ? 'ALREADY OPENED'
    : rarity === 'legendary'
    ? 'LEGENDARY FIND'
    : 'NOTE FOUND';

  return (
    <motion.div
      className="reveal-heading-wrap"
      initial={{ y: -40, opacity: 0 }}
      animate={playing ? { y: 0, opacity: 1 } : { y: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26, delay: 0.38 }}
    >
      <h1
        className="reveal-heading"
        data-rarity={isAlreadyOpened ? 'common' : rarity}
        style={isAlreadyOpened ? { color: '#5EE2B5', textShadow: '0 0 16px rgba(94, 226, 181, 0.5)' } : undefined}
      >
        {label}
      </h1>
    </motion.div>
  );
};
