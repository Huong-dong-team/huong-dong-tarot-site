/* Hành trình ánh sáng — "Hường Đông" là ánh hồng phương Đông, nên trang đọc
   như một buổi sáng: hero sáng nhất, càng cuộn xuống ánh sáng càng lắng và
   nền càng chìm sâu về jade tối.

   Chỉ ghi hai biến CSS; mọi thay đổi hình ảnh nằm bên CSS và chỉ đụng
   opacity/filter nên không gây reflow. Đọc layout một lần mỗi khung hình
   qua rAF để không giật khi cuộn. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clear() {
    root.style.setProperty("--hd-scroll", "0");
    root.style.setProperty("--hd-hero", "0");
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight || 1;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var y = window.scrollY || window.pageYOffset || 0;

    // Tiến độ toàn trang 0 → 1: điều khiển độ chìm của nền.
    root.style.setProperty("--hd-scroll", Math.min(1, Math.max(0, y / max)).toFixed(4));
    // Tiến độ rời hero 0 → 1 trong khoảng một màn hình: điều khiển mặt trời.
    root.style.setProperty("--hd-hero", Math.min(1, Math.max(0, y / vh)).toFixed(4));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function start() {
    if (reduced.matches) { clear(); window.removeEventListener("scroll", onScroll); return; }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  start();
  // Người dùng có thể bật/tắt giảm chuyển động giữa phiên.
  if (reduced.addEventListener) reduced.addEventListener("change", start);
})();
