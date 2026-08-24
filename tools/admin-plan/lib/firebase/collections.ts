/* Tên collection viết ĐÚNG MỘT CHỖ.
 *
 * Lý do có file này: chính dự án đã trả giá cho việc một sự thật nằm ở nhiều nơi
 * rồi lệch nhau — tên lá từng nằm ở bốn chỗ và lệch cả bốn. Đừng gõ chuỗi
 * "subscribers" rải rác trong component.
 *
 * Lưu ý quan trọng: danh sách chờ tên là `subscribers`, KHÔNG phải `waitlist`.
 * Form trên site công khai đang ghi thẳng vào đó qua Firestore REST API.
 */
export const COL = {
  cards: "cards",
  posts: "posts",
  subscribers: "subscribers",
  orders: "orders",
  media: "media",
  settings: "settings",
  admins: "admins",
} as const;
