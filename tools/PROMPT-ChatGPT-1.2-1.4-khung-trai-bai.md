# Spec 1.2–1.4 · Khung — Ba trang trải bài theo nhu cầu

Giao cho ChatGPT. Dán trọn file này. Lập 24/08/2026.

> **TRƯỚC KHI DÁN — đính kèm đúng bảy tệp từ repo
> `github.com/hongkhang21998-creator/huong-dong-tarot-site`, nhánh
> `feat/1.1-intent-url-structure`** (không phải `main` — nhánh này đã có 1.1):
>
> | Tệp | Byte |
> |---|---|
> | `public/assets/js/trai-bai.js` | **3.890** |
> | `public/assets/js/deck-data.js` | **9.361** |
> | `templates/trai-bai.html` | **6.440** |
> | `templates/development.html` | **1.062** |
> | `scripts/build.js` | **31.202** |
> | `scripts/lib/seo.js` | **3.896** |
> | `tests/intent-routes.test.mjs` | **2.012** |
>
> Nếu số byte không khớp, dừng lại và báo.

---

## 1 · Đây là KHUNG, không phải trang hoàn chỉnh — đọc kỹ trước khi viết dòng nào

`huongdong.id.vn` đã chốt bốn địa chỉ cho Đợt 1 (`/trai-bai/co-khong/`,
`/trai-bai/ba-la/`, `/trai-bai/tinh-yeu/`, `/la-bai-hom-nay/`) và đang phục vụ
mỗi địa chỉ một trang tạm — `templates/development.html` — với dòng chữ
*"Đang phát triển thêm"*, `noindex,follow`, breadcrumb, canonical đầy đủ.

Ba mục 1.2/1.3/1.4 (không phải 1.5 — trang `/la-bai-hom-nay/` có kế hoạch riêng,
**không thuộc phạm vi việc này**) còn chờ ba quyết định biên tập chưa chốt:
đổi/giữ 54 tên hiển thị, 23 xung đột nguồn dân gian, và nguồn dẫn của lá XXI.
Viết nội dung thật bây giờ là viết trên nền chưa vững.

**Việc của bạn không phải viết nội dung thật.** Việc của bạn là dựng **cơ chế
tương tác** — rút bài, lật lá, hiện kết quả — dùng đúng dữ liệu **đã chốt xong**
(22 Ẩn Chính, đã sống trên site), và **để trống có nhãn** ở đúng những chỗ chưa
chốt. Không tự suy luận, không tự bịa nội dung để lấp chỗ trống.

**Đừng gỡ trang tạm.** Bạn đang **thêm cơ chế bên trong** `templates/development.html`
hiện có (biến nó có tương tác thật), **không phải thay nó bằng trang mới**.

---

## 2 · Việc cần làm

Bốn tệp:

1. **`public/assets/js/trai-bai.js`** — mở rộng (không viết lại): thêm khả năng
   **cỡ trải cố định** (không có dropdown) và **nhãn vị trí** cho từng lá.
2. **`templates/development.html`** — thêm markup rút-bài **có điều kiện theo
   trang** (dùng biến truyền vào, xem §3.3), tái dùng `#hd-deck` + class `hd-*`
   sẵn có trong `main.css`.
3. **`scripts/build.js`** — mở rộng mảng `intentPages` (đã có ở §3.4) để mỗi
   trang truyền đúng cấu hình cỡ trải + nhãn vị trí + `<script>` cần thiết.
4. **`public/assets/js/deck-data.js`** — **không sửa nội dung**, chỉ đọc.

**Không đụng:** `light-journey.js`, `site.js`, `motion-gate.js`,
`scripts/lib/render.js`, `scripts/lib/seo.js`, mọi thứ liên quan
`/la-bai-hom-nay/`, mọi ảnh trong `public/assets/img/`, `main.css` (trừ khi
thêm class mới — xem §5 mục 6).

---

## 3 · Mã nguồn hiện tại — trích nguyên văn

### 3.1 · `trai-bai.js` — toàn bộ hàm `deal()` và phần khởi tạo cuối file

```js
function deal() {
  play(shuffleAudio);
  deckEl.innerHTML = "";
  readEl.innerHTML = "";
  var n = parseInt(spreadEl.value, 10) || 3;
  shuffle(window.HD_DECK).slice(0, n).forEach(function (card, i) {
    var reversed = allowReversed && Math.random() < 0.5;
    deckEl.appendChild(makeCard(card, reversed, i));
  });
  root.querySelector("[data-hint]").hidden = false;
}

drawBtn.addEventListener("click", deal);
spreadEl.addEventListener("change", deal);
soundBtn.addEventListener("click", function () {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "🔊 Âm thanh: bật" : "🔇 Âm thanh: tắt";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
});
revBtn.addEventListener("click", function () {
  allowReversed = !allowReversed;
  revBtn.textContent = allowReversed ? "Đọc ngược: bật" : "Đọc ngược: tắt";
  revBtn.setAttribute("aria-pressed", String(allowReversed));
  deal();
});

deal();
```

Dòng `var spreadEl = root.querySelector("[data-spread]");` ở đầu file
(`trai-bai.js:13`) giả định **luôn có** một `<select data-spread>` trong DOM.
Ba trang mới **không có dropdown** — chỉ có một cỡ trải cố định. Bạn phải sửa
để `spreadEl` là **tuỳ chọn**: có thì đọc từ đó (hành vi cũ, trang `/trai-bai/`
không đổi), không có thì đọc từ `root.dataset.spread` (thuộc tính đặt sẵn trong
HTML, xem §3.3).

### 3.2 · `renderReading()` — nơi cần thêm nhãn vị trí

```js
function renderReading(card, reversed) {
  var src = card.inLNCQ
    ? "Lĩnh Nam chích quái · Chương " + card.chapter + " · " + card.chapterTitle
    : "Ngoài Lĩnh Nam chích quái";
  var item = document.createElement("article");
  item.className = "hd-reading-item";
  item.innerHTML =
    '<p class="hd-reading-head"><strong>' + card.roman + " · " + card.en + "</strong>" +
    (reversed ? ' <span class="hd-rev">ngược</span>' : "") + "</p>" +
    "<p>" + card.summary + "</p>" +
    '<p class="hd-reading-src">' + src +
    ' · <a class="v2-link" href="/la-bai/' + card.slug + '/">Xem lá đầy đủ →</a></p>';
  readEl.appendChild(item);
}
```

Gọi từ trong `makeCard()`, tại đúng dòng xử lý click (`trai-bai.js:48-54`):

```js
el.addEventListener("click", function () {
  if (el.classList.contains("flipped")) return;
  play(flipAudio);
  el.classList.add("flipped");
  el.setAttribute("aria-label", card.roman + " · " + card.en + (reversed ? " (ngược)" : ""));
  renderReading(card, reversed);
});
```

`makeCard(card, reversed, index)` **đã nhận `index`** — đó là chỉ số vị trí
(0, 1, 2, …). Bạn cần truyền nhãn vị trí (nếu có) xuống tới `renderReading` qua
đúng `index` này, không thêm tham số toàn cục.

### 3.3 · `development.html` — toàn văn hiện tại

```html
<main id="noi-dung-chinh">
  <section class="page-hero drum-watermark">
    <p class="eyebrow">Đợt 1 · Trang theo nhu cầu</p>
    <h1>{{heading}}</h1>
    <p>{{intro}}</p>
  </section>
  <section class="v2-prose">
    <p><span class="v2-pending">Đang phát triển thêm</span></p>
    <h2>Địa chỉ đã được chốt</h2>
    <p>Hường Đông đã giữ ổn định địa chỉ của trang này. Phần rút bài và kết quả chưa được kích hoạt để tránh đưa một trải nghiệm chưa hoàn thiện tới người đọc.</p>
    <article class="v2-card">
      <span class="v2-num">Bước tiếp theo</span>
      <h3>Chức năng đang được xây dựng</h3>
      <p>{{nextStep}}</p>
    </article>
    <p><a class="v2-link" href="/trai-bai/">Xem trang Trải bài hiện có →</a></p>
  </section>
  <section class="v2-prose">
    <p class="v2-note">Tarot ở Hường Đông là công cụ tự phản tư và học tập, không thay thế tư vấn y tế, pháp lý hoặc tài chính.</p>
  </section>
</main>
```

Template dùng `renderString()` — chỉ bốn cú pháp: `{{biến}}`, `{{{biến}}}`,
`{{#each}}`, `{{#if}}`, **không lồng `{{#if}}`** (xem `SPEC-0.8`, §3.3, quy tắc
giống hệt ở đây). Cần rẽ nhánh phức tạp thì dựng chuỗi HTML trong `build.js`
rồi chèn bằng `{{{…}}}`.

### 3.4 · `build.js` — khối `intentPages` hiện tại (trích, đủ ngữ cảnh)

```js
const intentPages = [
  {
    route: "/trai-bai/co-khong/",
    title: "Trải bài Có hoặc Không",
    heading: "Có hoặc Không",
    intro: "Một lá bài giúp bạn dừng lại, nhìn rõ điều đang nghiêng về phía nào và tự kiểm tra lý do của mình.",
    nextStep: "Hạng mục 1.2 sẽ bổ sung rút một lá, diễn giải Có/Không có điều kiện và chia sẻ kết quả.",
    breadcrumbs: [{ name: "Trang chủ", path: "/" }, { name: "Trải bài", path: "/trai-bai/" }, { name: "Có hoặc Không", path: "/trai-bai/co-khong/" }],
  },
  // … ba mục còn lại: ba-la, tinh-yeu, la-bai-hom-nay (giữ NGUYÊN, không đổi)
];
for (const page of intentPages) {
  const content = renderString(templates.development, page);
  await emit(page.route, layout({
    title: page.title,
    description: `${page.intro} Tính năng đang được Hường Đông phát triển thêm.`,
    path: page.route,
    robots: "noindex,follow",
    schemas: [breadcrumbSchema(data.site, page.breadcrumbs)],
    content,
  }));
}
```

Đây là vòng lặp bạn sẽ sửa: mỗi phần tử trong `intentPages` cần thêm cấu hình
cho khung rút bài, và **chỉ ba phần tử đầu** (không phải `la-bai-hom-nay`)
mới bật khung này.

---

## 4 · Thiết kế khung — chốt sẵn, không tự quyết lại

### 4.1 · Cấu hình mỗi trang

Thêm vào **mỗi phần tử trong ba phần tử đầu** của `intentPages` một khối
`draw`:

```js
{
  route: "/trai-bai/co-khong/",
  // … các trường hiện có giữ nguyên …
  draw: {
    size: 1,
    positions: null,          // một lá — không cần nhãn vị trí
    verdict: true,            // BẬT khối "Đang phát triển thêm" thay cho Có/Không thật
  },
},
{
  route: "/trai-bai/ba-la/",
  // …
  draw: {
    size: 3,
    positions: ["Quá khứ", "Hiện tại", "Hướng đi"],
    verdict: false,
  },
},
{
  route: "/trai-bai/tinh-yeu/",
  // …
  draw: {
    size: 3,
    // Nhãn TẠM — Người chưa chốt câu hỏi ba vị trí cho Tình Yêu (xem §6, giả định 2).
    // Giữ TRUNG TÍNH, đừng đặt tên sâu hơn mức này.
    positions: ["Bạn mang gì vào", "Đối phương mang gì vào", "Cả hai đang tạo ra gì"],
    verdict: false,
  },
},
```

Phần tử `la-bai-hom-nay` **không có khối `draw`** — giữ nguyên như hiện tại,
không kích hoạt bất kỳ cơ chế rút bài nào ở đó.

### 4.2 · Markup rút bài trong `development.html`

Thêm một khối **có điều kiện** (dùng `{{#if draw}}`, không lồng thêm `{{#if}}`
nào bên trong — nếu cần rẽ nhánh thêm thì dựng sẵn HTML trong `build.js` như
`development.html` đã làm với `{{nextStep}}`) chèn ngay sau khối
"Bước tiếp theo", trước khối lưu ý cuối trang:

```html
{{#if draw}}
<section class="v2-prose" id="rut-bai">
  <p class="eyebrow">Thử khung — kết quả minh hoạ</p>
  <h2>Rút thử</h2>
  <p>Bấm <strong>Xáo và rút</strong>. Bấm vào lá úp để lật. Đây là bản thử cơ chế —
     nội dung diễn giải đầy đủ sẽ có sau khi hoàn tất biên tập.</p>
  <div class="hd-deck-wrap" id="hd-deck" data-spread-size="{{draw.size}}" {{{draw.positionsAttr}}}>
    <div class="hd-controls">
      <button type="button" data-draw>Xáo và rút</button>
      <button type="button" data-reversed aria-pressed="true">Đọc ngược: bật</button>
      <button type="button" data-sound aria-pressed="true">🔊 Âm thanh: bật</button>
    </div>
    <div class="hd-deck" data-deck></div>
    <p class="hd-hint" data-hint hidden>Bấm vào lá để lật</p>
    {{#if draw.verdict}}
    <p class="hd-verdict"><span class="v2-pending">Đang phát triển thêm</span> — phần kết luận
       Có/Không cần một quy tắc biên tập riêng, chưa được chốt.</p>
    {{/if}}
    <div class="hd-reading" data-reading></div>
  </div>
  <p class="v2-note">Bộ bài hiện dùng <strong>22 Ẩn chính</strong>. Mặt lưng đang là bản tạm —
     sẽ thay bằng art trống đồng thật ở đợt cập nhật hình ảnh.</p>
</section>
{{/if}}
```

`draw.positionsAttr` dựng sẵn trong `build.js` (theo đúng khuôn mẫu ghi chú có
sẵn ở `SPEC-0.8` §3.3 — dựng chuỗi HTML/thuộc tính trong JS, chèn bằng
`{{{…}}}`) — ví dụ `data-positions="Quá khứ,Hiện tại,Hướng đi"` khi có nhãn,
chuỗi rỗng khi không có (`co-khong`).

Cuối `development.html`, sau khối script hiện có (nếu có) — thêm:

```html
{{#if draw}}
<script src="/assets/js/deck-data.js"></script>
<script src="/assets/js/trai-bai.js" defer></script>
{{/if}}
```

### 4.3 · Sửa `trai-bai.js` — hai chỗ, tối thiểu

**a) `spreadEl` thành tuỳ chọn**, cỡ trải đọc từ `data-spread-size` khi không
có dropdown:

```js
var spreadEl = root.querySelector("[data-spread]");   // có ở /trai-bai/, không có ở ba trang mới
var fixedSize = parseInt(root.dataset.spreadSize, 10) || null;
var positions = root.dataset.positions ? root.dataset.positions.split(",") : null;
```

Trong `deal()`, đổi dòng lấy `n`:

```js
var n = fixedSize || parseInt(spreadEl.value, 10) || 3;
```

Và bọc `spreadEl.addEventListener("change", deal)` trong `if (spreadEl) { … }`
— trang không có dropdown thì không gắn listener lên `null`.

**b) Nhãn vị trí khi hiện kết quả.** `makeCard` đã nhận `index`; truyền tiếp
xuống `renderReading`:

```js
function renderReading(card, reversed, index) {
  var posLabel = positions && positions[index]
    ? '<p class="hd-reading-pos">' + positions[index] + "</p>"
    : "";
  // … giữ nguyên phần dựng "src" và "item.innerHTML" hiện có, chỉ thêm
  //   posLabel vào TRƯỚC hd-reading-head:
  item.innerHTML = posLabel + '<p class="hd-reading-head">…' /* phần còn lại y hệt bản gốc */;
  readEl.appendChild(item);
}
```

Và sửa lời gọi trong `makeCard`:

```js
renderReading(card, reversed, index);
```

Đây là toàn bộ thay đổi hành vi cần thiết. **Không đổi** cơ chế xáo bài, âm
thanh, lật 3D, `aria-label`, hay bất cứ thứ gì khác trong file.

---

## 5 · Ràng buộc tuyệt đối

Vi phạm bất kỳ mục nào thì bản sửa bị loại:

1. **SEO 100 · Accessibility 97 · CLS 0.** Không xoá `alt`, `aria-*`, JSON-LD,
   canonical, breadcrumb hiện có trong `development.html`/`build.js`.
2. **Cả ba trang GIỮ NGUYÊN `robots: "noindex,follow"`** và **không** được thêm
   vào `sitemap.xml`. Đây là khung thử cơ chế, không phải nội dung phát hành.
3. **Không tự đặt ra quy tắc Có/Không.** Khối verdict của `co-khong` **phải**
   hiện `v2-pending`, **không được** tính hay hiện chữ "Có"/"Không" thật dưới
   bất kỳ hình thức nào (kể cả tạm, kể cả có ghi chú "demo").
4. **Không đổi nhãn vị trí của Tình Yêu** ngoài bản TẠM ở §4.1 — đó là gợi ý
   chờ Người chốt, không phải quyết định cuối.
5. **Không thêm ảnh, không đổi mặt lưng lá, không đụng
   `public/assets/img/`.** Giữ nguyên câu ghi chú "Mặt lưng đang là bản tạm…".
6. **Không sửa `main.css`** trừ khi thật sự cần class mới cho `.hd-verdict` và
   `.hd-reading-pos` — nếu thêm, đặt cuối file, dùng lại token màu đã có
   (`var(--muted)`, `var(--line)`, …), không thêm màu mới, không đụng selector
   có sẵn.
7. **Không sửa `deck-data.js`, `light-journey.js`, `site.js`,
   `motion-gate.js`, `scripts/lib/render.js`, `scripts/lib/seo.js`.**
8. **Không đụng phần tử `la-bai-hom-nay` trong `intentPages`.** Không thêm
   khối `draw` cho nó, không gắn `trai-bai.js` vào trang đó.
9. **`/trai-bai/` (trang gốc, có dropdown) phải chạy y hệt trước và sau.**
   Kiểm bằng cách so `dist/trai-bai/index.html` — chỉ phần `<script>` nguồn
   thay đổi nếu bạn tách logic, nội dung hiển thị không đổi.
10. **Không thêm thư viện, không thêm build step, không TypeScript.**
11. **Không lồng `{{#if}}`.**
12. **Không để lại nhãn việc-chưa-làm hay code rút gọn** —
    `tests/source-integrity.test.mjs` quét toàn repo. Trả về tệp đầy đủ.
13. **Comment tiếng Việt**, giải thích *tại sao*, khớp giọng có sẵn trong repo.

---

## 6 · Giả định đang chờ Người chốt — spec viết theo đây, sửa sau rất rẻ

1. **Khối verdict hiện `v2-pending`**, không suy luận Có/Không từ xuôi/ngược.
   Nếu Người muốn một quy tắc tạm (ví dụ xuôi = nghiêng Có) để demo trông đầy
   đủ hơn, đó là đổi một giá trị cấu hình, không đổi cấu trúc.
2. **Nhãn ba vị trí của Tình Yêu là "Bạn mang gì vào · Đối phương mang gì vào ·
   Cả hai đang tạo ra gì".** Đây là gợi ý trung tính, chưa qua Người duyệt.
3. **Trang thử vẫn dùng 22 Ẩn Chính**, không mở rộng sang Ẩn Phụ — mở khi 0.7
   xong và Ẩn Phụ có tên ổn định.

---

## 7 · Nghiệm thu

```bash
npm run build:local
npm test
```

- `tests/intent-routes.test.mjs` (đã có) vẫn đạt **nguyên vẹn** — đặc biệt dòng
  `assert.doesNotMatch(html, /trai-bai\.js|data-draw/, …)` cho
  `/la-bai-hom-nay/` vẫn phải đúng (trang đó không được đụng)
- Ba trang `co-khong`, `ba-la`, `tinh-yeu`: có `#hd-deck`, rút được đúng cỡ đã
  cấu hình, không có `<select data-spread>`
- `co-khong`: đúng 1 lá, có khối `v2-pending` cho verdict
- `ba-la`, `tinh-yeu`: đúng 3 lá, mỗi lá có nhãn vị trí đúng thứ tự đã cấu hình
- `/trai-bai/` (trang gốc): dropdown 1/3/4/10 vẫn hoạt động y hệt trước
- Cả ba vẫn `noindex,follow`, vẫn vắng mặt trong `sitemap.xml`
- Lighthouse mobile trên `/trai-bai/co-khong/`: a11y ≥ 97, CLS 0

---

## 8 · Định dạng trả lời

Đúng bốn phần, không lời dẫn:

1. **File thay đổi** — đường dẫn, sửa hay tạo mới
2. **Code** — đầy đủ, dán được ngay, cả bốn tệp trọn vẹn
3. **Giả định** — mọi thứ phải đoán vì không thấy được, ngoài ba mục đã nêu ở §6
4. **Tự kiểm** — đối chiếu từng mục 1–13 trong §5, xác nhận không vi phạm
