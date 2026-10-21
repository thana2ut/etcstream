# Technical simulation state and feedback

IMPLEMENTED FROM CODE REVIEW. NOT TESTED / NOT PLAYTESTED. Original Appendix A / handoff role-level reconciliation implemented; exact hardware evidence remains limited as documented.

## Reconciled active data

`reference-equipment.ts` adds only explicitly labeled generic training profiles supported by Appendix A roles: matched field optical TX/RX, matched camera/base links, six-channel analog audio transport/console, eight-path router and switcher subset, audio embedder, controlled replay, SDI encoder and a wireless handheld with integrated transmitter. `reference-rooms.ts` provides per-venue instances, peer/failure-domain identities and positions. `reference-stages.ts` provides active L/XL lessons and expanded M audio, layered over preserved originals. No physical RF wire, Dante-over-arbitrary-RJ45, passive BNC Y split or imaginary XLR input on a named Constellation is added.

Fiber signals carry a matched training family and source video; receiver/CCU must be powered, placed and paired with the authored peer. The replay output requires both a controller command over its explicit generic control link and loaded media/play readiness. The field embedder receives video plus two balanced analog lines and must explicitly embed the program pair. A condenser profile marks its signal as requiring phantom and only the selected mixer channel can activate it. The router resolves all authored output crosspoints separately from Preview/Program.

Network attachment accepts bidirectional physical peers; propagation separately checks the authored LAN or WAN service role. This remains a local directed service-flow approximation, not IP packets, real Internet or Dante. Main/backup encoders have separate source ports and network/ingest devices but share production/power: PARTIAL REDUNDANCY. Full acceptance is not asserted.

## Existing ownership retained

- `sim/stages.ts`: original 25 definitions preserved in `ORIGINAL_STAGES`; active `STAGES` applies the documented reconciliation overlay.
- `sim/rooms.ts`, `sim/equipment.ts`: original definitions remain, with additional mission room/profile registries. The separate free-practice scene and HDMI port map do not use the overlay.
- `venue-scenarios.ts`: materializes one scenario per stage; unique real cable IDs, exact ends, stock roles, signal class, world transforms and grouped panel anchors. Topology IDs are project-local version identifiers, not claims of Appendix approval. R01–R17 pointers are inherited from the source matrix, explicitly pending verification.
- `mission-completeness.ts`: ordinary authoring validation of IDs, devices, endpoint existence, connector mating, canonical port capacity, signal-class compatibility and cable ownership. Does not solve levels, initialize runtime state or execute tests. Design errors block sign-off with a Thai message.
- `hdmi-training.ts`: existing physical state transitions, graph evaluation, review/testing/sign-off.

## Separate physical and operational state

| Layer | Source of truth | Result |
| --- | --- | --- |
| Stock | `Scenario.cables`, per-instance `TrainingState.cables`, `bagged`, `held` | A cable remains one object through world, bag, hand, first endpoint and two endpoints. |
| Physical | Actual endpoint `portId`, port availability and occupied endpoint checks | Wrong shape/direction/occupied endpoints do not consume or duplicate stock. |
| Readiness | Existing model controls, `placed`, power/format state | Unplaced devices cannot transmit. Power/format still matters after connection. |
| Routing | Existing RF, switcher, router, mixer-bus, capture and network model controls | Connector shape never creates a router crosspoint, RF link or OBS source. |
| Signal | Evaluated `ctx.inp`, `ctx.out`, `ctx.view` | Reject invalid graph edges and duplicate occupancy; use enough propagation passes for the authored device count. |
| Delivery | Existing local capture/record/network/ingest state | No external OBS, network requests or real livestreaming. |
| Commissioning | Explicit sequential tests, live predicates, quiz, sign-off | Stale badges are revoked from the first failed layer onward; repair requires deliberate retest. |

Installed means both cable ends have ports, not that signal is valid. Historical recording/cue evidence is kept as historical evidence; it cannot override mandatory current signal predicates. Existing saved level achievements are not erased when a current setup is edited.

## Recoverability and Thai feedback

- Unpacked mission cables stay on their existing world storage surface. The lobby can no longer make a required cable disappear just because it was omitted from the bag. Free-practice packing semantics unchanged.
- Picking uses the actual instance ID. First-end connection leaves the second end held. Dropping keeps the first endpoint. Cancel/stow unplugs the lead and returns that same instance to the bag. Installed route inspection lists actual current endpoints only.
- A wrong connector is a knowledge-relevant error and enters existing three-error targeted review. Occupied-port clicks remain recoverable without consuming stock. Testing and sign-off cannot bypass paused review.
- Connection feedback: `ต่อสายแล้ว ต้องทดสอบระบบ`; missing signal: `ยังไม่มีสัญญาณ ตรวจไฟเลี้ยง รูปแบบภาพ และการตั้งค่า`.
- Mission screen feedback: `ปิดเครื่องอยู่`, `ไม่มีสัญญาณ`, `ภาพดำ`, `ภาพที่ปลายทาง`, `ยังไม่มีเสียงในรายการ`. Real connector and PGM/OBS markings are preserved.
- Unexpected objective exceptions use a friendly Thai error; technical details only reach the development console.
- Console test snapshots are labeled historical so they cannot be mistaken for current readiness.

## Physical access and remaining limitations

The new anchor groups honor rear/front/side metadata for generic shells; camera and laptop adapters keep their actual project visual conventions. Perimeter box shells turn their rear toward the room when a 1.2 m normal probe crosses room bounds; electrical definitions remain unchanged. Port normal, socket, hit target and cable tip use the same anchor. Work-zone metadata and geometric candidate positions are exported, but there is no claim of collision-free walking, camera easing, anti-clipping guarantee, calibrated cable distance, RF protocol accuracy or fully independent redundancy. See the scene document and human checklist. Per-model port counts, fiber/CCU compatibility, advanced PA/broadcast topology and all new hardware remain pending external evidence.
