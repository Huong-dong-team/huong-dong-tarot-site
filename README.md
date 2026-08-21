# Hường Đông Tarot — bản bàn giao Firebase

Website dùng HTML tĩnh sinh sẵn để Facebook, Threads và công cụ tìm kiếm đọc đúng thẻ chia sẻ. Trang quản trị là JavaScript thuần kết nối Firebase.

## Chạy thử không cần Firebase

```bash
npm install
npm run build:local
npm run test
npm run serve
```

Mở `http://localhost:8080`. Chế độ này dùng dữ liệu trong `seed/` và không ghi dữ liệu thật.

## Kết nối Firebase

1. Sao chép `.env.example` thành `.env` và điền cấu hình web Firebase.
2. Đặt đường dẫn service account vào `GOOGLE_APPLICATION_CREDENTIALS`.
3. Sao chép `.firebaserc.example` thành `.firebaserc`, thay project id.
4. Chạy `npm run seed`, `npm run build`, `npm run test`.
5. Chạy `firebase deploy --only hosting,firestore:rules,storage`.

## Dữ liệu mẫu

`seed/cards.json` có đủ 78 lá để kiểm tra giao diện. Nghĩa Tarot là lớp tham chiếu RWS. Hai mươi hai liên tưởng Việt hóa lấy từ registry đang dùng trên website Hường Đông; đội nội dung vẫn phải biên tập, dẫn nguồn và duyệt trước khi coi là bản xuất bản chính thức.

## Xuất bản sau khi biên tập

Trang khách là HTML sinh sẵn, nên lưu trong `/admin/` **chưa** làm thay đổi web. Cách xuất bản:

- Có GitHub Actions: `/admin/` → Tổng quan → **Xuất bản website** → **Run workflow**. Workflow build từ Firestore, chạy kiểm thử, chỉ triển khai khi kiểm thử đạt. Xem `HANDOVER.md` để biết danh sách secret cần thêm.
- Trên máy vận hành: `npm run build && npm run deploy`.

## Nguyên tắc vận hành

- Chỉnh nội dung trong `/admin/`, sau đó xuất bản lại để sinh HTML mới.
- Không commit `.env`, service account hoặc bất kỳ khóa riêng nào.
- API key Firebase Web là cấu hình công khai; quyền thật nằm ở Rules.
- Tarot chỉ phục vụ học tập và tự phản tư, không thay thế tư vấn chuyên môn.
