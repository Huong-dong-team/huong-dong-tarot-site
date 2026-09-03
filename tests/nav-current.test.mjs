import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = (route) => path.join(root, "dist", route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`);

/* Chỉ soi bên trong <nav id="main-nav">. Chuỗi aria-current="page" còn nằm ở
   hai chỗ khác của cùng một trang: critical CSS nhúng trong <head> và thanh
   phân trang của /tin-tuc/ — đếm cả trang thì hai chỗ đó làm sai kết quả. */
async function mainNav(route) {
  const html = await readFile(outputPath(route), "utf8");
  const nav = html.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, `${route} không có #main-nav`);
  return nav;
}

// [route đang mở, mục cấp một phải sáng]
const sections = [
  ["/tarot-la-gi/", "/tarot-la-gi/"],
  ["/huong-dan-tarot/xao-bai/", "/tarot-la-gi/"],
  ["/la-bai/", "/la-bai/"],
  ["/la-bai/the-star/", "/la-bai/"],
  ["/trai-bai/", "/trai-bai/"],
  ["/trai-bai/ba-la/", "/trai-bai/"],
  ["/la-bai-hom-nay/", "/trai-bai/"],
  ["/huyen-su/", "/la-bai/"],
  ["/huyen-su/hong-bang-thi/", "/la-bai/"],
  ["/healing/", "/healing/"],
  ["/tin-tuc/", "/tin-tuc/"],
  ["/gioi-thieu/", "/tin-tuc/"],
  ["/cua-hang/", "/cua-hang/"],
];

test("trang đang mở làm sáng đúng mục điều hướng cấp một", async () => {
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

test("trang con đánh dấu mục cha, không đánh dấu mục trong menu con", async () => {
  const nav = await mainNav("/trai-bai/ba-la/");
  assert.match(nav, /<a class="nav-group-top" href="\/trai-bai\/" aria-current="page">/);
  assert.match(nav, /<a href="\/trai-bai\/ba-la\/">Ba Lá<\/a>/);
});

test("trang ngoài sáu mục không làm sáng mục nào", async () => {
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
