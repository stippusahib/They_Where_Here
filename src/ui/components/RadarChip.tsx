/* ============================================================
 * THEY WERE HERE — Radar Chip Component
 * Bottom HUD chip displaying nearest sealed note, distance,
 * cardinal direction, and arrival indicator.
 * ============================================================ */

import React from 'react';
import { NavigationArrow } from '@phosphor-icons/react';
import type { ExtendedNote } from '@/lib/seedNotes';
import { formatDistance } from '@/lib/geo';

export type ProximityState = 'far' | 'near' | 'close' | 'here' | 'unsure';

export interface RadarChipProps {
  distance?: number | null;
  direction?: string;
  state?: ProximityState;
  // Backwards compatibility props
  distanceMeters?: number | null;
  cardinalDir?: string;
  nearestNote?: ExtendedNote | null;
  onClick?: () => void;
}

export const RadarChip: React.FC<RadarChipProps> = ({
  distance,
  direction,
  state,
  distanceMeters,
  cardinalDir,
  nearestNote,
  onClick,
}) => {
  // Resolve distance & direction from either API
  const dist = distance ?? distanceMeters ?? (nearestNote ? 120 : null);
  const dir = direction ?? cardinalDir ?? 'NE';

  // Determine state if not provided
  let currentState: ProximityState = state ?? 'far';
  if (!state) {
    if (dist === null) {
      currentState = 'unsure';
    } else if (dist <= 60) {
      currentState = 'here';
    } else if (dist <= 150) {
      currentState = 'close';
    } else if (dist <= 400) {
      currentState = 'near';
    } else {
      currentState = 'far';
    }
  }

  const label =
    currentState === 'unsure'
      ? 'GPS fuzzy — step outside'
      : currentState === 'here'
      ? "You're here"
      : `${formatDistance(dist ?? 0)} · ${dir}`;

  const arrowColor =
    currentState === 'here'
      ? 'var(--mint)'
      : currentState === 'close'
      ? 'var(--warn)'
      : 'var(--rare)';

  return (
    <div
      className={`radar-chip radar-chip--${currentState}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <NavigationArrow size={14} weight="fill" color={arrowColor} />
      <span>{label}</span>
    </div>
  );
};
