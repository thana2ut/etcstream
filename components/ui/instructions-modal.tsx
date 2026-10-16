"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ActionButton } from "./action-buttons";
import { BackButton } from "./back-button";
import { soundEngine } from "@/game/audio/sound-engine";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

type TabKey = "notice" | "context" | "howToPlay" | "rules" | "roles";

export function InstructionsModal({ isOpen, onClose, onBack }: InstructionsModalProps) {
  useEffect(() => { if (isOpen) soundEngine.play("ui_open"); }, [isOpen]);
  const [activeTab, setActiveTab] = useState<TabKey>("notice");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      try {
        localStorage.setItem("streamlab_skip_intro", "true");
      } catch {
        // Ignore
      }
    }
    onClose();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      handleClose();
    }
  };

  return (
    <div className="instructions-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <Image src="/images/xianxia/mentor.webp" alt="" width={1024} height={1536} className="xianxia-mentor" aria-hidden="true" />
      <Image src="/images/xianxia/mentor-fire.webp" alt="" width={1000} height={1500} className="xianxia-mentor xianxia-mentor-right" aria-hidden="true" />
      <div className="instructions-modal-container glass-card scholar-panel gold-border-frame with-corner-runes">
        {/* Modal Header with Back button & Tabs */}
        <div className="modal-header-tabs">
          <div className="modal-header-left">
            <BackButton onClick={handleBack} label="Back" />
            <nav className="tab-pill-list" aria-label="Briefing sections">
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "notice" ? "is-active" : ""}`}
                onClick={() => setActiveTab("notice")}
              >
                <span className="tab-icon">📖</span>
                <span>Briefing</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "context" ? "is-active" : ""}`}
                onClick={() => setActiveTab("context")}
              >
                <span className="tab-icon">🌐</span>
                <span>Context</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "howToPlay" ? "is-active" : ""}`}
                onClick={() => setActiveTab("howToPlay")}
              >
                <span className="tab-icon">🧭</span>
                <span>How to play</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "rules" ? "is-active" : ""}`}
                onClick={() => setActiveTab("rules")}
              >
                <span className="tab-icon">🛡️</span>
                <span>Academy rules</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "roles" ? "is-active" : ""}`}
                onClick={() => setActiveTab("roles")}
              >
                <span className="tab-icon">👤</span>
                <span>Your role</span>
              </button>
            </nav>
          </div>

          <button
            type="button"
            className="modal-close-x"
            onClick={handleClose}
            aria-label="Close window"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-content-scroll" tabIndex={0}>
          {activeTab === "notice" && (
            <div className="tab-pane pane-notice">
              <Image src="/images/xianxia/emblem.webp" alt="etcstream logo" width={54} height={46} className="brand-sigil modal-sigil" />
              <h2 id="modal-heading" className="modal-title">Academy briefing</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>
                  Welcome to <span className="tech-term">etcstream</span>
                </p>
                <p>
                  This is a simulated training space for learning how to connect picture, sound and live-streaming systems, using equipment and ports modelled on real gear.
                </p>
                <p>
                  You will practise choosing leads, finding ports and building complete signal paths until the system works end to end.
                </p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  Remember — good cabling starts with understanding, not trial and error.
                </p>
              </div>
            </div>
          )}

          {activeTab === "context" && (
            <div className="tab-pane pane-context">
              <h2 id="modal-heading" className="modal-title">The way of the signal</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>In this academy every signal has a source and a destination.</p>
                <p>
                  A picture from a <span className="tech-term">Camera</span> may travel through a{" "}
                  <span className="tech-term">Video Switcher</span> before reaching a{" "}
                  <span className="tech-term">Monitor</span> — sound and data likewise pass through devices in the right order.
                </p>
                <p>Trainees call this flow the “signal path”.</p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  Your job is to see
                  <br className="hide-mobile" />
                  where a signal starts, what it passes through and where it must end.
                </p>
              </div>
            </div>
          )}

          {activeTab === "howToPlay" && (
            <div className="tab-pane pane-how-to-play">
              <h2 id="modal-heading" className="modal-title">Practice</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>You play in first person and handle the equipment in the room yourself. Press C for the Operator Console.</p>
              </div>

              <div className="instruction-flow-track" aria-label="Practice steps">
                <span className="flow-step-node">Survey</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">Take leads</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">Check ports</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">Connect</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">Test</span>
              </div>

              <div className="instruction-body-text">
                <p>
                  Look for <span className="tech-term">INPUT</span>,{" "}
                  <span className="tech-term">OUTPUT</span> and the right port type, such as{" "}
                  <span className="tech-term">HDMI</span>,{" "}
                  <span className="tech-term">USB</span> or{" "}
                  <span className="tech-term">XLR</span>
                </p>
                <p>If the system does not work yet, do not rush to add cables.</p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  Trace the path back and find where the signal stops.
                </p>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="tab-pane pane-rules">
              <h2 id="modal-heading" className="modal-title">Academy rules</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>There are few rules, and each one matters.</p>
                <p>
                  Match each lead to its port type and send the signal from{" "}
                  <span className="tech-term">OUTPUT</span> →{" "}
                  <span className="tech-term">INPUT</span>
                </p>
                <p>
                  Wrong connections are logged; picking up a lead and putting it down unplugged is not a mistake. Three meaningful errors pause the mission for a short targeted review.
                </p>
                <p>A mission succeeds only when every destination validates on the live signal graph.</p>
              </div>

              <blockquote className="instruction-quote-card">
                <p className="quote-body-text">
                  “Experts do not memorise where to plug in;
                  <br className="hide-mobile" />
                  they understand where the signal is going.”
                </p>
              </blockquote>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="tab-pane pane-roles">
              <h2 id="modal-heading" className="modal-title">Your role</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-role-container">
                <div className="instruction-role-badge">
                  <span className="role-badge-prefix">Role</span>
                  <span className="role-badge-name">Production trainee</span>
                </div>
              </div>

              <div className="instruction-body-text">
                <p>
                  From the moment you enter the academy you are a{" "}
                  <strong className="tech-term-gold">production trainee</strong>
                </p>
                <p>
                  acting as the live-production operator: learn picture, sound and data, read the system path, fix wrong connections and get the signal flowing again.
                </p>
                <p>
                  Every mission you complete makes the system clearer.
                </p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  Do not just make it work — understand why it works.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="modal-sticky-footer">
          <label className="skip-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="styled-checkbox"
            />
            <span>Do not show again</span>
          </label>

          <ActionButton variant="gold" size="lg" onClick={handleClose}>
            Close and continue
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
