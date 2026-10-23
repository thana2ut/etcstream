-- Additive, rerun-safe import of ten celestial residence decorations.
-- Copy the mapped PNGs to public/arena/economy/catalog/decor/ before applying.
-- Existing catalog products, player balances, purchases, ownership and equipment remain untouched.

do $$
begin
  if exists (
    select 1
    from public.etc_catalog
    where sku in ('DE-008','DE-009','DE-010','DE-011','DE-012','DE-013','DE-014','DE-015','DE-016','DE-017')
      and stable_batch_key is distinct from case sku
        when 'DE-008' then 'decor-golden-lunar-lantern'
        when 'DE-009' then 'decor-blue-astral-orbit'
        when 'DE-010' then 'decor-frost-dragon-spring'
        when 'DE-011' then 'decor-sakura-heaven-tree'
        when 'DE-012' then 'decor-crimson-phoenix-emblem'
        when 'DE-013' then 'decor-crystal-moon-shrine'
        when 'DE-014' then 'decor-white-crane-statue'
        when 'DE-015' then 'decor-emerald-floating-palace'
        when 'DE-016' then 'decor-violet-lantern-pavilion'
        when 'DE-017' then 'decor-amber-celestial-compass'
      end
  ) then
    raise exception 'Celestial decor SKU collision: an existing SKU is not owned by this batch';
  end if;

  if exists (
    select 1
    from public.etc_catalog
    where stable_batch_key in (
      'decor-golden-lunar-lantern','decor-blue-astral-orbit','decor-frost-dragon-spring',
      'decor-sakura-heaven-tree','decor-crimson-phoenix-emblem','decor-crystal-moon-shrine',
      'decor-white-crane-statue','decor-emerald-floating-palace','decor-violet-lantern-pavilion',
      'decor-amber-celestial-compass'
    )
      and sku is distinct from case stable_batch_key
        when 'decor-golden-lunar-lantern' then 'DE-008'
        when 'decor-blue-astral-orbit' then 'DE-009'
        when 'decor-frost-dragon-spring' then 'DE-010'
        when 'decor-sakura-heaven-tree' then 'DE-011'
        when 'decor-crimson-phoenix-emblem' then 'DE-012'
        when 'decor-crystal-moon-shrine' then 'DE-013'
        when 'decor-white-crane-statue' then 'DE-014'
        when 'decor-emerald-floating-palace' then 'DE-015'
        when 'decor-violet-lantern-pavilion' then 'DE-016'
        when 'decor-amber-celestial-compass' then 'DE-017'
      end
  ) then
    raise exception 'Celestial decor stable-key collision: a key belongs to another SKU';
  end if;
end $$;

with inserted as (
  insert into public.etc_catalog
    (sku, name, description, slot, rarity, price, asset, sort, status, enabled, tradable, legacy, starter, created_by, stable_batch_key)
  values
    ('DE-008','โคมจันทราสุวรรณ','โคมทองแห่งจันทรา ส่องประกายละมุนท่ามกลางสายหมอกแดนเซียน','residenceDecor',null,260,'/arena/economy/catalog/decor/de-008-golden-lunar-lantern.png',508,'published',true,false,false,false,'owner','decor-golden-lunar-lantern'),
    ('DE-009','จักรดาราคราม','วงโคจรแห่งดวงดาวสีคราม ประดับผลึกเวทและประกายแสงจากฟากฟ้า','residenceDecor',null,420,'/arena/economy/catalog/decor/de-009-blue-astral-orbit.png',509,'published',true,false,false,false,'owner','decor-blue-astral-orbit'),
    ('DE-010','บ่อน้ำพุมังกรเหมันต์','บ่อน้ำพุผลึกน้ำแข็งที่โอบล้อมด้วยพลังมังกรและสายน้ำศักดิ์สิทธิ์','residenceDecor',null,690,'/arena/economy/catalog/decor/de-010-frost-dragon-spring.png',510,'published',true,false,false,false,'owner','decor-frost-dragon-spring'),
    ('DE-011','พฤกษาสวรรค์บุปผา','ต้นไม้แห่งแดนเซียนที่ผลิบานด้วยบุปผาสีชมพูและแสงอ่อนโยน','residenceDecor',null,780,'/arena/economy/catalog/decor/de-011-sakura-heaven-tree.png',511,'published',true,false,false,false,'owner','decor-sakura-heaven-tree'),
    ('DE-012','ตราหงส์เพลิงสุริยัน','เครื่องประดับหงส์เพลิงสีชาด โอบล้อมดวงสุริยันอันรุ่งโรจน์','residenceDecor',null,850,'/arena/economy/catalog/decor/de-012-crimson-phoenix-emblem.png',512,'published',true,false,false,false,'owner','decor-crimson-phoenix-emblem'),
    ('DE-013','ศาลาจันทร์ผลึก','ศาลารูปจันทร์เสี้ยวและผลึกเหมันต์ ส่องแสงสงบกลางราตรี','residenceDecor',null,940,'/arena/economy/catalog/decor/de-013-crystal-moon-shrine.png',513,'published',true,false,false,false,'owner','decor-crystal-moon-shrine'),
    ('DE-014','ประติมากรรมกระเรียนเมฆา','รูปกระเรียนขาวโบยบินเหนือเมฆ ประดับลวดลายทองวิจิตร','residenceDecor',null,1050,'/arena/economy/catalog/decor/de-014-white-crane-statue.png',514,'published',true,false,false,false,'owner','decor-white-crane-statue'),
    ('DE-015','ตำหนักหยกเหนือเมฆ','ตำหนักลอยฟ้าแห่งหยกมรกต แวดล้อมด้วยธารน้ำและม่านเมฆ','residenceDecor',null,1450,'/arena/economy/catalog/decor/de-015-emerald-floating-palace.png',515,'published',true,false,false,false,'owner','decor-emerald-floating-palace'),
    ('DE-016','โคมตำหนักมายาราตรี','โคมตำหนักสีม่วงลึกลับ เรืองรองด้วยผลึกและพลังแห่งรัตติกาล','residenceDecor',null,1150,'/arena/economy/catalog/decor/de-016-violet-lantern-pavilion.png',516,'published',true,false,false,false,'owner','decor-violet-lantern-pavilion'),
    ('DE-017','เข็มทิศสุริยันจักรวาล','เครื่องโคจรสุริยันสีอำพัน ประดับวงแหวนทองและดาวศักดิ์สิทธิ์','residenceDecor',null,1280,'/arena/economy/catalog/decor/de-017-amber-celestial-compass.png',517,'published',true,false,false,false,'owner','decor-amber-celestial-compass')
  on conflict (stable_batch_key) where stable_batch_key is not null do nothing
  returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-create:published', 'celestial-decor-20261024', 'เพิ่มของประดับตำหนัก 10 รายการ (DE-008–DE-017)'
where exists (select 1 from inserted);
