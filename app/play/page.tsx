"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { GameCanvas } from "@/components/game/game-canvas";
import { TrainingHud } from "@/components/game/training-hud";
import { missionCopy as copy } from "@/game/content/mission-copy";
import { missionS001 } from "@/game/missions/mission-s-001";
import { getDifficultyMeta, getMissionDifficultyLabel } from "@/game/content/mission-catalog";
import { useAcademyStore } from "@/game/stores/academy-store";
import { useTrainingStore } from "@/game/stores/training-store";
import { trainingProgress } from "@/game/training/hdmi-training";
import { AcademyHeader } from "@/components/ui/academy-header";
import { useGameAudio } from "@/components/audio/audio-provider";
import { ActionButton } from "@/components/ui/action-buttons";
import { BackButton } from "@/components/ui/back-button";
import { MissionResultModal } from "@/components/ui/mission-result-modal";
import { soundEngine } from "@/game/audio/sound-engine";
import { getSafePlayParams } from "@/game/security/route-validation";

export default function Play() {
  return (
    <Suspense fallback={<main className="fantasy-viewport" style={{ justifyContent: "center", alignItems: "center" }}><p style={{ color: "var(--gold-soft)" }}>{copy.play.loading}</p></main>}>
      <PlayExperience />
    </Suspense>
  );
}

function PlayExperience() {
  const { setPlayPhase } = useGameAudio();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, player, progress, progressError, selectedMissionId, hydrate, startMission, completeMission } = useAcademyStore();
  const safeParams = getSafePlayParams(searchParams, progress?.selected ?? null);
  const routeMode = safeParams.mode;
  const mission = safeParams.mission;
  const difficultyLevel = safeParams.difficulty ?? 0;
  const difficulty = mission ? getDifficultyMeta(mission, difficultyLevel) : null;
  const resetTraining = useTrainingStore((state) => state.reset);
  const trainingCompleted = useTrainingStore((state) => state.completed);
  const connectedRoutes = useTrainingStore(trainingProgress);

  const [introOpen, setIntroOpen] = useState(true);
  const [locked, setLocked] = useState(false);
  const [fallbackLook, setFallbackLook] = useState(false);
  const [touch, setTouch] = useState(false);
  const [pointerError, setPointerError] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    setPlayPhase(showResultModal ? "result" : introOpen ? "intro" : "gameplay");
  }, [introOpen, showResultModal, setPlayPhase]);

  useEffect(() => () => setPlayPhase("intro"), [setPlayPhase]);

  const exitFallback = useCallback(() => {
    setFallbackLook(false);
    setPointerError("");
  }, [setFallbackLook, setPointerError]);

  const enableFallback = useCallback(() => {
    setFallbackLook(true);
    setPointerError(copy.trainingUi.fallbackNotice);
    document.querySelector("canvas")?.focus();
  }, [setFallbackLook, setPointerError]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    resetTraining();
  }, [resetTraining, routeMode]);

  useEffect(() => {
    if (introOpen) return;
    if (trainingCompleted) {
      completeMission();
      soundEngine.play("mission_complete");
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      startMission();
    }
  }, [introOpen, trainingCompleted, completeMission, startMission]);

  useEffect(() => {
    if (!hydrated) return;
    if (!player) {
      router.replace("/");
      return;
    }
    const validClassroom = routeMode === "classroom" && player.currentMode === "classroom";
    const validMission =
      routeMode === "mission" &&
      player.currentMode === "challenge" &&
      progress?.playerId === player.playerId &&
      progress.selected?.slug === mission?.slug &&
      progress.selected?.difficulty === difficultyLevel && Boolean(difficulty);

    if ((!validClassroom && !validMission) || selectedMissionId !== missionS001.id) {
      router.replace(routeMode === "mission" ? "/missions" : "/academy");
    }
  }, [hydrated, routeMode, player, progress, mission, difficulty, difficultyLevel, selectedMissionId, router]);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const updateTouch = () => setTouch(query.matches);
    updateTouch();
    query.addEventListener("change", updateTouch);

    const updateLock = () => setLocked(Boolean(document.pointerLockElement));
    document.addEventListener("pointerlockchange", updateLock);
    return () => {
      query.removeEventListener("change", updateTouch);
      document.removeEventListener("pointerlockchange", updateLock);
    };
  }, []);

  if (!hydrated || !player) {
    return (
      <main className="fantasy-viewport" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--gold-soft)" }}>{copy.play.loading}</p>
      </main>
    );
  }

  const validClassroom = routeMode === "classroom" && player.currentMode === "classroom";
  const validMission =
    routeMode === "mission" &&
    player.currentMode === "challenge" &&
    progress?.playerId === player.playerId &&
    progress.selected?.slug === mission?.slug &&
    progress.selected?.difficulty === difficultyLevel && Boolean(difficulty);

  if ((!validClassroom && !validMission) || selectedMissionId !== missionS001.id) {
    return (
      <main className="fantasy-viewport" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--gold-soft)" }}>{copy.play.returning}</p>
      </main>
    );
  }

  const currentTitle = validMission && mission ? mission.title : "เส้นทางภาพแรก";
  const difficultyLabel = validMission && mission ? getMissionDifficultyLabel(mission, difficultyLevel) : null;

  async function lockPointer() {
    if (touch || introOpen || showExitConfirm) return;
    const canvas = document.querySelector("canvas");
    if (canvas) {
      try {
        await canvas.requestPointerLock();
        setPointerError("");
      } catch {
        enableFallback();
      }
    }
  }

  // REF 08 Back Navigation:
  const handleBackFromIntro = () => {
    if (routeMode === "mission") {
      router.push("/missions");
    } else {
      router.push("/academy");
    }
  };

  // REF 09 Gameplay Back Navigation with confirmation:
  const handleTriggerGameplayBack = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (routeMode === "mission") {
      router.push("/missions");
    } else {
      router.push("/academy");
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleStartPlay = () => {
    setIntroOpen(false);
    startMission();
  };

  const handleRetry = () => {
    resetTraining();
    setShowResultModal(false);
  };

  return (
    <main className="fantasy-viewport game-screen" style={{ background: "#050d1a" }}>
      {/* 3D Real Viewport */}
      <div className="game-viewport" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GameCanvas
          active={!introOpen && !touch && !showResultModal && !showExitConfirm}
          fallbackLook={fallbackLook}
          onExitFallback={exitFallback}
          onPointerLockError={enableFallback}
        />
      </div>

      {/* Header bar */}
      <AcademyHeader
        traineeName={player.nickname}
        onBack={
          introOpen
            ? handleBackFromIntro
            : showResultModal
            ? () => router.push("/academy")
            : handleTriggerGameplayBack
        }
        backLabel="ย้อนกลับ"
        breadcrumb={difficultyLabel ? `${mission?.title} > ${difficultyLabel}` : "ห้องฝึกปราณสัญญาณ"}
      />

      {/* Reticle for aiming */}
      {!introOpen && !showResultModal && !showExitConfirm && (
        <div className="game-center-reticle" aria-hidden="true" />
      )}

      {/* REF 09: GAMEPLAY HUD */}
      {!introOpen && !showResultModal && (
        <>
          <TrainingHud title={currentTitle} difficultyLabel={difficultyLabel ?? undefined} objective={difficulty?.objective} touch={touch} />

          {/* Pointer lock capture prompt if not locked */}
          {!locked && !fallbackLook && !touch && !showExitConfirm && (
            <button
              type="button"
              className="cultivation-btn btn-gold btn-sm"
              style={{
                position: "absolute",
                top: "70px",
                right: "28px",
                zIndex: 45,
                boxShadow: "0 0 15px var(--gold-glow)",
              }}
              onClick={lockPointer}
            >
              คลิกเพื่อควบคุมมุมมอง
            </button>
          )}

          {pointerError && (
            <p
              className="fallback-notice"
              style={{
                position: "absolute",
                top: "110px",
                right: "28px",
                zIndex: 45,
                background: "rgba(0,0,0,0.8)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                color: "var(--gold-soft)",
              }}
              role="status"
            >
              {pointerError}
            </p>
          )}
        </>
      )}

      {/* REF 08: PLAY INTRO STATE (ก่อนเข้าสู่ห้องฝึก) */}
      {introOpen && (
        <div className="instructions-modal-backdrop" style={{ background: "rgba(2, 6, 18, 0.9)" }}>
          <section className="play-intro-wrapper glass-card technical-panel gold-border-frame with-corner-runes" aria-labelledby="play-intro-title">
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
              <BackButton onClick={handleBackFromIntro} label="ย้อนกลับ" />
            </div>

            <div className="play-intro-grid">
              {/* Left Info Panel */}
              <div className="intro-info-card">
                <div className="intro-room-badge">
                  <Image src="/branding/etcstream-logo.png" alt="โลโก้ etcstream" width={35} height={30} className="brand-sigil intro-sigil" />
                  <strong>ห้องฝึกปราณสัญญาณ</strong>
                </div>

                <h1 id="play-intro-title" className="intro-mode-title">{currentTitle}</h1>

                {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}

                <p className="intro-narrative">
                  {mission && validMission
                    ? `${mission.description} ${difficulty?.flavor ?? ""}`
                    : "นักทดสอบ จะได้เรียนรู้การเชื่อมต่ออุปกรณ์ตรง ตั้งแต่ Camera ผ่าน Video Switcher ไปยัง Monitor เรียนรู้การไหลของสัญญาณภาพ และตรวจสอบให้แน่ใจว่าสัญญาณสมบูรณ์พร้อมใช้งาน ก่อนเข้าสู่ห้องฝึกภาคปฏิบัติ"}
                </p>
                {difficulty && validMission && <p className="intro-narrative"><strong>เป้าหมายระดับนี้:</strong> {difficulty.objective}</p>}

                <div className="intro-target-steps">
                  <div className="target-step-item">
                    <span className="step-badge">1</span>
                    <div>
                      <span className="step-text-title">Camera → Video Switcher</span>
                      <span className="step-text-sub"> (เชื่อมต่อกล้องเข้าสู่วิดเจอร์)</span>
                    </div>
                  </div>

                  <div className="target-step-item">
                    <span className="step-badge">2</span>
                    <div>
                      <span className="step-text-title">Video Switcher → Monitor</span>
                      <span className="step-text-sub"> (ส่งสัญญาณภาพไปยังจอแสดงผล)</span>
                    </div>
                  </div>

                  <div className="target-step-item">
                    <span className="step-badge">3</span>
                    <div>
                      <span className="step-text-title">ตรวจหาสัญญาณให้สมบูรณ์</span>
                      <span className="step-text-sub"> (ตรวจสอบว่าภาพและสัญญาณพร้อมใช้งาน)</span>
                    </div>
                  </div>
                </div>

                <ActionButton variant="gold" size="lg" onClick={handleStartPlay}>
                  {validMission ? "เริ่มภารกิจ" : "เริ่มการฝึก"}
                </ActionButton>
              </div>

              {/* Right Stylized Graphic (Pedestals in Celestial Arch) */}
              <div className="intro-preview-card glass-panel scholar-framed-preview">
                <div className="preview-artwork-wrap">
                  <div className="lesson-schematic" aria-label="เส้นทางสัญญาณ Camera ไป Video Switcher ไป Monitor">
                    <div className="schematic-node"><span>01</span><strong>Camera</strong><small>HDMI OUT</small></div>
                    <div className="schematic-link" aria-hidden="true">⟶</div>
                    <div className="schematic-node"><span>02</span><strong>Video Switcher</strong><small>HDMI IN / OUT</small></div>
                    <div className="schematic-link" aria-hidden="true">⟶</div>
                    <div className="schematic-node"><span>03</span><strong>Monitor</strong><small>HDMI IN</small></div>
                  </div>
                  <div className="preview-artwork-glow" />
                </div>
                <div className="preview-caption-bar">
                  <span className="sparkle">✦</span>
                  <span>เส้นทางสัญญาณ HDMI: กล้อง ➔ สวิตเชอร์ ➔ จอภาพ</span>
                  <span className="sparkle">✦</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* REF 09: EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="exit-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="exit-confirm-modal glass-card dialog-panel gold-border-frame with-corner-runes">
            <h2 className="exit-confirm-title">ออกจากการฝึกหรือไม่?</h2>
            <p className="exit-confirm-desc">
              “ความคืบหน้าในรอบนี้อาจถูกยกเลิก แต่ข้อมูลผู้ฝึกและภารกิจของเจ้าจะยังคงอยู่”
            </p>
            <div className="exit-confirm-actions">
              <ActionButton variant="glass" size="md" onClick={handleCancelExit} arrow={false}>
                ฝึกต่อ
              </ActionButton>
              <ActionButton variant="danger" size="md" onClick={handleConfirmExit}>
                ออกจากห้องฝึก
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* REF 10: RESULT MODAL (เมื่อสำเร็จภารกิจ) */}
      {showResultModal && (
        <MissionResultModal
          playerName={player.nickname}
          missionTitle={currentTitle}
          difficultyLabel={difficultyLabel ?? undefined}
          progressError={progressError}
          onRetry={handleRetry}
          onReturnToAcademy={() => router.push("/academy")}
          onNewMission={validMission ? () => router.push("/missions") : undefined}
          connectedRoutes={connectedRoutes}
          requiredRoutes={missionS001.requiredConnections.length}
        />
      )}
    </main>
  );
}
