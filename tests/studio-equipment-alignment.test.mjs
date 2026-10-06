import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._extensions[".ts"] = (module, file) => {
  const source = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, resolveJsonModule: true } }).outputText;
  module._compile(js, file);
};
const require = createRequire(import.meta.url);
const { SCENARIOS } = require("../game/training/scenarios.ts");
const { STUDIO } = require("../game/training/studio-room-layout.ts");
const pmx = require("../game/training/pmx402d-ports.json");
const studio = SCENARIOS["studio-full"];
const device = (id) => studio.devices.find((entry) => entry.id === id);

function anchor(asset, name) {
  const bytes = fs.readFileSync(path.join(root, "public/models/equipment", `${asset}.glb`));
  assert.equal(bytes.toString("ascii", 0, 4), "glTF");
  const length = bytes.readUInt32LE(12);
  const glb = JSON.parse(bytes.toString("utf8", 20, 20 + length));
  const node = glb.nodes.find((entry) => entry.name === name);
  assert.ok(node, `${asset}: missing ${name}`);
  return node.translation;
}

function aligned(portId, world, tolerance = .002) {
  const actual = studio.ports[portId]?.position;
  assert.ok(actual, `missing playable port ${portId}`);
  world.forEach((value, axis) => assert.ok(Math.abs(actual[axis] - value) < tolerance,
    `${portId} axis ${axis}: playable ${actual[axis]} vs model ${value}`));
}
const add = (base, local, scale = 1) => base.map((value, axis) => value + local[axis] * scale);

test("each studio equipment jack sits on its rendered GLB connector", () => {
  aligned("cam1:video-out", add(device("cam1").position, anchor("hc-x2000", "PORT_VIDEO_OUT")));
  aligned("mic:xlr-out", add(device("mic").position, anchor("sennheiser-xs1", "PORT_XLR_OUTPUT")));
  aligned("capture:hdmi-in", add(device("capture").position, anchor("magewell-capture", "PORT_HDMI_IN"), 3.2));
  aligned("capture:usb-out", add(device("capture").position, anchor("magewell-capture", "PORT_USB_3_0"), 3.2));
  aligned("rx:audio-out", add(device("rx").position, anchor("comica-wm100-plus-rx", "PORT_AUDIO_OUT")));
  for (const id of ["tx1", "tx2"]) aligned(`${id}:mic-in`, add(device(id).position, anchor("comica-wm100-plus-tx", "PORT_MIC_IN")));
  const hpScale = .56 / .358;
  aligned("pc:usb-in", add(device("computer").position, anchor("hp-laptop", "PORT_USB_A_LEFT"), hpScale));
  aligned("pc:usb-in-right", add(device("computer").position, anchor("hp-laptop", "PORT_USB_A_RIGHT"), hpScale));
  for (let index = 1; index <= 3; index++) {
    const id = index === 1 ? "monitor:hdmi-in" : `monitor:hdmi-in${index}`;
    aligned(id, add(STUDIO.equipment.monitor, anchor("samsung-u8000f", `PORT_HDMI_${index}`)));
  }
  // The HS5 is mounted facing -X; its rear panel faces +X in the room.
  for (const [id, name] of [["speaker:xlr-in", "PORT_XLR_INPUT"], ["speaker:trs-in", "PORT_TRS_INPUT"]]) {
    const [x, y, z] = anchor("yamaha-hs5", name);
    aligned(id, [STUDIO.speaker[0] - z, y, STUDIO.speaker[2] + x]);
  }
});

test("all interactive mixer ports match their exported anchors", () => {
  const names = { CH1_LINE: "mixer:ch1", CH2_LINE: "mixer:ch2", CH3_LINE: "mixer:ch3", CH4_LINE: "mixer:ch4", MAIN_OUT_L: "mixer:main-l", MAIN_OUT_R: "mixer:main-r" };
  for (const [key, port] of Object.entries(pmx.ports)) {
    if (port.direction !== "INPUT" && port.direction !== "OUTPUT") continue;
    const id = names[key] ?? `mixer:${key.toLowerCase().replaceAll("_", "-")}`;
    aligned(id, add(device("mixer").position, anchor("pmx402d", `PORT_${key}`)));
  }
});
