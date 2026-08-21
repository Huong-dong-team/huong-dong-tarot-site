# Patch · `assets/css/main.css`

Năm thay đổi. Không đụng `.reveal`, `.tarot-card:hover`, `.button.brass::after`,
và không đụng khối `@media(prefers-reduced-motion:reduce)`.

## 1 · `.hero` — bỏ ảnh nền khỏi CSS

Đây là nguyên nhân số một của LCP 11,9s: ảnh chỉ tồn tại trong CSS nên trình duyệt
không thấy để tải sớm. Giữ nguyên gradient, chỉ tách ảnh ra thành `<img>` (xem patch 03).

### Bản desktop

```css
/* TRƯỚC */
.hero{min-height:calc(100svh - 76px);display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);align-items:center;gap:clamp(42px,8vw,110px);padding:clamp(70px,10vw,130px) max(16px,calc((100vw - 1180px)/2));background:linear-gradient(90deg,rgba(4,28,25,.93) 0%,rgba(4,28,25,.70) 44%,rgba(4,28,25,.40) 100%),url("/assets/img/default-og.webp") center/cover;color:var(--paper)}

/* SAU — background chỉ còn màu nền phẳng; gradient chuyển sang ::after */
.hero{min-height:calc(100svh - 76px);display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,400px);align-items:center;gap:clamp(42px,8vw,110px);padding:clamp(70px,10vw,130px) max(16px,calc((100vw - 1180px)/2));background:var(--jade-950);color:var(--paper)}
```

### Bản di động, trong `@media(max-width:900px)`

```css
/* TRƯỚC */
.hero{grid-template-columns:1fr;padding-top:70px;background:linear-gradient(180deg,rgba(4,28,25,.90) 0%,rgba(4,28,25,.66) 60%,rgba(4,28,25,.5) 100%),url("/assets/img/default-og.webp") center/cover}

/* SAU */
.hero{grid-template-columns:1fr;padding-top:70px}
```

## 2 · Khối mới: ảnh hero và lớp phủ

Dán vào khối `/* Cinematic motion */` ở cuối file, ngay trước `.hero-dust`.
`.hero` đã có `position:relative; overflow:hidden` sẵn trong khối đó — không cần thêm.

**Vì sao dùng `<div>` thật chứ không pseudo-element.** Cả hai pseudo-element của `.hero`
đã bị chiếm: `.hero::after` là quầng sáng đồng lệch tâm (`right:-6%; top:-14%; z-index:0`),
và `.hero:before` có sẵn khai báo `{right:9%;top:3%;width:min(720px,55vw);opacity:.22}` từ
nhóm hoa văn — nếu tôi thêm `content:""` vào `.hero::before` thì nó sẽ thừa hưởng luôn
`opacity:.22` và giới hạn `width`, lớp phủ sẽ sai hoàn toàn. Một `<div>` tránh cả hai bẫy
và làm thứ tự z-index đọc được ngay trong markup.

```css
/* Ảnh nền hero, tách khỏi background để trình duyệt phát hiện được từ HTML.
   Thứ tự chồng lớp trong .hero:  -2 ảnh · -1 lớp phủ · 0 sương+quầng · 1 nội dung. */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Lớp phủ ngọc sẫm. Trước đây là gradient đầu trong shorthand background của
   .hero; tách riêng để ảnh đổi khổ theo srcset mà lớp phủ không bị kéo theo. */
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(90deg,
    rgb(4 28 25 / 93%) 0%, rgb(4 28 25 / 70%) 44%, rgb(4 28 25 / 40%) 100%);
}

@media (max-width: 900px) {
  .hero-overlay {
    background: linear-gradient(180deg,
      rgb(4 28 25 / 90%) 0%, rgb(4 28 25 / 66%) 60%, rgb(4 28 25 / 50%) 100%);
  }
}
```

**Một dòng nên xoá luôn.** `.hero:before{right:9%;top:3%;width:min(720px,55vw);opacity:.22}`
là mã chết: nó không có `content` nên không sinh box, và `.hero` không mang class
`.drum-watermark` ở bất kỳ trang nào (trang `/la-bai/` và `/huyen-su/` dùng
`.page-hero drum-watermark`, không phải `.hero`). Cùng lý do với
`.hero:after{left:36%;bottom:3%;opacity:.08}` — dòng này còn bị `.hero::after` trong khối
motion ghi đè một phần, nên đang gây nhiễu khi đọc. Xoá cả hai không đổi hiển thị.

## 3 · `.hero-mist` — blur tĩnh, chỉ animate opacity

`filter: blur()` phải vẽ lại bề mặt mỗi khung hình. Khi `mistBreath` animate
`transform` + `scale` cùng lúc, trình duyệt không thể tái dùng kết quả blur của khung trước.
Tách hai việc: blur một lần, chuyển động đặt lên phần tử **không** blur.

```css
/* TRƯỚC */
.hero-mist {
  position: absolute; z-index: 0; inset: 0;
  background:
    radial-gradient(ellipse at 42% 46%, rgb(232 201 140 / 10%), transparent 34%),
    radial-gradient(ellipse at 74% 68%, rgb(232 201 140 / 8%), transparent 30%);
  filter: blur(1.5rem);
  animation: mistBreath 11s ease-in-out infinite alternate;
  pointer-events: none;
}
@keyframes mistBreath {
  from { opacity: .42; transform: translate3d(-1%, 0, 0) scale(1); }
  to   { opacity: .78; transform: translate3d(1%, -1%, 0) scale(1.03); }
}

/* SAU */
.hero-mist {
  position: absolute; z-index: 0; inset: 0;
  filter: blur(1.5rem);
  will-change: opacity;          /* xin layer riêng: blur chỉ tính một lần cho cả animation */
  animation: mistBreath 11s ease-in-out infinite alternate;
  pointer-events: none;
  /* Lớp này giờ chỉ còn nhiệm vụ blur + mờ dần. Hình sương chuyển sang ::before
     để transform không kéo blur tính lại theo. */
}

/* Chuyển động trôi đặt ở đây — phần tử con không có filter nên transform của nó
   chỉ chạm tầng composite, đúng như .tarot-card:hover đang làm. */
.hero-mist::before {
  content: "";
  position: absolute;
  inset: -6%;                    /* nới rộng để scale 1.03 không hở rìa */
  background:
    radial-gradient(ellipse at 42% 46%, rgb(232 201 140 / 10%), transparent 34%),
    radial-gradient(ellipse at 74% 68%, rgb(232 201 140 / 8%), transparent 30%);
  animation: mistDrift 11s ease-in-out infinite alternate;
}

@keyframes mistBreath {
  from { opacity: .42; }
  to   { opacity: .78; }
}

@keyframes mistDrift {
  from { transform: translate3d(-1%, 0, 0) scale(1); }
  to   { transform: translate3d(1%, -1%, 0) scale(1.03); }
}
```

## 4 · Xoá `drumTurn`, gắn cổng cho `.hero-sun`

```css
/* TRƯỚC */
@keyframes drumTurn { to { transform: rotate(360deg); } }
.drum-watermark::before { animation: drumTurn 260s linear infinite; }
.hero-sun::before { animation: drumGlow 5s ease-in-out infinite; }
.hero-sun::after  { animation: drumRays 90s linear infinite reverse; }

/* SAU */
/* drumTurn bị xoá hoàn toàn. Một vòng quay 260 giây là chuyển động không ai nhận
   ra, nhưng trình duyệt phải giữ lớp composite của một PNG 439KB sống suốt phiên.
   .drum-watermark::before giữ nguyên phần hình, chỉ mất animation. */

/* Hai hiệu ứng của mặt trời giữ nguyên, nhưng mặc định đứng im. initHeroSunGate
   trong site.js thêm .is-visible khi hero còn trong viewport. */
.hero-sun::before { animation: drumGlow 5s ease-in-out infinite; animation-play-state: paused; }
.hero-sun::after  { animation: drumRays 90s linear infinite reverse; animation-play-state: paused; }

.hero.is-visible .hero-sun::before,
.hero.is-visible .hero-sun::after { animation-play-state: running; }
```

Đồng thời xoá dòng `@keyframes drumTurn { … }` ở nơi nó được khai báo.
`@keyframes drumRays` và `drumGlow` **giữ nguyên**, vẫn còn dùng.

> **Nếu bạn muốn JS-lỗi-vẫn-quay:** đổi mặc định thành `running` và cho JS thêm lớp
> `.hero.is-idle` với `animation-play-state: paused`. Đánh đổi: một khung hình đầu sẽ
> chạy animation trước khi JS kịp tắt. Tôi chọn `paused` mặc định vì đây là hiệu ứng
> trang trí, và tiết kiệm pin ở lần tải đầu quan trọng hơn.

## 5 · Hoãn layout phần dưới màn hình

Trang chủ có tám section theo thứ tự: `hero`, `story-section`, `immortals-section`,
`houses-section`, `featured`, `pack-section`, `news-section`, `waitlist`.
Bảy section sau màn hình đầu không cần layout trước khi vẽ khung đầu tiên.

```css
/* Bỏ qua layout của phần chưa nhìn thấy. contain-intrinsic-size cho trình duyệt
   một chiều cao ước lượng để thanh cuộn không nhảy khi nội dung thật được đo.
   Con số dưới đây lấy từ padding thật của từng nhóm — các section này đều dùng
   padding:clamp(80px,10vw,140px) nên chiều cao thực tế dao động 900–1400px trên
   di động. Chọn cận dưới của khoảng đó: đoán thiếu chỉ làm thanh cuộn dài ra rồi
   co lại một lần, còn đoán thừa sẽ để lại khoảng trắng khi cuộn nhanh. */
.story-section,
.immortals-section,
.houses-section,
.featured,
.pack-section,
.news-section,
.waitlist {
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}
```

**Không áp cho `.hero`** — nó là LCP element, `content-visibility` sẽ làm chậm đúng thứ
ta đang cố tăng tốc.

**Ba điểm đã kiểm.** `content-visibility: auto` không ảnh hưởng thứ tự đọc của screen
reader và không ẩn nội dung khỏi cây accessibility (khác `content-visibility: hidden`).
Tìm-trong-trang bằng Ctrl+F vẫn hoạt động: từ Chrome 90 trình duyệt tự bung phần bị
skip khi tìm thấy khớp. Neo `#id` cũng tự bung. Điều duy nhất cần để ý là ảnh chụp
toàn trang bằng script có thể bắt được phần chưa render — không liên quan người dùng thật.
