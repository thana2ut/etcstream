# Venue review · 2026-10-16

Local desktop browser, real `/missions/admin` → mission level 1 → prep lobby → game. Used the existing drag-to-look fallback and WASD controller, Rapier physics, mission gear and scene colliders. No progress completions, unlock changes, credential files or temporary routes were created. A temporary DOM position probe was used to record actual player movement, then removed before final checks.

## Auditorium

- Entry: (-10.665, 11.070); left aisle reached (-10.665, -4.673).
- Front cross-route: pass on the stage side of the presentation desk, at z about -5.25. The desk remains a physical obstacle; walking directly into it stops the player as expected.
- Centre aisle: (-0.104, -5.252) → (-0.104, 3.680). Walk around the camera riser to reach rear control area (-1.839, 10.936).
- Rear cable-rack bypass: use the rear corridor at z about 11.70. Right aisle reached (10.656, -4.041).
- Decorative AV rack: forward movement stopped at (10.656, -8.096), matching the rack front plus the 0.28 m player radius; backward movement released normally to z -6.473.
- Player body height stayed about y 0.799 throughout the measured floor routes. No console errors captured during this review.
- Adjusted overbright lighting; added right-wall acoustic panels and plants on the existing blocked stage. Lowered conference camera to clear the ceiling.
- Screenshots: [centre aisle](../art/review/venues/auditorium-centre.png), [right aisle](../art/review/venues/auditorium-right-aisle.png).

## Outdoor

- Entry (-14.580, 14.310) → control tent rear (5.268, 14.313); approach to the desk stopped normally near z 11.53.
- Camera-riser bypass to centre rail opening: (1.415, 4.247); centre aisle continued to (1.417, -3.647).
- Crowd rail collision stopped at (4.573, 4.479), matching rail z 4.1 + half-depth 0.1 + player radius 0.28. Side and centre openings remain available.
- Right service aisle reached (13.236, -6.301); camera B at (9.176, -6.301) was accessible.
- Front cross-route reached camera A area (-9.981, -6.243). Returned via left service aisle; reels correctly block direct walking, with an open perimeter bypass returning to (-15.636, 13.568).
- No console errors captured during the walkthrough. Fixed overlapping facade glass/frame surfaces and removed the decorative centre monitor that overlapped the real mission monitor.
- Screenshots: [control tent](../art/review/venues/outdoor-control-tent.png), [centre aisle](../art/review/venues/outdoor-centre-aisle.png).

## Scope and remaining review

These checks verify the sampled desktop walking routes and visual composition, not every possible path, mobile touch interaction, performance target or level combination. Existing automated scenario tests cover canonical signal routes and device placement. The room scale and simplified code-built geometry are adapted for gameplay; they are not photorealistic reproductions of the concept images. Final art approval belongs to the owner. Stadium and the shared Thai 3D font pass were subsequently completed and reviewed below.


## Stadium and Thai fonts

Reviewed real admin-entry level 1 and level 5 (full 76-step scenario) with the existing prep lobby, game controller and Rapier physics. No mission completion or unlock state was granted.

- Spawn (1.560, 1.560) → tent doorway → inside (-3.110, -1.836). Entered the production/audio aisle at (-5.593, -6.436) and approached the switcher at (-7.262, -5.036). New chairs leave the side aisle open.
- Returned through the same doorway to (-0.538, 0.911), then reached the field-side approach (-0.538, 7.181).
- Commentary desk: approached from the pitch side, stopped at (7.786, -1.401) against the desk as expected; three chairs remain behind the desk with room to walk around.
- In level 5, the central cable rack blocked direct movement at (1.524, 3.641). Went around its left side and the main camera platform, reaching (-1.814, 15.866).
- Reached both sideline camera positions: (-12.225, 15.813) and (12.228, 15.812).
- Right road case: movement stopped at (13.618, 4.789), matching case centre z 4.16 + half-depth 0.35 + player radius 0.28. Backed out to z 6.323 normally. Measured body height stayed near y 0.799 on the sampled routes.
- Corrected the large-monitor-as-rack rendering issue, gave the entry sign a dark backing, reduced the decorative monitor backing to fit under the canopy, and pointed floodlight heads toward the pitch.
- Thai entry sign and zone labels rendered with Kart; no console errors captured in either stadium run. Automated glyph checks include every scenario's device model/label, action, port label and layout furniture label. Missing technical symbols use equivalent notation only in 3D presentation.
- Existing font assets were reused unchanged; no font download, credential source edit or new runtime package.
- Screenshots: [control tent](../art/review/venues/stadium-control-tent.png), [pitch](../art/review/venues/stadium-pitch.png), [Thai entry sign](../art/review/venues/stadium-thai-sign.png).

New scene/typography sources: `game/rendering/scene-font.ts`; updates in `game-canvas.tsx`, `training-room.tsx`, equipment `device-visual.tsx` / `generic-device.tsx`, venue `kit.tsx` / `layout-furniture.tsx`, and the five venue files for shared canvas typography. Tests are in `tests/venue-scenarios.test.mjs`. Temporary position probes have been removed.

Limitations: sampled desktop routes and font rendering are verified, not every path or mobile device. Decorative screen feeds are static graphics; the authentic mission monitor retains actual simulated signal-state behavior. Geometry is a gameplay adaptation of the references. Final visual approval remains with the owner.


### Final validation for stadium / Thai font pass

- `npm run lint`: exit 0; one pre-existing unused-variable warning in the venue scenario tests (no errors).
- `npm run build`: passed, including TypeScript and all static routes.
- `npm test`: 83/83 passed, including 25 canonical venue scenarios and the two new font tests.
- `git diff --check`: passed; existing Windows LF/CRLF notices are informational.
- Final status inspected: changes remain local and uncommitted. No push, deployment, migration, seed or environment-file edit performed.
