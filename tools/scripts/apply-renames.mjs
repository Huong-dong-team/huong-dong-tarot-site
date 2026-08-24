#!/usr/bin/env node
/* Codemod đổi tên 22 Ẩn Chính trong một repo.
 *
 *   node scripts/apply-renames.mjs --dir <repo>            # xem trước
 *   node scripts/apply-renames.mjs --dir <repo> --write
 *   node scripts/apply-renames.mjs --dir <repo> --write --loose   # thay cả chỗ không neo
 *
 * Vì sao không thay mù bằng find/replace:
 *
 * Một tên có thể mang hai vai khác nhau trong cùng repo. "Chử Đồng Tử" vừa là
 * nhãn cũ của lá IX (phải đổi thành Dương Không Lộ), vừa là một trong Tứ Bất Tử
 * ở trang chủ (KHÔNG được đổi — đó là sự thật văn hoá, không phụ thuộc bộ bài).
 * Thay mù sẽ viết "Dương Không Lộ" vào danh sách Tứ Bất Tử và tạo ra một lỗi
 * tệ hơn lỗi đang sửa.
 *
 * Nên codemod chỉ thay khi tên nằm GẦN một mỏ neo nhận dạng lá: slug, số La Mã,
 * hoặc tên RWS tiếng Anh — trong cùng dòng hoặc trong cửa sổ ±2 dòng. Mọi chỗ
 * còn lại được liệt kê để người đọc quyết, không tự động đụng vào.
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { MAJOR_ARCANA } from "../content/major-arcana.mjs";
import { SOURCES } from "../content/sources.mjs";

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes(k);

const DIR = arg("--dir");
const WRITE = has("--write");
const LOOSE = has("--loose");
const WINDOW = Number(arg("--window", 2));
/* Repo có thể chứa bản chép của site bên thứ ba (ví dụ luocsutocviet.com — 33
   file ở đó nhắc "Lang Liêu" trong bài viết của họ). Đổi tên trong đó vừa sai
   vừa là sửa nội dung của người khác. */
const EXCLUDE = (arg("--exclude", "") || "").split(",").map((s) => s.trim()).filter(Boolean);

/* Loại trừ mặc định — rút ra từ lần chạy thật đầu tiên trên repo này, ngày
   24/08/2026. Không có danh sách này thì `--write` phá đúng những tệp mà chính
   codemod dựa vào:

   tools/          Máy móc của codemod nói VỀ việc đổi tên, nên nó chứa cả tên
                   cũ lẫn tên mới như dữ liệu. Chạy thật đã ghi đè
                   legacy-names.json ở 8 lá — `currentName` bị thay bằng
                   `targetName`, tức bảng dò tên cũ tự xoá chính nó — và sửa cả
                   chú thích trong mã nguồn của codemod lẫn tools/README.md.
   seed/           Sinh ra từ gen-seed-cards.mjs, không sửa tay. Chạy thật đã
                   viết "được lập làm Hùng Vương đầu triều" vào giữa câu kể của
                   lá IV: ở đó "Hùng Vương" là danh hiệu trong truyện, không
                   phải nhãn lá. Muốn đổi thì đổi ở nguồn chuẩn rồi sinh lại.
   data/lncq-*     Toàn văn Lĩnh Nam chích quái. Sử liệu của người khác; đổi tên
                   trong đó là sửa nội dung nguồn.
   archive/        Repo cũ đã nghỉ hưu, không được build.

   Bỏ qua danh sách này bằng --no-default-exclude, chỉ khi biết rõ mình làm gì. */
const DEFAULT_EXCLUDE = has("--no-default-exclude")
  ? []
  : ["tools", "seed", "archive", "data/lncq-22.json", "data/lncq-chapters.json"];
const ALL_EXCLUDE = [...DEFAULT_EXCLUDE, ...EXCLUDE];

/* Báo cáo phải nằm NGOÀI cây quét. Bản trước ghi vào content/rename-report.json
   ngay trong tools/ rồi lần chạy sau lại quét chính tệp đó: 55 chỗ có neo hoá
   thành 336 vì báo cáo trích dẫn tên cũ, và báo cáo mới lại trích báo cáo cũ. */
const REPORT = arg("--report", "content/rename-report.json");
if (!DIR) { console.error("Dùng: node scripts/apply-renames.mjs --dir <repo> [--write] [--loose] [--report <tệp>]"); process.exit(1); }

const EXT = new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".json",".astro",".vue",".svelte",
                     ".html",".htm",".md",".mdx",".yaml",".yml",".txt",".css"]);
const SKIP_DIR = new Set(["node_modules",".git","dist","build",".next",".astro",".svelte-kit",
                          "coverage",".cache","out","public/assets/img",".vercel",".netlify"]);

const legacy = JSON.parse(readFileSync("content/legacy-names.json", "utf8"));

/* Chỉ những lá thật sự cần đổi. Sắp tên dài trước: "Chử Đồng Tử tìm đạo" phải
   được thay trước "Chử Đồng Tử", nếu không sẽ còn lại chuỗi " tìm đạo" mồ côi. */
const renames = legacy.cards
  .filter((r) => r.needsRename && r.aliases?.length)
  .flatMap((r) => {
    const card = MAJOR_ARCANA.find((c) => c.slug === r.slug);
    // Một lá có thể mang nhiều nhãn cũ trên các trang khác nhau — mỗi nhãn là
    // một mẫu tìm riêng. Lá IX có cả "Chử Đồng Tử tìm đạo" và "Chử Đồng Tử".
    return r.aliases.map((alias) => ({
      slug: r.slug, roman: r.roman, rwsName: r.rwsName,
      currentName: alias,
      targetName: card.vietnameseTitle,
      anchors: [r.slug, r.rwsName, r.roman],
    }));
  })
  .sort((a, b) => b.currentName.length - a.currentName.length);

const cardCount = new Set(renames.map((r) => r.slug)).size;
console.log(`${cardCount} lá · ${renames.length} nhãn cũ cần tìm · quét ${DIR}\n`);

/* ── Duyệt cây thư mục ────────────────────────────────────────────────── */

const files = [];
(function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (SKIP_DIR.has(name) || name.startsWith(".")) continue;
    if (ALL_EXCLUDE.some((x) => name === x || join(dir, name).includes(x))) continue;
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p);
    else if (EXT.has(extname(name)) && st.size < 4e6) files.push(p);
  }
})(DIR);

console.log(`${files.length} file văn bản trong phạm vi${ALL_EXCLUDE.length ? ` · loại trừ: ${ALL_EXCLUDE.join(", ")}` : ""}\n`);

/* ── Tìm và phân loại ─────────────────────────────────────────────────── */

const anchored = [];   // có mỏ neo → thay được
const loose = [];      // không neo → cần người đọc
let changedFiles = 0;

/* Số La Mã cần biên giới từ: "IX" không được khớp bên trong "XIX". */
const hasAnchor = (text, anchors) =>
  anchors.some((a) =>
    /^[IVX]+$|^0$/.test(a)
      ? new RegExp(`(^|[^A-ZÀ-Ỹ0-9])${a}([^A-ZÀ-Ỹ0-9]|$)`).test(text)
      : text.includes(a),
  );

/* Mỏ neo trên CHÍNH dòng đó là bằng chứng chắc nhất. Chỉ nới ra cửa sổ khi dòng
   đó không có mỏ neo nào — và khi trong cửa sổ không có mỏ neo của lá KHÁC.
   Trong một file dữ liệu mà mỗi dòng là một lá, cửa sổ ±2 sẽ luôn chạm lá bên
   cạnh và gán nhầm. */
/* Dấu hiệu cho biết tên đang đóng VAI KHÁC, không phải nhãn lá. Rút ra từ chính
   repo này: khối Tứ Bất Tử trong templates/huyen-su.html và mảng immortalSpecs
   trong scripts/build.js đều nhắc tên nhân vật cạnh mã lá — mỏ neo có thật,
   nhưng tên ở đó là tên NGƯỜI trong tín ngưỡng, không phải nhãn lá bài. */
const ROLE_MARKERS = [
  "immortal", "tu-bat-tu", "Tứ Bất Tử", "portrait", "tứ bất tử",
];

const anchorHit = (line, ctx, r, allRenames) => {
  if (ROLE_MARKERS.some((m) => ctx.includes(m))) return { ok: false, why: "khối Tứ Bất Tử / immortals — tên người, không phải nhãn lá" };
  if (hasAnchor(line, r.anchors)) return { ok: true };
  if (!hasAnchor(ctx, r.anchors)) return { ok: false, why: "không có mỏ neo lá gần đó" };
  const otherInWindow = allRenames.some(
    (o) => o.slug !== r.slug && hasAnchor(ctx, [o.slug, o.rwsName]),
  );
  return otherInWindow
    ? { ok: false, why: "cửa sổ chứa mỏ neo của lá khác" }
    : { ok: true };
};

for (const file of files) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  let lines = src.split("\n");
  let touched = false;

  /* File JSON minify nằm trọn trên một dòng: neo theo dòng trở nên vô nghĩa vì
     cả file là một ngữ cảnh, nên mọi tên sẽ khớp mọi mỏ neo. data/lncq-chapters.json
     ở repo này nặng 131KB mà 0 ký tự xuống dòng. Những file như vậy phải do người đọc. */
  const avgLineLen = src.length / Math.max(1, lines.length);
  const isMinified = avgLineLen > 500;

  /* Hai lượt với token trung gian. Bắt buộc, vì tên MỚI của lá này có thể là tên
     CŨ của lá kia: XIV đổi thành "Lang Liêu", mà "Lang Liêu" lại là tên cũ của XI.
     Thay trực tiếp thì luật của XI sẽ đổi tiếp chỗ vừa ghi và cho ra tên sai. */
  const slots = [];

  for (const r of renames) {
    if (!lines.join("\n").includes(r.currentName)) continue;

    lines = lines.map((line, i) => {
      if (!line.includes(r.currentName)) return line;
      const ctx = lines.slice(Math.max(0, i - WINDOW), i + WINDOW + 1).join("\n");
      const verdict = isMinified
        ? { ok: false, why: `file một dòng (${Math.round(avgLineLen)} ký tự/dòng) — không neo theo dòng được` }
        : anchorHit(line, ctx, r, renames);
      const ok = verdict.ok;
      const hit = { file: relative(DIR, file), line: i + 1, roman: r.roman,
                    from: r.currentName, to: r.targetName, why: verdict.why ?? null,
                    text: line.trim().slice(0, 120) };
      (ok ? anchored : loose).push(hit);
      if (!ok && !LOOSE) return line;
      touched = true;
      const token = `\u0000HD${slots.length}\u0000`;
      slots.push(r.targetName);

      /* Tên lá có thể là chuỗi con của TÊN CHƯƠNG nguồn: lá VI đang là "Trầu Cau",
         mà nguồn của nó là "Truyện Trầu Cau" (S04). Thay trong tên chương sẽ ra
         "Truyện Tân, Lang và nàng họ Lưu" — sai, vì đó là tên chương trong Lĩnh Nam
         chích quái, không phải nhãn lá. Che mọi tên chương trước khi thay. */
      const guards = SOURCES.map((x) => x.title).filter((t) => line.includes(t) && t.includes(r.currentName));
      if (guards.length) {
        let tmp = line;
        guards.forEach((t, gi) => { tmp = tmp.split(t).join(`\u0002S${gi}\u0002`); });
        tmp = r.targetName.includes(r.currentName)
          ? tmp.split(r.targetName).join("\u0001OK\u0001").split(r.currentName).join(token).split("\u0001OK\u0001").join(r.targetName)
          : tmp.split(r.currentName).join(token);
        guards.forEach((t, gi) => { tmp = tmp.split(`\u0002S${gi}\u0002`).join(t); });
        return tmp;
      }

      /* Nhãn cũ có thể là TIỀN TỐ của tên mới: lá IV đang là "Hùng Vương",
         tên mới là "Hùng Vương đầu triều". Chỗ nào đã đổi rồi thì chuỗi cũ vẫn
         nằm bên trong chuỗi mới — thay tiếp sẽ ra "Hùng Vương đầu triều đầu triều".
         Che các chỗ ĐÃ đúng trước, thay xong mới trả lại. Nhờ vậy codemod chạy
         bao nhiêu lần cũng cho cùng kết quả. */
      if (r.targetName.includes(r.currentName)) {
        const shield = "\u0001OK\u0001";
        return line
          .split(r.targetName).join(shield)
          .split(r.currentName).join(token)
          .split(shield).join(r.targetName);
      }
      return line.split(r.currentName).join(token);
    });
  }

  if (touched) {
    let out = lines.join("\n");
    slots.forEach((name, i) => { out = out.split(`\u0000HD${i}\u0000`).join(name); });
    /* `touched` chỉ nói có thử thay, không nói nội dung có đổi. Khi lớp che
       tiền tố hoặc tên chương vô hiệu hoá phép thay, kết quả bằng đúng bản gốc.
       Đếm theo nội dung, nếu không báo cáo sẽ khoe "1 file đã sửa" trong khi
       git diff trống. */
    if (out === src) continue;
    if (WRITE) writeFileSync(file, out, "utf8");
    changedFiles++;
  }
}

/* ── Báo cáo ──────────────────────────────────────────────────────────── */

const C = { green:"\x1b[32m", yellow:"\x1b[33m", dim:"\x1b[2m", bold:"\x1b[1m", off:"\x1b[0m" };

const group = (rows) => rows.reduce((m, h) => { (m[h.file] ||= []).push(h); return m; }, {});

console.log(`${C.bold}CÓ MỎ NEO — thay được${C.off}  ${C.dim}(tên nằm cạnh slug / số La Mã / tên RWS)${C.off}`);
const ag = group(anchored);
if (!Object.keys(ag).length) console.log(`  ${C.dim}(không có)${C.off}`);
for (const [f, hits] of Object.entries(ag)) {
  console.log(`  ${f}  ${C.dim}${hits.length} chỗ${C.off}`);
  for (const h of hits.slice(0, 4)) console.log(`    ${String(h.line).padStart(5)}  ${h.from} → ${C.green}${h.to}${C.off}`);
  if (hits.length > 4) console.log(`    ${C.dim}… ${hits.length - 4} chỗ nữa${C.off}`);
}

console.log(`\n${C.bold}KHÔNG NEO — cần người đọc${C.off}  ${C.dim}(có thể là vai khác, ví dụ Tứ Bất Tử)${C.off}`);
const lg = group(loose);
if (!Object.keys(lg).length) console.log(`  ${C.dim}(không có)${C.off}`);
for (const [f, hits] of Object.entries(lg)) {
  console.log(`  ${f}  ${C.dim}${hits.length} chỗ${C.off}`);
  for (const h of hits.slice(0, 4)) {
    console.log(`    ${String(h.line).padStart(5)}  ${C.yellow}${h.from}${C.off}  ${C.dim}${h.why ?? ""}${C.off}`);
    console.log(`           ${C.dim}${h.text}${C.off}`);
  }
  if (hits.length > 4) console.log(`    ${C.dim}… ${hits.length - 4} chỗ nữa${C.off}`);
}

const report = { dir: DIR, ranAt: new Date().toISOString(), write: WRITE, loose: LOOSE,
                 excluded: ALL_EXCLUDE,
                 filesScanned: files.length, filesChanged: changedFiles, anchored, unanchored: loose };
writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(`\n${C.bold}Tổng kết${C.off}`);
console.log(`  file quét            ${files.length}`);
console.log(`  chỗ có neo           ${anchored.length}`);
console.log(`  chỗ không neo        ${loose.length}   ${loose.length ? C.yellow + "← đọc tay" + C.off : ""}`);
console.log(`  file ${WRITE ? "đã sửa" : "sẽ sửa"}         ${changedFiles}`);
console.log(`\n→ ${REPORT}`);
if (!WRITE) console.log(`\n${C.dim}XEM TRƯỚC — không sửa tệp nào trong cây quét; chỉ ghi báo cáo ở trên. Thêm --write để áp dụng.${C.off}`);
console.log(`${C.dim}Chạy trên cây git sạch để còn git diff mà soát.${C.off}`);
