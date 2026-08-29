#!/usr/bin/env node
/* Tải font từ Google về tự host, và sinh public/assets/css/fonts.css.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * Vì sao tự host: request tới fonts.googleapis.com chặn render. Đó là một vòng
 * DNS + TLS tới host khác, xảy ra TRƯỚC khi trình duyệt biết
 * mình cần file .woff2 nào — nên nó nằm thẳng trên đường tới khung hình đầu tiên.
 *
 * Giữ nguyên unicode-range mà Google khai, để trình duyệt chỉ tải dải ký tự thật
 * sự xuất hiện. Dải Việt và dải Latin tách riêng, mỗi file 5–23KB.
 */

import { writeFileSync, mkdirSync } from "node:fs";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const OUT_FONTS = "../public/assets/fonts";
const OUT_CSS = "../public/assets/css/fonts.css";

const FAMILIES = [
  "Be+Vietnam+Pro:wght@400;500;600;700",
  "Inter:wght@400",
];

mkdirSync(OUT_FONTS, { recursive: true });

let css = "";
for (const f of FAMILIES) {
  const r = await fetch(`https://fonts.googleapis.com/css2?family=${f}&display=swap&subset=vietnamese`,
                        { headers: { "user-agent": UA } });
  css += await r.text();
}

const faces = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
const seen = new Map();
for (const face of faces) {
  const fam = face.match(/font-family:\s*.([^;'"]+)/)?.[1]?.trim();
  const weight = face.match(/font-weight:\s*(\d+)/)?.[1];
  const url = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  const range = face.match(/unicode-range:\s*([^;]+)/)?.[1]?.trim() ?? "";
  if (!url || !fam) continue;
  // Dải Việt nhận ra bằng U+1EA0–1EF9, khối chữ có dấu của tiếng Việt.
  const isViet = /U\+1EA0/.test(range);
  const file = `${fam.toLowerCase().replace(/\s+/g, "-")}-${weight}${isViet ? "-vietnamese" : ""}.woff2`;
  if (seen.has(file)) continue;
  seen.set(file, { fam, weight, range, url });
}

let total = 0;
for (const [file, v] of seen) {
  const buf = Buffer.from(await (await fetch(v.url, { headers: { "user-agent": UA } })).arrayBuffer());
  writeFileSync(`${OUT_FONTS}/${file}`, buf);
  total += buf.length;
  console.log(`  ${(buf.length / 1024).toFixed(0).padStart(4)}KB  ${file}`);
}

const header = `/* Font tự host — SINH TỰ ĐỘNG bởi tools/scripts/fetch-fonts.mjs, đừng sửa tay.
 *
 * Giữ nguyên unicode-range của Google để trình duyệt chỉ tải dải ký tự cần dùng.
 */\n\n`;

writeFileSync(OUT_CSS, header + [...seen].map(([file, v]) => `@font-face {
  font-family: "${v.fam}";
  font-style: normal;
  font-weight: ${v.weight};
  font-display: swap;
  src: url("/assets/fonts/${file}") format("woff2");
  unicode-range: ${v.range};
}`).join("\n\n") + "\n", "utf8");

console.log(`\n${seen.size} face · ${(total / 1024).toFixed(0)}KB · → ${OUT_CSS}`);
