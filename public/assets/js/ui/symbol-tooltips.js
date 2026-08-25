/* Tooltip biểu tượng trên trang chi tiết lá.

   init() là async vì Floating UI được nạp trễ. Điều đó tạo ra một cuộc đua:
   người dùng có thể bấm sang trang khác trong lúc 21 KB thư viện đang về.
   Vì vậy hàm huỷ được trả về NGAY (đồng bộ) và giữ một cờ; khi import xong mà
   cờ đã tắt thì module tự thôi, không gắn gì vào trang mới. */

export function init() {
  const triggers = [...document.querySelectorAll("[data-symbol-trigger]")];
  if (!triggers.length) return () => {};

  let cancelled = false;
  let teardown = null;

  // Chỉ trang chi tiết có trigger mới trả thêm 21 KB. Trang chủ và thư viện 78
  // lá không nên gánh Floating UI cho một lớp tăng cường chúng không sử dụng.
  import("/assets/vendor/floating-ui.mjs")
    .then((floatingUi) => {
      if (cancelled) return;
      teardown = mount(triggers, floatingUi);
    })
    // Nếu bundle tăng cường không tải được, aria-describedby vẫn trỏ tới mục
    // biểu tượng tĩnh bên dưới và toàn bộ nội dung trang tiếp tục đọc được.
    .catch(() => {});

  return () => {
    cancelled = true;
    teardown?.();
    teardown = null;
  };
}

function mount(triggers, { computePosition, offset, flip, shift, arrow, autoUpdate }) {
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

  const onPointerDown = (event) => {
    if (currentTrigger && event.target !== currentTrigger && !tooltip.contains(event.target)) closeTooltip();
  };
  const onKeyDown = (event) => {
    if (event.key !== "Escape" || !currentTrigger) return;
    const trigger = currentTrigger;
    closeTooltip();
    trigger.focus();
  };
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);

  return () => {
    closeTooltip();
    document.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("keydown", onKeyDown);
    // Tooltip nằm trên <body>, ngoài container Swup — không tự gỡ thì mỗi lần
    // ghé một trang lá lại bỏ thêm một div mồ côi vào DOM.
    tooltip.remove();
  };
}
