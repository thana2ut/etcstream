-- V25: spirit seals (ตราประทับเซียน) — showcase cosmetics. ADDITIVE / idempotent:
--  * new slot 'spiritSeal' (separate from avatar, frame, cover, nameplate, rank badges);
--  * nullable catalog columns rarity/description (purely descriptive, no gameplay effect);
--  * stable SKUs SS-001..010 (on conflict do nothing); nothing is granted or equipped for anyone;
--  * no wallet, ledger, ownership or equipped row is touched. Empty slot = "no seal".
alter table public.etc_catalog add column if not exists rarity text;
alter table public.etc_catalog add column if not exists description text;
alter table public.etc_catalog drop constraint etc_catalog_slot_check;
alter table public.etc_catalog add constraint etc_catalog_slot_check check (slot in ('profileAvatar','swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor','profileCover','profileNameplate','spiritSeal'));
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (asset ~ '^/arena/(economy/(shop|catalog)|profile|profile-covers)/[a-z0-9/-]+\.png$' or asset ~ '^/arena/economy/(nameplates|spirit-seals)/[a-z0-9_-]+\.png$');

insert into public.etc_catalog(sku, name, slot, price, asset, sort, rarity, description) values
  ('SS-001', 'ผนึกมังกรเพลิงอสูร', 'spiritSeal', 1200, '/arena/economy/spirit-seals/01_crimson_demon_flame_dragon.png', 801, 'ตำนาน', 'มังกรเพลิงสีชาดโอบแกนเพลิงอัญมณี'),
  ('SS-002', 'ผนึกมังกรเหมันต์ฟ้าคราม', 'spiritSeal', 850, '/arena/economy/spirit-seals/02_azure_frost_winged_dragon.png', 802, 'มหากาพย์', 'มังกรน้ำแข็งกางปีก ปกปักผลึกคราม'),
  ('SS-003', 'ผนึกมังกรหยกพฤกษา', 'spiritSeal', 700, '/arena/economy/spirit-seals/03_emerald_jade_wood_dragon.png', 803, 'หายาก', 'มังกรหยกโอบแก่นพลังแห่งพฤกษา'),
  ('SS-004', 'ผนึกอสนีม่วงพิฆาต', 'spiritSeal', 1050, '/arena/economy/spirit-seals/04_violet_thunder_dragon.png', 804, 'มหากาพย์', 'มังกรอสนีสีม่วงเหนือแกนสายฟ้า'),
  ('SS-005', 'ผนึกสุริยันมังกรสวรรค์', 'spiritSeal', 1800, '/arena/economy/spirit-seals/05_gold_solar_heaven_dragon.png', 805, 'ตำนาน', 'มังกรทองพิทักษ์แกนสุริยัน'),
  ('SS-006', 'ผนึกมังกรทมิฬภูเขาไฟ', 'spiritSeal', 1500, '/arena/economy/spirit-seals/06_obsidian_volcanic_demon_dragon.png', 806, 'ตำนาน', 'มังกรเกล็ดทมิฬมีรอยลาวาโอบแกนภูเขาไฟ'),
  ('SS-007', 'ผนึกทวิภาคมังกรหยินหยาง', 'spiritSeal', 2400, '/arena/economy/spirit-seals/07_dual_yinyang_dragon.png', 807, 'ปฐมตำนาน', 'มังกรคู่เพลิงและเหมันต์ประชันพลัง'),
  ('SS-008', 'ผนึกหงส์มังกรอัคคี', 'spiritSeal', 2000, '/arena/economy/spirit-seals/08_phoenix_dragon_flame.png', 808, 'ตำนาน', 'มังกรปีกหงส์ครอบครองแกนเพลิง'),
  ('SS-009', 'ผนึกวารีมุกสมุทร', 'spiritSeal', 950, '/arena/economy/spirit-seals/09_turquoise_ocean_pearl_dragon.png', 809, 'มหากาพย์', 'มังกรวารีสีครามเหนือแกนไข่มุกและเกลียวคลื่น'),
  ('SS-010', 'ผนึกจันทราดารามังกร', 'spiritSeal', 1650, '/arena/economy/spirit-seals/10_moonlit_astral_guardian_dragon.png', 810, 'ตำนาน', 'มังกรจันทราสีม่วงเงินโอบดวงดาว')
on conflict (sku) do nothing;

-- Item views (market/bag/own summary) and public player cards expose rarity/description.
create or replace function etc_private.item_view(c public.etc_catalog, owned boolean, equipped boolean) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('sku', c.sku, 'name', c.name, 'slot', c.slot, 'price', c.price, 'asset', c.asset,
    'enabled', c.enabled, 'legacy', c.legacy, 'starter', c.starter, 'rarity', c.rarity, 'description', c.description,
    'owned', owned, 'equipped', equipped) $$;
do $m$
declare src text;
begin
  src := pg_get_functiondef('public.etc_economy(text,jsonb)'::regprocedure);
  if position('''profileNameplate'',''spiritSeal''' in src) = 0 then
    src := replace(src, '''profileCover'',''profileNameplate'') then raise exception', '''profileCover'',''profileNameplate'',''spiritSeal'') then raise exception');
    if position('''profileNameplate'',''spiritSeal''' in src) = 0 then raise exception 'ECONOMY_PATCH_FAILED'; end if;
    execute src;
  end if;
  src := pg_get_functiondef('etc_private.player_card(uuid,public.etc_profiles)'::regprocedure);
  if position('''rarity'', c.rarity' in src) = 0 then
    src := replace(src, 'jsonb_build_object(''sku'', c.sku, ''name'', c.name, ''asset'', c.asset)', 'jsonb_build_object(''sku'', c.sku, ''name'', c.name, ''asset'', c.asset, ''rarity'', c.rarity, ''description'', c.description)');
    if position('''rarity'', c.rarity' in src) = 0 then raise exception 'PLAYER_CARD_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
