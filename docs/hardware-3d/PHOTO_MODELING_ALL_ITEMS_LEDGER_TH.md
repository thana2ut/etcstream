# บัญชีปั้นจากรูปจริง — ทุกรายการในคลัง

อ่าน packsครบ81ชุดและตรวจไฟล์อ้างอิง455เส้นทาง; เก็บSHA-256และpathใน art/qa/photo-modeling/source-model-ledger.json ไม่คัดลอกรูปต้นฉบับเข้าเกม

มี26โปรไฟล์อุปกรณ์ใช้งานที่มีรูป, generic27ไม่มีรูปสินค้า, WM300เก็บแยก1, สาย/adapter26 + logical1 รวม81ชุด การมีrendererไม่ใช่หลักฐานว่าสมจริง100%

| key | รูป/PSDตามmanifest | สถานะหลักฐาน | rendererจริง | สิ่งที่ทำ/ข้อจำกัดรอบนี้ | มุม/ข้อมูลที่ยังขาด |
|---|---:|---|---|---|---|
| aja-3g-ama | 7 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | front;rear;left;right;top;bottom |
| bmd-atem-2me-constellation-4k | 6 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;right;top;bottom |
| bmd-atem-mini-pro | 6 | exact | components/game/equipment/atem-mini-pro.tsx | คงคอนโซลปั้นจากภาพและ key/socket เดิม | front;left;right;bottom |
| bmd-atem-television-studio-hd8-iso | 7 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;right;bottom |
| bmd-camera-fiber-converter | 7 | exact | components/game/equipment/hardware-model.tsx | ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces | rear;top;bottom |
| bmd-hyperdeck-studio-hd-plus | 6 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;right;top;bottom |
| bmd-micro-converter-hdmi-sdi-3g | 6 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | rear;top;bottom |
| bmd-micro-converter-sdi-hdmi-3g | 6 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | rear;top;bottom |
| bmd-smartview-duo | 8 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | top;bottom |
| bmd-streaming-encoder-hd | 6 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;top;bottom |
| bmd-studio-camera-4k-plus-g2 | 9 | exact | components/game/equipment/hardware-model.tsx | ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces | top;bottom |
| bmd-studio-camera-4k-pro-g2 | 9 | exact | components/game/equipment/hardware-model.tsx | ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces | top;bottom |
| bmd-studio-fiber-converter | 7 | exact | components/game/equipment/hardware-model.tsx | ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces | left;right;top;bottom |
| bmd-ursa-broadcast-g2 | 6 | exact | components/game/equipment/hardware-model.tsx | ปรับ silhouette และรายละเอียดจากภาพ + shared surfaces | front;right;top;bottom |
| bmd-videohub-20x20-12g | 8 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;right;top;bottom |
| magewell-usb-capture-hdmi-gen2 | 7 | exact | public/models/equipment/magewell-capture.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | left;right;bottom;dimensions |
| magewell-usb-capture-sdi-gen2 | 8 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | left;right;bottom;dimensions |
| shure-sm58 | 9 | exact | components/game/equipment/hardware-model.tsx | คงส่วนวัดเดิม + ปรับ shared surfaces | front;rear;left;right;top;bottom;ports;owner variant |
| yamaha-hs5 | 4 | exact | public/models/equipment/yamaha-hs5.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | top;bottom;ports;dimensions |
| comica-wm100-plus | 5 | owner-selected | public/models/equipment/comica-wm100-plus-rx.glb; public/models/equipment/comica-wm100-plus-tx.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | dedicated orthographic views and dimensions for each RX/TX component |
| devicewell-hds7105 | 10 | owner-specific | public/models/equipment/hds7105.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | front;rear;left;right;top;bottom;ports;dimensions |
| hp-15-6-reference | 7 | owner-specific | public/models/equipment/hp-laptop.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | front;rear;left;right;top;bottom;ports;dimensions |
| panasonic-hc-x2000 | 12 | owner-specific | public/models/equipment/hc-x2000.glb | ปรับ GLB hood กลวง/เลนส์ลึก/handle audio ตามภาพ; คง port anchor | front;top;bottom |
| pmx-402d-usb | 9 | owner-specific | public/models/equipment/pmx402d.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | manufacturer authenticity; scale; clearer end-on connector views; all sides/top/bottom |
| samsung-u8000f | 36 | owner-selected | public/models/equipment/samsung-u8000f.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | owner unit label; orthographic views; measured port coordinates; stand attachment detail |
| sennheiser-xs1 | 6 | exact | public/models/equipment/sennheiser-xs1.glb | ใช้ GLB เดิมที่ปั้นจากภาพ; ตรวจรูป/โครงสร้างซ้ำ ไม่ได้ปั้นใหม่รอบนี้ | rear; right; top; bottom; connector close-up |
| generic-4ch-mixer | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-active-pa | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-ambience-mic | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-dynamic-mic | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-gateway | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-graphics-pc | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-hdmi-camera | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-hdmi-monitor | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-laptop | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-lav-mic | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-obs-host | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-projector | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-sdi-monitor | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-sdi-ptz | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-studio-switcher | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-test-ingest | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-wireless-rx | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| generic-wireless-tx | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-console-6 | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-fiber-rx | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-fiber-tx | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-handheld-tx | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-replay | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-replay-controller | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-shotgun | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-stagebox-6 | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| reference-tail-6 | 0 | generic | components/game/equipment/generic-device.tsx | มีโมเดลฝึก แต่ไม่มีรูปสินค้าสำหรับถอดแบบ; ไม่รับรอง photo-exact | front;rear;left;right;top;bottom;ports;dimensions |
| ADAPTER-35-635 | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | practice-room adapter, not a CABLE_CATALOG id |
| ADAPTER-635-35 | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | practice-room adapter, not a CABLE_CATALOG id |
| AUD-LAV-TX | 17 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | exact TX compatibility requires owner selection |
| AUD-PA-ACTIVE | 12 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | code allows XLR/TRS line to PA; active PA is GENERIC |
| AUD-RCA-3.5 | 9 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | exact in-game SKU/length generic |
| AUD-RX-MIXER-3.5 | 8 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-RX-MIXER-XLR | 11 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | RX is GENERIC |
| AUD-TRRS-3.5 | 4 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-TRS-3.5 | 10 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-TRS-635-35 | 9 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-TRS-6.35-BAL | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-TS-6.35 | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-XLR-LINE-BAL | 11 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-XLR-MIC | 11 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| AUD-XLR-TRS-BAL | 15 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| CTRL-REPLAY | 0 | logical | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | ลิงก์จำลอง ไม่ใช่สายกายภาพ |  |
| DATA-USB-A-A | 4 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | host-to-host usage validity not enforced |
| DATA-USB-MAGEWELL | 3 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | 1 active raster image; two connector-shape refs are separate shared references. The OnePlus mismatch and duplicate files are quarantined; official Magewell image is 256×138. |
| DATA-USB-WEBCAM | 9 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | Connector family can be referenced from the local full-cable/ends photos. Exact cable SKU is not bound in game. |
| FIB-CAMERA-CCU | 8 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | exact game SKU not bound; none required by generic cable definition |
| FIB-SDI-LINK | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | exact family/mode/simplex-duplex/polarity awaits owner selection |
| NET-CAT5E6-ENCODER | 7 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| NET-ROUTER-UPLINK | 6 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| STG-MULTICORE | 9 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | channel count (6) per GENERIC reference-stagebox-6 |
| VID-HDMI-A-A | 7 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| VID-SDI-3G | 8 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU |  |
| VID-SDI-6G-12G | 8 | shape-reference | components/game/cable-plugs.tsx + components/ui/cable-model.tsx | รูปทรงหัวต่อร่วมตาม pack; ไม่ยืนยัน SKU | 12G rating cannot be seen in a photo; Neutrik drawing is true-75 ohm HD-BNC family |
| comica-wm300-owner-claim | 1 | archive-only | ARCHIVE_ONLY | กันออกจากเกม ไม่ใช้ WM300 แทน WM100 | exact legacy WM300 variant; receiver/transmitter labels; individual views |

## เกณฑ์การส่งต่อ

รายการgeneric27ยังปั้นจากภาพเฉพาะรุ่นไม่ได้เพราะpackไม่มีภาพ ห้ามแต่งแบรนด์/รุ่นหรือยกโมเดลคร่าวๆเป็นexact; pendingคงตามowner evidence; WM300ไม่ใช้ในเกม; CTRL-REPLAYไม่มีสายจริง ส่วนมุมที่ภาพไม่ครบและขนาดที่ไม่มีdrawingยังประมาณ ไม่รับรองhigh-fidelity100%
