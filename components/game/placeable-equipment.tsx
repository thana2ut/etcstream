"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Quaternion, Vector3 } from "three";
import { useTrainingStore } from "@/game/stores/training-store";
import { STUDIO } from "@/game/training/studio-room-layout";
import { scenarioOf } from "@/game/training/hdmi-training";
import type { PlaceableDef } from "@/game/training/scenarios";
import { Hds7105Model } from "./equipment/hds7105";
import { DeviceLabel, DeviceVisual } from "./equipment/device-visual";

const handOffset = new Vector3(0.3, -0.34, -0.75);
const up = new Vector3(0, 1, 0);
const resting = new Quaternion();

/** On the side tables devices turn to face the room; on the centre table the switcher's ports face the player. */
function restingRotation(item: PlaceableDef, position: readonly number[], turn: number, venue: boolean): number {
  // Venue layouts: devices keep the orientation the layout gave them (ports toward the trainee), plus the player's turn.
  if (venue) return (item.device?.yaw ?? 0) + turn;
  const onSideTable = Math.abs(position[0]) > STUDIO.tableRadius;
  if (item.id === "switcher") return onSideTable ? STUDIO.switcherModel.sideTableRotationY : STUDIO.switcherModel.rotationY + turn;
  return onSideTable ? Math.sign(position[0]) * -Math.PI / 2 : turn;
}

function PlaceableItem({ item }: { item: PlaceableDef }) {
  const group = useRef<Group>(null);
  const position = useTrainingStore((state) => state.items[item.id].position);
  const held = useTrainingStore((state) => state.heldItem === item.id);
  const focused = useTrainingStore((state) => state.focusedTarget?.kind === "item" && state.focusedTarget.itemId === item.id);
  const turn = useTrainingStore((state) => state.items[item.id].turn);
  const venue = useTrainingStore((state) => Boolean(scenarioOf(state).venueScale));
  const isSwitcher = item.id === "switcher";
  const readableHandheld = item.device?.model?.startsWith("COMICA WM100 PLUS") || item.device?.model?.startsWith("Magewell USB Capture");
  const heldScale = isSwitcher ? 0.25 : readableHandheld ? 0.8 : 0.6;

  useFrame(({ camera }) => {
    if (!group.current) return;
    if (held) {
      group.current.position.copy(handOffset).applyQuaternion(camera.quaternion).add(camera.position);
      group.current.quaternion.copy(camera.quaternion);
      group.current.scale.setScalar(heldScale);
    } else {
      group.current.position.set(...position);
      group.current.quaternion.copy(resting.setFromAxisAngle(up, restingRotation(item, position, turn, venue)));
      group.current.scale.setScalar(1);
    }
  });

  const s = STUDIO.switcherModel.scale;
  const [w, h, d] = item.device?.size ?? [0.25 * s, 0.047 * s, 0.12 * s];
  return <group ref={group}>
    {isSwitcher ? <Hds7105Model /> : item.device && <DeviceVisual device={item.device} bare={held || !focused} />}
    {isSwitcher && focused && !held && <DeviceLabel device={{ label: "Video Switcher", model: "DeviceWell HDS7105" }} y={0.047 * s + 0.12} />}
    {!held && <mesh position={[0, h / 2, 0]} userData={{ trainingTarget: { kind: "item", itemId: item.id } }}>
      <boxGeometry args={[Math.max(w, 0.12), Math.max(h, 0.1), Math.max(d, 0.12)]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>;
}

export function PlaceableEquipment() {
  const placeables = useTrainingStore((state) => scenarioOf(state).placeables);
  return <>{placeables.map((item) => <PlaceableItem key={item.id} item={item} />)}</>;
}
