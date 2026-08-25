import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");
const normalize = (value) => String(value || "").normalize("NFC").trim().toLocaleLowerCase("vi");

test("ánh xạ tooltip chỉ dùng quan hệ keyword và symbol có thật trong 78 lá", async () => {
  const cards = JSON.parse(await read("seed/cards.json"));
  let totalMatches = 0;
  let cardsWithMatches = 0;

  for (const card of cards) {
    const meanings = new Set((card.symbols || []).map((symbol) => normalize(symbol.meaning)));
    const keywords = [...(card.keywordsUpright || []), ...(card.keywordsReversed || []).slice(0, 2)];
    const expected = keywords.filter((keyword) => meanings.has(normalize(keyword))).length;
    const html = await read(`dist/la-bai/${card.slug}/index.html`);
    const actual = [...html.matchAll(/data-symbol-trigger/g)].length;
    assert.equal(actual, expected, `${card.slug} không được suy diễn ánh xạ biểu tượng`);
    assert.match(html, /class="symbol-list">[\s\S]*data-symbol-source/,
      `${card.slug} phải giữ nội dung biểu tượng trong HTML tĩnh`);
    totalMatches += expected;
    if (expected) cardsWithMatches += 1;
  }

  assert.equal(cards.length, 78);
  assert.equal(totalMatches, 22);
  assert.equal(cardsWithMatches, 22);
});

test("popover dùng Floating UI, hỗ trợ bàn phím và không nạp trên trang không có trigger", async () => {
  const [site, build, main] = await Promise.all([
    read("public/assets/js/site.js"),
    read("scripts/build.js"),
    read("public/assets/css/main.css"),
  ]);
  assert.match(site, /if \(!triggers\.length\) return;[\s\S]*import\("\/assets\/vendor\/floating-ui\.mjs"\)/);
  assert.match(site, /trigger\.tabIndex = 0;[\s\S]*setAttribute\("role", "button"\)/,
    "chỉ JS đang hoạt động mới được biến nhãn tĩnh thành control");
  assert.match(site, /computePosition\(anchor, tooltip/);
  assert.match(site, /flip\(\)/);
  assert.match(site, /shift\(\{ padding: 12 \}\)/);
  assert.match(site, /autoUpdate\(trigger, tooltip, updatePosition\)/);
  assert.match(site, /event\.key !== "Escape"/);
  assert.match(site, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(build, /aria-describedby="\$\{symbol\.domId\}"/);
  assert.doesNotMatch(build, /data-symbol-source="\$\{symbol\.domId\}" tabindex=/,
    "HTML tĩnh không được để lại control chết khi JS bị chặn");
  assert.match(main, /\.symbol-tooltip\s*\{[^}]*position:\s*fixed/);
  assert.doesNotMatch(site, /innerHTML|insertAdjacentHTML/);
});
