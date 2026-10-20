import Image from "next/image";
import { SEASON_RULES_V1 } from "@/game/content/arena-ranked-rules";

// Presentation-only lookup keyed by the existing tier names in SEASON_RULES_V1 (scoring stays server-side).
export const rankIconByTier: Record<string, string> = {
  "ศิษย์แรกเริ่ม": "/assets/arena/ranks/rank-01-novice.png",
  "ผู้ฝึกปราณ": "/assets/arena/ranks/rank-02-apprentice.png",
  "กระบี่เงิน": "/assets/arena/ranks/rank-03-silver.png",
  "กระบี่ทอง": "/assets/arena/ranks/rank-04-gold.png",
  "ปรมาจารย์สัญญาณ": "/assets/arena/ranks/rank-05-master.png",
  "เซียนกระบี่สวรรค์": "/assets/arena/ranks/rank-06-celestial.png",
};
// For rows that only carry a score (public hall), read the tier from the same shared thresholds.
export const tierForScore = (score: number) => [...SEASON_RULES_V1.tiers].reverse().find((t) => score >= t.min)!.name;

export function RankBadge({ tier, size = 40, decorative = false, current = false }: { tier: string; size?: number; decorative?: boolean; current?: boolean }) {
  const src = rankIconByTier[tier];
  if (!src) return null;
  return <span className={`arena-rank-badge${current ? " is-current" : ""}`} style={{ width: size, height: size }}>
    <Image src={src} alt={decorative ? "" : `ตราอันดับ${tier}`} width={size} height={size} sizes={`${size * 2}px`} />
  </span>;
}
