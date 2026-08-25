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
  assert.match(html, /hop-bai-portrait[-.][\w.]+/, "slide mở đầu phải là ảnh hộp bài");
  for (const { portrait, name } of TU_BAT_TU) {
    // Không khoá định dạng: ảnh đã chuyển sang AVIF có hậu tố khổ
    // (tan-vien-800.avif). Điều cần bảo đảm là đúng chân dung, không phải đuôi file.
    assert.match(html, new RegExp(`immortals/${portrait}[-.][\\w.]+`), `thiếu ảnh ${portrait}`);
    assert.match(html, new RegExp(name.replace(/\s/g, "\\s")), `thiếu tên ${name}`);
  }
  // Chỉ soi trong carousel: Âu Cơ vẫn hợp lệ ở lưới Thư viện nổi bật phía dưới,
  // chỗ phải gỡ là hero.
  const carousel = html.slice(html.indexOf("data-hero-carousel"), html.indexOf("data-hero-dots"));
  assert.doesNotMatch(carousel, /empress-au-co|major-03-the-empress/, "Âu Cơ đã được gỡ khỏi hero");
});

test("năm ảnh carousel đều tải lười và không tranh tài nguyên với LCP", async () => {
  const html = await home();
  const carousel = html.slice(html.indexOf("data-hero-carousel"), html.indexOf("data-hero-dots"));
  assert.equal((carousel.match(/fetchpriority="high"/g) || []).length, 0);
  assert.equal((carousel.match(/loading="lazy"/g) || []).length, 5);
  assert.equal((carousel.match(/decoding="async"/g) || []).length, 5);
  const pack = carousel.slice(0, carousel.indexOf("data-story=\"strength\""));
  assert.match(pack, /data-pack/);
  assert.match(pack, /fetchpriority="low"/);
  assert.match(pack, /loading="lazy"/);
});

test("hero carousel có nút đi tới Lá bài hôm nay", async () => {
  const html = await home();
  // Canh ĐƯỜNG ĐI, không canh chữ. Bản trước ghi cứng cả câu h1 lẫn nhãn nút,
  // nên mọi lần sửa chữ tiếp thị đều làm đỏ một test về carousel — chỗ không
  // liên quan. Điều phải bảo đảm ở đây là hero luôn có một lối sang trang rút
  // lá trong ngày; viết nhãn thế nào là việc của nội dung.
  assert.match(html, /<h1>[^<]*(<br>)?[^<]*<\/h1>/, "hero phải có h1");
  assert.match(html, /class="button hero-daily-button" href="\/la-bai-hom-nay\/"/);
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

test("hero chỉ giữ nền tĩnh và không còn cụm mặt trời phụ", async () => {
  const html = await home();
  const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf("data-hero-carousel"));
  // Ảnh trống đồng đã được gỡ khỏi hero theo yêu cầu thiết kế.
  assert.doesNotMatch(hero, /class="hero-drum"/, "ảnh trống đồng phải được gỡ khỏi hero");
  assert.doesNotMatch(hero, /data-hero-sun/, "cụm mặt trời phụ phải được gỡ ở đợt hiệu năng");
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

test("dòng eyebrow của hero giữ chỗ đủ hai dòng trên màn hình hẹp", async () => {
  const [critical, main] = await Promise.all([
    readFile(path.join(root, "public/assets/css/critical.css"), "utf8"),
    readFile(path.join(root, "public/assets/css/main.css"), "utf8"),
  ]);
  // hero-carousel.js ghi lại dòng này mỗi 7 giây, mà năm chuỗi không dài bằng
  // nhau: một chuỗi vừa một dòng, bốn chuỗi "Tarot …" xuống hai dòng dưới ~400px.
  // Không giữ chỗ thì cứ 7 giây cả cột chữ bên dưới nhảy 15px — đo được CLS
  // 0,027 chỉ từ mỗi việc này, và nó tích luỹ suốt thời gian người đọc ở lại.
  assert.match(critical, /\.hero \.eyebrow \{ min-height: 2\.4em; \}/);
  assert.match(main, /\.hero \.eyebrow\{min-height:2\.4em\}/);
  // 2.4em phải khớp 2 dòng × line-height khai trong .eyebrow. Đổi line-height mà
  // quên chỗ này thì hoặc chừa thừa, hoặc chừa thiếu và CLS quay lại.
  const lineHeight = critical.match(/\.eyebrow \{[\s\S]*?font: 700 \d+px\/([\d.]+)/)?.[1];
  assert.equal(Number(lineHeight) * 2, 2.4, `line-height .eyebrow là ${lineHeight}, min-height phải là ${Number(lineHeight) * 2}em`);
});
