"use client";

import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { Mesh } from "three";
import { STUDIO } from "@/game/training/studio-room-layout";

function RoomAsset() {
  const { scene } = useGLTF("/models/environment/studio-room-01.glb");
  const room = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; }
    });
    return copy;
  }, [scene]);
  return <primitive object={room} dispose={null} />;
}

function FallbackRoom() {
  const { width, depth } = STUDIO.room;
  return <>
    <mesh position={[0, -0.08, 0]} receiveShadow><boxGeometry args={[width, 0.16, depth]} /><meshStandardMaterial color="#303335" /></mesh>
    <mesh position={[0, 1.45, -depth / 2 + 0.12]}><boxGeometry args={[6.3, 2.9, 0.06]} /><meshStandardMaterial color="#15912c" /></mesh>
    <mesh position={[...STUDIO.table]}><cylinderGeometry args={[STUDIO.tableRadius, STUDIO.tableRadius, 0.05, 48]} /><meshStandardMaterial color="#c59c68" /></mesh>
  </>;
}
class RoomBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { if (process.env.NODE_ENV === "development") console.error("Studio asset failed", error); }
  render() {
    return this.state.failed ? <><FallbackRoom /><Html center position={[0, 2.2, -1]}><div role="status" style={{ width: 260, padding: 12, background: "#111", color: "white" }}>โหลดฉากสตูดิโอไม่สำเร็จ ใช้ห้องสำรองชั่วคราว กรุณาโหลดหน้าใหม่เพื่อลองอีกครั้ง</div></Html></> : this.props.children;
  }
}

export function StudioRoom01() {
  const { width, depth, height } = STUDIO.room;
  return <>
    <color attach="background" args={["#24282b"]} />
    <hemisphereLight args={["#e6edf5", "#4e4840", 1.4]} />
    <directionalLight position={[0, 2.8, 1.8]} target-position={[0, 0, -0.8]} intensity={2.2} color="#fff2dc" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={3.5} shadow-camera-bottom={-3.5} shadow-normalBias={0.025} />
    {STUDIO.lights.map((p, i) => <pointLight key={i} position={[p[0], p[1] - 0.15, p[2] + 0.3]} intensity={i < 3 ? 5 : 4} distance={5} decay={2} color="#fff3e0" />)}
    <RoomBoundary><Suspense fallback={<FallbackRoom />}><RoomAsset /></Suspense></RoomBoundary>
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[0, -0.08, 0]} args={[width / 2 + 0.1, 0.08, depth / 2 + 0.1]} />
      {[-1, 1].map((side) => <group key={side}>
        <CuboidCollider position={[side * (width / 2 + 0.05), height / 2, 0]} args={[0.05, height / 2, depth / 2]} />
        <CuboidCollider position={[0, height / 2, side * (depth / 2 + 0.05)]} args={[width / 2, height / 2, 0.05]} />
      </group>)}
      <CuboidCollider position={[0, 1.45, -depth / 2 + 0.2]} args={[3.15, 1.45, 0.13]} />
      <CylinderCollider position={[STUDIO.table[0], 0.375, STUDIO.table[2]]} args={[0.375, STUDIO.tableRadius]} />
      {STUDIO.sideTables.map(([x, , z], i) => <CuboidCollider key={i} position={[x, 0.39, z]} args={[STUDIO.sideTableSize[0] / 2, 0.39, STUDIO.sideTableSize[2] / 2]} />)}
      <CuboidCollider position={[STUDIO.monitor[0], 0.72, STUDIO.monitor[2]]} args={[0.36, 0.72, 0.3]} />
      <CuboidCollider position={STUDIO.speaker} args={[0.16, 0.24, 0.18]} />
      {STUDIO.cameras.map(([x, , z], i) => <CylinderCollider key={i} position={[x, 0.61, z]} args={[0.61, 0.22]} />)}
      {STUDIO.lights.slice(3).map(([x, , z], i) => <CylinderCollider key={i} position={[x, 1, z]} args={[1, 0.2]} />)}
    </RigidBody>
  </>;
}
