import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("năm đường chính dùng chung hero Kirigami 3D và có subheadline", async () => {
  const pages = [
    ["tarot-la-gi", "tarot-la-gi"],
    ["la-bai", "la-bai"],
    ["khoa-hoc", "khoa-hoc"],
    ["tin-tuc", "chuyen-huong-dong"],
    ["cua-hang", "cua-hang"],
  ];

  for (const [route, art] of pages) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, new RegExp(`<main[^>]+data-page-art="${art}"`), `${route}: thiếu tranh route`);
    assert.match(html, /<section class="[^"]*page-hero[^"]*kirigami-hero[^"]*"/i, `${route}: thiếu hero dùng chung`);
    assert.match(html, /<h1>[\s\S]+?<\/h1>[\s\S]*?<p>/i, `${route}: thiếu headline hoặc subheadline`);
  }
});

test("hệ sub-page giữ token, minh họa thật và reduced motion", async () => {
  const [css, kirigamiCss, registry, tarot, course] = await Promise.all([
    read("public/assets/css/subpage-remake.css"),
    read("public/assets/css/subpage-kirigami.css"),
    read("public/assets/js/page/registry.js"),
    read("dist/tarot-la-gi/index.html"),
    read("dist/khoa-hoc/index.html"),
  ]);

  for (const token of ["--subpage-gold-pastel", "--subpage-gold-soft", "--subpage-cinnabar", "--subpage-jade"]) {
    assert.ok(css.includes(token), `thiếu token ${token}`);
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(kirigamiCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(kirigamiCss, /kirigami-piece-enter 980ms/);
  assert.match(kirigamiCss, /var\(--kirigami-order, 0\) \* 70ms/);
  assert.match(registry, /"subpage-motion"/);
  assert.match(tarot, /class="section-card-fan"/);
  assert.match(course, /class="course-module-grid"/);
  assert.doesNotMatch(`${tarot}\n${course}`, /data:image\/svg\+xml|<svg/i, "minh họa không được thay bằng SVG/CSS art giả");
});

test("năm Hero dùng cảnh Kirigami 3D thật và không còn hiện vật sơn mài cũ", async () => {
  const pages = [
    ["tarot-la-gi", "tarot-la-gi"],
    ["la-bai", "la-bai"],
    ["khoa-hoc", "khoa-hoc"],
    ["tin-tuc", "chuyen-huong-dong"],
    ["cua-hang", "cua-hang"],
  ];

  for (const [route, scene] of pages) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, /class="subpage-hero-artwork kirigami-3d-artwork"/);
    assert.match(html, new RegExp(`/assets/img/subpage-3d/${scene}-kirigami-3d\\.webp`));
    assert.doesNotMatch(html, /data-kirigami-scene=|class="kirigami-frame"/,
      `${route}: hiện vật sơn mài cũ vẫn còn trong DOM`);
    assert.doesNotMatch(html, /<svg|data:image\/svg\+xml/i);

    const asset = path.join(root, "public", "assets", "img", "subpage-3d", `${scene}-kirigami-3d.webp`);
    const [bytes, info] = await Promise.all([readFile(asset), stat(asset)]);
    assert.ok(info.size > 100_000, `${route}: cảnh 3D bị rỗng hoặc chỉ là placeholder`);
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF", `${route}: nguồn không phải WebP`);
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP", `${route}: nguồn không phải WebP`);
  }
});

test("V3 biến đủ năm đường chính thành chương Kirigami có mục lục và nhãn Hero", async () => {
  const pages = [
    ["tarot-la-gi", "Tarot là gì?"],
    ["la-bai", "Bảo tàng 78 lá"],
    ["khoa-hoc", "Khóa học Tarot"],
    ["tin-tuc", "Bản tin Hường Đông"],
    ["cua-hang", "Cửa hàng"],
  ];

  for (const [route, label] of pages) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, /class="kirigami-page-label"/, `${route}: thiếu nhãn Hero V3`);
    assert.match(html, /class="kirigami-chapter-bar"/, `${route}: thiếu mục lục Kirigami`);
    assert.ok(html.includes(label), `${route}: nhãn trang không đúng`);
  }

  const [layout, css] = await Promise.all([
    read("templates/_layout.html"),
    read("public/assets/css/subpage-kirigami-v3.css"),
  ]);
  assert.match(layout, /subpage-kirigami-v3\.css/);
  assert.match(css, /--hd3-paper: #fffbeb/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.kirigami-3d-artwork/);
  assert.match(css, /hd3-scene-breathe/);
  assert.doesNotMatch(css, /data:image\/svg\+xml|<svg/i);
});

test("ba ảnh sản phẩm là PNG thật và ba Offer cùng nguồn giá", async () => {
  const files = ["standard", "premium", "signature"];
  for (const name of files) {
    const file = path.join(root, "public", "assets", "img", "shop", `${name}-pack-v1.png`);
    const [bytes, info] = await Promise.all([readFile(file), stat(file)]);
    assert.ok(info.size > 100_000, `${name}: ảnh sản phẩm quá nhỏ hoặc rỗng`);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${name}: không phải PNG`);
  }

  const [home, shop] = await Promise.all([read("dist/index.html"), read("dist/cua-hang/index.html")]);
  for (const price of ["390000", "690000", "990000"]) assert.match(home, new RegExp(`"price":"${price}"`));
  for (const label of ["390.000đ", "690.000đ", "990.000đ"]) assert.ok(shop.includes(label));
});
