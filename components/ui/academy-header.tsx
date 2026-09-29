"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAcademyStore } from "@/game/stores/academy-store";
import { BackButton } from "./back-button";
import { AudioControls } from "@/components/audio/audio-controls";
import { validateNickname } from "@/game/security/nickname-validation";

interface AcademyHeaderProps {
  traineeName?: string;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  breadcrumb?: string;
  hideBrandOnMobile?: boolean;
}

const subscribeStorage = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getBackupNicknameSnapshot = () => {
  if (typeof window === "undefined") return null;
  try { return validateNickname(window.localStorage.getItem("streamlab_nickname")); }
  catch { return null; }
};

const getBackupNicknameServer = () => null;

export function AcademyHeader({
  traineeName,
  backHref,
  onBack,
  backLabel = "ย้อนกลับ",
  breadcrumb,
  hideBrandOnMobile,
}: AcademyHeaderProps) {
  const storePlayer = useAcademyStore((s) => s.player);
  const localName = useSyncExternalStore(
    subscribeStorage,
    getBackupNicknameSnapshot,
    getBackupNicknameServer
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Single source of truth for nickname with instant fallback
  const displayName = traineeName ?? storePlayer?.nickname ?? localName;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    let enabled = false;
    try { enabled = window.localStorage.getItem("streamlab_reduced_motion") === "true"; } catch { /* Use normal motion when storage is blocked. */ }
    document.documentElement.dataset.reducedMotion = String(enabled);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if denied by browser
    }
  };

  return (
    <header className="academy-main-header">
      <div className="header-left">
        {/* If back navigation is requested */}
        {onBack || backHref ? (
          <BackButton onClick={onBack} href={backHref} label={backLabel} />
        ) : null}

        {/* Brand logo lockup */}
        <Link href="/" className={`header-brand ${hideBrandOnMobile ? "hide-mobile" : ""}`}>
          <Image src="/branding/etcstream-logo.png" alt="โลโก้ etcstream" width={56} height={48} className="header-brand-logo" priority />
          <div className="brand-text-block">
            <strong className="brand-eng">etcstream</strong>
            <small className="brand-thai">สำนักวิถีแห่งสายสัญญาณ</small>
          </div>
        </Link>
      </div>

      <div className="header-right">
        {breadcrumb && (
          <div className="header-breadcrumb">
            <span className="crumb-text">{breadcrumb}</span>
          </div>
        )}

        {displayName && (
          <div className="header-trainee-pill" title={`ผู้ฝึก: ${displayName}`}>
            <div className="trainee-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 12c-5.33 0-8 2.67-8 5v1h16v-1c0-2.33-2.67-5-8-5z" />
              </svg>
            </div>
            <span className="trainee-name">ผู้ฝึก: <strong>{displayName}</strong></span>
          </div>
        )}

        <div className="header-actions">
          <AudioControls />

          <button
            type="button"
            className="action-icon-btn"
            title={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
            aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
