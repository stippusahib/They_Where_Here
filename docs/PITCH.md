# They Were Here — Pitch & Demo Kit

> "Travel advice you can only read by standing where it was written."

---

## Demo Scripts

### Booth Loop (~60 seconds, repeatable at science-fair stage)

1. **Say the one-liner out loud:**
   > "Travel advice you can only read by standing where it was written."
2. **Show QR:** The judge scans and opens the app on their own phone.
3. **Stage Mode:** Teleport to a seeded note nearby. Tap to open and experience the cinematic reveal.
4. **Show Overnight Wall Counter:** Real notes left tonight by other teams right around the venue.

*No slides, no feature lists, no business talk.*

---

### Finalist Slot (~2 minutes, if advancing)

- **0:00 — Hook:** "Ever had a three-hour layover in a city you didn't know, staring at your phone, wishing someone had told you about that one quiet tea stall two streets down?"
- **0:15 — Layover Slider:** Show the front-door slider ("I have 3 hours"). Live reach radius updates on the map.
- **0:35 — The Reveal:** Walk to/simulate a note, trigger the 60fps cinematic reveal on the mirrored screen. Note body unlocks only upon verified arrival.
- **1:05 — Overnight Wall Counter:** "Other hackathon teams left these tonight around TinkerSpace."
- **1:30 — Technical Honesty:** "GPS spoofing is a known web-app limit. We enforce server-side proximity checks, accuracy bounds, and rate limits. Native mock-location checks are on the roadmap."
- **1:45 — Close:** "Somebody left this for you."

---

## Judge Q&A Cheat Sheet

### "Is this just Geocaching?"
> "No containers or hardware. A note unlocks only by visiting, and only people who unlocked it can vote worth the trip. It is a verified-visit review."

### "What prevents spam and abuse?"
> "Sealed note bodies are never sent to the client until unlocked via secure PostGIS RPC. Content moderation runs client-side and server-side against an offensive lexicon before publishing. Three reports hide any note instantly."

### "Business model?"
> "Trails could be sponsored by local shops, but that is roadmap."

---

## Scoring Alignment (LAYOVER 2026 Rubric)

| Criteria | Points | How We Deliver |
|---|---|---|
| **What Was Built** | 20 | Complete PWA with MapLibre, PostGIS, RLS, custom audio/haptics, Passport, and Stage Mode |
| **Creativity** | 10 | Location-sealed notes with cinematic reveal instead of generic map pins |
| **Travel Connection** | 10 | Built specifically for travellers with dead time; layover duration filters reach |
| **Execution** | 5 | Server-authoritative security, 60fps animations, offline passport storage |
| **Demo** | 5 | 60-second interactive loop on judge's own phone via Stage Mode |
