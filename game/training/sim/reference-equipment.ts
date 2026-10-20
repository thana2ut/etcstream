import type { ControlDefinition, EquipmentDefinition, PortDefinition } from "./types";

const power: ControlDefinition = { key: "power", label: "ไฟเลี้ยงจำลอง", kind: "toggle", default: false, tip: "ยืนยันแหล่งจ่ายที่ช่างเตรียมไว้ ไม่เดินไฟฟ้าหลัก" };
const toggle = (key: string, label: string): ControlDefinition => ({ key, label, kind: "toggle", default: false, tip: label });
const select = (key: string, label: string, options: string[], initial = options[0]): ControlDefinition => ({ key, label, kind: "select", options, default: initial, tip: label });
const p = (key: string, name: string, dir: PortDefinition["dir"], connector: PortDefinition["connector"], sig: PortDefinition["sig"]): PortDefinition => ({ key, name, dir, connector, sig, panel: "rear", tip: name, ...(["SDI", "HDMI"].includes(sig) ? { formats: ["1080p50"] as const as ["1080p50"] } : {}) });
const generic = (modelId: string, name: string, role: EquipmentDefinition["role"], ports: PortDefinition[], controls: ControlDefinition[], refs: string[], extra: Partial<EquipmentDefinition> = {}): EquipmentDefinition => ({
  modelId, name, role, ports, controls, manufacturer: "โมเดลจำลองเพื่อฝึก", generic: true, needsPower: true, kind: "box", size: [0.6, 0.22, 0.38],
  verifiedPorts: ports.map((port) => port.name), assetLicense: "โมเดลฝึกสร้างในโครงการ ไม่ใช่สำเนาผลิตภัณฑ์",
  appendixReferenceIds: refs, notes: ["แบบระบบอ้างอิงตาม Appendix A ไม่ใช่ครุภัณฑ์ที่ยืนยันของสถานที่", "ตำแหน่งและขั้วต่อเป็นโปรไฟล์ฝึก ไม่ยืนยันรุ่นหรือรูปแผงหลังของจริง"], ...extra,
});

/** Only the selected, documented role-level interfaces are modeled; no vendor-specific optical protocol is invented. */
export function referenceModels(base: Record<string, EquipmentDefinition>): EquipmentDefinition[] {
  const channels = [1, 2, 3, 4, 5, 6];
  const stagebox = generic("reference-stagebox-6", "กล่องรับเสียงเวที 6 ช่อง (แบบฝึกอนาล็อก)", "stagebox", [
    ...channels.map((n) => p(`mic-in-${n}`, `MIC IN ${n}`, "INPUT", "XLR", "MIC")), p("multicore", "MULTICORE OUT · ช่อง 1–6", "OUTPUT", "MULTICORE", "MULTICORE"),
  ], [], ["R10", "R14", "R17"], { needsPower: false });
  const tail = generic("reference-tail-6", "หางสายมัลติคอร์ 6 ช่อง", "snake-tail", [p("multicore", "MULTICORE IN · ช่อง 1–6", "INPUT", "MULTICORE", "MULTICORE"), ...channels.map((n) => p(`tail-${n}`, `TAIL ${n}`, "OUTPUT", "XLR", "MIC"))], [], ["R10", "R14"], { needsPower: false });
  const mixer = generic("reference-console-6", "คอนโซลเสียงแยกบัส PA / BROADCAST", "mixer", [
    ...channels.map((n) => p(`in-${n}`, `CH ${n} MIC/LINE IN`, "INPUT", "XLR", "MIC")),
    ...["pa-l", "pa-r", "bc-l", "bc-r"].map((key) => p(key, `${key.toUpperCase()} LINE OUT`, "OUTPUT", "XLR", "LINE_BAL")),
  ], [power, ...channels.flatMap((n) => [select(`ch${n}-gain`, `CH${n} GAIN`, ["Minimum", "Nominal (peaks −18 dBFS)", "Too hot (clips)"]), toggle(`ch${n}-on`, `เปิดช่อง ${n}`), toggle(`ch${n}-pa`, `CH${n} → PA`), toggle(`ch${n}-bc`, `CH${n} → BROADCAST`), toggle(`ch${n}-phantom`, `CH${n} +48V (เฉพาะไมค์ที่ต้องใช้)`)]), select("pa-fader", "ระดับ PA", ["Down", "Unity"]), select("bc-fader", "ระดับ BROADCAST", ["Down", "Unity"])], ["R10", "R12", "R17"], { kind: "mixer", size: [1.15, 0.25, 0.55] });
  const fieldTx = generic("reference-fiber-tx", "ตัวส่ง SDI → Optical (คู่ส่งรับที่ตรงกัน)", "converter", [p("sdi-in", "SDI IN · 75Ω", "INPUT", "SDI", "SDI"), p("optical-out", "OPTICAL OUT · สายชุดเข้าคู่", "OUTPUT", "FIBER", "FIBER_VIDEO")], [power], ["R07", "R09"], { transport: { kind: "tx", family: "field-sdi-optical" } });
  const fieldRx = generic("reference-fiber-rx", "ตัวรับ Optical → SDI (คู่ส่งรับที่ตรงกัน)", "converter", [p("optical-in", "OPTICAL IN · สายชุดเข้าคู่", "INPUT", "FIBER", "FIBER_VIDEO"), p("sdi-out", "SDI OUT · 75Ω", "OUTPUT", "SDI", "SDI")], [power], ["R07", "R09"], { transport: { kind: "rx", family: "field-sdi-optical" } });
  const camera = generic("reference-fiber-camera", "กล้องสนามพร้อมระบบส่งเข้าฐาน (แบบฝึก)", "source", [p("optical-out", "CAMERA OPTICAL OUT · เข้าฐานคู่กัน", "OUTPUT", "FIBER", "FIBER_VIDEO")], [power, select("framing", "กรอบภาพ", ["Not framed", "Framed for assignment"])], ["R09"], { kind: "camera", size: [0.32, 1.5, 0.45], transport: { kind: "camera", family: "camera-base-optical" } });
  const ccu = generic("reference-ccu", "ฐานกล้อง / CCU (คู่กล้องที่กำหนด)", "converter", [p("optical-in", "CAMERA OPTICAL IN · เข้าคู่", "INPUT", "FIBER", "FIBER_VIDEO"), p("sdi-out", "VIDEO SDI OUT · 75Ω", "OUTPUT", "SDI", "SDI")], [power], ["R09"], { transport: { kind: "ccu", family: "camera-base-optical" } });
  const router = generic("reference-video-router-8", "เราเตอร์ภาพ SDI · โปรไฟล์ใช้งาน 8×8", "router", channels.concat([7, 8]).flatMap((n) => [p(`in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI"), p(`out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI")]), [power, ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => select(`xp-${n}`, `OUTPUT ${n} รับจาก`, ["OFF", ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `IN ${i}`)]))], ["R16"]);
  const sw = generic("reference-production-switcher", "เครื่องสลับภาพ SDI · โปรไฟล์ฝึก 8 แหล่ง", "switcher", [
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI")),
    ...[1, 2, 3, 4].map((n) => p(`sdi-out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI")), p("mv-out", "MULTIVIEW SDI OUT", "OUTPUT", "SDI", "SDI"),
    p("xlr-l", "AUDIO IN L · BALANCED TRS", "INPUT", "6.35mm", "LINE_BAL"), p("xlr-r", "AUDIO IN R · BALANCED TRS", "INPUT", "6.35mm", "LINE_BAL"),
  ], [power, select("pgm", "PROGRAM", ["Black", ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `SDI ${n}`)]), select("pvw", "PREVIEW", ["Black", ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `SDI ${n}`)]), ...[1, 2, 3, 4].map((n) => select(`sdi-out-${n}`, `หน้าที่ SDI OUT ${n}`, ["OFF", "PROGRAM", "PREVIEW", "MULTIVIEW", "AUX"])), select("aux", "แหล่ง AUX", ["PROGRAM", "SDI 1", "SDI 2"]), toggle("xlr-on", "นำเสียงไลน์ L/R เข้า PROGRAM"), select("emb-audio", "เสียงที่มากับภาพ", ["OFF", "AFV", "ON"])], ["R03"], { size: [1.1, 0.3, 0.5] });
  const embedder = generic("reference-audio-embedder", "อุปกรณ์ฝังเสียงแอนะล็อกใน SDI", "embedder", [p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI"), p("sdi-out", "SDI OUT · EMBEDDED AUDIO", "OUTPUT", "SDI", "SDI"), p("audio-l", "BALANCED AUDIO IN L · BREAKOUT", "INPUT", "XLR", "LINE_BAL"), p("audio-r", "BALANCED AUDIO IN R · BREAKOUT", "INPUT", "XLR", "LINE_BAL")], [power, toggle("embed", "ฝังเสียงไลน์ L/R ลงคู่เสียงรายการ")], ["R15"]);
  const shotgun = generic("reference-shotgun", "ไมค์ช็อตกันคอนเดนเซอร์ (โปรไฟล์ฝึก +48V)", "mic", [p("xlr-out", "MIC XLR OUT", "OUTPUT", "XLR", "MIC")], [toggle("windscreen", "ติดกันลมแล้ว")], ["R10", "R11"], { needsPower: false, kind: "mic", size: [0.3, 0.06, 0.07] });
  const controller = generic("reference-replay-controller", "แผงควบคุมภาพซ้ำ (ลิงก์ควบคุมจำลอง)", "controller", [p("control-out", "CONTROL OUT · โปรไฟล์ฝึกเข้าคู่", "OUTPUT", "CONTROL", "CONTROL")], [power, toggle("cue", "ส่งคำสั่งเล่นภาพซ้ำ")], ["R03", "R16"]);
  const replay = generic("reference-replay", "เครื่องเล่นภาพซ้ำพร้อมสื่อ (จำลอง)", "recorder", [p("sdi-out", "VIDEO SDI OUT", "OUTPUT", "SDI", "SDI"), p("control-in", "CONTROL IN · โปรไฟล์ฝึกเข้าคู่", "INPUT", "CONTROL", "CONTROL")], [power, toggle("clip", "สื่อภาพซ้ำพร้อมใช้"), toggle("play", "อนุญาตเล่นภาพซ้ำ")], ["R03", "R16"]);
  const encoder = generic("reference-sdi-encoder", "ตัวเข้ารหัส SDI / เครือข่าย (จำลอง)", "encoder", [p("sdi-in", "PROGRAM SDI IN", "INPUT", "SDI", "SDI"), p("eth", "NETWORK · Ethernet", "OUTPUT", "ETHERNET", "ETHERNET")], [power, select("format", "รูปแบบภาพ", ["1080p50"]), select("stream-key", "ข้อมูลปลายทางจำลอง", ["ยังไม่กำหนด", "•••• (private test)"]), toggle("stream", "เริ่มส่งสตรีมจำลอง")], ["R06", "R13"]);
  const record = generic("reference-recorder", "เครื่องบันทึก PROGRAM พร้อมสื่อภายใน (จำลอง)", "recorder", [p("sdi-in", "PROGRAM SDI IN", "INPUT", "SDI", "SDI")], base["bmd-hyperdeck-studio-hd-plus"].controls.filter((c) => ["power", "media", "record"].includes(c.key)), ["R03"]);
  const handheld = { ...base["generic-wireless-tx"], modelId: "reference-handheld-tx", name: "ไมค์มือถือพร้อมตัวส่ง RF ในตัว (แบบฝึก)", manufacturer: "โมเดลจำลองเพื่อฝึก", generic: true, kind: "mic" as const, ports: [], verifiedPorts: [], appendixReferenceIds: ["R11"], notes: ["แคปซูลไมค์และตัวส่งอยู่ในด้ามเดียวกัน ไม่มีสายสมมติคั่นระหว่างไมค์กับตัวส่ง"] };
  /* ---- SP camera chain, option B: real Blackmagic fiber workflow as three separate units (checked 2026-10-20) ----
   * Camera SDI → (supplied short 12G-SDI) → Camera Fiber Converter on the camera's battery-plate mount
   * → SMPTE 311M hybrid fiber (SMPTE 304 male / female) → Studio Fiber Converter → 12G-SDI to the router.
   * Only ports printed in the official tech specs are modeled; unused real ports are kept so the panel is truthful. */
  const BMD_FIBER = "https://www.blackmagicdesign.com/products/blackmagicfiberconverters/techspecs";
  const ursa = generic("bmd-ursa-broadcast-g2", "Blackmagic URSA Broadcast G2", "source", [
    p("sdi-out", "12G-SDI OUT", "OUTPUT", "SDI", "SDI"), p("sdi-mon", "SDI MONITOR OUT", "OUTPUT", "SDI", "SDI"),
    p("sdi-ret", "SDI IN (RETURN)", "INPUT", "SDI", "SDI"),
    p("xlr-1", "AUDIO IN 1 · XLR (MIC/LINE/AES)", "INPUT", "XLR", "MIC"), p("xlr-2", "AUDIO IN 2 · XLR (MIC/LINE/AES)", "INPUT", "XLR", "MIC"),
  ], [power, select("framing", "กรอบภาพ", ["Not framed", "Framed for assignment"]), toggle("cam-audio", "ส่งเสียงไมค์กล้องไปกับภาพ")], ["R09"], {
    manufacturer: "Blackmagic Design", generic: false, kind: "camera", size: [0.32, 1.5, 0.45],
    sourceUrl: "https://www.blackmagicdesign.com/products/blackmagicursabroadcast/techspecs",
    assetLicense: "รูปทรงสร้างเองจากสเปกทางการ ไม่ใช้โลโก้หรือโมเดลของผู้ผลิต",
    notes: ["สเปกทางการ: SDI Video Out 1, SDI Monitor Out 1, SDI In 1, XLR 2 ช่อง (mic/line/AES)", "ระบบไฟเบอร์ใช้ Blackmagic Camera Fiber Converter ซึ่งเป็นอุปกรณ์เสริมแยกชิ้น ไม่ใช่พอร์ตบนตัวกล้อง", "ไฟเลี้ยงจาก converter ผ่านขั้ว Molex 12-pin ใต้ battery plate (ไม่ใช่สายในกระเป๋า)"],
  });
  const cameraFiber = generic("bmd-camera-fiber-converter", "Blackmagic Camera Fiber Converter", "converter", [
    p("sdi-in", "12G SDI IN · CAMERA FEED", "INPUT", "SDI", "SDI"),
    p("fiber", "SMPTE 304 FIBER (MALE)", "OUTPUT", "FIBER", "FIBER_VIDEO"),
  ], [], ["R09"], {
    manufacturer: "Blackmagic Design", generic: false, needsPower: false, size: [0.16, 0.2, 0.14],
    sourceUrl: BMD_FIBER, transport: { kind: "tx", family: "camera-base-optical" },
    assetLicense: "รูปทรงสร้างเองจากสเปกทางการ ไม่ใช้โลโก้หรือโมเดลของผู้ผลิต",
    notes: ["ยึดท้ายกล้องแทน battery plate และได้ไฟจาก Studio Fiber Converter ผ่านสายไฟเบอร์ไฮบริด", "พอร์ตจริงอื่นตามสเปก (ยังไม่ใช้ในด่าน): 3G SDI camera return out ×1, 3G SDI return out ×3, XLR talkback 5-pin ×2, XLR audio in ×2, USB-C"],
  });
  const studioFiber = generic("bmd-studio-fiber-converter", "Blackmagic Studio Fiber Converter", "converter", [
    p("fiber", "SMPTE 304 FIBER (FEMALE)", "INPUT", "FIBER", "FIBER_VIDEO"),
    p("sdi-out", "12G SDI OUT 1", "OUTPUT", "SDI", "SDI"), p("sdi-out-2", "12G SDI OUT 2", "OUTPUT", "SDI", "SDI"),
  ], [power], ["R09"], {
    manufacturer: "Blackmagic Design", generic: false, size: [0.48, 0.09, 0.32],
    sourceUrl: BMD_FIBER, transport: { kind: "rx", family: "camera-base-optical" },
    assetLicense: "รูปทรงสร้างเองจากสเปกทางการ ไม่ใช้โลโก้หรือโมเดลของผู้ผลิต",
    notes: ["รับไฟ 100–240V AC และจ่ายไฟให้กล้องผ่านสายไฟเบอร์ไฮบริด", "พอร์ตจริงอื่นตามสเปก (ยังไม่ใช้ในด่าน): 12G SDI return in ×3, analog audio out ×4, talkback 25-pin, USB-C, 10GbE optical (ยังไม่เปิดใช้)"],
  });
  return [stagebox, tail, mixer, fieldTx, fieldRx, camera, ccu, router, sw, embedder, shotgun, controller, replay, encoder, record, handheld, ursa, cameraFiber, studioFiber];
}
