# Spec 0.8 — Đưa 56 Ẩn Phụ lên trang lá

Giao cho ChatGPT. Dán trọn file này, rồi dán thêm mã nguồn ở §3.

---

## 1 · Bối cảnh

`huongdong.id.vn` là site tĩnh tự dựng: `templates/` + dữ liệu Firestore →
`scripts/build.js` → `dist/`. Không framework runtime, không bundler phía client.

Trang một lá là `/la-bai/<slug>/`, dựng từ `templates/card-detail.html`.

Hiện 56 lá Ẩn Phụ chỉ hiện nghĩa RWS xuôi/ngược và một dòng biểu tượng chung.
Trong khi dữ liệu đã có đủ 560/560 trường — chúng đang nằm không.

## 2 · Việc cần làm

Bổ sung vào `templates/card-detail.html` bốn khối, **chỉ hiện với lá Ẩn Phụ**:

1. **Chủ thể và cảnh** — `subject`, `sceneTitle`, `scene`
2. **Theo lĩnh vực** — `love`, `career`, `finance`, `health` (bốn ô)
3. **Lời khuyên và cảnh báo** — `advice`, `warning`
4. **Nguồn** — danh sách `sources[]` với nhãn `adaptationLevel`

Lá Ẩn Chính giữ nguyên bố cục hiện tại, không đụng.

## 3 · Mã nguồn hiện tại

*(Dán kèm khi giao việc: `templates/card-detail.html`, đoạn `const cards = data.cards.map`
trong `scripts/build.js` dòng 82–92, và `scripts/lib/render.js`.)*

Bộ template chỉ hỗ trợ ba cú pháp — không có gì khác:

```
{{biến}}           chèn có escape
{{{biến}}}         chèn HTML thô
{{#each mảng}}…{{/each}}
{{#if biến}}…{{/if}}
```

`{{#if}}` **không lồng nhau được** — `renderString` dùng regex non-greedy nên
điều kiện lồng sẽ đóng sai thẻ. Có ghi chú sẵn trong `build.js` về đúng điểm này.
Cần rẽ nhánh phức tạp thì dựng sẵn chuỗi HTML trong `build.js` rồi chèn bằng `{{{…}}}`.

## 4 · Dữ liệu có sẵn trên mỗi lá Ẩn Phụ

```js
{
  slug: "two-of-cups",
  arcana: "minor",
  suit: "cups", suitVi: "Hoa Sen", suitShort: "Sen", element: "Nước",
  rank: "two", rankVi: "Hai", number: 2,
  nameFolk: "Hai Hoa Sen",              // đang là <h1>, giữ nguyên
  nameEn: "Two of Cups",
  subject: "Tiên Dung và Chử Đồng Tử",  // chủ thể của cảnh
  sceneTitle: "Hai chén bên bãi cát",
  scene: "Hai người ngang tầm trao chén nước trước tấm màn lụa; giữa hai chén, một bông sen mọc từ cát.",
  shortStory: "Cuộc gặp bất ngờ chỉ thành mối liên kết khi cả hai cùng lựa chọn…",
  love: "…", career: "…", finance: "…", health: "…",
  advice: "…", warning: "…",
  props: ["hai chén", "sen từ cát", "gậy và nón đặt bên"],
  palette: ["hồng sen", "vàng cát", "xanh sông"],
  sources: [{ id: "S05", title: "Truyện Đầm Một Đêm…", isLNCQ: true }, …],
  adaptationLevel: "EDITORIAL_FANTASY_INSPIRED",
  imageStatus: "MISSING",
  artNote: "Chưa có tranh riêng cho lá này; đang dùng phù hiệu của nhà.",
}
```

Nhãn hiển thị của `adaptationLevel` lấy từ `tools/content/sources.mjs`,
export `ADAPTATION_LABEL`.

## 5 · Ràng buộc tuyệt đối

Bản sửa vi phạm bất kỳ mục nào sẽ bị loại:

1. **SEO 100 · Accessibility 97 · CLS 0** — không xoá/đổi `alt`, `aria-*`,
   cấu trúc heading, JSON-LD, `<title>`, meta description. Mọi ảnh giữ `width`+`height`.
2. **Không đổi slug** — `/la-bai/two-of-cups/` giữ nguyên.
3. **Không sửa** `scripts/lib/render.js`, `light-journey.js`, `site.js`.
4. **Không thêm thư viện, không thêm build step, không TypeScript.**
5. **Không lồng `{{#if}}`.**
6. **Ẩn Chính không đổi** — 22 trang phải render y hệt trước và sau.
7. **Comment tiếng Việt**, giải thích *tại sao*, khớp giọng có sẵn trong repo.
8. Thứ tự heading phải liền mạch: trang đang có `h1` → `h2`. Khối mới dùng `h2`/`h3`,
   không nhảy cấp.

## 6 · Nghiệm thu

- `npm run build:local` chạy sạch, sinh đủ 78 trang
- `npm test` — 22/22 vẫn đạt
- 56 trang Ẩn Phụ có đủ bốn khối; 22 trang Ẩn Chính diff rỗng
- Lighthouse mobile trên một trang Ẩn Phụ: a11y ≥ 97, CLS = 0
- Không có chuỗi rỗng lọt ra HTML (ví dụ `<p></p>` khi trường trống)

## 7 · Định dạng trả lời

Đúng bốn phần, không lời dẫn:

1. **File thay đổi** — đường dẫn, tạo mới hay sửa
2. **Code** — đầy đủ, dán được ngay; nếu sửa thì đưa cả `TRƯỚC` và `SAU`
3. **Giả định** — mọi thứ phải đoán vì không thấy được. Đừng im lặng đoán bừa.
4. **Tự kiểm** — đối chiếu từng mục trong §5, xác nhận không vi phạm
