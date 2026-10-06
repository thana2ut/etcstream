"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { emitTrainingInput, type TrainingMoveCode } from "@/game/input/training-input";

function MoveButton({ code, label, className = "" }: { code: TrainingMoveCode; label: string; className?: string }) {
  const release = () => emitTrainingInput({ type: "move", code, pressed: false });
  return <button
    type="button"
    className={`touch-control-button ${className}`}
    aria-label={label}
    onPointerDown={(event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      emitTrainingInput({ type: "move", code, pressed: true });
    }}
    onPointerUp={release}
    onPointerCancel={release}
    onLostPointerCapture={release}
  >{label}</button>;
}

export function TouchControls() {
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
    <div className="touch-move-pad" aria-label="ปุ่มเคลื่อนที่">
      <MoveButton code="KeyW" label="▲" className="touch-up" />
      <MoveButton code="KeyA" label="◀" className="touch-left" />
      <MoveButton code="KeyS" label="▼" className="touch-down" />
      <MoveButton code="KeyD" label="▶" className="touch-right" />
    </div>

    <div
      className="touch-look-pad"
      role="application"
      aria-label="ลากบริเวณนี้เพื่อมองรอบตัว"
      onPointerDown={startLook}
      onPointerMove={moveLook}
      onPointerUp={stopLook}
      onPointerCancel={stopLook}
      onLostPointerCapture={stopLook}
    ><span>ลากเพื่อมอง</span></div>

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
