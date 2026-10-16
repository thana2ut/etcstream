import type { ControlValue, Cue, ExtraCable, FaultScenario, ObjectivePredicate, Quiz, StageManifest } from "./types";
import type { EvalContext } from "./types";
import {
  masked, all, cfgIs, cfgNot, CONCEPTS, cuesDone, edge, evidence, faultsRecovered, hears, historyHas, inputCarries, live, mirrorsProgram, noBlackAfterStart,
  noCableProblems, noFeedback, notShows, o, placedAll, quizOk, recording, shows, showsAll, signedOff, site,
} from "./library";
import { MODELS } from "./equipment";
import { ROOMS } from "./rooms";

/* ═════════════ preflight vocabulary (site/stage checklist, English) ═════════════ */
export const PREFLIGHT: Record<string, string> = {
  "power-check": "Low-risk power check done (labelled supply; no mains work)",
  format: "Chain format confirmed: 1080p50 · Rec.709 · 48 kHz",
  legible: "Slide/text legibility checked from the back row",
  "cable-route": "Cables routed along walls/trays; nothing across aisles or public paths",
  licensed: "Content is open/licensed teaching or graphics material (no HDCP)",
  soundcheck: "Soundcheck: test phrase at speaking level, headroom kept",
  clap: "Clap/slate test done for lip sync",
  storage: "Storage checked: mounted, free space, test file",
  permission: "Private test key & permission confirmed (redacted; no public stream)",
  shelter: "Electronics in a rated dry shelter; connectors raised off wet ground",
  "power-signoff": "Qualified technician signed off protected (RCD/GFCI) temporary supply — rules depend on jurisdiction",
  ramp: "Covered cable ramp placed at the public crossing",
  "rating-chart": "Cable-rating chart checked against measured runs",
  fallback: "Fallback network plan documented (only physically provided paths)",
  rights: "Match permission / broadcast-rights flag confirmed (simulation)",
  crew: "Crew positions and call sheet confirmed",
  comms: "Director call / tally cue system tested (simulated)",
  sightlines: "Camera sightlines and tripod clearance checked; no pitch-side hazards",
  holding: "Spare source / holding slate ready",
  "mic-place": "Mics at mouth height, aimed away from loudspeakers",
  wind: "Wind protection fitted on exposed mics",
  privacy: "Spectator privacy signage checked",
  risk: "Risk assessment completed",
  lighting: "Lighting balanced with the virtual controls (supervised fixtures)",
  handover: "Crew handover sheet completed",
  teardown: "Teardown plan: power down, coil, case",
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
    o("installed", "All job equipment installed at its station", "safety", "physical", "safety", placedAll(required)),
    o("powered", "All active equipment passes the power check", "config", "physical", "power", (c: EvalContext) => {
      const off = needPower.filter((d) => !c.view[d]?.powered);
      return off.length ? { ok: false, reason: `No power: ${off.map((d) => ROOMS[room].instances[d].label).join(", ")}`, fix: "Run the power check on each device (abstracted supply)." } : { ok: true };
    }),
    o("channel-map", "Patch matches the documented channel map", "signal", "physical", "direction", (c: EvalContext) => {
      // A documented fallback (pre-tested secondary gateway during a locked ISP outage) legitimately replaces the primary WAN patch.
      const outage = (d: string) => String(c.cfg(d, "wan-link") ?? "").startsWith("Down");
      const missing = s.solution.filter(([f, t]) => !c.edges.some((e) => e.from === f && e.to === t) && !outage(f.split(":")[0]) && !outage(t.split(":")[0]));
      if (!missing.length) return { ok: true };
      return cert ? { ok: false, reason: `${missing.length} documented patch point(s) not as required by the job`, fix: "Compare your patch plan with the job's required graph." }
        : { ok: false, reason: `Missing: ${missing.map(([f, t]) => `${f} → ${t}`).join("; ")}`, fix: "Patch each output to its documented input." };
    }, cert),
    ...preflight.map((k) => o(`pre-${k}`, PREFLIGHT[k], "safety", "physical", k.includes("power") ? "power" : "safety", site(k, PREFLIGHT[k]), ["ramp", "shelter", "power-signoff"].includes(k))),
    ...(s.cues.length ? [o("cues", `Run-of-show: ${s.cues.length} cue(s) taken on call`, "evidence", "rehearsal", "output-assign", cuesDone(), cert), o("no-black", "No black Program during the rehearsal", "quality", "rehearsal", "output-assign", noBlackAfterStart())] : []),
    o("quiz", "Mini mastery check", "evidence", "delivery", s.quiz ? "direction" : "direction", quizOk()),
    o("signoff", "Sign-off and post-event wrap", "evidence", "delivery", "safety", signedOff(), true),
  ];
  return { ...s, room, preflight, objectives: [...s.obj, ...common] };
}

function cables(...xs: [string, string, [ExtraCable["ends"][0], ExtraCable["ends"][1]], number, number?][]): ExtraCable[] {
  return xs.map(([id, label, ends, lengthM, ratedM]) => ({ id, label, ends, lengthM, ratedM }));
}

/* ══════════════════════════ ROOM 01 · CLASSROOM (ATEM Mini Pro ISO) ══════════════════════════ */
function classroom(): StageManifest[] {
  CURRENT_ROOM = "xs";
  const room = "xs" as const;
  const L1 = finish(room, {
    id: "CL-01", level: 1, title: "Wake the First Image", subtitle: "Guided · laptop to projector through the switcher", guidance: "guided", minutes: "10–12 min",
    ticket: "Show the lesson laptop on the classroom screen — and never the operator multiview.",
    callSheet: ["Operator (you): AV desk, rear right", "Teacher: lectern, laptop on the teacher desk", "Stage manager: front of room"],
    briefing: ["Find the laptop's HDMI OUT — signal leaves here.", "Patch it to ATEM HDMI IN 1. Inputs receive.", "ATEM has ONE HDMI OUT: set it to PROGRAM, then cable it to the projector HDMI IN.", "Power each device, select the projector's input and take HDMI 1 to Program."],
    devices: ["slides", "sw", "monitor"],
    solution: [["slides:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-out", "monitor:hdmi-in-1"]],
    extraCables: cables(["x-hdmi", "HDMI 2 m (spare)", ["HDMI", "HDMI"], 2]),
    solutionConfig: [...powerAll(["slides", "sw", "monitor"]), ...C("slides", { present: true }), ...C("sw", { pgm: "HDMI 1", "hdmi-out": "PROGRAM" }), ...C("monitor", { source: "HDMI 1" }), ...C("site", { "power-check": true, format: true, legible: true })],
    cues: [cue("c1", "Stand by slides … TAKE HDMI 1", "SLIDES")],
    obj: [
      o("proj-slides", "Projector shows the live slide", "signal", "signal", "direction", shows("monitor", "SLIDES", "Projector"), true),
      o("no-mv", "Audience never sees the multiview grid", "signal", "signal", "one-output", notShows("monitor", "MULTIVIEW", "The projector shows the MULTIVIEW grid.", "Set ATEM HDMI OUT to PROGRAM."), true),
      o("out-pgm", "ATEM HDMI OUT set to PROGRAM", "config", "signal", "one-output", cfgIs("sw", "hdmi-out", "PROGRAM", "ATEM Software Control → Output → HDMI OUT = PROGRAM.")),
      o("proj-input", "Projector input = HDMI 1", "config", "signal", "output-assign", cfgIs("monitor", "source", "HDMI 1", "Select HDMI 1 on the projector.")),
    ],
    preflight: ["power-check", "format", "legible"],
    quiz: quiz("direction"), reward: "HDMI Port Codex",
    passCriteria: ["Exact live slide on the projected surface", "HDMI OUT = PROGRAM (no multiview to the audience)", "Laptop → IN 1 → OUT → projector"],
  });
  const L2 = finish(room, {
    id: "CL-02", level: 2, title: "The Teacher Appears", subtitle: "Guided · two sources, clean cuts", guidance: "partial", minutes: "12–15 min",
    ticket: "Show the instructor and cut to a slide without ever cutting to black.",
    callSheet: ["Camera: tripod by the window, framing the lectern", "Laptop moves to HDMI IN 2", "Projector keeps PROGRAM"],
    briefing: ["The laptop chain is partly wired — on the wrong input for today's plan.", "Camera to IN 1, laptop to IN 2. Name the inputs.", "Camera mic and laptop sounds both ride on HDMI — don't let both reach Program."],
    devices: ["cam1", "slides", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["sw:hdmi-out", "monitor:hdmi-in-1"]],
    prewired: [["slides:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-out", "monitor:hdmi-in-1"]],
    startConfig: [...powerAll(["slides", "sw", "monitor"]), ...C("slides", { present: true }), ...C("sw", { "hdmi-out": "PROGRAM", pgm: "HDMI 1" }), ...C("monitor", { source: "HDMI 1" })],
    solutionConfig: [...powerAll(["cam1"]), ...C("cam1", { framing: "Framed for assignment", clean: true }), ...C("sw", { labels: true, "emb-audio": "AFV" }), ...C("slides", { "mute-audio": true }), ...C("site", { format: true })],
    cues: [cue("c1", "Teacher opens … TAKE camera", "TEACHER CAM"), cue("c2", "Slide 1 … TAKE slides", "SLIDES"), cue("c3", "Back to teacher … TAKE camera", "TEACHER CAM")],
    obj: [
      o("in1-cam", "HDMI IN 1 = teacher camera", "signal", "signal", "direction", inputCarries("sw:hdmi-in-1", "TEACHER CAM"), true),
      o("in2-slides", "HDMI IN 2 = slides", "signal", "signal", "direction", inputCarries("sw:hdmi-in-2", "SLIDES"), true),
      o("proj-pgm", "Projector mirrors Program", "signal", "signal", "one-output", mirrorsProgram("monitor", "sw"), true),
      o("clean", "Camera sends a clean feed, framed on the lectern", "config", "signal", "output-assign", all(cfgIs("cam1", "clean", true, "Turn off camera overlays (clean feed)."), cfgIs("cam1", "framing", "Framed for assignment", "Frame the teacher at the lectern."))),
      o("labels", "Inputs named CAM / SLIDES", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Name the inputs.")),
      o("no-double", "No duplicated source audio (camera mic + laptop sounds)", "quality", "signal", "afv-doubling", all(cfgNot("sw", "emb-audio", "ON", "Set HDMI source audio to AFV or OFF."), cfgIs("slides", "mute-audio", true, "Mute the laptop's system sounds."))),
      o("cuts", "Two or more intentional correct cuts", "evidence", "rehearsal", "output-assign", historyHas(["TEACHER CAM", "SLIDES"])),
    ],
    preflight: ["format"], quiz: quiz("afv-doubling"), reward: "Camera Framing Skill",
    passCriteria: ["Camera and slides both live", "Two intentional correct cuts, projector mirrors Program", "No black output during rehearsal"],
  });
  const L3 = finish(room, {
    id: "CL-03", level: 3, title: "Written Under the Lantern", subtitle: "Scenario · three-source lecture", guidance: "scenario", minutes: "15–18 min",
    ticket: "Teach with a camera, slides and a document camera — every word readable.",
    callSheet: ["HDMI IN 1 teacher · IN 2 slides · IN 3 document camera", "Document camera from the storage cabinet, right of the teacher desk"],
    briefing: ["Some leads in the kit are not what they look like.", "Camera audio should stay live on slides — think before using AFV."],
    devices: ["cam1", "slides", "doc", "sw", "monitor"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["doc:hdmi-out", "sw:hdmi-in-3"], ["sw:hdmi-out", "monitor:hdmi-in-1"]],
    extraCables: cables(["x-sdi", "3G-SDI BNC lead 2 m (SDI only)", ["SDI", "SDI"], 2]),
    startConfig: [...powerAll(["slides", "sw", "monitor"]), ...C("slides", { present: true }), ...C("sw", { "hdmi-out": "PROGRAM" })],
    solutionConfig: [...powerAll(["cam1", "doc"]), ...C("cam1", { framing: "Framed for assignment", clean: true }), ...C("doc", { framing: "Book page framed, no shadow" }), ...C("sw", { labels: true, "emb-audio": "ON", pgm: "HDMI 1" }), ...C("slides", { "mute-audio": true }), ...C("monitor", { source: "HDMI 1" }), ...C("site", { "cable-route": true, licensed: true, legible: true })],
    cues: [cue("c1", "Teacher … TAKE 1", "TEACHER CAM"), cue("c2", "Slide … TAKE 2", "SLIDES"), cue("c3", "Book page close-up … TAKE 3", "DOC CAM"), cue("c4", "Back to teacher … TAKE 1", "TEACHER CAM")],
    obj: [
      o("in1", "IN 1 = teacher", "signal", "signal", "direction", inputCarries("sw:hdmi-in-1", "TEACHER CAM"), true),
      o("in2", "IN 2 = slides", "signal", "signal", "direction", inputCarries("sw:hdmi-in-2", "SLIDES"), true),
      o("in3", "IN 3 = document camera", "signal", "signal", "direction", inputCarries("sw:hdmi-in-3", "DOC CAM"), true),
      o("proj-pgm", "Projector mirrors Program", "signal", "signal", "one-output", mirrorsProgram("monitor", "sw")),
      o("doc-frame", "Book page framed shadow-free and readable", "quality", "signal", "output-assign", cfgIs("doc", "framing", "Book page framed, no shadow", "Position the document camera under even light.")),
      o("voice-live", "Teacher voice (camera mic) stays live on slide and document shots", "quality", "signal", "afv-doubling", all(cfgIs("sw", "emb-audio", "ON", "With AFV the camera mic drops out on slides: keep camera audio ON."), cfgIs("slides", "mute-audio", true, "Mute laptop system sounds."))),
      o("labels", "Inputs labelled", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Name the inputs.")),
    ],
    preflight: ["cable-route", "licensed", "legible"], quiz: quiz("connector"), reward: "Lantern Scholar",
    passCriteria: ["Exact source identity on IN 1/2/3", "Sequence teacher → slide → document → teacher", "No cable across the aisle; no HDCP content"],
  });
  const L4 = finish(room, {
    id: "CL-04", level: 4, title: "The Vanished Voice", subtitle: "Disruption · OBS workstation fault-finding", guidance: "disruption", minutes: "18–22 min",
    ticket: "Deliver the remote classroom feed through OBS. Students hear nothing and lips are out of sync — fix it.",
    callSheet: ["USB-workstation variant: ATEM USB-C → OBS host (webcam). NO disk on the ATEM.", "SM58 → MG12XU CH1 → MG12XU USB → same OBS host (audio)", "Projector stays on PROGRAM"],
    briefing: ["Several deterministic faults are seeded. Trace each destination; don't guess cables.", "Clap test: measure the offset, then set the OBS audio sync."],
    devices: ["cam1", "slides", "sw", "mic", "mix", "host", "monitor", "net", "wan"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["sw:hdmi-out", "monitor:hdmi-in-1"], ["mic:xlr-out", "mix:mic-1"], ["mix:usb", "host:usb-2"], ["sw:usb", "host:usb-1"], ["host:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]],
    prewired: "all",
    startConfig: [...powerAll(["cam1", "slides", "sw", "mix", "host", "monitor", "net"]), ...C("cam1", { framing: "Framed for assignment", clean: true }), ...C("slides", { present: true, "mute-audio": true }),
      ...C("sw", { pgm: "HDMI 1", "hdmi-out": "PROGRAM", "usb-mode": "Webcam output", "emb-audio": "OFF", labels: true }),
      ...C("mix", { "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "st-fader": "Unity" }),
      ...C("host", { "video-src": "USB video capture device", "audio-src": "USB audio interface (mixer)", "stream-key": "•••••••• (private test key)" }), ...C("monitor", { source: "HDMI 1" })],
    faults: [
      cfgFault("f-mute", "Mixer CH1 muted", "mute", "mix", "ch1-on", false, 1),
      unplugFault("f-usb", "Capture USB unplugged", "usb-role", ["sw:usb", "host:usb-1"], 2),
      cfgFault("f-obs-audio", "Wrong OBS audio device (built-in mic)", "obs-source", "host", "audio-src", "Built-in laptop mic", 3),
      cfgFault("f-extra-mic", "Extra desktop mic enabled in OBS", "obs-source", "host", "extra-mic", true, 3),
      unplugFault("f-endpoint", "Stream endpoint unavailable (uplink unplugged)", "wan", ["net:wan", "wan:wan-in"], 5),
    ],
    solutionConfig: [...C("mix", { "ch1-on": true }), ...C("host", { "audio-src": "USB audio interface (mixer)", "extra-mic": false, sync: "+80 ms", stream: true, record: true }), ...C("site", { clap: true, permission: true })],
    cues: [cue("c1", "Teacher … TAKE 1", "TEACHER CAM"), cue("c2", "Slides … TAKE 2", "SLIDES"), cue("c3", "Teacher … TAKE 1", "TEACHER CAM")],
    obj: [
      o("viewer", "Local test viewer: live picture + teacher voice", "signal", "delivery", "obs-source", live("wan", "sw", ["TEACHER VOICE"]), true),
      o("obs-audio", "OBS uses ATEM USB video + Yamaha USB audio only", "config", "signal", "obs-source", all(cfgIs("host", "video-src", "USB video capture device", "Select the ATEM USB webcam as OBS video."), cfgIs("host", "audio-src", "USB audio interface (mixer)", "Select the Yamaha USB audio interface."), cfgIs("host", "extra-mic", false, "Disable the extra desktop mic."))),
      o("sync", "Lip sync within ±40 ms (clap test)", "quality", "signal", "obs-source", (c) => ((c.view.host as { syncErr?: number })?.syncErr ?? 999) <= 40 ? { ok: true } : { ok: false, reason: c.view.host?.problem?.text ?? "Out of sync", fix: "Set OBS audio sync to the measured video latency (+80 ms)." }, true),
      o("no-disk", "USB-C used as webcam only (no disk in this variant)", "config", "physical", "usb-role", cfgIs("sw", "usb-mode", "Webcam output", "USB-C must stay in Webcam mode for the OBS workstation variant.")),
      o("proj-pgm", "Projector keeps PROGRAM", "signal", "signal", "one-output", mirrorsProgram("monitor", "sw")),
      o("recovered", "All seeded faults diagnosed and recovered", "diagnostics", "delivery", "obs-source", faultsRecovered(), true),
      o("obs-rec", "60-second local OBS test recording saved", "evidence", "delivery", "storage", evidence("OBS", "OBS local recording stopped cleanly")),
    ],
    preflight: ["clap", "permission"], quiz: quiz("obs-source"), reward: "Diagnostic Crest",
    passCriteria: ["Speech heard on the local test viewer, lips in sync", "Active capture and readable slide", "Every seeded fault isolated and restored"],
  });
  const L5 = finish(room, {
    id: "CL-05", level: 5, title: "Classroom Practical Certification", subtitle: "Certification · hybrid lesson from storage to sign-off", guidance: "certification", minutes: "25–35 min",
    ticket: "Prepare and operate a real hybrid lesson: teacher, slide deck and handout, audio, local projection, ISO recording and a private mock livestream.",
    callSheet: ["All equipment starts loose in storage", "Hardware-streaming/SSD workflow (no OBS USB webcam in this variant)", "Run-of-show: title → teacher → slides → document → Q&A teacher"],
    briefing: ["No hints. Plan the patch yourself. Stream only after sound and picture rehearsal pass.", "One unknown fault will appear after the rehearsal."],
    devices: ["cam1", "slides", "doc", "sw", "mic", "mix", "adapt", "monitor", "ssd", "net", "wan", "host", "mon2"],
    decoys: ["host", "mon2"],
    solution: [["cam1:hdmi-out", "sw:hdmi-in-1"], ["slides:hdmi-out", "sw:hdmi-in-2"], ["doc:hdmi-out", "sw:hdmi-in-3"], ["mic:xlr-out", "mix:mic-1"], ["mix:st-l", "adapt:in-l"], ["mix:st-r", "adapt:in-r"], ["adapt:out", "sw:mic-1"], ["sw:hdmi-out", "monitor:hdmi-in-1"], ["sw:eth", "net:lan-1"], ["net:wan", "wan:wan-in"], ["sw:usb", "ssd:usb"]],
    extraCables: cables(["x-hdmi", "HDMI 3 m (spare)", ["HDMI", "HDMI"], 3], ["x-xlr35", "XLR(F) → 3.5 mm stereo lead (unpadded)", ["XLR-F", "3.5mm"], 3], ["x-usbca", "USB-C → USB-A data lead", ["USB-C", "USB-A"], 2], ["x-xlr", "XLR 5 m (spare)", ["XLR-F", "XLR-M"], 5]),
    solutionConfig: [...powerAll(["cam1", "slides", "doc", "sw", "mix", "monitor", "net"]), ...C("cam1", { framing: "Framed for assignment", clean: true }), ...C("doc", { framing: "Book page framed, no shadow" }), ...C("slides", { present: true, "mute-audio": true }),
      ...C("mix", { "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch1-hpf": true, "st-fader": "Unity" }), ...C("adapt", { atten: "−12 dB (+4 dBu → −10 dBV)" }),
      ...C("sw", { "hdmi-out": "PROGRAM", "mic1-mode": "LINE", "mic1-on": true, "emb-audio": "OFF", labels: true, pgm: "HDMI 2", "usb-mode": "Record to disk", "stream-key": "•••••••• (private test key)", stream: true, record: true }),
      ...C("ssd", { state: "Mounted · 412 GB free" }), ...C("monitor", { source: "HDMI 1" }), ...C("net", { "uplink-test": true }),
      ...C("site", { "power-check": true, format: true, "cable-route": true, soundcheck: true, storage: true, permission: true, licensed: true, risk: true, teardown: true })],
    surpriseFaults: [
      cfgFault("s-route", "ATEM output routed to MULTIVIEW", "one-output", "sw", "hdmi-out", "MULTIVIEW", 3),
      cfgFault("s-level", "ATEM MIC 1 level mismatched (MIC)", "consumer-level", "sw", "mic1-mode", "MIC", 1),
      unplugFault("s-wan", "WAN missing", "wan", ["net:wan", "wan:wan-in"], 5),
      cfgFault("s-full", "SSD full", "storage", "ssd", "state", "Mounted · FULL (0 GB free)", 4),
      cfgFault("s-mute", "Microphone muted", "mute", "mix", "ch1-on", false, 1),
      cfgFault("s-afv", "Duplicate camera sound (embedded ON)", "afv-doubling", "sw", "emb-audio", "ON", 1),
    ],
    cues: [cue("c1", "Title slide … TAKE slides", "SLIDES"), cue("c2", "Teacher welcome … TAKE camera", "TEACHER CAM"), cue("c3", "Slides", "SLIDES"), cue("c4", "Handout close-up … document camera", "DOC CAM"), cue("c5", "Q&A … teacher", "TEACHER CAM")],
    obj: [
      o("three-live", "All three HD sources live on their inputs", "signal", "signal", "direction", all(inputCarries("sw:hdmi-in-1", "TEACHER CAM"), inputCarries("sw:hdmi-in-2", "SLIDES"), inputCarries("sw:hdmi-in-3", "DOC CAM")), true),
      o("speech", "Speech audible, no clipping or duplication (Program)", "quality", "signal", "consumer-level", hears("sw", ["TEACHER VOICE"]), true),
      o("proj", "Projector shows PROGRAM (not multiview)", "signal", "signal", "one-output", all(mirrorsProgram("monitor", "sw"), notShows("monitor", "MULTIVIEW", "Projector shows multiview.", "HDMI OUT = PROGRAM.")), true),
      o("viewer", "Private stream monitor shows current Program + voice", "signal", "delivery", "wan", live("wan", "sw", ["TEACHER VOICE"]), true),
      o("iso", "ISO + Program recording to mounted SSD", "evidence", "delivery", "storage", recording("ssd", "ISO ×3"), true),
      o("iso-saved", "Recording stopped cleanly, files saved", "evidence", "delivery", "storage", evidence("ssd · ", "SSD files closed")),
      o("no-early", "Went on air only after the rehearsal passed", "safety", "delivery", "stream-key", (c) => c.sim.log.some((l) => l.code === "EARLY_STREAM") ? { ok: false, reason: "Stream started before the rehearsal passed", fix: "Rehearse sound and picture first." } : { ok: true }),
      o("recovered", "Unknown fault diagnosed and recovered", "diagnostics", "delivery", "direction", faultsRecovered(), true),
    ],
    preflight: ["power-check", "format", "cable-route", "soundcheck", "storage", "permission", "licensed", "risk", "teardown"], quiz: quiz("consumer-level"), reward: "Gate-of-Images Mastery",
    passCriteria: ["All three live HD sources", "Understandable speech without clipping or duplication", "Projector shows PGM (not multiview)", "Private stream shows current PGM", "ISO/PGM files saved", "Safety & soundcheck complete", "Seeded fault recovered", "Clean sign-off"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 02 · STUDIO (ATEM TV Studio HD8 ISO) ══════════════════════════ */
function studio(): StageManifest[] {
  CURRENT_ROOM = "s";
  const room = "s" as const;
  const camsOk = (ids: string[]) => ids.flatMap((d) => C(d, { power: true, format: "1080p50", framing: "Framed for assignment" }));
  const mixer = (chs: number[]) => [...C("mix", { power: true, "st-fader": "Unity" }), ...chs.flatMap((n) => C("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, [`ch${n}-st`]: true, [`ch${n}-hpf`]: true }))];
  const L1 = finish(room, {
    id: "ST-01", level: 1, title: "Hear the Voice", subtitle: "Guided · single mic to the mixer", guidance: "guided", minutes: "10–12 min",
    ticket: "Make the host's spoken voice clear at the mixer.",
    callSheet: ["Host: interview set, SM58 on a stand", "Audio operator (you): production desk"],
    briefing: ["SM58 XLR OUT is MIC level; MG12XU CH1 has the preamp.", "A dynamic SM58 needs no phantom power.", "GAIN first (speak the test phrase), then ON, ST assign and master. Headphones on PHONES."],
    devices: ["micH", "mix", "phones"],
    solution: [["micH:xlr-out", "mix:mic-1"], ["mix:phones", "phones:in"]],
    extraCables: cables(["x-hdmi", "HDMI 2 m", ["HDMI", "HDMI"], 2]),
    solutionConfig: [...mixer([1]), ...C("micH", { aim: "At talker's mouth" }), ...C("site", { soundcheck: true, "mic-place": true })],
    cues: [],
    obj: [
      o("meter", "Stereo meter shows the host voice", "signal", "signal", "mic-line-level", hears("mix", ["HOST VOICE"]), true),
      o("phones", "Headphones hear the host voice", "signal", "signal", "speaker-level", hears("phones", ["HOST VOICE"]), true),
      o("hpf", "High-pass filter set conservatively", "config", "signal", "clipping", cfgIs("mix", "ch1-hpf", true, "Engage the 80 Hz HPF.")),
      o("aim", "Mic aimed at the mouth", "quality", "signal", "feedback", cfgIs("micH", "aim", "At talker's mouth", "Aim the capsule at the talker.")),
      o("test-phrase", "Test phrase heard without clipping", "evidence", "rehearsal", "clipping", all(site("soundcheck", PREFLIGHT.soundcheck), hears("phones", ["HOST VOICE"]))),
    ],
    preflight: ["soundcheck", "mic-place"], quiz: quiz("mic-line-level"), reward: "First Echo Seal",
    passCriteria: ["Voice on the stereo meter and headphones", "No red clipping, no howl", "Mic aimed at the mouth"],
  });
  const L2 = finish(room, {
    id: "ST-02", level: 2, title: "Twin Voices Under Moonlight", subtitle: "Partial · two independently adjustable mics", guidance: "partial", minutes: "13–16 min",
    ticket: "Host and guest must be independently adjustable.",
    callSheet: ["Host seat: CH1", "Guest seat: CH2 (softer talker)"],
    briefing: ["Each mic gets its own channel — never a Y-cable into one input.", "A stereo USB recording is ONE mix, not independent ISO tracks."],
    devices: ["micH", "micG", "mix", "phones"],
    solution: [["micH:xlr-out", "mix:mic-1"], ["micG:xlr-out", "mix:mic-2"], ["mix:phones", "phones:in"]],
    startConfig: [...C("micG", { aim: "Toward PA loudspeaker" })],
    solutionConfig: [...mixer([1, 2]), ...C("micH", { aim: "At talker's mouth" }), ...C("micG", { aim: "At talker's mouth" }), ...C("site", { soundcheck: true, "mic-place": true })],
    cues: [],
    obj: [
      o("both", "Both voices on the stereo mix", "signal", "signal", "mute", hears("mix", ["HOST VOICE", "GUEST VOICE"]), true),
      o("independent", "Host on CH1, guest on CH2 (independent channels)", "config", "physical", "connector", all(edge("micH:xlr-out", "mix:mic-1"), edge("micG:xlr-out", "mix:mic-2"))),
      o("phones", "Headphones hear the combined mix", "signal", "signal", "speaker-level", hears("phones", ["HOST VOICE", "GUEST VOICE"])),
      o("aims", "Both mics aimed at the talkers", "quality", "signal", "feedback", all(cfgIs("micH", "aim", "At talker's mouth", "Aim the host mic."), cfgIs("micG", "aim", "At talker's mouth", "Aim the guest mic."))),
      o("answers", "Mock interview answers checked individually and together", "evidence", "rehearsal", "clipping", site("soundcheck", PREFLIGHT.soundcheck)),
    ],
    preflight: ["soundcheck", "mic-place"], quiz: { q: "Why is the MG12XU stereo USB recording not an ISO recording?", options: ["It is 16 separate tracks", "It is one stereo mix — channels cannot be rebalanced later", "USB is analog"], answer: 1, why: "Stereo USB = the ST mix only." }, reward: "Twin Moon Charm",
    passCriteria: ["Both answers intelligible individually and combined", "Conservative headroom, no feedback"],
  });
  const L3 = finish(room, {
    id: "ST-03", level: 3, title: "The Three-Lens Council", subtitle: "Scenario · three cameras + sound into SDI", guidance: "scenario", minutes: "18–22 min",
    ticket: "Shoot host, guest and the two-shot.",
    callSheet: ["CAM-A front: two-shot → SDI IN 1", "CAM-B camera left: guest CU → SDI IN 2", "CAM-C camera right: host CU → SDI IN 3", "Mixer ST L/R → HD8 XLR IN 1/2"],
    briefing: ["Check every camera's output format — one has been left in UHD.", "The camera's 12G-SDI IN is a RETURN, not a source."],
    devices: ["cam1", "cam2", "cam3", "sw", "micH", "micG", "mix", "phones", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ["micH:xlr-out", "mix:mic-1"], ["micG:xlr-out", "mix:mic-2"], ["mix:st-l", "sw:xlr-1"], ["mix:st-r", "sw:xlr-2"], ["sw:hdmi-mv", "monitor:hdmi-in"], ["mix:phones", "phones:in"]],
    extraCables: cables(["x-hdmi", "HDMI 5 m", ["HDMI", "HDMI"], 5]),
    startConfig: [...C("cam2", { format: "2160p50" })],
    solutionConfig: [...camsOk(["cam1", "cam2", "cam3"]), ...mixer([1, 2]), ...C("sw", { power: true, labels: true, "xlr-on": true, "emb-audio": "OFF" }), ...C("monitor", { power: true }), ...C("site", { soundcheck: true })],
    previewBeforeTake: false,
    cues: [cue("c1", "Open on the two-shot … TAKE 1", "CAM-A"), cue("c2", "Guest answers … TAKE 2", "CAM-B"), cue("c3", "Host follows up … TAKE 3", "CAM-C"), cue("c4", "Wide to close … TAKE 1", "CAM-A")],
    obj: [
      o("mv3", "All three cameras on the multiview", "signal", "signal", "sdi-rate", showsAll("monitor", ["CAM-A", "CAM-B", "CAM-C"]), true),
      o("voices", "Program carries host + guest, no camera-mic doubling", "quality", "signal", "afv-doubling", hears("sw", ["HOST VOICE", "GUEST VOICE"]), true),
      o("labels", "Source labels match the call sheet", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Set input labels.")),
      o("framing", "Wide + two close-ups framed", "quality", "signal", "output-assign", all(...["cam1", "cam2", "cam3"].map((d) => cfgIs(d, "framing", "Framed for assignment", `Frame ${d}.`)))),
    ],
    preflight: ["soundcheck"], quiz: quiz("return-feed"), reward: "Council of Lenses",
    passCriteria: ["All three video sources", "Two clear voices", "Accurate 60-second multi-camera sequence"],
  });
  const fullVideo: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ["micH:xlr-out", "mix:mic-1"], ["micG:xlr-out", "mix:mic-2"], ["mix:st-l", "sw:xlr-1"], ["mix:st-r", "sw:xlr-2"], ["sw:hdmi-mv", "monitor:hdmi-in"], ["sw:sdi-out-1", "conv:sdi-in"], ["conv:hdmi-out", "pgm:hdmi-in"], ["sw:usb", "ssd:usb"], ["mix:phones", "phones:in"]];
  const workingStudio = [...camsOk(["cam1", "cam2", "cam3"]), ...mixer([1, 2]), ...C("sw", { power: true, labels: true, "xlr-on": true, "emb-audio": "OFF", "sdi-out-1": "PROGRAM" }), ...C("monitor", { power: true }), ...C("pgm", { power: true }), ...C("conv", { power: true }), ...C("ssd", { state: "Mounted · 412 GB free" })];
  const L4 = finish(room, {
    id: "ST-04", level: 4, title: "The Silent Return", subtitle: "Disruption · SDI, monitoring and return fault isolation", guidance: "disruption", minutes: "20–25 min",
    ticket: "The guest camera disappears and the director cannot monitor the show.",
    callSheet: ["Show is wired: 3 cameras, 2 mics, MV + PGM monitors, ISO disk", "SDI OUT 2 = CAM RETURN to CAM-B (tally/return only)"],
    briefing: ["Two independent faults are seeded. Use camera close-ups, signal trace, VU meters and monitors.", "A program return is never the camera's production video."],
    devices: ["cam1", "cam2", "cam3", "sw", "micH", "micG", "mix", "phones", "monitor", "pgm", "conv", "ssd"],
    solution: [...fullVideo, ["sw:sdi-out-2", "cam2:sdi-ret"]],
    prewired: "all",
    startConfig: [...workingStudio, ...C("sw", { "sdi-out-2": "CAM RETURN", pgm: "SDI 1" })],
    faults: [cfgFault("f-uhd", "CAM-B left in 2160p50", "sdi-rate", "cam2", "format", "2160p50", 1), cfgFault("f-conv", "PGM Micro Converter unpowered", "power", "conv", "power", false, 3)],
    solutionConfig: [...C("cam2", { format: "1080p50" }), ...C("conv", { power: true }), ...C("sw", { record: true })],
    cues: [cue("c1", "Wide … TAKE 1", "CAM-A"), cue("c2", "Guest … TAKE 2 (check PGM + MV)", "CAM-B"), cue("c3", "Back to wide … TAKE 1", "CAM-A")],
    obj: [
      o("mv3", "All three cameras back on the multiview", "signal", "signal", "sdi-rate", showsAll("monitor", ["CAM-A", "CAM-B", "CAM-C"]), true),
      o("pgm-conf", "PGM confidence monitor mirrors Program", "signal", "signal", "power", mirrorsProgram("pgm", "sw"), true),
      o("return", "CAM-B receives its return (not counted as a source)", "config", "signal", "return-feed", (c) => (c.view.cam2?.audio ?? []).some((a) => a.startsWith("RETURN")) ? { ok: true } : { ok: false, reason: "CAM-B return IN has no return feed", fix: "Assign SDI OUT 2 = CAM RETURN." }),
      o("rec", "1-minute private test recording on the ISO disk", "evidence", "delivery", "storage", evidence("ssd · ", "ISO disk file closed"), true),
      o("recovered", "Both faults diagnosed and recovered", "diagnostics", "delivery", "sdi-rate", faultsRecovered(), true),
    ],
    preflight: [], quiz: quiz("sdi-rate"), reward: "Silent Return Seal",
    passCriteria: ["Deliberate source switch verified on confidence display and PGM", "1-minute test recording and event log"],
  });
  const L5 = finish(room, {
    id: "ST-05", level: 5, title: "Studio Practical Certification", subtitle: "Certification · five-minute two-person interview", guidance: "certification", minutes: "30–40 min",
    ticket: "Produce a 5-minute two-person interview from a blank studio: three angles, independently gained mics, multiview + PGM confidence, ISO + PGM recording and a private stream.",
    callSheet: ["CAM-A WIDE · CAM-B GUEST · CAM-C HOST", "Host and guest SM58s", "Control room: MV + PGM, ISO disk, gateway"],
    briefing: ["No hints. A surprise fault will occur after the rehearsal."],
    devices: ["cam1", "cam2", "cam3", "sw", "micH", "micG", "mix", "phones", "monitor", "pgm", "conv", "ssd", "net", "wan"],
    solution: [...fullVideo, ["sw:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]],
    extraCables: cables(["x-hdmi", "HDMI 3 m", ["HDMI", "HDMI"], 3], ["x-sdi", "3G-SDI 10 m (spare)", ["SDI", "SDI"], 10, 70], ["x-usbb", "USB-B → USB-A (mixer USB)", ["USB-B", "USB-A"], 2]),
    solutionConfig: [...workingStudio, ...C("sw", { pgm: "SDI 1" }), ...C("micH", { aim: "At talker's mouth" }), ...C("micG", { aim: "At talker's mouth" }), ...C("net", { power: true, "uplink-test": true }), ...C("sw", { record: true, "stream-key": "•••••••• (private test key)", stream: true }),
      ...C("site", { "cable-route": true, clap: true, soundcheck: true, storage: true, permission: true, lighting: true, teardown: true })],
    surpriseFaults: [unplugFault("s-wan", "Missing network", "wan", ["net:wan", "wan:wan-in"], 5), cfgFault("s-mute", "Host mic muted", "mute", "mix", "ch1-on", false, 1), cfgFault("s-rate", "CAM-C wrong source rate", "sdi-rate", "cam3", "format", "2160p50", 1), cfgFault("s-full", "Record media failure (disk full)", "storage", "ssd", "state", "Mounted · FULL (0 GB free)", 4)],
    cues: [cue("c1", "Title — open wide", "CAM-A"), cue("c2", "Host intro", "CAM-C"), cue("c3", "Guest answer", "CAM-B"), cue("c4", "Two-shot", "CAM-A"), cue("c5", "Closing — host", "CAM-C")],
    obj: [
      o("mv3", "Three independently selectable picture sources", "signal", "signal", "sdi-rate", showsAll("monitor", ["CAM-A", "CAM-B", "CAM-C"]), true),
      o("voices", "Two voices without clipping, feedback or doubling", "quality", "signal", "afv-doubling", hears("sw", ["HOST VOICE", "GUEST VOICE"]), true),
      o("sep-mon", "Separate multiview and PGM monitors live", "signal", "signal", "output-assign", all(shows("monitor", "MULTIVIEW"), mirrorsProgram("pgm", "sw")), true),
      o("viewer", "Live private viewer (Program + voices)", "signal", "delivery", "wan", live("wan", "sw", ["HOST VOICE", "GUEST VOICE"]), true),
      o("iso", "PGM + 3 ISO recording statuses", "evidence", "delivery", "storage", recording("ssd", "ISO ×3"), true),
      o("iso-saved", "Recording stopped cleanly", "evidence", "delivery", "storage", evidence("ssd · ", "ISO disk file closed")),
      o("recovered", "Fault identified and recovered", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("no-early", "On air only after rehearsal", "safety", "delivery", "stream-key", (c) => c.sim.log.some((l) => l.code === "EARLY_STREAM") ? { ok: false, reason: "Stream started before the rehearsal passed", fix: "Rehearse first." } : { ok: true }),
    ],
    preflight: ["cable-route", "clap", "soundcheck", "storage", "permission", "lighting", "teardown"], quiz: quiz("embedded-audio"), reward: "Moon Bridge Broadcast License",
    passCriteria: ["3 selectable sources", "Two clean voice feeds", "Separate MV and PGM", "Live private viewer", "PGM + 3 ISO recording", "Fault recovered", "Safe cable route", "Complete run log"],
  });
  return [L1, L2, L3, L4, L5];
}

/* ══════════════════════════ ROOM 03 · AUDITORIUM (Roland V-160HD) ══════════════════════════ */
function auditorium(): StageManifest[] {
  CURRENT_ROOM = "m";
  const room = "m" as const;
  const projection: Pair[] = [["slides:hdmi-out", "sw:hdmi-in-1"], ["sw:hdmi-out-1", "display:hdmi-in-1"]];
  const projOk = [...C("slides", { power: true, present: true }), ...C("sw", { power: true, "hdmi-out-1": "PROGRAM", pgm: "HDMI 1" }), ...C("display", { power: true, source: "HDMI 1" })];
  const mixer = [...C("mix", { power: true, "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch1-hpf": true, "st-fader": "Unity" }), ...C("mic", { aim: "At talker's mouth" }), ...C("paL", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" }), ...C("paR", { power: true, level: "Nominal", aim: "In front of the mic, aimed at audience" })];
  const pa: Pair[] = [["mic:xlr-out", "mix:mic-1"], ["mix:st-l", "paL:line-in"], ["mix:st-r", "paR:line-in"]];
  const L1 = finish(room, {
    id: "AU-01", level: 1, title: "Light the Great Screen", subtitle: "Guided · one configurable output to the audience", guidance: "guided", minutes: "10–14 min",
    ticket: "Show slides to the audience without showing the tech multiview.",
    callSheet: ["Presentation laptop: stage-left desk", "V-160HD: FOH vision desk", "Projector input panel: stage right"],
    briefing: ["V-160HD HDMI OUT 1 is assignable — today it starts on MULTIVIEW.", "PREVIEW is what's next; PROGRAM is what the audience sees."],
    devices: ["slides", "sw", "display"],
    solution: projection,
    solutionConfig: [...projOk, ...C("site", { "power-check": true, format: true })],
    cues: [cue("c1", "House to half … TAKE slides", "KEYNOTE SLIDES")],
    obj: [
      o("proj", "Projector shows the correct slide", "signal", "signal", "output-assign", shows("display", "KEYNOTE SLIDES", "Projector"), true),
      o("no-mv", "No FOH grid visible to the audience", "signal", "signal", "output-assign", notShows("display", "MULTIVIEW", "The audience sees the multiview.", "Assign HDMI OUT 1 = PROGRAM."), true),
      o("assign", "HDMI OUT 1 assigned PROGRAM", "config", "signal", "output-assign", cfgIs("sw", "hdmi-out-1", "PROGRAM", "Output assign: HDMI OUT 1 = PROGRAM.")),
      o("present", "Presentation mode on", "config", "signal", "output-assign", cfgIs("slides", "present", true, "Start the slideshow.")),
    ],
    preflight: ["power-check", "format"], quiz: quiz("output-assign"), reward: "Great Screen Sigil",
    passCriteria: ["Projector displays the slide", "No multiview to the audience"],
  });
  const L2 = finish(room, {
    id: "AU-02", level: 2, title: "Voice Across the Hall", subtitle: "Partial · PA and feedback safety", guidance: "partial", minutes: "15–18 min",
    ticket: "Make the podium announcement heard across the hall — without howling.",
    callSheet: ["SM58 on the podium", "MG12XU at FOH audio", "Active PAs stage front L/R"],
    briefing: ["PAs take LINE level from STEREO OUT L/R — one cable each.", "PHONES and power-amp speaker outputs are not PA feeds.", "Fix mic and loudspeaker placement BEFORE raising level."],
    devices: ["mic", "mix", "paL", "paR", "slides", "sw", "display", "amp"],
    decoys: ["amp"],
    solution: [...pa, ...projection],
    prewired: projection,
    extraCables: cables(["x-spk", "speakON → XLR lead (do not use)", ["speakON", "XLR-M"], 5], ["x-trs", "TRS 6.35 mm 5 m", ["6.35mm", "6.35mm"], 5]),
    startConfig: [...projOk, ...C("mic", { aim: "Toward PA loudspeaker" }), ...C("paL", { aim: "Behind/aimed at the podium mic" })],
    solutionConfig: [...mixer, ...C("site", { "mic-place": true, soundcheck: true, "cable-route": true })],
    cues: [],
    obj: [
      o("house", "Speech intelligible from both PAs", "signal", "signal", "speaker-level", all(hears("paL", ["PRESENTER VOICE"]), hears("paR", ["PRESENTER VOICE"])), true),
      o("no-howl", "No feedback in the coverage zones", "quality", "signal", "feedback", noFeedback(["paL", "paR"]), true),
      o("proj", "Projection still functional", "signal", "signal", "output-assign", shows("display", "KEYNOTE SLIDES")),
      o("walk", "Audience positions checked at nominal level", "evidence", "rehearsal", "feedback", all(site("soundcheck", PREFLIGHT.soundcheck), cfgIs("paL", "level", "Nominal", "PA level Nominal."), cfgIs("paR", "level", "Nominal", "PA level Nominal."))),
    ],
    preflight: ["mic-place", "soundcheck", "cable-route"], quiz: quiz("feedback"), reward: "Voice of the Hall",
    passCriteria: ["Intelligible level in coverage zones", "No howling", "Projection still working"],
  });
  const three: Pair[] = [["slides:hdmi-out", "sw:hdmi-in-1"], ["cam1:sdi-out", "sw:sdi-in-1"], ["sw:hdmi-out-1", "display:hdmi-in-1"], ["sw:hdmi-out-2", "conf:hdmi-in"], ["sw:hdmi-out-3", "monitor:hdmi-in"]];
  const threeCfg = [...C("sw", { "hdmi-out-1": "PROGRAM", "hdmi-out-2": "AUX", aux: "HDMI 1", "hdmi-out-3": "MULTIVIEW", labels: true })];
  const L3 = finish(room, {
    id: "AU-03", level: 3, title: "Three Views, Three Destinations", subtitle: "Scenario · independent PGM / AUX / multiview", guidance: "scenario", minutes: "18–22 min",
    ticket: "Slides on the audience screen, current slides on the confidence screen, all sources on the FOH multiview — simultaneously.",
    callSheet: ["Wide camera at rear FOH → SDI IN 1", "Confidence screen downstage right (faces the speaker)"],
    briefing: ["Splitting PGM cannot make three different pictures — assign three independent outputs."],
    devices: ["slides", "cam1", "sw", "display", "conf", "monitor"],
    solution: three,
    startConfig: [...C("sw", { "hdmi-out-1": "PREVIEW", pvw: "SDI 1" })],
    solutionConfig: [...C("slides", { power: true, present: true }), ...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("sw", { power: true }), ...threeCfg, ...C("sw", { pgm: "HDMI 1" }), ...C("display", { power: true, source: "HDMI 1" }), ...C("conf", { power: true }), ...C("monitor", { power: true }), ...C("site", { "cable-route": true })],
    cues: [cue("c1", "Speaker walks on … camera", "CAM WIDE"), cue("c2", "Slides", "KEYNOTE SLIDES"), cue("c3", "Camera", "CAM WIDE"), cue("c4", "Slides", "KEYNOTE SLIDES")],
    obj: [
      o("aud", "Audience projector = Program", "signal", "signal", "output-assign", all(mirrorsProgram("display", "sw"), notShows("display", "MULTIVIEW", "Multiview leaked to the audience.", "OUT 1 = PROGRAM.")), true),
      o("conf", "Confidence screen = slides (AUX), independent of Program", "signal", "signal", "output-assign", all(shows("conf", "KEYNOTE SLIDES"), cfgIs("sw", "hdmi-out-2", "AUX", "OUT 2 = AUX, AUX = HDMI 1.")), true),
      o("mv", "FOH multiview shows every source", "signal", "signal", "output-assign", showsAll("monitor", ["MULTIVIEW", "KEYNOTE SLIDES", "CAM WIDE"]), true),
      o("labels", "Source labels set", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Label sources.")),
    ],
    preflight: ["cable-route"], quiz: quiz("output-assign"), reward: "Tri-View Prism",
    passCriteria: ["Three distinct monitors simultaneously correct", "Switching never leaks multiview to the audience"],
  });
  const stream: Pair[] = [["sw:usb", "host:usb-1"], ["host:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]];
  const L4Pairs: Pair[] = [["slides:hdmi-out", "sw:hdmi-in-1"], ["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ...pa, ["mix:grp-1", "sw:ain-1"], ["mix:grp-2", "sw:ain-2"], ["sw:hdmi-out-1", "display:hdmi-in-1"], ["sw:hdmi-out-2", "conf:hdmi-in"], ...stream];
  const L4Working = [...C("slides", { power: true, present: true }), ...C("cam1", { power: true, framing: "Framed for assignment" }), ...C("cam2", { power: true, framing: "Framed for assignment" }), ...mixer,
    ...C("mix", { "ch1-grp": true, "grp-fader": "Unity" }), ...C("sw", { power: true, "hdmi-out-1": "PROGRAM", "hdmi-out-2": "AUX", aux: "HDMI 1", "ain-mode": "LINE", "ain-on": true, pgm: "SDI 1", labels: true }),
    ...C("display", { power: true, source: "HDMI 1" }), ...C("conf", { power: true }), ...C("host", { power: true, "video-src": "USB video capture device", "audio-src": "USB capture embedded audio", "stream-key": "•••••••• (private test key)" }), ...C("net", { power: true })];
  const L4 = finish(room, {
    id: "AU-04", level: 4, title: "The Echo in the Tower", subtitle: "Disruption · FOH vs broadcast audio", guidance: "disruption", minutes: "20–25 min",
    ticket: "Send the hall performance to the private OBS test viewer while keeping the house PA stable.",
    callSheet: ["GROUP 1/2 = stream mix → V-160HD AUDIO IN 1/2 (LINE)", "USB STREAM → OBS host → host Ethernet → router → ingest", "LAN CONTROL is control only"],
    briefing: ["House audio, video PGM, OBS meter and remote viewer are four separate observations. Repair the root cause."],
    devices: ["slides", "cam1", "cam2", "sw", "mic", "mix", "paL", "paR", "display", "conf", "host", "net", "wan"],
    solution: L4Pairs, prewired: "all",
    startConfig: [...L4Working, ...C("slides", { "mute-audio": false }), ...C("sw", { "emb-audio": "ON" })],
    faults: [cfgFault("f-grp", "Mic not assigned to GROUP 1-2 (stream silent, PA fine)", "group-bus", "mix", "ch1-grp", false, 1), cfgFault("f-obs", "OBS listening to the built-in mic (echo)", "obs-source", "host", "audio-src", "Built-in laptop mic", 3)],
    solutionConfig: [...C("mix", { "ch1-grp": true }), ...C("host", { "audio-src": "USB capture embedded audio", stream: true, record: true }), ...C("sw", { "emb-audio": "OFF" }), ...C("slides", { "mute-audio": true }), ...C("site", { clap: true, permission: true })],
    cues: [cue("c1", "Performer … wide", "CAM WIDE"), cue("c2", "Slides", "KEYNOTE SLIDES"), cue("c3", "Close-up", "CAM CLOSE")],
    obj: [
      o("house", "House PA stable with speech", "signal", "signal", "feedback", all(hears("paL", ["PRESENTER VOICE"]), noFeedback(["paL", "paR"]))),
      o("viewer", "Remote viewer: Program + voice, no doubled audio", "signal", "delivery", "group-bus", live("wan", "sw", ["PRESENTER VOICE"]), true),
      o("conf", "Stage confidence still works", "signal", "signal", "output-assign", shows("conf", "KEYNOTE SLIDES")),
      o("dedup", "Laptop embedded audio de-duplicated", "quality", "signal", "afv-doubling", (c) => (c.view.sw?.audio ?? []).includes("LAPTOP SYSTEM SOUNDS") ? { ok: false, reason: "Laptop system sounds ride into the stream mix", fix: "Mute the laptop or turn embedded audio off on the V-160HD." } : { ok: true }),
      o("rec60", "60-second OBS rehearsal recording saved", "evidence", "delivery", "storage", evidence("OBS", "OBS recording stopped cleanly")),
      o("recovered", "Seeded failures diagnosed and repaired", "diagnostics", "delivery", "group-bus", faultsRecovered(), true),
    ],
    preflight: ["clap", "permission"], quiz: quiz("group-bus"), reward: "Echo Warden",
    passCriteria: ["60-second rehearsal: voice, slides, camera", "No doubled audio or black PGM", "Stage confidence still works"],
  });
  const L5 = finish(room, {
    id: "AU-05", level: 5, title: "Auditorium Practical Certification", subtitle: "Certification · keynote event from empty FOH", guidance: "certification", minutes: "30–40 min",
    ticket: "Set up and operate a simulated keynote from an empty FOH: audience PGM, performer confidence, FOH multiview, house PA, private stream and local recording.",
    callSheet: ["Opening slide → presenter camera → slides → close-up → end card", "Recorder: FOH rack"],
    briefing: ["No hints. One surprise problem after rehearsal."],
    devices: ["slides", "cam1", "cam2", "sw", "mic", "mix", "paL", "paR", "display", "conf", "monitor", "host", "rec", "net", "wan", "amp", "phones"],
    decoys: ["amp"],
    solution: [...L4Pairs, ["sw:hdmi-out-3", "monitor:hdmi-in"], ["sw:sdi-out-1", "rec:sdi-in"], ["mix:phones", "phones:in"]],
    extraCables: cables(["x-spk", "speakON → XLR lead (do not use)", ["speakON", "XLR-M"], 5], ["x-hdmi", "HDMI 10 m (spare)", ["HDMI", "HDMI"], 10], ["x-sdi", "3G-SDI 20 m (spare)", ["SDI", "SDI"], 20, 70]),
    solutionConfig: [...L4Working, ...C("cam1", { format: "1080p50" }), ...C("cam2", { format: "1080p50" }), ...C("sw", { "hdmi-out-3": "MULTIVIEW", "sdi-out-1": "PROGRAM", "emb-audio": "OFF" }), ...C("slides", { "mute-audio": true }), ...C("monitor", { power: true }),
      ...C("rec", { power: true, media: "SD card mounted (512 GB free)", record: true }), ...C("host", { stream: true }), ...C("net", { "uplink-test": true }),
      ...C("site", { "cable-route": true, "mic-place": true, soundcheck: true, clap: true, permission: true, storage: true, risk: true, teardown: true })],
    surpriseFaults: [cfgFault("s-mv", "Output assigned MULTIVIEW to the audience", "output-assign", "sw", "hdmi-out-1", "MULTIVIEW", 3), cfgFault("s-fb", "PA mic feedback (mic turned toward PA)", "feedback", "mic", "aim", "Toward PA loudspeaker", 1),
      cfgFault("s-grp", "Missing GROUP audio", "group-bus", "mix", "ch1-grp", false, 1), cfgFault("s-full", "Recorder media full", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4),
      unplugFault("s-usb", "OBS capture device dropped", "usb-role", ["sw:usb", "host:usb-1"], 2), unplugFault("s-wan", "WAN unplugged", "wan", ["net:wan", "wan:wan-in"], 5)],
    cues: [cue("c1", "Opening slide", "KEYNOTE SLIDES"), cue("c2", "Presenter walks on — wide", "CAM WIDE"), cue("c3", "Slides", "KEYNOTE SLIDES"), cue("c4", "Close-up", "CAM CLOSE"), cue("c5", "End card", "KEYNOTE SLIDES")],
    obj: [
      o("three-dest", "Audience PGM + confidence AUX + FOH multiview simultaneously", "signal", "signal", "output-assign", all(mirrorsProgram("display", "sw"), notShows("display", "MULTIVIEW", "Multiview to the audience.", "OUT 1 = PROGRAM."), shows("conf", "KEYNOTE SLIDES"), shows("monitor", "MULTIVIEW")), true),
      o("room", "In-room speech without feedback", "signal", "signal", "feedback", all(hears("paL", ["PRESENTER VOICE"]), hears("paR", ["PRESENTER VOICE"]), noFeedback(["paL", "paR"])), true),
      o("remote", "Remote audience hears speech; stream live", "signal", "delivery", "group-bus", live("wan", "sw", ["PRESENTER VOICE"]), true),
      o("rec", "Local PGM file recorded and saved", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "HyperDeck clip closed")), true),
      o("angles", "Two distinct camera angles used", "evidence", "rehearsal", "direction", historyHas(["CAM WIDE", "CAM CLOSE"]), true),
      o("recovered", "Surprise problem fixed at the root cause", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("no-early", "On air only after rehearsal", "safety", "delivery", "stream-key", (c) => c.sim.log.some((l) => l.code === "EARLY_STREAM") ? { ok: false, reason: "Streamed before rehearsal passed", fix: "Rehearse first." } : { ok: true }),
    ],
    preflight: ["cable-route", "mic-place", "soundcheck", "clap", "permission", "storage", "risk", "teardown"], quiz: quiz("eth-role"), reward: "Glass Tower Event Director",
    passCriteria: ["Audience PGM, performer confidence and FOH multiview simultaneously", "In-room and remote speech", "Stream viewer live", "Local file recorded", "Safe cabling", "Two camera angles", "Root-cause recovery", "Full cue log"],
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
    id: "OUT-01", level: 1, title: "Name the Sacred Ports", subtitle: "Guided · connector literacy & converter direction", guidance: "guided", minutes: "10–12 min",
    ticket: "Get Camera A's SDI picture onto the field HDMI monitor with the correct direction-specific converter.",
    callSheet: ["Camera A: east field mark", "Field monitor: shelter desk", "Converters live in the weatherproof case"],
    briefing: ["Inspect BNC, HDMI, USB-C and XLR on the seal pedestals (free — no score).", "SDI → HDMI needs the SDI-to-HDMI 3G converter, powered. USB-C there is power only.", "Picture appears only when power, direction and format are all right."],
    devices: ["cam1", "convSH", "monitor", "convHS"], decoys: ["convHS"],
    solution: [["cam1:sdi-out", "convSH:sdi-in"], ["convSH:hdmi-out", "monitor:hdmi-in"]],
    runs, extraCables: cables(["x-hdmi", "HDMI 2 m", ["HDMI", "HDMI"], 2], ["x-usbc", "USB-C ↔ USB-C lead", ["USB-C", "USB-C"], 1]),
    startConfig: [...C("cam1", { format: "2160p50" })],
    solutionConfig: [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("convSH", { power: true }), ...C("monitor", { power: true }), ...C("site", { format: true })],
    cues: [],
    obj: [
      o("picture", "Field monitor shows Camera A via the SDI→HDMI converter", "signal", "signal", "converter-direction", all(edge("convSH:hdmi-out", "monitor:hdmi-in"), shows("monitor", "CAM-A")), true),
      o("format", "Camera set to 1080p50 HD", "config", "signal", "sdi-rate", cfgIs("cam1", "format", "1080p50", "Set Camera A to 1080p50.")),
      o("conv-power", "Converter powered", "config", "signal", "power", cfgIs("convSH", "power", true, "Power the converter (USB-C power).")),
    ],
    preflight: ["format"], quiz: { q: "Why can't the HDMI-to-SDI 3G converter be used for camera SDI → HDMI monitor?", options: ["It needs more power", "It only converts HDMI IN → SDI OUT; its SDI connector is an output", "It is 12G"], answer: 1, why: "Converters are direction-specific." }, reward: "Seal-Reader's Glyph",
    passCriteria: ["Picture only after power, direction and format are right", "Explain why the reverse converter fails"],
  });
  const L2 = finish(room, {
    id: "OUT-02", level: 2, title: "Cross the Cable Path", subtitle: "Partial · rated SDI runs and public-crossing safety", guidance: "partial", minutes: "15–18 min",
    ticket: "Two field cameras, one control shelter, one public walkway. Bring both pictures in — safely.",
    callSheet: ["Camera A: 15 m east · Camera B: 25 m west", "HD8 ISO SDI IN 1/2", "Public walkway crosses the B run"],
    briefing: ["Spool tags state the simulated validated length at 3G — read them.", "Something is already plugged into Camera B. Is it its output?", "GO only with a dry shelter and signed supply."],
    devices: ["cam1", "cam2", "sw", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["sw:hdmi-mv", "monitor:hdmi-in"]],
    runs, weather: "clear",
    extraCables: cables(["x-weak", "SDI spool 30 m · UNRATED (sim validated 20 m at 3G)", ["SDI", "SDI"], 30, 20], ["x-ret", "3G-SDI 30 m · tested (return run)", ["SDI", "SDI"], 30, 100]),
    prewired: [["sw:sdi-out-1", "cam2:sdi-ret", "x-ret"]],
    solutionConfig: [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("cam2", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("sw", { power: true, labels: true }), ...C("monitor", { power: true }), ...C("site", { decision: "GO", shelter: true, "power-signoff": true, ramp: true })],
    cues: [],
    obj: [
      o("two", "Two distinct source pictures on the multiview", "signal", "signal", "cable-run", all(showsAll("monitor", ["CAM-A", "CAM-B"]), noCableProblems()), true),
      o("go", "Preflight signed: GO under safe conditions", "safety", "physical", "safety", (c) => c.sim.config.site?.decision === "GO" ? { ok: true } : { ok: false, reason: "No GO decision recorded", fix: "Complete the weather/shelter/power preflight, then decide GO." }, true),
      o("modes", "Camera modes inspected (1080p50)", "config", "signal", "sdi-rate", all(cfgIs("cam1", "format", "1080p50", "1080p50."), cfgIs("cam2", "format", "1080p50", "1080p50."))),
    ],
    preflight: safety, quiz: quiz("cable-run"), reward: "Path-Warden Badge",
    passCriteria: ["Two distinct source pictures", "Safe route with covered crossing", "Signed preflight — unsafe setups cannot pass"],
  });
  const L3pairs: Pair[] = [["lap:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "vh:in-1"], ["cam1:sdi-out", "vh:in-2"], ["vh:out-1", "sw:sdi-in-3"], ["vh:out-2", "sw:sdi-in-1"], ["sw:hdmi-mv", "monitor:hdmi-in"]];
  const L3 = finish(room, {
    id: "OUT-03", level: 3, title: "Read the Router Seals", subtitle: "Scenario · conversion and Videohub crosspoints", guidance: "scenario", minutes: "18–22 min",
    ticket: "Laptop slides and Camera A into the switcher through the Videohub: OUT 1 ← IN 1 to SDI IN 3, OUT 2 ← IN 2 to SDI IN 1.",
    callSheet: ["HDMI→SDI converter sits at the podium next to the laptop", "Videohub in the dry rack"],
    briefing: ["A BNC that is plugged in proves nothing — the crosspoint decides the picture."],
    devices: ["lap", "convHS", "cam1", "vh", "sw", "monitor"],
    solution: L3pairs, runs,
    solutionConfig: [...C("lap", { power: true, present: true }), ...C("convHS", { power: true }), ...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("vh", { power: true, "xp-1": "IN 1", "xp-2": "IN 2" }), ...C("sw", { power: true, labels: true }), ...C("monitor", { power: true }), ...C("site", { ramp: true, "cable-route": true })],
    cues: [],
    obj: [
      o("in3", "SDI IN 3 = laptop slides", "signal", "signal", "router-crosspoint", inputCarries("sw:sdi-in-3", "FIELD SLIDES"), true),
      o("in1", "SDI IN 1 = Camera A", "signal", "signal", "router-crosspoint", inputCarries("sw:sdi-in-1", "CAM-A"), true),
      o("mv", "Both shown separately on the multiview", "signal", "signal", "router-crosspoint", showsAll("monitor", ["FIELD SLIDES", "CAM-A"])),
      o("labels", "Assigned labels correct", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Label inputs.")),
      o("runs", "Every lead within its rated length", "safety", "signal", "cable-run", noCableProblems()),
    ],
    preflight: ["ramp", "cable-route"], quiz: quiz("router-crosspoint"), reward: "Router Seal Key",
    passCriteria: ["Slides and Cam A separately with correct labels", "Safe patch routes"],
  });
  const L4pairs: Pair[] = [["cam1:sdi-out", "vh:in-1"], ["cam2:sdi-out", "vh:in-2"], ["lap:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "vh:in-3"], ["vh:out-1", "sw:sdi-in-1"], ["vh:out-2", "sw:sdi-in-2"], ["vh:out-3", "sw:sdi-in-3"],
    ["mic:xlr-out", "mix:mic-1"], ["mix:st-l", "sw:xlr-1"], ["mix:st-r", "sw:xlr-2"], ["sw:hdmi-mv", "monitor:hdmi-in"], ["sw:sdi-out-1", "convSH:sdi-in"], ["convSH:hdmi-out", "pgm:hdmi-in"], ["sw:usb", "ssd:usb"], ["sw:eth", "net:lan-1"], ["net:wan", "wan:wan-in"]];
  const working = [...C("cam1", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("cam2", { power: true, format: "1080p50", framing: "Framed for assignment" }), ...C("lap", { power: true, present: true, "mute-audio": true }), ...C("convHS", { power: true }),
    ...C("vh", { power: true, "xp-1": "IN 1", "xp-2": "IN 2", "xp-3": "IN 3" }), ...C("mic", { windscreen: true, aim: "At talker's mouth" }), ...C("mix", { power: true, "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch1-hpf": true, "st-fader": "Unity" }),
    ...C("sw", { power: true, labels: true, "xlr-on": true, "emb-audio": "OFF", "sdi-out-1": "PROGRAM", pgm: "SDI 1", "stream-key": "•••••••• (private test key)" }), ...C("monitor", { power: true }), ...C("convSH", { power: true }), ...C("pgm", { power: true }), ...C("ssd", { state: "Mounted · 412 GB free" }), ...C("net", { power: true })];
  const L4 = finish(room, {
    id: "OUT-04", level: 4, title: "The Broken Long Run", subtitle: "Disruption · fault diagnosis and transmission", guidance: "disruption", minutes: "22–27 min",
    ticket: "The portable webcast is faulted. Restore it in a sensible order: safety → source → patch → monitor → record → WAN → ingest.",
    callSheet: ["Someone proposed a 30 m passive HDMI run from the podium laptop", "Two cameras + laptop through the Videohub", "Shure/Yamaha audio into HD8 XLR"],
    briefing: ["There is no 'Repair All'. Use the port inspector, cable tags, multiview, signal trace and mic check."],
    devices: ["cam1", "cam2", "lap", "convHS", "vh", "sw", "mic", "mix", "monitor", "convSH", "pgm", "ssd", "net", "wan"],
    solution: L4pairs, prewired: "all", runs,
    extraCables: cables(["x-hdmi30", "HDMI passive extension 30 m (validated 10 m)", ["HDMI", "HDMI"], 30, 10], ["x-sdi35", "3G-SDI 35 m · tested (sim rated 70 m at 3G)", ["SDI", "SDI"], 35, 70]),
    startConfig: [...working, ...C("site", { ramp: false })],
    faults: [
      { id: "f-safety", label: "Public crossing uncovered", concept: "safety", order: 0, config: [{ device: "site", key: "ramp", value: false }], cleared: (c) => c.sim.config.site?.ramp === true },
      { id: "f-hdmi", label: "Excessive passive HDMI extension from the podium", concept: "cable-run", order: 1, repatch: { pair: ["lap:hdmi-out", "convHS:hdmi-in"], cable: "x-hdmi30" }, cleared: (c) => Boolean(c.inp["convHS:hdmi-in"]) },
      cfgFault("f-uhd", "Camera B secretly in 2160p50", "sdi-rate", "cam2", "format", "2160p50", 1),
      cfgFault("f-xp", "Videohub OUT 3 crosspoint wrong", "router-crosspoint", "vh", "xp-3", "IN 1", 2),
      cfgFault("f-conv", "PGM converter unpowered", "power", "convSH", "power", false, 3),
      unplugFault("f-wan", "Internet uplink absent", "wan", ["net:wan", "wan:wan-in"], 5),
    ],
    solutionConfig: [...C("cam2", { format: "1080p50" }), ...C("vh", { "xp-3": "IN 3" }), ...C("convSH", { power: true }), ...C("sw", { record: true, stream: true }), ...C("site", { ramp: true, "rating-chart": true })],
    cues: [cue("c1", "Host wide", "CAM-A"), cue("c2", "Slides", "FIELD SLIDES"), cue("c3", "Demo table", "CAM-B")],
    obj: [
      o("viewer", "60-second mock stream with picture + host audio", "signal", "delivery", "wan", all(live("wan", "sw", ["HOST VOICE"]), evidence("STREAM TEST", "60-s stream test")), true),
      o("rec", "Local record running and saved", "evidence", "delivery", "storage", evidence("ssd · ", "ISO disk file closed"), true),
      o("sep", "Separate audio (XLR) and video (SDI) paths", "signal", "physical", "embedded-audio", all(edge("mix:st-l", "sw:xlr-1"), edge("mix:st-r", "sw:xlr-2"))),
      o("order", "Repairs done in a sensible order", "diagnostics", "delivery", "safety", (c) => {
        const rank = (id: string) => c.stage.faults?.find((f) => f.id === id)?.order ?? 9;
        const seq = c.sim.recoveryOrder.map(rank);
        return seq.every((r, i) => i === 0 || r >= seq[i - 1]) ? { ok: true } : { ok: false, reason: `Repair order was ${c.sim.recoveryOrder.join(" → ")}`, fix: "Safety → source → patch → monitor → record → WAN → ingest." };
      }),
      o("recovered", "All faults diagnosed and recovered", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("runs", "No lead beyond its validated length", "safety", "signal", "cable-run", noCableProblems(), true),
    ],
    preflight: ["ramp", "rating-chart"], quiz: quiz("cable-run"), reward: "Long-Run Breaker",
    passCriteria: ["60-second mock stream and local record", "Separate audio and video paths", "Root-cause repairs, no 'Repair All'"],
  });
  const L5 = finish(room, {
    id: "OUT-05", level: 5, title: "Field Rigging Practical Certification", subtitle: "Certification · weather-safe portable broadcast", guidance: "certification", minutes: "35–45 min",
    ticket: "Build and run a weather-safe interview/demo production from packed gear: two cameras + presentation, voice mix, MV/PGM, ISO record, Internet stream and a fallback network plan.",
    callSheet: ["Forecast: thunderstorm cell nearby at call time", "Secondary gateway is physically provided and pre-tested"],
    briefing: ["No hints. Decide GO/NO-GO honestly. One technical fault will occur after the rehearsal."],
    devices: ["cam1", "cam2", "lap", "convHS", "vh", "sw", "mic", "mix", "monitor", "convSH", "pgm", "ssd", "net", "wan", "net2"],
    decoys: ["net2"], weather: "lightning",
    solution: L4pairs, runs,
    extraCables: cables(["x-hdmi30", "HDMI passive extension 30 m (validated 10 m)", ["HDMI", "HDMI"], 30, 10], ["x-weak", "SDI spool 30 m · UNRATED (sim validated 20 m at 3G)", ["SDI", "SDI"], 30, 20], ["x-eth", "Ethernet 5 m (spare)", ["ETHERNET", "ETHERNET"], 5], ["x-eth2", "Ethernet 5 m (spare)", ["ETHERNET", "ETHERNET"], 5]),
    solutionConfig: [...working, ...C("sw", { record: true, stream: true }), ...C("net", { "uplink-test": true }), ...C("net2", { power: true, "uplink-test": true }),
      ...C("site", { decision: "GO", shelter: true, "power-signoff": true, ramp: true, "rating-chart": true, fallback: true, soundcheck: true, wind: true, handover: true, risk: true })],
    surpriseFaults: [
      { id: "s-isp", label: "Primary ISP outage", concept: "wan", order: 5, config: [{ device: "net", key: "wan-link", value: "Down (ISP outage)", lock: true }], cleared: (c) => Boolean(c.view.wan?.live) },
      cfgFault("s-conv", "Converter power lost", "power", "convHS", "power", false, 1),
      cfgFault("s-mute", "Host mic muted", "mute", "mix", "ch1-on", false, 1),
      cfgFault("s-rate", "Camera B rate changed to UHD", "sdi-rate", "cam2", "format", "2160p50", 1),
    ],
    cues: [cue("c1", "Host wide", "CAM-A"), cue("c2", "Slides", "FIELD SLIDES"), cue("c3", "Demo table", "CAM-B"), cue("c4", "Host close", "CAM-A")],
    obj: [
      o("safe", "Approved safety state (honest GO/NO-GO)", "safety", "physical", "safety", (c) => c.sim.config.site?.decision === "GO" && c.sim.weatherNow === "clear" ? { ok: true } : { ok: false, reason: "Not cleared to GO", fix: "Hold (NO-GO) until the all-clear, then GO." }, true),
      o("conv-dir", "Converters correctly directed", "signal", "physical", "converter-direction", masked(all(edge("lap:hdmi-out", "convHS:hdmi-in"), edge("sw:sdi-out-1", "convSH:sdi-in")), "A converter is missing from its path or used in the wrong direction"), true),
      o("three", "Three independently selectable sources (crosspoints + 1080p50)", "signal", "signal", "router-crosspoint", all(inputCarries("sw:sdi-in-1", "CAM-A"), inputCarries("sw:sdi-in-2", "CAM-B"), inputCarries("sw:sdi-in-3", "FIELD SLIDES")), true),
      o("monitors", "MV and PGM test monitors live", "signal", "signal", "output-assign", all(shows("monitor", "MULTIVIEW"), mirrorsProgram("pgm", "sw"))),
      o("host", "Audible host, clean mix", "quality", "signal", "mute", hears("sw", ["HOST VOICE"]), true),
      o("live", "Live mock private stream", "signal", "delivery", "wan", live("wan", "sw", ["HOST VOICE"]), true),
      o("iso", "Mounted ISO/PGM recording saved", "evidence", "delivery", "storage", all(recording("ssd", "ISO ×3"), evidence("ssd · ", "ISO disk file closed")), true),
      o("runs", "Cable-rating chart respected", "safety", "signal", "cable-run", noCableProblems(), true),
      o("recovered", "Failure recovered (fallback only over a provided path)", "diagnostics", "delivery", "wan", faultsRecovered(), true),
    ],
    preflight: ["shelter", "power-signoff", "ramp", "rating-chart", "fallback", "soundcheck", "wind", "risk", "handover"], quiz: quiz("safety"), reward: "Ancient Ports Field Technician Certificate",
    passCriteria: ["Approved safety state", "Correctly directed converters", "Three selectable sources", "Correct crosspoints, 1080p50", "Audible host", "Live private stream", "ISO/PGM recording", "Recovered failure and safe wrap"],
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
    id: "SP-01", level: 1, title: "The First Field View", subtitle: "Guided · main camera to the director's multiview", guidance: "guided", minutes: "12–15 min",
    ticket: "See the entire playing area on the director's monitor.",
    callSheet: ["CAM 1 MAIN HIGH/WIDE on the gantry platform", "Constellation: OB cabin director desk"],
    briefing: ["Studio Camera 12G-SDI OUT → Constellation SDI IN 1 — set the camera to 1080p50 first.", "MV SDI OUT → powered SDI→HDMI converter → HDMI monitor.", "Select SDI 1 in PREVIEW, then TAKE to PROGRAM."],
    devices: ["cam1", "sw", "convA", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ...mvChain], runs,
    extraCables: cables(["x-sdi", "3G-SDI 5 m (spare)", ["SDI", "SDI"], 5, 70]),
    startConfig: [...C("cam1", { format: "2160p50" })],
    solutionConfig: [...cam(["cam1"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }), ...C("sw", { pvw: "SDI 1" }), ...C("site", { format: true, "cable-route": true, sightlines: true })],
    previewBeforeTake: true,
    cues: [cue("c1", "Kick-off … preview 1 … TAKE 1", "CAM 1")],
    obj: [
      o("mv", "Director's multiview shows the main wide", "signal", "signal", "sdi-rate", shows("monitor", "CAM 1"), true),
      o("pgm", "Program = CAM 1", "signal", "rehearsal", "output-assign", (c) => c.view.sw?.picture?.includes("CAM 1") ? { ok: true } : { ok: false, reason: "Program is not CAM 1", fix: "Preview SDI 1, then TAKE." }),
      o("labels", "Source labels set", "config", "signal", "output-assign", cfgIs("sw", "labels", true, "Label MAIN etc.")),
      o("fmt", "Camera at 1080p50", "config", "signal", "sdi-rate", cfgIs("cam1", "format", "1080p50", "Set 1080p50.")),
    ],
    preflight: ["format", "cable-route", "sightlines"], quiz: quiz("sdi-rate"), reward: "First Field Banner",
    passCriteria: ["Wide moving picture on the monitor", "Frame rate confirmed", "Cable route clear of public paths"],
  });
  const L2 = finish(room, {
    id: "SP-02", level: 2, title: "Eyes Around the Arena", subtitle: "Partial · three-camera coverage on cue", guidance: "partial", minutes: "16–20 min",
    ticket: "Follow a play from wide → sideline → finish.",
    callSheet: ["CAM 2 SIDELINE → SDI IN 2", "CAM 3 GOAL/FINISH → SDI IN 3", "Preview before every TAKE"],
    briefing: ["Each camera needs its own physical BNC run.", "Check what is already plugged into CAM 2 — and CAM 3's view."],
    devices: ["cam1", "cam2", "cam3", "sw", "convA", "monitor"],
    solution: [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ...mvChain], runs,
    prewired: [["cam1:sdi-out", "sw:sdi-in-1"], ...mvChain, ["sw:sdi-out-1", "cam2:sdi-ret", "x-ret"]],
    extraCables: cables(["x-ret", "3G-SDI 90 m (return run)", ["SDI", "SDI"], 90, 100]),
    startConfig: [...cam(["cam1"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }), ...C("cam3", { framing: "Not framed" })],
    solutionConfig: [...cam(["cam2", "cam3"]), ...C("site", { sightlines: true })],
    previewBeforeTake: true,
    cues: [cue("c1", "Attack building — wide", "CAM 1"), cue("c2", "Player on the wing — sideline", "CAM 2"), cue("c3", "Shot on goal — finish", "CAM 3"), cue("c4", "Reset — wide", "CAM 1")],
    obj: [
      o("mv3", "All three sources separately on the multiview", "signal", "signal", "return-feed", showsAll("monitor", ["CAM 1", "CAM 2", "CAM 3"]), true),
      o("framed", "Unblocked sightlines on every camera", "quality", "signal", "output-assign", all(...["cam1", "cam2", "cam3"].map((d) => cfgIs(d, "framing", "Framed for assignment", `Reframe ${d} (blocked shot).`)))),
    ],
    preflight: ["sightlines"], quiz: quiz("return-feed"), reward: "Arena Eyes",
    passCriteria: ["Three separate sources in MV", "Coverage hits each cue window, no black"],
  });
  const vid3: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ...mvChain];
  const audio: Pair[] = [["mic1:xlr-out", "mix:mic-1"], ["mic2:xlr-out", "mix:mic-2"], ["amb:xlr-out", "mix:mic-3"], ["mix:st-l", "sw:aud-l"], ["mix:st-r", "sw:aud-r"], ["mix:phones", "phones:in"]];
  const gfx: Pair[] = [["gfx:hdmi-out", "convHS:hdmi-in"], ["convHS:sdi-out", "sw:sdi-in-5"]];
  const mixOk = [...C("mix", { power: true, "st-fader": "Unity" }), ...[1, 2, 3].flatMap((n) => C("mix", { [`ch${n}-gain`]: "Nominal (peaks −18 dBFS)", [`ch${n}-on`]: true, [`ch${n}-st`]: true, [`ch${n}-hpf`]: true })), ...C("amb", { windscreen: true }), ...C("mic1", { aim: "At talker's mouth" }), ...C("mic2", { aim: "At talker's mouth" })];
  const L3 = finish(room, {
    id: "SP-03", level: 3, title: "The Score Is Written", subtitle: "Scenario · commentary mix + licensed score graphics", guidance: "scenario", minutes: "20–25 min",
    ticket: "Make a comprehensible live sports program: two voices over controlled ambience, and a correct score card.",
    callSheet: ["Commentators 1/2 in the booth · ambience mic crowd-facing", "Graphics desk: licensed scoreboard template", "Full-frame score card via HDMI→SDI 3G → SDI IN 5"],
    briefing: ["Headphones are not the remote mix — check the switcher's embedded Program audio.", "Score updates are a manual operator edit. Verify against the field event before air."],
    devices: ["cam1", "cam2", "cam3", "sw", "convA", "monitor", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS"],
    solution: [...vid3, ...audio, ...gfx], prewired: vid3, runs,
    startConfig: [...cam(["cam1", "cam2", "cam3"]), ...C("sw", swCfg), ...C("convA", { power: true }), ...C("monitor", { power: true }),
      ...C("mix", { power: true, "st-fader": "Unity", "ch1-gain": "Nominal (peaks −18 dBFS)", "ch1-on": true, "ch1-st": true, "ch2-gain": "Nominal (peaks −18 dBFS)", "ch2-on": false, "ch2-st": true, "ch3-gain": "Too hot (clips)", "ch3-on": true, "ch3-st": true })],
    solutionConfig: [...mixOk, ...C("sw", { "analog-on": true, "emb-audio": "OFF" }), ...C("gfx", { power: true, template: "Scoreboard template (licensed)", score: "1–0" }), ...C("convHS", { power: true }), ...C("site", { soundcheck: true, licensed: true, wind: true })],
    cues: [cue("c1", "Play builds — wide", "CAM 1"), cue("c2", "GOAL! — finish camera", "CAM 3"), cue("c3", "Score card (verify 1–0)", "SCOREBOARD 1–0"), cue("c4", "Restart — wide", "CAM 1")],
    obj: [
      o("mix", "Program carries both commentators + controlled ambience", "quality", "signal", "embedded-audio", hears("sw", ["COMMENTATOR 1", "COMMENTATOR 2", "CROWD AMBIENCE"]), true),
      o("booth", "Booth headphones monitor the same mix", "signal", "signal", "embedded-audio", hears("phones", ["COMMENTATOR 1", "COMMENTATOR 2"])),
      o("gfx-src", "Graphic source correctly identified (SDI IN 5 = licensed scoreboard)", "config", "signal", "graphics", inputCarries("sw:sdi-in-5", "SCOREBOARD")),
      o("score", "Score on air matches the field event (1–0)", "signal", "rehearsal", "graphics", (c) => {
        const h = c.sim.pgmHistory;
        if (!h.includes("SCOREBOARD 1–0")) return { ok: false, reason: "The 1–0 score card was never taken", fix: "Edit the score to 1–0 after the goal, verify, then take SDI IN 5." };
        return h.some((x) => x === "SCOREBOARD 0–0" || x === "GFX TEST PATTERN") ? { ok: false, reason: "A stale score or the test pattern went to air", fix: "Verify the graphic before TAKE." } : { ok: true };
      }, true),
      o("clean", "Clean camera picture between graphics", "quality", "rehearsal", "output-assign", historyHas(["CAM 1", "CAM 3"])),
    ],
    preflight: ["soundcheck", "licensed", "wind"], quiz: quiz("graphics"), reward: "Scribe of the Scoreline",
    passCriteria: ["Real two-voice mix", "Correct score", "Clean camera picture", "Properly identified graphic source"],
  });
  const full: Pair[] = [["cam1:sdi-out", "sw:sdi-in-1"], ["cam2:sdi-out", "sw:sdi-in-2"], ["cam3:sdi-out", "sw:sdi-in-3"], ["cam4:sdi-out", "sw:sdi-in-4"], ...gfx, ...audio, ...mvChain,
    ["sw:sdi-out-1", "enc:sdi-in"], ["enc:eth", "net:lan-1"], ["net:wan", "wan:wan-in"], ["sw:sdi-out-2", "rec:sdi-in"], ["sw:sdi-out-3", "convB:sdi-in"], ["convB:hdmi-out", "pgm:hdmi-in"]];
  const fullCfg = [...cam(["cam1", "cam2", "cam3", "cam4"]), ...mixOk, ...C("sw", { ...swCfg, "analog-on": true, "emb-audio": "OFF", "sdi-out-1": "PROGRAM", "sdi-out-2": "PROGRAM", "sdi-out-3": "PROGRAM", pgm: "SDI 1" }),
    ...C("gfx", { power: true, template: "Scoreboard template (licensed)" }), ...C("convHS", { power: true }), ...C("convA", { power: true }), ...C("convB", { power: true }), ...C("monitor", { power: true }), ...C("pgm", { power: true }),
    ...C("enc", { power: true, format: "1080p50", "stream-key": "•••••••• (private test key)" }), ...C("rec", { power: true, media: "SD card mounted (512 GB free)" }), ...C("net", { power: true })];
  const L4 = finish(room, {
    id: "SP-04", level: 4, title: "The Broken Transmission", subtitle: "Disruption · switcher → encoder → WAN → viewer", guidance: "disruption", minutes: "24–30 min",
    ticket: "Put the sports program on a private remote viewer and preserve local PGM recording.",
    callSheet: ["SDI OUT A [PROGRAM] → Streaming Encoder HD", "SDI OUT B [PROGRAM] → HyperDeck PGM recorder", "SDI OUT C [PROGRAM] → PGM confidence", "Constellation Ethernet = control network only"],
    briefing: ["Two recoverable faults are live. Inspect camera → switcher → encoder → WAN → viewer.", "Dropped frames are a network symptom; a grid on the viewer is a routing problem.", "Cover the break with the holding slate, then restore."],
    devices: ["cam1", "cam2", "cam3", "cam4", "sw", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS", "convA", "monitor", "convB", "pgm", "enc", "rec", "net", "wan"],
    solution: full, prewired: "all", runs,
    startConfig: [...fullCfg, ...C("enc", { stream: true }), ...C("rec", { record: true })],
    faults: [cfgFault("f-enc-route", "Encoder fed from an output assigned MULTIVIEW", "output-assign", "sw", "sdi-out-1", "MULTIVIEW", 2), cfgFault("f-full", "Recorder media full", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4)],
    solutionConfig: [...C("sw", { "sdi-out-1": "PROGRAM" }), ...C("rec", { media: "SD card mounted (512 GB free)" }), ...C("site", { holding: true, permission: true })],
    cues: [cue("c1", "Wide", "CAM 1"), cue("c2", "Sideline", "CAM 2"), cue("c3", "Wide", "CAM 1")],
    obj: [
      o("viewer", "90 s remote picture + embedded commentary", "signal", "delivery", "embedded-audio", all(live("wan", "sw", ["COMMENTATOR 1", "COMMENTATOR 2"]), evidence("STREAM TEST 90", "90-second stream test")), true),
      o("rec", "Local PGM record file status", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "HyperDeck clip closed")), true),
      o("pgm", "PGM confidence on its own SDI output", "signal", "signal", "output-assign", mirrorsProgram("pgm", "sw")),
      o("fallback", "Holding slate used during the break", "diagnostics", "rehearsal", "graphics", (c) => c.sim.fallbackUsed ? { ok: true } : { ok: false, reason: "No safe fallback taken while the fault was live", fix: "Take the holding slate (graphics) while you repair, then restore." }),
      o("recovered", "Both faults diagnosed and recovered (logged)", "diagnostics", "delivery", "output-assign", faultsRecovered(), true),
    ],
    preflight: ["holding", "permission"], quiz: quiz("eth-role"), reward: "Transmission Mender",
    passCriteria: ["90 s remote picture + embedded audio", "Local record file status", "Logged recovery"],
  });
  const L5 = finish(room, {
    id: "SP-05", level: 5, title: "Sports Outside Broadcast Practical Certification", subtitle: "Certification · complete mock live football broadcast", guidance: "certification", minutes: "40–50 min",
    ticket: "From unsorted cases to handoff: four cameras, two commentators and ambience, verified live score, independent MV/PGM, tested recording and a separate hardware encoder to a private viewer.",
    callSheet: ["CAM 1 MAIN · CAM 2 SIDELINE · CAM 3 GOAL · CAM 4 REACTION", "Timeline: opening → main action → sideline → score → reaction → closing", "Optional pre-loaded replay deck (never multi-angle instant replay)"],
    briefing: ["No hints. One unexpected audio/video/network/recording fault after rehearsal."],
    devices: ["cam1", "cam2", "cam3", "cam4", "sw", "mic1", "mic2", "amb", "mix", "phones", "gfx", "convHS", "convA", "monitor", "convB", "pgm", "enc", "rec", "net", "wan", "play"],
    decoys: ["play"],
    solution: full, runs,
    extraCables: cables(["x-sdi", "3G-SDI 50 m (spare)", ["SDI", "SDI"], 50, 100], ["x-sdi2", "3G-SDI 5 m (spare)", ["SDI", "SDI"], 5, 70], ["x-eth", "Ethernet 3 m (control LAN)", ["ETHERNET", "ETHERNET"], 3]),
    solutionConfig: [...fullCfg, ...C("gfx", { score: "1–0" }), ...C("enc", { stream: true }), ...C("rec", { record: true }), ...C("net", { "uplink-test": true }),
      ...C("site", { rights: true, crew: true, sightlines: true, "cable-route": true, soundcheck: true, clap: true, storage: true, permission: true, holding: true, comms: true, wind: true, privacy: true, risk: true, teardown: true })],
    surpriseFaults: [cfgFault("s-audio", "Analog commentary input disabled", "embedded-audio", "sw", "analog-on", false, 1), unplugFault("s-video", "CAM 2 SDI run disconnected", "connector", ["cam2:sdi-out", "sw:sdi-in-2"], 1),
      unplugFault("s-net", "WAN hand-off lost", "wan", ["net:wan", "wan:wan-in"], 5), cfgFault("s-rec", "Recorder media full", "storage", "rec", "media", "SD card mounted · FULL (0 GB)", 4)],
    previewBeforeTake: true,
    cues: [cue("c1", "Opening — main wide", "CAM 1"), cue("c2", "Main action — sideline", "CAM 2"), cue("c3", "GOAL — finish camera", "CAM 3"), cue("c4", "Score (verify 1–0)", "SCOREBOARD 1–0"), cue("c5", "Reaction", "CAM 4"), cue("c6", "Closing — wide", "CAM 1")],
    obj: [
      o("four", "Four unique camera angles selectable", "signal", "signal", "sdi-rate", showsAll("monitor", ["CAM 1", "CAM 2", "CAM 3", "CAM 4"]), true),
      o("remote-audio", "Voices + controlled ambience reach the REMOTE viewer", "quality", "delivery", "embedded-audio", live("wan", "sw", ["COMMENTATOR 1", "COMMENTATOR 2", "CROWD AMBIENCE"]), true),
      o("score", "Score matches the event state", "signal", "rehearsal", "graphics", (c) => c.sim.pgmHistory.includes("SCOREBOARD 1–0") && !c.sim.pgmHistory.includes("SCOREBOARD 0–0") ? { ok: true } : { ok: false, reason: "Score card wrong or never taken", fix: "Edit to 1–0 after the goal and verify." }, true),
      o("paths", "PGM, multiview and recorder on distinct physical outputs", "signal", "physical", "output-assign", masked(all(edge("sw:sdi-out-1", "enc:sdi-in"), edge("sw:sdi-out-2", "rec:sdi-in"), edge("sw:sdi-out-3", "convB:sdi-in"), edge("sw:mv-out", "convA:sdi-in")), "Encoder, recorder, PGM confidence and multiview are not each on their own documented switcher output"), true),
      o("viewer", "Separate Streaming Encoder → WAN → remote viewer live", "signal", "delivery", "eth-role", live("wan", "sw"), true),
      o("rec", "PGM file proves active local recording", "evidence", "delivery", "storage", all(recording("rec"), evidence("rec · ", "HyperDeck clip closed")), true),
      o("recovered", "Successful recovery", "diagnostics", "delivery", "direction", faultsRecovered(), true),
      o("no-early", "On air only after rehearsal", "safety", "delivery", "stream-key", (c) => c.sim.log.some((l) => l.code === "EARLY_STREAM") ? { ok: false, reason: "Encoder ON AIR before rehearsal passed", fix: "Rehearse first." } : { ok: true }),
    ],
    preflight: ["rights", "crew", "sightlines", "cable-route", "soundcheck", "clap", "storage", "permission", "holding", "comms", "wind", "privacy", "risk", "teardown"], quiz: quiz("eth-role"),
    reward: "Throne of Broadcast: Certified Live Production Operator (simulation training only — not a professional licence)",
    passCriteria: ["Four unique angles", "Correct end-to-end SDI sources", "Voice + ambience reach the remote encoder", "Score matches the event", "Distinct PGM/MV/recorder paths", "Separate encoder → WAN → viewer", "Active local recording", "Recovery and safe wrap"],
  });
  return [L1, L2, L3, L4, L5];
}

export const STAGES: StageManifest[] = [...classroom(), ...studio(), ...auditorium(), ...outdoor(), ...stadium()];
export const stageFor = (scale: keyof typeof ROOMS, level: number) => STAGES.find((s) => s.room === scale && s.level === level)!;
