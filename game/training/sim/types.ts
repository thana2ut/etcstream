/**
 * Typed directed signal graph — shared data model for all five production rooms (25 stages).
 *
 * Every device instance has a unique instance id, a model id from the equipment manifest, a transform
 * (the scenario's DeviceDef position/yaw), a power state and a configuration. Every port is named and typed
 * (direction, connector, signal class, channel count, supported formats or audio level, tooltip).
 * A cable joins exactly one OUTPUT to one INPUT. Validation never trusts cable colour: a destination only
 * "works" when physical connection + signal class + format/level + device configuration + power +
 * network/storage path all pass along the actual graph.
 */
import type { Connector } from "../scenarios";

/** Physical/electrical signal families. Ethernet roles are a property of the DEVICE, not of the RJ45 jack. */
export type SignalClass =
  | "HDMI"          // HDMI video with embedded audio
  | "SDI"           // SDI video with embedded audio (format decides 3G vs 12G)
  | "MIC"           // balanced analog microphone level
  | "LINE_BAL"      // balanced analog line level (+4 dBu)
  | "LINE_UNBAL"    // unbalanced consumer line (-10 dBV) 3.5 mm stereo
  | "SPEAKER"       // amplified loudspeaker level — never a line input
  | "HEADPHONE"     // headphone amplifier output — not a PA feed
  | "USB_UVC"       // USB video class (webcam) + UAC audio to a host
  | "USB_UAC"       // USB audio class only (mixer USB audio) to a host
  | "USB_STORAGE"   // USB mass storage (recording media)
  | "USB_POWER"     // USB-C power / configuration only (micro converters)
  | "ETHERNET"      // RJ45 Ethernet; control vs stream decided by the device
  | "WAN";          // Internet hand-off (ISP / test ingest uplink)

export type VideoFormat = "1080p50" | "1080p60" | "2160p50" | "720p50";
export const HD_FORMATS: VideoFormat[] = ["720p50", "1080p50", "1080p60"];
export const DEFAULT_FORMAT: VideoFormat = "1080p50";

export interface PortDefinition {
  key: string;               // local port key, e.g. "sdi-in-1"
  name: string;              // engraved panel label, e.g. "SDI IN 1"
  dir: "INPUT" | "OUTPUT";
  connector: Connector;      // physical connector on the panel
  sig: SignalClass;
  channels?: number;         // audio channel count (stereo 2, mono 1)
  formats?: VideoFormat[];   // video formats this port accepts/emits
  tip: string;               // explanatory tooltip (English)
  /** Rear/front panel the port is engraved on. */
  panel?: "rear" | "front" | "side" | "top";
}

export type ControlKind = "select" | "toggle" | "button";
export interface ControlDefinition {
  key: string;
  label: string;
  kind: ControlKind;
  options?: string[];         // for select
  default?: string | boolean;
  tip: string;
}

export interface EquipmentDefinition {
  modelId: string;
  manufacturer: string;       // "Generic Training Device" for generics
  name: string;               // full display name
  generic: boolean;
  /** Manufacturer page the port map was taken from (named models only). */
  sourceUrl?: string;
  /** Ports confirmed against sourceUrl (named models) or defined by the room specification (generics). */
  verifiedPorts: string[];
  assetLicense: string;
  /** Needs power before it emits anything (abstracted safe power task, never mains wiring). */
  needsPower: boolean;
  role: "source" | "mic" | "mixer" | "converter" | "router" | "switcher" | "encoder" | "host" | "display" | "speaker" | "recorder" | "storage" | "network" | "ingest" | "interface" | "safety" | "decoy";
  ports: PortDefinition[];
  controls: ControlDefinition[];
  /** Device-level notes surfaced in Inspect Mode (what it is NOT). */
  notes: string[];
  /** What the device shows / emits as its synthetic content (sources only). */
  content?: string;
  kind: "camera" | "box" | "laptop" | "bodypack" | "mic" | "mixer";
  size: [number, number, number];
}

/* ---------------- runtime ---------------- */
export type ControlValue = string | boolean;
export type DeviceConfig = Record<string, ControlValue>;

/** What travels along an edge. Video carries provenance (content) and embedded audio sources. */
export interface VideoSignal { kind: "video"; cls: "HDMI" | "SDI"; format: VideoFormat; content: string; audio: string[]; via: string[] }
export interface AudioSignal { kind: "audio"; cls: SignalClass; sources: string[]; clip: boolean; via: string[] }
export interface UsbSignal { kind: "usb"; cls: "USB_UVC" | "USB_UAC" | "USB_STORAGE"; content?: string; audio: string[]; via: string[] }
export interface NetSignal { kind: "net"; role: "control" | "stream"; content?: string; audio: string[]; via: string[]; keyOk: boolean }
export type Signal = VideoSignal | AudioSignal | UsbSignal | NetSignal;

/** A fault seeded into a stage: a config override or a physical condition. All are deterministic. */
export interface FaultScenario {
  id: string;
  label: string;              // learner-facing symptom/description (shown after diagnosis)
  concept: ConceptId;
  /** Applied at stage start (L4) or after rehearsal (L5). `lock` holds the control until the fault is worked around. */
  config?: { device: string; key: string; value: ControlValue; lock?: boolean }[];
  /** Pull these canonical leads out ([from, to] pairs). */
  unplug?: [string, string][];
  /** Swap one canonical lead for a different (wrong) lead or source. */
  repatch?: { pair: [string, string]; from?: string; cable?: string };
  /** Repair-order rank (safety 0 → source 1 → patch 2 → monitor 3 → record 4 → WAN 5 → ingest 6). */
  order?: number;
  /** The fault is cleared when this predicate holds. */
  cleared: (ctx: EvalContext) => boolean;
}

/** Learning concept for targeted review + mini mastery check. */
export type ConceptId =
  | "direction" | "connector" | "sdi-rate" | "converter-direction" | "power" | "output-assign" | "mic-line-level"
  | "consumer-level" | "speaker-level" | "eth-role" | "usb-role" | "router-crosspoint" | "embedded-audio"
  | "storage" | "wan" | "stream-key" | "feedback" | "clipping" | "mute" | "afv-doubling" | "safety" | "return-feed"
  | "group-bus" | "one-output" | "obs-source" | "graphics" | "cable-run";

export type Category = "signal" | "config" | "quality" | "safety" | "diagnostics" | "evidence";
export const CATEGORY_WEIGHT: Record<Category, number> = { signal: 35, config: 20, quality: 15, safety: 10, diagnostics: 10, evidence: 10 };
export type TestStage = "physical" | "signal" | "rehearsal" | "delivery";

export interface ObjectivePredicate {
  id: string;
  label: string;              // English, learner-facing
  category: Category;
  stage: TestStage;
  critical?: boolean;
  concept: ConceptId;
  check: (ctx: EvalContext) => PredicateResult;
}
export interface PredicateResult { ok: boolean; reason?: string; fix?: string; trace?: string[] }

/** One cue of the run-of-show the operator must take to Program (in order). */
export interface Cue { id: string; call: string; expect: string }

export interface StageManifest {
  id: string;                 // e.g. "CL-01"
  room: "xs" | "s" | "m" | "l" | "xl";
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  guidance: "guided" | "partial" | "scenario" | "disruption" | "certification";
  minutes: string;
  ticket: string;             // stage manager's job ticket
  callSheet: string[];        // crew + positions + timings
  briefing: string[];         // instructor captions
  devices: string[];          // instance ids used in this stage
  /** Canonical leads [OUTPUT port, INPUT port] — one lead is issued per pair (type/length tag only, never a route
   * name). Used for guided hints and the solver tests; never revealed in L5. */
  solution: [string, string][];
  /** Pre-wired at start: "all" (L4 broken show) or a list of pairs from `solution`. */
  prewired?: "all" | ([string, string] | [string, string, string])[];
  /** Spare and decoy leads in the kit (wrong type, under-rated spool, unsafe adapter...). */
  extraCables?: ExtraCable[];
  /** Measured run (m) between two devices, key "devA|devB" (sorted). Default 2 m. */
  runs?: Record<string, number>;
  /** Mini mastery check asked before sign-off. */
  quiz?: Quiz;
  /** XL: a TAKE only counts when the shot was in PREVIEW first. */
  previewBeforeTake?: boolean;
  /** Outdoor: weather forecast at start; lightning forces NO-GO until the all-clear. */
  weather?: "clear" | "lightning";
  /** Config the operator must reach (solver/tests); also the ground truth for "config" objectives. */
  solutionConfig: { device: string; key: string; value: ControlValue }[];
  /** Initial config overrides (powered-off devices, wrong modes, seeded traps). */
  startConfig?: { device: string; key: string; value: ControlValue }[];
  /** Faults present at start (L4: exactly the listed ones). */
  faults?: FaultScenario[];
  /** L5: a pool of possible surprise faults; one is chosen deterministically from the attempt seed after rehearsal. */
  surpriseFaults?: FaultScenario[];
  cues: Cue[];
  objectives: ObjectivePredicate[];
  preflight: string[];        // checklist control keys on the stage's safety/preflight panel
  reward: string;
  passCriteria: string[];     // spec critical gates, learner-facing
  /** Device instance ids that are decoys / traps in inventory (wrong converter, speaker amp, SDI-only lead...). */
  decoys?: string[];
}

export interface SimLogEntry { t: number; kind: "connect" | "reject" | "config" | "take" | "test" | "fault" | "recover" | "review"; text: string; code?: string }

/** Runtime state of the simulation, stored inside TrainingState.sim. */
export interface SimRuntime {
  stageId: string;
  config: Record<string, DeviceConfig>;
  pgmHistory: string[];       // contents taken to Program, in order
  cueIndex: number;           // next cue to take
  cueStart?: number;          // pgmHistory length when the run-of-show started (signal test passed)
  cueMisses: number;
  testsPassed: Partial<Record<TestStage, boolean>>;
  diagnosed: string[];        // fault ids the learner traced while active
  recovered: string[];        // fault ids cleared after being active
  activeFaults: string[];
  surpriseArmed: boolean;     // L5: surprise fault already injected
  seed: number;
  errors: number;             // meaningful errors since last review
  totalErrors: number;
  lastErrorConcept?: ConceptId;
  paused: boolean;            // three meaningful errors → Mission Paused → review → mini check
  reviewConcept?: ConceptId;
  log: SimLogEntry[];
  tick: number;
  signedOff: boolean;
  /** Saved evidence (files stopped cleanly, stream test passes, cue log). */
  evidence: string[];
  quizOk: boolean;
  /** XL L4: holding slate taken while a fault was active. */
  fallbackUsed: boolean;
  /** Controls a fault holds (e.g. an ISP outage cannot be "switched back on"). */
  locked: string[];
  /** Outdoor weather: forecast after any all-clear. */
  weatherNow?: "clear" | "lightning";
  /** Order in which faults were recovered (for repair-order objectives). */
  recoveryOrder: string[];
}

export interface ExtraCable { id: string; label: string; ends: [Connector, Connector]; lengthM: number; ratedM?: number }
export interface Quiz { q: string; options: string[]; answer: number; why: string }

/** Everything a predicate may read. */
export interface EvalContext {
  stage: StageManifest;
  sim: SimRuntime;
  /** Output signals by global port id (`device:port`). */
  out: Record<string, Signal | undefined>;
  /** Input signals by global port id. */
  inp: Record<string, Signal | undefined>;
  /** Edge list: out port → in port (resolved real ports). */
  edges: { from: string; to: string; cableId: string }[];
  placed: (device: string) => boolean;
  cfg: (device: string, key: string) => ControlValue | undefined;
  /** What the device currently presents (display content, PA audible sources, recorder file, viewer). */
  view: Record<string, DeviceView>;
}

export interface DeviceView {
  powered: boolean;
  /** For displays/viewer: shown picture; for speakers: audible sources; for recorders: file content. */
  picture?: string;
  audio?: string[];
  clip?: boolean;
  feedback?: boolean;
  recording?: boolean;
  file?: string;
  live?: boolean;
  status: string;             // one-line status, English
  problem?: { code: string; concept: ConceptId; text: string; fix: string };
}
