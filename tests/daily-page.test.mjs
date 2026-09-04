import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("Lá bài hôm nay đã nghỉ và chuyển về Khóa học", async () => {
  const html = await read("dist/la-bai-hom-nay/index.html");
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/huongdong\.id\.vn\/khoa-hoc\/">/);
  assert.match(html, /location\.replace\("\/khoa-hoc\/"\)/);
  assert.doesNotMatch(html, /data-daily-card|data-daily-draw|daily-card-data/);
});

test("route đã nghỉ không còn trong sitemap hay registry", async () => {
  const [sitemap, registry, home] = await Promise.all([
    read("dist/sitemap.xml"),
    read("public/assets/js/page/registry.js"),
    read("dist/index.html"),
  ]);
  assert.doesNotMatch(sitemap, /\/la-bai-hom-nay\//);
  assert.doesNotMatch(registry, /daily-card|\.\.\/daily-card\/page\.js/);
  assert.doesNotMatch(home, /Lá Bài hôm nay|Lá bài hôm nay|\/la-bai-hom-nay\//);
});
