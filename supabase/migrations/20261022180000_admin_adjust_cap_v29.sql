-- V29: admin "แก้หิน" may set any player's balance; per-adjustment cap raised from 100,000 to 1,000,000,000.
-- Still owner-only (service_role behind /admin), reason required, append-only ledger, balance can never go negative.
do $m$
declare src text := pg_get_functiondef('public.etc_economy_admin(text,jsonb)'::regprocedure);
begin
  if position('abs(amt) > 1000000000' in src) = 0 then
    src := replace(src, 'abs(amt) > 100000 then', 'abs(amt) > 1000000000 then');
    if position('abs(amt) > 1000000000' in src) = 0 then raise exception 'ADJUST_CAP_PATCH_FAILED'; end if;
    execute src;
  end if;
end $m$;
