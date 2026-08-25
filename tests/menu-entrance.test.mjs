import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

test("menu con có entrance đa hướng và đường tắt accessibility", async () => {
  const css = await readFile(path.join(root, "public/assets/css/main.css"), "utf8");
  for (const name of ["nav-panel-enter", "nav-item-enter-left", "nav-item-enter-right", "nav-item-enter-top"]) {
    assert.match(css, new RegExp(`@keyframes ${name}`), `thiếu ${name}`);
  }
  assert.match(css, /\.nav-sub li:nth-child\(3n \+ 1\)/);
  assert.match(css, /\.nav-sub li:nth-child\(3n \+ 2\)/);
  assert.match(css, /\.nav-sub li:nth-child\(3n\)/);
  assert.match(css, /#main-nav\[data-open\] > :nth-child\(3n \+ 1\)[\s\S]*nav-item-enter-left/);
  assert.match(css, /#main-nav\[data-open\] > :nth-child\(3n \+ 2\)[\s\S]*nav-item-enter-top/);
  assert.match(css, /#main-nav\[data-open\] > :nth-child\(3n\)[\s\S]*nav-item-enter-right/);

  // main.css có nhiều khối reduced-motion cho các tính năng độc lập; lấy đúng
  // khối chứa menu thay vì giả định nó luôn là khối cuối tệp.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.nav-group \.nav-sub,[\s\S]*?\.nav-group \.nav-sub li \{ animation: none !important; opacity: 1; transform: none !important; \}\s*#main-nav\[data-open\] > \* \{ animation: none !important; opacity: 1; transform: none !important; \}\s*\}/);
});
