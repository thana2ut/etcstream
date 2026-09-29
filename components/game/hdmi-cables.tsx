"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Quaternion, Vector3 } from "three";
import {
  CABLE_COLORS, CABLE_ENDS, CABLE_IDS, HDMI_PORTS,
  type CableEnd, type CableId, type Point3,
} from "@/game/training/hdmi-training";
import { useTrainingStore } from "@/game/stores/training-store";

const up = new Vector3(0, 1, 0);
const a = new Vector3();
const b = new Vector3();
const start = new Vector3();
const finish = new Vector3();
const midpoint = new Vector3();
const direction = new Vector3();
const handOffset = new Vector3(0.37, -0.33, -0.65);
const segmentRotation = new Quaternion();
const segmentCount = 9;

function endPoint(position: Point3, portId: keyof typeof HDMI_PORTS | null, held: boolean, camera: import("three").Camera, output: Vector3) {
  if (portId) return output.set(...HDMI_PORTS[portId].position);
  if (held) return output.copy(handOffset).applyQuaternion(camera.quaternion).add(camera.position);
  return output.set(...position);
}

function Cable({ id }: { id: CableId }) {
  const cable = useTrainingStore((state) => state.cables[id]);
  const held = useTrainingStore((state) => state.held);
  const ends = useRef<Record<CableEnd, Group | null>>({ a: null, b: null });
  const segments = useRef<(Mesh | null)[]>([]);
  const color = CABLE_COLORS[id];

  useFrame(({ camera }) => {
    endPoint(cable.a.loosePosition, cable.a.portId, held?.cableId === id && held.end === "a", camera, a);
    endPoint(cable.b.loosePosition, cable.b.portId, held?.cableId === id && held.end === "b", camera, b);
    ends.current.a?.position.copy(a);
    ends.current.b?.position.copy(b);
    const tabletop = a.y >= 0.79 && b.y >= 0.79;
    const sag = Math.min(0.24, 0.09 + a.distanceTo(b) * 0.035);
    for (let index = 0; index < segmentCount; index++) {
      const mesh = segments.current[index];
      if (!mesh) continue;
      const t0 = index / segmentCount;
      const t1 = (index + 1) / segmentCount;
      start.copy(a).lerp(b, t0);
      finish.copy(a).lerp(b, t1);
      start.y = tabletop ? Math.max(0.79, start.y - Math.sin(Math.PI * t0) * sag) : start.y - Math.sin(Math.PI * t0) * sag * 0.35;
      finish.y = tabletop ? Math.max(0.79, finish.y - Math.sin(Math.PI * t1) * sag) : finish.y - Math.sin(Math.PI * t1) * sag * 0.35;
      midpoint.copy(start).add(finish).multiplyScalar(0.5);
      direction.copy(finish).sub(start);
      segmentRotation.setFromUnitVectors(up, direction.clone().normalize());
      mesh.position.copy(midpoint);
      mesh.quaternion.copy(segmentRotation);
      mesh.scale.set(1, direction.length(), 1);
    }
  });

  return <group>
    {CABLE_ENDS.map((end) => <group key={end} ref={(node) => { ends.current[end] = node; }}>
      <mesh castShadow><boxGeometry args={[0.13, 0.065, 0.18]} /><meshStandardMaterial color="#182637" metalness={0.65} roughness={0.3} /></mesh>
      <mesh position={[0, 0, -0.11]}><boxGeometry args={[0.1, 0.04, 0.055]} /><meshStandardMaterial color={color} metalness={0.55} emissive={color} emissiveIntensity={0.25} /></mesh>
      <mesh userData={{ trainingTarget: { kind: "end", cableId: id, end } }}>
        <sphereGeometry args={[0.17, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>)}
    {Array.from({ length: segmentCount }, (_, index) => <mesh key={index} ref={(node) => { segments.current[index] = node; }} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 1, 7]} />
      <meshStandardMaterial color="#202b3d" roughness={0.82} metalness={0.18} />
    </mesh>)}
  </group>;
}

export function HdmiCables() {
  return <>{CABLE_IDS.map((id) => <Cable key={id} id={id} />)}</>;
}
