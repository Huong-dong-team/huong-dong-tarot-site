export type ZodiacElement = "Lửa" | "Đất" | "Khí" | "Nước";

export interface ZodiacSign {
  slug: string;
  name: string;
  englishName: string;
  symbol: string;
  dateRange: string;
  element: ZodiacElement;
  modality: "Tiên phong" | "Kiên định" | "Linh hoạt";
  rulingPlanet: string;
  tarotCard: string;
  overview: string;
}

export const zodiacSigns: readonly ZodiacSign[] = [
  { slug: "bach-duong", name: "Bạch Dương", englishName: "Aries", symbol: "♈", dateRange: "21/3–19/4", element: "Lửa", modality: "Tiên phong", rulingPlanet: "Hỏa Tinh", tarotCard: "The Emperor", overview: "Khởi xướng, trực diện và học cách dùng ý chí có trách nhiệm." },
  { slug: "kim-nguu", name: "Kim Ngưu", englishName: "Taurus", symbol: "♉", dateRange: "20/4–20/5", element: "Đất", modality: "Kiên định", rulingPlanet: "Kim Tinh", tarotCard: "The Hierophant", overview: "Ổn định, cảm nhận giá trị và nuôi dưỡng điều bền lâu." },
  { slug: "song-tu", name: "Song Tử", englishName: "Gemini", symbol: "♊", dateRange: "21/5–20/6", element: "Khí", modality: "Linh hoạt", rulingPlanet: "Thủy Tinh", tarotCard: "The Lovers", overview: "Trao đổi, kết nối ý tưởng và lựa chọn điều thật sự đồng điệu." },
  { slug: "cu-giai", name: "Cự Giải", englishName: "Cancer", symbol: "♋", dateRange: "21/6–22/7", element: "Nước", modality: "Tiên phong", rulingPlanet: "Mặt Trăng", tarotCard: "The Chariot", overview: "Bảo bọc, ký ức và tiến lên mà không đánh mất đời sống bên trong." },
  { slug: "su-tu", name: "Sư Tử", englishName: "Leo", symbol: "♌", dateRange: "23/7–22/8", element: "Lửa", modality: "Kiên định", rulingPlanet: "Mặt Trời", tarotCard: "Strength", overview: "Sáng tạo, tự tin và sức mạnh dịu dàng đến từ nội tâm." },
  { slug: "xu-nu", name: "Xử Nữ", englishName: "Virgo", symbol: "♍", dateRange: "23/8–22/9", element: "Đất", modality: "Linh hoạt", rulingPlanet: "Thủy Tinh", tarotCard: "The Hermit", overview: "Phân tích, chăm sóc chi tiết và tìm tri thức qua quan sát sâu." },
  { slug: "thien-binh", name: "Thiên Bình", englishName: "Libra", symbol: "♎", dateRange: "23/9–22/10", element: "Khí", modality: "Tiên phong", rulingPlanet: "Kim Tinh", tarotCard: "Justice", overview: "Cân bằng, quan hệ và chịu trách nhiệm cho mỗi lựa chọn." },
  { slug: "bo-cap", name: "Bọ Cạp", englishName: "Scorpio", symbol: "♏", dateRange: "23/10–21/11", element: "Nước", modality: "Kiên định", rulingPlanet: "Hỏa Tinh / Diêm Vương Tinh", tarotCard: "Death", overview: "Chiều sâu, chuyển hóa và can đảm rời bỏ điều đã hoàn tất." },
  { slug: "nhan-ma", name: "Nhân Mã", englishName: "Sagittarius", symbol: "♐", dateRange: "22/11–21/12", element: "Lửa", modality: "Linh hoạt", rulingPlanet: "Mộc Tinh", tarotCard: "Temperance", overview: "Khám phá, mở rộng tầm nhìn và dung hòa trải nghiệm thành hiểu biết." },
  { slug: "ma-ket", name: "Ma Kết", englishName: "Capricorn", symbol: "♑", dateRange: "22/12–19/1", element: "Đất", modality: "Tiên phong", rulingPlanet: "Thổ Tinh", tarotCard: "The Devil", overview: "Kỷ luật, tham vọng và nhận diện những ràng buộc mình có thể tháo gỡ." },
  { slug: "bao-binh", name: "Bảo Bình", englishName: "Aquarius", symbol: "♒", dateRange: "20/1–18/2", element: "Khí", modality: "Kiên định", rulingPlanet: "Thổ Tinh / Thiên Vương Tinh", tarotCard: "The Star", overview: "Tầm nhìn cộng đồng, đổi mới và hy vọng sau thời kỳ biến động." },
  { slug: "song-ngu", name: "Song Ngư", englishName: "Pisces", symbol: "♓", dateRange: "19/2–20/3", element: "Nước", modality: "Linh hoạt", rulingPlanet: "Mộc Tinh / Hải Vương Tinh", tarotCard: "The Moon", overview: "Trực giác, lòng trắc ẩn và học cách đi qua vùng chưa rõ ràng." },
] as const;

export const astrologyFoundations = [
  { title: "12 cung", description: "Cung Hoàng đạo mô tả cách một năng lượng biểu hiện. Đây không phải nhãn dán cố định cho tính cách." },
  { title: "10 hành tinh", description: "Trong chiêm tinh, Mặt Trời và Mặt Trăng cũng được gọi chung là “hành tinh”: mỗi điểm biểu trưng một chức năng tâm lý." },
  { title: "12 nhà", description: "Các nhà là những lĩnh vực đời sống, từ bản thân, tài chính và giao tiếp đến quan hệ, nghề nghiệp và nội tâm." },
  { title: "4 nguyên tố", description: "Lửa thiên về hành động; Đất về hiện thực; Khí về tư duy; Nước về cảm xúc. Tarot dùng cùng bộ khung để đọc bốn chất Ẩn Phụ." },
] as const;

export const tarotElementLinks = [
  { element: "Lửa", suit: "Wands", vietnameseSuit: "Gậy", prompt: "Điều gì đang muốn được khởi động?" },
  { element: "Đất", suit: "Pentacles", vietnameseSuit: "Tiền", prompt: "Điều gì cần được làm thành kết quả cụ thể?" },
  { element: "Khí", suit: "Swords", vietnameseSuit: "Kiếm", prompt: "Suy nghĩ hoặc quyết định nào cần sáng rõ?" },
  { element: "Nước", suit: "Cups", vietnameseSuit: "Cốc", prompt: "Cảm xúc và mối quan hệ đang muốn nói gì?" },
] as const;

export const traditionNote = {
  name: "Hệ quy chiếu Golden Dawn",
  description:
    "Các liên hệ cung–Ẩn Chính ở trang này theo một truyền thống huyền học phương Tây có ảnh hưởng đến Tarot hiện đại. Đây là một hệ quy chiếu để học và so sánh, không phải sự thật khoa học hay cách ghép duy nhất.",
} as const;
