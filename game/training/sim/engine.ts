import { MODELS, portDef } from "./equipment";
import type {
  AudioSignal, ConceptId, ControlValue, DeviceConfig, DeviceView, EquipmentDefinition, EvalContext, NetSignal, ObjectivePredicate, PortDefinition,
  PredicateResult, Signal, SimRuntime, StageManifest, TestStage, UsbSignal, VideoFormat, VideoSignal,
} from "./types";
import { CATEGORY_WEIGHT, DEFAULT_FORMAT, HD_FORMATS } from "./types";

/** A device instance placed in a room: unique instance id + model id + synthetic content/run length. */
export interface DeviceInstance { id: string; model: string; label: string; content?: string; voice?: string; runM?: number }
/** Cable meta for physical-layer checks (length tag and simulated validated 3G rating). */
export interface CableMeta { id: string; label: string; lengthM: number; ratedM?: number }

export interface GraphInput {
  stage: StageManifest;
  devices: Record<string, DeviceInstance>;
  edges: { from: string; to: string; cableId: string }[];
  cables: Record<string, CableMeta>;
  placed: (device: string) => boolean;
  sim: SimRuntime;
}

/* ═════════════ connection rules (reason-coded) ═════════════ */
export interface ConnectVerdict { ok: boolean; code: string; title: string; detail: string; concept: ConceptId }
const verdict = (ok: boolean, code: string, title: string, detail: string, concept: ConceptId): ConnectVerdict => ({ ok, code, title, detail, concept });

export function modelOf(devices: Record<string, DeviceInstance>, device: string): EquipmentDefinition | undefined {
  const inst = devices[device];
  return inst ? MODELS[inst.model] : undefined;
}
export function portOf(devices: Record<string, DeviceInstance>, globalId: string): PortDefinition | undefined {
  const [device, key] = globalId.split(":");
  const inst = devices[device];
  return inst ? portDef(inst.model, key) : undefined;
}

/**
 * Can a cable join these two ports? Called with the two real ports (any order). Rejects direction errors and
 * signal classes that can never work (speaker level into a line input, headphones into a PA, pro line into a
 * consumer jack, USB-C power port as video...). Format/rate, power and configuration are NOT checked here —
 * they are signal-test failures, because the plug genuinely fits.
 */
export function canConnect(devices: Record<string, DeviceInstance>, a: string, b: string): ConnectVerdict {
  const pa = portOf(devices, a), pb = portOf(devices, b);
  if (!pa || !pb) return verdict(false, "UNKNOWN_PORT", "Unknown port", "This socket is not part of the stage graph.", "connector");
  if (a.split(":")[0] === b.split(":")[0]) return verdict(false, "SELF_LOOP", "Loop on one device", "A cable from a device back into itself creates no useful path.", "direction");
  if (pa.dir === pb.dir) {
    return pa.dir === "INPUT"
      ? verdict(false, "INPUT_TO_INPUT", "Input to input", `${pa.name} and ${pb.name} are both INPUTS. A signal must leave an OUTPUT. (A camera RETURN IN is an input, not a picture output.)`, pa.sig === "SDI" ? "return-feed" : "direction")
      : verdict(false, "OUTPUT_TO_OUTPUT", "Output to output", `${pa.name} and ${pb.name} are both OUTPUTS. Two outputs fight each other; connect an output to an input.`, "direction");
  }
  const out = pa.dir === "OUTPUT" ? pa : pb, inp = pa.dir === "OUTPUT" ? pb : pa;
  const s = out.sig, t = inp.sig;
  if (t === "USB_POWER") return verdict(false, "USB_POWER_ONLY", "Power port, not a signal input", `${inp.name} on a Micro Converter is power/configuration only. USB-C here carries no video.`, "usb-role");
  if (s === "SPEAKER") return verdict(false, "SPEAKER_LEVEL", "Speaker-level output", `${out.name} is amplified speaker level. It would overload ${inp.name}; active PAs and switchers need LINE level.`, "speaker-level");
  if (s === "HEADPHONE" && t === "HEADPHONE") return verdict(true, "OK", "Connected", `${out.name} → ${inp.name}`, "speaker-level");
  if (s === "HEADPHONE" && t !== "HEADPHONE") return verdict(false, "HEADPHONE_NOT_LINE", "Headphone output is not a feed", "PHONES is a headphone amplifier for monitoring. Feed PAs and switchers from STEREO or GROUP line outputs.", "speaker-level");
  if (t === "HEADPHONE" && s !== "HEADPHONE") return verdict(false, "NOT_HEADPHONE", "Wrong source for headphones", "Headphones plug into the mixer PHONES output.", "connector");
  const video = (x: string) => x === "HDMI" || x === "SDI";
  if (video(s) || video(t)) {
    if (s !== t) return verdict(false, "VIDEO_CLASS", `${s} ≠ ${t}`, `An ${s} signal cannot enter an ${t} input without a powered, direction-correct Micro Converter.`, "converter-direction");
    return verdict(true, "OK", "Connected", `${out.name} → ${inp.name}`, "direction");
  }
  const audio = (x: string) => x === "MIC" || x === "LINE_BAL" || x === "LINE_UNBAL";
  if (audio(s) && audio(t)) {
    if (s === "LINE_BAL" && t === "LINE_UNBAL") return verdict(false, "PRO_TO_CONSUMER", "Pro line into a consumer jack", "+4 dBu balanced line into an unbalanced −10 dBV 3.5 mm input overloads it. Use the Generic Training Balanced-to-Unbalanced Line Interface with attenuation.", "consumer-level");
    return verdict(true, "OK", "Connected", `${out.name} → ${inp.name}`, "direction");
  }
  if ((s === "USB_UAC" || s === "USB_UVC" || s === "USB_STORAGE") && (t === "USB_UVC" || t === "USB_STORAGE" || t === "USB_UAC")) {
    if (s === "USB_UAC" && t === "USB_STORAGE") return verdict(false, "USB_ROLE", "USB audio is not a disk", "The mixer's USB audio interface talks to a computer, not to a recording disk.", "usb-role");
    return verdict(true, "OK", "Connected", `${out.name} → ${inp.name}`, "usb-role");
  }
  if (s === "ETHERNET" && t === "ETHERNET") return verdict(true, "OK", "Connected", `${out.name} → ${inp.name} (role decided by the device: control or stream)`, "eth-role");
  if (s === "WAN" && t === "WAN") return verdict(true, "OK", "Connected", `${out.name} → ${inp.name}`, "wan");
  if (s === "ETHERNET" && t === "WAN") return verdict(false, "LAN_TO_INGEST", "No gateway", "A device's LAN port is not an Internet uplink. Go through the gateway's LAN, then its WAN.", "wan");
  return verdict(false, "SIGNAL_CLASS", "Incompatible signal", `${out.name} (${s}) cannot feed ${inp.name} (${t}).`, "connector");
}

/* ═════════════ signal propagation ═════════════ */
export function runBetween(stage: StageManifest, a: string, b: string): number {
  return stage.runs?.[[a, b].sort().join("|")] ?? 2;
}
const uniq = (xs: string[]) => [...new Set(xs)];
const isVoice = (s: string) => /VOICE|COMMENTATOR/.test(s);
const isCamMic = (s: string) => s.startsWith("CAM MIC");
function inputKeyFromOption(model: EquipmentDefinition, option: string | undefined): string | undefined {
  if (!option || option === "Black") return undefined;
  const [kind, n] = option.split(" ");
  const key = `${kind.toLowerCase()}-in-${n}`;
  return model.ports.some((x) => x.key === key) ? key : undefined;
}

interface Work { out: Record<string, Signal | undefined>; inp: Record<string, Signal | undefined>; view: Record<string, DeviceView>; edgeProblem: Record<string, { code: string; text: string; fix: string; concept: ConceptId }> }

export function cfgOf(sim: SimRuntime, devices: Record<string, DeviceInstance>, device: string, key: string): ControlValue | undefined {
  const own = sim.config[device]?.[key];
  if (own !== undefined) return own;
  return modelOf(devices, device)?.controls.find((c) => c.key === key)?.default;
}

export function evaluate(g: GraphInput): EvalContext {
  const { devices, edges, sim } = g;
  const cfg = (d: string, k: string) => cfgOf(sim, devices, d, k);
  const powered = (d: string) => { const m = modelOf(devices, d); return Boolean(m) && g.placed(d) && (!m!.needsPower || cfg(d, "power") === true); };
  const w: Work = { out: {}, inp: {}, view: {}, edgeProblem: {} };

  for (let pass = 0; pass < 14; pass++) {
    const inp: Record<string, Signal | undefined> = {};
    for (const e of edges) {
      const sig = w.out[e.from];
      if (!sig) continue;
      // Physical layer: the lead must reach the measured run AND stay within its validated length for the signal
      // (cable construction + rate). Never assumed from the connector shape.
      const meta = g.cables[e.cableId];
      const run = runBetween(g.stage, e.from.split(":")[0], e.to.split(":")[0]);
      if (meta && (meta.lengthM < run || (meta.ratedM !== undefined && meta.ratedM < meta.lengthM))) {
        w.edgeProblem[e.to] = meta.lengthM < run
          ? { code: "CABLE_SHORT", text: `${meta.label} is ${meta.lengthM} m but the run is ${run} m.`, fix: "Use a tested cable long enough for the measured run.", concept: "cable-run" }
          : { code: "CABLE_RATING", text: `${meta.label}: validated only to ${meta.ratedM} m for this signal — no reliable lock at ${meta.lengthM} m.`, fix: "Use a tested lead rated for the full length (see the spool tag), or convert to 3G-SDI near the source.", concept: "cable-run" };
        continue;
      }
      inp[e.to] = { ...sig, via: [...sig.via, e.cableId] } as Signal;
    }
    w.inp = inp;
    const out: Record<string, Signal | undefined> = {};
    for (const id of Object.keys(devices)) Object.assign(out, processDevice(id, devices, inp, cfg, powered, w));
    w.out = out;
  }
  const edgesResolved = edges;
  return {
    stage: g.stage, sim, out: w.out, inp: w.inp, edges: edgesResolved, placed: g.placed, cfg, view: w.view,
  };
}

function processDevice(id: string, devices: Record<string, DeviceInstance>, inp: Record<string, Signal | undefined>,
  cfg: (d: string, k: string) => ControlValue | undefined, powered: (d: string) => boolean, w: Work): Record<string, Signal | undefined> {
  const inst = devices[id];
  const m = MODELS[inst.model];
  const out: Record<string, Signal | undefined> = {};
  const P = (k: string) => `${id}:${k}`;
  const I = (k: string) => inp[P(k)];
  const on = powered(id);
  const view: DeviceView = { powered: on, status: on ? "Ready" : m.needsPower ? "POWER OFF" : "Idle" };
  const problem = (code: string, concept: ConceptId, text: string, fix: string) => { if (!view.problem) view.problem = { code, concept, text, fix }; };
  w.view[id] = view;
  if (!on) {
    if (m.needsPower) {
      problem("POWER", "power", g_placedText(inst.label), "Complete the power check for this device (abstracted, pre-installed supply).");
      return out;
    }
  }
  const video = (cls: "HDMI" | "SDI", format: VideoFormat, content: string, audio: string[]): VideoSignal => ({ kind: "video", cls, format, content, audio, via: [] });
  const voice = inst.voice ?? inst.content ?? inst.label.toUpperCase();

  switch (m.role) {
    case "source": {
      let content = inst.content ?? inst.label;
      const fmt = (cfg(id, "format") as VideoFormat) ?? "1080p50";
      const camAudio = m.kind === "camera" && cfg(id, "cam-audio") !== false ? [`CAM MIC (${inst.label.replace(/ \(.*/, "")})`] : [];
      if (inst.model === "generic-laptop") {
        if (cfg(id, "present") !== true) { content = "DESKTOP (presentation mode off)"; problem("PRESENTATION_OFF", "output-assign", "Laptop is showing its desktop, not the slideshow.", "Enable presentation mode on the laptop."); }
        if (cfg(id, "mute-audio") !== true) camAudio.push("LAPTOP SYSTEM SOUNDS");
      }
      if (inst.model === "generic-graphics-pc") {
        { const t = String(cfg(id, "template")); content = t.startsWith("Scoreboard") ? `SCOREBOARD ${cfg(id, "score")}` : t.startsWith("Holding") ? "HOLDING SLATE" : "GFX TEST PATTERN"; }
      }
      if ((m.kind === "camera" || inst.model === "generic-doc-camera") && String(cfg(id, "framing") ?? "").startsWith("Not")) view.status = "Shot not framed";
      for (const port of m.ports.filter((x) => x.dir === "OUTPUT")) out[P(port.key)] = video(port.sig as "HDMI" | "SDI", fmt, content, camAudio);
      view.picture = content;
      const ret = I("sdi-ret");
      if (ret?.kind === "video") view.audio = [`RETURN: ${ret.content}`];
      if (fmt === "2160p50") view.status = "Outputting 2160p50 (UHD)";
      break;
    }
    case "mic": {
      const sources = [voice];
      if (inst.model === "generic-ambience-mic" && cfg(id, "windscreen") !== true) { sources.push("WIND NOISE"); problem("WIND", "clipping", "Ambience mic has no windscreen — wind rumble on air.", "Fit the rugged windscreen."); }
      out[P("xlr-out")] = { kind: "audio", cls: "MIC", sources, clip: false, via: [] };
      view.audio = sources;
      if (cfg(id, "aim") === "Toward PA loudspeaker") view.status = "Capsule aimed at the PA";
      break;
    }
    case "mixer": {
      const chans = [1, 2, 3].map((n) => {
        const s = I(`mic-${n}`);
        const gain = String(cfg(id, `ch${n}-gain`));
        const live = s?.kind === "audio" && cfg(id, `ch${n}-on`) === true && !gain.startsWith("Minimum");
        return { n, s: s as AudioSignal | undefined, gain, live, st: cfg(id, `ch${n}-st`) === true, grp: cfg(id, `ch${n}-grp`) === true };
      });
      const mix = (pick: (c: (typeof chans)[number]) => boolean, fader: string): AudioSignal | undefined => {
        if (fader !== "Unity") return { kind: "audio", cls: "LINE_BAL", sources: [], clip: false, via: [] };
        const used = chans.filter((c) => c.live && pick(c));
        return { kind: "audio", cls: "LINE_BAL", sources: uniq(used.flatMap((c) => c.s!.sources)), clip: used.some((c) => c.gain.startsWith("Too hot") || c.s!.clip), via: [] };
      };
      const st = mix((c) => c.st, String(cfg(id, "st-fader")));
      const grp = mix((c) => c.grp, String(cfg(id, "grp-fader")));
      out[P("st-l")] = st; out[P("st-r")] = st;
      out[P("grp-1")] = grp; out[P("grp-2")] = grp;
      out[P("phones")] = st && { ...st, cls: "HEADPHONE" };
      out[P("usb")] = st && { kind: "usb", cls: "USB_UAC", audio: st.sources, via: [] };
      view.audio = st?.sources ?? [];
      view.clip = Boolean(st?.clip || grp?.clip);
      for (const c of chans) {
        if (c.s && cfg(id, `ch${c.n}-on`) !== true) problem("MUTED", "mute", `CH${c.n} is muted (ON switch off).`, `Press CH${c.n} ON.`);
        if (c.s && c.gain.startsWith("Minimum")) problem("NO_GAIN", "clipping", `CH${c.n} gain is at minimum — the meter barely moves.`, "Raise GAIN until speech peaks around −18 dBFS.");
        if (c.live && c.gain.startsWith("Too hot")) problem("CLIP", "clipping", `CH${c.n} PEAK lamp is red — the preamp clips.`, "Lower GAIN to Nominal.");
      }
      view.status = view.clip ? "PEAK — clipping" : st && st.sources.length ? `ST meter: ${st.sources.join(" + ")}` : "Meters idle";
      break;
    }
    case "interface": {
      const l = I("in-l") as AudioSignal | undefined, r = I("in-r") as AudioSignal | undefined;
      if (l || r) {
        const pad = String(cfg(id, "atten")).startsWith("−12");
        out[P("out")] = { kind: "audio", cls: "LINE_UNBAL", sources: uniq([...(l?.sources ?? []), ...(r?.sources ?? [])]), clip: !pad || Boolean(l?.clip || r?.clip), via: [] };
        if (!pad) problem("NO_PAD", "consumer-level", "Interface bypassed (0 dB): +4 dBu into a −10 dBV input will overload.", "Set attenuation to −12 dB.");
        if (!l || !r) problem("ONE_SIDE", "connector", "Only one side (L or R) of the stereo pair is connected.", "Connect both STEREO OUT L and R.");
      }
      break;
    }
    case "converter": {
      const s = I(m.ports.find((x) => x.dir === "INPUT" && x.sig !== "USB_POWER")!.key);
      const o = m.ports.find((x) => x.dir === "OUTPUT")!;
      if (s?.kind === "video") {
        if (!HD_FORMATS.includes(s.format)) problem("SDI_RATE", "sdi-rate", `${s.format} cannot pass a 3G converter.`, "Set the source to 1080p50.");
        else out[P(o.key)] = { ...s, cls: o.sig as "HDMI" | "SDI", via: [] };
      }
      view.status = s ? "Signal lock" : "No input";
      break;
    }
    case "router": {
      for (const n of [1, 2, 3, 4]) {
        const xp = String(cfg(id, `xp-${n}`)).split(" ")[1];
        const s = I(`in-${xp}`);
        if (s) out[P(`out-${n}`)] = { ...s, via: [] } as Signal;
      }
      view.status = `Crosspoints: ${[1, 2, 3, 4].map((n) => `O${n}←${String(cfg(id, `xp-${n}`)).replace("IN ", "I")}`).join(" ")}`;
      break;
    }
    case "switcher": {
      const converts = inst.model === "bmd-atem-mini-pro-iso" || inst.model === "bmd-atem-2me-constellation-hd";
      const valid: Record<string, VideoSignal> = {};
      const labels: string[] = [];
      for (const port of m.ports.filter((x) => x.dir === "INPUT" && (x.sig === "HDMI" || x.sig === "SDI"))) {
        const s = I(port.key);
        if (s?.kind !== "video") continue;
        if (!HD_FORMATS.includes(s.format)) { problem("SDI_RATE", "sdi-rate", `${port.name}: ${s.format} UNSUPPORTED on this HD 3G input.`, "Set the camera output to 1080p50."); continue; }
        if (!converts && s.format !== DEFAULT_FORMAT) { problem("FORMAT_MISMATCH", "sdi-rate", `${port.name}: ${s.format} does not match the 1080p50 video standard (no input conversion).`, "Set the source to 1080p50."); continue; }
        valid[port.key] = s; labels.push(s.content);
      }
      const pgmKey = inputKeyFromOption(m, String(cfg(id, "pgm")));
      const pvwKey = inputKeyFromOption(m, String(cfg(id, "pvw")));
      const pgm = pgmKey && valid[pgmKey] ? valid[pgmKey].content : "BLACK";
      const pvw = pvwKey && valid[pvwKey] ? valid[pvwKey].content : "BLACK";
      // Program audio (Fairlight / Roland mixer)
      const audio: string[] = [];
      let clip = false, missingSide = false, low = false;
      const analog = (keys: string[], enable: string, consumerMode?: string) => {
        const sigs = keys.map((k) => I(k) as AudioSignal | undefined);
        if (cfg(id, enable) !== true) { if (sigs.some(Boolean)) problem("ANALOG_OFF", "mute", "Analog audio input is connected but not enabled in the switcher mixer.", "Turn the analog input ON in the switcher audio mixer."); return; }
        for (const s of sigs) if (s) {
          audio.push(...s.sources); clip ||= s.clip;
          if (s.cls === "MIC") { low = true; problem("MIC_INTO_LINE", "mic-line-level", "A microphone is plugged straight into a LINE input — far too quiet.", "Route the mic through the mixer preamp; feed the switcher from a line output."); }
          if (consumerMode && cfg(id, consumerMode) === "MIC" && (s.cls === "LINE_UNBAL" || s.cls === "LINE_BAL")) { clip = true; problem("LEVEL_MODE", "consumer-level", "Line-level feed into an input set to MIC — distortion.", "Set the switcher input level to LINE."); }
        }
        if (keys.length === 2 && sigs.filter(Boolean).length === 1) missingSide = true;
      };
      if (inst.model === "bmd-atem-mini-pro-iso") analog(["mic-1"], "mic1-on", "mic1-mode");
      if (inst.model === "bmd-atem-tvs-hd8-iso") analog(["xlr-1", "xlr-2"], "xlr-on");
      if (inst.model === "bmd-atem-2me-constellation-hd") analog(["aud-l", "aud-r"], "analog-on");
      if (inst.model === "roland-v-160hd") analog(["ain-1", "ain-2"], "ain-on", "ain-mode");
      const emb = String(cfg(id, "emb-audio"));
      if (emb === "ON") for (const s of Object.values(valid)) audio.push(...s.audio);
      if (emb === "AFV" && pgmKey && valid[pgmKey]) audio.push(...valid[pgmKey].audio);
      const pgmAudio = uniq(audio);
      const doubled = pgmAudio.some(isVoice) && pgmAudio.some(isCamMic);
      if (doubled) problem("DOUBLED", "afv-doubling", "The voice reaches Program twice (mic + camera mic) — phasey, doubled speech.", "Set embedded camera audio OFF (or AFV off) so only the mixer feed carries the voice.");
      if (missingSide) problem("ONE_SIDE", "connector", "Only one of the L/R analog inputs is connected.", "Connect both line outputs.");
      const mvContent = `MULTIVIEW [${labels.join(" | ")}]`;
      const role = (k: string): string | undefined => {
        const v = String(cfg(id, k) ?? "");
        if (v === "PROGRAM" || v.startsWith("AUX (clean)") || v === "CLEAN FEED") return pgm;
        if (v === "MULTIVIEW") return mvContent;
        if (v === "PREVIEW") return pvw;
        if (v === "CAM RETURN") return `RETURN ${pgm}`;
        if (v === "AUX") { const k2 = inputKeyFromOption(m, String(cfg(id, "aux"))); return k2 && valid[k2] ? valid[k2].content : "BLACK"; }
        return undefined;
      };
      const vs = (cls: "HDMI" | "SDI", content: string | undefined): VideoSignal | undefined => content === undefined ? undefined : { kind: "video", cls, format: DEFAULT_FORMAT, content, audio: content.startsWith("MULTIVIEW") ? [] : pgmAudio, via: [] };
      for (const port of m.ports.filter((x) => x.dir === "OUTPUT")) {
        const k = port.key;
        if (k === "hdmi-mv" || k === "mv-out") out[P(k)] = vs(port.sig as "HDMI" | "SDI", mvContent);
        else if (k === "hdmi-out" && inst.model === "bmd-atem-mini-pro-iso") out[P(k)] = vs("HDMI", role("hdmi-out"));
        else if (k.startsWith("hdmi-out-") || k.startsWith("sdi-out-")) out[P(k)] = vs(port.sig as "HDMI" | "SDI", role(k));
        else if (k === "usb") {
          if (inst.model === "bmd-atem-tvs-hd8-iso" || (inst.model === "bmd-atem-mini-pro-iso" && cfg(id, "usb-mode") === "Record to disk")) {
            out[P(k)] = { kind: "usb", cls: "USB_STORAGE", content: cfg(id, "record") === true ? `PGM + ISO ×${Object.keys(valid).length}` : undefined, audio: pgmAudio, via: [] };
          } else out[P(k)] = { kind: "usb", cls: "USB_UVC", content: pgm, audio: pgmAudio, via: [] };
        } else if (k === "eth" || k === "lan") {
          const canStream = inst.model === "bmd-atem-mini-pro-iso" || inst.model === "bmd-atem-tvs-hd8-iso";
          const keyOk = String(cfg(id, "stream-key")).startsWith("•");
          out[P(k)] = canStream && cfg(id, "stream") === true ? { kind: "net", role: "stream", content: pgm, audio: pgmAudio, via: [], keyOk } : { kind: "net", role: "control", audio: [], via: [], keyOk: false };
        }
      }
      if (pgm === "BLACK") view.status = "Program: BLACK";
      view.picture = pgm; view.audio = pgmAudio; view.clip = clip;
      view.status = `PGM ${pgm} · PVW ${pvw}${low ? " · audio LOW" : ""}`;
      (view as DeviceView & { inputs?: string[] }).inputs = labels;
      break;
    }
    case "encoder": {
      const s = I("sdi-in");
      const keyOk = String(cfg(id, "stream-key")).startsWith("•");
      if (s?.kind === "video") {
        out[P("hdmi-mon")] = { ...s, cls: "HDMI", via: [] };
        if (s.format !== cfg(id, "format")) problem("ENC_FORMAT", "sdi-rate", `Encoder set to ${cfg(id, "format")} but input is ${s.format}.`, "Set the encoder to 1080p50.");
        else if (!keyOk) problem("NO_KEY", "stream-key", "No stream key entered (placeholder only).", "Enter the private test key (redacted).");
        else if (cfg(id, "stream") !== true) problem("NOT_ON_AIR", "stream-key", "Encoder is not ON AIR.", "Press ON AIR.");
        else out[P("eth")] = { kind: "net", role: "stream", content: s.content, audio: s.audio, via: [], keyOk };
      } else problem("NO_INPUT", "output-assign", "Encoder has no SDI input.", "Feed it from an assigned Program SDI output.");
      view.picture = s?.kind === "video" ? s.content : undefined;
      view.status = out[P("eth")] ? "ENCODING · streaming" : view.problem?.text ?? "Idle";
      break;
    }
    case "host": {
      const ins = [I("usb-1"), I("usb-2")].filter(Boolean) as UsbSignal[];
      const uvc = ins.find((s) => s.cls === "USB_UVC"), uac = ins.find((s) => s.cls === "USB_UAC");
      const picture = cfg(id, "video-src") === "USB video capture device" && uvc ? uvc.content : undefined;
      if (cfg(id, "video-src") !== "None" && !uvc) problem("NO_CAPTURE", "obs-source", "OBS video source selected but no USB video device is connected.", "Connect the switcher USB webcam/stream port to the host.");
      if (cfg(id, "video-src") === "None") problem("NO_VIDEO_SRC", "obs-source", "OBS has no video source selected.", "Add the USB video capture device as the source.");
      const a = String(cfg(id, "audio-src"));
      let audio: string[] = [];
      let needSync = 0;
      if (a === "USB capture embedded audio") audio = uvc?.audio ?? [];
      if (a === "USB audio interface (mixer)") { audio = uac?.audio ?? []; needSync = uvc ? 80 : 0; if (!uac) problem("NO_UAC", "obs-source", "OBS audio set to the mixer USB interface, but it is not connected.", "Connect the mixer USB to the host."); }
      if (a === "Built-in laptop mic") audio = ["ROOM SOUND (built-in mic)"];
      if (cfg(id, "extra-mic") === true) audio = [...audio, "ROOM SOUND (desktop mic)"];
      const echo = audio.some(isVoice) && audio.some((x) => x.startsWith("ROOM SOUND"));
      if (echo) problem("ECHO", "obs-source", "Two mics feed OBS — room echo / doubled voice.", "Disable the extra desktop/built-in mic; keep one programme source.");
      const off = Number(String(cfg(id, "sync")).replace(/[^0-9]/g, "")) || 0;
      const syncErr = audio.some(isVoice) ? Math.abs(needSync - off) : 0;
      if (syncErr > 40) problem("AV_SYNC", "obs-source", `Clap test: audio leads video by ${needSync - off} ms.`, `Set the OBS audio sync offset to +${needSync} ms.`);
      const keyOk = String(cfg(id, "stream-key")).startsWith("•");
      if (picture && cfg(id, "stream") === true && keyOk) out[P("eth")] = { kind: "net", role: "stream", content: picture, audio, via: [], keyOk };
      else out[P("eth")] = { kind: "net", role: "control", audio: [], via: [], keyOk };
      view.picture = picture; view.audio = audio; view.clip = false;
      view.recording = Boolean(picture && cfg(id, "record") === true);
      view.file = view.recording ? `OBS local recording (60 s test) · ${picture}` : undefined;
      (view as DeviceView & { syncErr?: number }).syncErr = syncErr;
      view.status = `OBS · ${picture ?? "no video"} · ${audio.join(" + ") || "no audio"}`;
      break;
    }
    case "network": {
      const lans = [I("lan-1"), I("lan-2")].filter((s): s is NetSignal => s?.kind === "net");
      const stream = lans.find((s) => s.role === "stream");
      const down = String(cfg(id, "wan-link")).startsWith("Down");
      out[P("wan")] = down ? undefined : stream ?? (lans[0] ? { ...lans[0], via: [] } : undefined);
      if (down) problem("WAN_DOWN", "wan", "Gateway reports WAN DOWN (ISP outage).", "Move the stream to the pre-tested secondary gateway, if one is provided.");
      view.status = down ? "WAN DOWN" : stream ? "Routing stream to WAN" : lans.length ? "LAN up (control traffic only)" : "No LAN client";
      break;
    }
    case "ingest": {
      const s = I("wan-in") as NetSignal | undefined;
      const upload = String(cfg(id, "upload"));
      if (!s) { view.status = "Viewer: OFFLINE (no uplink)"; problem("WAN", "wan", "No WAN uplink reaches the test ingest.", "Connect the gateway WAN to the uplink and verify the router path."); }
      else if (s.role !== "stream") { view.status = "Viewer: waiting — only control traffic arrives"; problem("NO_STREAM", "eth-role", "Network is connected but nothing is streaming (control-only Ethernet or encoder off).", "Stream from a device that actually encodes (built-in RTMP, Streaming Encoder HD or OBS host)."); }
      else if (!s.keyOk) { view.status = "Ingest rejected: stream key missing"; problem("KEY", "stream-key", "Ingest rejected the connection — no stream key.", "Enter the private test key."); }
      else if (upload.startsWith("3")) { view.status = "Viewer: buffering — dropped frames (upload 3 Mbps unstable)"; problem("UPLOAD", "wan", "Upload is too low/unstable for 1080p50 — dropped frames (network, not Program).", "Switch to a tested uplink with ≥ 10 Mbps stable upload."); view.picture = s.content; }
      else { view.live = true; view.picture = s.content; view.audio = s.audio; view.status = `Viewer LIVE · ${s.content}`; }
      break;
    }
    case "display": {
      const keys = m.ports.filter((x) => x.dir === "INPUT").map((x) => x.key);
      const selKey = keys.length > 1 ? `hdmi-in-${String(cfg(id, "source")).split(" ")[1]}` : keys[0];
      const s = I(selKey);
      const other = keys.find((k) => k !== selKey && I(k));
      if (s?.kind === "video") { view.picture = s.content; view.status = s.content; }
      else { view.status = other ? `NO SIGNAL on ${String(cfg(id, "source"))} (signal present on another input)` : "NO SIGNAL"; if (other) problem("WRONG_INPUT", "output-assign", "Display is set to the wrong HDMI input.", "Select the input that carries the feed."); }
      break;
    }
    case "speaker": {
      const s = I(m.ports[0].key) as AudioSignal | undefined;
      if (inst.model === "generic-active-pa") {
        const lvl = String(cfg(id, "level"));
        if (!s) view.status = "No input";
        else if (lvl === "Off") { view.status = "Level off"; problem("PA_OFF", "mute", "PA level is off.", "Bring the PA level up to Nominal."); }
        else {
          view.audio = s.sources; view.clip = s.clip;
          const micAimedAtPa = Object.keys(devices).some((d) => devices[d].model === "shure-sm58" && cfg(d, "aim") === "Toward PA loudspeaker" && s.sources.includes(devices[d].voice ?? devices[d].content ?? ""));
          view.feedback = s.sources.some(isVoice) && (micAimedAtPa || lvl === "Hot" || String(cfg(id, "aim")).startsWith("Behind"));
          if (view.feedback) problem("FEEDBACK", "feedback", "Howl-round: the PA is feeding back into the podium mic.", "Aim the mic at the talker, keep PAs in front of the mic and set level to Nominal.");
          view.status = view.feedback ? "FEEDBACK — howling" : `Audible: ${s.sources.join(" + ") || "silence"}`;
        }
      } else { view.audio = s?.sources ?? []; view.status = s ? `Listening: ${s.sources.join(" + ") || "silence"}` : "No input"; }
      break;
    }
    case "recorder": {
      const s = I("sdi-in") as VideoSignal | undefined;
      const media = String(cfg(id, "media"));
      if (cfg(id, "clip") === true && cfg(id, "play") === true) out[P("sdi-out")] = video("SDI", DEFAULT_FORMAT, "REPLAY CLIP (pre-loaded, verified)", []);
      if (cfg(id, "record") === true) {
        if (!media.includes("mounted")) problem("NO_MEDIA", "storage", "REC pressed but no media is mounted.", "Insert and mount approved media.");
        else if (media.includes("FULL")) problem("MEDIA_FULL", "storage", "Media is full — recording stopped.", "Swap to formatted media with free space.");
        else if (!s) problem("REC_NO_INPUT", "output-assign", "Recording black — no SDI input.", "Feed the recorder from an assigned Program output.");
        else { view.recording = true; view.file = `Clip0001.mov · ${s.content} · ${s.audio.join(" + ") || "no audio"}`; }
      }
      view.picture = s?.content;
      view.status = view.recording ? `● REC ${s?.content}` : view.problem?.text ?? (s ? `Input: ${s.content}` : "No input");
      break;
    }
    case "storage": {
      const s = I("usb") as UsbSignal | undefined;
      const state = String(cfg(id, "state"));
      if (!s) { view.status = "Not connected"; break; }
      if (s.cls !== "USB_STORAGE") { problem("USB_MODE", "usb-role", "The switcher USB-C is in Webcam mode, not Record to disk.", "Set USB-C to Record to disk."); view.status = "Connected · not used for recording"; break; }
      if (!state.startsWith("Mounted · 4")) { problem(state.includes("FULL") ? "MEDIA_FULL" : "NO_MEDIA", "storage", state.includes("FULL") ? "Disk is full." : "Disk is not mounted.", state.includes("FULL") ? "Swap/format a disk with free space." : "Mount (format exFAT) the SSD."); view.status = state; break; }
      if (s.content) { view.recording = true; view.file = `${s.content} · audio: ${s.audio.join(" + ") || "none"}`; view.status = `● REC ${s.content}`; }
      else view.status = "Mounted · not recording";
      break;
    }
    case "decoy": case "safety": break;
  }
  return out;
}

const g_placedText = (label: string) => `${label} is not powered (or not installed at its position).`;

/* ═════════════ diagnostics: trace back along the ACTUAL graph ═════════════ */
/** Upstream input ports that feed this output (by device role). */
function upstream(devices: Record<string, DeviceInstance>, ctx: EvalContext, device: string): string[] {
  const m = modelOf(devices, device)!;
  const ins = m.ports.filter((x) => x.dir === "INPUT" && x.sig !== "USB_POWER").map((x) => `${device}:${x.key}`);
  return ins.filter((p) => ctx.edges.some((e) => e.to === p));
}

export interface TraceHop { node: string; port?: string; cable?: string; ok: boolean; note: string }
/**
 * Walk from a destination device back toward its sources along real cables and report every hop
 * (`node -> port -> cable -> node -> port`) plus the FIRST faulty node from the source side.
 */
export function traceTo(devices: Record<string, DeviceInstance>, ctx: EvalContext, dest: string, cables: Record<string, CableMeta>): { hops: TraceHop[]; first?: TraceHop & { fix?: string; concept?: ConceptId } } {
  const hops: TraceHop[] = [];
  const seen = new Set<string>();
  const walk = (device: string, depth: number) => {
    if (seen.has(device) || depth > 9) return;
    seen.add(device);
    const v = ctx.view[device];
    hops.unshift({ node: devices[device]?.label ?? device, ok: !v?.problem, note: v?.problem ? `${v.problem.code}: ${v.problem.text}` : v?.status ?? "" });
    for (const port of upstream(devices, ctx, device)) {
      const e = ctx.edges.find((x) => x.to === port)!;
      const pin = portOf(devices, port)!, pout = portOf(devices, e.from)!;
      const sig = ctx.inp[port];
      hops.unshift({ node: devices[e.from.split(":")[0]]?.label ?? e.from, port: `${pout.name} → [${cables[e.cableId]?.label ?? e.cableId}] → ${devices[device].label} ${pin.name}`, cable: e.cableId, ok: Boolean(sig), note: sig ? describe(sig) : "no signal on this cable" });
      walk(e.from.split(":")[0], depth + 1);
    }
  };
  walk(dest, 0);
  const firstBad = hops.find((h) => !h.ok);
  let first: (TraceHop & { fix?: string; concept?: ConceptId }) | undefined;
  if (firstBad) {
    const dev = Object.keys(devices).find((d) => devices[d].label === firstBad.node && ctx.view[d]?.problem);
    const pr = dev ? ctx.view[dev]!.problem : undefined;
    first = { ...firstBad, fix: pr?.fix ?? "Check the cable and the upstream device's output assignment.", concept: pr?.concept };
  }
  return { hops, first };
}
export function describe(s: Signal): string {
  if (s.kind === "video") return `${s.cls} ${s.format} · ${s.content}${s.audio.length ? ` · emb ${s.audio.join("+")}` : ""}`;
  if (s.kind === "audio") return `${s.cls} · ${s.sources.join("+") || "silence"}${s.clip ? " · CLIP" : ""}`;
  if (s.kind === "usb") return `${s.cls}${s.content ? ` · ${s.content}` : ""}`;
  return `Ethernet ${s.role}${s.content ? ` · ${s.content}` : ""}`;
}

/** resolve_chain: does `required` reach `dest` and which hops did it take? */
export function resolveChain(ctx: EvalContext, source: string, destPort: string): { ok: boolean; via: string[] } {
  const s = ctx.inp[destPort];
  if (!s) return { ok: false, via: [] };
  const content = s.kind === "video" ? s.content : s.kind === "audio" ? s.sources.join("+") : s.kind === "usb" ? s.content ?? "" : s.content ?? "";
  return { ok: content.includes(source) || (s.kind === "audio" && s.sources.includes(source)), via: s.via };
}

/* ═════════════ validation + scoring ═════════════ */
export interface StageResult { id: string; label: string; category: ObjectivePredicate["category"]; stage: TestStage; critical: boolean; result: PredicateResult; concept: ConceptId }
export function validateLevel(ctx: EvalContext, upTo?: TestStage): StageResult[] {
  const order: TestStage[] = ["physical", "signal", "rehearsal", "delivery"];
  const max = upTo ? order.indexOf(upTo) : 3;
  return ctx.stage.objectives.filter((o) => order.indexOf(o.stage) <= max).map((o) => ({ id: o.id, label: o.label, category: o.category, stage: o.stage, critical: Boolean(o.critical), result: safe(o, ctx), concept: o.concept }));
}
function safe(o: ObjectivePredicate, ctx: EvalContext): PredicateResult { try { return o.check(ctx); } catch (e) { return { ok: false, reason: `Check error: ${(e as Error).message}` }; } }
/** test_route: one test stage; passes when all its objectives pass. */
export function testRoute(ctx: EvalContext, stage: TestStage): { pass: boolean; results: StageResult[] } {
  const results = validateLevel(ctx, stage).filter((r) => r.stage === stage);
  return { pass: results.every((r) => r.result.ok), results };
}

export function scoreOf(results: StageResult[], sim: SimRuntime): { score: number; grade: "CERTIFIED" | "PASS" | "RETRY"; criticalOk: boolean; byCategory: Record<string, number> } {
  const cats = [...new Set(results.map((r) => r.category))];
  const totalW = cats.reduce((s, c) => s + CATEGORY_WEIGHT[c], 0);
  const byCategory: Record<string, number> = {};
  let score = 0;
  for (const c of cats) {
    const rs = results.filter((r) => r.category === c);
    const frac = rs.filter((r) => r.result.ok).length / rs.length;
    byCategory[c] = Math.round(frac * 100);
    score += (CATEGORY_WEIGHT[c] / totalW) * frac * 100;
  }
  // Errors cost a little (deterministic): 1 point each, max 10.
  score = Math.max(0, Math.round(score - Math.min(10, sim.totalErrors)));
  const criticalOk = results.filter((r) => r.critical).every((r) => r.result.ok) && !sim.log.some((l) => l.code === "SAFETY_BYPASS");
  const grade = criticalOk && score >= 85 ? "CERTIFIED" : criticalOk && score >= 70 ? "PASS" : "RETRY";
  return { score, grade, criticalOk, byCategory };
}

export type { DeviceConfig };
