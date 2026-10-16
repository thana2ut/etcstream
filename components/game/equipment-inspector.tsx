"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, OrbitControls } from "@react-three/drei";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf } from "@/game/training/hdmi-training";
import type { DeviceDef } from "@/game/training/scenarios";
import { EQUIPMENT_INFO } from "@/game/content/equipment-info";
import { simEquipmentInfo } from "@/game/content/sim-equipment-info";
import { INSPECT_HOLD_MS } from "./first-person-controller";
import { Hds7105Model } from "./equipment/hds7105";
import { DeviceVisual } from "./equipment/device-visual";
import { SamsungTv } from "./equipment/samsung-tv";

/** Progress ring while E is held on a device. */
export function InspectHoldRing() {
  const start = useTrainingStore((state) => state.inspectHoldStart);
  if (start === null) return null;
  return <div className="inspect-hold" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" style={{ animationDuration: `${INSPECT_HOLD_MS}ms` }} /></svg><span>Hold to inspect</span></div>;
}

/** Full-screen orbit view of one device plus learning notes and its port list. */
export function EquipmentInspector() {
  const id = useTrainingStore((state) => state.inspecting);
  const close = useTrainingStore((state) => state.setInspecting);
  const scenario = useTrainingStore((state) => scenarioOf(state));
  useEffect(() => {
    if (!id) return;
    const onKey = (event: KeyboardEvent) => { if (event.code === "Escape") close(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, close]);
  if (!id) return null;

  // Mission venues use mission-only knowledge; free practice keeps its studio notes.
  const info = scenario.simDevices?.[id] ? simEquipmentInfo(scenario, id) : EQUIPMENT_INFO[id];
  const device: DeviceDef | undefined = scenario.devices.find((d) => d.id === id);
  const ports = Object.values(scenario.ports).filter((p) => p.device === id);
  const inputs = ports.filter((p) => p.direction === "INPUT");
  const outputs = ports.filter((p) => p.direction === "OUTPUT");

  // Mission Hall: a compact, optional card beside the 3D room (the room stays the main interface). ESC / ✕ closes it.
  if (scenario.venueScale) return <aside className="inspector-compact glass-card" role="dialog" aria-labelledby="inspector-title">
    <button type="button" className="inspector-close" onClick={() => close(null)} aria-label="Close equipment info">✕</button>
    <span className="inspector-role">{info?.role ?? "Equipment"}</span>
    <h2 id="inspector-title">{device?.label ?? id}</h2>
    <strong className="inspector-model">{info?.model ?? device?.model}</strong>
    <details open><summary>What it is / what it is for</summary><p>{info?.summary ?? "Equipment in this stage"}</p></details>
    {info && info.facts.length > 0 && <details><summary>Key facts</summary><ul>{info.facts.map((f) => <li key={f}>{f}</li>)}</ul></details>}
    {ports.length > 0 && <details><summary>Ports ({ports.length})</summary><ul>{[...inputs, ...outputs].map((p) => <li key={p.label}>{p.label} · {p.direction}</li>)}</ul></details>}
    {info && <details open><summary>In this stage</summary><p>{info.inThisRoom}</p></details>}
    <p className="inspector-unverified">Data status: {device?.status ?? "GENERIC TRAINING MODEL"} · 3D model is an original training stand-in{info && info.unverified.length > 0 ? ` · unverified: ${info.unverified.join(", ")}` : ""}</p>
  </aside>;

  return <div className="inspector-overlay" role="dialog" aria-modal="true" aria-labelledby="inspector-title">
    <div className="inspector-stage">
      <Canvas camera={{ fov: 40, position: [1.6, 1.2, 2.2] }} dpr={[1, 1.7]}>
        <color attach="background" args={["#10151f"]} />
        <hemisphereLight args={["#e8eef7", "#39342c", 1.6]} />
        <directionalLight position={[3, 4, 3]} intensity={2.4} />
        <directionalLight position={[-3, 2, -2]} intensity={1.1} />
        <Bounds fit clip observe margin={1.15}>
          <Center>{id === "switcher" ? <Hds7105Model /> : id === "monitor" ? <SamsungTv /> : device && <DeviceVisual device={device} bare />}</Center>
        </Bounds>
        <OrbitControls makeDefault enableDamping minDistance={0.35} maxDistance={8} minPolarAngle={Math.PI * 0.08} maxPolarAngle={Math.PI * 0.92} />
      </Canvas>
      <p className="inspector-hint">Drag to rotate · scroll to zoom · ESC closes</p>
    </div>
    <aside className="inspector-panel glass-card">
      <button type="button" className="inspector-close" onClick={() => close(null)} aria-label="Close the equipment view">✕</button>
      <span className="inspector-role">{info?.role ?? "Equipment"}</span>
      <h2 id="inspector-title">{info?.name ?? device?.label ?? id}</h2>
      <strong className="inspector-model">{info?.model ?? device?.model}</strong>
      {device?.status && <p>{device.status} · {device.generic ? "Generic Training Device stand-in, not a product replica" : ""}</p>}
      {info && <p>{info.summary}</p>}
      {info && info.facts.length > 0 && <><h3>Key facts</h3><ul>{info.facts.map((f) => <li key={f}>{f}</li>)}</ul></>}
      {info && <><h3>{scenario.venueScale ? "In this stage" : "In this practice room"}</h3><p className="inspector-flow">{info.inThisRoom}</p></>}
      {ports.length > 0 && <>
        <h3>Ports ({ports.length})</h3>
        <div className="inspector-ports">
          {inputs.length > 0 && <div><em>INPUT</em>{inputs.map((p) => <span key={p.label}>{p.label}</span>)}</div>}
          {outputs.length > 0 && <div><em>OUTPUT</em>{outputs.map((p) => <span key={p.label}>{p.label}</span>)}</div>}
        </div>
      </>}
      {info && info.unverified.length > 0 && <p className="inspector-unverified">Not yet verified against the real unit: {info.unverified.join(" · ")}</p>}
    </aside>
  </div>;
}
