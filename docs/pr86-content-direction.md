# PR #86 — hướng nội dung đã xác nhận lại

Ngày 04/09/2026, chủ dự án xác nhận giữ Bản tin + Khóa học, không Healing và
không bói/rút bài tự động. Quyết định này thay thế cấu trúc bảy nhóm trong
commit `3f1e993`. Nhánh PR đã tích hợp main `1ec9432`, không merge vào main.

## Phạm vi giữ và thay

- Giữ logo, favicon đa kích thước, trang tải xuống và lockfile/sửa CI của main.
- Giữ năm mục: Tarot là gì, Bảo tàng 78 lá, Khóa học, Bản tin, Cửa hàng.
- Khôi phục trang `/khoa-hoc/`, các cảnh Kirigami và mục lục của năm nhóm.
- Giữ 38 bài seed, trong đó 12 bài phản tư, cùng bài học và mẫu tự ghi chép.
- Huyền sử nằm trong Bảo tàng; URL cũ chuyển hướng tới nơi đọc mới.
- Healing và các trang bói cũ chỉ chuyển hướng tới Khóa học, không có trong
  menu/sitemap và không được nạp lại bằng bộ điều hướng JavaScript.
- Firestore vẫn là nguồn thật. Build production phải dừng khi thiếu khóa hoặc
  đọc dữ liệu thất bại, không âm thầm dùng seed. Bản xem thử local dùng `--seed`.

## Trạng thái xuất bản

Việc cập nhật PR không ghi Firestore và không triển khai Hosting. Chỉ sau khi
PR được duyệt/merge và chủ dự án cho phép xuất bản mới chạy workflow.

Tùy chọn `publish_news_course` mặc định tắt. Khi bật, publisher chỉ tạo các bài
chưa tồn tại và giữ nguyên mọi bài đang có trong admin, kể cả bản nháp. Những
bài trùng slug cần được đối chiếu riêng nếu muốn cập nhật nội dung.

## Kiểm tra trước khi bàn giao

Build seed, toàn bộ test, kiểm kiểu; xác minh logo/favicon/trang download vẫn
có, các liên kết menu đúng, không xuất hiện lại tính năng bói; kiểm tra Bản tin,
Khóa học và trang chủ ở desktop, tablet và mobile. Kết quả cuối cùng được ghi
trong PR; không diễn giải việc xóa dấu xung đột là đã phát hành website.
