"use client";

import React from "react";

interface RankItem {
  code: "S" | "M" | "L" | "XL";
  title: string;
  subtitle: string;
  active: boolean;
}

const defaultRanks: RankItem[] = [
  { code: "S", title: "ขั้นฝึกปราณพื้นฐาน", subtitle: "เข้าใจอุปกรณ์และหลักการ", active: true },
  { code: "M", title: "ขั้นประสานระบบ", subtitle: "เชื่อมต่อภาพ เสียง และสัญญาณ", active: false },
  { code: "L", title: "ขั้นควบคุมภาพและเสียง", subtitle: "สร้างสรรค์ผลงานด้วยตนเอง", active: false },
  { code: "XL", title: "ขั้นถ่ายทอดสด", subtitle: "สู่เวทีจริงของโลกกว้าง", active: false },
];

export function RankTrack({ currentRank = "S" }: { currentRank?: "S" | "M" | "L" | "XL" }) {
  return (
    <div className="rank-track-container" aria-label="ระดับการฝึกในสำนัก">
      <div className="rank-track-label">
        <span>ระดับการฝึกในสำนัก</span>
      </div>

      <div className="rank-track-timeline">
        <div className="track-connector-line" aria-hidden="true" />
        
        {defaultRanks.map((rank, index) => {
          const isActive = rank.code === currentRank;
          return (
            <div key={rank.code} className={`rank-node ${isActive ? "is-active" : "is-locked"}`}>
              {index > 0 && <div className="rank-diamond-node" aria-hidden="true">◈</div>}
              <div className="rank-seal-badge">
                <span className="rank-letter">{rank.code}</span>
              </div>
              <div className="rank-text-group">
                <strong className="rank-title">{rank.title}</strong>
                <span className="rank-subtitle">{rank.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
