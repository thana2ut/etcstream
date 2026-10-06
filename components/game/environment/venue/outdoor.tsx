"use client";

import { useMemo } from "react";
import { BackSide, BufferGeometry, DoubleSide, Float32BufferAttribute, IcosahedronGeometry } from "three";
import { VenueLighting, BLACK_METAL, CHROME, ConeGeo, Cyl, g, Instanced, Lathe, merge, place, RB, Slab, STEEL, Tube, type Placement, type V3, type XZ } from "./kit";
import { tex } from "./textures";
import { LAYOUTS } from "@/game/training/venue-layouts";
import { LayoutColliders, LayoutFurniture } from "./layout-furniture";

const THAI = "'Sarabun','Leelawadee UI','Tahoma',sans-serif";
const L = LAYOUTS.outdoor;
/** Control tent over the production desk (its legs are layout obstacles). */
const TENT = { x0: 1.9, x1: 6.1, z0: 6.6, z1: 10.9, eave: 2.6, peak: 3.5 };
const TENT_POLES: XZ[] = [[TENT.x0, TENT.z0], [TENT.x1, TENT.z0], [TENT.x0, TENT.z1], [TENT.x1, TENT.z1]];

function skyTexture() {
  return tex.sign("sky", 32, 512, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#3d7fd1"); grd.addColorStop(0.42, "#86bdf0"); grd.addColorStop(0.5, "#d6ebfb"); grd.addColorStop(1, "#d6ebfb");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
  });
}
function bannerTexture() {
  return tex.sign("outdoor-banner", 1024, 256, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, w, 0); grd.addColorStop(0, "#0f3c75"); grd.addColorStop(1, "#1d66b8");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffcc33"; c.fillRect(0, h - 24, w, 24);
    c.fillStyle = "#ffffff"; c.font = `bold 92px ${THAI}`; c.fillText("OPEN AIR LIVE", 40, 120);
    c.font = `40px ${THAI}`; c.fillText("งานกิจกรรมกลางแจ้ง · ระบบภาพและเสียงสนาม", 44, 190);
  });
}
function facadeSign() {
  return tex.sign("facade-sign", 1024, 160, (c, w, h) => {
    c.fillStyle = "#f4efe6"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#7a2a20"; c.font = `bold 80px ${THAI}`; c.textAlign = "center"; c.fillText("อาคารกิจกรรมนักศึกษา", w / 2, 108);
  });
}

/** Leafy tree: tapering trunk, a few limbs, jittered foliage clumps. */
function useTree() {
  return useMemo(() => {
    const trunk = merge([
      g.lathe([[0.26, 0], [0.2, 0.25], [0.16, 1.2], [0.13, 2.2], [0.09, 2.8], [0, 2.9]], 12),
      g.tube([[0, 1.8, 0], [0.5, 2.5, 0.2], [0.9, 3.0, 0.3]], 0.07, false, true),
      g.tube([[0, 2.1, 0], [-0.6, 2.7, -0.1], [-1.0, 3.2, -0.3]], 0.06, false, true),
      g.tube([[0, 2.4, 0], [0.1, 3.0, -0.6], [0.2, 3.4, -0.9]], 0.05, false, true),
    ]);
    const clump = (r: number, seed: number) => {
      const ico = new IcosahedronGeometry(r, 2);
      const pos = ico.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const n = 1 + 0.18 * Math.sin(pos.getX(i) * 7 + seed) * Math.cos(pos.getZ(i) * 6 + seed * 2) + 0.08 * Math.sin(pos.getY(i) * 13);
        pos.setXYZ(i, pos.getX(i) * n, pos.getY(i) * n * 0.85, pos.getZ(i) * n);
      }
      ico.computeVertexNormals();
      return ico;
    };
    const leaves = merge([
      place(clump(1.3, 1), [0, 3.4, 0]), place(clump(0.95, 2), [0.95, 3.25, 0.3]), place(clump(0.9, 3), [-1.0, 3.4, -0.3]),
      place(clump(0.85, 4), [0.2, 4.1, -0.6]), place(clump(0.8, 5), [-0.3, 3.0, 0.8]),
    ]);
    const leaves2 = merge([place(clump(0.7, 6), [0.6, 4.0, 0.5]), place(clump(0.65, 7), [-0.7, 4.0, 0.4]), place(clump(0.6, 8), [0.2, 2.7, -0.9])]);
    return [
      { geo: trunk, mat: { map: tex.bark(), c: "#ffffff", r: 0.95 } },
      { geo: leaves, mat: { c: "#3f7a37", r: 0.85 } },
      { geo: leaves2, mat: { c: "#5a9a45", r: 0.85 } },
    ];
  }, []);
}

/** Steel crowd-control barrier: tube frame, vertical rods, flat feet. */
function useBarrier() {
  return useMemo(() => {
    const L = 1.85;
    const frame = merge([
      g.tube([[-L / 2, 0.12, 0], [-L / 2, 1.08, 0], [L / 2, 1.08, 0], [L / 2, 0.12, 0]], 0.019),
      g.tube([[-L / 2, 0.22, 0], [L / 2, 0.22, 0]], 0.014),
      ...Array.from({ length: 13 }, (_, i) => g.tube([[-L / 2 + 0.13 * (i + 1), 0.22, 0], [-L / 2 + 0.13 * (i + 1), 1.08, 0]], 0.007)),
    ]);
    const feet = merge([-1, 1].map((s) => place(g.rbox([0.06, 0.03, 0.62], 0.01), [s * (L / 2 - 0.05), 0.015, 0])));
    const legs = merge([-1, 1].flatMap((s) => [-1, 1].map((k) => g.tube([[s * L / 2, 0.14, 0], [s * (L / 2 - 0.05), 0.03, k * 0.28]], 0.011))));
    return [{ geo: frame, mat: { ...CHROME, c: "#cfd4da", r: 0.28 } }, { geo: feet, mat: { ...STEEL, c: "#6d737b" } }, { geo: legs, mat: { ...CHROME, c: "#cfd4da" } }];
  }, []);
}

function useCones() {
  return useMemo(() => [
    { geo: ConeGeo(), mat: { c: "#ff6a1a", r: 0.45 } },
    { geo: merge([place(g.cyl(0.115, 0.135, 0.09, 24, true), [0, 0.32, 0]), place(g.cyl(0.07, 0.085, 0.07, 24, true), [0, 0.53, 0])]), mat: { c: "#f4f4f4", r: 0.2, m: 0.3, side: DoubleSide } },
    { geo: place(g.rbox([0.38, 0.04, 0.38], 0.012), [0, 0.02, 0]), mat: { c: "#1b1b1b", r: 0.85 } },
  ], []);
}

/** Pop-up event canopy: square legs, scissor-truss eaves, pyramid roof with valance. */
function Canopy() {
  const { x0, x1, z0, z1, eave, peak } = TENT;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  /** Four-sided pyramid roof built from explicit triangles (eave corners → peak), so it always sits flush on the frame. */
  const roof = useMemo(() => {
    const c: V3[] = [[x0 - 0.05, eave, z0 - 0.05], [x1 + 0.05, eave, z0 - 0.05], [x1 + 0.05, eave, z1 + 0.05], [x0 - 0.05, eave, z1 + 0.05]];
    const top: V3 = [cx, peak, cz];
    const pos: number[] = [], uv: number[] = [];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; pos.push(...a, ...top, ...b); uv.push(0, 0, 0.5, 1, 1, 0); }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  }, [cx, cz, eave, peak, x0, x1, z0, z1]);
  const canvas = tex.fabric("#c9302c", [6, 6]);
  const white = tex.fabric("#f5f2ec", [6, 6]);
  const edges: [V3, V3][] = [[[x0, eave, z0], [x1, eave, z0]], [[x1, eave, z0], [x1, eave, z1]], [[x1, eave, z1], [x0, eave, z1]], [[x0, eave, z1], [x0, eave, z0]]];
  return <group>
    {/* translucent canvas: a little emissive so the underside reads as sunlit fabric, not a dark slab */}
    <mesh geometry={roof} castShadow receiveShadow><meshStandardMaterial map={white} side={DoubleSide} roughness={0.9} emissive="#fff6ea" emissiveIntensity={0.35} /></mesh>
    {/* straight valance band on all four eaves */}
    {[[cx, z0 - 0.06, x1 - x0 + 0.22, 0], [cx, z1 + 0.06, x1 - x0 + 0.22, 0], [x0 - 0.06, cz, z1 - z0 + 0.22, 1], [x1 + 0.06, cz, z1 - z0 + 0.22, 1]].map(([a, b, len, side], i) =>
      <RB key={i} p={[a, eave - 0.14, b]} s={side ? [0.012, 0.3, len] : [len, 0.3, 0.012]} rad={0.004} map={canvas} c="#ffffff" r={0.85} />)}
    {/* legs with foot plates, sandbags and height pins */}
    {TENT_POLES.map(([x, z]) => <group key={`${x}${z}`}>
      <RB p={[x, eave / 2, z]} s={[0.05, eave, 0.05]} rad={0.008} {...CHROME} c="#d9dce0" r={0.3} />
      <RB p={[x, 0.008, z]} s={[0.18, 0.016, 0.18]} rad={0.004} {...STEEL} />
      <RB p={[x + 0.16, 0.06, z]} s={[0.34, 0.12, 0.2]} rad={0.05} map={tex.fabric("#2d3a2c")} c="#ffffff" r={0.95} />
      <Cyl p={[x, 1.7, z + 0.03]} rt={0.006} h={0.06} rot={[Math.PI / 2, 0, 0]} c="#e23" />
    </group>)}
    {/* scissor truss under each eave */}
    {edges.map(([a, b], i) => {
      const n = 4;
      const pts: V3[][] = [];
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n;
        const p0: V3 = [a[0] + (b[0] - a[0]) * t0, eave, a[2] + (b[2] - a[2]) * t0];
        const p1: V3 = [a[0] + (b[0] - a[0]) * t1, eave, a[2] + (b[2] - a[2]) * t1];
        pts.push([p0, [p1[0], eave - 0.32, p1[2]]], [[p0[0], eave - 0.32, p0[2]], p1]);
      }
      return <group key={i}>
        <Tube pts={[a, b]} r={0.016} {...CHROME} c="#d9dce0" />
        {pts.map((seg, j) => <Tube key={j} pts={seg} r={0.01} {...CHROME} c="#d9dce0" />)}
      </group>;
    })}
    {/* roof rafters to the peak */}
    {TENT_POLES.map(([x, z]) => <Tube key={`r${x}${z}`} pts={[[x + Math.sign(cx - x) * 0.05, eave - 0.03, z + Math.sign(cz - z) * 0.05], [cx, peak - 0.1, cz]]} r={0.012} {...CHROME} c="#d9dce0" />)}
  </group>;
}

/** Building behind the site: rendered facade, framed windows with sills, entrance canopy, parapet. */
function Building() {
  const z = -17;
  const render = tex.render("#e2d8c6");
  const glass = { c: "#6d93b6", m: 0.6, r: 0.08 };
  return <group>
    <Slab p={[0, 4.2, z]} s={[30, 8.4, 2]} map={render} c="#ffffff" r={0.85} />
    <RB p={[0, 8.55, z + 0.95]} s={[30.4, 0.35, 0.3]} rad={0.04} c="#efe7d9" />
    {[2.75, 5.5].map((y) => <RB key={y} p={[0, y, z + 1.05]} s={[30, 0.12, 0.18]} rad={0.03} c="#efe7d9" />)}
    {Array.from({ length: 3 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
      const x = -12.5 + c * 2.5, y = 1.5 + r * 2.75;
      if (r === 0 && Math.abs(x) < 2) return null;
      return <group key={`${r}${c}`} position={[x, y, z + 1.01]}>
        <RB p={[0, 0, 0]} s={[1.5, 1.55, 0.08]} rad={0.02} c="#f4f1ec" />
        <Slab p={[0, 0, 0.03]} s={[1.32, 1.37, 0.02]} {...glass} />
        <RB p={[0, 0, 0.05]} s={[0.04, 1.37, 0.03]} rad={0.01} c="#f4f1ec" />
        <RB p={[0, -0.84, 0.08]} s={[1.6, 0.06, 0.16]} rad={0.015} c="#cfc6b6" />
        {(r + c) % 4 === 0 && <RB p={[0.4, -0.5, 0.3]} s={[0.7, 0.45, 0.35]} rad={0.04} c="#f0f0ee" />}
      </group>;
    }))}
    {/* entrance: glass doors, canopy, steps, sign */}
    <Slab p={[0, 1.25, z + 1.02]} s={[3.2, 2.5, 0.04]} {...glass} />
    {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => <RB key={x} p={[x, 1.25, z + 1.06]} s={[0.06, 2.5, 0.05]} rad={0.012} {...BLACK_METAL} />)}
    <RB p={[0, 2.75, z + 1.9]} s={[4.6, 0.16, 1.9]} rad={0.04} c="#efe7d9" />
    {[-2, 2].map((x) => <Cyl key={x} p={[x, 1.35, z + 2.7]} rt={0.1} h={2.7} c="#efe7d9" />)}
    {[0, 1, 2].map((i) => <RB key={i} p={[0, 0.07 + i * 0.14, z + 3.2 - i * 0.32]} s={[5 - i * 0.3, 0.14, 0.34]} rad={0.02} map={tex.concrete()} c="#ffffff" />)}
    <Slab p={[0, 7.1, z + 1.06]} s={[8, 1.2, 0.04]} map={facadeSign()} c="#ffffff" />
    {/* hedges along the base */}
    {[-1, 1].map((s) => <group key={s}>
      <RB p={[s * 9, 0.32, z + 1.6]} s={[10, 0.64, 0.8]} rad={0.12} c="#3d7434" r={0.95} />
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[s * (4.4 + i * 0.68), 0.62 + (i % 3) * 0.04, z + 1.6 + ((i * 7) % 3 - 1) * 0.12]} castShadow><icosahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color={i % 2 ? "#4a8a3e" : "#3f7a37"} roughness={0.95} flatShading /></mesh>)}
      <RB p={[s * 9, 0.05, z + 1.6]} s={[10.2, 0.1, 1.0]} rad={0.02} map={tex.concrete()} c="#ffffff" />
    </group>)}
  </group>;
}

/** Yellow/black cable protector ramp across the walkway. */
function CableRamp({ p, ry = 0, len = 1.8 }: { p: V3; ry?: number; len?: number }) {
  const hump = useMemo(() => place(g.cyl(0.25, 0.25, len, 24, false), [0, -0.2, 0], [0, 0, Math.PI / 2], [1, 1, 0.75]), [len]);
  return <group position={p} rotation={[0, ry, 0]}>
    <mesh geometry={hump} castShadow receiveShadow><meshStandardMaterial color="#1c1c1c" roughness={0.85} /></mesh>
    <RB p={[0, 0.052, 0]} s={[len, 0.008, 0.1]} rad={0.003} c="#f2c230" />
  </group>;
}

function LampPost({ p }: { p: V3 }) {
  return <group position={p}>
    <Lathe p={[0, 0, 0]} prof={[[0.16, 0], [0.16, 0.06], [0.09, 0.12], [0.07, 0.6], [0.05, 4.2], [0, 4.2]]} c="#2d3136" m={0.6} r={0.4} />
    <Tube pts={[[0, 4.1, 0], [0.25, 4.35, 0], [0.7, 4.4, 0]]} r={0.035} c="#2d3136" m={0.6} />
    <RB p={[0.78, 4.36, 0]} s={[0.42, 0.08, 0.2]} rad={0.03} c="#2d3136" m={0.6} />
    <Slab p={[0.78, 4.315, 0]} s={[0.36, 0.01, 0.15]} c="#fff" e="#fff4d8" ei={0.6} />
  </group>;
}

export function Outdoor() {
  const tree = useTree();
  const barrier = useBarrier();
  const cones = useCones();
  const banner = bannerTexture();
  const sky = skyTexture();
  const { minX, maxX, minZ, maxZ } = L.bounds;
  const barriers = useMemo<Placement[]>(() => {
    const list: Placement[] = [];
    // Crowd barriers on the site edge, panels sized to fit each run; the service entrance (rear-left) stays open.
    const run = (from: number, to: number, at: (c: number) => V3, ry = 0) => {
      const len = to - from, n = Math.ceil(len / 1.95), step = len / n;
      for (let i = 0; i < n; i++) list.push({ p: at(from + step * (i + 0.5)), ry, s: step / 1.95 });
    };
    run(minZ, maxZ, (c) => [minX - 0.2, 0, c], Math.PI / 2);
    run(minZ, maxZ, (c) => [maxX + 0.2, 0, c], Math.PI / 2);
    run(minX, maxX, (c) => [c, 0, minZ - 0.2]);
    run(-8.6, maxX, (c) => [c, 0, maxZ + 0.2]);
    return list;
  }, [minX, maxX, minZ, maxZ]);
  const trees = useMemo<Placement[]>(() => [[-15, -4, 1.2], [-16, 5, 1], [15, -3, 1.3], [16, 6, 1], [-8, 15, 1.1], [6, 15.5, 1.2], [0, 18, 1.4], [-18, 12, 1.3], [17, 13, 1.1], [-15, -14, 1.2], [14, -15, 1.3]].map(([x, z, s], i) => ({ p: [x, 0, z] as V3, s, ry: i * 1.3 })), []);
  const coneAt = useMemo<Placement[]>(() => [[-11.2, 11.0], [-9.0, 11.2], [-0.8, -6.2], [0.8, -6.2], [11.4, -9.4]].map(([x, z]) => ({ p: [x, 0, z] as V3 })), []);
  return <>
    <color attach="background" args={["#a9d2f3"]} />
    <VenueLighting mood="day" intensity={0.55} />
    <fog attach="fog" args={["#cfe4f5", 30, 85]} />
    <mesh scale={46}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial map={sky} side={BackSide} fog={false} /></mesh>
    {[[-20, 18, -30, 3], [14, 22, -32, 2.4], [30, 16, 10, 2.8], [-30, 20, 15, 2.2]].map(([x, y, z, s], i) => <group key={i} position={[x, y, z]} scale={s}>
      {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.8], [-1.0, -0.25, 0, 0.75], [0.4, 0.4, -0.2, 0.7]].map(([a, b, c, r], k) => <mesh key={k} position={[a, b, c]}><sphereGeometry args={[r, 14, 10]} /><meshStandardMaterial color="#ffffff" roughness={1} fog={false} /></mesh>)}
    </group>)}
    <hemisphereLight args={["#dff0ff", "#9a968a", 0.69]} />
    <directionalLight position={[8, 12, 6]} intensity={2.4} color="#fff2d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-normalBias={0.03} />

    {/* ground: lawn, paved plaza with kerb */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[120, 120]} /><meshStandardMaterial map={tex.grass([40, 40])} roughness={1} /></mesh>
    <Slab p={[(minX + maxX) / 2, -0.04, (minZ + maxZ) / 2]} s={[maxX - minX + 1.2, 0.1, maxZ - minZ + 1.2]} map={tex.paving([(maxX - minX) / 2, (maxZ - minZ) / 2])} c="#ffffff" r={0.92} />
    {/* service road at the entrance */}
    <Slab p={[-10.3, -0.035, 15]} s={[4, 0.1, 6]} map={tex.concrete([2, 3])} c="#ffffff" r={0.95} />

    <Canopy />
    <Building />
    <Instanced parts={tree} at={trees} />
    <Instanced parts={barrier} at={barriers} />
    <Instanced parts={cones} at={coneAt} />
    {[[minX - 1.5, -6], [maxX + 1.5, -6], [minX - 1.5, 6], [maxX + 1.5, 6]].map(([x, z]) => <LampPost key={`${x}${z}`} p={[x, 0, z]} />)}

    {/* banner on a truss frame (the backdrop collider) */}
    {/* stage truss + banner behind the stage (far end of the site) */}
    <group position={[0, 1.0, -10.05]}>
      {[-5.8, 5.8].map((x) => <group key={x}>
        {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Tube key={`${a}${b}`} pts={[[x + a * 0.15, 0.02, b * 0.15], [x + a * 0.15, 4.2, b * 0.15]]} r={0.022} {...CHROME} />))}
        {Array.from({ length: 14 }, (_, i) => <Tube key={i} pts={[[x - 0.15, 0.1 + i * 0.29, 0.15], [x + 0.15, 0.26 + i * 0.29, 0.15]]} r={0.009} {...CHROME} />)}
      </group>)}
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Tube key={`t${a}${b}`} pts={[[-6.0, 4.2 + a * 0.15, b * 0.15], [6.0, 4.2 + a * 0.15, b * 0.15]]} r={0.022} {...CHROME} />))}
      <Slab p={[0, 2.6, 0.03]} s={[11.2, 2.8, 0.01]} map={banner} c="#ffffff" r={0.8} />
      {/* PA stacks on the stage wings */}
      {[-1, 1].map((s) => <group key={s}>{[0, 1, 2].map((k) => <RB key={k} p={[s * 5.0, 0.3 + k * 0.62, 0.9]} s={[0.9, 0.6, 0.7]} rad={0.04} c="#141518" />)}</group>)}
    </group>

    {/* long cable runs follow the site edge; ramps where they cross walkways */}
    <RB p={[11.5, 0.025, 0.6]} s={[0.22, 0.05, 19.0]} rad={0.02} c="#24262b" />
    <RB p={[8.8, 0.025, 9.9]} s={[5.4, 0.05, 0.22]} rad={0.02} c="#24262b" />
    <CableRamp p={[0, 0, 3.0]} ry={0} len={3.2} />
    <CableRamp p={[11.5, 0, 4.4]} ry={Math.PI / 2} len={1.6} />
    {/* folding chairs and a cooler for the crew */}
    {[[2.6, 10.2, 0.4], [3.4, 10.3, -0.2]].map(([x, z, ry]) => <group key={x} position={[x, 0, z]} rotation={[0, ry, 0]}>
      <RB p={[0, 0.45, 0]} s={[0.42, 0.03, 0.4]} rad={0.012} c="#2c3e63" />
      <RB p={[0, 0.78, 0.2]} rot={[-0.15, 0, 0]} s={[0.42, 0.3, 0.025]} rad={0.012} c="#2c3e63" />
      {[-1, 1].map((s) => <group key={s}>
        <Tube pts={[[s * 0.2, 0, -0.2], [s * 0.2, 0.45, 0.05], [s * 0.2, 0.95, 0.24]]} r={0.011} {...STEEL} />
        <Tube pts={[[s * 0.2, 0, 0.22], [s * 0.2, 0.45, -0.1]]} r={0.011} {...STEEL} />
      </group>)}
    </group>)}
    <group position={[4.4, 0, 10.45]}>
      <RB p={[0, 0.2, 0]} s={[0.6, 0.38, 0.38]} rad={0.05} c="#e7473c" />
      <RB p={[0, 0.41, 0]} s={[0.62, 0.06, 0.4]} rad={0.03} c="#f4f4f4" />
      <Tube pts={[[-0.22, 0.44, 0], [-0.2, 0.52, 0], [0.2, 0.52, 0], [0.22, 0.44, 0]]} r={0.012} c="#f4f4f4" />
    </group>

    <LayoutFurniture layout={L} look={{ top: "#d9cdb6", frame: { ...STEEL, c: "#9aa0a6" }, caseColor: "#2b2f2a" }} />
    <LayoutColliders layout={L} />
  </>;
}
