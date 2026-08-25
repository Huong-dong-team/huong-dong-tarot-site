import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("giá bộ bài chỉ có một nguồn trong build.js", async () => {
  const [build, homeTemplate, shopTemplate] = await Promise.all([
    read("scripts/build.js"),
    read("templates/home.html"),
    read("templates/cua-hang.html"),
  ]);

  assert.match(build, /const PACK_PRICE = Object\.freeze\(/);
  assert.match(build, /price:\s*String\(PACK_PRICE\.vnd\)/);
  assert.doesNotMatch(`${homeTemplate}\n${shopTemplate}`, /690(?:\.000|k)/, "template còn chứa giá viết cứng");
  assert.match(homeTemplate, /\{\{packPrice\.compactLabel\}\}/);
  assert.match(homeTemplate, /\{\{packPrice\.label\}\}/);
  assert.match(shopTemplate, /\{\{packPrice\.label\}\}/);
});

test("giá hiển thị và Product JSON-LD khớp nhau sau build", async () => {
  const [home, shop] = await Promise.all([
    read("dist/index.html"),
    read("dist/cua-hang/index.html"),
  ]);

  assert.match(home, /690k/);
  assert.match(home, /690\.000đ/);
  assert.match(shop, /690\.000đ/);
  assert.match(home, /"price":"690000"/);
});
