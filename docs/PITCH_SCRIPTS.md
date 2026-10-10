# They Were Here — Layover 2026 Pitch Scripts

Source: Aligned with the Layover rubric review (tinkerhub.org/layover).

---

## 1. Booth Loop (approx. 60 seconds, repeatable for walking judges)

**Context:** Round 1 is science-fair booths where judges circulate. Keep it punchy, interactive, and phone-first.

1. **One-Liner Hook (0-10s):**
   > *"Hi! This is **They Were Here** — travel advice you can only read by standing where it was written."*

2. **Phone Transfer (10-25s):**
   > *"Instead of looking at our laptop, scan this QR code on your phone right now. No app store, no signup, no tracking. You are an anonymous traveller."*

3. **Stage Mode Teleport & Reveal (25-45s):**
   > *"Right now, we're inside the TinkerSpace hall. Let's trigger Stage Mode to teleport to a note left just outside at the gate. Notice the radar ring lock on. When we enter within 60 meters, the seal unlocks — tap 'Open'.*
   > *(Pause for sound and Hanko stamp animation)*
   > *"That note body was encrypted and sealed on the server until GPS verified our location. Only verified visitors can vote 'Worth the trip?'."*

4. **Overnight Wall & Layover Framing (45-60s):**
   > *"This isn't a Calicut guide — it's built for travellers with dead time on any layover. Over 40 notes have already been sealed overnight by other hackathon teams. Somebody left this for you."*

---

## 2. Finalist Presentation (Strict 2:00 Minutes)

**Format:** About 20 finalist teams, 2 minutes each on stage. Rehearsed to the second.

### [0:00 - 0:20] The Hook (Personal & Relatable)
> *"Every traveller has had a layover with three hours to kill, trapped between crowded TripAdvisor hotspots and dead group chats. You want to know what's genuinely worth your time right now, but online reviews are generic, gamed, and written by people sitting on a couch 5,000 miles away."*

### [0:20 - 0:45] The Core Mechanic (Layover Slider & Front Door)
> *"We built **They Were Here**. When you open the app, it asks one question: **'How long is your layover?'**
> Slide to 2 hours, and it calculates your exact walking radius and maps sealed advice left by strangers who stood in those exact spots before you.
> You see the glowing orbs, but you cannot read them yet. There are no containers or hardware like geocaching — the note IS the place."*

### [0:45 - 1:15] The Live Reveal & Security Architecture
> *"Let's walk toward one. At 60 meters, the lock turns green. Watch the reveal.
> *(Trigger reveal)*
> That advice: 'Skip the main stall, Auntie's sulaimani behind the old banyan tree has fresh cardamom.'
> Server-authoritative: the note body was never downloaded to the client until PostGIS cryptographically verified the coordinates. And because you physically visited, your vote 'Worth the trip?' carries cryptographic visit-verification. It rewards usefulness, not volume."*

### [1:15 - 1:40] The Verified Passport & Overnight Wall
> *"Every note you find stamps your offline **Passport** — a personal travel log cached in IndexedDB that works without mobile data.
> Throughout tonight from 6 PM to 6 AM, hackathon teams across TinkerSpace dropped real notes on our **Overnight Wall**. We already have dozens of real traveller notes pinned across Calicut."*

### [1:40 - 2:00] Closing & Boundary Defense
> *"Is GPS spoofing possible on web PWAs? Yes, that's why we enforce accuracy gates, rate caps, and grid snapping. But the magic is human: travel advice earned by walking.
> **They Were Here**. Somebody left this for you. Thank you."*

---

## 3. Q&A Defense Sheet (Mentor & Judge Responses)

### Q: "How is this different from Geocaching?"
> **A:** *"Geocaching requires physical plastic containers and maintenance. We have zero physical hardware. More importantly, we are a **verified-visit review network** — only people who physically unlocked the note can vote 'worth the trip', solving the fake-review problem of TripAdvisor."*

### Q: "What prevents profanity or harassment?"
> **A:** *"Two layers: Client-side Unicode grapheme parser with blocklist and contact rejection (no phone numbers, emails, handles). Server-side Postgres triggers validate content length and reject prohibited patterns before storage. Plus a global database kill switch and instantaneous admin hiding."*

### Q: "What's the business model?"
> **A:** *"Tourism boards and curated transit authorities sponsor verified Layover Trails to distribute crowd density away from overburdened heritage sites to local neighborhood artisans."*
