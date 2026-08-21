#!/usr/bin/env node
/* Bóc 56 Ẩn Phụ từ DOCX Art Direction v2.1.
 *
 *   node scripts/parse-v21-minor.mjs <file.docx> --out content/minor-arcana.json
 *
 * Tách khỏi parse-v21.mjs vì cấu trúc khối khác hẳn: Ẩn Chính có bản kể lại
 * nhiều đoạn, Ẩn Phụ chỉ có sáu trường ngắn. Gộp một parser sẽ phải rẽ nhánh
 * ở mọi bước và khó đọc hơn hai file riêng.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const src = process.argv[2];
const outIdx = process.argv.indexOf("--out");
const out = outIdx > -1 ? process.argv[outIdx + 1] : null;
if (!src) { console.error("Dùng: node scripts/parse-v21-minor.mjs <file.docx> --out <file.json>"); process.exit(1); }

const xml = execFileSync("unzip", ["-p", src, "word/document.xml"], { maxBuffer: 64e6 }).toString();
const lines = xml
  .replace(/<\/w:p>/g, "\n").replace(/<\/w:tc>/g, "\t").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .split("\n").map((l) => l.trim());

/* Bốn nhà. Tên dài là chuẩn của v2.1 — site đang rút gọn thành "Tre / Sen /
   Dâu tằm / Lúa", đó là bản rút chứ không phải bản chuẩn. Giữ cả hai để lớp
   hiển thị tự chọn, nhưng chỉ một cái là nguồn. */
const SUITS = [
  { key: "wands",     vi: "Cây Tre",  short: "Tre",     en: "Wands",     element: "Lửa"  },
  { key: "cups",      vi: "Hoa Sen",  short: "Sen",     en: "Cups",      element: "Nước" },
  { key: "swords",    vi: "Dâu Tằm",  short: "Dâu tằm", en: "Swords",    element: "Khí"  },
  { key: "pentacles", vi: "Bông Lúa", short: "Lúa",     en: "Pentacles", element: "Đất"  },
];

const RANKS = [
  { key: "ace",    vi: "Át",         en: "Ace",    n: 1  },
  { key: "two",    vi: "Hai",        en: "Two",    n: 2  },
  { key: "three",  vi: "Ba",         en: "Three",  n: 3  },
  { key: "four",   vi: "Bốn",        en: "Four",   n: 4  },
  { key: "five",   vi: "Năm",        en: "Five",   n: 5  },
  { key: "six",    vi: "Sáu",        en: "Six",    n: 6  },
  { key: "seven",  vi: "Bảy",        en: "Seven",  n: 7  },
  { key: "eight",  vi: "Tám",        en: "Eight",  n: 8  },
  { key: "nine",   vi: "Chín",       en: "Nine",   n: 9  },
  { key: "ten",    vi: "Mười",       en: "Ten",    n: 10 },
  { key: "page",   vi: "Tiểu Đồng",  en: "Page",   n: 11 },
  { key: "knight", vi: "Kỵ Sĩ",      en: "Knight", n: 12 },
  { key: "queen",  vi: "Hoàng Hậu",  en: "Queen",  n: 13 },
  { key: "king",   vi: "Quốc Vương", en: "King",   n: 14 },
];

const FIELDS = {
  "LÕI": "uprightMeaning",
  "CẢNH": "scene",
  "TRUYỆN NGẮN": "shortStory",
  "BÓNG NGƯỢC": "reversedMeaning",
  "MOTIF / MÀU": "motifPalette",
  "NGUỒN / MỨC CHUYỂN THỂ": "provenanceRaw",
};
const FIELD_KEYS = Object.keys(FIELDS).sort((a, b) => b.length - a.length);

/* Tiêu đề lá Ẩn Phụ: "Hai Hoa Sen  ·  Two of Cups" */
const headings = [];
lines.forEach((l, i) => {
  const m = l.match(/^(.+?)\s+·\s+((?:Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King)\s+of\s+(?:Wands|Cups|Swords|Pentacles))$/);
  if (m) headings.push({ i, viHead: m[1].trim(), enName: m[2].replace(/\s+/g, " ").trim() });
});

/* Cùng một lá có thể xuất hiện ở mục lục lẫn thân bài — giữ khối dài nhất. */
const byEn = new Map();
headings.forEach((h, k) => {
  const end = k + 1 < headings.length ? headings[k + 1].i : lines.length;
  const prev = byEn.get(h.enName);
  if (!prev || end - h.i > prev.len) byEn.set(h.enName, { ...h, end, len: end - h.i });
});

const cards = [];
for (const suit of SUITS) {
  for (const rank of RANKS) {
    const enName = `${rank.en} of ${suit.en}`;
    const h = byEn.get(enName);
    if (!h) { console.error(`✗ thiếu ${enName}`); continue; }

    const body = lines.slice(h.i + 1, h.end).filter(Boolean);
    const card = {
      id: `${suit.key}-${rank.key}`,
      slug: `${rank.key}-of-${suit.key}`,       // đúng URL site: /la-bai/ace-of-wands/
      suit: suit.key, suitVi: suit.vi, suitShort: suit.short, suitEn: suit.en, element: suit.element,
      rank: rank.key, rankVi: rank.vi, rankEn: rank.en, number: rank.n,
      viName: h.viHead,                          // "Hai Hoa Sen"
      enName,
    };

    const sub = body[0]?.split(/\s+—\s+/);
    if (sub?.length >= 2) { card.subject = sub[0].trim(); card.sceneTitle = sub.slice(1).join(" — ").trim(); }
    else { card.subject = body[0] || null; card.sceneTitle = null; }

    for (const line of body.slice(1)) {
      const key = FIELD_KEYS.find((k) => line.startsWith(k + " ") || line.startsWith(k + "\t"));
      if (key) card[FIELDS[key]] = line.slice(key.length).trim();
    }

    /* "hai chén, sen từ cát, gậy và nón · hồng sen, vàng cát, xanh sông" */
    if (card.motifPalette) {
      const [motifs, palette] = card.motifPalette.split(/\s*·\s*/);
      card.props = (motifs || "").split(/\s*,\s*/).filter(Boolean);
      card.palette = (palette || "").split(/\s*,\s*/).filter(Boolean);
      delete card.motifPalette;
    }
    if (card.provenanceRaw) {
      const [ids, level] = card.provenanceRaw.split(/\s*·\s*/);
      card.sourceIds = (ids || "").split(/\s*,\s*/).filter(Boolean);
      card.adaptationLevel = (level || "").trim();
      delete card.provenanceRaw;
    }
    cards.push(card);
  }
}

const doc = {
  $schema: "minor-arcana/v1",
  source: "Huong-Dong-Tarot-78-Art-Direction-Storytelling.docx · v2.1 · 16/08/2026",
  parsedAt: new Date().toISOString().slice(0, 10),
  cards,
};
if (out) { writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8"); console.log(`→ ${out}`); }

const need = ["subject","sceneTitle","uprightMeaning","reversedMeaning","scene","shortStory","props","palette","sourceIds","adaptationLevel"];
const missTotal = cards.reduce((n, c) => n + need.filter((k) => !c[k] || (Array.isArray(c[k]) && !c[k].length)).length, 0);
console.log(`\nBóc được ${cards.length}/56 lá · ${cards.length * need.length - missTotal}/${cards.length * need.length} trường có dữ liệu`);

for (const suit of SUITS) {
  const sc = cards.filter((c) => c.suit === suit.key);
  const miss = sc.filter((c) => need.some((k) => !c[k] || (Array.isArray(c[k]) && !c[k].length)));
  console.log(`  ${suit.vi.padEnd(9)} ${String(sc.length).padStart(2)}/14 lá${miss.length ? `  ⚠ thiếu ở: ${miss.map((c) => c.rankVi).join(", ")}` : ""}`);
}
process.exit(cards.length === 56 ? 0 : 1);
