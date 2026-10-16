/**
 * MASTER V2 Gate 0/2 extractor. Reads ONLY the live mission code and writes:
 *   docs/generated/hardware-audit.json            (machine-readable manifest)
 *   docs/generated/STAGE_GRAPHS_GENERATED_TH.md   (per-stage BOM + edge list, appended into doc 02)
 *   docs/generated/MODEL_UNION_GENERATED_TH.md    (unique equipment models with their port maps)
 * Run: npx tsx scripts/generate-hardware-audit.ts   (read-only on game data; never edits stages)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { SCENARIOS } from "../game/training/scenarios";
import { MODELS } from "../game/training/sim/equipment";
import { MISSION_ROOMS as ROOMS } from "../game/training/sim/rooms";
import { catalogIdFor } from "../game/content/cable-catalog";
import { requiredBag } from "../game/content/mission-bag";

const VENUES = ["xs", "s", "m", "l", "xl"] as const;
const out: Record<string, unknown>[] = [];
const modelUse = new Map<string, Set<string>>();
let md = "";

for (const v of VENUES) {
  const room = ROOMS[v];
  md += `\n## ${room.code} · ${room.title} (${room.subtitle})\n`;
  for (let level = 1; level <= 5; level++) {
    const s = SCENARIOS[`${v}-${level}` as keyof typeof SCENARIOS];
    const st = s.stage!;
    const portable = new Set(s.placeables.filter((p) => !p.installed).map((p) => p.id));
    const desk = new Set(s.placeables.filter((p) => p.installed).map((p) => p.id));
    const devices = st.devices.map((id) => {
      const inst = room.instances[id];
      const m = MODELS[inst.model];
      if (!modelUse.has(inst.model)) modelUse.set(inst.model, new Set());
      modelUse.get(inst.model)!.add(st.id);
      return { id, tag: inst.tag, label: inst.label, model: inst.model, maker: m.manufacturer, name: m.name, generic: m.generic, sourceUrl: m.sourceUrl ?? null,
        placement: portable.has(id) ? "boxed→carry" : desk.has(id) ? "installed·liftable" : "fixed" };
    });
    const pre = new Set((s.initialConnections ?? []).map((c) => c.cableId));
    const edges = (s.canonical ?? []).map((r, i) => {
      const cable = s.cables.find((c) => c.id === r.cableId)!;
      return { edgeId: `${st.id}-E${String(i + 1).padStart(2, "0")}`, cableInstanceId: r.cableId, catalog: catalogIdFor(cable), ends: cable.ends.join("→"),
        from: r.from, to: r.to, prewired: pre.has(r.cableId), factoryAttached: Boolean(cable.fixedA) };
    });
    const distractors = s.cables.filter((c) => c.purpose === "distractor" || c.stockRole === "spare").map((c) => `${c.id} (${catalogIdFor(c)})`);
    const config = st.solutionConfig.map((c) => `${c.device}.${c.key}=${String(c.value)}`);
    const faults = [...(st.faults ?? []), ...(st.surpriseFaults ?? [])].map((f) => `${f.id}: ${f.label}`);
    const bag = requiredBag(s);
    out.push({ stageId: st.id, venue: room.code, level, title: st.title, guidance: st.guidance, ticket: st.ticket, devices, edges, distractors, config, faults,
      objectives: st.objectives.map((o) => o.id), requiredBag: bag, prewired: st.prewired ?? null, weather: st.weather ?? null });

    md += `\n### ${st.id} · ${st.title}\n\n- รูปแบบด่าน: \`${st.guidance}\` · ใบงาน: ${st.ticket}\n`;
    md += `- แหล่งในโค้ด: \`game/training/sim/stages.ts\` / \`reference-stages.ts\` (stage \`${st.id}\`), ห้อง \`game/training/sim/rooms.ts\` + \`reference-rooms.ts\` (\`${v}\`), ประกอบฉาก \`game/training/venue-scenarios.ts\`\n\n`;
    md += `| อุปกรณ์ (id) | ป้ายในเกม | model key | ผู้ผลิต / ชื่อในโค้ด | generic | การวาง |\n|---|---|---|---|---|---|\n`;
    for (const d of devices) md += `| ${d.id} | ${d.label} (${d.tag}) | \`${d.model}\` | ${d.maker} · ${d.name} | ${d.generic ? "ใช่" : "ไม่"} | ${d.placement} |\n`;
    md += `\n| edge | สาย (instance) | ชนิดแคตตาล็อก | หัวต่อ | จาก (OUTPUT) | ไป (INPUT) | หมายเหตุ |\n|---|---|---|---|---|---|---|\n`;
    for (const e of edges) md += `| ${e.edgeId} | ${e.cableInstanceId} | ${e.catalog} | ${e.ends} | \`${e.from}\` | \`${e.to}\` | ${e.prewired ? "ต่อไว้แล้ว" : ""}${e.factoryAttached ? " ติดมากับอุปกรณ์" : ""} |\n`;
    // Port-capacity accounting: every port occupied by the canonical graph (prewired included) per device.
    const used = new Map<string, string[]>();
    for (const e of edges) for (const pid of [e.from, e.to]) { const dev = pid.split(":")[0]; used.set(dev, [...(used.get(dev) ?? []), pid.split(":")[1]]); }
    md += `\n| อุปกรณ์ | พอร์ตที่ใช้ / พอร์ตทั้งหมดในโปรไฟล์ | พอร์ตที่ถูกใช้ |\n|---|---|---|\n`;
    for (const d of devices) { const u = used.get(d.id) ?? []; md += `| ${d.id} | ${u.length} / ${MODELS[d.model].ports.length} | ${u.join(", ") || "—"} |\n`; }
    md += `\n- กระเป๋าที่ต้องใช้ (คำนวณ): ${Object.entries(bag).map(([k, n]) => `${k}×${n}`).join(", ") || "ไม่มี"}\n`;
    md += `- การตั้งค่าที่ไม่ใช่สาย (solutionConfig): ${config.join(" · ") || "ไม่มี"}\n`;
    md += `- fault: ${faults.join(" · ") || "ไม่มี"}\n- สาย distractor/spare: ${distractors.join(", ") || "ไม่มี"}\n- objective ids: ${st.objectives.map((o) => o.id).join(", ")}\n`;
  }
}

let union = "| model key | ผู้ผลิต | ชื่อในโค้ด | generic | sourceUrl ในโค้ด | ใช้ในด่าน | พอร์ต (key: ป้าย · ทิศ · หัวต่อ · สัญญาณ) |\n|---|---|---|---|---|---|---|\n";
const models: Record<string, unknown>[] = [];
for (const [key, stages] of [...modelUse.entries()].sort()) {
  const m = MODELS[key];
  models.push({ key, maker: m.manufacturer, name: m.name, generic: m.generic, sourceUrl: m.sourceUrl ?? null, role: m.role, stages: [...stages], ports: m.ports.map((p) => ({ key: p.key, name: p.name, dir: p.dir, connector: p.connector, sig: p.sig, panel: p.panel ?? null })) });
  union += `| \`${key}\` | ${m.manufacturer} | ${m.name} | ${m.generic ? "ใช่" : "ไม่"} | ${m.sourceUrl ?? "—"} | ${[...stages].join(", ")} | ${m.ports.map((p) => `${p.key}: ${p.name} · ${p.dir} · ${p.connector} · ${p.sig}`).join("<br>")} |\n`;
}

mkdirSync("docs/generated", { recursive: true });
writeFileSync("docs/generated/hardware-audit.json", JSON.stringify({ generatedFrom: "live repository", stages: out, models }, null, 2));
writeFileSync("docs/generated/STAGE_GRAPHS_GENERATED_TH.md", `# กราฟและ BOM ทั้ง 25 ด่าน (สร้างอัตโนมัติจากโค้ด)\n\nสร้างโดย \`npx tsx scripts/generate-hardware-audit.ts\` · ห้ามแก้มือ\n${md}`);
writeFileSync("docs/generated/MODEL_UNION_GENERATED_TH.md", `# อุปกรณ์ทั้งหมดที่ใช้ใน 25 ด่าน (สร้างอัตโนมัติจากโค้ด)\n\n${union}`);
console.log(`stages=${out.length} models=${models.length}`);
