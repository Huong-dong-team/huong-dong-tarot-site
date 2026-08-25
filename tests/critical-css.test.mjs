import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("critical CSS được nhúng và stylesheet đầy đủ tải không chặn render", async () => {
  const html = await read("dist/index.html");
  const critical = html.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  assert.ok(critical.length > 8_000, "critical CSS bị thiếu hoặc quá ngắn");
  assert.ok(critical.length < 20_000, "critical CSS vượt ngân sách 20 KB");
  // .v2-prose và .nav-sub nằm trong danh sách vì cả hai quyết định BỐ CỤC của
  // màn hình đầu. Thiếu .v2-prose, mọi khối nội dung nở ra 113px khi main.css
  // về và đẩy trang xuống — CLS 0,066 đo được trên /trai-bai/. Thiếu .nav-sub,
  // menu con hiện nguyên danh sách giữa thanh điều hướng rồi mới biến mất.
  for (const marker of ["@font-face", ".site-header", ".hero-bg", ".hero-carousel", ".page-hero", ".card-detail", ".v2-prose", ".nav-sub"]) {
    assert.ok(critical.includes(marker), `critical CSS thiếu ${marker}`);
  }
  assert.match(html, /<link rel="stylesheet" href="\/assets\/css\/main\.css\?v=[0-9a-f]{8}" media="print" onload="this\.media='all'">/);
  // <noscript> chứa main.css và landing-drag.css: tầng scroll-snap của dải kéo
  // là CSS thuần và phải chạy được cả khi JavaScript bị chặn.
  assert.match(html, /<noscript><link rel="stylesheet" href="\/assets\/css\/main\.css\?v=[0-9a-f]{8}">/);
  assert.match(html, /<noscript>[^<]*(?:<link[^>]*>)*<link rel="stylesheet" href="\/assets\/css\/landing-drag\.css\?v=[0-9a-f]{8}"><\/noscript>/);
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\/assets\/css\/fonts\.css/);
});

test("chỉ trang chủ preload ảnh hero, và preload đúng bản cho từng dải màn hình", async () => {
  const home = await read("dist/index.html");
  const card = await read("dist/la-bai/the-star/index.html");
  // Đúng MỘT preload, và nó phải đi qua cùng logic chọn ảnh với <img>. Preload
  // bằng href cố định (hoặc chia theo media) khiến hai bên chọn hai bản khác
  // nhau và trình duyệt tải cả hai: đo được 106 KB trên một điện thoại 375px
  // DPR 3 — preload bản 800w rồi srcset lại lấy bản 1200w.
  const preloads = [...home.matchAll(/<link rel="preload" as="image"[^>]*>/g)].map((match) => match[0]);
  assert.equal(preloads.length, 1, "chỉ được một preload ảnh hero");
  assert.match(preloads[0], /imagesrcset="[^"]*hero-800\.avif 800w[^"]*hero-1200\.avif 1200w[^"]*hero-1536\.avif 1536w"/);
  assert.match(preloads[0], /imagesizes="100vw"/);
  assert.doesNotMatch(preloads[0], /\bmedia=/, "chia theo media không biết được mật độ điểm ảnh của máy");
  // imagesizes phải khớp sizes của chính thẻ <img>, lệch nhau là chọn lệch bản.
  const heroImg = home.match(/<img class="hero-bg"[\s\S]*?>/)?.[0] || "";
  assert.match(heroImg, /sizes="100vw"/);
  assert.doesNotMatch(card, /rel="preload" as="image"[^>]+hero-/);
});

test("preload đúng font dùng ở màn hình đầu", async () => {
  const home = await read("dist/index.html");
  const card = await read("dist/la-bai/the-star/index.html");
  for (const font of [
    "be-vietnam-pro-700-vietnamese.woff2",
    "be-vietnam-pro-700.woff2",
  ]) {
    const pattern = new RegExp(`rel="preload" href="/assets/fonts/${font.replace(".", "\\.")}"`);
    assert.match(home, pattern);
    assert.match(card, pattern);
  }
  assert.match(home, /rel="preload" href="\/assets\/fonts\/fontasia-vh\.woff2"/);
  assert.doesNotMatch(home, /rel="preload" href="\/assets\/fonts\/dfvn-tan-harmoni\.woff2"/);
  assert.match(card, /rel="preload" href="\/assets\/fonts\/dfvn-tan-harmoni\.woff2"/);
  assert.doesNotMatch(card, /rel="preload" href="\/assets\/fonts\/fontasia-vh\.woff2"/);
  assert.doesNotMatch(home, /rel="preload" href="\/assets\/fonts\/(?:be-vietnam-pro-(?:400|600)|charm-)/);
});

test("font tiêu đề luôn thay font nhận diện sau khi tải xong", async () => {
  const fonts = await read("public/assets/css/custom-fonts.css");
  for (const family of ["Fontasia VH", "DFVN TAN Harmoni"]) {
    const face = fonts.match(new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`, "s"))?.[0] || "";
    assert.ok(face, `thiếu @font-face của ${family}`);
    assert.match(face, /font-display:\s*swap/);
    assert.doesNotMatch(face, /font-display:\s*optional/);
  }
});

test("đủ bốn họ font Việt hóa và các biến thể Ganh", async () => {
  const files = [
    "fontasia-vh.woff2",
    "dfvn-tan-harmoni.woff2",
    "dfvn-tan-mon-cheri.woff2",
    "ganh-100.woff2",
    "ganh-100-italic.woff2",
    "ganh-400.woff2",
    "ganh-400-italic.woff2",
  ];
  for (const file of files) {
    const info = await stat(path.join(root, "public", "assets", "fonts", file));
    assert.ok(info.size > 8_000, `${file} rỗng hoặc bị hỏng`);
  }

  const critical = await read("public/assets/css/critical.css");
  const main = await read("public/assets/css/main.css");
  assert.match(critical, /--display:\s*"DFVN TAN Harmoni"/);
  assert.match(critical, /--script:\s*"Fontasia VH"/);
  assert.match(main, /--sans-display:\s*"Ganh"/);
  assert.match(main, /--editorial:\s*"DFVN TAN Mon Cheri"/);
});
