# Tích hợp Firebase cho Hường Đông Tarot

## Trạng thái kiến trúc

- Website và API hiện tiếp tục chạy trên Sites/Cloudflare để không làm gián đoạn bản công khai.
- Web App đã liên kết với Firebase project `huong-dong-tarot-729d2` bằng SDK modular.
- Firestore và Authentication dùng chung một Firebase App được khởi tạo theo nhu cầu.
- Firebase Analytics nhận các sự kiện funnel hiện có và tự bỏ qua khi trình duyệt không hỗ trợ/chặn theo dõi.
- Firestore dự kiến quản lý `cards`, `stories`, `externalSources` và hồ sơ người dùng.
- D1 vẫn là nguồn dữ liệu đơn hàng/thanh toán trong giai đoạn này. Không ghi đơn hàng trực tiếp từ trình duyệt vào Firestore.

## Liên kết project thật

1. Tạo hoặc chọn project tại Firebase Console.
2. Bật **Cloud Firestore** và **Authentication**.
3. Cấu hình Web App production đã có sẵn; chỉ dùng `firebase.env.example` nếu cần trỏ bản local sang project/emulator khác.
4. Đăng nhập và triển khai Rules/Indexes:

```bash
npx firebase-tools login
npx firebase-tools use huong-dong-tarot-729d2
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

5. Chạy `npm run lint`, `npm run build`, rồi kiểm tra Emulator trước khi chuyển dữ liệu thật.

> `apiKey` của Firebase Web App là định danh phía client và sẽ xuất hiện trong bundle trình duyệt. Không đưa service-account JSON, khóa thanh toán hoặc Admin SDK secret vào mã nguồn; quyền truy cập dữ liệu phải được khóa bằng Firestore Security Rules.

## Firebase Hosting

Mã nguồn hiện có API server, D1 và webhook nên không phù hợp để đẩy nguyên trạng lên Firebase Hosting tĩnh. Chỉ chuyển Hosting sau khi chọn một trong hai hướng:

- Giữ frontend tĩnh trên Firebase Hosting, tách API sang Cloud Functions/Cloud Run; hoặc
- Chuẩn hóa lại thành Next.js cho Firebase App Hosting.

Không deploy `orders`, webhook hoặc khóa thanh toán vào frontend.
