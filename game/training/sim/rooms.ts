import type { DeviceInstance } from "./engine";
import type { Spot } from "../venue-layouts";
import { yawToward } from "../venue-layouts";
import { reconcileRooms } from "./reference-rooms";
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
      sw: I("XS-SW-01", "bmd-atem-mini-pro", "เครื่องสลับภาพ ATEM Mini Pro"),
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
      pa: at(-4.9, 0, -3.0, 0.35, "หน้าห้องด้านซ้าย — ลำโพงแอ็กทีฟพร้อมทางบริการ"),
      mix: at(2.9, 0.76, 2.95, 0, "โต๊ะผู้ควบคุมด้านหลัง — มิกเซอร์"),
      rx: at(3.15, 0.76, 3.05, 0, "โต๊ะผู้ควบคุมด้านหลัง — ตัวรับไร้สาย"),
      sw: at(3.5, 0.76, 2.85, 0, "โต๊ะผู้ควบคุมด้านหลัง — เครื่องสลับภาพ"),
      host: at(4.05, 0.76, 2.85, -0.2, "โต๊ะผู้ควบคุมด้านหลัง — โน้ตบุ๊กสตรีม OBS"),
    },
    portable: ["sw", "mix", "rx", "tx", "lav", "host"],
  },
  s: {
    scale: "s", code: "ST", title: "สะพานจันทราแห่งเสียง", subtitle: "สตูดิโอ · ถ่ายทอดหลายกล้อง เสียงหลายไมค์ และจับภาพเข้า OBS",
    instances: {
      cam1: I("S-CAM-01", "generic-hdmi-camera", "CAM1 ภาพกว้าง (โต๊ะผู้นำเสนอ)", { content: "CAM1 WIDE · PRESENTER" }),
      cam2: I("S-CAM-02", "generic-hdmi-camera", "CAM2 มุมสัมภาษณ์", { content: "CAM2 INTERVIEW" }),
      cam3: I("S-CAM-03", "generic-hdmi-camera", "CAM3 มุมฉากเขียว", { content: "CAM3 GREEN SCREEN" }),
      sw: I("S-SW-01", "generic-studio-switcher", "เครื่องสลับภาพสตูดิโอ"),
      monitor: I("S-MV-01", "generic-hdmi-monitor", "ทีวีรวมภาพ (Multiview)"),
      lav1: I("S-LAV-01", "generic-lav-mic", "ไมค์หนีบปก 1 (พิธีกร)", { voice: "HOST VOICE" }),
      lav2: I("S-LAV-02", "generic-lav-mic", "ไมค์หนีบปก 2 (แขกรับเชิญ)", { voice: "GUEST VOICE" }),
      tx1: I("S-TX-01", "generic-wireless-tx", "ตัวส่ง TX 1"),
      tx2: I("S-TX-02", "generic-wireless-tx", "ตัวส่ง TX 2"),
      rx1: I("S-RX-01", "generic-wireless-rx", "ตัวรับ RX ช่อง 1", { pairWith: "tx1" }),
      rx2: I("S-RX-02", "generic-wireless-rx", "ตัวรับ RX ช่อง 2", { pairWith: "tx2" }),
      mic: I("S-MIC-01", "generic-dynamic-mic", "ไมค์สาย XLR", { voice: "PRESENTER VOICE" }),
      mix: I("S-MIX-01", "generic-4ch-mixer", "มิกเซอร์เสียง"),
      speaker: I("S-HS5-01", "yamaha-hs5", "Yamaha HS5 ลำโพงมอนิเตอร์"),
      capture: I("S-CAP-01", "magewell-usb-capture-hdmi-gen2", "Magewell USB Capture HDMI Gen 2"),
      host: I("S-OBS-01", "generic-obs-host", "โน้ตบุ๊ก OBS (จำลอง)"),
    },
    places: {
      cam1: "cam1", cam2: "cam2", cam3: "cam3", sw: "sw", mix: "mix", rx1: "rx", monitor: "monitor", speaker: "speaker", capture: "capture", host: "pc", mic: "micH", tx1: "tx1", tx2: "tx2",
      rx2: at(-3.3, 0.76, 5.05, 0, "โต๊ะเสียง — ตัวรับ RX ช่อง 2"),
      lav1: at(-4.7, 0.76, -2.3, 0, "โต๊ะผู้นำเสนอ — ไมค์หนีบปก 1"),
      lav2: at(-3.0, 0.76, -2.3, 0, "โต๊ะผู้นำเสนอ — ไมค์หนีบปก 2"),
    },
    portable: ["rx1", "rx2", "tx1", "tx2", "capture", "host"],
  },
  m: {
    scale: "m", code: "AU", title: "หอคอยกระจกสลับภาพ", subtitle: "หอประชุมใหญ่ · กล้อง SDI สไลด์ เวที และเสียง PA/Broadcast แยกกัน",
    instances: {
      cam1: I("M-CAM-01", "generic-sdi-camera", "กล้อง 1 กลางหลังห้อง", { content: "CAM1 CENTER" }),
      cam2: I("M-CAM-02", "generic-sdi-camera", "กล้อง 2 ซ้าย", { content: "CAM2 LEFT" }),
      cam3: I("M-CAM-03", "generic-sdi-camera", "กล้อง 3 ขวา", { content: "CAM3 RIGHT" }),
      ptz: I("M-PTZ-01", "generic-sdi-ptz", "กล้อง PTZ (ติดตั้งถาวร)", { content: "PTZ STAGE" }),
      slides: I("M-LAP-01", "generic-laptop", "โน้ตบุ๊กนำเสนอ", { content: "SLIDES" }),
      convHS: I("M-CONV-HS", "bmd-micro-converter-hdmi-sdi-3g", "Micro Converter HDMI→SDI 3G"),
      convSH: I("M-CONV-SH", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G"),
      sw: I("M-SW-01", "bmd-atem-television-studio-hd8-iso", "เครื่องสลับภาพ ATEM Television Studio HD8 ISO"),
      monitor: I("M-MV-01", "generic-sdi-monitor", "จอ Multiview FOH (SDI)"),
      display: I("M-STAGE-01", "generic-hdmi-monitor", "จอเวที (HDMI)"),
      podium: I("M-MIC-POD", "generic-dynamic-mic", "ไมค์โพเดียม", { voice: "PODIUM VOICE" }),
      hand: I("M-MIC-HH", "generic-dynamic-mic", "ไมค์มือถือแบบสาย", { voice: "HANDHELD VOICE" }),
      lav: I("M-LAV-01", "generic-lav-mic", "ไมค์หนีบปกวิทยากร", { voice: "SPEAKER VOICE" }),
      tx: I("M-TX-01", "generic-wireless-tx", "ตัวส่งไร้สาย TX"),
      rx: I("M-RX-01", "generic-wireless-rx", "ตัวรับไร้สาย RX", { pairWith: "tx" }),
      stagebox: I("M-SBX-01", "generic-analog-stagebox", "Stagebox อนาล็อก"),
      tail: I("M-TAIL-01", "generic-snake-tail", "หางสายมัลติคอร์ FOH"),
      mix: I("M-MIX-01", "generic-foh-mixer", "มิกเซอร์ FOH"),
      paL: I("M-PA-L", "generic-active-pa", "ลำโพง PA ซ้าย"),
      paR: I("M-PA-R", "generic-active-pa", "ลำโพง PA ขวา"),
      capture: I("M-CAP-01", "generic-sdi-usb-capture", "อุปกรณ์จับภาพ SDI → USB"),
      host: I("M-OBS-01", "generic-obs-host", "คอมพิวเตอร์สตรีม OBS (จำลอง)"),
      rec: I("M-REC-01", "bmd-hyperdeck-studio-hd-plus", "HyperDeck Studio HD Plus"),
    },
    places: {
      sw: "sw", monitor: "monitor", mix: "mix", slides: "slides", stagebox: "stagebox", podium: "mic1", hand: "mic2", cam2: "cam2", cam3: "cam3", ptz: "cam4", host: "pc", capture: "capture", rx: "rx",
      cam1: { ...camAt(0, 3.95, [0, -5.5], "กลางหลังห้อง — กล้อง 1"), p: [0, 0.25, 3.95] },
      convHS: at(-3.9, 0.76, -3.3, 0, "โต๊ะนำเสนอ — HDMI→SDI ข้างโน้ตบุ๊ก"),
      convSH: at(8.3, 0.55, -3.7, -Math.PI / 2, "ข้างเวทีขวา — SDI→HDMI ไปจอเวที"),
      display: at(8.3, 0.55, -3.1, -Math.PI / 2, "ข้างเวทีขวา — แผงขาเข้าจอเวที"),
      tail: at(-2.6, 0.76, 5.3, 0, "FOH — หางสายมัลติคอร์"),
      rec: at(2.0, 0.76, 5.5, 0, "FOH — เครื่องบันทึก"),
      lav: at(-1.2, 0.8, -4.5, 0, "จุดวิทยากรบนเวที — ไมค์หนีบปก"),
      tx: at(-0.8, 0.8, -4.5, 0, "จุดวิทยากรบนเวที — ตัวส่ง TX"),
      paL: at(-6.4, 0.8, -5.0, 0.3, "หน้าเวทีซ้าย — ลำโพง PA"),
      paR: at(6.4, 0.8, -5.0, -0.3, "หน้าเวทีขวา — ลำโพง PA"),
    },
    portable: ["convHS", "convSH", "capture", "rec", "tx", "rx"],
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

export const MISSION_ROOMS = reconcileRooms(ROOMS);
