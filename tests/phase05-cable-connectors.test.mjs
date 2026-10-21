import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { SCENARIOS } from "./helpers/solver.mjs";

// Physical connector family each venue connector must be drawn with (Phase 05 connector-head library).
const EXPECT = { HDMI: ["hdmi"], SDI: ["sdi"], "XLR-F": ["xlr-f"], "XLR-M": ["xlr-m"], "3.5mm": ["trs35"], "6.35mm": ["trs635"], "USB-A": ["usba3"], "USB-B": ["usbb"], "USB-C": ["usbc"],
  ETHERNET: ["ethernet"], speakON: ["speakon"], MULTICORE: ["multicore"], CONTROL: ["logical"], FIBER: ["smpte", "optical", "lc-duplex"] };
const venues = Object.values(SCENARIOS).filter((s) => s.venueScale);

test("Phase 05: all 25 missions draw every lead with its real connector family (no DisplayPort fallback)", () => {
  assert.equal(venues.length, 25);
  for (const s of venues) for (const c of s.cables) c.ends.forEach((end, i) => {
    assert.ok(EXPECT[end], `${s.id}:${c.id} unknown connector ${end}`);
    assert.ok(EXPECT[end].includes(c.plugs[i]), `${s.id}:${c.id} ${end} drawn as ${c.plugs[i]}`);
  });
});

test("camera hybrid is SMPTE; selected GAME Optical Fiber 12G uses LC duplex; CTRL-REPLAY stays logical", () => {
  let smpte = 0, optical = 0, logical = 0;
  for (const s of venues) for (const c of s.cables) {
    if (c.ends[0] === "FIBER" && c.purpose === "fiber-camera") { smpte++; assert.deepEqual(c.plugs, ["smpte", "smpte"], `${s.id}:${c.id}`); }
    if (c.ends[0] === "FIBER" && c.purpose !== "fiber-camera") { optical++; assert.deepEqual(c.plugs, ["lc-duplex", "lc-duplex"], `${s.id}:${c.id}`); }
    if (c.ends.includes("CONTROL")) { logical++; assert.deepEqual(c.plugs, ["logical", "logical"]); }
  }
  assert.ok(smpte > 0 && optical > 0 && logical > 0, `${smpte}/${optical}/${logical}`);
});

test("Phase 05: connector library keeps real-mm authoring, a single display factor and no LC/SC claim for the generic optical end", () => {
  const src = fs.readFileSync(new URL("../components/game/cable-plugs.tsx", import.meta.url), "utf8");
  assert.match(src, /export const MM = 0\.0056;/);
  const optical = src.slice(src.indexOf('case "optical"'), src.indexOf('case "multicore"'));
  assert.doesNotMatch(optical, /\bLC\b.*latch|SC square|ferrule/i);
  for (const style of ["hdmi", "sdi", "xlr-m", "xlr-f", "trs35", "trrs35", "ts635", "trs635", "rca", "usba3", "usbb", "usbc", "ethernet", "smpte", "optical", "multicore", "logical", "lav", "speakon", "adapter35to635", "adapter635to35"])
    assert.ok(src.includes(`case "${style}"`), style);
});

test("Phase 05: cable-prep 3D viewer uses the same connector families (SMPTE, generic optical, USB-B, speakON, logical replay)", () => {
  const src = fs.readFileSync(new URL("../components/ui/cable-model.tsx", import.meta.url), "utf8");
  for (const [id, a, b] of [["FIB-CAMERA-CCU", "smpte", "smpte"], ["FIB-SDI-LINK", "optical", "optical"], ["DATA-USB-B", "usbb", "usba"], ["AUD-PA-PASSIVE", "speakon", "speakon"], ["CTRL-REPLAY", "logical", "logical"], ["STG-MULTICORE", "multicore", "multicore"]])
    assert.ok(src.includes(`"${id}": ["${a}", "${b}"]`), id);
});
