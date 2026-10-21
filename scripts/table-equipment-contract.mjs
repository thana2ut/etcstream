import fs from 'node:fs';
import path from 'node:path';
import {SCENARIOS,load} from '../tests/helpers/solver.mjs';
const {contentSignature}=load('../game/persistence/run-save.ts');
const data=Object.values(SCENARIOS).map(s=>({id:s.id,signature:contentSignature(s),topology:s.selectedTopologyId,
  ports:Object.entries(s.ports).map(([id,p])=>({id,device:p.device,connector:p.connector,direction:p.direction,requiresItem:p.requiresItem})).sort((a,b)=>a.id.localeCompare(b.id)),
  placeables:s.placeables.map(p=>p.id).sort(),canonical:s.canonical,initial:s.initialConnections,
  cables:s.cables.map(c=>({id:c.id,ends:c.ends,length:c.lengthM})),stage:s.stage?{id:s.stage.id,devices:s.stage.devices,solution:s.stage.solution,prewired:s.stage.prewired,faults:s.stage.faults}:undefined}));
const directory=path.resolve('art/qa/table-equipment');fs.mkdirSync(directory,{recursive:true});
if(process.argv.includes('--baseline')) {fs.writeFileSync(path.join(directory,'before.json'),JSON.stringify(data,null,2));console.log('Saved non-secret mission contract baseline');}
else {
  const before=JSON.parse(fs.readFileSync(path.join(directory,'before.json'),'utf8'));
  const changed=[];
  for(const current of data) {const original=before.find(s=>s.id===current.id);if(JSON.stringify(current)!==JSON.stringify(original))changed.push(current.id);}
  fs.writeFileSync(path.join(directory,'contract-check.json'),JSON.stringify({scenarios:data.length,unchanged:data.length-changed.length,changed},null,2));
  if(changed.length)throw Error(`Mission contract changed: ${changed.join(', ')}`);console.log(`Preserved ${data.length} scenario contracts (IDs, ports, rules, saves and initial wiring)`);
}
