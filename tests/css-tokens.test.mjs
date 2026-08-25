import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

test("main.css giữ một nguồn token duy nhất", async () => {
  const css = await readFile(path.join(root, "public/assets/css/main.css"), "utf8");
  assert.equal(css.match(/:root\s*\{/g)?.length, 1, "main.css còn nhiều khối :root");

  for (const token of [
    "--display", "--body", "--script", "--editorial", "--sans-display",
    "--hd-scroll", "--hd-hero", "--lacquer-son", "--lacquer-gold",
    "--lacquer-ink", "--lacquer-wash", "--lacquer-band",
  ]) {
    assert.match(css, new RegExp(`${token}:`), `thiếu token ${token}`);
  }
});

test("gói phát hành không mang theo font đã ngừng dùng", async () => {
  const fonts = await readdir(path.join(root, "public/assets/fonts"));
  assert.equal(
    fonts.filter((file) => /^(?:charm|cormorant-garamond)-/.test(file)).length,
    0,
    "font Charm/Cormorant đã ngừng dùng xuất hiện lại trong gói phát hành",
  );
});
