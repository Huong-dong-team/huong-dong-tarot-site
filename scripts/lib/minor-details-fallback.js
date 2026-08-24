/* Bù trường chi tiết Ẩn Phụ còn thiếu trên Firestore bằng seed/cards.json.
 *
 * Vì sao cần: bộ trường chi tiết v2.1 của 56 lá Ẩn Phụ (chủ thể, cảnh, bốn lĩnh
 * vực, lời khuyên, cảnh báo) mới chỉ có trong seed, chưa từng được nhập vào
 * Firestore. Bản dựng production đọc Firestore nên trang lá chỉ ra được khối
 * "Nguồn tư liệu", thiếu ba khối còn lại và kiểm thử chặn xuất bản.
 *
 * Quy tắc cố ý hẹp:
 * - Firestore vẫn là nguồn ưu tiên. Giá trị đang có trên Firestore không bao giờ
 *   bị đè, kể cả khi khác seed — đó có thể là bản biên tập trong /admin/.
 * - Chỉ bù trường nằm trong MINOR_DETAIL_FIELDS, không merge cả object seed.
 * - Chỉ chạm lá Ẩn Phụ và chỉ khi seed có lá cùng slug.
 * - Không ghi gì ngược lại Firestore. Phần bù chỉ tồn tại trong bản dựng.
 */

export const MINOR_DETAIL_FIELDS = [
  "subject",
  "sceneTitle",
  "scene",
  "shortStory",
  "love",
  "career",
  "finance",
  "health",
  "advice",
  "warning",
  "adaptationLevel",
  "sources",
  "sourceIds",
];

/* Thiếu hẳn, null, chuỗi rỗng hoặc mảng rỗng đều tính là chưa có nội dung. */
function isBlank(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function fillMinorDetails(liveCards, seedCards) {
  const seedBySlug = new Map(seedCards.map((card) => [card.slug, card]));
  return liveCards.map((card) => {
    if (card.arcana !== "minor") return card;
    const seed = seedBySlug.get(card.slug);
    if (!seed) return card;
    const patch = {};
    for (const field of MINOR_DETAIL_FIELDS) {
      if (!isBlank(card[field]) || isBlank(seed[field])) continue;
      patch[field] = seed[field];
    }
    return Object.keys(patch).length ? { ...card, ...patch } : card;
  });
}
