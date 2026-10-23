-- APPLIED TO PRODUCTION: owner-approved restoration of the V23 profile-cover catalog (2026-10-24).
--
-- This change affects only profile-cover catalog rows.
-- It hides new cover batches COVER-011..COVER-030 from new marketplace purchases
-- by setting enabled=false and status='unpublished'. Existing ownership, purchase
-- receipts, equipped selections, balances, and ledger entries are preserved.
-- The original COVER-001..COVER-010 rows retain their current prices and sorting,
-- so the previous market-wide price update remains in effect for these products.
-- No cover rows or image assets are deleted.
--
-- This file records the corrective SQL already applied through the Supabase connection.

begin;

do $$
declare
  original_count integer;
  added_count integer;
begin
  select count(*) into original_count
  from public.etc_catalog
  where sku between 'COVER-001' and 'COVER-010'
    and slot = 'profileCover';

  select count(*) into added_count
  from public.etc_catalog
  where sku between 'COVER-011' and 'COVER-030'
    and slot = 'profileCover';

  if original_count <> 10 or added_count <> 20 then
    raise exception 'Profile-cover restore stopped: expected 10 original and 20 added covers (found % and %).', original_count, added_count;
  end if;
end $$;

with hidden as (
  update public.etc_catalog
  set enabled = false,
      status = 'unpublished',
      updated = now()
  where slot = 'profileCover'
    and sku between 'COVER-011' and 'COVER-030'
    and (enabled is distinct from false or status is distinct from 'unpublished')
  returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select
  'owner',
  'catalog-unpublish:profile-covers',
  'profile-covers-v23-restore',
  format('คืนตลาดปกโปรไฟล์ชุดเดิม; ปิดขายปกใหม่ %s รายการโดยเก็บสิทธิ์ผู้ถือครองไว้', count(*))
from hidden
having count(*) > 0;

commit;
