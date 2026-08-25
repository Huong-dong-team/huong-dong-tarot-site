/* Chọn hướng đi vào cho từng chuyến điều hướng.

   Hướng của link trong menu được gắn theo vị trí nhóm để người dùng cảm thấy
   trang mới tiếp tục chuyển động từ đúng nơi mình vừa bấm. Link ở thân trang
   dùng vị trí thực trên viewport; vì vậy cùng một cơ chế vẫn hợp lý trên cả
   desktop lẫn mobile mà không cần danh sách route cứng. */

const DIRECTIONS = new Set(["left", "right", "top", "bottom"]);
const MENU_DIRECTIONS = ["left", "left", "top", "bottom", "top", "right", "right"];

/**
 * Gắn bộ chọn hướng vào vòng đời Swup.
 * @param {{ hooks: { on: Function, off: Function } }} swup
 * @returns {() => void}
 */
export function attachDirection(swup) {
  const onVisitStart = (visit) => {
    if (visit.history?.popstate || prefersReducedMotion()) return;
    const direction = directionFor(visit.trigger?.el);
    if (direction) visit.animation.name = `from-${direction}`;
  };

  swup.hooks.on("visit:start", onVisitStart, { priority: -20 });
  return () => swup.hooks.off("visit:start", onVisitStart);
}

/** @param {Element | null | undefined} link */
export function directionFor(link) {
  if (!(link instanceof Element)) return "bottom";

  const override = link.closest("[data-transition-direction]")?.getAttribute("data-transition-direction");
  if (override && DIRECTIONS.has(override)) return override;

  if (link.closest(".nav-cta")) return "right";

  const group = link.closest(".nav-group");
  if (group) {
    const groups = [...document.querySelectorAll("#main-nav > .nav-group")];
    const index = groups.indexOf(group);
    return MENU_DIRECTIONS[index] || "bottom";
  }

  const rect = link.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / Math.max(window.innerWidth, 1);
  if (x < .34) return "left";
  if (x > .66) return "right";

  const y = (rect.top + rect.height / 2) / Math.max(window.innerHeight, 1);
  return y < .5 ? "top" : "bottom";
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
