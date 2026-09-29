/** Hooks for future interaction sounds. A browser audio implementation must start after a user gesture. */
export type AcademyAudioCue =
  | "intro_open"
  | "seal_open"
  | "name_inscribed"
  | "academy_enter"
  | "mission_reveal"
  | "mission_accept"
  | "connection_success"
  | "connection_error"
  | "mission_complete";

export interface AcademyAudioPlayer {
  play(cue: AcademyAudioCue): void;
}
