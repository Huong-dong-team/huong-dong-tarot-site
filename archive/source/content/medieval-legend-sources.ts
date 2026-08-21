export interface MedievalLegendSource {
  readonly title: string;
  readonly period: string;
  readonly form: string;
  readonly contribution: string;
  readonly caution: string;
  readonly sourceUrl: string;
}

export const medievalLegendSources = [
  {
    title: "Đại Việt sử ký — Lê Văn Hưu",
    period: "Hoàn thành năm 1272; bản gốc đã mất",
    form: "Sử biên niên thời Trần",
    contribution: "Các lời bình được sử gia đời sau bảo tồn, nổi bật là lời bàn đề cao năng lực dựng nước của Trưng Trắc và Trưng Nhị.",
    caution: "Không trình bày toàn bộ đoạn văn trong Toàn thư như bản nguyên vẹn của tác phẩm năm 1272; cần nói rõ đây là phần được dẫn lại.",
    sourceUrl: "https://www.nomfoundation.org/nom-project/history-of-greater-vietnam/Fulltext/6-Ky-thuoc-Dong-Han?uiLang=vn",
  },
  {
    title: "Đại Việt sử lược",
    period: "Khuyết danh, cuối thời Trần; biên soạn sau 1377",
    form: "Sử lược",
    contribution: "Là một trong những sử phẩm Việt còn sớm, ghi các lớp kể về Hùng Vương, An Dương Vương và giai đoạn Hai Bà Trưng.",
    caution: "Văn bản lưu truyền qua bản sao và truyền bản ở ngoài Việt Nam; niên đại từng mục kể không đồng nghĩa niên đại sự kiện đã được khảo cổ xác nhận.",
    sourceUrl: "https://ctext.org/wiki.pl?chapter=838654&if=gb",
  },
  {
    title: "Việt điện u linh tập — Lý Tế Xuyên",
    period: "Năm 1329, thời Trần",
    form: "Thần tích và truyện linh ứng",
    contribution: "Ghi tiểu truyện các thần được thờ trong không gian Đại Việt, giúp nghiên cứu ký ức cộng đồng và cách nhân vật lịch sử được thần hóa.",
    caution: "Đây không phải biên niên sử thuần túy; chi tiết hiển linh cần giữ nhãn tín ngưỡng và truyền thuyết.",
    sourceUrl: "https://lib.nomfoundation.org/collection/1/",
  },
  {
    title: "Lĩnh Nam chích quái",
    period: "Lớp truyện thời Trần; bản hiện còn qua các lần hiệu đính đời Lê",
    form: "Tập truyện truyền kỳ",
    contribution: "Bảo lưu truyện Hồng Bàng, Trầu Cau, Kim Quy, Mị Châu–Trọng Thủy, Chử Đồng Tử và nhiều mô-típ nền tảng của Hường Đông.",
    caution: "Văn bản có lịch sử truyền bản phức tạp; không nên gắn mọi câu trong bản hiện còn trực tiếp cho Trần Thế Pháp mà bỏ qua các lần nhuận sắc sau này.",
    sourceUrl: "https://lib.nomfoundation.org/collection/1/volume/820/",
  },
] as const satisfies readonly MedievalLegendSource[];
