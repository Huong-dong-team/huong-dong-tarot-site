import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
test("có các route bắt buộc", async () => {
  for (const file of ["dist/index.html", "dist/la-bai/index.html", "dist/tin-tuc/index.html", "dist/gioi-thieu/index.html", "dist/quyen-rieng-tu/index.html", "dist/download.html", "dist/404.html", "dist/sitemap.xml", "dist/rss.xml", "dist/robots.txt", "dist/admin/index.html"]) await access(path.join(root, file));
});
test("favicon đa kích thước và gói tải xuống cùng có trong bản phát hành", async () => {
  const assets = [
    "favicon.ico",
    "favicon.svg",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon-48x48.png",
    "favicon-96x96.png",
    "favicon-192x192.png",
    "favicon-512x512.png",
    "apple-touch-icon.png",
    "favicon-changes.zip",
    "favicon-changes.tar.gz",
    "favicon-changes.patch",
  ];
  for (const file of assets) await access(path.join(root, "dist", file));

  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  for (const size of [16, 32, 48, 96, 192]) {
    assert.match(home, new RegExp(`rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}\\.png"`));
  }
  assert.match(home, /rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
  assert.match(home, /rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png"/);

  const download = await readFile(path.join(root, "dist/download.html"), "utf8");
  assert.match(download, /href="\/favicon-changes\.zip" download/);
  assert.doesNotMatch(download, /data:application\/zip;base64,/,
    "trang tải xuống không được nhúng lặp lại toàn bộ tệp ZIP");
});
test("ảnh nền website được dùng làm thẻ chia sẻ mặc định", async () => {
  await access(path.join(root, "dist/assets/img/social-share.jpg"));
  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.match(home, /property="og:image" content="https:\/\/huongdong\.id\.vn\/assets\/img\/social-share\.jpg"/);
  assert.match(home, /property="og:image:secure_url" content="https:\/\/huongdong\.id\.vn\/assets\/img\/social-share\.jpg"/);
  assert.match(home, /property="og:image:alt" content="Phong cảnh bình minh Hường Đông với bộ bài Tarot Việt"/);
  assert.match(home, /property="og:image:width" content="1200"/);
  assert.match(home, /property="og:image:height" content="630"/);
  assert.match(home, /name="twitter:card" content="summary_large_image"/);
  assert.match(home, /name="twitter:image" content="https:\/\/huongdong\.id\.vn\/assets\/img\/social-share\.jpg"/);
  assert.match(home, /name="twitter:image:alt" content="Phong cảnh bình minh Hường Đông với bộ bài Tarot Việt"/);
});
test("trang quyền riêng tư nằm trong sitemap và được liên kết ở chân trang", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  assert.match(sitemap, /\/quyen-rieng-tu\//);
  const home = await readFile(path.join(root, "dist/index.html"), "utf8");
  assert.match(home, /href="\/quyen-rieng-tu\/"/);
});
test("sinh đủ 78 trang chi tiết", async () => {
  const entries = await readdir(path.join(root, "dist/la-bai"), { withFileTypes: true });
  const cards = JSON.parse(await readFile(path.join(root, "seed/cards.json"), "utf8"));
  const slugs = new Set(cards.map((card) => card.slug));
  assert.equal(entries.filter((entry) => entry.isDirectory() && slugs.has(entry.name)).length, 78);
});
test("OG và JSON-LD nằm trong HTML tĩnh", async () => {
  const html = await readFile(path.join(root, "dist/la-bai/the-star/index.html"), "utf8");
  assert.match(html, /property="og:image"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /Mẫu Liễu Hạnh/);
  assert.doesNotMatch(html, /__FIREBASE_CONFIG__/);
});
test("robots chặn admin", async () => {
  const robots = await readFile(path.join(root, "dist/robots.txt"), "utf8");
  assert.match(robots, /Disallow: \/admin\//);
});
