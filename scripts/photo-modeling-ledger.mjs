import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load, projectRoot } from '../tests/helpers/solver.mjs';
const records=JSON.parse(fs.readFileSync(path.join(projectRoot,'game/content/local-reference-evidence.json'),'utf8'));
const { MODEL_GEOMETRY }=load('../game/training/sim/model-geometry.ts');
const archive='C:/Users/asus/Downloads/อุปกรณ์';
const native={'panasonic-hc-x2000':['hc-x2000'],'devicewell-hds7105':['hds7105'],'pmx-402d-usb':['pmx402d'],'hp-15-6-reference':['hp-laptop'],'samsung-u8000f':['samsung-u8000f'],'comica-wm100-plus':['comica-wm100-plus-rx','comica-wm100-plus-tx'],'sennheiser-xs1':['sennheiser-xs1'],'yamaha-hs5':['yamaha-hs5'],'magewell-usb-capture-hdmi-gen2':['magewell-capture']};
const changed=new Set(['bmd-studio-camera-4k-plus-g2','bmd-studio-camera-4k-pro-g2','bmd-ursa-broadcast-g2','bmd-camera-fiber-converter','bmd-studio-fiber-converter']);
let checked=0;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const output=[];
for(const [key,r] of Object.entries(records)) {
  const pack=path.join(archive,r.pack); const text=fs.readFileSync(pack,'utf8');
  if(!text.length) throw Error(`empty pack ${key}`);
  const files=[...new Set([...r.files,...r.shapeFiles])].map(p=>{
    const absolute=path.resolve(archive,r.folder,p); if(!fs.existsSync(absolute)) throw Error(`missing ${absolute}`); checked++;
    return {path:p,sha256:hash(absolute),bytes:fs.statSync(absolute).size};
  });
  const imageCount=files.filter(f=>/\.(png|jpe?g|webp|tiff?|psd)$/i.test(f.path)).length;
  const renderer=MODEL_GEOMETRY[key] ? key==='bmd-atem-mini-pro'?'components/game/equipment/atem-mini-pro.tsx':'components/game/equipment/hardware-model.tsx'
    :native[key] ? native[key].map(n=>`public/models/equipment/${n}.glb`).join('; ')
      :r.evidenceClass==='generic'?'components/game/equipment/generic-device.tsx'
        :r.evidenceClass==='archive-only'?'ARCHIVE_ONLY':'components/game/cable-plugs.tsx + components/ui/cable-model.tsx';
  const progress=r.evidenceClass==='archive-only'?'กันออกจากเกม ไม่ใช้ WM300 แทน WM100'
    :r.evidenceClass==='generic'?'มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact'
      :r.evidenceClass==='logical'?'ลิงก์จำลอง ไม่ใช่สายกายภาพ'
        :MODEL_GEOMETRY[key]?.parts ? changed.has(key)?'ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces':'คงส่วนวัดเดิม + ปรับ shared surfaces'
          :key==='panasonic-hc-x2000'?'ปรับ GLB hood กลวง/เลนส์ลึก/handle audio ตามภาพ; คง port anchor'
            :native[key]?'ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้'
            :key==='bmd-atem-mini-pro'?'คงคอนโซลปั้นจากภาพและ key/socket เดิม':'รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU';
  const derivedFiles=(native[key]?.map(n=>`public/models/equipment/${n}.glb`)??(r.evidenceClass==='archive-only'?[]:[renderer.split(' + ')[0]])).map(p=>({path:p,sha256:hash(path.join(projectRoot,p)),bytes:fs.statSync(path.join(projectRoot,p)).size}));
  output.push({key,identity:r.identity,evidenceClass:r.evidenceClass,exactness:r.exactness,readiness:r.readiness,pack:r.pack,packSha256:hash(pack),imageCount,renderer,progress,limitations:r.missing,files,derivedFiles});
}
const directory=path.join(projectRoot,'art/qa/photo-modeling'); fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,'source-model-ledger.json'),JSON.stringify({archive,checkedPaths:checked,items:output},null,2)+'\n');
const safe=s=>String(s).replaceAll('|','/').replaceAll('\n',' ');
const rows=output.map(r=>`| ${r.key} | ${r.imageCount} | ${r.evidenceClass} | ${r.renderer} | ${r.progress} | ${safe(r.limitations)} |`);
fs.writeFileSync(path.join(projectRoot,'docs/hardware-3d/PHOTO_MODELING_ALL_ITEMS_LEDGER_TH.md'),`# บัญชีปั้นจากรูปจริง — ทุกรายการในคลัง\n\nอ่าน packsครบ${output.length}ชุดและตรวจไฟล์อ้างอิง${checked}เส้นทาง; เก็บSHA-256และpathใน art/qa/photo-modeling/source-model-ledger.json ไม่คัดลอกรูปต้นฉบับเข้าเกม\n\nมี26โปรไฟล์อุปกรณ์ใช้งานที่มีรูป, generic27ไม่มีรูปสินค้า, WM300เก็บแยก1, สาย/adapter26 + logical1 รวม81ชุด การมีrendererไม่ใช่หลักฐานว่าสมจริง100%\n\n| key | รูป/PSDตามmanifest | สถานะหลักฐาน | rendererจริง | สิ่งที่ทำ/ข้อจำกัดรอบนี้ | มุม/ข้อมูลที่ยังขาด |\n|---|---:|---|---|---|---|\n${rows.join('\n')}\n\n## เกณฑ์การส่งต่อ\n\nรายการgeneric27ยังปั้นจากภาพเฉพาะรุ่นไม่ได้เพราะpackไม่มีภาพ ห้ามแต่งแบรนด์/รุ่นหรือยกโมเดลคร่าวๆเป็นexact; pendingคงตามowner evidence; WM300ไม่ใช้ในเกม; CTRL-REPLAYไม่มีสายจริง ส่วนมุมที่ภาพไม่ครบและขนาดที่ไม่มีdrawingยังประมาณ ไม่รับรองhigh-fidelity100%\n`);
console.log(JSON.stringify({packs:output.length,checkedPaths:checked,ledger:'docs/hardware-3d/PHOTO_MODELING_ALL_ITEMS_LEDGER_TH.md'}));
