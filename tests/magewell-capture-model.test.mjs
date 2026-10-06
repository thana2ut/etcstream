import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buffer = fs.readFileSync(path.join(root, "public/models/equipment/magewell-capture.glb"));
const jsonLength = buffer.readUInt32LE(12);
const nodes = JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength)).nodes;
const node = (name) => nodes.find((entry) => entry.name === name);

test("Magewell model has opposite HDMI and USB Type-A ports aligned with playable sockets", () => {
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  const hdmi = node("PORT_HDMI_IN");
  const usb = node("PORT_USB_3_0");
  assert.ok(hdmi);
  assert.ok(usb);
  assert.equal(hdmi.extras.connector, "HDMI Type-A");
  assert.equal(usb.extras.connector, "USB 3.0 Type-A");
  assert.equal(hdmi.extras.direction, "INPUT");
  assert.equal(usb.extras.direction, "OUTPUT");
  assert.ok(hdmi.translation[0] < 0 && usb.translation[0] > 0);
  assert.ok(node("USB Capture HDMI legend"));
  assert.ok(node("MAGEWELL logo"));

  const scenario = fs.readFileSync(path.join(root, "game/training/scenarios.ts"), "utf8");
  assert.match(scenario, /"capture:usb-out"[^\n]+connector: "USB-A"/);
  assert.match(scenario, /"usb-ac"[^\n]+\["USB-A", "USB-A"\]/);
});
