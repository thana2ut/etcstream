"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { academyCopy as copy } from "@/game/content/academy-copy";
import { useAcademyStore } from "@/game/stores/academy-store";
import { AcademyHeader } from "@/components/ui/academy-header";
import { ActionButton } from "@/components/ui/action-buttons";
import { FantasyBackground } from "@/components/ui/fantasy-background";
import { soundEngine } from "@/game/audio/sound-engine";

export default function Academy() {
  const router = useRouter();
  const { hydrated, player, hydrate, selectMode } = useAcademyStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !player) {
      router.replace("/");
    }
  }, [hydrated, player, router]);

  if (!hydrated || !player) {
    return (
      <main className="fantasy-viewport academy-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--gold-soft)", fontSize: "1.1rem" }}>{copy.academy.loading}</p>
      </main>
    );
  }

  const enterClassroom = () => {
    soundEngine.play("academy_enter");
    if (selectMode("classroom")) {
      router.push("/play?mode=classroom");
    }
  };

  // REF 05 Back behavior: returns to main entry without clearing player
  const handleBackToEntry = () => {
    router.push("/");
  };

  return (
      <main className="fantasy-viewport academy-page">
      {/* 100% Procedural Fantasy Background */}
      <FantasyBackground variant="academy" image="/images/xianxia/bg-academy.webp" />

      {/* Header with trainee info and Back Button */}
      <AcademyHeader
        traineeName={player.nickname}
        onBack={handleBackToEntry}
        backLabel="Back"
      />

      {/* Main Content Area */}
      <div className="academy-chamber-main">
        {/* Hero Title */}
        <div className="chamber-hero-header">
          <h1 className="chamber-title">{copy.academy.eyebrow}</h1>
          <p className="chamber-desc">
            Welcome, trainee <strong>{player.nickname}</strong>. Two paths begin here:
            one for free practice, the other into missions that turn practice into real production experience.
          </p>
        </div>

        {/* Dual Path Cards (practice vs missions) */}
        <section className="dual-paths-grid" aria-label="Choose a training path">
          {/* Left: practice room */}
          <article className="path-portal-card portal-cyan glass-card scholar-door-frame">
            <div className="portal-arch-artwork">
              <div className="portal-arcane-art portal-arcane-classroom" aria-hidden="true"><span>⌁</span></div>
              <div className="portal-arch-overlay" />
              <div className="portal-sigil-diamond">
                <span className="portal-sigil-inner">⌁</span>
              </div>
            </div>
            <div className="portal-content-body">
              <h2 className="portal-heading">{copy.academy.classroom.subtitle}</h2>
              <span className="portal-subtitle">{copy.academy.classroom.title}</span>
              <p className="portal-desc">
                Free practice with no timer — try things until you truly understand them.
              </p>
              <ActionButton variant="cyan" size="md" onClick={enterClassroom}>
                {copy.academy.classroom.action}
              </ActionButton>
            </div>
          </article>

          {/* Right: Mission Hall */}
          <article className="path-portal-card portal-violet glass-card scholar-door-frame">
            <div className="portal-arch-artwork">
              <div className="portal-arcane-art portal-arcane-mission" aria-hidden="true"><span>✦</span></div>
              <div className="portal-arch-overlay" />
              <div className="portal-sigil-diamond">
                <span className="portal-sigil-inner">✦</span>
              </div>
            </div>
            <div className="portal-content-body">
              <h2 className="portal-heading">{copy.academy.mission.subtitle}</h2>
              <span className="portal-subtitle">Take an academy mission</span>
              <p className="portal-desc">
                Five production rooms, five levels each — climb from guided to certification.
              </p>
              <ActionButton variant="gold" size="md" href="/missions">
                Open the Mission Hall
              </ActionButton>
            </div>
          </article>
        </section>

      </div>
    </main>
  );
}
