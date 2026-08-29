import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const home = () => readFile(path.join(root, "dist/index.html"), "utf8");
const read = (file) => readFile(path.join(root, file), "utf8");

const TU_BAT_TU = [
  { slug: "strength", portrait: "tan-vien", name: "Tản Viên Sơn Thánh" },
  { slug: "the-chariot", portrait: "thanh-giong", name: "Thánh Gióng" },
  { slug: "the-hermit", portrait: "chu-dong-tu", name: "Chử Đồng Tử" },
  { slug: "the-star", portrait: "mau-lieu-hanh", name: "Mẫu Liễu Hạnh" },
];

// Lớp .hero-carousel còn là neo chuyển cảnh/bố cục; hook data và JavaScript đã
// được gỡ khi ảnh sản phẩm tĩnh thay lá kể chuyện.
const heroStage = (html) =>
  html.slice(html.indexOf('<div class="hero-stage">'), html.indexOf("</section>", html.indexOf('<div class="hero-stage">')));

test("Hero dùng đúng ảnh sản phẩm tĩnh và các nguồn responsive", async () => {
  const html = await home();
  const stage = heroStage(html);
  assert.match(stage, /class="hero-carousel hero-product"/);
  assert.match(stage, /hero-product-square-480\.avif 480w[^\"]*hero-product-square-1200\.avif 1200w/);
  assert.match(stage, /src="\/assets\/img\/hero-product-square-1200\.webp"/);
  assert.match(stage, /width="1200" height="1200"/, "fallback phải khai đúng tỉ lệ crop vuông");
  assert.doesNotMatch(stage, /data-hero-slide|data-story|immortals\//,
    "ảnh sản phẩm không được giữ hook hoặc nội dung kể chuyện của lá cũ");
});

test("ảnh sản phẩm không nạp JavaScript carousel cũ", async () => {
  const [html, registry, main, critical] = await Promise.all([
    home(),
    read("public/assets/js/page/registry.js"),
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
  ]);
  assert.doesNotMatch(html, /data-hero-carousel|data-hero-slide|data-hero-dots|data-hero-eyebrow/);
  assert.doesNotMatch(registry, /home:\s*\[[^\]]*hero-carousel/,
    "trang chủ không được tải module tương tác khi Hero chỉ còn ảnh tĩnh");
  assert.doesNotMatch(registry, /"hero-carousel":\s*\(\)\s*=>\s*import/);
  for (const [ten, css] of [["main.css", main], ["critical.css", critical]]) {
    assert.doesNotMatch(css, /\.hero-dots/, `${ten}: CSS chấm điều hướng phải đi cùng markup`);
  }
});

test("nghiêng theo chuột đã được gỡ để entrance làm chủ transform của khung", async () => {
  const [registry, main, critical] = await Promise.all([
    read("public/assets/js/page/registry.js"),
    read("public/assets/css/main.css"),
    read("public/assets/css/critical.css"),
  ]);
  // page-transition.css nay chạy hero-art-in trên .hero-carousel. Nếu hero-tilt
  // còn sống, nó ghi transform inline lên đúng phần tử đó và một trong hai bên
  // sẽ bị nuốt — kiểu hỏng chỉ lộ ra trên máy có chuột.
  assert.doesNotMatch(registry, /hero-tilt/);
  await assert.rejects(stat(path.join(root, "public/assets/js/ui/hero-tilt.js")));
  for (const [ten, css] of [["main.css", main], ["critical.css", critical]]) {
    assert.doesNotMatch(css, /\.hero-stage[^{]*\{[^}]*perspective/, `${ten}: còn perspective của hero-tilt`);
  }
  assert.doesNotMatch(main, /\.hero-carousel\s*\{[^}]*transform-style/);
});

test("tranh Hero không tranh băng thông với ảnh LCP", async () => {
  const html = await home();
  const stage = heroStage(html);
  // hero-bg là ảnh được preload và là ứng viên LCP. Bức trong khung nạp sớm để
  // hai cột cùng hiện, nhưng phải xếp sau ở hàng đợi ưu tiên.
  assert.match(stage, /fetchpriority="low"/);
  assert.match(stage, /decoding="async"/);
  assert.doesNotMatch(stage, /fetchpriority="high"/);
  assert.match(stage, /srcset="[^"]*hero-product-square-480\.avif 480w[^"]*hero-product-square-1200\.avif 1200w"/);
  assert.match(stage, /sizes="/, "thiếu sizes thì srcset chọn theo 100vw và luôn lấy bản lớn");
});

test("hero có nút đi tới Lá bài hôm nay", async () => {
  const html = await home();
  // Canh ĐƯỜNG ĐI, không canh chữ. Bản trước ghi cứng cả câu h1 lẫn nhãn nút,
  // nên mọi lần sửa chữ tiếp thị đều làm đỏ một test về carousel — chỗ không
  // liên quan. Điều phải bảo đảm ở đây là hero luôn có một lối sang trang rút
  // lá trong ngày; viết nhãn thế nào là việc của nội dung.
  assert.match(html, /<h1>Hường Đông kể Tarot<br>bằng <span class="hero-headline-accent">câu chuyện Việt<\/span><\/h1>/,
    "hero phải giữ headline và span nhấn coral");
  assert.match(html, /class="button hero-daily-button" href="\/la-bai-hom-nay\/"/);
});

test("ảnh sản phẩm không giữ dialog kể chuyện sai ngữ cảnh", async () => {
  const html = await home();
  const stage = heroStage(html);
  assert.doesNotMatch(stage, /<dialog|data-story-for|data-story-close/);
  // Các truyện không mất khỏi trang: mục #tu-bat-tu vẫn dẫn sang trang lá.
  for (const { slug } of TU_BAT_TU) {
    assert.match(html, new RegExp(`href="/la-bai/${slug}/"`), `thiếu lối sang lá ${slug}`);
  }
});

test("hero chỉ giữ nền tĩnh và không còn cụm mặt trời phụ", async () => {
  const html = await home();
  const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf('<div class="hero-stage">'));
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
  for (const { portrait } of TU_BAT_TU) {
    assert.match(section, new RegExp(`immortals/${portrait}[-.][\\w.]+`), `thiếu ảnh ${portrait}`);
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
  // Bản 960w thường được chọn ở desktop tiêu chuẩn; giữ dưới 100 KB để ảnh sản
  // phẩm rõ hơn nhưng không làm chậm màn hình đầu.
  const { size } = await stat(path.join(root, "public/assets/img/hero-product-square-960.avif"));
  assert.ok(size < 100 * 1024, `ảnh sản phẩm Hero nặng ${Math.round(size / 1024)} KB`);
});

test("dòng eyebrow của hero giữ chỗ đủ hai dòng trên màn hình hẹp", async () => {
  const [critical, main] = await Promise.all([
    read("public/assets/css/critical.css"),
    read("public/assets/css/main.css"),
  ]);
  // Dòng này là chữ tĩnh nhưng chỗ giữ vẫn cần: chuỗi
  // "Ấn phẩm · Bộ bài và hộp cứng" xuống hai dòng dưới ~400px, và nó
  // đổi số dòng đúng lúc font nhận diện swap vào — CLS y hệt, chỉ khác nguyên do.
  assert.match(critical, /\.hero \.eyebrow \{ min-height: 2\.4em; \}/);
  assert.match(main, /\.hero \.eyebrow\{min-height:2\.4em\}/);
  // 2.4em phải khớp 2 dòng × line-height khai trong .eyebrow. Đổi line-height mà
  // quên chỗ này thì hoặc chừa thừa, hoặc chừa thiếu và CLS quay lại.
  const lineHeight = critical.match(/\.eyebrow \{[\s\S]*?font: 700 \d+px\/([\d.]+)/)?.[1];
  assert.equal(Number(lineHeight) * 2, 2.4, `line-height .eyebrow là ${lineHeight}, min-height phải là ${Number(lineHeight) * 2}em`);
});

test("Hero trang chủ giữ nguyên copy và dùng Fontasia đúng bảng màu", async () => {
  const [html, critical, main] = await Promise.all([
    home(),
    read("public/assets/css/critical.css"),
    read("public/assets/css/main.css"),
  ]);

  assert.match(html, /<h1>Hường Đông kể Tarot<br>bằng <span class="hero-headline-accent">câu chuyện Việt<\/span><\/h1>/,
    "headline phải giữ nguyên copy và cấu trúc hiện tại");
  assert.match(html, /<div class="hero-panel">[\s\S]*?<p class="hero-subheadline">Bộ Tarot 78 lá theo hệ Rider–Waite–Smith,[\s\S]*?chỉ thay hình ảnh để dễ nhớ\.<\/p>[\s\S]*?<dl class="proof">/,
    "subheadline, CTA và stats phải nằm chung trong panel kính");
  assert.doesNotMatch(html, /THÔNG MINH|Một bộ bài\. Một huyền sử\./,
    "nội dung tham chiếu không được đưa vào Hero trang chủ");

  for (const [ten, css] of [["critical.css", critical], ["main.css", main]]) {
    assert.match(css, /--hero-champagne:\s*#C9A96E/i, `${ten}: thiếu champagne gold`);
    assert.match(css, /--hero-coral:\s*#C84040/i, `${ten}: thiếu coral`);
    assert.match(css, /--hero-yellow:\s*#F5C842/i, `${ten}: thiếu vàng CTA`);
    assert.match(css, /--hero-pearl:\s*#FAF8D0/i, `${ten}: thiếu ngọc trai`);
    assert.match(css, /--hero-warm-brown:\s*#3D2B1A/i, `${ten}: thiếu nâu body`);
    assert.match(css, /--hero-label:\s*#8B7355/i, `${ten}: thiếu nâu label`);
    assert.match(css, /grid-template-columns:\s*minmax\(0,\s*2fr\)\s*minmax\(0,\s*3fr\)/,
      `${ten}: Hero desktop chưa khóa tỷ lệ 40\/60`);
    assert.match(css, /font-family:\s*var\(--script\)/, `${ten}: headline chưa dùng Fontasia`);
    assert.match(css, /font-size:\s*clamp\(68px,\s*6\.6vw,\s*104px\)/, `${ten}: sai cỡ headline desktop`);
    assert.match(css, /font-size:\s*clamp\(52px,\s*14vw,\s*68px\)/, `${ten}: sai cỡ headline mobile`);
    assert.match(css, /\.hero h1[^}]*color:\s*var\(--hero-warm-brown\)[^}]*font-family:\s*var\(--script\)[^}]*-webkit-text-fill-color:\s*currentColor[^}]*-webkit-text-stroke:\s*0/s,
      `${ten}: headline phải là Fontasia nâu ấm, không còn stroke kim loại`);
    assert.match(css, /hero-headline-accent[^}]*color:\s*inherit[^}]*-webkit-text-fill-color:\s*currentColor/s,
      `${ten}: cụm câu chuyện Việt phải kế thừa cùng màu nâu ấm`);
    assert.match(css, /\.hero-subheadline[^}]*color:\s*var\(--hero-warm-brown\)[^}]*font-family:\s*var\(--script\)[^}]*font-size:\s*clamp\(27\.04px,\s*2\.1125vw,\s*30\.42px\)[^}]*-webkit-text-stroke:\s*0[^}]*text-shadow:\s*none/s,
      `${ten}: subheadline phải tăng thêm đúng 30%, dùng Fontasia nâu ấm và không stroke/bóng`);
    assert.match(css, /\.hero-panel[^}]*background:\s*#FFF8E7/s, `${ten}: thiếu fallback cream khi không có backdrop-filter`);
    assert.match(css, /backdrop-filter:\s*blur\(18px\) saturate\(115%\)/, `${ten}: thiếu frosted blur`);
  }
});

test("tagline mới chỉ xuất hiện ở hero trang Huyền sử", async () => {
  const [hub, chapter] = await Promise.all([
    read("dist/huyen-su/index.html"),
    read("dist/huyen-su/hong-bang-thi/index.html"),
  ]);
  assert.match(hub, /<p class="page-hero-tagline">Một bộ bài\. Một huyền sử\.<br>Một hành trình soi chiếu nội tâm\.<\/p>/);
  assert.match(hub, /Những câu chuyện từ Lĩnh Nam chích quái,[\s\S]*?nối vào 22 lá Ẩn chính\./,
    "mô tả Huyền sử hiện có phải được giữ lại");
  assert.doesNotMatch(chapter, /Một bộ bài\. Một huyền sử\./,
    "không nhân tagline sang 34 trang toàn văn");
});
