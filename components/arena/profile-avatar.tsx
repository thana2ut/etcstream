"use client";
import Image from "next/image";

export type AvatarParts = { avatar?: string | null; frame?: string | null; name?: string };
/** Circular portrait (clipped) with the separately equipped frame overlaid; falls back to built-in art. */
export function ProfileAvatar({ avatar, frame, name, size = 40, className }: AvatarParts & { size?: number; className?: string }) {
  return <span className={`profile-avatar${frame ? " has-frame" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size }} role={name ? "img" : undefined} aria-label={name ? `ภาพโปรไฟล์ของ ${name}` : undefined} aria-hidden={name ? undefined : true}>
    <span className="profile-avatar-face">
      {avatar ? <Image src={avatar} alt="" fill sizes={`${size * 2}px`} /> : <Image src="/assets/arena/icon-profile.png" alt="" fill sizes={`${size * 2}px`} className="is-default" />}
    </span>
    {frame && <Image className="profile-avatar-frame" src={frame} alt="" fill sizes={`${Math.round(size * 2.6)}px`} />}
  </span>;
}
