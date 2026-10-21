import type { ControlDefinition, EquipmentDefinition, PortDefinition, SignalClass, VideoFormat } from "./types";
import type { Connector } from "../scenarios";
import { referenceModels } from "./reference-equipment";

/**
 * Equipment manifest. Named models list `sourceUrl` (manufacturer tech-spec page given in the room
 * specification) and `verifiedPorts` (the ports this game models, each present on that page). Only the ports a
 * stage needs are modelled; unmodelled physical ports are listed in `notes`. Everything else is an explicit
 * "Generic Training Device" whose ports are exactly those the room specification defines.
 * Asset licence: all meshes are original procedural stand-ins built in this project (no manufacturer CAD/artwork).
 */
const LICENSE_ORIGINAL = "โมเดลฝึกสร้างขึ้นในโครงการนี้ ไม่ใช้แบบ CAD หรือภาพของผู้ผลิต";
const HD: VideoFormat[] = ["720p50", "1080p50", "1080p60"];
const CAM_FORMATS: VideoFormat[] = ["1080p50", "1080p60", "2160p50"];

const p = (key: string, name: string, dir: "INPUT" | "OUTPUT", connector: Connector, sig: SignalClass, tip: string, extra: Partial<PortDefinition> = {}): PortDefinition =>
  ({ key, name, dir, connector, sig, tip, panel: "rear", ...extra });
const power: ControlDefinition = { key: "power", label: "ไฟเลี้ยง", kind: "toggle", default: false, tip: "ตรวจไฟเลี้ยงจำลองอย่างปลอดภัย โดยช่างติดตั้งแหล่งจ่ายพร้อมป้ายไว้แล้ว ไม่ใช่งานต่อไฟฟ้าหลัก" };
const sel = (key: string, label: string, options: string[], tip: string, def?: string): ControlDefinition => ({ key, label, kind: "select", options, default: def ?? options[0], tip });
const tog = (key: string, label: string, tip: string, def = false): ControlDefinition => ({ key, label, kind: "toggle", default: def, tip });

const SM58: EquipmentDefinition = {
  modelId: "shure-sm58", manufacturer: "Shure", name: "Shure SM58", generic: false, kind: "mic", size: [0.212, 0.052, 0.052],
  sourceUrl: "https://www.shure.com/en-US/docs/guide/SM58", verifiedPorts: ["XLR OUT (3-pin male, balanced)"], assetLicense: LICENSE_ORIGINAL,
  needsPower: false, role: "mic",
  ports: [p("xlr-out", "XLR OUT", "OUTPUT", "XLR", "MIC", "ขาออกไมค์ไดนามิกแบบสมดุล ระดับ MIC ต้องผ่านวงจรขยายไมค์ ไม่ต้องใช้ไฟแฟนทอม", { channels: 1, panel: "side" })],
  controls: [sel("aim", "ทิศทางหัวไมค์", ["At talker's mouth", "Toward PA loudspeaker"], "ไมค์รับเสียงด้านหน้า ให้หันเข้าปากและจัดลำโพงหลบทิศรับเสียง ตามคำแนะนำป้องกันเสียงหอนของ Shure"),
    tog("windscreen", "ติดอุปกรณ์กันลมแล้ว", "อุปกรณ์กันลมโฟมหรือขนสำหรับกลางแจ้ง")],
  notes: ["ไมค์ไดนามิกรับเสียงด้านหน้า ไม่ต้องใช้ไฟแฟนทอม +48 V", "ส่งระดับไมค์เท่านั้น ต้องเข้าวงจรขยายไมค์ ห้ามต่อเข้าระดับไลน์ตรง"],
};

const AMBIENCE_MIC: EquipmentDefinition = {
  ...SM58, modelId: "generic-ambience-mic", manufacturer: "Generic Training Device", name: "ไมค์บรรยากาศไดนามิกสมดุลจำลอง", generic: true, sourceUrl: undefined,
  verifiedPorts: ["XLR OUT (mic level) — กำหนดตามข้อกำหนดห้อง"],
  controls: [tog("windscreen", "ติดอุปกรณ์กันลมภาคสนามแล้ว", "ไมค์บรรยากาศกลางแจ้งต้องกันลม")],
  notes: ["อุปกรณ์ฝึกจำลอง มี XLR สมดุลระดับไมค์เท่านั้น"],
};

const MG12XU: EquipmentDefinition = {
  modelId: "yamaha-mg12xu", manufacturer: "Yamaha", name: "Yamaha MG12XU", generic: false, kind: "mixer", size: [0.308, 0.118, 0.48],
  sourceUrl: "https://usa.yamaha.com/products/proaudio/mixers/mg_series_xu_model/specs.html",
  verifiedPorts: ["MIC/LINE IN CH1–CH3 (XLR combo)", "STEREO OUT L/R (XLR, balanced)", "GROUP OUT 1/2 (TRS phone, balanced)", "PHONES (TRS)", "USB (USB-B, 2-in/2-out audio)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "mixer",
  ports: [
    ...[1, 2, 3].map((n) => p(`mic-${n}`, `CH${n} MIC/LINE IN`, "INPUT", "XLR", "MIC", `ช่อง ${n} ขาเข้า XLR/TRS พร้อมวงจรขยาย GAIN รับระดับ MIC หรือ LINE`, { channels: 1, panel: "front" })),
    p("st-l", "STEREO OUT L", "OUTPUT", "XLR", "LINE_BAL", "ขาออก LINE สมดุล +4 dBu ซ้าย ใช้ป้อนขาเข้าไลน์ลำโพงหรือเครื่องสลับภาพ", { channels: 1 }),
    p("st-r", "STEREO OUT R", "OUTPUT", "XLR", "LINE_BAL", "ขาออก LINE สมดุล +4 dBu ขวา", { channels: 1 }),
    p("grp-1", "GROUP OUT 1", "OUTPUT", "6.35mm", "LINE_BAL", "ขาออก TRS สมดุล GROUP 1 มีเฉพาะช่องที่ส่งเข้า GROUP 1-2", { channels: 1 }),
    p("grp-2", "GROUP OUT 2", "OUTPUT", "6.35mm", "LINE_BAL", "ขาออก TRS สมดุล GROUP 2", { channels: 1 }),
    p("phones", "PHONES", "OUTPUT", "6.35mm", "HEADPHONE", "ขาออกขยายเสียงสำหรับหูฟัง ไม่ใช้ป้อนลำโพงหรือไลน์", { channels: 2, panel: "front" }),
    p("usb", "USB (audio)", "OUTPUT", "USB-B", "USB_UAC", "ส่งข้อมูลเสียงรวมสเตอริโอผ่าน USB เข้าคอมพิวเตอร์ ไม่ใช่เสียงแอนะล็อก", { channels: 2 }),
  ],
  controls: [power,
    ...[1, 2, 3].flatMap((n) => [
      sel(`ch${n}-gain`, `ช่อง ${n} ระดับขยาย GAIN`, ["Minimum", "Nominal (peaks −18 dBFS)", "Too hot (clips)"], "ตั้งวงจรขยายให้ยอดเสียงพูดต่ำกว่าจุดเสียงแตกพอสมควร"),
      tog(`ch${n}-on`, `ช่อง ${n} เปิดเสียง`, "เปิดหรือปิดเสียงช่องนี้"),
      tog(`ch${n}-st`, `ช่อง ${n} → เสียงรวม ST`, "ส่งเสียงช่องนี้เข้าชุดรวม STEREO"),
      tog(`ch${n}-grp`, `ช่อง ${n} → กลุ่มเสียง 1-2`, "ส่งช่องนี้เข้า GROUP 1-2 สำหรับเสียงสตรีมแยก"),
      tog(`ch${n}-hpf`, `ช่อง ${n} กรองเสียงต่ำ 80 Hz`, "กรองเสียงต่ำ ลดเสียงครางและเสียงจับอุปกรณ์"),
    ]),
    sel("st-fader", "ระดับเสียงรวมสเตอริโอ", ["Down", "Unity"], "ระดับเสียงรวมสเตอริโอ", "Down"),
    sel("grp-fader", "ระดับเสียงกลุ่ม 1-2", ["Down", "Unity"], "ระดับเสียงรวมกลุ่ม", "Down"),
    tog("phones-st", "หูฟังรับเสียงสเตอริโอ", "หูฟังรับเสียงตามชุดรวมสเตอริโอ", true),
  ],
  notes: ["SM58 แบบไดนามิกไม่ต้องใช้ไฟแฟนทอม +48 V", "USB ใช้เชื่อมเสียงกับคอมพิวเตอร์ ไม่ป้อนขาเข้าเสียงแอนะล็อก XLR", "PHONES ใช้หูฟังเท่านั้น ไม่ใช้ป้อนลำโพง"],
};

const STUDIO_CAM: EquipmentDefinition = {
  modelId: "bmd-studio-camera-4k-pro-g2", manufacturer: "Blackmagic Design", name: "Blackmagic Studio Camera 4K Pro G2", generic: false, kind: "camera", size: [0.32, 1.5, 0.45],
  sourceUrl: "https://www.blackmagicdesign.com/products/blackmagicstudiocamera/techspecs/W-CST-11",
  verifiedPorts: ["12G-SDI OUT", "12G-SDI IN (program return)", "HDMI OUT (monitoring)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "source",
  ports: [
    p("sdi-out", "12G-SDI OUT", "OUTPUT", "SDI", "SDI", "ขาออกภาพกล้องตามรูปแบบที่เลือก ตั้ง 1080p50 สำหรับเครื่องสลับภาพ HD 3G-SDI", { formats: CAM_FORMATS }),
    p("sdi-ret", "12G-SDI IN (RETURN)", "INPUT", "SDI", "SDI", "ขาเข้าภาพออกอากาศส่งกลับ พร้อมไฟสถานะและสื่อสาร ไม่ใช่ขาออกภาพกล้อง", { formats: CAM_FORMATS }),
    p("hdmi-out", "HDMI OUT (monitor)", "OUTPUT", "HDMI", "HDMI", "ขาออก HDMI สำหรับตรวจภาพ ไม่ใช้ในเส้นทางผลิตรายการ SDI", { formats: CAM_FORMATS }),
  ],
  controls: [power, sel("format", "รูปแบบภาพ", ["2160p50", "1080p50", "1080p60"], "พอร์ต 12G ส่ง UHD ได้ แต่เครื่องสลับภาพ HD 3G-SDI ต้องใช้ 1080p50", "1080p50"),
    sel("framing", "การจัดกรอบภาพ", ["Not framed", "Framed for assignment"], "จัดกรอบตามหน้าที่กล้องที่ระบุในตารางทีมงาน"),
    tog("cam-audio", "ฝังเสียงไมค์กล้อง", "ฝังเสียงไมค์กล้องใน SDI/HDMI อาจทำให้เสียงซ้อนเมื่อเข้าออกอากาศ", true)],
  notes: ["12G-SDI IN เป็นขาเข้าภาพกลับ ใช้เป็นต้นทางจะกลายเป็นขาเข้าชนขาเข้า", "มีพอร์ต 12G ไม่ได้ทำให้เครื่องสลับภาพรองรับ UHD"],
};

const ATEM_MINI_PRO_ISO: EquipmentDefinition = {
  modelId: "bmd-atem-mini-pro-iso", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM Mini Pro ISO", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemmini/techspecs",
  verifiedPorts: ["HDMI IN 1–4", "HDMI OUT (configurable: Program or Multiview)", "MIC IN 1–2 (3.5 mm stereo)", "Ethernet (streaming/control)", "USB-C (webcam out OR disk recording)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`hdmi-in-${n}`, `HDMI IN ${n}`, "INPUT", "HDMI", "HDMI", `HDMI ขาเข้า ${n} รองรับ HD พร้อมแปลง HD ในตัว ไม่รองรับ UHD หรือถอด HDCP`, { formats: HD })),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออกเพียงพอร์ตเดียว เลือกภาพออกอากาศหรือจอรวมภาพ ไม่สามารถใช้สองหน้าที่พร้อมกัน"),
    p("mic-1", "MIC IN 1 (3.5 mm)", "INPUT", "3.5mm", "LINE_UNBAL", "ขาเข้าสเตอริโอ 3.5 มม. ไม่สมดุล ตั้ง LINE เมื่อรับไลน์ระดับอุปกรณ์ทั่วไป", { channels: 2 }),
    p("mic-2", "MIC IN 2 (3.5 mm)", "INPUT", "3.5mm", "LINE_UNBAL", "ขาเข้าสเตอริโอ 3.5 มม. ไม่สมดุล", { channels: 2 }),
    p("usb", "USB-C", "OUTPUT", "USB-C", "USB_UVC", "USB-C ส่งเว็บแคมเข้าคอมพิวเตอร์หรือบันทึกดิสก์ USB ได้ทีละหน้าที่"),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet ส่งสตรีม RTMP และควบคุม ต้องมีเราเตอร์ที่ WAN ใช้งานได้"),
  ],
  controls: [power,
    sel("pgm", "เลือกภาพออกอากาศ", ["Black", "HDMI 1", "HDMI 2", "HDMI 3", "HDMI 4"], "สลับแหล่งภาพนี้ออกอากาศ"),
    sel("hdmi-out", "ปุ่ม VIDEO OUT · ภาพที่ส่งออก HDMI OUT", ["PROGRAM", "MULTIVIEW"], "HDMI OUT มีช่องเดียว ค่าเริ่มต้นคือ MULTIVIEW กด VIDEO OUT เลือกภาพออกอากาศเมื่อต้องส่งขึ้นจอ", "MULTIVIEW"),
    sel("mic1-mode", "ระดับขาเข้า MIC 1", ["MIC", "LINE"], "รับไลน์ระดับอุปกรณ์ทั่วไปต้องตั้ง LINE หากตั้ง MIC จะดังจนแตก", "MIC"),
    tog("mic1-on", "ส่ง MIC 1 ไปเสียงออกอากาศ", "Fairlight: รวม MIC 1 เข้าเสียงออกอากาศ"),
    sel("emb-audio", "เสียงจากแหล่งภาพ HDMI", ["ON", "AFV", "OFF"], "เสียงฝังจากกล้องหรือโน้ตบุ๊ก เปิดพร้อมไมค์อื่นอาจทำให้เสียงผู้สอนซ้อน", "ON"),
    tog("labels", "ตั้งชื่อช่องขาเข้าแล้ว", "ตั้งชื่อช่อง CAM / SLIDES / DOC ใน ATEM Software Control"),
    sel("usb-mode", "หน้าที่พอร์ต USB-C", ["Webcam output", "Record to disk"], "เลือกหน้าที่เดียวให้พอร์ต USB-C", "Webcam output"),
    tog("record", "บันทึกแยกกล้องและภาพออกอากาศ", "บันทึกแยกทุกขาเข้าและภาพออกอากาศลงดิสก์ USB ที่เชื่อมต่อแล้ว"),
    sel("stream-key", "รหัสสตรีมทดสอบส่วนตัว", ["(none)", "•••••••• (private test key)"], "ข้อมูลรับรองจำลองเท่านั้น แสดงแบบปกปิด"),
    tog("stream", "เริ่มถ่ายทอดผ่าน RTMP", "เริ่มสตรีม RTMP ในตัว"),
  ],
  notes: ["HDMI ขาออกมีเพียงหนึ่งพอร์ต ต้องมีอุปกรณ์เพิ่มจึงจะส่งภาพออกอากาศและจอรวมภาพพร้อมกันได้", "USB-C ใช้เว็บแคมและดิสก์พร้อมกันไม่ได้ ไม่มีตัวแยกซ่อนอยู่"],
};

const HD8_ISO: EquipmentDefinition = {
  modelId: "bmd-atem-tvs-hd8-iso", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM Television Studio HD8 ISO", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemtelevisionstudiohd/techspecs/W-ATC-05",
  verifiedPorts: ["3G-SDI IN 1–8 (HD only)", "SDI OUT (assignable: Program / Multiview / Clean / Camera return)", "HDMI MULTIVIEW OUT", "2 × XLR balanced analog audio IN", "Ethernet (streaming)", "USB-C (recording disk)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `3G-SDI ขาเข้า ${n} รองรับ HD เท่านั้น ไม่รองรับ 2160p`, { formats: HD })),
    ...[1, 2, 3].map((n) => p(`sdi-out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `SDI ขาออก ${n} เลือกภาพออกอากาศ รวมภาพ ภาพสะอาด หรือภาพกลับกล้อง`)),
    p("hdmi-mv", "HDMI MULTIVIEW OUT", "OUTPUT", "HDMI", "HDMI", "HDMI รวมภาพทุกขาเข้า ภาพออกอากาศ และภาพเตรียม ไม่ใช่ภาพรายการเต็มจอ"),
    p("xlr-1", "XLR AUDIO IN 1", "INPUT", "XLR", "LINE_BAL", "XLR ขาเข้าแอนะล็อกสมดุลระดับไลน์ ไมค์ไดนามิกต้องผ่านวงจรขยายก่อน", { channels: 1 }),
    p("xlr-2", "XLR AUDIO IN 2", "INPUT", "XLR", "LINE_BAL", "XLR ขาเข้าแอนะล็อกสมดุลช่อง 2 จับคู่ IN 1 เป็นซ้าย/ขวา", { channels: 1 }),
    p("usb", "USB-C (record)", "OUTPUT", "USB-C", "USB_STORAGE", "USB-C บันทึกลงดิสก์ที่รองรับและเชื่อมต่อแล้ว"),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet สำหรับสตรีม RTMP และควบคุม ต้องมีทางออก WAN ที่ทำงาน"),
  ],
  controls: [power,
    sel("pgm", "เลือกภาพออกอากาศ", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4"], "สลับแหล่งภาพนี้ออกอากาศ"),
    sel("pvw", "ภาพเตรียม (PREVIEW)", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4"], "ดูภาพเตรียมก่อนสลับออกอากาศ"),
    ...[1, 2, 3].map((n) => sel(`sdi-out-${n}`, `หน้าที่ SDI OUT ${n}`, ["OFF", "PROGRAM", "MULTIVIEW", "CLEAN FEED", "CAM RETURN"], "กำหนดหน้าที่ขาออกในซอฟต์แวร์ แต่ละพอร์ตไม่จำเป็นต้องเป็นภาพออกอากาศเหมือนกัน", "OFF")),
    tog("xlr-on", "ส่ง XLR IN 1/2 ออกอากาศ", "Fairlight: เปิดรับไลน์ภายนอกคู่ซ้าย/ขวา"),
    sel("emb-audio", "เสียงฝังจากกล้อง", ["ON", "AFV", "OFF"], "ไมค์กล้องที่เข้าออกอากาศทำให้เสียงผู้บรรยายซ้อน โดยทั่วไปควรปิด", "ON"),
    tog("labels", "ตั้งชื่อช่องขาเข้าแล้ว", "ตั้งชื่อช่องให้ตรงตารางทีมงาน"),
    tog("record", "บันทึกภาพออกอากาศและแยกกล้อง", "บันทึกภาพออกอากาศและแยกขาเข้าแต่ละช่องลงดิสก์ USB"),
    sel("stream-key", "รหัสสตรีมทดสอบส่วนตัว", ["(none)", "•••••••• (private test key)"], "ข้อมูลรับรองจำลองเท่านั้น แสดงแบบปกปิด"),
    tog("stream", "เริ่มถ่ายทอดผ่าน RTMP", "เริ่มสตรีม RTMP ในตัว"),
  ],
  notes: ["ระบบ 3G-SDI รองรับ HD เท่านั้น ส่ง UHD จะขึ้นว่าไม่รองรับ", "จำลองพอร์ตจริง SDI IN 1–4 และ SDI OUT 1–3"],
};

/**
 * AU mission switcher, LOCKED 2026-10-20 for ports and routes (MASTER V2 Gate 1). Exact variant: ATEM Television Studio
 * HD8 ISO (W-APS-21, not the 2TB version). Official techspecs: 8 × 3G-SDI in, SDI Program out 1, SDI Aux out 2,
 * multiview 1 × 3G-SDI + 1 × HDMI, 2 × XLR balanced analog + 2 × RCA, ref BNC in, 2 × USB-C (webcam / recording),
 * 4 × RJ45 switch. Manual (ATEM Television Studio HD8/4K8): aux outputs route any input, program, preview or clean feed;
 * the multiview output toggles to preview. The printed rear-panel wording and the XLR input level are not stated in the
 * sources read, so labels below are descriptive and the XLR level stays "balanced line" (PENDING exact level).
 * The legacy `bmd-atem-tvs-hd8-iso` profile (inactive original OUT room) is kept unchanged for traceability.
 */
const TVS_HD8_ISO: EquipmentDefinition = {
  modelId: "bmd-atem-television-studio-hd8-iso", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM Television Studio HD8 ISO", generic: false, kind: "box", size: [0.48, 0.09, 0.34],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs/W-APS-21",
  verifiedPorts: ["3G-SDI IN 1–8", "SDI PROGRAM OUT", "SDI AUX OUT 1–2", "SDI + HDMI MULTIVIEW OUT", "REF IN (BNC)", "2 × XLR balanced analog IN", "2 × USB-C (webcam / recording)", "Ethernet (4-port switch)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `3G-SDI ขาเข้า ${n} รับ HD 1080p50`, { formats: ["1080p50"] })),
    p("ref-in", "REF IN (BNC)", "INPUT", "SDI", "REF", "ขาเข้าสัญญาณอ้างอิง Tri-Sync / Black Burst ไม่ใช่ขาเข้าภาพ"),
    p("pgm-out", "SDI OUT · PROGRAM", "OUTPUT", "SDI", "SDI", "ขาออกภาพออกอากาศเฉพาะ ส่งภาพ PROGRAM เสมอ"),
    p("aux-1", "SDI OUT · AUX 1", "OUTPUT", "SDI", "SDI", "ขาออก AUX เลือกแหล่งได้: PROGRAM, ภาพสะอาด, PREVIEW หรือขาเข้าใดก็ได้"),
    p("aux-2", "SDI OUT · AUX 2", "OUTPUT", "SDI", "SDI", "ขาออก AUX ช่อง 2 เลือกแหล่งได้เช่นเดียวกับ AUX 1"),
    p("mv-out", "SDI OUT · MULTIVIEW", "OUTPUT", "SDI", "SDI", "ขาออกรวมภาพสำหรับจอผู้ควบคุม สลับเป็น PREVIEW ได้"),
    p("hdmi-mv", "HDMI OUT · MULTIVIEW", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออกรวมภาพ ภาพเดียวกับ SDI MULTIVIEW"),
    p("xlr-l", "XLR AUDIO IN 1 (balanced)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าแอนะล็อกสมดุลช่อง 1 รับบัส Broadcast ระดับไลน์จากคอนโซล", { channels: 1 }),
    p("xlr-r", "XLR AUDIO IN 2 (balanced)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าแอนะล็อกสมดุลช่อง 2", { channels: 1 }),
    p("usb-1", "USB-C 1", "OUTPUT", "USB-C", "USB_UVC", "USB-C ส่งภาพ PROGRAM เป็นเว็บแคม หรือบันทึกลงดิสก์"),
    p("usb-2", "USB-C 2", "OUTPUT", "USB-C", "USB_UVC", "USB-C ช่อง 2 (เว็บแคม / บันทึก)"),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet สำหรับสตรีมและควบคุม"),
  ],
  controls: [power,
    sel("pgm", "เลือกภาพออกอากาศ", ["Black", ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `SDI ${n}`)], "สลับแหล่งภาพนี้ออกอากาศ"),
    sel("pvw", "ภาพเตรียม (PREVIEW)", ["Black", ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `SDI ${n}`)], "ดูภาพเตรียมก่อนสลับออกอากาศ"),
    ...[1, 2].map((n) => sel(`aux-${n}`, `แหล่งภาพ AUX ${n}`, ["SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6", "SDI 7", "SDI 8", "PROGRAM", "CLEAN FEED", "PREVIEW"], "เลือกแหล่งภาพให้ขาออก AUX ที่ปุ่ม AUX ของแผงหรือ ATEM Software Control", "SDI 1")),
    sel("mv-mode", "ปุ่ม MULTIVIEW / PREVIEW", ["MULTIVIEW", "PREVIEW"], "ขาออก Multiview สลับเป็นภาพ PREVIEW ได้", "MULTIVIEW"),
    tog("xlr-on", "ส่ง XLR IN 1/2 ออกอากาศ", "Fairlight: เปิดรับไลน์ภายนอกคู่ซ้าย/ขวาเข้ารายการ"),
    // Default kept OFF as in the profile it replaces; the unit's factory default is not stated in the sources read.
    sel("emb-audio", "เสียงฝังจากกล้อง", ["ON", "AFV", "OFF"], "ไมค์กล้องที่เข้ารายการทำให้เสียงผู้บรรยายซ้อน โดยทั่วไปควรปิด", "OFF"),
  ],
  notes: ["รุ่น HD8 ISO บันทึกแยกทุกขาเข้าได้ (ISO) แต่ในด่านใช้บันทึกผ่านเครื่องบันทึกแยกตามใบงาน", "พอร์ตจริงอื่นที่ยังไม่ใช้ในด่าน: SDI OUT อื่นจากทั้งหมด 12, RCA ขาเข้า 2, MADI, ขาออกแอนะล็อก 1/4 นิ้ว 4, Talkback 5-pin, REF OUT, Timecode", "ป้ายพิมพ์จริงบนแผงหลังยังไม่ได้เทียบกับภาพถ่าย"],
};

const CONSTELLATION: EquipmentDefinition = {
  modelId: "bmd-atem-2me-constellation-hd", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM 2 M/E Constellation HD", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemconstellationhd/techspecs/W-APS-26",
  verifiedPorts: ["20 × 3G-SDI IN (standards converted)", "12 × assignable 3G-SDI OUT", "SDI MULTIVIEW OUT", "2 × balanced 1/4-inch analog audio IN", "USB-C webcam out", "Ethernet (control only)", "No timecode / reference input listed"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2, 3, 4, 5, 6].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `3G-SDI ขาเข้า ${n} พร้อมแปลงมาตรฐาน เฉพาะ HD`, { formats: HD })),
    ...["A", "B", "C"].map((n, i) => p(`sdi-out-${i + 1}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `3G-SDI ขาออก ${n} กำหนดหน้าที่ได้ ใช้สายแยกต่อแต่ละปลายทาง`)),
    p("mv-out", "SDI MULTIVIEW OUT 1", "OUTPUT", "SDI", "SDI", "ขาออก SDI จอรวมภาพ แปลงเป็น HDMI เพื่อเข้าจอควบคุม"),
    p("aud-l", "ANALOG IN L (1/4\")", "INPUT", "6.35mm", "LINE_BAL", "ขาเข้า LINE สมดุล 1/4 นิ้ว ไม่มีวงจรขยายไมค์", { channels: 1 }),
    p("aud-r", "ANALOG IN R (1/4\")", "INPUT", "6.35mm", "LINE_BAL", "ขาเข้า LINE สมดุล 1/4 นิ้ว ไม่มีวงจรขยายไมค์", { channels: 1 }),
    p("usb", "USB-C WEBCAM", "OUTPUT", "USB-C", "USB_UVC", "ส่งภาพออกอากาศแบบเว็บแคม USB เข้าคอมพิวเตอร์ OBS"),
    p("eth", "ETHERNET (control)", "OUTPUT", "ETHERNET", "ETHERNET", "เครือข่ายควบคุมเท่านั้น เครื่องสลับภาพนี้ไม่มีตัวเข้ารหัสสตรีมในตัว"),
  ],
  controls: [power,
    sel("pgm", "ภาพออกอากาศชุด M/E 1", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "สลับแหล่งภาพนี้ออกอากาศ"),
    sel("pvw", "ภาพเตรียมชุด M/E 1", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "ดูภาพเตรียมก่อนสลับออกอากาศ"),
    ...["A", "B", "C"].map((n, i) => sel(`sdi-out-${i + 1}`, `หน้าที่ SDI OUT ${n}`, ["OFF", "PROGRAM", "AUX (clean)", "MULTIVIEW"], "กำหนดหน้าที่ขาออกให้ตรงกับปลายทาง", "OFF")),
    tog("analog-on", "ส่งเสียงแอนะล็อกซ้าย/ขวาออกอากาศ", "Fairlight: เปิดรับไลน์สมดุลคู่"),
    sel("emb-audio", "เสียงฝังจากกล้อง", ["ON", "AFV", "OFF"], "ไมค์กล้องรบกวนเสียงผู้บรรยายในรายการ โดยทั่วไปควรปิด", "ON"),
    tog("labels", "ตั้งชื่อแหล่งสัญญาณแล้ว", "กล้องหลัก / ริมสนาม / ประตู / ปฏิกิริยา / กราฟิก"),
  ],
  notes: ["Ethernet ใช้ควบคุม ต้องมี Streaming Encoder HD แยกเพื่อสตรีม", "ไม่จำลองพอร์ตไทม์โค้ดหรือซิงก์ภายนอก เพราะข้อกำหนดไม่ได้ระบุ ขาเข้าปรับจังหวะใหม่ในระบบ"],
};

const V160HD: EquipmentDefinition = {
  modelId: "roland-v-160hd", manufacturer: "Roland", name: "Roland V-160HD", generic: false, kind: "box", size: [0.62, 0.16, 0.38],
  sourceUrl: "https://proav.roland.com/global/products/v-160HD/",
  verifiedPorts: ["HDMI IN 1–8", "SDI IN 1–8", "HDMI OUT 1–3 (assignable)", "SDI OUT 1–3 (assignable)", "USB STREAM (UVC/UAC)", "LAN CONTROL", "AUDIO IN 1/2 (XLR/TRS combo)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  ports: [
    ...[1, 2].map((n) => p(`hdmi-in-${n}`, `HDMI IN ${n}`, "INPUT", "HDMI", "HDMI", `HDMI ขาเข้า ${n}`, { formats: HD })),
    ...[1, 2].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `SDI ขาเข้า ${n} แบบ HD`, { formats: HD })),
    ...[1, 2, 3].map((n) => p(`hdmi-out-${n}`, `HDMI OUT ${n}`, "OUTPUT", "HDMI", "HDMI", `HDMI ขาออก ${n} เลือกภาพออกอากาศ ภาพเสริม รวมภาพ หรือภาพเตรียม`)),
    p("sdi-out-1", "SDI OUT 1", "OUTPUT", "SDI", "SDI", "SDI ขาออก 1 กำหนดหน้าที่ได้ ใช้ภาพออกอากาศสำหรับบันทึก"),
    p("usb", "USB STREAM", "OUTPUT", "USB-C", "USB_UVC", "ส่งข้อมูลภาพและเสียง USB เข้าคอมพิวเตอร์ OBS ไม่ใช่การเชื่อมต่อเครือข่าย"),
    p("lan", "LAN CONTROL", "OUTPUT", "ETHERNET", "ETHERNET", "LAN CONTROL ใช้ควบคุมระยะไกลเท่านั้น ไม่เข้ารหัสสตรีม"),
    p("ain-1", "AUDIO IN 1 (combo)", "INPUT", "COMBO", "LINE_BAL", "ขาเข้าแอนะล็อกผสม XLR/TRS ตั้ง LINE เมื่อรับ GROUP จากเครื่องผสมเสียง", { channels: 1 }),
    p("ain-2", "AUDIO IN 2 (combo)", "INPUT", "COMBO", "LINE_BAL", "ขาเข้าแอนะล็อกผสม XLR/TRS ช่อง 2", { channels: 1 }),
  ],
  controls: [power,
    sel("pgm", "เลือกภาพออกอากาศ", ["Black", "HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "สลับแหล่งภาพนี้ออกอากาศ"),
    sel("pvw", "ภาพเตรียม (PREVIEW)", ["Black", "HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "ดูภาพเตรียมก่อนสลับออกอากาศ"),
    sel("aux", "แหล่งภาพเสริม AUX", ["HDMI 1", "HDMI 2", "SDI 1", "SDI 2"], "ภาพเสริม AUX แยกอิสระ เช่น ส่งสไลด์ให้จอผู้บรรยาย"),
    ...[1, 2, 3].map((n) => sel(`hdmi-out-${n}`, `หน้าที่ HDMI OUT ${n}`, ["PROGRAM", "AUX", "MULTIVIEW", "PREVIEW"], "กำหนดเส้นทางขาออกของ Roland", n === 1 ? "MULTIVIEW" : n === 2 ? "PROGRAM" : "PREVIEW")),
    sel("sdi-out-1", "หน้าที่ SDI OUT 1", ["PROGRAM", "AUX", "MULTIVIEW", "PREVIEW"], "กำหนดหน้าที่ขาออก", "PREVIEW"),
    sel("ain-mode", "ระดับ AUDIO IN 1/2", ["MIC", "LINE"], "ขาออก GROUP เป็นระดับไลน์", "MIC"),
    tog("ain-on", "ส่ง AUDIO IN 1/2 ออกอากาศ", "รวมเสียงแอนะล็อกคู่เข้าเสียงออกอากาศและสตรีม"),
    sel("emb-audio", "เสียงฝังใน HDMI/SDI", ["ON", "AFV", "OFF"], "เสียงฝังจากโน้ตบุ๊กหรือกล้อง ต้องป้องกันเสียงพูดซ้ำ", "ON"),
    tog("labels", "ตั้งชื่อแหล่งสัญญาณแล้ว", "ตั้งชื่อช่องขาเข้า"),
  ],
  notes: ["LAN CONTROL ไม่ใช้สตรีม เส้นทางสตรีมคือ USB STREAM → OBS → เครือข่ายคอมพิวเตอร์ → จุดรับ", "จำลองพอร์ตจริง HDMI IN 1–2, SDI IN 1–2, HDMI OUT 1–3 และ SDI OUT 1"],
};

const CONV_HS: EquipmentDefinition = {
  modelId: "bmd-micro-converter-hdmi-sdi-3g", manufacturer: "Blackmagic Design", name: "Blackmagic Micro Converter HDMI to SDI 3G", generic: false, kind: "box", size: [0.1, 0.03, 0.08],
  sourceUrl: "https://www.blackmagicdesign.com/products/microconverters/techspecs/W-CONU-18",
  verifiedPorts: ["HDMI IN", "3G-SDI OUT ×2", "USB-C (power/config)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "converter",
  ports: [
    p("hdmi-in", "HDMI IN", "INPUT", "HDMI", "HDMI", "HDMI ขาเข้า ตัวแปลงนี้แปลง HDMI → SDI เท่านั้น", { formats: HD }),
    p("sdi-out", "SDI OUT 1", "OUTPUT", "SDI", "SDI", "3G-SDI ขาออก HD ส่งสัญญาณเมื่อมีไฟเลี้ยงเท่านั้น"),
    // Official techspecs: "2 x SD, HD or 3G-SDI" outputs — both carry the converted picture.
    p("sdi-out-2", "SDI OUT 2", "OUTPUT", "SDI", "SDI", "3G-SDI ขาออกช่องที่ 2 ภาพเดียวกับ SDI OUT 1"),
    p("usb-pwr", "USB-C POWER", "INPUT", "USB-C", "USB_POWER", "USB-C นี้ใช้ไฟเลี้ยงและตั้งค่าเท่านั้น ไม่ส่งภาพ"),
  ],
  controls: [power], notes: ["แปลงได้ทิศทางเดียว ไม่สามารถแปลง SDI กลับเป็น HDMI", "ไม่ปรับขนาดภาพ ไม่ถอด HDCP และไม่แยกหลายปลายทาง"],
};
const CONV_SH: EquipmentDefinition = {
  ...CONV_HS, modelId: "bmd-micro-converter-sdi-hdmi-3g", name: "Blackmagic Micro Converter SDI to HDMI 3G",
  verifiedPorts: ["3G-SDI IN", "SDI LOOP OUT", "HDMI OUT", "USB-C (power/config)"],
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "3G-SDI ขาเข้า ตัวแปลงนี้แปลง SDI → HDMI เท่านั้น", { formats: HD }),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออกไปจอ ส่งสัญญาณเมื่อมีไฟเลี้ยงเท่านั้น"),
    // Official techspecs: one SDI loop output (re-clocked copy of the SDI input).
    p("sdi-loop", "SDI LOOP OUT", "OUTPUT", "SDI", "SDI", "ส่งต่อสัญญาณ SDI ขาเข้าเดิม ไม่ใช่ภาพที่แปลงเป็น HDMI"),
    p("usb-pwr", "USB-C POWER", "INPUT", "USB-C", "USB_POWER", "USB-C นี้ใช้ไฟเลี้ยงและตั้งค่าเท่านั้น ไม่ส่งภาพ"),
  ],
  notes: ["แปลงได้ทิศทางเดียว ไม่สามารถแปลง HDMI เป็น SDI"],
};

const VIDEOHUB: EquipmentDefinition = {
  modelId: "bmd-videohub-10x10-12g", manufacturer: "Blackmagic Design", name: "Blackmagic Videohub 10x10 12G", generic: false, kind: "box", size: [0.48, 0.045, 0.2],
  sourceUrl: "https://www.blackmagicdesign.com/nz/products/blackmagicvideohub/techspecs",
  verifiedPorts: ["SDI IN 1–10", "SDI OUT 1–10 (re-clocked)", "Ethernet control"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "router",
  ports: [
    ...[1, 2, 3, 4].map((n) => p(`in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `เราเตอร์ขาเข้า ${n}`)),
    ...[1, 2, 3, 4].map((n) => p(`out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `เราเตอร์ขาออก ${n} ส่งภาพจากขาเข้าที่เลือกเส้นทางไว้`)),
  ],
  controls: [power, ...[1, 2, 3, 4].map((n) => sel(`xp-${n}`, `เลือกเส้นทาง OUT ${n}`, ["IN 1", "IN 2", "IN 3", "IN 4"], "เลือกขาเข้าที่จะส่งไปขาออกนี้", `IN ${((n + 2) % 4) + 1}`))],
  notes: ["เราเตอร์ปรับจังหวะและสลับเส้นทาง ไม่แปลงอัตราภาพ ไม่เข้ารหัส ไม่บันทึก และไม่แยกสัญญาณได้ไม่จำกัด", "จำลอง IN 1–4 / OUT 1–4 ของระบบ 10×10"],
};

const HYPERDECK: EquipmentDefinition = {
  modelId: "bmd-hyperdeck-studio-hd-plus", manufacturer: "Blackmagic Design", name: "Blackmagic HyperDeck Studio HD Plus", generic: false, kind: "box", size: [0.48, 0.045, 0.2],
  sourceUrl: "https://www.blackmagicdesign.com/ae/products/hyperdeckstudio/techspecs",
  verifiedPorts: ["SDI IN ×1", "SDI OUT A/B + SDI LOOP OUT + 3G MONITOR OUT (rear-panel image)", "HDMI 2.0 IN/OUT", "Ethernet 1Gb", "SD ×2 / USB-C media"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "recorder",
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "SDI ขาเข้าบันทึกหนึ่งพอร์ต บันทึกหนึ่งภาพ ไม่ใช่แยกสี่กล้อง", { formats: HD }),
    p("sdi-out", "SDI OUT A", "OUTPUT", "SDI", "SDI", "ขาออกเล่นคลิปหรือส่งต่อภาพ"),
    // Official rear-panel image (techspecs physical/connections, 2026-10-20): SDI OUT A, SDI OUT B, SDI LOOP OUT,
    // MONITOR OUT (3G), HDMI IN/OUT, ETHERNET — resolves "SDI Video Outputs 2" + "SDI Monitor Outputs 1".
    p("sdi-out-2", "SDI OUT B", "OUTPUT", "SDI", "SDI", "ขาออก SDI B ภาพเดียวกับ SDI OUT A"),
    p("sdi-loop", "SDI LOOP OUT", "OUTPUT", "SDI", "SDI", "ส่งต่อสัญญาณ SDI IN เดิม"),
    p("sdi-mon", "SDI MONITOR OUT", "OUTPUT", "SDI", "SDI", "ขาออกจอตรวจภาพขาเข้า"),
    p("hdmi-in", "HDMI IN", "INPUT", "HDMI", "HDMI", "ขาเข้า HDMI 2.0 ใช้บันทึกเมื่อตั้ง \"ขาเข้าบันทึก\" เป็น HDMI", { formats: HD }),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "ขาออก HDMI 2.0 (ไม่ใช้ในด่าน)"),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet 1Gb สำหรับควบคุมและถ่ายไฟล์ (ไม่ใช้ในด่าน)"),
  ],
  controls: [power,
    // Training policy, not a documented auto-priority: the player picks the record input explicitly.
    sel("rec-input", "ขาเข้าบันทึก", ["SDI", "HDMI"], "เลือกขาเข้าที่จะบันทึก (บันทึกได้ครั้งละหนึ่งแหล่ง)"),
    sel("media", "สื่อบันทึก", ["No media", "SD card mounted (512 GB free)", "SD card mounted · FULL (0 GB)"], "บันทึกต้องเชื่อมต่อสื่อและมีพื้นที่ว่าง"),
    tog("record", "บันทึก", "บันทึก SDI ขาเข้าลงสื่อ"), tog("clip", "โหลดคลิปพร้อมเล่นแล้ว", "โหลดคลิปที่ตรวจสอบแล้วพร้อมเล่น"), tog("play", "เล่นคลิป", "เล่นคลิปที่โหลดออกทาง SDI OUT")],
  notes: ["เป็นเครื่องบันทึก ไม่ใช่ตัวเข้ารหัสหรือระบบเล่นซ้ำทันทีหลายช่อง"],
};

/**
 * OUT encoder, LOCKED 2026-10-20 for ports and routes. Blackmagic Streaming Encoder HD (Web Presenter HD is no longer on
 * the current Blackmagic tech-spec page; this is its listed HD streaming processor). Official techspecs: SDI input 1,
 * SDI loop output 1, SDI monitor output 1 (1.5G–12G, 16 ch embedded audio), HDMI monitor output 1, Ethernet for live
 * streaming, USB-C webcam out, internal 100–240V AC + 4-pin XLR 12V. No analog audio connections.
 */
const STREAM_ENC: EquipmentDefinition = {
  modelId: "bmd-streaming-encoder-hd", manufacturer: "Blackmagic Design", name: "Blackmagic Streaming Encoder HD", generic: false, kind: "box", size: [0.22, 0.045, 0.16],
  sourceUrl: "https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs",
  verifiedPorts: ["SDI IN", "SDI LOOP OUT", "SDI MONITOR OUT", "HDMI MONITOR OUT", "Ethernet (live streaming)", "USB-C (webcam out)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "encoder",
  ports: [
    p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "SDI ขาเข้ารับภาพออกอากาศพร้อมเสียงฝัง 16 ช่อง เพื่อเข้ารหัส", { formats: HD }),
    p("sdi-loop", "SDI LOOP OUT", "OUTPUT", "SDI", "SDI", "SDI ส่งต่อภาพขาเข้าเดิมไปอุปกรณ์อื่น"),
    p("sdi-mon", "SDI MONITOR OUT", "OUTPUT", "SDI", "SDI", "SDI ขาออกจอตรวจภาพ"),
    p("hdmi-mon", "HDMI MONITOR OUT", "OUTPUT", "HDMI", "HDMI", "ขาออกจอตรวจภาพ ไม่ใช่แหล่งภาพกล้อง"),
    p("eth", "ETHERNET (stream)", "OUTPUT", "ETHERNET", "ETHERNET", "ส่งสตรีมผ่าน Ethernet ไปเกตเวย์"),
    p("usb", "USB-C (webcam)", "OUTPUT", "USB-C", "USB_UVC", "USB-C ส่งภาพเป็นเว็บแคม (ไม่ใช้ในด่าน)"),
  ],
  controls: [power, sel("format", "รูปแบบเข้ารหัส", ["1080p50", "1080p60"], "ตั้งให้ตรงระบบ 1080p50"),
    sel("stream-key", "ข้อมูลปลายทางจำลอง", ["ยังไม่กำหนด", "•••• (private test)"], "ข้อมูลรับรองจำลองเท่านั้น แสดงแบบปกปิด"), tog("stream", "เริ่มส่งสตรีม", "เริ่มเข้ารหัสส่งจุดรับสตรีมทดสอบส่วนตัว")],
  notes: ["รับภาพทาง SDI เท่านั้น ไม่มีขาเข้า HDMI และไม่มีขาเข้าเสียงแอนะล็อก เสียงต้องฝังมาใน SDI แล้ว", "Web Presenter HD ไม่อยู่ในหน้าสเปกปัจจุบันของผู้ผลิต จึงใช้ Streaming Encoder HD"],
};

/**
 * OUT audio embedder, LOCKED 2026-10-20 for ports and routes. AJA 3G-AMA (https://www.aja.com/products/3g-ama):
 * 1 × 3G-SDI BNC in / 1 × out, analog audio on ONE 25-pin D-sub (female) on the chassis, with the supplied breakout cable
 * (4 × XLR female in, 4 × XLR male out), +5–20 VDC with supplied 5 W supply, USB for Mini-Config, DIP switches.
 * The XLR inputs therefore belong to the breakout cable, not the small chassis (shown as such in labels and the asset).
 */
const AJA_3G_AMA: EquipmentDefinition = {
  modelId: "aja-3g-ama", manufacturer: "AJA Video Systems", name: "AJA 3G-AMA", generic: false, kind: "box", size: [0.11, 0.03, 0.14],
  sourceUrl: "https://www.aja.com/products/3g-ama",
  verifiedPorts: ["3G-SDI IN (BNC)", "3G-SDI OUT (BNC)", "DB-25 analog audio (breakout: 4 × XLR F in, 4 × XLR M out)", "USB (Mini-Config)", "+5–20 VDC power"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "embedder",
  ports: [
    p("sdi-in", "3G-SDI IN (BNC)", "INPUT", "SDI", "SDI", "SDI ขาเข้ารับภาพออกอากาศจากเครื่องสลับภาพ"),
    p("sdi-out", "3G-SDI OUT (BNC) · ฝังเสียงแล้ว", "OUTPUT", "SDI", "SDI", "SDI ขาออกพร้อมเสียงแอนะล็อกที่ฝังลงคู่ช่องรายการ"),
    p("audio-l", "BREAKOUT XLR IN 1 (DB-25)", "INPUT", "XLR", "LINE_BAL", "XLR ตัวเมียบนสาย breakout ที่ต่อจากขั้ว DB-25 ของตัวเครื่อง ช่องที่ 1", { channels: 1 }),
    p("audio-r", "BREAKOUT XLR IN 2 (DB-25)", "INPUT", "XLR", "LINE_BAL", "XLR ตัวเมียบนสาย breakout ช่องที่ 2", { channels: 1 }),
  ],
  controls: [power, tog("embed", "ฝังเสียงแอนะล็อก CH1/CH2 ลง SDI", "ตั้งค่าการฝังเสียงผ่าน Mini-Config หรือ DIP switch")],
  notes: ["ขั้วเสียงบนตัวเครื่องคือ DB-25 ตัวเดียว XLR อยู่บนสาย breakout ที่แถมมา", "พอร์ตจริงอื่นที่ยังไม่ใช้ในด่าน: breakout XLR IN 3–4, XLR OUT 1–4, USB สำหรับตั้งค่า"],
};

/* ---------------- generic training devices (ports defined by the room specifications) ---------------- */
const generic = (modelId: string, name: string, role: EquipmentDefinition["role"], kind: EquipmentDefinition["kind"], size: [number, number, number], ports: PortDefinition[], controls: ControlDefinition[], notes: string[], needsPower = true, content?: string): EquipmentDefinition =>
  ({ modelId, manufacturer: "Generic Training Device", name, generic: true, kind, size, verifiedPorts: ports.map((x) => `${x.name} — กำหนดตามข้อกำหนดห้อง`), assetLicense: LICENSE_ORIGINAL, needsPower, role, ports, controls, notes, content });

const HDMI_CAM = generic("generic-hdmi-camera", "กล้องฝึก HDMI 1080p50", "source", "camera", [0.32, 1.5, 0.45],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออก 1080p50 ภาพสะอาดพร้อมเสียงไมค์กล้อง", { formats: ["1080p50"] })],
  [power, sel("framing", "การจัดกรอบภาพ", ["Not framed", "Framed for assignment"], "จัดกรอบผู้สอนที่โพเดียม"), tog("clean", "ภาพสะอาดไม่มีข้อความทับ", "ปิดข้อความและข้อมูลทับภาพ", false)],
  ["Generic training device: HDMI OUT only."]);
const LAPTOP = generic("generic-laptop", "โน้ตบุ๊กนำเสนอจำลอง", "source", "laptop", [0.48, 0.03, 0.32],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "ขาออกนำเสนอ 1080p50 ใช้สไลด์ที่มีสิทธิ์และไม่มี HDCP", { formats: ["1080p50"] })],
  [power, tog("present", "โหมดนำเสนอ", "ส่งสไลด์ผ่าน HDMI แทนหน้าเดสก์ท็อป"), tog("mute-audio", "ปิดเสียงโน้ตบุ๊ก", "HDMI มีเสียงโน้ตบุ๊กฝังอยู่ ปิดเสียงเพื่อไม่ให้ซ้ำ")],
  ["อุปกรณ์จำลองเพื่อฝึก"]);
const DOCCAM = generic("generic-doc-camera", "กล้องเอกสาร HDMI จำลอง", "source", "box", [0.3, 0.45, 0.3],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI OUT 1080p50 ตามข้อกำหนดแหล่งภาพฝึก", { formats: ["1080p50"] })],
  [power, sel("framing", "การจัดกรอบหน้าเอกสาร", ["Not framed", "Book page framed, no shadow"], "จัดตำแหน่งให้แสงสม่ำเสมอ")], ["อุปกรณ์จำลองเพื่อฝึก"]);
const GFX_PC = generic("generic-graphics-pc", "คอมพิวเตอร์กราฟิกที่มีสิทธิ์ใช้งานจำลอง", "source", "laptop", [0.48, 0.03, 0.32],
  [p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "คะแนนเต็มจอ 1080p50 ใช้ชิ้นงานที่มีสิทธิ์และแก้ในเครื่อง", { formats: ["1080p50"] })],
  [power, sel("score", "คะแนนการแข่งขัน (แก้เอง)", ["0–0", "1–0", "0–1"], "ผู้ควบคุมแก้เอง ไม่มี API ข้อมูลกีฬาสด"), sel("template", "กราฟิกที่โหลด", ["Test pattern", "Scoreboard template (licensed)", "Holding slate (back shortly)"], "โหลดแม่แบบคะแนนที่มีสิทธิ์ หรือภาพพักรายการระหว่างหยุด")],
  ["Full-frame graphics only: a plain HDMI picture is not a fill/key pair."]);
const display = (id: string, name: string, inputs = 1) => generic(id, name, "display", "box", [0.6, 0.36, 0.08],
  Array.from({ length: inputs }, (_, i) => p(inputs > 1 ? `hdmi-in-${i + 1}` : "hdmi-in", inputs > 1 ? `HDMI IN ${i + 1}` : "HDMI IN", "INPUT", "HDMI", "HDMI", "HDMI ขาเข้า 1080p50", { formats: HD })),
  inputs > 1 ? [power, sel("source", "เลือกขาเข้า", Array.from({ length: inputs }, (_, i) => `HDMI ${i + 1}`), "เลือกขาเข้าที่มีสัญญาณ", "HDMI 2")] : [power],
  ["Generic training display."]);
const PROJECTOR = display("generic-projector", "Generic Training Projector", 2);
const MONITOR = display("generic-hdmi-monitor", "Generic HDMI Training Monitor");
const PA = generic("generic-active-pa", "ลำโพงแอ็กทีฟจำลองเพื่อฝึก", "speaker", "box", [0.34, 0.55, 0.3],
  [p("line-in", "LINE IN (XLR/TRS)", "INPUT", "XLR", "LINE_BAL", "LINE ขาเข้าสมดุล ห้ามรับขาออกระดับลำโพงหรือหูฟัง", { channels: 1 })],
  [power, sel("level", "ระดับเสียง", ["Off", "Nominal", "Hot"], "ค่อยเพิ่มระดับ ลำโพงดังใกล้ไมค์ที่เปิดอาจหอน", "Off"), sel("aim", "ตำแหน่งติดตั้ง", ["In front of the mic, aimed at audience", "Behind/aimed at the podium mic"], "จัดลำโพงให้หลบทิศรับเสียงของไมโครโฟน")],
  ["Active speaker with virtual safe power."]);
const HEADPHONES = generic("generic-headphones", "หูฟังตรวจเสียงจำลอง", "speaker", "box", [0.18, 0.2, 0.08],
  [p("in", "PHONES PLUG (TRS)", "INPUT", "6.35mm", "HEADPHONE", "ขาเข้าหูฟังสำหรับตรวจเสียงในห้องบรรยาย", { channels: 2 })], [], ["เสียงตรวจในห้องบรรยายไม่ใช่เสียงที่ผู้ชมทางไกลได้รับ"], false);
const SSD = generic("generic-recording-ssd", "SSD บันทึกจำลองที่รองรับ exFAT", "storage", "box", [0.1, 0.02, 0.06],
  [p("usb", "USB-C", "INPUT", "USB-C", "USB_STORAGE", "USB ส่งข้อมูลและไฟ ต้องเชื่อมต่อดิสก์ exFAT ที่มีพื้นที่ว่าง")],
  [sel("state", "ดิสก์บันทึก", ["Not mounted", "Mounted · 412 GB free", "Mounted · FULL (0 GB free)"], "ตรวจรูปแบบและการเชื่อมต่อสื่อก่อนเริ่มงาน")], ["อุปกรณ์จำลองเพื่อฝึก"], false);
const ROUTER = generic("generic-gateway", "เราเตอร์และเกตเวย์ GbE จำลอง", "network", "box", [0.25, 0.05, 0.18],
  [p("lan-1", "LAN 1", "INPUT", "ETHERNET", "ETHERNET", "พอร์ต LAN สำหรับอุปกรณ์สตรีม"), p("lan-2", "LAN 2", "INPUT", "ETHERNET", "ETHERNET", "พอร์ต LAN เครือข่ายควบคุม"),
    p("wan", "WAN", "OUTPUT", "ETHERNET", "WAN", "WAN เชื่อมออกอินเทอร์เน็ตหรือจุดรับสตรีมทดสอบ")],
  [power, tog("uplink-test", "ทดสอบความเร็วอัปโหลดแล้ว", "วัดอัปโหลดให้คงที่ก่อนถ่ายทอด"), sel("wan-link", "การเชื่อมต่ออินเทอร์เน็ต WAN", ["Up", "Down (ISP outage)"], "สถานะทางเชื่อมต่ออินเทอร์เน็ตขาออก")], ["ไม่มีระบบ NDI ซ่อนอยู่", "อุปกรณ์จำลองเพื่อฝึก"]);
const INGEST = generic("generic-test-ingest", "จุดรับสตรีมส่วนตัวและผู้ชมทางไกลจำลองในเครื่อง", "ingest", "box", [0.4, 0.9, 0.4],
  [p("wan-in", "UPLINK IN", "INPUT", "ETHERNET", "WAN", "WAN จำลองไปเซิร์ฟเวอร์ทดสอบส่วนตัวและผู้ชมจำลองในเครื่อง ไม่สตรีมสาธารณะ")],
  [sel("upload", "ความเร็วอัปโหลดที่วัดได้", ["25 Mbps stable", "3 Mbps unstable"], "สตรีม H.264 1080p50 ต้องอัปโหลดคงที่ประมาณ 6–9 Mbps พร้อมเผื่อความเร็ว")], ["จำลองในเครื่องอย่างแน่นอน ไม่เข้าสู่บริการภายนอก"], false);
const OBS_HOST = generic("generic-obs-host", "คอมพิวเตอร์ OBS จำลอง", "host", "laptop", [0.48, 0.03, 0.32],
  [p("usb-1", "USB-A 1 (capture)", "INPUT", "USB-A", "USB_UVC", "พอร์ต USB คอมพิวเตอร์รับอุปกรณ์ภาพและเสียง UVC/UAC"), p("usb-2", "USB-A 2 (audio)", "INPUT", "USB-A", "USB_UVC", "พอร์ต USB คอมพิวเตอร์รับอุปกรณ์เสียง USB"),
    p("eth", "ETHERNET", "OUTPUT", "ETHERNET", "ETHERNET", "เครือข่ายสายของคอมพิวเตอร์ สตรีม OBS ออกจากพอร์ตนี้")],
  [power, sel("video-src", "แหล่งภาพ OBS", ["None", "USB video capture device"], "เลือกอุปกรณ์เว็บแคมหรือสตรีม USB ให้ชัดเจน"),
    sel("audio-src", "แหล่งเสียง OBS", ["None", "Built-in laptop mic", "USB capture embedded audio", "USB audio interface (mixer)"], "เลือกแหล่งเสียงรายการเพียงแหล่งเดียว"),
    tog("extra-mic", "เปิดไมค์คอมพิวเตอร์เพิ่มด้วย", "เปิดไมค์เพิ่มอีกทางทำให้เสียงซ้อนหรือสะท้อน", false),
    sel("sync", "เวลาหน่วงเสียงให้ตรงภาพ", ["0 ms", "+80 ms", "+160 ms"], "วัดด้วยการตบมือ แล้วหน่วงเสียงให้ตรงกับภาพ"),
    sel("stream-key", "รหัสสตรีมทดสอบส่วนตัว", ["(none)", "•••••••• (private test key)"], "ข้อมูลรับรองจำลองเท่านั้น แสดงแบบปกปิด"),
    tog("stream", "เริ่มสตรีม", "สตรีมผ่านเครือข่ายคอมพิวเตอร์ไปจุดรับทดสอบส่วนตัว"), tog("record", "เริ่มบันทึกในเครื่อง", "บันทึกทดสอบ OBS ในเครื่อง 60 วินาที")],
  ["OBS is a simulated state; no real software is controlled."]);
const AUDIO_IF = generic("generic-bal-unbal-interface", "ตัวปรับไลน์สเตอริโอสมดุลเป็นไม่สมดุลจำลอง", "interface", "box", [0.12, 0.05, 0.1],
  [p("in-l", "LINE IN L (XLR)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าไลน์สมดุล +4 dBu ซ้าย", { channels: 1 }), p("in-r", "LINE IN R (XLR)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าไลน์สมดุล +4 dBu ขวา", { channels: 1 }),
    p("out", "3.5 mm STEREO OUT (−10 dBV)", "OUTPUT", "3.5mm", "LINE_UNBAL", "ขาออกสเตอริโอลดระดับสำหรับช่อง 3.5 มม. ATEM Mini", { channels: 2 })],
  [sel("atten", "การลดระดับสัญญาณ", ["0 dB (bypass)", "−12 dB (+4 dBu → −10 dBV)"], "ลดไลน์ระดับอาชีพสู่ระดับอุปกรณ์ทั่วไป")], ["อุปกรณ์ฝึกจำลอง ไม่อ้างรุ่นสินค้า ใช้การปรับระดับแบบพาสซีฟและคำนึงถึงกราวด์"], false);
const POWER_AMP = generic("generic-power-amp", "เครื่องขยายเสียงจำลอง (อุปกรณ์ลวง)", "decoy", "box", [0.48, 0.09, 0.35],
  [p("spk-out", "SPEAKER OUT (speakON)", "OUTPUT", "speakON", "SPEAKER", "ระดับขับลำโพง ใช้ลำโพงพาสซีฟเท่านั้น ห้ามต่อเข้าไลน์")], [], ["อุปกรณ์ลวงในชุดฝึก ลำโพงแอ็กทีฟมีแอมป์ในตัวแล้ว"], false);

/* ---------------- classroom (XS) teaching kit — GENERIC TRAINING MODELS per the 25-level wiring guide ---------------- */
const MINI_SWITCHER = generic("generic-mini-switcher", "เครื่องสลับภาพขนาดเล็กสำหรับห้องเรียน (GENERIC TRAINING MODEL)", "switcher", "box", [0.36, 0.06, 0.18],
  [p("hdmi-in-1", "HDMI IN 1", "INPUT", "HDMI", "HDMI", "HDMI ขาเข้า 1 รับภาพ 1080p50", { formats: ["1080p50"] }),
    p("hdmi-in-2", "HDMI IN 2", "INPUT", "HDMI", "HDMI", "HDMI ขาเข้า 2 รับภาพ 1080p50", { formats: ["1080p50"] }),
    p("hdmi-pgm-out", "HDMI PROGRAM OUT", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออกเฉพาะภาพออกอากาศ (PROGRAM) แยกจาก USB WEBCAM"),
    p("audio-in", "AUDIO IN (3.5 mm stereo, LINE)", "INPUT", "3.5mm", "LINE_UNBAL", "ขาเข้าเสียงสเตอริโอระดับไลน์ สำหรับเสียงจากช่อง STREAM/AUX ของมิกเซอร์", { channels: 2 }),
    p("usb", "USB WEBCAM (DEVICE)", "OUTPUT", "USB-C", "USB_UVC", "USB ฝั่ง DEVICE ส่งภาพ PROGRAM และเสียงเป็นเว็บแคมไปยังพอร์ต HOST ของคอมพิวเตอร์")],
  [power, sel("pgm", "PROGRAM (สลับภาพ)", ["Black", "HDMI 1", "HDMI 2"], "เลือกแหล่งภาพออกอากาศที่เครื่องสลับภาพ ไม่ใช่การถอดสาย"),
    tog("ain-on", "เปิด AUDIO IN เข้ารายการ", "ฝังเสียงจาก AUDIO IN ลงในภาพออกอากาศและเว็บแคม"),
    sel("emb-audio", "เสียงที่มากับ HDMI", ["ON", "AFV", "OFF"], "เสียงไมค์กล้องที่มากับ HDMI จะซ้อนกับเสียงจากมิกเซอร์ ควรปิดเมื่อใช้มิกเซอร์", "ON")],
  ["โปรไฟล์พอร์ตกำหนดตามคู่มือการต่อ 25 ด่าน ไม่ใช่สินค้ายี่ห้อใด", "HDMI PROGRAM OUT และ USB WEBCAM ใช้พร้อมกันได้ (ต่างจาก ATEM Mini Pro ที่ HDMI OUT มีช่องเดียว)"]);
const LAV_MIC = generic("generic-lav-mic", "ไมค์หนีบปก Lavalier (GENERIC TRAINING MODEL)", "mic", "mic", [0.04, 0.03, 0.03],
  [p("out", "LAV PLUG (3.5 mm)", "OUTPUT", "3.5mm", "MIC", "สายไมค์ Lavalier ระดับไมค์ ต่อเข้า MIC IN ของตัวส่ง TX", { channels: 1 })],
  [], ["ไมค์หนีบปกระดับไมค์ ต้องต่อเข้าตัวส่ง TX เท่านั้น"], false);
const WIRELESS_TX = generic("generic-wireless-tx", "ตัวส่งไร้สาย Bodypack TX (GENERIC TRAINING MODEL)", "wireless-tx", "bodypack", [0.07, 0.1, 0.03],
  [p("mic-in", "MIC IN (3.5 mm)", "INPUT", "3.5mm", "MIC", "ช่องรับสายไมค์ Lavalier", { channels: 1 })],
  [power, sel("rf", "ช่องความถี่ RF", ["CH 1", "CH 2"], "ตัวส่งและตัวรับต้องอยู่ช่องความถี่เดียวกันและจับคู่กัน")],
  ["ส่งเสียงทางคลื่นวิทยุ ไม่มีสายจาก TX ไป RX — การจับคู่เป็นการตั้งค่า"]);
const WIRELESS_RX = generic("generic-wireless-rx", "ตัวรับไร้สาย RX (GENERIC TRAINING MODEL)", "wireless-rx", "bodypack", [0.18, 0.04, 0.12],
  [p("audio-out", "AUDIO OUT (XLR)", "OUTPUT", "XLR", "MIC", "ขาออกเสียง XLR สมดุล เลือกระดับ MIC หรือ LINE ให้ตรงกับช่องมิกเซอร์", { channels: 1 })],
  [power, sel("rf", "ช่องความถี่ RF", ["CH 2", "CH 1"], "ตั้งให้ตรงกับตัวส่ง TX"), sel("pair", "การจับคู่ TX ↔ RX", ["Not paired", "Paired"], "กดจับคู่ (sync) หลังตั้งช่องความถี่ตรงกัน"),
    sel("out-level", "ระดับขาออก", ["LINE", "MIC"], "ตั้งระดับให้ตรงกับการตั้ง Gain ของช่องมิกเซอร์")],
  ["ตัวรับ 1 ช่องสัญญาณ ต่อกับตัวส่งที่จับคู่ไว้เท่านั้น"]);
const MIXER_4CH = generic("generic-4ch-mixer", "มิกเซอร์ 4 ช่อง (GENERIC TRAINING MODEL)", "mixer", "mixer", [0.32, 0.08, 0.3],
  [...[1, 2, 3, 4].map((n) => p(`in-${n}`, `IN ${n} MIC/LINE (XLR)`, "INPUT", "XLR", "MIC", `ช่องเข้า ${n} มีพรีแอมป์ รับระดับไมค์หรือไลน์`, { channels: 1, panel: "front" })),
    p("main-out", "MAIN / PA OUT (XLR)", "OUTPUT", "XLR", "LINE_BAL", "ขาออกบัสหลักระดับไลน์สมดุล สำหรับลำโพงแอ็กทีฟในห้อง", { channels: 1 }),
    p("aux-out", "STREAM / AUX OUT (TRS stereo)", "OUTPUT", "6.35mm", "LINE_UNBAL", "ขาออกส่งสตรีมแยกจากบัสหลัก ระดับไลน์ −10 dBV สำหรับเครื่องสลับภาพ", { channels: 2 })],
  [power, ...[1, 2, 3].flatMap((n) => [
      sel(`ch${n}-gain`, `CH${n} GAIN`, ["Minimum", "Nominal (peaks −18 dBFS)", "Too hot (clips)"], "ตั้ง Gain ให้เสียงพูดมีพีกต่ำกว่าจุดคลิป"),
      tog(`ch${n}-on`, `CH${n} ON (ไม่ Mute)`, "เปิดช่อง/ยกเลิก Mute"),
      tog(`ch${n}-main`, `CH${n} → MAIN/PA`, "ส่งช่องเข้าบัสหลักไปลำโพงในห้อง"),
      tog(`ch${n}-aux`, `CH${n} → STREAM/AUX`, "ส่งช่องเข้าบัสสตรีมแยก")]),
    sel("main-fader", "เฟดเดอร์ MAIN", ["Down", "Unity"], "ระดับบัสหลัก", "Down"), sel("aux-master", "ระดับ STREAM/AUX", ["Down", "Unity"], "ระดับบัสสตรีม", "Down")],
  ["โปรไฟล์ทั่วไปตามคู่มือ: MAIN/PA และ STREAM/AUX แยกกันจริง", "แผงควบคุมจำลองแสดง CH1–CH3"]);

/* ---------------- studio (S) — mission switcher is a GENERIC profile (HDS7105 revision not verified) ---------------- */
const STUDIO_SWITCHER = generic("generic-studio-switcher", "เครื่องสลับภาพสตูดิโอ (โปรไฟล์ฝึกแบบ HDS7105 · GENERIC TRAINING MODEL)", "switcher", "box", [0.62, 0.16, 0.38],
  [...[1, 2, 3, 4].map((n) => p(`hdmi-in-${n}`, `VIDEO IN ${n} (HDMI)`, "INPUT", "HDMI", "HDMI", `ขาเข้าภาพ ${n} HDMI 1080p50`, { formats: ["1080p50"] })),
    p("hdmi-mv-out", "MULTIVIEW OUT (HDMI)", "OUTPUT", "HDMI", "HDMI", "ขาออกรวมภาพทุกช่องสำหรับดูตรวจ — ไม่ใช่ภาพออกอากาศ"),
    p("hdmi-pgm-out", "PGM OUT (HDMI)", "OUTPUT", "HDMI", "HDMI", "ขาออกภาพออกอากาศ (PROGRAM) แยกจาก MULTIVIEW ใช้พร้อมกันได้"),
    p("audio-in", "AUDIO IN (3.5 mm stereo, LINE)", "INPUT", "3.5mm", "LINE_UNBAL", "ขาเข้าเสียงสเตอริโอระดับไลน์ จากบัส Broadcast ของมิกเซอร์ ฝังเสียงลงใน PGM", { channels: 2 })],
  [power, sel("pgm", "PROGRAM (สลับภาพ)", ["Black", "HDMI 1", "HDMI 2", "HDMI 3", "HDMI 4"], "เลือกภาพออกอากาศ"),
    sel("pvw", "PREVIEW", ["Black", "HDMI 1", "HDMI 2", "HDMI 3", "HDMI 4"], "เลือกภาพถัดไปก่อนตัด"),
    tog("ain-on", "เปิด AUDIO IN เข้ารายการ", "ฝังเสียงจากบัส Broadcast ลงใน PGM"),
    sel("emb-audio", "เสียงที่มากับ HDMI", ["ON", "AFV", "OFF"], "เสียงไมค์กล้องที่มากับ HDMI จะซ้อนกับเสียงมิกเซอร์", "ON")],
  ["ยังไม่ได้ยืนยันพอร์ตจริงของ HDS7105 รุ่นที่ใช้ จึงใช้โปรไฟล์ทั่วไปตามคู่มือ", "MULTIVIEW และ PGM เป็นขาออกแยกกัน ใช้พร้อมกันได้"]);
const MAGEWELL = { modelId: "magewell-usb-capture-hdmi-gen2", manufacturer: "Magewell", name: "Magewell USB Capture HDMI Gen 2", generic: false, kind: "box" as const, size: [0.3072, 0.048, 0.1344] as [number, number, number],
  sourceUrl: "https://www.magewell.com/products/usb-capture-hdmi-gen-2",
  verifiedPorts: ["HDMI IN (1 ช่อง พร้อมเสียงฝัง)", "USB 3.0 ไปยังคอมพิวเตอร์ HOST (หัวต่อฝั่งอุปกรณ์ใช้ตามโมเดลอ้างอิงของโครงการ — หน้าสินค้าไม่ระบุ)"],
  assetLicense: LICENSE_ORIGINAL, needsPower: false, role: "capture" as const,
  ports: [p("hdmi-in", "HDMI IN", "INPUT", "HDMI", "HDMI", "รับภาพ PGM พร้อมเสียงฝังจากเครื่องสลับภาพ", { formats: ["1080p50"] }),
    p("usb", "USB 3.0 (DEVICE → HOST)", "OUTPUT", "USB-A", "USB_UVC", "ส่งภาพและเสียงเข้าพอร์ต USB HOST ของคอมพิวเตอร์")],
  controls: [], notes: ["อุปกรณ์จับภาพเข้าคอมพิวเตอร์ ไม่ใช่เครื่องสลับภาพ", "หน้าสินค้าไม่ระบุแหล่งไฟเลี้ยง จำลองเป็นไฟจาก USB"] } satisfies EquipmentDefinition;
const HS5 = { modelId: "yamaha-hs5", manufacturer: "Yamaha", name: "Yamaha HS5 (ลำโพงมอนิเตอร์แอ็กทีฟ)", generic: false, kind: "box" as const, size: [0.54, 0.9, 0.43] as [number, number, number],
  sourceUrl: "https://usa.yamaha.com/products/proaudio/speakers/hs_series/index.html",
  verifiedPorts: ["INPUT 1: XLR (balanced)", "INPUT 2: TRS phone (balanced)"], assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "speaker" as const,
  ports: [p("xlr-in", "INPUT (XLR, balanced)", "INPUT", "XLR", "LINE_BAL", "รับไลน์สมดุลจากบัสมอนิเตอร์ของมิกเซอร์", { channels: 1 }),
    p("trs-in", "INPUT (TRS phone, balanced)", "INPUT", "6.35mm", "LINE_BAL", "รับไลน์สมดุลทางแจ็ค TRS", { channels: 1 })],
  controls: [power], notes: ["ลำโพงแอ็กทีฟ มีแอมป์ในตัว รับระดับไลน์เท่านั้น"] } satisfies EquipmentDefinition;
const DYN_MIC = generic("generic-dynamic-mic", "ไมค์สายไดนามิก XLR (GENERIC TRAINING MODEL)", "mic", "mic", [0.212, 0.052, 0.052],
  [p("xlr-out", "XLR OUT", "OUTPUT", "XLR", "MIC", "ขาออกไมค์สมดุลระดับไมค์ ต้องเข้าพรีแอมป์", { channels: 1 })], [], ["ไมค์ไดนามิก ไม่ต้องใช้ไฟ Phantom"], false);

/* ---------------- auditorium (M) — generic 1080p50 3G-SDI production kit per the 25-level wiring guide ---------------- */
const SDI_CAM = generic("generic-sdi-camera", "กล้อง SDI 1080p50 (GENERIC TRAINING MODEL)", "source", "camera", [0.32, 1.5, 0.45],
  [p("sdi-out", "SDI OUT (3G)", "OUTPUT", "SDI", "SDI", "ขาออกภาพ 3G-SDI 1080p50 พร้อมเสียงไมค์กล้องฝัง", { formats: ["1080p50"] })],
  [power, sel("framing", "การจัดกรอบภาพ", ["Not framed", "Framed for assignment"], "จัดกรอบตามตำแหน่งที่ได้รับมอบหมาย"), tog("cam-audio", "ฝังเสียงไมค์กล้อง", "เสียงไมค์กล้องที่ฝังใน SDI", false)],
  ["กล้อง SDI ทั่วไปตามคู่มือ: SDI OUT เท่านั้น"]);
const SDI_PTZ = generic("generic-sdi-ptz", "กล้อง PTZ ติดตั้งถาวร ขาออก SDI (GENERIC TRAINING MODEL)", "source", "camera", [0.2, 0.25, 0.2],
  [p("sdi-out", "SDI OUT (3G)", "OUTPUT", "SDI", "SDI", "ขาออกภาพ 3G-SDI 1080p50 จากกล้อง PTZ", { formats: ["1080p50"] })],
  [power, sel("framing", "ตำแหน่ง Preset", ["Not framed", "Framed for assignment"], "เรียก Preset มุมเวที")], ["กล้อง PTZ ติดตั้งถาวร ไม่ต้องย้าย"]);
const SDI_SWITCHER = generic("generic-sdi-switcher", "เครื่องสลับภาพ 3G-SDI (GENERIC TRAINING MODEL)", "switcher", "box", [0.62, 0.16, 0.38],
  [...[1, 2, 3, 4, 5, 6].map((n) => p(`sdi-in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `ขาเข้า 3G-SDI ${n} รับ 1080p50`, { formats: ["1080p50"] })),
    p("ref-in", "REF IN (BNC)", "INPUT", "SDI", "REF", "ขาเข้าสัญญาณอ้างอิงเวลา (Reference/Genlock) ไม่ใช่ขาเข้าภาพ"),
    ...[1, 2, 3].map((n) => p(`sdi-out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `ขาออก SDI ${n} กำหนดหน้าที่ได้: PROGRAM (clean) / AUX`)),
    p("mv-out", "MULTIVIEW SDI OUT", "OUTPUT", "SDI", "SDI", "ขาออกรวมภาพสำหรับจอ FOH เท่านั้น"),
    p("xlr-l", "AUDIO IN L (XLR, LINE)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าเสียงไลน์สมดุลซ้าย จากบัส Broadcast", { channels: 1 }),
    p("xlr-r", "AUDIO IN R (XLR, LINE)", "INPUT", "XLR", "LINE_BAL", "ขาเข้าเสียงไลน์สมดุลขวา จากบัส Broadcast", { channels: 1 })],
  [power, sel("pgm", "PROGRAM (สลับภาพ)", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "เลือกภาพออกอากาศ"),
    sel("pvw", "PREVIEW", ["Black", "SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6"], "เลือกภาพถัดไป"),
    sel("aux", "แหล่งภาพ AUX", ["SDI 1", "SDI 2", "SDI 3", "SDI 4", "SDI 5", "SDI 6", "PROGRAM"], "AUX สำหรับจอเวที", "SDI 1"),
    ...[1, 2, 3].map((n) => sel(`sdi-out-${n}`, `SDI OUT ${n} หน้าที่`, ["OFF", "PROGRAM", "AUX"], "กำหนดหน้าที่ขาออกแต่ละช่อง", "OFF")),
    tog("xlr-on", "เปิด AUDIO IN L/R เข้ารายการ", "ฝังเสียง Broadcast ลงใน PGM"),
    sel("emb-audio", "เสียงที่มากับ SDI", ["ON", "AFV", "OFF"], "เสียงไมค์กล้องที่ฝังมา", "OFF")],
  ["โปรไฟล์ทั่วไป: SDI IN 1–6, SDI OUT 1–3 กำหนดหน้าที่, MULTIVIEW แยก, AUDIO IN L/R XLR", "REF IN เป็นสัญญาณอ้างอิง ไม่รับภาพ"]);
const SDI_MON = generic("generic-sdi-monitor", "จอมอนิเตอร์ SDI ที่ FOH (GENERIC TRAINING MODEL)", "display", "box", [0.6, 0.36, 0.08],
  [p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "ขาเข้า 3G-SDI", { formats: ["1080p50"] })], [power], ["จอที่รับ SDI โดยตรง"]);
const STAGEBOX = generic("generic-analog-stagebox", "Stagebox อนาล็อก ข้างเวที (GENERIC TRAINING MODEL)", "stagebox", "box", [0.5, 0.55, 0.45],
  [...[1, 2, 3, 4].map((n) => p(`mic-in-${n}`, `MIC IN ${n} (XLR)`, "INPUT", "XLR", "MIC", `ช่องรับไมค์ ${n} บนเวที`, { channels: 1 })),
    p("multicore", "MULTICORE OUT", "OUTPUT", "MULTICORE", "MULTICORE", "ปลายสายมัลติคอร์ไปยัง FOH (ช่องตรงกัน 1:1)", { channels: 4 })],
  [], ["อนาล็อกพาสซีฟ ช่อง 1 ที่เวที = ช่อง 1 ที่หางสาย FOH"], false);
const SNAKE_TAIL = generic("generic-snake-tail", "หางสายมัลติคอร์ที่ FOH (GENERIC TRAINING MODEL)", "snake-tail", "box", [0.3, 0.12, 0.2],
  [p("multicore", "MULTICORE IN", "INPUT", "MULTICORE", "MULTICORE", "ปลายสายมัลติคอร์จากเวที", { channels: 4 }),
    ...[1, 2, 3, 4].map((n) => p(`tail-${n}`, `TAIL ${n} (XLR)`, "OUTPUT", "XLR", "MIC", `หางสาย XLR ช่อง ${n} ไปยังมิกเซอร์`, { channels: 1 }))],
  [], ["หางสายแต่ละช่องตรงกับ MIC IN ที่ Stagebox"], false);
const FOH_MIXER = generic("generic-foh-mixer", "มิกเซอร์ FOH (GENERIC TRAINING MODEL)", "mixer", "mixer", [0.6, 0.12, 0.45],
  [...[1, 2, 3, 4].map((n) => p(`in-${n}`, `CH ${n} IN (XLR)`, "INPUT", "XLR", "MIC", `ช่องเข้า ${n} มีพรีแอมป์`, { channels: 1, panel: "front" })),
    p("pa-l", "PA OUT L (XLR)", "OUTPUT", "XLR", "LINE_BAL", "บัสลำโพงห้อง ซ้าย", { channels: 1 }), p("pa-r", "PA OUT R (XLR)", "OUTPUT", "XLR", "LINE_BAL", "บัสลำโพงห้อง ขวา", { channels: 1 }),
    p("bc-l", "BROADCAST OUT L (XLR)", "OUTPUT", "XLR", "LINE_BAL", "บัสถ่ายทอด ซ้าย (แยกจาก PA)", { channels: 1 }), p("bc-r", "BROADCAST OUT R (XLR)", "OUTPUT", "XLR", "LINE_BAL", "บัสถ่ายทอด ขวา (แยกจาก PA)", { channels: 1 })],
  [power, ...[1, 2, 3].flatMap((n) => [
      sel(`ch${n}-gain`, `CH${n} GAIN`, ["Minimum", "Nominal (peaks −18 dBFS)", "Too hot (clips)"], "ตั้งพรีแอมป์ให้พีกต่ำกว่าจุดคลิป"),
      tog(`ch${n}-on`, `CH${n} ON`, "ยกเลิก Mute"), tog(`ch${n}-pa`, `CH${n} → PA`, "ส่งเข้าบัสลำโพงห้อง"), tog(`ch${n}-bc`, `CH${n} → BROADCAST`, "ส่งเข้าบัสถ่ายทอด")]),
    sel("pa-fader", "เฟดเดอร์ PA", ["Down", "Unity"], "ระดับบัส PA", "Down"), sel("bc-fader", "เฟดเดอร์ BROADCAST", ["Down", "Unity"], "ระดับบัสถ่ายทอด", "Down")],
  ["บัส PA และ Broadcast แยกกันจริง", "แผงควบคุมจำลองแสดง CH1–CH3"]);
const SDI_CAPTURE = generic("generic-sdi-usb-capture", "อุปกรณ์จับภาพ SDI → USB (GENERIC TRAINING MODEL)", "capture", "box", [0.15, 0.04, 0.1],
  [p("sdi-in", "SDI IN", "INPUT", "SDI", "SDI", "รับ PGM ทาง 3G-SDI", { formats: ["1080p50"] }),
    p("usb", "USB 3.0 (DEVICE → HOST)", "OUTPUT", "USB-A", "USB_UVC", "ส่งภาพและเสียงเข้า USB HOST ของคอมพิวเตอร์")],
  [], ["อุปกรณ์จับภาพทั่วไป SDI IN + USB DEVICE"], false);

/**
 * XS classroom switcher, LOCKED 2026-10-20 for ports and routes (MASTER V2 Gate 1):
 * official tech specs (4× HDMI type A in, 1 HDMI out, 2× 3.5 mm stereo in, USB-C webcam out, Ethernet, 12V) and the
 * ATEM Mini manual (MIC inputs switchable microphone/line in ATEM Software Control › Audio; the single HDMI output
 * defaults to MULTIVIEW and is switched with the VIDEO OUT buttons). Same panel as the Pro ISO without ISO recording.
 */
const ATEM_MINI_PRO: EquipmentDefinition = {
  ...ATEM_MINI_PRO_ISO, modelId: "bmd-atem-mini-pro", name: "Blackmagic ATEM Mini Pro", size: [0.24, 0.04, 0.12],
  controls: ATEM_MINI_PRO_ISO.controls.map((c) => c.key === "record" ? { ...c, label: "บันทึกภาพออกอากาศลงดิสก์ USB", tip: "ATEM Mini Pro บันทึกเฉพาะภาพออกอากาศ (ไม่มีไฟล์แยกกล้องแบบรุ่น ISO)" } : c),
  notes: [...ATEM_MINI_PRO_ISO.notes, "ค่าเริ่มต้นของ HDMI OUT คือ MULTIVIEW ต้องกด VIDEO OUT เลือกภาพออกอากาศเพื่อส่งขึ้นจอห้องเรียน (คู่มือ ATEM Mini)", "MIC 1/2 ตั้งเป็น Microphone หรือ Line ได้ในแท็บ Audio ของ ATEM Software Control"],
};

/* ---- Verified bindings, 2026-10-20 (docs/09_HARDWARE_PROPOSAL_TABLE_TH.md). Controls copy the generic profile they
 * replace so every mission configuration stays valid; ports follow the official tech specs (unused real ports kept). ---- */
const BMD_STUDIO_CAM = "https://www.blackmagicdesign.com/products/blackmagicstudiocamera/techspecs";
const STUDIO_CAM_PLUS_G2: EquipmentDefinition = {
  ...HDMI_CAM, modelId: "bmd-studio-camera-4k-plus-g2", manufacturer: "Blackmagic Design", name: "Blackmagic Studio Camera 4K Plus G2", generic: false,
  sourceUrl: BMD_STUDIO_CAM, assetLicense: LICENSE_ORIGINAL,
  verifiedPorts: ["HDMI 2.0 OUT ×1", "SDI OUT ×1 (1.5G–12G)", "SDI IN ×1 (program return)", "3.5 mm stereo IN", "USB-C ×2", "12V DC 5.5 mm barrel"],
  ports: [HDMI_CAM.ports[0],
    p("sdi-out", "SDI OUT", "OUTPUT", "SDI", "SDI", "SDI ขาออก (ไม่ใช้ในด่านห้องเรียน)", { formats: ["1080p50"] }),
    p("sdi-ret", "SDI IN (program return)", "INPUT", "SDI", "SDI", "ขาเข้าภาพกลับจากเครื่องสลับภาพ ไม่ใช่ขาออกภาพ"),
    p("mic-35", "3.5 mm STEREO IN", "INPUT", "3.5mm", "LINE_UNBAL", "ขาเข้าเสียง 3.5 มม. (ใช้เป็น timecode ได้)", { channels: 2 })],
  notes: ["สเปกทางการ: HDMI 2.0 out 1, SDI out 1, SDI in 1, 3.5 mm in, USB-C ×2, จอ 7 นิ้ว", "ในด่านใช้ HDMI OUT เหมือนโปรไฟล์ฝึกเดิม"],
};
const STUDIO_CAM_PRO_G2: EquipmentDefinition = {
  ...SDI_CAM, modelId: "bmd-studio-camera-4k-pro-g2", manufacturer: "Blackmagic Design", name: "Blackmagic Studio Camera 4K Pro G2", generic: false,
  sourceUrl: BMD_STUDIO_CAM, assetLicense: LICENSE_ORIGINAL,
  verifiedPorts: ["12G-SDI OUT ×1", "12G-SDI IN ×1 (program return)", "HDMI 2.0 OUT ×1", "XLR ×2 (mic/line)", "3.5 mm IN", "10G Ethernet", "12V barrel + 4-pin XLR"],
  ports: [{ ...SDI_CAM.ports[0], name: "12G-SDI OUT" },
    p("sdi-ret", "12G-SDI IN (program return)", "INPUT", "SDI", "SDI", "ขาเข้าภาพกลับจากเครื่องสลับภาพ ไม่ใช่ขาออกภาพ"),
    p("hdmi-out", "HDMI OUT", "OUTPUT", "HDMI", "HDMI", "HDMI ขาออก (ไม่ใช้ในด่าน)", { formats: ["1080p50"] }),
    p("xlr-1", "XLR IN 1 (mic/line)", "INPUT", "XLR", "MIC", "ขาเข้าเสียง XLR 1", { channels: 1 }),
    p("xlr-2", "XLR IN 2 (mic/line)", "INPUT", "XLR", "MIC", "ขาเข้าเสียง XLR 2", { channels: 1 }),
    p("eth", "ETHERNET 10G", "OUTPUT", "ETHERNET", "ETHERNET", "Ethernet 10G (ไม่ใช้ในด่าน)")],
  notes: ["สเปกทางการ: 12G-SDI out 1, SDI in 1, HDMI 2.0 out 1, XLR ×2, 3.5 mm, Ethernet 10G, จอ 7 นิ้ว", "ในด่านใช้ SDI OUT 1080p50 เหมือนโปรไฟล์ฝึกเดิม"],
};
const SMARTVIEW_DUO: EquipmentDefinition = {
  ...SDI_MON, modelId: "bmd-smartview-duo", manufacturer: "Blackmagic Design", name: "Blackmagic SmartView Duo", generic: false, size: [0.48, 0.13, 0.08],
  sourceUrl: "https://www.blackmagicdesign.com/products/smartview/techspecs", assetLicense: LICENSE_ORIGINAL,
  verifiedPorts: ["SDI IN A (3G) + reclocked loop out", "SDI IN B (3G) + reclocked loop out", "Ethernet", "12V"],
  ports: [{ ...SDI_MON.ports[0], name: "SDI IN (จอ A)" },
    p("sdi-loop", "SDI LOOP OUT (จอ A)", "OUTPUT", "SDI", "SDI", "ส่งต่อภาพจอ A (reclocked loop)"),
    p("sdi-in-b", "SDI IN (จอ B)", "INPUT", "SDI", "SDI", "ขาเข้าจอ B (ไม่ใช้ในด่าน)", { formats: ["1080p50"] }),
    p("sdi-loop-b", "SDI LOOP OUT (จอ B)", "OUTPUT", "SDI", "SDI", "ส่งต่อภาพจอ B")],
  notes: ["สเปกทางการ: จอ 8 นิ้ว 800×480 สองจอแยกอิสระ, SDI 3G พร้อม loop ต่อจอ, Ethernet, 12V, 3RU", "ในด่านใช้จอ A เป็นจอรวมภาพ"],
};
const MAGEWELL_SDI: EquipmentDefinition = {
  ...SDI_CAPTURE, modelId: "magewell-usb-capture-sdi-gen2", manufacturer: "Magewell", name: "Magewell USB Capture SDI Gen 2 (32070)", generic: false, size: [0.092, 0.012, 0.04],
  sourceUrl: "https://www.magewell.com/products/usb-capture-sdi-gen-2", assetLicense: LICENSE_ORIGINAL,
  verifiedPorts: ["SDI IN (SD/HD/3G + embedded audio)", "USB 3.0 (host connection)"],
  notes: ["สเปกทางการ: part 32070, SDI 3G in + เสียงฝัง, USB 3.0, 92.2 × 40.2 × 12.3 มม.", "ตัวเครื่องจริงเป็นขั้ว MCX ใช้สายหาง MCX→BNC ACC00050 (33 ซม.) ที่แถมมา ในเกมจุดเสียบ SDI IN อยู่ที่ปลาย BNC ของสายหาง", "ขั้ว USB ฝั่งตัวเครื่องเป็น USB 3.0 Type-A ตัวเมีย (ภาพทางการด้านปลาย)"],
};
const VIDEOHUB_20: EquipmentDefinition = {
  modelId: "bmd-videohub-20x20-12g", manufacturer: "Blackmagic Design", name: "Blackmagic Videohub 20x20 12G", generic: false, kind: "box", size: [0.48, 0.044, 0.3],
  sourceUrl: "https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs", assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "router",
  verifiedPorts: ["SDI IN 1–20", "SDI OUT 1–20", "Reference (Tri-Sync / Black Burst)", "Ethernet", "USB-C"],
  ports: Array.from({ length: 20 }, (_, i) => i + 1).flatMap((n) => [p(`in-${n}`, `SDI IN ${n}`, "INPUT", "SDI", "SDI", `ขาเข้าเราเตอร์ ${n}`), p(`out-${n}`, `SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `ขาออกเราเตอร์ ${n} เลือกแหล่งด้วย crosspoint`)]),
  controls: [power, ...Array.from({ length: 20 }, (_, i) => i + 1).map((n) => sel(`xp-${n}`, `OUTPUT ${n} รับจาก`, ["OFF", ...Array.from({ length: 20 }, (_, k) => `IN ${k + 1}`)], "เลือก crosspoint ที่ปุ่มหน้าเครื่องหรือซอฟต์แวร์ Videohub", "OFF"))],
  notes: ["สเปกทางการ: 20 SDI in / 20 SDI out, 1RU, จอ 2.2 นิ้ว, ปุ่ม 24 + 3 และ search dial", "เราเตอร์เลือกเส้นทาง (crosspoint) ไม่ใช่เครื่องสลับภาพรายการ", "หน้าสเปกไม่ระบุชนิดหัวต่อ SDI เป็นข้อความ"],
};
const CONSTELLATION_2ME_4K: EquipmentDefinition = {
  modelId: "bmd-atem-2me-constellation-4k", manufacturer: "Blackmagic Design", name: "Blackmagic ATEM 2 M/E Constellation 4K", generic: false, kind: "box", size: [0.48, 0.044, 0.4],
  sourceUrl: "https://www.blackmagicdesign.com/products/atemconstellation/techspecs", assetLicense: LICENSE_ORIGINAL, needsPower: true, role: "switcher",
  verifiedPorts: ["12G-SDI IN 1–20", "12G-SDI OUT 1–12 (assignable aux/preview)", "MULTIVIEW 2 × 12G-SDI", "2 × balanced 1/4 inch analog IN", "5-pin XLR talkback", "Reference", "USB-C (webcam)", "Ethernet"],
  ports: [
    ...Array.from({ length: 20 }, (_, i) => i + 1).map((n) => p(`sdi-in-${n}`, `12G-SDI IN ${n}`, "INPUT", "SDI", "SDI", `ขาเข้า ${n}`, { formats: ["1080p50"] })),
    ...Array.from({ length: 12 }, (_, i) => i + 1).map((n) => p(`sdi-out-${n}`, `12G-SDI OUT ${n}`, "OUTPUT", "SDI", "SDI", `ขาออก ${n} กำหนดหน้าที่ PROGRAM / PREVIEW / AUX`)),
    p("mv-out", "MULTIVIEW 1 (12G-SDI)", "OUTPUT", "SDI", "SDI", "ขาออกรวมภาพ 1"), p("mv-out-2", "MULTIVIEW 2 (12G-SDI)", "OUTPUT", "SDI", "SDI", "ขาออกรวมภาพ 2"),
    p("xlr-l", "ANALOG IN 1 · balanced 1/4\" TRS", "INPUT", "6.35mm", "LINE_BAL", "ขาเข้าแอนะล็อกสมดุล 1/4 นิ้ว ช่อง 1 (ไม่ใช่ XLR)", { channels: 1 }),
    p("xlr-r", "ANALOG IN 2 · balanced 1/4\" TRS", "INPUT", "6.35mm", "LINE_BAL", "ขาเข้าแอนะล็อกสมดุล 1/4 นิ้ว ช่อง 2", { channels: 1 }),
  ],
  controls: [power, sel("pgm", "PROGRAM", ["Black", ...Array.from({ length: 20 }, (_, i) => `SDI ${i + 1}`)], "เลือกภาพออกอากาศ"),
    sel("pvw", "PREVIEW", ["Black", ...Array.from({ length: 20 }, (_, i) => `SDI ${i + 1}`)], "เลือกภาพถัดไป"),
    ...Array.from({ length: 12 }, (_, i) => i + 1).map((n) => sel(`sdi-out-${n}`, `หน้าที่ SDI OUT ${n}`, ["OFF", "PROGRAM", "PREVIEW", "MULTIVIEW", "AUX"], "กำหนดหน้าที่ขาออก", "OFF")),
    sel("aux", "แหล่ง AUX", ["PROGRAM", "SDI 1", "SDI 2"], "แหล่งภาพ AUX"), tog("xlr-on", "นำเสียงแอนะล็อก 1/2 เข้า PROGRAM", "Fairlight: เปิดขาเข้าแอนะล็อก"),
    sel("emb-audio", "เสียงที่มากับภาพ", ["OFF", "AFV", "ON"], "เสียงฝังจากแหล่งภาพ", "OFF")],
  notes: ["สเปกทางการ: 20 × 12G-SDI in, 12 out กำหนดหน้าที่ได้, MV 2, analog balanced 1/4 นิ้ว ×2, 1RU, จอ 2.2 นิ้ว", "ในด่านใช้ 1080p50 ตามระบบฝึก (ไม่เปิดการแปลงมาตรฐานเพื่อคงกฎเดิมของด่าน)"],
};

export const MODELS: Record<string, EquipmentDefinition> = Object.fromEntries([
  STUDIO_CAM_PLUS_G2, STUDIO_CAM_PRO_G2, SMARTVIEW_DUO, MAGEWELL_SDI, VIDEOHUB_20, CONSTELLATION_2ME_4K,
  SM58, AMBIENCE_MIC, MG12XU, STUDIO_CAM, ATEM_MINI_PRO_ISO, ATEM_MINI_PRO, HD8_ISO, TVS_HD8_ISO, CONSTELLATION, V160HD, CONV_HS, CONV_SH, VIDEOHUB, HYPERDECK, STREAM_ENC, AJA_3G_AMA,
  HDMI_CAM, LAPTOP, DOCCAM, MINI_SWITCHER, STUDIO_SWITCHER, SDI_CAM, SDI_PTZ, SDI_SWITCHER, SDI_MON, STAGEBOX, SNAKE_TAIL, FOH_MIXER, SDI_CAPTURE, MAGEWELL, HS5, DYN_MIC, LAV_MIC, WIRELESS_TX, WIRELESS_RX, MIXER_4CH, GFX_PC, PROJECTOR, MONITOR, PA, HEADPHONES, SSD, ROUTER, INGEST, OBS_HOST, AUDIO_IF, POWER_AMP,
].map((m) => [m.modelId, m]));

export function portDef(modelId: string, key: string): PortDefinition | undefined {
  return MODELS[modelId]?.ports.find((x) => x.key === key);
}

for (const model of referenceModels(MODELS)) MODELS[model.modelId] = model;
