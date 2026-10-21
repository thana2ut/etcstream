"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import { validateNickname, isReservedNickname, OWNER_NAME_KEY } from "@/game/security/nickname-validation";
import { syncOnlineName, claimReservedName } from "@/components/arena/client-api";

type EntryPhase = "landing" | "name" | "inscribing" | "welcome";

/** Reload keeps the trainee on the step they were on (per tab), instead of starting the entry flow over. */
const PHASE_KEY = "etcstream_entry_phase";
const readSavedPhase = (): EntryPhase | null => {
  try {
    const v = window.sessionStorage.getItem(PHASE_KEY);
    return v === "landing" || v === "name" || v === "welcome" ? v : null;
  } catch { return null; }
};
const noSubscribe = () => () => {};

export default function Home() {
  const router = useRouter();
  const { hydrated, player, hydrate, setPlayer } = useAcademyStore();
  // null = not chosen in this visit yet: use the step saved for this tab (or landing).
  const [chosenPhase, setPhase] = useState<EntryPhase | null>(null);
  // undefined on the server / first paint, the saved step (or null) on the client.
  const savedPhase = useSyncExternalStore(noSubscribe, readSavedPhase, () => undefined);
  const [showInstructions, setShowInstructions] = useState(false);
  const [changeName, setChangeName] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  // Reserved names (Admin/แอดมิน …) are accepted only after the server verifies the owner code.
  const [ownerCode, setOwnerCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const ownerVerified = () => { try { return window.localStorage.getItem(OWNER_NAME_KEY) === "1"; } catch { return false; } };
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Until the saved step is known only the background is drawn, so a reload does not flash the landing hero.
  const restored = hydrated && savedPhase !== undefined;
  // "welcome" needs a saved trainee; without one, fall back to the name step.
  const lockedName = Boolean(player && hydrated && isReservedNickname(player.nickname) && !ownerVerified());
  const rawPhase: EntryPhase = chosenPhase ?? (savedPhase === "welcome" ? (player ? "welcome" : "name") : savedPhase ?? "landing");
  // A saved reserved name that was never verified in this browser cannot reach the welcome screen.
  const phase: EntryPhase = lockedName && rawPhase === "welcome" ? "name" : rawPhase;

  useEffect(() => {
    const pending = timers.current;
    hydrate();
    return () => pending.forEach(clearTimeout);
  }, [hydrate]);


  useEffect(() => {
    if (!restored) return;
    try { window.sessionStorage.setItem(PHASE_KEY, phase === "inscribing" ? "welcome" : phase); } catch { /* storage blocked: reload starts at landing */ }
  }, [phase, restored]);

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

  // REF 04 -> REF 02: Back from Welcome reopens the explanation (instructions) screen that precedes it.
  // Continuing from there returns here (saved trainee, changeName off); nothing is reset.
  const handleBackFromWelcome = () => {
    setChangeName(false);
    setPhase("landing");
    setShowInstructions(true);
  };

  // Rename from the welcome screen: same validator and player store as the name step, so every display updates.
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const openRename = () => { setRenameValue(player?.nickname ?? ""); setRenameError(""); setRenameOpen(true); };
  const saveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || claiming) return;
    const trimmed = validateNickname(renameValue);
    if (!trimmed) { setRenameError(copy.name.invalid); return; }
    if (isReservedNickname(trimmed)) {
      if (!ownerCode.trim()) { setRenameError("ชื่อนี้สงวนไว้ ต้องใส่รหัสยืนยันของเจ้าของ"); return; }
      setClaiming(true); const problem = await claimReservedName(trimmed, ownerCode.trim()); setClaiming(false); setOwnerCode("");
      if (problem) { setRenameError(problem); return; }
    }
    if (!setPlayer({ ...player, nickname: trimmed, lastPlayedAt: new Date().toISOString() })) { setRenameError(copy.name.saveError); return; }
    setNickname(trimmed);
    // Same name everywhere: also rename the online Arena profile (no-op if not signed in online).
    void syncOnlineName(trimmed).then((problem) => { if (problem) setRenameError(`บันทึกชื่อในเครื่องแล้ว แต่ชื่อในหอประลองไม่เปลี่ยน: ${problem}`); else setRenameOpen(false); });
  };

  // Submit name (REF 03 -> REF 04)
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (claiming) return;
    const trimmed = validateNickname(nickname);
    if (!trimmed) {
      setError(copy.name.invalid);
      return;
    }
    if (isReservedNickname(trimmed) && !ownerVerified()) {
      if (!ownerCode.trim()) { setError("ชื่อนี้สงวนไว้ ต้องใส่รหัสยืนยันของเจ้าของ"); return; }
      setClaiming(true); const problem = await claimReservedName(trimmed, ownerCode.trim()); setClaiming(false); setOwnerCode("");
      if (problem) { setError(problem); return; }
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
    <main className={`fantasy-viewport landing-page${restored && phase === "welcome" ? " welcome-page" : ""}`}>
      {/* 100% Procedural Fantasy Background (NO literal screenshots) */}
      <FantasyBackground
        variant={phase === "welcome" ? "palace" : phase === "name" ? "chamber" : "palace"}
        image={phase === "landing" ? "/images/xianxia/bg-landing.webp" : "/images/xianxia/bg-gate.webp"}
        clouds={phase === "landing"}
      />

      {/* Header */}
      <AcademyHeader />

      {/* REF 01: LANDING PHASE */}
      {restored && phase === "landing" && (
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
      {restored && phase === "name" && (
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
            <form onSubmit={(e) => void handleNameSubmit(e)}>
              <div className="name-input-wrapper">
                <span className="name-input-field">
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
                </span>
                <span className="name-input-hint">2-20 ตัวอักษร (ไทย อังกฤษ ตัวเลข และเว้นวรรค)</span>
              </div>

{isReservedNickname(nickname) && <div className="name-input-wrapper"><span className="name-input-field"><span className="name-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></span><input type="password" className="cultivation-input" value={ownerCode} onChange={(e) => { setOwnerCode(e.target.value); setError(""); }} maxLength={64} autoComplete="off" placeholder="รหัสยืนยันชื่อสงวน" aria-label="รหัสยืนยันชื่อสงวน" /></span></div>}
              {error && <p className="form-error" role="alert" style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

              <ActionButton variant="gold" size="lg" type="submit" fullWidth>
                {copy.name.submit}
              </ActionButton>
            </form>
          )}
        </section>
      )}

      {/* INSCRIBING TRANSITION */}
      {restored && phase === "inscribing" && (
        <div className="name-entry-card glass-card gold-border-frame" role="status">
          <div className="seal-orbit-mini" style={{ width: "60px", height: "60px", margin: "0 auto 16px" }}>
            <Image src="/branding/etcstream-logo.png" alt="" width={48} height={40} className="brand-sigil" />
          </div>
          <p style={{ fontSize: "1.2rem", color: "var(--gold-soft)" }}>{copy.name.inscribing}</p>
        </div>
      )}

      {/* REF 04: WELCOME PERSONALIZED PHASE */}
      {restored && phase === "welcome" && (
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

            <button type="button" className="welcome-arena-action" onClick={() => router.push("/arena")}>
              <Image src="/assets/arena/icon-arena.png" alt="" width={38} height={38} />
              <span>เข้าสู่หอประลองเซียน</span>
            </button>

            {/* Rename: full framed button in the same outlined style as ย้อนกลับ, directly under ก้าวเข้าสู่สำนัก. */}
            {player && <button type="button" className="cultivation-back-btn welcome-back-btn welcome-rename-action" onClick={openRename}>
              <span className="back-btn-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              </span>
              <span className="back-btn-text">เปลี่ยนชื่อ</span>
            </button>}

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

      {renameOpen && player && (
        <div className="welcome-rename-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setRenameOpen(false); }} onKeyDown={(e) => { if (e.key === "Escape") setRenameOpen(false); }}>
          <form className="welcome-rename-dialog glass-card gold-border-frame" role="dialog" aria-modal="true" aria-labelledby="rename-title" onSubmit={(e) => void saveRename(e)}>
            <h2 id="rename-title">เปลี่ยนชื่อผู้ฝึก</h2>
            <label htmlFor="rename-input" className="welcome-rename-hint">2-20 ตัวอักษร (ไทย อังกฤษ ตัวเลข และเว้นวรรค)</label>
            <input id="rename-input" className="cultivation-input" value={renameValue} maxLength={20} autoComplete="nickname" autoFocus
              onChange={(e) => { setRenameValue(e.target.value); setRenameError(""); }} aria-invalid={Boolean(renameError)} aria-describedby={renameError ? "rename-error" : undefined} />
{isReservedNickname(renameValue) && <input type="password" className="cultivation-input" value={ownerCode} onChange={(e) => { setOwnerCode(e.target.value); setRenameError(""); }} maxLength={64} autoComplete="off" placeholder="รหัสยืนยันชื่อสงวน" aria-label="รหัสยืนยันชื่อสงวน" style={{ marginTop: 12 }} />}
            {renameError && <p id="rename-error" className="form-error" role="alert">{renameError}</p>}
            <div className="welcome-rename-actions">
              <button type="button" className="cultivation-btn btn-glass btn-md" onClick={() => setRenameOpen(false)}>ยกเลิก</button>
              <ActionButton variant="gold" size="md" type="submit" arrow={false}>บันทึก</ActionButton>
            </div>
          </form>
        </div>
      )}

      {/* REF 02: INSTRUCTIONS MODAL OVERLAY */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={handleCloseInstructions}
        onBack={handleBackFromInstructions}
        playerName={player?.nickname}
      />
    </main>
  );
}
