#!/usr/bin/env node
/* Sinh seed/cards.json từ nguồn dữ liệu chuẩn.
 *
 *   node scripts/gen-seed-cards.mjs            # xem trước
 *   node scripts/gen-seed-cards.mjs --write
 *
 * Vì sao cần bước này, thay vì đổi tên bằng codemod:
 *
 * Tên lá không chỉ nằm ở trường `nameFolk`. Nó còn được nhúng vào `story`,
 * `symbols[0].name`, `keywordsUpright` phần cuối, `seo.description` và `image.alt`.
 * Codemod thay chuỗi chỉ chạm được vài chỗ trong số đó, để lại bản ghi nửa vời:
 * lá Công Lý sau khi đổi có nameFolk là "Tô Lịch Giang Thần / Long Đỗ" nhưng
 * story vẫn "Lang Liêu", còn image.alt thì thành "bánh chưng bánh giầy của
 * Tô Lịch Giang Thần / Long Đỗ" — ghép tên lá này vào cảnh của lá kia.
 *
 * Sinh lại thì mọi trường phái sinh luôn khớp nhau, và lần v2.2 tới chỉ cần
 * chạy lại lệnh.
 *
 * Trộn chứ không ghi đè: seed hiện tại giữ những thứ nguồn chuẩn không có —
 * đường dẫn ảnh, folkStyle, order, status, kích thước ảnh. Chỉ những trường
 * do TÊN sinh ra mới bị viết lại.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { MAJOR_ARCANA } from "../content/major-arcana.mjs";
import { MINOR_ARCANA } from "../content/minor-arcana.mjs";
import { sourcesOf } from "../content/sources.mjs";

const SEED = process.argv.includes("--seed")
  ? process.argv[process.argv.indexOf("--seed") + 1]
  : "../seed/cards.json";
const WRITE = process.argv.includes("--write");

const existing = JSON.parse(readFileSync(SEED, "utf8"));
const bySlug = new Map(existing.map((c) => [c.slug, c]));

const canon = new Map([
  ...MAJOR_ARCANA.map((c) => [c.slug, { ...c, arcana: "major" }]),
  ...MINOR_ARCANA.map((c) => [c.slug, { ...c, arcana: "minor" }]),
]);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Alt text phải mô tả TRANH ĐANG PHÁT HÀNH, không mô tả bản vẽ chưa có.
   Ba trường hợp:
   - Ẩn Phụ: ảnh là phù hiệu nhà (suit-sen.png…), dùng chung cho cả 14 lá. Alt cũ
     "Phù hiệu Nhà Sen cho lá Two of Cups" đã đúng và vẫn đúng sau khi đổi tên.
   - Ẩn Chính giữ tranh: alt cũ mô tả đúng bức đang phát hành, không đụng.
   - Ẩn Chính phải vẽ lại: tranh trên site vẫn là nhân vật CŨ. Alt không được
     khẳng định nhân vật mới — đó là mô tả một bức chưa tồn tại. */
const KEEPS_ART = (c) => c.arcana === "minor" || String(c.imageStatus).startsWith("KEEP");

function altFor(card, old) {
  if (KEEPS_ART(card)) return old?.alt ?? `Minh họa ${card.rwsName ?? card.enName}`;
  return `Lá ${card.rwsName} trong bộ Hường Đông Tarot — tranh đang được vẽ lại theo bản Art Direction 2.1`;
}

const changes = { nameFolk: 0, story: 0, symbols: 0, keywords: 0, seo: 0, alt: 0, imageUrl: 0, thumbUrl: 0, altHeld: 0 };
const touched = new Set();

const out = existing.map((old) => {
  const c = canon.get(old.slug);
  if (!c) return old;

  /* nameFolk là <h1> của trang lá và tiêu đề trong thư viện, nên nó phải là TÊN THẺ.
     Ẩn Chính: tên nhân vật ("Tô Lịch Giang Thần / Long Đỗ").
     Ẩn Phụ: tên thẻ theo v2.1 ("Hai Hoa Sen"), KHÔNG phải chủ thể của cảnh —
     đặt "Tiên Dung và Chử Đồng Tử" làm tiêu đề thư viện sẽ phá hệ thống tên nhà.
     Chủ thể của cảnh đi vào story và symbols[0]. */
  const cardName = c.arcana === "major" ? c.vietnameseTitle : c.viName;
  const subject = c.arcana === "major" ? c.vietnameseTitle : c.subject;
  const sub = c.subtitle ?? c.sceneTitle;
  const bridge = c.tarotBridge ?? c.shortStory;
  const next = structuredClone(old);
  let hit = false;
  const set = (path, val, key) => {
    const parts = path.split(".");
    let o = next;
    for (const p of parts.slice(0, -1)) o = o[p];
    const last = parts.at(-1);
    if (JSON.stringify(o[last]) === JSON.stringify(val)) return;
    o[last] = val; changes[key]++; hit = true;
  };

  set("nameFolk", cardName, "nameFolk");

  /* story: câu nhận diện + cầu nối Tarot, lấy nguyên văn v2.1 thay vì câu
     "đang được biên tập" chung chung của bản cũ. */
  /* story.
     Ẩn Chính: v2.1 có BẢN KỂ LẠI TOÀN TRUYỆN ba đến bốn đoạn, dài hơn hẳn câu
     "đang được biên tập" của bản cũ — dùng nguyên văn, rồi thêm đoạn cầu nối Tarot.
     Ẩn Phụ chỉ có truyện ngắn một câu nên gộp vào một đoạn.

     Giữ lại <p class="story-source"> nếu bản cũ có: đó là dòng dẫn nguồn thư tịch
     viết tay mà nguồn chuẩn không sinh ra được, và tests/hero-carousel.test.mjs
     đang kiểm đúng bốn dòng đó cho mục Tứ Bất Tử. */
  const keptSource = (old.story ?? "").match(/<p class="story-source">[\s\S]*?<\/p>/)?.[0] ?? "";
  const bridgePara = `<p><strong>${esc(subject)}</strong> — ${esc(sub)}. ${esc(bridge)}</p>`;
  const storyHtml = (c.arcana === "major"
    ? c.fullRetelling.map((para) => `<p>${esc(para)}</p>`).join("") + bridgePara
    : bridgePara) + keptSource;
  set("story", storyHtml, "story");

  /* symbols[0] là chủ thể của lá; các phần tử sau (Trống đồng…) giữ nguyên. */
  if (Array.isArray(next.symbols) && next.symbols.length) {
    const rest = next.symbols.slice(1);
    set("symbols", [{ name: subject, meaning: sub }, ...rest], "symbols");
  }

  /* Phần tử cuối của keywordsUpright là câu nhận diện, không phải từ khóa RWS.
     Ba từ khóa đầu là lõi RWS — bất biến, không đụng. */
  if (Array.isArray(next.keywordsUpright) && next.keywordsUpright.length > 3) {
    const kw = [...next.keywordsUpright];
    kw[kw.length - 1] = sub;
    set("keywordsUpright", kw, "keywords");
  }

  const en = c.rwsName ?? c.enName;
  set("seo.description",
      `${en}: nghĩa xuôi, nghĩa ngược và lớp liên tưởng ${subject} trong Hường Đông Tarot.`, "seo");

  /* Dùng biến thể đã tối ưu nếu build-images.mjs đã sinh ra. Kiểm bằng đĩa thay
     vì đoán: phù hiệu bốn nhà là PNG 2,4–2,8MB dùng làm thumbnail cho cả 56 lá
     Ẩn Phụ, đổi sang AVIF 800px giảm 95%. Tỉ lệ khung giữ nguyên nên width/height
     đã khai vẫn đúng và CLS không đổi. */
  const variant = (url, ...widths) => {
    if (!url || !/\.(png|jpe?g|webp)$/i.test(url)) return url;
    // Thử từ khổ lớn xuống nhỏ: ảnh gốc hẹp hơn 800px thì không có bản 800
    // (script không phóng to), nhưng vẫn có bản 400 dùng được.
    for (const w of widths) {
      const cand = url.replace(/\.(png|jpe?g|webp)$/i, `-${w}.avif`);
      if (existsSync(`../public${cand}`)) return cand;
    }
    return url;
  };
  if (next.image?.url) set("image.url", variant(next.image.url, 800, 400), "imageUrl");
  if (next.thumbnail?.url) set("thumbnail.url", variant(next.thumbnail.url, 400), "thumbUrl");

  const alt = altFor(c, old.image);
  if (KEEPS_ART(c)) changes.altHeld++;
  if (next.image) set("image.alt", alt, "alt");
  /* thumbnail có alt riêng, ngắn hơn ("Phù hiệu Nhà Sen") vì nó hiện ở ô nhỏ
     trong thư viện. Chỉ đồng bộ khi alt của ảnh lớn thật sự đổi — tức là lá phải
     vẽ lại. Copy vô điều kiện sẽ ghi đè 68 alt viết tay bằng bản dài không cần. */
  if (next.thumbnail && !KEEPS_ART(c)) next.thumbnail.alt = alt;

  /* Trạng thái duyệt đi kèm dữ liệu, để lớp giao diện tự quyết có gắn nhãn
     "đang biên tập" hay không — thay vì suy đoán từ chỗ khác. */
  next.imageStatus = c.imageStatus ?? "MISSING";
  next.culturalReviewStatus = c.culturalReviewStatus ?? "pending";
  next.sourceIds = c.sourceIds;
  next.adaptationLevel = c.adaptationLevel;
  next.sources = sourcesOf(c).map((s) => ({ id: s.id, title: s.title, isLNCQ: s.isLNCQ }));

  if (hit) touched.add(old.slug);
  return next;
});

/* Lõi RWS là bất biến trong migration — kiểm trước khi ghi. */
const immutable = ["nameVi", "nameEn", "meaningUpright", "meaningReversed", "number", "slug", "order", "status"];
const broken = [];
for (let i = 0; i < existing.length; i++) {
  for (const k of immutable) {
    if (JSON.stringify(existing[i][k]) !== JSON.stringify(out[i][k])) {
      broken.push(`${existing[i].slug}.${k}`);
    }
  }
}

console.log(`Sinh seed/cards.json từ nguồn chuẩn · ${existing.length} lá\n`);
console.log("Trường được viết lại");
for (const [k, v] of Object.entries(changes)) {
  if (k === "altHeld") continue;
  console.log(`   ${k.padEnd(10)} ${String(v).padStart(3)} lá`);
}
console.log(`\n   alt giữ nguyên vì tranh không đổi: ${changes.altHeld} lá`);
console.log(`   lá có ít nhất một thay đổi        : ${touched.size}/${existing.length}`);

if (broken.length) {
  console.log(`\n✗ CHẶN: ${broken.length} trường bất biến bị đụng`);
  for (const b of broken.slice(0, 10)) console.log(`   ${b}`);
  process.exit(1);
}
console.log(`\n✓ ${immutable.length} trường bất biến (lõi RWS, slug, order, status) không đổi`);

if (!WRITE) { console.log("\nXEM TRƯỚC — chưa ghi. Thêm --write để áp dụng."); process.exit(0); }
writeFileSync(SEED, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\n→ đã ghi ${SEED}`);
