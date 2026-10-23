-- V35: live friend duels. A challenge goes to a friend, who accepts or declines; both prepare cables, enter together,
-- start together, and each plays their own server-timed run of the same stage. Results compare the two runs.
create table if not exists public.etc_duels (
  id uuid primary key default gen_random_uuid(),
  challenger uuid not null references public.etc_profiles(id),
  opponent uuid not null references public.etc_profiles(id),
  scenario text not null check (scenario ~ '^(xs|s|m|l|xl)-[1-5]$'),
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','expired')),
  challenger_run uuid references public.etc_runs(id),
  opponent_run uuid references public.etc_runs(id),
  challenger_packed boolean not null default false,
  opponent_packed boolean not null default false,
  challenger_start boolean not null default false,
  opponent_start boolean not null default false,
  created timestamptz not null default now(),
  responded timestamptz,
  check (challenger <> opponent)
);
create index if not exists etc_duels_opponent on public.etc_duels(opponent, status, created desc);
create index if not exists etc_duels_challenger on public.etc_duels(challenger, status, created desc);
alter table public.etc_duels enable row level security;
revoke all on public.etc_duels from public, anon, authenticated;

create or replace function public.etc_duel(action text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); d public.etc_duels; other uuid; me_side text; result jsonb;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (select 1 from public.etc_profiles where id = uid) then raise exception 'PROFILE_REQUIRED'; end if;
  -- Invitations older than 10 minutes lapse.
  update public.etc_duels set status = 'expired' where status = 'pending' and created < now() - interval '10 minutes' and (challenger = uid or opponent = uid);

  if action = 'challenge' then
    perform etc_private.budget('duel:' || uid::text, 20, 600);
    select id into other from public.etc_profiles where friend_code = upper(coalesce(body->>'code', '')) and not hidden and not suspended;
    if other is null or other = uid then raise exception 'NOT_FOUND'; end if;
    if not exists (select 1 from public.etc_friends where status = 'accepted' and ((a = uid and b = other) or (a = other and b = uid))) then raise exception 'NOT_FRIENDS'; end if;
    if coalesce(body->>'scenario', '') !~ '^(xs|s|m|l|xl)-[1-5]$' then raise exception 'INVALID_REQUEST'; end if;
    update public.etc_duels set status = 'cancelled' where challenger = uid and status = 'pending';
    insert into public.etc_duels(challenger, opponent, scenario) values (uid, other, body->>'scenario') returning * into d;
    return jsonb_build_object('id', d.id, 'status', d.status);
  end if;

  if action = 'incoming' then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'scenario', x.scenario, 'created', floor(extract(epoch from x.created) * 1000),
        'challenger', jsonb_build_object('name', p.name, 'friendCode', p.friend_code)) order by x.created desc), '[]') into result
      from public.etc_duels x join public.etc_profiles p on p.id = x.challenger
      where x.opponent = uid and x.status = 'pending';
    return jsonb_build_object('duels', result);
  end if;

  if action = 'active' then
    -- The latest accepted duel of mine from the last hour that I have not joined yet (the challenger is sent there).
    select * into d from public.etc_duels x where x.status = 'accepted' and x.responded > now() - interval '1 hour'
      and ((x.challenger = uid and x.challenger_run is null) or (x.opponent = uid and x.opponent_run is null))
      order by x.responded desc limit 1;
    return jsonb_build_object('id', d.id, 'scenario', d.scenario);
  end if;

  if coalesce(body->>'id', '') !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
  select * into d from public.etc_duels where id = (body->>'id')::uuid and (challenger = uid or opponent = uid) for update;
  if d.id is null then raise exception 'NOT_FOUND'; end if;
  me_side := case when d.challenger = uid then 'challenger' else 'opponent' end;

  if action = 'respond' then
    if me_side <> 'opponent' or d.status <> 'pending' then raise exception 'DUEL_CLOSED'; end if;
    update public.etc_duels set status = case when (body->>'accept')::boolean then 'accepted' else 'declined' end, responded = now()
      where id = d.id returning * into d;
  elsif action = 'cancel' then
    if d.status in ('pending', 'accepted') then update public.etc_duels set status = 'cancelled' where id = d.id returning * into d; end if;
  elsif action = 'join' then
    if d.status <> 'accepted' then raise exception 'DUEL_CLOSED'; end if;
    if coalesce(body->>'run', '') !~ '^[0-9a-f-]{36}$' or not exists (select 1 from public.etc_runs r where r.id = (body->>'run')::uuid and r.player = uid and r.scenario = d.scenario) then raise exception 'INVALID_REQUEST'; end if;
    if me_side = 'challenger' then update public.etc_duels set challenger_run = coalesce(challenger_run, (body->>'run')::uuid) where id = d.id returning * into d;
    else update public.etc_duels set opponent_run = coalesce(opponent_run, (body->>'run')::uuid) where id = d.id returning * into d; end if;
  elsif action = 'packed' then
    if me_side = 'challenger' then update public.etc_duels set challenger_packed = true where id = d.id returning * into d;
    else update public.etc_duels set opponent_packed = true where id = d.id returning * into d; end if;
  elsif action = 'start' then
    if not (d.challenger_packed and d.opponent_packed) then raise exception 'NOT_READY'; end if;
    if me_side = 'challenger' then update public.etc_duels set challenger_start = true where id = d.id returning * into d;
    else update public.etc_duels set opponent_start = true where id = d.id returning * into d; end if;
  elsif action <> 'get' then
    raise exception 'INVALID_ACTION';
  end if;

  select jsonb_build_object('id', d.id, 'scenario', d.scenario, 'status', d.status, 'side', me_side,
    'bothPacked', d.challenger_packed and d.opponent_packed, 'bothStarted', d.challenger_start and d.opponent_start,
    'me', jsonb_build_object('packed', case when me_side = 'challenger' then d.challenger_packed else d.opponent_packed end,
      'started', case when me_side = 'challenger' then d.challenger_start else d.opponent_start end,
      'run', case when me_side = 'challenger' then d.challenger_run else d.opponent_run end),
    'players', (select jsonb_agg(jsonb_build_object('side', s.side, 'name', p.name, 'friendCode', p.friend_code,
        'status', r.status, 'totalMs', r.total, 'elapsedMs', r.elapsed, 'mistakes', r.mistakes, 'packed', s.packed, 'started', s.started) order by s.ord)
      from (values ('challenger', d.challenger, d.challenger_run, 1, d.challenger_packed, d.challenger_start), ('opponent', d.opponent, d.opponent_run, 2, d.opponent_packed, d.opponent_start)) s(side, player, run, ord, packed, started)
      join public.etc_profiles p on p.id = s.player left join public.etc_runs r on r.id = s.run)) into result;
  return result;
end $$;
revoke all on function public.etc_duel(text, jsonb) from public, anon;
grant execute on function public.etc_duel(text, jsonb) to authenticated, service_role;
