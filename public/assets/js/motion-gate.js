/* Cổng chuyển động — dừng hiệu ứng khi không có ai nhìn.

   Lý do cần file này: canvas hạt bụi ở hero và hai animation trên .hero-sun
   hiện chạy suốt phiên, kể cả khi người dùng đã cuộn xuống cuối trang hoặc
   chuyển sang tab khác. Với một trang mà 100% người đọc dùng điện thoại, đó là
   pin và nhiệt đổ vào thứ không ai thấy.

   Viết theo đúng khuôn light-journey.js: tôn trọng prefers-reduced-motion kể cả
   khi người dùng bật/tắt giữa phiên, và không bao giờ đọc layout ngoài khung hình. */

export function motionGate(el, { onEnter, onLeave, rootMargin = "120px" } = {}) {
  if (!el) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let inView = false;
  let active = false;
  let io = null;

  // Ba điều kiện phải đúng cùng lúc. Tách riêng hàm để mọi nguồn thay đổi
  // (cuộn, đổi tab, đổi thiết lập hệ thống) đều đi qua một chỗ duy nhất —
  // nhờ vậy không thể gọi onEnter hai lần liền hay onLeave khi chưa từng vào.
  const sync = () => {
    const should = inView && !document.hidden && !reduced.matches;
    if (should === active) return;
    active = should;
    (should ? onEnter : onLeave)?.();
  };

  const onVisibility = () => sync();

  // Người dùng bật giảm chuyển động giữa phiên: ngắt hẳn observer thì rẻ hơn
  // giữ nó chạy không mục đích, nhưng phải dựng lại được khi họ tắt.
  const onReducedChange = () => {
    if (reduced.matches) {
      stopObserving();
      inView = false;
    } else {
      startObserving();
    }
    sync();
  };

  function startObserving() {
    if (io || reduced.matches) return;
    io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin },
    );
    io.observe(el);
  }

  function stopObserving() {
    if (!io) return;
    io.disconnect();
    io = null;
  }

  startObserving();
  document.addEventListener("visibilitychange", onVisibility);
  if (reduced.addEventListener) reduced.addEventListener("change", onReducedChange);

  // Trả về hàm huỷ: gọi onLeave nếu đang chạy, để phía gọi không phải tự dọn.
  return () => {
    stopObserving();
    document.removeEventListener("visibilitychange", onVisibility);
    if (reduced.removeEventListener) reduced.removeEventListener("change", onReducedChange);
    inView = false;
    sync();
  };
}
