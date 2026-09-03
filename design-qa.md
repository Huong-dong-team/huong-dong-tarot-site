# Design QA · Kiến trúc 5 đường Kirigami Hường Đông

Trạng thái: đạt trên localhost, chờ review pull request.

## Phạm vi chốt

Website chỉ còn năm đường nội dung chính:

1. `/tarot-la-gi/` — kiến thức nhập môn.
2. `/la-bai/` — Bảo tàng 78 lá, gồm phòng tư liệu Huyền sử.
3. `/khoa-hoc/` — giáo trình hợp nhất Trải bài, Healing và Huyền sử.
4. `/tin-tuc/` — Bản tin Hường Đông.
5. `/cua-hang/` — ba phiên bản sản phẩm.

CTA “Lá bài hôm nay” và mọi nút rút/xáo bài đã được loại khỏi nội dung công
khai. Các URL cũ trả trang chuyển hướng `noindex,follow`; Firebase Hosting dùng
301. Ba mươi bốn truyện nguồn chuyển sang `/la-bai/huyen-su/<slug>/` để thuộc
đúng namespace Bảo tàng.

## Kết quả giao diện

- Năm Hero dùng cùng hệ giấy ngà, xanh ngọc, đỏ son và vàng cổ; headline
  Fontasia vàng pastel viền ngà, subheadline dịu hơn.
- `/khoa-hoc/` tạm dùng cảnh 3D Kirigami của Trải bài như yêu cầu, nhưng tên
  asset đã đổi thành `khoa-hoc-kirigami-3d.webp` để kiến trúc không mang nghĩa
  bói bài.
- Khóa học có bốn mô-đun: nền tảng RWS, đọc hình ảnh, đọc bố cục và kiểm chứng
  nguồn; Healing trở thành thực hành phản tư, Huyền sử trở thành tư liệu học.
- Bố cục desktop 1440×1000 và mobile 390×844 không overflow. Sau entrance,
  tranh và headline đều đạt opacity 1; `prefers-reduced-motion` giữ bản tĩnh.
- Năm route đều có đúng năm mục navigation, ảnh Hero eager, không có ảnh thiếu
  `src`, không có console error/warning trong lượt QA.

## Kiểm thử

- `npm run build:local` — đạt, sinh 78 trang lá, 2 bài tin và 122 URL canonical.
- `npm run check:types` — đạt.
- `npm test` — 35/36 tệp đạt. Riêng `editorial-publish.test.mjs` không chạy
  được child process trong sandbox (`Failed to create stream fd`); phần này
  không bị sửa và không liên quan UI/IA.

## Quy tắc bàn giao

- Chỉ năm WebP Hero được đưa vào PR: Tarot, Bảo tàng, Khóa học, Bản tin và Cửa
  hàng. PNG nguồn ImageGen cùng các ảnh QA trung gian chỉ giữ local.
- Không merge, không deploy trong tác vụ này. Chủ dự án review và merge PR.
