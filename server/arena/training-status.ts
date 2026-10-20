import "server-only";
import { SCENARIOS } from "@/game/training/scenarios";

/** Configuration inspection only; never reads or alters a player's local saves. */
export function trainingStatus() {
  const scene = SCENARIOS["studio-full"];
  return {
    sceneId: scene.id,
    source: "game/training/scenarios.ts · studio-full",
    centralRecordsAvailable: false,
    settingsWritable: false,
    devices: scene.devices.map(({ id, label, model, verified }) => ({ id, label, model, verified })),
    cables: scene.cables.map(({ id, label, ends }) => ({ id, label, ends })),
    portCount: Object.keys(scene.ports).length,
    requirementCount: scene.requirements.length,
    provisionalRequirements: scene.requirements.filter((r) => !r.verified).map((r) => r.label),
    placeableCount: scene.placeables.length,
    actionCount: scene.actions.length,
  };
}
export type TrainingStatus = ReturnType<typeof trainingStatus>;
