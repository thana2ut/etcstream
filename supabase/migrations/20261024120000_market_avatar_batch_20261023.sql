-- Additive, idempotent release for the 2026-10-23 celestial avatar batch.
-- Upload the ten original PNGs to these immutable object paths in catalog-media
-- before applying this migration. This migration does not touch wallets,
-- ownership, equipped items, purchases, or existing catalog rows.

alter table public.etc_catalog
  add column if not exists stable_batch_key text;

create unique index if not exists etc_catalog_stable_batch_key_uidx
  on public.etc_catalog (stable_batch_key)
  where stable_batch_key is not null;

do $$
begin
  if exists (
    select 1 from public.etc_catalog
    where sku in ('AV-021','AV-022','AV-023','AV-024','AV-025','AV-026','AV-027','AV-028','AV-029','AV-030')
      and stable_batch_key is distinct from case sku
        when 'AV-021' then 'avatar-20261023-purple-moon-butterfly'
        when 'AV-022' then 'avatar-20261023-celestial-lotus-gold'
        when 'AV-023' then 'avatar-20261023-blood-moon-demon'
        when 'AV-024' then 'avatar-20261023-emerald-moon-jade'
        when 'AV-025' then 'avatar-20261023-frost-moon-swordsman'
        when 'AV-026' then 'avatar-20261023-aqua-spirit-dragon'
        when 'AV-027' then 'avatar-20261023-sakura-spring-fairy'
        when 'AV-028' then 'avatar-20261023-violet-eclipse-mage'
        when 'AV-029' then 'avatar-20261023-snow-queen-crystal'
        when 'AV-030' then 'avatar-20261023-solar-phoenix-immortal'
      end
  ) then
    raise exception 'Avatar batch SKU collision: an existing SKU is not owned by this batch';
  end if;
end $$;

with inserted as (
insert into public.etc_catalog
  (sku, name, description, slot, rarity, price, asset, sort, status, enabled, tradable, legacy, starter, created_by, stable_batch_key)
values
  ('AV-021','บุปผาจันทราม่วง','เซียนผู้บังคับผีเสื้อแสงจันทร์ใต้ม่านบุปผาสีม่วง','profileAvatar','หายาก',780,'/arena/economy/catalog/avatar/avatar-batch-20261023-01.png',116,'published',true,false,false,false,'owner','avatar-20261023-purple-moon-butterfly'),
  ('AV-022','องค์ชายสุริยันบัวทอง','เทพเซียนสุริยันผู้โอบรับดอกบัวทองท่ามกลางรัศมีสวรรค์','profileAvatar','ตำนาน',1200,'/arena/economy/catalog/avatar/avatar-batch-20261023-02.png',117,'published',true,false,false,false,'owner','avatar-20261023-celestial-lotus-gold'),
  ('AV-023','จอมมารจันทราโลหิต','จอมยุทธ์อาภรณ์ดำแดง ผู้ใช้พลังเพลิงภายใต้จันทราสีชาด','profileAvatar','ตำนาน',1100,'/arena/economy/catalog/avatar/avatar-batch-20261023-03.png',118,'published',true,false,false,false,'owner','avatar-20261023-blood-moon-demon'),
  ('AV-024','เซียนจันทรามรกต','เซียนหญิงจากป่าไผ่ ผู้ประคองพลังหยกและวิญญาณพฤกษา','profileAvatar','หายาก',820,'/arena/economy/catalog/avatar/avatar-batch-20261023-04.png',119,'published',true,false,false,false,'owner','avatar-20261023-emerald-moon-jade'),
  ('AV-025','จอมยุทธ์เหมันต์จันทรา','ผู้พิทักษ์รัตติกาลซึ่งร่ายวงเวทน้ำแข็งใต้แสงจันทร์','profileAvatar','หายาก',950,'/arena/economy/catalog/avatar/avatar-batch-20261023-05.png',120,'published',true,false,false,false,'owner','avatar-20261023-frost-moon-swordsman'),
  ('AV-026','เทพธิดามังกรวารี','เซียนวารีผู้เรียกมังกรวิญญาณจากทะเลสาบจันทรา','profileAvatar','ตำนาน',1350,'/arena/economy/catalog/avatar/avatar-batch-20261023-06.png',121,'published',true,false,false,false,'owner','avatar-20261023-aqua-spirit-dragon'),
  ('AV-027','นางเซียนบุปผาวสันต์','นางเซียนผู้ร่ายกลีบซากุระเรืองแสงในสายลมฤดูใบไม้ผลิ','profileAvatar','หายาก',880,'/arena/economy/catalog/avatar/avatar-batch-20261023-07.png',122,'published',true,false,false,false,'owner','avatar-20261023-sakura-spring-fairy'),
  ('AV-028','บุรุษจันทราคราส','ผู้ใช้มนตรารัตติกาลอัญเชิญพลังคราสสีม่วง','profileAvatar','ตำนาน',1300,'/arena/economy/catalog/avatar/avatar-batch-20261023-08.png',123,'published',true,false,false,false,'owner','avatar-20261023-violet-eclipse-mage'),
  ('AV-029','ราชินีเหมันต์ดารา','ราชินีผลึกน้ำแข็งผู้ถักทอเกล็ดหิมะและแสงดารา','profileAvatar','ตำนาน',1500,'/arena/economy/catalog/avatar/avatar-batch-20261023-09.png',124,'published',true,false,false,false,'owner','avatar-20261023-snow-queen-crystal'),
  ('AV-030','เทพหงส์สุริยัน','เทพเซียนผู้รับพลังหงส์เพลิงและวงแหวนสุริยะ','profileAvatar','ตำนาน',1650,'/arena/economy/catalog/avatar/avatar-batch-20261023-10.png',125,'published',true,false,false,false,'owner','avatar-20261023-solar-phoenix-immortal')
on conflict (stable_batch_key) where stable_batch_key is not null do nothing
returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-create:published', 'avatar-batch-20261023', 'เพิ่มสินค้าโปรไฟล์เซียน 10 รายการ (AV-021–AV-030)'
where exists (select 1 from inserted);

