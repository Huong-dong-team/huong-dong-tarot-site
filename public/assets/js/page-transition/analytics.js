/* Pageview cho GA4 khi điều hướng bằng Swup.

   Vì sao cần: gtag('config', ID) trong <head> tự bắn đúng MỘT page_view cho lần
   tải đầu tiên. Sau đó Swup thay nội dung mà không tải lại trang, nên GA4 không
   biết gì thêm — nếu không có file này, mọi trang sau trang đầu đều mất số liệu.

   Vì sao không ghi trùng: hook 'page:view' của Swup chỉ chạy sau khi một chuyến
   điều hướng hoàn tất; nó KHÔNG chạy cho trang đầu. Đúng một page_view cho một
   trang, không thừa không thiếu.

   Không tự nạp gtag.js. Snippet trong <head> cố ý trì hoãn nó tới lúc người
   dùng tương tác; đẩy vào dataLayer là đủ, GA4 đọc lại cả hàng đợi khi nạp xong. */

export function attachAnalytics(swup) {
  const handler = (visit, { url, title }) => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_location: new URL(url, location.origin).href,
      page_title: title || document.title,
      page_referrer: visit?.from?.url ? new URL(visit.from.url, location.origin).href : undefined,
    });
  };
  swup.hooks.on("page:view", handler);
  return () => swup.hooks.off("page:view", handler);
}
