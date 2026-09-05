import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { legacyMuseumDestination, matchesMuseumRecord } from "../public/assets/js/ui/museum-rooms.js";

test("legacy museum links reach real rooms without external redirects", () => {
  assert.equal(legacyMuseumDestination("?arcana=major", ""), "/la-bai/an-chinh/");
  assert.equal(legacyMuseumDestination("?arcana=minor", ""), "/la-bai/an-phu/");
  assert.equal(legacyMuseumDestination("?suit=cups", ""), "/la-bai/an-phu/sen/");
  assert.equal(legacyMuseumDestination("?suit=https://evil.example", ""), "");
  assert.equal(legacyMuseumDestination("", "#phong-huyen-su"), "/la-bai/linh-nam-chich-quai/#truyen-nguon");
  assert.match(legacyMuseumDestination("?q=sen&arcana=minor", ""), /^\/la-bai\/bo-suu-tap\/\?q=sen&arcana=minor/);
});

test("2D search matches Vietnamese with or without accents", () => {
  const record = { arcana: "minor", suit: "cups", search: "Đồng Tử — Hai Hoa Sen" };
  assert.equal(matchesMuseumRecord(record, { term: "dong tu" }), true);
  assert.equal(matchesMuseumRecord(record, { term: "Đồng Tử", suit: "cups" }), true);
  assert.equal(matchesMuseumRecord(record, { term: "sen", arcana: "major" }), false);
  assert.equal(matchesMuseumRecord(record, { suit: "wands" }), false);
});

test("new 2D module bounds visible records and owns no scrolling", async () => {
  const source = await readFile(new URL("../public/assets/js/ui/museum-rooms.js", import.meta.url), "utf8");
  assert.match(source, /matching >= limit/);
  assert.match(source, /limit = pageSize/);
  assert.match(source, /controller\.abort\(\)/);
  assert.doesNotMatch(source, /addEventListener\(["'](?:wheel|touchmove|scroll)["']/);
  assert.doesNotMatch(source, /requestAnimationFrame|WebGLRenderer/);
});
