import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("entrance reveal chạy trên mọi trang và đi qua đúng vòng đời registry", async () => {
  const [registry, source] = await Promise.all([
    read("public/assets/js/page/registry.js"),
    read("public/assets/js/ui/entrance-reveal.js"),
  ]);

  assert.match(registry, /const SHARED = \[[^\]]*"entrance-reveal"/,
    "module phải thuộc SHARED để cả trang chủ lẫn mọi trang con đều được dựng");
  assert.match(registry, /"entrance-reveal": \(\) => import\("\.\.\/ui\/entrance-reveal\.js"\)/);
  assert.match(source, /export function init\(\)/);
  assert.match(source, /return \(\) => \{/,
    "module phải có teardown để Swup không giữ observer của trang cũ");
  assert.match(source, /observer\?\.disconnect\(\)/);
  assert.match(source, /cancelAnimationFrame\(frame\)/);
});

test("entrance reveal dùng bốn hướng, chạy một lần và có đường lui an toàn", async () => {
  const source = await read("public/assets/js/ui/entrance-reveal.js");

  assert.match(source, /\["left", "top", "right", "bottom"\]/);
  assert.match(source, /entry\.isIntersecting/);
  assert.match(source, /observer\?\.unobserve\(item\)/,
    "phần tử đã hiện phải rời observer để không diễn lại khi cuộn ngược");
  assert.match(source, /"IntersectionObserver" in window/,
    "trình duyệt cũ phải hiện thẳng nội dung thay vì để nội dung bị giấu");
  assert.match(source, /prefersReducedMotion\(\)/);
  assert.match(source, /onReducedMotionChange/);
  assert.match(source, /--hd-reveal-delay/);
  assert.doesNotMatch(source, /calc\([^)]*\*/,
    "không dùng phép nhân calc() chưa ổn định trên Safari cũ");
});

test("CSS reveal chỉ dùng thuộc tính compositor và tắt khi giảm chuyển động", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const keyframes = css.match(/@keyframes hd-scroll-reveal \{([\s\S]*?)\n\}/)?.[1] || "";
  assert.ok(keyframes, "thiếu keyframe cuộn vào vùng nhìn");

  for (const declaration of keyframes.matchAll(/([a-z-]+)\s*:/g)) {
    assert.ok(["opacity", "transform", "filter"].includes(declaration[1]),
      `scroll reveal không được animate ${declaration[1]}`);
  }

  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /html\.hd-reveal-ready \[data-hd-reveal\]/);
  assert.match(reduced, /animation:\s*none\s*!important/);
  assert.match(reduced, /filter:\s*none\s*!important/);
});
