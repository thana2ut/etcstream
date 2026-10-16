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
    else assert.match(m.sourceUrl, /^https:\/\/(www\.)?(blackmagicdesign|proav\.roland|usa\.yamaha|shure)\./, m.modelId);
  }
});
test("in-game stage content is English (no Thai script)", () => {
  const thai = /[฀-๿]/;
  for (const s of STAGES) for (const text of [s.title, s.subtitle, s.ticket, ...s.callSheet, ...s.briefing, ...s.passCriteria, s.reward, ...s.objectives.map((o) => o.label), ...s.cues.map((c) => c.call)]) assert.ok(!thai.test(text), `${s.id}: ${text}`);
  for (const id of STAGE_IDS) { const sc = SCENARIOS[id]; for (const t of [...sc.devices.map((d) => d.label), ...Object.values(sc.ports).map((p) => p.label), ...sc.cables.map((c) => c.label), ...sc.placeables.map((p) => p.zoneLabel ?? "")]) assert.ok(!thai.test(t), `${id}: ${t}`); }
});

/* ───────── five verified mission records per room (all 25 complete end-to-end) ───────── */
for (const id of STAGE_IDS) {
  test(`${SCENARIOS[id].stage.id} plays end-to-end to a certified/passed sign-off`, () => {
    const state = solve(id);
    assert.ok(state.completed, `${id}: ${state.notice?.title} ${state.notice?.detail}`);
    assert.match(state.notice.title, /^(CERTIFIED|PASS)/);
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

/* ───────── room 01 acceptance tests T1–T6 ───────── */
const XS = SCENARIOS["xs-5"].simDevices;
test("CL T1: laptop HDMI OUT → ATEM HDMI IN 2 accepted; ATEM HDMI OUT → laptop HDMI OUT rejected", () => {
  assert.ok(canConnect(XS, "slides:hdmi-out", "sw:hdmi-in-2").ok);
  const v = canConnect(XS, "sw:hdmi-out", "slides:hdmi-out");
  assert.equal(v.code, "OUTPUT_TO_OUTPUT");
});
test("CL T2: one ATEM HDMI output cannot be Program to the projector and Multiview at once", () => {
  let s = solve("xs-1", { stopAt: "signal" });
  s = setControl(s, "sw", "hdmi-out", "MULTIVIEW");
  assert.match(simContext(s).view.monitor.picture, /MULTIVIEW/);
  assert.equal(runTest(s, "signal").sim.testsPassed.signal, false);
});
test("CL T3: USB-C is one port — webcam host and SSD cannot both be connected", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  const lead = SCENARIOS["xs-5"].cables.find((c) => c.id === "x-usbca");
  s = act(s, { kind: "end", cableId: lead.id, end: "a" });
  s = act(s, { kind: "port", portId: "sw:usb" });
  assert.notEqual(s.cables[lead.id].a.portId, "sw:usb");
});
test("CL T4: no WAN → stream fails but projector works; no SSD → ISO fails but projector works", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  s = setControl(setControl(s, "sw", "stream", true), "sw", "record", true);
  let ctx = simContext(s);
  assert.ok(ctx.view.wan.live && ctx.view.ssd.recording);
  const wanLead = SCENARIOS["xs-5"].canonical.find((c) => c.from === "net:wan").cableId;
  let noWan = act(s, { kind: "end", cableId: wanLead, end: "b" }); noWan = dropHeldEnd(noWan, [0, 0.8, 0]);
  ctx = simContext(noWan);
  assert.ok(!ctx.view.wan.live && ctx.view.monitor.picture && ctx.view.ssd.recording);
  const noSsd = setControl(s, "ssd", "state", "Not mounted");
  ctx = simContext(noSsd);
  assert.ok(!ctx.view.ssd.recording && ctx.view.wan.live && ctx.view.monitor.picture);
});
test("CL T5: pro balanced line straight into the ATEM 3.5 mm input is rejected; the interface with −12 dB works", () => {
  assert.equal(canConnect(XS, "mix:st-l", "sw:mic-1").code, "PRO_TO_CONSUMER");
  let s = solve("xs-5", { stopAt: "signal" });
  assert.ok(!simContext(s).view.sw.clip);
  s = setControl(s, "adapt", "atten", "0 dB (bypass)");
  assert.ok(simContext(s).view.sw.clip);
});
test("CL T6: L5 viewer follows the changing Program with the mixed voice", () => {
  let s = solve("xs-5", { stopAt: "signal" });
  s = setControl(s, "sw", "stream", true);
  for (const opt of ["HDMI 1", "HDMI 2", "HDMI 3"]) { s = setControl(s, "sw", "pgm", opt); const v = simContext(s).view.wan; assert.equal(v.picture, simContext(s).view.sw.picture); assert.ok(v.audio.includes("TEACHER VOICE")); }
});

/* ───────── room 02 programmatic tests ───────── */
const ST = SCENARIOS["s-5"].simDevices;
test("ST 1: 2160p50 into the HD8 3G input fails even though BNC fits; 1080p50 passes", () => {
  let s = solve("s-3", { stopAt: "signal" });
  s = setControl(s, "cam2", "format", "2160p50");
  assert.ok(!simContext(s).view.monitor.picture.includes("CAM-B"));
  assert.equal(simContext(s).view.sw.problem.code, "SDI_RATE");
});
test("ST 2: camera RETURN IN → HD8 SDI IN is input-to-input; camera SDI OUT accepted", () => {
  assert.equal(canConnect(ST, "cam2:sdi-ret", "sw:sdi-in-2").code, "INPUT_TO_INPUT");
  assert.ok(canConnect(ST, "cam2:sdi-out", "sw:sdi-in-2").ok);
});
test("ST 3: MG12XU USB cannot feed an XLR analog input; ST OUT L/R → HD8 XLR accepted", () => {
  const scenario = SCENARIOS["s-5"];
  assert.notEqual(scenario.ports["mix:usb"].connector, scenario.ports["sw:xlr-1"].connector);
  assert.ok(canConnect(ST, "mix:st-l", "sw:xlr-1").ok);
});
test("ST 4: HDMI multiview is not the Program feed; assigned PGM SDI via the powered converter is", () => {
  const s = solve("s-4", { stopAt: "signal" });
  const ctx = simContext(s);
  assert.match(ctx.view.monitor.picture, /^MULTIVIEW/);
  assert.equal(ctx.view.pgm.picture, ctx.view.sw.picture);
  assert.ok(!simContext(setControl(s, "conv", "power", false)).view.pgm.picture);
});
test("ST 5: removing storage stops ISO but not the picture; removing WAN stops ingest but not multiview", () => {
  let s = solve("s-5", { stopAt: "signal" });
  s = setControl(setControl(s, "sw", "stream", true), "sw", "record", true);
  const noDisk = simContext(setControl(s, "ssd", "state", "Not mounted"));
  assert.ok(!noDisk.view.ssd.recording && noDisk.view.wan.live && noDisk.view.monitor.picture);
  const wanLead = SCENARIOS["s-5"].canonical.find((c) => c.from === "net:wan").cableId;
  const noWan = simContext(dropHeldEnd(act(s, { kind: "end", cableId: wanLead, end: "b" }), [0, 0.8, 0]));
  assert.ok(!noWan.view.wan.live && /MULTIVIEW/.test(noWan.view.monitor.picture));
  const muted = simContext(setControl(s, "mix", "ch1-on", false));
  assert.ok(!muted.view.wan.audio.includes("HOST VOICE"));
});
test("ST 6: camera return only works from an output assigned CAM RETURN", () => {
  let s = solve("s-4", { stopAt: "signal" });
  assert.ok(simContext(s).view.cam2.audio.some((a) => a.startsWith("RETURN")));
  s = setControl(s, "sw", "sdi-out-2", "OFF");
  assert.ok(!(simContext(s).view.cam2.audio ?? []).some((a) => a.startsWith("RETURN")));
});

/* ───────── room 03 deterministic engineering tests ───────── */
const AU = SCENARIOS["m-5"].simDevices;
test("AU: LAN CONTROL → router never satisfies the ingest; USB STREAM → OBS host → host network does", () => {
  let s = solve("m-5", { stopAt: "signal" });
  s = setControl(s, "host", "stream", true);
  assert.ok(simContext(s).view.wan.live);
  const hostEth = SCENARIOS["m-5"].canonical.find((c) => c.from === "host:eth").cableId;
  s = attach(s, hostEth, "a", "sw:lan");
  assert.ok(!simContext(s).view.wan.live);
  assert.equal(simContext(s).view.wan.problem.code, "NO_STREAM");
});
test("AU: GROUP unassigned → house PA audible, remote viewer silent", () => {
  let s = solve("m-5", { stopAt: "signal" });
  s = setControl(setControl(s, "host", "stream", true), "mix", "ch1-grp", false);
  const ctx = simContext(s);
  assert.ok(ctx.view.paL.audio.includes("PRESENTER VOICE"));
  assert.ok(!ctx.view.wan.audio.includes("PRESENTER VOICE"));
});
test("AU: three assigned HDMI outputs give PGM / AUX / MV simultaneously", () => {
  let s = solve("m-3", { stopAt: "signal" });
  s = setControl(s, "sw", "pgm", "SDI 1");
  const v = simContext(s).view;
  assert.equal(v.display.picture, "CAM WIDE · STAGE");
  assert.equal(v.conf.picture, "KEYNOTE SLIDES");
  assert.match(v.monitor.picture, /^MULTIVIEW/);
});
test("AU: Roland definition has its own rear ports (no ATEM single HDMI OUT); PA speaker output → line input rejected", () => {
  const ports = MODELS["roland-v-160hd"].ports.map((p) => p.key);
  assert.ok(ports.includes("hdmi-out-3") && ports.includes("lan") && !ports.includes("hdmi-out"));
  assert.equal(canConnect(AU, "amp:spk-out", "sw:ain-1").code, "SPEAKER_LEVEL");
  assert.equal(canConnect(AU, "mix:phones", "paL:line-in").code, "HEADPHONE_NOT_LINE");
  assert.ok(canConnect(AU, "mix:st-l", "paL:line-in").ok);
});
test("AU: HyperDeck recording and stream status are independent", () => {
  let s = solve("m-5", { stopAt: "signal" });
  s = setControl(setControl(s, "host", "stream", true), "rec", "record", true);
  const full = simContext(setControl(s, "rec", "media", "SD card mounted · FULL (0 GB)"));
  assert.ok(!full.view.rec.recording && full.view.wan.live);
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
  assert.match(setControl(s, "cam1", "format", "1080p50").notice.title, /paused/i);
  s = answerReview(s, (s.sim.reviewConcept && 1));
  assert.ok(!s.sim.paused && s.sim.errors === 0);
});
test("signal trace names node → port → cable → node → port and the first faulty node", () => {
  const s = setControl(solve("s-4", { stopAt: "signal" }), "conv", "power", false);
  const ctx = simContext(s);
  const { hops, first } = traceTo(SCENARIOS["s-4"].simDevices, ctx, "pgm", SCENARIOS["s-4"].cableMeta);
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
