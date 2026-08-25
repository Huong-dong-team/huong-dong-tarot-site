import EmblaCarousel from "/assets/vendor/embla-carousel.mjs";
import { motionGate } from "./motion-gate.js";

const STYLE_ID = "hero-embla-prototype-style";

function ensurePrototypeStyles() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = "/assets/css/hero-embla-prototype.css";
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", reject, { once: true });
    document.head.append(link);
  });
}

/**
 * Bản thử tách biệt: clone nội dung để Embla không phải viết lại carousel đang
 * chạy. Gọi destroy() sẽ trả trang về đúng DOM và trạng thái trước khi thử.
 */
export async function mountEmblaHeroPrototype(
  carousel = document.querySelector("[data-hero-carousel]"),
) {
  if (!carousel) throw new Error("Không tìm thấy hero carousel.");
  if (carousel.hasAttribute("data-embla-trial-mounted")) {
    throw new Error("Bản thử Embla đã được mở.");
  }

  await ensurePrototypeStyles();

  const stage = carousel.closest(".hero-stage");
  const originalDots = stage?.querySelector("[data-hero-dots]");
  const sourceSlides = [...carousel.querySelectorAll("[data-hero-slide]")];
  if (!stage || sourceSlides.length < 2) throw new Error("Hero không đủ cấu trúc để thử Embla.");

  const preview = document.createElement("section");
  const previewLabel = document.createElement("p");
  const viewport = document.createElement("div");
  const container = document.createElement("div");
  const dots = document.createElement("div");
  preview.className = "hero-embla-prototype";
  preview.setAttribute("aria-label", "Bản thử hero có thể vuốt");
  previewLabel.className = "hero-embla-prototype-label";
  viewport.className = "hero-embla-prototype-viewport";
  container.className = "hero-embla-prototype-container";
  dots.className = "hero-dots hero-embla-prototype-dots";
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Chọn lá trong bản thử Embla");

  const slides = sourceSlides.map((source) => {
    const slide = source.cloneNode(true);
    slide.classList.remove("is-active");
    slide.classList.add("hero-embla-prototype-slide");
    slide.removeAttribute("data-hero-slide");
    slide.inert = false;
    slide.removeAttribute("aria-hidden");
    container.append(slide);
    return slide;
  });
  viewport.append(container);
  preview.append(previewLabel, viewport, dots);

  const carouselWasHidden = carousel.hidden;
  const dotsWereHidden = originalDots?.hidden ?? false;
  carousel.setAttribute("data-embla-trial-mounted", "");
  carousel.hidden = true;
  if (originalDots) originalDots.hidden = true;
  stage.append(preview);

  const embla = EmblaCarousel(viewport, {
    align: "center",
    containScroll: "trimSnaps",
    loop: true,
    duration: 24,
    watchDrag: false,
  });
  let motionAllowed = false;
  let suppressClick = false;
  let pointerStartX = 0;
  const eventController = new AbortController();

  const updateSelected = () => {
    const selected = embla.selectedScrollSnap();
    slides.forEach((slide, index) => {
      const active = index === selected;
      slide.inert = !active;
      slide.setAttribute("aria-hidden", String(!active));
    });
    [...dots.children].forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === selected));
    });
    previewLabel.textContent = sourceSlides[selected]?.dataset.eyebrow || "Hero có thể vuốt";
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    const name = slide.querySelector(".hero-card-name")?.textContent.trim();
    dot.setAttribute("aria-label", name ? `Xem ${name}` : `Xem lá bài ${index + 1}`);
    dot.addEventListener("click", () => embla.scrollTo(index, !motionAllowed));
    dots.append(dot);

    slide.addEventListener("click", (event) => {
      if (suppressClick) {
        event.preventDefault();
        return;
      }
      if (slide.hasAttribute("data-pack")) {
        window.location.href = "/cua-hang/";
        return;
      }
      const dialog = document.querySelector("[data-story-dialog]");
      const storyKey = slide.dataset.story;
      const panels = [...(dialog?.querySelectorAll("[data-story-for]") || [])];
      const panel = panels.find((item) => item.dataset.storyFor === storyKey);
      if (!dialog || !panel || typeof dialog.showModal !== "function") return;
      panels.forEach((item) => { item.hidden = item !== panel; });
      dialog.setAttribute("aria-label", panel.querySelector("h2")?.textContent || "Chuyện kể");
      dialog.showModal();
    });
  });

  // Một cú kéo không được đọc thành cú bấm mở truyện khi người dùng nhấc tay.
  viewport.addEventListener("pointerdown", (event) => { pointerStartX = event.clientX; });
  viewport.addEventListener("pointerup", (event) => {
    suppressClick = Math.abs(event.clientX - pointerStartX) > 6;
    setTimeout(() => { suppressClick = false; }, 0);
  });
  document.querySelector("[data-story-close]")?.addEventListener("click", () => {
    const dialog = document.querySelector("[data-story-dialog]");
    if (dialog?.open) dialog.close();
  }, { signal: eventController.signal });

  embla.on("select", updateSelected);
  embla.on("reInit", updateSelected);
  updateSelected();

  const stopMotionGate = motionGate(preview, {
    onEnter() {
      motionAllowed = true;
      embla.reInit({ watchDrag: true });
    },
    onLeave() {
      motionAllowed = false;
      embla.reInit({ watchDrag: false });
    },
  });

  return {
    embla,
    destroy() {
      stopMotionGate();
      embla.destroy();
      eventController.abort();
      preview.remove();
      carousel.hidden = carouselWasHidden;
      carousel.removeAttribute("data-embla-trial-mounted");
      if (originalDots) originalDots.hidden = dotsWereHidden;
    },
  };
}
