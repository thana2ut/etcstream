import type { ScenarioId } from "@/game/training/scenarios";
import type { VenueId } from "@/game/content/mission-catalog";
export type AdminPreviewContext = {
  id: string; scenarioId: ScenarioId; chamber: "training" | "missions";
  title: string; venue: VenueId; expires: number;
  loadout: { leads: string[]; bag: Record<string, number> };
};
