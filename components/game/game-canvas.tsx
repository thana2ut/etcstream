"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { missionCopy } from "@/game/content/mission-copy";
import { FirstPersonController } from "./first-person-controller";
import { TrainingRoom } from "./training-room";

export function GameCanvas({ active, fallbackLook, onExitFallback, onPointerLockError }: { active: boolean; fallbackLook: boolean; onExitFallback: () => void; onPointerLockError: () => void }) {
  return <Canvas shadows camera={{ fov: 67, near: 0.1, far: 50, position: [0, 1.65, 3] }} dpr={[1, 1.7]} onPointerDown={(event) => {
    const canvas = event.nativeEvent.target;
    if (active && !fallbackLook && !document.pointerLockElement && canvas instanceof HTMLCanvasElement) void canvas.requestPointerLock().catch(onPointerLockError);
  }} onCreated={({ gl }) => { gl.domElement.setAttribute("aria-label", missionCopy.play.canvasLabel); gl.domElement.tabIndex = 0; }}>
    <Physics gravity={[0, -9.81, 0]}><TrainingRoom /><FirstPersonController active={active} fallbackLook={fallbackLook} onExitFallback={onExitFallback} /></Physics>
  </Canvas>;
}
