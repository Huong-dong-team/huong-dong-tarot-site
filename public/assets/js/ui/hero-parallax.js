import { onReducedMotionChange, prefersReducedMotion } from "../shared/reduced-motion.js";

/* Parallax 3D cho khối ba lá bài của Hero trang chủ.

   Khác gì với card-tilt.js: card-tilt chỉ phản ứng khi con trỏ nằm ĐÚNG TRÊN
   phần tử, và xoay rất nhẹ (4°) cho từng lá bài nhỏ trong thư viện. Ở Hero,
   bản tham khảo của chủ dự án cho cả khối tranh trôi theo con trỏ di chuyển
   BẤT KỲ ĐÂU trong Hero — kể cả khi chuột đang ở bên cột chữ. Đó là khác biệt
   về chất, không phải về mức độ, nên nó là module riêng chứ không phải một
   tham số của card-tilt.

   Chỉ ghi hai biến CSS (--hd-hero-x, --hd-hero-y, mỗi biến trong khoảng -1..1)
   lên .hero-stage; toàn bộ phần biến hai con số đó thành transform nằm ở
   main.css. JS không đọc getComputedStyle và không tự viết chuỗi transform —
   đổi cường độ hiệu ứng là việc của CSS, không phải sửa lại module này.

   Vòng đời: registry gọi init() sau mỗi lần Swup thay DOM và gọi hàm huỷ trước
   khi rời trang. Listener gắn trên chính .hero (không phải document/window) nên
   nó đi theo cây DOM bị thay, và vẫn được gỡ tay để không giữ tham chiếu tới
   một phần tử đã rời khỏi tài liệu. */

export function init() {
  const hero = document.querySelector(".home-page .hero") || document.querySelector(".hero");
  const stage = hero?.querySelector(".hero-stage");
  if (!hero || !stage) return () => {};

  let frame = 0;
  let pending = null;

  const apply = (x, y) => {
    stage.style.setProperty("--hd-hero-x", x.toFixed(3));
    stage.style.setProperty("--hd-hero-y", y.toFixed(3));
  };

  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = null;
    apply(0, 0);
  };

  const queue = (event) => {
    // Chạm và bút cảm ứng đi theo ngón tay đang cuộn trang; để chúng lái
    // parallax thì khối tranh giật theo mỗi cú vuốt dọc. Chỉ nhận chuột thật.
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    pending = { clientX: event.clientX, clientY: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pending || prefersReducedMotion()) return;
      const { clientX, clientY } = pending;
      pending = null;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Quy về -1..1 với gốc ở tâm Hero, rồi kẹp lại: con trỏ có thể còn nằm
      // trong Hero theo trục này nhưng đã ra ngoài theo trục kia.
      const x = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));
      apply(x, y);
    });
  };

  stage.classList.toggle("hd-hero-parallax-ready", !prefersReducedMotion());
  apply(0, 0);

  hero.addEventListener("pointermove", queue);
  hero.addEventListener("pointerleave", reset);

  const unsubscribeReducedMotion = onReducedMotionChange((reduced) => {
    stage.classList.toggle("hd-hero-parallax-ready", !reduced);
    reset();
  });

  return () => {
    hero.removeEventListener("pointermove", queue);
    hero.removeEventListener("pointerleave", reset);
    unsubscribeReducedMotion();
    reset();
    stage.classList.remove("hd-hero-parallax-ready");
    stage.style.removeProperty("--hd-hero-x");
    stage.style.removeProperty("--hd-hero-y");
  };
}
