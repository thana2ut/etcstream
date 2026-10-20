import type { ControlValue, FaultScenario, ObjectivePredicate, StageManifest } from "./types";
import { MODELS } from "./equipment";
import { MISSION_ROOMS } from "./rooms";
import { all, CONCEPTS, cuesDone, edge, faultsRecovered, hears, inputCarries, live, mirrorsProgram, noBlackAfterStart, noFeedback, o, placedAll, poweredAll, quizOk, showsAll, signedOff, site } from "./library";

type Pair = [string, string];
type Setting = StageManifest["solutionConfig"][number];
const config = (device: string, settings: Record<string, ControlValue>): Setting[] => Object.entries(settings).map(([key, value]) => ({ device, key, value }));
const audioSettings = (channels: number[]) => [
  ...channels.flatMap((n) => config("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, [`ch${n}-pa`]: true, [`ch${n}-bc`]: true })),
  ...config("mix", { "pa-fader": "Unity", "bc-fader": "Unity" }),
];
const rf = (tx: string, rx: string) => [...config(tx, { power: true, rf: "CH 1" }), ...config(rx, { power: true, rf: "CH 1", pair: "Paired" })];
const encoder = (id: string) => config(id, { format: "1080p50", "stream-key": "•••• (private test)", stream: true });
const fault = (id: string, device: string, key: string, bad: ControlValue, good: ControlValue, label: string): FaultScenario => ({ id, label, concept: "output-assign", config: [{ device, key, value: bad }], cleared: (c) => c.cfg(device, key) === good });
const brokenLead = (pair: Pair): FaultScenario => ({ id: "f-physical-link", label: "สายจากระบบกล้องเข้าฝ่ายควบคุมหลุด", concept: "connector", unplug: [pair], cleared: (c) => edge(...pair)(c).ok });

interface Authored {
  devices: string[]; edges: Pair[]; controls: Setting[]; objectives: ObjectivePredicate[];
  ticket: string; title: string; refs: string[]; preflight?: string[]; cues?: StageManifest["cues"]; faults?: FaultScenario[]; surprise?: FaultScenario[];
}

/** Reconciled active manifests reuse the existing engine and IDs; original definitions remain available. */
function build(previous: StageManifest, spec: Authored): StageManifest {
  const room = MISSION_ROOMS[previous.room];
  const devices = [...new Set(spec.devices)];
  const preflight = [...new Set([...(spec.preflight ?? ["power-check", "cable-route"]), ...(previous.room === "l" ? ["shelter", "power-signoff", "ramp"] : [])])];
  const powered = devices.filter((d) => MODELS[room.instances[d].model].needsPower);
  const cameras = devices.filter((d) => MODELS[room.instances[d].model].kind === "camera");
  const videoJob = spec.edges.some(([, to]) => to.startsWith("sw:sdi-in-"));
  const settings = [...powered.map((device) => ({ device, key: "power", value: true })), ...cameras.flatMap((device) => config(device, { framing: "Framed for assignment" })), ...spec.controls, ...preflight.map((key) => ({ device: "site", key, value: true })), ...(previous.room === "l" ? config("site", { decision: "GO" }) : [])];
  const cues = spec.cues ?? [];
  const objectives: ObjectivePredicate[] = [
    o("installed", "ติดตั้งอุปกรณ์ที่จำเป็นครบจุด", "safety", "physical", "safety", placedAll(devices), true),
    o("powered", "อุปกรณ์ทุกตัวพร้อมรับไฟเลี้ยงจำลอง", "config", "physical", "power", poweredAll(powered), true),
    o("channel-map", "สายทุกเส้นใช้พอร์ตตามใบงานที่เลือก", "signal", "physical", "direction", all(...spec.edges.map(([from, to]) => edge(from, to))), true),
    ...preflight.map((key) => o(`pre-${key}`, `ตรวจความพร้อม: ${key === "cable-route" || key === "ramp" ? "เส้นทางสายไม่กีดขวาง" : key === "power-check" ? "แหล่งจ่ายที่ช่างเตรียมไว้" : key === "shelter" ? "ป้องกันสภาพอากาศ" : key === "soundcheck" ? "ระดับเสียง" : "ความปลอดภัยก่อนเริ่มงาน"}`, "safety", "physical", "safety", site(key, "รายการความพร้อม"), true)),
    ...(previous.room === "l" ? [o("safe", "ประเมินอากาศและอนุมัติเริ่มงานหลังปลอดภัย", "safety", "physical", "safety", (c) => ({ ok: c.cfg("site", "decision") === "GO" && c.sim.weatherNow === "clear", reason: "ยังไม่ยืนยันว่าปลอดภัยให้เริ่มงาน", fix: "บันทึกหยุดงาน รอยืนยันว่าปลอดภัย แล้วประเมินก่อนอนุมัติเริ่มงาน" }), true)] : []),
    ...spec.objectives,
    ...(videoJob ? [o("clean-program", "เลือกภาพจริงออก PROGRAM โดยไม่เป็นภาพดำหรือ Multiview", "signal", "signal", "output-assign", (c) => ({ ok: Boolean(c.view.sw?.picture && c.view.sw.picture !== "BLACK" && !c.view.sw.picture.startsWith("MULTIVIEW")), reason: "ยังไม่มีภาพรายการที่ถูกต้อง", fix: "เลือกแหล่งภาพที่พร้อมเป็น PROGRAM" }), true)] : []),
    ...(cameras.length ? [o("framing", "จัดกรอบภาพตามจุดกล้องที่ได้รับมอบหมาย", "config", "signal", "output-assign", (c) => ({ ok: cameras.every((id) => c.cfg(id, "framing") === "Framed for assignment"), reason: "ยังไม่ได้จัดกรอบภาพครบทุกกล้อง" }))] : []),
    ...(cues.length ? [o("cues", "สลับภาพออกอากาศตามคิวครบ", "evidence", "rehearsal", "output-assign", cuesDone(), true), o("no-black", "ไม่มีภาพดำระหว่างซ้อมรายการ", "quality", "rehearsal", "output-assign", noBlackAfterStart(), true)] : []),
    ...((spec.faults?.length || spec.surprise?.length) ? [o("recovered", "วินิจฉัยและแก้ปัญหาที่เกิดในงาน", "diagnostics", "delivery", "connector", faultsRecovered(), true)] : []),
    o("quiz", "ตอบคำถามทบทวนก่อนตรวจรับ", "evidence", "delivery", "direction", quizOk()),
    o("signoff", "ผู้เล่นตรวจรับระบบปัจจุบัน", "evidence", "delivery", "safety", signedOff(), true),
  ];
  return {
    ...previous, topologyId: `appendix-a-${previous.room}-${previous.level}-v1`, appendixReferenceIds: spec.refs, researchStatus: "DESIGN_REFERENCE",
    unresolvedHardware: ["โมเดลและแผงหลังเป็นโปรไฟล์ฝึก ไม่ใช่การยืนยันสินค้าหรือครุภัณฑ์จริง", ...(devices.some((id) => MODELS[room.instances[id].model].transport) ? ["ระบบ Optical เป็นชุดจำลองเข้าคู่ ต้องยืนยันรุ่น รูปขั้วต่อ และรายละเอียดชุดสายก่อนทำโมเดลสินค้า"] : []), ...(previous.room === "xl" ? ["ระบบสำรองใช้แหล่งผลิตและไฟเลี้ยงร่วม จัดเป็นการสำรองบางส่วน", "พอร์ตจริงของลิงก์ควบคุม Replay และ Tally/Intercom ยังไม่ยืนยัน จึงไม่ระบุโปรโตคอลผู้ผลิต"] : [])],
    title: spec.title, subtitle: spec.ticket, ticket: `${previous.id} · ${spec.ticket}`, devices, solution: spec.edges, solutionConfig: settings,
    prewired: previous.level === 4 ? "all" : undefined, startConfig: previous.level === 4 ? settings : [], faults: spec.faults, surpriseFaults: spec.surprise,
    extraCables: [], runs: undefined, decoys: [], weather: previous.room === "l" ? previous.weather ?? "clear" : undefined, preflight, cues, objectives,
    previewBeforeTake: previous.level >= 3, briefing: ["เดินตรวจอุปกรณ์และพอร์ต หยิบสายจริง ต่อทั้งสองปลาย แล้วตั้งค่าและทดสอบด้วยตนเอง", "ภาพรวมสำหรับผู้ควบคุมกับภาพรายการเป็นคนละปลายทาง"],
    callSheet: ["คลังสายและอุปกรณ์ → จุดต้นทาง → จุดควบคุม → ปลายทาง"], quiz: CONCEPTS.connector.check,
    passCriteria: spec.objectives.map((p) => p.label),
  };
}

const viewObjective = (id: string, label: string, device: string, content: string[]) => o(id, label, "signal", "signal", "output-assign", showsAll(device, content), true);
const audioObjective = (device: string, voices: string[]) => o(`audio-${device}`, `เสียงที่ถูกต้องถึง ${device === "pa" ? "ระบบ PA" : "ปลายทางรายการ"}`, "signal", "signal", "embedded-audio", all(hears(device, voices), noFeedback([device])), true);
const monitorRoute: Pair = ["sw:mv-out", "monitor:sdi-in"];

function outdoor(previous: StageManifest): StageManifest {
  const n = previous.level;
  const refs = ["R06", "R07", "R09", "R10", "R11", "R12", "R13", "R15"];
  const near: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"]];
  const video: Pair[] = [...near, ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "fiberTx:sdi-in"], ["fiberTx:optical-out", "fiberRx:optical-in"], ["fiberRx:sdi-out", "sw:sdi-in-3"], monitorRoute];
  const audio: Pair[] = [["lav:out", "tx:mic-in"], ["rx:audio-out", "mix:in-1"], ["shotgun:xlr-out", "mix:in-2"], ["amb:xlr-out", "mix:in-3"], ["mix:pa-l", "pa:line-in"]];
  const delivery: Pair[] = [["sw:pgm-out", "embed:sdi-in"], ["mix:bc-l", "embed:audio-l"], ["mix:bc-r", "embed:audio-r"], ["embed:sdi-out", "enc:sdi-in"], ["enc:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]];
  const videoDevices = ["cam1", "cam2", "cam3", "fiberTx", "fiberRx", "sw", "monitor"];
  const audioDevices = ["lav", "tx", "rx", "shotgun", "amb", "mix", "pa"];
  const voices = ["PRESENTER VOICE", "STAGE VOICE", "CROWD AMBIENCE"];
  // OUT switcher = ATEM Television Studio HD8 ISO: its dedicated PROGRAM output feeds the embedder (no role setting).
  const videoControls = config("sw", { pgm: "SDI 1", "emb-audio": "OFF" });
  const audioControls = [...rf("tx", "rx"), ...audioSettings([1, 2, 3]), ...config("mix", { "ch2-phantom": true }), ...config("shotgun", { windscreen: true }), ...config("amb", { windscreen: true }), ...config("pa", { level: "Nominal", aim: "In front of the mic, aimed at audience" })];
  const videoGoals = [viewObjective("mv", "จอรวมภาพแสดงกล้องทั้งสามผ่านเส้นทางจริง", "monitor", ["CAM A", "CAM B", "CAM C"]), ...[1, 2, 3].map((i) => o(`input-${i}`, `ขาเข้าภาพ ${i} มีภาพกล้องที่กำหนด`, "signal", "signal", "direction", inputCarries(`sw:sdi-in-${i}`, `CAM ${["A", "B", "C"][i - 1]}`), true))];
  if (n === 1) return build(previous, { title: "เส้นทางภาพภาคสนาม", ticket: "ต่อกล้องใกล้ผ่านเครื่องสลับภาพและตรวจจอรวมภาพ", refs, devices: ["cam1", "sw", "monitor"], edges: [...near, monitorRoute], controls: videoControls, objectives: [viewObjective("mv", "จอรับภาพกล้อง A จากขาออกรวมภาพ", "monitor", ["CAM A"])] });
  if (n === 2) return build(previous, { title: "เส้นทางเสียงภาคสนาม", ticket: "จับคู่ไมค์พิธีกร รับเสียงเวทีและบรรยากาศ แล้วส่ง PA โดยแยกบัสรายการ", refs, devices: audioDevices, edges: audio, controls: audioControls, objectives: [audioObjective("pa", voices), o("broadcast-bus", "บัส Broadcast มีเสียงพร้อมนำไปฝังรายการ", "signal", "signal", "group-bus", (c) => { const s = c.out["mix:bc-l"]; return { ok: s?.kind === "audio" && voices.every((v) => s.sources.includes(v)), reason: "ยังไม่มีเสียงครบในบัส Broadcast", fix: "ตรวจ Gain, +48V เฉพาะไมค์ช็อตกัน และการส่งบัส" }; }, true)], preflight: ["power-check", "soundcheck", "cable-route"] });
  if (n === 3) return build(previous, { title: "กล้องไกลและการสลับภาพ", ticket: "ติดตั้งคู่ Optical ของกล้อง C และสลับภาพ A/B/C ด้วย Preview ก่อน Program", refs, devices: videoDevices, edges: video, controls: videoControls, objectives: videoGoals, cues: ["A", "B", "C"].map((c, i) => ({ id: `cam-${i}`, call: `เตรียมแล้วออกภาพกล้อง ${c}`, expect: `CAM ${c}` })) });
  return build(previous, { title: n === 4 ? "ซ่อมระบบส่งภาพและเสียงกลางแจ้ง" : "ถ่ายทอดภาคสนามครบเส้นทาง", ticket: "ติดตั้งกล้องสามจุด เสียง PA/รายการ อุปกรณ์ฝังเสียง ตัวเข้ารหัส และตรวจผู้ชมจำลอง", refs, devices: [...videoDevices, ...audioDevices, "embed", "enc", "net", "wan"], edges: [...video, ...audio, ...delivery], controls: [...videoControls, ...audioControls, ...config("embed", { embed: true }), ...encoder("enc"), ...config("net", { "wan-link": "Up", "uplink-test": true })],
    objectives: [...videoGoals, audioObjective("pa", voices), o("embed", "มีภาพรายการและเสียงครบเข้าสู่ตัวเข้ารหัส", "signal", "signal", "embedded-audio", (c) => { const s = c.inp["enc:sdi-in"]; return { ok: s?.kind === "video" && s.content === c.view.sw?.picture && s.content !== "BLACK" && voices.every((v) => s.audio.includes(v)) && !c.view.embed?.clip, reason: "ตัวเข้ารหัสยังไม่มีภาพรายการพร้อมเสียงที่ถูกต้อง", fix: "ตรวจ PGM, สายเสียง L/R และการฝังเสียง" }; }, true), o("ingest", "ผู้ชมจำลองได้รับภาพและเสียงรายการ", "signal", "delivery", "wan", live("wan", "sw", voices), true)],
    faults: n === 4 ? [brokenLead(["fiberRx:sdi-out", "sw:sdi-in-3"]), fault("f-embed", "embed", "embed", false, true, "อุปกรณ์ฝังเสียงยังไม่เปิดการฝังรายการ")] : undefined,
    surprise: n === 5 ? [
      fault("s-embed", "embed", "embed", false, true, "การฝังเสียงรายการถูกปิดระหว่างซ้อม"),
      fault("s-fiber-rx-power", "fiberRx", "power", false, true, "ตัวรับใยแก้วของกล้องไกลไม่มีไฟเลี้ยง"),
      fault("s-audio-bus", "mix", "bc-fader", "Down", "Unity", "บัสเสียงออกอากาศถูกลดระดับ"),
      fault("s-camera-framing", "cam1", "framing", "Not framed", "Framed for assignment", "กล้องใกล้ยังไม่ได้จัดกรอบตามใบงาน"),
    ] : undefined,
    preflight: ["power-check", "cable-route", "ramp", "shelter", "soundcheck"], cues: ["A", "B", "C"].map((c, i) => ({ id: `cam-${i}`, call: `ออกภาพกล้อง ${c}`, expect: `CAM ${c}` })),
  });
}

function stadium(previous: StageManifest): StageManifest {
  const n = previous.level;
  const refs = ["R03", "R06", "R09", "R10", "R11", "R12", "R13", "R16", "R17"];
  const cameras = n === 1 ? [1] : [1, 2, 3, 4, 5, 6];
  // Blackmagic fiber workflow (option B): the player patches the camera's 12G-SDI OUT into the Camera Fiber Converter
  // mounted on it (short 12G-SDI lead, as supplied with the converter), runs the SMPTE hybrid fiber to the Studio Fiber
  // Converter, then on through the router. Nothing is pre-wired (L5 rule unchanged).
  const video: Pair[] = cameras.flatMap((i) => [[`cam${i}:sdi-out`, `cfc${i}:sdi-in`], [`cfc${i}:fiber`, `ccu${i}:fiber`], [`ccu${i}:sdi-out`, `router:in-${i}`], [`router:out-${i}`, `sw:sdi-in-${i}`]] as Pair[]);
  const videoDevices = cameras.flatMap((i) => [`cam${i}`, `cfc${i}`, `ccu${i}`]).concat(["router", "sw", "monitor"]);
  const audio: Pair[] = [["mic1:xlr-out", "stagebox:mic-in-1"], ["mic2:xlr-out", "stagebox:mic-in-2"], ["crowdL:xlr-out", "stagebox:mic-in-3"], ["crowdR:xlr-out", "stagebox:mic-in-4"], ["field:xlr-out", "stagebox:mic-in-5"], ["lav:out", "tx:mic-in"], ["rx:audio-out", "stagebox:mic-in-6"], ["stagebox:multicore", "tail:multicore"], ...[1, 2, 3, 4, 5, 6].map((i) => [`tail:tail-${i}`, `mix:in-${i}`] as Pair), ["mix:pa-l", "pa:line-in"], ["mix:bc-l", "sw:xlr-l"], ["mix:bc-r", "sw:xlr-r"]];
  const audioDevices = ["mic1", "mic2", "crowdL", "crowdR", "field", "lav", "tx", "rx", "stagebox", "tail", "mix", "pa", "sw"];
  const voices = ["COMMENTATOR 1", "COMMENTATOR 2", "CROWD LEFT", "CROWD RIGHT", "FIELD VOICE", "PRESENTER VOICE"];
  const audioControls = [...audioSettings([1, 2, 3, 4, 5, 6]), ...rf("tx", "rx"), ...config("crowdL", { windscreen: true }), ...config("crowdR", { windscreen: true }), ...config("sw", { "xlr-on": true, "emb-audio": "OFF" }), ...config("pa", { level: "Nominal", aim: "In front of the mic, aimed at audience" })];
  const videoControls = [...cameras.flatMap((i) => config("router", { [`xp-${i}`]: `IN ${i}` })), ...config("sw", { pgm: "SDI 1", "sdi-out-1": "PROGRAM", "sdi-out-2": "PROGRAM", "sdi-out-3": "PROGRAM", "sdi-out-4": "AUX", aux: "PROGRAM", "emb-audio": "OFF" })];
  const videoGoals = cameras.map((i) => o(`cam-${i}`, `ภาพกล้อง ${i} ผ่านชุดไฟเบอร์ และ Crosspoint ถึงเครื่องสลับภาพ`, "signal", "signal", "router-crosspoint", inputCarries(`sw:sdi-in-${i}`, `CAM ${i}`), true));
  if (n === 1) return build(previous, { title: "รับกล้องสนามผ่านฐานและเราเตอร์", ticket: "ต่อสายไฟเบอร์จาก Camera Fiber Converter ท้ายกล้อง 1 เข้า Studio Fiber Converter แล้ว Patch ผ่านเราเตอร์ไปเครื่องสลับภาพ", refs, devices: videoDevices, edges: [...video, monitorRoute], controls: videoControls, objectives: [...videoGoals, viewObjective("mv", "จอรวมภาพเห็นกล้องสนาม 1", "monitor", ["CAM 1"])] });
  if (n === 2) return build(previous, { title: "เสียงผู้บรรยายและเสียงสนาม", ticket: "ติดตั้งไมค์หกแหล่งผ่านมัลติคอร์ และแยกเสียง PA กับเสียงรายการ", refs, devices: audioDevices, edges: audio, controls: audioControls, objectives: [audioObjective("pa", voices), audioObjective("sw", voices)], preflight: ["power-check", "soundcheck", "cable-route"] });
  const sources: Pair[] = [["controller:control-out", "play:control-in"], ["play:sdi-out", "router:in-7"], ["gfx:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "router:in-8"], ["router:out-7", "sw:sdi-in-7"], ["router:out-8", "sw:sdi-in-8"]];
  const sourceControls = [...config("router", { "xp-7": "IN 7", "xp-8": "IN 8" }), ...config("controller", { cue: true }), ...config("play", { clip: true, play: true }), ...config("gfx", { template: "Scoreboard template (licensed)", score: "0–0" })];
  const cues = [...cameras.map((i) => ({ id: `cam-${i}`, call: `เตรียมและออกภาพกล้อง ${i}`, expect: `CAM ${i}` })), { id: "replay", call: "ออกภาพซ้ำจากแผงควบคุม", expect: "REPLAY" }, { id: "gfx", call: "ออกกราฟิกคะแนน", expect: "SCOREBOARD" }];
  const sourcesGoal = [o("replay", "ภาพซ้ำถูกสั่งเล่นและผ่านเราเตอร์เข้าช่อง 7", "signal", "signal", "router-crosspoint", inputCarries("sw:sdi-in-7", "REPLAY"), true), o("gfx", "กราฟิกผ่านตัวแปลงที่มีไฟและเราเตอร์เข้าช่อง 8", "signal", "signal", "converter-direction", inputCarries("sw:sdi-in-8", "SCOREBOARD"), true)];
  const delivery: Pair[] = [["sw:sdi-out-1", "enc:sdi-in"], ["sw:sdi-out-2", "enc2:sdi-in"], ["sw:sdi-out-3", "rec:sdi-in"], ["sw:sdi-out-4", "display:sdi-in"], ["enc:eth", "net:lan-1"], ["net:wan", "wan:wan-in"], ["enc2:eth", "net2:lan-1"], ["net2:wan", "wan2:wan-in"]];
  if (n === 3) return build(previous, { title: "หกกล้อง ภาพซ้ำ และกราฟิก", ticket: "Patch แหล่งภาพแปดแหล่งผ่านเราเตอร์ แล้วควบคุม Preview / Program / Multiview", refs, devices: [...videoDevices, "play", "controller", "gfx", "convHS"], edges: [...video, ...sources, monitorRoute], controls: [...videoControls, ...sourceControls], objectives: [...videoGoals, ...sourcesGoal, viewObjective("mv", "จอรวมภาพเห็นทั้งหกกล้อง", "monitor", cameras.map((i) => `CAM ${i}`))], cues });
  return build(previous, { title: n === 4 ? "ซ่อมเส้นทางภาพเสียงและชุดส่งสำรอง" : "ถ่ายทอดสนามกีฬาครบระบบ", ticket: "ประกอบหกกล้อง ภาพซ้ำ กราฟิก เสียง PA/รายการ บันทึก และชุดส่งหลัก/สำรองผ่านเครือข่ายแยก", refs, devices: [...videoDevices, ...audioDevices, "play", "controller", "gfx", "convHS", "enc", "enc2", "net", "net2", "wan", "wan2", "rec", "display"], edges: [...video, ...sources, monitorRoute, ...audio, ...delivery], controls: [...videoControls, ...audioControls, ...sourceControls, ...encoder("enc"), ...encoder("enc2"), ...config("rec", { media: "SD card mounted (512 GB free)", record: true })],
    objectives: [...videoGoals, ...sourcesGoal, audioObjective("pa", voices), audioObjective("sw", voices), o("venue", "จอสนามได้รับภาพรายการสะอาดจาก AUX", "signal", "signal", "output-assign", mirrorsProgram("display", "sw"), true), o("record", "เครื่องบันทึกได้รับภาพรายการและกำลังบันทึก", "evidence", "delivery", "storage", (c) => ({ ok: c.view.rec?.recording === true && c.view.rec.picture === c.view.sw?.picture && voices.every((v) => c.inp["rec:sdi-in"]?.kind === "video" && c.inp["rec:sdi-in"].audio.includes(v)), reason: "ยังไม่บันทึกภาพรายการพร้อมเสียงครบ" }), true), o("main", "ผู้ชมรับภาพและเสียงผ่านเครือข่ายหลัก", "signal", "delivery", "wan", live("wan", "sw", voices), true), o("backup", "ผู้ชมสำรองรับภาพและเสียงผ่านเครือข่ายสำรอง", "signal", "delivery", "wan", live("wan2", "sw", voices), true), o("separate", "สองชุดส่งใช้พอร์ตและเกตเวย์คนละเส้นทาง", "config", "delivery", "wan", all(edge("sw:sdi-out-1", "enc:sdi-in"), edge("sw:sdi-out-2", "enc2:sdi-in"), edge("enc:eth", "net:lan-1"), edge("enc2:eth", "net2:lan-1")), true)],
    faults: n === 4 ? [fault("f-crosspoint", "router", "xp-1", "IN 2", "IN 1", "Crosspoint ของกล้อง 1 เลือกแหล่งผิด"), brokenLead(["sw:sdi-out-2", "enc2:sdi-in"])] : undefined,
    surprise: n === 5 ? [
      fault("s-broadcast", "mix", "bc-fader", "Down", "Unity", "บัสเสียงรายการถูกลดลง"),
      fault("s-ccu-power", "ccu3", "power", false, true, "Studio Fiber Converter ของกล้อง 3 ไม่มีไฟเลี้ยง กล้องจึงไม่ได้รับไฟผ่านไฟเบอร์"),
      fault("s-router-crosspoint", "router", "xp-1", "IN 2", "IN 1", "เราเตอร์ส่งกล้องผิดเข้าช่อง 1"),
      fault("s-replay-control", "controller", "cue", false, true, "แผงควบคุมภาพซ้ำยังไม่ส่งคำสั่งเล่น"),
    ] : undefined,
    preflight: ["power-check", "cable-route", "soundcheck", "storage", "sightlines"], cues,
  });
}

function auditorium(previous: StageManifest): StageManifest {
  if (previous.level !== 2 && previous.level !== 5) return previous;
  const full = previous.level === 5;
  const keep = previous.solution.filter(([from, to]) => !["hand", "lav", "tx", "rx", "podium", "stagebox", "tail", "mix", "paL", "paR"].includes(from.split(":")[0]) && !["mix", "tx"].includes(to.split(":")[0]));
  const audio: Pair[] = [["podium:xlr-out", "stagebox:mic-in-1"], ["hrx1:audio-out", "stagebox:mic-in-2"], ...((full ? [["hrx2:audio-out", "stagebox:mic-in-3"], ["rx1:audio-out", "stagebox:mic-in-4"], ["rx2:audio-out", "stagebox:mic-in-5"], ["lav1:out", "tx1:mic-in"], ["lav2:out", "tx2:mic-in"]] : []) as Pair[]), ["stagebox:multicore", "tail:multicore"], ...(full ? [1, 2, 3, 4, 5] : [1, 2]).map((i) => [`tail:tail-${i}`, `mix:in-${i}`] as Pair), ["mix:pa-l", "paL:line-in"], ["mix:pa-r", "paR:line-in"], ["mix:bc-l", "sw:xlr-l"], ["mix:bc-r", "sw:xlr-r"]];
  const oldAudio = new Set(["hand", "lav", "tx", "rx"]);
  const devices = previous.devices.filter((id) => !oldAudio.has(id)).concat(["hand1", "hrx1", ...(full ? ["hand2", "hrx2", "lav1", "lav2", "tx1", "tx2", "rx1", "rx2"] : [])]);
  const voices = ["PODIUM VOICE", "HANDHELD 1 VOICE", ...(full ? ["HANDHELD 2 VOICE", "LAV 1 VOICE", "LAV 2 VOICE"] : [])];
  const controls = previous.solutionConfig.filter((s) => !["hand", "lav", "tx", "rx", "mix"].includes(s.device)).concat(audioSettings(full ? [1, 2, 3, 4, 5] : [1, 2]), rf("hand1", "hrx1"), ...(full ? [rf("hand2", "hrx2"), rf("tx1", "rx1"), rf("tx2", "rx2")] : []));
  const originalGoals = previous.objectives.filter((p) => !["installed", "powered", "channel-map", "cues", "no-black", "quiz", "signoff", "room", "obs", "recovered"].includes(p.id) && !p.id.startsWith("pre-") && !["mute", "group-bus", "feedback"].includes(p.concept));
  return build(previous, { title: full ? "หอประชุมพร้อมภาพเสียงและบันทึกครบระบบ" : "ไมค์เวทีผ่านมัลติคอร์และสองบัส", ticket: previous.ticket, refs: ["R02", "R08", "R10", "R11", "R12", "R14"], devices, edges: [...keep, ...audio], controls, objectives: [...originalGoals, audioObjective("paL", voices), audioObjective("paR", voices), ...(full ? [o("obs-full", "OBS รับภาพรายการพร้อมเสียงวิทยากรครบห้าแหล่ง", "signal", "delivery", "embedded-audio", all(mirrorsProgram("host", "sw"), hears("host", voices)), true)] : [audioObjective("sw", voices)])], preflight: previous.preflight, cues: previous.cues, surprise: previous.surpriseFaults });
}

export function reconcileStage(stage: StageManifest): StageManifest {
  if (stage.room === "xs" && stage.level === 3) {
    return { ...stage, topologyId: "appendix-a-xs-3-v1", researchStatus: "DESIGN_REFERENCE", appendixReferenceIds: ["R01", "R04"],
      devices: [...stage.devices, "host"], solution: [...stage.solution, ["sw:usb", "host:usb-1"]],
      solutionConfig: [...stage.solutionConfig, ...config("host", { power: true, "video-src": "USB video capture device", "audio-src": "None" })],
      ticket: "สลับกล้องกับสไลด์ขึ้นจอห้องเรียน และตรวจภาพรายการเดียวกันใน OBS ผ่าน USB Webcam",
      objectives: [...stage.objectives, o("webcam-installed", "ติดตั้งคอมพิวเตอร์และสาย USB DEVICE → HOST", "signal", "physical", "usb-role", all(placedAll(["host"]), poweredAll(["host"]), edge("sw:usb", "host:usb-1")), true), o("webcam-picture", "OBS รับภาพ PROGRAM เดียวกับจอห้องเรียน", "signal", "signal", "obs-source", mirrorsProgram("host", "sw"), true)],
    };
  }
  if (stage.room === "l") return outdoor(stage);
  if (stage.room === "xl") return stadium(stage);
  if (stage.room === "m") return auditorium(stage);
  return { ...stage, topologyId: `appendix-a-${stage.room}-${stage.level}-v1`, researchStatus: stage.room === "s" ? "PROVISIONAL" : "DESIGN_REFERENCE", appendixReferenceIds: stage.room === "s" ? ["R04", "R05", "R08", "R11"] : ["R01", "R04", "R10", "R11"], unresolvedHardware: stage.room === "s" ? ["กล้องสตูดิโอและ HDS7105 revision/แผงหลังยังไม่ยืนยัน ใช้โปรไฟล์ฝึกเดิม", "RX แยกสองเครื่องเป็นโมเดลฝึก ไม่อ้างว่า COMICA 2TX/1RX แยกเสียงได้", "หัว USB ฝั่ง Capture จริงยังต้องยืนยันก่อนทำโมเดลสินค้า"] : [] };
}
