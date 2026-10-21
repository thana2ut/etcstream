"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, OrbitControls } from "@react-three/drei";
import { useTrainingStore } from "@/game/stores/training-store";
import { plugFits, scenarioOf } from "@/game/training/hdmi-training";
import { portOf } from "@/game/training/sim/engine";
import { inspectSubject } from "@/game/content/inspect-info";
import { INSPECT_HOLD_MS } from "./first-person-controller";
import { Hds7105Model } from "./equipment/hds7105";
import { DeviceVisual } from "./equipment/device-visual";
import { SamsungTv } from "./equipment/samsung-tv";
import { CableInspector } from "@/components/ui/cable-model";

/** Progress ring while E is held on a device. */
export function InspectHoldRing() {
  const start = useTrainingStore((state) => state.inspectHoldStart);
  if (start === null) return null;
  return <div className="inspect-hold" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" style={{ animationDuration: `${INSPECT_HOLD_MS}ms` }} /></svg><span>ค้างไว้เพื่อดูรายละเอียด</span></div>;
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

  const subject = inspectSubject(scenario, id);
  if (subject.kind === "cable") return <CableInspector cable={subject.catalog} definition={subject.cable} onClose={() => close(null)} />;
  const { info, device, evidence } = subject;
  const ports = Object.values(scenario.ports).filter((p) => p.device === id);
  const inputs = ports.filter((p) => p.direction === "INPUT");
  const outputs = ports.filter((p) => p.direction === "OUTPUT");

  // Hold-E opens the same orbit viewer immediately in Free Practice and every mission.
  return <div className="inspector-overlay" role="dialog" aria-modal="true" aria-labelledby="inspector-title">
    <div className="inspector-stage">
      <Canvas camera={{ fov: 40, position: [1.6, 1.2, 2.2] }} dpr={[1, 1.7]}>
        <color attach="background" args={["#10151f"]} />
        <hemisphereLight args={["#e8eef7", "#39342c", 1.6]} />
        <directionalLight position={[3, 4, 3]} intensity={2.4} />
        <directionalLight position={[-3, 2, -2]} intensity={1.1} />
        <Bounds fit clip observe margin={1.15}>
          <Center>{!scenario.venueScale && id === "switcher" ? <Hds7105Model /> : !scenario.venueScale && id === "monitor" ? <SamsungTv /> : device ? <DeviceVisual device={device} bare /> : <mesh><boxGeometry args={[0.3, 0.15, 0.2]} /><meshStandardMaterial color="#4b5563" /></mesh>}</Center>
        </Bounds>
        <OrbitControls makeDefault enableDamping minDistance={0.35} maxDistance={8} minPolarAngle={Math.PI * 0.08} maxPolarAngle={Math.PI * 0.92} />
      </Canvas>
      <p className="inspector-hint">ลากเพื่อหมุน · เลื่อนล้อเมาส์เพื่อซูม · ESC ปิด</p>
    </div>
    <aside className="inspector-panel glass-card">
      <button type="button" className="inspector-close" onClick={() => close(null)} aria-label="ปิดหน้าดูอุปกรณ์">✕</button>
      <span className="inspector-role">{info?.role ?? "อุปกรณ์"}</span>
      <h2 id="inspector-title">{info?.name ?? device?.label ?? id}</h2>
      <strong className="inspector-model">{info?.model ?? device?.model}</strong>
      <p>{evidence.classLabel} · {evidence.readinessLabel}</p>
      <p className="inspector-unverified">{evidence.note}</p>
      {info && <p>{info.summary}</p>}
      {info && info.facts.length > 0 && <><h3>ควรรู้</h3><ul>{info.facts.map((f) => <li key={f}>{f}</li>)}</ul></>}
      {info && <><h3>{scenario.venueScale ? "ในด่านนี้" : "ในห้องฝึกนี้"}</h3><p className="inspector-flow">{info.inThisRoom}</p></>}
      {ports.length > 0 && <>
        <h3>พอร์ต ({ports.length})</h3>
        <div className="inspector-ports">
          {inputs.length > 0 && <div><em>ขาเข้า</em>{inputs.map((p) => <span key={p.label}>{p.label}</span>)}</div>}
          {outputs.length > 0 && <div><em>ขาออก</em>{outputs.map((p) => <span key={p.label}>{p.label}</span>)}</div>}
        </div>
      </>}
      {scenario.stage && <details><summary>ดูหัวสายที่รองรับแต่ละพอร์ต</summary>
        <p>เป็นคำแนะนำชนิดสาย ต้องเดินไปต่อที่พอร์ตจริงและตรวจไฟเลี้ยง รูปแบบ และการตั้งค่าเอง</p>
        {Object.entries(scenario.ports).filter(([, p]) => p.device === id).map(([gid, p]) => {
          const signal = scenario.simDevices ? portOf(scenario.simDevices, gid)?.sig : undefined;
          const choices = scenario.cables.filter((c) => c.ends.some((end) => plugFits(end, p)) && c.signalClass && (c.signalClass === signal || (["MIC", "LINE_BAL"].includes(c.signalClass) && ["MIC", "LINE_BAL"].includes(signal ?? ""))));
          return <details key={gid}><summary>{p.label} · {p.connector}</summary><p>{choices.length ? choices.map((c) => `${c.id} (${c.ends.join(" ↔ ")})`).join("; ") : "ยังไม่มีคำแนะนำสายที่ยืนยันชนิดสัญญาณตรงกัน ตรวจข้อมูลหัวต่อและหน้าที่พอร์ต"}</p></details>;
        })}
      </details>}
      {info && info.unverified.length > 0 && <p className="inspector-unverified">ยังไม่ยืนยันกับของจริง: {info.unverified.join(" · ")}</p>}
    </aside>
  </div>;
}
