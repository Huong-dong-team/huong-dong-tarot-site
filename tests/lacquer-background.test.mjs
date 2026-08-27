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
  // Tranh phải bắt đầu sau khi Layer 1 màu đã ổn định — nếu không, hai lớp
  // cùng sáng lên một lúc và không còn đọc ra thành hai lớp nữa. Canh quan hệ
  // giữa hai con số, không canh chính con số: thời lượng còn được tinh chỉnh.
  const baseDuration = Number(motion.match(/--hero-base-duration:\s*(\d+)ms/)?.[1]);
  const artDelay = Number(motion.match(/--hero-art-delay:\s*(\d+)ms/)?.[1]);
  assert.ok(baseDuration > 0 && artDelay > 0, "thiếu mốc thời gian của Layer 1 hoặc tranh");
  assert.ok(artDelay >= baseDuration * .6,
    `tranh bắt đầu ở ${artDelay}ms, quá sớm so với Layer 1 dài ${baseDuration}ms`);
  assert.match(motion, /\.subpage-hero-artwork[\s\S]*hero-art-in \d+ms/);
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

test("Hero đầu trang đạt opacity 1 ở vùng trống và vẫn bảo vệ vùng chữ", async () => {
  const css = await read("public/assets/css/lacquer-art.css");
  for (const value of [".12", ".13", ".135", ".14", ".095", ".10", ".105", ".11", ".07", ".075", ".08", "1"]) {
    const literal = value.replace(".", "\\.");
    assert.match(css, new RegExp(`--hero-art-opacity:\\s*${literal}(?:;|\\b)`));
  }
  const peakRules = [...css.matchAll(/\.page-hero\.lacquer-hero\s*\{[^}]*--hero-art-opacity:\s*1;/g)];
  assert.equal(peakRules.length, 3, "desktop, tablet và mobile đều phải đạt opacity đỉnh 1");
  assert.match(css, /\.page-hero\.lacquer-hero \.subpage-hero-artwork\s*\{[\s\S]*rgb\(0 0 0 \/ 23%\)[\s\S]*#000 88%/,
    "mask desktop phải giữ vùng copy ở 23% alpha và mở hoàn toàn về bên phải");
  // Opacity đỉnh và mask là một gói: 1 × .23 giữ nền dưới chữ đúng mức an toàn
  // của bản .82 × .28, trong khi vùng trống được mở hoàn toàn.
  const heroRule = css.match(/\.page-hero\.lacquer-hero\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(heroRule, /--brown:\s*#5E3F19/i,
    "Eyebrow dùng --brown; màu gốc #8B6339 không đạt AA trên nền tranh đậm này");

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
  // Pixel tranh đen tuyệt đối dưới copy có opacity hiệu dụng .23. Eyebrow vẫn
  // là chữ nâu trực tiếp; Headline/Subheadline vàng chanh dùng biên bóng ink.
  const worstHeroBackground = [255, 239, 159].map((channel) => Math.round(channel * (1 - 1 * .23)));
  assert.ok(contrast([94, 63, 25], worstHeroBackground) >= 4.5, "Eyebrow (--brown) không đạt AA");
  assert.ok(contrast([43, 27, 18], worstHeroBackground) >= 4.5, "biên bóng nâu không tách được khỏi nền");
  assert.ok(contrast([246, 255, 74], [43, 27, 18]) >= 4.5, "vàng chanh không tách được khỏi biên bóng");
  assert.ok(contrast([43, 27, 18], [255, 212, 90]) >= 4.5, "CTA vàng không đạt AA");

  // Phép tính trên chỉ đúng nếu chữ nằm TRỌN trong vùng phẳng của mask. Bó
  // chiều rộng chữ và mốc kết thúc vùng phẳng phải là cùng một con số; lệch
  // nhau là cuối dòng trôi ra chỗ tranh đã mở, và AA chỉ còn đúng ở đầu dòng.
  // Ba cặp, theo thứ tự: desktop, tablet (≤1023px), mobile (≤767px).
  const masks = [...css.matchAll(/\.page-hero\.lacquer-hero \.subpage-hero-artwork\s*\{([\s\S]*?)\n\s*\}/g)]
    .map((match) => {
      const stops = [...match[1].matchAll(/rgb\(0 0 0 \/ (\d+)%\)\s+(\d+)%/g)].map((s) => [Number(s[1]), Number(s[2])]);
      const alphaDay = stops[0][0];
      // Mốc kết thúc vùng phẳng: điểm cuối cùng còn giữ đúng alpha thấp nhất.
      return Math.max(...stops.filter(([alpha]) => alpha === alphaDay).map(([, position]) => position));
    });
  const widths = [...css.matchAll(/\.page-hero\.lacquer-hero > :is\(h1, p\)\s*\{([^}]*)\}/g)]
    .map((match) => match[1].match(/min\(900px,\s*(\d+)%\)/)?.[1])
    .map((value) => (value === undefined ? null : Number(value)));

  assert.equal(masks.length, 3, "phải có đúng ba mask: desktop, tablet, mobile");
  assert.equal(widths.length, 3, "mỗi breakpoint phải khai bó chiều rộng chữ của riêng nó");
  for (const [i, ten] of ["desktop", "tablet", "mobile"].entries()) {
    if (widths[i] === null) continue; // mobile cố ý bỏ bó ngang, xem ghi chú trong CSS
    assert.equal(widths[i], masks[i],
      `${ten}: chữ rộng ${widths[i]}% nhưng vùng phẳng của mask kết thúc ở ${masks[i]}%`);
  }});
