#!/usr/bin/env node
/* Cổng chặn phát hành cho cả bộ 78 lá.
 *
 *   node scripts/validate-deck.mjs
 *
 * Chạy offline. Kiểm những thứ chỉ lộ ra khi nhìn cả bộ: đủ 78, slug không đụng
 * nhau giữa hai nhóm, và không có nhân vật chính của Ẩn Chính bị tái sử dụng làm
 * nhân vật Hoàng gia Ẩn Phụ (đây là quy tắc v2.1 tự đặt ra ở phần kiểm tra độ đầy).
 */

import { MAJOR_ARCANA } from "../content/major-arcana.mjs";
import { MINOR_ARCANA, SUIT_ORDER, suitOf } from "../content/minor-arcana.mjs";
import { SOURCES, hasLNCQSource } from "../content/sources.mjs";

const C = { red:"\x1b[31m", yellow:"\x1b[33m", green:"\x1b[32m", dim:"\x1b[2m", bold:"\x1b[1m", off:"\x1b[0m" };
const errors = [], warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const deck = [...MAJOR_ARCANA, ...MINOR_ARCANA];

/* ── 1 · Độ đầy cấu trúc ──────────────────────────────────────────────── */

if (MAJOR_ARCANA.length !== 22) err(`Ẩn Chính phải đủ 22, đang có ${MAJOR_ARCANA.length}`);
if (MINOR_ARCANA.length !== 56) err(`Ẩn Phụ phải đủ 56, đang có ${MINOR_ARCANA.length}`);
if (deck.length !== 78) err(`bộ bài phải đủ 78, đang có ${deck.length}`);

for (const s of SUIT_ORDER) {
  const cards = suitOf(s);
  if (cards.length !== 14) err(`nhà ${s} phải đủ 14 lá, đang có ${cards.length}`);
  const nums = cards.map((c) => c.number);
  const expected = Array.from({ length: 14 }, (_, i) => i + 1);
  if (nums.join(",") !== expected.join(",")) err(`nhà ${s} thiếu hoặc trùng thứ bậc: ${nums.join(",")}`);
}

/* ── 2 · Slug duy nhất trên toàn bộ ───────────────────────────────────── */

const slugs = new Map();
for (const c of deck) {
  if (slugs.has(c.slug)) err(`slug đụng nhau: "${c.slug}" dùng bởi ${slugs.get(c.slug)} và ${c.id}`);
  slugs.set(c.slug, c.id);
}

/* ── 3 · Không tái dùng nhân vật Ẩn Chính làm Hoàng gia Ẩn Phụ ────────── */
/* Quy tắc của chính v2.1: "không dùng nhân vật chính của Ẩn Chính làm nhân vật
   Hoàng gia Ẩn Phụ". Đây là thứ chỉ phát hiện được khi soi cả bộ. */

const royal = MINOR_ARCANA.filter((c) => ["page", "knight", "queen", "king"].includes(c.rank));
const majorSubjects = MAJOR_ARCANA.map((c) => ({
  roman: c.roman,
  names: c.vietnameseTitle.split(/[/;,]| và /).map((s) => s.trim()).filter((s) => s.length >= 4),
}));

for (const rc of royal) {
  for (const ms of majorSubjects) {
    const hit = ms.names.find((n) => rc.subject.includes(n));
    if (hit) err(`${rc.enName} lấy "${hit}" làm nhân vật hoàng gia, trùng nhân vật chính lá ${ms.roman}`);
  }
}

/* ── 4 · Nguồn ────────────────────────────────────────────────────────── */

const known = new Set(SOURCES.map((s) => s.id));
for (const c of deck) {
  const unknown = c.sourceIds.filter((id) => !known.has(id));
  if (unknown.length) err(`${c.id}: mã nguồn không có trong đăng ký: ${unknown.join(", ")}`);
}

const majorLNCQ = MAJOR_ARCANA.filter(hasLNCQSource).length;
if (majorLNCQ !== 21) err(`Ẩn Chính có nguồn LNCQ: ${majorLNCQ}/22, trang chủ đang ghi "21/22"`);

/* ── 5 · Cảnh báo ─────────────────────────────────────────────────────── */

const noImage = deck.filter((c) => c.imageStatus === "MISSING").length;
if (noImage) warn(`${noImage}/78 lá chưa có tranh — đừng để imageStatus suy ra từ việc file ảnh tồn tại`);

const unreviewed = deck.filter((c) => c.culturalReviewStatus !== "approved").length;
if (unreviewed) warn(`${unreviewed}/78 lá chưa duyệt văn hoá — publish thì phải kèm nhãn "đang biên tập"`);

const dupSubject = new Map();
for (const c of deck) {
  const k = (c.subject ?? c.vietnameseTitle).toLowerCase();
  dupSubject.set(k, [...(dupSubject.get(k) ?? []), c.id]);
}
for (const [k, ids] of dupSubject) {
  if (ids.length > 1) warn(`chủ thể "${k}" xuất hiện ở ${ids.length} lá: ${ids.join(", ")}`);
}

/* ── Kết quả ──────────────────────────────────────────────────────────── */

console.log(`${C.bold}Kiểm bộ 78 lá${C.off}\n`);
console.log(`  Ẩn Chính            ${MAJOR_ARCANA.length}/22`);
console.log(`  Ẩn Phụ              ${MINOR_ARCANA.length}/56`);
for (const s of SUIT_ORDER) {
  const cards = suitOf(s);
  console.log(`    ${(cards[0]?.suitVi ?? s).padEnd(10)} ${cards.length}/14`);
}
console.log(`  slug duy nhất       ${slugs.size}/78`);
console.log(`  Ẩn Chính có LNCQ    ${majorLNCQ}/22`);

if (errors.length) {
  console.log(`\n${C.red}LỖI (chặn phát hành)${C.off}`);
  for (const e of errors) console.log(`  ${C.red}✗${C.off} ${e}`);
}
if (warns.length) {
  console.log(`\n${C.yellow}CẢNH BÁO${C.off}`);
  for (const w of warns) console.log(`  ${C.yellow}!${C.off} ${w}`);
}
console.log(`\n${errors.length ? C.red + errors.length + " lỗi" + C.off : C.green + "0 lỗi" + C.off} · ${warns.length} cảnh báo`);
process.exit(errors.length ? 1 : 0);
