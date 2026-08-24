import { escapeHtml } from "./render.js";

export function absoluteUrl(baseUrl, path = "/") {
  return new URL(path, `${baseUrl.replace(/\/$/, "")}/`).toString();
}

export function seoHead({ site, title, description, path, image, type = "website", jsonLd = [], robots = "" }) {
  const canonical = absoluteUrl(site.baseUrl, path);
  const ogImage = absoluteUrl(site.baseUrl, image || site.defaultOgImage);
  const pageTitle = title === site.siteName ? title : `${title} | ${site.siteName}`;
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    ${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : ""}
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:site_name" content="${escapeHtml(site.siteName)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(ogImage)}">
    ${schemas.filter(Boolean).map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`).join("\n")}`;
}

/**
 * Đoạn mã GA4. Chỉ sinh ra khi ga4Id đúng định dạng "G-XXXXXXX".
 *
 * Bắt buộc kiểm tra định dạng: ga4Id do admin nhập trong Firestore và được
 * nhúng vào thẻ <script> của mọi trang, nên một giá trị không kiểm soát sẽ
 * trở thành lỗ hổng chèn mã. Giá trị rỗng hoặc sai định dạng trả về "".
 */
export function analyticsSnippet(site = {}) {
  const id = String(site.ga4Id || "").trim();
  if (!/^G-[A-Z0-9]{4,}$/.test(id)) return "";
  /* Nạp trễ. gtag.js nặng 156KB, 68KB trong đó không được dùng, và nó chặn
     ~700ms trên đường tới khung hình đầu tiên. Không có lý do để nó chạy trước
     khi người dùng chạm vào trang.

     Số liệu vẫn đủ: dataLayer được tạo và gtag() đẩy vào hàng đợi ngay từ lần
     tải, nên page_view mang timestamp lúc mở trang chứ không phải lúc script về.
     gtag.js đọc lại toàn bộ hàng đợi khi nạp xong.

     Đánh đổi: người rời trang trong 5 giây đầu mà không tương tác gì sẽ không
     được ghi nhận. Cần đo chính xác tỉ lệ rời sớm thì hạ 5000 xuống 2000. */
  return `
    <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','${id}');
    (function(){
      var loaded=false;
      function load(){
        if(loaded)return; loaded=true;
        var s=document.createElement('script');
        s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id=${id}';
        document.head.appendChild(s);
      }
      ['pointerdown','keydown','scroll','touchstart'].forEach(function(e){
        addEventListener(e,load,{once:true,passive:true});
      });
      setTimeout(load,5000);
    })();
    </script>`;
}

export function breadcrumbSchema(site, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(site.baseUrl, item.path),
    })),
  };
}
