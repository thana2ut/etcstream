"use client";
import { useState } from "react";
import Image from "next/image";
import { STARTER_ASSETS } from "@/game/content/economy-catalog";

export type AvatarParts = { avatar?: string | null; frame?: string | null; name?: string };
/**
 * Circular portrait (clipped) under a separately rendered frame. Each layer falls back on its own to the
 * V22 starter art when it is missing, empty, legacy-broken or fails to load (never a broken-image icon).
 */
export function ProfileAvatar({ avatar, frame, name, size = 40, className }: AvatarParts & { size?: number; className?: string }) {
  const [badAvatar, setBadAvatar] = useState<string | null>(null), [badFrame, setBadFrame] = useState<string | null>(null);
  const face = avatar && avatar !== badAvatar ? avatar : STARTER_ASSETS.avatar;
  const ring = frame && frame !== badFrame ? frame : STARTER_ASSETS.frame;
  return <span className={`profile-avatar has-frame${className ? ` ${className}` : ""}`} style={{ width: size, height: size }} role={name ? "img" : undefined} aria-label={name ? `ภาพโปรไฟล์ของ ${name}` : undefined} aria-hidden={name ? undefined : true}>
    <span className="profile-avatar-face">
      <Image src={face} alt="" fill sizes={`${size * 2}px`} onError={() => { if (face !== STARTER_ASSETS.avatar) setBadAvatar(face); }} />
    </span>
    <Image className="profile-avatar-frame" src={ring} alt="" fill sizes={`${Math.round(size * 2.6)}px`} onError={() => { if (ring !== STARTER_ASSETS.frame) setBadFrame(ring); }} />
  </span>;
}
