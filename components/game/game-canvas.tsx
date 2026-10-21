"use client";

import { memo, useEffect, useState } from "react";
import { loadSceneFont } from "@/game/rendering/scene-font";
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
import { environmentViews } from "@/game/training/environment-review";

export const GameCanvas = memo(function GameCanvas({ venue, active, fallbackLook, touch, onExitFallback, onPointerLockError }: { active: boolean; fallbackLook: boolean; touch: boolean; onExitFallback: () => void; onPointerLockError: () => void; venue?: VenueId }) {
  // Adaptive resolution: start sharp, step down on slow GPUs, back up when there is headroom — keeps motion smooth.
  const [dpr, setDpr] = useState(1);
  const [fontStatus, setFontStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fontAttempt, setFontAttempt] = useState(0);
  const [reviewEnabled, setReviewEnabled] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(-1);
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("review") === "environment") {
      // Defer the optional developer surface until hydration has finished.
      const timer = window.setTimeout(() => setReviewEnabled(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);
  const scenario = useTrainingStore(scenarioOf);
  // Only the developer review surface needs item positions; players must not re-render the canvas on every move.
  const reviewItems = useTrainingStore((state) => (reviewEnabled ? state.items : null));
  const views = reviewEnabled && reviewItems ? environmentViews(scenario, reviewItems) : [];
  const reviewView = views[reviewIndex];
  useEffect(() => {
    let cancelled = false;
    loadSceneFont().then(() => { if (!cancelled) setFontStatus("ready"); }).catch((error: unknown) => {
      console.error("Scene font could not be loaded", error);
      if (!cancelled) setFontStatus("error");
    });
    return () => { cancelled = true; };
  }, [fontAttempt]);
  // Mission scenarios carry their own layout (e.g. the enlarged mission studio); free practice keeps `venue`.
  const layout = useTrainingStore((state) => scenarioOf(state).layout) ?? venue;
  const hasShadows = Boolean(layout);
  if (fontStatus !== "ready") return <div role={fontStatus === "error" ? "alert" : "status"} style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", gap: "1rem", color: "#fff1d0", background: "#101522", textAlign: "center" }}>
    <p>{fontStatus === "error" ? "โหลดฟอนต์ภาษาไทยไม่สำเร็จ กรุณาลองอีกครั้ง" : "กำลังเตรียมข้อความภาษาไทย…"}</p>
    {fontStatus === "error" && <button type="button" onClick={() => { setFontStatus("loading"); setFontAttempt((v) => v + 1); }}>ลองโหลดฟอนต์อีกครั้ง</button>}
  </div>;
  return <>{reviewEnabled && <aside aria-label="ตรวจสภาพแวดล้อม" style={{ position: "absolute", top: 80, right: 12, zIndex: 100, padding: 10, maxWidth: 300, background: "#101522ee", color: "white" }}>
    <label>มุมตรวจฉาก <select aria-label="มุมตรวจฉาก" value={reviewIndex} onChange={(event) => setReviewIndex(Number(event.target.value))}>
      <option value={-1}>กลับไปเดินตรวจ</option>{views.map((view, i) => <option key={view.id} value={i}>{view.label}</option>)}
    </select></label>
    <p style={{ fontSize: 12 }}>{reviewView?.id ?? "เดินด้วยระบบควบคุมปกติ"} · กล้องตรวจไม่เปลี่ยนคะแนนหรือภารกิจ</p>
  </aside>}<Canvas frameloop={active || reviewView ? "always" : "demand"} shadows={hasShadows ? "percentage" : false} gl={{ antialias: true, powerPreference: "high-performance", stencil: false }} camera={{ fov: 67, near: 0.1, far: 140, position: [0, 1.65, 3] }} dpr={dpr} onPointerDown={(event) => {
    const canvas = event.nativeEvent.target;
    if (active && !reviewView && !fallbackLook && !touch && !document.pointerLockElement && canvas instanceof HTMLCanvasElement) {
      // Raw (unaccelerated) deltas give a predictable turn rate; browsers without it fall back to a plain lock.
      const plain = () => { try { void Promise.resolve(canvas.requestPointerLock()).catch(onPointerLockError); } catch { onPointerLockError(); } };
      try { void Promise.resolve(canvas.requestPointerLock({ unadjustedMovement: true })).catch(plain); }
      catch { plain(); }
    }
  }} onCreated={({ gl }) => { gl.toneMappingExposure = 1.35; gl.domElement.setAttribute("aria-label", missionCopy.play.canvasLabel); gl.domElement.tabIndex = 0; }}>
    <PerformanceMonitor bounds={() => [50, 70]} flipflops={4} onIncline={() => setDpr((d) => Math.min(d + 0.1, Math.min(window.devicePixelRatio, 1.25)))} onDecline={() => setDpr((d) => Math.max(d - 0.2, 0.6))} />
    {hasShadows && <ShadowThrottle every={8} />}
    <ShaderWarmup active={active} />
    <Physics gravity={[0, -9.81, 0]}><TrainingRoom venue={venue} /><FirstPersonController venue={layout} active={active && !reviewView} reviewView={reviewView} reviewTelemetry={reviewEnabled} fallbackLook={fallbackLook} touch={touch} onExitFallback={onExitFallback} /></Physics>
  </Canvas></>;
});
