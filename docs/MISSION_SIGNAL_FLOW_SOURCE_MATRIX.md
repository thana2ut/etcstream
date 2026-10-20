# Mission signal-flow source matrix

Reconciled against the original Appendix A and 2026-10-20 handoff in `docs/references/`. References establish example capabilities/educational topology, never campus ownership. Original stage definitions are retained as `ORIGINAL_STAGES`; active manifests use the reference reconciliation layer. Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md.

## XS-01

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | GENERIC TRAINING MODEL | Classroom selected system |
| sw | generic-mini-switcher | GENERIC TRAINING MODEL | Classroom selected system |
| monitor | generic-projector | GENERIC TRAINING MODEL | Classroom selected system |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:hdmi-pgm-out → monitor:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
## XS-02

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Classroom selected system |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Classroom selected system |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Classroom selected system |
| mix | generic-4ch-mixer | GENERIC TRAINING MODEL | Classroom selected system |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Classroom selected system |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:main-out → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R11, R12 | DESIGN_REFERENCE |
## XS-03

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | GENERIC TRAINING MODEL | Classroom selected system |
| slides | generic-laptop | GENERIC TRAINING MODEL | Classroom selected system |
| sw | generic-mini-switcher | GENERIC TRAINING MODEL | Classroom selected system |
| monitor | generic-projector | GENERIC TRAINING MODEL | Classroom selected system |
| host | generic-obs-host | GENERIC TRAINING MODEL | Classroom selected system |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| slides:hdmi-out → sw:hdmi-in-2 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:hdmi-pgm-out → monitor:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:usb → host:usb-1 | USB-C ↔ USB-A | USB_UVC | R01, R04 | DESIGN_REFERENCE |
## XS-04

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | GENERIC TRAINING MODEL | Classroom selected system |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Classroom selected system |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Classroom selected system |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Classroom selected system |
| mix | generic-4ch-mixer | GENERIC TRAINING MODEL | Classroom selected system |
| sw | generic-mini-switcher | GENERIC TRAINING MODEL | Classroom selected system |
| host | generic-obs-host | GENERIC TRAINING MODEL | Classroom selected system |
| monitor | generic-projector | GENERIC TRAINING MODEL | Classroom selected system |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:hdmi-pgm-out → monitor:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:aux-out → sw:audio-in | 6.35mm ↔ 3.5mm | LINE_UNBAL | R10, R11, R12 | DESIGN_REFERENCE |
| sw:usb → host:usb-1 | USB-C ↔ USB-A | USB_UVC | R01, R04 | DESIGN_REFERENCE |
## XS-05

DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | GENERIC TRAINING MODEL | Classroom selected system |
| slides | generic-laptop | GENERIC TRAINING MODEL | Classroom selected system |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Classroom selected system |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Classroom selected system |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Classroom selected system |
| mix | generic-4ch-mixer | GENERIC TRAINING MODEL | Classroom selected system |
| sw | generic-mini-switcher | GENERIC TRAINING MODEL | Classroom selected system |
| monitor | generic-projector | GENERIC TRAINING MODEL | Classroom selected system |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Classroom selected system |
| host | generic-obs-host | GENERIC TRAINING MODEL | Classroom selected system |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| slides:hdmi-out → sw:hdmi-in-2 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:hdmi-pgm-out → monitor:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R01 | DESIGN_REFERENCE |
| sw:usb → host:usb-1 | USB-C ↔ USB-A | USB_UVC | R01, R04 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:main-out → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R11, R12 | DESIGN_REFERENCE |
| mix:aux-out → sw:audio-in | 6.35mm ↔ 3.5mm | LINE_UNBAL | R10, R11, R12 | DESIGN_REFERENCE |
## ST-01

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| sw | generic-studio-switcher | PROVISIONAL | Studio instructor-described route |
| monitor | generic-hdmi-monitor | GENERIC TRAINING MODEL | Studio instructor-described route |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-mv-out → monitor:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
## ST-02

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| lav1 | generic-lav-mic | PROVISIONAL | Studio instructor-described route |
| lav2 | generic-lav-mic | PROVISIONAL | Studio instructor-described route |
| tx1 | generic-wireless-tx | PROVISIONAL | Studio instructor-described route |
| tx2 | generic-wireless-tx | PROVISIONAL | Studio instructor-described route |
| rx1 | generic-wireless-rx | PROVISIONAL | Studio instructor-described route |
| rx2 | generic-wireless-rx | PROVISIONAL | Studio instructor-described route |
| mix | generic-4ch-mixer | PROVISIONAL | Studio instructor-described route |
| sw | generic-studio-switcher | PROVISIONAL | Studio instructor-described route |
| speaker | yamaha-hs5 | DESIGN_REFERENCE | Studio instructor-described route |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| lav1:out → tx1:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | PROVISIONAL |
| lav2:out → tx2:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | PROVISIONAL |
| rx1:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| rx2:audio-out → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| mix:aux-out → sw:audio-in | 6.35mm ↔ 3.5mm | LINE_UNBAL | R10, R11, R12 | PROVISIONAL |
| mix:main-out → speaker:xlr-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R11, R12 | PROVISIONAL |
## ST-03

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| cam2 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| cam3 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| sw | generic-studio-switcher | PROVISIONAL | Studio instructor-described route |
| monitor | generic-hdmi-monitor | GENERIC TRAINING MODEL | Studio instructor-described route |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| cam2:hdmi-out → sw:hdmi-in-2 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| cam3:hdmi-out → sw:hdmi-in-3 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-mv-out → monitor:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
## ST-04

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| lav1 | generic-lav-mic | PROVISIONAL | Studio instructor-described route |
| tx1 | generic-wireless-tx | PROVISIONAL | Studio instructor-described route |
| rx1 | generic-wireless-rx | PROVISIONAL | Studio instructor-described route |
| mix | generic-4ch-mixer | PROVISIONAL | Studio instructor-described route |
| sw | generic-studio-switcher | PROVISIONAL | Studio instructor-described route |
| monitor | generic-hdmi-monitor | GENERIC TRAINING MODEL | Studio instructor-described route |
| capture | magewell-usb-capture-hdmi-gen2 | DESIGN_REFERENCE | Studio instructor-described route |
| host | generic-obs-host | PROVISIONAL | Studio instructor-described route |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-mv-out → monitor:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-pgm-out → capture:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| capture:usb → host:usb-1 | USB-A ↔ USB-A | USB_UVC | R04, R05 | PROVISIONAL |
| lav1:out → tx1:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | PROVISIONAL |
| rx1:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| mix:aux-out → sw:audio-in | 6.35mm ↔ 3.5mm | LINE_UNBAL | R10, R11, R12 | PROVISIONAL |
## ST-05

BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| cam2 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| cam3 | generic-hdmi-camera | PROVISIONAL | Studio instructor-described route |
| sw | generic-studio-switcher | PROVISIONAL | Studio instructor-described route |
| monitor | generic-hdmi-monitor | GENERIC TRAINING MODEL | Studio instructor-described route |
| lav1 | generic-lav-mic | PROVISIONAL | Studio instructor-described route |
| lav2 | generic-lav-mic | PROVISIONAL | Studio instructor-described route |
| tx1 | generic-wireless-tx | PROVISIONAL | Studio instructor-described route |
| tx2 | generic-wireless-tx | PROVISIONAL | Studio instructor-described route |
| rx1 | generic-wireless-rx | PROVISIONAL | Studio instructor-described route |
| rx2 | generic-wireless-rx | PROVISIONAL | Studio instructor-described route |
| mic | generic-dynamic-mic | PROVISIONAL | Studio instructor-described route |
| mix | generic-4ch-mixer | PROVISIONAL | Studio instructor-described route |
| speaker | yamaha-hs5 | DESIGN_REFERENCE | Studio instructor-described route |
| capture | magewell-usb-capture-hdmi-gen2 | DESIGN_REFERENCE | Studio instructor-described route |
| host | generic-obs-host | PROVISIONAL | Studio instructor-described route |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:hdmi-out → sw:hdmi-in-1 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| cam2:hdmi-out → sw:hdmi-in-2 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| cam3:hdmi-out → sw:hdmi-in-3 | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-mv-out → monitor:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| sw:hdmi-pgm-out → capture:hdmi-in | HDMI ↔ HDMI | HDMI | R04, R08 | PROVISIONAL |
| capture:usb → host:usb-1 | USB-A ↔ USB-A | USB_UVC | R04, R05 | PROVISIONAL |
| lav1:out → tx1:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | PROVISIONAL |
| lav2:out → tx2:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | PROVISIONAL |
| rx1:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| rx2:audio-out → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| mic:xlr-out → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | PROVISIONAL |
| mix:aux-out → sw:audio-in | 6.35mm ↔ 3.5mm | LINE_UNBAL | R10, R11, R12 | PROVISIONAL |
| mix:main-out → speaker:xlr-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R11, R12 | PROVISIONAL |
## AU-01

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| sw | generic-sdi-switcher | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convSH | bmd-micro-converter-sdi-hdmi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| display | generic-hdmi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| sw:sdi-out-1 → convSH:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| convSH:hdmi-out → display:hdmi-in | HDMI ↔ HDMI | HDMI | R08 | DESIGN_REFERENCE |
## AU-02

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| podium | generic-dynamic-mic | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| paL | generic-active-pa | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| paR | generic-active-pa | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| sw | generic-sdi-switcher | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| hand1 | reference-handheld-tx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| hrx1 | generic-wireless-rx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| podium:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| hrx1:audio-out → stagebox:mic-in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-2 → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:pa-l → paL:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:pa-r → paR:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
## AU-03

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| ptz | generic-sdi-ptz | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| slides | generic-laptop | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| sw | generic-sdi-switcher | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convSH | bmd-micro-converter-sdi-hdmi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| display | generic-hdmi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam3:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| ptz:sdi-out → sw:sdi-in-4 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| slides:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R02, R08 | DESIGN_REFERENCE |
| convHS:sdi-out → sw:sdi-in-5 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| sw:sdi-out-1 → convSH:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| convSH:hdmi-out → display:hdmi-in | HDMI ↔ HDMI | HDMI | R08 | DESIGN_REFERENCE |
## AU-04

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| ptz | generic-sdi-ptz | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| slides | generic-laptop | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| sw | generic-sdi-switcher | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convSH | bmd-micro-converter-sdi-hdmi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| display | generic-hdmi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| podium | generic-dynamic-mic | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam3:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| ptz:sdi-out → sw:sdi-in-4 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| slides:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R02, R08 | DESIGN_REFERENCE |
| convHS:sdi-out → sw:sdi-in-5 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| sw:sdi-out-1 → convSH:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| convSH:hdmi-out → display:hdmi-in | HDMI ↔ HDMI | HDMI | R08 | DESIGN_REFERENCE |
| podium:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
## AU-05

DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| ptz | generic-sdi-ptz | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| slides | generic-laptop | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| sw | generic-sdi-switcher | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| convSH | bmd-micro-converter-sdi-hdmi-3g | DESIGN_REFERENCE | Auditorium canonical video/audio |
| display | generic-hdmi-monitor | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| podium | generic-dynamic-mic | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| paL | generic-active-pa | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| paR | generic-active-pa | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| capture | generic-sdi-usb-capture | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| host | generic-obs-host | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| rec | bmd-hyperdeck-studio-hd-plus | DESIGN_REFERENCE | Auditorium canonical video/audio |
| hand1 | reference-handheld-tx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| hrx1 | generic-wireless-rx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| hand2 | reference-handheld-tx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| hrx2 | generic-wireless-rx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| lav1 | generic-lav-mic | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| lav2 | generic-lav-mic | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| tx1 | generic-wireless-tx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| tx2 | generic-wireless-tx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| rx1 | generic-wireless-rx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |
| rx2 | generic-wireless-rx | GENERIC TRAINING MODEL | Auditorium canonical video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| cam3:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| ptz:sdi-out → sw:sdi-in-4 | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| slides:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R02, R08 | DESIGN_REFERENCE |
| convHS:sdi-out → sw:sdi-in-5 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| sw:sdi-out-1 → convSH:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| convSH:hdmi-out → display:hdmi-in | HDMI ↔ HDMI | HDMI | R08 | DESIGN_REFERENCE |
| sw:sdi-out-2 → capture:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| capture:usb → host:usb-1 | USB-A ↔ USB-A | USB_UVC | R01, R04 | DESIGN_REFERENCE |
| sw:sdi-out-3 → rec:sdi-in | SDI ↔ SDI | SDI | R02, R08 | DESIGN_REFERENCE |
| podium:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| hrx1:audio-out → stagebox:mic-in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| hrx2:audio-out → stagebox:mic-in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx1:audio-out → stagebox:mic-in-4 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx2:audio-out → stagebox:mic-in-5 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| lav1:out → tx1:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| lav2:out → tx2:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-2 → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-3 → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-4 → mix:in-4 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-5 → mix:in-5 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:pa-l → paL:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:pa-r → paR:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
## OUT-01

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
## OUT-02

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| shotgun | reference-shotgun | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| amb | generic-ambience-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| shotgun:xlr-out → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R11 | DESIGN_REFERENCE |
| amb:xlr-out → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
## OUT-03

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberTx | reference-fiber-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberRx | reference-fiber-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam3:sdi-out → fiberTx:sdi-in | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| fiberTx:optical-out → fiberRx:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R07, R09 | Role-level training only; exact connector/protocol UNKNOWN |
| fiberRx:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R07, R09 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
## OUT-04

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberTx | reference-fiber-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberRx | reference-fiber-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| shotgun | reference-shotgun | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| amb | generic-ambience-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| embed | reference-audio-embedder | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| enc | reference-sdi-encoder | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| net | generic-gateway | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| wan | generic-test-ingest | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam3:sdi-out → fiberTx:sdi-in | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| fiberTx:optical-out → fiberRx:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R07, R09 | Role-level training only; exact connector/protocol UNKNOWN |
| fiberRx:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R07, R09 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| shotgun:xlr-out → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R11 | DESIGN_REFERENCE |
| amb:xlr-out → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| sw:sdi-out-1 → embed:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| mix:bc-l → embed:audio-l | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → embed:audio-r | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| embed:sdi-out → enc:sdi-in | SDI ↔ SDI | SDI | R15 | DESIGN_REFERENCE |
| enc:eth → net:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net:wan → wan:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
## OUT-05

DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam2 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| cam3 | generic-sdi-camera | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberTx | reference-fiber-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| fiberRx | reference-fiber-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| shotgun | reference-shotgun | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| amb | generic-ambience-mic | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| embed | reference-audio-embedder | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| enc | reference-sdi-encoder | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| net | generic-gateway | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |
| wan | generic-test-ingest | GENERIC TRAINING MODEL | Outdoor canonical transport/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:sdi-out → sw:sdi-in-1 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam2:sdi-out → sw:sdi-in-2 | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| cam3:sdi-out → fiberTx:sdi-in | SDI ↔ SDI | SDI | R03, R07, R09 | DESIGN_REFERENCE |
| fiberTx:optical-out → fiberRx:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R07, R09 | Role-level training only; exact connector/protocol UNKNOWN |
| fiberRx:sdi-out → sw:sdi-in-3 | SDI ↔ SDI | SDI | R07, R09 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| shotgun:xlr-out → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R11 | DESIGN_REFERENCE |
| amb:xlr-out → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| sw:sdi-out-1 → embed:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| mix:bc-l → embed:audio-l | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → embed:audio-r | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| embed:sdi-out → enc:sdi-in | SDI ↔ SDI | SDI | R15 | DESIGN_REFERENCE |
| enc:eth → net:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net:wan → wan:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
## SP-01

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu1 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| router | reference-video-router-8 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:optical-out → ccu1:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu1:sdi-out → router:in-1 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-1 → sw:sdi-in-1 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
## SP-02

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| mic1 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| mic2 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| crowdL | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| crowdR | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| field | generic-dynamic-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| mic1:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mic2:xlr-out → stagebox:mic-in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdL:xlr-out → stagebox:mic-in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdR:xlr-out → stagebox:mic-in-4 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| field:xlr-out → stagebox:mic-in-5 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → stagebox:mic-in-6 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-2 → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-3 → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-4 → mix:in-4 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-5 → mix:in-5 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-6 → mix:in-6 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
## SP-03

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu1 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam2 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu2 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam3 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu3 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam4 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu4 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam5 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu5 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam6 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu6 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| router | reference-video-router-8 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| play | reference-replay | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| controller | reference-replay-controller | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| gfx | generic-graphics-pc | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Stadium canonical field/video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:optical-out → ccu1:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu1:sdi-out → router:in-1 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-1 → sw:sdi-in-1 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam2:optical-out → ccu2:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu2:sdi-out → router:in-2 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-2 → sw:sdi-in-2 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam3:optical-out → ccu3:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu3:sdi-out → router:in-3 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-3 → sw:sdi-in-3 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam4:optical-out → ccu4:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu4:sdi-out → router:in-4 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-4 → sw:sdi-in-4 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam5:optical-out → ccu5:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu5:sdi-out → router:in-5 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-5 → sw:sdi-in-5 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam6:optical-out → ccu6:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu6:sdi-out → router:in-6 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-6 → sw:sdi-in-6 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| controller:control-out → play:control-in | CONTROL ↔ CONTROL | CONTROL | R03, R16 | Role-level training only; exact connector/protocol UNKNOWN |
| play:sdi-out → router:in-7 | SDI ↔ SDI | SDI | R03, R16 | DESIGN_REFERENCE |
| gfx:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R03, R07, R09 | DESIGN_REFERENCE |
| convHS:sdi-out → router:in-8 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| router:out-7 → sw:sdi-in-7 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| router:out-8 → sw:sdi-in-8 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
## SP-04

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu1 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam2 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu2 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam3 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu3 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam4 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu4 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam5 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu5 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam6 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu6 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| router | reference-video-router-8 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| mic1 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| mic2 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| crowdL | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| crowdR | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| field | generic-dynamic-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| play | reference-replay | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| controller | reference-replay-controller | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| gfx | generic-graphics-pc | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| enc | reference-sdi-encoder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| enc2 | reference-sdi-encoder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| net | generic-gateway | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| net2 | generic-gateway | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| wan | generic-test-ingest | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| wan2 | generic-test-ingest | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| rec | reference-recorder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| display | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:optical-out → ccu1:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu1:sdi-out → router:in-1 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-1 → sw:sdi-in-1 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam2:optical-out → ccu2:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu2:sdi-out → router:in-2 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-2 → sw:sdi-in-2 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam3:optical-out → ccu3:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu3:sdi-out → router:in-3 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-3 → sw:sdi-in-3 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam4:optical-out → ccu4:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu4:sdi-out → router:in-4 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-4 → sw:sdi-in-4 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam5:optical-out → ccu5:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu5:sdi-out → router:in-5 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-5 → sw:sdi-in-5 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam6:optical-out → ccu6:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu6:sdi-out → router:in-6 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-6 → sw:sdi-in-6 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| controller:control-out → play:control-in | CONTROL ↔ CONTROL | CONTROL | R03, R16 | Role-level training only; exact connector/protocol UNKNOWN |
| play:sdi-out → router:in-7 | SDI ↔ SDI | SDI | R03, R16 | DESIGN_REFERENCE |
| gfx:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R03, R07, R09 | DESIGN_REFERENCE |
| convHS:sdi-out → router:in-8 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| router:out-7 → sw:sdi-in-7 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| router:out-8 → sw:sdi-in-8 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| mic1:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mic2:xlr-out → stagebox:mic-in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdL:xlr-out → stagebox:mic-in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdR:xlr-out → stagebox:mic-in-4 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| field:xlr-out → stagebox:mic-in-5 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → stagebox:mic-in-6 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-2 → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-3 → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-4 → mix:in-4 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-5 → mix:in-5 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-6 → mix:in-6 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| sw:sdi-out-1 → enc:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-2 → enc2:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-3 → rec:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-4 → display:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| enc:eth → net:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net:wan → wan:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
| enc2:eth → net2:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net2:wan → wan2:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
## SP-05

DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.

| Node | Profile | Evidence status | Appendix section |
| --- | --- | --- | --- |
| cam1 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu1 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam2 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu2 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam3 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu3 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam4 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu4 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam5 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu5 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| cam6 | reference-fiber-camera | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| ccu6 | reference-ccu | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| router | reference-video-router-8 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| sw | reference-production-switcher | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| monitor | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| mic1 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| mic2 | shure-sm58 | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| crowdL | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| crowdR | generic-ambience-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| field | generic-dynamic-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| lav | generic-lav-mic | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tx | generic-wireless-tx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| rx | generic-wireless-rx | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| stagebox | reference-stagebox-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| tail | reference-tail-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| mix | reference-console-6 | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| pa | generic-active-pa | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| play | reference-replay | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| controller | reference-replay-controller | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| gfx | generic-graphics-pc | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| convHS | bmd-micro-converter-hdmi-sdi-3g | DESIGN_REFERENCE | Stadium canonical field/video/audio |
| enc | reference-sdi-encoder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| enc2 | reference-sdi-encoder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| net | generic-gateway | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| net2 | generic-gateway | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| wan | generic-test-ingest | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| wan2 | generic-test-ingest | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| rec | reference-recorder | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |
| display | generic-sdi-monitor | GENERIC TRAINING MODEL | Stadium canonical field/video/audio |

| Physical edge | Cable | Signal | References | Scope |
| --- | --- | --- | --- | --- |
| cam1:optical-out → ccu1:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu1:sdi-out → router:in-1 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-1 → sw:sdi-in-1 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam2:optical-out → ccu2:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu2:sdi-out → router:in-2 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-2 → sw:sdi-in-2 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam3:optical-out → ccu3:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu3:sdi-out → router:in-3 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-3 → sw:sdi-in-3 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam4:optical-out → ccu4:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu4:sdi-out → router:in-4 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-4 → sw:sdi-in-4 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam5:optical-out → ccu5:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu5:sdi-out → router:in-5 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-5 → sw:sdi-in-5 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| cam6:optical-out → ccu6:optical-in | FIBER ↔ FIBER | FIBER_VIDEO | R09 | Role-level training only; exact connector/protocol UNKNOWN |
| ccu6:sdi-out → router:in-6 | SDI ↔ SDI | SDI | R09 | DESIGN_REFERENCE |
| router:out-6 → sw:sdi-in-6 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| controller:control-out → play:control-in | CONTROL ↔ CONTROL | CONTROL | R03, R16 | Role-level training only; exact connector/protocol UNKNOWN |
| play:sdi-out → router:in-7 | SDI ↔ SDI | SDI | R03, R16 | DESIGN_REFERENCE |
| gfx:hdmi-out → convHS:hdmi-in | HDMI ↔ HDMI | HDMI | R03, R07, R09 | DESIGN_REFERENCE |
| convHS:sdi-out → router:in-8 | SDI ↔ SDI | SDI | R08 | DESIGN_REFERENCE |
| router:out-7 → sw:sdi-in-7 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| router:out-8 → sw:sdi-in-8 | SDI ↔ SDI | SDI | R16 | DESIGN_REFERENCE |
| sw:mv-out → monitor:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| mic1:xlr-out → stagebox:mic-in-1 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| mic2:xlr-out → stagebox:mic-in-2 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdL:xlr-out → stagebox:mic-in-3 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| crowdR:xlr-out → stagebox:mic-in-4 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| field:xlr-out → stagebox:mic-in-5 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| lav:out → tx:mic-in | 3.5mm ↔ 3.5mm | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| rx:audio-out → stagebox:mic-in-6 | XLR-F ↔ XLR-M | MIC | R10, R11, R12 | DESIGN_REFERENCE |
| stagebox:multicore → tail:multicore | MULTICORE ↔ MULTICORE | MULTICORE | R10, R14, R17 | DESIGN_REFERENCE |
| tail:tail-1 → mix:in-1 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-2 → mix:in-2 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-3 → mix:in-3 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-4 → mix:in-4 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-5 → mix:in-5 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| tail:tail-6 → mix:in-6 | XLR-F ↔ XLR-M | MIC | R10, R14 | DESIGN_REFERENCE |
| mix:pa-l → pa:line-in | XLR-F ↔ XLR-M | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-l → sw:xlr-l | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| mix:bc-r → sw:xlr-r | XLR-F ↔ 6.35mm | LINE_BAL | R10, R12, R17 | DESIGN_REFERENCE |
| sw:sdi-out-1 → enc:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-2 → enc2:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-3 → rec:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| sw:sdi-out-4 → display:sdi-in | SDI ↔ SDI | SDI | R03 | DESIGN_REFERENCE |
| enc:eth → net:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net:wan → wan:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
| enc2:eth → net2:lan-1 | ETHERNET ↔ ETHERNET | ETHERNET | R06, R13 | DESIGN_REFERENCE |
| net2:wan → wan2:wan-in | ETHERNET ↔ ETHERNET | WAN | R06, R13 | DESIGN_REFERENCE |
