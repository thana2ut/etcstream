"use client";

import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";

/** Generic GLB loader with a fallback box. */
export function GlbModel({ url, fallback }: { url: string; fallback: ReactNode }) {
  return <Boundary fallback={fallback}><Suspense fallback={fallback}><GlbAsset url={url} /></Suspense></Boundary>;
}

function GlbAsset({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((o) => { if (o instanceof Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    return copy;
  }, [scene]);
  return <primitive object={model} dispose={null} />;
}

/** Panasonic HC-X2000 on a fluid-head tripod (art/blender/build_hc_x2000.py). Origin = floor under the tripod; lens faces -Z. */
function Asset() {
  const { scene } = useGLTF("/models/equipment/hc-x2000.glb");
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((o) => { if (o instanceof Mesh) { o.castShadow = true; o.receiveShadow = true; } });
    return copy;
  }, [scene]);
  return <primitive object={model} dispose={null} />;
}

function Fallback() {
  return <mesh position={[0, 1.3, 0]}><boxGeometry args={[0.16, 0.16, 0.4]} /><meshStandardMaterial color="#1c2330" /></mesh>;
}

class Boundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? (this.props.fallback ?? <Fallback />) : this.props.children; }
}

export function Hcx2000Model() {
  return <Boundary><Suspense fallback={<Fallback />}><Asset /></Suspense></Boundary>;
}
