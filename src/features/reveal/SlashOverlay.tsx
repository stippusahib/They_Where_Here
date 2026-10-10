import React from 'react';
import { motion } from 'motion/react';

export interface SlashProps {
  rarity: 'common' | 'rare' | 'legendary';
  playing: boolean;
}

export const SlashOverlay: React.FC<SlashProps> = ({ rarity, playing }) => {
  const color = rarity === 'legendary' ? '#FFC93C' : rarity === 'rare' ? '#35B6FF' : '#FFFFFF';
  return (
    <div className="slash-container" aria-hidden>
      <motion.div
        className="slash slash-1"
        style={{
          background: 'rgba(255,255,255,0.90)',
          clipPath: 'polygon(0 0, 100% 0, 80% 100%, -20% 100%)',
        }}
        initial={{ x: '-110%' }}
        animate={playing ? { x: '120%' } : { x: '-110%' }}
        transition={{ duration: 0.18, ease: [0.4, 0, 1, 1] }}
      />
      <motion.div
        className="slash slash-2"
        style={{
          background: color,
          clipPath: 'polygon(20% 0, 140% 0, 100% 100%, -20% 100%)',
        }}
        initial={{ x: '110%' }}
        animate={playing ? { x: '-120%' } : { x: '110%' }}
        transition={{ duration: 0.22, ease: [0.4, 0, 1, 1], delay: 0.05 }}
      />
    </div>
  );
};
