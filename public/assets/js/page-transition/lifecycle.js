import { startPage, stopPage } from "../page/registry.js";
import { closeMenu } from "../ui/menu.js";

/* Nối vòng đời module vào vòng đời của Swup.

   Thứ tự là tất cả:

     visit:start      → stopPage()   gỡ mọi listener của trang cũ, TRƯỚC khi DOM
                                     bị thay. Module còn cầm tham chiếu tới phần
                                     tử sắp biến mất thì đây là cơ hội cuối để
                                     nhả ra.
     content:replace  → startPage()  DOM mới đã vào chỗ, đọc data-page và dựng
                                     lại đúng những module trang đó cần.
     page:view        → focus + dọn  đưa tiêu điểm về đầu nội dung và đóng menu.

   Trình tự này chạy y hệt nhau cho click, cho nút Back và cho nút Forward, nên
   không có nhánh nào bị bỏ quên. */

const MAIN = "#noi-dung-chinh";

export function attachLifecycle(swup) {
  const onVisitStart = () => stopPage();
  const onContentReplace = () => { startPage(); };
  const onPageView = () => {
    closeMenu();
    moveFocusToContent();
    announce();
  };

  swup.hooks.on("visit:start", onVisitStart);
  swup.hooks.on("content:replace", onContentReplace);
  swup.hooks.on("page:view", onPageView);

  return () => {
    swup.hooks.off("visit:start", onVisitStart);
    swup.hooks.off("content:replace", onContentReplace);
    swup.hooks.off("page:view", onPageView);
  };
}

/* Không tải lại trang thì tiêu điểm bàn phím vẫn nằm ở cái link vừa bấm — mà
   link đó đã bị gỡ khỏi DOM, nên trình duyệt trả focus về <body> và người dùng
   bàn phím phải Tab lại từ đầu website. Đưa focus vào <main> giữ đúng cảm giác
   của một lần tải trang thật.

   tabindex="-1" đặt tạm rồi gỡ đi: để lại vĩnh viễn thì <main> hiện lên như một
   điểm dừng lạ trong danh sách phần tử của trình đọc màn hình. */
function moveFocusToContent() {
  const main = document.querySelector(MAIN);
  if (!main) return;
  main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
  main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
}

/* Trình đọc màn hình không tự thông báo gì khi nội dung đổi mà URL đổi theo kiểu
   SPA. Một vùng aria-live ngắn nói tên trang mới là cách rẻ nhất để không bỏ rơi
   họ giữa hai trang. */
function announce() {
  let region = document.getElementById("swup-announcer");
  if (!region) {
    region = document.createElement("div");
    region.id = "swup-announcer";
    region.className = "visually-hidden";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("role", "status");
    document.body.append(region);
  }
  region.textContent = `Đã mở trang ${document.title}`;
}
