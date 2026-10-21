"use client";

import { SceneText as Text, EquipmentNameplate } from "@/components/game/scene-text";

import { SCENE_FONT, sceneText } from "@/game/rendering/scene-font";
import { RoundedBox } from "@react-three/drei";
import type { DeviceDef } from "@/game/training/scenarios";
import { useTrainingStore } from "@/game/stores/training-store";
import { requirementDone, scenarioOf, simContext } from "@/game/training/hdmi-training";
import { venueScreenFeed } from "@/game/training/monitor-feed";
import { MODELS } from "@/game/training/sim/equipment";
import { useMemo } from "react";
import { CatmullRomCurve3, DataTexture, ExtrudeGeometry, LinearMipmapLinearFilter, Quaternion, RepeatWrapping, Shape, TubeGeometry, Vector3 } from "three";
import { genericLocalPorts, genericPresentation } from "@/game/rendering/generic-model-presentation";
import { PortSocket } from "./port-socket";
import { photoLoftGeometry } from "@/game/rendering/hardware-detail-geometry";
import {selectedGameProduct} from '@/game/content/selected-product-info';

const FONT = SCENE_FONT;
const grillePixels=new Uint8Array(32*32*4);
for(let y=0;y<32;y++)for(let x=0;x<32;x++) {
  const hole=Math.hypot(x%8-3.5,y%8-3.5)<2.7,i=(y*32+x)*4;
  grillePixels[i]=grillePixels[i+1]=grillePixels[i+2]=hole?20:110;grillePixels[i+3]=255;
}
const SPEAKER_GRILLE=new DataTexture(grillePixels,32,32);
SPEAKER_GRILLE.wrapS=SPEAKER_GRILLE.wrapT=RepeatWrapping;SPEAKER_GRILLE.repeat.set(12,20);SPEAKER_GRILLE.generateMipmaps=true;SPEAKER_GRILLE.minFilter=LinearMipmapLinearFilter;SPEAKER_GRILLE.needsUpdate=true;

/**
 * Training profiles keep their stable simulator identity. Selected bodies are being refined from
 * the manufacturer's local photographs; unchanged shells remain explicitly generic. A selected
 * visual target is never a claim that its factory controls/ports equal the game's abstraction.
 */
function Rb({ p, s, c, m = 0.25, r = 0.5, e, ei = 0 }: { p: [number, number, number]; s: [number, number, number]; c: string; m?: number; r?: number; e?: string; ei?: number }) {
  return <RoundedBox position={p} args={s} radius={Math.min(0.02, Math.min(...s) * 0.3)} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={c} metalness={m} roughness={r} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </RoundedBox>;
}
function Rod({ a, b, r = 0.012, c = "#22252a" }: { a: [number, number, number]; b: [number, number, number]; r?: number; c?: string }) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
  const pitch = Math.acos(dy / len), yaw = Math.atan2(dx, dz);
  return <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[pitch, yaw, 0, "YXZ"]} castShadow>
    <cylinderGeometry args={[r, r, len, 8]} /><meshStandardMaterial color={c} metalness={0.7} roughness={0.4} />
  </mesh>;
}

export function GenericLabel({ device, y }: { device: DeviceDef; y: number }) {
  const selected=selectedGameProduct(device.modelId);
  const tag = selected?`${selected.name} · อ้างอิงภาพ GAME`:device.status === "CONFIRMED" ? device.model : device.status === "PROVISIONAL" ? "รุ่นรอการยืนยัน" : device.status === "UNKNOWN" ? "ยังไม่ทราบรุ่น" : "อุปกรณ์แบบฝึก";
  return <EquipmentNameplate title={device.label} subtitle={tag} y={y} deviceId={device.id} />;
}

function TripodCamera({ device }: { device: DeviceDef }) {
  // Tally lights when this camera's picture is on the simulated Program bus.
  const tally = useTrainingStore((state) => { const ctx = simContext(state); const pic = ctx?.view[device.id]?.picture; return Boolean(pic && ctx?.view.sw?.picture === pic); });
  const broadcast = /Broadcast|Long-lens/.test(device.label), ptz = genericPresentation(device)==='ptz';
  if (ptz) return <group>
    <Rod a={[0, 0, 0]} b={[0, 1.15, 0]} r={0.03} />
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Rod key={k} a={[0, 0.02, 0]} b={[Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3]} r={0.02} />; })}
    <Rb p={[0, 1.20, 0]} s={[0.2, 0.075, 0.19]} c="#d4d5d9" />
    <Rb p={[0, 1.241, 0]} s={[0.18, 0.012, 0.17]} c="#b4b6bb" />
    {[-1,1].map(side=><Rb key={side} p={[side*.082,1.29,.005]} s={[.03,.13,.14]} c="#e4e5e8" />)}
    <RoundedBox position={[0,1.34,-.005]} args={[.145,.17,.15]} radius={.055} smoothness={4} castShadow receiveShadow><meshStandardMaterial color="#ebecf0" roughness={.4} /></RoundedBox>
    <mesh position={[0, 1.35, -.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.044,.044,.016,40]} /><meshStandardMaterial color="#171c23" roughness={.4} /></mesh>
    <mesh position={[0, 1.35, -.09]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.031,.031,.005,40]} /><meshStandardMaterial color="#12382f" metalness={.7} roughness={.12} /></mesh>
    <Rb p={[0,1.2,-.096]} s={[.054,.014,.002]} c="#383b44" />
  </group>;
  const lens = broadcast ? 0.42 : 0.2;
  return <group>
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2 + Math.PI / 6; return <Rod key={k} a={[0, 1.08, 0]} b={[Math.cos(a) * 0.45, 0.01, Math.sin(a) * 0.45]} r={0.016} />; })}
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2 + Math.PI / 6; return <Rod key={`s${k}`} a={[0, 0.42, 0]} b={[Math.cos(a) * 0.27, 0.42, Math.sin(a) * 0.27]} r={0.008} />; })}
    <mesh position={[0, 1.12, 0]}><cylinderGeometry args={[0.06, 0.07, 0.1, 16]} /><meshStandardMaterial color="#1b1d22" metalness={0.6} roughness={0.4} /></mesh>
    <Rod a={[0.06, 1.18, 0.12]} b={[0.12, 1.1, 0.5]} r={0.012} c="#5b6068" />
    <Rb p={[0, 1.28, 0.02]} s={[broadcast ? 0.24 : 0.16, broadcast ? 0.26 : 0.17, broadcast ? 0.42 : 0.3]} c={broadcast ? "#e6e7e9" : "#2a2e35"} />
    <mesh position={[0, 1.28, -0.16 - lens / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[broadcast ? 0.075 : 0.05, broadcast ? 0.07 : 0.045, lens, 18]} /><meshStandardMaterial color="#15181d" metalness={0.5} roughness={0.35} /></mesh>
    <mesh position={[0, 1.28, -0.16 - lens - 0.005]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[broadcast ? 0.068 : 0.044, broadcast ? 0.068 : 0.044, 0.01, 18]} /><meshStandardMaterial color="#26385a" metalness={0.9} roughness={0.05} /></mesh>
    <Rb p={[-0.1, 1.42, 0.05]} s={[0.07, 0.07, 0.14]} c="#1b1d22" />
    <mesh position={[0.05, 1.4, -0.04]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color={tally ? "#ff2020" : "#462c2c"} emissive="#ff2020" emissiveIntensity={tally ? 2 : 0} /></mesh>
    {/* rear connector plate (ports are placed here) */}
    <Rb p={[0, 1.28, broadcast ? 0.24 : 0.18]} s={[0.12, 0.1, 0.02]} c="#0d0f12" />
  </group>;
}

function Display({ device }: { device: DeviceDef }) {
  const feed = useTrainingStore((state) => venueScreenFeed(state, device.id));
  const [w, h, d] = device.size;
  const wall = device.label.includes("Wall");
  const floor = device.position[1] < 0.3;
  return <group>
    {floor && <>
      <Rod a={[0, 0, 0]} b={[0, 1.1, 0]} r={0.03} />
      <Rb p={[0, 0.02, 0]} s={[0.6, 0.04, 0.4]} c="#1d2026" />
    </>}
    {!wall && !floor && <Rb p={[0, 0.04, -0.02]} s={[w * 0.35, 0.08, 0.16]} c="#1d2026" />}
    <group position={[0, floor ? 1.1 : wall ? 0 : 0.08, 0]}>
      <Rb p={[0, h / 2, 0]} s={[w, h, Math.max(d, 0.05)]} c="#0e1014" m={0.4} r={0.35} />
      <mesh position={[0, h / 2, d / 2 + 0.004]}><planeGeometry args={[w - 0.04, h - 0.04]} /><meshBasicMaterial color="#0c1a2c" toneMapped={false} /></mesh>
      {feed && <Text font={FONT} position={[0, h / 2, d / 2 + 0.009]} fontSize={Math.min(w * 0.085, 0.075)} lineHeight={1.65} color="#e4edf8" outlineWidth={0.002} outlineColor="#06101e" maxWidth={w - 0.1} textAlign="center" anchorX="center" anchorY="middle">{sceneText(feed)}</Text>}
    </group>
  </group>;
}

function RackUnit({ device }: { device: DeviceDef }) {
  const linked = useTrainingStore((state) => {
    const s = scenarioOf(state);
    return s.requirements.some(r => [...r.from, ...r.to].some(id => s.ports[id]?.device === device.id) && requirementDone(state, r));
  });
  const [w, h, d] = device.size;
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c="#15171b" m={0.4} />
    {Array.from({ length: Math.max(2, Math.floor(h / 0.2)) }, (_, u) => <group key={u} position={[0, 0.16 + u * 0.19, d / 2 + 0.006]}>
      <Rb p={[0, 0, 0]} s={[w - 0.06, 0.15, 0.01]} c={u % 2 ? "#262a31" : "#1e2127"} />
      {[0, 1, 2].map((l) => <mesh key={l} position={[-w / 2 + 0.1 + l * 0.05, 0.03, 0.01]}><sphereGeometry args={[0.006, 6, 6]} /><meshStandardMaterial color={linked ? "#38ff6a" : "#26382e"} emissive="#38ff6a" emissiveIntensity={linked ? 1 : 0} /></mesh>)}
    </group>)}
  </group>;
}

function Desktop({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  const mixer = device.kind === "mixer" || /Mixer|Console/.test(device.label);
  const channels = device.modelId === "generic-4ch-mixer" ? 4 : 6;
  const switcher = device.equipmentRole === "switcher" || device.equipmentRole === "controller" || /Switcher/.test(device.label);
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c={device.color} />
    {switcher && <group position={[0, h + 0.004, 0]}>
      {Array.from({ length: mixer ? 8 : 10 }, (_, i) => <Rb key={i} p={[(i % (mixer ? 4 : 5) - (mixer ? 1.5 : 2)) * w * (mixer ? 0.2 : 0.16), 0.01, (Math.floor(i / (mixer ? 4 : 5)) - 0.5) * d * 0.4]} s={[w * 0.08, 0.02, mixer ? d * 0.26 : w * 0.08]} c={i === 0 ? "#e45647" : i === 1 ? "#45d36a" : "#9fb2c4"} />)}
    </group>}
    {mixer && <group>
      {Array.from({ length: channels }, (_, i) => <group key={i} position={[(i - (channels - 1) / 2) * w * 0.8 / channels, h + 0.005, 0]}>
        {[-0.26, -0.1, 0.05].map((z, row) => <mesh key={row} position={[0, 0.007, z * d]}><cylinderGeometry args={[w * 0.015, w * 0.018, 0.012, 10]} /><meshStandardMaterial color={["#7b8189", "#4f7896", "#98734c"][row]} roughness={0.65} /></mesh>)}
        <Rb p={[0, 0, d * 0.28]} s={[0.004, 0.002, d * 0.25]} c="#0b0d11" />
        <Rb p={[0, 0.006, d * (0.21 + (i % 3) * 0.04)]} s={[w * 0.055, 0.012, d * 0.035]} c="#d0d4d8" />
      </group>)}
    </group>}
    {device.equipmentRole === "controller" && <group>
      <mesh position={[w * 0.25, h + 0.012, 0]}><cylinderGeometry args={[w * 0.16, w * 0.16, 0.022, 28]} /><meshStandardMaterial color="#2f3339" metalness={0.6} roughness={0.4} /></mesh>
      <mesh position={[w * 0.25, h + 0.024, 0]}><cylinderGeometry args={[w * 0.11, w * 0.11, 0.002, 28]} /><meshStandardMaterial color="#12161b" roughness={0.8} /></mesh>
    </group>}
    {/* front panel with I/O strip facing the trainee */}
    <mesh position={[0, h / 2, d / 2 + 0.003]}><planeGeometry args={[w * 0.86, Math.max(h * 0.5, 0.02)]} /><meshStandardMaterial color="#0a0f18" /></mesh>
  </group>;
}

function Laptop({ device }: { device: DeviceDef }) {
  const classroom = useTrainingStore((state) => ["classroom", "auditorium", "outdoor", "stadium"].includes(scenarioOf(state).layout ?? ""));
  const feed = useTrainingStore((state) => {
    if (!["classroom", "auditorium", "outdoor", "stadium"].includes(scenarioOf(state).layout ?? "")) return "";
    const view = simContext(state)?.view[device.id];
    return view?.powered ? view.picture ?? "พร้อมนำเสนอ" : "";
  });
  const [w, , d] = device.size;
  return <group>
    <Rb p={[0, 0.012, 0]} s={[w, 0.024, d]} c="#c5c8cc" m={0.5} r={0.3} />
    {classroom && <>
      {Array.from({ length: 4 }, (_, row) => Array.from({ length: 9 }, (_, col) => <Rb key={`${row}-${col}`} p={[(col - 4) * w * 0.087, 0.026, -d * 0.28 + row * d * 0.1]} s={[w * 0.07, 0.004, d * 0.065]} c="#303742" r={0.8} />))}
      <Rb p={[0, 0.026, d * 0.28]} s={[w * 0.32, 0.003, d * 0.2]} c="#9ba2ab" r={0.65} />
    </>}
    <group position={[0, 0.024, -d / 2]} rotation={[-0.3, 0, 0]}>
      <Rb p={[0, d * 0.48, 0]} s={[w, d * 0.96, 0.014]} c="#c5c8cc" m={0.5} r={0.3} />
      <mesh position={[0, d * 0.48, 0.008]}><planeGeometry args={[w - 0.03, d * 0.88]} /><meshBasicMaterial color={classroom && !feed ? "#10151e" : "#1b3d6e"} toneMapped={false} /></mesh>
      {classroom && feed && <Text font={FONT} position={[0, d * 0.48, 0.01]} fontSize={w * 0.075} lineHeight={1.65} maxWidth={w * 0.84} color="#eef4fc" textAlign="center" anchorX="center" anchorY="middle">{sceneText(feed)}</Text>}
    </group>
  </group>;
}

function Mic({ device }: { device: DeviceDef }) {
  const onFloor = device.position[1] < 0.3;
  const shotgun = device.modelId==='reference-shotgun' || /Shotgun/.test(device.label);
  const stageHandheld = (device.modelId==='reference-handheld-tx' || /Wireless Handheld/.test(device.label)) && device.position[1] > 0.3;
  return <group>
    {stageHandheld && <>
      <mesh position={[0, -0.785, 0]}><cylinderGeometry args={[0.15, 0.17, 0.03, 16]} /><meshStandardMaterial color="#202328" roughness={0.7} /></mesh>
      <Rod a={[0, -0.77, 0]} b={[0, 0, 0]} r={0.013} />
    </>}
    {onFloor && <>
      {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Rod key={k} a={[0, 0.3, 0]} b={[Math.cos(a) * 0.3, 0.01, Math.sin(a) * 0.3]} r={0.01} />; })}
      <Rod a={[0, 0.3, 0]} b={[0, shotgun ? 1.9 : 1.45, 0]} r={0.012} />
      {shotgun && <Rod a={[0, 1.9, 0]} b={[0, 2.0, -0.9]} r={0.012} />}
    </>}
    <group position={onFloor ? [0, shotgun ? 1.95 : 1.48, shotgun ? -0.9 : 0] : [0, 0.03, 0]} rotation={onFloor || stageHandheld ? [0.3, 0, 0] : [Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[shotgun ? 0.012 : 0.016, shotgun ? 0.012 : 0.011, shotgun ? 0.3 : 0.18, 12]} /><meshStandardMaterial color="#1c1c1e" metalness={0.4} roughness={0.5} /></mesh>
      {!shotgun && <mesh position={[0, 0.11, 0]}><sphereGeometry args={[0.026, 24, 16]} /><meshStandardMaterial color="#555a60" metalness={0.55} roughness={0.75} /></mesh>}
      {shotgun && Array.from({length:12},(_,i)=><Rb key={i} p={[0,0.035+i*.009,-.012]} s={[.012,.003,.001]} c="#080a0d" />)}
      {device.modelId==='reference-handheld-tx' && <Rb p={[0,-.025,.016]} s={[.016,.025,.002]} c="#263d42" />}
    </group>
  </group>;
}

function Lavalier({device}:{device:DeviceDef}) {
  const scenario=useTrainingStore(state=>scenarioOf(state));
  const end=genericLocalPorts(device,scenario.ports)[0]?.at;
  // Shape family from AUD-LAV-TX, not an unverified microphone manufacturer/model.
  return <group>
    <mesh position={[0,.016,0]}><sphereGeometry args={[.012,20,12]} /><meshStandardMaterial color="#171a1e" roughness={.95} /></mesh>
    <mesh position={[0,.008,0]}><cylinderGeometry args={[.007,.006,.016,16]} /><meshStandardMaterial color="#24272c" /></mesh>
    <Rb p={[.016,.01,0]} s={[.027,.006,.008]} c="#343941" m={.6} />
    <Rb p={[.022,.003,0]} s={[.018,.003,.008]} c="#24282e" m={.6} />
    {end && <TailLead points={[[0,.003,0],[0,.004,.028],[end[0],.012,end[2]*.7],end]} />}
  </group>;
}

function Receiver({device}:{device:DeviceDef}) {
  const [w,h,d]=device.size;
  return <group>
    <Rb p={[0,h/2,0]} s={[w,h,d]} c="#1c2026" />
    <Rb p={[0,h*.55,d/2+.001]} s={[w*.5,h*.45,.002]} c="#253f49" r={.3} />
    {[-1,1].map(side=><group key={side}>
      <Rod a={[side*w*.4,h*.5,-d*.4]} b={[side*w*.46,h+.08,-d*.4]} r={.003} />
      <Rb p={[side*w*.38,h*.55,d/2+.003]} s={[w*.08,h*.28,.003]} c="#686e77" />
    </group>)}
  </group>;
}

function Stagebox({device}:{device:DeviceDef}) {
  const [w,h,d]=device.size;
  return <group>
    <Rb p={[0,h/2,0]} s={[w,h,d]} c="#202329" m={.45} />
    <Rb p={[0,h/2,-d/2-.001]} s={[w*.94,h*.9,.002]} c="#11161c" />
    {[-1,1].map(side=><group key={side}>
      <Rb p={[side*w*.46,h*.65,0]} s={[w*.025,.015,d*.6]} c="#383d45" />
      {[-1,1].map(end=><Rb key={end} p={[side*w*.46,h*.53,end*d*.28]} s={[w*.025,h*.24,.015]} c="#383d45" />)}
    </group>)}
  </group>;
}

function TailLead({points}:{points:[number,number,number][]}) {
  const geometry=useMemo(()=>new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),16,.003,6,false),[points]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#171b20" roughness={.85} /></mesh>;
}

function SnakeTail({device}:{device:DeviceDef}) {
  const scenario=useTrainingStore(state=>scenarioOf(state));
  const ends=genericLocalPorts(device,scenario.ports), [w,h,d]=device.size;
  const branches=ends.filter(p=>p.port.connector==='XLR');
  return <group>
    {/* Neutral multipin housing: contact count and vendor are not established in the archive. */}
    <Rb p={[0,h/2,d*.23]} s={[w*.18,h*.42,d*.38]} c="#343b46" m={.55} />
    {branches.map(({key,at,normal},i)=>{
      const end=at.map((v,j)=>v-normal[j]*.038) as [number,number,number];
      const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...normal));
      return <group key={key}>
        <TailLead points={[[0,h/2,d*.04],[end[0]*.3,h*.18,0],[end[0]*.8,end[1]*.8,end[2]*.65],end]} />
        <mesh position={at.map((v,j)=>v-normal[j]*.018) as [number,number,number]} quaternion={q}><cylinderGeometry args={[.014,.013,.036,20]} /><meshStandardMaterial color="#303640" metalness={.55} roughness={.4} /></mesh>
        <mesh position={at.map((v,j)=>v-normal[j]*.027) as [number,number,number]} quaternion={q}><cylinderGeometry args={[.0143,.0143,.004,16]} /><meshStandardMaterial color={['#b84842','#b99543','#467c9d','#599064','#8e6498','#999fa8'][i%6]} /></mesh>
      </group>;
    })}
  </group>;
}

function InspectSockets({device}:{device:DeviceDef}) {
  const scenario=useTrainingStore(state=>scenarioOf(state));
  return <group>{genericLocalPorts(device,scenario.ports).map(({key,port,at,normal})=><group key={key} position={at} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0,0,1),new Vector3(...normal))}>
    <PortSocket connector={port.connector} direction={port.direction} />
  </group>)}</group>;
}

function Bodypack({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  return <group>
    <Rb p={[0, h / 2, 0]} s={[w, h, d]} c="#15181d" />
    <Rod a={[w * 0.3, h, 0]} b={[w * 0.3, h + 0.12, 0]} r={0.004} c="#0e0e0e" />
    <mesh position={[-w * 0.25, h * 0.75, d / 2 + 0.002]}><circleGeometry args={[0.008, 10]} /><meshBasicMaterial color="#26382e" /></mesh>
    <Rb p={[0, h * 0.63, d / 2 + 0.002]} s={[w * 0.65, h * 0.22, 0.004]} c="#2e4651" r={0.3} />
    {[-1, 0, 1].map((x) => <Rb key={x} p={[x * w * 0.23, h * 0.37, d / 2 + 0.003]} s={[w * 0.13, h * 0.07, 0.005]} c="#535a63" />)}
    <Rb p={[0, h * 0.45, -d / 2 - 0.003]} s={[w * 0.35, h * 0.55, 0.005]} c="#20252a" m={0.6} />
  </group>;
}

function Projector({ device }: { device: DeviceDef }) {
  const [w, profileHeight, d] = device.size;
  const h=profileHeight*.73; // EB-FH52's low chassis; preserve the larger training collision/packing envelope.
  return <group><Rb p={[0, h / 2, 0]} s={[w, h, d]} c="#e3e5e6" r={0.65} />
    <Rb p={[0,h*.48,-d/2-.002]} s={[w*.92,h*.7,.005]} c="#191c20" r={.8} />
    <mesh position={[w*.23,h*.53,-d/2-.007]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[h*.34,h*.34,.012,32]} /><meshStandardMaterial color="#777d83" metalness={.65} roughness={.3} /></mesh>
    <mesh position={[w * 0.23, h * 0.53, -d / 2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[h * 0.28, h * 0.28, 0.008, 24]} /><meshStandardMaterial color="#142131" metalness={0.6} roughness={0.13} /></mesh>
    {Array.from({ length: 7 }, (_, i) => <Rb key={i} p={[-w * 0.36 + i * w * 0.035, h * 0.5, -d / 2 - 0.006]} s={[w * 0.012, h * 0.51, 0.003]} c="#454a4d" />)}
    <Rb p={[w*.23,h+.001,-d*.17]} s={[w*.19,.004,d*.29]} c="#a1a5a6" />
    <Rb p={[w*.23,h+.004,-d*.15]} s={[w*.08,.008,d*.15]} c="#d3d5d5" />
    {Array.from({length:5},(_,i)=><Rb key={i} p={[-w*.21+i*w*.055,h+.003,d*.27]} s={[w*.033,.004,d*.035]} c="#b9bdc0" />)}
    <Text font={FONT} position={[-w*.03,h*.5,-d/2-.007]} rotation={[0,Math.PI,0]} fontSize={w*.035} color="#ddd" anchorX="center" anchorY="middle">EPSON</Text>
  </group>;
}

function Speaker({ device }: { device: DeviceDef }) {
  const [w, h, d] = device.size;
  const shell=useMemo(()=>photoLoftGeometry({t:'loft',sections:[[-d/2,h/2,w,h],[d*.12,h/2,w*.98,h],[d/2,h/2,w*.7,h*.94]],chamfer:.11,c:'#202329'}),[w,h,d]);
  return <group>
    <mesh geometry={shell} castShadow receiveShadow><meshStandardMaterial color="#202329" roughness={.83} /></mesh>
    <Rb p={[0, h / 2, -d / 2 - 0.003]} s={[w * 0.86, h * 0.88, 0.012]} c="#0e1014" r={0.95} />
    <mesh position={[0,h*.49,-d/2-.011]} rotation={[0,Math.PI,0]}><planeGeometry args={[w*.83,h*.85]} /><meshStandardMaterial color="#454a50" map={SPEAKER_GRILLE} bumpMap={SPEAKER_GRILLE} bumpScale={.0005} metalness={.35} roughness={.8} /></mesh>
    <Rb p={[0, h / 2, d / 2 + 0.003]} s={[w * 0.62, h * 0.65, 0.008]} c="#0c1017" />
    {[-1,1].map(side=><group key={`handle-${side}`}>
      <Rb p={[side*w*.485,h*.54,d*.01]} s={[.008,h*.28,d*.25]} c="#0d1116" />
      <Rb p={[side*w*.493,h*.54,d*.05]} s={[.015,h*.22,.017]} c="#33383d" />
    </group>)}
    <Text font={FONT} position={[0,h*.09,-d/2-.018]} rotation={[0,Math.PI,0]} fontSize={w*.037} color="#aaaeb5" anchorX="center" anchorY="middle">YAMAHA</Text>
    {[-1, 1].map((x) => <Rb key={x} p={[x * w * 0.3, 0.008, 0]} s={[0.045, 0.016, d * 0.8]} c="#111317" />)}
  </group>;
}

/** Photo-derived ShuttlePRO v2 silhouette. Scale is an estimate, not a factory dimensional drawing.
 * The purple CTRL-REPLAY marker remains a logical training target; it is NOT a physical socket on this product.
 */
function ShuttleController() {
  const shell=useMemo(()=>{
    const shape=new Shape();
    shape.moveTo(0,-.105);
    shape.bezierCurveTo(-.068,-.105,-.068,-.025,-.052,.018);
    shape.bezierCurveTo(-.044,.06,-.047,.103,0,.108);
    shape.bezierCurveTo(.047,.103,.044,.06,.052,.018);
    shape.bezierCurveTo(.068,-.025,.068,-.105,0,-.105);
    const geometry=new ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelThickness:.005,bevelSize:.004,bevelSegments:3,steps:1,curveSegments:20});
    geometry.rotateX(Math.PI/2);geometry.translate(0,.025,0);return geometry;
  },[]);
  const upper:[number,number][]=[[-.032,-.075],[-.011,-.082],[.011,-.082],[.032,-.075],[-.04,-.049],[-.021,-.059],[0,-.065],[.021,-.059],[.04,-.049]];
  return <group>
    <mesh geometry={shell} castShadow receiveShadow><meshStandardMaterial color="#1b1c20" roughness={.58} /></mesh>
    <mesh position={[0,.03,-.014]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.028,.006,12,48]} /><meshStandardMaterial color="#0c0e12" roughness={.5} /></mesh>
    <mesh position={[0,.03,-.014]}><cylinderGeometry args={[.021,.021,.006,48]} /><meshStandardMaterial color="#c4c7cb" metalness={.85} roughness={.28} /></mesh>
    {[0,1,2].map(i=>{const a=i*Math.PI*2/3;return <mesh key={i} position={[Math.sin(a)*.011,.0334,-.014+Math.cos(a)*.011]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.006,20]} /><meshStandardMaterial color="#65696f" metalness={.7} roughness={.4} /></mesh>;})}
    {upper.map(([x,z],i)=><Rb key={i} p={[x,.029,z]} s={[.014,.005,.009]} c="#c3c5c8" m={.8} r={.24} />)}
    {[-1,1].flatMap(side=>[0,1].map(row=><group key={`${side}-${row}`} position={[side*.031,.029,.018+row*.016]} rotation={[0,side*.55,0]}><Rb p={[0,0,0]} s={[.028,.005,.009]} c="#c3c5c8" m={.8} r={.24} /></group>))}
    {[-1,1].map(side=><Rb key={side} p={[side*.048,.028,-.01]} s={[.009,.004,.028]} c="#101216" />)}
    <Text font={FONT} position={[0,.032,.048]} rotation={[-Math.PI/2,0,0]} fontSize={.006} color="#bfc2c7" anchorX="center" anchorY="middle">ShuttlePRO v2</Text>
    {/* Captive USB lead exits rear; no invented direct physical cable to the replay appliance. */}
    <TailLead points={[[0,.013,-.108],[0,.012,-.13],[.01,.008,-.15],[.025,.006,-.16]]} />
  </group>;
}

export function GenericDevice({ device, bare = false }: { device: DeviceDef; bare?: boolean }) {
  const classroomDisplay = useTrainingStore((state) => {
    const scenario = scenarioOf(state);
    const instance = scenario.simDevices?.[device.id];
    return Boolean(scenario.stage && instance && MODELS[instance.model]?.role === "display");
  });
  const [, h] = device.size;
  const kind = device.kind;
  const presentation=genericPresentation(device);
  const tall = device.size[1] >= 0.8 && kind === "box";
  // Large monitors are still screens; height alone must not turn them into a rack.
  const display = classroomDisplay || kind === "box" && /Monitor|Wall|TV|Screen|Display|Destination|Projector/.test(device.label) && !/Processor|Converter|Encoder|Router|Interface/.test(device.label);
  let body, labelY;
  if (presentation==='lavalier') {body=<Lavalier device={device} />;labelY=.08;}
  else if(presentation==='shuttle-controller') {body=<ShuttleController />;labelY=.14;}
  else if(presentation==='stagebox') {body=<Stagebox device={device} />;labelY=h+.12;}
  else if(presentation==='snake-tail') {body=<SnakeTail device={device} />;labelY=h+.12;}
  else if(presentation==='receiver') {body=<Receiver device={device} />;labelY=h+.12;}
  else if (kind === "camera") { body = <TripodCamera device={device} />; labelY = 1.68; }
  else if (presentation==='speaker') { body = <Speaker device={device} />; labelY = h + 0.12; }
  else if (device.modelId === "generic-projector") { body = <Projector device={device} />; labelY = h + 0.12; }
  else if (display) { body = <Display device={device} />; labelY = (device.position[1] < 0.3 ? 1.1 : 0.08) + h + 0.12; }
  else if (tall) { body = <RackUnit device={device} />; labelY = h + 0.15; }
  else if (kind === "laptop") { body = <Laptop device={device} />; labelY = 0.4; }
  else if (kind === "mic") { body = <Mic device={device} />; labelY = device.position[1] < 0.3 ? 2.1 : 0.16; }
  else if (kind === "bodypack") { body = <Bodypack device={device} />; labelY = h + 0.16; }
  else { body = <Desktop device={device} />; labelY = h + 0.14; }
  return <group>
    {body}
    {bare && <InspectSockets device={device} />}
    {!bare && <GenericLabel device={device} y={labelY} />}
  </group>;
}
