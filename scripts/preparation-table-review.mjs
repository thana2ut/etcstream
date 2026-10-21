import fs from 'node:fs';
import path from 'node:path';
import {BoxGeometry} from 'three';
import {SCENARIOS,load} from '../tests/helpers/solver.mjs';
const {LAYOUTS}=load('../game/training/venue-layouts.ts');
const {equipmentVisualGeometry}=load('../game/rendering/equipment-visual-profile.ts');
const hardware=JSON.parse(fs.readFileSync('art/qa/phase07/runtime-geometry-review.json','utf8')).assets;
const selected=JSON.parse(fs.readFileSync('art/qa/venue-generic/runtime-geometry-review.json','utf8')).assets;
const assets=[];
for(const scale of ['xs','s','m','l','xl']) {
  const scenario=SCENARIOS[`${scale}-1`],layout=LAYOUTS[scenario.layout],top=layout.equipment,meshes=[],nativeInstances=[];
  function transform(spec,position,k=1,yaw=0) {
    const c=Math.cos(yaw),s=Math.sin(yaw),out={...spec,positions:[],normals:spec.normals?[]:null};
    for(let i=0;i<spec.positions.length;i+=3){const [x,y,z]=spec.positions.slice(i,i+3);out.positions.push(position[0]+k*(x*c+z*s),position[1]+y*k,position[2]+k*(-x*s+z*c));}
    if(spec.normals)for(let i=0;i<spec.normals.length;i+=3){const [x,y,z]=spec.normals.slice(i,i+3);out.normals.push(x*c+z*s,y,-x*s+z*c);}
    meshes.push(out);
  }
  function box(size,position,color) {
    const g=new BoxGeometry(...size);transform({positions:Array.from(g.attributes.position.array),normals:Array.from(g.attributes.normal.array),indices:Array.from(g.index.array),color,finish:'plastic'},position);g.dispose();
  }
  const [w,d]=top.size,h=top.center[1];box([w,.04,d],[0,h-.02,0],'#ba946b');
  for(const x of [-1,1])for(const z of [-1,1])box([.04,h-.04,.04],[x*(w/2-.07),(h-.04)/2,z*(d/2-.07)],'#252c35');
  const units=[];
  for(const item of scenario.placeables.filter(p=>!p.installed)) {
    const dev=item.device,g=equipmentVisualGeometry(dev.modelId),source=hardware.find(a=>a.id===dev.modelId)??selected.find(a=>a.id===dev.modelId);
    const position=[item.start[0]-top.center[0],item.start[1],item.start[2]-top.center[2]],yaw=dev.yaw??0;
    if(dev.modelId==='magewell-usb-capture-hdmi-gen2')nativeInstances.push({path:'public/models/equipment/magewell-capture.glb',position,scale:3.2,yaw});
    else if(source)for(const spec of source.meshes)transform(spec,position,dev.modelId==='bmd-atem-mini-pro'?1:g?.parts?g.displayScale:1,yaw);
    else throw Error(`Missing actual geometry: ${dev.modelId}`);
    units.push({id:item.id,model:dev.modelId,start:item.start});
  }
  assets.push({id:`${scale}-preparation-table`,meshes,nativeInstances,units});
}
const output=path.resolve('art/qa/table-equipment/preparation-tables.json');fs.writeFileSync(output,JSON.stringify({assets}));
console.log(`${assets.length} actual preparation tables exported without controlling gameplay`);
