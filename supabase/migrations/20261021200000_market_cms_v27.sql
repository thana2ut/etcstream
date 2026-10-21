-- V27: admin-managed live marketplace (CMS). ADDITIVE + idempotent.
--  * etc_catalog gains status/created/created_by; `enabled` (what the purchase RPC checks) stays the single
--    "can be bought" switch and is kept in sync with status by trigger (published <=> enabled).
--  * New items may use images uploaded to the public-read Storage bucket `catalog-media` (server-only writes).
--  * etc_catalog_admin(): service_role-only list/save/status with audit. No row is deleted; archive/unpublish
--    never touch etc_owned / etc_equipped / etc_ledger, so owners keep and display their items.
-- Rollback: drop function etc_catalog_admin, trigger etc_catalog_status_sync; columns can stay (unused).

alter table public.etc_catalog add column if not exists status text;
alter table public.etc_catalog add column if not exists created timestamptz not null default now();
alter table public.etc_catalog add column if not exists created_by text;
update public.etc_catalog set status = case when legacy then 'archived' when enabled then 'published' else 'unpublished' end where status is null;
alter table public.etc_catalog alter column status set default 'draft';
alter table public.etc_catalog alter column status set not null;
alter table public.etc_catalog drop constraint if exists etc_catalog_status_check;
alter table public.etc_catalog add constraint etc_catalog_status_check check (status in ('draft', 'published', 'unpublished', 'archived'));

-- Uploaded media lives in Supabase Storage; legacy/static art keeps its existing paths.
alter table public.etc_catalog drop constraint etc_catalog_asset_check;
alter table public.etc_catalog add constraint etc_catalog_asset_check check (
  asset ~ '^/arena/(economy/(shop|catalog)|profile|profile-covers)/[a-z0-9/-]+\.png$'
  or asset ~ '^/arena/economy/(nameplates|spirit-seals)/[a-z0-9_-]+\.png$'
  or asset ~ '^https://unohixcxthiilnkmjunc\.supabase\.co/storage/v1/object/public/catalog-media/items/[a-f0-9-]{36}\.(png|jpg|webp|gif)$');

-- status <-> enabled stay consistent whichever one an existing admin path changes.
create or replace function etc_private.catalog_status_sync() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    -- Legacy-style seeds insert enabled=true without a status: treat them as published.
    if new.enabled and new.status = 'draft' then new.status := 'published'; else new.enabled := (new.status = 'published'); end if;
  elsif new.status is distinct from old.status then
    new.enabled := (new.status = 'published');
  elsif new.enabled is distinct from old.enabled then
    new.status := case when new.enabled then 'published' else 'unpublished' end;
  end if;
  if new.status = 'published' and (new.legacy or new.starter) then raise exception 'NOT_SELLABLE'; end if;
  return new;
end $$;
revoke all on function etc_private.catalog_status_sync() from public, anon, authenticated;
drop trigger if exists etc_catalog_status_sync on public.etc_catalog;
create trigger etc_catalog_status_sync before insert or update on public.etc_catalog for each row execute function etc_private.catalog_status_sync();

-- Media bucket: public read (storefront images), no client write policies (server uploads with the secret key).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-media', 'catalog-media', true, 4194304, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create or replace function public.etc_catalog_admin(operation text, body jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare c public.etc_catalog; new_sku text; result jsonb; reason text := trim(coalesce(body->>'reason', '')); before jsonb;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;

  if operation = 'list' then
    select coalesce(jsonb_agg(jsonb_build_object(
        'sku', x.sku, 'name', x.name, 'description', x.description, 'slot', x.slot, 'rarity', x.rarity, 'price', x.price,
        'asset', x.asset, 'sort', x.sort, 'status', x.status, 'legacy', x.legacy, 'starter', x.starter,
        'created', floor(extract(epoch from x.created) * 1000), 'updated', floor(extract(epoch from x.updated) * 1000),
        'purchases', (select count(*) from public.etc_ledger l where l.kind = 'purchase' and l.source = x.sku),
        'owners', (select count(*) from public.etc_owned o where o.sku = x.sku)) order by x.slot, x.sort, x.sku), '[]') into result
      from public.etc_catalog x;
    return jsonb_build_object('items', result);

  elsif operation = 'save' then
    if char_length(trim(coalesce(body->>'name', ''))) not between 2 and 60 then raise exception 'INVALID_NAME'; end if;
    if body->>'slot' not in ('profileAvatar','swordSkin','profileFrame','profileCompanion','residenceDecor','profileCover','profileNameplate','spiritSeal') then raise exception 'INVALID_SLOT'; end if;
    if coalesce(body->>'status', 'draft') not in ('draft', 'published', 'unpublished', 'archived') then raise exception 'INVALID_STATUS'; end if;
    if (body->>'price') is null or (body->>'price')::integer not between 1 and 1000000 then raise exception 'INVALID_PRICE'; end if;
    if char_length(coalesce(body->>'description', '')) > 500 or char_length(coalesce(body->>'rarity', '')) > 30 then raise exception 'INVALID_TEXT'; end if;
    if coalesce(body->>'sku', '') = '' then
      loop
        new_sku := 'ITEM-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
        exit when not exists (select 1 from public.etc_catalog where sku = new_sku);
      end loop;
      insert into public.etc_catalog(sku, name, description, slot, rarity, price, asset, sort, status, enabled, created_by)
        values (new_sku, trim(body->>'name'), nullif(trim(coalesce(body->>'description', '')), ''), body->>'slot', nullif(trim(coalesce(body->>'rarity', '')), ''),
          (body->>'price')::integer, body->>'asset', coalesce((body->>'sort')::integer, 900), coalesce(body->>'status', 'draft'), coalesce(body->>'status', 'draft') = 'published', 'owner')
        returning * into c;
      insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'catalog-create:' || c.status, c.sku, 'สร้างสินค้า ' || c.name);
    else
      select * into c from public.etc_catalog where sku = body->>'sku' for update;
      if c.sku is null then raise exception 'ITEM_UNAVAILABLE'; end if;
      if c.legacy or c.starter then raise exception 'NOT_SELLABLE'; end if;
      -- An item already owned keeps its slot (equipped references depend on it).
      if c.slot <> body->>'slot' and exists (select 1 from public.etc_owned where sku = c.sku) then raise exception 'SLOT_LOCKED'; end if;
      before := jsonb_build_object('name', c.name, 'price', c.price, 'status', c.status, 'slot', c.slot, 'asset', c.asset);
      update public.etc_catalog set name = trim(body->>'name'), description = nullif(trim(coalesce(body->>'description', '')), ''), slot = body->>'slot',
        rarity = nullif(trim(coalesce(body->>'rarity', '')), ''), price = (body->>'price')::integer, asset = body->>'asset',
        sort = coalesce((body->>'sort')::integer, sort), status = coalesce(body->>'status', status), updated = now()
        where sku = c.sku returning * into c;
      insert into public.etc_admin_audit(actor, action, target, reason)
        values ('owner', 'catalog-update:' || c.status, c.sku, left('แก้ไขสินค้า · เดิม ' || before::text, 500));
    end if;
    return jsonb_build_object('ok', true, 'sku', c.sku, 'status', c.status);

  elsif operation = 'status' then
    if body->>'status' not in ('draft', 'published', 'unpublished', 'archived') then raise exception 'INVALID_STATUS'; end if;
    if body->>'status' in ('unpublished', 'archived') and char_length(reason) < 5 then raise exception 'REASON_REQUIRED'; end if;
    update public.etc_catalog set status = body->>'status', updated = now() where sku = body->>'sku' returning * into c;
    if c.sku is null then raise exception 'ITEM_UNAVAILABLE'; end if;
    insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'catalog-status:' || c.status, c.sku, coalesce(nullif(reason, ''), 'เปลี่ยนสถานะเป็น ' || c.status));
    return jsonb_build_object('ok', true, 'sku', c.sku, 'status', c.status);
  end if;
  raise exception 'INVALID_ACTION';
end $$;
revoke all on function public.etc_catalog_admin(text, jsonb) from public, anon, authenticated;
grant execute on function public.etc_catalog_admin(text, jsonb) to service_role;
