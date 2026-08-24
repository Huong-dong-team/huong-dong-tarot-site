import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PLANETS, SIGNS } from "../public/assets/js/daily-card/correspondences.js";
import {
  composeDailyReading,
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
  for (let index = 0; index < 100; index += 1) assert.deepEqual(composeDailyReading(input), expected);
});
test("cùng thiết bị và cùng ngày giữ nguyên lá cùng chiều", () => {
  const first = composeDailyReading({ cards, deviceId: "daily-device", sky: syntheticSky(1, "2026-08-24") });
  const later = composeDailyReading({ cards, deviceId: "daily-device", sky: syntheticSky(999, "2026-08-24") });
  assert.equal(later.card.slug, first.card.slug);
  assert.equal(later.reversed, first.reversed);
});

test("traceId giải mã ngược đúng và phát hiện mã bị sửa", () => {
  const reading = composeDailyReading({ cards, deviceId: "trace-device", sky: syntheticSky(88) });
  assert.deepEqual(decodeTraceId(reading.traceId), reading.trace);
  const changed = `${reading.traceId.slice(0, -1)}${reading.traceId.endsWith("0") ? "1" : "0"}`;
  assert.throws(() => decodeTraceId(changed), /toàn vẹn/u);
});

test("10.000 mẫu đạt độ dài, giọng, độ phủ, độ khác nhau và cân bằng trục", () => {
  const outputs = new Set();
  const states = new Set();
  const axisCounts = Object.fromEntries(["B", "C", "D", "E", "F", "G", "H"].map((axis) => [axis, 0]));
  const forbidden = /\b(?:quẻ|hào|Dịch|âm dương|ngũ hành|can chi|Kim tinh|Hỏa tinh|Thiên Yết|sóc|vọng|thượng huyền|quý nhân|vận số|mệnh|tiền định)\b/iu;

  for (let index = 0; index < 10_000; index += 1) {
    const reading = composeDailyReading({ cards, deviceId: `device-${index}`, sky: syntheticSky(index) });
    outputs.add(reading.text);
    states.add(`${reading.card.slug}:${reading.reversed ? "reversed" : "upright"}`);
    assert.equal(reading.sentences.length, 5);
    assert.ok(reading.wordCount >= 45 && reading.wordCount <= 95, `${reading.wordCount}: ${reading.text}`);
    assert.doesNotMatch(reading.text, forbidden);
    assert.doesNotMatch(reading.text, /\b(?:chẩn đoán|mua|bán|đầu tư|pháp lý)\b/iu);
    assert.ok(!(reading.text.includes("dứt khoát") && reading.text.includes("hãy chờ")));
    for (const item of reading.selectedAxes) axisCounts[item.axis] += 1;
  }

  assert.ok(outputs.size >= 9_700, `chỉ có ${outputs.size} chuỗi khác nhau`);
  assert.equal(states.size, 156);
  for (const [axis, count] of Object.entries(axisCounts)) assert.ok(count / 10_000 <= 0.6, `${axis} xuất hiện ${count} lần`);
});
