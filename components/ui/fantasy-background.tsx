"use client";

import React from "react";
import { CloudSky } from "./cloud-sky";

export type BackdropVariant = "palace" | "academy" | "archive" | "chamber" | "lab";

interface FantasyBackgroundProps {
  variant?: BackdropVariant;
  /** Painted backdrop from /public/images/xianxia; replaces the procedural layers when set. */
  image?: string;
  /** Animated drifting cloud layers over the painted sky. */
  clouds?: boolean;
}

export function FantasyBackground({ variant = "palace", image, clouds = false }: FantasyBackgroundProps) {
  if (image) {
    return (
      <div className="xianxia-backdrop" aria-hidden="true">
        <div className="xianxia-backdrop-image" style={{ backgroundImage: `url(${image})` }} />
        {clouds && <CloudSky />}
        <div className="xianxia-mist" />
      </div>
    );
  }
  return (
    <div className={`procedural-fantasy-bg variant-${variant}`} aria-hidden="true">
      {/* LAYER 1: Deep Cosmic Atmospheric Gradient */}
      <div className="bg-cosmic-base" />

      {/* LAYER 2: Focal Radial Light Bloom */}
      <div className="bg-radial-bloom" />

      {/* LAYER 3: Nebular Aurora & Qi Flow */}
      <div className="bg-nebula-aurora" />

      {/* LAYER 4: Constellation & Astral Energy Lines */}
      <div className="bg-constellations">
        <svg className="constellation-svg" viewBox="0 0 1440 800" fill="none">
          {/* Subtle star nodes and connecting threads */}
          <circle cx="180" cy="140" r="2" fill="rgba(245, 184, 66, 0.6)" />
          <circle cx="260" cy="110" r="2.5" fill="rgba(56, 189, 248, 0.7)" />
          <circle cx="340" cy="170" r="1.8" fill="rgba(245, 184, 66, 0.5)" />
          <line x1="180" y1="140" x2="260" y2="110" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="260" y1="110" x2="340" y2="170" stroke="rgba(245, 184, 66, 0.2)" strokeWidth="0.8" />

          <circle cx="1100" cy="130" r="2" fill="rgba(168, 85, 247, 0.6)" />
          <circle cx="1180" cy="90" r="2.5" fill="rgba(56, 189, 248, 0.7)" />
          <circle cx="1270" cy="150" r="2" fill="rgba(245, 184, 66, 0.6)" />
          <line x1="1100" y1="130" x2="1180" y2="90" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="1180" y1="90" x2="1270" y2="150" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8" />

          {/* Central Zenith Crystal Beam */}
          <line x1="720" y1="0" x2="720" y2="400" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="6 4" />
        </svg>
      </div>

      {/* LAYER 5: Astrolabe Concentric Rune Circles */}
      <div className="bg-astrolabe-orbit">
        <svg className="astrolabe-svg" viewBox="0 0 900 900" fill="none">
          <circle cx="450" cy="450" r="430" stroke="rgba(245, 184, 66, 0.12)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="450" cy="450" r="380" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.2" />
          <circle cx="450" cy="450" r="320" stroke="rgba(245, 184, 66, 0.18)" strokeWidth="1.5" strokeDasharray="16 8" />
          <circle cx="450" cy="450" r="240" stroke="rgba(168, 85, 247, 0.16)" strokeWidth="1" />
          <circle cx="450" cy="450" r="140" stroke="rgba(245, 184, 66, 0.22)" strokeWidth="1.5" />
          <circle cx="450" cy="450" r="40" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />

          {/* Astrolabe Axis Cross */}
          <line x1="450" y1="20" x2="450" y2="880" stroke="rgba(245, 184, 66, 0.1)" strokeWidth="1" />
          <line x1="20" y1="450" x2="880" y2="450" stroke="rgba(245, 184, 66, 0.1)" strokeWidth="1" />

          {/* Diamond Sigils on Ring */}
          <rect x="444" y="14" width="12" height="12" transform="rotate(45 450 20)" fill="rgba(245, 184, 66, 0.5)" />
          <rect x="444" y="874" width="12" height="12" transform="rotate(45 450 880)" fill="rgba(245, 184, 66, 0.5)" />
          <rect x="14" y="444" width="12" height="12" transform="rotate(45 20 450)" fill="rgba(56, 189, 248, 0.5)" />
          <rect x="874" y="444" width="12" height="12" transform="rotate(45 880 450)" fill="rgba(56, 189, 248, 0.5)" />
        </svg>
      </div>

      {/* LAYER 6: Architectural Silhouettes & Colonnades */}
      <div className="bg-academy-architecture">
        {variant === "palace" && (
          <svg className="architecture-svg" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMax slice">
            {/* Distant Spire Castles in Nebular Cloud */}
            <path d="M720 160 L755 330 L685 330 Z" fill="rgba(10, 26, 52, 0.5)" />
            <path d="M700 240 L740 240 L730 360 L710 360 Z" fill="rgba(8, 20, 42, 0.6)" />
            <path d="M430 250 L460 350 L400 350 Z" fill="rgba(9, 24, 48, 0.4)" />
            <path d="M1010 250 L1040 350 L980 350 Z" fill="rgba(9, 24, 48, 0.4)" />

            {/* Left Grand Colonnade Pillar */}
            <rect x="60" y="40" width="70" height="560" fill="rgba(5, 14, 30, 0.75)" />
            <rect x="50" y="30" width="90" height="24" rx="3" fill="rgba(12, 28, 58, 0.9)" stroke="rgba(245, 184, 66, 0.25)" strokeWidth="1" />
            <line x1="75" y1="54" x2="75" y2="600" stroke="rgba(245, 184, 66, 0.12)" strokeWidth="1.5" />
            <line x1="115" y1="54" x2="115" y2="600" stroke="rgba(245, 184, 66, 0.12)" strokeWidth="1.5" />
            {/* Left Banner */}
            <path d="M75 140 L115 140 L115 320 L95 345 L75 320 Z" fill="rgba(14, 34, 70, 0.85)" stroke="rgba(245, 184, 66, 0.35)" strokeWidth="1" />
            <text x="95" y="220" textAnchor="middle" fill="rgba(245, 184, 66, 0.6)" fontSize="20" fontFamily="serif" fontWeight="bold">✦</text>

            {/* Right Grand Colonnade Pillar */}
            <rect x="1310" y="40" width="70" height="560" fill="rgba(5, 14, 30, 0.75)" />
            <rect x="1300" y="30" width="90" height="24" rx="3" fill="rgba(12, 28, 58, 0.9)" stroke="rgba(245, 184, 66, 0.25)" strokeWidth="1" />
            <line x1="1325" y1="54" x2="1325" y2="600" stroke="rgba(245, 184, 66, 0.12)" strokeWidth="1.5" />
            <line x1="1365" y1="54" x2="1365" y2="600" stroke="rgba(245, 184, 66, 0.12)" strokeWidth="1.5" />
            {/* Right Banner */}
            <path d="M1325 140 L1365 140 L1365 320 L1345 345 L1325 320 Z" fill="rgba(14, 34, 70, 0.85)" stroke="rgba(245, 184, 66, 0.35)" strokeWidth="1" />
            <text x="1345" y="220" textAnchor="middle" fill="rgba(245, 184, 66, 0.6)" fontSize="20" fontFamily="serif" fontWeight="bold">✦</text>

            {/* Grand Steppes & Balustrade */}
            <path d="M0 600 L0 480 L220 480 L280 510 L1160 510 L1220 480 L1440 480 L1440 600 Z" fill="rgba(4, 11, 24, 0.75)" />
          </svg>
        )}

        {variant === "academy" && (
          <svg className="architecture-svg" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMax slice">
            {/* Archway Portal Silhouettes Behind Door Cards */}
            <path d="M180 550 L180 220 C180 130, 440 130, 440 220 L440 550 Z" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2.5" fill="rgba(6, 18, 38, 0.5)" />
            <path d="M1000 550 L1000 220 C1000 130, 1260 130, 1260 220 L1260 550 Z" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="2.5" fill="rgba(6, 18, 38, 0.5)" />
            <path d="M0 600 L0 520 L1440 520 L1440 600 Z" fill="rgba(3, 9, 20, 0.8)" />
          </svg>
        )}

        {variant === "archive" && (
          <svg className="architecture-svg" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMax slice">
            <rect x="80" y="220" width="100" height="380" fill="rgba(8, 20, 42, 0.55)" />
            <rect x="200" y="160" width="110" height="440" fill="rgba(6, 16, 36, 0.65)" />
            <rect x="1260" y="220" width="100" height="380" fill="rgba(8, 20, 42, 0.55)" />
            <rect x="1130" y="160" width="110" height="440" fill="rgba(6, 16, 36, 0.65)" />
            <path d="M460 600 L460 320 C460 190, 980 190, 980 320 L980 600 Z" stroke="rgba(245, 184, 66, 0.16)" strokeWidth="1.8" fill="none" />
          </svg>
        )}

        {variant === "chamber" && (
          <svg className="architecture-svg" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMax slice">
            <line x1="340" y1="80" x2="340" y2="600" stroke="rgba(245, 184, 66, 0.15)" strokeWidth="2" />
            <line x1="1100" y1="80" x2="1100" y2="600" stroke="rgba(245, 184, 66, 0.15)" strokeWidth="2" />
            <circle cx="720" cy="280" r="160" stroke="rgba(245, 184, 66, 0.18)" strokeWidth="1.5" strokeDasharray="10 6" />
          </svg>
        )}

        {variant === "lab" && (
          <svg className="architecture-svg" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="xMidYMax slice">
            <line x1="720" y1="20" x2="720" y2="580" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" />
            <line x1="660" y1="160" x2="780" y2="160" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" />
            <line x1="620" y1="260" x2="820" y2="260" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" />
          </svg>
        )}
      </div>

      {/* LAYER 7: Perspective Signal / Mana Grid on Floor */}
      <div className="bg-circuit-grid" />

      {/* LAYER 8: Floating Celestial Sparkles & Qi Dust */}
      <div className="bg-particles-layer" />

      {/* LAYER 9: Magical Ethereal Floor Fog */}
      <div className="bg-magical-fog" />

      {/* LAYER 10: Vignette Edge Focus & Corner Arcane Marks */}
      <div className="bg-vignette-mask" />
      <div className="bg-corner-runes">
        <span className="corner-glyph top-left">╔</span>
        <span className="corner-glyph top-right">╗</span>
        <span className="corner-glyph bottom-left">╚</span>
        <span className="corner-glyph bottom-right">╝</span>
      </div>
    </div>
  );
}
