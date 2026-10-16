import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modelPath = path.join(projectRoot, "public/models/equipment/hp-laptop.glb");

function glbJson(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.toString("ascii", 0, 4), "glTF");
  const jsonLength = buffer.readUInt32LE(12);
  return JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength));
}

test("HP laptop GLB contains the visible parts from all seven reference views", () => {
  const glb = glbJson(modelPath);
  const names = new Set(glb.nodes.map((node) => node.name));
  for (const name of [
    "hp_base_lower_wedge", "hp_display_lid", "hp_display_screen", "hp_keyboard_keycaps",
    "hp_keyboard_legends", "hp_touchpad_surface", "hp_webcam_bar", "hp_lid_logo_0",
    "hp_rj45_port", "hp_hdmi_port", "hp_usb_a_left", "hp_usb_a_right", "hp_usb_c_port",
  ]) assert.ok(names.has(name), `missing ${name}`);
  assert.ok(glb.nodes.length >= 40, "model should retain its authored component structure");
  assert.ok(fs.statSync(modelPath).size > 500_000, "screen reference texture should be embedded");
});

test("training room uses the authored HP model instead of the procedural placeholder", () => {
  const visual = fs.readFileSync(path.join(projectRoot, "components/game/equipment/device-visual.tsx"), "utf8");
  const scenarios = fs.readFileSync(path.join(projectRoot, "game/training/scenarios.ts"), "utf8");
  assert.match(visual, /\/models\/equipment\/hp-laptop\.glb/);
  assert.match(scenarios, /HP 15\.6-inch \(ตามภาพอ้างอิง\)/);
});
