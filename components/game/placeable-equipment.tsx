"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useTrainingStore } from "@/game/stores/training-store";
import type { PlaceableItemId } from "@/game/training/hdmi-training";

const handOffset = new Vector3(0.38, -0.28, -0.72);

function PlaceableItem({ id }: { id: PlaceableItemId }) {
  const group = useRef<Group>(null);
  const position = useTrainingStore((state) => state.items[id].position);
  const held = useTrainingStore((state) => state.heldItem === id);

  useFrame(({ camera }) => {
    if (!group.current) return;
    if (held) group.current.position.copy(handOffset).applyQuaternion(camera.quaternion).add(camera.position);
    else group.current.position.set(...position);
    if (held) group.current.quaternion.copy(camera.quaternion);
    else group.current.quaternion.set(0, 0, 0, 1);
  });

  const capture = id === "capture-card";
  return <group ref={group}>
    <mesh castShadow>
      <boxGeometry args={capture ? [0.34, 0.12, 0.24] : [0.24, 0.11, 0.2]} />
      <meshStandardMaterial color={capture ? "#25374a" : "#172536"} metalness={0.55} roughness={0.38} />
    </mesh>
    <mesh position={[0, 0.025, capture ? 0.122 : 0.102]}>
      <boxGeometry args={capture ? [0.18, 0.035, 0.012] : [0.1, 0.035, 0.012]} />
      <meshStandardMaterial color={capture ? "#55d6e8" : "#e9bd6a"} emissive={capture ? "#55d6e8" : "#e9bd6a"} emissiveIntensity={0.25} />
    </mesh>
    {!held && <mesh userData={{ trainingTarget: { kind: "item", itemId: id } }}>
      <sphereGeometry args={[0.24, 10, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>;
}

export function PlaceableEquipment() {
  return <><PlaceableItem id="capture-card" /><PlaceableItem id="signal-adapter" /></>;
}
