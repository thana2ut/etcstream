import type { DeviceInstance } from "./engine";
import type { Spot } from "../venue-layouts";
import { yawToward } from "../venue-layouts";
import type { VenueScale } from "../scenarios";

/**
 * Five production rooms. Fantasy titles are the world wrapper; the English subtitle states the real vocational purpose.
 * Instance ids are unique per room; a few reuse the ids the 3D environments already read (e.g. "monitor" for the
 * screen repeaters), so venue scenery always shows the real destination's simulated picture.
 * Station spots are authored in each venue's BASE coordinates (scaled with the venue like other mission extras),
 * or alias an existing layout station.
 */
export interface RoomDef {
  scale: VenueScale;
  code: "XS" | "ST" | "AU" | "OUT" | "SP";
  title: string;
  subtitle: string;
  instances: Record<string, DeviceInstance & { tag: string }>;
  /** Base-coordinate station or the id of an existing layout station. */
  places: Record<string, Spot | string>;
  /** Carried from labelled cases/storage to the station (everything else is installed/semi-fixed). */
  portable: string[];
}

const at = (x: number, y: number, z: number, yaw = 0, label?: string): Spot => ({ p: [x, y, z], yaw, label });
const camAt = (x: number, z: number, target: [number, number], label: string, y = 0): Spot => ({ p: [x, y, z], yaw: yawToward([x, 0, z], [target[0], 0, target[1]]), label });
const I = (tag: string, model: string, label: string, extra: Partial<DeviceInstance> = {}) => ({ tag, model, label, ...extra }) as DeviceInstance & { tag: string };

export const ROOMS: Record<VenueScale, RoomDef> = {
  xs: {
    scale: "xs", code: "XS", title: "ห้องประตูแรกแห่งภาพ", subtitle: "ห้องเรียน · ระบบสอนและห้องเรียนแบบไฮบริด",
    instances: {
      cam1: I("XS-CAM-01", "generic-hdmi-camera", "กล้องห้องเรียน", { content: "TEACHER CAM" }),
      slides: I("XS-LAP-01", "generic-laptop", "โน้ตบุ๊กผู้สอน", { content: "SLIDES" }),
      sw: I("XS-SW-01", "generic-mini-switcher", "เครื่องสลับภาพขนาดเล็ก"),
      lav: I("XS-LAV-01", "generic-lav-mic", "ไมค์หนีบปกผู้สอน", { voice: "TEACHER VOICE" }),
      tx: I("XS-TX-01", "generic-wireless-tx", "ตัวส่งไร้สาย TX"),
      rx: I("XS-RX-01", "generic-wireless-rx", "ตัวรับไร้สาย RX", { pairWith: "tx" }),
      mix: I("XS-MIX-01", "generic-4ch-mixer", "มิกเซอร์ 4 ช่อง"),
      pa: I("XS-PA-01", "generic-active-pa", "ลำโพงแอ็กทีฟหน้าห้อง"),
      monitor: I("XS-DIS-01", "generic-projector", "โปรเจกเตอร์/จอหน้าห้อง"),
      host: I("XS-OBS-01", "generic-obs-host", "โน้ตบุ๊กสตรีม OBS (จำลอง)"),
    },
    places: {
      cam1: "cam1", slides: "slides", monitor: "monitor",
      tx: at(0.5, 0.76, -2.7, 0, "โต๊ะครู — ตัวส่งไร้สาย TX"),
      lav: at(0.85, 0.76, -2.7, 0, "โต๊ะครู — ไมค์หนีบปก"),
      pa: at(-4.9, 0, -3.7, 0.35, "หน้าห้องด้านซ้าย — ลำโพงแอ็กทีฟ"),
      mix: at(2.9, 0.76, 2.95, 0, "โต๊ะผู้ควบคุมด้านหลัง — มิกเซอร์"),
      rx: at(3.15, 0.76, 3.05, 0, "โต๊ะผู้ควบคุมด้านหลัง — ตัวรับไร้สาย"),
      sw: at(3.5, 0.76, 2.85, 0, "โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ"),
      host: at(4.05, 0.76, 2.85, -0.2, "โต๊ะผู้ควบคุมด้านหลัง — โน้ตบุ๊กสตรีม OBS"),
    },
    portable: ["sw", "mix", "rx", "tx", "lav", "host"],
  },
  s: {
    scale: "s", code: "ST", title: "สะพานจันทราแห่งเสียง", subtitle: "สตูดิโอ · สัมภาษณ์และถ่ายทอดหลายกล้อง",
    instances: {
      cam1: I("ST-CAMA", "bmd-studio-camera-4k-pro-g2", "กล้องสตูดิโอ A (ภาพกว้าง)", { content: "CAM-A WIDE TWO-SHOT" }),
      cam2: I("ST-CAMB", "bmd-studio-camera-4k-pro-g2", "กล้องสตูดิโอ B (แขกรับเชิญ)", { content: "CAM-B GUEST CLOSE-UP" }),
      cam3: I("ST-CAMC", "bmd-studio-camera-4k-pro-g2", "กล้องสตูดิโอ C (พิธีกร)", { content: "CAM-C HOST CLOSE-UP" }),
      sw: I("ST-SW", "bmd-atem-tvs-hd8-iso", "ATEM TV Studio HD8 ISO"),
      micH: I("ST-MIC-H", "shure-sm58", "ไมค์พิธีกร SM58", { voice: "HOST VOICE" }),
      micG: I("ST-MIC-G", "shure-sm58", "ไมค์แขกรับเชิญ SM58", { voice: "GUEST VOICE" }),
      mix: I("ST-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      phones: I("ST-HEAD", "generic-headphones", "หูฟังตรวจเสียง"),
      monitor: I("ST-MV", "generic-hdmi-monitor", "จอรวมภาพ"),
      pgm: I("ST-PGM", "generic-hdmi-monitor", "จอภาพออกอากาศ"),
      conv: I("ST-CONV", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G"),
      ssd: I("ST-SSD", "generic-recording-ssd", "SSD บันทึกข้อมูล"),
      net: I("ST-NET", "generic-gateway", "เกตเวย์เครือข่าย GbE"),
      wan: I("ST-WAN", "generic-test-ingest", "จุดรับสตรีมทดสอบส่วนตัว (WAN)"),
    },
    places: {
      sw: "sw", mix: "mix", monitor: "monitor",
      cam1: "cam1", cam2: "cam2", cam3: "cam3",
      micH: "micH", micG: "micG",
      phones: at(-4.0, 0.76, 5.05, 0, "โต๊ะผลิตรายการ — จุดควบคุมเสียง"),
      pgm: at(-1.05, 0.76, 4.45, Math.PI, "โต๊ะผลิตรายการ — จอตรวจภาพออกอากาศ"),
      conv: at(-1.8, 0.76, 4.95, Math.PI, "โต๊ะผลิตรายการ — หลังจอออกอากาศ"),
      ssd: at(-2.15, 0.76, 4.95, Math.PI, "โต๊ะผลิตรายการ — ข้าง HD8 ISO"),
      net: at(-0.35, 0.76, 4.9, Math.PI, "ตู้ต่อสัญญาณ — เกตเวย์"),
      wan: at(0.9, 0, 5.2, -Math.PI / 2, "ตู้ต่อสัญญาณ — ทางออกจำลอง"),
    },
    portable: ["conv", "ssd", "phones", "micH", "micG", "net"],
  },
  m: {
    scale: "m", code: "AU", title: "หอคอยกระจกแห่งภาพสลับ", subtitle: "หอประชุมใหญ่ · ถ่ายทอดงานไปหลายปลายทาง",
    instances: {
      sw: I("AU-SW", "roland-v-160hd", "Roland V-160HD"),
      slides: I("AU-LAP", "generic-laptop", "โน้ตบุ๊กนำเสนองาน", { content: "KEYNOTE SLIDES" }),
      cam1: I("AU-CAM-W", "bmd-studio-camera-4k-pro-g2", "กล้องภาพกว้าง (จุดควบคุมด้านหลัง)", { content: "CAM WIDE · STAGE" }),
      cam2: I("AU-CAM-C", "bmd-studio-camera-4k-pro-g2", "กล้องภาพใกล้ (ข้างเวที)", { content: "CAM CLOSE · SPEAKER" }),
      mic: I("AU-MIC", "shure-sm58", "ไมค์โพเดียม SM58", { voice: "PRESENTER VOICE" }),
      mix: I("AU-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      paL: I("AU-PA-L", "generic-active-pa", "ลำโพงแอ็กทีฟซ้าย"),
      paR: I("AU-PA-R", "generic-active-pa", "ลำโพงแอ็กทีฟขวา"),
      display: I("AU-PROJ", "generic-projector", "โปรเจกเตอร์สำหรับผู้ชม"),
      conf: I("AU-CONF", "generic-hdmi-monitor", "จอตรวจภาพผู้บรรยาย"),
      monitor: I("AU-MV", "generic-hdmi-monitor", "จอรวมภาพจุดควบคุม"),
      host: I("AU-HOST", "generic-obs-host", "คอมพิวเตอร์ OBS"),
      rec: I("AU-REC", "bmd-hyperdeck-studio-hd-plus", "HyperDeck Studio HD Plus"),
      net: I("AU-NET", "generic-gateway", "เราเตอร์เครือข่าย"),
      wan: I("AU-WAN", "generic-test-ingest", "จุดรับสตรีมทดสอบส่วนตัว (WAN)"),
      amp: I("AU-AMP", "generic-power-amp", "เครื่องขยายเสียง (ไม่ใช้ในระบบนี้)"),
      phones: I("AU-HEAD", "generic-headphones", "หูฟังจุดควบคุม"),
    },
    places: {
      sw: "sw", monitor: "monitor", rec: "capture", host: "pc", mix: "mix", phones: "rx", slides: "slides", mic: "mic1",
      cam1: { ...camAt(0, 3.95, [0, -5.5], "จุดควบคุมหลังห้อง — กล้องภาพกว้าง"), p: [0, 0.25, 3.95] },
      cam2: camAt(-8.4, -2.9, [0, -4.8], "ข้างเวทีซ้าย — กล้องภาพใกล้"),
      paL: at(-6.4, 0.8, -5.0, 0.3, "หน้าเวทีซ้าย — ลำโพงอยู่หน้าแนวไมค์"),
      paR: at(6.4, 0.8, -5.0, -0.3, "หน้าเวทีขวา — ลำโพง"),
      display: at(8.3, 0.55, -3.1, -Math.PI / 2, "ขวาเวที — แผงขาเข้าโปรเจกเตอร์"),
      conf: at(5.6, 0.8, -4.2, 0.6, "หน้าเวทีขวา — จอตรวจภาพหันหาผู้บรรยาย"),
      net: at(1.5, 0.76, 5.85, 0, "โต๊ะควบคุมหลังห้อง — เราเตอร์"),
      wan: at(3.3, 0, 6.8, -Math.PI / 2, "ตู้บริการหลังห้อง — ทางออกจำลอง"),
      amp: at(-4.9, 0.85, 7.6, 0, "กล่องด้านหลัง — เครื่องขยายเสียงสำรอง"),
    },
    portable: ["host", "rec", "net", "phones", "amp"],
  },
  l: {
    scale: "l", code: "OUT", title: "คลังตราพอร์ตโบราณ", subtitle: "พื้นที่ถ่ายทอดกลางแจ้ง · พอร์ต ตัวแปลง การต่อสาย และความปลอดภัย",
    instances: {
      cam1: I("OUT-CAM-A", "bmd-studio-camera-4k-pro-g2", "กล้อง A (ตะวันออก 15 ม.)", { content: "CAM-A HOST WIDE" }),
      cam2: I("OUT-CAM-B", "bmd-studio-camera-4k-pro-g2", "กล้อง B (ตะวันตก 25 ม.)", { content: "CAM-B DEMO TABLE" }),
      lap: I("OUT-PC", "generic-laptop", "โน้ตบุ๊กนำเสนอ", { content: "FIELD SLIDES" }),
      convHS: I("OUT-CONV-HS", "bmd-micro-converter-hdmi-sdi-3g", "Micro Converter HDMI→SDI 3G"),
      convSH: I("OUT-CONV-SH", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G"),
      vh: I("OUT-VH", "bmd-videohub-10x10-12g", "Videohub 10x10 12G"),
      sw: I("OUT-SW", "bmd-atem-tvs-hd8-iso", "ATEM TV Studio HD8 ISO"),
      mic: I("OUT-MIC", "shure-sm58", "ไมค์พิธีกร SM58", { voice: "HOST VOICE" }),
      mix: I("OUT-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      monitor: I("OUT-MON-MV", "generic-hdmi-monitor", "จอรวมภาพภาคสนาม"),
      pgm: I("OUT-MON-PGM", "generic-hdmi-monitor", "จอภาพออกอากาศภาคสนาม"),
      ssd: I("OUT-SSD", "generic-recording-ssd", "SSD บันทึกข้อมูลสำหรับ HD8"),
      net: I("OUT-NET", "generic-gateway", "เกตเวย์เครือข่ายสายหลัก"),
      net2: I("OUT-NET-2", "generic-gateway", "เกตเวย์สำรองที่ทดสอบแล้ว"),
      wan: I("OUT-WAN", "generic-test-ingest", "จุดรับสตรีมทดสอบส่วนตัว (WAN)"),
    },
    places: {
      cam1: "cam1", cam2: "cam2", lap: "lap", convHS: "convHS", mic: "mic",
      mix: "mix", sw: "sw", monitor: "monitor", vh: "vh", convSH: "convSH", pgm: "pgm",
      ssd: "ssd", net: "net", net2: "net2", wan: "wan",
    },
    portable: ["convHS", "convSH", "vh", "ssd", "net2", "mic"],
  },
  xl: {
    scale: "xl", code: "SP", title: "บัลลังก์จอมถ่ายทอด", subtitle: "สนามกีฬา · ถ่ายทอดนอกสถานที่ด้วยหลายกล้อง",
    instances: {
      cam1: I("SP-CAM1", "bmd-studio-camera-4k-pro-g2", "กล้อง 1 หลัก มุมสูง/กว้าง", { content: "CAM 1 MAIN HIGH/WIDE" }),
      cam2: I("SP-CAM2", "bmd-studio-camera-4k-pro-g2", "กล้อง 2 ริมสนาม", { content: "CAM 2 SIDELINE" }),
      cam3: I("SP-CAM3", "bmd-studio-camera-4k-pro-g2", "กล้อง 3 หน้าประตู", { content: "CAM 3 GOAL/FINISH" }),
      cam4: I("SP-CAM4", "bmd-studio-camera-4k-pro-g2", "กล้อง 4 ปฏิกิริยา/ผู้ชม", { content: "CAM 4 REACTION/CROWD" }),
      sw: I("SP-SW", "bmd-atem-2me-constellation-hd", "ATEM 2 M/E Constellation HD"),
      mic1: I("SP-MIC1", "shure-sm58", "ไมค์ผู้บรรยาย 1 SM58", { voice: "COMMENTATOR 1" }),
      mic2: I("SP-MIC2", "shure-sm58", "ไมค์ผู้บรรยาย 2 SM58", { voice: "COMMENTATOR 2" }),
      amb: I("SP-AMBIENCE", "generic-ambience-mic", "ไมค์บรรยากาศผู้ชม", { voice: "CROWD AMBIENCE" }),
      mix: I("SP-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      phones: I("SP-HEAD", "generic-headphones", "หูฟังห้องบรรยาย"),
      gfx: I("SP-GFX", "generic-graphics-pc", "คอมพิวเตอร์กราฟิก"),
      convHS: I("SP-CV-HS", "bmd-micro-converter-hdmi-sdi-3g", "Micro Converter HDMI→SDI 3G"),
      convA: I("SP-CV-SH-A", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G (MV)"),
      convB: I("SP-CV-SH-B", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G (PGM)"),
      monitor: I("SP-MV", "generic-hdmi-monitor", "จอรวมภาพ"),
      pgm: I("SP-PGM", "generic-hdmi-monitor", "จอตรวจภาพออกอากาศ"),
      enc: I("SP-ENC", "bmd-streaming-encoder-hd", "Streaming Encoder HD"),
      rec: I("SP-REC", "bmd-hyperdeck-studio-hd-plus", "HyperDeck บันทึกภาพออกอากาศ"),
      play: I("SP-PLAY", "bmd-hyperdeck-studio-hd-plus", "HyperDeck เล่นคลิป"),
      net: I("SP-NET", "generic-gateway", "เกตเวย์ / WAN ที่ตรวจสอบแล้ว"),
      wan: I("SP-WAN", "generic-test-ingest", "จุดรับสตรีมทดสอบส่วนตัว (WAN)"),
    },
    places: {
      cam1: "cam1", cam2: "cam2", cam3: "cam4", cam4: "cam3", sw: "sw", mix: "mix", phones: "rx", monitor: "monitor",
      mic1: "mic0", mic2: "mic1", amb: "mic3", gfx: "graphics",
      convHS: at(-5.6, 0.76, -0.95, 0, "โต๊ะกราฟิก — ตัวแปลง HDMI→SDI"),
      convA: at(-5.4, 0.76, -5.3, 0, "โต๊ะผู้กำกับ — ตัวแปลงจอรวมภาพ"),
      convB: at(-8.6, 0.76, -5.15, 0, "โต๊ะผู้กำกับ — ตัวแปลงภาพออกอากาศ"),
      pgm: at(-8.2, 0.76, -5.25, 0, "โต๊ะผู้กำกับ — จอตรวจภาพออกอากาศ"),
      enc: at(-11.9, 0, -3.8, Math.PI / 2, "ตู้ตัวเข้ารหัส"),
      net: at(-11.9, 0, -3.0, Math.PI / 2, "ตู้บริการ WAN — เกตเวย์"),
      wan: at(-11.9, 0, -2.2, Math.PI / 2, "ตู้บริการ WAN — ทางออกจำลอง"),
      rec: at(-11.9, 0, -0.2, Math.PI / 2, "ตู้บันทึก — HyperDeck ภาพออกอากาศ"),
      play: "replay",
    },
    portable: ["convHS", "convA", "convB", "phones", "amb"],
  },
};
