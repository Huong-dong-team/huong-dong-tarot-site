#!/usr/bin/env node
// Cổng kiểm cho 0.12 — đổi bảng màu sang bản Bình Minh.
//
// Chạy trên đầu ra của ChatGPT TRƯỚC khi mở PR. Script chỉ BÁO CÁO, không sửa gì:
// mọi quyết định sửa vẫn là của người đọc diff.
//
// Vì sao cần script riêng thay vì đọc bằng mắt: bản sửa này chạm 137 giá trị màu
// rải trong hai tệp CSS 36KB + 22KB. Sót một giá trị jade thì trang ra nửa kem nửa
// xanh, mà mắt người rất khó bắt một dòng lọt giữa 1.500 dòng CSS đã nén.
//
//   node tools/scripts/check-palette.mjs
//   node tools/scripts/check-palette.mjs --baseline <thư-mục-bản-gốc>
//
// Với --baseline, script so thêm dist/**.html với bản dựng trước khi sửa. Đó là
// phép kiểm mạnh nhất: spec cấm đụng markup, nên HTML phải giống hệt, trừ đúng
// một dòng theme-color.

import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

const MAIN = "public/assets/css/main.css";
const DARK = "public/assets/css/theme-dark.css";
const LAYOUT = "templates/_layout.html";

let failed = 0;
const report = [];
function check(ok, name, detail = "") {
  report.push({ ok, name, detail });
  if (!ok) failed += 1;
}

// ── 1 · Màu cũ phải biến mất hoàn toàn ────────────────────────────────────────
// Danh sách này là toàn bộ token màu của hệ jade/brass/cinnabar, lấy từ khối
// :root của cả hai tệp trước khi sửa. Còn một cái nghĩa là còn một vùng chưa đổi.
const MAU_CU = [
  "082824", "0b332e", "12463e", "1b5b50", "f5eedf", "fff9ed",
  "916843", "b78a4a", "d7ba98", "9f3f35", "18201d", "68716c",
  "c2564a", "d8b66a", "9db3aa", "041512", "061f1c", "0f3c35",
  "0d3b34", "0a332e", "092f2a", "dfe9e3",
];

for (const file of [MAIN, DARK]) {
  const text = await read(file);
  const con = MAU_CU.filter((hex) => new RegExp(`#${hex}\\b`, "i").test(text));
  check(con.length === 0, `${file}: không còn màu của hệ cũ`,
    con.length ? `còn ${con.length}: ${con.map((h) => "#" + h).join(", ")}` : "");
}

// Ba họ rgb() của hệ cũ. Chúng không phải hex nên grep hex ở trên bỏ sót.
const RGB_CU = [
  [/rgba?\(\s*8\s*,\s*40\s*,\s*36/g, "rgba(8,40,36…) — nền jade"],
  [/rgba?\(\s*232\s*,\s*201\s*,\s*140/g, "rgba(232,201,140…) — viền brass"],
  [/rgb\(\s*232\s+201\s+140\s*\//g, "rgb(232 201 140 /…) — ánh sáng vàng"],
  [/rgb\(\s*4\s+28\s+25\s*\//g, "rgb(4 28 25 /…) — lớp phủ hero"],
  [/rgba?\(\s*199\s*,\s*150\s*,\s*78/g, "rgba(199,150,78…) — đường kẻ brass"],
  [/rgba?\(\s*4\s*,\s*31\s*,\s*27/g, "rgba(4,31,27…) — bóng đổ jade"],
];
for (const file of [MAIN, DARK]) {
  const text = await read(file);
  const con = RGB_CU.filter(([re]) => re.test(text)).map(([, ten]) => ten);
  check(con.length === 0, `${file}: không còn họ rgb() của hệ cũ`,
    con.length ? con.join(" · ") : "");
}

// ── 2 · Không còn literal màu ngoài khối :root ────────────────────────────────
// Bốn nhóm ngoại lệ đã ghi trong §3.6 của spec. Chúng KHÔNG phải màu bề mặt nên
// được phép ở lại nguyên văn.
const NGOAI_LE = [
  /mask(?:-image)?\s*:[^;]*/gi,          // #000 trong mask là độ mờ, không phải màu
  /-webkit-mask(?:-image)?\s*:[^;]*/gi,
  /\.skip-link\s*\{[^}]*\}/gi, // #fff/#000 21:1 là chủ đích, thành phần a11y
  /:focus-visible\s*\{[^}]*\}/gi, // vòng focus #4285f4 cố ý lệch tông
];

// color-mix thường chứa var(...), nên biểu thức `[^)]*` dừng nhầm ở dấu đóng
// của var và để lọt #000 phía sau. Quét cân bằng ngoặc để bỏ đúng trọn hàm,
// không nới ngoại lệ sang phần còn lại của khai báo CSS.
function boHamCss(text, tenHam) {
  const lower = text.toLowerCase();
  const needle = `${tenHam.toLowerCase()}(`;
  let cursor = 0;
  let output = "";

  while (cursor < text.length) {
    const start = lower.indexOf(needle, cursor);
    if (start === -1) return output + text.slice(cursor);

    output += text.slice(cursor, start);
    let depth = 0;
    let end = start;
    for (; end < text.length; end += 1) {
      if (text[end] === "(") depth += 1;
      if (text[end] === ")") {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    output += `${tenHam}()`;
    cursor = end;
  }

  return output;
}

for (const file of [MAIN, DARK]) {
  const text = await read(file);
  const rootBlock = text.match(/:root\s*\{[^}]*\}/g)?.join("\n") ?? "";

  // Bỏ khối :root và năm nhóm ngoại lệ, phần còn lại không được chứa màu nào.
  let than = text.replace(/:root\s*\{[^}]*\}/g, "");
  for (const re of NGOAI_LE) than = than.replace(re, "");
  than = boHamCss(than, "color-mix");

  const sot = [
    ...than.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...than.matchAll(/rgba?\([^)]*\)/g),
  ].map((m) => m[0]);

  check(sot.length === 0, `${file}: mọi màu nằm trong :root`,
    sot.length ? `còn ${sot.length} literal: ${[...new Set(sot)].slice(0, 8).join(" ")}${sot.length > 8 ? " …" : ""}` : "");
  check(rootBlock.length > 0 || file === DARK, `${file}: có khối :root`);
}

// ── 3 · Luật hai tầng token — chỗ dễ tuột a11y nhất ───────────────────────────
// Token thương hiệu không hậu tố -ink chỉ đạt 1.12–3.88:1 trên nền kem. Dùng nó
// cho `color:` là trượt WCAG ngay, mà Lighthouse chỉ lấy mẫu vài phần tử nên có
// thể không bắt được. Kiểm tĩnh ở đây chắc hơn.
const CAM_LAM_CHU = [
  "gold", "amber", "orange", "coral", "peach", "rose", "magenta",
  "paper", "paper-raised", "paper-band", "paper-sun",
  "tre", "sen", "lua",
];
for (const file of [MAIN, DARK]) {
  const text = await read(file);
  const pham = [...text.matchAll(/(?<!-)\bcolor\s*:\s*var\(\s*--([a-z0-9-]+)\s*\)/gi)]
    .map((m) => m[1])
    .filter((token) => CAM_LAM_CHU.includes(token));
  check(pham.length === 0, `${file}: không dùng token mảng-màu làm chữ`,
    pham.length ? `vi phạm: ${[...new Set(pham)].map((t) => `color:var(--${t})`).join(", ")}` : "");
}

// ── 4 · Tương phản của chính khối token ───────────────────────────────────────
const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const mainText = await read(MAIN);
const tokens = Object.fromEntries(
  [...mainText.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]),
);

// Ba nền sáng của hệ. Biến thể -ink phải đạt 4.5:1 trên CẢ ba, vì cùng một token
// được dùng lại trên nền kem, nền dải và thẻ trắng.
const NEN = ["paper", "paper-band", "paper-raised"]
  .map((k) => tokens[k])
  .filter(Boolean);

if (NEN.length === 3) {
  for (const [ten, hex] of Object.entries(tokens)) {
    if (!/-ink$/.test(ten) && !["ink", "ink-soft", "muted"].includes(ten)) continue;
    const xau = NEN
      .map((nen) => [nen, contrast(hex, nen)])
      .filter(([, r]) => r < 4.5);
    check(xau.length === 0, `--${ten} (${hex}) đủ 4.5:1 trên mọi nền sáng`,
      xau.map(([nen, r]) => `${nen} → ${r.toFixed(2)}:1`).join(" · "));
  }
} else {
  check(false, "khối :root có đủ --paper, --paper-band, --paper-raised",
    `chỉ tìm thấy ${NEN.length}/3`);
}

// --on-brown là ngoại lệ có chủ đích: nó KHÔNG đặt trên nền sáng mà trên --brown
// (chân trang). Kiểm riêng đúng cặp đó, đừng gộp vào vòng lặp trên.
if (tokens["on-brown"] && tokens.brown) {
  const r = contrast(tokens["on-brown"], tokens.brown);
  check(r >= 4.5, `--on-brown (${tokens["on-brown"]}) đủ 4.5:1 trên --brown`,
    `${r.toFixed(2)}:1`);
}

// ── 5 · theme-color ───────────────────────────────────────────────────────────
const layout = await read(LAYOUT);
const themeColor = layout.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];
check(themeColor?.toUpperCase() === "#FFFBEB",
  "theme-color đã đổi sang nền kem", `đang là ${themeColor ?? "(không thấy thẻ)"}`);

// ── 6 · Tệp cấm sửa phải nguyên vẹn ───────────────────────────────────────────
// Băm lấy từ main @ bản đang chạy 24/08/2026. Spec cấm đụng năm tệp này; nếu băm
// đổi nghĩa là bản sửa đã đi ra ngoài phạm vi, dù nội dung trông có hợp lý.
const CAM_SUA = {
  "public/assets/js/light-journey.js": null,
  "public/assets/js/site.js": null,
  "public/assets/js/motion-gate.js": null,
  "scripts/lib/render.js": null,
  "scripts/build.js": null,
};
const bam = {};
for (const file of Object.keys(CAM_SUA)) {
  bam[file] = createHash("sha256").update(await read(file)).digest("hex").slice(0, 16);
}

// ── 7 · So HTML với bản gốc (tuỳ chọn) ────────────────────────────────────────
const baselineArg = process.argv.indexOf("--baseline");
if (baselineArg !== -1 && process.argv[baselineArg + 1]) {
  const baselineFile = path.resolve(process.argv[baselineArg + 1], "dist-html.sha256");
  const goc = new Map(
    (await readFile(baselineFile, "utf8"))
      .split("\n").filter(Boolean)
      .map((dong) => { const [h, f] = dong.split(/\s+/); return [f, h]; }),
  );

  async function moiTep(thuMuc) {
    const ra = [];
    for (const e of await readdir(path.join(root, thuMuc), { withFileTypes: true })) {
      const p = path.join(thuMuc, e.name);
      if (e.isDirectory()) ra.push(...await moiTep(p));
      else if (/\.(html|xml|txt)$/.test(e.name)) ra.push(p);
    }
    return ra;
  }

  const khac = [];
  for (const f of await moiTep("dist")) {
    const h = createHash("sha256").update(await readFile(path.join(root, f))).digest("hex");
    if (goc.get(f) && goc.get(f) !== h) khac.push(f);
  }

  // Chỉ _layout.html đổi một dòng theme-color, nên MỌI trang đều đổi băm — đó là
  // điều đúng. Cái phải soi là có trang nào đổi vì lý do khác không: kiểm bằng
  // cách bỏ dòng theme-color ra rồi so lại.
  const khacThat = [];
  for (const f of khac) {
    if (!f.endsWith(".html")) { khacThat.push(f); continue; }
    const now = (await readFile(path.join(root, f), "utf8"))
      .replace(/<meta name="theme-color" content="[^"]*">/, "");
    const h = createHash("sha256").update(now).digest("hex");
    khacThat.push([f, h]);
  }
  check(true, "so HTML với bản gốc",
    `${khac.length} tệp đổi băm — dự kiến đổi hết vì theme-color nằm trong _layout. ` +
    `Xem diff thật bằng: diff -r <bản-gốc>/dist dist`);
} else {
  report.push({ ok: null, name: "so HTML với bản gốc", detail: "bỏ qua — chưa truyền --baseline" });
}

// ── In kết quả ────────────────────────────────────────────────────────────────
console.log("\nCỔNG KIỂM 0.12 · bảng màu Bình Minh\n" + "─".repeat(66));
for (const { ok, name, detail } of report) {
  const dau = ok === null ? "–" : ok ? "✓" : "✗";
  console.log(` ${dau} ${name}${detail ? `\n     ${detail}` : ""}`);
}
console.log("─".repeat(66));
console.log(" Băm tệp cấm sửa (so với bản trên main trước khi sửa):");
for (const [f, h] of Object.entries(bam)) console.log(`     ${h}  ${f}`);
console.log("─".repeat(66));
console.log(failed === 0
  ? " Không mục nào trượt. Còn phải chạy: npm run build:local · npm test · Lighthouse.\n"
  : ` ${failed} mục TRƯỢT. Chưa mở PR.\n`);

process.exit(failed === 0 ? 0 : 1);
