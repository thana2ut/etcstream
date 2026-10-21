-- V24: compact profile nameplate backgrounds (header pill). ADDITIVE / idempotent:
--  * new slot 'profileNameplate' (separate from avatar, frame and the V23 profileCover);
--  * stable SKUs NP-001..010 (on conflict do nothing); no wallet/ledger/ownership/equip row is touched;
--  * "default background" = empty profileNameplate slot (free); nothing paid is granted or equipped.
alter table public.etc_catalog drop constraint etc_catalog_slot_check;
alter table public.etc_catalog add constraint etc_catalog_slot_check check (slot in ('profileAvatar','swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor','profileCover','profileNameplate'));
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (asset ~ '^/arena/(economy/(shop|catalog)|profile|profile-covers)/[a-z0-9/-]+\.png$' or asset ~ '^/arena/economy/nameplates/[a-z0-9_-]+\.png$');

insert into public.etc_catalog(sku, name, slot, price, asset, sort) values
  ('NP-001', 'ปกหงส์เพลิงโลหิต', 'profileNameplate', 450, '/arena/economy/nameplates/01_crimson_phoenix.png', 701),
  ('NP-002', 'ปกมังกรจันทราคราม', 'profileNameplate', 400, '/arena/economy/nameplates/02_azure_moon_dragon.png', 702),
  ('NP-003', 'ปกบุปผาจันทราม่วง', 'profileNameplate', 550, '/arena/economy/nameplates/03_violet_moon_wisteria.png', 703),
  ('NP-004', 'ปกวิมานสุริยันทอง', 'profileNameplate', 750, '/arena/economy/nameplates/04_golden_celestial_palace.png', 704),
  ('NP-005', 'ปกแดนซากุระสวรรค์', 'profileNameplate', 350, '/arena/economy/nameplates/05_pink_sakura_heaven.png', 705),
  ('NP-006', 'ปกราหูทองทมิฬ', 'profileNameplate', 900, '/arena/economy/nameplates/06_black_gold_eclipse.png', 706),
  ('NP-007', 'ปกไผ่หยกหมอกเซียน', 'profileNameplate', 400, '/arena/economy/nameplates/07_emerald_bamboo_mist.png', 707),
  ('NP-008', 'ปกแดนผลึกเหมันต์', 'profileNameplate', 650, '/arena/economy/nameplates/08_frost_crystal_realm.png', 708),
  ('NP-009', 'ปกสมุทรมุกคราม', 'profileNameplate', 600, '/arena/economy/nameplates/09_aqua_pearl_ocean.png', 709),
  ('NP-010', 'ปกดาราจักรอเมทิสต์', 'profileNameplate', 1200, '/arena/economy/nameplates/10_amethyst_cosmos.png', 710)
on conflict (sku) do nothing;

-- etc_economy: allow unequipping the nameplate (back to default) and expose friends' nameplates.
do $m$
declare src text := pg_get_functiondef('public.etc_economy(text,jsonb)'::regprocedure);
begin
  if position('''profileCover'',''profileNameplate''' in src) = 0 then
    src := replace(src, '''residenceDecor'',''profileCover'') then raise exception', '''residenceDecor'',''profileCover'',''profileNameplate'') then raise exception');
    src := replace(src, '''profileCompanion'', ''profileCover'')', '''profileCompanion'', ''profileCover'', ''profileNameplate'')');
    if position('''profileCover'',''profileNameplate''' in src) = 0 or position('''profileCover'', ''profileNameplate''' in src) = 0 then raise exception 'ECONOMY_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
