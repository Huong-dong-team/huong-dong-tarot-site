# Museum Gallery · phần mở rộng hệ thiết kế Hường Đông

## Phạm vi

Hệ này chỉ áp dụng cho `main[data-page="library"]`. Nó mở rộng `subpage-remake.css`, không thay thế token hoặc component của sáu nhóm trang còn lại.

## Token

| Vai trò | Token | Giá trị |
| --- | --- | --- |
| Tường ngọc | `--museum-wall` | `#102b27` |
| Tường sâu | `--museum-wall-deep` | `#0b201d` |
| Khung vàng già | `--museum-frame` | `#b99149` |
| Vàng sáng | `--museum-frame-light` | `#e3c888` |
| Nhãn giấy ngà | `--museum-label` | `#f7eedc` |
| Mực nhãn | `--museum-label-ink` | `#382518` |
| Viền tường | `--museum-line` | `rgb(227 200 136 / 38%)` |

Đỏ son, vàng pastel, giấy nền và display font tiếp tục lấy từ hệ sub-page hiện hữu.

## Component

### MuseumRoomNav

- Desktop: flex wrap, bốn cửa phòng trong Hero.
- Mobile ≤720px: lưới 2 × 2, mỗi target cao tối thiểu 46px.
- Hover/focus đổi từ ngọc sang giấy ngà, không làm dịch chuyển bố cục.

### MuseumFilterRail

- Desktop: sticky ở `top:88px` để nằm dưới header 76px.
- Tablet/mobile: trở lại normal flow.
- Trạng thái chọn dùng đỏ son; input/select dùng ngọc sáng hơn tường.

### MuseumFrame

- Ảnh thật từ data hiện hữu, tỉ lệ 2:3, `object-fit:cover`.
- Khung nhiều lớp bằng border/outline/shadow, không tạo tranh giả bằng CSS.
- `content-visibility:auto` và intrinsic size giảm chi phí render 78 hiện vật.

### MuseumPlaque

- Nền giấy ngà, accession nhỏ, tên Việt là tiêu đề, tên Rider–Waite màu đỏ son.
- Nguồn truyện giữ một dòng ưu tiên; CTA “Ngắm cận cảnh” luôn có vùng chạm ≥44px.

### MuseumLightbox

- Dùng `<dialog>` native, nền ngọc sâu, ảnh trái/copy phải trên desktop; một cột dưới 900px.
- Nút Đóng là phần tử focus đầu; Escape theo hành vi native.
- ArrowLeft/ArrowRight duyệt tập hiện vật đang hiển thị; đóng trả focus về opener.
- Link “Mở hồ sơ tác phẩm” giữ lối vào trang chi tiết cũ.

## Motion và khả năng tiếp cận

- Entrance/fade/tilt hiện hữu tiếp tục áp dụng cho hiện vật.
- `prefers-reduced-motion:reduce` tắt transform và transition trang trí.
- Focus ring 3px vàng pastel, offset 3px.
- Không phụ thuộc màu đơn lẻ để biểu đạt trạng thái: button chọn có cả `aria-pressed`.

## Quy tắc dữ liệu

- Không sao chép JSON vào module lightbox; module đọc từ DOM được build từ nguồn dữ liệu hiện tại.
- `/la-bai/` là đại sảnh mới; `/huyen-su/` và các route truyện vẫn được sinh để tương thích ngược.
- Không ghi đè ảnh bài hoặc xóa ribbon trạng thái trong asset nguồn.
