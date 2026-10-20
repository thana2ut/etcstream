"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTrainingStore } from "@/game/stores/training-store";

/**
 * First-person hands as a 2D screen overlay (painted xianxia sleeves).
 * Right hand grips while a cable end or device is held; left hand reaches
 * whenever the crosshair rests on something interactable.
 */
export function FirstPersonHands() {
  const holding = useTrainingStore((state) => Boolean(state.held || state.heldItem));
  const aiming = useTrainingStore((state) => Boolean(state.focusedTarget));
  const root = useRef<HTMLDivElement>(null);

  // Weapon-style sway: hands lag behind mouse look and spring back, which sells depth.
  useEffect(() => {
    const node = root.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, frame = 0, phase = 0, walk = 0;
    const moving = new Set<string>();
    const MOVE = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    const onMove = (event: MouseEvent) => {
      x = Math.max(-1, Math.min(1, x - event.movementX / 120));
      y = Math.max(-1, Math.min(1, y - event.movementY / 120));
    };
    const onKey = (event: KeyboardEvent) => {
      if (!MOVE.has(event.code)) return;
      if (event.type === "keydown") moving.add(event.code); else moving.delete(event.code);
    };
    const onBlur = () => moving.clear();
    const tick = () => {
      x *= 0.88; y *= 0.88;
      // Walking: a soft figure-eight bob that eases in and out instead of snapping on and off.
      walk += ((moving.size ? 1 : 0) - walk) * 0.08;
      phase += 0.16 * walk;
      node.style.setProperty("--sway-x", x.toFixed(3));
      node.style.setProperty("--sway-y", y.toFixed(3));
      // Sideways bob only swings outward-and-back (never toward the centre prompt): |sin| keeps it ≥ 0.
      node.style.setProperty("--bob-x", (-Math.abs(Math.sin(phase)) * 3 * walk).toFixed(2));
      node.style.setProperty("--bob-y", (Math.abs(Math.cos(phase)) * 5 * walk).toFixed(2));
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove); window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey); window.removeEventListener("blur", onBlur);
    };
  }, []);

  return <div ref={root} className="fp-hands" aria-hidden="true">
    <Image width={900} height={900} priority className={`fp-hand fp-hand-left ${aiming ? "is-reaching" : ""}`} src={aiming ? "/images/xianxia/hands/left-reach.webp" : "/images/xianxia/hands/left-idle.webp"} alt="" draggable={false} />
    <Image width={900} height={900} priority className={`fp-hand fp-hand-right ${holding ? "is-gripping" : ""}`} src={holding ? "/images/xianxia/hands/right-grip.webp" : "/images/xianxia/hands/right-idle.webp"} alt="" draggable={false} />
  </div>;
}
