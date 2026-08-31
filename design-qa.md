# Design QA · Remake 7 sub-page

final result: passed

## Nguồn và bằng chứng

- Source visual truth: `/home/asus/.codex/generated_images/01a05070-9cc0-72b1-9cc8-84796d6938de/exec-d226edc4-3ea6-45a3-8f32-05204e9f6ff9.png` — 1486 × 1058 px.
- Local implementation: `http://localhost:4173/cua-hang/`.
- Full comparison: `docs/design-qa-assets/shop-reference-vs-local.jpg` — source bên trái, local hero + pricing bên phải.
- Focused desktop pricing: `docs/design-qa-assets/shop-pricing-desktop.jpg` — 1521 × 828 px.
- Focused mobile pricing: `docs/design-qa-assets/shop-pricing-mobile.jpg` — 375 × 804 px.
- Additional section evidence: `docs/design-qa-assets/tarot-section-feature.jpg`, `docs/design-qa-assets/history-portrait-grid.jpg` — 1521 × 828 px mỗi ảnh.
- Viewports: desktop 1536 × 1024 CSS px, mobile 390 × 844 CSS px; `devicePixelRatio = 1` trong browser kiểm thử.
- State: dữ liệu seed local, chưa mở bán, menu đóng trừ lần kiểm thử tương tác.

Ảnh so sánh 3000 × 1058 px, chuẩn hóa về hai cột cùng chiều cao 1058 px. Bên implementation ghép hai capture cùng viewport để đối chiếu riêng Hero và ba thẻ giá vì trang thật giữ thêm CTA/chú thích chức năng dưới mỗi thẻ. Capture browser loại phần scrollbar/chrome nên vùng ảnh hữu dụng là 1521 × 828 px trên desktop và 375 × 804 px trên mobile; mật độ vẫn là 1×.

## Findings

Không còn finding P0/P1/P2.

- Typography: headline dùng Fontasia vàng pastel, viền trắng ngà 1.5px; subheadline tách sang Harmoni vàng dịu. Hệ phân cấp khớp visual target và không trùng màu nền.
- Spacing/layout: desktop giữ grid ba cột; mobile về một cột, không tràn ngang ở cả bảy route. Hero cùng ngôn ngữ và cùng chiều cao 430px trên mobile.
- Colors/tokens: nền giấy, đỏ son, xanh sơn mài, vàng pastel và đường viền nâu được gom thành token dùng chung.
- Image quality: giữ đúng tranh sơn mài route hiện có; ba asset shop là ảnh raster 1024 × 768, đúng tỷ lệ 4:3, không watermark/placeholder/CSS art.
- Copy/content: ba mức giá, thành phần gói và trạng thái chưa mở bán nhất quán giữa UI, FAQ và JSON-LD.
- Accessibility/behavior: bảy route đều có một `h1`, một `main`, không thiếu `alt`, không có button/link rỗng; menu mobile mở/đóng; tap target menu 45px; reduced-motion có đường lui; console không có warning/error.

## Comparison history

### Iteration 1

- P2: khoảng trống/cảnh báo nằm giữa Hero và pricing làm thay đổi mạnh bố cục above-the-fold so với mockup; tên gói và giá nằm dưới ảnh thay vì trên ảnh.
- Fix: rút Hero desktop về tối đa 470px; đưa pricing ngay sau Hero; chuyển cảnh báo xuống cuối pricing; đảo thứ tự thẻ thành tên/giá → tính năng → ảnh → CTA.
- Evidence sau sửa: `docs/design-qa-assets/shop-reference-vs-local.jpg` và `docs/design-qa-assets/shop-pricing-desktop.jpg`.

### Iteration 2

- P2: ribbon “Được đề xuất” đè lên tiêu đề Premium ở viewport 390px.
- Fix: tăng `padding-top` riêng cho `.price-tier.is-featured .price-tier-copy` trên mobile.
- Evidence sau sửa: kiểm tra hình học DOM xác nhận không giao nhau; `docs/design-qa-assets/shop-pricing-mobile.jpg`.

## Focused comparison

Focused pass cần thiết vì chữ gói/giá, ribbon Premium, crop ba ảnh sản phẩm và CTA quá nhỏ trong full comparison. Pricing desktop và mobile đã được mở riêng; không thấy crop sai, ảnh vỡ, text overlap hoặc overflow.

## Primary interactions tested

- Điều hướng và menu mobile “Mục lục”.
- CTA “Vào danh sách chờ”.
- Filter/grid trang 78 lá vẫn render đủ và không tràn.
- Chuyển route qua Swup vẫn nạp module chung và không phát sinh console error.

## Follow-up polish (P3)

- Mockup dùng một tranh hero khác sáng và nhiều vàng hơn. Bản local cố ý giữ tranh sơn mài route hiện tại theo yêu cầu, nên khác biệt crop/độ sáng này được chấp nhận.
- CTA dưới từng gói không có trong ảnh mock tĩnh nhưng được giữ để hoàn tất hành trình danh sách chờ; không thực hiện thanh toán hay đặt cọc.
