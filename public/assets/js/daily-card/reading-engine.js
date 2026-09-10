import {
  ADVICE_COPY,
  DAY_SHAPE,
  FORTUNE_LEVELS,
  HOUR_PLAIN,
  LOVE_COPY,
  LUCKY_COLOR,
  LUCKY_HOUR,
  MONEY_COPY,
  MOON_ELEMENT_PLAIN,
  MOON_PHASE_PLAIN,
  SUN_SIGN_PLAIN,
  WORK_COPY,
  pickVariant,
} from "./copy.js";
import {
  PLANETS,
  correspondenceForCard,
  decanResonance,
  elementRelation,
} from "./correspondences.js";
import { calculateSkyMoment } from "./time.js";

const MODALITY_INDEX = Object.freeze({ starting: 0, steady: 1, changing: 2 });
const RESONANCE_INDEX = Object.freeze({ none: 0, "same-sign": 1, exact: 2 });
const RELATION_DIRECTION = Object.freeze({ same: "advance", supporting: "advance", tension: "retreat", "cross-current": "hold" });
const DIRECTION_NUMBER = Object.freeze({ advance: 1, hold: 0, retreat: -1 });

export function hashString(value) {
  let hash = 0x811c9dc5;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function hashedFraction(seed, channel) {
  return hashString(`${seed}|${channel}`) / 0xffffffff;
}

function hashedIndex(seed, channel, length) {
  if (!Number.isInteger(length) || length < 1) throw new RangeError("Danh sách chọn phải có phần tử.");
  return hashString(`${seed}|${channel}`) % length;
}

export function plainTextFromHtml(value) {
  return String(value || "")
    .replace(/<\/?(?:p|br|li|blockquote|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:0*39|x0*27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(value) {
  const text = plainTextFromHtml(value);
  return text.split(/(?<=[.!?])\s+/u)[0] || text;
}

/* Ranh giới từ cho tiếng Việt.

   \b của JavaScript chỉ biết [A-Za-z0-9_], nên "\bđầu tư\b" KHÔNG bao giờ khớp
   "đầu tư": chữ đ và ư nằm ngoài bảng đó. Mọi lệnh cấm từ vựng viết bằng \b mà
   từ khóa bắt đầu hoặc kết thúc bằng chữ có dấu đều im lặng không chạy. Lookaround
   theo \p{L}\p{N} thì đúng cho cả hai bảng chữ. */
const WORD_START = "(?<![\\p{L}\\p{N}])";
const WORD_END = "(?![\\p{L}\\p{N}])";
const UNSAFE_ADVICE = new RegExp(`${WORD_START}(?:chẩn đoán|mua|bán|đầu tư|pháp lý)${WORD_END}`, "iu");

function finishSentence(value) {
  const text = String(value).trim().replace(/[,;:.!?…]+$/u, "");
  return text ? `${text}.` : "";
}

/**
 * Cắt câu xuống dưới ngưỡng chữ, chỉ cắt ở dấu phẩy hoặc dấu chấm phẩy.
 * @param {string} value câu gốc
 * @param {number} maxWords số chữ tối đa
 * @returns {string|null} câu đã cắt, hoặc null nếu không có chỗ ngắt sạch
 */
function shortenAtBoundary(value, maxWords) {
  const words = String(value).trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return null;
  if (words.length <= maxWords) return finishSentence(words.join(" "));
  const window = words.slice(0, maxWords);
  // Lấy chỗ ngắt xa nhất còn nằm trong ngưỡng: giữ được nhiều ý nhất mà câu vẫn trọn.
  for (let index = window.length - 1; index >= 1; index -= 1) {
    if (/[,;:]$/u.test(window[index - 1])) return finishSentence(window.slice(0, index).join(" "));
  }
  return null;
}

/** Viết hoa chữ đầu; tên pha trăng trong dữ liệu vốn viết thường. */
function capitalise(value) {
  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function countWords(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length;
}

function skyDirection(relation, moonDirection) {
  const score = DIRECTION_NUMBER[RELATION_DIRECTION[relation]] + DIRECTION_NUMBER[moonDirection];
  if (score > 0) return "advance";
  if (score < 0) return "retreat";
  return "hold";
}

function alignment(cardDirection, direction) {
  if (cardDirection === "hold" || direction === "hold") return "mixed";
  return cardDirection === direction ? "resonance" : "tension";
}

/* Điểm vận ngày. Bốn tín hiệu, mỗi tín hiệu một phiếu:
   chiều lá, lá có hợp mùa Mặt Trời không, trăng đang lên hay đang xuống, và lá
   có rơi đúng đoạn trời đang đứng không. Cộng lại ra khoảng -3 đến +4. */
const RELATION_SCORE = Object.freeze({ same: 1, supporting: 1, tension: -1, "cross-current": 0 });
const RESONANCE_SCORE = Object.freeze({ exact: 1, "same-sign": 0, none: 0 });

function fortuneScore({ reversed, relation, moonDirection, resonance }) {
  return (reversed ? -1 : 1)
    + RELATION_SCORE[relation]
    + DIRECTION_NUMBER[moonDirection]
    + RESONANCE_SCORE[resonance];
}

function fortuneLevel(score) {
  return FORTUNE_LEVELS.find((level) => score >= level.min) || FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}

/* Bốn nhóm pha trăng thay cho tám pha: người đọc chỉ cần biết trăng đang lên,
   đang tròn, đang xuống hay đang tối. */
const PHASE_GROUP = Object.freeze({
  new: "new",
  "waxing-crescent": "waxing",
  "first-half": "waxing",
  "waxing-gibbous": "waxing",
  full: "full",
  "waning-gibbous": "waning",
  "last-half": "waning",
  "waning-crescent": "waning",
});

/* Lá nào cũng phải ra được một hành tinh để tra giờ hợp. Lá Át và lá hình người
   không gắn hành tinh nên lấy theo chất của lá. */
const ELEMENT_PLANET = Object.freeze({ fire: "mars", earth: "venus", air: "mercury", water: "moon" });
const MINOR_RANK = Object.freeze({
  ace: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, page: 11, knight: 12, queen: 13, king: 14,
});

/* Số hợp: số của lá rút về một chữ số. Lá Khờ mang số 0 nên nhận 9 — không có
   số 0 trong bảng, và 9 là số cuối vòng, hợp với lá đứng ngoài thứ tự. */
function luckyNumber(card) {
  const rank = card.arcana === "major"
    ? Number(card.number) || 0
    : MINOR_RANK[String(card.slug).split("-")[0]] || 0;
  return rank === 0 ? 9 : ((rank - 1) % 9) + 1;
}

function encodeNumber(value) {
  return Number(value).toString(36).padStart(2, "0");
}

export function encodeTraceId(trace) {
  const date = String(trace.dateKey).replaceAll("-", "");
  const values = [
    trace.cardIndex,
    trace.reversed ? 1 : 0,
    trace.sunSignIndex,
    trace.sunDecan,
    trace.moonSignIndex,
    trace.moonPhaseIndex,
    trace.planetIndex,
    trace.modalityIndex,
    trace.resonanceIndex,
    trace.hiddenStageIndex,
    trace.fortuneScore + 10,
  ];
  const payload = values.map(encodeNumber).join("");
  const body = `HD2-${date}-${payload}`.toUpperCase();
  const checksum = hashString(body).toString(36).padStart(7, "0").slice(-7);
  return `${body}-${checksum.toUpperCase()}`;
}

export function decodeTraceId(traceId) {
  const match = String(traceId).toUpperCase().match(/^HD2-(\d{8})-([0-9A-Z]{22})-([0-9A-Z]{7})$/u);
  if (!match) throw new TypeError("Mã truy vết không đúng định dạng.");
  const body = `HD2-${match[1]}-${match[2]}`;
  const expected = hashString(body).toString(36).padStart(7, "0").slice(-7).toUpperCase();
  if (expected !== match[3]) throw new Error("Mã truy vết không qua kiểm tra toàn vẹn.");
  const values = match[2].match(/.{2}/g).map((part) => Number.parseInt(part, 36));
  return Object.freeze({
    dateKey: `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`,
    cardIndex: values[0],
    reversed: values[1] === 1,
    sunSignIndex: values[2],
    sunDecan: values[3],
    moonSignIndex: values[4],
    moonPhaseIndex: values[5],
    planetIndex: values[6],
    modalityIndex: values[7],
    resonanceIndex: values[8],
    hiddenStageIndex: values[9],
    fortuneScore: values[10] - 10,
  });
}

/* Câu mở đầu của lời đọc.

   Nghĩa lá lấy từ Firestore nên dài ngắn không đoán trước được, và người biên
   tập không viết nó cho khung này. Vì vậy có hai đường lui, theo thứ tự:

   1. Cắt ở dấu phẩy gần nhất còn trong ngưỡng. Bản trước cắt cứng đúng chữ thứ
      11 và cho ra "…hoặc tiếp tục chỉ vì." — câu cụt, người đọc không hiểu gì.
   2. Không có chỗ ngắt sạch, hoặc phần cắt ra còn dính lời khuyên ngoài phạm vi
      (tiền nong, sức khỏe, kiện tụng) thì bỏ hẳn câu và dùng từ khóa của lá.
      Từ khóa luôn ngắn, luôn trọn nghĩa và do người biên tập chọn sẵn. */
function cardMeaning(card, reversed) {
  const source = reversed ? card.meaningReversed : card.meaningUpright;
  const replacements = [
    [/chăm sóc/giu, "vun bồi"],
    [/hy vọng/giu, "niềm tin"],
    [/kỳ vọng/giu, "điều mong đợi"],
    [/tự hào/giu, "niềm tự tin"],
    [/âm dương/giu, "hai phía"],
    [/ngũ hành/giu, "các nguyên tố"],
    [/can chi/giu, "lịch cũ"],
    [/Kim tinh/giu, "Sao Kim"],
    [/Hỏa tinh/giu, "Sao Hỏa"],
    [/Thiên Yết/giu, "Bọ Cạp"],
    [/thượng huyền/giu, "nửa trăng đang lớn"],
    [/quý nhân/giu, "người hỗ trợ"],
    [/vận số/giu, "hoàn cảnh"],
    [/tiền định/giu, "đã được định trước"],
    [/sứ mệnh/giu, "điều theo đuổi"],
    [/quẻ/giu, "hình tượng"],
    [/hào/giu, "nấc"],
    [/Dịch/gu, "sự đổi thay"],
    [/sóc/giu, "trăng non"],
    [/vọng/giu, "trăng tròn"],
    [/mệnh/giu, "đời"],
  ];
  const cleaned = replacements.reduce((text, [pattern, value]) => text.replace(pattern, value), firstSentence(source));
  const shortened = shortenAtBoundary(cleaned, 13);
  if (shortened && !UNSAFE_ADVICE.test(shortened)) return shortened;

  const keywords = (reversed ? card.keywordsReversed : card.keywordsUpright) || [];
  const safe = keywords.filter((word) => typeof word === "string" && !UNSAFE_ADVICE.test(word)).slice(0, 3);
  return finishSentence(capitalise(safe.join(", ")));
}

function validateSky(sky) {
  const valid = sky?.dateKey && sky?.sunSign && sky?.moonSign && sky?.moonPhase && sky?.planetaryHour && sky?.hiddenStage;
  if (!valid) throw new TypeError("Dữ liệu bầu trời chưa đầy đủ.");
}

export function composeDailyReading({ cards, deviceId, sky }) {
  if (!Array.isArray(cards) || cards.length !== 78) throw new RangeError("Bộ bài Lá hôm nay phải có đúng 78 lá.");
  if (!String(deviceId || "").trim()) throw new TypeError("Thiết bị phải có mã ẩn danh.");
  validateSky(sky);

  const seed = `${String(deviceId).trim()}|${sky.dateKey}`;
  const cardIndex = hashedIndex(seed, "card", cards.length);
  const reversed = hashedIndex(seed, "orientation", 2) === 1;
  const card = cards[cardIndex];
  const correspondence = correspondenceForCard(card);
  const relation = elementRelation(correspondence.element, sky.sunSign.element);
  const resonance = decanResonance(card, sky.sunSign.index, sky.sunDecan);
  const stage = sky.hiddenStage.key;
  const phaseGroup = PHASE_GROUP[sky.moonPhase.key];
  const orientationKey = reversed ? "reversed" : "upright";

  const score = fortuneScore({ reversed, relation, moonDirection: sky.moonPhase.direction, resonance });
  const level = fortuneLevel(score);
  const combinedDirection = skyDirection(relation, sky.moonPhase.direction);
  const frame = alignment(reversed ? "retreat" : "advance", combinedDirection);

  const name = card.nameFolk || card.nameVi || card.nameEn;
  const headline = cardMeaning(card, reversed);

  const dayShape = pickVariant(DAY_SHAPE, `${sky.moonPhase.direction}:${stage}`, hashedIndex(seed, "shape", 3));
  const work = pickVariant(WORK_COPY, `${relation}:${stage}`, hashedIndex(seed, "work", 3));
  const love = pickVariant(LOVE_COPY, `${sky.moonSign.element}:${phaseGroup}`, hashedIndex(seed, "love", 3));
  const money = pickVariant(MONEY_COPY, `${sky.sunSign.modality}:${orientationKey}`, hashedIndex(seed, "money", 3));
  const advice = pickVariant(ADVICE_COPY, `${frame}:${combinedDirection}`, hashedIndex(seed, "advice", 3));

  const planetKey = correspondence.planetKey || ELEMENT_PLANET[correspondence.element];
  const colorVariants = LUCKY_COLOR[correspondence.element];
  const omens = Object.freeze({
    hour: LUCKY_HOUR[planetKey],
    color: colorVariants[hashedIndex(seed, "color", colorVariants.length)],
    number: luckyNumber(card),
  });

  const areas = Object.freeze([
    Object.freeze({ key: "work", label: "Công việc", line: work }),
    Object.freeze({ key: "love", label: "Tình cảm", line: love }),
    Object.freeze({ key: "money", label: "Tiền bạc", line: money }),
  ]);

  const fortune = Object.freeze({ key: level.key, label: level.label, line: dayShape, score });
  const omenLine = `Giờ hợp ${omens.hour} · Màu hợp ${omens.color} · Số hợp ${omens.number}.`;

  /* Bản chữ phẳng dùng cho nút Chia sẻ và Sao chép. Đây cũng là chuỗi mà
     tests/daily-reading.test.mjs soi: 50 đến 99 chữ, không chữ khó, không lời
     khuyên về sức khỏe hay tiền nong. Thứ tự dòng đúng như trên màn hình để
     người nhận bản sao đọc thấy y hệt người bốc. */
  const lines = [
    `Lá hôm nay: ${name} (${reversed ? "ngược" : "xuôi"}).`,
    headline,
    `${level.label}. ${dayShape}`,
    omenLine,
    ...areas.map((area) => `${area.label}: ${area.line}`),
    `Lời khuyên: ${advice}`,
  ];
  let text = lines.join(" ");

  /* Sàn 50 chữ. Câu mở đầu lấy nghĩa lá từ Firestore nên có lá rất ngắn; khi
     rơi xuống dưới sàn thì thêm một dòng nhắc đọc kỹ hơn thay vì kéo dài câu
     đã có — kéo dài câu ngắn làm nó gãy nghĩa. */
  if (countWords(text) < 50) {
    lines.push(`Muốn hiểu kỹ hơn, đọc trang riêng của ${name}.`);
    text = lines.join(" ");
  }

  const trace = Object.freeze({
    dateKey: sky.dateKey,
    cardIndex,
    reversed,
    sunSignIndex: sky.sunSign.index,
    sunDecan: sky.sunDecan,
    moonSignIndex: sky.moonSign.index,
    moonPhaseIndex: sky.moonPhase.index,
    planetIndex: PLANETS.findIndex((planet) => planet.key === sky.planetaryHour.planetKey),
    modalityIndex: MODALITY_INDEX[sky.sunSign.modality],
    resonanceIndex: RESONANCE_INDEX[resonance],
    hiddenStageIndex: sky.hiddenStage.index,
    fortuneScore: score,
  });

  return Object.freeze({
    version: 3,
    dateKey: sky.dateKey,
    drawnAt: sky.drawnAt || null,
    timeZone: sky.timeZone || "Asia/Ho_Chi_Minh",
    card: Object.freeze({
      slug: card.slug,
      nameEn: card.nameEn,
      nameVi: card.nameVi,
      nameFolk: card.nameFolk || card.nameVi,
      image: card.image,
      keywords: reversed ? card.keywordsReversed : card.keywordsUpright,
    }),
    reversed,
    orientationLabel: reversed ? "Lá ngược" : "Lá xuôi",
    headline,
    fortune,
    omens,
    omenLine,
    areas,
    advice,
    text,
    lines: Object.freeze(lines),
    wordCount: countWords(text),
    /* Khối thời điểm viết bằng tiếng thường, thay cho bảng chữ chiêm tinh cũ. */
    sky: Object.freeze({
      sun: `Mặt Trời đang ở ${sky.sunSign.name} — ${SUN_SIGN_PLAIN[sky.sunSign.key]}.`,
      moon: `Mặt Trăng ở ${sky.moonSign.name} — ${MOON_ELEMENT_PLAIN[sky.moonSign.element]}.`,
      phase: `${capitalise(sky.moonPhase.name)} — ${MOON_PHASE_PLAIN[sky.moonPhase.key]}.`,
      hour: `Giờ ${sky.planetaryHour.planetName} — ${HOUR_PLAIN[sky.planetaryHour.planetKey]}.`,
    }),
    context: Object.freeze({
      sunSign: sky.sunSign.name,
      moonSign: sky.moonSign.name,
      moonPhase: sky.moonPhase.name,
      planetaryHour: sky.planetaryHour.planetName,
    }),
    traceId: encodeTraceId(trace),
    trace,
  });
}

export function createDailyReading({ cards, deviceId, moment, astronomy }) {
  return composeDailyReading({ cards, deviceId, sky: calculateSkyMoment(moment, astronomy) });
}
