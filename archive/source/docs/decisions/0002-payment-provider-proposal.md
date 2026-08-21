# ADR 0002 – Đề xuất cổng thanh toán đa phương thức

- Trạng thái: **Proposed – chờ NguyenHongKhang phê duyệt và báo giá merchant**
- Ngày: 2026-08-03
- Quyết định đảo ngược khó: hợp đồng merchant, đối soát, refund, Apple Pay entitlement và webhook production

## Bối cảnh

Sản phẩm cần MoMo, chuyển khoản/open banking, Apple Pay, thẻ quốc tế Visa/Mastercard và ATM/QR nội địa. Không nhà cung cấp nào được bật chỉ vì tài liệu marketing nói “hỗ trợ”; cần tài liệu tích hợp đúng sản phẩm, thuật toán chữ ký, sandbox, SLA và hợp đồng với pháp nhân bán hàng.

Chủ dự án đã xác nhận tên đúng là **MoMo**. Code có adapter boundary `MoMoPaymentGateway` nhưng không có endpoint, secret hay thuật toán giả định. Mô phỏng MoMo/chuyển khoản/Visa ở UI là một sandbox trình diễn nội bộ, hoàn toàn tách khỏi adapter thật.

## So sánh từ tài liệu công khai

| Phương án | Phương thức công khai | Apple Pay tại Việt Nam | Webhook/refund/sandbox | Khoảng trống phải xác minh |
| --- | --- | --- | --- | --- |
| **OnePay** | Thẻ quốc tế, thẻ/tài khoản nội địa, QR theo tài liệu OnePay | Apple liệt kê OnePay trong nhóm nền tảng hỗ trợ Apple Pay tại Việt Nam | Có tài liệu payment flow; chi tiết merchant/refund phụ thuộc gói | Phí, SLA, settlement, Apple Pay có nằm trong đúng hợp đồng không, bộ signature production |
| **VNPAY** | VNPAY-QR, ATM/tài khoản nội địa, thẻ quốc tế | Không kết luận từ trang sản phẩm đã đọc | Có sandbox, IPN và tài liệu refund | Apple Pay, phí, SLA, đối soát và điều kiện merchant |
| **MoMo** | Ví, ATM, thẻ qua API công khai | Apple liệt kê MoMo trong danh sách nền tảng tại Việt Nam | Có sandbox/IPN HMAC và refund docs | Apple Pay merchant path cụ thể, phí và đối soát cho mô hình này |
| **payOS** | Chuyển khoản NAPAS 24/7/VietQR, webhook | Không phải lựa chọn đủ yêu cầu thẻ/Apple Pay theo docs đã đọc | Có test environment, signature/webhook | Cần thêm PSP khác cho thẻ và Apple Pay; vận hành hai luồng |

Nguồn: [Apple Payment Platforms](https://developer.apple.com/apple-pay/payment-platforms/), [OnePay payment guide](https://onepay.vn/documents/payment/2en.html), [VNPAY sandbox/IPN](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html), [VNPAY-QR](https://vnpay.vn/Cong-thanh-toan-VNPAY-QR-0myhb8a9f2qm), [payOS docs](https://payos.vn/docs/), [MoMo payment API](https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/).

## Đề xuất

Ưu tiên xác minh thương mại **MoMo** cho ví/nội địa/thẻ theo định hướng đã xác nhận, đồng thời lấy báo giá **OnePay** như phương án bao phủ thẻ quốc tế và Apple Pay. Một hay hai PSP là quyết định vận hành chưa chốt. Chỉ chuyển ADR sang Accepted sau khi chủ dự án có:

1. Báo giá và hợp đồng merchant ghi rõ phương thức được cấp, phí/refund/chargeback/settlement.
2. Tài liệu kỹ thuật đúng phiên bản về hosted checkout, webhook/IPN, chữ ký, retry và reconciliation.
3. Xác nhận Apple Pay gồm domain verification, merchant setup và hành vi fallback trên thiết bị không hỗ trợ.
4. Sandbox credentials và bộ test case từ provider.
5. Quyết định một PSP hay hai PSP dựa trên phí, tỷ lệ chấp nhận, đối soát và gánh nặng vận hành.

## Kiến trúc đã cho phép nhưng chưa bật

- `PaymentGateway` là port; OnePay và MoMo là adapter phụ thuộc client đã inject.
- API `/api/checkout` hiện trả `503 payment_provider_not_configured`.
- Không thu/sở hữu dữ liệu thẻ thô; người mua đi qua hosted checkout/tokenization của PSP.
- Total được tính lại từ catalog ở server.
- Chỉ webhook đã xác minh mới chuyển trạng thái; redirect thành công không được đánh dấu `paid`.
- `payment_events.provider_event_id` unique và update trạng thái idempotent.
- Test state machine có success, fail, cancel, duplicate, refund, timeout; E2E sandbox vẫn là gate bắt buộc.

## Hệ quả

Chậm bật thu tiền thật nhưng tránh khóa sớm vào một SDK/hợp đồng chưa đủ dữ kiện. Đổi PSP không chạm UI hoặc use case, chỉ thay adapter và verifier.
