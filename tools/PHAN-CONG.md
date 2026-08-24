# Bảng phân công — từ nay đến khi dự án hoàn thành

Cập nhật 24/08/2026. Ba vai:

| Vai | Làm gì | Vì sao |
|---|---|---|
| **Claude** | Việc cần **đo**, việc chạm **repo thật**, và **kiểm** đầu ra của ChatGPT | Cả năm bug của codemod chỉ lộ khi chạy trên mã thật, không lộ khi đọc spec |
| **ChatGPT** | Việc mà spec nói hết được: component, nội dung, chuyển thể dữ liệu có schema rõ hai đầu | Không truy cập repo, không đo được, nhưng viết code từ spec đầy đủ thì tốt |
| **Người** | Ranh giới văn hoá, đặt tên, giọng văn, thứ tự ưu tiên, và bấm nút deploy | Không test nào thay được |

Quy trình cố định: **Claude viết spec → ChatGPT viết code → Claude kiểm và tích hợp → nhánh riêng → PR → Người merge.**
Đầu ra ChatGPT không vào `main` trực tiếp.

---

## Đợt 0 — Nền móng · ĐÃ XONG phần máy làm được

| Mã | Việc | Ai | Trạng thái |
|---|---|---|---|
| 0.1 | So Firestore với seed, liệt kê trường sẽ bị đè | Claude | ✅ không có trường mồ côi |
| 0.2 | Sinh `seed/cards.json` từ nguồn chuẩn v2.1 | Claude | ✅ 78/78, cổng chặn 8 trường bất biến |
| 0.3 | Seed Firestore + phát hành | Claude + Người | ✅ 21/08, 22/22 tên đúng trên site |
| 0.4 | Patch hiệu năng | Claude | ✅ LCP 11,9s → 3,2s |
| 0.5 | Tối ưu ảnh | Claude | ✅ 19,6 MB → 2,5 MB |
| 0.8 | Đưa 56 Ẩn Phụ lên trang lá | ChatGPT | ✅ PR #3, bù trường trống ở PR #12 |
| 0.9 | Tách critical CSS | Claude | ✅ PR #5 |
| 0.10 | Hạ TBT | Claude | ✅ PR #6 — canvas hạt bụi gỡ hẳn |
| 0.12 / 0.13 | Palette Bình Minh · gộp CSS | Claude | ✅ PR #2, PR #4 |
| — | Gộp repo cũ, CI/CD, chốt an toàn 11 tệp | Claude | ✅ |
| — | Tách lớp tên ra `data/names/vi.toml` | Claude | ✅ PR #14 |

### Đợt 0 còn lại

| Mã | Việc | Ai | Phụ thuộc | Nghiệm thu |
|---|---|---|---|---|
| 0.6 | Duyệt tên 22 Ẩn Chính | **Người** | — | **Không còn 54 chỗ** — xem ghi chú dưới |
| 0.7 | Duyệt 23 lá trong `folk-conflicts.md` | **Người** | — | Chọn v2.1, giữ neo cũ, hay bỏ trống · điền vào `data/names/vi.toml` |
| 0.11 | Nguồn của lá XXI: v2.1 sót S09? | **Người** | — | Chốt rồi Claude cập nhật dữ liệu |

### 0.6 — con số 54 là sai, và vì sao

`rename-report.json` trong repo trước 24/08 là kết quả chạy codemod trên **repo giả**
`_test/regress` (4 tệp), không phải bản quét mã thật: test hồi quy ghi đè tệp đó bằng
đường mặc định. Cả roadmap lẫn bảng này đã hiểu nhầm nó là "54 chỗ cần người đọc".

Bản quét thật trên bề mặt site, ngày 24/08:

| | |
|---|---|
| file quét | 82 |
| chỗ có mỏ neo | 2 — cả hai bị lớp che tiền tố / tên chương vô hiệu hoá |
| chỗ đọc tay | 10 — 8 chỗ Tứ Bất Tử, 2 chỗ là văn kể trong `deck-data.js` |
| file cần sửa | **0** — chạy `--write` trên bản sao cho `git diff` trống |

`verify-live-names.mjs` trả **22/22**. Nghĩa là tên trên site đã đúng hết; 0.6 không
còn việc đổi tên, chỉ còn phần đặt tên và giọng văn nếu bạn muốn xem lại — làm trong
`data/names/vi.toml`.

**Cổng ra Đợt 0 — đo trên production ngày 24/08:**

Ba lần chạy Lighthouse mobile trên `https://huongdong.id.vn/`:

| Tiêu chí | Cổng | Lần 1 | Lần 2 | Lần 3 |
|---|---|---|---|---|
| LCP | < 2,5s | **2,0s** ✅ | **2,4s** ✅ | **1,9s** ✅ |
| TBT | < 200ms | **80ms** ✅ | 230ms ✖ | **10ms** ✅ |
| performance | ≥ 80 | **98** ✅ | **89** ✅ | **99** ✅ |
| SEO | 100 | **100** ✅ | **100** ✅ | — |
| accessibility | ≥ 97 | **100** ✅ | **100** ✅ | — |
| CLS | 0 | **0** ✅ | **0** ✅ | **0** ✅ |
| `verify-live-names` | 22/22 | **22/22** ✅ | — | — |

**Cổng ra Đợt 0 ĐẠT.** Lần 2 chạy khi máy đang bận nên TBT vọt lên 230ms; lần 3 chạy
lúc máy rảnh cho 10ms. Đúng cảnh báo đã ghi sẵn trong roadmap là đừng tin một lần đo
đơn lẻ. LCP đạt ở cả ba lần, không phụ thuộc tải máy. a11y lên 100, cao hơn cổng 97.

Đây là lần đo đầu tiên sau khi 0.9 và 0.10 vào `main` — trước đó con số mới nhất trong
tài liệu là 3,2s của 0.4.

---

## Đợt 1 — Trang theo nhu cầu · 3–6 tuần

Mô hình lấy từ astrology.com: mỗi nhu cầu một URL phẳng. Đây là phương án
duy nhất thật sự tạo tăng trưởng.

| Mã | Việc | Ai | Phụ thuộc | Nghiệm thu |
|---|---|---|---|---|
| 1.1 | Chốt cấu trúc URL và route mới | Claude + **Người** | 0.9 | Danh sách URL cuối, không đổi slug cũ |
| 1.2 | Trang `/trai-bai/co-khong/` | **ChatGPT** | 1.1 | Rút 1 lá, có kết quả Có/Không, chia sẻ được |
| 1.3 | Trang `/trai-bai/ba-la/` | **ChatGPT** | 1.2 | Quá khứ–hiện tại–tương lai |
| 1.4 | Trang `/trai-bai/tinh-yeu/` | **ChatGPT** | 1.2 | Dùng lại khung 1.3 |
| 1.5 | `/la-bai-hom-nay/` — lá mỗi ngày | **ChatGPT** | 1.2 | Cùng một ngày ra cùng một lá |
| 1.6 | 8–12 bài SEO truyền thuyết, Đông Sơn | **ChatGPT** viết, **Người** duyệt | 1.1 | Mỗi bài dẫn nguồn thật, không bịa |
| 1.7 | Sitemap, JSON-LD, canonical cho trang mới | Claude | 1.2–1.6 | Rendered HTML test đạt |
| 1.8 | Gắn Search Console, đặt mốc đo | **Người** | 1.7 | Có dữ liệu 4 tuần đầu |

**Cổng ra Đợt 1:** mỗi intent một URL · có dữ liệu Search Console · perf không tụt dưới 80.

---

## Đợt 2 — Thói quen quay lại · 2–4 tuần

Trusted Tarot có ~75% truy cập trực tiếp nhờ đúng cơ chế này.

| Mã | Việc | Ai | Phụ thuộc | Nghiệm thu |
|---|---|---|---|---|
| 2.1 | Lá hôm nay: xem kết quả trước, mời đăng nhập sau | **ChatGPT** | 1.5 | Không bắt đăng nhập trước khi thấy lá |
| 2.2 | Firebase Auth + luật bảo mật Firestore | Claude | — | Người dùng chỉ đọc/ghi dữ liệu của mình |
| 2.3 | Nhật ký cá nhân: lưu câu hỏi, lá, ghi chú | **ChatGPT** dựng UI · Claude nối dữ liệu | 2.2 | Ghi và đọc lại được, có phân trang |
| 2.4 | Chia sẻ kết quả thành ảnh | **ChatGPT** | 2.1 | Ảnh dùng tranh Hường Đông, chia sẻ được lên Facebook/TikTok |
| 2.5 | Đo tỉ lệ quay lại | **Người** | 2.3 | Có số liệu 4 tuần |

**Cổng ra Đợt 2:** tỉ lệ quay lại đo được · direct traffic tăng · chi phí Firebase trong ngưỡng.

---

## Đợt 3 — Mỹ thuật · tách riêng, không chặn ba đợt trên

Đây là đợt dài nhất và tốn tiền nhất. Không có việc nào cho ChatGPT.

| Mã | Việc | Ai | Nghiệm thu |
|---|---|---|---|
| 3.1 | Vẽ lại 12 lá Ẩn Chính (`REDRAW`/`NEW_CONCEPT`/`EXPERIMENT`) | **Hoạ sĩ** | Theo `mainScene` + `doNotDraw` của v2.1 |
| 3.2 | Sản xuất 56 tranh Ẩn Phụ | **Hoạ sĩ** | Hiện dùng chung phù hiệu nhà |
| 3.3 | Duyệt văn hoá–lịch sử 78/78 lá | **Chuyên gia** | `culturalReviewStatus` → `approved` |
| 3.4 | Cập nhật `imageStatus`, gỡ `artNote`, tăng `assetVersion` | Claude | Không còn lá nào hiện chú thích "đang vẽ lại" |

**Đang chờ:** 68/78 lá có `artNote`, 78/78 lá `culturalReviewStatus: pending`.

---

## Việc chỉ Người làm được — gom một chỗ

Điền quyết định vào `data/names/vi.toml` — mọi mục dưới đây đều có sẵn một khối
`[review.*]` trong đó, chỗ chưa chốt ghi `đang phát triển`.

| | Việc | Chặn cái gì |
|---|---|---|
| 1 | ~~54 chỗ `rename-report.json`~~ (0.6) | **hết nợ** — quét thật cho 0 chỗ cần sửa |
| 2 | 23 lá `folk-conflicts.md` (0.7) | 0.8 hiển thị neo dân gian |
| 3 | Nguồn lá XXI (0.11) | tính chính xác của khối dẫn nguồn |
| 4 | Quy tắc tên 56 Ẩn Phụ | 52/56 lá có `nameVi` không theo quy tắc nào |
| 5 | Cấu trúc URL Đợt 1 (1.1) | toàn bộ Đợt 1 |
| 6 | Duyệt 8–12 bài SEO (1.6) | phát hành nội dung |
| 7 | Duyệt văn hoá 78 lá (3.3) | gỡ nhãn "đang biên tập" |
| 8 | Bấm phát hành mỗi đợt | mọi thứ |

**Bằng chứng mới cho mục 3.** `verify-live-names.mjs` ngày 24/08 cho 21/22 nguồn trích
khớp. Lá lệch là XXI: trang trích *Chương 10 · Truyện Bạch Trĩ*, còn dữ liệu có S02
Truyện họ Hồng Bàng · S07 Truyện Bánh chưng · S08 Truyện Dưa hấu · S14 Truyện Núi Tản
Viên. Đây đúng là câu hỏi 0.11 — nay có số liệu để chốt.

---

## Nguyên tắc không đổi

**Ràng buộc tuyệt đối cho mọi đợt:** SEO 100 · a11y ≥ 97 · CLS 0 · không đổi slug ·
không sửa `render.js`, `light-journey.js`, `site.js`, `motion-gate.js` ·
không thêm thư viện · progressive enhancement.

**Chốt an toàn khi phát hành:** workflow kiểm 11 tệp bắt buộc trước khi build.
Thêm trang mới ở Đợt 1 thì **thêm template đó vào danh sách**.

**Sau mỗi đợt:** chạy `npm run check`, `verify-live-names.mjs`, và Lighthouse.
Không đợt nào được làm tụt số của đợt trước.
