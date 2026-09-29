import { create } from "zustand";
import { playerRepository } from "@/game/persistence/player-repository";
import { missionAssignmentRepository } from "@/game/persistence/mission-assignment-repository";
import { missionProgressRepository, type MissionProgressRecord } from "@/game/persistence/mission-progress-repository";
import { missionChapters } from "@/game/content/mission-catalog";
import { missionS001 } from "@/game/missions/mission-s-001";
import type { GameMode, MissionState, Player } from "@/game/types";

function loadProgress(playerId: string): MissionProgressRecord {
  const progress = missionProgressRepository.load(playerId);
  if (progress.selected) return progress;
  const legacy = missionAssignmentRepository.load(playerId).current;
  if (legacy?.acceptedAt) {
    return missionProgressRepository.select(playerId, missionChapters[0].slug, 1) ?? progress;
  }
  return progress;
}

interface AcademyState {
  hydrated: boolean;
  player: Player | null;
  selectedMissionId: string | null;
  progress: MissionProgressRecord | null;
  progressError: string;
  missionState: MissionState;
  hydrate: () => void;
  setPlayer: (player: Player) => boolean;
  clearPlayer: () => boolean;
  selectMode: (mode: GameMode) => boolean;
  selectMission: (slug: string, level: number) => boolean;
  startMission: () => void;
  completeMission: () => void;
}

export const useAcademyStore = create<AcademyState>((set, get) => ({
  hydrated: false, player: null, selectedMissionId: null, progress: null, progressError: "", missionState: "ready",
  hydrate: () => {
    if (typeof window === "undefined") return;
    const player = playerRepository.loadPlayer();
    const returningPlayer = player ? { ...player, lastPlayedAt: new Date().toISOString() } : null;
    if (returningPlayer) playerRepository.savePlayer(returningPlayer);
    set({
      hydrated: true, player: returningPlayer,
      progress: returningPlayer ? loadProgress(returningPlayer.playerId) : null,
      selectedMissionId: returningPlayer ? missionS001.id : null,
      progressError: "",
    });
  },
  setPlayer: (player) => {
    if (!playerRepository.savePlayer(player)) return false;
    set({ hydrated: true, player, progress: loadProgress(player.playerId), selectedMissionId: missionS001.id, missionState: "ready", progressError: "" });
    return true;
  },
  clearPlayer: () => {
    if (!playerRepository.clearPlayer()) return false;
    set({ player: null, progress: null, selectedMissionId: null, missionState: "ready", progressError: "" });
    return true;
  },
  selectMode: (mode) => {
    const player = get().player;
    if (!player || (mode !== "classroom" && mode !== "challenge") || (mode === "challenge" && !get().progress?.selected)) return false;
    const updated = { ...player, currentMode: mode, lastPlayedAt: new Date().toISOString() };
    if (!playerRepository.savePlayer(updated)) return false;
    set({ player: updated, selectedMissionId: missionS001.id, missionState: "ready" });
    return true;
  },
  selectMission: (slug, level) => {
    const player = get().player;
    if (!player) return false;
    const progress = missionProgressRepository.select(player.playerId, slug, level);
    if (!progress) return false;
    const updated = { ...player, currentMode: "challenge" as const, lastPlayedAt: new Date().toISOString() };
    if (!playerRepository.savePlayer(updated)) return false;
    set({ player: updated, progress, selectedMissionId: missionS001.id, missionState: "ready", progressError: "" });
    return true;
  },
  startMission: () => set({ missionState: "in-progress" }),
  completeMission: () => {
    const { player, progress } = get();
    const selected = progress?.selected;
    if (player?.currentMode === "challenge" && selected) {
      const updated = missionProgressRepository.complete(player.playerId, selected.slug, selected.difficulty);
      set({ missionState: "completed", progress: updated ?? progress, progressError: updated ? "" : "บันทึกความคืบหน้าไม่ได้ โปรดตรวจการตั้งค่าเบราว์เซอร์" });
    } else {
      set({ missionState: "completed", progressError: "" });
    }
  },
}));
