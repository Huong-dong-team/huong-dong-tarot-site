const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TILT_SELECTOR = ".section-visual, .section-card-fan, .price-tier";
const KIRIGAMI_HERO_SELECTOR = ".page-hero.lacquer-hero:has(.kirigami-stage)";

/**
 * Chuyển động chiều sâu rất nhẹ cho hệ 7 trang trong.
 * Chỉ transform phần tử sẵn có; tranh và nội dung vẫn đọc được khi JS tắt.
 * @returns {() => void}
 */
export function init() {
  const page = document.querySelector("#noi-dung-chinh[data-page-art]");
  if (!page || window.matchMedia(MOTION_QUERY).matches) return () => {};

  const controllers = [];

  const hero = page.querySelector(KIRIGAMI_HERO_SELECTOR);
  if (hero) {
    const controller = new AbortController();
    controllers.push(controller);

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      hero.style.setProperty("--kirigami-shift-x", `${(x * 12).toFixed(2)}px`);
      hero.style.setProperty("--kirigami-shift-y", `${(y * 8).toFixed(2)}px`);
    }, { signal: controller.signal, passive: true });

    hero.addEventListener("pointerleave", () => {
      hero.style.removeProperty("--kirigami-shift-x");
      hero.style.removeProperty("--kirigami-shift-y");
    }, { signal: controller.signal, passive: true });
  }

  for (const element of page.querySelectorAll(TILT_SELECTOR)) {
    const controller = new AbortController();
    controllers.push(controller);

    element.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      element.style.setProperty("--subpage-tilt-x", `${(-y * 2.6).toFixed(2)}deg`);
      element.style.setProperty("--subpage-tilt-y", `${(x * 3.2).toFixed(2)}deg`);
    }, { signal: controller.signal, passive: true });

    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("--subpage-tilt-x");
      element.style.removeProperty("--subpage-tilt-y");
    }, { signal: controller.signal, passive: true });
  }

  return () => {
    for (const controller of controllers) controller.abort();
  };
}
