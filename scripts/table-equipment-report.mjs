import fs from 'node:fs';
import path from 'node:path';
import {SCENARIOS,load} from '../tests/helpers/solver.mjs';
const {LAYOUTS}=load('../game/training/venue-layouts.ts');
const {equipmentVisualGeometry}=load('../game/rendering/equipment-visual-profile.ts');
const {SELECTED_PRODUCT_GEOMETRY}=load('../game/rendering/selected-product-geometry.ts');
const {selectedGameProduct}=load('../game/content/selected-product-info.ts');
const {referenceKeyForDevice}=load('../game/content/reference-evidence.ts');
const old=JSON.parse(fs.readFileSync('game/content/local-reference-evidence.json','utf8'));
const venues=Object.values(SCENARIOS).filter(s=>s.stage),profiles=new Map();
const rows=venues.map(s=>{
  const layout=LAYOUTS[s.layout],f=layout.furniture.find(f=>f.kind==='equipmentPrep');
  for(const d of s.devices) {
    const target=selectedGameProduct(d.modelId),g=equipmentVisualGeometry(d.modelId);
    const profile=profiles.get(d.modelId)??{id:d.modelId,name:target?.name??d.model,evidenceClass:old[d.modelId]?.evidenceClass??'unknown',rooms:new Set(),renderer:SELECTED_PRODUCT_GEOMETRY[d.modelId]?.parts?'selected photo mesh':d.modelId==='generic-hdmi-camera'?'reused HC-X2000 GLB':d.generic?'photo family renderer':g?.parts?'existing hardware mesh':'existing native GLB',physicalAnchors:Object.keys(g?.ports??{}).length,limits:g?.estimates??['รายละเอียดที่ไม่มีภาพยังเป็นค่าประมาณ; ไม่มีการรับรอง CAD โรงงาน']};
    profile.rooms.add(s.venueScale);profiles.set(d.modelId,profile);
  }
  return {stage:s.stage.id,scenario:s.id,room:s.venueScale,table:f.id,tableSize:f.size,units:s.devices.length,portable:s.placeables.length,staged:s.placeables.filter(p=>!p.installed).length,stock:s.devices.filter(d=>d.stockOnly).length,prewired:s.initialConnections.length};
});
// Include existing Free Practice units, including its baked switcher/TV, without changing that room.
for(const s of Object.values(SCENARIOS).filter(s=>!s.stage))for(const d of [...s.devices,...s.placeables.map(p=>p.device).filter(Boolean)]) {
  const id=referenceKeyForDevice(d,d.id);if(!id)continue;
  const p=profiles.get(id)??{id,name:d.model,evidenceClass:old[id]?.evidenceClass??'owner-specific',rooms:new Set(),renderer:'existing native GLB / Free Practice',physicalAnchors:0,limits:['คงโมเดลเดิม; หลักฐานรุ่นจริงและพิกัดที่ยังประมาณอ่านจาก reference pack เดิม']};
  p.rooms.add(s.id);profiles.set(id,p);
}
for(const [id,name] of [['devicewell-hds7105','DeviceWell HDS7105'],['samsung-u8000f','Samsung UA85U8000FKXXT']])if(!profiles.has(id))profiles.set(id,{id,name,evidenceClass:old[id]?.evidenceClass,rooms:new Set(['studio-full']),renderer:'existing native GLB / authored room',physicalAnchors:0,limits:['จุดรุ่น/มิติอ่านจาก manifest เดิม ไม่อ้างว่าโรงงานยืนยันครบทุกด้าน']});
const modelRows=[...profiles.values()].map(p=>({...p,rooms:[...p.rooms]}));
const dir=path.resolve('art/qa/table-equipment');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'all-25-stage-readiness.json'),JSON.stringify({method:'source, headless state tests and DCC rendering; no controlled gameplay',stages:rows,models:modelRows},null,2));
const header=['# ตรวจโต๊ะและโมเดลอุปกรณ์ทุกห้อง — ไม่ควบคุมตัวละครเล่น','','## ขอบเขตที่ตรวจจริง','','- 25 ด่านใน 5 ห้อง พร้อมคง Free Practice และ hdmi-basic เดิม','- ตรวจโค้ด กราฟภารกิจ สัญญาณ เซฟ จุดพอร์ต พื้นที่วาง การหยิบ/วางผ่านชุดทดสอบ และภาพเรนเดอร์ Blender แยกฉาก','- ไม่ได้เปิดควบคุมตัวละคร ไม่ได้ทดสอบ FPS หรือรับรองภาพจาก browser ทุกห้อง','- อุปกรณ์โครงสร้าง เช่น กล้องพร้อมขาตั้ง จอติดตั้ง แร็ก และชุดเวทีใหญ่ อยู่ที่จุดบริการตามงานจริง ไม่ยกทั้งชุดมาซ้อนบนโต๊ะ','- L4/ด่านที่กำหนดสายตั้งต้นยังคงสถานะเดิมเพื่อไม่เปลี่ยนโจทย์ซ่อม; อุปกรณ์พกพาและของสำรองยังอยู่ในห้องและหยิบได้','','## ตารางครบทุกด่าน','','| ด่าน | ห้อง | จำนวนชิ้น | หยิบได้ | เริ่มรอเตรียม | สำรองจากด่านอื่น | สายตั้งต้น |','|---|---|---:|---:|---:|---:|---:|',...rows.map(r=>`| ${r.stage} | ${r.room} | ${r.units} | ${r.portable} | ${r.staged} | ${r.stock} | ${r.prewired} |`),'','## โมเดลที่ใช้งานจริง','','สถานะทั้งหมดคือ mesh ที่นำไปตรวจต่อได้ ไม่ใช่คำรับรองว่ารายละเอียดทุกมุมตรงโรงงาน 100%','','| โปรไฟล์เดิม | รุ่นภาพที่เลือก/คงเดิม | วิธีแสดงผล | พอร์ตที่มีจุดโมเดล | ห้อง |','|---|---|---|---:|---|',...modelRows.map(r=>`| ${r.id} | ${r.name.replaceAll('|','/')} | ${r.renderer} | ${r.physicalAnchors} | ${r.rooms.join(', ')} |`),'','## ข้อจำกัดที่ห้ามรายงานเกินจริง','','- จุดที่ไม่เห็นจากภาพยังประมาณจากภาพใกล้เคียง/สัดส่วน และระบุใน estimates ของแต่ละ geometry','- แผงควบคุมฝึกคงกติกาเดิม ไม่อ้างว่าเหมือน firmware สินค้าจริงทั้งหมด','- STREAM/AUX ของชุด MG12XU ใช้แผงบริการของเกม ไม่ใช่ช่อง AUX stereo โรงงาน; ห้ามเรียก PHONES ว่า LINE','- CTRL-REPLAY เป็นลิงก์เชิงตรรกะ ไม่ใช่รูเสียบบน Contour','- ยังไม่มีการทดสอบภาพใน browser หรือวัดประสิทธิภาพจริงตามคำสั่งไม่ควบคุมเล่น',''];
header[header.findIndex(line=>line.startsWith('- STREAM/AUX'))]='- STREAM/AUX เดิมแสดงเป็นชุดภายนอก Radial J-Iso + Hosa YPP-136 พร้อมภาพทางการ ไม่ใช่ช่อง AUX stereo โรงงานบน MG12XU และไม่ใช้ PHONES แทน LINE';
fs.writeFileSync('docs/hardware-3d/TABLE_AND_PHOTO_MODELS_ALL_ROOMS_TH.md',header.join('\n'));
console.log(JSON.stringify({stages:rows.length,activeProfiles:modelRows.length,selectedProfiles:modelRows.filter(r=>r.evidenceClass==='generic').length,portableInstances:rows.reduce((a,r)=>a+r.portable,0)}));
