import { prefersReducedMotion, onReducedMotionChange } from "../shared/reduced-motion.js";

/* Hero carousel. Progressive enhancement: markup đã xuất slide đầu với
   .is-active, nên trang không chạy được script vẫn có một hero đúng và đầy đủ —
   phần này chỉ thêm chấm điều hướng và vòng quay lên trên.

   Vòng đời: mọi timer, listener và cả <dialog> đang mở đều phải đóng lại trong
   destroy(). Một dialog modal còn mở khi Swup thay nội dung sẽ khoá cuộn của
   trang mới và giam focus vào một phần tử không còn tồn tại. */

export function init() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return () => {};

  const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
  if (slides.length < 2) return () => {};

  const dots = document.querySelector("[data-hero-dots]");
  const eyebrow = document.querySelector("[data-hero-eyebrow]");
  const DELAY = 7000;
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) index = 0;
  let timer = 0;

  // Slide không hoạt động phải rời khỏi tab order và cây accessibility, nếu
  // không người dùng bàn phím và trình đọc màn hình sẽ rơi vào một lá không ai
  // nhìn thấy.
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.inert = !active;
      slide.setAttribute("aria-hidden", String(!active));
    });
    if (dots) [...dots.children].forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
    if (eyebrow) {
      const label = slides[index].dataset.eyebrow;
      if (label) eyebrow.textContent = label;
    }
  };

  const stop = () => { clearInterval(timer); timer = 0; };
  // Tôn trọng giảm chuyển động ở mọi lần start, không chỉ lúc tải: người dùng
  // có thể đổi thiết lập giữa phiên và listener bên dưới gọi lại hàm này.
  const start = () => { stop(); if (!prefersReducedMotion()) timer = setInterval(() => show(index + 1), DELAY); };

  if (dots) {
    slides.forEach((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      const label = slide.querySelector(".hero-card-name")?.textContent.trim();
      dot.setAttribute("aria-label", label ? `Xem ${label}` : `Xem lá bài ${i + 1}`);
      dot.addEventListener("click", () => { show(i); start(); });
      dots.append(dot);
    });
  }

  // Bấm vào lá để mở bảng kể chuyện. Vòng quay dừng khi bảng mở, chạy lại khi
  // đóng — nếu không, đọc xong ngẩng lên đã thấy lá khác.
  const dialog = document.querySelector("[data-story-dialog]");
  if (dialog && typeof dialog.showModal === "function") {
    const panels = [...dialog.querySelectorAll("[data-story-for]")];
    dialog.querySelector("[data-story-close]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", start);
    slides.forEach((slide, i) => slide.addEventListener("click", () => {
      const key = slide.dataset.story;
      const panel = panels.find((item) => item.dataset.storyFor === key);
      if (!panel) return;
      panels.forEach((item) => { item.hidden = item !== panel; });
      // <dialog> không tự có nhãn; gán aria-label để trình đọc màn hình xướng
      // đúng tên vị đang xem thay vì đọc trống.
      dialog.setAttribute("aria-label", panel.querySelector("h2")?.textContent || "Chuyện kể");
      show(i);
      stop();
      dialog.showModal();
    }));
  }

  // Dừng khi hover và khi focus giữ cho lá đọc được với người vừa dừng lại xem,
  // và không để timer chạy đua với người dùng bàn phím.
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  const stage = carousel.closest(".hero-stage") || carousel;
  stage.addEventListener("focusin", stop);
  stage.addEventListener("focusout", start);
  // Tab chạy nền vẫn bắn interval; không có dòng này thì người đọc quay lại sẽ
  // thấy một lá cách xa lá họ vừa rời đi.
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);
  const offReduced = onReducedMotionChange(start);

  show(index);
  start();

  return () => {
    stop();
    document.removeEventListener("visibilitychange", onVisibility);
    offReduced();
    // Listener gắn trên slide/carousel/dialog đi theo cây DOM mà Swup gỡ bỏ,
    // nên chỉ cần dọn những gì gắn ngoài container. Dialog thì phải đóng tay:
    // trình duyệt giữ modal ở lớp top-layer, gỡ DOM không tự trả lại cuộn trang.
    if (dialog?.open) dialog.close();
  };
}
