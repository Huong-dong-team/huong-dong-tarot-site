#!/usr/bin/env node
/* Dọn ba lỗi chặn việc nhập bộ 56 Ẩn Phụ vào site.
 *
 *   node scripts/clean-minor-data.mjs <thư-mục-content>            # xem trước
 *   node scripts/clean-minor-data.mjs <thư-mục-content> --write    # ghi thật
 *
 * Mặc định KHÔNG ghi. Đây là script sửa dữ liệu nội dung đã soạn tay, nên
 * để chế độ xem trước làm mặc định thay vì phải nhớ thêm cờ --dry-run.
 *
 * KHÔNG đọc, KHÔNG sửa, KHÔNG tham chiếu an-chinh-data.js trong cùng thư mục.
 * Đó là bản ánh xạ 22 Ẩn Chính đã bị loại (14/22 lá, mâu thuẫn nguồn chuẩn) và
 * sẽ bị xoá khỏi repo. Nếu script này chạm vào nó, dữ liệu sai sẽ lan sang bộ 56.
 */

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = process.argv[2];
const WRITE = process.argv.includes("--write");
if (!DIR) {
  console.error("Dùng: node scripts/clean-minor-data.mjs <thư-mục-content> [--write]");
  process.exit(1);
}

const DEAD_HOST = "huong-dong-tarot.hongkhang21998.chatgpt.site";
const DEAD_BASE = `https://${DEAD_HOST}/tarot-rws/`;
const LIVE_BASE = "https://huongdong.id.vn/la-bai/";

const RANKS = ["ace","two","three","four","five","six","seven","eight","nine","ten","page","knight","queen","king"];
const SUITS = ["wands","cups","swords","pentacles"];

/* Slug của site theo quy ước "<rank>-of-<suit>"; file dữ liệu dùng "<suit>-<rank>".
   Sinh bảng map từ chính hai mảng trên để không phải viết tay 56 dòng dễ sai. */
const toSiteSlug = new Map();
const toFileSlug = new Map();
for (const s of SUITS) {
  for (const r of RANKS) {
    toSiteSlug.set(`${s}-${r}`, `${r}-of-${s}`);
    toFileSlug.set(`${r}-of-${s}`, `${s}-${r}`);
  }
}

const log = [];
const say = (s = "") => { log.push(s); console.log(s); };

/* ─────────────── 1 · an-phu-data.js ─────────────── */

const apPath = path.join(DIR, "an-phu-data.js");
if (!existsSync(apPath)) { console.error(`✗ không thấy ${apPath}`); process.exit(1); }
let ap = await readFile(apPath, "utf8");
const apBefore = ap;

say("── an-phu-data.js ──");

const apDead = (ap.match(new RegExp(DEAD_HOST.replace(/\./g, "\\."), "g")) || []).length;
ap = ap.replaceAll(DEAD_BASE, LIVE_BASE);
// Đường dẫn site có dấu / cuối; URL cũ không có. Thêm vào cho khớp canonical thật.
ap = ap.replace(new RegExp(`(${LIVE_BASE.replace(/[/.]/g, "\\$&")}[a-z0-9-]+)(?=")`, "g"), "$1/");
say(`  URL tên miền chết      : ${apDead} → 0`);

/* siteSlug: thêm vào object trả về của buildCards(), ngay cạnh slug hiện có.
   Chèn bằng cách neo vào dòng `slug: suit + "-" + rank,` để không phá thứ tự
   các trường khác và không cần parse AST. */
const slugAnchor = /slug:\s*suit \+ "-" \+ rank,/;
if (slugAnchor.test(ap)) {
  ap = ap.replace(
    slugAnchor,
    `slug: suit + "-" + rank,
        // Slug dùng trên site là "<rank>-of-<suit>" (/la-bai/ace-of-wands/).
        // Giữ cả hai: slug cũ để dữ liệu nội bộ không phải đổi, siteSlug để render.
        siteSlug: rank + "-of-" + suit,`,
  );
  say("  siteSlug               : đã thêm vào buildCards()");
} else {
  say("  siteSlug               : ⚠ không tìm thấy neo `slug: suit + \"-\" + rank,` — cần thêm tay");
}

/* contentStatus đang hardcode "ready" cho cả 56 lá, trong khi thư mục assets
   chưa có một ảnh Ẩn Phụ nào. Tách thành hai trạng thái độc lập: chữ đã xong,
   ảnh thì chưa. Cố ý KHÔNG suy ra imageStatus từ việc file ảnh có tồn tại hay
   không — một file nằm đó không có nghĩa là nó đã được duyệt. */
if (ap.includes('contentStatus: "ready"')) {
  ap = ap.replace(
    'contentStatus: "ready"',
    `contentStatus: "text-ready",   // chữ đã biên tập xong
        imageStatus: "missing",         // chưa có tranh Ẩn Phụ nào được sản xuất
        culturalReviewStatus: "pending" // chưa qua duyệt văn hoá – lịch sử`,
  );
  say('  contentStatus          : "ready" → text-ready + imageStatus + culturalReviewStatus');
} else {
  say("  contentStatus          : không thấy chuỗi hardcode, bỏ qua");
}

/* ─────────────── 2 · rws-78.json ─────────────── */

const rwsPath = path.join(DIR, "rws-78.json");
if (!existsSync(rwsPath)) { console.error(`✗ không thấy ${rwsPath}`); process.exit(1); }
const rwsRaw = await readFile(rwsPath, "utf8");
const rws = JSON.parse(rwsRaw);

say("\n── rws-78.json ──");
say(`  ${rws.length} phần tử`);

let fixedUrl = 0, droppedLocal = 0;
for (const card of rws) {
  if (typeof card.source_url === "string" && card.source_url.includes(DEAD_HOST)) {
    const slug = card.source_url.split("/tarot-rws/")[1]?.replace(/\/$/, "");
    card.source_url = slug ? `${LIVE_BASE}${slug}/` : card.source_url;
    fixedUrl++;
  }
  /* local_file là rác từ lần scrape cũ: đường dẫn tới file HTML đã tải về từ tên
     miền chết. Không có gì để trỏ tới nữa nên xoá hẳn, thay vì viết lại một
     đường dẫn cũng không tồn tại. */
  if ("local_file" in card) { delete card.local_file; droppedLocal++; }
}
say(`  source_url sửa         : ${fixedUrl}`);
say(`  local_file xoá         : ${droppedLocal}`);

/* ─────────────── 3 · Kiểm chứng ─────────────── */

const rwsOut = JSON.stringify(rws, null, 2) + "\n";
const remain =
  (ap.match(new RegExp(DEAD_HOST.replace(/\./g, "\\."), "g")) || []).length +
  (rwsOut.match(new RegExp(DEAD_HOST.replace(/\./g, "\\."), "g")) || []).length;

say("\n── Kiểm chứng ──");
say(`  còn lại "${DEAD_HOST}" : ${remain}   ${remain === 0 ? "✓" : "✗ CHƯA SẠCH"}`);
say(`  bảng slug              : ${toSiteSlug.size} cặp (ví dụ wands-ace → ${toSiteSlug.get("wands-ace")})`);

if (!WRITE) {
  say("\nXEM TRƯỚC — chưa ghi gì. Thêm --write để áp dụng.");
  process.exit(remain === 0 ? 0 : 1);
}

// Sao lưu trước khi ghi. Đây là nội dung soạn tay, không sinh lại được.
await copyFile(apPath, apPath + ".bak");
await copyFile(rwsPath, rwsPath + ".bak");
await writeFile(apPath, ap, "utf8");
await writeFile(rwsPath, rwsOut, "utf8");

say(`\nĐÃ GHI. Bản gốc lưu ở *.bak`);
say(`  ${apPath}  (${apBefore.length} → ${ap.length} byte)`);
say(`  ${rwsPath} (${rwsRaw.length} → ${rwsOut.length} byte)`);
process.exit(remain === 0 ? 0 : 1);
