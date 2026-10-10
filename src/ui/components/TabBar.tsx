/* ============================================================
 * LEFT HERE — Tab Bar Component
 * Bottom navigation with 4 tabs, 56px high, safe area padding.
 * ============================================================ */

import { useLocation } from 'wouter';
import {
  MapTrifold,
  BookOpen,
  Trophy,
  UserCircle,
} from '@phosphor-icons/react';
import type { TabId } from '@/contracts/types';

interface TabBarProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof MapTrifold; path: string }[] = [
  { id: 'map', label: 'Map', icon: MapTrifold, path: '/' },
  { id: 'passport', label: 'Passport', icon: BookOpen, path: '/passport' },
  { id: 'ranks', label: 'Ranks', icon: Trophy, path: '/ranks' },
  { id: 'me', label: 'Me', icon: UserCircle, path: '/me' },
];

export function TabBar({ active, onTabChange }: TabBarProps) {
  const [, navigate] = useLocation();

  return (
    <nav
      className="glass safe-bottom flex items-center justify-around"
      style={{
        height: 56,
        borderRadius: '20px 20px 0 0',
        borderBottom: 'none',
      }}
      role="tablist"
      aria-label="Main navigation"
    >
      {TABS.map(({ id, label, icon: Icon, path }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            id={`tab-${id}`}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-opacity"
            style={{
              opacity: isActive ? 1 : 0.5,
              minWidth: 48,
              minHeight: 48,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--color-hanko)' : 'white',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-xs)',
            }}
            onClick={() => {
              onTabChange(id);
              navigate(path);
            }}
          >
            <Icon
              size={24}
              weight={isActive ? 'fill' : 'regular'}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
