# BÀN GIAO VẬN HÀNH

## Biến môi trường phải điền

- `SITE_BASE_URL`: tên miền chính, mặc định `https://huongdong.id.vn`.
- `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`.
- `GOOGLE_APPLICATION_CREDENTIALS`: đường dẫn tuyệt đối đến service account, chỉ dùng khi build/seed.

## Kiểm thử tự động

```bash
npm install
npm run build:local
npm run test
```

## Kiểm thử thủ công

- Trang chủ hiển thị hero, trống đồng, chim Lạc, sáu lá nổi bật và form chờ.
- `/la-bai/` hiện đủ 78 lá; bộ lọc 22/56 và bốn chất trả đúng số lượng.
- Trang chi tiết có nghĩa xuôi/ngược, câu chuyện, biểu tượng, chia sẻ và lá trước/sau.
- Xem nguồn HTML: OG, Twitter Card và JSON-LD đã có sẵn.
- Đăng nhập admin bằng tài khoản thuộc `admins`; tài khoản ngoài danh sách bị đăng xuất.
- Tạo/sửa lá, bài tin và SEO; checklist chặn xuất bản khi thiếu dữ liệu bắt buộc.
- Upload JPG/PNG/WebP dưới 10 MB; trình duyệt sinh WebP và thumbnail; bắt buộc có alt.
- Subscriber không thể đọc danh sách từ trang khách; admin có thể xuất CSV.
- Kiểm tra mobile 390 px, desktop 1366 px, bàn phím và trạng thái focus.

## Triển khai

1. Tạo Firebase project, bật Authentication email/password và Firestore.
2. Nếu dùng upload, bật Storage (Firebase có thể yêu cầu gói Blaze).
3. Chạy `node scripts/create-admin.js --email ... --password ... --name "Nguyễn Hồng Khang"`.
4. Chạy `npm run seed && npm run build && npm run test`.
5. Chạy `npm run deploy`.
6. Gắn tên miền trong Firebase Hosting và dùng đúng bản ghi DNS Firebase cấp. Cấu hình chuyển `www` sang tên miền gốc tại nhà đăng ký hoặc một Hosting site phụ; không dùng redirect bắt mọi đường dẫn trong site chính vì sẽ gây vòng lặp.

## Xuất bản bằng một nút bấm

Trang khách là HTML sinh sẵn, nên nội dung biên tập trong `/admin/` chỉ nằm ở Firestore cho tới khi website được xuất bản lại. Workflow `.github/workflows/publish-firebase.yml` làm việc đó: build từ Firestore thật → chạy kiểm thử → triển khai Hosting. Nếu kiểm thử thất bại, workflow dừng và **không** triển khai, nên trang khách vẫn giữ bản cũ.

Chuẩn bị một lần:

1. Thêm các secret trong GitHub → Settings → Secrets and variables → Actions:
   - `FIREBASE_SERVICE_ACCOUNT`: toàn bộ nội dung tệp service-account JSON.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, `SITE_BASE_URL`.
   - Không commit service account vào repo; workflow ghi nó ra thư mục tạm của runner rồi xóa khi job kết thúc.
2. Mở `/admin/` → Cấu hình → dán link workflow vào **Link xuất bản website**, dạng
   `https://github.com/TAI-KHOAN/TEN-REPO/actions/workflows/publish-firebase.yml`.
3. Xuất bản lại một lần để link này có hiệu lực trên trang Tổng quan.

Từ đó, mỗi lần cần đưa nội dung lên web: mở `/admin/` → Tổng quan → bấm **Xuất bản website** → bấm **Run workflow** trên GitHub.

## Cấu hình ảnh hưởng tới trang khách

Các trường trong `/admin/` → Cấu hình được đọc **lúc build**, không phải lúc lưu:

| Trường | Hiện ở đâu |
| --- | --- |
| `tagline` | Chân trang mọi trang |
| `contactEmail` | Chân trang và trang Quyền riêng tư |
| `social.facebook/threads/tiktok` | Chân trang; chỉ nhận URL `http(s)`, giá trị khác bị bỏ |
| `ga4Id` | Nạp Google Analytics 4; phải đúng dạng `G-XXXXXXX`, sai định dạng hoặc để trống thì không nạp gì |
| `publishWorkflowUrl` | Nút Xuất bản website ở trang Tổng quan; chỉ nhận link `https://github.com` |

Sửa các trường này rồi phải xuất bản lại mới thấy thay đổi.

## Giả định đã tự quyết

- Giữ đủ 78 lá để không làm website mới bị lùi so với phiên bản đang chạy.
- Hai mươi hai lá Ẩn Chính dùng tranh và tên Việt hóa hiện hành; 56 lá Ẩn Phụ dùng phù hiệu bốn nhà cho đến khi có tranh riêng.
- Nội dung mẫu được đánh dấu để đội nội dung tiếp tục biên tập; không tự bịa phần dẫn nguồn còn thiếu.
- Bản Firebase được dựng song song, không tự động thay thế website Sites đang công khai.

## Nhật ký phối hợp · bản vá Layer 1–2 ngày 26/08/2026

Branch: `fix/reliable-lacquer-css` — tách từ `origin/main` tại merge commit
`3cbf003`. Chủ dự án là người merge; chưa merge thì production vẫn là bản cũ.

### Nguyên nhân và quyết định

- Production từng có thể chỉ áp dụng critical CSS vì `main.css` và
  `lacquer-art.css` đều dùng `media="print"` rồi chờ inline `onload` đổi sang
  `all`. Khi callback không hoàn tất, hero Huyền sử cao 1.272px và ảnh bị xếp
  xuống dưới chữ.
- `main.css` và `lacquer-art.css` nay là stylesheet chuẩn, không phụ thuộc
  callback. `page-transition.css` và `landing-drag.css` vẫn là tăng cường tải
  hoãn; chúng không quyết định bố cục nền tảng.
- Đặc tả JSON v1.0.0 ngày 26/08/2026 là nguồn chuẩn: route `/` dùng
  `home-content` chỉ sau hero; route ngoài bảng không mượn tranh; Layer 1–2 đều
  tĩnh. Không khôi phục `hero-lacquer-rise`, animation Layer hoặc selector
  `.hero::before` trong `lacquer-art.css`.
- Rule giảm thêm opacity dưới 430px đã gỡ. Giá trị mobile cuối cùng bám đúng
  bảng JSON (`huyen-su: 0.06`, `home-content: 0.055`).

### Phạm vi file

- `templates/_layout.html`: tải chắc chắn hai stylesheet thiết yếu.
- `scripts/build.js`: ánh xạ đúng route, giữ `.hero`/`.page-hero` ngoài khung
  tranh và bảo toàn phần script nằm sau `</main>` của trang chủ.
- `public/assets/css/critical.css`, `critical-inner.css`: chuyển khung chống CLS
  thành critical CSS dùng chung cho trang chủ và trang con.
- `public/assets/css/lacquer-art.css`: Layer tĩnh, không vẽ vào hero, không nối
  độ đậm Layer với cuộn.
- `tests/critical-css.test.mjs`, `tests/lacquer-background.test.mjs`: khóa các
  hồi quy nói trên.

### Xác minh đã chạy

```text
npm run build:local   PASS — 86 URL
npm run test          PASS — 29/29 tệp test
npm run check:types   PASS
```

Trình duyệt cục bộ:

- `/huyen-su/` desktop 1366px: hero 700px, `display:grid`, tranh AVIF 1536,
  opacity 0.10, không tràn ngang.
- `/huyen-su/` mobile 390px: hero 660px, tranh AVIF 1024, opacity 0.06,
  không tràn ngang.
- `/` desktop/mobile: `home-content` bắt đầu sau hero, opacity 0.09/0.055;
  hero không chứa `.subpage-artwork`.
- Mọi lần đo đều đạt `document.readyState = complete`.
