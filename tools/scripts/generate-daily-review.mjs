#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Astronomy from "astronomy-engine";
import {
  DECAN_CARDS,
  ELEMENTS,
  MAJOR_CORRESPONDENCES,
  PLANET_BY_KEY,
  SIGN_BY_KEY,
} from "../../public/assets/js/daily-card/correspondences.js";
import { createDailyReading } from "../../public/assets/js/daily-card/reading-engine.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const output = process.argv[2];
if (!output) throw new Error("Cách dùng: node tools/scripts/generate-daily-review.mjs <tệp-kết-quả.md>");

const cards = JSON.parse(await readFile(path.join(root, "seed/cards.json"), "utf8"));
const cardBySlug = new Map(cards.map((card) => [card.slug, card]));
const kindLabel = Object.freeze({ sign: "Cung", planet: "Hành tinh", element: "Nguyên tố" });
const axisLabel = Object.freeze({
  B: "quan hệ nguyên tố với Mặt Trời",
  C: "tính chất cung Mặt Trời",
  D: "giờ hành tinh",
  E: "pha Trăng",
  F: "nguyên tố cung Mặt Trăng",
  G: "độ trùng decan",
  H: "nhịp ẩn của thời điểm",
});
const vietnamMoment = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "long",
  timeStyle: "short",
});

function correspondenceName(value) {
  if (value.kind === "sign") return SIGN_BY_KEY[value.key].name;
  if (value.kind === "planet") return PLANET_BY_KEY[value.key].name;
  return ELEMENTS[value.key].name;
}

function cardName(slug) {
  const card = cardBySlug.get(slug);
  if (!card) throw new Error(`Không tìm thấy lá ${slug} trong seed.`);
  return `${card.nameFolk || card.nameVi} · ${card.nameEn}`;
}

const majorRows = cards
  .filter((card) => card.arcana === "major")
  .map((card) => {
    const value = MAJOR_CORRESPONDENCES[card.slug];
    return `| ${card.number} | ${cardName(card.slug)} | ${kindLabel[value.kind]} | ${correspondenceName(value)} | ${ELEMENTS[value.element].name} |`;
  })
  .join("\n");

const decanRows = DECAN_CARDS.map((value) =>
  `| ${SIGN_BY_KEY[value.signKey].name} | ${value.decanIndex + 1} | ${cardName(value.slug)} | ${PLANET_BY_KEY[value.planetKey].name} |`,
).join("\n");

const start = Date.UTC(2026, 0, 3);
const hours = [0, 4, 8, 12, 16, 20];
const samples = Array.from({ length: 50 }, (_, index) => {
  const moment = new Date(start + index * 7 * 86_400_000 + hours[index % hours.length] * 3_600_000 + ((index * 13) % 60) * 60_000);
  return createDailyReading({
    cards,
    deviceId: `review-device-${String(index + 1).padStart(2, "0")}`,
    moment,
    astronomy: Astronomy,
  });
});

const sampleRows = samples.map((reading, index) => {
  const axes = reading.selectedAxes.map((item) => axisLabel[item.axis]).join(" · ");
  return [
    `### Mẫu ${String(index + 1).padStart(2, "0")} — ${cardName(reading.card.slug)} — ${reading.orientationLabel}`,
    "",
    `- Thời điểm: ${vietnamMoment.format(new Date(reading.drawnAt))} (Asia/Ho_Chi_Minh)`,
    `- Bối cảnh: Mặt Trời ${reading.context.sunSign}; Mặt Trăng ${reading.context.moonSign}, ${reading.context.moonPhase}; giờ ${reading.context.planetaryHour}.`,
    `- Ba trục nổi bật: ${axes}.`,
    `- Lời đọc (${reading.wordCount} từ): ${reading.text}`,
    `- Mã truy vết: \`${reading.traceId}\``,
  ].join("\n");
}).join("\n\n");

const wordCounts = samples.map((sample) => sample.wordCount);
const uniqueCards = new Set(samples.map((sample) => sample.card.slug)).size;
const reversed = samples.filter((sample) => sample.reversed).length;
const averageWords = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;

const markdown = `# Bản duyệt 1.5 — ánh xạ Golden Dawn và 50 mẫu “Lá hôm nay”

## Phạm vi cần duyệt

- Múi giờ: Asia/Ho_Chi_Minh.
- Bình minh và hoàng hôn: tọa độ Hà Nội (21.0278, 105.8342).
- Lá và chiều lá: khóa theo mã thiết bị ẩn danh + ngày Việt Nam; lần đầu được lưu cục bộ và không bốc lại để đổi kết quả trong ngày.
- Bối cảnh: Mặt Trời, Mặt Trăng, pha Trăng và giờ hành tinh theo thứ tự Chaldean; “nhịp ẩn” chỉ dùng nội bộ để chống lặp, không hiện như một khẳng định huyền học.
- Golden Dawn được dùng như hệ quy chiếu biên tập, không được mô tả là sự thật khoa học hay cách đọc duy nhất.
- Route vẫn \`noindex,follow\`, chưa vào sitemap và chưa được deploy trong lúc chờ duyệt.

## Ánh xạ 22 lá Ẩn Chính

| Số | Lá | Nhóm | Tương ứng | Nguyên tố dùng trong engine |
|---:|---|---|---|---|
${majorRows}

## Ánh xạ 36 lá số theo decan

| Cung | Decan | Lá | Hành tinh quản decan |
|---|---:|---|---|
${decanRows}

## Quy tắc 20 lá còn lại

### Bốn lá Át

| Nhà | Lá | Nguyên tố |
|---|---|---|
| Tre / Wands | Ace of Wands | Lửa |
| Đồng / Pentacles | Ace of Pentacles | Đất |
| Dâu Tằm / Swords | Ace of Swords | Khí |
| Sen / Cups | Ace of Cups | Nước |

### Mười sáu lá hoàng gia

Mỗi lá giữ nguyên tố chính của nhà bài; cấp bậc là lớp phụ: Page = Đất, Knight = Khí, Queen = Nước, King = Lửa. Ví dụ Queen of Wands là Lửa của nhà Tre với lớp phụ Nước của Queen.

## Thống kê 50 mẫu cố định

- ${uniqueCards}/78 lá khác nhau xuất hiện.
- ${50 - reversed} lá xuôi và ${reversed} lá ngược.
- Độ dài: nhỏ nhất ${Math.min(...wordCounts)} từ, lớn nhất ${Math.max(...wordCounts)} từ, trung bình ${averageWords.toFixed(1)} từ.
- Mỗi mẫu có mã truy vết kiểm tra toàn vẹn và có thể giải mã ngược để tái lập bối cảnh.

## 50 mẫu lời đọc

${sampleRows}

## Điểm duyệt đề nghị

1. Ánh xạ 22 Ẩn Chính và 36 decan có đúng hướng biên tập mong muốn không?
2. Quy tắc Át/hoàng gia có giữ được tinh thần RWS của Hường Đông không?
3. Giọng văn có đủ điềm tĩnh, không phán định, không cường điệu thiên văn không?
4. Có câu nào cần khóa hoặc sửa trước khi bỏ \`noindex\` không?
`;

await writeFile(path.resolve(output), markdown);
console.log(`Đã viết ${samples.length} mẫu vào ${path.resolve(output)}.`);
