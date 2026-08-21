export type RwsSuit = "Wands" | "Cups" | "Swords" | "Pentacles";

export interface RwsCard {
  readonly id: string;
  readonly slug: string;
  readonly originalName: string;
  readonly number: string;
  readonly category: "Major Arcana" | "Minor Arcana";
  readonly suit?: RwsSuit;
  readonly uprightMeaning: string;
  readonly reversedMeaning: string;
  readonly keywords: readonly string[];
  readonly explanation: string;
  readonly visual: string;
}

const majorArcana = [
  {
    id: "major-00", slug: "the-fool", originalName: "The Fool", number: "0", visual: "step",
    uprightMeaning: "Một khởi đầu mở, tinh thần thử nghiệm và niềm tin để bước vào điều chưa biết.",
    reversedMeaning: "Hấp tấp, né tránh bước đầu tiên hoặc đánh cược mà chưa nhìn rủi ro.",
    keywords: ["khởi đầu", "tự do", "dấn bước"],
    explanation: "Lá này thường xuất hiện khi bạn cần học bằng trải nghiệm: chuẩn bị vừa đủ rồi bắt đầu.",
  },
  {
    id: "major-01", slug: "the-magician", originalName: "The Magician", number: "I", visual: "spark",
    uprightMeaning: "Chủ động dùng kỹ năng, ý chí và nguồn lực đang có để tạo kết quả.",
    reversedMeaning: "Tài năng bị dùng sai hướng, thiếu tập trung hoặc lời hứa lớn hơn năng lực thực tế.",
    keywords: ["năng lực", "chủ động", "biến ý thành hình"],
    explanation: "Bạn đã có nhiều công cụ hơn mình tưởng; việc cần làm là chọn một mục tiêu và phối hợp chúng.",
  },
  {
    id: "major-02", slug: "the-high-priestess", originalName: "The High Priestess", number: "II", visual: "moon",
    uprightMeaning: "Trực giác, điều chưa được nói ra và sự quan sát tĩnh trước khi hành động.",
    reversedMeaning: "Bỏ qua tín hiệu bên trong, bí mật gây nhiễu hoặc im lặng quá lâu.",
    keywords: ["trực giác", "tĩnh lặng", "ẩn tri"],
    explanation: "Chưa phải lúc ép một câu trả lời; hãy nghe điều dữ kiện và cảm nhận đang cùng chỉ về.",
  },
  {
    id: "major-03", slug: "the-empress", originalName: "The Empress", number: "III", visual: "seed",
    uprightMeaning: "Nuôi dưỡng, sáng tạo, sự phong nhiêu và khả năng làm cho điều tốt đẹp lớn lên.",
    reversedMeaning: "Cạn kiệt vì chăm người khác quá mức, trì trệ sáng tạo hoặc bao bọc quá chặt.",
    keywords: ["nuôi dưỡng", "sinh sôi", "dồi dào"],
    explanation: "Hãy tạo điều kiện cho sự sống và ý tưởng phát triển, đồng thời nhớ chăm lại chính mình.",
  },
  {
    id: "major-04", slug: "the-emperor", originalName: "The Emperor", number: "IV", visual: "throne",
    uprightMeaning: "Trật tự, trách nhiệm, ranh giới và năng lực lãnh đạo bằng cấu trúc rõ ràng.",
    reversedMeaning: "Kiểm soát cứng nhắc, lạm quyền hoặc thiếu kỷ luật để giữ hệ thống đứng vững.",
    keywords: ["cấu trúc", "quyền hạn", "ổn định"],
    explanation: "Lá bài hỏi ai chịu trách nhiệm, luật nào đang áp dụng và ranh giới nào cần được giữ.",
  },
  {
    id: "major-05", slug: "the-hierophant", originalName: "The Hierophant", number: "V", visual: "key",
    uprightMeaning: "Truyền thống, người hướng dẫn, học qua một hệ thống và các giá trị chung.",
    reversedMeaning: "Tự tìm con đường khác, chất vấn giáo điều hoặc không còn phù hợp với khuôn cũ.",
    keywords: ["truyền thống", "học hỏi", "niềm tin"],
    explanation: "Có lúc cần học đúng nền tảng trước; có lúc cần hiểu nền tảng đủ sâu để cải tiến nó.",
  },
  {
    id: "major-06", slug: "the-lovers", originalName: "The Lovers", number: "VI", visual: "pair",
    uprightMeaning: "Sự hòa hợp, lựa chọn theo giá trị và một quan hệ đòi hỏi tính chân thật.",
    reversedMeaning: "Lệch giá trị, bất hòa hoặc né tránh một lựa chọn có trách nhiệm.",
    keywords: ["gắn kết", "lựa chọn", "đồng thuận"],
    explanation: "Không chỉ nói về tình yêu, lá này còn hỏi lựa chọn nào phản ánh đúng con người bạn muốn trở thành.",
  },
  {
    id: "major-07", slug: "the-chariot", originalName: "The Chariot", number: "VII", visual: "wheel",
    uprightMeaning: "Ý chí có định hướng, làm chủ các lực đối nghịch và tiến tới mục tiêu.",
    reversedMeaning: "Mất phương hướng, cưỡng ép tiến độ hoặc các phần trong bạn đang kéo ngược nhau.",
    keywords: ["ý chí", "tiến lên", "tự chủ"],
    explanation: "Tốc độ chỉ có ích khi tay lái vững và mục tiêu rõ.",
  },
  {
    id: "major-08", slug: "strength", originalName: "Strength", number: "VIII", visual: "heart",
    uprightMeaning: "Can đảm dịu dàng, kiên nhẫn và sức mạnh nội tâm biết điều tiết bản năng.",
    reversedMeaning: "Tự nghi ngờ, phản ứng bốc đồng hoặc cố tỏ ra mạnh khi bên trong đang kiệt sức.",
    keywords: ["can đảm", "kiên nhẫn", "tự chủ"],
    explanation: "Sức mạnh ở đây không phải áp đảo mà là giữ được bình tĩnh khi năng lượng rất lớn xuất hiện.",
  },
  {
    id: "major-09", slug: "the-hermit", originalName: "The Hermit", number: "IX", visual: "lamp",
    uprightMeaning: "Lùi lại để suy ngẫm, tìm sự thật riêng và học từ trải nghiệm đã sống.",
    reversedMeaning: "Cô lập quá lâu, trốn tránh thế giới hoặc chưa tìm được tiếng nói bên trong.",
    keywords: ["chiêm nghiệm", "ẩn cư", "minh triết"],
    explanation: "Một khoảng yên có chủ đích giúp bạn phân biệt điều mình thật sự biết với tiếng ồn xung quanh.",
  },
  {
    id: "major-10", slug: "wheel-of-fortune", originalName: "Wheel of Fortune", number: "X", visual: "cycle",
    uprightMeaning: "Chu kỳ đổi chiều, cơ hội mới và những yếu tố lớn hơn kế hoạch cá nhân.",
    reversedMeaning: "Trì hoãn, lặp lại một vòng cũ hoặc chống lại thay đổi không thể tránh.",
    keywords: ["chu kỳ", "bước ngoặt", "thời vận"],
    explanation: "Bạn không điều khiển được mọi biến số, nhưng có thể chọn cách phản ứng khi bánh xe chuyển động.",
  },
  {
    id: "major-11", slug: "justice", originalName: "Justice", number: "XI", visual: "balance",
    uprightMeaning: "Công bằng, trách nhiệm, hệ quả và quyết định dựa trên sự thật.",
    reversedMeaning: "Thiên lệch, né trách nhiệm hoặc thông tin quan trọng chưa được nhìn nhận.",
    keywords: ["công bằng", "sự thật", "hệ quả"],
    explanation: "Hãy tách mong muốn khỏi bằng chứng và chấp nhận phần trách nhiệm thuộc về mình.",
  },
  {
    id: "major-12", slug: "the-hanged-man", originalName: "The Hanged Man", number: "XII", visual: "pause",
    uprightMeaning: "Tạm dừng, buông quyền kiểm soát và nhìn vấn đề từ một góc đảo ngược.",
    reversedMeaning: "Hy sinh vô ích, trì hoãn kéo dài hoặc bám vào góc nhìn cũ.",
    keywords: ["tạm dừng", "buông", "đổi góc nhìn"],
    explanation: "Không phải mọi lúc đều cần tiến; đôi khi điều đúng là dừng để cách hiểu mới xuất hiện.",
  },
  {
    id: "major-13", slug: "death", originalName: "Death", number: "XIII", visual: "gate",
    uprightMeaning: "Một giai đoạn kết thúc để chuyển hóa và nhường chỗ cho điều mới.",
    reversedMeaning: "Kháng cự thay đổi, kéo dài điều đã hết vai trò hoặc sợ mất bản sắc cũ.",
    keywords: ["kết thúc", "chuyển hóa", "tái sinh"],
    explanation: "Lá này hiếm khi nói về cái chết thể chất; nó thường chỉ một cuộc thay da cần thiết.",
  },
  {
    id: "major-14", slug: "temperance", originalName: "Temperance", number: "XIV", visual: "vessel",
    uprightMeaning: "Điều hòa, vừa đủ, kết hợp khác biệt và tiến triển bền vững.",
    reversedMeaning: "Quá đà, mất cân bằng hoặc trộn nhiều thứ mà chưa tìm được tỷ lệ phù hợp.",
    keywords: ["điều độ", "hòa hợp", "kiên nhẫn"],
    explanation: "Tiến bộ đến từ nhịp đều và sự tinh chỉnh liên tục, không phải một cú bứt phá duy nhất.",
  },
  {
    id: "major-15", slug: "the-devil", originalName: "The Devil", number: "XV", visual: "chain",
    uprightMeaning: "Sự ràng buộc, ham muốn, thói quen và quyền lực mà ta vô tình trao đi.",
    reversedMeaning: "Nhìn ra chiếc xích, lấy lại quyền lựa chọn và bắt đầu thoát khỏi lệ thuộc.",
    keywords: ["ràng buộc", "cám dỗ", "bóng tối"],
    explanation: "Lá bài không kết án; nó chỉ ra nơi bạn nói “không thể” dù vẫn còn một phần lựa chọn.",
  },
  {
    id: "major-16", slug: "the-tower", originalName: "The Tower", number: "XVI", visual: "bolt",
    uprightMeaning: "Cấu trúc sai nền bị phá vỡ, sự thật xuất hiện đột ngột và buộc phải tái thiết.",
    reversedMeaning: "Trì hoãn khủng hoảng, thay đổi âm ỉ hoặc tránh một sự thật đã quá rõ.",
    keywords: ["đổ vỡ", "thức tỉnh", "tái cấu trúc"],
    explanation: "Điều sụp xuống thường là phần không còn đủ thật để tiếp tục nâng đỡ cuộc sống.",
  },
  {
    id: "major-17", slug: "the-star", originalName: "The Star", number: "XVII", visual: "star",
    uprightMeaning: "Hy vọng có cơ sở, chữa lành, cảm hứng và kết nối lại với hướng đi dài hạn.",
    reversedMeaning: "Mất niềm tin, so sánh khiến mình cạn sức hoặc không thấy tiến bộ nhỏ đang diễn ra.",
    keywords: ["hy vọng", "chữa lành", "dẫn đường"],
    explanation: "Sau biến động, lá này nhắc bạn phục hồi bằng những việc nhỏ và thật.",
  },
  {
    id: "major-18", slug: "the-moon", originalName: "The Moon", number: "XVIII", visual: "tide",
    uprightMeaning: "Mơ hồ, tiềm thức, nỗi sợ và hành trình đi qua vùng chưa đủ ánh sáng.",
    reversedMeaning: "Ảo tưởng dần tan, sự thật hé lộ hoặc lo âu làm méo cách nhìn.",
    keywords: ["mơ hồ", "tiềm thức", "trực giác"],
    explanation: "Khi chưa đủ dữ kiện, hãy đi chậm, kiểm chứng và đừng coi mọi cảm giác là một sự thật.",
  },
  {
    id: "major-19", slug: "the-sun", originalName: "The Sun", number: "XIX", visual: "sun",
    uprightMeaning: "Niềm vui rõ ràng, sinh lực, thành công và sự tự tin không cần che giấu.",
    reversedMeaning: "Ánh sáng bị mây che, kỳ vọng quá cao hoặc khó cho phép mình tận hưởng thành quả.",
    keywords: ["sáng rõ", "sinh lực", "thành công"],
    explanation: "Điều tốt đang hiện ra đủ rõ để được công nhận và chia sẻ.",
  },
  {
    id: "major-20", slug: "judgement", originalName: "Judgement", number: "XX", visual: "call",
    uprightMeaning: "Thức tỉnh, tổng kết quá khứ và đáp lại một lời gọi có ý nghĩa.",
    reversedMeaning: "Tự phán xét quá nặng, trì hoãn quyết định hoặc chưa rút được bài học cốt lõi.",
    keywords: ["thức tỉnh", "đánh giá", "lời gọi"],
    explanation: "Đây là lúc nhìn toàn bộ chặng đường, nhận phần sai và chọn cách sống tiếp theo.",
  },
  {
    id: "major-21", slug: "the-world", originalName: "The World", number: "XXI", visual: "wreath",
    uprightMeaning: "Hoàn tất một chu kỳ, hội nhập kinh nghiệm và bước vào phạm vi rộng hơn.",
    reversedMeaning: "Việc gần xong nhưng còn mắt xích chưa khép, hoặc ngại rời một chặng đã quen.",
    keywords: ["hoàn thành", "toàn vẹn", "mở rộng"],
    explanation: "Hãy ghi nhận điều đã hoàn tất, đóng vòng cũ cho tử tế rồi mới bắt đầu vòng mới.",
  },
] as const satisfies readonly Omit<RwsCard, "category">[];

type MinorCopy = Omit<RwsCard, "id" | "category" | "suit">;

function buildSuit(suit: RwsSuit, slug: string, cards: readonly MinorCopy[]): readonly RwsCard[] {
  return cards.map((card) => ({
    ...card,
    id: `minor-${slug}-${card.slug}`,
    category: "Minor Arcana" as const,
    suit,
  }));
}

const wands = buildSuit("Wands", "wands", [
  { slug: "ace-of-wands", originalName: "Ace of Wands", number: "Ace", visual: "wands", uprightMeaning: "Tia lửa khởi đầu, cảm hứng và động lực muốn được thử ngay.", reversedMeaning: "Ý tưởng chưa bén, chậm khởi động hoặc năng lượng bị phân tán.", keywords: ["cảm hứng", "khởi sự", "năng lượng"], explanation: "Một cơ hội sáng tạo đang xuất hiện; hãy cho nó một hành động đầu tiên nhỏ nhưng thật." },
  { slug: "two-of-wands", originalName: "Two of Wands", number: "2", visual: "wands", uprightMeaning: "Lập kế hoạch, nhìn xa và cân nhắc bước ra khỏi vùng quen thuộc.", reversedMeaning: "Sợ mở rộng, kế hoạch thiếu dữ kiện hoặc chọn an toàn vì thiếu tự tin.", keywords: ["tầm nhìn", "kế hoạch", "lựa chọn"], explanation: "Bạn đã có nền tảng; câu hỏi là sẽ dùng nó để đi xa đến đâu." },
  { slug: "three-of-wands", originalName: "Three of Wands", number: "3", visual: "wands", uprightMeaning: "Mở rộng, chờ kết quả đầu tiên và phối hợp với thế giới bên ngoài.", reversedMeaning: "Chậm trễ, tầm nhìn hẹp hoặc kế hoạch mở rộng thiếu chuẩn bị.", keywords: ["mở rộng", "tiến triển", "viễn kiến"], explanation: "Việc đã rời bàn vẽ; giờ cần quan sát phản hồi và điều chỉnh đường đi." },
  { slug: "four-of-wands", originalName: "Four of Wands", number: "4", visual: "wands", uprightMeaning: "Cột mốc vui, nền tảng ổn định và cảm giác thuộc về một cộng đồng.", reversedMeaning: "Niềm vui riêng tư, nền nhà chưa yên hoặc căng thẳng trong nhóm.", keywords: ["ăn mừng", "ổn định", "cộng đồng"], explanation: "Hãy dừng lại ghi nhận cột mốc và những người đã giúp nó thành hình." },
  { slug: "five-of-wands", originalName: "Five of Wands", number: "5", visual: "wands", uprightMeaning: "Cạnh tranh, va chạm quan điểm và năng lượng hỗn độn cần được điều phối.", reversedMeaning: "Né xung đột, hạ nhiệt tranh chấp hoặc bất đồng kéo dài trong im lặng.", keywords: ["cạnh tranh", "va chạm", "thử sức"], explanation: "Không phải mọi xung đột đều xấu; hãy biến nó thành luật chơi và bài học rõ ràng." },
  { slug: "six-of-wands", originalName: "Six of Wands", number: "6", visual: "wands", uprightMeaning: "Được công nhận, chiến thắng và tiến lên nhờ niềm tin tập thể.", reversedMeaning: "Thiếu ghi nhận, cái tôi phụ thuộc lời khen hoặc thành công chưa bền.", keywords: ["thành tựu", "ghi nhận", "tự tin"], explanation: "Bạn có quyền nhận công, nhưng nên dùng uy tín mới để phục vụ chặng tiếp theo." },
  { slug: "seven-of-wands", originalName: "Seven of Wands", number: "7", visual: "wands", uprightMeaning: "Giữ vị trí, bảo vệ giá trị và kiên định trước áp lực.", reversedMeaning: "Quá tải, phòng thủ mọi phía hoặc không còn chắc điều mình đang bảo vệ.", keywords: ["kiên định", "ranh giới", "bảo vệ"], explanation: "Chọn trận đáng giữ; không phải lời phản đối nào cũng cần một cuộc chiến." },
  { slug: "eight-of-wands", originalName: "Eight of Wands", number: "8", visual: "wands", uprightMeaning: "Tiến triển nhanh, thông tin tới dồn dập và thời điểm hành động đã chín.", reversedMeaning: "Chậm trễ, tín hiệu chéo hoặc hành động nhanh nhưng lệch hướng.", keywords: ["tốc độ", "tin tức", "chuyển động"], explanation: "Mọi thứ đang chạy; hãy giữ thông điệp ngắn và ưu tiên điều cần quyết ngay." },
  { slug: "nine-of-wands", originalName: "Nine of Wands", number: "9", visual: "wands", uprightMeaning: "Sức bền, cảnh giác và nỗ lực cuối trước khi chạm đích.", reversedMeaning: "Kiệt sức, đa nghi hoặc lặp lại phòng thủ vì vết thương cũ.", keywords: ["bền bỉ", "cảnh giác", "ranh giới"], explanation: "Bạn chưa thua; nhưng muốn đi tiếp thì phải bảo vệ năng lượng, không chỉ siết răng chịu đựng." },
  { slug: "ten-of-wands", originalName: "Ten of Wands", number: "10", visual: "wands", uprightMeaning: "Gánh nhiều trách nhiệm, thành quả đi kèm trọng lượng và nhu cầu phân bổ lại.", reversedMeaning: "Buông bớt, ủy quyền hoặc gánh việc không thật sự thuộc về mình.", keywords: ["gánh nặng", "trách nhiệm", "quá tải"], explanation: "Hoàn thành không có nghĩa phải tự mang tất cả; hãy phân biệt trách nhiệm với thói ôm việc." },
  { slug: "page-of-wands", originalName: "Page of Wands", number: "Page", visual: "wands", uprightMeaning: "Tin vui, tò mò sáng tạo và người học sẵn sàng khám phá.", reversedMeaning: "Nóng hứng rồi bỏ, thiếu định hướng hoặc sợ bộc lộ ý tưởng non trẻ.", keywords: ["tò mò", "khám phá", "thông điệp"], explanation: "Cho phép mình là người mới và thử một hướng khiến bạn thật sự có lửa." },
  { slug: "knight-of-wands", originalName: "Knight of Wands", number: "Knight", visual: "wands", uprightMeaning: "Hành động táo bạo, phiêu lưu và sức hút của tốc độ.", reversedMeaning: "Bốc đồng, nóng nảy hoặc lao đi mà không tính hậu quả.", keywords: ["táo bạo", "phiêu lưu", "xung lực"], explanation: "Dũng khí là lợi thế nếu nó có mục tiêu và một điểm dừng an toàn." },
  { slug: "queen-of-wands", originalName: "Queen of Wands", number: "Queen", visual: "wands", uprightMeaning: "Tự tin ấm áp, độc lập và khả năng truyền lửa cho người khác.", reversedMeaning: "Ghen tị, thu mình hoặc cần sự chú ý để xác nhận giá trị bản thân.", keywords: ["tự tin", "ấm áp", "cuốn hút"], explanation: "Hãy chiếm lấy không gian của mình mà không cần làm nhỏ ánh sáng của người khác." },
  { slug: "king-of-wands", originalName: "King of Wands", number: "King", visual: "wands", uprightMeaning: "Tầm nhìn lớn, lãnh đạo sáng tạo và dám chịu trách nhiệm cho hướng đi.", reversedMeaning: "Độc đoán, hứa quá tầm hoặc theo đuổi tầm nhìn mà bỏ quên con người.", keywords: ["tầm nhìn", "lãnh đạo", "doanh khí"], explanation: "Người dẫn đường giỏi không chỉ thấy xa mà còn biến tầm nhìn thành hệ thống người khác đi cùng được." },
]);

const cups = buildSuit("Cups", "cups", [
  { slug: "ace-of-cups", originalName: "Ace of Cups", number: "Ace", visual: "cups", uprightMeaning: "Cảm xúc mới, lòng trắc ẩn và một dòng kết nối được mở ra.", reversedMeaning: "Khép lòng, cảm xúc bị dồn nén hoặc cần tự nuôi dưỡng trước.", keywords: ["tình cảm", "mở lòng", "trực giác"], explanation: "Một chiếc cốc chỉ trao đi tốt khi nó có nguồn để tự đầy." },
  { slug: "two-of-cups", originalName: "Two of Cups", number: "2", visual: "cups", uprightMeaning: "Gặp gỡ bình đẳng, hấp dẫn lẫn nhau và thỏa thuận từ thiện chí.", reversedMeaning: "Lệch nhịp, hiểu lầm hoặc mối quan hệ thiếu sự đáp lại.", keywords: ["kết đôi", "hòa hợp", "trao đổi"], explanation: "Điểm mạnh của mối nối này nằm ở sự tương hỗ, không phải một phía cố gắng nhiều hơn." },
  { slug: "three-of-cups", originalName: "Three of Cups", number: "3", visual: "cups", uprightMeaning: "Bạn bè, chia vui và sức nâng đỡ của cộng đồng.", reversedMeaning: "Quá đà, chuyện nhóm gây mệt hoặc cảm giác bị đứng ngoài.", keywords: ["bạn bè", "ăn mừng", "cộng đồng"], explanation: "Niềm vui được nhân lên khi có người cùng chia, miễn là ranh giới vẫn rõ." },
  { slug: "four-of-cups", originalName: "Four of Cups", number: "4", visual: "cups", uprightMeaning: "Chán nản, hướng nội và chưa nhận ra một cơ hội đang được đưa tới.", reversedMeaning: "Tỉnh lại khỏi trì trệ, mở lòng với khả năng mới hoặc chọn rút lui có ý thức.", keywords: ["thờ ơ", "suy ngẫm", "cơ hội"], explanation: "Không cần nhận mọi lời mời, nhưng hãy chắc mình từ chối vì hiểu rõ chứ không vì tê mỏi." },
  { slug: "five-of-cups", originalName: "Five of Cups", number: "5", visual: "cups", uprightMeaning: "Mất mát, tiếc nuối và sự chú ý bị giữ ở phần đã đổ vỡ.", reversedMeaning: "Chấp nhận, hồi phục và bắt đầu nhìn thấy điều vẫn còn.", keywords: ["mất mát", "tiếc nuối", "hồi phục"], explanation: "Đau buồn cần được nhìn nhận, rồi mới có thể quay lại với những chiếc cốc chưa mất." },
  { slug: "six-of-cups", originalName: "Six of Cups", number: "6", visual: "cups", uprightMeaning: "Ký ức, sự hồn nhiên và điều tốt từ quá khứ quay lại.", reversedMeaning: "Mắc kẹt trong hoài niệm, lý tưởng hóa quá khứ hoặc trưởng thành khỏi khuôn cũ.", keywords: ["ký ức", "hồn nhiên", "trở về"], explanation: "Quá khứ có thể là nguồn nuôi dưỡng, miễn là nó không thay thế hiện tại." },
  { slug: "seven-of-cups", originalName: "Seven of Cups", number: "7", visual: "cups", uprightMeaning: "Nhiều lựa chọn, tưởng tượng phong phú và nguy cơ bị mê bởi vẻ ngoài.", reversedMeaning: "Thu hẹp lựa chọn, nhìn rõ ưu tiên hoặc tỉnh khỏi ảo tưởng.", keywords: ["lựa chọn", "ảo ảnh", "khả năng"], explanation: "Đừng chọn bằng cảm giác hấp dẫn đầu tiên; hãy kiểm tra cái giá và tính thực tế của từng phương án." },
  { slug: "eight-of-cups", originalName: "Eight of Cups", number: "8", visual: "cups", uprightMeaning: "Rời điều không còn đủ ý nghĩa để tìm một chiều sâu khác.", reversedMeaning: "Sợ rời đi, quay lại bài học cũ hoặc bỏ cuộc trước khi hiểu điều mình cần.", keywords: ["rời bỏ", "tìm kiếm", "chuyển hướng"], explanation: "Rời đi có thể là hành động trưởng thành khi bạn biết rõ mình đang tìm điều gì hơn." },
  { slug: "nine-of-cups", originalName: "Nine of Cups", number: "9", visual: "cups", uprightMeaning: "Mãn nguyện, điều ước thành hình và sự thoải mái đáng tận hưởng.", reversedMeaning: "Thỏa mãn bề mặt, nuông chiều quá mức hoặc có đủ mà vẫn thấy thiếu.", keywords: ["mãn nguyện", "ước nguyện", "hưởng thụ"], explanation: "Hãy tận hưởng thành quả và đồng thời hỏi niềm vui này có thật sự nuôi mình lâu dài không." },
  { slug: "ten-of-cups", originalName: "Ten of Cups", number: "10", visual: "cups", uprightMeaning: "Hòa thuận, hạnh phúc được chia sẻ và cảm giác gia đình/cộng đồng trọn vẹn.", reversedMeaning: "Kỳ vọng gia đình quá đẹp, bất hòa kín hoặc giá trị chung cần được nói lại.", keywords: ["hòa thuận", "gia đình", "viên mãn"], explanation: "Sự ấm êm bền đến từ việc cùng xây và cùng sửa, không phải hình ảnh hoàn hảo bên ngoài." },
  { slug: "page-of-cups", originalName: "Page of Cups", number: "Page", visual: "cups", uprightMeaning: "Thông điệp cảm xúc, trực giác non trẻ và sự ngạc nhiên dịu dàng.", reversedMeaning: "Nhạy cảm quá mức, trốn vào mơ mộng hoặc chưa biết diễn đạt cảm xúc.", keywords: ["nhạy cảm", "tin nhắn", "sáng tạo"], explanation: "Hãy đón cảm xúc như một thông tin mới, không vội coi nó là toàn bộ sự thật." },
  { slug: "knight-of-cups", originalName: "Knight of Cups", number: "Knight", visual: "cups", uprightMeaning: "Lãng mạn, theo đuổi lý tưởng và lời mời xuất phát từ trái tim.", reversedMeaning: "Ảo tưởng tình cảm, thất thường hoặc lời đẹp không đi cùng hành động.", keywords: ["lãng mạn", "lý tưởng", "lời mời"], explanation: "Cảm hứng đẹp cần một hành động nhất quán để trở thành điều có thể tin." },
  { slug: "queen-of-cups", originalName: "Queen of Cups", number: "Queen", visual: "cups", uprightMeaning: "Thấu cảm sâu, trực giác và khả năng giữ không gian an toàn cho cảm xúc.", reversedMeaning: "Thấm cảm xúc người khác quá mức, lệ thuộc hoặc bỏ quên nhu cầu riêng.", keywords: ["thấu cảm", "trực giác", "chăm sóc"], explanation: "Lắng nghe bằng trái tim nhưng giữ đôi chân trên mặt đất và ranh giới của mình." },
  { slug: "king-of-cups", originalName: "King of Cups", number: "King", visual: "cups", uprightMeaning: "Trưởng thành cảm xúc, bình tĩnh và biết dùng lòng trắc ẩn trong quyết định.", reversedMeaning: "Kìm nén, thao túng cảm xúc hoặc vẻ bình thản che một cơn sóng lớn.", keywords: ["điềm tĩnh", "trắc ẩn", "cân bằng"], explanation: "Làm chủ cảm xúc không phải không cảm thấy, mà là không để một cơn sóng quyết định thay mình." },
]);

const swords = buildSuit("Swords", "swords", [
  { slug: "ace-of-swords", originalName: "Ace of Swords", number: "Ace", visual: "swords", uprightMeaning: "Ý tưởng sắc rõ, sự thật mới và quyết định cắt qua mơ hồ.", reversedMeaning: "Nhầm lẫn, lời nói gây hại hoặc sự thật bị dùng thiếu trách nhiệm.", keywords: ["sự thật", "minh triết", "quyết định"], explanation: "Hãy gọi đúng tên vấn đề; sự rõ ràng là bước đầu của một lựa chọn công bằng." },
  { slug: "two-of-swords", originalName: "Two of Swords", number: "2", visual: "swords", uprightMeaning: "Bế tắc, cân nhắc hai phía và tạm hoãn khi chưa đủ dữ kiện.", reversedMeaning: "Quá tải thông tin, bí mật lộ ra hoặc không thể trì hoãn thêm.", keywords: ["bế tắc", "cân nhắc", "trì hoãn"], explanation: "Sự trung lập chỉ hữu ích trong một thời gian; hãy xác định dữ kiện nào còn thiếu để quyết." },
  { slug: "three-of-swords", originalName: "Three of Swords", number: "3", visual: "swords", uprightMeaning: "Đau lòng, chia cách và một sự thật khó nhưng cần được thừa nhận.", reversedMeaning: "Khâu lành, tha thứ hoặc nỗi đau vẫn mắc lại vì chưa được gọi tên.", keywords: ["đau lòng", "sự thật", "hồi phục"], explanation: "Đừng tô hồng mất mát; thành thật với vết thương là cách bắt đầu chữa lành." },
  { slug: "four-of-swords", originalName: "Four of Swords", number: "4", visual: "swords", uprightMeaning: "Nghỉ ngơi, phục hồi tinh thần và tạm rời cuộc tranh đấu.", reversedMeaning: "Bồn chồn, kiệt sức kéo dài hoặc bị buộc phải dừng.", keywords: ["nghỉ ngơi", "phục hồi", "tĩnh tâm"], explanation: "Nghỉ là một phần của chiến lược; tâm trí quá mệt sẽ biến mọi việc thành khẩn cấp." },
  { slug: "five-of-swords", originalName: "Five of Swords", number: "5", visual: "swords", uprightMeaning: "Xung đột thắng-thua, chiến thắng đắt giá và lời nói để lại hậu quả.", reversedMeaning: "Hòa giải, buông cuộc đấu vô ích hoặc oán giận còn âm ỉ.", keywords: ["xung đột", "thắng thua", "hệ quả"], explanation: "Hãy hỏi thắng cuộc này sẽ để lại mối quan hệ và danh dự như thế nào." },
  { slug: "six-of-swords", originalName: "Six of Swords", number: "6", visual: "swords", uprightMeaning: "Rời vùng hỗn loạn, chuyển tiếp khó nhưng hướng tới nơi yên hơn.", reversedMeaning: "Mang theo hành lý cũ, chậm chuyển hoặc chưa thể rời vấn đề.", keywords: ["chuyển tiếp", "rời đi", "hồi phục"], explanation: "Không phải đã hết đau, nhưng bạn đang chọn một hướng giúp đau đớn có cơ hội lắng xuống." },
  { slug: "seven-of-swords", originalName: "Seven of Swords", number: "7", visual: "swords", uprightMeaning: "Chiến lược kín, hành động độc lập hoặc né tránh trách nhiệm.", reversedMeaning: "Sự thật lộ ra, thú nhận hoặc tự lừa mình không còn hiệu quả.", keywords: ["chiến lược", "kín đáo", "né tránh"], explanation: "Kế hoạch thông minh khác với gian dối; hãy kiểm tra ai đang phải trả giá cho cách đi vòng." },
  { slug: "eight-of-swords", originalName: "Eight of Swords", number: "8", visual: "swords", uprightMeaning: "Cảm giác bị kẹt, giới hạn do niềm tin và nỗi sợ làm hẹp lựa chọn.", reversedMeaning: "Thấy lại quyền chọn, tháo gỡ niềm tin cũ hoặc lo âu vẫn níu chân.", keywords: ["mắc kẹt", "giới hạn", "tự giải phóng"], explanation: "Tình thế có ràng buộc thật, nhưng thường vẫn còn một bước nhỏ bạn có thể chủ động." },
  { slug: "nine-of-swords", originalName: "Nine of Swords", number: "9", visual: "swords", uprightMeaning: "Lo âu, mất ngủ và tâm trí lặp lại viễn cảnh tệ nhất.", reversedMeaning: "Bắt đầu hồi phục, tìm hỗ trợ hoặc nỗi sợ bị giấu ngày càng nặng.", keywords: ["lo âu", "mất ngủ", "ám ảnh"], explanation: "Hãy đưa nỗi sợ ra ánh sáng bằng dữ kiện và hỗ trợ thực tế; đừng một mình tranh luận với nó suốt đêm." },
  { slug: "ten-of-swords", originalName: "Ten of Swords", number: "10", visual: "swords", uprightMeaning: "Một kết thúc đau nhưng dứt khoát; điều cũ không thể kéo dài thêm.", reversedMeaning: "Sống sót, phục hồi chậm hoặc chưa chịu khép một chương đã hết.", keywords: ["kết thúc", "chạm đáy", "bình minh"], explanation: "Khi câu chuyện cũ đã kết thúc, năng lượng nên dành cho hồi phục và bài học, không phải phủ nhận." },
  { slug: "page-of-swords", originalName: "Page of Swords", number: "Page", visual: "swords", uprightMeaning: "Tò mò trí tuệ, quan sát nhanh và tin tức cần được kiểm chứng.", reversedMeaning: "Nói trước khi hiểu, theo dõi quá mức hoặc thông tin thiếu chín chắn.", keywords: ["tò mò", "quan sát", "tin tức"], explanation: "Đặt câu hỏi sắc nhưng đừng vội biến giả thuyết thành kết luận." },
  { slug: "knight-of-swords", originalName: "Knight of Swords", number: "Knight", visual: "swords", uprightMeaning: "Quyết liệt, tốc độ trí tuệ và lao thẳng vào mục tiêu.", reversedMeaning: "Cực đoan, hấp tấp hoặc tranh luận chỉ để thắng.", keywords: ["quyết liệt", "tốc độ", "tham vọng"], explanation: "Một ý đúng vẫn có thể gây hại nếu cách triển khai không để ai kịp hiểu và chuẩn bị." },
  { slug: "queen-of-swords", originalName: "Queen of Swords", number: "Queen", visual: "swords", uprightMeaning: "Sáng suốt, độc lập và giao tiếp thẳng với ranh giới rõ.", reversedMeaning: "Lạnh lùng, cay nghiệt hoặc nỗi đau biến thành phán xét.", keywords: ["sáng suốt", "ranh giới", "thẳng thắn"], explanation: "Nói thật không cần tàn nhẫn; sự rõ ràng tốt nhất vẫn giữ phẩm giá cho cả hai bên." },
  { slug: "king-of-swords", originalName: "King of Swords", number: "King", visual: "swords", uprightMeaning: "Tư duy hệ thống, thẩm quyền và quyết định dựa trên nguyên tắc.", reversedMeaning: "Lạm dụng lý lẽ, độc đoán hoặc thông minh mà thiếu đạo đức.", keywords: ["lý trí", "thẩm quyền", "nguyên tắc"], explanation: "Quyền lực trí tuệ đi cùng trách nhiệm dùng tiêu chuẩn nhất quán, kể cả với chính mình." },
]);

const pentacles = buildSuit("Pentacles", "pentacles", [
  { slug: "ace-of-pentacles", originalName: "Ace of Pentacles", number: "Ace", visual: "pentacles", uprightMeaning: "Cơ hội vật chất, hạt giống ổn định và một nền tảng có thể đo được.", reversedMeaning: "Cơ hội trôi qua, kế hoạch tài chính yếu hoặc đặt nền thiếu thực tế.", keywords: ["cơ hội", "nguồn lực", "nền tảng"], explanation: "Hãy biến tiềm năng thành một bước cụ thể: ngân sách, lịch, công cụ hoặc thỏa thuận rõ." },
  { slug: "two-of-pentacles", originalName: "Two of Pentacles", number: "2", visual: "pentacles", uprightMeaning: "Cân nhiều việc, linh hoạt nguồn lực và giữ nhịp giữa thay đổi.", reversedMeaning: "Quá tải, ưu tiên lộn xộn hoặc dòng tiền/thời gian mất cân bằng.", keywords: ["cân bằng", "linh hoạt", "ưu tiên"], explanation: "Bạn có thể xoay xở, nhưng cần biết việc nào sẽ rơi nếu tiếp tục thêm tải." },
  { slug: "three-of-pentacles", originalName: "Three of Pentacles", number: "3", visual: "pentacles", uprightMeaning: "Hợp tác tay nghề, học từ phản hồi và xây thứ có tiêu chuẩn.", reversedMeaning: "Làm việc rời rạc, chất lượng thấp hoặc vai trò trong nhóm không rõ.", keywords: ["hợp tác", "tay nghề", "chất lượng"], explanation: "Kết quả tốt đến từ kỹ năng khác nhau gặp nhau trong một bản vẽ chung." },
  { slug: "four-of-pentacles", originalName: "Four of Pentacles", number: "4", visual: "pentacles", uprightMeaning: "Giữ chặt nguồn lực, tìm an toàn và sợ mất điều đã tích lũy.", reversedMeaning: "Nới tay, chi tiêu thiếu kiểm soát hoặc học cách chia sẻ có ranh giới.", keywords: ["kiểm soát", "an toàn", "giữ gìn"], explanation: "Tiết kiệm giúp an toàn; bám giữ quá mức có thể làm nguồn lực ngừng lưu chuyển." },
  { slug: "five-of-pentacles", originalName: "Five of Pentacles", number: "5", visual: "pentacles", uprightMeaning: "Thiếu thốn, bị bỏ lại và giai đoạn cần sự hỗ trợ thực tế.", reversedMeaning: "Phục hồi, tìm thấy nguồn giúp đỡ hoặc thoát dần tư duy khan hiếm.", keywords: ["khó khăn", "thiếu thốn", "hỗ trợ"], explanation: "Đừng để xấu hổ ngăn bạn nhìn thấy cánh cửa hỗ trợ đang có." },
  { slug: "six-of-pentacles", originalName: "Six of Pentacles", number: "6", visual: "pentacles", uprightMeaning: "Cho và nhận, phân bổ nguồn lực và quyền lực nằm trong sự giúp đỡ.", reversedMeaning: "Món quà có điều kiện, nợ nần hoặc quan hệ cho-nhận mất cân bằng.", keywords: ["hào phóng", "trao đổi", "cân bằng"], explanation: "Sự hỗ trợ lành mạnh phải tôn trọng người nhận và minh bạch kỳ vọng." },
  { slug: "seven-of-pentacles", originalName: "Seven of Pentacles", number: "7", visual: "pentacles", uprightMeaning: "Đánh giá tiến độ, kiên nhẫn và xem công sức đã sinh kết quả gì.", reversedMeaning: "Nóng ruột, đầu tư sai chỗ hoặc tiếp tục chỉ vì đã tốn quá nhiều.", keywords: ["kiên nhẫn", "đánh giá", "đầu tư"], explanation: "Đừng chỉ hỏi đã làm bao lâu; hãy hỏi dấu hiệu nào chứng minh cách làm đang hiệu quả." },
  { slug: "eight-of-pentacles", originalName: "Eight of Pentacles", number: "8", visual: "pentacles", uprightMeaning: "Rèn nghề, lặp lại có chủ đích và nâng chất lượng qua từng phiên bản.", reversedMeaning: "Làm cho xong, cầu toàn vô ích hoặc lặp lại mà không học.", keywords: ["tay nghề", "luyện tập", "chăm chỉ"], explanation: "Tiến bộ đến từ vòng lặp làm–nhận phản hồi–sửa, không phải số giờ đơn thuần." },
  { slug: "nine-of-pentacles", originalName: "Nine of Pentacles", number: "9", visual: "pentacles", uprightMeaning: "Độc lập, thành quả chín và sự đủ đầy do kỷ luật tạo nên.", reversedMeaning: "Phụ thuộc tài chính, làm việc quá mức hoặc thành công bề ngoài thiếu tự do thật.", keywords: ["độc lập", "thành quả", "tinh tế"], explanation: "Hãy tận hưởng điều mình đã xây và bảo vệ năng lực tự đứng vững." },
  { slug: "ten-of-pentacles", originalName: "Ten of Pentacles", number: "10", visual: "pentacles", uprightMeaning: "Di sản, ổn định dài hạn và nguồn lực đi qua nhiều thế hệ.", reversedMeaning: "Mâu thuẫn tài sản, nền tảng gia đình lung lay hoặc chỉ giữ hình thức truyền thống.", keywords: ["di sản", "gia đình", "bền vững"], explanation: "Giá trị lâu dài gồm cả tài sản, tri thức, uy tín và cách một cộng đồng chăm nhau." },
  { slug: "page-of-pentacles", originalName: "Page of Pentacles", number: "Page", visual: "pentacles", uprightMeaning: "Người học thực tế, kế hoạch mới và tin tức về học tập/công việc/tiền bạc.", reversedMeaning: "Trì hoãn, học không đi đôi làm hoặc mục tiêu vật chất thiếu kế hoạch.", keywords: ["học nghề", "kế hoạch", "cơ hội"], explanation: "Bắt đầu bằng một kỹ năng có thể luyện và một mốc có thể kiểm chứng." },
  { slug: "knight-of-pentacles", originalName: "Knight of Pentacles", number: "Knight", visual: "pentacles", uprightMeaning: "Bền bỉ, đáng tin và tiến đều theo quy trình.", reversedMeaning: "Trì trệ, quá bảo thủ hoặc chăm chỉ nhưng không còn xem lại mục tiêu.", keywords: ["bền bỉ", "quy trình", "đáng tin"], explanation: "Không hào nhoáng nhưng hiệu quả: làm đúng việc cần thiết, đúng nhịp và lặp lại." },
  { slug: "queen-of-pentacles", originalName: "Queen of Pentacles", number: "Queen", visual: "pentacles", uprightMeaning: "Chăm sóc thực tế, quản lý nguồn lực và tạo một môi trường đủ đầy.", reversedMeaning: "Bỏ quên bản thân, bất an vật chất hoặc chăm lo thành kiểm soát.", keywords: ["vun vén", "thực tế", "đủ đầy"], explanation: "Sự quan tâm trở nên hữu ích khi nó có thời gian, ngân sách và ranh giới cụ thể." },
  { slug: "king-of-pentacles", originalName: "King of Pentacles", number: "King", visual: "pentacles", uprightMeaning: "Quản trị vững, thịnh vượng có trách nhiệm và năng lực tạo giá trị lâu dài.", reversedMeaning: "Tham lợi, bảo thủ hoặc đo mọi giá trị chỉ bằng tiền và địa vị.", keywords: ["quản trị", "thịnh vượng", "bền vững"], explanation: "Thành công vật chất tốt nhất là thứ vận hành ổn định và nuôi được nhiều người hơn cái tôi của chủ sở hữu." },
]);

export const rwsCards: readonly RwsCard[] = [
  ...majorArcana.map((card) => ({ ...card, category: "Major Arcana" as const })),
  ...wands,
  ...cups,
  ...swords,
  ...pentacles,
];

export const rwsCardBySlug = new Map(rwsCards.map((card) => [card.slug, card]));
