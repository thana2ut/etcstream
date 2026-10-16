"use client";

import { memo, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackButton } from "./back-button";
import Image from "next/image";
import { useAcademyStore } from "@/game/stores/academy-store";
import { AudioControls } from "@/components/audio/audio-controls";
import { validateNickname } from "@/game/security/nickname-validation";

interface AcademyHeaderProps {
  traineeName?: string;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  breadcrumb?: string;
  hideBrandOnMobile?: boolean;
  /** Gameplay is running: the bar is not rendered at all (no reveal on hover). */
  hidden?: boolean;
  /** Brand is not clickable (e.g. while a level is being played). */
  brandInert?: boolean;
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

/** Pointer this close to the top edge (px) slides the header in. */
const REVEAL_ZONE = 64;
const HIDE_DELAY = 300;

/**
 * App-style auto-hiding header: hidden by default, slides in when the pointer nears the top edge (or a tap on the
 * top edge on touch screens), and slides away again once the pointer leaves. Stays hidden while the game holds the
 * pointer lock. Keyboard focus inside it keeps it open.
 */
function useAutoHide(ref: RefObject<HTMLElement | null>) {
  const [revealed, setRevealed] = useState(true);
  useEffect(() => {
    let timer = 0;
    const show = () => { window.clearTimeout(timer); setRevealed(true); };
    const hideSoon = (delay = HIDE_DELAY) => { window.clearTimeout(timer); timer = window.setTimeout(() => setRevealed(false), delay); };
    const inside = (e: Event) => Boolean(ref.current && e.target instanceof Node && ref.current.contains(e.target));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (document.pointerLockElement) { hideSoon(0); return; }
      const bottom = ref.current?.getBoundingClientRect().height ?? REVEAL_ZONE;
      if (e.clientY <= REVEAL_ZONE || inside(e)) show();
      else if (e.clientY > bottom + 24 && !ref.current?.contains(document.activeElement)) hideSoon();
    };
    const onTouch = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 999;
      if (y <= 48 || inside(e)) { show(); hideSoon(3000); }
    };
    const onLeaveWindow = (e: MouseEvent) => { if (!e.relatedTarget) hideSoon(); };
    const onFocusIn = (e: FocusEvent) => { if (inside(e)) show(); };
    const onFocusOut = (e: FocusEvent) => { if (!(e.relatedTarget instanceof Node && ref.current?.contains(e.relatedTarget))) hideSoon(); };
    const onLock = () => { if (document.pointerLockElement) hideSoon(0); };
    hideSoon(2200); // shown briefly on arrival so players learn where it lives
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    document.addEventListener("mouseout", onLeaveWindow);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      document.removeEventListener("mouseout", onLeaveWindow);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, [ref]);
  return revealed;
}

export const AcademyHeader = memo(function AcademyHeader({
  traineeName,
  hideBrandOnMobile,
  hidden = false,
  onBack,
  backHref,
  backLabel = "ย้อนกลับ",
  brandInert = false,
}: AcademyHeaderProps) {
  const storePlayer = useAcademyStore((s) => s.player);
  const pathname = usePathname();
  const localName = useSyncExternalStore(
    subscribeStorage,
    getBackupNicknameSnapshot,
    getBackupNicknameServer
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const revealed = useAutoHide(headerRef);

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

  if (hidden) return null;

  return (
    <>
    {/* Hairline handle at the top edge while the header is tucked away (hover or tap to bring it back). */}
    <div className={`academy-header-handle ${revealed ? "" : "is-visible"}`} aria-hidden="true" />
    <header ref={headerRef} className={`academy-main-header is-autohide ${revealed ? "is-revealed" : ""}`}>
      <div className="header-left">
        {/* Same bar on every page (brand left; trainee, sound, full screen right): no per-page back button. */}

        {/* Brand lockup doubles as "back": pages that pass onBack / backHref return to the previous screen;
            the home page links to itself; during play it is inert. */}
        {(() => {
          const cls = `header-brand ${hideBrandOnMobile ? "hide-mobile" : ""}`;
          const inner = <>
            <Image src="/images/xianxia/emblem.webp" alt="โลโก้ etcstream" width={56} height={48} className="header-brand-logo" priority />
            <div className="brand-text-block">
              <small className="brand-thai">สำนักวิถีแห่งสายสัญญาณ</small>
            </div>
          </>;
          if (brandInert) return <div className={`${cls} is-inert`}>{inner}</div>;
          // Pages with a way back show a back pill instead of the brand: away from the academy hall it exits straight
          // to the hall; on the hall itself it keeps the page's own back (to the entry screen).
          if ((onBack || backHref) && pathname !== "/academy") return <BackButton href="/academy" label="กลับโถงสำนัก" ariaLabel="กลับโถงสำนัก" />;
          if (onBack) return <BackButton onClick={onBack} label={backLabel} ariaLabel={backLabel} />;
          if (backHref) return <BackButton href={backHref} label={backLabel} ariaLabel={backLabel} />;
          return <Link href="/" className={cls}>{inner}</Link>;
        })()}
      </div>

      <div className="header-right">

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
    </>
  );
});
