# DESIGN ANALYSIS — "Dusk Postcard"
Source of truth: `LEFT_HERE_MASTER_PROMPT.md` (Part 8), `stitch-skill`, and `taste-skill`.

## 1. Visual Atmosphere & Philosophy
* **Atmosphere:** "Dusk Postcard" — cinematic anime sky gradient behind a calm, high-contrast vector radar map.
* **Dial Settings:**
  - `DESIGN_VARIANCE`: 8 (asymmetric slanted cuts, die-cut tilt stickers, staggered reveals)
  - `MOTION_INTENSITY`: 6 (spring physics `stiffness: 100, damping: 20`, continuous radar pulse waves, 3D paper plane bob and bank)
  - `VISUAL_DENSITY`: 4 (clean, airy HUD; high contrast outdoors in bright sunlight)
* **Design Engineering Directives (Anti-Slop Guardrails):**
  - **No generic AI purple/neon glow:** Strictly grounded in `#0F1230` (deep ink night), `#FFF3D6` (warm ivory paper), `#35B6FF` (celestial rare cyan), `#FFC93C` (radiant legendary gold), and `#E8264C` (Hanko seal coral).
  - **No emojis anywhere:** Exclusively Phosphor duotone/bold icons and clean SVG geometry.
  - **No 100vh layout jumping:** Strict enforcement of `100dvh` for all full-viewport sheets and containers.
  - **Tactile feedback:** Active states use `scale(0.98)` / `scale(0.95)` with tactile CSS spring and haptic feedback.

---

## 2. Color Calibration & Palette
All colors are centralized as CSS custom properties in `src/ui/tokens.css`:
* `--ink-900: #0F1230` (Primary deep dark canvas)
* `--ink-700: #1E2352` (Secondary elevation)
* `--ink-500: #3B4A8C` (Borders and subtle dividers)
* `--paper: #FFF3D6` (Warm stationery paper card surface)
* `--paper-edge: #F2DDB0` (Stationery edge border)
* `--hanko: #E8264C` (Primary energetic action slant button, wax stamp)
* `--hanko-dark: #B51233` (Slanted button bottom drop shadow)
* `--rare: #35B6FF` (Celestial sapphire cyan token)
* `--legendary: #FFC93C` (Radiant solar gold token)
* `--mint: #5EE2B5` (Arrival beacon success token)
* `--warn: #FF9E3D` (Low-accuracy caution token)

---

## 3. Typographic Architecture
* **Display / Headings:** `Dela Gothic One` (tight tracking, impactful weight, uppercase "NOTE FOUND", numbers, and stamps).
* **UI & Body:** `Zen Maru Gothic` (500 and 700 weights, gentle rounded anime readability outdoors).
* **Multilingual Fallback:** `'Zen Maru Gothic', 'Noto Sans Malayalam', 'Noto Sans Devanagari', system-ui, sans-serif`.
* **Rules:** `Dela Gothic One` is reserved for English/Latin display elements; user note bodies strictly render via `Zen Maru Gothic` / Malayalam stacks to preserve proper grapheme cluster rendering via `Intl.Segmenter`.

---

## 4. Map & Canvas Visual Engine
* **Vector Map Styling:** OpenFreeMap Liberty styled with Land warm cream, Parks soft green, Water light cyan, Roads white with soft outlines, Buildings pale sand, Labels deep indigo with white halos. Pitch 0, rotation disabled, north up.
* **Radiant Anime Orbs (`src/map/OrbImages.ts`):** High-DPI canvas rendered orbs (96x96 @ 2x pixelRatio):
  - Common: warm paper core with envelope & crimson wax stamp, surrounded by soft golden aura.
  - Rare: electric cyan core with faceted diamond gleam, shockwave ring, and winged glyph.
  - Legendary: incandescent golden solar corona with 4 cardinal star flares and crown emblem.
  - Unlocked: celestial star compass disc with translucent core.
* **User Marker & Radar Beacon:**
  - Radiant `#E8264C` core with white die-cut ring and dark ink border.
  - Continuous animated radar wave ripple (`user-pulse-wave`) radiating outward.
  - Dynamic accuracy halo ring scaling with GPS accuracy in meters.

---

## 5. 3D Procedural Mascot ("Pip" the Paper Plane)
* **Architecture:** Standalone, zero-overhead Three.js buffer geometry canvas (`src/3d/PaperPlaneCanvas.tsx`).
* **Geometry:** 6 procedural triangles representing nose, dihedral wings, and folded keel gusset.
* **Materials:** `MeshStandardMaterial` with flat shading in warm paper (`#FFF3D6`) and coral keel (`#E8264C`).
* **Lighting:** Warm hemisphere light (`0xfff3d6` to `0x0f1230`) plus directional key and rim lights.
* **Animation:** Floating sine-wave bob, banking turn oscillation, and subtle pitch response.
* **Placements (Part 11):**
  1. Splash & Layover Onboarding front door hero.
  2. Cameo during the Legendary reveal sequence.

---

## 6. Proximity States & Interaction Flow
* **FAR (>600m):** Radar chip indicates distance and cardinal direction.
* **NEAR (150m - 600m):** Gentle sonar pulse interval.
* **CLOSE (60m - 150m):** Accelerated radar ping, "Almost there".
* **HERE (<=60m):**
  - Docked `ArrivedBar` springs up with mint glow: "You're here — Tap to open this note".
  - Floating Action Button ("Leave a note") docks above the bar cleanly at `bottom: calc(56px + 84px)` without overlap.
* **REVEAL (Part 9):**
  - Diagonal anime whoosh slashes.
  - "NOTE FOUND" Dela Gothic slam.
  - Die-cut stationery sticker card with grapheme typing animation.
  - "Worth the trip?" voting and confetti burst.
