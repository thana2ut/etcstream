export type PlayAudioPhase = "intro" | "gameplay" | "result";
export type SoundtrackId = "landing" | "academy" | "missions" | "result";

export const SOUNDTRACKS: Record<SoundtrackId, string> = {
  landing: "/audio/bgm/fantasy-ambient.mp3",
  academy: "/audio/bgm/mystic-fantasy-ambience.mp3",
  missions: "/audio/bgm/caves-of-dawn.mp3",
  result: "/audio/bgm/fantasy-quest.mp3",
};

export function soundtrackForRoute(pathname: string, phase: PlayAudioPhase): {
  id: SoundtrackId;
  gain: number;
} {
  if (pathname.startsWith("/missions")) return { id: "missions", gain: 1 };
  if (pathname.startsWith("/academy")) return { id: "academy", gain: 1 };
  if (pathname.startsWith("/play")) {
    if (phase === "result") return { id: "result", gain: 1 };
    return { id: "academy", gain: phase === "gameplay" ? 0.65 : 1 };
  }
  return { id: "landing", gain: 1 };
}
