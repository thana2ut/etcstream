"use client";

import { memo } from "react";
import type { VenueId } from "@/game/content/mission-catalog";
import { StudioRoom01 } from "./studio-room-01";
import { Classroom } from "./venue/classroom";
import { Auditorium } from "./venue/auditorium";
import { Outdoor } from "./venue/outdoor";
import { Stadium } from "./venue/stadium";

/** Scene shell per mission venue. Every venue keeps the studio's gameplay footprint (table, ports, colliders). Memoised: the scene is static while the training store updates. */
export const VenueEnvironment = memo(function VenueEnvironment({ venue }: { venue: VenueId }) {
  switch (venue) {
    case "classroom": return <Classroom />;
    case "auditorium": return <Auditorium />;
    case "outdoor": return <Outdoor />;
    case "stadium": return <Stadium />;
    default: return <StudioRoom01 />;
  }
});
