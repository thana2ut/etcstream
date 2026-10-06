"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from "@react-three/rapier";
import { Euler, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { useTrainingStore } from "@/game/stores/training-store";
import type { Point3, TrainingTarget } from "@/game/training/hdmi-training";
import { TRAINING_INPUT_EVENT, type TrainingInputDetail } from "@/game/input/training-input";

import { dropHeight, LAYOUTS, onSurface, type LayoutId, type VenueLayout } from "@/game/training/venue-layouts";

const BINDINGS = { forward: "KeyW", back: "KeyS", left: "KeyA", right: "KeyD", interact: "KeyE", drop: "KeyF" } as const;
const lookCenter = new Vector2(0, 0);
export const INSPECT_HOLD_MS = 2000;
const movement = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const dropDirection = new Vector3();
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

export function FirstPersonController({ active, fallbackLook, touch, onExitFallback, venue = "studio" }: { active: boolean; fallbackLook: boolean; touch: boolean; onExitFallback: () => void; venue?: LayoutId }) {
  const { gl, camera, scene } = useThree();
  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const layout = LAYOUTS[venue];
  const angles = useRef({ yaw: layout.spawnYaw, pitch: -0.12 });
  const targets = useRef<Object3D[]>([]);
  const frame = useRef(0);

  useEffect(() => {
    const element = gl.domElement;
    const canControl = () => active && (touch || document.pointerLockElement === element || fallbackLook);
    const beginInteract = () => {
      const store = useTrainingStore.getState();
      const target = store.focusedTarget;
      if (!store.held && !store.heldItem && (target?.kind === "item" || target?.kind === "device")) store.setInspectHold(performance.now());
      else store.interact();
    };
    const endInteract = () => {
      const store = useTrainingStore.getState();
      if (store.inspectHoldStart !== null) { store.setInspectHold(null); store.interact(); }
    };
    const onMove = (event: MouseEvent) => {
      if (!active) return;
      const locked = document.pointerLockElement === element;
      if (!locked && !(fallbackLook && event.buttons === 1 && event.target === element)) return;
      angles.current.yaw -= event.movementX * 0.0018;
      angles.current.pitch = MathUtils.clamp(angles.current.pitch - event.movementY * 0.0018, -1.25, 1.25);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!canControl() || useTrainingStore.getState().inspecting) return;
      if (event.code === "Escape" && fallbackLook) { onExitFallback(); return; }
      if (Object.values(BINDINGS).includes(event.code as typeof BINDINGS[keyof typeof BINDINGS])) event.preventDefault();
      if ([BINDINGS.forward, BINDINGS.back, BINDINGS.left, BINDINGS.right].includes(event.code as typeof BINDINGS.forward)) keys.current.add(event.code);
      if (event.repeat) return;
      if (event.code === BINDINGS.interact) beginInteract();
      if (event.code === "KeyR") useTrainingStore.getState().turnHeld();
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
    if (active && (touch || document.pointerLockElement === gl.domElement || fallbackLook)) {
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
    const translation = body.current?.translation();
    if (translation) camera.position.set(translation.x, translation.y + 0.84, translation.z);
    camera.quaternion.setFromEuler(look.set(angles.current.pitch, angles.current.yaw, 0, "YXZ"));
    if (!active || (!touch && document.pointerLockElement !== gl.domElement && !fallbackLook)) return;
    const store = useTrainingStore.getState();
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
      scene.traverse((object) => { if (object.userData.trainingTarget) targets.current.push(object); });
    }
    raycaster.setFromCamera(lookCenter, camera);
    const hit = raycaster.intersectObjects(targets.current, false)[0];
    useTrainingStore.getState().focus((hit?.object.userData.trainingTarget as TrainingTarget | undefined) ?? null);
  });

  return <>
    <RigidBody ref={body} position={layout.spawn} colliders={false} enabledRotations={[false, false, false]} canSleep={false} ccd>
      <CapsuleCollider args={[0.52, 0.28]} friction={0.35} />
    </RigidBody>
  </>;
}
