-- V28b: server-side check "is this player one of the owner test accounts (admin1/admin2/admin3)?"
-- Used only to unlock all mission rooms and pre-pack the level's cables for those three accounts.
create or replace function public.etc_is_test_account(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from etc_private.test_accounts where player = target) $$;
revoke all on function public.etc_is_test_account(uuid) from public, anon, authenticated;
grant execute on function public.etc_is_test_account(uuid) to service_role;
