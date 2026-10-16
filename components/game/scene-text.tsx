"use client";

import { Text } from "@react-three/drei";
import { useState, type ComponentProps } from "react";
import { Billboard } from "@react-three/drei";
import { SCENE_FONT, SCENE_TYPE, sceneText } from "@/game/rendering/scene-font";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf } from "@/game/training/hdmi-training";

/** Clear air between the top of the equipment body and the lowest nameplate line. */
export const NAMEPLATE_CLEARANCE = 0.08;

/** Shared shaping/spacing for physical signs, screens and labels; preserve world anchors. */
export function SceneText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text lineHeight={SCENE_TYPE.helpText.lineHeight} letterSpacing={0} outlineWidth={0.001} outlineColor="#081222" {...props} font={SCENE_FONT}>
    {typeof children === "string" ? sceneText(children) : children}
  </Text>;
}

/** Both lines grow upwards from the existing anchor, away from the equipment body. */
export function EquipmentNameplate({ title, subtitle, y, deviceId }: { title: string; subtitle?: string; y: number; deviceId?: string }) {
  const [subtitleHeight, setSubtitleHeight] = useState(0.08);
  // Label priority: while one of this device's ports is targeted its port tag speaks; the nameplate steps aside.
  const portFocused = useTrainingStore((state) => {
    const t = state.focusedTarget;
    return Boolean(deviceId && t?.kind === "port" && scenarioOf(state).ports[t.portId]?.device === deviceId);
  });
  if (portFocused) return null;
  return <Billboard position={[0, y + NAMEPLATE_CLEARANCE, 0]}>
    <SceneText {...SCENE_TYPE.equipmentTitle} position={[0, subtitle ? subtitleHeight + 0.04 : 0, 0]} anchorX="center" anchorY="bottom" textAlign="center">{title}</SceneText>
    {subtitle && <SceneText key={subtitle} {...SCENE_TYPE.equipmentSubtitle} anchorX="center" anchorY="bottom" textAlign="center" onSync={(mesh) => {
      const bounds = mesh.textRenderInfo?.blockBounds;
      if (bounds) setSubtitleHeight(Math.max(0.08, bounds[3] - bounds[1]));
    }}>{subtitle}</SceneText>}
  </Billboard>;
}
