const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TILT_SELECTOR = ".section-visual, .section-card-fan, .price-tier";

/**
 * Chuyển động chiều sâu rất nhẹ cho hệ 7 trang trong.
 * Chỉ transform phần tử sẵn có; tranh và nội dung vẫn đọc được khi JS tắt.
 * @returns {() => void}
 */
export function init() {
  const page = document.querySelector("#noi-dung-chinh[data-page-art]");
  if (!page || window.matchMedia(MOTION_QUERY).matches) return () => {};

  const controllers = [];
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
