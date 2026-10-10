-- ============================================================
-- THEY WERE HERE — Schema Migration
-- Run this in the Supabase SQL editor (task H1)
-- ============================================================

-- Enable PostGIS
create extension if not exists postgis with schema extensions;

-- Custom types
create type public.note_rarity as enum ('common', 'rare', 'legendary');
create type public.note_status as enum ('live', 'hidden');

-- App configuration (single source of truth for game rules)
create table public.app_config (
  key text primary key,
  value jsonb not null
);

insert into public.app_config (key, value) values
  ('notes_enabled', 'true'::jsonb),
  ('publish_delay_minutes', '10'::jsonb),
  ('max_notes_per_day', '5'::jsonb),
  ('unlock_radius_m', '60'::jsonb),
  ('max_accuracy_m', '50'::jsonb),
  ('common_spacing_m', '150'::jsonb),
  ('rare_spacing_m', '5000'::jsonb),
  ('legendary_spacing_m', '20000'::jsonb);

-- User profiles (server-generated handles)
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

-- Player state (private, overwritten, no policies)
create table public.player_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_lat double precision,
  last_lng double precision,
  last_fix_at timestamptz,
  suspicious boolean not null default false
);

-- Notes (public metadata, no body here)
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

-- Note private data (body and author, separate for security)
create table public.note_private (
  note_id uuid primary key references public.notes (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 180)
);

-- Unlocks (one per user per note)
create table public.unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  note_id uuid not null references public.notes (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  vote smallint check (vote in (-1, 1)),
  reported boolean not null default false,
  primary key (user_id, note_id)
);

-- Blocked terms for server-side moderation
create table public.blocked_terms (
  term text primary key
);

-- Trails (curated note chains sized by hours)
create table public.trails (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  blurb text,
  hours integer not null default 2,
  is_seed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.trail_notes (
  trail_id uuid not null references public.trails (id) on delete cascade,
  note_id uuid not null references public.notes (id) on delete cascade,
  position smallint not null,
  primary key (trail_id, note_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.app_config enable row level security;
alter table public.profiles enable row level security;
alter table public.player_state enable row level security;
alter table public.notes enable row level security;
alter table public.note_private enable row level security;
alter table public.unlocks enable row level security;
alter table public.blocked_terms enable row level security;
alter table public.trails enable row level security;
alter table public.trail_notes enable row level security;

-- App config: readable by authenticated users
create policy app_config_read on public.app_config
  for select to authenticated using (true);

-- Profiles: users can only read their own
create policy profiles_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));

-- Notes: only live, visible notes
create policy notes_live on public.notes
  for select to authenticated
  using (status = 'live' and visible_at <= now());

-- Notes: authors can see their own regardless of status
create policy notes_own on public.notes
  for select to authenticated
  using (exists (
    select 1 from public.note_private p
    where p.note_id = notes.id and p.author_id = (select auth.uid())
  ));

-- Note private: authors can read their own
create policy note_private_author on public.note_private
  for select to authenticated
  using (author_id = (select auth.uid()));

-- Unlocks: users can read their own
create policy unlocks_own on public.unlocks
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Blocked terms: readable for moderation
create policy blocked_terms_read on public.blocked_terms
  for select to authenticated using (true);

-- Trails: readable by authenticated
create policy trails_read on public.trails
  for select to authenticated using (true);

create policy trail_notes_read on public.trail_notes
  for select to authenticated using (true);

-- No insert, update or delete policies: all writes go through RPCs
-- player_state has no policies at all

-- ============================================================
-- Leaderboard view
-- ============================================================

create view public.leaderboard as
  select p.id, p.handle, p.avatar, p.xp, p.unlock_count, p.worth_received
  from public.profiles p
  join public.player_state s on s.user_id = p.id
  where not s.suspicious;

grant select on public.leaderboard to authenticated;
revoke all on public.leaderboard from anon;
