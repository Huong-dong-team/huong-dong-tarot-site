# ADR 0001: Static content first, ports for change

- Status: Accepted
- Date: 2026-08-03

## Context

Dự án chưa có traffic, order, payment provider hoặc CMS source of truth. Mục tiêu hiện tại là vertical slice có SEO, storytelling và funnel deposit để kiểm chứng nhu cầu.

## Decision

Giữ catalog và card demo trong TypeScript content files; truy cập qua repository interface. Không bật database/CMS trước khi có workflow ghi dữ liệu thật. Checkout dùng `PaymentGateway` port nhưng không triển khai adapter thu tiền cho đến khi có quyết định nhà cung cấp và chính sách.

## Consequences

- Developer mới đọc và sửa dễ; build nhanh; nội dung render server-side.
- Có thể thay static repository bằng D1/CMS mà không viết lại page/use case.
- Chưa có admin UI, order persistence hoặc giao dịch thật; đây là giới hạn có chủ đích, không phải chức năng giả.
