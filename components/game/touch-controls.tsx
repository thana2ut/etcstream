"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { emitTrainingInput, type TrainingMoveCode } from "@/game/input/training-input";
import { useTrainingStore } from "@/game/stores/training-store";

const JOY_RADIUS = 62;
const JOY_DEAD = 0.35;

/** Analog-style stick: the knob follows the finger inside the ring; direction maps to W/A/S/D (diagonals allowed). */
function MoveStick() {
  const [knob, setKnob] = useState<[number, number]>([0, 0]);
  const active = useRef<{ id: number; cx: number; cy: number } | null>(null);
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
    if (len > JOY_RADIUS) { dx = (dx / len) * JOY_RADIUS; dy = (dy / len) * JOY_RADIUS; }
    setKnob([dx, dy]);
    const next = new Set<TrainingMoveCode>();
    if (dy < -JOY_RADIUS * JOY_DEAD) next.add("KeyW");
    if (dy > JOY_RADIUS * JOY_DEAD) next.add("KeyS");
    if (dx < -JOY_RADIUS * JOY_DEAD) next.add("KeyA");
    if (dx > JOY_RADIUS * JOY_DEAD) next.add("KeyD");
    apply(next);
  };
  const stop = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (active.current?.id !== event.pointerId) return;
    active.current = null;
    setKnob([0, 0]);
    apply(new Set());
  };
  useEffect(() => () => apply(new Set()), []);
  return <div
    className="touch-move-pad"
    role="application"
    aria-label="ปุ่มเคลื่อนที่ ลากลูกกลมเพื่อเดิน"
    onPointerDown={(event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const box = event.currentTarget.getBoundingClientRect();
      active.current = { id: event.pointerId, cx: box.left + box.width / 2, cy: box.top + box.height / 2 };
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
    <span className={`touch-joy-knob${active.current ? " is-active" : ""}`} aria-hidden="true" style={{ transform: `translate(calc(-50% + ${knob[0]}px), calc(-50% + ${knob[1]}px))` }} />
  </div>;
}

export function TouchControls() {
  const pickMode = useTrainingStore((state) => state.pickMode);
  const cyclePickMode = useTrainingStore((state) => state.cyclePickMode);
  const look = useRef<{ id: number; x: number; y: number } | null>(null);

  const startLook = (event: ReactPointerEvent<HTMLDivElement>) => {
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


    <div className="touch-pick-buttons" aria-label="สลับหยิบทั้งเส้น หัวสาย หรือปลายสาย">
      <button type="button" className={`touch-control-button${pickMode !== "whole" ? " is-active" : ""}`} aria-pressed={pickMode !== "whole"} aria-label={`C สลับหยิบ ตอนนี้: ${pickMode === "a" ? "หัวสาย" : pickMode === "b" ? "ปลายสาย" : "ทั้งเส้น"}`} onClick={() => cyclePickMode()}>{pickMode === "a" ? "หัว" : pickMode === "b" ? "ปลาย" : "C"}</button>
    </div>

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
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "drop" })}>วาง</button>
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "turn" })}>หมุน</button>
    </div>
  </div>;
}
