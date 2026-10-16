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
  code: "CL" | "ST" | "AU" | "OUT" | "SP";
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
    scale: "xs", code: "CL", title: "The Gate of First Images", subtitle: "Classroom · Teaching & Hybrid-Lesson Production",
    instances: {
      cam1: I("CL-CAM-01", "generic-hdmi-camera", "Teacher Camera", { content: "TEACHER CAM" }),
      slides: I("CL-LAP-01", "generic-laptop", "Presentation Laptop", { content: "SLIDES" }),
      doc: I("CL-DOC-01", "generic-doc-camera", "Document Camera", { content: "DOC CAM · BOOK PAGE" }),
      sw: I("CL-SW-01", "bmd-atem-mini-pro-iso", "ATEM Mini Pro ISO"),
      mic: I("CL-MIC-01", "shure-sm58", "Teacher SM58", { voice: "TEACHER VOICE" }),
      mix: I("CL-AUD-01", "yamaha-mg12xu", "Yamaha MG12XU"),
      adapt: I("CL-ADAPT-01", "generic-bal-unbal-interface", "Line Interface (Bal→Unbal)"),
      monitor: I("CL-DIS-01", "generic-projector", "Classroom Projector"),
      mon2: I("CL-MON-01", "generic-hdmi-monitor", "HDMI Rehearsal Monitor"),
      ssd: I("CL-SSD-01", "generic-recording-ssd", "Recording SSD"),
      net: I("CL-NET-01", "generic-gateway", "GbE Router"),
      wan: I("CL-WAN", "generic-test-ingest", "Private Test Ingest (WAN)"),
      host: I("CL-HOST-01", "generic-obs-host", "OBS Workstation"),
    },
    places: {
      cam1: "cam1", slides: "slides", mic: "tx1", monitor: "monitor",
      doc: at(1.15, 0.76, -2.75, 0, "Teacher desk, right — document camera"),
      mix: at(2.9, 0.76, 2.95, 0, "AV operator desk — MIX"),
      adapt: at(3.15, 0.76, 3.05, 0, "AV operator desk — next to the mixer"),
      sw: at(3.5, 0.76, 2.85, 0, "AV operator desk — CAPTURE / switcher"),
      ssd: at(3.78, 0.76, 3.05, 0, "AV operator desk — beside the ATEM"),
      host: at(4.05, 0.76, 2.85, -0.2, "AV operator desk — DELIVER / OBS"),
      net: at(4.0, 0, 3.2, 0, "Under the AV desk — network"),
      wan: at(5.1, 0, 2.2, -Math.PI / 2, "Network cabinet — uplink (simulated)"),
      mon2: at(2.95, 0.98, -3.85, 0, "Rehearsal monitor (variant only)"),
    },
    portable: ["sw", "mix", "adapt", "ssd", "host", "doc", "net", "mon2"],
  },
  s: {
    scale: "s", code: "ST", title: "The Moon Bridge of Sound", subtitle: "Studio · Interview & Multi-camera Broadcast",
    instances: {
      cam1: I("ST-CAMA", "bmd-studio-camera-4k-pro-g2", "Studio Camera A (WIDE)", { content: "CAM-A WIDE TWO-SHOT" }),
      cam2: I("ST-CAMB", "bmd-studio-camera-4k-pro-g2", "Studio Camera B (GUEST)", { content: "CAM-B GUEST CLOSE-UP" }),
      cam3: I("ST-CAMC", "bmd-studio-camera-4k-pro-g2", "Studio Camera C (HOST)", { content: "CAM-C HOST CLOSE-UP" }),
      sw: I("ST-SW", "bmd-atem-tvs-hd8-iso", "ATEM TV Studio HD8 ISO"),
      micH: I("ST-MIC-H", "shure-sm58", "Host SM58", { voice: "HOST VOICE" }),
      micG: I("ST-MIC-G", "shure-sm58", "Guest SM58", { voice: "GUEST VOICE" }),
      mix: I("ST-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      phones: I("ST-HEAD", "generic-headphones", "Monitoring Headphones"),
      monitor: I("ST-MV", "generic-hdmi-monitor", "Multiview Monitor"),
      pgm: I("ST-PGM", "generic-hdmi-monitor", "Program Monitor"),
      conv: I("ST-CONV", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G"),
      ssd: I("ST-SSD", "generic-recording-ssd", "Recording SSD"),
      net: I("ST-NET", "generic-gateway", "GbE Gateway"),
      wan: I("ST-WAN", "generic-test-ingest", "Private Test Ingest (WAN)"),
    },
    places: {
      sw: "sw", mix: "mix", monitor: "monitor",
      cam1: camAt(3.3, 2.9, [6.2, 2.0], "Interview set — CAM-A front (two-shot)"),
      cam2: camAt(3.9, 0.7, [6.6, 2.5], "Interview set — CAM-B camera left (guest CU)"),
      cam3: camAt(3.9, 4.3, [6.0, 1.5], "Interview set — CAM-C camera right (host CU)"),
      micH: at(5.7, 0, 1.4, 0, "Interview set — host mic stand"),
      micG: at(6.7, 0, 2.6, 0, "Interview set — guest mic stand"),
      phones: at(-4.0, 0.76, 5.05, 0, "Production desk — audio station"),
      pgm: at(-1.05, 0.76, 4.45, Math.PI, "Production desk — PGM confidence"),
      conv: at(-1.8, 0.76, 4.95, Math.PI, "Production desk — behind the PGM monitor"),
      ssd: at(-2.15, 0.76, 4.95, Math.PI, "Production desk — next to the HD8 ISO"),
      net: at(-0.35, 0.76, 4.9, Math.PI, "Patch rack — gateway"),
      wan: at(0.9, 0, 5.2, -Math.PI / 2, "Patch rack — uplink (simulated)"),
    },
    portable: ["conv", "ssd", "phones", "micH", "micG", "net"],
  },
  m: {
    scale: "m", code: "AU", title: "The Glass Tower of Switched Images", subtitle: "Auditorium · Multi-destination Live Event",
    instances: {
      sw: I("AU-SW", "roland-v-160hd", "Roland V-160HD"),
      slides: I("AU-LAP", "generic-laptop", "Event Presentation Laptop", { content: "KEYNOTE SLIDES" }),
      cam1: I("AU-CAM-W", "bmd-studio-camera-4k-pro-g2", "Wide Camera (rear FOH)", { content: "CAM WIDE · STAGE" }),
      cam2: I("AU-CAM-C", "bmd-studio-camera-4k-pro-g2", "Close Camera (wing)", { content: "CAM CLOSE · SPEAKER" }),
      mic: I("AU-MIC", "shure-sm58", "Podium SM58", { voice: "PRESENTER VOICE" }),
      mix: I("AU-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      paL: I("AU-PA-L", "generic-active-pa", "Active PA Left"),
      paR: I("AU-PA-R", "generic-active-pa", "Active PA Right"),
      display: I("AU-PROJ", "generic-projector", "Audience Projector"),
      conf: I("AU-CONF", "generic-hdmi-monitor", "Confidence Screen"),
      monitor: I("AU-MV", "generic-hdmi-monitor", "FOH Multiview Monitor"),
      host: I("AU-HOST", "generic-obs-host", "OBS Host Computer"),
      rec: I("AU-REC", "bmd-hyperdeck-studio-hd-plus", "HyperDeck Studio HD Plus"),
      net: I("AU-NET", "generic-gateway", "Network Router"),
      wan: I("AU-WAN", "generic-test-ingest", "Private Test Ingest (WAN)"),
      amp: I("AU-AMP", "generic-power-amp", "Power Amplifier (not for this rig)"),
      phones: I("AU-HEAD", "generic-headphones", "FOH Headphones"),
    },
    places: {
      sw: "sw", monitor: "monitor", rec: "capture", host: "pc", mix: "mix", phones: "rx", slides: "slides", mic: "mic1",
      cam1: { ...camAt(0, 3.95, [0, -5.5], "Rear FOH — wide camera"), p: [0, 0.25, 3.95] },
      cam2: camAt(-8.4, -2.9, [0, -4.8], "Stage-left wing — close-up camera"),
      paL: at(-6.4, 0.8, -5.0, 0.3, "Stage front left — PA (in front of the mic line)"),
      paR: at(6.4, 0.8, -5.0, -0.3, "Stage front right — PA"),
      display: at(8.3, 0, -2.9, -Math.PI / 2, "Stage right — projector input panel"),
      conf: at(5.6, 0.8, -4.2, 0.6, "Downstage right — confidence screen (faces the speaker)"),
      net: at(2.6, 0, 5.95, 0, "Rear service rack — router"),
      wan: at(3.3, 0, 6.8, -Math.PI / 2, "Rear service rack — uplink (simulated)"),
      amp: at(-4.9, 0.85, 7.6, 0, "Rear case — spare amplifier"),
    },
    portable: ["host", "rec", "net", "phones", "amp"],
  },
  l: {
    scale: "l", code: "OUT", title: "The Vault of Ancient Port Seals", subtitle: "Outdoor Production Compound · Ports, Conversion, Patch & Safety",
    instances: {
      cam1: I("OUT-CAM-A", "bmd-studio-camera-4k-pro-g2", "Studio Camera A (east, 15 m)", { content: "CAM-A HOST WIDE" }),
      cam2: I("OUT-CAM-B", "bmd-studio-camera-4k-pro-g2", "Studio Camera B (west, 25 m)", { content: "CAM-B DEMO TABLE" }),
      lap: I("OUT-PC", "generic-laptop", "Presentation Laptop", { content: "FIELD SLIDES" }),
      convHS: I("OUT-CONV-HS", "bmd-micro-converter-hdmi-sdi-3g", "Micro Converter HDMI→SDI 3G"),
      convSH: I("OUT-CONV-SH", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G"),
      vh: I("OUT-VH", "bmd-videohub-10x10-12g", "Videohub 10x10 12G"),
      sw: I("OUT-SW", "bmd-atem-tvs-hd8-iso", "ATEM TV Studio HD8 ISO"),
      mic: I("OUT-MIC", "shure-sm58", "Host SM58", { voice: "HOST VOICE" }),
      mix: I("OUT-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      monitor: I("OUT-MON-MV", "generic-hdmi-monitor", "Field Multiview Display"),
      pgm: I("OUT-MON-PGM", "generic-hdmi-monitor", "Field PGM Display"),
      ssd: I("OUT-SSD", "generic-recording-ssd", "HD8-compatible Recording SSD"),
      net: I("OUT-NET", "generic-gateway", "Primary Wired Gateway"),
      net2: I("OUT-NET-2", "generic-gateway", "Pre-tested Secondary Gateway"),
      wan: I("OUT-WAN", "generic-test-ingest", "Private Test Ingest (WAN)"),
    },
    places: {
      cam1: camAt(6.8, -5.2, [0, -8.0], "East field mark — Camera A (15 m to control)"),
      cam2: camAt(-7.6, -5.0, [0, -8.0], "West field mark — Camera B (25 m to control)"),
      lap: at(0.8, 1.0, -7.5, 0, "Covered host podium — laptop"),
      convHS: at(1.25, 1.0, -7.5, 0, "Covered podium patch — HDMI→SDI next to the laptop"),
      mic: at(0.0, 1.0, -7.2, 0, "Host podium — SM58 with windscreen"),
      mix: "mix", sw: "sw", monitor: "monitor",
      vh: at(1.55, 0.85, 8.15, 0, "Dry rack (shelter) — Videohub"),
      convSH: at(4.6, 0.76, 7.95, 0, "Shelter desk — SDI→HDMI by the PGM display"),
      pgm: at(5.2, 0.76, 7.75, 0, "Shelter desk — PGM display"),
      ssd: at(3.75, 0.76, 8.1, 0, "Shelter desk — recording SSD"),
      net: at(5.85, 0.76, 7.95, 0, "Network service table — primary gateway"),
      net2: at(5.85, 0.76, 8.35, 0, "Network service table — secondary gateway"),
      wan: at(6.75, 0, 8.6, -Math.PI / 2, "Network edge — uplink (simulated)"),
    },
    portable: ["convHS", "convSH", "vh", "ssd", "net2", "mic"],
  },
  xl: {
    scale: "xl", code: "SP", title: "The Throne of Broadcast", subtitle: "Sports Stadium · Multi-camera Outside Broadcast",
    instances: {
      cam1: I("SP-CAM1", "bmd-studio-camera-4k-pro-g2", "CAM 1 Main High/Wide", { content: "CAM 1 MAIN HIGH/WIDE" }),
      cam2: I("SP-CAM2", "bmd-studio-camera-4k-pro-g2", "CAM 2 Sideline", { content: "CAM 2 SIDELINE" }),
      cam3: I("SP-CAM3", "bmd-studio-camera-4k-pro-g2", "CAM 3 Goal/Finish", { content: "CAM 3 GOAL/FINISH" }),
      cam4: I("SP-CAM4", "bmd-studio-camera-4k-pro-g2", "CAM 4 Reaction/Crowd", { content: "CAM 4 REACTION/CROWD" }),
      sw: I("SP-SW", "bmd-atem-2me-constellation-hd", "ATEM 2 M/E Constellation HD"),
      mic1: I("SP-MIC1", "shure-sm58", "Commentator 1 SM58", { voice: "COMMENTATOR 1" }),
      mic2: I("SP-MIC2", "shure-sm58", "Commentator 2 SM58", { voice: "COMMENTATOR 2" }),
      amb: I("SP-AMBIENCE", "generic-ambience-mic", "Ambience Mic (crowd)", { voice: "CROWD AMBIENCE" }),
      mix: I("SP-MIX", "yamaha-mg12xu", "Yamaha MG12XU"),
      phones: I("SP-HEAD", "generic-headphones", "Booth Headphones"),
      gfx: I("SP-GFX", "generic-graphics-pc", "Graphics Computer"),
      convHS: I("SP-CV-HS", "bmd-micro-converter-hdmi-sdi-3g", "Micro Converter HDMI→SDI 3G"),
      convA: I("SP-CV-SH-A", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G (MV)"),
      convB: I("SP-CV-SH-B", "bmd-micro-converter-sdi-hdmi-3g", "Micro Converter SDI→HDMI 3G (PGM)"),
      monitor: I("SP-MV", "generic-hdmi-monitor", "Multiview Display"),
      pgm: I("SP-PGM", "generic-hdmi-monitor", "PGM Confidence Display"),
      enc: I("SP-ENC", "bmd-streaming-encoder-hd", "Streaming Encoder HD"),
      rec: I("SP-REC", "bmd-hyperdeck-studio-hd-plus", "HyperDeck PGM Recorder"),
      play: I("SP-PLAY", "bmd-hyperdeck-studio-hd-plus", "HyperDeck Clip Playback"),
      net: I("SP-NET", "generic-gateway", "Verified Gateway / WAN"),
      wan: I("SP-WAN", "generic-test-ingest", "Private Test Ingest (WAN)"),
    },
    places: {
      cam1: "cam1", cam2: "cam2", cam3: "cam4", cam4: "cam3", sw: "sw", mix: "mix", phones: "rx", monitor: "monitor",
      mic1: "mic0", mic2: "mic1", amb: "mic3", gfx: "graphics",
      convHS: at(-5.6, 0.76, -0.95, 0, "Graphics desk — HDMI→SDI converter"),
      convA: at(-5.4, 0.76, -5.3, 0, "Director desk — MV converter"),
      convB: at(-8.6, 0.76, -5.15, 0, "Director desk — PGM converter"),
      pgm: at(-8.2, 0.76, -5.35, 0, "Director desk — PGM confidence"),
      enc: at(-11.9, 0, -3.8, Math.PI / 2, "Encoder rack"),
      net: at(-11.9, 0, -3.0, Math.PI / 2, "WAN service rack — gateway"),
      wan: at(-11.9, 0, -2.2, Math.PI / 2, "WAN service rack — uplink (simulated)"),
      rec: at(-11.9, 0, -0.2, Math.PI / 2, "Recorder rack — PGM HyperDeck"),
      play: "replay",
    },
    portable: ["convHS", "convA", "convB", "phones", "amb"],
  },
};
