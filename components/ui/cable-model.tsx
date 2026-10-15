"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, PerspectiveCamera, useGLTF, View } from "@react-three/drei";
import { AdditiveBlending, CatmullRomCurve3, type Group, Vector3 } from "three";
import { PlugMesh } from "@/components/game/cable-plugs";
import type { PlugStyle } from "@/game/training/scenarios";
import type { CatalogCable } from "@/game/content/cable-catalog";

/**
 * 3D model of one catalog cable for the cable-prep lobby.
 * Now: TEMPORARY placeholder built from the game's plug meshes + a coiled lead.
 * Later: drop a sculpted GLB at `public/models/cables/<file>.glb` and register it in CABLE_MODEL_FILES — the viewer
 * then shows the real model instead of the placeholder, with no other code change.
 */
export const CABLE_MODEL_FILES: Record<string, string> = {
  // "VID-HDMI-A-A": "/models/cables/vid-hdmi-a-a.glb",
};

type End = PlugStyle | "box" | "multicore";
/** Plug at each end (A, B), optional scale for the A end (Mini/Micro HDMI are smaller). */
const ENDS: Record<string, [End, End, number?]> = {
  "VID-HDMI-A-A": ["hdmi", "hdmi"], "VID-HDMI-C-A": ["hdmi", "hdmi", 0.72], "VID-HDMI-D-A": ["hdmi", "hdmi", 0.55],
  "VID-SDI-3G": ["sdi", "sdi"], "VID-SDI-6G-12G": ["sdi", "sdi"], "VID-DP-DP": ["dp", "dp"], "VID-HDMI-EXTENDER": ["ethernet", "ethernet"],
  "FIB-SDI-LINK": ["fiber", "fiber"], "FIB-CAMERA-CCU": ["fiber", "fiber"], "FIB-PATCH-LC-SC": ["fiber", "fiber"],
  "AUD-LAV-TX": ["lav", "trs35"], "AUD-XLR-MIC": ["xlr-f", "xlr-m"], "AUD-RX-MIXER-XLR": ["xlr-f", "xlr-m"], "AUD-RX-MIXER-3.5": ["trs35", "trs635"],
  "AUD-XLR-LINE-BAL": ["xlr-f", "xlr-m"], "AUD-PA-ACTIVE": ["xlr-f", "xlr-m"], "AUD-TRS-6.35-BAL": ["trs635", "trs635"], "AUD-TRS-635-35": ["trs635", "trs35"],
  "AUD-TRS-3.5": ["trs35", "trs35"], "AUD-TRRS-3.5": ["trrs35", "trrs35"], "AUD-TS-6.35": ["ts635", "ts635"], "AUD-RCA-LR": ["rca", "rca"], "AUD-RCA-3.5": ["rca", "trs35"],
  "AUD-XLR-TRS-BAL": ["xlr-f", "trs635"], "AUD-PA-PASSIVE": ["speaker635", "speaker635"], "AUD-HEADPHONE": ["trs635", "trs635"],
  "STG-MULTICORE": ["multicore", "multicore"], "STG-DANTE-CAT": ["ethernet", "ethernet"],
  "DATA-USB-WEBCAM": ["usbc", "usba3"], "DATA-USB-MAGEWELL": ["usba3", "usba3"], "DATA-USB-C-C": ["usbc", "usbc"], "DATA-USB-A-A": ["usba", "usba"], "DATA-USB-B": ["box", "usba"],
  "NET-CAT5E6-ENCODER": ["ethernet", "ethernet"], "NET-ROUTER-UPLINK": ["ethernet", "ethernet"], "NET-POE-PTZ": ["ethernet", "ethernet"],
  "CTRL-REPLAY": ["box", "box"], "CTRL-TALLY": ["box", "box"], "CTRL-INTERCOM": ["xlr-f", "xlr-m"], "CTRL-REFERENCE": ["sdi", "sdi"], "CTRL-TIMECODE": ["sdi", "xlr-m"],
};

/** Generic multi-pin / D-sub style head for connectors without a dedicated plug mesh (training placeholder). */
function BoxPlug({ big = false, color }: { big?: boolean; color: string }) {
  const [w, h, d] = big ? [0.22, 0.12, 0.2] : [0.1, 0.05, 0.12];
  return <group>
    <mesh position={[0, 0, d / 2 - 0.02]}><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#1a1c20" roughness={0.6} /></mesh>
    <mesh position={[0, 0, -0.03]}><boxGeometry args={[w * 0.8, h * 0.7, 0.04]} /><meshStandardMaterial color="#b9bcc2" metalness={0.85} roughness={0.3} /></mesh>
    <mesh position={[0, h / 2 + 0.001, d / 2 - 0.02]}><boxGeometry args={[w * 0.6, 0.004, d * 0.5]} /><meshStandardMaterial color={color} /></mesh>
  </group>;
}

function Head({ end, color, scale = 1 }: { end: End; color: string; scale?: number }) {
  return <group scale={scale * 1.6}>
    {end === "box" ? <BoxPlug color={color} /> : end === "multicore" ? <BoxPlug big color={color} /> : <PlugMesh style={end} accent={color} />}
  </group>;
}

function PlaceholderCable({ cable }: { cable: CatalogCable }) {
  const [a, b, scaleA] = ENDS[cable.id] ?? ["box", "box"];
  const thick = cable.family === "multicore" ? 0.03 : cable.family === "fiber" ? 0.009 : 0.016;
  // A loose coil between the two heads so both connectors face the viewer.
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(-0.42, 0, 0.12), new Vector3(-0.3, -0.06, 0.28), new Vector3(-0.05, -0.12, 0.34), new Vector3(0.2, -0.08, 0.22),
    new Vector3(0.12, -0.02, 0.04), new Vector3(-0.08, -0.06, 0.12), new Vector3(0.1, -0.1, 0.3), new Vector3(0.3, -0.06, 0.28), new Vector3(0.42, 0, 0.12),
  ]), []);
  return <group>
    <mesh><tubeGeometry args={[curve, 96, thick, 10, false]} /><meshStandardMaterial color={cable.family === "fiber" ? "#f2c230" : "#16181c"} roughness={0.55} /></mesh>
    {/* plug A: tip points away to the left, plug B to the right; boots carry the catalog colour band */}
    <group position={[-0.42, 0, 0.12]} rotation={[0, Math.PI / 2, 0]}><Head end={a} color={cable.color} scale={scaleA ?? 1} /></group>
    <group position={[0.42, 0, 0.12]} rotation={[0, -Math.PI / 2, 0]}><Head end={b} color={cable.color} /></group>
  </group>;
}

function GlbCable({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const copy = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={copy} />;
}

export function CableModel({ cable }: { cable: CatalogCable }) {
  const file = CABLE_MODEL_FILES[cable.id];
  return file ? <Suspense fallback={<PlaceholderCable cable={cable} />}><GlbCable url={file} /></Suspense> : <PlaceholderCable cable={cable} />;
}

/** Two glowing "spirit" ribbons spiralling around the cable (lobby styling, not part of the cable). */
function SpiritGlow() {
  const ref = useRef<Group>(null);
  const curves = useMemo(() => [0, Math.PI].map((phase) => new CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => {
    const t = i / 39, a = phase + t * Math.PI * 3.2, r = 0.16 + 0.07 * Math.sin(t * Math.PI);
    return new Vector3(-0.55 + t * 1.1, Math.sin(a) * r - 0.04, Math.cos(a) * r + 0.16);
  }))), []);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.x += dt * 0.6; });
  return <group ref={ref} position={[0, -0.04, 0.16]}>
    <group position={[0, 0.04, -0.16]}>
      {curves.map((c, i) => <mesh key={i}>
        <tubeGeometry args={[c, 120, i ? 0.006 : 0.01, 6, false]} />
        <meshBasicMaterial color={i ? "#9b6bff" : "#4fe3ff"} transparent opacity={0.75} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>)}
    </group>
  </group>;
}

function Stage({ cable, auto, margin = 1.2 }: { cable: CatalogCable; auto: boolean; margin?: number }) {
  return <>
    <hemisphereLight args={["#eef2ff", "#2b2733", 1.5]} />
    <directionalLight position={[2, 3, 2]} intensity={2.2} />
    <directionalLight position={[-2, 1.5, -1]} intensity={0.9} />
    <pointLight position={[0, 0.2, 0.6]} intensity={1.2} distance={3} color="#4fe3ff" />
    <Bounds fit clip observe margin={margin}><Center><CableModel key={cable.id} cable={cable} /></Center></Bounds>
    {auto && <SpiritGlow />}
    <OrbitControls makeDefault enableDamping autoRotate={auto} autoRotateSpeed={1.6} minDistance={0.2} maxDistance={6} />
  </>;
}

/** Small turning preview in the lobby detail panel. */
export function CablePreview({ cable }: { cable: CatalogCable }) {
  return <div className="cl-preview">
    <Canvas camera={{ fov: 35, position: [0.2, 0.35, 1.3] }} dpr={[1, 1.25]}><Stage cable={cable} auto margin={0.95} /></Canvas>
  </div>;
}

/** Full-screen cable viewer (hold E 1 s or the 3D button): drag to rotate, wheel to zoom, ESC closes. */
export function CableInspector({ cable, onClose }: { cable: CatalogCable; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="inspector-overlay cl-inspector" role="dialog" aria-modal="true" aria-labelledby="cable-inspector-title">
    <div className="inspector-stage">
      <Canvas camera={{ fov: 35, position: [0.6, 0.45, 1.3] }} dpr={[1, 1.5]}>
        <color attach="background" args={["#10151f"]} />
        <Stage cable={cable} auto={false} />
      </Canvas>
      <p className="inspector-hint">ลากเพื่อหมุน · เลื่อนล้อเมาส์เพื่อซูม · ESC ปิด</p>
    </div>
    <aside className="inspector-panel glass-card">
      <button type="button" className="inspector-close" onClick={onClose} aria-label="ปิดหน้าดูสาย">✕</button>
      <span className="inspector-role">สาย / หัวต่อ · {cable.status}</span>
      <h2 id="cable-inspector-title">{cable.name}</h2>
      <strong className="inspector-model">{cable.id}</strong>
      <h3>หัวต่อ</h3><p>{cable.ends}</p>
      <h3>ใช้ต่อ</h3><p className="inspector-flow">{cable.use}</p>
      <h3>ควรรู้</h3><p>{cable.note}</p>
      <p className="inspector-unverified">{CABLE_MODEL_FILES[cable.id] ? "โมเดล 3D จากไฟล์ปั้น" : "โมเดล 3D ชั่วคราว (รอปั้นโมเดลจริง) — หัวต่อเป็นรูปทรงฝึก ไม่ใช่สัดส่วนสินค้าจริง"}</p>
    </aside>
  </div>;
}

/** Slow-turning cable for one catalog card (rendered through the shared catalog canvas via drei <View>). */
function CardTurn({ cable }: { cable: CatalogCable }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.45; });
  return <group ref={ref} rotation={[0.25, -0.5, 0]}><Center><CableModel cable={cable} /></Center><SpiritGlow /></group>;
}

export function CardCableScene({ cable }: { cable: CatalogCable }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0.18, 1.55]} fov={34} />
    <hemisphereLight args={["#eef2ff", "#22203a", 1.4]} />
    <directionalLight position={[1.5, 2, 2]} intensity={2} />
    <pointLight position={[0, 0.1, 0.7]} intensity={1.4} distance={3} color={cable.color} />
    <CardTurn cable={cable} />
  </>;
}

/**
 * One WebGL canvas for every catalog card: each card holds a drei <View> slot and this canvas draws the cables into
 * those slots. drei's offscreen test assumes the canvas starts at the viewport top, so the canvas covers the whole
 * viewport (position: fixed) and `.cl-catalog-wrap` clips it to the card grid; pointer events pass through.
 */
export function CatalogCanvas() {
  return <Canvas className="cl-catalog-gl" dpr={[1, 1.25]} gl={{ alpha: true, antialias: true }} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none" }}>
    <View.Port />
  </Canvas>;
}

export { View as CableView };
