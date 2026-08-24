import test from "node:test";
import assert from "node:assert/strict";
import * as Astronomy from "astronomy-engine";
import {
  calculatePlanetaryHour,
  calculateSkyMoment,
  signAtLongitude,
} from "../public/assets/js/daily-card/time.js";

const angularDistance = (left, right) => {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
};

test("365 ngày phủ đủ 12 cung và 36 decan Mặt Trời", () => {
  const positions = new Set();
  for (let day = 0; day < 365; day += 1) {
    const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
    const position = signAtLongitude(Astronomy.SunPosition(date).elon);
    positions.add(`${position.sign.key}:${position.decanIndex}`);
  }
  assert.equal(positions.size, 36);
});
test("bốn mốc mùa khớp kinh độ Mặt Trời chuẩn", () => {
  const seasons = Astronomy.Seasons(2026);
  const fixtures = [
    [seasons.mar_equinox.date, 0],
    [seasons.jun_solstice.date, 90],
    [seasons.sep_equinox.date, 180],
    [seasons.dec_solstice.date, 270],
  ];
  for (const [date, expected] of fixtures) {
    assert.ok(angularDistance(Astronomy.SunPosition(date).elon, expected) < 0.01);
  }
});

test("kinh độ Mặt Trăng nằm trong sai số một độ của bộ mốc đã khóa", () => {
  const fixtures = [
    ["2026-01-01T00:00:00Z", 66.71669545936106],
    ["2026-03-20T14:45:36.044Z", 20.512386100868678],
    ["2026-08-24T07:30:00Z", 287.1561365066471],
    ["2026-12-31T23:59:59Z", 204.6144588346516],
  ];
  for (const [iso, expected] of fixtures) {
    const sky = calculateSkyMoment(new Date(iso), Astronomy);
    assert.ok(angularDistance(sky.moonLongitude, expected) <= 1);
  }
});

test("giờ hành tinh chia từ bình minh Hà Nội theo thứ tự Chaldean", () => {
  const value = calculatePlanetaryHour(new Date("2026-08-24T07:30:00Z"), Astronomy);
  assert.equal(value.dayRulerKey, "moon");
  assert.equal(value.planetKey, "saturn");
  assert.equal(value.hourNumber, 9);
  assert.equal(value.daylight, true);
  assert.ok(new Date(value.startsAt) < new Date(value.endsAt));
});
