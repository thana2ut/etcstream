"use client";

import React from "react";

export type PortKind = "HDMI" | "USB" | "XLR" | "INPUT" | "OUTPUT";

interface PortBadgeProps {
  kind: PortKind;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export function PortBadge({ kind, description, size = "md" }: PortBadgeProps) {
  const renderIcon = () => {
    switch (kind) {
      case "HDMI":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16v10H4z" />
            <path d="M7 17v2h10v-2" />
            <line x1="8" y1="11" x2="8" y2="13" />
            <line x1="11" y1="11" x2="11" y2="13" />
            <line x1="14" y1="11" x2="14" y2="13" />
            <line x1="16" y1="11" x2="16" y2="13" />
          </svg>
        );
      case "USB":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="7" y="6" width="10" height="13" rx="2" />
            <line x1="10" y1="2" x2="10" y2="6" />
            <line x1="14" y1="2" x2="14" y2="6" />
            <rect x="9" y="8" width="2" height="3" fill="currentColor" />
            <rect x="13" y="8" width="2" height="3" fill="currentColor" />
          </svg>
        );
      case "XLR":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <circle cx="9.5" cy="10" r="1.3" fill="currentColor" />
            <circle cx="14.5" cy="10" r="1.3" fill="currentColor" />
            <circle cx="12" cy="14.5" r="1.3" fill="currentColor" />
          </svg>
        );
      case "INPUT":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
            <path d="M12 4v8m0 0l-3-3m3 3l3-3" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
        );
      case "OUTPUT":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 12l5-5m-5 5l-5-5m5 5v7" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className={`port-badge-item port-size-${size}`}>
      <div className="port-icon-ring">
        {renderIcon()}
      </div>
      <strong className="port-title">{kind}</strong>
      {description && <p className="port-desc">{description}</p>}
    </div>
  );
}
