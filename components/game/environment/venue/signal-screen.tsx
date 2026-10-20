"use client";

import { SceneText as Text } from "@/components/game/scene-text";


import { useTrainingStore } from "@/game/stores/training-store";
import { venueScreenFeed } from "@/game/training/monitor-feed";
import { SCENE_FONT, sceneText } from "@/game/rendering/scene-font";

/** An architectural repeater of a playable destination; never a baked successful feed. */
export function SignalScreen({ device, width, height, title = "สัญญาณจำลอง" }: { device: string; width: number; height: number; title?: string }) {
  const feed = useTrainingStore((state) => venueScreenFeed(state, device));
  return <group>
    <mesh><planeGeometry args={[width, height]} /><meshBasicMaterial color="#091321" toneMapped={false} /></mesh>
    <Text font={SCENE_FONT} position={[0, height * 0.32, 0.005]} fontSize={Math.min(width * 0.045, height * 0.13)} color="#86b5cc" maxWidth={width * 0.9} textAlign="center">{sceneText(title)}</Text>
    <Text font={SCENE_FONT} position={[0, -height * 0.06, 0.006]} fontSize={Math.min(width * 0.07, height * 0.19)} color="#e5edf4" maxWidth={width * 0.9} textAlign="center">{sceneText(feed)}</Text>
  </group>;
}
