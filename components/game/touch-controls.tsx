"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { emitTrainingInput, type TrainingMoveCode } from "@/game/input/training-input";

const JOY_DEAD = 0.35;

/** Analog-style stick: the knob follows the finger inside the ring; direction maps to W/A/S/D (diagonals allowed). */
function MoveStick() {
  const [knob, setKnob] = useState<[number, number]>([0, 0]);
  const [pressed, setPressed] = useState(false);
  const active = useRef<{ id: number; cx: number; cy: number; radius: number } | null>(null);
  const held = useRef(new Set<TrainingMoveCode>());
  const apply = (next: Set<TrainingMoveCode>) => {
    for (const code of held.current) if (!next.has(code)) emitTrainingInput({ type: "move", code, pressed: false });
    for (const code of next) if (!held.current.has(code)) emitTrainingInput({ type: "move", code, pressed: true });
    held.current = next;
  };
  const track = (x: number, y: number) => {
    const c = active.current;
    if (!c) return;
    let dx = x - c.cx, dy = y - c.cy;
    const len = Math.hypot(dx, dy);
    if (len > c.radius) { dx = (dx / len) * c.radius; dy = (dy / len) * c.radius; }
    setKnob([dx, dy]);
    const next = new Set<TrainingMoveCode>();
    if (dy < -c.radius * JOY_DEAD) next.add("KeyW");
    if (dy > c.radius * JOY_DEAD) next.add("KeyS");
    if (dx < -c.radius * JOY_DEAD) next.add("KeyA");
    if (dx > c.radius * JOY_DEAD) next.add("KeyD");
    apply(next);
  };
  const stop = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (active.current?.id !== event.pointerId) return;
    active.current = null;
    setPressed(false);
    setKnob([0, 0]);
    apply(new Set());
  };
  useEffect(() => {
    const release = () => {
      active.current = null;
      setPressed(false);
      setKnob([0, 0]);
      apply(new Set());
    };
    const onVisibility = () => { if (document.hidden) release(); };
    window.addEventListener("blur", release);
    window.addEventListener("resize", release);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", release);
      window.removeEventListener("resize", release);
      document.removeEventListener("visibilitychange", onVisibility);
      apply(new Set());
    };
  }, []);
  return <div
    className="touch-move-pad"
    role="application"
    aria-label="ปุ่มเคลื่อนที่ ลากลูกกลมเพื่อเดิน"
    onPointerDown={(event) => {
      if (active.current) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const box = event.currentTarget.getBoundingClientRect();
      active.current = { id: event.pointerId, cx: box.left + box.width / 2, cy: box.top + box.height / 2, radius: Math.min(box.width, box.height) * 0.34 };
      setPressed(true);
      track(event.clientX, event.clientY);
    }}
    onPointerMove={(event) => { if (active.current?.id === event.pointerId) { event.preventDefault(); track(event.clientX, event.clientY); } }}
    onPointerUp={stop}
    onPointerCancel={stop}
    onLostPointerCapture={stop}
  >
    <span className="touch-joy-arrow is-up" aria-hidden="true">▲</span>
    <span className="touch-joy-arrow is-left" aria-hidden="true">◀</span>
    <span className="touch-joy-arrow is-down" aria-hidden="true">▼</span>
    <span className="touch-joy-arrow is-right" aria-hidden="true">▶</span>
    <span className={`touch-joy-knob${pressed ? " is-active" : ""}`} aria-hidden="true" style={{ transform: `translate(calc(-50% + ${knob[0]}px), calc(-50% + ${knob[1]}px))` }} />
  </div>;
}

export function TouchControls() {
  const look = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => {
    const release = () => {
      look.current = null;
      emitTrainingInput({ type: "interact", pressed: false });
    };
    const onVisibility = () => { if (document.hidden) release(); };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, []);

  const startLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (look.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    look.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const moveLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    const previous = look.current;
    if (!previous || previous.id !== event.pointerId) return;
    event.preventDefault();
    emitTrainingInput({ type: "look", dx: event.clientX - previous.x, dy: event.clientY - previous.y });
    look.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const stopLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (look.current?.id === event.pointerId) look.current = null;
  };
  const endInteract = () => emitTrainingInput({ type: "interact", pressed: false });

  return <div className="touch-controls" aria-label="ปุ่มควบคุมแบบสัมผัส">
    <div
      className="touch-look-pad"
      role="application"
      aria-label="ลากที่ใดก็ได้บนจอเพื่อมองรอบตัว"
      onPointerDown={startLook}
      onPointerMove={moveLook}
      onPointerUp={stopLook}
      onPointerCancel={stopLook}
      onLostPointerCapture={stopLook}
    />
    <MoveStick />



    <div className="touch-action-buttons">
      <button
        type="button"
        className="touch-control-button touch-interact"
        aria-label="หยิบ ต่อ หรือใช้งาน กดค้างเพื่อดูรายละเอียด"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          emitTrainingInput({ type: "interact", pressed: true });
        }}
        onPointerUp={endInteract}
        onPointerCancel={endInteract}
        onLostPointerCapture={endInteract}
      >ใช้งาน</button>
      {/* Plug / unplug: aim at a port to plug the held lead in, or at a plugged cable head to pull it out. */}
      <button type="button" className="touch-control-button touch-plug" aria-label="ถอดหรือใส่สาย ชี้ที่หัวสายเพื่อถอด ชี้ที่พอร์ตเพื่อเสียบ"
        onClick={() => { emitTrainingInput({ type: "interact", pressed: true }); window.setTimeout(() => emitTrainingInput({ type: "interact", pressed: false }), 60); }}>ถอด/ใส่</button>
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "drop" })}>วาง</button>
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "turn" })}>หมุน</button>
    </div>
  </div>;
}
