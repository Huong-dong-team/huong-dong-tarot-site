import { readFile } from "node:fs/promises";
import { PILOT_CARD_SLUGS } from "./lib/editorial-audit.js";

const apply = process.argv.includes("--apply");
const revision = "editorial-pr1-beginner-voice-2026-09-02";
const cardFields = [
  "keywordsReversed",
  "meaningUpright",
  "meaningReversed",
  "story",
  "question",
];
const minorFields = [
  "scene",
  "shortStory",
  "love",
  "career",
  "finance",
  "health",
  "advice",
  "warning",
];
const postFields = [
  "title",
  "excerpt",
  "coverImage",
  "contentHtml",
  "tags",
  "author",
  "seo",
  "status",
  "publishedAt",
];

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const posts = JSON.parse(await readFile(new URL("../seed/posts.json", import.meta.url), "utf8"));
const bySlug = new Map(cards.map((card) => [card.slug, card]));

function pick(source, fields) {
  return Object.fromEntries(fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));
}

const cardPatches = PILOT_CARD_SLUGS.map((slug) => {
  const card = bySlug.get(slug);
  if (!card) throw new Error(`Thiếu lá ${slug} trong seed/cards.json.`);
  const fields = card.arcana === "minor" ? [...cardFields, ...minorFields] : cardFields;
  return { slug, data: { ...pick(card, fields), editorialRevision: revision } };
});
const postPatches = posts.map((post) => ({
  slug: post.slug,
  data: { ...pick(post, postFields), editorialRevision: revision },
}));

if (!apply) {
  console.log(`Xem trước ${revision}; Firestore chưa được ghi.`);
  for (const patch of cardPatches) console.log(`- cards/${patch.slug}: ${Object.keys(patch.data).join(", ")}`);
  for (const patch of postPatches) console.log(`- posts/${patch.slug}: ${Object.keys(patch.data).join(", ")}`);
  console.log("Chỉ dùng --apply sau khi PR đã merge và đã xác nhận đúng Firebase project.");
  process.exit(0);
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const confirmation = process.env.EDITORIAL_PUBLISH_CONFIRM?.trim();
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Thiếu GOOGLE_APPLICATION_CREDENTIALS; chúng tôi không ghi Firestore.");
}
if (!projectId || confirmation !== projectId) {
  throw new Error("EDITORIAL_PUBLISH_CONFIRM phải trùng FIREBASE_PROJECT_ID để xác nhận đúng dự án.");
}

const [{ applicationDefault, getApps, initializeApp }, { Timestamp, getFirestore }] = await Promise.all([
  import("firebase-admin/app"),
  import("firebase-admin/firestore"),
]);
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();
const batch = db.batch();
const updatedAt = Timestamp.now();

for (const patch of cardPatches) {
  batch.set(db.collection("cards").doc(patch.slug), { ...patch.data, updatedAt }, { merge: true });
}
for (const patch of postPatches) {
  const publishedAt = Timestamp.fromDate(new Date(patch.data.publishedAt));
  batch.set(db.collection("posts").doc(patch.slug), { ...patch.data, publishedAt, updatedAt }, { merge: true });
}
await batch.commit();
console.log(`Đã xuất bản ${cardPatches.length} lá và ${postPatches.length} bài vào ${projectId}.`);

