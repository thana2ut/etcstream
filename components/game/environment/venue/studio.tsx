"use client";

import { useMemo } from "react";
import { CylinderGeometry, DoubleSide } from "three";
import { VenueLighting, BLACK_METAL, CHROME, Cyl, D, g, Instanced, merge, place, RB, Slab, STEEL, Tube, type Placement, type V3 } from "./kit";
import { LAYOUTS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";
import { tex } from "./textures";

/**
 * Mission Hall S venue (layout `studioMission`): enlarged TV studio — black box, green cyclorama, pipe lighting grid, jib,
 * gallery window. Mission-only: the free-practice Studio Room 01 (studio-room-01.tsx / GLB) is a separate scene and is untouched.
 */
const ROOM = { x0: -8.6, x1: 8.6, z0: -D / 2 - 0.05, z1: 9.5, h: 6.4 };
const THAI = "'Sarabun','Leelawadee UI','Tahoma',sans-serif";

function multiview(i: number) {
  return tex.sign(`mv${i}`, 320, 180, (c, w, h) => {
    const hues = ["#244a7a", "#2f6b3a", "#6b2f2f", "#5a4a20", "#2b2b55", "#204f55", "#553366", "#3d3d3d", "#1f3f6a"];
    const grd = c.createLinearGradient(0, 0, w, h); grd.addColorStop(0, hues[i % hues.length]); grd.addColorStop(1, "#0a0c10");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.arc(w * 0.5, h * 0.55, 34, 0, 7); c.fill(); c.fillRect(w * 0.5 - 50, h * 0.72, 100, 60);
    c.fillStyle = i === 0 ? "#e33" : i === 1 ? "#2c2" : "#000"; c.fillRect(0, h - 26, w, 26);
    c.fillStyle = "#fff"; c.font = "bold 18px sans-serif"; c.fillText(i === 0 ? "PGM" : i === 1 ? "PVW" : `CAM ${i - 1}`, 10, h - 8);
    c.strokeStyle = i < 2 ? (i ? "#2c2" : "#e33") : "#666"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4);
  });
}
function onAirSign() {
  return tex.sign("on-air", 256, 96, (c, w, h) => {
    c.fillStyle = "#c40f12"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#fff"; c.font = `bold 54px ${THAI}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("ON AIR", w / 2, h / 2 + 2);
  });
}
function studioSign() {
  return tex.sign("studio-a", 512, 128, (c, w, h) => {
    c.fillStyle = "#111318"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#e9edf5"; c.font = `bold 60px ${THAI}`; c.textBaseline = "middle"; c.fillText("STUDIO A", 24, h / 2);
    c.fillStyle = "#3a7bff"; c.fillRect(330, 40, 160, 48);
    c.fillStyle = "#fff"; c.font = `bold 30px ${THAI}`; c.fillText("สตูดิโอ 1", 350, h / 2 + 2);
  });
}

/** Fresnel / profile fixture hung from the grid. */
function useFresnels() {
  return useMemo(() => {
    const body = merge([
      place(g.lathe([[0, -0.2], [0.13, -0.2], [0.15, -0.12], [0.15, 0.14], [0.12, 0.2], [0, 0.2]], 20), [0, 0, 0], [Math.PI / 2 - 0.7, 0, 0]),
      place(g.tube([[-0.19, 0.16, 0], [-0.19, -0.05, 0], [0.19, -0.05, 0], [0.19, 0.16, 0]], 0.012), [0, 0, 0]),
      place(g.cyl(0.03, 0.03, 0.12, 10), [0, 0.22, 0]),
      ...[0, 1, 2, 3].map((k) => place(g.rbox([0.26, 0.004, 0.12], 0.002), [0, -Math.cos(0.7) * 0.2 - 0.05, Math.sin(0.7) * 0.2 + 0.02], [-0.7 + (k % 2 ? 0.6 : -0.6), (k * Math.PI) / 2, 0])),
    ]);
    const lens = place(g.cyl(0.12, 0.12, 0.01, 20), [0, -Math.cos(0.7) * 0.2, Math.sin(0.7) * 0.2], [Math.PI / 2 - 0.7, 0, 0]);
    return [{ geo: body, mat: { ...BLACK_METAL } }, { geo: lens, mat: { c: "#fff4dc", e: "#ffeac0", ei: 2.2 } }];
  }, []);
}

/** Jib crane with counterweights and remote head. */
function Jib({ p, ry = 0 }: { p: V3; ry?: number }) {
  return <group position={p} rotation={[0, ry, 0]}>
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <Tube key={k} pts={[[0, 1.4, 0], [Math.cos(a) * 0.9, 0.02, Math.sin(a) * 0.9]]} r={0.035} {...BLACK_METAL} />; })}
    <Cyl p={[0, 1.55, 0]} rt={0.09} h={0.3} {...BLACK_METAL} />
    <group position={[0, 1.75, 0]} rotation={[0, 0, 0.22]}>
      {[-0.06, 0.06].map((zz) => <Tube key={zz} pts={[[-1.4, 0, zz], [3.0, 0, zz]]} r={0.04} {...STEEL} />)}
      {Array.from({ length: 8 }, (_, k) => <Tube key={k} pts={[[-1.2 + k * 0.52, 0, -0.06], [-0.94 + k * 0.52, 0.0, 0.06]]} r={0.012} {...STEEL} />)}
      {[0, 1, 2].map((k) => <Cyl key={k} p={[-1.5 + k * 0.12, -0.16, 0]} rot={[Math.PI / 2, 0, 0]} rt={0.17} h={0.08} c="#1e1f22" m={0.6} />)}
      <group position={[3.05, -0.18, 0]} rotation={[0, 0, -0.22]}>
        <RB p={[0, 0, 0]} s={[0.22, 0.32, 0.26]} rad={0.03} {...BLACK_METAL} />
        <RB p={[0.1, -0.08, 0]} s={[0.3, 0.16, 0.14]} rad={0.03} c="#2d3036" />
        <Cyl p={[0.28, -0.08, 0]} rot={[0, 0, Math.PI / 2]} rt={0.05} h={0.08} c="#111" />
      </group>
    </group>
  </group>;
}

export function Studio() {
  const { x0, x1, z0, z1, h } = ROOM;
  const fresnels = useFresnels();
  const panelTex = tex.fabric("#1b1c20", [3, 2]);
  const floorTex = tex.paint("#3a3d42", [12, 10]);
  const cycTex = tex.paint("#2fb34a", [6, 3]);
  const cove = useMemo(() => new CylinderGeometry(0.9, 0.9, 9.2, 24, 1, true, Math.PI, Math.PI / 2), []);
  const gridAt = useMemo<Placement[]>(() => {
    const list: Placement[] = [];
    for (let x = -6; x <= 6; x += 2) for (const z of [-3, -1, 1.5, 4]) if ((x + z * 3) % 4 !== 0) list.push({ p: [x, h - 1.15, z], ry: z > 2 ? 0 : Math.PI });
    return list;
  }, [h]);
  return <>
    <color attach="background" args={["#0b0c0e"]} />
    <VenueLighting mood="studio" intensity={1.0} />
    <hemisphereLight args={["#b8c0d0", "#2a2a30", 0.7]} />
    <ambientLight intensity={0.09} />
    {/* key/fill from the grid onto the set */}
    <spotLight position={[-3, h - 1.2, 3.5]} target-position={[0, 0.8, -1]} angle={0.6} penumbra={0.5} intensity={60} distance={14} color="#fff2dc" castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.03} />
    <spotLight position={[3.5, h - 1.2, 3]} target-position={[0, 0.8, -1]} angle={0.65} penumbra={0.7} intensity={35} distance={14} color="#e8f0ff" />
    <pointLight position={[0, 3, 6]} intensity={5} distance={12} color="#cdd8ff" />
    {/* dimmed house lights over the camera floor behind the set */}
    {[-4, 0, 4].map((x) => <group key={x}>
      <pointLight position={[x, h - 1.0, 6.8]} intensity={7} distance={9} color="#ffe2b8" />
      <RB p={[x, h - 0.95, 6.8]} s={[0.9, 0.06, 0.3]} rad={0.02} c="#fff2dc" e="#ffdca0" ei={1.2} />
    </group>)}
    {/* work light over both side tables so plugs and cables read clearly */}

    {/* floor: sealed concrete with gaffer-tape marks */}
    <Slab p={[(x0 + x1) / 2, -0.05, (z0 + z1) / 2]} s={[x1 - x0, 0.1, z1 - z0]} map={floorTex} c="#ffffff" r={0.28} m={0.1} />
    {/* gaffer-tape marks at the three tripod positions of the mission layout */}
    {(["cam1", "cam2", "cam3"] as const).map((id) => { const [x, , z] = LAYOUTS.studioMission.places[id].p; return <group key={id}>
      <Slab p={[x, 0.002, z]} s={[0.4, 0.004, 0.05]} c="#f2c230" />
      <Slab p={[x, 0.002, z]} s={[0.05, 0.004, 0.4]} c="#f2c230" />
    </group>; })}

    {/* acoustic black walls (panelled) */}
    {([[x0, (z0 + z1) / 2, z1 - z0, 1], [x1, (z0 + z1) / 2, z1 - z0, 1], [(x0 + x1) / 2, z1, x1 - x0, 0]] as const).map(([x, z, len, side], i) => <group key={i}>
      <Slab p={[x, h / 2, z]} s={side ? [0.1, h, len] : [len, h, 0.1]} c="#141518" r={0.95} />
      {Array.from({ length: Math.floor(len / 1.25) }, (_, k) => Array.from({ length: 3 }, (_, r) => {
        const off = -len / 2 + 0.65 + k * 1.25, y = 1.0 + r * 1.3;
        return <RB key={`${k}${r}`} p={side ? [x - Math.sign(x) * 0.08, y, z + off] : [x + off, y, z - 0.08]} s={side ? [0.06, 1.2, 1.18] : [1.18, 1.2, 0.06]} rad={0.025} map={panelTex} c="#ffffff" r={0.98} />;
      }))}
    </group>)}
    <Slab p={[0, h + 0.05, (z0 + z1) / 2]} s={[x1 - x0, 0.1, z1 - z0]} c="#0d0e10" r={0.95} />

    {/* green cyclorama: wall + floor cove + floor sweep (behind the backdrop collider) */}
    <Slab p={[0, h / 2, z0]} s={[x1 - x0, h, 0.1]} c="#141518" r={0.95} />
    <Slab p={[0, 0.9 + (h - 1.4) / 2, z0 + 0.07]} s={[9.2, h - 1.4, 0.02]} map={cycTex} c="#ffffff" r={0.9} />
    <mesh geometry={cove} position={[0, 0.9, z0 + 0.98]} rotation={[0, 0, Math.PI / 2]} receiveShadow><meshStandardMaterial map={cycTex} side={DoubleSide} roughness={0.9} /></mesh>
    {[-1, 1].map((s) => <RB key={s} p={[s * 4.7, h / 2, z0 + 0.4]} s={[0.25, h, 0.8]} rad={0.04} c="#26282c" />)}

    {/* pipe lighting grid with fresnels, LED panels and hoist chains */}
    {Array.from({ length: 7 }, (_, i) => <Tube key={`gx${i}`} pts={[[x0 + 1, h - 0.9, -3.5 + i * 1.6], [x1 - 1, h - 0.9, -3.5 + i * 1.6]]} r={0.024} {...STEEL} />)}
    {Array.from({ length: 8 }, (_, i) => <Tube key={`gz${i}`} pts={[[-7 + i * 2, h - 0.85, -3.6], [-7 + i * 2, h - 0.85, 6.2]]} r={0.024} {...STEEL} />)}
    {[-6, 0, 6].flatMap((x) => [-3, 3].map((z) => <Tube key={`c${x}${z}`} pts={[[x, h, z], [x, h - 0.88, z]]} r={0.008} c="#555" m={0.8} />))}
    <Instanced parts={fresnels} at={gridAt} />
    {[-2.5, 2.5].map((x) => <group key={x} position={[x, h - 1.4, 2.6]} rotation={[0.7, 0, 0]}>
      <RB p={[0, 0, 0]} s={[1.0, 0.6, 0.08]} rad={0.03} {...BLACK_METAL} />
      <RB p={[0, 0, -0.045]} s={[0.92, 0.52, 0.01]} rad={0.004} c="#ffffff" e="#fff6e6" ei={1.6} />
      <Tube pts={[[0, 0.3, 0], [0, 0.55, 0.2]]} r={0.012} {...STEEL} />
    </group>)}
    {/* HVAC sock duct */}
    <Tube pts={[[x0 + 0.6, h - 0.35, -2], [x0 + 0.6, h - 0.35, 8.5]]} r={0.3} c="#2a2c31" m={0} />
    <Tube pts={[[x1 - 0.6, h - 0.35, -2], [x1 - 0.6, h - 0.35, 8.5]]} r={0.3} c="#2a2c31" m={0} />

    {/* production gallery window on the right wall + ON AIR light + entrance door */}
    <group position={[x1 - 0.06, 3.6, 4.6]}>
      <RB p={[0, 0, 0]} s={[0.12, 1.3, 4.2]} rad={0.04} c="#2b2e33" />
      <Slab p={[-0.065, 0, 0]} s={[0.01, 1.1, 4.0]} c="#0f2235" e="#2a5a8a" ei={0.6} m={0.4} r={0.05} />
      {[-1.3, 0, 1.3].map((dz) => <RB key={dz} p={[-0.075, -0.15, dz]} s={[0.01, 0.42, 1.0]} rad={0.004} c="#3a6aa0" e="#4a8ad0" ei={0.9} />)}
    </group>
    <group position={[x1 - 0.06, 0, 7.6]}>
      <RB p={[-0.02, 1.15, 0]} s={[0.1, 2.3, 1.5]} rad={0.03} c="#30333a" />
      {[-0.36, 0.36].map((dz) => <RB key={dz} p={[-0.07, 1.12, dz]} s={[0.04, 2.2, 0.7]} rad={0.015} c="#3c4048" m={0.4} r={0.4} />)}
      {[-0.06, 0.06].map((dz) => <Tube key={dz} pts={[[-0.1, 1.0, dz], [-0.16, 1.0, dz], [-0.16, 1.2, dz], [-0.1, 1.2, dz]]} r={0.012} {...CHROME} />)}
      <RB p={[-0.08, 2.55, 0]} s={[0.08, 0.3, 0.8]} rad={0.03} c="#1a1a1a" />
      <Slab p={[-0.125, 2.55, 0]} rot={[0, -Math.PI / 2, 0]} s={[0.72, 0.24, 0.005]} map={onAirSign()} c="#ffffff" e="#ff2020" ei={0.9} />
    </group>
    <Slab p={[(x0 + x1) / 2, h - 0.6, z1 - 0.07]} s={[3, 0.75, 0.02]} map={studioSign()} c="#ffffff" />

    {/* multiview monitor wall on the left */}
    <group position={[x0 + 0.12, 2.6, 3.4]} rotation={[0, Math.PI / 2, 0]}>
      <RB p={[0, 0, -0.02]} s={[4.3, 2.5, 0.08]} rad={0.03} {...BLACK_METAL} />
      {Array.from({ length: 9 }, (_, i) => <group key={i} position={[-1.4 + (i % 3) * 1.4, 0.8 - Math.floor(i / 3) * 0.8, 0.03]}>
        <RB p={[0, 0, 0]} s={[1.34, 0.76, 0.05]} rad={0.012} c="#0a0a0c" />
        <mesh position={[0, 0, 0.027]}><planeGeometry args={[1.28, 0.72]} /><meshBasicMaterial map={multiview(i)} toneMapped={false} /></mesh>
      </group>)}
    </group>

    {/* a jib parked in the back-left corner (scenery; the mission cameras are interactive devices) */}
    <Jib p={[-6.8, 0, 8.4]} ry={Math.PI / 2 + 0.45} />
    {/* cable snakes and a coiled cable on the floor */}
    <mesh position={[6.6, 0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.03, 8, 32]} /><meshStandardMaterial color="#111" roughness={0.7} /></mesh>
    <RB p={[7.4, 0.35, -1.6]} s={[0.6, 0.7, 0.6]} rad={0.04} map={tex.fabric("#202124", [2, 2])} c="#ffffff" r={0.85} />

    {/* floor cable tray from the camera marks to the production desk (route guide) */}
    <RB p={[0, 0.02, 1.9]} s={[6.4, 0.04, 0.22]} rad={0.015} c="#202226" />
    <RB p={[0, 0.02, 2.6]} s={[0.22, 0.04, 1.4]} rad={0.015} c="#202226" />
    <LayoutFurniture layout={LAYOUTS.studioMission} look={{ top: "#6a5a4a", frame: { ...BLACK_METAL } }} />
    <LayoutColliders layout={LAYOUTS.studioMission} />
  </>;
}
