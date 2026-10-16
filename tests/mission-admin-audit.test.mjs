import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, STAGE_IDS, MODELS, solve, T, act } from './helpers/solver.mjs';

// In-memory public-transition regressions, never Chrome gameplay evidence or player-save edits.
test('all 25 approved graphs reject a missing mandatory cable and require deliberate retesting after repair', () => {
  for (const id of STAGE_IDS) {
    const scenario = SCENARIOS[id];
    const approved = solve(id);
    const edge = scenario.canonical[0];
    const broken = act(approved, { kind: 'port', portId: edge.to });
    assert.equal(broken.completed, false, id);
    assert.equal(Boolean(broken.sim.signedOff), false, id);
    assert.equal(T.simContext(broken).inp[edge.to], undefined, id);
    assert.equal(T.signOff(broken).completed, false, id);
    const repaired = act(broken, { kind: 'port', portId: edge.to });
    assert.equal(T.signOff(repaired).completed, false, `${id}: repair cannot reuse obsolete badges`);
  }
});

test('every mission rejects signoff after mandatory equipment loses power', () => {
  for (const id of STAGE_IDS) {
    const s = SCENARIOS[id];
    const device = s.stage.devices.find(d => MODELS[s.simDevices[d].model].needsPower);
    assert.ok(device, id);
    const broken = T.setControl(solve(id), device, 'power', false);
    assert.equal(broken.completed, false, id);
    assert.equal(T.signOff(broken).completed, false, id);
  }
});

test('outdoor reconciliation retains lightning hold, explicit GO and public cable-crossing safety', () => {
  let storm = T.initialTrainingState('l-5');
  assert.equal(storm.sim.weatherNow, 'lightning');
  storm = T.setControl(storm, 'site', 'decision', 'GO');
  assert.ok(storm.sim.log.some(l => l.code === 'SAFETY_BYPASS'));
  storm = T.setControl(storm, 'site', 'decision', 'NO-GO (hold)');
  storm = T.requestAllClear(storm);
  assert.equal(storm.sim.weatherNow, 'clear');
  const safe = solve('l-2');
  const uncovered = T.setControl(safe, 'site', 'ramp', false);
  assert.equal(Boolean(T.runTest(uncovered, 'physical').sim.testsPassed.physical), false);
  for (let level = 1; level <= 5; level++) {
    const s = SCENARIOS[`l-${level}`];
    assert.ok(s.stage.preflight.includes('power-signoff'));
    assert.ok(s.stage.objectives.some(o => o.id === 'safe' && o.critical));
  }
});
