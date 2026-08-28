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
  // về: Ganh cũ, nghiêng, in hoa và nhịp dòng sít như file mẫu.
  for (const [ten, css] of [["critical.css", critical], ["main.css", main]]) {
    const clamps = [...css.matchAll(/\.home-page \.hero h1[^{]*\{[^}]*font-size:\s*clamp\(([^)]*)\)/g)]
      .map((match) => match[1].split(",").map((part) => parseFloat(part)));
    assert.equal(clamps.length, 2, `${ten}: khẩu hiệu phải có đúng hai cỡ — rộng và hẹp`);
    const [rong, hep] = clamps.sort((a, b) => b[2] - a[2]);
    assert.deepEqual(rong, [77.4, 8.46, 118.8], `${ten}: headline rộng chưa giảm đúng 10%`);
    assert.deepEqual(hep, [61.2, 16.65, 84.6], `${ten}: headline hẹp chưa giảm đúng 10%`);

    const headline = css.match(/\.home-page \.hero h1 \{([\s\S]*?)\}/)?.[1] || "";
    assert.match(headline, /font-family:\s*var\(--sans-display\)/, `${ten}: headline chưa dùng Ganh`);
    assert.match(headline, /font-style:\s*italic/, `${ten}: headline chưa nghiêng như mẫu`);
    assert.match(headline, /font-weight:\s*400/, `${ten}: headline chưa dùng đúng weight Ganh có sẵn`);
    assert.match(headline, /line-height:\s*\.94/, `${ten}: sai nhịp dòng headline`);
    assert.match(headline, /letter-spacing:\s*\.035em/, `${ten}: sai khoảng chữ headline`);
    assert.match(headline, /text-transform:\s*uppercase/, `${ten}: headline chưa in hoa như mẫu`);
    assert.match(headline, /-webkit-text-stroke:\s*\.7px rgb\(175 132 0 \/ 88%\)/, `${ten}: cạnh headline chưa dùng vàng tối #AF8400`);
    assert.match(css, /--hero-headline-gold:\s*#B18906/i, `${ten}: thiếu màu fallback headline #B18906`);
    assert.match(css, /--hero-bronze:\s*#B77A2F/i, `${ten}: thiếu token vàng đồng #B77A2F`);
    assert.match(headline, /color:\s*var\(--hero-headline-gold\)/, `${ten}: headline chưa dùng palette mới`);
    if (ten === "main.css") {
      assert.match(headline, /background-image:\s*var\(--hero-headline-metal\)/, `${ten}: headline thiếu dải vàng kim riêng`);
      assert.doesNotMatch(headline, /background-image:\s*var\(--hero-metal\)/,
        `${ten}: headline còn dùng chung palette của subheadline`);
      assert.match(headline, /background-clip:\s*text/, `${ten}: dải kim loại chưa được cắt theo thân chữ`);
      assert.match(css, /--hero-headline-metal:\s*linear-gradient\(112deg,\s*#B18906 0%,\s*#FAF8D0 28%,\s*#C69F24 49%,\s*#F1CA43 72%,\s*#AF8400 100%\)/i,
        `${ten}: dải headline chưa dùng đúng 5 màu và thứ tự từ ảnh tham chiếu`);
    }
  }

  const shadow = main.match(/\.hero h1 \{([\s\S]*?)\}/)?.[1] || "";
  assert.match(shadow, /text-shadow:[\s\S]*0 1px 0 rgb\(250 248 208 \/ 68%\)[\s\S]*0 2\.5px 0 rgb\(175 132 0 \/ 82%\)[\s\S]*0 7px 16px rgb\(177 137 6 \/ 38%\)/,
    "headline phải dùng chính palette mới cho sáng cạnh, cạnh tối và bóng khối");
  assert.doesNotMatch(shadow, /-1px -1px|94%/, "không được khôi phục viền bóng tối bao kín bốn phía");

  for (const [ten, selector, css] of [
    ["critical.css", /\.home-page \.hero \.hero-subheadline \{([\s\S]*?)\}/, critical],
    ["main.css", /\.home-page \.hero \.hero-subheadline \{([\s\S]*?)\}/, main],
  ]) {
    const subheadline = css.match(selector)?.[1] || "";
    assert.match(subheadline, /font-family:\s*var\(--sans-display\)/, `${ten}: subheadline chưa dùng Ganh`);
    assert.match(subheadline, /font-weight:\s*400/, `${ten}: subheadline chưa dùng đúng weight Ganh`);
    assert.match(subheadline, /font-size:\s*clamp\(15\.3px,\s*1\.35vw,\s*18px\)/,
      `${ten}: subheadline chưa giảm đúng 10%`);
    assert.match(subheadline, /max-width:\s*34ch/, `${ten}: subheadline chưa bó chiều dài đọc`);
    assert.match(subheadline, /line-height:\s*1\.72/, `${ten}: sai nhịp dòng subheadline`);
    assert.match(subheadline, /letter-spacing:\s*\.015em/, `${ten}: sai khoảng chữ subheadline`);
    assert.match(subheadline, /color:\s*var\(--hero-bronze\)/, `${ten}: subheadline chưa dùng vàng đồng`);
    assert.match(subheadline, /-webkit-text-stroke:\s*\.35px rgb\(83 45 18 \/ 86%\)/,
      `${ten}: subheadline thiếu cạnh dập nổi`);
    assert.match(subheadline, /text-shadow:[\s\S]*0 \.75px 0 rgb\(255 243 220 \/ 72%\)[\s\S]*0 1\.75px 0 rgb\(92 49 19 \/ 78%\)[\s\S]*0 4px 10px rgb\(79 45 19 \/ 34%\)/,
      `${ten}: subheadline thiếu sáng cạnh và bóng tạo khối`);
    if (ten === "main.css") {
      assert.match(subheadline, /background-image:\s*var\(--hero-metal\)/, `${ten}: subheadline thiếu dải màu kim loại`);
      assert.match(subheadline, /background-clip:\s*text/, `${ten}: dải kim loại subheadline chưa cắt theo chữ`);
    }
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
