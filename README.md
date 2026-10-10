# They Were Here

> Travel advice you can only read by standing where it was written.

Built at LAYOVER 2026 by TinkerHub. Travel connection: the app is built for travellers with dead time, seeded in Calicut, designed to work anywhere.

## How It Works

1. **See** sealed orbs glowing on the map
2. **Walk** toward one — the radar guides you
3. **Open** it when you arrive within 60 meters
4. **Read** the verified advice with a cinematic reveal
5. **Collect** stamps in your verified travel Passport
6. **Vote** "Worth the trip?"
7. **Leave** your own note for the next traveller passing through

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, MapLibre GL JS
- **Backend**: Supabase (Postgres + PostGIS + RLS + RPC)
- **Hosting**: Vercel (PWA)
- **Animation**: GSAP (reveal), Motion (UI transitions)

## Security Model

- Sealed note bodies never reach the client before a valid GPS-verified unlock
- All writes go through server-side RPC functions with security definer
- Row Level Security on every table
- Content moderation on both client and server
- Anonymous auth — no PII collected
- Routes never leave the device

## Limitations (honest)

- GPS spoofing is possible on web apps — we gate accuracy, detect teleport jumps, rate limit, and flag suspicious accounts. Native mock-location checks are the roadmap.
- Indoor GPS is unreliable — all venue notes are outdoors.
- Anonymous accounts are lost if browser data is cleared.

## Development

```bash
npm install
cp .env.example .env.local  # Fill in Supabase credentials
npm run dev
```

## License

All rights reserved. Built for LAYOVER 2026 by TinkerHub.
