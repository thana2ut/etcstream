"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
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
 * - `draw` (public /missions): venues are sealed; "รับภารกิจ" spins a roulette over the cards and assigns one.
 *   The assignment can be redrawn once; a new one can be drawn only after all 5 levels of it are cleared.
 * - `admin` (embedded in /admin): the original hall — every venue can be opened and played.
 */
export function MissionHall({ admin = false, embedded = false, active = true, onPreview }: { admin?: boolean; embedded?: boolean; active?: boolean; onPreview?: (slug: string, level: number) => Promise<void> }) {
  const Container = embedded ? "section" : "main";
  const router = useRouter();
  const previewOnly = admin && Boolean(onPreview);
  const { hydrated: storedHydrated, player: storedPlayer, progress: storedProgress, hydrate, selectMission } = useAcademyStore();
  const hydrated = previewOnly || storedHydrated;
  const player = useMemo(() => previewOnly ? { playerId: "admin-preview", nickname: "ผู้ดูแล · ไม่บันทึกผล" } : storedPlayer, [previewOnly, storedPlayer]);
  const progress = previewOnly ? { version: 1 as const, playerId: "admin-preview", selected: null, completed: {} as Record<string, number[]> } : storedProgress;
  const [launching, setLaunching] = useState(false);
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

  useEffect(() => { if (!previewOnly) hydrate(); }, [hydrate, previewOnly]);
  useEffect(() => { if (hydrated && !player && !embedded) router.replace("/"); }, [hydrated, player, router, embedded]);
  // The mission detail opens as its own page over the hall: start at its top, lock the hall behind it, ESC goes back.
  const detailOpen = active && Boolean(selectedSlug) && !rolling;
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
    return <Container className={embedded ? "arena-panel" : "fantasy-viewport mission-loading"}><p>{hydrated && !player ? "หอภารกิจเดิมต้องใช้โปรไฟล์ฝึกในเบราว์เซอร์นี้ กรุณาสร้างโปรไฟล์ที่หน้าต้อนรับก่อน ระบบจะไม่สร้างผู้เล่นหรือผลภารกิจแทนคุณ" : "กำลังเปิดหอภารกิจ..."}</p>{embedded && hydrated && !player && <Link href="/">ไปหน้าต้อนรับ</Link>}</Container>;
  }

  const record = previewOnly ? null : drawnLocal ?? missionDrawRepository.load(player.playerId);
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

  const startMission = async (slug: string, level: number) => {
    if (previewOnly && onPreview) {
      if (launching) return;
      setLaunching(true); setError("");
      try { await onPreview(slug, level); } catch (e) { setError((e as Error).message); }
      finally { setLaunching(false); }
      return;
    }
    if (!selectMission(slug, level, admin)) {
      setError("เริ่มภารกิจไม่ได้ โปรดตรวจการตั้งค่าเบราว์เซอร์แล้วลองอีกครั้ง");
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
    <Container className={`fantasy-viewport mission-hall-page${embedded ? " mission-hall-embedded" : ""}${admin && embedded ? " mission-hall-compact-admin" : ""}`}>
      {!embedded && <FantasyBackground variant="archive" image="/images/xianxia/bg-missions.webp" />}
      {!embedded && <AcademyHeader traineeName={player.nickname} onBack={() => router.push(admin ? "/admin" : "/academy")} backLabel={admin ? "กลับหน้าผู้ดูแล" : "กลับโถงสำนัก"} />}
      <div className="mission-hall-content">
        <header className="mission-hall-heading">
          <span className="mission-hall-eyebrow">◈ หอจารึกแห่งภารกิจ{admin ? " · ผู้ดูแล" : ""} ◈</span>
          <h1>{admin ? "หอจารึกแห่งภารกิจ" : "วันนี้เจ้าอยากรับภารกิจใด"}</h1>
          <p>{admin
            ? <>โหมดผู้ดูแล: เปิดตรวจได้ครบ 5 สถานที่ 25 ระดับ · ไม่ปลดล็อกหรือบันทึกผลให้ผู้เล่น</>
            : <>กดรับภารกิจ แล้วหอจารึกจะสุ่มมอบสถานที่ให้เจ้าหนึ่งแห่ง<br />ผ่านครบ 5 ระดับของสถานที่นั้นจึงรับภารกิจใหม่ได้</>}</p>
        </header>

        {!admin && <MissionDrawPanel
          rolling={rolling} canDraw={canDraw} canReroll={canReroll} rerollsUsed={rerollsUsed} maxRerolls={MAX_REROLLS}
          drawnTitle={drawn ? getMissionBySlug(drawn)?.title ?? null : null} drawnCleared={drawn ? clearedOf(drawn) : 0}
          onRoll={() => spin(false)} onReroll={() => spin(true)}
          onOpen={() => { if (!drawn) return; const m = getMissionBySlug(drawn); setSelectedSlug(drawn); setSelectedLevel(m?.difficulties.find((d) => !progress.completed[drawn]?.includes(d.level))?.level ?? 1); setError(""); soundEngine.play("mission_reveal"); }}
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
                {admin && embedded && <span className="admin-chapter-art" aria-hidden="true" />}
                <span className="mission-plaque-number">บทที่ {String(index + 1).padStart(2, "0")}</span>
                <span className="mission-plaque-sigil" aria-hidden="true">{["✦", "☾", "◇", "⌘", "♛"][index]}</span>
                <strong>{mission.title}</strong>
                {!(admin && embedded) && <span className="mission-plaque-subtitle">{mission.subtitle}</span>}
                <span className="mission-plaque-place">{!(admin && embedded) && "สถานที่: "}{mission.venue}{!(admin && embedded) && <><br />ลักษณะงาน: {mission.venueConcept}</>}</span>
                <span className="mission-plaque-description">{admin && embedded ? ["ฝึกภาพและเสียงสำหรับห้องเรียนไฮบริด", "ฝึกหลายกล้องและเสียงในงานสตูดิโอ", "ฝึกควบคุมภาพและเสียงสำหรับหอประชุม", "ฝึกจัดระบบภาพและเสียงงานกลางแจ้ง", "ฝึกระบบถ่ายทอดสดการแข่งขันกีฬา"][index] : mission.description}</span>
                <span className="mission-plaque-footer">
                  <span>{previewOnly ? "5 ระดับ · ไม่บันทึกผล" : cleared >= 5 ? "ผ่านครบ 5/5 ระดับ ✓" : `ผ่านแล้ว ${cleared}/5 ระดับ`}</span>
                  <span>{open ? admin && embedded ? "เลือกบท →" : "เลือกภารกิจ →" : cleared >= 5 ? "สำเร็จแล้ว" : "รอสุ่มภารกิจ"}</span>
                </span>
              </button>
            );
          })}
        </section>

        {/* Portal: the hall content is its own stacking context, so the detail page must live at <body> to cover the header. */}
        {active && selectedMission && createPortal(
          <div ref={detailRef} className="mission-detail-page" role="dialog" aria-modal="true" aria-labelledby="selected-mission-title">
          <FantasyBackground variant="archive" image="/images/xianxia/bg-mission-detail.webp" />
          <div className="mission-detail-inner">
          <button type="button" className="mission-detail-back" onClick={() => setSelectedSlug(null)}>
            <span className="mission-detail-back-arrow" aria-hidden="true">
              <svg viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
            </span>
            <span>กลับหอภารกิจ</span>
          </button>
          <section className="mission-choice-panel glass-card gold-border-frame">
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
                // Admin hall: every level is open so each room can be played and adjusted directly.
                const unlocked = admin || isDifficultyUnlocked(progress, selectedMission.slug, item.level);
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
                    <span>{item.flavor.replace(/\s*·\s*\d+[–-]\d+\s*นาที\s*$/, "")}</span>
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
              <ActionButton variant="gold" size="lg" disabled={launching} onClick={() => { if (difficulty) void startMission(selectedMission.slug, difficulty.level); }}>{launching ? "กำลังเตรียมชุดสาย…" : previewOnly ? "เข้าดูในโหมดผู้ดูแล" : "เริ่มภารกิจนี้"}</ActionButton>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </section>
          </div>
          </div>,
          document.body,
        )}
      </div>
    </Container>
  );
}
