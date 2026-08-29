import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { reflectionCoverage, reflectionLens } from "../content/reflection-lenses.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const cards = JSON.parse(await readFile(path.join(root, "seed/cards.json"), "utf8"));
// Dựng mẫu cấm bằng mã Unicode để chính mã nguồn cũng không lưu tên mà chủ dự
// án yêu cầu tuyệt đối không xuất hiện trong nội dung hay hồ sơ biên tập.
const forbiddenAttribution = new RegExp("carl\\s+\\u006a\\u0075\\u006e\\u0067|\\u006a\\u0075\\u006e\\u0067(?:ian)?", "iu");

test("lớp soi chiếu phủ đủ 78 lá và đủ bốn trường biên tập", () => {
  assert.equal(cards.length, 78);
  assert.equal(reflectionCoverage.major.length, 22);
  assert.equal(reflectionCoverage.suits.length, 4);
  assert.equal(reflectionCoverage.ranks.length, 14);
  for (const card of cards) {
    const lens = reflectionLens(card);
    for (const field of ["pattern", "unseen", "dialogue", "integration"]) {
      assert.ok(lens[field]?.length > 15, `${card.slug}.${field}`);
    }
    assert.doesNotMatch(Object.values(lens).join(" "), forbiddenAttribution, card.slug);
  }
});

test("mọi trang lá xuất bản đều có góc soi chiếu và ranh giới an toàn", async () => {
  for (const card of cards) {
    const html = await readFile(path.join(root, "dist/la-bai", card.slug, "index.html"), "utf8");
    assert.equal((html.match(/data-reflection-lens/g) || []).length, 1, card.slug);
    assert.match(html, /không phải kết luận về tính cách, chẩn đoán tâm lý/i, card.slug);
    assert.doesNotMatch(html, forbiddenAttribution, card.slug);
  }
});

test("trang trải bài có ba khung soi chiếu và không gắn tên nguồn lý thuyết", async () => {
  const html = await readFile(path.join(root, "dist/trai-bai/index.html"), "utf8");
  for (const heading of ["Điều đang thể hiện", "Bốn tiếng nói bên trong", "Bước qua ngưỡng cửa"]) {
    assert.match(html, new RegExp(heading, "u"));
  }
  assert.match(html, /không thay thế hỗ trợ từ chuyên gia sức khỏe tâm thần/i);
  assert.doesNotMatch(html, forbiddenAttribution);
});

test("không có tên nguồn lý thuyết trong toàn bộ HTML xuất bản", async () => {
  const walk = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat();
  };
  const htmlFiles = (await walk(path.join(root, "dist"))).filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) assert.doesNotMatch(await readFile(file, "utf8"), forbiddenAttribution, file);
});
