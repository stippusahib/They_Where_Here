-- ============================================================
-- THEY WERE HERE — RPC Functions Migration
-- Run AFTER 0001_schema.sql in the Supabase SQL editor
-- All functions: security definer, search_path = public, extensions
-- ============================================================

-- ============================================================
-- Word lists for handle generation (40 adjectives + 40 nouns)
-- ============================================================

-- ensure_profile: creates profile + player_state, generates handle
create or replace function public.ensure_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_handle text;
  v_adjectives text[] := ARRAY[
    'swift', 'brave', 'calm', 'clever', 'gentle',
    'happy', 'bright', 'quiet', 'warm', 'bold',
    'kind', 'witty', 'keen', 'merry', 'noble',
    'proud', 'wise', 'fair', 'true', 'free',
    'vivid', 'plucky', 'cozy', 'lucky', 'jolly',
    'lively', 'savvy', 'peppy', 'zippy', 'snappy',
    'dapper', 'spiffy', 'groovy', 'breezy', 'dandy',
    'nifty', 'peachy', 'stellar', 'cosmic', 'golden'
  ];
  v_nouns text[] := ARRAY[
    'fox', 'owl', 'cat', 'bear', 'deer',
    'hare', 'wolf', 'hawk', 'dove', 'swan',
    'panda', 'otter', 'seal', 'whale', 'crane',
    'finch', 'robin', 'wren', 'lark', 'raven',
    'tiger', 'koala', 'llama', 'puma', 'bison',
    'moose', 'eagle', 'heron', 'stork', 'gecko',
    'coral', 'maple', 'cedar', 'fern', 'bloom',
    'river', 'cloud', 'trail', 'dune', 'peak'
  ];
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  select * into v_profile from public.profiles where id = v_uid;
  if found then
    return jsonb_build_object(
      'id', v_profile.id, 'handle', v_profile.handle, 'avatar', v_profile.avatar,
      'xp', v_profile.xp, 'unlock_count', v_profile.unlock_count,
      'worth_received', v_profile.worth_received, 'rerolls_used', v_profile.rerolls_used,
      'created_at', v_profile.created_at
    );
  end if;

  -- Generate handle: adjective + noun + 3-digit number
  v_handle := v_adjectives[1 + floor(random() * 40)::int]
    || v_nouns[1 + floor(random() * 40)::int]
    || lpad(floor(random() * 1000)::text, 3, '0');

  insert into public.profiles (id, handle) values (v_uid, v_handle);
  insert into public.player_state (user_id) values (v_uid);

  select * into v_profile from public.profiles where id = v_uid;
  return jsonb_build_object(
    'id', v_profile.id, 'handle', v_profile.handle, 'avatar', v_profile.avatar,
    'xp', v_profile.xp, 'unlock_count', v_profile.unlock_count,
    'worth_received', v_profile.worth_received, 'rerolls_used', v_profile.rerolls_used,
    'created_at', v_profile.created_at
  );
end;
$$;

revoke all on function public.ensure_profile() from public, anon;
grant execute on function public.ensure_profile() to authenticated;

-- ============================================================
-- reroll_handle: regenerate handle, max 3 times
-- ============================================================

create or replace function public.reroll_handle()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_handle text;
  v_adjectives text[] := ARRAY[
    'swift', 'brave', 'calm', 'clever', 'gentle',
    'happy', 'bright', 'quiet', 'warm', 'bold',
    'kind', 'witty', 'keen', 'merry', 'noble',
    'proud', 'wise', 'fair', 'true', 'free',
    'vivid', 'plucky', 'cozy', 'lucky', 'jolly',
    'lively', 'savvy', 'peppy', 'zippy', 'snappy',
    'dapper', 'spiffy', 'groovy', 'breezy', 'dandy',
    'nifty', 'peachy', 'stellar', 'cosmic', 'golden'
  ];
  v_nouns text[] := ARRAY[
    'fox', 'owl', 'cat', 'bear', 'deer',
    'hare', 'wolf', 'hawk', 'dove', 'swan',
    'panda', 'otter', 'seal', 'whale', 'crane',
    'finch', 'robin', 'wren', 'lark', 'raven',
    'tiger', 'koala', 'llama', 'puma', 'bison',
    'moose', 'eagle', 'heron', 'stork', 'gecko',
    'coral', 'maple', 'cedar', 'fern', 'bloom',
    'river', 'cloud', 'trail', 'dune', 'peak'
  ];
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then raise exception 'auth_required'; end if;
  if v_profile.rerolls_used >= 3 then raise exception 'rate_limited'; end if;

  v_handle := v_adjectives[1 + floor(random() * 40)::int]
    || v_nouns[1 + floor(random() * 40)::int]
    || lpad(floor(random() * 1000)::text, 3, '0');

  update public.profiles
    set handle = v_handle, rerolls_used = rerolls_used + 1
    where id = v_uid;

  select * into v_profile from public.profiles where id = v_uid;
  return jsonb_build_object(
    'id', v_profile.id, 'handle', v_profile.handle, 'avatar', v_profile.avatar,
    'xp', v_profile.xp, 'unlock_count', v_profile.unlock_count,
    'worth_received', v_profile.worth_received, 'rerolls_used', v_profile.rerolls_used,
    'created_at', v_profile.created_at
  );
end;
$$;

revoke all on function public.reroll_handle() from public, anon;
grant execute on function public.reroll_handle() to authenticated;

-- ============================================================
-- notes_in_bounds: fetch visible notes within a map viewport
-- security INVOKER so RLS applies
-- ============================================================

create or replace function public.notes_in_bounds(
  west double precision,
  south double precision,
  east double precision,
  north double precision
)
returns jsonb
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_result
  from (
    select
      n.id,
      st_y(n.geom::geometry) as lat,
      st_x(n.geom::geometry) as lng,
      n.rarity,
      n.stamp,
      n.tone,
      n.unlock_count,
      n.worth_yes,
      n.worth_no,
      n.is_seed,
      exists(select 1 from public.unlocks u where u.user_id = v_uid and u.note_id = n.id) as unlocked
    from public.notes n
    where n.status = 'live'
      and n.visible_at <= now()
      and st_intersects(
        n.geom,
        st_makeenvelope(west, south, east, north, 4326)::geography
      )
    order by n.rarity desc
    limit 500
  ) t;

  return v_result;
end;
$$;

revoke all on function public.notes_in_bounds(double precision, double precision, double precision, double precision) from public, anon;
grant execute on function public.notes_in_bounds(double precision, double precision, double precision, double precision) to authenticated;

-- ============================================================
-- tier_availability: check what tiers are available at a location
-- ============================================================

create or replace function public.tier_availability(
  p_lat double precision,
  p_lng double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_here extensions.geography;
  v_common_spacing double precision;
  v_rare_spacing double precision;
  v_legendary_spacing double precision;
  v_common_nearest double precision;
  v_rare_nearest double precision;
  v_legendary_nearest double precision;
  v_legendary_today int;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  v_here := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;

  v_common_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'common_spacing_m');
  v_rare_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'rare_spacing_m');
  v_legendary_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'legendary_spacing_m');

  -- Nearest note of any rarity
  select min(st_distance(n.geom, v_here)) into v_common_nearest
  from public.notes n where n.status = 'live';

  -- Nearest rare or legendary
  select min(st_distance(n.geom, v_here)) into v_rare_nearest
  from public.notes n where n.status = 'live' and n.rarity in ('rare', 'legendary');

  -- Nearest legendary
  select min(st_distance(n.geom, v_here)) into v_legendary_nearest
  from public.notes n where n.status = 'live' and n.rarity = 'legendary';

  -- User's legendaries in last 24h
  select count(*) into v_legendary_today
  from public.note_private np
  join public.notes n on n.id = np.note_id
  where np.author_id = v_uid
    and n.rarity = 'legendary'
    and n.created_at > now() - interval '24 hours';

  return jsonb_build_object(
    'common', jsonb_build_object(
      'allowed', coalesce(v_common_nearest >= v_common_spacing, true),
      'nearest_m', v_common_nearest
    ),
    'rare', jsonb_build_object(
      'allowed', coalesce(v_rare_nearest >= v_rare_spacing, true),
      'nearest_m', v_rare_nearest
    ),
    'legendary', jsonb_build_object(
      'allowed', coalesce(v_legendary_nearest >= v_legendary_spacing, true) and v_legendary_today = 0,
      'nearest_m', v_legendary_nearest
    )
  );
end;
$$;

revoke all on function public.tier_availability(double precision, double precision) from public, anon;
grant execute on function public.tier_availability(double precision, double precision) to authenticated;

-- ============================================================
-- unlock_note: the core unlock mechanic
-- ============================================================

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

-- ============================================================
-- body_allowed: server-side moderation function
-- ============================================================

create or replace function public.body_allowed(p_text text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_normalised text;
  v_term text;
begin
  -- Check URL patterns
  if p_text ~* 'https?://' then return false; end if;
  if p_text ~* 'www\.' then return false; end if;
  if p_text ~* '\.(com|org|net|in|io)\b' then return false; end if;
  -- Check email
  if p_text ~* '[\w.+-]+@[\w-]+\.[\w.]+' then return false; end if;
  -- Check @handles
  if p_text ~ '@\w+' then return false; end if;
  -- Check phone numbers (8+ digits)
  if p_text ~ '\d{8,}' then return false; end if;

  -- Normalise for blocklist matching
  v_normalised := lower(p_text);
  -- Strip zero-width characters
  v_normalised := regexp_replace(v_normalised, '[\u200B-\u200F\u2028-\u202F\uFEFF]', '', 'g');
  -- Leetspeak
  v_normalised := replace(v_normalised, '0', 'o');
  v_normalised := replace(v_normalised, '1', 'i');
  v_normalised := replace(v_normalised, '3', 'e');
  v_normalised := replace(v_normalised, '4', 'a');
  v_normalised := replace(v_normalised, '5', 's');
  v_normalised := replace(v_normalised, '7', 't');
  v_normalised := replace(v_normalised, '@', 'a');
  v_normalised := replace(v_normalised, '$', 's');
  -- Remove separators
  v_normalised := regexp_replace(v_normalised, '[.\-_*\s]+', '', 'g');

  -- Check blocked terms
  for v_term in select term from public.blocked_terms loop
    if v_normalised like '%' || lower(v_term) || '%' then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- ============================================================
-- create_note: post a new note
-- ============================================================

create or replace function public.create_note(
  p_lat double precision,
  p_lng double precision,
  p_accuracy double precision,
  p_body text,
  p_rarity public.note_rarity,
  p_stamp smallint,
  p_tone smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_enabled boolean;
  v_max_acc double precision;
  v_delay int;
  v_daily_cap int;
  v_today_count int;
  v_body text;
  v_snapped extensions.geography;
  v_note_id uuid;
  v_visible_at timestamptz;
  v_spacing double precision;
  v_nearest double precision;
  v_legendary_today int;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  -- Check kill switch
  v_enabled := (select (value #>> '{}')::boolean from public.app_config where key = 'notes_enabled');
  if not v_enabled then raise exception 'notes_disabled'; end if;

  -- Accuracy check
  v_max_acc := (select (value #>> '{}')::double precision from public.app_config where key = 'max_accuracy_m');
  if p_accuracy is null or p_accuracy > v_max_acc then raise exception 'low_accuracy'; end if;

  -- Position validation
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'bad_position';
  end if;

  -- Normalise body
  v_body := trim(regexp_replace(p_body, '\s+', ' ', 'g'));
  if char_length(v_body) < 1 or char_length(v_body) > 180 then
    raise exception 'body_rejected';
  end if;

  -- Moderation
  if not public.body_allowed(v_body) then
    raise exception 'body_rejected';
  end if;

  -- Daily cap
  v_daily_cap := (select (value #>> '{}')::int from public.app_config where key = 'max_notes_per_day');
  select count(*) into v_today_count
  from public.note_private np
  join public.notes n on n.id = np.note_id
  where np.author_id = v_uid and n.created_at > now() - interval '24 hours';
  if v_today_count >= v_daily_cap then raise exception 'daily_cap'; end if;

  -- Snap to grid (~22m)
  v_snapped := st_setsrid(st_snaptogrid(st_makepoint(p_lng, p_lat), 0.0002), 4326)::geography;

  -- Tier spacing enforcement
  case p_rarity
    when 'common' then
      v_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'common_spacing_m');
      select min(st_distance(n.geom, v_snapped)) into v_nearest
      from public.notes n where n.status = 'live';
      if v_nearest is not null and v_nearest < v_spacing then
        raise exception 'tier_blocked';
      end if;
    when 'rare' then
      v_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'rare_spacing_m');
      select min(st_distance(n.geom, v_snapped)) into v_nearest
      from public.notes n where n.status = 'live' and n.rarity in ('rare', 'legendary');
      if v_nearest is not null and v_nearest < v_spacing then
        raise exception 'tier_blocked';
      end if;
    when 'legendary' then
      v_spacing := (select (value #>> '{}')::double precision from public.app_config where key = 'legendary_spacing_m');
      select min(st_distance(n.geom, v_snapped)) into v_nearest
      from public.notes n where n.status = 'live' and n.rarity = 'legendary';
      if v_nearest is not null and v_nearest < v_spacing then
        raise exception 'tier_blocked';
      end if;
      -- One legendary per user per 24h
      select count(*) into v_legendary_today
      from public.note_private np
      join public.notes n on n.id = np.note_id
      where np.author_id = v_uid and n.rarity = 'legendary' and n.created_at > now() - interval '24 hours';
      if v_legendary_today > 0 then raise exception 'tier_blocked'; end if;
  end case;

  -- Publish delay
  v_delay := (select (value #>> '{}')::int from public.app_config where key = 'publish_delay_minutes');
  v_visible_at := now() + (v_delay || ' minutes')::interval;

  -- Insert note
  insert into public.notes (rarity, stamp, tone, geom, visible_at)
  values (p_rarity, p_stamp, p_tone, v_snapped, v_visible_at)
  returning id into v_note_id;

  insert into public.note_private (note_id, author_id, body)
  values (v_note_id, v_uid, v_body);

  return jsonb_build_object('id', v_note_id, 'visible_at', v_visible_at);
end;
$$;

revoke all on function public.create_note(double precision, double precision, double precision, text, public.note_rarity, smallint, smallint) from public, anon;
grant execute on function public.create_note(double precision, double precision, double precision, text, public.note_rarity, smallint, smallint) to authenticated;

-- ============================================================
-- vote_note: cast a worth-it vote
-- ============================================================

create or replace function public.vote_note(
  p_note_id uuid,
  p_vote smallint
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_author uuid;
  v_suspicious boolean;
begin
  if v_uid is null then raise exception 'auth_required'; end if;
  if p_vote not in (-1, 1) then raise exception 'bad_position'; end if;

  -- Must have unlocked
  if not exists(select 1 from public.unlocks where user_id = v_uid and note_id = p_note_id) then
    raise exception 'note_not_found';
  end if;

  -- Cannot vote own note
  select author_id into v_author from public.note_private where note_id = p_note_id;
  if v_author = v_uid then raise exception 'own_note'; end if;

  -- Check suspicious
  select suspicious into v_suspicious from public.player_state where user_id = v_uid;
  if v_suspicious then return; end if;

  -- One vote only (update existing unlock row)
  update public.unlocks set vote = p_vote
  where user_id = v_uid and note_id = p_note_id and vote is null;

  if found then
    if p_vote = 1 then
      update public.notes set worth_yes = worth_yes + 1 where id = p_note_id;
      if v_author is not null then
        update public.profiles set worth_received = worth_received + 1, xp = xp + 5
        where id = v_author;
      end if;
    else
      update public.notes set worth_no = worth_no + 1 where id = p_note_id;
    end if;
  end if;
end;
$$;

revoke all on function public.vote_note(uuid, smallint) from public, anon;
grant execute on function public.vote_note(uuid, smallint) to authenticated;

-- ============================================================
-- report_note: flag a note for moderation
-- ============================================================

create or replace function public.report_note(p_note_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_count int;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  -- Must have unlocked
  if not exists(select 1 from public.unlocks where user_id = v_uid and note_id = p_note_id) then
    raise exception 'note_not_found';
  end if;

  -- One report per user
  update public.unlocks set reported = true
  where user_id = v_uid and note_id = p_note_id and reported = false;

  if found then
    update public.notes set report_count = report_count + 1 where id = p_note_id;

    -- Auto-hide at 3 reports
    select report_count into v_count from public.notes where id = p_note_id;
    if v_count >= 3 then
      update public.notes set status = 'hidden' where id = p_note_id;
    end if;
  end if;
end;
$$;

revoke all on function public.report_note(uuid) from public, anon;
grant execute on function public.report_note(uuid) to authenticated;

-- ============================================================
-- my_passport: return caller's unlocked notes with bodies
-- (formerly my_album, retained as backward-compatible alias)
-- ============================================================

create or replace function public.my_passport()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  select coalesce(jsonb_agg(row_to_json(t) order by t.unlocked_at desc), '[]'::jsonb)
  into v_result
  from (
    select
      n.id,
      np.body,
      n.rarity,
      n.stamp,
      n.tone,
      u.unlocked_at,
      n.unlock_count,
      n.worth_yes,
      n.worth_no,
      n.is_seed
    from public.unlocks u
    join public.notes n on n.id = u.note_id
    join public.note_private np on np.note_id = u.note_id
    where u.user_id = v_uid
  ) t;

  return v_result;
end;
$$;

revoke all on function public.my_passport() from public, anon;
grant execute on function public.my_passport() to authenticated;

create or replace function public.my_album()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return public.my_passport();
end;
$$;

revoke all on function public.my_album() from public, anon;
grant execute on function public.my_album() to authenticated;
