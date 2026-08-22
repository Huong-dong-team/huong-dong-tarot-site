# Spec 0.8 — Đưa 56 Ẩn Phụ lên trang lá

Giao cho ChatGPT. Dán trọn file này. Cập nhật 22/08/2026 — dữ liệu đã sẵn trong Firestore.

---

## 1 · Bối cảnh

`huongdong.id.vn` là site tĩnh tự dựng: `templates/` + dữ liệu Firestore →
`scripts/build.js` → `dist/` → Firebase Hosting. Không framework runtime,
không bundler phía client.

Trang một lá là `/la-bai/<slug>/`, dựng từ `templates/card-detail.html`.

**Vấn đề:** 22 lá Ẩn Chính có truyện nhiều đoạn, biểu tượng, khối dẫn nguồn.
56 lá Ẩn Phụ chỉ có nghĩa RWS xuôi/ngược và một dòng chung —
*"Nhà Sen chuyển dịch Cups sang biểu tượng bản địa nhưng giữ nguyên logic RWS."*
Trong khi dữ liệu đầy đủ đã có sẵn trên từng lá, chỉ chưa được hiển thị.

## 2 · Việc cần làm

Sửa `templates/card-detail.html` để **lá Ẩn Phụ** hiện thêm bốn khối. Lá Ẩn Chính
giữ nguyên bố cục hiện tại, không đụng một ký tự.

1. **Chủ thể và cảnh** — `subject`, `sceneTitle`, `scene`, `shortStory`
2. **Theo lĩnh vực** — `love`, `career`, `finance`, `health` (bốn ô)
3. **Lời khuyên và cảnh báo** — `advice`, `warning`
4. **Dẫn nguồn** — lặp `sources[]`, kèm nhãn `adaptationLevel`

## 3 · Mã nguồn hiện tại

### 3.1 · `templates/card-detail.html` (nguyên văn, 2.002 byte)

```html
<main id="noi-dung-chinh"><article class="card-detail drum-watermark"><div class="card-art"><img src="{{card.image.url}}" width="{{card.image.width}}" height="{{card.image.height}}" alt="{{card.image.alt}}"><span>{{card.folkStyleLabel}}</span>{{#if card.artNote}}<p class="art-note">{{card.artNote}}</p>{{/if}}</div><div class="card-intro"><p class="eyebrow">{{card.arcanaLabel}} · {{card.displayNumber}}</p><h1>{{card.nameFolk}}</h1><p class="card-original">{{card.nameVi}} · {{card.nameEn}}</p><div class="keyword-list">{{{card.keywordHtml}}}</div><p class="lead">{{card.seo.description}}</p><div class="share-row"><button type="button" data-share="facebook">Facebook</button><button type="button" data-share="threads">Threads</button><button type="button" data-share="copy">Sao chép liên kết</button></div></div></article><section class="meaning-section lac-watermark"><div><p class="eyebrow">Khi lá xuôi</p><h2>Ý nghĩa xuôi</h2>{{{card.meaningUpright}}}</div><div><p class="eyebrow">Khi lá ngược</p><h2>Ý nghĩa ngược</h2>{{{card.meaningReversed}}}</div></section><section class="story-detail drum-watermark"><p class="eyebrow">Mô-típ Việt hóa</p><h2>Câu chuyện và lớp liên tưởng</h2>{{{card.story}}}<h3>Biểu tượng</h3><div class="symbol-list">{{{card.symbolHtml}}}</div><blockquote>{{card.question}}</blockquote></section><!--LNCQ--><nav class="card-pagination" aria-label="Điều hướng lá bài"><a href="/la-bai/{{previous.slug}}/">← {{previous.nameFolk}}</a><a href="/la-bai/">Đủ 78 lá</a><a href="/la-bai/{{next.slug}}/">{{next.nameFolk}} →</a></nav><section class="inline-waitlist"><h2>Nhận câu chuyện của lá tiếp theo</h2><form class="waitlist-form" data-waitlist><label>Email<input name="email" type="email" autocomplete="email" required></label><input type="hidden" name="source" value="card-detail"><button class="button primary" type="submit">Tham gia</button><p class="form-status" role="status"></p></form></section></main>
```

### 3.2 · `scripts/build.js` — nơi dựng object card cho template

```js
const cards = data.cards.map((card) => ({
  ...card,
  nameFolk: card.nameFolk || card.nameVi,
  suitValue: card.suit || "",
  arcanaLabel: arcanaLabel(card),
  displayNumber: card.arcana === "major" ? roman(card.number) : card.nameVi.split(" ")[0],
  folkStyleLabel: folkStyleLabel[card.folkStyle] || "Mỹ thuật Việt",
  artNote: ART_NOTE[card.imageStatus] ?? "",
  searchText: [card.nameVi, card.nameEn, card.nameFolk, ...(card.keywordsUpright || [])].join(" ")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
}));
```

`{{{card.keywordHtml}}}` và `{{{card.symbolHtml}}}` được dựng sẵn ở nơi khác trong
`build.js` rồi chèn bằng ba ngoặc. Đó là khuôn mẫu bạn nên theo cho khối mới.

### 3.3 · Bộ template — chỉ hỗ trợ đúng bốn cú pháp

```
{{biến}}                  chèn có escape
{{{biến}}}                chèn HTML thô
{{#each mảng}}…{{/each}}
{{#if biến}}…{{/if}}
```

**`{{#if}}` KHÔNG lồng nhau được.** `renderString` dùng regex non-greedy nên điều
kiện lồng sẽ đóng sai thẻ. `build.js` đã có ghi chú đúng về điểm này:

> *Dựng sẵn ở đây thay vì lồng `{{#if}}` trong template: renderString dùng regex
> non-greedy nên điều kiện lồng nhau sẽ đóng sai thẻ.*

Cần rẽ nhánh phức tạp thì **dựng chuỗi HTML trong `build.js` rồi chèn bằng `{{{…}}}`**.

## 4 · Dữ liệu có sẵn trên mỗi lá Ẩn Phụ

Đã nằm trong Firestore và trong `seed/cards.json`. Ví dụ thật, lá `two-of-cups`:

```js
{
  slug: "two-of-cups", arcana: "minor", suit: "cups",
  suitVi: "Hoa Sen", suitShort: "Sen", element: "Nước", rankVi: "Hai", number: 2,
  nameFolk: "Hai Hoa Sen",          // đang là <h1>, GIỮ NGUYÊN
  nameVi: "Hai Sen", nameEn: "Two of Cups",

  subject: "Tiên Dung và Chử Đồng Tử",
  sceneTitle: "Hai chén bên bãi cát",
  scene: "Hai người ngang tầm trao chén nước trước tấm màn lụa; giữa hai chén, một bông sen mọc từ cát.",
  shortStory: "Cuộc gặp bất ngờ chỉ thành mối liên kết khi cả hai cùng lựa chọn. Chiếc chén được trao và nhận ở cùng độ cao.",

  love: "một lựa chọn giữa hai hướng tình cảm",
  career: "cân nhắc giữa hai phương án công việc",
  finance: "cân đối giữa hai khoản chi hoặc đầu tư",
  health: "cần tìm điểm cân bằng, tránh nghiêng hẳn một phía",
  advice: "Cho phép mình cân nhắc kỹ trước khi chọn.",
  warning: "Trì hoãn quá lâu cũng là một lựa chọn có hậu quả.",

  props: ["hai chén", "sen từ cát", "gậy và nón đặt bên"],
  palette: ["hồng sen", "vàng cát", "xanh sông"],

  sources: [ { id: "S05", title: "Truyện Đầm Một Đêm - Tiên Dung và Chử Đồng Tử", isLNCQ: true }, … ],
  adaptationLevel: "EDITORIAL_FANTASY_INSPIRED",
  imageStatus: "MISSING",
  artNote: "Chưa có tranh riêng cho lá này; đang dùng phù hiệu của nhà.",
}
```

Nhãn hiển thị của `adaptationLevel` — dựng bảng này trong `build.js`:

| Giá trị | Nhãn |
|---|---|
| `LNCQ_CORE` | Lĩnh Nam chích quái — phần chính |
| `LNCQ_CORE_ADAPTATION` | Dựa trên Lĩnh Nam chích quái, có biên tập khoảnh khắc |
| `LNCQ_TUC_BIEN_ADAPTATION` | Dựa trên phần Tục Biên, có chuyển thể |
| `VIET_FOLK_EXPANDED_ADAPTATION` | Tín ngưỡng Việt mở rộng ngoài Lĩnh Nam chích quái |
| `EDITORIAL_FANTASY_INSPIRED` | Cảnh mới sáng tác, chỉ mượn motif |

## 5 · Ràng buộc tuyệt đối

Vi phạm bất kỳ mục nào thì bản sửa bị loại:

1. **SEO 100 · Accessibility 97 · CLS 0** — đây là số đo thật trên production hôm nay.
   Không xoá/đổi `alt`, `aria-*`, JSON-LD, `<title>`, meta description. Ảnh giữ `width`+`height`.
2. **Không đổi slug.** `/la-bai/two-of-cups/` giữ nguyên.
3. **Không sửa** `scripts/lib/render.js`, `public/assets/js/light-journey.js`,
   `public/assets/js/site.js`, `public/assets/js/motion-gate.js`.
4. **Không thêm thư viện, không thêm build step, không TypeScript.**
5. **Không lồng `{{#if}}`.**
6. **22 lá Ẩn Chính phải render y hệt trước và sau.** Kiểm bằng cách so `dist/la-bai/justice/index.html`.
7. **Thứ tự heading liền mạch.** Trang đang có `h1` → `h2` → `h3`. Khối mới không nhảy cấp.
8. **Không để chuỗi rỗng lọt ra HTML.** Trường trống thì bỏ cả khối, đừng in `<p></p>`.
9. **Comment tiếng Việt**, giải thích *tại sao* chứ không mô tả *cái gì* — khớp giọng có sẵn trong repo.

## 6 · Nghiệm thu

```bash
npm run build:local     # phải sinh đủ 78 trang, không lỗi
npm test                # 22/22 phải đạt
```

- 56 trang Ẩn Phụ có đủ bốn khối
- 22 trang Ẩn Chính: diff rỗng so với trước khi sửa
- Lighthouse mobile trên một trang Ẩn Phụ: a11y ≥ 97, CLS = 0

## 7 · Định dạng trả lời

Đúng bốn phần, không lời dẫn:

1. **File thay đổi** — đường dẫn, tạo mới hay sửa
2. **Code** — đầy đủ, dán được ngay. Nếu sửa thì đưa cả `TRƯỚC` và `SAU`.
3. **Giả định** — mọi thứ bạn phải đoán vì không thấy được. Đừng im lặng đoán bừa.
4. **Tự kiểm** — đối chiếu từng mục trong §5, xác nhận không vi phạm.
