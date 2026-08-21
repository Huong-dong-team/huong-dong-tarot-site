import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { zodiacSigns } from "../content/astrology.ts";
import { folkloreEntries } from "../content/folklore.ts";
import { externalHistorySources } from "../content/external-histories.ts";
import { majorArcanaVisuals } from "../content/major-arcana-visuals.ts";
import { medievalLegendSources } from "../content/medieval-legend-sources.ts";
import { rwsCards } from "../content/rws-cards.ts";
import { siteVisuals } from "../content/site-visuals.ts";

test("every editorial visual has an accessible local WebP asset", () => {
  assert.equal(Object.keys(siteVisuals).length, 3);
  for (const visual of Object.values(siteVisuals)) {
    assert.match(visual.src, /^\/images\/[a-z0-9-]+\.webp$/);
    assert.ok(visual.alt.length >= 40);
    assert.ok(visual.width > 0 && visual.height > 0);
    assert.ok(existsSync(new URL(`../public${visual.src}`, import.meta.url)), visual.src);
  }
});

test("RWS reference contains exactly 78 complete and uniquely addressable cards", () => {
  assert.equal(rwsCards.length, 78);
  assert.equal(new Set(rwsCards.map((card) => card.id)).size, 78);
  assert.equal(new Set(rwsCards.map((card) => card.slug)).size, 78);
  for (const card of rwsCards) {
    assert.ok(card.originalName);
    assert.ok(card.number);
    assert.ok(card.uprightMeaning);
    assert.ok(card.reversedMeaning);
    assert.ok(card.explanation);
    assert.ok(card.keywords.length >= 3 && card.keywords.length <= 5);
  }
});

test("Minor Arcana design inventory is exactly four complete 14-card houses", () => {
  const minor = rwsCards.filter((card) => card.category === "Minor Arcana");
  const expectedRanks = new Set(["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"]);

  assert.equal(minor.length, 56);
  assert.equal(new Set(minor.map((card) => card.id)).size, 56);
  assert.deepEqual(new Set(minor.map((card) => card.suit)), new Set(["Wands", "Cups", "Swords", "Pentacles"]));

  for (const suit of ["Wands", "Cups", "Swords", "Pentacles"]) {
    const house = minor.filter((card) => card.suit === suit);
    assert.equal(house.length, 14, suit);
    assert.deepEqual(new Set(house.map((card) => card.number)), expectedRanks, suit);
  }
});

test("the illustration registry contains all Major Arcana 0 through XXI", () => {
  const majorSlugs = rwsCards
    .filter((card) => card.category === "Major Arcana")
    .map((card) => card.slug);

  assert.equal(majorArcanaVisuals.length, 22);
  assert.deepEqual(majorArcanaVisuals.map((visual) => visual.slug), majorSlugs);
  for (const visual of majorArcanaVisuals) {
    assert.match(visual.src, /^\/images\/[a-z0-9-]+\.webp$/);
    assert.ok(visual.alt.length >= 60);
    assert.ok(existsSync(new URL(`../public${visual.src}`, import.meta.url)), visual.src);
  }
});

test("astrology reference contains 12 signs across all four elements", () => {
  assert.equal(zodiacSigns.length, 12);
  assert.deepEqual(
    new Set(zodiacSigns.map((sign) => sign.element)),
    new Set(["Lửa", "Đất", "Khí", "Nước"]),
  );
});

test("every folklore entry separates legend, historical record and archaeology", () => {
  assert.ok(folkloreEntries.length >= 14);
  for (const entry of folkloreEntries) {
    assert.ok(["legend", "historical-record", "archaeology"].includes(entry.classification));
    assert.ok(entry.narrative.length >= 2);
    assert.ok(entry.factBoundary.length >= 80);
    assert.ok(entry.culturalCore.length >= 60);
    assert.match(entry.sourceUrl, /^https:\/\//);
  }
  assert.ok(folkloreEntries.some((entry) => entry.classification === "legend"));
  assert.ok(folkloreEntries.some((entry) => entry.classification === "historical-record"));
  assert.ok(folkloreEntries.some((entry) => entry.classification === "archaeology"));
});

test("external histories keep eight source dossiers and corrected readings", () => {
  assert.equal(externalHistorySources.length, 8);
  assert.equal(new Set(externalHistorySources.map((source) => source.kind)).size, 5);
  assert.equal(medievalLegendSources.length, 4);

  const hanShu = externalHistorySources.find((source) => source.slug === "han-thu-giao-chi");
  const waterways = externalHistorySources.find((source) => source.slug === "thuy-kinh-chu-lac-dan");
  const militaryGeography = externalHistorySources.find((source) => source.slug === "doc-su-phuong-du-ky-yeu");
  const laterHan = externalHistorySources.find((source) => source.slug === "hau-han-thu-hai-ba-trung");
  const tangGeography = externalHistorySources.find((source) => source.slug === "tan-duong-thu-an-nam");

  assert.match(hanShu?.quote ?? "", /九萬二千四百四十/);
  assert.doesNotMatch(hanShu?.quote ?? "", /六萬二千四百六十一/);
  assert.equal(waterways?.author, "Lịch Đạo Nguyên");
  assert.equal(militaryGeography?.title, "Độc sử phương dư kỷ yếu");
  assert.match(laterHan?.quote ?? "", /六十餘城/);
  assert.match(tangGeography?.quote ?? "", /安南都護府/);
  assert.doesNotMatch(externalHistorySources.map((source) => source.quote).join(" "), /thứ nhất| nhất | dã /i);
});
