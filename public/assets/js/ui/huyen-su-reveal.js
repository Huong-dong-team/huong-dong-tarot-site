import { animate as animateMini } from "/assets/vendor/motion-mini.mjs";
import { onReducedMotionChange, prefersReducedMotion } from "../shared/reduced-motion.js";

/* Mở từng chương Huyền sử khi người đọc chạm tới nó.

   Chỉ thêm trạng thái ẩn sau khi module đã nạp thành công, nên nếu JavaScript
   hoặc Motion không khả dụng thì toàn bộ văn bản vẫn hiện như HTML tĩnh. */

const ITEM_SELECTOR = ":scope > .v2-prose, :scope > .subpage-content-frame > .v2-prose";

function showImmediately(item) {
  item.classList.add("hd-reveal-visible");
  item.style.opacity = "1";
  item.style.transform = "none";
}

export function init() {
  const root = document.querySelector('#noi-dung-chinh[data-page="huyen-su"]');
  const items = root ? [...root.querySelectorAll(ITEM_SELECTOR)] : [];
  if (!items.length || prefersReducedMotion()) return () => {};

  const activeAnimations = new Map();
  const revealed = new WeakSet();
  let observer = null;
  let disposed = false;

  root.classList.add("hd-reveal-enabled");
  items.forEach((item) => item.classList.add("hd-reveal-item"));

  const reveal = (item, index) => {
    if (disposed || revealed.has(item)) return;
    revealed.add(item);

    let animation;
    try {
      animation = animateMini(
        item,
        { opacity: [0, 1], transform: ["translateY(16px)", "translateY(0px)"] },
        { duration: 0.58, delay: Math.min(index * 0.045, 0.2), ease: [0.22, 1, 0.36, 1] },
      );
    } catch {
      showImmediately(item);
      return;
    }

    activeAnimations.set(item, animation);
    animation.finished
      .catch(() => {})
      .finally(() => {
        activeAnimations.delete(item);
        showImmediately(item);
      });
  };

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = items.indexOf(entry.target);
        reveal(entry.target, index < 0 ? 0 : index);
        observer?.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach(reveal);
  }

  const unsubscribeReducedMotion = onReducedMotionChange((reduced) => {
    if (!reduced) return;
    observer?.disconnect();
    activeAnimations.forEach((animation) => animation.complete?.());
    items.forEach(showImmediately);
    root.classList.remove("hd-reveal-enabled");
  });

  return () => {
    disposed = true;
    observer?.disconnect();
    unsubscribeReducedMotion();
    activeAnimations.forEach((animation) => animation.complete?.());
    activeAnimations.clear();
    root.classList.remove("hd-reveal-enabled");
    items.forEach((item) => {
      item.classList.remove("hd-reveal-item", "hd-reveal-visible");
      item.style.removeProperty("opacity");
      item.style.removeProperty("transform");
    });
  };
}
