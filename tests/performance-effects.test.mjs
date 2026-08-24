import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("hero không còn các hiệu ứng nặng của 0.10", async () => {
  const [home, site, main, critical] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/js/site.js"),
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
  ]);
  const combined = `${home}\n${site}\n${main}\n${critical}`;
  for (const marker of [
    "hero-dust", "hero-mist", "initHeroDust", "initReveal", "mistBreath",
    "heroReveal", "heroEnter", "cardSheen", "drumGlow", "drumRays",
    "hdSunburst", "hdRise", "hdCardIn", "hdDrumIn", "hero-sun",
    "positionHeroSun", ".hero::after",
  ]) {
    assert.ok(!combined.includes(marker), `vẫn còn hiệu ứng nặng: ${marker}`);
  }
});

test("tối ưu hiệu ứng không làm mất nền hero và carousel", async () => {
  const [home, site, main, critical] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/js/site.js"),
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
  ]);
  assert.match(home, /class="hero-bg"/);
  assert.match(home, /data-hero-carousel/);
  assert.match(site, /function initHeroCarousel\(/);
  assert.match(main, /\.hero-carousel \.hero-card\.is-active/);
  assert.match(main, /content-visibility:\s*auto/);
  assert.match(critical, /content-visibility:\s*auto/);
  assert.match(main, /@media\s*\(max-width:\s*900px\)[\s\S]*\.home-page \.hero h1\s*\{[^}]*font-family:\s*Georgia/);
  assert.match(critical, /@media\s*\(max-width:\s*900px\)[\s\S]*\.home-page \.hero h1\s*\{[^}]*font-family:\s*Georgia/);
});
