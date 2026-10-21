-- Review before running on etcstream production.
-- Removes only the 25 closed V19 collectibles and their ownership rows.
-- Current production impact (2026-10-21): 25 catalog rows and 25 Admin ownership rows.
-- Does not change wallets, purchase ledger, other catalog items, or player profiles.
-- Earlier deployed migrations remain unchanged; this is a corrective data migration.
do $cleanup$
declare
  legacy_skus text[] := array[
    'sword_cloud', 'sword_thunder', 'sword_jade_dragon', 'sword_flame', 'sword_frost',
    'robe_cloud', 'robe_vermilion', 'robe_night', 'robe_golden', 'robe_jade',
    'frame_moon', 'frame_gold', 'frame_fire', 'frame_purple', 'frame_ice',
    'pet_crane', 'pet_fox', 'pet_dragon', 'pet_phoenix',
    'home_pavilion', 'home_peach', 'home_bridge', 'home_lantern', 'home_banner', 'home_pedestal'
  ];
  catalog_count integer;
  eligible_count integer;
  other_owner_count integer;
  equipped_count integer;
begin
  perform 1 from public.etc_catalog where sku = any(legacy_skus) for update;

  select count(*), count(*) filter (where legacy and not enabled)
    into catalog_count, eligible_count
    from public.etc_catalog where sku = any(legacy_skus);
  if catalog_count <> 25 or eligible_count <> 25 then
    raise exception 'Legacy catalog changed; expected exactly 25 closed V19 items';
  end if;

  select count(*) into other_owner_count
    from public.etc_owned o
    left join public.etc_profiles p on p.id = o.player
    where o.sku = any(legacy_skus)
      and p.friend_code is distinct from '2E0BF31644734BCB';
  if other_owner_count <> 0 then
    raise exception 'Legacy items are owned by another player; stop before deleting';
  end if;

  select count(*) into equipped_count
    from public.etc_equipped where sku = any(legacy_skus);
  if equipped_count <> 0 then
    raise exception 'A legacy item is currently equipped; stop before deleting';
  end if;

  delete from public.etc_owned where sku = any(legacy_skus);
  delete from public.etc_catalog where sku = any(legacy_skus) and legacy and not enabled;
end
$cleanup$;
