-- One-time data correction for the single account shown by friend code 2E0BF31644734BCB.
-- Review before running in the SQL Editor of project etcstream (unohixcxthiilnkmjunc).
-- Effect: display name แอดมิน -> Admin; spirit stones 999978698 -> 99.
-- The debit is recorded in etc_ledger and etc_admin_audit. No schema migration.

begin;

do $$
declare
  target_id constant uuid := '49bad05a-38ae-49ae-b8b1-b2318b2d98fc';
  old_balance constant bigint := 999978698;
  new_balance constant bigint := 99;
  profile_row public.etc_profiles;
  wallet_row public.etc_wallets;
  entry public.etc_ledger;
begin
  select * into profile_row
    from public.etc_profiles
    where id = target_id and friend_code = '2E0BF31644734BCB'
    for update;
  if profile_row.id is null or profile_row.name is distinct from 'แอดมิน' then
    raise exception 'Target profile or prior name differs; no changes made';
  end if;

  select * into wallet_row
    from public.etc_wallets
    where player = target_id
    for update;
  if wallet_row.player is null or wallet_row.balance <> old_balance then
    raise exception 'Prior wallet balance differs; no changes made';
  end if;

  if not exists (
    select 1 from etc_private.reserved_name_owners where player = target_id
  ) then
    raise exception 'Target is not allowed to use the reserved name Admin';
  end if;

  update public.etc_profiles set name = 'Admin' where id = target_id;
  insert into public.etc_admin_audit(actor, action, target, reason)
    values ('owner', 'rename', target_id::text,
      'Owner requested display name Admin for friend code 2E0BF31644734BCB');

  entry := etc_private.post(
    target_id, new_balance - old_balance, 'admin_adjust', 'admin',
    'admin:owner-correction-2E0BF31644734BCB-to-99-2026-10-21',
    jsonb_build_object('reason', 'Owner requested exact balance 99 for this account')
  );
  if entry.balance_after <> new_balance then
    raise exception 'Resulting balance differs; no changes made';
  end if;
  insert into public.etc_admin_audit(actor, action, target, reason)
    values ('owner', 'economy-adjust:' || (new_balance - old_balance), target_id::text,
      'Owner requested exact balance 99 · ledger ' || entry.id);
end $$;

commit;

-- Read-only verification after committing:
-- select p.friend_code, p.name, w.balance from public.etc_profiles p
-- join public.etc_wallets w on w.player = p.id
-- where p.id = '49bad05a-38ae-49ae-b8b1-b2318b2d98fc';
