# Kế hoạch 0.12 — Đổi toàn bộ bảng màu sang bản Bình Minh

Lập 24/08/2026. Đọc cùng `tools/ROADMAP.md` và `tools/PHAN-CONG.md`.
Mọi con số trong tài liệu này đo trực tiếp trên repo và trên `huongdong.id.vn` ngày 24/08/2026,
không lấy lại từ tài liệu cũ.

---

## 0 · Đã kiểm gì trước khi lập kế hoạch

| Kiểm | Cách kiểm | Kết quả |
|---|---|---|
| Repo local có khớp production không | Tải `main.css`, `theme-dark.css` từ site, so byte với repo | **Khớp tuyệt đối** — 36.163 và 22.740 byte. Repo `newrepo/` chính là bản đang chạy. |
| Cổng dữ liệu còn xanh không | `npm run build:local` + `npm test` | ✅ 78 trang lá, 85 URL, **22/22 test đạt** |
| 0.3 seed + deploy đã lên chưa | `GET /la-bai/justice/` | ✅ `<h1>Tô Lịch Giang Thần / Long Đỗ</h1>` — tên v2.1 đã live |
| 0.8 (56 Ẩn Phụ) đã lên chưa | `GET /la-bai/two-of-cups/` | ❌ **Chưa** — 0/4 khối mới, trang vẫn chỉ có nghĩa RWS xuôi/ngược |
| Đợt 1 đã bắt đầu chưa | `GET /la-bai-hom-nay/`, `/trai-bai/co-khong/` | ❌ Cả hai **404** |
| Quy mô màu cứng | `grep` toàn bộ CSS/JS/template | **173 giá trị màu** (137 trong phạm vi), chỉ **13** nằm trong `:root` |
| Bảng màu mới | Lấy pixel từ ảnh brand board 852×734 | 8 màu chính + 4 màu nhà, xem §3 |
| Tương phản | Tính WCAG 2.1 cho từng cặp | **8/8 màu thương hiệu KHÔNG đủ tương phản làm chữ** — xem §4 |
| Tranh hero có hợp bảng màu mới không | Lấy màu trung bình `hero-800.webp` | `#9E9E85`, vùng sáng `#F6E6CB` — **đã là kem sẵn** |

---

## 1 · Việc này nằm ở đâu trong lộ trình

**Nói thẳng: không nằm ở đâu cả.** Bốn tài liệu (`Roadmap`, `Bốn phương án`, `Kiểm kê`,
`Hiệu ứng`) không có một dòng nào về đổi bảng màu. Đây là hạng mục **mới**, và nó cạnh tranh
thời gian với Đợt 1 — thứ mà `Bốn phương án` gọi là *"phương án duy nhất thật sự tạo tăng trưởng"*.

Nhưng có ba lý do làm **ngay bây giờ**, đúng theo logic mà chính tài liệu `Bốn phương án` đã dùng
để xếp A + B trước C:

**1. Đợt 1 sẽ nhân bản bảng màu cũ ra 5 template mới.**
Đợt 1 thêm `/trai-bai/co-khong/`, `/ba-la/`, `/tinh-yeu/`, `/la-bai-hom-nay/` và 8–12 bài SEO.
Đổi màu sau Đợt 1 nghĩa là sơn lại cả những trang vừa sơn xong. Cùng một lập luận
*"Làm sau thì phải sửa lại nội dung đã xuất bản"* ở §4 của `Bốn phương án`.

**2. Nó dùng chung mặt phẳng tệp với 0.9 — việc cuối chặn cổng ra Đợt 0.**
`ROADMAP.md` §0b ghi rõ: LCP đang 5,0s, chưa đạt cổng < 2,5s, và
*"Phần còn lại nằm ở CSS chặn render: `main.css` 35KB + `theme-dark.css` 22KB"*.
Bảng màu mới bắt buộc phải mở cả hai tệp đó ra. Tách làm hai lần là mở hai lần.

**3. Đây là lần duy nhất `theme-dark.css` có thể biến mất mà không mất gì.**
Xem §2 — tệp này tồn tại **chỉ để đảo ngược** `main.css`. Bảng màu mới làm nó thành thừa.

**Không làm gì:** không hoãn 0.6, 0.7, 0.11 (việc của Người) để chờ palette. Chúng chạy song song,
không đụng tệp nào chung.

### Thứ tự đề nghị

```
0.12  (ChatGPT)  Lớp token + đổi màu, giữ nguyên bố cục     ← prompt đã viết sẵn
   ↓
0.13  (Claude)   Gộp theme-dark.css vào main.css, xoá tệp
   ↓
0.9   (Claude)   Tách critical CSS, đo LCP < 2,5s           ← cổng ra Đợt 0
   ↓
Đợt 1 (ChatGPT)  Trang theo nhu cầu — dựng thẳng trên bảng màu mới
```

0.8 (56 Ẩn Phụ) **không chờ** 0.12: nó sửa `templates/card-detail.html` và `scripts/build.js`,
không đụng CSS màu. Hai việc giao ChatGPT song song được, khác nhánh.

---

## 2 · Quy mô thật — đo bằng grep, không ước lượng

```
public/assets/css/main.css        53 hex (32 riêng biệt) + 41 rgb/rgba
public/assets/css/theme-dark.css  23 hex (16 riêng biệt) + 19 rgb/rgba
public/assets/css/admin.css       36 hex (24 riêng biệt)
templates/_layout.html             1 hex  (<meta name="theme-color" content="#0b332e">)
public/assets/js/*.js              0
scripts/*.js                       0
────────────────────────────────────────────────────────────
           trong phạm vi 0.12:  137 giá trị màu · 13 trong :root
           ngoài phạm vi:        36 (admin.css — trang quản trị, để sau)
```

**Điều này quyết định cách làm.** Không thể đổi bảng màu bằng cách sửa `:root`:
90% giá trị màu nằm rải trong thân tệp. Bước một của 0.12 là **kéo hết 137 giá trị về token**,
rồi mới thay giá trị token. Làm ngược lại sẽ ra một trang nửa kem nửa xanh.

### `theme-dark.css` là lớp đảo ngược, không phải chủ đề tuỳ chọn

`_layout.html` nạp **cả hai tệp trên mọi trang**, không có điều kiện:

```html
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/theme-dark.css">
```

`main.css` khai một chủ đề **sáng** (`--ivory: #f5eedf` làm nền, `--ink: #18201d` làm chữ).
`theme-dark.css` mở đầu bằng đúng một khối đảo vai:

```css
:root {
  --ink: #f5eedf;    /* chữ chính  (trước là nền) */
  --paper: #0b332e;  /* nền phụ    (trước là giấy) */
  --ivory: #082824;  /* nền chính  (trước là chữ) */
}
```

Nghĩa là site đang tải 36KB chủ đề sáng rồi đè lên 22KB để làm nó tối lại — trên **mọi** lượt
truy cập, ở đường chặn render. Bảng màu Bình Minh là một chủ đề **sáng**. Khi 0.12 xong,
`theme-dark.css` chỉ còn phần typography và cấu trúc; 0.13 gộp nốt phần đó và xoá tệp.

**Đây là khoản lãi lớn nhất:** ~22KB rời khỏi đường chặn render, đúng thứ 0.9 đang cần.

### Một chi tiết dễ hỏng: "hành trình ánh sáng" đang đi ngược chiều

`light-journey.js` nằm trong danh sách **không được sửa**. Nó chỉ ghi hai biến CSS
(`--hd-scroll`, `--hd-hero`), còn phần nhìn thấy được nằm ở `theme-dark.css:531`:

```css
body { background-color: color-mix(in oklab, #082824, #041512 calc(var(--hd-scroll) * 62%)); }
```

Cuộn xuống thì trang **tối dần**. Trên nền kem, hiệu ứng này vô nghĩa — và tên thương hiệu
là *Hường Đông*, mặt trời mọc. Bản mới đảo chiều ẩn dụ: cuộn xuống thì trời **hửng dần**,
kem → vàng nhạt. Vì JS chỉ ghi biến, đảo chiều làm được hoàn toàn trong CSS —
**ràng buộc "không sửa `light-journey.js`" vẫn giữ nguyên.**

---

## 3 · Bảng màu mới — lấy pixel từ brand board

Không màu nào dưới đây là suy đoán; tất cả đọc trực tiếp từ ảnh 852×734.

| Vai | Hex | Lấy ở đâu |
|---|---|---|
| Nền chính (kem) | `#FFFBEB` | nền thẻ brand board |
| Dải nền ấm | `#FFEF9F` | ô swatch 2 · chấm palette 2 |
| Dải nhấn | `#FEE87D` | ô swatch 2 · chấm palette 1 |
| Vàng kim | `#FFD45A` | ô swatch 1 · chữ "Hường" trong logo |
| Cam | `#FFA95A` · `#FF8B5A` | ô swatch 1 |
| San hô | `#FF5A5A` | ô swatch 1 |
| Hồng đào | `#F8966A` | chấm trái |
| Hồng | `#F0557B` | ô swatch 2 · chấm palette 4 |
| Đỏ tím | `#E2407C` | ô swatch 2 · chấm palette 3 |
| Nâu đồng | `#8B6339` | chấm trái |

### Bốn nhà — lấy từ nhãn dưới bốn hình vẽ

| Nhà | Cây | Hex nhãn |
|---|---|---|
| WANDS | Tre | `#46843E` |
| SWORDS | Dâu tằm | `#C0272D` |
| CUPS | Sen | `#E1407C` |
| PENTACLES | Lúa | `#F89E31` |

Brand board dùng **nhãn tiếng Anh** cho bốn nhà. Việc này chạm câu hỏi #3 còn treo trong
`Bốn phương án` §7 (*"Tre / Sen / Dâu tằm / Lúa" hay "Cây Tre / Hoa Sen / Dâu Tằm / Bông Lúa"*).
Xem §7 bên dưới.

### Tranh đã sẵn bảng màu này rồi

Đo `hero-800.webp`: màu trung bình `#9E9E85`, vùng sáng nhất `#F6E6CB`.
Tranh hero là cảnh bình minh **nền kem**, mặt trời san hô, sen hồng, nét vàng, núi rừng xanh.
`suit-sen-400.webp` trung bình `#D8B899` — giấy ấm. `default-og.webp` trung bình `#9F9D85`.

Nói cách khác: **bảng màu mới không phải hướng mới, nó là bảng màu của chính tranh, kéo ra
ngoài giao diện.** Cái đang lệch là CSS, không phải tranh. Hiện `main.css:653` phủ lên bức
tranh bình minh đó một lớp `rgb(4 28 25 / 93%)` — gần như đen.

**Hệ quả: 0.12 không đòi vẽ lại một bức tranh nào.** Xanh jade không biến mất, nó chuyển vai
từ *nền trang* thành *màu nhà Tre* và màu núi rừng trong tranh.

---

## 4 · Phát hiện quan trọng nhất: không màu thương hiệu nào làm chữ được

Tính WCAG 2.1 trên nền kem `#FFFBEB`:

| Màu | Tỉ lệ trên kem | Chữ thường (cần 4.5) |
|---|---|---|
| `#FFEF9F` | 1.12 | ✗ |
| `#FEE87D` | 1.19 | ✗ |
| `#FFD45A` | 1.37 | ✗ |
| `#FFA95A` | 1.83 | ✗ |
| `#F89E31` | 2.04 | ✗ |
| `#F8966A` | 2.12 | ✗ |
| `#FF8B5A` | 2.23 | ✗ |
| `#FF5A5A` | 2.95 | ✗ |
| `#F0557B` | 3.22 | ✗ |
| `#E2407C` | 3.85 | ✗ |
| `#E1407C` | 3.88 | ✗ |
| `#46843E` | 4.37 | ✗ (sát) |
| `#C0272D` | 5.67 | ✅ |
| `#8B6339` | 5.14 | ✅ |

Và chữ **trắng** trên nền màu cũng hỏng: trắng trên `#FF5A5A` = 3.06, trên `#E2407C` = 3.99.
Một nút CTA san hô chữ trắng **trượt a11y**.

Để so: bản đang chạy có `--brass-light #d7ba98` trên `--jade-950 #082824` = **8.49:1**.
Chủ đề tối hiện tại rất an toàn về tương phản. **Bản kem đặt a11y 97 vào rủi ro thật.**

### Cách giải: hai tầng token

Mỗi sắc có hai giá trị. Bản gốc dùng cho **mảng màu** (nền, gradient, trang trí), bản `-ink`
dùng cho **chữ, icon, viền mảnh**. Các giá trị `-ink` dưới đây tính để đạt ≥ 4.5:1 trên nền
**khó nhất** trong hệ (`#FFEF9F`), nên chúng an toàn trên cả ba nền sáng:

| Token | Hex | trên `#FFFBEB` | trên `#FFEF9F` | trên trắng |
|---|---|---|---|---|
| `--coral-ink` | `#DB0000` | 5.05 | 4.51 | 5.23 |
| `--orange-ink` | `#C53B00` | 5.06 | 4.53 | 5.25 |
| `--amber-ink` | `#AD5300` | 5.04 | 4.51 | 5.23 |
| `--gold-ink` | `#8B6600` | 5.06 | 4.53 | 5.25 |
| `--rose-ink` | `#D51343` | 5.06 | 4.52 | 5.25 |
| `--magenta-ink` | `#CF1F61` | 5.04 | 4.50 | 5.22 |
| `--tre-ink` | `#407939` | 5.05 | 4.51 | 5.23 |
| `--dau-ink` | `#C0272D` | 5.67 | 5.07 | 5.88 |
| `--sen-ink` | `#CE2061` | 5.06 | 4.52 | 5.25 |
| `--lua-ink` | `#A15B05` | 5.04 | 4.51 | 5.23 |

Sắc (hue) giữ nguyên, chỉ hạ độ sáng — mắt vẫn đọc ra đúng màu thương hiệu.

### Nút bấm

| Nút | Nền | Chữ | Tỉ lệ |
|---|---|---|---|
| Chính | `--gold #FFD45A` | `--ink #2B1B12` | **11.68** ✅ |
| Nhấn | `--magenta-ink #CF1F61` | trắng | **5.22** ✅ |
| Viền | trong suốt, viền + chữ `--magenta-ink` | — | 5.04 ✅ |

Nút chính vàng-kim + chữ mực vừa an toàn nhất vừa đúng logo (chữ "Hường" là `#FFD45A`).

### Dải bình minh — chốt điểm dừng

`linear-gradient(135deg, #FFD45A, #FF8B5A 55%, #F0557B)` — chữ `--ink` trên dải này đạt
11.68 → 7.17 → **4.96**. Nếu kéo dài tới `#E2407C` thì tụt xuống **4.15 ✗**.
**Dải dừng ở `#F0557B`.**

---

## 5 · Ba PR, chia đúng theo `PHAN-CONG.md`

### 0.12 — ChatGPT · Lớp token + đổi màu

Sửa `main.css`, `theme-dark.css`, một dòng `theme-color` trong `_layout.html`.
Không đụng bố cục, không đụng markup, không đụng JS.
Nghiệm thu đếm được: **0 giá trị màu nằm ngoài khối token**.
Prompt đầy đủ: `tools/PROMPT-ChatGPT-0.12-palette.md`.

### 0.13 — Claude · Gộp hai tệp CSS

Việc này phải chạy mới biết: 159 selector của `theme-dark.css` đè lên `main.css`, gộp sai
độ ưu tiên là hỏng layout ở chỗ không ai ngờ. Claude gộp, so ảnh chụp từng trang, xoá
`theme-dark.css`, sửa `_layout.html`. Cache-busting tự lo — `build.js:155` băm theo nội dung
mọi tệp `/assets/**.css` được nhắc trong HTML, bỏ một tệp không làm hỏng
`tests/cache-busting.test.mjs`.

### 0.9 — Claude · Critical CSS

Sau khi còn một tệp, tách phần màn hình đầu nhúng thẳng vào `<head>`, phần còn lại tải hoãn.
Đo lại Lighthouse mobile. Đây là cổng ra Đợt 0.

**Đầu ra ChatGPT không vào `main` trực tiếp** — nhánh riêng, `npm run check`, `npm test`,
Lighthouse, rồi PR để Người xem diff. Không đổi so với quy trình hiện tại.

---

## 6 · Rủi ro, và thứ CSS không giải được

| Rủi ro | Mức | Xử lý |
|---|---|---|
| **a11y tụt dưới 97** | **Cao** | Hai tầng token ở §4. Claude đo Lighthouse trên 4 loại trang trước khi merge. |
| Còn sót màu jade | Trung bình | Nghiệm thu đếm literal = 0 ngoài token. `grep -E '#(08|0b|12|1b)[0-9a-f]{4}'` phải rỗng. |
| Gộp CSS làm lệch layout | Trung bình | Tách hẳn sang 0.13 cho Claude, không nhét vào 0.12. |
| CLS đổi khi đổi nền | Thấp | Chỉ đổi màu, không đổi kích thước. Test `npm test` bắt được. |
| `.hero-mist`, `.hero-dust` chỉnh cho nền tối | Trung bình | Hạt sáng trên nền kem sẽ vô hình. Xem dưới. |

### Thứ CSS không giải được — cần Người hoặc Hoạ sĩ

1. **Favicon và `apple-touch-icon`** đang là bộ jade/brass cũ. Đổi màu site không đổi được
   file PNG. Cần logo Bình Minh xuất ra 16/32/48/180px. → **Hoạ sĩ**, không chặn 0.12.
2. **Hai font trong brand board — `DFVN Tan Harmoni` và `DFVN Tan Moncheri` — chưa có trong repo.**
   Repo đang tự host Be Vietnam Pro, Cormorant Garamond, Charm. Thêm font mới nghĩa là thêm
   `.woff2` vào đường chặn render, đúng thứ 0.9 đang cố cắt. → **Người quyết**, xem §7 câu 2.
3. **`.hero-dust` (canvas hạt sáng) và `.hero-mist`** thiết kế để sáng trên nền tối. Trên kem
   phải đổi sang hạt tối/vàng đồng hoặc bỏ. Bỏ được thì lãi thêm: `initHeroDust` là rAF
   chạy liên tục, `Hiệu ứng và source code` §2 đã xếp nó vào nhóm nặng nhất. → **Người quyết.**
4. **`default-og.webp`** (ảnh Open Graph) vẫn dùng được — nó là tranh kem, không phải giao diện.

---

## 7 · Ba câu chỉ Người trả lời được

| | Câu hỏi | Chặn cái gì | Đề nghị |
|---|---|---|---|
| 1 | Nhãn bốn nhà: brand board ghi **WANDS / SWORDS / CUPS / PENTACLES** (tiếng Anh), site đang dùng tiếng Việt, và câu #3 trong `Bốn phương án` vẫn treo từ 19/08. Chốt bản nào? | 0.12 (màu nhà), 0.8 (khối Ẩn Phụ), toàn bộ nhãn nhà | Giữ tiếng Việt trên site (**Tre / Dâu tằm / Sen / Lúa**), tiếng Anh chỉ là nhãn nội bộ trong brand board. Đổi sang tiếng Anh sẽ chọi thẳng với `nameFolk` đang live. |
| 2 | Có nhập hai font DFVN không? | 0.9 (LCP) | **Không, chưa.** Để sau khi 0.9 đạt < 2,5s. Dùng chúng cho **logo dạng ảnh SVG** thì được ngay mà không tốn byte font. |
| 3 | `.hero-dust` + `.hero-mist`: đổi màu hay bỏ? | 0.12 | **Bỏ.** Trên nền kem gần như không thấy, mà gỡ được một vòng rAF chạy suốt phiên. |

Ba câu này **không chặn việc bắt đầu 0.12** — prompt đã viết theo giả định ở cột "Đề nghị"
và ghi rõ đó là giả định. Trả lời sau cũng sửa được, mỗi câu một dòng token.

---

## 8 · Cổng nghiệm thu 0.12

```bash
npm run build:local     # 78 trang lá, 85 URL, không lỗi
npm test                # 22/22
grep -cE '#[0-9a-fA-F]{3,8}' public/assets/css/main.css   # chỉ đếm trong khối :root
```

- Không còn literal màu ngoài khối token trong `main.css` và `theme-dark.css`
- `grep -iE '#(082824|0b332e|12463e|1b5b50|916843|b78a4a|d7ba98|9f3f35|f5eedf|fff9ed)'` → **0 kết quả**
- Lighthouse mobile trên `/`, `/la-bai/`, `/la-bai/the-star/`, `/huyen-su/`:
  **a11y ≥ 97 · SEO 100 · CLS 0 · performance không tụt dưới bản hiện tại**
- `verify-live-names.mjs` vẫn 22/22 (không đụng dữ liệu, nhưng chạy để chắc)

Không cổng nào của đợt trước được phép tụt — đúng nguyên tắc cuối `PHAN-CONG.md`.
