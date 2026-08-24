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
];

const outputPath = (route) => path.join(root, "dist", route.replace(/^\//, ""), "index.html");

test("1.1 giữ đúng ba URL đang phát triển", async () => {
  for (const route of intentRoutes) await access(outputPath(route));
});

test("trang đang phát triển có canonical, breadcrumb và noindex", async () => {
  for (const route of intentRoutes) {
    const html = await readFile(outputPath(route), "utf8");
    assert.match(html, /<span class="v2-pending">Đang phát triển thêm<\/span>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+${route.replaceAll("/", "\\/")}">`));
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.match(html, /"@type":"BreadcrumbList"/);
  }
});

/* Khẳng định cũ ở đây là `doesNotMatch(html, /trai-bai\.js|data-draw/)` — "trang
   chờ không được kích hoạt sớm chức năng rút bài". Nó đúng khi ba trang mới chỉ
   là trang tạm của 1.1, và nay đã lỗi thời: Lớp 2 của 1.2–1.4 kích hoạt bộ rút
   bài một cách có chủ đích, trong khi phần nội dung biên tập vẫn để trống có
   nhãn. Thay bằng khẳng định nói đúng điều cần giữ: trang vẫn noindex và vẫn
   ngoài sitemap chừng nào Lớp 3 chưa xong. Chi tiết ở tests/spread-frames.test.mjs. */
test("trang chờ vẫn đóng với công cụ tìm kiếm dù đã có bộ rút bài", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  for (const route of intentRoutes) {
    const html = await readFile(outputPath(route), "utf8");
    assert.match(html, /<meta name="robots" content="noindex,follow">/, route);
    assert.ok(!sitemap.includes(route), route);
  }
});

test("trang Trải bài liên kết đủ bốn URL và phân biệt trang đã duyệt", async () => {
  const html = await readFile(path.join(root, "dist/trai-bai/index.html"), "utf8");
  for (const route of intentRoutes) assert.match(html, new RegExp(`href="${route.replaceAll("/", "\\/")}"`));
  assert.match(html, /href="\/la-bai-hom-nay\/"/);
  assert.equal((html.match(/Đang phát triển thêm/g) || []).length, 3);
  assert.equal((html.match(/Đã duyệt nội dung/g) || []).length, 1);
});

test("route chờ chưa vào sitemap và trang hoàn chỉnh vẫn được index", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  for (const route of intentRoutes) assert.ok(!sitemap.includes(route));
  assert.ok(sitemap.includes("/la-bai-hom-nay/"));
  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.doesNotMatch(home, /<meta name="robots" content="noindex,follow">/);
});
