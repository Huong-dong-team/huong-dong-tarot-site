#!/usr/bin/env node
/* Sinh module dữ liệu chuẩn 22 Ẩn Chính từ JSON đã bóc khỏi v2.1.
 *
 *   node scripts/gen-major-arcana.mjs
 *
 * Tách khỏi parse-v21.mjs có chủ đích: bóc chữ từ DOCX và chuẩn hóa dữ liệu là
 * hai việc khác nhau. Khi v2.2 ra, chỉ chạy lại bước bóc; khi cần thêm trường
 * hay đổi enum, chỉ sửa bước này.
 */

import { readFileSync, writeFileSync } from "node:fs";

const IN = "content/major-arcana.json";
const OUT = "content/major-arcana.mjs";
const OUT_SOURCES = "content/sources.mjs";

const doc = JSON.parse(readFileSync(IN, "utf8"));

/* v2.1 ghi trạng thái ảnh bằng tiếng Việt tự do — có 8 biến thể, gồm cả
   "CHỈNH / VẼ LẠI" và "GIỮ ẢNH, KHÓA TÊN". Code không nên so chuỗi tiếng Việt
   có dấu, nên chuẩn hóa về enum và giữ nguyên bản gốc ở trường raw để người
   biên tập vẫn đọc được đúng chữ mình viết. */
const IMAGE_STATUS = [
  [/^GIỮ ẢNH, KHÓA TÊN$/i, "KEEP_IMAGE_LOCK_NAME"],
  [/^GIỮ$/i,               "KEEP"],
  [/VẼ LẠI/i,              "REDRAW"],       // gồm cả "CHỈNH / VẼ LẠI"
  [/^CHỈNH NHẸ$/i,         "ADJUST_MINOR"],
  [/^CHỈNH$/i,             "ADJUST"],
  [/THỬ NGHIỆM/i,          "EXPERIMENT"],
  [/Ý TƯỞNG MỚI/i,         "NEW_CONCEPT"],
];
const normImageStatus = (raw) => {
  for (const [re, val] of IMAGE_STATUS) if (re.test(raw.trim())) return val;
  throw new Error(`Trạng thái ảnh chưa có trong enum: "${raw}"`);
};

/* Enum mức chuyển thể — khóa cứng. Một giá trị lạ nghĩa là v2.x đã đổi quy ước
   và phải có người đọc lại, chứ không phải im lặng cho qua. */
const ADAPTATION = new Set([
  "LNCQ_CORE",
  "LNCQ_CORE_ADAPTATION",
  "LNCQ_TUC_BIEN_ADAPTATION",
  "VIET_FOLK_EXPANDED_ADAPTATION",
  "EDITORIAL_FANTASY_INSPIRED",
]);

const cards = doc.cards.map((c) => {
  if (!ADAPTATION.has(c.adaptationLevel)) {
    throw new Error(`${c.roman}: mức chuyển thể lạ "${c.adaptationLevel}"`);
  }
  return {
    id: `major-${String(c.number).padStart(2, "0")}`,
    number: c.number,
    roman: c.roman,
    slug: c.slug,                       // KHÔNG đổi: quyết định URL /la-bai/<slug>/
    rwsName: c.rwsName,

    vietnameseTitle: c.vietnameseTitle,
    subtitle: c.subtitle,

    // Lõi RWS — bất biến. Mọi migration phải giữ nguyên ba trường này.
    keywords: c.keywords,
    uprightMeaning: c.uprightMeaning,
    reversedMeaning: c.reversedMeaning,

    fullRetelling: c.fullRetelling,
    sourceStory: c.sourceStory,
    tarotBridge: c.tarotBridge,

    mainScene: c.mainScene,
    decisiveMoment: c.decisiveMoment,
    props: c.props.split(/\s*,\s*/).filter(Boolean),
    palette: c.palette.split(/\s*,\s*/).filter(Boolean),
    visualCreative: c.visualCreative,
    doNotDraw: c.doNotDraw,
    editorialNote: c.editorialNote ?? null,

    // Một lá có thể rút từ nhiều truyện (XXI lấy từ năm truyện).
    sourceIds: c.sourceId.split(/\s*,\s*/).filter(Boolean),
    adaptationLevel: c.adaptationLevel,

    imageStatus: normImageStatus(c.imageStatus),
    imageStatusRaw: c.imageStatus,

    // Ba trạng thái duyệt độc lập. Chữ đã có từ v2.1; ảnh và duyệt văn hoá thì
    // chưa — và KHÔNG được suy ra từ việc file ảnh có tồn tại hay không.
    contentStatus: "text-ready",
    culturalReviewStatus: "pending",
  };
});

const banner = `/* Nguồn dữ liệu chuẩn cho 22 Ẩn Chính — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY.
 *
 *   Nguồn : ${doc.source}
 *   Sinh  : node scripts/parse-v21.mjs <docx> --out ${IN}
 *           node scripts/gen-major-arcana.mjs
 *
 * Sửa nội dung thì sửa ở DOCX v2.x rồi chạy lại hai lệnh trên. Sửa thẳng vào
 * đây sẽ mất trong lần sinh kế tiếp, và tệ hơn: tạo ra nguồn sự thật thứ hai,
 * đúng thứ đã khiến 9 lá lệch tên khỏi nguồn trích của chính chúng.
 */\n\n`;

/* Bảng nguồn không thuộc riêng Ẩn Chính hay Ẩn Phụ — cả 78 lá đều trỏ vào nó.
   Để nó ở module riêng thay vì export kèm major-arcana, nếu không Ẩn Phụ sẽ phải
   import từ Ẩn Chính chỉ để tra một mã nguồn. */
const sourcesModule = `/* Đăng ký nguồn S01–S22 — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY.
 * isLNCQ phân biệt chương Lĩnh Nam chích quái với nguồn ngoài (UNESCO, bảo tàng,
 * báo chí) — cần thiết để trả lời đúng câu "bao nhiêu lá có nguồn LNCQ".
 */
export const SOURCES = Object.freeze(${JSON.stringify(doc.sources, null, 2)});

const BY_ID = Object.freeze(Object.fromEntries(SOURCES.map((s) => [s.id, s])));

/** Lá này có ít nhất một nguồn thuộc Lĩnh Nam chích quái không? */
export function hasLNCQSource(card) {
  return card.sourceIds.some((id) => BY_ID[id]?.isLNCQ);
}

/** Danh sách nguồn đầy đủ của một lá, để render khối dẫn nguồn. */
export function sourcesOf(card) {
  return card.sourceIds.map((id) => BY_ID[id] ?? { id, title: "(không có trong đăng ký)", isLNCQ: false });
}
`;
writeFileSync(OUT_SOURCES, sourcesModule, "utf8");
console.log(`→ ${OUT_SOURCES}  (${doc.sources.length} mục)`);

const body = `export { SOURCES, hasLNCQSource, sourcesOf } from "./sources.mjs";

export const MAJOR_ARCANA = Object.freeze(${JSON.stringify(cards, null, 2)});

/** Tra theo slug URL — /la-bai/<slug>/ */
export const bySlug = Object.freeze(
  Object.fromEntries(MAJOR_ARCANA.map((c) => [c.slug, c])),
);

/** Tra theo số lá 0–21 */
export const byNumber = Object.freeze(
  Object.fromEntries(MAJOR_ARCANA.map((c) => [c.number, c])),
);

/** Mẫu alt text sinh từ dữ liệu, không viết tay ở từng bề mặt.
 *  Mô tả CẢNH CHÍNH đã chốt, không mô tả tranh chưa vẽ. */
export function altTextFor(card) {
  return \`\${card.vietnameseTitle} — \${card.subtitle}\`;
}

/** Nhãn nguồn hiển thị cho người đọc phổ thông. */
export const ADAPTATION_LABEL = Object.freeze({
  LNCQ_CORE: "Lĩnh Nam chích quái — phần chính",
  LNCQ_CORE_ADAPTATION: "Dựa trên Lĩnh Nam chích quái, có biên tập khoảnh khắc",
  LNCQ_TUC_BIEN_ADAPTATION: "Dựa trên phần Tục Biên, có chuyển thể",
  VIET_FOLK_EXPANDED_ADAPTATION: "Tín ngưỡng Việt mở rộng ngoài Lĩnh Nam chích quái",
  EDITORIAL_FANTASY_INSPIRED: "Cảnh mới sáng tác, chỉ mượn motif",
});
`;

writeFileSync(OUT, banner + body, "utf8");
console.log(`→ ${OUT}  (${cards.length} lá, ${(banner + body).length} byte)`);

const byStatus = {};
for (const c of cards) byStatus[c.imageStatus] = (byStatus[c.imageStatus] || 0) + 1;
console.log("\nTrạng thái ảnh sau chuẩn hóa:");
for (const [k, v] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(2)}  ${k}`);
}
