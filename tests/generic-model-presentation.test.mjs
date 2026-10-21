import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,SCENARIOS} from './helpers/solver.mjs';
const {genericPresentation,genericLocalPorts}=load('../game/rendering/generic-model-presentation.ts');

test('all 27 generic venue profiles have a stable presentation; special equipment does not fall through to a box or handheld',()=>{
  const profiles=new Map();
  for(const s of Object.values(SCENARIOS).filter(s=>s.stage)) for(const d of s.devices.filter(d=>d.generic)) profiles.set(d.modelId,d);
  assert.equal(profiles.size,27);
  for(const d of profiles.values()) assert.ok(genericPresentation(d));
  for(const [id,expected] of Object.entries({'generic-lav-mic':'lavalier','generic-wireless-rx':'receiver','reference-stagebox-6':'stagebox','reference-tail-6':'snake-tail','generic-sdi-ptz':'ptz','generic-active-pa':'speaker','reference-replay-controller':'shuttle-controller'})) {
    assert.equal(genericPresentation(profiles.get(id)),expected);
  }
});

test('inspect sockets transform back onto every generic mission port without changing canonical anchors',()=>{
  let count=0;
  for(const s of Object.values(SCENARIOS).filter(s=>s.stage)) for(const d of s.devices.filter(d=>d.generic)) {
    const snapshot=JSON.stringify(s.ports),c=Math.cos(d.yaw??0),sin=Math.sin(d.yaw??0);
    const local=genericLocalPorts(d,s.ports);
    assert.equal(local.length,Object.values(s.ports).filter(p=>p.device===d.id).length);
    for(const {at,normal,port} of local) {
      const world=[d.position[0]+at[0]*c+at[2]*sin,d.position[1]+at[1],d.position[2]-at[0]*sin+at[2]*c];
      for(let i=0;i<3;i++) assert.ok(Math.abs(world[i]-port.position[i])<1e-8);
      assert.ok(normal.every(Number.isFinite)); assert.ok(Math.abs(Math.hypot(...normal)-1)<1e-6); count++;
    }
    assert.equal(JSON.stringify(s.ports),snapshot);
  }
  assert.ok(count>300);
});
