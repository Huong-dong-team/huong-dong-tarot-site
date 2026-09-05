import { onReducedMotionChange, prefersReducedMotion } from "../shared/reduced-motion.js";

/* Nghiêng rất nhẹ theo vị trí con trỏ/chạm.

   Đây là một lớp trang trí có vòng đời: registry khởi tạo lại module sau mỗi
   lần Swup thay DOM và gọi hàm huỷ trước khi rời trang. Không dùng thư viện
   gesture để giữ bundle hiện tại gọn và để thao tác chạm vẫn là một liên kết
   bình thường. */

const MAX_TILT = 4;
// .lacquer-tilt là lớp bọc dùng chung cho mọi khối "sơn son thếp vàng"
// (hero-halo.css: ảnh sản phẩm hero, khối hộp ở #bao-bai). KHÔNG phải
// .hero-product/.hero-carousel hay .pack-image-frame — các lớp đó đang giữ
// transform của animation entrance/layout nên không được đụng vào ở đây.
const TARGET_SELECTOR = ".tarot-card, .card-art, .hd-card, .lacquer-tilt";

function setTilt(element, clientX, clientY) {
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((clientY - rect.top) / rect.height) * 2 - 1;
  const rotateX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -y * MAX_TILT));
  const rotateY = Math.max(-MAX_TILT, Math.min(MAX_TILT, x * MAX_TILT));

  element.style.setProperty("--hd-tilt-x", `${rotateX.toFixed(2)}deg`);
  element.style.setProperty("--hd-tilt-y", `${rotateY.toFixed(2)}deg`);
  element.classList.add("hd-tilt-active");
}

function resetTilt(element) {
  element.style.setProperty("--hd-tilt-x", "0deg");
  element.style.setProperty("--hd-tilt-y", "0deg");
  element.classList.remove("hd-tilt-active");
}

export function init() {
  const scope = document.querySelector("#noi-dung-chinh") || document;
  // Museum works are hung still. In particular, touch browsing must not
  // capture the pointer or run a tilt observer across a long catalogue.
  if (scope instanceof Element && scope.hasAttribute("data-museum-world")) return () => {};
  const elements = new Set();
  const listeners = new Map();
  let frame = 0;
  let pending = null;
  const touchPointers = new WeakMap();

  const queueTilt = (element, event) => {
    pending = { element, clientX: event.clientX, clientY: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pending || prefersReducedMotion()) return;
      const next = pending;
      pending = null;
      setTilt(next.element, next.clientX, next.clientY);
    });
  };

  const clearPending = (element) => {
    if (pending?.element === element) pending = null;
  };

  const resetAndUnstyle = (element) => {
    clearPending(element);
    resetTilt(element);
    element.classList.remove("hd-tilt-ready");
    element.style.removeProperty("--hd-tilt-x");
    element.style.removeProperty("--hd-tilt-y");
  };

  const attach = (element) => {
    if (elements.has(element)) return;
    elements.add(element);
    element.classList.toggle("hd-tilt-ready", !prefersReducedMotion());

    const onPointerEnter = (event) => {
      if (event.pointerType === "touch" || prefersReducedMotion()) return;
      queueTilt(element, event);
    };
    const onPointerMove = (event) => {
      if (prefersReducedMotion()) return;
      if (event.pointerType === "touch" && touchPointers.get(element) !== event.pointerId) return;
      queueTilt(element, event);
    };
    const onPointerDown = (event) => {
      if (event.pointerType !== "touch" || prefersReducedMotion()) return;
      touchPointers.set(element, event.pointerId);
      element.setPointerCapture?.(event.pointerId);
      queueTilt(element, event);
    };
    const onPointerLeave = (event) => {
      if (event.pointerType === "touch" && touchPointers.has(element)) return;
      clearPending(element);
      resetTilt(element);
    };
    const onPointerEnd = (event) => {
      if (event.pointerType === "touch" && touchPointers.get(element) !== event.pointerId) return;
      touchPointers.delete(element);
      clearPending(element);
      resetTilt(element);
    };

    const bindings = [
      ["pointerenter", onPointerEnter],
      ["pointermove", onPointerMove],
      ["pointerdown", onPointerDown],
      ["pointerleave", onPointerLeave],
      ["pointerup", onPointerEnd],
      ["pointercancel", onPointerEnd],
    ];
    bindings.forEach(([eventName, handler]) => element.addEventListener(eventName, handler));
    listeners.set(element, bindings);
  };

  const detach = (element) => {
    listeners.get(element)?.forEach(([eventName, handler]) => element.removeEventListener(eventName, handler));
    listeners.delete(element);
    touchPointers.delete(element);
    elements.delete(element);
    resetAndUnstyle(element);
  };

  const syncTargets = () => {
    elements.forEach((element) => {
      if (!scope.contains(element)) detach(element);
    });
    scope.querySelectorAll(TARGET_SELECTOR).forEach(attach);
  };

  syncTargets();
  const observer = "MutationObserver" in window
    ? new MutationObserver(syncTargets)
    : null;
  observer?.observe(scope, { childList: true, subtree: true });

  const unsubscribeReducedMotion = onReducedMotionChange((reduced) => {
    elements.forEach((element) => {
      resetTilt(element);
      element.classList.toggle("hd-tilt-ready", !reduced);
    });
  });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = null;
    observer?.disconnect();
    unsubscribeReducedMotion();
    [...elements].forEach(detach);
  };
}
