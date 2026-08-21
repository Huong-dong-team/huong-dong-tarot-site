#!/usr/bin/env node
/* Đối chiếu tên đang hiển thị trên site với nguồn dữ liệu chuẩn.
 *
 *   node scripts/verify-live-names.mjs                       # production
 *   node scripts/verify-live-names.mjs http://localhost:4321 # bản dựng cục bộ
 *
 * Đọc thẳng từ content/major-arcana.mjs, KHÔNG giữ bản danh sách tên thứ hai.
 * Bản trước của script này có golden-mapping.json riêng — chính là thứ đã tạo ra
 * lỗi mà nó đi tìm: một sự thật được chép ở hai nơi rồi lệch nhau.
 */

import { MAJOR_ARCANA, sourcesOf } from "../content/major-arcana.mjs";

const ORIGIN = (process.argv[2] || "https://huongdong.id.vn").replace(/\/$/, "");
const C = { red:"\x1b[31m", green:"\x1b[32m", yellow:"\x1b[33m", dim:"\x1b[2m", bold:"\x1b[1m", off:"\x1b[0m" };

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/\s+/g," ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`${C.bold}Tên hiển thị vs nguồn chuẩn${C.off}  ${C.dim}${ORIGIN}${C.off}\n`);

let ok = 0, mismatch = 0, failed = 0;
const rows = [];

for (const card of MAJOR_ARCANA) {
  await sleep(300);
  let h1 = null, err = null, cited = null;
  try {
    const res = await fetch(`${ORIGIN}/la-bai/${card.slug}/`, { headers: { "user-agent": "HuongDong-verify/2.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    h1 = strip((html.match(/<main[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "");
    cited = (html.match(/Chương\s*\d+\s*·\s*[^<]+/) || [])[0]?.trim() || null;
  } catch (e) { err = e.message; }

  const match = h1 === card.vietnameseTitle;
  if (err) failed++; else if (match) ok++; else mismatch++;
  rows.push({ card, h1, cited, match, err });

  const mark = err ? `${C.red}ERR${C.off}` : match ? `${C.green} ok${C.off}` : `${C.red}  ✗${C.off}`;
  console.log(`${mark} ${card.roman.padEnd(5)} ${(h1 ?? err ?? "?").slice(0,32).padEnd(33)} ${C.dim}→${C.off} ${card.vietnameseTitle}`);
}

/* Kiểm chéo: khối dẫn nguồn trên trang có trỏ đúng truyện trong dữ liệu không.
   So khớp theo từ khóa chứ không so chuỗi: các bản LNCQ đặt tên chương khác nhau
   ("Truyện Cây Cau" / "Truyện Trầu Cau", "Truyện Đổng Thiên Vương" /
   "Truyện Phù Đổng Thiên Vương"), và cách viết hoa cũng khác. So chuỗi thô sẽ
   báo động giả 10 lá và che mất lá lệch thật. */
const STOP = new Set(["truyện", "họ", "thị", "và", "hai", "vị", "của", "người", "ở"]);
const keyTokens = (s) =>
  new Set(
    s.toLowerCase()
      .replace(/^chương\s*\d+\s*·\s*/, "")
      .replace(/[.,;:()]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP.has(w)),
  );

console.log(`\n${C.bold}Nguồn trích trên trang vs dữ liệu${C.off}`);
let srcOk = 0, srcOff = 0;
for (const { card, cited } of rows) {
  const expect = sourcesOf(card).filter((s) => s.isLNCQ);
  if (!cited) {
    // Không trích gì: đúng khi lá không có nguồn LNCQ nào (chỉ XVII).
    expect.length === 0 ? srcOk++ : srcOff++;
    if (expect.length) console.log(`  ${C.yellow}!${C.off} ${card.roman.padEnd(5)} trang không trích nguồn, dữ liệu có ${expect.map((s) => s.title).join(" / ")}`);
    continue;
  }
  const citedTokens = keyTokens(cited);
  const hit = expect.some((s) => [...keyTokens(s.title)].some((t) => citedTokens.has(t)));
  hit ? srcOk++ : srcOff++;
  if (!hit) {
    console.log(`  ${C.red}✗${C.off} ${card.roman.padEnd(5)} trang trích ${C.bold}${cited}${C.off}`);
    console.log(`    ${C.dim}dữ liệu có: ${expect.map((s) => `${s.id} ${s.title}`).join(" · ") || "(không nguồn LNCQ)"}${C.off}`);
  }
}
if (!srcOff) console.log(`  ${C.green}✓${C.off} mọi khối dẫn nguồn khớp dữ liệu`);

console.log(`\n${C.bold}Tổng kết${C.off}`);
console.log(`  tên khớp nguồn chuẩn : ${ok}/22`);
console.log(`  tên còn lệch         : ${mismatch}   ${mismatch ? C.red + "← chặn phát hành" + C.off : C.green + "✓" + C.off}`);
console.log(`  nguồn trích khớp     : ${srcOk}/22`);
if (failed) console.log(`  lỗi tải              : ${failed}`);

process.exit(mismatch || failed ? 1 : 0);
