import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("không còn runtime entrance khi cuộn", async () => {
  const [registry, css] = await Promise.all([
    read("public/assets/js/page/registry.js"),
    read("public/assets/css/page-transition.css"),
  ]);

  await assert.rejects(access(path.join(root, "public/assets/js/ui/entrance-reveal.js")));
  assert.doesNotMatch(registry, /entrance-reveal/);
  assert.doesNotMatch(css, /hd-reveal|data-hd-reveal|hd-scroll-reveal/);
  assert.doesNotMatch(registry + css, /IntersectionObserver/);
});

test("stylesheet entrance nằm trong ngân sách 8 KB và chỉ có ba keyframe", async () => {
  const file = "public/assets/css/page-transition.css";
  const [css, info] = await Promise.all([read(file), stat(path.join(root, file))]);
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);

  assert.ok(info.size <= 8_000, `CSS entrance đang ${info.size} byte, vượt ngân sách 8 KB`);
  assert.deepEqual(names, ["page-in", "page-stagger", "hero-art-reveal"]);
});

test("chỉ hero và vùng đầu trang con được entrance", async () => {
  const css = await read("public/assets/css/page-transition.css");

  assert.match(css, /:is\(html\.hd-first-load, html\.is-changing\.is-rendering\)[\s\S]*?\.transition-page:not\(\[data-page="home"\]\) > :first-child > \*/);
  assert.match(css, /\.transition-page\[data-page="home"\][\s\S]*?\.hero-stage/);
  assert.doesNotMatch(css, /\.transition-page > \*:not\(\.hero\)/,
    "không được diễn hoạt mọi content section của trang");
});

test("quỹ đạo không có overshoot hoặc animation lồng trên CTA", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const stagger = css.match(/@keyframes page-stagger \{([\s\S]*?)\n\}/)?.[1] || "";

  assert.match(stagger, /from \{[^}]*transform:/);
  assert.match(stagger, /to\s+\{[^}]*transform:\s*none/);
  assert.doesNotMatch(stagger, /\d+%\s*\{[^}]*transform:/,
    "transform ở mốc giữa tạo overshoot rồi quay đầu, gây cảm giác lắc");
  assert.doesNotMatch(css, /\.hero-actions\s*>\s*:/,
    "CTA cha và từng nút con không được cùng animate transform");
});
