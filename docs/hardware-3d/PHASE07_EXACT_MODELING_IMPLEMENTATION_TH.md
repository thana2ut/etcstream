# Phase 07 — การปรับโมเดลที่ยืนยันรุ่น

วันที่ 21 ตุลาคม 2026 · ต่อจาก Phase 05 ไม่เริ่มระบบใหม่

## ความหมายของผลสำเร็จ

ข้อมูลอ้างอิงมีโปรไฟล์ใช้งาน 53 รายการ: ยืนยันตัวตนรุ่น 20, รุ่นเป้าหมายที่เจ้าของเลือก 2, owner-specific/รอยืนยัน 4 และ generic 27 รายการ การยืนยันชื่อรุ่นไม่เท่ากับมีภาพครบทุกมุมหรือโมเดลถอดแบบโรงงาน 100% ดูข้อจำกัดรายรุ่นใน inspect และ audit

ใช้ทักษะ create-game-assets เพื่อคงที่มาหลักฐาน แยก exact/partial/generic และตรวจไฟล์ native/GLB; ใช้ react-best-practices ให้ geometry ใช้ร่วมกัน ลดกลุ่มวัสดุและแสดงรายละเอียดเล็กเฉพาะระยะใกล้ ไม่เพิ่ม dependency

## รุ่นที่ตรวจและปรับ

| รุ่น / equipment key | งานรอบนี้ | สิ่งที่ไม่อ้างว่าแม่นยำทั้งหมด |
|---|---|---|
| bmd-atem-mini-pro | เปลี่ยน socket เป็นรูปทรงช่องเสียบชุดกลาง; รักษาปุ่มและภาพสัญญาณ | รอยต่อ/ตัวหนังสือจิ๋วและผิวภายใน |
| bmd-atem-2me-constellation-4k | พอร์ตแยกชนิด วัสดุโลหะ ช่องระบายอากาศ/หูแร็ค | vent เป็นรายละเอียดผิว ไม่เจาะ chassis ทุกช่อง |
| bmd-atem-television-studio-hd8-iso | คงหน้าคอนโซล/ปุ่ม/จอ; ปรับ socket และวัสดุ | ผิวซ่อนและชิ้นส่วนภายใน |
| bmd-videohub-20x20-12g | พอร์ต BNC/USB/network; vent และหูยึด | รายละเอียดงานประกอบขนาดเล็ก |
| bmd-hyperdeck-studio-hd-plus | พอร์ตแยก input/loop/monitor; vent/วัสดุ | ไม่เพิ่ม ISO หรือพอร์ตที่ไม่มีใน registry |
| bmd-streaming-encoder-hd | vent/หูแร็คและ connector profile | ผิวซ่อนและ micro-label |
| bmd-smartview-duo | คงจอสองฝั่งและภาพจริง; socket/วัสดุ | ไม่จำลองภายใน |
| bmd-micro-converter-hdmi-sdi-3g | screw wells/วัสดุ/HDMI-BNC-USB-C | ทิศแปลงเดิม ไม่สลับรุ่น |
| bmd-micro-converter-sdi-hdmi-3g | screw wells/วัสดุ/พอร์ตตามทิศจริง | เช่นเดียวกัน |
| bmd-studio-camera-4k-plus-g2 | คงจอ/มือจับ/พอร์ตเฉพาะ Plus; จุดยึดและ tripod | เลนส์และจุดยึดบางส่วนเป็นรูปทรงฝึก |
| bmd-studio-camera-4k-pro-g2 | คงพอร์ตเฉพาะ Pro; จุดยึด tripod/socket | ไม่ใช้พอร์ตของ Plus แทน |
| bmd-ursa-broadcast-g2 | plate screws/connector/material/support | อุปกรณ์เสริมเลนส์ไม่ผูก SKU |
| bmd-camera-fiber-converter | connector/socket บน mount เดิมของกล้อง | ด้านซ่อน/จุดยึดโดยประมาณ |
| bmd-studio-fiber-converter | vent/วัสดุ/ช่องต่อ hybrid และขั้วอื่น | ไม่ยืนยันเพศสาย SMPTE ของ owner |
| aja-3g-ama | DB25 → 8 หางโค้ง XLR ทรงกระบอก แยกขาตัวผู้/รูตัวเมีย | ทิศโค้งหางจัดเก็บและตำแหน่งบางขั้วประมาณจากคู่มือ |
| magewell-usb-capture-sdi-gen2 | MCX บนตัวเครื่อง + หาง ACC00050/BNC; ไม่วาง BNC แทน MCX | เพศปลาย BNC ยังรอยืนยัน |
| shure-sm58 | lathe profile หัวตะแกรง/ด้าม วงรัด ผิว grille และ XLR | ไม่มีสวิตช์ที่เดารุ่น LC/S; ผิวตะแกรงไม่ใช่ทุกเส้นลวด |
| magewell-usb-capture-hdmi-gen2 | regenerate GLB ช่อง HDMI หน้าตัด trapezoid ฝั่งตรงข้าม USB-A | มิติ/มุมที่หลักฐานไม่ครบยังประมาณ |
| yamaha-hs5 | regenerate GLB รู XLR ตัวเมียและขั้ว IEC ตัวผู้ | ผิวภายใน/ชิ้นส่วนซ่อน |
| sennheiser-xs1 | เอาสัญลักษณ์ S ที่แต่งขึ้นออก คง wordmark ที่มีหลักฐาน | ใต้เครื่องและขั้วระยะใกล้ยังไม่ครบ |

## วัสดุและประสิทธิภาพ

แยกโลหะ พลาสติก ยาง ตะแกรงและหน้าจอ ใช้ socket geometry cache สูงสุด 5 กลุ่มสีต่อชนิด; vent ใช้ instancing (อินสแตนซิง: วาดชิ้นซ้ำร่วมกัน) เฉพาะระยะใกล้ รักษา control, feed และ hit target เดิม ขาตั้งเพิ่มท่อยืด ปลอกล็อก ค้ำและเท้ายางแบบทั่วไป ไม่อ้างยี่ห้อ

03_ACCESSORIES_AND_MOUNTS ไม่มีไฟล์อ้างอิงแยก จึงใช้สิ่งที่มองเห็นใน pack อุปกรณ์และทำ support แบบ simplified ไม่สร้างอัตลักษณ์สินค้าใหม่

## การตรวจ

อ่าน packs/manifests 81 ชุดและตรวจ path รูป/เอกสารที่อ้างถึง เปิดภาพรวม/รายละเอียดของ exact ทั้ง 20 รุ่นและ pending ที่ใช้จริง สร้าง runtime geometry review 44 แบบ + GLB 10 ไฟล์ = 54 ภาพ ตรวจรวม 6 contact sheets พบและแก้แกนปลอก USB-C ภาพนี้เป็นการตรวจรูปทรงนอกเกม ไม่แทนภาพ shader/label/feed ใน browser และไม่ใช่การวัด FPS

ไฟล์หลัก: game/training/sim/hardware-geometry.ts, model-geometry.ts, game/rendering/socket-geometry.ts, components/game/equipment/hardware-model.tsx, atem-mini-pro.tsx; native builders ใน art/blender/build_*.py และ GLB ที่เกี่ยวข้องใน public/models/equipment
