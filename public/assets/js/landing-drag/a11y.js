/* Lớp accessibility cho dải kéo.

   Nguyên tắc: KHÔNG dùng aria-hidden hay inert cho slide ngoài khung nhìn.
   Đây là dải nội dung có thể cuộn, không phải carousel tự chạy — mọi lá bài,
   mọi bài viết phải đọc được liền mạch bằng trình đọc màn hình, đúng như khi
   chúng còn là một lưới. Embla đã tự cuộn tới slide nhận focus (watchFocus),
   nên người dùng bàn phím Tab qua từng liên kết vẫn thấy nó hiện ra. */

const LABEL_PREV = "Xem mục trước";
const LABEL_NEXT = "Xem mục kế tiếp";

/**
 * Gắn nhãn ARIA và hai nút điều hướng cho một dải kéo.
 * @param {object} options
 * @param {HTMLElement} options.viewport
 * @param {HTMLElement} options.rail
 * @param {import("../../vendor/embla-carousel.mjs").EmblaCarouselType} options.embla
 * @param {string} options.label nhãn đọc lên cho cả dải
 * @returns {{ controls: HTMLElement, destroy: () => void }}
 */
export function attachAccessibility({ viewport, rail, embla, label }) {
  viewport.setAttribute("role", "group");
  viewport.setAttribute("aria-roledescription", "dải kéo ngang");
  viewport.setAttribute("aria-label", label);

  const controls = document.createElement("div");
  controls.className = "drag-rail-controls";

  const previous = makeButton(LABEL_PREV, "‹");
  const next = makeButton(LABEL_NEXT, "›");
  controls.append(previous, next);

  const onPrevious = () => embla.scrollPrev();
  const onNext = () => embla.scrollNext();
  previous.addEventListener("click", onPrevious);
  next.addEventListener("click", onNext);

  // Mũi tên trái/phải chỉ hoạt động khi tiêu điểm đang ở trong dải. Không bắt
  // phím ở mức document: người đọc dùng mũi tên để cuộn trang, cướp phím của họ
  // trên toàn trang là phá thao tác quen thuộc.
  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); embla.scrollPrev(); }
    if (event.key === "ArrowRight") { event.preventDefault(); embla.scrollNext(); }
  };
  viewport.addEventListener("keydown", onKeyDown);

  // Nút đã hết đường đi phải bị vô hiệu hoá thật, không chỉ mờ đi — nếu không,
  // người dùng bàn phím vẫn Tab vào một nút không làm gì.
  const syncButtons = () => {
    previous.disabled = !embla.canScrollPrev();
    next.disabled = !embla.canScrollNext();
    // Kéo tắt (desktop hoặc reduced motion) thì hai nút cũng không còn ý nghĩa.
    const idle = !embla.canScrollPrev() && !embla.canScrollNext();
    controls.hidden = idle;
  };
  embla.on("select", syncButtons);
  embla.on("reInit", syncButtons);
  syncButtons();

  return {
    controls,
    destroy() {
      embla.off("select", syncButtons);
      embla.off("reInit", syncButtons);
      viewport.removeEventListener("keydown", onKeyDown);
      previous.removeEventListener("click", onPrevious);
      next.removeEventListener("click", onNext);
      controls.remove();
      viewport.removeAttribute("role");
      viewport.removeAttribute("aria-roledescription");
      viewport.removeAttribute("aria-label");
      rail.removeAttribute("tabindex");
    },
  };
}

function makeButton(label, glyph) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "drag-rail-button";
  button.setAttribute("aria-label", label);
  // Ký tự mũi tên là trang trí; nhãn thật nằm ở aria-label để trình đọc màn
  // hình không xướng "chevron trái". Dựng bằng API DOM, giữ đúng lệ của repo
  // là không bao giờ ghép chuỗi HTML vào cây tài liệu.
  const mark = document.createElement("span");
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = glyph;
  button.append(mark);
  return button;
}
