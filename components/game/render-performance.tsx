"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Static scenery: thousands of meshes never move, so stop three.js from recomputing their matrices every frame.
 * Runs a few times after mount so async content (the studio GLB, textures) is frozen once it arrives.
 */
export function StaticScenery({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  const frame = useRef(0);
  useFrame(() => {
    const f = ++frame.current;
    if (f !== 2 && f !== 45 && f !== 150 && f !== 400) return;
    group.current?.traverse((o) => {
      if (!o.matrixAutoUpdate) return;
      o.updateMatrix();
      o.matrixAutoUpdate = false;
    });
    group.current?.updateMatrixWorld(true);
  });
  return <group ref={group}>{children}</group>;
}

/**
 * Shadows: the venue is static and only small items / cable ends move, so the shadow map is refreshed
 * every few frames instead of every frame (one fewer full scene pass most frames).
 */
export function ShadowThrottle({ every = 4 }: { every?: number }) {
  const get = useThree((s) => s.get);
  const frame = useRef(0);
  useEffect(() => {
    const { shadowMap } = get().gl;
    shadowMap.autoUpdate = false;
    shadowMap.needsUpdate = true;
    return () => { shadowMap.autoUpdate = true; };
  }, [get]);
  useFrame((state) => { if (++frame.current % every === 0) state.gl.shadowMap.needsUpdate = true; });
  return null;
}

/** Compile every material's shader up front (and again once late assets arrive) so nothing hitches on first sight. */
export function ShaderWarmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const run = () => { try { gl.compile(scene, camera); } catch { /* compile is an optimisation only */ } };
    const a = window.setTimeout(run, 50), b = window.setTimeout(run, 1500), c = window.setTimeout(run, 4000);
    return () => { window.clearTimeout(a); window.clearTimeout(b); window.clearTimeout(c); };
  }, [gl, scene, camera]);
  return null;
}
