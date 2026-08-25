/* Nút "Mục lục" của header.

   Header nằm NGOÀI container Swup nên nó sống suốt phiên: module này được khởi
   tạo đúng một lần lúc bootstrap và không bao giờ bị huỷ. Đổi lại, nó phải tự
   đóng menu sau mỗi lần điều hướng — người dùng bấm một mục trong menu xong,
   trang mới hiện ra mà tấm menu vẫn phủ kín thì hỏng. */

let button = null;
let navigation = null;

export function init() {
  button = document.querySelector(".menu-toggle");
  navigation = document.querySelector("#main-nav");
  if (!button) return () => {};

  const onClick = () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    navigation?.toggleAttribute("data-open", open);
  };
  button.addEventListener("click", onClick);
  return () => {
    button.removeEventListener("click", onClick);
    button = null;
    navigation = null;
  };
}

/** Đóng menu sau khi Swup thay nội dung. Không làm gì nếu menu đang đóng. */
export function closeMenu() {
  if (!button || button.getAttribute("aria-expanded") !== "true") return;
  button.setAttribute("aria-expanded", "false");
  navigation?.removeAttribute("data-open");
}
