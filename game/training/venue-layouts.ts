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
export type LayoutId = "studio" | "studioMission" | "classroom" | "auditorium" | "outdoor" | "stadium";

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
    capture: at(0.62, studioTable[1], -1.0, 0, "ระหว่าง HDS7105 กับ Notebook: Magewell"),
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

/* ════════ XS · Classroom (reference: art/reference/venues/classroom-01/02) ════════
 *  Front wall: projector screen centred over the teacher desk · mobile whiteboard front-left · classroom TV front-right
 *  Two blocks of 2-seat student tables with a centre aisle · camera on a tripod by the left windows (with softbox)
 *  โต๊ะควบคุม AV rear-right · metal storage shelving (portable gear) on the right wall. */
const xsDesk = furn("xs-operator", "operatorDesk", 3.5, 2.9, 2.4, 0.76, 0.8, "โต๊ะควบคุม AV");
const xsCabinet = furn("xs-cabinet", "avCabinet", 5.35, 0.1, 0.62, 0.95, 3.0, "ตู้ AV");
const xsCableShelf = furn("xs-cable-shelf", "cableRack", 1.5, 3.95, 1.1, 0.9, 0.45, "ชั้นวางสาย");
const xsTeacher = furn("xs-teacher", "teacherDesk", 0, -3.0, 3.6, 0.76, 1.4, "โต๊ะผู้สอน / ควบคุมภาพและเสียง");
// 2-seat tables: left block (3 seats wide) and right block, centre aisle between them.
const XS_STUDENT: Furniture[] = [];
for (const [r, z] of [-1.1, 0.15, 1.4].entries()) {
  XS_STUDENT.push(furn(`xs-student-${r}-l`, "studentDesk", -2.7, z, 2.5, 0.74, 0.55));
  if (r < 2) XS_STUDENT.push(furn(`xs-student-${r}-r`, "studentDesk", 2.05, z, 1.75, 0.74, 0.55)); // last row right: walkway to the AV desk
}
const classroom: VenueLayout = {
  id: "classroom",
  job: "เตรียมระบบนำเสนอและถ่ายทอดในห้องเรียน",
  bounds: { minX: -5.75, maxX: 5.75, minZ: -4.4, maxZ: 4.4 },
  spawn: [5.1, 0.84, 1.95], spawnYaw: yawToward([5.1, 0, 1.95], [0, 0, -2.4]),
  work: top(xsTeacher),
  equipment: { shape: "rect", center: [xsCabinet.center[0], xsCabinet.size[1], xsCabinet.center[2]], size: [0.55, 2.8], front: 1 },
  cables: top(xsCableShelf, -1),
  places: {
    rx: at(-0.95, 0.76, -2.7, 0, "โต๊ะผู้สอน — ข้าง Mixer"),
    mix: at(-0.8, 0.76, -3.13, 0, "โต๊ะผู้สอน — ควบคุมเสียง"),
    sw: at(0, 0.76, -2.85, 0, "โต๊ะผู้สอน — ควบคุมภาพ"),
    capture: at(0.45, 0.76, -3.0, 0),
    pc: at(0.85, 0.76, -3.1, -0.25, "โต๊ะผู้สอน — เครื่องสตรีม"),
    slides: at(0.05, 0.76, -3.2, Math.PI, "โต๊ะผู้สอน — โน้ตบุ๊กหันหน้าจอเข้าผู้สอน"),
    tx1: at(0.5, 0.76, -2.7, 0, "โต๊ะผู้สอน — ไมค์ผู้สอน"), lav1: at(0.85, 0.76, -2.7, 0),
    monitor: at(4.2, 0.98, -3.85, 0, "TV ห้องเรียน (ผนังหน้า ขวา)"),
    cam1: cam(-3.8, -2.2, [0.1, -3.72], "กล้องผู้สอนริมหน้าต่าง"),
  },
  furniture: [xsDesk, xsCabinet, xsCableShelf, xsTeacher, furn("xs-tv", "tvStand", 4.2, -3.9, 1.2, 0.95, 0.45), ...XS_STUDENT],
  obstacles: [],
  zones: ["หน้าห้อง: จอโปรเจกเตอร์กลาง โต๊ะผู้สอน ไวท์บอร์ด (ซ้าย) TV (ขวา)", "กลางห้อง: โต๊ะนักเรียนคู่ 2 ฝั่ง ทางเดินกลาง", "ริมหน้าต่าง: กล้องบนขาตั้ง + ไฟ Softbox", "หน้าห้อง: โต๊ะผู้สอนและจุดควบคุมหลัก", "ผนังขวา: ชั้นเหล็กเก็บอุปกรณ์พกพา", "หลังห้อง: ชั้นสายและโต๊ะพักอุปกรณ์"],
};

/* ════════ M · Auditorium / activity hall ════════
 *  Stage at the front (−Z) with podium, LED screen behind · stagebox + LED processor stage-right · side-stage mic case stage-left
 *  Audience blocks with left / centre / right aisles · FOH production desk + audio desk rear-centre · cable rack + road case behind FOH. */
const mFoh = furn("m-foh", "fohDesk", 0.4, 5.6, 4.2, 0.76, 0.9, "FOH Production");
const mAudio = furn("m-audio", "audioDesk", -3.1, 5.75, 1.8, 0.76, 0.85, "FOH Audio");
const mCableRack = furn("m-cable-rack", "cableRack", 4.0, 7.75, 2.6, 1.0, 0.7, "ชั้นเก็บสาย");
const mSideCase = furn("m-side-case", "roadCase", -5.3, 7.75, 5.8, 0.85, 0.85, "จุดเตรียมไมค์และอุปกรณ์หลังห้อง");
const M_AUDIENCE: Furniture[] = [];
// 126 seats: three blocks, two generous longitudinal aisles and a rear camera route.
for (let row = 0; row < 7; row++) for (const x of [-4.2, 0, 4.2]) M_AUDIENCE.push(furn(`m-aud-${x}-${row}`, "chairBlock", x, -2.0 + row * 0.78, 3.48, 1.16, 0.48));
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
    pc: at(1.7, 0.76, 5.45, -0.2, "FOH: Production Computer"),
    mix: at(-3.25, 0.76, 5.7, 0, "FOH Audio: Digital Mixer"),
    rx: at(-2.65, 0.76, 5.85, 0, "FOH Audio: Wireless receiver"),
    stagebox: at(8.3, 0, -4.4, -Math.PI / 2, "Stagebox ข้างเวทีขวา"),
    display: at(8.3, 0, -2.9, -Math.PI / 2, "LED processor ข้างเวทีขวา"),
    mic1: at(-2.2, 1.9, -4.6, 0, "Podium บนเวที"),
    mic2: at(5.8, 0.8, -4.25, 0, "ขาไมค์ Handheld หน้าเวทีขวา"),
    // Wireless receivers live side-stage on their own road case, next to the stagebox (short XLR runs).
    hhrx1: at(7.1, 0.85, -4.05, -Math.PI / 2, "ข้างเวทีขวา: RX Handheld 1"), hhrx2: at(7.1, 0.85, -3.6, -Math.PI / 2, "ข้างเวทีขวา: RX Handheld 2"),
    lavrx1: at(7.1, 0.85, -3.15, -Math.PI / 2, "ข้างเวทีขวา: RX Lav 1"), lavrx2: at(7.1, 0.85, -2.7, -Math.PI / 2, "ข้างเวทีขวา: RX Lav 2"),
    hh1: at(4.4, 1.6, -4.7, 0, "หน้าเวทีขวา: Handheld 1"), hh2: at(5.1, 1.6, -4.7, 0, "หน้าเวทีขวา: Handheld 2"),
    tx2: at(0.2, 0.8, -4.5, 0, "จุดวิทยากรบนเวที"), lav2: at(0.6, 0.8, -4.5, 0),
    slides: at(-4.4, 0.76, -3.35, Math.PI, "โต๊ะนำเสนอ — หน้าจอหันเข้าผู้นำเสนอ"),
    presenterChair: at(-4.4, 0, -3.95, Math.PI, "เก้าอี้ผู้นำเสนอ"),
    tx1: at(-1.2, 0.8, -4.5, 0, "จุดพิธีกรบนเวที"), lav1: at(-7.95, 0.85, -4.25, 0),
    cam1: { ...cam(0, 3.95, [0, -5.5], "กล้อง 1 หลังกลาง (Wide)"), p: [0, 0.25, 3.95] },
    cam2: cam(-8.2, 0.9, [-1, -4.6], "กล้อง 2 ทางเดินซ้าย"),
    cam3: cam(8.2, 0.9, [1, -4.6], "กล้อง 3 ทางเดินขวา"),
    cam4: cam(-8.4, -2.9, [0, -4.8], "PTZ ใกล้เวทีซ้าย"),
  },
  furniture: [
    mFoh, mAudio, mCableRack, mSideCase, furn("m-case-foh", "roadCase", 6.4, 7.75, 1.2, 0.85, 0.7, "กล่องขนอุปกรณ์"),
    furn("m-rx-case", "roadCase", 7.1, -3.4, 0.6, 0.85, 1.9, "กล่องตัวรับไมค์ไร้สายข้างเวที"),
    furn("m-stage", "stage", 0, -5.3, 14.0, 0.8, 2.6), furn("m-podium", "podium", -2.2, -4.85, 0.7, 1.9, 0.55),
    furn("m-display-case", "roadCase", 8.3, -3.1, 1.0, 0.55, 1.6), furn("m-presenter", "presenterTable", -4.4, -3.35, 1.3, 0.76, 0.6), furn("m-cam-riser", "riser", 0, 3.95, 1.4, 0.25, 1.2),
    ...M_AUDIENCE,
  ],
  obstacles: [],
  zones: ["เวที: Podium, จุดพิธีกร, จอ LED ด้านหลัง", "ข้างเวทีขวา: Stagebox + LED processor", "หลังห้องซ้าย: เตรียมและคืนไมค์ / อุปกรณ์", "ผู้ชม 126 ที่: สามบล็อก / สองทางเดิน / ทางเดินรอบนอก", "FOH หลังกลาง: Production + Audio desk", "หลัง FOH: Cable rack + road case"],
};

/* ════════ L · Outdoor event ════════
 *  Stage far at the front · audience in the middle · control tent rear-right · service entrance rear-left (road cases, cable reels). */
const lTent = furn("l-tent-desk", "tentDesk", 4.15, 8.05, 5.2, 0.76, 1.3, "เต็นท์ควบคุม");
const lFiberCase = furn("l-fiber-case", "fieldCase", 1.55, 8.15, 0.8, 0.85, 0.6, "ตู้รวมและจัดเส้นทางสัญญาณภาพ");
const lGearCase = furn("l-gear-cases", "fieldCase", -7.9, 8.7, 5.8, 0.85, 0.85, "กล่องอุปกรณ์ภาคสนาม");
const lCableCase = furn("l-cable-case", "fieldCase", -9.2, 6.7, 2.6, 0.85, 0.7, "กล่องสายภาคสนาม");
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
    lap: at(0.65, 1.76, -8.5, Math.PI, "โต๊ะนำเสนอมีหลังคา — โน้ตบุ๊กหันเข้าผู้บรรยาย"),
    convHS: at(1.25, 1.76, -8.5, 0, "โต๊ะนำเสนอ — ตัวแปลง HDMI เป็น SDI"),
    mic: at(-0.3, 2.1, -7.7, 0, "ไมค์พิธีกรบนขาตั้ง"),
    vh: at(1.55, 0.85, 8.15, 0, "ตู้รวมสัญญาณภาพในที่กำบัง"),
    convSH: at(4.6, 0.76, 7.95, 0, "ตัวแปลง SDI เป็น HDMI บนโต๊ะควบคุม"),
    pgm: at(5.2, 0.76, 7.75, 0, "จอตรวจภาพออกอากาศ"),
    ssd: at(3.75, 0.76, 8.1, 0, "จุดบันทึกข้อมูล"),
    net: at(5.85, 0.76, 7.95, 0, "เกตเวย์หลักบนโต๊ะควบคุม"),
    net2: at(5.85, 0.76, 8.35, 0, "เกตเวย์สำรองบนโต๊ะควบคุม"),
    wan: at(6.75, 0, 8.6, -Math.PI / 2, "จุดรับสตรีมทดสอบ"),
    operator1: at(3.0, 0, 9.3, 0, "ที่นั่งควบคุมเสียง"),
    operator2: at(5.2, 0, 9.3, 0, "ที่นั่งควบคุมภาพ"),
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
    tx1: at(0.8, 1.0, -7.5, 0, "จุดพิธีกรบนเวที"), lav1: at(1.2, 1.0, -7.5, 0),
    cam1: cam(6.8, -5.2, [0, -8.0], "กล้อง A ฝั่งตะวันออก"),
    cam2: cam(-7.6, -5.0, [0, -8.0], "กล้อง B ฝั่งตะวันตก"),
    cam3: { ...cam(0, 4.3, [0, -8.0], "กล้อง C หลังกลาง (ภาพรวม)"), p: [0, 0.3, 4.3] },
  },
  furniture: [
    lTent, lFiberCase, lGearCase, lCableCase,
    furn("l-presenter", "presenterTable", 0.85, -8.5, 1.6, 1.76, 0.7, "โต๊ะนำเสนอและตัวแปลงภาพ"),
    furn("l-power", "powerCase", 5.4, 10.4, 0.9, 0.7, 0.6, "ไฟสำรองและไฟเลี้ยง"),
    furn("l-reel-a", "cableReel", -10.9, 5.4, 0.9, 0.9, 0.5), furn("l-reel-b", "cableReel", -9.7, 5.4, 0.9, 0.9, 0.5),
    furn("l-stage", "stage", 0, -8.6, 12.0, 1.0, 3.2), furn("l-cam-riser", "riser", 0, 4.3, 1.4, 0.3, 1.2),
    ...L_CHAIRS,
  ],
  obstacles: [
    ...[[0.8, 6.6], [7.2, 6.6], [0.8, 10.9], [7.2, 10.9], [-10.5, 7.4], [-5.1, 7.4], [-10.5, 10.2], [-5.1, 10.2]].map(([x, z]) => ({ center: [x, 1.3, z] as Point3, half: [0.06, 1.3, 0.06] as Point3 })),
    ...[[6.8, -5.2], [-7.6, -5.0], [0, 4.3]].map(([x, z]) => ({ center: [x, 0.4, z] as Point3, half: [0.32, 0.4, 0.32] as Point3 })),
    ...[[3, 9.3], [5.2, 9.3]].map(([x, z]) => ({ center: [x, 0.45, z] as Point3, half: [0.22, 0.45, 0.22] as Point3 })),
  ],
  zones: ["เวทีและจุดพิธีกร (ไกลด้านหน้า)", "พื้นที่ผู้ชม + Ambient mic", "จุดกล้อง A / B / C กระจายห่างกัน", "เต็นท์ควบคุม: Switcher → Encoder → Router", "ทางเข้าบริการ: road case + ม้วนสาย"],
};

/* ════════ XL · Stadium live broadcast — three zones ════════
 *  ZONE C (west): broadcast control room — multiview wall on the front wall, switcher / replay / graphics desk rows, audio desk, rack wall.
 *  ZONE B (centre-east): commentary desk.  ZONE A (south / +Z): pitch-side camera positions + crowd / field mics. */
const xlSwitch = furn("xl-switch", "productionDesk", -7.0, -5.0, 4.4, 0.76, 0.9, "โต๊ะผู้กำกับและสลับภาพ");
const xlReplay = furn("xl-replay", "productionDesk", -7.0, -2.9, 4.4, 0.76, 0.9, "โต๊ะควบคุมคลิปและบันทึก");
const xlGraphics = furn("xl-graphics", "productionDesk", -7.0, -0.8, 4.4, 0.76, 0.9, "โต๊ะกราฟิกคะแนน");
const xlAudio = furn("xl-audio", "audioDesk", -2.6, -4.0, 1.8, 0.76, 1.0, "โต๊ะควบคุมเสียง");
// Two-level technical cable rack: the full broadcast graph needs ~50 typed leads in organised rows.
const xlCases = furn("xl-cases", "cableRack", 2.6, 3.4, 4.2, 0.9, 1.0, "ชั้นสายเทคนิค · ไฟเบอร์ / SDI / XLR / เครือข่าย");
const xlCableRack = furn("xl-cable-rack", "cableRack", -2.3, 0.8, 1.6, 1.0, 0.5, "ชั้นอุปกรณ์เสริม");
const xlCommentary = furn("xl-commentary", "commentaryDesk", 6.2, -1.6, 3.0, 0.76, 0.8, "โต๊ะผู้บรรยาย");
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
    mix: at(-2.6, 0.76, -4.15, 0, "จุดเสียง: เครื่องผสมเสียงดิจิทัล"),
    rx: at(-2.05, 0.76, -3.75, 0, "จุดเสียง: ตัวรับไมค์ไร้สาย"),
    monitor: at(-7.0, 1.0, -6.75, 0, "Multiview Wall (ผนังหน้า)"),
    ...Object.fromEntries(RACKS.map(([id, z, label]) => [id, at(-11.9, 0, z, Math.PI / 2, `ตู้: ${label}`)])),
    display: at(13.2, 0, 11.0, -Math.PI / 2, "Stadium display processor"),
    mic0: at(5.5, 0.76, -1.75, 0, "Commentary desk: Mic 1"), mic1: at(6.9, 0.76, -1.75, 0, "Commentary desk: Mic 2"),
    mic2: at(-11.8, 0, 11.6, Math.PI / 2, "ไมค์บรรยากาศผู้ชมซ้าย"), mic3: at(13.0, 0, 9.0, -Math.PI / 2, "ไมค์บรรยากาศผู้ชมขวา"),
    mic4: at(3.0, 0, 13.0, Math.PI, "Field mic ข้างสนาม"),
    tx1: at(-2.4, 0, 12.9, Math.PI, "จุดพิธีกรข้างสนาม"), lav1: at(-2.0, 0, 12.9, Math.PI),
    cam1: { p: [0, 0.3, 8.2], yaw: Math.PI, label: "กล้อง 1 หลักภาพกว้าง (แท่นสูง)" },
    cam2: { p: [-9.5, 0, 12.6], yaw: yawToward([-9.5, 0, 12.6], [0, 0, 40]), label: "กล้อง 2 ข้างสนามซ้าย" },
    cam3: { p: [9.5, 0, 12.6], yaw: yawToward([9.5, 0, 12.6], [0, 0, 40]), label: "กล้อง 3 ข้างสนามขวา" },
    cam4: { p: [13.0, 0, 5.4], yaw: yawToward([13, 0, 5.4], [0, 0, 35]), label: "กล้อง 4 ท้ายสนาม" },
    cam5: { p: [-5.0, 0, 11.8], yaw: yawToward([-5, 0, 11.8], [5, 0, 40]), label: "กล้อง 5 เลนส์ระยะไกล" },
    cam6: { p: [5.0, 0, 12.7], yaw: yawToward([5, 0, 12.7], [-5, 0, 35]), label: "กล้อง 6 เคลื่อนที่ในสนาม" },
  },
  furniture: [
    xlSwitch, xlReplay, xlGraphics, xlAudio, xlCases, xlCableRack, xlCommentary,
    furn("xl-monitor-console", "operatorDesk", -7, -6.75, 1.2, 1, 0.45, "แผงรับสัญญาณจอรวมภาพ"),
    ...RACKS.map(([id, z]) => furn(`xl-rack-${id}`, "rackCabinet", -11.9, z, 0.6, 2.0, 0.6)),
    furn("xl-wall", "controlWall", -7.0, -7.15, 7.0, 0.1, 0.3),
    furn("xl-cam1-platform", "cameraPlatform", 0, 8.2, 1.6, 0.3, 1.6),
  ],
  // Control-room shell: north wall is the venue edge; east wall with a door gap at z −1.0 … 0.6; south wall from x −13 … −2.6.
  obstacles: [
    ...[[0, 8.2], [-9.5, 12.6], [13, 5.4], [9.5, 12.6]].map(([x, z]) => ({ center: [x, 0.45, z] as Point3, half: [0.34, 0.45, 0.34] as Point3 })),
    { center: [-1.0, 1.4, -4.35], half: [0.1, 1.4, 3.15] },
    { center: [-1.0, 1.4, 1.35], half: [0.1, 1.4, 0.75] },
    { center: [-7.0, 1.4, 2.2], half: [6.0, 1.4, 0.1] },
  ],
  zones: ["ZONE C ห้องควบคุม: Multiview Wall, แถวโต๊ะ Switcher / Replay / Graphics, Audio console, ตู้ Rack", "ZONE B: โต๊ะผู้บรรยาย", "ZONE A ข้างสนาม: กล้อง 6 ตำแหน่ง, Crowd / Field mic, จุดพิธีกร", "ทางเดินกลาง: Technical road cases (อุปกรณ์), Cable rack ในห้องควบคุม"],
};

/* ════════ S (Mission Hall only) · enlarged mission studio — separate from free-practice Studio Room 01 ════════
 *  Procedural TV-studio shell (components/game/environment/venue/studio.tsx): green cyclorama at −Z, three tripod marks,
 *  presenter table, production desk with service space on every side, cable table (left), equipment table (right), TV on a stand. */
/** Shared authored set locations: scene dressing and camera targets read the same coordinates. */
export const STUDIO_MISSION_SETS = {
  green: [-3.7, 0, -2.3] as Point3,
  news: [4.5, 0, -2.7] as Point3,
  interview: [6.2, 0, 2.0] as Point3,
  jib: [-3.7, 0, 8.2] as Point3,
  softboxes: [[-7.3, -2.0], [-0.1, -2.0], [-6.9, -0.5], [-0.1, -0.5]] as [number, number][],
};
const smProd = furn("sm-prod", "productionDesk", -2.7, 4.7, 5.4, 0.76, 1.5, "โต๊ะผลิตรายการ");
const smCables = furn("sm-cables", "cableRack", -6.7, 6.8, 2.8, 0.9, 0.7, "ชั้นสาย HDMI / XLR / USB");
const smEquip = furn("sm-equip", "operatorDesk", 6.2, 6.4, 2.8, 0.76, 1.0, "เตรียมและคืนอุปกรณ์");
const smTvAt: Point3 = [-6.5, 0, 3.9];
const studioMission: VenueLayout = {
  id: "studioMission",
  job: "เตรียมระบบภาพและเสียงของห้องสตูดิโอ",
  bounds: { minX: -8.2, maxX: 8.2, minZ: -4.2, maxZ: 9.1 },
  spawn: [7.4, 0.84, 8.0], spawnYaw: yawToward([7.4, 0, 8.0], [0, 0, 1.5]),
  work: top(smProd),
  equipment: top(smEquip),
  cables: top(smCables),
  places: {
    sw: at(-2.7, 0.76, 4.7, Math.PI, "โต๊ะผลิต: HDS7105 / แผงต่อสายหาผู้ควบคุม"),
    mix: at(-4.45, 0.76, 4.7, 0, "โต๊ะผลิต ซ้าย: Audio Mixer"),
    rx: at(-3.7, 0.76, 4.95, 0, "ข้าง Mixer: Wireless RX"),
    capture: at(-1.65, 0.76, 4.8, 0, "ระหว่าง HDS7105 กับ Notebook: Magewell"),
    pc: at(-0.65, 0.76, 4.7, 0, "โต๊ะผลิต ขวา: HP Notebook"),
    tx1: at(-4.4, 0.76, -2.3, 0, "โต๊ะฉากเขียว: TX 1"), tx2: at(-3.3, 0.76, -2.3, 0, "โต๊ะฉากเขียว: TX 2"),
    lav1: at(-4.7, 0.76, -2.3, 0), lav2: at(-3.0, 0.76, -2.3, 0),
    mic: at(-3.85, 0.76, -2.25, 0, "โต๊ะฉากเขียว: Sennheiser XS 1"),
    monitor: at(smTvAt[0], 0.95, smTvAt[2], yawToward(smTvAt, [-2.7, 0, 5.7]) + Math.PI, "TV Multiview บนขาตั้ง"),
    speaker: at(-5.95, 0, 4.9, 0.4, "Yamaha HS5 ข้างโต๊ะผลิต"),
    micH: at(5.12, 1.05, 2.18, 0, "ขาตั้งไมค์พิธีกร"),
    micG: at(6.65, 1.05, 2.92, 0, "ขาตั้งไมค์แขกรับเชิญ"),
    cam1: cam(3.1, 2.9, [6.2, 2.0], "กล้อง A: ภาพกว้างสองคน"),
    cam2: cam(3.5, 0.3, [6.97, 2.37], "กล้อง B: ภาพใกล้แขกรับเชิญ"),
    cam3: cam(3.6, 4.4, [5.43, 1.63], "กล้อง C: ภาพใกล้พิธีกร"),
  },
  furniture: [smProd, smCables, smEquip, furn("sm-presenter", "presenterTable", -3.7, -2.3, 2.2, 0.76, 0.7, "โต๊ะฉากเขียว"), furn("sm-tv", "tvStand", smTvAt[0], smTvAt[2], 1.2, 0.95, 0.45),
    furn("sm-storage", "avCabinet", 7.75, 5.0, 0.6, 1.25, 1.2, "อุปกรณ์สำรอง"),
    ...[0.4, 1.3, 2.2].map((x, i) => furn(`sm-case-${i}`, "roadCase", x, 8.65, 0.8, i === 1 ? 1.4 : 0.7, 0.6, "กล่องอุปกรณ์สำรอง")),
  ],
  obstacles: [],
  zones: ["หน้าซ้าย: ฉากเขียว / กล้อง 1", "หน้าขวา: ฉากข่าว / กล้อง 2", "กลางขวา: สัมภาษณ์ / กล้อง 3", "หลังซ้าย: โต๊ะผลิตและชั้นสาย", "หลังขวา: ทางเข้าและจุดคืนอุปกรณ์", "ทางเดินข้ามสตูดิโอ: z 1.5 ถึง 2.5"],
};

/**
 * Mission venues are enlarged uniformly around the origin — a player-experience design choice, NOT surveyed dimensions.
 * Uniform scale keeps every camera / device yaw valid. Furniture keeps its real size (rooms get roomier, not stretched);
 * stage platforms and the control wall widen with the room. Free-practice `studio` is never scaled.
 */
export const VENUE_SCALE: Record<LayoutId, number> = { studio: 1, studioMission: 1, classroom: 1.45, auditorium: 1.35, outdoor: 1.35, stadium: 1.3 };
const sc = (p: Point3, k: number): Point3 => [+(p[0] * k).toFixed(3), p[1], +(p[2] * k).toFixed(3)];
/** Scale a mission-only spot authored in the venue's base coordinates. */
export const scaleSpot = (id: LayoutId, s: Spot): Spot => ({ ...s, p: sc(s.p, VENUE_SCALE[id]) });
function expand(l: VenueLayout, k: number): VenueLayout {
  const surf = (s: Surface): Surface => ({ ...s, center: sc(s.center, k) });
  return {
    ...l,
    bounds: { minX: l.bounds.minX * k, maxX: l.bounds.maxX * k, minZ: l.bounds.minZ * k, maxZ: l.bounds.maxZ * k },
    spawn: sc(l.spawn, k),
    work: surf(l.work), equipment: surf(l.equipment), cables: surf(l.cables),
    places: Object.fromEntries(Object.entries(l.places).map(([id, s]) => [id, { ...s, p: sc(s.p, k) }])),
    furniture: l.furniture.map((f) => ({ ...f, center: sc(f.center, k), size: f.kind === "stage" || f.kind === "controlWall" ? [+(f.size[0] * k).toFixed(3), f.size[1], f.size[2]] as Point3 : f.size })),
    // Room walls (long thin obstacles) stretch with the room; posts stay posts.
    obstacles: l.obstacles.map((o) => ({ center: sc(o.center, k), half: [o.half[0] > 0.5 ? +(o.half[0] * k).toFixed(3) : o.half[0], o.half[1], o.half[2] > 0.5 ? +(o.half[2] * k).toFixed(3) : o.half[2]] as Point3 })),
  };
}

export const LAYOUTS: Record<LayoutId, VenueLayout> = {
  studio, studioMission,
  classroom: expand(classroom, VENUE_SCALE.classroom),
  auditorium: expand(auditorium, VENUE_SCALE.auditorium),
  outdoor: expand(outdoor, VENUE_SCALE.outdoor),
  stadium: expand(stadium, VENUE_SCALE.stadium),
};

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
    ...layout.furniture.filter((f) => f.kind === "studentDesk").flatMap((f) => {
      const seats = Math.max(1, Math.round(f.size[0] / 0.9));
      return Array.from({ length: seats }, (_, i) => ({
        center: [f.center[0] - f.size[0] / 2 + f.size[0] / seats * (i + 0.5), 0.47, f.center[2] + f.size[2] / 2 + 0.32] as Point3,
        half: [0.22, 0.47, 0.23] as Point3,
      }));
    }),
    ...layout.obstacles,
  ];
}
