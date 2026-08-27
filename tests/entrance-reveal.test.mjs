import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("không còn runtime entrance khi cuộn", async () => {
  const [registry, css] = await Promise.all([
    read("public/assets/js/page/registry.js"),
    read("public/assets/css/page-transition.css"),
  ]);

  await assert.rejects(access(path.join(root, "public/assets/js/ui/entrance-reveal.js")));
  assert.doesNotMatch(registry, /entrance-reveal/);
  assert.doesNotMatch(css, /hd-reveal|data-hd-reveal|hd-scroll-reveal/);
  assert.doesNotMatch(registry + css, /IntersectionObserver/);
});

test("stylesheet entrance nằm trong ngân sách 8 KB và chỉ có bốn keyframe có vai trò riêng", async () => {
  const file = "public/assets/css/page-transition.css";
  const [css, info] = await Promise.all([read(file), stat(path.join(root, file))]);
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);

  assert.ok(info.size <= 8_000, `CSS entrance đang ${info.size} byte, vượt ngân sách 8 KB`);
  assert.deepEqual(names, ["page-in", "hero-layer-in", "hero-art-in", "hero-converge"]);
});

test("chỉ các lớp và copy của Hero được entrance", async () => {
  const css = await read("public/assets/css/page-transition.css");

  assert.match(css, /\.lacquer-hero::before[\s\S]*hero-layer-in/);
  assert.match(css, /\.subpage-hero-artwork[\s\S]*hero-art-in 900ms/);
  assert.match(css, /\.transition-page\[data-page="home"\] \.hero-bg/);
  assert.doesNotMatch(css, /> :first-child > \*/,
    "không được diễn hoạt con trực tiếp theo vị trí DOM như choreography cũ");
  assert.doesNotMatch(css, /\.hero-stage\s*\{/,
    "stage không thuộc timeline Headline/Subheadline/CTA đã chốt");
});

test("quỹ đạo không có overshoot hoặc animation lồng trên CTA", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const stagger = css.match(/@keyframes hero-converge \{([\s\S]*?)\n\}/)?.[1] || "";

  assert.match(stagger, /from \{[^}]*transform:/);
  assert.match(stagger, /to\s+\{[^}]*transform:\s*none/);
  assert.doesNotMatch(stagger, /\d+%\s*\{[^}]*transform:/,
    "transform ở mốc giữa tạo overshoot rồi quay đầu, gây cảm giác lắc");
  assert.doesNotMatch(css, /\.hero-actions\s*>\s*:/,
    "CTA cha và từng nút con không được cùng animate transform");
});

test("timeline Hero trang trong nối đúng nhịp sau Layer 1", async () => {
  const css = await read("public/assets/css/page-transition.css");
  // Thứ tự mới ràng buộc chặt hơn cột mốc: mỗi lớp phải bắt đầu SAU lớp trước
  // nhưng TRƯỚC khi lớp trước kết thúc. Nối đuôi nhau đọc ra thành từng nấc;
  // chồng lấn mới ra một dải liên tục. Đó là toàn bộ khác biệt của v3.
  const token = (name) => Number(css.match(new RegExp(`${name}:\\s*(\\d+)ms`))?.[1]);
  const moc = [
    ["--hero-art-delay", 900],
    ["--hero-shadow-delay", 560],
    ["--hero-headline-delay", 980],
    ["--hero-subheadline-delay", 920],
    ["--hero-cta-delay", 860],
  ].map(([name, duration]) => ({ name, delay: token(name), duration }));

  assert.ok(token("--hero-base-duration") > 0, "thiếu --hero-base-duration");
  for (const [truoc, sau] of moc.slice(0, -1).map((item, i) => [item, moc[i + 1]])) {
    assert.ok(sau.delay > truoc.delay, `${sau.name} phải bắt đầu sau ${truoc.name}`);
    assert.ok(sau.delay < truoc.delay + truoc.duration,
      `${sau.name} bắt đầu sau khi ${truoc.name} đã xong — nối đuôi thì thấy từng nấc`);
  }

  // Swup chỉ giữ .is-rendering trong --page-in. Lớp nào chạy quá mốc đó sẽ bị
  // snap về trạng thái cuối giữa chừng, thấy rõ là một cú giật.
  const pageIn = Number(css.match(/--page-in:\s*(\d+)ms/)?.[1]);
  assert.ok(pageIn > 0);
  for (const { name, delay, duration } of moc) {
    assert.ok(delay + duration <= pageIn, `${name}: ${delay} + ${duration} vượt --page-in ${pageIn}ms`);
  }

  // Easing phải là một đường ra (out): tăng tốc sớm rồi trôi dài. Bất kỳ đường
  // nào có điểm điều khiển thứ hai < 1 sẽ phanh ở cuối — đúng thứ v3 gỡ bỏ.
  const ease = css.match(/--page-ease-in:\s*cubic-bezier\(([^)]*)\)/)?.[1].split(",").map(Number);
  assert.ok(ease && ease.length === 4, "thiếu --page-ease-in");
  assert.equal(ease[3], 1, "điểm cuối phải nằm ở 1: đường ra không được phanh");
  assert.ok(ease[1] >= 1, "điểm điều khiển thứ hai phải ≥ 1");

  assert.match(css, /hero-converge 980ms[\s\S]*var\(--hero-headline-delay\)/);
  assert.match(css, /hero-converge 920ms[\s\S]*var\(--hero-subheadline-delay\)/);
  assert.match(css, /hero-converge 860ms[\s\S]*var\(--hero-cta-delay\)/);
});
