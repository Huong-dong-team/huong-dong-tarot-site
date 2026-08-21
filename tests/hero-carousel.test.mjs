import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const home = () => readFile(path.join(root, "dist/index.html"), "utf8");

const TU_BAT_TU = [
  { slug: "strength", portrait: "tan-vien", name: "Tản Viên Sơn Thánh" },
  { slug: "the-chariot", portrait: "thanh-giong", name: "Thánh Gióng" },
  { slug: "the-hermit", portrait: "chu-dong-tu", name: "Chử Đồng Tử" },
  { slug: "the-star", portrait: "mau-lieu-hanh", name: "Mẫu Liễu Hạnh" },
];

test("carousel có đủ bốn vị Tứ Bất Tử, lá đầu hiện sẵn trong HTML tĩnh", async () => {
  const html = await home();
  // 5 slide: 1 ảnh hộp bài (mở đầu) + 4 vị Tứ Bất Tử.
  assert.equal((html.match(/data-hero-slide/g) || []).length, 5);
  // Slide đầu phải mang .is-active ngay trong HTML: nếu chỉ JS mới gán, khách
  // vào lúc script chưa chạy sẽ thấy hero trống.
  assert.match(html, /class="hero-card hero-card--pack is-active"/);
  assert.match(html, /hop-bai-portrait\.webp/, "slide mở đầu phải là ảnh hộp bài");
  for (const { portrait, name } of TU_BAT_TU) {
    assert.match(html, new RegExp(`immortals/${portrait}\\.webp`), `thiếu ảnh ${portrait}`);
    assert.match(html, new RegExp(name.replace(/\s/g, "\\s")), `thiếu tên ${name}`);
  }
  // Chỉ soi trong carousel: Âu Cơ vẫn hợp lệ ở lưới Thư viện nổi bật phía dưới,
  // chỗ phải gỡ là hero.
  const carousel = html.slice(html.indexOf("data-hero-carousel"), html.indexOf("data-hero-dots"));
  assert.doesNotMatch(carousel, /empress-au-co|major-03-the-empress/, "Âu Cơ đã được gỡ khỏi hero");
});

test("chỉ lá đầu tải sớm, ba lá sau để lazy", async () => {
  const html = await home();
  const carousel = html.slice(html.indexOf("data-hero-carousel"), html.indexOf("data-hero-dots"));
  const first = carousel.slice(0, carousel.indexOf("thanh-giong"));
  assert.match(first, /fetchpriority="high"/);
  assert.doesNotMatch(first, /loading="lazy"/);
  assert.equal((carousel.match(/loading="lazy"/g) || []).length, 3);
});

test("mỗi vị có bảng kể chuyện kèm nguồn và lối sang trang lá", async () => {
  const html = await home();
  assert.equal((html.match(/data-story-for=/g) || []).length, 4);
  for (const { slug } of TU_BAT_TU) {
    assert.match(html, new RegExp(`data-story-for="${slug}"`));
    assert.match(html, new RegExp(`href="/la-bai/${slug}/"`));
  }
  // Truyện phải có dẫn nguồn thư tịch, không phải chữ tạm chờ biên tập.
  assert.equal((html.match(/class="story-source"/g) || []).length, 4);
  assert.doesNotMatch(html, /đang được biên tập/, "vẫn còn chữ tạm trong bảng kể chuyện");
});

test("hero không còn ảnh trống đồng, chỉ giữ quầng sáng từ tâm mặt trời", async () => {
  const html = await home();
  const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf("data-hero-carousel"));
  // Ảnh trống đồng đã được gỡ khỏi hero theo yêu cầu thiết kế.
  assert.doesNotMatch(hero, /class="hero-drum"/, "ảnh trống đồng phải được gỡ khỏi hero");
  // Cụm mặt trời vẫn còn: quầng sáng và tia toả là nền của hiệu ứng cuộn.
  assert.match(hero, /data-hero-sun/, "vẫn phải giữ cụm mặt trời để có ánh sáng từ tâm");
  assert.doesNotMatch(hero, /drum-watermark/, "hero không dùng hoa văn chìm");
});

test("mục Tứ Bất Tử tĩnh có đủ số La Mã I–IV", async () => {
  const html = await home();
  const section = html.slice(html.indexOf('id="tu-bat-tu"'), html.indexOf('id="bon-nha"'));
  for (const roman of ["I", "II", "III", "IV"]) {
    assert.match(section, new RegExp(`<span class="immortal-roman">${roman}</span>`));
  }
  // Hình chim Lạc và ghi chú "Ấn cội nguồn" đã được gỡ theo yêu cầu thiết kế.
  assert.doesNotMatch(section, /lac-figure/, "khối chim Lạc phải được gỡ khỏi mục này");
  assert.doesNotMatch(section, /Ấn cội nguồn/, "ghi chú 'Ấn cội nguồn' phải được gỡ");
});

test("ảnh dùng ở màn hình đầu đủ nhẹ", async () => {
  // Ngưỡng giữ cho lần thay ảnh sau không vô tình đưa bản chưa nén trở lại.
  const files = [
    ["assets/img/trong-dong.png", 600],
    ["assets/img/chim-lac.png", 600],
    ...TU_BAT_TU.map(({ portrait }) => [`assets/img/immortals/${portrait}.webp`, 400]),
  ];
  for (const [file, limitKb] of files) {
    const { size } = await stat(path.join(root, "public", file));
    assert.ok(size < limitKb * 1024, `${file} nặng ${Math.round(size / 1024)} KB, vượt ngưỡng ${limitKb} KB`);
  }
});
