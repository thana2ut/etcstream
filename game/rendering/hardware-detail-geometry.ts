import { BufferGeometry, Float32BufferAttribute, LatheGeometry, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Part } from '../training/sim/model-geometry';

// Shared manufactured edge profiles. These change presentation only, never port/hit/save coordinates.
const boxes = new Map<string, RoundedBoxGeometry>();
export function roundedHardwareBox(size: readonly number[], radius = Math.min(0.004, Math.min(...size) * 0.2)) {
  const key = `${size.join(',')}:${radius}`;
  let geometry = boxes.get(key);
  if (!geometry) {
    geometry = new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius);
    boxes.set(key, geometry);
  }
  return geometry;
}

// Local +Z is the spindle axis, as with the connector and face-label convention.
export const CONTROL_KNOB = new LatheGeometry([
  [0,0],[0.90,0],[1,0.12],[1,0.88],[0.94,1.10],[0.78,1.20],[0,1.20],
].map(([r,y])=>new Vector2(r,y)),32).rotateX(Math.PI/2);

const lofts=new WeakMap<Part,BufferGeometry>();
export function photoLoftGeometry(part: Extract<Part,{t:'loft'}>) {
  let geometry=lofts.get(part); if(geometry) return geometry;
  const vertices:number[]=[], indices:number[]=[];
  const c=part.chamfer;
  const outline=[[-1+c,-1],[1-c,-1],[1,-1+c],[1,1-c],[1-c,1],[-1+c,1],[-1,1-c],[-1,-1+c]];
  for(const [z,y,w,h] of part.sections) for(const [x,v] of outline) vertices.push(x*w/2,y+v*h/2,z);
  for(let s=0;s<part.sections.length-1;s++) for(let i=0;i<8;i++) {
    const a=s*8+i,b=s*8+(i+1)%8,d=(s+1)*8+i,e=(s+1)*8+(i+1)%8;
    indices.push(a,b,e,a,e,d);
  }
  for(let i=1;i<7;i++) {
    indices.push(0,i+1,i);
    const last=(part.sections.length-1)*8; indices.push(last,last+i,last+i+1);
  }
  geometry=new BufferGeometry(); geometry.setAttribute('position',new Float32BufferAttribute(vertices,3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  lofts.set(part,geometry); return geometry;
}
