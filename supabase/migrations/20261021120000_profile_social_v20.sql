-- V20: 40 owner-supplied catalog items, profile avatar slot, discoverability privacy, social RPC and
-- asynchronous time-trial challenges. ADDITIVE: no row is deleted; the 25 V19 SKUs are kept (owners keep
-- them, ledgers untouched) and only closed to NEW sales as legacy items. Existing friendships are kept.

-- Catalog constraints become supersets of V19 (old SKUs/assets/slots stay valid).
alter table public.etc_catalog drop constraint etc_catalog_sku_check;
alter table public.etc_catalog add constraint etc_catalog_sku_check check (sku ~ '^[A-Za-z][A-Za-z0-9_-]{2,40}$');
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (asset ~ '^/arena/economy/(shop|catalog)/[a-z0-9/-]+\.png$');
alter table public.etc_catalog drop constraint etc_catalog_slot_check;
alter table public.etc_catalog add constraint etc_catalog_slot_check check (slot in ('profileAvatar','swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor'));
alter table public.etc_catalog add column if not exists legacy boolean not null default false;

update public.etc_catalog set legacy = true, enabled = false, updated = now()
  where sku in ('sword_cloud','sword_thunder','sword_jade_dragon','sword_flame','sword_frost','robe_cloud','robe_vermilion','robe_night','robe_golden','robe_jade',
    'frame_moon','frame_gold','frame_fire','frame_purple','frame_ice','pet_crane','pet_fox','pet_dragon','pet_phoenix',
    'home_pavilion','home_peach','home_bridge','home_lantern','home_banner','home_pedestal') and not legacy;

insert into public.etc_catalog(sku,name,slot,price,asset,sort) values
  ('AV-001','เซียนกระบี่จันทราคราม','profileAvatar',350,'/arena/economy/catalog/avatar/av-001-blue-moon-xian.png',101),
  ('AV-002','เซียนหงส์โลหิต','profileAvatar',450,'/arena/economy/catalog/avatar/av-002-red-phoenix-xian.png',102),
  ('AV-003','เซียนจันทราพิทักษ์นภา','profileAvatar',500,'/arena/economy/catalog/avatar/av-003-003-blue-moon-swordsman.png',103),
  ('AV-004','จอมยุทธ์เพลิงสะบั้นฟ้า','profileAvatar',600,'/arena/economy/catalog/avatar/av-004-004-red-flame-swordsman.png',104),
  ('AV-005','มหาเซียนสุริยันเรืองรอง','profileAvatar',1000,'/arena/economy/catalog/avatar/av-005-005-gold-celestial-master.png',105),
  ('AV-006','ผู้ร่ายมนตร์จันทราม่วง','profileAvatar',700,'/arena/economy/catalog/avatar/av-006-006-purple-moon-mage.png',106),
  ('AV-007','เซียนหยกพฤกษาสถิต','profileAvatar',550,'/arena/economy/catalog/avatar/av-007-007-green-jade-cultivator.png',107),
  ('AV-008','ธิดาเกล็ดเหมันต์','profileAvatar',650,'/arena/economy/catalog/avatar/av-008-008-ice-blue-fairy.png',108),
  ('AV-009','ธิดาหงส์เพลิงรำ','profileAvatar',780,'/arena/economy/catalog/avatar/av-009-009-crimson-phoenix-fairy.png',109),
  ('AV-010','ธิดาบุปผาแสงสวรรค์','profileAvatar',980,'/arena/economy/catalog/avatar/av-010-010-white-gold-celestial-fairy.png',110),
  ('AV-011','ธิดาผีเสื้อรัตติกาล','profileAvatar',850,'/arena/economy/catalog/avatar/av-011-011-violet-butterfly-fairy.png',111),
  ('AV-012','ธิดามรกตจันทรา','profileAvatar',750,'/arena/economy/catalog/avatar/av-012-012-emerald-forest-fairy.png',112),
  ('AV-013','เงาเซียนรัตติกาล','profileAvatar',480,'/arena/economy/catalog/avatar/av-013-013-purple-night-xian.png',113),
  ('AV-014','เงาเซียนไผ่หยก','profileAvatar',450,'/arena/economy/catalog/avatar/av-014-014-green-jade-xian.png',114),
  ('AV-015','เงาเซียนเหมันต์ขาว','profileAvatar',520,'/arena/economy/catalog/avatar/av-015-015-white-frost-xian.png',115),
  ('FR-001','วงแหวนจันทราเมฆา','profileFrame',350,'/arena/economy/catalog/frame/fr-001-moonlight-cloud-frame.png',201),
  ('FR-002','วงแหวนมังกรอัคคี','profileFrame',450,'/arena/economy/catalog/frame/fr-002-fire-dragon-frame.png',202),
  ('FR-003','บุปผารัตติกาล','profileFrame',550,'/arena/economy/catalog/frame/fr-003-wisteria-night-frame.png',203),
  ('FR-004','ป่าไผ่หยกเซียน','profileFrame',400,'/arena/economy/catalog/frame/fr-004-bamboo-jade-frame.png',204),
  ('FR-005','สวนซากุระสวรรค์','profileFrame',500,'/arena/economy/catalog/frame/fr-005-sakura-frame.png',205),
  ('FR-006','บัลลังก์มังกรพฤกษา','profileFrame',750,'/arena/economy/catalog/frame/fr-006-jade-dragon-throne-frame.png',206),
  ('FR-007','ตำหนักบุปผาโลหิต','profileFrame',850,'/arena/economy/catalog/frame/fr-007-crimson-flower-palace-frame.png',207),
  ('FR-008','มหาจันทราผลึกม่วง','profileFrame',950,'/arena/economy/catalog/frame/fr-008-violet-crystal-moon-frame.png',208),
  ('SW-001','กระบี่เหมันต์จันทรา','swordSkin',400,'/arena/economy/catalog/sword/sw-001-frost-moon-sword.png',301),
  ('SW-002','กระบี่มังกรหยก','swordSkin',650,'/arena/economy/catalog/sword/sw-002-jade-dragon-sword.png',302),
  ('SW-003','กระบี่หงส์เพลิง','swordSkin',850,'/arena/economy/catalog/sword/sw-003-phoenix-flame-sword.png',303),
  ('SW-004','กระบี่สุริยันนิรันดร์','swordSkin',1200,'/arena/economy/catalog/sword/sw-004-eternal-sun-sword.png',304),
  ('SW-005','กระบี่รัตติกาลมายา','swordSkin',1000,'/arena/economy/catalog/sword/sw-005-illusory-night-sword.png',305),
  ('PET-001','มังกรวารีสวรรค์','profileCompanion',1800,'/arena/economy/catalog/pet/pet-001-blue-celestial-dragon.png',401),
  ('PET-002','หงส์อัคคีอมตะ','profileCompanion',1900,'/arena/economy/catalog/pet/pet-002-fire-phoenix.png',402),
  ('PET-003','จิ้งจอกเก้าหางเหมันต์','profileCompanion',1300,'/arena/economy/catalog/pet/pet-003-ice-nine-tailed-fox.png',403),
  ('PET-004','กิเลนมรกตศักดิ์สิทธิ์','profileCompanion',1650,'/arena/economy/catalog/pet/pet-004-emerald-qilin.png',404),
  ('PET-005','พยัคฆ์อัสนีม่วง','profileCompanion',1750,'/arena/economy/catalog/pet/pet-005-violet-thunder-tiger.png',405),
  ('DE-001','โคมจันทราเมฆา','residenceDecor',100,'/arena/economy/catalog/decor/de-001-001-celestial-lantern.png',501),
  ('DE-002','เครื่องรางจันทรา','residenceDecor',180,'/arena/economy/catalog/decor/de-002-002-moon-charm.png',502),
  ('DE-003','กระถางธูปหยกบำเพ็ญ','residenceDecor',220,'/arena/economy/catalog/decor/de-003-003-jade-incense.png',503),
  ('DE-004','กระเรียนมงคลทอง','residenceDecor',350,'/arena/economy/catalog/decor/de-004-004-golden-crane.png',504),
  ('DE-005','ต้นท้อบุปผาพันปี','residenceDecor',500,'/arena/economy/catalog/decor/de-005-005-sakura-tree.png',505),
  ('DE-006','ตำหนักเมฆาสวรรค์','residenceDecor',950,'/arena/economy/catalog/decor/de-006-006-cloud-palace.png',506),
  ('DE-007','แท่นผลึกวิญญาณ','residenceDecor',800,'/arena/economy/catalog/decor/de-007-007-crystal-altar.png',507)
on conflict (sku) do nothing;

-- etc_economy: legacy flag in item views, avatar slot in unequip/friend appearance.
create or replace function etc_private.item_view(c public.etc_catalog, owned boolean, equipped boolean) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('sku', c.sku, 'name', c.name, 'slot', c.slot, 'price', c.price, 'asset', c.asset,
    'enabled', c.enabled, 'legacy', c.legacy, 'owned', owned, 'equipped', equipped) $$;
do $m$
declare src text := pg_get_functiondef('public.etc_economy(text,jsonb)'::regprocedure);
begin
  if position('''profileAvatar'',''swordSkin''' in src) = 0 then
    src := replace(src, 'not in (''swordSkin'',''portraitOutfit''', 'not in (''profileAvatar'',''swordSkin'',''portraitOutfit''');
    src := replace(src, 'e.slot in (''profileFrame'', ''profileCompanion'')', 'e.slot in (''profileAvatar'', ''profileFrame'', ''profileCompanion'')');
    if position('''profileAvatar'',''swordSkin''' in src) = 0 or position('''profileAvatar'', ''profileFrame''' in src) = 0 then raise exception 'ECONOMY_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;

-- Discoverability privacy (default: not searchable; requests accepted from people who know the code).
alter table public.etc_profiles add column if not exists searchable boolean not null default false;
alter table public.etc_profiles add column if not exists accept_requests boolean not null default true;

create table if not exists public.etc_challenges (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references public.etc_profiles(id),
  recipient uuid not null references public.etc_profiles(id),
  stage text not null check (stage ~ '^(xs|s|m|l|xl)-[1-5]$'),
  stage_version text not null,
  rules_version integer not null default 1,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created timestamptz not null default now(),
  responded timestamptz,
  expires timestamptz not null default now() + interval '7 days',
  check (sender <> recipient)
);
create unique index if not exists etc_challenges_one_pending on public.etc_challenges(least(sender,recipient), greatest(sender,recipient), stage) where status = 'pending';
create index if not exists etc_challenges_party on public.etc_challenges(recipient, status);
alter table public.etc_challenges enable row level security;
revoke all on public.etc_challenges from public, anon, authenticated;
grant select on public.etc_challenges to service_role;

-- Public-safe card for one profile (equipped cosmetics, verified rank data only from replay-proven runs).
create or replace function etc_private.player_card(uid uuid, p public.etc_profiles) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'name', case when p.hidden or p.name = '' then 'ผู้ฝึกนิรนาม' else p.name end,
    'friendCode', p.friend_code,
    'isMe', p.id = uid,
    'relation', case when p.id = uid then 'self'
      when exists (select 1 from public.etc_blocks b where (b.a = uid and b.b = p.id) or (b.a = p.id and b.b = uid)) then 'blocked'
      else coalesce((select case when f.status = 'accepted' then 'friend' when f.a = uid then 'outgoing' else 'incoming' end
        from public.etc_friends f where least(f.a, f.b) = least(uid, p.id) and greatest(f.a, f.b) = greatest(uid, p.id)), 'none') end,
    'acceptRequests', p.accept_requests,
    'online', p.presence and coalesce(p.seen > now() - interval '90 seconds', false),
    'equipped', (select coalesce(jsonb_object_agg(e.slot, jsonb_build_object('sku', c.sku, 'name', c.name, 'asset', c.asset)), '{}')
      from public.etc_equipped e join public.etc_catalog c on c.sku = e.sku where e.player = p.id)) $$;
revoke all on function etc_private.player_card(uuid, public.etc_profiles) from public, anon, authenticated;

create or replace function etc_private.proven_best(pid uuid, st text, ver text, from_t timestamptz, to_t timestamptz) returns bigint
language sql stable security definer set search_path='' as $$
  select min(total) from public.etc_runs where player = pid and scenario = st and scenario_version = ver and rules_version = 1
    and status = 'VERIFIED' and validation_version = 'cloud-independent-replay-v1' and evidence is not null and not invalid
    and graph_valid and total = elapsed + penalty and verified_at >= from_t and verified_at <= to_t $$;
revoke all on function etc_private.proven_best(uuid, text, text, timestamptz, timestamptz) from public, anon, authenticated;

create or replace function public.etc_social(action text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); me public.etc_profiles; t public.etc_profiles; ch public.etc_challenges; result jsonb; q text; friends boolean;
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into me from public.etc_profiles where id = uid;
  if me.id is null then raise exception 'PROFILE_REQUIRED'; end if;
  if me.suspended then raise exception 'SUSPENDED'; end if;
  perform etc_private.budget('social:' || uid::text, 120, 60);
  if action in ('request', 'challenge-send') then perform etc_private.budget('social-write:' || uid::text, 20, 60); end if;
  if body ? 'code' then
    select * into t from public.etc_profiles where friend_code = upper(trim(body->>'code'));
    if t.id is null or t.hidden or t.suspended or (t.id <> uid and exists (select 1 from public.etc_blocks b where (b.a = uid and b.b = t.id) or (b.a = t.id and b.b = uid))) then raise exception 'FRIEND_NOT_FOUND'; end if;
    friends := exists (select 1 from public.etc_friends f where f.status = 'accepted' and least(f.a, f.b) = least(uid, t.id) and greatest(f.a, f.b) = greatest(uid, t.id));
  elsif action in ('card', 'request', 'challenge-send') then raise exception 'FRIEND_NOT_FOUND';
  end if;

  if action = 'me' then
    return etc_private.player_card(uid, me) || jsonb_build_object('searchable', me.searchable, 'acceptRequests', me.accept_requests,
      'pendingIn', (select count(*) from public.etc_friends where b = uid and status = 'pending'),
      'challengesIn', (select count(*) from public.etc_challenges where recipient = uid and status = 'pending' and expires > now()));
  elsif action = 'settings' then
    update public.etc_profiles set searchable = coalesce((body->>'searchable')::boolean, searchable),
      accept_requests = coalesce((body->>'acceptRequests')::boolean, accept_requests) where id = uid;
    return jsonb_build_object('ok', true);
  elsif action = 'search' then
    q := trim(coalesce(body->>'q', ''));
    if char_length(q) < 2 or char_length(q) > 20 then raise exception 'INVALID_REQUEST'; end if;
    select coalesce(jsonb_agg(etc_private.player_card(uid, x) order by x.name), '[]') into result from (
      select * from public.etc_profiles x where x.id <> uid and not x.hidden and not x.suspended
        and ((x.searchable and x.name ilike '%' || replace(replace(q, '%', ''), '_', '') || '%') or x.friend_code = upper(q))
        and not exists (select 1 from public.etc_blocks b where (b.a = uid and b.b = x.id) or (b.a = x.id and b.b = uid))
      limit 20) x;
    return jsonb_build_object('players', result);
  elsif action = 'card' then
    -- Visible to self, friends, or anyone when the owner allows discovery / public listing.
    if not (t.id = uid or friends or t.searchable or t.public) then raise exception 'FRIEND_NOT_FOUND'; end if;
    return etc_private.player_card(uid, t) || jsonb_build_object(
      'stats', case when t.id = uid or friends or t.rank_public then (select jsonb_build_object('verifiedStages', count(distinct scenario), 'bestMs', min(total))
        from public.etc_runs where player = t.id and status = 'VERIFIED' and validation_version = 'cloud-independent-replay-v1' and evidence is not null and not invalid) else null end);
  elsif action = 'lists' then
    select coalesce(jsonb_agg(etc_private.player_card(uid, x) || jsonb_build_object('status', f.status, 'incoming', f.b = uid, 'since', floor(extract(epoch from f.created) * 1000)) order by f.created desc), '[]') into result
      from public.etc_friends f join public.etc_profiles x on x.id = case when f.a = uid then f.b else f.a end
      where (f.a = uid or f.b = uid) and not x.hidden and not x.suspended;
    return jsonb_build_object('people', result);
  elsif action = 'request' then
    if t.id = uid then raise exception 'SELF_REQUEST'; end if;
    perform pg_advisory_xact_lock(hashtextextended(least(uid, t.id)::text || greatest(uid, t.id)::text, 1));
    if friends then return jsonb_build_object('status', 'friend'); end if;
    if exists (select 1 from public.etc_friends where a = uid and b = t.id) then return jsonb_build_object('status', 'outgoing'); end if;
    -- Crossing invitation: the other side already asked us, so this request accepts it (one friendship only).
    update public.etc_friends set status = 'accepted' where a = t.id and b = uid and status = 'pending';
    if found then return jsonb_build_object('status', 'friend'); end if;
    if not t.accept_requests then raise exception 'REQUESTS_CLOSED'; end if;
    insert into public.etc_friends(a, b, status) values (uid, t.id, 'pending');
    return jsonb_build_object('status', 'outgoing');
  elsif action = 'challenge-send' then
    if t.id = uid or not friends then raise exception 'FRIENDS_ONLY'; end if;
    if coalesce(body->>'stage', '') !~ '^(xs|s|m|l|xl)-[1-5]$' or coalesce(body->>'version', '') = '' then raise exception 'INVALID_REQUEST'; end if;
    if not exists (select 1 from public.etc_stage_catalog where scenario = body->>'stage' and version = body->>'version' and rules_version = 1) then raise exception 'INVALID_REQUEST'; end if;
    update public.etc_challenges set status = 'cancelled', responded = now() where status = 'pending' and expires <= now()
      and least(sender, recipient) = least(uid, t.id) and greatest(sender, recipient) = greatest(uid, t.id);
    insert into public.etc_challenges(sender, recipient, stage, stage_version) values (uid, t.id, body->>'stage', body->>'version') returning * into ch;
    return jsonb_build_object('ok', true, 'id', ch.id);
  elsif action = 'challenge-respond' then
    select * into ch from public.etc_challenges where id = (body->>'id')::uuid for update;
    if ch.id is null then raise exception 'REQUEST_NOT_FOUND'; end if;
    if body->>'decision' = 'cancel' then
      if ch.sender <> uid or ch.status <> 'pending' then raise exception 'REQUEST_NOT_FOUND'; end if;
      update public.etc_challenges set status = 'cancelled', responded = now() where id = ch.id;
    else
      if ch.recipient <> uid or ch.status <> 'pending' or ch.expires <= now() then raise exception 'REQUEST_NOT_FOUND'; end if;
      update public.etc_challenges set status = case when body->>'decision' = 'accept' then 'accepted' else 'declined' end,
        responded = now(), expires = case when body->>'decision' = 'accept' then now() + interval '7 days' else expires end where id = ch.id;
    end if;
    return jsonb_build_object('ok', true);
  elsif action = 'challenges' then
    select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'stage', c.stage, 'incoming', c.recipient = uid,
        'status', case when c.status = 'pending' and c.expires <= now() then 'expired' when c.status = 'accepted' and c.expires <= now() then 'completed' else c.status end,
        'created', floor(extract(epoch from c.created) * 1000), 'expires', floor(extract(epoch from c.expires) * 1000),
        'other', etc_private.player_card(uid, o),
        'myBestMs', case when c.status = 'accepted' then etc_private.proven_best(uid, c.stage, c.stage_version, c.responded, c.expires) end,
        'otherBestMs', case when c.status = 'accepted' then etc_private.proven_best(o.id, c.stage, c.stage_version, c.responded, c.expires) end)
      order by c.created desc), '[]') into result
      from (select * from public.etc_challenges where sender = uid or recipient = uid order by created desc limit 50) c
      join public.etc_profiles o on o.id = case when c.sender = uid then c.recipient else c.sender end;
    return jsonb_build_object('challenges', result);
  end if;
  raise exception 'INVALID_ACTION';
end $$;
revoke all on function public.etc_social(text, jsonb) from public, anon, authenticated;
grant execute on function public.etc_social(text, jsonb) to authenticated;
