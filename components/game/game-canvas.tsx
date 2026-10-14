"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ShaderWarmup, ShadowThrottle } from "./render-performance";
import { Physics } from "@react-three/rapier";
import { missionCopy } from "@/game/content/mission-copy";
import { FirstPersonController } from "./first-person-controller";
import { TrainingRoom } from "./training-room";
import type { VenueId } from "@/game/content/mission-catalog";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf } from "@/game/training/hdmi-training";

export function GameCanvas({ venue, active, fallbackLook, touch, onExitFallback, onPointerLockError }: { active: boolean; fallbackLook: boolean; touch: boolean; onExitFallback: () => void; onPointerLockError: () => void; venue?: VenueId }) {
  // Adaptive resolution: start sharp, step down on slow GPUs, back up when there is headroom — keeps motion smooth.
  const [dpr, setDpr] = useState(1);
  // Mission scenarios carry their own layout (e.g. the enlarged mission studio); free practice keeps `venue`.
  const layout = useTrainingStore((state) => scenarioOf(state).layout) ?? venue;
  return <Canvas shadows={layout === "studio" ? "percentage" : false} gl={{ antialias: true, powerPreference: "high-performance", stencil: false }} camera={{ fov: 67, near: 0.1, far: 140, position: [0, 1.65, 3] }} dpr={dpr} onPointerDown={(event) => {
    const canvas = event.nativeEvent.target;
    if (active && !fallbackLook && !touch && !document.pointerLockElement && canvas instanceof HTMLCanvasElement) {
      try { void Promise.resolve(canvas.requestPointerLock()).catch(onPointerLockError); }
      catch { onPointerLockError(); }
    }
  }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.35; gl.domElement.setAttribute("aria-label", missionCopy.play.canvasLabel); gl.domElement.tabIndex = 0; }}>
    <PerformanceMonitor bounds={() => [50, 70]} flipflops={4} onIncline={() => setDpr((d) => Math.min(d + 0.1, Math.min(window.devicePixelRatio, 1.25)))} onDecline={() => setDpr((d) => Math.max(d - 0.2, 0.6))} />
    {layout === "studio" && <ShadowThrottle every={8} />}
    <ShaderWarmup />
    <Physics gravity={[0, -9.81, 0]}><TrainingRoom venue={venue} /><FirstPersonController venue={layout} active={active} fallbackLook={fallbackLook} touch={touch} onExitFallback={onExitFallback} /></Physics>
  </Canvas>;
}
