/* Chế độ “ngắm cận cảnh” cho Bảo tàng 78 lá.

   Không nhân đôi dữ liệu vào JavaScript: module đọc ảnh, nhãn và tóm tắt ngay
   từ hiện vật đang hiển thị. Nhờ vậy build từ Firestore đổi nội dung thì modal
   đổi theo, còn Swup có thể huỷ toàn bộ listener khi rời trang. */

export function init() {
  const dialog = document.querySelector("[data-museum-dialog]");
  const wall = document.querySelector("[data-card-grid]");
  if (!(dialog instanceof HTMLDialogElement) || !wall) return () => {};

  const exhibits = [...wall.querySelectorAll(".museum-exhibit")];
  const close = dialog.querySelector("[data-museum-close]");
  const previous = dialog.querySelector("[data-museum-prev]");
  const next = dialog.querySelector("[data-museum-next]");
  const image = dialog.querySelector("[data-museum-dialog-image]");
  const accession = dialog.querySelector("[data-museum-dialog-accession]");
  const title = dialog.querySelector("[data-museum-dialog-title]");
  const original = dialog.querySelector("[data-museum-dialog-original]");
  const summary = dialog.querySelector("[data-museum-dialog-summary]");
  const source = dialog.querySelector("[data-museum-dialog-source]");
  const note = dialog.querySelector("[data-museum-dialog-note]");
  const detailLink = dialog.querySelector("[data-museum-dialog-link]");
  let current = null;
  let opener = null;

  const visibleExhibits = () => exhibits.filter((exhibit) => !exhibit.hidden);

  const render = (exhibit) => {
    const artwork = exhibit.querySelector(".museum-frame img");
    const plaque = exhibit.querySelector(".museum-plaque");
    const link = exhibit.querySelector(".museum-frame");
    current = exhibit;
    image.src = artwork.dataset.fullImage || artwork.currentSrc || artwork.src;
    image.alt = artwork.alt;
    accession.textContent = plaque.querySelector(".museum-accession")?.textContent || "Hiện vật Hường Đông";
    title.textContent = plaque.querySelector("h2")?.textContent || "Lá bài Hường Đông";
    original.textContent = plaque.querySelector(".museum-original")?.textContent || "";
    summary.textContent = plaque.querySelector(".museum-summary")?.textContent || "";
    source.textContent = plaque.querySelector(".museum-source")?.textContent || "Hồ sơ Hường Đông";
    if (note) {
      note.textContent = plaque.querySelector("[data-museum-note]")?.textContent || "";
      note.hidden = !note.textContent;
    }
    detailLink.href = link?.href || "/la-bai/";
    const onlyOne = visibleExhibits().length < 2;
    previous.disabled = onlyOne;
    next.disabled = onlyOne;
  };

  const move = (step) => {
    const visible = visibleExhibits();
    if (!visible.length) return;
    const index = Math.max(0, visible.indexOf(current));
    render(visible[(index + step + visible.length) % visible.length]);
  };

  const openExhibit = (button) => {
    const exhibit = button.closest(".museum-exhibit");
    if (!exhibit) return;
    opener = button;
    render(exhibit);
    if (!dialog.open) dialog.showModal();
    close?.focus();
  };

  const onWallClick = (event) => {
    const button = event.target.closest("[data-museum-preview]");
    if (button) openExhibit(button);
  };
  const onDialogClick = (event) => {
    if (event.target === dialog || event.target.closest("[data-museum-close]")) dialog.close();
  };
  const onKeydown = (event) => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  };
  const onClosed = () => opener?.focus();
  const onPrevious = () => move(-1);
  const onNext = () => move(1);

  wall.addEventListener("click", onWallClick);
  dialog.addEventListener("click", onDialogClick);
  dialog.addEventListener("close", onClosed);
  previous?.addEventListener("click", onPrevious);
  next?.addEventListener("click", onNext);
  document.addEventListener("keydown", onKeydown);

  return () => {
    wall.removeEventListener("click", onWallClick);
    dialog.removeEventListener("click", onDialogClick);
    dialog.removeEventListener("close", onClosed);
    previous?.removeEventListener("click", onPrevious);
    next?.removeEventListener("click", onNext);
    document.removeEventListener("keydown", onKeydown);
    if (dialog.open) dialog.close();
  };
}
