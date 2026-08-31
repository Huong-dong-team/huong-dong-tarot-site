import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("trang chủ mới nạp lớp giao diện sau CSS cũ và có scope riêng", async () => {
  const [layout, css] = await Promise.all([read("templates/_layout.html"), read("public/assets/css/home-standalone.css")]);
  assert.match(layout, /home-standalone\.css/);
  assert.ok(layout.indexOf("home-standalone.css") > layout.indexOf("hero-halo.css"));
  assert.match(css, /body:has\(main\[data-page="home"\]\)/);
  assert.doesNotMatch(css, /body\s*\{/, "không được ghi đè body của sub-page");
});

test("ba khung tranh nội dung nhận tilt 3D, Hero nhận parallax riêng", async () => {
  const [home, registry, cardTilt] = await Promise.all([
    read("dist/index.html"), read("public/assets/js/page/registry.js"), read("public/assets/js/ui/card-tilt.js"),
  ]);
  assert.ok([...home.matchAll(/\blacquer-tilt\b/g)].length >= 5);
  assert.match(home, /class="hero-stage"/);
  assert.match(registry, /"card-tilt"/);
  assert.match(registry, /"hero-parallax"/);
  assert.match(cardTilt, /\.lacquer-tilt/);
});

test("các module 3D có teardown và tôn trọng reduced motion", async () => {
  for (const file of ["public/assets/js/ui/card-tilt.js", "public/assets/js/ui/hero-parallax.js", "public/assets/js/ui/home-standalone.js"]) {
    const source = await read(file);
    assert.match(source, /return \(\) =>/);
    assert.match(source, /removeEventListener|disconnect/);
    assert.match(source, /prefersReducedMotion|reduced/);
  }
});
