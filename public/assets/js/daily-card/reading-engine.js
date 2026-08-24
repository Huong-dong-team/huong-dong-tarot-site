import { CARD_INTRO_TEMPLATES, COLLISION_COPY, copyVariant } from "./copy.js";
import {
  PLANETS,
  correspondenceForCard,
  decanResonance,
  elementRelation,
} from "./correspondences.js";
import { calculateSkyMoment } from "./time.js";

const AXES = Object.freeze(["B", "C", "D", "E", "F", "G", "H"]);
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

function trimSentence(value, maxWords) {
  const words = String(value).trim().split(/\s+/u).filter(Boolean);
  if (words.length <= maxWords) return /[.!?…]$/u.test(value.trim()) ? value.trim() : `${value.trim()}.`;
  const window = words.slice(0, maxWords);
  let cut = window.length;
  for (let index = window.length - 1; index >= Math.ceil(maxWords * 0.35); index -= 1) {
    if (/[,;:]$/u.test(window[index - 1])) { cut = index; break; }
  }
  return `${window.slice(0, cut).join(" ").replace(/[,;:.!?…]+$/u, "")}.`;
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

function salienceFor(axis, values, correspondence, seed) {
  const relationScore = Object.freeze({ same: 0.38, supporting: 0.36, tension: 0.52, "cross-current": 0.34 });
  const moonRelationScore = Object.freeze({ same: 0.4, supporting: 0.36, tension: 0.52, "cross-current": 0.34 });
  const phaseScore = values.moonPhaseSalience >= 0.9 ? 0.62 : values.moonPhaseSalience >= 0.8 ? 0.48 : 0.33;
  const bases = {
    B: relationScore[values.B],
    C: 0.36,
    D: correspondence.planetKey === values.D ? 0.78 : 0.35,
    E: phaseScore,
    F: moonRelationScore[values.moonRelation],
    G: values.G === "exact" ? 0.98 : values.G === "same-sign" ? 0.74 : 0.28,
    H: 0.37,
  };
  const jitter = hashedFraction(seed, `salience:${axis}`) * 0.34;
  return Math.min(1, bases[axis] + jitter);
}

function selectAxes(values, correspondence, seed) {
  return AXES.map((axis) => ({
    axis,
    value: values[axis],
    salience: salienceFor(axis, values, correspondence, seed),
    tie: hashString(`${seed}|tie:${axis}`),
  }))
    .sort((left, right) => right.salience - left.salience || left.tie - right.tie)
    .slice(0, 3)
    .map(({ axis, value, salience }) => Object.freeze({ axis, value, salience }));
}

function encodeNumber(value) {
  return Number(value).toString(36).padStart(2, "0");
}

function selectedMask(selectedAxes) {
  return selectedAxes.reduce((mask, item) => mask | (1 << AXES.indexOf(item.axis)), 0);
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
    trace.selectedMask,
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
    selectedMask: values[10],
  });
}

function cardMeaning(card, reversed) {
  const source = reversed ? card.meaningReversed : card.meaningUpright;
  const fallback = reversed ? card.keywordsReversed : card.keywordsUpright;
  const sentence = firstSentence(source) || (Array.isArray(fallback) ? fallback.slice(0, 3).join(", ") : "");
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
  const westernSentence = replacements.reduce((text, [pattern, value]) => text.replace(pattern, value), sentence);
  return trimSentence(westernSentence, 14);
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
  const moonRelation = elementRelation(correspondence.element, sky.moonSign.element);
  const resonance = decanResonance(card, sky.sunSign.index, sky.sunDecan);
  const values = Object.freeze({
    B: relation,
    C: sky.sunSign.modality,
    D: sky.planetaryHour.planetKey,
    E: sky.moonPhase.key,
    F: sky.moonSign.element,
    G: resonance,
    H: sky.hiddenStage.key,
    moonRelation,
    moonPhaseSalience: sky.moonPhase.salience,
  });
  const selectedAxes = selectAxes(values, correspondence, seed);
  const cardDirection = reversed ? "retreat" : "advance";
  const combinedDirection = skyDirection(relation, sky.moonPhase.direction);
  const frame = alignment(cardDirection, combinedDirection);
  const orientation = reversed ? "ở chiều ngược" : "theo chiều xuôi";
  const introTemplate = CARD_INTRO_TEMPLATES[hashedIndex(seed, "intro", CARD_INTRO_TEMPLATES.length)];
  const intro = introTemplate({ name: card.nameFolk || card.nameVi || card.nameEn, orientation, meaning: cardMeaning(card, reversed) });
  const collision = COLLISION_COPY[`${frame}:${relation}`];
  const axisSentences = selectedAxes.map(({ axis, value }) => copyVariant(axis, value, hashedIndex(seed, `copy:${axis}`, 3)));
  const sentences = [
    trimSentence(intro, 24),
    trimSentence(collision, 20),
    ...axisSentences.map((sentence) => trimSentence(sentence, 17)),
  ];
  let text = sentences.join(" ");
  if (countWords(text) < 45) {
    sentences[4] = `${sentences[4].replace(/[.!?…]+$/u, "")}; hãy để tín hiệu ấy dẫn bạn về một việc vừa sức và có thể gọi tên.`;
    text = sentences.join(" ");
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
    selectedMask: selectedMask(selectedAxes),
  });
  const traceId = encodeTraceId(trace);

  return Object.freeze({
    version: 2,
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
    text,
    sentences: Object.freeze(sentences),
    wordCount: countWords(text),
    selectedAxes: Object.freeze(selectedAxes),
    context: Object.freeze({
      sunSign: sky.sunSign.name,
      moonSign: sky.moonSign.name,
      moonPhase: sky.moonPhase.name,
      planetaryHour: sky.planetaryHour.planetName,
    }),
    traceId,
    trace,
  });
}

export function createDailyReading({ cards, deviceId, moment, astronomy }) {
  return composeDailyReading({ cards, deviceId, sky: calculateSkyMoment(moment, astronomy) });
}
