"use client";

import Link from "next/link";
import Image from "next/image";
import { resultCopy } from "@/game/content/result-copy";
import { ActionButton } from "./action-buttons";
import { BackButton } from "./back-button";

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
