import { portAvailable, requirementDone, scenarioOf, type TrainingState } from "./hdmi-training";

const inputs = ["monitor:hdmi-in", "monitor:hdmi-in2", "monitor:hdmi-in3"] as const;

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
