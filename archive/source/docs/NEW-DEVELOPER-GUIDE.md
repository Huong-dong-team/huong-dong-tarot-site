# Hướng dẫn cho developer mới

## Chọn đúng nơi sửa

| Bạn muốn đổi | File/thư mục | Không sửa |
| --- | --- | --- |
| Câu chữ/nav | `content/*.ts` | Checkout/domain |
| Màu/font/khoảng cách | token đầu `app/globals.css` | Giá/tổng tiền |
| Bố cục route | `app/**/page.tsx` | Adapter thanh toán |
| Luật tính tiền/trạng thái | `modules/checkout/domain` và `application` | JSX/CSS |
| PSP/database | `modules/*/infrastructure` | Component |

## Vòng lặp an toàn

1. Tạo thay đổi nhỏ, nêu mục tiêu và rủi ro.
2. Thêm hoặc sửa data trước, rồi mới render ở component.
3. Không dùng `any`, `catch {}` để nuốt lỗi, tắt lint hoặc hard-code secret.
4. Chạy `npm run lint` và `npm test`.
5. Với schema: chạy `npm run db:generate`, đọc SQL migration rồi mới commit.
6. Với thanh toán: cần ADR Accepted, sandbox và bộ test webhook; không “mở nút để thử”.

Màn hình chuyển khoản/Visa/MoMo trong checkout là **visual demo**. Nó không được gọi API checkout, ghi D1, phát phiếu thu hoặc đổi order sang `paid`. Muốn thử PSP thật phải dùng sandbox credentials ở adapter/server và giữ nguyên nhãn môi trường.

## Bản quyền và đóng góp

Kiến trúc mở rộng cho việc học và cộng tác nhưng repository không dùng giấy phép open-source. Mọi đóng góp thuộc quy trình của chủ sở hữu và phải giữ notice `© 2026 NguyenHongKhang. All rights reserved.` trừ khi có thỏa thuận khác bằng văn bản.
