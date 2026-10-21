"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ActionButton } from "./action-buttons";
import { BackButton } from "./back-button";
import { soundEngine } from "@/game/audio/sound-engine";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  /** Live trainee name for the welcome line (omitted before a name is inscribed). */
  playerName?: string;
}

type TabKey = "notice" | "context" | "howToPlay" | "rules" | "roles";

interface GuideTab { label: string; icon: string; heading: string; paragraphs: ReactNode[]; flow?: string[]; motto: string; quote?: boolean }

const T = ({ children }: { children: ReactNode }) => <span className="tech-term">{children}</span>;

/**
 * Academy guide content, written as flowing paragraphs (original editorial presentation) but kept in step
 * with the live game: controls from first-person-controller / training-hud, the cable lobby's exact-match bag
 * check, the bag (R) and per-run save/resume (game/persistence/run-save.ts).
 * Static: built once, not on every render.
 */
const TABS: Record<TabKey, GuideTab> = {
  notice: {
    label: "คำชี้แจง", icon: "📖", heading: "คำชี้แจงแห่งสำนัก",
    paragraphs: [
      "ที่นี่คือสำนักฝึกจำลองสำหรับเรียนรู้การเชื่อมต่อระบบภาพ เสียง และการถ่ายทอดสด ผ่านอุปกรณ์และพอร์ตที่อ้างอิงจากการใช้งานจริง เจ้าจะได้รู้จักหน้าที่ของอุปกรณ์แต่ละชิ้น เลือกสายให้ตรงชนิดพอร์ต และไล่เส้นทางสัญญาณจากต้นทางไปจนถึงปลายทาง",
      <>สำนักมีสองเส้นทาง <strong>โหมดภารกิจ</strong> พาเจ้าผ่านห้าสถานที่ สถานที่ละห้าระดับ ตั้งแต่ห้องเรียนไปจนถึงสนามกีฬา แต่ละระดับมีใบงานและเงื่อนไขผ่านของตนเอง ส่วน <strong>ห้องฝึกอิสระ</strong> คือห้องสตูดิโอที่เจ้าลองหยิบ วาง ต่อ และตรวจสัญญาณได้ตามใจ โดยไม่มีด่านบังคับ</>,
      "ทุกการฝึกเริ่มจากการเข้าใจงาน เตรียมสายให้พอดี แล้วลงมือติดตั้ง ต่อสาย และตรวจผลด้วยตนเอง ผู้ฝึกใหม่อาจเริ่มจากห้องฝึกอิสระเพื่อคุ้นมือ ก่อนรับภารกิจแรกจากหอภารกิจ",
    ],
    motto: "จงจำไว้ — การต่อสายที่ดี เริ่มจากความเข้าใจ ไม่ใช่การลองสุ่ม",
  },
  context: {
    label: "บริบท", icon: "🌐", heading: "วิถีแห่งสายสัญญาณ",
    paragraphs: [
      "ภายในสำนักแห่งนี้ สัญญาณทุกเส้นมีต้นทางและปลายทางของมัน เหล่าผู้ฝึกเรียกการไหลของภาพ เสียง และข้อมูลนี้ว่า “ปราณสัญญาณ” แต่ทุกบทเรียนคืองานโสตทัศนูปกรณ์จริง",
      <>ภาพจาก <T>Camera</T> อาจต้องเดินทางผ่าน <T>Video Switcher</T> ก่อนถึง <T>Monitor</T> เช่นเดียวกับเสียงจาก <T>Microphone</T> ที่ต้องผ่าน <T>Mixer</T> ไปยังลำโพงและการบันทึกอย่างถูกลำดับ</>,
      "ห้าสถานที่ของสำนัก ได้แก่ ห้องเรียน สตูดิโอ หอประชุม งานกลางแจ้ง และสนามกีฬา ยากขึ้นทีละขั้น ระบบใหญ่ขึ้น สายไกลขึ้น และคำใบ้น้อยลงในระดับสูง อุปกรณ์หลายชิ้นเป็นแบบจำลองที่มีพอร์ตตามโปรไฟล์ฝึก รุ่นและพอร์ตที่ยังรอยืนยันจะระบุไว้ในหน้ารายละเอียดอุปกรณ์",
    ],
    motto: "หน้าที่ของเจ้าคือมองให้ออกว่า สัญญาณเริ่มจากไหน ผ่านอะไร และควรไปจบที่ใด",
  },
  howToPlay: {
    label: "วิธีเล่น", icon: "🧭", heading: "ฝึกวิชา",
    flow: ["อ่านใบงาน", "เตรียมสาย", "เข้าห้อง", "เชื่อมต่อ", "ผ่านด่าน"],
    paragraphs: [
      "เจ้าจะเล่นผ่านมุมมองบุคคลที่หนึ่ง ในโหมดภารกิจ เจ้าจะอ่านใบงานก่อน แล้วเลือกชนิดและจำนวนสายจากคลังของสถานที่ให้พอดีกับงาน ระบบจะตรวจกระเป๋าก่อนเปิดประตูด่าน ส่วนห้องฝึกอิสระเลือกสายจากโต๊ะสายของห้องได้เลย",
      <>บนคอมพิวเตอร์ ใช้ <T>W A S D</T> เดิน เมาส์มองรอบตัว <T>E</T> หยิบ เสียบ หรือถอด <T>F</T> วางสิ่งที่ถือ <T>R</T> หมุนอุปกรณ์ที่ถือทีละ 45° กด <T>E</T> ค้าง 2 วินาทีเพื่อดูรายละเอียดอุปกรณ์ และ <T>C</T> เปิดกระเป๋าสาย</>,
      <>ในด่านภารกิจต่อสายครบทุกเส้นทางที่ถูกต้องแล้วจะผ่านด่านอัตโนมัติ บนจอสัมผัสให้ใช้ปุ่มทิศทาง และปุ่ม ใช้งาน / วาง / หมุน / 1 / 2 ที่มุมขวาล่าง</>,
      "ห้องที่ยังทำไม่เสร็จจะถูกบันทึกไว้ในเบราว์เซอร์นี้ เมื่อกลับมาที่ด่านเดิม เจ้าเลือกเล่นต่อจากครั้งล่าสุดหรือเริ่มใหม่ได้",
    ],
    motto: "ถ้าระบบยังไม่ทำงาน อย่ารีบเสียบสายเพิ่ม ย้อนดูเส้นทางแล้วหาว่าปราณสัญญาณขาดหายตรงไหน",
  },
  rules: {
    label: "กฎสำนัก", icon: "🛡️", heading: "กฎแห่งสำนัก",
    paragraphs: [
      <>กฎมีไม่มาก แต่ทุกข้อสำคัญ หัวสายต้องตรงกับพอร์ต และสัญญาณต้องเดินจาก <T>OUTPUT</T> ไป <T>INPUT</T> ระบบจะไม่ยอมให้เสียบหัวที่ไม่เข้ากัน</>,
      "การเสียบผิดจะถูกบันทึก ผิดหลายครั้งติดกันจะต้องพักทบทวน ส่วนการหยิบสายแล้ววางคืนโดยยังไม่ได้เสียบไม่นับเป็นความผิด ในภารกิจ สายในกระเป๋าต้องครบและไม่เกินตามที่งานต้องใช้ ระบบจะบอกเพียงว่าขาด เกิน หรือชนิดไม่ตรง โดยไม่เฉลยคำตอบ",
      "ภารกิจผ่านทันทีเมื่อต่อสายถูกชนิดและถูกพอร์ตครบทุกเส้นทางของด่าน แต่ละเส้นทางที่ต่อถูกจะติด ✓ ในแผงภารกิจ ถ้าถอดสายหรือเปลี่ยนเป็นสายผิด ✓ ของเส้นทางนั้นจะหายไป",
    ],
    motto: "“ผู้เชี่ยวชาญไม่ได้จำว่าต้องเสียบตรงไหน แต่เข้าใจว่าสัญญาณกำลังเดินทางไปที่ใด”",
    quote: true,
  },
  roles: {
    label: "บทบาท", icon: "👤", heading: "บทบาทของเจ้า",
    paragraphs: [
      <>ตั้งแต่ก้าวเข้าสู่สำนัก เจ้าจะได้รับบทบาท <strong className="tech-term-gold">ผู้ฝึกปราณแห่งสายสัญญาณ</strong> ผู้ฝึกงานด้านโสตทัศนูปกรณ์และการถ่ายทอดสด ที่ติดตั้ง ต่อสาย ตั้งค่า และตรวจระบบด้วยตนเอง</>,
      "เจ้าต้องดูแลทั้งต้นทาง เช่น กล้อง ไมค์ และแหล่งภาพ ส่วนประมวลผล เช่น สวิตเชอร์ มิกเซอร์ และตัวแปลงสัญญาณ ไปจนถึงปลายทาง เช่น จอ ลำโพง การบันทึก และการสตรีม",
      "ทุกระดับที่ผ่านจะสะสมคุณความดีและเลื่อนขั้นในสำนัก ระบบที่ใหญ่ขึ้นรอเจ้าอยู่ในสถานที่ถัดไป",
    ],
    motto: "อย่าเพียงต่อให้ติด — จงเข้าใจว่าทำไมมันถึงทำงาน",
  },
};
const TAB_ORDER: TabKey[] = ["notice", "context", "howToPlay", "rules", "roles"];

export function InstructionsModal({ isOpen, onClose, onBack, playerName }: InstructionsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("notice");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    soundEngine.play("ui_open");
    // While the guide covers the page, decorative background motion pauses (see xianxia-theme.css).
    document.documentElement.dataset.overlay = "guide";
    return () => { delete document.documentElement.dataset.overlay; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try { localStorage.setItem("streamlab_skip_intro", "true"); } catch { /* storage blocked: the guide simply shows again */ }
    }
    onClose();
  };
  const handleBack = () => { if (onBack) onBack(); else handleClose(); };
  const tab = TABS[activeTab];

  return (
    <div className="instructions-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <Image src="/images/xianxia/mentor.webp" alt="" width={1024} height={1536} sizes="600px" className="xianxia-mentor" aria-hidden="true" />
      <Image src="/images/xianxia/mentor-fire.webp" alt="" width={1000} height={1500} sizes="600px" className="xianxia-mentor xianxia-mentor-right" aria-hidden="true" />
      <div className="instructions-modal-container glass-card scholar-panel gold-border-frame with-corner-runes">
        <div className="modal-header-tabs">
          <div className="modal-header-left">
            <BackButton onClick={handleBack} label="ย้อนกลับ" />
            <nav className="tab-pill-list" aria-label="หมวดหมู่คำชี้แจง">
              {TAB_ORDER.map((key) => <button key={key} type="button" className={`tab-pill-btn ${activeTab === key ? "is-active" : ""}`}
                onClick={() => setActiveTab(key)} aria-pressed={activeTab === key}>
                <span className="tab-icon" aria-hidden="true">{TABS[key].icon}</span>
                <span>{TABS[key].label}</span>
              </button>)}
            </nav>
          </div>
        </div>

        <div className="modal-content-scroll" tabIndex={0}>
          <div className={`tab-pane pane-${activeTab}`}>
            {activeTab === "notice" && <Image src="/images/xianxia/emblem.webp" alt="โลโก้ etcstream" width={54} height={46} className="brand-sigil modal-sigil" />}
            <h2 id="modal-heading" className="modal-title">{tab.heading}</h2>
            <div className="ornate-gold-divider"><span className="line" /><span className="diamond">◈</span><span className="line" /></div>
            <div className="instruction-body-text">
              {activeTab === "notice" && <p>ยินดีต้อนรับสู่ <span className="tech-term">etcstream</span>{playerName ? <> · ผู้ฝึก <strong className="tech-term-gold">{playerName}</strong></> : null}</p>}
              {tab.flow && <div className="instruction-flow-track" aria-label="ขั้นตอนการฝึกวิชา">
                {tab.flow.map((step, i) => <span key={step} style={{ display: "contents" }}>
                  {i > 0 && <span className="flow-sep-arrow" aria-hidden="true">→</span>}
                  <span className="flow-step-node">{step}</span>
                </span>)}
              </div>}
              {tab.paragraphs.map((text, i) => <p key={i}>{text}</p>)}
            </div>
            {tab.quote
              ? <blockquote className="instruction-quote-card"><p className="quote-body-text">{tab.motto}</p></blockquote>
              : <div className="instruction-highlight-box">
                <span className="instruction-highlight-icon" aria-hidden="true">✦</span>
                <p className="instruction-highlight-text">{tab.motto}</p>
              </div>}
          </div>
        </div>

        <div className="modal-sticky-footer">
          <label className="skip-checkbox-label">
            <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="styled-checkbox" />
            <span>ไม่แสดงอีกในครั้งถัดไป</span>
          </label>
          <ActionButton variant="gold" size="lg" onClick={handleClose}>ปิดจารึกและดำเนินต่อ</ActionButton>
        </div>
      </div>
    </div>
  );
}
