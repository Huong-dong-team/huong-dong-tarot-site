/* This entry stays small. Neither WebGL nor an artwork texture loads until
   the visitor explicitly enters, on a desktop-sized fine-pointer device. */
import { DESKTOP_ONLY_QUERY, MOBILE_NOTE, normalizeData } from "../museum-3d/model.js";

export function init() {
  const main = document.querySelector('main[data-page="library"][data-museum-view="3d"]');
  const viewer = main?.querySelector("[data-museum-viewer]");
  if (!viewer) return () => {};
  const start = viewer.querySelector("[data-3d-start]");
  const host = viewer.querySelector("[data-3d-canvas]");
  const toolbar = main.querySelector("[data-3d-toolbar]");
  const status = main.querySelector("[data-3d-status]");
  const intro = viewer.querySelector(".mw-viewer-intro");
  const cover = viewer.querySelector(".mw-viewer-cover");
  const dataElement = main.querySelector("script[data-3d-data], script[data-museum-scene]");
  const dialog = main.querySelector("[data-3d-dialog]");
  if (!start || !host || !toolbar || !status || !dataElement) return () => {};

  const mobile = window.matchMedia(DESKTOP_ONLY_QUERY);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  let disposed = false;
  let generation = 0;
  let session = null;
  let opening = false;
  let opener = null;
  let note = main.querySelector(".mw-3d-mobile-note");
  let createdNote = false;
  if (!note) {
    note = document.createElement("p");
    note.className = "mw-3d-mobile-note";
    note.textContent = MOBILE_NOTE;
    start.insertAdjacentElement("afterend", note);
    createdNote = true;
  }
  let inspect = toolbar.querySelector("[data-3d-inspect]");
  let createdInspect = false;
  if (!inspect) {
    inspect = document.createElement("button");
    inspect.type = "button";
    inspect.dataset["3dInspect"] = "";
    inspect.textContent = "Xem hiện vật";
    toolbar.querySelector("[data-3d-next]")?.insertAdjacentElement("afterend", inspect);
    createdInspect = true;
  }

  const setStatus = (text) => { if (!disposed) status.textContent = text; };
  const listen = (target, name, callback) => target?.addEventListener(name, callback, { signal: events.signal });
  const returnFocus = () => {
    // A desktop→mobile change may close the dialog after its opener's toolbar
    // has become hidden. Do not send focus back into a hidden subtree.
    const target = opener?.isConnected && !opener.closest("[hidden], [inert]") ? opener : start;
    if (!disposed && !target.hidden) target.focus({ preventScroll: true });
  };
  const closeDetails = () => { if (dialog?.open) dialog.close(); };
  const showDetails = (item) => {
    if (!dialog || !item || disposed) return;
    opener = document.activeElement;
    const image = dialog.querySelector("[data-3d-image]");
    const title = dialog.querySelector("[data-3d-title]");
    const source = dialog.querySelector("[data-3d-source]");
    const noteElement = dialog.querySelector("[data-3d-note]");
    const link = dialog.querySelector("[data-3d-link]");
    if (image) { image.src = item.image; image.alt = item.title; }
    if (title) title.textContent = item.title;
    if (source) source.textContent = item.source;
    if (noteElement) noteElement.textContent = item.note || item.subtitle;
    if (link) { link.href = item.href; link.textContent = item.linkLabel; }
    session?.setPaused(true);
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-3d-close]")?.focus();
  };

  const stop = (message = "Đã rời phòng 3D. Bạn có thể tiếp tục xem bộ sưu tập 2D.", focus = true) => {
    generation += 1;
    opening = false;
    closeDetails();
    session?.dispose();
    session = null;
    host.replaceChildren();
    host.hidden = true;
    toolbar.hidden = true;
    if (intro) intro.hidden = false;
    if (cover) cover.hidden = false;
    viewer.classList.remove("is-3d-active");
    viewer.setAttribute("aria-busy", "false");
    start.disabled = mobile.matches;
    start.textContent = "Bước vào phòng 3D";
    setStatus(message);
    if (focus && !mobile.matches && !disposed) start.focus({ preventScroll: true });
  };
  const syncDevice = () => {
    if (mobile.matches && (session || opening)) {
      const hadFocus = viewer.contains(document.activeElement) || dialog?.contains(document.activeElement);
      stop(MOBILE_NOTE, false);
      if (hadFocus) viewer.querySelector(".mw-mobile-primary")?.focus({ preventScroll: true });
    }
    start.hidden = mobile.matches;
    start.disabled = mobile.matches || opening;
    note.hidden = !mobile.matches;
    if (mobile.matches) setStatus("Bản 2D được giữ nguyên để bạn cuộn và xem tranh thuận tiện trên thiết bị này.");
    else if (!session && !opening) setStatus("Phòng 3D sẵn sàng trên desktop. Chọn Bước vào phòng 3D để bắt đầu.");
  };

  const enter = async () => {
    if (disposed || mobile.matches || session || opening) return;
    const mine = ++generation;
    opening = true;
    start.disabled = true;
    viewer.setAttribute("aria-busy", "true");
    setStatus("Đang chuẩn bị kiến trúc và tối đa 6 hiện vật trong phòng…");
    try {
      const data = normalizeData(JSON.parse(dataElement.textContent), window.location.href);
      // The desktop gate above must remain before this import: no engine on mobile.
      const { createMuseum } = await import("../museum-3d/scene.js");
      if (disposed || mine !== generation || mobile.matches) return;
      host.hidden = false;
      toolbar.hidden = false;
      if (intro) intro.hidden = true;
      if (cover) cover.hidden = true;
      viewer.classList.add("is-3d-active");
      session = createMuseum({
        host, data, reducedMotion: reduced.matches,
        onStatus: setStatus,
        onSelect: showDetails,
        onFailure: () => {
          if (disposed || mine !== generation) return;
          stop("Trình duyệt không thể tiếp tục phòng 3D. Bộ sưu tập 2D vẫn dùng được; bạn có thể thử mở lại.");
          start.textContent = "Thử mở lại phòng 3D";
        },
      });
      opening = false;
      viewer.setAttribute("aria-busy", "false");
      start.disabled = false;
      session.focus();
    } catch (error) {
      if (disposed || mine !== generation) return;
      stop("Chưa mở được phòng 3D trên trình duyệt này. Mời bạn xem bộ sưu tập 2D hoặc thử lại.");
      start.textContent = "Thử mở lại phòng 3D";
      console.warn("[huong-dong] phòng 3D chưa sẵn sàng:", error);
    }
  };

  listen(start, "click", enter);
  listen(toolbar.querySelector("[data-3d-exit]"), "click", () => stop());
  listen(toolbar.querySelector("[data-3d-prev]"), "click", () => session?.step(-1));
  listen(toolbar.querySelector("[data-3d-next]"), "click", () => session?.step(1));
  listen(toolbar.querySelector("[data-3d-reset]"), "click", () => session?.reset());
  listen(inspect, "click", () => session?.inspect());
  listen(viewer, "keydown", (event) => {
    if (event.key === "Escape" && session && !dialog?.open) {
      event.preventDefault();
      stop();
    }
  });
  listen(dialog?.querySelector("[data-3d-close]"), "click", closeDetails);
  listen(dialog, "click", (event) => { if (event.target === dialog) closeDetails(); });
  listen(dialog, "close", () => { session?.setPaused(false); returnFocus(); });
  listen(mobile, "change", syncDevice);
  listen(reduced, "change", () => session?.setReducedMotion(reduced.matches));
  syncDevice();

  return () => {
    disposed = true;
    events.abort();
    stop("", false);
    if (createdNote) note.remove();
    if (createdInspect) inspect.remove();
  };
}
