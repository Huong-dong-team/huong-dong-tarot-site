import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = [
  ".env.example",
  "seed/settings.json",
  "HANDOVER.md",
  "public/admin/js/components/seo-preview.js",
];

test("cấu hình production thống nhất tên miền huongdong.id.vn", async () => {
  const sources = await Promise.all(files.map((file) => readFile(file, "utf8")));
  const combined = sources.join("\n");

  assert.match(combined, /https:\/\/huongdong\.id\.vn/);
  assert.match(combined, /huongdong\.id\.vn\/\$\{slug/);
  assert.doesNotMatch(combined, /huongdong\.vn/);
});
