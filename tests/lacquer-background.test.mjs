import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("nền sơn mài dùng token thương hiệu và không thêm thư viện runtime", async () => {
  const [main, critical, layout] = await Promise.all([
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
    read("templates/_layout.html"),
  ]);

  for (const css of [main, critical]) {
    assert.match(css, /--lacquer-son:/);
    assert.match(css, /--lacquer-gold:/);
    assert.doesNotMatch(css, /trong-dong-640\.avif/,
      "trang khách không còn vẽ biểu tượng trống đồng");
    assert.doesNotMatch(css, /chim-lac-640\.avif/,
      "trang khách không còn vẽ biểu tượng chim Lạc");
    assert.doesNotMatch(css, /body::after/,
      "lớp toàn trang từng chứa hai biểu tượng phải được gỡ");
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
  }

  assert.match(main, /\.waitlist\s*\{[\s\S]*--paper-band/);
  assert.match(main, /\.site-footer\s*\{[\s\S]*--lacquer-ink/);
  assert.doesNotMatch(layout, /gsap|lenis|patternbolt|made-in-india/i);
});

test("Layer 1 hiện xong trước Layer 2 và không chạm hero", async () => {
  const [lacquer, critical] = await Promise.all([
    read("public/assets/css/lacquer-art.css"),
    read("public/assets/css/critical.css"),
  ]);

  assert.match(lacquer, /--lacquer-layer-1-duration:\s*420ms/);
  assert.match(lacquer, /--lacquer-layer-2-delay:\s*var\(--lacquer-layer-1-duration\)/,
    "Layer 2 phải chờ đúng thời lượng hiện của Layer 1");
  assert.match(lacquer, /@keyframes\s+lacquer-atmosphere-reveal/);
  assert.match(lacquer, /@keyframes\s+lacquer-artwork-reveal/);
  assert.match(lacquer, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none/);
  assert.doesNotMatch(lacquer, /\.hero::before/,
    "stylesheet Layer 1–2 không được vẽ vào hero");
  assert.doesNotMatch(critical, /Tầng đáy của hero cho lớp nền sơn mài/);
  assert.doesNotMatch(lacquer, /max-width:\s*429px[\s\S]*opacity:\s*calc/,
    "mobileOpacity trong JSON là giá trị cuối, không tự trừ thêm ở màn hẹp");
  assert.match(lacquer, /body:not\(\.home-page\)::before\s*\{\s*opacity:\s*\.2;\s*\}/);
  assert.doesNotMatch(
    lacquer.match(/body:not\(\.home-page\)::before[^}]*\}/)?.[0] || "",
    /--hd-scroll/,
    "độ đậm của Layer 1 không được nối vào cuộn",
  );
});

test("route nhận đúng tranh và trang chủ chỉ nhận Layer 1–2 sau hero", async () => {
  const [home, history, about] = await Promise.all([
    read("dist/index.html"),
    read("dist/huyen-su/index.html"),
    read("dist/gioi-thieu/index.html"),
  ]);

  assert.match(home, /<main id="noi-dung-chinh" class="transition-page" data-page="home" data-page-art="home-content">/);
  assert.match(home, /<picture class="subpage-artwork" aria-hidden="true">[\s\S]*?home-content-1536\.webp/);
  const heroStart = home.indexOf('<section class="hero">');
  const heroEnd = home.indexOf("</section>", heroStart);
  const frameStart = home.indexOf('<div class="subpage-content-frame">');
  assert.ok(heroStart >= 0 && heroEnd > heroStart && frameStart > heroEnd,
    "khung tranh trang chủ phải bắt đầu sau khi hero đã đóng");
  assert.doesNotMatch(home.slice(heroStart, heroEnd), /subpage-artwork|home-content/,
    "hero không được chứa Layer 1–2");

  assert.match(history, /data-page-art="huyen-su"/);
  assert.match(history, /huyen-su-1536\.webp/);
  const aboutMain = about.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "";
  assert.doesNotMatch(aboutMain, /data-page-art=|subpage-artwork/,
    "route ngoài bảng không được mượn tranh home-content");

  const homeCritical = home.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  assert.match(homeCritical, /\.subpage-artwork/,
    "critical CSS trang chủ phải neo picture tuyệt đối để không gây dịch bố cục");
});
