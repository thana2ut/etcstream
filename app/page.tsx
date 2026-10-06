"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { academyCopy as copy } from "@/game/content/academy-copy";
import { createPlayer } from "@/game/persistence/player-repository";
import type { Player } from "@/game/types";
import { useAcademyStore } from "@/game/stores/academy-store";
import { AcademyHeader } from "@/components/ui/academy-header";
import { ActionButton } from "@/components/ui/action-buttons";
import { InstructionsModal } from "@/components/ui/instructions-modal";
import { FantasyBackground } from "@/components/ui/fantasy-background";
import { BackButton } from "@/components/ui/back-button";
import { soundEngine } from "@/game/audio/sound-engine";
import { validateNickname } from "@/game/security/nickname-validation";

type EntryPhase = "landing" | "name" | "inscribing" | "welcome";

export default function Home() {
  const router = useRouter();
  const { hydrated, player, hydrate, setPlayer } = useAcademyStore();
  const [phase, setPhase] = useState<EntryPhase>("landing");
  const [showInstructions, setShowInstructions] = useState(false);
  const [changeName, setChangeName] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    hydrate();
    return () => pending.forEach(clearTimeout);
  }, [hydrate]);


  // Click "ก้าวเข้าสู่เส้นทาง >" on Landing (REF 01)
  const handleStartJourney = () => {
    if (typeof window !== "undefined") {
      let skipIntro = false;
      try { skipIntro = window.localStorage.getItem("streamlab_skip_intro") === "true"; } catch { /* Show the intro when storage is blocked. */ }
      if (!skipIntro) {
        setShowInstructions(true);
        return;
      }
    }
    proceedToNameOrWelcome();
  };

  const proceedToNameOrWelcome = () => {
    if (player && !changeName) {
      setPhase("welcome");
    } else {
      setPhase("name");
    }
  };

  // REF 02 -> REF 01: Back from instructions returns to landing
  const handleBackFromInstructions = () => {
    setShowInstructions(false);
    setPhase("landing");
  };

  // Close instructions modal and continue
  const handleCloseInstructions = () => {
    setShowInstructions(false);
    proceedToNameOrWelcome();
  };

  // REF 04 -> REF 03: Back from Welcome returns to Name Entry
  const handleBackFromWelcome = () => {
    if (!nickname && player?.nickname) {
      setNickname(player.nickname);
    }
    setChangeName(true);
    setPhase("name");
  };

  // Submit name (REF 03 -> REF 04)
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = validateNickname(nickname);
    if (!trimmed) {
      setError(copy.name.invalid);
      return;
    }
    const updatedPlayer: Player = player
      ? { ...player, nickname: trimmed, lastPlayedAt: new Date().toISOString() }
      : createPlayer(trimmed);
    if (!setPlayer(updatedPlayer)) {
      setError(copy.name.saveError);
      return;
    }
    setChangeName(false);
    soundEngine.play("name_inscribed");
    setPhase("inscribing");
    timers.current.push(
      setTimeout(() => {
        setPhase("welcome");
      }, 500)
    );
  };

  const currentDisplayName = player?.nickname || nickname;

  return (
    <main className="fantasy-viewport">
      {/* 100% Procedural Fantasy Background (NO literal screenshots) */}
      <FantasyBackground
        variant={phase === "welcome" ? "palace" : phase === "name" ? "chamber" : "palace"}
        image={phase === "landing" ? "/images/xianxia/bg-landing.webp" : "/images/xianxia/bg-gate.webp"}
        clouds
      />

      {/* Header */}
      <AcademyHeader />

      {/* REF 01: LANDING PHASE */}
      {phase === "landing" && (
        <>
          <div className="landing-hero-center">
            <Image src="/images/xianxia/emblem.webp" alt="ตราสำนัก etcstream" width={170} height={141} className="brand-sigil landing-sigil" priority />
            <h1 className="landing-title-text">สำนักวิถีแห่งสายสัญญาณ</h1>
            <div className="xianxia-divider" aria-hidden="true">◆</div>
            <p className="landing-narrative-text">
              เรียนรู้ศาสตร์ภาพ เสียง และเส้นทางสัญญาณ
              ผ่านการฝึกและภารกิจในโลกแห่งสำนัก
            </p>

            <ActionButton
              variant="gold"
              size="lg"
              onClick={handleStartJourney}
            >
              ก้าวเข้าสู่เส้นทาง
            </ActionButton>
          </div>

          {/* 4 Academy Principles Bottom Bar */}
          <section className="principles-four-bar" aria-label="หลักวิชาแห่งสำนัก">
            <div className="principle-item">
              <div className="principle-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="principle-texts">
                <span className="principle-title">เรียนรู้จากของจริง</span>
                <span className="principle-desc">เนื้อหาจริง สถานการณ์จริง</span>
              </div>
            </div>

            <span className="principle-sep-diamond" aria-hidden="true">◈</span>

            <div className="principle-item">
              <div className="principle-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className="principle-texts">
                <span className="principle-title">ฝึกให้เข้าใจ</span>
                <span className="principle-desc">ลงมือทำ สร้างทักษะจริง</span>
              </div>
            </div>

            <span className="principle-sep-diamond" aria-hidden="true">◈</span>

            <div className="principle-item">
              <div className="principle-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="principle-texts">
                <span className="principle-title">พัฒนาตัวเอง</span>
                <span className="principle-desc">ต่อยอดสู่ระดับที่สูงขึ้น</span>
              </div>
            </div>

            <span className="principle-sep-diamond" aria-hidden="true">◈</span>

            <div className="principle-item">
              <div className="principle-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="principle-texts">
                <span className="principle-title">เป็นส่วนหนึ่งของสำนัก</span>
                <span className="principle-desc">ร่วมเส้นทางกับผู้คนที่มีเป้าหมายเดียวกัน</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* REF 03: NAME ENTRY PHASE */}
      {phase === "name" && (
        <section className="name-entry-card glass-card gold-border-frame with-corner-runes" aria-labelledby="name-title">
          <Image src="/branding/etcstream-logo.png" alt="" width={56} height={48} className="brand-sigil name-sigil" />
          <h1 id="name-title" className="name-entry-title">{copy.name.heading}</h1>
          <p className="name-entry-desc">
            ทุกผู้ฝึกย่อมเริ่มต้นที่สำนักนี้ ด้วยการจารึกนามของตนเอง
            ชื่อของคุณจะถูกใช้ตลอดเส้นทางการฝึกฝน
            ในทุกภารกิจ และทุกเรื่องราวแห่งสำนัก
          </p>

          {hydrated && player && !changeName ? (
            <div className="returning-player-box">
              <p className="returning-name-label" style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
                ยินดีต้อนรับกลับ <strong>{player.nickname}</strong>
              </p>
              <div className="btn-group-center" style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
                <ActionButton variant="gold" size="md" onClick={() => setPhase("welcome")}>
                  {copy.name.continue}
                </ActionButton>
                <button
                  type="button"
                  className="cultivation-btn btn-glass btn-md"
                  onClick={() => {
                    setNickname(nickname || player.nickname);
                    setChangeName(true);
                  }}
                >
                  {copy.name.change}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNameSubmit}>
              <div className="name-input-wrapper">
                <span className="name-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="player-name"
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError("");
                  }}
                  maxLength={20}
                  autoComplete="nickname"
                  placeholder="พิมพ์ชื่อของคุณ..."
                  className="cultivation-input"
                />
                <span className="name-input-hint">2-20 ตัวอักษร (ไทย อังกฤษ ตัวเลข และเว้นวรรค)</span>
              </div>

              {error && <p className="form-error" role="alert" style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

              <ActionButton variant="gold" size="lg" type="submit" fullWidth>
                {copy.name.submit}
              </ActionButton>
            </form>
          )}
        </section>
      )}

      {/* INSCRIBING TRANSITION */}
      {phase === "inscribing" && (
        <div className="name-entry-card glass-card gold-border-frame" role="status">
          <div className="seal-orbit-mini" style={{ width: "60px", height: "60px", margin: "0 auto 16px" }}>
            <Image src="/branding/etcstream-logo.png" alt="" width={48} height={40} className="brand-sigil" />
          </div>
          <p style={{ fontSize: "1.2rem", color: "var(--gold-soft)" }}>{copy.name.inscribing}</p>
        </div>
      )}

      {/* REF 04: WELCOME PERSONALIZED PHASE */}
      {phase === "welcome" && (
        <section className="welcome-hero-card" aria-labelledby="welcome-title">
          <Image src="/branding/etcstream-logo.png" alt="โลโก้ etcstream" width={72} height={60} className="brand-sigil welcome-sigil" />
          <p className="welcome-greeting-label">ยินดีต้อนรับ</p>
          <h1 id="welcome-title" className="welcome-player-name">
            {currentDisplayName}
          </h1>
          <p className="welcome-role-badge">{copy.roles.initial}</p>

          <div className="welcome-actions-group">
            <ActionButton
              variant="gold"
              size="lg"
              onClick={() => {
                soundEngine.play("academy_enter");
                router.push("/academy");
              }}
            >
              ก้าวเข้าสู่สำนัก
            </ActionButton>

            <BackButton
              onClick={handleBackFromWelcome}
              label="ย้อนกลับ"
              className="welcome-back-btn"
            />
          </div>

          <p className="welcome-philosophy-quote">
            “การเดินทางครั้งใหม่ เริ่มจากความเข้าใจเล็ก ๆ ในการฝึก”
          </p>
        </section>
      )}

      {/* REF 02: INSTRUCTIONS MODAL OVERLAY */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleCloseInstructions}
        onBack={handleBackFromInstructions}
      />
    </main>
  );
}
