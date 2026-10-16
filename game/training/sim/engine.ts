import { MODELS, portDef } from "./equipment";
import type {
  AudioSignal, ConceptId, ControlValue, DeviceConfig, DeviceView, EquipmentDefinition, EvalContext, NetSignal, ObjectivePredicate, PortDefinition,
  PredicateResult, Signal, SimRuntime, StageManifest, TestStage, UsbSignal, VideoFormat, VideoSignal,
} from "./types";
import { CATEGORY_WEIGHT, DEFAULT_FORMAT, HD_FORMATS } from "./types";

/** A device instance placed in a room: unique instance id + model id + synthetic content/run length. */
export interface DeviceInstance { id: string; model: string; label: string; content?: string; voice?: string; runM?: number; /** wireless RX: the TX instance it can pair with */ pairWith?: string }
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
  if (!pa || !pb) return verdict(false, "UNKNOWN_PORT", "ไม่พบพอร์ต", "พอร์ตนี้ไม่อยู่ในระบบของด่าน", "connector");
  if (a.split(":")[0] === b.split(":")[0]) return verdict(false, "SELF_LOOP", "ต่อวนในอุปกรณ์เดียวกัน", "ต่อสายย้อนเข้าอุปกรณ์เดิมไม่ทำให้เกิดเส้นทางใช้งาน", "direction");
  if (pa.dir === pb.dir) {
    return pa.dir === "INPUT"
      ? verdict(false, "INPUT_TO_INPUT", "ขาเข้าชนขาเข้า", `${pa.name} และ ${pb.name} เป็นขาเข้าทั้งคู่ สัญญาณต้องออกจากขาออก โดย RETURN IN ของกล้องเป็นขาเข้า ไม่ใช่ขาออกภาพ`, pa.sig === "SDI" ? "return-feed" : "direction")
      : verdict(false, "OUTPUT_TO_OUTPUT", "ขาออกชนขาออก", `${pa.name} และ ${pb.name} เป็นขาออกทั้งคู่ ต้องต่อขาออกเข้าขาเข้า`, "direction");
  }
  const out = pa.dir === "OUTPUT" ? pa : pb, inp = pa.dir === "OUTPUT" ? pb : pa;
  const s = out.sig, t = inp.sig;
  if (t === "USB_POWER") return verdict(false, "USB_POWER_ONLY", "พอร์ตไฟเลี้ยง ไม่ใช่ขาเข้าสัญญาณ", `${inp.name} ของ Micro Converter ใช้ไฟเลี้ยงและตั้งค่าเท่านั้น ไม่ส่งภาพผ่าน USB-C`, "usb-role");
  if (s === "SPEAKER") return verdict(false, "SPEAKER_LEVEL", "ขาออกระดับขับลำโพง", `${out.name} เป็นสัญญาณขับลำโพง แรงเกิน ${inp.name} ลำโพงแอ็กทีฟและเครื่องสลับภาพต้องรับ LINE`, "speaker-level");
  if (s === "HEADPHONE" && t === "HEADPHONE") return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name}`, "speaker-level");
  if (s === "HEADPHONE" && t !== "HEADPHONE") return verdict(false, "HEADPHONE_NOT_LINE", "ขาออกหูฟังใช้ป้อนระบบนี้ไม่ได้", "PHONES ใช้ขยายเสียงสำหรับหูฟัง ให้ป้อนลำโพงและเครื่องสลับภาพจากขาออกไลน์ STEREO หรือ GROUP", "speaker-level");
  if (t === "HEADPHONE" && s !== "HEADPHONE") return verdict(false, "NOT_HEADPHONE", "แหล่งสัญญาณหูฟังไม่ถูกต้อง", "ต่อหูฟังที่ PHONES ของเครื่องผสมเสียง", "connector");
  const video = (x: string) => x === "HDMI" || x === "SDI";
  if (video(s) || video(t)) {
    if (s !== t) return verdict(false, "VIDEO_CLASS", `${s} ≠ ${t}`, `สัญญาณ ${s} เข้า ${t} ไม่ได้หากไม่มีตัวแปลงที่มีไฟเลี้ยงและถูกทิศทาง`, "converter-direction");
    return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name}`, "direction");
  }
  const audio = (x: string) => x === "MIC" || x === "LINE_BAL" || x === "LINE_UNBAL";
  if (audio(s) && audio(t)) {
    if (s === "LINE_BAL" && t === "LINE_UNBAL") return verdict(false, "PRO_TO_CONSUMER", "ระดับไลน์อาชีพเข้าช่องอุปกรณ์ทั่วไป", "ไลน์สมดุล +4 dBu แรงเกินช่อง 3.5 มม. ไม่สมดุล −10 dBV ให้ใช้ตัวปรับสมดุลเป็นไม่สมดุลพร้อมลดระดับ", "consumer-level");
    return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name}`, "direction");
  }
  if ((s === "USB_UAC" || s === "USB_UVC" || s === "USB_STORAGE") && (t === "USB_UVC" || t === "USB_STORAGE" || t === "USB_UAC")) {
    if (s === "USB_UAC" && t === "USB_STORAGE") return verdict(false, "USB_ROLE", "เสียง USB ไม่ใช่ดิสก์บันทึก", "เสียง USB ของเครื่องผสมเสียงใช้สื่อสารกับคอมพิวเตอร์ ไม่ใช่ดิสก์บันทึก", "usb-role");
    return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name}`, "usb-role");
  }
  if (s === "ETHERNET" && t === "ETHERNET") return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name} (หน้าที่ขึ้นอยู่กับอุปกรณ์: ควบคุมหรือสตรีม)`, "eth-role");
  if (s === "WAN" && t === "WAN") return verdict(true, "OK", "เชื่อมต่อแล้ว", `${out.name} → ${inp.name}`, "wan");
  if (s === "ETHERNET" && t === "WAN") return verdict(false, "LAN_TO_INGEST", "ไม่มีเกตเวย์", "LAN อุปกรณ์ไม่ใช่ทางออกอินเทอร์เน็ต ต้องผ่าน LAN ของเกตเวย์แล้วจึงออก WAN", "wan");
  return verdict(false, "SIGNAL_CLASS", "ชนิดสัญญาณไม่รองรับกัน", `${out.name} (${s}) ส่งเข้า ${inp.name} (${t}) ไม่ได้`, "connector");
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
          ? { code: "CABLE_SHORT", text: `${meta.label} ยาว ${meta.lengthM} ม. แต่เส้นทางยาว ${run} ม.`, fix: "ใช้สายที่ทดสอบแล้วและยาวพอสำหรับระยะจริง", concept: "cable-run" }
          : { code: "CABLE_RATING", text: `${meta.label}: ทดสอบสัญญาณนี้ผ่านเพียง ${meta.ratedM} ม. จึงไม่เสถียรที่ ${meta.lengthM} ม.`, fix: "ใช้สายที่ทดสอบผ่านตลอดระยะตามป้ายม้วน หรือแปลงเป็น 3G-SDI ใกล้ต้นทาง", concept: "cable-run" };
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
  const view: DeviceView = { powered: on, status: on ? "พร้อมใช้งาน" : m.needsPower ? "ยังไม่เปิดไฟ" : "รอใช้งาน" };
  const problem = (code: string, concept: ConceptId, text: string, fix: string) => { if (!view.problem) view.problem = { code, concept, text, fix }; };
  w.view[id] = view;
  if (!on) {
    if (m.needsPower) {
      problem("POWER", "power", g_placedText(inst.label), "ตรวจไฟเลี้ยงที่ติดตั้งไว้สำหรับอุปกรณ์นี้");
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
        if (cfg(id, "present") !== true) { content = "DESKTOP (presentation mode off)"; problem("PRESENTATION_OFF", "output-assign", "โน้ตบุ๊กแสดงหน้าเดสก์ท็อป ยังไม่แสดงสไลด์", "เปิดโหมดนำเสนอในโน้ตบุ๊ก"); }
        if (cfg(id, "mute-audio") !== true) camAudio.push("LAPTOP SYSTEM SOUNDS");
      }
      if (inst.model === "generic-graphics-pc") {
        { const t = String(cfg(id, "template")); content = t.startsWith("Scoreboard") ? `SCOREBOARD ${cfg(id, "score")}` : t.startsWith("Holding") ? "HOLDING SLATE" : "GFX TEST PATTERN"; }
      }
      if ((m.kind === "camera" || inst.model === "generic-doc-camera") && String(cfg(id, "framing") ?? "").startsWith("Not")) view.status = "ยังไม่จัดกรอบภาพ";
      for (const port of m.ports.filter((x) => x.dir === "OUTPUT")) out[P(port.key)] = video(port.sig as "HDMI" | "SDI", fmt, content, camAudio);
      view.picture = content;
      const ret = I("sdi-ret");
      if (ret?.kind === "video") view.audio = [`RETURN: ${ret.content}`];
      if (fmt === "2160p50") view.status = "กำลังส่งภาพ 2160p50 (UHD)";
      break;
    }
    case "mic": {
      const sources = [voice];
      if (inst.model === "generic-ambience-mic" && cfg(id, "windscreen") !== true) { sources.push("WIND NOISE"); problem("WIND", "clipping", "ไมค์บรรยากาศไม่มีอุปกรณ์กันลม เกิดเสียงลมออกอากาศ", "ติดอุปกรณ์กันลมภาคสนาม"); }
      out[P(m.ports.find((x) => x.dir === "OUTPUT")!.key)] = { kind: "audio", cls: "MIC", sources, clip: false, via: [] };
      view.audio = sources;
      if (cfg(id, "aim") === "Toward PA loudspeaker") view.status = "หัวไมค์หันเข้าหาลำโพง";
      break;
    }
    case "mixer": {
      if (inst.model === "generic-4ch-mixer") {
        const chans = [1, 2, 3].map((n) => {
          const sg = I(`in-${n}`) as AudioSignal | undefined;
          const gain = String(cfg(id, `ch${n}-gain`));
          return { n, s: sg, gain, live: sg?.kind === "audio" && cfg(id, `ch${n}-on`) === true && !gain.startsWith("Minimum") };
        });
        const bus = (key: "main" | "aux", fader: string, cls: AudioSignal["cls"]): AudioSignal => {
          const used = fader === "Unity" ? chans.filter((c) => c.live && cfg(id, `ch${c.n}-${key}`) === true) : [];
          return { kind: "audio", cls, sources: uniq(used.flatMap((c) => c.s!.sources)), clip: used.some((c) => c.gain.startsWith("Too hot") || c.s!.clip), via: [] };
        };
        const main = bus("main", String(cfg(id, "main-fader")), "LINE_BAL");
        const aux = bus("aux", String(cfg(id, "aux-master")), "LINE_UNBAL");
        out[P("main-out")] = main; out[P("aux-out")] = aux;
        view.audio = uniq([...main.sources, ...aux.sources]); view.clip = main.clip || aux.clip;
        for (const c of chans) {
          if (c.s && cfg(id, `ch${c.n}-on`) !== true) problem("MUTED", "mute", `CH${c.n} ถูก Mute อยู่`, `เปิด CH${c.n} ON`);
          if (c.s && c.gain.startsWith("Minimum")) problem("NO_GAIN", "clipping", `Gain ของ CH${c.n} ต่ำสุด มิเตอร์แทบไม่ขยับ`, "เพิ่ม Gain จนพีกเสียงพูดราว −18 dBFS");
          if (c.live && c.gain.startsWith("Too hot")) problem("CLIP", "clipping", `CH${c.n} คลิป (ไฟ PEAK แดง)`, "ลด Gain เป็น Nominal");
        }
        view.status = view.clip ? "PEAK — เสียงคลิป" : view.audio.length ? `MAIN: ${main.sources.join(" + ") || "—"} · STREAM: ${aux.sources.join(" + ") || "—"}` : "มิเตอร์ไม่ขยับ";
        break;
      }
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
        if (c.s && cfg(id, `ch${c.n}-on`) !== true) problem("MUTED", "mute", `ช่อง ${c.n} ปิดเสียงอยู่`, `เปิดเสียงช่อง ${c.n}`);
        if (c.s && c.gain.startsWith("Minimum")) problem("NO_GAIN", "clipping", `ช่อง ${c.n} ขยายเสียงต่ำสุด มาตรวัดแทบไม่ขึ้น`, "เพิ่ม GAIN ให้ยอดเสียงพูดประมาณ −18 dBFS");
        if (c.live && c.gain.startsWith("Too hot")) problem("CLIP", "clipping", `ช่อง ${c.n} ไฟ PEAK แดง วงจรขยายเสียงแตก`, "ลด GAIN สู่ระดับเหมาะสม");
      }
      view.status = view.clip ? "PEAK — เสียงแตก" : st && st.sources.length ? `มาตรวัด ST: ${st.sources.join(" + ")}` : "มาตรวัดยังไม่มีเสียง";
      break;
    }
    case "interface": {
      const l = I("in-l") as AudioSignal | undefined, r = I("in-r") as AudioSignal | undefined;
      if (l || r) {
        const pad = String(cfg(id, "atten")).startsWith("−12");
        out[P("out")] = { kind: "audio", cls: "LINE_UNBAL", sources: uniq([...(l?.sources ?? []), ...(r?.sources ?? [])]), clip: !pad || Boolean(l?.clip || r?.clip), via: [] };
        if (!pad) problem("NO_PAD", "consumer-level", "ยังไม่ลดระดับสัญญาณ (0 dB): +4 dBu แรงเกินขาเข้า −10 dBV", "ตั้งการลดระดับเป็น −12 dB");
        if (!l || !r) problem("ONE_SIDE", "connector", "ต่อเสียงสเตอริโอเพียงข้างเดียว ซ้ายหรือขวา", "ต่อ STEREO OUT ทั้ง L และ R");
      }
      break;
    }
    case "converter": {
      const s = I(m.ports.find((x) => x.dir === "INPUT" && x.sig !== "USB_POWER")!.key);
      const o = m.ports.find((x) => x.dir === "OUTPUT")!;
      if (s?.kind === "video") {
        if (!HD_FORMATS.includes(s.format)) problem("SDI_RATE", "sdi-rate", `ตัวแปลง 3G ไม่รองรับ ${s.format}`, "ตั้งต้นทางเป็น 1080p50");
        else out[P(o.key)] = { ...s, cls: o.sig as "HDMI" | "SDI", via: [] };
      }
      view.status = s ? "รับสัญญาณได้" : "ไม่มีสัญญาณขาเข้า";
      break;
    }
    case "router": {
      for (const n of [1, 2, 3, 4]) {
        const xp = String(cfg(id, `xp-${n}`)).split(" ")[1];
        const s = I(`in-${xp}`);
        if (s) out[P(`out-${n}`)] = { ...s, via: [] } as Signal;
      }
      view.status = `เส้นทางที่เลือก: ${[1, 2, 3, 4].map((n) => `O${n}←${String(cfg(id, `xp-${n}`)).replace("IN ", "I")}`).join(" ")}`;
      break;
    }
    case "switcher": {
      const converts = inst.model === "bmd-atem-mini-pro-iso" || inst.model === "bmd-atem-2me-constellation-hd";
      const valid: Record<string, VideoSignal> = {};
      const labels: string[] = [];
      for (const port of m.ports.filter((x) => x.dir === "INPUT" && (x.sig === "HDMI" || x.sig === "SDI"))) {
        const s = I(port.key);
        if (s?.kind !== "video") continue;
        if (!HD_FORMATS.includes(s.format)) { problem("SDI_RATE", "sdi-rate", `${port.name}: ขาเข้า HD 3G ไม่รองรับ ${s.format}`, "ตั้งขาออกกล้องเป็น 1080p50"); continue; }
        if (!converts && s.format !== DEFAULT_FORMAT) { problem("FORMAT_MISMATCH", "sdi-rate", `${port.name}: ${s.format} ไม่ตรงมาตรฐาน 1080p50 และไม่มีการแปลงที่ขาเข้า`, "ตั้งต้นทางเป็น 1080p50"); continue; }
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
        if (cfg(id, enable) !== true) { if (sigs.some(Boolean)) problem("ANALOG_OFF", "mute", "ต่อขาเข้าเสียงแอนะล็อกแล้ว แต่ยังไม่เปิดในเครื่องสลับภาพ", "เปิดขาเข้าเสียงแอนะล็อกในเครื่องสลับภาพ"); return; }
        for (const s of sigs) if (s) {
          audio.push(...s.sources); clip ||= s.clip;
          if (s.cls === "MIC") { low = true; problem("MIC_INTO_LINE", "mic-line-level", "ต่อไมค์เข้าขาเข้า LINE โดยตรง เสียงจึงเบาเกินไป", "ส่งไมค์ผ่านวงจรขยายในเครื่องผสมเสียง แล้วใช้ขาออกไลน์ไปเครื่องสลับภาพ"); }
          if (consumerMode && cfg(id, consumerMode) === "MIC" && (s.cls === "LINE_UNBAL" || s.cls === "LINE_BAL")) { clip = true; problem("LEVEL_MODE", "consumer-level", "ส่งระดับไลน์เข้าช่องที่ตั้งเป็น MIC ทำให้เสียงแตก", "ตั้งระดับขาเข้าเครื่องสลับภาพเป็น LINE"); }
        }
        if (keys.length === 2 && sigs.filter(Boolean).length === 1) missingSide = true;
      };
      if (inst.model === "bmd-atem-mini-pro-iso") analog(["mic-1"], "mic1-on", "mic1-mode");
      if (inst.model === "bmd-atem-tvs-hd8-iso") analog(["xlr-1", "xlr-2"], "xlr-on");
      if (inst.model === "bmd-atem-2me-constellation-hd") analog(["aud-l", "aud-r"], "analog-on");
      if (inst.model === "roland-v-160hd") analog(["ain-1", "ain-2"], "ain-on", "ain-mode");
      if (inst.model === "generic-mini-switcher" || inst.model === "generic-studio-switcher") analog(["audio-in"], "ain-on");
      const emb = String(cfg(id, "emb-audio"));
      if (emb === "ON") for (const s of Object.values(valid)) audio.push(...s.audio);
      if (emb === "AFV" && pgmKey && valid[pgmKey]) audio.push(...valid[pgmKey].audio);
      const pgmAudio = uniq(audio);
      const doubled = pgmAudio.some(isVoice) && pgmAudio.some(isCamMic);
      if (doubled) problem("DOUBLED", "afv-doubling", "เสียงพูดเข้าออกอากาศสองทางจากไมค์และไมค์กล้อง ทำให้เสียงซ้อน", "ปิดเสียงฝังจากกล้องหรือปิดเสียงตามภาพ ให้เสียงพูดมาจากเครื่องผสมเสียงทางเดียว");
      if (missingSide) problem("ONE_SIDE", "connector", "ต่อขาเข้าเสียงแอนะล็อก L/R เพียงข้างเดียว", "ต่อขาออกไลน์ทั้งสองข้าง");
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
        if (k === "hdmi-mv" || k === "mv-out" || k === "hdmi-mv-out") out[P(k)] = vs(port.sig as "HDMI" | "SDI", mvContent);
        else if (k === "hdmi-out" && inst.model === "bmd-atem-mini-pro-iso") out[P(k)] = vs("HDMI", role("hdmi-out"));
        else if (k === "hdmi-pgm-out") out[P(k)] = vs("HDMI", pgm);
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
      if (pgm === "BLACK") view.status = "ภาพออกอากาศ: ภาพดำ";
      view.picture = pgm; view.audio = pgmAudio; view.clip = clip;
      view.status = `PGM ${pgm} · PVW ${pvw}${low ? " · เสียงเบาเกินไป" : ""}`;
      (view as DeviceView & { inputs?: string[] }).inputs = labels;
      break;
    }
    case "encoder": {
      const s = I("sdi-in");
      const keyOk = String(cfg(id, "stream-key")).startsWith("•");
      if (s?.kind === "video") {
        out[P("hdmi-mon")] = { ...s, cls: "HDMI", via: [] };
        if (s.format !== cfg(id, "format")) problem("ENC_FORMAT", "sdi-rate", `ตัวเข้ารหัสตั้ง ${cfg(id, "format")} แต่ขาเข้าเป็น ${s.format}`, "ตั้งตัวเข้ารหัสเป็น 1080p50");
        else if (!keyOk) problem("NO_KEY", "stream-key", "ยังไม่ใส่รหัสสตรีมทดสอบ", "ใส่รหัสทดสอบส่วนตัวที่ปกปิดไว้");
        else if (cfg(id, "stream") !== true) problem("NOT_ON_AIR", "stream-key", "ตัวเข้ารหัสยังไม่เริ่มถ่ายทอด", "กดเริ่มถ่ายทอด");
        else out[P("eth")] = { kind: "net", role: "stream", content: s.content, audio: s.audio, via: [], keyOk };
      } else problem("NO_INPUT", "output-assign", "ตัวเข้ารหัสไม่มีสัญญาณ SDI เข้า", "ส่งจากขาออก SDI ที่กำหนดเป็นภาพออกอากาศ");
      view.picture = s?.kind === "video" ? s.content : undefined;
      view.status = out[P("eth")] ? "กำลังเข้ารหัสและสตรีม" : view.problem?.text ?? "รอใช้งาน";
      break;
    }
    case "host": {
      const ins = [I("usb-1"), I("usb-2")].filter(Boolean) as UsbSignal[];
      const uvc = ins.find((s) => s.cls === "USB_UVC"), uac = ins.find((s) => s.cls === "USB_UAC");
      const picture = cfg(id, "video-src") === "USB video capture device" && uvc ? uvc.content : undefined;
      if (cfg(id, "video-src") !== "None" && !uvc) problem("NO_CAPTURE", "obs-source", "เลือกแหล่งภาพ OBS แล้ว แต่ยังไม่ต่ออุปกรณ์ภาพ USB", "ต่อพอร์ต USB เว็บแคมหรือสตรีมของเครื่องสลับภาพเข้าคอมพิวเตอร์");
      if (cfg(id, "video-src") === "None") problem("NO_VIDEO_SRC", "obs-source", "OBS ยังไม่เลือกแหล่งภาพ", "เพิ่มอุปกรณ์รับภาพ USB เป็นแหล่งภาพ");
      const a = String(cfg(id, "audio-src"));
      let audio: string[] = [];
      let needSync = 0;
      if (a === "USB capture embedded audio") audio = uvc?.audio ?? [];
      if (a === "USB audio interface (mixer)") { audio = uac?.audio ?? []; needSync = uvc ? 80 : 0; if (!uac) problem("NO_UAC", "obs-source", "OBS เลือกเสียง USB เครื่องผสมเสียง แต่ยังไม่ได้ต่อ", "ต่อ USB เครื่องผสมเสียงเข้าคอมพิวเตอร์"); }
      if (a === "Built-in laptop mic") audio = ["ROOM SOUND (built-in mic)"];
      if (cfg(id, "extra-mic") === true) audio = [...audio, "ROOM SOUND (desktop mic)"];
      const echo = audio.some(isVoice) && audio.some((x) => x.startsWith("ROOM SOUND"));
      if (echo) problem("ECHO", "obs-source", "ไมค์สองทางเข้า OBS ทำให้เสียงสะท้อนหรือซ้อน", "ปิดไมค์คอมพิวเตอร์ที่ซ้ำ ให้เหลือแหล่งเสียงรายการเดียว");
      const off = Number(String(cfg(id, "sync")).replace(/[^0-9]/g, "")) || 0;
      const syncErr = audio.some(isVoice) ? Math.abs(needSync - off) : 0;
      if (syncErr > 40) problem("AV_SYNC", "obs-source", `ผลทดสอบตบมือ: เสียงเร็วกว่าภาพ ${needSync - off} มิลลิวินาที`, `ตั้งหน่วงเสียง OBS เป็น +${needSync} มิลลิวินาที`);
      const keyOk = String(cfg(id, "stream-key")).startsWith("•");
      if (picture && cfg(id, "stream") === true && keyOk) out[P("eth")] = { kind: "net", role: "stream", content: picture, audio, via: [], keyOk };
      else out[P("eth")] = { kind: "net", role: "control", audio: [], via: [], keyOk };
      view.picture = picture; view.audio = audio; view.clip = false;
      view.recording = Boolean(picture && cfg(id, "record") === true);
      view.file = view.recording ? `OBS local recording (60 s test) · ${picture}` : undefined;
      (view as DeviceView & { syncErr?: number }).syncErr = syncErr;
      view.status = `OBS · ${picture ?? "ไม่มีภาพ"} · ${audio.join(" + ") || "ไม่มีเสียง"}`;
      break;
    }
    case "network": {
      const lans = [I("lan-1"), I("lan-2")].filter((s): s is NetSignal => s?.kind === "net");
      const stream = lans.find((s) => s.role === "stream");
      const down = String(cfg(id, "wan-link")).startsWith("Down");
      out[P("wan")] = down ? undefined : stream ?? (lans[0] ? { ...lans[0], via: [] } : undefined);
      if (down) problem("WAN_DOWN", "wan", "เกตเวย์รายงาน WAN ขัดข้องจากผู้ให้บริการอินเทอร์เน็ต", "ย้ายสตรีมไปเกตเวย์สำรองที่ทดสอบแล้ว หากมีอุปกรณ์ให้");
      view.status = down ? "WAN ขัดข้อง" : stream ? "กำลังส่งสตรีมไป WAN" : lans.length ? "LAN เชื่อมต่อแล้ว มีข้อมูลควบคุมเท่านั้น" : "ไม่มีอุปกรณ์เชื่อมต่อ LAN";
      break;
    }
    case "ingest": {
      const s = I("wan-in") as NetSignal | undefined;
      const upload = String(cfg(id, "upload"));
      if (!s) { view.status = "ผู้ชม: ออฟไลน์ ไม่มีทางเชื่อมต่อขาออก"; problem("WAN", "wan", "ไม่มีทางเชื่อมต่อ WAN ถึงจุดรับสตรีมทดสอบ", "ต่อ WAN ของเกตเวย์เข้าทางออกและตรวจเส้นทางเราเตอร์"); }
      else if (s.role !== "stream") { view.status = "ผู้ชม: รอรับสตรีม มีเพียงข้อมูลควบคุม"; problem("NO_STREAM", "eth-role", "เครือข่ายเชื่อมต่อแต่ไม่มีสตรีม อาจเป็นพอร์ตควบคุมหรือยังไม่เปิดตัวเข้ารหัส", "ส่งจากอุปกรณ์ที่เข้ารหัสได้จริง เช่น RTMP ในเครื่อง Streaming Encoder HD หรือ OBS"); }
      else if (!s.keyOk) { view.status = "จุดรับปฏิเสธ: ไม่มีรหัสสตรีม"; problem("KEY", "stream-key", "จุดรับปฏิเสธการเชื่อมต่อ เพราะไม่มีรหัสสตรีม", "ใส่รหัสสตรีมทดสอบส่วนตัว"); }
      else if (upload.startsWith("3")) { view.status = "ผู้ชม: รอโหลดและภาพตก อัปโหลด 3 Mbps ไม่คงที่"; problem("UPLOAD", "wan", "อัปโหลดต่ำหรือไม่คงที่สำหรับ 1080p50 ทำให้ภาพตก ปัญหาอยู่ที่เครือข่าย", "เปลี่ยนเป็นทางออกที่ทดสอบแล้ว อัปโหลดคงที่อย่างน้อย 10 Mbps"); view.picture = s.content; }
      else { view.live = true; view.picture = s.content; view.audio = s.audio; view.status = `ผู้ชมกำลังรับสตรีม · ${s.content}`; }
      break;
    }
    case "display": {
      const keys = m.ports.filter((x) => x.dir === "INPUT").map((x) => x.key);
      const selKey = keys.length > 1 ? `hdmi-in-${String(cfg(id, "source")).split(" ")[1]}` : keys[0];
      const s = I(selKey);
      const other = keys.find((k) => k !== selKey && I(k));
      if (s?.kind === "video") { view.picture = s.content; view.status = s.content; }
      else { view.status = other ? `ไม่มีสัญญาณที่ ${String(cfg(id, "source"))} แต่มีสัญญาณที่ช่องอื่น` : "ไม่มีสัญญาณ"; if (other) problem("WRONG_INPUT", "output-assign", "จอเลือกขาเข้า HDMI ผิด", "เลือกขาเข้าที่รับสัญญาณอยู่"); }
      break;
    }
    case "speaker": {
      const s = m.ports.filter((x) => x.dir === "INPUT").map((x) => I(x.key)).find(Boolean) as AudioSignal | undefined;
      if (inst.model === "generic-active-pa") {
        const lvl = String(cfg(id, "level"));
        if (!s) view.status = "ไม่มีสัญญาณขาเข้า";
        else if (lvl === "Off") { view.status = "ปิดระดับเสียงอยู่"; problem("PA_OFF", "mute", "ลำโพงยังไม่เปิดระดับเสียง", "เพิ่มระดับลำโพงสู่ระดับเหมาะสม"); }
        else {
          view.audio = s.sources; view.clip = s.clip;
          const micAimedAtPa = Object.keys(devices).some((d) => devices[d].model === "shure-sm58" && cfg(d, "aim") === "Toward PA loudspeaker" && s.sources.includes(devices[d].voice ?? devices[d].content ?? ""));
          view.feedback = s.sources.some(isVoice) && (micAimedAtPa || lvl === "Hot" || String(cfg(id, "aim")).startsWith("Behind"));
          if (view.feedback) problem("FEEDBACK", "feedback", "เกิดเสียงหอนจากลำโพงย้อนเข้าไมค์โพเดียม", "หันไมค์เข้าหาผู้พูด จัดลำโพงด้านหน้าไมค์ และตั้งระดับเหมาะสม");
          view.status = view.feedback ? "มีเสียงหอน" : `ได้ยินเสียง: ${s.sources.join(" + ") || "เงียบ"}`;
        }
      } else { view.audio = s?.sources ?? []; view.status = s ? `กำลังฟัง: ${s.sources.join(" + ") || "เงียบ"}` : "ไม่มีสัญญาณขาเข้า"; }
      break;
    }
    case "recorder": {
      const s = I("sdi-in") as VideoSignal | undefined;
      const media = String(cfg(id, "media"));
      if (cfg(id, "clip") === true && cfg(id, "play") === true) out[P("sdi-out")] = video("SDI", DEFAULT_FORMAT, "REPLAY CLIP (pre-loaded, verified)", []);
      if (cfg(id, "record") === true) {
        if (!media.includes("mounted")) problem("NO_MEDIA", "storage", "สั่งบันทึกแต่ยังไม่มีสื่อเชื่อมต่อ", "ใส่และเชื่อมต่อสื่อที่รองรับ");
        else if (media.includes("FULL")) problem("MEDIA_FULL", "storage", "สื่อเต็ม การบันทึกหยุดแล้ว", "เปลี่ยนเป็นสื่อที่จัดรูปแบบแล้วและมีพื้นที่ว่าง");
        else if (!s) problem("REC_NO_INPUT", "output-assign", "บันทึกภาพดำ เพราะไม่มี SDI ขาเข้า", "ส่งภาพให้เครื่องบันทึกจากขาออกที่ตั้งเป็นภาพออกอากาศ");
        else { view.recording = true; view.file = `Clip0001.mov · ${s.content} · ${s.audio.join(" + ") || "ไม่มีเสียง"}`; }
      }
      view.picture = s?.content;
      view.status = view.recording ? `● REC ${s?.content}` : view.problem?.text ?? (s ? `ขาเข้า: ${s.content}` : "ไม่มีสัญญาณขาเข้า");
      break;
    }
    case "storage": {
      const s = I("usb") as UsbSignal | undefined;
      const state = String(cfg(id, "state"));
      if (!s) { view.status = "ยังไม่เชื่อมต่อ"; break; }
      if (s.cls !== "USB_STORAGE") { problem("USB_MODE", "usb-role", "USB-C เครื่องสลับภาพเป็นโหมดเว็บแคม ยังไม่ใช่โหมดบันทึกดิสก์", "ตั้ง USB-C เป็นบันทึกลงดิสก์"); view.status = "เชื่อมต่อแล้ว แต่ยังไม่ใช้บันทึก"; break; }
      if (!state.startsWith("Mounted · 4")) { problem(state.includes("FULL") ? "MEDIA_FULL" : "NO_MEDIA", "storage", state.includes("FULL") ? "ดิสก์เต็ม" : "ยังไม่เชื่อมต่อดิสก์", state.includes("FULL") ? "เปลี่ยนหรือจัดรูปแบบดิสก์ให้มีพื้นที่ว่าง" : "เชื่อมต่อ SSD ที่จัดรูปแบบ exFAT"); view.status = state; break; }
      if (s.content) { view.recording = true; view.file = `${s.content} · audio: ${s.audio.join(" + ") || "none"}`; view.status = `● REC ${s.content}`; }
      else view.status = "เชื่อมต่อแล้ว ยังไม่บันทึก";
      break;
    }
    case "capture": {
      const s = I("hdmi-in") as VideoSignal | undefined;
      if (s?.kind === "video") { out[P("usb")] = { kind: "usb", cls: "USB_UVC", content: s.content, audio: s.audio, via: [] }; view.picture = s.content; view.audio = s.audio; view.status = `จับภาพ: ${s.content}`; }
      else { view.status = "ไม่มีสัญญาณ HDMI"; problem("NO_INPUT", "output-assign", "อุปกรณ์จับภาพไม่มีสัญญาณ HDMI เข้า", "ต่อ PGM OUT ของเครื่องสลับภาพเข้า HDMI IN"); }
      break;
    }
    case "wireless-tx": {
      const s = I("mic-in") as AudioSignal | undefined;
      view.audio = s?.sources ?? [];
      view.status = s ? `ส่งสัญญาณ RF ${String(cfg(id, "rf"))}` : "ยังไม่มีไมค์ต่อเข้า MIC IN";
      break;
    }
    case "wireless-rx": {
      const tx = inst.pairWith;
      const txOn = Boolean(tx && devices[tx] && powered(tx));
      const txSig = tx ? inp[`${tx}:mic-in`] as AudioSignal | undefined : undefined;
      const sameCh = tx ? cfg(id, "rf") === cfg(tx, "rf") : false;
      if (cfg(id, "pair") !== "Paired") problem("UNPAIRED", "mute", "ตัวรับยังไม่จับคู่กับตัวส่ง", "ตั้งช่อง RF ให้ตรงกันแล้วจับคู่ TX ↔ RX");
      else if (!sameCh) problem("RF_CHANNEL", "mute", "ช่องความถี่ RF ของ TX และ RX ไม่ตรงกัน", "ตั้งช่อง RF ของ RX ให้ตรงกับ TX");
      else if (!txOn) problem("TX_OFF", "power", "ตัวส่ง TX ไม่ได้เปิดไฟ", "เปิดไฟตัวส่ง TX");
      else if (!txSig) problem("NO_LAV", "connector", "ตัวส่งไม่มีไมค์ต่ออยู่", "ต่อสายไมค์ Lavalier เข้า MIC IN ของ TX");
      else {
        out[P("audio-out")] = { kind: "audio", cls: cfg(id, "out-level") === "MIC" ? "MIC" : "LINE_BAL", sources: txSig.sources, clip: false, via: [] };
        view.audio = txSig.sources;
      }
      view.status = out[P("audio-out")] ? `รับสัญญาณ RF · ${String(cfg(id, "out-level"))}` : view.problem?.text ?? "ไม่มีสัญญาณ";
      break;
    }
    case "decoy": case "safety": break;
  }
  return out;
}

const g_placedText = (label: string) => `${label} ยังไม่มีไฟเลี้ยงหรือยังไม่ติดตั้งประจำจุด`;

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
      hops.unshift({ node: devices[e.from.split(":")[0]]?.label ?? e.from, port: `${pout.name} → [${cables[e.cableId]?.label ?? e.cableId}] → ${devices[device].label} ${pin.name}`, cable: e.cableId, ok: Boolean(sig), note: sig ? describe(sig) : "ไม่มีสัญญาณผ่านสายนี้" });
      walk(e.from.split(":")[0], depth + 1);
    }
  };
  walk(dest, 0);
  const firstBad = hops.find((h) => !h.ok);
  let first: (TraceHop & { fix?: string; concept?: ConceptId }) | undefined;
  if (firstBad) {
    const dev = Object.keys(devices).find((d) => devices[d].label === firstBad.node && ctx.view[d]?.problem);
    const pr = dev ? ctx.view[dev]!.problem : undefined;
    first = { ...firstBad, fix: pr?.fix ?? "ตรวจสายและการกำหนดขาออกของอุปกรณ์ต้นทาง", concept: pr?.concept };
  }
  return { hops, first };
}
export function describe(s: Signal): string {
  if (s.kind === "video") return `${s.cls} ${s.format} · ${s.content}${s.audio.length ? ` · emb ${s.audio.join("+")}` : ""}`;
  if (s.kind === "audio") return `${s.cls} · ${s.sources.join("+") || "เงียบ"}${s.clip ? " · CLIP" : ""}`;
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
function safe(o: ObjectivePredicate, ctx: EvalContext): PredicateResult { try { return o.check(ctx); } catch (e) { return { ok: false, reason: `ตรวจสอบไม่สำเร็จ: ${(e as Error).message}` }; } }
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
