# Roadmap Hường Đông — và cách chia việc với ChatGPT

Cập nhật 24/08/2026. Tài liệu này là bản hợp đồng chung: cả người, Claude và ChatGPT
đều đọc từ đây. Sửa roadmap thì sửa file này, đừng giữ bản riêng ở chỗ khác.

---

## 0 · Trạng thái thật

### Đã xong

| Hạng mục | Bằng chứng |
|---|---|
| Sao lưu mã nguồn đang chạy | `main` @ `20ac199` — trước đó chỉ có một bản trên ổ đĩa |
| Nguồn dữ liệu chuẩn 78 lá | 22 lá (352/352 trường) + 56 lá (560/560), sinh từ DOCX v2.1 |
| Cổng kiểm dữ liệu | `npm run check` — 0 lỗi |
| Đổi tên 16 Ẩn Chính | PR #1, 41 dòng đổi, không đụng tên chương LNCQ |
| `motion-gate.js` | 15/15 test |
| Codemod | 12/12 test, 5 lớp bảo vệ |

### Chưa xong — và một mắt xích dễ hiểu nhầm

> **Cập nhật 24/08/2026:** mắt xích dưới đây ĐÃ nối. 0.2 sinh `seed/cards.json` từ nguồn
> chuẩn, 0.3 đã seed và phát hành ngày 21/08, và `verify-live-names.mjs` trả 22/22 trên
> site thật. Giữ lại phần mô tả vì chuỗi dữ liệu và cảnh báo `{ merge: true }` vẫn đúng.

**Đổi tên trong `seed/cards.json` CHƯA làm site đổi theo.** Chuỗi dữ liệu thật là:

```
tools/content/major-arcana.mjs   (nguồn chuẩn mới, chưa nối)
        ↓  chưa có bước này
seed/cards.json                  ← PR #1 đổi ở đây
        ↓  npm run seed
Firestore collection "cards"     ← site thật đọc từ đây
        ↓  npm run build
dist/  →  firebase deploy
```

`scripts/build.js` đọc lá từ Firestore, không đọc `seed/cards.json` (file đó chỉ dùng khi
`USE_SEED_DATA=true` để dựng cục bộ). Muốn tên mới lên site phải chạy `npm run seed` rồi
`npm run deploy`.

**Cảnh báo trước khi seed:** `seed.js` ghi bằng `{ merge: true }`. Trường nào có trong
`seed/cards.json` sẽ **đè** lên Firestore — kể cả khi ai đó đã sửa trường đó trong `/admin/`.
Trường không có trong seed thì giữ nguyên. Nên trước khi seed, cần xuất Firestore ra so một
lần, xem có nội dung nào chỉ tồn tại ở Firestore mà seed sẽ xoá mất không.

---

## 0b · Đã làm xong trong Đợt 0 (cập nhật 21/08/2026)

| # | Việc | Kết quả đo được |
|---|---|---|
| 0.1 | So Firestore với seed | **Không có trường nào chỉ tồn tại trên Firestore** — seed không xoá mất gì. 346 chỗ bị đè, đều cố ý. |
| 0.2 | Sinh `seed/cards.json` từ nguồn chuẩn | 78/78 lá, cổng chặn 8 trường bất biến |
| 0.4 | Patch hiệu năng | xem bảng dưới |
| 0.5 | Tối ưu ảnh | toàn bộ **19,6 MB → 2,5 MB (87%)**; trang chủ **7,97 MB → 1,80 MB (77%)** |
| 0.8 | Spec cho ChatGPT | `tools/SPEC-0.8-an-phu-tren-trang-la.md` |

### A/B trên cùng một server cục bộ

| | perf | LCP | TBT | CLS |
|---|---|---|---|---|
| Bản cũ | 42 | 11,3 s | 970 ms | 0 |
| **Bản mới** | **78** | **5,0 s** | **180 ms** | 0,003 |

Bản cũ đo cục bộ ra 11,3s trong khi production là 11,9s — server cục bộ đại diện khá sát,
nên phép so này tin được.

**LCP 5,0s vẫn chưa đạt cổng < 2,5s.** Phần còn lại nằm ở CSS chặn render: `main.css` 35KB
+ `theme-dark.css` 22KB. Muốn xuống dưới 2,5s phải tách critical CSS nhúng thẳng vào HTML —
việc riêng, có rủi ro hồi quy, nên tách thành 0.9 chứ không nhét vào đợt này.

Đã thử giảm preload font từ 4 xuống 2 để nhường băng thông cho ảnh hero: **không cải thiện**
(LCP 5,0s cả hai), nên giữ 4.

### Ghi chú về đo đạc

TBT dao động 180 → 410 → 1.080 ms giữa các lần chạy trên cùng một bản build, vì máy chạy
song song nhiều việc. Đừng tin một lần đo đơn lẻ; chạy lại khi máy rảnh.

---

## 1 · Đợt 0 còn lại (cập nhật 24/08/2026)

Bảng chi tiết nay nằm ở `tools/PHAN-CONG.md`; phần này chỉ giữ trạng thái tóm tắt.

**Đã xong từ bản trước:** 0.3 seed + phát hành (21/08) · 0.8 Ẩn Phụ lên trang lá
(PR #3, #12) · 0.9 critical CSS (PR #5) · 0.10 hạ TBT (PR #6) · 0.12, 0.13 palette và
gộp CSS (PR #2, #4) · lớp tên `data/names/vi.toml` (PR #14).

**Còn lại — cả ba đều chỉ người quyết:** 0.7 duyệt 23 lá neo dân gian · 0.11 nguồn lá
XXI · quy tắc tên 56 Ẩn Phụ. Điền thẳng vào `data/names/vi.toml`.

**0.6 không còn 54 chỗ.** Bản `rename-report.json` cũ là kết quả chạy trên repo giả
`_test/regress`, không phải mã thật — test hồi quy ghi đè nó bằng đường mặc định. Quét
thật ngày 24/08: 82 tệp, 2 chỗ có neo (đều bị lớp che vô hiệu hoá), 10 chỗ đọc tay đều
là vai khác, **0 tệp cần sửa**. `verify-live-names.mjs` trả 22/22.

**Cổng ra Đợt 0:** LCP < 2,5s · TBT < 200ms · performance ≥ 80 · SEO vẫn 100 · a11y vẫn 97 ·
CLS vẫn 0 · `verify-live-names.mjs` trả 22/22.

**Đo trên production 24/08 — cổng ĐẠT.** Ba lần chạy Lighthouse mobile: LCP 2,0s / 2,4s /
1,9s · TBT 80ms / 230ms / 10ms · perf 98 / 89 / 99 · SEO 100 · a11y 100 · CLS 0. Lần 2
chạy lúc máy bận nên TBT vọt lên; lần 3 lúc máy rảnh cho 10ms. Bảng đầy đủ ở
`tools/PHAN-CONG.md`.

---

## 2 · Đợt 1 và 2

**Đợt 1 · Trang theo nhu cầu** (3–6 tuần). Mỗi nhu cầu một URL, theo khuôn astrology.com:
`/trai-bai/co-khong/`, `/trai-bai/tinh-yeu/`, `/trai-bai/ba-la/`, `/la-bai-hom-nay/`.
Cộng bài SEO về truyền thuyết và biểu tượng Đông Sơn — thứ không đối thủ nào có.

**Đợt 2 · Thói quen** (2–4 tuần). "Lá Hường Đông hôm nay" không bắt đăng nhập trước khi xem
kết quả; nhật ký cá nhân trên Firebase; chia sẻ kết quả thành ảnh.

Không làm trong hai đợt này: vẽ lại 22 tranh, sản xuất 56 tranh, mở thanh toán, AI reader.

---

## 3 · Chia việc giữa Claude và ChatGPT

### Nguyên tắc rút từ thực tế

Trong đợt vừa rồi, **cả năm bug của codemod đều chỉ lộ ra khi chạy trên mã thật**, không
lộ khi đọc spec:

1. `luocsutocviet.com` — 33 file bên thứ ba nhắc "Lang Liêu"
2. `lncq-chapters.json` — 131KB nhưng 0 ký tự xuống dòng, phá cơ chế neo theo dòng
3. Khối Tứ Bất Tử — có mỏ neo thật nhưng tên đóng vai khác
4. "Hùng Vương" là tiền tố của "Hùng Vương đầu triều"
5. "Trầu Cau" là chuỗi con của tên chương "Truyện Trầu Cau"

Không mô hình nào đoán được năm cái đó từ mô tả. Chúng đến từ việc chạy, xem diff, sửa, chạy lại.

**Do đó:**

> **ChatGPT viết những gì spec nói hết được. Claude làm những gì phải chạy mới biết.**

### Việc hợp với ChatGPT

- Viết component / template mới từ spec đầy đủ (markup + CSS + JS thuần)
- Viết nội dung: bài SEO, mô tả trang theo nhu cầu, copy giao diện
- Viết test fixture và ca kiểm thử từ mô tả hành vi
- Chuyển thể dữ liệu có schema rõ hai đầu
- Phác thảo form admin theo schema đã chốt

### Việc phải là Claude

- Mọi thứ cần **đo**: Lighthouse, kích thước ảnh, thời gian tải
- Mọi thứ chạm **repo thật**: áp patch, codemod, đối chiếu Firestore
- **Kiểm** đầu ra của ChatGPT trước khi vào nhánh
- Việc mà spec chỉ hiện ra sau khi đọc mã đang chạy

### Việc chỉ người quyết

- Ranh giới văn hoá – lịch sử (23 lá Ẩn Phụ, 54 chỗ đọc tay)
- Đặt tên, giọng văn, thứ tự ưu tiên sản phẩm
- Bấm nút deploy

---

## 4 · Quy trình bàn giao

```
Người chốt việc
      ↓
Claude viết spec đầy đủ  →  ChatGPT viết code  →  Claude kiểm & tích hợp
      ↓                                                   ↓
  nhánh riêng  ←────────────────────────────────  npm run check + Lighthouse
      ↓
   PR để người xem diff
```

**Spec giao cho ChatGPT phải có đủ bốn phần** — mẫu ở `tools/../PROMPT-ChatGPT-Dot-0.md`:

1. Mã nguồn hiện tại, trích nguyên văn — đừng để nó đoán
2. Ràng buộc tuyệt đối: SEO 100, a11y 97, CLS 0, không đổi slug, không sửa
   `light-journey.js`, giữ progressive enhancement
3. Tiêu chí nghiệm thu đo được bằng số
4. Yêu cầu nó khai **giả định** và **tự kiểm** lại từng ràng buộc

**Đầu ra của ChatGPT không vào `main` trực tiếp.** Luôn qua nhánh, luôn chạy
`npm run check` và Lighthouse trước khi mở PR.

### Việc đầu tiên giao ChatGPT: 0.8 · Nối 56 Ẩn Phụ vào trang lá

Dữ liệu đã sẵn ở `tools/content/minor-arcana.mjs` (56 lá, 560/560 trường). Trang
`/la-bai/<slug>/` hiện chỉ hiện nghĩa RWS trơ. Cần: khối chủ thể + cảnh, khối theo thứ bậc
(tình yêu / công việc / tài chính / sức khoẻ), lời khuyên, cảnh báo, và nhãn nguồn.

Việc này hợp ChatGPT vì schema đã cố định hai đầu, template `card-detail.html` đọc được
nguyên văn, và tiêu chí nghiệm thu rõ: 56 trang render đủ trường, a11y không tụt, CLS vẫn 0.
