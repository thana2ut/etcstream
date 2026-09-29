import type { GameMode, Player, TrainingLevel } from "@/game/types";
import { validateNickname } from "@/game/security/nickname-validation";

export interface PlayerRepository {
  loadPlayer(): Player | null;
  savePlayer(player: Player): boolean;
  clearPlayer(): boolean;
}

const STORAGE_KEY = "streamlab-player-v1";
const BACKUP_NAME_KEY = "streamlab_nickname";
const VALID_MODES: GameMode[] = ["classroom", "challenge", "exam"];
const VALID_LEVELS: TrainingLevel[] = ["S", "M", "L", "XL"];

function generatePlayerId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "SL-" + Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function normalizePlayer(value: unknown, backupNickname: string | null = null): Player | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Record<string, unknown>;
  const rawNickname = validateNickname(p.nickname) ?? validateNickname(backupNickname);
  if (!rawNickname) return null;

  const now = new Date().toISOString();
  const playerId = typeof p.playerId === "string" && /^SL-[A-Z0-9]{6}$/.test(p.playerId)
    ? p.playerId
    : generatePlayerId();

  const createdAt = typeof p.createdAt === "string" && !Number.isNaN(Date.parse(p.createdAt))
    ? p.createdAt
    : now;

  const lastPlayedAt = typeof p.lastPlayedAt === "string" && !Number.isNaN(Date.parse(p.lastPlayedAt))
    ? p.lastPlayedAt
    : now;

  const currentMode: GameMode = VALID_MODES.includes(p.currentMode as GameMode)
    ? (p.currentMode as GameMode)
    : "classroom";

  const currentLevel: TrainingLevel = VALID_LEVELS.includes(p.currentLevel as TrainingLevel)
    ? (p.currentLevel as TrainingLevel)
    : "S";

  return {
    playerId,
    nickname: rawNickname,
    createdAt,
    lastPlayedAt,
    currentMode,
    currentLevel,
  };
}

export class LocalStoragePlayerRepository implements PlayerRepository {
  loadPlayer(): Player | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const backupName = window.localStorage.getItem(BACKUP_NAME_KEY);
      if (raw) {
        let parsed: unknown = null;
        try { parsed = JSON.parse(raw); } catch { /* Recover the backup name below. */ }
        const player = normalizePlayer(parsed, backupName);
        if (player) {
          // Keep backup nickname in sync
          try { window.localStorage.setItem(BACKUP_NAME_KEY, player.nickname); } catch { /* Read-only storage is usable. */ }
          return player;
        }
      }

      // Fallback: check backup nickname key
      const validBackup = validateNickname(backupName);
      if (validBackup) {
        const restored = createPlayer(validBackup);
        this.savePlayer(restored);
        return restored;
      }

      return null;
    } catch {
      return null;
    }
  }

  savePlayer(player: Player): boolean {
    if (typeof window === "undefined") return false;
    try {
      const normalized = normalizePlayer(player);
      if (!normalized) return false;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      try { window.localStorage.setItem(BACKUP_NAME_KEY, normalized.nickname); } catch { /* Primary record is saved. */ }
      return true;
    } catch {
      return false;
    }
  }

  clearPlayer(): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(BACKUP_NAME_KEY);
      return true;
    } catch {
      return false;
    }
  }
}

export const playerRepository = new LocalStoragePlayerRepository();

export function createPlayer(nickname: string): Player {
  const validNickname = validateNickname(nickname);
  if (!validNickname) throw new Error("Invalid player nickname");
  const playerId = generatePlayerId();
  const now = new Date().toISOString();
  return {
    playerId,
    nickname: validNickname,
    createdAt: now,
    lastPlayedAt: now,
    currentMode: "classroom",
    currentLevel: "S",
  };
}
