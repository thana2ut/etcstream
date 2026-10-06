import { STUDIO } from "./studio-room-layout";

/**
 * Physical layout of each venue — the single source of truth for where a real AV / streaming technician
 * would find, carry and operate equipment. Gameplay (placement, staging, reachability, spawn) and the 3D
 * environments (furniture + colliders) both read this file, so the room and its rules never drift.
 *
 * Coordinates: metres, Y up, yaw about Y. Device yaw 0 = front / ports toward +Z; cameras: lens toward −Z.
 * Furniture is axis-aligned; `center` is the floor centre, `size` = [x width, height, z depth].
 */
export type Point3 = [number, number, number];
export type LayoutId = "studio" | "classroom" | "auditorium" | "outdoor" | "stadium";

export interface Spot { p: Point3; yaw: number; label?: string }
export interface Surface { shape: "round" | "rect"; center: Point3; radius?: number; size?: [number, number]; front: 1 | -1;
  /** Extra shelf heights below the top (cable racks): stored items are spread over every level. */
  levels?: number[] }
export type FurnitureKind =
  | "operatorDesk" | "teacherDesk" | "studentDesk" | "avCabinet" | "tvStand"
  | "fohDesk" | "audioDesk" | "roadCase" | "cableRack" | "presenterTable" | "riser" | "stage" | "podium" | "audienceTable"
  | "tentDesk" | "fieldCase" | "cableReel" | "powerCase" | "chairBlock"
  | "productionDesk" | "rackCabinet" | "commentaryDesk" | "controlWall" | "cameraPlatform";
export interface Furniture { id: string; kind: FurnitureKind; center: Point3; size: Point3; label?: string }
export interface Obstacle { center: Point3; half: Point3 }

export interface VenueLayout {
  id: LayoutId;
  job: string;
  /** Walkable box; environment walls / barriers sit just outside it. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  spawn: Point3;
  /** Camera yaw at spawn (0 looks toward −Z). */
  spawnYaw: number;
  /** Main operator position (free placement surface for F). */
  work: Surface;
  /** Where portable equipment waits before setup. */
  equipment: Surface;
  /** Dedicated cable storage. */
  cables: Surface;
  /** Operating position of every scenario device id (fixed gear stands here; movable gear is carried here). */
  places: Record<string, Spot>;
  /** Venue furniture (rendered by the environment; also the colliders). Surfaces above are tops of these. */
  furniture: Furniture[];
  /** Extra blockers that are not furniture (stage walls, room walls, tent poles). */
  obstacles: Obstacle[];
  /** Short human description per zone (docs / HUD). */
  zones: string[];
}

export const yawToward = (from: readonly number[], to: readonly number[]) => Math.atan2(-(to[0] - from[0]), -(to[2] - from[2]));
const at = (x: number, y: number, z: number, yaw = 0, label?: string): Spot => ({ p: [x, y, z], yaw, label });
const cam = (x: number, z: number, target: [number, number], label?: string): Spot => ({ p: [x, 0, z], yaw: yawToward([x, 0, z], [target[0], 0, target[1]]), label });
const top = (f: Furniture, front: 1 | -1 = 1): Surface => ({ shape: "rect", center: [f.center[0], f.size[1], f.center[2]], size: [f.size[0], f.size[2]], front, ...(f.kind === "cableRack" ? { levels: [0.55] } : {}) });
const furn = (id: string, kind: FurnitureKind, x: number, z: number, w: number, h: number, d: number, label?: string): Furniture => ({ id, kind, center: [x, 0, z], size: [w, h, d], label });

/* ════════ S · Studio Room 01 (original architecture, enlarged room) ════════
 *  GREEN SCREEN (−Z wall)  →  CAM 1 / CAM 2 / CAM 3  →  presenter zone  →  round production table  →  PLAYER (+Z)
 *  Left long table = cable staging · right long table = portable equipment · studio monitor on its cart (right).  */
const studioTable = STUDIO.table;
const studio: VenueLayout = {
  id: "studio",
  job: "เตรียมระบบภาพและเสียงของห้องสตูดิโอ",
  bounds: { minX: -STUDIO.room.width / 2, maxX: STUDIO.room.width / 2, minZ: -STUDIO.room.depth / 2, maxZ: STUDIO.room.depth / 2 },
  spawn: STUDIO.spawn, spawnYaw: -0.48,
  work: { shape: "round", center: [studioTable[0], studioTable[1], studioTable[2]], radius: STUDIO.tableRadius, front: 1 },
  equipment: { shape: "rect", center: [STUDIO.sideTables[1][0], STUDIO.sideTables[1][1], STUDIO.sideTables[1][2]], size: [STUDIO.sideTableSize[0], STUDIO.sideTableSize[2]], front: 1 },
  cables: { shape: "rect", center: [STUDIO.sideTables[0][0], STUDIO.sideTables[0][1], STUDIO.sideTables[0][2]], size: [STUDIO.sideTableSize[0], STUDIO.sideTableSize[2]], front: 1 },
  places: {
    // Rear of the round table (toward the cameras); operator stands on the +Z side.
    sw: at(0, studioTable[1], -1.75, 0, "กลางด้านหลังโต๊ะผลิต (หันหาผู้ควบคุม)"),
    mix: at(-1.05, studioTable[1], -1.6, 0, "ซ้ายของ HDS7105"),
    capture: at(0.62, studioTable[1], -1.0, 0, "ระหว่าง HDS7105 กับ HP Notebook"),
    pc: at(1.25, studioTable[1], -1.3, -0.35, "หลัง-ขวาของโต๊ะผลิต"),
    rx: at(-1.15, studioTable[1], -0.85, 0, "ข้าง Audio Mixer"),
    tx1: at(-1.75, studioTable[1], -0.3, 0, "จุดเตรียมไมค์ (ซ้ายหน้าโต๊ะ)"),
    tx2: at(-1.35, studioTable[1], 0.1, 0, "จุดเตรียมไมค์ (ซ้ายหน้าโต๊ะ)"),
    lav1: at(4.7, STUDIO.sideTables[1][1], 1.6, 0), lav2: at(5.1, STUDIO.sideTables[1][1], 1.6, 0),
    monitor: at(STUDIO.monitor[0], 1.1, STUDIO.monitor[2], 0, "Studio Monitor บนรถเข็น"),
    cam1: cam(-2.6, -3.4, [0, -5.0], "กล้อง 1 ซ้ายหน้า"), cam2: cam(0, -3.75, [0, -5.2], "กล้อง 2 กลาง (ช็อตหลัก)"), cam3: cam(2.6, -3.4, [0, -5.0], "กล้อง 3 ขวาหน้า"),
    convert1: at(-2.6, 0, -2.85, 0), convert2: at(0, 0, -3.2, 0), convert3: at(2.6, 0, -2.85, 0),
  },
  furniture: [], // Studio Room 01 GLB already contains its furniture and colliders.
  obstacles: [],
  zones: ["ฉากเขียว + จุดพิธีกร (ด้านหน้า)", "แถวกล้อง 3 ตัวบนขาตั้ง", "โต๊ะกลมผลิตรายการ (จุดทำงานหลัก)", "โต๊ะยาวซ้าย = สาย", "โต๊ะยาวขวา = อุปกรณ์พกพา", "Studio Monitor บนรถเข็น"],
};

/* ════════ XS · Classroom ════════
 *  Front wall: whiteboard + projector screen + classroom TV · teacher desk with presentation laptop
 *  Student desks in the middle · tripod camera rear-centre · AV operator desk rear-right · AV cabinet on the right wall. */
const xsDesk = furn("xs-operator", "operatorDesk", 3.5, 2.9, 2.4, 0.76, 0.8, "โต๊ะควบคุม AV");
const xsCabinet = furn("xs-cabinet", "avCabinet", 5.35, 0.1, 0.62, 0.95, 3.0, "ตู้ AV");
const xsCableShelf = furn("xs-cable-shelf", "cableRack", 1.5, 3.95, 1.1, 0.9, 0.45, "ชั้นวางสาย");
const xsTeacher = furn("xs-teacher", "teacherDesk", -3.2, -3.0, 1.6, 0.76, 0.7, "โต๊ะผู้สอน");
const XS_STUDENT: Furniture[] = [];
for (const [r, z] of [-1.1, 0.15, 1.4].entries()) for (const x of [-4.0, -2.7, -1.4, 1.4, 2.7]) {
  if (r === 2 && x === 2.7) continue; // keeps the walkway to the operator desk open
  XS_STUDENT.push(furn(`xs-student-${r}-${x}`, "studentDesk", x, z, 0.72, 0.72, 0.5));
}
const classroom: VenueLayout = {
  id: "classroom",
  job: "เตรียมระบบนำเสนอและถ่ายทอดในห้องเรียน",
  bounds: { minX: -5.75, maxX: 5.75, minZ: -4.4, maxZ: 4.4 },
  spawn: [5.1, 0.84, 1.95], spawnYaw: yawToward([5.1, 0, 1.95], [0, 0, -2.4]),
  work: top(xsDesk),
  equipment: { shape: "rect", center: [xsCabinet.center[0], xsCabinet.size[1], xsCabinet.center[2]], size: [0.55, 2.8], front: 1 },
  cables: top(xsCableShelf, -1),
  places: {
    rx: at(2.55, 0.76, 2.85, 0, "โต๊ะควบคุม AV — ข้าง Mixer"),
    mix: at(3.05, 0.76, 2.75, 0, "โต๊ะควบคุม AV"),
    sw: at(3.6, 0.76, 2.72, 0, "โต๊ะควบคุม AV — กลาง"),
    capture: at(4.08, 0.76, 2.85, 0, "โต๊ะควบคุม AV — ระหว่างสวิตเชอร์กับโน้ตบุ๊ก"),
    pc: at(4.45, 0.76, 2.8, -0.25, "โต๊ะควบคุม AV — ขวา"),
    slides: at(-3.6, 0.76, -3.05, 0, "โต๊ะผู้สอน (หน้าห้อง)"),
    tx1: at(-3.0, 0.76, -2.9, 0, "โต๊ะผู้สอน — ไมค์ผู้สอน"), lav1: at(-2.62, 0.76, -2.9, 0),
    monitor: at(4.2, 0.98, -3.85, 0, "TV ห้องเรียน (ผนังหน้า ขวา)"),
    cam1: cam(0, 3.35, [-1.2, -3.6], "กล้องห้องเรียน หลังห้องกลาง"),
  },
  furniture: [xsDesk, xsCabinet, xsCableShelf, xsTeacher, furn("xs-tv", "tvStand", 4.2, -3.9, 1.2, 0.95, 0.45), ...XS_STUDENT],
  obstacles: [],
  zones: ["หน้าห้อง: ไวท์บอร์ด จอโปรเจกเตอร์ TV และโต๊ะผู้สอน", "กลางห้อง: โต๊ะนักเรียน 3 แถว", "หลังห้อง: กล้องบนขาตั้ง + โต๊ะควบคุม AV", "ผนังขวา: ตู้ AV (อุปกรณ์พกพา)", "ข้างโต๊ะควบคุม: ชั้นวางสาย"],
};

/* ════════ M · Auditorium / activity hall ════════
 *  Stage at the front (−Z) with podium, LED screen behind · stagebox + LED processor stage-right · side-stage mic case stage-left
 *  Audience blocks with left / centre / right aisles · FOH production desk + audio desk rear-centre · cable rack + road case behind FOH. */
const mFoh = furn("m-foh", "fohDesk", 0.4, 5.6, 4.2, 0.76, 0.9, "FOH Production");
const mAudio = furn("m-audio", "audioDesk", -3.1, 5.75, 1.8, 0.76, 0.85, "FOH Audio");
const mCableRack = furn("m-cable-rack", "cableRack", 4.0, 7.75, 2.6, 1.0, 0.7, "Cable rack");
const mSideCase = furn("m-side-case", "roadCase", -8.1, -4.6, 1.0, 0.85, 1.4, "Side-stage mic case");
const M_AUDIENCE: Furniture[] = [];
for (const z of [-2.2, -0.4, 1.4, 3.0]) for (const x of [-5.1, -2.7, 2.7, 5.1]) M_AUDIENCE.push(furn(`m-aud-${x}-${z}`, "audienceTable", x, z, 1.8, 0.76, 1.3));
const auditorium: VenueLayout = {
  id: "auditorium",
  job: "เตรียมระบบถ่ายทอดกิจกรรมบนเวที",
  bounds: { minX: -9, maxX: 9, minZ: -6.6, maxZ: 9 },
  spawn: [-7.9, 0.84, 8.2], spawnYaw: yawToward([-7.9, 0, 8.2], [0, 0, 0]),
  work: top(mFoh),
  equipment: top(mSideCase),
  cables: top(mCableRack, -1),
  places: {
    sw: at(0.1, 0.76, 5.4, 0, "FOH: Production SDI Switcher"),
    monitor: at(-1.0, 0.76, 5.3, 0, "FOH: Multiview Monitor"),
    capture: at(1.2, 0.76, 5.5, 0, "FOH: Capture / Recorder"),
    pc: at(1.95, 0.76, 5.45, -0.2, "FOH: Production Computer"),
    mix: at(-3.25, 0.76, 5.6, 0, "FOH Audio: Digital Mixer"),
    rx: at(-2.5, 0.76, 5.85, 0, "FOH Audio: Wireless receiver"),
    stagebox: at(8.3, 0, -4.4, -Math.PI / 2, "Stagebox ข้างเวทีขวา"),
    display: at(8.3, 0, -2.9, -Math.PI / 2, "LED processor ข้างเวทีขวา"),
    mic1: at(-2.2, 1.9, -4.6, 0, "Podium บนเวที"),
    mic2: at(5.8, 0.8, -4.25, 0, "ขาไมค์ Handheld หน้าเวทีขวา"),
    slides: at(-4.4, 0.76, -3.3, 0, "โต๊ะ Presentation หน้าเวทีซ้าย"),
    tx1: at(-1.2, 0.8, -4.35, 0, "จุดพิธีกรบนเวที"), lav1: at(-7.95, 0.85, -4.25, 0),
    cam1: cam(0, 3.95, [0, -5.5], "กล้อง 1 หลังกลาง (Wide)"),
    cam2: cam(-8.2, 0.9, [-1, -4.6], "กล้อง 2 ทางเดินซ้าย"),
    cam3: cam(8.2, 0.9, [1, -4.6], "กล้อง 3 ทางเดินขวา"),
    cam4: cam(-8.4, -2.9, [0, -4.8], "PTZ ใกล้เวทีซ้าย"),
  },
  furniture: [
    mFoh, mAudio, mCableRack, mSideCase, furn("m-case-foh", "roadCase", 6.4, 7.75, 1.2, 0.85, 0.7, "Road case"),
    furn("m-stage", "stage", 0, -5.3, 14.0, 0.8, 2.6), furn("m-podium", "podium", -2.2, -4.85, 0.7, 1.9, 0.55),
    furn("m-presenter", "presenterTable", -4.4, -3.35, 1.3, 0.76, 0.6), furn("m-cam-riser", "riser", 0, 3.95, 1.4, 0.25, 1.2),
    ...M_AUDIENCE,
  ],
  obstacles: [],
  zones: ["เวที: Podium, จุดพิธีกร, จอ LED ด้านหลัง", "ข้างเวทีขวา: Stagebox + LED processor", "ข้างเวทีซ้าย: กล่องไมค์ / อุปกรณ์", "ผู้ชม: ทางเดินซ้าย กลาง ขวา", "FOH หลังกลาง: Production + Audio desk", "หลัง FOH: Cable rack + road case"],
};

/* ════════ L · Outdoor event ════════
 *  Stage far at the front · audience in the middle · control tent rear-right · service entrance rear-left (road cases, cable reels). */
const lTent = furn("l-tent-desk", "tentDesk", 4.0, 8.0, 3.8, 0.76, 0.9, "Control tent");
const lFiberCase = furn("l-fiber-case", "fieldCase", 1.55, 8.15, 0.8, 0.85, 0.6, "Fiber RX case");
const lGearCase = furn("l-gear-cases", "fieldCase", -9.2, 8.7, 2.6, 0.85, 0.7, "Field equipment cases");
const lCableCase = furn("l-cable-case", "fieldCase", -9.2, 6.7, 2.6, 0.85, 0.7, "Field cable box");
const L_CHAIRS: Furniture[] = [];
for (const z of [-3.6, -2.0, -0.4, 1.2]) for (const x of [-4.4, -2.4, 2.4, 4.4]) L_CHAIRS.push(furn(`l-chairs-${x}-${z}`, "chairBlock", x, z, 1.6, 0.85, 0.6));
const outdoor: VenueLayout = {
  id: "outdoor",
  job: "เตรียมระบบถ่ายทอดภาคสนาม",
  bounds: { minX: -12, maxX: 12, minZ: -10, maxZ: 11.5 },
  spawn: [-10.8, 0.84, 10.6], spawnYaw: yawToward([-10.8, 0, 10.6], [4, 0, 7]),
  work: top(lTent),
  equipment: top(lGearCase),
  cables: top(lCableCase),
  places: {
    mix: at(2.6, 0.76, 7.85, 0, "เต็นท์ควบคุม: Field Mixer"),
    sw: at(3.35, 0.76, 7.8, 0, "เต็นท์ควบคุม: Field Switcher"),
    monitor: at(4.15, 0.76, 7.75, 0, "เต็นท์ควบคุม: Portable Multiview"),
    encoder: at(4.95, 0.76, 7.85, 0, "เต็นท์ควบคุม: Encoder (หลังสวิตเชอร์)"),
    network: at(5.6, 0.76, 7.85, 0, "เต็นท์ควบคุม: 4G/5G Router (หลัง Encoder)"),
    rx: at(2.4, 0.76, 8.3, 0, "เต็นท์ควบคุม: Wireless receiver"),
    live: at(6.75, 0, 8.6, -Math.PI / 2, "Uplink / Live destination (จำลอง)"),
    "fiber-rx": at(1.55, 0.85, 8.15, 0, "กล่อง Fiber RX ข้างโต๊ะควบคุม"),
    "fiber-tx": at(-7.0, 0, -5.35, 0, "ฐานกล้อง A (Fiber TX)"),
    mic0: at(-2.6, 0, -6.05, 0, "Shotgun บนบูมหน้าเวที"),
    mic1: at(-7.2, 0, 0.4, Math.PI / 2, "Ambient mic ฝั่งผู้ชม"),
    tx1: at(0.8, 1.0, -7.35, 0, "จุดพิธีกรบนเวที"), lav1: at(1.2, 1.0, -7.35, 0),
    cam1: cam(-7.6, -5.0, [0, -8.0], "กล้อง A หน้าซ้าย (ไกล · ผ่าน Fiber)"),
    cam2: cam(6.8, -5.2, [0, -8.0], "กล้อง B หน้าขวา (พิธีกร)"),
    cam3: cam(0, 4.3, [0, -8.0], "กล้อง C หลังกลาง (ภาพรวม)"),
  },
  furniture: [
    lTent, lFiberCase, lGearCase, lCableCase,
    furn("l-power", "powerCase", 5.4, 10.4, 0.9, 0.7, 0.6, "UPS / Power"),
    furn("l-reel-a", "cableReel", -10.9, 5.4, 0.9, 0.9, 0.5), furn("l-reel-b", "cableReel", -9.7, 5.4, 0.9, 0.9, 0.5),
    furn("l-stage", "stage", 0, -8.6, 12.0, 1.0, 3.2), furn("l-cam-riser", "riser", 0, 4.3, 1.4, 0.3, 1.2),
    ...L_CHAIRS,
  ],
  obstacles: [[1.9, 6.6], [6.1, 6.6], [1.9, 10.9], [6.1, 10.9]].map(([x, z]) => ({ center: [x, 1.3, z] as Point3, half: [0.06, 1.3, 0.06] as Point3 })),
  zones: ["เวทีและจุดพิธีกร (ไกลด้านหน้า)", "พื้นที่ผู้ชม + Ambient mic", "จุดกล้อง A / B / C กระจายห่างกัน", "เต็นท์ควบคุม: Switcher → Encoder → Router", "ทางเข้าบริการ: road case + ม้วนสาย"],
};

/* ════════ XL · Stadium live broadcast — three zones ════════
 *  ZONE C (west): broadcast control room — multiview wall on the front wall, switcher / replay / graphics desk rows, audio desk, rack wall.
 *  ZONE B (centre-east): commentary desk.  ZONE A (south / +Z): pitch-side camera positions + crowd / field mics. */
const xlSwitch = furn("xl-switch", "productionDesk", -7.0, -5.0, 4.4, 0.76, 0.9, "Production Switcher desk");
const xlReplay = furn("xl-replay", "productionDesk", -7.0, -2.9, 4.4, 0.76, 0.9, "Replay desk");
const xlGraphics = furn("xl-graphics", "productionDesk", -7.0, -0.8, 4.4, 0.76, 0.9, "Graphics desk");
const xlAudio = furn("xl-audio", "audioDesk", -2.6, -4.0, 1.8, 0.76, 1.0, "Audio console");
const xlCases = furn("xl-cases", "roadCase", 2.4, 3.2, 2.6, 0.85, 0.7, "Technical road cases · สาย");
const xlCableRack = furn("xl-cable-rack", "cableRack", -2.3, 0.8, 1.6, 1.0, 0.5, "Accessory rack");
const xlCommentary = furn("xl-commentary", "commentaryDesk", 6.2, -1.6, 3.0, 0.76, 0.8, "Commentary desk");
const RACKS: [string, number, string][] = [["ccu", -6.4, "CCU / Base Station"], ["router", -5.6, "Video Router"], ["encoder", -3.8, "Main Encoder"], ["network", -3.0, "Primary Network"], ["live", -2.2, "Uplink"], ["backup", -0.2, "Backup Encoder"], ["backup-net", 0.6, "Backup Network"]];
const stadium: VenueLayout = {
  id: "stadium",
  job: "เตรียมระบบ Live Production สนามกีฬา",
  bounds: { minX: -13, maxX: 14, minZ: -7.5, maxZ: 14 },
  spawn: [1.2, 0.84, 1.2], spawnYaw: yawToward([1.2, 0, 1.2], [-1, 0, -0.4]),
  work: top(xlSwitch),
  equipment: top(xlCableRack, -1),
  cables: top(xlCases),
  places: {
    sw: at(-7.0, 0.76, -5.15, 0, "แถว 1: Production Switcher"),
    preview: at(-5.4, 0.76, -5.3, 0, "แถว 1: Preview monitor"),
    replay: at(-7.6, 0.76, -3.05, 0, "แถว 2: Replay"),
    graphics: at(-6.4, 0.76, -0.95, 0, "แถว 3: Graphics Workstation"),
    mix: at(-2.6, 0.76, -4.15, 0, "Audio area: Digital Audio Console"),
    rx: at(-1.95, 0.76, -3.75, 0, "Audio area: Wireless receiver"),
    monitor: at(-7.0, 1.0, -6.75, 0, "Multiview Wall (ผนังหน้า)"),
    ...Object.fromEntries(RACKS.map(([id, z, label]) => [id, at(-12.55, 0, z, Math.PI / 2, `Rack: ${label}`)])),
    display: at(13.2, 0, 11.0, -Math.PI / 2, "Stadium display processor"),
    mic0: at(5.5, 0.76, -1.75, 0, "Commentary desk: Mic 1"), mic1: at(6.9, 0.76, -1.75, 0, "Commentary desk: Mic 2"),
    mic2: at(-11.8, 0, 11.6, Math.PI / 2, "Crowd mic ซ้าย"), mic3: at(13.0, 0, 9.0, -Math.PI / 2, "Crowd mic ขวา"),
    mic4: at(3.0, 0, 13.0, Math.PI, "Field mic ข้างสนาม"),
    tx1: at(-2.4, 0, 12.9, Math.PI, "จุดพิธีกรข้างสนาม"), lav1: at(-2.0, 0, 12.9, Math.PI),
    cam1: { p: [0, 0, 8.2], yaw: Math.PI, label: "กล้อง 1 Main wide (แท่นสูง)" },
    cam2: { p: [-9.5, 0, 12.6], yaw: Math.PI, label: "กล้อง 2 ข้างสนามซ้าย" },
    cam3: { p: [9.5, 0, 12.6], yaw: Math.PI, label: "กล้อง 3 ข้างสนามขวา" },
    cam4: { p: [13.0, 0, 5.4], yaw: -Math.PI / 2 - 0.4, label: "กล้อง 4 End-zone" },
    cam5: { p: [-5.0, 0, 11.8], yaw: Math.PI - 0.2, label: "กล้อง 5 Long-lens" },
    cam6: { p: [5.0, 0, 12.7], yaw: Math.PI + 0.2, label: "กล้อง 6 Mobile field" },
  },
  furniture: [
    xlSwitch, xlReplay, xlGraphics, xlAudio, xlCases, xlCableRack, xlCommentary,
    ...RACKS.map(([id, z]) => furn(`xl-rack-${id}`, "rackCabinet", -12.55, z, 0.6, 2.0, 0.6)),
    furn("xl-wall", "controlWall", -7.0, -7.15, 7.0, 0.1, 0.3),
    furn("xl-cam1-platform", "cameraPlatform", 0, 8.2, 1.6, 0.3, 1.6),
  ],
  // Control-room shell: north wall is the venue edge; east wall with a door gap at z −1.0 … 0.6; south wall from x −13 … −2.6.
  obstacles: [
    { center: [-1.0, 1.4, -4.35], half: [0.1, 1.4, 3.15] },
    { center: [-1.0, 1.4, 1.35], half: [0.1, 1.4, 0.75] },
    { center: [-7.0, 1.4, 2.2], half: [6.0, 1.4, 0.1] },
  ],
  zones: ["ZONE C ห้องควบคุม: Multiview Wall, แถวโต๊ะ Switcher / Replay / Graphics, Audio console, ตู้ Rack", "ZONE B: โต๊ะผู้บรรยาย", "ZONE A ข้างสนาม: กล้อง 6 ตำแหน่ง, Crowd / Field mic, จุดพิธีกร", "ทางเดินกลาง: Technical road cases (อุปกรณ์), Cable rack ในห้องควบคุม"],
};

export const LAYOUTS: Record<LayoutId, VenueLayout> = { studio, classroom, auditorium, outdoor, stadium };

/* ════════ helpers shared by gameplay and environments ════════ */
export function onSurface(s: Surface, x: number, z: number, margin = 0): boolean {
  if (s.shape === "round") return Math.hypot(x - s.center[0], z - s.center[2]) <= (s.radius ?? 1) + margin;
  const [w, d] = s.size ?? [1, 1];
  return Math.abs(x - s.center[0]) <= w / 2 + margin && Math.abs(z - s.center[2]) <= d / 2 + margin;
}
/** Clamp a point onto the surface top, `inset` metres inside its edge. */
export function clampToSurface(s: Surface, x: number, z: number, inset = 0.2): Point3 {
  if (s.shape === "round") {
    let dx = x - s.center[0], dz = z - s.center[2];
    const limit = (s.radius ?? 1) - inset, dist = Math.hypot(dx, dz);
    if (dist > limit) { dx *= limit / dist; dz *= limit / dist; }
    return [+(s.center[0] + dx).toFixed(3), s.center[1], +(s.center[2] + dz).toFixed(3)];
  }
  const [w, d] = s.size ?? [1, 1];
  const cx = Math.min(Math.max(x, s.center[0] - w / 2 + inset), s.center[0] + w / 2 - inset);
  const cz = Math.min(Math.max(z, s.center[2] - d / 2 + inset), s.center[2] + d / 2 - inset);
  return [+cx.toFixed(3), s.center[1], +cz.toFixed(3)];
}
/** Evenly spaced staging slots along a rect surface's long axis (rows across its depth). */
export function surfaceSlots(s: Surface, count: number, rows = 1, inset = 0.2): Point3[] {
  if (count <= 0) return [];
  const [w, d] = s.size ?? [1, 1];
  const long = w >= d, L = long ? w : d, S = long ? d : w;
  const perRow = Math.ceil(count / rows);
  return Array.from({ length: count }, (_, i) => {
    const col = i % perRow, row = Math.floor(i / perRow);
    const along = perRow === 1 ? 0 : (col / (perRow - 1) - 0.5) * (L - inset * 2);
    const across = rows === 1 ? 0 : (row / (rows - 1) - 0.5) * (S - inset * 2);
    return long ? [+(s.center[0] + along).toFixed(3), s.center[1], +(s.center[2] + across).toFixed(3)]
      : [+(s.center[0] + across).toFixed(3), s.center[1], +(s.center[2] + along).toFixed(3)];
  });
}
/** Height a dropped object lands at: the top of any furniture / surface under it, else the floor. */
export function dropHeight(layout: VenueLayout, x: number, z: number): number {
  for (const s of [layout.work, layout.equipment, layout.cables]) if (onSurface(s, x, z)) return s.center[1] + 0.06;
  for (const f of layout.furniture) if (Math.abs(x - f.center[0]) <= f.size[0] / 2 && Math.abs(z - f.center[2]) <= f.size[2] / 2) return f.size[1] + 0.06;
  return 0.08;
}
export function nearStaging(layout: VenueLayout, x: number, z: number): boolean {
  return onSurface(layout.equipment, x, z, 0.9) || onSurface(layout.cables, x, z, 0.9);
}
/** All blockers (furniture boxes + extra obstacles) as centre / half extents. */
export function layoutObstacles(layout: VenueLayout): { center: Point3; half: Point3 }[] {
  return [
    ...layout.furniture.filter((f) => f.kind !== "controlWall").map((f) => ({ center: [f.center[0], f.size[1] / 2, f.center[2]] as Point3, half: [f.size[0] / 2, f.size[1] / 2, f.size[2] / 2] as Point3 })),
    ...layout.obstacles,
  ];
}
