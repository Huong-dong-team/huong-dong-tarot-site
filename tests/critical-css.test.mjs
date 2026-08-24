import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("critical CSS được nhúng và stylesheet đầy đủ tải không chặn render", async () => {
  const html = await read("dist/index.html");
  const critical = html.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  assert.ok(critical.length > 8_000, "critical CSS bị thiếu hoặc quá ngắn");
  assert.ok(critical.length < 20_000, "critical CSS vượt ngân sách 20 KB");
  for (const marker of ["@font-face", ".site-header", ".hero-bg", ".hero-carousel", ".page-hero", ".card-detail"]) {
    assert.ok(critical.includes(marker), `critical CSS thiếu ${marker}`);
  }
  assert.match(html, /<link rel="stylesheet" href="\/assets\/css\/main\.css\?v=[0-9a-f]{8}" media="print" onload="this\.media='all'">/);
  assert.match(html, /<noscript><link rel="stylesheet" href="\/assets\/css\/main\.css\?v=[0-9a-f]{8}"><\/noscript>/);
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\/assets\/css\/fonts\.css/);
});

test("chỉ trang chủ preload ảnh hero", async () => {
  const home = await read("dist/index.html");
  const card = await read("dist/la-bai/the-star/index.html");
  assert.match(home, /<link rel="preload" as="image" fetchpriority="high" href="\/assets\/img\/hero-1536\.avif"/);
  assert.doesNotMatch(home, /rel="preload" as="image"[^>]+hero-800\.avif/);
  assert.doesNotMatch(card, /rel="preload" as="image"[^>]+hero-/);
});

test("preload đúng font dùng ở màn hình đầu", async () => {
  const html = await read("dist/index.html");
  for (const font of [
    "be-vietnam-pro-700-vietnamese.woff2",
    "be-vietnam-pro-700.woff2",
    "charm-700-vietnamese.woff2",
    "charm-700.woff2",
  ]) {
    assert.match(html, new RegExp(`rel="preload" href="/assets/fonts/${font.replace(".", "\\.")}"`));
  }
  assert.doesNotMatch(html, /rel="preload" href="\/assets\/fonts\/be-vietnam-pro-(?:400|600)/);
});

test("font tiêu đề không đổi mặt muộn trên mạng chậm", async () => {
  const fonts = await read("public/assets/css/fonts.css");
  const charm700 = fonts.match(/@font-face\s*\{[^}]*font-family:\s*"Charm";[^}]*font-weight:\s*700;[^}]*\}/gs) || [];
  assert.equal(charm700.length, 2);
  for (const face of charm700) assert.match(face, /font-display:\s*optional/);
});
