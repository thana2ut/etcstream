-- Additive, rerun-safe import for ten standardized 2048x682 profile covers.
-- Deploy matching PNGs under public/arena/profile-covers/ before applying this migration.
-- Existing product rows, balances, purchases, ownership, and equipped covers are untouched.

do $$
begin
  if exists (
    select 1 from public.etc_catalog
    where sku in ('COVER-021','COVER-022','COVER-023','COVER-024','COVER-025','COVER-026','COVER-027','COVER-028','COVER-029','COVER-030')
      and stable_batch_key is distinct from case sku
        when 'COVER-021' then 'profile-cover-2048x682-021'
        when 'COVER-022' then 'profile-cover-2048x682-022'
        when 'COVER-023' then 'profile-cover-2048x682-023'
        when 'COVER-024' then 'profile-cover-2048x682-024'
        when 'COVER-025' then 'profile-cover-2048x682-025'
        when 'COVER-026' then 'profile-cover-2048x682-026'
        when 'COVER-027' then 'profile-cover-2048x682-027'
        when 'COVER-028' then 'profile-cover-2048x682-028'
        when 'COVER-029' then 'profile-cover-2048x682-029'
        when 'COVER-030' then 'profile-cover-2048x682-030'
      end
  ) then
    raise exception 'Profile cover batch SKU collision: existing SKU belongs to another product';
  end if;

  if exists (
    select 1 from public.etc_catalog
    where stable_batch_key in ('profile-cover-2048x682-021','profile-cover-2048x682-022','profile-cover-2048x682-023','profile-cover-2048x682-024','profile-cover-2048x682-025','profile-cover-2048x682-026','profile-cover-2048x682-027','profile-cover-2048x682-028','profile-cover-2048x682-029','profile-cover-2048x682-030')
      and sku is distinct from case stable_batch_key
        when 'profile-cover-2048x682-021' then 'COVER-021'
        when 'profile-cover-2048x682-022' then 'COVER-022'
        when 'profile-cover-2048x682-023' then 'COVER-023'
        when 'profile-cover-2048x682-024' then 'COVER-024'
        when 'profile-cover-2048x682-025' then 'COVER-025'
        when 'profile-cover-2048x682-026' then 'COVER-026'
        when 'profile-cover-2048x682-027' then 'COVER-027'
        when 'profile-cover-2048x682-028' then 'COVER-028'
        when 'profile-cover-2048x682-029' then 'COVER-029'
        when 'profile-cover-2048x682-030' then 'COVER-030'
      end
  ) then
    raise exception 'Profile cover batch key collision: key belongs to another SKU';
  end if;
end $$;

with inserted as (
  insert into public.etc_catalog
    (sku, name, description, slot, rarity, price, asset, sort, status, enabled, tradable, legacy, starter, created_by, stable_batch_key)
  values
    ('COVER-021','ปกจันทราวิมานคราม','ตำหนักเมฆาครามใต้แสงจันทร์ โอบล้อมด้วยขอบเมฆสีทอง','profileCover',null,650,'/arena/profile-covers/cover-021-azure-moon-palace.png',621,'published',true,false,false,false,'owner','profile-cover-2048x682-021'),
    ('COVER-022','ปกหยกไผ่เร้นเมฆ','ป่าไผ่หยกและหมอกเซียนในแดนเร้นลับ','profileCover',null,720,'/arena/profile-covers/cover-022-emerald-jade-bamboo.png',622,'published',true,false,false,false,'owner','profile-cover-2048x682-022'),
    ('COVER-023','ปกหงส์เพลิงราชัน','หงส์เพลิงสีชาดและทองผู้แผ่รัศมีเหนือวิมาน','profileCover',null,1050,'/arena/profile-covers/cover-023-crimson-phoenix-king.png',623,'published',true,false,false,false,'owner','profile-cover-2048x682-023'),
    ('COVER-024','ปกวิสทีเรียจันทราม่วง','บุปผาวิสทีเรียสีม่วงพลิ้วไหวใต้แสงจันทรา','profileCover',null,850,'/arena/profile-covers/cover-024-violet-wisteria-moon.png',624,'published',true,false,false,false,'owner','profile-cover-2048x682-024'),
    ('COVER-025','ปกผลึกเหมันต์นิรันดร์','ผลึกน้ำแข็งนิรันดร์เรืองแสงท่ามกลางหิมะ','profileCover',null,900,'/arena/profile-covers/cover-025-eternal-frost-crystal.png',625,'published',true,false,false,false,'owner','profile-cover-2048x682-025'),
    ('COVER-026','ปกบุปผาวสันต์','กลีบซากุระสีชมพูเบ่งบานรับสายลมวสันต์','profileCover',null,800,'/arena/profile-covers/cover-026-spring-blossoms.png',626,'published',true,false,false,false,'owner','profile-cover-2048x682-026'),
    ('COVER-027','ปกสุริยคราสทมิฬ','วงแหวนสุริยคราสสีดำทองแผ่พลังเหนือเมฆา','profileCover',null,1150,'/arena/profile-covers/cover-027-dark-solar-eclipse.png',627,'published',true,false,false,false,'owner','profile-cover-2048x682-027'),
    ('COVER-028','ปกมุกสมุทรสวรรค์','ไข่มุกสีเทอร์ควอยซ์ส่องประกายเหนือสมุทรสวรรค์','profileCover',null,950,'/arena/profile-covers/cover-028-celestial-pearl-ocean.png',628,'published',true,false,false,false,'owner','profile-cover-2048x682-028'),
    ('COVER-029','ปกวิมานอรุณเหนือเมฆา','วิมานลอยฟ้าสีทองรับแสงอรุณเหนือทะเลเมฆ','profileCover',null,1100,'/arena/profile-covers/cover-029-cloud-dawn-palace.png',629,'published',true,false,false,false,'owner','profile-cover-2048x682-029'),
    ('COVER-030','ปกจักรวาลผลึกดารา','ผลึกดาราจักรหลากสีเปล่งประกายกลางห้วงจักรวาล','profileCover',null,1250,'/arena/profile-covers/cover-030-galactic-crystal.png',630,'published',true,false,false,false,'owner','profile-cover-2048x682-030')
  on conflict (stable_batch_key) where stable_batch_key is not null do nothing
  returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-create:published', 'profile-covers-2048x682-batch-01', 'เพิ่มปกโปรไฟล์ 10 รายการ (COVER-021–COVER-030)'
where exists (select 1 from inserted);