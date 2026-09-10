import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");
const MEMBER_PAGE = "dist/thanh-vien/la-bai-hom-nay/index.html";

test("route công khai /la-bai-hom-nay/ vẫn nghỉ và chuyển về Khóa học", async () => {
  const html = await read("dist/la-bai-hom-nay/index.html");
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/huongdong\.id\.vn\/khoa-hoc\/">/);
  assert.match(html, /location\.replace\("\/khoa-hoc\/"\)/);
  assert.doesNotMatch(html, /data-daily-card|data-daily-draw|daily-card-data/);
});

test("trang thành viên có đủ cổng mật khẩu và phần bốc bài", async () => {
  const html = await read(MEMBER_PAGE);
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /data-member-gate/);
  assert.match(html, /data-member-gate-form/);
  assert.match(html, /data-daily-card/);
  assert.match(html, /data-daily-draw/);
  assert.match(html, /id="daily-card-data"/);
  assert.match(html, /data-page="daily"/);
});

test("phần bốc bài ẩn sẵn để trang không mở toang khi thiếu JavaScript", async () => {
  const html = await read(MEMBER_PAGE);
  assert.match(html, /<div class="member-only" data-member-content hidden>/);
  // Cổng KHÔNG được mang hidden: không có JS thì phải thấy ô mật khẩu, không phải trang trắng.
  assert.doesNotMatch(html, /<section class="member-gate"[^>]*\shidden[\s>]/);
});

test("cổng đóng băm chứ không đóng mật khẩu vào trang", async () => {
  const html = await read(MEMBER_PAGE);
  const hash = html.match(/data-gate-hash="([a-f0-9]{64})"/)?.[1];
  assert.ok(hash, "phải có data-gate-hash 64 ký tự hex");
  const expected = createHash("sha256").update("huong-dong-thanh-vien-v1:123456").digest("hex");
  assert.equal(hash, expected);
  assert.doesNotMatch(html.replace(/data-gate-hash="[a-f0-9]{64}"/, ""), /123456/);
});

test("trang thành viên không lộ ra ở điều hướng công khai, sitemap hay trang chủ", async () => {
  const [sitemap, home, course] = await Promise.all([
    read("dist/sitemap.xml"),
    read("dist/index.html"),
    read("dist/khoa-hoc/index.html"),
  ]);
  assert.doesNotMatch(sitemap, /\/la-bai-hom-nay\//);
  assert.doesNotMatch(sitemap, /\/thanh-vien\//);
  for (const html of [home, course]) assert.doesNotMatch(html, /\/thanh-vien\/|Lá Bài Hôm Nay/);
});

test("module cổng chỉ so băm và không giữ mật khẩu trong mã", async () => {
  const source = await read("public/assets/js/ui/member-gate.js");
  assert.doesNotMatch(source, /123456/);
  assert.match(source, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(source, /export function init\(\)/);
  assert.match(source, /removeEventListener/);
});

test("registry nạp trang daily qua vòng đời Swup, không nhúng script cứng", async () => {
  const [registry, html] = await Promise.all([read("public/assets/js/page/registry.js"), read(MEMBER_PAGE)]);
  assert.match(registry, /daily: \[[^\]]*"member-gate"[^\]]*"daily-card"[^\]]*\]/);
  assert.match(registry, /"member-gate": \(\) => import\("\.\.\/ui\/member-gate\.js"\)/);
  assert.match(registry, /"daily-card": \(\) => import\("\.\.\/daily-card\/page\.js"\)/);
  const inline = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of inline) assert.match(src, /\/assets\/js\/(site|light-journey)\.js/, src);
});

test("thư viện thiên văn có mặt trong dist để trang nạp trễ được", async () => {
  const [vendor, html] = await Promise.all([
    read("dist/assets/vendor/astronomy.browser.min.js"),
    read(MEMBER_PAGE),
  ]);
  assert.ok(vendor.length > 50_000);
  assert.match(html, /data-astronomy-src="\/assets\/vendor\/astronomy\.browser\.min\.js/);
});

test("chuỗi lật lá có hạn chót nên không treo khi kết quả nằm ngoài khung nhìn", async () => {
  const source = await read("public/assets/js/daily-card/page.js");
  // Trình duyệt không khởi động animation trên phần tử ngoài khung nhìn, và
  // complete()/cancel()/stop() của motion-mini không giải phóng `finished`.
  // Không có Promise.race này thì lời đọc ở lại opacity 0 và nút bốc kẹt disabled.
  assert.match(source, /Promise\.race\(\[animation\.finished, deadline\.promise\]\)/);
  assert.match(source, /function revealDeadline\(/);
  assert.match(source, /clearTimeout\(id\)/);
});
