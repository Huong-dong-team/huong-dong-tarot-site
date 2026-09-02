# Design QA · Hệ Kirigami bảy sub-page Hường Đông

final result: passed

## Nguồn và bằng chứng

- Source visual truth: `/home/asus/Desktop/peak images/Codex Image Sep 1, 2026, 12_46_15 PM.png` — bảng hệ thống 7 sub-page Kirigami, 1536 × 1024 px.
- Local implementation: `http://localhost:4173/` với các route `/tarot-la-gi/`, `/la-bai/`, `/trai-bai/`, `/healing/`, `/huyen-su/`, `/tin-tuc/`, `/cua-hang/`.
- Desktop evidence: `qa/kirigami-*-desktop-final.png`; Browser viewport đặt 1536 × 1024 CSS px, vùng nội dung chụp được 1521 × 828 px, device density 1.
- Mobile evidence: `qa/kirigami-tarot-la-gi-mobile-final.png`, `qa/kirigami-la-bai-mobile-final.png`, `qa/kirigami-cua-hang-mobile-final.png`; Browser viewport đặt 390 × 844 CSS px, vùng nội dung chụp được 375 × 804 px, device density 1.
- Same-input comparison: `qa/kirigami-system-comparison.png`, 3072 × 1024 px. Nửa trái là source board; nửa phải là implementation board dựng từ bảy ảnh desktop cuối, chuẩn hóa về cùng canvas 1536 × 1024.
- State: seed data local, animation đã về trạng thái nghỉ, chưa deploy.

Source là system board chứ không phải một frame route 1:1, nên QA đối chiếu ngôn ngữ chung, phân cấp, palette, hình tượng và nhịp Hero; không tuyên bố pixel-perfect cho vị trí copy riêng của từng thumbnail.

## Findings

Không còn finding P0/P1/P2.

- **Fonts and typography:** Fontasia giữ headline thư pháp; nhãn dùng Be Vietnam Pro chữ hoa; headline vàng pastel và subheadline vàng dịu vẫn có phân cấp rõ. Không có cắt chữ hoặc hai `h1` trên bảy route.
- **Spacing and layout rhythm:** Hero desktop cao 540–660px, chia vùng copy trái và sân khấu phải; khung mây/sóng tạo tiền cảnh liên tục. Museum mobile cao 720px để đủ chỗ cho headline, subheadline và bốn cửa phòng. Bề mặt nội dung cắt góc 18px thay cho thẻ tròn generic.
- **Colors and tokens:** `#F2E8D4`, `#1E3B34`, `#8F2F2D`, `#E8C783` bám bảng nguồn; tranh sơn mài đen–vàng hiện hữu vẫn là lớp nền và không bị đổi màu.
- **Image quality and asset fidelity:** Khung giấy là raster RGBA thật tạo bằng ImageGen, không có green halo nhìn thấy; trình duyệt tải WebP 176KB. Hiện vật route dùng ảnh thật/ảnh Hường Đông có sẵn; shop dùng ba ảnh 640px tối ưu. Không có SVG tự vẽ, emoji, placeholder hoặc CSS illustration thay cho hình ảnh.
- **Copy and content:** Giữ nguyên headline, subheadline, 78 lá, Huyền sử, nội dung bài viết và giá ba gói. Nhãn mục trở thành nhãn giấy nhưng nội dung không bị sửa.
- **States and interactions:** Menu mobile mở đúng `aria-expanded=true`; bộ lọc Museum chọn Ẩn Chính hiển thị đúng 22 hiện vật; hover/pointer chỉ thay transform trang trí, không chặn link/CTA.
- **Responsiveness:** Kiểm tra đủ bảy route tại mobile; một `h1`, đúng scene route, `overflow-x: clip`. Ba route đại diện có ảnh chụp cuối và không có chồng chữ sau iteration 2.
- **Accessibility:** Lớp trang trí `aria-hidden`, ảnh trang trí `alt=""`, nội dung DOM giữ thứ tự đọc; reduced-motion tắt entrance, idle, tilt và parallax; menu/filter giữ semantic button và focus hiện hữu.
- **Console:** Không có error/warning trên cả bảy route desktop và ba route mobile đại diện.

## Focused region comparison

Không cần crop chi tiết riêng: source board chỉ đặc tả Hero và component label ở cấp hệ thống. Bảy ảnh desktop riêng đã được mở để kiểm tra headline, nhãn giấy, crop hiện vật và khung tiền cảnh ở kích thước đọc được; ba ảnh mobile riêng kiểm tra wrapping và vùng chạm.

## Comparison history

### Iteration 1

- **P2 · Museum mobile bị dày và giao nhau:** source giữ nhịp rõ giữa copy, nhãn phòng và hiện vật; bản đầu để subheadline, bốn cửa phòng và ba lá chồng cùng vùng giữa.
- **Fix:** tăng riêng Hero Museum lên 720px, đổi cửa phòng thành lưới 2 × 2, hạ và làm dịu sân khấu lá bài.
- **Post-fix evidence:** `qa/kirigami-la-bai-mobile-final.png`; copy kết thúc trước dải nhãn, bốn cửa đọc được và hiện vật nằm sau ở mức opacity 0.52.

### Iteration 2

- **P2 · Khung giấy mobile lên quá cao:** Tarot và Cửa hàng có tiền cảnh chạm subheadline.
- **Fix:** giảm khung tiền cảnh từ 56% xuống 48% chiều cao Hero; sân khấu giảm còn 42%, neo vào đáy và giữ khoảng trống cho copy.
- **Post-fix evidence:** `qa/kirigami-tarot-la-gi-mobile-final.png`, `qa/kirigami-cua-hang-mobile-final.png`.

### Iteration 3

- **P2 · Filter/drop-shadow trang trí có thể tạo overflow ngang 7px trên một số route mobile.**
- **Fix:** giới hạn paint của sân khấu, lùi stage 12px và khóa `overflow-x: clip` chỉ trên `body` có `main[data-page-art]`.
- **Post-fix evidence:** Browser báo `overflowX: clip` ở ba route đại diện; không có phần tử tương tác bị cắt hoặc console error.

## Primary interactions tested

- Mở menu mobile: `aria-expanded` đổi thành `true`.
- Chọn `button[data-filter="major"]`: nút Ẩn Chính có `aria-pressed=true`, bộ đếm và số card hiện đều là 22.
- Điều hướng trực tiếp đủ bảy route ở desktop và mobile; scene Kirigami đổi đúng theo `data-page-art`.
- Kiểm tra console error/warning sau animation trên đủ bảy route desktop.

## Follow-up polish

- P3: Source board dùng hạc và kiến trúc riêng ở một vài màn hình; implementation ưu tiên hiện vật Hường Đông có sẵn để giữ tính xác thực và tải nhẹ. Có thể tạo thêm cutout hạc/đền ở vòng sau nếu cần tăng mức khớp minh họa.
