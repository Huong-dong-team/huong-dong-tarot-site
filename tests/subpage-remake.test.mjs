import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("bảy trang trong dùng chung hero sơn mài và có subheadline", async () => {
  const pages = [
    ["tarot-la-gi", "tarot-la-gi"],
    ["la-bai", "la-bai"],
    ["trai-bai", "trai-bai"],
    ["healing", "healing"],
    ["huyen-su", "huyen-su"],
    ["tin-tuc", "chuyen-huong-dong"],
    ["cua-hang", "cua-hang"],
  ];

  for (const [route, art] of pages) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, new RegExp(`<main[^>]+data-page-art="${art}"`), `${route}: thiếu tranh route`);
    assert.match(html, /<section class="[^"]*page-hero[^"]*lacquer-hero[^"]*"/i, `${route}: thiếu hero dùng chung`);
    assert.match(html, /<h1>[\s\S]+?<\/h1>[\s\S]*?<p>/i, `${route}: thiếu headline hoặc subheadline`);
  }
});

test("hệ sub-page giữ token, minh họa thật và reduced motion", async () => {
  const [css, registry, tarot, history] = await Promise.all([
    read("public/assets/css/subpage-remake.css"),
    read("public/assets/js/page/registry.js"),
    read("dist/tarot-la-gi/index.html"),
    read("dist/huyen-su/index.html"),
  ]);

  for (const token of ["--subpage-gold-pastel", "--subpage-gold-soft", "--subpage-cinnabar", "--subpage-jade"]) {
    assert.ok(css.includes(token), `thiếu token ${token}`);
  }
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(registry, /"subpage-motion"/);
  assert.match(tarot, /class="section-card-fan"/);
  assert.match(history, /class="v2-card portrait-card"/);
  assert.doesNotMatch(`${tarot}\n${history}`, /data:image\/svg\+xml|<svg/i, "minh họa không được thay bằng SVG/CSS art giả");
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
