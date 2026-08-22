# Bảng phân công — từ nay đến khi dự án hoàn thành

Cập nhật 22/08/2026. Ba vai:

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
| — | Gộp repo cũ, CI/CD, chốt an toàn 11 tệp | Claude | ✅ |

### Đợt 0 còn lại

| Mã | Việc | Ai | Phụ thuộc | Nghiệm thu |
|---|---|---|---|---|
| 0.6 | Đọc 54 chỗ trong `rename-report.json` | **Người** | — | Mỗi chỗ: đổi, giữ, hay ghi lý do bỏ qua |
| 0.7 | Duyệt 23 lá trong `folk-conflicts.md` | **Người** | — | Chọn v2.1, giữ neo cũ, hay bỏ trống |
| 0.8 | Đưa 56 Ẩn Phụ lên trang lá | **ChatGPT** | spec đã sẵn | 56 trang đủ 4 khối · 22 Ẩn Chính diff rỗng |
| 0.9 | Tách critical CSS nhúng vào HTML | Claude | — | LCP < 2,5s trên production |
| 0.10 | Hạ TBT 690ms | Claude | — | TBT < 200ms |
| 0.11 | Nguồn của lá XXI: v2.1 sót S09? | **Người** | — | Chốt rồi Claude cập nhật dữ liệu |

**Cổng ra Đợt 0:** LCP < 2,5s · TBT < 200ms · perf ≥ 80 · SEO 100 · a11y 97 · CLS 0 · `verify-live-names` 22/22.

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

| | Việc | Chặn cái gì |
|---|---|---|
| 1 | 54 chỗ `rename-report.json` (0.6) | không chặn gì, nhưng còn nợ |
| 2 | 23 lá `folk-conflicts.md` (0.7) | 0.8 hiển thị neo dân gian |
| 3 | Nguồn lá XXI (0.11) | tính chính xác của khối dẫn nguồn |
| 4 | Cấu trúc URL Đợt 1 (1.1) | toàn bộ Đợt 1 |
| 5 | Duyệt 8–12 bài SEO (1.6) | phát hành nội dung |
| 6 | Duyệt văn hoá 78 lá (3.3) | gỡ nhãn "đang biên tập" |
| 7 | Bấm phát hành mỗi đợt | mọi thứ |

---

## Nguyên tắc không đổi

**Ràng buộc tuyệt đối cho mọi đợt:** SEO 100 · a11y ≥ 97 · CLS 0 · không đổi slug ·
không sửa `render.js`, `light-journey.js`, `site.js`, `motion-gate.js` ·
không thêm thư viện · progressive enhancement.

**Chốt an toàn khi phát hành:** workflow kiểm 11 tệp bắt buộc trước khi build.
Thêm trang mới ở Đợt 1 thì **thêm template đó vào danh sách**.

**Sau mỗi đợt:** chạy `npm run check`, `verify-live-names.mjs`, và Lighthouse.
Không đợt nào được làm tụt số của đợt trước.
