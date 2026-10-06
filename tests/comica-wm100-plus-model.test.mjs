import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function nodes(kind) {
  const buffer = fs.readFileSync(path.join(root, `public/models/equipment/comica-wm100-plus-${kind}.glb`));
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  return JSON.parse(buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12))).nodes;
}

test("COMICA RX and TX models expose top 3.5 mm ports at the playable locations", () => {
  const scenario = fs.readFileSync(path.join(root, "game/training/scenarios.ts"), "utf8");
  for (const [kind, anchorName, direction, x, y] of [
    ["rx", "PORT_AUDIO_OUT", "OUTPUT", 0.0391, 0.275],
    ["tx", "PORT_MIC_IN", "INPUT", 0.03565, 0.26],
  ]) {
    const model = nodes(kind);
    const anchor = model.find((node) => node.name === anchorName);
    assert.ok(anchor, `${kind} port missing`);
    assert.equal(anchor.extras.direction, direction);
    assert.equal(anchor.extras.connector, "3.5 mm TRS");
    assert.ok(Math.abs(anchor.translation[0] - x) < 0.0001);
    assert.ok(Math.abs(anchor.translation[1] - y) < 0.0001);
    assert.ok(model.some((node) => node.name === "LCD screen"));
    assert.ok(model.some((node) => node.name === "COMICA wordmark"));
  }
  assert.match(scenario, /"rx:audio-out"[^\n]+add\(rx, 0\.0391, 0\.275, 0\)/);
  assert.match(scenario, /"tx1:mic-in"[^\n]+add\(tx1, 0\.03565, 0\.26, 0\)/);
  assert.match(scenario, /"tx2:mic-in"[^\n]+add\(tx2, 0\.03565, 0\.26, 0\)/);
});

test("Magewell display enlargement keeps HDMI and USB sockets on its rendered ends", () => {
  const scenario = fs.readFileSync(path.join(root, "game/training/scenarios.ts"), "utf8");
  const visual = fs.readFileSync(path.join(root, "components/game/equipment/device-visual.tsx"), "utf8");
  assert.match(visual, /<group scale=\{3\.2\}>/);
  assert.match(scenario, /"capture:hdmi-in"[^\n]+add\(capture, -0\.15616, 0\.024, 0\)/);
  assert.match(scenario, /"capture:usb-out"[^\n]+add\(capture, 0\.15616, 0\.024, 0\)/);
});
