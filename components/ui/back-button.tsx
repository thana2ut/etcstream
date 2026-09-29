"use client";

import React from "react";
import Link from "next/link";

import { soundEngine } from "@/game/audio/sound-engine";

interface BackButtonProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
}

export function BackButton({
  onClick,
  href,
  label = "ย้อนกลับ",
  className = "",
  ariaLabel = "ย้อนกลับ",
}: BackButtonProps) {
  const handleClick = () => {
    soundEngine.play("button_click");
    if (onClick) onClick();
  };

  const handleMouseEnter = () => {
    soundEngine.play("button_hover");
  };

  const content = (
    <>
      <span className="back-btn-arrow" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
      <span className="back-btn-text">{label}</span>
    </>
  );

  const buttonClasses = `cultivation-back-btn ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        aria-label={ariaLabel}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
