"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { resultCopy } from "@/game/content/result-copy";
import { ActionButton } from "./action-buttons";
import { BackButton } from "./back-button";
import { REVIVE_COST, type StoneReward } from "@/components/game/mission-stones";

interface MissionResultModalProps {
  playerName: string;
  missionTitle: string;
  difficultyLabel?: string;
  progressError?: string;
  onRetry: () => void;
  onReturnToAcademy: () => void;
  onNewMission?: () => void;
  connectedRoutes: number;
  requiredRoutes: number;
  studioFull?: boolean;
  /** Merit earned (mission mode). */
  merit?: number;
  /** New sect rank reached by this completion. */
  rankUp?: string;
}

export function MissionResultModal({
  playerName,
  missionTitle,
  difficultyLabel,
  progressError,
  onRetry,
  onReturnToAcademy,
  onNewMission,
  connectedRoutes,
  requiredRoutes,
  studioFull = false,
  merit,
  rankUp,
}: MissionResultModalProps) {
  const completed = connectedRoutes === requiredRoutes;

  return (
    <div className="result-screen-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <Image src="/images/xianxia/mentor.webp" alt="" width={1024} height={1536} className="xianxia-mentor" aria-hidden="true" />
      <div className="result-modal-container glass-card result-panel gold-border-frame with-corner-runes">
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
          <BackButton onClick={onReturnToAcademy} label="ย้อนกลับ" />
        </div>

        {/* Header */}
        <div className="result-header-block">
          <div className="seal-orbit-mini" aria-hidden="true">
            <Image src="/images/xianxia/emblem.webp" alt="" width={38} height={32} className="brand-sigil result-sigil" />
          </div>
          <h1 id="result-title" className="result-main-title">{resultCopy.heading}</h1>
          <div className="result-sub-meta">
            <span className="trainee-label">{resultCopy.player(playerName)}</span>
            <span className="meta-sep">◈</span>
            <strong className="mission-name-label">{missionTitle}</strong>
          </div>
          {difficultyLabel && <p className="result-level-label">{difficultyLabel}</p>}
          {merit !== undefined && completed && <p className="result-level-label">ได้รับ +{merit} เกียรติภูมิ</p>}
          {rankUp && completed && <p className="result-rank-up" role="status">✦ เลื่อนขั้นเป็น “{rankUp}” ✦</p>}
          {progressError && <p className="form-error" role="alert">{progressError}</p>}
        </div>

        {/* Center Evaluation Grid */}
        <div className="result-body-card glass-panel">
          {/* Left: Metrics */}
          <div className="metrics-column">
            <div className="metric-row">
              <span className="metric-icon">🎯</span>
              <span className="metric-name">{resultCopy.metrics.completion}</span>
              <strong className="metric-val">{connectedRoutes}/{requiredRoutes} {studioFull ? "ขั้น" : "เส้นทาง"}</strong>
            </div>
            <div className="metric-row">
              <span className="metric-icon tone-success">✓</span>
              <span className="metric-name">{studioFull ? "ขั้นที่ผ่าน" : resultCopy.metrics.correct}</span>
              <strong className="metric-val">{connectedRoutes}</strong>
            </div>
            <div className="metric-row highlight-row">
              <span className="metric-icon">✦</span>
              <span className="metric-name">สถานะสัญญาณ</span>
              <strong className="metric-val gold-accent">{completed ? "สมบูรณ์" : "กำลังฝึก"}</strong>
            </div>
          </div>

          {/* Center: Laurels & Grade Badge */}
          <div className="grade-laurel-center">
            <div className="laurel-wreath-ring">
              <div className="wreath-leaves" aria-hidden="true" />
              <div className="wreath-seal-diamond">
                <span className="rank-char">✦</span>
              </div>
            </div>
          </div>

          {/* Right: Narrative Evaluation */}
          <div className="narrative-column">
            <span className="narrative-tag">ผลการประเมิน · {difficultyLabel ?? "ห้องฝึก"}</span>
            <h2 className="grade-headline">{completed ? "ผ่านการฝึก" : "กำลังฝึก"}</h2>
            <p className="grade-narrative-text">
              {completed
                ? studioFull
                  ? "ต่อเส้นทางภาพและเสียงผ่าน Switcher, Mixer, Capture Card ไปถึงจอและ OBS ได้ครบแล้ว"
                  : "เจ้าสร้างเส้นทางภาพจากกล้อง ผ่านเครื่องสลับภาพ ไปถึงจอแสดงผลได้ครบแล้ว"
                : "ตรวจสอบเส้นทางสัญญาณที่เหลือก่อนเข้ารับการประเมิน"}
            </p>
          </div>
        </div>

        {/* Bottom Feedback Columns */}
        <div className="result-feedback-grid">
          <div className="feedback-box strength-box glass-panel">
            <div className="box-title-row">
              <span className="box-icon">🏛️</span>
              <h4>{resultCopy.training.strengths}</h4>
            </div>
            <ul className="feedback-item-list">
              <li>
                <span className="check-bullet">✓</span>
                <span>{studioFull ? "ต่อสายภาพและเสียงตรงชนิดพอร์ตและทิศทางสัญญาณ" : "เชื่อมสาย HDMI ถูกต้องตามเส้นทางที่กำหนด"}</span>
              </li>
              <li>
                <span className="check-bullet">✓</span>
                <span>{studioFull ? "ตั้ง Mixer และเลือก Capture Device ใน OBS จำลองครบ" : "เข้าใจทิศทางของสัญญาณ OUTPUT และ INPUT อย่างชัดเจน"}</span>
              </li>
            </ul>
          </div>

          <div className="feedback-box review-box glass-panel">
            <div className="box-title-row">
              <span className="box-icon">💡</span>
              <h4>{resultCopy.training.review}</h4>
            </div>
            <ul className="feedback-item-list">
              <li>
                <span className="star-bullet">✦</span>
                <span>{studioFull ? "ทบทวนเส้นทาง TX → RX แบบไร้สาย และการใช้หัวแปลง 3.5/6.35 มม." : "ทบทวนทิศทาง HDMI OUT → HDMI IN ก่อนต่อสายครั้งต่อไป"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions Row */}
        <div className="result-actions-row">
          <button
            type="button"
            className="cultivation-btn btn-glass btn-md"
            onClick={onReturnToAcademy}
          >
            <span>🏠 {resultCopy.actions.return}</span>
          </button>

          <button
            type="button"
            className="cultivation-btn btn-gold-subtle btn-md"
            onClick={onRetry}
          >
            <span>🔄 {resultCopy.actions.retry}</span>
          </button>

          {onNewMission ? (
            <ActionButton variant="gold" size="md" onClick={onNewMission}>
              🚩 {resultCopy.actions.next}
            </ActionButton>
          ) : (
            <Link href="/missions" className="cultivation-btn btn-gold btn-md">
              <span className="btn-text">🚩 {resultCopy.actions.next}</span>
              <span className="btn-arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Mission Hall only; Free Practice keeps its existing result screen. */
export function MissionOutcomeModal({ status, missionTitle, venue, level, completed, total, mistakes, reward, stones, stonesError, stonesTracked, merit, rankUp, progressError, reviving, balance, freeRevive, onRevive, onNext, onRetry, onReturn }: {
  status: "success" | "failed";
  missionTitle: string;
  venue: string;
  level: number;
  completed: number;
  total: number;
  mistakes: number;
  reward?: string;
  /** Server receipt of this clear's Spirit Stones (null while it is being recorded). */
  stones?: StoneReward | null;
  stonesError?: string;
  /** False for the admin preview: no stone line at all. */
  stonesTracked?: boolean;
  merit?: number;
  rankUp?: string;
  progressError?: string;
  reviving?: boolean;
  /** Current Spirit Stones (null while loading/unknown); below REVIVE_COST the revive button is disabled. */
  balance?: number | null;
  /** Admin preview: same revive flow, no stones charged. */
  freeRevive?: boolean;
  onRevive?: () => void;
  onNext?: () => void;
  onRetry: () => void;
  onReturn: () => void;
}) {
  const success = status === "success";
  const short = !freeRevive && typeof balance === "number" && balance < REVIVE_COST;
  const [confirming, setConfirming] = useState(false);
  const b = stones?.breakdown;
  const time = b ? `${Math.floor(b.seconds / 60)}:${String(b.seconds % 60).padStart(2, "0")}` : null;
  const target = b ? `${Math.floor(b.targetSeconds / 60)}:${String(b.targetSeconds % 60).padStart(2, "0")}` : null;
  return <div className={`mission-outcome-overlay is-${status}`} role="dialog" aria-modal="true" aria-labelledby="mission-outcome-title">
    <div className="mission-outcome-mist" aria-hidden="true" />
    <section className="mission-outcome-panel mo-scroll gold-border-frame">
      <header className="mo-head">
        <div className={`mission-outcome-emblem${success ? "" : " is-broken"}`} aria-hidden="true">
          <span className="mission-outcome-blade" />
          <Image src="/images/xianxia/emblem.webp" alt="" width={86} height={74} />
        </div>
        <p className="mission-outcome-kicker">{success ? "✦ พิธีผ่านด่าน · วิชาสำเร็จ ✦" : "✦ บททดสอบยังไม่สิ้นสุด ✦"}</p>
        <h1 id="mission-outcome-title">{success ? "ภารกิจสำเร็จ" : "ภารกิจล้มเหลว"}</h1>
        <p className="mission-outcome-subtitle">{success ? "เส้นทางสัญญาณครบถ้วน ท่านผ่านบททดสอบแห่งวิถีกระบี่แล้ว" : "การฝึกวิชายังไม่สำเร็จ ตั้งหลักให้มั่น แล้วกลับไปต่อสายอีกครั้ง"}</p>
      </header>

      <div className="mo-stage">
        <span className="mo-stage-venue">{venue}</span>
        <strong>{missionTitle}</strong>
        <span className="mo-stage-level">ระดับ {level}</span>
      </div>

      {success ? <>
        <dl className="mo-stats">
          <div><dt>เวลาที่ใช้</dt><dd>{time ?? "—"}</dd>{target && <small>เป้าหมาย {target}</small>}</div>
          <div><dt>ความผิดพลาด</dt><dd>{mistakes}</dd><small>ครั้ง</small></div>
          <div><dt>เงื่อนไขสำเร็จ</dt><dd>{completed}/{total}</dd><small>เส้นทาง</small></div>
        </dl>
        {stonesTracked && <section className="mo-reward" aria-label="รางวัลหินวิญญาณ">
          <h2>รางวัลหินวิญญาณ</h2>
          {b ? <>
            <ul className="mo-reward-rows">
              <li><span>หินพื้นฐาน (ระดับ {level})</span><strong>{b.base.toLocaleString("th-TH")}</strong></li>
              <li><span>โบนัสเวลา (×{Number(b.multiplier).toFixed(2)})</span><strong className={b.timeBonus < 0 ? "is-minus" : ""}>{b.timeBonus >= 0 ? "+" : ""}{b.timeBonus.toLocaleString("th-TH")}</strong></li>
              <li><span>โบนัสเล่นแม่น (ไม่ผิดเลย)</span><strong>+{b.cleanBonus.toLocaleString("th-TH")}</strong></li>
              {b.total > b.base + b.timeBonus + b.cleanBonus && <li><span>รางวัลขั้นต่ำ 40%</span><strong>{b.floor.toLocaleString("th-TH")}</strong></li>}
            </ul>
            <p className="mo-reward-total"><span>รวมรอบนี้</span><strong>+{stones!.reward.toLocaleString("th-TH")}</strong><small>คงเหลือ {stones!.balance.toLocaleString("th-TH")} หิน</small></p>
          </> : <p className="mo-reward-pending" role="status">{stonesError || "กำลังบันทึกหินวิญญาณ…"}</p>}
        </section>}
        {(reward || merit !== undefined || rankUp) && <p className="mo-extras">
          {reward && <span>รางวัลภารกิจ <strong>{reward}</strong></span>}
          {merit !== undefined && <span>เกียรติภูมิ <strong>+{merit}</strong></span>}
          {rankUp && <span>เลื่อนขั้น <strong>{rankUp}</strong></span>}
        </p>}
      </> : <>
        <dl className="mo-stats">
          <div><dt>ผิดพลาด</dt><dd>{mistakes}</dd><small>ครั้ง</small></div>
          <div><dt>อนุญาต</dt><dd>3</dd><small>ครั้ง</small></div>
          <div><dt>เงื่อนไขสำเร็จ</dt><dd>{completed}/{total}</dd><small>เส้นทาง</small></div>
        </dl>
        <p className="mo-reason"><strong>เหตุที่ล้มเหลว</strong>ต่อสายผิดเกินจำนวนที่อนุญาต สายที่ต่อถูกและอุปกรณ์ที่วางไว้ยังอยู่ครบ</p>
        {onRevive && <p className="mo-choice">จ่าย {REVIVE_COST} หินเพื่อเริ่มต่อจากจุดที่พลาด: สายและอุปกรณ์เดิมยังอยู่ จำนวนครั้งที่ผิดลดลง 1{typeof balance === "number" && <> · ท่านมี {balance.toLocaleString("th-TH")} หิน</>}</p>}
        {onRevive && short && <p className="form-error" role="status">หินวิญญาณไม่พอ (ต้องใช้ {REVIVE_COST} ก้อน) เลือกเริ่มใหม่ทั้งด่านแทน</p>}
        {stonesError && <p className="form-error" role="alert">{stonesError}</p>}
      </>}
      {progressError && <p className="form-error" role="alert">{progressError}</p>}

      <div className="mo-actions">
        {success ? <>
          {onNext && <button type="button" className="cultivation-btn btn-gold btn-md" onClick={onNext} autoFocus>ด่านถัดไป</button>}
          <button type="button" className="cultivation-btn btn-gold-subtle btn-md" onClick={onRetry}>เล่นอีกครั้ง</button>
          <button type="button" className={`cultivation-btn ${onNext ? "btn-glass" : "btn-gold"} btn-md`} onClick={onReturn} autoFocus={!onNext}>กลับหน้าภารกิจ</button>
        </> : <>
          {onRevive && <button type="button" className="cultivation-btn btn-gold btn-md" onClick={() => setConfirming(true)} disabled={reviving} autoFocus={!short}>{reviving ? "กำลังฟื้น…" : `เริ่มต่อจากจุดที่พลาด · ${REVIVE_COST} หิน`}</button>}
          <button type="button" className="cultivation-btn btn-gold-subtle btn-md" onClick={onRetry} autoFocus={!onRevive || short}>เริ่มใหม่ทั้งด่าน</button>
          <button type="button" className="cultivation-btn btn-glass btn-md" onClick={onReturn}>กลับหน้าภารกิจ</button>
        </>}
      </div>
      {confirming && onRevive && <div className="mo-confirm" role="alertdialog" aria-modal="true" aria-labelledby="mo-confirm-title"
        style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(5,8,20,.72)", zIndex: 50, padding: 16 }}>
        <div className="gold-border-frame" style={{ background: "#0d1430", padding: "20px 22px", borderRadius: 14, maxWidth: 360, width: "100%", textAlign: "center" }}>
          <h2 id="mo-confirm-title" style={{ margin: "0 0 10px" }}>ยืนยันใช้หินวิญญาณ</h2>
          <p style={{ margin: "4px 0" }}>ค่าเริ่มต่อจากจุดที่พลาด <strong>{REVIVE_COST}</strong> หิน</p>
          <p style={{ margin: "4px 0" }}>หินที่ท่านมี <strong>{typeof balance === "number" ? balance.toLocaleString("th-TH") : "กำลังโหลด…"}</strong> หิน</p>
          {freeRevive ? <p style={{ margin: "4px 0", color: "#e9c46a" }}>โหมดทดสอบของแอดมิน · ไม่หักหินจริง</p> : typeof balance === "number" && (short
            ? <p className="form-error" role="status">หินไม่พอ ขาดอีก {(REVIVE_COST - balance).toLocaleString("th-TH")} หิน</p>
            : <p style={{ margin: "4px 0", color: "#e9c46a" }}>เพียงพอ · หลังจ่ายเหลือ {(balance - REVIVE_COST).toLocaleString("th-TH")} หิน</p>)}
          <div className="mo-actions" style={{ marginTop: 14 }}>
            <button type="button" className="cultivation-btn btn-gold btn-md" disabled={reviving || (!freeRevive && (typeof balance !== "number" || short))} autoFocus
              onClick={() => { setConfirming(false); onRevive(); }}>ยืนยันจ่าย {REVIVE_COST} หิน</button>
            <button type="button" className="cultivation-btn btn-glass btn-md" onClick={() => setConfirming(false)}>ยกเลิก</button>
          </div>
        </div>
      </div>}
    </section>
  </div>;
}
