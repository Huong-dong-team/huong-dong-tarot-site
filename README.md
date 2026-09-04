# Hường Đông Tarot — mã nguồn website

Repo này phục vụ **huongdong.id.vn**. Từ 21/08/2026 đây là repo duy nhất; repo cũ
`Huong-Dong-Claude-Handover-2026-08-09-update` không còn dùng để phát hành.

Sắp sửa CSS hay bố cục? Đọc `AGENTS.md` trước — desktop, tablet và điện thoại
dùng chung một bộ template và một bộ CSS, nên "làm bản desktop khác bản mobile"
ở đây nghĩa là thêm luật theo khung nhìn chứ không phải tách nhánh giao diện.
Thang breakpoint nằm ở `docs/breakpoints.md`.

## Phạm vi sản phẩm bắt buộc

Hường Đông là website **học Tarot, tra cứu tư liệu và bán sản phẩm**; không phải
dịch vụ bói toán. Điều hướng công khai chỉ tập trung vào 5 khu vực:

1. Tarot là gì
2. Bảo tàng 78 lá
3. Khóa học
4. Bản tin Hường Đông
5. Cửa hàng

Mọi thay đổi mới phải tuân thủ các nguyên tắc sau:

- Loại bỏ hoàn toàn tính năng fortune telling: không rút lá ngẫu nhiên, không
  trải bài trực tuyến, không sinh lời đoán tương lai và không có CTA như
  “Lá bài hôm nay”, “Rút một lá” hoặc “Trải bài ngay”.
- Không giữ lại fortune telling dưới dạng route ẩn, API, JavaScript, biểu mẫu,
  trạng thái kết quả hoặc nội dung có thể được bật lại trên giao diện.
- Nội dung cũ từ `/trai-bai/`, `/healing/` và `/huyen-su/` chỉ được dùng lại như
  tài liệu học Tarot trong `/khoa-hoc/` hoặc tư liệu cho Bảo tàng 78 lá.
- UX copy phải dùng ngôn ngữ học tập, tra cứu, phản tư và kiểm chứng nguồn;
  không hứa hẹn dự đoán vận mệnh hay quyết định thay người đọc.

## Bố cục

```
/                     mã nguồn site — build ra dist/ rồi deploy
  templates/          21 template trang
  data/               lncq-22.json, lncq-chapters.json — lớp dẫn nguồn LNCQ
  public/assets/      css, js, ảnh, font tự host
  scripts/            build.js, seed.js, serve.js
  seed/               dữ liệu mẫu, dùng khi USE_SEED_DATA=true
  tests/              chạy bằng npm test

tools/                bộ công cụ dữ liệu 78 lá (KHÔNG chạy khi build site)
archive/              toàn bộ repo cũ, giữ nguyên để tra cứu — không được build
```

## Lệnh

```bash
npm run build:local   # dựng bằng dữ liệu seed, không cần khoá Firebase
npm run build         # dựng từ Firestore thật
npm test              # 156 kiểm thử (cần chạy build:local trước)
npm run deploy        # build + firebase deploy --only hosting
```

## Phát hành

Bấm tay ở tab **Actions → "Xuất bản website (Firebase)"**. Thứ tự cố ý là
build → test → deploy: kiểm thử hỏng thì workflow dừng và **không** triển khai,
nên trang khách giữ bản cũ đang chạy tốt.

### Kiểm tra riêng desktop và mobile trước khi xuất bản

Desktop và mobile là hai bố cục cần được duyệt độc lập; bản desktop đúng không
đồng nghĩa bản mobile sẽ đúng. Mỗi lần phát hành phải kiểm tra tối thiểu trang
chủ và 5 khu vực chính ở cả hai viewport:

- Desktop: `1440 × 900` (kiểm tra thêm từ `1280px` nếu bố cục sát ngưỡng).
- Mobile: `390 × 844` (kiểm tra thêm `360px` cho màn hình hẹp).

Checklist bắt buộc:

- Điều hướng, logo, headline, CTA và thứ tự nội dung đúng ở từng viewport.
- Không cắt chữ/hình Kirigami, không tràn ngang, không che nội dung và không có
  vùng bấm quá nhỏ trên thiết bị cảm ứng.
- Hiệu ứng chuyển động không gây giật bố cục; hỗ trợ `prefers-reduced-motion`
  và không dùng hover làm cách duy nhất để mở nội dung trên mobile.
- Ảnh đúng tỉ lệ, không tải nhầm tài nguyên desktop quá nặng cho mobile; kiểm
  tra cả trạng thái đang tải và sau khi ảnh tải xong.
- Xác nhận không còn CTA, route hoặc hành vi fortune telling trên cả hai bản.
- Chạy build, type check và test; sau khi deploy phải smoke-test lại trực tiếp
  trên `https://huongdong.id.vn/` bằng desktop và mobile, không chỉ localhost.

Không phê duyệt phát hành chỉ dựa trên một ảnh chụp desktop. Nếu desktop và
mobile khác nhau có chủ đích, khác biệt đó phải được ghi trong PR và kèm ảnh QA
của cả hai viewport.

### Chốt an toàn trước khi build

Workflow kiểm 12 tệp bắt buộc và dừng ngay nếu thiếu:

`templates/` — `huyen-su`, `healing`, `tarot-la-gi`, `trai-bai`, `daily-card`, `cua-hang`,
`card-detail`, `card-list`, `home`, `_layout` · `data/` — `lncq-22.json`,
`lncq-chapters.json`

Lý do có bước này: ngày 16/08/2026 workflow từng phát hành từ một cây thiếu 5
template và thiếu hẳn `data/`. Bản đó lên mạng mà không có `/huyen-su/`,
`/healing/`, `/tarot-la-gi/`, `/trai-bai/`, `/cua-hang/`, và mất toàn bộ lớp dẫn
nguồn Lĩnh Nam chích quái. Site chỉ có lại chúng vì ngày 18/08 có người deploy
tay từ máy mình. Bước kiểm này để lỗi đó không lặp lại.

## `archive/` là gì

Toàn bộ nội dung repo cũ, chép nguyên trạng: nhánh Next.js (`archive/source/app`,
`components`, `content`, `db`, `lib`), tài liệu dự án, ảnh tham chiếu. Không có
gì trong `archive/` được build hay deploy. Giữ lại vì đó là công việc đã làm, và
DOCX Big Update từng nhắm vào `source/app/tarot-rws/*` ở nhánh đó.

## `tools/` là gì

Đường ống dữ liệu 78 lá sinh từ DOCX Art Direction v2.1, cùng các cổng kiểm.
Xem `tools/ROADMAP.md`. Chạy độc lập, không ảnh hưởng lúc build site.
