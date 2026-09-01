import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

/* Mã tương tác từng nằm gọn trong site.js; sau khi tách vòng đời cho Swup nó
   trải ra thư mục ui/. Gộp cả thư mục lại để các phép kiểm "không được còn thứ
   này ở đâu cả" vẫn quét đủ, kể cả khi có module mới được thêm sau này. */
async function readUiModules() {
  const dir = path.join(root, "public/assets/js/ui");
  const names = (await readdir(dir)).filter((name) => name.endsWith(".js")).sort();
  const files = await Promise.all(names.map((name) => readFile(path.join(dir, name), "utf8")));
  return files.join("\n");
}

test("hero không còn các hiệu ứng nặng của 0.10", async () => {
  const [home, site, main, critical] = await Promise.all([
    read("templates/home.html"),
    readUiModules(),
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

test("tối ưu hiệu ứng không làm mất nền và ảnh sản phẩm hero", async () => {
  const [home, registry, css, module] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/js/page/registry.js"),
    read("public/assets/css/home-standalone.css"),
    read("public/assets/js/ui/home-standalone.js"),
  ]);
  assert.match(home, /class="hero-stage"/);
  assert.match(home, /home-kirigami-960\.webp/);
  assert.doesNotMatch(home, /data-hero-carousel|data-hero-slide/);
  assert.doesNotMatch(registry, /home:\s*\[[^\]]*hero-carousel/);
  assert.match(registry, /home:\s*\["home-standalone", "card-tilt", "hero-parallax"\]/);
  assert.match(css, /font-family:\s*"DFVN TAN Harmoni"/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(module, /IntersectionObserver/);
  assert.match(module, /requestAnimationFrame/);
  assert.doesNotMatch(module, /setInterval|WebGL|three\.js/i);
});

test("bộ lọc 78 lá giữ hidden và chỉ tăng cường chuyển động khi motionGate cho phép", async () => {
  const [site, main] = await Promise.all([
    read("public/assets/js/ui/card-filters.js"),
    read("public/assets/css/main.css"),
  ]);
  assert.match(site, /import \{ motionGate \} from "\.\.\/motion-gate\.js"/);
  assert.match(site, /motionGate\(grid/);
  assert.match(site, /card\.hidden = !visible/, "lọc phải giữ node và thứ tự DOM gốc");
  assert.match(site, /visible && card\.hidden && filterMotionAllowed/,
    "chỉ thẻ vừa quay lại mới được chạy transition");
  assert.doesNotMatch(site, /auto-animate\.mjs|autoAnimate\(/,
    "không được giả vờ AutoAnimate phản ứng với thuộc tính hidden");
  assert.match(main, /\.library-grid\.is-filter-motion-ready \.tarot-card\.is-filter-entering\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(8px\)/);
});
