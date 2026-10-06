"use client";

import { Billboard, Text } from "@react-three/drei";
import type { DeviceDef } from "@/game/training/scenarios";
import { GlbModel, Hcx2000Model } from "./hc-x2000";
import { GenericDevice } from "./generic-device";

const ROOM_FONT = "/fonts/geist-regular.ttf";

function Box({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={scale} /><meshStandardMaterial color={color} metalness={0.15} roughness={0.5} /></mesh>;
}

/** Placeholder body + name/model label for a studio device (model marked when unverified). Drawn at its own origin. */
/** Floating name plate: always faces the player, centred over the device (model on top, role below). */
export function DeviceLabel({ device, y }: { device: Pick<DeviceDef, "label" | "model">; y: number }) {
  return <Billboard position={[0, y, 0]}>
    <Text font={ROOM_FONT} fontSize={0.055} color="#f6ddaa" anchorX="center" anchorY="bottom" textAlign="center" outlineWidth={0.004} outlineColor="#000">
      {device.model || device.label}
    </Text>
    {device.model && <Text font={ROOM_FONT} position={[0, -0.012, 0]} fontSize={0.034} color="#8be4f4" anchorX="center" anchorY="top" textAlign="center" outlineWidth={0.003} outlineColor="#000">
      {device.label}
    </Text>}
  </Billboard>;
}

/** `bare` hides the floating name label (used in the inspector). */
export function DeviceVisual({ device, bare = false }: { device: DeviceDef; bare?: boolean }) {
  const [w, h, d] = device.size;
  if (device.generic) return <GenericDevice device={device} bare={bare} />;
  if (device.kind === "camera") {
    return <group>
      <Hcx2000Model />
      {!bare && <DeviceLabel device={device} y={1.72} />}
    </group>;
  }
  if (device.kind === "mixer") {
    return <group>
      <GlbModel url="/models/equipment/pmx402d.glb" fallback={<Box position={[0, h / 2, 0]} scale={[w, h, d]} color={device.color} />} />
      {!bare && <DeviceLabel device={device} y={h + 0.16} />}
    </group>;
  }
  if (device.id === "speaker" && device.model === "Yamaha HS5") {
    return <group>
      <GlbModel url="/models/equipment/yamaha-hs5.glb" fallback={<Box position={[0, h / 2, 0]} scale={[w, h, d]} color={device.color} />} />
      {!bare && <DeviceLabel device={device} y={h + 0.16} />}
    </group>;
  }
  if (device.id === "capture") {
    return <group>
      <group scale={3.2}>
        <GlbModel url="/models/equipment/magewell-capture.glb" fallback={<Box position={[0, h / 6.4, 0]} scale={[w / 3.2, h / 3.2, d / 3.2]} color={device.color} />} />
      </group>
      {!bare && <DeviceLabel device={device} y={h + 0.14} />}
    </group>;
  }
  if ((device.id === "rx" || device.id === "tx1" || device.id === "tx2") && device.model?.startsWith("COMICA WM100 PLUS")) {
    return <group>
      <GlbModel url={`/models/equipment/comica-wm100-plus-${device.id === "rx" ? "rx" : "tx"}.glb`} fallback={<Box position={[0, h / 3, 0]} scale={[w, h * 0.64, d]} color={device.color} />} />
      {!bare && <DeviceLabel device={device} y={h + 0.13} />}
    </group>;
  }
  if (device.kind === "mic") {
    if (device.id === "mic" && device.model?.startsWith("Sennheiser XS 1")) {
      return <group>
        <GlbModel url="/models/equipment/sennheiser-xs1.glb" fallback={<Box position={[0, h / 2, 0]} scale={[w, h, d]} color={device.color} />} />
        {!bare && <DeviceLabel device={device} y={h + 0.17} />}
      </group>;
    }
    return <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.03, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.018, 0.012, 0.2, 12]} /><meshStandardMaterial color={device.color} metalness={0.4} roughness={0.5} /></mesh>
      <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.028, 14, 12]} /><meshStandardMaterial color="#555a60" metalness={0.7} roughness={0.35} /></mesh>
      <group rotation={[0, 0, -Math.PI / 2]}>{!bare && <DeviceLabel device={device} y={0.1} />}</group>
    </group>;
  }
  if (device.kind === "laptop") {
    const scale = w / 0.358;
    return <group>
      <group scale={scale}>
        <GlbModel
          url="/models/equipment/hp-laptop.glb"
          fallback={<group>
            <Box position={[0, h / (2 * scale), 0]} scale={[w / scale, h / scale, d / scale]} color={device.color} />
            <group position={[0, h / scale, -d / (2 * scale)]} rotation={[-0.25, 0, 0]}>
              <Box position={[0, 0.17 / scale, 0]} scale={[w / scale, 0.34 / scale, 0.02 / scale]} color={device.color} />
            </group>
          </group>}
        />
      </group>
      {!bare && <DeviceLabel device={device} y={0.52} />}
    </group>;
  }
  return <group>
    <Box position={[0, h / 2, 0]} scale={[w, h, d]} color={device.color} />
    {device.kind === "bodypack" && <mesh position={[-w / 3, h + 0.08, 0]}><cylinderGeometry args={[0.006, 0.006, 0.16, 6]} /><meshStandardMaterial color="#0a0a0a" /></mesh>}
    {!bare && <DeviceLabel device={device} y={h + (device.kind === "bodypack" ? 0.24 : 0.18)} />}
  </group>;
}

