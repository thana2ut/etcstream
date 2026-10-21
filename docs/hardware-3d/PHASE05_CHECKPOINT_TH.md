# Phase 05 · Checkpoint (อัปเดตรอบที่ 3: สต็อกรวมของสถานที่บนโต๊ะเตรียม)

> อัปเดต 21 ต.ค. 2026: งานต่อเนื่องล่าสุดอยู่ที่ [PHASE07_CHECKPOINT_TH.md](PHASE07_CHECKPOINT_TH.md) รายงานด้านล่างเก็บเป็นประวัติ Phase05 ไม่ใช่ผลทดสอบล่าสุด

## สถานะ
- โมเดลอุปกรณ์ที่ยืนยันรุ่นแล้ว: 17/17
- หัวสายครบทุกชนิด และอะแดปเตอร์ 2 กลุ่ม
- ทั้ง 25 ด่านมีอุปกรณ์รวมของสถานที่ครบ (union ของ 5 ระดับ)
  - ระบุด้วย `venueStock()` และธง `stockOnly`
  - เครื่องที่ยกได้วางบนโต๊ะเตรียม
  - เครื่องใหญ่อยู่ที่สถานีติดตั้งประจำ
- `npm test` 212/212 · tsc, lint, build ผ่าน · git diff --check ไม่มี error

## รายละเอียดของงานรอบนี้
- `docs/hardware-3d/PHASE05_ALL_25_VENUE_EQUIPMENT_TABLE_INTEGRATION_TH.md`
- `docs/hardware-3d/PHASE05_ALL_25_TABLE_INTERACTION_AND_REGRESSION_TH.md`

## งานถัดไป
- เจ้าของทดสอบด้วยตนเองครั้งเดียวตาม `docs/hardware-3d/PHASE05_OWNER_ONE_FINAL_MANUAL_PLAYTEST_TH.md`
- ถ้าพบปัญหาภาพ ให้แก้ตามที่รายงาน
- ถ้าเฟรมเรต SP บน iPhone ต่ำ ให้เพิ่ม LOD หรือซ่อน label ของเครื่อง `stockOnly` ที่อยู่ไกล

## ยังไม่ทราบ
| รายการ | สิ่งที่ยังขาด |
|---|---|
| FIB-SDI-LINK | LC หรือ SC |
| SMPTE | เพศของหัวในสาย |
| STG-MULTICORE | ภาพหัว multicore |
| ACC00050 | เพศของปลาย BNC |
| AJA 3G-AMA | ภาพด้านปลายตัวเครื่อง |
| SM58 | รุ่นย่อย |
| SP | เฟรมเรตบน iPhone |

ไม่ได้ commit หรือ push
