"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
 * - `draw` (public /missions): venues are sealed; "รับภารกิจ" spins a roulette over the cards and assigns one.
 *   The assignment can be redrawn once; a new one can be drawn only after all 5 levels of it are cleared.
 * - `admin` (unlisted /missions/admin): the original hall — every venue can be opened and played.
 */
export function MissionHall({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const { hydrated, player, progress, hydrate, selectMission } = useAcademyStore();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [error, setError] = useState("");
  const detailRef = useRef<HTMLElement>(null);
  const [rollIndex, setRollIndex] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [drawnLocal, setDrawnLocal] = useState<{ slug: string; rerolls: number } | null>(null);
  const timers = useRef<number[]>([]);
  const stopSpin = useRef<(() => void) | null>(null);
  useEffect(() => () => { timers.current.forEach((id) => window.clearTimeout(id)); stopSpin.current?.(); }, []);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && !player) router.replace("/"); }, [hydrated, player, router]);
  useEffect(() => { if (selectedSlug && !rolling) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selectedSlug, rolling]);

  if (!hydrated || !player || !progress) {
    return <main className="fantasy-viewport mission-loading"><p>กำลังเปิดหอภารกิจ...</p></main>;
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
    if (!selectMission(slug, level)) {
      setError("เริ่มภารกิจไม่ได้ โปรดตรวจการตั้งค่าเบราว์เซอร์แล้วลองอีกครั้ง");
      return;
    }
    soundEngine.play("mission_accept");
    router.push(`/play?mode=mission&mission=${slug}&difficulty=${level}`);
  };

  return (
    <main className="fantasy-viewport mission-hall-page">
      <FantasyBackground variant="archive" image="/images/xianxia/bg-missions.webp" />
      <AcademyHeader traineeName={player.nickname} onBack={() => router.push("/academy")} backLabel="กลับโถงสำนัก" />
      <div className="mission-hall-content">
        <header className="mission-hall-heading">
          <span className="mission-hall-eyebrow">◈ หอจารึกแห่งภารกิจ{admin ? " · ผู้ดูแล" : ""} ◈</span>
          <h1>{admin ? "ทุกภารกิจของสำนัก" : "วันนี้เจ้าอยากรับภารกิจใด"}</h1>
          <p>{admin
            ? <>โหมดผู้ดูแล: เปิดดูและเล่นได้ทุกสถานที่ ระดับยังปลดล็อกตามลำดับเหมือนเดิม</>
            : <>กดรับภารกิจ แล้วหอจารึกจะสุ่มมอบสถานที่ให้เจ้าหนึ่งแห่ง<br />ผ่านครบ 5 ระดับของสถานที่นั้นจึงรับภารกิจใหม่ได้</>}</p>
        </header>

        {!admin && <MissionDrawPanel
          rolling={rolling} canDraw={canDraw} canReroll={canReroll} rerollsUsed={rerollsUsed} maxRerolls={MAX_REROLLS}
          drawnTitle={drawn ? getMissionBySlug(drawn)?.title ?? null : null} drawnCleared={drawn ? clearedOf(drawn) : 0}
          onRoll={() => spin(false)} onReroll={() => spin(true)}
        />}

        <section className="mission-board-grid" aria-label="ภารกิจของสำนัก">
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
                <span className="mission-plaque-number">บทที่ {String(index + 1).padStart(2, "0")}</span>
                <span className="mission-plaque-sigil" aria-hidden="true">{["✦", "☾", "◇", "⌘", "♛"][index]}</span>
                <strong>{mission.title}</strong>
                <span className="mission-plaque-subtitle">{mission.subtitle}</span>
                <span className="mission-plaque-place">สถานที่: {mission.venue}<br />ลักษณะงาน: {mission.venueConcept}</span>
                <span className="mission-plaque-description">{mission.description}</span>
                <span className="mission-plaque-footer">
                  <span>{cleared >= 5 ? "ผ่านครบ 5/5 ระดับ ✓" : `ผ่านแล้ว ${cleared}/5 ระดับ`}</span>
                  <span>{open ? "เลือกภารกิจ →" : cleared >= 5 ? "สำเร็จแล้ว" : "รอสุ่มภารกิจ"}</span>
                </span>
              </button>
            );
          })}
        </section>

        {selectedMission && (
          <section ref={detailRef} className="mission-choice-panel glass-card gold-border-frame" aria-labelledby="selected-mission-title">
            <div className="mission-choice-intro">
              <span className="mission-hall-eyebrow">{admin ? "ตราภารกิจที่เลือก" : "✦ ภารกิจที่ได้รับ ✦"}</span>
              <h2 id="selected-mission-title">{selectedMission.title}</h2>
              <p className="mission-choice-subtitle">{selectedMission.subtitle}</p>
              <p className="mission-choice-venue">สถานที่: {selectedMission.venue}<br />ลักษณะงาน: {selectedMission.venueConcept}</p>
              <p>{selectedMission.description}</p>
              <small>ภาพแห่งภารกิจ: {selectedMission.themeHint}</small>
            </div>
            <h3 className="mission-difficulty-heading">บทเรียน 5 ระดับของสถานที่</h3>
            <div className="mission-difficulty-grid" role="group" aria-label="เลือกระดับบทเรียน">
              {selectedMission.difficulties.map((item) => {
                const unlocked = isDifficultyUnlocked(progress, selectedMission.slug, item.level);
                const completed = progress.completed[selectedMission.slug]?.includes(item.level);
                return (
                  <button
                    key={item.level}
                    type="button"
                    className={`mission-difficulty-tile ${selectedLevel === item.level ? "is-selected" : ""}`}
                    aria-pressed={unlocked && selectedLevel === item.level}
                    aria-label={`ระดับ ${item.level} ${item.title}${unlocked ? "" : " ยังไม่ปลดล็อก"}`}
                    disabled={!unlocked}
                    onClick={() => { setSelectedLevel(item.level); setError(""); }}
                  >
                    <span className="mission-difficulty-number">{unlocked ? `ระดับ ${item.level}` : `🔒 ระดับ ${item.level}`}</span>
                    <strong>{item.title}</strong>
                    <span>{item.flavor}</span>
                    {completed && <em>ผ่านแล้ว ✓</em>}
                  </button>
                );
              })}
            </div>
            <div className="mission-choice-footer">
              <div>
                <strong>{difficulty ? `ระดับ ${difficulty.level} · ${difficulty.title}` : ""}</strong>
                <p>{difficulty?.objective}</p>
              </div>
              <ActionButton variant="gold" size="lg" onClick={() => difficulty && startMission(selectedMission.slug, difficulty.level)}>เริ่มภารกิจนี้</ActionButton>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
