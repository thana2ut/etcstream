# ETCSTREAM — MISSION HALL: RESEARCH-LOCKED 25 HANDS-ON LESSONS, COMPLETE IN-WORLD EQUIPMENT, REALISTIC SPACIOUS VENUES & SMOOTH PLAY

**PRIMARY COPY-PASTE IMPLEMENTATION PROMPT FOR CLAUDE CODE**  
**Project root:** `D:\etcstream`  
**Instruction language:** English. **All player-facing data, knowledge cards, mission text and feedback: Thai** (retain genuine connector/professional technical labels as originally spelled).  
**Authoritative technical basis:** Appendix A — the complete, unmodified Thai `ETCSTREAM_SIGNAL_FLOW_FIVE_VENUES_TEXT_ONLY_REFERENCES.md` research text with [R01]–[R17].  
**Deliverable:** actual mission-specific implementation with a complete, physically present training inventory for every selected topology, authentic workstation/staging layouts, performance-conscious 3D scenes, and updated detailed documentation; **NOT final physically accurate sculpted 3D models**.  
**Owner constraint:** No automated tests, manual gameplay, browser QA or claims of playtest success in this milestone.

---

## 00 — NON-NEGOTIABLE: THIS REQUEST SUPERSEDES CONFLICTING PRIOR PROMPTS

The prior implementation incorrectly flattened the original five fantasy chapters into five total stages, replaced chapter sublevel choices with one all-equipment brief, and emphasized a checklist/dashboard over first-person practical gameplay. Restore the ORIGINAL structure. Earlier requests to flatten the Mission Hall into five total stages, remove nested level cards, or redesign the free-practice room are **revoked**. Preserve the original home, fantasy art, familiar navigation, five chapter cards and five level cards INSIDE EACH chapter.

**EXACT SCOPE:** Mission Hall (`หอจารึกแห่งภารกิจ`) only, including its mission-only playable 3D venues, equipment/cables/connections, learning content, state, and mission-specific progression. Do not modify the separate free-practice (`ห้องฝึกอิสระ`) mode, its existing Studio Room 01 room/GLB, its current HDMI vertical slice, player controls, completion behavior or persistence. A mission-only S studio environment may be enlarged/rearranged independently; that does NOT authorize changing the protected free-practice Studio Room 01. Any necessary changes to shared engines must be backward compatible and mission-scoped.

**IMPORTANT: the owner will sculpt actual detailed equipment models in a later milestone.** Create only identifiable, proportional, low-poly/greybox **INTERACTIVE TRAINING PLACEHOLDERS** with physically placed and accessible labeled port anchors. No image generation; no photoreal manufacturer replicas; no claiming these are finished authentic physical assets. Do not postpone or fake connection gameplay until sculpted models arrive: the placeholder must be interactable now and replaceable later through a stable equipment/model adapter.

**RESEARCH-LOCK RULE:** Do NOT add a speculative manufacturer, model, connector, number of device ports, proprietary protocol, or new signal path beyond Appendix A. The appendix differentiates `VERIFIED_SPEC`, `DESIGN_REFERENCE`, `PROVISIONAL`, and `UNKNOWN`; preserve these distinctions. If a selected example model has an unverified exact port/revision or a chosen topology has alternatives, implement a **clearly labeled Generic Training Model/Reference Configuration** based on one explicit appendix-supported route, or record an unresolved requirement; do NOT fabricate physical ports to make a puzzle pass. Do not present example brands as campus-owned. There is no request for additional web research or alternative gear purchases in this milestone.

**LAYOUT DESIGN** is a player-experience specification from the owner, NOT a claim about surveyed real building dimensions. Enlarge all five **mission-only** venues substantially compared with cramped current mission visuals; ensure generous walkable routes to every useful corner/connection point. Do not assert arbitrary guessed meter measurements as real campus dimensions. Lay out sensible relative distances and write any virtual dimensions only as game design choices, not field measurements.

---

## 01 — REPOSITORY INSPECTION / PROTECTION

Before edits, read when present:

- `CLAUDE.md`
- `docs/ETCSTREAM_PROJECT_STATE.md`
- `docs/EQUIPMENT_INVENTORY.md`
- `docs/VENUE_SCENARIO_MATRIX.md`
- `docs/MISSION_HALL_5_CHAPTERS_25_LEVELS.md`
- `docs/ETCSTREAM_MASTER_STUDIO_SIGNAL_FLOW.md`
- `docs/VENUE_PHYSICAL_LAYOUTS.md`
- `SECURITY.md`
- actual app routes, chapter catalog, level selection, stores, old and current missions, 3D training/environment components, connection logic and latest local changes.

Use `git status`, `git diff --check`, `git log`, `git show`, `git diff` READ-ONLY as useful for identifying the original cards/details, without discarding newer valid user work. Do NOT `git reset`, `git checkout`, `git restore`, `git clean`, commit, push, delete user work, rewrite history, add paid packages, upgrade the framework without explicit need, or weaken security. Preserve the nickname-only flow, route guard and storage handling. Avoid touching unrelated code. If the old flattened implementation has valid technical definitions, keep and adapt that data while selectively restoring presentation and nested mission logic. Never reset the entire tree.

Do NOT run `npm run test`, create/run an auto-solver, run browser automation, manually play any lesson or claim the output is tested. Do not replace honest `NOT TESTED/NOT PLAYTESTED` with "all bugs fixed". This task is design + implementation only. Existing test files must remain. Static read-only inspection may be used but do not perform gameplay QA.

---

## 02 — EXACT ORIGINAL 5 × 5 STRUCTURE / LABELS

The Mission Hall must visibly render its five ORIGINAL illustrated fantasy chapter cards, 3 + 2 arrangement if consistent with original responsive design, with five independent counters `ผ่านแล้ว X/5 ระดับ`:

| Mission chapter | Internal key | Primary Thai chapter title | Real-world venue subtitle |
|---|---|---|---|
| 01 | `xs` | **ห้องประตูแรกแห่งภาพ** | ห้องเรียน |
| 02 | `s` | **สะพานจันทราแห่งเสียง** | ห้องสตูดิโอ |
| 03 | `m` | **หอคอยกระจกสลับภาพ** | หอประชุมอาคารกิจกรรม |
| 04 | `l` | **คลังผนึกพอร์ตโบราณ** | พื้นที่ภายนอกอาคาร |
| 05 | `xl` | **บัลลังก์จอมถ่ายทอด** | สนามกีฬาและงานถ่ายทอดสด |

`xs/s/m/l/xl` are internal venue keys, not visible primary names and not five global difficulty levels. Clicking each chapter restores the chapter detail UI with **five distinct nested practical-level cards**, progressive unlock and entry to **that venue's** 3D mission. Total **25 levels**. The five teaching themes repeat within each chapter, but the selected gear, cable type, transport, spatial work, required signal graph, and completion conditions vary:

1. `เส้นทางภาพ · Video Path` — hands-on video source/cable/transport/monitor.
2. `เส้นทางเสียง · Audio Path` — physical/wireless microphones, gain/mix and correct downstream audio destination.
3. `สลับภาพและตรวจสัญญาณ` — multiple sources, correct routing, Program vs Multiview, optional converter.
4. `พอร์ตและการแก้ปัญหา` — initially broken/incomplete correct-venue system: inspect actual ports, diagnose, disconnect/repair/reconnect, confirm signal returns.
5. `ระบบ Production ครบเส้นทาง` — **all required** equipment and **every required** final video, audio, monitoring, recording/streaming and operational path for THAT venue. Optional equipment/alternative branches are not silently made compulsory.

Keep chapter identity, original page artwork, fonts, gold framing, buttons and global header/player/audio/fullscreen. Keep original useful chapter and five-level cards; do not substitute one `ด่าน 1/5` screen for all content or a flat admin/checklist UI. Preserve or safely adapt legacy `(missionId, difficulty: 1..5)` where compatible; inspect whether flattened-version data needs an explicit mission-only migration. Never auto-credit five sublevels based on one previously finished flat stage or accidentally overwrite free-practice saves. Each chapter Level 1 initially available, Level N+1 unlocks after correct completion of N as existing design specifies.

---

## 03 — REAL GAMEPLAY: THE ROOM IS THE MAIN INTERFACE, NOT A CHECKLIST

- The center/main area must show a real first-person **3D** venue, never a gray empty plane with floating names and a giant permanent checklist. Greybox quality is allowed, but geometry must visually identify functional work zones, furniture, source gear, cable storage, monitoring and technical controls.
- Retain WASD, mouse/pointer lock, E inspect/pick/connect/disconnect, F place/drop, ESC release pointer lock; use existing mechanics and mission-scoped extensions, not a new unrelated UI interaction engine.
- The player physically walks to storage, picks up/installs appropriate equipment, selects real cable types/ends, approaches actual port anchors, connects the correct endpoints, pairs wireless devices through an explicit control, operates source/preview/program and verifies downstream indication. Fixed infrastructure is not carried around.
- No floating device label may substitute for an actual world-space placeholder with correctly positioned labeled physical connection anchors. Each needed physical device must have `deviceId`, display name, equipment status (`DESIGN_REFERENCE`, `GENERIC TRAINING MODEL`, etc.), port and connection graph mapping. A future GLB should replace only the representation/port transforms without changing its logical identity.
- UI: compact objective and optional collapsible equipment inventory/checklist; small optional Thai knowledge card on E, describing `คืออะไร`, `ใช้ทำอะไร`, `ควรรู้`, `พอร์ต`, `ในด่านนี้` in digestible form. It is supportive UI, **not** the level itself; no full-page forced knowledge reading. Keep correct Thai terms and authentic technical labels.
- Cable visuals should follow sensible route anchors and show end-to-end status without intersecting walls/furniture. For long routes allow reel/service-route/patch-point interactions rather than impractically carrying a cable end across a huge stadium; every route must still be player-executed and visibly traceable. Do not invent cable distance guarantees: actual supported distance depends on medium/spec [R07].
- UI feedback distinguishes `Connected physically`, `Signal present`, `Program selected`, `Audio present`, `OBS capture source detected`, `Encoder ready`, `Ingest receiving`, `Recording active`, `Backup healthy` as relevant. A correct cable alone never completes the level. Monitor Program, Multiview, Preview and Audience feed separately. The simulation is an internal state model; do not pretend to operate real OBS or stream to the internet.
- Device knowledge cards must never assign exact rear-panel geometry to unknown equipment. Place clearly designated generic training ports until a verified model photo/spec exists. Preserve S device uncertainty.

### 03A — TECHNICAL CONNECTION RULES FROM APPENDIX A

Use exact signal roles and compatible ports, not mere port-color matching. AV directional OUT→IN; USB **DEVICE→HOST**; networks bidirectional with matching IP/service and ready state; fiber with matched TX/RX and optical medium; RF TX↔RX is pairing, NOT cable. HDMI↔SDI requires powered active converter. SDI 75-ohm BNC format/level/role checks (SDI not MADI/REF). Mic and line level are not interchangeable by shape alone. Active vs passive PA follow different amp paths. Phantom +48V only where supported and microphone requires it. Dante, if selected, needs compatible endpoint/clock/channel subscriptions; do not pretend any RJ45 equals Dante. Preview/multiview cannot be used as audience Program accidentally. Audio-to-video chain requires assigned/embedded sound before capture/encoder; prevent double audio capture. No passive BNC Y-split posing as independent encoder feeds. Use appendix's single selected topology per venue; do not combine incompatible alternatives.

Where paper reference lists `example model`, exact actual physical ports must match that selected manufacturer's revision. If unknown, present a generic device with a coherent port profile **only to the scope justified by appendix** and label accordingly. For S, only known/verified HDMI slice ports from existing code should remain; do not infer HDS7105's additional real revision-specific ports.

### 03B — DATA / COMPLETION SCHEMA

Inspect repo first and extend existing architecture minimally with mission-only data for:

`venueId`, `level`, `sceneLayout`, `equipment` (id, role, modelStatus, fixed/movable, spawn/placement), `ports` (device, label, direction/host-role, connector, signalFormat/level), `cables` (real endpoints, quantity, compatible signals), `wirelessLinks`, `routes` (required/optional/alternative/forbidden), `equipmentReadyState`, `routing/selection`, `monitoring`, `audioBus`, `capture/encoder/network/recordState`, `completionPredicate`, `knowledgeCard`, `referenceIds`.

- All mandatory graphs refer to existing devices/ports, with enough physical port capacity for parallel branches; do not use the same occupied output for two cables unless it is explicitly a supported multi-output or a separate active distribution device.
- Counts of HDMI/SDI/XLR/USB cables are **derived from exact stage graph**, not invented totals. Store spare choices separately and reject invalid cable without consuming it.
- Every mandatory player-used object has an accessible world-space port/task anchor; every optional/decorative item is labeled as such in data and never blocks completion.
- Stage 4: faults are authored known wrong/disconnected routes, diagnosed and repaired physically; no fixed answer button.
- Each Level 5: mandatory gear must do an actual job; success requires all required source, transport, routes, Program, audio/buses, destination states, and safety readiness relevant to that venue. No `connectedCount >= N` or prechecked checklist. Disconnecting a mandatory cable invalidates the live-ready status until repaired.

---

## 04 — ROOM EXPANSION: ALL FIVE MISSION-ONLY SCENES MUST BE LARGE AND EASY TO WALK

The user requests every mission room/venue to feel **substantially larger** than the screenshots with open movement, real equipment areas, and access to every functional corner. Do not simply enlarge the floor while leaving props as small dots in an empty scene; scale architecture, furniture, camera zones, cable cases, control areas and operator route together as a cohesive workspace.

**LAYOUT-ONLY DESIGN REQUIREMENTS (not surveyed real-world dimensions):**

1. Expand room bounds, stage/field/control zones and walkable footprint; keep person/equipment scale proportionate and first-person eye height sensible. Do not assert invented campus measurements.
2. Maintain generous continuous aisles along sides, front/rear, around center/FOH/control table and behind equipment for actual rear-port service. Player must be able to reach **every usable corner**, each needed device and every required physical port without clipping, jumping, crouching into geometry or being trapped by colliders.
3. Fixed devices live where actually operated: teacher front desk/display, studio operator table + camera tripods, auditorium FOH/stage/stagebox, outdoor tent/reels, stadium field/commentary/control/racks. Staging separate from final operating position; present power/UPS as safely simulated readiness, not electrical DIY.
4. Enlarge and reposition adjacent room geometry, walls, ramps, doors, counters and collider footprints together; update spawn, nav/walkways, fixed positions, world interaction ranges, cable route anchors and placement zones. Preserve wall/door visual clarity. No inaccessible rear panels against walls.
5. Distances should feel venue-appropriate: classroom short, studio moderate, auditorium dispersed stage-to-FOH, outdoor camera-to-tent, XL multiple recognizable production zones. Avoid boring walking downtime: use meaningful cable access/patch locations and clear directional signage; do not require the player to run kilometer-scale field distances.
6. Define per-scene `playerSpawn`, `floorBounds`, `serviceWalkways`, `workZones`, `cableStorageZones`, `equipmentStorageZones`, `cameraPositions`, `audioPositions`, `fixedDeviceTransforms`, `validPlacementZones`, `portClearance`, `cableRouteGuides`, and `environmentBoundary`. Keep coordinates centralized and documented. No new geometry generated images are needed. Use game-ready primitives/greybox environmental pieces; preserve future environment/model swap capability.
7. Stage only gear needed for Levels 1–4 so the space is navigable; Level 5 shows complete required production. No forced all-equipment pile in the center; control rooms should feel staffed by an actual technician.
8. **Protected free-practice Studio Room 01:** absolutely do not resize, move its objects, edit its Blender/GLB, port mapping or mechanics. The larger S mission scene must be a separate mission instance/configuration. If current code inadvertently reuses the exact training room layout, introduce a safe mission-specific layout override or separate mission scene without changing free-practice.

---

## 05 — SPECIFIC VENUE FLOORPLAN, OPERATOR JOB AND REQUIRED RESEARCH-LIMITED GEAR

### 05.1 — `xs` / ห้องประตูแรกแห่งภาพ / ห้องเรียน

**Player job:** Teacher/classroom AV technician preparing a small hybrid lesson. **Expanded spatial design:** player starts near rear classroom entrance; clear student seating rows with side aisles and front presentation space, board/display at front, teacher desk to one side, rear/side AV cabinet and separate rear operator/streaming desk. Camera/tripod at rear-center looking toward teacher; operator can walk around desk and access all input/output connections, teacher laptop at front desk. Active speaker forward away from operator. Cabinet contains labeled coiled HDMI/USB/audio and portable mic components. No studio center round-table clone.

**Only appendix-selected topology [R01,R04,R10]:** HDMI Camera ×1+tripod; presentation laptop ×1; a 2+-input HDMI Mini Switcher **with a separate HDMI display output AND USB Webcam Device** (ATEM Mini Pro is verified **example**, not mandatory actual brand); TV/projector with HDMI input; lav + compatible wireless TX/RX; small mixer with valid distinct PA and stream output/bus for chosen scenario; active speaker or venue PA; Notebook with USB Host + OBS; power/readiness/headphone/support. Do not add dedicated Magewell to THIS selected route. HDMI data cables: Camera→Switcher, Slides→Switcher, Switcher→Display (three dedicated runs); valid switcher USB webcam device → Notebook USB host; receiver audio → mixer; mixer distinct output to active speaker and to switcher compatible audio input; choose actual suitable mic/line connectors from the reference profile. If mixer's two outputs are not actually present in the selected generic profile, do not fake them.

**Canonical physical work path:** rear entry → check cabinet → place/aim rear camera → connect teacher laptop → rear operator switcher → stage/front TV → microphone pairing/receiver → mixer two buses → notebook/OBS → verify presenter image + PA + stream capture. Keep teacher/student walkway safe and cable-route guides along walls/rear desk rather than across central row.

**Level 1:** Camera HDMI OUT → Mini Switcher HDMI IN 1 → dedicated HDMI PROGRAM OUT → TV HDMI IN. All three devices visible in 3D; correct signal and TV indication required. [R01]

**Level 2:** Lav mic → TX MIC IN → valid RF pairing → RX AUDIO OUT → Small Mixer compatible input → active speaker/PA on proper mixer PA bus; set mixer ready/levels. No virtual cable across RF. [R10,R11]

**Level 3:** Add presentation laptop HDMI OUT → Switcher HDMI IN 2; keep Camera IN1, proper selectable camera/slides Program and display output. USB webcam source handling may be introduced as a terminal demonstration only if applicable. Distinguish selected Program from Preview/Multiview. [R01]

**Level 4:** Fault exercise: disconnected/misdirected source, mistaken HDMI destination, missing USB webcam data connection, unpaired RX/TX or wrong PA/stream bus (select a finite coherent subset). Player physically diagnoses and repairs, then sees signal restore. Use Stage 4 gear subset appropriate to faults, not fake port types. [R01,R04,R10]

**Level 5:** Entire selected classroom signal graph: camera+slides, Program to classroom TV, wireless voice receiver→mixer, separate PA to active speaker, stream bus to switcher compatible audio input, switcher USB WEBCAM DEVICE→notebook USB HOST, OBS recognizes chosen webcam source and simulated audio meter. Complete only if display Program, PA and online Program audio/video are independently ready plus safe powered/placement states. No external capture card for this route. [R01,R04,R10,R11]

### 05.2 — `s` / สะพานจันทราแห่งเสียง / ห้องสตูดิโอ — MISSION INSTANCE ONLY

**IMPORTANT:** This is a larger dedicated **mission** training set. Do not edit free-practice Studio Room 01. Studio physical equipment in earlier user photos has uncertainty: HDS7105 high confidence but rear panel revision to verify, PMX-402D-USB chassis provisional, wireless photographed appears COMICA family vs instructor mention Saramonic, camera 2/3 unknown, actual capture model UNKNOWN. Magewell 32060, Samsung U8000F, Yamaha HS5 are selected GAME REFERENCE, not claims about campus gear. [R04,R05,R08]

**Expanded spatial layout:** walkable realistic black studio with front green-screen/presenter zone, accessible three non-overlapping tripod camera positions (left, center, right), lighting on outer positions, physically separated cable table on left, portable equipment table on right, round/production operator station with service space on ALL sides, wall TV/multiview away from rear I/O, speaker on appropriate monitor position, HP-style notebook and capture stage at operator station. Make room clearly more spacious; every front/rear/side of equipment needs camera/interaction reach. Do not bake functional devices into a static environment mesh. Arrange operator area logically: mixer left, switcher control surface central, Magewell between switcher and notebook, notebook on right with host port exposed, wireless RX by mixer; TX stored on right. Studio monitor feed separately from Program.

**Only source-supported logical route:** three cameras → HDS7105 video inputs (**physical video connector/transport explicitly verified in code/reference, otherwise generic training-profile ports with uncertain real camera path flagged**, do not assert SDI→HDMI magically); Lav1/Lav2→TX→RF paired RX→mixer compatible input; optional wired XS1 mic XLR→mixer MIC IN if specific scenario uses it; mixer's designated PROGRAM audio output→HDS7105 compatible audio input (model/revision/levels marked pending where not known); switcher Multiview designated output→TV compatible input (verify); HDS7105 HDMI Program→Magewell 32060 HDMI IN→USB 3.0 device→HP notebook USB host→OBS video capture; monitor bus to HS5 active speaker through correct mixer line output if the reference configuration actually supports it. **Instructor's specific teaching chain remains Mixer→Switcher→Capture**, not Mixer→Capture as the required Studio Program path. Distinguish named reference devices from actual owned inventory.

**Levels 1–5:** (1) camera(s) through supported/declared video source profile to switcher and correct monitoring output; preserve original known HDMI 2-cable interaction on any reused example only without changing free-practice. (2) Lav→paired wireless→RX→mixer→compatible switcher audio; optional XS1 where selected, never force wired mic without a compatible input. (3) connect available cameras and independent Multiview output, choose Program camera; (4) wrong IN/OUT, unpaired RX, occupied video input, wrong MV vs Program, missing switcher audio assignment; physically repair; (5) full logical three-camera + optional selected wired mic, wireless/mixer/PA monitor if selected + MV TV + PGM/Magewell/Notebook/OBS and Program audio present, all with actual declared and nonfabricated training port profile. [R04,R05,R08]

### 05.3 — `m` / หอคอยกระจกสลับภาพ / หอประชุมอาคารกิจกรรม

**Player job:** event audiovisual operator. **Expanded spatial layout:** clear stage front with podium and main venue display; side-stage audio area with stagebox/mic cases; front-of-house (FOH) desk well behind audience, with distinct video operator and audio control positions, multiview/program confidence monitors, production PC and capture/recorder position. Three separated SDI cameras at rear-center/left aisle/right aisle, SDI PTZ wall/stage position; aisle-edge service paths, side-wall wiring and display feed path, FOH cable rack/road cases. Player must move freely across stage, rear and both aisles and have physical access to FOH rear connectors. Do not strand equipment behind auditorium seating or obstruct exits.

**Inventory FROM APPENDIX [R02,R08,R10,R14]:** 3 × SDI cameras+tripods; 1 × SDI-output PTZ with supported controller/power; presentation laptop with HDMI→powered SDI converter; one reference-profile 8-input 3G-SDI-class switcher with sufficient independent valid Program/AUX/Multiview/USB webcam outputs as chosen; FOH multiview and confidence monitor; LED/projector display and converter/processor as required; podium mic, 2 wireless handhelds, 2 lavs plus compatible TX/RX/output channel count; analog stagebox+matching multicore **OR** Dante-compatible stagebox/console/network (choose coherent one, do not conflate them); digital mixer with independent PA and BROADCAST buses; venue active PA or amp→passive PA as selected; PC/OBS USB webcam plus recorder with an actual available dedicated output, and power/signal/network support. Optional spec examples in appendix are references only, not university inventory.

**Selected stable topology:** Cameras SDI OUT→Switcher SDI IN1/2/3; PTZ SDI→IN4; Laptop HDMI→powered HDMI→SDI→IN5. Switcher proper MV output→FOH MV monitor; dedicated Program SDI→recorder if that output and recorder chosen; AUX configured Program→active SDI→HDMI→front display/LED processor HDMI input; USB WEBCAM DEVICE→production PC USB HOST→OBS. Mic inputs→stagebox→compatible stage transport→FOH mixer; Mixer PA bus→DSP if needed→active PA or amp+passive PA; separate BROADCAST output→switcher verified compatible balanced audio inputs; assign Program audio. If chosen exact switcher port budget cannot sustain all these simultaneous branches, select a compatible explicit appendix-supported reference configuration or mark specific branch as a supported alternative, not fake an extra port. [R02,R08,R10,R14]

**Levels:** (1) three spaced SDI cameras→switcher inputs and compatible Program/confidence destination (subset acceptable); (2) podium + selected wireless sources→stagebox→FOH mixer→two intended PA/broadcast outputs with compatible input levels; (3) cameras+PTZ+slides converter, source switching, Program/MV/AUX to correct distinct displays; (4) fix unplugged SDI, wrong BNC destination, bad HDMI-to-SDI assumption without powered converter, stagebox mismatch or muted channel, switched MV/PGM feed; (5) all **selected reference-system** mandatory cameras, PTZ, slides, stagebox/mics, FOH/stream buses, PA, correct production program to display, MV, recorder, PC/OBS and ready indicators. No false automatic audio routing. [R02,R08,R10,R14]

### 05.4 — `l` / คลังผนึกพอร์ตโบราณ / พื้นที่ภายนอกอาคาร

**Player job:** outside broadcast/field technician. **Expanded spatial layout:** service unload/case zone, open event/presenter area, camera A & B at physically separate near positions, far camera C on distant side, control tent with sheltered operator switcher+field mixer+portable monitor, dedicated encode/network table, separate secured power/UPS prop area, fiber RX near tent and TX by far camera, side stage mic positions. Big open walkable geometry with visible boundary and cable ramps on any spectator/service crossing. Reels/patch locations and service paths make long runs meaningful without pointless kilometer-scale walking. Ensure player can reach backs of tent devices and walk around each camera/tripod.

**Research-selected topology [R06,R07,R09,R13,R15]:** three field SDI cameras; verified-for-format near A/B qualified 75Ω SDI; far C SDI→matched powered fiber TX→correct optical link→matched RX SDI OUT→field switcher SDI IN3; portable SDI switcher MV→compatible monitor; switcher dedicated PGM SDI→compatible analog-audio-to-SDI embedder (reference AJA 3G-AMA; exact breakout/format per manufacturer)→hardware encoder SDI IN→Ethernet↔router/uplink↔simulated ingest endpoint. Wireless presenter TX/RX plus shotgun and ambient mics to appropriate field mixer inputs; mixer separate PA bus→active venue PA or specified amp path, Broadcast L/R LINE OUT→embedder balanced inputs; perform audio embed assignment. Include RX pairing, proper format/device-ready indicators and network/ingest status. Wireless VIDEO transport is an OPTIONAL distinct research-supported alternative and must not be mandatory in selected fiber topology. Do not assert all fiber standards cross-compatible or all SDI cables reach a universal length.

**Levels:** (1) near SDI source and far camera matched powered fiber TX→RX routes to correct switcher video input, verify video; (2) paired presenter mic+shotgun/ambient→mixer correct gain/phantom-by-specific-mic, output PA and broadcast where used; (3) multi-camera switching with portable MV and correct Program output; (4) repair missing power-ready converter, reversed/mismatched fiber, SDI route, missing embedder audio assignment or encoder/network states through actual device interactions, with no unsafe live electrical handling; (5) full A/B/C near/far video + field audio PA/broadcast + audio embedder + separate MV + hardware encoder/router/uplink/simulated ingest, all ready. Streaming "network attached" alone does not equal on-air. [R06,R07,R09,R13,R15]

### 05.5 — `xl` / บัลลังก์จอมถ่ายทอด / สนามกีฬาและงานถ่ายทอดสด

**Player job:** broadcast operations technician. **Expanded spatial layout:** three **distinct connected navigable zones** — (A) representative field camera positions/main elevated view + left/right + goal/end + long-lens + mobile service station, (B) commentary desk + audience/field mic/side-audio patch area, (C) enclosed broadcast control room with multiview front wall, separated production switcher/replay/graphics/audio operator positions and technical rack aisle containing camera base stations/CCUs, video router, main and backup encoders, primary and backup network gear, recorder. Use natural service corridors to connect zones; generous aisle/access behind rack and around camera/cables; no inaccessible stadium-scale unreachable props. A condensed yet meaningful walkable representation is allowed, not an entire 1:1 stadium. Keep service patch panels and field connectors within reachable working areas; preserve visibly long conceptual fiber runs.

**Research-selected equipment [R03,R09,R16,R17]:** 6 × broadcast-capable camera systems with matched transport/CCU/base stations; 6 × compatible camera optical links; explicit SDI router with >= required actual port capacity (reference Videohub 20x20 12G is example); large production SDI switcher with >= required distinct inputs/outputs (reference ATEM 2 M/E Constellation 4K is example); replay server VIDEO OUT plus replay controller CONTROL, graphics workstation compatible video out and converter only if required; multiview wall, venue display with appropriate processor; 2 commentator mics, crowd L/R, field mic, presenter wireless TX/RX; compatible audio stagebox/transport and digital broadcast console with separate venue PA and Broadcast buses; intercom/talkback headsets and tally/control using modeled matching paths; recorder/storage; Main and Backup hardware encoders; two independent program feeds via actual distinct outputs or **active distribution** if exact chosen device allows; primary and genuinely separate backup network path when claimed. Include managed/safe power-ready props only, not actual dangerous wiring.

**Canonical:** Cam 1..6→matched camera-fiber base/CCU 1..6→individual SDI router IN 1..6. Replay SDI source→Router IN7; graphics compatible SDI source→Router IN8 (powered HDMI→SDI if source only outputs HDMI). Configure router crosspoints outputs 1..8→switcher inputs 1..8; select/cut/dissolve proper Program; Multiview→wall, AUX configured venue feed→appropriate screen/processor, independent Program1→Main Encoder, proper independent Program2/AUX-configured→Backup Encoder, distinct recorder output if required by selected model. Audio mic→compatible stagebox→console; venue PA bus→venue PA chain, broadcast bus→switcher matching balanced analog input **OR** proper audio embedder, never both unconfigured or XLR falsely assumed on a switcher that only has balanced 1/4-inch analog inputs. Final Program embedded audio must reach Main and Backup. Configure supported tally/intercom path separately from mere program SDI, and explicit recorder and streaming ingest simulation. Backup labeled FULL only if primary and backup do not share a single required link/failure domain; otherwise label PARTIAL (and completion expectation must match actual selected training profile). [R03,R09,R15,R16,R17]

**Levels:** (1) six camera feed systems progressively install & route through CCU/router/switcher into Program/MV as stage-specific manageable subset, require correct active source; (2) commentary/crowd/field/presenter→console and two mix buses/compatible program audio path; (3) router crosspoint assignments, switcher inputs, replay/graphics source video, proper Program/Preview/MV/AUX selections and control-vs-video distinction; (4) correct missing fiber feed, wrong crosspoint, audio embed/console routing, replay/graphics source, absent tally/intercom, disconnected main/backup, fake Y-split or common network failure point; fault subset should be pedagogically focused and physically fixable; (5) **all research-defined mandatory broadcast system:** 6 valid camera fiber/CCU links, 8 routed source feeds including replay/graphics, switcher Program, actual final Broadcast audio on main/backup output, venue PA, multiview and venue display, valid tally/intercom/control if required by selected training profile, recording active, Main Encoder→Primary Network→simulated ingest, Backup Encoder→independent Backup Network→backup ingest or accurately marked partial if independence cannot be provided. Each mandatory graph leg and state must be player-completed, not decorative. [R03,R09,R15,R16,R17]

---

## 06 — CLEAR EQUIPMENT PLACEMENT AND CABLE/INTERACTION REQUIREMENTS FOR EVERY LEVEL

- Every Level 1–5 shares the same **enlarged** venue footprint but has a separately defined `activeEquipment`, `requiredRoutes`, `optionalRoutes`, `storageStock`, `initialFaults`, `objectives`, `readyStates`. Don't duplicate huge 3D scenes for each sublevel.
- Each room's gear is visually and functionally distinguishable. Do not copy HDS7105, Magewell, Yamaha HS5 or Samsung TV into XS/M/L/XL just because they were considered for S; reuse general **standards** where applicable, not the same main hardware everywhere.
- All inventory line items in Appendix A become either: `requiredInteractive` with a real completion role, `optionalInteractive` for an allowed alternative, or `environmentOnly` (tripod, road case, signage etc.), and are shown accordingly. No random extra real-brand equipment. Power/UPS readiness props can be interactable non-hazardous status tasks only; never simulate working on live high voltage.
- The player must see and be able to access **the complete physical inventory for the active level**, not a catalog-only item or floating name. Every selected cable end, adapter, converter, microphone, receiver, display, capture/stream device and required processing or distribution node must exist as a world object (or as a sensible fixed built-in/rack/patch-panel object) with the exact logical identity used by scenario data. Store the stock in trays/shelves/road cases and install it at a realistic operating location. At Level 5 this means all mandatory gear for the complete selected venue topology is physically present and usable. No missing accessory can be silently inferred or auto-connected.
- Inventory must include correctly typed link accessories and adequate stock, not just the headline devices: each required HDMI, qualified 75Ω SDI/BNC, compatible analog audio, USB DEVICE-to-HOST, proper Ethernet, matched fiber TX/RX and fiber cable, converter/embedded-audio breakout and patching/control components used by the canonical graph. Derive **counts, exact ends and required output capacity** from the graph and add clearly optional labeled spares only where useful; never invent pinouts/port counts, proprietary protocols or compatibility. Do not put large fixed devices on a tiny carry table.
- Placements must reflect technician workflow: entry→brief→inventory/staging→equipment's final source point→control→monitor/end destination→repair if necessary. Make necessary device rear ports reachable. Every camera position has operator access. Allow sensible fixed/semi-fixed gear to stay mounted/racked; do not demand carrying a large wall, mixer desk or rack.
- Build physical route guides (walls, cable tray, FOH side-aisle, outside ramp, rack patch path), endpoint indicators and correct cable reels/patch adapters from appendix. For very long runs require the player to install/route through accessible patch endpoints or converters; preserve educational topology instead of forcing physically absurd continuous dragging in a huge environment.
- AV cable UI displays directional port labels and connector type (e.g., `HDMI OUT`, `SDI IN`, `XLR MIC IN`, `USB WEBCAM DEVICE`, `USB HOST`); bus/network/wireless functions are separate interactions. Do not invent every vendor's back-panel coordinates: Generic Training Model anchors pending real 3D modeling.
- On wrong connection preserve held cable/endpoint and inventory; show reason in concise Thai, e.g. `ต้องต่อ OUTPUT ไปยัง INPUT`, `HDMI ต่อเข้าพอร์ต SDI โดยตรงไม่ได้ ต้องใช้อุปกรณ์แปลงสัญญาณ`, `ต้องจับคู่ TX/RX ก่อน`, `พอร์ตนี้รับ Line ไม่ใช่ Mic`, `สัญญาณที่ส่งให้จอผู้ชมต้องเป็น Program ไม่ใช่ Multiview`, `ยังไม่มีเสียง Program`, `อินเทอร์เน็ตเชื่อมต่อ แต่ปลายทางยังไม่ได้รับสตรีม`.

---

## 06A — ADDITIONAL OWNER DIRECTIVE: COMPLETE PHYSICAL INVENTORY IN ALL FIVE ROOMS

**This directive is additive to sections 00–06, NOT a request to rewrite their technical graphs.** The user wants the room to feel stocked and ready for a real installation job: every equipment *type actually used by that venue's selected route* must be visible, stored at a realistic table/case/shelf or installed at its proper station, and usable in the hands-on gameplay. The full level (Level 5) must have ALL mandatory equipment and cables physically present. Do not equate "inventory exists in a sidebar" with a 3D training object.

### 06A.1 — One-to-one equipment, inventory, graph and world reconciliation

For every mission venue and level, derive the authoritative `requiredBillOfMaterials` **from Appendix A's selected canonical graph and the actual supported port profile**:

1. Enumerate every physical source, processor/router/switcher, amplifier/active monitor, stagebox/converter/embedder, monitor/display, capture/host/encoder/recorder, network endpoint and selected safe power-readiness prop used by that graph. Include RF TX and RX as separate tangible devices; pair by logical action without inventing an RF cable. Include actual microphones, not just "wireless system" as one abstract box. Keep replay controller/control distinct from replay video source; keep CCU/base and each camera transport distinct.
2. For EVERY required wired edge, create a specific typed cable or patch/connector item, two compatible endpoint port definitions, an achievable installation/connection task and a visible installed cable or service-path representation. A USB webcam/Capture Device needs an actual compatible USB cable/connection and host port. HDMI-to-SDI requires active direction-correct converter **as a real world object** plus upstream/downstream cables and safe ready state. SDI↔fiber requires distinct matched powered TX and RX and supported fiber link. Embedded audio requires a real supported embedder/audio destination and assigned audio state. Main/backup feeds need independently supported outputs or source-supported active distribution, never a passive BNC Y-split.
3. For every physical equipment record choose exactly one `requiredInteractive`, `optionalInteractive`, `fixedInteractive` or `environmentOnly`, plus `spawnZone`, `installedZone`, `physicalPlaceholderId`, `ports`, `serviceSide`, `levelAvailability`, `referenceIds` and `modelStatus`. `environmentOnly` cannot secretly satisfy a mandatory signal route.
4. Compute `requiredStock[deviceType/cableType/connectorEnd]` from the actual graph including parallel paths and channel quantities; display the matching stock in organized world-space storage. If references do not establish a numerical connector count or a particular accessory/amp/processor, do not manufacture it. Choose a documented generic training profile consistent with the source or flag that edge `UNRESOLVED`, explain and avoid a dishonest completion predicate.
5. Keep optional branches, genuine spare cables, unused cabinet stock and decorative gear separate from the mandatory graph. Extra props must not crowd service aisles or cause misleading "missing connection" messages. Full room can visually appear equipped without making every decorative object a compulsory exercise.
6. Every complete-path requirement needs both `placed/installed` and `wired/paired/configured` state. Devices initially in transport cases must not count as already commissioned. A fixed display, PA, rack or stagebox may already be installed but its signal/configuration and readiness still need the explicit player action where required.
7. Never auto-satisfy an edge because two devices are near each other or merely appear on a table. All level prerequisites and result states are derived from the actual graph + logical readiness, not `numberOfItemsShown`, `connectedCount >= N`, an auto-checking UI list or a prerecorded success animation.

### 06A.2 — Required table, rack, work surface and storage layout

Build real-looking **surfaces with visual organized objects on/inside them**: not a flat empty floor with text labels. Use game-ready placeholder meshes, visible drawers/trays/road cases, accessible rear/side ports and readable equipment names. Show obvious item silhouettes: camera on tripod/mic case, switcher console, small mixer with input bank, converter with IN/OUT faces, receiver with antenna, coiled typed cables with separate endpoints, portable encoder/network unit, stagebox, rack servers. Port anchors must be on the right side of those individual placeholders, NOT one generic port floating on the floor. Do not imply a cable can connect to a prop without a port.

Store equipment in a plausible *starting state* (portable equipment in storage and fixed/semi-fixed installed), then let the player carry/place necessary portable items on marked but flexible realistic installation zones. Avoid one magical center table in all five environments. At the job station, arrange devices to tell a meaningful flow from source/receivers to routing, program, capture/encoder and destination without hiding ports or crossing player movement.

| Venue | Storage / staging (always visible and reachable) | Proper operating surfaces and positions | Do NOT do this |
|---|---|---|---|
| **XS Classroom** | Rear-side AV cabinet: labeled HDMI and USB bins, correct compatible analog-audio leads, small microphone/TX/RX tray, camera/tripod shelf, mini switcher/capture accessories only if in the **selected** configuration | Front teacher desk with slides laptop; rear-center camera tripod position; rear-side technician desk with mini switcher, small mixer + RX and streaming notebook/host; front wall TV/projector; active PA speaker at front/appropriate front side | No HDS7105 or imaginary external capture when the selected mini switcher provides USB webcam. Do not put all devices on the teacher desk |
| **S Mission Studio (separate from free practice)** | Left long cable table: counted HDMI and compatible verified-profile audio/USB cables, organized coils + adapters actually selected; right long equipment table: wireless lavs/TX/RX, XS1 if selected, Magewell and portable accessories | Three separated camera + tripod stations facing presenter/green screen; spacious 360-degree-access production desk: mixer on operator-left, receiver next to mixer, HDS7105 centrally, Magewell between switcher and HP notebook at operator-right; monitor TV wall and HS5 monitor at listening position; lights remain outside walking aisles | Do not resize/change the separate free-practice Studio Room 01. Do not treat optional XS1/HS5 as mandatory when not selected or claim camera cable type/revision verified without source |
| **M Auditorium** | Rear/side FOH video road case + labeled SDI/HDMI-converter/USB patch tray; distinct FOH audio cable rack; side-stage mic case with podium/wireless microphones and cables | Rear-center FOH video desk with SDI switcher, MV + confidence monitors, converter where technician can wire it, dedicated recorder/capture/OBS PC station; adjacent separate FOH digital-mixer position; side-stage stagebox/mic patch; cameras at rear and distinct left/right aisles, PTZ fixed near stage, front program display and PA correctly distributed | No fictional stagebox single RJ45 carrying analog audio by magic. Do not require moving the wall display, stagebox rack or FOH console like a handheld item |
| **L Outdoor** | Service/unload field road cases: camera/tripod case, 75Ω SDI reels, XLR/audio bins, matched fiber case with TX/RX and real fiber coil, portable converter/encoder kits; wireless microphone case | Distinct near camera A/B positions, far camera C + fiber TX by source; RX at control tent; tent operator desk holds field switcher, portable monitor, field mixer + receiver; adjacent separately labeled encode/network surface holds **actual embedder**, hardware encoder, router/uplink device; safe power readiness props in protected separate area; microphones at presenter, stage and audience positions; active PA at venue position | No SDI plug straight into bare fiber or mixer analog audio straight into SDI encoder. Do not place fiber RX next to TX to conceal long-distance concept |
| **XL Stadium/Broadcast** | Field technical patch/camera transport cases; commentary mic/headset/patch storage; broadcast control technical patch racks and organized fiber/SDI/XLR/appropriate control and network cable trays (not a tiny classroom table) | Clearly separated, connected field camera points; commentary audio station; broadcast control room: production switcher console facing multiview wall, replay desk/controller + real server source, graphics desk/source, digital-audio desk, camera base/CCU rack, video-router rack, distinct recorder/storage, Main/Backup encoder racks and distinct Primary/Backup network endpoints; venue screen and PA correctly placed | No direct camera HDMI→switcher shortcuts, fake router without crosspoints, passive BNC split for redundancy, "backup" on the same unavoidable single network path, or all big gear scattered on the stadium floor |

All 5 stages of each venue reuse their venue layout. Level 1–4 expose only the current stage's actual required/optional equipment as active interactive stock (unneeded fixtures can remain visibly installed as neutral background without clutter or completion requirements); Level 5 exposes the entire mandatory selected venue system. Never require physically carrying a wall display, giant rack, venue speaker array or fixed stage infrastructure.

### 06A.3 — Specific complete-equipment edge checklist by venue (must be implemented, not just documented)

Use this as a cross-check against Appendix A, **not as permission to invent a manufacturer or incompatible port**:

**XS / full classroom:** installed front TV/projector and suitable active PA; camera+tripod, teacher presentation laptop, mini HDMI switcher with documented necessary HDMI inputs/Program output AND selected USB webcam device role, wireless lav→TX + RX, small mixer with independently usable PA and stream audio buses in chosen reference profile, streaming notebook USB HOST+OBS. Physical items include every required HDMI run to switcher and display, lav-to-bodypack cable (if selected plug-in lav), correct RX→mixer analog lead, speaker feed and mixer stream-feed, webcam-capable USB data cable/device-to-host connection. Speaker, room display, laptop and actual host ports must exist in world-space. If chosen real/reference switcher or mixer cannot support separate simultaneous paths, select a coherent generic source-supported training profile or mark the unresolved requirement, rather than adding arbitrary jacks. [R01,R04,R10,R11]

**S / full mission studio:** three correctly represented camera sources at tripod points and actual declared video transport; switcher HDS7105 mission-side profile; lav microphones, both TX units, paired RX; mixer; selected XV/XS1 wired mic only if the authored level intentionally uses it; wall MV monitor; selected Yamaha HS5 monitor branch only if supported by mixer bus; PGM HDMI→physical Magewell 32060 HDMI IN→USB 3.0 cable→HP notebook USB HOST→OBS source. Put each camera cable, audio lead, TV HDMI, PGM HDMI and capture-to-host USB on the relevant tray/cable table. Never state that the studio gear photographed by owner necessarily includes the selected Magewell/Samsung/Yamaha reference models. Do not alter studio free-practice instance. [R04,R05,R08]

**M / full auditorium:** distinct three SDI camera/tripod stations, SDI PTZ/compatible control path, teacher/event slide laptop with real powered HDMI→SDI converter and both matching sides' cables; FOH video switcher with supported input/output budget, two distinctly labeled appropriate monitor destinations (as actually selected), proper AUX/program route to stage screen via real SDI→HDMI converter and/or selected supported processor, actual recorder/capture path and production PC USB host/OBS if chosen. Podium mic, selected handheld and lav wireless TX/RX with enough actual audio channels, chosen matching stagebox+multicore OR fully specified Dante-capable link (not invented Ethernet stagebox), FOH digital console with distinct PA and Broadcast mixes, proper PA chain (active or amp→passive), proper Broadcast audio insert/embed/mixer-to-switcher input path. Put every SDI, HDMI patch, source converter, XLR, stagebox transport, output lead, recorder path and USB data cable needed by THIS graph in real road cases/racks. [R02,R08,R10,R14]

**L / full outdoor:** near field cams A/B and qualified SDI cables; far C, proper SDI patch→matched powered fiber TX, chosen fiber link and matched fiber RX→SDI patch to switcher; portable multiview monitor fed by the correct MV port and physical cable; stage/presenter wireless pair, actual shotgun/ambient microphones and suitable XLR leads to field mixer; separate PA feed and Broadcast L/R line leads to **actual analog-to-SDI audio embedder**, video PGM SDI cable into embedder and embedded SDI cable into physical hardware encoder; correct Ethernet patch from encoder to router/uplink and logical simulated ingest. House matching SDI/fiber converter power-ready controls, cables, ramps and clearly located source/control/service anchors; wireless video optional branch must not be silently required. [R06,R07,R09,R13,R15]

**XL / full stadium:** 6 real world-space broadcast camera placeholders at separated positions, 6 matched camera transport systems and fiber patch points/cables, 6 base station/CCU logical endpoints/rack units, router with at least the justified selected distinct SDI ports and actual patch cable stock; real replay server VIDEO source + separately operated replay controller, graphics workstation VIDEO source + the necessary supported active format converter if its selected output requires conversion; production switcher, independent MV and venue/AUX outputs, correct program recording/storage path, 2 commentary mics, crowd L/R, field and wireless presenter mic and compatible physical audio transport + stagebox/console, separate venue PA and Program Audio buses, explicit actual embedded/matched program-audio path. Include tally/intercom headsets/control where selected graph mandates; Main Encoder physical feed + Primary network route and Backup Encoder physical feed + independently modeled Backup network route; two verified outputs or properly supported active distribution. Display/recorder/encoder/network endpoint READY state needs physical/logical linkage, not decorative cards. Put audio/headset items at commentary, fiber/SDI at field patch/technical rack, routing/CCU at rack, switcher/replay/graphics at operator desks, encoder/recorder in dedicated tech rack; no massive equipment pile. [R03,R09,R15,R16,R17]

### 06A.4 — Inventory reconciliation and placement deliverable (must be inspectable in code + docs)

Maintain ONE scenario data source of truth and produce a per-venue/per-level matrix whose columns are: `requiredNodeId`, `ThaiLabel`, `type`, `source status/reference ID`, `world asset/placeholder`, `storedAt`, `installedAt`, `fixed/movable`, `ports/end roles`, `neededInLevels`, `required wired or logical edges`, `required cable/patch item(s)`, `spare/optional`, `required completion condition`. A required node with no rendered/interactable object, inaccessible port, incompatible stock or destination = **INCOMPLETE IMPLEMENTATION**; do not describe it as finished. No cable that exists solely in narrative/UI; no ghost devices automatically routing signals. On the fifth level, all mandatory rows become active/relevant and must have a valid role in the final graph.

## 06B — ADDITIONAL OWNER DIRECTIVE: NORMAL, SMOOTH GAMEPLAY IN ALL FIVE LARGE VENUES

The user explicitly requests **all five environments to feel responsive, smooth and normal to navigate**, despite increased area and complete equipment. Performance and ergonomics are implementation requirements; **do not achieve performance by removing any mandatory gear, legitimate cable edge, or mission completion requirement.** Optimize its representation and load timing instead.

### 06B.1 — Shared performant implementation

- Keep the existing Next.js / React Three Fiber / Rapier / Zustand architecture; no extra engine, paid package or major dependency jump. Preserve existing working movement/port mechanics with backward-compatible mission-only extensions.
- **Only mount the active venue + active level's interactable graph**. Do not mount all five environments, all 25 inventories, invisible 3D assets or off-route distant props at once. Unneeded fixtures may be static merged/instanced scenery only where visually useful and not mission-critical.
- Use simple static architecture/furniture meshes with merged draw calls/geometry/instancing for repeated audience chairs, lights, rail/stands, stage panels, rack cabinets and coiled cable props. Keep mission-critical interactive device placeholders separate, with stable IDs and accessible port anchors; do NOT merge away usable ports.
- Prefer baked/static lighting, modest sensible shadow casters, compressed/reused materials and lower-poly placeholder geometry. Avoid dozens of realtime casting lights, unnecessary dynamic high-resolution shadow maps, heavy transparent overlays and always-on postprocessing. Prevent unnecessary textures/assets from loading in the initial scene.
- Use a conservative, device-aware render pixel-ratio cap/adaptive setting rather than unbounded full device DPR. Preserve legible world port labels and sharp core UI; reduce decorative details first if the device is slow.
- Rapier: fixed/simple static colliders for floor/walls/tables/racks, no physics simulation for decorative chairs or static cables, no dynamic rigidbody per coiled cable/individual connector. Keep active moving interactables limited to current-level movable gear. Disable unnecessary colliders and continuously active sensors from distant/inactive objects.
- Avoid per-frame React setState/Zustand updates for movement, hover, cable animation and signal status. Use existing imperative refs/frame loops appropriately, memoize stable geometry/data/cable paths and subscribe to granular store slices. Recompute graph/mission completion on relevant **connection/state transitions**, not on every rendered frame.
- Reuse lightweight cable route meshes, update geometry only on connect/disconnect/re-route, cap cable curves' segment counts according to visible distance and importance, and use service-route/patch indicators for long auditorium/outdoor/stadium links without losing source→destination traceability.
- Avoid hundreds of always-visible DOM `<Html>` labels. Show essential nearby labels/port names when in interaction distance, with lightweight distance/visibility checks; keep room/mission HUD responsive and panel scroll confined to UI, not a world-size overlay blocking movement.
- Use culling and sensible LOD/proxy detail for distant field/stadium structures. Load/reveal heavy room subzones progressively where architecture permits, without a fake teleport or deactivating mission equipment that the player must reach. Retain unique meaningful source points and walkway landmarks.
- Ensure correct cleanup on level changes: dispose/remove mission-only geometries/event handlers, release pointer lock as expected, clear carried cables and per-level transient state safely; avoid accumulated duplicate scene meshes, physics objects, listeners, shader materials, stale signal connections or duplicate prompts on revisiting missions. Do not erase saved valid progression.

### 06B.2 — Navigation and interaction ergonomics

- Make the floor/room/venue bounds, visual model bounds and collision geometry agree; enlarge all mission-only venues cohesively instead of just applying an arbitrary scale to the floor. Keep player speed/eye height natural; adjust accessible door sizes, aisles and service clearance so even long XL technical racks can be approached from their intended side.
- Every required node, cable case and port must have a planned reachable interaction point. Prioritize player access behind switchers, sides of laptops, mixer output bank, stagebox rear, converter ends, TV/display-side patch panels, field fiber TX/RX and technical rack front/rear as appropriate. Fixed displays can use a reachable service/patch panel reflecting the actual route instead of an impossible high wall port.
- Prevent colliders on decorative cases/stands from trapping the player. Put the player spawn in a safe open zone, avoid props spawning inside the player, ensure all major workzones connect through clear walkways, and never place required devices behind locked/unreachable scenery.
- In the large M/L/XL maps, expose clear Thai zone signage and subtle navigation cues (`คลังอุปกรณ์`, `โต๊ะควบคุม`, `จุดกล้อง`, `ข้างเวที`, `จุดส่งสัญญาณ`, `ตู้ Rack`, `จุดสตรีม`) without turning the game into a click-the-label checklist. Use meaningful logical patch points/cable reels to make long transport playable without sprinting unrealistically far for each single cable end.
- Keep pickup/place/E/F/ESC feedback immediate, selection states unambiguous, and pointer-lock lifecycle safe when opening/closing an inspect card. Correct disconnection should free an occupied port and return cable/item state predictably. Wrong attempts must never lose a cable, freeze the player or result in a UI state that cannot close.
- Preserve sensible z-order and scrolling for optional side information cards. On smaller screens, let the viewport remain useful and the side panels collapse instead of hiding the 3D scene behind multiple huge fixed columns.

### 06B.3 — Performance goal and honest reporting

- Treat smooth first-person desktop interaction (aiming for ~60 FPS on an ordinary modern desktop where feasible, with adaptive quality for slower hardware) as a **design target, not a measured guarantee**. Do not invent measured FPS, load times, collision pass rates or claim every room is bug-free.
- No gameplay tests, automated scenario solves, browser playthroughs or runtime QA in THIS task, as already specified by the owner. You may reason about and document critical paths statically while implementing, and use normal code hygiene without claiming verified playability. Preserve existing tests. Any actual `25/25 playable`, FPS or collision claims must wait for a separately approved QA milestone.
- Document likely scene performance risks and optimizations in `docs/MISSION_HALL_PERFORMANCE_AND_ACCESSIBILITY.md`, including scene loading plan, LOD/static vs interactive split, per-venue geometry/collider policy, cable rendering policy, device/event cleanup and known unverified spots. Record changes accurately; do not replace runtime findings with assumptions.

## 06C — COMPLETION / HANDOFF REFINEMENT FOR THIS ADDENDUM

Alongside section 07 documents, create/update:

- `docs/MISSION_HALL_EQUIPMENT_PLACEMENT_AND_STOCK.md`: full tables for **all five venues and 25 level configurations**, mapping equipment and exact required cable stock to physically present racks/tables/cases/positions, active availability, service-facing ports and modeled signal edges; calculate quantities from canonical graph, mark anything blocked by missing manufacturer proof `UNRESOLVED`. Each Level 5 must cover every mandatory selected reference-system piece.
- `docs/MISSION_HALL_PERFORMANCE_AND_ACCESSIBILITY.md`: all 5 scenes' render strategy, safe collider strategy, connected workzone/walkway plan, UI/label visibility policy, mission-level mount/unmount handling, perf risks and explicit `NOT RUNTIME TESTED` status.
- Extend the final Thai report with: `การวางอุปกรณ์และสายครบในฉาก (แยกห้อง)`, `อุปกรณ์ที่เก็บไว้บนโต๊ะ/ชั้น/เคสและจุดติดตั้งจริง`, `จำนวนสายที่ได้จาก Required Graph`, `ความลื่นไหลและมาตรการประสิทธิภาพ (ยังไม่วัด FPS)`, `ข้อจำกัดที่ยังไม่ได้ตรวจด้วยการเล่น`.

**Priority when working:** (1) source-constrained correct signal graph and all required physical in-world items, (2) ergonomically organized technician stations and functional cable stock, (3) reachable enlarged mission-only layouts, (4) faithful first-person 3D connection gameplay and completion, (5) scene optimization, cleanup and clear Thai learning UI, (6) honest docs. Keep the existing original five cards × five practical levels; keep the separate free-practice studio untouched; defer final sculpted models; no gameplay QA in this round.

---

## 07 — DOCUMENTATION, EXACT TECHNICAL TRACEABILITY AND FINAL MODEL-SCULPT HANDOFF

Create/update **mission-only** docs:

1. `docs/MISSION_HALL_5_CHAPTERS_25_LEVELS.md`: full 25 rows, room name, level, short Thai job, required/optional/environment-only equipment, canonical graph, exact port/connector/signal roles as supported, cable quantities **calculated from graph**, software/operator steps, starting faults, completion predicate, relevant `[R##]` refs and `DESIGN_REFERENCE/PROVISIONAL/UNKNOWN` labels.
2. `docs/MISSION_HALL_VENUE_LAYOUTS.md`: five expanded playable venue descriptions, coordinates as **virtual design choices** not field measurements, walkways, staging, cable rooms, stage/control/PA/stream/record, all required port clearance and route guides.
3. `docs/MISSION_EQUIPMENT_MODELING_BACKLOG.md`: detailed category/ID, asset placeholder, necessary physical reference photos/spec still needed, scale source status, visible required front/back/side ports, port-to-game anchor mapping; label final sculpt `NOT STARTED` and never present placeholders as verified replicas.
4. `docs/MISSION_SIGNAL_FLOW_SOURCE_MATRIX.md`: each graph node/edge/format and corresponding exact Appendix A section/[R##], plus unresolved gaps. No claim that citations establish the specific university gear.
5. Update `docs/ETCSTREAM_PROJECT_STATE.md`/`docs/EQUIPMENT_INVENTORY.md` only as needed, respecting project docs and recording protected free-practice as unchanged.
6. Preserve existing tests and no runtime pass claims. Do not modify unrelated docs.

Implement code/data first, then docs accurately reflecting it. Do not stop at a proposal or just create documentation. Do not make all room equipment statically ready by default. If exact compatibility cannot be established from source+repo, mark specific port/edge **UNRESOLVED** and do not invent it; explain in report. Future authentic 3D models should be drop-in replacements without changing the canonical mission connection graphs.

---

## 08 — ACCEPTANCE BY INSPECTION ONLY IN THIS MILESTONE (NOT TEST CLAIMS)

Expected implementation inventory (do not claim verified/playtested):

- The original mission five cards and five nested per-card lessons are restored; old free-practice remains untouched.
- Five mission-only larger, distinguishable, practical 3D venue environments, all critical operating zones and corners reachable by design; no cramped central equipment pile or giant empty white floor.
- Physical in-world equipment and counted real cable/patch/converter stock for every selected required connection, organized across distinct service desks, tables, cabinets, road cases and racks; Level 5 fully stocked, with no ghost graph nodes.
- Performance-conscious active-level asset loading, efficient static scenery/colliders, readable nearby-only 3D labels, cleanup on room transitions, and roomy interaction clearance. These are implementation/inspection goals, **NOT** an unmeasured claim of verified FPS or bug-free play.
- 25 authored scenario configurations with progressing equipment, clear correct port-to-port and wireless/configuration path, physically interactable anchors and completion conditions; fifth level of each room uses the complete selected reference topology.
- Source-constrained Thai equipment knowledge, equipment-port roles, converter and processing nodes, PA vs Broadcast audio, Program vs MV, proper USB and matched fiber, live/record endpoint readiness.
- User can potentially pick/place/connect/repair via original controls (implementation present, NOT runtime tested yet); mission state derives from graph, not self-ticking goals.
- Exact referenced source matrix and a separate future real-model sculpt backlog.

Do not run automated tests, auto-solvers, browser QA or manual playthrough. No implicit claim `25/25 PASS`; runtime status remains `NOT TESTED` until the owner authorizes QA later. Do not commit/push. No added spending/paid services.

---

## 09 — FINAL REPORT IN THAI

Use these headings with concise real status and exact files:

- `สถานะงานและขอบเขตที่แก้`
- `ยืนยันว่ารักษาห้องฝึกอิสระเดิม`
- `คืนหน้าหอจารึกและการ์ด 5 ห้อง × 5 ด่าน`
- `ขนาดฉากและการเดินได้ทุกมุม (แยก 5 ห้อง)`
- `จุดอุปกรณ์และการเดินสายตามงานจริง`
- `อุปกรณ์ทุกชนิดที่อยู่ในฉาก / จุดโต๊ะ ชั้น เคส Rack และจำนวนสายครบตามกราฟ`
- `การจัด Performance และการคืนทรัพยากรเมื่อเปลี่ยนห้อง (ยังไม่ทดสอบ runtime)`
- `อุปกรณ์ที่เพิ่ม / ไม่เพิ่ม เพราะไม่มีหลักฐาน`
- `ผังการต่อและเงื่อนไขผ่านด่าน 1–5 ของแต่ละห้อง`
- `องค์ประกอบ 3D ชั่วคราวและงานโมเดลจริงที่รอปั้น`
- `ข้อมูลอ้างอิง [R01]–[R17] / ข้อมูลยังไม่ยืนยัน`
- `ไฟล์ที่เพิ่ม / แก้ไข`
- `ปัญหาและข้อจำกัดที่เหลือ`
- `สถานะการทดสอบ: NOT TESTED / NOT PLAYTESTED`

Remember: **RESEARCH-LOCKED ENGINEERING; ORIGINAL 5 × 5 FIRST-PERSON GAMEPLAY; SPACIOUS MISSION-ONLY VENUES; MODEL SCULPTING LATER; PROTECT FREE PRACTICE.**

---

# APPENDIX A — COMPLETE ORIGINAL THAI RESEARCH; TECHNICAL SOURCE OF TRUTH

This appendix is included verbatim for self-contained execution. `[R01]–[R17]` are the referenced manufacturer/official guides and specifications. Only these data and the current repository's already verified working details may justify technical equipment and port behavior. The selected signal topologies are `DESIGN_REFERENCE`, not a claim about the university's installed hardware. The room size/walkability and presentation requirements above are **user-directed game design choices**, not external equipment facts.

# ETCSTREAM — ข้อมูลอุปกรณ์และหลักการต่อระบบ AV / Live Production แยกตามสถานที่ (ฉบับข้อมูลล้วน)

**ปรับปรุงข้อมูล:** 11 ตุลาคม 2026  
**ประเภทเอกสาร:** ข้อมูลอ้างอิงข้อความล้วน (ไม่มีรูปภาพ) สำหรับอุปกรณ์ พอร์ต สาย และ Signal Graph ของเกม ไม่ใช่รายการครุภัณฑ์ที่ยืนยันว่ามหาวิทยาลัยมีจริง  
**ข้อจำกัด:** **ไม่แก้ / รื้อ / ทับระบบห้องสตูดิโอที่พัฒนาอยู่**; ส่วนห้องสตูดิโอเป็นข้อมูลอธิบายและจุดตรวจยืนยันเท่านั้น  
**สถานะข้อมูล:** `VERIFIED_SPEC` = คุณสมบัติของรุ่นตัวอย่างที่อ้างอิงจากเอกสารผู้ผลิต; `DESIGN_REFERENCE` = ผังตัวอย่างที่ออกแบบให้เหมาะกับสถานที่; `PROVISIONAL` = รอตรวจของจริง; `UNKNOWN` = ยังไม่มีหลักฐาน

> ระบบ AV ใช้หลาย topology ได้ ไม่ใช่มีผังถูกเพียงผังเดียว ผังในเอกสารนี้เป็น **เส้นทางตัวอย่างสำหรับใช้เป็นข้อมูลประกอบเกม** ที่ออกแบบให้ครบอุปกรณ์และสอดคล้องกับการทำงานจริง ต้องตรวจ exact port ของรุ่นที่ใส่เกมก่อนล็อก interaction anchor

## A. กฎทางเทคนิคที่ใช้ทุกสถานที่

1. **แยก Signal เป็นประเภท:** Video (HDMI / SDI), Analog Audio (Mic/Line), Embedded Audio (ใน HDMI/SDI), USB (host ↔ device), IP/Network (สื่อสารสองทาง), Optical/Fiber (ต้องตรง transceiver/protocol), Control/Tally/Intercom, Power. กฎ `OUTPUT → INPUT` ใช้กับพอร์ต AV แบบทิศทางเดียว อย่าเอาไปตัดสิน USB/Network/Fiber/Power แบบเหมารวม
2. **หัวต่อหน้าตาเหมือนกันไม่ได้แปลว่าข้อมูลเข้ากัน:** SDI ผ่าน BNC 75 Ω ไม่เท่ากับ BNC ของ reference/timecode/MADI; RJ45 ไม่เท่ากับ Dante/NDI/Internet โดยอัตโนมัติ; USB-C ต้องแยก Host/Device/Webcam/Power/Control; 3.5 mm Mic กับ 3.5 mm Line ต้องตรวจระดับสัญญาณ; HDMI ≠ SDI โดยไม่ใช้ active converter [R03,R05,R07,R08]
3. **กำหนด format สำหรับแต่ละระบบ:** ใช้ baseline 1080p50 หรือ 1080p59.94/60 **เลือกหนึ่งค่าให้ตรงกัน** (ไม่ใช่ทุกตัวรองรับทุก format); 3G-SDI สามารถใช้กับ 1080p50/59.94/60 เมื่ออุปกรณ์และ Level A/B เข้ากัน; 4K ต้องตรวจ 6G/12G-SDI และสเปกอุปกรณ์จริง [R02,R08]
4. **Video vs Program vs Multiview:** `Camera Output` เป็น input source; `Switcher Program Out` เป็นภาพที่ส่งรายการ; `Multiview Out` เป็นภาพตารางช่วยผู้ควบคุม **ไม่ใช้แทน Program สำหรับผู้ชม**; `Preview` ไม่เท่ากับ Program; `AUX` จะส่งอะไรขึ้นกับการตั้งค่า routing [R01,R02]
5. **เสียง:** Mic → Preamp/Mixer (ปรับ gain, mix) → เส้นทางเสียงปลายทาง; Passive speaker ต้องมี power amplifier ในเส้นทาง ส่วน Active speaker มี amplifier ในตัว; Phantom +48V ใช้เมื่อไมค์ที่ต่ออยู่ต้องการ ห้ามเปิดเป็นคำตอบสำหรับไมค์ทุกตัว [R10,R11]
6. **Broadcast Mix กับ PA/FOH Mix:** งานที่มีคนอยู่ในสถานที่ควรมี output/bus แยกสำหรับลำโพงห้อง/เวที และสำหรับสตรีม เนื่องจากสมดุลเสียงและเสียงจากพื้นที่จริงต่างกัน อย่านำ FOH mix ไปเป็นสตรีมเสมอโดยไม่พิจารณา [R10,R12]
7. **การรวมภาพเสียง:** ออก program ที่มี embedded audio จาก switcher หรือใช้ audio embedder ที่รองรับจริงก่อน capture/encoder; หลีกเลี่ยงการจับ audio ซ้ำจาก HDMI และ desktop/USB input พร้อมกันจนเกิด echo. ตรวจ audio meter ที่ OBS และตรวจ sync จริงก่อน on-air [R04,R06,R13]
8. **ระยะสาย SDI:** ไม่ใส่กฎเหมารวมว่า SDI ได้ X เมตรทุกชนิด ระยะขึ้นกับ data rate (3G/12G), ชนิด coax, หัวต่อ, receiver, loss budget; ไปไกลให้เลือก fiber transport ที่มี TX/RX/กล้องที่รองรับ ไม่ใช่สาย fiber เสียบ BNC ตรง ๆ [R07,R09]
9. **Wireless:** Lavalier → TX → RF pairing → RX → audio cable → mixer; video TX/RX ก็เช่นกัน โดย RF segment ไม่ใช่ physical cable. ต้องตรวจ frequency compatibility, pairing, battery, receiver output [R11]
10. **Streaming:** Capture device ไม่ใช่ encoder โดยอัตโนมัติ; `Switcher USB webcam → OBS` ไม่จำเป็นต้องซื้อ capture card แยกถ้า switcher มีฟังก์ชันนี้; `SDI/HDMI Program → Capture → PC/OBS` เป็นอีกทาง; hardware encoder รับ Program แล้วส่ง RTMP/SRT ผ่าน network ของรุ่นที่รองรับ [R01,R04,R06,R13]
11. **สัญญาณมีหลาย state:** port physically connected, device powered/ready, correct format, video present, audio present, program selected, audio mix assigned, encoder connected, platform receiving และ recording active เป็นคนละเงื่อนไข
12. **ความปลอดภัย:** สายไม่กีดขวางทางหนีไฟ/ทางเดิน; ใช้ cable ramp ในจุดข้ามทาง; ภายนอกต้องมีระบบไฟ/grounding/weather protection โดยผู้ชำนาญการ เกมควรจำลองเป็น validation ไม่ใช่สอนผู้เล่นเดินไฟแรงสูงหรือแก้ไฟเอง

---

# ห้องประตูแรกแห่งภาพ — ห้องเรียน
**สถานที่:** ห้องเรียน  | **รูปแบบงาน:** สอนสด + แสดงสไลด์ + Hybrid Classroom  | **สถานะ:** DESIGN_REFERENCE

## ชุดระบบที่เลือก
ใช้ **HDMI Mini Switcher ที่มี HDMI output + USB Webcam Output** เป็นระบบตัวอย่างหนึ่งชุด เช่น ATEM Mini Pro ตามเอกสาร Blackmagic [R01] การเลือกนี้ทำให้ต่อจอห้องเรียนพร้อมส่งเข้า OBS ได้ **โดยไม่ต้องมี HDMI Capture Card แยก**; ถ้าเปลี่ยนเป็น Mini Switcher รุ่นที่ไม่มี USB Webcam Output ต้องเพิ่ม capture card และตรวจจำนวน program output ให้เพียงพอ

## อุปกรณ์ตามหมวด (จำนวนสำหรับระบบตัวอย่าง)
| หมวด | อุปกรณ์ | จำนวน/ตำแหน่ง | หน้าที่ |
|---|---|---|---|
| Video source | Classroom HDMI Camera + Tripod | 1, กลางหลังห้อง | รับภาพผู้สอน |
| Presentation | Laptop มี HDMI OUT | 1, โต๊ะอาจารย์ | ส่งสไลด์ |
| Video routing | Mini HDMI Switcher (ตัวอย่าง ATEM Mini Pro) | 1, โต๊ะควบคุมด้านหลัง | เลือก Camera/Slide; PGM/USB webcam |
| Monitoring / display | TV หรือ Projector พร้อม HDMI INPUT | 1, หน้าห้อง | แสดง Program |
| Audio source | Lavalier + compatible TX/RX | 1 ชุด, ตัวผู้สอน/โต๊ะควบคุม | ส่งเสียงพูด |
| Audio processing | Small Audio Mixer มี AUX/Main ตามที่กำหนด | 1, โต๊ะควบคุม | gain/mix / แยก PA และ stream ถ้าต้องการ |
| In-room sound | Active speaker หรือระบบ PA ที่มีอยู่ | 1 ระบบ, หน้าห้อง | ให้คนในห้องได้ยิน |
| Streaming | Notebook + OBS | 1, โต๊ะควบคุม | รับ USB webcam; record/stream |
| Accessories | HDMI ×3 (2 เส้นเข้าที่ Switcher และ 1 เส้นออกจอ), USB data×1, สาย audio ตามพอร์ต, power adapters, headphones | ตาม route | เชื่อมต่อ/จ่ายไฟ/ตรวจฟัง |

## พอร์ตต่อพอร์ต: Canonical Route
```text
ภาพ Camera:      Camera HDMI OUT ------HDMI------> Switcher HDMI IN 1
ภาพสไลด์:       Teacher Laptop HDMI OUT --HDMI--> Switcher HDMI IN 2
จอห้องเรียน:    Switcher HDMI PROGRAM OUT --HDMI--> TV/Projector HDMI IN
คอมสตรีม:        Switcher USB WEBCAM DEVICE --USB DATA--> Notebook USB HOST
ใน OBS:           Add Video Capture Device → เลือก Switcher webcam source
ไมค์:             Lavalier → TX ~~RF PAIRING~~> RX AUDIO OUT
เสียงเข้ามิกเซอร์: RX AUDIO OUT --audio cable--> Mixer LINE/MIC IN ตามระดับสัญญาณที่อุปกรณ์รองรับ
เสียงคนในห้อง: Mixer MAIN/PA OUT --> Active Speaker INPUT หรือ PA system
เสียงสตรีม:       Mixer STREAM/AUX OUT --> Switcher AUDIO IN ที่รองรับระดับสัญญาณ
                   (ตั้งค่า Mic/Line บนรุ่นที่รองรับ และตรวจ connector/level)
```
**อย่า** เพิ่ม Magewell ในเส้นทางหลักของรุ่นนี้เพียงเพราะชุดตัวอย่างอื่นมี Capture Card; USB Webcam Output เป็น capture interface ในตัวแล้ว [R01,R04]. HDMI OUT มีหน้าที่ส่งภาพให้จอ จึงไม่เอา Multiview ไปโชว์เป็นสไลด์ห้องเรียน

## อุปกรณ์/สายและทางเลือกที่ต้องมีจริง
- HDMI Type-A ↔ Type-A 3 เส้นตาม path ด้านบน; USB cable ที่เป็นข้อมูลและตรงพอร์ต switcher/computer; audio cable ที่ตรง RX/mixer/switcher โดยตรวจ mic/line level; power ของทุก device; Active speaker รับ line signal ไม่ใช่เอาสายลำโพง power-amp มาเสียบ input
- ถ้า Projector อยู่ไกลเกินความเหมาะสมของ HDMI passive ให้เปลี่ยนระบบส่งภาพ/ใช้ extender ตามสเปกจริง ไม่ตั้งระยะตายตัวในเกม

**แหล่งอ้างอิงของห้องเรียน:**
- [R01] [Blackmagic Design — ATEM Mini specifications](https://www.blackmagicdesign.com/products/atemmini/techspecs)
- [R04] [OBS — Sources Guide](https://obsproject.com/kb/sources-guide)
- [R10] [Shure — Audio system basics](https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems)

---

# สะพานจันทราแห่งเสียง — ห้องสตูดิโอ
**สถานที่:** ห้องสตูดิโอ  | **ข้อกำหนดพิเศษ:** **REFERENCE ONLY — ไม่แก้ห้องฝึก/ผัง/asset/port/gameplay ที่กำลังพัฒนา**  
**สถานะ:** ผังการสอนเป็น instructor-described workflow; exact physical ports หลายจุดยังเป็น PROVISIONAL/UNKNOWN

## อุปกรณ์ในขอบเขตข้อมูลเดิม (ไม่ใช่การยืนยันว่าเป็นของจริงทั้งหมด)
| หมวด | รายการ | หลักฐาน/สถานะ |
|---|---|---|
| กล้อง | Studio Camera 1–3 | รุ่นและ HDMI/SDI ของทุกตัว ยังไม่ครบ |
| Switcher | DeviceWell HDS7105 | ระบุชื่อได้มั่นใจสูง; ตรวจ revision/actual rear panel ก่อนล็อกพอร์ต |
| เสียงพูด | Sennheiser XS 1 แบบสาย | ระบุจากภาพเดิมความมั่นใจสูง; บทบาทใน exam route ยังต้องตกลง |
| Wireless | COMICA WM100 PLUS family, 2TX/1RX hypothesis | PROVISIONAL; อาจารย์เคยกล่าวถึง Saramonic |
| Mixer | PMX-402D-USB chassis | PROVISIONAL โดยเฉพาะแบรนด์/พอร์ตที่ติดตั้งจริง |
| Capture | Magewell USB Capture HDMI Gen 2 32060 | **SELECTED GAME REFERENCE ไม่ใช่ยืนยันว่าเป็นของห้องจริง** [R05] |
| Notebook / OBS | HP-style Notebook / OBS | HP model/port mapping ให้ยึดภาพจริงเท่านั้น |
| TV / Monitor | Samsung U8000F 43" | **SELECTED GAME REFERENCE** ไม่ใช่หลักฐานว่าเป็นจอของจริง |
| Studio Speaker | Yamaha HS5 | **SELECTED GAME REFERENCE** ไม่ใช่หลักฐานว่าเป็นลำโพงของจริง |

## Instructor-described canonical audio/video path (เพื่อความรู้เท่านั้น)
```text
Camera 1/2/3 --[connector/transport VERIFY]--> HDS7105 VIDEO INPUTS
COMICA Lav 1 → TX1 --RF--> RX
COMICA Lav 2 → TX2 --RF--> RX
RX AUDIO OUTPUT → Mixer INPUT
Sennheiser XS1 XLR OUT → Mixer MIC INPUT (ถ้าภารกิจมีไมค์สาย)
Mixer designated OUTPUT → HDS7105 compatible AUDIO INPUT [VERIFY model/revision/level]
HDS7105 designated MULTIVIEW output → TV HDMI IN [VERIFY physical port]
HDS7105 PGM HDMI OUT → Magewell HDMI IN [GAME REFERENCE]
Magewell USB 3.0 DEVICE → HP Notebook USB HOST → OBS Video Capture Device
Mixer MONITOR/AUX OUT → active HS5 line input [if supported/assigned]
```
**สำคัญ:** อาจารย์เน้น `Mixer → Switcher → Capture` สำหรับเส้นเสียงรายการของห้องนี้; ไม่ใช้ `Mixer → Capture` เป็นเส้นบังคับหลัก. แต่การมีเส้น Monitor speaker แยกจาก Mixer ไม่ขัดหลักนี้. ตัวรับ wireless แบบ 2TX/1RX อาจ mix สองช่องหรือแยกช่องได้ตามรุ่น/setting; อย่าสมมติช่องอิสระโดยไม่มีข้อมูล

## จุดที่ยังห้ามเดารุ่น/พอร์ต
- กล้อง 2/3, HDMI vs SDI actual; ถ้า SDI source เข้ารุ่นที่มีแต่ HDMI ต้องมี active SDI→HDMI conversion [R08]
- Audio Mixer output → Switcher input ต้องตรวจ connector/level; ห้ามยัด XLR เข้า HDMI หรือใช้ 3.5 ต่อแบบไม่ดู mic/line
- Capture Card ที่ใช้ในห้องจริง = UNKNOWN; Magewell คือรุ่นสำหรับ training reference เท่านั้น
- Speaker, TV, wireless actual brand/model = ยังไม่ยืนยันของจริง

**เอกสารนี้ไม่สั่งแก้หรือทดสอบห้องสตูดิโอเดิม**

**แหล่งอ้างอิงของห้องสตูดิโอ:**
- [R05] [Magewell — USB Capture HDMI Gen 2](https://www.magewell.com/products/usb-capture-hdmi-gen-2)
- [R04] [OBS — Video Capture Sources](https://obsproject.com/kb/video-capture-sources)
- [R08] [Blackmagic — Micro Converters](https://www.blackmagicdesign.com/products/microconverters)
- หมายเหตุ: ผัง Mixer → HDS7105 → Capture มาจากคำอธิบายอาจารย์ ไม่ใช่ข้อกำหนดสากลว่าทุกสตูดิโอต้องต่อเหมือนกัน

---

# หอคอยกระจกสลับภาพ — หอประชุมอาคารกิจกรรม
**สถานที่:** หอประชุมอาคารกิจกรรม  | **รูปแบบงาน:** เวที/สัมมนา/พิธีการ/ฉายจอ/ไลฟ์พร้อมกัน  | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
Production switcher ประเภท **8-input 3G-SDI, XLR balanced audio, dedicated Program/AUX/Multiview/USB webcam** (ตัวอย่างตรวจสเปกจาก ATEM Television Studio HD8/ISO) [R02] + **Digital Audio Mixer ที่แยก PA BUS และ BROADCAST BUS ได้**. มี SDI→HDMI converter สำหรับจอ/โปรเจกเตอร์ที่รับ HDMI เท่านั้น [R08]. ถ้าใช้ analog stagebox ให้มี analog multicore/return ที่ตรงกัน; ถ้าใช้ Dante stagebox ต้องมี Dante-compatible mixer/interface และ network routing ไม่ใช่เสียบ RJ45 ธรรมดา [R14]

## Equipment inventory สำหรับงานตัวอย่าง
| หมวด | จำนวนอ้างอิง | อุปกรณ์/ตำแหน่ง |
|---|---:|---|
| กล้อง | 3 | SDI Camera ซ้าย/กลาง/ขวา บน tripod |
| PTZ | 1 | PTZ ที่ **มี SDI output** + mount + power + controller/network ตามรุ่น |
| Slides | 1 | Presentation Laptop HDMI OUT + **powered HDMI→SDI converter** |
| Video control | 1 | Production 3G-SDI Switcher ที่ FOH |
| Displays | 2–3 | Multiview monitor, Program confidence monitor, Stage LED/projector พร้อม processor/input |
| Conversion | ตามปลายทาง | SDI→HDMI converter ให้จอที่ไม่มี SDI; Scaler/LED processor เมื่อ required |
| Mic | 1+2+2 | Podium mic, wireless handheld 2, lav 2 พร้อม TX/RX ที่ compatible |
| Audio routing | 1 | Stagebox analog + multicore หรือ digital stagebox เฉพาะระบบ compatible |
| Audio control | 1 | Digital Mixer ที่ FOH มี separate Main/Matrix/Aux buses |
| PA | 1 ระบบ | FOH MIX → system DSP ตามความจำเป็น → active PA หรือ amp→passive PA |
| Streaming/record | 1+ | PC/OBS รับ switcher USB webcam **หรือ** dedicated SDI capture/recorder ตาม design (เลือกให้ชัด) |
| Support | ตามระบบ | SDI 75Ω/BNC, XLR balanced, multicore/Dante network ตาม selected design, HDMI patch, USB data, headsets, UPS, power distribution |

## Canonical VIDEO
```text
CAM L SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 1
CAM C SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 2
CAM R SDI OUT --------75Ω SDI/BNC-------> Switcher SDI IN 3
PTZ SDI OUT ----------75Ω SDI/BNC-------> Switcher SDI IN 4
Presentation Laptop HDMI OUT → powered HDMI→SDI Converter → Switcher SDI IN 5

Switcher MULTIVIEW HDMI/SDI OUT → compatible FOH Multiview Monitor
Switcher dedicated PROGRAM SDI OUT → Recorder / SDI Capture (if selected)
Switcher AUX OUT configured to PROGRAM → SDI→HDMI converter → Stage Projector/LED processor HDMI IN
Switcher USB WEBCAM DEVICE → Production PC USB HOST → OBS (selected simple streaming route)
```
**ทุก output ที่แตกต่างต้องมี physical port ของ switcher ที่เลือกจริง**. ถ้า HD8 output ใช้ 1 HDMI เป็น Multiview แล้วส่ง Projector HDMI ให้ใช้ SDI AUX → active converter; ห้ามใช้สาย SDI→HDMI ที่ไม่แปลงสัญญาณ. USB webcam กับ separate capture/recorder เป็นทางเลือกตามการออกแบบ ไม่บังคับสองตัวโดยไม่มีเหตุผล [R02,R08].

## Canonical AUDIO — แยกสองปลายทาง
```text
Podium Mic XLR OUT → Stagebox MIC IN 1 → compatible multicore/Dante → Mixer MIC CH1
Wireless Handheld RX 1/2 XLR/LINE OUT → Stagebox/Mixer input CH2/3
Wireless Lav RX OUT → Stagebox/Mixer suitable input CH4/5 (output count verified)

Mixer MAIN/PA BUS OUT → Venue DSP / Active PA System (หรือ Amp → Passive PA)
Mixer BROADCAST AUX/MATRIX L/R LINE OUT → Switcher balanced XLR AUDIO IN L/R
Switcher must assign/enable this audio in PROGRAM → Stream/Capture
```
**อย่า:**เอา Mic-level XLR ของไมค์ไปต่อ Line-only input โดยไม่ผ่าน mic preamp; ห้ามถือว่า FOH bus = broadcast bus เสมอ [R10,R12].

## ตำแหน่งอุปกรณ์ตามสถานการณ์จริง
- FOH หลังหอประชุม = Switcher, Mixers, multiview, program monitor, PC, recorder; กล้องกลาง near FOH
- เวที = Podium, mic; side-stage = stagebox + wireless mic cases; กล้องอื่นอยู่ aisle edge
- สายตามขอบทางเดิน/side-stage/service path; ไม่บังประตูหนีไฟ; projector/LED อยู่ด้านหน้าและใช้สาย conversion/processor ตาม spec

**แหล่งอ้างอิงของหอประชุม:**
- [R02] [Blackmagic — ATEM Television Studio technical specifications](https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs)
- [R08] [Blackmagic — HDMI/SDI Micro Converters](https://www.blackmagicdesign.com/products/microconverters)
- [R14] [Yamaha — Tio1608-D Dante I/O rack](https://th.yamaha.com/en/business/audio/products/interfaces/tio1608-d/)
- [R10] [Shure — หลักการระบบเสียง](https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems)

---

# คลังผนึกพอร์ตโบราณ — พื้นที่ภายนอกอาคาร
**สถานที่:** พื้นที่ภายนอกอาคาร | **รูปแบบงาน:** งานภาคสนาม/ลานกิจกรรม/เวทีนอกอาคาร | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
Main control อยู่ **Control Tent**; กล้องใกล้ใช้ 3G-SDI ที่ความยาวได้รับการตรวจตามสเปก; กล้องไกลใช้ **active SDI-to-Fiber TX + matched RX** (หรือ broadcast camera fiber system ที่เข้ากันจริง); Wireless Video เป็นทางเลือกแยกไม่ใช่สิ่งจำเป็นสำหรับทุกงาน. โปรแกรมภาพออกเป็น **SDI 1080p**; เสียงที่ MIX แยก PA และ Program แล้ว **embed ด้วย compatible analog-audio-to-SDI embedder** ก่อนเข้า SDI hardware encoder (ตัวอย่าง AJA 3G-AMA รองรับ 3G-SDI + balanced analog I/O) [R07,R09,R15]. เลือกใช้ Encoder แบบมี SDI IN และ Ethernet เช่น Blackmagic Web Presenter 4K / Streaming Encoder 4K (ให้ตรวจรุ่น/format ที่เกมใช้) [R06].

## Equipment inventory ตัวอย่าง
| หมวด | จำนวน | อุปกรณ์/ตำแหน่ง |
|---|---:|---|
| Field video | 3 | Field Cameras A/B/C มี SDI output + tripods ต่างตำแหน่ง |
| Remote transport | 1 คู่ | Fiber TX/RX compatible + matched fiber patch/cable + power |
| Optional | 1 คู่ | Wireless Video TX/RX compatible + antenna/power (ทางเลือกของระบบ) |
| Video control | 1 | Portable 3G-SDI switcher ใน control tent |
| Monitoring | 1 | Portable Multiview Monitor compatible with output หรือ SDI→HDMI converter |
| Audio capture | 3 ระบบ | Wireless presenter TX/RX, shotgun mic, ambient mic (ตรวจ phantom ตามไมค์) |
| Audio mixing | 1 | Field audio/digital mixer มี PA/Broadcast buses |
| Audio embed | 1 | 3G-SDI analog audio embedder พร้อม breakout/connector/power ตามรุ่น |
| PA | 1 ระบบ | Venue DSP/active PA หรือ amp+passive PA แยกจาก broadcast |
| Streaming | 1 | Hardware Encoder SDI input + Ethernet network output |
| Networking | 1 ระบบ | Router + primary wired uplink เมื่อมี; mobile uplink เป็น fallback ตามอุปกรณ์จริง |
| Support | — | Cable reels 75Ω SDI, fiber case, XLR, power, UPS, weather covers, cable ramps, intercom headsets |

## Canonical VIDEO / TRANSPORT
```text
Near CAM A SDI OUT → qualified 75Ω SDI cable → Switcher SDI IN 1
Near CAM B SDI OUT → qualified 75Ω SDI cable → Switcher SDI IN 2
Far CAM C SDI OUT → FIBER TX SDI IN → matched optical link → FIBER RX SDI OUT → Switcher SDI IN 3
Switcher MULTIVIEW OUT → compatible Portable Monitor (converter if needed)
Switcher PGM SDI OUT → Audio Embedder SDI IN → Audio Embedder SDI OUT → Encoder SDI IN
Encoder Ethernet NETWORK OUT/PORT ↔ Router/LAN ↔ Internet Uplink → streaming ingest endpoint
```
**ผู้เล่นต้องเห็น** power state และ matching protocol/type บน fiber TX/RX; optical IN/OUT และ strand type ต้องยึดอุปกรณ์คู่จริง ไม่สอนว่า fiber ทุกชนิดใช้ร่วมกันได้. SDI cable max length ขึ้นกับ actual loss budget ไม่ใช่ fix ว่า “100m ถูกเสมอ” [R07,R09].

## Canonical AUDIO
```text
Presenter Lavalier → Wireless TX ~~RF~~> Receiver LINE/AUDIO OUT → Field Mixer proper input
Shotgun Mic XLR OUT → Field Mixer MIC IN (phantom only if required by model)
Ambient Mic XLR OUT → Field Mixer MIC IN
Mixer PA BUS → active PA/venue sound system
Mixer BROADCAST L/R LINE OUT → Audio Embedder compatible BALANCED AUDIO IN
Audio Embedder combines audio with Switcher PGM SDI → Encoder input
```
AJA 3G-AMA ตัวอย่างมี SDI IN/OUT และ breakout XLR balanced; ไม่ใช่เสียบ XLR เข้า BNC และการเลือก embed pair ต้อง configure [R15]

## ตำแหน่งและข้อกำหนด
- Service unload/cases → Control tent; camera A/B หน้าซ้าย-ขวา, camera C ไกล; TX อยู่ต้นทาง RX อยู่ฝั่ง control
- Cable route ขอบพื้นที่ + ramps ที่จำเป็น; power/UPS อยู่แยกจากสายสัญญาณ; weather protection ต้องเหมาะกับ rating ของ equipment
- network: `ENCODER CONNECTED` ≠ `STREAM HEALTHY`; กำหนด upstream network/ingest states และ bitrate/uplink headroom ตาม platform current guide [R13]

**แหล่งอ้างอิงของงานภายนอกอาคาร:**
- [R07] [Belden — ข้อจำกัดของระยะทางสาย SDI](https://www.belden.com/blogs/broadcast/12g-sdi-distance-challenges-to-consider-for-media-av-projects)
- [R09] [Blackmagic — Fiber Converters](https://www.blackmagicdesign.com/products/blackmagicfiberconverters)
- [R15] [AJA — 3G-AMA Audio Embedder](https://www.aja.com/products/3g-ama)
- [R06] [Blackmagic — Streaming Processors](https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs)

---

# บัลลังก์จอมถ่ายทอด — สนามกีฬาและงานถ่ายทอดสด
**สถานที่:** สนามกีฬาและงานถ่ายทอดสด | **รูปแบบงาน:** Multi-camera Broadcast + Commentary + Replay + Graphics + Program/Backup Streaming | **สถานะ:** DESIGN_REFERENCE

## Reference topology ที่เลือก
ระบบเป็น 3 โซน Field/Commentary/Broadcast Control; ใช้ **Broadcast Camera + matched fiber/base station/CCU**, SDI router, production switcher ขนาดใหญ่, replay/graphics, audio stagebox + broadcast audio console, multiview, talkback/tally, main/backup encoders, recording, **independent** main/backup network paths ตามความเป็นไปได้ [R03,R09,R16,R17]. ตัวอย่าง Video Router: Blackmagic Videohub 20x20 12G (20 inputs/20 outputs) [R16]. ตัวอย่าง Production Switcher: ATEM 2 M/E Constellation 4K (20 SDI inputs) [R03]. รุ่นเป็น design reference ไม่ใช่ของสถานที่จริง

## Inventory แบ่งตามระบบ
| หมวด | ตัวอย่างจำนวน | หน้าที่ / ตำแหน่ง |
|---|---:|---|
| Camera | 6 | Main high-wide, field L/R, goal/end, long-lens, mobile; tripods/support |
| Camera links | 6 ชุด | Fiber-capable camera transport + compatible CCU/base stations; camera power, return/control as supported |
| Video routing | 1 | Video Router (crosspoint sources → destinations), technical rack |
| Live switching | 1 | Large SDI Production Switcher, operator desk |
| Source extras | 2 | Replay Server output, Graphics PC SDI/compatible output (HDMI→SDI converter if applicable) |
| Monitoring | 1 ระบบ | Multiview wall + Program/Preview/confidence display + converter if needed |
| Audio sources | ≥6 | 2 commentator mics, 2 crowd/ambient, 1 field mic, 1 wireless presenter TX/RX |
| Audio transport | 1 ระบบ | Audio Stagebox / multicore or correctly configured Dante + suitable consoles/interfaces |
| Audio console | 1 | Digital Broadcast Console with independent Broadcast and Venue PA buses |
| Venue PA | 1 ระบบ | DSP + powered PA or amplifier → passive PA |
| Operators | 1 ระบบ | Intercom/Talkback matrix/beltpacks/headsets; tally links to camera system as model supports |
| Streaming | 2 | Main and backup SDI encoders with suitable independent program feeds |
| Internet | 2 เส้นทาง | Primary uplink + backup uplink with genuinely separate failure domains where possible |
| Recording | 1+ | Program Recorder / recording storage; optional ISO record by supported device |
| Support | — | 75Ω SDI patch, fiber, network, XLR/balanced line, distro/UPS, rack labels/patch panels |

## Canonical FIELD / VIDEO ROUTES
```text
CAM 1..6 → matched CAMERA FIBER SYSTEM → BASE STATION/CCU 1..6
CCU 1..6 VIDEO SDI OUT → Video Router SDI IN 1..6
Replay Server VIDEO OUT → Router SDI IN 7
Graphics VIDEO OUT → compatible SDI route → Router SDI IN 8

Router SDI OUT 1..8 (assigned via crosspoints) → Switcher SDI IN 1..8
Switcher MULTIVIEW OUT → Multiview Wall compatible input
Switcher PROGRAM OUT 1 → Main Encoder SDI IN
Switcher independent PROGRAM/AUX OUT 2 configured to same PGM → Backup Encoder SDI IN
Switcher AUX OUT configured Venue Feed → Venue Display processor / converter → Stadium screen
Switcher PROGRAM/ISO output (as designed) → Recorder
```
**Router ไม่ใช่ Switcher:** router เลือกว่า feed จาก connector ไหนไป output ไหน; switcher สร้าง Program/Preview/Transition. 20x20 หมายถึงจำนวน ports ไม่ใช่จำนวนกล้องขั้นต่ำ [R03,R16]

## Canonical AUDIO: สอง MIX ตามหน้าที่
```text
Commentator Mic 1/2 → Audio Stagebox proper Mic inputs
Crowd Mic L/R → Stagebox proper Mic inputs (phantom when required)
Field Mic → Stagebox MIC IN
Wireless Presenter TX ~~RF~~> RX → Stagebox/Console compatible input
Stagebox → compatible multicore/Dante routing → Digital Audio Console

Console VENUE PA BUS → Venue DSP/Amplification → Stadium PA
Console BROADCAST PROGRAM L/R BUS → Switcher compatible balanced audio input
                   OR → compatible Audio Embedder → Program SDI pipeline
Switcher final PGM with embedded program audio → both Main/Backup Encoders
```
### กรณีเลือก ATEM Constellation 4K เป็น reference
รุ่น 2 M/E มี 2 x balanced 1/4-inch analog audio input และ embedded SDI audio; จึงต้องเลือก **balanced output/cable matching** หรือใช้อุปกรณ์ embedder ที่ตรง format. อย่าระบุว่ามี XLR analog input บนตัว switcher โดยอัตโนมัติ [R03,R15].

## Control/Tally/Intercom/Sync (แยกจาก Video Signal)
- Camera return/control, tally, talkback ต้องใช้ link/protocol ของระบบ camera/base station ที่เลือก (ไม่ได้เกิดเองจาก SDI เส้นเดียวทุกยี่ห้อ) [R09]
- Replay/graphics ต้องมี source video ที่ switcher/format compatible; controller เป็น `CONTROL` ไม่ใช่ program video cable
- ระบบที่มี ref input / genlock / timecode ให้สอนการเลือก sync source/format ตามอุปกรณ์; input re-sync บางรุ่นไม่ใช่ข้ออ้างว่าทุกอุปกรณ์มี frame sync [R03]
- ถ้าใช้ Dante network audio ให้สร้าง logical TX-channel→RX-subscription, clock/PTP, primary/secondary independent networks ตามระบบ ไม่ใช่ “RJ45 เข้ารูไหนก็ได้” [R17]

## Redundancy rule
Main encoder และ backup encoder ต้องได้รับ program ที่เหมาะสมผ่าน **สอง physical outputs หรือ proper SDI distribution equipment** ไม่ใช้ Y-split passive BNC; backup network ต้องไม่พึ่ง single point of failure เดียวกันถ้าระบบถูกเรียกว่า redundant. ถ้าแค่สอง encoder วิ่ง router/uplink เดียว ให้ระบุสถานะเป็น `PARTIAL REDUNDANCY` ไม่ใช่ `FULL REDUNDANCY` [R16,R17]

**แหล่งอ้างอิงของงานสนามกีฬา/ถ่ายทอดสด:**
- [R03] [Blackmagic — ATEM Constellation specifications](https://www.blackmagicdesign.com/products/atemconstellation/techspecs/W-APS-26)
- [R16] [Blackmagic — Videohub specifications](https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs)
- [R09] [Blackmagic — Fiber Converters](https://www.blackmagicdesign.com/products/blackmagicfiberconverters)
- [R17] [Audinate — Dante routing guide](https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/routing_media.htm)

---

# หมวดอุปกรณ์และหน้าที่ของพอร์ต (สำหรับฐานข้อมูลเกม)

| ประเภทในเกม | อุปกรณ์ | Ports/logic ที่ต้องสอน |
|---|---|---|
| VIDEO_SOURCE | Camera / PTZ / Laptop / Replay / Graphics | HDMI OUT / SDI OUT / IP output เฉพาะรุ่น |
| VIDEO_SWITCHING | Mini/Production Switcher | source inputs; PGM, Preview, AUX, MV เป็นคนละ signal |
| VIDEO_ROUTING | Video Router | SDI INs/OUTs + configurable crosspoint |
| CONVERSION | HDMI→SDI, SDI→HDMI, SDI↔Fiber TX/RX | converter has separate signal, power, and direction |
| AUDIO_SOURCE | Wired Mic, Lav, Shotgun, Crowd Mic | Mic-level; power as required |
| WIRELESS | Audio TX/RX, Video TX/RX | pairing RF + wired ports at TX/RX |
| AUDIO_MIXING | Small/Field/Digital/Broadcast mixer | MIC/LINE inputs, gain, Main/Matrix/Aux bus, headphones |
| AUDIO_TRANSPORT | Stagebox, multicore, Dante I/O | compatible multicore or TX/RX Dante subscription |
| AUDIO_DISTRIBUTION | PA/Active Speaker/Amp/DSP | line to active/DSP; amplifier needed for passive speaker |
| AUDIO_EMBED | HDMI/SDI embedder | video IN + audio IN → video-with-audio OUT |
| MONITORING | TV, Multiview Wall, Headphones | monitoring isn't same as broadcast destination |
| CAPTURE | USB/SDI/HDMI capture | physical input → USB device to host; needs software source |
| ENCODE | OBS PC or dedicated hardware encoder | receives program; creates stream/record output |
| NETWORK | Router/uplink/ingest endpoint | IP connectivity, upload capacity, actual on-air state |
| OPERATIONS | Intercom, Tally, CCU, Recorder | control and status path separate from picture where needed |
| SUPPORT | Power/UPS/Tripod/Cable ramp/Cases | required presence/placement, avoid hazardous electrical mini-game |

## Signal and connector tags (ตัวอย่าง)
- `HDMI_AV`: HDMI Type-A video + embedded audio
- `SDI_AV_3G`: SDI on **75-ohm** BNC, supported signal format / Level A-B
- `ANALOG_MIC_BALANCED`: XLR balanced microphone level
- `ANALOG_LINE_BALANCED`: XLR/TRS line level as actual equipment
- `ANALOG_LINE_UNBALANCED`: 3.5mm/RCA only if true ports
- `USB_WEBCAM_DEVICE`: capture/switcher-to-PC USB peripheral; PC must be `USB_HOST`
- `DANTE_AUDIO_IP`: requires Dante-enabled endpoint and configured routing, not generic Ethernet
- `NETWORK_IP`: router/encoder uplink; not SDI program video itself
- `FIBER_VIDEO_LINK`: matched powered TX/RX / supported CCU system, correct medium
- `WIRELESS_AUDIO_RF`, `WIRELESS_VIDEO_RF`: paired logical link; no wired cable across RF gap
- `SDI_CONTROL`, `TALLY`, `INTERCOM`, `REFERENCE`, `POWERSOURCE`: explicit port role as supported

#### ลำดับตรวจสอบความถูกต้องของการต่อ
```text
1. Is correct equipment present + reachable?
2. Does source port emit expected type and is device ready?
3. Are connector, physical medium and electrical signal level compatible?
4. Is intermediate converter/stagebox/router/receiver actually present and configured?
5. Is the chosen route allowed by ระบบที่เลือก (not all physically possible routes fulfill the job)?
6. Are downstream INPUT and required processing/selection ready?
7. Has Program actually been selected? Is monitoring target PGM or MV as intended?
8. Is program audio embedded/assigned, non-duplicated, and present at destination?
9. Does capture/encoder/OBS detect the correct device, and is network/uplink ready when streaming?
10. Are venue PA, screen, monitor, recording and optional backup independently ready if required?
```

### ตัวอย่างสถานะการต่อที่ไม่ถูกต้อง
- `WRONG_DIRECTION`: AV output→output/input→input
- `WRONG_CONNECTOR`: HDMI→SDI directly, XLR→SDI BNC, USB device→device
- `WRONG_SIGNAL_ROLE`: 75Ω BNC SDI fed into BNC REF/MADI input
- `WRONG_AUDIO_LEVEL`: RX line out into unsuitable mic input without correct level config
- `NO_CONVERTER`: HDMI source goes into SDI port without active HDMI→SDI
- `NO_AUDIO_EMBED`: Program video reaches encoder but analog audio never enters program
- `MULTIVIEW_AS_PROGRAM`: audience display/stream receives multiview instead of clean PGM
- `NO_SIGNAL_DESPITE_CABLE`: camera off / format mismatch / wrong input / router crosspoint
- `DOUBLE_AUDIO`: OBS captures embedded HDMI audio and duplicated desktop audio
- `FAKE_BACKUP`: main/backup share same single network failure point
- `STAGEBOX_PROTOCOL_MISMATCH`: generic Ethernet ↔ Dante with incompatible interfaces
- `RF_NOT_PAIRED`: audio/video TX and RX are present but frequency/pair/link invalid
- `UNSAFE_CABLE_ROUTE`: crosses walkway/egress without proper routing/protection

---

# แหล่งอ้างอิงหลัก (เว็บไซต์ผู้ผลิตและคู่มือทางการ)

- **[R01]** Blackmagic Design — ATEM Mini series official technical specifications, including ATEM Mini Pro HDMI inputs, HDMI out and USB webcam: https://www.blackmagicdesign.com/products/atemmini/techspecs
- **[R02]** Blackmagic Design — ATEM Television Studio HD8/ISO technical specifications (3G-SDI, audio, multiview, webcam, PGM/AUX): https://www.blackmagicdesign.com/products/atemtelevisionstudio/techspecs
- **[R03]** Blackmagic Design — ATEM 2 M/E Constellation 4K specifications (20 SDI inputs, audio/control/output types): https://www.blackmagicdesign.com/products/atemconstellation/techspecs/W-APS-26
- **[R04]** OBS — Video capture sources and audio mixer guides: https://obsproject.com/kb/sources-guide and https://obsproject.com/kb/audio-mixer-guide
- **[R05]** Magewell — USB Capture HDMI Gen 2, part no. 32060, HDMI embedded audio and USB host interface: https://www.magewell.com/products/usb-capture-hdmi-gen-2
- **[R06]** Blackmagic Design — Streaming processors/Web Presenter specifications (SDI input, Ethernet RTMP/SRT, monitor): https://www.blackmagicdesign.com/products/blackmagicstreamingprocessors/techspecs
- **[R07]** Belden — SDI distance depends on cable attenuation, rate, receiver and added connector losses: https://www.belden.com/blogs/broadcast/12g-sdi-distance-challenges-to-consider-for-media-av-projects
- **[R08]** Blackmagic Design — Micro Converters, explicit HDMI→SDI and SDI→HDMI products: https://www.blackmagicdesign.com/products/microconverters
- **[R09]** Blackmagic Design — Fiber Converters: matched camera/studio converters, video/audio/talkback/tally/power over compatible SMPTE fiber: https://www.blackmagicdesign.com/products/blackmagicfiberconverters
- **[R10]** Shure — Sound system chain: microphone→mixer→amp/speaker, signal levels and broadcast sends: https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems
- **[R11]** Shure — BLX wireless system user guide: compatible TX/RX, receiver→mixer: https://www.shure.com/en-US/docs/guide/BLX ; phantom power explainer: https://service.shure.com/articles/en_US/Knowledge/what-is-phantom-power
- **[R12]** Shure — Separate streaming mix vs in-person mix discussion: https://www.shure.com/en-US/docs/education/house-of-worship-audio-systems
- **[R13]** YouTube Help — Encoder setup and upload/bitrate/stream-health guidance (values can change by platform/date): https://support.google.com/youtube/answer/2853702?hl=en-EN
- **[R14]** Yamaha — Tio1608-D Dante stagebox illustrates that a network stagebox requires compatible Dante ecosystem (example product, not mandated purchase): https://th.yamaha.com/en/business/audio/products/interfaces/tio1608-d/
- **[R15]** AJA — 3G-AMA SDI analog audio embedder with SDI IN/OUT and balanced breakout I/O: https://www.aja.com/products/3g-ama
- **[R16]** Blackmagic Design — Videohub 20x20 12G SDI crosspoint router specification: https://www.blackmagicdesign.com/products/blackmagicvideohub/techspecs
- **[R17]** Audinate — Dante clock / media routing / redundant networks: https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/clock_synchronization.htm and https://dev.audinate.com/GA/dante-controller/userguide/webhelp/content/routing_media.htm

## หมายเหตุสำหรับการนำข้อมูลไปใช้
- ข้อมูลจากผู้ผลิตยืนยัน **ความสามารถของรุ่นตัวอย่าง** ไม่ใช่ว่าทุกอุปกรณ์ในหมวดนั้นทำได้เหมือนกัน
- ถ้าเปลี่ยนชื่อรุ่นในเกม ต้องกลับไปตรวจพอร์ต/สเปก/format/feature ทุกจุด ไม่ใช่ใช้ port catalog ของอีกรุ่นแทน
- ทุกอุปกรณ์ที่ยังไม่ได้เห็นป้ายรุ่นจริง ต้องใช้ `DESIGN_REFERENCE` / `GENERIC TRAINING MODEL` / `PROVISIONAL` / `UNKNOWN` ตามความเหมาะสม
- เอกสารฉบับนี้เป็น **ข้อมูลและแบบฝึกที่เสนอ** ไม่ได้แก้ไฟล์ใน `D:\etcstream` และ **ไม่แตะห้องสตูดิโอ**

