"use client";

import React from "react";

export function ControlsGuide() {
  return (
    <div className="controls-guide-card glass-panel" aria-label="คู่มือการควบคุม">
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
        <span className="control-desc">หยิบ / ต่อ / ถอดสาย</span>
      </div>

      <div className="control-item">
        <span className="control-key">F</span>
        <span className="control-desc">วางปลายสายที่ถือ</span>
      </div>

      <div className="control-item">
        <span className="control-key key-sm">ESC</span>
        <span className="control-desc">ปล่อยเมาส์</span>
      </div>
    </div>
  );
}
