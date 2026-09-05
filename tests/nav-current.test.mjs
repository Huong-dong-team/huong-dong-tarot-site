import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = (route) => path.join(root, "dist", route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`);

/* Chỉ soi bên trong #main-nav: chuỗi aria-current còn có thể nằm trong CSS
   nhúng hoặc các điều hướng phân trang khác. */
async function mainNav(route) {
  const html = await readFile(outputPath(route), "utf8");
  const nav = html.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, `${route} không có #main-nav`);
  return nav;
}

// [route đang mở, mục cấp một phải sáng]
const sections = [
  ["/tarot-la-gi/", "/tarot-la-gi/"],
  ["/la-bai/", "/la-bai/"],
  ["/la-bai/an-chinh/", "/la-bai/"],
  ["/la-bai/an-phu/sen/", "/la-bai/"],
  ["/la-bai/linh-nam-chich-quai/3d/", "/la-bai/"],
  ["/la-bai/the-star/", "/la-bai/"],
  ["/la-bai/huyen-su/hong-bang-thi/", "/la-bai/"],
  ["/khoa-hoc/", "/khoa-hoc/"],
  ["/tin-tuc/", "/tin-tuc/"],
  ["/tin-tuc/vi-sao-huong-dong-giu-he-nghia-rws/", "/tin-tuc/"],
  ["/gioi-thieu/", "/tin-tuc/"],
  ["/cua-hang/", "/cua-hang/"],
];

test("trang đang mở làm sáng đúng một trong năm mục điều hướng", async () => {
  for (const [route, href] of sections) {
    const nav = await mainNav(route);
    assert.match(nav, new RegExp(`<a class="nav-group-top" href="${href.replaceAll("/", "\\/")}" aria-current="page">`), route);
  }
});

test("mỗi trang chỉ sáng một mục điều hướng", async () => {
  for (const [route] of sections) {
    const nav = await mainNav(route);
    assert.equal(nav.match(/aria-current="page"/g)?.length, 1, route);
  }
});

test("trang con đánh dấu mục cha, không đánh dấu liên kết trong menu con", async () => {
  const nav = await mainNav("/la-bai/huyen-su/hong-bang-thi/");
  assert.match(nav, /<a class="nav-group-top" href="\/la-bai\/" aria-current="page">/);
  assert.match(nav, /<a href="\/la-bai\/linh-nam-chich-quai\/">Lĩnh Nam chích quái<\/a>/);
  assert.doesNotMatch(nav, /<a href="\/la-bai\/linh-nam-chich-quai\/" aria-current=/);
});

test("trang ngoài năm mục không làm sáng mục nào", async () => {
  for (const route of ["/", "/quyen-rieng-tu/"]) {
    assert.doesNotMatch(await mainNav(route), /aria-current/, route);
  }
});

test("luật tô vàng mục đang mở vẫn còn trong CSS phát hành", async () => {
  for (const file of ["dist/assets/css/main.css", "dist/assets/css/critical.css"]) {
    const css = await readFile(path.join(root, file), "utf8");
    assert.match(css, /#main-nav a\[aria-current="page"\]/, file);
  }
});
