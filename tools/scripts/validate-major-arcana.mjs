#!/usr/bin/env node
/* Cổng chặn phát hành cho dữ liệu 22 Ẩn Chính.
 *
 *   node scripts/validate-major-arcana.mjs
 *
 * Chạy được offline, không gọi mạng — cắm thẳng vào CI trước bước build.
 * Thoát khác 0 nếu có bất kỳ lỗi nào; cảnh báo không làm hỏng build.
 */

import { MAJOR_ARCANA, byNumber, ADAPTATION_LABEL, SOURCES, hasLNCQSource } from "../content/major-arcana.mjs";

const C = { red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m", dim: "\x1b[2m", off: "\x1b[0m" };
const errors = [];
const warns = [];
const err = (card, msg) => errors.push(`${card ? card.roman.padEnd(5) + " " : "      "}${msg}`);
const warn = (card, msg) => warns.push(`${card ? card.roman.padEnd(5) + " " : "      "}${msg}`);

/* ── 1 · Trọn bộ và định danh ─────────────────────────────────────────── */

if (MAJOR_ARCANA.length !== 22) err(null, `phải đủ 22 lá, đang có ${MAJOR_ARCANA.length}`);

const SLUGS = ["the-fool","the-magician","the-high-priestess","the-empress","the-emperor",
  "the-hierophant","the-lovers","the-chariot","strength","the-hermit","wheel-of-fortune",
  "justice","the-hanged-man","death","temperance","the-devil","the-tower","the-star",
  "the-moon","the-sun","judgement","the-world"];

for (let n = 0; n <= 21; n++) {
  const c = byNumber[n];
  if (!c) { err(null, `thiếu lá số ${n}`); continue; }
  // Slug quyết định URL đã được index. Đổi tên hiển thị thì được; đổi slug thì mất index.
  if (c.slug !== SLUGS[n]) err(c, `slug "${c.slug}" khác slug đã phát hành "${SLUGS[n]}"`);
}

const seenSlug = new Set(), seenId = new Set();
for (const c of MAJOR_ARCANA) {
  if (seenSlug.has(c.slug)) err(c, `slug trùng: ${c.slug}`);
  if (seenId.has(c.id)) err(c, `id trùng: ${c.id}`);
  seenSlug.add(c.slug); seenId.add(c.id);
}

/* ── 2 · Trường bắt buộc ──────────────────────────────────────────────── */

const REQUIRED = ["vietnameseTitle","subtitle","keywords","uprightMeaning","reversedMeaning",
  "sourceStory","tarotBridge","mainScene","decisiveMoment","visualCreative","doNotDraw",
  "adaptationLevel","imageStatus","contentStatus","culturalReviewStatus"];
const REQUIRED_ARRAY = ["fullRetelling","props","palette","sourceIds"];

for (const c of MAJOR_ARCANA) {
  for (const k of REQUIRED) {
    if (typeof c[k] !== "string" || !c[k].trim()) err(c, `thiếu trường bắt buộc: ${k}`);
  }
  for (const k of REQUIRED_ARRAY) {
    if (!Array.isArray(c[k]) || c[k].length === 0) err(c, `trường mảng rỗng: ${k}`);
  }
}

/* ── 3 · Enum ─────────────────────────────────────────────────────────── */

const IMAGE_STATUS = new Set(["KEEP","KEEP_IMAGE_LOCK_NAME","ADJUST","ADJUST_MINOR",
  "REDRAW","EXPERIMENT","NEW_CONCEPT"]);
const CONTENT_STATUS = new Set(["draft","text-ready","published"]);
const REVIEW_STATUS = new Set(["pending","in-review","approved","rejected"]);

for (const c of MAJOR_ARCANA) {
  if (!ADAPTATION_LABEL[c.adaptationLevel]) err(c, `mức chuyển thể không có nhãn hiển thị: ${c.adaptationLevel}`);
  if (!IMAGE_STATUS.has(c.imageStatus)) err(c, `imageStatus ngoài enum: ${c.imageStatus}`);
  if (!CONTENT_STATUS.has(c.contentStatus)) err(c, `contentStatus ngoài enum: ${c.contentStatus}`);
  if (!REVIEW_STATUS.has(c.culturalReviewStatus)) err(c, `culturalReviewStatus ngoài enum: ${c.culturalReviewStatus}`);
}

/* ── 4 · Quy tắc ranh giới nguồn ──────────────────────────────────────── */

for (const c of MAJOR_ARCANA) {
  // Lớp ngoài LNCQ phải nói rõ mình ngoài LNCQ — đây là lời hứa cốt lõi của
  // thương hiệu, không phải tuỳ chọn biên tập.
  const outside = c.adaptationLevel === "VIET_FOLK_EXPANDED_ADAPTATION"
               || c.adaptationLevel === "EDITORIAL_FANTASY_INSPIRED";
  if (outside && !c.editorialNote) {
    err(c, `lớp ngoài LNCQ (${c.adaptationLevel}) nhưng thiếu editorialNote ghi ranh giới`);
  }
  if (!c.sourceIds.every((s) => /^S\d{2}$/.test(s))) {
    err(c, `mã nguồn sai định dạng Sxx: ${c.sourceIds.join(", ")}`);
  }
  // Mã trỏ vào khoảng không thì khối dẫn nguồn trên trang sẽ rỗng.
  const unknown = c.sourceIds.filter((id) => !SOURCES.some((s) => s.id === id));
  if (unknown.length) err(c, `mã nguồn không có trong đăng ký: ${unknown.join(", ")}`);
}

/* Trang chủ đang công bố "21/22 lá có nguồn LNCQ". Đếm theo NGUỒN chứ không
   theo mức chuyển thể — hai thứ khác nhau. XXI có mức EDITORIAL_FANTASY_INSPIRED
   vì bố cục là sáng tác biên tập, nhưng chất liệu vẫn rút từ bốn chương LNCQ,
   nên nó vẫn tính là "có nguồn LNCQ". Chỉ XVII (S20+S22, cả hai đều ngoài) là
   không có. */
const lncq = MAJOR_ARCANA.filter(hasLNCQSource).length;
if (lncq !== 21) {
  err(null, `số lá có nguồn LNCQ là ${lncq}, nhưng trang chủ đang ghi "21/22" — phải sửa một trong hai`);
}

/* ── 5 · Cảnh báo (không chặn build) ──────────────────────────────────── */

for (const c of MAJOR_ARCANA) {
  if (c.culturalReviewStatus !== "approved") {
    warn(c, `chưa duyệt văn hoá — chỉ nên publish kèm nhãn "đang biên tập"`);
  }
  if (c.imageStatus !== "KEEP" && c.imageStatus !== "KEEP_IMAGE_LOCK_NAME") {
    warn(c, `tranh cần ${c.imageStatus} — đừng hiển thị ảnh cũ như ảnh đã duyệt`);
  }
  if (c.fullRetelling.join(" ").length < 400) {
    warn(c, `bản kể lại chỉ ${c.fullRetelling.join(" ").length} ký tự, ngắn bất thường`);
  }
}

/* ── Kết quả ──────────────────────────────────────────────────────────── */

console.log(`Kiểm dữ liệu 22 Ẩn Chính · ${MAJOR_ARCANA.length} lá\n`);

if (errors.length) {
  console.log(`${C.red}LỖI (chặn phát hành)${C.off}`);
  for (const e of errors) console.log(`  ${C.red}✗${C.off} ${e}`);
  console.log();
}

const grouped = warns.reduce((m, w) => { const k = w.slice(6); (m[k] ||= []).push(w.slice(0, 5).trim()); return m; }, {});
if (Object.keys(grouped).length) {
  console.log(`${C.yellow}CẢNH BÁO (không chặn)${C.off}`);
  for (const [msg, cards] of Object.entries(grouped)) {
    console.log(`  ${C.yellow}!${C.off} ${msg}`);
    console.log(`    ${C.dim}${cards.join(" ")}  (${cards.length} lá)${C.off}`);
  }
  console.log();
}

const stat = (label, n, total) => `  ${label.padEnd(26)} ${String(n).padStart(2)}/${total}`;
console.log("Tổng quan");
console.log(stat("đủ trường bắt buộc", MAJOR_ARCANA.filter((c) => REQUIRED.every((k) => c[k])).length, 22));
console.log(stat("có nguồn LNCQ", lncq, 22));
console.log(stat("tranh giữ nguyên được", MAJOR_ARCANA.filter((c) => c.imageStatus.startsWith("KEEP")).length, 22));
console.log(stat("đã duyệt văn hoá", MAJOR_ARCANA.filter((c) => c.culturalReviewStatus === "approved").length, 22));

console.log(`\n${errors.length ? C.red + errors.length + " lỗi" + C.off : C.green + "0 lỗi" + C.off} · ${warns.length} cảnh báo`);
process.exit(errors.length ? 1 : 0);
