-- V28: three owner test accounts (admin1/admin2/admin3). ADDITIVE.
--  * The names are reserved: only the server claim route (code checked against ADMIN_TEST_CLAIM_HASH) can use them.
--  * Each is a normal player profile seeded once with 500,000 spirit stones (idempotent ledger key).
create table if not exists etc_private.test_accounts (name text primary key check (name in ('admin1', 'admin2', 'admin3')), player uuid not null unique);
revoke all on etc_private.test_accounts from public, anon, authenticated;

insert into etc_private.reserved_names(canonical) values ('admin1'), ('admin2'), ('admin3') on conflict do nothing;

create or replace function public.etc_test_account(operation text, account text, target uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare found_player uuid;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'FORBIDDEN'; end if;
  if account not in ('admin1', 'admin2', 'admin3') then raise exception 'INVALID_REQUEST'; end if;
  if operation = 'get' then
    select player into found_player from etc_private.test_accounts where name = account;
    return jsonb_build_object('player', found_player);
  elsif operation = 'setup' then
    insert into etc_private.test_accounts(name, player) values (account, target) on conflict (name) do nothing;
    select player into found_player from etc_private.test_accounts where name = account;
    if found_player is distinct from target then raise exception 'INVALID_REQUEST'; end if;
    -- Owner rows reference a profile, and the reserved-name guard needs the owner row: create, grant, then rename.
    insert into public.etc_profiles(id, name) values (target, 'ผู้ทดสอบ ' || right(account, 1)) on conflict (id) do nothing;
    insert into etc_private.reserved_name_owners(player) values (target) on conflict do nothing;
    update public.etc_profiles set name = account where id = target and name is distinct from account;
    if not exists (select 1 from public.etc_ledger where idem_key = 'test-seed:' || target) then
      perform etc_private.post(target, 500000, 'admin_adjust', 'admin', 'test-seed:' || target, jsonb_build_object('reason', 'บัญชีทดสอบ ' || account));
      insert into public.etc_admin_audit(actor, action, target, reason) values ('owner', 'test-account-seed:500000', target::text, 'บัญชีทดสอบ ' || account);
    end if;
    return jsonb_build_object('ok', true);
  end if;
  raise exception 'INVALID_ACTION';
end $$;
revoke all on function public.etc_test_account(text, text, uuid) from public, anon, authenticated;
grant execute on function public.etc_test_account(text, text, uuid) to service_role;
