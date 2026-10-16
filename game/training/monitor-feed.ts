import { portAvailable, requirementDone, scenarioOf, simContext, type TrainingState } from "./hdmi-training";

const inputs = ["monitor:hdmi-in", "monitor:hdmi-in2", "monitor:hdmi-in3"] as const;

/** Mission studio control-room repeaters: simulated switcher status read from the real signal graph. */
export function studioSignalFeed(state: TrainingState, channel: "program" | "inputs" | "recording" | "audio"): string {
  const ctx = simContext(state);
  if (!ctx || scenarioOf(state).layout !== "studioMission") return "STUDIO SIM\nOFFLINE";
  const sw = ctx.view.sw;
  if (channel === "inputs") {
    const names = ["CAM-A", "CAM-B", "CAM-C"];
    const present = (sw as { inputs?: string[] } | undefined)?.inputs ?? [];
    return `INPUTS | SIM\n${names.map((n) => `${n}: ${present.some((x) => x.startsWith(n)) ? "READY" : "NO INPUT"}`).join("\n")}`;
  }
  if (channel === "audio") return `AUDIO | SIM\n${sw?.audio?.length ? sw.audio.join(" + ") : "NO PROGRAM AUDIO"}`;
  if (channel === "recording") {
    const live = ctx.view.wan?.live, rec = ctx.view.ssd?.recording;
    return `REC / STREAM | SIM\n${live || rec ? `${rec ? "REC ●" : "REC —"}  ${live ? "STREAM LIVE" : "STREAM —"}` : "NOT READY"}`;
  }
  return `PGM | SIM\n${sw?.powered && sw.picture && sw.picture !== "BLACK" ? sw.picture : "NO PROGRAM"}`;
}

/** Is this destination showing a real picture right now? */
export function venueScreenLive(state: TrainingState, deviceId: string): boolean {
  const ctx = simContext(state);
  if (ctx) { const v = ctx.view[deviceId]; return Boolean(v?.powered && v.picture && v.picture !== "BLACK"); }
  return legacyFeed(state, deviceId).startsWith("PROGRAM") || legacyFeed(state, deviceId) === "MULTIVIEW";
}

/** Venue displays show exactly what their selected physical input carries (simulated picture), or why not. */
export function venueScreenFeed(state: TrainingState, deviceId: string): string {
  const ctx = simContext(state);
  if (!ctx) return legacyFeed(state, deviceId);
  const v = ctx.view[deviceId];
  if (!v) return "NOT USED IN THIS JOB";
  if (!v.powered) return "POWER OFF";
  if (v.picture && v.picture !== "BLACK") return v.picture.startsWith("MULTIVIEW") ? v.picture.replace(" [", "\n").replace("]", "").replace(/ \| /g, " · ") : `PROGRAM\n${v.picture}`;
  return v.picture === "BLACK" ? "BLACK" : v.status.startsWith("NO SIGNAL") ? v.status.replace(" (", "\n(") : "NO SIGNAL";
}

/** Pre-simulation behaviour (free-practice rooms only). */
function legacyFeed(state: TrainingState, deviceId: string): string {
  const scenario = scenarioOf(state);
  for (const cable of Object.values(state.cables)) {
    const ends = [cable.a.portId, cable.b.portId];
    const input = ends.find((id) => id && scenario.ports[id]?.device === deviceId && scenario.ports[id].direction === "INPUT");
    if (!input) continue;
    const output = ends.find((id) => id !== input);
    if (!output) return "NO SIGNAL";
    const route = scenario.requirements.find((r) => r.to.includes(input) && r.from.includes(output));
    if (!route || !requirementDone(state, route)) return "WRONG FEED\nCHECK SOURCE";
    if (output.includes("multiview")) return "MULTIVIEW";
    return state.programSource ? `PROGRAM ACTIVE\n${state.programSource.toUpperCase()}` : "NO PROGRAM\nSELECTED";
  }
  return "NO SIGNAL";
}

/** Stable value for the TV renderer: mode | selected HDMI | camera input present. */
export function monitorFeed(state: TrainingState): string {
  const scenario = scenarioOf(state);
  const outputs = scenario.id === "hdmi-basic" ? ["switcher:hdmi-out"] : ["sw:multiview", "sw:pgm"];
  const cameraRequirement = scenario.requirements.find((requirement) => requirement.id === (scenario.id === "hdmi-basic" ? "camera-switcher" : "cam1"));
  const cameraReady = Boolean(cameraRequirement && requirementDone(state, cameraRequirement));

  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index];
    for (const cable of Object.values(state.cables)) {
      const output = cable.a.portId === input ? cable.b.portId : cable.b.portId === input ? cable.a.portId : null;
      if (!output || !outputs.includes(output) || !portAvailable(state, output)) continue;
      const mode = output === "sw:multiview" ? "multiview" : "program";
      return `${mode}|${index + 1}|${cameraReady ? "camera" : "empty"}`;
    }
  }
  return "off|0|empty";
}
