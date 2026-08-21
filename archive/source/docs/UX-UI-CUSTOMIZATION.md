# Chỉnh UX/UI cho người mới

## Đổi visual system trong 15 phút

Mở `app/globals.css` và chỉ sửa nhóm token đầu file:

- `--color-*`: bảng màu thương hiệu.
- `--font-*`: được cấu hình trong `app/layout.tsx`.
- `--radius-*`: độ bo góc.
- `--space-section`: khoảng cách dọc toàn trang.
- `--shell`: chiều rộng nội dung tối đa.

Không rải màu hex mới trong component. Nếu cần màu mới, tạo token có tên theo vai trò, không theo sắc độ (`--color-warning`, không phải `--yellow-500`).

## Đổi nội dung mà không chạm layout

- Navigation, các chương và bốn nhà: `content/site.ts`.
- Lá demo: `content/cards.ts`.
- Tier, giá, tiền cọc, cấu phần: `content/products.ts`.
- 78 lá RWS truyền thống: `content/rws-cards.ts`.
- 12 cung và liên hệ Tarot: `content/astrology.ts`.
- Huyền sử và nhãn bằng chứng: `content/folklore.ts`.

Giữ nguyên `id` và `slug` khi chỉ sửa câu chữ; analytics và link có thể phụ thuộc vào chúng.

## Component rule

- Một component có một lý do thay đổi.
- Page quyết định thứ tự section; component quyết định cách render một khối.
- Không đặt luật tính tiền trong JSX/CSS.
- Không sao chép card; mở rộng `ProductCard` bằng props hoặc tạo variant có tên rõ.
- Mọi control dùng phần tử HTML thật (`button`, `input`, `select`) và có nhãn.

## Responsive checklist

Kiểm tra tối thiểu 320px, 390px, 768px, 1024px và 1440px:

- Không tràn ngang hoặc che CTA.
- Focus keyboard nhìn thấy rõ.
- Chữ không nhỏ hơn 16px cho nội dung chính.
- CTA quan trọng có vùng chạm tối thiểu khoảng 44px.
- Tôn trọng `prefers-reduced-motion`.
- Ảnh có `alt`; ảnh trang trí để `alt=""`.

## SEO content rule

Mỗi lá công khai có URL riêng, title/description riêng và nội dung render server-side. `/tarot-rws` là lớp tra cứu truyền thống bằng câu chữ và SVG nguyên bản. Bộ 78 diễn giải Việt hóa độc quyền của Hường Đông vẫn tách khỏi lớp tra cứu này và chỉ công khai theo kế hoạch IP/chiến dịch.
