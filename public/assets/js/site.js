import { motionGate } from "./motion-gate.js";

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Nghiêng theo chuột (hiệu ứng 1). Chỉ xoay .hero-carousel để không thay đổi
// layout của .hero-stage. Gom mỗi lần di chuột vào một khung hình bằng
// requestAnimationFrame để không giật. Bỏ qua trên máy cảm ứng
// (không có con trỏ để lần theo) và khi người dùng chọn giảm chuyển động.
function initHeroTilt() {
  const hero = document.querySelector(".hero");
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!hero || !carousel) return;
  if (reduceMotion.matches || !window.matchMedia("(hover: hover)").matches) return;

  let raf = 0;
  let nx = 0;
  let ny = 0;
  const render = () => {
    raf = 0;
    carousel.style.transform = `rotateY(${(nx * 5).toFixed(2)}deg) rotateX(${(-ny * 5).toFixed(2)}deg)`;
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    nx = (event.clientX - rect.left) / rect.width - 0.5;
    ny = (event.clientY - rect.top) / rect.height - 0.5;
    schedule();
  });
  hero.addEventListener("pointerleave", () => { nx = 0; ny = 0; schedule(); });
}
initHeroTilt();

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navigation?.toggleAttribute("data-open", open);
});

const filters = document.querySelector("[data-card-filters]");
if (filters) {
  const grid = document.querySelector("[data-card-grid]");
  const cards = [...grid.querySelectorAll("[data-arcana]")];
  const search = filters.elements.q;
  const suit = filters.elements.suit;
  const count = filters.querySelector("[data-result-count]");
  const empty = document.querySelector("[data-empty]");
  const params = new URLSearchParams(location.search);
  let arcana = params.get("arcana") || "all";
  // Menu con "78 lá bài" trỏ thẳng tới từng nhà bằng ?suit=. Bốn nhà đều nằm
  // trong Ẩn Phụ nên phải kéo arcana theo, giống hệt việc người dùng tự chọn
  // trong ô select — nếu không, bộ lọc sẽ giao "tất cả" với một nhà và nút
  // nhóm bài hiện sai trạng thái.
  const suitFromUrl = params.get("suit");
  if (suitFromUrl && [...suit.options].some((option) => option.value === suitFromUrl)) {
    suit.value = suitFromUrl;
    arcana = "minor";
  }
  let filterMotionAllowed = false;
  let enterFrame = 0;
  const enteringCards = new Set();

  const finishCardEntries = () => {
    cancelAnimationFrame(enterFrame);
    enterFrame = 0;
    enteringCards.forEach((card) => card.classList.remove("is-filter-entering"));
    enteringCards.clear();
  };

  const playCardEntries = () => {
    if (!enteringCards.size) return;
    // Hai khung hình tách trạng thái đầu và cuối thành hai lần sơn thật. Không
    // cần đo layout của 78 lá như FLIP, nên máy yếu chỉ trả giá cho thẻ vừa hiện.
    enterFrame = requestAnimationFrame(() => {
      enterFrame = requestAnimationFrame(finishCardEntries);
    });
  };

  motionGate(grid, {
    onEnter() {
      filterMotionAllowed = true;
      grid.classList.add("is-filter-motion-ready");
    },
    onLeave() {
      filterMotionAllowed = false;
      grid.classList.remove("is-filter-motion-ready");
      finishCardEntries();
    },
  });

  const apply = () => {
    finishCardEntries();
    const term = normalize(search.value);
    let shown = 0;
    cards.forEach((card) => {
      const visible = (arcana === "all" || card.dataset.arcana === arcana) && (!suit.value || card.dataset.suit === suit.value) && (!term || normalize(card.dataset.search).includes(term));
      if (visible && card.hidden && filterMotionAllowed) {
        card.classList.add("is-filter-entering");
        enteringCards.add(card);
      }
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    count.textContent = String(shown);
    empty.hidden = shown > 0;
    playCardEntries();
  };
  filters.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    arcana = button.dataset.filter;
    filters.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    if (arcana === "major") suit.value = "";
    apply();
  }));
  search.addEventListener("input", apply);
  suit.addEventListener("change", () => {
    if (suit.value) {
      arcana = "minor";
      filters.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === "minor")));
    }
    apply();
  });
  const initial = filters.querySelector(`[data-filter="${arcana}"]`);
  if (initial) initial.click(); else apply();
}

async function initSymbolTooltips() {
  const triggers = [...document.querySelectorAll("[data-symbol-trigger]")];
  if (!triggers.length) return;

  // Chỉ trang chi tiết có trigger mới trả thêm 21 KB. Trang chủ và thư viện 78
  // lá không nên gánh Floating UI cho một lớp tăng cường chúng không sử dụng.
  const { computePosition, offset, flip, shift, arrow, autoUpdate } = await import("/assets/vendor/floating-ui.mjs");
  const tooltip = document.createElement("div");
  const tooltipTitle = document.createElement("strong");
  const tooltipMeaning = document.createElement("span");
  const tooltipArrow = document.createElement("span");
  tooltip.id = "symbol-tooltip";
  tooltip.className = "symbol-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  tooltipTitle.className = "symbol-tooltip-title";
  tooltipMeaning.className = "symbol-tooltip-meaning";
  tooltipArrow.className = "symbol-tooltip-arrow";
  tooltipArrow.setAttribute("aria-hidden", "true");
  tooltip.append(tooltipTitle, tooltipMeaning, tooltipArrow);
  document.body.append(tooltip);

  let currentTrigger = null;
  let stopAutoUpdate = null;

  // Chỉ biến nhãn tĩnh thành control sau khi thư viện đã tải thành công. Nếu JS
  // chết, trang không để lại một "nút" bàn phím hứa mở nhưng không làm gì.
  triggers.forEach((trigger) => {
    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-expanded", "false");
  });

  const closeTooltip = () => {
    stopAutoUpdate?.();
    stopAutoUpdate = null;
    if (currentTrigger) {
      currentTrigger.setAttribute("aria-expanded", "false");
      currentTrigger.setAttribute("aria-describedby", currentTrigger.dataset.symbolSource);
    }
    currentTrigger = null;
    tooltip.hidden = true;
  };

  const updatePosition = async () => {
    const anchor = currentTrigger;
    if (!anchor || tooltip.hidden) return;
    const { x, y, placement, middlewareData } = await computePosition(anchor, tooltip, {
      placement: "top",
      strategy: "fixed",
      middleware: [offset(10), flip(), shift({ padding: 12 }), arrow({ element: tooltipArrow })],
    });
    if (anchor !== currentTrigger || tooltip.hidden) return;
    Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });

    const side = placement.split("-")[0];
    const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[side];
    const arrowData = middlewareData.arrow || {};
    Object.assign(tooltipArrow.style, { left: "", top: "", right: "", bottom: "" });
    if (arrowData.x != null) tooltipArrow.style.left = `${arrowData.x}px`;
    if (arrowData.y != null) tooltipArrow.style.top = `${arrowData.y}px`;
    tooltipArrow.style[staticSide] = "-5px";
  };

  const openTooltip = (trigger) => {
    if (currentTrigger === trigger && !tooltip.hidden) return;
    const source = document.getElementById(trigger.dataset.symbolSource);
    if (!source) return;
    closeTooltip();
    tooltipTitle.textContent = source.querySelector("h4")?.textContent || "Biểu tượng";
    tooltipMeaning.textContent = source.querySelector("p")?.textContent || "";
    tooltip.hidden = false;
    currentTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-describedby", tooltip.id);
    stopAutoUpdate = autoUpdate(trigger, tooltip, updatePosition);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("pointerenter", () => openTooltip(trigger));
    trigger.addEventListener("pointerleave", () => {
      if (document.activeElement !== trigger) closeTooltip();
    });
    trigger.addEventListener("focus", () => openTooltip(trigger));
    trigger.addEventListener("blur", closeTooltip);
    trigger.addEventListener("click", () => openTooltip(trigger));
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openTooltip(trigger);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (currentTrigger && event.target !== currentTrigger && !tooltip.contains(event.target)) closeTooltip();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !currentTrigger) return;
    const trigger = currentTrigger;
    closeTooltip();
    trigger.focus();
  });
}

// Nếu bundle tăng cường không tải được, aria-describedby vẫn trỏ tới mục biểu
// tượng tĩnh bên dưới và toàn bộ nội dung trang tiếp tục đọc được.
initSymbolTooltips().catch(() => {});

document.querySelectorAll("[data-share]").forEach((button) => button.addEventListener("click", async () => {
  const encodedUrl = encodeURIComponent(location.href);
  const encodedText = encodeURIComponent(document.title);
  if (button.dataset.share === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer,width=720,height=600");
  if (button.dataset.share === "threads") window.open(`https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`, "_blank", "noopener,noreferrer,width=720,height=600");
  if (button.dataset.share === "copy") {
    await navigator.clipboard.writeText(location.href);
    button.textContent = "Đã sao chép";
  }
}));

// Hero carousel. Progressive enhancement: the markup already ships the
// first slide with .is-active, so a page whose script never runs still
// shows a correct, complete hero — this only adds the dots and the
// rotation on top.
function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
  if (slides.length < 2) return;

  const dots = document.querySelector("[data-hero-dots]");
  const eyebrow = document.querySelector("[data-hero-eyebrow]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DELAY = 7000;
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) index = 0;
  let timer = 0;

  // Inert slides must leave the tab order and the accessibility tree, or
  // keyboard and screen-reader users land on a card nobody can see.
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
  // Honour reduced motion at every start, not just on load: the setting can
  // be toggled mid-session and the listener below re-runs this.
  const start = () => { stop(); if (!reduced.matches) timer = setInterval(() => show(index + 1), DELAY); };

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

  // Pausing on hover and on focus keeps the card readable for anyone who
  // stopped to look at it, and stops the timer racing a keyboard user.
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  const stage = carousel.closest(".hero-stage") || carousel;
  stage.addEventListener("focusin", stop);
  stage.addEventListener("focusout", start);
  // A background tab still fires intervals; without this the visitor
  // returns to a card several slides on from the one they left.
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduced.addEventListener("change", start);

  show(index);
  start();
}
initHeroCarousel();

document.querySelectorAll("[data-waitlist]").forEach((form) => form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = form.querySelector(".form-status");
  const email = form.elements.email.value.trim().toLowerCase();
  const source = form.elements.source?.value || "website";
  const projectId = document.body.dataset.firebaseProject;
  const apiKey = document.body.dataset.firebaseKey;
  if (!apiKey || !projectId || projectId.includes("HUONG-DONG")) {
    status.textContent = "Bản xem thử đã nhận email trên thiết bị; hãy kết nối Firebase trước khi phát hành.";
    localStorage.setItem("huong-dong-waitlist-demo", JSON.stringify({ email, source, at: new Date().toISOString() }));
    form.reset();
    return;
  }
  const id = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email)).then((bytes) => [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join(""));
  status.textContent = "Đang ghi nhận…";
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/subscribers?documentId=${id}&key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { email: { stringValue: email }, source: { stringValue: source }, note: { stringValue: "" }, createdAt: { timestampValue: new Date().toISOString() } } }) });
    if (!response.ok && response.status !== 409) throw new Error("request-failed");
    status.textContent = response.status === 409 ? "Email này đã có trong danh sách." : "Đã ghi nhận. Hẹn gặp bạn trong lá thư đầu tiên.";
    form.reset();
  } catch {
    status.textContent = "Chưa ghi nhận được. Vui lòng thử lại sau.";
  }
}));
