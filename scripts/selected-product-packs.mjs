import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {load} from '../tests/helpers/solver.mjs';
const {equipmentVisualGeometry}=load('../game/rendering/equipment-visual-profile.ts');
const root=process.cwd(),base=path.join(root,'art/reference/selected-products');
const targets=JSON.parse(fs.readFileSync('game/content/selected-product-targets.json','utf8'));
const acquired=JSON.parse(fs.readFileSync(path.join(base,'image-acquisition.json'),'utf8'));
const old=JSON.parse(fs.readFileSync('art/qa/photo-modeling/source-model-ledger.json','utf8'));
const review=JSON.parse(fs.readFileSync(path.join(base,'visual-review.json'),'utf8')).reviewed;
const reuse={'panasonic-hcx2000':'panasonic-hc-x2000','shure-sm58':'shure-sm58'};
const rows=[];
for(const [id,product] of Object.entries(targets.products)) {
  const dir=path.join(base,id);fs.mkdirSync(dir,{recursive:true});
  const profiles=Object.entries(targets.profiles).filter(([,p])=>p===id).map(([p])=>p);
  const files=acquired.filter(r=>r.product===id&&r.localPath).map(r=>({...r,review:review[r.id]??'PENDING_VISUAL_REVIEW'}));
  const previous=old.items.find(r=>r.key===reuse[id]);
  if(previous) for(const f of previous.files.filter(f=>/\.(png|jpe?g|webp)$/i.test(f.path))) files.push({localPath:path.join(old.archive,path.dirname(previous.pack),f.path),sha256:f.sha256,bytes:f.bytes,review:'REUSE_VERIFIED_ARCHIVE; no new download'});
  for(const file of files) {
    if(!fs.existsSync(file.localPath))throw Error(`Missing ${file.localPath}`);
    const actual=crypto.createHash('sha256').update(fs.readFileSync(file.localPath)).digest('hex');
    if(actual!==file.sha256)throw Error(`Changed image ${file.localPath}`);
  }
  const resolved=profiles.every(p=>equipmentVisualGeometry(p)||['generic-projector','generic-active-pa','generic-sdi-ptz','reference-replay-controller'].includes(p));
  const status=resolved?'PHOTO_MODEL_INTEGRATED_ESTIMATED_DETAILS_NOT_FACTORY_CAD':'TARGET_SELECTED_MODEL_NOT_IMPLEMENTED';
  const pack=[`# ${product.name}`,'','เป้าหมายภาพแสดงผลใน GAME ที่เลือกตามอำนาจเจ้าของ ไม่ใช่การยืนยันเครื่องจริง','',`โปรไฟล์เดิม: ${profiles.join(', ')}`,`สถานะโมเดล: ${status}`,'',`แหล่งข้อมูล: ${product.url}`,...(product.additionalSources??[]).map(u=>`แหล่งประกอบ: ${u}`),'','## ความเข้ากันได้และข้อจำกัด','',product.compatibility,'','## ภาพจริงที่มีอยู่ในเครื่อง','',...files.map(f=>`- [${path.basename(f.localPath)}](${f.localPath.replaceAll('\\','/')}) — ${f.review}; SHA256 ${f.sha256}`),...(!files.length?['ยังไม่มีภาพสินค้าเป้าหมายที่บันทึกได้ ห้ามรายงานว่าภาพครบ']:[]),'','## ก่อนรับรองโมเดล','', '- [ ] สัดส่วนและมิติตรวจจากเอกสารหรือระบุส่วนประมาณ','- [ ] หน้า/หลัง/ข้างและขั้วต่อเทียบหลักฐาน','- [ ] พอร์ตแสดงผลตรงจุดเสียบจริงของเกม โดยไม่เปลี่ยนชนิดสัญญาณ','- [ ] ชิ้นส่วนเสริม/จุดตรรกะแยกจากช่องโรงงานอย่างชัดเจน','- [ ] ผ่านตรวจภาพในเกมจริงและงบประสิทธิภาพ','- [ ] ตรวจสิทธิ์ก่อนเผยแพร่ภาพอ้างอิงหรือเครื่องหมายการค้า',''].join('\n');
  fs.writeFileSync(path.join(dir,'MODELING_REFERENCE_PACK.md'),pack);
  rows.push({id,profiles,product:product.name,imageFiles:files.length,modelStatus:status,pack:path.relative(root,path.join(dir,'MODELING_REFERENCE_PACK.md')).replaceAll('\\','/')});
}
fs.writeFileSync(path.join(base,'model-readiness.json'),JSON.stringify({scope:'new GAME-selected targets only; original 81 packs preserved',profiles:27,products:rows},null,2));
console.log(JSON.stringify({products:rows.length,profiles:27,withLocalImages:rows.filter(r=>r.imageFiles>0).length,withoutLocalImages:rows.filter(r=>!r.imageFiles).map(r=>r.id)}));
