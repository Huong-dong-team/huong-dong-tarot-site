# Analytics và KPI

## Quyết định cần hỗ trợ

Website phải trả lời: có đủ bằng chứng nhu cầu để tiếp tục pre-order và sản xuất không? Lượt thích và follower không phải bằng chứng thương mại.

## Funnel chuẩn

`Qualified visit -> Quest start -> Quest complete -> Waitlist -> Deposit -> Paid preorder -> Delivered order`

| Cấp | KPI | Định nghĩa | Quyết định |
| --- | --- | --- | --- |
| Primary | Deposits from non-personal traffic | Số đặt cọc thành công, loại nguồn nội bộ/người quen | Proof/launch gate |
| Primary | Paid preorder | Đơn được webhook xác nhận trả đủ, trừ hoàn tiền | Print gate |
| Driver | Quest start rate | `quest_start / qualified_view` | Sức hút hook/landing |
| Driver | Quest completion rate | `quest_complete / quest_start` | Giá trị học và retention |
| Driver | Waitlist-to-deposit | `deposit_success / waitlist_submit` theo cohort | Ý định trả tiền |
| Guardrail | Payment error rate | Phiên lỗi / phiên bắt đầu thanh toán | Reliability |
| Guardrail | Refund rate | Đơn hoàn / đơn đã trả | Trust và chất lượng kỳ vọng |
| Guardrail | CAC per paid order | Chi phí acquisition / paid orders | Hiệu quả kênh |

## Gate tạm thời từ chiến lược dự án

- 30 deposit: proof gate; dưới mức này cần thu hẹp hoặc sửa funnel.
- 100 deposit: launch gate để mở pre-order có điều kiện.
- 250 đơn trả đủ: print gate, đồng thời cash collected phải che ít nhất 120% nghĩa vụ sản xuất-fulfillment theo báo giá thật.
- Kênh có 1.000 qualified visits nhưng dưới 5 deposit cần dừng hoặc điều tra lỗi kỹ thuật/thông điệp.

Các ngưỡng trên là policy thử nghiệm, không phải forecast. Thay bằng dữ liệu thật theo tuần.

## Event contract

Các event được khai báo tại `modules/analytics/domain/events.ts`. Mỗi event tối thiểu có `name`, `occurredAt`, `source`; event tiền có `productId`, `value`, `currency`.

Landing Hường Đông bổ sung hai tín hiệu khám phá nội dung không chứa dữ liệu cá nhân:

- `minor_collection_open`: người dùng chủ động chọn hệ 56 lá Ẩn Phụ.
- `minor_collection_complete_view`: người dùng mở đến cuối tập kết quả Ẩn Phụ đang lọc.

Hai tín hiệu này chỉ đo mức độ quan tâm đến bộ bài, không được diễn giải thành ý định mua nếu chưa có `lead_submitted` hoặc bằng chứng đặt cọc.

Không gửi email, số điện thoại, địa chỉ, nội dung nhật ký Tarot hoặc payment payload vào analytics. Dedupe server-side bằng event/order id khi kết nối provider.

## Dashboard tuần

Chỉ cần sáu số ở review vận hành: qualified sessions, quest starts, completions, waitlist, deposits và cash collected. Thêm breakdown theo source, campaign, device và buyer segment khi đủ mẫu; không kết luận từ cohort quá nhỏ.
