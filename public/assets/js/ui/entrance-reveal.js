import { prefersReducedMotion, onReducedMotionChange } from "../shared/reduced-motion.js";

/* Hiện nội dung theo vùng nhìn, dùng chung cho trang chủ và mọi trang con.

   Chọn phần tử con của từng section/article thay vì chính section mẹ để hai
   lớp chuyển động không giẫm transform lên nhau: Swup đưa "khung trang" vào,
   module này mới đặt từng mảng chữ/hình vào từ bốn phía khi người đọc cuộn tới.

   Thuộc tính data-hd-reveal chỉ là trạng thái tăng cường. JavaScript hỏng hoặc
   IntersectionObserver không có thì HTML/CSS gốc vẫn hiện đầy đủ. */

const ROOT_CLASS = "hd-reveal-ready";
const SELECTOR = ":scope > :not(.hero) > *";
const DIRECTIONS = ["left", "top", "right", "bottom"];

export function init() {
  const main = document.querySelector("#noi-dung-chinh");
  if (!main) return () => {};

  const items = [...main.querySelectorAll(SELECTOR)];
  if (!items.length) return () => {};

  let observer = null;
  let frame = 0;
  let destroyed = false;

  items.forEach((item, index) => {
    item.dataset.hdReveal = DIRECTIONS[index % DIRECTIONS.length];
    // Ghi thẳng đơn vị thời gian để không phụ thuộc phép nhân trong calc();
    // Safari cũ chưa hỗ trợ cú pháp calc(var(--n) * 65ms).
    item.style.setProperty("--hd-reveal-delay", `${(index % 4) * 65}ms`);
  });

  const reveal = (item) => {
    item.classList.add("is-hd-revealed");
    observer?.unobserve(item);
  };

  const revealAll = () => items.forEach(reveal);

  const observe = () => {
    if (destroyed || prefersReducedMotion()) {
      revealAll();
      return;
    }
    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    }, {
      // Vào đủ sâu để chuyển động gắn với cú cuộn, nhưng không bắt phần tử cao
      // phải lọt trọn màn hình mới chạy.
      threshold: 0.08,
      rootMargin: "0px 0px -7% 0px",
    });
    items.forEach((item) => observer.observe(item));
  };

  // Gắn mốc sau khi mọi phần tử đã có hướng. Một frame riêng bảo đảm trình
  // duyệt ghi nhận trạng thái đầu rồi mới chuyển sang keyframe, tránh cú bật
  // thường thấy khi thêm class và animation trong cùng một lần style recalc.
  document.documentElement.classList.add(ROOT_CLASS);
  frame = requestAnimationFrame(observe);

  const stopReducedListener = onReducedMotionChange((reduced) => {
    if (!reduced) return;
    observer?.disconnect();
    observer = null;
    revealAll();
  });

  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    stopReducedListener();
    // Không gỡ ROOT_CLASS: Swup thay main sau khi teardown. Giữ mốc ở <html>
    // ngăn một frame lóe nội dung cũ trong lúc trang đang rời đi.
  };
}
