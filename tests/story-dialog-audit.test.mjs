import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("ảnh sản phẩm tĩnh không để lại dialog kể chuyện hoặc iframe", async () => {
  const [home, registry] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/js/page/registry.js"),
  ]);
  const hero = home.slice(home.indexOf('<section class="hero">'), home.indexOf("</section>"));
  assert.doesNotMatch(hero, /<dialog\b|<\/dialog>|data-story-dialog|data-story-close/);
  assert.doesNotMatch(home, /<iframe\b/i);
  assert.doesNotMatch(registry, /home:\s*\[[^\]]*hero-carousel/,
    "không nạp module dialog cũ cho ảnh sản phẩm tĩnh");
});

test("ảnh sản phẩm có cấu trúc ngữ nghĩa và mô tả thay thế", async () => {
  const home = await read("templates/home.html");
  const hero = home.slice(home.indexOf('<section class="hero">'), home.indexOf("</section>"));
  assert.match(hero, /<figure class="hero-carousel hero-product">[\s\S]*<picture>/);
  assert.match(hero, /alt="Ba lá bài Hường Đông xoè hình quạt[^\"]+"/);
  assert.doesNotMatch(hero, /role="button"|tabindex=/,
    "ảnh không tương tác không được giả làm nút");
});
