/* Cổng giữ data/names/vi.toml khớp với seed/cards.json.
 *
 * Lý do có cổng này: lớp tên chỉ có ích khi nó là nguồn duy nhất. Nếu thêm lá
 * mà quên sinh lại, hoặc ai đó sửa slug trong vi.toml, thì lớp tên lặng lẽ lệch
 * khỏi dữ liệu — đúng thứ bệnh mà file này sinh ra để chữa.
 *
 * Đọc TOML bằng bộ đọc tối giản ngay trong file: bộ này chỉ cần hiểu chuỗi,
 * mảng chuỗi, bảng lồng và chú thích — đúng những gì generator sinh ra. Không
 * thêm thư viện, theo ràng buộc của dự án.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function parseToml(text) {
  const root = {};
  let table = root;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      table = header[1]
        .split(".")
        .map((k) => k.replace(/^"|"$/g, ""))
        .reduce((node, k) => (node[k] ??= {}), root);
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_"-]+)\s*=\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1].replace(/^"|"$/g, "");
    let value = pair[2].replace(/\s+#.*$/, "").trim();
    table[key] = value.startsWith("[")
      ? [...value.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1])
      : value.replace(/^"|"$/g, "").replace(/\\"/g, '"');
  }
  return root;
}

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const names = parseToml(await readFile(new URL("../data/names/vi.toml", import.meta.url), "utf8"));
const SUITS = ["wands", "cups", "swords", "pentacles"];
const RANKS = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "page", "knight", "queen", "king"];

test("phủ đủ 78 lá", () => {
  assert.equal(Object.keys(names.major_arcana).length, 22);
  assert.equal(SUITS.reduce((n, s) => n + Object.keys(names.minor_arcana[s]).length, 0), 56);
  for (const s of SUITS) assert.deepEqual(Object.keys(names.minor_arcana[s]), RANKS, s);
});

test("slug trong vi.toml khớp seed/cards.json", () => {
  const seen = new Set();
  for (const card of cards) {
    const entry =
      card.arcana === "major"
        ? names.major_arcana[String(card.number).padStart(2, "0")]
        : names.minor_arcana[card.suit][RANKS.find((r) => card.slug.startsWith(`${r}-of-`))];
    assert.ok(entry, `thiếu mục cho ${card.slug}`);
    assert.equal(entry.slug, card.slug, `slug lệch ở ${card.slug}`);
    seen.add(entry.slug);
  }
  assert.equal(seen.size, 78);
});

test("mọi lá có tên hiển thị, không lá nào bỏ trống", () => {
  const entries = [...Object.values(names.major_arcana), ...SUITS.flatMap((s) => Object.values(names.minor_arcana[s]))];
  for (const e of entries) {
    assert.ok(e.display && e.display.length > 0, `thiếu display: ${e.slug}`);
    assert.ok(e.rws && e.rws.length > 0, `thiếu rws: ${e.slug}`);
    assert.notEqual(e.display, "đang phát triển", `display chưa chốt: ${e.slug}`);
  }
});

test("bốn nhà có đủ hai dạng tên", () => {
  for (const s of SUITS) {
    assert.ok(names.suits[s].name, s);
    assert.ok(names.suits[s].short, s);
  }
  assert.equal(Object.keys(names.ranks).length, 14);
});

test("23 lá neo dân gian chờ duyệt đều còn nguyên ba lựa chọn", () => {
  const blocks = SUITS.flatMap((s) => Object.values(names.review.neo_dan_gian[s] ?? {}));
  assert.equal(blocks.length, 23);
  for (const b of blocks) {
    for (const k of ["v21", "bo_56", "neo_cu"]) assert.ok(b[k] && b[k].length > 0, `${b.slug} thiếu ${k}`);
    assert.ok(["đang phát triển", "v21", "neo_cu", "bo_trong"].includes(b.decision), `${b.slug}: decision không hợp lệ — ${b.decision}`);
  }
});
