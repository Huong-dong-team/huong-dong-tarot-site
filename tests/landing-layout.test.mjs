import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("hai section dài có nhịp biên tập riêng trên màn hình rộng", async () => {
  const [css, home] = await Promise.all([
    read("public/assets/css/main.css"),
    read("dist/index.html"),
  ]);
  const editorialCss = css.slice(css.indexOf("Hai nhịp biên tập phá lưới"));

  assert.match(home, /<section class="story-section[^>]*id="cau-chuyen"/);
  assert.match(home, /<section class="pack-section[^>]*id="bao-bai"/);
  assert.match(editorialCss, /@media \(min-width: 901px\)/);
  assert.match(editorialCss, /#cau-chuyen > \.section-heading/);
  assert.match(editorialCss, /#bao-bai\s*\{[\s\S]*grid-template-columns:/);
  assert.match(editorialCss, /#bao-bai > \.pack-figure[\s\S]*grid-row: 1 \/ span 3/);
  assert.doesNotMatch(editorialCss, /\b(?:animation|transition|transform)\s*:/, "bố cục tĩnh không được thêm chuyển động");
});
