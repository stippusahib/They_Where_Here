import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('Global App State (Zustand)', () => {
  beforeEach(() => {
    // Reset to defaults
    useAppStore.setState({
      layoverHours: 4,
      isSimulated: false,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      isOffline: false,
      notes: [],
    });
  });

  it('updates layover duration accurately', () => {
    expect(useAppStore.getState().layoverHours).toBe(4);
    useAppStore.getState().setLayoverHours(2);
    expect(useAppStore.getState().layoverHours).toBe(2);

    expect(useAppStore.getState().passportCountry).toBe('India');
    useAppStore.getState().setPassportCountry('United Kingdom');
    expect(useAppStore.getState().passportCountry).toBe('United Kingdom');

    expect(useAppStore.getState().layoverCountry).toBe('United Arab Emirates');
    useAppStore.getState().setLayoverCountry('Qatar');
    expect(useAppStore.getState().layoverCountry).toBe('Qatar');
  });

  it('toggles simulation / Stage Mode correctly', () => {
    expect(useAppStore.getState().isSimulated).toBe(false);
    useAppStore.getState().setSimulated(true);
    expect(useAppStore.getState().isSimulated).toBe(true);
  });

  it('toggles sound, music and haptics preferences', () => {
    expect(useAppStore.getState().soundEnabled).toBe(true);
    useAppStore.getState().toggleSound();
    expect(useAppStore.getState().soundEnabled).toBe(false);

    expect(useAppStore.getState().musicEnabled).toBe(true);
    useAppStore.getState().toggleMusic();
    expect(useAppStore.getState().musicEnabled).toBe(false);

    expect(useAppStore.getState().hapticsEnabled).toBe(true);
    useAppStore.getState().toggleHaptics();
    expect(useAppStore.getState().hapticsEnabled).toBe(false);
  });

  it('handles offline connectivity transition', () => {
    expect(useAppStore.getState().isOffline).toBe(false);
    useAppStore.getState().setOffline(true);
    expect(useAppStore.getState().isOffline).toBe(true);
  });
});
