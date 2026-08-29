# BÀN GIAO VẬN HÀNH

## Nhật ký phối hợp · Hero phù điêu sơn mài 3D ngày 29/08/2026

Branch: `feat/lacquer-relief-hero`, tách từ `origin/main` tại commit `2d26558`.
Chủ dự án review/merge; branch này **chưa merge, chưa deploy**.

### Phạm vi và quyết định

- Hero trang chủ dùng key visual mới: tranh **chạm nổi sơn mài** 1536×1024,
  cảnh núi–sông–sen–vân mây khảm đồng; nửa phải chừa giấy kem sáng để chữ đọc
  rõ. Không thay copy, CTA, proof hoặc ảnh sản phẩm hiện hữu.
- Ảnh được tạo mới bằng Image Generation (không lấy từ repo/thư viện bên ngoài)
  với palette `#FFFBEB`, `#FFEF9F`, `#46843E`, dải đồng `#5E3215 → #B77A2F →
  #E4B45E`, vàng `#FFD45A`, son `#C84040`, điểm sen `#E1407C`. Prompt cấm chữ,
  logo, người, box/bài và màu neon/xanh tím; file nguồn lưu ở
  `public/assets/img/hero-relief-source.webp`.
- Các bản được trang thật nạp là `hero-relief-{800,1200,1536}.avif`, kèm WebP
  fallback. `templates/home.html` và preload trong `scripts/build.js` dùng cùng
  `srcset` để không tải đôi LCP. Hero cũ không bị ghi đè.
- `public/assets/js/ui/relief-hero.js` dùng Pointer Events +
  `requestAnimationFrame`: chỉ đổi bốn CSS custom property. Lớp tranh nền và
  `.hero-carousel` giữ transform entrance sẵn có; thị sai nằm ở
  `.hero-relief` và `.hero-product-float` để hai animation không tranh quyền.
  Touch giữ `pan-y`, không `preventDefault`, không WebGL và không listener rò
  qua Swup.
- `public/assets/css/main.css` thêm ánh chiếu xiên, viền đồng và gold glint rất
  chậm; glint chỉ chạy khi thiết bị có hover. `prefers-reduced-motion` tắt
  animation/transform nhưng để nguyên poster tĩnh. `page-transition.css` chỉ
  fade-in lớp relief, không sở hữu transform của lớp này.

### Tệp và kiểm thử chống giẫm chân

- `templates/home.html`, `scripts/build.js`, `tools/scripts/build-images.mjs`:
  asset, markup và preload Hero mới.
- `public/assets/js/page/registry.js`: Home nạp thêm `relief-hero` theo lifecycle
  chuẩn; `public/assets/js/ui/relief-hero.js` là module mới.
- `tests/critical-css.test.mjs`, `tests/hero-carousel.test.mjs`,
  `tests/hero-embla-prototype.test.mjs`, `tests/lacquer-background.test.mjs`,
  `tests/performance-effects.test.mjs`, `tests/story-dialog-audit.test.mjs`:
  đã đổi assertion cũ sang asset/markup mới; vẫn khóa việc không nạp carousel
  cũ, không tạo dialog và không ghi đè transform entrance.

### QA trên branch

```text
npm run build:local   PASS — 78 trang lá, 2 bài tin và 95 URL
npm test              PASS — 32/32 tệp test
npm run check:types   PASS
git diff --check      PASS
node --check relief-hero.js  PASS
```

- Preview desktop: Hero giữ khoảng giấy sáng bên phải cho headline/panel; khi
  rê chuột, `--relief-x` đổi `0px → -6.70px` và `.hero-product-float` nhận
  `matrix3d(...)`; console không có warning/error.
- Preview mobile: `clientWidth = scrollWidth = 375px` (không overflow ngang),
  hero cao `1047px`, khung sản phẩm rộng `269px`; poster vẫn đọc tốt trước khi
  tới phần sản phẩm.
- Lệnh tối ưu ảnh ban đầu đã làm mới vài asset ngoài scope; chúng đã được trả
  về chính xác bản `HEAD` trước khi QA. Diff cuối chỉ còn Hero relief và test
  liên quan.

## Nhật ký phối hợp · Tilt lá bài, Border Beam giá dự kiến và reveal Huyền sử ngày 29/08/2026

Branch: `feat/subtle-card-beam-reveal`, tách từ `origin/main` tại commit
`5180ba7`. Chủ dự án là người review/merge; nhánh này **không tự deploy**.

### Phạm vi và quyết định

- `public/assets/js/ui/card-tilt.js` dùng Pointer Events + `requestAnimationFrame`,
  giới hạn nghiêng tối đa 4° cho `.tarot-card`, `.card-art` và `.hd-card`.
  MutationObserver bắt các lá được tạo động khi xáo trải bài và dọn listener khi
  thẻ bị thay; thao tác chạm vẫn giữ nguyên click/lật bài. `prefers-reduced-motion`
  tắt tilt và được tháo sạch khi Swup rời trang.
- `public/assets/css/main.css` giữ transform lật 3D của trải bài, thêm lớp tilt
  riêng và đường lui giảm chuyển động. Border Beam `hd-border-beam` chỉ bao
  quanh thẻ giá dự kiến trong `/cua-hang/`; không thêm thanh toán, CTA đặt cọc
  hay thay copy “không đặt cọc, không thu tiền trước”.
- `public/assets/js/ui/huyen-su-reveal.js` nạp `motion-mini.mjs`, mở từng
  section `.v2-prose` khi đi vào viewport, có fallback hiện tĩnh nếu Motion/
  IntersectionObserver lỗi và dọn animation khi Swup thay DOM. Cả trang mục lục
  và 34 trang toàn văn đều mang `data-page="huyen-su"`.
- `public/assets/js/page/registry.js` là điểm nạp duy nhất; `scripts/build.js`
  thêm `data-price-panel` vào thẻ giá và chuẩn hóa `transition-page` cho trang
  toàn văn chương. `tests/motion-enhancements.test.mjs` khóa wiring, giới hạn
  tilt, reduced-motion, giá 690.000đ và các route Huyền sử.

### QA cục bộ

```text
npm run build:local   PASS — 78 trang lá, 2 bài tin và 95 URL
npm test              PASS — 32/32 tệp test
npm run check:types   PASS
git diff --check      PASS
node --check (3 module) PASS
```

## Nhật ký phối hợp · Sổ tay Tarot Việt hóa ngày 29/08/2026

Branch: `feat/huong-dan-tarot-viet-hoa`, tách từ `origin/main` tại commit
`20636bf`. Chủ dự án là người review/merge; nhánh không tự deploy.

## Nhật ký phối hợp · Fontasia vàng cho Hero subpage ngày 29/08/2026

Branch: `feat/subpage-fontasia-yellow`, tách trực tiếp từ `origin/main` tại
`8c16e6a` (đã gồm PR #58 và các thay đổi trên main). Chủ dự án là người
review/merge; branch này chưa merge và chưa deploy.

### Phạm vi và quyết định

- Chỉ áp dụng cho các section `.page-hero` trên route trong: headline `h1` và
  subheadline `p:not(.eyebrow)` dùng `Fontasia VH`, `font-style: normal`,
  `font-weight: 400`; Hero trang chủ và toàn bộ copy/CTA không đổi.
- Giữ nguyên màu vàng hiện tại qua `var(--hero-lemon)` (`#FEDB44`), cỡ chữ,
  line-height, bóng nâu và responsive breakpoint đã chốt; không thêm stroke,
  italic hoặc synthetic bold.
- `critical-inner.css` và block tương ứng trong `main.css` được đồng bộ để
  tránh CLS/FOUT. Route trong preload thêm `fontasia-vh.woff2`; vẫn preload
  `dfvn-tan-harmoni.woff2` vì card detail dùng Harmoni ở H1.
- `templates/_layout.html` cập nhật ghi chú preload; không đổi template nội
  dung. Test critical CSS khóa Fontasia + Regular 400 + vàng ở cả hai stylesheet
  và xác nhận preload Fontasia trên route lá.

### QA và bằng chứng

- `npm run build:local`: PASS — 78 trang lá, 2 bài tin, 95 URL.
- `npm test`: PASS — 31/31 tệp test; `npm run check:types`: PASS;
  `git diff --check`: PASS.
- `/huyen-su/` 1440×900: Fontasia VH, màu `rgb(254, 219, 68)`, headline
  `117px`, subheadline `18px`, ảnh `huyen-su-1536.avif`, overflow ngang `0`.
- `/huyen-su/` 390×844: Fontasia VH, headline `63.7px`, subheadline `18px`,
  không cắt/tràn, overflow ngang `0`; console desktop/mobile không có lỗi hoặc
  cảnh báo.
- Ảnh QA: `qa/subpage-fontasia-1440x900.png` và
  `qa/subpage-fontasia-390x844.png`; chi tiết quyết định nằm trong
  `design-qa.md`.

## Nhật ký phối hợp · Tăng label và subheadline Hero subpage ngày 29/08/2026

Branch: `feat/subpage-label-subheadline-scale`, tách từ `origin/main` tại
`1433f94` (merge PR #61 đã deploy production). Chủ dự án là người review/merge;
branch này chưa merge và chưa deploy.

### Phạm vi và quyết định

- Giữ nguyên headline Fontasia, màu vàng `#FEDB44`, copy, bóng, layout và Hero
  trang chủ. Chỉ chỉnh các selector page hero trên route trong.
- Label `.page-hero > .eyebrow` tách khỏi vàng bằng `var(--hero-label)`
  (`#8B7355`), dùng `var(--hero-ui)` (Inter) và tăng từ `12px` lên `15.6px`
  (~30%).
- Subheadline `.page-hero > p:not(.eyebrow)` vẫn Fontasia Regular 400, vàng
  `var(--hero-lemon)`, tăng từ `18px` lên `23.4px` (~30%) ở desktop/mobile.
- Critical CSS và main stylesheet đồng bộ; test khóa màu/font/cỡ mới ở cả hai
  nguồn để tránh lệch cascade hoặc FOUT.

### QA và bằng chứng

- `npm run build:local`: PASS — 78 trang lá, 2 bài tin, 95 URL.
- `npm test`: PASS — 31/31; `npm run check:types`: PASS; `git diff --check`:
  PASS.
- `/huyen-su/` 1440×900: label `15.6px` `rgb(139, 115, 85)`, subheadline
  `23.4px`, headline `117px`, overflow ngang `0`, Fontasia loaded.
- `/huyen-su/` 390×844: label `15.6px`, subheadline `23.4px`, Hero cao
  `528.3px`, overflow ngang `0`, không cắt/tràn; console không có lỗi/cảnh báo.
- Ảnh QA: `qa/subpage-label-subheadline-1440x900.png` và
  `qa/subpage-label-subheadline-390x844.png`.

### Nguồn và nguyên tắc biên tập

- `TEVADA_Tarot_Guidebook_VI_1.docx` chỉ được dùng để kiểm kê framework: nhập
  môn, đặt câu hỏi, xáo bài, trải bài và 78 lá. Không chép lại lời văn, quảng cáo,
  liên kết hay tuyên bố thương hiệu TEVADA.
- Giọng Hường Đông được giữ nhất quán: bình tĩnh, gần gũi với trải nghiệm Việt,
  quan sát trước diễn giải, Tarot là công cụ soi chiếu chứ không phán tương lai.
- Các hướng dẫn đều phân biệt dữ kiện với diễn giải và trả quyền quyết định về
  người đọc. Không dùng Tarot thay tư vấn y tế, pháp lý hoặc tài chính.
- Không ghi đè dữ liệu 78 lá: repo đã có nghĩa RWS, lớp liên tưởng Việt, trường
  nguồn và nội dung chuyên đề sâu hơn guidebook. Thay vào đó, thư viện và mọi
  trang chi tiết được nối về phương pháp đọc chung.

### Kiến trúc nội dung

- `/huong-dan-tarot/`: trang trụ cột và bài thực hành mười phút với một lá.
- `/huong-dan-tarot/dat-cau-hoi/`: bốn tiêu chí, bảng gọt câu hỏi và công thức.
- `/huong-dan-tarot/xao-bai/`: ba cách xáo, quy trình rút, cách dùng lá ngược.
- `/huong-dan-tarot/doc-la-bai/`: phương pháp năm lớp, ví dụ Mai An Tiêm và cách
  nối ba lá.
- `/tarot-la-gi/`, `/trai-bai/`, `/la-bai/` và 78 trang `/la-bai/*` có đường dẫn
  học tiếp theo ngữ cảnh. Bốn route hướng dẫn đã vào sitemap và có breadcrumb.
- Ba route `/trai-bai/co-khong/`, `/trai-bai/ba-la/`, `/trai-bai/tinh-yeu/` vẫn
  `noindex,follow`: không tự thay quyết định sản phẩm đang chờ duyệt Lớp 3.

### Xác minh

```text
npm run build:local   PASS — 78 trang lá, 2 bài tin, 95 URL
npm test              PASS — 30/30 tệp test
npm run check:types   PASS
git diff --check      PASS
```

### Bổ sung lớp soi chiếu và trải bài chiều sâu

Theo yêu cầu tiếp theo, nội dung được mở rộng bằng một khung đọc biểu tượng và
tự phản tư, nhưng website không nêu tên nguồn lý thuyết, không dùng thuật ngữ
để tạo uy quyền học thuật và không tự nhận là phương pháp trị liệu.

- `content/reflection-lenses.mjs` là nguồn nội dung tĩnh: 22 mẫu hình riêng cho
  Ẩn Chính; 56 Ẩn Phụ được tạo từ bốn địa hạt Tre/Sen/Dâu Tằm/Lúa kết hợp đủ 14
  chặng Át–Mười và bốn lá Hoàng gia.
- Mỗi trang lá có bốn phần mới: mẫu hình đang hiện ra, phần dễ bị bỏ quên, câu
  hỏi đối thoại với hình ảnh và một bước tích hợp vào đời sống.
- `/trai-bai/` có ba khung mới: Điều đang thể hiện; Bốn tiếng nói bên trong;
  Bước qua ngưỡng cửa. Phần thực hành yêu cầu xem câu trả lời tưởng tượng như
  giả thuyết và kiểm lại bằng dữ kiện, giá trị, hậu quả.
- Ranh giới được in ngay trong nội dung: không kết luận tính cách, không chẩn
  đoán tâm lý, không xác minh ý định người khác và không thay thế hỗ trợ chuyên
  môn. Khi người đọc bị choáng ngợp, hướng dẫn yêu cầu dừng bài.
- Test hồi quy kiểm đủ 78/78 trang, đủ 22 + 4×14 lớp nội dung, và quét toàn bộ
  HTML xuất bản để bảo đảm tên bị cấm không xuất hiện.

```text
npm run build:local   PASS — 78 trang lá, 2 bài tin, 95 URL
npm test              PASS — 31/31 tệp test
npm run check:types   PASS
git diff --check      PASS
```

### Hotfix build production · thiếu `rankVi` trên Firestore

- Lượt Actions `33249421317` dừng an toàn ở bước build, trước test/deploy.
- Nguyên nhân: seed có `rankVi`, nhưng tài liệu Ẩn Phụ trên Firestore chỉ bảo
  đảm slug chuẩn; `ace-of-wands` vì thế chưa ánh xạ được về cấp Át.
- `reflection-lenses.mjs` nay ưu tiên `rankVi` nếu có và lùi về phần đầu slug
  (`ace`, `two`… `king`) nếu thiếu. Không sửa dữ liệu Firestore.
- Test mới xóa `rankVi` khỏi cả 56 lá rồi xác nhận mọi lá vẫn sinh nội dung.

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

## Nhật ký phối hợp · Hero Fontasia nâu ấm ngày 29/08/2026

Branch: `feat/hero-warm-brown-typography`, tách từ `origin/main` sau khi PR #57
đã merge. Chủ dự án là người review/merge; nhánh này không tự deploy.

### Thay đổi đã khóa

1. Giữ nguyên nội dung, Fontasia Regular 400 và cỡ headline hiện tại.
2. Headline đổi toàn bộ sang nâu ấm `#3D2B1A`; bỏ stroke champagne/coral để
   cụm “câu chuyện Việt” kế thừa cùng màu.
3. Subheadline giữ Fontasia và màu `#3D2B1A`. Sau phản hồi trên preview PR #58,
   chỉ dòng này tăng thêm đúng 30% từ `clamp(20.8px, 1.625vw, 23.4px)` thành
   `clamp(27.04px, 2.1125vw, 30.42px)`; headline không tăng thêm.
4. Eyebrow, CTA, stats, ảnh sản phẩm, overlay và lưới 40/60 không đổi.
5. Critical CSS và main stylesheet được đồng bộ; test khóa màu, font, cỡ chữ và
   trạng thái không stroke.

### QA

- 1440×900: headline giữ nguyên `95.04px`, subheadline `30.42px`; Hero cao
  `824px`, panel kết thúc ở `766.84px`, overflow ngang `0`.
- 390×844: headline giữ nguyên `54.6px`, subheadline `27.04px`; panel kết thúc
  ở `758.2px`, CTA vẫn nằm trước ảnh và overflow ngang `0`.
- Console không có lỗi/cảnh báo. Ảnh QA nằm tại
  `qa/hero-warm-brown-1440x900.png` và `qa/hero-warm-brown-390x844.png`.

```text
npm run build:local   PASS — 86 URL
npm run check:types   PASS
npm test              PASS — 29/29 tệp test
git diff --check      PASS
```

## Nhật ký phối hợp · Hero Watercolor Fontasia ngày 29/08/2026

Branch: `feat/hero-watercolor-fontasia-layout`. Đây là PR mới độc lập; PR #56
giữ nguyên. Chủ dự án là người merge và triển khai production.

### Phạm vi đã chốt

1. Giữ nguyên toàn bộ copy Hero. “THÔNG MINH” chỉ là ví dụ tham chiếu; HTML chỉ
   bọc đúng cụm “câu chuyện Việt” để nhận stroke coral.
2. Desktop dùng lưới 40/60: ảnh sản phẩm trong card kính ở trái; headline và
   panel mô tả/CTA/stats ở phải. Mobile giữ DOM copy trước, ảnh sau.
3. Headline/subheadline dùng `Fontasia VH` Regular 400, không synthetic
   bold/italic. Headline có thân `#FAF8D0`, stroke `#C9A96E`; cụm nhấn dùng
   `#C84040`. Subheadline chỉ dùng nâu ấm `#3D2B1A`, không gradient/stroke/bóng.
4. Hero labels/UI dùng Inter Regular tự host. CTA chính coral `#C84040`, CTA phụ
   vàng `#F5C842`. Phần còn lại của website tiếp tục dùng hệ font cũ.
5. Watercolor background giữ asset hiện có và nhận ba lớp phủ: radial bảo vệ
   nội dung, gradient dọc đậm về đáy, gradient ngang đậm về phải.

### Code và ràng buộc chống giẫm chân

- `templates/home.html`: thêm `.hero-headline-accent` và `.hero-panel`; không đổi
  chuỗi nội dung, href hoặc số liệu.
- `critical.css` và `main.css`: đồng bộ Fontasia, 40/60, frosted fallback,
  overlay, CTA và responsive. Cascade lock cuối `main.css` là cần thiết vì file
  vẫn chứa các lớp Hero lịch sử được nối theo thứ tự cũ.
- `fonts.css` + `inter-400*.woff2`: Inter 400 Vietnamese/Latin được tải từ Google
  Fonts chính thức bằng `tools/scripts/fetch-fonts.mjs`.
- `scripts/build.js`: Home preload Fontasia + Inter; route trong loại các font
  và luật Home không dùng khỏi critical CSS để giữ dưới 20 KB.
- Tests khóa copy, span coral, Fontasia/Inter, token màu, lưới 40/60, frosted
  fallback, preload và ngân sách critical.

### QA và công cụ thiết kế

- 1440×900: Hero cao 824px dưới header 76px; cột 537.6/806.4px; không overflow;
  console sạch.
- 768×1024 và 390×844: copy trước ảnh, CTA không tràn, ảnh giữ tỷ lệ.
- Ảnh trước/sau và responsive nằm trong `qa/`; báo cáo ở `design-qa.md`.
- Figma file đã tạo: `https://www.figma.com/design/UXMAyAaKaNaEo2fi174zcB`, nhưng
  Starter plan chặn MCP capture. Canva fallback cũng bị monthly AI limit. Không
  có capture script tạm thời nào còn trong source.

```text
npm run build:local   PASS — 86 URL
npm run check:types   PASS
npm test              PASS — 29/29 tệp test
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

## Nhật ký phối hợp · landing trang chủ và motion v3 ngày 27/08/2026

Branch: `feat/landing-motion-polish` — tách từ `origin/main` tại merge commit
`274a8be` của PR #50. Chủ dự án tiếp tục là người merge; branch không tự triển
khai production.

### Năm yêu cầu và cách triển khai

1. **Entrance mượt hơn (Hero trang chủ và Hero trang trong).**
   `page-transition.css` lên v3. Ba thay đổi, không đổi kiến trúc: easing sang
   expo-out `cubic-bezier(.16, 1, .3, 1)`; quãng đường đi vào rút còn khoảng một
   nửa (`--headline-x` từ `clamp(-120px, -14vw, -52px)` xuống
   `clamp(-64px, -7vw, -28px)`, các trục khác tương tự); thời lượng mỗi lớp kéo
   dài ~35% và các lớp chồng lấn nhau thay vì nối đuôi. Mốc opacity đầy hạ từ
   24% xuống 18% để chữ đọc được sớm hơn. `--page-in` lên `1900ms` — Swup chỉ
   giữ `.is-rendering` trong khoảng đó, lớp nào chạy quá sẽ bị snap giữa chừng.
   Hàng số liệu `.proof` của trang chủ nay đi cùng đợt CTA thay vì hiện tức thì.

2. **Fade khi cuộn tới các mục nội dung.**
   Tệp mới `public/assets/css/scroll-fade.css`, nạp theo đường chuẩn trong
   `_layout.html`. Dùng scroll-driven animation thuần CSS
   (`animation-timeline: view()`), **không** IntersectionObserver và không thêm
   một dòng JS nào — ràng buộc "không entrance chạy theo cú cuộn ở runtime" của
   `tests/entrance-reveal.test.mjs` vẫn nguyên. Toàn bộ khối bọc trong
   `@supports (animation-timeline: view())` nên trình duyệt chưa hỗ trợ chỉ đơn
   giản không thấy nó và nội dung hiện đầy đủ. `animation-range: entry 2%
   entry 42%` — dừng ở 42% để mục cuối trang, thứ không bao giờ cuộn hết được,
   không đứng lại ở nửa chừng độ mờ.

3. **Hero trang chủ: tranh sang trái, chữ sang phải, một bức tĩnh.**
   Vòng quay năm lá đã được gỡ: không còn timer, không còn `.hero-dots`, không
   còn `hero-tilt.js` (nghiêng theo chuột), và dòng eyebrow nay là chữ tĩnh.
   `hero-carousel.js` rút lại còn đúng một việc — bấm vào lá thì mở bảng kể
   chuyện. Lớp `.hero-carousel` và hook `data-hero-carousel` **giữ nguyên tên**
   vì critical CSS, `main.css` và bố cục cột đều neo vào chúng.

   Bức được chọn: **Mẫu Liễu Hạnh (XVII · The Star)**. Đây là bức duy nhất trong
   bốn bức có đủ ba lớp chiều sâu — sen tiền cảnh, dáng người trung cảnh, cổng
   đền hậu cảnh — nên đứng một mình vẫn không trống; và chòm sao trên đầu bà
   đúng là lá mà dòng eyebrow của Hero vẫn luôn gọi tên. Chọn cố định trong
   `build.js` (`heroImmortal`), không lấy phần tử đầu của `immortals`: thứ tự
   mảng đó là thứ tự La Mã I–IV của mục `#tu-bat-tu`.

   Ba vị còn lại không mất khỏi trang — mục `#tu-bat-tu` vẫn dẫn sang trang lá
   của từng vị, và toàn văn truyện luôn nằm ở `/la-bai/<slug>/`.

4. **Tranh Hero trang trong rõ thêm 30% toàn tranh.**
   Chỉ đổi opacity đỉnh: desktop `.40 → .52`, tablet `.28 → .36`,
   mobile `.16 → .21`. Alpha của mask **giữ nguyên** — chính chỗ đó khiến mọi
   điểm ảnh của bức, cả vùng dưới copy lẫn vùng trống, cùng nhân 1,3. Kéo cả
   mask lên thì phía phải sáng thêm nhiều hơn phía trái và bức mất cân.
   Vùng chữ desktop nay ở opacity hiệu dụng `.182` (`.52 × .35`); tương phản
   Subheadline còn **5,12** trên ngưỡng AA 4,5 — đây là trần thật của đợt này.
   `.card-detail`, header bài viết và Hero trang chủ không đổi.

5. **Khẩu hiệu là trọng tâm trang chủ.**
   Cỡ chữ +20% ở màn hình rộng: `clamp(62px, 7vw, 96px)` →
   `clamp(74px, 8.4vw, 115px)`, `font-weight` 400 → 700. Bóng chữ đổi từ một lớp
   `.55` — ở cỡ mới nó đọc ra thành vệt xám — sang hai lớp nhẹ (`18%` sát chân
   chữ, `22%` toả rộng). `.hero-copy` bỏ `max-width: 700px` ở hai cột để hai vế
   của khẩu hiệu mỗi vế nằm trọn một dòng.

### Hai chỗ đo thật mới lộ ra, phải giữ nguyên

- **Breakpoint hai cột là 1101px, không phải 901px.** Khối
  `@media (max-width: 1100px) { .hero { grid-template-columns: 1fr } }` nằm ở
  cuối `main.css` mới là nơi thật sự hạ Hero xuống một cột. Đặt rule hoán vị cột
  ở 901px thì trong dải 901–1100 hai bên đánh nhau: cột về `1fr` trong khi
  `.hero-copy` vẫn xin cột 2, browser sinh thêm một cột ẩn và bóp `.hero-stage`
  xuống còn ~180px.
- **Phải ghi `grid-area`, không phải `grid-column`.** Auto-placement chỉ đi tới,
  không lùi: đặt `.hero-copy` vào cột 2 rồi mới xin cột 1 cho `.hero-stage` thì
  con trỏ đã qua cột 1 của hàng 1, và stage rơi xuống hàng 2 — Hero cao gấp đôi.

Kèm theo: `.hero-overlay` đổi từ `90deg` sang `270deg` ở hai cột. Lớp phủ giấy
phải đục nhất ở đúng chỗ có chữ; cột chữ đã sang phải nên giữ `90deg` thì khẩu
hiệu ngồi lên đúng phần cảnh còn rõ nhất, còn khung tranh bên trái thì nằm trên
một mảng giấy trắng. Dưới 1101px lớp phủ chạy theo trục dọc, khớp với bố cục một
cột.

### Giới hạn vật lý ở màn hình hẹp — đã cân nhắc, không phải bỏ sót

Ở `≤900px`, **trần** cỡ chữ vẫn tăng đủ 20% (`70px → 84px`) nhưng hệ số vw giữ
nguyên `15vw`. Đo thật trên Fontasia VH trong khung 358px của máy 390px: 60px là
cỡ lớn nhất mà hai vế của khẩu hiệu còn mỗi vế một dòng; 61px thành ba dòng,
65px thành bốn dòng. Nói thẳng: dưới ~560px bề ngang màn hình mới là thứ quyết
định, không phải con số 20%. Trần 84px có tác dụng từ 560px trở lên. Sàn hạ từ
`54px` xuống `48px` để máy 320px cũng giữ được hai dòng — bản trước ép 54px ở đó
và câu đã vỡ sẵn. Nếu chủ dự án muốn đúng 20% ở mọi bề ngang và chấp nhận khẩu
hiệu vỡ bốn dòng trên điện thoại, đổi đúng một chỗ: `15vw → 18vw`.

### Xác minh đã chạy

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 135/135
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ (headless, đo qua CDP để cuộn được thật):

- `/` ở 1440 / 1200: hai cột, tranh cột 1 (x=16), chữ cột 2; khẩu hiệu đúng hai
  dòng ở cỡ `115px` / `100.8px`; CTA và hàng `.proof` nằm trên nếp gấp; không
  tràn ngang.
- `/` ở 1000 / 768: một cột, thứ tự đọc là khẩu hiệu → copy → CTA → tranh.
- `/` ở 390 / 360 / 320: khẩu hiệu hai dòng ở `58.5px` / `54px` / `48px`.
- Fade khi cuộn: ở `scrollY≈1400` mục `#cau-chuyen` đang mờ dần; ở `≈1700` đã
  sáng hẳn; ở đáy trang `.waitlist` opacity `1` — không mục nào kẹt nửa chừng.
- Entrance: chụp khung ở 350 / 600 / 850 / 1150 / 1600ms trên `/` và
  450 / 700 / 950 / 1300 / 1800ms trên `/huyen-su/`; các lớp chồng lấn liên tục,
  không có mốc nào phần tử đứng lại rồi đi tiếp.
- `/huyen-su/`, `/cua-hang/` 1440×900: tranh Hero rõ hơn hẳn ở phía phải,
  Headline và Subheadline vẫn tách bạch.
- `/la-bai/the-star/` 1440×900: `.card-detail` không đổi — chứng minh mức mới
  không tràn sang Hero chi tiết.

### Đợt bổ sung cùng branch · tranh Hero trang trong lên .82

Chủ dự án duyệt cả năm mục ở trên, kèm một yêu cầu tiếp: tranh sơn mài ở Hero
trang trong phải rõ hơn nữa. Đây là đợt thứ ba của cùng một con số:
`.40` (PR #50) → `.52` → **`.82`**.

Từ mức này trở đi opacity không còn kéo được một mình. Ở mask cũ (`.35`), `.82`
đẩy vùng chữ lên hiệu dụng `.287` và Subheadline rơi khỏi AA. Nên đợt này đổi
bốn thứ **như một gói** — sửa một mà quên ba thứ kia là mở lại đúng lỗ đã bịt:

1. Đỉnh `.52 → .82` (tablet `.36 → .56`, mobile `.21 → .33`). Vùng trống bên
   phải sáng thêm 58%.
2. Alpha mask vùng copy `.35 → .28` (tablet `.40 → .32`, mobile `.50 → .40`),
   nên vùng chữ chỉ lên `.23` (+26%) chứ không lên `.287`.
3. Chữ trong Hero đậm lại, chỉ trong phạm vi `.page-hero.lacquer-hero`:
   `--brown: #5E3F19` và `--ink-soft: #463122`.
4. Chữ bị bó lại đúng bằng vùng phẳng của mask: `52%` ở desktop, `56%` ở tablet,
   bỏ bó ở mobile (nơi lớp bảo vệ là radial `::after`, không phải mask ngang).

**Lỗ hổng có sẵn từ trước, tới `.82` mới đủ lộ.** `.page-hero > h1, > p` rộng
tới `900px`, tức ở màn 1024px chữ chạy tới ~91% bề ngang Hero — chỗ mask đã mở
gần hết. Phép kiểm AA thì lại chỉ canh alpha THẤP NHẤT của mask, nên nó mô tả
đúng đầu dòng và bỏ qua cuối dòng. Đo trên `/trai-bai/` 1024px: cuối dòng
"…từ một góc khác" ngồi trên tranh ở opacity hiệu dụng ~`.5` trong khi phép kiểm
canh `.23`. Mục 4 ở trên bịt lỗ đó, và `tests/lacquer-background.test.mjs` nay
canh **cặp số** — bó chiều rộng chữ phải bằng mốc kết thúc vùng phẳng của mask ở
từng breakpoint. Đã thử làm lệch (52% → 70%) để chắc phép kiểm thật sự bắt.

**Eyebrow trước đợt này đã dưới chuẩn mà không ai bắt.** `--brown` gốc `#8B6339`
chỉ đạt 3,03 ngay ở mức `.52` (ngưỡng 4,5). Test AA cũ chỉ canh Headline,
Subheadline và CTA. Nay canh cả ba màu chữ đang thật sự dùng trong Hero.

Tương phản ở trường hợp xấu nhất (pixel tranh đen tuyệt đối, hiệu dụng `.23`):
Headline **8,27** · Subheadline **6,09** · Eyebrow **4,76** · CTA **11,68**.

Hero trang chủ **không đổi** trong đợt này — chủ dự án chọn giữ nguyên.

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 135/135
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ: `/huyen-su/` và `/tarot-la-gi/` 1440×900, `/trai-bai/` 1024×900,
`/huyen-su/` 390×844 — tranh nổi rõ ở phía phải, Headline/Subheadline/Eyebrow
vẫn tách bạch, và ở 1024px dòng subheadline nay kết thúc trước khi chạm tranh.

## Nhật ký phối hợp · Headline vàng chanh và tranh Hero 1.0 ngày 27/08/2026

Branch: `feat/hero-headline-lemon-entrance` — tách từ `origin/main` tại merge
commit `1e8f67b` của PR #51. Chủ dự án tiếp tục là người merge; branch không tự
triển khai production.

### Phạm vi đã chốt

1. Headline Hero trang chủ và mọi `.page-hero` trang trong lớn hơn production
   trước PR #51 đúng `30%` ở desktop, tablet và mobile.
2. Headline và Subheadline Hero của cả trang chủ/trang trong dùng vàng chanh
   sáng `#F6FF4A`, kèm text-shadow nâu kín bốn phía và một bóng tỏa.
3. Ảnh Hero trang chủ phải entrance khi tải trang.
4. Tranh `.page-hero` trang trong đạt opacity đỉnh `1`, rõ như ảnh Hero trang
   chủ; vùng dưới copy tiếp tục được mask bảo vệ.
5. Không đổi cỡ Subheadline, CTA, nội dung, cấu trúc layout hoặc Hero detail.

### Xử lý xung đột với PR #51

- PR #51 đã merge nhưng chưa deploy tại lúc yêu cầu này bắt đầu. Nó đã tăng
  Headline trang chủ `20%` và đã nối cả `.hero-bg` lẫn `.hero-carousel` vào
  `hero-art-in`. Không tạo animation thứ hai; giữ nguyên code đó và test lại.
- Chủ dự án đang nhìn production trước PR #51, nên “đúng 30%” lấy các con số
  production làm gốc, không nhân thêm `1.3` lên mức thử `+20%`:
  - Home rộng: `62 / 7vw / 96` → `80.6 / 9.1vw / 124.8`.
  - Home hẹp: `54 / 15vw / 70` → `70.2 / 19.5vw / 91`.
  - Trang trong rộng: `50 / 7vw / 90` → `65 / 9.1vw / 117`.
  - Trang trong `≤620px`: `49` → `63.7px`.
- Ở 390/320px, khẩu hiệu trang chủ thành bốn dòng. Đây là hệ quả trực tiếp của
  yêu cầu giữ đúng `30%` trên mobile đã được chủ dự án xác nhận; không bóp cỡ
  hoặc đổi câu để che đi.

### Tranh trang trong và khả năng đọc

- Desktop/tablet/mobile đều có `--hero-art-opacity: 1` ở vùng mask mở.
- Alpha vùng copy hạ tương ứng để không tăng độ đậm nền dưới chữ:
  - Desktop `.82 × .28 ≈ .23` → `1 × .23 = .23`.
  - Tablet `.56 × .32 ≈ .18` → `1 × .18 = .18`.
  - Mobile `.33 × .40 ≈ .13` → `1 × .13 = .13`.
- Headline/Subheadline vàng chanh dùng biên bóng `#2B1B12` ở opacity
  `92–94%`. Màu vàng tách khỏi biên nâu, biên nâu tách khỏi nền tranh; không
  thêm tấm kem đục phủ toàn Hero.
- `.card-detail` và header bài viết giữ opacity route cũ, mask `none`.

### Xác minh trên branch

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ, sau entrance:

- Home 1440×900: Headline `124.8px`, màu `rgb(246,255,74)`; `.hero-bg` và
  `.hero-carousel` cùng báo animation `hero-art-in`; overflow ngang `0`.
- Home 390×844: Headline `76.05px`; Home 320×740: `70.2px`; màu/bóng đúng,
  CTA vẫn hiển thị, overflow ngang `0`.
- `/huyen-su/` 1440×900: Headline `117px`, artwork opacity `1`, mask `.23 → 1`,
  AVIF 1536, `multiply`, overflow ngang `0`.
- `/huyen-su/` 900×900: Headline `81.9px`, artwork opacity `1`, mask `.18 → 1`,
  AVIF 1024, overflow ngang `0`.
- `/huyen-su/` 390×844: Headline `63.7px`, artwork opacity `1`, mask `.13 → 1`,
  AVIF 1024, overflow ngang `0`.
- `/la-bai/the-star/`: `.card-detail` giữ opacity `.135`, mask `none`.

## Nhật ký phối hợp · Tranh Hero trang con nguyên khung và màu #FEDB44 ngày 27/08/2026

Branch: `fix/subpage-art-full-fedb44` — tách từ `origin/main` tại merge commit
`d78a4eb` của PR #52. Chủ dự án tiếp tục là người merge; branch không tự triển
khai production.

### Phạm vi đã chốt

1. Tranh trong `.page-hero.lacquer-hero` của 7 nhóm route phải đạt opacity cuối
   `1` trên **toàn khung**, không chỉ ở vùng trống bên phải.
2. Giữ `mix-blend-mode: multiply` và entrance `hero-art-in` đi thẳng từ
   `opacity: 0` tới `--hero-art-opacity: 1`.
3. Bỏ mask cũ đang hạ alpha vùng copy xuống `23%` desktop, `18%` tablet và
   `13%` mobile.
4. Bỏ riêng gradient kem `::after` của `.page-hero`; Layer 1 màu phía dưới tranh
   vẫn còn. `.card-detail` và header bài viết giữ nguyên opacity/gradient riêng.
5. Headline và Subheadline Hero trang chủ/trang trong dùng đúng `#FEDB44`.
   Bóng chữ, kích thước +30%, CTA, copy và layout không đổi.

### Thay đổi code và chốt chống giẫm chân

- `public/assets/css/lacquer-art.css`: chỉ `.page-hero.lacquer-hero` override
  `--hero-art-opacity: 1`, `mask-image: none` và `background: none` cho `::after`.
  Các override opacity/mask trùng ở breakpoint được gỡ; selector `.page-hero`
  có specificity cao hơn token route nên một khai báo áp đồng đều mọi viewport.
- `public/assets/css/main.css` và `public/assets/css/critical.css`: đổi token
  `--hero-lemon` từ `#F6FF4A` sang `#FEDB44`, tránh nháy màu giữa critical CSS
  và stylesheet đầy đủ.
- `tests/lacquer-background.test.mjs`: canh opacity nguyên khung, mask `none`,
  gradient kem `none`, `multiply`/entrance và độ tách của `#FEDB44` với biên bóng.
- `tests/hero-carousel.test.mjs`: khóa token màu chính xác `#FEDB44`; các phép
  canh kích thước +30% và bóng chữ cũ được giữ nguyên.

### Xác minh trên branch

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ sau entrance:

- Cả 7 route `/tarot-la-gi/`, `/la-bai/`, `/trai-bai/`, `/huyen-su/`,
  `/healing/`, `/tin-tuc/`, `/cua-hang/` ở 1440×900: artwork `opacity: 1`,
  `mask: none`, `mix-blend-mode: multiply`, `heroWash: none`, animation
  `hero-art-in`, ảnh AVIF 1536 đã tải, overflow ngang `0`.
- `/huyen-su/` ở 900×900 và 390×844: cùng `opacity: 1`, `mask: none`,
  `heroWash: none`, animation còn hoạt động, ảnh AVIF 1024 đã tải, overflow `0`.
- Headline/Subheadline có mặt trên các viewport đã đo đều là
  `rgb(254, 219, 68)` = `#FEDB44`; bóng chữ không đổi.
- `/la-bai/the-star/` đối chứng: `.card-detail` vẫn opacity `.135` và giữ
  gradient bảo vệ chữ riêng, đúng phạm vi không thay Hero chi tiết.
- Ảnh QA ngoài repository:
  `/home/asus/Documents/Codex/huongdong-full-art-desktop-cdp.png` và
  `/home/asus/Documents/Codex/huongdong-full-art-mobile-cdp.png`.

## Nhật ký phối hợp · Typography mẫu HTML và tagline Huyền sử ngày 28/08/2026

Branch: `feat/home-hero-reference-copy` — tách từ `origin/main` tại merge commit
`31b52b6`. Chủ dự án tiếp tục là người merge; branch không tự triển khai
production.

### Phạm vi đã chốt sau khi làm rõ yêu cầu

1. **Chỉ sao chép kiểu chữ, không sao chép nội dung** từ file
   `Huong Dong Tarot.html`. Headline trang chủ vẫn là “Hường Đông kể Tarot / bằng
   câu chuyện Việt”; Subheadline vẫn là đoạn “Bộ Tarot 78 lá theo hệ RWS…”.
2. Headline trang chủ dùng font Việt hóa `DFVN TAN Harmoni`, italic, weight 900,
   uppercase, line-height `.94`, letter-spacing `.035em` và stroke `.25px` —
   chuyển ngôn ngữ serif nghiêng của mẫu sang hệ font self-host hiện có.
3. Cỡ rộng tăng từ trần `124.8px` lên `132px`. Tablet có trần `94px`. Điện
   thoại dùng `clamp(68px, 18.5vw, 94px)`; tại 390px là `72.15px` để câu nguyên
   bản giữ khoảng bốn dòng thay vì sáu dòng. Đây là ràng buộc responsive riêng,
   không phải thay nội dung.
4. Bóng headline bỏ viền tối bốn phía `94%`; còn hai lớp dưới nhẹ `64% / 26%`.
   Bóng cover lá Hero đổi từ `var(--shadow)` (`0 24px 70px / 14%`) sang
   `0 14px 34px / 9%`. Subheadline trang chủ về màu `--ink-soft`, serif Georgia,
   rộng `34ch`, line-height `1.72` và `text-shadow: none`.
5. `/huyen-su/` nhận thêm tagline đúng câu:
   “Một bộ bài. Một huyền sử. / Một hành trình soi chiếu nội tâm.”, đặt trước mô
   tả Lĩnh Nam chích quái hiện có. Tagline **không** nhân sang 34 trang toàn văn.
6. Headline/Subheadline các `.page-hero` khác, ảnh Mẫu Liễu Hạnh, CTA, proof,
   entrance và nội dung trang chủ đều giữ nguyên.

### Tệp và kiểm thử chống giẫm chân

- `templates/home.html`: chỉ thêm class định danh cho Subheadline và xuống dòng
  markup; câu chữ không đổi.
- `templates/huyen-su.html`: thêm một `page-hero-tagline` cho hub Huyền sử.
- `public/assets/css/critical.css`, `public/assets/css/main.css`: typography và
  shadow phải khớp từng con số để tránh nhảy ở LCP.
- `scripts/build.js`: preload Harmoni cho trang chủ thay Fontasia vì font LCP đã
  đổi; không tải ưu tiên một font không còn dùng ở khung đầu.
- `tests/hero-carousel.test.mjs`: khóa copy trang chủ, typography, hai breakpoint,
  mức shadow, tagline Huyền sử và phạm vi không lan sang trang truyện.
- `tests/critical-css.test.mjs`: khóa preload Harmoni mới.

### Xác minh trên branch

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

Chromium cục bộ sau entrance:

- Home 1440×900: Headline `132px`, Harmoni italic 900, bốn dòng, Subheadline
  kết thúc tại y=`840.6px`, cover shadow mới đã áp dụng, overflow ngang `0`.
- Home 390×844: Headline `72.15px`, bốn dòng, cao `293.25px`; Subheadline và hai
  CTA vẫn nằm trong khung đầu, overflow ngang `0`.
- `/huyen-su/` 1280×720: tagline và mô tả cũ đều hiện sau entrance, hero cao
  `692.8px`, overflow ngang `0`.
- `/huyen-su/` 390×844: headline, tagline và mô tả đều nằm gọn trong hero cao
  `507px`, overflow ngang `0`.

## Nhật ký phối hợp · Ảnh sản phẩm mới trong Hero ngày 28/08/2026

Tiếp tục trên branch `feat/home-hero-reference-copy` và pull request nháp #54.
Chủ dự án vẫn là người merge; nhánh không tự triển khai production.

### Phạm vi đã chốt

1. File nguồn do chủ dự án cung cấp:
   `/home/asus/Desktop/HuongDong project/images/Web-HuongDong-v3-visuals/public/hero-product.webp`,
   kích thước `1200×900`, tỉ lệ `4:3`.
2. Ảnh này **thay khung lá Mẫu Liễu Hạnh trong Hero**, không thay ảnh nền phong
   cảnh toàn Hero. Headline, Subheadline, CTA, proof và ảnh nền giữ nguyên.
3. Hero chuyển từ lá có nút mở dialog kể chuyện sang ảnh sản phẩm tĩnh. Eyebrow
   cũ gắn với lá The Star được thay bằng câu đã có trong dự án:
   “Ấn phẩm · Bộ bài và hộp cứng”. Các đường dẫn Tứ Bất Tử phía dưới vẫn đủ.
4. Crop vuông lấy vùng `x=300..1200` của ảnh gốc: chỉ bỏ khoảng nền kem dư bên
   trái; không kéo méo, không vẽ lại sản phẩm, không thay màu/hoa văn. Bản AI
   outpaint 16:9 đã được dùng để thẩm định bố cục nhưng **không đưa vào repo** vì
   có sai lệch chi tiết nhỏ so với sản phẩm gốc.
5. Xuất AVIF responsive `480 / 720 / 960 / 1200px` và WebP fallback `1200px`.
   Lần vẽ đầu giữ `loading=eager`, `decoding=async`, `fetchpriority=low` để ảnh
   sản phẩm không tranh ưu tiên với ảnh nền Hero đang là ứng viên LCP.

### Code và ràng buộc chống giẫm chân

- `templates/home.html`: `.hero-carousel` chỉ còn là neo CSS/transition lịch sử;
  không còn `data-hero-carousel`, `data-hero-slide` hoặc dialog kể chuyện.
- `public/assets/js/page/registry.js`: Home không nạp module `hero-carousel.js`
  cho một ảnh tĩnh.
- `public/assets/css/critical.css`, `public/assets/css/main.css`: khung sản phẩm
  rộng tối đa `560px`, tỉ lệ `1:1`, bóng nhẹ `0 14px 34px / 9%`; critical và
  stylesheet đầy đủ phải khớp để không nhảy layout.
- `tests/hero-carousel.test.mjs`, `tests/performance-effects.test.mjs`,
  `tests/story-dialog-audit.test.mjs`, `tests/hero-embla-prototype.test.mjs`:
  khóa nguồn responsive, tỉ lệ, độ nhẹ, alt text, không có hook/dialog cũ và
  không nạp JavaScript carousel trên Home.

### QA cục bộ

- Home 1440×900: ảnh sản phẩm hiển thị `558×558px`, chọn AVIF `720w`, không méo,
  không cắt hộp/lá, overflow ngang `0`.
- Home 390×844: ảnh sản phẩm hiển thị `341×341px`, chọn AVIF `720w`, nằm ngay
  sau proof, không cắt hộp/lá, overflow ngang `0`.
- Dung lượng: AVIF `480w` 19KB, `720w` 40KB, `960w` 59KB, `1200w` 80KB; WebP
  fallback `1200w` 168KB.

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```

## Nhật ký phối hợp · Hero Ganh vàng đồng kim loại ngày 28/08/2026

Branch: `feat/hero-bronze-pearl-ganh`. Chủ dự án vẫn là người merge; branch này
không tự triển khai production.

### Phạm vi đã chốt

1. Chỉ đổi typography của **Headline và Subheadline Hero trang chủ**; toàn bộ
   nội dung, line-height, CTA, proof, ảnh nền và ảnh sản phẩm giữ nguyên.
   Cỡ cả hai dòng giảm đúng 10%: Headline rộng còn
   `clamp(77.4px, 8.46vw, 118.8px)`, mobile còn
   `clamp(61.2px, 16.65vw, 84.6px)`; Subheadline còn
   `clamp(15.3px, 1.35vw, 18px)`.
2. Cả hai dòng dùng lại font self-host `Ganh` weight `400`; Headline dùng đúng
   biến thể italic. Trang trong tiếp tục dùng Harmoni và vàng chanh như trước.
3. Hiệu ứng kim loại gồm dải đồng tối `#5E3215`, đồng nền `#B77A2F`, đồng sáng
   `#E4B45E` và một vệt lóe ngọc trai `#FFF3DC`. Cạnh tối, sáng cạnh và bóng đổ
   tạo cảm giác dập nổi; Subheadline dùng stroke/bóng nhỏ hơn để còn dễ đọc.
4. `critical.css` giữ màu đồng dự phòng cùng cạnh/bóng 3D nhưng không nhúng toàn
   dải gradient, nhằm giữ critical CSS của trang trong dưới ngân sách 20 KB.
   `main.css` là stylesheet blocking và áp dụng gradient kim loại đầy đủ.
5. Trang chủ preload `ganh-400.woff2` và `ganh-400-italic.woff2`; route trong vẫn
   chỉ preload Harmoni. Không thêm font hoặc tài nguyên từ bên ngoài.

### Code và ràng buộc chống giẫm chân

- `public/assets/css/critical.css`: font Ganh, màu fallback và lớp tạo khối khớp
  khung đầu; không thay rule `.page-hero`.
- `public/assets/css/main.css`: token kim loại và gradient clip theo thân chữ cho
  cả Headline/Subheadline trang chủ.
- `scripts/build.js`: preload font theo loại route.
- `tests/hero-carousel.test.mjs`: khóa font, màu, gradient, stroke, shadow, cỡ
  chữ và bảo đảm copy không đổi.
- `tests/critical-css.test.mjs`: khóa preload Ganh chỉ trên Home và Harmoni chỉ
  trên trang trong.

### QA cục bộ

- Chromium 1280×720: Ganh đã tải, cả hai dòng nhận đúng gradient kim loại, không
  tràn ngang; vệt ngọc trai đã thu hẹp để tổng thể vẫn đọc là vàng đồng.
- Khung mobile thực 390×844: media query `900px/620px` áp dụng, Headline và
  Subheadline giữ hiệu ứng đồng dập nổi, bố cục không xuất hiện tràn ngang.

```text
npm run build:local   PASS — 86 URL
npm test              PASS — 29/29 tệp test
npm run check:types   PASS
git diff --check      PASS
```
