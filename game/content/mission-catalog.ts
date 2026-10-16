export interface MissionDifficulty {
  level: number;
  title: string;
  flavor: string;
  objective: string;
}

export type VenueId = "classroom" | "studio" | "auditorium" | "outdoor" | "stadium";

export interface MissionChapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themeHint: string;
  venueId: VenueId;
  venue: string;
  venueConcept: string;
  difficulties: readonly MissionDifficulty[];
}

/* <generated:stages> */
const GENERATED: Record<"xs" | "s" | "m" | "l" | "xl", { title: string; subtitle: string; levels: MissionDifficulty[] }> = {
  "xs": {
    "title": "The Gate of First Images",
    "subtitle": "Classroom · Teaching & Hybrid-Lesson Production",
    "levels": [
      {
        "level": 1,
        "title": "CL-01 · Wake the First Image",
        "flavor": "Guided · laptop to projector through the switcher · 10–12 min",
        "objective": "Show the lesson laptop on the classroom screen — and never the operator multiview."
      },
      {
        "level": 2,
        "title": "CL-02 · The Teacher Appears",
        "flavor": "Guided · two sources, clean cuts · 12–15 min",
        "objective": "Show the instructor and cut to a slide without ever cutting to black."
      },
      {
        "level": 3,
        "title": "CL-03 · Written Under the Lantern",
        "flavor": "Scenario · three-source lecture · 15–18 min",
        "objective": "Teach with a camera, slides and a document camera — every word readable."
      },
      {
        "level": 4,
        "title": "CL-04 · The Vanished Voice",
        "flavor": "Disruption · OBS workstation fault-finding · 18–22 min",
        "objective": "Deliver the remote classroom feed through OBS. Students hear nothing and lips are out of sync — fix it."
      },
      {
        "level": 5,
        "title": "CL-05 · Classroom Practical Certification",
        "flavor": "Certification · hybrid lesson from storage to sign-off · 25–35 min",
        "objective": "Prepare and operate a real hybrid lesson: teacher, slide deck and handout, audio, local projection, ISO recording and a private mock livestream."
      }
    ]
  },
  "s": {
    "title": "The Moon Bridge of Sound",
    "subtitle": "Studio · Interview & Multi-camera Broadcast",
    "levels": [
      {
        "level": 1,
        "title": "ST-01 · Hear the Voice",
        "flavor": "Guided · single mic to the mixer · 10–12 min",
        "objective": "Make the host's spoken voice clear at the mixer."
      },
      {
        "level": 2,
        "title": "ST-02 · Twin Voices Under Moonlight",
        "flavor": "Partial · two independently adjustable mics · 13–16 min",
        "objective": "Host and guest must be independently adjustable."
      },
      {
        "level": 3,
        "title": "ST-03 · The Three-Lens Council",
        "flavor": "Scenario · three cameras + sound into SDI · 18–22 min",
        "objective": "Shoot host, guest and the two-shot."
      },
      {
        "level": 4,
        "title": "ST-04 · The Silent Return",
        "flavor": "Disruption · SDI, monitoring and return fault isolation · 20–25 min",
        "objective": "The guest camera disappears and the director cannot monitor the show."
      },
      {
        "level": 5,
        "title": "ST-05 · Studio Practical Certification",
        "flavor": "Certification · five-minute two-person interview · 30–40 min",
        "objective": "Produce a 5-minute two-person interview from a blank studio: three angles, independently gained mics, multiview + PGM confidence, ISO + PGM recording and a private stream."
      }
    ]
  },
  "m": {
    "title": "The Glass Tower of Switched Images",
    "subtitle": "Auditorium · Multi-destination Live Event",
    "levels": [
      {
        "level": 1,
        "title": "AU-01 · Light the Great Screen",
        "flavor": "Guided · one configurable output to the audience · 10–14 min",
        "objective": "Show slides to the audience without showing the tech multiview."
      },
      {
        "level": 2,
        "title": "AU-02 · Voice Across the Hall",
        "flavor": "Partial · PA and feedback safety · 15–18 min",
        "objective": "Make the podium announcement heard across the hall — without howling."
      },
      {
        "level": 3,
        "title": "AU-03 · Three Views, Three Destinations",
        "flavor": "Scenario · independent PGM / AUX / multiview · 18–22 min",
        "objective": "Slides on the audience screen, current slides on the confidence screen, all sources on the FOH multiview — simultaneously."
      },
      {
        "level": 4,
        "title": "AU-04 · The Echo in the Tower",
        "flavor": "Disruption · FOH vs broadcast audio · 20–25 min",
        "objective": "Send the hall performance to the private OBS test viewer while keeping the house PA stable."
      },
      {
        "level": 5,
        "title": "AU-05 · Auditorium Practical Certification",
        "flavor": "Certification · keynote event from empty FOH · 30–40 min",
        "objective": "Set up and operate a simulated keynote from an empty FOH: audience PGM, performer confidence, FOH multiview, house PA, private stream and local recording."
      }
    ]
  },
  "l": {
    "title": "The Vault of Ancient Port Seals",
    "subtitle": "Outdoor Production Compound · Ports, Conversion, Patch & Safety",
    "levels": [
      {
        "level": 1,
        "title": "OUT-01 · Name the Sacred Ports",
        "flavor": "Guided · connector literacy & converter direction · 10–12 min",
        "objective": "Get Camera A's SDI picture onto the field HDMI monitor with the correct direction-specific converter."
      },
      {
        "level": 2,
        "title": "OUT-02 · Cross the Cable Path",
        "flavor": "Partial · rated SDI runs and public-crossing safety · 15–18 min",
        "objective": "Two field cameras, one control shelter, one public walkway. Bring both pictures in — safely."
      },
      {
        "level": 3,
        "title": "OUT-03 · Read the Router Seals",
        "flavor": "Scenario · conversion and Videohub crosspoints · 18–22 min",
        "objective": "Laptop slides and Camera A into the switcher through the Videohub: OUT 1 ← IN 1 to SDI IN 3, OUT 2 ← IN 2 to SDI IN 1."
      },
      {
        "level": 4,
        "title": "OUT-04 · The Broken Long Run",
        "flavor": "Disruption · fault diagnosis and transmission · 22–27 min",
        "objective": "The portable webcast is faulted. Restore it in a sensible order: safety → source → patch → monitor → record → WAN → ingest."
      },
      {
        "level": 5,
        "title": "OUT-05 · Field Rigging Practical Certification",
        "flavor": "Certification · weather-safe portable broadcast · 35–45 min",
        "objective": "Build and run a weather-safe interview/demo production from packed gear: two cameras + presentation, voice mix, MV/PGM, ISO record, Internet stream and a fallback network plan."
      }
    ]
  },
  "xl": {
    "title": "The Throne of Broadcast",
    "subtitle": "Sports Stadium · Multi-camera Outside Broadcast",
    "levels": [
      {
        "level": 1,
        "title": "SP-01 · The First Field View",
        "flavor": "Guided · main camera to the director's multiview · 12–15 min",
        "objective": "See the entire playing area on the director's monitor."
      },
      {
        "level": 2,
        "title": "SP-02 · Eyes Around the Arena",
        "flavor": "Partial · three-camera coverage on cue · 16–20 min",
        "objective": "Follow a play from wide → sideline → finish."
      },
      {
        "level": 3,
        "title": "SP-03 · The Score Is Written",
        "flavor": "Scenario · commentary mix + licensed score graphics · 20–25 min",
        "objective": "Make a comprehensible live sports program: two voices over controlled ambience, and a correct score card."
      },
      {
        "level": 4,
        "title": "SP-04 · The Broken Transmission",
        "flavor": "Disruption · switcher → encoder → WAN → viewer · 24–30 min",
        "objective": "Put the sports program on a private remote viewer and preserve local PGM recording."
      },
      {
        "level": 5,
        "title": "SP-05 · Sports Outside Broadcast Practical Certification",
        "flavor": "Certification · complete mock live football broadcast · 40–50 min",
        "objective": "From unsorted cases to handoff: four cameras, two commentators and ambience, verified live score, independent MV/PGM, tested recording and a separate hardware encoder to a private viewer."
      }
    ]
  }
};
/* </generated:stages> */

const chapter = (n: number, slug: string, room: keyof typeof GENERATED, venueId: VenueId, venue: string, venueConcept: string, description: string, themeHint: string): MissionChapter => ({
  id: `mission_0${n}`, slug, title: GENERATED[room].title, subtitle: GENERATED[room].subtitle, description, themeHint, venueId, venue, venueConcept,
  difficulties: GENERATED[room].levels,
});

/** Five rooms × five stages (game/training/sim/stages.ts). Slugs are stable: saved progress keys depend on them. */
export const missionChapters: readonly MissionChapter[] = [
  chapter(1, "gate-of-first-light", "xs", "classroom", "Classroom", "Teaching & hybrid lesson",
    "Your first post as a production trainee: bring a lesson to life — slides, teacher camera and document camera on the projector, clean speech, an ISO recording and a private mock livestream.",
    "A glowing stone gate over a real classroom AV desk"),
  chapter(2, "moonbridge-of-echoes", "s", "studio", "Studio", "Interview & multi-camera broadcast",
    "Run sound and vision for a three-camera interview: microphones, SDI cameras, multiview and PGM confidence, ISO recording and a private stream.",
    "A moonlit bridge over the studio cable canal — it carries no signal by magic"),
  chapter(3, "mirror-tower-of-switching", "m", "auditorium", "Auditorium", "Multi-destination live event",
    "Feed different pictures to different destinations — audience PGM, performer confidence and FOH multiview — while the house PA and the stream mix stay independent.",
    "A glass tower motif above a practical FOH booth"),
  chapter(4, "archive-of-ancient-ports", "l", "outdoor", "Outdoor compound", "Ports, conversion, patch & field safety",
    "Read every connector seal, convert in the right direction, patch through a router and keep a field broadcast safe — weather and power are GO/NO-GO decisions.",
    "Engraved connector seals on inspection pedestals"),
  chapter(5, "throne-of-the-grand-transmission", "xl", "stadium", "Stadium", "Multi-camera outside broadcast",
    "The final trial: a four-camera sports broadcast with commentary, a verified score, independent MV/PGM, local recording and a separate hardware encoder to a private viewer.",
    "A throne behind the OB director console — never in the optical path"),
];

export const getMissionBySlug = (slug: string | null | undefined) => missionChapters.find((mission) => mission.slug === slug) ?? null;
export const getDifficultyMeta = (mission: MissionChapter, level: number) => mission.difficulties.find((difficulty) => difficulty.level === level) ?? null;
export const getMissionDifficultyLabel = (mission: MissionChapter, level: number) => {
  const difficulty = getDifficultyMeta(mission, level);
  return difficulty ? `Level ${level} · ${difficulty.title}` : "";
};
