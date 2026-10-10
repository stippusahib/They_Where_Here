# THEY WERE HERE — Master Project Status & Architecture Context

> **Last Updated**: October 11, 2026  
> **Repository**: `stippusahib/They_Where_Here`  
> **Production Deployment**: [they-where-here.vercel.app](https://they-where-here.vercel.app/)  
> **Current Git Tag**: `demo-safe-ar-lockin-master` (Synced across `main` and `ui-v2`)  
> **Source of Truth**: `LEFT_HERE_MASTER_PROMPT.md` / `AGENTS.md` / `CREDITS.md`  

---

## 1. Executive Summary & Core Premise

**"They Were Here"** is a location-locked travel advice treasure hunt Progressive Web App (PWA) built for the **LAYOVER 2026** hackathon by TinkerHub (TinkerSpace, Calicut / Kozhikode).

- **The Hook**: *"Travel advice you can only read by standing where it was written."*
- **The Core Loop**:
  1. **Discover**: Sealed notes appear on an interactive 2D map as glowing orbs across the city / venue.
  2. **Navigate**: Distance telemetry and compass radar guide travellers toward notes during dead layover time.
  3. **Arrive & Proximity Check**: Once within **40 meters** (Pokémon GO touch disc radius), the note unlocks for inspection.
  4. **AR Mode / 3D Spatial Hunt**: Switch to AR camera view to locate the floating 3D note anchored in physical space.
  5. **Reveal**: Unseal the note with a cinematic wax seal tearing / paper unfold animation (GSAP).
  6. **Collect**: Earn XP and collect official hanko stamps in a personal travel **Passport**.
  7. **Vote & Leave**: Vote "Worth the trip?" and author a new sealed note for the next traveller passing through.
- **Honesty Disclosure**: The product contains **zero AI features** and makes **no AI claims**. It is completely deterministic, cryptographically sound, and server-authoritative.

---

## 2. Complete Technology Stack & Libraries

### Frontend Core
- **React**: `19.3.0` (React 19 hooks and modern concurrent rendering)
- **TypeScript**: `5.8.3` (Strict type checking, zero `any` leaks)
- **Vite**: `8.3.4` (Lightning-fast dev server and Rolldown/Rollup production bundling)
- **Tailwind CSS**: `v4.3.3` via `@tailwindcss/vite` (Zero runtime overhead, CSS custom property theming)

### 3D & Augmented Reality
- **Three.js**: `0.186.1` (`@types/three: 0.186.0`)
  - WebGL high-performance rendering (`powerPreference: 'high-performance'`, `precision: 'highp'`)
  - 1:1 Real-world physical spherical anchoring (Camera at origin `(0,0,0)`, world coordinate projection `R = 4.0m`)
  - Absolute geomagnetic compass synchronization (`deviceorientationabsolute` + `deviceorientation`)
  - Surface/Desk Lock-in mode (`[ LOCK IN ]` with Phosphor Crosshair icon)
  - Reticle lock-on detection with mint green HUD indicator and haptic feedback
  - 60fps HD Camera Stream (`getUserMedia` with 1080p ideal, 60fps ideal, `playsinline` attributes)
  - Aggressive hardware camera track shutdown on exit and unmount (`stopCameraHardware`) to prevent device overheating

### Maps, Geolocation & Astronomy
- **MapLibre GL JS**: `6.13.0` (Vector tile engine with OpenFreeMap and OpenStreetMap basemaps)
- **SunCalc**: `2.1.1` (Calculates exact sun elevation and sunrise/sunset times for real-time sky tinting: dawn, day, golden hour, dusk, night)
- **Custom Geo Engine** (`src/lib/geo.ts`):
  - Haversine distance calculations
  - Forward azimuth bearing calculations
  - 8-point cardinal direction formatting (`N`, `NE`, `E`, etc.)
  - Walking time estimation (~80 meters/minute)

### State Management & Routing
- **Zustand**: `5.0.15` (Global client state: profile, location, notes, layover settings, audio toggles, modals)
- **Wouter**: `3.13.0` (Minimal, lightweight hash-friendly routing)
- **idb-keyval**: `6.3.0` (IndexedDB persistence for offline passport data and cached assets)

### UI, Animations & Audio
- **GSAP**: `3.15.0` + `@gsap/react: 2.1.2` (Cinematic wax seal tearing, envelope unfolding, 3D paper reveals)
- **Motion (Framer Motion)**: `14.1.0` (Smooth tab transitions, bottom sheet springs, modals)
- **Canvas Confetti**: `1.9.4` (Celebration burst when a new note is unlocked or stamped)
- **Phosphor Icons**: `@phosphor-icons/react: 2.1.10` (Strict rule: zero emojis in UI or code; all icons are curated vector SVGs)
- **Howler.js**: `2.2.4` (Haptic audio, proximity radar chimes, wax seal tearing sounds)
- **MediaRecorder Web API** (`src/features/notes/VoiceNoteRecorder.tsx`): 30-second voice note memo recording with audio preview and waveform radar

### Typography & Fonts (All OFL 1.1)
- `@fontsource/dela-gothic-one`: `5.3.0` (Bold Japanese postmark / stamp aesthetic)
- `@fontsource/zen-maru-gothic`: `5.3.0` (Warm, rounded, highly legible postcard body copy)
- `@fontsource/noto-sans-malayalam`: `5.3.0` (Malayalam regional script support for Calicut venue)

### PWA & Hosting
- **Vite PWA Plugin**: `vite-plugin-pwa: 2.0.0` (Workbox offline service worker, installable webapp manifest, standalone display mode, maskable icons)
- **Vercel Analytics**: `@vercel/analytics: 2.0.1`

### Backend & Database (Supabase)
- `@supabase/supabase-js`: `2.117.3`
- **PostgreSQL 15+ with PostGIS Extension**:
  - `notes` table (spatial geography point coordinates, sealed bodies, tone, stamp ID, rarity)
  - `unlocks` table (records valid unlocks per user)
  - `profiles` table (anonymous user profiles, XP, handle, avatar color)
  - `app_config` table (dynamic event configuration)
  - **Stored Procedures (RPC)**:
    - `notes_in_bounds(min_lat, min_lng, max_lat, max_lng)`: Returns note coordinates, stamp, rarity, but **omits note bodies**.
    - `unlock_note(note_id, user_lat, user_lng)`: Validates physical proximity $\le 40$m before decrypting/returning note body.
    - `leave_note(lat, lng, body, stamp, tone, audio_url)`: Content-moderated note creation with anti-spam rate limits.
    - `my_passport()`: Retrieves user's collected unlocked stamps.
    - `vote_worth(note_id, is_worth)`: Upvote/downvote travel recommendation.

---

## 3. UI/UX Design System: "Light Dusk Postcard"

The interface is built around a tactile, warm analog aesthetic inspired by Japanese travel stamps (Hanko) and vintage travel postcards:

- **Color Tokens**:
  - Paper Background: `#FDFBF7` (Warm washi cream)
  - Card & Modal Surface: `#FFFFFF` / `rgba(255, 255, 255, 0.95)` with subtle paper borders (`#EADECA`)
  - Primary Ink: `#14143A` (Deep navy sumi ink)
  - Muted Ink: `#5A5D7A` / `#8B8E9F`
  - Hanko Vermilion: `#D23F5A` (Calibrated $\ge 4.5:1$ WCAG AA contrast ratio with white text for buttons, wax seals, and indicators; dark shadow `#B81E3C`)
  - Mint Green: `#5EE2B5` / `#059669` (Arrived indicator, proximity unlock trigger, target lock)
  - Legendary Gold: `#FFB800` (Rare & legendary travel notes)
  - Mystery Cyan/Violet: `#6E44FF` / `#00F2FE` (Locked mystery shadow notes)
- **Ergonomics & Layout Rules**:
  - Strict **`100dvh`** dynamic viewport compliance (never raw `100vh`) to prevent mobile Safari/Chrome address bar clipping.
  - Minimum touch targets of **48px**.
  - Layering hierarchy (`z-index`): Navigation HUDs (z-30/40), Floating Arrived Bar (z-40), Floating Action Button (z-40), Bottom Sheets (z-50), Modals & Fullscreen Overlays (z-90).
  - Respects `prefers-reduced-motion`.

---

## 4. Key Features & Calibration

### 1. Interactive 2D Map & Proximity Radar
- Custom MapLibre style with OpenFreeMap tiles.
- Pokémon GO calibrated proximity bands:
  - **Radar Perimeter**: 350 meters (~5 minutes walking distance).
  - **Approach Ring**: 80 meters.
  - **Touch Disc / Interaction Radius**: 40 meters (exact physical unlock boundary).
- Dynamic Arrived Dock: When standing within 40m of any note, a persistent arrival banner slides up displaying the note tone, stamp, and one-tap unlock trigger.
- Layover Reach Filter: An interactive slider allowing dead-time travellers to filter notes reachable within their layover window (e.g. 1h = 1.2km, 3h = 3.6km).

### 2. AR 3D View (`ARNoteView.tsx`)
- High-definition 60fps camera feed with hardware acceleration.
- **Physical 1:1 World Space Anchoring**: Note meshes are positioned in true 3D spherical world coordinates relative to the user's geographic azimuth and elevation. The camera remains at origin `(0,0,0)`. When the user pans or rotates their device, the note stays firmly anchored in physical space.
- **Surface / Desk Lock-in (`[ LOCK IN ]` with Phosphor Crosshair icon)**: Allows users indoors or in small rooms to pin the note directly in front of them at desk height to test interactions without walking outside.
- **Reticle Lock-on Indicator**: When pointing the center crosshairs within 13° of the note, the reticle turns into a glowing mint ring with tactile haptic vibration.
- **Strict Center Lock & Raycast Verification**: Tapping the screen or center reticle only triggers note reveal if the 3D note is hit by raycasting or actively locked in the crosshairs. If the user aims away from the note, tapping prompts directional alignment guidance instead of falsely unlocking notes.
- **Overheating Protection**: All camera hardware video tracks are aggressively stopped via `mediaStream.getTracks().forEach(t => t.stop())` on exit or unmount.
- **Mystery Note Shadows**: Notes that have not yet been touched appear as floating dark shadow silhouettes with question marks; tapping them dispels the shadow with sound and particle effects.

### 3. Kill-Switch Demo Config (`ar_and_voice_enabled`)
- Single unified configuration flag in `AppConfig` (`ar_and_voice_enabled: boolean`).
- When toggled off, gracefully disables both AR mode and Voice Note recording across all screens (Header HUD, Note Creation, Settings switch in `MeTab.tsx`), ensuring a rock-solid text+2D demo fallback if device sensors flake.

### 3. Note Creation & Voice Memos (`CreateNoteModal.tsx`, `VoiceNoteRecorder.tsx`)
- Minimum character constraint: **15 characters** (ensures meaningful advice rather than low-effort spam).
- Maximum character limit: 120 graphemes.
- Real-time client-side and server-side text moderation filter (flags vulgarity, phone numbers, email addresses, and suspicious links).
- Audio Voice Note recording (up to 30 seconds) attached directly to the location stamp.
- Rarity tiers: Common, Rare (5km spacing), Legendary (20km spacing).

### 4. Cinematic Unseal & Reveal (`RevealScreen.tsx`)
- Dual-phase GSAP animation:
  - Phase 1: Wax seal crack and paper fold tear with directional physics.
  - Phase 2: Letter unfold revealing the author's advice, stamp illustration, voice note player, and date written.
- Audio integration: Realistic paper tear and wax break sound effects.
- Celebration confetti burst on first-time unlocks.

### 5. Travel Passport (`PassportTab.tsx`)
- Digital stamp booklet recording every verified note discovered.
- Shows timestamp, coordinates, tone, upvote counts, and personal travel milestones.
- Offline-ready via IndexedDB.

### 6. PWA & WebApp Installability
- Service worker generated via Workbox caching app shell, fonts, and assets.
- Complete `manifest.json` configured with `display: standalone`, landscape/portrait support, and icons.
- Add-to-Home-Screen prompt ready for iOS and Android.

---

## 5. Security Architecture (Server-Authoritative)

1. **No Note Body Leakage**:
   The client application never receives the text body of a note from `notes_in_bounds`. The database only sends `id`, `lat`, `lng`, `rarity`, `stamp`, and `tone`. The note body is held securely in PostgreSQL.
2. **Server-Side Distance Validation**:
   The `unlock_note(note_id, user_lat, user_lng)` RPC calculates the PostGIS `ST_DistanceSphere` between the user's reported location and the note's true location. If distance $> 40$ meters, the unlock fails and returns null.
3. **Row Level Security (RLS)**:
   Enabled on all tables (`notes`, `unlocks`, `profiles`, `app_config`). `EXECUTE` permissions on internal database functions are revoked from `anon`.
4. **Zero PII**:
   Anonymous session tokens only. No email, phone numbers, or third-party OAuth trackers required.

---

## 6. Directory Structure & Key Files

```
d:\They Were Here\
├── index.html                       # HTML5 entry with PWA headers and font preloads
├── package.json                     # Pinned dependencies (React 19, Three.js, Vite 8, etc.)
├── vite.config.ts                   # Vite configuration with PWA plugin and manual chunk splitting
├── vercel.json                      # Security headers (Content-Security-Policy, Permissions-Policy)
│
├── src/
│   ├── contracts/
│   │   └── types.ts                 # Master TypeScript contract (single source of truth)
│   ├── config/
│   │   ├── env.ts                   # Safe Supabase URL / anon key env validation
│   │   ├── rules.ts                 # Game rules (unlock_radius_m: 40, character limits)
│   │   └── venue.ts                 # Venue coordinates (Calicut / Kozhikode default center)
│   ├── features/
│   │   ├── ar/
│   │   │   └── ARNoteView.tsx       # 3D AR camera, Three.js spherical engine, surface lock
│   │   ├── map/
│   │   │   └── MapTab.tsx           # MapLibre map, radar rings, arrived dock, leave-note FAB
│   │   ├── notes/
│   │   │   ├── CreateNoteModal.tsx  # Note creation modal with 15 char limit & tone picker
│   │   │   ├── VoiceNoteRecorder.tsx# 30s Web Audio recording and waveform playback
│   │   │   └── NoteInspectorModal.tsx# Unlocked note preview modal
│   │   ├── passport/
│   │   │   └── PassportTab.tsx      # Collected stamps, stats, and unlocked travel notes
│   │   ├── reveal/
│   │   │   └── RevealScreen.tsx     # GSAP wax seal tear and letter unfold animation
│   │   ├── layover/
│   │   │   └── LayoverSheet.tsx     # Dead-time layover radius selector
│   │   ├── onboarding/
│   │   │   └── OnboardingFlow.tsx   # 3-step walkthrough and sensor permission requester
│   │   └── me/
│   │       └── MeTab.tsx            # User profile, hanko avatar, audio toggle, reset demo
│   ├── state/
│   │   └── store.ts                 # Unified Zustand application store
│   ├── lib/
│   │   ├── geo.ts                   # Haversine, bearing, cardinal calculations
│   │   ├── haptics.ts               # Web Vibration API tactile feedback helpers
│   │   ├── moderation.ts            # Client-side word filter and spam protection
│   │   └── seedNotes.ts             # 12 initial Kozhikode venue notes (all marked is_seed: true)
│   └── ui/
│       ├── components/              # Buttons, badges, tabs, header HUD, AppLogo
│       └── theme.ts                 # Theme resolution and CSS variables
│
├── supabase/
│   └── migrations/
│       ├── 0001_schema.sql          # PostGIS tables, RLS policies, spatial indices
│       └── 0002_functions.sql       # RPCs (notes_in_bounds, unlock_note, leave_note, etc.)
└── tests/ (vitest)
    ├── src/lib/geo.test.ts          # 3 unit tests passing
    ├── src/lib/graphemes.test.ts    # 5 unit tests passing
    ├── src/lib/moderation.test.ts   # 4 unit tests passing
    └── src/state/store.test.ts      # 4 unit tests passing
```

---

## 7. Current Status, Verified Working & Recent Changes

### What Works
- [x] Full production build passes cleanly (`tsc -b && vite build`) with zero TypeScript errors.
- [x] All 16 automated Vitest unit tests pass green.
- [x] Interactive 2D map with custom markers, proximity rings, and live distance sorting.
- [x] AR 3D Mode with 60fps HD camera, true 1:1 world coordinate spatial lock, and reticle lock-on feedback.
- [x] AR Surface Lock-in mode (`[ 🎯 LOCK IN ]`) for indoor/desk testing.
- [x] Minimum note length updated to **15 characters** with real-time UI feedback.
- [x] Mobile UI fix: Floating Action Button (FAB) cleanly hides whenever modals or bottom sheets are open, eliminating mobile tap blocking.
- [x] Full voice recording memo engine with 30s cap and waveform visualization.
- [x] GSAP cinematic wax seal tear and unfold animation.
- [x] Complete PWA configuration with service worker precaching.

### What is Faked / Mocked for Demo
- **Seed Notes**: 12 curated notes around Kozhikode (Calicut) are seeded with `is_seed = true` and clearly labeled "demo data" in the UI.
- **Venue Coordinates**: Defaulted to Calicut center (`11.2588, 75.7804`) until Alfie provides physical TinkerSpace venue pins.
- **GPS Simulation Toggle**: A debug stage toggle in the top-right header allows testers to simulate standing directly at the nearest note without physically walking 300m outdoors.

### What is Risky / Technical Debt to Watch
- **Mobile Sensor Permissions**: On iOS Safari 13+, `DeviceOrientationEvent.requestPermission()` requires an explicit user gesture (already wired in onboarding and AR mode trigger, but user must tap allow).
- **Web GPS Accuracy Indoors**: Standard browser geolocation can drift up to 15-30m inside concrete buildings. The app displays real-time `±Xm` accuracy telemetry and supports surface lock-in to mitigate this.

---

## 8. Git Milestones & Sync Instructions

The repository is synced with origin:
- **Active Branch**: `main`
- **Companion Branch**: `ui-v2`
- **Latest Tag**: `demo-safe-ar-lockin-master`
- **Commands to Pull & Run**:
  ```bash
  git clone https://github.com/stippusahib/They_Where_Here.git
  cd They_Where_Here
  npm install
  npm run dev
  ```
