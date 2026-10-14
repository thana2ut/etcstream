import type { EquipmentInfo } from "./equipment-info";
import type { Scenario, VenueScale } from "@/game/training/scenarios";

/**
 * Mission Hall equipment knowledge (Thai). Used only for venue scenarios (xs…xl); free practice keeps EQUIPMENT_INFO.
 * Model lines state reference status: a manufacturer source proves a sample model's capability, not university ownership.
 * `inThisRoom` is filled per level from the routes that actually touch the device.
 */
type Base = Omit<EquipmentInfo, "inThisRoom" | "unverified"> & { unverified?: string[] };
const K = (name: string, model: string, role: string, summary: string, facts: string[], unverified: string[] = []): Base => ({ name, model, role, summary, facts, unverified });

const CAT: Record<string, Base> = {
  hdmiCam: K("กล้อง HDMI", "Generic Training Model", "VIDEO SOURCE", "กล้องวิดีโอที่ส่งภาพออกทางพอร์ต HDMI OUT เป็นแหล่งภาพผู้สอนหรือผู้พูด", ["HDMI OUT เป็นทางออกภาพ ไม่ใช่ทางเข้า", "ตั้ง format ให้ตรงระบบ (1080p50)", "ปิดตัวหนังสือ/เมนูบน HDMI OUT ก่อนออกอากาศ", "HDMI passive มีระยะจำกัด ถ้าไกลต้องใช้ extender ตามสเปก"]),
  studioCam: K("กล้องสตูดิโอ", "Studio Camera · โปรไฟล์ HDMI (PROVISIONAL)", "VIDEO SOURCE", "กล้องบนขาตั้งรอบฉากเขียว ส่งภาพเข้า HDS7105 ช่องของตัวเอง", ["กล้องแต่ละตัวเข้าอินพุตแยกกัน", "ถ้ากล้องเป็น SDI แต่สวิตเชอร์รับ HDMI ต้องมี SDI→HDMI converter", "การสลับกล้องทำที่สวิตเชอร์ ไม่ใช่ย้ายสาย"], ["รุ่นกล้องและพอร์ตจริง"]),
  sdiCam: K("กล้อง SDI", "Generic Training Model", "VIDEO SOURCE", "กล้องที่มี 3G-SDI OUT บนหัว BNC 75Ω ใช้ส่งภาพระยะไกลกว่า HDMI และล็อกหัวต่อได้", ["SDI ใช้ BNC 75Ω — BNC ของ REF/Genlock ไม่ใช่ช่องภาพ", "ระยะสาย SDI ขึ้นกับชนิดสาย อัตรา และ receiver ไม่มีตัวเลขตายตัว [R07]", "ทุกกล้องตั้ง format เดียวกัน"]),
  ptz: K("กล้อง PTZ (SDI)", "Generic PTZ ที่มี SDI OUT", "VIDEO SOURCE", "กล้องหมุน/ซูมระยะไกล เลือกรุ่นที่มี SDI OUT จึงเข้าสวิตเชอร์ SDI ได้ตรง", ["ภาพ (SDI) กับการควบคุม (IP/Serial) เป็นคนละเส้น", "ต้องตรวจว่ารุ่นที่ใช้มี SDI จริง"]),
  bcCam: K("กล้องถ่ายทอดสด", "Broadcast Camera + Fiber · Generic [R09]", "VIDEO SOURCE", "กล้องที่ต่อกับ CCU/Base Station ของระบบเดียวกันผ่าน Camera Fiber ภาพออกเป็น SDI ที่ CCU", ["กล้องกับ CCU ต้องเป็นระบบที่คู่กัน", "Fiber นำภาพ เสียงกลับ talkback tally และไฟตามระบบ", "ภาพเข้า Router ก่อนถึงสวิตเชอร์"]),
  laptop: K("Laptop นำเสนอ", "Generic Training Model", "PRESENTATION", "โน้ตบุ๊กที่ส่งภาพสไลด์ออกทาง HDMI OUT", ["ตั้งจอ Duplicate/Extend ให้ภาพที่ต้องการออก HDMI", "เข้าสวิตเชอร์ SDI ต้องผ่าน HDMI→SDI converter ที่มีไฟเลี้ยง"]),
  miniSw: K("Mini HDMI Switcher", "อ้างอิงความสามารถ ATEM Mini Pro [R01]", "VIDEO SWITCHING", "สวิตเชอร์ขนาดเล็ก มี HDMI IN หลายช่อง, HDMI OUT แยก และ USB ที่ทำตัวเป็น Webcam ให้คอมพิวเตอร์", ["USB Webcam = Capture ในตัว ไม่ต้องมี Capture Card แยก", "HDMI OUT ตั้งได้ว่าเป็น Program หรือ Multiview — จอห้องเรียนต้องเป็น Program", "ช่อง MIC 3.5 mm ตั้งระดับให้ตรงสัญญาณ Line จาก Mixer", "USB ของสวิตเชอร์เป็น Device คอมพิวเตอร์เป็น Host"]),
  hds: K("Video Switcher", "DeviceWell HDS7105 · พอร์ตเป็นโปรไฟล์ฝึก", "VIDEO SWITCHING", "สวิตเชอร์ของสตูดิโอ รวมภาพกล้องและเสียงจาก Mixer ก่อนส่ง PGM ไป Capture", ["เสียงรายการต้องผ่านสวิตเชอร์ (Mixer → Switcher → Capture)", "MULTIVIEW ให้ผู้ควบคุมดู ไม่ใช่ภาพส่งผู้ชม", "PGM คือภาพที่ออกอากาศ"], ["revision และพอร์ตด้านหลังจริง"]),
  prodSw: K("Production SDI Switcher", "อ้างอิงความสามารถ ATEM Television Studio HD8 [R02] · Generic", "VIDEO SWITCHING", "สวิตเชอร์ 8 อินพุต 3G-SDI ที่มี PROGRAM, AUX, MULTIVIEW และ USB Webcam แยกกันจริง", ["ทุก output ต้องมีพอร์ตจริง ห้ามแยกด้วยสาย Y", "AUX เลือกได้ว่าส่ง Program หรืออย่างอื่น", "รับ Broadcast Mix ผ่าน AUDIO IN แล้วผสมเข้า Program"]),
  fieldSw: K("Field SDI Switcher", "Generic Training Model", "VIDEO SWITCHING", "สวิตเชอร์พกพาในเต็นท์ควบคุม รับ SDI หลายช่อง ส่ง PGM และ MULTIVIEW แยกกัน", ["PGM ไป Embedder/Encoder, MULTIVIEW ไปจอในเต็นท์", "เสียงในงานนี้ฝังด้วย Audio Embedder"]),
  bigSw: K("Broadcast Production Switcher", "อ้างอิง ATEM 2 M/E Constellation 4K [R03]", "VIDEO SWITCHING", "สวิตเชอร์ผู้กำกับรายการ สร้าง Program/Preview/AUX จากแหล่งที่ Router ส่งมา", ["Router เลือกเส้นทาง ส่วน Switcher สร้าง Program", "เสียงอนาล็อกของรุ่นอ้างอิงเป็น 1/4 นิ้ว ไม่ใช่ XLR → ใช้ Embedder", "ส่ง Tally ไประบบกล้อง"]),
  router: K("SDI Video Router", "อ้างอิง Videohub 20x20 12G [R16]", "VIDEO ROUTING", "Router แบบ crosspoint เลือกว่าอินพุตใดไปออกเอาต์พุตใด", ["Router ไม่ใช่ Switcher: ไม่มี Program/Transition", "ต้องตั้ง crosspoint ทุกเส้นทาง", "20x20 คือจำนวนพอร์ต ไม่ใช่จำนวนกล้องขั้นต่ำ"]),
  ccu: K("CCU / Base Station", "Generic (คู่ระบบกับกล้องหมายเลขเดียวกัน) [R09]", "OPERATIONS", "ฐานควบคุมกล้องใน Rack รับ Camera Fiber จากกล้องคู่ระบบของตัวเอง ส่ง SDI ไป Router และรับ Tally กลับ", ["CCU n คู่กับกล้อง n เท่านั้น", "Tally/Talkback ใช้เส้นทางของระบบกล้อง"]),
  h2s: K("HDMI → SDI Converter", "อ้างอิง Micro Converter [R08]", "CONVERSION", "ตัวแปลงแบบ active มีไฟเลี้ยง รับ HDMI แล้วส่ง SDI", ["ไม่ใช่สายแปลงหัวธรรมดา", "ทิศทางตายตัว HDMI IN → SDI OUT"]),
  s2h: K("SDI → HDMI Converter", "อ้างอิง Micro Converter [R08]", "CONVERSION", "ตัวแปลงแบบ active รับ SDI แล้วส่ง HDMI ให้จอที่ไม่มีช่อง SDI", ["ต้องมีไฟเลี้ยง", "ทิศทาง SDI IN → HDMI OUT"]),
  fiberTx: K("SDI → Fiber TX", "Generic (คู่กับ RX) [R09]", "TRANSPORT", "ตัวส่งที่ฝั่งกล้องไกล แปลง SDI เป็นแสงส่งผ่านสาย Fiber", ["ต้องมีไฟเลี้ยงและ RX คู่ที่ตรง protocol/หัวต่อ", "สาย Fiber ไม่แปลง SDI เอง"]),
  fiberRx: K("Fiber → SDI RX", "Generic (คู่กับ TX) [R09]", "TRANSPORT", "ตัวรับที่เต็นท์ควบคุม แปลงแสงกลับเป็น SDI เข้าสวิตเชอร์", ["ต้องเป็นคู่ของ TX ตัวเดียวกัน", "ต้องเปิดไฟเลี้ยง"]),
  tv: K("จอแสดงผล", "Generic / รุ่นที่เลือกสำหรับฝึก", "DISPLAY / MONITORING", "จอรับภาพสำหรับผู้ชมหรือผู้ควบคุม", ["จอผู้ชมต้องได้รับ Program ไม่ใช่ Multiview", "จอผู้ควบคุมดู Multiview", "จอ 4K ไม่ได้บังคับให้ทั้งระบบเป็น 4K"]),
  mixerSmall: K("Small Audio Mixer", "Generic (มีบัส PA และ AUX แยกจริง)", "AUDIO MIXING", "มิกเซอร์ขนาดเล็ก ตั้ง Gain แล้วแยกส่งลำโพงห้อง (PA) และเสียงรายการ (STREAM/AUX)", ["บัส PA กับ STREAM แยกเพื่อปรับแต่ละปลายทางได้", "ช่อง Combo รับ XLR (Mic) และ TRS (Line)"]),
  mixerPmx: K("Audio Mixer", "PMX-402D-USB chassis · PROVISIONAL", "AUDIO MIXING", "มิกเซอร์สตูดิโอรวม Wireless และ XS 1 ส่ง MAIN เข้าสวิตเชอร์ และ MONITOR ออก HS5", ["MAIN = เสียงรายการเข้า HDS7105", "MONITOR/AUX แยกไปลำโพงสตูดิโอ", "ไมค์ XLR เข้าช่อง MIC ที่มี Preamp"], ["แบรนด์/พอร์ตที่ติดตั้งจริง"]),
  mixerDigital: K("Digital Mixer / Console", "Generic Training Model", "AUDIO MIXING", "มิกเซอร์ดิจิทัลรับช่องจาก Stagebox ผ่าน Multicore แล้วแยก PA BUS และ BROADCAST BUS", ["Broadcast Mix กับ PA Mix เป็นคนละ mix [R12]", "ตั้ง Gain ทุกช่องก่อน", "อย่าส่งเสียงผู้บรรยายออก PA สนาม"]),
  mixerField: K("Field Audio Mixer", "Generic Training Model", "AUDIO MIXING", "มิกเซอร์ภาคสนาม รวมพิธีกร Shotgun Ambient แยก PA กับ Broadcast", ["Phantom +48V เปิดเฉพาะไมค์ Condenser ที่ต้องการ [R11]", "Broadcast เป็น Line balanced ไป Embedder"]),
  handheld: K("ไมค์มือถือไร้สาย", "Generic Training Model", "WIRELESS", "ไมค์มือถือที่มีตัวส่งในตัว ส่ง RF ไปยังตัวรับของตัวเอง", ["ต้อง Pair กับ RX ของตัวเอง (ช่วง RF ไม่มีสาย)", "แต่ละตัวใช้ช่องความถี่ไม่ชนกัน", "RX แต่ละเครื่องมีเอาต์พุตแยก เข้า Stagebox คนละช่อง"]),
  lav: K("Lavalier", "Generic Training Model", "AUDIO SOURCE", "ไมค์หนีบเสื้อ ต่อสายเข้าตัวส่ง (TX)", ["สายไมค์เสียบ TX ไม่ใช่มิกเซอร์", "หนีบห่างปากประมาณหนึ่งฝ่ามือ"]),
  tx: K("Wireless TX", "Generic Training Model", "WIRELESS", "ตัวส่งที่แปลงเสียงไมค์เป็น RF ไปยัง RX ที่ Pair ไว้", ["ช่วง RF ไม่มีสาย ต้อง Pair", "ตรวจแบตเตอรี่และ Mute"]),
  rx: K("Wireless RX", "Generic Training Model", "WIRELESS", "ตัวรับที่รับคลื่นจาก TX แล้วส่งเสียงทางสายไปยังมิกเซอร์/Stagebox", ["ต้อง Pair ก่อนจึงมีเสียง", "ตั้ง OUT เป็น Mic/Line ให้ตรงช่องปลายทาง", "บางรุ่นผสมหลาย TX เป็นช่องเดียว"]),
  mic: K("ไมโครโฟนสาย", "Generic / ตามที่ระบุ", "AUDIO SOURCE", "ไมค์ระดับ Mic ต่อ XLR เข้าช่อง MIC ที่มี Preamp", ["Mic level ต้องผ่าน Preamp", "ไดนามิกไม่ต้องใช้ Phantom ส่วน Condenser ต้องใช้"]),
  speaker: K("ลำโพง Active", "Generic / รุ่นที่เลือกสำหรับฝึก", "AUDIO DISTRIBUTION", "ลำโพงที่มีภาคขยายในตัว รับสัญญาณ Line จากบัสของมิกเซอร์", ["Active speaker รับ Line ไม่ใช่สายลำโพงจาก Power amp", "ลำโพง Passive ต้องผ่าน Amplifier"]),
  stagebox: K("Analog Stagebox", "Generic Training Model", "AUDIO TRANSPORT", "กล่องรวมช่องไมค์ ส่งทุกช่องไปมิกเซอร์ผ่าน Multicore เส้นเดียว", ["ต้องใช้ Multicore ที่คู่กัน", "Dante stagebox ต้องมีระบบ Dante ไม่ใช่ RJ45 ธรรมดา [R14][R17]"]),
  embedder: K("Audio Embedder", "อ้างอิง AJA 3G-AMA [R15]", "AUDIO EMBED", "รับ SDI Program และเสียง Broadcast แบบ balanced แล้วส่ง SDI ที่มีเสียงฝัง", ["SDI IN กับ AUDIO IN เป็นพอร์ตคนละชนิด", "ต้องตั้ง embed pair", "ฝังครั้งเดียว ไม่ใส่ซ้ำที่ Encoder"]),
  da: K("Active SDI DA", "Generic Training Model", "DISTRIBUTION", "แจก SDI หนึ่งเส้นเป็นหลายเอาต์พุตอย่างถูกต้อง", ["ห้าม Y-split แบบ passive", "ยังเป็นจุดเสี่ยงร่วม ไม่ใช่ Full redundancy"]),
  encoder: K("Hardware Encoder", "อ้างอิงความสามารถ [R06]", "ENCODE", "รับ SDI Program แล้วเข้ารหัสส่งผ่าน Ethernet ไปยังปลายทาง", ["ต่อสายแล้ว ≠ สตรีมพร้อม", "ค่า bitrate ตามแพลตฟอร์ม (เปลี่ยนได้) [R13]"]),
  network: K("Network / Uplink", "Generic · จำลอง", "NETWORK", "เครือข่ายจาก Encoder ไปยังปลายทางรับสตรีม", ["RJ45 ไม่ได้แปลว่าเป็น Internet/Dante เสมอ", "สำรองจริงต้องแยกเครือข่าย"]),
  ingest: K("Ingest (จำลอง)", "Mission simulation", "NETWORK", "ปลายทางรับสตรีมจำลอง ไม่ได้เชื่อมแพลตฟอร์มจริง", ["Uplink กับ Ingest เป็นคนละสถานะ"]),
  capture: K("USB Capture HDMI", "Magewell USB Capture HDMI Gen 2 · รุ่นที่เลือกสำหรับฝึก [R05]", "CAPTURE", "รับ HDMI แล้วส่งเป็น USB Video Device ให้คอมพิวเตอร์ (ไม่ใช่ Encoder)", ["USB เป็น Device ต่อเข้า Host", "รับ PGM ที่มีเสียงฝัง"]),
  pc: K("คอมพิวเตอร์ + OBS (จำลอง)", "Generic / HP-style", "ENCODE", "รับภาพผ่าน USB แล้วใช้ OBS บันทึก/สตรีม", ["คอมพิวเตอร์เป็น USB Host", "เลือก Video Capture Device ให้ถูก", "ใช้เสียงทางเดียว อย่าเปิด Desktop/Mic ซ้ำ [R04]"]),
  recorder: K("Program Recorder", "Generic Training Model", "RECORDING", "บันทึก SDI Program พร้อมเสียงลง Storage", ["ต้องได้รับ Program ที่มีเสียง", "ตรวจ Storage ก่อนบันทึก"]),
  replay: K("Replay Server", "Generic Training Model", "VIDEO SOURCE", "บันทึกและเล่นซ้ำไฮไลต์ ส่ง SDI เข้า Router", ["ภาพ Replay เข้า Router ก่อนถึง Switcher", "CONTROL IN รับคำสั่งจาก Controller"]),
  replayCtl: K("Replay Controller", "Generic Training Model", "OPERATIONS", "แผงควบคุมรีเพลย์ ต่อสายควบคุมไป Replay Server", ["ส่งคำสั่ง ไม่ได้ส่งภาพ"]),
  graphics: K("Graphics Workstation", "Generic Training Model", "VIDEO SOURCE", "คอมพิวเตอร์ทำกราฟิกรายการ ส่ง HDMI ซึ่งต้องแปลงเป็น SDI ก่อนเข้า Router", ["ใช้ HDMI→SDI converter ที่มีไฟเลี้ยง"]),
  intercom: K("Intercom", "Generic Training Model", "OPERATIONS", "ระบบสื่อสารระหว่างผู้กำกับ ช่างกล้อง และผู้บรรยาย", ["เป็นสัญญาณสื่อสาร ไม่ใช่เสียงรายการ", "ต้องใช้พอร์ต/โปรโตคอลที่ตรงกัน"]),
};

function categoryOf(scale: VenueScale, id: string): string {
  if (/^cam\d/.test(id)) return scale === "xs" ? "hdmiCam" : scale === "s" ? "studioCam" : scale === "xl" ? "bcCam" : scale === "m" && id === "cam4" ? "ptz" : "sdiCam";
  if (id === "sw") return { xs: "miniSw", s: "hds", m: "prodSw", l: "fieldSw", xl: "bigSw" }[scale];
  if (id === "mix") return { xs: "mixerSmall", s: "mixerPmx", m: "mixerDigital", l: "mixerField", xl: "mixerDigital" }[scale];
  if (/^ccu\d$/.test(id)) return "ccu";
  if (/^(hh|lav)rx\d/.test(id)) return "rx";
  if (/^hh\d/.test(id)) return "handheld";
  if (id.startsWith("lav")) return "lav";
  if (id.startsWith("tx")) return "tx";
  if (/^mic\d?$/.test(id)) return "mic";
  const map: Record<string, string> = {
    slides: "laptop", monitor: "tv", display: "tv", "conv-slides": "h2s", "conv-gfx": "h2s", "conv-display": "s2h", "display-conv": "s2h",
    "fiber-tx": "fiberTx", "fiber-rx": "fiberRx", rx: "rx", speaker: "speaker", pa: "speaker", stagebox: "stagebox", embedder: "embedder", da: "da",
    encoder: "encoder", backup: "encoder", network: "network", "backup-net": "network", live: "ingest", "live-backup": "ingest", capture: "capture", pc: "pc",
    recorder: "recorder", replay: "replay", "replay-ctl": "replayCtl", graphics: "graphics", intercom: "intercom", commentary: "intercom", router: "router",
  };
  return map[id] ?? "";
}

/** Knowledge card for a venue-scenario device; the path lists this level's real routes through it. */
export function missionEquipmentInfo(scenario: Scenario, id: string): EquipmentInfo | undefined {
  if (!scenario.venueScale) return undefined;
  const base = CAT[categoryOf(scenario.venueScale, id)];
  const device = scenario.devices.find((d) => d.id === id);
  if (!base || !device) return undefined;
  const mine = (p: string) => scenario.ports[p]?.device === id;
  const routes = scenario.requirements.filter((r) => r.from.some(mine) || r.to.some(mine)).map((r) => r.label);
  return {
    name: device.label, model: device.model && device.model !== "GENERIC TRAINING MODEL" ? device.model : base.model,
    role: base.role, summary: base.summary, facts: base.facts,
    inThisRoom: routes.length ? routes.join(" · ") : "อุปกรณ์นี้ใช้ในขั้นตอนตั้งค่าของด่าน",
    unverified: base.unverified ?? [],
  };
}
