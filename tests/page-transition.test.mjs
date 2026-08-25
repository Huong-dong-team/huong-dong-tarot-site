import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("mọi trang công khai có đúng một container Swup", async () => {
  // Swup huỷ chuyến đi nếu container thiếu ở một trong hai đầu. Một trang quên
  // #noi-dung-chinh sẽ làm mọi link TỚI nó rơi về tải lại toàn trang mà không
  // báo gì — kiểu hỏng chỉ lộ ra khi có người bấm đúng vào đó.
  const pages = [
    "dist/index.html", "dist/la-bai/index.html", "dist/la-bai/the-star/index.html",
    "dist/la-bai-hom-nay/index.html", "dist/trai-bai/index.html", "dist/trai-bai/ba-la/index.html",
    "dist/huyen-su/index.html", "dist/healing/index.html", "dist/cua-hang/index.html",
    "dist/tin-tuc/index.html", "dist/tarot-la-gi/index.html", "dist/quyen-rieng-tu/index.html",
    "dist/404.html",
  ];
  for (const page of pages) {
    const html = await read(page);
    const containers = [...html.matchAll(/<main id="noi-dung-chinh"/g)];
    assert.equal(containers.length, 1, `${page}: phải có đúng một #noi-dung-chinh`);
    assert.match(html, /<main id="noi-dung-chinh" class="transition-page"/,
      `${page}: container phải mang lớp transition-page để Swup đo được thời lượng`);
  }
});

test("không trang nào còn nhúng cứng script tương tác ngoài điểm vào", async () => {
  // Thẻ <script> nằm ngoài container Swup không bao giờ chạy lại sau lần điều
  // hướng đầu tiên; nằm trong container thì bị cloneNode và cũng không chạy.
  // Cả hai đường đều dẫn tới một trang im lặng hỏng, nên chỉ điểm vào được phép.
  for (const page of ["dist/index.html", "dist/trai-bai/index.html", "dist/la-bai-hom-nay/index.html"]) {
    const html = await read(page);
    const sources = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => match[1].split("?")[0]);
    for (const source of sources) {
      assert.ok(
        ["/assets/js/site.js", "/assets/js/light-journey.js"].includes(source),
        `${page}: ${source} phải do page/registry.js nạp, không nhúng cứng`,
      );
    }
  }
});

test("bootstrap không import Swup tĩnh và có đường lui khi Swup hỏng", async () => {
  const source = await read("public/assets/js/page-transition/bootstrap.js");
  assert.doesNotMatch(source, /^import .*swup\.mjs/m,
    "import tĩnh mà lỗi sẽ kéo chết cả module, mất luôn menu và nội dung tương tác");
  assert.match(source, /import\("\/assets\/vendor\/swup\.mjs"\)/);
  assert.match(source, /initMenu\(\);\s*\nstartPage\(\);/,
    "menu và module của trang phải dựng trước khi thử bật Swup");
  assert.match(source, /bootSwup\(\)\.catch\(/, "Swup hỏng thì link phải quay về điều hướng trình duyệt");
});

test("link không thuộc phạm vi chuyển cảnh bị loại đúng", async () => {
  const source = await read("public/assets/js/page-transition/bootstrap.js");
  assert.match(source, /url\.startsWith\("\/admin"\)/, "trang admin là ứng dụng riêng, không có container");
  assert.match(source, /data-no-swup/, "phải có cửa thoát thủ công cho từng link");
  assert.match(source, /pdf\|zip\|mp3/, "link tải tệp phải để trình duyệt xử lý");
});

test("vòng đời dọn trước khi thay DOM và dựng lại sau", async () => {
  const source = await read("public/assets/js/page-transition/lifecycle.js");
  // Thứ tự này là toàn bộ lý do registry tồn tại. Dọn SAU khi DOM đã đổi thì
  // hàm huỷ chỉ còn nắm những phần tử đã bị gỡ, và listener cũ ở lại vĩnh viễn.
  const visitStart = source.indexOf('swup.hooks.on("visit:start"');
  const contentReplace = source.indexOf('swup.hooks.on("content:replace"');
  assert.ok(visitStart > 0 && contentReplace > visitStart);
  assert.match(source, /const onVisitStart = \(\) => stopPage\(\)/);
  assert.match(source, /const onContentReplace = \(\) => \{ startPage\(\); \}/);
  assert.match(source, /main\.focus\(\{ preventScroll: true \}\)/, "phải trả tiêu điểm về nội dung");
  assert.match(source, /aria-live/, "phải báo trang mới cho trình đọc màn hình");
});

test("registry gọi hàm huỷ và không dựng hai lần trên cùng một trang", async () => {
  const source = await read("public/assets/js/page/registry.js");
  assert.match(source, /export async function startPage/);
  assert.match(source, /export function stopPage/);
  assert.match(source, /generation \+= 1/, "import() về trễ không được gắn vào trang đã đổi");
  assert.match(source, /teardowns = \[\];[\s\S]*for \(const teardown of pending\)/);
  assert.match(source, /catch \(error\)/, "một module hỏng không được chặn cả trang");
});

test("mọi module giao diện xuất init trả về hàm huỷ", async () => {
  const dir = path.join(root, "public/assets/js/ui");
  const names = (await readdir(dir)).filter((name) => name.endsWith(".js"));
  assert.ok(names.length >= 6);
  for (const name of names) {
    const source = await readFile(path.join(dir, name), "utf8");
    assert.match(source, /export function init\(/, `${name} phải có init()`);
    assert.match(source, /return \(\) =>|return \{|return function destroy/,
      `${name} phải trả về đường dọn dẹp`);
  }
});

test("analytics chỉ bắn page_view ở hook page:view", async () => {
  const source = await read("public/assets/js/page-transition/analytics.js");
  // gtag('config') trong <head> đã ghi page_view cho lần tải đầu. page:view của
  // Swup không chạy cho lần tải đầu, nên ghép lại là đúng một lần mỗi trang.
  assert.match(source, /swup\.hooks\.on\("page:view", handler\)/);
  assert.match(source, /gtag\("event", "page_view"/);
  assert.doesNotMatch(source, /googletagmanager|createElement\("script"\)/,
    "không được tự nạp gtag.js, snippet trong <head> đã cố ý trì hoãn nó");
});

test("chuyển cảnh chỉ động tới transform, opacity và filter", async () => {
  const css = await read("public/assets/css/page-transition.css");
  // Ba thuộc tính này chạy trên compositor. Bất cứ thứ gì khác đều buộc trình
  // duyệt tính lại layout giữa lúc chuyển trang và đổ thẳng vào CLS.
  const animated = [...css.matchAll(/transition:\s*([^;]+);/g)].map((match) => match[1]);
  for (const block of animated) {
    for (const property of block.split(",").map((part) => part.trim().split(/\s+/)[0])) {
      assert.ok(
        ["opacity", "transform", "filter", "none"].includes(property),
        `transition không được chạm tới ${property}`,
      );
    }
  }
  const keyframeBodies = [...css.matchAll(/@keyframes[^{]+\{([\s\S]*?)\n\}/g)].map((match) => match[1]);
  assert.ok(keyframeBodies.length >= 4);
  for (const body of keyframeBodies) {
    for (const [, property] of body.matchAll(/^\s*(?:from|to|\d+%)\s*\{([^}]*)\}/gm)) {
      for (const declaration of property.split(";")) {
        const name = declaration.split(":")[0].trim();
        if (!name) continue;
        assert.ok(["opacity", "transform", "filter"].includes(name), `@keyframes không được chạm tới ${name}`);
      }
    }
  }
});

test("chuyển cảnh tắt hẳn khi người dùng yêu cầu giảm chuyển động", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(block, /transition-duration:\s*1ms/,
    "0s không bắn transitionend nên Swup sẽ treo tới hết bộ đếm dự phòng");
  assert.match(block, /animation:\s*none\s*!important/);
  assert.match(block, /\.page-sweep\s*\{\s*display:\s*none/, "vệt sáng cũng phải tắt");
});

test("vệt sáng không chặn thao tác và không tạo tràn ngang", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const sweep = css.slice(css.indexOf(".page-sweep {"), css.indexOf(".page-sweep::before"));
  assert.match(sweep, /pointer-events:\s*none/,
    "lớp phủ trang trí không bao giờ được nuốt cú bấm, kể cả khi mạng chậm");
  assert.match(sweep, /contain:\s*layout paint/, "vệt chạy 280vw phải bị cắt trong khung của nó");
  assert.match(sweep, /position:\s*fixed/);
});

test("bundle Swup tự chứa và nằm trong ngân sách", async () => {
  const bundle = await read("public/assets/vendor/swup.mjs");
  assert.doesNotMatch(bundle, /from\s*"[^./"][^"]*"/, "bundle phải tự chứa, không còn bare specifier");
  assert.match(bundle, /version\s*=\s*"4\.9\.2"/);
  const size = (await stat(path.join(root, "public/assets/vendor/swup.mjs"))).size;
  assert.ok(size <= 32_000, `bundle Swup quá lớn: ${size} byte`);
});

test("không dùng đồng thời hai thư viện chuyển cảnh", async () => {
  const names = await readdir(path.join(root, "public/assets/vendor"));
  assert.ok(names.includes("swup.mjs"));
  for (const forbidden of ["barba.mjs", "lenis.mjs", "keen-slider.mjs", "splide.mjs"]) {
    assert.ok(!names.includes(forbidden), `không được thêm ${forbidden} khi Swup đã đủ`);
  }
});

test("container không được đụng tới opacity trong pha đi vào", async () => {
  const css = await read("public/assets/css/page-transition.css");
  // Opacity của cha và con NHÂN với nhau. Bản đầu tiên cho container mờ 0.55
  // chồng lên section mờ 0, ra đúng 0 tuyệt đối: đo được 60ms màn hình trắng
  // ngay sau khi trang cũ biến mất. Việc hiện ra thuộc về section, không thuộc
  // về container.
  const pageIn = css.match(/@keyframes page-in \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(pageIn, "thiếu @keyframes page-in");
  assert.doesNotMatch(pageIn, /opacity/, "container chỉ được lo transform");
  const rule = css.match(/html\.is-changing\.is-rendering \.transition-page \{([^}]*)\}/)?.[1];
  assert.ok(rule);
  assert.doesNotMatch(rule, /opacity/);
});

test("nội dung hiện rõ ngay, không để lại khoảng trống sau khi trang cũ biến mất", async () => {
  const css = await read("public/assets/css/page-transition.css");
  for (const name of ["page-stagger", "page-stagger-back"]) {
    const body = css.match(new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1];
    assert.ok(body, `thiếu @keyframes ${name}`);
    // Mốc giữa đưa opacity về 1 sớm hơn nhiều so với lúc cú nâng kết thúc. Mắt
    // đọc "đã có nội dung chưa" bằng độ sáng, không bằng vị trí.
    assert.match(body, /^\s*45%\s*\{\s*opacity:\s*1;\s*\}/m,
      `${name} phải đủ sáng ở 45% chặng đường`);
  }
});

test("ngân sách thời gian của tầng nội dung nằm gọn trong thời lượng Swup đo", async () => {
  const css = await read("public/assets/css/page-transition.css");
  // Swup chỉ đo .transition-page. Section nào chạy quá mốc đó sẽ bị gỡ lớp
  // .is-rendering giữa chừng và snap về trạng thái cuối — thấy rõ là một cú giật.
  const pageIn = Number(css.match(/--page-in:\s*(\d+)ms/)?.[1]);
  const childDuration = Number(css.match(/animation: page-stagger (\d+)ms/)?.[1]);
  const delays = [...css.matchAll(/animation-delay:\s*(\d+)ms/g)].map((match) => Number(match[1]));
  assert.ok(pageIn > 0 && childDuration > 0 && delays.length >= 6);
  assert.ok(
    Math.max(...delays) + childDuration <= pageIn,
    `delay lớn nhất (${Math.max(...delays)}ms) + ${childDuration}ms phải ≤ ${pageIn}ms`,
  );
});
