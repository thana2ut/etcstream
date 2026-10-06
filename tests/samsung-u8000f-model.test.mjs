import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buffer = fs.readFileSync(path.join(root, "public/models/equipment/samsung-u8000f.glb"));
const length = buffer.readUInt32LE(12);
const nodes = JSON.parse(buffer.toString("utf8", 20, 20 + length)).nodes;

test("Samsung TV has a thin display body and three separately positioned HDMI inputs", () => {
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  assert.ok(nodes.some((node) => node.name === "slim U8000F outer chassis"));
  assert.ok(nodes.some((node) => node.name === "seamless front glass"));
  assert.ok(nodes.some((node) => node.name === "SAMSUNG lower bezel wordmark"));
  for (let index = 1; index <= 3; index++) {
    const port = nodes.find((node) => node.name === `PORT_HDMI_${index}`);
    assert.ok(port, `HDMI ${index} anchor missing`);
    assert.equal(port.extras.connector, "HDMI Type-A");
    assert.equal(port.extras.direction, "INPUT");
    assert.ok(Math.abs(port.translation[0] - .315) < .001);
    assert.ok(Math.abs(port.translation[1] - (-.095 - (index - 1) * .065)) < .001);
    assert.ok(port.translation[2] < 0, "HDMI jacks face the back");
  }
});
