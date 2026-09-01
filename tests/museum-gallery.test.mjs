import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("Bảo tàng render đủ 78 hiện vật và gộp Phòng Huyền sử", async () => {
  const html = await read("dist/la-bai/index.html");
  assert.equal((html.match(/class="tarot-card museum-exhibit"/g) || []).length, 78);
  assert.match(html, /id="phong-huyen-su"/);
  assert.match(html, /id="nguyen-tac"/);
  assert.match(html, /id="tu-bat-tu"/);
  assert.match(html, /id="lnc-toan-van"/);
  assert.match(html, /id="ban-do"/);
  assert.match(html, /<dialog class="museum-dialog"/);
});

test("navigation hợp nhất Huyền sử vào Bảo tàng nhưng giữ route cũ", async () => {
  const [home, history] = await Promise.all([
    read("dist/index.html"),
    read("dist/huyen-su/index.html"),
  ]);
  assert.match(home, /href="\/la-bai\/#phong-huyen-su">Huyền sử<\/a>/);
  assert.match(history, /data-page="huyen-su"/);
  assert.match(history, /id="nguyen-tac"/);
});

test("lightbox bảo tàng có keyboard, teardown và reduced motion", async () => {
  const [source, css] = await Promise.all([
    read("public/assets/js/ui/museum-gallery.js"),
    read("public/assets/css/museum-gallery.css"),
  ]);
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /removeEventListener/);
  assert.match(css, /content-visibility:\s*auto/);
  assert.match(css, /top:\s*88px/);
  assert.match(css, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
