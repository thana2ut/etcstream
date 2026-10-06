"use client";

import { useMemo } from "react";
import { CylinderGeometry, DoubleSide } from "three";
import { VenueLighting, Ball, BLACK_METAL, Bounds, CHROME, Cyl, D, g, Instanced, Lathe, merge, place, RB, Slab, STEEL, Tube, W, WorkFurniture, type Placement, type V3 } from "./kit";
import { tex } from "./textures";

/** TV production studio: black box with a green cyclorama, pipe lighting grid, pedestal cameras, jib and a gallery window. */
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

/** Studio camera on a pneumatic pedestal with teleprompter. */
function PedestalCamera({ p, ry = 0, tally = false }: { p: V3; ry?: number; tally?: boolean }) {
  return <group position={p} rotation={[0, ry, 0]}>
    <Lathe p={[0, 0, 0]} prof={[[0, 0.08], [0.42, 0.08], [0.46, 0.12], [0.46, 0.2], [0.3, 0.24], [0, 0.24]]} c="#2b2e34" m={0.5} r={0.4} />
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return <group key={k} position={[Math.cos(a) * 0.4, 0.05, Math.sin(a) * 0.4]}>
      <RB p={[0, 0.03, 0]} s={[0.1, 0.05, 0.12]} rad={0.012} {...BLACK_METAL} />
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.05, 16]} /><meshStandardMaterial color="#121212" roughness={0.9} /></mesh>
    </group>; })}
    <Cyl p={[0, 0.65, 0]} rt={0.09} rb={0.12} h={0.85} {...STEEL} />
    <Cyl p={[0, 1.0, 0]} rt={0.065} h={0.3} {...CHROME} />
    <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.36, 0.022, 10, 40]} /><meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.25} /></mesh>
    {[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2 + 0.5; return <Tube key={k} pts={[[0, 0.95, 0], [Math.cos(a) * 0.36, 0.95, Math.sin(a) * 0.36]]} r={0.012} {...CHROME} />; })}
    <RB p={[0, 1.2, 0]} s={[0.3, 0.12, 0.34]} rad={0.03} {...BLACK_METAL} />
    {/* camera body + lens + viewfinder */}
    <RB p={[0, 1.42, 0.08]} s={[0.26, 0.3, 0.5]} rad={0.04} c="#3a3d44" m={0.3} r={0.45} />
    <RB p={[0, 1.42, -0.3]} s={[0.24, 0.24, 0.36]} rad={0.04} c="#ececec" r={0.35} />
    <Cyl p={[0, 1.42, -0.52]} rot={[Math.PI / 2, 0, 0]} rt={0.1} h={0.1} {...BLACK_METAL} />
    <RB p={[0, 1.72, 0.12]} s={[0.3, 0.2, 0.22]} rad={0.03} {...BLACK_METAL} />
    <RB p={[0, 1.72, 0.235]} s={[0.24, 0.15, 0.01]} rad={0.004} c="#1a2a44" e="#4a7ac0" ei={0.8} />
    {/* teleprompter: hood + angled glass + monitor */}
    <RB p={[0, 1.42, -0.76]} s={[0.56, 0.46, 0.42]} rad={0.03} c="#16181c" r={0.8} />
    <Slab p={[0, 1.42, -0.98]} rot={[0.78, 0, 0]} s={[0.5, 0.56, 0.006]} c="#7da6c8" m={0.2} r={0.05} transparent opacity={0.35} />
    <RB p={[0, 1.17, -0.95]} s={[0.5, 0.04, 0.38]} rad={0.012} c="#0d0e10" />
    {[-1, 1].map((s) => <Tube key={s} pts={[[s * 0.15, 1.3, 0.3], [s * 0.3, 1.25, 0.6], [s * 0.32, 1.22, 0.72]]} r={0.018} {...STEEL} />)}
    <Ball p={[0.14, 1.62, -0.25]} r={0.018} c={tally ? "#ff2020" : "#331111"} e={tally ? "#ff2020" : "#000"} ei={tally ? 3 : 0} />
    <Tube pts={[[0, 0.3, 0.2], [0, 0.04, 0.45], [0.3, 0.02, 1.4], [0.2, 0.02, 3]]} r={0.014} c="#111" />
  </group>;
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

function Stanchions({ from, to, n }: { from: V3; to: V3; n: number }) {
  const posts = Array.from({ length: n }, (_, i): V3 => [from[0] + ((to[0] - from[0]) * i) / (n - 1), 0, from[2] + ((to[2] - from[2]) * i) / (n - 1)]);
  return <>
    {posts.map((q, i) => <group key={i} position={q}>
      <Lathe p={[0, 0, 0]} prof={[[0, 0], [0.16, 0], [0.17, 0.02], [0.06, 0.05], [0.025, 0.07], [0.025, 0.95], [0.035, 0.97], [0, 0.99]]} {...CHROME} />
    </group>)}
    {posts.slice(1).map((q, i) => { const a = posts[i]; return <Tube key={`b${i}`} pts={[[a[0], 0.92, a[2]], [(a[0] + q[0]) / 2, 0.82, (a[2] + q[2]) / 2], [q[0], 0.92, q[2]]]} r={0.02} c="#151515" />; })}
  </>;
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
    <spotLight position={[0, h - 1.2, -3]} target-position={[0, 0, -4.4]} angle={0.9} penumbra={0.8} intensity={30} distance={10} color="#f2fff2" />
    <pointLight position={[0, 3, 6]} intensity={5} distance={12} color="#cdd8ff" />
    {/* dimmed house lights over the camera floor behind the set */}
    {[-4, 0, 4].map((x) => <group key={x}>
      <pointLight position={[x, h - 1.0, 6.8]} intensity={7} distance={9} color="#ffe2b8" />
      <RB p={[x, h - 0.95, 6.8]} s={[0.9, 0.06, 0.3]} rad={0.02} c="#fff2dc" e="#ffdca0" ei={1.2} />
    </group>)}
    {/* work light over both side tables so plugs and cables read clearly */}
    {[-4.9, 4.9].map((x) => <spotLight key={x} position={[x * 0.85, h - 1.2, -0.2]} target-position={[x, 0.78, -0.2]} angle={0.75} penumbra={0.8} intensity={28} distance={9} color="#fff6ea" />)}

    {/* floor: sealed concrete with gaffer-tape marks */}
    <Slab p={[(x0 + x1) / 2, -0.05, (z0 + z1) / 2]} s={[x1 - x0, 0.1, z1 - z0]} map={floorTex} c="#ffffff" r={0.28} m={0.1} />
    {[[-2.6, 2.6], [0.4, 3.0], [2.4, 2.4]].map(([x, z], i) => <group key={i}>
      <Slab p={[x, 0.002, z]} s={[0.3, 0.004, 0.05]} c="#f2c230" />
      <Slab p={[x, 0.002, z]} s={[0.05, 0.004, 0.3]} c="#f2c230" />
    </group>)}
    <Slab p={[0, 0.002, D / 2 - 0.15]} s={[W - 0.4, 0.004, 0.05]} c="#ffffff" />

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

    {/* cameras behind the floor line, a jib to the left, stanchions marking the working area */}
    <PedestalCamera p={[-2.2, 0, 6.2]} ry={0.25} tally />
    <PedestalCamera p={[1.2, 0, 6.6]} ry={-0.05} />
    <PedestalCamera p={[4.4, 0, 5.8]} ry={-0.45} />
    <Jib p={[-5.2, 0, 8.6]} ry={Math.PI / 2 + 0.45} />
    <Stanchions from={[-W / 2 + 0.1, 0, D / 2 + 0.15]} to={[W / 2 - 0.1, 0, D / 2 + 0.15]} n={9} />
    <Stanchions from={[W / 2 + 0.15, 0, -D / 2 + 1]} to={[W / 2 + 0.15, 0, D / 2 + 0.15]} n={6} />
    <Stanchions from={[-W / 2 - 0.15, 0, -D / 2 + 1]} to={[-W / 2 - 0.15, 0, D / 2 + 0.15]} n={6} />
    {/* cable snakes and a coiled cable on the floor */}
    {[[-2.2, 6.2, -1.5, 9.2], [1.2, 6.6, 3.5, 9.2]].map(([a, b, c, d], i) => <Tube key={i} pts={[[a, 0.02, b], [(a + c) / 2 + 0.4, 0.02, (b + d) / 2], [c, 0.02, d]]} r={0.018} c="#101010" />)}
    <mesh position={[6.6, 0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.32, 0.03, 8, 32]} /><meshStandardMaterial color="#111" roughness={0.7} /></mesh>
    <RB p={[7.4, 0.35, -1.6]} s={[0.6, 0.7, 0.6]} rad={0.04} map={tex.fabric("#202124", [2, 2])} c="#ffffff" r={0.85} />

    <WorkFurniture style={{ top: "#6a5a4a", edge: "#1a1c20", frame: { ...BLACK_METAL }, round: "anchor", sides: "racks", led: "#3a7bff" }} />
    <Bounds />
  </>;
}
