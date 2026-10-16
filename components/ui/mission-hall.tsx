"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getDifficultyMeta, getMissionBySlug, missionChapters } from "@/game/content/mission-catalog";
import { isDifficultyUnlocked } from "@/game/persistence/mission-progress-repository";
import { missionDrawRepository, MAX_REROLLS } from "@/game/persistence/mission-draw-repository";
import { cryptoRandom } from "@/game/content/mission-ranks";
import { useAcademyStore } from "@/game/stores/academy-store";
import { AcademyHeader } from "./academy-header";
import { ActionButton } from "./action-buttons";
import { FantasyBackground } from "./fantasy-background";
import { MissionDrawPanel } from "./mission-draw";
import { soundEngine } from "@/game/audio/sound-engine";

/**
 * Mission hall.
 * - `draw` (public /missions): venues are sealed; "Take a mission" spins a roulette over the cards and assigns one.
 *   The assignment can be redrawn once; a new one can be drawn only after all 5 levels of it are cleared.
 * - `admin` (unlisted /missions/admin): the original hall — every venue can be opened and played.
 */
export function MissionHall({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const { hydrated, player, progress, hydrate, selectMission } = useAcademyStore();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [error, setError] = useState("");
  const detailRef = useRef<HTMLDivElement>(null);
  const [rollIndex, setRollIndex] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [drawnLocal, setDrawnLocal] = useState<{ slug: string; rerolls: number } | null>(null);
  const timers = useRef<number[]>([]);
  const stopSpin = useRef<(() => void) | null>(null);
  useEffect(() => () => { timers.current.forEach((id) => window.clearTimeout(id)); stopSpin.current?.(); }, []);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && !player) router.replace("/"); }, [hydrated, player, router]);
  // The mission detail opens as its own page over the hall: start at its top, lock the hall behind it, ESC goes back.
  const detailOpen = Boolean(selectedSlug) && !rolling;
  useEffect(() => {
    if (!detailOpen) return;
    detailRef.current?.scrollTo({ top: 0 });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedSlug(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [detailOpen, selectedSlug]);

  if (!hydrated || !player || !progress) {
    return <main className="fantasy-viewport mission-loading"><p>Opening the Mission Hall...</p></main>;
  }

  const record = drawnLocal ?? missionDrawRepository.load(player.playerId);
  const drawn = record?.slug ?? null;
  const rerollsUsed = record?.rerolls ?? 0;
  const clearedOf = (slug: string) => progress.completed[slug]?.length ?? 0;
  const canDraw = !drawn || clearedOf(drawn) >= 5;
  // A redraw is only possible on a fresh assignment (nothing of it cleared yet) and only MAX_REROLLS times.
  const canReroll = !canDraw && Boolean(drawn) && rerollsUsed < MAX_REROLLS && clearedOf(drawn!) === 0;

  const spin = (reroll: boolean) => {
    if (rolling) return;
    // Equal chance among venues not yet fully cleared (all venues once everything is done); a redraw never repeats.
    const all = missionChapters.map((m, i) => ({ m, i }));
    let pool = all.filter(({ m }) => clearedOf(m.slug) < 5 && !(reroll && m.slug === drawn));
    if (!pool.length) pool = all.filter(({ m }) => !(reroll && m.slug === drawn));
    const target = pool[Math.floor(cryptoRandom() * pool.length)];
    const n = missionChapters.length, laps = 4;
    const steps = n * laps + ((target.i - (n * laps) % n) + n) % n;
    const rerolls = reroll ? rerollsUsed + 1 : 0;
    setRolling(true);
    setSelectedSlug(null);
    setError("");
    setRollIndex(0);
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    // The spin follows the roulette track: it lasts as long as the clip (clamped), fast first, easing into the stop.
    const schedule = (seconds: number) => {
      const total = Math.min(Math.max(seconds || 3.8, 2.8), 5.2) * 1000;
      for (let s = 1; s <= steps; s++) {
        const at = total * (1 - Math.pow(1 - s / steps, 2.4));
        timers.current.push(window.setTimeout(() => {
          setRollIndex(s % n);
          if (s === steps) {
            stopSpin.current?.();
            stopSpin.current = null;
            soundEngine.play("draw_result");
            missionDrawRepository.save(player.playerId, target.m.slug, rerolls);
            setDrawnLocal({ slug: target.m.slug, rerolls });
            setRolling(false);
            setSelectedSlug(target.m.slug);
            setSelectedLevel(target.m.difficulties.find((d) => !progress.completed[target.m.slug]?.includes(d.level))?.level ?? 1);
          }
        }, at));
      }
    };
    let scheduled = false;
    stopSpin.current = soundEngine.startSpin((seconds) => { if (!scheduled) { scheduled = true; schedule(seconds); } });
    // Never wait on audio metadata (muted / blocked autoplay): start on the default timing.
    timers.current.push(window.setTimeout(() => { if (!scheduled) { scheduled = true; schedule(0); } }, 250));
  };

  const selectable = (slug: string) => admin || (!rolling && drawn === slug);
  const selectedMission = selectedSlug && selectable(selectedSlug) ? getMissionBySlug(selectedSlug) : null;
  const difficulty = selectedMission ? getDifficultyMeta(selectedMission, selectedLevel) : null;

  const startMission = (slug: string, level: number) => {
    if (!selectMission(slug, level, admin)) {
      setError("Could not start the mission — check your browser settings and try again");
      return;
    }
    soundEngine.play("mission_accept");
    const href = `/play?mode=mission&mission=${slug}&difficulty=${level}`;
    router.prefetch(href);
    // Fade a veil over the hall first so the heavy /play mount happens out of sight; /play lifts it.
    if (document.getElementById("route-veil")) return;
    const veil = document.createElement("div");
    veil.id = "route-veil";
    veil.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#050d1a;opacity:0;transition:opacity .35s ease;pointer-events:all";
    document.body.appendChild(veil);
    requestAnimationFrame(() => { veil.style.opacity = "1"; });
    timers.current.push(window.setTimeout(() => router.push(href), 360));
  };

  return (
    <main className="fantasy-viewport mission-hall-page">
      <FantasyBackground variant="archive" image="/images/xianxia/bg-missions.webp" />
      <AcademyHeader traineeName={player.nickname} onBack={() => router.push("/academy")} backLabel="Back to the hall" />
      <div className="mission-hall-content">
        <header className="mission-hall-heading">
          <span className="mission-hall-eyebrow">◈ Mission Hall{admin ? " · Admin" : ""} ◈</span>
          <h1>{admin ? "Every academy mission" : "Which job will you take today?"}</h1>
          <p>{admin
            ? <>Admin mode: every venue is open; levels still unlock in order</>
            : <>Take a mission and the hall assigns you one venue<br />Clear all 5 levels of it to take a new one</>}</p>
        </header>

        {!admin && <MissionDrawPanel
          rolling={rolling} canDraw={canDraw} canReroll={canReroll} rerollsUsed={rerollsUsed} maxRerolls={MAX_REROLLS}
          drawnTitle={drawn ? getMissionBySlug(drawn)?.title ?? null : null} drawnCleared={drawn ? clearedOf(drawn) : 0}
          onRoll={() => spin(false)} onReroll={() => spin(true)}
          onOpen={() => { if (!drawn) return; const m = getMissionBySlug(drawn); setSelectedSlug(drawn); setSelectedLevel(m?.difficulties.find((d) => !progress.completed[drawn]?.includes(d.level))?.level ?? 1); setError(""); soundEngine.play("mission_reveal"); }}
        />}

        <section className="mission-board-grid" aria-label="Academy missions">
          {missionChapters.map((mission, index) => {
            const cleared = clearedOf(mission.slug);
            const open = selectable(mission.slug);
            const lit = rolling && rollIndex === index;
            const isDrawn = !admin && open;
            return (
              <button
                key={mission.id}
                type="button"
                className={`mission-plaque glass-card ${selectedSlug === mission.slug ? "is-selected" : ""} ${lit ? "is-rolling" : ""} ${isDrawn ? "is-drawn" : ""} ${!open && !lit ? "is-sealed" : ""}`}
                disabled={!open}
                style={{ "--plaque-art": `url(/images/xianxia/card-${index + 1}.webp)` } as CSSProperties}
                aria-pressed={selectedSlug === mission.slug}
                onClick={() => { setSelectedSlug(mission.slug); setSelectedLevel(mission.difficulties.find((d) => !progress.completed[mission.slug]?.includes(d.level))?.level ?? 1); setError(""); soundEngine.play("mission_reveal"); }}
              >
                <span className="mission-plaque-number">Chapter {String(index + 1).padStart(2, "0")}</span>
                <span className="mission-plaque-sigil" aria-hidden="true">{["✦", "☾", "◇", "⌘", "♛"][index]}</span>
                <strong>{mission.title}</strong>
                <span className="mission-plaque-subtitle">{mission.subtitle}</span>
                <span className="mission-plaque-place">Venue: {mission.venue}<br />Job type: {mission.venueConcept}</span>
                <span className="mission-plaque-description">{mission.description}</span>
                <span className="mission-plaque-footer">
                  <span>{cleared >= 5 ? "All 5/5 levels cleared ✓" : `${cleared}/5 levels cleared`}</span>
                  <span>{open ? "Choose →" : cleared >= 5 ? "Completed" : "Awaiting draw"}</span>
                </span>
              </button>
            );
          })}
        </section>

        {/* Portal: the hall content is its own stacking context, so the detail page must live at <body> to cover the header. */}
        {selectedMission && createPortal(
          <div ref={detailRef} className="mission-detail-page" role="dialog" aria-modal="true" aria-labelledby="selected-mission-title">
          <FantasyBackground variant="archive" image="/images/xianxia/bg-mission-detail.webp" />
          <div className="mission-detail-inner">
          <button type="button" className="mission-detail-back" onClick={() => setSelectedSlug(null)}>
            <span className="mission-detail-back-arrow" aria-hidden="true">
              <svg viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
            </span>
            <span>Back to the Mission Hall</span>
          </button>
          <section className="mission-choice-panel glass-card gold-border-frame">
            <div className="mission-choice-intro">
              <span className="mission-hall-eyebrow">{admin ? "Selected mission" : "✦ Your mission ✦"}</span>
              <h2 id="selected-mission-title">{selectedMission.title}</h2>
              <p className="mission-choice-subtitle">{selectedMission.subtitle}</p>
              <p className="mission-choice-venue">Venue: {selectedMission.venue}<br />Job type: {selectedMission.venueConcept}</p>
              <p>{selectedMission.description}</p>
              <small>Theme: {selectedMission.themeHint}</small>
            </div>
            <h3 className="mission-difficulty-heading">Five levels at this venue</h3>
            <div className="mission-difficulty-grid" role="group" aria-label="Choose a level">
              {selectedMission.difficulties.map((item) => {
                // Admin hall: every level is open so each room can be played and adjusted directly.
                const unlocked = admin || isDifficultyUnlocked(progress, selectedMission.slug, item.level);
                const completed = progress.completed[selectedMission.slug]?.includes(item.level);
                return (
                  <button
                    key={item.level}
                    type="button"
                    className={`mission-difficulty-tile ${selectedLevel === item.level ? "is-selected" : ""}`}
                    aria-pressed={unlocked && selectedLevel === item.level}
                    aria-label={`Level ${item.level} ${item.title}${unlocked ? "" : " (locked)"}`}
                    disabled={!unlocked}
                    onClick={() => { setSelectedLevel(item.level); setError(""); }}
                  >
                    <span className="mission-difficulty-number">{unlocked ? `Level ${item.level}` : `🔒 Level ${item.level}`}</span>
                    <strong>{item.title}</strong>
                    <span>{item.flavor}</span>
                    {completed && <em>Cleared ✓</em>}
                  </button>
                );
              })}
            </div>
            <div className="mission-choice-footer">
              <div>
                <strong>{difficulty ? `Level ${difficulty.level} · ${difficulty.title}` : ""}</strong>
                <p>{difficulty?.objective}</p>
              </div>
              <ActionButton variant="gold" size="lg" onClick={() => difficulty && startMission(selectedMission.slug, difficulty.level)}>Start this mission</ActionButton>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </section>
          </div>
          </div>,
          document.body,
        )}
      </div>
    </main>
  );
}
