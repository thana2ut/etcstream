/**
 * Learning notes shown in the full-screen equipment inspector (hold E for 5 s).
 * `unverified` lists what has not been checked against the real unit in the studio.
 * Keys match device / placeable ids in game/training/scenarios.ts.
 */
export interface EquipmentInfo {
  name: string;
  model: string;
  role: string;
  summary: string;
  facts: string[];
  inThisRoom: string;
  unverified: string[];
}

export const EQUIPMENT_INFO: Record<string, EquipmentInfo> = {
  switcher: {
    name: "Video Switcher",
    model: "DeviceWell HDS7105",
    role: "Picture and sound hub (central device)",
    summary: "Takes pictures from several sources, lets the operator choose what goes to air and joins sound to the picture.",
    facts: [
      "Video inputs: HDMI IN1–IN4 and one DisplayPort",
      "PGM OUT (HDMI) = the on-air picture, sent to record/stream",
      "MULTIVIEW OUT (HDMI) = every input on one screen, for the operator",
      "Audio: LINE IN / LINE OUT / MIC IN 1–2 are 3.5 mm jacks",
      "PGM row selects what is on air; PVW row selects what comes next; press CUT or AUTO to switch",
    ],
    inThisRoom: "Camera → HDMI IN · mixer audio → LINE IN · PGM OUT → capture card · MULTIVIEW OUT → monitor",
    unverified: ["Chassis height and side profile"],
  },
  mixer: {
    name: "Audio Mixer",
    model: "YAMAHA PMX-402D-USB",
    role: "Adjusts and mixes sound (central device)",
    summary: "Takes several mics/sources, sets each channel level and tone, then sums them to MAIN",
    facts: [
      "CH1–4: MIC on XLR, LINE on 6.35 mm jacks",
      "TRIM sets input gain · HI/LOW EQ · PAN left-right · fader sets channel level",
      "MAIN L/R (red fader) controls the summed output",
      "MAIN OUT is on 6.35 mm jacks (top) and XLR (rear)",
      "The HS5 is an active speaker: feed it MAIN OUT line level (XLR or 6.35 mm TRS), never the amplified SPEAKER OUTPUT",
      "PHANTOM (+48 V) is for condenser mics; dynamic mics do not need it",
    ],
    inThisRoom: "Wireless RX → CH LINE · set gain/fader · MAIN OUT → switcher LINE IN (sound travels with the picture)",
    unverified: ["Real chassis size", "Speaker output used in the real room"],
  },
  capture: {
    name: "Capture Card",
    model: "Magewell USB Capture HDMI Gen 2",
    role: "Brings picture and sound into the computer",
    summary: "Takes picture and sound from the switcher over HDMI and sends them to OBS over USB for viewing, recording or streaming",
    facts: ["HDMI IN takes picture and sound from the switcher", "USB 3.0 Type-A sends them to the computer", "Works with OBS and video capture software", "It brings signal into a computer; it is not a switcher"],
    inThisRoom: "HDS7105 PGM OUT → Magewell HDMI IN → USB 3.0 → HP Notebook → OBS",
    unverified: ["Size estimated from reference photos"],
  },
  computer: {
    name: "Computer (OBS)",
    model: "HP 15.6-inch (from reference photos)",
    role: "Destination: record / stream",
    summary: "Open OBS and select the capture card as the video capture device to receive picture and sound together",
    facts: ["The Magewell can use either USB-A port on the notebook", "The system is complete when OBS has both picture and sound", "No picture/sound? Trace back along the signal path one hop at a time"],
    inThisRoom: "Capture Card → USB → Computer → OBS",
    unverified: ["Exact sub-model and factory size"],
  },
  rx: {
    name: "Wireless Microphone System · Receiver",
    model: "COMICA WM100 PLUS RX",
    role: "Brings wireless audio into the sound system",
    summary: "Receives TX 1 and TX 2 wirelessly and sends them to the mixer from AUDIO OUTPUT",
    facts: ["Two transmitters into one receiver", "TX and RX talk wirelessly — no cable between them", "RX AUDIO OUTPUT feeds the mixer"],
    inThisRoom: "Lavalier Mic 1 → TX 1 and Lavalier Mic 2 → TX 2 → Wireless → COMICA RX → Audio Cable → Audio Mixer",
    unverified: ["Size estimated from reference photos"],
  },
  tx1: {
    name: "Wireless Transmitter (TX 1)",
    model: "COMICA WM100 PLUS TX 1",
    role: "Wireless transmitter 1",
    summary: "Takes the lavalier mic and sends it wirelessly to the COMICA receiver",
    facts: ["TX MIC INPUT takes the 3.5 mm lavalier lead", "No cable runs between TX and RX"],
    inThisRoom: "Lavalier Mic 1 → TX 1 → Wireless → COMICA RX",
    unverified: ["Size estimated from reference photos"],
  },
  tx2: {
    name: "Wireless Transmitter (TX 2)",
    model: "COMICA WM100 PLUS TX 2",
    role: "Wireless transmitter 2",
    summary: "Takes the lavalier mic and sends it wirelessly to the COMICA receiver",
    facts: ["TX MIC INPUT takes the 3.5 mm lavalier lead", "No cable runs between TX and RX"],
    inThisRoom: "Lavalier Mic 2 → TX 2 → Wireless → COMICA RX",
    unverified: ["Size estimated from reference photos"],
  },
  mic: {
    name: "Microphone",
    model: "Sennheiser XS 1",
    role: "Sound source into the audio system",
    summary: "Wired dynamic microphone for speech or vocals, into the mixer over XLR",
    facts: ["XLR OUTPUT is a 3-pin XLR", "Suits speech, ceremonies, stage and recording", "Needs a mixer or sound system before use", "Not wireless"],
    inThisRoom: "Sennheiser XS 1 → XLR Cable → Audio Mixer",
    unverified: ["Size estimated from reference photos"],
  },
  speaker: {
    name: "Studio Monitor Speaker",
    model: "Yamaha HS5",
    role: "Monitoring destination for the audio system",
    summary: "Active studio monitor with its own amplifier — check quality and level from the mixer before recording or streaming",
    facts: ["Balanced XLR INPUT and 6.35 mm TRS INPUT", "Takes the mixer MAIN OUT line level", "Never from an amplified SPEAKER OUTPUT", "For listening — not a microphone"],
    inThisRoom: "Mixer MAIN OUT → XLR or 6.35 mm TRS lead → Yamaha HS5",
    unverified: ["Scaled up for visibility; not measured from a unit"],
  },
  monitor: {
    name: "TV / Production Monitor",
    model: "Samsung 43\" Crystal UHD U8000F · UA43U8000FKXXT",
    role: "Picture destination for Program and multiview checks",
    summary: "43-inch 4K TV fed by the switcher so the operator can check pictures before recording or streaming",
    facts: ["Three HDMI inputs for picture and sound", "Accepts the HDS7105 PGM OUT or MULTIVIEW OUT", "Shows a simulated picture that follows the real patch", "Displays only — it does not switch cameras"],
    inThisRoom: "HDS7105 MULTIVIEW or PGM HDMI OUT → HDMI lead → Samsung TV HDMI IN",
    unverified: ["Rear HDMI positions estimated from reference photos"],
  },
  cam1: {
    name: "Camera",
    model: "Panasonic HC-X2000",
    role: "Picture source",
    summary: "4K camcorder on a fluid-head tripod, cabled to the video switcher",
    facts: ["Top handle with an XLR audio unit", "Tripod pan bar for smooth moves"],
    inThisRoom: "Camera VIDEO OUT → Switcher HDMI IN",
    unverified: ["Rear video output position, and HDMI vs SDI in the real room", "Real size (model scaled 1.6×)"],
  },
};
