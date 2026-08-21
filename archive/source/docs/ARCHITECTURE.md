# Kiến trúc nền tảng

## Mục tiêu

Kiến trúc phải cho phép đổi giao diện, nội dung, cổng thanh toán và nguồn dữ liệu độc lập. SOLID được áp dụng ở ranh giới nghiệp vụ; component giao diện đơn giản không bị ép qua nhiều lớp trừu tượng.

## Dependency rule

```text
UI (app) -> Application use cases -> Domain contracts
                         ^
Infrastructure adapters -+
```

- `domain`: kiểu dữ liệu và interface ổn định; không import React, framework, database hay SDK bên thứ ba.
- `application`: một use case cho một hành vi; nhận dependency qua constructor hoặc tham số.
- `infrastructure`: adapter cho static data, D1, payment, email, analytics, shipping.
- `app`: page/component, chỉ điều phối input-output và trạng thái trình bày.
- `content`: dữ liệu biên tập dễ sửa, chưa cần CMS.

## Module hiện có

| Module | Trách nhiệm | Điểm thay thế |
| --- | --- | --- |
| `catalog` | Sản phẩm, tier, trạng thái bán | `ProductRepository` |
| `recommendations` | Gợi ý tier theo nhu cầu | Hàm `recommendProducts` |
| `checkout` | Kiểm tra yêu cầu và mở phiên thanh toán | `PaymentGateway` |
| `invoicing` | Tra cứu phiếu thu bằng token băm, không coi là hóa đơn thuế | `SalesReceiptRepository` |
| `analytics` | Hợp đồng event cho funnel | `AnalyticsPort` |

## Vòng đời commerce bắt buộc

```text
draft -> pending_payment -> paid -> confirmed -> producing -> ready_to_ship -> shipped -> delivered
             |              |
             |              +-> refund_pending -> refunded
             +-> payment_failed | payment_canceled | payment_expired
```

Quy tắc kỹ thuật:

- Giá và tổng tiền phải tính lại ở server; không tin số tiền từ trình duyệt.
- Webhook phải xác thực chữ ký, lưu `provider_event_id` duy nhất và xử lý idempotent.
- Một đơn có `order_id` nội bộ; mã giao dịch của nhà cung cấp chỉ là tham chiếu ngoài.
- Không đánh dấu `paid` từ trang chuyển hướng thành công; chỉ webhook/đối soát được quyền đổi trạng thái.
- Refund là trạng thái nghiệp vụ có audit log, không xóa đơn.
- PII tối thiểu, mã hóa khi cần, phân quyền truy cập và có lịch xóa dữ liệu.

## D1/R2 hiện tại

D1 binding `DB` đã được khai báo cho `orders`, `order_items` và `payment_events`. `provider_event_id` có unique index; order lưu snapshot tên/giá và băm receipt token. Migration được sinh bởi `npm run db:generate` và phải được review như code.

R2 chưa bật vì phiếu thu MVP được render theo yêu cầu và dùng print-to-PDF phía người dùng, không lưu PDF. Chỉ thêm R2 khi có file cần giữ lâu dài cùng chính sách truy cập/xóa. Không dùng `localStorage` làm nguồn sự thật cho đơn hàng hay thanh toán.

## Quy ước lỗi

Use case ném lỗi nghiệp vụ có mã ổn định; route chuyển thành HTTP status; UI hiển thị thông điệp thân thiện. Không trả stack trace, secret hay payload webhook ra client.
