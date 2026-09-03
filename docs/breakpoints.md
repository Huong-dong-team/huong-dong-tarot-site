# Thang breakpoint chuẩn

Một nguồn duy nhất cho mọi `@media` theo bề ngang trong `public/assets/css/`.
Trước bản này, 16 tệp CSS dùng 19 con số tự đặt tại chỗ (430, 460, 480, 520,
620, 700, 720, 760, 767, 850, 860, 900, 901, 980, 1023, 1060, 1100, 1101,
1180) và không tệp nào tham chiếu tệp nào — sửa bố cục tablet ở một chỗ là lệch
với chỗ khác.

CSS không cho phép `@media (max-width: var(--bp))`, nên thang này không thể là
biến. Nó là **quy ước**: mọi `@media` theo bề ngang phải rơi đúng vào một trong
sáu mốc dưới đây, không được đặt số mới.

## Sáu mốc

| Mốc | Điều kiện | Vùng | Thiết bị thật |
|---|---|---|---|
| **XS** | `max-width: 430px` | điện thoại dọc | iPhone SE 375, iPhone 15 393, Pro Max 430, Android 360–412 |
| **SM** | `max-width: 620px` | điện thoại lớn | phablet dọc, phone gập mở |
| **MD** | `max-width: 760px` | tablet nhỏ dọc / điện thoại ngang | iPad mini 744, Surface Duo 720, iPhone SE ngang 667 |
| **LG** | `max-width: 900px` | tablet dọc | iPad 10.9" 820, iPad Pro 11" 834, iPhone ngang 844–932 |
| **XL** | `max-width: 1100px` | tablet ngang | iPad Pro 12.9" dọc 1024, iPad ngang 1080 |
| **XXL** | `max-width: 1180px` | desktop hẹp | laptop 13" 1152–1180 |

Chiều ngược lại dùng đúng mốc + 1: `min-width: 431px`, `621px`, `761px`,
`901px`, `1101px`, `1181px`. Không bao giờ để một dải `min-width` chồng lên dải
`max-width` của cùng một thành phần.

## Ranh giới không được xê dịch

- **1101px** là ngưỡng Hero hai cột. `@media (max-width: 1100px)` ở cuối
  `main.css` mới là nơi hạ Hero xuống một cột — đổi số này là đổi bố cục
  desktop, nằm ngoài phạm vi mobile/tablet.
- **900px** là ngưỡng thu nav thành nút hamburger (`main.css`, `critical.css`)
  và là ngưỡng `landing-drag.css` chuyển lưới thành dải kéo ngang.
  `tests/landing-layout.test.mjs` và `tests/performance-effects.test.mjs` khoá
  cứng chuỗi `@media (max-width: 900px)` trong `home-standalone.css`.

## Bảng quy đổi đã áp dụng

| Số cũ | Về mốc | Tệp | Ảnh hưởng |
|---|---|---|---|
| 460 | 430 | `museum-gallery.css` | tường tranh về 1 cột ở ≤430 thay vì ≤460 |
| 480 | 430 | `hero-halo.css`, `main.css` | `.explore-grid` 1 cột ở ≤430; quầng sáng hạ blur ở ≤430 |
| 520 | 430 | `main.css` | `.hd-card` co còn 104px ở ≤430 (132px vẫn xếp 3 lá/hàng tới 430) |
| 700 | 760 | `subpage-remake.css` | hero trang trong dùng bản dọc từ ≤760 |
| 720 | 760 | `museum-gallery.css` | tường tranh về 2 cột từ ≤760, rộng rãi hơn trên tablet nhỏ |
| 767 | 760 | `lacquer-art.css` | mốc "mobile" của độ mờ tranh sơn mài |
| 850 | 900 | `admin.css` | bảng quản trị gập sidebar cùng lúc với nav công khai |
| 860 | 900 | `main.css` | `.immortals-grid` và `.section-heading.has-art` về 1 cột trên cả tablet dọc |
| 861 | 901 | `main.css` | **sửa lỗi chồng dải**: khối siết nav bắt đầu ở 861 trong khi hamburger đã tiếp quản từ ≤900, nên 861–900px nhận hai bộ luật mâu thuẫn |
| 980 | 900 | `subpage-remake.css` | `.section-feature` giữ 2 cột trên tablet ngang, chỉ về 1 cột ở tablet dọc |
| 1023 | 1100 | `lacquer-art.css` | mốc "tablet" của độ mờ tranh sơn mài |
| 1060 | 1100 | `museum-gallery.css` | tường tranh về 3 cột từ ≤1100 |

`admin.css` là bảng quản trị nội bộ, không nằm trong luồng đọc của khách, nhưng
vẫn đưa về thang chung để không còn con số lạc.

## Con trỏ và cảm ứng

Hiệu ứng `:hover` chỉ được khai trong `@media (hover: hover)`. Trên máy cảm ứng
`:hover` dính lại sau khi chạm và không có cách nào bỏ — thẻ bài nhấc lên rồi
đứng yên ở đó tới khi chạm chỗ khác.

Luật `:focus-visible` **không** được nằm trong khối đó: tablet có bàn phím rời
vẫn cần viền focus.
