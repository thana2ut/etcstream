-- Update only the ten published spirit-seal prices shown on /arena/market.
-- Price tiers preserve the existing ascending-price order, from 3,000 to 20,000.

do $$
declare
  invalid_count integer;
begin
  select count(*)
    into invalid_count
  from (values
    ('SS-003',  700,  3000),
    ('SS-002',  850,  5000),
    ('SS-009',  950,  7000),
    ('SS-004', 1050,  9000),
    ('SS-001', 1200, 11000),
    ('SS-006', 1500, 13000),
    ('SS-010', 1650, 15000),
    ('SS-005', 1800, 17000),
    ('SS-008', 2000, 19000),
    ('SS-007', 2400, 20000)
  ) as expected(sku, old_price, new_price)
  left join public.etc_catalog as catalog using (sku)
  where catalog.sku is null
     or catalog.slot is distinct from 'spiritSeal'
     or catalog.status is distinct from 'published'
     or catalog.enabled is distinct from true
     or catalog.price not in (expected.old_price, expected.new_price);

  if invalid_count <> 0 then
    raise exception 'Spirit-seal price update stopped: % catalog row(s) do not match expected SKU, status, or price.', invalid_count;
  end if;

  if (select count(*) from public.etc_catalog where sku in (
    'SS-003','SS-002','SS-009','SS-004','SS-001',
    'SS-006','SS-010','SS-005','SS-008','SS-007'
  )) <> 10 then
    raise exception 'Spirit-seal price update stopped: expected exactly ten target SKUs.';
  end if;
end $$;

with expected(sku, old_price, new_price) as (
  values
    ('SS-003',  700,  3000),
    ('SS-002',  850,  5000),
    ('SS-009',  950,  7000),
    ('SS-004', 1050,  9000),
    ('SS-001', 1200, 11000),
    ('SS-006', 1500, 13000),
    ('SS-010', 1650, 15000),
    ('SS-005', 1800, 17000),
    ('SS-008', 2000, 19000),
    ('SS-007', 2400, 20000)
), changed as (
  update public.etc_catalog as catalog
     set price = expected.new_price,
         updated = now()
    from expected
   where catalog.sku = expected.sku
     and catalog.slot = 'spiritSeal'
     and catalog.status = 'published'
     and catalog.enabled = true
     and catalog.price = expected.old_price
  returning catalog.sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-update:published', 'spirit-seals-price-range-20261024',
       'ปรับราคาตราประทับเซียน 10 รายการให้อยู่ในช่วง 3,000–20,000'
where exists (select 1 from changed);
