"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { emitTrainingInput, type TrainingMoveCode } from "@/game/input/training-input";
import { useTrainingStore } from "@/game/stores/training-store";

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
  const pickMode = useTrainingStore((state) => state.pickMode);
  const setPickMode = useTrainingStore((state) => state.setPickMode);
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

  return <div className="touch-controls" aria-label="Touch controls">
    <div
      className="touch-look-pad"
      role="application"
      aria-label="Drag anywhere to look around"
      onPointerDown={startLook}
      onPointerMove={moveLook}
      onPointerUp={stopLook}
      onPointerCancel={stopLook}
      onLostPointerCapture={stopLook}
    />
    <div className="touch-move-pad" aria-label="Movement pad">
      <MoveButton code="KeyW" label="▲" className="touch-up" />
      <MoveButton code="KeyA" label="◀" className="touch-left" />
      <MoveButton code="KeyS" label="▼" className="touch-down" />
      <MoveButton code="KeyD" label="▶" className="touch-right" />
    </div>


    <div className="touch-pick-buttons" aria-label="Take head or tail of a lead">
      <button type="button" className={`touch-control-button${pickMode === "a" ? " is-active" : ""}`} aria-pressed={pickMode === "a"} aria-label="Mode 1: take the head only" onClick={() => setPickMode("a")}>1</button>
      <button type="button" className={`touch-control-button${pickMode === "b" ? " is-active" : ""}`} aria-pressed={pickMode === "b"} aria-label="Mode 2: take the tail only" onClick={() => setPickMode("b")}>2</button>
    </div>

    <div className="touch-action-buttons">
      <button
        type="button"
        className="touch-control-button touch-interact"
        aria-label="Pick up, plug or use; hold to inspect"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          emitTrainingInput({ type: "interact", pressed: true });
        }}
        onPointerUp={endInteract}
        onPointerCancel={endInteract}
        onLostPointerCapture={endInteract}
      >Use</button>
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "drop" })}>Drop</button>
      <button type="button" className="touch-control-button" onClick={() => emitTrainingInput({ type: "turn" })}>Turn</button>
    </div>
  </div>;
}
