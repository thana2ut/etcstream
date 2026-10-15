"use client";

import { useEffect, useRef } from "react";

export function ControlsGuide() {
  // Publish the card's height (--guide-h) so the objective panel above it can stop short and never overlap.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--guide-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty("--guide-h"); };
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
        <div className="control-key-group">
          <span className="control-key">1</span>
          <span className="control-key">2</span>
        </div>
        <span className="control-desc">+E หยิบหัวสาย / ปลายสาย</span>
      </div>

      <div className="control-item">
        <span className="control-key">F</span>
        <span className="control-desc">วางสายที่ถือ</span>
      </div>

      <div className="control-item">
        <span className="control-key">R</span>
        <span className="control-desc">เปิด / ปิดกระเป๋า</span>
      </div>

      <div className="control-item">
        <span className="control-key">T</span>
        <span className="control-desc">หมุนอุปกรณ์ที่ถือ 45°</span>
      </div>

      <div className="control-item">
        <span className="control-key key-sm">ESC</span>
        <span className="control-desc">ปล่อยเมาส์</span>
      </div>
    </div>
  );
}
