import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("chỉ một khối đã duyệt trở thành dải kéo", async () => {
  // Trang chủ V2 rút bốn mục cũ (Tứ Bất Tử, Bốn Nhà, Thư viện, Nhật ký) chung
  // vào một section #kham-pha-them — chỉ còn đúng một dải kéo thay vì ba.
  const html = await read("dist/index.html");
  const rails = [...html.matchAll(/data-drag-rail="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(rails, ["Đi sâu hơn"]);
  // Hero có carousel riêng đã quản lý inert/aria-current và một <dialog>; kéo
  // thêm một engine thứ hai lên đó là hai bộ trạng thái tranh nhau cùng một DOM.
  assert.doesNotMatch(html, /data-hero-carousel[^>]*data-drag-rail/);
  assert.doesNotMatch(html, /<body[^>]*data-drag-rail|<main[^>]*data-drag-rail/,
    "không được áp thao tác kéo cho cả trang");
});

test("dải kéo giữ nguyên nội dung của lưới đã rút gọn", async () => {
  const html = await read("dist/index.html");
  const explore = html.match(/<div class="explore-grid" data-drag-rail="[^"]*">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
  assert.ok(explore, "khối khám phá thêm phải còn là danh sách trong HTML tĩnh, đọc được không cần JS");
  assert.equal([...explore.matchAll(/<article class="explore-card">/g)].length, 4,
    "phải giữ đủ bốn thẻ: Tứ Bất Tử, Bốn Nhà, Thư viện, Nhật ký");
});

test("tầng CSS đủ để kéo khi JavaScript không chạy", async () => {
  const css = await read("public/assets/css/landing-drag.css");
  const mobile = css.slice(css.indexOf("@media (max-width: 900px)"), css.indexOf("@media (min-width: 901px)"));
  assert.match(mobile, /scroll-snap-type:\s*x mandatory/);
  assert.match(mobile, /scroll-snap-align:\s*start/);
  // pan-y là ranh giới giữa "kéo được khối này" và "không cuộn nổi trang nữa".
  assert.match(mobile, /touch-action:\s*pan-y/, "phải giữ nguyên thao tác cuộn dọc của trang");
  assert.doesNotMatch(mobile, /touch-action:\s*none/);
  const html = await read("dist/index.html");
  assert.match(html, /<noscript>[\s\S]*landing-drag\.css/,
    "CSS dải kéo phải tới được cả người dùng đã chặn JavaScript");
});

test("desktop giữ nguyên lưới, không trả giá cho engine không dùng", async () => {
  const css = await read("public/assets/css/landing-drag.css");
  const desktop = css.slice(css.indexOf("@media (min-width: 901px)"));
  assert.match(desktop, /\.drag-rail-controls\s*\{\s*display:\s*none/);
  const source = await read("public/assets/js/landing-drag/init.js");
  assert.match(source, /active:\s*false/);
  assert.match(source, /breakpoints:\s*\{\s*\[BREAKPOINT\]:\s*\{\s*active:\s*true\s*\}\s*\}/);
  assert.equal(BREAKPOINT_OF(source), "(max-width: 900px)");
});

function BREAKPOINT_OF(source) {
  return source.match(/const BREAKPOINT = "([^"]+)"/)?.[1];
}

test("dùng Embla đã vendor, không thêm thư viện carousel thứ hai", async () => {
  const source = await read("public/assets/js/landing-drag/init.js");
  assert.match(source, /import EmblaCarousel from "\/assets\/vendor\/embla-carousel\.mjs"/);
  const names = await readdir(path.join(root, "public/assets/vendor"));
  for (const forbidden of ["keen-slider.mjs", "splide.mjs", "swiper.mjs", "glide.mjs"]) {
    assert.ok(!names.includes(forbidden), `Embla đã đủ, không được thêm ${forbidden}`);
  }
});

test("cử chỉ không quá nhạy và không tự chạy", async () => {
  const source = await read("public/assets/js/landing-drag/init.js");
  assert.match(source, /dragThreshold:\s*16/, "10px mặc định bắt nhầm cú vuốt dọc hơi chéo");
  assert.match(source, /loop:\s*false/);
  assert.doesNotMatch(source, /autoplay|setInterval|setTimeout/i,
    "chưa có lý do UX nào để dải tự chạy");
});

test("reduced motion làm snap tức thì nhưng vẫn kéo được", async () => {
  const source = await read("public/assets/js/landing-drag/init.js");
  assert.match(source, /duration:\s*prefersReducedMotion\(\) \? 0 : 25/);
  assert.match(source, /onReducedMotionChange/, "đổi thiết lập giữa phiên phải có hiệu lực ngay");
  assert.doesNotMatch(source, /watchDrag:\s*false/,
    "kéo là thao tác do người dùng chủ động, không phải chuyển động cần tắt");
});

test("dải kéo đọc được bằng bàn phím và trình đọc màn hình", async () => {
  const source = await read("public/assets/js/landing-drag/a11y.js");
  assert.match(source, /aria-roledescription/);
  assert.match(source, /setAttribute\("aria-label", label\)/);
  assert.match(source, /event\.key === "ArrowLeft"/);
  assert.match(source, /viewport\.addEventListener\("keydown", onKeyDown\)/);
  assert.doesNotMatch(source, /document\.addEventListener\("keydown"/,
    "không được cướp phím mũi tên của cả trang");
  // Đây là khác biệt cốt lõi với một carousel: mọi mục phải đọc được liên tục,
  // vì đây vốn là một lưới nội dung chứ không phải bảng quảng cáo tự lật.
  assert.doesNotMatch(source, /slide[^\n]*aria-hidden|\.inert\s*=/,
    "mục ngoài khung nhìn vẫn phải nằm trong cây accessibility");
  assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML/);
  assert.match(source, /previous\.disabled = !embla\.canScrollPrev\(\)/,
    "nút hết đường đi phải bị vô hiệu hoá thật, không chỉ mờ đi");
});

test("module trả DOM về nguyên trạng khi huỷ", async () => {
  const source = await read("public/assets/js/landing-drag/init.js");
  assert.match(source, /if \(rail\.dataset\.dragRailMounted !== undefined\) return null/,
    "không được bọc viewport hai lần lên cùng một khối");
  assert.match(source, /embla\.destroy\(\)/);
  assert.match(source, /viewport\.before\(rail\);\s*\n\s*viewport\.remove\(\)/,
    "lớp bọc dựng lúc chạy phải được gỡ, nếu không mỗi lần ghé trang chủ lại thêm một lớp");
  assert.match(source, /delete rail\.dataset\.dragRailMounted/);
});
