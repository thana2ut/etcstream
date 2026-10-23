-- Additive, rerun-safe import for ten user-provided sword cosmetics.
-- The matching original RGBA PNGs are stored under public/arena/economy/catalog/sword/.
-- Existing swords, wallets, purchases, ownership, equipped items, and other catalog rows are untouched.

do $$
begin
  if exists (
    select 1 from public.etc_catalog
    where sku in ('SW-006','SW-007','SW-008','SW-009','SW-010','SW-011','SW-012','SW-013','SW-014','SW-015')
      and stable_batch_key is distinct from case sku
        when 'SW-006' then 'sword-20261024-azure-wind-crystal'
        when 'SW-007' then 'sword-20261024-sakura-blossom'
        when 'SW-008' then 'sword-20261024-crimson-demon-flame'
        when 'SW-009' then 'sword-20261024-celestial-star-moon'
        when 'SW-010' then 'sword-20261024-heavenly-thunder'
        when 'SW-011' then 'sword-20261024-golden-eclipse'
        when 'SW-012' then 'sword-20261024-amber-solar-sand'
        when 'SW-013' then 'sword-20261024-emerald-bamboo'
        when 'SW-014' then 'sword-20261024-pearl-lotus-moon'
        when 'SW-015' then 'sword-20261024-abyssal-sea-dragon'
      end
  ) then
    raise exception 'Sword batch SKU collision: an existing SKU is not owned by this batch';
  end if;

  if exists (
    select 1 from public.etc_catalog
    where stable_batch_key in (
      'sword-20261024-azure-wind-crystal','sword-20261024-sakura-blossom',
      'sword-20261024-crimson-demon-flame','sword-20261024-celestial-star-moon',
      'sword-20261024-heavenly-thunder','sword-20261024-golden-eclipse',
      'sword-20261024-amber-solar-sand','sword-20261024-emerald-bamboo',
      'sword-20261024-pearl-lotus-moon','sword-20261024-abyssal-sea-dragon'
    )
      and sku is distinct from case stable_batch_key
        when 'sword-20261024-azure-wind-crystal' then 'SW-006'
        when 'sword-20261024-sakura-blossom' then 'SW-007'
        when 'sword-20261024-crimson-demon-flame' then 'SW-008'
        when 'sword-20261024-celestial-star-moon' then 'SW-009'
        when 'sword-20261024-heavenly-thunder' then 'SW-010'
        when 'sword-20261024-golden-eclipse' then 'SW-011'
        when 'sword-20261024-amber-solar-sand' then 'SW-012'
        when 'sword-20261024-emerald-bamboo' then 'SW-013'
        when 'sword-20261024-pearl-lotus-moon' then 'SW-014'
        when 'sword-20261024-abyssal-sea-dragon' then 'SW-015'
      end
  ) then
    raise exception 'Sword batch key collision: a key belongs to another SKU';
  end if;
end $$;

with inserted as (
  insert into public.etc_catalog
    (sku, name, description, slot, rarity, price, asset, sort, status, enabled, tradable, legacy, starter, created_by, stable_batch_key)
  values
    ('SW-006','กระบี่วายุผลึกคราม','คมกระบี่ผลึกสีฟ้าคราม โอบล้อมด้วยกระแสวายุและประกายคริสตัล','swordSkin',null,1350,'/arena/economy/catalog/sword/sw-006-azure-wind-crystal.png',306,'published',true,false,false,false,'owner','sword-20261024-azure-wind-crystal'),
    ('SW-007','กระบี่บุปผาซากุระ','คมกระบี่ชมพูประดับบุปผาและอัญมณี เปล่งประกายกลีบซากุระ','swordSkin',null,1500,'/arena/economy/catalog/sword/sw-007-sakura-blossom.png',307,'published',true,false,false,false,'owner','sword-20261024-sakura-blossom'),
    ('SW-008','กระบี่อสูรโลหิตเพลิง','คมกระบี่สีแดงดำประดับเขาอสูรและเพลิงโลหิตลุกโชน','swordSkin',null,1850,'/arena/economy/catalog/sword/sw-008-crimson-demon-flame.png',308,'published',true,false,false,false,'owner','sword-20261024-crimson-demon-flame'),
    ('SW-009','กระบี่ดาราจันทรา','คมกระบี่ม่วงครามประดับจันทร์เสี้ยวและประกายดาวจากห้วงนภา','swordSkin',null,1950,'/arena/economy/catalog/sword/sw-009-celestial-star-moon.png',309,'published',true,false,false,false,'owner','sword-20261024-celestial-star-moon'),
    ('SW-010','กระบี่อัสนีสวรรค์','คมกระบี่น้ำเงินฟ้าผสานลายสายฟ้าและผลึกพลังอัสนี','swordSkin',null,2150,'/arena/economy/catalog/sword/sw-010-heavenly-thunder.png',310,'published',true,false,false,false,'owner','sword-20261024-heavenly-thunder'),
    ('SW-011','กระบี่สุริยคราสทมิฬ','กระบี่ดำทองประดับวงแหวนสุริยคราส พร้อมกลุ่มควันดาราสีเข้ม','swordSkin',null,2450,'/arena/economy/catalog/sword/sw-011-golden-eclipse.png',311,'published',true,false,false,false,'owner','sword-20261024-golden-eclipse'),
    ('SW-012','กระบี่สุริยันทรายทอง','คมกระบี่อำพันทองเจิดจ้าแทรกประกายแร่และม่านทรายสวรรค์','swordSkin',null,2650,'/arena/economy/catalog/sword/sw-012-amber-solar-sand.png',312,'published',true,false,false,false,'owner','sword-20261024-amber-solar-sand'),
    ('SW-013','กระบี่ไผ่หยกนิรันดร์','กระบี่สีเขียวหยกแกะลายกิ่งไผ่และใบไม้ มีสายพลังธรรมชาติ','swordSkin',null,2850,'/arena/economy/catalog/sword/sw-013-emerald-bamboo.png',313,'published',true,false,false,false,'owner','sword-20261024-emerald-bamboo'),
    ('SW-014','กระบี่บัวแก้วจันทรา','กระบี่ขาวมุกอมม่วงอ่อนประดับดอกบัวและไข่มุกเปล่งแสง','swordSkin',null,3200,'/arena/economy/catalog/sword/sw-014-pearl-lotus-moon.png',314,'published',true,false,false,false,'owner','sword-20261024-pearl-lotus-moon'),
    ('SW-015','กระบี่มังกรวารีสมุทร','กระบี่ฟ้าเทอร์ควอยซ์ประดับมังกรวารีและเกลียวคลื่นอัญมณี','swordSkin',null,3500,'/arena/economy/catalog/sword/sw-015-abyssal-sea-dragon.png',315,'published',true,false,false,false,'owner','sword-20261024-abyssal-sea-dragon')
  on conflict (stable_batch_key) where stable_batch_key is not null do nothing
  returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-create:published', 'sword-batch-20261024', 'เพิ่มกระบี่ตกแต่ง 10 รายการ (SW-006–SW-015)'
where exists (select 1 from inserted);
