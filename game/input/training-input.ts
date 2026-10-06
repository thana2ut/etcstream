export const TRAINING_INPUT_EVENT = "etcstream:training-input";

export type TrainingMoveCode = "KeyW" | "KeyA" | "KeyS" | "KeyD";

export type TrainingInputDetail =
  | { type: "move"; code: TrainingMoveCode; pressed: boolean }
  | { type: "look"; dx: number; dy: number }
  | { type: "interact"; pressed: boolean }
  | { type: "drop" }
  | { type: "turn" };

/** Shared action channel used by touch controls; keyboard remains available on desktop. */
export function emitTrainingInput(detail: TrainingInputDetail) {
  window.dispatchEvent(new CustomEvent<TrainingInputDetail>(TRAINING_INPUT_EVENT, { detail }));
}
