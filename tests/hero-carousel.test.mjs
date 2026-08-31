import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("Hero bàn giao dùng đúng tranh responsive và không còn carousel", async () => {
  const home = await read("dist/index.html");
  const hero = home.slice(home.indexOf('<section id="top"'), home.indexOf("</section>"));
  assert.match(hero, /class="hero-stage"/);
  assert.match(hero, /ref-hero-cards-480\.avif 480w[^"]*ref-hero-cards-1440\.avif 1440w/);
  assert.match(hero, /loading="eager"[\s\S]*fetchpriority="high"/);
  assert.doesNotMatch(hero, /data-hero-carousel|data-hero-slide|hero-dots/);
});

test("Hero có entrance, parallax nhẹ và đường lui reduced motion", async () => {
  const [registry, parallax, motion, css] = await Promise.all([
    read("public/assets/js/page/registry.js"),
    read("public/assets/js/ui/hero-parallax.js"),
    read("public/assets/js/ui/home-standalone.js"),
    read("public/assets/css/home-standalone.css"),
  ]);
  assert.match(registry, /home:\s*\["home-standalone", "card-tilt", "hero-parallax"\]/);
  assert.match(parallax, /removeEventListener/);
  assert.match(parallax, /prefersReducedMotion/);
  assert.match(motion, /home-motion-enabled/);
  assert.match(css, /@keyframes home-hero-float/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("Hero giữ đúng nội dung và CTA của file mẫu", async () => {
  const home = await read("dist/index.html");
  assert.match(home, /<h1>Hường Đông kể Tarot bằng câu chuyện Việt<\/h1>/);
  assert.match(home, /data-draw-card>Rút thử một lá<\/button>/);
  assert.match(home, /href="#danh-sach-cho">Học qua email<\/a>/);
  assert.match(home, /78<\/dt><dd>Lá, đủ bộ RWS/);
});

test("ảnh Hero đã nén nằm trong ngân sách", async () => {
  for (const [file, limit] of [["ref-hero-cards-480.avif", 70], ["ref-hero-cards-960.avif", 110], ["ref-hero-cards-1440.avif", 180]]) {
    const { size } = await stat(path.join(root, "public/assets/img", file));
    assert.ok(size < limit * 1024, `${file} vượt ${limit} KB`);
  }
});
