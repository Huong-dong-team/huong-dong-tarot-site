import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const intentRoutes = [
  "/trai-bai/co-khong/",
  "/trai-bai/ba-la/",
  "/trai-bai/tinh-yeu/",
  "/la-bai-hom-nay/",
];

const outputPath = (route) => path.join(root, "dist", route.replace(/^\//, ""), "index.html");

test("1.1 sinh đúng bốn URL đã chốt", async () => {
  for (const route of intentRoutes) await access(outputPath(route));
});

test("trang đang phát triển có canonical, breadcrumb và noindex", async () => {
  for (const route of intentRoutes) {
    const html = await readFile(outputPath(route), "utf8");
    assert.match(html, /<span class="v2-pending">Đang phát triển thêm<\/span>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+${route.replaceAll("/", "\\/")}">`));
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.doesNotMatch(html, /trai-bai\.js|data-draw/, "trang chờ không được kích hoạt sớm chức năng rút bài");
  }
});

test("trang Trải bài liên kết đủ bốn URL", async () => {
  const html = await readFile(path.join(root, "dist/trai-bai/index.html"), "utf8");
  for (const route of intentRoutes) assert.match(html, new RegExp(`href="${route.replaceAll("/", "\\/")}"`));
  assert.equal((html.match(/Đang phát triển thêm/g) || []).length, 4);
});

test("route chờ chưa vào sitemap và trang hoàn chỉnh vẫn được index", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  for (const route of intentRoutes) assert.ok(!sitemap.includes(route));
  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.doesNotMatch(home, /<meta name="robots" content="noindex,follow">/);
});
