// Regenerates docs/VENUE_SCENARIO_MATRIX.md and docs/EQUIPMENT_INVENTORY.md from the scenario data
// (game/training/venue-scenarios.ts), so documentation can never drift from what the game loads.
// Usage: node scripts/generate-venue-docs.mjs   (documentation only — not a test or auto-solver)
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolveFilename.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(out, filename);
};
const load = createRequire(import.meta.url);
const { VENUE_SCENARIOS } = load("../game/training/venue-scenarios.ts");
const { missionChapters } = load("../game/content/mission-catalog.ts");

const SCALE = { xs: 0, s: 1, m: 2, l: 3, xl: 4 };
const GOALS = [
  "Video Path — SOURCE → TRANSPORT → ROUTING → DESTINATION ด้วยกฎ OUTPUT → INPUT",
  "Audio Path — ไมค์ → ระบบรับ/แปลงระดับ → Mixer → สายงาน Program",
  "Switching / Routing / Monitoring — เลือกแหล่งภาพ ตรวจ Program และ Monitoring",
  "Ports + Troubleshooting — ไล่เส้นทางที่ขาด เลือกสายให้ตรงชนิดสัญญาณ แก้ค่าที่ยังไม่พร้อม",
  "Full Production — ภาพ + เสียง + Monitoring + Capture/Encode + ปลายทาง ครบทุกเงื่อนไข",
];
const scenarios = Object.values(VENUE_SCENARIOS).sort((a, b) => SCALE[a.venueScale] - SCALE[b.venueScale] || a.level - b.level);
const chapterOf = (s) => missionChapters[SCALE[s.venueScale]];
const statusOf = (d) => d.status ?? (d.verified ? "CONFIRMED" : "GENERIC TRAINING MODEL");
const movable = (s, id) => s.placeables.some((p) => p.id === id);

let m = `# Venue scenario matrix

> สร้างอัตโนมัติจาก \`game/training/venue-scenarios.ts\` ด้วย \`node scripts/generate-venue-docs.mjs\` — อย่าแก้ไฟล์นี้ด้วยมือ
>
> สถานะ: เขียนจากข้อมูลฉากเท่านั้น **ยังไม่ได้ทดสอบหรือเล่นจริงใน runtime**

XS / S / M / L / XL คือ **ขนาดสถานที่ / ขนาดงาน Production** ไม่ใช่ระดับความยาก

| Scale | ภารกิจ | สถานที่ | คำอธิบายสถานที่ |
|---|---|---|---|
${missionChapters.map((c, i) => `| ${["XS", "S", "M", "L", "XL"][i]} | ${c.title} | ${c.venue} | ${c.venueConcept} |`).join("\n")}

กติกากลางทุกฉาก: OUTPUT → INPUT เท่านั้น; ปฏิเสธ OUTPUT→OUTPUT, INPUT→INPUT, หัวต่อผิด, ชนิดสัญญาณผิด, พอร์ตที่มีสายแล้ว และเส้นทางที่ไม่อยู่ในกราฟของฉาก — การเชื่อมที่ผิดจะแจ้งเตือนและไม่เปลี่ยน state

`;
for (const s of scenarios) {
  const c = chapterOf(s);
  const byId = Object.fromEntries(s.cables.map((x) => [x.id, x]));
  m += `## ${s.id} — ${c.title} · ระดับ ${s.level} · ${s.title}

- **Venue:** ${s.venueScale.toUpperCase()} — ${c.venue} (${c.venueConcept})
- **Level:** ${s.level}
- **Learning goal:** ${GOALS[s.level - 1]}

**Equipment**

| ID | อุปกรณ์ | สถานะ | Model / หมายเหตุ | ประเภท |
|---|---|---|---|---|
${s.devices.map((d) => `| ${d.id} | ${d.label} | ${statusOf(d)} | ${d.model} | ${movable(s, d.id) ? "movable" : "fixed"} |`).join("\n")}

**Required connection graph / cables**

| Route | FROM (OUTPUT) | TO (INPUT) | สาย | หัวต่อ | สัญญาณ |
|---|---|---|---|---|---|
${s.requirements.map((r) => {
    const link = s.canonical?.find((k) => k.from === r.from[0] && k.to === r.to[0]);
    const cable = link ? byId[link.cableId] : null;
    return `| ${r.id} | ${r.from.join(" / ")} | ${r.to.join(" / ")} | ${cable?.id ?? "—"} | ${cable ? cable.ends.join(" → ") : "—"} | ${cable?.signalType ?? s.ports[r.from[0]]?.signalType ?? "—"} |`;
  }).join("\n")}

**Required actions (สถานะจำลอง)**

${s.actions.length ? s.actions.map((a) => `- \`${a.id}\` — ${a.label}; ต้องครบก่อน: ${a.needs.join(", ") || "—"}`).join("\n") : "- ไม่มี"}

**Optional connections:** ไม่มีเส้นทางเสริมที่ให้คะแนน${s.cables.some((x) => x.purpose === "distractor") ? `; สายสำรอง (${s.cables.filter((x) => x.purpose === "distractor").map((x) => x.ends[0]).join(", ")}) เป็นตัวเลือกหลอก ใช้ไม่ได้กับทุกพอร์ต` : ""}

**Completion rule:** ทุก required edge ในกราฟ + ทุก required action ต้องครบ; ใช้ engine เดียวกับหน้าเล่น (\`isComplete\`) — ไม่ตัดสินจากจำนวนสาย

**Initial state / faults:** ${s.initialConnections?.length ? `ต่อไว้แล้ว ${s.initialConnections.length} เส้น (บางช่วงถูกถอดออก)` : "เริ่มด้วยสายยังไม่เชื่อม"}${s.faults?.length ? `\n${s.faults.map((f) => `- ${f}`).join("\n")}` : ""}

**Provisional assumptions**

${(s.assumptions ?? []).map((a) => `- ${a}`).join("\n")}

`;
}
fs.writeFileSync(path.join(root, "docs/VENUE_SCENARIO_MATRIX.md"), m);

const seen = new Map();
for (const s of scenarios) for (const d of s.devices) {
  const key = `${s.venueScale}:${d.id}`;
  if (!seen.has(key)) seen.set(key, { scale: s.venueScale, d, levels: [] });
  seen.get(key).levels.push(s.level);
}
let inv = `# Equipment inventory

> สร้างอัตโนมัติจาก \`game/training/venue-scenarios.ts\` ด้วย \`node scripts/generate-venue-docs.mjs\`

- **CONFIRMED** — ระบุได้จากหลักฐานเดิมของงาน (ภาพ / การสำรวจห้องจริง)
- **PROVISIONAL** — มีหลักฐานบางส่วน ต้องตรวจยืนยันเพิ่ม ห้ามถือเป็นข้อเท็จจริง
- **GENERIC TRAINING MODEL** — อุปกรณ์แบบฝึกทั่วไป ไม่ใช่รุ่นจริงของมหาวิทยาลัย
- **UNKNOWN** — ยังไม่ทราบรุ่น

โมเดล 3D ของอุปกรณ์ generic เป็น placeholder สำหรับฝึก (กล่อง/รูปทรงพื้นฐานพร้อมป้ายพอร์ต) แทนที่ด้วย GLB จาก Blender ได้ภายหลัง

| Venue | ID | Equipment | Status | Model / assumption | ใช้ในระดับ |
|---|---|---|---|---|---|
${[...seen.values()].map(({ scale, d, levels }) => `| ${scale.toUpperCase()} | ${d.id} | ${d.label} | ${statusOf(d)} | ${d.model} | ${levels.join(", ")} |`).join("\n")}
`;
fs.writeFileSync(path.join(root, "docs/EQUIPMENT_INVENTORY.md"), inv);
console.log(`wrote ${scenarios.length} scenarios, ${seen.size} equipment rows`);
