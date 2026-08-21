import { readFile } from "node:fs/promises";
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Thiếu GOOGLE_APPLICATION_CREDENTIALS. Không nạp dữ liệu để tránh ghi nhầm dự án.");
}
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
const db = getFirestore();
const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const posts = JSON.parse(await readFile(new URL("../seed/posts.json", import.meta.url), "utf8"));
const settings = JSON.parse(await readFile(new URL("../seed/settings.json", import.meta.url), "utf8"));
const now = Timestamp.now();

for (let offset = 0; offset < cards.length; offset += 400) {
  const batch = db.batch();
  cards.slice(offset, offset + 400).forEach((card) => {
    batch.set(db.collection("cards").doc(card.slug), { ...card, createdAt: now, updatedAt: now }, { merge: true });
  });
  await batch.commit();
}
for (const post of posts) {
  await db.collection("posts").doc(post.slug).set({ ...post, publishedAt: Timestamp.fromDate(new Date(post.publishedAt)), createdAt: now, updatedAt: now }, { merge: true });
}
await db.collection("settings").doc("site").set(settings, { merge: true });
console.log(`Đã nạp ${cards.length} lá, ${posts.length} bài tin và cấu hình site.`);
