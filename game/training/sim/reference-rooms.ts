import type { RoomDef } from "./rooms";
import type { DeviceInstance } from "./engine";
import type { Spot } from "../venue-layouts";

const at = (x: number, y: number, z: number, yaw = 0, label = "จุดบริการสัญญาณ"): Spot => ({ p: [x, y, z], yaw, label });
const item = (tag: string, model: string, label: string, extra: Partial<DeviceInstance> = {}) => ({ id: tag, tag, model, label, ...extra });

/** Mission-only overlays retain the original room definitions for traceability. */
export function reconcileRooms(original: Record<string, RoomDef>): Record<"xs" | "s" | "m" | "l" | "xl", RoomDef> {
  const rooms = Object.fromEntries(Object.entries(original).map(([key, room]) => [key, { ...room, instances: { ...room.instances }, places: { ...room.places }, portable: [...room.portable] }])) as Record<"xs" | "s" | "m" | "l" | "xl", RoomDef>;
  const m = rooms.m;
  rooms.s.places.host = at(-0.65, 0.76, 4.7, Math.PI / 2, "โต๊ะผลิตขวา — หันพอร์ต Notebook เข้าทางบริการ");
  for (const [id, model] of [["stagebox", "reference-stagebox-6"], ["tail", "reference-tail-6"], ["mix", "reference-console-6"]]) m.instances[id] = { ...m.instances[id], model };
  for (const n of [1, 2]) {
    m.instances[`hand${n}`] = item(`M-HAND-${n}`, "reference-handheld-tx", `ไมค์ไร้สายมือถือ ${n} พร้อมตัวส่ง`, { voice: `HANDHELD ${n} VOICE` });
    m.instances[`hrx${n}`] = item(`M-HRX-${n}`, "generic-wireless-rx", `ตัวรับไมค์มือถือ ${n}`, { pairWith: `hand${n}` });
    m.instances[`lav${n}`] = item(`M-LAV-${n}`, "generic-lav-mic", `ไมค์หนีบปก ${n}`, { voice: `LAV ${n} VOICE` });
    m.instances[`tx${n}`] = item(`M-TX-${n}`, "generic-wireless-tx", `ตัวส่งไมค์หนีบปก ${n}`);
    m.instances[`rx${n}`] = item(`M-RX-${n}`, "generic-wireless-rx", `ตัวรับไมค์หนีบปก ${n}`, { pairWith: `tx${n}` });
    m.places[`hand${n}`] = at(4.0 + n * 0.7, 0.85, -4.0, 0, "จุดไมค์มือถือข้างเวที");
    m.places[`hrx${n}`] = at(7.1, 0.85, -4.2 + n * 0.55, 0, "กล่องตัวรับข้างเวที");
    m.places[`lav${n}`] = at(-1.4 + n * 0.7, 0.8, -4.5, 0, "จุดวิทยากร");
    m.places[`tx${n}`] = at(-1.4 + n * 0.7, 0.8, -4.15, Math.PI, "ตัวส่งไมค์วิทยากร — พอร์ตหันหาทางบริการ");
    m.places[`rx${n}`] = at(7.1, 0.85, -3.0 + n * 0.5, 0, "กล่องตัวรับข้างเวที");
  }
  const l = rooms.l;
  Object.assign(l.instances, {
    cam1: item("L-CAM-A", "generic-sdi-camera", "กล้องใกล้ A", { content: "CAM A" }), cam2: item("L-CAM-B", "generic-sdi-camera", "กล้องใกล้ B", { content: "CAM B" }), cam3: item("L-CAM-C", "generic-sdi-camera", "กล้องไกล C", { content: "CAM C" }),
    fiberTx: item("L-FIB-TX", "reference-fiber-tx", "ตัวส่ง Optical ข้างกล้องไกล", { opticalPeer: "fiberRx" }), fiberRx: item("L-FIB-RX", "reference-fiber-rx", "ตัวรับ Optical ข้างเต็นท์", { opticalPeer: "fiberTx" }),
    sw: item("L-SW", "reference-production-switcher", "เครื่องสลับภาพภาคสนาม"), monitor: item("L-MV", "generic-sdi-monitor", "จอรวมภาพภาคสนาม"),
    mix: item("L-MIX", "reference-console-6", "มิกเซอร์ภาคสนาม PA / BROADCAST"), lav: item("L-LAV", "generic-lav-mic", "ไมค์หนีบปกพิธีกร", { voice: "PRESENTER VOICE" }), tx: item("L-TX", "generic-wireless-tx", "ตัวส่งไมค์พิธีกร"), rx: item("L-RX", "generic-wireless-rx", "ตัวรับไมค์พิธีกร", { pairWith: "tx" }),
    shotgun: item("L-SHOT", "reference-shotgun", "ไมค์ช็อตกัน", { voice: "STAGE VOICE" }), amb: item("L-AMB", "generic-ambience-mic", "ไมค์บรรยากาศ", { voice: "CROWD AMBIENCE" }), pa: item("L-PA", "generic-active-pa", "ลำโพง PA ภาคสนาม"),
    embed: item("L-EMBED", "aja-3g-ama", "ตัวฝังเสียง AJA 3G-AMA (พร้อมสาย breakout)"), enc: item("L-ENC", "bmd-streaming-encoder-hd", "ตัวเข้ารหัส Streaming Encoder HD"),
  });
  Object.assign(l.places, { cam3: "cam3", fiberTx: at(0.9, 0.85, 4.3, 0, "เคสส่ง Optical ข้างกล้อง C"), fiberRx: "fiber-rx", lav: "lav1", tx: "tx1", rx: "rx", shotgun: "mic0", amb: "mic1", pa: at(-5.8, 0, -5.6, 0, "PA หน้าเวที"), embed: at(4.8, 0.76, 6.9, 0, "โต๊ะฝังเสียงและส่งสัญญาณ"), enc: at(5.7, 0.76, 6.9, 0, "โต๊ะฝังเสียงและส่งสัญญาณ"), net: at(6.5, 0.76, 6.9, 0, "โต๊ะเครือข่าย"), mix: at(2.5, 0.76, 7.9, 0, "โต๊ะควบคุมเสียงในเต็นท์") });
  l.portable = ["tx", "rx", "fiberTx", "fiberRx"];
  l.places.tx = at(0.8, 1.0, -7.5, Math.PI, "ตัวส่งพิธีกร — พอร์ตหันหาทางบริการหน้าเวที");
  // Keep the six-channel console fully supported and leave a gap to the wider switcher.
  l.places.mix = at(2.75, 0.76, 7.9, 0, "โต๊ะควบคุมเสียงในเต็นท์");
  l.places.sw = at(3.65, 0.76, 7.8, 0, "เต็นท์ควบคุม: เครื่องสลับภาพ");
  l.places.monitor = at(4.6, 0.76, 7.75, 0, "เต็นท์ควบคุม: จอรวมภาพ");
  const xl = rooms.xl;
  for (let n = 1; n <= 6; n++) {
    // Option B (owner, 2026-10-20): camera → Camera Fiber Converter (mounted on that camera) → SMPTE fiber → Studio
    // Fiber Converter. Instance ids cam/ccu are kept so existing faults and saves keep their identity.
    xl.instances[`cam${n}`] = item(`XL-CAM-${n}`, "bmd-ursa-broadcast-g2", `กล้องสนาม ${n} · URSA Broadcast G2`, { content: `CAM ${n}` });
    xl.instances[`cfc${n}`] = item(`XL-CFC-${n}`, "bmd-camera-fiber-converter", `Camera Fiber Converter ${n} (ท้ายกล้อง ${n})`, { opticalPeer: `ccu${n}`, mountedOn: `cam${n}` });
    xl.instances[`ccu${n}`] = item(`XL-CCU-${n}`, "bmd-studio-fiber-converter", `Studio Fiber Converter ${n} (ฐานรับกล้อง ${n})`, { opticalPeer: `cfc${n}` });
    xl.places[`cam${n}`] = `cam${n}`;
    xl.places[`cfc${n}`] = `cam${n}`;
    xl.places[`ccu${n}`] = at(-11.9, 0.18 + (n - 1) * 0.25, -6.4, -Math.PI / 2, "ตู้ฐานกล้อง — แยก 6 ยูนิต");
  }
  Object.assign(xl.instances, {
    router: item("XL-ROUTER", "reference-video-router-8", "เราเตอร์ภาพ SDI แบบ Crosspoint"), sw: item("XL-SW", "reference-production-switcher", "เครื่องสลับภาพรายการ"), monitor: item("XL-MV", "generic-sdi-monitor", "จอรวมภาพ"), display: item("XL-DISPLAY", "generic-sdi-monitor", "ตัวรับภาพจอสนาม"),
    mix: item("XL-MIX", "reference-console-6", "คอนโซลเสียงถ่ายทอดและ PA"), stagebox: item("XL-STAGE", "reference-stagebox-6", "กล่องรับไมค์สนาม"), tail: item("XL-TAIL", "reference-tail-6", "หางสายเสียงที่คอนโซล"), pa: item("XL-PA", "generic-active-pa", "ระบบ PA สนาม (แบบฝึกแอ็กทีฟ)"),
    crowdL: item("XL-CROWD-L", "generic-ambience-mic", "ไมค์บรรยากาศซ้าย", { voice: "CROWD LEFT" }), crowdR: item("XL-CROWD-R", "generic-ambience-mic", "ไมค์บรรยากาศขวา", { voice: "CROWD RIGHT" }), field: item("XL-FIELD", "generic-dynamic-mic", "ไมค์ภาคสนาม", { voice: "FIELD VOICE" }), lav: item("XL-LAV", "generic-lav-mic", "ไมค์พิธีกรสนาม", { voice: "PRESENTER VOICE" }), tx: item("XL-TX", "generic-wireless-tx", "ตัวส่งไมค์สนาม"), rx: item("XL-RX", "generic-wireless-rx", "ตัวรับไมค์สนาม", { pairWith: "tx" }),
    play: item("XL-REPLAY", "reference-replay", "เซิร์ฟเวอร์ภาพซ้ำ"), controller: item("XL-CTRL", "reference-replay-controller", "แผงควบคุมภาพซ้ำ"),
    enc: item("XL-ENC-MAIN", "reference-sdi-encoder", "ตัวเข้ารหัสหลัก", { failureDomain: "primary" }), enc2: item("XL-ENC-BACKUP", "reference-sdi-encoder", "ตัวเข้ารหัสสำรอง", { failureDomain: "backup" }), rec: item("XL-REC", "reference-recorder", "เครื่องบันทึกรายการ"),
    net2: item("XL-NET-2", "generic-gateway", "เครือข่ายสำรอง", { failureDomain: "backup" }), wan2: item("XL-WAN-2", "generic-test-ingest", "จุดรับสตรีมสำรอง", { failureDomain: "backup" }),
  });
  xl.instances.net = { ...xl.instances.net, failureDomain: "primary" };
  xl.instances.wan = { ...xl.instances.wan, failureDomain: "primary" };
  Object.assign(xl.places, { router: at(-11.9, 0.8, -5.6, -Math.PI / 2, "ตู้เราเตอร์ภาพ"), controller: at(-6.5, 0.76, -3.0, 0, "โต๊ะควบคุมภาพซ้ำ"), enc2: at(-11.9, 0, 0.5, -Math.PI / 2, "ตู้ส่งสำรอง"), net2: at(-11.9, 0, 1.2, -Math.PI / 2, "ตู้เครือข่ายสำรอง"), wan2: at(-11.9, 0, 1.85, -Math.PI / 2, "จุดรับสำรองจำลอง"), stagebox: at(8.2, 0, 0.1, 0, "จุดรับเสียงผู้บรรยายและสนาม"), tail: at(-3.2, 0.76, -4.0, 0, "ข้างคอนโซลเสียง"), pa: at(8, 0, 5.3, 0, "ระบบ PA ฝั่งผู้ชม"), display: "display", crowdL: "mic2", crowdR: "mic3", field: "mic4", lav: "lav1", tx: "tx1", rx: at(8.2, 0.85, -0.5, 0, "ตัวรับเสียงข้างกล่องรับเวที") });
  xl.portable = ["tx", "rx"];
  return rooms;
}
