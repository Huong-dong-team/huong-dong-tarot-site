# Design QA · Trang chủ Kirigami không header

final result: passed

## Nguồn và bằng chứng

- Source visual truth: `/home/asus/.codex/generated_images/01a05070-9cc0-72b1-9cc8-84796d6938de/exec-02d46f0d-6b04-468d-a231-654daccfd6c4.png` — 1586 × 992 px.
- Local implementation: `http://localhost:4173/`.
- Ảnh desktop: `qa/home-kirigami-desktop-final.png` — 1521 × 828 px vùng browser hữu dụng.
- Ảnh mobile: `qa/home-kirigami-mobile-final.png` — viewport yêu cầu 390 × 844 CSS px.
- So sánh đặt cạnh nhau: `qa/home-kirigami-comparison.png` — reference bên trái, implementation bên phải.
- State: trang chủ ở đầu trang; modal rút bài đóng; dữ liệu seed local; chưa deploy.

## Findings

Không còn finding P0/P1/P2.

- Composition: giữ khung tranh Kirigami, ba lá Tarot, hộp bài, mây, sen và đôi hạc; vùng chữ trái được làm thoáng để đọc rõ.
- Header: thanh header/menu ngang đã bỏ hoàn toàn ở trang chủ; chỉ còn logo Hường Đông tại góc trái theo yêu cầu.
- Navigation: bảy mục được chuyển thành bảy thẻ giấy cùng tông nền, xếp dọc ở mép phải desktop và thành hàng cuộn ngang trên tablet/mobile.
- Typography: headline tiếp tục dùng hệ display hiện hữu, màu mực nâu; copy và CTA giữ nguyên nội dung đã duyệt.
- Motion: giữ entrance/fade; nền tranh có chiều sâu/parallax nhẹ; thẻ điều hướng vào theo nhịp và tôn trọng `prefers-reduced-motion`.
- Accessibility: một `h1`; bảy liên kết điều hướng có nhãn rõ; tap target tối thiểu 44px; focus ring rõ; header cũ và menu toggle đều `display:none` trên home.
- Behavior: CTA “Rút thử một lá” mở dialog và Escape đóng; console không có warning/error; không tràn ngang ở desktop hoặc mobile.

## Comparison history

### Iteration 1

- P2: tranh sinh lần đầu có sen và trang trí che vùng copy bên trái; logo hòa vào la bàn nên tương phản yếu.
- Fix: tái tạo master art-only với copy-safe zone bên trái; đặt logo trên plaque giấy rất nhẹ, giữ đúng góc trái.

### Iteration 2

- P2: navigation ngang cũ làm sai brief mới và cạnh tranh với hero.
- Fix: ẩn `#main-nav` và `.menu-toggle` chỉ trong scope home; thêm hệ thẻ giấy bảy mục trong hero.

### Iteration 3

- P2: thẻ điều hướng desktop cần rõ trạng thái tương tác, mobile cần đủ vùng chạm.
- Fix: thêm hover/focus, focus ring 3px, min-height 46px desktop và 44px mobile; chuyển sang horizontal scroll dưới 900px.

## Primary interactions tested

- Logo góc trái hoạt động như liên kết về trang chủ.
- Bảy thẻ điều hướng có đúng route hiện hữu.
- CTA “Học qua email” đi tới danh sách chờ.
- CTA “Rút thử một lá” mở modal; Escape đóng modal.
- Entrance/fade và reduced-motion cùng có đường chạy riêng.

## Follow-up polish (P3)

- Reference gốc có header 76px và cho thấy một phần section kế tiếp. Bản implementation chủ động dùng toàn viewport cho hero vì header đã được bỏ theo brief mới.
- Mobile ưu tiên thứ tự đọc: logo → copy → CTA/thống kê → thẻ điều hướng → tranh. Tranh không chen vào đoạn chữ để giữ khả năng đọc.
