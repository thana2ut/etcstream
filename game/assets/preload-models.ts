import { useGLTF } from "@react-three/drei";

/** Every GLB a mission room can show. Downloaded + parsed while the trainee is still in the cable-prep lobby,
 *  so entering the 3D room does not hitch on the first sight of each device. */
export const ROOM_MODEL_URLS = [
  "/models/environment/studio-room-01.glb",
  "/models/equipment/hc-x2000.glb",
  "/models/equipment/hds7105.glb",
  "/models/equipment/samsung-u8000f.glb",
  "/models/equipment/pmx402d.glb",
  "/models/equipment/yamaha-hs5.glb",
  "/models/equipment/magewell-capture.glb",
  "/models/equipment/sennheiser-xs1.glb",
  "/models/equipment/hp-laptop.glb",
  "/models/equipment/comica-wm100-plus-tx.glb",
  "/models/equipment/comica-wm100-plus-rx.glb",
] as const;

let started = false;
/** Idempotent: starts the downloads once per page session, during idle time. */
export function preloadRoomModels() {
  if (started || typeof window === "undefined") return;
  started = true;
  const run = () => ROOM_MODEL_URLS.forEach((url) => useGLTF.preload(url));
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 1500 }); else window.setTimeout(run, 300);
}
