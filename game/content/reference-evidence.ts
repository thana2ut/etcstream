import records from "./local-reference-evidence.json";
import type { DeviceDef } from "../training/scenarios";
import {selectedGameProduct} from './selected-product-info';

interface ReferenceRecord { identity: string; exactness: string; readiness: string; evidenceClass: string; missing: string; notes: string; pack: string }
const REFERENCES: Record<string, ReferenceRecord> = records;
const LIMITS: Record<string, string> = {
  "samsung-u8000f": "เกมใช้ Samsung 85 นิ้ว UA85U8000FKXXT ตามที่เจ้าของเลือก; เครื่องจริงของเจ้าของยังไม่ยืนยัน ตำแหน่ง HDMI เป็นจุดบริการโดยประมาณและฐานเป็นขาตั้งของห้องฝึก",
  "comica-wm100-plus": "เกมใช้ WM100 PLUS ชุด 2 TX + 1 RX; สัดส่วน RX/TX ประมาณจากภาพผู้ผลิต ไม่มีภาพมิติครบทุกด้าน เครื่องเจ้าของยังไม่ยืนยัน ไม่ใช้ภาพ WM300",
  "pmx-402d-usb": "ใช้ข้อความ PMX-402D-USB และรูปทรงตามภาพเจ้าของ ผู้ผลิตและขนาดจริงยังไม่ยืนยัน จึงไม่รับรองว่าเป็น Yamaha",
  "devicewell-hds7105": "อ้างอิงภาพเจ้าของและป้าย HDS7105; ผู้ผลิต รหัสรุ่นและมิติโรงงานยังต้องมีหลักฐานเพิ่มเติม",
  "hp-15-6-reference": "อ้างอิงรูปทรงโน้ตบุ๊ก 15.6 นิ้วจากภาพเจ้าของ ยังไม่ทราบ product number หรือ SKU",
  "panasonic-hc-x2000": "ใช้ภาพและคู่มือของรุ่น HC-X2000 เป็นรุ่นอ้างอิง; ยังไม่เห็นฉลากที่ยืนยันเครื่องจริงของเจ้าของ",
  "aja-3g-ama": "ขนาดและสาย breakout DB-25 → XLR มีหลักฐาน; ตำแหน่งขั้วบนด้านปลายประมาณจากคู่มือ สายหางพับเก็บเพื่อการฝึก",
  "magewell-usb-capture-hdmi-gen2": "รูปทรงและชนิดช่อง HDMI / USB-A อ้างอิงภาพผู้ผลิต; มิติและรายละเอียดบางมุมยังเป็นค่าประมาณ",
  "magewell-usb-capture-sdi-gen2": "ตัวเครื่องใช้ MCX; BNC อยู่บนสายหาง ACC00050 ที่ติดมากับเครื่อง เพศปลาย BNC และความโค้งของสายที่จัดวางยังประมาณ",
  "shure-sm58": "ยืนยันขนาดรวม 162 × 51 มม.; รูปโค้งและลายตะแกรงประมาณจากภาพ รุ่นย่อย LC/S ยังไม่ยืนยัน จึงไม่เพิ่มสวิตช์",
  "sennheiser-xs1": "ยืนยันตระกูล XS 1; ยังขาดภาพใต้เครื่องและขั้วต่อระยะใกล้ รายละเอียดขั้วและผิวตะแกรงบางส่วนประมาณ",
  "FIB-SDI-LINK": "หัว optical เป็นแบบทั่วไป ยังไม่เลือก LC/SC, single/multimode, simplex/duplex หรือ polarity",
  "FIB-CAMERA-CCU": "อ้างอิงรูปทรง SMPTE 304/311 จากภาพปลายสายและ datasheet; ไม่ผูก SKU หรือกำหนดเพศหัวตามอุปกรณ์จริงแทนเจ้าของ",
  "STG-MULTICORE": "แผง stagebox และหาง XLR มีภาพอ้างอิง; หัวรวม multipin ยังคงเป็นแบบทั่วไป ไม่ระบุจำนวนขาหรือยี่ห้อ",
  "CTRL-REPLAY": "ลิงก์ควบคุมจำลอง ไม่มีสายหรือหัวต่อกายภาพ; วงแหวนสีม่วงเป็นจุดจับในแบบฝึก",
  "DATA-USB-A-A": "มีภาพรูปทรง A-male ↔ A-male; ไม่รับรองการต่อคอมพิวเตอร์ host-to-host",
  "DATA-USB-MAGEWELL": "ใช้คู่สายสำหรับอุปกรณ์ Magewell ที่มี USB-A ตัวเมีย; ไม่ใช้เป็นข้อแนะนำต่อ host-to-host",
  "AUD-LAV-TX": "ภาพรองรับตัวอย่างไมค์หนีบปกและหัวล็อก 3.5 มม.; หัวล็อกใช้กับ WM100 PLUS ในห้องฝึก ส่วน TX ทั่วไปยังไม่ผูกรุ่น",
};
const VIEWS: Record<string, string> = { front: "หน้า", rear: "หลัง", left: "ซ้าย", right: "ขวา", top: "บน", bottom: "ล่าง", ports: "ขั้วต่อ", dimensions: "มิติ" };
export function referenceEvidence(key?: string, generic = false) {
  const record = key ? REFERENCES[key] : undefined;
  const selected=selectedGameProduct(key);
  const evidenceClass = record?.evidenceClass ?? (generic ? "generic" : "owner-specific");
  const classLabel = ({ exact: "ยืนยันรุ่นจากหลักฐานผู้ผลิต", "owner-selected": "รุ่นเป้าหมายที่เจ้าของเลือก", "owner-specific": "อ้างอิงเฉพาะเจ้าของ / รอยืนยันรุ่น", generic: "อุปกรณ์ทั่วไปสำหรับฝึก", "shape-reference": "อ้างอิงรูปทรงหัวต่อทั่วไป", logical: "ลิงก์ควบคุมจำลอง", "archive-only": "หลักฐานเก็บแยก ไม่ใช้เป็นรุ่นในเกม" } as Record<string, string>)[evidenceClass] ?? "ข้อมูลอ้างอิงยังไม่ครบ";
  const readiness = record?.readiness ?? "PARTIAL_REFERENCE";
  const readinessLabel = evidenceClass === "generic" ? "รูปทรงฝึก ไม่อ้างรุ่นสินค้า"
    : evidenceClass === "logical" ? "ไม่มีโมเดลสายกายภาพ"
      : readiness.startsWith("READY_FOR") ? "มีหลักฐานสำหรับปรับรายละเอียด; บางมุมยังประมาณ"
        : readiness === "COMPLETE_SHAPE_REFERENCE" ? "ภาพรูปทรงครบ; ไม่ได้ยืนยัน SKU หรือความเข้ากันได้จริง" : "หลักฐานบางส่วน / ยังมีรายละเอียดรอยืนยัน";
  const missingViews = (record?.missing ?? "").split(";").filter((v) => VIEWS[v]).map((v) => VIEWS[v]);
  const note = key && LIMITS[key] ? LIMITS[key] : evidenceClass === "generic" ? "รูปทรงและพอร์ตอ้างอิงโปรไฟล์ฝึก ไม่มีแบรนด์หรือรุ่นสินค้าที่ได้รับการยืนยัน"
    : evidenceClass === "shape-reference" ? "ขนาดบูต ปลอก และความโค้งสายเป็นตัวอย่างทั่วไป ตรวจชนิดหัวและหน้าที่พอร์ตให้ตรงก่อนต่อ"
      : missingViews.length ? `มุมที่ยังไม่มีภาพครบ: ${missingViews.join(" / ")} รายละเอียดที่ไม่เห็นใช้รูปทรงประมาณ` : "รายละเอียดที่ไม่มีภาพยืนยันคงเป็นค่าประมาณ ไม่รับรองเครื่องจริงของเจ้าของ";
  return { key, evidenceClass, classLabel:selected?'โปรไฟล์ฝึก · เลือกสินค้าอ้างอิงภาพแล้ว':classLabel, readiness, readinessLabel:selected?'กำลังตรวจความเหมือนจริง; ไม่ใช่การยืนยันเครื่องของเจ้าของ':readinessLabel,
    note:selected?`${selected.name}: ${selected.compatibility} รายละเอียดที่ไม่มีหลักฐานยังประมาณ ไม่รับรองว่าแผงควบคุมฝึกเท่ากับเฟิร์มแวร์สินค้าจริง`:note,
    pack:record?.pack, identity:selected?.name??record?.identity };
}

export function referenceKeyForDevice(device?: Pick<DeviceDef, "modelId" | "model" | "generic">, id?: string) {
  if (device?.modelId) return device.modelId;
  if (device?.generic) return undefined;
  const name = device?.model ?? "";
  return /WM100 PLUS/.test(name) ? "comica-wm100-plus" : /PMX-402D/.test(name) ? "pmx-402d-usb" : /Panasonic/.test(name) ? "panasonic-hc-x2000"
    : /Magewell/.test(name) ? "magewell-usb-capture-hdmi-gen2" : /Sennheiser/.test(name) ? "sennheiser-xs1"
      : /HP 15/.test(name) ? "hp-15-6-reference" : /Yamaha HS5/.test(name) ? "yamaha-hs5" : /Samsung/.test(name) || !device && id === "monitor" ? "samsung-u8000f"
        : /HDS7105/.test(name) || !device && id === "switcher" ? "devicewell-hds7105" : undefined;
}
