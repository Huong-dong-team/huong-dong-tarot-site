/* Khung tranh mở đầu trang chủ.

   Tên tệp và tên hook giữ nguyên từ thời còn vòng quay năm lá; từ 27/08/2026
   Hero chỉ còn MỘT bức tĩnh nên toàn bộ phần timer, chấm điều hướng và ghi lại
   dòng eyebrow đã bị gỡ. Cái còn lại đúng một việc: bấm vào lá thì mở bảng kể
   chuyện của lá đó.

   Progressive enhancement: markup đã xuất lá với .is-active, nên trang không
   chạy được script vẫn có một Hero đúng và đầy đủ — chỉ thiếu bảng kể chuyện.

   Vòng đời: <dialog> đang mở phải được đóng trong destroy(). Một dialog modal
   còn mở khi Swup thay nội dung sẽ khoá cuộn của trang mới và giam focus vào
   một phần tử không còn tồn tại. */

export function init() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return () => {};

  const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
  const dialog = document.querySelector("[data-story-dialog]");
  if (!slides.length || !dialog || typeof dialog.showModal !== "function") return () => {};

  const panels = [...dialog.querySelectorAll("[data-story-for]")];
  dialog.querySelector("[data-story-close]")?.addEventListener("click", () => dialog.close());

  for (const slide of slides) {
    slide.addEventListener("click", () => {
      const key = slide.dataset.story;
      const panel = panels.find((item) => item.dataset.storyFor === key);
      if (!panel) return;
      for (const item of panels) item.hidden = item !== panel;
      // <dialog> không tự có nhãn; gán aria-label để trình đọc màn hình xướng
      // đúng tên vị đang xem thay vì đọc trống.
      dialog.setAttribute("aria-label", panel.querySelector("h2")?.textContent || "Chuyện kể");
      dialog.showModal();
    });
  }

  return () => {
    // Listener gắn trên lá và dialog đi theo cây DOM mà Swup gỡ bỏ, nên chỉ còn
    // dialog là phải đóng tay: trình duyệt giữ modal ở lớp top-layer, gỡ DOM
    // không tự trả lại cuộn trang.
    if (dialog.open) dialog.close();
  };
}
