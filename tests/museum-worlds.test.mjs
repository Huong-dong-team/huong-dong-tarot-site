import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MUSEUM_ROOMS, createMuseumPages } from "../scripts/lib/museum-worlds.js";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");
const routeHtml = (route) => read(`dist${route}index.html`);
const main = (html) => html.match(/<main\b[\s\S]*?<\/main>/)?.[0] || "";
const countExhibits = (html) => (html.match(/\bdata-museum-slug=/g) || []).length;
const scene = (html) => JSON.parse(html.match(/<script type="application\/json" data-3d-data data-museum-scene>([\s\S]*?)<\/script>/)?.[1] || "null");

test("sảnh là danh mục ba bảo tàng độc lập, không còn tường 78 lá hoặc thư viện toàn văn", async () => {
  const html = main(await routeHtml("/la-bai/"));
  const directory = html.match(/<div class="mw-directory">[\s\S]*?<\/div>/)?.[0] || "";
  assert.equal((directory.match(/class="mw-room-card"/g) || []).length, 3);
  assert.equal(countExhibits(html), 0);
  assert.doesNotMatch(html, /data-card-grid|museum-history-wing|lncq-full/);
  for (const room of MUSEUM_ROOMS.slice(0, 3)) assert.ok(directory.includes(`href="${room.path}"`), room.path);
});

test("ba mẫu có thuộc tính theme riêng; bốn nhà là route con thật của Ẩn Phụ", async () => {
  for (const room of MUSEUM_ROOMS) {
    const html = main(await routeHtml(room.path));
    assert.ok(html.includes(`data-museum-world="${room.theme}"`), room.path);
    assert.ok(html.includes(`data-museum-room="${room.key}"`), room.path);
    assert.match(html, /data-museum-view="entry"/);
    assert.match(html, /class="mw-hero"/);
    assert.ok(html.includes(`href="${room.path}3d/"`), room.path);
    if (room.parent) {
      assert.equal(countExhibits(html), 14, room.path);
      assert.match(html, /href="\/la-bai\/an-phu\/">Ẩn Phụ<\/a>/);
    }
  }
  const major = await routeHtml("/la-bai/an-chinh/");
  assert.equal(countExhibits(major), 22);
  const minor = main(await routeHtml("/la-bai/an-phu/"));
  assert.equal(countExhibits(minor), 0, "cửa vào Ẩn Phụ chỉ giới thiệu bốn nhà");
  assert.equal((minor.match(/class="mw-house-image"/g) || []).length, 4);
});

test("đại sảnh có CTA Lá bài hôm nay công khai, không phụ thuộc staff hay JavaScript", async () => {
  const html = main(await routeHtml("/la-bai/"));
  const invitation = html.match(/<section class="mw-daily-invitation"[\s\S]*?<\/section>/)?.[0];
  assert.ok(invitation, "CTA phải nằm trong nội dung bảo tàng");
  assert.match(invitation, /aria-labelledby="mw-daily-title"/);
  assert.match(invitation, /<h2 id="mw-daily-title">Lá bài hôm nay<\/h2>/);
  assert.match(invitation, /<a class="mw-button" href="\/thanh-vien\/la-bai-hom-nay\/" aria-describedby="mw-daily-note">Khám phá lá bài hôm nay<\/a>/);
  assert.match(invitation, /id="mw-daily-note">Trang trải nghiệm cần mật khẩu thành viên\./);
  assert.doesNotMatch(invitation, /\bhidden\b|aria-hidden|data-member|staff|onclick|<script|123456/i);
  assert.equal((html.match(/href="\/thanh-vien\/la-bai-hom-nay\/"/g) || []).length, 1);
  assert.ok(html.indexOf(invitation) < html.indexOf('class="mw-directory"'), "điện thoại thấy CTA trước danh mục ba phòng dài");
  const otherPaths = ["/la-bai/bo-suu-tap/", ...MUSEUM_ROOMS.flatMap((room) => [room.path, `${room.path}3d/`])];
  for (const route of otherPaths) assert.doesNotMatch(await routeHtml(route), /mw-daily-invitation|href="\/thanh-vien\/la-bai-hom-nay\/"/, route);
});

test("mọi museum dùng masthead có menu HTML, đúng một h1 và không chồng lớp Kirigami", async () => {
  const paths = ["/la-bai/", "/la-bai/bo-suu-tap/", ...MUSEUM_ROOMS.flatMap((room) => [room.path, `${room.path}3d/`])];
  for (const route of paths) {
    const html = await routeHtml(route);
    const content = main(html);
    assert.match(html, /<body class="museum-worlds-page"/);
    assert.equal((content.match(/<h1\b/g) || []).length, 1, route);
    assert.match(content, /<details class="mw-menu"><summary>Mục lục<\/summary>/);
    assert.match(content, /src="\/assets\/img\/logo-huong-dong\.webp"/);
    assert.doesNotMatch(content, /data-page-art=|kirigami-chapter-bar|subpage-content-frame/, route);
    assert.doesNotMatch(html, /href="\/assets\/img\/subpage-3d\/la-bai-kirigami-3d\.webp"/, route);
    const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size, `trùng id ở ${route}`);
  }
});

test("phòng 3D là opt-in desktop; mọi scene giữ ảnh, hồ sơ và ghi chú nguồn thật", async () => {
  const cards = JSON.parse(await read("seed/cards.json"));
  const bySlug = new Map(cards.map((card) => [card.slug, card]));
  for (const room of MUSEUM_ROOMS) {
    const html = main(await routeHtml(`${room.path}3d/`));
    const data = scene(html);
    assert.equal(data.room, room.key);
    assert.equal(data.theme, room.theme);
    assert.ok(data.exhibits.length > 0 && data.exhibits.length <= (room.parent ? 14 : 22), room.key);
    assert.match(html, /class="mw-button mw-desktop-3d" data-3d-start/);
    assert.match(html, /class="mw-3d-mobile-note">hãy mở bản desktop để đạt chất lượng phòng 3d cao nhất<\/p>/);
    assert.ok(html.includes(`href="${room.path}">Xem bảo tàng 2D</a>`));
    assert.match(html, /data-3d-canvas hidden/);
    assert.match(html, /data-3d-toolbar hidden/);
    assert.match(html, /data-3d-inspect/);
    assert.match(html, /data-3d-dialog/);
    assert.doesNotMatch(html, /<canvas\b|<script[^>]+src=[^>]*(?:three|museum-3d)/);
    for (const record of data.exhibits) {
      if (room.key === "minor") {
        const house = MUSEUM_ROOMS.find((item) => record.id === `house-${item.key}`);
        assert.ok(house?.parent);
        assert.equal(record.title, house.shortTitle);
        assert.equal(record.href, house.path);
        assert.equal(record.linkLabel, "Mở bảo tàng con");
        assert.match(record.note, /chưa có tranh minh họa riêng/);
        continue;
      }
      const card = bySlug.get(record.id);
      assert.ok(card, `${room.key}: nguồn lá không tồn tại`);
      assert.equal(record.image, card.image.url);
      assert.equal(record.href, `/la-bai/${card.slug}/`);
      assert.ok(record.source);
      if (card.imageStatus === "MISSING") assert.match(record.note, /Chưa có tranh riêng/);
    }
  }
  const minor = scene(await routeHtml("/la-bai/an-phu/3d/"));
  assert.equal(minor.exhibits.length, 4, "bốn phù hiệu không được mô tả như 56 tranh riêng");
  assert.equal(new Set(minor.exhibits.map((item) => item.image)).size, 4);
  assert.equal(scene(await routeHtml("/la-bai/an-chinh/3d/")).exhibits.length, 22);
});

test("catalog giữ 78 hồ sơ và công khai tình trạng hình minh họa", async () => {
  const html = main(await routeHtml("/la-bai/bo-suu-tap/"));
  assert.equal(countExhibits(html), 78);
  assert.match(html, /data-card-filters/);
  assert.match(html, /name="q"/);
  assert.match(html, /name="suit"/);
  assert.match(html, /data-filter="major"/);
  assert.match(html, /data-filter="minor"/);
  assert.match(html, /data-page-size="12"/);
  assert.match(html, /data-museum-more hidden/);
  assert.match(html, /data-museum-dialog-note hidden/);
  assert.equal((html.match(/Chưa có tranh riêng cho lá này; đang dùng phù hiệu của nhà\./g) || []).length, 56);
  assert.match(html, /Tranh đang được vẽ lại theo bản Art Direction 2\.1/);
});

test("34 truyện và 78 chi tiết giữ URL; breadcrumb dẫn về đúng bảo tàng", async () => {
  const chapters = JSON.parse(await read("data/lncq-chapters.json"));
  const history = main(await routeHtml("/la-bai/linh-nam-chich-quai/"));
  const index = history.match(/<ol class="mw-story-index">([\s\S]*?)<\/ol>/)?.[1] || "";
  assert.equal((index.match(/<li>/g) || []).length, 34);
  for (const chapter of chapters) {
    assert.ok(index.includes(`/la-bai/huyen-su/${chapter.slug}/`));
    const html = await routeHtml(`/la-bai/huyen-su/${chapter.slug}/`);
    assert.match(html, /href="\/la-bai\/linh-nam-chich-quai\/#truyen-nguon">Đủ 34 truyện<\/a>/);
  }
  assert.match(await routeHtml("/la-bai/the-star/"), /href="\/la-bai\/an-chinh\/">Về Ẩn Chính<\/a>/);
  const cards = JSON.parse(await read("seed/cards.json"));
  const sen = cards.find((card) => card.suit === "cups");
  assert.match(await routeHtml(`/la-bai/${sen.slug}/`), /href="\/la-bai\/an-phu\/sen\/">Về Nhà Sen<\/a>/);
});

test("sitemap chứa toàn bộ bảo tàng, mọi link nội bộ từ trang bảo tàng có đích", async () => {
  const sitemap = await read("dist/sitemap.xml");
  const paths = ["/la-bai/", "/la-bai/bo-suu-tap/", ...MUSEUM_ROOMS.flatMap((room) => [room.path, `${room.path}3d/`])];
  const destinations = new Set();
  for (const route of paths) {
    assert.ok(sitemap.includes(`huongdong.id.vn${route}</loc>`), route);
    const content = main(await routeHtml(route));
    for (const [, href] of content.matchAll(/\bhref="(\/[^"#?]*)(?:[^\"]*)"/g)) destinations.add(href);
  }
  for (const href of destinations) {
    await access(path.join(root, "dist", href, href.endsWith("/") ? "index.html" : ""));
  }
});

test("scene JSON mã hóa dấu nhỏ hơn và bản ghi hồ sơ được escape", () => {
  const card = { slug: "unsafe-test", arcana: "major", nameFolk: '</script><img src=x onerror="bad">', nameEn: "Test", museumIndex: "01", museumAccession: "Test", museumSource: "<source>", museumSummary: "<story>", searchText: "test", image: { url: "/assets/test.webp", alt: "<art>" }, thumbnail: { url: "/assets/test.webp", alt: "<art>" } };
  const pages = createMuseumPages([card], []);
  const html = pages.find((page) => page.path === "/la-bai/an-chinh/3d/").content;
  assert.ok(html.includes('"title":"\\u003c/script>\\u003cimg'));
  assert.doesNotMatch(html, /<img src=x/);
  const entry = pages.find((page) => page.path === "/la-bai/an-chinh/").content;
  assert.match(entry, /&lt;\/script&gt;&lt;img/);
});
