import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("bảng kể chuyện dùng một dialog native, không có iframe hay modal lồng", async () => {
  const [home, site] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/js/ui/hero-carousel.js"),
  ]);
  assert.equal((home.match(/<dialog\b/g) || []).length, 1);
  assert.equal((home.match(/<\/dialog>/g) || []).length, 1);
  assert.doesNotMatch(home, /<iframe\b/i);
  assert.match(home, /<dialog[^>]*data-story-dialog[\s\S]*data-story-close[\s\S]*<\/dialog>/);
  assert.match(site, /dialog\.showModal\(\)/);
  assert.match(site, /data-story-close[^\n]*dialog\.close\(\)/);
  assert.doesNotMatch(site, /createFocusTrap|focus-trap\.mjs/,
    "không được chồng focus-trap JavaScript lên dialog native");
});

test("dialog có nhãn động và không tự tranh quyền xử lý Esc", async () => {
  const site = await read("public/assets/js/ui/hero-carousel.js");
  assert.match(site, /dialog\.setAttribute\("aria-label", panel\.querySelector\("h2"\)/);
  assert.doesNotMatch(site, /keydown|Escape|\.focus\(/,
    "hãy để dialog native quản lý Esc và đường trả focus");
});
