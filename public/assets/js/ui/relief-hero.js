import { onReducedMotionChange, prefersReducedMotion } from "../shared/reduced-motion.js";

/* Phù điêu Hero: một camera CSS rất nhỏ, không WebGL và không chặn cuộn.
   Lớp nền/sản phẩm có transform riêng vì page-transition.css đang sở hữu
   transform entrance của .hero-bg và .hero-carousel. */

const LIMIT = { x: 14, y: 10, rotate: 2.4 };

export function init() {
  const hero = document.querySelector("[data-relief-hero]");
  if (!hero || prefersReducedMotion()) return () => {};

  let frame = 0;
  let touchActive = false;
  let point = { x: 0, y: 0 };

  const paint = () => {
    frame = 0;
    const x = point.x;
    const y = point.y;
    hero.style.setProperty("--relief-x", `${(x * LIMIT.x).toFixed(2)}px`);
    hero.style.setProperty("--relief-y", `${(y * LIMIT.y).toFixed(2)}px`);
    hero.style.setProperty("--relief-rotate-x", `${(-y * LIMIT.rotate).toFixed(2)}deg`);
    hero.style.setProperty("--relief-rotate-y", `${(x * LIMIT.rotate).toFixed(2)}deg`);
  };

  const queue = () => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  const setPoint = (event) => {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    point = {
      x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2)),
      y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2)),
    };
    queue();
  };

  const reset = () => {
    touchActive = false;
    point = { x: 0, y: 0 };
    queue();
  };

  const onMove = (event) => {
    if (event.pointerType === "touch" && !touchActive) return;
    setPoint(event);
  };
  const onDown = (event) => {
    if (event.pointerType === "touch") touchActive = true;
    setPoint(event);
  };
  const onLeave = (event) => {
    if (event.pointerType !== "touch") reset();
  };

  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerdown", onDown, { passive: true });
  hero.addEventListener("pointerleave", onLeave, { passive: true });
  hero.addEventListener("pointerup", reset, { passive: true });
  hero.addEventListener("pointercancel", reset, { passive: true });

  const offReduced = onReducedMotionChange((reduced) => {
    if (reduced) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      hero.style.removeProperty("--relief-x");
      hero.style.removeProperty("--relief-y");
      hero.style.removeProperty("--relief-rotate-x");
      hero.style.removeProperty("--relief-rotate-y");
    }
  });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    offReduced();
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerdown", onDown);
    hero.removeEventListener("pointerleave", onLeave);
    hero.removeEventListener("pointerup", reset);
    hero.removeEventListener("pointercancel", reset);
    hero.style.removeProperty("--relief-x");
    hero.style.removeProperty("--relief-y");
    hero.style.removeProperty("--relief-rotate-x");
    hero.style.removeProperty("--relief-rotate-y");
  };
}
