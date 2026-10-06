"use client";

import { ActionButton } from "./action-buttons";

/**
 * Top box of the mission hall: "รับภารกิจ" (and the one-time "ขอรับภารกิจใหม่ 0/1").
 * The draw itself is shown on the venue cards below — a highlight runs across them and stops on the assignment.
 */
export function MissionDrawPanel({ rolling, canDraw, canReroll, rerollsUsed, maxRerolls, drawnTitle, drawnCleared, onRoll, onReroll }: {
  rolling: boolean;
  canDraw: boolean;
  canReroll: boolean;
  rerollsUsed: number;
  maxRerolls: number;
  drawnTitle: string | null;
  drawnCleared: number;
  onRoll: () => void;
  onReroll: () => void;
}) {
  const status = rolling
    ? "หอจารึกกำลังเลือกภารกิจให้เจ้า..."
    : drawnTitle
      ? canDraw
        ? `ภารกิจ “${drawnTitle}” ผ่านครบ 5 ระดับแล้ว — รับภารกิจใหม่ได้`
        : `ภารกิจของเจ้า: “${drawnTitle}” · ผ่านแล้ว ${drawnCleared}/5 ระดับ — ผ่านครบ 5 ระดับจึงรับภารกิจใหม่ได้`
      : "กดรับภารกิจ แล้วหอจารึกจะสุ่มมอบภารกิจหนึ่งบทให้เจ้า";
  const showReroll = !canDraw && Boolean(drawnTitle);
  return <section className="mission-draw glass-card gold-border-frame" aria-labelledby="mission-draw-title">
    <div className="mission-draw-order">
      <span className="mission-hall-eyebrow">ภารกิจสำนัก</span>
      <h2 id="mission-draw-title">รับภารกิจ</h2>
      <p aria-live="polite">{status}</p>
      {showReroll && !rolling && <small>{canReroll ? "ไม่ถูกใจ? ขอรับภารกิจใหม่ได้อีก 1 ครั้ง" : drawnCleared > 0 ? "เริ่มทำภารกิจนี้แล้ว — ขอใหม่ไม่ได้" : "ใช้สิทธิ์ขอใหม่ครบแล้ว — ต้องเริ่มภารกิจนี้เท่านั้น"}</small>}
    </div>
    <div className="mission-draw-actions">
      <ActionButton variant="gold" size="lg" disabled={!canDraw || rolling} onClick={onRoll}>{rolling ? "กำลังสุ่ม..." : "รับภารกิจ"}</ActionButton>
      {showReroll && <ActionButton variant="cyan" size="md" disabled={!canReroll || rolling} onClick={onReroll}>ขอรับภารกิจใหม่ {rerollsUsed}/{maxRerolls}</ActionButton>}
    </div>
  </section>;
}
