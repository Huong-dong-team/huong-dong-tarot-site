# Bản thử Embla cho hero

## Cách chạy

Build và mở website cục bộ, sau đó chạy trong Console của trang chủ:

```js
const { mountEmblaHeroPrototype } = await import("/assets/js/hero-embla-prototype.js");
window.heroEmblaTrial = await mountEmblaHeroPrototype();
```

Khôi phục carousel production mà không tải lại trang:

```js
window.heroEmblaTrial.destroy();
```

Module clone năm slide vào một track riêng. Nó không được import từ `site.js`
hoặc `home.html`, vì một thử nghiệm chưa duyệt không nên làm mọi lượt xem trang
chủ tải thêm mã hoặc thay đổi hành vi đang chạy.

## So sánh

| Tiêu chí | Carousel hiện tại | Bản thử Embla |
|---|---|---|
| Vuốt/kéo | Không | Có, snap và loop |
| HTML tĩnh | Slide đầu hiện đúng nhờ `.is-active` | Track ngang chỉ đúng sau khi JS và CSS thử nghiệm chạy |
| Điều hướng chấm | Đã có | Phải dựng lại và đồng bộ với `select` |
| Tự chuyển | Có, dừng đúng lúc | Cố ý không có để đo riêng giá trị của swipe |
| Reduced motion | Dừng tự chuyển | Tắt kéo; chấm chuyển tức thì |
| Accessibility | Đã quản lý `inert`, `aria-hidden`, `aria-current` | Phải viết lại cùng các trạng thái đó |
| Chi phí | Không thêm thư viện | Thêm khoảng 18 KB Embla và CSS/adapter |

## Kết luận đề xuất

Chưa nên thay carousel production. Embla cải thiện thao tác cảm ứng, nhưng phần
còn lại là chức năng repo đã có; đổi engine buộc viết lại CSS track, vòng đời
dialog, dots và trạng thái accessibility. Quan trọng hơn, CSS Embla làm mọi
slide tham gia track, trái với progressive enhancement hiện tại chỉ cần slide
đầu `.is-active` là hero hoàn chỉnh khi JavaScript chết.

Chỉ nên cân nhắc chuyển nếu thử trên điện thoại thật cho thấy người dùng nhận ra
và sử dụng thao tác vuốt đủ nhiều để bù thêm mã cùng độ phức tạp bảo trì. Nếu
chuyển, phải giữ một lớp CSS mặc định hiển thị slide đầu và chỉ đổi sang track
ngang sau khi module thêm một lớp `is-embla-ready`.
