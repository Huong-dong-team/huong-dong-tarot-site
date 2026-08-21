# Design QA — Hường Đông Firebase

- Source visual truth: `/workspace/scratch/huong-dong-version18-source.jpg`
- Implementation screenshot: `/workspace/scratch/huong-dong-firebase-home-final.jpg`
- Viewport/CSS size: 1348 × 926 px
- Source pixels: 1348 × 926; implementation pixels: 1348 × 926
- Density normalization: device scale factor 1; không cần đổi kích thước
- State: trang chủ, đầu trang, chưa nhập form

## Full-view comparison evidence

Hai ảnh được mở trong cùng một lượt so sánh. Bản Firebase giữ đúng trục thị giác đã duyệt: header ngọc sẫm viền đồng, tiêu đề lớn bên trái, trống đồng nằm chìm ở tâm, Mẫu Liễu Hạnh chiếm khoảng 30% khung nhìn bên phải và form danh sách chờ nằm ngay trong hero. Tỷ lệ hai cột, điểm nhìn chính, độ tương phản và hướng đọc tương đương bản nguồn.

## Focused region comparison evidence

Vùng hero được kiểm tra riêng vì đây là nơi có logo, typography, trống đồng, tranh Mẫu Liễu Hạnh, form và CTA. Tranh dùng đúng ảnh 1024 × 1536, render khoảng 339 × 501 px, không crop mất sao, nhân vật, phủ thờ hoặc hoa sen. Trống đồng và chim Lạc là ảnh thật ở lớp nền, không được thay bằng hình vẽ CSS/SVG.

## Required fidelity surfaces

- Fonts and typography: Cormorant Garamond giữ chất mềm, trang trọng cho display; Be Vietnam Pro giữ độ rõ cho nội dung và form. Phân cấp H1–eyebrow–body rõ, không cắt chữ.
- Spacing and layout rhythm: hero hai cột cân bằng; form, CTA và ba số kiểm kê có nhịp dọc ổn định; tranh giữ khoảng thở và không va vào header.
- Colors and visual tokens: ngọc sẫm, đồng, ngà và son được khai báo thành token; độ tương phản chữ/form đạt mức đọc tốt.
- Image quality and asset fidelity: ảnh Mẫu Liễu Hạnh đủ độ phân giải; trống đồng và chim Lạc dùng đúng asset dự án; không có placeholder.
- Copy and content: giữ thông điệp “Di sản Việt, soi đường qua 78 lá bài”, lớp RWS và mục tiêu danh sách chờ; không xuất hiện giỏ hàng hoặc thanh toán.

## Comparison history

### Vòng 1

- [P1] Header màu ngà làm mất tính liên tục của không gian điện thờ ngọc sẫm.
- [P1] Hero thiếu form email trực tiếp, làm lệch đường chuyển đổi của bản nguồn.
- [P2] Nền quá phẳng, chưa giữ chiều sâu cảnh quan và ấn trống đồng.

### Fixes made

- Đổi header sang ngọc sẫm, viền và CTA màu đồng.
- Đưa form email trở lại hero, giữ thêm hai liên kết khám phá.
- Bổ sung nền cảnh quan thật và tăng độ hiện diện chìm của trống đồng/chim Lạc.

### Post-fix evidence

Ảnh `huong-dong-firebase-home-final.jpg` cho thấy ba khác biệt trên đã được xử lý; không còn P0/P1/P2 có thể hành động.

## Interaction and console checks

- Trang thư viện mở đủ 78 lá.
- Chọn Ẩn Phụ trả 56 lá; chọn Nhà Dâu tằm trả 14 lá.
- Ảnh hero tải đúng kích thước tự nhiên 1024 × 1536.
- Form hero hiển thị và có nhãn truy cập được; không gửi dữ liệu trong QA.
- Không có lỗi hoặc cảnh báo từ ứng dụng; thông báo của extension trình duyệt được loại khỏi đánh giá.

## Follow-up polish

- [P3] Có thể tinh chỉnh thêm tracking chữ ở CTA trên màn hình rất hẹp sau khi kiểm tra bằng thiết bị thật.

final result: passed
