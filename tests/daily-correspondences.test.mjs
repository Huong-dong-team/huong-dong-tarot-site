import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DECAN_CARDS,
  MAJOR_CORRESPONDENCES,
  correspondenceCoverage,
  correspondenceForCard,
} from "../public/assets/js/daily-card/correspondences.js";

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));

test("bảng Golden Dawn phủ đúng 78 lá, không lá nào trống", () => {
  const coverage = correspondenceCoverage(cards);
  assert.equal(coverage.total, 78);
  assert.equal(new Set(coverage.mapped.map((item) => item.slug)).size, 78);
});
test("22 Ẩn Chính chia thành 12 cung, 7 hành tinh và 3 nguyên tố", () => {
  const counts = Object.values(MAJOR_CORRESPONDENCES).reduce((output, item) => {
    output[item.kind] = (output[item.kind] || 0) + 1;
    return output;
  }, {});
  assert.deepEqual(counts, { element: 3, planet: 7, sign: 12 });
  assert.equal(Object.keys(MAJOR_CORRESPONDENCES).length, 22);
});

test("36 lá số 2–10 phủ đủ 12 cung và ba decan mỗi cung", () => {
  assert.equal(DECAN_CARDS.length, 36);
  assert.equal(new Set(DECAN_CARDS.map((entry) => entry.slug)).size, 36);
  assert.equal(new Set(DECAN_CARDS.map((entry) => `${entry.signKey}:${entry.decanIndex}`)).size, 36);
  assert.deepEqual(
    DECAN_CARDS.filter((entry) => entry.signKey === "aries").map((entry) => [entry.slug, entry.planetKey]),
    [["two-of-wands", "mars"], ["three-of-wands", "sun"], ["four-of-wands", "venus"]],
  );
});

test("bốn Át và 16 lá hoàng gia giữ đúng tổ hợp nguyên tố", () => {
  const minors = cards.filter((card) => card.arcana === "minor");
  const aces = minors.filter((card) => card.slug.startsWith("ace-"));
  const courts = minors.filter((card) => /^(page|knight|queen|king)-/u.test(card.slug));
  assert.equal(aces.length, 4);
  assert.equal(courts.length, 16);
  assert.ok(aces.every((card) => correspondenceForCard(card).kind === "element"));
  assert.equal(correspondenceForCard(courts.find((card) => card.slug === "page-of-wands")).courtElement, "earth");
  assert.equal(correspondenceForCard(courts.find((card) => card.slug === "knight-of-wands")).courtElement, "air");
  assert.equal(correspondenceForCard(courts.find((card) => card.slug === "queen-of-wands")).courtElement, "water");
  assert.equal(correspondenceForCard(courts.find((card) => card.slug === "king-of-wands")).courtElement, "fire");
});
