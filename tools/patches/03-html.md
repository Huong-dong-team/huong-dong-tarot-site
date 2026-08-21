# Patch · HTML

`index.html` là **output đã build** — tôi không có template sinh ra nó. Các thay đổi dưới đây
phải áp vào layout/partial tương ứng trong repo, không sửa file dist. Mỗi mục ghi rõ selector
để bạn tìm đúng chỗ trong template.

## 1 · `<head>` — bỏ font ngoại, hoãn GTM

```html
<!-- TRƯỚC -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&display=swap&subset=vietnamese" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Charm:wght@400;700&display=swap&subset=vietnamese" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/main.css?v=e187c88e">
<link rel="stylesheet" href="/assets/css/theme-dark.css?v=f579c768">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GWCNBTGQ9V"></script>
```

```html
<!-- SAU -->
<!-- Font tự host: bỏ được hai vòng DNS+TLS tới Google và 1.154ms chặn render.
     preload hai file dùng ở màn hình đầu; các weight còn lại để CSS tự gọi. -->
<link rel="preload" href="/assets/fonts/be-vietnam-pro-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/be-vietnam-pro-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/fonts.css?v=1">

<!-- Ảnh hero: cho trình duyệt biết ngay từ HTML, trước cả khi CSS về.
     media chia đôi để di động không phải tải bản 1600px. -->
<link rel="preload" as="image" fetchpriority="high"
      href="/assets/img/hero-800.avif" media="(max-width: 900px)">
<link rel="preload" as="image" fetchpriority="high"
      href="/assets/img/hero-1536.avif" media="(min-width: 901px)">

<link rel="stylesheet" href="/assets/css/main.css?v=e187c88e">
<link rel="stylesheet" href="/assets/css/theme-dark.css?v=f579c768">

<!-- GTM hoãn tới tương tác đầu. Xem mục 4 bên dưới cho đoạn script. -->
```

Giữ nguyên toàn bộ JSON-LD, `<title>`, meta description — không đụng.

## 2 · Markup hero

```html
<!-- TRƯỚC -->
<section class="hero">
    <span class="proto-stamp">OpenBeta</span>
    <div class="hero-mist" aria-hidden="true"></div>
    <canvas class="hero-dust" aria-hidden="true"></canvas>
    <div class="hero-sun" data-hero-sun aria-hidden="true"></div>
    <div class="hero-copy">…</div>
    <div class="hero-stage">…</div>
</section>
```

```html
<!-- SAU -->
<section class="hero">
    <!-- Ảnh nền đứng đầu để parser gặp nó sớm nhất. alt="" vì đây là trang trí:
         nội dung của hero nằm ở <h1> ngay bên dưới. width/height giữ CLS = 0. -->
    <img class="hero-bg" src="/assets/img/hero-1200.avif"
         srcset="/assets/img/hero-800.avif 800w,
                 /assets/img/hero-1200.avif 1200w,
                 /assets/img/hero-1536.avif 1536w"
         sizes="100vw" width="1536" height="1024"
         fetchpriority="high" decoding="async" alt="" aria-hidden="true">
    <div class="hero-overlay" aria-hidden="true"></div>

    <span class="proto-stamp">OpenBeta</span>
    <div class="hero-mist" aria-hidden="true"></div>
    <canvas class="hero-dust" aria-hidden="true"></canvas>
    <div class="hero-sun" data-hero-sun aria-hidden="true"></div>
    <div class="hero-copy">…</div>
    <div class="hero-stage">…</div>
</section>
```

**Không dùng `<picture>`.** AVIF được mọi trình duyệt trong nhóm mục tiêu hỗ trợ từ 2024;
thêm `<source type="image/webp">` sẽ khiến `fetchpriority` và `preload` phải khai báo hai lần
mà không đổi kết quả cho người dùng thật. Script build vẫn sinh `.webp` — nếu bạn cần phủ
thiết bị cũ, đổi sang `<picture>` và bỏ hai dòng `preload` ở mục 1, thay bằng
`imagesrcset`/`imagesizes` trên một dòng duy nhất.

## 3 · Ba ảnh dùng sai khổ

Đây là phần thu được nhiều dung lượng nhất, và **nặng hơn cả ảnh hero**.

### 3a · `suit-tre.png` — 2,6 MB

```html
<!-- TRƯỚC -->
<img src="/assets/img/suits/suit-tre.png" width="1200" height="630" loading="lazy"
     alt="Phù hiệu Nhà Tre màu đồng trên nền ngọc">

<!-- SAU -->
<img src="/assets/img/suits/suit-tre-800.avif"
     srcset="/assets/img/suits/suit-tre-400.avif 400w,
             /assets/img/suits/suit-tre-800.avif 800w"
     sizes="(max-width: 900px) 100vw, 33vw"
     width="1200" height="630" loading="lazy" decoding="async"
     alt="Phù hiệu Nhà Tre màu đồng trên nền ngọc">
```

Một file PNG 2,6 MB đang hiển thị trong ô rộng một phần ba cột. Đây là tài sản nặng nhất
của trang chủ; Lighthouse không báo vì nó nằm dưới màn hình nên không được tải trong lượt đo.

### 3b · `default-og.webp` làm thumbnail — 335 KB

```html
<!-- TRƯỚC -->
<img src="/assets/img/default-og.webp" width="1200" height="630" loading="lazy"
     alt="Bình minh trên núi sông Việt Nam">

<!-- SAU -->
<img src="/assets/img/news-binh-minh-800.avif"
     srcset="/assets/img/news-binh-minh-400.avif 400w,
             /assets/img/news-binh-minh-800.avif 800w"
     sizes="(max-width: 900px) 100vw, 33vw"
     width="1200" height="630" loading="lazy" decoding="async"
     alt="Bình minh trên núi sông Việt Nam">
```

`default-og.webp` **giữ lại nguyên file** — vẫn cần cho thẻ `og:image`. Chỉ thôi dùng nó
làm nền hero và làm thumbnail.

### 3c · Hai PNG hoa văn dùng làm icon

```html
<!-- TRƯỚC — 439KB cho một icon 46×46, lại không lazy -->
<img src="/assets/img/trong-dong.png" width="46" height="46" …>

<!-- TRƯỚC — 355KB cho một hình 110×74, cũng không lazy -->
<img src="/assets/img/chim-lac.png" width="110" height="74" alt="">
```

```html
<!-- SAU -->
<img src="/assets/img/trong-dong-96.avif" width="46" height="46"
     decoding="async" …>

<img src="/assets/img/chim-lac-220.avif" width="110" height="74"
     loading="lazy" decoding="async" alt="">
```

Giữ nguyên mọi thuộc tính `alt` sẵn có. `trong-dong.png` ở header nên **không** thêm
`loading="lazy"` — nó nằm trên màn hình đầu, lazy sẽ làm nó về muộn hơn.
`chim-lac.png` ở footer nên thêm lazy.

## 4 · Hoãn GTM — sửa ở `scripts/lib/seo.js`, không phải template

**Đính chính so với bản trước.** Đoạn GTM không nằm trong template nào. Nó do hàm
`analyticsSnippet()` trong `scripts/firebase-handover/scripts/lib/seo.js` sinh ra lúc build,
và chỉ sinh khi `site.ga4Id` khớp `/^G-[A-Z0-9]{4,}$/`. Đó là lý do `dist/` dựng ở máy không có
đoạn này còn bản đang chạy thì có — đúng một khác biệt duy nhất giữa hai bên.

```js
// TRƯỚC — scripts/lib/seo.js
export function analyticsSnippet(site = {}) {
  const id = String(site.ga4Id || "").trim();
  if (!/^G-[A-Z0-9]{4,}$/.test(id)) return "";
  return `
    &lt;script async src="https://www.googletagmanager.com/gtag/js?id=${id}"&gt;&lt;/script&gt;
    &lt;script&gt;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');&lt;/script&gt;`;
}
```

```js
// SAU — cùng chỗ, cùng chữ ký hàm, chỉ đổi cách nạp.
export function analyticsSnippet(site = {}) {
  const id = String(site.ga4Id || "").trim();
  if (!/^G-[A-Z0-9]{4,}$/.test(id)) return "";

  /* GTM nặng 156KB, 68KB trong đó không dùng, và chặn 697ms. Không có lý do để
     nó chạy trước khi người dùng chạm vào trang.

     Vẫn giữ đủ số liệu: dataLayer được tạo và gtag() đẩy vào hàng đợi ngay từ lần
     tải, nên page_view mang timestamp lúc mở trang chứ không phải lúc script về.
     gtag.js đọc lại toàn bộ hàng đợi khi nạp xong. */
  return `
    &lt;script&gt;
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
      setTimeout(load,5000);   // người chỉ đọc mà không cuộn cũng phải được đếm
    })();
    &lt;/script&gt;`;
}
```

Giữ nguyên phần kiểm định dạng `id` — nó đang chặn đúng một lỗ hổng chèn mã, và comment
trong file đã nói rõ điều đó.

**Đánh đổi cần biết.** Người rời trang trong 5 giây đầu mà không tương tác gì sẽ không được
ghi nhận. Với LCP hiện tại 11,9s thì nhóm đó đang rất lớn — nhưng đó chính là nhóm mà việc sửa
hiệu năng nhắm tới. Cần đo chính xác tỉ lệ rời sớm thì hạ `5000` xuống `2000`.
