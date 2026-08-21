#!/usr/bin/env node
/* Sinh module dữ liệu chuẩn 56 Ẩn Phụ.
 *
 *   node scripts/gen-minor-arcana.mjs
 *   node scripts/gen-minor-arcana.mjs --merge "<đường-dẫn>/56anphu./content/an-phu-data.js"
 *
 * v2.1 là nguồn cho mọi thứ thuộc về từng lá: chủ thể, cảnh, nghĩa, motif, nguồn.
 * Bộ 56 soạn tay trong folder đóng góp phần diễn giải THEO THỨ BẬC (tình yêu,
 * công việc, tài chính, sức khoẻ, lời khuyên, cảnh báo) — những trường này gắn
 * với rank chứ không gắn với lá, nên gộp vào an toàn.
 *
 * Trường `folk` của bộ 56 KHÔNG được gộp tự động: nó gắn với từng lá và được
 * soạn trên một ánh xạ khác v2.1. Script chỉ báo chỗ lệch để người biên tập quyết.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const IN = "content/minor-arcana.json";
const OUT = "content/minor-arcana.mjs";
const mergeIdx = process.argv.indexOf("--merge");
const mergePath = mergeIdx > -1 ? process.argv[mergeIdx + 1] : null;

const doc = JSON.parse(readFileSync(IN, "utf8"));

const ADAPTATION = new Set([
  "LNCQ_CORE", "LNCQ_CORE_ADAPTATION", "LNCQ_TUC_BIEN_ADAPTATION",
  "VIET_FOLK_EXPANDED_ADAPTATION", "EDITORIAL_FANTASY_INSPIRED",
]);

let rankContext = null, rankAdvice = null, legacyByRank = null;
const conflicts = [];

if (mergePath) {
  const mod = await import(pathToFileURL(mergePath).href);
  rankContext = mod.RANK_CONTEXT ?? null;
  rankAdvice = mod.RANK_ADVICE ?? null;

  /* Đối chiếu neo dân gian của bộ 56 với chủ thể của v2.1. Hai bộ được soạn
     độc lập nên chỗ nào nói về hai nhân vật khác nhau thì phải có người đọc. */
  legacyByRank = new Map((mod.MINOR_CARDS ?? []).map((c) => [`${c.suit}-${c.rank}`, c]));
  for (const card of doc.cards) {
    const legacy = legacyByRank.get(card.id);
    if (!legacy?.folk) continue;
    const subjectWords = card.subject.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    const shared = subjectWords.some((w) => legacy.folk.toLowerCase().includes(w));
    if (!shared) conflicts.push({ card, legacyFolk: legacy.folk, legacyName: legacy.nameVi });
  }
}

const cards = doc.cards.map((c) => {
  if (!ADAPTATION.has(c.adaptationLevel)) throw new Error(`${c.id}: mức chuyển thể lạ "${c.adaptationLevel}"`);
  const ctx = rankContext?.[c.rank] ?? {};
  const adv = rankAdvice?.[c.rank] ?? {};
  return {
    id: c.id,
    slug: c.slug,
    arcana: "minor",
    suit: c.suit, suitVi: c.suitVi, suitShort: c.suitShort, suitEn: c.suitEn, element: c.element,
    rank: c.rank, rankVi: c.rankVi, rankEn: c.rankEn, number: c.number,

    viName: c.viName,          // "Hai Hoa Sen" — tên thẻ
    enName: c.enName,          // "Two of Cups"
    subject: c.subject,        // "Tiên Dung và Chử Đồng Tử" — chủ thể của cảnh
    sceneTitle: c.sceneTitle,  // "Hai chén bên bãi cát"

    uprightMeaning: c.uprightMeaning,
    reversedMeaning: c.reversedMeaning,
    scene: c.scene,
    shortStory: c.shortStory,
    props: c.props,
    palette: c.palette,

    // Diễn giải theo thứ bậc — không gắn với lá cụ thể nên gộp được.
    love: ctx.love ?? null,
    career: ctx.career ?? null,
    finance: ctx.finance ?? null,
    health: ctx.health ?? null,
    advice: adv.advice ?? null,
    warning: adv.warning ?? null,

    sourceIds: c.sourceIds,
    adaptationLevel: c.adaptationLevel,

    contentStatus: "text-ready",
    imageStatus: "MISSING",            // chưa có một tranh Ẩn Phụ nào được sản xuất
    culturalReviewStatus: "pending",
  };
});

const banner = `/* Nguồn dữ liệu chuẩn cho 56 Ẩn Phụ — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY.
 *
 *   Nguồn : ${doc.source}
 *   Sinh  : node scripts/parse-v21-minor.mjs <docx> --out ${IN}
 *           node scripts/gen-minor-arcana.mjs${mergePath ? " --merge <an-phu-data.js>" : ""}
 *
 * Tên nhà dùng bản dài của v2.1 (Cây Tre / Hoa Sen / Dâu Tằm / Bông Lúa);
 * suitShort giữ bản rút gọn site đang hiển thị để lớp giao diện tự chọn —
 * nhưng chỉ có một nguồn, không phải hai danh sách.
 */\n\n`;

const body = `export const MINOR_ARCANA = Object.freeze(${JSON.stringify(cards, null, 2)});

export const bySlug = Object.freeze(Object.fromEntries(MINOR_ARCANA.map((c) => [c.slug, c])));

export const SUIT_ORDER = Object.freeze(["wands", "cups", "swords", "pentacles"]);

/** Lấy trọn một nhà theo đúng thứ tự Át → Quốc Vương. */
export function suitOf(suitKey) {
  return MINOR_ARCANA.filter((c) => c.suit === suitKey).sort((a, b) => a.number - b.number);
}

/** Alt text sinh từ dữ liệu, mô tả cảnh đã chốt chứ không mô tả tranh chưa vẽ. */
export function altTextFor(card) {
  return \`\${card.viName} — \${card.sceneTitle}\`;
}
`;

writeFileSync(OUT, banner + body, "utf8");
console.log(`→ ${OUT}  (${cards.length} lá)`);

const filled = (k) => cards.filter((c) => c[k]).length;
console.log(`\nTrường theo thứ bậc đã gộp: ${mergePath ? "có" : "KHÔNG (chạy với --merge để gộp)"}`);
if (mergePath) {
  for (const k of ["love", "career", "finance", "health", "advice", "warning"]) {
    console.log(`  ${k.padEnd(8)} ${filled(k)}/56`);
  }
}

if (conflicts.length) {
  console.log(`\n⚠ ${conflicts.length}/56 lá có neo dân gian của bộ 56 nói về chủ thể khác v2.1.`);
  console.log("  Không gộp tự động. Người biên tập quyết giữ bên nào:\n");
  for (const { card, legacyFolk, legacyName } of conflicts.slice(0, 8)) {
    console.log(`  ${card.enName}`);
    console.log(`    v2.1     : ${card.subject} — ${card.sceneTitle}`);
    console.log(`    bộ 56    : ${legacyName}`);
    console.log(`    neo cũ   : ${legacyFolk.slice(0, 96)}${legacyFolk.length > 96 ? "…" : ""}\n`);
  }
  if (conflicts.length > 8) console.log(`  … và ${conflicts.length - 8} lá nữa.`);
  const report = [
    "# Neo dân gian cần biên tập quyết",
    "",
    `Bộ 56 soạn tay và v2.1 được viết độc lập. ${conflicts.length}/56 lá có neo dân gian`,
    "nói về một chủ thể khác với chủ thể v2.1 đã chốt. Script không gộp tự động.",
    "",
    "Giữ v2.1 nếu muốn một nguồn duy nhất; giữ neo cũ nếu nó thêm được lớp nghĩa mà",
    "v2.1 không có. Bỏ trống cũng là một lựa chọn hợp lệ.",
    "",
  ];
  for (const { card, legacyFolk, legacyName } of conflicts) {
    report.push(`## ${card.enName} · ${card.viName}`, "",
      `- **v2.1**: ${card.subject} — ${card.sceneTitle}`,
      `- **bộ 56**: ${legacyName}`,
      `- **neo cũ**: ${legacyFolk}`, "");
  }
  writeFileSync("content/folk-conflicts.md", report.join("\n"), "utf8");
  console.log(`\n→ content/folk-conflicts.md  (danh sách đầy đủ ${conflicts.length} lá)`);
}
