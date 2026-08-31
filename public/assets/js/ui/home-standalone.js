import { prefersReducedMotion } from "../shared/reduced-motion.js";

const DRAWN_CARDS = [
  "Thái Dương · The Sun",
  "Nữ Hoàng · The Empress",
  "Chiến Xa · The Chariot",
  "Thế Giới · The World",
  "Ngôi Sao · The Star",
];

/* Motion và hộp “Rút thử một lá” của riêng trang chủ bàn giao.
   Module có teardown đầy đủ để không giữ listener khi Swup thay nội dung. */
export function init() {
  const main = document.querySelector('main[data-page="home"]');
  if (!main) return () => {};

  const root = document.documentElement;
  const reduced = prefersReducedMotion();
  const revealElements = [...main.querySelectorAll("[data-reveal]")];
  const depthElements = [...main.querySelectorAll("[data-depth]")];
  const dialog = main.querySelector("[data-card-dialog]");
  const drawnTitle = dialog?.querySelector("[data-drawn-title]");
  const drawButtons = [...main.querySelectorAll("[data-draw-card]")];
  const closeButtons = [...main.querySelectorAll("[data-dialog-close]")];
  let lastFocused = null;
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

  const closeDialog = () => {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.removeProperty("overflow");
    lastFocused?.focus?.();
  };

  const openDialog = (event) => {
    if (!dialog) return;
    lastFocused = event.currentTarget;
    if (drawnTitle) {
      drawnTitle.textContent = DRAWN_CARDS[Math.floor(Math.random() * DRAWN_CARDS.length)];
    }
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    dialog.querySelector(".dialog-panel button")?.focus();
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") closeDialog();
  };

  drawButtons.forEach((button) => button.addEventListener("click", openDialog));
  closeButtons.forEach((button) => button.addEventListener("click", closeDialog));
  document.addEventListener("keydown", onKeydown);

  return () => {
    cancelAnimationFrame(entranceFrame);
    if (depthFrame) cancelAnimationFrame(depthFrame);
    revealObserver?.disconnect();
    window.removeEventListener("scroll", queueDepth);
    window.removeEventListener("resize", queueDepth);
    drawButtons.forEach((button) => button.removeEventListener("click", openDialog));
    closeButtons.forEach((button) => button.removeEventListener("click", closeDialog));
    document.removeEventListener("keydown", onKeydown);
    depthElements.forEach((element) => element.style.removeProperty("--depth-offset"));
    document.body.style.removeProperty("overflow");
    root.classList.remove("is-home", "home-motion-enabled", "home-reveal-enabled", "is-ready");
  };
}
