"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { GameCanvas } from "@/components/game/game-canvas";
import { TrainingHud } from "@/components/game/training-hud";
import { FirstPersonHands } from "@/components/game/first-person-hands";
import { EquipmentInspector, InspectHoldRing } from "@/components/game/equipment-inspector";
import { missionCopy as copy } from "@/game/content/mission-copy";
import { missionS001 } from "@/game/missions/mission-s-001";
import { getDifficultyMeta, getMissionDifficultyLabel } from "@/game/content/mission-catalog";
import { useAcademyStore } from "@/game/stores/academy-store";
import { useTrainingStore } from "@/game/stores/training-store";
import { SCENARIOS, type ScenarioId, type VenueScale } from "@/game/training/scenarios";
import { trainingProgress, trainingTotal } from "@/game/training/hdmi-training";
import { AcademyHeader } from "@/components/ui/academy-header";
import { useGameAudio } from "@/components/audio/audio-provider";
import { ActionButton } from "@/components/ui/action-buttons";
import { TouchControls } from "@/components/game/touch-controls";
import { BackButton } from "@/components/ui/back-button";
import { MissionResultModal } from "@/components/ui/mission-result-modal";
import { clearedCount, meritFor, rankFor } from "@/game/content/mission-ranks";
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
  // Temporary local end-to-end probe; removed after the browser run.
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") (window as unknown as { __studioE2E?: typeof useTrainingStore }).__studioE2E = useTrainingStore;
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
  const loadedScenarioId = useTrainingStore((state) => state.scenarioId);
  const connectedRoutes = useTrainingStore(trainingProgress);

  const [introOpen, setIntroOpen] = useState(true);
  const [locked, setLocked] = useState(false);
  const [fallbackLook, setFallbackLook] = useState(false);
  const [touch, setTouch] = useState(false);
  const [pointerError, setPointerError] = useState("");
  const [reward, setReward] = useState<{ merit: number; rankUp?: string } | null>(null);
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

  // The classroom (ห้องฝึกปราณสัญญาณ) runs the full studio signal flow; missions keep the HDMI slice.
  const scaleByVenue: Record<string, VenueScale> = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" };
  const scenarioId: ScenarioId = routeMode === "mission" && mission && difficulty
    ? `${scaleByVenue[mission.venueId]}-${difficulty.level}` as ScenarioId
    : "studio-full";
  const activeScenario = SCENARIOS[scenarioId];
  useEffect(() => {
    resetTraining(scenarioId);
  }, [resetTraining, scenarioId]);

  useEffect(() => {
    if (introOpen || loadedScenarioId !== scenarioId) return;
    if (trainingCompleted) {
      // Rank / merit are derived from cleared levels: compare before and after this completion.
      const before = useAcademyStore.getState().progress;
      const selected = before?.selected;
      const firstClear = Boolean(selected && !(before?.completed[selected.slug] ?? []).includes(selected.difficulty));
      const rankBefore = rankFor(clearedCount(before?.completed ?? {}));
      completeMission();
      soundEngine.play("mission_complete");
      const timer = setTimeout(() => {
        const after = useAcademyStore.getState().progress;
        const rankAfter = rankFor(clearedCount(after?.completed ?? {}));
        setReward(selected ? { merit: meritFor(selected.slug, selected.difficulty, firstClear), rankUp: rankAfter.id !== rankBefore.id ? rankAfter.title : undefined } : null);
        setShowResultModal(true);
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      startMission();
    }
  }, [introOpen, trainingCompleted, loadedScenarioId, scenarioId, completeMission, startMission]);

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
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const compactScreen = window.matchMedia("(max-width: 768px)");
    const updateTouch = () => setTouch(coarsePointer.matches || compactScreen.matches);
    updateTouch();
    coarsePointer.addEventListener("change", updateTouch);
    compactScreen.addEventListener("change", updateTouch);

    const updateLock = () => setLocked(Boolean(document.pointerLockElement));
    document.addEventListener("pointerlockchange", updateLock);
    return () => {
      coarsePointer.removeEventListener("change", updateTouch);
      compactScreen.removeEventListener("change", updateTouch);
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

  const currentTitle = validMission && mission ? mission.title : "ระบบสตูดิโอครบเส้นทาง";
  const difficultyLabel = validMission && mission ? getMissionDifficultyLabel(mission, difficultyLevel) : null;
  const introSteps = activeScenario.requirements.map(r => [r.label, "ต่อ OUTPUT → INPUT ด้วยสายที่ตรงชนิดสัญญาณ", r.id]);
  const schematicNodes = [["SOURCE", "กล้อง / ไมค์"], ["ROUTING", "Switcher / Mixer"], ["DESTINATION", "Monitor / Capture / Live"]];

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
    resetTraining(scenarioId);
    setShowResultModal(false);
  };

  return (
    <main className="fantasy-viewport game-screen" style={{ background: "#050d1a" }}>
      {/* 3D Real Viewport */}
      <div className="game-viewport" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GameCanvas
          key={scenarioId}
          venue={routeMode === "mission" ? mission?.venueId : "studio"}
          active={!introOpen && !showResultModal && !showExitConfirm}
          fallbackLook={fallbackLook}
          touch={touch}
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
          <FirstPersonHands />
          <InspectHoldRing />
          <EquipmentInspector />
          <TrainingHud title={currentTitle} difficultyLabel={difficultyLabel ?? undefined} objective={difficulty?.objective} touch={touch} />
          {touch && !showExitConfirm && <TouchControls />}

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
                  <Image src="/images/xianxia/emblem.webp" alt="โลโก้ etcstream" width={35} height={30} className="brand-sigil intro-sigil" />
                  <strong>ห้องฝึกปราณสัญญาณ</strong>
                </div>

                <h1 id="play-intro-title" className="intro-mode-title">{currentTitle}</h1>

                {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}

                <p className="intro-narrative">
                  {mission && validMission
                    ? `${mission.description} ${difficulty?.flavor ?? ""}`
                    : "ฝึกประกอบระบบสตูดิโอครบเส้นทาง ตั้งแต่กล้องและไมโครโฟน ผ่าน Mixer และ Video Switcher ไปยัง Capture Card, Computer, OBS และ Monitor จนครบทุกเงื่อนไข"}
                </p>
                {difficulty && validMission && <p className="intro-narrative"><strong>เป้าหมายระดับนี้:</strong> {difficulty.objective}</p>}

                <div className="intro-target-steps">
                  {introSteps.map(([title, detail, id], index) => <div className="target-step-item" key={id ?? `${index}-${title}`}>
                    <span className="step-badge">{index + 1}</span>
                    <div>
                      <span className="step-text-title">{title}</span>
                      <span className="step-text-sub"> ({detail})</span>
                    </div>
                  </div>)}
                </div>

                <ActionButton variant="gold" size="lg" onClick={handleStartPlay}>
                  {validMission ? "เริ่มภารกิจ" : "เริ่มการฝึก"}
                </ActionButton>
              </div>

              {/* Right Stylized Graphic (Pedestals in Celestial Arch) */}
              <div className="intro-preview-card glass-panel scholar-framed-preview">
                <div className="preview-artwork-wrap">
                  <div className="lesson-schematic" aria-label={validMission ? "เส้นทางสัญญาณ Camera ไป Video Switcher ไป Monitor" : "เส้นทางระบบสตูดิโอครบวงจร"}>
                    {schematicNodes.map(([title, detail], index) => <div key={title} style={{ display: "contents" }}>
                      {index > 0 && <div className="schematic-link" aria-hidden="true">⟶</div>}
                      <div className="schematic-node"><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{detail}</small></div>
                    </div>)}
                  </div>
                  <div className="preview-artwork-glow" />
                </div>
                <div className="preview-caption-bar">
                  <span className="sparkle">✦</span>
                  <span>{validMission ? "เส้นทางสัญญาณตามขนาดสถานที่: ต้นทาง ➔ ประมวลผล ➔ ปลายทาง" : "ระบบสตูดิโอ: ภาพและเสียง ➔ ผสม/สลับ ➔ บันทึกและถ่ายทอด"}</span>
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
          requiredRoutes={trainingTotal({ scenarioId })}
          studioFull={scenarioId === "studio-full"}
          merit={validMission ? reward?.merit : undefined}
          rankUp={validMission ? reward?.rankUp : undefined}
        />
      )}
    </main>
  );
}
