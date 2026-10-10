/* ============================================================
 * LEFT HERE — Haptics Helper
 * Uses navigator.vibrate on Android.
 * Degrades silently on iOS and unsupported browsers.
 * ============================================================ */

/**
 * Trigger a haptic pattern if supported and enabled.
 * Pattern is an array of [vibrate, pause, vibrate, ...] in ms.
 */
export function triggerHaptic(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently degrade — haptics are never critical
  }
}

/** Quick tap feedback — 15ms */
export function hapticTap(): void {
  triggerHaptic(15);
}

/** Medium impact — used for reveal slam */
export function hapticSlam(): void {
  triggerHaptic([30, 20, 30]);
}

/** Light feedback for toggles */
export function hapticToggle(): void {
  triggerHaptic(10);
}

/** Success burst — used for note seal and reveal */
export function vibrateSuccess(): void {
  triggerHaptic([20, 40, 20, 40, 30]);
}
