# ETCSTREAM / EduStream — Technical Handoff: 5 Venues × 5 Practical Levels

**Edition:** 20 October 2026  
**Purpose:** Supplement the restored original Research and Appendix A; give Codex a concise Thai teaching specification, per-level equipment/cable progression and implementation rules.  
**Source of truth:** `ETCSTREAM_SIGNAL_FLOW_FIVE_VENUES_TEXT_ONLY_REFERENCES.md` (original, 11 October 2026).  
**Previous implementation brief:** `ETCSTREAM_CLAUDE_RESEARCH_LOCKED_25_LEVELS_COMPLETE_EQUIPMENT_SPACIOUS_SMOOTH.md` (contains Appendix A verbatim).  
**Important:** This file **does not replace** either original file or claim to be a physical equipment audit. User's current task-specific instruction takes priority over procedural milestones in old briefs. Preserve the separate existing free-practice studio; make mission-only improvements.

## 0. Read this before coding (English instructions to Codex)

1. Inspect the existing repository and the two accompanying original documents. Treat Appendix A's *technical* content as authoritative; this supplement is an index/teaching matrix, not permission to invent models, ports, formats or stock.
2. Preserve original Thai fantasy chapter titles and five nested practical missions **within each chapter** (`xs`, `s`, `m`, `l`, `xl` are internal venue keys). Keep existing saves and the separate free-practice studio intact. All user-visible strings remain Thai; genuine labels such as HDMI, SDI, XLR, OBS, INPUT, OUTPUT, Program and Multiview remain as-is.
3. For every level, derive physical cable count from its explicitly selected graph edges, NOT from an arbitrary common backpack. The tables below list **cable families/tasks**, not an assertion that every cable shown is a valid finished graph edge without exact port validation.
4. `VERIFIED_SPEC` means manufacturer documentation on an example model; `DESIGN_REFERENCE` means an educational example topology; `PROVISIONAL` means the actual room device/model/port has not been confirmed; `UNKNOWN` means no evidence. Brands in documents are not proof of items owned by the university.
5. Choose one documented coherent route per authored scenario. Do not simultaneously force optional/alternative routes. Use a clearly labelled generic training device where only role-level information is verified, and retain unresolved exact port counts until the real rear panel/model is checked. For HDMI↔SDI use powered active converters in the correct direction; for long optical paths use compatible powered TX/RX or matched camera/CCU system.
6. Implement equipment and each cable as physically present, pickable/usable or installed as appropriate; every mission graph node must correspond to a reachable world item or an accessible grounded service/patch point. The interface shall teach how/why a route works, not self-complete after a single click.
7. Protect safety: simulate trained-technician power/ground/weather checks; do not gamify wiring mains electricity. Do not claim runtime test/playtest success without running and reporting the tests the owner authorized in the current assignment.

## 1. Core teaching principle / หลักการที่ต้องสอน

```text
SOURCE → TRANSPORT → ROUTING/PROCESSING → MONITORING → CAPTURE/ENCODE → DESTINATION
```

- Directional AV connection: **OUTPUT → compatible INPUT**. USB, network, fiber and power need their **own** role/protocol rules, not this rule blindly.
- A fitting connector does not prove a valid signal: 75Ω BNC carrying SDI is not interchangeable with BNC reference/timecode; network RJ45 does not make equipment Dante or NDI capable; USB-C must have a real data/device/host role; XLR analog mic level and line level differ.
- `Program` is what goes to viewers; `Multiview` is operator monitoring. No mission may treat them as interchangeable. Every participating device must support the **selected** compatible resolution/frame rate; choose a common supported teaching baseline such as 1080p50 **only after checking** all selected device profiles.
- Analog microphone → appropriate microphone preamp / mixer; enable +48V only if that particular microphone requires it. Mixer main/PA to venue sound; independent Broadcast mix to the chosen program/encoder audio path when a venue requires both. Active loudspeaker takes a compatible line input; passive PA needs an amplifier.
- A connected plug is not automatically a working feed: check device power, RF pairing, routing, converter direction, format, audio assignment, selection, capture recognition, encoder/network and destination status separately.
- Wireless microphone: microphone/lavalier → transmitter ~~paired RF~~> matching receiver AUDIO OUT → correctly matched mixer INPUT. RF is not a cable in the backpack.
- Cable stock is concrete: every end is typed, quantity is counted from selected edges, installed fixed infrastructure is not portable, removing a cable frees both ports, and a failed connection never destroys inventory.

## 2. Equipment/cable quick reference / ประเภทสายและข้อห้าม

| Cable / medium (inventory type) | Training use | Minimum port/profile validation | Typical mistake to reject |
|---|---|---|---|
| `HDMI_A_TO_A` | HDMI camera/laptop → switcher; switcher → HDMI display | HDMI OUT→HDMI IN; exact camera socket may instead require Mini/Micro HDMI adapter/cable validated for that device | HDMI directly into SDI BNC |
| `SDI_75OHM_BNC` | SDI camera/converter/router/switcher/encoder | 75Ω video BNC, supported 3G/6G/12G and format; length/loss budget | SDI BNC into REF or passive BNC Y-split |
| `USB_DATA_DEVICE_HOST` | Switcher USB webcam or Magewell USB capture → OBS host computer | Correct physical plugs, data support, peripheral→host, OBS source selection | USB device→device or charging-only cable |
| `XLR_BAL_MIC` | Wired mic → suitable MIC preamp/console/stagebox | Mic type, 3-pin XLR, MIC input, phantom condition | Mic directly into LINE-only or SDI |
| `XLR_BAL_LINE` / `TRS_BAL_LINE` | Mixer/receiver/processor/embedder/active speaker | Actual output/input level + connector + direction | Assume XLR and TRS of every device are interchangeable automatically |
| `AUDIO_3_5_MM` | Receiver/mixer/switcher only when documented | TRS/TRRS, stereo/mono, mic/line mode and actual switcher audio jack | Plug arbitrary receiver level into switcher set for the wrong level |
| `NETWORK_CAT5E_OR_BETTER` | Encoder ↔ router; supported Dante stagebox ↔ compatible digital console/network | IP/network function, link, VLAN/routing where relevant; Dante TX/RX subscriptions and clock | RJ45 implies it magically carries SDI or analog multicore |
| `MATCHED_FIBER_ASSEMBLY` | Powered optical pair / specified broadcast camera-CCU link | Matching TX/RX, connector, wavelength, single/multi mode, power and approved transport | Bare fiber plugged into SDI BNC or mismatched optical endpoints |
| `RF_PAIRING` (logical; not cable) | Wireless audio/video TX↔RX | Exact compatible family, correct channel/frequency, battery/pair status | Count air link as physical wire |
| `POWER_READY` (safe simulation) | Adapter, UPS, equipment on/ready | Correct rated manufacturer adapter; technician-only electrical servicing | Encourage physical live mains wiring as puzzle |

**Stock formula:** count one appropriate cable per selected physical graph edge, plus matched transport/adapter segments at each converter endpoint. Add a small, separately tagged optional spare supply if useful; never substitute a spare for an absent mandatory edge. Do not hardcode every venue's backpack to the same items.

## 3. Venue XS — ห้องประตูแรกแห่งภาพ (ห้องเรียน)

**Educational job:** present a teacher/camera/slides hybrid classroom. **Reference profile:** 1 HDMI camera + tripod, 1 teacher laptop with confirmed HDMI OUT, 1 mini HDMI switcher with enough inputs plus HDMI PROGRAM OUT and USB webcam DEVICE (e.g. *documented example* ATEM Mini Pro), 1 classroom HDMI TV/projector, 1 compatible wireless lav TX/RX kit, 1 small audio mixer with a chosen viable PA and stream feed, compatible active speaker/PA, 1 streaming notebook with OBS, headphones, proper adapters and power-ready props. **Status:** reference design, not campus inventory.

**Selected route:**
```text
Camera HDMI OUT --HDMI #1--> Mini Switcher HDMI IN 1
Teacher Laptop HDMI OUT --HDMI #2--> Mini Switcher HDMI IN 2
Mini Switcher HDMI PROGRAM OUT --HDMI #3--> Classroom display HDMI IN
Mini Switcher USB WEBCAM DEVICE --USB DATA #1--> Streaming Notebook USB HOST → OBS Video Capture Device
Teacher Lav → TX ~~compatible paired RF~~> RX AUDIO OUT --matched audio #1--> Audio Mixer input
Audio Mixer PA bus --matched audio #2--> active PA input (or separately model a valid amplifier chain)
Audio Mixer STREAM/AUX bus --matched audio #3--> mini switcher documented audio input; configure compatible mic/line level
```
The baseline **requires three HDMI runs + one USB data run**, then audio runs derived above from documented *actual chosen* connector formats. This topology does NOT require an extra Magewell card if the chosen switcher already provides USB webcam output. Check that the selected mixer/switcher actually supports the two audio destinations simultaneously.

| Level | Thai mission objective | Must exist and be interactable | Cable/fault focus | Pass condition |
|---|---|---|---|---|
| XS-1 ภาพ | ต่อภาพกล้องไปยังจอผ่านสวิตเชอร์ | Camera, tripod, mini switcher, display | HDMI camera→IN1 and switcher PGM→display | Display shows selected clean camera Program |
| XS-2 เสียง | ทำให้เสียงผู้สอนออกระบบที่เหมาะสม | Lav/TX/RX, small mixer, active PA; switcher stream input when chosen | RF pair, RX→mixer and selected mixer→PA/stream lead | Voice meters and target PA/program audio are present without duplicate capture |
| XS-3 สลับภาพ | เพิ่มภาพสไลด์และเปลี่ยน Program | Teacher laptop, camera, switcher, screen, OBS computer | HDMI second source, HDMI program, USB webcam | Can switch camera/slides, OBS sees correct Program rather than MV |
| XS-4 แก้ปัญหา | ซ่อมภาพดำ/เสียงหายด้วยการตรวจจริง | Same selected setup, accessible ports | Deliberate HDMI wrong input, USB charging-only, muted bus, unpaired TX; choose documented fault(s) | Repair and signal downstream verified |
| XS-5 Full | ติดตั้ง Hybrid Classroom ครบทั้งภาพ เสียง จอ สตรีม | Every mandatory selected XS item, cable, both audio outputs and OBS | Full physical graph above and safe cable route | Classroom display + in-room sound + embedded program audio + OBS/record/stream readiness |

## 4. Venue S — สะพานจันทราแห่งเสียง (ห้องสตูดิโอ)

**Protection:** Reference for a **separate mission-only studio instance**; never remodel or reset the existing independent free-practice Studio Room 01 and its HDMI vertical slice. Prior reference hardware: cameras 1–3 (exact HDMI/SDI per unit pending), DeviceWell HDS7105 named device (rear-panel/revision verification pending), COMICA WM100 PLUS-style lav TX1/TX2 + receiver *provisional*, small mixer chassis *provisional*, selected *game reference* Magewell USB Capture HDMI Gen 2 32060, streaming PC/OBS, compatible HDMI multiview TV and optional HS5 monitor, optional Sennheiser XS1 wired microphone. Do not claim selected references are necessarily physically owned by the university.

**Instructor-described route (model/port verification still mandatory):**
```text
Camera 1/2/3 VIDEO OUT --[verified compatible HDMI/SDI route]--> HDS7105 selected VIDEO INPUTS
Lav1→TX1 and Lav2→TX2 ~~RF~~> matching RX AUDIO OUT --suitable analog--> Mixer INPUT
Optional XS1 XLR OUT --XLR BAL MIC--> Mixer MIC INPUT
Mixer selected BROADCAST OUT --model-matched analog--> HDS7105 AUDIO INPUT [VERIFY]
HDS7105 selected MULTIVIEW OUT --model-matched HDMI/SDI conversion--> Multiview TV
HDS7105 PROGRAM HDMI OUT --HDMI--> Magewell 32060 HDMI IN
Magewell USB 3.0 DEVICE --USB DATA--> PC USB HOST → OBS Video Capture Device
Mixer independent MONITOR/AUX OUT --compatible line--> optional active HS5 [only if selected/valid]
```
**Important:** Instructor route for program audio is `Mixer → Switcher → Capture`, not `Mixer → Capture` as a shortcut. Do not assert 2 independently addressable lav channels if the actual 2TX/1RX unit has a mixed-only output.

| Level | Thai mission objective | Must exist | Cable/fault focus | Pass condition |
|---|---|---|---|---|
| S-1 ภาพ | ต่อภาพจากกล้องสตูดิโอหนึ่งมุม | Chosen camera, HDS7105 reference profile, compatible display | Verified camera output lead + selected switcher display route | Camera video appears at intended viewer/operator target |
| S-2 เสียง | จับเสียงพูดด้วยไมค์ไร้สายและมิกเซอร์ | Lav/TX/RX, mixer, switcher audio input where verified | RF and receiver→mixer→switcher audio | Program receives audible, metered nonduplicated voice |
| S-3 สลับภาพ | จัดภาพสามมุมและตรวจ Multiview | Camera 1–3, switcher, TV, Magewell/PC when selected | Each verified video cable, distinct MV vs PGM, capture HDMI + USB | MV preview and clean PGM route behave differently and correctly |
| S-4 แก้ปัญหา | แก้ input, RF, mixer bus หรือ capture ดำ | Active selected studio graph | Wrong input selection, RF pairing, incorrect audio bus, missing Magewell USB host data | Actual failed edge fixed and downstream feedback restored |
| S-5 Full | ประกอบสตูดิโอสามกล้องพร้อมเสียงและ OBS | All required selected S profile items | Entire instructor route, physically present and accessible | Correct PGM HDMI→Magewell→OBS with Program audio and monitoring |

## 5. Venue M — หอคอยกระจกสลับภาพ (หอประชุมอาคารกิจกรรม)

**Educational job:** three camera views + SDI PTZ + slide feed + FOH / stage audio + clean projector/LED feed + OBS. **Reference hardware role:** three 3G-SDI cameras/tripods, one PTZ with confirmed SDI OUT, presentation HDMI laptop + powered HDMI→SDI converter, sufficient-input SDI production switcher (HD8/ISO is a manufacturer reference only), FOH multiview display and Program/Confidence monitor when chosen, stage projector/LED processor, powered SDI→HDMI converter for HDMI-only end display, podium mic, two handheld and two lav wireless units/compatible receivers, chosen analog multicore stagebox **or** fully matched Dante stagebox ecosystem, digital mixer with independently routed venue PA and broadcast buses, active PA or amp+passive PA, PC/OBS using supported switcher USB webcam output **or explicitly selected SDI capture route**, optional correctly routed recorder, supporting supply and cable protection.

**Selected reference route:**
```text
CAM L/C/R SDI OUT --3 individual qualified SDI runs--> Switcher SDI IN 1/2/3
PTZ SDI OUT --qualified SDI--> Switcher SDI IN 4
Slides Laptop HDMI OUT --HDMI--> powered HDMI→SDI Converter HDMI IN
Converter SDI OUT --qualified SDI--> Switcher SDI IN 5
Switcher dedicated MULTIVIEW OUT → compatible FOH multiview display (convert if necessary)
Switcher AUX OUT assigned to clean PROGRAM --SDI--> powered SDI→HDMI → Stage HDMI display/processor
Switcher USB WEBCAM DEVICE --USB DATA--> FOH PC USB HOST → OBS [chosen streaming option]
Podium mic + compatible wireless RX audio outs → documented MIC/LINE stage inputs
Stagebox → matched multicore OR configured Dante-capable pair → FOH digital mixer
Mixer PA bus → suitable DSP/active PA (or amplifier → passive PA)
Mixer BROADCAST L/R LINE bus --2 correctly matched lines--> switcher documented balanced audio inputs
```
A dedicated recorder feed must use a physically available appropriate separate output; do not secretly steal the sole multiview/Program route or assume a capture card is mandatory alongside a valid USB webcam route.

| Level | Thai mission objective | Must exist | Cable/fault focus | Pass condition |
|---|---|---|---|---|
| M-1 ภาพ | ต่อกล้อง SDI และแสดงภาพหลังห้อง | 1 supported SDI camera, FOH switcher, correct monitoring | 75Ω BNC route and correct output role | Valid camera visible on intended multiview/preview |
| M-2 เสียง | ส่งไมค์เวทีเข้ามิกเซอร์และแยกเสียงหอประชุม/ถ่ายทอด | Podium or verified wireless, selected stagebox/console, PA | XLR MIC, matched stage transport, two separate mixer buses | Both target paths have their intended voice |
| M-3 สลับภาพ | ต่อกล้องหลายจุด PTZ และสไลด์เข้าระบบเดียว | CAM L/C/R, PTZ, laptop, both-direction converters as needed | 4 SDI camera feeds, HDMI→SDI slide feed, MV vs clean AUX/PGM | Operator can route and switch and stage display gets clean program |
| M-4 แก้ปัญหา | วินิจฉัยภาพขึ้น Multiview แต่ไม่ขึ้นจอเวทีหรือเสียงถ่ายทอดหาย | Selected M graph | Converter direction, wrong AUX assignment, missing embedded audio, incompatible stage protocol | Selected fault is fixed and both in-room + stream path validated |
| M-5 Full | ระบบสัมมนาหอประชุมพร้อม FOH ภาพ เสียง จอ บันทึก/OBS | All required M equipment and stock | Complete route above with selected record option | MV, PGM, venue PA, broadcast audio, display and OBS/record destinations independently ready |

## 6. Venue L — คลังผนึกพอร์ตโบราณ (พื้นที่ภายนอกอาคาร)

**Educational job:** outdoor live event with near/far cameras, weather/cable-route safety, long-distance transport, mixed venue/program sound and hardware encoding. **Reference gear:** near SDI cameras A/B, far SDI camera C, three tripods, qualified 75Ω SDI cable/reels, **matched powered** SDI→fiber TX / fiber→SDI RX plus correct fiber assembly, portable SDI switcher, compatible multiview monitor (converter if needed), wireless presenter TX/RX, shotgun and ambient mics, field mixer with PA + broadcast buses, an actual analog-to-SDI **audio embedder** with correct balanced inputs (AJA 3G-AMA reference), suitable PA, hardware encoder with documented SDI INPUT and network connection, router/uplink, technician-controlled power protection, cables/ramp and weather covers. Wireless video TX/RX is OPTIONAL, not compulsory.

```text
Near CAM A SDI OUT --75Ω SDI--> Portable Switcher SDI IN 1
Near CAM B SDI OUT --75Ω SDI--> Portable Switcher SDI IN 2
Far CAM C SDI OUT --75Ω SDI--> powered Fiber TX SDI IN
matched TX optical interface ~~matched fiber link~~ matched Fiber RX optical interface
Fiber RX SDI OUT --75Ω SDI--> Portable Switcher SDI IN 3
Switcher MULTIVIEW OUT --model-matched cable/converter--> Portable MV display
Switcher clean PROGRAM SDI OUT --75Ω SDI--> Audio Embedder SDI IN
Wireless RX + shotgun + ambient mic → Field Mixer proper analog inputs
Mixer VENUE PA bus → matching in-field PA path
Mixer BROADCAST L/R LINE OUT --2 documented audio inputs--> Embedder balanced audio inputs
Embedder SDI OUT with program audio --75Ω SDI--> Hardware Encoder SDI IN
Encoder Ethernet ↔ Router/uplink ↔ actual simulated streaming endpoint
```
SDI maximum reach is cable/rate/loss-budget dependent; do not declare a universal meter figure. Fiber link requires compatible device/protocol/optics and power. Connecting the encoder is separate from declaring platform ingest healthy.

| Level | Thai mission objective | Must exist | Cable/fault focus | Pass condition |
|---|---|---|---|---|
| L-1 ภาพ | ต่อกล้องภาคสนามระยะใกล้เข้าสวิตเชอร์ | CAM A, portable switcher, monitor | Valid qualified 75Ω SDI route | Near feed visible at monitor |
| L-2 เสียง | รับเสียงพิธีกรและบรรยากาศเข้า Field Mixer | Wireless TX/RX, shotgun/ambient per mission, field mixer, PA | RF matching, XLR mic, monitored levels | Safe suitable levels and sound at intended venue/program buses |
| L-3 สลับภาพ/ขนส่ง | เพิ่มกล้องไกลด้วยคู่ Fiber TX/RX แล้วสลับภาพ | A/B/C, fiber pair, portable switcher, MV | Two near SDI runs, SDI→TX→fiber→RX→SDI, power readiness | Three sources selectable without pretending bare fiber equals coax |
| L-4 แก้ปัญหา | ตรวจหากล้องไกลดับ เสียงไม่เข้าสตรีม หรือการเชื่อมต่อเครือข่ายไม่พร้อม | Actual chosen L profile | Wrong TX/RX ends, optical match/power, unembedded audio, network state | Locate and remedy chosen issue(s), then verify downstream |
| L-5 Full | ต่อระบบถ่ายทอดกิจกรรมภายนอกจนถึง Encoder และผู้ชม | All mandatory L selected graph | Full video, program audio embed, venue PA and encoder/uplink; safe cable routing | Program picture+sound enters correct encoder; ingest ready, venue PA works, route checks satisfied |

## 7. Venue XL — บัลลังก์จอมถ่ายทอด (สนามกีฬาและงานถ่ายทอดสด)

**Educational job:** multi-camera sports broadcast, program and operator monitoring, commentary/crowd audio, venue PA, replay/graphics, control and true qualified main/backup stream routes. **Reference gear:** six field camera stations and six compatible camera-to-CCU/base fiber systems, video router (crosspoints) with documented I/O budget, large SDI switcher, replay server with actual video output plus separate controller, graphics source with compatible SDI output or a specific powered HDMI→SDI converter, multiview/program monitoring, commentary mics ×2, crowd mics ×2, field mic ×1, compatible wireless presenter TX/RX ×1, physical stagebox/analog multicore or correctly configured Dante ecosystem, digital broadcast/PA mixer, DSP/PA, intercom/tally as selected, appropriate independent program output feeds, main encoder+primary uplink, backup encoder+backup uplink with separated failure domains when claiming redundancy, recorder and storage, support/power readiness/patch racks.

```text
6 Cameras → 6 matched camera/fiber transport systems → CCU/Base 1–6
CCU 1–6 SDI OUT --6×75Ω SDI--> Router SDI IN 1–6
Replay Server VIDEO OUT --compatible link--> Router SDI IN 7
Graphics VIDEO OUT --compatible link / active conversion if needed--> Router SDI IN 8
Router selected output crosspoints --8 justified SDI leads--> Switcher SDI IN 1–8
Switcher MULTIVIEW OUT → compatible operator monitor wall
Switcher programmed venue AUX OUT → stadium display processing route
Switcher independent PROGRAM outputs (or proper powered distribution) → Main and Backup encoder inputs
Switcher appropriate program/record feed → Recorder [must budget output]
Commentary×2 + Crowd×2 + Field mic + Wireless RX → proper stage inputs
Stagebox → actual compatible audio transport → Digital Console
Console VENUE bus → PA processing/amplification chain
Console BROADCAST L/R LINE bus → compatible switcher program input OR actual audio embedder
Main Encoder network → Primary uplink → streaming endpoint
Backup Encoder network → genuinely independent Backup uplink → streaming endpoint
```
Router patching is not a Program switch. Multiple encoders on the same unavoidable router/power/uplink are only **partial redundancy**; no passive SDI BNC Y-splitting. Dante requires endpoint support, subscriptions, clock and a correctly designed network, not merely common RJ45 shapes. The actual 2 M/E Constellation 4K reference must not be assigned imaginary XLR analog inputs: use its documented compatible balanced 1/4-inch audio inputs or supported external embedding route after checking revision.

| Level | Thai mission objective | Must exist | Cable/fault focus | Pass condition |
|---|---|---|---|---|
| XL-1 ภาพ | รับภาพกล้องสนามเข้าจุดควบคุมผ่าน CCU | Selected camera + matched fiber/base + router/switcher as required + monitor | Matched camera optical transport; base SDI to router/switcher | Source appears at intended correct video input |
| XL-2 เสียง | จัดเสียงผู้บรรยาย เสียงสนาม และเส้นเสียงสำหรับผู้ชมในสนาม/ออนไลน์ | Mics, stage input transport, console, PA and broadcast buses | XLR mic/line, chosen actual stage transport; two independent buses | Correct intelligible voice/crowd mixes present at both destinations |
| XL-3 สลับภาพ | เชื่อมกล้อง Replay Graphics ผ่าน Router และ Switcher | Required selected CCUs, router, replay server, graphics, switcher, MV | Distinct Router IN/OUT and corresponding SDI links; power conversion if necessary | Operator can change router sources and switch clean Program |
| XL-4 แก้ปัญหา | แก้ crosspoint ผิด เสียง Program ไม่เข้า และสตรีมสำรองไม่อิสระ | Full affected routes + main/backup endpoints | Logical routing, embed status, output budgeting, redundant failure-domain audit | Program restored, false redundancy explicitly corrected or flagged |
| XL-5 Full | ต่อและปฏิบัติการถ่ายทอดสดสนามกีฬาครบเส้นทาง | Six camera transports, CCUs, router/switcher, replay, graphics, audio system, MV, venue feed, recorder, 2 encoders and uplinks, selected intercom/tally | Full selected justified physical+logical graph, independently accounted cable stock | In-world picture/audio/PA/Program/record and main+backup readiness independently verified; only claim full redundancy if genuinely independent |

## 8. Universal backpack / in-world reconciliation rules for Codex

For EVERY `(venue, level)` produce machine-readable data and a human-readable Thai audit table with:

- `requiredNodeId`, `thaiName`, `role`, `sourceConfidence`, `displayModelKind`, `isFixed`, `storedAt`, `installedAt`, `reachableInteractionAnchor`.
- `portId`, `physicalConnector`, `direction/usbRole`, `signalKind`, `levelOrDataRate`, `format`, `availableCapacity`, `manufacturerProofOrGenericTrainingProfile`.
- `edgeId`, `fromDevice/fromPort`, `toDevice/toPort`, `required/optional`, `cableType`, `cableCount`, `cableStorageLocation`, `routeWaypoints`, `logicalActions`, `downstreamAssertions`.
- `initialFaults` only from realistic available errors, and `completionPredicate` evaluated on actual graph + verified operational states.
- `stock = count(required physical edge items) + labelled optional/spares`; explicit RF/config actions have **zero physical cable stock**, but the receiver's **wired** audio output still consumes a cable.
- Exact connector form factor on an unverified camera/receiver/mixer remains `PENDING_PHYSICAL_PORT_CONFIRMATION`; do not create a fictitious definitive rear panel.
- Distinguish `missionRequired`, `optionalAlternative`, and `environmentOnly`. Level 5 activates every mandatory piece of the selected topology; fixed stage equipment can remain installed and be reached via service panels rather than being carried in a backpack.
- Each mission room has distinct staging zones. XS: teacher/front display/control rear; S: three cameras, mixer/switcher, equipment tables; M: stage/side-stage/FOH/aisle cameras; L: near/far stations/control tent/fiber field/encoder-uplink; XL: field/commentary/CCU and patch racks/control/replay/graphics/encoders. Keep clear safe walkways and accessible ports.
- Give Thai explanation on failure: identify the actual wrong direction/connector/protocol/format/bus/power/pairing/selection/encoder state. Do not call a user wrong merely because an alternative valid topology differs from the selected game reference; explain this particular task's selected route.

## 9. Sources consulted and how to cite correctly

**Primary original bibliography:** [R01]–[R17] in the restored Appendix A. These are manufacturer/official technical specifications and reference guides, not proof of on-site equipment inventory. Additional Thailand-localized official resources verified for this handoff:

- [TH01] Yamaha Music (Thailand), content production and streaming system patterns: https://th.yamaha.com/th/business/audio/solutions/content-production-streaming/ — supports distinct venue and streaming audio workflows.
- [TH02] Yamaha Music (Thailand), Tio1608-D product overview: https://th.yamaha.com/th/business/audio/products/interfaces/tio1608-d/ — example Dante-capable stagebox: 16 mic/line inputs, 8 line outputs; compatible consoles/interfaces and actual routing are required.
- [TH03] Yamaha Music (Thailand), TF series: https://th.yamaha.com/th/business/audio/products/mixers/tf/ — example console/bus/expansion capability; *do not generalize exact features to every mixer*.
- [TH04] Yamaha Music (Thailand), TF + Tio setup resources: https://th.yamaha.com/th/business/audio/products/mixers/tf/resources.html — documented integration workflow rather than arbitrary Ethernet cable connection.
- [M01] Blackmagic, ATEM Mini getting started: https://www.blackmagicdesign.com/products/atemmini/gettingstarted — camera/laptop HDMI in, display output, USB webcam-to-computer workflow on supported models.
- [M02] Blackmagic, Micro Converters: https://www.blackmagicdesign.com/products/microconverters — **directional powered** HDMI↔SDI conversion devices.
- [M03] OBS official Sources Guide: https://obsproject.com/kb/sources-guide ; Video Capture Sources: https://obsproject.com/kb/video-capture-sources ; Audio Mixer Guide: https://obsproject.com/kb/audio-mixer-guide .
- [M04] Magewell USB Capture HDMI Gen 2: https://www.magewell.com/products/usb-capture-hdmi-gen-2 — actual HDMI capture → USB host interface example, not a synonym for encoder.
- [M05] AJA 3G-AMA: https://www.aja.com/products/3g-ama — an example actual SDI + balanced analog audio embedder, to be configured for the selected audio group.

**Source limits:** [TH01]–[TH04] are the manufacturer Thailand site (some body text/product linked manuals remain English). [M01]–[M05] are official international manufacturer/software documentation; the teaching synthesis in this document is written in Thai. Manufacturer published topology establishes a sound training example, not that any given campus possesses that exact model. Confirm current hardware revision and the project scene's selected model profile before locking port anchors.

## 10. Suggested copy-paste command for Codex

> Read `ETCSTREAM_CLAUDE_RESEARCH_LOCKED_25_LEVELS_COMPLETE_EQUIPMENT_SPACIOUS_SMOOTH.md`, `ETCSTREAM_SIGNAL_FLOW_FIVE_VENUES_TEXT_ONLY_REFERENCES.md`, and this `ETCSTREAM_TECHNICAL_HANDOFF_THAI_5_VENUES_25_LEVELS.md` in full. These files supply the original reference technical research, original Mission Hall context, and updated per-level teaching matrix. Implement the current upgrade request against the existing repository: the five original Thai-named venues with five nested practical levels each, all required in-world equipment and counted correct cables, actual accessible port anchors, logical RF/router/OBS/audio routes, signal-derived completion, and readable Thai feedback. Preserve free-practice mode and working features. Treat uncertain real-model specs as unresolved, never fabricate ports. Derive each level's backpack from the selected canonical graph. Use current user instructions for implementation/test scope if an archived milestone's procedural limitations differ. Report any missing proof and actually performed verification in Thai.
