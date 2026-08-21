# Roadmap commerce

## Đã có trong foundation

- Catalog và tier tách khỏi UI.
- Gợi ý tier theo mục đích mua.
- Luồng chọn đặt cọc hoặc thanh toán đủ, số lượng và tóm tắt.
- Hợp đồng `PaymentGateway` để thay nhà cung cấp không sửa use case.
- Analytics event cho funnel.
- SEO, responsive, accessibility baseline và chính sách gate hiển thị rõ.

## Cần hoàn tất trước khi thu tiền thật

1. Phê duyệt ADR 0002; xác minh MoMo và PSP thẻ/Apple Pay theo hợp đồng merchant. Không suy đoán endpoint/chữ ký.
2. Chốt giá/tier, điều kiện deposit/refund, print gate, thời gian giao dự kiến và thông tin pháp lý bên bán.
3. Áp migration D1 đã review; bổ sung bảng refund/shipment khi use case được phê duyệt.
4. Nối checkout route với adapter đã được xác minh; server tải giá từ repository, không nhận tổng tiền từ client.
5. Xác thực webhook, idempotency, retry và reconciliation job.
6. Email/SMS transactional: xác nhận deposit, yêu cầu trả phần còn lại, hóa đơn, shipment.
7. Shipping adapter (GHN/GHTK/Viettel Post), bảng vùng và tracking.
8. Account/order lookup an toàn; rate limit, bot protection, privacy/retention.
9. Chạy E2E sandbox của provider. Unit regression cho success, fail, cancel, duplicate, refund và timeout đã có nhưng không thay thế E2E.
10. Monitoring: payment error, webhook lag, stuck order và alert owner.

## Sau paid proof

- Coupon/referral có attribution.
- Abandoned checkout có consent.
- Review từ đơn đã xác thực.
- Cross-sell guidebook/art print theo tier.
- CMS có preview/approval cho 78 lá.
- Backer companion web, quest progress và nội dung mở khóa.

## Không làm trước pre-order

Game đủ 78 lá, AI reader, multiplayer, marketplace, app native, CMS lớn hoặc tài khoản phức tạp.
