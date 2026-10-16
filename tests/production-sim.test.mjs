import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, MODELS, canConnect, traceTo, STAGES, STAGE_IDS, act, dropHeldEnd, setControl, runTest, simContext, requestAllClear, answerReview, setUp, attach, wire, solve } from "./helpers/solver.mjs";

/* ───────── coverage ───────── */
test("25 separately playable stages: 5 rooms × L1–L5, unique ids, tickets and validators", () => {
  assert.equal(STAGES.length, 25);
  assert.equal(STAGE_IDS.length, 25);
  assert.equal(new Set(STAGES.map((s) => s.id)).size, 25);
  assert.equal(new Set(STAGES.map((s) => s.ticket)).size, 25);
  for (const room of ["xs", "s", "m", "l", "xl"]) assert.deepEqual(STAGES.filter((s) => s.room === room).map((s) => s.guidance), ["guided", "partial", "scenario", "disruption", "certification"]);
});
test("every named model carries source_url, verified_ports and asset_license; generics are labelled", () => {
  for (const m of Object.values(MODELS)) {
    assert.ok(m.verifiedPorts.length > 0 && m.assetLicense, m.modelId);
    if (m.generic) assert.equal(m.manufacturer, "Generic Training Device", m.modelId);
    else assert.match(m.sourceUrl, /^https:\/\/(www\.)?(blackmagicdesign|proav\.roland|usa\.yamaha|shure|magewell)\./, m.modelId);
  }
});
test("all 25 stages present Thai instructions while retaining simulator identifiers", () => {
  const thai = /[ก-๙]/;
  for (const stage of STAGES) {
    for (const text of [stage.title, stage.subtitle, stage.ticket, ...stage.briefing, ...stage.passCriteria, stage.reward, ...stage.objectives.map((o) => o.label), ...stage.cues.map((c) => c.call)]) {
      assert.match(text, thai, `${stage.id}: ${text}`);
    }
    assert.match(stage.id, /^(XS|ST|AU|OUT|SP)-0[1-5]$/);
    for (const setting of stage.solutionConfig) {
      if (typeof setting.value === "string") assert.ok(!thai.test(setting.value), `${stage.id}: simulator value translated`);
    }
  }
});

/* ───────── five verified mission records per room (all 25 complete end-to-end) ───────── */
for (const id of STAGE_IDS) {
  test(`${SCENARIOS[id].stage.id} plays end-to-end to a certified/passed sign-off`, () => {
    const state = solve(id);
    assert.ok(state.completed, `${id}: ${state.notice?.title} ${state.notice?.detail}`);
    assert.match(state.notice.title, /^ผ่าน/);
  });
}
test("every L5 surprise fault (audio/video/network/recording) is recoverable end-to-end", () => {
  for (const id of STAGE_IDS.filter((x) => x.endsWith("-5"))) {
    SCENARIOS[id].stage.surpriseFaults.forEach((f, i) => {
      const s = solve(id, { seed: i });
      assert.ok(s.completed, `${id} / ${f.id}: ${s.notice?.detail}`);
      assert.ok(s.sim.recovered.includes(f.id) && s.sim.diagnosed.includes(f.id), `${id} / ${f.id} not logged as diagnosed + recovered`);
    });
  }
});
test("a green cable alone never completes a stage: wiring without configuration fails the signal test", () => {
  for (const id of STAGE_IDS) {
    let s = setUp(id);
    if (s.sim.weatherNow === "lightning") s = requestAllClear(setControl(s, "site", "decision", "NO-GO (hold)"));
    s = wire(s);
    s = runTest(s, "physical");
    s = runTest(s, "signal");
    assert.ok(!s.completed && !s.sim.testsPassed.signal, `${id} passed its signal test with no configuration`);
  }
});
test("L5 certifications reveal no route checklist and never pre-wire", () => {
  for (const id of STAGE_IDS.filter((x) => x.endsWith("-5"))) {
    const sc = SCENARIOS[id];
    assert.equal(sc.requirements.length, 0, id);
    assert.equal(sc.initialConnections.length, 0, id);
    assert.ok(sc.stage.surpriseFaults.length >= 4, id);
  }
});

/* ───────── room 01 (XS classroom) acceptance tests — EduStream 25-level wiring guide ───────── */
const XS = SCENARIOS["xs-5"].simDevices;
test("XS: source OUTPUT → switcher INPUT accepted; PROGRAM OUT → camera OUT rejected (output-to-output)", () => {
  assert.ok(canConnect(XS, "cam1:hdmi-out", "sw:hdmi-in-1").ok);
  assert.equal(canConnect(XS, "sw:hdmi-pgm-out", "cam1:hdmi-out").code, "OUTPUT_TO_OUTPUT");
  assert.ok(canConnect(XS, "sw:usb", "host:usb-1").ok, "USB WEBCAM DEVICE → notebook USB HOST");
});
test("XS: HDMI PROGRAM OUT and USB WEBCAM are independent — front display and OBS both follow source changes", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  for (const opt of ["HDMI 1", "HDMI 2", "HDMI 1"]) {
    s = setControl(s, "sw", "pgm", opt);
    const v = simContext(s).view;
    assert.equal(v.monitor.picture, v.sw.picture);
    assert.equal(v.host.picture, v.sw.picture);
  }
});
test("XS: wireless TX → RX has no cable; RX outputs audio only when paired on the same RF channel", () => {
  assert.ok(!MODELS["generic-wireless-tx"].ports.some((x) => x.dir === "OUTPUT"), "no physical TX→RX cord");
  let s = solve("xs-2", { stopAt: "signal" });
  assert.ok(simContext(s).view.mix.audio.includes("TEACHER VOICE"));
  assert.ok(!simContext(setControl(s, "rx", "pair", "Not paired")).view.mix.audio.includes("TEACHER VOICE"));
  assert.equal(simContext(setControl(s, "rx", "rf", "CH 2")).view.rx.problem.code, "RF_CHANNEL");
});
test("XS: MAIN/PA and STREAM/AUX are separate buses — room PA audible while the stream is silent", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  s = setControl(s, "mix", "ch1-aux", false);
  const v = simContext(s).view;
  assert.ok(v.pa.audio.includes("TEACHER VOICE"));
  assert.ok(!(v.host.audio ?? []).includes("TEACHER VOICE"));
});
test("XS: camera HDMI audio left ON doubles the voice in OBS (no double-counting allowed)", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  assert.deepEqual(simContext(s).view.host.audio, ["TEACHER VOICE"]);
  s = setControl(s, "sw", "emb-audio", "ON");
  assert.ok(simContext(s).view.host.audio.some((a) => a.startsWith("CAM MIC")));
  assert.equal(runTest(s, "signal").sim.testsPassed.signal, false);
});
test("XS: removing a mandatory link breaks the completed graph (no connected-count completion)", () => {
  const s = solve("xs-5");
  assert.ok(s.completed);
  const lead = SCENARIOS["xs-5"].canonical.find((c) => c.from === "mix:aux-out").cableId;
  const cut = dropHeldEnd(act(s, { kind: "end", cableId: lead, end: "b" }), [0, 0.8, 0]);
  assert.ok(!(simContext(cut).view.host.audio ?? []).includes("TEACHER VOICE"));
  assert.equal(runTest(cut, "signal").sim.testsPassed.signal, false);
});

/* ───────── room 02 programmatic tests ───────── */
const ST = SCENARIOS["s-5"].simDevices;
test("ST: MULTIVIEW is observation only — Capture fed from MV makes OBS show the grid, PGM OUT fixes it", () => {
  let s = solve("s-5", { stopAt: "signal" });
  assert.equal(simContext(s).view.host.picture, simContext(s).view.sw.picture);
  const mvLead = SCENARIOS["s-5"].canonical.find((c) => c.from === "sw:hdmi-mv-out").cableId;
  const pgmLead = SCENARIOS["s-5"].canonical.find((c) => c.from === "sw:hdmi-pgm-out").cableId;
  s = attach(s, mvLead, "b", "capture:hdmi-in");
  s = attach(s, pgmLead, "b", "monitor:hdmi-in");
  assert.match(simContext(s).view.host.picture, /^MULTIVIEW/);
  assert.equal(runTest(s, "signal").sim.testsPassed.signal, false);
});
test("ST: Capture USB is a DEVICE that must reach the notebook USB HOST", () => {
  assert.ok(canConnect(ST, "capture:usb", "host:usb-1").ok);
  assert.equal(canConnect(ST, "capture:usb", "sw:hdmi-pgm-out").code, "OUTPUT_TO_OUTPUT");
});
test("ST: each wireless mic is its own RX channel — unpairing RX 2 drops only the guest", () => {
  let s = solve("s-2", { stopAt: "signal" });
  s = setControl(s, "rx2", "pair", "Not paired");
  const a = simContext(s).view.mix.audio;
  assert.ok(a.includes("HOST VOICE") && !a.includes("GUEST VOICE"));
});
test("ST: Broadcast and Monitor buses are separate — HS5 keeps sound when the Broadcast send is off", () => {
  let s = solve("s-5", { stopAt: "signal" });
  for (const n of [1, 2, 3]) s = setControl(s, "mix", `ch${n}-aux`, false);
  const v = simContext(s).view;
  assert.ok(v.speaker.audio.includes("HOST VOICE"));
  assert.ok(!(v.host.audio ?? []).includes("HOST VOICE"));
});
test("ST: unplugging the Capture USB stops OBS but not the multiview", () => {
  let s = solve("s-5", { stopAt: "signal" });
  const lead = SCENARIOS["s-5"].canonical.find((c) => c.from === "capture:usb").cableId;
  s = dropHeldEnd(act(s, { kind: "end", cableId: lead, end: "b" }), [0, 0.8, 0]);
  const v = simContext(s).view;
  assert.ok(!v.host.picture && /MULTIVIEW/.test(v.monitor.picture));
});

/* ───────── room 03 deterministic engineering tests ───────── */
const AU = SCENARIOS["m-5"].simDevices;
test("AU: SDI into REF IN is rejected — reference is not a video input", () => {
  assert.equal(canConnect(AU, "cam2:sdi-out", "sw:ref-in").code, "REF_NOT_VIDEO");
  assert.ok(canConnect(AU, "cam2:sdi-out", "sw:sdi-in-2").ok);
});
test("AU: multicore mates only with multicore; SDI→HDMI converter is direction-specific", () => {
  assert.ok(canConnect(AU, "stagebox:multicore", "tail:multicore").ok);
  assert.ok(!canConnect(AU, "stagebox:multicore", "mix:in-1").ok);
  assert.ok(!canConnect(AU, "sw:sdi-out-1", "convHS:hdmi-in").ok);
});
test("AU: PA and Broadcast buses are separate — Broadcast send off keeps the room, silences OBS", () => {
  let s = solve("m-5", { stopAt: "signal" });
  s = setControl(s, "mix", "ch1-bc", false);
  const v = simContext(s).view;
  assert.ok(v.paL.audio.includes("PODIUM VOICE"));
  assert.ok(!(v.host.audio ?? []).includes("PODIUM VOICE"));
});
test("AU: stage display follows AUX — MULTIVIEW stays on the FOH monitor", () => {
  let s = solve("m-5", { stopAt: "signal" });
  s = setControl(s, "sw", "pgm", "SDI 5");
  const v = simContext(s).view;
  assert.equal(v.display.picture, "SLIDES");
  assert.match(v.monitor.picture, /^MULTIVIEW/);
  s = setControl(s, "sw", "aux", "SDI 3");
  assert.equal(simContext(s).view.display.picture, "CAM3 RIGHT");
});
test("AU: HyperDeck recording and OBS capture are independent outputs", () => {
  let s = solve("m-5", { stopAt: "signal" });
  const full = simContext(setControl(s, "rec", "media", "SD card mounted · FULL (0 GB)"));
  assert.ok(!full.view.rec.recording && full.view.host.picture);
});

/* ───────── room 04 validation cases ───────── */
const OUT = SCENARIOS["l-5"].simDevices;
test("OUT: HDMI→SDI converter emits only when powered; camera SDI into its SDI OUT is output-to-output", () => {
  assert.equal(canConnect(OUT, "cam1:sdi-out", "convHS:sdi-out").code, "OUTPUT_TO_OUTPUT");
  let s = solve("l-3", { stopAt: "signal" });
  assert.ok(simContext(s).inp["sw:sdi-in-3"]);
  s = setControl(s, "convHS", "power", false);
  assert.ok(!simContext(s).inp["sw:sdi-in-3"]);
});
test("OUT: Videohub wired IN2 → OUT2 but crosspoint OUT2 ← IN1 shows the wrong source until fixed", () => {
  let s = solve("l-3", { stopAt: "signal" });
  s = setControl(s, "vh", "xp-2", "IN 1");
  assert.match(simContext(s).inp["sw:sdi-in-1"].content, /FIELD SLIDES/);
  assert.equal(runTest(s, "signal").sim.testsPassed.signal, false);
});
test("OUT: UHD camera through the Videohub still fails the HD8 input (router does not convert)", () => {
  let s = solve("l-5", { stopAt: "signal" });
  s = setControl(s, "cam2", "format", "2160p50");
  assert.ok(simContext(s).inp["sw:sdi-in-2"], "router passes the UHD signal");
  assert.ok(!simContext(s).view.monitor.picture.includes("CAM-B"));
});
test("OUT: uncovered crossing or lightning GO blocks a pass even with live signals", () => {
  let s = solve("l-2", { stopAt: "signal" });
  s = setControl(s, "site", "ramp", false);
  assert.equal(runTest(s, "physical").sim.testsPassed.physical, false);
  let storm = setUp("l-5");
  storm = setControl(storm, "site", "decision", "GO");
  assert.ok(storm.sim.log.some((l) => l.code === "SAFETY_BYPASS"));
});
test("OUT: under-rated spool fails the 25 m run; a tested lead passes", () => {
  let s = solve("l-2", { stopAt: "signal" });
  const good = SCENARIOS["l-2"].canonical.find((c) => c.from === "cam2:sdi-out").cableId;
  s = act(s, { kind: "end", cableId: good, end: "a" }); s = dropHeldEnd(s, [0, 0.8, 0]);
  s = act(s, { kind: "end", cableId: good, end: "b" }); s = dropHeldEnd(s, [0, 0.8, 0]);
  s = attach(s, "x-weak", "a", "cam2:sdi-out"); s = attach(s, "x-weak", "b", "sw:sdi-in-2");
  assert.ok(!simContext(s).inp["sw:sdi-in-2"]);
});
test("OUT: WAN loss kills only the ingest; missing SSD fails ISO only; converter power loss kills only its path", () => {
  let s = solve("l-5", { stopAt: "signal" });
  s = setControl(setControl(s, "sw", "stream", true), "sw", "record", true);
  const down = simContext(setControl(s, "net", "wan-link", "Down (ISP outage)"));
  assert.ok(!down.view.wan.live && down.view.ssd.recording && down.view.pgm.picture);
  const disk = simContext(setControl(s, "ssd", "state", "Not mounted"));
  assert.ok(!disk.view.ssd.recording && disk.view.wan.live);
  const conv = simContext(setControl(s, "convSH", "power", false));
  assert.ok(!conv.view.pgm.picture && conv.view.wan.live && conv.view.monitor.picture);
});

/* ───────── room 05 automated traps ───────── */
const SP = SCENARIOS["xl-5"].simDevices;
test("SP 1: Constellation Ethernet → WAN alone cannot stream; SDI PGM → Streaming Encoder HD → WAN can", () => {
  let s = solve("xl-5", { stopAt: "signal" });
  s = setControl(s, "enc", "stream", true);
  assert.ok(simContext(s).view.wan.live);
  const encEth = SCENARIOS["xl-5"].canonical.find((c) => c.from === "enc:eth").cableId;
  s = attach(s, encEth, "a", "sw:eth");
  assert.ok(!simContext(s).view.wan.live);
});
test("SP 2: converters are direction-specific; UHD camera fails the Constellation 3G input", () => {
  assert.equal(canConnect(SP, "cam1:sdi-out", "convHS:sdi-out").code, "OUTPUT_TO_OUTPUT");
  assert.equal(canConnect(SP, "gfx:hdmi-out", "convA:sdi-in").code, "VIDEO_CLASS");
  let s = solve("xl-1", { stopAt: "signal" });
  s = setControl(s, "cam1", "format", "2160p50");
  assert.ok(!simContext(s).view.monitor.picture.includes("CAM 1"));
});
test("SP 3: one SDI output cannot feed both recorder and encoder (one plug per output)", () => {
  let s = solve("xl-5", { stopAt: "signal" });
  const recLead = SCENARIOS["xl-5"].canonical.find((c) => c.to === "rec:sdi-in").cableId;
  s = act(s, { kind: "end", cableId: recLead, end: "a" });
  s = act(s, { kind: "port", portId: "sw:sdi-out-1" });
  assert.notEqual(s.cables[recLead].a.portId, "sw:sdi-out-1");
  assert.equal(MODELS["bmd-hyperdeck-studio-hd-plus"].ports.filter((p) => p.dir === "INPUT").length, 1, "HyperDeck has one record input — no ISO ×4");
});
test("SP 4: Constellation analog inputs are LINE; removing the Yamaha line route leaves video but no remote sound", () => {
  assert.equal(MODELS["bmd-atem-2me-constellation-hd"].ports.find((p) => p.key === "aud-l").sig, "LINE_BAL");
  let s = solve("xl-5", { stopAt: "signal" });
  s = setControl(s, "enc", "stream", true);
  const l = SCENARIOS["xl-5"].canonical.find((c) => c.to === "sw:aud-l").cableId, r = SCENARIOS["xl-5"].canonical.find((c) => c.to === "sw:aud-r").cableId;
  for (const id of [l, r]) { s = act(s, { kind: "end", cableId: id, end: "b" }); s = dropHeldEnd(s, [0, 0.8, 0]); }
  const v = simContext(s).view.wan;
  assert.ok(v.live && !v.audio.includes("COMMENTATOR 1"));
});
test("SP 5: a score source is full-frame only; wrong/stale graphic on a cue is a meaningful error", () => {
  let s = solve("xl-3", { stopAt: "signal" });
  s = setControl(s, "gfx", "score", "0–0");
  s = setControl(s, "sw", "pgm", "SDI 1"); s = setControl(s, "sw", "pgm", "SDI 3");
  const before = s.sim.errors;
  s = setControl(s, "sw", "pgm", "SDI 5");
  assert.equal(s.sim.errors, before + 1);
});
test("SP 6: WAN loss keeps PGM + recorder; media loss keeps the stream", () => {
  let s = solve("xl-5", { stopAt: "signal" });
  s = setControl(setControl(s, "enc", "stream", true), "rec", "record", true);
  const wanLead = SCENARIOS["xl-5"].canonical.find((c) => c.from === "net:wan").cableId;
  const noWan = simContext(dropHeldEnd(act(s, { kind: "end", cableId: wanLead, end: "b" }), [0, 0.8, 0]));
  assert.ok(!noWan.view.wan.live && noWan.view.rec.recording && noWan.view.pgm.picture);
  const full = simContext(setControl(s, "rec", "media", "SD card mounted · FULL (0 GB)"));
  assert.ok(full.view.wan.live && !full.view.rec.recording);
});
test("SP 7: no genlock or timecode port is invented on the Constellation HD", () => {
  assert.ok(!MODELS["bmd-atem-2me-constellation-hd"].ports.some((p) => /ref|genlock|timecode/i.test(`${p.key} ${p.name}`)));
});

/* ───────── review loop, diagnostics, determinism ───────── */
test("three meaningful errors pause the mission; the targeted mini check resumes it", () => {
  let s = setUp("xl-1");
  s = setControl(s, "cam1", "power", true);
  const lead = SCENARIOS["xl-1"].canonical[0].cableId;
  s = attach(s, lead, "a", "sw:sdi-in-1");
  for (let i = 0; i < 3; i++) s = act(s, { kind: "port", portId: "cam1:sdi-ret" });
  assert.ok(s.sim.paused);
  assert.equal(s.sim.reviewConcept, "return-feed");
  assert.match(setControl(s, "cam1", "format", "1080p50").notice.title, /พักภารกิจ/);
  s = answerReview(s, (s.sim.reviewConcept && 1));
  assert.ok(!s.sim.paused && s.sim.errors === 0);
});
test("signal trace names node → port → cable → node → port and the first faulty node", () => {
  const s = setControl(solve("s-5", { stopAt: "signal" }), "rx1", "power", false);
  const ctx = simContext(s);
  const { hops, first } = traceTo(SCENARIOS["s-5"].simDevices, ctx, "speaker", SCENARIOS["s-5"].cableMeta);
  assert.ok(hops.some((h) => h.port && h.port.includes("→ [")));
  assert.match(first.note, /POWER/);
  assert.ok(first.fix);
});
test("L4 starts genuinely broken: the deterministic faults are active and the show fails its tests", () => {
  for (const id of STAGE_IDS.filter((x) => x.endsWith("-4"))) {
    const s = setUp(id);
    assert.ok(s.sim.activeFaults.length >= 2, id);
  }
});

test("mission hall catalog mirrors the stage manifests (regenerate with scripts/generate-mission-catalog.mjs)", async () => {
  const { load } = await import("./helpers/solver.mjs");
  const { missionChapters } = load("../game/content/mission-catalog.ts");
  const rooms = ["xs", "s", "m", "l", "xl"];
  missionChapters.forEach((ch, i) => ch.difficulties.forEach((d) => {
    const s = STAGES.find((x) => x.room === rooms[i] && x.level === d.level);
    assert.equal(d.title, `${s.id} · ${s.title}`);
    assert.equal(d.objective, s.ticket);
  }));
});
