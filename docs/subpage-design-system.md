# Hệ thị giác 7 trang trong · Hường Đông Tarot

Ngày chốt: 31/08/2026  
Phạm vi: `/tarot-la-gi/`, `/la-bai/`, `/trai-bai/`, `/healing/`, `/huyen-su/`, `/tin-tuc/`, `/cua-hang/`.

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

- `.section-feature`: bố cục chữ + minh họa hai cột, chuyển một cột dưới 980px.
- `.section-visual`: ảnh tiểu mục 4:3 có đường viền vàng cổ và chiều sâu nhẹ.
- `.section-card-fan`: ba lá 2:3 xếp quạt, dùng ảnh bài hiện có.
- `.portrait-card`: thẻ chân dung cho Tứ Bất Tử.
- `.pricing-grid` / `.price-tier`: ba phiên bản Standard, Premium, Signature; Premium có ribbon “Được đề xuất”.

## Chuyển động và khả năng truy cập

- `subpage-motion.js` chỉ nghiêng tối đa khoảng 3° theo con trỏ, dùng `transform` và tự dọn listener khi Swup đổi trang.
- Không kích hoạt tilt trên cảm ứng.
- `prefers-reduced-motion: reduce` tắt toàn bộ tilt/hover transition mới.
- Mỗi trang có đúng một `h1`, một `main#noi-dung-chinh`, ảnh có `alt`, điều hướng mobile giữ nút chạm 45px.

## Gói sản phẩm

- Standard · 390.000đ: 78 lá, hộp giấy mỹ thuật, thẻ hướng dẫn nhanh.
- Premium · 690.000đ: Standard + Reader Guide + bookmark; là gói được đề xuất.
- Signature · 990.000đ: Premium + hộp gỗ sơn mài khóa đồng + túi gấm thêu tay + thẻ chứng nhận đánh số.

Giá giao diện, FAQ và Product JSON-LD cùng đọc từ `PACK_TIERS` trong `scripts/build.js`.
