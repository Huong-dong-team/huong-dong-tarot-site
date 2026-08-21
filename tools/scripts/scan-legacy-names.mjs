#!/usr/bin/env node
/* Ghi lại tên 22 lá ĐANG hiển thị trên site, để codemod biết phải tìm chuỗi nào.
 *
 *   node scripts/scan-legacy-names.mjs [origin] --out content/legacy-names.json
 *
 * Đây không phải nguồn sự thật thứ hai: nó là ảnh chụp hiện trạng, dùng làm mẫu
 * tìm kiếm. Nguồn sự thật về tên ĐÚNG vẫn chỉ có content/major-arcana.mjs.
 * Chạy lại sau mỗi lần đổi tên để biết còn sót chỗ nào.
 */

import { writeFileSync } from "node:fs";
import { MAJOR_ARCANA } from "../content/major-arcana.mjs";

const ORIGIN = (process.argv[2]?.startsWith("http") ? process.argv[2] : "https://huongdong.id.vn").replace(/\/$/, "");
const outIdx = process.argv.indexOf("--out");
const out = outIdx > -1 ? process.argv[outIdx + 1] : "content/legacy-names.json";

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Một lá có thể mang nhiều nhãn khác nhau trên các trang khác nhau. Lá IX là
   "Chử Đồng Tử tìm đạo" ở /la-bai/ nhưng chỉ "Chử Đồng Tử" ở trang chủ. Codemod
   tìm theo chuỗi chính xác, nên bỏ sót một biến thể là bỏ sót một chỗ phải sửa.
   Quét thêm các trang tổng hợp để gom đủ biến thể. */
const EXTRA_PAGES = ["/", "/huyen-su/", "/la-bai/"];

const toLines = (html) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]+>/g, "\n")
      .split("\n").map((l) => l.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim())
      .filter(Boolean);

const pageLines = {};
for (const p of EXTRA_PAGES) {
  await sleep(300);
  try {
    const res = await fetch(ORIGIN + p, { headers: { "user-agent": "HuongDong-scan/1.0" } });
    if (res.ok) pageLines[p] = toLines(await res.text());
  } catch { /* trang có thể chưa tồn tại */ }
}

/* Tìm nhãn đứng ngay sau mỏ neo "<La Mã> · <tên RWS>". Số La Mã phải có biên
   giới từ, nếu không "IX" sẽ khớp bên trong "XIX" và gán nhầm tên. */
/* Một nhãn hợp lệ phải trông như tên nhân vật, không phải mã nguồn hay câu copy.
   Bộ lọc này quan trọng hơn vẻ ngoài của nó: nếu để lọt "S17" vào danh sách,
   codemod sẽ đi thay chuỗi "S17" ở mọi file trong repo. */
const RWS_NAMES = new Set(MAJOR_ARCANA.map((c) => c.rwsName.toLowerCase()));

const looksLikeName = (s, target) => {
  if (!s || s.length < 6 || s.length > 60) return false;
  if (/^S\d{2}\b/.test(s)) return false;                 // mã nguồn: S16, S17…
  if (/^(Truyện|Chương|Mục)\s/i.test(s)) return false;    // tên chương LNCQ
  if (s.includes("·")) return false;                      // dòng mỏ neo khác
  if (/[,:;]$/.test(s)) return false;                     // câu copy bị cắt
  if (/^(Lá|Tarot)\s/i.test(s)) return false;
  if (/\.$/.test(s)) return false;                        // câu văn, không phải nhãn
  if (RWS_NAMES.has(s.toLowerCase())) return false;       // tên RWS tiếng Anh
  // Mọi tên Việt trong bộ này đều có dấu. Không dấu nghĩa là tiếng Anh hoặc mã.
  if (!/[^\x00-\x7F]/.test(s)) return false;
  // Chỉ chữ Việt, khoảng trắng và vài dấu nối. Chặn emoji, mũi tên, ký hiệu.
  if (!/^[\p{L}\p{M}0-9 ()/;,'’\-–]+$/u.test(s)) return false;
  if (s === target) return false;
  if (target.includes(s)) return false;                   // "Từ Đạo Hạnh" ⊂ "Từ Đạo Hạnh nhập định"
  return true;
};

function variantsFor(card) {
  const found = new Set();
  const romanRe = new RegExp(`(^|[^A-ZÀ-Ỹ0-9])${card.roman}([^A-ZÀ-Ỹ0-9]|$)`);
  const target = card.vietnameseTitle;

  for (const [page, lines] of Object.entries(pageLines)) {
    lines.forEach((line, i) => {
      if (!romanRe.test(line) || !line.toLowerCase().includes(card.rwsName.toLowerCase())) return;

      // Dạng "Tarot XVII · The Star · Mẫu Liễu Hạnh": tên nằm ngay trên dòng neo.
      const inline = line.split(/\s*·\s*/).pop()?.trim();
      if (inline && looksLikeName(inline, target)) { found.add(JSON.stringify({ page, label: inline })); return; }

      /* Chỉ xét ĐÚNG dòng kế tiếp. Dò xa hơn sẽ đi quá dòng tên và vớ phải
         tagline bên dưới ("HY VỌNG CHỈ ĐƯỜNG"), tạo nhãn giả. */
      const next = lines[i + 1];
      if (!next || next === target) return;      // đã đúng tên → không có nhãn cũ
      if (looksLikeName(next, target)) found.add(JSON.stringify({ page, label: next }));
    });
  }
  return [...found].map((s) => JSON.parse(s));
}

const rows = [];
for (const card of MAJOR_ARCANA) {
  await sleep(300);
  let current = null, error = null;
  try {
    const res = await fetch(`${ORIGIN}/la-bai/${card.slug}/`, { headers: { "user-agent": "HuongDong-scan/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    current = strip((html.match(/<main[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "") || null;
  } catch (e) { error = e.message; }

  const variants = variantsFor(card);
  const aliases = [...new Set(
    [current, ...variants.map((v) => v.label)]
      .filter((x) => x && x !== card.vietnameseTitle),
  )];

  rows.push({
    slug: card.slug,
    roman: card.roman,
    rwsName: card.rwsName,
    currentName: current,
    targetName: card.vietnameseTitle,
    aliases,                       // mọi nhãn cũ đang hiển thị, dùng làm mẫu tìm
    needsRename: aliases.length > 0,
    error,
  });
  const mark = error ? "ERR" : aliases.length === 0 ? " ok" : "  →";
  console.log(`${mark} ${card.roman.padEnd(5)} ${(aliases.join(" | ") || String(current ?? error)).slice(0, 44).padEnd(45)} ${aliases.length ? card.vietnameseTitle : ""}`);
}

const doc = { origin: ORIGIN, scannedAt: new Date().toISOString().slice(0, 10), cards: rows };
writeFileSync(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
const n = rows.filter((r) => r.needsRename).length;
const totalAliases = rows.reduce((a, r) => a + r.aliases.length, 0);
console.log(`\n→ ${out}`);
console.log(`${n}/22 lá cần đổi tên · ${totalAliases} biến thể nhãn cũ · ${rows.filter((r) => r.error).length} lỗi tải`);
const multi = rows.filter((r) => r.aliases.length > 1);
if (multi.length) {
  console.log(`\n${multi.length} lá đang mang nhiều hơn một nhãn cùng lúc:`);
  for (const r of multi) console.log(`  ${r.roman.padEnd(5)} ${r.aliases.join("  |  ")}`);
}
