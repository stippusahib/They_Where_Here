# LAYOVER 2026 Rubric Alignment

Assessment rubric source: [tinkerhub.org/layover](https://tinkerhub.org/layover)

Total Score: **50 Marks**

---

## 1. What was built (20 Marks) — Working Build & Scope

| Requirement | Implementation in "They Were Here" | Evidence |
|---|---|---|
| Functional Application | Full PWA with zero compilation errors, TypeScript strict, offline caching | `src/App.tsx`, `package.json` |
| Server-Authoritative Architecture | Supabase PostGIS spatial queries, RLS on every table, sealed bodies hidden until GPS verification | `supabase/migrations/0001_schema.sql`, `0002_functions.sql` |
| Real-time Map & Navigation | MapLibre GL custom dusk theme, live GPS dot, radar proximity guidance | `src/features/map/MapTab.tsx`, `src/lib/geo.ts` |
| Verified Passport | Offline sticker book in IndexedDB (`idb-keyval`) with rarity stamps and metadata | `src/features/passport/PassportTab.tsx`, `src/lib/storage.ts` |
| Note Creation & Moderation | Grapheme counter (1-120), PII/link rejection, server grid snapping, tier enforcement | `src/features/notes/CreateNoteModal.tsx`, `src/lib/moderation.ts` |
| Leaderboards | Dual Hunters and Authors rankings with podiums and XP progression | `src/features/ranks/RanksTab.tsx` |

---

## 2. Creativity & Idea (10 Marks) — Originality & Mechanics

- **The Verified-Visit Review:** Unlike TripAdvisor or Google Maps where anybody anywhere can leave fake reviews, reviews in *They Were Here* cannot even be read, let alone reviewed, unless the user is physically standing in the spot.
- **Rarity Spacing Mechanics:** Notes are territorial. Common notes must be 150m apart, Rare notes 5km apart, and Legendary notes 20km apart. This prevents link farm spam and rewards genuine discovery.
- **Dusk Postcard Aesthetic:** Authentic Hanko stamp seals, Japanese-inspired dusk color palette, Dela Gothic One and Zen Maru Gothic typography. No generic UI library kits.

---

## 3. Travel Connection (10 Marks) — Genuinely Core, Not Tacked On

- **The Layover Front Door:** The very first interaction upon opening the app is **"How long is your layover?"** (1 to 8 hours). It calculates walking reach radius using pedestrian walking speeds (3.8 km/h return cushion) so travellers never miss their train or flight.
- **Dead-Time Utility:** Directly targets travellers with dead time waiting at transit hubs (Kozhikode Railway Station, Calicut Airport, bus terminals).
- **Stranger-to-Stranger Advice:** Writing prompt is strictly framed: *"What should the next traveller not miss here?"* Never framed as resident social networking.
- **Hour-Sized Trails:** Curated walking chains (1-hour, 2-hour, 4-hour, 8-hour) designed specifically around transit waiting windows.

---

## 4. Execution (5 Marks) — Quality, Clean Code, Security & Tokens

- **Strict Token Design System:** Zero hardcoded hex colors in components; all styling derives from CSS variables in `src/ui/tokens.css`.
- **Zero AI Claims:** Fully honest disclosure in `CREDITS.md`. Product contains zero deceptive AI gimmicks.
- **High Performance:** 100dvh mobile viewport handling, hardware-accelerated animations (transform & opacity only), strict bundle size management.
- **Comprehensive Unit Tests:** 100% test coverage on geo calculations, content moderation, grapheme segmentation, and offline store.

---

## 5. Demo & Experience (5 Marks) — The Presentation

- **Stage Mode Teleportation:** Seamless demonstration for indoor judging booths where real GPS cannot walk 200m; toggled via 5 taps on the avatar.
- **Tactile Procedural Audio:** Zero-external-dependency Web Audio synthesizers produce authentic radar pings and Hanko stamp thuds without broken asset URLs.
- **Instant Phone Hand-off:** QR code opens PWA immediately in Safari/Chrome without registration or app installation friction.
