import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("bản thử Embla đứng riêng và không thay carousel production", async () => {
  const [prototype, site, home, evaluation] = await Promise.all([
    read("public/assets/js/hero-embla-prototype.js"),
    read("public/assets/js/site.js"),
    read("templates/home.html"),
    read("tools/HERO-EMBLA-EVALUATION.md"),
  ]);
  assert.match(prototype, /import EmblaCarousel from "\/assets\/vendor\/embla-carousel\.mjs"/);
  assert.match(prototype, /export async function mountEmblaHeroPrototype/);
  assert.match(prototype, /cloneNode\(true\)/, "bản thử phải dùng track riêng");
  assert.match(prototype, /destroy\(\)/, "phải khôi phục được carousel gốc");
  assert.doesNotMatch(site, /hero-embla-prototype|EmblaCarousel/);
  assert.doesNotMatch(home, /hero-embla-prototype/);
  assert.match(site, /function initHeroCarousel\(/, "carousel production phải được giữ nguyên");
  assert.match(evaluation, /Chưa nên thay carousel production/);
});

test("bản thử giữ trạng thái truy cập và reduced motion", async () => {
  const prototype = await read("public/assets/js/hero-embla-prototype.js");
  assert.match(prototype, /motionGate\(preview/);
  assert.match(prototype, /embla\.reInit\(\{ watchDrag: false \}\)/);
  assert.match(prototype, /slide\.inert = !active/);
  assert.match(prototype, /aria-hidden/);
  assert.match(prototype, /aria-current/);
  assert.match(prototype, /embla\.scrollTo\(index, !motionAllowed\)/,
    "khi chuyển động bị chặn, chấm phải nhảy tức thì");
});
