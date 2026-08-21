# Báo cáo triển khai nền tảng 2026-08-03

## A. Bug và kiểm soát chống vibe code

- Loại bỏ khả năng client truyền `amount`; total lấy catalog server × quantity.
- Đổi trạng thái sản phẩm từ “đang nhận cọc” sang “đang thử nghiệm nhu cầu” khi thu tiền còn khóa.
- Sửa canonical metadata khỏi domain `.example`.
- Nav mới cuộn ngang an toàn trên mobile thay vì tràn sáu mục.
- Test data đảm bảo đúng 78 slug/id duy nhất; test payment đủ success/fail/cancel/duplicate/refund/timeout.

## B. Thanh toán và chứng từ

- D1 schema: order snapshot, items, payment events unique/idempotent.
- Port `PaymentGateway`; adapter OnePay/MoMo chỉ ở dạng boundary, không đoán endpoint/chữ ký.
- Chuyển khoản, Visa và MoMo có mô phỏng UI được gắn nhãn DEMO; không gọi API và không tạo trạng thái `paid`.
- API thật trả 503 cho đến khi ADR/hợp đồng được duyệt.
- Phiếu thu protected bằng token băm, print-to-PDF; không giả là hóa đơn điện tử và không lưu R2.

## C. Ba tuyến nội dung

- `/tarot-rws`: đủ 78 lá; route riêng cho mỗi lá, câu chữ và SVG nguyên bản.
- `/chiem-tinh`: 12 cung, bốn nguyên tố, chủ tinh và liên hệ Tarot; Golden Dawn được ghi nhãn là một truyền thống.
- `/hon-cot-nuoc-nam`: timeline có phân loại tại lớp dữ liệu.

| Phân loại | Mục |
| --- | --- |
| Huyền thoại / truyền thuyết | Lạc Long Quân–Âu Cơ; Sơn Tinh–Thủy Tinh; Thánh Gióng; Lang Liêu; Mai An Tiêm; Chử Đồng Tử–Tiên Dung; nỏ thần An Dương Vương |
| Ghi chép / dấu tích khảo cổ | Thành Cổ Loa và cư dân Đông Sơn; khuôn đúc và mũi tên đồng Cổ Loa |

## D. Visual assets

- 22 glyph Ẩn Chính, hệ icon Ẩn Phụ, zodiac wheel và 9 motif huyền sử là SVG nét nguyên bản trong component.
- Bổ sung pastel coral/jade/brass/mist chỉ cho nền và đồ họa; body/CTA giữ ink/jade tương phản cao.
- Giữ nguyên radius, shadow, spacing và typography của hệ thống hiện tại.

## Bản quyền

Footer, metadata, `package.json` và `LICENSE` ghi: **© 2026 NguyenHongKhang. All rights reserved.**
