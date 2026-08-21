# CLAUDE.md — Hường Đông Tarot

Đây là dự án văn hóa–sản phẩm số Tarot Việt hóa của Nguyễn Hồng Khang. Hãy giữ tính liên tục của sản phẩm đang chạy, không tái thiết kế từ đầu nếu người dùng không yêu cầu.

## Mục tiêu cốt lõi

- Học Tarot qua liên tưởng huyền sử Việt nhưng giữ logic nền Rider–Waite–Smith.
- Một sử thi liên tục, không phải 78 mẩu chuyện rời.
- Digital first: web và nội dung trước; chỉ sản xuất vật lý sau khi kiểm chứng nhu cầu.
- Phân biệt rõ huyền thoại, sử liệu, khảo cổ và sáng tác; không trình bày suy diễn như sự thật lịch sử.

## Ngôn ngữ thiết kế đã khóa

- Màu chủ đạo: xanh ngọc sẫm, vàng đồng óng, giấy/ngọc trắng ngà; đỏ son chỉ làm điểm nhấn.
- Chất hình: minh họa phẳng kiểu bản in mỹ thuật, nền ngọc, nét đồng cổ, khung giấy ngà, quầng son. Không chuyển sang fantasy 3D hoặc sơn dầu cinematic.
- Trống đồng là “ấn cội nguồn”, xuất hiện như quầng/watermark tinh tế xuyên suốt.
- Chim Lạc chính diện dang hai cánh là “ấn chuyển động”, chỉ xuất hiện ẩn ở nền, viền, hover và điểm chuyển chương.
- Hero dùng đúng Mẫu Liễu Hạnh/The Star, giữ toàn khung tranh và kích thước thị giác khoảng 30%.
- Tứ Bất Tử phải hiện thành một bộ bốn tranh cùng họ hình ảnh: Tản Viên, Thánh Gióng, Chử Đồng Tử, Mẫu Liễu Hạnh. Âu Cơ chỉ là chuẩn mỹ thuật tham chiếu, không thuộc Tứ Bất Tử.
- Motion chậm và tiết chế: parallax nhẹ, ánh đồng quét viền, hạt bụi; tôn trọng `prefers-reduced-motion`.

Đối chiếu `visual-reference/` trước và sau mọi thay đổi UI lớn. Không thay asset đã duyệt bằng ảnh tự sinh nếu chưa được yêu cầu.

## Dữ liệu và tính toàn vẹn

- Bắt buộc giữ đủ 78 ID duy nhất: 22 Ẩn Chính + 56 Ẩn Phụ.
- Ẩn Phụ bắt buộc đủ 4 nhà × 14 hạng: Tre/Wands, Dâu tằm/Swords, Hoa sen/Cups, Bông lúa/Pentacles.
- Chuyển sang Ẩn Chính phải tự bỏ lọc chất; chọn một chất phải chuyển sang Ẩn Phụ.
- Không tự bịa lớp Việt hóa còn thiếu. Khi chưa có nội dung, hiển thị lớp RWS và đánh dấu cần biên tập.
- Không đổi `id` hoặc `slug` chỉ để sửa câu chữ vì URL và analytics phụ thuộc vào chúng.

## Kỹ thuật

- Node.js `>=22.13.0`; dùng `npm ci` theo `package-lock.json`.
- Bản chính: Next 16 + React 19 + TypeScript + Vinext/Vite + Cloudflare Sites/D1.
- Nhánh Firebase nằm độc lập tại `source/firebase-handover/`.
- Giữ ranh giới `UI -> application -> domain`; adapter nằm ở `infrastructure`.
- Không đưa secret vào repo. Dùng file example cho tên biến môi trường.
- Không dùng `any`, không tắt lint để né lỗi, không nuốt lỗi bằng `catch {}`.
- Mọi thay đổi phải qua `npm run lint` và `npm test`.

## Commerce — cấm mở giả

- Thanh toán thật chưa được cấu hình; API phải tiếp tục trả lỗi ổn định khi gateway chưa sẵn sàng.
- Không đánh dấu `paid` từ client hoặc trang redirect; chỉ webhook đã xác minh/đối soát được đổi trạng thái.
- Không tin giá từ client; server phải tính lại.
- Webhook phải kiểm tra chữ ký, chống replay và idempotent trước khi bật cổng thật.
- Màn hình MoMo/chuyển khoản/Visa hiện tại chỉ là visual demo.

## Quy trình mỗi yêu cầu

1. Nêu mục tiêu người dùng, phạm vi, acceptance criteria và nguồn dữ liệu.
2. Đọc file liên quan trước khi sửa; tránh broad rewrite.
3. Giữ bản sắc và hành vi đang chạy trừ phần được yêu cầu thay đổi.
4. Kiểm tra desktop/mobile, bàn phím, focus, reduced motion và không tràn ngang.
5. Chạy lint + test; báo rõ file đã đổi, rủi ro và việc chưa làm.

