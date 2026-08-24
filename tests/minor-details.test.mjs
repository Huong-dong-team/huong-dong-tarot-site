import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { escapeHtml } from "../scripts/lib/render.js";

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const minors = cards.filter((card) => card.arcana === "minor");
const majors = cards.filter((card) => card.arcana === "major");

const adaptationLabels = {
  LNCQ_CORE: "Lĩnh Nam chích quái — phần chính",
  LNCQ_CORE_ADAPTATION: "Dựa trên Lĩnh Nam chích quái, có biên tập khoảnh khắc",
  LNCQ_TUC_BIEN_ADAPTATION: "Dựa trên phần Tục Biên, có chuyển thể",
  VIET_FOLK_EXPANDED_ADAPTATION: "Tín ngưỡng Việt mở rộng ngoài Lĩnh Nam chích quái",
  EDITORIAL_FANTASY_INSPIRED: "Cảnh mới sáng tác, chỉ mượn motif",
};

const cardHtml = (slug) => readFile(new URL(`../dist/la-bai/${slug}/index.html`, import.meta.url), "utf8");

test("56 trang Ẩn Phụ có đủ bốn khối và toàn bộ trường đã escape", async () => {
  assert.equal(minors.length, 56);
  for (const card of minors) {
    const html = await cardHtml(card.slug);
    const detailSections = [...html.matchAll(/<section\b[^>]*data-minor-details="(?:context|applications|guidance|sources)"[^>]*>[\s\S]*?<\/section>/g)].map((match) => match[0]);
    assert.equal(detailSections.length, 4, card.slug);
    for (const field of ["subject", "sceneTitle", "scene", "shortStory", "love", "career", "finance", "health", "advice", "warning"]) {
      assert.ok(card[field], `${card.slug}: thiếu ${field} trong dữ liệu`);
      assert.ok(html.includes(escapeHtml(card[field])), `${card.slug}: chưa render ${field}`);
    }
    for (const source of card.sources) {
      assert.ok(html.includes(escapeHtml(source.id)), `${card.slug}: thiếu mã nguồn ${source.id}`);
      assert.ok(html.includes(escapeHtml(source.title)), `${card.slug}: thiếu nguồn ${source.title}`);
    }
    assert.ok(html.includes(escapeHtml(adaptationLabels[card.adaptationLevel])), `${card.slug}: thiếu nhãn mức chuyển thể`);
    for (const section of detailSections) {
      assert.doesNotMatch(section, /<(?:p|h2|h3|li)\b[^>]*>\s*<\/(?:p|h2|h3|li)>/, `${card.slug}: có thẻ nội dung rỗng`);
    }
  }
});

test("22 trang Ẩn Chính không nhận khối dành cho Ẩn Phụ", async () => {
  assert.equal(majors.length, 22);
  for (const card of majors) {
    assert.doesNotMatch(await cardHtml(card.slug), /data-minor-details=/, card.slug);
  }
});

test("heading trên trang Ẩn Phụ không nhảy cấp", async () => {
  for (const card of minors) {
    const html = await cardHtml(card.slug);
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
    assert.equal(levels[0], 1, `${card.slug}: heading đầu không phải h1`);
    for (let index = 1; index < levels.length; index += 1) {
      assert.ok(levels[index] <= levels[index - 1] + 1, `${card.slug}: h${levels[index - 1]} nhảy tới h${levels[index]}`);
    }
  }
});
