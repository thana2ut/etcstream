import { emitCompetitionCommand, hasCompetitionCommandListeners } from "@/game/training/competition-commands";
import { create } from "zustand";
import {
  initialTrainingState, interactWithTarget, placeHeldOnCenterTable,
  type PickMode, type Point3, type ScenarioId, type TrainingState, type TrainingTarget,
} from "@/game/training/hdmi-training";

import { soundEngine } from "@/game/audio/sound-engine";
import { answerReview, scenarioOf, setControl, stowHeldCable } from "@/game/training/hdmi-training";
import type { ControlValue } from "@/game/training/sim/types";
import { MAX_WRONG_STREAK } from "@/game/content/cable-catalog";

export const MAX_MISSION_CONNECTION_MISTAKES = 3;
const DUPLICATE_REJECTION_MS = 400;
let lastRejectedConnection = "";
let lastRejectedAt = 0;

interface TrainingStore extends TrainingState {
  failureEnabled: boolean;
  focusedTarget: TrainingTarget | null;
  /** `hiddenCables`: leads not packed in the cable-prep lobby. `bagged`: packed leads that start inside the bag. */
  reset: (scenarioId?: ScenarioId, hiddenCables?: string[], bagged?: string[]) => void;
  /** Mission only: deliberate rejected connection attempts in this run (fourth = failed). */
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
  /** C: whole lead → head only → tail only → whole lead. */
  cyclePickMode: () => void;
  /** Paid revive (Mission Hall): keep every placed device and correct lead, clear the failure, one last chance left. */
  revive: () => void;
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
  /** In-room device controls (E on a control) and the mistake review overlay. Tests/console were removed. */
  control: (device: string, key: string, value: ControlValue) => void;
  review: (choice: number) => void;
}

function targetKey(target: TrainingTarget | null): string {
  if (!target) return "";
  if (target.kind === "port") return `port:${target.portId}`;
  if (target.kind === "item") return `item:${target.itemId}`;
  if (target.kind === "action") return `action:${target.actionId}`;
  if (target.kind === "device") return `device:${target.deviceId}`;
  if (target.kind === "control") return `control:${target.deviceId}:${target.key}:${String(target.value)}`;
  return `end:${target.cableId}:${target.end}`;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  failureEnabled: true,
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
  reset: (scenarioId, hiddenCables, bagged) => {
    lastRejectedConnection = "";
    lastRejectedAt = 0;
    set((state) => ({ ...initialTrainingState(scenarioId ?? state.scenarioId, hiddenCables ?? [], bagged ?? []), failureEnabled: true, wrongStreak: 0, failed: false, focusedTarget: null, heldTurn: 0, inspecting: null, inspectHoldStart: null, pickMode: "whole" }));
  },
  focus: (target) => {
    if (targetKey(get().focusedTarget) !== targetKey(target)) set({ focusedTarget: target });
  },
  interact: () =>
    set((state) => {
      if (state.failed || (scenarioOf(state).stage && state.completed)) return state;
      const outcome = interactWithTarget(state, state.focusedTarget, state.pickMode);
      const next = { ...state, ...outcome, invalidConnectionAttempt: false, pickMode: state.focusedTarget?.kind === "end" ? "whole" as const : state.pickMode };
      if (state.scenarioId === "studio-full" && state.held && state.focusedTarget?.kind === "port" && outcome.invalidConnectionAttempt) {
        next.wrongStreak = Math.min(3, state.wrongStreak + 1);
        next.failed = next.wrongStreak >= 3;
        next.classroom = { mistakes: next.wrongStreak, failed: next.failed, question: null };
        if (next.failed) next.notice = { title: "การฝึกไม่สำเร็จ", detail: "ต่อสายผิดครบ 3/3 ครั้งแล้ว สามารถเริ่มใหม่หรือจ่ายหินเพื่อเล่นต่อจากเดิม", tone: "error" };
      } else if (scenarioOf(state).stage && state.held && state.focusedTarget?.kind === "port") {
        if (outcome.invalidConnectionAttempt) {
          const key = `${state.scenarioId}:${state.held.cableId}:${state.held.end}:${state.focusedTarget.portId}`;
          const now = Date.now();
          if (key !== lastRejectedConnection || now - lastRejectedAt > DUPLICATE_REJECTION_MS) {
            lastRejectedConnection = key;
            lastRejectedAt = now;
            next.wrongStreak = state.wrongStreak + 1;
            next.failed = next.wrongStreak > MAX_MISSION_CONNECTION_MISTAKES;
            if (next.wrongStreak === MAX_MISSION_CONNECTION_MISTAKES) next.notice = { title: "คำเตือนครั้งสุดท้าย", detail: "ท่านผิดพลาดครบ 3 ครั้งแล้ว หากต่อสายผิดอีกครั้ง ภารกิจจะล้มเหลวทันที", tone: "error" };
          }
        }
      } else if (scenarioOf(state).venueScale && !scenarioOf(state).stage && state.held && state.focusedTarget?.kind === "port") {
        const streak = next.notice?.tone === "error" ? state.wrongStreak + 1 : 0;
        next.wrongStreak = streak;
        next.failed = streak >= MAX_WRONG_STREAK;
      }
      if (!state.failureEnabled) { next.failed = false; if (next.classroom) next.classroom = { ...next.classroom, failed: false }; }
      if (next.notice?.tone === "success") {
        soundEngine.play("connection_success");
      } else if (next.notice?.tone === "error") {
        soundEngine.play("connection_error");
      }
      return next;
    }),
  pickMode: "whole",
  setPickMode: (mode) => set((state) => state.failed || (scenarioOf(state).stage && state.completed) ? state : ({ pickMode: state.pickMode === mode ? "whole" : mode })),
  cyclePickMode: () => set((state) => state.failed || (scenarioOf(state).stage && state.completed) ? state : ({ pickMode: state.pickMode === "whole" ? "a" : state.pickMode === "a" ? "b" : "whole" })),
  // The failing plug was rejected and never connected, so the current room is already the last valid checkpoint.
  revive: () => set((state) => state.failed ? { failed: false, wrongStreak: Math.max(0, state.wrongStreak - 1), notice: null, focusedTarget: null } : state),
  heldTurn: 0,
  inspecting: null,
  inspectHoldStart: null,
  setInspecting: (id) => set({ inspecting: id, inspectHoldStart: null }),
  setInspectHold: (start) => set({ inspectHoldStart: start }),
  turnHeld: () => set((state) => ({ heldTurn: state.heldItem ? (state.heldTurn + Math.PI / 4) % (Math.PI * 2) : 0 })),
  control: (device, key, value) => set((state) => { const next = setControl(state, device, key, value); if (next.notice?.tone === "error") soundEngine.play("connection_error"); return next; }),
  review: (choice) => set((state) => answerReview(state, choice)),
  // Device front faces the player (facing = camera yaw), plus any extra R-key turn.
  drop: (position, facing = 0) => set((state) => ({ ...placeHeldOnCenterTable(state, position, facing + state.heldTurn), heldTurn: state.heldItem ? 0 : state.heldTurn })),
}));

// Observe original gameplay intents without replacing any simulation/interaction behavior.
for (const method of ["interact", "drop", "takeCable", "stowHeld", "control", "review"] as const) {
  const original = useTrainingStore.getState()[method] as unknown as (...args: unknown[]) => unknown;
  useTrainingStore.setState({ [method]: (...args: unknown[]) => {
    const before = useTrainingStore.getState();
    if (before.failed || (scenarioOf(before).stage && before.completed)) return method === "takeCable" ? false : undefined;
    const evidence = method === "interact" ? [before.focusedTarget, before.pickMode] : method === "drop" ? [args[0], args[1] ?? 0, before.heldTurn] : method === "stowHeld" ? [] : method === "control" ? args.slice(0,3) : args.slice(0,1);
    const result = original(...args);
    if (hasCompetitionCommandListeners()) emitCompetitionCommand({ method, args: JSON.parse(JSON.stringify(evidence)) });
    return result;
  } } as Partial<ReturnType<typeof useTrainingStore.getState>>);
}
