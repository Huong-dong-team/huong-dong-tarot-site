import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");
const retired = ["trai-bai", "trai-bai/co-khong", "trai-bai/ba-la", "trai-bai/tinh-yeu", "healing", "huyen-su"];

test("toàn bộ route bói cũ chỉ còn chuyển hướng đến Khóa học", async () => {
  for (const route of retired) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, /<meta name="robots" content="noindex,follow">/, route);
    assert.match(html, /location\.replace\("\/khoa-hoc\/"\)/, route);
    assert.doesNotMatch(html, /data-draw|data-spread|data-daily/, route);
  }
});

test("sitemap và điều hướng công khai chỉ dùng năm đường nội dung", async () => {
  const [sitemap, home] = await Promise.all([read("dist/sitemap.xml"), read("dist/index.html")]);
  for (const route of ["trai-bai", "healing", "huyen-su", "la-bai-hom-nay"]) {
    assert.doesNotMatch(sitemap, new RegExp(`<loc>https://huongdong\\.id\\.vn/${route}/</loc>`));
  }
  const nav = home.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert.equal((nav.match(/class="nav-group"/g) || []).length, 5);
  for (const route of ["/tarot-la-gi/", "/la-bai/", "/khoa-hoc/", "/tin-tuc/", "/cua-hang/"]) assert.ok(nav.includes(`href="${route}"`));
});
