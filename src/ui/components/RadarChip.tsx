/* ============================================================
 * THEY WERE HERE — Radar Chip Component
 * Bottom HUD chip displaying nearest sealed note, distance,
 * cardinal direction, and arrival indicator.
 * ============================================================ */

import React from 'react';
import { NavigationArrow } from '@phosphor-icons/react';
import type { ExtendedNote } from '@/lib/seedNotes';
import {
  POKEMON_GO_TOUCH_RADIUS_METERS,
  POKEMON_GO_APPROACH_RADIUS_METERS,
  POKEMON_GO_RADAR_RADIUS_METERS,
} from '@/contracts/types';
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

  // Determine state if not provided (Pokemon GO calibrated)
  let currentState: ProximityState = state ?? 'far';
  if (!state) {
    if (dist === null) {
      currentState = 'unsure';
    } else if (dist <= POKEMON_GO_TOUCH_RADIUS_METERS) {
      currentState = 'here';
    } else if (dist <= POKEMON_GO_APPROACH_RADIUS_METERS) {
      currentState = 'close';
    } else if (dist <= POKEMON_GO_RADAR_RADIUS_METERS) {
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
