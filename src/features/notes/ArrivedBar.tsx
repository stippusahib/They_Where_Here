import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Envelope } from '@phosphor-icons/react';

export interface ArrivedBarProps {
  onOpen: () => void;
  proximityState?: 'far' | 'near' | 'close' | 'here' | 'unsure';
}

export const ArrivedBar: React.FC<ArrivedBarProps> = ({ onOpen, proximityState = 'here' }) => {
  if (proximityState !== 'here') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="arrived-bar"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        <div className="arrived-text">
          <MapPin size={16} weight="fill" color="var(--mint)" />
          <div>
            <p className="arrived-title">You&apos;re here</p>
            <p className="arrived-sub">Tap to open this note</p>
          </div>
        </div>
        <button className="open-btn" onClick={onOpen}>
          <Envelope size={18} weight="fill" />
          OPEN
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
