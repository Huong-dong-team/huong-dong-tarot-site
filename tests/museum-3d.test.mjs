import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BATCH_SIZE, DESKTOP_ONLY_QUERY, MOBILE_NOTE, batchFor, clampPosition, exhibitLinkLabel, exhibitPlacement, normalizeData, safeURL, wrapIndex } from "../public/assets/js/museum-3d/model.js";
import { init } from "../public/assets/js/ui/museum-3d.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("3D batches never exceed six source artworks, including last and wrapped batches", () => {
  assert.equal(BATCH_SIZE, 6);
  for (const length of [1, 4, 6, 14, 22, 56, 78]) {
    for (let index = -length - 1; index <= length * 2; index += 1) {
      const result = batchFor(index, length);
      assert.ok(result.current >= 0 && result.current < length);
      assert.ok(result.end - result.start <= 6);
      assert.equal(result.current, result.start + result.slot);
      assert.ok(result.slot >= 0 && result.slot < 6);
    }
  }
  assert.deepEqual(batchFor(21, 22), { current: 21, start: 18, end: 22, slot: 3 });
  assert.equal(wrapIndex(-1, 22), 21);
  assert.equal(wrapIndex(22, 22), 0);
  assert.equal(wrapIndex(8, 0), 0);
});

test("3D data preserves real artwork links and rejects executable/missing images", () => {
  const base = "https://huongdong.id.vn/la-bai/an-chinh/3d/";
  assert.equal(safeURL("javascript:alert(1)", base), "");
  assert.equal(safeURL("data:image/svg+xml,test", base), "");
  assert.throws(() => normalizeData({}, base));
  const data = normalizeData({ theme: "dark", exhibits: [
    { id: "a", title: "Lạc Long Quân", image: "/assets/img/a.webp", href: "/la-bai/a/", source: "Hồ sơ gốc" },
    { image: "javascript:alert(1)" }, null,
  ] }, base);
  assert.equal(data.theme, "dark");
  assert.equal(data.exhibits.length, 1);
  assert.equal(data.exhibits[0].image, "https://huongdong.id.vn/assets/img/a.webp");
  assert.equal(data.exhibits[0].source, "Hồ sơ gốc");
  assert.equal(data.exhibits[0].linkLabel, "Mở hồ sơ tác phẩm");
  for (const house of ["tre", "dau-tam", "sen", "lua"]) {
    assert.equal(exhibitLinkLabel(`/la-bai/an-phu/${house}/`, base), "Mở bảo tàng con");
  }
  assert.equal(exhibitLinkLabel("/la-bai/an-phu/tre/3d/", base), "Mở hồ sơ tác phẩm");
  assert.equal(exhibitLinkLabel("javascript:alert(1)", base), "Mở hồ sơ tác phẩm");
});

test("3D visitor stays within walls, avoids timber pillars and the courtyard bed", () => {
  assert.deepEqual(clampPosition(-99, 99), { x: -3.9, z: 7.5 });
  for (const theme of ["light", "dark", "courtyard"]) {
    for (let x = -5; x < 5; x += 0.13) {
      for (let z = -9; z < 9; z += 0.27) {
        const point = clampPosition(x, z, theme);
        assert.ok(Math.abs(point.x) <= 3.9 && Math.abs(point.z) <= 7.5);
        if (theme === "courtyard") assert.ok(Math.abs(point.x) >= 1.7 || Math.abs(point.z) >= 3.9);
        for (const px of [-2.5, 2.5]) for (const pz of [-6, -2, 2, 6]) {
          assert.ok(Math.hypot(point.x - px, point.z - pz) >= 0.479999);
        }
      }
    }
  }
  for (let slot = 0; slot < 6; slot += 1) {
    const point = exhibitPlacement(slot);
    assert.equal(Math.abs(point.x), 4.34);
    assert.ok(Math.abs(point.z) <= 4.2);
    assert.equal(Math.sign(point.yaw), -Math.sign(point.x));
  }
});

test("engine stays lazy, local, click gated and free of scroll-blocking handlers", async () => {
  const [ui, scene, registry, vendor, pkg] = await Promise.all([
    read("public/assets/js/ui/museum-3d.js"), read("public/assets/js/museum-3d/scene.js"),
    read("public/assets/js/page/registry.js"), read("public/assets/vendor/three/three.module.min.js"), read("package.json"),
  ]);
  assert.match(ui, /export function init\(\)/);
  assert.match(ui, /if \(disposed \|\| mobile.matches \|\| session \|\| opening\) return/);
  assert.ok(ui.indexOf("if (disposed || mobile.matches || session || opening)") < ui.indexOf('await import("../museum-3d/scene.js")'));
  assert.doesNotMatch(ui, /^import .*scene\.js/m);
  assert.match(scene, /import \* as THREE from "\.\.\/\.\.\/vendor\/three\/three\.module\.min\.js"/);
  assert.match(vendor, /from"\.\/three\.core\.min\.js"/);
  assert.equal(JSON.parse(pkg).dependencies.three, "0.185.1");
  assert.match(registry, /"museum-3d": \(\) => import\("\.\.\/ui\/museum-3d\.js"\)/);
  assert.doesNotMatch(ui + scene, /https:\/\/.*(?:unpkg|jsdelivr)|navigator\.userAgent|requestPointerLock|style\.overflow|setInterval|setAnimationLoop\(/);
  assert.doesNotMatch(scene, /(?:listen|addEventListener)\([^\n]*["'](?:wheel|touchmove|touchstart)["']/);
  assert.match(scene, /listen\(canvas, "keydown"/);
  assert.match(scene, /Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)/);
  assert.match(scene, /if \(keys.size \|\| transition\) requestRender\(\)/);
  assert.match(scene, /resizeObserver.disconnect\(\)/);
  assert.match(scene, /intersectionObserver.disconnect\(\)/);
  assert.match(scene, /batchAbort.abort\(\)/);
  assert.match(scene, /renderer.dispose\(\)/);
  assert.match(scene, /webglcontextlost/);
});

test("shared geometry, materials and texture memory are disposed exactly once", async () => {
  const THREE = await import("../public/assets/vendor/three/three.module.min.js");
  const { disposeGroup } = await import("../public/assets/js/museum-3d/scene.js");
  const scene = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const texture = new THREE.Texture();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const counts = { geometry: 0, material: 0, texture: 0, bitmap: 0 };
  geometry.addEventListener("dispose", () => counts.geometry++);
  material.addEventListener("dispose", () => counts.material++);
  texture.addEventListener("dispose", () => counts.texture++);
  texture.image = { close: () => counts.bitmap++ };
  scene.add(new THREE.Mesh(geometry, material), new THREE.Mesh(geometry, material));
  disposeGroup(scene);
  disposeGroup(scene);
  assert.deepEqual(counts, { geometry: 1, material: 1, texture: 1, bitmap: 1 });
  assert.equal(scene.children.length, 0);
});

test("mobile gate is evaluated before entry and media listeners are torn down", async () => {
  class Element extends EventTarget {
    constructor() { super(); this.hidden = false; this.disabled = false; this.textContent = ""; this.classList = { remove() {} }; this.map = {}; }
    querySelector(selector) { return this.map[selector] || null; }
    setAttribute() {}
    replaceChildren() {}
    focus() {}
  }
  class Media extends EventTarget { constructor(matches) { super(); this.matches = matches; } }
  const main = new Element();
  const viewer = new Element();
  const start = new Element();
  const toolbar = new Element();
  const note = new Element();
  const status = new Element();
  const data = new Element();
  data.textContent = JSON.stringify({ exhibits: [{ image: "/real.webp" }] });
  main.map = { "[data-museum-viewer]": viewer, "[data-3d-toolbar]": toolbar, "[data-3d-status]": status,
    "script[data-3d-data], script[data-museum-scene]": data, ".mw-3d-mobile-note": note };
  viewer.map = { "[data-3d-start]": start, "[data-3d-canvas]": new Element() };
  toolbar.map = { "[data-3d-inspect]": new Element() };
  const mobile = new Media(true);
  const reduced = new Media(false);
  const oldDocument = globalThis.document;
  const oldWindow = globalThis.window;
  globalThis.document = { querySelector: () => main };
  globalThis.window = { matchMedia: (query) => query === DESKTOP_ONLY_QUERY ? mobile : reduced, location: { href: "https://huongdong.id.vn/" } };
  try {
    assert.equal(DESKTOP_ONLY_QUERY, "(max-width: 900px), (pointer: coarse)");
    assert.equal(MOBILE_NOTE, "hãy mở bản desktop để đạt chất lượng phòng 3d cao nhất");
    const cleanup = init();
    assert.equal(start.hidden, true);
    assert.equal(start.disabled, true);
    assert.equal(note.hidden, false);
    start.dispatchEvent(new Event("click"));
    await Promise.resolve();
    assert.match(status.textContent, /Bản 2D/);
    mobile.matches = false;
    mobile.dispatchEvent(new Event("change"));
    assert.equal(start.hidden, false);
    assert.equal(start.disabled, false);
    assert.equal(note.hidden, true);
    cleanup();
    mobile.matches = true;
    mobile.dispatchEvent(new Event("change"));
    assert.equal(start.hidden, false, "destroyed page must not respond to later media changes");
  } finally {
    globalThis.document = oldDocument;
    globalThis.window = oldWindow;
  }
});
