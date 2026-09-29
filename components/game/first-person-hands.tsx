"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useTrainingStore } from "@/game/stores/training-store";

export function FirstPersonHands() {
  const group = useRef<Group>(null);
  const holding = useTrainingStore((state) => Boolean(state.held || state.heldItem));
  useFrame(({ camera }) => {
    if (!group.current) return;
    group.current.position.copy(camera.position);
    group.current.quaternion.copy(camera.quaternion);
  });

  return <group ref={group}>
    <group position={[-0.62, -0.57, -0.98]} rotation={[0.24, 0, -0.28]} scale={0.54}>
      <mesh renderOrder={10}><capsuleGeometry args={[0.105, 0.32, 5, 10]} /><meshStandardMaterial color="#947969" roughness={0.83} depthTest={false} /></mesh>
      <mesh position={[0, -0.22, 0.025]} renderOrder={10}><cylinderGeometry args={[0.13, 0.16, 0.31, 10]} /><meshStandardMaterial color="#19334d" roughness={0.55} metalness={0.25} depthTest={false} /></mesh>
      <mesh position={[0, 0.22, -0.02]} renderOrder={10}><sphereGeometry args={[0.12, 10, 8]} /><meshStandardMaterial color="#947969" roughness={0.83} depthTest={false} /></mesh>
    </group>
    <group position={[0.56, -0.57, -0.98]} rotation={[holding ? -0.2 : 0.2, 0, 0.3]} scale={0.54}>
      <mesh renderOrder={10}><capsuleGeometry args={[0.11, 0.33, 5, 10]} /><meshStandardMaterial color="#a3846e" roughness={0.83} depthTest={false} /></mesh>
      <mesh position={[0, -0.24, 0.02]} renderOrder={10}><cylinderGeometry args={[0.14, 0.17, 0.3, 10]} /><meshStandardMaterial color="#19334d" roughness={0.55} metalness={0.25} depthTest={false} /></mesh>
      <mesh position={[0, 0.22, -0.02]} renderOrder={10}><sphereGeometry args={[0.13, 10, 8]} /><meshStandardMaterial color="#a3846e" roughness={0.83} depthTest={false} /></mesh>
      {holding && <mesh position={[0, 0.28, -0.07]} renderOrder={11}><boxGeometry args={[0.14, 0.07, 0.19]} /><meshStandardMaterial color="#d8b874" emissive="#d8b874" emissiveIntensity={0.28} depthTest={false} /></mesh>}
    </group>
  </group>;
}
