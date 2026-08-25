import EmblaCarousel from "/assets/vendor/embla-carousel.mjs";
import { attachAccessibility } from "./a11y.js";
import { prefersReducedMotion, onReducedMotionChange } from "../shared/reduced-motion.js";

/* Dải kéo ngang cho ba khối trang chủ.

   Ba tầng, xếp từ "không có gì" lên:

     1. HTML tĩnh   — vẫn là <ol>/<div> chứa đủ mục, đọc được, index được.
     2. CSS         — dưới 900px chuyển thành dải cuộn ngang có scroll-snap.
                      Không JS thì đây đã là một dải kéo hoàn chỉnh bằng ngón tay.
     3. Module này  — thêm quán tính, snap mượt, nút Trước/Sau và điều hướng
                      bàn phím lên trên tầng 2.

   Trên desktop Embla đứng im (active chỉ bật dưới 900px), nên lưới bàn giấy
   giữ nguyên 100% và không phải trả giá cho một engine không dùng tới. */

const BREAKPOINT = "(max-width: 900px)";

export function init() {
  const rails = [...document.querySelectorAll("[data-drag-rail]")];
  if (!rails.length) return () => {};

  const mounted = rails.map(mountRail).filter(Boolean);
  if (!mounted.length) return () => {};

  // Người dùng bật giảm chuyển động giữa phiên: dựng lại với thời lượng 0 để
  // snap thành một bước nhảy tức thì, nhưng vẫn kéo được bằng ngón tay.
  const offReduced = onReducedMotionChange(() => {
    mounted.forEach((rail) => rail.embla.reInit(scrollOptions()));
  });

  return () => {
    offReduced();
    mounted.forEach((rail) => rail.destroy());
  };
}

function scrollOptions() {
  return {
    // duration của Embla tính bằng "đơn vị kéo", không phải ms. 25 là mặc định;
    // 0 biến mọi cú snap thành nhảy tức thì cho reduced motion.
    duration: prefersReducedMotion() ? 0 : 25,
  };
}

function mountRail(rail) {
  // Chống khởi tạo hai lần trên cùng một phần tử. Registry đã đảm bảo điều này,
  // nhưng module cũng phải tự chịu trách nhiệm nếu ai đó gọi init() thủ công.
  if (rail.dataset.dragRailMounted !== undefined) return null;

  const label = rail.dataset.dragRail || "Dải nội dung";
  const parent = rail.parentElement;
  if (!parent) return null;

  // Embla cần một viewport cắt tràn bao ngoài container. Bọc lúc chạy thay vì
  // nhét sẵn vào template: HTML tĩnh giữ nguyên một khối duy nhất, và khi module
  // huỷ thì cây DOM trở lại đúng như build đã xuất ra.
  const viewport = document.createElement("div");
  viewport.className = "drag-rail-viewport";
  parent.insertBefore(viewport, rail);
  viewport.append(rail);

  const embla = EmblaCarousel(viewport, {
    container: rail,
    align: "start",
    containScroll: "trimSnaps",
    // Mặc định 10px quá nhạy trên điện thoại: một cú vuốt dọc hơi chéo đã bị
    // hiểu thành kéo ngang. 16px đủ để phân biệt ý định mà vẫn không thấy nặng.
    dragThreshold: 16,
    // Không loop: dải này là danh sách có đầu có cuối, quay vòng làm người đọc
    // mất cảm giác đã xem hết chưa.
    loop: false,
    skipSnaps: false,
    active: false,
    breakpoints: { [BREAKPOINT]: { active: true } },
    ...scrollOptions(),
  });

  const a11y = attachAccessibility({ viewport, rail, embla, label });
  viewport.after(a11y.controls);

  rail.dataset.dragRailMounted = "";

  // Theo dõi breakpoint bằng matchMedia của chính module, không dựa vào sự kiện
  // của Embla: khi Embla đang ở trạng thái active:false nó không dựng bộ phát
  // sự kiện, nên "reInit" có thể không tới nơi ở đúng lần chuyển quan trọng nhất.
  const media = window.matchMedia(BREAKPOINT);
  const onMediaChange = () => syncState(viewport, rail, media);
  if (media.addEventListener) media.addEventListener("change", onMediaChange);
  else media.addListener(onMediaChange);
  syncState(viewport, rail, media);

  return {
    embla,
    destroy() {
      if (media.removeEventListener) media.removeEventListener("change", onMediaChange);
      else media.removeListener(onMediaChange);
      a11y.destroy();
      embla.destroy();
      // Trả DOM về hình dạng gốc: gỡ lớp bọc, đưa dải về đúng chỗ cũ.
      viewport.before(rail);
      viewport.remove();
      rail.classList.remove("is-drag-enhanced");
      delete rail.dataset.dragRailMounted;
    },
  };
}

/* Lớp is-drag-enhanced tắt scroll-snap của tầng CSS. Chỉ bật khi Embla thật sự
   đang cầm lái — nếu bật vô điều kiện thì khi cửa sổ phóng qua 900px, dải mất
   cả scroll-snap lẫn Embla và không còn cuộn ngang được nữa. */
function syncState(viewport, rail, media) {
  const active = media.matches;
  viewport.classList.toggle("is-drag-active", active);
  rail.classList.toggle("is-drag-enhanced", active);
}
