/** Generate owner-only Phase 08 documents from the current canonical mission definitions. */
import fs from "node:fs";
import path from "node:path";
import { load, projectRoot, SCENARIOS, STAGE_IDS } from "../tests/helpers/solver.mjs";

const { requiredBag, venueCandidateStock } = load("../game/content/mission-bag.ts");
const { catalogIdFor, PHYSICAL_CABLE_CATALOG, CABLE_CATALOG } = load("../game/content/cable-catalog.ts");
const ids = STAGE_IDS.sort((a, b) => ["xs", "s", "m", "l", "xl"].indexOf(a.split("-")[0]) - ["xs", "s", "m", "l", "xl"].indexOf(b.split("-")[0]) || Number(a.split("-")[1]) - Number(b.split("-")[1]));
const room = { xs: "ห้องเรียน", s: "สตูดิโอภารกิจ", m: "หอประชุม", l: "สนามกลางแจ้ง", xl: "ถ่ายทอดกีฬา" };
const safe = (value) => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
const list = (values) => values.length ? values.map((x) => `\`${x}\``).join(", ") : "—";
const counts = (bag) => Object.entries(bag).length ? Object.entries(bag).sort(([a], [b]) => a.localeCompare(b)).map(([id, n]) => `\`${id}\` ×${n}`).join("<br>") : "ไม่ต้องนำสายเพิ่ม (ซ่อมจากสายที่อยู่ในฉาก)";
const write = (name, content) => fs.writeFileSync(path.join(projectRoot, "docs", name), `${content.trim()}\n`, "utf8");
const faultLines = (faults) => faults?.length ? faults.map((f) => {
  const parts = [f.label];
  for (const [from, to] of f.unplug ?? []) parts.push(`สายหลุด: ${from} → ${to}`);
  if (f.repatch) parts.push(`สายผิดจุด: ${f.repatch.pair.join(" → ")} (เริ่มที่ ${f.repatch.from ?? f.repatch.pair[0]} → ${f.repatch.to ?? f.repatch.pair[1]}${f.repatch.cable ? ` ด้วย ${f.repatch.cable}` : ""})`);
  for (const c of f.config ?? []) parts.push(`ตั้งค่าผิด: ${c.device}.${c.key} = ${String(c.value)}`);
  return `- \`${f.id}\` ${parts.join("; ")}`;
}).join("\n") : "- ไม่มี fault เริ่มต้น";

const principles = [
  "# Phase 08 — หลักการต่อสายและอุปกรณ์ครบ 25 ด่าน",
  "", "แหล่งข้อมูล: `game/training/sim/reference-stages.ts`, `game/training/sim/stages.ts`, `game/training/venue-scenarios.ts` และ `game/training/sim/engine.ts` ณ วันที่ 21 ตุลาคม 2026", "",
  "กราฟคำตอบจริงอยู่ใน `stage.solution` แล้วแปลงเป็น `scenario.canonical`; การเพิ่มตัวเลือกสายไม่เปลี่ยนกราฟ เงื่อนไขผ่าน รหัสพอร์ต หรือการเซฟเดิม", "",
  "## หลักการร่วม", "",
  "1. ต่อ OUTPUT → INPUT โดยชนิดหัวและระดับสัญญาณต้องรองรับ; HDMI/SDI ข้ามชนิดต้องผ่านตัวแปลงที่เปิดใช้งาน", "2. USB DEVICE → USB HOST ด้วยสายข้อมูล; RF ใช้การจับคู่ ไม่ใช่สาย RF", "3. Optical ต้องมีคู่ TX/RX และไฟเลี้ยง; Multiview แยกจาก Program", "4. เสียงต้องผ่านบัส/การฝังเสียงที่ถูกต้องก่อนถึงปลายทาง; สายอย่างเดียวไม่ถือว่าระบบพร้อม", "5. สาย `CTRL-REPLAY` เป็นลิงก์ควบคุมจำลอง ไม่ใช่ของกายภาพในกระเป๋า", "6. ทดสอบและตรวจรับจากกราฟปัจจุบันใหม่เมื่อถอดสายหรือเปลี่ยนค่าควบคุม; สนามกลางแจ้งยังต้องผ่าน GO/NO-GO", "",
  "## การใช้กราฟจริงรายด่าน", "", "| ห้อง / ด่าน | ใบงานปัจจุบัน | เส้นทางที่ต้องต่อ | อุปกรณ์เป้าหมาย | เงื่อนไขสำคัญ |", "|---|---|---:|---:|---|",
  ...ids.map((id) => { const s = SCENARIOS[id], st = s.stage; return `| ${room[st.room]} \`${st.id}\` | ${safe(st.ticket)} | ${s.canonical.length} | ${st.devices.length} | ${safe(st.objectives.filter((o) => o.critical).map((o) => o.label).slice(0, 3).join("; "))} |`; }),
  "", "คู่มือพอร์ตต่อพอร์ตและเงื่อนไขทั้งหมดอยู่ใน `PHASE08_EXACT_PORT_TO_PORT_ANSWER_KEY_TH.md`; รายการด้านบนเป็นสารบัญ ไม่ใช่ใบ้คำตอบในหน้าเกม", "",
  "## ข้อจำกัดหลักฐาน", "", "รุ่น/หัว Optical, เพศหัว SMPTE และพอร์ตของโปรไฟล์ฝึกบางตัวคงสถานะ GENERIC/PROVISIONAL ตาม registry; ไม่เติมพอร์ตสมมติจากบรีฟตัวอย่าง",
];
write("PHASE08_WIRING_PRINCIPLES_ALL_25_TH.md", principles.join("\n"));

const matrix = ["# Phase 08 — ตารางการเลือกสายและตัวลวงครบ 25 ด่าน", "", "สร้างจาก `requiredBag(scenario)`, `PHYSICAL_CABLE_CATALOG` และ fault ปัจจุบัน ไม่เปิดเผยในหน้าเตรียมสาย", "", `รายการในแคตตาล็อกเดิม ${CABLE_CATALOG.length} รหัส; ตัวเลือกกายภาพ ${PHYSICAL_CABLE_CATALOG.length} รหัส (รวมหัวแปลง 2 รหัส ไม่รวม CTRL-REPLAY)`, "", "สต็อกหน้าจัดสายคือคลังฝึก 32 ชิ้นต่อชนิด (หรือมากกว่านั้นหากกราฟห้องต้องใช้มากกว่า) เพื่อไม่ใบ้จำนวนที่ต้องใช้; ไม่ได้เพิ่มสายเข้าไปในฉาก", "", "| ด่าน | สายที่ต้องแพ็กจริง | ทางเลือกที่รองรับ | ตัวลวงที่เลือกได้แต่ไม่ใช้ในด่าน | สายเริ่มต้น/จุดผิด L4 | ชุดอัตโนมัติ Admin |", "|---|---|---|---|---|---|"];
for (const id of ids) {
  const s = SCENARIOS[id], bag = requiredBag(s), distractors = PHYSICAL_CABLE_CATALOG.filter((c) => !Object.hasOwn(bag, c.id)).map((c) => c.id);
  const initially = (s.initialConnections ?? []).map((c) => c.cableId);
  const faulted = (s.stage.faults ?? []).map((f) => f.id);
  matrix.push(`| \`${s.stage.id}\` | ${counts(bag)} | ไม่มีกราฟสายทางเลือกที่ประกาศใน StageManifest | ${list(distractors)} | เริ่มต่อไว้: ${list(initially)}; fault: ${list(faulted)} | ${counts(bag)} |`);
}
matrix.push("", "การเลือกตัวลวงถูกปฏิเสธก่อนเข้าด่านโดยไม่ลบของในกระเป๋า; fault ที่ต่อผิดอยู่แล้วใน L4 เป็นสถานะฉาก ไม่ใช่สายที่ผู้เล่นต้องแพ็กเพิ่ม");
write("PHASE08_CABLE_SELECTION_AND_DISTRACTOR_MATRIX_TH.md", matrix.join("\n"));

const answer = ["# Phase 08 — คู่มือคำตอบพอร์ตต่อพอร์ตจากโค้ดปัจจุบัน (สำหรับเจ้าของ/ผู้พัฒนา)", "", "สร้างจาก `SCENARIOS` 25 ด่านโดยตรง; ห้ามนำตารางนี้ไปแสดงใน goal-only briefing ของผู้เล่น", "", "รหัส `lead-N` เป็นรหัสสายภายในด่าน; รหัสชนิดในวงเล็บคือรายการแคตตาล็อก ผู้เล่นต้องจับคู่ปลาย OUTPUT กับ INPUT ด้วยตนเอง", ""];
for (const id of ids) {
  const s = SCENARIOS[id], st = s.stage, initial = new Set((s.initialConnections ?? []).map((c) => c.cableId));
  answer.push(`## ${st.id} — ${st.title}`, "", `ห้อง: ${room[st.room]} · ใบงาน: ${st.ticket} · กราฟ: \`${s.selectedTopologyId}\` · สถานะหลักฐาน: ${s.referenceStatus}`, "", "### อุปกรณ์ที่ด่านใช้", "", "| รหัส | ชื่อในเกม | โปรไฟล์อุปกรณ์ |", "|---|---|---|");
  for (const device of st.devices) { const d = s.devices.find((x) => x.id === device); answer.push(`| \`${device}\` | ${safe(d?.label)} | \`${safe(d?.modelId ?? d?.model)}\` |`); }
  answer.push("", "### เส้นทางสายที่ต้องได้จริง", "", "| ต้นทาง OUT | พอร์ตต้นทาง | สายภายใน (ชนิดแคตตาล็อก) | ปลายทาง IN | พอร์ตปลายทาง | สถานะเริ่มต้น |", "|---|---|---|---|---|---|");
  for (const route of s.canonical) {
    const cable = s.cables.find((c) => c.id === route.cableId), from = s.ports[route.from], to = s.ports[route.to];
    answer.push(`| \`${route.from.split(":")[0]}\` | \`${route.from}\` ${safe(from?.label)} | \`${route.cableId}\` (\`${catalogIdFor(cable)}\`, ${safe(cable.ends.join(" → "))}) | \`${route.to.split(":")[0]}\` | \`${route.to}\` ${safe(to?.label)} | ${initial.has(route.cableId) ? "ต่อไว้ในฉาก (อาจมี fault)" : cable.fixedA ? "ติดมากับอุปกรณ์" : catalogIdFor(cable) === "CTRL-REPLAY" ? "ลิงก์จำลอง ไม่ต้องแพ็ก" : "ผู้เล่นต้องต่อ"} |`);
  }
  answer.push("", `กระเป๋าสายกายภาพที่ต้องเลือก: ${counts(requiredBag(s))}`, "", "### การตั้งค่าและการกระทำ", "", "| อุปกรณ์ | ค่าควบคุม | ค่าที่ต้องได้ |", "|---|---|---|");
  for (const c of st.solutionConfig) answer.push(`| \`${c.device}\` | \`${c.key}\` | ${safe(c.value)} |`);
  answer.push("", `คิวสลับภาพ: ${st.cues?.length ? st.cues.map((c) => `${safe(c.call)} → ${safe(c.expect)}`).join("; ") : "ไม่มีคิวบังคับ"}`, "", "### Fault และการซ่อม", "", faultLines(st.faults), "", `Surprise fault หลังซ้อม (ถ้ามี): ${(st.surpriseFaults ?? []).map((f) => `\`${f.id}\` ${safe(f.label)}`).join("; ") || "ไม่มี"}`, "", "### เงื่อนไขตรวจรับจริง", "", ...st.objectives.map((o) => `- \`${o.id}\` [${o.stage}${o.critical ? ", สำคัญ" : ""}] ${o.label}`), "", "---", "");
}
write("PHASE08_EXACT_PORT_TO_PORT_ANSWER_KEY_TH.md", answer.join("\n"));

const free = ["# Phase 08 — คู่มือต่อสายห้องฝึกอิสระ", "", "ห้องฝึกอิสระเป็น sandbox แยกจากสตูดิโอภารกิจ 5 ด่าน: `hdmi-basic` และ `studio-full` ใช้ข้อมูล `game/training/scenarios.ts` / `game/training/hdmi-training.ts`", "", "ไม่มี `stage` จึงไม่ใช้กฎกระเป๋าแบบตรงทุกเส้นของ 25 ด่าน และไม่เปลี่ยนรหัสเซฟ/ความคืบหน้า", ""];
for (const id of ["hdmi-basic", "studio-full"]) {
  const s = SCENARIOS[id]; free.push(`## ${id}`, "", `อุปกรณ์ ${s.devices.length} ตัว · สาย ${s.cables.length} เส้น · เงื่อนไข ${s.requirements.length} ข้อ`, "", "| เงื่อนไข | ต้นทางที่รองรับ | ปลายทางที่รองรับ |", "|---|---|---|");
  for (const r of s.requirements) free.push(`| ${safe(r.label)} | ${list(r.from)} | ${list(r.to)} |`);
  free.push("", "### สายและหัวแปลงในห้องฝึก", "", ...s.cables.map((c) => `- \`${c.id}\` ${c.label}: ${c.ends.join(" → ")}${c.socketB ? `; หัวแปลง ช่องรับ ${c.socketB}` : ""}${c.fixedA ? "; ติดกับอุปกรณ์" : ""}`), "");
}
free.push("เส้นทางพื้นฐาน: Camera HDMI OUT → สาย HDMI → Switcher HDMI IN; Switcher HDMI OUT ที่ตั้งบทบาทถูกต้อง → สาย HDMI → Monitor HDMI IN แล้วเลือกต้นทาง/โหมดเอาต์พุตให้ตรง", "", "COMICA WM100 PLUS เป็นเป้าหมายในเกม แยกจากภาพอ้างอิง WM300/WM300-TX ที่เก็บใน archive; ไม่สลับรุ่น", "", "หัวต่อ/การดูรายละเอียดใช้โมเดลร่วมกับภารกิจ แต่กฎทดลองอิสระและสถานะเซฟไม่ถูกแทนที่");
write("PHASE08_FREE_PRACTICE_CONNECTION_GUIDE_TH.md", free.join("\n"));

write("PHASE08_REGRESSION_AND_VALIDATION_TH.md", `# Phase 08 — การตรวจและข้อจำกัด\n\nวันที่ 21 ตุลาคม 2026\n\nผู้ใช้สั่ง **ห้ามทดสอบใด ๆ** ในข้อความท้ายคำขอ จึงเพิ่มชุดตรวจอัตโนมัติไว้แต่ **ไม่ได้รัน** npm test, npm run lint, npm run build, TypeScript check หรือ browser playtest; ไม่มีตัวเลขผ่าน/ล้มเหลวที่จะอ้างได้\n\nไฟล์ชุดตรวจใหม่: tests/phase08-cable-selection.test.mjs ครอบคลุม 25 กราฟ แคตตาล็อกกายภาพ ตัวลวง จำนวนที่ขาด/เกิน Admin และ Free Practice\n\nการแก้ไม่เปลี่ยนรหัส mission, hardware, port, stage.solution, scenario.canonical, equipment union, save schema, Supabase หรือข้อมูลผู้เล่น\n\nข้อจำกัด: ไม่มีการรับรองผลรันอัตโนมัติหรือผลเล่นจริงจนกว่าเจ้าของอนุญาตให้ตรวจ; ความถูกต้องของฮาร์ดแวร์ PENDING/GENERIC ยังคงตาม Phase 07\n`);
write("PHASE08_OWNER_FINAL_PLAYTEST_TH.md", `# Phase 08 — เช็กลิสต์ทดสอบครั้งสุดท้ายของต้า\n\n- [ ] เปิดหน้าจัดสายทุกห้อง: เห็นสายกายภาพครบทุกหมวดและหัวแปลง โดยไม่เห็น CTRL-REPLAY\n- [ ] ใส่สายผิด สายขาด สายเกิน: เห็นคำเตือนสีแดงตรงกลางและของในกระเป๋ายังอยู่\n- [ ] ใส่สายตรงตามด่าน: เข้าฉากได้; ด่าน L4 ที่ต่อสายไว้แล้วไม่บังคับแพ็กเพิ่ม\n- [ ] เปิดแต่ละห้อง XS/ST/AU/OUT/SP ตรวจการต่อพอร์ต การตั้งค่า และการตรวจรับจากกราฟจริง\n- [ ] Admin เข้าด่านทั้ง 25 โดยได้เฉพาะสายจำเป็น; Free Practice ทดลองสายได้โดยไม่ติด strict gate\n- [ ] ตรวจหน้าจัดสายบนมือถือและแท็บเล็ต พร้อมปุ่มดูรายละเอียด\n- [ ] กลับเข้าเกมและโหลดเซฟเดิม ตรวจความคืบหน้าและรหัสอุปกรณ์เดิม\n- [ ] OUT ยังเคารพคำเตือนฟ้าผ่าและ GO/NO-GO; SP แยก Replay control จากสายภาพ; AU ดูสายหาง MCX/BNC; OUT ดู AJA breakout\n`);
write("PHASE08_CHECKPOINT_TH.md", `# Phase 08 — จุดพักงาน\n\nวันที่ 21 ตุลาคม 2026 · โครงการ D:/etcstream\n\nงานหลัก: ขยายตัวเลือกกายภาพทั่วทั้ง 25 ด่าน เพิ่มหัวแปลง 2 รายการ แยก CTRL-REPLAY ออกจากกระเป๋า คง strict validation/Admin/Free Practice; คู่มือ A–F สร้างจากกราฟปัจจุบันด้วย scripts/generate-phase08-docs.mjs\n\nไม่ได้เปลี่ยน canonical graph, hardware ID, union หรือ save schema; ไม่ใช้ SQL/Supabase เพราะงานนี้เป็นข้อมูลเกมใน repository\n\nคำสั่งผู้ใช้ล่าสุด: ห้ามทดสอบ; ให้นำขึ้น Git/เว็บเมื่อเสร็จ ดังนั้นผลทดสอบอัตโนมัติยังไม่มี และ browser playtest เป็นของเจ้าของ\n\nหากทำต่อ: ตรวจ diff ของ Phase 08 เท่านั้น, ห้ามรวมไฟล์เจ้าของที่ไม่เกี่ยวข้อง, ส่งขึ้น Git/เว็บตามคำสั่งล่าสุด แล้วรายงานข้อจำกัดอย่างตรงไปตรงมา\n`);
console.log(`Generated Phase 08 Thai docs for ${ids.length} canonical missions and 2 Free Practice scenarios.`);
