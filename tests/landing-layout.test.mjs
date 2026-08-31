import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("trang chủ giữ đúng thứ tự chín section của file bàn giao", async () => {
  const home = await read("dist/index.html");
  const markers = ['id="top"', 'class="pathways', 'id="hoc-78-la"', 'id="rws"', 'id="bo-bai"', 'id="huyen-su"', 'id="cau-chuyen"', 'id="faq"', 'id="danh-sach-cho"'];
  let previous = -1;
  for (const marker of markers) {
    const index = home.indexOf(marker);
    assert.ok(index > previous, `${marker} thiếu hoặc sai thứ tự`);
    previous = index;
  }
});

test("bố cục có đủ desktop, tablet, mobile và không làm tràn ngang", async () => {
  const css = await read("public/assets/css/home-standalone.css");
  assert.match(css, /grid-template-columns:\s*minmax\(360px, 0\.86fr\) minmax\(620px, 1\.35fr\)/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
});
