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
  assert.match(source, /initMenu\(\);\s*\ninitAmbientSound\(\);\s*\nstartPage\(\);/,
    "điều khiển cố định và module của trang phải dựng trước khi thử bật Swup");
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
  // Không đòi phải có bao nhiêu @keyframes: animation cũ đã gỡ, bản mới chưa
  // viết. Chỉ ràng buộc rằng CÁI GÌ có mặt thì phải nằm trong ba thuộc tính này.
  const keyframeBodies = [...css.matchAll(/@keyframes[^{]+\{([\s\S]*?)\n\}/g)].map((match) => match[1]);
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
  assert.match(block, /animation:\s*none\s*!important/,
    "animation của tầng nội dung phải bị tắt, kể cả bản sẽ viết sau này");
  assert.match(block, /transform:\s*none\s*!important/);
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

/* Ba phép kiểm dưới đây canh cho animation chuyển cảnh SẼ được viết, không đòi
   hỏi phải có animation ngay bây giờ. Animation cũ đã bị gỡ vì nó đọc ra thành
   "chớp chớp"; ba cái bẫy nó từng rơi vào thì vẫn còn nguyên đó cho người viết
   bản mới, nên giữ lại dưới dạng có điều kiện. */

function docStagger(css) {
  const duration = Number(css.match(/animation: page-stagger (\d+)ms/)?.[1]);
  const delays = [...css.matchAll(/animation-delay:\s*(\d+)ms/g)].map((match) => Number(match[1]));
  return duration && delays.length ? { duration, delays } : null;
}

test("container không được đụng tới opacity trong pha đi vào", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const pageIn = css.match(/@keyframes page-in \{([\s\S]*?)\n\}/)?.[1];
  if (!pageIn) return; // chưa có animation container — không có gì để canh
  // Opacity của cha và con NHÂN với nhau. Bản đầu tiên cho container mờ 0.55
  // chồng lên section mờ 0, ra đúng 0 tuyệt đối: đo được 60ms màn hình trắng
  // ngay sau khi trang cũ biến mất.
  assert.doesNotMatch(pageIn, /opacity/, "container chỉ được lo transform");
});

test("nội dung phải sáng đủ sớm, không để lại khoảng trống", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const stagger = docStagger(css);
  if (!stagger) return; // chưa có animation tầng nội dung
  for (const name of ["page-stagger", "page-stagger-back"]) {
    const body = css.match(new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1];
    if (!body) continue;
    const moc = Number(body.match(/^\s*(\d+)%\s*\{\s*opacity:\s*1;\s*\}/m)?.[1]);
    assert.ok(moc > 0, `${name} thiếu mốc opacity đầy`);
    const msDenKhiSang = Math.round(stagger.duration * moc / 100);
    assert.ok(msDenKhiSang <= 170,
      `${name} sáng đủ sau ${msDenKhiSang}ms, quá muộn — hạ mốc phần trăm xuống`);
  }
});

test("ngân sách thời gian của tầng nội dung nằm gọn trong thời lượng Swup đo", async () => {
  const css = await read("public/assets/css/page-transition.css");
  const stagger = docStagger(css);
  if (!stagger) return;
  // Swup chỉ đo .transition-page. Section nào chạy quá mốc đó sẽ bị gỡ lớp
  // .is-rendering giữa chừng và snap về trạng thái cuối — thấy rõ là một cú giật.
  const pageIn = Number(css.match(/--page-in:\s*(\d+)ms/)?.[1]);
  assert.ok(pageIn > 0);
  assert.ok(
    Math.max(...stagger.delays) + stagger.duration <= pageIn,
    `delay lớn nhất (${Math.max(...stagger.delays)}ms) + ${stagger.duration}ms phải ≤ ${pageIn}ms`,
  );
});
test("tranh phong cảnh hiện trên cả màn hình hẹp", async () => {
  const [critical, main] = await Promise.all([
    read("public/assets/css/critical.css"),
    read("public/assets/css/main.css"),
  ]);
  // Quy tắc cũ ẩn hẳn tranh dưới 900px để nó không thành LCP. Đổi lại thì gần
  // như toàn bộ người đọc — vốn dùng điện thoại — không bao giờ thấy tranh mở
  // đầu của bộ bài. Hai tệp phải cùng quan điểm, lệch nhau là trang giật một cú
  // đúng lúc main.css về.
  assert.doesNotMatch(critical, /\.hero-bg\s*\{\s*display:\s*none/);
  assert.doesNotMatch(main, /\.hero-bg\{display:none\}/);
  assert.match(critical, /\.hero-bg \{ object-position: center 30%; \}/);
  assert.match(main, /\.hero-bg \{ object-position: center 30%; \}/);
  // Vị trí trong tệp là một phần của tính đúng: @media không cộng độ ưu tiên,
  // nên khối ghi đè phải nằm SAU quy tắc gốc, không thì nó vô tác dụng.
  assert.ok(
    main.indexOf("object-position: center 30%") > main.indexOf("object-position: center;"),
    "khối ≤900px phải nằm sau quy tắc .hero-bg gốc",
  );
});

test("tranh phong cảnh nạp ưu tiên và entrance đúng từ opacity 0", async () => {
  const [home, css] = await Promise.all([
    read("templates/home.html"),
    read("public/assets/css/page-transition.css"),
  ]);
  // loading="lazy" trên một ảnh nằm ngay đầu trang khiến nó hiện sau mọi thứ
  // khác — đúng cảm giác "tranh hiện lên rồi mới thấy" người dùng đã báo.
  // Giới hạn trong đúng thẻ <img> đó: home.html còn nhiều ảnh khác cố ý dùng
  // loading="lazy", quét cả tệp sẽ bắt nhầm chúng.
  const heroImg = home.match(/<img class="hero-bg"[^>]*>/)?.[0] || "";
  assert.match(heroImg, /loading="eager"/);
  assert.match(heroImg, /fetchpriority="high"/);
  assert.doesNotMatch(heroImg, /loading="lazy"/);
  const reveal = css.match(/@keyframes hero-art-in \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(reveal, "thiếu @keyframes hero-art-in");
  // Đặc tả v2 yêu cầu tranh mở từ trong suốt và tiến thẳng tới opacity cuối,
  // không có mốc giữa sáng quá rồi tối lại.
  const start = Number(reveal.match(/from \{ opacity: ([\d.]+)/)?.[1]);
  assert.equal(start, 0);
  assert.match(reveal, /to \{ opacity: var\(--hero-art-opacity, 1\); transform: none; \}/);
  assert.doesNotMatch(reveal, /\d+%\s*\{/);
});

test("Hero chạy cùng choreography ở lần tải đầu và khi Swup thay trang", async () => {
  const [css, bootstrap, layout] = await Promise.all([
    read("public/assets/css/page-transition.css"),
    read("public/assets/js/page-transition/bootstrap.js"),
    read("templates/_layout.html"),
  ]);
  assert.match(css, /:is\(html\.hd-first-load, html\.is-changing\.is-rendering\)[\s\S]*\.hero-bg/);
  assert.doesNotMatch(css, /page-stagger/,
    "motion cũ không được chồng transform lên choreography Hero v2");
  // .swup-enabled KHÔNG dùng được: Swup gắn lớp đó ngay lúc khởi động, tức ngay
  // trong lần tải đầu, nên hiệu ứng sẽ bị cắt đúng lúc đáng lẽ phải chạy.
  assert.doesNotMatch(css, /swup-enabled[^\n]*hero-bg|hero-bg[^\n]*swup-enabled/);
  assert.match(bootstrap, /classList\.add\("hd-first-load"\)/);
  assert.match(layout, /<script>document\.documentElement\.classList\.add\("hd-first-load"\)<\/script>/,
    "class frame đầu phải có trước lần vẽ Hero đầu tiên");
  assert.match(bootstrap, /content:replace[\s\S]{0,160}classList\.remove\("hd-first-load"\)[\s\S]{0,80}once: true/);
});

test("hero tự tạo stacking context để tranh không bị chính nền của nó phủ lên", async () => {
  const [critical, main] = await Promise.all([
    read("public/assets/css/critical.css"),
    read("public/assets/css/main.css"),
  ]);
  // Đây là nguyên nhân thật của "tranh phong cảnh hiện lên rồi mất tiêu", và nó
  // vô hình với mọi phép kiểm dựa trên computed style: thẻ <img> vẫn
  // display:block, opacity:1, đúng kích thước — nó chỉ đơn giản bị vẽ dưới nền
  // của .hero. Đo được bằng document.elementsFromPoint: IMG.hero-bg đứng SAU
  // SECTION.hero trong thứ tự hit-test.
  //
  // .hero-bg ở z-index -2. Không có stacking context riêng thì nó thoát lên
  // tầng gốc và bị vẽ trước nền của chính .hero. Bất kỳ ai bỏ dòng isolation
  // dưới đây, hoặc thêm background đục cho .hero mà quên nó, sẽ làm tranh biến
  // mất trở lại mà không có phép kiểm nào khác kêu lên.
  for (const [ten, css] of [["critical.css", critical], ["main.css", main]]) {
    const rule = css.match(/\n\.hero \{([\s\S]*?)\n\}/)?.[1];
    assert.ok(rule, `${ten}: không tìm thấy quy tắc .hero`);
    // Bỏ comment TRƯỚC khi kiểm. Chính khối comment ở trên giải thích vì sao
    // cần isolation, nên nếu quét cả comment thì phép kiểm này vẫn xanh ngay cả
    // khi khai báo thật đã bị xoá — một cái chốt cửa không nối vào cánh cửa nào.
    const khaiBao = rule.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.match(khaiBao, /^\s*isolation:\s*isolate;/m,
      `${ten}: .hero phải tự tạo stacking context, nếu không nền của nó phủ lên .hero-bg`);
  }
});

test("âm thanh trải bài không ném AbortError khi rời trang", async () => {
  const source = await read("public/assets/js/trai-bai.js");
  // destroy() gọi pause() lúc rời trang; nếu play() còn đang chờ, Promise của nó
  // bị huỷ và ném AbortError ra console dưới dạng unhandled rejection. try/catch
  // quanh play() KHÔNG bắt được — đó là rejection bất đồng bộ, không phải throw.
  assert.match(source, /a\.play\(\)\?\.catch\(/,
    "phải nuốt rejection của play(), try/catch không bắt được nó");
  assert.match(source, /flipAudio\.pause\(\)/, "destroy vẫn phải dừng âm thanh");
});
