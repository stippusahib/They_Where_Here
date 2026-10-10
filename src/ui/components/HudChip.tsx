import React from 'react';
import { MapPin } from '@phosphor-icons/react';

export interface HandleChipProps {
  handle: string;
  xp: number;
  level?: number;
}

export const HandleChip: React.FC<HandleChipProps> = ({ handle, xp }) => (
  <div className="hud-chip handle-chip shrink-0">
    <span className="hud-chip-dot" />
    <span className="hud-chip-handle truncate max-w-[80px] sm:max-w-none">@{handle.replace(/^@/, '')}</span>
    <span className="hud-chip-xp hidden sm:inline">{xp} XP</span>
  </div>
);

export const WallChip: React.FC<{ count: number }> = ({ count }) => (
  <div className="hud-chip wall-chip shrink-0">
    <MapPin size={13} weight="fill" color="var(--mint)" />
    <span>Tonight: <strong>{count}</strong></span>
  </div>
);
