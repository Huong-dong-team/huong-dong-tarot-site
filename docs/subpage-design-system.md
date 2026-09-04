# Hệ thị giác 7 trang trong · Hường Đông Tarot

Ngày chốt: 31/08/2026  
Phạm vi: `/tarot-la-gi/`, `/la-bai/`, `/trai-bai/`, `/healing/`, `/huyen-su/`, `/tin-tuc/`, `/cua-hang/`.
Chế độ thay đổi: `extend` — lớp Kirigami V2 mở rộng hệ sơn mài hiện hữu, không thay design system gốc.

## Nguyên tắc

- Giữ nguyên bảy tranh sơn mài route hiện có trong `public/assets/img/subpage/`.
- Hero cùng một cấu trúc: nhãn mục, headline Fontasia, subheadline Harmoni và tranh route phía sau.
- Headline dùng vàng pastel `#e8c783`, viền trắng ngà `#fffaf0`; subheadline dùng vàng dịu `#f2dfb7` và không dùng viền.
- Nội dung dùng nền giấy ngà, đường kẻ nâu nhạt, góc gần vuông và đổ bóng tiết chế; tránh bề mặt tròn/generic.
- Minh họa tiểu mục phải là ảnh thật từ thư viện Hường Đông hoặc ảnh sản phẩm được tạo riêng; không dùng CSS art, emoji hay placeholder.

## Token chính

| Vai trò | Token | Giá trị |
|---|---|---|
| Nền giấy | `--subpage-paper` | `#fbf6e8` |
| Bề mặt nâng | `--subpage-paper-raised` | `#fffdf6` |
| Mực | `--subpage-ink` | `#2f2118` |
| Chữ phụ | `--subpage-muted` | `#715e4d` |
| Headline | `--subpage-gold-pastel` | `#e8c783` |
| Subheadline | `--subpage-gold-soft` | `#f2dfb7` |
| Viền headline | `--subpage-ivory` | `#fffaf0` |
| Đỏ son/CTA | `--subpage-cinnabar` | `#8f2f2d` |
| Xanh sơn mài | `--subpage-jade` | `#173d35` |

## Thành phần dùng chung

- `.kirigami-hero-depth`: sân khấu chung nằm trên tranh sơn mài, gồm hiện vật
  theo route và ảnh khung giấy thật `kirigami-frame-v2.png`.
- `.kirigami-stage`: lớp giữa có parallax tối đa 12px ngang / 8px dọc; không
  nhận sự kiện và không làm thay đổi luồng đọc của Hero.
- `.kirigami-piece`: hiện vật ảnh thật của từng trang; entrance lệch nhau 70ms,
  sau đó chỉ trôi 2–3px để giữ nhịp tĩnh tại.
- `.section-feature`: bố cục chữ + minh họa hai cột, chuyển một cột dưới 980px.
- `.section-visual`: ảnh tiểu mục 4:3 có đường viền vàng cổ và chiều sâu nhẹ.
- `.section-card-fan`: ba lá 2:3 xếp quạt, dùng ảnh bài hiện có.
- `.portrait-card`: thẻ chân dung cho Tứ Bất Tử.
- `.pricing-grid` / `.price-tier`: ba phiên bản Standard, Premium, Signature; Premium có ribbon “Được đề xuất”.

## Chuyển động và khả năng truy cập

- Entrance Kirigami dài 980–1040ms, stagger 70ms; khung giấy và hiện vật có
  chủ sở hữu transform riêng để không giật khi chuyển route.
- Hover Hero gập khung giấy khoảng 1.2°; pointer parallax chỉ chạy trên desktop.
- `subpage-motion.js` chỉ nghiêng tối đa khoảng 3° theo con trỏ, dùng `transform` và tự dọn listener khi Swup đổi trang.
- Không kích hoạt tilt trên cảm ứng.
- `prefers-reduced-motion: reduce` tắt toàn bộ tilt/hover transition mới.
- Mỗi trang có đúng một `h1`, một `main#noi-dung-chinh`, ảnh có `alt`, điều hướng mobile giữ nút chạm 45px.

## Biến thể theo route

| Route | Hiện vật lớp giữa |
|---|---|
| Tarot là gì | Mặt sau lá bài + tờ dẫn nhập |
| Bảo tàng 78 lá | Ba tác phẩm Ẩn Chính |
| Trải bài | Ba lá úp mở thành quạt |
| Healing | Lá The Star + Tứ chất Việt |
| Huyền sử | Tranh sông núi + lá The Chariot |
| Chuyện Hường Đông | Tư liệu làm bài + lá The Empress |
| Cửa hàng | Ba ảnh gói Standard / Premium / Signature |

## Gói sản phẩm

- Standard · 390.000đ: 78 lá, hộp giấy mỹ thuật, thẻ hướng dẫn nhanh.
- Premium · 690.000đ: Standard + Reader Guide + bookmark; là gói được đề xuất.
- Signature · 990.000đ: Premium + hộp gỗ sơn mài khóa đồng + túi gấm thêu tay + thẻ chứng nhận đánh số.

Giá giao diện, FAQ và Product JSON-LD cùng đọc từ `PACK_TIERS` trong `scripts/build.js`.
