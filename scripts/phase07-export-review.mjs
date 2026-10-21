// Export actual runtime part/socket geometry and the pure PlugMesh tree for offline DCC review.
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import ts from "typescript";
import { createElement } from "react";
import * as THREE from "three";
import { load, projectRoot } from "../tests/helpers/solver.mjs";
Module._extensions[".tsx"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const { MODEL_GEOMETRY } = load("../game/training/sim/model-geometry.ts");
const { SELECTED_PRODUCT_GEOMETRY } = load('../game/rendering/selected-product-geometry.ts');
const { socketSurfaces } = load("../game/rendering/socket-geometry.ts");
const { PlugMesh } = load("../components/game/cable-plugs.tsx");
const { CONTROL_KNOB, photoLoftGeometry, roundedHardwareBox } = load("../game/rendering/hardware-detail-geometry.ts");
const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
const q = (n, from = Z) => new THREE.Quaternion().setFromUnitVectors(from, new THREE.Vector3(...n).normalize());
const out = path.join(projectRoot, "art/qa/phase07"); fs.mkdirSync(out, { recursive: true });
const serialise = (g, color, finish = "plastic") => ({ color, finish, positions: Array.from(g.attributes.position.array), normals: g.attributes.normal ? Array.from(g.attributes.normal.array) : null, indices: g.index ? Array.from(g.index.array) : null });
export const geometryReviewAssets = [];
const assets=geometryReviewAssets;
for (const [id, geo] of Object.entries({...MODEL_GEOMETRY,...SELECTED_PRODUCT_GEOMETRY}).filter(([, g]) => g.parts)) {
  const meshes = [];
  for (const p of geo.parts) {
    let g;
    if (p.t === "box" || p.t === "tally") g = (p.round ? roundedHardwareBox(p.s).clone() : new THREE.BoxGeometry(...p.s)).translate(...p.p);
    if (p.t === "cyl") g = new THREE.CylinderGeometry(p.r, p.r, p.h, 20).applyQuaternion(q(p.n, Y)).translate(...p.p);
    if (p.t === "loft") g = photoLoftGeometry(p).clone();
    if (p.t === "lathe") g = new THREE.LatheGeometry(p.profile.map((v) => new THREE.Vector2(...v)), 32).applyQuaternion(q(p.n, Y)).translate(...p.p);
    if (p.t === "tube") g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.points.map((v) => new THREE.Vector3(...v))), 24, p.r, 6, false);
    if (p.t === "prism") {
      const shape = new THREE.Shape(); p.profile.forEach(([z, y], i) => i ? shape.lineTo(z, y) : shape.moveTo(z, y)); shape.closePath();
      g = new THREE.ExtrudeGeometry(shape, { depth: p.x[1] - p.x[0], bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(p.x[1], 0, 0);
    }
    if (p.t === "screen" || p.t === "key") {
      g = p.t==='key' ? roundedHardwareBox([...p.s,0.0022],Math.min(0.0007,p.s[0]*0.1,p.s[1]*0.1)).clone() : new THREE.BoxGeometry(...p.s,0.0008);
      g.translate(0,0,p.t==='key'?0.0011:0.0004).applyQuaternion(q(p.n)).translate(...p.p);
    }
    if (p.t === "knob") g = CONTROL_KNOB.clone().scale(p.r,p.r,p.r).applyQuaternion(q(p.n)).translate(...p.p);
    if (g) { meshes.push(serialise(g, p.t === "screen" ? "#173349" : p.c ?? "#343941", p.finish)); g.dispose(); }
    if (p.t === "pattern") for (const [x, y] of p.points) {
      const hole = new THREE.CylinderGeometry(p.r, p.r, 0.0003, 10); hole.rotateX(Math.PI / 2); hole.translate(x, y, 0); hole.applyQuaternion(q(p.n)); hole.translate(...p.p);
      meshes.push(serialise(hole, p.c)); hole.dispose();
    }
  }
  for (const p of [...Object.values(geo.ports), ...geo.inert].filter((p) => p.kind)) for (const s of socketSurfaces(p.kind)) {
    const g = s.geometry.clone().applyQuaternion(q(p.normal ?? [0, 0, -1])).translate(...p.at); meshes.push(serialise(g, s.color, "metal")); g.dispose();
  }
  assets.push({ id, meshes });
}

const geometryNames = { boxGeometry: "BoxGeometry", cylinderGeometry: "CylinderGeometry", sphereGeometry: "SphereGeometry", circleGeometry: "CircleGeometry", planeGeometry: "PlaneGeometry", torusGeometry: "TorusGeometry", capsuleGeometry: "CapsuleGeometry" };
export function flatten(element, parent = new THREE.Matrix4(), meshes = []) {
  if (!element || typeof element !== "object") return meshes;
  if (Array.isArray(element)) { element.forEach((e) => flatten(e, parent, meshes)); return meshes; }
  if (typeof element.type === "function") return flatten(element.type(element.props), parent, meshes);
  const p = element.props ?? {}, children = [p.children].flat(Infinity).filter(Boolean);
  if (typeof element.type === "symbol") { children.forEach((c) => flatten(c, parent, meshes)); return meshes; }
  const rot = p.quaternion ?? new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation ?? [0, 0, 0])));
  const scale = typeof p.scale === "number" ? [p.scale, p.scale, p.scale] : p.scale ?? [1, 1, 1];
  const matrix = parent.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(...(p.position ?? [0, 0, 0])), rot, new THREE.Vector3(...scale)));
  if (element.type === "mesh") {
    const geometryElement = children.find((c) => geometryNames[c.type]);
    const geometry = p.geometry?.clone() ?? (geometryElement ? new THREE[geometryNames[geometryElement.type]](...(geometryElement.props.args ?? [])) : null);
    let material = children.find((c) => typeof c.type === "function" || /Material$/.test(c.type));
    if (typeof material?.type === "function") material = material.type(material.props);
    if (geometry) { geometry.applyMatrix4(matrix); meshes.push(serialise(geometry, material?.props?.color ?? "#555b65", (material?.props?.metalness ?? 0) > 0.5 ? "metal" : "plastic")); geometry.dispose(); }
  } else children.forEach((c) => flatten(c, matrix, meshes));
  return meshes;
}
const styles = ["hdmi", "dp", "sdi", "xlr-m", "xlr-f", "trs35", "locking35", "trrs35", "ts635", "trs635", "speaker635", "speakon", "rca", "rca-pair", "usba", "usba3", "usbb", "usbc", "ethernet", "iec", "dc", "smpte", "optical", "lc-duplex", "multicore", "logical", "lav", "adapter35to635", "adapter635to35"];
for (const style of styles) assets.push({ id: `plug-${style}`, meshes: flatten(PlugMesh({ style })) });
// Evaluate only presentation hooks for the Mini Pro's separate renderer; use its actual source tree,
// not a second hand-copied model. Text/interaction hit meshes are intentionally excluded from DCC QA.
const miniFile=path.join(projectRoot,'components/game/equipment/atem-mini-pro.tsx');
const miniModule=new Module(miniFile);
miniModule.filename=miniFile; miniModule.paths=Module._nodeModulePaths(path.dirname(miniFile));
const miniRequire=miniModule.require.bind(miniModule);
miniModule.require=(name)=>{
  if(name==='react') return {useMemo:factory=>factory()};
  if(name==='@react-three/drei') return {RoundedBox:({args,radius,children,...props})=>createElement('mesh',{...props,geometry:roundedHardwareBox(args,radius)},children)};
  if(name.endsWith('/scene-text')) return {SceneText:()=>null};
  if(name.endsWith('/training-store')) return {useTrainingStore:selector=>selector({sim:{config:{}}})};
  if(name==='./hardware-model') return {PressTarget:()=>null,HardwareSocket:({kind,at,n})=>createElement('group',{position:at,quaternion:q(n)},socketSurfaces(kind).map(({color,geometry},i)=>createElement('mesh',{key:i,geometry},createElement('meshStandardMaterial',{color,metalness:.6}))))};
  return miniRequire(name);
};
miniModule._compile(ts.transpileModule(fs.readFileSync(miniFile,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,miniFile);
assets.push({id:'bmd-atem-mini-pro',meshes:flatten(miniModule.exports.AtemMiniProModel({deviceId:'sw'}))});
const file = path.join(out, "runtime-geometry-review.json");
fs.writeFileSync(file, JSON.stringify({ assets }));
console.log(JSON.stringify({ file, assets: assets.length, bytes: fs.statSync(file).size }));
