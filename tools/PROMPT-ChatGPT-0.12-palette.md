# Spec 0.12 — Đổi toàn bộ bảng màu sang bản Bình Minh

Giao cho ChatGPT. Dán trọn file này. Lập 24/08/2026.

> **TRƯỚC KHI DÁN — đính kèm đúng ba tệp từ repo
> `github.com/hongkhang21998-creator/huong-dong-tarot-site` nhánh `main`:**
>
> | Tệp | Kích thước phải khớp |
> |---|---|
> | `public/assets/css/main.css` | **36.163 byte** |
> | `public/assets/css/theme-dark.css` | **22.740 byte** |
> | `templates/_layout.html` | **3.473 byte** |
>
> Nếu số byte không khớp, dừng lại và báo — nghĩa là bản bạn nhận không phải bản đang chạy.

---

## 1 · Bối cảnh

`huongdong.id.vn` là site tĩnh tự dựng: `templates/` + dữ liệu Firestore → `scripts/build.js`
→ `dist/` → Firebase Hosting. Không framework runtime, không bundler phía client,
không CSS preprocessor. CSS viết tay, nạp thẳng.

Site đang mang bảng màu **xanh jade + vàng đồng + nền tối**. Thương hiệu vừa chốt bảng màu
mới: **nền kem, dải bình minh vàng → cam → san hô → hồng**. Đây là bảng màu lấy thẳng từ
tranh của dự án — đo `public/assets/img/hero-800.webp` cho màu trung bình `#9E9E85`, vùng sáng
`#F6E6CB`; tranh vốn đã là cảnh bình minh nền kem. Cái đang lệch là CSS, không phải tranh.

### Vì sao không thể chỉ sửa `:root`

Đếm bằng `grep` trên bản đang chạy:

```
public/assets/css/main.css        53 hex (32 riêng biệt) + 41 rgb/rgba
public/assets/css/theme-dark.css  23 hex (16 riêng biệt) + 19 rgb/rgba
templates/_layout.html             1 hex
──────────────────────────────────────────────────────────────
                                 137 giá trị màu — chỉ 13 nằm trong :root
```

90% giá trị màu nằm rải rác trong thân tệp. **Việc chính của bạn là kéo hết chúng về token,
rồi mới thay giá trị.** Làm ngược lại sẽ ra một trang nửa kem nửa xanh.

### Hai tệp CSS quan hệ thế nào

`templates/_layout.html` nạp **cả hai, trên mọi trang, không điều kiện**:

```html
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/theme-dark.css">
```

`main.css` khai một chủ đề **sáng**. `theme-dark.css` mở đầu bằng đúng một khối **đảo vai**
để biến nó thành tối. Bảng màu Bình Minh là chủ đề **sáng** — nên khối đảo vai đó phải **xoá**,
không phải đổi màu. Phần còn lại của `theme-dark.css` (typography, cấu trúc hero, hiệu ứng cuộn)
**giữ nguyên**.

Việc gộp hai tệp làm một là việc riêng của người khác, **không phải việc của bạn**.
Giữ đúng hai tệp, đúng tên.

---

## 2 · Việc cần làm

Ba tệp, không hơn:

1. **`public/assets/css/main.css`** — thay khối `:root` bằng hệ token mới ở §4;
   thay **mọi** giá trị màu trong thân tệp bằng `var(--token)`.
2. **`public/assets/css/theme-dark.css`** — xoá khối `:root` đảo vai; giữ mọi thứ khác;
   thay mọi giá trị màu còn lại bằng token; đảo chiều hiệu ứng "hành trình ánh sáng" (§3.4).
3. **`templates/_layout.html`** — đổi đúng một dòng `<meta name="theme-color">`.

**Không đụng:** bố cục, `grid-template`, kích thước, khoảng cách, markup, tên class, JS,
`scripts/`, `templates/` (ngoài một dòng trên), `public/assets/css/admin.css`.

---

## 3 · Mã nguồn hiện tại — trích nguyên văn

### 3.1 · `main.css` dòng 1 — toàn bộ khối `:root` hiện tại

```css
:root{--jade-950:#082824;--jade-900:#0b332e;--jade-800:#12463e;--jade-700:#1b5b50;--ivory:#f5eedf;--paper:#fff9ed;--brass:#916843;--brass-light:#d7ba98;--brass-glow:#b78a4a;--img-radius:clamp(10px,1.4vw,18px);--cinnabar:#9f3f35;--ink:#18201d;--muted:#68716c;--line:rgba(199,150,78,.32);--shadow:0 24px 70px rgba(4,31,27,.16);--display:"Cormorant Garamond",Georgia,serif;--body:"Be Vietnam Pro",Arial,sans-serif;--shell:min(1180px,calc(100% - 32px))}
```

`--img-radius`, `--display`, `--body`, `--shell` **không phải màu — giữ nguyên y hệt.**

### 3.2 · `theme-dark.css` dòng 14–34 — khối phải XOÁ

```css
:root {
  /* Đảo vai trò: jade tối làm nền, ivory làm chữ. */
  --ink: #f5eedf;          /* chữ chính  (trước là nền) */
  --paper: #0b332e;        /* nền phụ    (trước là giấy) */
  --ivory: #082824;        /* nền chính  (trước là chữ) */
  --muted: #9db3aa;        /* chữ phụ, sáng lên cho đủ tương phản trên nền tối */
  --line: rgba(199, 150, 78, 0.28);
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.45);

  /* Nhấn giữ nguyên hệ brass/cinnabar của web online. */
  --brass: #b78a4a;
  --brass-light: #d7ba98;
  --brass-glow: #d8b66a;
  --cinnabar: #c2564a;

  /* YC1: sans công nghiệp làm chữ hiển thị; Charm là điểm nhấn. */
  --display: "Be Vietnam Pro", "Inter", system-ui, sans-serif;
  --body: "Be Vietnam Pro", "Inter", system-ui, sans-serif;
  --script: "Charm", cursive;
}
```

Xoá **sáu token màu đầu và bốn token nhấn**. **Giữ lại `--display`, `--body`, `--script`** —
đó là typography đã chốt, không phải màu. Đặt chúng vào một khối `:root` mới chỉ còn font.

### 3.3 · `main.css` dòng 653–667 — lớp phủ hero

```css
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(90deg,
    rgb(4 28 25 / 93%) 0%, rgb(4 28 25 / 70%) 44%, rgb(4 28 25 / 40%) 100%);
}

@media (max-width: 900px) {
  .hero-overlay {
    background: linear-gradient(180deg,
      rgb(4 28 25 / 90%) 0%, rgb(4 28 25 / 66%) 60%, rgb(4 28 25 / 50%) 100%);
  }
}
```

Đây là lớp phủ **93% gần-như-đen** đặt trên bức tranh bình minh nền kem. Bản mới đảo thành
màn kem, giữ nguyên ba điểm dừng và hai hướng gradient:

```css
background: linear-gradient(90deg,
  rgb(255 251 235 / 92%) 0%, rgb(255 251 235 / 72%) 44%, rgb(255 251 235 / 38%) 100%);
```

và bản dọc dưới 900px theo cùng tỉ lệ (`88% / 64% / 46%`).

### 3.4 · `theme-dark.css` dòng 505–556 — "hành trình ánh sáng"

```css
:root { --hd-scroll: 0; --hd-hero: 0; }

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(120vh 90vh at 72% 12%, rgb(232 201 140 / 13%), transparent 62%),
    radial-gradient(90vh 70vh at 18% 4%, rgb(183 138 74 / 7%), transparent 58%);
  opacity: calc(1 - var(--hd-scroll) * 0.82);
  transition: opacity .5s cubic-bezier(.22, .61, .36, 1);
}

body {
  background-color: color-mix(in oklab, #082824, #041512 calc(var(--hd-scroll) * 62%));
}
```

`--hd-scroll` và `--hd-hero` do `public/assets/js/light-journey.js` ghi.
**Bạn KHÔNG được sửa tệp JS đó** — nhưng bạn không cần: nó chỉ ghi hai con số 0→1,
còn ý nghĩa nằm hết ở CSS.

Hiện tại: cuộn xuống → trang **tối dần** (jade-950 → gần đen).
Bản mới **đảo chiều**: thương hiệu tên là *Hường Đông*, mặt trời mọc — cuộn xuống thì trời
**hửng dần**, kem → vàng nhạt:

```css
body {
  background-color: color-mix(in oklab, var(--paper), var(--paper-band) calc(var(--hd-scroll) * 45%));
}

body::before {
  background:
    radial-gradient(120vh 90vh at 72% 12%, rgb(255 212 90 / 16%), transparent 62%),
    radial-gradient(90vh 70vh at 18% 4%, rgb(248 150 106 / 10%), transparent 58%);
  opacity: calc(0.35 + var(--hd-scroll) * 0.45);   /* tăng dần, không tắt dần */
}
```

Giữ nguyên `transition`, `z-index`, `position`, mọi thứ khác.

### 3.5 · `_layout.html` — đúng một dòng đổi

```html
<meta name="theme-color" content="#0b332e">
```
→
```html
<meta name="theme-color" content="#FFFBEB">
```

### 3.6 · BẪY — bốn nhóm KHÔNG được đổi

Đọc kỹ, đây là chỗ dễ phá trang nhất. `main.css` có **11 chỗ `#000`**, và **10 trong số đó
không phải màu**:

**a) `#000` trong `mask` / `-webkit-mask` — 4 chỗ.** Đó là **độ mờ của mặt nạ**, không phải màu.
Đổi sẽ làm biến mất hiệu ứng bo góc ảnh.

```css
-webkit-mask: radial-gradient(circle at 50% 50%, #000 5%, rgb(0 0 0 / .55) 20%, transparent 44%);
mask: radial-gradient(circle at 50% 50%, #000 40%, rgb(0 0 0 / .55) 58%, transparent 76%);
```

Bốn chuỗi `rgb(0 0 0 / .55)` đi kèm chúng cũng là mặt nạ — **giữ nguyên**.

**b) `#000` trong `color-mix(… 95%, #000)` — 6 chỗ.** Đó là phép **làm tối 5%** cho trạng thái
hover. Giữ nguyên cấu trúc; chỉ token bên trong đổi theo bảng §4.

```css
background: color-mix(in srgb, var(--jade-950) 95%, #000);   /* → var(--paper-band) */
```

**c) `.skip-link` — 1 chỗ `#000`, 1 chỗ `#fff`.** Liên kết "Đi đến nội dung chính" cho người
dùng bàn phím:

```css
.skip-link{…;background:#fff;color:#000;transform:translateY(-160%)}
```

Đó là **21:1 — tương phản cao nhất có thể**, và đó là chủ đích. **Giữ nguyên cả hai.**
Đây là thành phần a11y, không phải thành phần thương hiệu.

**d) `#4285f4` ở `:focus-visible` — 1 chỗ.** Vòng focus. Trên nền kem `#FFFBEB` nó đạt
**3.44:1**, vượt ngưỡng 3:1 của WCAG 1.4.11. **Giữ nguyên.** Đừng "làm cho hợp tông" —
vòng focus xanh lệch tông là cố ý, nó phải nổi bật.

Ngoài bốn nhóm đó:
- `color:#fff` — **4 chỗ**, đều là chữ trên nền tối cũ → đổi thành `var(--ink)`
- `background:#fff` — **1 chỗ** (`.filters input, .filters select`) → `var(--paper-raised)`
  (cùng giá trị, chỉ để không còn literal)

---

## 4 · Bảng màu mới và bảng ánh xạ

Mọi hex dưới đây lấy pixel trực tiếp từ brand board chính thức, không phải phỏng đoán.

### 4.1 · Khối `:root` mới cho `main.css`

Dùng nguyên văn khối này, chỉ thêm bớt nếu §4.3 đòi:

```css
:root{
  /* ---- Nền ---- */
  --paper:#FFFBEB;          /* nền chính — kem */
  --paper-raised:#FFFFFF;   /* thẻ nổi trên nền */
  --paper-band:#FFEF9F;     /* dải xen kẽ, thay chỗ các mục nền tối cũ */
  --paper-sun:#FEE87D;      /* dải nhấn mạnh nhất */

  /* ---- Chữ ---- */
  --ink:#2B1B12;            /* chữ chính   — 15.97:1 trên kem */
  --ink-soft:#5C4433;       /* chữ phụ đậm —  8.69:1 */
  --muted:#7A6656;          /* chữ phụ     —  5.24:1 */

  /* ---- Thương hiệu · CHỈ dùng làm MẢNG MÀU (nền, gradient, trang trí) ---- */
  --gold:#FFD45A; --amber:#FFA95A; --orange:#FF8B5A; --coral:#FF5A5A;
  --peach:#F8966A; --rose:#F0557B; --magenta:#E2407C; --brown:#8B6339;

  /* ---- Biến thể CHỮ · đủ 4.5:1 trên CẢ ba nền sáng ---- */
  --gold-ink:#8B6600; --amber-ink:#AD5300; --orange-ink:#C53B00; --coral-ink:#DB0000;
  --rose-ink:#D51343; --magenta-ink:#CF1F61;

  /* ---- Bốn nhà ---- */
  --tre:#46843E;    --tre-ink:#407939;
  --dau:#C0272D;    --dau-ink:#C0272D;
  --sen:#E1407C;    --sen-ink:#CE2061;
  --lua:#F89E31;    --lua-ink:#A15B05;

  /* ---- Chữ đặt TRÊN mảng màu đậm (chân trang nâu, nút nhấn) ---- */
  --on-brown:#FFFBEB;       /* 5.14:1 trên --brown */

  /* ---- Đường kẻ, bóng, trạng thái ---- */
  --line:rgb(139 99 57 / 22%);
  --shadow:0 24px 70px rgb(139 99 57 / 14%);
  --danger:#C0272D;

  /* ---- Không phải màu — GIỮ NGUYÊN Y HỆT ---- */
  --img-radius:clamp(10px,1.4vw,18px);
  --display:"Cormorant Garamond",Georgia,serif;
  --body:"Be Vietnam Pro",Arial,sans-serif;
  --shell:min(1180px,calc(100% - 32px));
}
```

### 4.2 · Luật vàng — vi phạm là hỏng a11y

**Không màu thương hiệu nào đủ tương phản làm chữ trên nền kem.** Đo thật:

| | tỉ lệ trên `#FFFBEB` | |
|---|---|---|
| `--paper-band #FFEF9F` | 1.12 | ✗ |
| `--gold #FFD45A` | 1.37 | ✗ |
| `--lua #F89E31` | 2.04 | ✗ |
| `--orange #FF8B5A` | 2.23 | ✗ |
| `--coral #FF5A5A` | 2.95 | ✗ |
| `--rose #F0557B` | 3.22 | ✗ |
| `--magenta #E2407C` | 3.85 | ✗ |
| `--tre #46843E` | 4.37 | ✗ (sát ngưỡng) |

Chữ **trắng** trên nền màu cũng hỏng: trắng trên `#FF5A5A` = 3.06, trên `#E2407C` = 3.99.

> **Luật:** token **không** hậu tố `-ink` chỉ được xuất hiện ở `background`, `border-color`
> của viền dày ≥ 3px, `fill` trang trí, và điểm dừng gradient.
> Bất cứ chỗ nào là `color:` hoặc viền mảnh mang nghĩa → **bắt buộc dùng bản `-ink`.**

### 4.3 · Bảng ánh xạ — mọi giá trị trong `main.css`

| Cũ | Xuất hiện ở | Mới |
|---|---|---|
| `--jade-950 #082824` | nền `.hero`, `.tarot-card`, `.card-detail`, `.not-found` | `var(--paper)` — riêng `.tarot-card` dùng `var(--paper-raised)` |
| `--jade-900 #0b332e` | nền `.featured`, `.page-hero` | `var(--paper-band)` |
| `--jade-800 #12463e` | nền `.primary`, `.filters button[aria-pressed]`, `.pagination [aria-current]` | `var(--gold)` + `color:var(--ink)` |
| `--jade-700 #1b5b50` | `.prose a` | `var(--magenta-ink)` |
| `--ivory #f5eedf` | nền `body`, `.news-section` | `var(--paper)` |
| `--paper #fff9ed` | nền `.story-section`, panel, thẻ | `var(--paper-raised)` |
| `--brass #916843` | `.eyebrow`, viền | `var(--brown)` |
| `--brass-light #d7ba98` | nhãn trên nền tối | `var(--muted)` |
| `--brass-glow #b78a4a` | nền `.button.brass` | `var(--gold)` + `color:var(--ink)` |
| `--cinnabar #9f3f35` | số `.story-panels`, nền `.waitlist`, viền `blockquote` | chữ/viền → `var(--coral-ink)`; nền `.waitlist` → dải bình minh (§4.4) |
| `--ink #18201d` | chữ chính | `var(--ink)` |
| `--muted #68716c` | chữ phụ | `var(--muted)` |
| `--line rgba(199,150,78,.32)` | mọi viền | `var(--line)` |
| `#092f2a` `#0f3c35` `#0d3b34` `#0a332e` | nền tối cục bộ (`.hero-card`, `.card-art`, ô ảnh) | `var(--paper-raised)` |
| `#061f1c` | nền `.site-footer` | `var(--brown)` + chữ `var(--on-brown)` — 5.14:1 ✅ |
| `#dfe9e3` | nền `.inline-waitlist` | `var(--paper-band)` |
| `#d6dfd9` `#d7e2db` `#cbd8d1` `#c9d6cf` `#c8d6ce` `#bccbc3` `#b9c9c0` `#afc0b6` `#aebcb5` | **9 giá trị, tất cả đều là `color:`** — chữ nhạt trên nền tối | gộp hết thành `var(--muted)`; riêng đoạn dẫn (`.hero-copy > p`, `.card-intro .lead`, `.page-hero > p:last-child`) dùng `var(--ink-soft)` |
| `#b9b2a6` | viền `input`, `select` trong `.filters` | `var(--line)` |
| `#c62828` | nền huy hiệu `.proto-stamp` ("OpenBeta") | `var(--danger)` + chữ `#fff` — 5.88:1 ✅ |
| `color:#fff` (4 chỗ) | nút, nhãn trên nền tối | `var(--ink)` |
| `background:#fff` (1 chỗ) | `.filters input`, `.filters select` | `var(--paper-raised)` |
| `rgba(8,40,36,.96)` | nền `.site-header` | `rgb(255 251 235 / 92%)` — giữ `backdrop-filter` |
| `rgba(8,40,36,.86)` | nền `.hero-waitlist` | `rgb(255 255 255 / 78%)` |
| `rgba(232,201,140,…)` (**6 chỗ**, alpha .25→.42) | viền trên nền tối | `var(--line)` |
| `rgba(199,150,78,.52)` | viền dưới `.site-header` | `var(--line)` |
| `rgb(255 249 237 / 55%)` | ánh quét `.button.brass::after` | `rgb(43 27 18 / 18%)` — nền nút giờ là vàng sáng, quét bằng màu sáng sẽ vô hình |
| `rgba(4,31,27,.16)` | `--shadow` | đã nằm trong `--shadow` mới |
| `rgb(4 28 25 / …)` (**6 chỗ**) | `.hero-overlay` | §3.3 |

### 4.3a · BẪY LỚN NHẤT — 12 chỗ `color: var(--paper)`

`--paper` đang là `#fff9ed` (giấy sáng) và được dùng làm **chữ sáng trên nền tối** ở 12 chỗ.
Trong hệ mới `--paper` là **nền kem của cả trang**. Nếu bạn chỉ đổi giá trị token mà không
sờ tới 12 khai báo này, kết quả là **chữ kem trên nền kem — vô hình**, và Lighthouse
có thể không bắt được vì nó chỉ lấy mẫu một phần tử mỗi loại.

Đủ 12 chỗ, liệt kê hết để bạn không phải tìm:

```
.site-header      .brand         .menu-toggle    .hero
.section-heading.light           .featured       .tarot-card
.waitlist         .site-footer strong            .page-hero
.card-detail      .not-found
```

- **11 chỗ đầu → `color: var(--ink)`** (nền của chúng đều thành nền sáng)
- **`.site-footer strong` → `color: var(--on-brown)`** — đây là chỗ duy nhất nền vẫn đậm

Sau khi sửa, `main.css` **không được còn khai báo `color: var(--paper)` nào.**
Cổng kiểm `tools/scripts/check-palette.mjs` chặn tuyệt đối, không có ngoại lệ.

### 4.3b · Họ "ánh sáng vàng" — 9 chỗ `rgb(232 201 140 / …)`, xử lý riêng

Chín giá trị này **không phải màu bề mặt**. Chúng là ánh sáng vàng phủ mờ lên nền **tối**:
mặt trời hero, tia trống đồng, sương, ánh quét. Trên nền kem, vàng nhạt 8–22% trên kem gần như
**vô hình** — đổi token thôi không đủ, phải đảo cách nghĩ: trên nền sáng, "ánh sáng" phải là
**sắc ấm đậm hơn nền**, không phải sáng hơn.

| Chỗ | Cũ | Mới |
|---|---|---|
| `.hero-mist` (2 điểm dừng) | `rgb(232 201 140 / 10%)`, `/ 8%` | `rgb(255 169 90 / 20%)`, `/ 15%` |
| `.hero-sun::before` quầng | `rgb(255 244 214 / 72%)`, `rgb(232 201 140 / 38%)`, `rgb(199 150 78 / 12%)` | `rgb(255 212 90 / 85%)`, `rgb(255 139 90 / 45%)`, `rgb(240 85 123 / 18%)` — mặt trời bình minh, tâm vàng ra mép hồng |
| `.hero-sun::after` tia (conic) | `rgb(232 201 140 / 0)`, `/ 15%`, `/ 0` | `rgb(255 139 90 / 0)`, `rgb(255 139 90 / 22%)`, `rgb(255 139 90 / 0)` |
| ánh quét chéo 105deg | `rgb(232 201 140 / 22%)` | `rgb(255 212 90 / 55%)` |
| nền phẳng | `background: rgb(232 201 140 / 10%)` | `rgb(255 212 90 / 26%)` |
| `box-shadow: inset` | `rgb(232 201 140 / .45)` | `rgb(255 255 255 / .7)` — viền sáng phía trong, trên nền sáng phải là trắng |

Nếu một chỗ nào bạn thấy không khớp mô tả trên, **khai ở phần Giả định** thay vì đoán bừa.

### 4.4 · Dải bình minh cho `.waitlist`

Mục `.waitlist` hiện là mảng `--cinnabar` tràn viền. Thay bằng dải bình minh:

```css
background: linear-gradient(135deg, var(--gold) 0%, var(--orange) 55%, var(--rose) 100%);
color: var(--ink);
```

Chữ `--ink` trên ba điểm dừng: **11.68 → 7.17 → 4.96**, đều đạt.
**Không kéo dải tới `--magenta`** — ở đó tỉ lệ tụt xuống **4.15 ✗**.

### 4.5 · Nút bấm

| Class | Nền | Chữ | Tỉ lệ |
|---|---|---|---|
| `.primary` | `var(--gold)` | `var(--ink)` | 11.68 ✅ |
| `.button.brass` | `var(--gold)` | `var(--ink)` | 11.68 ✅ |
| `.ghost` | trong suốt, viền `var(--magenta-ink)` | `var(--magenta-ink)` | 5.04 ✅ |
| `.nav-cta` | `var(--magenta-ink)` | `#fff` | 5.22 ✅ |

### 4.6 · `theme-dark.css` — 16 giá trị còn lại

| Cũ | Mới |
|---|---|
| `#082824` (4 chỗ), `#08201c`, `#0e3b34`, `#0d3833`, `#0b332e`, `#12463e`, `#041512` | `var(--paper)` / `var(--paper-band)` / `var(--paper-raised)` tuỳ vai — đọc selector rồi chọn |
| `#f5eedf`, `#fbf4e4` | `var(--ink)` nếu là `color:`, `var(--paper)` nếu là `background` |
| `#9db3aa` | `var(--muted)` |
| `#b78a4a`, `#d8b66a`, `#d7ba98` | `var(--brown)` nếu là `color:`, `var(--gold)` nếu là `background` |
| `#c2564a` | `var(--coral-ink)` nếu là `color:`, `var(--coral)` nếu là `background` |
| `#ffd9d2` | `var(--paper-raised)` |
| `#000` trong `color-mix(… , black)` | giữ nguyên phép tính, chỉ đổi token đầu vào |

Riêng `.brand span` và `.home-page .hero h1` đang dùng `color: var(--brass-glow)` cho chữ
thư pháp Charm → đổi sang **`var(--gold-ink)`** (5.06:1). `--gold` nguyên bản chỉ 1.37:1.

---

## 5 · Ràng buộc tuyệt đối

Vi phạm bất kỳ mục nào thì bản sửa bị loại:

1. **SEO 100 · Accessibility 97 · CLS 0** — số đo thật trên production hôm nay.
   Không xoá/đổi `alt`, `aria-*`, JSON-LD, `<title>`, meta description.
2. **Không đổi bố cục.** Không sửa `grid-template-*`, `padding`, `margin`, `gap`,
   `font-size`, `min-height`, `aspect-ratio`, `width`, `height`. Chỉ đổi **màu**.
   Đây là ràng buộc giữ CLS = 0.
3. **Không sửa** `public/assets/js/light-journey.js`, `site.js`, `motion-gate.js`,
   `scripts/lib/render.js`, `scripts/build.js`.
4. **Không sửa `templates/`** ngoài đúng một dòng `theme-color` ở §3.5.
5. **Không thêm thư viện, không thêm build step, không TypeScript, không CSS preprocessor.**
6. **Không gộp hai tệp CSS, không đổi tên tệp, không xoá tệp.** Việc đó của người khác.
7. **Không đổi `--img-radius`, `--display`, `--body`, `--shell`, `--script`.**
8. **Không đổi ba nhóm ở §3.6** (mask, color-mix `#000`, focus ring).
9. **Không để giá trị màu literal nào nằm ngoài khối `:root`.**
   Ngoại lệ duy nhất: bốn nhóm ở §3.6, và `#fff` làm chữ trên nền đầy màu.
10. **Không dùng token thiếu hậu tố `-ink` cho `color:`.** Xem §4.2.
11. **Không để lại nhãn việc-chưa-làm hay code rút gọn.**
    `tests/source-integrity.test.mjs` quét **toàn bộ repo** — mọi tệp `.js .mjs .html .css
    .md .json .rules` — và đánh trượt nếu tìm thấy bốn chuỗi dưới đây.
    Chúng viết kèm dấu gạch nối để chính tài liệu này không tự đánh trượt mình;
    **bỏ gạch nối khi đọc**:

    `TO-DO` · `FIX-ME` · `phần còn lại giữ-nguyên` · `implement-here`

    Nghĩa là: **trả về tệp đầy đủ**, không rút gọn, không dấu ba chấm thay cho code,
    không ghi chú kiểu "đoạn dưới không đổi".
12. **Comment tiếng Việt**, giải thích *tại sao* chứ không mô tả *cái gì* — khớp giọng
    có sẵn trong repo.

---

## 6 · Nghiệm thu

```bash
node tools/scripts/check-palette.mjs   # cổng kiểm riêng cho đợt này — phải xanh hết
npm run build:local                    # phải sinh 78 trang lá + 85 URL, không lỗi
npm test                               # 22/22 phải đạt
```

`check-palette.mjs` đã có sẵn trong repo. Nó kiểm tự động: màu cũ còn sót, literal lọt
ra ngoài `:root`, token mảng-màu bị dùng làm chữ, tương phản của từng token `-ink`,
`theme-color`, và băm của năm tệp cấm sửa. **Chạy nó trước khi trả bài** — nếu bạn không
chạy được thì ít nhất đọc §1–§4 của nó để biết chính xác cái gì bị chặn.

Ba lệnh đếm phải cho kết quả đúng:

```bash
# 1. Không còn màu jade/brass/cinnabar cũ ở bất cứ đâu
grep -icE '#(082824|0b332e|12463e|1b5b50|916843|b78a4a|d7ba98|9f3f35|f5eedf|fff9ed|c2564a|d8b66a|9db3aa)' \
  public/assets/css/main.css public/assets/css/theme-dark.css
# → phải là 0 cho cả hai tệp

# 2. Không còn literal ngoài :root (trừ ngoại lệ §3.6)
grep -oE '#[0-9a-fA-F]{3,8}' public/assets/css/main.css | wc -l
# → chỉ đếm các dòng trong khối :root, cộng 4 mask + 5 color-mix + 1 focus ring

# 3. theme-color đã đổi
grep -c 'content="#FFFBEB"' templates/_layout.html   # → 1
```

Và:

- Lighthouse mobile trên `/`, `/la-bai/`, `/la-bai/the-star/`, `/huyen-su/`:
  **a11y ≥ 97 · SEO 100 · CLS 0**
- Mọi cặp chữ/nền trong bản sửa đạt **≥ 4.5:1** (chữ thường) hoặc **≥ 3:1** (chữ ≥ 24px
  và thành phần không phải chữ)

---

## 7 · Định dạng trả lời

Đúng bốn phần, không lời dẫn:

1. **File thay đổi** — đường dẫn, sửa hay tạo mới
2. **Code** — đầy đủ, dán được ngay. **Cả ba tệp trả về nguyên vẹn**, không rút gọn,
   không `/* … giữ nguyên … */`. Với `_layout.html` thì đưa cả `TRƯỚC` và `SAU` của
   đúng dòng đổi.
3. **Giả định** — mọi thứ bạn phải đoán vì không thấy được. Đừng im lặng đoán bừa.
   Đặc biệt: mọi selector trong `theme-dark.css` mà bạn không chắc màu đóng vai nền hay chữ.
4. **Tự kiểm** — đối chiếu **từng mục 1–12** trong §5, xác nhận không vi phạm.
   Kèm bảng tương phản cho mọi cặp chữ/nền mới bạn tạo ra ngoài các cặp đã liệt kê ở §4.

---

## Phụ lục · Ba giả định đang chờ Người chốt

Spec này viết theo ba giả định dưới. Nếu Người trả lời khác, sửa lại rất rẻ — mỗi câu một dòng token.

1. **Nhãn bốn nhà giữ tiếng Việt** (Tre / Dâu tằm / Sen / Lúa). Brand board ghi nhãn tiếng Anh
   nhưng đó là nhãn nội bộ; site đang chạy tiếng Việt và `nameFolk` trong Firestore cũng vậy.
2. **Chưa nhập hai font `DFVN Tan Harmoni` / `DFVN Tan Moncheri`.** Thêm `.woff2` vào đường
   chặn render sẽ chọi với việc hạ LCP đang làm dở. Spec này **không** đụng `--display`/`--body`.
3. **`.hero-dust` và `.hero-mist` giữ lại, chỉ đổi màu.** Nếu Người quyết bỏ hẳn thì gỡ sau,
   không ảnh hưởng phần còn lại của spec.
