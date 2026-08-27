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

- Trang chủ hiển thị hero, sáu lá nổi bật và form chờ; không còn watermark chim
  Lạc hoặc trống đồng trên trang khách.
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

## Nhật ký phối hợp · trình tự Layer 1–2 và gỡ họa tiết ngày 26/08/2026

Branch: `fix/layer-sequence-remove-motifs` — tách từ `origin/main` tại merge
commit `07e4adb` của PR #47. Chủ dự án tiếp tục là người merge.

### Yêu cầu và quyết định

- Yêu cầu mới của chủ dự án thay thế riêng điều kiện `animated=false` trong bàn
  giao v1.0 và quyết định “Layer tĩnh” của PR #47; các giới hạn còn lại vẫn giữ.
- Layer 1 hiện trong `420ms`; Layer 2 giữ ẩn đúng `420ms`, sau đó hiện trong
  `620ms`. Hai hiệu ứng chỉ chạy một lần khi khung nội dung được dựng, không
  liên kết với cuộn và không chạm hero.
- `prefers-reduced-motion: reduce` bỏ animation và trả hai lớp về trạng thái
  cuối ngay lập tức.
- Gỡ watermark chim Lạc và trống đồng khỏi CSS trang khách, gồm watermark của
  section và lớp `body::after`. Giữ nguyên asset nguồn, biểu tượng quản trị và
  hình trang trí riêng của mặt lưng lá bài vì chúng không phải watermark nền.
- Critical CSS giữ Layer 2 ở `opacity: 0` để tranh không lóe lên trước Layer 1.

### Xác minh

```text
npm run build:local   PASS — 86 URL
npm run test          PASS — 29/29 tệp test
npm run check:types   PASS
```

Trình duyệt cục bộ tại `/huyen-su/`:

- Desktop 1366×768: khi Layer 1 đang tăng `0.534 → 0.619`, Layer 2 vẫn bằng
  `0`; sau mốc `420ms`, Layer 1 đứng ở `0.62` và Layer 2 mới tăng tới `0.10`.
  Ảnh `huyen-su-1536.avif`, `naturalWidth=1536`, `multiply`, không tràn ngang.
- Mobile 390×844: `0ms` hai lớp cùng bằng `0`; tại `180ms`, Layer 1 là `0.260`
  còn Layer 2 vẫn `0`; tại khoảng `440ms`, Layer 2 vẫn `0`; sau đó tranh tăng
  tới `0.06`. Ảnh `huyen-su-1024.avif`, `naturalWidth=1024`, không tràn ngang.
- Cả hai viewport: `body::after` có `background-image: none`; CSS trang khách
  không còn tham chiếu `trong-dong-640.avif` hoặc `chim-lac-640.avif`.

## Nhật ký phối hợp · Hero sơn mài v2 ngày 27/08/2026

Branch: `feat/subpage-hero-lacquer-v2` — tách từ `origin/main` tại merge commit
`cd3f110` của PR #48. Chủ dự án là người merge; branch này không tự triển khai.

### Chỉ dẫn mới thay thế bàn giao v1

- Hai điều `noHeroChanges: true` và `animated: false` của manifest v1.0.0 không
  còn hiệu lực với bảy nhóm route trang trong. Bảy tranh master trong ZIP là
  tranh Hero, không phải tranh lặp dưới phần nội dung.
- `reference/huong-dong-lacquer-content-layer-v1.png` vẫn chỉ dùng cho nội dung
  trang chủ sau Hero; không dùng làm Hero trang chủ.
- Thứ tự trang trong: Layer 1 màu `0–420ms`; tranh route `420–1070ms`; bóng
  `490–990ms`; Headline `600–1320ms`; Subheadline `700–1350ms`; CTA hiện có
  `800–1380ms`. Easing chung `cubic-bezier(.22, 1, .36, 1)`.
- Timeline trang chủ giữ mốc đã duyệt: tranh `0ms`, overlay `70ms`, Headline
  `180ms`, Subheadline `280ms`, CTA `380ms`. Không tự thêm CTA vào trang trong.
- Opacity cuối của tranh Hero: desktop `.12–.14`, tablet `.095–.11`, mobile
  `.07–.08`; `mix-blend-mode: multiply`. Gradient bảo vệ chữ chỉ nằm quanh vùng
  copy, không phủ một tấm kem đục lên toàn bộ tranh.

### Ánh xạ và cấu trúc

| Route | `data-page-art` / asset |
| --- | --- |
| `/tarot-la-gi/` | `tarot-la-gi` |
| `/la-bai/*` | `la-bai` |
| `/trai-bai/*`, `/la-bai-hom-nay/` | `trai-bai` |
| `/huyen-su/*` | `huyen-su` |
| `/healing/` | `healing` |
| `/tin-tuc/*` | `chuyen-huong-dong` |
| `/cua-hang/` | `cua-hang` |

- `scripts/build.js` chèn `<picture class="subpage-hero-artwork">` vào
  `.page-hero`. Chi tiết lá dùng `.card-detail` làm khung mở đầu; bài viết dùng
  `<header>` của `.post-detail`, nên các pattern `/*` không bị rơi khỏi bảng.
- Mỗi Hero chỉ tải đúng một AVIF/WebP route, `eager`, `fetchpriority="high"` và
  preload responsive. `home-content` giữ `lazy`/ưu tiên thấp sau Hero.
- Bìa Huyền sử cũ được gỡ khỏi template để không chồng hai tranh trong cùng Hero.
- Layer 2 route không còn trong `.subpage-content-frame`; Layer 1 tĩnh vẫn nối
  nền các section sau Hero. Route ngoài bảng tiếp tục không mượn tranh.
- Critical CSS neo picture tuyệt đối và giữ frame đầu ở opacity `0`, tránh CLS
  hoặc lóe trạng thái cuối. `page-transition.css` chuyển sang stylesheet chuẩn
  vì nay nó quyết định trạng thái đầu của nội dung trên màn hình đầu.

### Lỗi cascade bắt được khi đo thật

Lần đầu `.lacquer-hero` khai báo mặc định `--hero-art-opacity: .13` và
`--hero-art-position: center top`. Hai biến này nằm trên phần tử con nên chặn
giá trị theo route kế thừa từ `<main>`, khiến mọi route cùng rơi về `.13`.
Đã bỏ khai báo chặn và đặt fallback ngay tại `var(...)`; test hồi quy cấm hai
biến route xuất hiện lại trong rule `.lacquer-hero`.

### Xác minh

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ `/huyen-su/` sau khi animation kết thúc:

- Desktop 1366px: Hero `1351 × 551px`, opacity `0.14`, AVIF 1536, position
  `50% 0%`, `multiply`, `scrollWidth - clientWidth = 0`.
- Mobile 390px: Hero `390 × 403px`, opacity `0.08`, AVIF 1024, position
  `22% 0%`, `multiply`, `scrollWidth - clientWidth = 0`.
- Mẫu thời gian mobile: Layer 1 gần hoàn tất trong khi tranh còn `0`; tranh tăng
  đơn điệu `0 → .04932 → .07986 → .08`. Không có mốc sáng quá rồi tối lại.
- Phép tính tương phản bảo thủ dùng pixel tranh đen tuyệt đối ở opacity `.14`
  trên `--paper-band`: Headline `10.41:1`, Subheadline `5.67:1`; CTA vàng với
  chữ `--ink` là `11.68:1`, đều vượt mục tiêu `4.5:1`.

## Nhật ký phối hợp · tăng độ rõ phía phải Hero ngày 27/08/2026

Branch: `tune/subpage-hero-right-opacity` — tách từ `origin/main` tại merge
commit `ca7ce57` của PR #49. Chủ dự án tiếp tục là người merge; branch không tự
triển khai production.

### Phạm vi và cách hiểu

- “Transparency 40%” được triển khai thành opacity đỉnh `.40` của tranh ở vùng
  trống phía phải Hero trang trong; không phải làm tranh trong suốt hơn.
- Không tăng đều toàn khung. Mask alpha theo chiều ngang giữ phần tranh nằm dưới
  Headline/Subheadline ở opacity hiệu dụng `.14` (`.40 × .35`), sau đó tăng dần
  và mở hoàn toàn ở phía phải.
- Tablet dùng đỉnh `.28`, vùng chữ xấp xỉ `.11`; mobile dùng đỉnh `.16`, vùng
  chữ `.08`. Hai breakpoint này không có khoảng trống ngang lớn như desktop.
- Chỉ `.page-hero.lacquer-hero` nhận mức mới. `.card-detail`, header bài viết,
  phần nội dung trang chủ và Hero trang chủ giữ nguyên vì copy/motif nằm ở vị
  trí khác.
- Giữ `mix-blend-mode: multiply`, Layer 1, gradient bảo vệ chữ và toàn bộ
  entrance timeline. Animation tranh vẫn đi đơn điệu từ `0` đến đúng opacity
  cuối, không có mốc sáng lên rồi tối lại.

### Xác minh cần giữ khi tiếp tục

- Desktop: computed opacity của picture `.40`; mask có alpha `.35` ở trái và
  alpha `1` ở phải.
- Tablet/mobile: computed opacity lần lượt `.28`/`.16`; không tràn ngang.
- Vùng chữ desktop dùng kịch bản tương phản bảo thủ là pixel tranh đen tuyệt đối
  ở opacity hiệu dụng `.14`; Headline, Subheadline và CTA phải tiếp tục đạt AA.
- Bảy route top-level đều phải nhận rule; route chi tiết vẫn giữ mức theo bảng
  v2 (`.12–.14` desktop).

### Kết quả xác minh trên branch

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ sau khi entrance kết thúc:

- `/huyen-su/` 1366×768: opacity `.40`, mask trái `.35` → phải `1`, AVIF
  1536, `multiply`, không tràn ngang.
- `/huyen-su/` 900×900: opacity `.28`, mask trái `.40` → phải `1`, AVIF
  1024, không tràn ngang.
- `/huyen-su/` 390×844: opacity `.16`, mask trái `.50` → phải `1`, AVIF
  1024, không tràn ngang.
- `/la-bai/the-star/` 1366×768: `.card-detail` vẫn opacity `.135`, mask
  `none`; chứng minh rule mới không tràn sang Hero chi tiết.
- `/` 1366×768: Hero trang chủ không có `.subpage-hero-artwork`; không đổi.
