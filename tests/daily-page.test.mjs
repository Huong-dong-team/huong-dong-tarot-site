import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("trang Lá hôm nay đã duyệt có đủ cấu trúc truy cập và được index", async () => {
  const html = await read("dist/la-bai-hom-nay/index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/huongdong\.id\.vn\/la-bai-hom-nay\/">/);
  assert.doesNotMatch(html, /<meta name="robots" content="noindex,follow">/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /data-daily-card/);
  assert.match(html, /data-daily-draw[^>]*aria-describedby="daily-privacy"/);
  assert.match(html, /data-daily-status[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /data-daily-result[^>]*hidden/);
  assert.match(html, /data-daily-name[^>]*tabindex="-1"/);
  assert.match(html, /<img data-daily-image(?![^>]*\bsrc=)[^>]*>/, "ảnh kết quả ẩn không được tải trước");
  assert.match(html, /data-daily-share/);
  assert.match(html, /data-daily-copy/);
  assert.doesNotMatch(html, /<form\b|type="password"/i);
});

test("trang nhúng đúng 78 lá tối thiểu và JSON không thể đóng thẻ script", async () => {
  const html = await read("dist/la-bai-hom-nay/index.html");
  const payload = html.match(/<script type="application\/json" id="daily-card-data">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(payload, "thiếu dữ liệu bộ bài nhúng trong trang");
  assert.doesNotMatch(payload, /<\/script/i);
  const cards = JSON.parse(payload);
  assert.equal(cards.length, 78);
  for (const card of cards) {
    assert.deepEqual(Object.keys(card).sort(), [
      "arcana", "image", "keywordsReversed", "keywordsUpright", "meaningReversed",
      "meaningUpright", "nameEn", "nameFolk", "nameVi", "slug", "suit",
    ].sort());
    assert.match(card.image.url, /^\/assets\/img\//);
    assert.ok(card.image.alt);
    assert.ok(card.image.width > 0 && card.image.height > 0);
  }
});

test("gói thiên văn và module trang có dấu phiên bản, kích thước được chặn", async () => {
  const html = await read("dist/la-bai-hom-nay/index.html");
  assert.match(html, /src="\/assets\/vendor\/astronomy\.browser\.min\.js\?v=[0-9a-f]{8}"/);
  assert.match(html, /type="module" src="\/assets\/js\/daily-card\/page\.js\?v=[0-9a-f]{8}"/);
  const vendor = await stat(path.join(root, "dist/assets/vendor/astronomy.browser.min.js"));
  assert.ok(vendor.size <= 130_000, `gói thiên văn quá lớn: ${vendor.size} byte`);
});

test("module trang chỉ lưu cục bộ, dùng ngẫu nhiên mật mã và dựng DOM an toàn", async () => {
  const source = await read("public/assets/js/daily-card/page.js");
  assert.match(source, /localStorage/);
  assert.match(source, /crypto\.(?:randomUUID|getRandomValues)/);
  assert.match(source, /textContent/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /refreshDate\(now, cards\)/, "phải đổi khóa lưu nếu tab mở qua nửa đêm");
  assert.match(source, /classList\.toggle\("is-reversed"/, "lá ngược phải xoay tranh");
  assert.doesNotMatch(source, /Math\.random|innerHTML|outerHTML|insertAdjacentHTML/);
  assert.doesNotMatch(source, /\bfetch\s*\(|firebase|firestore|geolocation/i);
});

test("Lá hôm nay xuất hiện trong sitemap sau khi duyệt nội dung", async () => {
  await access(path.join(root, "dist/la-bai-hom-nay/index.html"));
  const sitemap = await read("dist/sitemap.xml");
  assert.match(sitemap, /<loc>https:\/\/huongdong\.id\.vn\/la-bai-hom-nay\/<\/loc>/);
});
