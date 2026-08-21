# Đợt 0 · Bản sửa

Viết bám theo mã nguồn thật đang phục vụ tại `huongdong.id.vn` ngày 19/08/2026
(`main.css?v=e187c88e`, `site.js?v=ab68ebce`, `light-journey.js?v=7467ca1a`).

## File trong bộ này

| Đường dẫn | Loại | Trạng thái kiểm chứng |
|---|---|---|
| `assets/js/motion-gate.js` | file mới | **15/15 unit test đạt** — `node _test/motion-gate.test.mjs` |
| `assets/css/fonts.css` | file mới | cần file `.woff2` mới chạy được |
| `scripts/build-images.mjs` | file mới | cần `npm i -D sharp`; mặc định xem trước |
| `scripts/clean-minor-data.mjs` | file mới | **đã chạy thật trên folder 56anphu** — 212 URL chết → 0 |
| `patches/01-site.js.md` | patch | logic đã kiểm qua unit test + trình duyệt |
| `patches/02-main.css.md` | patch | đã kiểm trong trang thử |
| `patches/03-html.md` | patch | cần áp vào template, không sửa file dist |

## Thứ tự áp dụng

1. `scripts/clean-minor-data.mjs --write` — độc lập, không ảnh hưởng gì khác
2. `patches/02-main.css.md` mục 1, 2 + `patches/03-html.md` mục 1, 2 — ảnh hero, quyết định LCP
3. `scripts/build-images.mjs --write` rồi `patches/03-html.md` mục 3 — giảm dung lượng
4. `assets/js/motion-gate.js` + `patches/01-site.js.md` + `patches/02-main.css.md` mục 3, 4
5. `patches/02-main.css.md` mục 5 — `content-visibility`
6. `assets/css/fonts.css` + `patches/03-html.md` mục 4 — font và GTM

Bước 2 và 6 quyết định con số LCP. Bước 4 quyết định TBT.

## Đã kiểm chứng được gì, và bằng cách nào

**`motionGate` — 15/15 đạt.** Test tất định trong Node với `IntersectionObserver`,
`document.hidden` và `matchMedia` đều bị stub, nên điều khiển được cả ba điều kiện.
Có kiểm cả trường hợp IO báo lặp (không được gọi `onEnter` hai lần), bật/tắt giảm chuyển
động giữa phiên, và `stop()` dọn sạch listener.

**Cặp CSS + JS chạy trong trình duyệt thật.** Trang thử ở `_test/index.html` dùng chính
`motion-gate.js` và chính `initHeroDust` đã patch, lấy từ source thật. Đo được năm trạng thái
đúng: hero trong viewport → `.is-visible` + `animation-play-state: running`; cuộn ra ngoài →
`paused`; cuộn về → `running`; chuyển tab → `paused`; quay lại tab → `running`.

**`clean-minor-data.mjs` chạy thật.** Trên
`HuongDong project/56anphu./content`: 56 URL trong `an-phu-data.js` + 78 `source_url` +
78 `local_file` trong `rws-78.json` = 212, sau khi xử lý còn 0. Script mặc định **không ghi**,
và sao lưu `.bak` trước khi ghi.

## Chưa kiểm chứng được — và vì sao

**Số LCP sau khi sửa.** Cần bản dựng thật của site để đo. Tôi chỉ có file đã build đang phục vụ,
không có repo sinh ra nó. Sau khi bạn áp patch, chạy:

```bash
cd /home/asus/output/tarot-teardown && ./lighthouse.sh https://huongdong.id.vn huongdong-sau
```

Cổng nghiệm thu: LCP < 2,5s · TBT < 200ms · performance ≥ 80 · **SEO vẫn 100 · a11y vẫn 97 · CLS vẫn 0**.

**Nhánh viewport của `motionGate` trong pane trình duyệt.** Trang trong pane luôn ở trạng thái
`document.hidden = true` nên `requestAnimationFrame` không chạy và IntersectionObserver bị
tiết chế. Đó cũng chính là lý do phải viết unit test với stub. Đáng chú ý: lần chạy đầu trong
pane cho `0 frame` — đúng hành vi mong muốn, cổng dừng từ chối chạy khi tab bị ẩn.

**Kích thước font sau khi tự host.** Chưa có file `.woff2` nên chưa đo được phần giảm thật.

## Ba việc phát hiện thêm khi bám vào markup

Không có trong bảng kiểm kê trước, tìm ra khi đọc 25 thẻ `<img>` của trang chủ:

1. **`suit-tre.png` nặng 2,6 MB** — PNG dùng làm thumbnail tin. Đây là tài sản nặng nhất
   trang chủ, nặng gấp 8 lần ảnh hero. Lighthouse không báo vì nó lazy dưới màn hình nên
   không được tải trong lượt đo.
2. **`trong-dong.png` 439KB dùng làm icon 46×46** ở header, **không** có `loading="lazy"`.
3. **`chim-lac.png` 355KB dùng làm hình 110×74** ở footer, cũng không lazy.

Nghĩa là hai file hoa văn đang bị tải về nguyên khổ **hai lần mục đích**: một lần cho
watermark CSS, một lần cho icon. `build-images.mjs` sinh biến thể cho cả hai mục đích.

## Hai chỗ tôi đổi ý so với bản đề xuất trước

**Lớp phủ hero dùng `<div class="hero-overlay">` chứ không phải `.hero::before`.**
Khi bám vào CSS thật thì thấy cả hai pseudo-element của `.hero` đã bị chiếm: `::after` là
quầng sáng đồng lệch tâm, còn `.hero:before` có sẵn `{right:9%;top:3%;width:min(720px,55vw);opacity:.22}`
— thêm `content:""` vào đó thì lớp phủ sẽ thừa hưởng `opacity:.22` và bị giới hạn chiều rộng.

**`hero-1536` chứ không phải `hero-1600`.** Nguồn tạm là `default-og.webp` rộng đúng 1536px.
Sinh bản 1600 sẽ là phóng to — nặng hơn mà không thêm một pixel thông tin. Khi có ảnh hero
gốc lớn hơn thì đổi lại.

## Dữ liệu 22 Ẩn Chính (bổ sung — bản đổi tên)

Đợt này gồm cả phần A. Tên 22 lá **không gõ tay**: bóc thẳng từ
`Huong-Dong-Tarot-78-Art-Direction-Storytelling.docx` v2.1 rồi sinh module.

| File | Vai trò |
|---|---|
| `scripts/parse-v21.mjs` | Bóc 22 lá + đăng ký nguồn S01–S22 từ DOCX → JSON |
| `content/major-arcana.json` | Dữ liệu thô đã bóc, giữ nguyên chữ của v2.1 |
| `scripts/gen-major-arcana.mjs` | Chuẩn hoá enum → sinh module |
| `content/major-arcana.mjs` | **Nguồn dữ liệu chuẩn**, sinh tự động, đừng sửa tay |
| `scripts/validate-major-arcana.mjs` | Cổng chặn offline, cắm vào CI |
| `scripts/verify-live-names.mjs` | Đối chiếu site thật với nguồn chuẩn |

Chạy lại toàn bộ khi có v2.2:

```bash
node scripts/parse-v21.mjs <docx> --out content/major-arcana.json
node scripts/gen-major-arcana.mjs
node scripts/validate-major-arcana.mjs
```

### Kết quả đo được

- **22/22 lá, 352/352 trường có dữ liệu** — v2.1 đã chứa đủ mọi trường schema cần
  (cảnh chính, khoảnh khắc quyết định, motif, bảng màu, KHÔNG ĐƯỢC VẼ, trạng thái ảnh,
  mức chuyển thể). Không phải bịa thêm gì.
- **Validator: 0 lỗi**, 34 cảnh báo (22 lá chưa duyệt văn hoá, 12 lá tranh cần sửa/vẽ lại).
- **Đối chiếu site: 6/22 tên khớp, 16 lá cần đổi** — đúng 9 P0 + 7 P1 như bảng kiểm kê.
- **Nguồn trích: 21/22 khớp.**

### Hai điều chỉnh trong lúc viết

**Validator của tôi sai trước, không phải dữ liệu.** Lần chạy đầu nó báo "20 lá có nguồn
LNCQ, trang chủ ghi 21/22 — sai". Nhưng v2.1 có bảng đăng ký S01–S22 mà tôi chưa đọc:
**S01–S19 là chương LNCQ, S20–S22 là nguồn ngoài** (UNESCO, Bảo tàng Lịch sử Quốc gia,
VietnamPlus). Lá XXI mang mức `EDITORIAL_FANTASY_INSPIRED` vì *bố cục* là sáng tác biên tập,
nhưng *chất liệu* vẫn rút từ bốn chương LNCQ — nên vẫn tính là có nguồn. Chỉ XVII
(S20 + S22, cả hai đều ngoài) là ngoại lệ thật. Con số 21/22 trên trang chủ **đúng**.
Đã sửa quy tắc: đếm theo nguồn, không đếm theo mức chuyển thể.

**Kiểm chéo nguồn ban đầu báo động giả 10 lá.** Các bản LNCQ đặt tên chương khác nhau
— "Truyện Cây Cau" / "Truyện Trầu Cau", "Truyện Đổng Thiên Vương" / "Truyện Phù Đổng
Thiên Vương" — và viết hoa cũng khác. So chuỗi thô che mất lá lệch thật. Đã đổi sang
so khớp theo từ khoá.

### Một lệch thật cần bạn quyết

**XXI · The World.** Trang đang trích *"Chương 10 · Truyện Bạch Trĩ"*, nhưng v2.1 ghi nguồn
của lá này là S02, S07, S08, S14, S21 — **không có S09 Truyện Chim trĩ trắng**. Mà tích
Việt Thường dâng chim trĩ trắng chính là truyện đó. Nhiều khả năng v2.1 sót S09 chứ không
phải trang sai. Tôi không tự thêm vào dữ liệu vì đây là quyết định biên tập, không phải lỗi parse.

### Ghi chú: hai file cũ đã bị thay thế

`dot-0/golden-mapping.json` và `dot-0/verify-mapping.mjs` giữ một bản danh sách tên riêng —
đúng thứ đã gây ra lỗi mà chúng đi tìm. `scripts/verify-live-names.mjs` thay chúng và đọc
thẳng từ `content/major-arcana.mjs`. Tôi để lại hai file cũ chứ không xoá, nhưng đừng cập nhật chúng nữa.

## 56 Ẩn Phụ (bổ sung)

Cùng đường ống với 22 Ẩn Chính. v2.1 có đủ art direction cho cả 56 lá.

| File | Vai trò |
|---|---|
| `scripts/parse-v21-minor.mjs` | Bóc 56 lá từ DOCX → JSON |
| `scripts/gen-minor-arcana.mjs` | Chuẩn hoá + gộp trường theo thứ bậc từ bộ 56 |
| `content/minor-arcana.mjs` | **Nguồn dữ liệu chuẩn 56 lá** |
| `content/sources.mjs` | Đăng ký nguồn S01–S22, dùng chung cho cả 78 lá |
| `content/folk-conflicts.md` | 23 lá cần biên tập quyết, sinh tự động |
| `scripts/validate-deck.mjs` | Cổng kiểm cả bộ 78 |

Chạy toàn bộ:

```bash
export V21="…/Huong-Dong-Tarot-78-Art-Direction-Storytelling.docx"
export AN_PHU="…/56anphu./content/an-phu-data.js"
npm run data && npm run check
```

**Kết quả: 56/56 lá · 560/560 trường · 78/78 slug duy nhất · 0 lỗi.**

### v2.1 phân xử ba xung đột trong bảng kiểm kê

**Tên bốn nhà.** v2.1 dùng bản dài — Cây Tre / Hoa Sen / Dâu Tằm / Bông Lúa — và thứ bậc
Tiểu Đồng / Kỵ Sĩ / Hoàng Hậu / Quốc Vương. Bản rút gọn đang hiển thị trên `/la-bai/`
("Tre / Sen / Dâu tằm / Lúa") là bản rút, không phải bản chuẩn. Module giữ cả hai trong
`suitVi` và `suitShort`, nhưng chỉ một nguồn.

**Chử Đồng Tử nằm ở lá nào.** v2.1 ghi rõ **Hai Hoa Sen · Two of Cups = "Tiên Dung và
Chử Đồng Tử — Hai chén bên bãi cát"**. Vậy `/huyen-su/` đúng; bộ 56 soạn tay đặt tích này ở
Bốn Hoa Sen là sai chỗ. Kèm theo, chỗ Hai Hoa Sen cũ của bộ 56 là "miếng trầu đám cưới" —
trùng mô-típ với lá VI The Lovers, nên việc theo v2.1 gỡ luôn cả trùng lặp đó.

**Slug.** Module sinh thẳng `ace-of-wands`, `two-of-cups` theo đúng URL site, không giữ
`wands-ace` của bộ 56.

### Gộp có chọn lọc, không gộp mù

Bộ 56 soạn tay đóng góp sáu trường **theo thứ bậc** — tình yêu, công việc, tài chính,
sức khoẻ, lời khuyên, cảnh báo. Chúng gắn với rank chứ không gắn với lá nên gộp an toàn:
56/56 lá đều có đủ.

Trường `folk` (neo dân gian) thì **không gộp tự động**: nó gắn với từng lá và được soạn
trên một ánh xạ khác. Script đối chiếu chủ thể v2.1 với neo cũ và tìm ra **23/56 lá lệch**,
xuất ra `content/folk-conflicts.md` để người biên tập quyết từng lá. Giữ v2.1, giữ neo cũ,
hay bỏ trống đều là lựa chọn hợp lệ — nhưng phải có người chọn.

### Một quy tắc của v2.1 được đưa thành test

v2.1 tự đặt ra: *"không dùng nhân vật chính của Ẩn Chính làm nhân vật Hoàng gia Ẩn Phụ"*.
`validate-deck.mjs` kiểm 16 lá hoàng gia đối chiếu 22 nhân vật chính — **đạt**. Đây là loại
lỗi chỉ lộ ra khi soi cả bộ, không lộ khi đọc từng lá.

## Codemod đổi tên (bổ sung)

| File | Vai trò |
|---|---|
| `scripts/scan-legacy-names.mjs` | Chụp mọi nhãn cũ đang hiển thị trên site → `content/legacy-names.json` |
| `scripts/apply-renames.mjs` | Đổi tên trong repo, mặc định xem trước |
| `_test/rename.test.mjs` | **9/9 test hồi quy đạt** |

```bash
npm run scan:legacy                      # cập nhật ảnh chụp nhãn cũ
REPO=/đường/dẫn/repo npm run rename      # xem trước
REPO=/đường/dẫn/repo npm run rename:write
```

**Kết quả quét site: 17/22 lá cần đổi · 19 nhãn cũ.** Nhiều hơn con số 16 ở lần trước vì
lá VIII tuy trang lá đã đúng ("Sơn Tinh") nhưng trang chủ vẫn ghi "Tản Viên Sơn Thánh" và
`/la-bai/` ghi "Sơn Tinh (Tản Viên)".

### Ba cái bẫy codemod phải né, và cách né

**1 · Cùng một tên, hai vai khác nhau.** "Chử Đồng Tử" vừa là nhãn cũ của lá IX, vừa là một
trong Tứ Bất Tử ở trang chủ — vai thứ hai là sự thật văn hoá, không phụ thuộc bộ bài. Thay mù
sẽ viết "Dương Không Lộ" vào danh sách Tứ Bất Tử.

*Cách né:* chỉ thay khi tên nằm cạnh một mỏ neo nhận dạng lá (slug, số La Mã, tên RWS) trên
**chính dòng đó**; nới ra cửa sổ ±2 dòng chỉ khi dòng đó không có neo nào **và** trong cửa sổ
không có neo của lá khác. Mọi chỗ còn lại vào danh sách "cần người đọc", không tự động đụng.

**2 · Tên mới của lá này là tên cũ của lá kia.** XIV đổi thành "Lang Liêu", mà "Lang Liêu"
chính là tên cũ của XI. Thay tuần tự thì luật của XI sẽ đổi tiếp chỗ vừa ghi, cho ra
`temperance → Tô Lịch Giang Thần / Long Đỗ` — sai hoàn toàn. **Bug này đã xảy ra thật** ở bản
đầu và bị diff bắt được.

*Cách né:* hai lượt. Lượt một thay bằng token trung gian `\u0000HD<n>\u0000`, lượt hai đổi
token thành tên thật. Tên mới không bao giờ nằm trong tầm quét của luật sau.

**3 · Số La Mã lồng nhau.** "IX" khớp bên trong "XIX", nên lá IX suýt gán tên cho lá XIX.

*Cách né:* mọi so khớp số La Mã đều có biên giới từ. Test hồi quy có ca riêng cho việc này.

### Giới hạn còn lại

Codemod chỉ đọc file văn bản (bỏ `node_modules`, `.git`, `dist`, `build`, `.next`, `.astro`).
Nó **không** đổi tên file ảnh, không sửa nội dung trong CSDL, và không đụng slug URL — đó là
chủ ý, vì đổi slug là mất index.

Chạy trên cây git sạch để còn `git diff` mà soát. Danh sách "cần người đọc" nên xem hết trước
khi commit; `--loose` thay cả những chỗ đó nhưng tôi khuyên đừng dùng.

## Repo thật đã tìm ra

Không cần tạo repo mới trên GitHub. `REPO=...` là **đường dẫn thư mục trên máy**, và
thư mục đó đã có sẵn:

```
/home/asus/Desktop/HuongDong project/Huong-Dong-Claude-Handover-2026-08-09-update-main./
  Huong-Dong-Claude-Handover-2026-08-09-update-main/source/firebase-handover
```

Xác nhận đây là bản đang chạy: `dist/la-bai/justice/index.html` chứa đồng thời
"Chương 17", "Tô Lịch" và "Lang Liêu" — đúng mâu thuẫn quan sát được trên site. Đủ các route
`/huyen-su/`, `/healing/`, `/tarot-la-gi/`, `/trai-bai/`.

Đây là **static site generator tự viết**: `templates/` + `data/` + `scripts/build.js` → `dist/`.
Không phải Next.js. Thư mục `source/app/tarot-rws/` mà DOCX Big Update nhắm tới là một nhánh khác,
không sinh ra site này.

Lệnh chạy:

```bash
REPO="/home/asus/Desktop/HuongDong project/Huong-Dong-Claude-Handover-2026-08-09-update-main./Huong-Dong-Claude-Handover-2026-08-09-update-main/source/firebase-handover"
node scripts/apply-renames.mjs --dir "$REPO" --exclude "luocsutocviet.com,dist,node_modules"
```

**Kết quả xem trước: 68 file · 43 chỗ có neo · 54 chỗ cần đọc tay · 3 file sẽ sửa.**

### Tên lá đang nằm ở bốn nơi

`data/lncq-22.json` · `public/assets/js/deck-data.js` · `seed/cards.json` ·
hardcode trong `templates/huyen-su.html` và `scripts/build.js`. Đây chính là "một sự thật
được chép ở nhiều chỗ" ở dạng cụ thể nhất.

### Bốn bẫy chỉ lộ ra khi chạy trên repo thật

Fixture không có cái nào trong bốn cái này. Cả bốn đều được dry-run bắt trước khi ghi.

**1 · `luocsutocviet.com/` là bản chép site bên thứ ba.** 33 file ở đó nhắc "Lang Liêu"
trong bài viết của họ. Đổi tên trong đó vừa sai vừa là sửa nội dung người khác.
→ thêm cờ `--exclude`.

**2 · `data/lncq-chapters.json` nặng 131KB nhưng 0 ký tự xuống dòng.** File JSON minify nằm
trọn một dòng thì neo theo dòng vô nghĩa: cả file là một ngữ cảnh nên mọi tên khớp mọi mỏ neo.
→ file có độ dài dòng trung bình > 500 ký tự bị đẩy hết sang "cần đọc tay".

**3 · Khối Tứ Bất Tử có mỏ neo thật nhưng tên đóng vai khác.** `templates/huyen-su.html`
và mảng `immortalSpecs` trong `scripts/build.js` đều ghi tên nhân vật cạnh mã lá — nhưng đó là
tên NGƯỜI trong tín ngưỡng, không phải nhãn lá. Heuristic mỏ neo bị lừa vì mỏ neo có thật.
→ thêm bộ đánh dấu vai: `immortal`, `portrait`, `tu-bat-tu`, `Tứ Bất Tử`.

**4 · Nhãn cũ là tiền tố của tên mới.** Lá IV đang là "Hùng Vương", tên mới là
"Hùng Vương đầu triều". Dòng nào đã đổi rồi thì chuỗi cũ vẫn nằm bên trong chuỗi mới —
thay tiếp cho ra `Hùng Vương đầu triều đầu triều`. Repo có đúng trường hợp đó ở
`templates/huyen-su.html` dòng 28.
→ che các chỗ đã đúng trước khi thay, trả lại sau. Codemod giờ chạy bao nhiêu lần cũng
cho cùng kết quả, và có test riêng cho việc đó.

### Đã chạy thử `--write` trên bản sao

Không đụng repo thật. Kết quả: **0 chỗ nhân đôi hậu tố · Tứ Bất Tử trong `build.js` còn nguyên
2 mục · `seed/cards.json` đổi đúng 4 chỗ sang "Tô Lịch Giang Thần"**.

`_test/rename.test.mjs`: **12/12 đạt**, gồm ca tiền tố và ca chạy hai lần.

## GitHub: repo có, nhưng KHÔNG chứa mã nguồn đang chạy

Clone: `dot-0/repo` — `main` @ `56d5408` (16/08/2026), private, 83MB.

**Bản local đi trước GitHub một quãng dài.** Đối chiếu `source/firebase-handover`:

| | GitHub main | Local |
|---|---|---|
| `templates/` | 9 file | **14 file** |
| `data/` | *không có thư mục* | `lncq-22.json`, `lncq-chapters.json` |
| `scripts/build.js` | 16.985 B | **22.737 B** |
| `templates/home.html` | 6.906 B | **9.713 B** |

Năm template chỉ có ở local: `huyen-su.html`, `healing.html`, `tarot-la-gi.html`,
`trai-bai.html`, `cua-hang.html`. Đã kiểm **cả 10 nhánh** trên GitHub — không nhánh nào có
`huyen-su.html`.

Nghĩa là **toàn bộ lớp dẫn nguồn LNCQ** — thứ làm nên khác biệt cốt lõi của Hường Đông, và là
thứ khiến 9 lá P0 sửa được rẻ — chỉ tồn tại trên ổ đĩa này. Chưa từng được đẩy lên GitHub.

### Bằng chứng local chính là bản đang chạy

So `dist/` local với file đang phục vụ trên mạng:

- `assets/js/site.js` — **giống hệt từng byte**
- `assets/css/main.css` — **giống hệt từng byte**
- `assets/js/light-journey.js` — **giống hệt từng byte**
- `index.html` — lệch đúng 246 byte, và toàn bộ chỗ lệch là đoạn Google Analytics

Đoạn GA đó do `scripts/lib/seo.js` sinh lúc build, chỉ khi `site.ga4Id` hợp lệ. Bản dựng ở máy
không có biến đó nên không có đoạn này. **Đây là lý do patch hoãn GTM phải sửa ở `seo.js`,
không phải template** — đã sửa lại ở `patches/03-html.md` mục 4.

### Việc nên làm trước khi chạy codemod

Repo local chưa có `.git`. Nên đưa nó lên một nhánh mới trước, vì hai lý do độc lập nhau:

1. **Sao lưu.** Mã nguồn của site đang chạy hiện chỉ có một bản, trên một ổ đĩa.
2. **Soát được.** Có git thì `git diff` cho xem đúng 43 chỗ codemod đổi, thay vì tin vào báo cáo.

Tôi không tự đẩy lên GitHub — đó là việc cần bạn đồng ý trước.
