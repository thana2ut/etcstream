-- V23: profile cover cosmetics (3:1 background of the large profile card). ADDITIVE / idempotent:
--  * new slot 'profileCover' and 10 stable SKUs COVER-001..010 (on conflict do nothing: rerun-safe);
--  * no wallet, ledger, ownership or equipped row of any other item is touched;
--  * the free "default cover" is simply an empty profileCover slot (client renders the navy card);
--    nothing paid is ever granted or equipped by this migration.
alter table public.etc_catalog drop constraint etc_catalog_slot_check;
alter table public.etc_catalog add constraint etc_catalog_slot_check check (slot in ('profileAvatar','swordSkin','portraitOutfit','profileFrame','profileCompanion','residenceDecor','profileCover'));
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (asset ~ '^/arena/(economy/(shop|catalog)|profile|profile-covers)/[a-z0-9/-]+\.png$');

insert into public.etc_catalog(sku, name, slot, price, asset, sort) values
  ('COVER-001', 'ปกวิมานเมฆาคราม', 'profileCover', 250, '/arena/profile-covers/cover-001-azure-cloud-palace.png', 601),
  ('COVER-002', 'ปกแดนไผ่หยก', 'profileCover', 350, '/arena/profile-covers/cover-002-emerald-bamboo-realm.png', 602),
  ('COVER-003', 'ปกหงส์เพลิงชาด', 'profileCover', 550, '/arena/profile-covers/cover-003-crimson-phoenix-flame.png', 603),
  ('COVER-004', 'ปกจันทราบุปผาม่วง', 'profileCover', 500, '/arena/profile-covers/cover-004-violet-moon-wisteria.png', 604),
  ('COVER-005', 'ปกแดนผลึกเหมันต์', 'profileCover', 600, '/arena/profile-covers/cover-005-frost-crystal-domain.png', 605),
  ('COVER-006', 'ปกวังสวรรค์สุริยัน', 'profileCover', 750, '/arena/profile-covers/cover-006-golden-heavenly-court.png', 606),
  ('COVER-007', 'ปกวสันต์บุปผาสวรรค์', 'profileCover', 450, '/arena/profile-covers/cover-007-peach-blossom-dream.png', 607),
  ('COVER-008', 'ปกรัตติกาลทองดำ', 'profileCover', 850, '/arena/profile-covers/cover-008-obsidian-golden-night.png', 608),
  ('COVER-009', 'ปกสมุทรมุกคราม', 'profileCover', 700, '/arena/profile-covers/cover-009-turquoise-pearl-sea.png', 609),
  ('COVER-010', 'ปกผลึกดาราจักร', 'profileCover', 1200, '/arena/profile-covers/cover-010-prismatic-celestial-crystal.png', 610)
on conflict (sku) do nothing;

-- etc_economy: allow unequipping the cover slot (back to the free default) and expose friends' covers.
-- Purchase/equip paths are unchanged: price from the DB row, ownership checked before equip, atomic ledger.
do $m$
declare src text := pg_get_functiondef('public.etc_economy(text,jsonb)'::regprocedure);
begin
  if position('''residenceDecor'',''profileCover''' in src) = 0 then
    src := replace(src, '''profileCompanion'',''residenceDecor'') then raise exception', '''profileCompanion'',''residenceDecor'',''profileCover'') then raise exception');
    src := replace(src, 'e.slot in (''profileAvatar'', ''profileFrame'', ''profileCompanion'')', 'e.slot in (''profileAvatar'', ''profileFrame'', ''profileCompanion'', ''profileCover'')');
    if position('''residenceDecor'',''profileCover''' in src) = 0 or position('''profileCompanion'', ''profileCover''' in src) = 0 then raise exception 'ECONOMY_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
