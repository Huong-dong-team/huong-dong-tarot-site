#!/usr/bin/env node
/* So Firestore đang chạy với seed/cards.json sắp seed. CHỈ ĐỌC.
 *
 *   node scripts/diff-firestore.mjs
 *
 * Vì sao cần: scripts/seed.js ghi bằng { merge: true }. Trường nào có trong seed
 * sẽ ĐÈ lên Firestore, kể cả khi ai đó đã sửa trường đó trong /admin/. Trường
 * không có trong seed thì giữ nguyên. Script này liệt kê trước những gì sẽ mất.
 *
 * Không có lệnh ghi nào trong file này. Chỉ .get().
 */

import { readFileSync } from "node:fs";
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const seedCards = JSON.parse(readFileSync("../seed/cards.json", "utf8"));
const seedBySlug = new Map(seedCards.map((c) => [c.slug, c]));

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Thiếu GOOGLE_APPLICATION_CREDENTIALS. Nạp từ ../.env rồi chạy lại.");
  process.exit(1);
}
if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
}
const db = getFirestore();

const snap = await db.collection("cards").get();
const live = new Map(snap.docs.map((d) => [d.id, d.data()]));

const C = { red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m", dim: "\x1b[2m", bold: "\x1b[1m", off: "\x1b[0m" };
/* So không phụ thuộc thứ tự khoá: Firestore trả object với thứ tự khác seed,
   JSON.stringify thẳng sẽ báo 78 lá "khác nhau" trong khi giá trị y hệt. */
const stable = (v) => {
  if (v?.toDate) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]));
  }
  return v;
};
const norm = (v) => JSON.stringify(stable(v));

/* Trường do hệ thống quản, không tính là nội dung biên tập. */
const SKIP = new Set(["createdAt", "updatedAt"]);

const overwrites = [];   // seed sẽ đè lên giá trị khác đang có trên Firestore
const onlyLive = [];     // trường chỉ có trên Firestore, seed không đụng tới
const missingDoc = [];   // lá có trên Firestore nhưng không có trong seed
const newDoc = [];       // lá trong seed chưa có trên Firestore

for (const [slug, doc] of live) {
  const seed = seedBySlug.get(slug);
  if (!seed) { missingDoc.push(slug); continue; }
  for (const [k, v] of Object.entries(doc)) {
    if (SKIP.has(k)) continue;
    if (!(k in seed)) { onlyLive.push({ slug, key: k, value: norm(v) }); continue; }
    if (norm(seed[k]) !== norm(v)) overwrites.push({ slug, key: k, live: norm(v), seed: norm(seed[k]) });
  }
}
for (const slug of seedBySlug.keys()) if (!live.has(slug)) newDoc.push(slug);

console.log(`${C.bold}So Firestore với seed/cards.json${C.off}  ${C.dim}chỉ đọc${C.off}\n`);
console.log(`  lá trên Firestore : ${live.size}`);
console.log(`  lá trong seed     : ${seedBySlug.size}`);
if (missingDoc.length) console.log(`  ${C.yellow}chỉ có trên Firestore: ${missingDoc.join(", ")}${C.off}`);
if (newDoc.length) console.log(`  ${C.yellow}chỉ có trong seed    : ${newDoc.join(", ")}${C.off}`);

const byKey = overwrites.reduce((m, o) => { (m[o.key] ||= []).push(o); return m; }, {});
console.log(`\n${C.bold}Trường seed sẽ ĐÈ lên Firestore${C.off}`);
if (!Object.keys(byKey).length) console.log(`  ${C.green}✓ không có gì bị đè${C.off}`);
for (const [k, rows] of Object.entries(byKey).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${C.yellow}${k}${C.off}  ${rows.length} lá`);
  for (const r of rows.slice(0, 2)) {
    console.log(`    ${C.dim}${r.slug}${C.off}`);
    console.log(`      Firestore: ${r.live.slice(0, 96)}`);
    console.log(`      seed     : ${r.seed.slice(0, 96)}`);
  }
  if (rows.length > 2) console.log(`    ${C.dim}… ${rows.length - 2} lá nữa${C.off}`);
}

const okByKey = onlyLive.reduce((m, o) => { (m[o.key] ||= []).push(o.slug); return m; }, {});
console.log(`\n${C.bold}Trường chỉ có trên Firestore — seed KHÔNG đụng, sẽ giữ nguyên${C.off}`);
if (!Object.keys(okByKey).length) console.log(`  ${C.dim}(không có)${C.off}`);
for (const [k, slugs] of Object.entries(okByKey)) console.log(`  ${k}  ${slugs.length} lá`);

console.log(`\n${C.bold}Tổng${C.off}`);
console.log(`  chỗ sẽ bị đè      : ${overwrites.length}`);
console.log(`  trường được giữ   : ${onlyLive.length}`);
process.exit(0);
