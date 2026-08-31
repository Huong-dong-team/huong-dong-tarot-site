import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("hộp Rút thử một lá có ngữ nghĩa dialog và điều khiển đóng", async () => {
  const [home, module] = await Promise.all([read("templates/home.html"), read("public/assets/js/ui/home-standalone.js")]);
  assert.match(home, /data-card-dialog hidden role="dialog" aria-modal="true"/);
  assert.equal([...home.matchAll(/data-dialog-close/g)].length, 2);
  assert.match(module, /event\.key === "Escape"/);
  assert.match(module, /lastFocused\?\.focus/);
});

test("tranh Hero trang trí không giả làm nút và CTA thật mở dialog", async () => {
  const home = await read("templates/home.html");
  const hero = home.slice(home.indexOf('<section id="top"'), home.indexOf("</section>"));
  assert.match(hero, /class="hero-visual entrance-visual" aria-hidden="true"/);
  assert.match(hero, /<button[^>]+data-draw-card/);
  assert.doesNotMatch(hero, /<img[^>]+role="button"|<img[^>]+tabindex=/);
  assert.doesNotMatch(home, /<iframe\b/i);
});
