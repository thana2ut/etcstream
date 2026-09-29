"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDifficultyMeta, getMissionBySlug, missionChapters } from "@/game/content/mission-catalog";
import { isDifficultyUnlocked } from "@/game/persistence/mission-progress-repository";
import { useAcademyStore } from "@/game/stores/academy-store";
import { AcademyHeader } from "@/components/ui/academy-header";
import { ActionButton } from "@/components/ui/action-buttons";
import { FantasyBackground } from "@/components/ui/fantasy-background";
import { soundEngine } from "@/game/audio/sound-engine";

export default function MissionHall() {
  const router = useRouter();
  const { hydrated, player, progress, hydrate, selectMission } = useAcademyStore();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [error, setError] = useState("");
  const detailRef = useRef<HTMLElement>(null);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && !player) router.replace("/"); }, [hydrated, player, router]);
  useEffect(() => { if (selectedSlug) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [selectedSlug]);

  if (!hydrated || !player || !progress) {
    return <main className="fantasy-viewport mission-loading"><p>กำลังเปิดหอภารกิจ...</p></main>;
  }

  const selectedMission = getMissionBySlug(selectedSlug);
  const difficulty = selectedMission ? getDifficultyMeta(selectedMission, selectedLevel) : null;

  const startSelectedMission = () => {
    if (!selectedMission || !difficulty) return;
    if (!selectMission(selectedMission.slug, difficulty.level)) {
      setError("เริ่มภารกิจไม่ได้ โปรดตรวจการตั้งค่าเบราว์เซอร์แล้วลองอีกครั้ง");
      return;
    }
    soundEngine.play("mission_accept");
    router.push(`/play?mode=mission&mission=${selectedMission.slug}&difficulty=${difficulty.level}`);
  };

  return (
    <main className="fantasy-viewport mission-hall-page">
      <FantasyBackground variant="archive" />
      <AcademyHeader traineeName={player.nickname} onBack={() => router.push("/academy")} backLabel="กลับโถงสำนัก" />
      <div className="mission-hall-content">
        <header className="mission-hall-heading">
          <span className="mission-hall-eyebrow">◈ หอจารึกแห่งภารกิจ ◈</span>
          <h1>วันนี้เจ้าอยากรับภารกิจใด</h1>
          <p>เลือกด่านที่เจ้าต้องการฝึกฝนในวันนี้ แต่ละภารกิจจะพาเจ้าเรียนรู้ผ่านบททดสอบของสำนัก และท้าทายได้ตั้งแต่ระดับ 1 ถึงระดับ 5</p>
        </header>

        <section className="mission-board-grid" aria-label="ภารกิจของสำนัก">
          {missionChapters.map((mission, index) => {
            const cleared = progress.completed[mission.slug]?.length ?? 0;
            return (
              <button
                key={mission.id}
                type="button"
                className={`mission-plaque glass-card ${selectedSlug === mission.slug ? "is-selected" : ""}`}
                aria-pressed={selectedSlug === mission.slug}
                onClick={() => { setSelectedSlug(mission.slug); setSelectedLevel(1); setError(""); soundEngine.play("mission_reveal"); }}
              >
                <span className="mission-plaque-number">บทที่ {String(index + 1).padStart(2, "0")}</span>
                <span className="mission-plaque-sigil" aria-hidden="true">{["✦", "☾", "◇", "⌘", "♛"][index]}</span>
                <strong>{mission.title}</strong>
                <span className="mission-plaque-subtitle">{mission.subtitle}</span>
                <span className="mission-plaque-description">{mission.description}</span>
                <span className="mission-plaque-footer"><span>ผ่านแล้ว {cleared}/5 ระดับ</span><span>เลือกภารกิจ →</span></span>
              </button>
            );
          })}
        </section>

        {selectedMission && (
          <section ref={detailRef} className="mission-choice-panel glass-card gold-border-frame" aria-labelledby="selected-mission-title">
            <div className="mission-choice-intro">
              <span className="mission-hall-eyebrow">ตราภารกิจที่เลือก</span>
              <h2 id="selected-mission-title">{selectedMission.title}</h2>
              <p className="mission-choice-subtitle">{selectedMission.subtitle}</p>
              <p>{selectedMission.description}</p>
              <small>ภาพแห่งภารกิจ: {selectedMission.themeHint}</small>
            </div>
            <h3 className="mission-difficulty-heading">ระดับความยากของด่าน</h3>
            <div className="mission-difficulty-grid" role="group" aria-label="เลือกระดับความยาก">
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
                    onClick={() => { setSelectedLevel(item.level); setError(""); soundEngine.play("button_click"); }}
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
              <ActionButton variant="gold" size="lg" onClick={startSelectedMission}>เริ่มภารกิจนี้</ActionButton>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
