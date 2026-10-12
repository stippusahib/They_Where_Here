/* ============================================================
 * THEY WERE HERE — Real-Time Geolocation Service
 * Automatically monitors device GPS, triggers permission prompts,
 * handles permission changes, and updates global store telemetry.
 * ============================================================ */

import { useAppStore } from '@/state/store';
import type { GeoPosition } from '@/contracts/types';

let watchId: number | null = null;
let permissionStatusObj: PermissionStatus | null = null;

function updateStoreWithPosition(pos: GeolocationPosition): void {
  const store = useAppStore.getState();
  if (!store.isSimulated) {
    const heading =
      typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
        ? pos.coords.heading
        : (store.position?.heading ?? null);
    const newPos: GeoPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading,
      timestamp: pos.timestamp,
    };
    store.setPosition(newPos);
  }
  store.setLocationPermission('granted');
}

/**
 * Requests location permission and attempts an immediate fast GPS fix.
 * Uses high accuracy first with a quick fallback to standard accuracy
 * to prevent mobile GPS timeout freezes.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    console.warn('[LocationService] Geolocation is not supported by this browser.');
    useAppStore.getState().setLocationPermission('denied');
    return false;
  }

  return new Promise((resolve) => {
    // 1. Try quick fix with high accuracy (4s timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateStoreWithPosition(pos);
        resolve(true);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          console.warn('[LocationService] Permission denied by user.');
          useAppStore.getState().setLocationPermission('denied');
          resolve(false);
          return;
        }

        // 2. High-accuracy timed out or unavailable indoors: fallback to fast standard fix (cell/wifi)
        console.warn('[LocationService] High accuracy timed out, falling back to standard accuracy fix.');
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            updateStoreWithPosition(fallbackPos);
            resolve(true);
          },
          (finalErr) => {
            console.warn('[LocationService] Final geolocation attempt failed:', finalErr.code, finalErr.message);
            const store = useAppStore.getState();
            if (finalErr.code === finalErr.PERMISSION_DENIED) {
              store.setLocationPermission('denied');
            } else {
              // If hardware is slow but permission granted, don't block user
              store.setLocationPermission('granted');
            }
            resolve(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 15000,
      }
    );
  });
}

/**
 * Initializes continuous geolocation watching.
 * Automatically keeps store coordinates in sync with real-world device movement.
 */
export function initLocationWatcher(): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    useAppStore.getState().setLocationPermission('denied');
    return () => {};
  }

  // Monitor permission state if Permissions API is supported
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatusObj = status;
        useAppStore.getState().setLocationPermission(status.state);

        // Auto-acquire fix immediately if permission is already granted on device
        if (status.state === 'granted') {
          requestLocationPermission();
        }

        status.onchange = () => {
          useAppStore.getState().setLocationPermission(status.state);
          if (status.state === 'granted') {
            requestLocationPermission();
          }
        };
      })
      .catch((err) => {
        console.warn('[LocationService] Permissions query error:', err);
      });
  }

  // Clear existing watch if any
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  // Start continuous watch with high accuracy
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const store = useAppStore.getState();
      if (!store.isSimulated) {
        const heading =
          typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
            ? pos.coords.heading
            : (store.position?.heading ?? null);
        const newPos: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading,
          timestamp: pos.timestamp,
        };
        store.setPosition(newPos);
      }
      store.setLocationPermission('granted');
    },
    (err) => {
      console.warn('[LocationService] Watch position error:', err.code, err.message);
      const store = useAppStore.getState();
      if (err.code === err.PERMISSION_DENIED) {
        store.setLocationPermission('denied');
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
    }
  );

  return () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (permissionStatusObj) {
      permissionStatusObj.onchange = null;
      permissionStatusObj = null;
    }
  };
}
