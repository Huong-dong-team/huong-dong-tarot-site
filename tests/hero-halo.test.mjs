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

test(".hero-halo là phần tử anh em với .hero-product, không phải con của nó", async () => {
  // .hero-product có overflow:hidden (main.css). Quầng hào quang phải toả ra
  // NGOÀI khung ảnh; đặt nó bên trong .hero-product sẽ bị cắt mất phần tràn ra.
  const home = await read("dist/index.html");
  const stage = home.match(/<div class="hero-stage">([\s\S]*?)<\/div>\s*<\/section>/)?.[1];
  assert.ok(stage, "không tìm thấy .hero-stage trong trang chủ");
  const haloIndex = stage.indexOf('class="hero-halo"');
  const figureIndex = stage.indexOf("<figure");
  assert.ok(haloIndex >= 0 && figureIndex >= 0);
  assert.ok(haloIndex < figureIndex, ".hero-halo phải đứng trước <figure> làm anh em, không phải con");
  // .hero-halo không được nằm trong phạm vi <figure>...</figure>
  const figureBlock = stage.slice(figureIndex);
  assert.ok(!figureBlock.includes('class="hero-halo"'), ".hero-halo lọt vào bên trong <figure>.hero-product — sẽ bị overflow:hidden cắt mất");
});

test(".hero-product-tilt tách khỏi .hero-carousel/.hero-product để không tranh transform với entrance", async () => {
  // .hero-carousel là chủ sở hữu transform của animation entrance
  // (page-transition.css, animation: hero-art-in ... both). Một animation
  // fill-mode:both giữ transform cuối của nó ở mức ưu tiên cao hơn một class
  // rule thường — đặt tilt liên tục lên CÙNG phần tử thì tilt sẽ không bao giờ
  // thấy chạy. .hero-product-tilt phải là một phần tử con RIÊNG.
  const home = await read("dist/index.html");
  const figure = home.match(/<figure class="hero-carousel hero-product">([\s\S]*?)<\/figure>/)?.[1];
  assert.ok(figure, "không tìm thấy <figure class=\"hero-carousel hero-product\">");
  assert.match(figure, /<div class="hero-product-tilt">/);
  const pictureIndex = figure.indexOf("<picture");
  const tiltDivIndex = figure.indexOf('class="hero-product-tilt"');
  assert.ok(tiltDivIndex >= 0 && tiltDivIndex < pictureIndex, "<picture> phải nằm trong .hero-product-tilt");
});

test("card-tilt.js nhận .hero-product-tilt, và trang chủ nạp module card-tilt", async () => {
  const cardTilt = await read("public/assets/js/ui/card-tilt.js");
  assert.match(cardTilt, /TARGET_SELECTOR\s*=\s*"[^"]*\.hero-product-tilt[^"]*"/);
  const registry = await read("public/assets/js/page/registry.js");
  const homeLine = registry.match(/home:\s*\[[^\]]*\]/)?.[0] ?? "";
  assert.match(homeLine, /"card-tilt"/, "trang chủ phải nạp card-tilt, nếu không .hero-product-tilt không bao giờ có hd-tilt-ready");
});

test("hào quang chỉ dùng token màu đã có sẵn, không thêm mã hex mới", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, "không được đưa màu hex mới vào — chỉ dùng var(--dau)/var(--gold)/...");
  assert.match(css, /var\(--dau\)/, "quầng đỏ son phải dùng token --dau đã có");
  assert.match(css, /var\(--gold\)/, "tia vàng phải dùng token --gold đã có");
});

test("hiệu ứng sáng thêm khi nghiêng đặt trên .hero-halo, không đè lên ::before/::after đang có animation riêng", async () => {
  // .hero-halo::before chạy hero-halo-breathe (animation opacity/transform liên
  // tục); .hero-halo::after chạy hero-halo-rotate. Một animation ĐANG CHẠY luôn
  // thắng một class rule thường trên CÙNG thuộc tính của CÙNG phần tử — set
  // opacity/transform cho ::before ở một rule :has() khác sẽ lặng lẽ vô tác
  // dụng suốt lúc animation còn chạy. Rule :has() phải nhắm vào .hero-halo (cha)
  // để tạo một tầng compositing riêng, không tranh chấp với hai pseudo-element.
  const css = await read("public/assets/css/hero-halo.css");
  const hasRule = css.match(/\.hero-stage:has\([^)]*hd-tilt-active[^)]*\)\s*\.hero-halo\s*\{([^}]*)\}/);
  assert.ok(hasRule, "thiếu rule :has() cho .hero-halo");
  assert.doesNotMatch(css, /:has\([^)]*hd-tilt-active[^)]*\)\s*\.hero-halo::(before|after)/,
    ":has() không được nhắm vào ::before/::after — hai pseudo-element đó đã có animation riêng chạy liên tục");
});

test("hai animation của hào quang chỉ chạy khi không yêu cầu giảm chuyển động, và có nhánh tắt", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  const noPref = css.match(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(noPref, "thiếu khối no-preference bọc animation hào quang");
  assert.match(noPref, /hero-halo-breathe/);
  assert.match(noPref, /hero-halo-rotate/);
  const reduce = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(reduce, "thiếu khối reduce tắt animation hào quang và tilt");
  assert.match(reduce, /\.hero-halo::before,\s*\n\s*\.hero-halo::after\s*\{\s*\n\s*animation: none;/);
  assert.match(reduce, /\.hero-product-tilt\.hd-tilt-ready\s*\{\s*\n\s*transform: none;/);
});

test("quầng hào quang không đọc layout — chỉ position:absolute, không đóng góp CLS", async () => {
  const css = await read("public/assets/css/hero-halo.css");
  const rule = css.match(/\n\.hero-halo \{([^}]*)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /position:\s*absolute/, ".hero-halo phải ra khỏi luồng layout bình thường");
});

test("khối chạm khắc dùng pseudo-element, không thêm phần tử HTML thừa", async () => {
  // Viền vát + đường chỉ vàng ăn theo layout đã có của .hero-product qua
  // ::before/::after — không cần bọc thêm div nào trong HTML cho riêng phần
  // này (khác với .hero-product-tilt, vốn cần là một phần tử THẬT vì lý do
  // sở hữu transform, không thể làm bằng pseudo-element).
  const css = await read("public/assets/css/hero-halo.css");
  const before = css.match(/\.hero-product::before \{([^}]*)\}/)?.[1];
  const after = css.match(/\.hero-product::after \{([^}]*)\}/)?.[1];
  assert.ok(before && after, "thiếu ::before/::after cho khối chạm khắc");
  assert.match(before, /box-shadow/);
  assert.match(after, /border/);
});
