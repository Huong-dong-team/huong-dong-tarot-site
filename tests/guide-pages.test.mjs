import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const routes = [
  "/huong-dan-tarot/",
  "/huong-dan-tarot/dat-cau-hoi/",
  "/huong-dan-tarot/xao-bai/",
  "/huong-dan-tarot/doc-la-bai/",
];
const outputPath = (route) => path.join(root, "dist", route.replace(/^\//, ""), "index.html");

test("sinh đủ lộ trình hướng dẫn và đưa vào sitemap", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  for (const route of routes) {
    await access(outputPath(route));
    assert.ok(sitemap.includes(route), route);
  }
});

test("các trang hướng dẫn có canonical, breadcrumb và ranh giới an toàn", async () => {
  const combined = [];
  for (const route of routes) {
    const html = await readFile(outputPath(route), "utf8");
    combined.push(html);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+${route.replaceAll("/", "\\/")}">`));
    assert.match(html, /"@type":"BreadcrumbList"/);
  }
  const text = combined.join("\n");
  assert.match(text, /không thay thế tư vấn y tế, pháp lý hoặc tài chính/i);
  assert.match(text, /không phải luật chung của Tarot/i);
});

test("thư viện, chi tiết lá và trải bài dẫn về sổ tay", async () => {
  for (const file of ["dist/la-bai/index.html", "dist/la-bai/the-fool/index.html", "dist/trai-bai/index.html"]) {
    const html = await readFile(path.join(root, file), "utf8");
    assert.match(html, /href="\/huong-dan-tarot\//);
  }
});
