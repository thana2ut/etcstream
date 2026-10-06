# ETCSTREAM — Project state

_Updated: 2026-10-06 · milestone "XS/S/M/L/XL venue system + 25 signal-flow scenarios"_

> Runtime status: **implemented, not tested and not playtested.** No scenario in this milestone has been
> executed by automated tests, auto-solve harnesses, browser QA or manual play. Treat every level as
> unverified at runtime until a playtest pass is done.

## Product model

XS / S / M / L / XL are **venue / production scale**, not difficulty. Order is fixed:

| Scale | Mission (slug) | Venue | Venue description | 3D environment |
|---|---|---|---|---|
| XS | ห้องประตูแรกแห่งภาพ (`gate-of-first-light`) | ห้องเรียน | งานขนาดเล็ก ฝึกพื้นฐาน | `components/game/environment/venue/classroom.tsx` |
| S | สะพานจันทราแห่งเสียง (`moonbridge-of-echoes`) | ห้องสตูดิโอ | งาน Production ในสตูดิโอ | `components/game/environment/venue/studio.tsx` |
| M | หอคอยกระจกสลับภาพ (`mirror-tower-of-switching`) | หอประชุมอาคารกิจกรรม | งานเวที / กิจกรรมขนาดกลาง | `components/game/environment/venue/auditorium.tsx` |
| L | คลังผนึกพอร์ตโบราณ (`archive-of-ancient-ports`) | พื้นที่ภายนอกอาคาร | งาน Outdoor และระยะสายไกล | `components/game/environment/venue/outdoor.tsx` |
| XL | บัลลังก์จอมถ่ายทอด (`throne-of-the-grand-transmission`) | สนามกีฬาและงานถ่ายทอดสด | งานขนาดใหญ่ Full Live Production | `components/game/environment/venue/stadium.tsx` |

Mapping lives in `game/content/mission-catalog.ts` (`venueId`) and `app/play/page.tsx` (`scaleByVenue`).

Each venue has 5 levels with the same learning progression:
1 Video Path · 2 Audio Path · 3 Switching / Routing / Monitoring · 4 Ports + Troubleshooting · 5 Full Production.
Total: **25 scenarios**, ids `xs-1 … xl-5`. Full detail: `docs/VENUE_SCENARIO_MATRIX.md`.

## Architecture

- **Scenario data** — `game/training/venue-scenarios.ts` `buildVenueScenario(scale, level)` authors one signal graph per
  venue scale (devices, ports with direction / connector / signalType, cables, required routes, simulated actions) and
  slices it per level. React components contain no scenario rules. `SCENARIOS` in `game/training/scenarios.ts` merges
  these 25 with the legacy `hdmi-basic` and `studio-full` (academy free practice) scenarios.
- **Connection engine** — `game/training/hdmi-training.ts` (unchanged contract): OUTPUT → INPUT only; rejects
  OUTPUT→OUTPUT, INPUT→INPUT, wrong connector / XLR gender, signal-type mismatch, occupied port and any link that is not a
  required route of the current scenario. Rejections return a notice and leave state untouched.
- **Completion** — `isComplete`: every required route **and** every required action (wireless pairing, mixer
  gain/mute, OBS / encoder / network readiness, Program source selection) must be satisfied. Never cable-count based.
  OBS, encoder, network and wireless pairing are *scenario state only* — the game does not control real software.
- **Level 4 faults** — starts with part of the canonical graph pre-connected and some links missing, plus distractor
  cables (HDMI, USB-A, USB-C, XLR, 3.5 mm, 6.35 mm, SDI) and unprepared actions.
- **Progression** — `isDifficultyUnlocked`: level 1 open; level N requires N−1 completed in the same venue. Stored per
  player in the existing `mission-progress` record (`version: 1`, keys unchanged). Route validation
  (`game/security/route-validation.ts`) only accepts catalog slugs and levels 1–5.
- **Environments** — `components/game/environment/venue-environment.tsx` picks the venue scene; all five keep the same
  walkable footprint, table heights and collider layout so every scenario's ports and staging remain reachable.
  Shared props/colliders: `components/game/environment/venue/kit.tsx`.
- **Docs generation** — `node scripts/generate-venue-docs.mjs` regenerates `VENUE_SCENARIO_MATRIX.md` and
  `EQUIPMENT_INVENTORY.md` from the scenario data (documentation only; not a test).

## Equipment evidence

See `docs/EQUIPMENT_INVENTORY.md`. Summary:
- CONFIRMED: DeviceWell HDS7105 (S switcher), PMX-402D-USB chassis (S mixer).
- PROVISIONAL: S studio cameras (model + HDMI/SDI transport), S wireless system (photo suggests COMICA CVM-WM100 PLUS
  family; instructor said Saramonic), HP notebook SKU.
- UNKNOWN: S capture card model.
- Everything in XS, M, L, XL: GENERIC TRAINING MODEL (greybox placeholders, replaceable with Blender GLBs).

## Known gaps / open items

- Not tested, not playtested (by instruction for this milestone). Existing test files are preserved, not run.
- S camera transport defaults to HDMI; `buildVenueScenario("s", level, "SDI")` produces the SDI + converter variant,
  but there is no UI to choose it until the real cabling is verified.
- Generic equipment uses placeholder visuals with port labels; final GLBs pending.
- The S environment is a procedural TV studio built at the user's request; the original
  `public/models/environment/studio-room-01.glb` remains in the repo but is no longer loaded by mission mode.
- Scenario equipment placement is automatic (perimeter of the centre table + staging table); dense levels (XL-5)
  may crowd port labels — needs a visual pass during playtest.
