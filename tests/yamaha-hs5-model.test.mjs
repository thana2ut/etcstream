import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buffer = fs.readFileSync(path.join(root, "public/models/equipment/yamaha-hs5.glb"));
const length = buffer.readUInt32LE(12);
const nodes = JSON.parse(buffer.toString("utf8", 20, 20 + length)).nodes;
const find = (name) => nodes.find((node) => node.name === name);

test("HS5 model contains front drivers and rear XLR/TRS input anchors", () => {
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  for (const name of ["HS5 rounded black cabinet", "white woofer diaphragm", "tweeter soft dome", "rear reflex tube", "rear panel screw", "IEC mains socket"]) {
    assert.ok(find(name), `missing ${name}`);
  }
  const xlr = find("PORT_XLR_INPUT");
  const trs = find("PORT_TRS_INPUT");
  assert.ok(xlr);
  assert.ok(trs);
  assert.equal(xlr.extras.connector, "XLR balanced");
  assert.equal(trs.extras.connector, "6.35 mm TRS balanced");
  assert.equal(xlr.extras.direction, "INPUT");
  assert.equal(trs.extras.direction, "INPUT");
  assert.ok(xlr.translation[0] < 0 && trs.translation[0] < 0);
  assert.ok(Math.abs(xlr.translation[1] - .558) < .001);
  assert.ok(Math.abs(trs.translation[1] - .478) < .001);
  assert.ok(xlr.translation[2] < 0 && trs.translation[2] < 0, "both sockets face the rear of the speaker");
});
