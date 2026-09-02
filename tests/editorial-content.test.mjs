import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PILOT_CARD_SLUGS,
  auditPilotCards,
  exactShingleOverlaps,
} from "../scripts/lib/editorial-audit.js";

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
const cards = JSON.parse(await read("seed/cards.json"));
const posts = JSON.parse(await read("seed/posts.json"));

test("tám lá mẫu có nội dung riêng, đủ cụ thể và thân thiện với người mới", () => {
  assert.deepEqual(auditPilotCards(cards), []);
});

test("trang nhập môn giải thích cấu trúc và kể trước khi giảng", async () => {
  const html = await read("templates/tarot-la-gi.html");
  assert.match(html, /Tarot là một bộ bài gồm 78 lá/);
  assert.match(html, /22 lá Ẩn Chính/);
  assert.match(html, /56 lá Ẩn Phụ/);
  assert.match(html, /Rider–Waite–Smith<\/strong>, viết tắt là <strong>RWS<\/strong>/);
  assert.ok(html.indexOf("Một người mới mở hộp bài") < html.indexOf("Tarot là một bộ bài"));
  assert.match(html, /Chúng tôi/);
});

test("hồ sơ lá kể chuyện trước khi giảng nghĩa", async () => {
  const html = await read("templates/card-detail.html");
  assert.ok(html.indexOf("story-detail") < html.indexOf("meaning-section"));
});

test("các content section xưng chúng tôi và không mở câu bằng mệnh lệnh cụt", async () => {
  for (const name of [
    "about.html",
    "card-list.html",
    "cua-hang.html",
    "healing.html",
    "huong-dan-tarot.html",
    "huong-dan-dat-cau-hoi.html",
    "huong-dan-xao-bai.html",
    "huong-dan-doc-la-bai.html",
    "tarot-la-gi.html",
    "trai-bai.html",
  ]) {
    const html = await read(`templates/${name}`);
    assert.match(html, /[Cc]húng tôi/, name);
    assert.doesNotMatch(html, /<(?:p|li)(?: [^>]*)?>(?:Đừng|Hãy|Chọn|Đọc|Giữ|Viết|Rút|Nhìn|Tìm|Dừng|Nhận diện|Đổi|Quan sát|Dùng khi)\b/, name);
  }
});

test("hai bài nền có cảnh mở, chủ thể thương hiệu và độ dài hữu ích", () => {
  assert.equal(posts.length, 2);
  for (const post of posts) {
    assert.match(post.contentHtml, /[Cc]húng tôi/, post.slug);
    assert.ok(post.contentHtml.length > 1_000, post.slug);
    const opening = post.contentHtml.match(/^<p>([\s\S]*?)<\/p>/)?.[1] ?? "";
    assert.ok(opening.length > 150 && /[Bb]ạn/.test(opening), post.slug);
  }
});

test("bộ dò sao chép nhận đúng chuỗi dài và bỏ qua cụm ngắn", () => {
  const source = "Bên bờ sông, người học đặt từng lá bài xuống rồi ghi lại điều mình thực sự nhìn thấy trước khi tra nghĩa trong sách.";
  const copied = "Mở đầu khác. Người học đặt từng lá bài xuống rồi ghi lại điều mình thực sự nhìn thấy trước khi tra nghĩa trong sách. Kết thúc khác.";
  const independent = "Người đọc quan sát một lá trước khi mở phần giải thích.";
  assert.ok(exactShingleOverlaps(source, copied, 14).length > 0);
  assert.deepEqual(exactShingleOverlaps(source, independent, 14), []);
  assert.equal(PILOT_CARD_SLUGS.length, 8);
});
