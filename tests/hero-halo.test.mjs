import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("hero-halo.css được nạp trong _layout.html", async () => {
  const layout = await read("templates/_layout.html");
  assert.match(layout, /<link rel="stylesheet" href="\/assets\/css\/hero-halo\.css">/);
});

test(".lacquer-halo là phần tử anh em với khung ảnh, không phải con của nó", async () => {
  // Khung ảnh (.hero-product, .pack-image-frame) có overflow:hidden. Quầng hào
  // quang phải toả ra NGOÀI khung; đặt nó bên trong sẽ bị cắt mất phần tràn ra.
  const home = await read("dist/index.html");

  const heroStage = home.match(/<div class="hero-stage">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
  assert.ok(heroStage, "không tìm thấy .hero-stage trong trang chủ");
  const heroHaloIdx = heroStage.indexOf('class="lacquer-halo"');
  const heroFigureIdx = heroStage.indexOf("<figure");
  assert.ok(heroHaloIdx >= 0 && heroFigureIdx >= 0);
  assert.ok(heroHaloIdx < heroFigureIdx, "hero: .lacquer-halo phải đứng trước <figure> làm anh em");
  assert.ok(!heroStage.slice(heroFigureIdx).includes('class="lacquer-halo"'), "hero: .lacquer-halo lọt vào trong <figure>.hero-product");

  const packFrame = home.match(/<div class="pack-image-frame">([\s\S]*?)<\/div>\s*<figcaption>/)?.[1];
  assert.ok(packFrame, "không tìm thấy .pack-image-frame trong trang chủ");
  const packHaloIdx = packFrame.indexOf('class="lacquer-halo"');
  const packTiltIdx = packFrame.indexOf('class="pack-image-tilt');
  assert.ok(packHaloIdx >= 0 && packTiltIdx >= 0);
  assert.ok(packHaloIdx < packTiltIdx, "pack: .lacquer-halo phải đứng trước .pack-image-tilt làm anh em");
});

test(".lacquer-tilt tách khỏi phần tử đang có animation entrance", async () => {
  // .hero-carousel là chủ sở hữu transform của animation entrance
  // (page-transition.css, animation: hero-art-in ... both). Một animation
  // fill-mode:both giữ transform cuối của nó ở mức ưu tiên cao hơn một class
  // rule thường — đặt tilt liên tục lên CÙNG phần tử thì tilt sẽ không bao giờ
  // thấy chạy. .hero-product-tilt/.pack-image-tilt phải là phần tử con RIÊNG.
  const home = await read("dist/index.html");

  const figure = home.match(/<figure class="hero-carousel hero-product">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(figure, "không tìm thấy <figure class=\"hero-carousel hero-product\">");
  assert.match(figure, /<div class="hero-product-tilt lacquer-tilt">/);
  const picIdx = figure.indexOf("<picture");
  const tiltIdx = figure.indexOf('class="hero-product-tilt');
  assert.ok(tiltIdx >= 0 && tiltIdx < picIdx, "<picture> phải nằm trong .hero-product-tilt");

  assert.match(home, /<div class="pack-image-tilt lacquer-tilt">\s*<img/);
});

test("card-tilt.js nhận .lacquer-tilt, và trang chủ nạp module card-tilt", async () => {
  const cardTilt = await read("public/assets/js/ui/card-tilt.js");
  assert.match(cardTilt, /TARGET_SELECTOR\s*=\s*"[^"]*\.lacquer-tilt[^"]*"/);
  const registry = await read("public/assets/js/page/registry.js");
  const homeLine = registry.match(/home:\s*\[[^\]]*\]/)?.[0] ?? "";
  assert.match(homeLine, /"card-tilt"/, "trang chủ phải nạp card-tilt, nếu không .lacquer-tilt không bao giờ có hd-tilt-ready");
});

test("hào quang chỉ dùng token màu đã có sẵn, không thêm mã hex mới", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, "không được đưa màu hex mới vào — chỉ dùng var(--dau)/var(--gold)/...");
  assert.match(css, /var\(--dau\)/, "quầng đỏ son phải dùng token --dau đã có");
  assert.match(css, /var\(--gold\)/, "tia vàng phải dùng token --gold đã có");
});

test("hiệu ứng sáng thêm khi nghiêng đặt trên .lacquer-halo, không đè lên ::before/::after đang có animation riêng", async () => {
  // .lacquer-halo::before chạy lacquer-halo-breathe (animation opacity/
  // transform liên tục); ::after chạy lacquer-halo-rotate. Một animation ĐANG
  // CHẠY luôn thắng một class rule thường trên CÙNG thuộc tính của CÙNG phần
  // tử — set opacity/transform cho ::before ở một rule :has() khác sẽ lặng lẽ
  // vô tác dụng suốt lúc animation còn chạy. Rule :has() phải nhắm vào
  // .lacquer-halo (cha) để tạo một tầng compositing riêng.
  //
  // Regex gốc bắt chữ ".lacquer-stage" — một lớp chưa từng được gắn vào phần
  // tử nào trong home.html, nên test cũ xanh trong khi hiệu ứng chưa từng
  // chạy được trên production. Đã sửa CSS sang gốc :has() thật
  // (.hero-stage/.pack-image-frame); nới regex để khớp bất kỳ gốc nào đứng
  // trước, miễn không phải ::before/::after.
  const css = await read("public/assets/css/hero-halo.css");
  const hasRule = css.match(/:has\([^)]*hd-tilt-active[^)]*\)\s*\.lacquer-halo\s*\{([^}]*)\}/);
  assert.ok(hasRule, "thiếu rule :has() dùng chung cho .lacquer-halo");
  assert.match(css, /\.hero-stage:has\([^)]*hd-tilt-active[^)]*\)\s*\.lacquer-halo/,
    "rule phải neo vào .hero-stage — phần tử cha THẬT trong home.html");
  assert.match(css, /\.pack-image-frame:has\([^)]*hd-tilt-active[^)]*\)\s*\.lacquer-halo/,
    "rule phải neo vào .pack-image-frame — phần tử cha THẬT trong home.html");
  assert.doesNotMatch(css, /:has\([^)]*hd-tilt-active[^)]*\)\s*\.lacquer-halo::(before|after)/,
    ":has() không được nhắm vào ::before/::after — hai pseudo-element đó đã có animation riêng chạy liên tục");
});

test("hai animation của hào quang chỉ chạy khi không yêu cầu giảm chuyển động, và có nhánh tắt", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  const noPref = css.match(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(noPref, "thiếu khối no-preference bọc animation hào quang");
  assert.match(noPref, /lacquer-halo-breathe/);
  assert.match(noPref, /lacquer-halo-rotate/);
  const reduce = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(reduce, "thiếu khối reduce tắt animation hào quang và tilt");
  assert.match(reduce, /\.lacquer-halo::before,\s*\n\s*\.lacquer-halo::after\s*\{\s*\n\s*animation: none;/);
  assert.match(reduce, /\.lacquer-tilt\.hd-tilt-ready\s*\{\s*\n\s*transform: none;/);
});

test("quầng hào quang không đọc layout — chỉ position:absolute, không đóng góp CLS", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  const rule = css.match(/\n\.lacquer-halo \{([^}]*)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /position:\s*absolute/, ".lacquer-halo phải ra khỏi luồng layout bình thường");
});

test("khối chạm khắc dùng pseudo-element, không thêm phần tử HTML thừa cho phần viền", async () => {
  // Viền vát + đường chỉ vàng ăn theo layout đã có qua ::before/::after —
  // không cần bọc thêm div nào trong HTML cho riêng phần này (khác với
  // .lacquer-tilt, vốn cần là một phần tử THẬT vì lý do sở hữu transform).
  const css = await read("public/assets/css/hero-halo.css");
  const before = css.match(/\.hero-product::before,\s*\n\.pack-image-frame::before \{([^}]*)\}/)?.[1];
  const after = css.match(/\.hero-product::after,\s*\n\.pack-image-frame::after \{([^}]*)\}/)?.[1];
  assert.ok(before && after, "thiếu ::before/::after dùng chung cho khối chạm khắc");
  assert.match(before, /box-shadow/);
  assert.match(after, /border/);
});

test(".pack-image-frame khai border-radius khớp ảnh bên trong, để ::before/::after inherit đúng góc bo", async () => {
  // Không khai lại thì border-radius:inherit của pseudo-element đọc từ
  // .pack-image-frame (mặc định 0, vuông) trong khi ảnh thật bo 18px — viền
  // vát chạm khắc sẽ vuông lệch hẳn so với góc bo của chính tấm ảnh nó ôm.
  const css = await read("public/assets/css/hero-halo.css");
  const main = await read("public/assets/css/main.css");
  const imgRadius = main.match(/\.pack-figure img\s*\{[^}]*border-radius:\s*([\d.]+px)/)?.[1];
  assert.ok(imgRadius, "không đọc được border-radius của .pack-figure img trong main.css");
  // Có nhiều khối ".pack-image-frame { ... }" trong tệp (một khối chia sẻ
  // position:relative với .hero-stage, một khối riêng cho border-radius) —
  // ghép hết nội dung của TẤT CẢ các khối đó lại rồi mới tìm border-radius,
  // để không bắt nhầm khối đầu tiên (không có thuộc tính cần tìm).
  const frameRule = [...css.matchAll(/\.pack-image-frame\s*\{([^}]*)\}/g)].map((m) => m[1]).join("\n");
  assert.ok(frameRule, "thiếu rule .pack-image-frame");
  assert.match(frameRule, new RegExp(`border-radius:\\s*${imgRadius.replace(".", "\\.")}`),
    `.pack-image-frame phải khai border-radius:${imgRadius} khớp .pack-figure img`);
});

test("bố cục hai cột ≥1101px của #bao-bai vẫn kéo chiều cao ảnh xuống đủ qua lớp bọc mới", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  assert.match(css, /@media \(min-width: 1101px\) \{\s*\n\s*#bao-bai > \.pack-figure \.pack-image-tilt \{ height: 100%; \}/);
});

test("không khởi tạo hai lần trên cùng element: mỗi khung chỉ có đúng một .lacquer-halo và một .lacquer-tilt", async () => {
  const home = await read("dist/index.html");
  const haloCount = [...home.matchAll(/class="lacquer-halo"/g)].length;
  const tiltCount = [...home.matchAll(/class="[^"]*\blacquer-tilt\b[^"]*"/g)].length;
  assert.equal(haloCount, 2, "phải đúng hai quầng hào quang: hero + pack");
  assert.equal(tiltCount, 2, "phải đúng hai khối nghiêng: hero + pack");
});
