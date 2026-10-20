"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { checkMissionBag } from "@/game/content/mission-bag";
import { deleteRun, loadRun, type LoadResult, type RunKey } from "@/game/persistence/run-save";
import { ResumeRunDialog, SaveStatusPill, useRunAutosave } from "@/components/game/run-persistence";
import { missionBriefing } from "@/game/content/mission-briefing";
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

/** Free Practice briefing cards (static): what the room is, the aim, what you do, what to know. */
const FREE_PRACTICE_CARDS: { icon: string; title: string; lines: string[] }[] = [
  { icon: "☯", title: "ห้องฝึกอิสระคืออะไร", lines: ["ห้องสตูดิโอที่มีกล้อง ไมโครโฟน Mixer, Video Switcher, Capture Card, Computer/OBS และ Monitor ให้สำรวจ หยิบ วาง ต่อ และตั้งค่าได้อย่างอิสระ"] },
  { icon: "◎", title: "เป้าหมายการฝึก", lines: ["เข้าใจหน้าที่ของอุปกรณ์แต่ละชิ้น เลือกเส้นทางการต่อที่เหมาะสม และสังเกตผลที่เกิดขึ้นบนจอและเสียง ไม่มีด่านหรือเงื่อนไขผ่านบังคับ"] },
  { icon: "✦", title: "สิ่งที่ผู้เล่นจะทำ", lines: [
    "เลือกสายจากโต๊ะสายของห้องฝึกใส่กระเป๋า",
    "เข้าห้อง กด E ค้าง 2 วินาทีเพื่อดูรายละเอียดอุปกรณ์ แล้วหยิบ วาง และเสียบสาย",
    "สังเกตผลบนจอ ถ้ายังไม่ขึ้น ไล่ย้อนเส้นทางแล้วแก้จากความผิดพลาด",
  ] },
  { icon: "👁", title: "ข้อควรรู้ก่อนเริ่ม", lines: [
    "สัญญาณเดินจาก OUTPUT ไป INPUT และหัวสายต้องตรงชนิดพอร์ต",
    "ห้องที่ยังทำค้างจะถูกบันทึกในเบราว์เซอร์นี้ และเลือกเล่นต่อได้เมื่อกลับมา",
  ] },
];

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
      if (introOpen || bag === null || st.inspecting || !SCENARIOS[st.scenarioId]?.stage) return;
      e.preventDefault();
      if (!st.consoleOpen && document.pointerLockElement) document.exitPointerLock();
      st.setConsoleOpen(!st.consoleOpen);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introOpen, bag]);

  useEffect(() => {
    setPlayPhase(showResultModal ? "result" : introOpen || bag === null ? "intro" : "gameplay");
  }, [introOpen, bag, showResultModal, setPlayPhase]);

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
  // Load the scenario only when it actually changes: re-running this (dev hot reload, remounts) must not wipe the
  // room and the bag the trainee packed in the cable-prep lobby.
  useEffect(() => {
    if (useTrainingStore.getState().scenarioId !== scenarioId) resetTraining(scenarioId);
  }, [resetTraining, scenarioId]);

  // ---- Unfinished-run persistence (one save per player × mode × level; separate from academy progress) ----
  const runPlayerId = player?.playerId;
  const runMode: RunKey["mode"] = routeMode === "mission" ? (progress?.selected?.admin ? "mission-admin" : "mission") : "free-practice";
  const runKey = useMemo<RunKey | null>(() => (runPlayerId ? { playerId: runPlayerId, mode: runMode, scenarioId } : null), [runPlayerId, runMode, scenarioId]);
  // undefined = not checked yet for this key; null = nothing to offer (or the player already chose).
  const [resumeOffer, setResumeOffer] = useState<LoadResult | null | undefined>(undefined);
  const resumeKeyRef = useRef("");
  useEffect(() => {
    if (!runKey) return;
    const id = `${runKey.playerId}:${runKey.mode}:${runKey.scenarioId}`;
    if (resumeKeyRef.current === id) return;
    resumeKeyRef.current = id;
    // Only check before the run starts; never touch the stored snapshot here. Deferred one task so the
    // state update does not cascade inside this effect (react-hooks/set-state-in-effect).
    const key = runKey, entered = bag !== null;
    const timer = window.setTimeout(() => {
      if (entered) { setResumeOffer(null); return; }
      const found = loadRun(key);
      setResumeOffer(found.status === "none" ? null : found);
    }, 0);
    return () => { window.clearTimeout(timer); resumeKeyRef.current = ""; };
  }, [runKey, bag]);
  const inRoom = bag !== null && !introOpen && loadedScenarioId === scenarioId;

  const { status: saveStatus, flush: flushRun, discard: discardRun } = useRunAutosave(runKey, inRoom, bag);

  useEffect(() => {
    if (introOpen || bag === null || loadedScenarioId !== scenarioId) return;
    if (trainingCompleted && progress?.selected?.admin) {
      // Administrator inspection must not grant player progression, merit or rank.
      const timer = setTimeout(() => { setReward(null); setShowResultModal(true); }, 1400);
      return () => clearTimeout(timer);
    }
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
  }, [introOpen, bag, trainingCompleted, loadedScenarioId, scenarioId, completeMission, startMission, progress?.selected?.admin]);

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

  const currentTitle = validMission && mission ? mission.title : "ระบบสตูดิโอครบเส้นทาง";
  const difficultyLabel = validMission && mission ? getMissionDifficultyLabel(mission, difficultyLevel) : null;
  const schematicNodes = [["ต้นทาง", "กล้อง / ไมค์"], ["ประมวลผล", "เครื่องสลับภาพ / ผสมเสียง"], ["ปลายทาง", "จอ / รับภาพ / ถ่ายทอด"]];

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
    // Commit the live run before leaving; a failed write keeps the player here with a visible warning.
    if (!flushRun()) { setShowExitConfirm(false); return; }
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

  // Briefing advances to cable preparation; only confirming a valid bag starts play.
  const handlePrepareCables = () => {
    setIntroOpen(false);
  };


  const handleRetry = () => {
    // A new attempt replaces only this level's unfinished snapshot.
    discardRun();
    if (runKey) deleteRun(runKey);
    resetTraining(scenarioId);
    // Every new attempt returns to briefing, followed by cable preparation.
    if (routeMode === "mission" || validClassroom) { setBag(null); setIntroOpen(true); }
    setShowResultModal(false);
  };

  const continueSavedRun = () => {
    if (resumeOffer?.status !== "ok") return;
    const snap = resumeOffer.snapshot;
    // Rebuild the level from its definition, then apply the saved world state before the room is shown.
    resetTraining(scenarioId);
    const t = snap.training;
    useTrainingStore.setState({ ...t, notice: null, wrongStreak: snap.wrongStreak, failed: snap.failed, heldTurn: snap.heldTurn,
      focusedTarget: null, inspecting: null, consoleOpen: false, inspectHoldStart: null, pickMode: "whole" });
    setResumeOffer(null);
    setBag(snap.lobbyBag);
    setIntroOpen(false);
    startMission();
  };
  const startRunOver = () => {
    discardRun();
    if (runKey) deleteRun(runKey);
    resetTraining(scenarioId);
    setResumeOffer(null);
  };
  const resumeContext = validMission && mission && activeScenario.stage ? `${mission.venue} · ${activeScenario.stage.id} · ${difficultyLabel ?? ""}` : "ห้องฝึกอิสระ";

  // Entry order: briefing first, cable preparation next, then immediate gameplay. The classroom offers exactly the leads laid out on its table.
  if (((routeMode === "mission" && validMission) || validClassroom) && !introOpen && bag === null) {
    return <CableLobby
      key={scenarioId}
      scenario={activeScenario} title={currentTitle}
      levelLabel={validClassroom ? "ห้องฝึกปราณสัญญาณ · ฝึกต่อระบบสตูดิโอ" : difficultyLabel ?? ""}
      objective={validClassroom ? "เลือกสายจากโต๊ะสายในห้องฝึก ให้พอต่อกล้อง สวิตเชอร์ จอ เสียง และการบันทึก ครบทั้งระบบ" : difficulty?.objective}
      playerName={player.nickname}
      only={validClassroom ? packableCatalogIds(activeScenario) : undefined}
      backLabel="กลับหน้าใบงาน"
      onBack={() => setIntroOpen(true)}
      onConfirm={(packed) => {
        // Missions: re-validate against the level being entered (never a stale or other level's bag).
        if (activeScenario.stage ? !checkMissionBag(activeScenario, packed).ok : !Object.values(packed).some((n) => Number.isFinite(n) && n >= 1)) return;
        setBag(packed);
        resetTraining(scenarioId, hiddenCablesFor(activeScenario, packed), packedLeadsFor(activeScenario, packed));
        setIntroOpen(false);
        startMission();
      }}
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
        backLabel="ย้อนกลับ"
        brandInert={!introOpen && !showResultModal}
        breadcrumb={difficultyLabel ? `${mission?.title} > ${difficultyLabel}` : "ห้องฝึกปราณสัญญาณ"}
      />
      {/* While playing the top bar is gone; this small pause button is the way out (opens the exit confirmation). */}
      {!introOpen && !showResultModal && !showExitConfirm && (
        <button type="button" className="game-pause-btn" onClick={handleTriggerGameplayBack} aria-label="หยุดเกม / ออกจากด่าน" title="หยุดเกม / ออกจากด่าน">
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
          {(routeMode === "mission" || validClassroom) && bag && <button type="button" className="cl-bag-button" onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setBagOpen(true); }} title="เปิดกระเป๋า (R)">🎒 กระเป๋า <b className="cl-bag-badge">{bagCount}</b></button>}
          {bagOpen && bag && <BagPanel bag={bag} onClose={() => setBagOpen(false)} />}
          {hasStage && <button type="button" className="cl-bag-button" style={{ top: "auto", bottom: 86 }} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); useTrainingStore.getState().setConsoleOpen(true); }} title="คอนโซลควบคุม (C)">🎛 คอนโซล (C)</button>}
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
      {introOpen && resumeOffer && resumeOffer.status !== "none" && (
        <ResumeRunDialog
          context={resumeContext}
          savedAt={resumeOffer.status === "ok" ? resumeOffer.snapshot.savedAt : resumeOffer.savedAt}
          incompatibleReason={resumeOffer.status === "incompatible" ? resumeOffer.reason : undefined}
          onContinue={continueSavedRun}
          onStartOver={startRunOver}
          onLeave={() => router.push(routeMode === "mission" ? "/missions" : "/academy")}
        />
      )}

      {inRoom && <SaveStatusPill status={saveStatus} onRetry={() => flushRun(true)} />}

      {introOpen && (
        <div className="instructions-modal-backdrop briefing-backdrop">
          <section className="play-intro-wrapper briefing-frame glass-card technical-panel gold-border-frame with-corner-runes" aria-labelledby="play-intro-title">
            <header className="briefing-header">
              <BackButton onClick={handleBackFromIntro} label="ย้อนกลับ" />
              <div className="briefing-heading">
                <div className="intro-room-badge">
                  <Image src="/images/xianxia/emblem.webp" alt="โลโก้ etcstream" width={35} height={30} className="brand-sigil intro-sigil" />
                  <strong>{validMission && mission ? mission.venue : "ห้องฝึกปราณสัญญาณ"}</strong>
                </div>
                <h1 id="play-intro-title" className="intro-mode-title">{validMission && activeScenario.stage ? activeScenario.stage.title : currentTitle}</h1>
                <div className="briefing-meta">
                  {validMission && activeScenario.stage && <span>รหัสภารกิจ {activeScenario.stage.id} · {currentTitle}</span>}
                  {difficultyLabel && <strong className="mission-level-label">{difficultyLabel}</strong>}
                </div>
              </div>
            </header>
            <div className="play-intro-grid briefing-body" tabIndex={0} role="region" aria-label="เนื้อหาใบงานและภาพรวมสัญญาณ">
              {validMission && activeScenario.stage && mission ? <div className="intro-info-card briefing-cards">
                {/* Mission mode: purpose, goal and approach only; never cables, counts or port pairs. */}
                <p className="intro-narrative briefing-scroll-quote">“{mission.description}”</p>
                {missionBriefing(activeScenario, mission.venue, difficulty?.objective).map((card) => <article key={card.id} className={`briefing-card is-${card.id}`}>
                  <h2><span className="briefing-card-icon" aria-hidden="true">{card.icon}</span>{card.title}</h2>
                  {card.lines.length === 1 || card.id === "identity"
                    ? card.lines.map((line, i) => <p key={i} className={i === 0 && card.id === "identity" ? "briefing-card-lead" : undefined}>{line}</p>)
                    : <ul>{card.lines.map((line) => <li key={line}>{line}</li>)}</ul>}
                </article>)}
              </div> : <div className="intro-info-card briefing-cards">
                {/* Free Practice: open-ended, no pass condition and no stage code. */}
                <p className="intro-narrative briefing-scroll-quote">“ห้องสตูดิโอครบเส้นทาง พื้นที่ให้ลองผิดลองถูกได้อย่างปลอดภัย”</p>
                {FREE_PRACTICE_CARDS.map((card) => <article key={card.title} className="briefing-card">
                  <h2><span className="briefing-card-icon" aria-hidden="true">{card.icon}</span>{card.title}</h2>
                  {card.lines.length === 1 ? <p>{card.lines[0]}</p> : <ul>{card.lines.map((line) => <li key={line}>{line}</li>)}</ul>}
                </article>)}
              </div>}

              {/* Right Stylized Graphic (Pedestals in Celestial Arch) */}
              <div className="intro-preview-card glass-panel scholar-framed-preview">
                <div className="preview-artwork-wrap">
                  <div className="lesson-schematic" aria-label="ภาพรวมเส้นทางสัญญาณ ต้นทาง ผ่านการประมวลผล ไปยังปลายทาง">
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
            <footer className="briefing-actions">
              <p>{validMission ? "เมื่อเข้าใจภารกิจแล้ว จงไปเตรียมสายด้วยวิจารณญาณของเจ้าเอง" : "พร้อมแล้ว เลือกสายจากโต๊ะสายของห้องฝึกในขั้นตอนถัดไป"}</p>
              <ActionButton variant="gold" size="lg" onClick={handlePrepareCables}>เตรียมสาย</ActionButton>
            </footer>
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
      {/* Mission: too many wrong connections in a row = level not passed. */}
      {routeMode === "mission" && trainingFailed && !showResultModal && (
        <div className="exit-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="fail-title">
          <div className="exit-confirm-modal glass-card dialog-panel gold-border-frame with-corner-runes">
            <h2 id="fail-title" className="exit-confirm-title">ไม่ผ่านด่าน</h2>
            <p className="exit-confirm-desc">ต่อสายผิดติดต่อกัน {MAX_WRONG_STREAK} ครั้ง — ตรวจทิศทาง OUTPUT → INPUT ชนิดสัญญาณ และสายที่เลือกมาแล้วลองใหม่</p>
            <div className="exit-confirm-actions">
              <ActionButton variant="glass" size="md" arrow={false} onClick={() => router.push("/missions")}>กลับหอภารกิจ</ActionButton>
              <ActionButton variant="gold" size="md" onClick={handleRetry}>กลับห้องเตรียมสาย</ActionButton>
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
