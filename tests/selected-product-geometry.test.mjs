import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SCENARIOS,load,initialTrainingState,act,placeHeldOnCenterTable} from './helpers/solver.mjs';
const {equipmentVisualGeometry}=load('../game/rendering/equipment-visual-profile.ts');
const {SELECTED_PRODUCT_GEOMETRY}=load('../game/rendering/selected-product-geometry.ts');
const {genericPresentation}=load('../game/rendering/generic-model-presentation.ts');
const {LAYOUTS,layoutObstacles}=load('../game/training/venue-layouts.ts');
const {stagingFootprint}=load('../game/training/venue-scenarios.ts');
const venues=Object.values(SCENARIOS).filter(s=>s.stage);
function rayHitsBox(a,b,box) {
  let lo=0,hi=.995;
  for(let i=0;i<3;i++) {
    const delta=b[i]-a[i],min=box.center[i]-box.half[i],max=box.center[i]+box.half[i];
    if(Math.abs(delta)<1e-9){if(a[i]<min||a[i]>max)return false;continue;}
    const u=(min-a[i])/delta,v=(max-a[i])/delta;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>hi)return false;
  }
  return true;
}

test('all 27 selected visual profiles resolve to photo-authored geometry, reused native camera, or explicit photo family',()=>{
  const ids=[...new Set(venues.flatMap(s=>s.devices.filter(d=>d.generic).map(d=>d.modelId)))];assert.equal(ids.length,27);
  const fallback=new Set(['generic-projector','generic-active-pa','generic-sdi-ptz','reference-replay-controller']);
  for(const id of ids) {
    const g=equipmentVisualGeometry(id);assert.ok(g||fallback.has(id),id);
    if(g){assert.ok(g.source.length);assert.ok(g.size.every(v=>v>0));assert.ok(g.displayScale>0);}
    else assert.ok(genericPresentation(venues.flatMap(s=>s.devices).find(d=>d.modelId===id)));
  }
  assert.equal(Object.keys(SELECTED_PRODUCT_GEOMETRY).length,23);
});

test('selected physical sockets and room targets share the same pose, including rotated laptop sides and rack/microphone mounts',()=>{
  let checked=0;
  for(const s of venues)for(const d of s.devices) {
    const g=SELECTED_PRODUCT_GEOMETRY[d.modelId];if(!g)continue;
    const o=d.mount?.offset??(d.kind==='mic'&&d.position[1]<.3?[0,1.39,0]:[0,0,0]);
    for(const [key,p] of Object.entries(s.ports).filter(([,p])=>p.device===d.id)) {
      const a=g.ports[key.slice(d.id.length+1)];
      if(p.connector==='CONTROL'){assert.equal(a,undefined,'logical control is not a factory jack');continue;}
      assert.ok(a,`${s.id}/${key} missing physical anchor`);
      const local=a.at.map((v,i)=>o[i]+v*g.displayScale+a.normal[i]*.006),c=Math.cos(d.yaw??0),sin=Math.sin(d.yaw??0);
      const world=[d.position[0]+local[0]*c+local[2]*sin,d.position[1]+local[1],d.position[2]-local[0]*sin+local[2]*c];
      for(let i=0;i<3;i++)assert.ok(Math.abs(world[i]-p.position[i])<.0002,`${s.id}/${key} axis${i}`);checked++;
    }
  }
  assert.ok(checked>300);
});

test('every movable unit can be lifted/placed; existing unplug-on-lift safety never rewires unrelated devices',()=>{
  let count=0;
  for(const s of venues)for(const item of s.placeables) {
    let state=initialTrainingState(s.id);const before=state.cables;
    state=act(state,{kind:'item',itemId:item.id});assert.equal(state.heldItem,item.id,`${s.id}/${item.id} pickup`);
    state=placeHeldOnCenterTable(state,item.zone);assert.equal(state.heldItem,null);assert.deepEqual(state.items[item.id].position,item.zone);
    for(const [id,cable] of Object.entries(before))for(const end of ['a','b']) {
      const old=cable[end].portId,next=state.cables[id][end].portId;
      if(old&&s.ports[old].device===item.id)assert.ok(next===null||next===old,`${s.id}/${item.id} auto-patched another port`);
      else assert.equal(next,old,`${s.id}/${item.id} changed unrelated ${id}/${end}`);
    }count++;
  }
  assert.ok(count>150);
});

function walkable(layout) {
  const blockers=layoutObstacles(layout),step=.25,r=.30,nx=Math.floor((layout.bounds.maxX-layout.bounds.minX-2*r)/step),nz=Math.floor((layout.bounds.maxZ-layout.bounds.minZ-2*r)/step);
  const point=(x,z)=>[layout.bounds.minX+r+x*step,layout.bounds.minZ+r+z*step];
  const free=(x,z)=>x>=0&&z>=0&&x<=nx&&z<=nz&&!blockers.some(b=>Math.abs(point(x,z)[0]-b.center[0])<b.half[0]+r&&Math.abs(point(x,z)[1]-b.center[2])<b.half[2]+r);
  const start=[Math.round((layout.spawn[0]-layout.bounds.minX-r)/step),Math.round((layout.spawn[2]-layout.bounds.minZ-r)/step)],queue=[start],seen=new Set([start.join()]);
  for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
    const [x,z]=queue[i],n=[x+dx,z+dz];if(seen.has(n.join())||!free(...n)||(dx&&dz&&(!free(x+dx,z)||!free(x,z+dz))))continue;seen.add(n.join());queue.push(n);
  }
  return queue.map(p=>point(...p));
}
test('every staged item has a navigable pickup position and furniture-clear sightline within 2.65m (no character control)',()=>{
  const grids=new Map();let checked=0;
  for(const s of venues) {
    const layout=LAYOUTS[s.layout];if(!grids.has(s.layout))grids.set(s.layout,walkable(layout));
    for(const item of s.placeables.filter(p=>!p.installed)) {
      const y=item.start[1]+Math.max(.04,Math.min(item.device.size[1]/2,.20));
      const otherItems=s.placeables.filter(p=>p.id!==item.id&&!p.installed).map(p=>{
        const f=stagingFootprint(p.device),h=p.device.size[1];
        return {center:[p.start[0]+(f.minX+f.maxX)/2,p.start[1]+h/2,p.start[2]+(f.minZ+f.maxZ)/2],half:[f.width/2,h/2,f.depth/2]};
      });
      const target=[item.start[0],y,item.start[2]],blockers=[...layoutObstacles(layout),...otherItems];
      assert.ok(grids.get(s.layout).some(([x,z])=>Math.hypot(x-item.start[0],1.62-y,z-item.start[2])<=2.5&&!blockers.some(b=>rayHitsBox([x,1.62,z],target,b))),`${s.id}/${item.id} unreachable or furniture-obscured pickup`);checked++;
    }
  }
  assert.ok(checked>100);
});

test('new visual resolver preserves the recorded pre-change mission contracts and save signatures',()=>{
  const before=JSON.parse(fs.readFileSync(new URL('../art/qa/table-equipment/before.json',import.meta.url),'utf8'));
  const {contentSignature}=load('../game/persistence/run-save.ts');
  for(const s of venues){const b=before.find(x=>x.id===s.id);assert.equal(contentSignature(s),b.signature);assert.deepEqual(s.placeables.map(p=>p.id).sort(),b.placeables);}
});
