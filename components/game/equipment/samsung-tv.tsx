"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { GlbModel } from "./hc-x2000";

function drawCamera(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, active: boolean) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, active ? "#18334d" : "#101a29");
  gradient.addColorStop(1, active ? "#5d3a5f" : "#18202c");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = active ? "#234657" : "#192331";
  ctx.fillRect(x, y + h * .72, w, h * .28);
  if (active) {
    ctx.fillStyle = "#547386";
    ctx.fillRect(x + w * .34, y + h * .26, w * .32, h * .39);
    ctx.fillStyle = "#d5a57f";
    ctx.beginPath();
    ctx.ellipse(x + w * .5, y + h * .28, w * .085, h * .13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222e37";
    ctx.fillRect(x + w * .28, y + h * .7, w * .44, h * .07);
  }
  ctx.strokeStyle = active ? "#6db5d2" : "#344150";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
}

function screenTexture(feed: string): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const [mode, input, camera] = feed.split("|");
  if (mode === "off") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#060a10";
  ctx.fillRect(0, 0, 1280, 720);
  ctx.font = "bold 29px Arial, sans-serif";
  ctx.fillStyle = "#e6edf3";
  ctx.fillText(mode === "multiview" ? "MULTIVIEW" : "PROGRAM", 30, 43);
  ctx.font = "22px Arial, sans-serif";
  ctx.fillStyle = "#b8c7d5";
  ctx.fillText(`HDS7105  •  HDMI ${input}`, 970, 42);
  const active = camera === "camera";
  if (mode === "multiview") {
    const tiles = [[24, 70], [650, 70], [24, 382], [650, 382]];
    tiles.forEach(([x, y], index) => {
      drawCamera(ctx, x, y, 606, 278, active && index === 0);
      ctx.fillStyle = "#070b12";
      ctx.fillRect(x + 8, y + 8, 185, 36);
      ctx.fillStyle = index === 0 && active ? "#d9f4ff" : "#9eaeba";
      ctx.font = "bold 23px Arial, sans-serif";
      ctx.fillText(`CAM ${index + 1}`, x + 20, y + 34);
      if (index !== 0 || !active) {
        ctx.font = "22px Arial, sans-serif";
        ctx.fillText("NO INPUT", x + 236, y + 150);
      }
    });
    ctx.strokeStyle = "#e55b60";
    ctx.lineWidth = 7;
    ctx.strokeRect(25, 71, 604, 276);
  } else {
    drawCamera(ctx, 24, 70, 1232, 590, active);
    ctx.strokeStyle = "#e45d61";
    ctx.lineWidth = 8;
    ctx.strokeRect(26, 72, 1228, 586);
    ctx.fillStyle = "#0b111a";
    ctx.fillRect(44, 575, 520, 64);
    ctx.fillStyle = "#f4f7fa";
    ctx.font = "bold 34px Arial, sans-serif";
    ctx.fillText(active ? "CAM 1  •  PROGRAM" : "NO CAMERA INPUT", 65, 619);
  }
  ctx.fillStyle = "#e35c61";
  ctx.fillRect(30, 683, 56, 12);
  ctx.fillStyle = "#d6e1e9";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("PRODUCTION MONITOR", 101, 696);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Television body without retail feet: the room's existing production stand stays in place. */
export function SamsungTv({ feed = "off|0|empty", interactive = false }: { feed?: string; interactive?: boolean }) {
  const texture = useMemo(() => screenTexture(feed), [feed]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return <group>
    <GlbModel url="/models/equipment/samsung-u8000f.glb" fallback={<mesh><boxGeometry args={[1, .588, .046]} /><meshStandardMaterial color="#171a1d" /></mesh>} />
    <mesh position={[0, .003, .017]}>
      <planeGeometry args={[.958, .532]} />
      {texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : <meshStandardMaterial color="#04070c" metalness={.22} roughness={.18} />}
    </mesh>
    {interactive && <mesh position={[0, 0, .026]} userData={{ trainingTarget: { kind: "device", deviceId: "monitor" } }}>
      <planeGeometry args={[.99, .58]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>;
}
