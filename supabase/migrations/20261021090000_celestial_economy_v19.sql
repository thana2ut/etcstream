-- V19 Celestial Spirit Economy. ADDITIVE ONLY: no existing table/column/row is altered or removed.
-- Target: etcstream / unohixcxthiilnkmjunc. Rollback plan: see docs/ECONOMY_V19_TH.md (drop only the
-- objects created here; nothing else depends on them).
-- Stones are minted ONLY by a trigger when a run transitions to VERIFIED through the independent
-- replay validator (cloud-independent-replay-v1) with evidence. Seeded/preview rows never pay.
begin;

create table public.etc_wallets (
  player uuid primary key references public.etc_profiles(id),
  balance bigint not null default 0 check (balance >= 0),
  earned bigint not null default 0 check (earned >= 0),
  spent bigint not null default 0 check (spent >= 0),
  version integer not null default 0,
  updated timestamptz not null default now()
);
create table public.etc_ledger (
  id uuid primary key default gen_random_uuid(),
  player uuid not null references public.etc_profiles(id),
  amount bigint not null check (amount <> 0),
  kind text not null check (kind in ('first_clear','medal','daily','purchase','admin_adjust')),
  source text not null,
  idem_key text not null unique,
  balance_after bigint not null check (balance_after >= 0),
  meta jsonb not null default '{}'::jsonb,
  created timestamptz not null default now()
);
create index etc_ledger_player on public.etc_ledger(player, created desc);
create index etc_ledger_source on public.etc_ledger(source);
create trigger etc_ledger_immutable before update or delete on public.etc_ledger for each row execute function etc_private.audit_immutable();

create table public.etc_reward_claims (
  player uuid not null references public.etc_profiles(id),
  stage text not null,
  rules_version integer not null,
  family text not null check (family in ('first_clear','medal','daily')),
  period text not null default '',
  tier text,
  amount_total integer not null check (amount_total >= 0),
  run_id uuid references public.etc_runs(id),
  created timestamptz not null default now(),
  primary key (player, stage, rules_version, family, period)
);
create table public.etc_reward_rules (
  key text primary key,
  amount integer not null check (amount between 0 and 100000),
  updated timestamptz not null default now()
);
insert into public.etc_reward_rules(key, amount) values
  ('first_clear_1',50),('first_clear_2',75),('first_clear_3',100),('first_clear_4',150),('first_clear_5',200),
  ('medal_bronze',10),('medal_silver',25),('medal_gold',50),('daily_three',30)
on conflict (key) do nothing;
-- Per stage/version thresholds approved by the owner. No row => no medal bonus (never guessed).
create table public.etc_medal_thresholds (
  scenario text not null,
  scenario_version text not null,
  rules_version integer not null default 1,
  bronze_ms bigint not null,
  silver_ms bigint not null,
  gold_ms bigint not null,
  approved timestamptz not null default now(),
  primary key (scenario, scenario_version, rules_version),
  check (gold_ms > 0 and gold_ms < silver_ms and silver_ms < bronze_ms)
);
create table public.etc_catalog (
  sku text primary key check (sku ~ '^[a-z][a-z0-9_]{2,40}$'),
  name text not null,
  slot text not null check (slot in ('swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor')),
  price integer not null check (price > 0 and price <= 1000000),
  enabled boolean not null default true,
  tradable boolean not null default false check (not tradable),
  asset text not null check (asset ~ '^/arena/economy/shop/[a-z/-]+\.png$'),
  sort integer not null default 0,
  updated timestamptz not null default now()
);
create table public.etc_owned (
  player uuid not null references public.etc_profiles(id),
  sku text not null references public.etc_catalog(sku),
  ledger_id uuid not null references public.etc_ledger(id),
  acquired timestamptz not null default now(),
  primary key (player, sku)
);
create table public.etc_equipped (
  player uuid not null,
  slot text not null,
  sku text not null,
  updated timestamptz not null default now(),
  primary key (player, slot),
  foreign key (player, sku) references public.etc_owned(player, sku)
);

alter table public.etc_wallets enable row level security;
alter table public.etc_ledger enable row level security;
alter table public.etc_reward_claims enable row level security;
alter table public.etc_reward_rules enable row level security;
alter table public.etc_medal_thresholds enable row level security;
alter table public.etc_catalog enable row level security;
alter table public.etc_owned enable row level security;
alter table public.etc_equipped enable row level security;
-- No client table access at all (same model as V12): players use etc_economy(), admin uses etc_economy_admin().
revoke all on public.etc_wallets, public.etc_ledger, public.etc_reward_claims, public.etc_reward_rules,
  public.etc_medal_thresholds, public.etc_catalog, public.etc_owned, public.etc_equipped from public, anon, authenticated;
grant select on public.etc_wallets, public.etc_ledger, public.etc_reward_claims, public.etc_reward_rules,
  public.etc_medal_thresholds, public.etc_catalog, public.etc_owned, public.etc_equipped to service_role;

insert into public.etc_catalog(sku,name,slot,price,asset,sort) values
  ('sword_cloud','กระบี่เมฆา','swordSkin',400,'/arena/economy/shop/swords/cloud-blade.png',10),
  ('sword_thunder','กระบี่อัสนี','swordSkin',650,'/arena/economy/shop/swords/thunder-blade.png',11),
  ('sword_jade_dragon','กระบี่มังกรหยก','swordSkin',1200,'/arena/economy/shop/swords/jade-dragon-blade.png',13),
  ('sword_flame','กระบี่เพลิงสวรรค์','swordSkin',980,'/arena/economy/shop/swords/flame-blade.png',12),
  ('sword_frost','กระบี่เหมันต์','swordSkin',1500,'/arena/economy/shop/swords/frost-blade.png',14),
  ('robe_cloud','อาภรณ์เมฆา','portraitOutfit',600,'/arena/economy/shop/robes/cloud-robe.png',20),
  ('robe_vermilion','อาภรณ์ชาด','portraitOutfit',780,'/arena/economy/shop/robes/vermilion-robe.png',21),
  ('robe_night','อาภรณ์รัตติกาล','portraitOutfit',900,'/arena/economy/shop/robes/night-robe.png',22),
  ('robe_golden','อาภรณ์สุริยัน','portraitOutfit',1200,'/arena/economy/shop/robes/golden-robe.png',23),
  ('robe_jade','อาภรณ์หยก','portraitOutfit',1450,'/arena/economy/shop/robes/jade-robe.png',24),
  ('frame_moon','กรอบจันทรา','profileFrame',120,'/arena/economy/shop/frames/moon-frame.png',30),
  ('frame_gold','กรอบสุริยัน','profileFrame',350,'/arena/economy/shop/frames/gold-frame.png',31),
  ('frame_fire','กรอบเพลิง','profileFrame',500,'/arena/economy/shop/frames/fire-frame.png',32),
  ('frame_purple','กรอบม่วงพิภพ','profileFrame',600,'/arena/economy/shop/frames/purple-frame.png',33),
  ('frame_ice','กรอบเหมันต์','profileFrame',650,'/arena/economy/shop/frames/ice-frame.png',34),
  ('pet_crane','กระเรียนเมฆา','profileCompanion',900,'/arena/economy/shop/companions/cloud-crane.png',40),
  ('pet_fox','จิ้งจอกหยก','profileCompanion',1100,'/arena/economy/shop/companions/jade-fox.png',41),
  ('pet_dragon','มังกรน้อย','profileCompanion',1800,'/arena/economy/shop/companions/azure-dragon.png',42),
  ('pet_phoenix','หงส์เพลิง','profileCompanion',2200,'/arena/economy/shop/companions/phoenix.png',43),
  ('home_pavilion','ศาลาเซียน','residenceDecor',500,'/arena/economy/shop/residence/jade-pavilion.png',50),
  ('home_peach','ต้นท้อเซียน','residenceDecor',300,'/arena/economy/shop/residence/peach-tree.png',51),
  ('home_bridge','สะพานหมอก','residenceDecor',450,'/arena/economy/shop/residence/cloud-bridge.png',52),
  ('home_lantern','โคมสวรรค์','residenceDecor',100,'/arena/economy/shop/residence/heaven-lantern.png',53),
  ('home_banner','แผ่นป้ายสำนัก','residenceDecor',150,'/arena/economy/shop/residence/celestial-banner.png',54),
  ('home_pedestal','แท่นกระบี่','residenceDecor',300,'/arena/economy/shop/residence/sword-pedestal.png',55)
on conflict (sku) do nothing;

-- Single mutation primitive. Caller must already hold the wallet row lock via ensure_wallet().
create function etc_private.ensure_wallet(p uuid) returns public.etc_wallets
language plpgsql security definer set search_path='' as $$
declare w public.etc_wallets;
begin
  insert into public.etc_wallets(player) values (p) on conflict (player) do nothing;
  select * into w from public.etc_wallets where player = p for update;
  return w;
end $$;
create function etc_private.post(p uuid, amt bigint, k text, src text, idem text, m jsonb) returns public.etc_ledger
language plpgsql security definer set search_path='' as $$
declare w public.etc_wallets; l public.etc_ledger;
begin
  select * into l from public.etc_ledger where idem_key = idem;
  if l.id is not null then return l; end if;           -- idempotent retry: same receipt, no second posting
  w := etc_private.ensure_wallet(p);
  if w.balance + amt < 0 then raise exception 'INSUFFICIENT_STONES'; end if;
  update public.etc_wallets set balance = balance + amt,
    earned = earned + greatest(amt, 0), spent = spent + greatest(-amt, 0),
    version = version + 1, updated = now() where player = p returning * into w;
  insert into public.etc_ledger(player, amount, kind, source, idem_key, balance_after, meta)
    values (p, amt, k, src, idem, w.balance, coalesce(m, '{}'::jsonb)) returning * into l;
  return l;
end $$;
revoke all on function etc_private.ensure_wallet(uuid) from public, anon, authenticated;
revoke all on function etc_private.post(uuid,bigint,text,text,text,jsonb) from public, anon, authenticated;

create function etc_private.rule(k text) returns integer language sql stable security definer set search_path='' as $$
  select coalesce((select amount from public.etc_reward_rules where key = k), 0) $$;
revoke all on function etc_private.rule(text) from public, anon, authenticated;

-- Reward issuance runs inside the SAME transaction that certifies the run (etc_certify_run).
create function etc_private.grant_run_rewards() returns trigger
language plpgsql security definer set search_path='' as $$
declare lvl integer; amt integer; t public.etc_medal_thresholds; prior public.etc_reward_claims; medal_tier text;
  medal_total integer; day text; n integer; inserted integer;
begin
  if new.status <> 'VERIFIED' or old.status = 'VERIFIED' or new.invalid or not new.graph_valid
     or new.validation_version is distinct from 'cloud-independent-replay-v1' or new.evidence is null
     or new.total is null then return new; end if;
  lvl := substring(new.scenario from '-([1-5])$')::integer;
  if lvl is null then return new; end if;
  perform etc_private.ensure_wallet(new.player);  -- serialize all grants for this player
  -- 1) one-time first clear per canonical stage + rules version (independent of scenario_version edits)
  amt := etc_private.rule('first_clear_' || lvl);
  insert into public.etc_reward_claims(player, stage, rules_version, family, amount_total, run_id)
    values (new.player, new.scenario, new.rules_version, 'first_clear', amt, new.id) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 1 and amt > 0 then
    perform etc_private.post(new.player, amt, 'first_clear', new.id::text, 'first_clear:' || new.player || ':' || new.scenario || ':' || new.rules_version,
      jsonb_build_object('stage', new.scenario, 'level', lvl, 'run', new.id));
  end if;
  -- 2) medal: only incremental difference up to the highest tier ever reached
  select * into t from public.etc_medal_thresholds where scenario = new.scenario and scenario_version = new.scenario_version and rules_version = new.rules_version;
  if t.scenario is not null then
    medal_tier := case when new.total <= t.gold_ms then 'gold' when new.total <= t.silver_ms then 'silver' when new.total <= t.bronze_ms then 'bronze' end;
    if medal_tier is not null then
      medal_total := etc_private.rule('medal_' || medal_tier);
      select * into prior from public.etc_reward_claims where player = new.player and stage = new.scenario and rules_version = new.rules_version and family = 'medal' and period = '' for update;
      if prior.player is null then
        insert into public.etc_reward_claims(player, stage, rules_version, family, tier, amount_total, run_id) values (new.player, new.scenario, new.rules_version, 'medal', medal_tier, medal_total, new.id);
        amt := medal_total;
      elsif medal_total > prior.amount_total then
        update public.etc_reward_claims set tier = medal_tier, amount_total = medal_total, run_id = new.id where player = new.player and stage = new.scenario and rules_version = new.rules_version and family = 'medal' and period = '';
        amt := medal_total - prior.amount_total;
      else amt := 0; end if;
      if amt > 0 then
        perform etc_private.post(new.player, amt, 'medal', new.id::text, 'medal:' || new.player || ':' || new.scenario || ':' || new.rules_version || ':' || medal_tier,
          jsonb_build_object('stage', new.scenario, 'tier', medal_tier, 'run', new.id));
      end if;
    end if;
  end if;
  -- 3) daily: three DISTINCT genuinely verified stages on one Asia/Bangkok day, once per day
  day := to_char(new.verified_at at time zone 'Asia/Bangkok', 'YYYY-MM-DD');
  select count(distinct scenario) into n from public.etc_runs
    where player = new.player and status = 'VERIFIED' and not invalid and validation_version = 'cloud-independent-replay-v1' and evidence is not null
      and to_char(verified_at at time zone 'Asia/Bangkok', 'YYYY-MM-DD') = day;
  amt := etc_private.rule('daily_three');
  if n >= 3 and amt > 0 then
    insert into public.etc_reward_claims(player, stage, rules_version, family, period, amount_total, run_id)
      values (new.player, '*', 0, 'daily', day, amt, new.id) on conflict do nothing;
    get diagnostics inserted = row_count;
    if inserted = 1 then
      perform etc_private.post(new.player, amt, 'daily', new.id::text, 'daily:' || new.player || ':' || day, jsonb_build_object('day', day, 'run', new.id));
    end if;
  end if;
  return new;
end $$;
revoke all on function etc_private.grant_run_rewards() from public, anon, authenticated;
create trigger etc_runs_economy after update of status on public.etc_runs
  for each row when (new.status = 'VERIFIED' and old.status is distinct from 'VERIFIED')
  execute function etc_private.grant_run_rewards();

create function etc_private.item_view(c public.etc_catalog, owned boolean, equipped boolean) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('sku', c.sku, 'name', c.name, 'slot', c.slot, 'price', c.price, 'asset', c.asset,
    'enabled', c.enabled, 'owned', owned, 'equipped', equipped) $$;
revoke all on function etc_private.item_view(public.etc_catalog, boolean, boolean) from public, anon, authenticated;

-- Player surface. Identity is auth.uid() only; price/player are never accepted from the caller.
create function public.etc_economy(action text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); p public.etc_profiles; w public.etc_wallets; c public.etc_catalog; l public.etc_ledger;
  key text; result jsonb; o public.etc_owned;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into p from public.etc_profiles where id = uid;
  if p.id is null then raise exception 'PROFILE_REQUIRED'; end if;
  if p.suspended then raise exception 'SUSPENDED'; end if;
  perform etc_private.budget('economy:' || uid::text, 120, 60);
  if action in ('purchase', 'equip', 'unequip') then
    perform etc_private.budget('economy-write:' || uid::text, 20, 60);
    w := etc_private.ensure_wallet(uid);   -- row lock serializes concurrent tabs/requests
  end if;
  if action = 'purchase' then
    key := body->>'idempotencyKey';
    if key is null or key !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
    select * into l from public.etc_ledger where idem_key = 'purchase:' || uid || ':' || key;
    if l.id is not null then
      return jsonb_build_object('status', 'committed', 'retry', true, 'sku', l.meta->>'sku', 'price', -l.amount, 'balance', (select balance from public.etc_wallets where player = uid), 'ledgerId', l.id);
    end if;
    select * into c from public.etc_catalog where sku = body->>'sku';
    if c.sku is null or not c.enabled then raise exception 'ITEM_UNAVAILABLE'; end if;
    if exists (select 1 from public.etc_owned where player = uid and sku = c.sku) then raise exception 'ALREADY_OWNED'; end if;
    l := etc_private.post(uid, -c.price, 'purchase', c.sku, 'purchase:' || uid || ':' || key, jsonb_build_object('sku', c.sku, 'price', c.price, 'name', c.name));
    insert into public.etc_owned(player, sku, ledger_id) values (uid, c.sku, l.id);
    return jsonb_build_object('status', 'committed', 'retry', false, 'sku', c.sku, 'price', c.price, 'balance', l.balance_after, 'ledgerId', l.id);
  elsif action = 'equip' then
    select o2.* into o from public.etc_owned o2 where o2.player = uid and o2.sku = body->>'sku';
    if o.sku is null then raise exception 'NOT_OWNED'; end if;
    select * into c from public.etc_catalog where sku = o.sku;
    insert into public.etc_equipped(player, slot, sku) values (uid, c.slot, c.sku)
      on conflict (player, slot) do update set sku = excluded.sku, updated = now();
    return jsonb_build_object('ok', true, 'slot', c.slot, 'sku', c.sku);
  elsif action = 'unequip' then
    if body->>'slot' not in ('swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor') then raise exception 'INVALID_REQUEST'; end if;
    delete from public.etc_equipped where player = uid and slot = body->>'slot';
    return jsonb_build_object('ok', true, 'slot', body->>'slot');
  elsif action = 'summary' then
    select * into w from public.etc_wallets where player = uid;
    return jsonb_build_object('balance', coalesce(w.balance, 0), 'earned', coalesce(w.earned, 0), 'spent', coalesce(w.spent, 0),
      'equipped', (select coalesce(jsonb_object_agg(e.slot, etc_private.item_view(c2, true, true)), '{}') from public.etc_equipped e join public.etc_catalog c2 on c2.sku = e.sku where e.player = uid),
      'ownedCount', (select count(*) from public.etc_owned where player = uid),
      'claims', (select count(*) from public.etc_reward_claims where player = uid and family = 'first_clear'));
  elsif action = 'catalog' then
    select coalesce(jsonb_agg(etc_private.item_view(c2, o2.sku is not null, e.sku is not null) order by c2.sort, c2.sku), '[]') into result
      from public.etc_catalog c2
      left join public.etc_owned o2 on o2.player = uid and o2.sku = c2.sku
      left join public.etc_equipped e on e.player = uid and e.sku = c2.sku
      where c2.enabled or o2.sku is not null;
    return jsonb_build_object('items', result, 'balance', coalesce((select balance from public.etc_wallets where player = uid), 0));
  elsif action = 'ledger' then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'amount', x.amount, 'kind', x.kind, 'balanceAfter', x.balance_after,
        'meta', x.meta - 'run', 'created', floor(extract(epoch from x.created) * 1000)) order by x.created desc), '[]') into result
      from (select * from public.etc_ledger where player = uid order by created desc
        offset least(greatest(coalesce((body->>'offset')::integer, 0), 0), 100000) limit 50) x;
    return jsonb_build_object('entries', result);
  elsif action = 'receipt' then
    -- Rewards produced by one of the caller's own runs, read back from the ledger (never computed client-side).
    if coalesce(body->>'run', '') !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
    select coalesce(jsonb_agg(jsonb_build_object('kind', x.kind, 'amount', x.amount, 'meta', x.meta - 'run') order by x.created), '[]') into result
      from public.etc_ledger x where x.player = uid and x.source = body->>'run' and x.kind in ('first_clear','medal','daily');
    return jsonb_build_object('entries', result, 'balance', coalesce((select balance from public.etc_wallets where player = uid), 0));
  elsif action = 'friend-appearance' then
    -- Only accepted, non-blocked friends' equipped profile cosmetics (no balances, no ledger).
    select coalesce(jsonb_object_agg(q.friend_code, q.items), '{}') into result from (
      select f2.friend_code, jsonb_object_agg(e.slot, c2.asset) items
      from public.etc_friends f join public.etc_profiles f2 on f2.id = case when f.a = uid then f.b else f.a end
      join public.etc_equipped e on e.player = f2.id join public.etc_catalog c2 on c2.sku = e.sku
      where (f.a = uid or f.b = uid) and f.status = 'accepted' and not f2.hidden and not f2.suspended
        and e.slot in ('profileFrame', 'profileCompanion')
        and not exists (select 1 from public.etc_blocks where (a = uid and b = f2.id) or (a = f2.id and b = uid))
      group by f2.friend_code) q;
    return jsonb_build_object('friends', result);
  end if;
  raise exception 'INVALID_ACTION';
end $$;
revoke all on function public.etc_economy(text, jsonb) from public, anon, authenticated;
grant execute on function public.etc_economy(text, jsonb) to authenticated;

-- Owner surface behind the single /admin session (service_role only). Every mutation is audited.
create function public.etc_economy_admin(operation text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare reason text := trim(coalesce(body->>'reason', '')); l public.etc_ledger; target uuid; amt bigint; result jsonb;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;
  if operation in ('adjust', 'catalog', 'rule', 'medal', 'medal-clear') and char_length(reason) not between 5 and 500 then raise exception 'REASON_REQUIRED'; end if;
  if operation = 'overview' then
    return jsonb_build_object(
      'wallets', (select count(*) from public.etc_wallets), 'circulating', (select coalesce(sum(balance), 0) from public.etc_wallets),
      'earned', (select coalesce(sum(earned), 0) from public.etc_wallets), 'spent', (select coalesce(sum(spent), 0) from public.etc_wallets),
      'purchases', (select count(*) from public.etc_owned), 'ledger', (select count(*) from public.etc_ledger),
      'adjustments', (select count(*) from public.etc_ledger where kind = 'admin_adjust'),
      'medalStages', (select count(*) from public.etc_medal_thresholds),
      'unpaidSeeded', (select count(*) from public.etc_runs where status = 'VERIFIED' and validation_version is distinct from 'cloud-independent-replay-v1'),
      'suspect', (select coalesce(jsonb_agg(s), '[]') from (select player, sum(amount) total, count(*) n from public.etc_ledger
         where amount > 0 and created > now() - interval '24 hours' group by player having sum(amount) > 1500 order by 2 desc limit 20) s));
  elsif operation = 'wallets' then
    select coalesce(jsonb_agg(jsonb_build_object('player', w.player, 'name', p.name, 'friendCode', p.friend_code, 'balance', w.balance, 'earned', w.earned, 'spent', w.spent,
      'owned', (select count(*) from public.etc_owned o where o.player = w.player), 'updated', floor(extract(epoch from w.updated) * 1000)) order by w.updated desc), '[]') into result
      from (select * from public.etc_wallets order by updated desc limit 100 offset least(greatest(coalesce((body->>'offset')::integer, 0), 0), 100000)) w join public.etc_profiles p on p.id = w.player;
    return jsonb_build_object('wallets', result);
  elsif operation = 'ledger' then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'player', x.player, 'amount', x.amount, 'kind', x.kind, 'source', x.source,
      'balanceAfter', x.balance_after, 'meta', x.meta, 'created', floor(extract(epoch from x.created) * 1000)) order by x.created desc), '[]') into result
      from (select * from public.etc_ledger where (body->>'player' is null or player::text = body->>'player') order by created desc limit 100
        offset least(greatest(coalesce((body->>'offset')::integer, 0), 0), 100000)) x;
    return jsonb_build_object('entries', result);
  elsif operation = 'config' then
    return jsonb_build_object('catalog', (select coalesce(jsonb_agg(to_jsonb(c) order by c.sort), '[]') from public.etc_catalog c),
      'rules', (select coalesce(jsonb_object_agg(key, amount), '{}') from public.etc_reward_rules),
      'medals', (select coalesce(jsonb_agg(to_jsonb(m) order by m.scenario), '[]') from public.etc_medal_thresholds m));
  elsif operation = 'adjust' then
    target := (body->>'player')::uuid; amt := (body->>'amount')::bigint;
    if amt is null or amt = 0 or abs(amt) > 100000 then raise exception 'INVALID_REQUEST'; end if;
    if not exists (select 1 from public.etc_profiles where id = target) then raise exception 'PROFILE_REQUIRED'; end if;
    if coalesce(body->>'idempotencyKey', '') !~ '^[0-9a-f-]{36}$' then raise exception 'INVALID_REQUEST'; end if;
    l := etc_private.post(target, amt, 'admin_adjust', 'admin', 'admin:' || (body->>'idempotencyKey'), jsonb_build_object('reason', reason));
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'economy-adjust:' || amt, target::text, reason || ' · ledger ' || l.id);
    return jsonb_build_object('ok', true, 'balance', l.balance_after, 'ledgerId', l.id);
  elsif operation = 'catalog' then
    update public.etc_catalog set price = coalesce((body->>'price')::integer, price), enabled = coalesce((body->>'enabled')::boolean, enabled), updated = now()
      where sku = body->>'sku';
    if not found then raise exception 'ITEM_UNAVAILABLE'; end if;
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'economy-catalog', body->>'sku', reason || ' · ' || (body - 'reason')::text);
    return jsonb_build_object('ok', true);
  elsif operation = 'rule' then
    update public.etc_reward_rules set amount = (body->>'amount')::integer, updated = now() where key = body->>'key';
    if not found then raise exception 'INVALID_REQUEST'; end if;
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'economy-rule:' || (body->>'amount'), body->>'key', reason);
    return jsonb_build_object('ok', true);
  elsif operation = 'medal' then
    insert into public.etc_medal_thresholds(scenario, scenario_version, rules_version, bronze_ms, silver_ms, gold_ms)
      values (body->>'scenario', body->>'version', 1, (body->>'bronzeMs')::bigint, (body->>'silverMs')::bigint, (body->>'goldMs')::bigint)
      on conflict (scenario, scenario_version, rules_version) do update set bronze_ms = excluded.bronze_ms, silver_ms = excluded.silver_ms, gold_ms = excluded.gold_ms, approved = now();
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'economy-medal', body->>'scenario', reason || ' · ' || (body - 'reason')::text);
    return jsonb_build_object('ok', true);
  elsif operation = 'medal-clear' then
    delete from public.etc_medal_thresholds where scenario = body->>'scenario' and scenario_version = body->>'version';
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'economy-medal-clear', body->>'scenario', reason);
    return jsonb_build_object('ok', true);
  end if;
  raise exception 'INVALID_ACTION';
end $$;
revoke all on function public.etc_economy_admin(text, jsonb) from public, anon, authenticated;
grant execute on function public.etc_economy_admin(text, jsonb) to service_role;
commit;
