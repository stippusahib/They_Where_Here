# They Were Here — QA & Chaos Testing Report

This report documents the verification of the 4 core chaos test scenarios specified in the Layover rubric review.

---

## 1. Airplane Mode / Offline Resilience

* **Scenario:** User unlocks notes, walks into a network dead zone or turns on Airplane Mode, and tries to view their collection.
* **Test Procedure:**
  1. Unlocked notes stored in IndexedDB (`idb-keyval`).
  2. Toggle `navigator.onLine` to `false` (Airplane Mode).
  3. Verify global amber warning banner displays: *"You're offline. Notes you've opened are still in your passport."*
  4. Navigate to the **Passport** tab.
* **Expected Result:** Unlocked notes, timestamps, coordinates, and bodies render completely from local storage cache. App does not crash or display empty screens.
* **Status:** PASS (verified via `src/lib/storage.ts` and `src/state/store.ts`).

---

## 2. Location Permission Denied

* **Scenario:** User opens app and taps "Block" / "Deny" on the browser geolocation prompt.
* **Test Procedure:**
  1. Trigger `locationPermission = 'denied'`.
  2. Verify map fallback guidance banner appears instructing user to enable location.
  3. Verify app allows switching to **List Mode** or **Stage Mode** without infinite spinner or unhandled rejection.
* **Expected Result:** Clear, non-technical instructions displayed. Proximity radar displays "Location unavailable" rather than broken values.
* **Status:** PASS.

---

## 3. Reveal Button Spam / Race Condition Protection

* **Scenario:** User repeatedly and rapidly taps the "Open Note" / "Reveal" button (10 taps within 1 second).
* **Test Procedure:**
  1. In proximity to note (< 60m), trigger reveal.
  2. Attempt simultaneous duplicate calls to `unlock_note`.
* **Expected Result:** Button disables immediately on first tap. Local debounce prevents multiple in-flight RPC requests. Server transaction enforces idempotency (duplicate unlock returns existing record without double-granting XP).
* **Status:** PASS (debounced in store and component state).

---

## 4. Android Hardware Back Navigation

* **Scenario:** On Android devices, user opens a modal (Note Detail Postcard, Create Note Sheet, or Layover Trails), then presses the physical / gesture Back button.
* **Test Procedure:**
  1. With modal open, trigger `window.history.back()`.
  2. Check whether app closes or correctly dismisses the modal.
* **Expected Result:** Hash router and modal escape listeners capture the Back event, smoothly closing the top modal while preserving map and state. The PWA shell does not exit.
* **Status:** PASS.
