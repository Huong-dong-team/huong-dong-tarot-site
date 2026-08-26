import { startPage } from "../page/registry.js";
import { init as initAmbientSound } from "../ui/ambient-sound.js";
import { init as initMenu } from "../ui/menu.js";

/* Điểm vào của toàn bộ front-end.

   Thứ tự ở đây là một cam kết về progressive enhancement:

     1. Menu và module của trang hiện tại được dựng NGAY, không chờ Swup. Nếu
        bước 2 hỏng vì bất cứ lý do gì — mạng chết giữa chừng, trình duyệt quá cũ,
        người dùng chặn 27 KB thư viện — website vẫn là một website hoàn chỉnh,
        chỉ là mỗi lần bấm link thì trình duyệt tự tải trang như mọi khi.

     2. Swup được nạp trễ và bọc trong try/catch. Nó là lớp phủ lên trên, không
        phải nền móng.

   Đó cũng là lý do file này không import Swup ở đầu file: import tĩnh mà lỗi thì
   cả module chết theo, kéo theo cả menu lẫn nội dung tương tác. */

const CONTAINER = "#noi-dung-chinh";

// Dừng hẳn chuyển cảnh mà vẫn giữ nguyên phần refactor vòng đời. Một thuộc tính
// trên <body> trong _layout.html là đủ để tắt, không cần build lại JavaScript.
const DISABLED = document.body.dataset.noTransitions !== undefined;

/* Mốc cho hiệu ứng tranh phong cảnh mở đầu: nó chỉ được chạy ở lần tải trang
   thật, không chạy lại mỗi khi Swup đưa người dùng về trang chủ. Gắn ở đây chứ
   không phải trong CSS vì CSS không phân biệt được "vừa tải trang" với "vừa
   chuyển cảnh". */
document.documentElement.classList.add("hd-first-load");

initMenu();
initAmbientSound();
startPage();

if (!DISABLED && supportsTransitions()) {
  bootSwup().catch((error) => {
    // Không có gì để dọn: Swup chưa kịp chặn cú bấm nào thì link vẫn là link.
    console.warn("[huong-dong] chuyển cảnh không khởi động được, dùng điều hướng thường:", error);
  });
}

/* Swup 4 cần fetch, Promise, URL và history.pushState. Mọi trình duyệt chạy được
   ES module đều có đủ, nhưng kiểm tra vẫn rẻ hơn một trang trắng trên thiết bị lạ. */
function supportsTransitions() {
  return typeof window.fetch === "function"
    && typeof window.history?.pushState === "function"
    && typeof window.URL === "function";
}

async function bootSwup() {
  const [{ default: Swup }, { attachLifecycle }, { attachAnalytics }] = await Promise.all([
    import("/assets/vendor/swup.mjs"),
    import("./lifecycle.js"),
    import("./analytics.js"),
  ]);

  const swup = new Swup({
    containers: [CONTAINER],
    // Lớp trạng thái đặt trên <html> để vệt sáng — nằm ngoài container — cũng
    // nghe được nhịp của chuyến đi.
    animationScope: "html",
    // Back/Forward cũng có hiệu ứng, chỉ là quét ngược chiều. Không làm thì lùi
    // lại thấy trang nhảy phựt, lệch hẳn với cảm giác của phần còn lại.
    animateHistoryBrowsing: true,
    // Trang HTML được phục vụ với Cache-Control: no-cache, nhưng cache trong bộ
    // nhớ của Swup vẫn đáng giá: quay lại một trang trong cùng phiên là tức thì.
    cache: true,
    // Mạng hỏng hoặc máy chủ chậm quá 8 giây thì trả quyền lại cho trình duyệt
    // thay vì để người dùng ngồi nhìn một trang không phản ứng.
    timeout: 8000,
    ignoreVisit,
  });

  attachLifecycle(swup);
  attachAnalytics(swup);

  // Lần thay nội dung đầu tiên là ranh giới: từ đây trở đi mọi trang đều tới
  // bằng chuyển cảnh, và section mẹ đã lo phần hiện ra rồi.
  swup.hooks.on("content:replace", () => {
    document.documentElement.classList.remove("hd-first-load");
  }, { once: true });

  return swup;
}

/* Swup đã tự bỏ qua: khác origin (gồm mailto: và tel:), [download],
   [target="_blank"], Ctrl/Cmd/Shift/Alt-click, và link về chính trang đang xem.
   Ở đây chỉ thêm những gì riêng của website này. */
function ignoreVisit(url, { el } = {}) {
  // /admin/ là một ứng dụng Firebase riêng, không có #noi-dung-chinh và không
  // dùng chung layout. Đưa nó qua Swup là chắc chắn vỡ.
  if (url.startsWith("/admin")) return true;
  // Cửa thoát thủ công cho từng link, dùng khi một trang nào đó cần tải lại thật.
  if (el?.closest("[data-no-swup]")) return true;
  // Tệp tải về không có [download] (ví dụ link thẳng tới .pdf hay .mp3).
  if (/\.(?:pdf|zip|mp3|mp4|jpe?g|png|webp|avif|svg|xml|txt|json)(?:$|\?)/i.test(url)) return true;
  return false;
}
