#!/usr/bin/env node
/* Sinh data/names/vi.toml — lớp TÊN tách khỏi lớp DỮ LIỆU.
 *
 *   node tools/scripts/gen-names-vi.mjs            # xem trước, in ra stdout
 *   node tools/scripts/gen-names-vi.mjs --write
 *
 * Vì sao có file này
 * ------------------
 * Hiện tên lá nằm rải trong seed/cards.json ở ít nhất năm trường: nameVi,
 * nameFolk, image.alt, seo.title, seo.description — cộng thêm tên nhà (suitVi,
 * suitShort) lặp lại trong 56 bản ghi. Hệ quả đã thấy trong bảng kiểm kê:
 * IX mang ba tên ở ba trang, bốn nhà có ba biến thể tên, slug Ẩn Phụ lệch giữa
 * folder và live.
 *
 * Khuôn lấy từ Tarot Deck Specification (arcanaland/reference-decks): ID lá là
 * bất biến, tên chỉ là một lớp tra cứu đặt riêng. Đổi tên thì sửa đúng một file,
 * không đụng dữ liệu lá, không chạy codemod, không có bug "tên mới của lá này là
 * tên cũ của lá kia".
 *
 * File này CHƯA được nối vào scripts/build.js. Nó là bản để người duyệt trước
 * (hạng mục 0.6 và 0.7). Nối vào sau khi bạn đã chốt nội dung.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "data/names/vi.toml");
const CHUA_CO = "đang phát triển";

const read = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const cards = read("seed/cards.json");
const legacy = read("tools/content/legacy-names.json");
const conflictsMd = readFileSync(path.join(ROOT, "tools/content/folk-conflicts.md"), "utf8");

/* ---------- TOML: chỉ đủ dùng cho file này, không thêm thư viện ---------- */
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
const str = (s) => `"${esc(s)}"`;
const arr = (a) => `[${a.map(str).join(", ")}]`;
const kv = (k, v, c) => `${k} = ${Array.isArray(v) ? arr(v) : str(v)}${c ? `  # ${c}` : ""}`;
/* Khoá số ("00") phải bọc nháy; khoá chữ thì không. */
const key = (k) => (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(k) ? k : `"${k}"`);

/* ---------- Thứ tự và khoá bất biến ---------- */
const RANKS = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "page", "knight", "queen", "king"];
const SUITS = ["wands", "cups", "swords", "pentacles"];
const ROMAN = Object.fromEntries(legacy.cards.map((c) => [c.slug, c.roman]));
const ALIASES = Object.fromEntries(legacy.cards.map((c) => [c.slug, c.aliases]));

const majors = cards.filter((c) => c.arcana === "major").sort((a, b) => a.number - b.number);
const minors = cards.filter((c) => c.arcana !== "major");
const rankOf = (slug) => RANKS.find((r) => slug.startsWith(`${r}-of-`));
const bySuit = Object.fromEntries(SUITS.map((s) => [s, {}]));
for (const c of minors) bySuit[c.suit][rankOf(c.slug)] = c;

/* ---------- Neo dân gian đang chọi nhau (folk-conflicts.md) ---------- */
const conflicts = {};
for (const block of conflictsMd.split(/^## /m).slice(1)) {
  const [head, ...rest] = block.split("\n");
  const body = rest.join("\n");
  const en = head.split("·")[0].trim();
  const pick = (label) => (body.match(new RegExp(`\\*\\*${label}\\*\\*:\\s*(.+)`)) || [, ""])[1].trim();
  conflicts[en] = { v21: pick("v2\\.1"), bo56: pick("bộ 56"), neoCu: pick("neo cũ") };
}

/* ---------- Dựng file ---------- */
const L = [];
const out = (...lines) => L.push(...lines);
const blank = () => L.push("");

out(
  "# Tên tiếng Việt của bộ bài Hường Đông — lớp tra cứu, tách khỏi lớp dữ liệu.",
  "#",
  "# SINH TỰ ĐỘNG từ seed/cards.json + tools/content/legacy-names.json +",
  "# tools/content/folk-conflicts.md. Sinh lại bằng:",
  "#     node tools/scripts/gen-names-vi.mjs --write",
  "#",
  "# Sửa tên thì sửa Ở ĐÂY, không sửa trong seed/cards.json — rồi chạy bước nối",
  "# ngược lại. Trường `slug` là BẤT BIẾN: đổi slug là mất toàn bộ index đã có.",
  "#",
  `# Chỗ chưa có nội dung ghi "${CHUA_CO}". Đó là chỗ chờ bạn quyết, không phải lỗi.`,
);
blank();

out("[metadata]");
out(kv("schema_version", "1.0"));
out(kv("locale", "vi"));
out(kv("deck", "huong-dong-tarot"));
out(kv("generated_at", new Date().toISOString().slice(0, 10)));
out(kv("generator", "tools/scripts/gen-names-vi.mjs"));
out(kv("source", "seed/cards.json · legacy-names.json · folk-conflicts.md"));
out(kv("wired_into_build", "chưa — file để duyệt, chưa nối vào scripts/build.js"));
out(kv("alt_text_attribution", "Alt do dự án tự viết. 56 lá Ẩn Phụ hiện dùng alt của phù hiệu nhà vì chưa có tranh riêng."));
blank();

/* Bốn nhà — một bộ tên duy nhất, chấm dứt ba biến thể đang chạy song song. */
out(
  "# ── BỐN NHÀ ────────────────────────────────────────────────────────────────",
  "# Bảng kiểm kê ghi ba biến thể đang chạy song song:",
  '#   "Tre / Sen / Dâu tằm / Lúa" (/la-bai/) · "Hoa Sen / Bông Lúa" (trang chủ)',
  '#   "Cây Tre / Hoa Sen / Dâu Tằm / Bông Lúa" (folder 56)',
  "# Ở đây mỗi nhà có ĐÚNG hai dạng, mỗi dạng một chỗ dùng. Không có dạng thứ ba.",
);
/* Lấy nguyên văn từ dữ liệu, không tự chuẩn hoá — chỗ nào lệch thì để lệch
   cho thấy, rồi đưa vào [review] chờ bạn chốt. */
const suitMeta = Object.fromEntries(SUITS.map((s) => {
  const c = bySuit[s].ace;
  return [s, { name: c.suitVi || CHUA_CO, short: c.suitShort || CHUA_CO }];
}));
for (const s of SUITS) {
  const sample = bySuit[s].ace;
  blank();
  out(`[suits.${s}]`);
  out(kv("name", suitMeta[s].name, "dạng đầy đủ — tiêu đề lá, khối dẫn nguồn"));
  out(kv("short", suitMeta[s].short, "dạng ngắn — sơ đồ bốn nhà, nhãn lọc"));
  out(kv("element", sample.element || CHUA_CO));
  out(kv("rws", s));
  out(kv("slug", CHUA_CO, "chưa có trang riêng cho từng nhà"));
}
blank();

out(
  "# ── THỨ BẬC ────────────────────────────────────────────────────────────────",
  "# Một tên cho mỗi thứ bậc, dùng chung cho cả bốn nhà.",
  "# Dữ liệu hiện tại KHÔNG theo quy tắc này (xem [review.ten_an_phu]).",
);
blank();
out("[ranks]");
const rankVi = {};
for (const r of RANKS) {
  const c = bySuit.wands[r];
  rankVi[r] = c?.rankVi || CHUA_CO;
  out(kv(r, rankVi[r]));
}
blank();

/* ── 22 Ẩn Chính ── */
out(
  "# ── 22 ẨN CHÍNH ────────────────────────────────────────────────────────────",
  "# display = tên hiển thị đã chốt theo v2.1. aliases = tên cũ còn lang thang",
  "# trên site, giữ lại để dò tìm chứ không để hiển thị.",
);
for (const c of majors) {
  const id = String(c.number).padStart(2, "0");
  const al = ALIASES[c.slug] || [];
  blank();
  out(`[major_arcana.${key(id)}]`);
  out(kv("slug", c.slug, "BẤT BIẾN"));
  out(kv("roman", ROMAN[c.slug] ?? String(c.number)));
  out(kv("rws", c.nameEn));
  out(kv("vi", c.nameVi, "nghĩa RWS dịch sang tiếng Việt"));
  out(kv("folk", c.nameFolk, "nhân vật / tích Việt"));
  out(kv("display", c.nameFolk, "tên hiện trên site"));
  out(kv("aliases", al));
  out(kv("alt", c.image?.alt || CHUA_CO));
  out(kv("image_status", c.imageStatus || CHUA_CO));
  out(kv("cultural_review", c.culturalReviewStatus || CHUA_CO));
  out(kv("decision", al.length ? "cần bạn duyệt" : "ok"));
}
blank();

/* ── 56 Ẩn Phụ ── */
out(
  "# ── 56 ẨN PHỤ ──────────────────────────────────────────────────────────────",
  "# vi        = nameVi đang chạy trong dữ liệu",
  "# vi_quy_tac = [ranks] + [suits].short — dạng lẽ ra phải có",
  "# Hai cột lệch nhau ở phần lớn lá. Chốt một quy tắc ở [review.ten_an_phu].",
);
let lech = 0;
for (const s of SUITS) {
  for (const r of RANKS) {
    const c = bySuit[s][r];
    if (!c) continue;
    const quyTac = `${rankVi[r]} ${suitMeta[s].short}`;
    const khop = c.nameVi === quyTac;
    if (!khop) lech += 1;
    blank();
    out(`[minor_arcana.${s}.${r}]`);
    out(kv("slug", c.slug, `BẤT BIẾN — live dùng dạng này, folder 56 dùng ${s}-${r}`));
    out(kv("rws", c.nameEn));
    out(kv("vi", c.nameVi));
    out(kv("vi_quy_tac", quyTac));
    out(kv("folk", c.nameFolk));
    out(kv("display", c.nameFolk));
    out(kv("subject", c.subject || CHUA_CO, "chủ thể v2.1"));
    out(kv("scene_title", c.sceneTitle || CHUA_CO));
    out(kv("alt", c.image?.alt || CHUA_CO, "tạm — alt của phù hiệu nhà"));
    out(kv("alt_tranh_rieng", CHUA_CO, "viết khi có tranh riêng cho lá này"));
    out(kv("image_status", c.imageStatus || CHUA_CO));
    out(kv("decision", khop ? "ok" : "cần bạn duyệt"));
  }
}
blank();

/* ── Phần chờ người quyết ── */
out(
  "# ═══════════════════════════════════════════════════════════════════════════",
  "# PHẦN CHỜ NGƯỜI QUYẾT",
  "# ═══════════════════════════════════════════════════════════════════════════",
);
blank();

out("[review.ten_an_phu]");
out(kv("hang_muc", "0.6 · quy tắc đặt tên 56 Ẩn Phụ"));
out(kv("van_de", `${lech}/56 lá có nameVi không khớp [ranks] + [suits].short`));
out(kv("vi_du", '"2 Tre" vs "Hai Tre" · "Hiệp sĩ Tre" vs "Kỵ Sĩ Tre" · "Nữ vương Tre" vs "Hoàng Hậu Tre"'));
out(kv("phuong_an_a", "Theo quy tắc: sinh lại toàn bộ nameVi từ [ranks] + [suits].short"));
out(kv("phuong_an_b", "Giữ nameVi đang chạy, sửa [ranks] cho khớp"));
out(kv("phuong_an_c", "Bỏ nameVi khỏi giao diện, chỉ hiện folk + rws"));
out(kv("decision", CHUA_CO));
blank();

out("[review.ten_bon_nha]");
out(kv("hang_muc", "0.6 · dạng viết hoa của tên bốn nhà"));
out(kv("van_de", SUITS.map((s) => `${suitMeta[s].name} / ${suitMeta[s].short}`).join(" · ")));
out(kv("chu_y", 'Nhà Dâu Tằm có hai lối viết hoa khác nhau giữa dạng đầy đủ và dạng ngắn ("Dâu Tằm" vs "Dâu tằm"). Ba nhà kia nhất quán.'));
out(kv("decision", CHUA_CO));
blank();

out("[review.ten_an_chinh]");
out(kv("hang_muc", "0.6 · 54 chỗ trong rename-report.json"));
out(kv("van_de", "rename-report.json trong repo là kết quả chạy trên repo giả _test/regress (4 file), KHÔNG phải bản quét 54 chỗ trên mã thật. Bản 54 chỗ chưa được commit."));
out(kv("viec_can_lam", "chạy lại tools/scripts/apply-renames.mjs trên repo thật rồi commit báo cáo, trước khi duyệt"));
out(kv("thay_the", "bảng aliases trong [major_arcana.*] là phần dùng được ngay: 17/22 lá có tên cũ cần dò"));
out(kv("decision", CHUA_CO));
blank();

out("[review.nguon_la_XXI]");
out(kv("hang_muc", "0.11 · nguồn của lá XXI The World"));
out(kv("van_de", "v2.1 có sót S09 không? Chốt rồi mới cập nhật dữ liệu."));
out(kv("hien_tai", majors.find((c) => c.number === 21)?.nameFolk || CHUA_CO));
out(kv("decision", CHUA_CO));
blank();

out(
  "# ── 0.7 · 23 lá có neo dân gian chọi nhau ──────────────────────────────────",
  "# Ba lựa chọn hợp lệ: giữ v2.1 (một nguồn duy nhất) · giữ neo cũ (thêm lớp",
  "# nghĩa) · bỏ trống. Điền vào `decision` một trong: v21 | neo_cu | bo_trong",
);
for (const s of SUITS) {
  for (const r of RANKS) {
    const c = bySuit[s][r];
    if (!c || !conflicts[c.nameEn]) continue;
    const k = conflicts[c.nameEn];
    blank();
    out(`[review.neo_dan_gian.${s}.${r}]`);
    out(kv("slug", c.slug));
    out(kv("rws", c.nameEn));
    out(kv("v21", k.v21 || CHUA_CO));
    out(kv("bo_56", k.bo56 || CHUA_CO));
    out(kv("neo_cu", k.neoCu || CHUA_CO));
    out(kv("decision", CHUA_CO));
  }
}
blank();

const toml = L.join("\n");
if (process.argv.includes("--write")) {
  writeFileSync(OUT, toml + "\n");
  const doDuyet = (toml.match(/decision = "(cần bạn duyệt|đang phát triển)"/g) || []).length;
  console.log(`Đã ghi ${path.relative(ROOT, OUT)} — ${toml.split("\n").length} dòng, ${doDuyet} mục chờ bạn quyết.`);
} else {
  console.log(toml);
}
