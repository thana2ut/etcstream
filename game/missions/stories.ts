import type { MissionStory } from "@/game/types";
import { missionCopy } from "@/game/content/mission-copy";
import { missionS001 } from "./mission-s-001";

export const missionStories: readonly MissionStory[] = [
  {
    id: "S_STORY_01", ...missionCopy.stories[0], narrative: [...missionCopy.stories[0].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
  {
    id: "S_STORY_02", ...missionCopy.stories[1], narrative: [...missionCopy.stories[1].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
  {
    id: "S_STORY_03", ...missionCopy.stories[2], narrative: [...missionCopy.stories[2].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
  {
    id: "S_STORY_04", ...missionCopy.stories[3], narrative: [...missionCopy.stories[3].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
  {
    id: "S_STORY_05", ...missionCopy.stories[4], narrative: [...missionCopy.stories[4].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
  {
    id: "S_STORY_06", ...missionCopy.stories[5], narrative: [...missionCopy.stories[5].narrative],
    technicalMissionId: missionS001.id, level: "S", cable: "HDMI", equipment: [...missionCopy.equipment],
  },
];

export function getMissionStory(id: string): MissionStory | null {
  return missionStories.find((story) => story.id === id) ?? null;
}

export function storyLines(story: MissionStory, nickname: string): string[] {
  return story.narrative.map((line) => line.replaceAll("{nickname}", nickname));
}
