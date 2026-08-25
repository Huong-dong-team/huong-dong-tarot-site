/* Một nguồn duy nhất cho prefers-reduced-motion.

   Trước đây bốn chỗ trong repo tự gọi matchMedia riêng. Mỗi chỗ tự đăng ký
   listener "change" của mình, và không chỗ nào gỡ được — sau khi Swup thay DOM
   nhiều lần, số listener cứ thế cộng dồn lên MediaQueryList.

   Module này giữ đúng một MediaQueryList cho cả trang và trả về hàm huỷ cho
   mỗi người đăng ký, nên vòng đời init/destroy của registry dọn được sạch. */

const query = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Người dùng đang yêu cầu giảm chuyển động? */
export function prefersReducedMotion() {
  return query.matches;
}

/**
 * Theo dõi thiết lập, kể cả khi người dùng bật/tắt giữa phiên.
 * @param {(reduced: boolean) => void} listener
 * @returns {() => void} hàm gỡ đăng ký
 */
export function onReducedMotionChange(listener) {
  const handler = () => listener(query.matches);
  // Safari < 14 chỉ có addListener; giữ nhánh cũ để không vỡ trên máy cũ.
  if (query.addEventListener) query.addEventListener("change", handler);
  else query.addListener(handler);
  return () => {
    if (query.removeEventListener) query.removeEventListener("change", handler);
    else query.removeListener(handler);
  };
}
