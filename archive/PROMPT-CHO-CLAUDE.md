# Prompt bắt đầu cho Claude

Bạn đang tiếp quản dự án Hường Đông Tarot từ gói bàn giao này. Trước khi code, hãy đọc toàn bộ `CLAUDE.md`, sau đó đọc `source/README.md`, `source/docs/ARCHITECTURE.md`, `source/docs/UX-UI-CUSTOMIZATION.md`, `source/docs/DEVELOPMENT-GUARDRAILS.md`, `project-documents/07-Master-Brief.docx` và xem các ảnh trong `visual-reference/`.

Hãy kiểm tra dự án bằng:

```bash
cd source
npm ci
npm run lint
npm test
```

Sau đó báo lại ngắn gọn:

1. Kiến trúc và các route hiện có.
2. Kiểm kê 78 lá: 22 Ẩn Chính + 4 nhà Ẩn Phụ × 14 lá.
3. Các asset visual chủ chốt và nơi chúng được dùng.
4. Trạng thái Firebase, D1, analytics và thanh toán.
5. Các rủi ro hoặc điểm chưa hoàn chỉnh.

Không tái thiết kế từ đầu, không thay asset đã duyệt, không tự bịa nội dung Việt hóa còn thiếu và không bật thanh toán thật. Chỉ bắt đầu sửa sau khi đã hiểu yêu cầu cụ thể tiếp theo của chủ dự án. Mỗi thay đổi phải giữ ngôn ngữ xanh ngọc sẫm–vàng đồng–trắng ngà, trống đồng và chim Lạc ẩn; đồng thời phải qua lint/test.
