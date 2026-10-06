import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = JSON.parse(fs.readFileSync(path.join(projectRoot, "game/training/studio-room-layout.data.json"), "utf8"));

function glbNodes(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  const jsonLength = buffer.readUInt32LE(12);
  return JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength)).nodes;
}

const model = layout.switcherModel;
const nodes = glbNodes(path.join(projectRoot, "public", model.url));
const anchor = (name) => nodes.find((node) => node.name === name);

test("HDS7105 GLB exposes every real rear-panel port with connector metadata", () => {
  const expected = ["CONTROL", "LINE_OUT", "LINE_IN", "MIC_IN_2", "MIC_IN_1", "TALLY", "DCB_1", "DCB_2", "STREAM",
    "PGM", "MULTIVIEW", "IN4", "IN3", "IN2", "IN1", "DP_IN1", "DC_12V", "POWER"];
  for (const id of expected) {
    const node = anchor(`PORT_${id}`);
    assert.ok(node, `missing PORT_${id}`);
    assert.equal(node.extras.port_id, id);
  }
  assert.equal(anchor("PORT_IN1").extras.connector, "HDMI Type-A");
  assert.equal(anchor("PORT_IN1").extras.direction, "INPUT");
  assert.equal(anchor("PORT_PGM").extras.direction, "OUTPUT");
});

test("switcher ports on the centre-table zone sit on the scaled HDS7105 IN1 and PGM anchors (±1 mm)", () => {
  const [px, py, pz] = layout.equipment.switcher;
  const cos = Math.cos(model.rotationY), sin = Math.sin(model.rotationY);
  for (const [portId, anchorName] of Object.entries(model.portAnchors)) {
    const [x, y, z] = anchor(anchorName).translation.map((value) => value * model.scale);
    const world = [px + x * cos + z * sin, py + y, pz - x * sin + z * cos];
    layout.ports[portId].forEach((value, axis) => assert.ok(Math.abs(value - world[axis]) <= 0.001, `${portId} axis ${axis}: ${value} vs ${world[axis]}`));
  }
  assert.deepEqual(layout.equipment.switcher, layout.placementZones.switcher);
  assert.deepEqual(model.portAnchors, { "switcher:hdmi-in": "PORT_IN1", "switcher:hdmi-out": "PORT_PGM" });
});
