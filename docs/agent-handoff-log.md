# Nhật ký bàn giao tác vụ

## 03/09/2026 · Pull request · `feat/kirigami-subpages-v3`

Phạm vi đã thay đổi:

- Chốt kiến trúc năm mục: Tarot là gì, Bảo tàng 78 lá, Khóa học, Bản tin Hường
  Đông, Cửa hàng; toàn bộ navigation desktop/mobile và dải điều hướng homepage
  cùng đọc theo cấu trúc này.
- Tạo `/khoa-hoc/` bằng cách biên tập Trải bài, Healing và Huyền sử thành giáo
  trình: nền tảng RWS, đọc hình ảnh, bố cục, phản tư và kiểm chứng nguồn.
- Xóa CTA “Lá bài hôm nay”; ngừng sinh giao diện rút/xáo bài và gỡ loader
  `daily-card`, `spread-deck`, `huyen-su-reveal` khỏi registry.
- Chuyển 34 trang truyện sang `/la-bai/huyen-su/<slug>/`; URL cũ có HTML
  fallback và Firebase 301 để bảo toàn backlink.
- Hoàn thiện năm Hero Kirigami 3D; `/khoa-hoc/` tạm dùng cảnh Trải bài theo yêu
  cầu nhưng asset mang tên trung tính theo route mới.
- Cập nhật sitemap, test hồi quy, tài liệu hệ thiết kế và báo cáo QA.
- Đã đối chiếu `main` mới nhất trước khi mở PR: giữ logic `aria-current` vừa
  được bổ sung, ánh xạ lại cho đúng năm mục và bọc toàn bộ hover mới trong
  `@media (hover: hover)` theo chuẩn thiết bị cảm ứng hiện hành.

Không thay đổi:

- Không sửa dữ liệu 78 lá, toàn văn 34 truyện, bài Bản tin, ba mức giá hay
  workflow triển khai.
- Không merge và không deploy; chủ dự án là người review/merge PR.
- PNG nguồn ImageGen và ảnh QA trung gian không đưa vào commit.

Điểm tránh giẫm chân:

- Không thêm lại CTA `/la-bai-hom-nay/` hoặc loader bói vào registry.
- Route canonical của truyện nguồn nằm dưới `/la-bai/huyen-su/`; route
  `/huyen-su/` cấp một thuộc nhóm đã nghỉ và chuyển về Khóa học.
- Khi thay ảnh tạm của Khóa học, giữ tên
  `khoa-hoc-kirigami-3d.webp` để không phải sửa route mapping.

Kiểm tra đã chạy:

- `npm run build:local` và `npm run check:types` — đạt.
- 35/36 tệp test đạt; lỗi còn lại là giới hạn child-process của sandbox trong
  `editorial-publish.test.mjs`, không liên quan thay đổi.
- Browser QA năm route tại 1440×1000 và 390×844: không overflow, đúng năm mục,
  Hero hiện đủ sau entrance và console không có error/warning.

## 03/09/2026 · Local only · `feat/kirigami-subpages-v3`

Phạm vi đã thay đổi:

- Thay toàn bộ ảnh Hero sơn mài của bảy nhóm sub-page bằng bảy cảnh Kirigami
  3D riêng, tạo bằng built-in ImageGen từ system board đã duyệt.
- Giữ PNG nguồn 1536×1024 trên máy local để tinh chỉnh; chỉ stage bảy WebP
  quality 88 trong `public/assets/img/subpage-3d/` để tránh tăng repo 20MB.
- Loại bỏ `KIRIGAMI_HERO_SCENES`, `kirigamiHeroDecor()` và các hiện vật sơn
  mài ghép lớp khỏi DOM Hero; giữ hook `lacquer-hero` chỉ để animation cũ không
  gãy, đồng thời thêm class ngữ nghĩa `kirigami-hero`.
- Giữ entrance/fade; thêm nhịp thở rất nhẹ cho cảnh 3D và reduced-motion.
- Giữ hệ nhãn chương/mục lục/folio Kirigami V3, sửa chiều cao Hero Bảo tàng và
  khóa overflow desktop/mobile.
- Cập nhật test, tài liệu hệ thiết kế, comparison board và `design-qa.md`.

Không thay đổi:

- Không sửa nội dung 78 lá, truyện Huyền sử, bài viết, giá ba gói, homepage,
  workflow GitHub hoặc cấu hình Firebase.
- Không commit, không push, không mở PR và không deploy; toàn bộ thay đổi chỉ
  nằm trên máy local theo yêu cầu người dùng.

Điểm tránh giẫm chân:

- Nguồn Hero mới được ánh xạ trực tiếp bằng `artId` trong
  `pageArtworkPicture()`; preload trong `layout()` phải đổi cùng lúc nếu đổi tên
  asset.
- `public/assets/css/subpage-kirigami-v3.css` tải cuối để tắt wash/multiply của
  hệ Hero cũ mà không ảnh hưởng homepage.
- Không khôi phục `kirigamiHeroDecor()` hoặc gắn lại asset trong
  `public/assets/img/subpage/` nếu chưa có yêu cầu quay lại tranh sơn mài.

Kiểm tra đã chạy:

- `npm run build:local` — sinh 95 URL.
- Test Hero/Kirigami/critical CSS — đạt.
- `npm test` — 35/36 đạt; `editorial-publish` bị giới hạn môi trường stream fd,
  không liên quan UI và không bị sửa.
- Browser QA đủ bảy route tại 1440×1000 và 390×844: không overflow; menu,
  chapter anchor, filter Ẩn Chính 22 lá và console đều đạt.

## 02/09/2026 · PR #78 · `content/editorial-foundation-beginner`

Phạm vi đã thay đổi:

- Đặt chuẩn biên tập dùng cho toàn website: chúng tôi xưng “chúng tôi”, gọi
  người đọc là “bạn”, kể trước–giảng sau, giải thích thuật ngữ cho người mới và
  viết câu nội dung có chủ ngữ–vị ngữ rõ ràng.
- Viết lại phần nền ở Tarot là gì, bốn trang sổ tay, Trải bài, Healing, Bảo
  tàng 78 lá, Giới thiệu và Cửa hàng mà không đổi CSS, asset hay chức năng.
- Chuyển hồ sơ lá sang thứ tự câu chuyện → ý nghĩa; biên tập sâu 8 lá mẫu: The
  Fool, Justice, Death, Ace of Wands, Queen of Wands, Seven of Cups, Three of
  Swords và Ten of Pentacles.
- Sửa các trường ứng dụng bị lệch nghĩa ở Seven of Cups, Three of Swords và
  Ten of Pentacles; thay bộ từ khóa ngược chung của 8 lá bằng nội dung riêng.
- Mở rộng hai bài nền trong Chuyện Hường Đông và bổ sung bản đồ content section,
  sổ nguồn, bộ dò trùng chuỗi với kho Mystic House cùng test biên tập.
- Thêm lệnh xuất bản Firestore có dry-run mặc định. Chế độ ghi chỉ merge trường
  nội dung của đúng 8 lá + 2 bài và yêu cầu xác nhận đúng Firebase project.

Không thay đổi:

- Không sửa `templates/home.html` vì PR #65 đang chạm cùng tệp; trang chủ chỉ
  được kiểm kê và sẽ đồng bộ copy ở một đợt sau khi PR đó kết thúc.
- Không sửa 70 lá ngoài nhóm mẫu, 34 truyện Lĩnh Nam, nguồn, ảnh, trạng thái
  duyệt văn hóa, CSS, JavaScript giao diện, workflow hoặc cấu hình Firebase.
- Không ghi Firestore, không merge `main` và không deploy production trong PR.

Điểm tránh giẫm chân:

- `docs/editorial-voice-guide.md` là hợp đồng giọng văn cho các batch tiếp theo;
  nếu thay đại từ hoặc thứ tự kể–giảng, cần cập nhật test biên tập cùng lúc.
- `scripts/publish-editorial-pr1.mjs` là cầu nối hẹp sang Firestore. Không thay
  bằng `npm run seed`, vì lệnh seed rộng sẽ merge toàn bộ 78 lá và cấu hình site.
- 70 lá còn lại vẫn mang bộ từ khóa ngược chung và nhiều trường ứng dụng theo
  khuôn cấp số. Chúng cần được biên tập theo từng batch có thể duyệt, không dùng
  thao tác thay thế hàng loạt.
- Bản DOCX người dùng cung cấp đã được đối chiếu: 34 chương trong
  `data/lncq-chapters.json` trùng nội dung chuẩn hóa, nên không nhập lại.

Kiểm tra đã chạy:

- `npm run build:local` — sinh 78 trang lá, 2 bài tin và 95 URL.
- `npm test` — 153/153 kiểm thử đạt.
- `npm run check:types` — đạt.
- `MYSTIC_HOUSE_ARCHIVE=… npm run audit:content` — 20 phần Hường Đông được đối
  chiếu với 16 tệp tham khảo; không phát hiện chuỗi trùng 14 từ.
- `npm run publish:editorial-pr1` — dry-run đúng 8 lá + 2 bài; Firestore không
  bị ghi.

Trạng thái sau khi merge và triển khai ngày 03/09/2026:

- PR #78 đã được chủ dự án merge vào `main` tại commit
  `0136fd376474ce56e5692046c9eed07bd6b318df`.
- Lệnh `publish:editorial-pr1 -- --apply` đã merge đúng trường nội dung của 8
  lá + 2 bài vào Firestore project `huong-dong-tarot-729d2`.
- Bản production được dựng lại từ Firestore: đủ 78 trang lá, 2 bài tin và 95
  URL; 153/153 kiểm thử và type-check đều đạt.
- Firebase Hosting đã release thành công 430 tệp. Kiểm tra ngoài CDN xác nhận
  nội dung mới xuất hiện tại `https://huongdong.id.vn/` và
  `https://huongdong.web.app/`, gồm trang Tarot là gì, The Fool và bài RWS.
- Không chạy lệnh seed toàn bộ và không thay đổi 70 lá ngoài phạm vi PR1.

## 02/09/2026 · `feat/kirigami-all-subpages-v2`

Phạm vi đã thay đổi:

- Mở rộng bảy nhóm sub-page theo cùng hệ Kirigami đã duyệt, kế thừa Bảo tàng
  78 lá và phòng Huyền sử từ PR #75.
- Giữ nguyên tám tranh sơn mài route; thêm ảnh khung giấy RGBA thật ở tiền cảnh
  và hiện vật ảnh thật riêng cho từng route ở lớp giữa.
- Thêm nhãn giấy, bề mặt cắt góc và nhịp depth xuyên suốt Hero, nội dung,
  Museum, bài viết và ba gói cửa hàng.
- Thêm entrance 980–1040ms, stagger 70ms, idle 2–3px, hover gập 1.2° và
  pointer parallax tối đa 12px/8px; reduced-motion tắt toàn bộ chuyển động mới.
- Mở rộng test hồi quy, tài liệu design system và bằng chứng QA desktop/mobile.

Không thay đổi:

- Không sửa dữ liệu 78 lá, 34 truyện nguồn, giá ba gói, nội dung bài viết hoặc
  workflow GitHub/Firebase.
- Không xóa route `/huyen-su/`; route cũ vẫn tồn tại cho SEO/backlink dù nội
  dung Huyền sử đã được gộp vào `/la-bai/#phong-huyen-su`.
- Không merge `main` và không deploy production.

Điểm tránh giẫm chân:

- Scene được sinh tập trung từ `KIRIGAMI_HERO_SCENES` trong `scripts/build.js`;
  nếu đổi asset phải cập nhật test Kirigami cùng lúc.
- CSS Kirigami nằm riêng ở `subpage-kirigami.css` và tải sau Museum; không đưa
  các selector này vào `home-standalone.css` vì trang chủ có sân khấu riêng.
- `kirigami-frame-v2.png` là asset nguồn RGBA tạo bằng ImageGen rồi khử chroma;
  trang tải bản WebP tối ưu. Không thay bằng SVG/CSS art hoặc ghi đè khi chưa
  cập nhật tài liệu nguồn.

## 01/09/2026 · `feat/tarot-museum-gallery`

Phạm vi đã thay đổi:

- Chuyển `/la-bai/` thành “Bảo tàng 78 lá” với đại sảnh, phòng Ẩn Chính, phòng Ẩn Phụ và bốn nhà bài.
- Gộp nội dung Huyền sử vào cùng trang dưới `#phong-huyen-su`; giữ nguyên nội dung và tranh nguồn.
- Thêm tường gallery, nhãn giám tuyển, tìm kiếm/bộ lọc và dialog ngắm cận cảnh có Trước/Sau + bàn phím.
- Cập nhật navigation toàn site: “Bảo tàng 78 lá” thay cho mục 78 lá cũ; liên kết Huyền sử trỏ vào phòng mới.
- Thêm CSS/module riêng, test hồi quy và tài liệu `docs/museum-gallery-design-system.md`.
- Bổ sung bằng chứng QA tại `qa/museum-gallery-*-final.png` và `qa/museum-gallery-comparison.png`.

Không thay đổi:

- Không xóa `/huyen-su/` hoặc 34 trang truyện con; các route này tiếp tục build để bảo toàn SEO/backlink.
- Không sửa dữ liệu 78 lá, nội dung truyện, ảnh bài, giá cửa hàng, workflow GitHub hoặc cấu hình Firebase.
- Không merge `main` và không deploy production.

Điểm tránh giẫm chân:

- CSS mới khóa bằng `main[data-page="library"]`; không bỏ scope này hoặc chuyển token Museum thành global.
- `museum-gallery.js` lấy dữ liệu từ DOM; nếu đổi markup plaque/frame phải cập nhật module và `tests/museum-gallery.test.mjs` cùng lúc.
- Huyền sử được trích ở build-time từ `templates/history.html`; không nhân đôi nội dung bằng tay trong `card-list.html`.
- Sticky filter dùng `top:88px` để tránh header; nếu đổi chiều cao header phải cập nhật offset và QA.

## 01/09/2026 · `feat/kirigami-home-floating-nav`

Phạm vi đã thay đổi:

- Remake riêng Hero trang chủ theo visual Kirigami đã duyệt; thêm bộ ảnh responsive `home-kirigami-480/960/1536.webp`.
- Bỏ thanh header/menu ngang trên trang chủ nhưng giữ logo Hường Đông ở góc trái.
- Chuyển bảy đường dẫn chính thành thẻ giấy cùng màu nền ở mép phải Hero; tablet/mobile dùng hàng cuộn ngang.
- Giữ nguyên nội dung copy, CTA, thống kê, entrance/fade và hiệu ứng chiều sâu; bổ sung reduced-motion cho thẻ mới.
- Cập nhật preload/build và test theo asset Hero mới.
- Bổ sung bằng chứng QA tại `qa/home-kirigami-*.png` và báo cáo `design-qa.md`.

Không thay đổi:

- Không sửa bảy sub-page, dữ liệu bài/truyện, giá cửa hàng hoặc tranh sơn mài của các route bên trong.
- Không merge `main`, không deploy Firebase/Sites và không thay đổi workflow GitHub.

Điểm tránh giẫm chân:

- CSS bỏ header được khóa bằng `body:has(main[data-page="home"])`; không chuyển selector này thành global.
- Navigation cũ vẫn tồn tại trong layout để bảy sub-page tiếp tục dùng; trang chủ chỉ ẩn nó bằng CSS.
- Không ghi đè ba asset `home-kirigami-*.webp` nếu chưa cập nhật đồng thời preload trong `scripts/build.js` và các test Hero.

## 31/08/2026 · `feat/remake-seven-subpages`

Phạm vi đã thay đổi:

- Thêm hệ CSS chung cho bảy nhóm trang trong: `public/assets/css/subpage-remake.css`.
- Thêm chuyển động chiều sâu có reduced-motion: `public/assets/js/ui/subpage-motion.js`; đăng ký qua `public/assets/js/page/registry.js`.
- Giữ nguyên toàn bộ tranh route trong `public/assets/img/subpage/` và logic `PAGE_ART`.
- Bổ sung minh họa tiểu mục cho Tarot là gì, Trải bài, Healing, Huyền sử bằng ảnh bài/chân dung hiện có.
- Bổ sung subheadline cho Chuyện Hường Đông.
- Làm lại Cửa hàng với ba gói 390.000đ / 690.000đ / 990.000đ, Product JSON-LD nhiều Offer và ba ảnh sản phẩm riêng.
- Cập nhật critical CSS và test để khung đầu không đổi màu sau khi stylesheet đầy đủ tải xong.
- Thêm bằng chứng QA tại `docs/design-qa-assets/` và báo cáo `design-qa.md`.

Không thay đổi:

- Không sửa nội dung dữ liệu 78 lá, 34 truyện LNCQ, bài viết hoặc tranh sơn mài route hiện có.
- Không deploy Firebase, không merge `main`, không thay đổi workflow GitHub.
- Báo cáo QA trang chủ trước đó vẫn nằm trong lịch sử Git tại `c238b7b:design-qa.md`; tệp gốc hiện chứa báo cáo mới nhất theo hợp đồng Product Design.

Điểm tránh giẫm chân:

- Giá sản phẩm phải sửa ở `PACK_TIERS`; `PACK_PRICE` tiếp tục đại diện Premium để giữ tương thích trang chủ.
- Hero trang trong được override cuối cùng bởi `subpage-remake.css`; không chỉnh riêng từng route trừ khi có yêu cầu thiết kế mới.
- Ba asset shop `*-pack-v1.png` là raster đã chốt cho PR này; không ghi đè nếu tác vụ khác đang làm phiên bản v2.
