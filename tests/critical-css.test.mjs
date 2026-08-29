import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("critical CSS được nhúng và stylesheet thiết yếu không phụ thuộc callback", async () => {
  const html = await read("dist/index.html");
  const critical = html.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  assert.ok(critical.length > 8_000, "critical CSS bị thiếu hoặc quá ngắn");
  assert.ok(critical.length < 20_000, "critical CSS vượt ngân sách 20 KB");
  // Chỗ trắng của ba tệp nguồn phải được gộp trước khi nhúng. Không có bước này,
  // xuống dòng và thụt lề của bản viết-cho-người-đọc đi kèm MỌI trang: ~2,7 KB
  // mỗi lượt tải đầu, và ngân sách 20 KB chỉ còn ~800 ký tự để xoay xở.
  assert.doesNotMatch(critical, /\n/, "critical CSS phải được gộp dòng trước khi nhúng");
  assert.doesNotMatch(critical, / {2,}/, "critical CSS còn sót thụt lề");
  for (const marker of ["@font-face", ".site-header", ".hero-bg", ".hero-carousel", ".nav-sub"]) {
    assert.ok(critical.includes(marker), `critical CSS thiếu ${marker}`);
  }
  assert.match(critical, /\.subpage-artwork\s*\{[^}]*opacity:\s*0/,
    "critical CSS phải giữ tranh home-content ẩn cho tới lượt reveal");
  assert.match(critical, /\.subpage-hero-artwork\s*\{[^}]*position:\s*absolute[^}]*opacity:\s*0/,
    "tranh Hero eager phải được neo tuyệt đối và giữ ở frame đầu ngay trong critical CSS");
  // Trang chủ không dựng các khung trang trong. Nếu một selector dưới đây lọt
  // lại vào gói chung, 86 URL sẽ cùng trả giá cho CSS mà route `/` không dùng.
  for (const marker of [".page-hero", ".card-detail", ".v2-prose", ".post-detail", ".not-found"]) {
    assert.ok(!critical.includes(marker), `critical CSS trang chủ còn chứa ${marker}`);
  }
  for (const file of ["main", "lacquer-art", "page-transition"]) {
    const blocking = new RegExp(`<link rel="stylesheet" href="/assets/css/${file}\\.css\\?v=[0-9a-f]{8}">`);
    const deferred = new RegExp(`<link rel="stylesheet" href="/assets/css/${file}\\.css[^>]+media="print"`);
    assert.match(html, blocking, `${file}.css phải áp dụng mà không chờ inline onload`);
    assert.doesNotMatch(html, deferred, `${file}.css không được quay lại đường media=print`);
  }
  // landing-drag.css là tăng cường CSS thuần nên vẫn cần đường lui khi JS tắt.
  assert.match(html, /<noscript><link rel="stylesheet" href="\/assets\/css\/landing-drag\.css\?v=[0-9a-f]{8}"><\/noscript>/);
  assert.doesNotMatch(html, /<noscript>[^<]*(?:<link[^>]*>)*<link rel="stylesheet" href="\/assets\/css\/(?:main|lacquer-art)\.css/);
  assert.doesNotMatch(html, /<link rel="stylesheet" href="\/assets\/css\/fonts\.css/);
});

test("trang trong nhận đúng critical CSS theo loại nội dung", async () => {
  const card = await read("dist/la-bai/the-star/index.html");
  const spread = await read("dist/trai-bai/index.html");
  const cardCritical = card.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";
  const spreadCritical = spread.match(/<style data-critical>([\s\S]*?)<\/style>/)?.[1] || "";

  assert.ok(cardCritical.length < 20_000, "critical CSS trang lá vượt ngân sách 20 KB");
  assert.ok(spreadCritical.length < 20_000, "critical CSS trang nội dung vượt ngân sách 20 KB");
  for (const critical of [cardCritical, spreadCritical]) {
    assert.doesNotMatch(critical, /\n/, "critical CSS trang trong phải được gộp dòng");
    assert.ok(critical.includes(".page-hero"), "trang trong thiếu khung page hero");
    assert.match(critical, /font-family:\s*"Fontasia VH"/, "trang trong thiếu @font-face Fontasia cho page hero");
  }
  assert.ok(cardCritical.includes(".card-detail"), "trang lá thiếu khung card-detail");
  assert.ok(spreadCritical.includes(".v2-prose"), "trang nội dung thiếu khung v2-prose");
});

test("mỗi route preload đúng tranh Hero, home-content sau Hero không preload", async () => {
  const home = await read("dist/index.html");
  const card = await read("dist/la-bai/the-star/index.html");
  // Đúng MỘT preload, và nó phải đi qua cùng logic chọn ảnh với <img>. Preload
  // bằng href cố định (hoặc chia theo media) khiến hai bên chọn hai bản khác
  // nhau và trình duyệt tải cả hai: đo được 106 KB trên một điện thoại 375px
  // DPR 3 — preload bản 800w rồi srcset lại lấy bản 1200w.
  const preloads = [...home.matchAll(/<link rel="preload" as="image"[^>]*>/g)].map((match) => match[0]);
  assert.equal(preloads.length, 1, "chỉ được một preload ảnh hero");
  assert.match(preloads[0], /imagesrcset="[^"]*hero-800\.avif 800w[^"]*hero-1200\.avif 1200w[^"]*hero-1536\.avif 1536w"/);
  assert.match(preloads[0], /imagesizes="100vw"/);
  assert.doesNotMatch(preloads[0], /\bmedia=/, "chia theo media không biết được mật độ điểm ảnh của máy");
  // imagesizes phải khớp sizes của chính thẻ <img>, lệch nhau là chọn lệch bản.
  const heroImg = home.match(/<img class="hero-bg"[\s\S]*?>/)?.[0] || "";
  assert.match(heroImg, /sizes="100vw"/);
  const cardPreloads = [...card.matchAll(/<link rel="preload" as="image"[^>]*>/g)].map((match) => match[0]);
  assert.equal(cardPreloads.length, 1, "route lá chỉ preload một tranh Hero route");
  assert.match(cardPreloads[0], /subpage\/la-bai-1024\.avif 1024w/);
  assert.match(cardPreloads[0], /subpage\/la-bai-1536\.avif 1536w/);
  assert.doesNotMatch(card, /rel="preload" as="image"[^>]+\/hero-/);
  assert.doesNotMatch(home, /rel="preload" as="image"[^>]+home-content-/,
    "home-content nằm sau Hero nên không được tranh băng thông với LCP");
});

test("preload đúng font dùng ở màn hình đầu", async () => {
  const home = await read("dist/index.html");
  const card = await read("dist/la-bai/the-star/index.html");
  for (const font of [
    "be-vietnam-pro-700-vietnamese.woff2",
    "be-vietnam-pro-700.woff2",
  ]) {
    const pattern = new RegExp(`rel="preload" href="/assets/fonts/${font.replace(".", "\\.")}"`);
    assert.match(home, pattern);
    assert.match(card, pattern);
  }
  assert.match(home, /rel="preload" href="\/assets\/fonts\/fontasia-vh\.woff2"/);
  assert.match(home, /rel="preload" href="\/assets\/fonts\/inter-400-vietnamese\.woff2"/);
  assert.match(home, /rel="preload" href="\/assets\/fonts\/inter-400\.woff2"/);
  assert.doesNotMatch(home, /rel="preload" href="\/assets\/fonts\/dfvn-tan-harmoni\.woff2"/);
  assert.doesNotMatch(home, /rel="preload" href="\/assets\/fonts\/ganh-400(?:-italic)?\.woff2"/);
  assert.match(card, /rel="preload" href="\/assets\/fonts\/fontasia-vh\.woff2"/);
  assert.match(card, /rel="preload" href="\/assets\/fonts\/dfvn-tan-harmoni\.woff2"/);
  assert.doesNotMatch(card, /rel="preload" href="\/assets\/fonts\/ganh-400(?:-italic)?\.woff2"/);
  assert.doesNotMatch(home, /rel="preload" href="\/assets\/fonts\/(?:be-vietnam-pro-(?:400|600)|charm-)/);
});

test("font tiêu đề luôn thay font nhận diện sau khi tải xong", async () => {
  const fonts = await read("public/assets/css/custom-fonts.css");
  for (const family of ["Fontasia VH", "DFVN TAN Harmoni"]) {
    const face = fonts.match(new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"${family}";[^}]*\\}`, "s"))?.[0] || "";
    assert.ok(face, `thiếu @font-face của ${family}`);
    assert.match(face, /font-display:\s*swap/);
    assert.doesNotMatch(face, /font-display:\s*optional/);
  }
});

test("headline và subheadline của mọi subpage dùng Fontasia cùng màu vàng hiện tại", async () => {
  const [inner, main] = await Promise.all([
    read("public/assets/css/critical-inner.css"),
    read("public/assets/css/main.css"),
  ]);
  for (const [name, css] of [["critical-inner.css", inner], ["main.css", main]]) {
    const headline = css.match(/\.page-hero > h1\s*\{([\s\S]*?)\}/)?.[1] || "";
    const subheadline = css.match(/\.page-hero > p:not\(\.eyebrow\)\s*\{([\s\S]*?)\}/)?.[1] || "";
    assert.match(headline, /font-family:\s*var\(--script\)/, `${name}: headline subpage chưa dùng Fontasia`);
    assert.match(headline, /font-weight:\s*400/, `${name}: headline subpage không giữ Regular 400`);
    assert.match(headline, /color:\s*var\(--hero-lemon\)/, `${name}: headline subpage không giữ vàng hiện tại`);
    assert.match(subheadline, /font-family:\s*var\(--script\)/, `${name}: subheadline subpage chưa dùng Fontasia`);
    assert.match(subheadline, /font-weight:\s*400/, `${name}: subheadline subpage không giữ Regular 400`);
    assert.match(subheadline, /color:\s*var\(--hero-lemon\)/, `${name}: subheadline subpage không giữ vàng hiện tại`);
  }
});

test("đủ bốn họ font Việt hóa và các biến thể Ganh", async () => {
  const files = [
    "fontasia-vh.woff2",
    "inter-400-vietnamese.woff2",
    "inter-400.woff2",
    "dfvn-tan-harmoni.woff2",
    "dfvn-tan-mon-cheri.woff2",
    "ganh-100.woff2",
    "ganh-100-italic.woff2",
    "ganh-400.woff2",
    "ganh-400-italic.woff2",
  ];
  for (const file of files) {
    const info = await stat(path.join(root, "public", "assets", "fonts", file));
    assert.ok(info.size > 4_000, `${file} rỗng hoặc bị hỏng`);
  }

  const critical = await read("public/assets/css/critical.css");
  const main = await read("public/assets/css/main.css");
  assert.match(critical, /--display:\s*"DFVN TAN Harmoni"/);
  assert.match(critical, /--script:\s*"Fontasia VH"/);
  assert.match(critical, /--hero-ui:\s*"Inter"/);
  assert.match(main, /--sans-display:\s*"Ganh"/);
  assert.match(main, /--editorial:\s*"DFVN TAN Mon Cheri"/);
});
