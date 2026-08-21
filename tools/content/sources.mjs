/* Đăng ký nguồn S01–S22 — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY.
 * isLNCQ phân biệt chương Lĩnh Nam chích quái với nguồn ngoài (UNESCO, bảo tàng,
 * báo chí) — cần thiết để trả lời đúng câu "bao nhiêu lá có nguồn LNCQ".
 */
export const SOURCES = Object.freeze([
  {
    "id": "S01",
    "title": "Mục lục Lĩnh Nam chích quái",
    "isLNCQ": true
  },
  {
    "id": "S02",
    "title": "Truyện họ Hồng Bàng",
    "isLNCQ": true
  },
  {
    "id": "S03",
    "title": "Truyện Cá tinh, Chồn tinh và Cây tinh",
    "isLNCQ": true
  },
  {
    "id": "S04",
    "title": "Truyện Trầu Cau",
    "isLNCQ": true
  },
  {
    "id": "S05",
    "title": "Truyện Đầm Một Đêm - Tiên Dung và Chử Đồng Tử",
    "isLNCQ": true
  },
  {
    "id": "S06",
    "title": "Truyện Phù Đổng Thiên Vương",
    "isLNCQ": true
  },
  {
    "id": "S07",
    "title": "Truyện Bánh chưng",
    "isLNCQ": true
  },
  {
    "id": "S08",
    "title": "Truyện Dưa hấu",
    "isLNCQ": true
  },
  {
    "id": "S09",
    "title": "Truyện Chim trĩ trắng",
    "isLNCQ": true
  },
  {
    "id": "S10",
    "title": "Truyện Lý Ông Trọng",
    "isLNCQ": true
  },
  {
    "id": "S11",
    "title": "Truyện Giếng Việt",
    "isLNCQ": true
  },
  {
    "id": "S12",
    "title": "Truyện Rùa Vàng",
    "isLNCQ": true
  },
  {
    "id": "S13",
    "title": "Truyện Man Nương",
    "isLNCQ": true
  },
  {
    "id": "S14",
    "title": "Truyện Núi Tản Viên",
    "isLNCQ": true
  },
  {
    "id": "S15",
    "title": "Truyện hai vị thần ở Long Nhãn, Như Nguyệt",
    "isLNCQ": true
  },
  {
    "id": "S16",
    "title": "Truyện Từ Đạo Hạnh và Nguyễn Minh Không",
    "isLNCQ": true
  },
  {
    "id": "S17",
    "title": "Truyện Dương Không Lộ và Nguyễn Giác Hải",
    "isLNCQ": true
  },
  {
    "id": "S18",
    "title": "Truyện Sông Tô Lịch",
    "isLNCQ": true
  },
  {
    "id": "S19",
    "title": "Truyện hai bà Trinh Linh họ Trưng",
    "isLNCQ": true
  },
  {
    "id": "S20",
    "title": "UNESCO - Tín ngưỡng thờ Mẫu Tam phủ của người Việt",
    "isLNCQ": false
  },
  {
    "id": "S21",
    "title": "Bảo tàng Lịch sử Quốc gia - Ẩm thực người Việt thời Hùng Vương",
    "isLNCQ": false
  },
  {
    "id": "S22",
    "title": "VietnamPlus - Liễu Hạnh, Thánh Mẫu tối linh trong văn hóa Việt",
    "isLNCQ": false
  }
]);

const BY_ID = Object.freeze(Object.fromEntries(SOURCES.map((s) => [s.id, s])));

/** Lá này có ít nhất một nguồn thuộc Lĩnh Nam chích quái không? */
export function hasLNCQSource(card) {
  return card.sourceIds.some((id) => BY_ID[id]?.isLNCQ);
}

/** Danh sách nguồn đầy đủ của một lá, để render khối dẫn nguồn. */
export function sourcesOf(card) {
  return card.sourceIds.map((id) => BY_ID[id] ?? { id, title: "(không có trong đăng ký)", isLNCQ: false });
}
