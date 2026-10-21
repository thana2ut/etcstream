-- V26 active competition roster reset. DO NOT APPLY until the owner confirms the preserved profile id and the
-- dry-run counts below. Single transaction; aborts if the counts no longer match the confirmed dry-run.
-- Preserved owner profile (= Supabase Auth user id): 49bad05a-38ae-49ae-b8b1-b2318b2d98fc (friend code 2E0BF316...)
-- Dry-run (2026-10-21): other profiles 20 (all public, seed-only) · their runs 196 (all preview-seed)
--   friend rows touching them 7 (all with the owner) · their purchases/ledger/wallets 0 · auth users untouched.
-- Restore: rows are copied to etc_private.archive_v26_* first; restore = update/insert back from those tables.
begin;
do $r$
declare owner constant uuid := '49bad05a-38ae-49ae-b8b1-b2318b2d98fc';
begin
  if not exists (select 1 from public.etc_profiles where id = owner) then raise exception 'OWNER_NOT_FOUND'; end if;
  if (select count(*) from public.etc_profiles where id <> owner) <> 20
     or (select count(*) from public.etc_runs where player <> owner) <> 196
     or (select count(*) from public.etc_friends where a <> owner and b <> owner) <> 0
     or (select count(*) from public.etc_ledger where player <> owner) <> 0 then
    raise exception 'DRY_RUN_MISMATCH: data changed since the confirmed dry-run';
  end if;

  -- 1) Snapshot (private schema, no client grants).
  create table etc_private.archive_v26_profiles as select * from public.etc_profiles where id <> owner;
  create table etc_private.archive_v26_runs as select * from public.etc_runs where player <> owner;
  create table etc_private.archive_v26_friends as select * from public.etc_friends;
  create table etc_private.archive_v26_challenges as select * from public.etc_challenges;
  revoke all on etc_private.archive_v26_profiles, etc_private.archive_v26_runs, etc_private.archive_v26_friends, etc_private.archive_v26_challenges from public, anon, authenticated;

  -- 2) Remove every other identity from the ACTIVE roster (no Auth/financial deletion).
  update public.etc_profiles set hidden = true, public = false, presence = false, rank_public = false, searchable = false,
    accept_requests = false, name = '', name_locked = false, seen = null where id <> owner;
  update public.etc_runs set invalid = true where player <> owner and not invalid;
  delete from public.etc_friends where a <> owner or b <> owner;  -- every row here involves a seed profile
  delete from public.etc_challenges where sender <> owner or recipient <> owner;

  -- 3) Bind the reserved display name to the confirmed owner only; unique active names from now on.
  insert into etc_private.reserved_name_owners(player) values (owner) on conflict do nothing;
  insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'v26-roster-reset', owner::text, 'Active competition roster reset after owner-confirmed dry-run; archived to etc_private.archive_v26_*');
end $r$;
create unique index if not exists etc_profiles_active_name on public.etc_profiles (etc_private.canonical_name(name)) where not hidden and name <> '';
commit;
