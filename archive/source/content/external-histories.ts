export type ExternalSourceKind =
  | "mythography"
  | "dynastic-history"
  | "administrative-geography"
  | "historical-geography"
  | "river-commentary";

export interface ExternalHistorySource {
  readonly slug: string;
  readonly title: string;
  readonly hanTitle: string;
  readonly author: string;
  readonly period: string;
  readonly kind: ExternalSourceKind;
  readonly kindLabel: string;
  readonly terms: readonly string[];
  readonly quote: string;
  readonly translation: string;
  readonly reading: string;
  readonly caveat: string;
  readonly sourceUrl: string;
}

export const externalHistorySources = [
  {
    slug: "son-hai-kinh",
    title: "Sơn Hải Kinh",
    hanTitle: "山海經 · 海外南經",
    author: "Khuyết danh; văn bản hình thành qua nhiều lớp",
    period: "Tiền Tần – Hán",
    kind: "mythography",
    kindLabel: "Địa lý thần thoại",
    terms: ["Giao Hĩnh 交脛", "phương Nam"],
    quote: "「交脛國在其東，其為人交脛。」",
    translation: "“Nước Giao Hĩnh ở phía đông; người nước ấy có cẳng chân giao nhau.”",
    reading: "Đoạn văn cho thấy cách trí tưởng tượng địa lý cổ đại mô tả một xứ phương Nam xa lạ bằng đặc điểm thân thể kỳ dị.",
    caveat: "Giao Hĩnh không thể tự động đồng nhất với quận Giao Chỉ hay lãnh thổ Việt Nam hiện đại. Đây là một liên hệ giả thuyết, không phải định danh đã được chứng minh.",
    sourceUrl: "https://ctext.org/shan-hai-jing/hai-wai-nan-jing/zh",
  },
  {
    slug: "su-ky-nam-viet",
    title: "Sử Ký · Nam Việt liệt truyện",
    hanTitle: "史記 · 南越列傳",
    author: "Tư Mã Thiên",
    period: "Khoảng thế kỷ I TCN",
    kind: "dynastic-history",
    kindLabel: "Sử truyện triều đại",
    terms: ["Nam Việt 南越", "Tây Âu 西甌", "Lạc 駱"],
    quote: "「佗因此以兵威邊，財物賂遺閩越、西甌、駱，役屬焉。」",
    translation: "“Triệu Đà dùng binh uy ở biên giới, đem của cải ban cho Mân Việt, Tây Âu và Lạc, khiến họ lệ thuộc.”",
    reading: "Thiên này ghi sự hình thành và quan hệ quyền lực của nước Nam Việt trong bối cảnh Tần–Hán, trong đó có các nhóm Tây Âu và Lạc.",
    caveat: "Nam Việt là một chính thể cổ có phạm vi rộng hơn miền Bắc Việt Nam ngày nay; không nên dùng hai chữ Nam Việt như tên đồng nghĩa với quốc gia Việt Nam hiện đại.",
    sourceUrl: "https://ctext.org/shiji/nan-yue-lie-zhuan/zh",
  },
  {
    slug: "han-thu-giao-chi",
    title: "Hán Thư · Địa lý chí",
    hanTitle: "漢書 · 地理志下",
    author: "Ban Cố và Ban Chiêu",
    period: "Thế kỷ I–II",
    kind: "administrative-geography",
    kindLabel: "Địa lý hành chính",
    terms: ["Giao Chỉ 交趾", "Cửu Chân 九真", "Nhật Nam 日南"],
    quote: "「交趾郡，戶九萬二千四百四十，口七十四萬六千二百三十七。」",
    translation: "“Quận Giao Chỉ có 92.440 hộ, 746.237 người.”",
    reading: "Địa lý chí liệt kê quận, huyện và số hộ–khẩu theo hệ thống hành chính nhà Hán; phần Nhật Nam còn mô tả một tuyến hàng hải nối sang các nước ở Ấn Độ Dương.",
    caveat: "Đây là con số hành chính do đế chế ghi chép, không tương đương điều tra dân số hiện đại. Bản người dùng cung cấp ghi 62.461 hộ và 242.814 khẩu là sai so với văn bản đang đối chiếu.",
    sourceUrl: "https://ctext.org/han-shu/di-li-zhi-xia/zh",
  },
  {
    slug: "hau-han-thu-hai-ba-trung",
    title: "Hậu Hán Thư · Mã Viện liệt truyện",
    hanTitle: "後漢書 · 馬援列傳",
    author: "Phạm Diệp",
    period: "Thế kỷ V, chép sự kiện thế kỷ I",
    kind: "dynastic-history",
    kindLabel: "Sử truyện triều đại",
    terms: ["Giao Chỉ 交阯", "Trưng Trắc 徵側", "Trưng Nhị 徵貳"],
    quote: "「又交阯女子徵側及女弟徵貳反，攻沒其郡，九真、日南、合浦蠻夷皆應之，寇略嶺外六十餘城，側自立為王。」",
    translation: "“Lại có người nữ Giao Chỉ là Trưng Trắc cùng em gái Trưng Nhị nổi dậy, đánh chiếm quận; Cửu Chân, Nhật Nam, Hợp Phố đều hưởng ứng; chiếm giữ hơn sáu mươi thành ngoài Lĩnh Nam, Trưng Trắc tự lập làm vương.”",
    reading: "Đây là một trong những ghi chép chính của sử Trung Hoa về cuộc nổi dậy do Trưng Trắc và Trưng Nhị lãnh đạo, phạm vi hưởng ứng và việc Trưng Trắc tự lập ở vị trí tối cao.",
    caveat: "Chữ “phản” phản ánh điểm nhìn của triều Hán đối với lực lượng chống quyền cai trị của họ. Con số hơn sáu mươi thành và cách gọi các cộng đồng cần được đọc như dữ liệu của sử quan đế chế, không phải thống kê hiện đại trung lập.",
    sourceUrl: "https://ctext.org/hou-han-shu/ma-yuan-lie-zhuan/zh",
  },
  {
    slug: "thong-dien-an-nam",
    title: "Thông Điển · Châu quận",
    hanTitle: "通典 · 卷一百八十四 · 州郡十四",
    author: "Đỗ Hựu",
    period: "Thế kỷ VIII, thời Đường",
    kind: "historical-geography",
    kindLabel: "Điển chế và địa lý lịch sử",
    terms: ["Giao Châu 交州", "An Nam đô hộ phủ 安南都護府"],
    quote: "「大唐為交州，後改曰安南都護府。」",
    translation: "“Đời Đại Đường đặt làm Giao Châu, về sau đổi gọi là An Nam đô hộ phủ.”",
    reading: "Thông Điển tóm lược những lần thay đổi tên gọi và đơn vị cai trị qua nhiều triều đại. Câu này cho thấy “An Nam” trước hết là tên một thiết chế hành chính của nhà Đường trong văn cảnh cụ thể.",
    caveat: "Đây là sách tổng hợp thế kỷ VIII nhìn lại địa lý chính trị nhiều thời. “An Nam đô hộ phủ” không đồng nghĩa nước An Nam độc lập về sau, càng không phải tên cố định của toàn bộ Việt Nam qua mọi thời đại.",
    sourceUrl: "https://ctext.org/tongdian/184/zh",
  },
  {
    slug: "tan-duong-thu-an-nam",
    title: "Tân Đường Thư · Địa lý chí",
    hanTitle: "新唐書 · 地理志七上",
    author: "Âu Dương Tu, Tống Kỳ và nhóm biên soạn",
    period: "Thế kỷ XI, chép địa lý thời Đường",
    kind: "administrative-geography",
    kindLabel: "Địa lý hành chính",
    terms: ["An Nam đô hộ phủ 安南都護府", "Tống Bình 宋平"],
    quote: "「調露元年曰安南都護府……寶曆元年徙治宋平。土貢：蕉、檳榔、鮫革、蚺蛇膽、翠羽。」",
    translation: "“Năm Điều Lộ thứ nhất gọi là An Nam đô hộ phủ… năm Bảo Lịch thứ nhất dời trị sở đến Tống Bình. Thổ cống có chuối, cau, da cá nhám, mật trăn và lông trả.”",
    reading: "Địa lý chí ghi niên điểm đổi tên, nơi đặt trị sở và danh mục vật phẩm nộp cống. Qua đó có thể thấy cách triều Đường phân loại không gian, tài nguyên và mạng lưới quản trị ở vùng này.",
    caveat: "Tân Đường Thư được biên soạn sau thời Đường và phục vụ khung địa lý hành chính. Danh mục thổ cống phản ánh con mắt thuế khóa của nhà nước, không phải mô tả đầy đủ kinh tế hay bản sắc cư dân.",
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%96%B0%E5%94%90%E6%9B%B8/%E5%8D%B7043%E4%B8%8A",
  },
  {
    slug: "doc-su-phuong-du-ky-yeu",
    title: "Độc sử phương dư kỷ yếu",
    hanTitle: "讀史方輿紀要 · 卷一百十二",
    author: "Cố Tổ Vũ",
    period: "Thế kỷ XVII, đầu Thanh",
    kind: "historical-geography",
    kindLabel: "Địa lý lịch sử–quân sự",
    terms: ["An Nam 安南", "Phú Lương giang 富良江", "Quỷ Môn Quan 鬼門關"],
    quote: "「安南在憑祥州南五百五十里。東至海三百二十里……古南交地。」",
    translation: "“An Nam ở phía nam Bằng Tường 550 dặm; phía đông đến biển 320 dặm… là đất Nam Giao xưa.”",
    reading: "Quyển 112 đặt An Nam trong mạng lưới đường biên và tuyến quân sự từ Quảng Tây, Vân Nam, Quảng Đông; sách nhắc sông Phú Lương và các cửa ải hiểm yếu.",
    caveat: "Tên đúng là Độc sử phương dư kỷ yếu. Đây là sách thế kỷ XVII, không phải sử thư cổ đại; các câu Hán văn lẫn “thứ nhất chi/nhất/dã” trong bản nháp đã bị loại vì không phải nguyên văn.",
    sourceUrl: "https://ctext.org/wiki.pl?chapter=696602&if=gb&remap=gb",
  },
  {
    slug: "thuy-kinh-chu-lac-dan",
    title: "Thủy Kinh Chú · Diệp Du hà",
    hanTitle: "水經注 · 卷三十七 · 葉榆河",
    author: "Lịch Đạo Nguyên",
    period: "Thế kỷ VI",
    kind: "river-commentary",
    kindLabel: "Địa chí sông ngòi",
    terms: ["Lạc điền 雒田", "Lạc dân 雒民", "Lạc vương 雒王"],
    quote: "「土地有雒田……因名為雒民，設雒王、雒侯。」",
    translation: "“Đất có ruộng Lạc… dân theo đó được gọi là Lạc dân; đặt Lạc vương, Lạc hầu.”",
    reading: "Đoạn này dẫn Giao Châu ngoại vực ký để kể về ruộng theo thủy triều, Lạc dân và tổ chức Lạc vương–Lạc hầu trước khi có quận huyện.",
    caveat: "Tác giả là Lịch Đạo Nguyên, không phải “Liệu Đạo Nguyên”; nguồn được dẫn là Giao Châu ngoại vực ký. Lạc Vương không nên tự động dịch thành Hùng Vương nếu không ghi rõ đó là một cách diễn giải.",
    sourceUrl: "https://ctext.org/text.pl?if=gb&node=570399",
  },
] as const satisfies readonly ExternalHistorySource[];

export const externalSourceKindLabels: Record<ExternalSourceKind, string> = {
  mythography: "Thần thoại — đọc như lịch sử ý niệm",
  "dynastic-history": "Sử truyện — có lập trường triều đại",
  "administrative-geography": "Hành chính — số liệu cần đặt đúng bối cảnh",
  "historical-geography": "Địa lý hậu kỳ — không phải nguồn đồng đại",
  "river-commentary": "Địa chí — dẫn lại văn bản sớm hơn",
};
