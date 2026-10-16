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
  status: "Primary" | "Conditional" | "Optional" | "To verify";
  note: string;
  color: string;
}

export const CABLE_CATEGORIES: { id: CableCategory; label: string; glyph: string }[] = [
  { id: "video", label: "VIDEO", glyph: "▣" },
  { id: "fiber", label: "FIBER", glyph: "✺" },
  { id: "audio", label: "AUDIO", glyph: "♫" },
  { id: "stagebox", label: "Stagebox · Transport", glyph: "▤" },
  { id: "usb", label: "USB · Capture", glyph: "⌁" },
  { id: "network", label: "NETWORK", glyph: "⌘" },
  { id: "control", label: "CONTROL", glyph: "◎" },
];

const C = (id: string, name: string, category: CableCategory, family: ConnectorFamily, ends: string, use: string, status: CatalogCable["status"], note: string, color: string): CatalogCable =>
  ({ id, name, category, family, ends, use, status, note, color });

export const CABLE_CATALOG: CatalogCable[] = [
  C("VID-HDMI-A-A", "HDMI Type-A ↔ Type-A", "video", "hdmi", "HDMI A ↔ HDMI A", "Camera/Laptop HDMI OUT → Switcher HDMI IN · Switcher OUT → TV", "Primary", "Picture + embedded audio in one lead; limited passive length", "#e9bd6a"),
  C("VID-HDMI-C-A", "Mini HDMI (C) → HDMI A", "video", "hdmi", "Mini HDMI ↔ HDMI A", "Cameras with a Mini HDMI socket only", "Conditional", "Not the same plug as Micro HDMI", "#d9a85a"),
  C("VID-HDMI-D-A", "Micro HDMI (D) → HDMI A", "video", "hdmi", "Micro HDMI ↔ HDMI A", "Cameras with a Micro HDMI socket only", "Conditional", "Smallest HDMI plug", "#c99a4f"),
  C("VID-SDI-3G", "SDI 75Ω BNC (3G)", "video", "bnc", "BNC 75Ω ↔ BNC 75Ω", "SDI Camera → Switcher / Router / Encoder / Recorder", "Primary", "75Ω coax, not 50Ω · reach depends on cable and rate", "#e07a5f"),
  C("VID-SDI-6G-12G", "SDI 6G/12G (4K)", "video", "bnc", "BNC ↔ BNC (12G)", "4K SDI systems only", "Conditional", "The course runs 1080p50 (3G)", "#c4664e"),
  C("VID-DP-DP", "DisplayPort ↔ DisplayPort", "video", "hdmi", "DP ↔ DP", "Workstation DP OUT → Monitor DP IN", "Optional", "Not used in the five rooms", "#9aa3b5"),
  C("VID-HDMI-EXTENDER", "HDMI Extender (model-specific Cat6)", "video", "rj45", "HDMI TX ↔ Cat6 ↔ HDMI RX", "Displays beyond HDMI reach", "Optional", "Needs a real TX/RX pair — never LAN straight into HDMI", "#7fa7c9"),
  C("FIB-SDI-LINK", "Fiber Link (SDI TX/RX pair)", "fiber", "fiber", "Optical ↔ Optical (matched TX/RX)", "Fiber TX OPTICAL OUT → Fiber RX OPTICAL IN", "Primary", "Needs a matched, powered TX + RX", "#ed953f"),
  C("FIB-CAMERA-CCU", "Camera Fiber (camera ↔ CCU)", "fiber", "fiber", "Hybrid fiber per camera system", "Broadcast camera → CCU / base station of the same system", "Primary", "Camera and CCU must be a matched system", "#ffd23f"),
  C("FIB-PATCH-LC-SC", "Fiber Patch LC/SC", "fiber", "fiber", "LC/SC per module", "Patch panel → matching transceiver", "To verify", "Never guess connector or single-mode vs multimode", "#c98a3a"),
  C("AUD-LAV-TX", "Lavalier lead → TX", "audio", "trs", "Lav plug → TX MIC IN", "Lavalier → Wireless Bodypack TX", "Primary", "Check TRS/TRRS and the locking plug of the model", "#c8f25a"),
  C("AUD-XLR-MIC", "XLR 3-pin (mic)", "audio", "xlr", "XLR F ↔ XLR M", "Wired mic → mixer / stage box MIC IN", "Primary", "Mic level needs a preamp · phantom only for mics that need it", "#b9b9c4"),
  C("AUD-RX-MIXER-XLR", "XLR from a wireless RX", "audio", "xlr", "RX XLR OUT → XLR IN", "Wireless Receiver XLR OUT → Mixer / Stagebox", "Conditional", "Receiver outputs differ by model", "#a8b0c4"),
  C("AUD-RX-MIXER-3.5", "3.5 mm → 6.35 mm (RX → mixer)", "audio", "trs", "3.5 TRS → 6.35 TRS", "Wireless RX 3.5 mm OUT → Mixer LINE IN", "To verify", "Check mono/stereo and line/mic", "#58c087"),
  C("AUD-XLR-LINE-BAL", "XLR Balanced Line", "audio", "xlr", "XLR F ↔ XLR M (Line)", "Mixer BROADCAST/AUX → Switcher AUDIO IN / Embedder IN", "Primary", "Line level, not mic", "#9ea7b8"),
  C("AUD-PA-ACTIVE", "Line → active speaker", "audio", "xlr", "XLR/TRS Line → PA IN", "Mixer PA/MAIN BUS → Active Speaker", "Primary", "Active has its own amplifier; passive needs an amp", "#50b899"),
  C("AUD-TRS-6.35-BAL", "TRS 6.35 ↔ TRS 6.35", "audio", "trs", "6.35 TRS ↔ 6.35 TRS", "Mixer LINE OUT → Monitor / Switcher LINE IN", "Conditional", "TRS is not always balanced", "#6fd68a"),
  C("AUD-TRS-635-35", "TRS 6.35 → 3.5 mm", "audio", "trs", "6.35 TRS → 3.5 TRS", "Mixer OUT → Switcher 3.5 mm LINE/MIC IN", "Conditional", "Set the destination input to line level", "#4fb36a"),
  C("AUD-TRS-3.5", "3.5 mm TRS ↔ 3.5 mm", "audio", "trs", "3.5 TRS ↔ 3.5 TRS", "Line output → a 3.5 mm input that supports it", "Conditional", "Level and stereo/mono must match", "#7bc96f"),
  C("AUD-TRRS-3.5", "3.5 mm TRRS (Headset)", "audio", "trs", "3.5 TRRS ↔ 3.5 TRRS", "Smartphone / Headset", "Optional", "TRRS is not TRS", "#8aa878"),
  C("AUD-TS-6.35", "TS 6.35 (Unbalanced)", "audio", "trs", "6.35 TS ↔ 6.35 TS", "Instrument → DI", "Optional", "Not used in the five rooms", "#6f8f62"),
  C("AUD-RCA-LR", "RCA L/R", "audio", "rca", "RCA ↔ RCA", "Consumer player → line in", "Optional", "Not a mic-level lead", "#d06c6c"),
  C("AUD-RCA-3.5", "RCA L/R ↔ 3.5 mm", "audio", "rca", "RCA ↔ 3.5 TRS", "PC/Player Line → Mixer", "Optional", "Not required by any room", "#c46b8b"),
  C("AUD-XLR-TRS-BAL", "XLR ↔ TRS 6.35 Balanced", "audio", "xlr", "XLR ↔ 6.35 TRS", "Mixer out → switcher TRS line inputs only", "Conditional", "Use only when the destination really is TRS", "#8f98ac"),
  C("AUD-XLR-35", "XLR → 3.5 mm stereo (unpadded)", "audio", "xlr", "XLR F → 3.5 TRS", "Pro line straight into a consumer 3.5 mm input", "Optional", "Overloads −10 dBV inputs — use a padded line interface instead", "#8a8f9c"),
  C("AUD-PA-PASSIVE", "Speaker Cable (Passive)", "audio", "control", "Amp SPEAKER OUT → Passive Speaker", "Power amplifier → passive speaker", "Conditional", "Not a line lead · needs an amplifier", "#7a6a5a"),
  C("AUD-HEADPHONE", "Headphone lead 6.35 / 3.5", "audio", "trs", "PHONES OUT → Headphones", "Mixer PHONES → headphones", "Optional", "For monitoring, not the Program feed", "#5e7f6b"),
  C("STG-MULTICORE", "Analog Multicore Snake", "stagebox", "multicore", "Stage box ↔ mixer (multi-channel)", "Analog Stagebox → FOH Mixer / Console", "Primary", "Channel count and connectors must match the stage box", "#7a5cff"),
  C("STG-DANTE-CAT", "Dante Cat6 Network", "stagebox", "rj45", "RJ45 ↔ RJ45 (Dante)", "Dante Stagebox ↔ Switch ↔ Dante Console", "Optional", "Needs Dante devices and clocking", "#5c7cff"),
  C("DATA-USB-WEBCAM", "USB-C → USB-A (Webcam Data)", "usb", "usb", "USB-C (Device) → USB-A (Host)", "Switcher USB WEBCAM → Notebook/PC USB HOST", "Primary", "A data lead, not a charge-only lead", "#8fb4ff"),
  C("DATA-USB-MAGEWELL", "USB 3.0 (Capture → Host)", "usb", "usb", "USB 3.0 Device → USB-A Host", "Magewell Capture → HP Notebook USB HOST", "Primary", "Check the capture-side plug of the real model", "#7aa2f0"),
  C("DATA-USB-C-C", "USB-C ↔ USB-C", "usb", "usb", "USB-C ↔ USB-C", "Host USB-C ↔ Peripheral USB-C", "Conditional", "A USB-C plug does not tell you host/device role", "#6f8fd8"),
  C("DATA-USB-A-A", "USB-A ↔ USB-A", "usb", "usb", "USB-A ↔ USB-A", "Only where the manual says so", "Optional", "Never host ↔ host", "#5f7cbf"),
  C("DATA-USB-B", "USB Type-B / Micro-B", "usb", "usb", "USB-B ↔ USB-A", "Devices with a Type-B socket (e.g. mixer USB audio)", "To verify", "Do not assume every device has one", "#5470ad"),
  C("NET-CAT5E6-ENCODER", "Cat6 (encoder → router)", "network", "rj45", "RJ45 ↔ RJ45", "Hardware Encoder ETHERNET → Router LAN", "Primary", "Ethernet is two-way", "#38d6c4"),
  C("NET-ROUTER-UPLINK", "Cat6 / WAN Uplink", "network", "rj45", "Router WAN ↔ Uplink", "Router WAN → Internet Uplink / Ingest", "Primary", "Connected does not mean streaming", "#2aa89a"),
  C("NET-POE-PTZ", "Cat6 PoE (PTZ)", "network", "rj45", "PoE Switch → PTZ", "PTZ cameras that support PoE", "Conditional", "SDI picture is a separate lead", "#2b8f86"),
  C("CTRL-REPLAY", "Control Link (Replay)", "control", "control", "Controller ↔ Replay Server", "Replay Controller → Replay Server CONTROL", "Primary", "A control lead, not video", "#ff8fd1"),
  C("CTRL-TALLY", "Tally / GPI", "control", "control", "GPI ↔ GPI", "Switcher TALLY → CCU / Tally Interface", "Primary", "A video BNC is not tally", "#ffb347"),
  C("CTRL-INTERCOM", "Intercom XLR-4", "control", "xlr", "XLR-4 ↔ XLR-4", "Intercom Station ↔ Beltpack / Commentary Unit", "Primary", "Talkback, not programme audio", "#9ad0ff"),
  C("CTRL-REFERENCE", "Reference / Genlock (BNC)", "control", "bnc", "REF OUT → REF IN", "Sync generator → devices with REF IN", "Conditional", "Sync reference, not SDI Program", "#b08cff"),
  C("CTRL-TIMECODE", "Timecode (LTC)", "control", "control", "TC OUT → TC IN", "Timecode Source → Recorder / Replay", "Optional", "Not required on every device", "#c7a0e0"),
];

export const catalogById = (id: string) => CABLE_CATALOG.find((c) => c.id === id);

/** Which catalog item a scenario lead is (by its connectors and the route it serves). */
/** Classroom (studio-full) table leads whose connector pair alone would map to the wrong catalog entry. */
const CLASSROOM_CATALOG_IDS: Record<string, string> = {
  "trrs35-1": "AUD-TRRS-3.5",
  "ts635-1": "AUD-TS-6.35",
  "rca-35": "AUD-RCA-3.5",
  "speaker-xlr": "AUD-XLR-LINE-BAL",
  "usb-ac": "DATA-USB-MAGEWELL",
};

export function catalogIdFor(cable: CableDef): string {
  if (CLASSROOM_CATALOG_IDS[cable.id]) return CLASSROOM_CATALOG_IDS[cable.id];
  const [a, b] = cable.ends;
  const p = cable.purpose ?? "";
  if (p === "distractor") return a === "HDMI" ? "VID-HDMI-A-A" : a === "SDI" ? "VID-SDI-3G" : a === "speakON" ? "AUD-PA-PASSIVE" : a.startsWith("XLR") && b === "3.5mm" ? "AUD-XLR-35" : a.startsWith("XLR") ? "AUD-XLR-MIC" : a === "3.5mm" ? "AUD-TRS-3.5" : a === "6.35mm" ? "AUD-TRS-6.35-BAL"
    : a === "ETHERNET" ? "NET-CAT5E6-ENCODER" : a === "USB-C" && b === "USB-C" ? "DATA-USB-C-C" : a === "USB-C" ? "DATA-USB-WEBCAM" : a === "USB-B" ? "DATA-USB-B" : "DATA-USB-A-A";
  if (a === "HDMI" && b === "HDMI") return "VID-HDMI-A-A";
  if (a === "SDI") return "VID-SDI-3G";
  if (a === "FIBER") return p.startsWith("fiber-") ? "FIB-CAMERA-CCU" : "FIB-SDI-LINK";
  if (p.startsWith("lav-")) return "AUD-LAV-TX";
  if (p === "mix-pa") return "AUD-PA-ACTIVE";
  if (a.startsWith("XLR") && b === "6.35mm") return "AUD-XLR-TRS-BAL";
  if (p === "phones") return "AUD-HEADPHONE";
  if (a === "USB-B") return "DATA-USB-B";
  if (a === "USB-C" && b === "USB-C") return "DATA-USB-C-C";
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

/** Scenario leads that come with this bag (packed and usable): they start the level inside the bag. */
export function packedLeadsFor(scenario: Scenario, bag: Record<string, number>): string[] {
  const hidden = new Set(hiddenCablesFor(scenario, bag));
  return packableCables(scenario).filter((c) => !hidden.has(c.id)).map((c) => c.id);
}

/** Catalog ids of every lead the trainee can pack for this scenario (the cables laid out on its table). */
export function packableCatalogIds(scenario: Scenario): string[] {
  return [...new Set(packableCables(scenario).map(catalogIdFor))];
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
