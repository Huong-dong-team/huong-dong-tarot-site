#!/usr/bin/env node
/* Bóc 22 Ẩn Chính từ DOCX Art Direction v2.1 thành JSON có cấu trúc.
 *
 *   node scripts/parse-v21.mjs <đường-dẫn.docx> [--out content/major-arcana.json]
 *
 * Vì sao parse thay vì gõ tay: v2.1 đã chứa đủ mọi trường mà schema cần
 * (cảnh chính, motif, bảng màu, KHÔNG ĐƯỢC VẼ, trạng thái ảnh, mức chuyển thể).
 * Gõ tay 22 lá × 13 trường là 286 cơ hội sai chính tả tiếng Việt, và mỗi lần
 * v2.2 ra đời lại phải gõ lại. Parse thì chạy lại một lệnh.
 *
 * Không cần thư viện: .docx là file ZIP, đọc bằng unzip có sẵn.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const src = process.argv[2];
const outIdx = process.argv.indexOf("--out");
const out = outIdx > -1 ? process.argv[outIdx + 1] : null;
if (!src) { console.error("Dùng: node scripts/parse-v21.mjs <file.docx> [--out file.json]"); process.exit(1); }

/* Rút text từ document.xml. Mỗi <w:p> là một đoạn → một dòng. */
const xml = execFileSync("unzip", ["-p", src, "word/document.xml"], { maxBuffer: 64e6 }).toString();
const text = xml
  .replace(/<\/w:p>/g, "\n")
  .replace(/<\/w:tc>/g, "\t")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const lines = text.split("\n").map((l) => l.replace(/\s+$/g, ""));

/* Tiêu đề lá:  "XI · Justice / Công Lý"  — chữ số La Mã, dấu chấm giữa, tên Anh / tên Việt */
const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X",
               "XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const headRe = /^(0|[IVX]+)\s*·\s*(.+?)\s*\/\s*(.+?)$/;

/* Nhãn trường trong thân lá. Thứ tự không quan trọng — dò theo tiền tố. */
const FIELDS = {
  "LÕI TAROT": "tarotCore",
  "CỐT TRUYỆN NGUỒN": "sourceStory",
  "CẦU NỐI TAROT": "tarotBridge",
  "CẢNH CHÍNH": "mainScene",
  "KHOẢNH KHẮC QUYẾT ĐỊNH": "decisiveMoment",
  "ĐẠO CỤ / MOTIF": "props",
  "BẢNG MÀU / ÁNH SÁNG": "palette",
  "SÁNG TẠO THỊ GIÁC": "visualCreative",
  "KHÔNG ĐƯỢC VẼ": "doNotDraw",
  "TRẠNG THÁI HÌNH ẢNH": "imageStatus",
  "GHI CHÚ BIÊN TẬP": "editorialNote",
  "NGUỒN / MỨC CHUYỂN THỂ": "provenanceRaw",
};
const FIELD_KEYS = Object.keys(FIELDS).sort((a, b) => b.length - a.length); // dài trước, tránh khớp nhầm tiền tố

/* Slug RWS đang dùng trên site — KHÔNG được sinh từ tên tiếng Anh, vì
   "Strength" → "strength" nhưng "The Fool" → "the-fool" và "Judgement" giữ lối
   viết Anh-Anh. Khóa cứng để không bao giờ vô tình đổi URL. */
const SLUGS = {
  0:"the-fool", 1:"the-magician", 2:"the-high-priestess", 3:"the-empress", 4:"the-emperor",
  5:"the-hierophant", 6:"the-lovers", 7:"the-chariot", 8:"strength", 9:"the-hermit",
  10:"wheel-of-fortune", 11:"justice", 12:"the-hanged-man", 13:"death", 14:"temperance",
  15:"the-devil", 16:"the-tower", 17:"the-star", 18:"the-moon", 19:"the-sun",
  20:"judgement", 21:"the-world",
};

/* Tách các lá: mỗi tiêu đề mở một khối, khối kết thúc ở tiêu đề kế tiếp. */
const marks = [];
lines.forEach((l, i) => {
  const m = l.trim().match(headRe);
  if (m && ROMAN.includes(m[1])) marks.push({ i, roman: m[1], rws: m[2].trim(), vi: m[3].trim() });
});
// Tài liệu có mục lục lặp lại tiêu đề; giữ lần xuất hiện có thân dài nhất.
const byRoman = new Map();
marks.forEach((mk, k) => {
  const end = k + 1 < marks.length ? marks[k + 1].i : lines.length;
  const len = end - mk.i;
  const prev = byRoman.get(mk.roman);
  if (!prev || len > prev.len) byRoman.set(mk.roman, { ...mk, end, len });
});

const cards = [];
for (const roman of ROMAN) {
  const mk = byRoman.get(roman);
  if (!mk) { console.error(`✗ không thấy lá ${roman}`); continue; }
  const body = lines.slice(mk.i + 1, mk.end).map((l) => l.trim()).filter(Boolean);

  const card = { number: ROMAN.indexOf(roman), roman, slug: SLUGS[ROMAN.indexOf(roman)], rwsName: mk.rws, sectionTitle: mk.vi };

  /* Dòng đầu sau tiêu đề: "Tên nhân vật  —  Phụ đề cảnh" */
  const sub = body[0]?.split(/\s+—\s+/);
  if (sub?.length >= 2) {
    card.vietnameseTitle = sub[0].trim();
    card.subtitle = sub.slice(1).join(" — ").trim();
  } else {
    card.vietnameseTitle = body[0] || null;
    card.subtitle = null;
  }

  /* Các trường có nhãn. Nhãn và giá trị cách nhau bằng khoảng trắng kép. */
  const narrative = [];
  let inNarrative = false;
  for (const line of body.slice(1)) {
    if (line.startsWith("BẢN KỂ LẠI TOÀN TRUYỆN")) { inNarrative = true; continue; }
    const key = FIELD_KEYS.find((k) => line.startsWith(k + " ") || line.startsWith(k + "\t"));
    if (key) {
      inNarrative = false;
      card[FIELDS[key]] = line.slice(key.length).trim();
      continue;
    }
    if (inNarrative) narrative.push(line);
  }
  card.fullRetelling = narrative;

  /* "S18 · LNCQ_CORE_ADAPTATION" → tách mã nguồn và mức chuyển thể. */
  if (card.provenanceRaw) {
    const p = card.provenanceRaw.split(/\s*·\s*/);
    card.sourceId = p[0]?.trim() || null;
    card.adaptationLevel = p[1]?.trim() || null;
    delete card.provenanceRaw;
  }

  /* LÕI TAROT gộp cả từ khóa lẫn hai nghĩa — tách để nghĩa RWS đứng riêng,
     đây là phần bất biến không được đụng khi migrate. */
  if (card.tarotCore) {
    const up = card.tarotCore.match(/Xuôi:\s*(.+?)(?:\s*Ngược:|$)/s);
    const down = card.tarotCore.match(/Ngược:\s*(.+)$/s);
    card.keywords = card.tarotCore.split(/\.\s*Xuôi:/)[0].trim();
    card.uprightMeaning = up?.[1]?.trim() || null;
    card.reversedMeaning = down?.[1]?.trim() || null;
    delete card.tarotCore;
  }

  cards.push(card);
}

/* Bảng đăng ký nguồn S01–S22 nằm cuối tài liệu. Quan trọng vì không phải mã S
   nào cũng là chương LNCQ: S20–S22 là nguồn ngoài (UNESCO, bảo tàng, báo chí).
   Thiếu bảng này thì không thể trả lời đúng câu "bao nhiêu lá có nguồn LNCQ". */
const sources = [];
for (const line of lines) {
  const m = line.trim().match(/^(S\d{2})\s{2,}(.+)$/);
  if (m) sources.push({ id: m[1], title: m[2].trim(), isLNCQ: /^Truyện |^Mục lục Lĩnh Nam/.test(m[2].trim()) });
}

const doc = {
  $schema: "major-arcana/v1",
  source: "Huong-Dong-Tarot-78-Art-Direction-Storytelling.docx · v2.1 · 16/08/2026",
  parsedAt: new Date().toISOString().slice(0, 10),
  sources,
  cards,
};

if (out) { writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8"); console.log(`→ ${out}`); }

/* Báo cáo: trường nào thiếu ở lá nào — để biết ngay có phải sửa tay không. */
const need = ["vietnameseTitle","subtitle","keywords","uprightMeaning","reversedMeaning",
              "sourceStory","tarotBridge","mainScene","decisiveMoment","props","palette",
              "visualCreative","doNotDraw","imageStatus","sourceId","adaptationLevel"];
console.log(`\nBóc được ${cards.length}/22 lá · ${sources.length} mục nguồn (${sources.filter((s) => s.isLNCQ).length} chương LNCQ)\n`);
console.log("LÁ     TÊN                              TRUYỆN  THIẾU");
for (const c of cards) {
  const missing = need.filter((k) => !c[k]);
  console.log(
    `${c.roman.padEnd(6)} ${String(c.vietnameseTitle).slice(0, 32).padEnd(33)} ${String(c.fullRetelling.length).padStart(5)}  ${missing.join(", ") || "—"}`,
  );
}
const totalMissing = cards.reduce((n, c) => n + need.filter((k) => !c[k]).length, 0);
console.log(`\n${cards.length * need.length - totalMissing}/${cards.length * need.length} trường có dữ liệu`);
process.exit(cards.length === 22 ? 0 : 1);
