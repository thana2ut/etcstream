"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from "@react-three/rapier";
import { Euler, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { useTrainingStore } from "@/game/stores/training-store";
import type { Point3, TrainingTarget } from "@/game/training/hdmi-training";
import { FirstPersonHands } from "./first-person-hands";

import { STUDIO, studioDropHeight } from "@/game/training/studio-room-layout";

const BINDINGS = { forward: "KeyW", back: "KeyS", left: "KeyA", right: "KeyD", interact: "KeyE", drop: "KeyF" } as const;
const lookCenter = new Vector2(0, 0);
const movement = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const dropDirection = new Vector3();
const raycaster = new Raycaster();
raycaster.far = 2.65;

function dropPoint(camera: import("three").Camera): Point3 {
  camera.getWorldDirection(dropDirection);
  dropDirection.y = 0;
  dropDirection.normalize().multiplyScalar(0.9);
  const x = MathUtils.clamp(camera.position.x + dropDirection.x, -STUDIO.room.width / 2 + 0.35, STUDIO.room.width / 2 - 0.35);
  const z = MathUtils.clamp(camera.position.z + dropDirection.z, -STUDIO.room.depth / 2 + 0.5, STUDIO.room.depth / 2 - 0.35);
  return [x, studioDropHeight(x, z), z];
}

export function FirstPersonController({ active, fallbackLook, onExitFallback }: { active: boolean; fallbackLook: boolean; onExitFallback: () => void }) {
  const { gl, camera, scene } = useThree();
  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const angles = useRef({ yaw: -0.48, pitch: -0.12 });
  const targets = useRef<Object3D[]>([]);

  useEffect(() => {
    const element = gl.domElement;
    const onMove = (event: MouseEvent) => {
      if (!active) return;
      const locked = document.pointerLockElement === element;
      if (!locked && !(fallbackLook && event.buttons === 1 && event.target === element)) return;
      angles.current.yaw -= event.movementX * 0.0018;
      angles.current.pitch = MathUtils.clamp(angles.current.pitch - event.movementY * 0.0018, -1.25, 1.25);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!active || (document.pointerLockElement !== element && !fallbackLook)) return;
      if (event.code === "Escape" && fallbackLook) { onExitFallback(); return; }
      if (Object.values(BINDINGS).includes(event.code as typeof BINDINGS[keyof typeof BINDINGS])) event.preventDefault();
      if ([BINDINGS.forward, BINDINGS.back, BINDINGS.left, BINDINGS.right].includes(event.code as typeof BINDINGS.forward)) keys.current.add(event.code);
      if (event.repeat) return;
      if (event.code === BINDINGS.interact) useTrainingStore.getState().interact();
      if (event.code === BINDINGS.drop) useTrainingStore.getState().drop(dropPoint(camera));
    };
    const onKeyUp = (event: KeyboardEvent) => keys.current.delete(event.code);
    const clear = () => { keys.current.clear(); useTrainingStore.getState().focus(null); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("pointerlockchange", clear);
    window.addEventListener("blur", clear);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerlockchange", clear);
      window.removeEventListener("blur", clear);
    };
  }, [active, camera, gl, fallbackLook, onExitFallback]);

  useBeforePhysicsStep(() => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const velocity = rigidBody.linvel();
    movement.set(0, 0, 0);
    if (active && (document.pointerLockElement === gl.domElement || fallbackLook)) {
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
    camera.quaternion.setFromEuler(new Euler(angles.current.pitch, angles.current.yaw, 0, "YXZ"));
    if (!active || (document.pointerLockElement !== gl.domElement && !fallbackLook)) return;
    targets.current = [];
    scene.traverse((object) => { if (object.userData.trainingTarget) targets.current.push(object); });
    raycaster.setFromCamera(lookCenter, camera);
    const hit = raycaster.intersectObjects(targets.current, false)[0];
    useTrainingStore.getState().focus((hit?.object.userData.trainingTarget as TrainingTarget | undefined) ?? null);
  });

  return <>
    <RigidBody ref={body} position={STUDIO.spawn} colliders={false} enabledRotations={[false, false, false]} canSleep={false} ccd>
      <CapsuleCollider args={[0.52, 0.28]} friction={0.35} />
    </RigidBody>
    <FirstPersonHands />
  </>;
}
