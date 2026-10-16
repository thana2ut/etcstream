"use client";

import { useEffect, useRef, useState } from "react";
import { useGameAudio } from "./audio-provider";

export function AudioControls() {
  const { preferences, setMuted, setVolume } = useGameAudio();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const lastNonZero = useRef(preferences.volume > 0 ? preferences.volume : 0.32);
  const silent = preferences.muted || preferences.volume === 0;
  const percentage = Math.round(preferences.volume * 100);

  useEffect(() => {
    if (preferences.volume > 0) lastNonZero.current = preferences.volume;
  }, [preferences.volume]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  const toggleMute = () => {
    if (silent) {
      if (preferences.volume === 0) setVolume(lastNonZero.current);
      setMuted(false);
    } else {
      setMuted(true);
    }
  };

  return (
    <div className="audio-control-wrap" ref={wrapper} onKeyDown={(event) => {
      if (event.key === "Escape") setOpen(false);
      event.stopPropagation();
    }}>
      <button
        type="button"
        className="action-icon-btn audio-trigger"
        aria-label={open ? "ปิดการควบคุมเสียง" : "เปิดการควบคุมเสียง"}
        aria-expanded={open}
        aria-controls="global-audio-popover"
        title="เสียงประกอบ"
        onClick={() => setOpen((current) => !current)}
      >
        {silent ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
      {open && (
        <div id="global-audio-popover" className="audio-popover glass-card" role="group" aria-label="เสียงประกอบ">
          <strong className="audio-popover-title">เสียงประกอบ</strong>
          <div className="audio-popover-row">
            <button type="button" className="audio-mute-btn" aria-label={silent ? "เปิดเสียง" : "ปิดเสียง"} onClick={toggleMute}>
              {silent ? "🔇 เปิดเสียง" : "🔊 ปิดเสียง"}
            </button>
            <span className="audio-percentage" aria-live="polite">{silent ? "ปิดเสียง" : `${percentage}%`}</span>
          </div>
          <label htmlFor="global-audio-volume" className="audio-slider-label">ระดับเสียง</label>
          <input
            id="global-audio-volume"
            className="audio-volume-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={percentage}
            aria-label="ระดับเสียงประกอบ"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
          />
          <div className="audio-range-labels" aria-hidden="true"><span>0</span><span>100</span></div>
        </div>
      )}
    </div>
  );
}
