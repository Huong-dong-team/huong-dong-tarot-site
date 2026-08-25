# Audit focus trap của bảng kể chuyện

## Kết luận

Không tích hợp `focus-trap.mjs`. Bảng kể chuyện dùng `<dialog>` và
`showModal()` native, nên trình duyệt đã đưa phần còn lại của trang ra khỏi
vòng focus, xử lý Esc và trả focus về phần tử đã mở khi dialog đóng.

## Bằng chứng trong repo

- Chỉ có một `<dialog data-story-dialog>` trong `templates/home.html`.
- `showModal()` được gọi ngay trong handler click của slide; không có lệnh
  chuyển focus nào chen giữa trigger và lúc mở.
- Nút đóng gọi `dialog.close()`; phím Esc dùng hành vi native.
- Bốn `data-story-for` được build sẵn trong dialog. Không có `iframe`, `fetch`
  nội dung dialog hoặc modal lồng nhau.
- Dialog được gắn `aria-label` theo tiêu đề panel đang mở.

## Vì sao thêm thư viện sẽ có hại

Một trap JavaScript bọc quanh modal native tạo hai chủ thể cùng quản lý Tab và
khôi phục focus. Khi cả hai cùng nghe đóng modal, thứ tự teardown có thể đưa
focus về sai slide hoặc giữ focus trên phần tử vừa bị ẩn. Thêm khoảng 20 KB ở
đây không sửa lỗi nào đang tồn tại mà còn mở thêm một đường lỗi accessibility.

## Khi nào cần audit lại

Chỉ xem xét `focus-trap` nếu giao diện sau này bỏ `<dialog>` để dùng một container
tự dựng, hoặc xuất hiện lỗi đã tái hiện được trên trình duyệt mục tiêu. Nếu thêm
`iframe`, nội dung nạp động hoặc modal lồng nhau, phải kiểm tra lại vòng Tab và
đường trả focus bằng bàn phím thật trước khi chọn giải pháp.
