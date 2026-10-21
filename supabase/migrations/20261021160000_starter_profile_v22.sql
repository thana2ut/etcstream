-- V22: free starter avatar + frame for every player. ADDITIVE / forward-only:
--  * no wallet, ledger, rank, friend or paid entitlement row is changed or deleted;
--  * starter ownership carries NO ledger entry (it is not a purchase) and costs nothing;
--  * NEW profiles get both items owned AND equipped (trigger, idempotent);
--  * EXISTING profiles only receive ownership (backfill) - their equipped choices are untouched;
--    an empty slot is rendered with the same default art by the client fallback.
-- NOT YET APPLIED to the cloud project: apply only with the owner's approval.

-- Catalog: allow the starter asset folder and mark starter rows (never sold, never shown in the market).
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (asset ~ '^/arena/(economy/(shop|catalog)|profile)/[a-z0-9/-]+\.png$');
alter table public.etc_catalog add column if not exists starter boolean not null default false;

-- price stays > 0 only to satisfy the existing check; enabled=false means it can never be bought.
insert into public.etc_catalog(sku, name, slot, price, asset, sort, enabled, starter) values
  ('starter-avatar', 'โปรไฟล์ผู้ฝึกเริ่มต้น', 'profileAvatar', 1, '/arena/profile/default-player-avatar.png', 1, false, true),
  ('starter-frame', 'กรอบผู้ฝึกเริ่มต้น', 'profileFrame', 1, '/arena/profile/default-player-frame.png', 2, false, true)
on conflict (sku) do nothing;

-- Ownership without a purchase: ledger_id becomes optional and the origin is recorded.
alter table public.etc_owned alter column ledger_id drop not null;
alter table public.etc_owned add column if not exists source text not null default 'purchase' check (source in ('purchase', 'starter'));
alter table public.etc_owned drop constraint if exists etc_owned_purchase_has_ledger;
alter table public.etc_owned add constraint etc_owned_purchase_has_ledger check (source <> 'purchase' or ledger_id is not null);

-- Idempotent grant. equip=true only for brand-new profiles; never overwrites an occupied slot.
create or replace function etc_private.grant_starter(p uuid, equip boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
  insert into public.etc_owned(player, sku, ledger_id, source)
    select p, c.sku, null, 'starter' from public.etc_catalog c where c.starter
    on conflict (player, sku) do nothing;
  if equip then
    insert into public.etc_equipped(player, slot, sku)
      select p, c.slot, c.sku from public.etc_catalog c where c.starter
      on conflict (player, slot) do nothing;
  end if;
end $$;
revoke all on function etc_private.grant_starter(uuid, boolean) from public, anon, authenticated;

create or replace function etc_private.starter_on_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform etc_private.grant_starter(new.id, true);
  return new;
end $$;
revoke all on function etc_private.starter_on_profile() from public, anon, authenticated;
drop trigger if exists etc_profiles_starter on public.etc_profiles;
create trigger etc_profiles_starter after insert on public.etc_profiles
  for each row execute function etc_private.starter_on_profile();

-- Existing players: ownership only (so they can pick the starter items), equipped slots untouched.
do $b$
declare r record;
begin
  for r in select id from public.etc_profiles loop perform etc_private.grant_starter(r.id, false); end loop;
end $b$;

-- Item view exposes the starter flag so the market can hide starters and the bag can label them.
create or replace function etc_private.item_view(c public.etc_catalog, owned boolean, equipped boolean) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object('sku', c.sku, 'name', c.name, 'slot', c.slot, 'price', c.price, 'asset', c.asset,
    'enabled', c.enabled, 'legacy', c.legacy, 'starter', c.starter, 'owned', owned, 'equipped', equipped) $$;
