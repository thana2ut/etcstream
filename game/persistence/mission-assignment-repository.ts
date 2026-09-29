import { getMissionStory, missionStories } from "@/game/missions/stories";
import type { MissionAssignment } from "@/game/types";

interface AssignmentRecord {
  version: 1;
  playerId: string;
  current: MissionAssignment | null;
  recentStoryIds: string[];
}

export interface MissionAssignmentRepository {
  load(playerId: string): AssignmentRecord;
  offer(playerId: string): MissionAssignment | null;
  accept(playerId: string): MissionAssignment | null;
  next(playerId: string): MissionAssignment | null;
}

const key = (playerId: string) => `streamlab-assignment-v1:${playerId}`;
const empty = (playerId: string): AssignmentRecord => ({ version: 1, playerId, current: null, recentStoryIds: [] });

function validAssignment(value: unknown, playerId: string): value is MissionAssignment {
  if (!value || typeof value !== "object") return false;
  const assignment = value as Record<string, unknown>;
  return assignment.playerId === playerId && typeof assignment.storyId === "string" && Boolean(getMissionStory(assignment.storyId))
    && typeof assignment.offeredAt === "string" && !Number.isNaN(Date.parse(assignment.offeredAt))
    && (assignment.acceptedAt === null || (typeof assignment.acceptedAt === "string" && !Number.isNaN(Date.parse(assignment.acceptedAt))));
}

export class LocalStorageMissionAssignmentRepository implements MissionAssignmentRepository {
  load(playerId: string): AssignmentRecord {
    try {
      const raw = window.localStorage.getItem(key(playerId));
      if (!raw) return empty(playerId);
      const value: unknown = JSON.parse(raw);
      if (!value || typeof value !== "object") return empty(playerId);
      const record = value as Record<string, unknown>;
      if (record.version !== 1 || record.playerId !== playerId) return empty(playerId);
      const current = validAssignment(record.current, playerId) ? record.current : null;
      const recentStoryIds = Array.isArray(record.recentStoryIds) ? record.recentStoryIds.filter((id): id is string => typeof id === "string" && Boolean(getMissionStory(id))).slice(-3) : [];
      return { version: 1, playerId, current, recentStoryIds };
    } catch { return empty(playerId); }
  }

  private save(record: AssignmentRecord): boolean {
    try { window.localStorage.setItem(key(record.playerId), JSON.stringify(record)); return true; }
    catch { return false; }
  }

  offer(playerId: string): MissionAssignment | null {
    const record = this.load(playerId);
    if (record.current) return record.current;
    return this.next(playerId);
  }

  next(playerId: string): MissionAssignment | null {
    const record = this.load(playerId);
    const candidates = missionStories.filter((story) => !record.recentStoryIds.includes(story.id));
    const pool = candidates.length ? candidates : missionStories;
    const index = crypto.getRandomValues(new Uint32Array(1))[0] % pool.length;
    const current: MissionAssignment = { playerId, storyId: pool[index].id, offeredAt: new Date().toISOString(), acceptedAt: null };
    const updated: AssignmentRecord = { ...record, current, recentStoryIds: [...record.recentStoryIds, current.storyId].slice(-3) };
    return this.save(updated) ? current : null;
  }

  accept(playerId: string): MissionAssignment | null {
    const record = this.load(playerId);
    if (!record.current) return null;
    const current = { ...record.current, acceptedAt: record.current.acceptedAt ?? new Date().toISOString() };
    return this.save({ ...record, current }) ? current : null;
  }
}

export const missionAssignmentRepository = new LocalStorageMissionAssignmentRepository();
