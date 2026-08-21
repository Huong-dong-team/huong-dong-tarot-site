/* Nguồn dữ liệu chuẩn cho 22 Ẩn Chính — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY.
 *
 *   Nguồn : Huong-Dong-Tarot-78-Art-Direction-Storytelling.docx · v2.1 · 16/08/2026
 *   Sinh  : node scripts/parse-v21.mjs <docx> --out content/major-arcana.json
 *           node scripts/gen-major-arcana.mjs
 *
 * Sửa nội dung thì sửa ở DOCX v2.x rồi chạy lại hai lệnh trên. Sửa thẳng vào
 * đây sẽ mất trong lần sinh kế tiếp, và tệ hơn: tạo ra nguồn sự thật thứ hai,
 * đúng thứ đã khiến 9 lá lệch tên khỏi nguồn trích của chính chúng.
 */

export { SOURCES, hasLNCQSource, sourcesOf } from "./sources.mjs";

export const MAJOR_ARCANA = Object.freeze([
  {
    "id": "major-00",
    "number": 0,
    "roman": "0",
    "slug": "the-fool",
    "rwsName": "The Fool",
    "vietnameseTitle": "Mai An Tiêm",
    "subtitle": "Hạt dưa trên đảo trắng",
    "keywords": "khởi đầu tự do dấn bước",
    "uprightMeaning": "Một khởi đầu mở, tinh thần thử nghiệm và niềm tin để bước vào điều chưa biết.",
    "reversedMeaning": "Hấp tấp, né tránh bước đầu tiên hoặc đánh cược mà chưa nhìn rủi ro.",
    "fullRetelling": [
      "Mai An Tiêm vốn là người từ phương xa, được đưa vào hầu vua Hùng. Nhờ tháo vát, chàng có nhà cửa, vợ con và của cải. Nhưng khi An Tiêm nói rằng phúc lộc mình có là do mệnh và công sức, nhà vua cho đó là lời kiêu bạc, bèn đày cả gia đình ra một hòn đảo hoang ngoài biển.",
      "Trước gió mặn, cát trắng và số lương thực ít ỏi, người vợ lo sợ không qua khỏi. An Tiêm không chờ phép màu đến cứu. Chàng dựng chỗ trú, tìm nước, chia phần ăn và tin rằng nơi nào trời còn để người sống thì nơi ấy còn có đường làm lại. Một ngày, chim lạ bay qua làm rơi những hạt đen. Chàng nhặt lấy, gieo xuống cát. Dây bò lan, kết thành quả xanh, ruột đỏ, vị ngọt mát. An Tiêm khắc dấu vào quả rồi thả ra biển. Thuyền buôn nhặt được, tìm tới đảo đổi gạo và vật dụng lấy thứ quả mới.",
      "Tiếng dưa lạ đến tai vua. Hiểu rằng An Tiêm không chết vì tuyệt vọng mà đã tự gây dựng cuộc sống, vua cho gọi gia đình trở về và phục hồi vị thế. Từ hạt giống vô danh trên bãi vắng, một giống quả được truyền đi. Bước chân đầu tiên của Kẻ Khờ vì thế không phải lao vào khoảng không: đó là dám đặt niềm tin vào một hạt chưa biết tên, rồi chịu trách nhiệm chăm nó lớn."
    ],
    "sourceStory": "Mai An Tiêm bị đày ra đảo, gieo hạt do chim mang tới, trồng dưa, trao đổi với thuyền buôn và được gọi về.",
    "tarotBridge": "The Fool nằm ở khoảnh khắc chấp nhận miền chưa biết nhưng vẫn hành động, học và tự nuôi sống mình.",
    "mainScene": "Mai An Tiêm bước khỏi thuyền nhỏ lên bãi cát hoang; sau lưng là biển đen, trước mặt chỉ có hạt dưa đỏ do chim lạ đánh rơi.",
    "decisiveMoment": "An Tiêm cúi xuống gieo hạt trong khi con thuyền bỏ đi chỉ còn là chấm nhỏ.",
    "props": [
      "chim biển",
      "hạt dưa",
      "gói hành trang",
      "vách đá như mặt rồng"
    ],
    "palette": [
      "cát ngà",
      "đỏ dưa",
      "lam biển",
      "nắng sớm"
    ],
    "visualCreative": "Bãi cát trắng kéo dài thành khoảng trống tương lai; một hạt dưa đỏ là điểm neo duy nhất.",
    "doNotDraw": "Không biến An Tiêm thành kẻ ngây ngô; không cho phép màu giải quyết thay lao động.",
    "editorialNote": "Giữ khoảng trống lớn phía trước; không biến nhân vật thành kẻ liều lĩnh hài hước.",
    "sourceIds": [
      "S08"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-01",
    "number": 1,
    "roman": "I",
    "slug": "the-magician",
    "rwsName": "The Magician",
    "vietnameseTitle": "Kinh Dương Vương",
    "subtitle": "Người nối ba cõi",
    "keywords": "năng lực chủ động biến ý thành hình",
    "uprightMeaning": "Chủ động dùng kỹ năng, ý chí và nguồn lực đang có để tạo kết quả.",
    "reversedMeaning": "Tài năng bị dùng sai hướng, thiếu tập trung hoặc lời hứa lớn hơn năng lực thực tế.",
    "fullRetelling": [
      "Đế Minh đi tuần phương Nam, đến núi Ngũ Lĩnh thì gặp Vụ Tiên Nữ và sinh ra Lộc Tục. Thấy người con thông minh, ông muốn trao ngôi phương Bắc, nhưng Lộc Tục nhường lại cho anh và nhận cai quản miền Nam. Từ đó Lộc Tục xưng Kinh Dương Vương, đặt quốc hiệu Xích Quỷ.",
      "Kinh Dương Vương không chỉ đứng trên một miền đất. Ông đi xuống thủy phủ, kết duyên với Long Nữ, con gái Động Đình Quân, rồi sinh ra Sùng Lãm, sau là Lạc Long Quân. Dòng dõi ấy nối núi với nước, cõi người với cõi linh, mở đầu cho câu chuyện họ Hồng Bàng. Quyền lực ở đây không phải chiếc ngai đóng kín mà là khả năng đi qua ranh giới, gọi đúng tên từng miền và làm cho những chất liệu khác nhau cùng tham dự vào một trật tự mới.",
      "Trong lá Nhà Ảo Thuật, Kinh Dương Vương đứng tại nơi ba địa hình gặp nhau. Trống đồng, đất, lửa, gió và nước không phải đồ nghề thần bí vay mượn, mà là những lực ông phải điều hòa. Một tay chỉ lên trời để nhận mệnh, một tay chạm dòng nước để mở lối xuống thủy phủ. Điều kỳ ảo không nằm ở màn biểu diễn; nó nằm trong năng lực biến một đường biên thành một cuộc gặp, và biến cuộc gặp ấy thành khởi nguyên của cả một dòng truyện."
    ],
    "sourceStory": "Lộc Tục nhận cai quản phương Nam, xưng Kinh Dương Vương, kết duyên với Long Nữ và sinh Lạc Long Quân.",
    "tarotBridge": "The Magician được đọc như năng lực kết nối cõi, gọi tên nguồn lực và đưa chúng vào hành động có chủ ý.",
    "mainScene": "Kinh Dương Vương đứng giữa núi, đồng bằng và cửa thủy phủ; một tay nâng trống đồng, tay kia chạm dòng nước đang hóa rồng.",
    "decisiveMoment": "Bàn tay vua chạm nước, làm lộ ra một lối sáng xuống thủy phủ.",
    "props": [
      "trống đồng",
      "gậy lệnh",
      "rồng nước",
      "bốn biểu tượng của bốn nhà"
    ],
    "palette": [
      "đồng cổ",
      "xanh lục bảo",
      "đỏ son",
      "đen thủy phủ"
    ],
    "visualCreative": "Bốn vật biểu Tarot được Việt hóa thành đất, nước, lửa và gió quanh một trống đồng trung tâm.",
    "doNotDraw": "Không dùng bàn thờ pháp sư châu Âu, đũa phép hay ký hiệu giả cổ không có chức năng kể chuyện.",
    "editorialNote": "Bàn tay và bốn biểu tượng phải đọc rõ; tránh tư thế pháp sư phương Tây.",
    "sourceIds": [
      "S02"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-02",
    "number": 2,
    "roman": "II",
    "slug": "the-high-priestess",
    "rwsName": "The High Priestess",
    "vietnameseTitle": "Ma Cô",
    "subtitle": "Bó ngải dưới trăng giếng Việt",
    "keywords": "trực giác tĩnh lặng ẩn tri",
    "uprightMeaning": "Trực giác, điều chưa được nói ra và sự quan sát tĩnh trước khi hành động.",
    "reversedMeaning": "Bỏ qua tín hiệu bên trong, bí mật gây nhiễu hoặc im lặng quá lâu.",
    "fullRetelling": [
      "Khi ngôi đền cũ của vua Ân được sửa lại, một người con của họ Thôi được dẫn đến những tầng sâu của Giếng Việt. Trước đó, chàng từng gặp Ma Cô trong một hội lớn. Bà hiện ra dưới dáng người áo quần rách rưới, vô ý làm vỡ một vật quý rồi bị đám đông xua đánh. Chỉ mình chàng dừng lại cứu. Ma Cô không giải thích thân phận, chỉ trao một bó ngải và dặn giữ lấy.",
      "Về sau, chính thứ lá tưởng bình thường ấy giúp chàng cứu người, chữa cho một sinh linh mang dạng rắn trắng và mở đường đến thành quách ẩn dưới nước. Những gì ở trên mặt giếng chỉ là lớp đầu của thế giới; dưới đó còn có ký ức, món nợ ân tình và những quyền lực không thể nhận ra bằng áo mũ. Ma Cô xuất hiện lại, đưa người cần gặp đến, trao vật báo đáp rồi biến vào đêm, như thể bà chưa từng thuộc về quảng trường náo nhiệt ban ngày.",
      "Nữ Tư Tế vì thế mang gương mặt Ma Cô: người giữ tri thức bằng im lặng, thử lòng người bằng lớp cải trang và trao chìa khóa chỉ sau một hành động nhân hậu. Bà không cần phô diễn quyền lực. Bó ngải đặt ngang lòng, mặt giếng tròn phía sau và bóng thành dưới nước đủ nói rằng điều quan trọng nhất thường nằm ở tầng chưa được nhìn thấy."
    ],
    "sourceStory": "Trong Truyện Giếng Việt, Ma Cô cải trang, được cứu khỏi đám đông, trao ngải và trở thành mắt xích dẫn tới cõi ẩn dưới giếng.",
    "tarotBridge": "The High Priestess là trực giác, tri thức kín và khả năng nhìn xuyên bề ngoài; Ma Cô thể hiện cả ba mà không cần vay biểu tượng phương Tây.",
    "mainScene": "Ma Cô ngồi bên miệng giếng, khoác áo rách cải trang; bó ngải cứu phát sáng đặt ngang lòng, dưới mặt nước hiện một thành quách mờ.",
    "decisiveMoment": "Ma Cô đặt bó ngải vào tay người đã cứu mình, giữa lúc đám đông quay lưng.",
    "props": [
      "ngải cứu",
      "áo rách",
      "giếng tròn",
      "rắn trắng nhỏ",
      "bóng thành"
    ],
    "palette": [
      "chàm đêm",
      "bạc trăng",
      "xanh ngải",
      "một điểm đỏ son"
    ],
    "visualCreative": "Thành quách dưới giếng và quầng sáng của bó ngải được cô đọng thành một cảnh duy nhất.",
    "doNotDraw": "Không đội mũ giáo sĩ, không dùng hai cột Boaz–Jachin, không biến áo rách thành dấu hiệu thấp kém.",
    "editorialNote": "Thay biểu tượng huyền học chung bằng ngải cứu và lớp áo cải trang; Ma Cô là hình bóng duy nhất.",
    "sourceIds": [
      "S11"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "ADJUST",
    "imageStatusRaw": "CHỈNH",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-03",
    "number": 3,
    "roman": "III",
    "slug": "the-empress",
    "rwsName": "The Empress",
    "vietnameseTitle": "Âu Cơ",
    "subtitle": "Bọc trăm trứng giữa ruộng thiêng",
    "keywords": "nuôi dưỡng sinh sôi dồi dào",
    "uprightMeaning": "Nuôi dưỡng, sáng tạo, sự phong nhiêu và khả năng làm cho điều tốt đẹp lớn lên.",
    "reversedMeaning": "Cạn kiệt vì chăm người khác quá mức, trì trệ sáng tạo hoặc bao bọc quá chặt.",
    "fullRetelling": [
      "Lạc Long Quân, con của Kinh Dương Vương và Long Nữ, trị dân ở miền nước. Âu Cơ thuộc giống Tiên ở núi cao. Khi hai người gặp nhau, họ kết duyên rồi Âu Cơ sinh ra một bọc trăm trứng; từ trăm trứng nở thành trăm người con trai khỏe mạnh, không cần bú mớm mà lớn rất nhanh.",
      "Nhưng hai dòng giống không thể mãi ở cùng một nơi. Lạc Long Quân nói mình thuộc thủy tộc, Âu Cơ thuộc hỏa tộc, tập quán và cảnh giới khác nhau. Họ chia con: năm mươi theo cha xuống biển, năm mươi theo mẹ lên núi; khi có việc thì cùng gọi nhau, không được bỏ nhau. Người con trưởng theo Âu Cơ được tôn làm Hùng Vương, mở nước Văn Lang.",
      "Hoàng Hậu ở đây không phải người mẹ giữ mọi đứa con quanh mình. Âu Cơ sinh ra sự phong nhiêu rồi chấp nhận để nó phân nhánh. Bọc trứng là một khởi nguyên chung; núi và biển là hai con đường trưởng thành. Bà quỳ giữa ruộng thiêng, một phía là dãy núi, phía kia là cửa biển, còn trăm mầm sáng lan thành hoa văn quanh thân. Năng lực của The Empress là nuôi dưỡng đủ sâu để những sinh mệnh khác biệt có thể rời mình mà vẫn nhớ đường trở lại."
    ],
    "sourceStory": "Âu Cơ sinh bọc trăm trứng; trăm con chia năm mươi lên núi, năm mươi xuống biển; người con trưởng trở thành Hùng Vương.",
    "tarotBridge": "The Empress được đặt vào sự sinh thành, nuôi dưỡng và khả năng cho nhiều tương lai cùng lớn từ một gốc.",
    "mainScene": "Âu Cơ quỳ trên thảm lá giữa cánh đồng; bọc trăm trứng tỏa quầng sáng, nửa nền xa là núi, nửa kia là biển.",
    "decisiveMoment": "Âu Cơ mở hai cánh tay về hai phía núi–biển khi các dải mầm bắt đầu tách đường.",
    "props": [
      "bọc trứng",
      "lá chuối",
      "chim hạc",
      "đường núi và biển"
    ],
    "palette": [
      "kem trứng",
      "đỏ đất",
      "xanh rừng",
      "lam nước"
    ],
    "visualCreative": "Trăm người con được chuyển thành nhịp trăm mầm sáng để tránh cảnh minh họa đông và tĩnh.",
    "doNotDraw": "Không vẽ bà như mẫu hậu cung đình muộn; không xếp đủ một trăm trẻ thành hàng trang trí.",
    "editorialNote": "Không vẽ một trăm trẻ; dùng nhịp hoa văn trăm chấm hoặc trăm mầm.",
    "sourceIds": [
      "S02"
    ],
    "adaptationLevel": "LNCQ_CORE",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-04",
    "number": 4,
    "roman": "IV",
    "slug": "the-emperor",
    "rwsName": "The Emperor",
    "vietnameseTitle": "Hùng Vương đầu triều",
    "subtitle": "Trống đồng lập cõi",
    "keywords": "cấu trúc quyền hạn ổn định",
    "uprightMeaning": "Trật tự, trách nhiệm, ranh giới và năng lực lãnh đạo bằng cấu trúc rõ ràng.",
    "reversedMeaning": "Kiểm soát cứng nhắc, lạm quyền hoặc thiếu kỷ luật để giữ hệ thống đứng vững.",
    "fullRetelling": [
      "Sau cuộc chia con của Lạc Long Quân và Âu Cơ, người con trưởng được lập làm Hùng Vương. Nhà vua đặt quốc hiệu Văn Lang, đóng đô ở Phong Châu, chia đất thành mười lăm bộ và đặt các chức để cùng coi việc nước. Dưới trật tự ấy là một đời sống đang thành hình: nhà sàn dựng trên vùng ẩm, người dân trồng lúa, dùng tre gỗ, đi thuyền, xăm mình để hòa với sông nước, cùng chia công việc và nghi lễ.",
      "Trong truyền thuyết, việc lập nước không diễn ra bằng một tòa thành khép kín. Nó hiện lên như mạng lưới các miền được gọi tên, các vai trò được giao và những tập quán giúp cộng đồng đứng vững. Hùng Vương ngồi thấp trên bệ trống đồng, không cao vượt khỏi dân. Mười lăm đường khắc tỏa ra quanh ông, tới núi, đồng bằng, bến nước và làng sàn. Mỗi đường vừa là quyền quản trị vừa là lời nhắc rằng trung tâm chỉ có nghĩa khi giữ được liên hệ với các vùng.",
      "The Emperor của Hường Đông Tarot vì thế nói về cấu trúc có trách nhiệm. Biên giới mạnh không phải bức tường dày nhất, mà là trật tự khiến nhiều người biết mình đang cùng gánh một thế giới. Nhà vua dựng khuôn để sự sống tiếp tục, và chính khuôn ấy sẽ bị thử thách nếu người cầm quyền nhầm quyền lực với đặc ân."
    ],
    "sourceStory": "Hùng Vương lập Văn Lang, chia mười lăm bộ, đặt chức việc và gắn với lớp phong tục mở nước trong Truyện họ Hồng Bàng.",
    "tarotBridge": "The Emperor là nền tảng, luật lệ, giới hạn và trách nhiệm duy trì cấu trúc chung.",
    "mainScene": "Hùng Vương ngồi thấp trên bệ trống đồng; quanh bệ là mười lăm đường khắc tỏa ra các bộ, sau lưng là nhà sàn và ruộng nếp.",
    "decisiveMoment": "Nhà vua đặt bàn tay lên tâm trống, các tuyến làng–sông–núi đồng loạt sáng lên.",
    "props": [
      "trống đồng",
      "mười lăm tia bản đồ",
      "nhà sàn",
      "rìu đồng"
    ],
    "palette": [
      "đồng hun",
      "đỏ son",
      "nâu đất",
      "xanh rêu"
    ],
    "visualCreative": "Mười lăm bộ được biểu diễn bằng mười lăm tia địa hình quanh bệ trống đồng, không phải bản đồ hành chính hiện đại.",
    "doNotDraw": "Không dùng ngai rồng, long bào hay cung điện thuộc thời đại muộn hơn.",
    "editorialNote": "Không dùng ngai vàng kiểu cung đình muộn; nhấn tư thế chủ tọa và bản đồ cộng đồng.",
    "sourceIds": [
      "S02"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "ADJUST_MINOR",
    "imageStatusRaw": "CHỈNH NHẸ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-05",
    "number": 5,
    "roman": "V",
    "slug": "the-hierophant",
    "rwsName": "The Hierophant",
    "vietnameseTitle": "Già La Đồ Lê",
    "subtitle": "Gậy truyền pháp dưới cây đa",
    "keywords": "truyền thống học hỏi niềm tin",
    "uprightMeaning": "Truyền thống, người hướng dẫn, học qua một hệ thống và các giá trị chung.",
    "reversedMeaning": "Tự tìm con đường khác, chất vấn giáo điều hoặc không còn phù hợp với khuôn cũ.",
    "fullRetelling": [
      "Già La Đồ Lê đến ở chùa Phúc Nghiêm. Man Nương, một cô gái trong vùng, chăm lo việc chùa và giữ lòng kính ngưỡng. Từ một chuỗi sự việc kỳ lạ, nàng mang thai rồi sinh một đứa trẻ. Người thầy đưa đứa bé gửi vào thân một cây lớn bên sông, đồng thời trao cho Man Nương cây gậy có thể gọi nước khi hạn hán.",
      "Nhiều năm sau, bão làm cây đổ trôi về bến. Dân làng cố kéo không được, chỉ khi Man Nương chạm vào thì cây mới chịu theo. Từ thân cây, người ta tạc thành bốn pho tượng Pháp Vân, Pháp Vũ, Pháp Lôi, Pháp Điện. Một khối đá sáng trong thân cây trở thành vật linh, gắn câu chuyện riêng của Man Nương với đời sống cầu mưa và lễ hội của cả cộng đồng.",
      "The Hierophant không chỉ là người nói lời giáo huấn. Già La Đồ Lê hiện ra ở điểm khó hơn: tri thức được truyền đi sẽ tạo hệ quả, và người thầy phải gắn việc truyền pháp với trách nhiệm. Cây gậy, vòng nước và cây dung nối cá nhân với cộng đồng; bốn pho tượng cho thấy một trải nghiệm riêng có thể được chuyển thành nghi thức chung. Lá bài cần giữ cả vẻ linh thiêng lẫn độ phức tạp của truyện, không xóa đi những khoảng khó xử chỉ để tạo một vị thầy hoàn hảo."
    ],
    "sourceStory": "Truyện Man Nương kể về Già La Đồ Lê, Man Nương, cây gậy gọi nước, cây dung và bốn pho tượng Tứ Pháp.",
    "tarotBridge": "The Hierophant nằm ở sự truyền dạy, nghi thức và trách nhiệm khi tri thức cá nhân trở thành truyền thống cộng đồng.",
    "mainScene": "Già La Đồ Lê ngồi dưới cây đa, đầu gậy chạm đất thành vòng nước; hai người học quỳ thấp hơn, Man Nương chỉ là bóng phụ bên hiên.",
    "decisiveMoment": "Đầu gậy chạm đất khô và nước bật lên, trong khi bóng bốn pho tượng hiện trên thân cây.",
    "props": [
      "gậy",
      "lá đa",
      "chuỗi hạt mộc",
      "bản kinh cuộn",
      "vòng nước"
    ],
    "palette": [
      "nâu vỏ cây",
      "vàng cũ",
      "xanh lá",
      "trắng khói"
    ],
    "visualCreative": "Bốn vòng nước quanh đầu gậy báo trước Tứ Pháp; đây là cô đọng biên tập.",
    "doNotDraw": "Không dùng phẩm phục giáo sĩ châu Âu; không trình bày quan hệ thầy–trò như một cảnh hoàn toàn vô vấn đề.",
    "editorialNote": "Giữ bố cục người thầy hiện có nhưng khóa tên và đạo cụ; tránh phẩm phục giáo sĩ châu Âu.",
    "sourceIds": [
      "S13"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "ADJUST_MINOR",
    "imageStatusRaw": "CHỈNH NHẸ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-06",
    "number": 6,
    "roman": "VI",
    "slug": "the-lovers",
    "rwsName": "The Lovers",
    "vietnameseTitle": "Tân, Lang và nàng họ Lưu",
    "subtitle": "Ba số phận thành một vị trầu",
    "keywords": "gắn kết lựa chọn đồng thuận",
    "uprightMeaning": "Sự hòa hợp, lựa chọn theo giá trị và một quan hệ đòi hỏi tính chân thật.",
    "reversedMeaning": "Lệch giá trị, bất hòa hoặc né tránh một lựa chọn có trách nhiệm.",
    "fullRetelling": [
      "Tân và Lang là hai anh em giống nhau đến mức người ngoài thường nhầm. Sau khi cha mẹ mất, họ nương tựa nhau và cùng theo học một thầy. Người thầy có con gái. Nàng thử phân biệt hai người rồi chọn kết duyên với Tân. Từ ngày anh có vợ, Lang cảm thấy mình bị đẩy ra khỏi mối gắn bó cũ.",
      "Một lần người vợ nhận nhầm Lang là chồng, sự ngượng ngập khiến khoảng cách càng sâu. Lang bỏ đi, đến bờ sông không qua được, kiệt sức rồi hóa thành tảng đá vôi. Tân đi tìm em, tới đúng nơi ấy, dựa bên đá mà chết, hóa thành cây cau. Người vợ lại đi tìm chồng, ôm thân cau mà hóa thành dây trầu. Về sau vua Hùng qua đó, nghe chuyện, sai lấy lá trầu, quả cau và vôi nhai thử; màu đỏ hiện ra như máu của một lời thề. Từ đó trầu cau trở thành vật kết duyên và chứng giám.",
      "The Lovers không dừng ở tình yêu đôi lứa. Lá bài đặt ba người vào một lựa chọn làm thay đổi mọi quan hệ. Tình yêu tạo thành liên kết mới nhưng cũng làm lộ điều bị bỏ quên. Ba số phận hóa thành ba vật chỉ trọn nghĩa khi ở cùng nhau: vị cay, vị chát và vôi trắng kết thành sắc đỏ. Vẻ đẹp của lá phải giữ được cả sự hòa hợp lẫn giá phải trả cho một lựa chọn không được nói rõ."
    ],
    "sourceStory": "Hai anh em Tân–Lang và người vợ lần lượt hóa thành đá vôi, cây cau và dây trầu; vua Hùng lập tục trầu cau.",
    "tarotBridge": "The Lovers là lựa chọn, cam kết và hệ quả của việc tái cấu trúc các mối quan hệ.",
    "mainScene": "Tân ở tiền cảnh bên tảng đá vôi; Lang hóa cây cau bên trái, người vợ thành dây trầu ôm thân cây bên phải.",
    "decisiveMoment": "Người vợ ôm lấy thân cau mọc cạnh đá vôi, dây trầu bắt đầu quấn lên.",
    "props": [
      "cau",
      "trầu",
      "vôi trắng",
      "ba dải đỏ nối nhau"
    ],
    "palette": [
      "xanh trầu",
      "trắng vôi",
      "đỏ cau",
      "đêm tím"
    ],
    "visualCreative": "Ba dải đỏ nối ba hóa thân để người xem đọc được quan hệ trước khi đọc chi tiết.",
    "doNotDraw": "Không giản lược thành tam giác tình ái; không biến Lang thành kẻ tranh giành người vợ.",
    "editorialNote": "Gọi tên đủ ba người nhưng chỉ để Tân là tiêu điểm; hai hình còn lại có thể là hóa thân.",
    "sourceIds": [
      "S04"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-07",
    "number": 7,
    "roman": "VII",
    "slug": "the-chariot",
    "rwsName": "The Chariot",
    "vietnameseTitle": "Thánh Gióng",
    "subtitle": "Ngựa sắt vượt lũy tre",
    "keywords": "ý chí tiến lên tự chủ",
    "uprightMeaning": "Ý chí có định hướng, làm chủ các lực đối nghịch và tiến tới mục tiêu.",
    "reversedMeaning": "Mất phương hướng, cưỡng ép tiến độ hoặc các phần trong bạn đang kéo ngược nhau.",
    "fullRetelling": [
      "Ở làng Phù Đổng có một đứa trẻ lên ba vẫn chưa biết nói, biết cười. Khi quân Ân tràn tới, sứ giả đi khắp nơi tìm người cứu nước. Nghe tiếng rao, đứa trẻ bỗng cất lời, xin vua rèn ngựa sắt, roi sắt và áo giáp sắt. Từ đó cậu ăn bao nhiêu cũng không no, lớn nhanh đến mức dân làng phải cùng góp gạo nuôi.",
      "Ngày binh khí được đưa tới, Gióng vươn thành tráng sĩ, mặc giáp, nhảy lên ngựa. Ngựa phun lửa, roi sắt quét qua quân địch. Khi roi gãy, Gióng nhổ tre ven đường tiếp tục đánh. Giặc tan, chàng cưỡi ngựa lên núi, cởi giáp rồi bay về trời, không nhận thưởng. Những ao đầm, dấu chân ngựa và bụi tre cháy còn lại trở thành vết tích của cuộc đi qua.",
      "The Chariot là thời điểm một ý chí tìm được hướng và được cộng đồng trao đủ lực để chuyển động. Gióng không chiến thắng một mình: mỗi bát cơm của làng đều nằm trong vó ngựa. Nhưng khi mục tiêu hoàn tất, chàng không giữ lấy quyền lực vừa có. Đường chéo của ngựa sắt phải xé mở khung hình, còn cổng làng phía sau mở rộng — động lực cá nhân và sức nâng tập thể nhập thành một mũi tiến duy nhất."
    ],
    "sourceStory": "Đứa trẻ Phù Đổng vụt lớn, nhận ngựa và roi sắt, đánh giặc Ân, dùng tre khi roi gãy rồi bay về trời.",
    "tarotBridge": "The Chariot là ý chí được định hướng, kỷ luật vận động và sức mạnh của cộng đồng cùng đẩy một mục tiêu.",
    "mainScene": "Gióng cưỡi ngựa sắt lao chéo lên cao; bụi tre bật lửa theo vó ngựa, phía dưới là làng đang mở cổng.",
    "decisiveMoment": "Roi sắt gãy; Gióng lập tức nhổ bụi tre và tiếp tục tiến lên.",
    "props": [
      "ngựa sắt",
      "tre cháy",
      "cờ lệnh",
      "dấu chân hóa ao"
    ],
    "palette": [
      "đen sắt",
      "cam lửa",
      "xanh tre",
      "vàng trời"
    ],
    "visualCreative": "Các bát cơm góp sức được chuyển thành những vệt sáng hội tụ dưới vó ngựa.",
    "doNotDraw": "Không biến thành tranh chiến trận đông đặc; không bỏ vai trò nuôi dưỡng của dân làng.",
    "editorialNote": "Đường chuyển động phải dứt khoát; không thêm quá nhiều quân lính tranh tiêu điểm.",
    "sourceIds": [
      "S06"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-08",
    "number": 8,
    "roman": "VIII",
    "slug": "strength",
    "rwsName": "Strength",
    "vietnameseTitle": "Sơn Tinh",
    "subtitle": "Núi lớn lên trong tay",
    "keywords": "can đảm kiên nhẫn tự chủ",
    "uprightMeaning": "Can đảm dịu dàng, kiên nhẫn và sức mạnh nội tâm biết điều tiết bản năng.",
    "reversedMeaning": "Tự nghi ngờ, phản ứng bốc đồng hoặc cố tỏ ra mạnh khi bên trong đang kiệt sức.",
    "fullRetelling": [
      "Sơn Tinh tìm đến núi Tản Viên, học cách làm chủ địa hình và trở thành vị thần bảo hộ miền núi. Khi vua Hùng muốn chọn chồng cho Mỵ Nương, Sơn Tinh và Thủy Tinh cùng đến. Nhà vua đặt sính lễ khó tìm và hẹn ai mang đủ trước sẽ được đón nàng. Sơn Tinh đến sớm, rước Mỵ Nương về núi.",
      "Thủy Tinh đến sau, nổi giận dâng nước, gọi mưa gió đuổi theo. Nước sông tràn lên bao nhiêu, Sơn Tinh lại nâng núi và đắp nền cao bấy nhiêu. Dân vùng chân núi cùng chống lũ, giữ nhà, giữ ruộng. Thủy Tinh không thắng nhưng năm sau lại trở lại, khiến cuộc thử sức thành một chu kỳ không dứt.",
      "Sức Mạnh được đặt ở bàn tay Sơn Tinh đang giữ sườn núi, không phải ở cú đánh vào đối thủ. Con hổ bên chân nằm yên vì sự hiện diện vững chãi, không vì bị cưỡng phục. Trong một lớp truyện khác, Sơn Tinh còn chống lại những phép trấn áp núi sông từ bên ngoài, càng làm rõ phẩm chất bền bỉ của người giữ đất. Lá bài nói rằng sức mạnh sâu nhất là nâng nền từng lớp, đủ bình tĩnh để bảo vệ sự sống trước một lực lớn hơn mình và biết rằng thử thách có thể quay lại."
    ],
    "sourceStory": "Sơn Tinh thắng cuộc cầu hôn, chống nước Thủy Tinh dâng và trở thành hình tượng bảo hộ núi Tản Viên.",
    "tarotBridge": "Strength là sức bền, lòng điềm tĩnh và khả năng điều tiết lực thay vì phô trương bạo lực.",
    "mainScene": "Sơn Tinh đặt bàn tay lên sườn núi; từng lớp đất nâng cao như sóng đông cứng, một con hổ nằm yên bên chân.",
    "decisiveMoment": "Sơn Tinh đặt tay xuống; nền đất dưới dân làng nâng lên vừa trước khi sóng ập tới.",
    "props": [
      "núi bậc",
      "hổ",
      "gậy đá",
      "mây mưa phía xa"
    ],
    "palette": [
      "xanh rừng",
      "nâu đá",
      "vàng đất",
      "xám bão"
    ],
    "visualCreative": "Hổ phục dưới tay và các tầng núi nâng như sóng đông cứng là biểu tượng Tarot hóa.",
    "doNotDraw": "Không vẽ cuộc đấu tay đôi; không để Mỵ Nương thành chiến lợi phẩm trang trí.",
    "editorialNote": "Giữ nét bình tĩnh; tránh biến lá thành cảnh đấu tay đôi với Thủy Tinh.",
    "sourceIds": [
      "S14"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-09",
    "number": 9,
    "roman": "IX",
    "slug": "the-hermit",
    "rwsName": "The Hermit",
    "vietnameseTitle": "Dương Không Lộ",
    "subtitle": "Người chài bỏ lưới, tìm đường Không",
    "keywords": "chiêm nghiệm ẩn cư minh triết",
    "uprightMeaning": "Lùi lại để suy ngẫm, tìm sự thật riêng và học từ trải nghiệm đã sống.",
    "reversedMeaning": "Cô lập quá lâu, trốn tránh thế giới hoặc chưa tìm được tiếng nói bên trong.",
    "fullRetelling": [
      "Dương Không Lộ sinh trong một gia đình làm nghề chài lưới. Ông từng lênh đênh theo sông nước, biết rõ nhịp thủy triều và sự bấp bênh của một đời sống gửi mình cho dòng chảy. Đến một lúc, ông bỏ nghề cá, mặc áo vải, ăn chay và xuất gia. Cùng Nguyễn Giác Hải, ông tìm nơi vắng để tu tập, rời tiếng chợ và những đòi hỏi của danh lợi.",
      "Truyền thuyết kể Không Lộ có thể đi trên nước, vượt những khoảng cách người thường không vượt được và để lại dấu ấn trong việc dựng chùa, đúc chuông, truyền dạy. Nhưng trước mọi phép lạ là một quyết định âm thầm: người chài tự đặt lưới xuống và bước khỏi đời sống quen thuộc. Cuối hành trình, ông để lại lời kệ và đi vào tĩnh lặng; thân phận cá nhân tan dần trong ký ức của người sau.",
      "Ẩn Sĩ mang gương mặt Không Lộ ở đúng bước chuyển ấy. Chiếc lưới cũ nằm lại trên bờ; cây gậy chạm mặt nước tạo một đường sáng vừa đủ cho một bước. Xa hơn không có con đường vạch sẵn. Ánh đèn của ông không chiếu rực cả thế giới, chỉ soi điều cần thấy trong hiện tại. Sự cô độc ở đây không phải trốn chạy cộng đồng, mà là khoảng lặng cần thiết để một người nghe lại tiếng gọi của mình trước khi đem điều học được trở về."
    ],
    "sourceStory": "Truyện Dương Không Lộ và Nguyễn Giác Hải kể người xuất thân nghề chài bỏ lưới đi tu, ẩn cư, có năng lực kỳ dị và để lại truyền thừa.",
    "tarotBridge": "The Hermit nằm ở việc rời đời sống quen, thu ánh sáng vào bên trong và tìm một con đường không có sẵn.",
    "mainScene": "Dương Không Lộ đứng một mình ở mép sông đêm; lưới chài đã đặt lại trên bờ, đầu gậy chạm nước mở một đường sáng vừa đủ cho một bước.",
    "decisiveMoment": "Không Lộ đặt lưới xuống bờ và bước chân đầu tiên lên mặt nước tối.",
    "props": [
      "lưới bỏ lại",
      "gậy mộc",
      "áo vải",
      "đường sáng trên nước",
      "bóng núi"
    ],
    "palette": [
      "lam đêm",
      "vàng đèn",
      "nâu sợi",
      "bạc sương"
    ],
    "visualCreative": "Đường sáng trên nước và lưới bỏ lại là biểu tượng cô đọng, không phải chi tiết nguyên văn.",
    "doNotDraw": "Không biến phép thuật thành màn biểu diễn; không vẽ nhà sư như ẩn sĩ châu Âu cầm đèn lồng kiểu Gothic.",
    "editorialNote": "Dùng khoảnh khắc bỏ lưới làm dấu nhận diện; tránh tạo hình ẩn sĩ Gothic hoặc phô diễn phép thuật.",
    "sourceIds": [
      "S17"
    ],
    "adaptationLevel": "LNCQ_TUC_BIEN_ADAPTATION",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-10",
    "number": 10,
    "roman": "X",
    "slug": "wheel-of-fortune",
    "rwsName": "Wheel of Fortune",
    "vietnameseTitle": "Thủy Tinh",
    "subtitle": "Vòng nước trở lại",
    "keywords": "chu kỳ bước ngoặt thời vận",
    "uprightMeaning": "Chu kỳ đổi chiều, cơ hội mới và những yếu tố lớn hơn kế hoạch cá nhân.",
    "reversedMeaning": "Trì hoãn, lặp lại một vòng cũ hoặc chống lại thay đổi không thể tránh.",
    "fullRetelling": [
      "Thủy Tinh đến cầu hôn Mỵ Nương cùng lúc với Sơn Tinh. Cả hai đều có phép khiến vua Hùng khó chọn, nên nhà vua đặt sính lễ và hẹn người đến trước. Sơn Tinh mang đủ trước, đưa Mỵ Nương về núi. Khi Thủy Tinh tới, lễ cưới đã đi xa.",
      "Không chấp nhận mất phần mình muốn, Thủy Tinh gọi gió, dâng sông, mở những dòng nước lớn đuổi theo. Sơn Tinh nâng đất và chống giữ. Nước cao, núi cao; sức nước cạn, Thủy Tinh rút. Nhưng thất bại không khép lại câu chuyện. Mỗi năm nước lại về, như một bánh xe quay đúng vết cũ. Dân làng học cách nhìn mây, đánh dấu mực lũ, gia cố nhà và đưa lương thực lên cao.",
      "Ở Bánh Xe Số Phận, Thủy Tinh không đơn thuần là kẻ ác. Ông là lực biến động không chịu nằm yên trong ý muốn của con người. Vành bánh xe chìm nửa dưới sóng, mang dấu của bốn mùa và những cột nước qua năm tháng. Người xem không được hứa rằng mình sẽ điều khiển cả vòng quay; câu hỏi đúng là phần nào đang trở lại, điều gì phải buông và nền nào cần được nâng trước khi chu kỳ tiếp theo tới."
    ],
    "sourceStory": "Sau khi thua cuộc cầu hôn, Thủy Tinh dâng nước đánh Sơn Tinh; cuộc xung đột trở lại hằng năm.",
    "tarotBridge": "Wheel of Fortune là chu kỳ, biến động ngoài kiểm soát và năng lực thích nghi khi vòng quay trở lại.",
    "mainScene": "Thủy Tinh xoay bánh xe đồng chìm nửa trong sóng; quanh vành là bốn mùa, nhà cửa nổi rồi chìm theo vòng nước.",
    "decisiveMoment": "Thủy Tinh xoay vành đồng; các mực nước cũ đồng loạt sáng trên cột làng.",
    "props": [
      "bánh xe đồng",
      "rồng nước",
      "vòng mùa",
      "cột mốc lũ"
    ],
    "palette": [
      "xanh bão",
      "đồng tối",
      "trắng bọt",
      "đỏ cảnh báo"
    ],
    "visualCreative": "Bánh xe đồng dưới nước tích hợp dấu mùa và mốc lũ qua nhiều năm.",
    "doNotDraw": "Không dùng vòng hoàng đạo phương Tây; không coi lũ lụt chỉ là phông nền đẹp.",
    "editorialNote": "Thủy Tinh là chủ thể duy nhất; Sơn Tinh chỉ được gợi bằng dãy núi xa.",
    "sourceIds": [
      "S14"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-11",
    "number": 11,
    "roman": "XI",
    "slug": "justice",
    "rwsName": "Justice",
    "vietnameseTitle": "Tô Lịch Giang Thần / Long Đỗ",
    "subtitle": "Hốt vàng trên dòng không thể yểm",
    "keywords": "công bằng sự thật hệ quả",
    "uprightMeaning": "Công bằng, trách nhiệm, hệ quả và quyết định dựa trên sự thật.",
    "reversedMeaning": "Thiên lệch, né trách nhiệm hoặc thông tin quan trọng chưa được nhìn nhận.",
    "fullRetelling": [
      "Khi Cao Biền dựng La Thành, ông xem địa thế, đo sông núi và tin rằng mọi linh khí đều có thể được đặt dưới bùa phép. Một ngày tháng sáu, nước dâng cao. Thuyền nhẹ của Biền đi vào nhánh sông ôm lấy thành thì gặp một cụ già râu tóc bạc phơ đang tắm giữa dòng. Cụ tự xưng là Tô Lịch, nói nhà mình ở ngay trong sông, rồi vỗ nước làm mù trời và biến mất.",
      "Buổi sớm khác, gió nổi, sóng cuộn, mây phủ kín. Trên mặt nước hiện một linh thần cao lớn, áo vàng, mũ tím, tay cầm hốt vàng, sáng rực cả khoảng trời. Đêm ấy thần vào mộng, xưng là Long Đỗ, đứng đầu các thần đất. Thần không đến xin phép, cũng không gây chiến; thần chỉ nói mình đến nhìn người mới xây thành trên miền đất vốn đã có chủ linh thiêng.",
      "Cao Biền vẫn lập đàn, lấy vàng, bạc, đồng, thép làm bùa, niệm chú suốt ba ngày đêm để yểm. Sấm sét và mưa gió nổi lên. Tất cả vật trấn áp rơi xuống, hóa thành tro bụi. Biền hiểu rằng quyền lực của mình có giới hạn.",
      "Justice vì thế mang hình một linh thần, không phải quan tòa hay nhân vật lịch sử. Hốt vàng dựng thẳng là trục cân; hai dòng nước ôm thành là hai vế. Công lý ở đây là thế quân bình sâu hơn mệnh lệnh của người cai trị: đất, nước và ký ức bản địa không chấp nhận bị biến thành tài sản của kẻ mạnh. Phán quyết không cần lưỡi gươm; nó hiện ra khi bùa chú tự hóa tro trước một trật tự không thể cưỡng ép."
    ],
    "sourceStory": "Truyện Sông Tô Lịch kể Cao Biền gặp cụ già Tô Lịch rồi linh thần Long Đỗ trên mặt nước; phép yểm bằng kim loại thất bại và hóa tro trong giông sét.",
    "tarotBridge": "Justice là giới hạn chính đáng của quyền lực và sự tái lập quân bình giữa người xây thành với linh mạch đã có trước mình.",
    "mainScene": "Linh thần đứng trên mặt sông giữa mây gió, áo vàng, mũ tím, tay giữ hốt vàng thẳng như trục cân; hai dòng nước ôm lấy La Thành, bùa trấn áp phía dưới đang hóa tro.",
    "decisiveMoment": "Linh thần giữ hốt vàng bất động trên mặt nước, trong khi toàn bộ bùa trấn áp phía dưới cùng hóa tro.",
    "props": [
      "hốt vàng",
      "hai dòng nước cân xứng",
      "mây giông",
      "bùa kim loại hóa tro",
      "vòng La Thành"
    ],
    "palette": [
      "vàng thần",
      "tím đêm",
      "xanh sông sâu",
      "trắng sét"
    ],
    "visualCreative": "Hốt vàng được dùng như trục cân và hai nhánh sông như hai đĩa cân; đây là cấu trúc Tarot hóa.",
    "doNotDraw": "Không dùng chân dung Trưng Trắc hay bất kỳ nhân vật lịch sử nào; không vẽ cân pháp đình, tượng nữ thần Hy-La hoặc thần sông như quái vật.",
    "editorialNote": "Nhân vật là linh thần hư ảo của sông và đất, không dùng chân dung một nhân vật lịch sử; tránh cân pháp đình phương Tây.",
    "sourceIds": [
      "S18"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-12",
    "number": 12,
    "roman": "XII",
    "slug": "the-hanged-man",
    "rwsName": "The Hanged Man",
    "vietnameseTitle": "Từ Đạo Hạnh nhập định",
    "subtitle": "Bóng người đảo trong hồ núi",
    "keywords": "tạm dừng buông đổi góc nhìn",
    "uprightMeaning": "Tạm dừng, buông quyền kiểm soát và nhìn vấn đề từ một góc đảo ngược.",
    "reversedMeaning": "Hy sinh vô ích, trì hoãn kéo dài hoặc bám vào góc nhìn cũ.",
    "fullRetelling": [
      "Từ Đạo Hạnh mang nặng mối thù vì cha bị hại. Ông tìm học phép, tụng chú và dồn ý chí vào việc trả thù Đại Điên. Khi đối phương chết, mục tiêu từng chi phối đời ông bỗng mất đi, để lại một khoảng trống không dễ lấp. Đạo Hạnh quay sâu hơn vào việc tu tập, đối diện câu hỏi về cái tâm thật phía sau quyền năng và sân hận.",
      "Truyền thuyết kể ông đạt chỗ thấy biết giản dị: đói thì ăn, khát thì uống; chân lý không còn là vật ở xa để cưỡng đoạt. Nhưng ông lại chọn bước vào một vòng đời khác, gửi thân tái sinh làm Dương Hoán, sau trở thành vua Lý Thần Tông. Thân cũ để lại trong động, thân mới mang theo những món nợ chưa dứt. Khi nhà vua mắc bệnh kỳ lạ, Nguyễn Minh Không — người từng có duyên với Đạo Hạnh — được gọi đến hóa giải.",
      "Người Treo Ngược không cần bị treo bằng dây. Đạo Hạnh ngồi thẳng bên hồ, nhưng bóng dưới nước đảo ngược: con người cũ, tham vọng cũ và thân phận mới soi nhau. Lá bài giữ khoảnh khắc ông dừng việc điều khiển thế giới để chấp nhận nhìn từ phía khác. Buông bỏ không xóa hậu quả; nó mở ra khả năng thấy món nợ nào vẫn đang đi theo mình."
    ],
    "sourceStory": "Từ Đạo Hạnh trả thù, tu tập, đạt ngộ, chọn tái sinh làm Dương Hoán/Lý Thần Tông; Nguyễn Minh Không về sau hóa giải bệnh nghiệp.",
    "tarotBridge": "The Hanged Man là đình chỉ ý chí cũ, đảo điểm nhìn và tự nguyện đi qua một trạng thái chuyển tiếp.",
    "mainScene": "Từ Đạo Hạnh ngồi nhập định trên mỏm đá; thân người thẳng nhưng bóng trong hồ lại treo ngược, quanh đầu là vòng dây mây chưa thắt.",
    "decisiveMoment": "Đạo Hạnh nhìn xuống và thấy bóng mình đảo ngược đội vương miện của đời sau.",
    "props": [
      "hồ gương",
      "dây mây",
      "chuông đá",
      "bóng đảo"
    ],
    "palette": [
      "xám đá",
      "xanh hồ",
      "vàng nhạt",
      "tím sương"
    ],
    "visualCreative": "Hình treo ngược chỉ xuất hiện trong phản chiếu hồ để tránh cảnh hành hình không thuộc truyện.",
    "doNotDraw": "Không treo nhân vật bằng cổ hoặc chân; không kể giác ngộ như phần thưởng xóa sạch nghiệp quả.",
    "editorialNote": "Dùng phản chiếu để tránh hình ảnh hành hình; đây là chuyển thể biểu tượng, không phải nguyên văn truyện.",
    "sourceIds": [
      "S16"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "NEW_CONCEPT",
    "imageStatusRaw": "Ý TƯỞNG MỚI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-13",
    "number": 13,
    "roman": "XIII",
    "slug": "death",
    "rwsName": "Death",
    "vietnameseTitle": "Xương Cuồng / Mộc Tinh",
    "subtitle": "Vỏ thần cây rạn mở",
    "keywords": "kết thúc chuyển hóa tái sinh",
    "uprightMeaning": "Một giai đoạn kết thúc để chuyển hóa và nhường chỗ cho điều mới.",
    "reversedMeaning": "Kháng cự thay đổi, kéo dài điều đã hết vai trò hoặc sợ mất bản sắc cũ.",
    "fullRetelling": [
      "Ngày xưa có cây chiên đàn khổng lồ, bóng phủ một vùng. Khi cây chết, tinh khí không tan mà hóa thành Xương Cuồng, một mộc tinh dữ. Dân quanh vùng sợ hãi, phải nộp người làm vật hiến tế. Nhâm Ngao từng tìm cách trừ hại nhưng thất bại và chết, khiến nỗi sợ càng bám sâu; một tập tục bạo lực dần được coi như điều không thể thay đổi.",
      "Nhiều năm sau, Du Văn Tường không đối đầu theo lối cũ. Ông quy tụ người, dùng tiếng nhạc, trò diễn và mưu kế kéo Xương Cuồng ra khỏi nơi ẩn náu. Khi con quái bị cuốn vào nhịp lễ tưởng như dành để phụng thờ nó, cộng đồng đồng loạt đổi thế. Xương Cuồng bị diệt, việc hiến người chấm dứt. Lễ đài từng nuôi sợ hãi trở thành nơi chứng kiến một trật tự cũ bị bẻ gãy.",
      "Death đặt trọng tâm không phải vào một xác chết, mà vào cái chết của chính cơ chế đòi mạng người. Thân cây nứt mở; bên trong không có bộ xương kiểu phương Tây, chỉ có khoảng tối đang thoát ra và một mầm trắng được trả lại ánh sáng. Đây là sự kết thúc không thể quay ngược: cộng đồng không còn phải sống như trước. Mầm mới chỉ có thể xuất hiện sau khi họ dám gọi điều quen thuộc nhưng tàn bạo là thứ phải chết."
    ],
    "sourceStory": "Mộc Tinh/Xương Cuồng từ cây chiên đàn đòi người hiến tế; sau thất bại của Nhâm Ngao, Du Văn Tường dùng mưu và trò diễn để diệt nó.",
    "tarotBridge": "Death là kết thúc dứt khoát của một trật tự đã hóa quái vật để sự sống được giải phóng.",
    "mainScene": "Thân cây khổng lồ đứng giữa lễ đài bỏ hoang; vỏ mục nứt ra, bên trong lộ mầm cây trắng và đàn hạc bay lên.",
    "decisiveMoment": "Nhịp trống lễ đổi tiết tấu; dân làng cùng kéo dây, làm thân Xương Cuồng rạn vỡ.",
    "props": [
      "cây chiên đàn",
      "vết nứt",
      "dây diễn trò",
      "hạc trắng",
      "mầm non"
    ],
    "palette": [
      "đen gỗ",
      "trắng hạc",
      "xanh mầm",
      "đỏ lễ đài"
    ],
    "visualCreative": "Mầm trắng trong thân cây và đàn hạc bay ra là hình ảnh tái sinh biên tập.",
    "doNotDraw": "Không dùng tử thần cưỡi ngựa hay đầu lâu làm chủ thể; không mỹ lệ hóa hiến tế.",
    "editorialNote": "Lá còn tranh luận; thử silhouette Xương Cuồng ở kích thước thẻ trước khi khóa.",
    "sourceIds": [
      "S03"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "EXPERIMENT",
    "imageStatusRaw": "THỬ NGHIỆM TRƯỚC",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-14",
    "number": 14,
    "roman": "XIV",
    "slug": "temperance",
    "rwsName": "Temperance",
    "vietnameseTitle": "Lang Liêu",
    "subtitle": "Nước, gạo và lá thành một lễ vật",
    "keywords": "điều độ hòa hợp kiên nhẫn",
    "uprightMeaning": "Điều hòa, vừa đủ, kết hợp khác biệt và tiến triển bền vững.",
    "reversedMeaning": "Quá đà, mất cân bằng hoặc trộn nhiều thứ mà chưa tìm được tỷ lệ phù hợp.",
    "fullRetelling": [
      "Khi vua Hùng muốn chọn người nối ngôi, các hoàng tử được lệnh tìm lễ vật quý để dâng tổ tiên. Những người anh đi khắp nơi săn sơn hào hải vị. Lang Liêu, con của người mẹ ít được sủng ái, nghèo hơn và không có thế lực, chỉ biết nhìn vào thứ gần mình nhất: hạt gạo do dân làm ra.",
      "Trong giấc mộng, chàng được chỉ rằng không gì quý bằng gạo, vì gạo nuôi sống con người. Lang Liêu chọn nếp, đậu, thịt và lá, làm bánh vuông tượng đất, bánh tròn tượng trời. Nguyên liệu đơn sơ được ngâm, giã, gói và nấu đúng độ; không thứ nào lấn át thứ nào. Vua nếm bánh, hiểu ý nghĩa, chọn Lang Liêu kế vị. Từ đó bánh trở thành lễ vật nhớ nguồn trong ngày đầu năm.",
      "Tiết Chế nằm trong đôi tay đang phối hợp, không phải hai chén nước giống hệt biểu tượng ngoại lai. Dòng nước đi vào hạt gạo, gạo vào lá, lửa làm chín nhưng không thiêu cháy. Hình tròn và hình vuông cân nhau mà không hòa lẫn. Lang Liêu chứng minh rằng sự vừa đủ không nghèo nàn: khi con người hiểu bản chất của từng thứ và đặt chúng đúng tỷ lệ, cái bình thường có thể trở thành hình ảnh của cả trời đất."
    ],
    "sourceStory": "Lang Liêu dùng gạo nếp làm bánh tròn và bánh vuông, được vua Hùng chọn nối ngôi và lập tục bánh chưng–bánh giầy.",
    "tarotBridge": "Temperance là phối hợp đúng tỷ lệ, làm chủ quá trình và biến các yếu tố giản dị thành một chỉnh thể.",
    "mainScene": "Lang Liêu quỳ bên cối đá, một tay rót nước vào gạo nếp, tay kia gấp lá; bánh tròn và bánh vuông cân bằng phía trên.",
    "decisiveMoment": "Lang Liêu ép nếp và đậu vào khuôn lá; bánh tròn và bánh vuông hiện như hai quầng cân nhau.",
    "props": [
      "gạo nếp",
      "lá dong",
      "cối đá",
      "bánh tròn và vuông"
    ],
    "palette": [
      "xanh lá",
      "trắng gạo",
      "nâu đất",
      "vàng ấm"
    ],
    "visualCreative": "Dòng chuyển nước–gạo–lá–lửa tạo vòng tuần hoàn thay cho động tác rót giữa hai cốc.",
    "doNotDraw": "Không biến thành tranh mâm cỗ tĩnh; không dùng thiên thần rót nước.",
    "editorialNote": "Bố cục có dòng chuyển từ nước sang gạo sang bánh; tránh bày biện thành mâm cỗ tĩnh.",
    "sourceIds": [
      "S07"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP",
    "imageStatusRaw": "GIỮ",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-15",
    "number": 15,
    "roman": "XV",
    "slug": "the-devil",
    "rwsName": "The Devil",
    "vietnameseTitle": "Trọng Thủy; Mỵ Châu hỗ trợ",
    "subtitle": "Sợi đỏ buộc vào nỏ thần",
    "keywords": "ràng buộc cám dỗ bóng tối",
    "uprightMeaning": "Sự ràng buộc, ham muốn, thói quen và quyền lực mà ta vô tình trao đi.",
    "reversedMeaning": "Nhìn ra chiếc xích, lấy lại quyền lựa chọn và bắt đầu thoát khỏi lệ thuộc.",
    "fullRetelling": [
      "Sau khi An Dương Vương xây được Loa Thành và có nỏ thần, Triệu Đà nhiều lần đánh không thắng. Ông bèn xin kết thông gia, cho con là Trọng Thủy cưới Mỵ Châu và ở rể. Trong đời sống gần gũi, Trọng Thủy dò hỏi bí mật giữ thành. Mỵ Châu tin chồng, cho xem cơ cấu nỏ. Chàng làm một lẫy giả để đánh tráo, rồi xin về thăm cha.",
      "Trước khi đi, Trọng Thủy hỏi nếu binh biến thì tìm nàng bằng cách nào. Mỵ Châu nói sẽ rắc lông ngỗng trên đường. Khi Triệu Đà đem quân trở lại, nỏ mất phép, thành vỡ. Trọng Thủy theo dấu lông tìm đến bờ biển nhưng chỉ gặp xác vợ, vì nàng đã bị cha chém sau lời phán của Rùa Vàng. Chàng mang thi thể về chôn, rồi vì đau đớn và ám ảnh, nhìn thấy bóng Mỵ Châu dưới giếng mà lao xuống chết.",
      "Ác Quỷ không cần một con quỷ có sừng. Sợi đỏ quấn giữa tay Trọng Thủy và lẫy nỏ đủ cho thấy tham vọng, lừa dối, tình cảm và bổn phận đã trói vào nhau. Chàng vẫn có thể buông sợi dây trước khi đánh tráo, nhưng không làm. Xiềng xích của lá bài được tạo từ những lựa chọn lặp lại đến mức người trong cuộc tưởng mình không còn lựa chọn nào khác."
    ],
    "sourceStory": "Trọng Thủy cưới Mỵ Châu, đánh tráo lẫy nỏ, theo dấu lông ngỗng sau khi Cổ Loa thất thủ và chết trong giếng vì ám ảnh.",
    "tarotBridge": "The Devil là sự trói buộc bởi ham muốn, bí mật, lừa dối và việc tự giao quyền lựa chọn cho một mục tiêu ám ảnh.",
    "mainScene": "Trọng Thủy ở tiền cảnh nắm sợi chỉ đỏ quấn vào cơ cấu nỏ; Mỵ Châu ở phía sáng hơn nhưng mắt bị che bởi lông ngỗng.",
    "decisiveMoment": "Trọng Thủy giữ lẫy thật trong lòng bàn tay, còn Mỵ Châu quay lưng tin cậy.",
    "props": [
      "nỏ thần",
      "chỉ đỏ",
      "lông ngỗng",
      "mắt lớn",
      "vòng Cổ Loa"
    ],
    "palette": [
      "đỏ huyết dụ",
      "đen than",
      "đồng tối",
      "trắng lông"
    ],
    "visualCreative": "Sợi đỏ quấn vào cơ cấu nỏ thay cho xiềng xích và hình quỷ ngoại lai.",
    "doNotDraw": "Không đổ toàn bộ tội lỗi lên Mỵ Châu; không lãng mạn hóa hoạt động gián điệp và phản bội.",
    "editorialNote": "Ảnh hiện tại đã kể đúng truyện; phân cấp Trọng Thủy là chủ thể, Mỵ Châu là nhân vật phụ.",
    "sourceIds": [
      "S12"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP_IMAGE_LOCK_NAME",
    "imageStatusRaw": "GIỮ ẢNH, KHÓA TÊN",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-16",
    "number": 16,
    "roman": "XVI",
    "slug": "the-tower",
    "rwsName": "The Tower",
    "vietnameseTitle": "An Dương Vương",
    "subtitle": "Vòng thành gãy dưới sét",
    "keywords": "đổ vỡ thức tỉnh tái cấu trúc",
    "uprightMeaning": "Cấu trúc sai nền bị phá vỡ, sự thật xuất hiện đột ngột và buộc phải tái thiết.",
    "reversedMeaning": "Trì hoãn khủng hoảng, thay đổi âm ỉ hoặc tránh một sự thật đã quá rõ.",
    "fullRetelling": [
      "An Dương Vương chiếm đất Văn Lang, dựng nước Âu Lạc và xây thành ở Cổ Loa. Nhưng thành cứ xây ban ngày lại đổ ban đêm. Rùa Vàng xuất hiện, chỉ ra những thế lực phá hoại và giúp nhà vua hoàn tất tòa thành xoắn. Trước khi đi, Rùa cho một chiếc móng làm lẫy nỏ; nhờ nỏ ấy, quân Triệu Đà không thể tiến vào.",
      "Được bảo vệ quá lâu, nhà vua tin rằng tường thành và vũ khí đủ thay cho cảnh giác. Ông nhận lời cho Mỵ Châu kết duyên với Trọng Thủy. Bí mật nỏ bị lấy. Khi quân Triệu tràn đến, An Dương Vương vẫn ngồi chơi cờ, chờ nỏ thần phát uy; đến lúc bắn mới biết lẫy đã bị tráo. Loa Thành sụp từ bên trong trước khi quân địch phá được bức tường ngoài.",
      "Nhà vua đưa Mỵ Châu chạy về biển. Rùa Vàng hiện lên, gọi đúng kẻ đã để lộ đường. An Dương Vương quay lại chém con rồi theo Rùa xuống nước. The Tower bắt lấy khoảnh khắc mão rơi khỏi đầu, nỏ gãy và những vòng thành đổ dây chuyền. Tai họa không đến như sét trời vô cớ: nó là kết quả của việc biến một công cụ bảo vệ thành ảo tưởng bất khả chiến bại, rồi trao niềm tin mà không còn kiểm chứng."
    ],
    "sourceStory": "An Dương Vương xây Cổ Loa nhờ Rùa Vàng, có nỏ thần, mất bí mật vì cuộc hôn nhân chính trị và thất thủ trước Triệu Đà.",
    "tarotBridge": "The Tower là cấu trúc sụp đổ khi nền tin cậy và nhận thức đã bị khoét rỗng.",
    "mainScene": "An Dương Vương choáng ở tiền cảnh, mão rơi khỏi đầu; phía sau, Loa Thành bị sét hình móng rùa đánh vỡ và đổ theo hiệu ứng dây chuyền.",
    "decisiveMoment": "Nhà vua bóp cò; dây nỏ buông rỗng và vòng thành đầu tiên nứt sau lưng.",
    "props": [
      "mão rơi",
      "nỏ gãy",
      "thành xoắn",
      "tia sét móng rùa"
    ],
    "palette": [
      "xám bão",
      "đỏ gạch",
      "đồng xanh",
      "trắng sét"
    ],
    "visualCreative": "Tia sét hình móng rùa là dấu hiệu phán xét biên tập, không phải nguyên nhân literal của việc thành đổ.",
    "doNotDraw": "Không kể thất bại như lỗi duy nhất của một phụ nữ; không dùng tháp đá châu Âu.",
    "editorialNote": "Giữ Cổ Loa nhưng thêm một hình bóng vua lớn; cảnh đổ phải có nguyên nhân thị giác rõ.",
    "sourceIds": [
      "S12"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "CHỈNH / VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-17",
    "number": 17,
    "roman": "XVII",
    "slug": "the-star",
    "rwsName": "The Star",
    "vietnameseTitle": "Mẫu Liễu Hạnh",
    "subtitle": "Sao trời mở lối về phủ Mẫu",
    "keywords": "hy vọng chữa lành dẫn đường",
    "uprightMeaning": "Hy vọng có cơ sở, chữa lành, cảm hứng và kết nối lại với hướng đi dài hạn.",
    "reversedMeaning": "Mất niềm tin, so sánh khiến mình cạn sức hoặc không thấy tiến bộ nhỏ đang diễn ra.",
    "fullRetelling": [
      "Các truyền bản về Mẫu Liễu Hạnh không hoàn toàn giống nhau, nhưng cùng mở bằng một cuộc giáng trần. Nàng vốn thuộc thiên giới, thường được gọi là Quỳnh Hoa. Sau khi làm vỡ chén ngọc của vua cha, nàng phải xuống cõi người. Ở trần gian, nàng sống một đời có gia đình, nếm niềm vui và mất mát như người thế tục rồi trở về trời khi duyên đời kết thúc.",
      "Nhưng cõi người không còn là nơi xa lạ. Liễu Hạnh xin được trở xuống, có khi một mình, có khi cùng Quế Nương và Thị Nương. Nàng đi qua quán nước, đường núi, bến sông và làng ruộng; hiện ra dưới nhiều dáng để thử lòng người, đối thơ với kẻ sĩ, nâng đỡ người thành tâm và trừng phạt kẻ cậy thế làm điều bất kính. Trong những lần giáng trần ấy, hình ảnh một công chúa bị đày dần chuyển thành một vị Mẫu tự lựa chọn đường đi giữa trời và đất.",
      "Người dân lập phủ thờ, gọi nàng là Thánh Mẫu và gửi vào nghi lễ những ước vọng rất đời thường: sức khỏe, bình an, sinh kế, gia đình và khả năng đứng dậy sau biến cố. Câu chuyện không khép ở một lần trở về trời; nó tiếp tục trong mối liên hệ giữa Mẫu với những cộng đồng còn gọi tên bà.",
      "The Star đặt Mẫu Liễu Hạnh dưới bầu trời vừa qua giông. Một tay Mẫu giữ nhành liễu, tay kia mở dải sao xuống ruộng nước và mái phủ. Bà không rót phép màu để xóa sạch khổ đau. Bà trao một phương hướng: con người vẫn có thể nối lại trời, đất và đời sống sau khi thế giới cũ sụp đổ. Vì Mẫu Liễu Hạnh không thuộc Lĩnh Nam chích quái, lá này được ghi rõ là lớp tín ngưỡng Việt mở rộng, được đưa vào theo chủ ý của bộ bài."
    ],
    "sourceStory": "Truyền thuyết dân gian kể Liễu Hạnh là tiên nữ giáng trần nhiều lần, sống đời người, chu du, thử lòng và trợ giúp dân chúng; tín ngưỡng thờ Mẫu đặt bà ở vị trí trung tâm.",
    "tarotBridge": "The Star là hy vọng, chữa lành và phương hướng sau The Tower; Mẫu Liễu Hạnh nối thiên giới với nhu cầu sống cụ thể của con người.",
    "mainScene": "Mẫu Liễu Hạnh đứng giữa ranh giới trời và đất, một tay nâng nhành liễu, một tay mở dải sao xuống đường làng, ruộng nước và mái phủ; hai tiên nữ chỉ là bóng phụ phía sau.",
    "decisiveMoment": "Sau cơn giông, Mẫu mở bàn tay; dải sao đầu tiên chạm mái phủ và lan thành đường sáng qua ruộng nước.",
    "props": [
      "nhành liễu",
      "dải sao",
      "mây hồng",
      "mái phủ",
      "quạt và dải lụa đỏ"
    ],
    "palette": [
      "xanh đêm",
      "trắng sao",
      "đỏ phủ",
      "vàng ấm"
    ],
    "visualCreative": "Dải sao đi từ tay Mẫu xuống phủ, ruộng và đường làng là biểu tượng Tarot hóa, không phải một cảnh truyền thuyết cố định.",
    "doNotDraw": "Không trình bày Mẫu như nhân vật thuộc LNCQ; không khỏa thân, không dùng bình nước RWS, không biến hầu đồng thành phông nền kỳ exotic.",
    "editorialNote": "Ghi rõ Mẫu Liễu Hạnh thuộc lớp tín ngưỡng Việt mở rộng, không thuộc LNCQ; tránh khỏa thân, bình nước và ngôi sao phương Tây khổng lồ.",
    "sourceIds": [
      "S20",
      "S22"
    ],
    "adaptationLevel": "VIET_FOLK_EXPANDED_ADAPTATION",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-18",
    "number": 18,
    "roman": "XVIII",
    "slug": "the-moon",
    "rwsName": "The Moon",
    "vietnameseTitle": "Mỵ Châu",
    "subtitle": "Đường lông ngỗng trong sương",
    "keywords": "mơ hồ tiềm thức trực giác",
    "uprightMeaning": "Mơ hồ, tiềm thức, nỗi sợ và hành trình đi qua vùng chưa đủ ánh sáng.",
    "reversedMeaning": "Ảo tưởng dần tan, sự thật hé lộ hoặc lo âu làm méo cách nhìn.",
    "fullRetelling": [
      "Mỵ Châu lớn lên trong Loa Thành, nơi nỏ thần khiến mọi cuộc tấn công đều thất bại. Khi Trọng Thủy đến làm rể, nàng tin cuộc hôn nhân đã biến kẻ thù thành người nhà. Trong sự gần gũi ấy, nàng cho chồng xem lẫy nỏ. Trước lúc chàng rời đi, hai người hẹn rằng nếu loạn lạc, nàng sẽ rắc lông ngỗng để chàng tìm theo.",
      "Quân Triệu trở lại. Nỏ không còn linh nghiệm. Mỵ Châu theo cha chạy về phương Nam, vừa đi vừa rắc lông như lời hẹn, không biết mỗi dấu sáng lại mở đường cho quân đuổi. Đến bờ biển, An Dương Vương cầu Rùa Vàng cứu. Rùa chỉ kẻ ngồi sau ngựa là giặc. Mỵ Châu hiểu ra quá muộn, xin nếu lòng mình ngay thì thân hóa ngọc, nếu có ý phản thì hóa bụi. Nhà vua chém con; máu nàng chảy xuống biển, trai nuốt lấy thành ngọc.",
      "The Moon nằm trong vùng ánh sáng vừa đủ để thấy dấu hiệu nhưng không đủ để hiểu nó. Lông ngỗng là tình yêu đối với Mỵ Châu, là chỉ điểm đối với quân địch. Hai mặt trăng trên trời và dưới nước không cho biết đâu là thật. Lá bài không kết tội sự tin cậy; nó hỏi khi cảm xúc, sợ hãi và thông tin thiếu hụt cùng dẫn đường, ta đang đọc dấu hiệu bằng điều gì."
    ],
    "sourceStory": "Mỵ Châu để lộ nỏ, rắc lông ngỗng cho Trọng Thủy tìm, bị Rùa Vàng chỉ ra và bị An Dương Vương chém ở bờ biển.",
    "tarotBridge": "The Moon là mơ hồ, phóng chiếu và nguy cơ đọc một dấu hiệu theo điều mình muốn tin.",
    "mainScene": "Mỵ Châu đi một mình giữa sương, tay cầm lông ngỗng phát sáng; hai lối tách đôi giữa Cổ Loa và bờ biển, dưới nước là mắt rùa mở hé.",
    "decisiveMoment": "Mỵ Châu thả chiếc lông cuối cùng, dưới nước mắt Rùa Vàng vừa mở.",
    "props": [
      "lông ngỗng",
      "hai lối",
      "mặt trăng kép",
      "mắt rùa",
      "nỏ chìm"
    ],
    "palette": [
      "bạc lạnh",
      "tím sương",
      "xanh nước",
      "đỏ rất nhạt"
    ],
    "visualCreative": "Hai lối trong sương và hai mặt trăng biểu hiện hai cách hiểu đối nghịch của cùng dấu lông.",
    "doNotDraw": "Không đóng khung nàng như kẻ phản quốc đơn giản; không dùng chó sói hay tôm càng theo RWS.",
    "editorialNote": "Mỵ Châu được phép là nhân vật phụ ở The Devil và chủ thể ở The Moon; hai khoảnh khắc phải khác hoàn toàn.",
    "sourceIds": [
      "S12"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "ADJUST",
    "imageStatusRaw": "CHỈNH",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-19",
    "number": 19,
    "roman": "XIX",
    "slug": "the-sun",
    "rwsName": "The Sun",
    "vietnameseTitle": "Man Nương",
    "subtitle": "Nước bật lên sau hạn",
    "keywords": "sáng rõ sinh lực thành công",
    "uprightMeaning": "Niềm vui rõ ràng, sinh lực, thành công và sự tự tin không cần che giấu.",
    "reversedMeaning": "Ánh sáng bị mây che, kỳ vọng quá cao hoặc khó cho phép mình tận hưởng thành quả.",
    "fullRetelling": [
      "Man Nương đến chùa Phúc Nghiêm phụng sự Già La Đồ Lê. Sau một biến cố kỳ lạ, nàng sinh một đứa trẻ và trao cho vị sư. Đứa bé được gửi vào thân cây dung lớn bên sông. Trước khi rời đi, Già La Đồ Lê trao Man Nương cây gậy, dặn rằng khi hạn hán hãy cắm xuống đất để gọi nước.",
      "Năm ấy nắng kéo dài, ruộng nứt, người và vật đều kiệt. Man Nương đem gậy chạm đất; nước bật lên, chảy về đồng. Sau này bão làm cây dung đổ. Dân làng kéo mãi không được, nhưng khi Man Nương đặt tay vào, cây theo nàng lên bờ. Gỗ được chia tạc thành bốn pho tượng của mây, mưa, sấm, chớp. Khối đá sáng nằm trong cây trở thành linh thạch. Câu chuyện riêng của nàng đi vào lễ cầu mưa, thành niềm vui sống còn của cả vùng.",
      "The Sun giữ khoảnh khắc nước đầu tiên trào qua đất nứt. Ánh sáng không chỉ từ mặt trời trên cao mà còn phản lên từ dòng nước dưới chân Man Nương. Trẻ nhỏ và trâu chạy về phía ruộng xanh ở hậu cảnh. Đây là sự sáng rõ sau thời kỳ khô hạn: điều từng ẩn trong cây, trong đá và trong lời truyền dạy nay trở thành nguồn sống mọi người đều có thể nhìn thấy và chia sẻ."
    ],
    "sourceStory": "Man Nương nhận gậy gọi nước; cây dung chứa đứa trẻ trở thành gỗ tạc Tứ Pháp và linh thạch phục vụ tín ngưỡng cầu mưa.",
    "tarotBridge": "The Sun là sinh lực trở lại, chân tướng được soi rõ và niềm vui chung sau thiếu thốn.",
    "mainScene": "Man Nương chạm cây gậy xuống đất khô; nước sáng trào quanh chân, trẻ nhỏ và trâu ở hậu cảnh chạy về phía ruộng vừa xanh lại.",
    "decisiveMoment": "Gậy chạm đất, tia nước đầu tiên xuyên qua vết nứt và phản sáng lên gương mặt Man Nương.",
    "props": [
      "gậy",
      "đất nứt",
      "dòng nước",
      "cây dung",
      "trẻ nhỏ"
    ],
    "palette": [
      "vàng rực",
      "xanh non",
      "nâu đất",
      "trắng nước"
    ],
    "visualCreative": "Vòng nước sáng như mặt trời thứ hai dưới chân nối thủy và hỏa trong một khoảnh khắc.",
    "doNotDraw": "Không dùng em bé cưỡi ngựa trắng theo RWS; không biến hạn hán thành phông nền vô hại.",
    "editorialNote": "Một hình bóng Man Nương và một hành động chính; trẻ em, trâu và lễ hội chỉ là lớp phản ứng.",
    "sourceIds": [
      "S13"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-20",
    "number": 20,
    "roman": "XX",
    "slug": "judgement",
    "rwsName": "Judgement",
    "vietnameseTitle": "Sứ Thanh Giang / Rùa Vàng",
    "subtitle": "Tiếng gọi từ đáy thành",
    "keywords": "thức tỉnh đánh giá lời gọi",
    "uprightMeaning": "Thức tỉnh, tổng kết quá khứ và đáp lại một lời gọi có ý nghĩa.",
    "reversedMeaning": "Tự phán xét quá nặng, trì hoãn quyết định hoặc chưa rút được bài học cốt lõi.",
    "fullRetelling": [
      "An Dương Vương xây thành ở Cổ Loa nhưng cứ đắp xong lại đổ. Nhà vua lập đàn cầu, Rùa Vàng từ nước hiện lên, nhận lời ở lại giúp. Ban đêm, Rùa chỉ cho vua thấy những lực phá hoại ẩn sau vẻ bình thường của núi, quán và người. Những nút thắt ấy bị gọi tên và tháo gỡ, thành mới đứng vững.",
      "Khi rời đi, Rùa trao một chiếc móng để làm lẫy nỏ. Nhưng lời giúp luôn kèm điều kiện: vật thiêng chỉ có nghĩa khi người giữ nó còn tỉnh táo và có đức. Về sau nỏ bị đánh tráo, Cổ Loa thất thủ. Ở bờ biển, An Dương Vương lại gọi Rùa. Vị thần không che chở vô điều kiện; Rùa chỉ thẳng vào sự thật mà nhà vua không muốn thấy — dấu vết của quân địch nằm ngay trên đường chạy trốn.",
      "Phán Xét vì thế không phải phần thưởng sau tiếng kèn. Đó là tiếng gọi từ nước sâu khiến những điều bị giấu phải nổi lên, và mỗi người phải đáp lại lựa chọn của mình. Các vòng sóng chạm vào dân, vua, nỏ gãy và thành đổ như cùng một hồ sơ hậu quả. Rùa Vàng không xử thay con người; thần chỉ đặt tên cho sự thật, để không ai còn có thể nói mình không biết."
    ],
    "sourceStory": "Rùa Vàng giúp An Dương Vương nhận diện lực phá thành, xây Cổ Loa, trao móng làm lẫy nỏ và về sau chỉ ra sự phản bội ở bờ biển.",
    "tarotBridge": "Judgement là thức tỉnh, sự thật được gọi tên và trách nhiệm trả lời cho chuỗi lựa chọn đã qua.",
    "mainScene": "Rùa Vàng khổng lồ trồi khỏi nước nhìn thẳng; tiếng gọi thành vòng sóng chạm vào những người quỳ quanh chiếc nỏ gãy.",
    "decisiveMoment": "Rùa Vàng ngẩng đầu khỏi nước; vòng sóng chạm nỏ gãy và mọi nhân vật cùng quay lại nhìn.",
    "props": [
      "rùa vàng",
      "vòng sóng",
      "móng rùa",
      "nỏ gãy",
      "người thức tỉnh"
    ],
    "palette": [
      "đồng vàng",
      "xanh sâu",
      "trắng sóng",
      "đỏ cảnh tỉnh"
    ],
    "visualCreative": "Vòng sóng đánh thức nhiều lớp thời gian cùng lúc là cấu trúc Tarot hóa.",
    "doNotDraw": "Không thêm thiên thần thổi kèn hay người chết bật nắp quan tài; không coi vật thiêng là bảo đảm vô điều kiện.",
    "editorialNote": "Rùa Vàng đủ mạnh làm chủ thể phi nhân loại; hạ độ tương phản của các nhân vật người.",
    "sourceIds": [
      "S12"
    ],
    "adaptationLevel": "LNCQ_CORE_ADAPTATION",
    "imageStatus": "KEEP_IMAGE_LOCK_NAME",
    "imageStatusRaw": "GIỮ ẢNH, KHÓA TÊN",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  },
  {
    "id": "major-21",
    "number": 21,
    "roman": "XXI",
    "slug": "the-world",
    "rwsName": "The World",
    "vietnameseTitle": "Việt Thường và thiên hạ",
    "subtitle": "Bạch trĩ khép vòng bốn phương",
    "keywords": "hoàn thành toàn vẹn mở rộng",
    "uprightMeaning": "Hoàn tất một chu kỳ, hội nhập kinh nghiệm và bước vào phạm vi rộng hơn.",
    "reversedMeaning": "Việc gần xong nhưng còn mắt xích chưa khép, hoặc ngại rời một chặng đã quen.",
    "fullRetelling": [
      "Trong lớp truyện họ Hồng Bàng, Việt Thường là một trong những miền thuộc thế giới Văn Lang. Đến thời nhà Chu ở phương Bắc, sứ giả Việt Thường đi qua nhiều đất, mang theo một con chim trĩ trắng làm lễ vật. Đường xa đến mức lời nói phải qua nhiều lần phiên dịch mới hiểu nhau.",
      "Sứ giả giải thích phong tục phương Nam và nói rằng nhiều năm trời đất yên, không có tai biến lớn, hẳn ở phương xa có bậc hiền khiến bốn phương được hòa. Vì thế Việt Thường đến, không phải như kẻ dâng mình cho một đế chế, mà như một miền nhận biết sự an hòa và chủ động lập quan hệ. Triều Chu tiếp lễ. Khi đoàn sứ chuẩn bị về, họ đã quên lối cũ sau hành trình dài. Người Chu cấp những cỗ xe chỉ hướng Nam. Đoàn đi suốt một năm, qua nhiều miền, cuối cùng trở lại đất mình.",
      "The World khép vòng ở chính cuộc trở về ấy. “Thiên hạ” không được vẽ thành quả địa cầu nằm trong tay một người. Nó là mạng quan hệ dưới trời: núi giữ đường chân mây, sông mở lối, làng và bến nối nhau, mỗi miền có tiếng nói và phong tục riêng nhưng vẫn có thể nhận ra nhau. Chim trĩ trắng ở tâm là lời chào; xe chỉ Nam là ký ức phương hướng; vòng tròn được tạo bởi đường đi và đường về. Hoàn tất không phải nuốt mọi nơi vào một trung tâm, mà là biết mình đang ở đâu trong một trật tự rộng lớn và trở về với hiểu biết đã được mở rộng."
    ],
    "sourceStory": "Sứ giả Việt Thường mang chim trĩ trắng đến nhà Chu, phải qua nhiều lớp phiên dịch và được cấp xe chỉ Nam để tìm đường về; Truyện họ Hồng Bàng đặt Việt Thường trong mười lăm bộ.",
    "tarotBridge": "The World là hoàn tất, hội nhập và tìm đúng vị trí trong thiên hạ như một trật tự quan hệ dưới trời — đây là cách đọc biên tập phương Đông, không phải mô tả bản đồ nguyên văn.",
    "mainScene": "Đoàn sứ Việt Thường trở về trên xe chỉ Nam, nâng chim trĩ trắng; đường đi cuộn thành vòng qua núi, sông, đồng bằng, bến và biển dưới cùng một vòm trời.",
    "decisiveMoment": "Đoàn xe chỉ Nam vượt đèo cuối cùng; chim trĩ trắng xoay đầu về phía cánh đồng Việt Thường.",
    "props": [
      "chim trĩ trắng",
      "xe chỉ Nam",
      "trống đồng phương hướng",
      "núi-sông-đồng-biển",
      "đường đi và đường về"
    ],
    "palette": [
      "trắng chim",
      "đồng sáng",
      "xanh ngọc",
      "đỏ phương Nam"
    ],
    "visualCreative": "Bố cục vòng gồm núi–sông–đồng–biển và các tuyến giao tiếp là cosmogram biên tập; nguồn truyện không mô tả một sơ đồ đồng tâm.",
    "doNotDraw": "Không quả địa cầu, không bản đồ Mercator, không biên giới quốc gia hiện đại, không vòng hoàng đạo và không trang trí pan-Asian vô chức năng.",
    "editorialNote": "Cosmogram thiên hạ là diễn giải biên tập: không quả địa cầu, Mercator, biên giới hiện đại hay vòng hoàng đạo.",
    "sourceIds": [
      "S02",
      "S07",
      "S08",
      "S14",
      "S21"
    ],
    "adaptationLevel": "EDITORIAL_FANTASY_INSPIRED",
    "imageStatus": "REDRAW",
    "imageStatusRaw": "VẼ LẠI",
    "contentStatus": "text-ready",
    "culturalReviewStatus": "pending"
  }
]);

/** Tra theo slug URL — /la-bai/<slug>/ */
export const bySlug = Object.freeze(
  Object.fromEntries(MAJOR_ARCANA.map((c) => [c.slug, c])),
);

/** Tra theo số lá 0–21 */
export const byNumber = Object.freeze(
  Object.fromEntries(MAJOR_ARCANA.map((c) => [c.number, c])),
);

/** Mẫu alt text sinh từ dữ liệu, không viết tay ở từng bề mặt.
 *  Mô tả CẢNH CHÍNH đã chốt, không mô tả tranh chưa vẽ. */
export function altTextFor(card) {
  return `${card.vietnameseTitle} — ${card.subtitle}`;
}

/** Nhãn nguồn hiển thị cho người đọc phổ thông. */
export const ADAPTATION_LABEL = Object.freeze({
  LNCQ_CORE: "Lĩnh Nam chích quái — phần chính",
  LNCQ_CORE_ADAPTATION: "Dựa trên Lĩnh Nam chích quái, có biên tập khoảnh khắc",
  LNCQ_TUC_BIEN_ADAPTATION: "Dựa trên phần Tục Biên, có chuyển thể",
  VIET_FOLK_EXPANDED_ADAPTATION: "Tín ngưỡng Việt mở rộng ngoài Lĩnh Nam chích quái",
  EDITORIAL_FANTASY_INSPIRED: "Cảnh mới sáng tác, chỉ mượn motif",
});
