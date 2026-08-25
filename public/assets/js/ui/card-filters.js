import { motionGate } from "../motion-gate.js";

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/* Bộ lọc thư viện 78 lá.

   Đọc ?arcana= và ?suit= từ URL ngay lúc init. Nhờ vậy khi Swup đưa người dùng
   từ menu con "Nhà Sen" sang /la-bai/?suit=cups, module khởi tạo lại và đọc
   đúng URL mới — không cần biết mình vừa được dựng lại hay tải lần đầu. */

export function init() {
  const filters = document.querySelector("[data-card-filters]");
  if (!filters) return () => {};
  const grid = document.querySelector("[data-card-grid]");
  if (!grid) return () => {};

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

  const closeGate = motionGate(grid, {
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

  const buttons = [...filters.querySelectorAll("[data-filter]")];
  buttons.forEach((button) => button.addEventListener("click", () => {
    arcana = button.dataset.filter;
    buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    if (arcana === "major") suit.value = "";
    apply();
  }));
  search.addEventListener("input", apply);
  suit.addEventListener("change", () => {
    if (suit.value) {
      arcana = "minor";
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === "minor")));
    }
    apply();
  });
  const initial = filters.querySelector(`[data-filter="${arcana}"]`);
  if (initial) initial.click(); else apply();

  return () => {
    // motionGate giữ IntersectionObserver và listener trên document; chỉ nó là
    // thứ sống ngoài cây DOM mà Swup gỡ đi.
    closeGate();
    finishCardEntries();
  };
}
