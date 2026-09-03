# Bản đồ content section toàn website

PR1 đặt chuẩn cho toàn bộ nội dung nhưng chỉ sửa sâu những phần nền và tám lá
đại diện. Cách chia đợt này giữ diff có thể duyệt bằng mắt và tránh biến 78 lá
thành một lần sửa hàng loạt không kiểm soát.

| Nhóm nội dung | Nguồn chính | Quyết định PR1 | Đợt tiếp theo |
| --- | --- | --- | --- |
| Trang chủ | `templates/home.html` | Chỉ kiểm kê; không sửa vì PR #65 đang chạm cùng tệp | Đồng bộ copy sau khi PR #65 kết thúc |
| Tarot là gì | `templates/tarot-la-gi.html` | Viết lại sâu: kể trước, lịch sử có nguồn, thuật ngữ cho người mới | Theo dõi phản hồi người học |
| Sổ tay 4 chặng | `templates/huong-dan-*.html` | Người hóa đoạn mở và giữ hướng dẫn thao tác rõ | Bổ sung bài tập/ảnh minh họa nếu cần |
| Trải bài | `templates/trai-bai.html` | Người hóa lời dẫn, giữ ranh giới và chức năng hiện có | Duyệt riêng copy của từng kiểu trải |
| Healing | `templates/healing.html` | Người hóa lời dẫn, giữ nguyên cảnh báo an toàn | Duyệt cùng chuyên gia khi mở rộng sức khỏe tâm thần |
| Bảo tàng 78 lá | `templates/card-list.html`, `seed/cards.json` | Giữ UI; sửa 8 lá đại diện, thêm chuẩn kiểm tra | Chia 70 lá còn lại theo 7 batch × 10 lá |
| Huyền sử | `templates/history.html`, `data/lncq-chapters.json` | Không nhập lại; xác nhận trùng bản DOCX 34 chương | Biên tập dẫn nhập từng truyện, không sửa nguyên văn nguồn |
| Chuyện Hường Đông | `seed/posts.json` | Mở rộng 2 bài nền, thêm cảnh và ví dụ cho người mới | Xây lịch nội dung theo câu hỏi thật của độc giả |
| Giới thiệu | `templates/about.html` | Người hóa lời giới thiệu và nói rõ phương pháp | Thêm quy trình hội đồng biên tập khi có dữ liệu |
| Cửa hàng | `templates/cua-hang.html` | Chỉ rà soát ranh giới giữa nội dung và bán hàng | Biên tập mô tả gói sau khi chốt sản phẩm |
| Chính sách/pháp lý | các template chính sách | Không văn chương hóa; ưu tiên rõ và chính xác | Rà soát pháp lý riêng |

## Tám lá mẫu trong PR1

| Lá | Lý do chọn |
| --- | --- |
| The Fool | Kiểm tra cách kể một khởi đầu mà không cổ vũ liều lĩnh |
| Justice | Kiểm tra ranh giới giữa biểu tượng Việt và dữ kiện lịch sử |
| Death | Kiểm tra cách viết chủ đề dễ gây sợ hãi mà không phán tai họa |
| Ace of Wands | Đại diện Nhà Tre và cách chuyển cảm hứng thành bước đầu |
| Seven of Cups | Sửa nội dung ứng dụng đang lệch khỏi chủ đề lựa chọn/ảo ảnh |
| Three of Swords | Sửa nội dung ứng dụng đang lệch khỏi chủ đề đau lòng/sự thật |
| Ten of Pentacles | Sửa nội dung ứng dụng đang lệch khỏi chủ đề di sản/bền vững |
| Queen of Wands | Đại diện lá hoàng gia và năng lực dẫn dắt ấm áp |

Các trường định danh, slug, hình ảnh, nguồn và trạng thái duyệt văn hóa được giữ
nguyên. PR nội dung không tự nâng `culturalReviewStatus` khi chưa có lượt duyệt
của con người.

## Tiêu chí hoàn tất PR1

- Có chuẩn giọng văn dùng được cho mọi nhóm trang.
- Người mới hiểu cấu trúc 78 lá và có thể thử một lá mà không cần kiến thức sẵn.
- Tám lá mẫu có nghĩa ngược riêng, ứng dụng nhất quán và câu hỏi có thể hành động.
- Hai bài viết không còn là đoạn giới thiệu quá ngắn.
- Có kiểm thử cho câu sáo rỗng, độ đặc thù của lá và cơ chế chống sao chép.
- Build local thành công; không thay đổi UI, dữ liệu nguồn Lĩnh Nam hay production.

## Cầu nối sang Firestore sau khi merge

Production lấy lá bài và bài viết từ Firestore, còn các trang kiến thức lấy nội
dung trực tiếp từ template. Vì vậy, người vận hành cần xuất bản phần dữ liệu của
PR1 trước khi dựng production. Lệnh mặc định chỉ cho xem trước:

```bash
npm run publish:editorial-pr1
```

Sau khi đã merge và xác nhận đúng project, người vận hành mới dùng chế độ ghi:

```bash
EDITORIAL_PUBLISH_CONFIRM="$FIREBASE_PROJECT_ID" \
  npm run publish:editorial-pr1 -- --apply
```

Lệnh này chỉ merge các trường nội dung đã duyệt của tám lá mẫu và hai bài viết.
Lệnh không sửa trường định danh, hình ảnh, nguồn, trạng thái duyệt văn hóa,
`createdAt`, 68 lá còn lại hay cấu hình website.
