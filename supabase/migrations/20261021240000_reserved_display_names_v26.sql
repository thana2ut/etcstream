-- V26a: reserved display names (admin / แอดมิน and close variants) enforced at the DATABASE boundary,
-- so no RPC, API or direct write can create or rename into them unless the profile id is on an
-- owner-managed allowlist. A display name NEVER grants /admin rights (role checks never read names).
-- Non-destructive: existing names are not changed; the trigger only runs when a name is set/changed.
create or replace function etc_private.canonical_name(n text) returns text
language sql immutable set search_path='' as $$
  select lower(regexp_replace(regexp_replace(normalize(coalesce(n, ''), NFKC), '[​-‍⁠﻿­]', '', 'g'), '[[:space:][:punct:]]+', '', 'g')) $$;
revoke all on function etc_private.canonical_name(text) from public, anon, authenticated;

create table if not exists etc_private.reserved_names (canonical text primary key);
insert into etc_private.reserved_names(canonical) values ('admin'), ('administrator'), ('แอดมิน'), ('แอดมิ้น'), ('ผู้ดูแล'), ('ผู้ดูแลระบบ'), ('ระบบ')
on conflict do nothing;
-- Owner-managed allowlist (bound to the immutable profile/Auth id, filled only after owner confirmation).
create table if not exists etc_private.reserved_name_owners (player uuid primary key references public.etc_profiles(id), granted timestamptz not null default now());
revoke all on etc_private.reserved_names, etc_private.reserved_name_owners from public, anon, authenticated;

create or replace function etc_private.guard_reserved_name() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op = 'UPDATE' and new.name is not distinct from old.name then return new; end if;
  if exists (select 1 from etc_private.reserved_names r where r.canonical = etc_private.canonical_name(new.name))
     and not exists (select 1 from etc_private.reserved_name_owners o where o.player = new.id) then
    raise exception 'INVALID_NAME';   -- mapped to a generic Thai message by the API
  end if;
  return new;
end $$;
revoke all on function etc_private.guard_reserved_name() from public, anon, authenticated;
drop trigger if exists etc_profiles_reserved_name on public.etc_profiles;
create trigger etc_profiles_reserved_name before insert or update of name on public.etc_profiles
  for each row execute function etc_private.guard_reserved_name();
