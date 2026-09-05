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

test("Hero Kirigami 3D hiển thị nguyên màu, giữ entrance và reduced motion", async () => {
  const [kirigami, motion, critical] = await Promise.all([
    read("public/assets/css/subpage-kirigami-v3.css"),
    read("public/assets/css/page-transition.css"),
    read("public/assets/css/critical.css"),
  ]);

  assert.match(kirigami, /\.page-hero\.kirigami-hero::before,[\s\S]*display:\s*none/,
    "hai lớp wash sơn mài phải bị tắt trên Hero Kirigami");
  assert.match(kirigami, /\.kirigami-3d-artwork\s*\{[\s\S]*opacity:\s*1[\s\S]*mix-blend-mode:\s*normal/);
  assert.match(kirigami, /hd3-scene-breathe 14s/);
  const baseDuration = Number(motion.match(/--hero-base-duration:\s*(\d+)ms/)?.[1]);
  const artDelay = Number(motion.match(/--hero-art-delay:\s*(\d+)ms/)?.[1]);
  assert.ok(baseDuration > 0 && artDelay > 0, "thiếu mốc thời gian entrance của Hero");
  assert.ok(artDelay >= baseDuration * .6,
    `cảnh bắt đầu ở ${artDelay}ms, quá sớm so với nền dài ${baseDuration}ms`);
  assert.match(motion, /\.subpage-hero-artwork[\s\S]*hero-art-in \d+ms/);
  assert.match(motion,
    /@keyframes hero-art-in\s*\{\s*from\s*\{\s*opacity:\s*0;[^}]*\}\s*to\s*\{\s*opacity:\s*var\(--hero-art-opacity,\s*1\);[^}]*\}\s*\}/,
    "cảnh phải tăng thẳng từ 0 đến đúng opacity cuối, không có mốc nhấp sáng");
  assert.match(motion, /prefers-reduced-motion:\s*reduce[\s\S]*\.subpage-hero-artwork[\s\S]*animation:\s*none !important/);
  assert.match(critical, /\.subpage-hero-artwork\s*\{[\s\S]*opacity:\s*0/);
  assert.match(kirigami, /prefers-reduced-motion:\s*reduce[\s\S]*kirigami-3d-artwork img/);
});

test("các trang Kirigami giữ đúng cảnh trong Hero; bảo tàng độc lập không dùng lớp cũ", async () => {
  const routes = [
    ["dist/tarot-la-gi/index.html", "tarot-la-gi"],
    ["dist/la-bai/the-star/index.html", "la-bai"],
    ["dist/khoa-hoc/index.html", "khoa-hoc"],
    ["dist/tin-tuc/index.html", "chuyen-huong-dong"],
    ["dist/cua-hang/index.html", "cua-hang"],
  ];

  for (const [file, artId] of routes) {
    const html = await read(file);
    assert.match(html, new RegExp(`data-page-art="${artId}"`), `${file}: sai data-page-art`);
    const hero = html.match(/<(?:section|article|header)[^>]*lacquer-hero[^>]*>[\s\S]*?<\/(?:section|article|header)>/)?.[0] || "";
    assert.match(hero, new RegExp(`<picture class="subpage-hero-artwork kirigami-3d-artwork"[\\s\\S]*${artId}-kirigami-3d\\.webp`),
      `${file}: cảnh Kirigami không nằm trong Hero`);
    assert.match(hero, /loading="eager"[\s\S]*fetchpriority="high"/);
    assert.doesNotMatch(html, /<div class="subpage-content-frame"><picture class="subpage-hero-artwork"/,
      `${file}: Layer 2 bị lặp sau Hero`);
  }

  const [card, post, course] = await Promise.all([
    read("dist/la-bai/the-star/index.html"),
    read("dist/tin-tuc/vi-sao-huong-dong-giu-he-nghia-rws/index.html"),
    read("dist/khoa-hoc/index.html"),
  ]);
  assert.match(card, /<article class="card-detail[^"]*kirigami-hero">[\s\S]*la-bai-kirigami-3d\.webp/);
  assert.match(post, /<header class="lacquer-hero kirigami-hero">[\s\S]*chuyen-huong-dong-kirigami-3d\.webp/);
  assert.match(course, /<section class="page-hero[^"]*kirigami-hero">[\s\S]*khoa-hoc-kirigami-3d\.webp/);
  const hub = await read("dist/la-bai/index.html");
  assert.match(hub, /data-museum-world="hub"/);
  assert.doesNotMatch(hub, /data-page-art="la-bai"|la-bai-kirigami-3d\.webp/);
});

test("trang chủ tự quản lý tranh bàn giao và route ngoài bảng không mượn tranh", async () => {
  const [home, retiredHistory, about] = await Promise.all([
    read("dist/index.html"),
    read("dist/huyen-su/index.html"),
    read("dist/gioi-thieu/index.html"),
  ]);

  assert.match(home, /<main id="noi-dung-chinh" class="transition-page" data-page="home">/);
  assert.match(home, /home-kirigami-1536\.webp/);
  const homeMain = home.match(/<main id="noi-dung-chinh"[\s\S]*?<\/main>/)?.[0] || "";
  assert.doesNotMatch(homeMain, /data-page-art="home-content"|home-content-|subpage-content-frame/);
  const heroStart = home.indexOf('<section id="top" class="hero">');
  const heroEnd = home.indexOf("</section>", heroStart);
  assert.ok(heroStart >= 0 && heroEnd > heroStart);
  assert.match(home.slice(heroStart, heroEnd), /class="hero-stage"[\s\S]*home-kirigami/);

  assert.match(retiredHistory, /location\.replace\("\/khoa-hoc\/"\)/,
    "route Huyền sử cũ phải chuyển về giáo trình mới");
  const aboutMain = about.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "";
  assert.doesNotMatch(aboutMain, /data-page-art=|subpage-artwork/,
    "route ngoài bảng không được mượn tranh home-content");

  assert.match(home, /home-standalone\.css\?v=[0-9a-f]{8}/,
    "CSS bàn giao phải được đóng dấu cache và tải trên trang chủ");
});

test("Hero Kirigami giữ ảnh nguyên khung và tương phản chữ đạt AA", async () => {
  const css = await read("public/assets/css/subpage-kirigami-v3.css");
  const artRule = css.match(/\.page-hero \.kirigami-3d-artwork\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(artRule, /opacity:\s*1/);
  assert.match(artRule, /mix-blend-mode:\s*normal/,
    "cảnh Kirigami không được trộn multiply như tranh sơn mài cũ");
  const washRule = css.match(/\.page-hero\.kirigami-hero::before,[\s\S]*?\{([^}]*)\}/)?.[1] || "";
  assert.match(washRule, /display:\s*none/,
    "Hero Kirigami không được phủ wash sơn mài");

  const luminance = (rgb) => {
    const [r, g, b] = rgb.map((value) => {
      const channel = value / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const contrast = (a, b) => {
    const [bright, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (bright + .05) / (dark + .05);
  };
  assert.ok(contrast([232, 199, 131], [23, 63, 55]) >= 4.5,
    "vàng pastel không tách được khỏi nền giấy xanh ngọc");
  assert.ok(contrast([43, 27, 18], [255, 212, 90]) >= 4.5, "CTA vàng không đạt AA");
});
