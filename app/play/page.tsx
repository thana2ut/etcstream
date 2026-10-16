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
import { CableLobby } from "@/components/ui/cable-lobby";
import { BagPanel } from "@/components/game/bag-panel";
import { OperatorConsole, ReviewOverlay } from "@/components/game/operator-console";
import { hiddenCablesFor, MAX_WRONG_STREAK, packableCatalogIds, packedLeadsFor } from "@/game/content/cable-catalog";

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
  // Mission Hall: cable bag packed in the prep lobby before every attempt (null = still in the lobby).
  const [bag, setBag] = useState<Record<string, number> | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const trainingFailed = useTrainingStore((state) => state.failed);
  // Leads still inside the bag (badge on the 🎒 button).
  const bagCount = useTrainingStore((state) => state.bagged?.length ?? 0);
  // R opens / closes the bag while playing (T rotates a held device, in the first-person controller).
  const bagUsable = Boolean(bag) && !introOpen && !showResultModal && !showExitConfirm;
  useEffect(() => {
    if (!bagUsable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyR" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const st = useTrainingStore.getState();
      if (st.inspecting) return;
      e.preventDefault();
      setBagOpen((open) => {
        if (!open && document.pointerLockElement) document.exitPointerLock();
        return !open;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bagUsable]);

  // C opens / closes the Operator Console on production stages.
  const consoleOpen = useTrainingStore((state) => state.consoleOpen);
  const simPaused = useTrainingStore((state) => Boolean(state.sim?.paused));
  const hasStage = Boolean(SCENARIOS[loadedScenarioId]?.stage);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyC" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const st = useTrainingStore.getState();
      if (st.inspecting || !SCENARIOS[st.scenarioId]?.stage) return;
      e.preventDefault();
      if (!st.consoleOpen && document.pointerLockElement) document.exitPointerLock();
      st.setConsoleOpen(!st.consoleOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  // The classroom (Signal Practice Room) runs the full studio signal flow; missions keep the HDMI slice.
  const scaleByVenue: Record<string, VenueScale> = { classroom: "xs", studio: "s", auditorium: "m", outdoor: "l", stadium: "xl" };
  const scenarioId: ScenarioId = routeMode === "mission" && mission && difficulty
    ? `${scaleByVenue[mission.venueId]}-${difficulty.level}` as ScenarioId
    : "studio-full";
  const activeScenario = SCENARIOS[scenarioId];
  // Load the scenario only when it actually changes: re-running this (dev hot reload, remounts) must not wipe the
  // room and the bag the trainee packed in the cable-prep lobby.
  useEffect(() => {
    if (useTrainingStore.getState().scenarioId !== scenarioId) resetTraining(scenarioId);
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

  // Lift the veil the mission hall drops over the route change once this page has real content.
  useEffect(() => {
    if (!hydrated) return;
    const veil = document.getElementById("route-veil");
    if (!veil) return;
    const raf = requestAnimationFrame(() => { veil.style.opacity = "0"; });
    const timer = window.setTimeout(() => veil.remove(), 450);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); };
  }, [hydrated]);

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
      <main className="fantasy-viewport play-page" style={{ justifyContent: "center", alignItems: "center" }}>
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
        <main className="fantasy-viewport play-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--gold-soft)" }}>{copy.play.returning}</p>
      </main>
    );
  }

  const currentTitle = validMission && mission ? mission.title : "Full studio signal flow";
  const difficultyLabel = validMission && mission ? getMissionDifficultyLabel(mission, difficultyLevel) : null;
  const introSteps = activeScenario.requirements.map(r => [r.label, "Patch OUTPUT → INPUT with a lead of the matching signal type", r.id]);
  const schematicNodes = [["SOURCE", "Cameras / mics"], ["ROUTING", "Switcher / Mixer"], ["DESTINATION", "Monitor / Record / Stream"]];

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
    // Mission levels and the classroom return to the cable-prep lobby for every new attempt.
    if (routeMode === "mission" || validClassroom) { setBag(null); setIntroOpen(true); }
    setShowResultModal(false);
  };

  // Cable-prep lobby before every attempt. The classroom offers exactly the leads laid out on its table.
  if (((routeMode === "mission" && validMission) || validClassroom) && bag === null) {
    return <CableLobby
      scenario={activeScenario} title={currentTitle}
      levelLabel={validClassroom ? "Signal Practice Room · studio patching" : difficultyLabel ?? ""}
      objective={validClassroom ? "Pick enough leads from the cable table to patch cameras, switcher, monitor, sound and capture" : difficulty?.objective}
      playerName={player.nickname}
      only={validClassroom ? packableCatalogIds(activeScenario) : undefined}
      onBack={() => router.push(validClassroom ? "/academy" : "/missions")}
      onConfirm={(packed) => { setBag(packed); resetTraining(scenarioId, hiddenCablesFor(activeScenario, packed), packedLeadsFor(activeScenario, packed)); setIntroOpen(true); }}
    />;
  }

  return (
    <main className="fantasy-viewport game-screen play-page" style={{ background: "#050d1a" }}>
      {/* 3D Real Viewport */}
      <div className="game-viewport" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GameCanvas
          key={scenarioId}
          venue={routeMode === "mission" ? mission?.venueId : "studio"}
          active={!introOpen && !showResultModal && !showExitConfirm && !bagOpen && !trainingFailed && !consoleOpen && !simPaused}
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
        backLabel="Back"
        brandInert={!introOpen && !showResultModal}
        breadcrumb={difficultyLabel ? `${mission?.title} > ${difficultyLabel}` : "Signal Practice Room"}
      />
      {/* While playing the top bar is gone; this small pause button is the way out (opens the exit confirmation). */}
      {!introOpen && !showResultModal && !showExitConfirm && (
        <button type="button" className="game-pause-btn" onClick={handleTriggerGameplayBack} aria-label="Pause / leave the stage" title="Pause / leave the stage">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        </button>
      )}

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
          {(routeMode === "mission" || validClassroom) && bag && <button type="button" className="cl-bag-button" onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setBagOpen(true); }} title="Open the bag (R)">🎒 Bag <b className="cl-bag-badge">{bagCount}</b></button>}
          {bagOpen && bag && <BagPanel bag={bag} onClose={() => setBagOpen(false)} />}
          {hasStage && <button type="button" className="cl-bag-button" style={{ top: "auto", bottom: 86 }} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); useTrainingStore.getState().setConsoleOpen(true); }} title="Operator Console (C)">🎛 Console (C)</button>}
          <OperatorConsole />
          <ReviewOverlay />
          {touch && !showExitConfirm && <TouchControls />}

          {/* Pointer lock capture prompt if not locked */}
          {!locked && !fallbackLook && !touch && !showExitConfirm && (
            <button
              type="button"
              className="cultivation-btn btn-gold btn-sm"
              style={{
                position: "absolute",
                // below the top bar (72px) and the pause button
                top: "134px",
                right: "14px",
                zIndex: 45,
                boxShadow: "0 0 15px var(--gold-glow)",
              }}
              onClick={lockPointer}
            >
              Click to control the view
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

      {/* REF 08: PLAY INTRO STATE (before entering) */}
      {introOpen && (
        <div className="instructions-modal-backdrop" style={{ background: "rgba(2, 6, 18, 0.9)" }}>
          <section className="play-intro-wrapper glass-card technical-panel gold-border-frame with-corner-runes" aria-labelledby="play-intro-title">
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
              <BackButton onClick={handleBackFromIntro} label="Back" />
            </div>

            <div className="play-intro-grid">
              {/* Left Info Panel */}
              <div className="intro-info-card">
                <div className="intro-room-badge">
                  <Image src="/images/xianxia/emblem.webp" alt="etcstream logo" width={35} height={30} className="brand-sigil intro-sigil" />
                  <strong>{validMission ? "Mission Hall" : "Signal Practice Room"}</strong>
                </div>

                <h1 id="play-intro-title" className="intro-mode-title">{currentTitle}</h1>

                {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}

                <p className="intro-narrative">
                  {mission && validMission
                    ? `${mission.description} ${difficulty?.flavor ?? ""}`
                    : "Build the complete studio chain: cameras and microphones, through the mixer and video switcher, to the capture card, computer, OBS and monitor."}
                </p>
                {difficulty && validMission && <p className="intro-narrative"><strong>Job ticket:</strong> {difficulty.objective}</p>}

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
                  {validMission ? "Start mission" : "Start practice"}
                </ActionButton>
              </div>

              {/* Right Stylized Graphic (Pedestals in Celestial Arch) */}
              <div className="intro-preview-card glass-panel scholar-framed-preview">
                <div className="preview-artwork-wrap">
                  <div className="lesson-schematic" aria-label={validMission ? "Signal path: source, processing, destination" : "Complete studio signal path"}>
                    {schematicNodes.map(([title, detail], index) => <div key={title} style={{ display: "contents" }}>
                      {index > 0 && <div className="schematic-link" aria-hidden="true">⟶</div>}
                      <div className="schematic-node"><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{detail}</small></div>
                    </div>)}
                  </div>
                  <div className="preview-artwork-glow" />
                </div>
                <div className="preview-caption-bar">
                  <span className="sparkle">✦</span>
                  <span>{validMission ? "Signal path: source ➔ processing ➔ destination · press C in the room for the Operator Console" : "Studio system: picture and sound ➔ mix/switch ➔ record and stream"}</span>
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
            <h2 className="exit-confirm-title">Leave the training?</h2>
            <p className="exit-confirm-desc">
              “Progress in this attempt may be lost, but your trainee record and missions are kept.”
            </p>
            <div className="exit-confirm-actions">
              <ActionButton variant="glass" size="md" onClick={handleCancelExit} arrow={false}>
                Keep training
              </ActionButton>
              <ActionButton variant="danger" size="md" onClick={handleConfirmExit}>
                Leave the room
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* REF 10: RESULT MODAL (on mission success) */}
      {/* Mission: too many wrong connections in a row = level not passed. */}
      {routeMode === "mission" && trainingFailed && !showResultModal && (
        <div className="exit-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="fail-title">
          <div className="exit-confirm-modal glass-card dialog-panel gold-border-frame with-corner-runes">
            <h2 id="fail-title" className="exit-confirm-title">Stage failed</h2>
            <p className="exit-confirm-desc">{MAX_WRONG_STREAK} wrong connections in a row — check OUTPUT → INPUT direction, signal type and the leads you packed, then try again</p>
            <div className="exit-confirm-actions">
              <ActionButton variant="glass" size="md" arrow={false} onClick={() => router.push("/missions")}>Back to the Mission Hall</ActionButton>
              <ActionButton variant="gold" size="md" onClick={handleRetry}>Back to cable prep</ActionButton>
            </div>
          </div>
        </div>
      )}

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
