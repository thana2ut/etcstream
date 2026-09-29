"use client";

import React from "react";
import Link from "next/link";
import { soundEngine } from "@/game/audio/sound-engine";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "gold" | "cyan" | "violet" | "glass" | "outline" | "danger";
  size?: "md" | "lg" | "sm";
  href?: string;
  icon?: React.ReactNode;
  arrow?: boolean;
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  variant = "gold",
  size = "md",
  href,
  icon,
  arrow = true,
  fullWidth = false,
  className = "",
  onClick,
  onMouseEnter,
  ...rest
}: ActionButtonProps) {
  const baseClass = `cultivation-btn btn-${variant} btn-${size} ${fullWidth ? "btn-full" : ""} ${className}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    soundEngine.play("button_click");
    if (onClick) {
      (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)(e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    soundEngine.play("button_hover");
    if (onMouseEnter) {
      (onMouseEnter as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)(e);
    }
  };

  const content = (
    <>
      <span className="btn-glow-overlay" aria-hidden="true" />
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {arrow && (
        <span className="btn-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseClass}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={baseClass}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      {content}
    </button>
  );
}
