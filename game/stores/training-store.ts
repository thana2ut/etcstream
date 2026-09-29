import { create } from "zustand";
import {
  initialTrainingState, interactWithTarget, placeHeldOnCenterTable,
  type Point3, type TrainingState, type TrainingTarget,
} from "@/game/training/hdmi-training";

import { soundEngine } from "@/game/audio/sound-engine";

interface TrainingStore extends TrainingState {
  focusedTarget: TrainingTarget | null;
  reset: () => void;
  focus: (target: TrainingTarget | null) => void;
  interact: () => void;
  drop: (position: Point3) => void;
}

function targetKey(target: TrainingTarget | null): string {
  if (!target) return "";
  if (target.kind === "port") return `port:${target.portId}`;
  if (target.kind === "item") return `item:${target.itemId}`;
  return `end:${target.cableId}:${target.end}`;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  ...initialTrainingState(),
  focusedTarget: null,
  reset: () => set({ ...initialTrainingState(), focusedTarget: null }),
  focus: (target) => {
    if (targetKey(get().focusedTarget) !== targetKey(target)) set({ focusedTarget: target });
  },
  interact: () =>
    set((state) => {
      const next = interactWithTarget(state, state.focusedTarget);
      if (next.notice?.tone === "success") {
        soundEngine.play("connection_success");
      } else if (next.notice?.tone === "error") {
        soundEngine.play("connection_error");
      }
      return next;
    }),
  drop: (position) => set((state) => placeHeldOnCenterTable(state, position)),
}));
