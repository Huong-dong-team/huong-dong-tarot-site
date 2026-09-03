# Hướng dẫn cho agent

Đọc trước khi sửa bất cứ thứ gì thuộc bố cục, CSS hay responsive. Viết cho
ChatGPT/Codex, Claude Code và bất kỳ agent nào khác được giao việc trong repo
này. Mọi con số dưới đây đã đo hoặc đọc thẳng từ `tests/`, không phải ước lượng.

## Điều quan trọng nhất: một website, một lần build

Desktop, tablet và điện thoại **dùng chung một bộ template và một bộ CSS**.
Không có bản mobile riêng, không phục vụ theo thiết bị, không nhận diện
User-Agent. `scripts/build.js` sinh ra một bộ HTML duy nhất trong `dist/`.

Nếu được giao "làm bản desktop khác bản mobile", việc đó có nghĩa là **thêm
luật CSS theo khung nhìn**, không phải tách nhánh giao diện. Đừng:

- tạo `templates/home-desktop.html` hay `public/assets/css/desktop.css` song song;
- đọc `navigator.userAgent` để chọn bố cục;
- chuyển hướng sang `m.` hay `?view=mobile`.

Site có 78 trang lá sinh tự động; nhân đôi template là nhân đôi cả 78 trang đó.

## CSS ở đây là desktop-first

Luật gốc (ngoài mọi `@media`) **là luật desktop**. Các khối `@media (max-width: …)`
chỉ thu nhỏ dần xuống. Ví dụ trong `main.css`:

```css
.hero { grid-template-columns: minmax(0,1fr) minmax(280px,400px); }  /* desktop */
@media (max-width: 900px) { .hero { grid-template-columns: 1fr; } }  /* tablet dọc trở xuống */
```

Hệ quả phải nhớ:

1. **Sửa bố cục desktop = sửa luật gốc.** Sửa xong phải rà lại mọi khối
   `max-width` phía dưới xem còn ghi đè đủ không.
2. **`@media` KHÔNG cộng thêm độ ưu tiên.** Khối `max-width` thắng luật gốc chỉ
   nhờ **đứng sau** nó trong tệp. Chèn luật gốc mới xuống dưới một khối `@media`
   là làm hỏng bản mobile mà không có test nào bắt được. `main.css` có sẵn ghi
   chú ở chỗ này — đừng xoá.
3. Muốn thứ gì **chỉ desktop mới có**, viết `@media (min-width: 1101px)` và đặt
   sau luật gốc, đừng nhét vào luật gốc rồi tìm cách gỡ ra ở `max-width`.

## Thang breakpoint bắt buộc

Sáu mốc, không được đặt số mới. Chi tiết và bảng quy đổi ở
[`docs/breakpoints.md`](docs/breakpoints.md).

| `max-width` | Vùng | `min-width` tương ứng |
|---|---|---|
| 430px | điện thoại dọc | 431px |
| 620px | điện thoại lớn | 621px |
| 760px | tablet nhỏ dọc, điện thoại ngang | 761px |
| 900px | tablet dọc | 901px |
| 1100px | tablet ngang | 1101px |
| 1180px | desktop hẹp | 1181px |

`tests/responsive-scale.test.mjs` quét toàn bộ `public/assets/css/*.css` và làm
đỏ nếu có con số lạc. Chiều `min-width` luôn dùng mốc **+ 1** để hai dải không
chồng nhau — từng có lỗi thật vì `min-width: 861px` chồng lên `max-width: 900px`.

**Hai ngưỡng không được xê dịch:**

- **1101px** — Hero về một cột từ đây xuống. Đổi số này là đổi bố cục desktop.
- **900px** — nav thu thành hamburger, và `landing-drag.css` đổi lưới thành dải
  kéo ngang. `tests/landing-layout.test.mjs` cùng `tests/performance-effects.test.mjs`
  khoá cứng chuỗi `@media (max-width: 900px)` trong `home-standalone.css`.

## Viết luật desktop vào tệp nào

| Việc | Viết ở đâu |
|---|---|
| Bố cục, lưới, khoảng cách chung | `main.css` |
| Riêng trang chủ | `home-standalone.css` (đã scope `main[data-page="home"]`) |
| Riêng bảy trang trong | `subpage-remake.css` / `subpage-kirigami.css` (scope `[data-page-art]`) |
| Riêng bảo tàng 78 lá | `museum-gallery.css` (scope `main[data-page="library"]`) |
| Độ mờ tranh sơn mài theo khung nhìn | `lacquer-art.css` |

**Không bao giờ đưa luật chỉ-desktop vào `critical.css` hay `critical-inner.css`.**
Hai tệp đó được nhúng thẳng vào `<head>` của **mọi** trang, kể cả khi khách mở
bằng điện thoại 4G. Ngân sách 20.000 ký tự mỗi trang, hiện dùng 17.160 —
còn khoảng 2.800. Mỗi byte desktop nhét vào đó là byte điện thoại phải tải mà
không dùng tới. `tests/critical-css.test.mjs` làm đỏ khi vượt.

Thêm hẳn một tệp CSS mới thì phải khai `<link>` trong `templates/_layout.html`;
**thứ tự các thẻ link là có chủ ý** (đọc ghi chú ngay trong tệp đó). Dấu phiên
bản `?v=<băm>` do `build.js` tự gắn, không cần làm tay.

## Hover không phải là dấu hiệu của desktop

Máy tính bảng có bàn phím rời và laptop cảm ứng vẫn rộng hơn 1101px. Vì vậy:

- Mọi trang trí `:hover` phải nằm trong `@media (hover: hover)`, **kể cả luật
  chỉ chạy ở desktop**. Không có ngoại lệ nào ngoài các luật vô hiệu hoá trong
  `prefers-reduced-motion` (chúng đặt `transform: none`, vẫn đúng trên cảm ứng).
- `:focus-visible` và `:focus-within` **ở ngoài** khối đó. Tablet cắm bàn phím
  vẫn phải thấy viền focus.
- Lý do: trên máy cảm ứng `:hover` dính lại sau khi chạm và không có cách nào
  bỏ. Trước bản này, chạm một lá bài để lật xong là lá đó đứng nguyên trạng
  thái nhấc lên cho tới khi chạm chỗ khác.

`tests/responsive-scale.test.mjs` làm đỏ nếu còn `:hover` chưa bọc.

## Chiều cao khung nhìn, không chỉ chiều rộng

Máy nằm ngang là khung nhìn **thấp**, không phải khung nhìn hẹp. iPhone Pro Max
xoay ngang là 932×430 — rộng hơn iPad dọc nhưng chỉ cao 430px.

Đừng đặt sàn cứng bằng `px` cho chiều cao khối màn hình đầu. `clamp(820px, 100svh, 1024px)`
từng biến Hero trang chủ thành 1,91 màn hình phải cuộn qua ở khổ đó. Dùng `svh`,
và nếu buộc phải có sàn thì kèm đường thoát:

```css
@media (min-width: 901px) and (max-height: 820px) { … }
```

Khối đó được khoá trong `tests/responsive-scale.test.mjs`.

## Những thứ khác làm test đỏ ngay

- `main.css` chỉ được có **đúng một** khối `:root`.
- `.hero::after` bị cấm trong `templates/home.html`, `public/assets/js/ui/*.js`,
  `main.css`, `critical.css` — dùng `.hero::before`.
- Critical CSS của trang chủ **không được** chứa `.page-hero`, `.card-detail`,
  `.v2-prose`, `.post-detail`, `.not-found` (chúng thuộc `critical-inner.css`).
- Không `IntersectionObserver` trong `public/assets/js/page/registry.js` và
  `page-transition.css`. Scroll-driven animation thuần CSS thì được.
- Mọi module trong `public/assets/js/ui/` phải export `init()` trả về hàm huỷ.
- `page-transition.css` phải **≤ 8.000 byte** (đang 7.881 — chỉ còn 119 byte, rất chật) và chứa
  **đúng bốn** `@keyframes`, đúng thứ tự `page-in`, `hero-layer-in`,
  `hero-art-in`, `hero-converge`. Hiệu ứng chuyển động mới phải nằm ở tệp khác;
  `scroll-fade.css` là tiền lệ. `@keyframes` ở đây chỉ được chạm `opacity`,
  `transform`, `filter`.
- Bundle Swup ≤ 32.000 byte.
- Trang chỉ được nhúng cứng `site.js` và `light-journey.js`; script khác phải do
  `public/assets/js/page/registry.js` nạp, nếu không nó sẽ im lặng không chạy
  lại sau lần điều hướng đầu tiên.

## Tự kiểm trước khi giao

```bash
npm run build:local        # dựng từ dữ liệu seed, không cần khoá Firebase
npm test                   # phải xanh toàn bộ
npm run check:types
npm run serve -- --port 8110
```

Đo chứ đừng đoán. Mở `http://localhost:8110`, đặt khung nhìn rồi chạy trong
console — số quan trọng hơn ảnh chụp:

```js
// tràn ngang?
document.documentElement.scrollWidth > innerWidth

// hover có tắt trên máy cảm ứng không?
[...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .filter(r => r.constructor.name === "CSSMediaRule" && /hover:\s*hover/.test(r.conditionText))
  .every(r => !matchMedia(r.conditionText).matches)

// Hero chiếm mấy màn hình?
document.querySelector(".hero").getBoundingClientRect().height / innerHeight
```

Bộ khổ nên đo: 375×812, 430×932, 744×1133 (iPad mini dọc), 768×1024,
900/901 (biên nav), 932×430 (điện thoại ngang), 1024×768 (iPad ngang),
1100/1101 (biên Hero), 1440×900.

## Phát hành

Không deploy tay. Bấm **Actions → "Xuất bản website (Firebase)"** trên GitHub;
workflow tự checkout `main`, build từ Firestore thật, type-check, test rồi mới
`firebase deploy` — đỏ ở bước nào thì dừng ở đó và trang khách giữ bản cũ.
