import { useState } from 'react';
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

/**
 * Root application component.
 * Layover onboarding front door (P0), Hash routing, bottom tab navigation, global banners.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const isSimulated = useAppStore((s) => s.isSimulated);
  const isOffline = useAppStore((s) => s.isOffline);
  const hasSeenLayoverOnboarding = useAppStore((s) => s.hasSeenLayoverOnboarding);
  const setHasSeenLayoverOnboarding = useAppStore((s) => s.setHasSeenLayoverOnboarding);

  return (
    <Router hook={useHashLocation}>
      <div className="flex flex-col h-[100dvh] relative overflow-hidden">
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
    </Router>
  );
}

// Unused but required by the spec — keep the name accessible
void APP_NAME;
