import fs from 'node:fs';
import { SCENARIOS } from '../tests/helpers/solver.mjs';
const stages = Object.values(SCENARIOS).filter(s => s.stage);
const names = {xs:'ห้องเรียน',s:'สตูดิโอ',m:'หอประชุม',l:'กลางแจ้ง',xl:'สนามกีฬา'};
let text = '# Phase 07 — การเชื่อมโมเดลกับโต๊ะทั้ง25ด่าน\n\nวันที่ 21 ตุลาคม 2026 · สร้างจาก Scenario ปัจจุบันด้วย scripts/phase07-table-report.mjs\n\n';
text += 'คง union stock ของ5ระดับต่อvenue; จำนวนรวมเท่ากัน แต่บางบทเรียนเริ่มติดตั้งเครื่องที่สถานีตามกติกาเดิม จึงไม่ใช่ว่าทุกชิ้นต้องเริ่มบนโต๊ะทุกระดับ สายยังอยู่ในกระเป๋า ไม่เพิ่มเป็นของตกแต่งบนโต๊ะ\n\n';
text += '| ด่าน | สถานที่ | รวมเครื่อง | ยกได้ทั้งหมด | เริ่มโต๊ะ | ยกได้แต่เริ่มติดตั้ง | fixed | สาย/adapter |\n|---|---|---:|---:|---:|---:|---:|---:|\n';
for (const s of stages) text += `| ${s.stage.id} | ${names[s.venueScale]} | ${s.devices.length} | ${s.placeables.length} | ${s.placeables.filter(p=>!p.installed).length} | ${s.placeables.filter(p=>p.installed).length} | ${s.devices.length-s.placeables.length} | ${s.cables.length} |\n`;
text += '\n## รายการต่อสถานที่\n\n';
for (const [scale, name] of Object.entries(names)) {
  const s=stages.find(s=>s.venueScale===scale), movable=new Set(s.placeables.map(p=>p.id));
  text += `### ${name}\n\n`;
  text += `ยกได้ (${movable.size}): ${s.devices.filter(d=>movable.has(d.id)).map(d=>`${d.id} [${d.modelId}]`).join(', ')}\n\n`;
  text += `ติดตั้งประจำ (${s.devices.length-movable.size}): ${s.devices.filter(d=>!movable.has(d.id)).map(d=>`${d.id} [${d.modelId}]`).join(', ')}\n\n`;
}
text += '## การจัดและผลตรวจ\n\nรักษาโต๊ะ/ตำแหน่งสถานที่และธีมจีนเซียนเดิม ใช้ลำดับหมวดจากระบบเดิม จัด shelf slot ด้วยขนาด footprint หมุนจริง รวม stagingBounds ของ breakout/tail ระยะคั่น35มม.และขอบ40มม. จัด poolเต็มก่อนเลือกของที่เริ่มบนโต๊ะเพื่อให้ slot ไม่เลื่อนข้ามระดับ\n\nเครื่องบน tripod/rack/camera mount อยู่สถานีเดิม สถานีใหญ่/จอ/PA มีฐานรองเดิม ไม่ย้าย fixed-install ไปกองบนโต๊ะ อุปกรณ์ stockOnly ไม่เข้า objective, canonical wiring หรือ initial connections; ไม่แตะเกณฑ์ผ่านเพื่อเลี่ยงปัญหาโมเดล\n\nAutomated tests ตรวจทั้ง25: roster union, fixed station, stable portable slot, full-footprint fit/no overlap, tabletop height, reachability และไม่ผ่านทันทีจาก stock เพิ่ม; end-to-end logicทุกด่านผ่าน ต้องให้ ownerเดินตรวจภาพ/การหยิบจริงครั้งสุดท้าย ไม่อ้างว่าการตรวจเชิงเรขาคณิตแทน manual playtest\n';
fs.writeFileSync('docs/PHASE07_ALL_25_LEVEL_TABLE_INTEGRATION_TH.md', text);
console.log(`reported ${stages.length} stages`);
