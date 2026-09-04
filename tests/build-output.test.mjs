import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
test("có các route bắt buộc", async () => {
  for (const file of ["dist/index.html", "dist/la-bai/index.html", "dist/tin-tuc/index.html", "dist/gioi-thieu/index.html", "dist/quyen-rieng-tu/index.html", "dist/404.html", "dist/sitemap.xml", "dist/rss.xml", "dist/robots.txt", "dist/admin/index.html"]) await access(path.join(root, file));
});
test("trang quyền riêng tư nằm trong sitemap và được liên kết ở chân trang", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  assert.match(sitemap, /\/quyen-rieng-tu\//);
  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.match(home, /href="\/quyen-rieng-tu\/"/);
});
test("sinh đủ 78 trang chi tiết", async () => {
  const entries = await readdir(path.join(root, "dist/la-bai"), { withFileTypes: true });
  assert.equal(entries.filter((entry) => entry.isDirectory() && entry.name !== "huyen-su").length, 78);
});
test("OG và JSON-LD nằm trong HTML tĩnh", async () => {
  const html = await readFile(path.join(root, "dist/la-bai/the-star/index.html"), "utf8");
  assert.match(html, /property="og:image"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /Mẫu Liễu Hạnh/);
  assert.doesNotMatch(html, /__FIREBASE_CONFIG__/);
});
test("robots chặn admin", async () => {
  const robots = await readFile(path.join(root, "dist/robots.txt"), "utf8");
  assert.match(robots, /Disallow: \/admin\//);
});
