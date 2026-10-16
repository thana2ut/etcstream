import type { ControlDefinition, EquipmentDefinition, PortDefinition, SignalClass, VideoFormat } from "./types";
import type { Connector } from "../scenarios";

/**
 * Equipment manifest. Named models list `sourceUrl` (manufacturer tech-spec page given in the room
 * specification) and `verifiedPorts` (the ports this game models, each present on that page). Only the ports a
 * stage needs are modelled; unmodelled physical ports are listed in `notes`. Everything else is an explicit
 * "Generic Training Device" whose ports are exactly those the room specification defines.
 * Asset licence: all meshes are original procedural stand-ins built in this project (no manufacturer CAD/artwork).
 */
const LICENSE_ORIGINAL = "Original procedural training stand-in (project-made geometry, no manufacturer CAD or artwork)";
const HD: VideoFormat[] = ["720p50", "1080p50", "1080p60"];
const CAM_FORMATS: VideoFormat[] = ["1080p50", "1080p60", "2160p50"];

const p = (key: string, name: string, dir: "INPUT" | "OUTPUT", connector: Connector, sig: SignalClass, tip: string, extra: Partial<PortDefinition> = {}): PortDefinition =>
  ({ key, name, dir, connector, sig, tip, panel: "rear", ...extra });
const power: ControlDefinition = { key: "power", label: "Power", kind: "toggle", default: false, tip: "Abstracted low-risk power check (labelled supply already installed by a qualified technician). Never mains wiring." };
const sel = (key: string, label: string, options: string[], tip: string, def?: string): ControlDefinition => ({ key, label, kind: "select", options, default: def ?? options[0], tip });
const tog = (key: string, label: string, tip: string, def = false): ControlDefinition => ({ key, label, kind: "toggle", default: def, tip });

const SM58: EquipmentDefinition = {
  modelId: "shure-sm58", manufacturer: "Shure", name: "Shure SM58", generic: false, kind: "mic", size: [0.212, 0.052, 0.052],
  sourceUrl: "https://www.shure.com/en-US/docs/guide/SM58", verifiedPorts: ["XLR OUT (3-pin male, balanced)"], assetLicense: LICENSE_ORIGINAL,
  needsPower: false, role: "mic",
  ports: [p("xlr-out", "XLR OUT", "OUTPUT", "XLR", "MIC", "Balanced dynamic microphone output, MIC level. Needs a mic preamp; no phantom power required.", { channels: 1, panel: "side" })],
  controls: [sel("aim", "Capsule aim", ["At talker's mouth", "Toward PA loudspeaker"], "Cardioid pickup: aim at the mouth and keep loudspeakers behind the capsule (Shure feedback guidance)."),
    tog("windscreen", "Windscreen fitted", "Generic foam/fur wind protection for outdoor use.")],
  notes: ["Dynamic cardioid — +48 V phantom is not required.", "Mic level only: plug into a mic preamp, never straight into a line-level input."],
};

const AMBIENCE_MIC: EquipmentDefinition = {
  ...SM58, modelId: "generic-ambience-mic", manufacturer: "Generic Training Device", name: "Generic Balanced Dynamic Ambience Microphone", generic: true, sourceUrl: undefined,
  verifiedPorts: ["XLR OUT (mic level) — defined by room specification"],
  controls: [tog("windscreen", "Rugged windscreen fitted", "Outdoor ambience needs wind protection.")],
  notes: ["Generic training device: mic-level balanced XLR only."],
};

const MG12XU: EquipmentDefinition = {
  modelId: "yamaha-mg12xu", manufacturer: "Yamaha", name: "Yamaha MG12XU", generic: false, kind: "mixer", size: [0.308, 0.118, 0.48],
  sourceUrl: "https://usa.yamaha.com/products/proaudio/mixers/mg_series_xu_model/specs.html",
  verifiedPorts: ["MIC/LINE IN CH1–CH3 (XLR combo)", "STEREO OUT L/R (XLR, balanced)", "GROUP OUT 1/2 (TRS phone, balanced)", "PHONES (TRS)", "USB (USB-B, 2-in/2-out audio)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "mixer",
  ports: [
    ...[1, 2, 3].map((n) => p(`mic-${n}`, `CH${n} MIC/LINE IN`, "INPUT", "XLR", "MIC", `Channel ${n} XLR/TRS combo input with mic preamp (GAIN). Accepts MIC or LINE level.`, { channels: 1, panel: "front" })),
    p("st-l", "STEREO OUT L", "OUTPUT", "XLR", "LINE_BAL", "Balanced +4 dBu LINE output, left. Feeds line inputs (PA, switcher line inputs).", { channels: 1 }),
    p("st-r", "STEREO OUT R", "OUTPUT", "XLR", "LINE_BAL", "Balanced +4 dBu LINE output, right.", { channels: 1 }),
    p("grp-1", "GROUP OUT 1", "OUTPUT", "6.35mm", "LINE_BAL", "Balanced TRS GROUP 1 output — only channels assigned to GROUP 1-2 appear here.", { channels: 1 }),
    p("grp-2", "GROUP OUT 2", "OUTPUT", "6.35mm", "LINE_BAL", "Balanced TRS GROUP 2 output.", { channels: 1 }),
    p("phones", "PHONES", "OUTPUT", "6.35mm", "HEADPHONE", "Headphone amplifier for monitoring — NOT a PA or line feed.", { channels: 2, panel: "front" }),
    p("usb", "USB (audio)", "OUTPUT", "USB-B", "USB_UAC", "USB audio interface (stereo mix) to a computer. It is data, not analog audio.", { channels: 2 }),
  ],
  controls: [power,
    ...[1, 2, 3].flatMap((n) => [
      sel(`ch${n}-gain`, `CH${n} GAIN`, ["Minimum", "Nominal (peaks −18 dBFS)", "Too hot (clips)"], "Set the preamp so speech peaks sit well below clipping."),
      tog(`ch${n}-on`, `CH${n} ON`, "Channel on/off (mute)."),
      tog(`ch${n}-st`, `CH${n} → ST`, "Assign channel to the STEREO bus."),
      tog(`ch${n}-grp`, `CH${n} → GROUP 1-2`, "Assign channel to the GROUP 1-2 bus (independent stream feed)."),
      tog(`ch${n}-hpf`, `CH${n} HPF 80 Hz`, "High-pass filter: removes rumble and handling noise."),
    ]),
    sel("st-fader", "STEREO master fader", ["Down", "Unity"], "Stereo master level.", "Down"),
    sel("grp-fader", "GROUP 1-2 fader", ["Down", "Unity"], "Group master level.", "Down"),
    tog("phones-st", "PHONES = STEREO", "Headphones follow the stereo mix.", true),
  ],
  notes: ["+48 V phantom is not needed for dynamic SM58s.", "USB is a computer audio interface — it cannot feed an XLR analog input.", "PHONES drive headphones only, never a PA."],
};

const STUDIO_CAM: EquipmentDefinition = {
  modelId: "bmd-studio-camera-4k-pro-g2", manufacturer: "Blackmagic Design", name: "Blackmagic Studio Camera 4K Pro G2", generic: false, kind: "camera", size: [0.32, 1.5, 0.45],
  sourceUrl: "https://www.blackmagicdesign.com/products/blackmagicstudiocamera/techspecs/W-CST-11",
  verifiedPorts: ["12G-SDI OUT", "12G-SDI IN (program return)", "HDMI OUT (monitoring)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "source",
  ports: [
    p("sdi-out", "12G-SDI OUT", "OUTPUT", "SDI", "SDI", "Camera video OUTPUT. Carries the selected format: set 1080p50 for a 3G-SDI HD switcher.", { formats: CAM_FORMATS }),
    p("sdi-ret", "12G-SDI IN (RETURN)", "INPUT", "SDI", "SDI", "Program-return INPUT for tally/talkback/return video. It never outputs the camera picture.", { formats: CAM_FORMATS }),
    p("hdmi-out", "HDMI OUT (monitor)", "OUTPUT", "HDMI", "HDMI", "HDMI monitoring output. Not used for the SDI production chain.", { formats: CAM_FORMATS }),
  ],
  controls: [power, sel("format", "Video format", ["2160p50", "1080p50", "1080p60"], "12G port can carry UHD, but a 3G-SDI HD switcher needs 1080p50.", "1080p50"),
    sel("framing", "Framing", ["Not framed", "Framed for assignment"], "Frame the shot the call sheet assigns to this camera."),
    tog("cam-audio", "Camera mic embedded", "Camera's own microphone embedded on SDI/HDMI (causes doubling if it reaches Program).", true)],
  notes: ["The 12G-SDI IN is a return input — patching it as a source is input-to-input.", "Owning a 12G port does not make the switcher accept UHD."],
};

const ATEM_MINI_PRO_ISO: EquipmentDefinition = {
  modelId: "bmd-atem-mini-pro-iso", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM Mini Pro ISO", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemmini/techspecs",
  verifiedPorts: ["HDMI IN 1–4", "HDMI OUT (configurable: Program or Multiview)", "MIC IN 1–2 (3.5 mm stereo)", "Ethernet (streaming/control)", "USB-C (webcam out OR disk recording)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`hdmi-in-${n}`, `HDMI IN ${n}`, "INPUT", "HDMI", "HDMI", `HDMI input ${n}. HD formats only (built-in HD conversion); no UHD, no HDCP decryption.`, { formats: HD })),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "The ONE HDMI output. Set it to PROGRAM or MULTIVIEW — it cannot be both at once."),
    p("mic-1", "MIC IN 1 (3.5 mm)", "INPUT", "3.5mm", "LINE_UNBAL", "Unbalanced 3.5 mm stereo input. Set to LINE for a consumer-level feed.", { channels: 2 }),
    p("mic-2", "MIC IN 2 (3.5 mm)", "INPUT", "3.5mm", "LINE_UNBAL", "Unbalanced 3.5 mm stereo input.", { channels: 2 }),
    p("usb", "USB-C", "OUTPUT", "USB-C", "USB_UVC", "USB-C: webcam output to a computer, OR recording to a USB disk — one at a time."),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet: built-in RTMP streaming and control. Needs a router with a working WAN."),
  ],
  controls: [power,
    sel("pgm", "PROGRAM (take)", ["Black", "HDMI 1", "HDMI 2", "HDMI 3", "HDMI 4"], "Cut a source to Program."),
    sel("hdmi-out", "HDMI OUT source", ["PROGRAM", "MULTIVIEW"], "One HDMI output: choose what it carries.", "MULTIVIEW"),
    sel("mic1-mode", "MIC 1 input level", ["MIC", "LINE"], "Consumer line feeds need LINE; MIC on a line feed overloads.", "MIC"),
    tog("mic1-on", "MIC 1 to Program", "Fairlight: mix MIC 1 into Program."),
    sel("emb-audio", "HDMI source audio", ["ON", "AFV", "OFF"], "Embedded camera/laptop audio. ON or AFV with a camera mic doubles the teacher's voice.", "ON"),
    tog("labels", "Input labels set", "Name inputs (CAM / SLIDES / DOC) in ATEM Software Control."),
    sel("usb-mode", "USB-C use", ["Webcam output", "Record to disk"], "Choose ONE use for the single USB-C port.", "Webcam output"),
    tog("record", "Record ISO + Program", "Record ISO files of every input plus Program to the mounted USB disk."),
    sel("stream-key", "Stream key (private test)", ["(none)", "•••••••• (private test key)"], "Virtual credential only — shown redacted."),
    tog("stream", "On Air (RTMP stream)", "Start the built-in RTMP stream."),
  ],
  notes: ["Exactly one HDMI output: Program to the projector and Multiview to a monitor cannot both happen without another device.", "USB-C cannot be webcam and disk simultaneously; there is no hidden splitter."],
};

const HD8_ISO: EquipmentDefinition = {
  modelId: "bmd-atem-tvs-hd8-iso", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM Television Studio HD8 ISO", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemtelevisionstudiohd/techspecs/W-ATC-05",
  verifiedPorts: ["3G-SDI IN 1–8 (HD only)", "SDI OUT (assignable: Program / Multiview / Clean / Camera return)", "HDMI MULTIVIEW OUT", "2 × XLR balanced analog audio IN", "Ethernet (streaming)", "USB-C (recording disk)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `3G-SDI input ${n}: HD formats only — 2160p is unsupported.`, { formats: HD })),
    ...[1, 2, 3].map((n) => p(`sdi-out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `Assignable SDI output ${n}: choose Program, Multiview, Clean feed or Camera return.`)),
    p("hdmi-mv", "HDMI MULTIVIEW OUT", "OUTPUT", "HDMI", "HDMI", "HDMI multiview: every input + Program + Preview. Not a Program feed."),
    p("xlr-1", "XLR AUDIO IN 1", "INPUT", "XLR", "LINE_BAL", "Balanced analog XLR input (line level). A dynamic mic needs a mixer preamp first.", { channels: 1 }),
    p("xlr-2", "XLR AUDIO IN 2", "INPUT", "XLR", "LINE_BAL", "Balanced analog XLR input 2 (pair with IN 1 as L/R).", { channels: 1 }),
    p("usb", "USB-C (record)", "OUTPUT", "USB-C", "USB_STORAGE", "USB-C recording to an approved, mounted disk."),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet streaming (RTMP) and control. Needs a working WAN path."),
  ],
  controls: [power,
    sel("pgm", "PROGRAM (take)", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4"], "Cut a source to Program."),
    sel("pvw", "PREVIEW", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4"], "Preview the next shot before TAKE."),
    ...[1, 2, 3].map((n) => sel(`sdi-out-${n}`, `SDI OUT ${n} assign`, ["OFF", "PROGRAM", "MULTIVIEW", "CLEAN FEED", "CAM RETURN"], "Real outputs are assigned by role in software; they are not all identical Program sockets.", "OFF")),
    tog("xlr-on", "XLR IN 1/2 to Program", "Fairlight: enable the external L/R line pair."),
    sel("emb-audio", "Camera embedded audio", ["ON", "AFV", "OFF"], "Camera mics in Program double the presenter's voice — usually OFF.", "ON"),
    tog("labels", "Input labels set", "Name inputs to match the call sheet."),
    tog("record", "Record PGM + ISO", "Record Program and each input ISO to the mounted USB disk."),
    sel("stream-key", "Stream key (private test)", ["(none)", "•••••••• (private test key)"], "Virtual credential only — shown redacted."),
    tog("stream", "On Air (RTMP stream)", "Start the built-in RTMP stream."),
  ],
  notes: ["HD-only 3G-SDI chain: a UHD camera feed shows UNSUPPORTED.", "Modelled: SDI IN 1–4 and SDI OUT 1–3 of the physical I/O."],
};

const CONSTELLATION: EquipmentDefinition = {
  modelId: "bmd-atem-2me-constellation-hd", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM 2 M/E Constellation HD", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemconstellationhd/techspecs/W-APS-26",
  verifiedPorts: ["20 × 3G-SDI IN (standards converted)", "12 × assignable 3G-SDI OUT", "SDI MULTIVIEW OUT", "2 × balanced 1/4-inch analog audio IN", "USB-C webcam out", "Ethernet (control only)", "No timecode / reference input listed"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4, 5, 6].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `3G-SDI input ${n} with standards conversion (HD only).`, { formats: HD })),
    ...["A", "B", "C"].map((n, i) => p(`sdi-out-${i + 1}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `Assignable 3G-SDI output ${n}. One coax per destination — outputs do not self-clone.`)),
    p("mv-out", "SDI MULTIVIEW OUT 1", "OUTPUT", "SDI", "SDI", "Multiview SDI output — convert to HDMI for a control display."),
    p("aud-l", "ANALOG IN L (1/4\")", "INPUT", "6.35mm", "LINE_BAL", "Balanced 1/4-inch LINE input — no microphone preamp.", { channels: 1 }),
    p("aud-r", "ANALOG IN R (1/4\")", "INPUT", "6.35mm", "LINE_BAL", "Balanced 1/4-inch LINE input — no microphone preamp.", { channels: 1 }),
    p("usb", "USB-C WEBCAM", "OUTPUT", "USB-C", "USB_UVC", "USB webcam output of Program to a computer (OBS)."),
    p("eth", "ETHERNET (control)", "OUTPUT", "ETHERNET", "ETHERNET", "Control network only. This switcher has NO built-in streaming encoder."),
  ],
  controls: [power,
    sel("pgm", "M/E 1 PROGRAM (take)", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "Cut a source to Program."),
    sel("pvw", "M/E 1 PREVIEW", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "Preview before TAKE."),
    ...["A", "B", "C"].map((n, i) => sel(`sdi-out-${i + 1}`, `SDI OUT ${n} assign`, ["OFF", "PROGRAM", "AUX (clean)", "MULTIVIEW"], "Assign each output to a destination role.", "OFF")),
    tog("analog-on", "Analog L/R to Program", "Fairlight: enable the balanced line pair."),
    sel("emb-audio", "Camera embedded audio", ["ON", "AFV", "OFF"], "Camera mics in Program fight the commentary — usually OFF.", "ON"),
    tog("labels", "Source labels set", "MAIN / SIDELINE / GOAL / REACTION / GFX."),
  ],
  notes: ["Ethernet is the CONTROL network — streaming needs a separate Streaming Encoder HD.", "No timecode or genlock port is modelled because the specification lists none; inputs are re-synchronised."],
};

const V160HD: EquipmentDefinition = {
  modelId: "roland-v-160hd", manufacturer: "Roland", name: "Roland V-160HD", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://proav.roland.com/global/products/v-160HD/",
  verifiedPorts: ["HDMI IN 1–8", "SDI IN 1–8", "HDMI OUT 1–3 (assignable)", "SDI OUT 1–3 (assignable)", "USB STREAM (UVC/UAC)", "LAN CONTROL", "AUDIO IN 1/2 (XLR/TRS combo)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2].map((n) => p(`hdmi-in-${n}`, `HDMI IN ${n}`, "INPUT", "HDMI", "HDMI", `HDMI input ${n}.`, { formats: HD })),
    ...[1, 2].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `SDI input ${n} (HD).`, { formats: HD })),
    ...[1, 2, 3].map((n) => p(`hdmi-out-${n}`, `HDMI OUT ${n}`, "OUTPUT", "HDMI", "HDMI", `HDMI output ${n}: assign PROGRAM, AUX, MULTIVIEW or PREVIEW.`)),
    p("sdi-out-1", "SDI OUT 1", "OUTPUT", "SDI", "SDI", "SDI output 1: assignable (Program for the recorder)."),
    p("usb", "USB STREAM", "OUTPUT", "USB-C", "USB_UVC", "USB video/audio class stream to a host computer (OBS). Not a network connection."),
    p("lan", "LAN CONTROL", "OUTPUT", "ETHERNET", "ETHERNET", "LAN CONTROL for remote control only — it is NOT a streaming encoder."),
    p("ain-1", "AUDIO IN 1 (combo)", "INPUT", "COMBO", "LINE_BAL", "XLR/TRS combo analog input — set to LINE for a mixer GROUP feed.", { channels: 1 }),
    p("ain-2", "AUDIO IN 2 (combo)", "INPUT", "COMBO", "LINE_BAL", "XLR/TRS combo analog input 2.", { channels: 1 }),
  ],
  controls: [power,
    sel("pgm", "PROGRAM (take)", ["Black", "HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "Cut a source to Program."),
    sel("pvw", "PREVIEW", ["Black", "HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "Preview before TAKE."),
    sel("aux", "AUX bus source", ["HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "Independent AUX bus (e.g. slides for the confidence screen)."),
    ...[1, 2, 3].map((n) => sel(`hdmi-out-${n}`, `HDMI OUT ${n} assign`, ["PROGRAM", "AUX", "MULTIVIEW", "PREVIEW"], "Output assign (Roland output routing).", n === 1 ? "MULTIVIEW" : n === 2 ? "PROGRAM" : "PREVIEW")),
    sel("sdi-out-1", "SDI OUT 1 assign", ["PROGRAM", "AUX", "MULTIVIEW", "PREVIEW"], "Output assign.", "PREVIEW"),
    sel("ain-mode", "AUDIO IN 1/2 level", ["MIC", "LINE"], "GROUP outputs are line level.", "MIC"),
    tog("ain-on", "AUDIO IN 1/2 to Program", "Mix the analog pair into the Program/stream mix."),
    sel("emb-audio", "HDMI/SDI embedded audio", ["ON", "AFV", "OFF"], "Laptop/camera embedded audio — de-duplicate the voice.", "ON"),
    tog("labels", "Source labels set", "Name inputs."),
  ],
  notes: ["LAN CONTROL never satisfies streaming. Stream = USB STREAM → OBS host → host network → ingest.", "Modelled: HDMI IN 1–2, SDI IN 1–2, HDMI OUT 1–3, SDI OUT 1 of the physical I/O."],
};

const CONV_HS: EquipmentDefinition = {
  modelId: "bmd-micro-converter-hdmi-sdi-3g", manufacturer: "Blackmagic Design", name: "Blackmagic Micro Converter HDMI to SDI 3G", generic: false, kind: "box", size: [0.1, 0.03, 0.08],
  sourceUrl: "https://www.blackmagicdesign.com/products/microconverters/techspecs/W-CONU-18",
  verifiedPorts: ["HDMI IN", "3G-SDI OUT", "USB-C (power/config)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "converter",
  ports: [
    p("hdmi-in", "HDMI IN", "INPUT", "HDMI", "HDMI", "HDMI INPUT — this converter only goes HDMI → SDI.", { formats: HD }),
    p("sdi-out", "SDI OUT", "OUTPUT", "SDI", "SDI", "3G-SDI OUTPUT (HD). Emits only while powered."),
    p("usb-pwr", "USB-C POWER", "INPUT", "USB-C", "USB_POWER", "Power and configuration only — this USB-C carries no video."),
  ],
  controls: [power], notes: ["Direction-specific: it cannot turn SDI back into HDMI.", "Does not scale, decrypt HDCP or split to many destinations."],
};
const CONV_SH: EquipmentDefinition = {
  ...CONV_HS, modelId: "bmd-micro-converter-sdi-hdmi-3g", name: "Blackmagic Micro Converter SDI to HDMI 3G",
  verifiedPorts: ["3G-SDI IN", "HDMI OUT", "USB-C (power/config)"],
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "3G-SDI INPUT — this converter only goes SDI → HDMI.", { formats: HD }),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI OUTPUT to a display. Emits only while powered."),
    p("usb-pwr", "USB-C POWER", "INPUT", "USB-C", "USB_POWER", "Power and configuration only — this USB-C carries no video."),
  ],
  notes: ["Direction-specific: it cannot turn HDMI into SDI."],
};

const VIDEOHUB: EquipmentDefinition = {
  modelId: "bmd-videohub-10x10-12g", manufacturer: "Blackmagic Design", name: "Blackmagic Videohub 10x10 12G", generic: false, kind: "box", size: [0.48, 0.045, 0.2],
  sourceUrl: "https://www.blackmagicdesign.com/nz/products/blackmagicvideohub/techspecs",
  verifiedPorts: ["SDI IN 1–10", "SDI OUT 1–10 (re-clocked)", "Ethernet control"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "router",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `Router input ${n}.`)),
    ...[1, 2, 3, 4].map((n) => p(`out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `Router output ${n}: carries whichever input its crosspoint selects.`)),
  ],
  controls: [power, ...[1, 2, 3, 4].map((n) => sel(`xp-${n}`, `OUT ${n} crosspoint`, ["IN 1", "IN 2", "IN 3", "IN 4"], "Select which input feeds this output.", `IN ${((n + 2) % 4) + 1}`))],
  notes: ["A router re-clocks and switches. It is NOT a frame-rate/standard converter, encoder, recorder or unlimited DA.", "Modelled: IN 1–4 / OUT 1–4 of 10×10."],
};

const HYPERDECK: EquipmentDefinition = {
  modelId: "bmd-hyperdeck-studio-hd-plus", manufacturer: "Blackmagic Design", name: "Blackmagic HyperDeck Studio HD Plus", generic: false, kind: "box", size: [0.48, 0.045, 0.2],
  sourceUrl: "https://www.blackmagicdesign.com/ae/products/hyperdeckstudio/techspecs",
  verifiedPorts: ["3G-SDI IN (one record input)", "3G-SDI OUT (playback)", "SD card / USB-C media"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "recorder",
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "The single SDI record input — one recorded feed, never four ISOs.", { formats: HD }),
    p("sdi-out", "SDI OUT", "OUTPUT", "SDI", "SDI", "Playback / loop output."),
  ],
  controls: [power, sel("media", "Record media", ["No media", "SD card mounted (512 GB free)", "SD card mounted · FULL (0 GB)"], "Recording needs mounted media with free space."),
    tog("record", "REC", "Record the SDI input to media."), tog("clip", "Clip loaded (playback)", "Pre-verified clip loaded for playback."), tog("play", "PLAY", "Play the loaded clip out of SDI OUT.")],
  notes: ["A recorder, not an encoder or a multichannel instant-replay server."],
};

const STREAM_ENC: EquipmentDefinition = {
  modelId: "bmd-streaming-encoder-hd", manufacturer: "Blackmagic Design", name: "Blackmagic Streaming Encoder HD", generic: false, kind: "box", size: [0.2, 0.045, 0.15],
  sourceUrl: "https://www.blackmagicdesign.com/sg/developer/products/streaming/techspecs",
  verifiedPorts: ["SDI IN", "Ethernet (H.264 streaming)", "HDMI monitor out"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "encoder",
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "Program SDI input to encode.", { formats: HD }),
    p("eth", "ETHERNET (stream)", "OUTPUT", "ETHERNET", "ETHERNET", "Encoded H.264 RTMP(S) stream to the gateway."),
    p("hdmi-mon", "HDMI MONITOR OUT", "OUTPUT", "HDMI", "HDMI", "Confidence monitor output — not a camera source."),
  ],
  controls: [power, sel("format", "Encode format", ["1080p50", "1080p60"], "Match the 1080p50 chain."),
    sel("stream-key", "Stream key (private test)", ["(none)", "•••••••• (private test key)"], "Virtual credential only — shown redacted."), tog("stream", "ON AIR", "Start encoding to the private test ingest.")],
  notes: ["Takes SDI only; carries whatever embedded audio the switcher puts on that SDI output."],
};

/* ---------------- generic training devices (ports defined by the room specifications) ---------------- */
const generic = (modelId: string, name: string, role: EquipmentDefinition["role"], kind: EquipmentDefinition["kind"], size: [number, number, number], ports: PortDefinition[], controls: ControlDefinition[], notes: string[], needsPower = true, content?: string): EquipmentDefinition =>
  ({ modelId, manufacturer: "Generic Training Device", name, generic: true, kind, size, verifiedPorts: ports.map((x) => `${x.name} — defined by room specification`), assetLicense: LICENSE_ORIGINAL, needsPower, role, ports, controls, notes, content });

const HDMI_CAM = generic("generic-hdmi-camera", "Generic 1080p50 HDMI Training Camera", "source", "camera", [0.32, 1.5, 0.45],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "Clean 1080p50 HDMI output with embedded camera microphone.", { formats: ["1080p50"] })],
  [power, sel("framing", "Framing", ["Not framed", "Framed for assignment"], "Frame the teacher at the lectern."), tog("clean", "Clean feed (no overlays)", "Turn off on-screen overlays.", false)],
  ["Generic training device: HDMI OUT only."]);
const LAPTOP = generic("generic-laptop", "Generic Presentation Laptop", "source", "laptop", [0.48, 0.03, 0.32],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "1080p50 presentation output (open/licensed teaching slides, no HDCP).", { formats: ["1080p50"] })],
  [power, tog("present", "Presentation mode", "Slideshow on the HDMI display (not the desktop)."), tog("mute-audio", "Mute laptop audio", "Laptop audio is embedded in HDMI — mute to avoid duplicates.")],
  ["Generic training device."]);
const DOCCAM = generic("generic-doc-camera", "Generic HDMI Document Camera", "source", "box", [0.3, 0.45, 0.3],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "Defined 1080p50 HDMI OUT (training source).", { formats: ["1080p50"] })],
  [power, sel("framing", "Page framing", ["Not framed", "Book page framed, no shadow"], "Position under even light.")], ["Generic training device."]);
const GFX_PC = generic("generic-graphics-pc", "Generic Licensed Graphics Computer", "source", "laptop", [0.48, 0.03, 0.32],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "1080p50 full-frame scoreboard (locally edited licensed asset).", { formats: ["1080p50"] })],
  [power, sel("score", "Scoreboard (manual edit)", ["0–0", "1–0", "0–1"], "Operator edit — there is no live sports data API."), sel("template", "Graphic loaded", ["Test pattern", "Scoreboard template (licensed)", "Holding slate (back shortly)"], "Load the licensed score template, or the holding slate for a break.")],
  ["Full-frame graphics only: a plain HDMI picture is not a fill/key pair."]);
const display = (id: string, name: string, inputs = 1) => generic(id, name, "display", "box", [0.6, 0.36, 0.08],
  Array.from({ length: inputs }, (_, i) => p(inputs > 1 ? `hdmi-in-${i + 1}` : "hdmi-in", inputs > 1 ? `HDMI IN ${i + 1}` : "HDMI IN", "INPUT", "HDMI", "HDMI", "HDMI input, 1080p50.", { formats: HD })),
  inputs > 1 ? [power, sel("source", "Input select", Array.from({ length: inputs }, (_, i) => `HDMI ${i + 1}`), "Select the input carrying the feed.", "HDMI 2")] : [power],
  ["Generic training display."]);
const PROJECTOR = display("generic-projector", "Generic Training Projector", 2);
const MONITOR = display("generic-hdmi-monitor", "Generic HDMI Training Monitor");
const PA = generic("generic-active-pa", "Generic Training Active PA Speaker", "speaker", "box", [0.34, 0.55, 0.3],
  [p("line-in", "LINE IN (XLR/TRS)", "INPUT", "XLR", "LINE_BAL", "Balanced LINE input. Never feed speaker-level or headphone outputs.", { channels: 1 })],
  [power, sel("level", "Level", ["Off", "Nominal", "Hot"], "Raise gradually; hot PA near a live mic howls.", "Off"), sel("aim", "Placement", ["In front of the mic, aimed at audience", "Behind/aimed at the podium mic"], "Keep loudspeakers in front of the microphone's rejection axis.")],
  ["Active speaker with virtual safe power."]);
const HEADPHONES = generic("generic-headphones", "Generic Monitoring Headphones", "speaker", "box", [0.18, 0.2, 0.08],
  [p("in", "PHONES PLUG (TRS)", "INPUT", "6.35mm", "HEADPHONE", "Headphone input for booth monitoring.", { channels: 2 })], [], ["Booth monitoring is not the remote mix."], false);
const SSD = generic("generic-recording-ssd", "Generic Approved Recording SSD (exFAT)", "storage", "box", [0.1, 0.02, 0.06],
  [p("usb", "USB-C", "INPUT", "USB-C", "USB_STORAGE", "USB data/power. Must be mounted (exFAT) with free space.")],
  [sel("state", "Disk", ["Not mounted", "Mounted · 412 GB free", "Mounted · FULL (0 GB free)"], "Format/mount check before the session.")], ["Generic training device."], false);
const ROUTER = generic("generic-gateway", "Generic GbE Router / Gateway", "network", "box", [0.25, 0.05, 0.18],
  [p("lan-1", "LAN 1", "INPUT", "ETHERNET", "ETHERNET", "LAN port for the streaming device."), p("lan-2", "LAN 2", "INPUT", "ETHERNET", "ETHERNET", "LAN port (control network)."),
    p("wan", "WAN", "OUTPUT", "ETHERNET", "WAN", "WAN uplink hand-off to the Internet / test ingest.")],
  [power, tog("uplink-test", "Upload test run", "Measure stable upload before going live."), sel("wan-link", "WAN link", ["Up", "Down (ISP outage)"], "Status of the upstream Internet hand-off.")], ["No implicit NDI.", "Generic training device."]);
const INGEST = generic("generic-test-ingest", "Private Test Ingest + Remote Viewer (local simulation)", "ingest", "box", [0.4, 0.9, 0.4],
  [p("wan-in", "UPLINK IN", "INPUT", "ETHERNET", "WAN", "Simulated WAN hand-off to a LOCAL private ingest server and mock viewer. No public streaming.")],
  [sel("upload", "Measured upload", ["25 Mbps stable", "3 Mbps unstable"], "A 1080p50 H.264 stream needs a stable upload (≈ 6–9 Mbps + headroom).")], ["Local deterministic simulation; no third-party login."], false);
const OBS_HOST = generic("generic-obs-host", "Generic OBS Host Computer", "host", "laptop", [0.48, 0.03, 0.32],
  [p("usb-1", "USB-A 1 (capture)", "INPUT", "USB-A", "USB_UVC", "USB host port for a UVC/UAC capture device."), p("usb-2", "USB-A 2 (audio)", "INPUT", "USB-A", "USB_UVC", "USB host port for a USB audio interface."),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Host's own wired network interface — the OBS stream leaves here.")],
  [power, sel("video-src", "OBS video source", ["None", "USB video capture device"], "Pick the USB webcam/stream device explicitly."),
    sel("audio-src", "OBS audio source", ["None", "Built-in laptop mic", "USB capture embedded audio", "USB audio interface (mixer)"], "Exactly one programme audio source."),
    tog("extra-mic", "Desktop mic also enabled", "A second enabled mic doubles/echoes the voice.", false),
    sel("sync", "Audio sync offset", ["0 ms", "+80 ms", "+160 ms"], "Measure with a clap test; delay audio to match video latency."),
    sel("stream-key", "Stream key (private test)", ["(none)", "•••••••• (private test key)"], "Virtual credential only — shown redacted."),
    tog("stream", "Start Streaming", "Stream to the private test ingest via the host network."), tog("record", "Start Recording (local)", "Local 60-second OBS test recording.")],
  ["OBS is a simulated state; no real software is controlled."]);
const AUDIO_IF = generic("generic-bal-unbal-interface", "Generic Training Balanced-to-Unbalanced Stereo Line Interface", "interface", "box", [0.12, 0.05, 0.1],
  [p("in-l", "LINE IN L (XLR)", "INPUT", "XLR", "LINE_BAL", "Balanced +4 dBu line input, left.", { channels: 1 }), p("in-r", "LINE IN R (XLR)", "INPUT", "XLR", "LINE_BAL", "Balanced +4 dBu line input, right.", { channels: 1 }),
    p("out", "3.5 mm STEREO OUT (−10 dBV)", "OUTPUT", "3.5mm", "LINE_UNBAL", "Attenuated consumer stereo output for ATEM Mini 3.5 mm inputs.", { channels: 2 })],
  [sel("atten", "Attenuation", ["0 dB (bypass)", "−12 dB (+4 dBu → −10 dBV)"], "Pad pro line level down to consumer level.")], ["Generic training device (not a named product). Ground-aware passive profile."], false);
const POWER_AMP = generic("generic-power-amp", "Generic Power Amplifier (decoy)", "decoy", "box", [0.48, 0.09, 0.35],
  [p("spk-out", "SPEAKER OUT (speakON)", "OUTPUT", "speakON", "SPEAKER", "Amplified SPEAKER level — only for passive loudspeakers. Never into a line input.")], [], ["Inventory trap: active PAs here already have their own amplifier."], false);

export const MODELS: Record<string, EquipmentDefinition> = Object.fromEntries([
  SM58, AMBIENCE_MIC, MG12XU, STUDIO_CAM, ATEM_MINI_PRO_ISO, HD8_ISO, CONSTELLATION, V160HD, CONV_HS, CONV_SH, VIDEOHUB, HYPERDECK, STREAM_ENC,
  HDMI_CAM, LAPTOP, DOCCAM, GFX_PC, PROJECTOR, MONITOR, PA, HEADPHONES, SSD, ROUTER, INGEST, OBS_HOST, AUDIO_IF, POWER_AMP,
].map((m) => [m.modelId, m]));

export function portDef(modelId: string, key: string): PortDefinition | undefined {
  return MODELS[modelId]?.ports.find((x) => x.key === key);
}
