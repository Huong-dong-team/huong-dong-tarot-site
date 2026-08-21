const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Nghiêng theo chuột (hiệu ứng 1). Chỉ xoay .hero-carousel; .hero-stage đang
// giữ heroReveal nên xoay nó sẽ bị keyframe nuốt. Gom mỗi lần di chuột vào một
// khung hình bằng requestAnimationFrame để không giật. Bỏ qua trên máy cảm ứng
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

// Đưa cụm mặt trời (trống đồng mờ + quầng + tia) vào đúng tâm mặt trời của
// tranh nền. Nền dùng background cover nên vị trí mặt trời đổi theo kích thước
// hero — CSS thuần không tính được. Chạy cả khi giảm chuyển động vì đây là định
// vị chứ không phải hiệu ứng. Tâm mặt trời đo từ ảnh: 68,7% ngang, 44,1% dọc.
function positionHeroSun() {
  const hero = document.querySelector(".hero");
  const sun = document.querySelector("[data-hero-sun]");
  if (!hero || !sun) return;
  const IMG_W = 1536;
  const IMG_H = 1024;
  const SUN_X = 0.687;
  const SUN_Y = 0.441;
  let raf = 0;
  const place = () => {
    raf = 0;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    // Oversize: trống đồng lớn hơn hero, cắt mép (overflow ẩn). Lấy theo chiều
    // cao ×1.2 nhưng chặn theo bề ngang để mobile không phình vô lý.
    const size = Math.min(h * 1.2, w * 1.6);
    sun.style.width = `${Math.round(size)}px`;
    // Tâm mặt trời trong tranh, tính qua cover math nên khít ở mọi màn hình.
    const scale = Math.max(w / IMG_W, h / IMG_H);
    const cx = (w - IMG_W * scale) / 2 + SUN_X * IMG_W * scale;
    const cy = (h - IMG_H * scale) / 2 + SUN_Y * IMG_H * scale;
    sun.style.left = `${Math.round(cx - size / 2)}px`;
    sun.style.top = `${Math.round(cy - size / 2)}px`;
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(place); };
  place();
  window.addEventListener("load", place);
  window.addEventListener("resize", schedule);
  // Hero đổi chiều cao khi font/ảnh xong hoặc nội dung đổi dòng — ResizeObserver
  // giữ trống đồng luôn đồng tâm khít, không phụ thuộc thời điểm load. Gọi place
  // trực tiếp (không qua rAF): cụm mặt trời tuyệt đối, pointer-events none nên
  // không đổi cỡ hero, không gây vòng lặp observer.
  if ("ResizeObserver" in window) new ResizeObserver(place).observe(hero);
}
positionHeroSun();

// Hiện dần khi cuộn (hiệu ứng 5). Gắn lớp .reveal bằng JS chứ không đặt sẵn
// trong HTML: trang không chạy được script vẫn hiện đủ nội dung. Dùng vị trí
// đo bằng getBoundingClientRect thay vì IntersectionObserver — IO phụ thuộc
// pipeline dựng hình, nếu nó không phát thì nội dung kẹt ẩn vĩnh viễn. Bỏ qua
// khi giảm chuyển động để nội dung hiện ngay.
function initReveal() {
  if (reduceMotion.matches) return;
  let pending = [...document.querySelectorAll(".section-heading, .immortals-grid li, .card-grid > a, .news-grid article, .houses-figure, .lac-figure, .story-panels article")];
  if (!pending.length) return;
  pending.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });
  let raf = 0;
  const check = () => {
    raf = 0;
    const trigger = window.innerHeight * 0.92;
    pending = pending.filter((element) => {
      if (element.getBoundingClientRect().top >= trigger) return true;
      element.classList.add("reveal-in");
      return false;
    });
    if (!pending.length) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  check();
}
initReveal();

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
  let arcana = new URLSearchParams(location.search).get("arcana") || "all";
  const apply = () => {
    const term = normalize(search.value);
    let shown = 0;
    cards.forEach((card) => {
      const visible = (arcana === "all" || card.dataset.arcana === arcana) && (!suit.value || card.dataset.suit === suit.value) && (!term || normalize(card.dataset.search).includes(term));
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    count.textContent = String(shown);
    empty.hidden = shown > 0;
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

// Cinematic hero: sparse drifting bronze dust motes behind the hero card.
// (The hero-card entrance reveal is pure CSS — see main.css — so it isn't
// dependent on this script loading or running.) Additive only — no-ops if
// the canvas isn't in the markup, and bails out entirely under
// prefers-reduced-motion (matches the "hạt bụi" / restrained-motion
// language already approved for this project).
function initHeroDust() {
  const canvas = document.querySelector(".hero-dust");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let motes = [];
  let raf = 0;
  let t = 0;

  const size = () => {
    const hero = canvas.closest(".hero");
    const rect = (hero || canvas).getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((width * height) / 26000);
    motes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      vy: -(Math.random() * 0.16 + 0.03),
      vx: (Math.random() - 0.5) * 0.1,
      a: Math.random() * 0.36 + 0.08,
      ph: Math.random() * Math.PI * 2,
    }));
  };
  // A module script runs after DOM parsing but can still land before the
  // browser's first layout pass finishes (fonts, image intrinsic sizes),
  // which would size the canvas from a not-yet-settled 0/near-0 rect.
  // Re-measure on the next frame and once more after full page load.
  size();
  requestAnimationFrame(size);
  window.addEventListener("load", size);
  window.addEventListener("resize", size);

  const tick = () => {
    t += 0.016;
    ctx.clearRect(0, 0, width, height);
    for (const mote of motes) {
      mote.y += mote.vy;
      mote.x += mote.vx + Math.sin(t * 0.4 + mote.ph) * 0.12;
      if (mote.y < -6) { mote.y = height + 6; mote.x = Math.random() * width; }
      if (mote.x < -6) mote.x = width + 6;
      if (mote.x > width + 6) mote.x = -6;
      const glow = mote.a * (0.55 + 0.45 * Math.sin(t * 1.2 + mote.ph));
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(199,150,78,${glow.toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  window.addEventListener("beforeunload", () => {
    window.removeEventListener("resize", size);
    cancelAnimationFrame(raf);
  });
}
initHeroDust();

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
