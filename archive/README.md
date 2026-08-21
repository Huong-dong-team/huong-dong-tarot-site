# Bàn giao website Hường Đông Tarot cho Claude

Ngày đóng gói: 09/08/2026  
Website tham chiếu: https://huong-dong-tarot.hongkhang21998.chatgpt.site/#tham-gia

## Trong gói này có gì

- `source/`: toàn bộ mã nguồn đang dùng để xây dựng website, mã nguồn Firebase song song, asset hình ảnh, dữ liệu, tài liệu kỹ thuật và kiểm thử.
- `visual-reference/`: ảnh chụp toàn landing page, khu thư viện bài và khu tham gia để đối chiếu khi Claude sửa giao diện.
- `project-documents/`: Master Brief, bảng ý tưởng Ẩn Chính, báo cáo tiền khả thi, phản biện, roadmap và kế hoạch kinh doanh do chủ dự án cung cấp.
- `CLAUDE.md`: chỉ dẫn bắt buộc để Claude Code đọc trước khi thay đổi dự án.
- `PROMPT-CHO-CLAUDE.md`: prompt sẵn dùng khi bắt đầu phiên làm việc với Claude.
- `CHECKSUMS.sha256`: mã kiểm tra tính toàn vẹn của các file bàn giao.

Không đóng gói `node_modules`, cache build, `dist` và lịch sử `.git` vì có thể tái tạo bằng lockfile. Không có private key, service-account, mật khẩu hay khóa thanh toán trong gói. Cấu hình Firebase Web phía client hiện hành có trong source; đây là định danh công khai và quyền truy cập vẫn phải được bảo vệ bằng Firestore Security Rules.

## Chạy bản chính

Yêu cầu Node.js `>=22.13.0`.

```bash
cd source
npm ci
npm run dev
```

Kiểm định trước khi bàn giao lại:

```bash
npm run lint
npm test
```

Kết quả tại thời điểm đóng gói: lint đạt; build đạt; 17/17 kiểm thử đạt.

## Hai hướng phát triển

1. **Tiếp tục bản Sites/Vinext hiện hành**: làm việc ở `source/app`, `source/components`, `source/content`, `source/modules`, `source/public`.
2. **Tiếp tục nhánh Firebase độc lập**: đọc `source/firebase-handover/HANDOVER.md` và `source/firebase-handover/README.md` trước khi dùng.

Không trộn hai hướng triển khai trong cùng một thay đổi nếu chưa có quyết định kiến trúc rõ ràng.

## Trạng thái quan trọng

- Dữ liệu RWS đủ 78 lá, gồm 22 Ẩn Chính và 56 Ẩn Phụ.
- Bốn nhà Ẩn Phụ: Tre, Dâu tằm, Hoa sen, Bông lúa; mỗi nhà đủ 14 lá.
- Tranh Mẫu Liễu Hạnh là hero; hiển thị khoảng 30% và không crop mất khung.
- Trống đồng là ấn cội nguồn xuyên suốt; chim Lạc dang hai cánh là lớp ấn ẩn thứ hai.
- Thanh toán thật đang khóa có chủ đích. Màn hình MoMo, chuyển khoản và Visa chỉ là demo UX; không được giả trạng thái thành công.
- `Idea Ẩn chính.xlsx` là tài liệu ý tưởng chưa hoàn chỉnh, không phải nguồn dữ liệu duy nhất. Nguồn kiểm soát 78 lá nằm trong mã nguồn và kiểm thử.
- Bản quyền: © 2026 NguyenHongKhang. All rights reserved. Không phải mã nguồn mở.

## Nơi sửa nhanh

| Muốn thay đổi | Nơi bắt đầu |
| --- | --- |
| Landing page | `source/app/(site)/page.tsx` |
| Màu, font, khoảng cách toàn cục | `source/app/globals.css` |
| CSS riêng landing | `source/styles/landing.module.css` |
| Nội dung thương hiệu | `source/content/site.ts` |
| Dữ liệu bài | `source/content/cards.ts`, `source/content/rws-cards.ts` |
| Registry visual | `source/content/site-visuals.ts`, `source/content/major-arcana-visuals.ts` |
| Ảnh dùng trên web | `source/public/images/` |
| Ẩn Phụ và bộ lọc | `source/components/landing/card-explorer.tsx`, `minor-arcana-face.tsx` |
| Commerce | `source/modules/checkout/`, `source/content/products.ts` |
| Quy tắc phát triển | `source/docs/DEVELOPMENT-GUARDRAILS.md` |

## Thứ tự Claude nên đọc

1. `CLAUDE.md`
2. `source/README.md`
3. `source/docs/ARCHITECTURE.md`
4. `source/docs/UX-UI-CUSTOMIZATION.md`
5. `source/docs/DEVELOPMENT-GUARDRAILS.md`
6. `project-documents/07-Master-Brief.docx`
7. Các ảnh trong `visual-reference/`
