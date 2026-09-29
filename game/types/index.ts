export type GameMode = "classroom" | "challenge" | "exam";
export type TrainingLevel = "S" | "M" | "L" | "XL";
export type MissionState = "ready" | "in-progress" | "completed";

export interface Player {
  playerId: string;
  nickname: string;
  createdAt: string;
  lastPlayedAt: string;
  currentMode: GameMode;
  currentLevel: TrainingLevel;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  mode: GameMode;
  level: TrainingLevel;
  difficulty: number;
  objectives: string[];
  requiredConnections: { from: string; to: string; signal: "video" | "audio" | "data" | "power" }[];
  allowedEquipment: string[];
  distractorEquipment: string[];
  rewards: { experience: number };
  timeLimit: number | null;
  hintsEnabled: boolean;
}

export interface MissionStory {
  id: string;
  title: string;
  narrative: string[];
  technicalMissionId: string;
  level: TrainingLevel;
  cable: "HDMI";
  equipment: string[];
}

export interface MissionAssignment {
  playerId: string;
  storyId: string;
  offeredAt: string;
  acceptedAt: string | null;
}
