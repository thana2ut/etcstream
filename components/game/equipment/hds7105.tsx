"use client";

import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import { STUDIO } from "@/game/training/studio-room-layout";

/** DeviceWell HDS7105 GLB (real 236 × 105 × 47 mm). Origin = bottom centre, rear ports on local -Z. */
function Hds7105Asset() {
  const { scene } = useGLTF(STUDIO.switcherModel.url);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((object) => {
      if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; }
    });
    return copy;
  }, [scene]);
  return <primitive object={model} dispose={null} />;
}

function Hds7105Fallback() {
  return <mesh position={[0, 0.0235, 0]}><boxGeometry args={[0.236, 0.047, 0.105]} /><meshStandardMaterial color="#9b1a14" roughness={0.6} /></mesh>;
}

class Hds7105Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { if (process.env.NODE_ENV === "development") console.error("HDS7105 asset failed", error); }
  render() { return this.state.failed ? <Hds7105Fallback /> : this.props.children; }
}

/** Rendered at the display scale from the layout data so every port is readable in first person. */
export function Hds7105Model() {
  return <group scale={STUDIO.switcherModel.scale}>
    <Hds7105Boundary><Suspense fallback={<Hds7105Fallback />}><Hds7105Asset /></Suspense></Hds7105Boundary>
  </group>;
}
