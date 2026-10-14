import type { CableDef, Scenario } from "@/game/training/scenarios";

/**
 * Cable / connector catalog for the Mission Hall cable-prep lobby.
 * Source: ETCSTREAM_ALL_CABLES_CONNECTORS_FIVE_VENUES_MASTER.md (sections 3–9). IDs follow that document;
 * `AUD-TRS-635-35` and `AUD-RX-MIXER-XLR` cover game leads that document lists as "3.5→6.35" / "RX XLR output".
 * Decoys (Mini/Micro HDMI, DisplayPort, TRRS, RCA, Dante Cat, USB-A↔A …) are real cables that the selected
 * venue routes do not use — picking them wastes bag space.
 */
export type CableCategory = "video" | "fiber" | "audio" | "stagebox" | "usb" | "network" | "control";
export type ConnectorFamily = "hdmi" | "bnc" | "fiber" | "xlr" | "trs" | "rca" | "usb" | "rj45" | "multicore" | "control";

export interface CatalogCable {
  id: string;
  name: string;
  category: CableCategory;
  family: ConnectorFamily;
  ends: string;
  use: string;
  status: "หลัก" | "มีเงื่อนไข" | "ทางเลือก" | "รอตรวจ";
  note: string;
  color: string;
}

export const CABLE_CATEGORIES: { id: CableCategory; label: string; glyph: string }[] = [
  { id: "video", label: "ภาพ · VIDEO", glyph: "▣" },
  { id: "fiber", label: "ไฟเบอร์ · FIBER", glyph: "✺" },
  { id: "audio", label: "เสียง · AUDIO", glyph: "♫" },
  { id: "stagebox", label: "Stagebox · Transport", glyph: "▤" },
  { id: "usb", label: "USB · Capture", glyph: "⌁" },
  { id: "network", label: "เครือข่าย · NETWORK", glyph: "⌘" },
  { id: "control", label: "ควบคุม · CONTROL", glyph: "◎" },
];

const C = (id: string, name: string, category: CableCategory, family: ConnectorFamily, ends: string, use: string, status: CatalogCable["status"], note: string, color: string): CatalogCable =>
  ({ id, name, category, family, ends, use, status, note, color });

export const CABLE_CATALOG: CatalogCable[] = [
  C("VID-HDMI-A-A", "HDMI Type-A ↔ Type-A", "video", "hdmi", "HDMI A ↔ HDMI A", "Camera/Laptop HDMI OUT → Switcher HDMI IN · Switcher OUT → TV", "หลัก", "ภาพ + เสียงฝังในสายเดียว ระยะ passive จำกัด", "#e9bd6a"),
  C("VID-HDMI-C-A", "Mini HDMI (C) → HDMI A", "video", "hdmi", "Mini HDMI ↔ HDMI A", "กล้องที่มีช่อง Mini HDMI เท่านั้น", "มีเงื่อนไข", "ไม่ใช่หัวเดียวกับ Micro HDMI", "#d9a85a"),
  C("VID-HDMI-D-A", "Micro HDMI (D) → HDMI A", "video", "hdmi", "Micro HDMI ↔ HDMI A", "กล้องที่มีช่อง Micro HDMI เท่านั้น", "มีเงื่อนไข", "หัวเล็กสุดของ HDMI", "#c99a4f"),
  C("VID-SDI-3G", "SDI 75Ω BNC (3G)", "video", "bnc", "BNC 75Ω ↔ BNC 75Ω", "SDI Camera → Switcher / Router / Encoder / Recorder", "หลัก", "ใช้ coax 75Ω ไม่ใช่ 50Ω · ระยะขึ้นกับสายและอัตรา [R07]", "#e07a5f"),
  C("VID-SDI-6G-12G", "SDI 6G/12G (4K)", "video", "bnc", "BNC ↔ BNC (12G)", "ระบบ 4K SDI เท่านั้น", "มีเงื่อนไข", "ระบบฝึกใช้ 1080p50 (3G)", "#c4664e"),
  C("VID-DP-DP", "DisplayPort ↔ DisplayPort", "video", "hdmi", "DP ↔ DP", "Workstation DP OUT → Monitor DP IN", "ทางเลือก", "ไม่อยู่ในผังหลักของ 5 ห้อง", "#9aa3b5"),
  C("VID-HDMI-EXTENDER", "HDMI Extender (Cat6 เฉพาะรุ่น)", "video", "rj45", "HDMI TX ↔ Cat6 ↔ HDMI RX", "จอที่อยู่ไกลเกินสาย HDMI", "ทางเลือก", "ต้องมี TX/RX จริง ห้ามเอา LAN ต่อ HDMI ตรง", "#7fa7c9"),
  C("FIB-SDI-LINK", "Fiber Link (คู่ SDI TX/RX)", "fiber", "fiber", "Optical ↔ Optical (ตามคู่ TX/RX)", "Fiber TX OPTICAL OUT → Fiber RX OPTICAL IN", "หลัก", "ต้องมี TX + RX ที่คู่กันและมีไฟเลี้ยง [R09]", "#ed953f"),
  C("FIB-CAMERA-CCU", "Camera Fiber (กล้อง ↔ CCU)", "fiber", "fiber", "Hybrid Fiber ตามระบบกล้อง", "Broadcast Camera → CCU / Base Station ของระบบเดียวกัน", "หลัก", "กล้องกับ CCU ต้องเป็นระบบคู่กัน", "#ffd23f"),
  C("FIB-PATCH-LC-SC", "Fiber Patch LC/SC", "fiber", "fiber", "LC/SC ตามโมดูล", "Patch panel → transceiver ที่ตรงรุ่น", "รอตรวจ", "ห้ามสุ่มหัว/ชนิด single-mode vs multimode", "#c98a3a"),
  C("AUD-LAV-TX", "สายไมค์ Lavalier → TX", "audio", "trs", "Lav plug → TX MIC IN", "Lavalier → Wireless Bodypack TX", "หลัก", "ตรวจ TRS/TRRS และหัวล็อกของรุ่น [R11]", "#c8f25a"),
  C("AUD-XLR-MIC", "XLR 3-pin (ไมค์)", "audio", "xlr", "XLR F ↔ XLR M", "Wired Mic / Podium / Shotgun / Crowd → Mixer / Stagebox MIC IN", "หลัก", "ระดับ Mic ต้องเข้า Preamp · Phantom เฉพาะไมค์ที่ต้องการ", "#b9b9c4"),
  C("AUD-RX-MIXER-XLR", "XLR จาก Wireless RX", "audio", "xlr", "RX XLR OUT → XLR IN", "Wireless Receiver XLR OUT → Mixer / Stagebox", "มีเงื่อนไข", "RX แต่ละรุ่น output ต่างกัน", "#a8b0c4"),
  C("AUD-RX-MIXER-3.5", "3.5 mm → 6.35 mm (RX → Mixer)", "audio", "trs", "3.5 TRS → 6.35 TRS", "Wireless RX 3.5 mm OUT → Mixer LINE IN", "รอตรวจ", "ตรวจ mono/stereo และ Line/Mic", "#58c087"),
  C("AUD-XLR-LINE-BAL", "XLR Balanced Line", "audio", "xlr", "XLR F ↔ XLR M (Line)", "Mixer BROADCAST/AUX → Switcher AUDIO IN / Embedder IN", "หลัก", "ระดับ Line ไม่ใช่ Mic", "#9ea7b8"),
  C("AUD-PA-ACTIVE", "Line → ลำโพง Active", "audio", "xlr", "XLR/TRS Line → PA IN", "Mixer PA/MAIN BUS → Active Speaker", "หลัก", "Active มีแอมป์ในตัว Passive ต้องใช้แอมป์", "#50b899"),
  C("AUD-TRS-6.35-BAL", "TRS 6.35 ↔ TRS 6.35", "audio", "trs", "6.35 TRS ↔ 6.35 TRS", "Mixer LINE OUT → Monitor / Switcher LINE IN", "มีเงื่อนไข", "TRS ไม่ได้ balanced เสมอ", "#6fd68a"),
  C("AUD-TRS-635-35", "TRS 6.35 → 3.5 mm", "audio", "trs", "6.35 TRS → 3.5 TRS", "Mixer OUT → Switcher 3.5 mm LINE/MIC IN", "มีเงื่อนไข", "ตั้งระดับช่องปลายทางให้ตรง Line", "#4fb36a"),
  C("AUD-TRS-3.5", "3.5 mm TRS ↔ 3.5 mm", "audio", "trs", "3.5 TRS ↔ 3.5 TRS", "Line output → อินพุต 3.5 ที่รองรับ", "มีเงื่อนไข", "ระดับสัญญาณและ stereo/mono ต้องตรง", "#7bc96f"),
  C("AUD-TRRS-3.5", "3.5 mm TRRS (Headset)", "audio", "trs", "3.5 TRRS ↔ 3.5 TRRS", "Smartphone / Headset", "ทางเลือก", "TRRS ไม่เท่ากับ TRS", "#8aa878"),
  C("AUD-TS-6.35", "TS 6.35 (Unbalanced)", "audio", "trs", "6.35 TS ↔ 6.35 TS", "เครื่องดนตรี → DI", "ทางเลือก", "ไม่อยู่ในผังหลัก 5 ห้อง", "#6f8f62"),
  C("AUD-RCA-LR", "RCA L/R", "audio", "rca", "RCA ↔ RCA", "เครื่องเล่น consumer → Line IN", "ทางเลือก", "ไม่ใช่สายระดับ Mic", "#d06c6c"),
  C("AUD-RCA-3.5", "RCA L/R ↔ 3.5 mm", "audio", "rca", "RCA ↔ 3.5 TRS", "PC/Player Line → Mixer", "ทางเลือก", "ไม่อยู่ในผังบังคับ", "#c46b8b"),
  C("AUD-XLR-TRS-BAL", "XLR ↔ TRS 6.35 Balanced", "audio", "xlr", "XLR ↔ 6.35 TRS", "Mixer OUT → Switcher ที่มีอินพุต TRS เท่านั้น", "มีเงื่อนไข", "ใช้เมื่อปลายทางเป็น TRS จริง [R03]", "#8f98ac"),
  C("AUD-PA-PASSIVE", "Speaker Cable (Passive)", "audio", "control", "Amp SPEAKER OUT → Passive Speaker", "Power Amplifier → ลำโพง Passive", "มีเงื่อนไข", "ไม่ใช่สาย Line · ต้องมีแอมป์", "#7a6a5a"),
  C("AUD-HEADPHONE", "สายหูฟัง 6.35 / 3.5", "audio", "trs", "PHONES OUT → Headphones", "Mixer PHONES → หูฟัง", "ทางเลือก", "ใช้ตรวจฟัง ไม่ใช่ Program", "#5e7f6b"),
  C("STG-MULTICORE", "Analog Multicore Snake", "stagebox", "multicore", "Stagebox ↔ Mixer (หลายช่อง)", "Analog Stagebox → FOH Mixer / Console", "หลัก", "จำนวนช่องและหัวต้องคู่กับ Stagebox", "#7a5cff"),
  C("STG-DANTE-CAT", "Dante Cat6 Network", "stagebox", "rj45", "RJ45 ↔ RJ45 (Dante)", "Dante Stagebox ↔ Switch ↔ Dante Console", "ทางเลือก", "ต้องมีอุปกรณ์ Dante + subscription/clock [R14,R17]", "#5c7cff"),
  C("DATA-USB-WEBCAM", "USB-C → USB-A (Webcam Data)", "usb", "usb", "USB-C (Device) → USB-A (Host)", "Switcher USB WEBCAM → Notebook/PC USB HOST", "หลัก", "สาย data ไม่ใช่สายชาร์จ [R01]", "#8fb4ff"),
  C("DATA-USB-MAGEWELL", "USB 3.0 (Capture → Host)", "usb", "usb", "USB 3.0 Device → USB-A Host", "Magewell Capture → HP Notebook USB HOST", "หลัก", "ตรวจหัวฝั่ง capture ของรุ่นจริง [R05]", "#7aa2f0"),
  C("DATA-USB-C-C", "USB-C ↔ USB-C", "usb", "usb", "USB-C ↔ USB-C", "Host USB-C ↔ Peripheral USB-C", "มีเงื่อนไข", "หัว USB-C ไม่ได้บอกบทบาท host/device", "#6f8fd8"),
  C("DATA-USB-A-A", "USB-A ↔ USB-A", "usb", "usb", "USB-A ↔ USB-A", "เฉพาะอุปกรณ์ที่คู่มือระบุ", "ทางเลือก", "ห้ามต่อ host ↔ host", "#5f7cbf"),
  C("DATA-USB-B", "USB Type-B / Micro-B", "usb", "usb", "USB-B ↔ USB-A", "อุปกรณ์ที่มีช่อง Type-B", "รอตรวจ", "ไม่สวมสมมติให้ทุกอุปกรณ์", "#5470ad"),
  C("NET-CAT5E6-ENCODER", "Cat6 (Encoder → Router)", "network", "rj45", "RJ45 ↔ RJ45", "Hardware Encoder ETHERNET → Router LAN", "หลัก", "Ethernet สื่อสารสองทาง [R06]", "#38d6c4"),
  C("NET-ROUTER-UPLINK", "Cat6 / WAN Uplink", "network", "rj45", "Router WAN ↔ Uplink", "Router WAN → Internet Uplink / Ingest", "หลัก", "ต่อแล้วไม่ได้แปลว่าสตรีมพร้อม [R13]", "#2aa89a"),
  C("NET-POE-PTZ", "Cat6 PoE (PTZ)", "network", "rj45", "PoE Switch → PTZ", "PTZ ที่รองรับ PoE", "มีเงื่อนไข", "ภาพ SDI เป็นอีกเส้น", "#2b8f86"),
  C("CTRL-REPLAY", "Control Link (Replay)", "control", "control", "Controller ↔ Replay Server", "Replay Controller → Replay Server CONTROL", "หลัก", "เป็นสายควบคุม ไม่ใช่สายภาพ", "#ff8fd1"),
  C("CTRL-TALLY", "Tally / GPI", "control", "control", "GPI ↔ GPI", "Switcher TALLY → CCU / Tally Interface", "หลัก", "ห้ามคิดว่า BNC ภาพ = Tally [R09]", "#ffb347"),
  C("CTRL-INTERCOM", "Intercom XLR-4", "control", "xlr", "XLR-4 ↔ XLR-4", "Intercom Station ↔ Beltpack / Commentary Unit", "หลัก", "สัญญาณสื่อสาร ไม่ใช่เสียงรายการ", "#9ad0ff"),
  C("CTRL-REFERENCE", "Reference / Genlock (BNC)", "control", "bnc", "REF OUT → REF IN", "Sync Generator → อุปกรณ์ที่มี REF IN", "มีเงื่อนไข", "เป็นสัญญาณ Sync ไม่ใช่ SDI Program", "#b08cff"),
  C("CTRL-TIMECODE", "Timecode (LTC)", "control", "control", "TC OUT → TC IN", "Timecode Source → Recorder / Replay", "ทางเลือก", "ไม่บังคับทุกอุปกรณ์", "#c7a0e0"),
];

export const catalogById = (id: string) => CABLE_CATALOG.find((c) => c.id === id);

/** Which catalog item a scenario lead is (by its connectors and the route it serves). */
export function catalogIdFor(cable: CableDef): string {
  const [a, b] = cable.ends;
  const p = cable.purpose ?? "";
  if (p === "distractor") return a === "HDMI" ? "VID-HDMI-A-A" : a === "SDI" ? "VID-SDI-3G" : a.startsWith("XLR") ? "AUD-XLR-MIC" : a === "3.5mm" ? "AUD-TRS-3.5" : a === "6.35mm" ? "AUD-TRS-6.35-BAL" : "DATA-USB-A-A";
  if (a === "HDMI" && b === "HDMI") return "VID-HDMI-A-A";
  if (a === "SDI") return "VID-SDI-3G";
  if (a === "FIBER") return p.startsWith("fiber-") ? "FIB-CAMERA-CCU" : "FIB-SDI-LINK";
  if (p.startsWith("lav-")) return "AUD-LAV-TX";
  if (p === "mix-pa") return "AUD-PA-ACTIVE";
  if (a.startsWith("XLR")) return ["mix-bc", "mix-embed"].includes(p) ? "AUD-XLR-LINE-BAL" : ["rx-mix", "rx-stage", "stage-2", "stage-3", "stage-4", "stage-5"].includes(p) ? "AUD-RX-MIXER-XLR" : "AUD-XLR-MIC";
  if (a === "3.5mm" && b === "6.35mm") return "AUD-RX-MIXER-3.5";
  if (a === "6.35mm" && b === "3.5mm") return "AUD-TRS-635-35";
  if (a === "6.35mm") return "AUD-TRS-6.35-BAL";
  if (a === "USB-C") return "DATA-USB-WEBCAM";
  if (a === "USB-A") return "DATA-USB-MAGEWELL";
  if (a === "MULTICORE") return "STG-MULTICORE";
  if (a === "ETHERNET") return ["destination", "backup-live"].includes(p) ? "NET-ROUTER-UPLINK" : "NET-CAT5E6-ENCODER";
  if (a === "RS422") return "CTRL-REPLAY";
  if (a === "GPI") return "CTRL-TALLY";
  if (a === "XLR4") return "CTRL-INTERCOM";
  return "AUD-TRS-3.5";
}

/** Leads the trainee must bring: every scenario lead not already installed (fault levels) and not a fixed lav lead. */
function packableCables(scenario: Scenario): CableDef[] {
  const preinstalled = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
  return scenario.cables.filter((c) => !preinstalled.has(c.id) && !c.fixedA);
}

/** Bag rules for a level: how many leads may be carried and how many distinct slots. */
export function bagLimits(scenario: Scenario) {
  const needed = packableCables(scenario).filter((c) => c.purpose !== "distractor").length;
  return { capacity: needed + 4, slots: 16 };
}

/** Leads hidden in the room because the bag did not bring them (first-come per catalog type, canonical order). */
export function hiddenCablesFor(scenario: Scenario, bag: Record<string, number>): string[] {
  const left = { ...bag };
  const ordered = [...packableCables(scenario)].sort((x, y) => Number(x.purpose === "distractor") - Number(y.purpose === "distractor"));
  const hidden: string[] = [];
  for (const c of ordered) {
    const id = catalogIdFor(c);
    if ((left[id] ?? 0) > 0) left[id]--;
    else hidden.push(c.id);
  }
  return hidden;
}

/** Per catalog item: how many of the bag's leads this level can actually use. */
export function bagUsage(scenario: Scenario, bag: Record<string, number>): Record<string, number> {
  const use: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const c of packableCables(scenario)) { const id = catalogIdFor(c); counts[id] = (counts[id] ?? 0) + 1; }
  for (const [id, n] of Object.entries(bag)) use[id] = Math.min(n, counts[id] ?? 0);
  return use;
}

export const MAX_WRONG_STREAK = 5;
