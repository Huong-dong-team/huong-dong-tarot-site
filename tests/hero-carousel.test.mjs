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
  assert.match(html, /<h1>[^<]*(<br>)?[^<]*<\/h1>/, "hero phải có h1");
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

test("Hero trang chủ giữ nguyên nội dung và dùng typography của mẫu HTML", async () => {
  const [html, critical, criticalInner, main] = await Promise.all([
    home(),
    read("public/assets/css/critical.css"),
    read("public/assets/css/critical-inner.css"),
    read("public/assets/css/main.css"),
  ]);

  assert.match(html, /<h1>Hường Đông kể Tarot<br>bằng câu chuyện Việt<\/h1>/,
    "headline phải giữ nguyên nội dung của website");
  assert.match(html, /<p class="hero-subheadline">Bộ Tarot 78 lá theo hệ Rider–Waite–Smith,[\s\S]*?chỉ thay hình ảnh để dễ nhớ\.<\/p>/,
    "subheadline phải giữ nguyên nội dung của website");
  assert.doesNotMatch(html, /Một bộ bài\. Một huyền sử\./,
    "câu của file mẫu chỉ được thêm ở trang Huyền sử, không thay copy trang chủ");

  // Critical và CSS đầy đủ phải cùng typography để không nhảy ngay lúc main.css
  // về: Harmoni serif nghiêng, in hoa, nét dày và nhịp dòng sít như file mẫu.
  for (const [ten, css] of [["critical.css", critical], ["main.css", main]]) {
    const clamps = [...css.matchAll(/\.home-page \.hero h1[^{]*\{[^}]*font-size:\s*clamp\(([^)]*)\)/g)]
      .map((match) => match[1].split(",").map((part) => parseFloat(part)));
    assert.equal(clamps.length, 2, `${ten}: khẩu hiệu phải có đúng hai cỡ — rộng và hẹp`);
    const [rong, hep] = clamps.sort((a, b) => b[2] - a[2]);
    assert.deepEqual(rong, [86, 9.4, 132], `${ten}: sai cỡ headline rộng`);
    assert.deepEqual(hep, [68, 18.5, 94], `${ten}: sai cỡ headline hẹp`);

    const headline = css.match(/\.home-page \.hero h1 \{([\s\S]*?)\}/)?.[1] || "";
    assert.match(headline, /font-family:\s*var\(--display\)/, `${ten}: headline chưa dùng Harmoni`);
    assert.match(headline, /font-style:\s*italic/, `${ten}: headline chưa nghiêng như mẫu`);
    assert.match(headline, /font-weight:\s*900/, `${ten}: headline chưa đủ dày`);
    assert.match(headline, /line-height:\s*\.94/, `${ten}: sai nhịp dòng headline`);
    assert.match(headline, /letter-spacing:\s*\.035em/, `${ten}: sai khoảng chữ headline`);
    assert.match(headline, /text-transform:\s*uppercase/, `${ten}: headline chưa in hoa như mẫu`);
    assert.match(headline, /-webkit-text-stroke:\s*\.25px currentColor/, `${ten}: thiếu nét dày nhẹ`);
    assert.match(css, /--hero-lemon:\s*#FEDB44/i, `${ten}: thiếu token vàng chanh #FEDB44`);
    assert.match(headline, /color:\s*var\(--hero-lemon\)/, `${ten}: headline chưa giữ màu thương hiệu`);
  }

  const shadow = main.match(/\.hero h1 \{([\s\S]*?)\}/)?.[1] || "";
  assert.match(shadow, /text-shadow:[\s\S]*0 1\.5px 0 rgb\(43 27 18 \/ 64%\)[\s\S]*0 5px 16px rgb\(43 27 18 \/ 26%\)/,
    "headline phải dùng hai lớp bóng nhẹ mới");
  assert.doesNotMatch(shadow, /-1px -1px|94%/, "không được khôi phục viền bóng tối bao kín bốn phía");

  for (const [ten, selector, css] of [
    ["critical.css", /\.hero-subheadline \{([\s\S]*?)\}/, critical],
    ["main.css", /\.home-page \.hero-subheadline \{([\s\S]*?)\}/, main],
  ]) {
    const subheadline = css.match(selector)?.[1] || "";
    assert.match(subheadline, /font-family:\s*Georgia/, `${ten}: subheadline chưa dùng serif như mẫu`);
    assert.match(subheadline, /max-width:\s*34ch/, `${ten}: subheadline chưa bó chiều dài đọc`);
    assert.match(subheadline, /line-height:\s*1\.72/, `${ten}: sai nhịp dòng subheadline`);
    assert.match(subheadline, /color:\s*var\(--ink-soft\)/, `${ten}: subheadline chưa về màu phụ`);
    assert.match(subheadline, /text-shadow:\s*none/, `${ten}: subheadline còn bóng phủ`);
  }

  for (const [ten, css] of [["critical.css", critical], ["main.css", main]]) {
    const cover = css.match(/\.hero-product \{([\s\S]*?)\}/)?.[1] || "";
    assert.match(cover, /0 14px 34px rgb\(139 99 57 \/ 9%\)/, `${ten}: bóng cover chưa được giảm`);
    assert.doesNotMatch(cover, /var\(--shadow\)/, `${ten}: cover còn dùng bóng card nặng cũ`);
  }

  for (const [ten, css] of [["critical-inner.css", criticalInner], ["main.css", main]]) {
    assert.match(css, /\.page-hero > h1\s*\{[\s\S]*?font-size:\s*clamp\(65px,\s*9\.1vw,\s*117px\)/,
      `${ten}: Headline trang trong chưa tăng đúng 30% ở khung rộng`);
    assert.match(css, /@media\s*\(max-width:\s*620px\)[\s\S]*?\.page-hero > h1\s*\{\s*font-size:\s*63\.7px/,
      `${ten}: Headline trang trong chưa tăng đúng 30% trên mobile`);
    assert.match(css, /\.page-hero > p:not\(\.eyebrow\)\s*\{[\s\S]*?color:\s*var\(--hero-lemon\)/,
      `${ten}: Subheadline trang trong chưa dùng vàng chanh`);
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
