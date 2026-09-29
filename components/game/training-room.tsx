"use client";

import { Text } from "@react-three/drei";
import { StudioRoom01 } from "./environment/studio-room-01";
import { STUDIO } from "@/game/training/studio-room-layout";
import { HdmiCables } from "./hdmi-cables";
import { HDMI_PORTS, type PortId } from "@/game/training/hdmi-training";
import { useTrainingStore } from "@/game/stores/training-store";
import { PlaceableEquipment } from "./placeable-equipment";

const ROOM_FONT = "/fonts/geist-regular.ttf";

function Box({ position, scale, color, metalness = 0.15 }: { position: [number, number, number]; scale: [number, number, number]; color: string; metalness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={scale} /><meshStandardMaterial color={color} metalness={metalness} roughness={0.5} /></mesh>;
}

function Port({ id, color }: { id: PortId; color: string }) {
  const port = HDMI_PORTS[id];
  return <group position={port.position}>
    <mesh><boxGeometry args={[0.25, 0.11, 0.08]} /><meshStandardMaterial color="#091320" metalness={0.65} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.046]}><boxGeometry args={[0.18, 0.045, 0.012]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} /></mesh>
    <mesh userData={{ trainingTarget: { kind: "port", portId: id } }}>
      <sphereGeometry args={[0.2, 12, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    <Text font={ROOM_FONT} position={[0, 0.13, 0.07]} fontSize={0.065} color="#d5edf0" anchorX="center">{port.direction === "INPUT" ? "HDMI IN" : "HDMI OUT"}</Text>
  </group>;
}

export function TrainingRoom() {
  const completed = useTrainingStore((state) => state.completed);
  return <>
    <StudioRoom01 />
    <group position={STUDIO.equipment.camera} scale={0.6}>
    <mesh position={[-0.28, -1.25, 0.18]} rotation={[0, 0, -0.18]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0.28, -1.25, 0.18]} rotation={[0, 0, 0.18]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <mesh position={[0, -1.25, -0.28]} rotation={[0.18, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 1.7, 10]} /><meshStandardMaterial color="#10151b" metalness={0.7} roughness={0.35} /></mesh>
    <Box position={[0, 0, 0]} scale={[0.95, 0.28, 0.65]} color="#1b2638" />
    <mesh position={[0, 0.23, -0.25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.25, 0.3, 0.55, 20]} /><meshStandardMaterial color="#233b52" metalness={0.65} roughness={0.3} /></mesh>
    <mesh position={[0, 0.23, -0.54]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.08, 20]} /><meshStandardMaterial color="#101622" metalness={0.8} roughness={0.2} /></mesh>
    <Text font={ROOM_FONT} position={[0, 0.57, 0]} fontSize={0.13} color="#94edfa" anchorX="center">CAMERA</Text>
    </group>
    <Port id="camera:hdmi-out" color="#e9bd6a" />
    <group position={STUDIO.equipment.switcher} scale={0.7}>
    <Box position={[0, 0, 0]} scale={[1.15, 0.32, 0.75]} color="#25374a" metalness={0.45} />
    <Text font={ROOM_FONT} position={[0, 0.5, 0]} fontSize={0.1} color="#67eaf1">VIDEO SWITCHER</Text>
    </group>
    <Port id="switcher:hdmi-in" color="#e9bd6a" />
    <Port id="switcher:hdmi-out" color="#53e3ef" />
    <group position={STUDIO.equipment.monitor} scale={0.7}>
    <Box position={[0, 0, 0]} scale={[1.45, 0.92, 0.12]} color="#15263c" metalness={0.5} />
    <Box position={[0, 0, 0.07]} scale={[1.3, 0.76, 0.03]} color={completed ? "#0d5d66" : "#15445e"} />
    <Text font={ROOM_FONT} position={[0, 0.01, 0.1]} fontSize={0.14} color="#91f7fd">{completed ? "SIGNAL ACTIVE" : "NO SIGNAL"}</Text>
    <Box position={[0, -0.56, 0]} scale={[0.08, 0.27, 0.12]} color="#23364d" />
    </group>
    <Port id="monitor:hdmi-in" color="#53e3ef" />
    <PlaceableEquipment />
    <HdmiCables />
  </>;
}
