/**
 * Phase 04 hardware geometry for the 13 verified Blackmagic Design models (ATEM Mini Pro lives in model-geometry.ts).
 * Every coordinate is measured on the official techspecs images (physical-specifications / connections) listed in
 * `source`; the pixel → millimetre factor of each view comes from the dimension printed on that same image.
 * Conventions (see model-geometry.ts): metres at real size, origin = bottom centre, operator side = +Z, X = operator's
 * right. Rear views are seen from behind, so on a rear panel facing −Z image-left is +X; cameras face their lens to −Z
 * and show their rear (LCD) to the operator at +Z.
 * `ports` hold only registry ports (connectable); `inert` holds real connectors the simulation does not enable.
 */
import type { Lit, ModelGeometry, ModelPortGeometry, Part, Press, SocketKind, V3 } from "./model-geometry";

const IMG = "https://images.blackmagicdesign.com/images/products/";
const M = (v: number) => +(v / 1000).toFixed(5);
const v3 = (x: number, y: number, z: number): V3 => [M(x), M(y), M(z)];
const BACK: V3 = [0, 0, -1], FRONT: V3 = [0, 0, 1], RIGHT: V3 = [1, 0, 0], LEFT: V3 = [-1, 0, 0], UP: V3 = [0, 1, 0];

/** Rear panel facing −Z, seen from behind: x = −(px − centre) × mm/px. */
const rearOf = (mmPx: number, cx: number, bottom: number, zMm: number) => (px: number, py: number): V3 => v3(-(px - cx) * mmPx, (bottom - py) * mmPx, zMm);
/** Front panel facing +Z, seen from the front: x = (px − centre) × mm/px. */
const frontOf = (mmPx: number, cx: number, bottom: number, zMm: number) => (px: number, py: number): V3 => v3((px - cx) * mmPx, (bottom - py) * mmPx, zMm);
const port = (at: V3, normal: V3, kind?: SocketKind): ModelPortGeometry => ({ at, normal, ...(kind ? { kind } : {}) });
const inert = (name: string, at: V3, normal: V3, kind: SocketKind) => ({ name, at, normal, kind });
const key = (p: V3, n: V3, w: number, h: number, label?: string, c?: string, lit?: Lit[], press?: Press): Part => ({ t: "key", p, n, s: [M(w), M(h)], ...(label ? { label } : {}), ...(c ? { c } : {}), ...(lit ? { lit } : {}), ...(press ? { press } : {}) });
const text = (p: V3, n: V3, t: string, sizeMm: number, c?: string): Part => ({ t: "text", p, n, text: t, size: M(sizeMm), ...(c ? { c } : {}) });
const box = (cx: number, cy: number, cz: number, w: number, h: number, d: number, c: string, round = false): Part => ({ t: "box", p: v3(cx, cy, cz), s: v3(w, h, d), c, round });

const BODY = "#1d2025", PANEL = "#26292f", WHITE_KEY = "#e6e8ea", METAL = "#8e949c";
const RED = "#ff2a1f", GREEN = "#2fd86a", AMBER = "#ffb02a";
const pgmLit = (n: number): Lit[] => [{ key: "pgm", eq: `SDI ${n}`, color: RED }, { key: "pvw", eq: `SDI ${n}`, color: GREEN }];

/* ───────────────────────── Batch A ───────────────────────── */

/** ATEM Television Studio HD8 ISO — 23 × 14.8 × 6.35 in, 14.9 lb. */
function tvsHd8Iso(): ModelGeometry {
  // Rear: connections@2x diagram, body outline 1308 px = 23 in → 0.4466 mm/px, centre 662 px, base line 585 px.
  const R = rearOf(0.4466, 662, 585, -160);
  const sdiX = [520, 559, 599, 639, 679, 719, 759, 797];
  const ports: Record<string, ModelPortGeometry> = {
    ...Object.fromEntries(sdiX.map((x, i) => [`sdi-in-${i + 1}`, port(R(x, 541), BACK, "bnc")])),
    "ref-in": port(R(220, 541), BACK, "bnc"),
    "pgm-out": port(R(888, 497), BACK, "bnc"),
    "aux-1": port(R(850, 497), BACK, "bnc"),
    "aux-2": port(R(850, 541), BACK, "bnc"),
    "mv-out": port(R(888, 541), BACK, "bnc"),
    "hdmi-mv": port(R(926, 520), BACK, "hdmi"),
    "xlr-l": port(R(1112, 520), BACK, "xlr3f"),
    "xlr-r": port(R(1165, 520), BACK, "xlr3f"),
    "usb-1": port(R(348, 497), BACK, "usbc"),
    "usb-2": port(R(383, 497), BACK, "usbc"),
    "eth": port(R(360, 545), BACK, "rj45"),
  };
  const inertList = [
    ...sdiX.map((x, i) => inert(`SDI OUTPUT ${i + 1}`, R(x, 497), BACK, "bnc")),
    inert("REF OUT", R(220, 497), BACK, "bnc"), inert("TIMECODE OUT", R(262, 497), BACK, "bnc"), inert("TIMECODE IN", R(262, 541), BACK, "bnc"),
    inert("MADI OUT", R(305, 497), BACK, "bnc"), inert("MADI IN", R(305, 541), BACK, "bnc"),
    inert("REMOTE", R(418, 500), BACK, "rj45"), inert("TALKBACK (RJ45)", R(463, 500), BACK, "rj45"),
    ...[397, 433, 470].map((x, i) => inert(`ETHERNET ${i + 2}`, R(x, 545), BACK, "rj45")),
    inert("CONTROL OUT L", R(968, 497), BACK, "trs"), inert("CONTROL OUT R", R(968, 541), BACK, "trs"),
    inert("STUDIO OUT L", R(1008, 497), BACK, "trs"), inert("STUDIO OUT R", R(1008, 541), BACK, "trs"),
    inert("STEREO IN L", R(1052, 497), BACK, "rca"), inert("STEREO IN R", R(1052, 541), BACK, "rca"),
    inert("TALKBACK (XLR 5-pin)", R(1218, 520), BACK, "xlr5"), inert("AC IN", R(105, 520), BACK, "iec"), inert("12–30V DC", R(170, 520), BACK, "xlr4"),
  ];
  // Side view (6.35 in = 427 px → 0.3777 mm/px; depth scaled to the official 14.8 in): deck from front lip 42 mm to 70.6 mm at
  // the rear, rear face 348 mm behind the front; raised LCD panel face from (z −102, y 72.9) to (z −173, y 161).
  const deckY = (z: number) => 42 + (188 - z) * (28.6 / 366);
  const deckN: V3 = [0, 0.997, 0.078];
  const D = (px: number, py: number): V3 => { const z = 188 - (412 - py) * 1.33; return v3((px - 550) * 0.531, deckY(z) + 1, z); };
  const panelN: V3 = [0, 0.627, 0.778];
  const P = (u: number, v: number): V3 => v3(u, 72.9 + 0.778 * v + 0.627, -102 - 0.627 * v + 0.778);
  const parts: Part[] = [
    { t: "prism", profile: [[-160, 0], [137, 0], [188, 36], [188, 42], [-178, 70.6], [-178, 64], [-160, 63]].map(([z, y]) => [M(z), M(y)]) as [number, number][], x: [M(-292), M(292)], c: BODY },
    { t: "prism", profile: [[-102, 72.9], [-173, 161], [-188, 155], [-150, 70.6]].map(([z, y]) => [M(z), M(y)]) as [number, number][], x: [M(-247), M(247)], c: "#2b2f35" },
    { t: "screen", p: P(0, 63), n: panelN, s: [M(100), M(62)], feed: "view" },
    ...[-36.6, -13.3, 11.7, 36.6].map((u): Part => ({ t: "knob", p: P(u, 12), r: M(6), n: panelN })),
    ...[-36.6, -13.3, 11.7, 36.6].map((u) => key(P(u, 104), panelN, 11, 5)),
    ...[-196.5, -172.6, -146, -120.5, -96.6, -73.3].flatMap((u) => [83, 58, 34].map((v) => key(P(u, v), panelN, 13, 9))),
    ...[71.7, 91.3, 110].flatMap((u) => [83, 58, 34, 12].map((v) => key(P(u, v), panelN, 13, 9))),
    text(P(186, 70), panelN, "Blackmagicdesign", 7, "#eef0f2"),
    // deck: 10 channel knobs, upper key row, source label strip, PROGRAM row (red) and PREVIEW row (green)
    ...Array.from({ length: 10 }, (_, i): Part => ({ t: "knob", p: D(128 + 31.25 * i, 235), r: M(5.5), n: deckN })),
    ...Array.from({ length: 10 }, (_, i) => key(D(128 + 31.25 * i, 285), deckN, 13, 11, undefined, WHITE_KEY)), key(D(444, 285), deckN, 13, 11),
    { t: "box", p: v3((264 - 550) * 0.531, deckY(47) + 0.8, 47), s: v3(160, 1.5, 9), c: "#0d1a2c" },
    ...Array.from({ length: 10 }, (_, i) => key(D(119 + 31.25 * i, 338), deckN, 14, 12, i < 8 ? String(i + 1) : undefined, WHITE_KEY, i < 8 ? [{ key: "pgm", eq: `SDI ${i + 1}`, color: RED }] : undefined, i < 8 ? { key: "pgm", value: `SDI ${i + 1}`, label: `PROGRAM ${i + 1}` } : undefined)),
    ...Array.from({ length: 10 }, (_, i) => key(D(119 + 31.25 * i, 366), deckN, 14, 12, i < 8 ? String(i + 1) : undefined, WHITE_KEY, i < 8 ? [{ key: "pvw", eq: `SDI ${i + 1}`, color: GREEN }] : undefined, i < 8 ? { key: "pvw", value: `SDI ${i + 1}`, label: `PREVIEW ${i + 1}` } : undefined)),
    ...[540, 569, 598, 627, 656].flatMap((x) => [232, 294].map((y) => key(D(x, y), deckN, 13, 11, undefined, WHITE_KEY))), key(D(712, 232), deckN, 13, 11, undefined, AMBER),
    ...[598, 627, 656, 685].flatMap((x) => [329, 366].map((y) => key(D(x, y), deckN, 13, 11, undefined, WHITE_KEY))),
    ...([[881, 232], [912, 232], [975, 232], [897, 316], [927, 316], [897, 351], [927, 351], [930, 369], [1007, 366]] as [number, number][]).map(([x, y]) => key(D(x, y), deckN, 13, 11, undefined, WHITE_KEY)),
    // T-bar: slot and lever
    { t: "box", p: v3(112.6, deckY(113) + 0.5, 113), s: v3(32, 2, 100), c: "#111316" },
    { t: "cyl", p: v3(112.6, deckY(60) + 30, 60), r: M(3.5), h: M(60), n: UP, c: METAL },
    { t: "box", p: v3(112.6, deckY(60) + 62, 60), s: v3(70, 10, 12), c: "#202328", round: true },
  ];
  return {
    displayScale: 1.4, size: v3(584, 161, 376),
    source: [`${IMG}atemtelevisionstudio/techspecs/physical-specifications/atem-television-studio-hd8-iso-imperial@2x.jpg`, `${IMG}atemtelevisionstudio/techspecs/connections/atem-television-studio-hd8-iso@2x.png`],
    ports, inert: inertList, parts,
    estimates: ["ความลึกของโปรไฟล์ด้านข้างปรับตามความลึกทางการ 14.8 in (รูปด้านข้างวัดได้ 350 mm)", "ตำแหน่งปุ่มบนพื้นหน้าเครื่องอ่านจากรูปมุมเฉียง (±3 mm)"],
  };
}

/** ATEM 2 M/E Constellation 4K — 19 in rack, 1 RU (1.74 in), depth 9.22 in, 8 lb. */
function constellation2me4k(): ModelGeometry {
  const R = rearOf(0.364, 663, 346, -117), F = frontOf(0.364, 663, 122, 117);
  const inX = [333, 383, 433, 483, 533, 583, 633, 683, 733, 778], outX = [835, 885, 935, 985, 1033, 1080];
  const ports: Record<string, ModelPortGeometry> = {
    ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`sdi-in-${i + 1}`, port(R(inX[Math.floor(i / 2)], i % 2 ? 312 : 262), BACK, "bnc")])),
    ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`sdi-out-${i + 1}`, port(R(outX[Math.floor(i / 2)], i % 2 ? 312 : 262), BACK, "bnc")])),
    "mv-out": port(R(1135, 262), BACK, "bnc"), "mv-out-2": port(R(1135, 312), BACK, "bnc"),
    "xlr-l": port(R(1210, 258), BACK, "trs"), "xlr-r": port(R(1210, 312), BACK, "trs"),
  };
  const inertList = [inert("AC IN", R(140, 280), BACK, "iec"), inert("CONTROL (Ethernet)", R(225, 258), BACK, "rj45"), inert("USB-C", R(222, 315), BACK, "usbc"),
    inert("TALKBACK (RJ45)", R(278, 258), BACK, "rj45"), inert("REF IN", R(278, 310), BACK, "bnc"), inert("TALKBACK HEADSET (XLR 5-pin)", F(125, 57), FRONT, "xlr5")];
  const srcX = (i: number) => 305 + 42.8 * i;
  const parts: Part[] = [
    box(0, 22.1, -1.5, 431, 44.2, 231, BODY), box(0, 22.1, 115.5, 482.6, 44.2, 3, PANEL),
    text(F(35, 60), FRONT, "12G SDI", 5, "#f0a43a"),
    ...([["PROD TALK", 205, 25], ["ENG TALK", 237, 25], ["CALL", 205, 60], ["PGM MIX", 237, 60], ["▲", 205, 95], ["▼", 237, 95]] as [string, number, number][]).map(([l, x, y]) => key(F(x, y), FRONT, 10, 9, l)),
    ...Array.from({ length: 20 }, (_, i) => key(F(srcX(i % 10), i < 10 ? 40 : 82), FRONT, 14, 14, String(i + 1), WHITE_KEY, pgmLit(i + 1))),
    key(F(760, 40), FRONT, 14, 14, "CUT", WHITE_KEY), key(F(760, 82), FRONT, 14, 14, "AUTO", "#f3c98a"),
    ...([["KEY1 MIX", "DSK1 MIX", "DSK2 MIX", "FTB"], ["BARS", "BLACK", "MP 1", "MP 2"], ["MIX", "WIPE", "DIP", "DVE"]]).flatMap((row, r) => row.map((l, c) => key(F(830 + 35 * c, [23, 60, 97][r]), FRONT, 10, 10, l))),
    { t: "screen", p: F(1040, 60), n: FRONT, s: [M(45), M(34)], feed: "view" },
    { t: "knob", p: F(1160, 62), r: M(9), n: FRONT },
    ...([["MENU", 25], ["SET", 60], ["LOCK", 96]] as [string, number][]).map(([l, y]) => key(F(1215, y), FRONT, 10, 9, l)),
    ...(["SDI INPUTS", "SDI OUTPUTS"] as const).map((l, i) => text(R(i ? 958 : 555, 336), BACK, l, 3)),
  ];
  return {
    displayScale: 1.4, size: v3(482.6, 44.2, 234),
    source: [`${IMG}atemconstellation/techspecs/physical-specifications/atem-2me-constellation-4k-imperial-xl.jpg`, `${IMG}atemconstellation/techspecs/connections/atem-2me-constellation-4k@2x.png`],
    ports, inert: inertList, parts,
  };
}

/** Blackmagic Videohub 20x20 12G — 19 in rack, 1 RU (1.74 in), depth 9.3 in, 7.87 lb. */
function videohub20(): ModelGeometry {
  const R = rearOf(0.3645, 662, 335, -118), F = frontOf(0.3645, 662, 123, 118);
  const inX = [278, 325, 375, 425, 475, 523, 572, 622, 672, 718], outX = [780, 830, 880, 928, 978, 1028, 1075, 1125, 1173, 1222];
  const ports: Record<string, ModelPortGeometry> = {};
  for (let i = 0; i < 20; i++) {
    const y = i % 2 ? 305 : 258;
    ports[`in-${i + 1}`] = port(R(inX[Math.floor(i / 2)], y), BACK, "bnc");
    ports[`out-${i + 1}`] = port(R(outX[Math.floor(i / 2)], y), BACK, "bnc");
  }
  const inertList = [inert("AC IN", R(115, 285), BACK, "iec"), inert("REF IN", R(183, 258), BACK, "bnc"), inert("REF OUT", R(230, 258), BACK, "bnc"),
    inert("ETHERNET", R(178, 305), BACK, "rj45"), inert("USB", R(225, 305), BACK, "usbc")];
  const top = ["MON", "DECK", "EDIT", "ATEM", "M/VIEW", "STREAM", "CAM", "ST/C", "PC", "MAC"], bottom = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const parts: Part[] = [
    box(0, 22.1, -1.5, 431, 44.2, 233, BODY), box(0, 22.1, 116.5, 482.6, 44.2, 3, PANEL),
    text(F(200, 38), FRONT, "Blackmagic", 6, "#eef0f2"), text(F(200, 62), FRONT, "Videohub 20x20 12G", 7, "#eef0f2"),
    ...top.map((l, i) => key(F(372 + 43.1 * i, 40), FRONT, 14, 13, l, WHITE_KEY)),
    ...bottom.map((l, i) => key(F(372 + 43.1 * i, 80), FRONT, 14, 13, l, WHITE_KEY)),
    key(F(828, 40), FRONT, 14, 13, "IN", "#f3c98a"), key(F(870, 40), FRONT, 14, 13, "CLEAR", "#f3c98a"),
    key(F(828, 80), FRONT, 14, 13, "CUT", WHITE_KEY), key(F(870, 80), FRONT, 14, 13, "TAKE", "#e54b44"),
    { t: "screen", p: F(985, 62), n: FRONT, s: [M(45), M(34)], feed: "view" },
    { t: "knob", p: F(1100, 55), r: M(15), n: FRONT },
    ...([["MENU", 25], ["SET", 60], ["LOCK", 96]] as [string, number][]).map(([l, y]) => key(F(1215, y), FRONT, 10, 9, l)),
    text(R(498, 330), BACK, "SDI IN", 3), text(R(1000, 330), BACK, "SDI OUT", 3),
  ];
  return {
    displayScale: 1.4, size: v3(482.6, 44.2, 236),
    source: [`${IMG}blackmagicvideohub/techspecs/physical-specifications/blackmagic-videohub-20x20-12g-imperial@2x.jpg`, `${IMG}blackmagicvideohub/techspecs/connections/blackmagic-videohub-20x20-12g@2x.png`],
    ports, inert: inertList, parts,
  };
}

/** Blackmagic Streaming Encoder HD — 5.51 × 1.75 × 6.9 in, 1.66 lb. */
function streamingEncoderHd(): ModelGeometry {
  const R = rearOf(0.2536, 276, 462, -87.6), F = frontOf(0.2536, 276, 172, 87.6);
  const ports: Record<string, ModelPortGeometry> = {
    "sdi-in": port(R(500, 405), BACK, "bnc"), "sdi-loop": port(R(500, 335), BACK, "bnc"), "sdi-mon": port(R(415, 335), BACK, "bnc"),
    "hdmi-mon": port(R(425, 415), BACK, "hdmi"), "eth": port(R(268, 400), BACK, "rj45"), "usb": port(R(345, 420), BACK, "usbc"),
  };
  const inertList = [inert("AC IN", R(60, 370), BACK, "iec"), inert("12V DC", R(165, 365), BACK, "xlr4"), inert("USB-C (front)", F(52, 90), FRONT, "usbc")];
  const parts: Part[] = [
    box(0, 22.2, 0, 140, 44.4, 175, BODY, true),
    box(...F(52, 90).map((v, i) => i === 2 ? 88.5 : v * 1000) as V3, 19, 19, 2, "#2b2e33"),
    key(F(135, 40), FRONT, 14, 10, "ON AIR", undefined, [{ key: "stream", eq: true, color: RED }], { key: "stream", value: true, label: "ON AIR · เริ่มสตรีม" }),
    key(F(135, 87), FRONT, 14, 10, "OFF", undefined, undefined, { key: "stream", value: false, label: "OFF · หยุดสตรีม" }),
    ...([["MENU", 195, 40], ["SET", 195, 87], ["CALL", 135, 134], ["LOCK", 195, 134]] as [string, number, number][]).map(([l, x, y]) => key(F(x, y), FRONT, 14, 10, l)),
    { t: "screen", p: F(340, 85), n: FRONT, s: [M(44), M(35)], feed: "view" },
    { t: "knob", p: F(500, 85), r: M(9.6), n: FRONT },
    text(F(500, 25), FRONT, "Blackmagicdesign", 3, "#eef0f2"),
    ...([["MONITOR OUT", 415, 356], ["SDI LOOP OUT", 500, 356], ["SDI IN", 500, 432], ["MONITOR OUT", 425, 440], ["WEBCAM OUT", 345, 440], ["LIVE STREAM", 268, 440], ["12V DC", 165, 440]] as [string, number, number][]).map(([l, x, y]) => text(R(x, y), BACK, l, 2)),
  ];
  return {
    displayScale: 1.6, size: v3(140, 44.45, 175.3),
    source: [`${IMG}blackmagicstreamingprocessors/techspecs/physical-specifications/blackmagic-streaming-encoder-hd-imperial@2x.jpg`, `${IMG}blackmagicstreamingprocessors/techspecs/connections/blackmagic-streaming-encoder-hd.png`],
    ports, inert: inertList, parts,
  };
}

/* ───────────────────────── Batch B ───────────────────────── */

/** HyperDeck Studio HD Plus — 8.27 × 1.74 × 6.96 in, 2.53 lb. One record source; SDI OUT A/B, SDI LOOP and 3G MONITOR are distinct. */
function hyperdeckHdPlus(): ModelGeometry {
  const R = rearOf(0.3175, 331, 333, -88.4), F = frontOf(0.3175, 331, 138, 88.4);
  const ports: Record<string, ModelPortGeometry> = {
    "sdi-in": port(R(562, 284), BACK, "bnc"), "sdi-out": port(R(562, 228), BACK, "bnc"), "sdi-out-2": port(R(617, 228), BACK, "bnc"),
    "sdi-loop": port(R(617, 284), BACK, "bnc"), "sdi-mon": port(R(320, 284), BACK, "bnc"),
    "hdmi-in": port(R(513, 295), BACK, "hdmi"), "hdmi-out": port(R(513, 240), BACK, "hdmi"), "eth": port(R(211, 287), BACK, "rj45"),
  };
  const inertList = [inert("AC IN", R(47, 282), BACK, "iec"), inert("10–14V DC", R(128, 283), BACK, "xlr4"),
    inert("REMOTE IN (RS-422)", R(212, 228), BACK, "db9"), inert("REMOTE OUT (RS-422)", R(322, 228), BACK, "db9"), inert("EXT DISK (USB-C)", R(268, 300), BACK, "usbc"),
    inert("REF OUT", R(400, 228), BACK, "bnc"), inert("REF IN", R(400, 284), BACK, "bnc"), inert("TIMECODE OUT", R(455, 228), BACK, "bnc"), inert("TIMECODE IN", R(455, 284), BACK, "bnc"),
    inert("HEADPHONE", F(36, 98), FRONT, "trs"), inert("SD CARD 1", F(77, 70), FRONT, "sd"), inert("SD CARD 2", F(107, 70), FRONT, "sd")];
  const parts: Part[] = [
    box(0, 22.1, 0, 210, 44.2, 176.8, BODY, true),
    key(F(36, 26), FRONT, 10, 8, "🔈"), key(F(36, 56), FRONT, 10, 8, "REM"),
    key(F(148, 40), FRONT, 11, 11, "SKIP", WHITE_KEY), key(F(205, 40), FRONT, 11, 11, "REC", "#c9302a", [{ key: "record", eq: true, color: RED }], { key: "record", value: true, label: "REC · เริ่มบันทึก" }),
    key(F(262, 40), FRONT, 11, 11, "SKIP", WHITE_KEY), key(F(320, 40), FRONT, 11, 11, "INPUT", WHITE_KEY, undefined, { key: "rec-input", value: "cycle", label: "INPUT · สลับขาเข้าบันทึก SDI/HDMI" }),
    key(F(148, 97), FRONT, 11, 11, "REW", WHITE_KEY), key(F(205, 97), FRONT, 11, 11, "PLAY", "#f1e3c4", [{ key: "play", eq: true, color: AMBER }], { key: "play", value: true, label: "PLAY · เล่นคลิป" }),
    key(F(262, 97), FRONT, 11, 11, "F FWD", WHITE_KEY), key(F(320, 97), FRONT, 11, 11, "STOP", "#1d4e8f", undefined, { key: "record", value: false, label: "STOP · หยุดบันทึก" }),
    ...([["SEARCH", 34], ["MENU", 69], ["SET", 104]] as [string, number][]).map(([l, y]) => key(F(377, y), FRONT, 13, 6.5, l)),
    { t: "screen", p: F(500, 67), n: FRONT, s: [M(44), M(36)], feed: "view" },
    { t: "knob", p: F(618, 67), r: M(8.5), n: FRONT },
    ...([["SDI OUT", 590, 248], ["SDI IN", 562, 312], ["SDI LOOP OUT", 617, 312], ["MONITOR OUT", 320, 312], ["HDMI OUT", 513, 255], ["HDMI IN", 513, 312], ["ETHERNET", 211, 312], ["A", 548, 207], ["B", 603, 207]] as [string, number, number][]).map(([l, x, y]) => text(R(x, y), BACK, l, 2.2)),
  ];
  return {
    displayScale: 1.6, size: v3(210, 44.2, 176.8),
    source: [`${IMG}hyperdeckstudio/techspecs/physical-specifications/hyperdeck-studio-hd-plus-imperial.jpg`, `${IMG}hyperdeckstudio/techspecs/connections/hyperdeck-studio-hd-plus.png`],
    ports, inert: inertList, parts,
  };
}

/**
 * Micro Converter 3G body — 3.13 × 0.98 × 1.80 in (79.5 × 24.9 × 45.7 mm), 5.29 oz. Length along X: the BNC end faces −X,
 * the HDMI / USB POWER end faces +X. The official image is a perspective view, so the end-face positions are estimates.
 */
function microConverter(direction: "hdmi-sdi" | "sdi-hdmi"): ModelGeometry {
  const L = 79.5, H = 24.9, W = 45.7;
  const bncA = v3(-L / 2, 12.5, -11), bncB = v3(-L / 2, 12.5, 11), hdmi = v3(L / 2, 9, -6), usb = v3(L / 2, 14, 13);
  const ports: Record<string, ModelPortGeometry> = direction === "hdmi-sdi"
    ? { "hdmi-in": port(hdmi, RIGHT, "hdmi"), "sdi-out": port(bncA, LEFT, "bnc"), "sdi-out-2": port(bncB, LEFT, "bnc"), "usb-pwr": port(usb, RIGHT, "usbc") }
    : { "sdi-in": port(bncA, LEFT, "bnc"), "sdi-loop": port(bncB, LEFT, "bnc"), "hdmi-out": port(hdmi, RIGHT, "hdmi"), "usb-pwr": port(usb, RIGHT, "usbc") };
  const title = direction === "hdmi-sdi" ? "HDMI to SDI 3G" : "SDI to HDMI 3G";
  const parts: Part[] = [
    box(0, H / 2, 0, L, H, W, "#7c8189", true),
    text(v3(0, H + 0.2, -6), UP, "Micro Converter", 3.2, "#f0a43a"), text(v3(0, H + 0.2, 4), UP, title, 4.4, "#f4f5f6"),
    text(v3(-L / 2 + 10, H + 0.2, 16), UP, "Blackmagicdesign", 2.4, "#e6e8ea"),
    { t: "cyl", p: v3(L / 2 + 0.3, 15, 19), r: M(0.9), h: M(0.6), n: RIGHT, c: "#42e06e" },
    text(v3(L / 2 + 0.2, 20.5, 13), RIGHT, "USB POWER", 1.6), text(v3(L / 2 + 0.2, 20.5, -6), RIGHT, direction === "hdmi-sdi" ? "HDMI IN" : "HDMI OUT", 1.8),
    text(v3(-L / 2 - 0.2, 22, -11), LEFT, direction === "hdmi-sdi" ? "SDI OUT" : "SDI IN", 1.8),
    text(v3(-L / 2 - 0.2, 22, 11), LEFT, direction === "hdmi-sdi" ? "SDI OUT" : "SDI LOOP OUT", 1.8),
  ];
  const slug = direction === "hdmi-sdi" ? "micro-converter-hdmi-to-sdi-3g" : "micro-converter-sdi-to-hdmi-3g";
  return {
    displayScale: 2.5, size: v3(L, H, W),
    source: [`${IMG}microconverters/techspecs/physical-specifications/${slug}-imperial-xl.jpg`, `${IMG}microconverters/techspecs/connections/${slug}.png`],
    ports, inert: [], parts,
    estimates: ["ตำแหน่งหัวต่อบนปลายทั้งสองอ่านจากรูปมุมเฉียง (±2 mm) ส่วนลำดับ BNC (ขาเข้า/loop) อ่านจากป้ายในรูป"],
  };
}

/** SmartView Duo — 19 × 5.24 × 1.38 in (3 RU), 3.15 lb. Two independent monitors: Monitor 1 = left screen from the front. */
function smartviewDuo(): ModelGeometry {
  const R = rearOf(0.4544, 531, 702, -17.5);
  const F = (px: number, py: number): V3 => v3((px - 531) * 0.4544, (293 - py) * 0.462, 17.5);
  const ports: Record<string, ModelPortGeometry> = {
    "sdi-in": port(R(697, 620), BACK, "bnc"), "sdi-loop": port(R(740, 620), BACK, "bnc"),
    "sdi-in-b": port(R(322, 620), BACK, "bnc"), "sdi-loop-b": port(R(366, 620), BACK, "bnc"),
  };
  const inertList = [inert("TALLY", R(432, 620), BACK, "db9"), inert("ETHERNET IN", R(503, 620), BACK, "rj45"), inert("ETHERNET OUT", R(556, 620), BACK, "rj45"),
    inert("USB 2.0", R(608, 620), BACK, "usbb"), inert("POWER +12V", R(655, 620), BACK, "dc")];
  const parts: Part[] = [
    box(0, 66.5, -1.5, 432, 133, 32, "#4a4f57"), box(0, 66.5, 16, 482.6, 133, 3, "#3d4148"),
    { t: "screen", p: F(303.5, 146.5), n: FRONT, s: [M(176), M(99)], feed: "in:sdi-in" },
    { t: "screen", p: F(757, 146.5), n: FRONT, s: [M(176), M(99)], feed: "in:sdi-in-b" },
    text(F(1005, 145), FRONT, "Blackmagicdesign", 5, "#eef0f2"),
    text(R(200, 548), BACK, "MONITOR 2", 4), text(R(835, 548), BACK, "MONITOR 1", 4),
    ...([["SDI IN", 322], ["SDI OUT", 366], ["SDI IN", 697], ["SDI OUT", 740]] as [string, number][]).map(([l, x]) => text(R(x, 588), BACK, l, 2.4)),
  ];
  return {
    displayScale: 1.3, size: v3(482.6, 133, 35),
    source: [`${IMG}smartview/techspecs/physical-specifications/smartview-duo-imperial@2x.jpg`, `${IMG}smartview/techspecs/connections/smartview-duo@2x.png`],
    ports, inert: inertList, parts,
  };
}

/* ───────────────────────── Batch C ───────────────────────── */

/**
 * Studio Camera 4K G2 body — 10.77 in wide (with handles) × 6.59 in high × 6.68 in deep. Right-side connector column
 * measured on the 4K Pro G2 side view (6.68 in = 462 px → 0.3672 mm/px). The 4K Plus G2 photo omits its SDI pair, but
 * the official techspecs list "SDI Video Inputs 1 / Outputs 1" and its connections diagram draws them in the same
 * column below HDMI, so the Plus uses the same column positions.
 */
function studioCamera(pro: boolean): ModelGeometry {
  const S = (px: number, py: number): V3 => v3(95, (443 - py) * 0.3672, -(px - 1089) * 0.3672);
  const ports: Record<string, ModelPortGeometry> = {
    "hdmi-out": port(S(1147, 154), RIGHT, "hdmi"), "sdi-out": port(S(1140, 213), RIGHT, "bnc"), "sdi-ret": port(S(1140, 254), RIGHT, "bnc"),
    ...(pro ? {} : { "mic-35": port(v3(-95, 12, -33), LEFT, "jack35") }),
  };
  const inertList = [
    inert("+12V DC (locking barrel)", S(1177, 366), RIGHT, "dc"),
    ...(pro ? [inert("ETHERNET", S(1136, 314), RIGHT, "rj45"), inert("+12V DC (XLR 4-pin)", S(1139, 409), RIGHT, "xlr4"),
      inert("XLR AUDIO IN 1", v3(-95, 95, -30), LEFT, "xlr3f"), inert("XLR AUDIO IN 2", v3(-95, 70, -30), LEFT, "xlr3f"),
      inert("TALKBACK HEADSET", v3(-95, 45, -30), LEFT, "xlr5"), inert("3.5mm MIC IN", v3(-95, 12, -40), LEFT, "jack35")] : []),
    inert("USB-C 1", v3(-95, 125, -25), LEFT, "usbc"), inert("USB-C 2", v3(-95, 113, -25), LEFT, "usbc"),
    inert(pro ? "3.5mm HEADPHONE (with mic)" : "3.5mm HEADPHONE", v3(-95, 12, -24), LEFT, "jack35"),
  ];
  const parts: Part[] = [
    {t:"loft",c:"#16181b",finish:"plastic",chamfer:.13,
      sections:[[-80,78,90,112],[-40,75,136,135],[-26,75,190,150],[30,75,190,150]].map(([z,y,w,h])=>[M(z),M(y),M(w),M(h)])}, // central lens housing tapers into the wide display body
    box(0, 80, 47, 228, 150, 34, "#1b1e22", true),                        // rear LCD housing
    { t: "screen", p: v3(0, 82, 64.3), n: FRONT, s: [M(155), M(87)], feed: "view" },
    // Hollow MFT mount as seen in the local official front photograph (not a solid metal disc).
    { t: "lathe", p: v3(0, 78, -80), n: BACK, c: "#8b9095", finish: "metal",
      profile: [[24,0],[32,0],[33,2],[33,10],[31,12],[24,12],[24,0]].map(([r,y])=>[M(r),M(y)]) },
    { t: "cyl", p: v3(0, 78, -80.3), r: M(23), h: M(0.6), n: BACK, c: "#090c10" },
    box(0, 78, -81, 17.3, 13, 0.5, "#354741"), // recessed sensor; no invented lens SKU
    { t: "tally", p: v3(0, 158, -20), s: v3(34, 18, 28) },                // numbered top tally
    text(v3(0, 167.2, -20), UP, "8", 12, "#ffffff"),
    // Both handles are open loops in the photographs, not filled rectangular blocks.
    ...[-1,1].map((sx): Part=>({t:"tube",r:M(4.5),c:"#131519",finish:"plastic",
      points:[[sx*112,145,43],[sx*127,145,51],[sx*131,135,57],[sx*131,28,57],[sx*126,17,51],[sx*112,17,43]].map(([x,y,z])=>v3(x,y,z))})),
    // Fold-out sunshade, open at the viewing side; hinges/angles are photo estimates.
    box(0,153,71,174,3,20,"#121417"),
    ...[-1,1].map((sx): Part=>({t:"prism",x:[M(sx*85-1.5),M(sx*85+1.5)],c:"#121417",
      profile:[[64,42],[81,53],[81,145],[64,153]].map(([z,y])=>[M(z),M(y)])})),
    ...([["PGM", 58], ["F1", 44], ["F2", 31], ["F3", 18]] as [string, number][]).map(([l, y]) => key(v3(-100, y + 50, 64.4), FRONT, 8, 6, l)),
    // Rear power switch (official connections diagram: "Power Switch" below the function buttons).
    key(v3(-100, 50, 64.4), FRONT, 8, 9, "ON", "#2a2d31", [{ key: "power", eq: true, color: GREEN }], { key: "power", value: "toggle", label: "POWER · เปิด/ปิดกล้อง" }),
    ...[110, 80, 50].map((y): Part => ({ t: "knob", p: v3(100, y, 64.4), r: M(7), n: FRONT })),
    text(v3(95.3, 110, -18), RIGHT, "HDMI", 3), text(v3(95.3, 92, -6), RIGHT, "SDI OUT", 2.4), text(v3(95.3, 77, -6), RIGHT, "SDI IN", 2.4),
    text(v3(95.3, 40, -60), RIGHT, "4K", 6, "#e8eaec"),
  ];
  const slug = pro ? "blackmagic-studio-camera-4k-pro-g2" : "blackmagic-studio-camera-4k-plus-g2";
  return {
    displayScale: 1.5, size: v3(273.6, 167.4, 169.7), mount: "tripod",
    source: [`${IMG}blackmagicstudiocamera/techspecs/physical-specifications/${slug}-imperial@2x.jpg`, `${IMG}blackmagicstudiocamera/techspecs/connections/${slug}${pro ? "@2x" : ""}.png`],
    ports, inert: inertList, parts,
    estimates: ["สัดส่วนชิ้นส่วนตัวกล้อง (ตัวเครื่อง จอหลัง มือจับ) ประมาณจากรูป ขนาดรวมตรงตามทางการ", "หัวต่อด้านซ้าย (USB-C, 3.5 mm, XLR) วางตามแผนภาพ connections (±5 mm)",
      ...(pro ? [] : ["รูป physical ของ 4K Plus G2 ไม่แสดง SDI แต่สเปกและแผนภาพยืนยันว่ามี จึงวางตามคอลัมน์เดียวกับ 4K Pro G2"])],
  };
}

/** URSA Broadcast G2 — 5.9 in wide × 9.93 in high × 10.95 in long (with lens mount), 7.83 lb. Lens −Z. */
function ursaBroadcastG2(): ModelGeometry {
  // Rear view (9.93 in = 610 px → 0.4135 mm/px, base at 1340 px, body centre 200 px; image-right = +X) and right-side view
  // (10.95 in = 665 px → 0.418 mm/px, rear at the left edge).
  const Rr = (px: number, py: number): V3 => v3((px - 200) * 0.4135, (1340 - py) * 0.4135, 139);
  const Sd = (px: number, py: number): V3 => v3(75, (605 - py) * 0.418, -(px - 782) * 0.418);
  const ports: Record<string, ModelPortGeometry> = {
    "sdi-out": port(Rr(327, 985), FRONT, "bnc"), "sdi-ret": port(Rr(327, 1022), FRONT, "bnc"),
    "sdi-mon": port(Sd(885, 295), RIGHT, "bnc"),
    "xlr-1": port(v3(-18, 182, -60), UP, "xlr3f"), "xlr-2": port(v3(18, 182, -60), UP, "xlr3f"),
  };
  const inertList = [
    inert("HEADPHONE", Rr(342, 942), FRONT, "jack35"), inert("REF IN / TIMECODE IN", Rr(327, 1065), FRONT, "bnc"),
    inert("+12V POWER IN (XLR 4-pin)", Rr(342, 1130), FRONT, "xlr4"), inert("USB-C", Rr(340, 1185), FRONT, "usbc"),
    inert("+12V POWER OUT", Sd(915, 355), RIGHT, "xlr4"), inert("LANC", Sd(880, 395), RIGHT, "jack35"), inert("BROADCAST LENS", Sd(990, 425), RIGHT, "jack35"),
  ];
  const parts: Part[] = [
    box(0, 12.5, 30, 110, 25, 200, "#1a1c1f", true),                       // shoulder pad
    box(0, 100, 20, 150, 150, 230, "#1f2226", true),                       // body
    ...[-1,1].map((sx): Part=>({t:"tube",r:M(4),c:"#15171a",finish:"plastic",
      points:[[sx*12,176,-58],[sx*12,223,-77],[sx*12,247,-55],[sx*12,247,52],[sx*12,223,72],[sx*12,176,58]].map(([x,y,z])=>v3(x,y,z))})),
    box(0,244,0,24,6,80,"#22262a",true), // grip bridges the two hollow rails
    { t: "cyl", p: v3(0, 105, -110), r: M(42), h: M(60), n: BACK, c: "#121418" },   // B4 lens barrel stub
    {t:"lathe",p:v3(0,105,-134),n:BACK,c:"#7a8086",finish:"metal",profile:[[31,0],[40,0],[41,2],[39,5],[31,5],[31,0]].map(([r,y])=>[M(r),M(y)])},
    { t: "cyl", p: v3(0, 105, -133), r: M(30), h: M(0.5), n: BACK, c: "#172522" },
    box(0, 105, 132, 100, 120, 10, "#2a2d31"),                              // V-mount battery plate
    { t: "screen", p: v3(-75.2, 130, 30), n: LEFT, s: [M(60), M(26)], feed: "view" },  // status LCD (left side)
    // Left-side control cluster and panel seams visible in the owner library's official left view.
    ...[0,1,2,3,4,5].map(i=>key(v3(-75.4,102,-2+i*12),LEFT,8,5)),
    ...[0,1,2,3].map(i=>key(v3(-75.4,90,8+i*15),LEFT,10,5)),
    {t:"knob",p:v3(-75.4,86,64),n:LEFT,r:M(6)},
    {t:"knob",p:v3(-75.4,142,-61),n:LEFT,r:M(9)},
    key(v3(-75.4,68,-60),LEFT,13,6,"REC","#b62928"),
    box(-75.15,116,-17,0.3,105,1,"#090b0e"),
    box(-75.15,66,21,0.3,1,99,"#090b0e"),
    text(v3(75.3, 155, -95), RIGHT, "4K BROADCAST", 3.5, "#e8eaec"),
    text(Sd(885, 270), RIGHT, "SDI OUT", 2.4), text(v3(0, 182.4, -78), UP, "XLR AUDIO IN", 2.6),
  ];
  return {
    displayScale: 1.5, size: v3(150, 252, 278), mount: "tripod",
    source: [`${IMG}blackmagicursabroadcast/techspecs/physical-specifications/blackmagic-ursa-broadcast-g2-imperial-xl.jpg`, `${IMG}blackmagicursabroadcast/techspecs/connections/blackmagic-ursa-broadcast-g2@2x.png`],
    ports, inert: inertList, parts,
    estimates: ["ขั้ว XLR AUDIO IN สองช่องบนหลังตัวกล้องวางตามแผนภาพ connections (±10 mm)", "สัดส่วนตัวกล้อง มือจับ และเลนส์ประมาณจากรูป ขนาดรวมตรงตามทางการ"],
  };
}

/** Blackmagic Camera Fiber Converter — 5.43 W × 7.51 H × 5.51 D in, 4.85 lb. Camera side −Z, operator panel +Z. */
function cameraFiberConverter(): ModelGeometry {
  // Connector side view (5.51 in = 609 px → 0.2298 mm/px across, 7.51 in = 726 px → 0.2628 mm/px up; image-right = camera = −Z).
  const S = (px: number, py: number): V3 => v3(69, (733 - py) * 0.2628, -(px - 304) * 0.2298);
  const ports: Record<string, ModelPortGeometry> = { "sdi-in": port(S(307, 400), RIGHT, "bnc"), "fiber": port(S(167, 387), RIGHT, "smpte") };
  const O = (x: number, y: number): V3 => v3(x, y, 70);
  const inertList = [
    inert("USB-C", S(327, 324), RIGHT, "usbc"), inert("3G SDI OUT", S(300, 467), RIGHT, "bnc"), inert("REF OUT", S(300, 533), RIGHT, "bnc"), inert("ETHERNET", S(280, 633), RIGHT, "rj45"),
    inert("HEADSET 1", O(-30, 92), FRONT, "xlr5"), inert("HEADSET 2", O(30, 92), FRONT, "xlr5"),
    inert("XLR AUDIO IN 1", O(-38, 30), FRONT, "xlr3f"), inert("XLR AUDIO IN 2", O(0, 30), FRONT, "xlr3f"),
    inert("3G SDI RETURN OUT 1", O(45, 52), FRONT, "bnc"), inert("3G SDI RETURN OUT 2", O(45, 34), FRONT, "bnc"), inert("3G SDI RETURN OUT 3", O(45, 16), FRONT, "bnc"),
    inert("TRACKER", O(-30, 64), FRONT, "jack35"), inert("DC OUT", O(10, 64), FRONT, "dc"),
  ];
  const parts: Part[] = [
    // Official side views show a tapered shoulder and full-width connector faces, not a plain cuboid.
    {t:"prism",x:[M(-69),M(69)],c:"#1b1d21",profile:[[70,0],[70,173],[46,187],[-38,187],[-67,156],[-67,66],[-44,43],[-44,0]].map(([z,y])=>[M(z),M(y)])},
    box(0, 180, -10, 60, 22, 70, "#24272c"),                                    // V-lock plate (top)
    box(0, 95, -62, 110, 150, 14, "#202327"),                                   // camera mounting plate
    ...([[-32, GREEN], [0, RED], [32, GREEN]] as [number, string][]).map(([x, c]): Part => ({ t: "key", p: O(x, 170), n: FRONT, s: [M(14), M(3)], c })),
    ...([["POWER", -32], ["TALLY", 0], ["FIBER", 32]] as [string, number][]).map(([l, x]) => text(O(x, 176), FRONT, l, 2.2)),
    ...[-35, -12, 12, 35].map((x): Part => ({ t: "knob", p: O(x, 125), r: M(5.5), n: FRONT })),
    ...[-35,-12,12,35].map((x): Part=>({t:"knob",p:O(x,146),r:M(4.5),n:FRONT})),
    box(0,137,70.3,101,47,0.6,"#111316",true),
    text(O(-23, 112), FRONT, "INTERCOM 1", 2.2), text(O(23, 112), FRONT, "INTERCOM 2", 2.2),
    key(O(48, 150), FRONT, 10, 6, "FOCUS"), key(O(48, 140), FRONT, 10, 6, "REC", "#c9302a"),
    text(S(307, 380), RIGHT, "SDI IN", 2.2),
  ];
  return {
    displayScale: 1.5, size: v3(138, 190.8, 140),
    source: [`${IMG}blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-camera-fiber-converter-imperial-xl.jpg`, `${IMG}blackmagicfiberconverters/techspecs/connections/blackmagic-camera-fiber-converter.png`],
    ports, inert: inertList, parts,
    estimates: ["แผงหลังฝั่งผู้ควบคุม (headset, XLR, SDI return, ปุ่ม) วางตามแผนภาพ connections (±5 mm)", "ด้าน D-tap / RET / CALL / PTZ ไม่ได้ปั้นหัวต่อ (เป็นปุ่มและฝาครอบ)"],
  };
}

/** Blackmagic Studio Fiber Converter — 8.28 W × 3.48 H × 14.64 D in, 6.17 lb. */
function studioFiberConverter(): ModelGeometry {
  const F = (px: number, py: number): V3 => v3((px - 288) * 0.3645, (245 - py) * 0.361, 186);
  const R = (px: number, py: number): V3 => v3(-(px - 1030) * 0.365, (240 - py) * 0.361, -186);
  const ports: Record<string, ModelPortGeometry> = {
    "fiber": port(F(128, 80), FRONT, "smpte"),
    "sdi-out": port(R(1165, 140), BACK, "bnc"), "sdi-out-2": port(R(1218, 140), BACK, "bnc"),
  };
  const inertList = [
    ...[1112, 1165, 1218].map((x, i) => inert(`RETURN IN ${i + 1}`, R(x, 200), BACK, "bnc")),
    inert("REF OUT", R(1278, 140), BACK, "bnc"), inert("REF IN", R(1278, 200), BACK, "bnc"), inert("AC IN", R(815, 170), BACK, "iec"),
    inert("INTERCOM / TALLY", R(940, 140), BACK, "db25"), inert("PTZ", R(935, 192), BACK, "db9"), inert("OPTICAL I/O", R(1047, 135), BACK, "sfp"), inert("ETHERNET", R(1047, 197), BACK, "rj45"),
    ...[1063, 1135, 1205, 1270].map((x, i) => inert(`AUDIO ANALOG OUT ${i + 1}`, R(x, 65), BACK, "xlr3m")),
    inert("USB-C", F(45, 190), FRONT, "usbc"),
  ];
  const parts: Part[] = [
    box(0, 44.2, 0, 210.3, 88.4, 372, "#1d2025", true),
    { t: "screen", p: F(360, 120), n: FRONT, s: [M(98), M(74)], feed: "view" },
    key(F(40, 85), FRONT, 14, 26, "I/O", "#0f1114", [{ key: "power", eq: true, color: GREEN }], { key: "power", value: "toggle", label: "POWER · เปิด/ปิดเครื่อง" }),
    ...([["MENU", 55], ["SET", 97], ["▲", 140], ["▼", 183]] as [string, number][]).map(([l, y]) => key(F(540, y), FRONT, 10, 9, l)),
    {t:"lathe",p:[F(128,175)[0],F(128,175)[1],M(186)],n:FRONT,c:"#16181b",finish:"rubber",
      profile:[[0,0],[14,0],[14,10],[13,12],[10,12],[10,2],[0,2]].map(([r,y])=>[M(r),M(y)])}, // open dust-cap cup
    text(F(470, 230), FRONT, "Blackmagicdesign", 3, "#eef0f2"),
    text(R(1190, 115), BACK, "12G DIGITAL I/O", 2.6), text(R(1165, 222), BACK, "RETURN IN", 2.2), text(R(1165, 40), BACK, "AUDIO ANALOG OUT", 2.6),
  ];
  return {
    displayScale: 1.3, size: v3(210.3, 88.4, 371.9),
    source: [`${IMG}blackmagicfiberconverters/techspecs/physical-specifications/blackmagic-studio-fiber-converter-imperial-xl.jpg`, `${IMG}blackmagicfiberconverters/techspecs/connections/blackmagic-studio-fiber-converter.png`],
    ports, inert: inertList, parts,
  };
}


/* ───────────────────────── Phase 05: remaining verified items ───────────────────────── */

/**
 * AJA 3G-AMA — 147.32 × 78.74 × 25.4 mm (manual v1.2r1 p.21). Body ends carry the BNC pair and the single DB-25;
 * analog audio reaches the player on the supplied breakout (manual p.7, Fig. 2): 4 × XLR F inputs (A–D) and
 * 4 × XLR M outputs (A–D). The registry's `audio-l` / `audio-r` are breakout inputs A / B, so their sockets sit on
 * those XLR barrels, not on the chassis. The archive has no orthographic end-panel photo: end-face placement of the
 * BNC pair, DB-25, USB and DC jack is an estimate from the manual illustration (p.4).
 */
function aja3gAma(): ModelGeometry {
  const L = 147.32, D = 78.74, H = 25.4;
  const fanX = L / 2 + 70, dz = 24, z0 = -3.5 * dz;
  const xlrIn = (i: number) => v3(fanX, 12.7, z0 + i * dz), xlrOut = (i: number) => v3(fanX, 12.7, z0 + (i + 4) * dz);
  const ports: Record<string, ModelPortGeometry> = {
    "sdi-in": port(v3(-L / 2, 12.7, -16), LEFT, "bnc"), "sdi-out": port(v3(-L / 2, 12.7, 6), LEFT, "bnc"),
    "audio-l": { ...port(xlrIn(0), RIGHT, "xlr3f"), lead: true }, "audio-r": { ...port(xlrIn(1), RIGHT, "xlr3f"), lead: true },
  };
  const inertList = [
    inert("SDI OUT 2 (BNC)", v3(-L / 2, 12.7, 26), LEFT, "bnc"),
    inert("ANALOG AUDIO (DB-25)", v3(L / 2, 12.7, -8), RIGHT, "db25"),
    inert("USB (Mini-Config)", v3(L / 2, 12.7, 22), RIGHT, "usbb"), inert("+5–20 VDC", v3(L / 2, 12.7, 32), RIGHT, "dc"),
    inert("BREAKOUT XLR IN C", xlrIn(2), RIGHT, "xlr3f"), inert("BREAKOUT XLR IN D", xlrIn(3), RIGHT, "xlr3f"),
    ...[0, 1, 2, 3].map((i) => inert(`BREAKOUT XLR OUT ${"ABCD"[i]}`, xlrOut(i), RIGHT, "xlr3m")),
  ];
  const parts: Part[] = [
    box(0, H / 2, 0, L, H, D, "#2a2d33", true),
    box(L / 2 + 8, 12.7, -8, 16, 14, 56, "#9aa0a8"),                                  // DB-25 shell of the breakout
    ...Array.from({ length: 8 }, (_, i): Part => ({ t: "tube", r: M(1.5), c: "#16181b", finish: "rubber",
      points: [v3(L / 2 + 16, 12.7, -8), v3(L / 2 + 30, 5, (z0 + i * dz) * 0.6), v3(fanX - 40, 12.7, z0 + i * dz)] })),
    ...Array.from({ length: 8 }, (_, i): Part => ({ t: "cyl", p: v3(fanX - 20, 12.7, z0 + i * dz), r: M(9.5), h: M(40), n: RIGHT, c: "#25282d", finish: "plastic" })),
    text(v3(0, H + 0.2, -10), UP, "AJA", 9, "#0089bf"), text(v3(0, H + 0.2, 10), UP, "3G-AMA", 6, "#e6e8ea"),
    text(v3(fanX + 1, 20, z0 + 1.5 * dz), RIGHT, "INPUT A–D", 3), text(v3(fanX + 1, 20, z0 + 5.5 * dz), RIGHT, "OUTPUT A–D", 3),
  ];
  return {
    displayScale: 1.6, size: v3(L, H, D),
    source: ["https://www.aja.com/products/3g-ama/spec-sheet.pdf", "https://www.aja.com/support/item-download/9589/AJA_3G-AMA_Manual_v1.2r1.pdf"],
    ports, inert: inertList, parts,
    stagingBounds: { min: v3(-L / 2 - 7, 0, z0 - 12), max: v3(fanX + 8, H, z0 + 7 * dz + 12) },
    estimates: ["ตำแหน่ง BNC/DB-25/USB/DC บนปลายตัวเครื่องประมาณจากภาพคู่มือหน้า 4 (ไม่มีภาพด้านปลายแบบตั้งฉาก)", "สาย breakout วาดแบบพับเก็บสั้น ไม่ใช่ความยาวจริง"],
  };
}

/**
 * Magewell USB Capture SDI Gen 2 (32070) — 92.2 × 40.2 × 12.3 mm (official tech-spec PDF). The official end view shows
 * a gold MCX jack on the body (not BNC) and a blue USB 3.0 Type-A female on the other end. The bundled MCX→BNC cable
 * (ACC00050, 33 cm) is modelled as an attached pigtail; registry port `sdi-in` sits on its BNC end, so the save
 * signature (port keys) is unchanged and the player still lands a 3G-SDI BNC plug there. BNC gender of ACC00050 is
 * not shown in any official image: drawn as a neutral BNC receptacle.
 */
function magewellSdiGen2(): ModelGeometry {
  const L = 92.2, W = 40.2, H = 12.3;
  const bnc = v3(-L / 2 - 70, 7, 0);
  return {
    displayScale: 2.5, size: v3(L, H, W),
    source: ["https://www.magewell.com/static/tech-specs/USB_Capture/USBCaptureSDIGen2EN.pdf", "https://www.magewell.com/static/press-images/USBCaptureSDIGen2/USBCaptureSDIGen2.zip"],
    ports: { "sdi-in": { ...port(bnc, LEFT, "bnc"), lead: true }, "usb": port(v3(L / 2, H / 2, 0), RIGHT, "usba") },
    inert: [{ name: "SDI IN (MCX, body)", at: v3(-L / 2, H / 2, 0), normal: LEFT, kind: "mcx" }],
    parts: [
      box(0, H / 2, 0, L, H, W, "#d9dadc", true),
      { t: "tube", r: M(1.8), c: "#141518", finish: "rubber", points: [v3(-L / 2 - 2, H / 2, 0), v3(-L / 2 - 24, 3, -10), v3(-L / 2 - 47, 3, -10), v3(-L / 2 - 54, 7, 0)] },
      { t: "cyl", p: v3(-L / 2 - 62, 7, 0), r: M(5.5), h: M(16), n: LEFT, c: "#9aa0a8", finish: "metal" },
      text(v3(0, H + 0.2, -3), UP, "USB Capture SDI", 5, "#5b5f66"), text(v3(0, H + 0.2, 5), UP, "MAGEWELL", 4, "#5b5f66"),
      text(v3(-L / 2 + 6, H + 0.2, 0), UP, "SDI IN", 2.4, "#5b5f66"),
      { t: "cyl", p: v3(L / 2 - 9, H + 0.1, -10), r: M(0.9), h: M(0.4), n: UP, c: "#2fd86a" },
      { t: "cyl", p: v3(L / 2 - 9, H + 0.1, 10), r: M(0.9), h: M(0.4), n: UP, c: "#2fd86a" },
      text(v3(L / 2 - 4, H + 0.2, -10), UP, "POWER", 1.8, "#5b5f66"), text(v3(L / 2 - 4, H + 0.2, 10), UP, "STATUS", 1.8, "#5b5f66"),
    ],
    stagingBounds: { min: v3(-L / 2 - 78, 0, -W / 2), max: v3(L / 2 + 3, H, W / 2) },
    estimates: ["ปลาย BNC ของสาย ACC00050 วาดพับใกล้ตัวเครื่อง ไม่ใช่ความยาว 33 cm จริง", "เพศของปลาย BNC บนสาย ACC00050 ไม่มีภาพทางการยืนยัน"],
  };
}

/**
 * Shure SM58 — 162 mm long, 51 mm grille, 23 mm tail (official spec sheet, Overall Dimensions). Drawn lying on its side:
 * grille toward −X, the XLR 3-pin male connector in the tail facing +X.
 */
function shureSm58(): ModelGeometry {
  const L = 162, R = 25.5, cy = R;
  const along = (x: number, r: number, h: number, c: string): Part => ({ t: "cyl", p: v3(x, cy, 0), r: M(r), h: M(h), n: RIGHT, c });
  return {
    displayScale: 1.5, size: v3(L, 51, 51),
    source: ["https://content-files.shure.com/publications/specSheet/en/sm58-spec-sheet.pdf", "https://www.shure.com/en-US/docs/guide/SM58"],
    ports: { "xlr-out": port(v3(L / 2, cy, 0), RIGHT, "xlr3m") },
    inert: [],
    parts: [
      { t: "lathe", p: v3(0, cy, 0), n: RIGHT, c: "#aeb1b7", finish: "grille",
        profile: [[0, -81], [8, -79], [16, -74], [22, -66], [25.5, -56], [25.5, -49], [24.8, -42], [22, -35], [20.5, -33], [0, -33]].map(([r, x]) => [M(r), M(x)]) },
      along(-L / 2 + 24, 25.6, 2, "#9ea3a9"), // retaining band seen across the spherical grille
      along(-L / 2 + 45, 21, 6, "#2b2e33"),                                 // grille ring / Shure badge band
      { t: "lathe", p: v3(0, cy, 0), n: RIGHT, c: "#25282d", finish: "metal",
        profile: [[0, -36], [20.5, -36], [18, -30], [16, -22], [14.5, -10], [11.5, 72], [11.5, 81], [0, 81]].map(([r, x]) => [M(r), M(x)]) },
      text(v3(-L / 2 + 58, cy + 16, 0), UP, "SHURE", 4, "#e6e8ea"),
    ],
    estimates: ["ส่วนโค้งหัว/ด้ามอ่านจากภาพผลิตภัณฑ์และ bounding dimensions 162 × 51 mm; ลายตะแกรงเป็นวัสดุ procedural", "ไม่เพิ่มสวิตช์เพราะรุ่นย่อย LC/S ยังไม่ยืนยัน"],
  };
}

const BASE_HARDWARE_GEOMETRY: Record<string, ModelGeometry> = {
  "bmd-atem-television-studio-hd8-iso": tvsHd8Iso(),
  "bmd-atem-2me-constellation-4k": constellation2me4k(),
  "bmd-videohub-20x20-12g": videohub20(),
  "bmd-streaming-encoder-hd": streamingEncoderHd(),
  "bmd-hyperdeck-studio-hd-plus": hyperdeckHdPlus(),
  "bmd-micro-converter-hdmi-sdi-3g": microConverter("hdmi-sdi"),
  "bmd-micro-converter-sdi-hdmi-3g": microConverter("sdi-hdmi"),
  "bmd-smartview-duo": smartviewDuo(),
  "bmd-studio-camera-4k-plus-g2": studioCamera(false),
  "bmd-studio-camera-4k-pro-g2": studioCamera(true),
  "bmd-ursa-broadcast-g2": ursaBroadcastG2(),
  "bmd-camera-fiber-converter": cameraFiberConverter(),
  "bmd-studio-fiber-converter": studioFiberConverter(),
  "aja-3g-ama": aja3gAma(),
  "magewell-usb-capture-sdi-gen2": magewellSdiGen2(),
  "shure-sm58": shureSm58(),
};

/** Surface details supported by the local front/side product photos; hole pitch is a visual approximation. */
function refineCase(id: string, geo: ModelGeometry): ModelGeometry {
  const parts = [...(geo.parts ?? [])], [w, h, d] = geo.size;
  const ventCases: Record<string, number> = { "bmd-atem-2me-constellation-4k": 0.431, "bmd-videohub-20x20-12g": 0.431,
    "bmd-streaming-encoder-hd": w, "bmd-hyperdeck-studio-hd-plus": w, "bmd-studio-fiber-converter": w };
  const caseWidth = ventCases[id];
  if (caseWidth) {
    const cols = Math.min(28, Math.max(12, Math.round(d / 0.009))), rows = Math.min(9, Math.max(4, Math.round(h / 0.007)));
    for (const side of [-1, 1]) parts.push({ t: "pattern", p: [side * (caseWidth / 2 + 0.0002), h / 2, 0], n: [side, 0, 0], r: 0.0014, c: "#07090c",
      points: Array.from({ length: cols * rows }, (_, i) => [(i % cols / (cols - 1) - 0.5) * d * 0.58, (Math.floor(i / cols) / (rows - 1) - 0.5) * h * 0.66]) });
  }
  if (w > 0.48 && h < 0.14) parts.push({ t: "pattern", p: [0, h / 2, d / 2 + 0.0003], n: FRONT, r: 0.0035, c: "#090a0c",
    points: [-1, 1].flatMap((sx) => [-1, 1].map((sy): [number, number] => [sx * (w / 2 - 0.010), sy * (h / 2 - 0.009)])) });
  if (id.startsWith("bmd-micro-converter")) for (const side of [-1, 1]) parts.push({ t: "pattern", p: [0, h / 2, side * (d / 2 + 0.0002)], n: [0, 0, side], r: 0.002, c: "#111316", points: [[-0.021, 0], [0.021, 0]] });
  if (geo.mount === "tripod") {
    const z = id.includes("studio-camera") ? -0.0802 : -0.0952;
    parts.push({ t: "pattern", p: [0, id.includes("studio-camera") ? 0.078 : 0.105, z], n: BACK, r: 0.002, c: "#8b9095", points: [[-0.038, -0.038], [-0.038, 0.038], [0.038, -0.038], [0.038, 0.038]] });
  }
  // Enclosures are metal; camera grips are moulded plastic. Other explicit finishes (lead/grille) win.
  const finished = parts.map((p): Part => "c" in p && !p.finish && (p.t === "box" || p.t === "cyl") ? { ...p,
    ...(p.t === "box" && Math.max(...p.s)>0.06 && Math.min(...p.s)>0.003 ? {round:true}:{}),
    finish: geo.mount === "tripod" || id === "bmd-camera-fiber-converter" ? "plastic" : "metal" } : p);
  return { ...geo, parts: finished, estimates: [...(geo.estimates ?? []), ...(caseWidth ? ["ลายช่องระบายอากาศด้านข้างประมาณความถี่จากภาพ local; ไม่ใช่ CAD รูเจาะ"] : [])] };
}
export const HARDWARE_GEOMETRY: Record<string, ModelGeometry> = Object.fromEntries(Object.entries(BASE_HARDWARE_GEOMETRY).map(([id, geo]) => [id, refineCase(id, geo)]));
