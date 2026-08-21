# Roadmap Hường Đông — và cách chia việc với ChatGPT

Cập nhật 20/08/2026. Tài liệu này là bản hợp đồng chung: cả người, Claude và ChatGPT
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

## 1 · Đợt 0 còn lại

| # | Việc | Ai | Vì sao người đó |
|---|---|---|---|
| 0.1 | So Firestore với `seed/cards.json`, liệt kê trường sẽ bị đè | Claude | Cần gọi Firestore thật và đối chiếu, không phải viết code mới |
| 0.2 | Nối `major-arcana.mjs` → sinh `seed/cards.json` | Claude | Phải khớp đúng schema Firestore đang chạy, đọc từ code thật |
| 0.3 | Seed + deploy, đo lại bằng `verify-live-names.mjs` | Claude | Cần chạy và đo |
| 0.4 | Áp patch hiệu năng (`tools/patches/01-03`) | Claude | Patch neo vào file thật; ba bug ở phần này chỉ lộ khi chạy |
| 0.5 | Chạy `build-images.mjs`, đo lại Lighthouse | Claude | Cần `sharp` và đo LCP thật |
| 0.6 | Đọc 54 chỗ "cần người đọc" trong `rename-report.json` | Người | Quyết định biên tập, máy không thay được |
| 0.7 | Duyệt 23 lá trong `folk-conflicts.md` | Người | Như trên |
| 0.8 | Nối 56 Ẩn Phụ vào trang lá | **ChatGPT** | Spec viết đủ được; xem §3 |

**Cổng ra Đợt 0:** LCP < 2,5s · TBT < 200ms · performance ≥ 80 · SEO vẫn 100 · a11y vẫn 97 ·
CLS vẫn 0 · `verify-live-names.mjs` trả 22/22.

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
