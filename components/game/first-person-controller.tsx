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
import { inspectIdForTarget } from "@/game/content/inspect-info";

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
const MOUSE_SENSITIVITY = 0.0018;
const TOUCH_SENSITIVITY = 0.004;
const MAX_PITCH = 1.3;
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
  const controls = useRef({ active, fallbackLook, touch, onExitFallback });
  const skipLockedMove = useRef(true);
  const fallbackDragging = useRef(false);
  const targetListDirty = useRef(true);
  const relockSettleUntil = useRef(0);
  const anchor = useRef<Object3D>(null);

  useEffect(() => { controls.current = { active, fallbackLook, touch, onExitFallback }; }, [active, fallbackLook, touch, onExitFallback]);

  useEffect(() => {
    if (active) return;
    keys.current.clear();
    inspectTarget.current = null;
    fallbackDragging.current = false;
    useTrainingStore.getState().setInspectHold(null);
    useTrainingStore.getState().focus(null);
    if (document.pointerLockElement === gl.domElement) document.exitPointerLock();
  }, [active, gl]);

  useEffect(() => useTrainingStore.subscribe((state, previous) => {
    if (state.scenarioId !== previous.scenarioId || state.items !== previous.items || state.cables !== previous.cables || state.held !== previous.held || state.heldItem !== previous.heldItem) targetListDirty.current = true;
  }), []);

  useEffect(() => {
    const element = gl.domElement;
    const pressedKeys = keys.current;
    const canControl = () => controls.current.active && (controls.current.touch || document.pointerLockElement === element || controls.current.fallbackLook);
    const beginInteract = () => {
      const store = useTrainingStore.getState();
      const target = store.focusedTarget;
      if (!store.held && !store.heldItem && inspectIdForTarget(target)) {
        inspectTarget.current = target;
        store.setInspectHold(performance.now());
      }
      else store.interact();
    };
    const endInteract = () => {
      const store = useTrainingStore.getState();
      if (scenarioOf(store).stage && (!canControl() || store.inspecting || JSON.stringify(inspectTarget.current) !== JSON.stringify(store.focusedTarget))) {
        store.setInspectHold(null);
        inspectTarget.current = null;
        return;
      }
      if (store.inspectHoldStart !== null) { store.setInspectHold(null); if (canControl()) store.interact(); }
      inspectTarget.current = null;
    };
    const onMove = (event: MouseEvent) => {
      if (!controls.current.active || document.hidden || useTrainingStore.getState().inspecting) return;
      const locked = document.pointerLockElement === element;
      if (locked) {
        // Browsers can report stale/accumulated deltas for the first samples after (re)gaining lock.
        if (performance.now() < relockSettleUntil.current) return;
        if (skipLockedMove.current) { skipLockedMove.current = false; return; }
      } else {
        if (!controls.current.fallbackLook || event.buttons !== 1 || event.target !== element) { fallbackDragging.current = false; return; }
        if (!fallbackDragging.current) { fallbackDragging.current = true; return; }
      }
      if (!Number.isFinite(event.movementX) || !Number.isFinite(event.movementY)) return;
      // A relock/OS-focus glitch can report a screen-sized synthetic delta; ordinary fast turns are untouched.
      // Real hand movement stays far below this per event even on fast flicks; larger samples are snap glitches.
      if (Math.abs(event.movementX) > Math.max(400, window.innerWidth * 0.35) || Math.abs(event.movementY) > Math.max(300, window.innerHeight * 0.35)) return;
      angles.current.yaw -= event.movementX * MOUSE_SENSITIVITY;
      angles.current.pitch = MathUtils.clamp(angles.current.pitch - event.movementY * MOUSE_SENSITIVITY, -MAX_PITCH, MAX_PITCH);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!canControl() || useTrainingStore.getState().inspecting) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.code === "Escape" && controls.current.fallbackLook) { controls.current.onExitFallback(); return; }
      if (Object.values(BINDINGS).includes(event.code as typeof BINDINGS[keyof typeof BINDINGS])) event.preventDefault();
      if ([BINDINGS.forward, BINDINGS.back, BINDINGS.left, BINDINGS.right].includes(event.code as typeof BINDINGS.forward)) keys.current.add(event.code);
      if (event.repeat) return;
      if (event.code === BINDINGS.interact) beginInteract();
      // R turns a held device; without one, the play page keeps R for the cable bag.
      if ((event.code === "KeyR" || event.code === "KeyT") && useTrainingStore.getState().heldItem) {
        event.preventDefault();
        useTrainingStore.getState().turnHeld();
      }
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
      if (!canControl() || useTrainingStore.getState().inspecting) return;
      const detail = (event as CustomEvent<TrainingInputDetail>).detail;
      if (detail.type === "move") {
        if (detail.pressed) keys.current.add(detail.code);
        else keys.current.delete(detail.code);
      }
      if (detail.type === "look") {
        angles.current.yaw -= detail.dx * TOUCH_SENSITIVITY;
        angles.current.pitch = MathUtils.clamp(angles.current.pitch - detail.dy * TOUCH_SENSITIVITY, -MAX_PITCH, MAX_PITCH);
      }
      if (detail.type === "interact") {
        if (detail.pressed) beginInteract();
        else endInteract();
      }
      if (detail.type === "drop") useTrainingStore.getState().drop(dropPoint(camera, layout), angles.current.yaw);
      if (detail.type === "turn") useTrainingStore.getState().turnHeld();
    };
    const clear = () => {
      keys.current.clear(); skipLockedMove.current = true; fallbackDragging.current = false; inspectTarget.current = null;
      relockSettleUntil.current = performance.now() + 60;
      const store = useTrainingStore.getState();
      if (store.inspectHoldStart !== null) store.setInspectHold(null);
      store.focus(null);
    };
    const endDrag = () => { fallbackDragging.current = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener(TRAINING_INPUT_EVENT, onTouchInput);
    document.addEventListener("pointerlockchange", clear);
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("blur", clear);
    return () => {
      if (scenarioOf(useTrainingStore.getState()).stage) {
        pressedKeys.clear();
        inspectTarget.current = null;
        useTrainingStore.getState().setInspectHold(null);
        useTrainingStore.getState().focus(null);
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener(TRAINING_INPUT_EVENT, onTouchInput);
      document.removeEventListener("pointerlockchange", clear);
      document.removeEventListener("visibilitychange", clear);
      window.removeEventListener("blur", clear);
    };
  }, [camera, gl, layout]);

  useBeforePhysicsStep(() => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const velocity = rigidBody.linvel();
    movement.set(0, 0, 0);
    const store = useTrainingStore.getState();
    const blocked = Boolean(scenarioOf(store).stage && (store.inspecting));
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
    // Follow the interpolated render transform, not the raw fixed-step physics position:
    // reading translation() makes the camera step at the physics rate and judder on high-refresh displays.
    if (anchor.current) { anchor.current.getWorldPosition(camera.position); camera.position.y += 0.84; }
    else { const translation = body.current?.translation(); if (translation) camera.position.set(translation.x, translation.y + 0.84, translation.z); }
    camera.quaternion.setFromEuler(look.set(angles.current.pitch, angles.current.yaw, 0, "YXZ"));
    if (!active || (!touch && document.pointerLockElement !== gl.domElement && !fallbackLook)) return;
    const store = useTrainingStore.getState();
    if (scenarioOf(store).stage) {
      if (store.inspecting) { keys.current.clear(); store.focus(null); return; }
      if (store.inspectHoldStart !== null && JSON.stringify(inspectTarget.current) !== JSON.stringify(store.focusedTarget)) {
        store.setInspectHold(null);
        inspectTarget.current = null;
      }
    }
    if (store.inspectHoldStart !== null && performance.now() - store.inspectHoldStart >= INSPECT_HOLD_MS) {
      const target = store.focusedTarget;
      const id = inspectIdForTarget(target);
      store.setInspecting(id);
      if (document.pointerLockElement) document.exitPointerLock();
      return;
    }
    // Rebuild on inventory/scenario changes, with a slow safety refresh for late-mounted scene objects.
    if (targetListDirty.current || ++frame.current % 120 === 1 || targets.current.length === 0) {
      targetListDirty.current = false;
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
      <object3D ref={anchor} />
    </RigidBody>
  </>;
}
