import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("bố cục trải bài chỉ còn là học liệu tĩnh", async () => {
  const html = await read("dist/khoa-hoc/index.html");
  const section = html.match(/<section[^>]+id="bo-cuc-trai-bai"[\s\S]*?<\/section>/)?.[0] || "";
  for (const label of ["Một lá", "Ba lá · Dòng chảy", "Ba lá · Soi chiếu", "Bốn chất"]) assert.ok(section.includes(label));
  assert.match(section, /Website không chọn lá, không chấm kết quả và không quyết định thay bạn/);
  assert.doesNotMatch(section, /data-draw|data-spread|hd-deck|Xáo và rút/);
});

test("registry không thể nạp lại tính năng trải bài", async () => {
  const registry = await read("public/assets/js/page/registry.js");
  // Trải bài và bói Có/Không đã bỏ hẳn. "Lá bài hôm nay" là ngoại lệ duy nhất và
  // chỉ nạp cho <main data-page="daily"> của trang thành viên có mật khẩu.
  assert.doesNotMatch(registry, /spread-deck|\.\.\/trai-bai\.js/);
  assert.match(registry, /daily: \[[^\]]*"daily-card"[^\]]*\]/);
});
