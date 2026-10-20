> สถานะรอบใหม่ 20 ต.ค. 2026: มี Chrome QA และตรวจผู้ดูแลครบ 25 ด่านแล้ว ดู `MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md` และ `LIVE_CHROME_GAMEPLAY_QA.md`; ข้อความยังไม่ทดสอบด้านล่างเป็นสถานะของ milestone เดิม ไม่ใช่ผลรอบล่าสุด

# Implementation summary and human QA

Date: 2026-10-20. Milestone: gameplay foundations plus original Appendix A / handoff reconciliation.

**IMPLEMENTED FROM CODE REVIEW / PARTIAL. NOT TESTED / NOT PLAYTESTED.**

## Research reconciliation delivered in this continuation

The owner supplied all three original Markdown references. Unmodified copies are retained in `docs/references/`. Appendix A governs technical roles and the new handoff governs per-level teaching scope. The video remains unavailable; no viewing/playtest claim is made.

- New `reference-equipment.ts`, `reference-rooms.ts` and `reference-stages.ts` extend the existing manifest/simulation architecture. `ORIGINAL_STAGES` and `ROOMS` preserve original definitions; active `STAGES` / `MISSION_ROOMS` apply the reconciliation. No replacement game engine or dependency was introduced.
- L now has distinct video, audio, three-camera optical transport, fault-repair and full commissioning lessons. The full graph contains 18 devices and 17 required leads, including matched powered SDI/optical TX/RX, three audio sources, PA/broadcast buses, actual audio-embedder node, SDI encoder, gateway and simulated ingest.
- XL now has camera/base and crosspoint lessons, six-source audio/PA/broadcast lesson, six-camera plus replay/graphics production, fault repair and full commissioning. Its full graph contains 39 devices and 50 required leads: six camera/base pairs, router inputs/outputs 1–8, a distinct switcher, controlled replay source, active graphics conversion, analog stagebox/multicore/console, independent Program outputs to two encoders, separate gateways/ingests, recorder and venue feed.
- M-02/M-05 use a selected six-channel analog training stagebox/console; the full lesson includes podium, two wireless handheld sources with integrated transmitters and two lav systems. Wireless RF adds no fictional cable; the full graph contains 29 devices and 29 required leads. Existing selected SDI-capture-to-OBS route is retained as the documented alternative.
- XS reference topology is retained (full graph: 10 devices / 8 required leads). S retains the existing provisional mission topology (16 devices / 13 required leads); uncertain HDS7105/camera/RX/capture data is explicitly surfaced.
- XS-03 additionally has the handoff's USB webcam-to-OBS terminal (5 devices / 4 required leads), with placement/power/USB and live Program-mirror predicates; no separate capture card is introduced.
- Generic signal behavior now includes matched optical families/peers, independently powered TX/RX/CCU, true crosspoints across eight paths, replay controller input, condenser-only phantom requirement and audio embedding. Current clean Program and source framing gates prevent checklist-only success. Network cable attachment is physically bidirectional while service propagation checks LAN/WAN roles separately.
- Mission cards were regenerated from active Thai work orders; the catalog generator no longer imports a gameplay solver. Added machine-readable BOM and per-edge source export. Every selected edge has an actual cable ID and two modeled scene port endpoints; this is structural coverage, not proven physical/runtime acceptance.
- Added a field TX case and separate encoding desk, oriented the S notebook toward a service aisle, corrected microphone service normals and left camera operator margin at venue boundaries. Active CCU/router/backup units no longer overlap decorative rack infill. All source-required representations remain temporary training shells.
- Mission-only cable tubes use per-lead instancing (nine segments in one mesh) and retain the existing endpoint-change cache. Practice still uses its legacy rendering path. Stadium control-to-field cable routes use the authored door gap; this is an implementation choice, not a runtime anti-clipping guarantee.

## Remaining hardware and interaction limits

Exact Optical connector/wavelength/transceiver protocol, vendor replay-control connector/protocol, actual HDS7105 revision/camera outputs, studio receiver channel behavior and capture USB device-end remain unverified. No manufacturer-specific optical pinout or imaginary HDS7105 port was asserted. PTZ-control and tally/intercom hardware/protocols remain unresolved and are not falsely represented as functional physical subsystems. Generic six-channel audio and eight-path video profiles are selected training subsets, not claims of actual product I/O or campus ownership.

XL has separate encoder/video/network feeds but shared production switcher/source/power: **PARTIAL REDUNDANCY**, explicitly shown in Thai. Safe technician power/weather/cable-route controls remain simulation only. There is no optical loss-budget measurement, authentic vendor protocol, new smooth inspection camera, approved runtime reach/collision/FPS result or final sculpted model. The 25-level matrix exposes the precise modeled scope; full acceptance remains pending human QA and unresolved hardware evidence.

## Actual changes

1. Mission lobby filters and caps packing to authored stock. Existing required stock omitted from the bag remains physically recoverable in the venue.
2. Mission bag displays unique instances, exact two ends, length/signal class, required/spare/distractor role, hand/bag/world/partial/installed state; includes equipment manifests and read-only completed physical routes. Thai search, keyboard focus containment and Escape close are provided.
3. Live predicates invalidate test/sign-off/completion state when required current conditions fail. Repaired systems require player-run tests again. Controls validate authored options; review pause blocks test/sign-off.
4. Simulation filters invalid/unplaced/duplicate-occupancy graph edges, distinguishes storage USB roles and scales propagation to authored chain length. Studio input repeaters now read real port input signals. Mission screen/connection/weather messages are Thai.
5. Generic shell sizing and per-panel port spacing support distinct hit targets; camera normals fixed. Classroom TV/stand and PA, and stadium interactive monitor have increased wall service clearance. Candidate approach positions and unresolved access points exported.
6. Added project-local topology/reference-pending metadata and non-solving authoring guards; generated exact data tables for all 25 scenarios, including every cable and port. No declared passing runtime results.

## Protected scope

- Original stage/model/room definitions are retained; their files only gain reconciliation imports/exports/registry additions. Chapter artwork, progression/storage repositories, route guard, nickname flow, GLB assets and original Studio Room 01 scene remain unchanged. Controller changes below are mission-gated; legacy practice follows its existing behavior. Mission-card text was regenerated to match active lessons.
- Shared inventory changes are mission-gated on `scenario.stage`. Mission panel changes do not replace the practice bag. `monitor-feed.ts` retains legacy free-practice behavior. Shared engine state settling returns unchanged without mission `sim` state.
- No added dependency, remote service, credential, database, migration, seed, commit or push. `.env.local` was not opened or edited.
- Existing automated tests are preserved and have not been run. No browser automation, auto-solver or manual gameplay executed.

## Earlier foundation-only scope (superseded where noted above)

- Recording was unavailable: review it after owner supplies it; compare visual findings to the baseline audit.
- The references are now available and role-level reconciliation is implemented. Manufacturer/campus-specific hardware proof still must not be inferred from reference topology.
- S: HDS7105 revision/real port profile, cameras, receiver outputs and capture USB device-end remain uncertain.
- M: reconcile microphone complement, PTZ control, confidence output and full production scope.
- The earlier L/XL missing-graph findings are closed in the new active training manifests as described above; originals remain available as historical source definitions.
- All equipment remains the existing procedural/generic training representation. No photoreal models produced. No full venue rebuild, new patch/reel mechanics, smooth inspection-camera mode or new audio cues claimed.
- Geometric service candidates are not complete route/reachability proofs; unresolved points are in the scene/anchor document. Human QA remains necessary.

## Static verification

Final source verification on 2026-10-20: `npm run lint` PASS (exit 0), `npm run build` PASS including TypeScript and static export (exit 0), `git diff --check` PASS and `git status --short` inspected. Git emits a normal Windows LF/CRLF warning for `sim/rooms.ts`; it is not a build error. These are compilation/static/Git checks, not gameplay tests; no gameplay acceptance is implied. Documentation generation only reads authored data; it never initializes runtime state or evaluates a solution.

## Files changed and created

Modified source:

- `components/game/bag-panel.tsx`
- `components/game/equipment-inspector.tsx`
- `components/game/operator-console.tsx`
- `components/game/training-hud.tsx`
- `components/ui/cable-lobby.tsx`
- `game/content/cable-catalog.ts`
- `game/training/hdmi-training.ts`
- `game/training/monitor-feed.ts`
- `game/training/scenarios.ts`
- `game/training/sim/engine.ts`
- `game/training/sim/rooms.ts`
- `game/training/venue-layouts.ts`
- `game/training/venue-scenarios.ts`
- `game/training/sim/types.ts`
- `game/training/sim/stages.ts`
- `game/training/sim/equipment.ts`
- `game/content/mission-catalog.ts`
- `game/content/sim-equipment-info.ts`
- `components/game/cable-plugs.tsx`
- `components/game/equipment/generic-device.tsx`
- `components/game/environment/venue/outdoor.tsx`
- `components/game/environment/venue/stadium.tsx`
- `scripts/generate-mission-catalog.mjs`
- `components/game/training-room.tsx`
- `components/game/hdmi-cables.tsx`
- `game/training/cable-route.ts`
- Related mission-only equipment, source, layout, performance and project-state documents were regenerated/updated to match active manifests; older unsupported inventories are not used as current coverage evidence.

Created:

- `game/training/mission-completeness.ts`
- `scripts/generate-mission-completeness-docs.mjs`
- `game/training/sim/reference-equipment.ts`
- `game/training/sim/reference-rooms.ts`
- `game/training/sim/reference-stages.ts`
- `docs/MISSION_25_BILL_OF_MATERIALS.json`
- `docs/references/` (three original documents, copied without edits)
- `docs/VIDEO_BASELINE_AND_GAP_AUDIT.md`
- `docs/MISSION_25_EQUIPMENT_PORT_CABLE_MATRIX.md`
- `docs/SCENE_WORK_ZONES_AND_INTERACTION_ANCHORS.md`
- `docs/TECHNICAL_SIMULATION_STATE_AND_FEEDBACK.md`
- `docs/IMPLEMENTATION_SUMMARY_AND_HUMAN_QA.md`

## Proposed human QA — NOT EXECUTED

### รอบปรับประสบการณ์ลงมือฝึก (20 ตุลาคม 2026)

- เพิ่มวงแสงขยายและจางภายใน 0.65 วินาทีตรงพอร์ตที่เสียบ/ถอดจริง สีฟ้าสำหรับเสียบ สีเหลืองสำหรับถอด ไม่สร้างสายหรือเชื่อมต่อให้อัตโนมัติ และไม่เล่นแอนิเมชันปลอมเมื่อเริ่มภารกิจที่มีสายต่ออยู่แล้ว
- วงพอร์ตที่เสียบแล้วใช้สีเขียวเมื่อพอร์ตมีสัญญาณจำลอง สีเหลืองเมื่อไม่มี พร้อมข้อความไทยเมื่อเล็ง สถานะนี้เป็นสถานะเฉพาะพอร์ต ไม่ใช่คำยืนยันว่าระบบปลายทางทั้งหมดผ่าน เงื่อนไขทดสอบและรับงานยังใช้เส้นทางจริงและการตั้งค่าของผู้เล่น
- เพิ่มขนาดเป้าเลือกพอร์ตเฉพาะภารกิจ 6 มม. โดยไม่ขยายช่องเสียบหรือเปลี่ยนชนิดหัวต่อ ต้องเข้าจากด้านแผงพอร์ต ไม่เลือกพอร์ตทะลุด้านหลังตัวเครื่อง
- กด E ค้างต้องคงเป้าอุปกรณ์เดิม หากเป้าหรือหน้าต่างเปลี่ยนจะยกเลิก ป้องกันการหยิบ/เปิดอุปกรณ์คนละชิ้นเมื่อปล่อยปุ่ม หยุดการเดินและล้างปุ่มค้างเมื่อเปิดจอตรวจอุปกรณ์หรือแผงควบคุมเฉพาะภารกิจ
- แก้เพิ่ม: `components/game/training-room.tsx`, `components/game/first-person-controller.tsx` และรายงานฉบับนี้ ไม่มี dependency เพิ่ม
- ส่งออกข้อมูลครบ 25 ภารกิจใหม่ได้สำเร็จ การส่งออกอ่านข้อมูลนิยามเท่านั้น ไม่ได้เดินผู้เล่นหรือทดสอบผ่านภารกิจ
- ต้องทดสอบด้วยผู้เล่น: ระยะเดินถึงพอร์ตทุกช่อง การบังของโมเดล/เฟอร์นิเจอร์ เป้าพอร์ตข้างเคียงที่อยู่ใกล้กัน การเห็นวงแสงบนแต่ละแผง และการกดค้าง/เปิดหน้าต่างบนเมาส์ คีย์บอร์ด และสัมผัส ยังไม่มีผลยืนยันจากการเล่นจริง
- ข้อจำกัด: ตัวกรองด้านแผงพอร์ตยังไม่ใช่การตรวจสิ่งกีดขวางทั้งฉาก สายและโมเดลยังเป็นภาพจำลอง และไม่มีผลรับรองว่าเดินถึงทุกพอร์ตโดยไม่ติดสิ่งกีดขวาง

Run only after owner authorization; do not treat unchecked cases as passing.

- [ ] All five fantasy chapters retain five independent levels; finishing one level unlocks only its next level and updates only its own chapter count.
- [ ] XS-01: enter with empty/insufficient bag; locate both physical HDMI instances at storage, take and manually connect both endpoints. No automatic wiring. Switcher/display stay dark until powered/selected.
- [ ] For all 25 levels, reconcile the matrix with the in-world equipment; no required source, processor, converter, monitor, cable or destination is missing.
- [ ] Compare each actual cable ID and its two connectors in bag, hand and world; failed attempts preserve stock. Partial connection, drop, cancel, stow, unplug and reconnect never duplicate objects.
- [ ] Walk to every mandatory front/rear/side port and every cable shelf; use the existing controller without jumping, clipping or furniture traps. Review all missing approach candidates explicitly.
- [ ] Check revised classroom TV/stand and PA positions, stadium monitor and new shell dimensions against room visuals, supports and colliders.
- [ ] Open/close bag, inspector, pause and console via mouse/keyboard/touch; first-end attachment persists and only the active overlay accepts input. Verify focus return and Thai text at mobile/tablet/desktop sizes.
- [ ] Reject wrong connector/direction, occupied port, USB storage-as-capture and invalid signal routes safely; show Thai feedback. Three knowledge errors pause for existing targeted review.
- [ ] Commission XS-01, unplug either mandatory run, confirm all affected current badges/sign-off/completion and downstream display become invalid; repair, explicitly retest and sign off.
- [ ] Change power, format, Program selection, mixer buses and capture source after commissioning; current readiness responds and old test snapshot remains clearly historical.
- [ ] S-03: actual input repeaters match connected/powered inputs; Preview, Program and Multiview remain distinct. Never infer signal from a fabricated `inputs` property.
- [ ] XS-05: USB DEVICE→HOST, independent PA/stream audio and OBS capture are causally correct; no duplicated microphone audio.
- [ ] M-04: inspect actual faulted SDI/REF or stage/FOH path, manually repair and retest; no magic fix button.
- [ ] L-03/L-05: physically attach near SDI and matched field TX/RX optical routes; verify power, condenser +48V, PA/broadcast, embedder and ingest. Disconnect any required segment; affected current readiness must fail.
- [ ] XL-05: operate six camera/base pairs, all eight crosspoints, replay controller, graphics conversion, six audio channels, clean venue output, recorder and both delivery chains. Fail one network and inspect primary/backup states independently; retain PARTIAL REDUNDANCY wording for shared production/power.
- [ ] Free-practice `/academy` and `/play?mode=classroom`: original Studio Room 01, HDMI exercise, controls, bag behavior, saves, audio/fullscreen and completion remain unchanged.
- [ ] Inspect simulation-only wording; no real OBS, real ingest, actual campus inventory or complete network redundancy claim appears.
