import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PLANETS, SIGNS } from "../public/assets/js/daily-card/correspondences.js";
import {
  composeDailyReading,
  countWords,
  decodeTraceId,
} from "../public/assets/js/daily-card/reading-engine.js";

const cards = JSON.parse(await readFile(new URL("../seed/cards.json", import.meta.url), "utf8"));
const phases = [
  ["new", "trăng non", "hold", 0.92],
  ["waxing-crescent", "trăng lưỡi liềm đang lớn", "advance", 0.55],
  ["first-half", "nửa trăng đang lớn", "advance", 0.82],
  ["waxing-gibbous", "trăng gần tròn", "advance", 0.6],
  ["full", "trăng tròn", "hold", 0.96],
  ["waning-gibbous", "trăng bắt đầu khuyết", "retreat", 0.6],
  ["last-half", "nửa trăng đang vơi", "retreat", 0.82],
  ["waning-crescent", "trăng lưỡi liềm cuối tháng", "retreat", 0.55],
];
const stages = [["early", "mới chớm"], ["middle", "đang giữa dòng"], ["late", "đã gần chỗ kết"]];

/* Ranh giới từ cho tiếng Việt.

   \b của JavaScript chỉ biết [A-Za-z0-9_]. "\bđầu tư\b" KHÔNG khớp "đầu tư" vì
   đ và ư nằm ngoài bảng đó, nên suốt một thời gian năm trong số các từ bị cấm ở
   đây — đầu tư, pháp lý, quẻ, âm dương, vận số — chưa từng thật sự bị chặn.
   Lookaround theo \p{L}\p{N} đúng cho cả hai bảng chữ. */
const viWords = (alternatives) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, "iu");
const unsafeAdvice = viWords("chẩn đoán|mua|bán|đầu tư|pháp lý");

test("ranh giới từ bắt được cả chữ có dấu", () => {
  // Nếu ai đó đổi viWords về \b, test này đỏ trước khi lệnh cấm im lặng hỏng lại.
  for (const word of ["đầu tư", "pháp lý", "quẻ", "âm dương", "vận số", "mệnh"]) {
    assert.match(`một câu có ${word} ở giữa`, viWords(word), word);
  }
  assert.doesNotMatch("đầu tưởng tượng", viWords("đầu tư"));
});

function syntheticSky(index, dateKey = null) {
  const sign = SIGNS[index % SIGNS.length];
  const moonSign = SIGNS[Math.floor(index / 5) % SIGNS.length];
  const phase = phases[Math.floor(index / 7) % phases.length];
  const planet = PLANETS[Math.floor(index / 11) % PLANETS.length];
  const stage = stages[Math.floor(index / 13) % stages.length];
  const day = dateKey || `2026-${String((Math.floor(index / 28) % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`;
  return Object.freeze({
    drawnAt: `${day}T05:00:00.000Z`,
    dateKey: day,
    timeZone: "Asia/Ho_Chi_Minh",
    sunSign: sign,
    sunDecan: Math.floor(index / 3) % 3,
    moonSign,
    moonPhase: Object.freeze({ index: phases.indexOf(phase), key: phase[0], name: phase[1], direction: phase[2], salience: phase[3] }),
    planetaryHour: Object.freeze({ planetKey: planet.key, planetName: planet.name }),
    hiddenStage: Object.freeze({ index: stages.indexOf(stage), key: stage[0], name: stage[1] }),
  });
}

test("cùng seed và cùng thời điểm cho kết quả y hệt", () => {
  const input = { cards, deviceId: "same-device", sky: syntheticSky(314) };
  const expected = composeDailyReading(input);
  assert.deepEqual(composeDailyReading(input), expected);
});

test("cùng thiết bị và cùng ngày giữ nguyên lá cùng chiều", () => {
  const morning = composeDailyReading({ cards, deviceId: "one-device", sky: syntheticSky(7, "2026-04-08") });
  const evening = composeDailyReading({ cards, deviceId: "one-device", sky: syntheticSky(7, "2026-04-08") });
  assert.equal(morning.card.slug, evening.card.slug);
  assert.equal(morning.reversed, evening.reversed);
  assert.equal(morning.traceId, evening.traceId);
});

test("traceId giải mã ngược đúng và phát hiện mã bị sửa", () => {
  const reading = composeDailyReading({ cards, deviceId: "trace-device", sky: syntheticSky(91) });
  const decoded = decodeTraceId(reading.traceId);
  assert.equal(decoded.dateKey, reading.dateKey);
  assert.equal(decoded.cardIndex, reading.trace.cardIndex);
  assert.equal(decoded.reversed, reading.reversed);
  assert.equal(decoded.fortuneScore, reading.fortune.score);
  const tampered = reading.traceId.replace(/.$/u, (last) => (last === "A" ? "B" : "A"));
  assert.throws(() => decodeTraceId(tampered));
});

test("lời đọc có đủ mọi phần và phần nào cũng ngắn", () => {
  const reading = composeDailyReading({ cards, deviceId: "shape-device", sky: syntheticSky(42) });
  assert.equal(reading.version, 3);
  assert.equal(typeof reading.headline, "string");
  assert.equal(typeof reading.fortune.label, "string");
  assert.equal(typeof reading.fortune.line, "string");
  assert.equal(reading.areas.length, 3);
  assert.deepEqual(reading.areas.map((area) => area.key), ["work", "love", "money"]);
  assert.deepEqual(reading.areas.map((area) => area.label), ["Công việc", "Tình cảm", "Tiền bạc"]);
  assert.match(reading.omens.hour, /^\d{1,2}–\d{1,2}h$/u);
  assert.ok(reading.omens.number >= 1 && reading.omens.number <= 9);
  for (const key of ["sun", "moon", "phase", "hour"]) assert.equal(typeof reading.sky[key], "string");
});

test("10.000 mẫu: đủ dài, dễ đọc, không lặp và không lời khuyên ngoài phạm vi", () => {
  const outputs = new Set();
  const states = new Set();
  const levels = new Set();
  // Từ vựng Hán Việt của bói cũ vẫn bị cấm: giọng bói ở bản này đến từ cách nói
  // thẳng và bố cục, không đến từ chữ cổ. Xem đầu public/assets/js/daily-card/copy.js.
  const forbidden = viWords("quẻ|hào|Dịch|âm dương|ngũ hành|can chi|Kim tinh|Hỏa tinh|Thiên Yết|sóc|vọng|thượng huyền|quý nhân|vận số|mệnh|tiền định");
  // Chữ khó của bản trước. Người đọc phải dịch thêm một lượt trong đầu mới hiểu,
  // nên chúng bị cấm ra mặt trang — dùng trong mã thì được.
  const jargon = viWords("cộng hưởng|nguyên tố|decan|tự phản tư|chiêm tinh|nhịp ẩn|salience");

  for (let index = 0; index < 10_000; index += 1) {
    const reading = composeDailyReading({ cards, deviceId: `device-${index}`, sky: syntheticSky(index) });
    outputs.add(reading.text);
    states.add(`${reading.card.slug}:${reading.reversed ? "reversed" : "upright"}`);
    levels.add(reading.fortune.key);

    assert.ok(reading.wordCount >= 50 && reading.wordCount < 100, `${reading.wordCount}: ${reading.text}`);
    assert.doesNotMatch(reading.text, forbidden);
    assert.doesNotMatch(reading.text, jargon);
    assert.doesNotMatch(reading.text, unsafeAdvice);

    // Mỗi dòng phải đọc được trong một hơi. Dài hơn 14 chữ là người đọc bắt đầu lướt.
    for (const line of [reading.fortune.line, reading.advice, ...reading.areas.map((area) => area.line)]) {
      assert.ok(countWords(line) <= 14, `${countWords(line)} chữ: ${line}`);
    }
  }

  assert.ok(outputs.size >= 9_700, `chỉ có ${outputs.size} chuỗi khác nhau`);
  assert.equal(states.size, 156);
  // Cả năm mức vận ngày đều phải xuất hiện; nếu một mức không bao giờ tới thì
  // ngưỡng điểm trong copy.js đã lệch.
  assert.equal(levels.size, 5);
});
