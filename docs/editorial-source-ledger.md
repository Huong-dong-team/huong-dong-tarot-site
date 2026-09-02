# Sổ nguồn biên tập nội dung

## Thứ tự ưu tiên

| Nguồn | Vai trò trong PR1 | Được dùng để làm gì | Không được dùng để làm gì |
| --- | --- | --- | --- |
| Dữ liệu và template Hường Đông hiện tại | Nền sản phẩm | Giữ route, cấu trúc, thuật ngữ, nguồn gắn với từng lá | Không mặc nhiên coi nội dung lặp/khuôn mẫu là đã duyệt |
| `linh-nam-chich-quai-ban-hieu-chinh.docx` | Văn bản đối chiếu | Kiểm tra nhịp kể, mô-típ và 34 truyện nguồn | Không chép câu văn dài vào nội dung lá nếu chưa ghi nguồn |
| `data/lncq-chapters.json` | Nguồn vận hành | Hiển thị 34 truyện và đối chiếu với bản DOCX | Không tự suy ra chi tiết lịch sử ngoài văn bản |
| Kho Mystic House gần nhất | Bản đồ chủ đề | Kiểm tra độ phủ kiến thức dành cho người mới | Không dịch, phỏng dịch, bắt chước bố cục câu hoặc dùng làm thẩm quyền |
| Met Museum và V&A | Mốc lịch sử Tarot | Kiểm chứng nguồn gốc, cấu trúc và hệ RWS | Không mở rộng sang tuyên bố trị liệu hoặc bói đoán |

## Kết quả đối chiếu nguồn người dùng cung cấp

- Bản DOCX có 34 chương; nội dung chuẩn hóa trùng với
  `data/lncq-chapters.json`. PR1 không nhập lại để tránh tạo bản sao và sai lệch.
- Kho Mystic House có các cụm bài cho người mới, cấu trúc bộ bài, Ẩn
  Chính/Ẩn Phụ, bốn chất, cách đặt câu hỏi, trải 1/3/5 lá, nghĩa ngược, chọn và
  bảo quản bộ bài. PR1 chỉ dùng danh sách này để phát hiện chủ đề còn thiếu.
- Nội dung sản phẩm, kết quả tìm kiếm, lời quảng cáo và các khẳng định không có
  nguồn trong kho Mystic House bị loại khỏi phạm vi tham khảo.

## Nguồn kiểm chứng lịch sử

- The Metropolitan Museum of Art, “Before Fortune-Telling: The History and
  Structure of Tarot Cards”:
  <https://www.metmuseum.org/perspectives/tarot-2>
- Victoria and Albert Museum, “A history of tarot cards”:
  <https://www.vam.ac.uk/articles/tarot-cards>

Khi hai nguồn hoặc danh mục xuất bản dùng mốc năm khác nhau, nội dung công khai
ưu tiên cách viết không gây tranh chấp giả, chẳng hạn “đầu thế kỷ XX”.

## Quy tắc chống sao chép

Nội dung Hường Đông phải được viết lại từ ý niệm, không viết cạnh văn bản tham
khảo rồi thay từ đồng nghĩa. Script `scripts/audit-editorial-content.mjs` có thể
đối chiếu các chuỗi từ liên tiếp với kho Mystic House tại máy người biên tập:

```bash
MYSTIC_HOUSE_ARCHIVE=/run/media/asus/Data1000/MysticHouse-Toan-Bo/mystichouse.vn \
  npm run audit:content
```

Kiểm tra tự động là một hàng rào, không thay thế lượt đọc của con người. Những
cụm thuật ngữ bắt buộc như tên lá hoặc “22 Ẩn Chính và 56 Ẩn Phụ” phải được xem
trong ngữ cảnh thay vì kết luận sao chép chỉ vì trùng một cụm ngắn.

