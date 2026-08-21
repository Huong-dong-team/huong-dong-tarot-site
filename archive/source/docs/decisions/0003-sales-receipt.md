# ADR 0003 – Phiếu thu PDF và hóa đơn điện tử

- Trạng thái: **Accepted cho MVP phiếu thu; hóa đơn điện tử chờ ADR riêng**
- Ngày: 2026-08-03

## Quyết định

MVP cung cấp **phiếu xác nhận thanh toán không phải hóa đơn thuế** tại URL có `orderId` và opaque access token. Server chỉ trả phiếu cho đơn đã thanh toán; database lưu SHA-256 của token, không lưu token rõ. Người dùng dùng chức năng “In hoặc lưu thành PDF” của trình duyệt.

Không sinh hoặc lưu PDF trên server/R2 trong MVP. Điều này giảm PII, quyền truy cập file và lịch xóa cần quản lý. Phiếu chỉ hiển thị dữ liệu đơn đã có; tên/email là tùy chọn, không thu thêm địa chỉ hoặc mã số thuế để tạo phiếu.

## Phân biệt bắt buộc

| Loại | Ý nghĩa | Trạng thái |
| --- | --- | --- |
| Phiếu thu/xác nhận thanh toán | Chứng từ vận hành cho người mua; không phải hóa đơn thuế hợp pháp | Có trong MVP sau trạng thái paid |
| Hóa đơn điện tử Việt Nam | Chứng từ thuế theo pháp nhân bán hàng, quy định và nhà cung cấp hóa đơn điện tử | Chưa triển khai; phải có ADR/provider/pháp lý riêng |

Nếu giao diện hỏi loại chứng từ mà người dùng không chọn, mặc định là phiếu thu loại 1; tuyệt đối không tự tuyên bố đã phát hành hóa đơn điện tử.
