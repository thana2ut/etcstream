import { create } from "zustand";
import {
  initialTrainingState, interactWithTarget, placeHeldOnCenterTable,
  type PickMode, type Point3, type ScenarioId, type TrainingState, type TrainingTarget,
} from "@/game/training/hdmi-training";

import { soundEngine } from "@/game/audio/sound-engine";
import { scenarioOf, stowHeldCable } from "@/game/training/hdmi-training";
import { MAX_WRONG_STREAK } from "@/game/content/cable-catalog";

interface TrainingStore extends TrainingState {
  focusedTarget: TrainingTarget | null;
  /** `hiddenCables`: leads not packed in the cable-prep lobby. `bagged`: packed leads that start inside the bag. */
  reset: (scenarioId?: ScenarioId, hiddenCables?: string[], bagged?: string[]) => void;
  /** Mission only: consecutive wrong connection attempts (5 = level failed). */
  wrongStreak: number;
  failed: boolean;
  /** Bag: take one lead out of the bag straight into the hands (it leaves the bag until stowed again). */
  takeCable: (cableId: string) => boolean;
  /** Mission bag: return the lead in hand to the bag. */
  stowHeld: () => void;
  /** Hide the status banner (it auto-hides a few seconds after each action). */
  clearNotice: () => void;
  focus: (target: TrainingTarget | null) => void;
  interact: () => void;
  /** Next E on a cable takes the whole lead, or only its head (1) / tail (2). Resets after use. */
  pickMode: PickMode;
  setPickMode: (mode: PickMode) => void;
  drop: (position: Point3, facing?: number) => void;
  /** Extra yaw (T key, 45° steps) applied to the held device when it is placed. */
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
  wrongStreak: 0, failed: false,
  stowHeld: () => set((state) => stowHeldCable(state)),
  clearNotice: () => set({ notice: null }),
  takeCable: (cableId) => {
    const state = get();
    const c = state.cables[cableId];
    if (!c || state.hiddenCables?.includes(cableId) || !state.bagged?.includes(cableId)) return false;
    if (state.held || state.heldItem) { set({ notice: { title: "มือไม่ว่าง", detail: "กด F เพื่อวางสิ่งที่ถืออยู่ก่อน แล้วค่อยหยิบสายจากกระเป๋า", tone: "error" } }); return false; }
    if (c.a.portId || c.b.portId) return false;
    const label = scenarioOf(state).cables.find((x) => x.id === cableId)?.label ?? "สาย";
    set({ held: { cableId, end: "a" }, bagged: state.bagged.filter((id) => id !== cableId), notice: { title: "หยิบสายจากกระเป๋าแล้ว", detail: `${label} · เล็งพอร์ตแล้วกด E เพื่อเสียบ`, tone: "info" } });
    return true;
  },
  reset: (scenarioId, hiddenCables, bagged) => set((state) => ({ ...initialTrainingState(scenarioId ?? state.scenarioId, hiddenCables ?? [], bagged ?? []), wrongStreak: 0, failed: false, focusedTarget: null, heldTurn: 0, inspecting: null, inspectHoldStart: null, pickMode: "whole" })),
  focus: (target) => {
    if (targetKey(get().focusedTarget) !== targetKey(target)) set({ focusedTarget: target });
  },
  interact: () =>
    set((state) => {
      if (state.failed) return state;
      const next = { ...interactWithTarget(state, state.focusedTarget, state.pickMode), pickMode: state.focusedTarget?.kind === "end" ? "whole" as const : state.pickMode };
      // Mission levels: a plug pushed into a port it does not belong to counts as a wrong connection; MAX in a row fails the level.
      if (scenarioOf(state).venueScale && state.held && state.focusedTarget?.kind === "port") {
        const streak = next.notice?.tone === "error" ? state.wrongStreak + 1 : 0;
        Object.assign(next, { wrongStreak: streak, failed: streak >= MAX_WRONG_STREAK });
      }
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
