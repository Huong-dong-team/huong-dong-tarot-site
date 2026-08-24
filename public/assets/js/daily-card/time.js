import { CHALDEAN_ORDER, DAY_RULERS, PLANET_BY_KEY, SIGNS } from "./correspondences.js";

export const DAILY_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const VIETNAM_OFFSET_MINUTES = 7 * 60;
export const HANOI_OBSERVER = Object.freeze({ latitude: 21.0278, longitude: 105.8342, height: 10 });

const PHASES = Object.freeze([
  Object.freeze({ index: 0, key: "new", name: "trăng non", direction: "hold", salience: 0.92 }),
  Object.freeze({ index: 1, key: "waxing-crescent", name: "trăng lưỡi liềm đang lớn", direction: "advance", salience: 0.55 }),
  Object.freeze({ index: 2, key: "first-half", name: "nửa trăng đang lớn", direction: "advance", salience: 0.82 }),
  Object.freeze({ index: 3, key: "waxing-gibbous", name: "trăng gần tròn", direction: "advance", salience: 0.6 }),
  Object.freeze({ index: 4, key: "full", name: "trăng tròn", direction: "hold", salience: 0.96 }),
  Object.freeze({ index: 5, key: "waning-gibbous", name: "trăng bắt đầu khuyết", direction: "retreat", salience: 0.6 }),
  Object.freeze({ index: 6, key: "last-half", name: "nửa trăng đang vơi", direction: "retreat", salience: 0.82 }),
  Object.freeze({ index: 7, key: "waning-crescent", name: "trăng lưỡi liềm cuối tháng", direction: "retreat", salience: 0.55 }),
]);

const STAGES = Object.freeze([
  Object.freeze({ index: 0, key: "early", name: "mới chớm" }),
  Object.freeze({ index: 1, key: "middle", name: "đang giữa dòng" }),
  Object.freeze({ index: 2, key: "late", name: "đã gần chỗ kết" }),
]);

export function normalizeDegrees(value) {
  const degrees = Number(value);
  if (!Number.isFinite(degrees)) throw new TypeError("Góc phải là một số hữu hạn.");
  return ((degrees % 360) + 360) % 360;
}

export function vietnamDateParts(moment) {
  const date = moment instanceof Date ? moment : new Date(moment);
  if (Number.isNaN(date.getTime())) throw new TypeError("Thời điểm bốc bài không hợp lệ.");
  const shifted = new Date(date.getTime() + VIETNAM_OFFSET_MINUTES * 60_000);
  return Object.freeze({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
  });
}

export function vietnamDateKey(moment) {
  const parts = vietnamDateParts(moment);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function signAtLongitude(longitude) {
  const degrees = normalizeDegrees(longitude);
  const index = Math.floor(degrees / 30);
  const decanIndex = Math.min(2, Math.floor((degrees % 30) / 10));
  return Object.freeze({ sign: SIGNS[index], decanIndex, degrees });
}

export function phaseAtAngle(angle) {
  const degrees = normalizeDegrees(angle);
  const index = Math.floor(((degrees + 22.5) % 360) / 45);
  return Object.freeze({ ...PHASES[index], degrees });
}

function localMidnight(parts, dayOffset = 0) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset) - VIETNAM_OFFSET_MINUTES * 60_000);
}

function weekday(parts, dayOffset = 0) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset)).getUTCDay();
}

function eventDate(event, label) {
  const date = event?.date instanceof Date ? event.date : event?.date ? new Date(event.date) : null;
  if (!date || Number.isNaN(date.getTime())) throw new Error(`Không tính được ${label} tại Hà Nội.`);
  return date;
}

function sunEvent(astronomy, parts, dayOffset, direction, observer) {
  const result = astronomy.SearchRiseSet(astronomy.Body.Sun, observer, direction, localMidnight(parts, dayOffset), 1.05);
  return eventDate(result, direction === 1 ? "bình minh" : "hoàng hôn");
}

export function calculatePlanetaryHour(moment, astronomy) {
  if (!astronomy?.Observer || !astronomy?.Body?.Sun || typeof astronomy.SearchRiseSet !== "function") {
    throw new TypeError("Thiếu bộ tính giờ mọc của Mặt Trời.");
  }
  const date = moment instanceof Date ? moment : new Date(moment);
  const parts = vietnamDateParts(date);
  const observer = new astronomy.Observer(HANOI_OBSERVER.latitude, HANOI_OBSERVER.longitude, HANOI_OBSERVER.height);
  const sunrise = sunEvent(astronomy, parts, 0, 1, observer);
  const sunset = sunEvent(astronomy, parts, 0, -1, observer);

  let periodStart;
  let periodEnd;
  let rulerWeekday;
  let hourOffset;
  let daylight;

  if (date < sunrise) {
    periodStart = sunEvent(astronomy, parts, -1, -1, observer);
    periodEnd = sunrise;
    rulerWeekday = weekday(parts, -1);
    hourOffset = 12;
    daylight = false;
  } else if (date < sunset) {
    periodStart = sunrise;
    periodEnd = sunset;
    rulerWeekday = weekday(parts);
    hourOffset = 0;
    daylight = true;
  } else {
    periodStart = sunset;
    periodEnd = sunEvent(astronomy, parts, 1, 1, observer);
    rulerWeekday = weekday(parts);
    hourOffset = 12;
    daylight = false;
  }

  const segment = (periodEnd.getTime() - periodStart.getTime()) / 12;
  const segmentIndex = Math.max(0, Math.min(11, Math.floor((date.getTime() - periodStart.getTime()) / segment)));
  const hourIndex = hourOffset + segmentIndex;
  const dayRulerKey = DAY_RULERS[rulerWeekday];
  const rulerIndex = CHALDEAN_ORDER.indexOf(dayRulerKey);
  const planetKey = CHALDEAN_ORDER[(rulerIndex + hourIndex) % CHALDEAN_ORDER.length];

  return Object.freeze({
    planetKey,
    planetName: PLANET_BY_KEY[planetKey].name,
    dayRulerKey,
    hourNumber: hourIndex + 1,
    daylight,
    startsAt: new Date(periodStart.getTime() + segment * segmentIndex).toISOString(),
    endsAt: new Date(periodStart.getTime() + segment * (segmentIndex + 1)).toISOString(),
  });
}

export function hiddenTimeStage(moment) {
  const parts = vietnamDateParts(moment);
  const position = ((parts.year + parts.month + parts.day + parts.hour + parts.minute) % 6) + 1;
  return Object.freeze({ ...STAGES[Math.floor((position - 1) / 2)], position });
}

export function calculateSkyMoment(moment, astronomy) {
  if (typeof astronomy?.SunPosition !== "function" || typeof astronomy?.EclipticGeoMoon !== "function" || typeof astronomy?.MoonPhase !== "function") {
    throw new TypeError("Thiếu bộ thiên văn cho Mặt Trời và Mặt Trăng.");
  }
  const date = moment instanceof Date ? moment : new Date(moment);
  if (Number.isNaN(date.getTime())) throw new TypeError("Thời điểm bốc bài không hợp lệ.");

  const sun = signAtLongitude(astronomy.SunPosition(date).elon);
  const moon = signAtLongitude(astronomy.EclipticGeoMoon(date).lon);
  const phase = phaseAtAngle(astronomy.MoonPhase(date));

  return Object.freeze({
    drawnAt: date.toISOString(),
    dateKey: vietnamDateKey(date),
    timeZone: DAILY_TIME_ZONE,
    sunSign: sun.sign,
    sunDecan: sun.decanIndex,
    sunLongitude: sun.degrees,
    moonSign: moon.sign,
    moonLongitude: moon.degrees,
    moonPhase: phase,
    planetaryHour: calculatePlanetaryHour(date, astronomy),
    hiddenStage: hiddenTimeStage(date),
  });
}
