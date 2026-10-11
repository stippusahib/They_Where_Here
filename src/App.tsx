import { useState, useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { APP_NAME } from '@/contracts/types';
import type { TabId } from '@/contracts/types';
import { MapTab } from '@/features/map/MapTab';
import { PassportTab } from '@/features/passport/PassportTab';
import { RanksTab } from '@/features/ranks/RanksTab';
import { MeTab } from '@/features/me/MeTab';
import { LayoverOnboarding } from '@/features/onboarding/LayoverOnboarding';
import { TabBar } from '@/ui/components/TabBar';
import { Banner } from '@/ui/components/Banner';
import { useAppStore } from '@/state/store';
import { resolveActiveTheme, applyTheme } from '@/ui/theme';
import { Analytics } from '@vercel/analytics/react';
import { fetchLiveNotes, subscribeToLiveNotes } from '@/lib/liveNotes';
import { unlockAudio } from '@/lib/audio';

/**
 * Root application component.
 * Mobile-first containment on desktop, Day/Night suncalc synchronization,
 * Layover onboarding front door (P0), bottom tab navigation.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const isSimulated = useAppStore((s) => s.isSimulated);
  const isOffline = useAppStore((s) => s.isOffline);
  const hasSeenLayoverOnboarding = useAppStore((s) => s.hasSeenLayoverOnboarding);
  const setHasSeenLayoverOnboarding = useAppStore((s) => s.setHasSeenLayoverOnboarding);
  const themeMode = useAppStore((s) => s.themeMode);
  const position = useAppStore((s) => s.position);
  const setActiveTheme = useAppStore((s) => s.setActiveTheme);

  // Prime Web Audio engine on first user touch/click
  useEffect(() => {
    const handleGesture = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  // Sync theme with sun position and mode
  useEffect(() => {
    const active = resolveActiveTheme(themeMode, position?.lat, position?.lng);
    setActiveTheme(active);
    applyTheme(active);
  }, [themeMode, position?.lat, position?.lng]);

  // Real-time note synchronization across all players' devices
  useEffect(() => {
    fetchLiveNotes();
    const unsubscribe = subscribeToLiveNotes();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Router hook={useHashLocation}>
      <div className="desktop-app-wrapper">
        <div className="desktop-phone-frame flex flex-col relative overflow-hidden">
          {/* P0 Front Door: Layover hours question runs before user sees map */}
          {!hasSeenLayoverOnboarding && (
            <LayoverOnboarding
              onComplete={() => setHasSeenLayoverOnboarding(true)}
            />
          )}

          {/* Global banners */}
          {isSimulated && (
            <Banner variant="danger" label="SIMULATED GPS" />
          )}
          {isOffline && (
            <Banner
              variant="warn"
              label="You're offline. Notes you've opened are still in your passport."
            />
          )}

          {/* Tab content */}
          <main className="flex-1 relative overflow-hidden">
            <Switch>
              <Route path="/" component={MapTab} />
              <Route path="/passport" component={PassportTab} />
              <Route path="/album" component={PassportTab} />
              <Route path="/ranks" component={RanksTab} />
              <Route path="/me" component={MeTab} />
              <Route>
                <MapTab />
              </Route>
            </Switch>
          </main>

          {/* Bottom navigation */}
          <TabBar active={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
      <Analytics />
    </Router>
  );
}

void APP_NAME;
