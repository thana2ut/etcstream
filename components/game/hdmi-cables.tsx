"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Quaternion, Vector3 } from "three";
import { CABLE_ENDS, portAvailable, portPosition, scenarioOf, type CableEnd, type CableId, type Point3 } from "@/game/training/hdmi-training";
import type { PortDef } from "@/game/training/scenarios";
import { useTrainingStore } from "@/game/stores/training-store";
import { PlugMesh } from "./cable-plugs";
import { itemVisualTransform } from "./placeable-equipment";

const up = new Vector3(0, 1, 0);
const a = new Vector3();
const b = new Vector3();
const start = new Vector3();
const finish = new Vector3();
const midpoint = new Vector3();
const direction = new Vector3();
const handOffset = new Vector3(0.37, -0.33, -0.65);
/** Second plug of a carried lead: held a little lower and to the left (both ends travel with the player). */
const spareOffset = new Vector3(0.18, -0.46, -0.6);
const micOffset = new Vector3(0.15, -0.4, -0.64);
const hostPos = new Vector3();
const hostRot = new Quaternion();
const segmentRotation = new Quaternion();
const segmentCount = 9;
const tipDir = new Vector3();
const negZ = new Vector3(0, 0, -1);

function endPoint(_ports: Record<string, PortDef>, position: Point3, portId: string | null, held: boolean | "spare", camera: import("three").Camera, output: Vector3) {
  // A lead fixed to a device still on the equipment table lies at its loose spot.
  const state = useTrainingStore.getState();
  if (portId && portAvailable(state, portId)) return output.set(...portPosition(state, portId));
  if (held === "spare") return output.copy(spareOffset).applyQuaternion(camera.quaternion).add(camera.position);
  if (held) return output.copy(handOffset).applyQuaternion(camera.quaternion).add(camera.position);
  return output.set(...position);
}

/** Seated plugs shrink so neighbouring jacks stay visible; loose plugs are a bit larger to grab. */
function plugFit(portId: string | null): { scale: number; hit: number } {
  return portId ? { scale: 0.32, hit: 0.1 } : { scale: 0.55, hit: 0.15 };
}

function Cable({ id }: { id: CableId }) {
  const cable = useTrainingStore((state) => state.cables[id]);
  const held = useTrainingStore((state) => state.held);
  const ends = useRef<Record<CableEnd, Group | null>>({ a: null, b: null });
  const segments = useRef<(Mesh | null)[]>([]);
  const scenario = useTrainingStore((state) => scenarioOf(state));
  const def = scenario.cables.find((c) => c.id === id)!;
  const color = def.color;
  const adapter = Boolean(def.socketB);
  const lockedHost = useMemo(() => {
    const port = def.locked && def.fixedA ? scenario.ports[scenario.initialConnections?.find((c) => c.cableId === id)?.to ?? ""] : undefined;
    const item = port?.requiresItem ? scenario.placeables.find((p) => p.id === port.requiresItem) : undefined;
    if (!port || !item) return null;
    // Offsets in the device's own frame: the plug from the authored jack, the capsule from its start beside the TX.
    return {
      item,
      plug: new Vector3(port.position[0] - item.zone[0], port.position[1] - item.zone[1], port.position[2] - item.zone[2]),
      capsule: new Vector3(def.start[0][0] - item.start[0], def.start[0][1] - item.start[1], def.start[0][2] - item.start[2]),
    };
  }, [def, id, scenario]);

  useFrame(({ camera }) => {
    const carrying = held?.cableId === id;
    const role = (end: CableEnd): boolean | "spare" => !carrying ? false : held!.end === end ? true : (held!.single || cable[end].portId || (end === "a" && def.fixedA) ? false : "spare");
    if (def.locked && lockedHost) {
      // Factory-wired lead: capsule and plug ride along with their transmitter, wherever it is.
      const state = useTrainingStore.getState();
      const k = itemVisualTransform(state, lockedHost.item, camera, hostPos, hostRot);
      a.copy(lockedHost.capsule).multiplyScalar(k).applyQuaternion(hostRot).add(hostPos);
      b.copy(lockedHost.plug).multiplyScalar(k).applyQuaternion(hostRot).add(hostPos);
    } else if (def.fixedA) {
      // This end is the mic capsule, not a second plug seated on the transmitter.
      if (carrying && !held?.single) a.copy(micOffset).applyQuaternion(camera.quaternion).add(camera.position);
      else a.set(...cable.a.loosePosition);
    } else endPoint(scenario.ports, cable.a.loosePosition, cable.a.portId, role("a"), camera, a);
    if (!(def.locked && lockedHost)) endPoint(scenario.ports, cable.b.loosePosition, cable.b.portId, role("b"), camera, b);
    if (adapter) b.copy(a);                       // an adapter is a single rigid piece
    ends.current.a?.position.copy(a);
    ends.current.b?.position.copy(b);
    // Point each plug tip away from the cable (toward the jack it sits in).
    for (const [end, self, other] of [["a", a, b], ["b", b, a]] as const) {
      const node = ends.current[end];
      if (!node) continue;
      tipDir.copy(self).sub(other);
      if (adapter || tipDir.lengthSq() < 1e-6) tipDir.set(0, 0, -1);
      node.quaternion.setFromUnitVectors(negZ, tipDir.normalize());
    }
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
      <group scale={def.fixedA && end === "a" ? 1.15 : plugFit(cable[end].portId).scale}>
      {!(adapter && end === "b") && <PlugMesh style={def.plugs?.[end === "a" ? 0 : 1] ?? "hdmi"} accent={end === "a" ? "#c21d1d" : "#e9e9e9"} />}
      <mesh userData={{ trainingTarget: { kind: "end", cableId: id, end } }}>
        <sphereGeometry args={[plugFit(cable[end].portId).hit, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      </group>
    </group>)}
    {!adapter && Array.from({ length: segmentCount }, (_, index) => <mesh key={index} ref={(node) => { segments.current[index] = node; }} castShadow>
      <cylinderGeometry args={[def.short ? 0.009 : 0.012, def.short ? 0.009 : 0.012, 1, 7]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} />
    </mesh>)}
  </group>;
}

export function HdmiCables() {
  const cables = useTrainingStore((state) => scenarioOf(state).cables);
  return <>{cables.map((cable) => <Cable key={cable.id} id={cable.id} />)}</>;
}
