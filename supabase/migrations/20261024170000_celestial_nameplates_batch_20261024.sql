-- Additive, rerun-safe catalog import for ten new celestial nameplates.
-- The matching PNG files are stored in public/arena/economy/nameplates/.
-- Existing balances, purchases, ownership, equipped items, and other catalog rows are untouched.

do $$
begin
  if exists (
    select 1 from public.etc_catalog
    where sku in ('NP-011','NP-012','NP-013','NP-014','NP-015','NP-016','NP-017','NP-018','NP-019','NP-020')
      and stable_batch_key is distinct from case sku
        when 'NP-011' then 'nameplate-sakura-heaven'
        when 'NP-012' then 'nameplate-frost-moon'
        when 'NP-013' then 'nameplate-jade-cloud'
        when 'NP-014' then 'nameplate-bloodflame-dragon'
        when 'NP-015' then 'nameplate-wisteria-moon'
        when 'NP-016' then 'nameplate-pearl-ocean'
        when 'NP-017' then 'nameplate-solar-phoenix'
        when 'NP-018' then 'nameplate-violet-eclipse'
        when 'NP-019' then 'nameplate-frost-lotus'
        when 'NP-020' then 'nameplate-cosmic-palace'
      end
  ) then
    raise exception 'Celestial nameplate SKU collision: an existing SKU is not owned by this batch';
  end if;

  if exists (
    select 1 from public.etc_catalog
    where stable_batch_key in (
      'nameplate-sakura-heaven','nameplate-frost-moon','nameplate-jade-cloud',
      'nameplate-bloodflame-dragon','nameplate-wisteria-moon','nameplate-pearl-ocean',
      'nameplate-solar-phoenix','nameplate-violet-eclipse','nameplate-frost-lotus','nameplate-cosmic-palace'
    )
      and sku is distinct from case stable_batch_key
        when 'nameplate-sakura-heaven' then 'NP-011'
        when 'nameplate-frost-moon' then 'NP-012'
        when 'nameplate-jade-cloud' then 'NP-013'
        when 'nameplate-bloodflame-dragon' then 'NP-014'
        when 'nameplate-wisteria-moon' then 'NP-015'
        when 'nameplate-pearl-ocean' then 'NP-016'
        when 'nameplate-solar-phoenix' then 'NP-017'
        when 'nameplate-violet-eclipse' then 'NP-018'
        when 'nameplate-frost-lotus' then 'NP-019'
        when 'nameplate-cosmic-palace' then 'NP-020'
      end
  ) then
    raise exception 'Celestial nameplate batch-key collision: a key belongs to another SKU';
  end if;
end $$;

with inserted as (
  insert into public.etc_catalog
    (sku, name, description, slot, rarity, price, asset, sort, status, enabled, tradable, legacy, starter, created_by, stable_batch_key)
  values
    ('NP-011','ปกแดนบุปผาสวรรค์',null,'profileNameplate',null,450,'/arena/economy/nameplates/np-011_sakura_heaven.png',711,'published',true,false,false,false,'owner','nameplate-sakura-heaven'),
    ('NP-012','ปกจันทราเหมันต์',null,'profileNameplate',null,500,'/arena/economy/nameplates/np-012_frost_moon.png',712,'published',true,false,false,false,'owner','nameplate-frost-moon'),
    ('NP-013','ปกม่านหยกเมฆา',null,'profileNameplate',null,550,'/arena/economy/nameplates/np-013_jade_cloud.png',713,'published',true,false,false,false,'owner','nameplate-jade-cloud'),
    ('NP-014','ปกมังกรเพลิงโลหิต',null,'profileNameplate',null,800,'/arena/economy/nameplates/np-014_bloodflame_dragon.png',714,'published',true,false,false,false,'owner','nameplate-bloodflame-dragon'),
    ('NP-015','ปกบุปผาวิสทีเรีย',null,'profileNameplate',null,600,'/arena/economy/nameplates/np-015_wisteria_moon.png',715,'published',true,false,false,false,'owner','nameplate-wisteria-moon'),
    ('NP-016','ปกนครสมุทรไข่มุก',null,'profileNameplate',null,680,'/arena/economy/nameplates/np-016_pearl_ocean.png',716,'published',true,false,false,false,'owner','nameplate-pearl-ocean'),
    ('NP-017','ปกวิหคสุริยันทอง',null,'profileNameplate',null,900,'/arena/economy/nameplates/np-017_solar_phoenix.png',717,'published',true,false,false,false,'owner','nameplate-solar-phoenix'),
    ('NP-018','ปกคราสรัตติกาลม่วง',null,'profileNameplate',null,980,'/arena/economy/nameplates/np-018_violet_eclipse.png',718,'published',true,false,false,false,'owner','nameplate-violet-eclipse'),
    ('NP-019','ปกบัวเหมันต์จันทรา',null,'profileNameplate',null,750,'/arena/economy/nameplates/np-019_frost_lotus.png',719,'published',true,false,false,false,'owner','nameplate-frost-lotus'),
    ('NP-020','ปกจักรวาลวังสวรรค์',null,'profileNameplate',null,1200,'/arena/economy/nameplates/np-020_cosmic_palace.png',720,'published',true,false,false,false,'owner','nameplate-cosmic-palace')
  on conflict (stable_batch_key) where stable_batch_key is not null do nothing
  returning sku
)
insert into public.etc_admin_audit(actor, action, target, reason)
select 'owner', 'catalog-create:published', 'celestial-nameplates-20261024', 'เพิ่มปกแถบชื่อเซียน 10 รายการ (NP-011–NP-020)'
where exists (select 1 from inserted);
