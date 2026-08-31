import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("trang chủ bàn giao không dựng dải kéo hoặc nạp engine thừa", async () => {
  const [home, registry] = await Promise.all([read("dist/index.html"), read("public/assets/js/page/registry.js")]);
  assert.doesNotMatch(home, /data-drag-rail|drag-rail-controls/);
  const homeFeatures = registry.match(/home:\s*\[[^\]]*\]/)?.[0] || "";
  assert.doesNotMatch(homeFeatures, /landing-drag/);
  assert.match(homeFeatures, /home-standalone/);
});

test("ba lối vào được giữ thành lưới tĩnh đọc được khi JavaScript tắt", async () => {
  const home = await read("dist/index.html");
  const grid = home.match(/<div class="path-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] || "";
  assert.equal([...grid.matchAll(/<article class="path-card"/g)].length, 3);
  assert.match(grid, /Học Tarot bằng câu chuyện Việt/);
  assert.match(grid, /Dùng lại kiến thức RWS/);
  assert.match(grid, /Sở hữu bộ bài Hường Đông/);
});
