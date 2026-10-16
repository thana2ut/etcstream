import type { ControlValue, Cue, ExtraCable, FaultScenario, ObjectivePredicate, Quiz, StageManifest } from "./types";
import type { EvalContext } from "./types";
import {
  masked, all, cfgIs, CONCEPTS, cuesDone, edge, evidence, faultsRecovered, hears, historyHas, inputCarries, live, mirrorsProgram, noBlackAfterStart,
  noCableProblems, noFeedback, notShows, o, placedAll, quizOk, recording, shows, showsAll, signedOff, site,
} from "./library";
import { MODELS } from "./equipment";
import { ROOMS } from "./rooms";

/* ═════════════ preflight vocabulary (site/stage checklist, English) ═════════════ */
export const PREFLIGHT: Record<string, string> = {
  "power-check": "ตรวจไฟเลี้ยงที่ติดป้ายแล้ว โดยไม่ทำงานกับไฟฟ้าหลัก",
  format: "ยืนยันรูปแบบทั้งระบบ: 1080p50 · Rec.709 · 48 kHz",
  legible: "ตรวจว่าสไลด์และข้อความอ่านได้จากแถวหลัง",
  "cable-route": "เดินสายตามผนังหรือราง ไม่กีดขวางทางเดิน",
  licensed: "สื่อการสอนและกราฟิกมีสิทธิ์ใช้งาน และไม่มีการป้องกัน HDCP",
  soundcheck: "ตรวจเสียงด้วยระดับพูดจริง เผื่อระดับก่อนเสียงแตก",
  clap: "ทดสอบตบมือหรือสเลตเพื่อให้ภาพและเสียงตรงกัน",
  storage: "ตรวจสื่อบันทึก: เชื่อมต่อแล้ว มีพื้นที่ว่าง และบันทึกไฟล์ทดสอบได้",
  permission: "ยืนยันสิทธิ์และรหัสสตรีมทดสอบส่วนตัว โดยปกปิดรหัสและไม่เผยแพร่สาธารณะ",
  shelter: "เก็บอุปกรณ์ในที่กำบังแห้งที่เหมาะสม ยกหัวต่อพ้นพื้นเปียก",
  "power-signoff": "ช่างที่มีคุณสมบัติรับรองไฟชั่วคราวพร้อมเครื่องตัดไฟรั่ว RCD/GFCI ตามข้อกำหนดพื้นที่",
  ramp: "ติดตั้งรางครอบสายบริเวณทางเดินสาธารณะ",
  "rating-chart": "ตรวจพิกัดสายเทียบกับระยะที่วัดจริง",
  fallback: "บันทึกแผนเครือข่ายสำรอง โดยใช้เส้นทางที่มีอุปกรณ์รองรับจริง",
  rights: "ยืนยันสิทธิ์ถ่ายทอดการแข่งขันในระบบจำลอง",
  crew: "ยืนยันตำแหน่ง หน้าที่ และตารางทีมงาน",
  comms: "ทดสอบคิวผู้กำกับและไฟแสดงกล้องออกอากาศในระบบจำลอง",
  sightlines: "ตรวจมุมกล้องและพื้นที่ขาตั้ง ไม่มีสิ่งกีดขวางหรืออันตรายริมสนาม",
  holding: "เตรียมแหล่งภาพสำรองและภาพพักรายการ",
  "mic-place": "ตั้งไมค์ระดับปาก หันหลบลำโพง",
  wind: "ติดอุปกรณ์กันลมให้ไมค์กลางแจ้ง",
  privacy: "ตรวจป้ายแจ้งความเป็นส่วนตัวของผู้ชม",
  risk: "ประเมินความเสี่ยงแล้ว",
  lighting: "ปรับแสงสมดุลด้วยการควบคุมจำลอง ภายใต้การดูแลผู้เชี่ยวชาญ",
  handover: "จัดทำเอกสารส่งมอบงานทีมงานแล้ว",
  teardown: "แผนเก็บงาน: ปิดเครื่อง ม้วนสาย เก็บเข้ากล่อง",
};

/* ═════════════ builders ═════════════ */
type Pair = [string, string];
const C = (device: string, values: Record<string, ControlValue>) => Object.entries(values).map(([key, value]) => ({ device, key, value }));
const cue = (id: string, call: string, expect: string): Cue => ({ id, call, expect });
const cfgFault = (id: string, label: string, concept: FaultScenario["concept"], device: string, key: string, bad: ControlValue, order: number, lock = false): FaultScenario =>
  ({ id, label, concept, order, config: [{ device, key, value: bad, lock }], cleared: (c) => c.cfg(device, key) !== bad });
const unplugFault = (id: string, label: string, concept: FaultScenario["concept"], pair: Pair, order: number): FaultScenario =>
  ({ id, label, concept, order, unplug: [pair], cleared: (c) => c.edges.some((e) => e.from === pair[0] && e.to === pair[1]) });
const quiz = (concept: keyof typeof CONCEPTS): Quiz => CONCEPTS[concept].check;

const powerAll = (devs: string[]) => devs.flatMap((d) => MODELS[(roomOf(d))]?.needsPower ? [{ device: d, key: "power", value: true }] : []);
let CURRENT_ROOM: keyof typeof ROOMS = "xs";
const roomOf = (d: string) => ROOMS[CURRENT_ROOM].instances[d]?.model ?? "";

interface Spec extends Omit<StageManifest, "objectives" | "room" | "preflight"> { obj: ObjectivePredicate[]; preflight?: string[] }

/** Common objectives every stage gets: installed, powered, documented channel map, preflight, quiz, sign-off. */
function finish(room: keyof typeof ROOMS, s: Spec): StageManifest {
  const decoys = new Set(s.decoys ?? []);
  const required = s.devices.filter((d) => !decoys.has(d));
  const needPower = required.filter((d) => MODELS[ROOMS[room].instances[d].model].needsPower);
  const cert = s.guidance === "certification";
  const preflight = s.preflight ?? [];
  const common: ObjectivePredicate[] = [
    o("installed", "ติดตั้งอุปกรณ์ที่ต้องใช้ครบทุกจุด", "safety", "physical", "safety", placedAll(required)),
    o("powered", "อุปกรณ์ที่ใช้งานผ่านการตรวจไฟเลี้ยงครบ", "config", "physical", "power", (c: EvalContext) => {
      const off = needPower.filter((d) => !c.view[d]?.powered);
      return off.length ? { ok: false, reason: `ไม่มีไฟเลี้ยง: ${off.map((d) => ROOMS[room].instances[d].label).join(", ")}`, fix: "ตรวจไฟเลี้ยงแต่ละอุปกรณ์" } : { ok: true };
    }),
    o("channel-map", "ต่อสายตรงตามผังช่องสัญญาณ", "signal", "physical", "direction", (c: EvalContext) => {
      // A documented fallback (pre-tested secondary gateway during a locked ISP outage) legitimately replaces the primary WAN patch.
      const outage = (d: string) => String(c.cfg(d, "wan-link") ?? "").startsWith("Down");
      const missing = s.solution.filter(([f, t]) => !c.edges.some((e) => e.from === f && e.to === t) && !outage(f.split(":")[0]) && !outage(t.split(":")[0]));
      if (!missing.length) return { ok: true };
      return cert ? { ok: false, reason: `ยังต่อไม่ตรงใบงาน ${missing.length} จุด`, fix: "เทียบแผนต่อสายกับเส้นทางที่ใบงานกำหนด" }
        : { ok: false, reason: `ยังขาด: ${missing.map(([f, t]) => `${f} → ${t}`).join("; ")}`, fix: "ต่อขาออกเข้าขาเข้าตามเอกสาร" };
    }, cert),
    ...preflight.map((k) => o(`pre-${k}`, PREFLIGHT[k], "safety", "physical", k.includes("power") ? "power" : "safety", site(k, PREFLIGHT[k]), ["ramp", "shelter", "power-signoff"].includes(k))),
    ...(s.cues.length ? [o("cues", `ออกอากาศตามคิวครบ ${s.cues.length} คิว`, "evidence", "rehearsal", "output-assign", cuesDone(), cert), o("no-black", "ไม่มีภาพดำออกอากาศระหว่างซ้อม", "quality", "rehearsal", "output-assign", noBlackAfterStart())] : []),
    o("quiz", "คำถามทบทวนความเข้าใจ", "evidence", "delivery", s.quiz ? "direction" : "direction", quizOk()),
    o("signoff", "ตรวจรับงานและเก็บงาน", "evidence", "delivery", "safety", signedOff(), true),
  ];
  return { ...s, room, preflight, objectives: [...s.obj, ...common] };
}

function cables(...xs: [string, string, [ExtraCable["ends"][0], ExtraCable["ends"][1]], number, number?][]): ExtraCable[] {
  return xs.map(([id, label, ends, lengthM, ratedM]) => ({ id, label, ends, lengthM, ratedM }));
}

/* ══════════════════════════ ROOM 01 · CLASSROOM (XS) — EduStream 25-level wiring guide ══════════════════════════
 * Generic teaching mini switcher (HDMI IN1/IN2, independent HDMI PROGRAM OUT + USB WEBCAM DEVICE, stereo LINE AUDIO IN),
 * wireless lav kit (lav → TX, RF pairing TX ~ RX, RX XLR out), 4-ch mixer with separate MAIN/PA and STREAM/AUX buses,
 * active PA, front projector/TV, simulated OBS notebook. All GENERIC TRAINING MODELS (no branded ports invented). */
const obsHasProgram = (c: EvalContext) => {
  const v = c.view.host, pgm = c.view.sw?.picture;
  if (!v?.picture) return { ok: false, reason: c.view.host?.problem?.text ?? "OBS ยังไม่ได้รับภาพจากเว็บแคม", fix: "ต่อ USB WEBCAM (DEVICE) ของเครื่องสลับภาพเข้า USB HOST ของโน้ตบุ๊ก แล้วเลือก Video Capture Device ใน OBS" };
  return v.picture === pgm ? { ok: true } : { ok: false, reason: `OBS แสดง ${v.picture} แต่ PROGRAM คือ ${pgm}`, fix: "เลือกเว็บแคมของเครื่องสลับภาพเป็นแหล่งภาพ OBS" };
};
const obsAudioExact = (c: EvalContext) => {
  const a = c.view.host?.audio ?? [];
  if (!a.includes("TEACHER VOICE")) return { ok: false, reason: `OBS ไม่มีเสียงผู้สอน (ได้ยิน: ${a.join(" + ") || "เงียบ"})`, fix: "มิกเซอร์ STREAM/AUX → AUDIO IN เปิดเข้ารายการ แล้วเลือกเสียงจากอุปกรณ์จับภาพ USB ใน OBS" };
  const extra = a.filter((x) => x !== "TEACHER VOICE");
  return extra.length ? { ok: false, reason: `เสียงใน OBS ซ้อน/เกิน: ${extra.join(" + ")}`, fix: "ปิดเสียงที่มากับ HDMI ของกล้อง และปิดไมค์คอมพิวเตอร์เพิ่มใน OBS" } : { ok: true };
};
const xsMixer = (aux: boolean) => C("mix", { power: true, "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-main": true, "main-fader": "Unity", ...(aux ? { "ch1-aux": true, "aux-master": "Unity" } : {}) });
const xsWireless = [...C("tx", { power: true }), ...C("rx", { power: true, rf: "CH 1", pair: "Paired" })];

function classroom(): StageManifest[] {
  CURRENT_ROOM = "xs";
  const room = "xs" as const;
  const L1 = finish(room, {
    id: "XS-01", level: 1, title: "เส้นทางภาพ · Video Path", subtitle: "ฝึกพร้อมคำแนะนำ · กล้อง → เครื่องสลับภาพ → จอหน้าห้อง", guidance: "guided", minutes: "8–10 นาที",
    ticket: "นำภาพจากกล้องห้องเรียนขึ้นจอหน้าห้องผ่านเครื่องสลับภาพ",
    callSheet: ["กล้องบนขาตั้งกลางทางเดินด้านหลัง", "เครื่องสลับภาพที่โต๊ะผู้ควบคุมด้านหลัง", "โปรเจกเตอร์/จอหน้าห้อง"],
    briefing: ["สาย HDMI เส้นที่ 1: Camera HDMI OUT → Switcher HDMI IN1", "สาย HDMI เส้นที่ 2: Switcher HDMI PROGRAM OUT → จอ HDMI IN", "เปิดเครื่อง เลือก PROGRAM = HDMI 1 และเลือกขาเข้า HDMI ของจอให้ถูกช่อง"],
    devices: ["cam1", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-pgm-out", "monitor:hdmi-in-1"]],
    solutionConfig: [...powerAll(["cam1", "sw", "monitor"]), ...C("sw", { pgm: "HDMI 1" }), ...C("monitor", { source: "HDMI 1" }), ...C("site", { "power-check": true, format: true })],
    cues: [cue("c1", "เตรียมกล้อง … สลับ HDMI 1 ออกอากาศ", "TEACHER CAM")],
    obj: [
      o("front-cam", "จอหน้าห้องแสดงภาพจริงจากกล้อง (PROGRAM)", "signal", "signal", "direction", shows("monitor", "TEACHER CAM", "จอหน้าห้อง"), true),
      o("pgm-in1", "PROGRAM เลือก HDMI 1", "config", "signal", "output-assign", cfgIs("sw", "pgm", "HDMI 1", "กดเลือก HDMI 1 ที่เครื่องสลับภาพ")),
      o("tv-input", "จอเลือกขาเข้า HDMI ที่ต่อสายไว้", "config", "signal", "output-assign", cfgIs("monitor", "source", "HDMI 1", "เลือกขาเข้า HDMI 1 ที่จอ")),
    ],
    preflight: ["power-check", "format"], quiz: quiz("direction"), reward: "ตราเส้นทางภาพแรก",
    passCriteria: ["ภาพจริงจากกล้องปรากฏบนจอหน้าห้องเป็น PROGRAM", "รูปแบบสัญญาณ 1080p50 ตรงกันทั้งเส้นทาง"],
  });
  const L2 = finish(room, {
    id: "XS-02", level: 2, title: "เส้นทางเสียง · Audio Path", subtitle: "ฝึกพร้อมคำแนะนำบางส่วน · ไมค์ไร้สาย → มิกเซอร์ → ลำโพงแอ็กทีฟ", guidance: "partial", minutes: "10–12 นาที",
    ticket: "ให้เสียงผู้สอนจากไมค์หนีบปกดังออกลำโพงหน้าห้องอย่างชัดเจน ไม่หอน",
    callSheet: ["ไมค์หนีบปก + ตัวส่ง TX ที่ผู้สอน", "ตัวรับ RX และมิกเซอร์ที่โต๊ะผู้ควบคุม", "ลำโพงแอ็กทีฟหน้าห้อง"],
    briefing: ["Lav → TX ใช้สายไมค์ 3.5 มม.; TX กับ RX ไม่มีสายเชื่อม ต้องจับคู่คลื่น RF", "RX AUDIO OUT (XLR) → Mixer IN1 แล้วตั้ง Gain/ยกเลิก Mute/ส่งเข้า MAIN", "Mixer MAIN/PA OUT → ลำโพงแอ็กทีฟ LINE IN ด้วยสายสมดุล ค่อย ๆ เพิ่มระดับ"],
    devices: ["lav", "tx", "rx", "mix", "pa"],
    solution: [["lav:out", "tx:mic-in"], ["rx:audio-out", "mix:in-1"], ["mix:main-out", "pa:line-in"]],
    extraCables: cables(["x-hdmi", "HDMI 2 ม. (ไม่ใช้ในด่านนี้)", ["HDMI", "HDMI"], 2]),
    solutionConfig: [...xsWireless, ...xsMixer(false), ...C("pa", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" }), ...C("site", { soundcheck: true, "mic-place": true })],
    cues: [],
    obj: [
      o("paired", "จับคู่ TX ↔ RX ช่องเดียวกัน", "config", "signal", "mute", (c) => c.view.rx?.problem ? { ok: false, reason: c.view.rx.problem.text, fix: c.view.rx.problem.fix } : { ok: true }, true),
      o("meter", "มิเตอร์มิกเซอร์ขยับด้วยเสียงผู้สอน", "signal", "signal", "mute", hears("mix", ["TEACHER VOICE"]), true),
      o("pa", "เสียงผู้สอนออกลำโพงหน้าห้อง ไม่หอน ไม่แตก", "quality", "signal", "feedback", all(hears("pa", ["TEACHER VOICE"]), noFeedback(["pa"])), true),
      o("soundcheck", "ทดสอบพูดระดับจริงแล้ว", "evidence", "rehearsal", "clipping", site("soundcheck", PREFLIGHT.soundcheck)),
    ],
    preflight: ["soundcheck", "mic-place"], quiz: quiz("speaker-level"), reward: "ตราเส้นทางเสียง",
    passCriteria: ["สัญญาณไมค์ทำให้มิเตอร์ขยับ", "ไปถึงลำโพงแอ็กทีฟ ระดับถูกต้อง ไม่หอน"],
  });
  const L3 = finish(room, {
    id: "XS-03", level: 3, title: "สลับสองแหล่งภาพ · Two-Source Switching", subtitle: "สถานการณ์ · สลับกล้องและสไลด์ด้วยเครื่องสลับภาพ", guidance: "scenario", minutes: "10–14 นาที",
    ticket: "ผู้สอนจะเริ่มด้วยภาพตัวเองแล้วไปสไลด์ — สลับด้วยเครื่องสลับภาพ ห้ามสลับด้วยการถอดสาย",
    callSheet: ["กล้อง → HDMI IN1", "โน้ตบุ๊กผู้สอน (โต๊ะหน้าห้อง) → HDMI IN2", "HDMI PROGRAM OUT → จอหน้าห้อง"],
    briefing: ["ใช้สาย HDMI 3 เส้น วางแผนเองว่าเส้นไหนไปไหน"],
    devices: ["cam1", "slides", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["sw:hdmi-pgm-out", "monitor:hdmi-in-1"]],
    extraCables: cables(["x-usb", "USB-A ↔ USB-A (ไม่ใช่สายภาพ)", ["USB-A", "USB-A"], 2]),
    solutionConfig: [...powerAll(["cam1", "slides", "sw", "monitor"]), ...C("slides", { present: true }), ...C("monitor", { source: "HDMI 1" }), ...C("sw", { pgm: "HDMI 1" }), ...C("site", { "cable-route": true })],
    cues: [cue("c1", "ผู้สอนทักทาย … CAM 1", "TEACHER CAM"), cue("c2", "เข้าสไลด์ … LAPTOP 2", "SLIDES")],
    obj: [
      o("in1", "HDMI IN1 = กล้อง", "signal", "signal", "direction", inputCarries("sw:hdmi-in-1", "TEACHER CAM"), true),
      o("in2", "HDMI IN2 = โน้ตบุ๊ก", "signal", "signal", "direction", inputCarries("sw:hdmi-in-2", "SLIDES"), true),
      o("front", "จอหน้าห้องแสดง PROGRAM ปัจจุบัน", "signal", "signal", "one-output", mirrorsProgram("monitor", "sw"), true),
      o("both", "ทั้งสองแหล่งภาพถูกเลือกออกอากาศได้จริง", "evidence", "rehearsal", "output-assign", historyHas(["TEACHER CAM", "SLIDES"])),
    ],
    preflight: ["cable-route"], quiz: quiz("output-assign"), reward: "ตราสลับภาพ",
    passCriteria: ["สองแหล่งภาพเลือกเป็น PROGRAM ได้ด้วยเครื่องสลับภาพ", "จอหน้าห้องแสดงภาพที่เลือก"],
  });
  const xs4Pairs: [string, string][] = [["cam1:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-pgm-out", "monitor:hdmi-in-1"], ["lav:out", "tx:mic-in"], ["rx:audio-out", "mix:in-1"], ["mix:aux-out", "sw:audio-in"], ["sw:usb", "host:usb-1"]];
  const xsWorking = [...powerAll(["cam1", "sw", "monitor", "host"]), ...xsWireless, ...xsMixer(true), ...C("sw", { pgm: "HDMI 1", "ain-on": true, "emb-audio": "OFF" }), ...C("monitor", { source: "HDMI 1" }),
    ...C("host", { "video-src": "USB video capture device", "audio-src": "USB capture embedded audio" })];
  const L4 = finish(room, {
    id: "XS-04", level: 4, title: "ซ่อมพอร์ตและการจับภาพ · Port and Capture Repair", subtitle: "แก้ปัญหา · ห้องเรียนออนไลน์ใช้งานไม่ได้", guidance: "disruption", minutes: "12–16 นาที",
    ticket: "คาบเรียนออนไลน์กำลังจะเริ่ม แต่ OBS ไม่มีภาพและเสียง และจอหน้าห้องผิด — หาจุดเสียแล้วซ่อมทางกายภาพ",
    callSheet: ["ระบบต่อไว้แล้วแต่มีจุดผิด", "USB WEBCAM (DEVICE) ต้องเข้าพอร์ต HOST ของโน้ตบุ๊ก", "เสียงสตรีมต้องมาจากบัส STREAM/AUX ไม่ใช่ MAIN"],
    briefing: ["ใช้ Trace ไล่จาก OBS และจอหน้าห้องย้อนกลับ อย่าเสียบสายเดา"],
    devices: ["cam1", "lav", "tx", "rx", "mix", "sw", "host", "monitor"],
    solution: xs4Pairs, prewired: "all",
    extraCables: cables(["x-xlr", "XLR 3 ม. (สำรอง)", ["XLR-F", "XLR-M"], 3], ["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2], ["x-usb", "USB-A ↔ USB-A (ไม่ใช่สายเว็บแคม)", ["USB-A", "USB-A"], 2]),
    startConfig: xsWorking,
    faults: [
      { id: "f-input", label: "กล้องถูกเสียบเข้า HDMI IN2 แทน IN1", concept: "output-assign", order: 1, repatch: { pair: ["cam1:hdmi-out", "sw:hdmi-in-1"], to: "sw:hdmi-in-2" }, cleared: (c) => c.edges.some((e) => e.from === "cam1:hdmi-out" && e.to === "sw:hdmi-in-1") },
      cfgFault("f-pair", "ตัวรับไม่ได้จับคู่กับตัวส่ง", "mute", "rx", "pair", "Not paired", 1),
      cfgFault("f-aux", "เสียงผู้สอนส่งเข้า MAIN เท่านั้น ไม่ได้ส่งเข้า STREAM/AUX", "group-bus", "mix", "ch1-aux", false, 2),
      unplugFault("f-usb", "สาย USB เว็บแคมหลุด", "usb-role", ["sw:usb", "host:usb-1"], 3),
    ],
    solutionConfig: [...C("rx", { pair: "Paired" }), ...C("mix", { "ch1-aux": true }), ...C("site", { soundcheck: true })],
    cues: [cue("c1", "เริ่มคาบ … CAM 1", "TEACHER CAM")],
    obj: [
      o("front", "จอหน้าห้องแสดงภาพกล้อง", "signal", "signal", "output-assign", shows("monitor", "TEACHER CAM"), true),
      o("obs-video", "OBS รับเว็บแคมเป็นภาพ PROGRAM", "signal", "signal", "usb-role", obsHasProgram, true),
      o("obs-audio", "OBS ได้ยินเสียงผู้สอนเพียงทางเดียว", "quality", "signal", "group-bus", obsAudioExact, true),
      o("recovered", "ตรวจหาและซ่อมจุดเสียครบ", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["soundcheck"], quiz: quiz("usb-role"), reward: "ตราช่างซ่อมพอร์ต",
    passCriteria: ["ซ่อมเส้นทางที่ผิดทางกายภาพ", "จอหน้าห้องแสดงภาพ", "OBS มีทั้งภาพและเสียง"],
  });
  const L5 = finish(room, {
    id: "XS-05", level: 5, title: "ห้องเรียนไฮบริดครบระบบ · Full Hybrid Classroom", subtitle: "ภาคปฏิบัติ · ประกอบและใช้งานห้องเรียนไฮบริดเอง", guidance: "certification", minutes: "20–25 นาที",
    ticket: "จัดห้องเรียนไฮบริดครบระบบ: กล้องและสไลด์ขึ้นจอหน้าห้องและ OBS, เสียงผู้สอนออกลำโพงในห้อง และส่งเข้าสตรีมแยกบัส โดยเสียงใน OBS ไม่ซ้อน",
    callSheet: ["อุปกรณ์ทั้งหมดอยู่ในตู้เก็บ", "ลำดับรายการ: ผู้สอน → สไลด์ → ผู้สอน"],
    briefing: ["ไม่มีคำใบ้ วางแผนการต่อสายเอง หลังซ้อมจะมีปัญหาที่ไม่คาดคิดเกิดขึ้นหนึ่งอย่าง"],
    devices: ["cam1", "slides", "lav", "tx", "rx", "mix", "sw", "monitor", "pa", "host"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["sw:hdmi-pgm-out", "monitor:hdmi-in-1"], ["sw:usb", "host:usb-1"],
      ["lav:out", "tx:mic-in"], ["rx:audio-out", "mix:in-1"], ["mix:main-out", "pa:line-in"], ["mix:aux-out", "sw:audio-in"]],
    extraCables: cables(["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2], ["x-usb", "USB-A ↔ USB-A (ไม่ใช่สายเว็บแคม)", ["USB-A", "USB-A"], 2], ["x-xlr", "XLR 3 ม. (สำรอง)", ["XLR-F", "XLR-M"], 3]),
    solutionConfig: [...powerAll(["cam1", "slides", "sw", "monitor", "host"]), ...xsWireless, ...xsMixer(true), ...C("slides", { present: true, "mute-audio": true }),
      ...C("sw", { pgm: "HDMI 1", "ain-on": true, "emb-audio": "OFF" }), ...C("monitor", { source: "HDMI 1" }), ...C("pa", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" }),
      ...C("host", { "video-src": "USB video capture device", "audio-src": "USB capture embedded audio" }),
      ...C("site", { "power-check": true, "cable-route": true, soundcheck: true, "mic-place": true })],
    surpriseFaults: [
      cfgFault("s-rf", "ตัวรับเปลี่ยนช่องความถี่ RF", "mute", "rx", "rf", "CH 2", 1),
      cfgFault("s-mute", "ช่องไมค์ในมิกเซอร์ถูก Mute", "mute", "mix", "ch1-on", false, 1),
      cfgFault("s-ain", "ปิด AUDIO IN ที่เครื่องสลับภาพ", "embedded-audio", "sw", "ain-on", false, 2),
      unplugFault("s-usb", "สาย USB เว็บแคมหลุด", "usb-role", ["sw:usb", "host:usb-1"], 3),
    ],
    cues: [cue("c1", "เปิดคาบ … ผู้สอน", "TEACHER CAM"), cue("c2", "สไลด์", "SLIDES"), cue("c3", "ถามตอบ … ผู้สอน", "TEACHER CAM")],
    obj: [
      o("front", "เปลี่ยนแหล่งภาพแล้วจอหน้าห้องเปลี่ยนตาม", "signal", "signal", "one-output", mirrorsProgram("monitor", "sw"), true),
      o("obs-video", "เปลี่ยนแหล่งภาพแล้ว OBS เปลี่ยนตาม", "signal", "signal", "usb-role", obsHasProgram, true),
      o("room", "เสียงในห้องทำงาน ไม่หอน ไม่แตก", "quality", "signal", "feedback", all(hears("pa", ["TEACHER VOICE"]), noFeedback(["pa"])), true),
      o("obs-audio", "OBS มีเสียงรายการตามที่ตั้งใจเท่านั้น (ไม่ซ้อน)", "quality", "signal", "afv-doubling", obsAudioExact, true),
      o("angles", "ใช้ทั้งภาพผู้สอนและสไลด์ในรายการ", "evidence", "rehearsal", "output-assign", historyHas(["TEACHER CAM", "SLIDES"])),
      o("recovered", "แก้ปัญหาที่เกิดระหว่างงานได้", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["power-check", "cable-route", "soundcheck", "mic-place"], quiz: quiz("group-bus"), reward: "ตราเจ้าแห่งประตูแรกแห่งภาพ",
    passCriteria: ["เปลี่ยนแหล่งภาพแล้วเห็นทั้งจอหน้าห้องและ OBS", "เสียงในห้องทำงาน", "OBS มีเสียงรายการที่ตั้งใจเท่านั้น ไม่ซ้อน"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 02 · STUDIO (S) — EduStream 25-level wiring guide ══════════════════════════
 * Generic HDS7105-style switcher (VIDEO IN1–4, simultaneous MULTIVIEW + PGM HDMI, stereo LINE AUDIO IN), wireless lavs with
 * one RX channel per TX, generic mixer (MAIN → HS5 monitor, STREAM/AUX → Broadcast), Magewell capture → OBS notebook. */
const sCams = (ids: string[]) => ids.flatMap((d) => C(d, { power: true, framing: "Framed for assignment", clean: true }));
const sWireless = (n: number[]) => n.flatMap((k) => [...C(`tx${k}`, { power: true }), ...C(`rx${k}`, { power: true, rf: "CH 1", pair: "Paired" })]);
const sMixer = (chs: number[], monitor: boolean, broadcast: boolean) => [...C("mix", { power: true, ...(monitor ? { "main-fader": "Unity" } : {}), ...(broadcast ? { "aux-master": "Unity" } : {}) }),
  ...chs.flatMap((n) => C("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, ...(monitor ? { [`ch${n}-main`]: true } : {}), ...(broadcast ? { [`ch${n}-aux`]: true } : {}) }))];
const obsProgramS = (c: EvalContext) => {
  const v = c.view.host, pgm = c.view.sw?.picture;
  if (!v?.picture) return { ok: false, reason: v?.problem?.text ?? "OBS ยังไม่มีภาพ", fix: "PGM OUT → Magewell HDMI IN → USB 3.0 → USB HOST แล้วเลือก Video Capture Device" };
  return v.picture === pgm ? { ok: true } : { ok: false, reason: `OBS แสดง ${v.picture} แต่ PGM คือ ${pgm}`, fix: "Capture ต้องรับจาก PGM OUT ไม่ใช่ MULTIVIEW" };
};
const obsVoicesS = (voices: string[]) => (c: EvalContext) => {
  const a = c.view.host?.audio ?? [];
  const miss = voices.filter((x) => !a.includes(x));
  if (miss.length) return { ok: false, reason: `เสียงใน OBS ขาด: ${miss.join(", ")} (ได้ยิน: ${a.join(" + ") || "เงียบ"})`, fix: "ส่งทุกไมค์เข้าบัส Broadcast (STREAM/AUX) → AUDIO IN และเปิดเข้ารายการ" };
  const extra = a.filter((x) => !voices.includes(x));
  return extra.length ? { ok: false, reason: `เสียงซ้อน/เกิน: ${extra.join(" + ")}`, fix: "ปิดเสียงที่มากับ HDMI ของกล้อง และไมค์คอมพิวเตอร์เพิ่ม" } : { ok: true };
};

function studio(): StageManifest[] {
  CURRENT_ROOM = "s";
  const room = "s" as const;
  const L1 = finish(room, {
    id: "ST-01", level: 1, title: "ภาพสตูดิโอ · Studio Video", subtitle: "ฝึกพร้อมคำแนะนำ · CAM1 → เครื่องสลับภาพ → ทีวีรวมภาพ", guidance: "guided", minutes: "8–10 นาที",
    ticket: "ให้ภาพ CAM1 ขึ้นเป็นช่องหนึ่งในจอรวมภาพ (Multiview) ของห้องควบคุม",
    callSheet: ["CAM1 หันหาโต๊ะผู้นำเสนอ", "เครื่องสลับภาพที่โต๊ะผลิต", "ทีวีรวมภาพบนขาตั้ง"],
    briefing: ["HDMI เส้นที่ 1: CAM1 HDMI OUT → Switcher VIDEO IN 1", "HDMI เส้นที่ 2: Switcher MULTIVIEW OUT → ทีวี HDMI IN", "Preview = ภาพถัดไป, PGM = ภาพออกอากาศ, Multiview = ภาพรวมสำหรับดูตรวจ"],
    devices: ["cam1", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-mv-out", "monitor:hdmi-in"]],
    solutionConfig: [...sCams(["cam1"]), ...C("sw", { power: true }), ...C("monitor", { power: true }), ...C("site", { "power-check": true, format: true })],
    cues: [],
    obj: [
      o("mv-cam1", "ช่อง CAM1 ปรากฏในจอรวมภาพ", "signal", "signal", "output-assign", showsAll("monitor", ["MULTIVIEW", "CAM1"]), true),
      o("in1", "VIDEO IN 1 รับ CAM1", "signal", "signal", "direction", inputCarries("sw:hdmi-in-1", "CAM1"), true),
    ],
    preflight: ["power-check", "format"], quiz: quiz("output-assign"), reward: "ตราภาพสตูดิโอ",
    passCriteria: ["ช่อง CAM1 ปรากฏใน Multiview ที่ถูกต้อง"],
  });
  const L2 = finish(room, {
    id: "ST-02", level: 2, title: "เสียงหลายไมค์ · Multi-Microphone Audio", subtitle: "ฝึกพร้อมคำแนะนำบางส่วน · ไมค์ไร้สาย 2 ตัว แยกช่อง แยกบัส", guidance: "partial", minutes: "12–15 นาที",
    ticket: "พิธีกรและแขกรับเชิญต้องปรับเสียงได้แยกกัน ส่งเข้า Broadcast และฟังตรวจที่ลำโพงมอนิเตอร์",
    callSheet: ["Lav 1/2 → TX 1/2 ที่โต๊ะผู้นำเสนอ", "RX 1/2 → มิกเซอร์ IN1/IN2", "Broadcast → เครื่องสลับภาพ · Monitor → HS5"],
    briefing: ["จับคู่ TX แต่ละตัวกับ RX ของตัวเอง ห้ามรวมไมค์สองตัวด้วยสาย Y", "บัส STREAM/AUX ใช้เป็น Broadcast, บัส MAIN ใช้ป้อน HS5"],
    devices: ["lav1", "lav2", "tx1", "tx2", "rx1", "rx2", "mix", "sw", "speaker"],
    solution: [["lav1:out", "tx1:mic-in"], ["lav2:out", "tx2:mic-in"], ["rx1:audio-out", "mix:in-1"], ["rx2:audio-out", "mix:in-2"], ["mix:aux-out", "sw:audio-in"], ["mix:main-out", "speaker:xlr-in"]],
    solutionConfig: [...sWireless([1, 2]), ...C("tx2", { rf: "CH 2" }), ...C("rx2", { rf: "CH 2" }), ...sMixer([1, 2], true, true), ...C("sw", { power: true, "ain-on": true, "emb-audio": "OFF" }), ...C("speaker", { power: true }), ...C("site", { soundcheck: true, "mic-place": true })],
    cues: [],
    obj: [
      o("separate", "ไมค์สองตัวเข้าช่องแยกกัน", "config", "physical", "connector", all(edge("rx1:audio-out", "mix:in-1"), edge("rx2:audio-out", "mix:in-2"))),
      o("broadcast", "บัส Broadcast มีเสียงทั้งสองไมค์ที่เครื่องสลับภาพ", "signal", "signal", "group-bus", hears("sw", ["HOST VOICE", "GUEST VOICE"]), true),
      o("monitor", "ลำโพง HS5 ได้ยินทั้งสองไมค์", "signal", "signal", "speaker-level", hears("speaker", ["HOST VOICE", "GUEST VOICE"]), true),
      o("soundcheck", "ตรวจเสียงทีละไมค์แล้ว", "evidence", "rehearsal", "clipping", site("soundcheck", PREFLIGHT.soundcheck)),
    ],
    preflight: ["soundcheck", "mic-place"], quiz: quiz("mute"), reward: "ตราเสียงคู่ใต้แสงจันทร์",
    passCriteria: ["ระบบรู้จักไมค์ทั้งสองแยกกัน", "ส่งเข้า Broadcast และฟังตรวจได้"],
  });
  const L3 = finish(room, {
    id: "ST-03", level: 3, title: "สลับสามกล้อง · Three-Camera Switch", subtitle: "สถานการณ์ · สามกล้องอิสระ สลับด้วย Preview/PGM", guidance: "scenario", minutes: "12–15 นาที",
    ticket: "ถ่ายสามมุม: โต๊ะผู้นำเสนอ มุมสัมภาษณ์ และฉากเขียว — สลับด้วยเครื่องสลับภาพ ไม่ใช่การย้ายสาย",
    callSheet: ["CAM1 → IN1 · CAM2 → IN2 · CAM3 → IN3", "MULTIVIEW → ทีวี"],
    briefing: ["ใช้ HDMI 4 เส้น วางแผนเอง"],
    devices: ["cam1", "cam2", "cam3", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["cam2:hdmi-out", "sw:hdmi-in-2"], ["cam3:hdmi-out", "sw:hdmi-in-3"], ["sw:hdmi-mv-out", "monitor:hdmi-in"]],
    solutionConfig: [...sCams(["cam1", "cam2", "cam3"]), ...C("sw", { power: true }), ...C("monitor", { power: true }), ...C("site", { "cable-route": true })],
    previewBeforeTake: true,
    cues: [cue("c1", "เปิดรายการ … CAM1", "CAM1"), cue("c2", "สัมภาษณ์ … CAM2", "CAM2"), cue("c3", "ฉากเขียว … CAM3", "CAM3"), cue("c4", "กลับภาพกว้าง … CAM1", "CAM1")],
    obj: [
      o("mv3", "เห็นทั้งสามกล้องในจอรวมภาพ", "signal", "signal", "output-assign", showsAll("monitor", ["CAM1", "CAM2", "CAM3"]), true),
      o("cuts", "การเลือกแหล่งภาพเปลี่ยน PGM จริง", "evidence", "rehearsal", "output-assign", historyHas(["CAM1", "CAM2", "CAM3"])),
    ],
    preflight: ["cable-route"], quiz: quiz("output-assign"), reward: "ตราสภาสามเลนส์",
    passCriteria: ["เห็นภาพทั้งสาม", "การเลือกแหล่งภาพเปลี่ยน PGM ไม่ใช่การย้ายสาย"],
  });
  const s4Pairs: [string, string][] = [["cam1:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-mv-out", "monitor:hdmi-in"], ["sw:hdmi-pgm-out", "capture:hdmi-in"], ["capture:usb", "host:usb-1"],
    ["lav1:out", "tx1:mic-in"], ["rx1:audio-out", "mix:in-1"], ["mix:aux-out", "sw:audio-in"]];
  const L4 = finish(room, {
    id: "ST-04", level: 4, title: "แก้ปัญหาการจับภาพ · Capture Troubleshooting", subtitle: "แก้ปัญหา · OBS ได้ภาพผิดและไม่มีเสียง", guidance: "disruption", minutes: "15–18 นาที",
    ticket: "ผู้ชมออนไลน์เห็นภาพตารางรวมภาพแทนรายการ และไม่ได้ยินเสียง — หาสาเหตุและซ่อมทางกายภาพ",
    callSheet: ["MULTIVIEW ใช้ดูตรวจเท่านั้น PGM ต้องไปที่ Capture", "Capture (DEVICE) → USB HOST ของโน้ตบุ๊ก"],
    briefing: ["ใช้ Trace จาก OBS ย้อนกลับ"],
    devices: ["cam1", "lav1", "tx1", "rx1", "mix", "sw", "monitor", "capture", "host"],
    solution: s4Pairs, prewired: "all",
    extraCables: cables(["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2], ["x-usb", "USB-A ↔ USB-A (ห้ามต่อ HOST ↔ HOST)", ["USB-A", "USB-A"], 2]),
    startConfig: [...sCams(["cam1"]), ...sWireless([1]), ...sMixer([1], false, true), ...C("sw", { power: true, pgm: "HDMI 1", "ain-on": true, "emb-audio": "OFF" }), ...C("monitor", { power: true }),
      ...C("host", { power: true, "video-src": "USB video capture device", "audio-src": "USB capture embedded audio" })],
    faults: [
      { id: "f-roles", label: "สาย Capture ต่อจาก MULTIVIEW OUT แทน PGM OUT", concept: "output-assign", order: 1, repatch: { pair: ["sw:hdmi-pgm-out", "capture:hdmi-in"], from: "sw:hdmi-mv-out" }, cleared: (c) => c.edges.some((e) => e.from === "sw:hdmi-pgm-out" && e.to === "capture:hdmi-in") },
      cfgFault("f-bus", "เสียงไมค์ไม่ได้ส่งเข้าบัส Broadcast", "group-bus", "mix", "ch1-aux", false, 2),
      unplugFault("f-usb", "สาย USB ของ Capture หลุด", "usb-role", ["capture:usb", "host:usb-1"], 3),
      cfgFault("f-obs", "OBS ไม่ได้เลือก Video Capture Device", "obs-source", "host", "video-src", "None", 4),
    ],
    solutionConfig: [...C("mix", { "ch1-aux": true }), ...C("host", { "video-src": "USB video capture device" }), ...C("site", { soundcheck: true })],
    cues: [],
    obj: [
      o("mv", "MULTIVIEW ไปที่ทีวีเพื่อดูตรวจ", "signal", "signal", "output-assign", showsAll("monitor", ["MULTIVIEW", "CAM1"]), true),
      o("obs-video", "OBS ได้ภาพ PGM ผ่าน Capture", "signal", "signal", "usb-role", obsProgramS, true),
      o("obs-audio", "OBS มีเสียงรายการที่ฝังใน PGM", "quality", "signal", "embedded-audio", obsVoicesS(["HOST VOICE"]), true),
      o("recovered", "ตรวจหาและซ่อมจุดเสียครบ", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["soundcheck"], quiz: quiz("output-assign"), reward: "ตราผู้กู้สัญญาณจับภาพ",
    passCriteria: ["MV ใช้ดูตรวจ PGM ป้อน Capture", "USB จาก Capture เข้า HOST", "OBS มีภาพและเสียงรายการ"],
  });
  const L5 = finish(room, {
    id: "ST-05", level: 5, title: "สตูดิโอครบระบบ · Full Studio", subtitle: "ภาคปฏิบัติ · สามกล้อง สามไมค์ ฟังตรวจ และจับภาพเข้า OBS", guidance: "certification", minutes: "25–30 นาที",
    ticket: "ประกอบสตูดิโอครบระบบ: สามกล้องสลับได้, ไมค์ไร้สาย 2 ตัวและไมค์สาย 1 ตัวแยกช่อง, Broadcast ฝังเข้า PGM, ฟังตรวจที่ HS5, จับภาพ PGM เข้า OBS",
    callSheet: ["อุปกรณ์พกพาอยู่ในชั้นเก็บ", "ลำดับรายการ: CAM1 → CAM2 → CAM3 → CAM1"],
    briefing: ["ไม่มีคำใบ้ หลังซ้อมจะมีปัญหาเกิดขึ้นหนึ่งอย่าง"],
    devices: ["cam1", "cam2", "cam3", "sw", "monitor", "lav1", "lav2", "tx1", "tx2", "rx1", "rx2", "mic", "mix", "speaker", "capture", "host"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["cam2:hdmi-out", "sw:hdmi-in-2"], ["cam3:hdmi-out", "sw:hdmi-in-3"], ["sw:hdmi-mv-out", "monitor:hdmi-in"], ["sw:hdmi-pgm-out", "capture:hdmi-in"], ["capture:usb", "host:usb-1"],
      ["lav1:out", "tx1:mic-in"], ["lav2:out", "tx2:mic-in"], ["rx1:audio-out", "mix:in-1"], ["rx2:audio-out", "mix:in-2"], ["mic:xlr-out", "mix:in-3"], ["mix:aux-out", "sw:audio-in"], ["mix:main-out", "speaker:xlr-in"]],
    extraCables: cables(["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2], ["x-usb", "USB-A ↔ USB-A (ห้ามต่อ HOST ↔ HOST)", ["USB-A", "USB-A"], 2], ["x-xlr", "XLR 5 ม. (สำรอง)", ["XLR-F", "XLR-M"], 5]),
    solutionConfig: [...sCams(["cam1", "cam2", "cam3"]), ...sWireless([1, 2]), ...C("tx2", { rf: "CH 2" }), ...C("rx2", { rf: "CH 2" }), ...sMixer([1, 2, 3], true, true),
      ...C("sw", { power: true, pgm: "HDMI 1", "ain-on": true, "emb-audio": "OFF" }), ...C("monitor", { power: true }), ...C("speaker", { power: true }),
      ...C("host", { power: true, "video-src": "USB video capture device", "audio-src": "USB capture embedded audio" }),
      ...C("site", { "power-check": true, "cable-route": true, soundcheck: true, "mic-place": true })],
    surpriseFaults: [
      cfgFault("s-pair", "ตัวรับ RX ช่อง 2 หลุดการจับคู่", "mute", "rx2", "pair", "Not paired", 1),
      cfgFault("s-mute", "ช่องไมค์สายถูก Mute", "mute", "mix", "ch3-on", false, 1),
      unplugFault("s-usb", "สาย USB ของ Capture หลุด", "usb-role", ["capture:usb", "host:usb-1"], 3),
      cfgFault("s-ain", "ปิด AUDIO IN ที่เครื่องสลับภาพ", "embedded-audio", "sw", "ain-on", false, 2),
    ],
    previewBeforeTake: true,
    cues: [cue("c1", "เปิดรายการ … CAM1", "CAM1"), cue("c2", "สัมภาษณ์ … CAM2", "CAM2"), cue("c3", "ฉากเขียว … CAM3", "CAM3"), cue("c4", "ปิดรายการ … CAM1", "CAM1")],
    obj: [
      o("mv3", "สามกล้องอยู่ในจอรวมภาพ", "signal", "signal", "output-assign", showsAll("monitor", ["CAM1", "CAM2", "CAM3"]), true),
      o("obs-video", "OBS ได้ภาพ PGM ผ่าน Capture", "signal", "signal", "usb-role", obsProgramS, true),
      o("obs-audio", "OBS มีเสียงทั้งสามไมค์ที่ฝังใน PGM (ไม่ซ้อน)", "quality", "signal", "embedded-audio", obsVoicesS(["HOST VOICE", "GUEST VOICE", "PRESENTER VOICE"]), true),
      o("monitor", "ฟังตรวจที่ HS5 ได้", "signal", "signal", "speaker-level", hears("speaker", ["HOST VOICE", "GUEST VOICE", "PRESENTER VOICE"]), true),
      o("cuts", "ใช้ครบสามมุมกล้องในรายการ", "evidence", "rehearsal", "output-assign", historyHas(["CAM1", "CAM2", "CAM3"])),
      o("recovered", "แก้ปัญหาที่เกิดระหว่างงานได้", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["power-check", "cable-route", "soundcheck", "mic-place"], quiz: quiz("embedded-audio"), reward: "ใบอนุญาตถ่ายทอดสะพานจันทรา",
    passCriteria: ["เลือก PGM ได้ครบสามกล้อง", "ฟังตรวจได้", "เสียงฝังใน Capture ถูกต้อง", "OBS มีภาพและมิเตอร์เสียง"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 03 · AUDITORIUM (M) — EduStream 25-level wiring guide ══════════════════════════
 * Generic 1080p50 3G-SDI switcher (SDI IN1–6, REF IN, SDI OUT1–3 assignable PGM/AUX, MV SDI, AUDIO IN L/R XLR), SDI cameras + PTZ,
 * Blackmagic direction-specific Micro Converters, analog stagebox + multicore + FOH tail, FOH mixer with separate PA and Broadcast L/R. */
const mCams = (ids: string[]) => ids.flatMap((d) => C(d, { power: true, framing: "Framed for assignment" }));
const mFoh = (chs: number[], pa: boolean, bc: boolean) => [...C("mix", { power: true, ...(pa ? { "pa-fader": "Unity" } : {}), ...(bc ? { "bc-fader": "Unity" } : {}) }),
  ...chs.flatMap((n) => C("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, ...(pa ? { [`ch${n}-pa`]: true } : {}), ...(bc ? { [`ch${n}-bc`]: true } : {}) }))];
const mPa = [...C("paL", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" }), ...C("paR", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" })];
const mVideo3: [string, string][] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ["ptz:sdi-out", "sw:sdi-in-4"],
  ["slides:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "sw:sdi-in-5"], ["sw:mv-out", "monitor:sdi-in"], ["sw:sdi-out-1", "convSH:sdi-in"], ["convSH:hdmi-out", "display:hdmi-in"]];
const mVideoCfg = [...mCams(["cam1", "cam2", "cam3", "ptz"]), ...C("slides", { power: true, present: true, "mute-audio": true }), ...C("convHS", { power: true }), ...C("convSH", { power: true }),
  ...C("sw", { power: true, "sdi-out-1": "AUX", aux: "PROGRAM", pgm: "SDI 1" }), ...C("monitor", { power: true }), ...C("display", { power: true })];

function auditorium(): StageManifest[] {
  CURRENT_ROOM = "m";
  const room = "m" as const;
  const L1 = finish(room, {
    id: "AU-01", level: 1, title: "กล้องหลักสู่จอเวที · Main Camera to Stage Display", subtitle: "ฝึกพร้อมคำแนะนำ · SDI → เครื่องสลับภาพ → ตัวแปลง SDI→HDMI → จอเวที", guidance: "guided", minutes: "10–12 นาที",
    ticket: "นำภาพกล้องกลางหลังห้องขึ้นจอเวที",
    callSheet: ["กล้อง 1 กลางหลังห้อง", "เครื่องสลับภาพที่ FOH", "ตัวแปลง SDI→HDMI ข้างเวทีขวา → จอเวที"],
    briefing: ["SDI เส้นที่ 1: กล้อง SDI OUT → Switcher SDI IN 1", "SDI เส้นที่ 2: Switcher SDI OUT 1 (ตั้งเป็น AUX/PGM) → Converter SDI IN", "HDMI: Converter HDMI OUT → จอเวที HDMI IN — ตัวแปลงต้องมีไฟเลี้ยงและหันทิศถูก"],
    devices: ["cam1", "sw", "convSH", "display"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["sw:sdi-out-1", "convSH:sdi-in"], ["convSH:hdmi-out", "display:hdmi-in"]],
    solutionConfig: [...mCams(["cam1"]), ...C("sw", { power: true, pgm: "SDI 1", "sdi-out-1": "PROGRAM" }), ...C("convSH", { power: true }), ...C("display", { power: true }), ...C("site", { "power-check": true, format: true })],
    cues: [cue("c1", "เปิดงาน … กล้อง 1", "CAM1")],
    obj: [
      o("stage", "จอเวทีแสดงภาพกล้อง", "signal", "signal", "converter-direction", shows("display", "CAM1", "จอเวที"), true),
      o("conv", "ตัวแปลง SDI→HDMI มีไฟเลี้ยง", "config", "signal", "power", cfgIs("convSH", "power", true, "เปิดไฟเลี้ยงตัวแปลง (USB-C power)")),
      o("out", "SDI OUT 1 กำหนดหน้าที่แล้ว", "config", "signal", "output-assign", (c) => c.cfg("sw", "sdi-out-1") === "OFF" ? { ok: false, reason: "SDI OUT 1 ยังปิดอยู่", fix: "ตั้ง SDI OUT 1 เป็น PROGRAM หรือ AUX" } : { ok: true }),
    ],
    preflight: ["power-check", "format"], quiz: quiz("converter-direction"), reward: "ตราแสงแรกบนเวที",
    passCriteria: ["ตัวแปลงมีไฟ รูปแบบถูก เลือกแหล่งภาพถูก และจอเวทีเลือกขาเข้าถูก", "ภาพกล้องปรากฏบนจอเวที"],
  });
  const L2 = finish(room, {
    id: "AU-02", level: 2, title: "เสียงโพเดียม PA และถ่ายทอด · Podium / PA / Broadcast Audio", subtitle: "ฝึกพร้อมคำแนะนำบางส่วน · Stagebox → มัลติคอร์ → FOH แยกบัส PA/Broadcast", guidance: "partial", minutes: "12–15 นาที",
    ticket: "ให้เสียงโพเดียมดังในห้องและเข้าระบบถ่ายทอดแยกกัน",
    callSheet: ["ไมค์โพเดียม → Stagebox ช่อง 1", "มัลติคอร์ Stagebox → หางสาย FOH", "PA L/R → ลำโพง · Broadcast L/R → เครื่องสลับภาพ"],
    briefing: ["สาย XLR 6 เส้น + มัลติคอร์ 1 เส้น", "บัส PA และ Broadcast แยกกัน ห้ามใช้บัสเดียวกัน"],
    devices: ["podium", "stagebox", "tail", "mix", "paL", "paR", "sw"],
    solution: [["podium:xlr-out", "stagebox:mic-in-1"], ["stagebox:multicore", "tail:multicore"], ["tail:tail-1", "mix:in-1"], ["mix:pa-l", "paL:line-in"], ["mix:pa-r", "paR:line-in"], ["mix:bc-l", "sw:xlr-l"], ["mix:bc-r", "sw:xlr-r"]],
    solutionConfig: [...mFoh([1], true, true), ...mPa, ...C("sw", { power: true, "xlr-on": true }), ...C("site", { soundcheck: true, "mic-place": true })],
    cues: [],
    obj: [
      o("pa", "เสียงโพเดียมออกลำโพงในห้อง ไม่หอน", "signal", "signal", "speaker-level", all(hears("paL", ["PODIUM VOICE"]), hears("paR", ["PODIUM VOICE"]), noFeedback(["paL", "paR"])), true),
      o("bc", "มิเตอร์ขาเข้า Broadcast ที่เครื่องสลับภาพขยับ", "signal", "signal", "group-bus", hears("sw", ["PODIUM VOICE"]), true),
      o("lr", "Broadcast เข้า L และ R ครบ", "config", "physical", "connector", all(edge("mix:bc-l", "sw:xlr-l"), edge("mix:bc-r", "sw:xlr-r"))),
      o("soundcheck", "ตรวจเสียงระดับพูดจริงแล้ว", "evidence", "rehearsal", "clipping", site("soundcheck", PREFLIGHT.soundcheck)),
    ],
    preflight: ["soundcheck", "mic-place"], quiz: quiz("group-bus"), reward: "ตราเสียงแห่งหอประชุม",
    passCriteria: ["พรีแอมป์ไมค์ถูกต้อง บัส PA/Broadcast แยกกัน", "มิเตอร์ทั้งเสียงในห้องและขาเข้า Broadcast ขยับ"],
  });
  const L3 = finish(room, {
    id: "AU-03", level: 3, title: "กล้องและสไลด์ · Cameras and Slides", subtitle: "สถานการณ์ · ห้าแหล่งภาพ จอ FOH และจอเวทีแยกกัน", guidance: "scenario", minutes: "15–20 นาที",
    ticket: "ห้าแหล่งภาพต้องเลือกได้ทั้งหมด จอเวทีต้องแสดงภาพ PGM ที่สะอาด ไม่ใช่ Multiview",
    callSheet: ["กล้อง 1–3 + PTZ → SDI IN 1–4", "โน้ตบุ๊ก → HDMI→SDI → SDI IN 5", "MV → จอ FOH (SDI) · AUX → SDI→HDMI → จอเวที"],
    briefing: ["SDI 7 เส้น HDMI 2 เส้น วางแผนเอง"],
    devices: ["cam1", "cam2", "cam3", "ptz", "slides", "convHS", "sw", "monitor", "convSH", "display"],
    solution: mVideo3,
    solutionConfig: [...mVideoCfg, ...C("site", { "cable-route": true })],
    previewBeforeTake: true,
    cues: [cue("c1", "เปิด … กล้อง 1", "CAM1"), cue("c2", "สไลด์", "SLIDES"), cue("c3", "PTZ เวที", "PTZ"), cue("c4", "กล้อง 2", "CAM2"), cue("c5", "กล้อง 3", "CAM3")],
    obj: [
      o("mv5", "จอ FOH เห็นครบห้าแหล่งภาพ", "signal", "signal", "output-assign", showsAll("monitor", ["CAM1", "CAM2", "CAM3", "PTZ", "SLIDES"]), true),
      o("stage", "จอเวทีแสดง PGM ที่สะอาด ไม่ใช่ Multiview", "signal", "signal", "output-assign", all(mirrorsProgram("display", "sw"), notShows("display", "MULTIVIEW", "จอเวทีแสดง Multiview", "ส่ง AUX/PGM ไปจอเวที ไม่ใช่ MV")), true),
      o("five", "เลือกครบทั้งห้าแหล่งภาพ", "evidence", "rehearsal", "output-assign", historyHas(["CAM1", "CAM2", "CAM3", "PTZ", "SLIDES"])),
    ],
    preflight: ["cable-route"], quiz: quiz("output-assign"), reward: "ตราปริซึมห้าภาพ",
    passCriteria: ["ห้าแหล่งภาพเห็นและเลือกได้", "จอเวทีแสดง PGM ที่กำหนด ไม่ใช่ MV"],
  });
  const m4Pairs: [string, string][] = [...mVideo3, ["podium:xlr-out", "stagebox:mic-in-1"], ["stagebox:multicore", "tail:multicore"], ["tail:tail-1", "mix:in-1"], ["mix:bc-l", "sw:xlr-l"], ["mix:bc-r", "sw:xlr-r"]];
  const L4 = finish(room, {
    id: "AU-04", level: 4, title: "ซ่อมระบบหอประชุม · Auditorium Fault Repair", subtitle: "แก้ปัญหา · ภาพและเสียงหายก่อนเริ่มงาน", guidance: "disruption", minutes: "18–22 นาที",
    ticket: "ก่อนเริ่มงาน 15 นาที: จอเวทีดำ กล้อง 2 หาย และเสียงโพเดียมไม่เข้าระบบถ่ายทอด — คืนบทบาทพอร์ตและสัญญาณให้ถูก",
    callSheet: ["มีสาย SDI/HDMI/XLR สำรองในชุด", "ตรวจทีละจุดด้วย Trace"],
    briefing: ["ไม่มีปุ่มซ่อมทั้งหมด ต้องแก้ที่สาเหตุทีละจุด"],
    devices: ["cam1", "cam2", "cam3", "ptz", "slides", "convHS", "sw", "monitor", "convSH", "display", "podium", "stagebox", "tail", "mix"],
    solution: m4Pairs, prewired: "all",
    extraCables: cables(["x-sdi1", "3G-SDI 10 ม. (สำรอง)", ["SDI", "SDI"], 10, 100], ["x-sdi2", "3G-SDI 10 ม. (สำรอง)", ["SDI", "SDI"], 10, 100], ["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2], ["x-xlr", "XLR 5 ม. (สำรอง)", ["XLR-F", "XLR-M"], 5]),
    startConfig: [...mVideoCfg, ...mFoh([1], false, true), ...C("sw", { "xlr-on": true })],
    faults: [
      { id: "f-ref", label: "กล้อง 2 เสียบเข้า REF IN แทน SDI IN", concept: "connector", order: 1, repatch: { pair: ["cam2:sdi-out", "sw:sdi-in-2"], to: "sw:ref-in" }, cleared: (c) => c.edges.some((e) => e.from === "cam2:sdi-out" && e.to === "sw:sdi-in-2") },
      cfgFault("f-conv", "ตัวแปลง SDI→HDMI ไม่มีไฟเลี้ยง", "power", "convSH", "power", false, 3),
      cfgFault("f-aux", "AUX เลือกแหล่งภาพผิด (กล้อง 3 แทน PROGRAM)", "output-assign", "sw", "aux", "SDI 3", 2),
      cfgFault("f-bus", "ไมค์โพเดียมส่งเข้า PA แทน Broadcast", "group-bus", "mix", "ch1-bc", false, 2),
    ],
    solutionConfig: [...C("convSH", { power: true }), ...C("sw", { aux: "PROGRAM" }), ...C("mix", { "ch1-bc": true }), ...C("site", { soundcheck: true })],
    cues: [cue("c1", "เริ่มงาน … กล้อง 2", "CAM2")],
    obj: [
      o("cam2", "กล้อง 2 กลับเข้า SDI IN ที่ถูกต้อง", "signal", "signal", "connector", inputCarries("sw:sdi-in-2", "CAM2"), true),
      o("stage", "จอเวทีแสดง PGM", "signal", "signal", "output-assign", mirrorsProgram("display", "sw"), true),
      o("bc", "เสียงโพเดียมถึงขาเข้า Broadcast", "signal", "signal", "group-bus", hears("sw", ["PODIUM VOICE"]), true),
      o("recovered", "ตรวจหาและซ่อมจุดเสียครบ", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["soundcheck"], quiz: quiz("connector"), reward: "ตราผู้ซ่อมหอคอย",
    passCriteria: ["คืนบทบาทพอร์ตและสัญญาณถูกต้อง", "ภาพถึงเวทีและเสียงถึงปลายทางที่ตั้งใจ"],
  });
  const L5 = finish(room, {
    id: "AU-05", level: 5, title: "งานเต็มระบบ · Full Event", subtitle: "ภาคปฏิบัติ · กล้อง สไลด์ เวที FOH เสียงห้อง/ถ่ายทอด บันทึก และ OBS", guidance: "certification", minutes: "30–40 นาที",
    ticket: "จัดงานเต็มระบบ: ห้าแหล่งภาพ, จอเวทีจาก AUX, Multiview ที่ FOH, PGM สะอาดไป Capture/OBS และเครื่องบันทึกแยกขาออก, เสียงสามแหล่งผ่าน Stagebox แยก PA และ Broadcast",
    callSheet: ["ลำดับรายการ: สไลด์ → กล้อง 1 → PTZ → กล้อง 2 → กล้อง 3", "สามแหล่งเสียง: โพเดียม ไมค์มือถือ ไมค์ไร้สาย"],
    briefing: ["ไม่มีคำใบ้ หลังซ้อมจะมีปัญหาเกิดขึ้นหนึ่งอย่าง"],
    devices: ["cam1", "cam2", "cam3", "ptz", "slides", "convHS", "sw", "monitor", "convSH", "display", "podium", "hand", "lav", "tx", "rx", "stagebox", "tail", "mix", "paL", "paR", "capture", "host", "rec"],
    solution: [...mVideo3, ["sw:sdi-out-2", "capture:sdi-in"], ["capture:usb", "host:usb-1"], ["sw:sdi-out-3", "rec:sdi-in"],
      ["podium:xlr-out", "stagebox:mic-in-1"], ["hand:xlr-out", "stagebox:mic-in-2"], ["rx:audio-out", "stagebox:mic-in-3"], ["lav:out", "tx:mic-in"], ["stagebox:multicore", "tail:multicore"],
      ["tail:tail-1", "mix:in-1"], ["tail:tail-2", "mix:in-2"], ["tail:tail-3", "mix:in-3"], ["mix:pa-l", "paL:line-in"], ["mix:pa-r", "paR:line-in"], ["mix:bc-l", "sw:xlr-l"], ["mix:bc-r", "sw:xlr-r"]],
    extraCables: cables(["x-sdi", "3G-SDI 10 ม. (สำรอง)", ["SDI", "SDI"], 10, 100], ["x-hdmi", "HDMI 2 ม. (สำรอง)", ["HDMI", "HDMI"], 2]),
    solutionConfig: [...mVideoCfg, ...C("sw", { "sdi-out-2": "PROGRAM", "sdi-out-3": "PROGRAM", "xlr-on": true, "emb-audio": "OFF" }),
      ...C("tx", { power: true }), ...C("rx", { power: true, rf: "CH 1", pair: "Paired" }), ...mFoh([1, 2, 3], true, true), ...mPa,
      ...C("host", { power: true, "video-src": "USB video capture device", "audio-src": "USB capture embedded audio" }), ...C("rec", { power: true, media: "SD card mounted (512 GB free)", record: true }),
      ...C("site", { "power-check": true, "cable-route": true, soundcheck: true, "mic-place": true, storage: true })],
    surpriseFaults: [
      cfgFault("s-mv", "AUX ไปจอเวทีถูกเปลี่ยนเป็นภาพกล้อง 3", "output-assign", "sw", "aux", "SDI 3", 2),
      cfgFault("s-conv", "ตัวแปลงไปจอเวทีไฟดับ", "power", "convSH", "power", false, 3),
      cfgFault("s-bc", "บัส Broadcast ถูกลดลง", "group-bus", "mix", "bc-fader", "Down", 1),
      cfgFault("s-full", "สื่อบันทึกเต็ม", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4),
      unplugFault("s-usb", "สาย USB ของ Capture หลุด", "usb-role", ["capture:usb", "host:usb-1"], 3),
    ],
    previewBeforeTake: true,
    cues: [cue("c1", "เปิดงาน … สไลด์", "SLIDES"), cue("c2", "วิทยากร … กล้อง 1", "CAM1"), cue("c3", "ภาพเวที … PTZ", "PTZ"), cue("c4", "กล้อง 2", "CAM2"), cue("c5", "กล้อง 3", "CAM3")],
    obj: [
      o("mv5", "Multiview FOH เห็นครบห้าแหล่งภาพ", "signal", "signal", "output-assign", showsAll("monitor", ["CAM1", "CAM2", "CAM3", "PTZ", "SLIDES"]), true),
      o("stage", "จอเวทีแสดง PGM ที่สะอาด (จาก AUX)", "signal", "signal", "output-assign", all(mirrorsProgram("display", "sw"), notShows("display", "MULTIVIEW", "จอเวทีแสดง Multiview", "ส่ง AUX ไปจอเวที")), true),
      o("room", "เสียงห้องอิสระ ได้ยินครบสามแหล่ง ไม่หอน", "signal", "signal", "feedback", all(hears("paL", ["PODIUM VOICE", "HANDHELD VOICE", "SPEAKER VOICE"]), noFeedback(["paL", "paR"])), true),
      o("obs", "OBS ได้ PGM พร้อมเสียง Broadcast ฝัง", "signal", "delivery", "embedded-audio", (c) => {
        const v = c.view.host;
        if (v?.picture !== c.view.sw?.picture) return { ok: false, reason: v?.problem?.text ?? "OBS ไม่ได้รับ PGM", fix: "PGM SDI → Capture → USB HOST และเลือกแหล่งใน OBS" };
        return hears("host", ["PODIUM VOICE", "HANDHELD VOICE", "SPEAKER VOICE"])(c);
      }, true),
      o("rec", "เครื่องบันทึกบันทึกจาก PGM ที่ถูกต้อง", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "บันทึกและปิดไฟล์เรียบร้อย")), true),
      o("recovered", "แก้ปัญหาที่เกิดระหว่างงานได้", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["power-check", "cable-route", "soundcheck", "mic-place", "storage"], quiz: quiz("output-assign"), reward: "ผู้อำนวยการงานหอคอยกระจก",
    passCriteria: ["เลือกแหล่งภาพ PGM สะอาด จอเวที และ MV ที่ FOH", "เสียงห้องอิสระ และเสียง Broadcast ฝังใน PGM", "เครื่องบันทึกทำงาน และ OBS พร้อม"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 04 · OUTDOOR (HD8 ISO + Videohub) ══════════════════════════ */
function outdoor(): StageManifest[] {
  CURRENT_ROOM = "l";
  const room = "l" as const;
  const runs = { "cam1|vh": 15, "cam1|sw": 15, "cam1|convSH": 15, "cam2|sw": 25, "cam2|vh": 25, "convHS|lap": 1, "convHS|vh": 30, "convHS|sw": 30, "lap|vh": 30, "mic|mix": 30 };
  const safety = ["shelter", "power-signoff", "ramp"];
  const L1 = finish(room, {
    id: "OUT-01", level: 1, title: "รู้จักพอร์ตศักดิ์สิทธิ์", subtitle: "ฝึกพร้อมคำแนะนำ · หัวต่อและทิศทางตัวแปลง", guidance: "guided", minutes: "10–12 นาที",
    ticket: "ส่งภาพ SDI จากกล้อง A ไปยังจอ HDMI ภาคสนามด้วยตัวแปลงที่ตรงทิศทาง",
    callSheet: ["กล้อง A: จุดภาคสนามตะวันออก", "จอภาคสนาม: โต๊ะในที่กำบัง", "ตัวแปลงอยู่ในกล่องกันสภาพอากาศ"],
    briefing: ["สำรวจหัวต่อ BNC, HDMI, USB-C และ XLR ที่แท่นเรียนรู้ได้โดยไม่คิดคะแนน", "SDI → HDMI ต้องใช้ตัวแปลง SDI-to-HDMI 3G พร้อมไฟเลี้ยง พอร์ต USB-C บนตัวแปลงใช้จ่ายไฟเท่านั้น", "ภาพจะแสดงเมื่อไฟเลี้ยง ทิศทาง และรูปแบบสัญญาณถูกต้องครบ"],
    devices: ["cam1", "convSH", "monitor", "convHS"], decoys: ["convHS"],
    solution: [["cam1:sdi-out", "convSH:sdi-in"], ["convSH:hdmi-out", "monitor:hdmi-in"]],
    runs, extraCables: cables(["x-hdmi", "HDMI 2 ม.", ["HDMI", "HDMI"], 2], ["x-usbc", "USB-C ↔ USB-C สาย", ["USB-C", "USB-C"], 1]),
    startConfig: [...C("cam1", { format: "2160p50" })],
    solutionConfig: [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("convSH", { power: true }), ...C("monitor", { power: true }), ...C("site", { format: true })],
    cues: [],
    obj: [
      o("picture", "จอภาคสนามแสดงกล้อง A ผ่านตัวแปลง SDI→HDMI", "signal", "signal", "converter-direction", all(edge("convSH:hdmi-out", "monitor:hdmi-in"), shows("monitor", "CAM-A")), true),
      o("format", "ตั้งกล้องเป็น HD 1080p50", "config", "signal", "sdi-rate", cfgIs("cam1", "format", "1080p50", "ตั้งกล้อง A เป็น 1080p50")),
      o("conv-power", "ตัวแปลงมีไฟเลี้ยง", "config", "signal", "power", cfgIs("convSH", "power", true, "จ่ายไฟให้ตัวแปลงผ่าน USB-C")),
    ],
    preflight: ["format"], quiz: { q: "ทำไมตัวแปลง HDMI-to-SDI 3G ใช้ส่ง SDI กล้องไปจอ HDMI ไม่ได้?", options: ["ต้องใช้ไฟเพิ่ม", "แปลงได้เฉพาะ HDMI IN → SDI OUT พอร์ต SDI เป็นขาออก", "เป็นอุปกรณ์ 12G"], answer: 1, why: "ตัวแปลงมีทิศทางเฉพาะ" }, reward: "อักขระนักอ่านพอร์ต",
    passCriteria: ["ภาพปรากฏเมื่อไฟเลี้ยง ทิศทาง และรูปแบบถูกต้อง", "อธิบายได้ว่าทำไมตัวแปลงกลับทิศใช้ไม่ได้"],
  });
  const L2 = finish(room, {
    id: "OUT-02", level: 2, title: "ข้ามเส้นทางสาย", subtitle: "คำแนะนำบางส่วน · ระยะสาย SDI และความปลอดภัยทางเดิน", guidance: "partial", minutes: "15–18 นาที",
    ticket: "ส่งภาพจากกล้องภาคสนามสองตัวไปยังจุดควบคุม โดยจัดสายข้ามทางเดินสาธารณะอย่างปลอดภัย",
    callSheet: ["กล้อง A ตะวันออก 15 ม. · กล้อง B ตะวันตก 25 ม.", "HD8 ISO SDI IN 1/2", "ทางเดินสาธารณะข้ามแนวสายกล้อง B"],
    briefing: ["อ่านป้ายม้วนสาย ซึ่งระบุระยะที่ทดสอบผ่านสำหรับสัญญาณ 3G ในระบบจำลอง", "มีสายต่ออยู่ที่กล้อง B แล้ว ตรวจว่าเป็นพอร์ตขาออกหรือไม่", "อนุมัติเริ่มงานเมื่อมีที่กำบังแห้งและรับรองไฟเลี้ยงแล้วเท่านั้น"],
    devices: ["cam1", "cam2", "sw", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["sw:hdmi-mv", "monitor:hdmi-in"]],
    runs, weather: "clear",
    extraCables: cables(["x-weak", "SDI ม้วนสาย 30 ม. · ไม่ผ่านพิกัด (จำลองทดสอบผ่าน 20 ม. ที่ 3G)", ["SDI", "SDI"], 30, 20], ["x-ret", "3G-SDI 30 ม. · ทดสอบแล้ว (สายส่งกลับ)", ["SDI", "SDI"], 30, 100]),
    prewired: [["sw:sdi-out-1", "cam2:sdi-ret", "x-ret"]],
    solutionConfig: [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("cam2", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("sw", { power: true, labels: true }), ...C("monitor", { power: true }), ...C("site", { decision: "GO", shelter: true, "power-signoff": true, ramp: true })],
    cues: [],
    obj: [
      o("two", "จอรวมภาพแสดงสองแหล่งภาพที่แตกต่างกัน", "signal", "signal", "cable-run", all(showsAll("monitor", ["CAM-A", "CAM-B"]), noCableProblems()), true),
      o("go", "ตรวจรับความปลอดภัยและอนุมัติเริ่มงานแล้ว", "safety", "physical", "safety", (c) => c.sim.config.site?.decision === "GO" ? { ok: true } : { ok: false, reason: "ยังไม่บันทึกการอนุมัติเริ่มงาน", fix: "ตรวจอากาศ ที่กำบัง และไฟเลี้ยงครบก่อนตัดสินใจเริ่มงาน" }, true),
      o("modes", "ตรวจโหมดกล้องเป็น 1080p50 แล้ว", "config", "signal", "sdi-rate", all(cfgIs("cam1", "format", "1080p50", "1080p50."), cfgIs("cam2", "format", "1080p50", "1080p50."))),
    ],
    preflight: safety, quiz: quiz("cable-run"), reward: "ตราผู้ดูแลทางเดิน",
    passCriteria: ["แหล่งภาพสองแหล่งต่างกัน", "เดินสายปลอดภัยพร้อมรางครอบข้ามทางเดิน", "รับรองรายการตรวจแล้ว ระบบที่ไม่ปลอดภัยจะไม่ผ่าน"],
  });
  const L3pairs: Pair[] = [["lap:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "vh:in-1"], ["cam1:sdi-out", "vh:in-2"], ["vh:out-1", "sw:sdi-in-3"], ["vh:out-2", "sw:sdi-in-1"], ["sw:hdmi-mv", "monitor:hdmi-in"]];
  const L3 = finish(room, {
    id: "OUT-03", level: 3, title: "อ่านตราเราเตอร์", subtitle: "สถานการณ์ฝึก · ตัวแปลงและการเลือกเส้นทาง Videohub", guidance: "scenario", minutes: "18–22 นาที",
    ticket: "ส่งภาพโน้ตบุ๊กและกล้อง A ผ่าน Videohub โดยกำหนด OUT 1 ← IN 1 ไป SDI IN 3 และ OUT 2 ← IN 2 ไป SDI IN 1",
    callSheet: ["ตัวแปลง HDMI→SDI อยู่ที่โพเดียมข้างโน้ตบุ๊ก", "Videohub อยู่ในตู้แห้ง"],
    briefing: ["การเสียบ BNC อย่างเดียวไม่ยืนยันภาพ ต้องตรวจการเลือกเส้นทางด้วย"],
    devices: ["lap", "convHS", "cam1", "vh", "sw", "monitor"],
    solution: L3pairs, runs,
    solutionConfig: [...C("lap", { power: true, present: true }), ...C("convHS", { power: true }), ...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("vh", { power: true, "xp-1": "IN 1", "xp-2": "IN 2" }), ...C("sw", { power: true, labels: true }), ...C("monitor", { power: true }), ...C("site", { ramp: true, "cable-route": true })],
    cues: [],
    obj: [
      o("in3", "SDI IN 3 รับสไลด์โน้ตบุ๊ก", "signal", "signal", "router-crosspoint", inputCarries("sw:sdi-in-3", "FIELD SLIDES"), true),
      o("in1", "SDI IN 1 รับกล้อง A", "signal", "signal", "router-crosspoint", inputCarries("sw:sdi-in-1", "CAM-A"), true),
      o("mv", "จอรวมภาพแสดงทั้งสองแหล่งแยกกัน", "signal", "signal", "router-crosspoint", showsAll("monitor", ["FIELD SLIDES", "CAM-A"])),
      o("labels", "กำหนดชื่อถูกต้อง", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "ตั้งชื่อช่องขาเข้า")),
      o("runs", "สายทุกเส้นอยู่ในระยะที่รองรับ", "safety", "signal", "cable-run", noCableProblems()),
    ],
    preflight: ["ramp", "cable-route"], quiz: quiz("router-crosspoint"), reward: "กุญแจตราเราเตอร์",
    passCriteria: ["แสดงสไลด์และกล้อง A แยกกัน พร้อมชื่อถูกต้อง", "เส้นทางต่อสายปลอดภัย"],
  });
  const L4pairs: Pair[] = [["cam1:sdi-out", "vh:in-1"], ["cam2:sdi-out", "vh:in-2"], ["lap:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "vh:in-3"], ["vh:out-1", "sw:sdi-in-1"], ["vh:out-2", "sw:sdi-in-2"], ["vh:out-3", "sw:sdi-in-3"],
    ["mic:xlr-out", "mix:mic-1"], ["mix:st-l", "sw:xlr-1"], ["mix:st-r", "sw:xlr-2"], ["sw:hdmi-mv", "monitor:hdmi-in"], ["sw:sdi-out-1", "convSH:sdi-in"], ["convSH:hdmi-out", "pgm:hdmi-in"], ["sw:usb", "ssd:usb"], ["sw:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]];
  const working = [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("cam2", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("lap", { power: true, present: true, "mute-audio": true }), ...C("convHS", { power: true }),
    ...C("vh", { power: true, "xp-1": "IN 1", "xp-2": "IN 2", "xp-3": "IN 3" }), ...C("mic", { windscreen: true, aim: "At talker's mouth" }), ...C("mix", { power: true, "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch1-hpf": true, "st-fader": "Unity" }),
    ...C("sw", { power: true, labels: true, "xlr-on": true, "emb-audio": "OFF", "sdi-out-1": "PROGRAM", pgm: "SDI 1", "stream-key": "•••••••• (private test key)" }), ...C("monitor", { power: true }), ...C("convSH", { power: true }), ...C("pgm", { power: true }), ...C("ssd", { state: "Mounted · 412 GB free" }), ...C("net", { power: true })];
  const L4 = finish(room, {
    id: "OUT-04", level: 4, title: "สายไกลที่ขัดข้อง", subtitle: "แก้เหตุขัดข้อง · วินิจฉัยระบบและการส่งสัญญาณ", guidance: "disruption", minutes: "22–27 นาที",
    ticket: "กู้ระบบถ่ายทอดเคลื่อนที่ตามลำดับ: ความปลอดภัย → ต้นทาง → การต่อสาย → จอ → การบันทึก → อินเทอร์เน็ต → จุดรับสตรีม",
    callSheet: ["มีผู้เสนอเดิน HDMI แบบไม่ขยาย 30 ม. จากโน้ตบุ๊กโพเดียม", "สองกล้องและโน้ตบุ๊กผ่าน Videohub", "เสียง Shure/Yamaha เข้า HD8 XLR"],
    briefing: ["ไม่มีปุ่มซ่อมทั้งหมด ให้ตรวจข้อมูลพอร์ต ป้ายสาย จอรวมภาพ เส้นทางสัญญาณ และทดสอบไมค์"],
    devices: ["cam1", "cam2", "lap", "convHS", "vh", "sw", "mic", "mix", "monitor", "convSH", "pgm", "ssd", "net", "wan"],
    solution: L4pairs, prewired: "all", runs,
    extraCables: cables(["x-hdmi30", "HDMI ต่อยาวไม่ขยาย 30 ม. (ทดสอบผ่าน 10 ม.)", ["HDMI", "HDMI"], 30, 10], ["x-sdi35", "3G-SDI 35 ม. · ทดสอบแล้ว (พิกัดจำลอง 70 ม. ที่ 3G)", ["SDI", "SDI"], 35, 70]),
    startConfig: [...working, ...C("site", { ramp: false })],
    faults: [
      { id: "f-safety", label: "ทางเดินสาธารณะยังไม่มีรางครอบสาย", concept: "safety", order: 0, config: [{ device: "site", key: "ramp", value: false }], cleared: (c) => c.sim.config.site?.ramp === true },
      { id: "f-hdmi", label: "ต่อ HDMI ไม่ขยายจากโพเดียมไกลเกินพิกัด", concept: "cable-run", order: 1, repatch: { pair: ["lap:hdmi-out", "convHS:hdmi-in"], cable: "x-hdmi30" }, cleared: (c) => Boolean(c.inp["convHS:hdmi-in"]) },
      cfgFault("f-uhd", "กล้อง B ถูกตั้งเป็น 2160p50", "sdi-rate", "cam2", "format", "2160p50", 1),
      cfgFault("f-xp", "Videohub OUT 3 เลือกเส้นทางผิด", "router-crosspoint", "vh", "xp-3", "IN 1", 2),
      cfgFault("f-conv", "ตัวแปลงภาพออกอากาศไม่มีไฟ", "power", "convSH", "power", false, 3),
      unplugFault("f-wan", "ไม่มีทางเชื่อมต่ออินเทอร์เน็ตขาออก", "wan", ["net:wan", "wan:wan-in"], 5),
    ],
    solutionConfig: [...C("cam2", { format: "1080p50" }), ...C("vh", { "xp-3": "IN 3" }), ...C("convSH", { power: true }), ...C("sw", { record: true, stream: true }), ...C("site", { ramp: true, "rating-chart": true })],
    cues: [cue("c1", "พิธีกรภาพกว้าง", "CAM-A"), cue("c2", "สไลด์", "FIELD SLIDES"), cue("c3", "โต๊ะสาธิต", "CAM-B")],
    obj: [
      o("viewer", "สตรีมทดสอบ 60 วินาทีมีภาพและเสียงพิธีกร", "signal", "delivery", "wan", all(live("wan", "sw", ["HOST VOICE"]), evidence("STREAM TEST", "ทดสอบสตรีม 60 วินาที")), true),
      o("rec", "บันทึกในเครื่องและเก็บไฟล์แล้ว", "evidence", "delivery", "storage", evidence("ssd · ", "ปิดไฟล์ดิสก์แยกกล้องแล้ว"), true),
      o("sep", "เส้นทางเสียง XLR และภาพ SDI แยกกัน", "signal", "physical", "embedded-audio", all(edge("mix:st-l", "sw:xlr-1"), edge("mix:st-r", "sw:xlr-2"))),
      o("order", "ซ่อมตามลำดับที่เหมาะสม", "diagnostics", "delivery", "safety", (c) => {
        const rank = (id: string) => c.stage.faults?.find((f) => f.id === id)?.order ?? 9;
        const seq = c.sim.recoveryOrder.map(rank);
        return seq.every((r, i) => i === 0 || r >= seq[i - 1]) ? { ok: true } : { ok: false, reason: `Repair order was ${c.sim.recoveryOrder.join(" → ")}`, fix: "ความปลอดภัย → ต้นทาง → ต่อสาย → จอ → บันทึก → WAN → จุดรับสตรีม" };
      }),
      o("recovered", "วินิจฉัยและแก้ปัญหาครบทุกจุดแล้ว", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("runs", "ไม่มีสายเกินระยะที่ทดสอบผ่าน", "safety", "signal", "cable-run", noCableProblems(), true),
    ],
    preflight: ["ramp", "rating-chart"], quiz: quiz("cable-run"), reward: "ผู้พิชิตสายไกล",
    passCriteria: ["สตรีมจำลองและบันทึกในเครื่อง 60 วินาที", "เส้นทางภาพและเสียงแยกกัน", "แก้ต้นเหตุทีละจุด ไม่มีปุ่มซ่อมทั้งหมด"],
  });
  const L5 = finish(room, {
    id: "OUT-05", level: 5, title: "ประเมินปฏิบัติงานภาคสนาม", subtitle: "ประเมินทักษะ · ถ่ายทอดเคลื่อนที่อย่างปลอดภัยต่อสภาพอากาศ", guidance: "certification", minutes: "35–45 นาที",
    ticket: "ติดตั้งระบบสัมภาษณ์และสาธิตจากกล่องอุปกรณ์ ทั้งสองกล้อง งานนำเสนอ เสียง จอตรวจภาพ บันทึกแยกกล้อง สตรีม และแผนเครือข่ายสำรอง",
    callSheet: ["พยากรณ์เริ่มงาน: มีกลุ่มพายุฝนฟ้าคะนองใกล้พื้นที่", "มีเกตเวย์สำรองติดตั้งจริงและทดสอบแล้ว"],
    briefing: ["ไม่มีคำใบ้ ตัดสินใจเริ่มหรือหยุดงานตามความปลอดภัยจริง จะเกิดปัญหาทางเทคนิคหนึ่งครั้งหลังซ้อม"],
    devices: ["cam1", "cam2", "lap", "convHS", "vh", "sw", "mic", "mix", "monitor", "convSH", "pgm", "ssd", "net", "wan", "net2"],
    decoys: ["net2"], weather: "lightning",
    solution: L4pairs, runs,
    extraCables: cables(["x-hdmi30", "HDMI ต่อยาวไม่ขยาย 30 ม. (ทดสอบผ่าน 10 ม.)", ["HDMI", "HDMI"], 30, 10], ["x-weak", "SDI ม้วนสาย 30 ม. · ไม่ผ่านพิกัด (จำลองทดสอบผ่าน 20 ม. ที่ 3G)", ["SDI", "SDI"], 30, 20], ["x-eth", "Ethernet 5 ม. (สำรอง)", ["ETHERNET", "ETHERNET"], 5], ["x-eth2", "Ethernet 5 ม. (สำรอง)", ["ETHERNET", "ETHERNET"], 5]),
    solutionConfig: [...working, ...C("sw", { record: true, stream: true }), ...C("net", { "uplink-test": true }), ...C("net2", { power: true, "uplink-test": true }),
      ...C("site", { decision: "GO", shelter: true, "power-signoff": true, ramp: true, "rating-chart": true, fallback: true, soundcheck: true, wind: true, handover: true, risk: true })],
    surpriseFaults: [
      { id: "s-isp", label: "ผู้ให้บริการอินเทอร์เน็ตหลักขัดข้อง", concept: "wan", order: 5, config: [{ device: "net", key: "wan-link", value: "Down (ISP outage)", lock: true }], cleared: (c) => Boolean(c.view.wan?.live) },
      cfgFault("s-conv", "ตัวแปลงไฟเลี้ยงขาด", "power", "convHS", "power", false, 1),
      cfgFault("s-mute", "ไมค์พิธีกรปิดเสียง", "mute", "mix", "ch1-on", false, 1),
      cfgFault("s-rate", "กล้อง B เปลี่ยนเป็น UHD", "sdi-rate", "cam2", "format", "2160p50", 1),
    ],
    cues: [cue("c1", "พิธีกรภาพกว้าง", "CAM-A"), cue("c2", "สไลด์", "FIELD SLIDES"), cue("c3", "โต๊ะสาธิต", "CAM-B"), cue("c4", "พิธีกรภาพใกล้", "CAM-A")],
    obj: [
      o("safe", "สถานะความปลอดภัยผ่าน โดยตัดสินใจเริ่มหรือหยุดงานตามจริง", "safety", "physical", "safety", (c) => c.sim.config.site?.decision === "GO" && c.sim.weatherNow === "clear" ? { ok: true } : { ok: false, reason: "ยังไม่ยืนยันว่าปลอดภัยให้เริ่มงาน", fix: "หยุดรอจนยืนยันว่าปลอดภัย แล้วจึงเริ่มงาน" }, true),
      o("conv-dir", "ใช้ตัวแปลงถูกทิศทาง", "signal", "physical", "converter-direction", masked(all(edge("lap:hdmi-out", "convHS:hdmi-in"), edge("sw:sdi-out-1", "convSH:sdi-in")), "ไม่มีตัวแปลงในเส้นทางหรือใช้ผิดทิศ"), true),
      o("three", "เลือกสามแหล่งภาพแยกกันได้ พร้อมเส้นทางและรูปแบบ 1080p50 ที่ถูกต้อง", "signal", "signal", "router-crosspoint", all(inputCarries("sw:sdi-in-1", "CAM-A"), inputCarries("sw:sdi-in-2", "CAM-B"), inputCarries("sw:sdi-in-3", "FIELD SLIDES")), true),
      o("monitors", "จอรวมภาพและภาพออกอากาศทำงาน", "signal", "signal", "output-assign", all(shows("monitor", "MULTIVIEW"), mirrorsProgram("pgm", "sw"))),
      o("host", "เสียงพิธีกรชัดและเสียงรวมสะอาด", "quality", "signal", "mute", hears("sw", ["HOST VOICE"]), true),
      o("live", "สตรีมทดสอบส่วนตัวทำงาน", "signal", "delivery", "wan", live("wan", "sw", ["HOST VOICE"]), true),
      o("iso", "บันทึกและเก็บไฟล์แยกกล้องกับภาพออกอากาศแล้ว", "evidence", "delivery", "storage", all(recording("ssd", "ISO ×3"), evidence("ssd · ", "ปิดไฟล์ดิสก์แยกกล้องแล้ว")), true),
      o("runs", "ใช้สายตามตารางพิกัดระยะ", "safety", "signal", "cable-run", noCableProblems(), true),
      o("recovered", "กู้ระบบได้ โดยใช้เครือข่ายสำรองที่มีจริงเท่านั้น", "diagnostics", "delivery", "wan", faultsRecovered(), true),
    ],
    preflight: ["shelter", "power-signoff", "ramp", "rating-chart", "fallback", "soundcheck", "wind", "risk", "handover"], quiz: quiz("safety"), reward: "ผลประเมินช่างภาคสนามพอร์ตโบราณ",
    passCriteria: ["สถานะความปลอดภัยผ่าน", "ใช้ตัวแปลงถูกทิศทาง", "เลือกได้สามแหล่งภาพ", "เลือกเส้นทางถูกต้องและใช้ 1080p50", "ได้ยินพิธีกร", "สตรีมส่วนตัวทำงาน", "บันทึกแยกกล้องและภาพออกอากาศ", "กู้ระบบและเก็บงานปลอดภัย"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 05 · STADIUM (Constellation HD + Streaming Encoder HD) ══════════════════════════ */
function stadium(): StageManifest[] {
  CURRENT_ROOM = "xl";
  const room = "xl" as const;
  const cam = (ids: string[]) => ids.flatMap((d) => C(d, { power: true, format: "1080p50", framing: "Framed for assignment" }));
  const mvChain: Pair[] = [["sw:mv-out", "convA:sdi-in"], ["convA:hdmi-out", "monitor:hdmi-in"]];
  const runs = { "cam1|sw": 60, "cam2|sw": 80, "cam3|sw": 90, "cam4|sw": 85, "amb|mix": 70 };
  const swCfg = { power: true, labels: true };
  const L1 = finish(room, {
    id: "SP-01", level: 1, title: "ภาพแรกจากสนาม", subtitle: "ฝึกพร้อมคำแนะนำ · ส่งกล้องหลักไปยังจอรวมภาพผู้กำกับ", guidance: "guided", minutes: "12–15 นาที",
    ticket: "แสดงพื้นที่แข่งขันทั้งหมดบนจอผู้กำกับ",
    callSheet: ["กล้อง 1 หลัก มุมสูงและกว้างบนแท่น", "Constellation: โต๊ะผู้กำกับในห้องถ่ายทอด"],
    briefing: ["ต่อ Studio Camera 12G-SDI OUT → Constellation SDI IN 1 โดยตั้งกล้องเป็น 1080p50 ก่อน", "ต่อ MV SDI OUT → ตัวแปลง SDI→HDMI ที่มีไฟเลี้ยง → จอ HDMI", "เลือก SDI 1 เป็นภาพเตรียม แล้วสลับออกอากาศ"],
    devices: ["cam1", "sw", "convA", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ...mvChain], runs,
    extraCables: cables(["x-sdi", "3G-SDI 5 ม. (สำรอง)", ["SDI", "SDI"], 5, 70]),
    startConfig: [...C("cam1", { format: "2160p50" })],
    solutionConfig: [...cam(["cam1"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }), ...C("sw", { pvw: "SDI 1" }), ...C("site", { format: true, "cable-route": true, sightlines: true })],
    previewBeforeTake: true,
    cues: [cue("c1", "เริ่มแข่งขัน … เตรียมช่อง 1 … สลับช่อง 1", "CAM 1")],
    obj: [
      o("mv", "จอรวมภาพผู้กำกับแสดงกล้องหลักภาพกว้าง", "signal", "signal", "sdi-rate", shows("monitor", "CAM 1"), true),
      o("pgm", "ภาพออกอากาศเป็นกล้อง 1", "signal", "rehearsal", "output-assign", (c) => c.view.sw?.picture?.includes("CAM 1") ? { ok: true } : { ok: false, reason: "ภาพออกอากาศยังไม่ใช่กล้อง 1", fix: "เตรียมภาพ SDI 1 แล้วสลับออกอากาศ" }),
      o("labels", "ตั้งชื่อแหล่งสัญญาณแล้ว", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "ตั้งชื่อกล้องหลักและแหล่งภาพอื่น")),
      o("fmt", "ตั้งกล้องเป็น 1080p50", "config", "signal", "sdi-rate", cfgIs("cam1", "format", "1080p50", "ตั้งเป็น 1080p50")),
    ],
    preflight: ["format", "cable-route", "sightlines"], quiz: quiz("sdi-rate"), reward: "ธงสนามแรก",
    passCriteria: ["จอแสดงภาพกว้างเคลื่อนไหว", "ยืนยันอัตราภาพแล้ว", "สายไม่ขวางทางเดินสาธารณะ"],
  });
  const L2 = finish(room, {
    id: "SP-02", level: 2, title: "สายตารอบสนาม", subtitle: "คำแนะนำบางส่วน · ควบคุมสามกล้องตามคิว", guidance: "partial", minutes: "16–20 นาที",
    ticket: "ติดตามการแข่งขันจากภาพกว้าง → ริมสนาม → หน้าประตู",
    callSheet: ["กล้อง 2 ริมสนาม → SDI IN 2", "กล้อง 3 หน้าประตู → SDI IN 3", "ดูภาพเตรียมก่อนสลับออกอากาศทุกครั้ง"],
    briefing: ["กล้องแต่ละตัวต้องมีสาย BNC แยกของตนเอง", "ตรวจสายที่ต่ออยู่ใน CAM 2 และตรวจมุมภาพของ CAM 3"],
    devices: ["cam1", "cam2", "cam3", "sw", "convA", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ...mvChain], runs,
    prewired: [["cam1:sdi-out", "sw:sdi-in-1"], ...mvChain, ["sw:sdi-out-1", "cam2:sdi-ret", "x-ret"]],
    extraCables: cables(["x-ret", "3G-SDI 90 ม. (สายส่งกลับ)", ["SDI", "SDI"], 90, 100]),
    startConfig: [...cam(["cam1"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }), ...C("cam3", { framing: "Not framed" })],
    solutionConfig: [...cam(["cam2", "cam3"]), ...C("site", { sightlines: true })],
    previewBeforeTake: true,
    cues: [cue("c1", "เริ่มบุก — ภาพกว้าง", "CAM 1"), cue("c2", "ผู้เล่นริมเส้น — กล้องริมสนาม", "CAM 2"), cue("c3", "ยิงประตู — กล้องหน้าประตู", "CAM 3"), cue("c4", "ตั้งเกมใหม่ — ภาพกว้าง", "CAM 1")],
    obj: [
      o("mv3", "จอรวมภาพแสดงทั้งสามแหล่งแยกกัน", "signal", "signal", "return-feed", showsAll("monitor", ["CAM 1", "CAM 2", "CAM 3"]), true),
      o("framed", "มุมกล้องทุกตัวไม่มีสิ่งบัง", "quality", "signal", "output-assign", all(...["cam1", "cam2", "cam3"].map((d) => cfgIs(d, "framing", "Framed for assignment", `จัดกรอบ ${d} ใหม่ ภาพถูกบัง`)))),
    ],
    preflight: ["sightlines"], quiz: quiz("return-feed"), reward: "สายตาแห่งสนาม",
    passCriteria: ["จอรวมภาพแยกสามแหล่ง", "ควบคุมภาพตามช่วงคิว ไม่มีภาพดำ"],
  });
  const vid3: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ...mvChain];
  const audio: Pair[] = [["mic1:xlr-out", "mix:mic-1"], ["mic2:xlr-out", "mix:mic-2"], ["amb:xlr-out", "mix:mic-3"], ["mix:st-l", "sw:aud-l"], ["mix:st-r", "sw:aud-r"], ["mix:phones", "phones:in"]];
  const gfx: Pair[] = [["gfx:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "sw:sdi-in-5"]];
  const mixOk = [...C("mix", { power: true, "st-fader": "Unity" }), ...[1, 2, 3].flatMap((n) => C("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, [`ch${n}-st`]: true, [`ch${n}-hpf`]: true })), ...C("amb", { windscreen: true }), ...C("mic1", { aim: "At talker's mouth" }), ...C("mic2", { aim: "At talker's mouth" })];
  const L3 = finish(room, {
    id: "SP-03", level: 3, title: "บันทึกผลการแข่งขัน", subtitle: "สถานการณ์ฝึก · เสียงผู้บรรยายและกราฟิกคะแนนที่มีสิทธิ์ใช้", guidance: "scenario", minutes: "20–25 นาที",
    ticket: "ผลิตรายการกีฬาที่ฟังชัด ด้วยเสียงผู้บรรยายสองคน เสียงบรรยากาศที่เหมาะสม และกราฟิกคะแนนถูกต้อง",
    callSheet: ["ผู้บรรยาย 1/2 ในห้องบรรยาย · ไมค์บรรยากาศหันหาผู้ชม", "โต๊ะกราฟิก: แม่แบบคะแนนที่มีสิทธิ์ใช้", "คะแนนเต็มจอผ่าน HDMI→SDI 3G → SDI IN 5"],
    briefing: ["เสียงในหูฟังไม่ใช่เสียงที่ผู้ชมทางไกลได้รับ ให้ตรวจเสียงที่ฝังในภาพออกอากาศจากเครื่องสลับภาพ", "ผู้ควบคุมต้องแก้คะแนนเอง และตรวจเทียบเหตุการณ์ในสนามก่อนแสดงออกอากาศ"],
    devices: ["cam1", "cam2", "cam3", "sw", "convA", "monitor", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS"],
    solution: [...vid3, ...audio, ...gfx], prewired: vid3, runs,
    startConfig: [...cam(["cam1", "cam2", "cam3"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }),
      ...C("mix", { power: true, "st-fader": "Unity", "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch2-gain": "Nominal (peaks −18 dBFS)", "ch2-on": false, "ch2-st": true, "ch3-gain": "Too hot (clips)", "ch3-on": true, "ch3-st": true })],
    solutionConfig: [...mixOk, ...C("sw", { "analog-on": true, "emb-audio": "OFF" }), ...C("gfx", { power: true, template: "Scoreboard template (licensed)", score: "1–0" }), ...C("convHS", { power: true }), ...C("site", { soundcheck: true, licensed: true, wind: true })],
    cues: [cue("c1", "ขึ้นเกม — ภาพกว้าง", "CAM 1"), cue("c2", "ประตู! — กล้องหน้าประตู", "CAM 3"), cue("c3", "กราฟิกคะแนน (ตรวจ 1–0)", "SCOREBOARD 1–0"), cue("c4", "เริ่มเล่นต่อ — ภาพกว้าง", "CAM 1")],
    obj: [
      o("mix", "ภาพออกอากาศมีผู้บรรยายสองคนและเสียงบรรยากาศเหมาะสม", "quality", "signal", "embedded-audio", hears("sw", ["COMMENTATOR 1", "COMMENTATOR 2", "CROWD AMBIENCE"]), true),
      o("booth", "หูฟังห้องบรรยายตรวจเสียงชุดเดียวกัน", "signal", "signal", "embedded-audio", hears("phones", ["COMMENTATOR 1", "COMMENTATOR 2"])),
      o("gfx-src", "ระบุแหล่งกราฟิกถูกต้อง โดย SDI IN 5 รับคะแนนที่มีสิทธิ์ใช้", "config", "signal", "graphics", inputCarries("sw:sdi-in-5", "SCOREBOARD")),
      o("score", "คะแนนออกอากาศตรงกับเหตุการณ์ในสนาม 1–0", "signal", "rehearsal", "graphics", (c) => {
        const h = c.sim.pgmHistory;
        if (!h.includes("SCOREBOARD 1–0")) return { ok: false, reason: "ยังไม่เคยแสดงคะแนน 1–0", fix: "แก้คะแนนเป็น 1–0 หลังมีประตู ตรวจแล้วสลับ SDI IN 5" };
        return h.some((x) => x === "SCOREBOARD 0–0" || x === "GFX TEST PATTERN") ? { ok: false, reason: "คะแนนเก่าหรือภาพทดสอบหลุดออกอากาศ", fix: "ตรวจกราฟิกก่อนสลับออกอากาศ" } : { ok: true };
      }, true),
      o("clean", "ใช้ภาพกล้องสะอาดระหว่างแสดงกราฟิก", "quality", "rehearsal", "output-assign", historyHas(["CAM 1", "CAM 3"])),
    ],
    preflight: ["soundcheck", "licensed", "wind"], quiz: quiz("graphics"), reward: "ผู้บันทึกผลการแข่งขัน",
    passCriteria: ["ผสมเสียงผู้บรรยายสองคนจริง", "คะแนนถูกต้อง", "ภาพกล้องสะอาด", "ระบุแหล่งกราฟิกถูกต้อง"],
  });
  const full: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ["cam4:sdi-out", "sw:sdi-in-4"], ...gfx, ...audio, ...mvChain,
    ["sw:sdi-out-1", "enc:sdi-in"], ["enc:eth", "net:lan-1"], ["net:wan", "wan:wan-in"], ["sw:sdi-out-2", "rec:sdi-in"], ["sw:sdi-out-3", "convB:sdi-in"], ["convB:hdmi-out", "pgm:hdmi-in"]];
  const fullCfg = [...cam(["cam1", "cam2", "cam3", "cam4"]), ...mixOk, ...C("sw", { ...swCfg, "analog-on": true, "emb-audio": "OFF", "sdi-out-1": "PROGRAM", "sdi-out-2": "PROGRAM", "sdi-out-3": "PROGRAM", pgm: "SDI 1" }),
    ...C("gfx", { power: true, template: "Scoreboard template (licensed)" }), ...C("convHS", { power: true }), ...C("convA", { power: true }), ...C("convB", { power: true }), ...C("monitor", { power: true }), ...C("pgm", { power: true }),
    ...C("enc", { power: true, format: "1080p50", "stream-key": "•••••••• (private test key)" }), ...C("rec", { power: true, media: "SD card mounted (512 GB free)" }), ...C("net", { power: true })];
  const L4 = finish(room, {
    id: "SP-04", level: 4, title: "การถ่ายทอดที่สะดุด", subtitle: "แก้เหตุขัดข้อง · เครื่องสลับภาพ → ตัวเข้ารหัส → อินเทอร์เน็ต → ผู้ชม", guidance: "disruption", minutes: "24–30 นาที",
    ticket: "ส่งรายการกีฬาไปยังผู้ชมทดสอบส่วนตัว พร้อมรักษาการบันทึกภาพออกอากาศในเครื่อง",
    callSheet: ["SDI OUT A ภาพออกอากาศ → Streaming Encoder HD", "SDI OUT B ภาพออกอากาศ → HyperDeck บันทึกรายการ", "SDI OUT C ภาพออกอากาศ → จอตรวจรายการ", "Constellation Ethernet ใช้เครือข่ายควบคุมเท่านั้น"],
    briefing: ["มีปัญหาที่แก้ได้สองจุด ให้ตรวจกล้อง → เครื่องสลับภาพ → ตัวเข้ารหัส → อินเทอร์เน็ต → ผู้ชม", "ภาพกระตุกอาจมาจากเครือข่าย ส่วนภาพตารางรวมบนจอผู้ชมเกิดจากเลือกเส้นทางผิด", "ใช้ภาพพักรายการระหว่างแก้ปัญหา แล้วคืนรายการปกติ"],
    devices: ["cam1", "cam2", "cam3", "cam4", "sw", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS", "convA", "monitor", "convB", "pgm", "enc", "rec", "net", "wan"],
    solution: full, prewired: "all", runs,
    startConfig: [...fullCfg, ...C("enc", { stream: true }), ...C("rec", { record: true })],
    faults: [cfgFault("f-enc-route", "ตัวเข้ารหัสรับขาออกที่ตั้งเป็นจอรวมภาพ", "output-assign", "sw", "sdi-out-1", "MULTIVIEW", 2), cfgFault("f-full", "สื่อเครื่องบันทึกเต็ม", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4)],
    solutionConfig: [...C("sw", { "sdi-out-1": "PROGRAM" }), ...C("rec", { media: "SD card mounted (512 GB free)" }), ...C("site", { holding: true, permission: true })],
    cues: [cue("c1", "ภาพกว้าง", "CAM 1"), cue("c2", "ริมสนาม", "CAM 2"), cue("c3", "ภาพกว้าง", "CAM 1")],
    obj: [
      o("viewer", "ผู้ชมทางไกลได้รับภาพและเสียงผู้บรรยาย 90 วินาที", "signal", "delivery", "embedded-audio", all(live("wan", "sw", ["COMMENTATOR 1", "COMMENTATOR 2"]), evidence("STREAM TEST 90", "ทดสอบสตรีม 90 วินาที")), true),
      o("rec", "แสดงสถานะไฟล์บันทึกภาพออกอากาศในเครื่อง", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "ปิดไฟล์คลิป HyperDeck แล้ว")), true),
      o("pgm", "จอภาพออกอากาศใช้ขาออก SDI ของตนเอง", "signal", "signal", "output-assign", mirrorsProgram("pgm", "sw")),
      o("fallback", "ใช้ภาพพักรายการระหว่างแก้ปัญหา", "diagnostics", "rehearsal", "graphics", (c) => c.sim.fallbackUsed ? { ok: true } : { ok: false, reason: "ยังไม่ใช้ภาพสำรองที่ปลอดภัยระหว่างมีปัญหา", fix: "ใช้ภาพพักรายการระหว่างแก้ปัญหา แล้วคืนภาพปกติ" }),
      o("recovered", "วินิจฉัยและแก้ปัญหาทั้งสองพร้อมบันทึกเหตุการณ์", "diagnostics", "delivery", "output-assign", faultsRecovered(), true),
    ],
    preflight: ["holding", "permission"], quiz: quiz("eth-role"), reward: "ผู้กู้การถ่ายทอด",
    passCriteria: ["ผู้ชมรับภาพและเสียงฝัง 90 วินาที", "ตรวจสถานะไฟล์บันทึกในเครื่อง", "บันทึกการกู้ระบบแล้ว"],
  });
  const L5 = finish(room, {
    id: "SP-05", level: 5, title: "ประเมินปฏิบัติถ่ายทอดกีฬานอกสถานที่", subtitle: "ประเมินทักษะ · ถ่ายทอดฟุตบอลจำลองครบระบบ", guidance: "certification", minutes: "40–50 นาที",
    ticket: "จัดระบบจากกล่องอุปกรณ์จนส่งมอบงาน: สี่กล้อง ผู้บรรยายสองคน เสียงบรรยากาศ คะแนนที่ตรวจสอบแล้ว จอรวมภาพและภาพออกอากาศแยกกัน การบันทึก และตัวเข้ารหัสส่งไปยังผู้ชมส่วนตัว",
    callSheet: ["กล้อง 1 หลัก · กล้อง 2 ริมสนาม · กล้อง 3 ประตู · กล้อง 4 ปฏิกิริยา", "ลำดับ: เปิด → แข่งขันหลัก → ริมสนาม → คะแนน → ปฏิกิริยา → ปิด", "เลือกใช้เครื่องเล่นคลิปที่เตรียมไว้ได้ ไม่ใช่ระบบเล่นซ้ำทันทีหลายมุม"],
    briefing: ["ไม่มีคำใบ้ หลังซ้อมจะเกิดปัญหาเสียง ภาพ เครือข่าย หรือการบันทึกหนึ่งอย่าง"],
    devices: ["cam1", "cam2", "cam3", "cam4", "sw", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS", "convA", "monitor", "convB", "pgm", "enc", "rec", "net", "wan", "play"],
    decoys: ["play"],
    solution: full, runs,
    extraCables: cables(["x-sdi", "3G-SDI 50 ม. (สำรอง)", ["SDI", "SDI"], 50, 100], ["x-sdi2", "3G-SDI 5 ม. (สำรอง)", ["SDI", "SDI"], 5, 70], ["x-eth", "Ethernet 3 ม. (LAN ควบคุม)", ["ETHERNET", "ETHERNET"], 3]),
    solutionConfig: [...fullCfg, ...C("gfx", { score: "1–0" }), ...C("enc", { stream: true }), ...C("rec", { record: true }), ...C("net", { "uplink-test": true }),
      ...C("site", { rights: true, crew: true, sightlines: true, "cable-route": true, soundcheck: true, clap: true, storage: true, permission: true, holding: true, comms: true, wind: true, privacy: true, risk: true, teardown: true })],
    surpriseFaults: [cfgFault("s-audio", "ปิดขาเข้าเสียงผู้บรรยายแอนะล็อก", "embedded-audio", "sw", "analog-on", false, 1), unplugFault("s-video", "สาย SDI กล้อง 2 หลุด", "connector", ["cam2:sdi-out", "sw:sdi-in-2"], 1),
      unplugFault("s-net", "การเชื่อมต่อ WAN ขาด", "wan", ["net:wan", "wan:wan-in"], 5), cfgFault("s-rec", "สื่อเครื่องบันทึกเต็ม", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4)],
    previewBeforeTake: true,
    cues: [cue("c1", "เปิดรายการ — กล้องหลักภาพกว้าง", "CAM 1"), cue("c2", "จังหวะสำคัญ — กล้องริมสนาม", "CAM 2"), cue("c3", "ประตู — กล้องหน้าประตู", "CAM 3"), cue("c4", "คะแนน (ตรวจ 1–0)", "SCOREBOARD 1–0"), cue("c5", "ปฏิกิริยาผู้ชม", "CAM 4"), cue("c6", "ปิดรายการ — ภาพกว้าง", "CAM 1")],
    obj: [
      o("four", "เลือกมุมกล้องแตกต่างกันได้สี่มุม", "signal", "signal", "sdi-rate", showsAll("monitor", ["CAM 1", "CAM 2", "CAM 3", "CAM 4"]), true),
      o("remote-audio", "เสียงผู้บรรยายและบรรยากาศที่เหมาะสมถึงผู้ชมทางไกล", "quality", "delivery", "embedded-audio", live("wan", "sw", ["COMMENTATOR 1", "COMMENTATOR 2", "CROWD AMBIENCE"]), true),
      o("score", "คะแนนตรงกับเหตุการณ์การแข่งขัน", "signal", "rehearsal", "graphics", (c) => c.sim.pgmHistory.includes("SCOREBOARD 1–0") && !c.sim.pgmHistory.includes("SCOREBOARD 0–0") ? { ok: true } : { ok: false, reason: "คะแนนผิดหรือยังไม่เคยนำออกอากาศ", fix: "แก้เป็น 1–0 หลังมีประตูแล้วตรวจสอบ" }, true),
      o("paths", "ภาพออกอากาศ จอรวมภาพ และเครื่องบันทึกใช้ขาออกแยกกัน", "signal", "physical", "output-assign", masked(all(edge("sw:sdi-out-1", "enc:sdi-in"), edge("sw:sdi-out-2", "rec:sdi-in"), edge("sw:sdi-out-3", "convB:sdi-in"), edge("sw:mv-out", "convA:sdi-in")), "ตัวเข้ารหัส เครื่องบันทึก จอออกอากาศ และจอรวมภาพยังไม่ได้ใช้ขาออกแยกตามเอกสาร"), true),
      o("viewer", "ตัวเข้ารหัสแยกส่งผ่าน WAN ถึงผู้ชมทางไกล", "signal", "delivery", "eth-role", live("wan", "sw"), true),
      o("rec", "ไฟล์ภาพออกอากาศยืนยันการบันทึกในเครื่อง", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "ปิดไฟล์คลิป HyperDeck แล้ว")), true),
      o("recovered", "กู้ระบบสำเร็จ", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("no-early", "เริ่มถ่ายทอดหลังซ้อมเท่านั้น", "safety", "delivery", "stream-key", (c) => c.sim.log.some((l) => l.code === "EARLY_STREAM") ? { ok: false, reason: "ตัวเข้ารหัสเริ่มถ่ายทอดก่อนผ่านการซ้อม", fix: "ซ้อมให้ผ่านก่อน" } : { ok: true }),
    ],
    preflight: ["rights", "crew", "sightlines", "cable-route", "soundcheck", "clap", "storage", "permission", "holding", "comms", "wind", "privacy", "risk", "teardown"], quiz: quiz("eth-role"),
    reward: "บัลลังก์จอมถ่ายทอด: ผ่านการฝึกผู้ควบคุมถ่ายทอดสด (ระบบจำลอง ไม่ใช่ใบอนุญาตวิชาชีพ)",
    passCriteria: ["มุมภาพต่างกันสี่มุม", "แหล่ง SDI ถูกต้องตลอดเส้นทาง", "เสียงพูดและบรรยากาศถึงตัวเข้ารหัสทางไกล", "คะแนนตรงเหตุการณ์", "เส้นทางภาพออกอากาศ จอรวมภาพ และเครื่องบันทึกแยกกัน", "ตัวเข้ารหัสแยก → WAN → ผู้ชม", "บันทึกในเครื่องทำงาน", "กู้ระบบและเก็บงานปลอดภัย"],
  });
  return [L1, L2, L3, L4, L5];
}

export const STAGES: StageManifest[] = [...classroom(), ...studio(), ...auditorium(), ...outdoor(), ...stadium()];
export const stageFor = (scale: keyof typeof ROOMS, level: number) => STAGES.find((s) => s.room === scale && s.level === level)!;
