# Design QA · Palette vàng kim cho Headline Hero

## Bằng chứng so sánh

- Source visual truth: `docs/qa/hero-headline-gold-palette-reference.jpg`.
- Implementation screenshot: `docs/qa/hero-headline-gold-palette-implementation.jpg`.
- Side-by-side comparison: `docs/qa/hero-headline-gold-palette-comparison.jpg`.
- Trạng thái: trang chủ sau khi font và stylesheet tải xong; không hover, không
  mở menu, không cuộn.
- Viewport CSS: `1280 × 720`, device scale factor `1`.
- Ảnh nguồn: `383 × 174px`; ảnh implementation: `1265 × 712px`; ảnh so sánh:
  `1280 × 720px`. Không nội suy ảnh nguồn để lấy mã màu; dùng trực tiếp năm mã
  in dưới bảng mẫu.
- Console errors: `0`.

## Full-view comparison

Headline hiển thị đủ dải màu theo đúng thứ tự của ảnh: `#B18906`, `#FAF8D0`,
`#C69F24`, `#F1CA43`, `#AF8400`. Dải sáng kem nằm giữa vàng tối và vàng tươi,
cho cùng cảm giác ánh kim của thanh mẫu. Viền và ba lớp tạo khối cũng dùng các
màu trong bảng, nên không còn bóng nâu cũ làm lệch tông.

Không cần crop so sánh phụ: nguồn chỉ là một thanh màu `383 × 174px`, còn
headline chiếm vùng khoảng `692 × 633px` trong ảnh implementation và đủ lớn để
đọc rõ chuyển sắc trong ảnh side-by-side. Mã màu được xác minh thêm bằng
computed style của trình duyệt.

## Các bề mặt fidelity bắt buộc

- Fonts và typography: Ganh italic `400`, cỡ, line-height, letter-spacing và
  wrap giữ nguyên; chỉ palette đổi.
- Spacing và layout rhythm: không đổi selector bố cục, padding, margin, grid,
  kích thước ảnh hoặc breakpoint; không có overflow ngang ở viewport kiểm tra.
- Colors và tokens: đủ đúng năm mã và đúng thứ tự ảnh; Headline có token riêng,
  không dùng chung gradient đồng của Subheadline.
- Image quality và asset fidelity: ảnh tham chiếu chỉ dùng làm nguồn palette,
  không bị đưa vào giao diện production và không thay thế bằng asset giả. Text
  vẫn là HTML/CSS để giữ khả năng đọc, responsive và truy cập.
- Copy và content: Headline, Subheadline và toàn bộ nội dung trang giữ nguyên.

## Findings

Không có P0, P1 hoặc P2. Vệt `#FAF8D0` rất sáng trên vùng trời kem nhưng đây là
điểm lóe chủ ý của nguồn; stroke `#AF8400` và bóng `#B18906` vẫn giữ biên chữ.

## Comparison history

- Pass 1: không phát hiện chênh lệch P0/P1/P2; không cần vòng sửa hình ảnh.

## Follow-up polish

Không có P3 cần xử lý trong phạm vi thay palette.

final result: passed
