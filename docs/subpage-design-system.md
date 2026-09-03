# Hệ thị giác 5 đường nội dung · Hường Đông Tarot

Ngày chốt: 03/09/2026
Phong cách: sân khấu Kirigami 3D, đồng nhất với homepage.

## Kiến trúc thông tin

| Mục | Route | Vai trò |
|---|---|---|
| 1 | `/tarot-la-gi/` | Nhập môn Tarot và hệ nghĩa RWS |
| 2 | `/la-bai/` | Bảo tàng 78 lá + 34 truyện nguồn |
| 3 | `/khoa-hoc/` | Giáo trình Tarot có cấu trúc |
| 4 | `/tin-tuc/` | Bản tin Hường Đông |
| 5 | `/cua-hang/` | Sản phẩm và danh sách chờ |

`/trai-bai/`, `/healing/`, `/huyen-su/`, `/la-bai-hom-nay/` và
`/huong-dan-tarot/*` là route đã nghỉ. Chúng không có trong sitemap, không nạp
module tương tác và được chuyển hướng về nội dung mới.

## Hero và màu sắc

- Hero cao 610–760px; copy trái khoảng 39%, cảnh Kirigami toàn khung.
- Nhãn giấy ở góc phải dưới và mục lục bốn liên kết nằm chồng mép Hero.
- Giấy `#FFFBEB`, giấy sâu `#F4EAD1`, mực `#3D2B1A`, xanh ngọc `#173F37`,
  đỏ son `#C92332`, vàng kim `#D6AD49`.
- Headline vàng pastel `#E8C783` có viền trắng ngà; subheadline `#F2DFB7`
  không dùng viền headline.
- Tranh Hero hiển thị nguyên màu, không wash và không `mix-blend-mode` sơn mài.

## Component

- `.kirigami-3d-artwork`: cảnh giấy cắt toàn khung, eager và high priority.
- `.kirigami-page-label`: nhãn số mục/tên chương kiểu giấy gấp.
- `.kirigami-chapter-bar`: mục lục anchor, bốn ô trên desktop và hai ô mobile.
- `.course-module-grid`: bốn mô-đun giấy xanh ngọc có chuyển động gập nhẹ.
- `.course-principles`, `.course-source-layers`: thẻ giấy ba lớp, góc son.
- `.course-reading-steps`: năm bước đọc một lá; chuyển về một cột trên mobile.
- `.section-feature`, `.section-card-fan`: chữ + ảnh minh họa hoặc quạt ba lá.
- `.pricing-grid`: Standard 390.000đ, Premium 690.000đ, Signature 990.000đ.

## Chuyển động và accessibility

- Entrance/fade hiện hữu tiếp tục điều khiển Hero và nội dung.
- Cảnh có nhịp camera 1.2–3.2% trong 14 giây; hover folio tối đa 5–7px.
- `prefers-reduced-motion: reduce` tắt animation/transition/transform mới.
- Mỗi trang có một `main#noi-dung-chinh`, một `h1`; điều hướng mobile dùng nút
  menu riêng; không có overflow ở 390px.

## Nội dung Khóa học

Khóa học không rút bài hoặc đưa phán quyết. Bốn mô-đun là:

1. Nền tảng RWS — 78 lá, bốn chất, nghĩa xuôi/ngược.
2. Đọc hình ảnh — quan sát, cảm nhận, đặt vị trí, đối chiếu, trở về dữ kiện.
3. Bố cục — học vị trí như ngữ pháp; người học tự thực hành bằng bộ bài riêng.
4. Nguồn Việt — phân biệt văn bản, chuyển thể và liên tưởng Tarot.

Phần Healing cũ là bài thực hành phản tư, không được mô tả như trị liệu. Phần
Huyền sử cũ là tài liệu đọc nguồn; toàn văn nằm trong Bảo tàng.

## Asset và mã nguồn

- Ảnh tải thật: `public/assets/img/subpage-3d/*-kirigami-3d.webp`.
- Ánh xạ route/nhãn/mục lục: `PAGE_ART`, `KIRIGAMI_PAGE_META` trong
  `scripts/build.js`.
- CSS V3: `public/assets/css/subpage-kirigami-v3.css`.
- Module registry không được khôi phục `daily-card`, `spread-deck` hoặc
  `huyen-su-reveal` nếu chưa có quyết định sản phẩm mới.
