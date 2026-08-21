# FILE MANIFEST — Hường Đông Tarot

## Gốc dự án

- `README.md` — hướng dẫn cài đặt và vận hành.
- `HANDOVER.md` — checklist kiểm thử, cấu hình và triển khai.
- `package.json` — lệnh build, seed, test, serve và deploy.
- `.env.example` — biến môi trường mẫu, không chứa bí mật.
- `firebase.json` — cấu hình Hosting, Firestore và Storage.
- `firestore.rules` — quyền truy cập dữ liệu theo vai trò.
- `firestore.indexes.json` — chỉ mục truy vấn cần thiết.
- `storage.rules` — quyền upload ảnh và giới hạn tệp.

## `scripts/`

- `build.js` — đọc Firestore hoặc dữ liệu mẫu, sinh toàn bộ website tĩnh vào `dist/`.
- `seed.js` — nạp dữ liệu mẫu vào Firestore.
- `create-admin.js` — tạo tài khoản owner đầu tiên.
- `prepare-seed.mjs` — đồng bộ dữ liệu 78 lá từ mã nguồn Hường Đông hiện tại.
- `serve.js` — máy chủ tĩnh để kiểm tra cục bộ.
- `lib/render.js` — bộ render HTML và escape an toàn.
- `lib/slugify.js` — sinh slug tiếng Việt.
- `lib/seo.js` — meta, Open Graph, Twitter Card và JSON-LD.

## `templates/`

- `_layout.html` — khung HTML chung.
- `home.html`, `card-list.html`, `card-detail.html` — trang chủ và thư viện bài.
- `post-list.html`, `post-detail.html` — tin tức.
- `about.html`, `privacy.html`, `404.html` — giới thiệu, quyền riêng tư và lỗi 404.

## `public/`

- `assets/css/main.css`, `admin.css` — giao diện khách và quản trị.
- `assets/js/site.js` — lọc bài, form danh sách chờ, chia sẻ, hạt bụi và carousel hero.
- `assets/img/` — trống đồng, chim Lạc, tranh Ẩn Chính và biểu tượng bốn chất.
- `assets/img/cards/major-17-the-star.webp`, `major-03-the-empress.webp` — hai lá của carousel hero, dùng chung tệp với thư viện.
- `assets/img/four-houses.webp` — sơ đồ bốn nhà Ẩn Phụ, mục `#bon-nha` trang chủ.
- `admin/` — SPA vanilla JS quản trị nội dung, ảnh, email và cấu hình.

## `seed/` và `tests/`

- `seed/cards.json` — 78 lá mẫu; 22 Ẩn Chính có lớp liên tưởng Hường Đông.
- `seed/posts.json`, `seed/settings.json` — tin mẫu và cấu hình.
- `tests/` — kiểm kê 78 lá, SEO tĩnh, tệp bắt buộc, kiểm tra định dạng GA4 và từ khóa cấm.
