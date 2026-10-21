# Venue visual references (target look for the 3D rooms)

Concept images and prompts supplied by the project owner on 2026-10-15/16. They are the **design target** for rebuilding each
mission room one at a time. Images live in `art/reference/venues/` (1672×941 WebP, two angles per venue).

Shared style line used for every image:

> Create a highly realistic, game-ready environment concept in a cinematic architectural visualization style. The image must
> look like a polished next-generation 3D game environment, with believable materials, realistic lighting, clean composition,
> detailed equipment placement, physically plausible layout, and professional staging. No people. No fantasy elements. No UI.
> No floating labels. No text overlays. No logos. Focus on realism, functionality, and production-ready room design. Wide-angle
> view, high detail, realistic reflections, realistic shadows, and clean spatial organization. Make the room feel usable in
> real life, not just decorative.

## Mapping to the game

| # | Reference | Images | Game venue (`VenueId`) | Mission chapter | Scenario scale |
|---|---|---|---|---|---|
| 1 | Classroom / training room | `classroom-01`, `classroom-02` | `classroom` · ห้องเรียน | บทที่ 01 ห้องประตูแรกแห่งภาพ | `xs-1..5` |
| 2 | Broadcast studio | `studio-01`, `studio-02` | `studio` · ห้องสตูดิโอ | บทที่ 02 สะพานจันทราแห่งเสียง | `s-1..5` |
| 3 | Large meeting room | `auditorium-meeting-01`, `-02` | `auditorium` · หอประชุมอาคารกิจกรรม | บทที่ 03 | `m-1..5` |
| 4 | Outdoor event area | `outdoor-01`, `outdoor-02` | `outdoor` · พื้นที่ภายนอกอาคาร | บทที่ 04 | `l-1..5` |
| 5 | Stadium broadcast area | `stadium-01`, `stadium-02` | `stadium` · สนามกีฬาและงานถ่ายทอดสด | บทที่ 05 บัลลังก์จอมถ่ายทอด | `xl-1..5` |

> **Venue 3 decision (2026-10-16):** retain the large auditorium, stage, audience blocks, three aisles and rear production desks.
> Adapt the meeting-room references through warm wood slats, neutral carpet, acoustic ceiling islands, linear lighting,
> wood audience tables, black conference chairs, table microphones, windows with blinds, front speakers, camera and AV rack.
> Preserve all mission device positions, furniture footprints and cable routes. Decorative equipment is not an extra mission device.
> Implemented in `auditorium.tsx`; desktop in-game visual and walking checks completed on 2026-10-16 (see `VENUE_REVIEW_2026-10-16.md`). Owner visual approval remains separate.

The existing 3D rooms are code-built (`components/game/environment/venue/*.tsx`, layouts in
`game/training/venue-layouts.ts`). Rebuilding a room must keep every port, control and cable start inside the layout bounds
(`tests/venue-scenarios.test.mjs` → "venue placement") and keep the canonical routes playable.

## Build checklist per room (from the prompts)

### 1 · Classroom / training room
- Rows of rectangular desks (light wood top, black metal frame), blue chairs, clear centre + side aisles.
- Front wall: large projector screen centred; teacher desk below with monitor, keyboard, small control gear, mic.
- Front-left: mobile whiteboard. Front-right: secondary display on a stand.
- Left wall: large windows with blinds; camera on tripod aimed at the front; softbox / LED panel on a stand; equipment cart
  with wireless receivers and small AV gear.
- Right wall: tall metal shelving (camera cases, coiled cables, mics, headsets, tripods, interfaces, boxes); side table with a
  small mixer, headphones, wireless charging docks.
- Grey/blue acoustic panels, wall speakers at the front corners, suspended ceiling with LED panels, vents, ceiling projector,
  polished tile floor, plants front-right and by the windows.

### 2 · Broadcast studio
- Zone A: news set — illuminated desk, two presenter chairs, large video backdrop, blue accent light, wood slats, LED strips.
- Zone B: large green-screen cyclorama (curved wall + floor), light stands and soft lights around it.
- Zone C: interview corner — two armchairs, round coffee table, rug, plant.
- Floor: several pedestal / tripod cameras facing the sets, one camera on a track, teleprompters on one or two cameras,
  cables in floor covers.
- Control desk: multiview monitors, video switcher, audio mixer, headphones, comms; racks, road cases, cable reels, carts.
- Dense overhead lighting grid with softboxes, spots, hanging monitors; dark ceiling, reflective floor, dark acoustic + wood walls.

### 3 · Large meeting room
- Very large wood conference table with dark centre cable strip, recessed ports, central touch panel.
- Many high-back black leather rolling chairs; gooseneck mic at every seat.
- Front wall: huge display centred, PTZ camera above, wall speakers both sides, low AV credenza below.
- Right of the front wall: lectern with mic; tall AV rack (processors, audio, network, wireless mic receivers); side cabinet
  with handheld wireless mics in charging docks.
- One wall of windows with roller blinds (city / campus view); plants by the windows and in the front corners.
- Warm recessed + cove lighting, layered acoustic ceiling (wood + perforated), wood slat walls, neutral carpet tiles.

### 4 · Outdoor event area
- Main stage at one end: truss roof, side speaker towers, hanging line arrays, stage lights, large central LED screen,
  monitor wedges along the stage front.
- Audience: large chair grid with centre + side aisles; crowd barriers separating it from FOH.
- FOH in the middle distance under a white canopy: mixing console, monitors, comms, road cases.
- Side technical tents (racks, power, support gear).
- Ground: heavy cable runs under yellow-black cable ramps, cable reels, power distribution boxes, stacked flight cases.
- Surroundings: trees, campus buildings, plaza paving, plain banners, lighting towers near the audience front.

### 5 · Stadium broadcast area (night)
- Sideline technical compound: broadcast camera on heavy tripod / pedestal aimed at the pitch, field monitor, power units.
- Field mics with wind protection along the sideline.
- Raised commentator desk on a platform with several chairs.
- Broadcast control tent: monitor wall of camera feeds, video switcher, audio consoles, racks, comms, chairs.
- Flight cases, cable reels, power boxes, cable ramps across the floor; metal barriers.
- Pitch with markings and a goal; LED perimeter boards (no text); large grandstand under a roof canopy; floodlight towers;
  big stadium screen.


## Implementation progress · 2026-10-16

- Auditorium: retained large-hall layout; reference materials and conference equipment applied. Stage plants and acoustic panels added; the decorative front AV rack has its own matching physical collider.
- Outdoor: covered four-post stage rig, blue LED backdrop, hanging line arrays, stage lights and monitor wedges, white audience chairs, white control/support tents, delay towers, FOH monitors, crowd rails, service cables and yellow/black ramps. Main scenario devices and layout positions are unchanged. Added props use the stage footprint or sit outside the site perimeter; crowd rails have matching colliders and leave centre and side routes clear.
- Outdoor facade: separate glass, frame and mullion depths to eliminate coplanar flickering observed during the walkthrough.
- All new geometry uses the existing Three.js primitives, textures and instancing helpers; no new dependency or remote asset.
- Screenshot evidence and walking notes: `VENUE_REVIEW_2026-10-16.md`. Stadium and the shared Thai 3D font pass are implemented; see the review notes below.


### Stadium and Thai scene text · 2026-10-16

- Stadium keeps the original three mission zones and all device/port heights. The control compound now has a white canopy, fabric walls, a vinyl pitch-facing window, a dark Thai entry sign, decorative monitor feeds and operator chairs.
- Added a shallow commentator plinth inside the existing desk footprint (not a walk-on stage, to keep microphone heights unchanged), three chairs and headsets; added matching chair colliders.
- Added road cases, cable reels, power box, low yellow/black cable ramps, perimeter crowd barriers and windshield-covered field mics. Floor cases and reels have matching colliders. Original cameras and mission gear remain interactive.
- Empty red/white/blue seating, access aisles and a far-stand canopy follow the reference. The near stand is moved behind the compound instead of intersecting it. Floodlight heads face the pitch; stadium screen and unbranded LED boards use procedural graphics.
- Fixed generic display classification: large monitors/projector displays are screens regardless of height; processors/converters remain technical units. No port or scenario definitions changed.
- All 3D text uses the existing local `Kart-chinesestyle.ttf` through `game/rendering/scene-font.ts`. Canvas signs load the named FontFace before the scene mounts, so cached signs use Kart on first entry. Thai port/action/device/furniture labels are covered by a font-glyph regression test.
- Kart lacks a few technical symbols. 3D labels use readable equivalents (`->`, `<->`, `|`, `ohm`, `OK`) without changing the underlying port/signal data or relying on remote font fallback. Original font binaries are unchanged.
- `GameCanvas` shows Thai loading/error text and a retry button if the local font cannot load. New tests verify glyph coverage, a shared load request and retry after failure.
- Desktop visual/walking review completed in levels 1 and 5; owner art approval and mobile/performance validation remain separate. Decorative feeds are static training graphics, while the existing mission monitor continues to show signal state.
