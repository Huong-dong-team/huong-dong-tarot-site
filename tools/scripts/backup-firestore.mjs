#!/usr/bin/env node
/* Sao lưu collection cards trên Firestore ra tệp JSON. CHỈ ĐỌC.
 *
 *   node scripts/backup-firestore.mjs <tệp-đích>
 *
 * Chạy trước mỗi lần seed. seed.js ghi bằng { merge: true } nên không xoá tài
 * liệu, nhưng nó ĐÈ lên từng trường — muốn quay lại trạng thái cũ thì phải có
 * bản chụp này.
 */
import { writeFileSync } from "node:fs";
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const out = process.argv[2];
if (!out) { console.error("Dùng: node scripts/backup-firestore.mjs <tệp-đích>"); process.exit(1); }
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
const db = getFirestore();

const dump = {};
for (const name of ["cards", "posts", "settings"]) {
  const snap = await db.collection(name).get();
  dump[name] = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
  console.log(`   ${name.padEnd(9)} ${snap.size} tài liệu`);
}
dump._meta = { takenAt: new Date().toISOString(), project: process.env.FIREBASE_PROJECT_ID };
writeFileSync(out, JSON.stringify(dump, null, 2), "utf8");
console.log(`\n→ ${out}`);
