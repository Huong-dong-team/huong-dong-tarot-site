export const ELEMENTS = Object.freeze({
  fire: Object.freeze({ key: "fire", name: "Lửa" }),
  earth: Object.freeze({ key: "earth", name: "Đất" }),
  air: Object.freeze({ key: "air", name: "Khí" }),
  water: Object.freeze({ key: "water", name: "Nước" }),
});

export const SIGNS = Object.freeze([
  Object.freeze({ index: 0, key: "aries", name: "Bạch Dương", element: "fire", modality: "starting" }),
  Object.freeze({ index: 1, key: "taurus", name: "Kim Ngưu", element: "earth", modality: "steady" }),
  Object.freeze({ index: 2, key: "gemini", name: "Song Tử", element: "air", modality: "changing" }),
  Object.freeze({ index: 3, key: "cancer", name: "Cự Giải", element: "water", modality: "starting" }),
  Object.freeze({ index: 4, key: "leo", name: "Sư Tử", element: "fire", modality: "steady" }),
  Object.freeze({ index: 5, key: "virgo", name: "Xử Nữ", element: "earth", modality: "changing" }),
  Object.freeze({ index: 6, key: "libra", name: "Thiên Bình", element: "air", modality: "starting" }),
  Object.freeze({ index: 7, key: "scorpio", name: "Bọ Cạp", element: "water", modality: "steady" }),
  Object.freeze({ index: 8, key: "sagittarius", name: "Nhân Mã", element: "fire", modality: "changing" }),
  Object.freeze({ index: 9, key: "capricorn", name: "Ma Kết", element: "earth", modality: "starting" }),
  Object.freeze({ index: 10, key: "aquarius", name: "Bảo Bình", element: "air", modality: "steady" }),
  Object.freeze({ index: 11, key: "pisces", name: "Song Ngư", element: "water", modality: "changing" }),
]);

export const PLANETS = Object.freeze([
  Object.freeze({ key: "sun", name: "Mặt Trời", element: "fire" }),
  Object.freeze({ key: "moon", name: "Mặt Trăng", element: "water" }),
  Object.freeze({ key: "mars", name: "Sao Hỏa", element: "fire" }),
  Object.freeze({ key: "mercury", name: "Sao Thủy", element: "air" }),
  Object.freeze({ key: "jupiter", name: "Sao Mộc", element: "fire" }),
  Object.freeze({ key: "venus", name: "Sao Kim", element: "earth" }),
  Object.freeze({ key: "saturn", name: "Sao Thổ", element: "earth" }),
]);

export const PLANET_BY_KEY = Object.freeze(Object.fromEntries(PLANETS.map((planet) => [planet.key, planet])));
export const SIGN_BY_KEY = Object.freeze(Object.fromEntries(SIGNS.map((sign) => [sign.key, sign])));

// Thứ tự này đi từ chậm tới nhanh theo hệ Chaldean. Ngày trong tuần chỉ
// quyết định điểm bắt đầu; mỗi giờ tiếp theo tiến một bước trong vòng này.
export const CHALDEAN_ORDER = Object.freeze(["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"]);
export const DAY_RULERS = Object.freeze(["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"]);

const major = (kind, key, element, extra = {}) => Object.freeze({ kind, key, element, ...extra });
export const MAJOR_CORRESPONDENCES = Object.freeze({
  "the-fool": major("element", "air", "air"),
  "the-magician": major("planet", "mercury", "air", { planetKey: "mercury" }),
  "the-high-priestess": major("planet", "moon", "water", { planetKey: "moon" }),
  "the-empress": major("planet", "venus", "earth", { planetKey: "venus" }),
  "the-emperor": major("sign", "aries", "fire", { signKey: "aries" }),
  "the-hierophant": major("sign", "taurus", "earth", { signKey: "taurus" }),
  "the-lovers": major("sign", "gemini", "air", { signKey: "gemini" }),
  "the-chariot": major("sign", "cancer", "water", { signKey: "cancer" }),
  strength: major("sign", "leo", "fire", { signKey: "leo" }),
  "the-hermit": major("sign", "virgo", "earth", { signKey: "virgo" }),
  "wheel-of-fortune": major("planet", "jupiter", "fire", { planetKey: "jupiter" }),
  justice: major("sign", "libra", "air", { signKey: "libra" }),
  "the-hanged-man": major("element", "water", "water"),
  death: major("sign", "scorpio", "water", { signKey: "scorpio" }),
  temperance: major("sign", "sagittarius", "fire", { signKey: "sagittarius" }),
  "the-devil": major("sign", "capricorn", "earth", { signKey: "capricorn" }),
  "the-tower": major("planet", "mars", "fire", { planetKey: "mars" }),
  "the-star": major("sign", "aquarius", "air", { signKey: "aquarius" }),
  "the-moon": major("sign", "pisces", "water", { signKey: "pisces" }),
  "the-sun": major("planet", "sun", "fire", { planetKey: "sun" }),
  judgement: major("element", "fire", "fire"),
  "the-world": major("planet", "saturn", "earth", { planetKey: "saturn" }),
});

const decan = (signKey, decanIndex, slug, planetKey) => Object.freeze({ signKey, decanIndex, slug, planetKey });
export const DECAN_CARDS = Object.freeze([
  decan("aries", 0, "two-of-wands", "mars"),
  decan("aries", 1, "three-of-wands", "sun"),
  decan("aries", 2, "four-of-wands", "venus"),
  decan("taurus", 0, "five-of-pentacles", "mercury"),
  decan("taurus", 1, "six-of-pentacles", "moon"),
  decan("taurus", 2, "seven-of-pentacles", "saturn"),
  decan("gemini", 0, "eight-of-swords", "jupiter"),
  decan("gemini", 1, "nine-of-swords", "mars"),
  decan("gemini", 2, "ten-of-swords", "sun"),
  decan("cancer", 0, "two-of-cups", "venus"),
  decan("cancer", 1, "three-of-cups", "mercury"),
  decan("cancer", 2, "four-of-cups", "moon"),
  decan("leo", 0, "five-of-wands", "saturn"),
  decan("leo", 1, "six-of-wands", "jupiter"),
  decan("leo", 2, "seven-of-wands", "mars"),
  decan("virgo", 0, "eight-of-pentacles", "sun"),
  decan("virgo", 1, "nine-of-pentacles", "venus"),
  decan("virgo", 2, "ten-of-pentacles", "mercury"),
  decan("libra", 0, "two-of-swords", "moon"),
  decan("libra", 1, "three-of-swords", "saturn"),
  decan("libra", 2, "four-of-swords", "jupiter"),
  decan("scorpio", 0, "five-of-cups", "mars"),
  decan("scorpio", 1, "six-of-cups", "sun"),
  decan("scorpio", 2, "seven-of-cups", "venus"),
  decan("sagittarius", 0, "eight-of-wands", "mercury"),
  decan("sagittarius", 1, "nine-of-wands", "moon"),
  decan("sagittarius", 2, "ten-of-wands", "saturn"),
  decan("capricorn", 0, "two-of-pentacles", "jupiter"),
  decan("capricorn", 1, "three-of-pentacles", "mars"),
  decan("capricorn", 2, "four-of-pentacles", "sun"),
  decan("aquarius", 0, "five-of-swords", "venus"),
  decan("aquarius", 1, "six-of-swords", "mercury"),
  decan("aquarius", 2, "seven-of-swords", "moon"),
  decan("pisces", 0, "eight-of-cups", "saturn"),
  decan("pisces", 1, "nine-of-cups", "jupiter"),
  decan("pisces", 2, "ten-of-cups", "mars"),
]);

const DECAN_BY_SLUG = Object.freeze(Object.fromEntries(DECAN_CARDS.map((entry) => [entry.slug, entry])));
const DECAN_BY_POSITION = Object.freeze(Object.fromEntries(DECAN_CARDS.map((entry) => [`${entry.signKey}:${entry.decanIndex}`, entry])));
const SUIT_ELEMENTS = Object.freeze({ wands: "fire", pentacles: "earth", swords: "air", cups: "water" });
const COURT_ELEMENTS = Object.freeze({ page: "earth", knight: "air", queen: "water", king: "fire" });

export function correspondenceForCard(card) {
  if (!card || typeof card.slug !== "string") throw new TypeError("Lá bài phải có slug.");
  if (card.arcana === "major") {
    const value = MAJOR_CORRESPONDENCES[card.slug];
    if (!value) throw new RangeError(`Chưa có tương ứng cho ${card.slug}.`);
    return value;
  }

  const suitElement = SUIT_ELEMENTS[card.suit];
  if (!suitElement) throw new RangeError(`Nhà bài không hợp lệ ở ${card.slug}.`);
  const rank = card.slug.split("-")[0];
  if (rank === "ace") return Object.freeze({ kind: "element", key: suitElement, element: suitElement, suitElement });
  if (COURT_ELEMENTS[rank]) {
    return Object.freeze({
      kind: "court",
      key: `${COURT_ELEMENTS[rank]}-of-${suitElement}`,
      element: suitElement,
      suitElement,
      courtElement: COURT_ELEMENTS[rank],
    });
  }

  const value = DECAN_BY_SLUG[card.slug];
  if (!value) throw new RangeError(`Chưa có decan cho ${card.slug}.`);
  return Object.freeze({
    kind: "decan",
    key: `${value.signKey}-${value.decanIndex + 1}`,
    element: SIGN_BY_KEY[value.signKey].element,
    signKey: value.signKey,
    decanIndex: value.decanIndex,
    planetKey: value.planetKey,
  });
}

export function cardForDecan(signIndex, decanIndex) {
  const sign = SIGNS[signIndex];
  if (!sign || !Number.isInteger(decanIndex) || decanIndex < 0 || decanIndex > 2) return null;
  return DECAN_BY_POSITION[`${sign.key}:${decanIndex}`] || null;
}

export function decanResonance(card, signIndex, decanIndex) {
  const exact = cardForDecan(signIndex, decanIndex);
  if (exact?.slug === card.slug) return "exact";
  const sign = SIGNS[signIndex];
  const correspondence = correspondenceForCard(card);
  return correspondence.signKey === sign?.key ? "same-sign" : "none";
}

export function elementRelation(cardElement, skyElement) {
  if (!ELEMENTS[cardElement] || !ELEMENTS[skyElement]) throw new RangeError("Nguyên tố không hợp lệ.");
  if (cardElement === skyElement) return "same";
  const pair = new Set([cardElement, skyElement]);
  if ((pair.has("fire") && pair.has("air")) || (pair.has("earth") && pair.has("water"))) return "supporting";
  if ((pair.has("fire") && pair.has("water")) || (pair.has("air") && pair.has("earth"))) return "tension";
  return "cross-current";
}

export function correspondenceCoverage(cards) {
  const mapped = cards.map((card) => ({ slug: card.slug, correspondence: correspondenceForCard(card) }));
  return Object.freeze({ total: mapped.length, mapped: Object.freeze(mapped) });
}
