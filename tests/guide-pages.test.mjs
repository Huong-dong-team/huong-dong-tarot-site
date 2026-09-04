import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");
const oldGuides = ["huong-dan-tarot", "huong-dan-tarot/dat-cau-hoi", "huong-dan-tarot/xao-bai", "huong-dan-tarot/doc-la-bai"];

test("giáo trình cũ được hợp nhất vào một trang Khóa học", async () => {
  const course = await read("dist/khoa-hoc/index.html");
  for (const id of ["lo-trinh", "nen-tang-rws", "doc-la-bai", "bo-cuc-trai-bai", "phan-tu", "huyen-su", "dang-ky"]) {
    assert.match(course, new RegExp(`id="${id}"`));
  }
  assert.match(course, /không bói, không phán thay tương lai/i);
  assert.doesNotMatch(course, /data-draw|data-spread|data-daily/);
});

test("các URL giáo trình cũ chuyển hướng và không còn trong sitemap", async () => {
  const sitemap = await read("dist/sitemap.xml");
  for (const route of oldGuides) {
    const html = await read(`dist/${route}/index.html`);
    assert.match(html, /location\.replace\("\/khoa-hoc\/"\)/, route);
    assert.ok(!sitemap.includes(`/${route}/`), route);
  }
});
