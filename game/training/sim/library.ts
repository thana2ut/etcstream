import type { Category, ConceptId, ControlValue, EvalContext, ObjectivePredicate, PredicateResult, Quiz, TestStage } from "./types";

/** Objective predicate builders shared by all 25 stages. Every check reads the evaluated graph — never cable colour. */
export const o = (id: string, label: string, category: Category, stage: TestStage, concept: ConceptId, check: (c: EvalContext) => PredicateResult, critical = false): ObjectivePredicate =>
  ({ id, label, category, stage, concept, check, critical });

const pass = (): PredicateResult => ({ ok: true });
const fail = (reason: string, fix: string): PredicateResult => ({ ok: false, reason, fix });
const prob = (c: EvalContext, dev: string) => c.view[dev]?.problem;
const why = (c: EvalContext, dev: string, fallback: string, fix: string): PredicateResult => {
  const p = prob(c, dev);
  return p ? fail(`${p.code}: ${p.text}`, p.fix) : fail(fallback, fix);
};

export const placedAll = (devs: string[]) => (c: EvalContext) => {
  const missing = devs.filter((d) => !c.placed(d));
  return missing.length ? fail(`Not installed at its operating position: ${missing.join(", ")}`, "Carry each device from its case to its labelled station and set it down.") : pass();
};
export const poweredAll = (devs: string[]) => (c: EvalContext) => {
  const off = devs.filter((d) => !c.view[d]?.powered);
  return off.length ? fail(`No power: ${off.join(", ")}`, "Run the abstracted power check on each device (supply pre-installed by a qualified technician).") : pass();
};
/** Exact channel map: this OUTPUT is cabled to this INPUT. */
export const edge = (from: string, to: string) => (c: EvalContext) =>
  c.edges.some((e) => e.from === from && e.to === to) ? pass() : fail(`Missing patch ${from} → ${to}`, "Patch the output to the documented input (channel maps are part of the job).");
export const noEdge = (from: string, to: string, why: string, fix: string) => (c: EvalContext) => c.edges.some((e) => e.from === from && e.to === to) ? fail(why, fix) : pass();
export const cfgIs = (dev: string, key: string, value: ControlValue, fix: string) => (c: EvalContext) =>
  c.cfg(dev, key) === value ? pass() : fail(`${dev} ${key} is "${String(c.cfg(dev, key))}" — expected "${String(value)}"`, fix);
export const cfgNot = (dev: string, key: string, value: ControlValue, fix: string) => (c: EvalContext) =>
  c.cfg(dev, key) !== value ? pass() : fail(`${dev} ${key} is "${String(value)}"`, fix);
export const site = (key: string, label: string) => (c: EvalContext) => c.sim.config.site?.[key] === true ? pass() : fail(`Preflight not confirmed: ${label}`, "Complete and sign the preflight item.");

export const shows = (dev: string, content: string, label = dev) => (c: EvalContext) => {
  const pic = c.view[dev]?.picture;
  return pic?.includes(content) ? pass() : why(c, dev, `${label} shows "${pic ?? c.view[dev]?.status ?? "nothing"}" — expected ${content}`, "Trace the destination back to its source (signal flow) and fix the first faulty hop.");
};
export const showsAll = (dev: string, contents: string[]) => (c: EvalContext) => {
  const pic = c.view[dev]?.picture ?? "";
  const missing = contents.filter((x) => !pic.includes(x));
  return missing.length ? why(c, dev, `${dev} is missing: ${missing.join(", ")} (shows "${pic || "nothing"}")`, "Every source needs its own physical cable into its own input.") : pass();
};
export const notShows = (dev: string, content: string, reason: string, fix: string) => (c: EvalContext) => (c.view[dev]?.picture ?? "").includes(content) ? fail(reason, fix) : pass();
/** A display mirrors the CURRENT Program of a switcher. */
export const mirrorsProgram = (dev: string, sw: string) => (c: EvalContext) => {
  const pgm = c.view[sw]?.picture;
  const pic = c.view[dev]?.picture;
  if (!pgm || pgm === "BLACK") return fail("Program is BLACK", "Take a live source to Program.");
  return pic === pgm ? pass() : why(c, dev, `${dev} shows "${pic ?? "nothing"}" but Program is ${pgm}`, "Feed this destination from an output assigned to PROGRAM.");
};
export const hears = (dev: string, voices: string[], opts: { clip?: boolean; extras?: string[] } = {}) => (c: EvalContext) => {
  const v = c.view[dev];
  const audio = v?.audio ?? [];
  const missing = voices.filter((x) => !audio.includes(x));
  if (missing.length) return why(c, dev, `${dev} does not carry ${missing.join(" + ")} (hears: ${audio.join(" + ") || "silence"})`, "Follow the audio path: mic → preamp gain/ON/bus → line output → input enabled.");
  const bad = audio.filter((x) => x.startsWith("CAM MIC") || x.startsWith("ROOM SOUND") || x === "LAPTOP SYSTEM SOUNDS" || x === "WIND NOISE" || (opts.extras ?? []).includes(x));
  if (bad.length) return fail(`Unwanted audio on ${dev}: ${bad.join(" + ")} (doubling/echo/noise)`, "Turn off embedded camera/laptop audio or the extra microphone; fit windscreens.");
  if (opts.clip !== false && v?.clip) return fail(`${dev}: the mix clips`, "Reduce preamp GAIN to Nominal and check line/mic level settings.");
  return pass();
};
export const noFeedback = (devs: string[]) => (c: EvalContext) => {
  const bad = devs.filter((d) => c.view[d]?.feedback);
  return bad.length ? fail("Feedback (howl-round) in the room", "Aim the SM58 at the talker, keep PAs in front of the mic and lower the PA to Nominal.") : pass();
};
export const live = (ingest: string, sw?: string, voices: string[] = []) => (c: EvalContext) => {
  const v = c.view[ingest];
  if (!v?.live) return why(c, ingest, `Remote viewer not live (${v?.status ?? "offline"})`, "Check encoder → network → WAN → ingest.");
  if (sw && v.picture !== c.view[sw]?.picture) return fail(`Viewer shows ${v.picture} but Program is ${c.view[sw]?.picture}`, "Stream the PROGRAM output, not multiview/preview.");
  return hears(ingest, voices)(c);
};
/** Recording now, or a file from this device already closed cleanly (evidence). */
export const recording = (dev: string, includes?: string) => (c: EvalContext) => {
  const v = c.view[dev];
  const saved = c.sim.evidence.filter((e) => e.startsWith(`${dev} · `));
  const files = [...(v?.recording ? [v.file ?? ""] : []), ...saved];
  if (!files.length) return why(c, dev, `${dev} is not recording`, "Mount media, feed the recorder and press REC.");
  return includes && !files.some((f) => f.includes(includes)) ? fail(`${dev} file: ${files[0]} — expected ${includes}`, "Record the correct feed.") : pass();
};
export const evidence = (text: string, label: string) => (c: EvalContext) => c.sim.evidence.some((e) => e.includes(text)) ? pass() : fail(`No evidence saved: ${label}`, "Stop the recording cleanly so the file closes, then check it.");
export const cuesDone = () => (c: EvalContext) => c.sim.cueIndex >= c.stage.cues.length ? pass() : fail(`Run-of-show at cue ${c.sim.cueIndex + 1}/${c.stage.cues.length}`, "Take each cue to Program on the call.");
export const noBlackAfterStart = () => (c: EvalContext) => {
  const h = c.sim.pgmHistory.slice(c.sim.cueStart ?? 0);
  const first = h.findIndex((x) => x !== "BLACK");
  return first >= 0 && h.slice(first).includes("BLACK") ? fail("Program went to BLACK during the rehearsal", "Cut between live sources only.") : pass();
};
export const faultsRecovered = () => (c: EvalContext) => {
  const need = c.sim.activeFaults.length + c.sim.recovered.length;
  if (need === 0) return c.stage.surpriseFaults?.length ? fail("No surprise fault has occurred yet (it arrives after the rehearsal test)", "Pass the rehearsal test first.") : pass();
  if (c.sim.activeFaults.length) return fail(`Unresolved fault(s): ${c.sim.activeFaults.length}`, "Trace the failing destination back to its first faulty node and repair the root cause.");
  const undiag = c.sim.recovered.filter((f) => !c.sim.diagnosed.includes(f));
  return undiag.length ? fail("Recovered without diagnosis", "Run a signal trace/test while the fault is present, so the cause is logged.") : pass();
};
export const quizOk = () => (c: EvalContext) => c.stage.quiz && !c.sim.quizOk ? fail("Mini mastery check not answered correctly", "Answer the mini-check in the Sign-off tab.") : pass();
export const signedOff = () => (c: EvalContext) => c.sim.signedOff ? pass() : fail("Not signed off", "Complete the wrap: sign the job ticket.");
export const inputCarries = (port: string, content: string) => (c: EvalContext) => {
  const s = c.inp[port];
  return s?.kind === "video" && s.content.includes(content) ? pass() : fail(`${port} carries ${s?.kind === "video" ? s.content : "nothing"} — expected ${content}`, "Check the patch and the router crosspoint.");
};
export const historyHas = (contents: string[]) => (c: EvalContext) => {
  const missing = contents.filter((x) => !c.sim.pgmHistory.some((h) => h.includes(x)));
  return missing.length ? fail(`Never taken to Program: ${missing.join(", ")}`, "Take each source on its cue.") : pass();
};
export const noCableProblems = () => (c: EvalContext) => {
  const bad = c.edges.filter((e) => !c.inp[e.to] && c.out[e.from]);
  return bad.length ? fail(`Signal dies on ${bad.length} lead(s): ${bad.map((e) => e.to).join(", ")}`, "Use tested leads rated for the run; check spool tags.") : pass();
};
/** Certification wrapper: same check, but the failure names only the symptom — never the solved patch. */
export const masked = (check: (c: EvalContext) => PredicateResult, symptom: string) => (c: EvalContext) => {
  const r = check(c);
  return r.ok ? r : { ok: false, reason: symptom, fix: "Re-check your own patch plan against the job ticket." };
};
export const all = (...checks: ((c: EvalContext) => PredicateResult)[]) => (c: EvalContext) => { for (const k of checks) { const r = k(c); if (!r.ok) return r; } return pass(); };

/* ═════════════ concepts: targeted review + mini mastery check ═════════════ */
export const CONCEPTS: Record<ConceptId, { title: string; review: string; check: Quiz }> = {
  direction: { title: "Signal direction", review: "Every cable runs from an OUTPUT to an INPUT. Two outputs fight; two inputs carry nothing.", check: { q: "Which patch can carry a picture?", options: ["Laptop HDMI OUT → Switcher HDMI IN", "Switcher HDMI OUT → Laptop HDMI OUT", "Switcher HDMI IN → Projector HDMI IN"], answer: 0, why: "Only OUTPUT → INPUT carries signal." } },
  connector: { title: "Connector ≠ signal", review: "A plug that fits proves nothing. HDMI, SDI/BNC, XLR, TRS, USB and RJ45 each carry a defined signal class.", check: { q: "A BNC lead fits the SDI input. What else must be true?", options: ["Nothing — it fits", "Correct direction, supported format and a live, powered source", "The cable must be blue"], answer: 1, why: "Physical fit is only the first of several layers." } },
  "sdi-rate": { title: "Format and SDI rate", review: "A 12G camera port can carry UHD, but a 3G-SDI HD switcher only accepts HD (e.g. 1080p50). Set the camera to the chain format.", check: { q: "Camera at 2160p50 into an HD-only 3G-SDI input:", options: ["Works because BNC fits", "Shows UNSUPPORTED until the camera is set to 1080p50", "Is converted automatically by the cable"], answer: 1, why: "Rate support, not connector shape, decides." } },
  "converter-direction": { title: "Direction-specific converters", review: "HDMI-to-SDI 3G and SDI-to-HDMI 3G are different powered devices. Each only converts its own direction.", check: { q: "Camera SDI to a field HDMI monitor needs:", options: ["Micro Converter HDMI to SDI 3G", "Micro Converter SDI to HDMI 3G (powered)", "An HDMI cable"], answer: 1, why: "SDI IN → HDMI OUT is the SDI-to-HDMI unit." } },
  power: { title: "Power is part of the path", review: "Converters, switchers, displays and PAs emit nothing until powered (here: an abstracted, pre-installed supply check).", check: { q: "A green cable into an unpowered converter gives:", options: ["Picture", "No signal", "Half picture"], answer: 1, why: "No power, no output." } },
  "output-assign": { title: "Output roles", review: "PGM, AUX/clean, MULTIVIEW and PREVIEW are assigned to physical outputs. Audience screens take Program; operators take Multiview.", check: { q: "The audience projector should be fed from:", options: ["An output assigned MULTIVIEW", "An output assigned PROGRAM", "Any output"], answer: 1, why: "Never show the tech multiview to the audience." } },
  "mic-line-level": { title: "Mic vs line level", review: "Microphones need a preamp. Feed switcher/PA line inputs from mixer line outputs, not straight from a mic.", check: { q: "SM58 straight into a LINE input sounds:", options: ["Fine", "Far too quiet", "Distorted"], answer: 1, why: "Mic level is ~50 dB below line level." } },
  "consumer-level": { title: "Pro vs consumer line level", review: "+4 dBu balanced line overloads a −10 dBV unbalanced 3.5 mm input. Use an attenuating interface and set the input to LINE.", check: { q: "MG12XU STEREO OUT to ATEM Mini 3.5 mm input needs:", options: ["A direct XLR-to-3.5 mm lead", "The balanced-to-unbalanced line interface with −12 dB pad, input set to LINE", "Phantom power"], answer: 1, why: "Match level and balancing." } },
  "speaker-level": { title: "Speaker & headphone outputs", review: "Amplifier SPEAKER outputs and mixer PHONES are not line feeds. Active PAs and switchers take LINE level.", check: { q: "Feed an active PA from:", options: ["Mixer PHONES", "Mixer STEREO OUT L/R", "Power-amp speakON"], answer: 1, why: "Line output → line input." } },
  "eth-role": { title: "Ethernet roles", review: "An RJ45 jack is not a stream. Control-only ports (Constellation Ethernet, V-160HD LAN CONTROL) never reach an ingest; an encoder must exist.", check: { q: "Constellation Ethernet → router alone gives:", options: ["A live stream", "Control traffic only — no stream", "NDI"], answer: 1, why: "Use the Streaming Encoder HD (or a modelled OBS host)." } },
  "usb-role": { title: "USB roles", review: "USB-C may be power-only (Micro Converters), webcam (UVC) or disk — one role at a time, and never a hidden splitter.", check: { q: "ATEM Mini Pro USB-C to the OBS host and the SSD at once:", options: ["Fine with a splitter", "Impossible — choose webcam OR record", "Doubles the frame rate"], answer: 1, why: "One port, one role." } },
  "router-crosspoint": { title: "Router crosspoints", review: "A Videohub output carries whichever input its crosspoint selects. Plugged BNC + wrong crosspoint = wrong picture. Routers do not convert formats.", check: { q: "OUT 2 is wired to the switcher, crosspoint OUT 2 ← IN 1. The switcher sees:", options: ["IN 2", "IN 1", "Nothing"], answer: 1, why: "The crosspoint decides." } },
  "embedded-audio": { title: "Embedded audio", review: "The remote viewer only hears audio embedded in the encoded Program. Booth headphones are not the stream.", check: { q: "Commentary heard in headphones but not remotely. Check:", options: ["Headphone volume", "Mixer line out → switcher analog input enabled → Program SDI to encoder", "The PA"], answer: 1, why: "Follow the embedded path." } },
  storage: { title: "Recording media", review: "Recording needs approved, mounted media with free space and an explicit REC. Losing media does not stop the live stream.", check: { q: "Disk full during a show:", options: ["Stream stops", "Recording stops; stream and Program continue", "Program goes black"], answer: 1, why: "Independent paths." } },
  wan: { title: "WAN / upload", review: "Streaming needs gateway WAN + stable upload. WAN loss stops the viewer only — local Program and recording continue.", check: { q: "WAN unplugged. What fails?", options: ["Projector", "Remote viewer only", "Recorder"], answer: 1, why: "Independent paths." } },
  "stream-key": { title: "Stream key & encoder state", review: "An encoder needs a (private, redacted) key and must be ON AIR. Never share real credentials.", check: { q: "Ingest rejects the connection. First check:", options: ["Stream key present", "Camera format", "Mic gain"], answer: 0, why: "Authentication precedes picture." } },
  feedback: { title: "Feedback", review: "Aim the cardioid mic at the talker, keep loudspeakers in front of the mic's rejection axis and raise level gradually.", check: { q: "Howling starts. First fix:", options: ["Raise the PA", "Re-aim the mic / move the PA, then lower level", "Add phantom power"], answer: 1, why: "Geometry first." } },
  clipping: { title: "Gain structure", review: "Set preamp GAIN so speech peaks well below clip; zero gain with faders up gives nothing.", check: { q: "PEAK lamp red on CH1:", options: ["Raise fader", "Lower GAIN", "Mute CH2"], answer: 1, why: "Clipping happens in the preamp." } },
  mute: { title: "Mutes and enables", review: "A muted channel, a closed fader or a disabled switcher input breaks the path silently.", check: { q: "Mic meters on the channel but nothing on ST:", options: ["Channel ON/ST assign or master fader", "Camera format", "WAN"], answer: 0, why: "Check routing on the mixer." } },
  "afv-doubling": { title: "Doubling / AFV", review: "If a camera mic and the presenter mic both reach Program, the voice doubles. Turn camera embedded audio off (or AFV deliberately).", check: { q: "Why turn camera embedded audio OFF here?", options: ["To save power", "To avoid the voice arriving twice", "To enable tally"], answer: 1, why: "One clean voice path." } },
  safety: { title: "Safety is a gate", review: "Lightning = NO-GO. Covered ramps at public crossings, dry electronics and qualified supply sign-off come before any signal.", check: { q: "Lightning 8 km away, everything else ready:", options: ["GO", "NO-GO and hold for the all-clear", "GO but faster"], answer: 1, why: "Safety overrides the show." } },
  "return-feed": { title: "Camera return", review: "The camera's 12G-SDI IN is a program return (tally/talkback). It is never the camera's production output.", check: { q: "Camera RETURN IN → switcher SDI IN is:", options: ["A valid source", "Input-to-input — rejected", "Faster"], answer: 1, why: "Use the camera SDI OUT." } },
  "group-bus": { title: "GROUP bus", review: "Channels feed GROUP 1-2 only when assigned. ST to the PA can work while the GROUP stream feed is silent.", check: { q: "House PA fine, stream silent. Check:", options: ["PA level", "CH → GROUP assign + GROUP fader + switcher input LINE/ON", "Projector"], answer: 1, why: "Different bus, different path." } },
  "one-output": { title: "One output, one role", review: "ATEM Mini Pro has ONE HDMI output: Program to the projector OR Multiview — not both without another device.", check: { q: "Projector shows the grid of all inputs. Fix:", options: ["Replace cable", "Set HDMI OUT to PROGRAM", "Add phantom"], answer: 1, why: "Output assignment." } },
  "obs-source": { title: "OBS sources & sync", review: "Pick exactly one video capture and one programme audio source; disable extra mics; delay audio to match video latency (clap test).", check: { q: "OBS echo with the mixer USB already selected:", options: ["Disable the extra desktop mic", "Raise the mixer", "Change camera format"], answer: 0, why: "One programme audio path." } },
  graphics: { title: "Graphics accuracy", review: "Full-frame graphics come in as a source; a plain HDMI picture is not a key/fill pair. Update the score by an explicit operator edit and check it before air.", check: { q: "Goal scored. Before taking the score card:", options: ["Take it immediately", "Edit to 1–0 and verify against the event", "Wait for an API"], answer: 1, why: "No live data API here." } },
  "cable-run": { title: "Cable runs", review: "SDI distance depends on cable construction, rate and joints. Use tested leads rated for the run; long passive HDMI is unreliable — convert to SDI near the source.", check: { q: "Spool tag: 30 m, validated to 20 m at 3G. For a 25 m run:", options: ["Use it", "Use a lead rated beyond its length", "Add a second spool"], answer: 1, why: "Rating, not hope." } },
};
