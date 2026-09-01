# Nhật ký bàn giao tác vụ

## 01/09/2026 · `feat/kirigami-home-floating-nav`

Phạm vi đã thay đổi:

- Remake riêng Hero trang chủ theo visual Kirigami đã duyệt; thêm bộ ảnh responsive `home-kirigami-480/960/1536.webp`.
- Bỏ thanh header/menu ngang trên trang chủ nhưng giữ logo Hường Đông ở góc trái.
- Chuyển bảy đường dẫn chính thành thẻ giấy cùng màu nền ở mép phải Hero; tablet/mobile dùng hàng cuộn ngang.
- Giữ nguyên nội dung copy, CTA, thống kê, entrance/fade và hiệu ứng chiều sâu; bổ sung reduced-motion cho thẻ mới.
- Cập nhật preload/build và test theo asset Hero mới.
- Bổ sung bằng chứng QA tại `qa/home-kirigami-*.png` và báo cáo `design-qa.md`.

Không thay đổi:

- Không sửa bảy sub-page, dữ liệu bài/truyện, giá cửa hàng hoặc tranh sơn mài của các route bên trong.
- Không merge `main`, không deploy Firebase/Sites và không thay đổi workflow GitHub.

Điểm tránh giẫm chân:

- CSS bỏ header được khóa bằng `body:has(main[data-page="home"])`; không chuyển selector này thành global.
- Navigation cũ vẫn tồn tại trong layout để bảy sub-page tiếp tục dùng; trang chủ chỉ ẩn nó bằng CSS.
- Không ghi đè ba asset `home-kirigami-*.webp` nếu chưa cập nhật đồng thời preload trong `scripts/build.js` và các test Hero.

## 31/08/2026 · `feat/remake-seven-subpages`

Phạm vi đã thay đổi:

- Thêm hệ CSS chung cho bảy nhóm trang trong: `public/assets/css/subpage-remake.css`.
- Thêm chuyển động chiều sâu có reduced-motion: `public/assets/js/ui/subpage-motion.js`; đăng ký qua `public/assets/js/page/registry.js`.
- Giữ nguyên toàn bộ tranh route trong `public/assets/img/subpage/` và logic `PAGE_ART`.
- Bổ sung minh họa tiểu mục cho Tarot là gì, Trải bài, Healing, Huyền sử bằng ảnh bài/chân dung hiện có.
- Bổ sung subheadline cho Chuyện Hường Đông.
- Làm lại Cửa hàng với ba gói 390.000đ / 690.000đ / 990.000đ, Product JSON-LD nhiều Offer và ba ảnh sản phẩm riêng.
- Cập nhật critical CSS và test để khung đầu không đổi màu sau khi stylesheet đầy đủ tải xong.
- Thêm bằng chứng QA tại `docs/design-qa-assets/` và báo cáo `design-qa.md`.

Không thay đổi:

- Không sửa nội dung dữ liệu 78 lá, 34 truyện LNCQ, bài viết hoặc tranh sơn mài route hiện có.
- Không deploy Firebase, không merge `main`, không thay đổi workflow GitHub.
- Báo cáo QA trang chủ trước đó vẫn nằm trong lịch sử Git tại `c238b7b:design-qa.md`; tệp gốc hiện chứa báo cáo mới nhất theo hợp đồng Product Design.

Điểm tránh giẫm chân:

- Giá sản phẩm phải sửa ở `PACK_TIERS`; `PACK_PRICE` tiếp tục đại diện Premium để giữ tương thích trang chủ.
- Hero trang trong được override cuối cùng bởi `subpage-remake.css`; không chỉnh riêng từng route trừ khi có yêu cầu thiết kế mới.
- Ba asset shop `*-pack-v1.png` là raster đã chốt cho PR này; không ghi đè nếu tác vụ khác đang làm phiên bản v2.
