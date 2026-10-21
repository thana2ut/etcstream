-- V28c: admin1/admin2/admin3 belong only to their own test account; the owner allowlist no longer covers them.
create or replace function etc_private.guard_reserved_name() returns trigger
language plpgsql security definer set search_path='' as $$
declare canon text := etc_private.canonical_name(new.name);
begin
  if tg_op = 'UPDATE' and new.name is not distinct from old.name then return new; end if;
  -- admin1/admin2/admin3 belong only to their own test account (not even the owner account may take them).
  if canon in ('admin1', 'admin2', 'admin3') then
    if not exists (select 1 from etc_private.test_accounts t where t.name = canon and t.player = new.id) then raise exception 'INVALID_NAME'; end if;
    return new;
  end if;
  if exists (select 1 from etc_private.reserved_names r where r.canonical = canon)
     and not exists (select 1 from etc_private.reserved_name_owners o where o.player = new.id) then
    raise exception 'INVALID_NAME';
  end if;
  return new;
end $$;
