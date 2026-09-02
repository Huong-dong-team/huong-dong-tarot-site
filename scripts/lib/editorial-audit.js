export const PILOT_CARD_SLUGS = Object.freeze([
  "the-fool",
  "justice",
  "death",
  "ace-of-wands",
  "seven-of-cups",
  "three-of-swords",
  "ten-of-pentacles",
  "queen-of-wands",
]);

export const GENERIC_REVERSED_KEYWORDS = Object.freeze([
  "mất cân bằng",
  "trì hoãn",
  "cần xem lại",
  "bài học",
  "điều chỉnh",
]);

export const BANNED_EDITORIAL_PHRASES = Object.freeze([
  "vũ trụ đang gửi",
  "hãy tin vào hành trình",
  "mọi thứ xảy ra đều có lý do",
  "năng lượng tích cực sẽ dẫn lối",
  "thông điệp của the fool đang mời",
  "thông điệp của justice đang mời",
  "thông điệp của death đang mời",
  "thông điệp của ace of wands đang mời",
  "thông điệp của seven of cups đang mời",
  "thông điệp của three of swords đang mời",
  "thông điệp của ten of pentacles đang mời",
  "thông điệp của queen of wands đang mời",
]);

const basicEntities = Object.freeze({
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
});

export function visibleTextFromHtml(html) {
  return String(html ?? "")
    .replace(/<(?:script|style|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript)>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&([a-z]+);/gi, (whole, name) => basicEntities[name.toLowerCase()] ?? whole)
    .replace(/&#(\d+);/g, (whole, value) => {
      const codePoint = Number(value);
      return Number.isSafeInteger(codePoint) ? String.fromCodePoint(codePoint) : whole;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeWords(value) {
  return visibleTextFromHtml(value)
    .normalize("NFC")
    .toLocaleLowerCase("vi")
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

export function exactShingleOverlaps(left, right, size = 14, limit = 5) {
  if (!Number.isInteger(size) || size < 2) throw new TypeError("Kích thước shingle phải là số nguyên từ 2 trở lên.");
  const leftWords = normalizeWords(left);
  const rightWords = normalizeWords(right);
  if (leftWords.length < size || rightWords.length < size) return [];

  const leftShingles = new Set();
  for (let index = 0; index <= leftWords.length - size; index += 1) {
    leftShingles.add(leftWords.slice(index, index + size).join(" "));
  }

  const overlaps = [];
  const seen = new Set();
  for (let index = 0; index <= rightWords.length - size; index += 1) {
    const shingle = rightWords.slice(index, index + size).join(" ");
    if (!leftShingles.has(shingle) || seen.has(shingle)) continue;
    seen.add(shingle);
    overlaps.push(shingle);
    if (overlaps.length >= limit) break;
  }
  return overlaps;
}

function textLength(value) {
  return visibleTextFromHtml(value).length;
}

export function auditPilotCards(cards) {
  const bySlug = new Map(cards.map((card) => [card.slug, card]));
  const issues = [];
  const genericSignature = [...GENERIC_REVERSED_KEYWORDS].sort().join("|");

  for (const slug of PILOT_CARD_SLUGS) {
    const card = bySlug.get(slug);
    if (!card) {
      issues.push(`${slug}: thiếu lá mẫu`);
      continue;
    }
    const reversedSignature = [...(card.keywordsReversed ?? [])].sort().join("|");
    if (!reversedSignature || reversedSignature === genericSignature) {
      issues.push(`${slug}: từ khóa ngược còn chung chung`);
    }
    if (textLength(card.meaningUpright) < 180) issues.push(`${slug}: nghĩa xuôi quá ngắn`);
    if (textLength(card.meaningReversed) < 180) issues.push(`${slug}: nghĩa ngược quá ngắn`);
    if (textLength(card.story) < 220) issues.push(`${slug}: câu chuyện chưa đủ một cảnh hoàn chỉnh`);
    if (textLength(card.question) < 45 || !String(card.question).includes("?")) {
      issues.push(`${slug}: câu hỏi soi chiếu chưa cụ thể`);
    }
    const combined = JSON.stringify(card).toLocaleLowerCase("vi");
    for (const phrase of BANNED_EDITORIAL_PHRASES) {
      if (combined.includes(phrase)) issues.push(`${slug}: chứa câu khuôn mẫu “${phrase}”`);
    }
    if (card.arcana !== "minor") continue;
    for (const field of ["love", "career", "finance", "health", "advice", "warning"]) {
      if (String(card[field] ?? "").length < 85) issues.push(`${slug}: trường ${field} chưa đủ cụ thể`);
    }
  }

  return issues;
}

