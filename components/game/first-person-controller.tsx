"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from "@react-three/rapier";
import { Euler, MathUtils, Mesh, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { useTrainingStore } from "@/game/stores/training-store";
import type { Point3, TrainingTarget } from "@/game/training/hdmi-training";
import { scenarioOf } from "@/game/training/hdmi-training";
import { TRAINING_INPUT_EVENT, type TrainingInputDetail } from "@/game/input/training-input";
import type { ReviewView } from "@/game/training/environment-review";

import { dropHeight, LAYOUTS, onSurface, type LayoutId, type VenueLayout } from "@/game/training/venue-layouts";

const BINDINGS = { forward: "KeyW", back: "KeyS", left: "KeyA", right: "KeyD", interact: "KeyE", drop: "KeyF" } as const;
const lookCenter = new Vector2(0, 0);
export const INSPECT_HOLD_MS = 2000;
const movement = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const dropDirection = new Vector3();
const targetPosition = new Vector3();
const raycaster = new Raycaster();
const look = new Euler();
raycaster.far = 2.65;

/** Where the player looks on the work-surface plane (free device placement); falls back to 0.9 m ahead. */
function dropPoint(camera: import("three").Camera, layout: VenueLayout): Point3 {
  camera.getWorldDirection(dropDirection);
  const work = layout.work, tableY = work.center[1];
  if (dropDirection.y < -0.05) {
    const t = (tableY - camera.position.y) / dropDirection.y;
    const hx = camera.position.x + dropDirection.x * t, hz = camera.position.z + dropDirection.z * t;
    if (t > 0 && t < 3.5 && onSurface(work, hx, hz, 0.2)) return [hx, tableY, hz];
  }
  dropDirection.y = 0;
  dropDirection.normalize().multiplyScalar(0.9);
  const { minX, maxX, minZ, maxZ } = layout.bounds;
  const x = MathUtils.clamp(camera.position.x + dropDirection.x, minX + 0.35, maxX - 0.35);
  const z = MathUtils.clamp(camera.position.z + dropDirection.z, minZ + 0.5, maxZ - 0.35);
  return [x, dropHeight(layout, x, z), z];
}

export function FirstPersonController({ active, fallbackLook, touch, onExitFallback, venue = "studio", reviewView, reviewTelemetry = false }: { active: boolean; fallbackLook: boolean; touch: boolean; onExitFallback: () => void; venue?: LayoutId; reviewView?: ReviewView; reviewTelemetry?: boolean }) {
  const { gl, camera, scene } = useThree();
  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const layout = LAYOUTS[venue];
  const angles = useRef({ yaw: layout.spawnYaw, pitch: -0.12 });
  const targets = useRef<Object3D[]>([]);
  const occluders = useRef<Mesh[]>([]);
  const frame = useRef(0);
  const telemetryFrame = useRef(0);
  const inspectTarget = useRef<TrainingTarget | null>(null);

  useEffect(() => {
    const element = gl.domElement;
    const pressedKeys = keys.current;
    const canControl = () => active && (touch || document.pointerLockElement === element || fallbackLook);
    const beginInteract = () => {
      const store = useTrainingStore.getState();
      const target = store.focusedTarget;
      if (!store.held && !store.heldItem && (target?.kind === "item" || target?.kind === "device")) {
        inspectTarget.current = target;
        store.setInspectHold(performance.now());
      }
      else store.interact();
    };
    const endInteract = () => {
      const store = useTrainingStore.getState();
      if (scenarioOf(store).stage && (!canControl() || store.inspecting || store.consoleOpen || JSON.stringify(inspectTarget.current) !== JSON.stringify(store.focusedTarget))) {
        store.setInspectHold(null);
        inspectTarget.current = null;
        return;
      }
      if (store.inspectHoldStart !== null) { store.setInspectHold(null); store.interact(); }
      inspectTarget.current = null;
    };
    const onMove = (event: MouseEvent) => {
      if (!active) return;
      const locked = document.pointerLockElement === element;
      if (!locked && !(fallbackLook && event.buttons === 1 && event.target === element)) return;
      angles.current.yaw -= event.movementX * 0.0018;
      angles.current.pitch = MathUtils.clamp(angles.current.pitch - event.movementY * 0.0018, -1.25, 1.25);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!canControl() || useTrainingStore.getState().inspecting || useTrainingStore.getState().consoleOpen) return;
      if (event.code === "Escape" && fallbackLook) { onExitFallback(); return; }
      if (Object.values(BINDINGS).includes(event.code as typeof BINDINGS[keyof typeof BINDINGS])) event.preventDefault();
      if ([BINDINGS.forward, BINDINGS.back, BINDINGS.left, BINDINGS.right].includes(event.code as typeof BINDINGS.forward)) keys.current.add(event.code);
      if (event.repeat) return;
      if (event.code === BINDINGS.interact) beginInteract();
      // T turns the held device 45° (R opens the bag, handled by the play page).
      if (event.code === "KeyT") useTrainingStore.getState().turnHeld();
      // 1 / 2: arm "take head only" / "take tail only" for the next E on a cable (press again to cancel).
      if (event.code === "Digit1" || event.code === "Numpad1") useTrainingStore.getState().setPickMode("a");
      if (event.code === "Digit2" || event.code === "Numpad2") useTrainingStore.getState().setPickMode("b");
      if (event.code === BINDINGS.drop) useTrainingStore.getState().drop(dropPoint(camera, layout), angles.current.yaw);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
      if (event.code !== BINDINGS.interact) return;
      endInteract();
    };
    const onTouchInput = (event: Event) => {
      if (!canControl() || useTrainingStore.getState().inspecting || useTrainingStore.getState().consoleOpen) return;
      const detail = (event as CustomEvent<TrainingInputDetail>).detail;
      if (detail.type === "move") {
        if (detail.pressed) keys.current.add(detail.code);
        else keys.current.delete(detail.code);
      }
      if (detail.type === "look") {
        angles.current.yaw -= detail.dx * 0.004;
        angles.current.pitch = MathUtils.clamp(angles.current.pitch - detail.dy * 0.004, -1.25, 1.25);
      }
      if (detail.type === "interact") {
        if (detail.pressed) beginInteract();
        else endInteract();
      }
      if (detail.type === "drop") useTrainingStore.getState().drop(dropPoint(camera, layout), angles.current.yaw);
      if (detail.type === "turn") useTrainingStore.getState().turnHeld();
    };
    const clear = () => { keys.current.clear(); useTrainingStore.getState().setInspectHold(null); useTrainingStore.getState().focus(null); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener(TRAINING_INPUT_EVENT, onTouchInput);
    document.addEventListener("pointerlockchange", clear);
    window.addEventListener("blur", clear);
    return () => {
      if (scenarioOf(useTrainingStore.getState()).stage) {
        pressedKeys.clear();
        inspectTarget.current = null;
        useTrainingStore.getState().setInspectHold(null);
        useTrainingStore.getState().focus(null);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener(TRAINING_INPUT_EVENT, onTouchInput);
      document.removeEventListener("pointerlockchange", clear);
      window.removeEventListener("blur", clear);
    };
  }, [active, camera, gl, fallbackLook, touch, onExitFallback, layout]);

  useBeforePhysicsStep(() => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const velocity = rigidBody.linvel();
    movement.set(0, 0, 0);
    const store = useTrainingStore.getState();
    const blocked = Boolean(scenarioOf(store).stage && (store.inspecting || store.consoleOpen));
    if (blocked) keys.current.clear();
    if (active && !blocked && (touch || document.pointerLockElement === gl.domElement || fallbackLook)) {
      const yaw = angles.current.yaw;
      forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
      right.set(Math.cos(yaw), 0, -Math.sin(yaw));
      if (keys.current.has(BINDINGS.forward)) movement.add(forward);
      if (keys.current.has(BINDINGS.back)) movement.sub(forward);
      if (keys.current.has(BINDINGS.right)) movement.add(right);
      if (keys.current.has(BINDINGS.left)) movement.sub(right);
      if (movement.lengthSq() > 0) movement.normalize().multiplyScalar(2.75);
    }
    rigidBody.setLinvel({ x: movement.x, y: velocity.y, z: movement.z }, true);
  });

  useFrame(() => {
    if (reviewTelemetry && ++telemetryFrame.current % 15 === 0) {
      const p = body.current?.translation();
      if (p) gl.domElement.setAttribute("data-review-player", JSON.stringify({ x: p.x, y: p.y, z: p.z, ...angles.current }));
    }
    if (reviewView) {
      camera.position.set(...reviewView.eye);
      camera.lookAt(...reviewView.target);
      if (++frame.current % 15 === 0) {
        const reviewTargets: Object3D[] = [];
        scene.traverse((object) => { if (object.userData.trainingTarget?.kind === "port") reviewTargets.push(object); });
        camera.updateMatrixWorld();
        raycaster.setFromCamera(lookCenter, camera);
        useTrainingStore.getState().focus((raycaster.intersectObjects(reviewTargets, false)[0]?.object.userData.trainingTarget as TrainingTarget | undefined) ?? null);
      }
      return;
    }
    const translation = body.current?.translation();
    if (translation) camera.position.set(translation.x, translation.y + 0.84, translation.z);
    camera.quaternion.setFromEuler(look.set(angles.current.pitch, angles.current.yaw, 0, "YXZ"));
    if (!active || (!touch && document.pointerLockElement !== gl.domElement && !fallbackLook)) return;
    const store = useTrainingStore.getState();
    if (scenarioOf(store).stage) {
      if (store.inspecting || store.consoleOpen) { keys.current.clear(); store.focus(null); return; }
      if (store.inspectHoldStart !== null && JSON.stringify(inspectTarget.current) !== JSON.stringify(store.focusedTarget)) {
        store.setInspectHold(null);
        inspectTarget.current = null;
      }
    }
    if (store.inspectHoldStart !== null && performance.now() - store.inspectHoldStart >= INSPECT_HOLD_MS) {
      const target = store.focusedTarget;
      const id = target?.kind === "item" ? target.itemId : target?.kind === "device" ? target.deviceId : null;
      store.setInspecting(id);
      if (document.pointerLockElement) document.exitPointerLock();
      return;
    }
    // Walking the whole scene graph is expensive in large venues: refresh the target list ~6×/s, raycast every frame.
    if (++frame.current % 10 === 1 || targets.current.length === 0) {
      targets.current = [];
      occluders.current = [];
      const mission = Boolean(scenarioOf(store).stage);
      scene.traverse((object) => {
        if (object.userData.trainingTarget) targets.current.push(object);
        else if (mission && object instanceof Mesh) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          if (materials.some((material) => material.visible && material.depthTest && material.opacity >= 0.95)) occluders.current.push(object);
        }
      });
    }
    raycaster.setFromCamera(lookCenter, camera);
    // Device hit volumes are coarse boxes that can enclose their own ports (e.g. the camera's HDMI OUT):
    // a port or cable end just behind a device box wins over the box itself.
    const hits = raycaster.intersectObjects(targets.current, false).filter((hit) => {
      if (!scenarioOf(store).stage) return true;
      const normal = hit.object.userData.serviceNormal as number[] | undefined;
      if (!normal) return true;
      hit.object.getWorldPosition(targetPosition);
      // A real panel is serviced from its outward face, never through the back of its casing.
      return (camera.position.x - targetPosition.x) * normal[0]
        + (camera.position.y - targetPosition.y) * normal[1]
        + (camera.position.z - targetPosition.z) * normal[2] >= -0.02;
    });
    const first = hits[0];
    const hit = first?.object.userData.trainingTarget?.kind === "device"
      ? hits.find((h) => h.distance - first.distance < 0.6 && h.object.userData.trainingTarget?.kind !== "device") ?? first
      : first;
    let blocked = false;
    if (hit && scenarioOf(store).stage) {
      // Raycast the rendered opaque geometry, not only invisible interaction volumes.
      // Stop before the target's surface so its own socket/plug does not block selection.
      raycaster.far = Math.max(0, hit.distance - 0.015);
      blocked = raycaster.intersectObjects(occluders.current, false).some((obstacle) => {
        let ancestor: Object3D | null = obstacle.object;
        while (ancestor) { if (!ancestor.visible) return false; ancestor = ancestor.parent; }
        return true;
      });
      raycaster.far = 2.65;
    }
    useTrainingStore.getState().focus(!blocked ? (hit?.object.userData.trainingTarget as TrainingTarget | undefined) ?? null : null);
  });

  return <>
    <RigidBody ref={body} position={layout.spawn} colliders={false} enabledRotations={[false, false, false]} canSleep={false} ccd>
      <CapsuleCollider args={[0.52, 0.28]} friction={0.35} />
    </RigidBody>
  </>;
}
