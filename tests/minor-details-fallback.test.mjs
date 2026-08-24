import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fillMinorDetails, MINOR_DETAIL_FIELDS } from "../scripts/lib/minor-details-fallback.js";

const seed = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const seedMinor = seed.find((card) => card.slug === "ace-of-wands");
const seedMajor = seed.find((card) => card.arcana === "major");

test("giữ nguyên giá trị Firestore đang có, kể cả khi khác seed", () => {
  const live = [{ slug: "ace-of-wands", arcana: "minor", love: "Bản biên tập trong /admin/", sources: [{ id: "S99", title: "Nguồn riêng" }] }];
  const [card] = fillMinorDetails(live, seed);
  assert.equal(card.love, "Bản biên tập trong /admin/");
  assert.deepEqual(card.sources, [{ id: "S99", title: "Nguồn riêng" }]);
});

test("bù trường thiếu, null, chuỗi rỗng và mảng rỗng từ seed", () => {
  const live = [{ slug: "ace-of-wands", arcana: "minor", scene: null, advice: "   ", sources: [], adaptationLevel: "" }];
  const [card] = fillMinorDetails(live, seed);
  assert.equal(card.scene, seedMinor.scene);
  assert.equal(card.advice, seedMinor.advice);
  assert.equal(card.warning, seedMinor.warning);
  assert.deepEqual(card.sources, seedMinor.sources);
  assert.equal(card.adaptationLevel, seedMinor.adaptationLevel);
  for (const field of MINOR_DETAIL_FIELDS) assert.ok(card[field], field);
});

test("chỉ bù đúng danh sách trường chi tiết, không merge cả lá seed", () => {
  const live = [{ slug: "ace-of-wands", arcana: "minor", meaningUpright: "", nameVi: "Tên đang sửa" }];
  const [card] = fillMinorDetails(live, seed);
  assert.equal(card.meaningUpright, "");
  assert.equal(card.nameVi, "Tên đang sửa");
  assert.equal(card.story, undefined);
});

test("lá không có trong seed vẫn được giữ, không bị xoá", () => {
  const live = [{ slug: "la-moi-chua-co-trong-seed", arcana: "minor", love: "" }, { slug: "ace-of-wands", arcana: "minor" }];
  const cards = fillMinorDetails(live, seed);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].slug, "la-moi-chua-co-trong-seed");
  assert.equal(cards[0].love, "");
});

test("không chạm lá Ẩn Chính", () => {
  const live = [{ slug: seedMajor.slug, arcana: "major", subject: "" }];
  const [card] = fillMinorDetails(live, seed);
  assert.equal(card.subject, "");
});

test("không sửa mảng đầu vào và bản dựng từ seed không đổi", () => {
  const live = [{ slug: "ace-of-wands", arcana: "minor", scene: null }];
  const before = structuredClone(live);
  fillMinorDetails(live, seed);
  assert.deepEqual(live, before);
  assert.deepEqual(fillMinorDetails(structuredClone(seed), seed), seed);
});
