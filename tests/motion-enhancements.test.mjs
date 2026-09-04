import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("registry nạp đúng các nâng cấp chuyển động và bảo tàng theo vòng đời Swup", async () => {
  const registry = await read("public/assets/js/page/registry.js");
  assert.match(registry, /library: \["card-filters", "card-tilt", "museum-gallery"\]/);
  assert.match(registry, /card: \["symbol-tooltips", "card-tilt"\]/);
  assert.match(registry, /"huyen-su": \["huyen-su-reveal"\]/);
  assert.match(registry, /"card-tilt": \(\) => import\("\.\.\/ui\/card-tilt\.js"\)/);
  assert.match(registry, /"museum-gallery": \(\) => import\("\.\.\/ui\/museum-gallery\.js"\)/);
  assert.match(registry, /"huyen-su-reveal": \(\) => import\("\.\.\/ui\/huyen-su-reveal\.js"\)/);
});

test("nghiêng lá có giới hạn, hỗ trợ chạm và dọn listener", async () => {
  const source = await read("public/assets/js/ui/card-tilt.js");
  assert.match(source, /const MAX_TILT = 4/);
  assert.match(source, /\.tarot-card, \.card-art, \.hd-card/);
  assert.match(source, /pointerdown/);
  assert.match(source, /pointerup/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /prefersReducedMotion/);
  assert.match(source, /removeEventListener/);
});

test("CSS giữ tilt và Border Beam ở mức tiết chế, có đường lui giảm chuyển động", async () => {
  const css = await read("public/assets/css/main.css");
  assert.match(css, /\.tarot-card\.hd-tilt-ready/);
  assert.match(css, /\.hd-card\.hd-tilt-ready:hover/);
  assert.match(css, /perspective\(900px\)/);
  assert.match(css, /\.price-panel::before/);
  assert.match(css, /@keyframes hd-border-beam/);
  assert.match(css, /\.price-panel::before\s*\{[\s\S]*opacity: \.48/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("Huyền sử reveal dùng motion-mini và chỉ ẩn sau khi module sẵn sàng", async () => {
  const [source, css, html] = await Promise.all([
    read("public/assets/js/ui/huyen-su-reveal.js"),
    read("public/assets/css/main.css"),
    read("dist/huyen-su/index.html"),
  ]);
  assert.match(source, /import \{ animate as animateMini \} from "\/assets\/vendor\/motion-mini\.mjs"/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /hd-reveal-enabled/);
  assert.match(css, /\.hd-reveal-enabled \.hd-reveal-item/);
  assert.match(html, /data-page="huyen-su"/);
  assert.match(html, /id="nguyen-tac"/);
});

test("trang toàn văn từng chương cũng đi qua reveal và Swup", async () => {
  const html = await read("dist/huyen-su/hong-bang-thi/index.html");
  assert.match(html, /<main id="noi-dung-chinh" class="transition-page" data-page="huyen-su"/);
  assert.match(html, /class="v2-prose lncq-full"/);
});

test("Border Beam bám thẻ giá dự kiến, không biến thành đặt cọc", async () => {
  const [build, shop] = await Promise.all([
    read("scripts/build.js"),
    read("dist/cua-hang/index.html"),
  ]);
  assert.match(build, /data-price-panel/);
  assert.match(shop, /class="v2-prose pricing-gallery price-panel"[^>]*data-price-panel/);
  assert.match(shop, /390\.000đ/);
  assert.match(shop, /690\.000đ/);
  assert.match(shop, /990\.000đ/);
  assert.match(shop, /không thanh toán, không đặt cọc, không thu tiền trước/);
});
