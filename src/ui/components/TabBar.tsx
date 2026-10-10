/* ============================================================
 * THEY WERE HERE — Tab Bar Component
 * Bottom navigation with 4 tabs, active pill, duotone icons.
 * ============================================================ */

import React from 'react';
import { useLocation } from 'wouter';
import {
  MapTrifold,
  BookBookmark,
  Trophy,
  UserCircle,
} from '@phosphor-icons/react';
import type { TabId } from '@/contracts/types';

interface TabBarProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS = [
  { id: 'map', icon: MapTrifold, label: 'Map', path: '/' },
  { id: 'passport', icon: BookBookmark, label: 'Passport', path: '/passport' },
  { id: 'ranks', icon: Trophy, label: 'Ranks', path: '/ranks' },
  { id: 'me', icon: UserCircle, label: 'Me', path: '/me' },
] as const;

export const TabBar: React.FC<TabBarProps> = ({ active, onTabChange }) => {
  const [, navigate] = useLocation();

  return (
    <nav className="tab-bar" role="tablist" aria-label="Main navigation">
      {TABS.map(({ id, label, icon: Icon, path }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            id={`tab-${id}`}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              onTabChange(id);
              navigate(path);
            }}
          >
            <Icon
              size={22}
              weight={isActive ? 'duotone' : 'regular'}
              color={isActive ? 'var(--hanko)' : 'currentColor'}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
