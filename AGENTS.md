PROJECT: They Were Here. Source of truth: LEFT_HERE_MASTER_PROMPT.md. Read the relevant Part before every milestone.

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
