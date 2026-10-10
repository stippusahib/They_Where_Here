import * as SunCalc from 'suncalc';

export type ThemeMode = 'auto' | 'day' | 'night';
export type ActiveTheme = 'day' | 'night';

const STORAGE_KEY = 'twh_theme_mode';

export function getStoredThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'auto';
  const val = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return val === 'day' || val === 'night' || val === 'auto' ? val : 'auto';
}

export function setStoredThemeMode(mode: ThemeMode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function resolveActiveTheme(
  mode: ThemeMode,
  lat?: number,
  lng?: number
): ActiveTheme {
  if (mode === 'day') return 'day';
  if (mode === 'night') return 'night';

  // Auto mode: evaluate sun altitude via SunCalc
  const now = new Date();
  const centerLat = lat ?? 12.9716; // Default to Bangalore venue coordinates
  const centerLng = lng ?? 77.5946;
  const sunPos = SunCalc.getPosition(now, centerLat, centerLng);

  // altitude > 0 means sun is above the horizon (daylight)
  return sunPos.altitude > 0 ? 'day' : 'night';
}

export function applyTheme(theme: ActiveTheme) {
  if (typeof document === 'undefined') return;
  if (theme === 'day') {
    document.documentElement.setAttribute('data-theme', 'day');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
