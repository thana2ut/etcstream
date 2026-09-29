import type { Mission } from "@/game/types";
import { missionCopy } from "@/game/content/mission-copy";

export const missionS001: Mission = {
  id: "MISSION_S_001",
  title: missionCopy.technical.title,
  description: missionCopy.technical.description,
  mode: "classroom",
  level: "S",
  difficulty: 1,
  objectives: [...missionCopy.technical.objectives],
  requiredConnections: [
    { from: "camera:hdmi-out", to: "switcher:hdmi-in", signal: "video" },
    { from: "switcher:hdmi-out", to: "monitor:hdmi-in", signal: "video" },
  ],
  allowedEquipment: ["camera", "switcher", "monitor", "hdmi-cable"],
  distractorEquipment: [],
  rewards: { experience: 100 },
  timeLimit: null,
  hintsEnabled: true,
};
