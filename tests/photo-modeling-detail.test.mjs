import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, projectRoot } from './helpers/solver.mjs';
const { roundedHardwareBox, CONTROL_KNOB, photoLoftGeometry }=load('../game/rendering/hardware-detail-geometry.ts');
const { MODEL_GEOMETRY }=load('../game/training/sim/model-geometry.ts');

test('photo refinement: rounded manufactured surfaces share buffers and retain their declared dimensions',()=>{
  for(const size of [[.4826,.0442,.003],[.0795,.0249,.0457],[.014,.012,.0022]]) {
    const g=roundedHardwareBox(size);
    assert.equal(g,roundedHardwareBox(size)); g.computeBoundingBox();
    for(const [i,key] of ['x','y','z'].entries()) assert.ok(Math.abs(g.boundingBox.max[key]-g.boundingBox.min[key]-size[i])<1e-6);
    for(const a of ['position','normal','uv']) assert.ok(Array.from(g.attributes[a].array).every(Number.isFinite));
  }
  CONTROL_KNOB.computeBoundingBox();
  assert.ok(CONTROL_KNOB.boundingBox.min.z>=-1e-7);
  assert.ok(Math.abs(CONTROL_KNOB.boundingBox.max.z-1.2)<1e-6);
});

test('photo refinement: Studio cameras have two open handles and a hollow mount; URSA and fiber retain their identities',()=>{
  for(const id of ['bmd-studio-camera-4k-plus-g2','bmd-studio-camera-4k-pro-g2']) {
    const geo=MODEL_GEOMETRY[id];
    assert.equal(geo.parts.filter(p=>p.t==='tube' && p.points.length===6).length,2);
    const ring=geo.parts.find(p=>p.t==='lathe' && p.n[2]===-1);
    assert.ok(ring && ring.profile.every(([r])=>r>=.024));
    assert.ok(geo.parts.filter(p=>p.t==='prism').length>=2);
    const loft=geo.parts.find(p=>p.t==='loft'), mesh=photoLoftGeometry(loft);
    assert.equal(mesh,photoLoftGeometry(loft));
    for(const a of ['position','normal']) assert.ok(Array.from(mesh.attributes[a].array).every(Number.isFinite));
    assert.ok(Array.from(mesh.index.array).every(i=>i<mesh.attributes.position.count));
  }
  assert.ok(MODEL_GEOMETRY['bmd-ursa-broadcast-g2'].parts.filter(p=>p.t==='key').length>=10);
  assert.ok(MODEL_GEOMETRY['bmd-camera-fiber-converter'].parts.some(p=>p.t==='prism'));
  assert.ok(MODEL_GEOMETRY['bmd-studio-fiber-converter'].parts.some(p=>p.t==='lathe'));
  const bytes=fs.readFileSync(`${projectRoot}/public/models/equipment/hc-x2000.glb`);
  const doc=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
  assert.ok(doc.nodes.some(n=>n.name==='cam_lens_hood'));
  assert.ok(!doc.nodes.some(n=>n.name==='cam_lens_hood_cut'), 'opaque rectangle must not cover the lens');
  const manifest=JSON.parse(fs.readFileSync(`${projectRoot}/art/blender/hc-x2000-manifest.json`,'utf8'));
  assert.deepEqual(manifest.video_out_web_m,[.048,1.3,.168]);
});
