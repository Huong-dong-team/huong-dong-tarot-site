# Hường Đông Tarot Web Platform

> **Cảnh báo chống vibe code:** mọi thay đổi phải có mục tiêu, nguồn dữ liệu, test phù hợp và mô tả tác động. Không bật thanh toán bằng cách xóa trạng thái khóa hoặc giả webhook thành công.

Nền tảng digital-first cho ba mục tiêu: quảng bá sản phẩm, kể chuyện xuyên suốt và thương mại điện tử theo giai đoạn.

## Chạy dự án

Yêu cầu Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Các cổng chất lượng trước khi merge:

```bash
npm run lint
npm test
```

## Bắt đầu chỉnh sửa ở đâu?

- Nội dung thương hiệu và cốt truyện: `content/site.ts`, `content/cards.ts`
- Tra cứu RWS, chiêm tinh, huyền sử: `content/rws-cards.ts`, `content/astrology.ts`, `content/folklore.ts`
- Giá, tier và cấu phần sản phẩm: `content/products.ts`
- Màu, font, khoảng cách, responsive: các token đầu file `app/globals.css`
- Trang và bố cục: `app/`
- Luật nghiệp vụ: `modules/*/domain` và `modules/*/application`
- Kết nối thanh toán, database, analytics: `modules/*/infrastructure`

Đọc theo thứ tự:

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
2. [`docs/UX-UI-CUSTOMIZATION.md`](docs/UX-UI-CUSTOMIZATION.md)
3. [`docs/DEVELOPMENT-GUARDRAILS.md`](docs/DEVELOPMENT-GUARDRAILS.md)
4. [`docs/ANALYTICS-PLAN.md`](docs/ANALYTICS-PLAN.md)
5. [`docs/COMMERCE-ROADMAP.md`](docs/COMMERCE-ROADMAP.md)
6. [`docs/NEW-DEVELOPER-GUIDE.md`](docs/NEW-DEVELOPER-GUIDE.md)

## Trạng thái giao dịch

Luồng chọn tier, hình thức đặt cọc và tóm tắt đơn đã hoạt động. D1 schema và biên `PaymentGateway` đã có, nhưng API thu tiền thật trả lỗi ổn định `503 payment_provider_not_configured` cho đến khi ADR, hợp đồng merchant và thuật toán xác minh webhook được phê duyệt. Không đưa khóa bí mật vào code hoặc file `.env.example`.

Checkout có mô phỏng trực quan MoMo, chuyển khoản và Visa để thử UX. Mô phỏng không gọi API, không ghi D1, không phát sinh tiền và không tạo phiếu thu thật.

## Sites lifecycle

Dự án dùng Vinext starter và Sites. Giữ nguyên `sites()` Vite plugin, build script, artifact validator và `.openai/hosting.json`.

## Bản quyền

Copyright © 2026 NguyenHongKhang. All rights reserved. Xem [`LICENSE`](LICENSE). Kiến trúc được tổ chức để developer mới dễ đọc và đóng góp trong phạm vi được chủ sở hữu cho phép; đây không phải giấy phép mã nguồn mở.
