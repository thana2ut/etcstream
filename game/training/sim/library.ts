import type { Category, ConceptId, ControlValue, EvalContext, ObjectivePredicate, PredicateResult, Quiz, TestStage } from "./types";

/** Objective predicate builders shared by all 25 stages. Every check reads the evaluated graph — never cable colour. */
export const o = (id: string, label: string, category: Category, stage: TestStage, concept: ConceptId, check: (c: EvalContext) => PredicateResult, critical = false): ObjectivePredicate =>
  ({ id, label, category, stage, concept, check, critical });

const pass = (): PredicateResult => ({ ok: true });
const fail = (reason: string, fix: string): PredicateResult => ({ ok: false, reason, fix });
const prob = (c: EvalContext, dev: string) => c.view[dev]?.problem;
const why = (c: EvalContext, dev: string, fallback: string, fix: string): PredicateResult => {
  const p = prob(c, dev);
  return p ? fail(`${p.code}: ${p.text}`, p.fix) : fail(fallback, fix);
};

export const placedAll = (devs: string[]) => (c: EvalContext) => {
  const missing = devs.filter((d) => !c.placed(d));
  return missing.length ? fail(`ยังไม่ติดตั้งประจำจุด: ${missing.join(", ")}`, "นำอุปกรณ์จากกล่องไปวางที่จุดติดตั้งตามป้าย") : pass();
};
export const poweredAll = (devs: string[]) => (c: EvalContext) => {
  const off = devs.filter((d) => !c.view[d]?.powered);
  return off.length ? fail(`ไม่มีไฟเลี้ยง: ${off.join(", ")}`, "ตรวจไฟเลี้ยงแต่ละเครื่อง โดยช่างติดตั้งแหล่งจ่ายไว้แล้ว") : pass();
};
/** Exact channel map: this OUTPUT is cabled to this INPUT. */
export const edge = (from: string, to: string) => (c: EvalContext) =>
  c.edges.some((e) => e.from === from && e.to === to) ? pass() : fail(`ยังขาดการต่อสาย ${from} → ${to}`, "ต่อขาออกเข้าขาเข้าตามผังช่องสัญญาณในใบงาน");
export const noEdge = (from: string, to: string, why: string, fix: string) => (c: EvalContext) => c.edges.some((e) => e.from === from && e.to === to) ? fail(why, fix) : pass();
export const cfgIs = (dev: string, key: string, value: ControlValue, fix: string) => (c: EvalContext) =>
  c.cfg(dev, key) === value ? pass() : fail(`${dev} ${key} เป็น "${String(c.cfg(dev, key))}" แต่ต้องเป็น "${String(value)}"`, fix);
export const cfgNot = (dev: string, key: string, value: ControlValue, fix: string) => (c: EvalContext) =>
  c.cfg(dev, key) !== value ? pass() : fail(`${dev} ${key} เป็น "${String(value)}"`, fix);
export const site = (key: string, label: string) => (c: EvalContext) => c.sim.config.site?.[key] === true ? pass() : fail(`ยังไม่ยืนยันรายการก่อนเริ่มงาน: ${label}`, "ตรวจและยืนยันรายการก่อนเริ่มงาน");

export const shows = (dev: string, content: string, label = dev) => (c: EvalContext) => {
  const pic = c.view[dev]?.picture;
  return pic?.includes(content) ? pass() : why(c, dev, `${label} แสดง "${pic ?? c.view[dev]?.status ?? "ไม่มีสัญญาณ"}" แต่ต้องเป็น ${content}`, "ตรวจย้อนจากปลายทางไปต้นทาง แล้วแก้จุดแรกที่ผิดปกติ");
};
export const showsAll = (dev: string, contents: string[]) => (c: EvalContext) => {
  const pic = c.view[dev]?.picture ?? "";
  const missing = contents.filter((x) => !pic.includes(x));
  return missing.length ? why(c, dev, `${dev} ขาดภาพ: ${missing.join(", ")} (แสดง "${pic || "ไม่มีสัญญาณ"}")`, "แต่ละแหล่งต้องใช้สายแยกเข้าช่องของตนเอง") : pass();
};
export const notShows = (dev: string, content: string, reason: string, fix: string) => (c: EvalContext) => (c.view[dev]?.picture ?? "").includes(content) ? fail(reason, fix) : pass();
/** A display mirrors the CURRENT Program of a switcher. */
export const mirrorsProgram = (dev: string, sw: string) => (c: EvalContext) => {
  const pgm = c.view[sw]?.picture;
  const pic = c.view[dev]?.picture;
  if (!pgm || pgm === "BLACK") return fail("ภาพออกอากาศเป็นภาพดำ", "สลับแหล่งภาพที่ทำงานออกอากาศ");
  return pic === pgm ? pass() : why(c, dev, `${dev} แสดง "${pic ?? "ไม่มีสัญญาณ"}" แต่ภาพออกอากาศเป็น ${pgm}`, "ส่งปลายทางนี้จากขาออกที่ตั้งเป็น PROGRAM");
};
export const hears = (dev: string, voices: string[], opts: { clip?: boolean; extras?: string[] } = {}) => (c: EvalContext) => {
  const v = c.view[dev];
  const audio = v?.audio ?? [];
  const missing = voices.filter((x) => !audio.includes(x));
  if (missing.length) return why(c, dev, `${dev} ไม่มีเสียง ${missing.join(" + ")} (ได้ยิน: ${audio.join(" + ") || "เงียบ"})`, "ตรวจเส้นทางเสียง: ไมค์ → ขยายเสียง/เปิดช่อง/ส่งกลุ่ม → ไลน์ขาออก → เปิดขาเข้า");
  const bad = audio.filter((x) => x.startsWith("CAM MIC") || x.startsWith("ROOM SOUND") || x === "LAPTOP SYSTEM SOUNDS" || x === "WIND NOISE" || (opts.extras ?? []).includes(x));
  if (bad.length) return fail(`เสียงที่ไม่ต้องการใน ${dev}: ${bad.join(" + ")} (ซ้อน/สะท้อน/รบกวน)`, "ปิดเสียงฝังจากกล้องหรือโน้ตบุ๊กและไมค์ที่ซ้ำ พร้อมติดกันลม");
  if (opts.clip !== false && v?.clip) return fail(`${dev}: เสียงรวมดังจนแตก`, "ลด GAIN สู่ระดับเหมาะสม และตรวจระดับไลน์หรือไมค์");
  return pass();
};
export const noFeedback = (devs: string[]) => (c: EvalContext) => {
  const bad = devs.filter((d) => c.view[d]?.feedback);
  return bad.length ? fail("มีเสียงหอนในห้อง", "หัน SM58 เข้าผู้พูด จัดลำโพงหน้าไมค์และลดเสียงลำโพงสู่ระดับเหมาะสม") : pass();
};
export const live = (ingest: string, sw?: string, voices: string[] = []) => (c: EvalContext) => {
  const v = c.view[ingest];
  if (!v?.live) return why(c, ingest, `ผู้ชมทางไกลยังไม่รับสตรีม (${v?.status ?? "ออฟไลน์"})`, "ตรวจตัวเข้ารหัส → เครือข่าย → WAN → จุดรับสตรีม");
  if (sw && v.picture !== c.view[sw]?.picture) return fail(`ผู้ชมเห็น ${v.picture} แต่ภาพออกอากาศเป็น ${c.view[sw]?.picture}`, "สตรีมขาออกภาพออกอากาศ แทนจอรวมภาพหรือภาพเตรียม");
  return hears(ingest, voices)(c);
};
/** Recording now, or a file from this device already closed cleanly (evidence). */
export const recording = (dev: string, includes?: string) => (c: EvalContext) => {
  const v = c.view[dev];
  const saved = c.sim.evidence.filter((e) => e.startsWith(`${dev} · `));
  const files = [...(v?.recording ? [v.file ?? ""] : []), ...saved];
  if (!files.length) return why(c, dev, `${dev} ยังไม่บันทึก`, "เชื่อมต่อสื่อ ส่งภาพเข้าเครื่องบันทึก แล้วกดบันทึก");
  return includes && !files.some((f) => f.includes(includes)) ? fail(`ไฟล์ ${dev}: ${files[0]} แต่ต้องมี ${includes}`, "บันทึกแหล่งสัญญาณที่ถูกต้อง") : pass();
};
export const evidence = (text: string, label: string) => (c: EvalContext) => c.sim.evidence.some((e) => e.includes(text)) ? pass() : fail(`ยังไม่มีหลักฐาน: ${label}`, "หยุดบันทึกให้ไฟล์ปิดสมบูรณ์ แล้วตรวจไฟล์");
export const cuesDone = () => (c: EvalContext) => c.sim.cueIndex >= c.stage.cues.length ? pass() : fail(`ลำดับรายการอยู่คิว ${c.sim.cueIndex + 1}/${c.stage.cues.length}`, "สลับภาพออกอากาศตามคิวที่สั่ง");
export const noBlackAfterStart = () => (c: EvalContext) => {
  const h = c.sim.pgmHistory.slice(c.sim.cueStart ?? 0);
  const first = h.findIndex((x) => x !== "BLACK");
  return first >= 0 && h.slice(first).includes("BLACK") ? fail("เกิดภาพดำออกอากาศระหว่างซ้อม", "สลับเฉพาะแหล่งภาพที่ทำงาน") : pass();
};
export const faultsRecovered = () => (c: EvalContext) => {
  const need = c.sim.activeFaults.length + c.sim.recovered.length;
  if (need === 0) return c.stage.surpriseFaults?.length ? fail("ยังไม่เกิดปัญหาไม่คาดคิด ซึ่งจะเริ่มหลังผ่านทดสอบซ้อมงาน", "ผ่านทดสอบซ้อมงานก่อน") : pass();
  if (c.sim.activeFaults.length) return fail(`ปัญหาที่ยังไม่แก้: ${c.sim.activeFaults.length}`, "ตรวจย้อนปลายทางที่มีปัญหาถึงจุดเสียแรก แล้วแก้ต้นเหตุ");
  const undiag = c.sim.recovered.filter((f) => !c.sim.diagnosed.includes(f));
  return undiag.length ? fail("แก้ระบบได้แต่ยังไม่บันทึกการวินิจฉัย", "ตรวจเส้นทางหรือทดสอบขณะยังมีปัญหา เพื่อบันทึกสาเหตุ") : pass();
};
export const quizOk = () => (c: EvalContext) => c.stage.quiz && !c.sim.quizOk ? fail("ยังตอบคำถามทบทวนไม่ถูกต้อง", "ตอบคำถามทบทวนในแท็บตรวจรับงาน") : pass();
export const signedOff = () => (c: EvalContext) => c.sim.signedOff ? pass() : fail("ยังไม่ตรวจรับงาน", "เก็บงานและยืนยันใบงาน");
export const inputCarries = (port: string, content: string) => (c: EvalContext) => {
  const s = c.inp[port];
  return s?.kind === "video" && s.content.includes(content) ? pass() : fail(`${port} มี ${s?.kind === "video" ? s.content : "ไม่มีสัญญาณ"} แต่ต้องเป็น ${content}`, "ตรวจสายและการเลือกเส้นทางเราเตอร์");
};
export const historyHas = (contents: string[]) => (c: EvalContext) => {
  const missing = contents.filter((x) => !c.sim.pgmHistory.some((h) => h.includes(x)));
  return missing.length ? fail(`ยังไม่เคยนำออกอากาศ: ${missing.join(", ")}`, "สลับแต่ละแหล่งตามคิว") : pass();
};
export const noCableProblems = () => (c: EvalContext) => {
  const bad = c.edges.filter((e) => !c.inp[e.to] && c.out[e.from]);
  return bad.length ? fail(`สัญญาณขาดบนสาย ${bad.length} เส้น: ${bad.map((e) => e.to).join(", ")}`, "ใช้สายที่ทดสอบผ่านระยะเดินจริง ตรวจป้ายม้วนสาย") : pass();
};
/** Certification wrapper: same check, but the failure names only the symptom — never the solved patch. */
export const masked = (check: (c: EvalContext) => PredicateResult, symptom: string) => (c: EvalContext) => {
  const r = check(c);
  return r.ok ? r : { ok: false, reason: symptom, fix: "ตรวจแผนต่อสายของตนเองเทียบกับใบงาน" };
};
export const all = (...checks: ((c: EvalContext) => PredicateResult)[]) => (c: EvalContext) => { for (const k of checks) { const r = k(c); if (!r.ok) return r; } return pass(); };

/* ═════════════ concepts: targeted review + mini mastery check ═════════════ */
export const CONCEPTS: Record<ConceptId, { title: string; review: string; check: Quiz }> = {
  direction: { title: "ทิศทางสัญญาณ", review: "สายทุกเส้นต้องต่อจากขาออก OUTPUT ไปขาเข้า INPUT การต่อขาออกชนกันหรือขาเข้าหากันไม่ส่งสัญญาณ", check: { q: "การต่อแบบใดส่งภาพได้?", options: ["โน้ตบุ๊ก HDMI OUT → เครื่องสลับภาพ HDMI IN", "เครื่องสลับภาพ HDMI OUT → โน้ตบุ๊ก HDMI OUT", "เครื่องสลับภาพ HDMI IN → โปรเจกเตอร์ HDMI IN"], answer: 0, why: "สัญญาณเดินทางจากขาออกไปขาเข้าเท่านั้น" } },
  connector: { title: "หัวต่อไม่ใช่ชนิดสัญญาณ", review: "หัวต่อที่เสียบกันได้ไม่ได้ยืนยันว่าจะใช้ได้ HDMI, SDI/BNC, XLR, TRS, USB และ RJ45 มีหน้าที่และชนิดสัญญาณเฉพาะ", check: { q: "สาย BNC เสียบเข้า SDI ได้แล้ว ต้องตรวจอะไรอีก?", options: ["ไม่ต้องตรวจ เพราะเสียบได้แล้ว", "ทิศทางถูกต้อง รูปแบบรองรับ และต้นทางมีไฟพร้อมส่งสัญญาณ", "สายต้องเป็นสีน้ำเงิน"], answer: 1, why: "การเสียบได้เป็นเพียงขั้นแรกของการตรวจระบบ" } },
  "sdi-rate": { title: "รูปแบบภาพและอัตรา SDI", review: "พอร์ตกล้อง 12G ส่ง UHD ได้ แต่เครื่องสลับภาพ 3G-SDI ที่รองรับเฉพาะ HD ต้องรับ HD เช่น 1080p50 จึงต้องตั้งกล้องให้ตรงทั้งระบบ", check: { q: "ตั้งกล้อง 2160p50 ต่อเข้าเครื่องรับ 3G-SDI ที่รองรับเฉพาะ HD จะเป็นอย่างไร?", options: ["ใช้ได้เพราะหัว BNC เสียบกันได้", "ไม่รองรับ จนกว่าจะปรับกล้องเป็น 1080p50", "สายจะแปลงรูปแบบให้เอง"], answer: 1, why: "ต้องดูอัตราที่รองรับ ไม่ใช่ดูเฉพาะรูปหัวต่อ" } },
  "converter-direction": { title: "ทิศทางตัวแปลง", review: "ตัวแปลง HDMI-to-SDI 3G และ SDI-to-HDMI 3G เป็นคนละอุปกรณ์ ต้องมีไฟเลี้ยงและแปลงได้เฉพาะทิศทางที่ระบุ", check: { q: "จะส่ง SDI จากกล้องไปจอ HDMI ภาคสนาม ต้องใช้?", options: ["Micro Converter HDMI to SDI 3G", "Micro Converter SDI to HDMI 3G พร้อมไฟเลี้ยง", "สาย HDMI อย่างเดียว"], answer: 1, why: "ตัวแปลง SDI-to-HDMI รับ SDI IN แล้วส่ง HDMI OUT" } },
  power: { title: "ไฟเลี้ยงในเส้นทางสัญญาณ", review: "ตัวแปลง เครื่องสลับภาพ จอ และลำโพงต้องมีไฟเลี้ยง ในเกมใช้การตรวจไฟที่ติดตั้งไว้แล้วอย่างปลอดภัย", check: { q: "ต่อสายเข้าตัวแปลงที่ยังไม่มีไฟ จะได้?", options: ["มีภาพ", "ไม่มีสัญญาณ", "ภาพครึ่งจอ"], answer: 1, why: "ไม่มีไฟเลี้ยงก็ไม่มีสัญญาณขาออก" } },
  "output-assign": { title: "หน้าที่ขาออก", review: "กำหนดภาพออกอากาศ PGM ภาพเสริม AUX ภาพรวม MULTIVIEW และภาพเตรียม PREVIEW ให้ขาออกจริง จอผู้ชมใช้ภาพออกอากาศ ทีมควบคุมใช้ภาพรวม", check: { q: "โปรเจกเตอร์ผู้ชมควรรับจาก?", options: ["ขาออกที่ตั้งเป็น MULTIVIEW", "ขาออกที่ตั้งเป็น PROGRAM", "ขาออกใดก็ได้"], answer: 1, why: "อย่าส่งจอรวมภาพของทีมเทคนิคให้ผู้ชม" } },
  "mic-line-level": { title: "ระดับไมค์และไลน์", review: "ไมค์ต้องผ่านวงจรขยายก่อน ขาเข้าไลน์ของเครื่องสลับภาพและลำโพงต้องรับจากขาออกไลน์ของเครื่องผสมเสียง", check: { q: "ต่อ SM58 เข้า LINE โดยตรงจะได้ยินอย่างไร?", options: ["พอดี", "เบามาก", "เสียงแตก"], answer: 1, why: "ระดับไมค์ต่ำกว่าระดับไลน์ประมาณ 50 dB" } },
  "consumer-level": { title: "ระดับไลน์อาชีพและทั่วไป", review: "ไลน์สมดุล +4 dBu แรงเกินขาเข้า 3.5 มม. ไม่สมดุล −10 dBV ต้องใช้ตัวลดระดับและตั้งขาเข้าเป็น LINE", check: { q: "ต่อ MG12XU STEREO OUT ไป ATEM Mini 3.5 มม. ต้องใช้?", options: ["สาย XLR-to-3.5 มม. ตรง", "ตัวปรับสมดุลเป็นไม่สมดุลพร้อมลด −12 dB และตั้งขาเข้า LINE", "ไฟแฟนทอม"], answer: 1, why: "จับคู่ระดับและระบบสมดุลให้เหมาะสม" } },
  "speaker-level": { title: "ขาออกลำโพงและหูฟัง", review: "ขาออก SPEAKER จากแอมป์และ PHONES จากเครื่องผสมเสียงไม่ใช่ไลน์ ลำโพงแอ็กทีฟและเครื่องสลับภาพต้องรับ LINE", check: { q: "ควรป้อนลำโพงแอ็กทีฟจาก?", options: ["PHONES ของเครื่องผสมเสียง", "STEREO OUT L/R ของเครื่องผสมเสียง", "speakON ของแอมป์"], answer: 1, why: "ต่อขาออกไลน์เข้าขาเข้าไลน์" } },
  "eth-role": { title: "หน้าที่เครือข่าย Ethernet", review: "พอร์ต RJ45 ไม่ได้แปลว่าส่งสตรีมได้ พอร์ตควบคุมอย่าง Constellation Ethernet และ V-160HD LAN CONTROL ต้องมีตัวเข้ารหัสแยก", check: { q: "ต่อ Constellation Ethernet เข้าเราเตอร์อย่างเดียวจะได้?", options: ["สตรีมสด", "ข้อมูลควบคุมเท่านั้น ไม่มีสตรีม", "NDI"], answer: 1, why: "ต้องใช้ Streaming Encoder HD หรือเครื่อง OBS ที่ระบบรองรับ" } },
  "usb-role": { title: "หน้าที่พอร์ต USB", review: "USB-C อาจใช้จ่ายไฟอย่างเดียว ส่งภาพเว็บแคม หรือเชื่อมดิสก์ ขึ้นกับอุปกรณ์และใช้ได้ทีละหน้าที่", check: { q: "ต่อ ATEM Mini Pro USB-C เข้า OBS และ SSD พร้อมกันได้หรือไม่?", options: ["ได้เมื่อใช้สายแยก", "ไม่ได้ ต้องเลือกเว็บแคมหรือบันทึกดิสก์", "ได้และเพิ่มอัตราภาพเป็นสองเท่า"], answer: 1, why: "หนึ่งพอร์ตใช้หนึ่งหน้าที่" } },
  "router-crosspoint": { title: "การเลือกเส้นทางเราเตอร์", review: "ขาออก Videohub รับจากขาเข้าที่เลือกไว้ ต่อ BNC ถูกแต่เลือกเส้นทางผิดก็ได้ภาพผิด และเราเตอร์ไม่แปลงรูปแบบภาพ", check: { q: "OUT 2 ต่อเข้าเครื่องสลับภาพ แต่ตั้ง OUT 2 ← IN 1 จะเห็น?", options: ["IN 2", "IN 1", "ไม่มีภาพ"], answer: 1, why: "ภาพขึ้นอยู่กับการเลือกเส้นทาง" } },
  "embedded-audio": { title: "เสียงฝังในภาพ", review: "ผู้ชมทางไกลได้ยินเฉพาะเสียงที่ฝังไปกับภาพออกอากาศที่เข้ารหัส เสียงในหูฟังห้องบรรยายอาจต่างจากสตรีม", check: { q: "ได้ยินผู้บรรยายในหูฟังแต่ผู้ชมไม่ได้ยิน ควรตรวจ?", options: ["ความดังหูฟัง", "ขาออกไลน์เครื่องผสมเสียง → เปิดขาเข้าเครื่องสลับภาพ → SDI ออกอากาศเข้าตัวเข้ารหัส", "ลำโพงในห้อง"], answer: 1, why: "ตรวจตามเส้นทางเสียงที่ฝังไปกับภาพ" } },
  storage: { title: "สื่อบันทึก", review: "ต้องเชื่อมต่อสื่อที่รองรับ มีพื้นที่ว่าง และสั่งบันทึกอย่างชัดเจน สื่อขัดข้องไม่ทำให้สตรีมหยุด", check: { q: "ดิสก์เต็มระหว่างรายการจะเกิดอะไร?", options: ["สตรีมหยุด", "การบันทึกหยุด แต่สตรีมและภาพออกอากาศยังทำงาน", "ภาพออกอากาศดำ"], answer: 1, why: "เส้นทางการบันทึกและการถ่ายทอดแยกจากกัน" } },
  wan: { title: "อินเทอร์เน็ตและอัปโหลด", review: "สตรีมต้องมีทางออก WAN และอัปโหลดคงที่ หาก WAN ขาด ผู้ชมทางไกลจะหยุดรับ แต่ภาพและการบันทึกในเครื่องยังทำงาน", check: { q: "ถอดสาย WAN อะไรจะหยุด?", options: ["โปรเจกเตอร์", "ผู้ชมทางไกลเท่านั้น", "เครื่องบันทึก"], answer: 1, why: "แต่ละปลายทางใช้เส้นทางแยกกัน" } },
  "stream-key": { title: "รหัสสตรีมและตัวเข้ารหัส", review: "ตัวเข้ารหัสต้องมีรหัสส่วนตัวที่ปกปิดไว้และเปิดถ่ายทอด ห้ามเผยแพร่ข้อมูลรับรองจริง", check: { q: "จุดรับสตรีมปฏิเสธการเชื่อมต่อ ควรตรวจอะไรก่อน?", options: ["มีรหัสสตรีมแล้วหรือไม่", "รูปแบบภาพกล้อง", "ระดับขยายไมค์"], answer: 0, why: "ต้องยืนยันการเข้าถึงก่อนส่งภาพ" } },
  feedback: { title: "เสียงหอน", review: "หันไมค์รับเสียงจากผู้พูด จัดลำโพงให้อยู่นอกทิศรับเสียงของไมค์ แล้วค่อยเพิ่มระดับ", check: { q: "เมื่อเริ่มมีเสียงหอน ควรแก้อะไรก่อน?", options: ["เพิ่มระดับลำโพง", "ปรับทิศไมค์หรือย้ายลำโพง แล้วลดระดับเสียง", "เพิ่มไฟแฟนทอม"], answer: 1, why: "แก้ตำแหน่งก่อนเพิ่มหรือลดอุปกรณ์" } },
  clipping: { title: "โครงสร้างระดับเสียง", review: "ปรับ GAIN ให้ยอดเสียงพูดต่ำกว่าจุดแตกพอสมควร หากไม่ขยายไมค์ แม้เปิดระดับรวมก็อาจไม่ได้ยิน", check: { q: "ไฟ PEAK ช่อง CH1 เป็นสีแดง ควรทำอย่างไร?", options: ["เพิ่มเฟดเดอร์", "ลด GAIN", "ปิดเสียง CH2"], answer: 1, why: "เสียงแตกเกิดที่วงจรขยายไมค์" } },
  mute: { title: "การเปิดช่องและปิดเสียง", review: "ช่องที่ปิดเสียง เฟดเดอร์ที่ลดสุด หรือขาเข้าเครื่องสลับภาพที่ยังไม่เปิด ล้วนตัดเส้นทางเสียงได้", check: { q: "มาตรวัดช่องไมค์ขึ้นแต่ ST ไม่ขึ้น ควรตรวจ?", options: ["เปิดช่อง ส่งเข้า ST และเฟดเดอร์รวม", "รูปแบบภาพกล้อง", "WAN"], answer: 0, why: "ตรวจการกำหนดเส้นทางในเครื่องผสมเสียง" } },
  "afv-doubling": { title: "เสียงซ้อนและเสียงตามภาพ", review: "หากไมค์กล้องและไมค์ผู้บรรยายเข้าออกอากาศพร้อมกัน เสียงจะซ้อน ต้องปิดเสียงฝังจากกล้องหรือเลือก AFV อย่างเหมาะสม", check: { q: "ทำไมต้องปิดเสียงฝังจากกล้องในงานนี้?", options: ["ประหยัดไฟ", "ไม่ให้เสียงผู้พูดเข้าซ้ำสองทาง", "เปิดไฟแสดงกล้องออกอากาศ"], answer: 1, why: "ใช้เส้นทางเสียงพูดที่ชัดเจนเพียงทางเดียว" } },
  safety: { title: "ความปลอดภัยเป็นเงื่อนไขเริ่มงาน", review: "มีฟ้าผ่าต้องหยุดงาน ทางเดินต้องมีรางครอบสาย อุปกรณ์ต้องแห้ง และช่างต้องรับรองไฟเลี้ยงก่อนเริ่มส่งสัญญาณ", check: { q: "มีฟ้าผ่าห่าง 8 กม. แต่อุปกรณ์พร้อมแล้ว ควรทำอย่างไร?", options: ["เริ่มงาน", "หยุดรอจนยืนยันว่าปลอดภัย", "เริ่มงานให้เร็วขึ้น"], answer: 1, why: "ความปลอดภัยสำคัญกว่าการเดินรายการ" } },
  "return-feed": { title: "ภาพส่งกลับกล้อง", review: "12G-SDI IN ของกล้องใช้รับภาพออกอากาศกลับเพื่อดูภาพและระบบสื่อสาร ไม่ใช่ขาออกภาพกล้อง", check: { q: "ต่อ Camera RETURN IN → Switcher SDI IN เป็นอย่างไร?", options: ["เป็นแหล่งภาพที่ใช้ได้", "ขาเข้าชนขาเข้า ระบบปฏิเสธ", "ส่งภาพเร็วขึ้น"], answer: 1, why: "ใช้ SDI OUT ของกล้อง" } },
  "group-bus": { title: "กลุ่มเสียง GROUP", review: "แต่ละช่องต้องถูกส่งเข้า GROUP 1-2 ก่อนจึงมีเสียง เสียง ST ไปยังลำโพงอาจทำงานแม้เสียง GROUP สำหรับสตรีมเงียบ", check: { q: "เสียงในห้องปกติแต่สตรีมเงียบ ควรตรวจ?", options: ["ระดับลำโพง", "ส่งช่องเข้า GROUP เปิดเฟดเดอร์ GROUP และตั้งขาเข้าเครื่องสลับภาพเป็น LINE พร้อมเปิดใช้งาน", "โปรเจกเตอร์"], answer: 1, why: "คนละกลุ่มเสียงใช้คนละเส้นทาง" } },
  "one-output": { title: "หนึ่งขาออก หนึ่งหน้าที่", review: "ATEM Mini Pro มี HDMI OUT หนึ่งพอร์ต เลือกส่งภาพออกอากาศหรือจอรวมภาพ หากต้องการพร้อมกันต้องมีอุปกรณ์เพิ่ม", check: { q: "โปรเจกเตอร์แสดงตารางรวมทุกขาเข้า ควรแก้อย่างไร?", options: ["เปลี่ยนสาย", "ตั้ง HDMI OUT เป็น PROGRAM", "เพิ่มไฟแฟนทอม"], answer: 1, why: "แก้การกำหนดหน้าที่ขาออก" } },
  "obs-source": { title: "แหล่งสัญญาณและเสียงตรงภาพใน OBS", review: "เลือกแหล่งรับภาพหนึ่งแหล่งและเสียงรายการหนึ่งแหล่ง ปิดไมค์ที่ซ้ำ ทดสอบตบมือแล้วหน่วงเสียงให้ตรงกับภาพ", check: { q: "OBS มีเสียงสะท้อนทั้งที่เลือกเสียง USB เครื่องผสมเสียงแล้ว ควรทำอย่างไร?", options: ["ปิดไมค์คอมพิวเตอร์ที่เปิดซ้ำ", "เพิ่มเสียงเครื่องผสมเสียง", "เปลี่ยนรูปแบบกล้อง"], answer: 0, why: "ใช้เส้นทางเสียงรายการเพียงทางเดียว" } },
  graphics: { title: "ความถูกต้องของกราฟิก", review: "กราฟิกเต็มจอเป็นแหล่งภาพหนึ่งชุด ภาพ HDMI ทั่วไปไม่ใช่คู่ภาพและหน้ากากโปร่งใส ผู้ควบคุมต้องแก้คะแนนและตรวจก่อนออกอากาศ", check: { q: "มีประตูเกิดขึ้น ก่อนแสดงคะแนนควรทำอย่างไร?", options: ["แสดงทันที", "แก้เป็น 1–0 และตรวจเทียบเหตุการณ์", "รอข้อมูลจาก API"], answer: 1, why: "เกมนี้ไม่มี API คะแนนสด" } },
  "cable-run": { title: "ระยะเดินสาย", review: "ระยะ SDI ขึ้นอยู่กับชนิดสาย อัตราสัญญาณ และรอยต่อ ใช้สายที่ทดสอบผ่านระยะจริง HDMI ยาวแบบไม่ขยายอาจไม่เสถียร ควรแปลงเป็น SDI ใกล้ต้นทาง", check: { q: "ป้ายม้วนสายยาว 30 ม. แต่ผ่านทดสอบ 3G เพียง 20 ม. จะเดิน 25 ม. ควรทำอย่างไร?", options: ["ใช้ได้เลย", "ใช้สายที่ผ่านทดสอบเกินระยะใช้งาน", "เพิ่มม้วนสายอีกม้วน"], answer: 1, why: "ยึดระยะที่ทดสอบผ่าน ไม่ใช่คาดหวังว่าจะใช้ได้" } },
};
