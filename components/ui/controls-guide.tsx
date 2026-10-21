"use client";

import { useEffect, useRef } from "react";

export function ControlsGuide() {
  // Publish the card's height (--guide-h) so the objective panel above it can stop short and never overlap.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => { const r = el.getBoundingClientRect(); root.style.setProperty("--guide-h", `${Math.ceil(r.height)}px`); root.style.setProperty("--guide-top", `${Math.floor(r.top)}px`); };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => { ro.disconnect(); window.removeEventListener("resize", publish); root.style.removeProperty("--guide-h"); root.style.removeProperty("--guide-top"); };
  }, []);
  return (
    <div ref={ref} className="controls-guide-card glass-panel" aria-label="คู่มือการควบคุม">
      <div className="control-item">
        <div className="control-key key-mouse">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="7" />
            <line x1="12" y1="6" x2="12" y2="10" />
          </svg>
          <span>เมาส์</span>
        </div>
        <span className="control-desc">มองรอบตัว</span>
      </div>

      <div className="control-item">
        <div className="control-key-group">
          <span className="control-key">W</span>
          <span className="control-key">A</span>
          <span className="control-key">S</span>
          <span className="control-key">D</span>
        </div>
        <span className="control-desc">เคลื่อนที่</span>
      </div>

      <div className="control-item">
        <span className="control-key">E</span>
        <span className="control-desc">หยิบทั้งเส้น / ต่อ / ถอดสาย</span>
      </div>

      <div className="control-item">
        <span className="control-key">C</span>
        <span className="control-desc">สลับหยิบ: ทั้งเส้น / หัวสาย / ปลายสาย</span>
      </div>

      <div className="control-item">
        <span className="control-key">F</span>
        <span className="control-desc">วางสายที่ถือ</span>
      </div>

      <div className="control-item">
        <span className="control-key">R</span>
        <span className="control-desc">ถืออุปกรณ์: หมุน 45° · มือว่าง: เปิดกระเป๋า</span>
      </div>

      <div className="control-item">
        <span className="control-key key-sm">ESC</span>
        <span className="control-desc">ปล่อยเมาส์</span>
      </div>
    </div>
  );
}
