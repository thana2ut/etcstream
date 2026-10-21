-- V30: Mission Hall (25 levels) Spirit Stone rewards + paid revive (100 stones).
-- Server-authoritative: start/finish times are database clock; the route validates the wiring before "finish";
-- this function is callable by service_role only (never directly by players).
alter table public.etc_ledger drop constraint if exists etc_ledger_kind_check;
alter table public.etc_ledger add constraint etc_ledger_kind_check
  check (kind in ('first_clear','medal','daily','purchase','admin_adjust','mission_clear','mission_revive'));

create table if not exists public.etc_mission_runs (
  id uuid primary key default gen_random_uuid(),
  player uuid not null references public.etc_profiles(id),
  stage text not null check (stage ~ '^(xs|s|m|l|xl)-[1-5]$'),
  level integer not null check (level between 1 and 5),
  status text not null default 'running' check (status in ('running','cleared')),
  started timestamptz not null default now(),
  finished timestamptz,
  revives integer not null default 0,
  mistakes integer,
  reward integer,
  breakdown jsonb
);
create index if not exists etc_mission_runs_player on public.etc_mission_runs(player, started desc);
alter table public.etc_mission_runs enable row level security;
revoke all on public.etc_mission_runs from public, anon, authenticated;

create or replace function public.etc_mission(p_player uuid, action text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.etc_mission_runs; l public.etc_ledger; w public.etc_wallets;
  lvl integer; base integer; target_s integer; secs numeric; mult numeric; clean integer; total integer; key text;
begin
  if p_player is null then raise exception 'AUTH_REQUIRED'; end if;
  perform etc_private.budget('mission:' || p_player::text, 60, 60);
  if action = 'start' then
    if coalesce(body->>'stage', '') !~ '^(xs|s|m|l|xl)-[1-5]$' then raise exception 'INVALID_REQUEST'; end if;
    lvl := right(body->>'stage', 1)::integer;
    insert into public.etc_mission_runs(player, stage, level) values (p_player, body->>'stage', lvl) returning * into r;
    return jsonb_build_object('run', r.id, 'stage', r.stage, 'started', r.started);
  end if;

  if coalesce(body->>'run', '') !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
  select * into r from public.etc_mission_runs m where m.id = (body->>'run')::uuid and m.player = p_player for update;
  if r.id is null then raise exception 'RUN_NOT_FOUND'; end if;

  if action = 'revive' then
    key := body->>'idempotencyKey';
    if key is null or key !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
    if r.status <> 'running' then raise exception 'RUN_CLOSED'; end if;
    select * into l from public.etc_ledger where idem_key = 'mission-revive:' || r.id || ':' || key;
    if l.id is null then
      l := etc_private.post(p_player, -100, 'mission_revive', r.stage, 'mission-revive:' || r.id || ':' || key, jsonb_build_object('run', r.id, 'stage', r.stage));
      update public.etc_mission_runs set revives = revives + 1 where id = r.id;
    end if;
    select * into w from public.etc_wallets where etc_wallets.player = p_player;
    return jsonb_build_object('status', 'committed', 'balance', w.balance, 'ledgerId', l.id);
  end if;

  if action = 'finish' then
    if r.status = 'cleared' then
      select * into w from public.etc_wallets where etc_wallets.player = p_player;
      return jsonb_build_object('status', 'committed', 'retry', true, 'reward', r.reward, 'breakdown', r.breakdown, 'balance', coalesce(w.balance, 0));
    end if;
    secs := extract(epoch from (now() - r.started));
    if secs < 15 then raise exception 'RUN_TOO_FAST'; end if;
    perform etc_private.budget('mission-clear:' || p_player::text, 30, 3600);
    base := (array[120,180,260,360,500])[r.level];
    target_s := (array[180,240,300,360,420])[r.level];
    mult := case when secs <= target_s * 0.60 then 1.60 when secs <= target_s * 0.85 then 1.35
                 when secs <= target_s * 1.00 then 1.15 when secs <= target_s * 1.30 then 1.00 else 0.70 end;
    clean := case when coalesce((body->>'mistakes')::integer, 99) = 0 and r.revives = 0 then 50 else 0 end;
    total := greatest(round(base * mult)::integer + clean, round(base * 0.4)::integer);
    l := etc_private.post(p_player, total, 'mission_clear', r.stage, 'mission-clear:' || r.id,
      jsonb_build_object('run', r.id, 'stage', r.stage, 'seconds', round(secs), 'multiplier', mult));
    update public.etc_mission_runs set status = 'cleared', finished = now(), mistakes = coalesce((body->>'mistakes')::integer, 0), reward = total,
      breakdown = jsonb_build_object('base', base, 'timeBonus', round(base * mult)::integer - base, 'cleanBonus', clean, 'multiplier', mult,
        'seconds', round(secs), 'targetSeconds', target_s, 'floor', round(base * 0.4)::integer, 'total', total, 'revives', r.revives)
      where id = r.id returning * into r;
    return jsonb_build_object('status', 'committed', 'retry', false, 'reward', total, 'breakdown', r.breakdown, 'balance', l.balance_after);
  end if;
  raise exception 'INVALID_REQUEST';
end $$;
revoke all on function public.etc_mission(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.etc_mission(uuid, text, jsonb) to service_role;
