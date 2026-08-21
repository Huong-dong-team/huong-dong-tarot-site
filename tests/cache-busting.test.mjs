import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

// Tên tệp CSS/JS không đổi giữa các lần xuất bản. Không có dấu phiên bản thì
// trình duyệt giữ bản cũ tới khi cache hết hạn, và bản sửa lỗi không tới được
// người dùng — đúng chuyện đã xảy ra với lỗi đăng nhập trang admin.
test("CSS và JS mang dấu phiên bản theo nội dung", async () => {
  for (const file of ["dist/index.html", "dist/la-bai/index.html", "dist/admin/index.html"]) {
    const html = await read(file);
    for (const [whole, url] of html.matchAll(/(?:src|href)="(\/(?:assets|admin)\/[^"]+\.(?:css|js)[^"]*)"/g)) {
      assert.match(url, /\?v=[0-9a-f]{8}$/, `${file}: ${whole} thiếu dấu phiên bản`);
    }
  }
});

test("ảnh không bị gắn dấu phiên bản", async () => {
  // Ảnh nặng và hiếm khi đổi nên vẫn được cache lâu; gắn dấu chỉ làm hỏng
  // cache mỗi lần xuất bản mà không được gì.
  const html = await read("dist/index.html");
  assert.doesNotMatch(html, /\.(?:webp|png|jpe?g|svg)\?v=/);
});

test("firebase.json không cache lâu các tệp không đổi tên", async () => {
  const config = JSON.parse(await read("firebase.json"));
  const rule = config.hosting.headers.find((entry) => entry.source.includes("css|js"));
  const value = rule.headers.find((header) => header.key === "Cache-Control").value;
  assert.doesNotMatch(value, /max-age=[1-9]/, "CSS/JS phải revalidate, không giữ cache dài ngày");
});
