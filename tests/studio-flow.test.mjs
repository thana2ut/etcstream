import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the project's TypeScript source directly without adding a runtime dependency.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(projectRoot, request.slice(2)) : request;
  return resolveFilename.call(this, resolved, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(output, filename);
};

const load = createRequire(import.meta.url);
const { getPort, initialTrainingState, interactWithTarget, placeHeldOnCenterTable, requirementDone, trainingProgress, trainingTotal } = load("../game/training/hdmi-training.ts");
const { monitorFeed } = load("../game/training/monitor-feed.ts");
const end = (cableId, side) => ({ kind: "end", cableId, end: side });
const port = (portId) => ({ kind: "port", portId });
const action = (actionId) => ({ kind: "action", actionId });
const act = (state, target) => interactWithTarget(state, target);

function place(state, itemId) {
  state = act(state, { kind: "item", itemId });
  return placeHeldOnCenterTable(state, [0, 0.81, 0]);
}
const placeSwitcher = (state) => place(state, "switcher");
const DEVICES = ["switcher", "mixer", "capture", "computer", "mic", "rx", "tx1", "tx2"];
const placeAll = (state) => DEVICES.reduce(place, state);
/** Plug cable end "a" into `first`, end "b" into `second`. */
function patch(state, cableId, first, second) {
  state = act(act(state, end(cableId, "a")), port(first));
  return act(act(state, end(cableId, "b")), port(second));
}
function plugLav(state, cableId, tx) {
  return act(act(state, end(cableId, "b")), port(tx));
}
function fullStudio() {
  let s = placeAll(initialTrainingState("studio-full"));
  s = patch(s, "hdmi-1", "cam1:video-out", "sw:in1");
  s = plugLav(s, "lav-1", "tx1:mic-in");
  s = plugLav(s, "lav-2", "tx2:mic-in");
  // RX (3.5 mm) → 3.5 mm TRS cable → 3.5→6.35 adapter seated in mixer CH1 LINE
  s = act(act(s, end("adapter-35-635", "a")), port("mixer:ch1"));
  s = patch(s, "trs35-1", "rx:audio-out", "sock:adapter-35-635");
  s = patch(s, "xs1-xlr", "mic:xlr-out", "mixer:ch2-mic");
  s = act(s, action("mixer-level"));
  // Mixer MAIN OUT (6.35 mm) → 6.35 mm TRS cable → 6.35→3.5 adapter seated in switcher LINE IN
  s = act(act(s, end("adapter-635-35", "a")), port("sw:line-in"));
  s = patch(s, "trs635-1", "mixer:main-l", "sock:adapter-635-35");
  s = patch(s, "hdmi-2", "sw:pgm", "capture:hdmi-in");
  s = patch(s, "usb-ac", "pc:usb-in", "capture:usb-out");
  s = patch(s, "hdmi-3", "sw:multiview", "monitor:hdmi-in");
  s = patch(s, "speaker-trs", "mixer:main-r", "speaker:trs-in");
  return s;
}

test("studio flow completes only after every route and both steps (mixer level, OBS source)", () => {
  let s = fullStudio();
  assert.equal(monitorFeed(s), "multiview|1|camera");
  assert.equal(trainingTotal(s), 12);
  assert.equal(trainingProgress(s), 11);
  assert.equal(s.completed, false, "OBS source not selected yet");
  s = act(s, action("obs-source"));
  assert.equal(trainingProgress(s), 12);
  assert.equal(s.completed, true);
});

test("a seated adapter exposes a stable socket object for React selectors", () => {
  let s = placeAll(initialTrainingState("studio-full"));
  s = act(act(s, end("adapter-35-635", "a")), port("mixer:ch1"));
  const socket = getPort(s, "sock:adapter-35-635");
  assert.ok(socket);
  assert.strictEqual(getPort(s, "sock:adapter-35-635"), socket);
  assert.strictEqual(getPort({ ...s, notice: null }, "sock:adapter-35-635"), socket);
});

test("either physical HP USB-A jack completes the capture route and OBS step", () => {
  let s = fullStudio();
  const route = load("../game/training/scenarios.ts").SCENARIOS["studio-full"].requirements.find((r) => r.id === "capture-pc");
  s = act(s, port("pc:usb-in"));
  assert.equal(requirementDone(s, route), false);
  s = act(s, port("pc:usb-in-right"));
  assert.equal(s.cables["usb-ac"].a.portId, "pc:usb-in-right");
  assert.equal(requirementDone(s, route), true);
  assert.equal(act(s, action("obs-source")).completed, true);
});

test("a completed studio lesson loses completion when any required physical lead is removed", () => {
  const complete = act(fullStudio(), action("obs-source"));
  assert.equal(complete.completed, true);
  for (const cableId of ["hdmi-1", "hdmi-2", "hdmi-3", "trs35-1", "adapter-35-635", "xs1-xlr", "trs635-1", "adapter-635-35", "usb-ac", "speaker-trs"]) {
    const disconnected = act(complete, end(cableId, "a"));
    assert.equal(disconnected.completed, false, `${cableId} must invalidate the lesson`);
    assert.ok(trainingProgress(disconnected) < trainingTotal(disconnected), `${cableId} must remove progress`);
  }
});

test("Samsung TV follows the actual HDMI output and turns off when disconnected", () => {
  let s = placeSwitcher(initialTrainingState("studio-full"));
  assert.equal(monitorFeed(s), "off|0|empty");
  s = patch(s, "hdmi-2", "sw:pgm", "monitor:hdmi-in2");
  assert.equal(monitorFeed(s), "program|2|empty");
  s = patch(s, "hdmi-1", "cam1:video-out", "sw:in1");
  assert.equal(monitorFeed(s), "program|2|camera");
  s = act(s, port("monitor:hdmi-in2"));
  assert.equal(monitorFeed(s), "off|0|empty");
  let thirdInput = placeSwitcher(initialTrainingState("studio-full"));
  thirdInput = patch(thirdInput, "hdmi-3", "sw:multiview", "monitor:hdmi-in3");
  assert.equal(monitorFeed(thirdInput), "multiview|3|empty");
});

test("active Yamaha HS5 accepts mixer line output via XLR or TRS, never amplified speaker output", () => {
  const { SCENARIOS } = load("../game/training/scenarios.ts");
  const requirement = SCENARIOS["studio-full"].requirements.find((r) => r.id === "mixer-speaker");
  const ready = place(initialTrainingState("studio-full"), "mixer");
  const xlr = patch(ready, "speaker-xlr", "mixer:xlr-out-l", "speaker:xlr-in");
  assert.equal(requirementDone(xlr, requirement), true);
  const trs = patch(ready, "speaker-trs", "mixer:main-r", "speaker:trs-in");
  assert.equal(requirementDone(trs, requirement), true);
  const wrong = patch(ready, "speaker-trs", "mixer:spk-b-l", "speaker:trs-in");
  assert.equal(requirementDone(wrong, requirement), false);
  assert.equal(wrong.cables["speaker-trs"].b.portId, null);
});

test("switcher ports stay dead until the HDS7105 sits on the centre table", () => {
  let s = initialTrainingState("studio-full");
  s = act(act(s, end("hdmi-1", "a")), port("cam1:video-out"));
  s = act(s, end("hdmi-1", "b"));
  const blocked = act(s, port("sw:in1"));
  assert.equal(blocked.cables["hdmi-1"].b.portId, null);
  assert.equal(blocked.notice.tone, "error");
});

test("wrong connector, wrong direction and wrong route are rejected", () => {
  let s = placeSwitcher(initialTrainingState("studio-full"));
  // HDMI plug into a 3.5 mm jack
  s = act(s, end("hdmi-1", "a"));
  assert.equal(act(s, port("sw:line-in")).notice.title, "หัวสายไม่ตรงกับพอร์ต");
  // OUTPUT → OUTPUT
  s = act(s, port("cam1:video-out"));
  s = act(s, end("hdmi-1", "b"));
  assert.equal(act(s, port("sw:pgm")).cables["hdmi-1"].b.portId, null);
  // Camera straight to the capture card skips the switcher: not a studio route
  assert.equal(act(s, port("capture:hdmi-in")).cables["hdmi-1"].b.portId, null);
  // Wrong connector: a 3.5 mm lead cannot enter an HDMI input
  s = act(s, port("sw:in2"));
  s = act(s, end("trs35-1", "a"));
  assert.equal(act(s, port("sw:in3")).cables["trs35-1"].a.portId, null);
});

test("adapters: plug into a jack, expose a socket, and fall out cascades", () => {
  let s = placeAll(initialTrainingState("studio-full"));
  // 3.5 mm plug cannot go straight into the mixer's 6.35 mm LINE jack
  s = act(act(s, end("trs35-1", "a")), port("rx:audio-out"));
  s = act(s, end("trs35-1", "b"));
  assert.equal(act(s, port("mixer:ch1")).notice.title, "หัวสายไม่ตรงกับพอร์ต");
  s = placeHeldOnCenterTable(s, [0, 0.81, 0]);
  s = act(act(s, end("adapter-35-635", "a")), port("mixer:ch1"));
  s = act(act(s, end("trs35-1", "b")), port("sock:adapter-35-635"));
  assert.equal(s.cables["trs35-1"].b.portId, "sock:adapter-35-635");
  s = act(act(s, end("lav-1", "b")), port("tx1:mic-in"));
  s = act(act(s, end("lav-2", "b")), port("tx2:mic-in"));
  s = patch(s, "xs1-xlr", "mic:xlr-out", "mixer:ch2-mic");
  s = act(s, action("mixer-level"));
  assert.equal(s.actionsDone["mixer-level"], true, "route counted through the adapter");
  s = act(s, end("adapter-35-635", "a")); // pull the adapter
  assert.equal(s.cables["trs35-1"].b.portId, null);
  assert.equal(s.actionsDone["mixer-level"], false);
});

test("OBS reports the first missing link, and unplugging undoes dependent steps", () => {
  let s = placeSwitcher(initialTrainingState("studio-full"));
  const early = act(s, action("obs-source"));
  assert.equal(early.actionsDone["obs-source"], false);
  assert.match(early.notice.detail, /Camera/);
  s = fullStudio();
  s = act(s, action("obs-source"));
  assert.equal(s.completed, true);
  s = act(s, end("trs35-1", "a")); // pull the receiver lead
  assert.equal(s.actionsDone["mixer-level"], false);
  assert.equal(s.actionsDone["obs-source"], false);
  assert.equal(s.completed, false);
});

test("lifting the switcher unplugs its ports", () => {
  let s = fullStudio();
  s = act(s, { kind: "item", itemId: "switcher" });
  assert.equal(s.cables["hdmi-1"].b.portId, null);
  assert.equal(s.cables["hdmi-1"].a.portId, "cam1:video-out");
  assert.equal(s.completed, false);
});

test("lavaliers ship plugged into their TX and cannot be unplugged or picked up", () => {
  let s = initialTrainingState("studio-full");
  const lav1 = load("../game/training/scenarios.ts").SCENARIOS["studio-full"].requirements.find((r) => r.id === "lav1");
  assert.equal(s.cables["lav-1"].a.portId, "lav1:mic");
  assert.equal(s.cables["lav-1"].b.portId, "tx1:mic-in");
  assert.equal(requirementDone(s, lav1), true);
  for (const side of ["a", "b"]) assert.equal(act(s, end("lav-1", side)).held, null);
  assert.equal(act(s, port("tx1:mic-in")).held, null);
  s = place(s, "tx1"); // carrying the TX keeps its mic attached
  assert.equal(s.cables["lav-1"].b.portId, "tx1:mic-in");
  assert.equal(requirementDone(s, lav1), true);
});

test("equipment starts on the left table, cables on the right, and devices must be carried to the centre", () => {
  let s = initialTrainingState("studio-full");
  for (const id of DEVICES) assert.ok(s.items[id].position[0] < -4, `${id} on the equipment table`);
  for (const id of ["hdmi-1", "trs35-1", "usb-ac", "ts635-1", "trs635-1"]) assert.ok(s.cables[id].a.loosePosition[0] > 4, `${id} on the cable table`);
  // Mixer still on the equipment table: its inputs are not reachable yet
  s = act(s, end("ts635-1", "a"));
  assert.equal(act(s, port("mixer:ch1")).notice.tone, "error");
  s = placeHeldOnCenterTable(s, [0, 0.81, 0]);
  s = place(s, "mixer");
  s = act(act(s, end("ts635-1", "b")), port("mixer:ch1"));
  assert.equal(s.cables["ts635-1"].b.portId, "mixer:ch1");
});

test("a wrongly picked device or cable can be put back on its side table", () => {
  let s = initialTrainingState("studio-full");
  const start = s.items.computer.position;
  s = act(s, { kind: "item", itemId: "computer" });
  s = placeHeldOnCenterTable(s, [-4.3, 0.8, 0.5]);
  assert.equal(s.heldItem, null);
  assert.deepEqual(s.items.computer.position, start);
  s = act(s, end("hdmi-3", "a"));
  s = placeHeldOnCenterTable(s, [4.4, 0.8, 1.0]);
  assert.equal(s.held, null);
  const fresh = initialTrainingState("studio-full").cables["hdmi-3"];
  assert.deepEqual(s.cables["hdmi-3"].a.loosePosition, fresh.a.loosePosition);
  assert.deepEqual(s.cables["hdmi-3"].b.loosePosition, fresh.b.loosePosition, "a carried lead goes back whole");
});

test("the PMX-402D-USB exposes every jack and they accept the matching plug", () => {
  const { SCENARIOS } = load("../game/training/scenarios.ts");
  const mixerPorts = Object.entries(SCENARIOS["studio-full"].ports).filter(([, p]) => p.device === "mixer");
  assert.equal(mixerPorts.length, 23);
  let s = place(initialTrainingState("studio-full"), "mixer");
  // Plugs that do not match the jack are refused (a 3.5 mm plug cannot enter the XLR mic input).
  s = act(s, end("trs35-1", "a"));
  assert.equal(act(s, port("mixer:ch1-mic")).notice.title, "หัวสายไม่ตรงกับพอร์ต");
  s = placeHeldOnCenterTable(s, [0, 0.81, 0]);
  s = act(s, end("hdmi-1", "a"));
  assert.equal(act(s, port("mixer:rec-l")).notice.title, "หัวสายไม่ตรงกับพอร์ต");
});
