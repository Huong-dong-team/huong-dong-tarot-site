#!/usr/bin/env node
/* Sinh biến thể ảnh cho trang chủ.
 *
 *   node scripts/build-images.mjs            # xem trước, không ghi gì
 *   node scripts/build-images.mjs --write
 *
 * Nguyên tắc: không bao giờ ghi đè ảnh gốc, không bao giờ phóng to quá khổ thật.
 * Phóng to chỉ làm file nặng hơn mà không thêm một pixel thông tin nào.
 *
 * Cần: npm i -D sharp
 */

import sharp from "sharp";
import { mkdir, stat, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
/* Thư mục gốc chứa assets. Trong repo này ảnh nằm ở public/assets/img, nhưng
   script vẫn chạy được ở cây khác nên để thành tham số. */
const rootIdx = process.argv.indexOf("--root");
const ROOT = rootIdx > -1 ? process.argv[rootIdx + 1] : ".";
const IMG = `${ROOT}/assets/img`;

/* Chất lượng: AVIF 50 tương đương WebP 75 về cảm nhận nhưng nhỏ hơn ~30%.
   Hai hoa văn dùng q=35 vì chúng hiển thị ở độ mờ 4,5–5,5% — không ai nhìn
   thấy artefact ở mức phủ đó. */
const AVIF = { quality: 50, effort: 5 };
const AVIF_LOW = { quality: 35, effort: 5 };
const WEBP = { quality: 75 };

const JOBS = [
  // Hero phù điêu sơn mài. Nguồn 1536×1024 là artwork mới đã được duyệt để
  // chừa phần giấy sáng ở bên phải cho copy; không ghi đè hero cũ để có thể
  // quay lại khi cần đối chiếu.
  { src: `${IMG}/hero-relief-source.webp`, out: `${IMG}/hero-relief`, widths: [800, 1200, 1536], formats: ["avif", "webp"],
    note: "nền hero phù điêu sơn mài" },

  // ── Ảnh hero. Nguồn tạm là default-og.webp (1536×1024) cho tới khi có ảnh
  // hero riêng. Vì nguồn rộng 1536 nên KHÔNG sinh bản 1600 — sẽ là phóng to.
  { src: `${IMG}/default-og.webp`, out: `${IMG}/hero`,  widths: [800, 1200, 1536], formats: ["avif", "webp"],
    note: "nền hero — nguồn tạm, xem ghi chú cuối file" },

  // ── Thumbnail bài viết. Hiển thị trong ô rộng 1/3 cột, tối đa ~400px trên
  // desktop và ~full width trên di động.
  { src: `${IMG}/default-og.webp`, out: `${IMG}/news-binh-minh`, widths: [400, 800], formats: ["avif", "webp"],
    note: "thumbnail tin — thay việc dùng thẳng ảnh OG 335KB" },
  /* Bốn phù hiệu nhà, mỗi cái 2,4–2,8MB PNG. Chúng là thumbnail của cả 56 lá
     Ẩn Phụ trong thư viện, nên đây là khối nặng nhất toàn site: 10,4MB. */
  ...["tre", "sen", "dau-tam", "lua"].map((suit) => ({
    src: `${IMG}/suits/suit-${suit}.png`,
    out: `${IMG}/suits/suit-${suit}`,
    widths: [400, 800],
    formats: ["avif", "webp"],
    note: `phù hiệu nhà ${suit} — thumbnail của 14 lá`,
  })),

  // ── Hoa văn nền. Bị phủ hơn 94% độ mờ nên 640px là quá đủ.
  { src: `${IMG}/trong-dong.png`, out: `${IMG}/trong-dong`, widths: [640], formats: ["avif", "webp"], q: "low",
    note: "watermark CSS ở opacity .055" },
  { src: `${IMG}/chim-lac.png`, out: `${IMG}/chim-lac`, widths: [640], formats: ["avif", "webp"], q: "low",
    note: "watermark CSS ở opacity .045" },

  // ── Cùng hai file đó còn bị dùng làm icon. 2× khổ hiển thị là đủ cho màn Retina.
  { src: `${IMG}/trong-dong.png`, out: `${IMG}/trong-dong`, widths: [96], formats: ["avif", "webp"],
    note: "icon 46×46 ở header — đang tải cả 439KB" },
  { src: `${IMG}/chim-lac.png`, out: `${IMG}/chim-lac`, widths: [220], formats: ["avif", "webp"],
    note: "hình 110×74 ở footer — đang tải cả 355KB" },
];

/* Quét thêm mọi ảnh còn lại nặng hơn ngưỡng. Danh sách JOBS ở trên là các ca
   đặc biệt (đổi khổ, đổi mục đích); phần này lo phần còn lại một cách đều tay:
   tranh 22 lá, chân dung Tứ Bất Tử, tranh trang trí các mục. */
const AUTO_DIRS = ["", "/cards", "/immortals"];
const AUTO_MIN_BYTES = 150 * 1024;
const already = new Set(JOBS.map((j) => j.src));

for (const sub of AUTO_DIRS) {
  let entries = [];
  try { entries = await readdir(`${IMG}${sub}`); } catch { continue; }
  for (const name of entries) {
    if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
    if (/-\d+\.(avif|webp)$/i.test(name)) continue;          // biến thể đã sinh
    const src = `${IMG}${sub}/${name}`;
    if (already.has(src)) continue;
    let st; try { st = await stat(src); } catch { continue; }
    if (st.size < AUTO_MIN_BYTES) continue;
    JOBS.push({
      src,
      out: src.replace(/\.(png|jpe?g|webp)$/i, ""),
      widths: [400, 800],
      formats: ["avif"],
      note: `tự quét · ${(st.size / 1024).toFixed(0)}KB`,
    });
  }
}

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + " KB";
const rows = [];
let totalBefore = 0, totalAfter = 0, skipped = 0;

for (const job of JOBS) {
  if (!existsSync(job.src)) {
    console.error(`✗ thiếu nguồn: ${job.src}`);
    skipped++;
    continue;
  }

  const srcSize = (await stat(job.src)).size;
  const meta = await sharp(job.src).metadata();
  await mkdir(path.dirname(job.out), { recursive: true });

  for (const w of job.widths) {
    if (w > meta.width) {
      console.error(`  ⚠ bỏ qua ${path.basename(job.out)}-${w}: nguồn chỉ rộng ${meta.width}px, phóng to không thêm thông tin`);
      continue;
    }
    for (const fmt of job.formats) {
      const dest = `${job.out}-${w}.${fmt}`;
      const pipe = sharp(job.src).resize({ width: w, withoutEnlargement: true });
      const opts = fmt === "avif" ? (job.q === "low" ? AVIF_LOW : AVIF) : WEBP;
      const buf = await pipe[fmt](opts).toBuffer();

      if (WRITE) await sharp(buf).toFile(dest);

      rows.push({ dest, w, fmt, before: srcSize, after: buf.length, note: job.note });
      // Chỉ tính vào tổng một lần cho mỗi biến thể AVIF — đó là thứ trang thật sẽ tải.
      if (fmt === "avif") { totalAfter += buf.length; }
    }
  }
  // Dung lượng "trước" tính một lần cho mỗi lượt dùng, không cộng trùng theo width.
  totalBefore += srcSize;
}

console.log(`\n${WRITE ? "ĐÃ GHI" : "XEM TRƯỚC (thêm --write để ghi thật)"}\n`);
console.log("SAU        TRƯỚC      GIẢM   FILE");
for (const r of rows) {
  const pct = ((1 - r.after / r.before) * 100).toFixed(0);
  console.log(`${kb(r.after)}  ${kb(r.before)}  ${String(pct).padStart(4)}%   ${r.dest}`);
}

console.log(`\nTổng nguồn đang tải : ${kb(totalBefore)}`);
console.log(`Tổng AVIF thay thế  : ${kb(totalAfter)}`);
console.log(`Giảm                : ${kb(totalBefore - totalAfter)}  (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
if (skipped) console.log(`\n${skipped} job bị bỏ vì thiếu file nguồn.`);

console.log(`
GHI CHÚ

1. default-og.webp KHÔNG bị xoá hay ghi đè — nó vẫn là ảnh og:image. Chỉ thôi
   dùng nó làm nền hero và thumbnail.

2. Ảnh hero hiện lấy tạm từ default-og.webp, rộng 1536px, nên bản lớn nhất là
   hero-1536 chứ không phải 1600. Nếu bạn có bản gốc rộng hơn, đặt nó ở
   ${IMG}/hero-source.<ext> và đổi dòng JOBS đầu tiên trỏ vào đó — lúc đó thêm
   1600 và 2000 vào mảng widths.

3. Script không sinh <picture>. HTML dùng thẳng .avif; các file .webp sinh ra để
   dự phòng nếu bạn cần phủ thiết bị cũ hơn.
`);
