import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
test("đủ 78 lá và slug duy nhất", () => {
  assert.equal(cards.length, 78);
  assert.equal(new Set(cards.map((card) => card.slug)).size, 78);
  assert.equal(new Set(cards.map((card) => card.order)).size, 78);
});
test("đủ 22 Ẩn Chính và 56 Ẩn Phụ", () => {
  assert.equal(cards.filter((card) => card.arcana === "major").length, 22);
  assert.equal(cards.filter((card) => card.arcana === "minor").length, 56);
});
test("mỗi nhà đủ 14 lá", () => {
  for (const suit of ["wands", "swords", "cups", "pentacles"]) assert.equal(cards.filter((card) => card.suit === suit).length, 14, suit);
});
test("trường bắt buộc và ảnh có alt", () => {
  for (const card of cards) {
    assert.match(card.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(card.nameVi && card.nameEn && card.image.url && card.image.alt);
    assert.ok(card.seo.title && card.seo.description && card.seo.ogImage);
  }
});
