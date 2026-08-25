import { prefersReducedMotion } from "../shared/reduced-motion.js";

/* Nghiêng theo chuột. Chỉ xoay .hero-carousel để không thay đổi layout của
   .hero-stage. Gom mỗi lần di chuột vào một khung hình bằng requestAnimationFrame
   để không giật. Bỏ qua trên máy cảm ứng (không có con trỏ để lần theo) và khi
   người dùng chọn giảm chuyển động. */

export function init() {
  const hero = document.querySelector(".hero");
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!hero || !carousel) return () => {};
  if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return () => {};

  let raf = 0;
  let nx = 0;
  let ny = 0;
  const render = () => {
    raf = 0;
    carousel.style.transform = `rotateY(${(nx * 5).toFixed(2)}deg) rotateX(${(-ny * 5).toFixed(2)}deg)`;
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  const onMove = (event) => {
    const rect = hero.getBoundingClientRect();
    nx = (event.clientX - rect.left) / rect.width - 0.5;
    ny = (event.clientY - rect.top) / rect.height - 0.5;
    schedule();
  };
  const onLeave = () => { nx = 0; ny = 0; schedule(); };

  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);

  return () => {
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
    // Huỷ khung hình đang chờ, nếu không nó sẽ ghi transform lên một phần tử
    // đã bị Swup gỡ khỏi cây DOM.
    cancelAnimationFrame(raf);
    carousel.style.removeProperty("transform");
  };
}
