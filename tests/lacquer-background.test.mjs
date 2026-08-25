import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("nền sơn mài dùng token thương hiệu và không thêm thư viện runtime", async () => {
  const [main, critical, layout] = await Promise.all([
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
    read("templates/_layout.html"),
  ]);

  for (const css of [main, critical]) {
    assert.match(css, /--lacquer-son:/);
    assert.match(css, /--lacquer-gold:/);
    assert.match(css, /body::after[\s\S]*trong-dong-640\.avif/);
    assert.match(css, /body::after[\s\S]*chim-lac-640\.avif/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
  }

  assert.match(main, /\.waitlist\s*\{[\s\S]*--paper-band/);
  assert.match(main, /\.site-footer\s*\{[\s\S]*--lacquer-ink/);
  assert.doesNotMatch(layout, /gsap|lenis|patternbolt|made-in-india/i);
});
