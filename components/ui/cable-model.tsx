"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, PerspectiveCamera, useGLTF, View } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import { PlugMesh } from "@/components/game/cable-plugs";
import type { CableDef, PlugStyle } from "@/game/training/scenarios";
import type { CatalogCable } from "@/game/content/cable-catalog";

/**
 * 3D model of one catalog cable for the cable-prep lobby.
 * Reference-driven procedural connector family + a representative coil. Shares heads with the playable room.
 * Unresolved optical/multicore endings stay generic. Optional authored GLBs can use the same viewer.
 */
export const CABLE_MODEL_FILES: Record<string, string> = {
  // "VID-HDMI-A-A": "/models/cables/vid-hdmi-a-a.glb",
};

type End = PlugStyle | "box";
/** Plug at each end (A, B), optional scale for the A end (Mini/Micro HDMI are smaller). */
const ENDS: Record<string, [End, End, number?]> = {
  "VID-HDMI-A-A": ["hdmi", "hdmi"], "VID-HDMI-C-A": ["hdmi", "hdmi", 0.72], "VID-HDMI-D-A": ["hdmi", "hdmi", 0.55],
  "VID-SDI-3G": ["sdi", "sdi"], "VID-SDI-6G-12G": ["sdi", "sdi"], "VID-DP-DP": ["dp", "dp"], "VID-HDMI-EXTENDER": ["ethernet", "ethernet"],
  "FIB-SDI-LINK": ["optical", "optical"], "FIB-CAMERA-CCU": ["smpte", "smpte"], "FIB-PATCH-LC-SC": ["optical", "optical"],
  "AUD-LAV-TX": ["lav", "trs35"], "AUD-XLR-MIC": ["xlr-f", "xlr-m"], "AUD-RX-MIXER-XLR": ["xlr-f", "xlr-m"], "AUD-RX-MIXER-3.5": ["trs35", "trs635"],
  "AUD-XLR-LINE-BAL": ["xlr-f", "xlr-m"], "AUD-PA-ACTIVE": ["xlr-f", "xlr-m"], "AUD-TRS-6.35-BAL": ["trs635", "trs635"], "AUD-TRS-635-35": ["trs635", "trs35"],
  "AUD-TRS-3.5": ["trs35", "trs35"], "AUD-TRRS-3.5": ["trrs35", "trrs35"], "AUD-TS-6.35": ["ts635", "ts635"], "AUD-RCA-LR": ["rca", "rca"], "AUD-RCA-3.5": ["rca-pair", "trs35"],
  "AUD-XLR-TRS-BAL": ["xlr-f", "trs635"], "AUD-XLR-35": ["xlr-f", "trs35"], "AUD-PA-PASSIVE": ["speakon", "speakon"], "AUD-HEADPHONE": ["trs635", "trs635"],
  "STG-MULTICORE": ["multicore", "multicore"], "STG-DANTE-CAT": ["ethernet", "ethernet"],
  "DATA-USB-WEBCAM": ["usbc", "usba3"], "DATA-USB-MAGEWELL": ["usba3", "usba3"], "DATA-USB-C-C": ["usbc", "usbc"], "DATA-USB-A-A": ["usba", "usba"], "DATA-USB-B": ["usbb", "usba"],
  "NET-CAT5E6-ENCODER": ["ethernet", "ethernet"], "NET-ROUTER-UPLINK": ["ethernet", "ethernet"], "NET-POE-PTZ": ["ethernet", "ethernet"],
  "CTRL-REPLAY": ["logical", "logical"], "CTRL-TALLY": ["box", "box"], "CTRL-INTERCOM": ["xlr-f", "xlr-m"], "CTRL-REFERENCE": ["sdi", "sdi"], "CTRL-TIMECODE": ["sdi", "xlr-m"],
  "ADAPTER-35-635": ["adapter35to635", "adapter35to635"], "ADAPTER-635-35": ["adapter635to35", "adapter635to35"],
};

/** Generic multi-pin / D-sub style head for connectors without a dedicated plug mesh (training placeholder). */
function BoxPlug({ color }: { color: string }) {
  const [w, h, d] = [0.1, 0.05, 0.12];
  return <group>
    <mesh position={[0, 0, d / 2 - 0.02]}><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#1a1c20" roughness={0.6} /></mesh>
    <mesh position={[0, 0, -0.03]}><boxGeometry args={[w * 0.8, h * 0.7, 0.04]} /><meshStandardMaterial color="#b9bcc2" metalness={0.85} roughness={0.3} /></mesh>
    <mesh position={[0, h / 2 + 0.001, d / 2 - 0.02]}><boxGeometry args={[w * 0.6, 0.004, d * 0.5]} /><meshStandardMaterial color={color} /></mesh>
  </group>;
}

function Head({ end, color, scale = 1 }: { end: End; color: string; scale?: number }) {
  return <group scale={scale * 0.8}>
    {end === "box" ? <BoxPlug color={color} /> : <PlugMesh style={end} accent={color} />}
  </group>;
}

function PlaceholderCable({ cable, definition }: { cable: CatalogCable; definition?: CableDef }) {
  const [a, b, scaleA] = definition?.plugs ?? ENDS[cable.id] ?? ["box", "box"];
  const logical = a === "logical";
  const thick = cable.family === "multicore" ? 0.03 : cable.family === "fiber" ? 0.009 : 0.016;
  // A balanced symmetrical coil between the two heads so both connectors face the viewer evenly.
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(-0.42, 0, 0.12),
    new Vector3(-0.30, -0.06, 0.28),
    new Vector3(-0.14, -0.10, 0.32),
    new Vector3(0.08, -0.08, 0.26),
    new Vector3(0.18, -0.02, 0.10),
    new Vector3(0.00, -0.05, 0.06),
    new Vector3(-0.18, -0.02, 0.10),
    new Vector3(-0.08, -0.08, 0.26),
    new Vector3(0.14, -0.10, 0.32),
    new Vector3(0.30, -0.06, 0.28),
    new Vector3(0.42, 0, 0.12),
  ]), []);
  // A rigid adapter is one object with a plug and a socket, never a duplicated head on a cable coil.
  if ((definition?.socketB && definition.plugs) || cable.id.startsWith("ADAPTER-")) return <group scale={0.9}><PlugMesh style={a as PlugStyle} /></group>;
  return <group>
    {/* CTRL-REPLAY is a logical control link: a faint translucent path, not a physical jacket. SMPTE hybrid uses a black jacket. */}
    <mesh><tubeGeometry args={[curve, 96, thick, 10, false]} />{logical
      ? <meshBasicMaterial color="#b98cff" transparent opacity={0.35} depthWrite={false} />
      : <meshStandardMaterial color={cable.family === "fiber" && a !== "smpte" ? "#f2c230" : "#16181c"} roughness={0.55} />}</mesh>
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

export function CableModel({ cable, definition }: { cable: CatalogCable; definition?: CableDef }) {
  const file = CABLE_MODEL_FILES[cable.id];
  return file && !definition ? <Suspense fallback={<PlaceholderCable cable={cable} />}><GlbCable url={file} /></Suspense> : <PlaceholderCable cable={cable} definition={definition} />;
}

function Stage({ cable, auto, margin = 1.2, definition }: { cable: CatalogCable; auto: boolean; margin?: number; definition?: CableDef }) {
  return <>
    <hemisphereLight args={["#eef2ff", "#2b2733", 1.5]} />
    <directionalLight position={[2, 3, 2]} intensity={2.2} />
    <directionalLight position={[-2, 1.5, -1]} intensity={0.9} />
    <pointLight position={[0, 0.2, 0.6]} intensity={1.2} distance={3} color="#4fe3ff" />
    <Bounds fit clip observe margin={margin}><Center><CableModel key={cable.id} cable={cable} definition={definition} /></Center></Bounds>
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
export function CableInspector({ cable, definition, onClose }: { cable: CatalogCable; definition?: CableDef; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="inspector-overlay cl-inspector" role="dialog" aria-modal="true" aria-labelledby="cable-inspector-title">
    <div className="inspector-stage">
      <Canvas camera={{ fov: 35, position: [0.6, 0.45, 1.3] }} dpr={[1, 1.5]}>
        <color attach="background" args={["#10151f"]} />
        <Stage cable={cable} auto={false} definition={definition} />
      </Canvas>
      <p className="inspector-hint">ลากเพื่อหมุน · เลื่อนล้อเมาส์เพื่อซูม · ESC ปิด</p>
    </div>
    <aside className="inspector-panel glass-card">
      <button type="button" className="inspector-close" onClick={onClose} aria-label="ปิดหน้าดูสาย">✕</button>
      <span className="inspector-role">{definition?.socketB ? "อะแดปเตอร์" : cable.id === "CTRL-REPLAY" ? "ลิงก์ควบคุมจำลอง" : "สาย / หัวต่อ"} · {cable.status}</span>
      <h2 id="cable-inspector-title">{cable.name}</h2>
      <strong className="inspector-model">{cable.id}</strong>
      <h3>หัวต่อ</h3><p>{cable.ends}</p>
      <h3>ใช้ต่อ</h3><p className="inspector-flow">{cable.use}</p>
      <h3>ควรรู้</h3><p>{cable.note}</p>
    </aside>
  </div>;
}

/** Cable for one catalog card (rendered through the shared catalog canvas via drei <View>). */
/** Catalog cards show the cable at a fixed three-quarter angle (both plugs visible, never edge-on); the detail
 *  preview and the full-screen inspector are where it turns. */
function CardTurn({ cable }: { cable: CatalogCable }) {
  const isAdapter = cable.id.startsWith("ADAPTER-");
  return (
    <Center precise>
      <group
        rotation={isAdapter ? [0.35, -0.65, 0.2] : [0.48, 0, 0]}
        scale={isAdapter ? 1.4 : 1}
      >
        <CableModel cable={cable} />
      </group>
    </Center>
  );
}

export function CardCableScene({ cable }: { cable: CatalogCable }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0, 1.55]} fov={34} />
    <hemisphereLight args={["#eef2ff", "#2a3050", 2.2]} />
    <directionalLight position={[1.5, 2, 2]} intensity={2.8} />
    <directionalLight position={[-1.5, 0.6, -1]} intensity={1.2} color="#9fd8ff" />
    <pointLight position={[0, 0.1, 0.7]} intensity={1.4} distance={3} color={cable.color} />
    <CardTurn cable={cable} />
  </>;
}

/**
 * One WebGL canvas for every catalog card: each card holds a drei <View> slot and this canvas draws the cables into
 * those slots. drei's offscreen test assumes the canvas starts at the viewport top, so the canvas covers the whole
 * viewport (position: fixed) and `.cl-catalog-wrap` clips it to the card grid; pointer events pass through.
 * Scroll is measured without debounce so packed-bag thumbnails stay locked to their slots while the page scrolls.
 */
export function CatalogCanvas() {
  return <Canvas className="cl-catalog-gl" dpr={1} resize={{ scroll: true, debounce: { scroll: 0, resize: 0 } }} camera={{ fov: 34, position: [0, 0, 1.55] }} gl={{ alpha: true, antialias: true }} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none" }}>
    <View.Port />
  </Canvas>;
}

/** Same model, connector mapping, camera and lighting for cards and packed items. */
export function CableThumbnail({ cable, className = "" }: { cable: CatalogCable; className?: string }) {
  return <View className={className} aria-hidden="true"><CardCableScene cable={cable} /></View>;
}

export { View as CableView };
