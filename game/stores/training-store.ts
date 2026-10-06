import { create } from "zustand";
import {
  initialTrainingState, interactWithTarget, placeHeldOnCenterTable,
  type PickMode, type Point3, type ScenarioId, type TrainingState, type TrainingTarget,
} from "@/game/training/hdmi-training";

import { soundEngine } from "@/game/audio/sound-engine";

interface TrainingStore extends TrainingState {
  focusedTarget: TrainingTarget | null;
  reset: (scenarioId?: ScenarioId) => void;
  focus: (target: TrainingTarget | null) => void;
  interact: () => void;
  /** Next E on a cable takes the whole lead, or only its head (1) / tail (2). Resets after use. */
  pickMode: PickMode;
  setPickMode: (mode: PickMode) => void;
  drop: (position: Point3, facing?: number) => void;
  /** Extra yaw (R key, 45° steps) applied to the held device when it is placed. */
  heldTurn: number;
  /** Device id open in the full-screen inspector (hold E for 5 s on a device). */
  inspecting: string | null;
  /** performance.now() when E started being held on an inspectable target. */
  inspectHoldStart: number | null;
  setInspecting: (id: string | null) => void;
  setInspectHold: (start: number | null) => void;
  turnHeld: () => void;
}

function targetKey(target: TrainingTarget | null): string {
  if (!target) return "";
  if (target.kind === "port") return `port:${target.portId}`;
  if (target.kind === "item") return `item:${target.itemId}`;
  if (target.kind === "action") return `action:${target.actionId}`;
  if (target.kind === "device") return `device:${target.deviceId}`;
  return `end:${target.cableId}:${target.end}`;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  ...initialTrainingState(),
  focusedTarget: null,
  reset: (scenarioId) => set((state) => ({ ...initialTrainingState(scenarioId ?? state.scenarioId), focusedTarget: null, heldTurn: 0, inspecting: null, inspectHoldStart: null, pickMode: "whole" })),
  focus: (target) => {
    if (targetKey(get().focusedTarget) !== targetKey(target)) set({ focusedTarget: target });
  },
  interact: () =>
    set((state) => {
      const next = { ...interactWithTarget(state, state.focusedTarget, state.pickMode), pickMode: state.focusedTarget?.kind === "end" ? "whole" as const : state.pickMode };
      if (next.notice?.tone === "success") {
        soundEngine.play("connection_success");
      } else if (next.notice?.tone === "error") {
        soundEngine.play("connection_error");
      }
      return next;
    }),
  pickMode: "whole",
  setPickMode: (mode) => set((state) => ({ pickMode: state.pickMode === mode ? "whole" : mode })),
  heldTurn: 0,
  inspecting: null,
  inspectHoldStart: null,
  setInspecting: (id) => set({ inspecting: id, inspectHoldStart: null }),
  setInspectHold: (start) => set({ inspectHoldStart: start }),
  turnHeld: () => set((state) => ({ heldTurn: state.heldItem ? (state.heldTurn + Math.PI / 4) % (Math.PI * 2) : 0 })),
  // Device front faces the player (facing = camera yaw), plus any extra R-key turn.
  drop: (position, facing = 0) => set((state) => ({ ...placeHeldOnCenterTable(state, position, facing + state.heldTurn), heldTurn: state.heldItem ? 0 : state.heldTurn })),
}));
