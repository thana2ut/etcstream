# Phase 05 · บัญชีอุปกรณ์ 3D และการผูกกับคลังภาพอ้างอิง

คลังภาพ: `C:\Users\asus\Downloads\อุปกรณ์` (ใช้อ่านอย่างเดียว ไม่ได้แก้ ย้าย หรือคัดลอกเข้าโปรเจกต์)

## A. โมเดลตามหลักฐานผู้ผลิต: 17 รุ่น (`MODEL_GEOMETRY`)
| key | สถานะ | แพ็กอ้างอิง | ด่าน |
|---|---|---|---|
| 14 รุ่นของ Blackmagic Design (ATEM Mini Pro, TVS HD8 ISO, 2M/E Constellation 4K, Videohub 20x20 12G, Streaming Encoder HD, HyperDeck Studio HD Plus, Micro Converter ×2, SmartView Duo, Studio Camera 4K Plus/Pro G2, URSA Broadcast G2, Camera/Studio Fiber Converter) | ทำไว้ใน Phase 04 · รอบนี้ตรวจซ้ำแล้ว ไม่ได้แก้ | `01_VERIFIED_EQUIPMENT/bmd-*` | ดูตาราง 25 ด่าน |
| `aja-3g-ama` | **ใหม่** · IMPLEMENTED_EVIDENCE_SUPPORTED | `01_VERIFIED_EQUIPMENT/aja-3g-ama` (ภาพพอร์ต official__01, คู่มือ p.4/5/7/21) | l-4, l-5 |
| `magewell-usb-capture-sdi-gen2` | **ใหม่** · IMPLEMENTED_EVIDENCE_SUPPORTED | `01_VERIFIED_EQUIPMENT/magewell-usb-capture-sdi-gen2` (3q official 03, tech-spec PDF) + `00_INDEX/MAGEWELL_SDI_GEN2_CONNECTOR_CORRECTION_PROPOSAL_TH.md` (ทางเลือก A) | m-5 |
| `shure-sm58` | **ใหม่** · IMPLEMENTED_EVIDENCE_SUPPORTED | `01_VERIFIED_EQUIPMENT/shure-sm58` (dimension drawing p.4, spec sheet) | xl-2, xl-4, xl-5 |

## B. โมเดล GLB เดิม (ภาพจากเจ้าของหรือผู้ผลิต): ไม่ได้แก้ในรอบนี้
| รุ่น | สถานะ |
|---|---|
| yamaha-hs5 | ผู้ผลิต |
| magewell-usb-capture-hdmi-gen2 | ผู้ผลิต |
| comica-wm100-plus | เป้าหมายในเกม |
| sennheiser-xs1 | — |
| samsung-u8000f 85" UA85U8000FKXXT | เป้าหมายในเกม |
| pmx-402d-usb | ภาพของเจ้าของเท่านั้น |
| panasonic-hc-x2000 | รอยืนยัน |
| devicewell-hds7105 | รอยืนยัน |
| hp-15-6 | generic |

ส่วนใหญ่ใช้ใน Free Practice

## C. GENERIC / reference profile: 27 รายการ
- ใช้ใน `05_GENERIC_UNRESOLVED/*`
- renderer คือ `generic-device.tsx` และติดป้าย "อุปกรณ์จำลองเพื่อฝึก"
- ตั้งใจไม่ยกระดับให้เป็นรุ่นจริง เพราะไม่มีรุ่นจริงให้ผูก

## D. รายการที่ยังรอหลักฐาน
| รายการ | สิ่งที่ยังขาด |
|---|---|
| AJA 3G-AMA | ภาพด้านปลายแบบตั้งฉาก |
| SM58 | subvariant (LC/S) |
| Magewell SDI | เพศของปลาย BNC บนสาย ACC00050 |
| FIB-SDI-LINK | ชนิดหัว LC/SC |
| HC-X2000 / HDS7105 / HP | ตัวตนของรุ่น |
