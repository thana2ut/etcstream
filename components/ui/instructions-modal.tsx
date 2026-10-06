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
            <BackButton onClick={handleBack} label="ย้อนกลับ" />
            <nav className="tab-pill-list" aria-label="หมวดหมู่คำชี้แจง">
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "notice" ? "is-active" : ""}`}
                onClick={() => setActiveTab("notice")}
              >
                <span className="tab-icon">📖</span>
                <span>คำชี้แจง</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "context" ? "is-active" : ""}`}
                onClick={() => setActiveTab("context")}
              >
                <span className="tab-icon">🌐</span>
                <span>บริบท</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "howToPlay" ? "is-active" : ""}`}
                onClick={() => setActiveTab("howToPlay")}
              >
                <span className="tab-icon">🧭</span>
                <span>วิธีเล่น</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "rules" ? "is-active" : ""}`}
                onClick={() => setActiveTab("rules")}
              >
                <span className="tab-icon">🛡️</span>
                <span>กฎสำนัก</span>
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === "roles" ? "is-active" : ""}`}
                onClick={() => setActiveTab("roles")}
              >
                <span className="tab-icon">👤</span>
                <span>บทบาท</span>
              </button>
            </nav>
          </div>

          <button
            type="button"
            className="modal-close-x"
            onClick={handleClose}
            aria-label="ปิดหน้าต่าง"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-content-scroll" tabIndex={0}>
          {activeTab === "notice" && (
            <div className="tab-pane pane-notice">
              <Image src="/images/xianxia/emblem.webp" alt="โลโก้ etcstream" width={54} height={46} className="brand-sigil modal-sigil" />
              <h2 id="modal-heading" className="modal-title">คำชี้แจงแห่งสำนัก</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>
                  ยินดีต้อนรับสู่ <span className="tech-term">etcstream</span>
                </p>
                <p>
                  ที่นี่คือพื้นที่ฝึกจำลองสำหรับเรียนรู้การเชื่อมต่อระบบภาพ เสียง และการถ่ายทอดสด ผ่านอุปกรณ์และพอร์ตที่อ้างอิงจากการใช้งานจริง
                </p>
                <p>
                  เจ้าจะได้ฝึกตั้งแต่การเลือกสาย มองหาพอร์ต ไปจนถึงการสร้างเส้นทางสัญญาณให้ระบบทำงานครบถ้วน
                </p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  จงจำไว้ — การต่อสายที่ดี เริ่มจากความเข้าใจ ไม่ใช่การลองสุ่ม
                </p>
              </div>
            </div>
          )}

          {activeTab === "context" && (
            <div className="tab-pane pane-context">
              <h2 id="modal-heading" className="modal-title">วิถีแห่งสายสัญญาณ</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>ภายในสำนักแห่งนี้ สัญญาณทุกเส้นมีต้นทางและปลายทางของมัน</p>
                <p>
                  ภาพจาก <span className="tech-term">Camera</span> อาจต้องเดินทางผ่าน{" "}
                  <span className="tech-term">Video Switcher</span> ก่อนถึง{" "}
                  <span className="tech-term">Monitor</span> เช่นเดียวกับเสียงและข้อมูลที่ต้องผ่านอุปกรณ์อย่างถูกลำดับ
                </p>
                <p>เหล่าผู้ฝึกเรียกการไหลนี้ว่า “ปราณสัญญาณ”</p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  หน้าที่ของเจ้าคือมองให้ออกว่า
                  <br className="hide-mobile" />
                  สัญญาณเริ่มจากไหน ผ่านอะไร และควรไปจบที่ใด
                </p>
              </div>
            </div>
          )}

          {activeTab === "howToPlay" && (
            <div className="tab-pane pane-how-to-play">
              <h2 id="modal-heading" className="modal-title">ฝึกวิชา</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>เจ้าจะเล่นผ่านมุมมองบุคคลที่หนึ่ง และลงมือกับอุปกรณ์ในห้องฝึกด้วยตัวเอง</p>
              </div>

              <div className="instruction-flow-track" aria-label="ขั้นตอนการฝึกวิชา">
                <span className="flow-step-node">สำรวจ</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">หยิบสาย</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">ตรวจพอร์ต</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">เชื่อมต่อ</span>
                <span className="flow-sep-arrow" aria-hidden="true">→</span>
                <span className="flow-step-node">ทดสอบระบบ</span>
              </div>

              <div className="instruction-body-text">
                <p>
                  มองหา <span className="tech-term">INPUT</span>,{" "}
                  <span className="tech-term">OUTPUT</span> และชนิดพอร์ตให้ถูกต้อง เช่น{" "}
                  <span className="tech-term">HDMI</span>,{" "}
                  <span className="tech-term">USB</span> หรือ{" "}
                  <span className="tech-term">XLR</span>
                </p>
                <p>ถ้าระบบยังไม่ทำงาน อย่ารีบเสียบสายเพิ่ม</p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  ย้อนดูเส้นทาง แล้วหาว่าปราณสัญญาณขาดหายตรงไหน
                </p>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="tab-pane pane-rules">
              <h2 id="modal-heading" className="modal-title">กฎแห่งสำนัก</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-body-text">
                <p>กฎมีไม่มาก แต่ทุกข้อสำคัญ</p>
                <p>
                  เชื่อมต่อสายให้ตรงชนิดพอร์ต และให้สัญญาณเดินจาก{" "}
                  <span className="tech-term">OUTPUT</span> →{" "}
                  <span className="tech-term">INPUT</span>
                </p>
                <p>
                  การเชื่อมต่อผิดจะถูกบันทึก แต่การหยิบสายแล้ววางคืนโดยยังไม่ได้เสียบ ไม่นับเป็นความผิด
                </p>
                <p>ภารกิจจะสำเร็จเมื่อระบบทำงานครบตามเป้าหมาย</p>
              </div>

              <blockquote className="instruction-quote-card">
                <p className="quote-body-text">
                  “ผู้เชี่ยวชาญไม่ได้จำว่าต้องเสียบตรงไหน
                  <br className="hide-mobile" />
                  แต่เข้าใจว่าสัญญาณกำลังเดินทางไปที่ใด”
                </p>
              </blockquote>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="tab-pane pane-roles">
              <h2 id="modal-heading" className="modal-title">บทบาทของเจ้า</h2>
              <div className="ornate-gold-divider">
                <span className="line" />
                <span className="diamond">◈</span>
                <span className="line" />
              </div>

              <div className="instruction-role-container">
                <div className="instruction-role-badge">
                  <span className="role-badge-prefix">บทบาท</span>
                  <span className="role-badge-name">ผู้ฝึกปราณแห่งสายสัญญาณ</span>
                </div>
              </div>

              <div className="instruction-body-text">
                <p>
                  ตั้งแต่ก้าวเข้าสู่สำนัก เจ้าจะได้รับบทบาท{" "}
                  <strong className="tech-term-gold">ผู้ฝึกปราณแห่งสายสัญญาณ</strong>
                </p>
                <p>
                  หน้าที่ของเจ้าคือเรียนรู้ศาสตร์แห่งภาพ เสียง และข้อมูล ฝึกอ่านเส้นทางของระบบ แก้การเชื่อมต่อที่ผิดพลาด และทำให้สัญญาณกลับมาไหลได้อีกครั้ง
                </p>
                <p>
                  ทุกภารกิจที่ผ่านไป จะทำให้เจ้ามองเห็นระบบชัดขึ้นกว่าเดิม
                </p>
              </div>

              <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">
                  อย่าเพียงต่อให้ติด — จงเข้าใจว่าทำไมมันถึงทำงาน
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
            <span>ไม่แสดงอีกในครั้งถัดไป</span>
          </label>

          <ActionButton variant="gold" size="lg" onClick={handleClose}>
            ปิดจารึกและดำเนินต่อ
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
