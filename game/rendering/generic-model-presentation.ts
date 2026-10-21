import type { DeviceDef, PortDef, Point3 } from '../training/scenarios';

/** Explicit role routing; Thai labels must not accidentally turn a lavalier into a handheld mic. */
export function genericPresentation(device: DeviceDef) {
  if(device.modelId==='generic-lav-mic') return 'lavalier';
  if(device.modelId==='reference-stagebox-6') return 'stagebox';
  if(device.modelId==='reference-tail-6') return 'snake-tail';
  if(device.modelId==='generic-wireless-rx') return 'receiver';
  if(device.modelId==='generic-sdi-ptz') return 'ptz';
  if(device.modelId==='generic-projector') return 'projector';
  if(device.modelId==='reference-replay-controller') return 'shuttle-controller';
  if(device.equipmentRole==='speaker') return 'speaker';
  return device.kind;
}

/** Canonical room port → model-local preview, undoing only the device's authored yaw/translation. */
export function genericLocalPorts(device: DeviceDef, ports: Record<string,PortDef>) {
  const yaw=device.yaw??0,c=Math.cos(yaw),s=Math.sin(yaw);
  const inverse=(x:number,z:number):[number,number]=>[x*c-z*s,x*s+z*c];
  return Object.entries(ports).filter(([,p])=>p.device===device.id).map(([key,p])=>{
    const [x,z]=inverse(p.position[0]-device.position[0],p.position[2]-device.position[2]);
    const n=p.normal??[0,0,1], [nx,nz]=inverse(n[0],n[2]);
    return {key,port:p,at:[x,p.position[1]-device.position[1],z] as Point3,normal:[nx,n[1],nz] as Point3};
  });
}
