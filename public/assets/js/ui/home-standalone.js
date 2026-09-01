import { prefersReducedMotion } from "../shared/reduced-motion.js";

/* Motion của riêng trang chủ bàn giao.
   Module có teardown đầy đủ để không giữ listener khi Swup thay nội dung. */
export function init() {
  const main = document.querySelector('main[data-page="home"]');
  if (!main) return () => {};

  const root = document.documentElement;
  const reduced = prefersReducedMotion();
  const revealElements = [...main.querySelectorAll("[data-reveal]")];
  const depthElements = [...main.querySelectorAll("[data-depth]")];
  let revealObserver = null;
  let depthFrame = 0;

  root.classList.add("is-home", "home-motion-enabled");
  if (!reduced) root.classList.add("home-reveal-enabled");

  const entranceFrame = requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.add("is-ready"));
  });

  if (!reduced && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const updateDepth = () => {
    depthFrame = 0;
    if (reduced) return;
    const viewportCenter = window.innerHeight / 2;
    depthElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > window.innerHeight + 160) return;
      const strength = Number(element.dataset.depthStrength || 18);
      const normalized = (rect.top + rect.height / 2 - viewportCenter) / Math.max(window.innerHeight, 1);
      const offset = Math.max(-strength, Math.min(strength, normalized * -strength));
      element.style.setProperty("--depth-offset", `${offset.toFixed(2)}px`);
    });
  };

  const queueDepth = () => {
    if (depthFrame || reduced) return;
    depthFrame = requestAnimationFrame(updateDepth);
  };

  if (!reduced && depthElements.length) {
    window.addEventListener("scroll", queueDepth, { passive: true });
    window.addEventListener("resize", queueDepth);
    queueDepth();
  }

  return () => {
    cancelAnimationFrame(entranceFrame);
    if (depthFrame) cancelAnimationFrame(depthFrame);
    revealObserver?.disconnect();
    window.removeEventListener("scroll", queueDepth);
    window.removeEventListener("resize", queueDepth);
    depthElements.forEach((element) => element.style.removeProperty("--depth-offset"));
    root.classList.remove("is-home", "home-motion-enabled", "home-reveal-enabled", "is-ready");
  };
}
