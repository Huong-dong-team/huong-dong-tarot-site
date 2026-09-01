# Design QA · Bảo tàng 78 lá Hường Đông

final result: passed

## Nguồn và bằng chứng

- Source visual truth: `/home/asus/.codex/generated_images/01a05070-9cc0-72b1-9cc8-84796d6938de/exec-c40230dd-7a6d-4359-b8d7-612560de6fde.png` — bảng hệ thống bảy trang sơn mài.
- Nghiên cứu GitHub: OpenVGAL cho mô hình phòng trưng bày/nhãn hiện vật; Neiki Gallery cho lọc, lightbox và bàn phím.
- Local implementation: `http://localhost:8080/la-bai/`.
- Ảnh desktop: `qa/museum-gallery-desktop-final.png`, `qa/museum-gallery-grid-final.png`, `qa/museum-gallery-dialog-final.png`.
- Ảnh mobile: `qa/museum-gallery-mobile-final.png` — viewport 390 × 844 CSS px.
- So sánh cùng một khung: `qa/museum-gallery-comparison.png`.
- State: dữ liệu seed local; 78 hiện vật; Huyền sử đã nhập vào cùng route; chưa deploy.

## Findings

Không còn finding P0/P1/P2.

- Composition: giữ nền sơn mài đen–ngọc, mực vàng và nhịp giấy ngà của mockup; gallery chuyển thành tường bảo tàng bốn cột với khung vàng già và nhãn giám tuyển.
- Content: đủ 78 lá, chia phòng Ẩn Chính/Ẩn Phụ và bốn nhà; phòng Huyền sử chứa nguyên các cụm nội dung hiện hữu.
- Typography: headline/subheadline vàng pastel trên nền tối; nhãn hiện vật dùng mực nâu/đỏ son, không bị trùng màu nền.
- Behavior: tìm kiếm, lọc 22/56 lá, lọc nhà, lightbox, Trước/Sau, phím mũi tên và phục hồi focus đều hoạt động.
- Responsive: desktop 4→3→2→1 cột; mobile dùng lưới 2 × 2 cho bốn cửa phòng, không còn thanh cuộn ngang; không tràn viewport.
- Accessibility: một `h1`; dialog native có backdrop, nút đóng và focus ring; CTA/phòng có vùng chạm ≥44px; reduced-motion vô hiệu hóa chuyển động trang trí.
- Performance: dùng ảnh hiện hữu, lazy loading và `content-visibility:auto`; không thêm WebGL/Three.js cho 78 hiện vật.
- Compatibility: route `/huyen-su/` và 34 trang truyện con vẫn được build để bảo toàn liên kết/SEO.
- Console: không có lỗi hoặc cảnh báo mới liên quan module Museum Art.

## Comparison history

### Iteration 1

- P2: rail bộ lọc sticky chạm vào header 76px.
- Fix: đổi offset từ 12px thành 88px; xác nhận filter top 88px và header bottom 76px.

### Iteration 2

- P2: dialog desktop có thể mở ở vị trí nội dung bị cắt do ảnh và copy cùng căn giữa trong grid cao cố định.
- Fix: căn grid về đầu, giới hạn ảnh theo `100dvh`, giữ dialog scrollTop = 0 khi mở.

### Iteration 3

- P2: bốn cửa phòng trên mobile dùng rail ngang và lộ scrollbar.
- Fix: chuyển sang lưới 2 × 2; mỗi nút rộng 166.5px, cao 46px tại viewport 390px.

## Primary interactions tested

- “Ẩn Chính” cập nhật đúng 22 hiện vật.
- Tìm “Mẫu Liễu Hạnh” trả đúng một hiện vật.
- “Ngắm cận cảnh” mở dialog Mai An Tiêm.
- ArrowRight chuyển sang Kinh Dương Vương.
- Đóng dialog trả focus về nút “Ngắm cận cảnh”.
- Sáu anchor của phòng Huyền sử cùng tồn tại trong `/la-bai/`.

## Follow-up polish (P3)

- Hero tối hơn các panel thông tin trong mockup để tạo cảm giác bước vào đại sảnh; độ tương phản chữ vẫn đạt mục tiêu thị giác và đồng nhất với bảy sub-page sơn mài.
- Một số ảnh bài vẫn mang ribbon “ĐANG HOÀN THIỆN” vì đó là trạng thái nguồn hiện tại; PR này cố ý không sửa hoặc thay tranh.
