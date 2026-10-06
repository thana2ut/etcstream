import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buffer = fs.readFileSync(path.join(root, "public/models/equipment/sennheiser-xs1.glb"));
const jsonLength = buffer.readUInt32LE(12);
const nodes = JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength)).nodes;
const find = (name) => nodes.find((node) => node.name === name);

test("XS 1 model has a three pin XLR output at its base and its own grille", () => {
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  const port = find("PORT_XLR_OUTPUT");
  assert.ok(port);
  assert.equal(port.extras.connector, "XLR 3-pin male");
  assert.equal(port.extras.direction, "OUTPUT");
  assert.ok(port.translation[0] < 0);
  assert.ok(find("tapered handheld barrel"));
  assert.ok(find("grille backing"));
  assert.ok(find("woven grille shell"), "the grille strands should export as one continuous render mesh");
  assert.ok(find("recessed power switch track"));
  const track = find("recessed power switch track");
  assert.ok(track.translation[1] > .038 && track.translation[1] < .041, "the switch track must sit against the barrel");
});
