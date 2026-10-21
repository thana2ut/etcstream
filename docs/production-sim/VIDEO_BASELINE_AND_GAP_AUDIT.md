> สถานะรอบใหม่ 20 ต.ค. 2026: มี Chrome QA และตรวจผู้ดูแลครบ 25 ด่านแล้ว ดู `MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md` และ `LIVE_CHROME_GAMEPLAY_QA.md`; ข้อความยังไม่ทดสอบด้านล่างเป็นสถานะของ milestone เดิม ไม่ใช่ผลรอบล่าสุด

# Video baseline and gap audit

Status: IMPLEMENTED FROM CODE REVIEW / PARTIAL / NOT TESTED / NOT PLAYTESTED.

## 2026-10-20 reference reconciliation update

The original Research, original Appendix A and technical handoff have now been supplied and read. Unmodified copies are in `docs/references/`. The prior missing-reference findings below describe the earlier foundation pass. L and XL active graphs now implement matched transport, field audio, embedding/encoding and six-camera/router/two-delivery topology through `sim/reference-*.ts`; M has expanded wireless microphones and analog stage transport. Original definitions are retained. See the regenerated 25-level matrix, source matrix and BOM for current scope. Exact optical/replay/tally/intercom/PTZ hardware and S real-device ports remain unresolved. The recording itself has not been supplied or watched, and no runtime test/playtest has been performed.

The local implementation brief was read in full. The reference recording `Screen Recording 2026-10-19 234200.mp4`, research-locked brief and unmodified Appendix A were not available in the repository or Downloads search. The owner confirmed on 2026-10-20 that these will be supplied separately and authorized continuing verified foundations without replacing mission definitions. No video was watched, no browser automation or gameplay was performed. OBSERVED below means observations supplied by the brief, not independent inspection of footage.

| Status | Scope / levels | Evidence / gap / disposition |
| --- | --- | --- |
| OBSERVED | all 25 | Supplied 00:00–00:25 observations describe established fantasy selection and compact inventory. Preserve illustrated cards, gold styling and navigation. |
| OBSERVED | protected free practice | Supplied ~00:30 shows a smaller studio; it is not the mission studio. |
| OBSERVED | XS/S/M/L/XL | Supplied 00:45–04:20 describes recognizable venue shells and some no-signal screens; does not establish gameplay correctness. |
| OBSERVED | all 25 | Supplied 04:20–04:44 describes dense technical panels and return to mission selection. |
| CONFIRMED_IN_CODE | all 25 | `sim/stages.ts` contains 25 manifests; `venue-scenarios.ts` materializes every listed device and its modeled ports. Physical cables already derive one-for-one from canonical edges. Typed simulation, RF pairing, cues, faults, review and sign-off already exist. These are source facts, not passing runtime results. |
| CONFIRMED_IN_CODE | all 25 | Lobby ignored the scenario unless an optional filter was passed. It could display unrelated inventory. Packing too few hid mandatory cable instances. Bag rows aggregated by catalog group, obscuring actual endpoints and partially installed vs complete cables. |
| FIXED_IN_CODE | all 25 | Lobby limits selectable catalog groups and quantities to actual non-preinstalled scene stock. Unpacked mission leads remain at authored storage; packed IDs reserve exactly existing leads. Mission bag lists individual IDs, both ends, signal/length, spare/distractor status, world/bag/held/one-end/installed state, equipment and completed physical routes. |
| CONFIRMED_IN_CODE | all 25 | `settleSim` originally returned immediately without active faults and did not revoke sign-off/test badges after disconnects/config changes. |
| FIXED_IN_CODE | all 25 | Current predicates now invalidate failed test layers and all later badges, clear sign-off and current completion. Repair does not automatically re-award tests. Deliberate retest and sign-off remain required. Archived per-level achievement records remain separate and unchanged. |
| FIXED_IN_CODE | all 25 | Invalid/occupied/unplaced graph edges cannot propagate signal. USB mass-storage and capture/audio roles cannot substitute for each other. Propagation budget scales with device count. Unsupported device controls are rejected before state mutation; paused review blocks testing/sign-off. |
| CONFIRMED_IN_CODE | S-01/03/04/05 | Architectural input repeater read a nonexistent `DeviceView.inputs` property and always reported no inputs. |
| FIXED_IN_CODE | S-01/03/04/05 | Input repeater now reads actual evaluated switcher input ports and switcher power. Mission monitor messages now use Thai. The legacy free-practice feed branch is unchanged. |
| FIXED_IN_CODE | all 25 | Port rows are grouped per modeled panel; generic shells and spacing expanded for selectable anchors. Camera outward normals corrected to match the rear connector plate. Service-position candidates are documented with collider margins. Candidates are NOT proof of reachability. |
| FIXED_IN_CODE | XS-01/03/04/05; XS-02/05; XL-01–05 | Classroom TV and its stand moved away from wall together, classroom PA moved for rear service room, stadium interactive monitor moved away from front wall. Existing venue art/architectural repeaters retained. |
| MISSING | L-01–05 | Current graph does not contain the requested matched fiber route, full microphone system, separate embedder/encoder topology; L-02 is a cable-distance lesson instead of audio. Kept intact pending external references. |
| MISSING | XL-01–05 | Current graph has at most four cameras and direct switcher inputs; lacks requested six matched CCU/router chains, stagebox/digital-console topology, independent main/backup encoders and separate delivery routes. XL-02 remains a camera lesson. Kept intact pending external references. |
| UNCERTAIN | S-01–05 | Actual HDS7105 revision, camera outputs, wireless receiver channel profile and capture device-end USB shape require Appendix/source reconciliation. Existing generic studio switcher is not newly declared verified. |
| UNCERTAIN | M-01–05 | Full microphone/receiver complement, PTZ control and venue confidence-monitor topology require external reconciliation. Existing authored analog stagebox system is retained. |
| UNCERTAIN | all 25 | Rear/side-port path access, input focus transitions, updated shell fit, signal screenshots, performance, audio and responsive layouts need later human QA. Static candidate positions cannot prove these. |

See the generated 25-level matrix for exact present equipment/stock/ports and pending scope. No source mission was deleted, renamed or overwritten. Nothing here claims acceptance of the full upgrade.
