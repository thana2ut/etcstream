// Read the local archive without changing it. Generated records are used by inspect and audit reports.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { SCENARIOS, load, projectRoot } from "../tests/helpers/solver.mjs";

const archive = process.argv.find((x) => x.startsWith("--archive="))?.slice(10) ?? "C:/Users/asus/Downloads/อุปกรณ์";
function csv(text) {
  const rows = []; let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { value += c; i++; } else quoted = !quoted; }
    else if (!quoted && (c === "," || c === "\n")) { row.push(value.replace(/\r$/, "")); value = ""; if (c === "\n") { rows.push(row); row = []; } }
    else value += c;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  // Some historical notes contain unquoted commas. Keep the fixed columns and rejoin the note tail.
  const header = rows.shift(); return rows.filter((r) => r.length >= 6).map((r) => Object.fromEntries(header.map((h, i) => [h.replace(/^\uFEFF/, ""), i === header.length - 1 ? r.slice(i).join(",") : r[i] ?? ""])));
}
const rows = csv(fs.readFileSync(path.join(archive, "00_INDEX/MASTER_REFERENCE_INDEX.csv"), "utf8"));
const records = {};
for (const row of rows) {
  const folder = path.join(archive, row.folder), pack = path.join(folder, "MODELING_REFERENCE_PACK.md");
  const packText = fs.readFileSync(pack, "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, "00_META/manifest.json"), "utf8"));
  const missing = [...(manifest.files ?? []), ...(manifest.shape_references ?? [])].filter((f) => !fs.existsSync(path.resolve(folder, f.path))).map((f) => f.path);
  if (missing.length) throw new Error(`${row.key}: missing ${missing.join(", ")}`);
  records[row.key] = { folder: row.folder, identity: row.identity, exactness: row.exactness, readiness: row.status,
    evidenceClass: row.exactness === "VERIFIED_EXACT" ? "exact" : row.exactness.startsWith("OWNER_SELECTED") ? "owner-selected"
      : row.exactness === "GENERIC_PROFILE" ? "generic" : row.key === "comica-wm300-owner-claim" ? "archive-only" : row.item_type === "equipment" ? "owner-specific" : row.key === "CTRL-REPLAY" ? "logical" : "shape-reference",
    missing: row.missing, notes: manifest.unresolved ?? row.notes, files: (manifest.files ?? []).map((f) => f.path), shapeFiles: (manifest.shape_references ?? []).map((f) => f.path),
    // The archive remains local. No manufacturer photographs are shipped in the game.
    pack: `${row.folder}/MODELING_REFERENCE_PACK.md`, packRead: packText.length > 0 };
}
const { MODEL_GEOMETRY } = load("../game/training/sim/model-geometry.ts");
const freeKey = (d) => d.modelId ?? (/Panasonic/.test(d.model) ? "panasonic-hc-x2000" : /HDS7105/.test(d.model) ? "devicewell-hds7105"
  : /PMX/.test(d.model) ? "pmx-402d-usb" : /WM100/.test(d.model) ? "comica-wm100-plus" : /HP /.test(d.model) ? "hp-15-6-reference"
    : /Samsung/.test(d.model) ? "samsung-u8000f" : /Sennheiser/.test(d.model) ? "sennheiser-xs1" : /Magewell/.test(d.model) ? "magewell-usb-capture-hdmi-gen2" : /Yamaha HS5/.test(d.model) ? "yamaha-hs5" : undefined);
const usage = new Map();
for (const scenario of Object.values(SCENARIOS)) {
  for (const d of [...scenario.devices, ...scenario.placeables.map((p) => p.device).filter(Boolean)]) {
    const key = freeKey(d); if (!key) continue;
    const entry = usage.get(key) ?? { ids: new Set(), scenarios: new Set(), generic: Boolean(d.generic) };
    entry.ids.add(d.id); entry.scenarios.add(scenario.id); usage.set(key, entry);
  }
}
// Free Practice's switcher and TV are authored room equipment, outside studioDevices.
for (const [key, id] of [["devicewell-hds7105", "switcher"], ["samsung-u8000f", "monitor"]]) {
  const u = usage.get(key) ?? { ids: new Set(), scenarios: new Set(), generic: false }; u.ids.add(id); u.scenarios.add("studio-full"); usage.set(key, u);
}
const glb = { "panasonic-hc-x2000": "hc-x2000.glb", "devicewell-hds7105": "hds7105.glb", "pmx-402d-usb": "pmx402d.glb", "hp-15-6-reference": "hp-laptop.glb", "samsung-u8000f": "samsung-u8000f.glb", "comica-wm100-plus": "comica-wm100-plus-rx.glb + comica-wm100-plus-tx.glb", "sennheiser-xs1": "sennheiser-xs1.glb", "yamaha-hs5": "yamaha-hs5.glb", "magewell-usb-capture-hdmi-gen2": "magewell-capture.glb" };
const table = [...usage].sort(([a], [b]) => a.localeCompare(b)).map(([key, u]) => {
  const r = records[key];
  if (!r) throw new Error(`No archive reference for active model ${key}`);
  const renderer = MODEL_GEOMETRY[key] ? key === "bmd-atem-mini-pro" ? "atem-mini-pro.tsx + MODEL_GEOMETRY" : "hardware-model.tsx + hardware-geometry.ts" : glb[key] ?? "generic-device.tsx";
  return `| ${key} | ${renderer} | ${r.folder} | ${r.exactness} / ${r.readiness} | ${[...u.scenarios].join(", ")} | ${(r.missing + "; " + r.notes).replaceAll("|", "/")} |`;
});
const report = `# Phase 07 — Audit ก่อนปรับโมเดลจากคลัง local\n\nวันที่ 21 ต.ค. 2026 · อ่านอย่างเดียวจาก \`${archive}\`\n\nอ่าน index, readiness, reconciliation, owner decisions ข้อ 1–2 และ checkpoint/report ล่าสุดของคลังกับ Phase 05 ก่อนแก้ modeling. แพ็กทั้ง ${rows.length} รายการอ่านได้; manifest file paths ของแต่ละแพ็กมีไฟล์จริง. รายงานนี้ไม่ยกระดับ readiness จากการมีภาพอย่างเดียว.\n\n## ขอบเขตเดิม\n\n- ${usage.size} โปรไฟล์ที่ใช้อยู่ (รวม Free Practice และ stock ของแต่ละ venue); ${Object.keys(MODEL_GEOMETRY).length} รุ่นมี geometry registry แล้ว และมี GLB ห้องฝึกเดิม\n- คงระบบ Three.js ${JSON.parse(fs.readFileSync(path.join(projectRoot, "node_modules/three/package.json"), "utf8")).version}, React Three Fiber, procedural parts และ GLB เดิม; bottom-centre pivot, เมตร, Y-up, display scale เดิม\n- stock รวมต่อ venue ครบจาก Phase 05; ต้องรักษา IDs, save signature, ports และ pass conditions\n- ไม่คัดลอกภาพผู้ผลิตเข้า public: ใช้ภาพเพื่ออ่านรูปทรง; สิทธิ์เผยแพร่ภาพต้นฉบับยังไม่ยืนยัน\n- Samsung GAME target: UA85U8000FKXXT; WM100 PLUS GAME target เท่านั้น; WM300 archive ถูกกันออก\n- ช่องว่างที่ตรวจพบ: inspect ยังใช้ข้อความชั่วคราวรวมทุกชนิด; หัว socket XLR ไม่มีขา/รูแยกเพศ; SM58 ยังเป็นกระบอกขั้น; Samsung GLB ยังเขียน UA43 และสัดส่วน 43 นิ้ว; ทบทวนรูปทรง COMICA จากเฉพาะ WM100 official; cable locking/assemblies ต้องเทียบ local shape\n\n## Mapping จากโค้ดจริงก่อนแก้\n\n| equipment key | model file/component | reference folder | status | venue usage (รวม stock) | unresolved notes |\n|---|---|---|---|---|---|\n${table.join("\n")}\n\n## หลักเกณฑ์การปรับ\n\nExact: casing/connector/control/silhouette จากภาพและ drawing ที่มี; มุมที่ขาดคงประมาณพร้อม notes. Pending/owner-specific: คงตัวตนตาม pack และไม่เพิ่มตราที่ไม่ยืนยัน. Generic: อ่านพอร์ตจริงจากโปรไฟล์และปรับ silhouette ให้ชัดโดยไม่มีแบรนด์. อุปกรณ์ภาพจริง 19 verified folders + Sennheiser XS 1 ใน pending section ต้องแยก identity ออกจาก readiness.\n\nรายงานสร้างก่อนแก้ geometry ใน Phase 07; ดูรายงาน implementation และ regression สำหรับผลหลังแก้.\n`;
fs.writeFileSync(path.join(projectRoot, "docs/hardware-3d/PHASE07_LOCAL_REFERENCE_MODELING_AUDIT_TH.md"), report);
fs.writeFileSync(path.join(projectRoot, "game/content/local-reference-evidence.json"), JSON.stringify(records, null, 2) + "\n");
console.log(JSON.stringify({ packs: rows.length, activeProfiles: usage.size, exact: Object.values(records).filter((r) => r.evidenceClass === "exact").length, audit: "docs/hardware-3d/PHASE07_LOCAL_REFERENCE_MODELING_AUDIT_TH.md" }));

if (process.argv.includes("--contact-sheets") || process.argv.includes("--cable-sheets")) {
  const sharp = createRequire(import.meta.url)("sharp"), out = path.join(os.tmpdir(), "edustream-phase07-references"); fs.mkdirSync(out, { recursive: true });
  for (const row of rows.filter((r) => process.argv.includes("--cable-sheets") ? r.item_type !== "equipment" : r.item_type === "equipment" && r.key !== "comica-wm300-owner-claim" && r.exactness !== "GENERIC_PROFILE")) {
    const r = records[row.key], folder = path.join(archive, r.folder);
    const images = [...new Set([...r.files, ...r.shapeFiles])].filter((f) => /\.(png|jpe?g|tiff?|webp)$/i.test(f) && (row.key !== "samsung-u8000f" || /85in/.test(f)));
    const composite = [];
    for (const [i, f] of images.entries()) {
      const thumb = await sharp(path.resolve(folder, f), { unlimited: true }).resize(450, 305, { fit: "contain", background: "#e6e7e9" }).png().toBuffer();
      composite.push({ input: thumb, left: i % 3 * 450, top: Math.floor(i / 3) * 335 });
      const label = Buffer.from(`<svg width="450" height="30"><rect width="450" height="30" fill="#fff"/><text x="6" y="20" font-size="12">${String(i + 1)} ${path.basename(f).replace(/[<>&]/g, "_").slice(0, 58)}</text></svg>`);
      composite.push({ input: label, left: i % 3 * 450, top: Math.floor(i / 3) * 335 + 305 });
    }
    if (images.length) await sharp({ create: { width: 1350, height: Math.ceil(images.length / 3) * 335, channels: 3, background: "#eee" } }).composite(composite).png().toFile(path.join(out, `${row.key}.png`));
    console.log(`${row.key}: ${images.length} images ${path.join(out, `${row.key}.png`)}`);
  }
}
