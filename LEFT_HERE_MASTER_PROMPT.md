# LEFT HERE: MASTER PROMPT FOR GOOGLE ANTIGRAVITY

Working title: **Left Here**. Tagline: **Somebody left this for you.** (Keep the name in one constant, `APP_NAME`, so it can change in one place.)

Event: LAYOVER 2026 by TinkerHub, TinkerSpace Calicut. Starts 10 Oct 6:00 PM, ends 11 Oct 9:30 AM, then demos and judging. Theme: build around travel. Solo or pairs. No fixed problem statement, no tech limits.

Builder: Alfie, a strong vibe coder. Not a GIS, audio or 3D specialist. Explain every external step in plain words.

How this file is organised:
* Part 0: what Alfie does and when
* Part 1: always on rules (copy into AGENTS.md and GEMINI.md)
* Part 2: kickoff prompt (paste into Agent Manager)
* Parts 3 to 17: the full spec the agent reads (product, loophole register, stack, data, map, UI/UX, reveal, sound, 3D, assets, human tasks, build plan, QA, pitch)

---

## PART 0: WHAT ALFIE DOES (READ FIRST)

Before 6 PM (allowed prep only):
* Install Antigravity, sign in, and install its Chrome extension for the browser agent when prompted.
* Create accounts: GitHub, Supabase, Vercel, Google Stitch, Gemini.
* Ask the organisers if prebuilt design assets are allowed. If unsure, do ALL design and image work after 6 PM. Do not write product code before the start.

At 6 PM:
1. Create an empty GitHub repo. Put this file in the root as `LEFT_HERE_MASTER_PROMPT.md`.
2. Copy Part 1 into `AGENTS.md` and into `GEMINI.md` at the repo root (same text in both).
3. In Antigravity use File > Open Folder and select the project folder itself, not a parent folder.
4. Open Agent Manager. Paste Part 2 as the first message.
5. Whenever the agent posts a block titled `NEEDS FROM ALFIE`, do those tasks. They are also listed in Part 13.
6. Commit at least every 30 minutes. Keep a second model selected in case a model quota runs out mid night.

Never paste secrets into chat. Secrets go only in `.env.local` and the Vercel dashboard.

---

## PART 1: ALWAYS ON RULES (copy into AGENTS.md and GEMINI.md)

```
PROJECT: Left Here. Source of truth: LEFT_HERE_MASTER_PROMPT.md. Read the relevant Part before every milestone.

1. Verify before use. Before importing any library, check package.json. If missing, install it explicitly. Run `npm view <pkg> version` and pin exact versions. Never assume an API from memory: read the installed package types or docs.
2. Secrets. Never commit secrets. The client only gets the Supabase URL and publishable (anon) key. The service role key never appears in the repo, the chat, or the client.
3. No fabrication. Never invent coordinates, venue data, user counts, quotes or statistics. Seed notes must have is_seed = true and the UI must label them "demo data". Venue coordinates come from Alfie only.
4. Scope discipline. Build P0 first. P1 only after P0 acceptance passes. P2 only after Gate 3. Do not add features that are not in the spec. If you want to, propose it in one line and wait.
5. Human blocked protocol. If you need something only a human can do, post a block titled NEEDS FROM ALFIE (format in Part 13), then continue with a working placeholder so nothing stalls.
6. Security. Server authoritative. A sealed note body must never reach the client before a valid unlock. RLS on every table. Revoke RPC execute from anon. Test every policy by impersonating a second user.
7. UI. Tokens only (no hardcoded hex in components). No emojis in UI or code; use Phosphor icons or SVG. Use 100dvh, never 100vh. Animate only transform and opacity. Touch targets at least 48px. Respect prefers-reduced-motion. Every screen needs loading, empty and error states.
8. Originality. Do not copy any anime, game or brand UI assets, logos, characters or fonts. Original work only.
9. Parallel agents. Stay inside your assigned directories. Shared types live in src/contracts/types.ts and change only by agreement.
10. Git. Small commits. Each milestone must pass its acceptance test before the next starts. Tag each green milestone `demo-safe-<n>`.
11. Reports. After each milestone report: what works, what is faked, what is risky, what is next. Never claim something works unless you ran it.
12. Honesty. The product contains no AI features and makes no AI claims. AI tools were used to build it, and CREDITS.md says so.
```

---

## PART 2: KICKOFF PROMPT (paste into Agent Manager)

```
You are the lead engineer and art director for "Left Here", a mobile web app (PWA) for a 15 hour overnight hackathon on the theme "build around travel". The goal is to win: strong demo, memorable UI, real social impact framing, honest engineering.

Step 1. Read LEFT_HERE_MASTER_PROMPT.md completely. Do not skim.
Step 2. Produce an Implementation Plan artifact covering milestones M0 to M7 from Part 14, with the acceptance test of each. List your assumptions at the top. Do not ask clarifying questions unless you are truly blocked.
Step 3. In the same plan, list every item from Part 13 that needs a human and the exact moment you will need it.
Step 4. Wait for my approval of the plan. After approval, execute M0, then continue milestone by milestone without waiting, stopping only for a NEEDS FROM ALFIE block or a failed acceptance test you cannot fix.

Hard constraints: Part 1 rules, the loophole register in Part 4, and the cut list in Part 3.5. The reveal moment (Part 9) is the one place we spend boldness. Everything else stays calm, fast and reliable. If time runs short, cut P1 and P2 features, never P0 reliability.

Image first workflow for UI: reference images (from Stitch or image generation) come first, you analyze them and write docs/DESIGN_ANALYSIS.md with extracted tokens, then you implement in React. Never paste exported HTML from a design tool into the app untouched.
```

---

## PART 3: PRODUCT SPEC

### 3.1 Thesis and pitch frame

They Were Here is travel advice you can only read by standing where it was written. Travellers drop short anonymous notes pinned to real places. Others see a sealed note on the map, but to read it they must physically walk there. Opening a note triggers a cinematic reveal. Finding notes builds a verified travel passport and a rank. Travellers who leave notes people call "worth the trip" climb the author board.

Problem: tourists crowd the same hotspots, local knowledge stays invisible, and travel stories die in group chats.
Solution: a living map of place locked human notes that pulls people toward hidden, local, worth it places.
Impact: spreads visitors beyond overcrowded spots, gives locals and travellers a voice, turns any trip (road, train, boat, flight) into a hunt.

Difference from geocaching and treasure hunt apps (say this in the pitch before a judge says it):
* Verified-visit review: No containers or hardware. A note unlocks only by visiting, and only people who unlocked it can vote "worth the trip".
* Anonymous short notes with a reputation system ("worth the trip" votes) that rewards usefulness, not volume.
* Tiered rarity with territory style spacing: Legendary notes are 20 km apart and claimed, not spammed.
* Built for moving travellers with dead time on a layover.

### 3.2 Core loop

See a sealed orb on the map, walk toward it, arrive within 60 m, tap Open, watch the reveal, read the note, vote "Worth the trip?", leave your own note, climb the ranks.

### 3.3 Rules (single source: `src/config/rules.ts`, mirrored in the DB table `app_config`)

* Unlock radius: 60 m. Required GPS accuracy: 50 m or better. The radius is never widened to compensate for bad accuracy.
* Note body: 1 to 120 graphemes on the client (use `Intl.Segmenter`), server hard cap 180 code points. No links, emails, phone numbers or @handles.
* Tiers (server enforced):
  * Common: no other note within 150 m.
  * Rare: no Rare or Legendary within 5 km.
  * Legendary: no Legendary within 20 km, and at most one Legendary per user per 24 hours.
* Creation cap: 5 notes per user per 24 hours (demo mode raises it to 50 through `app_config`).
* Spacing and radius are config keys, not constants: `common_spacing_m` (150), `rare_spacing_m` (5000), `legendary_spacing_m` (20000), `unlock_radius_m` (60), `max_accuracy_m` (50). **Event Mode** for the hackathon venue sets `common_spacing_m` 50, `unlock_radius_m` 40, `max_accuracy_m` 35 so several notes can live around one building. Without this, the 150 m rule would block the venue hunt and the Overnight Wall.
* Publish delay: 10 minutes by default (demo: 0 through `app_config`). Note positions are snapped to a roughly 22 m grid.
* Orbs visible at map zoom 13.5 and above. Below that, show a soft heat glow only.
* Identity: server generated random handle plus a pick of avatar stickers. No free text names (prevents slurs and impersonation). Up to 3 handle rerolls.
* XP: Common 10, Rare 30, Legendary 100. First finder of a note gets +20. Authors get +5 XP per "Worth it" vote received.
* Boards: Hunters (unlock count) and Authors ("Worth it" votes received). Own notes never count. Suspicious accounts are excluded.

### 3.4 Priorities

P0 (must work on stage, build first):
* Anonymous auth and server generated profile
* Custom styled map, live location dot with accuracy ring
* Seeded orbs, orb bottom sheet showing only public metadata
* Proximity states (far, near, close, here, unsure)
* Unlock RPC, reveal (simple version first), worth vote
* Album (collected notes, cached offline)
* Create note with moderation, tier availability and seal animation
* Leaderboard, Simulated GPS mode (Stage Mode), List mode (accessible alternative to the map)
* PWA install, synth placeholder sounds

P1 (the wow, only after P0 acceptance):
* Full reveal choreography per rarity, real SFX and BGM, haptics
* Fog of war (device local), time of day sky tint
* Onboarding with handle slot machine
* Realtime orb pop when a new note is sealed
* 3D paper plane mascot on splash and reveal (procedural, lazy loaded)
* Legendary slot claim UX ("Legendary slot open here")
* Share card image for a found note
* **Layover Mode** (3.6), **Trails** (3.6), **Overnight Wall counter** (3.6)

P2 (stretch, only after Gate 3):
* Mode locks (Sky notes while flying, Sea notes on a boat, Rail notes) with soft speed band checks
* Time locks (sunset only, monsoon only)
* Reply chain ("pass it on")
* Region completion badges, Malayalam and Hindi UI strings

### 3.5 Cut list (do not build)

Chat or DMs, follows, photos or images inside notes (moderation risk), user uploaded avatars, email or password login, payments, native app wrappers, any AI feature, any "AI moderation" claim, background location tracking, push notifications.

### 3.6 Winning moves (these decide the judging, build them in this order inside P1)

1. **Layover Mode (theme fit, cheap).** The event theme is LAYOVER, so the product must say it out loud: "Every layover is dead time. Left Here turns it into a hunt." A slider "I have 1 to 8 hours" computes a reach radius: `reachKm = (hours * 4.5) / 2 / 1.3` (walk there and back at 4.5 km/h with a 30 percent detour allowance). The map draws a reach circle and List mode shows only notes inside it, sorted by rarity then distance. Label it an estimate: no transit, no timing guarantee.
2. **Trails (impact and business model, cheap).** A Trail is a curated chain of notes with a progress bar and a "TRAIL CLEARED" reveal variant plus badge. Tables: `trails(id, title, blurb, is_seed)` and `trail_notes(trail_id, note_id, position)`, readable by authenticated users; progress is computed on the client from the caller's own unlocks. Seed two trails: "TinkerSpace Layover Trail" (the 6 venue notes) and "Calicut Trail" (about 8 notes curated by local people). Pitch line: locals, shops and tourism boards could sponsor Trails. That is roadmap, never claimed as built.
3. **Overnight Wall (real social proof, free).** From about 12:30 AM, ask other participants to leave notes inside and around the venue (poster or sticker with a QR to the live URL: "Leave a note for the judges"). The map home shows a counter "Notes left here overnight: N", counting real notes within 300 m of the venue (a count query, never a hardcoded number). By judging time the app has real users, real content and a live network effect. Moderate hourly and keep the kill switch ready.
4. **Pitch story (Part 16).** Open with a one sentence personal travel story, not a feature list.

---

## PART 4: LOOPHOLE REGISTER (every item must be fixed and tested)

Security and privacy
1. Sealed body readable through the API. Fix: bodies live in `note_private` with no select policy for others. Only the `unlock_note` RPC (security definer) returns a body. Test: a second user selecting from `note_private` gets zero rows.
2. Author identity leak. Fix: `author_id` exists only in `note_private`. The public `notes` table has no author column, so realtime payloads are clean.
3. Posting leaks a live location. Fix: publish delay (10 min), 22 m grid snap, demo override through `app_config`.
4. Server stores a movement trail. Fix: never. Only the last fix is kept in `player_state` (private, overwritten, no policies). Fog of war memory stays on the device.
5. GPS spoofing. Fix: accuracy gate, teleport guard (jump over 3 km at over 350 km/h flags the account), unlock rate limit (10 per 10 min), flagged accounts excluded from boards. Honest limitation: a web app cannot detect mock location apps. Say this in the pitch and name native checks as the roadmap.
6. Leaderboard farming and self voting. Fix: own notes cannot be unlocked or voted, one vote per user per note (primary key), votes from flagged accounts ignored, "Worth it" ratio only shown after 5 votes.
7. Offensive or dangerous notes on stage. Fix: client and server moderation (Part 6.5), report button (3 reports hides a note), global kill switch `app_config.notes_enabled`, and a prepared SQL snippet to hide any note instantly.
8. Notes that send people into danger. Fix: refuse placement within 20 m of railway lines, motorways and trunk roads using `map.queryRenderedFeatures` on the style layers. A permanent safety sheet says "Never go anywhere unsafe for a note." No notes on tracks.
9. Anonymous account lost when storage clears. Fix: Me tab warns plainly. P2 idea: link an email later. Do not promise recovery.

Location and device reality
10. Bad indoor GPS. Fix: show the accuracy ring, require 50 m or better, and say "GPS is fuzzy. Step outside and wait a few seconds." Never widen the unlock radius.
11. Screen sleeps while hunting. Fix: Screen Wake Lock on the map tab with a graceful fallback.
12. Background tabs stop GPS. Fix: no background promises. Onboarding says "Keep the app open while hunting." Resume cleanly on visibility change.
13. Compass is unreliable and iOS needs a permission tap. Fix: guidance is distance plus a cardinal direction ("480 m north east"). An optional arrow only if heading permission is granted.
14. Battery drain. Fix: stop `watchPosition` when hidden, throttle fog redraws, drop effects automatically if FPS falls below 40.
15. Android back button exits the app. Fix: sheets and tabs push history entries so Back closes the sheet.
16. iOS has no web vibration and may mute sound with the silent switch. Fix: every haptic is paired with a sound and a visual. Audio unlocks on the first tap. Show a "Sound on" chip if audio is suspended.

Network and demo reliability
17. Venue Wi-Fi dies. Fix: PWA caching for tiles and app shell, tile warmup at the venue, phone hotspot as backup, Stage Mode simulated GPS, and a backup screen recording.
18. Free tile server has no SLA. Fix: host our own `public/map-style.json` (derived from the OpenFreeMap Liberty style). Fallback chain on style error: unmodified OpenFreeMap Liberty, then MapLibre demo tiles. Keep OpenStreetMap attribution visible at all times (license requirement).
19. Service worker serves a stale build on demo day. Fix: `registerType: autoUpdate`, a visible build id in the Me tab, final deploy before 7:30 AM, a fresh install test on every demo phone.
20. Cold start, empty map. Fix: seed 40 to 100 clearly labelled demo notes across Kerala plus 6 around the venue. First finder bonus keeps real notes exciting.
21. Realtime flood or leaks. Fix: realtime only for inserts on `notes`, throttled, and the app also polls on map move and every 45 seconds because delayed notes never fire an event when they become visible.

Content and localisation
22. Malayalam and Hindi text breaks fonts or typing animation. Fix: font stack with Noto Sans Malayalam and Noto Sans Devanagari fallbacks, grapheme safe typing and counting through `Intl.Segmenter`, test samples in all three scripts.
23. Moderation misses Manglish. Fix: blocklist includes English, Manglish and Hindi transliterations, normalisation (lowercase, zero width characters, leetspeak, spacing tricks) on both client and server.

Visual and asset reality
24. AI generated images have no transparent background. Fix: generate on a flat chroma green (#00FF00) background and key it out, or use any background remover. Test every sprite over the light and dark map.
25. Heavy 3D kills phones. Fix: lazy load, procedural geometry first, FPS guard that swaps to the 2D mascot, no remote environment maps (drei Environment presets fetch remote files). Use explicit lights.
26. Reveal is unsafe or inaccessible. Fix: no more than 2 bright flashes per second, a reduced motion variant, a skip control from frame zero.
27. Licensing. Fix: fonts are OFL, sounds are CC0 or royalty free and recorded in CREDITS.md, OSM attribution visible, AI tools disclosed. No copyrighted anime assets.

Pitch and judging
28. "This is just geocaching." Fix: the differentiation block in Part 3.1, stated in the first 20 seconds.
29. Simulated GPS looks like cheating. Fix: a permanent "SIMULATED GPS" banner whenever it is on, and say it out loud on stage.
30. Demo cannot show a real walk. Fix: hide 6 real notes around TinkerSpace (Part 15) so a judge physically walks to one.
31. AI claims you cannot defend. Fix: there are none. The product is deterministic.

---

## PART 5: TECH STACK (pinned choices)

Frontend
* React 19 with TypeScript (strict), Vite latest stable, hash routing through `wouter`
* Tailwind CSS v4 through the `@tailwindcss/vite` plugin (do not put the tailwindcss plugin in PostCSS)
* `motion` (formerly Framer Motion; import from `motion/react`) for UI transitions and layout animation
* `gsap` (now free including all plugins) plus `@gsap/react` for the reveal master timeline only
* Zustand for state
* `maplibre-gl` v5 for the map
* `@phosphor-icons/react` for icons
* `howler` for audio (small separate files, no sprite build step)
* `canvas-confetti` for particles (petal shapes through `shapeFromPath`)
* `suncalc` for local sky tint, `idb-keyval` for device storage
* `vite-plugin-pwa` for install and caching
* Fonts self hosted through `@fontsource` packages: Dela Gothic One, Zen Maru Gothic, Noto Sans Malayalam (malayalam subset), Noto Sans Devanagari (devanagari subset). If a package name is missing, verify with `npm view` and download the font files into `public/fonts`.
* P1 only: `three`, `@react-three/fiber` v9 (React 19), `@react-three/drei`, matched versions, lazy loaded
* Haptics: the `web-haptics` package if it passes a quick check, otherwise a 20 line helper (`navigator.vibrate` on Android; hidden `input type="checkbox" switch` click trick on iOS 17.4 and later; feature detect and degrade silently)

Backend
* Supabase: Postgres, PostGIS, RLS, RPC functions, Realtime, anonymous sign ins. Choose the region closest to Kerala (Mumbai, ap-south-1, if offered).
* Client uses the publishable key (`sb_publishable_...`) or the legacy anon key. Name the env var `VITE_SUPABASE_PUBLISHABLE_KEY`.

Hosting and tooling
* Vercel with an SPA rewrite to `index.html`
* Vitest for pure logic (geo math, rarity eligibility, moderation), Playwright for the unlock smoke test using geolocation override
* Design: Google Stitch (stitch.withgoogle.com) plus Nano Banana image generation inside Antigravity
* Optional 3D files: Hunyuan3D, Meshy or Tripo free tiers (Part 11)

Why not the alternatives
* Next.js: no SSR need, more moving parts overnight.
* Google Maps or Mapbox: keys, billing, quotas, no custom anime styling freedom.
* Firebase: weaker geo queries than PostGIS.
* Native app: too slow to build and install on judges' phones. A PWA opens from a link or QR.

Version protocol: before M0 ends, run `npm view` for every package above, install, then commit a lockfile. Do not upgrade packages after M2.

---

## PART 6: ARCHITECTURE AND DATA

### 6.1 Folder structure

```
/
  AGENTS.md  GEMINI.md  DESIGN.md  LEFT_HERE_MASTER_PROMPT.md  CREDITS.md  README.md
  docs/        PLAN.md  DESIGN_ANALYSIS.md  PITCH.md  DEMO_SCRIPT.md  RUNBOOK.md
  supabase/    migrations/0001_schema.sql  0002_functions.sql   seed/notes.json
  public/      map-style.json  audio/  assets/  fonts/
  src/
    config/    rules.ts  env.ts  venue.ts
    contracts/ types.ts            (shared types, change by agreement only)
    lib/       geo.ts  supabase.ts  moderation.ts  graphemes.ts  sun.ts  haptics.ts
    state/     store.ts
    map/       MapView.tsx  style.ts  layers.ts  FogCanvas.tsx  location.ts  proximity.ts
    features/  onboarding/  notes/  reveal/  album/  ranks/  me/  demo/
    ui/        tokens.css  components/
    audio/     manager.ts  synth.ts  manifest.ts
    three/     PipPlane.tsx   (lazy, P1)
    tests/
```

### 6.2 Schema (reference, the agent must review, adapt and test; comments use block style)

```sql
create extension if not exists postgis with schema extensions;

create type public.note_rarity as enum ('common', 'rare', 'legendary');
create type public.note_status as enum ('live', 'hidden');

create table public.app_config (key text primary key, value jsonb not null);
insert into public.app_config (key, value) values
  ('notes_enabled', 'true'::jsonb),
  ('publish_delay_minutes', '10'::jsonb),
  ('max_notes_per_day', '5'::jsonb),
  ('unlock_radius_m', '60'::jsonb),
  ('max_accuracy_m', '50'::jsonb),
  ('common_spacing_m', '150'::jsonb),
  ('rare_spacing_m', '5000'::jsonb),
  ('legendary_spacing_m', '20000'::jsonb);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null,
  avatar smallint not null default 1,
  xp integer not null default 0,
  unlock_count integer not null default 0,
  worth_received integer not null default 0,
  rerolls_used smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.player_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_lat double precision,
  last_lng double precision,
  last_fix_at timestamptz,
  suspicious boolean not null default false
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  rarity public.note_rarity not null default 'common',
  stamp smallint not null default 1,
  tone smallint not null default 1,
  geom extensions.geography(Point, 4326) not null,
  status public.note_status not null default 'live',
  visible_at timestamptz not null default now(),
  unlock_count integer not null default 0,
  worth_yes integer not null default 0,
  worth_no integer not null default 0,
  report_count integer not null default 0,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);
create index notes_geom_idx on public.notes using gist (geom);

create table public.note_private (
  note_id uuid primary key references public.notes (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 180)
);

create table public.unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  note_id uuid not null references public.notes (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  vote smallint check (vote in (-1, 1)),
  reported boolean not null default false,
  primary key (user_id, note_id)
);

alter table public.app_config enable row level security;
alter table public.profiles enable row level security;
alter table public.player_state enable row level security;
alter table public.notes enable row level security;
alter table public.note_private enable row level security;
alter table public.unlocks enable row level security;

create policy app_config_read on public.app_config for select to authenticated using (true);
create policy profiles_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy notes_live on public.notes for select to authenticated
  using (status = 'live' and visible_at <= now());
create policy notes_own on public.notes for select to authenticated
  using (exists (select 1 from public.note_private p
                 where p.note_id = notes.id and p.author_id = (select auth.uid())));
create policy note_private_author on public.note_private for select to authenticated
  using (author_id = (select auth.uid()));
create policy unlocks_own on public.unlocks for select to authenticated
  using (user_id = (select auth.uid()));
/* No insert, update or delete policies anywhere: all writes go through RPCs. player_state has no policies at all. */

create view public.leaderboard as
  select p.id, p.handle, p.avatar, p.xp, p.unlock_count, p.worth_received
  from public.profiles p
  join public.player_state s on s.user_id = p.id
  where not s.suspicious;
grant select on public.leaderboard to authenticated;
revoke all on public.leaderboard from anon;
```

Notes for the agent on the schema:
* Anonymous sign in users have the `authenticated` role, so these policies apply to them. Enable Anonymous Sign-Ins in the Supabase dashboard (human task H1).
* The `leaderboard` view runs with the view owner's rights by design so it can read `player_state`. Confirm it exposes only the columns listed.
* Revoke default grants on every function from `public` and `anon`, then grant execute to `authenticated` only.
* Enable Realtime on `public.notes` for inserts only.

### 6.3 RPC contracts (all `security definer`, `set search_path = public, extensions`)

* `ensure_profile()`: creates `profiles` and `player_state` rows if missing and generates the handle on the server from two fixed, family friendly word lists (40 adjectives and 40 nouns, written by the agent) plus a 3 digit number. Returns the profile.
* `reroll_handle()`: same generator, allowed 3 times per profile.
* `notes_in_bounds(west, south, east, north)`: security INVOKER so RLS applies. Returns id, lat, lng, rarity, stamp, tone, unlock_count, worth_yes, worth_no, is_seed and `unlocked` (exists in own unlocks). Limit 500, order by rarity descending.
* `tier_availability(lat, lng)`: returns for each tier whether it is allowed here and the nearest conflicting distance, so the UI can say "Legendary slot open here" or "Next Legendary is 11 km away".
* `create_note(lat, lng, accuracy, body, rarity, stamp, tone)`: contract in 6.4.
* `unlock_note(note_id, lat, lng, accuracy)`: full reference below.
* `vote_note(note_id, vote)`: requires an existing unlock, not own note, one vote (primary key), updates counters and the author's `worth_received` and XP, ignores votes from flagged accounts.
* `report_note(note_id)`: requires an unlock, one report per user, hides the note at 3 reports.
* `my_album()`: returns the caller's unlocked notes with bodies, rarity, stamp, tone, unlocked_at (security definer because bodies are private).

`unlock_note` reference implementation (agent must finish, test and harden):

```sql
create or replace function public.unlock_note(
  p_note_id uuid, p_lat double precision, p_lng double precision, p_accuracy double precision)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_note public.notes%rowtype;
  v_here extensions.geography;
  v_dist double precision;
  v_radius double precision := (select (value #>> '{}')::double precision from public.app_config where key = 'unlock_radius_m');
  v_max_acc double precision := (select (value #>> '{}')::double precision from public.app_config where key = 'max_accuracy_m');
  v_state public.player_state%rowtype;
  v_jump_m double precision;
  v_secs double precision;
  v_author uuid;
  v_rows integer;
  v_xp integer := 0;
  v_body text;
begin
  if v_uid is null then raise exception 'auth_required'; end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'bad_position';
  end if;
  if p_accuracy is null or p_accuracy > v_max_acc then raise exception 'low_accuracy'; end if;

  select * into v_note from public.notes
   where id = p_note_id and status = 'live' and visible_at <= now();
  if not found then raise exception 'note_not_found'; end if;

  select author_id into v_author from public.note_private where note_id = p_note_id;
  if v_author is not null and v_author = v_uid then raise exception 'own_note'; end if;

  v_here := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  v_dist := st_distance(v_note.geom, v_here);
  if v_dist > v_radius then raise exception 'too_far'; end if;

  if (select count(*) from public.unlocks
       where user_id = v_uid and unlocked_at > now() - interval '10 minutes') >= 10 then
    raise exception 'rate_limited';
  end if;

  insert into public.player_state (user_id) values (v_uid) on conflict do nothing;
  select * into v_state from public.player_state where user_id = v_uid for update;
  if v_state.last_fix_at is not null and v_state.last_lat is not null then
    v_jump_m := st_distance(v_here,
      st_setsrid(st_makepoint(v_state.last_lng, v_state.last_lat), 4326)::geography);
    v_secs := greatest(extract(epoch from (now() - v_state.last_fix_at)), 1);
    if v_jump_m > 3000 and (v_jump_m / v_secs) * 3.6 > 350 then
      update public.player_state set suspicious = true where user_id = v_uid;
    end if;
  end if;
  update public.player_state
     set last_lat = p_lat, last_lng = p_lng, last_fix_at = now() where user_id = v_uid;

  insert into public.unlocks (user_id, note_id) values (v_uid, p_note_id) on conflict do nothing;
  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    v_xp := case v_note.rarity when 'legendary' then 100 when 'rare' then 30 else 10 end;
    if v_note.unlock_count = 0 then v_xp := v_xp + 20; end if;
    update public.notes set unlock_count = unlock_count + 1 where id = p_note_id;
    update public.profiles set unlock_count = unlock_count + 1, xp = xp + v_xp where id = v_uid;
  end if;

  select body into v_body from public.note_private where note_id = p_note_id;
  return jsonb_build_object('body', v_body, 'rarity', v_note.rarity, 'stamp', v_note.stamp,
                            'tone', v_note.tone, 'newly_unlocked', v_rows = 1, 'xp', v_xp);
end;
$$;

revoke all on function public.unlock_note(uuid, double precision, double precision, double precision) from public, anon;
grant execute on function public.unlock_note(uuid, double precision, double precision, double precision) to authenticated;
```

Error codes the client maps to friendly copy (Part 8.6): `auth_required`, `bad_position`, `low_accuracy`, `note_not_found`, `own_note`, `too_far`, `rate_limited`, `notes_disabled`, `body_rejected`, `tier_blocked`, `daily_cap`, `unsafe_spot`.

### 6.4 `create_note` contract

1. Require auth. Reject if `app_config.notes_enabled` is false (`notes_disabled`).
2. Require accuracy 50 m or better. Snap position with `st_snaptogrid` (0.0002 degrees, about 22 m), then cast to geography.
3. Normalise the body (trim, collapse whitespace). Enforce 1 to 180 code points. Run `public.body_allowed(text)`. Reject with `body_rejected` and never echo the offending text.
4. Enforce the daily cap using the author's notes in the last 24 hours (join with `note_private`).
5. Enforce spacing using the config keys `common_spacing_m`, `rare_spacing_m`, `legendary_spacing_m` (defaults 150, 5000, 20000): Common needs no note of any rarity within the common spacing. Rare needs no Rare or Legendary within the rare spacing. Legendary needs no Legendary within the legendary spacing and none created by this user in 24 hours. Violations return `tier_blocked` with the nearest conflicting distance in the error detail.
6. Insert the note with `visible_at = now() + publish_delay`, then insert `note_private`. Return the id and `visible_at`.
7. The unsafe spot check (near rail or motorway) runs on the client against rendered style features. Also add a server side radius check against a small `no_note_zones` table that Alfie can seed from the venue if needed.

### 6.5 Moderation (client and server, same rules)

* `body_allowed(text)` rejects: URLs (`http`, `www`, common TLDs), emails, `@handles`, any run of 8 or more digits (phone numbers), and any term in a `blocked_terms` table.
* Normalise before matching: lowercase, strip zero width characters, map common leetspeak (0,1,3,4,5,7,@,$), remove separators between letters, collapse repeated letters.
* The blocklist (written by the agent) covers English, Manglish and Hindi transliterations: slurs, sexual terms, threats, self harm bait, scam bait. Keep it in one JSON file shared by client and the SQL seed.
* Rejection copy: "That note can't be posted. Keep it kind, and skip links and numbers." Never show which word triggered it.
* Admin snippet in `docs/RUNBOOK.md`: `update public.notes set status = 'hidden' where id = '<id>';` and the kill switch `update public.app_config set value = 'false'::jsonb where key = 'notes_enabled';`.

---

## PART 7: MAP AND GEO ENGINE

### 7.1 Map setup
* MapLibre GL JS v5, style from `/map-style.json`. At dev time fetch the OpenFreeMap Liberty style JSON (`https://tiles.openfreemap.org/styles/liberty`), save it into `public/map-style.json`, then recolor it with our tokens: land warm cream, parks soft green, water light cyan, roads white with a soft outline, buildings pale sand, labels deep indigo with a white halo. Remove POI clutter. Keep station and airport labels. Keep source, glyph and sprite URLs reachable.
* Fallback chain on a style `error` event: the unmodified OpenFreeMap Liberty URL, then `https://demotiles.maplibre.org/style.json`. Show a small "Basic map" chip when on a fallback.
* Attribution stays visible (compact control). Never hide it.
* Default center: Kozhikode (11.2588, 75.7804), zoom 12. When Alfie provides venue coordinates (task H7) put them in `src/config/venue.ts` and center there. Never guess venue coordinates.
* Rotation disabled, north up. Pitch 0. Recenter button; any manual pan stops follow mode.
* Render notes as a GeoJSON source with: a heatmap layer below zoom 13.5, and symbol layers (orb images registered through `map.addImage`, drawn once from canvas) from zoom 13.5. Unlocked notes use an "opened" variant. One DOM marker only for the user, plus a CSS pulse overlay on the single nearest sealed note within 400 m (cheap, no per orb DOM).
* Accuracy ring: a circle polygon built from the accuracy in meters.
* Fetch notes with `notes_in_bounds` on `moveend` (debounced 400 ms), on app resume, and every 45 seconds. Realtime inserts are a bonus (P1).

### 7.2 Location engine (`src/map/location.ts`)
Three providers behind one interface: `RealGPS`, `SimulatedGPS`, `Replay` (P2, optional).
* RealGPS: `watchPosition({ enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 })`. Stop when the page is hidden, resume on visible. Light exponential smoothing only when accuracy is 30 m or better. Never smooth away the accuracy value.
* SimulatedGPS ("Stage Mode"): tap the map to teleport, a "Walk to nearest note" button that moves at 1.4 m/s, and a joystick. A permanent red banner "SIMULATED GPS" shows while active. Enabled only through a hidden gesture (5 taps on the logo) and the env flag `VITE_ALLOW_SIM=true`. The server cannot tell simulated from real; this is the known spoofing limitation, so say it honestly.
* Permission priming screen before the browser prompt. If denied: explain in plain words and offer List mode and Stage Mode.
* Screen Wake Lock on the map tab. Release on hidden, re-request on visible.

### 7.3 Proximity state machine (`src/map/proximity.ts`, pure and unit tested)
Targets the nearest sealed (not yet unlocked, not own) note within 2 km.
* FAR: over 600 m. Text: "Sealed note, 1.4 km north east".
* NEAR: 150 to 600 m. Orb pulse starts, soft ping.
* CLOSE: 60 to 150 m. "Almost there." Ping speeds up.
* HERE: enter at (unlock radius minus 5 m) or less AND accuracy within `max_accuracy_m`; leave only past (unlock radius plus 15 m). Hysteresis stops flicker. All thresholds derive from `app_config`, so Event Mode just works. The other bands (600 and 150 m) stay fixed. Shows the Open note button, plays the arrival chime.
* UNSURE: accuracy worse than 50 m. Copy: "GPS is fuzzy. Step outside and wait a few seconds."
Direction text uses 8 cardinal points. Ping interval and pitch scale with distance (Part 10).

### 7.4 Fog of war (P1, device local)
* A canvas overlay above the map, below the UI, `pointer-events: none`. On each map `render` event (throttled with requestAnimationFrame): fill with dusk mist at 0.5 opacity, then punch soft holes with radial gradients (`destination-out`) at explored points projected with `map.project`.
* Explored points: sampled when the user has moved 40 m, radius 120 m, cap 5000, stored with `idb-keyval`. They never leave the device and are never sent to the server.
* Fog dims the base map only. Orbs and the user dot always render above it, so the map stays usable.
* Clear fog button in the Me tab.

### 7.5 Time of day sky (P1)
* `suncalc` gives the sun altitude for the user's position. Map altitude to four themes: night, dawn, day, golden hour.
* Implement as a gradient overlay div above the map with `mix-blend-mode: soft-light`, below the UI. Do not edit map paint properties at runtime.
* Hidden Time Travel control in the Me tab (night, dawn, day, golden) for the live demo.

### 7.6 Offline and PWA
* `vite-plugin-pwa`: `registerType: 'autoUpdate'`, manifest (name, short_name, `display: standalone`, `orientation: portrait`, theme and background colors, 192 and 512 icons plus a maskable icon).
* Runtime caching: tiles from `tiles.openfreemap.org` with CacheFirst (max 2500 entries, 7 days), fonts StaleWhileRevalidate. App shell precached.
* Opened notes are saved to IndexedDB at unlock time so the Album works offline.
* Offline banner: "You're offline. Notes you've opened are still in your album." Disable create and unlock with a clear reason.
* Show the build id (git hash injected at build time) in the Me tab.

### 7.7 Safe placement check
Before the Seal step, call `map.queryRenderedFeatures` in a 20 m box around the point against rail, motorway and trunk road layers. If any hit: block with "That spot isn't safe to stop at. Pick somewhere you'd happily stand."

---

## PART 8: UI/UX DESIGN SYSTEM

### 8.1 Art direction: "Dusk Postcard"
A cinematic anime sky behind a calm map, bold slanted graphic cuts for headings and badges, and die cut stickers for notes. Playful, warm, readable outdoors in bright sun. One memorable moment: the reveal (Part 9). Everything else stays quiet and disciplined. Do not mix a third style in.

Principles: spend boldness in one place, structure carries meaning (rarity is shown by color, border and glow, never by decoration alone), motion always answers a user action or marks an arrival, copy is plain and active.

### 8.2 Tokens (`src/ui/tokens.css`, CSS variables; components never hardcode hex)
Core
* `--ink-900: #0F1230`  `--ink-700: #1E2352`  `--ink-500: #3B4A8C`
* `--paper: #FFF3D6`  `--paper-edge: #F2DDB0`
* `--white: #FFFFFF`  `--line: #14143A`
Rarity and state
* `--common: #FFF3D6`  `--rare: #35B6FF`  `--legendary: #FFC93C`
* `--hanko: #E8264C` (primary action, slam accents)  `--mint: #5EE2B5` (success)  `--warn: #FF9E3D`
Sky themes (used by the overlay and splash)
* Night: `#0F1230` to `#26307A` to `#5B6FD6`
* Dawn: `#FFD6A5` to `#FF9E7A` to `#F2557A`
* Day: `#A7DEFF` to `#D8F1FF` to `#FFF7EA`
* Golden: `#FFE08A` to `#FF9E7A` to `#E9507B`
Surfaces
* Glass panel: `rgba(18, 20, 58, 0.60)`, backdrop blur 14px, 1px border `rgba(255,255,255,0.18)`, radius 20px. Text on glass is white and must pass 4.5:1 contrast over bright map areas (verify with screenshots).
* Sticker: paper fill, 3px `--line` outline, 4px white die cut border outside it, soft shadow tinted to the sky, slight random tilt between -3 and 3 degrees.
Shape language
* Slanted slabs: `clip-path` or `skewX(-10deg)` with the content counter skewed. Used for the primary button, rarity tags and headings.
* Halftone dot texture at 6 percent on skies, applied to a fixed, `pointer-events: none` pseudo element only (never on scrolling containers).
* Radii: 20 for panels, 999 for chips, sticker corners 14 with a folded corner cut.
Elevation: three levels only (map, glass, sticker/modal).

### 8.3 Typography
* Display: Dela Gothic One for "NOTE FOUND", numbers, tab titles. Tight leading.
* UI and body: Zen Maru Gothic 500 and 700. Note body text on stickers: Zen Maru Gothic 700.
* Fallback stack: `'Zen Maru Gothic', 'Noto Sans Malayalam', 'Noto Sans Devanagari', system-ui, sans-serif`. Dela Gothic One has no Malayalam glyphs: never use it for user text.
* Scale: 12, 14, 16, 20, 28, 40, 64. Body never below 16 on the map HUD except legal and attribution text. Line length under 60 characters on stickers.

### 8.4 Components (build once, reuse)
HudChip, RadarChip (distance and direction), OrbMarkerImage, BottomSheet (drag, snap points, history aware), StickerCard (3 rarities, opened and sealed), SlantButton (primary, secondary, ghost), TabBar (4 tabs, 56 px high, safe area padding), Toast, Skeleton (sky shimmer), EmptyState (mascot plus one action), ErrorState, StampBadge (Phosphor icon in a round sticker), XPBar, RarityTag, Banner (offline, simulated GPS, basic map).
Press feedback on every control: `scale(0.98)` and 1px lift, sound and haptic.

### 8.5 Screens (390 x 844 first, test 360 x 640 and 430 x 932)

1. **Splash and onboarding (P1 polish, P0 minimal).** Full sky gradient, the paper plane crossing once, wordmark, tagline. Then three beats: (a) "Notes are sealed. Walk there to read them." (b) location priming: "Left Here needs your location to unlock notes near you. Your route stays on your phone." (c) handle slot machine (server generated, reroll up to 3 times, 3 avatar stickers to pick from). Primary action: "Start exploring". Skippable after the first launch. The first tap unlocks audio.
2. **Map home (the main screen).** Fullscreen map. Top left: handle chip with level and XP ring. Top right: sound toggle. Bottom: RadarChip (nearest sealed note, distance, direction) above the TabBar. Right edge: Recenter and List mode buttons. Floating primary: "Leave a note" slant button with a paper plane icon, above the TabBar. Orbs appear at zoom 13.5 and up. Tapping an orb opens the sheet.
3. **Orb sheet.** Peek state shows rarity tag, distance, "Found by 14 people", "82 percent say worth the trip" (only after 5 votes). Never shows any text from the note. Full state adds "Walk closer" guidance, a Report entry, and for HERE state the large "Open note" button with pulse.
4. **Reveal and note card.** Part 9. Ends in a sticker card with the body, stamp, rarity, found count, and the vote row "Worth the trip?" with "Worth it" and "Not really".
5. **Leave a note (3 steps, one screen with a stepper).**
   Step 1 Place: shows the live position pin, accuracy chip, safety check result, and tier availability from `tier_availability` ("Common ready", "Rare ready", "Legendary slot open here" or "Next Legendary is 11 km away"). Disabled with a reason when accuracy is poor.
   Step 2 Write: textarea with grapheme counter (120), 12 stamp choices (Phosphor icons in badges), 4 sticker tones, live sticker preview that tilts as you type. Inline rejection message under the field.
   Step 3 Seal: summary, then the "Seal it" slant button. On press: wax seal stamp animation, `stamp_seal` sound, the sticker folds into a paper plane and flies up off screen (`paper_fold` sound). Toast: "Sealed. It appears on the map in 10 minutes." In demo mode: "Sealed. It's on the map now."
6. **Album.** Sticker book grid (2 columns), sorted newest first, rarity borders, filter by rarity, count header "23 found". Tapping a sticker opens the card (no replayed reveal). Empty state: sleepy mascot, "Nothing here yet. Find your first note."
7. **Ranks.** Tabs "Hunters" and "Authors". Top 3 podium with avatars, then a list, own row pinned at the bottom. Subtle tick animation when ranks change.
8. **Me.** Handle, avatar, level and XP, sound, music, haptics, reduced motion override, clear fog, safety tips, about and credits, build id, hidden Stage Mode and Time Travel. A plain warning: "Your progress lives on this device. Clearing browser data resets it."
9. **List mode (accessibility and demo fallback).** Nearest 20 notes with distance, direction, rarity, no map required. Same state logic as the map.
10. **Safety sheet.** Short bullets, reachable from Me and from the first Leave a note.

### 8.6 States and microcopy (plain, active, no apologies, say how to fix it)
* Loading: sky shimmer skeletons. Never a bare spinner on a screen.
* Empty nearby: "No notes around here yet. Leave the first one."
* GPS denied: "Location is off. Turn it on to unlock notes, or browse the list."
* Too far: "Not close enough yet. Walk closer to the glow."
* Low accuracy: "GPS is fuzzy. Step outside and wait a few seconds."
* Rate limited: "Slow down a little. Try again in a few minutes."
* Own note: "This one is yours. Others will need to find it."
* Rejected body: "That note can't be posted. Keep it kind, and skip links and numbers."
* Tier blocked: "Another note is too close for this tier. Pick Common or move on."
* Daily cap: "You've used today's notes. Come back tomorrow."
* Notes paused (kill switch): "Posting is paused for a moment. Reading still works."
* Offline: "You're offline. Notes you've opened are still in your album."
* Network error on unlock: "Couldn't open it. Your note is still sealed. Try again."
Error mapping table lives in `src/lib/errors.ts` from the codes in Part 6.3.

### 8.7 Accessibility and quality floor
Visible focus ring (3px `--rare`), contrast 4.5:1 for text, 48 px targets, `prefers-reduced-motion` honored, screen reader labels on every control, List mode as the non map path, no content conveyed by color alone (rarity also has an icon and a text tag), safe area insets via `env(safe-area-inset-*)` with `viewport-fit=cover`, `overscroll-behavior: none` on the app shell, `100dvh` layouts.

### 8.8 Design process (image first, from the image to code skills)
1. Generate reference images first (Part 12), one per screen, portrait, large and readable. Do not crop earlier images into new ones. Regenerate a fresh image if a screen is unclear.
2. Deeply analyze them. Write `docs/DESIGN_ANALYSIS.md` with extracted tokens, spacing, components and a list of differences from this Part 8.
3. Where a reference conflicts with Part 8, Part 8 wins unless the reference is clearly better; record the decision.
4. Implement from tokens. Review with screenshots through the browser agent at 390 x 844 and 360 x 640, and fix before moving on.
5. Before M5 ends, critique your own UI: remove one decoration, check contrast, check outdoor readability, check that the reveal is still the single boldest thing.

---

## PART 9: THE REVEAL (the one place we spend boldness)

Target: first text visible in about 1.5 seconds, total under 3 seconds, skippable from frame zero, 60 fps on a midrange Android phone. Built as a single GSAP master timeline (`useGSAP` with cleanup), with the sticker card and UI in React.

Flow
* Before the tap: arrival chime and a gentle orb tremble when HERE.
* T0 (tap Open): ensure audio is unlocked, start the `unlock_note` call immediately and start the animation in parallel. Minimum animation length 900 ms. If the call takes over 1.2 s, hold on the trembling orb loop. Time out at 8 s with the network error state and no state change.
* 0 to 120 ms: hit stop. Slight desaturate, scale 1.02, haptic 15 ms.
* 120 to 380 ms: two diagonal slashes at about 22 degrees (white then rarity color), `clip-path` polygons, `reveal_whoosh`.
* 380 to 520 ms: one radial speed lines pulse (opacity up to 0.7, one pulse only).
* About 420 ms: the sticker card slams in: scale 1.35 to 1 with overshoot, rotation from -6 to -2 degrees, 2 cycle shake of 6 px, `reveal_slam`, haptic pattern [30, 20, 30].
* 520 to 900 ms: heading "NOTE FOUND" drops in letter by letter (Dela Gothic One), rarity tag slides in, particle burst through `canvas-confetti` with petal shapes colored by rarity. Counts: Common 40, Rare 80, Legendary 160.
* 900 to 1400 ms: XP bar fills, counters roll up, "+30 XP" chip pops (and "First finder +20" if applicable), `counter_tick`, level up sub sequence if a threshold is crossed (`level_up`).
* From about 1100 ms: the body types in. Step by grapheme using `Intl.Segmenter` so Malayalam and Hindi never break mid character. Long notes fade in as a block instead.
* About 1500 ms: the vote row slides up.
* Skip: a tap anywhere jumps to the end state immediately (timeline `progress(1)`), sounds fade out.

Rarity variants
* Common: paper white slashes, small burst, `sparkle_common`.
* Rare: sky blue slashes, medium burst, `sparkle_rare`, subtle sky tint shift.
* Legendary: 300 ms slow motion (timeline time scale 0.6), sky shifts to golden, gold ring shockwave, holographic foil shimmer on the sticker (CSS conic gradient mask), `sparkle_legendary` and a soft pad swell.

Safety and quality
* No more than 2 bright flashes per second. The speed line pulse is the only brightness spike.
* Reduced motion variant: 250 ms crossfade plus a 0.96 to 1 scale, no shake, no slashes, no flashes. Sounds and the haptic remain.
* Performance: particles on their own canvas layer, no layout animation inside the timeline, kill all tweens on unmount. If measured FPS drops under 45 during the reveal, halve the particle counts for the next reveals automatically.
* Test: record the reveal on a real Android phone. Fix any dropped frames before M5.

---

## PART 10: SOUND DESIGN

Principles: sound confirms an action or marks an arrival. Never loop noise. Sound is a core part of the "anime feel" but it must degrade safely: the app works with sound off, and sound works on day one through synthesized placeholders.

### 10.1 Audio manager (`src/audio/manager.ts`)
* One singleton. Howler with one small file per sound (no sprite build step). Preload the critical set (`ui_tap`, `arrive_here`, `reveal_whoosh`, `reveal_slam`, `error_soft`), lazy load the rest.
* Unlock on the first user tap (the Start button). If the context stays suspended, show a "Sound on" chip.
* Master volume 0.8, BGM 0.25 (ducks to 0.1 during the reveal), max 6 concurrent sounds, fade out on skip, pause BGM when the page is hidden.
* Respect the Sound and Music toggles (persisted in storage). iOS may mute web audio with the silent switch, so every important sound also has a visual.
* `src/audio/synth.ts`: a Web Audio oscillator or noise based placeholder for EVERY sound id below. A manifest decides: real file present means use it, otherwise synth. The app must never be silent or throw because a file is missing.

### 10.2 Sound list (file names go in `public/audio/`, mp3, SFX mono 96 kbps)
* `ui_tap` (60 ms, soft click). Search: "soft ui click".
* `ui_toggle` (90 ms). Search: "switch toggle ui".
* `ping_far` (400 ms, gentle sonar). Search: "sonar ping soft". Used for NEAR and CLOSE with `playbackRate` 0.9 to 1.4. Interval: NEAR every 3 s, CLOSE every 1.2 s, FAR none.
* `arrive_here` (700 ms, rising magic chime). Search: "magic chime rising short".
* `reveal_whoosh` (400 ms). Search: "fast whoosh swoosh".
* `reveal_slam` (500 ms, impact with bass). Search: "short impact hit bass".
* `sparkle_common` (800 ms), `sparkle_rare` (1200 ms), `sparkle_legendary` (2200 ms, shimmer with a soft choir swell). Search: "sparkle twinkle short", "magic shimmer", "epic reveal choir swell".
* `counter_tick` (40 ms). Search: "small tick click".
* `level_up` (900 ms, short arpeggio). Search: "level up short".
* `stamp_seal` (350 ms, stamp thud). Search: "stamp thud seal".
* `paper_fold` (600 ms, paper flutter and whoosh). Search: "paper fold flutter".
* `error_soft` (300 ms, soft low blip, never harsh). Search: "soft error blip".
* Optional BGM: `bgm_day` and `bgm_night`, 60 to 90 s seamless loops, stereo about 112 kbps, under 1.2 MB each. Search: "calm lofi ambient loop", "night ambient pad loop".

### 10.3 Sourcing and licensing
* Prefer CC0 or royalty free: Kenney (kenney.nl audio packs, CC0), Freesound filtered to CC0 only, Pixabay sound effects (Pixabay content license), Mixkit (Mixkit license). ElevenLabs text to sound effects is an optional extra if Alfie has credits.
* Record every file's source, author and license in `CREDITS.md`. Do not use anything from games or anime.
* If ffmpeg is available, normalise to about minus 16 LUFS with peaks under minus 1 dB; otherwise skip and tune per sound volume in the manifest.

---

## PART 11: 3D (P1, optional, built last)

Rule: 3D is garnish. The app must be complete and beautiful without it.
* Where: the splash (Pip the paper plane flies in) and a short cameo during the Legendary reveal. Nowhere else.
* How: `three` plus `@react-three/fiber` v9, lazy loaded after first paint. Build the paper plane procedurally (4 to 6 triangles for nose, wings and the center fold), `MeshStandardMaterial` with flat shading in paper and coral, a hemisphere light plus one directional light, gentle bob and bank animation. Do NOT use drei `Environment` presets (they fetch remote files). `dpr` capped at 1.5.
* FPS guard: if the average FPS over 2 seconds is under 40, or WebGL fails, swap to the 2D Pip sprite for the rest of the session.
* Optional GLB hero (a lantern for Legendary): only if Alfie supplies one (task H6). Target under 1.5 MB after `gltf-transform optimize` with Draco or meshopt compression, loaded through `useGLTF`.

---

## PART 12: ASSET PIPELINE (Stitch, image generation, post processing)

### 12.1 What is generated, and what is NOT
* Generated images: the mascot Pip (4 poses), splash key art, app icon source.
* Built in code (never images): sealed and opened orbs, stickers, stamps (Phosphor icons in round badges), speed lines, slashes, halftone texture, sky gradients. This keeps assets consistent and removes background removal risk for most of the UI.

### 12.2 Stitch steps (Alfie, task H4)
1. Open stitch.withgoogle.com, create a new mobile project, paste the Master prompt below.
2. Generate the 6 screens below. One try each, one retry at most (the free tier has usage caps).
3. Export `DESIGN.md` plus screen images and HTML into `design/stitch/`. Optional: create a Stitch API key in Stitch settings and add the Stitch MCP server in Antigravity so the agent can read the screens directly. Never paste the key into chat.
4. Stitch output is a REFERENCE. Use it for layout and mood. Part 8 tokens stay authoritative. The map is a MapLibre canvas, so ignore any static map image Stitch draws.

Stitch master prompt:
```
Design a mobile app called Left Here, a location locked sticky note treasure hunt for travellers. Screen size 390 x 844. Style: cinematic anime sky gradients (night indigo, golden hour coral, day sky blue), calm pastel map, frosted dark glass panels, slanted graphic badges, die cut sticker notes with a thick dark outline and white border. Display font Dela Gothic One, body font Zen Maru Gothic. Rarity colors: common cream, rare sky blue, legendary gold. Primary action color hanko red #E8264C. Not a SaaS dashboard. No emojis, use line icons. Bottom tab bar: Map, Album, Ranks, Me.
```
Screen prompts (use the master prompt as context):
1. "Map home: fullscreen pastel map at dusk, glowing sealed orbs, a user dot with accuracy ring, a radar chip 'Sealed note, 480 m north east', a slanted red 'Leave a note' button, handle chip with XP ring top left."
2. "Orb bottom sheet at the HERE state: 'You're here. Open it.' large pulsing Open note button, rare tag, 'Found by 14 people'."
3. "Reveal result for a Rare note: slanted blue slashes, speed lines, a sticker note card slammed in at a slight tilt, heading NOTE FOUND, plus 30 XP chip, vote row Worth the trip."
4. "Leave a note step 2: textarea with 120 character counter, 12 round stamp badges, 4 sticker tones, live sticker preview."
5. "Album: two column grid of die cut stickers with rarity borders, count header."
6. "Ranks: Hunters and Authors tabs, top 3 podium with sticker avatars, own row pinned."

### 12.3 Image generation prompts
The agent should try Nano Banana inside Antigravity first. If it refuses or hits limits, Alfie uses the Gemini app (task H5). One image per asset, generated fresh. Avoid naming artists or franchises in prompts.
1. Pip idle: "Kawaii paper airplane mascot named Pip, anime style, simple face with two small dot eyes and a tiny smile on the nose, cream paper with coral fold lines, thin dark navy outline, soft cel shading, tiny wings acting as arms, full body, centered, three quarter view, solid flat pure green #00FF00 background, no shadow, no text, square, high resolution."
2. Pip excited: "Same character as the reference image, arms up, big happy eyes, small sparkles around, same style, same solid green background."
3. Pip sleepy: "Same character, eyes closed, a tiny floating Z, slightly drooping wings, same style and background."
4. Pip confused: "Same character, tilted, a small question mark above, same style and background."
5. Splash key art: "Vertical 9:19.5 phone wallpaper, cinematic anime style dusk sky, layered clouds, glowing orange to coral to deep blue gradient, soft lens glow, a tiny paper airplane crossing the sky, a faint silhouette of a coastal town far below, no text."
6. App icon source: "Square app icon, a paper airplane folded from a sticky note with a folded corner, bold dark outline, cream and coral, flat vector look, centered with generous safe margin, solid flat color background."

### 12.4 Post processing
* Remove the green background by chroma key (a small `sharp` or Python script) or any background remover (remove.bg, Photoroom, Adobe Express). Check edges for green spill on the light and dark map.
* Convert to WebP (quality 85), max 400 KB each, keep the PNG originals in `design/originals/`.
* Names: `public/assets/pip_idle.webp`, `pip_excited.webp`, `pip_sleepy.webp`, `pip_confused.webp`, `splash_sky.webp`, `icon_source.png`.
* Until real assets exist the app uses SVG placeholders so nothing blocks. Generate PWA icons (192, 512, maskable) from `icon_source.png`.
* If an image comes out square when portrait was requested, ask once more for "vertical 9:16", otherwise accept it as a moodboard.

---

## PART 13: HUMAN TASKS (the agent must ask for these in the exact format below)

Format of every request:
```
NEEDS FROM ALFIE  [task id] [priority: blocker or soon or later] [time: minutes]
What: one sentence
Where: the URL or app
Do exactly: numbered steps
Give back: the value or the file path, and where to put it (never paste secrets in chat)
How I verify: what I will check
Meanwhile: the placeholder I am using so we are not blocked
```

* H1 Supabase (blocker at M0 end, 15 min). Create the project in the Mumbai region if offered. Authentication settings: enable Anonymous Sign-Ins. Copy the project URL and the publishable key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Run the migration files from `supabase/migrations` in the SQL editor in order. Enable Realtime on `public.notes` inserts.
* H2 GitHub and Vercel (blocker at M0, 10 min). Import the repo into Vercel, add the same two env vars, confirm the SPA rewrite (the agent writes `vercel.json`).
* H3 Antigravity browser extension (soon at M1, 5 min). Install the Chrome extension and grant permissions so the browser agent can verify the UI.
* H4 Stitch screens (soon at M1, 25 min). Part 12.2.
* H5 Image generation (soon at M2, 20 min). Part 12.3 and 12.4, only if the agent could not generate them itself.
* H6 3D model (later, optional, 20 min). Generate an image to 3D model from the Pip idle image using a Hunyuan3D, Meshy or Tripo free tier, export GLB, drop at `public/assets/pip.glb`. Free tiers may publish models publicly: use only the mascot, never anything private. Skip if behind schedule.
* H7 Venue coordinates and hunt spots (blocker at M2, 25 min). Stand at the TinkerSpace entrance, long press the spot in Google Maps, copy the latitude and longitude. Then walk and record 6 hunt spots (Part 15.2) with coordinates, plus the text for each note. Never invent coordinates.
* H8 Sounds (later at M4, 30 min). Download the files in Part 10.2 into `public/audio/` with the exact names and log each source and license in `CREDITS.md`. Skip freely: synth placeholders keep the app working.
* H9 Seed content (soon at M2, 40 min). Write 40 real notes in `supabase/seed/notes.json` with fields: lat, lng, rarity, stamp, tone, body, is_seed. About 20 across Calicut and Kerala, 20 around the venue. Make each 40 to 110 characters, specific and useful or emotional, in English, Malayalam or Manglish. Include 3 funny, 3 emotional and 3 practical ones. No private people, no insulting a named business, no phone numbers. The agent writes a loader that outputs plain SQL to paste into the dashboard (the service role key never enters the repo).
* H10 Real phone GPS test (blocker at M2 and M6, 20 min each). Outdoors at the venue, note the accuracy numbers on at least 2 phones (one Android, one iPhone if possible) and report them. The agent then picks Event Mode values.
* H11 Event Mode config (soon at M3, 5 min). Run the SQL the agent supplies to set `common_spacing_m` 50, `unlock_radius_m` 40, `max_accuracy_m` 35. Before the demo also set `publish_delay_minutes` to 0 and raise `max_notes_per_day`. Revert after the event.
* H12 Overnight Wall (soon at M3, 20 min). Make a poster or sticker with a QR code to the live URL ("Leave a note for the judges. Find 6 hidden ones.") and ask other participants from about 12:30 AM. Skim new notes every hour. The kill switch and hide snippet are in `docs/RUNBOOK.md`.
* H13 Demo hardware (blocker at M6, 30 min). Phone mirroring to a laptop or projector (scrcpy for Android, QuickTime or AirPlay for iPhone), a phone hotspot as backup, chargers, and a recorded backup demo video of the whole flow.
* H14 Rules and disclosure (soon at M0, 5 min). Confirm with the organisers that AI coding tools, Stitch, generated images and free assets are allowed, and that design work done after 6 PM is fine. Keep README credits honest.

---

## PART 14: BUILD PLAN (clock times for the 6:00 PM start)

If Alfie works with several agents in Agent Manager, split by directory and never let two agents edit the same file:
* Agent A, backend: `supabase/**`, `src/lib/supabase.ts`, `src/contracts/**`, RPC tests
* Agent B, map and geo: `src/map/**`, `src/config/**`, location providers, proximity
* Agent C, UI, reveal and audio: `src/ui/**`, `src/features/**`, `src/audio/**`
* Agent D, assets and docs: `public/assets/**`, `docs/**`, `CREDITS.md`, README
Solo or sequential is fine; the milestones are the same.

Use Planning mode for M0 to M2 and for anything touching the database. Use Fast mode for small fixes. Set terminal commands to ask for review when destructive. Commit at every green test.

**M0, 18:00 to 18:45: Foundation.** Repo scaffold (Vite, React, TypeScript strict, Tailwind v4), tokens and a style test page, `AGENTS.md`, env wiring, Vercel deploy, `vercel.json`, PWA shell.
Acceptance: the deployed URL opens on a phone over mobile data and shows the token page.

**M1, 18:45 to 20:30: Map and location.** Custom style, fallback chain, user dot and accuracy ring, RealGPS and Stage Mode, permission priming, wake lock, venue config.
Acceptance: a real phone shows the moving dot; Stage Mode teleport works with the red banner; blocking the tile host in DevTools triggers the fallback chip.

**M2, 20:30 to 22:30: Notes and unlock.** Schema, RLS, `ensure_profile`, `notes_in_bounds`, `unlock_note`, seed loader, orbs at zoom 13.5, orb sheet, proximity state machine, a simple (not yet cinematic) reveal.
Acceptance:
* Playwright with geolocation at a seeded note's coordinates unlocks it and returns the body; at plus 100 m it fails with `too_far`.
* A second anonymous user selecting from `note_private` gets zero rows.
* The orb sheet never shows any note text.
* Proximity unit tests pass, including hysteresis.

**M3, 22:30 to 00:30: Create, moderate, rank, ship the Wall.** `create_note`, moderation on both sides, `tier_availability`, safe placement check, simple seal, vote, report, ranks, Event Mode SQL, Layover Mode (3.6). Deploy and print the QR poster.
Acceptance:
* At least 12 offensive or unsafe test strings (English, Manglish, Hindi, a link, a phone number, leetspeak, zero width tricks) are all rejected without echoing the text.
* Tier spacing violations return friendly copy.
* One vote per user per note; own notes cannot be voted or unlocked.
* Flagged accounts are excluded from the boards.

**M4, 00:30 to 02:30: The reveal, audio, album.** Full GSAP reveal with rarity variants and skip, reduced motion variant, grapheme safe typing, audio manager with synth fallback, XP and level up, album stored in IndexedDB.
Acceptance: 60 fps on a real Android phone (screen recording), Malayalam and Hindi samples type correctly, first tap unlocks sound, the album opens in airplane mode.

**Gate 3, 02:30: freeze P0.** Run `docs/DEMO_SCRIPT.md` end to end twice in Stage Mode and once with real GPS outdoors. Write the fix list. Cut anything that fails. P2 is cancelled unless everything is green.

**M5, 02:30 to 04:15: P1 in strict order.** Layover Mode polish, Trails, onboarding and sky tint, real SFX, haptics, Overnight Wall counter, share card, fog of war, realtime orb pop, 3D Pip last. Each feature sits behind a flag. A feature that fails its test is switched off by its flag, never left half broken.

**Sleep, 04:15 to 06:15.** Alfie sleeps at least 2 hours. The agent works only on the sleep safe list: tests, README, RUNBOOK, CREDITS, pitch kit, demo script, backup recording checklist. No refactors, no schema changes, no deploys.

**M6, 06:15 to 07:30: Hardening.** Part 15 chaos tests, venue GPS check (H10), tile warmup at the venue, battery test (30 minutes with the map open), fresh install test, PWA update test. CODE FREEZE at 07:00 for everything except bug fixes. Final production deploy by 07:30.

**M7, 07:30 to 09:30: Demo readiness.** Fresh install on every demo phone, verify the venue notes still open, rehearse the pitch 3 times, charge everything, test the hotspot and the mirroring. No deploys after 08:30.

Cut line if behind (cut in this order): 3D, fog, realtime, BGM, share card, Trails polish, sky tint. Never cut: reveal, Stage Mode, moderation, the venue hunt.

---

## PART 15: QA AND DEMO HARDENING

### 15.1 Chaos tests (all must pass before M7)
* Airplane mode mid session, then back online
* Location denied, then granted later in settings
* Slow network (DevTools throttling to Slow 3G) during unlock
* Android Back button from every sheet and tab
* Device rotation and 360 x 640 small screen
* Kill switch on and off while the app is open
* Clear storage and reload (new user created cleanly)
* Two phones at once: one leaves a note, the other sees it (realtime or the 45 second poll)
* Battery saver mode on
* Malayalam, Hindi and emoji heavy input in the note field
* Reveal spam tap (no double unlock, no duplicate XP)
* Stale build: install an older build, deploy a newer one, confirm autoUpdate

### 15.2 The venue hunt (the real walk demo)
* 6 notes inside 250 m of the venue entrance: 4 Common, 1 Rare, 1 Legendary at the "gate" (note text written by Alfie, a nod to the event ticket).
* Spots must be public, safe, outdoors, at least 50 m apart (Event Mode spacing), never on roads, rail or private property.
* One note just outside the entrance, reachable in under a minute, for the judge walk. Indoor GPS is poor, so do not rely on indoor spots.
* All six form the "TinkerSpace Layover Trail".
* Verify each note opens from 20 m away on two phones during M6.

### 15.3 Stage Mode and backups
* Stage Mode: hidden gesture plus env flag, permanent red banner, say it out loud on stage.
* Backup 1: simulated GPS walk. Backup 2: DevTools Sensors location override on a laptop. Backup 3: the recorded demo video.
* Phone mirroring tested with the actual projector or screen if possible.
* Have the RUNBOOK open: kill switch, hide note SQL, Event Mode SQL, redeploy steps.

### 15.4 Performance and size budgets
* First meaningful paint under 2.5 seconds on a 4G phone; lazy load three, the album and the share card.
* Initial JS (excluding MapLibre and 3D chunks) under about 350 KB gzipped.
* Reveal at 60 fps; map pan never drops below 45 fps with 500 orbs.

---

## PART 16: PITCH KIT (generate during the sleep safe window, polish before 8:30)

Files: `README.md` (what, why, how it works, security model, limitations, credits, Mermaid architecture diagram), `docs/PITCH.md`, `docs/DEMO_SCRIPT.md`, `docs/RUNBOOK.md`, `CREDITS.md`.

### 16.1 The 90 second pitch
* 0:00 Hook: one personal sentence about a place you wish someone had told you about. No feature list.
* 0:10 Problem: tourists crowd the same hotspots, local knowledge stays invisible.
* 0:20 Theme tie in: "Every layover is dead time. Left Here turns it into a hunt." Show Layover Mode with a 3 hour slider.
* 0:30 Product on the phone (mirrored): sealed orbs, the fog and sky, the radar chip.
* 0:45 The judge walk: a judge opens a real hidden note outside the entrance. The reveal lands. (Fallback: Stage Mode, announced.)
* 1:05 Proof: "Notes left in this building overnight: N", real notes from other teams.
* 1:15 Impact and model: Trails curated by locals, sponsorable by shops and tourism boards (roadmap).
* 1:25 Honesty and ask: GPS spoofing is a known limit of web apps, native checks are next; no AI claims, deterministic and secure by design. Close with the tagline: "Somebody left this for you."

### 16.2 Likely judge questions (prepare honest answers in `docs/PITCH.md`)
* "Isn't this geocaching?" No containers or hardware, anonymous short notes, "worth the trip" reputation, Legendary territory spacing, built around layovers.
* "Why would people leave notes?" Reputation, Legendary slots, notes as gifts to strangers; Trails seeded by locals; the Overnight Wall proves people do.
* "What about abuse?" Server and client moderation, report threshold, kill switch, no images, no links, preset stamps, delayed and snapped placement.
* "Can I cheat with fake GPS?" Yes on a web app. We gate accuracy, detect teleport jumps, rate limit, exclude flagged accounts, and the roadmap is native mock location checks.
* "What about privacy?" Routes never leave the device, the server keeps only the last fix, authors are anonymous, positions are snapped and delayed.
* "How is this different from Google Maps reviews?" Reviews are written from a couch about popular places. Notes are locked to presence and reward usefulness.
* "Business model?" Sponsored Trails and anonymised visit insight for tourism boards. Roadmap, not built.
* "Does it scale?" PostGIS spatial indexes, bounded queries (500 rows), RLS, stateless PWA.

---

## PART 17: DEFINITION OF DONE

The build is done when ALL are true:
* The production URL installs as a PWA on two phones and the venue hunt notes open from real GPS.
* The reveal runs at 60 fps with a working skip and a reduced motion variant.
* Sealed bodies are provably unreadable before unlock (tested), and the moderation test set passes.
* Stage Mode, the kill switch, Event Mode SQL and the backup video are ready.
* Layover Mode and at least one Trail work. The Overnight Wall counter shows a real number.
* README, CREDITS, RUNBOOK, DEMO_SCRIPT and PITCH exist and are honest about limitations.
* `demo-safe` git tag exists on the deployed commit, and nothing was deployed after 08:30.
