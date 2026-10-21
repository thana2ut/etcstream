import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {createElement} from 'react';
import {Quaternion,Vector3} from 'three';
import {load,SCENARIOS,initialTrainingState,projectRoot} from '../tests/helpers/solver.mjs';
import {flatten,geometryReviewAssets} from './phase07-export-review.mjs';
const {roundedHardwareBox}=load('../game/rendering/hardware-detail-geometry.ts');
const {socketSurfaces}=load('../game/rendering/socket-geometry.ts');
let state;
const hardwareSocket=({kind,at,n})=>createElement('group',{position:at,quaternion:new Quaternion().setFromUnitVectors(new Vector3(0,0,1),new Vector3(...n))},socketSurfaces(kind).map(({color,geometry},i)=>createElement('mesh',{key:i,geometry},createElement('meshStandardMaterial',{color,metalness:.6}))));
function component(relative) {
  const file=path.join(projectRoot,relative), compiled={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,{
    exports:compiled.exports,require:(name)=>{
      if(name==='react') return {useMemo:f=>f()};
      if(name==='@react-three/drei') return {RoundedBox:({args,radius,children,...p})=>createElement('mesh',{...p,geometry:roundedHardwareBox(args,radius)},children)};
      if(name.endsWith('/training-store')) return {useTrainingStore:selector=>selector(state)};
      if(name.endsWith('/scene-text')) return {SceneText:()=>null,EquipmentNameplate:()=>null};
      if(name==='./hardware-model') return {HardwareSocket:hardwareSocket};
      if(name==='./port-socket') return component('components/game/equipment/port-socket.tsx');
      return load(name.startsWith('@/')?path.join(projectRoot,name.slice(2)):name);
    },
  });
  return compiled.exports;
}
const {GenericDevice}=component('components/game/equipment/generic-device.tsx');
const seen=new Set(),assets=[],roster=[];
for(const scenario of Object.values(SCENARIOS).filter(s=>s.stage)) {
  roster.push({id:scenario.stage.id,devices:scenario.devices.map(d=>({id:d.id,modelId:d.modelId,generic:Boolean(d.generic)}))});
  for(const device of scenario.devices.filter(d=>d.generic)) {
    if(seen.has(device.modelId)) continue; seen.add(device.modelId); state=initialTrainingState(scenario.id);
    const meshes=geometryReviewAssets.find(a=>a.id===device.modelId)?.meshes??flatten(GenericDevice({device,bare:true}));
    if(!meshes.length) throw Error(`No mesh ${device.modelId}`);
    assets.push({id:device.modelId,meshes,...(device.modelId==='generic-hdmi-camera'?{native:'public/models/equipment/hc-x2000.glb'}:{})});
  }
}
const out=path.join(projectRoot,'art/qa/venue-generic'); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'runtime-geometry-review.json'),JSON.stringify({assets}));
fs.writeFileSync(path.join(out,'all-25-rosters.json'),JSON.stringify(roster,null,2));
console.log(JSON.stringify({profiles:assets.length,stages:roster.length,output:out}));
