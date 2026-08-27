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

test("Hero v2 xếp đúng Layer 1 → tranh multiply → gradient bảo vệ chữ", async () => {
  const [lacquer, motion, critical] = await Promise.all([
    read("public/assets/css/lacquer-art.css"),
    read("public/assets/css/page-transition.css"),
    read("public/assets/css/critical.css"),
  ]);

  assert.match(lacquer, /\.lacquer-hero::before\s*\{[\s\S]*z-index:\s*0/);
  assert.match(lacquer, /\.subpage-hero-artwork\s*\{[\s\S]*z-index:\s*1[\s\S]*mix-blend-mode:\s*multiply/);
  assert.match(lacquer, /\.lacquer-hero::after\s*\{[\s\S]*z-index:\s*2[\s\S]*linear-gradient/);
  assert.match(lacquer, /\.lacquer-hero > :not\(\.subpage-hero-artwork\)[\s\S]*z-index:\s*3/);
  const heroRule = lacquer.match(/(?:^|\n)\.lacquer-hero\s*\{([^}]*)\}/)?.[1] || "";
  assert.doesNotMatch(heroRule, /--hero-art-(?:opacity|position):/,
    "giá trị mặc định trên Hero con sẽ chặn biến route kế thừa từ main");
  assert.match(motion, /--hero-base-duration:\s*420ms/);
  assert.match(motion, /--hero-art-delay:\s*420ms/,
    "tranh phải bắt đầu sau khi Layer 1 hoàn tất");
  assert.match(motion, /\.subpage-hero-artwork[\s\S]*hero-art-in 650ms/);
  assert.match(motion,
    /@keyframes hero-art-in\s*\{\s*from\s*\{\s*opacity:\s*0;[^}]*\}\s*to\s*\{\s*opacity:\s*var\(--hero-art-opacity,\s*1\);[^}]*\}\s*\}/,
    "tranh phải tăng thẳng từ 0 đến đúng opacity cuối, không có mốc nhấp sáng");
  assert.match(motion, /prefers-reduced-motion:\s*reduce[\s\S]*\.subpage-hero-artwork[\s\S]*animation:\s*none !important/);
  assert.doesNotMatch(lacquer, /\.hero::before/,
    "tranh trang trong không được mượn pseudo của Hero trang chủ");
  assert.match(critical, /\.subpage-hero-artwork\s*\{[\s\S]*opacity:\s*0/);
  assert.match(lacquer, /body:not\(\.home-page\)::before\s*\{\s*opacity:\s*\.2;\s*\}/);
  assert.doesNotMatch(
    lacquer.match(/body:not\(\.home-page\)::before[^}]*\}/)?.[0] || "",
    /--hd-scroll/,
    "độ đậm của Layer 1 không được nối vào cuộn",
  );
});

test("bảy nhóm route nhận đúng tranh trong Hero và không lặp Layer 2 sau Hero", async () => {
  const routes = [
    ["dist/tarot-la-gi/index.html", "tarot-la-gi"],
    ["dist/la-bai/index.html", "la-bai"],
    ["dist/trai-bai/index.html", "trai-bai"],
    ["dist/huyen-su/index.html", "huyen-su"],
    ["dist/healing/index.html", "healing"],
    ["dist/tin-tuc/index.html", "chuyen-huong-dong"],
    ["dist/cua-hang/index.html", "cua-hang"],
  ];

  for (const [file, artId] of routes) {
    const html = await read(file);
    assert.match(html, new RegExp(`data-page-art="${artId}"`), `${file}: sai data-page-art`);
    const hero = html.match(/<(?:section|article|header)[^>]*lacquer-hero[^>]*>[\s\S]*?<\/(?:section|article|header)>/)?.[0] || "";
    assert.match(hero, new RegExp(`<picture class="subpage-hero-artwork"[\\s\\S]*${artId}-1536\\.webp`),
      `${file}: tranh không nằm trong Hero`);
    assert.match(hero, /loading="eager"[\s\S]*fetchpriority="high"/);
    assert.doesNotMatch(html, /<div class="subpage-content-frame"><picture class="subpage-hero-artwork"/,
      `${file}: Layer 2 bị lặp sau Hero`);
  }

  const [card, post, spread] = await Promise.all([
    read("dist/la-bai/the-star/index.html"),
    read("dist/tin-tuc/vi-sao-huong-dong-giu-he-nghia-rws/index.html"),
    read("dist/trai-bai/ba-la/index.html"),
  ]);
  assert.match(card, /<article class="card-detail[^"]*lacquer-hero">[\s\S]*la-bai-1536\.webp/);
  assert.match(post, /<header class="lacquer-hero">[\s\S]*chuyen-huong-dong-1536\.webp/);
  assert.match(spread, /<section class="page-hero[^"]*lacquer-hero">[\s\S]*trai-bai-1536\.webp/);
});

test("trang chủ giữ home-content sau Hero và route ngoài bảng không mượn tranh", async () => {
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

  assert.doesNotMatch(history, /page-hero-cover|huyen-su-cover/,
    "bìa Huyền sử cũ không được chồng lên tranh Hero route");
  const aboutMain = about.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "";
  assert.doesNotMatch(aboutMain, /data-page-art=|subpage-artwork/,
    "route ngoài bảng không được mượn tranh home-content");

  const homeCritical = home.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  assert.match(homeCritical, /\.subpage-artwork/,
    "critical CSS trang chủ phải neo picture tuyệt đối để không gây dịch bố cục");
});

test("Hero đầu trang đạt 40% ở vùng trống và vẫn bảo vệ tương phản vùng chữ", async () => {
  const css = await read("public/assets/css/lacquer-art.css");
  for (const value of [".12", ".13", ".135", ".14", ".095", ".10", ".105", ".11", ".07", ".075", ".08", ".40", ".28", ".16"]) {
    assert.match(css, new RegExp(`--hero-art-opacity:\\s*\\${value.replace(".", ".")}`));
  }
  assert.match(css, /\.page-hero\.lacquer-hero\s*\{\s*--hero-art-opacity:\s*\.40/,
    "Hero desktop phải đạt opacity đỉnh 40% ở phía phải");
  assert.match(css, /\.page-hero\.lacquer-hero \.subpage-hero-artwork\s*\{[\s\S]*rgb\(0 0 0 \/ 35%\)[\s\S]*#000 88%/,
    "mask phải giữ vùng copy ở 35% alpha và mở hoàn toàn về bên phải");

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
  // Trường hợp khắc nghiệt hơn ảnh thật: picture đạt .40 nhưng mask vùng copy
  // chỉ có alpha .35, nên pixel tranh đen tuyệt đối có opacity hiệu dụng .14.
  const worstHeroBackground = [255, 239, 159].map((channel) => Math.round(channel * .86));
  assert.ok(contrast([43, 27, 18], worstHeroBackground) >= 4.5, "Headline không đạt AA");
  assert.ok(contrast([92, 68, 51], worstHeroBackground) >= 4.5, "Subheadline không đạt AA");
  assert.ok(contrast([43, 27, 18], [255, 212, 90]) >= 4.5, "CTA vàng không đạt AA");
});
