/*
 * Lớp soi chiếu cho 78 lá.
 *
 * Đây là nội dung biên tập của Hường Đông, không phải dữ liệu bói định mệnh và
 * không phải mô tả lâm sàng. 22 lá Ẩn Chính có mẫu hình riêng; 56 lá Ẩn Phụ
 * ghép địa hạt của bốn nhà với chặng phát triển của 14 cấp bài. Nhờ đó mọi lá
 * có một góc nhìn riêng mà vẫn giữ được ngữ pháp chung của cả bộ.
 */

const MAJOR = Object.freeze({
  "the-fool": ["Người dám bước khỏi bờ quen", "Tự do có thể che giấu sự thiếu chuẩn bị; thận trọng cũng có thể che giấu nỗi sợ bắt đầu.", "Nếu nhân vật trong lá quay lại nhìn bạn, họ sẽ hỏi bạn đang mang theo hành trang thừa nào?", "Chọn một bước nhỏ có rủi ro chấp nhận được và xác định điều bạn sẽ kiểm tra sau bước ấy."],
  "the-magician": ["Người gọi đúng tên nguồn lực", "Năng lực dễ biến thành màn trình diễn khi bạn cần người khác xác nhận mình có quyền bắt đầu.", "Công cụ nào trên bàn khiến bạn chú ý nhất, và kỹ năng nào trong đời bạn đang bị bỏ không?", "Chọn một mục tiêu, một công cụ và một mốc hoàn thành có thể nhìn thấy."],
  "the-high-priestess": ["Người giữ cánh cửa của điều chưa nói", "Im lặng có thể là lắng nghe sâu, nhưng cũng có thể là cách trì hoãn một sự thật cần được gọi tên.", "Điều gì trong bức tranh dường như biết câu trả lời nhưng chưa muốn nói ngay?", "Ghi riêng điều bạn biết bằng dữ kiện và điều bạn chỉ đang cảm thấy; đừng ép hai cột thành một."],
  "the-empress": ["Người làm cho sự sống lớn lên", "Chăm sóc người khác có thể che khuất sự cạn kiệt hoặc mong muốn được cần đến.", "Trong khu vườn này, điều gì đang được nuôi quá nhiều và điều gì đang thiếu đất?", "Dành một nguồn lực cụ thể cho điều cần lớn lên, đồng thời đặt một giới hạn để không tự rút cạn mình."],
  "the-emperor": ["Người dựng khung và giữ ranh giới", "Trật tự bảo vệ ta, nhưng đôi khi được dùng để né sự bất định hoặc kiểm soát người khác.", "Chiếc ngai đang nâng đỡ nhân vật hay đang giữ họ mắc kẹt?", "Viết lại một quy tắc: nó bảo vệ giá trị nào, áp dụng cho ai và khi nào cần được xem xét lại?"],
  "the-hierophant": ["Người trao truyền một con đường", "Truyền thống có thể là trí nhớ chung, cũng có thể thành chiếc khuôn khiến câu hỏi mới không được cất lời.", "Bạn muốn hỏi người thầy trong lá điều gì mà học trò xung quanh chưa dám hỏi?", "Giữ lại một nguyên tắc đã được kiểm chứng và chủ động chất vấn một điều bạn chỉ làm vì quen."],
  "the-lovers": ["Người đứng trước lựa chọn có giá trị", "Sự hòa hợp bên ngoài có thể che một phần bản thân đang bị hy sinh để được chấp nhận.", "Hai phía trong hình đang thật sự chọn nhau, hay đang chờ một điều chưa được nói?", "Gọi tên giá trị không thể thương lượng và một điều bạn sẵn sàng cùng người khác điều chỉnh."],
  "the-chariot": ["Người cầm cương hai lực trái chiều", "Tiến nhanh có thể che việc các phần trong bạn chưa thống nhất về hướng đi.", "Nếu hai lực kéo rẽ sang hai bên, người cầm cương đang dùng ý chí hay sự thấu hiểu để giữ đường?", "Tách mục tiêu khỏi động cơ: xác nhận cả hai đang đưa bạn về cùng một hướng trước khi tăng tốc."],
  "strength": ["Người thuần hóa bằng sự hiện diện", "Vẻ mạnh mẽ có thể che nỗi sợ yếu đuối; sự dịu dàng cũng có thể biến thành nhẫn nhịn quá mức.", "Con vật trong hình cần bị khuất phục hay cần được lắng nghe?", "Nhận diện một phản ứng bản năng, tạo khoảng dừng và chọn cách đáp lại không làm tổn thương mình hay người khác."],
  "the-hermit": ["Người mang đèn đi vào khoảng lặng", "Ở một mình có thể giúp nghe rõ tiếng bên trong, nhưng cũng có thể là cách tránh quan hệ và phản hồi.", "Ngọn đèn chỉ soi một bước; vì sao bạn vẫn đòi nhìn thấy cả con đường?", "Dành một khoảng yên có điểm kết thúc, rồi mang điều nhận ra trở lại một cuộc trò chuyện hoặc quyết định thật."],
  "wheel-of-fortune": ["Người học cách đứng trong vòng đổi thay", "Tin vào vận may có thể làm ta quên phần mình chịu trách nhiệm; cố kiểm soát mọi thứ lại phủ nhận điều nằm ngoài tay.", "Trong vòng quay này, điều gì đang lặp lại vì hoàn cảnh và điều gì lặp lại vì lựa chọn?", "Phân ba cột: điều kiểm soát được, điều có thể ảnh hưởng và điều cần chấp nhận."],
  "justice": ["Người đặt sự thật lên hai đĩa cân", "Mong muốn mình đúng có thể đội lốt công bằng; tự trách quá mức cũng làm chiếc cân lệch.", "Bằng chứng nào đang nằm ngoài khung hình vì bạn chưa muốn đặt nó lên cân?", "Kiểm tra nguồn, nghe phía bị ảnh hưởng và chọn hệ quả bạn sẵn sàng chịu trách nhiệm."],
  "the-hanged-man": ["Người tự nguyện đổi góc nhìn", "Buông kiểm soát khác với buông xuôi; hy sinh có ý nghĩa khác với trì hoãn bằng dáng vẻ cao thượng.", "Khi thế giới đảo chiều, điều từng là trở ngại bỗng để lộ điều gì?", "Tạm dừng một phản ứng quen, thử diễn đạt vấn đề từ góc nhìn đối lập rồi đặt ngày quyết định."],
  "death": ["Người khép cửa để một mùa khác bắt đầu", "Nỗi sợ kết thúc thường bám vào bản sắc cũ hơn là vào chính sự việc đã hết vai trò.", "Điều gì trong cảnh vẫn tiếp tục sống dù một hình thức đang qua đi?", "Làm một nghi thức đời thường để khép chặng cũ: hoàn tất, bàn giao, cất đi hoặc nói lời kết thúc rõ ràng."],
  "temperance": ["Người tìm tỷ lệ sống được giữa hai phía", "Ôn hòa không có nghĩa xóa khác biệt; cân bằng giả tạo thường chỉ là né xung đột.", "Hai dòng nước đang hòa nhau hay một bên đang âm thầm lấn át?", "Thử một tỷ lệ mới trong thời gian ngắn, quan sát kết quả rồi điều chỉnh thay vì đòi hoàn hảo ngay."],
  "the-devil": ["Người nhìn thấy chiếc xích mình đang góp phần giữ", "Điều bị chối bỏ thường quay lại dưới dạng ám ảnh, đổ lỗi hoặc một ham muốn khó gọi tên.", "Chiếc xích thật sự bị khóa, hay người đeo vẫn có khả năng tháo nó?", "Gọi tên lợi ích ngắn hạn khiến bạn duy trì thói quen này và tìm một hỗ trợ thực tế để lấy lại quyền chọn."],
  "the-tower": ["Người sống sót khi cấu trúc sai nền sụp xuống", "Ta thường bảo vệ hình thức quen thuộc ngay cả khi nó không còn bảo vệ sự sống bên trong.", "Tia sét phá hủy điều gì, và đồng thời làm lộ sự thật nào?", "Ưu tiên an toàn, xác minh sự thật, giữ phần còn dùng được và chỉ tái thiết sau khi hiểu nền cũ đã sai ở đâu."],
  "the-star": ["Người dám tin lại sau biến động", "Hy vọng có thể nuôi sống ta; nhưng hình ảnh tương lai đẹp cũng có thể giúp né nỗi đau hiện tại.", "Dòng nước nào đang trở về đất và dòng nào được trao cho điều lớn hơn bản thân?", "Chọn một dấu hiệu tiến bộ nhỏ có thể đo được và chăm nó đều thay vì chờ cảm hứng lớn."],
  "the-moon": ["Người đi qua miền chưa đủ sáng", "Sợ hãi dễ lấp khoảng trống dữ kiện bằng câu chuyện quen thuộc; trực giác cũng có thể bị nhuộm bởi ký ức cũ.", "Trong bóng tối này, điều gì là tín hiệu thật và điều gì chỉ là hình dáng do ánh sáng méo đi?", "Trì hoãn kết luận, kiểm tra một giả định và tìm thêm một nguồn thông tin độc lập."],
  "the-sun": ["Người cho phép mình hiện diện trọn vẹn", "Niềm vui đôi khi khiến ta bất an vì không còn điều gì để phòng thủ; tự tin cũng có thể trượt thành phô trương.", "Bạn có thể đón ánh sáng mà không cần chứng minh mình xứng đáng với nó không?", "Ghi nhận thành quả, chia sẻ công lao đúng chỗ và dành thời gian thật để tận hưởng."],
  "judgement": ["Người nghe tiếng gọi từ toàn bộ câu chuyện đời mình", "Tự phán xét dễ giả làm sự thức tỉnh; tiếng gọi thật không tước đi lòng trắc ẩn với phiên bản cũ.", "Điều gì đang được gọi dậy, và điều gì chỉ đang lặp lại lời kết tội cũ?", "Rút một bài học cụ thể từ quá khứ, sửa điều còn sửa được và đáp lại bằng một cam kết hiện tại."],
  "the-world": ["Người hội nhập những phần từng rời rạc", "Không chịu kết thúc đôi khi bắt nguồn từ sợ mất vai trò đã giúp mình được công nhận.", "Vòng tròn đang đóng lại để giam giữ hay để tạo một đường biên trọn vẹn?", "Đánh dấu điều đã hoàn tất, cảm ơn những phần đã góp sức và chọn ý thức điều bạn mang sang chu kỳ kế tiếp."],
});

const SUITS = Object.freeze({
  wands: { pattern: "Tiếng nói của động lực và khả năng hình dung điều chưa thành hình", unseen: "Khi bị đẩy quá xa, lửa sáng tạo có thể thành bốc đồng, tự ái hoặc chạy theo cảm hứng mà rời mặt đất.", sense: "ngọn lửa, hướng chuyển động hoặc khoảng không mà nhân vật đang muốn bước tới", action: "một thử nghiệm nhỏ biến cảm hứng thành việc làm" },
  cups: { pattern: "Tiếng nói của cảm xúc, giá trị và cách ta kết nối", unseen: "Khi không được gọi tên, cảm xúc có thể thành lý tưởng hóa, lệ thuộc hoặc khiến ta gánh tâm trạng của người khác.", sense: "dòng nước, chiếc chén và khoảng cách giữa các nhân vật", action: "một lời nói thật có ranh giới và lòng tôn trọng" },
  swords: { pattern: "Tiếng nói của tư duy, ngôn ngữ và năng lực phân định", unseen: "Khi chiếm toàn bộ sân khấu, lý trí có thể thành phán xét, phòng thủ hoặc dùng lời đúng để gây ra điều sai.", sense: "hướng của lưỡi kiếm, ánh mắt và điều đang bị chia cắt", action: "một dữ kiện cần kiểm tra hoặc một câu cần nói rõ hơn" },
  pentacles: { pattern: "Tiếng nói của cơ thể, nguồn lực và điều có thể chạm đo", unseen: "Khi nỗi sợ thiếu thốn dẫn đường, sự ổn định có thể thành bám giữ, trì trệ hoặc đo mọi giá trị bằng thành quả.", sense: "bàn tay, mặt đất, vật dụng và nhịp lao động trong cảnh", action: "một thay đổi nhỏ trong thời gian, tiền bạc, sức lực hoặc thói quen" },
});

const RANKS = Object.freeze({
  "Át": ["hạt giống vừa xuất hiện", "Bạn đang đón nhận khả năng mới hay đòi nó phải bảo đảm kết quả trước khi bắt đầu?"],
  "Hai": ["hai phía bắt đầu nhận ra nhau", "Bạn đang thật sự lựa chọn hay chỉ giữ cả hai phía để khỏi mất gì?"],
  "Ba": ["ý định bước vào quan hệ và thành hình", "Điều gì chỉ có thể lớn lên khi bạn cho phép phản hồi hoặc hợp tác?"],
  "Bốn": ["một cấu trúc tạm ổn định", "Nền tảng này đang nâng đỡ bạn hay đã trở thành chiếc khung quá chật?"],
  "Năm": ["sự xáo trộn làm lộ điểm yếu", "Xung đột này đang phá hỏng điều gì và đồng thời chỉ ra nhu cầu nào chưa được nghe?"],
  "Sáu": ["nhịp hồi phục và tái cân bằng", "Bạn có thể nhận sự nâng đỡ mà không phủ nhận công sức của mình hoặc mắc nợ cảm xúc không?"],
  "Bảy": ["phép thử của lựa chọn và lòng bền", "Bạn đang kiên trì vì giá trị hay vì không muốn thừa nhận hướng đi cần đổi?"],
  "Tám": ["năng lượng đi vào chuyển động hoặc kỷ luật", "Nhịp lặp này đang giúp bạn thành thạo hay chỉ giữ bạn bận rộn?"],
  "Chín": ["thành quả đã gần chín", "Bạn có cho phép mình nhận thành quả, đồng thời nhìn đúng cái giá đã trả?"],
  "Mười": ["một chu kỳ đạt tới độ đầy", "Điều gì cần được chia sẻ, khép lại hoặc chuyển giao để cái đầy không biến thành gánh nặng?"],
  "Tiểu Đồng": ["người học gặp một tiếng gọi mới", "Bạn có thể tò mò mà không vội biến điều mới biết thành chân lý về mình hoặc người khác không?"],
  "Kỵ Sĩ": ["người mang năng lượng ra hành động", "Tốc độ này đang phục vụ một hướng đi hay chỉ giúp bạn tránh cảm giác đứng yên?"],
  "Hoàng Hậu": ["người làm chủ thế giới bên trong của địa hạt này", "Bạn đang nuôi dưỡng năng lực hay dùng sự thấu hiểu để kiểm soát không gian của người khác?"],
  "Quốc Vương": ["người chịu trách nhiệm cho ảnh hưởng của địa hạt này", "Quyền làm chủ của bạn có tạo thêm năng lực cho người khác hay chỉ củng cố vị trí của mình?"],
});

// Firestore production hiện chỉ bảo đảm slug chuẩn, không bảo đảm rankVi như
// seed. Suy ra cấp từ phần đứng trước "-of-" để cùng một nội dung build được từ
// cả hai nguồn; rankVi vẫn được ưu tiên nếu quản trị đã lưu rõ.
const RANK_BY_SLUG = Object.freeze({
  ace: "Át", two: "Hai", three: "Ba", four: "Bốn", five: "Năm",
  six: "Sáu", seven: "Bảy", eight: "Tám", nine: "Chín", ten: "Mười",
  page: "Tiểu Đồng", knight: "Kỵ Sĩ", queen: "Hoàng Hậu", king: "Quốc Vương",
});

export function reflectionLens(card) {
  if (card.arcana === "major") {
    const entry = MAJOR[card.slug];
    if (!entry) throw new Error(`Thiếu lớp soi chiếu cho lá ${card.slug}`);
    return { pattern: entry[0], unseen: entry[1], dialogue: entry[2], integration: entry[3] };
  }

  const suit = SUITS[card.suit];
  const slugRank = String(card.slug || "").split("-of-")[0];
  const rank = RANKS[card.rankVi] || RANKS[RANK_BY_SLUG[slugRank]];
  if (!suit || !rank) throw new Error(`Thiếu lớp soi chiếu cho lá ${card.slug}`);
  return {
    pattern: `${suit.pattern}: ${rank[0]}.`,
    unseen: `${suit.unseen} ${rank[1]}`,
    dialogue: `Hãy nhìn ${suit.sense}. Chi tiết nào giống với cách bạn đang phản ứng trong tình huống được hỏi?`,
    integration: `Chọn ${suit.action}; làm đủ nhỏ để có thể thực hiện và đủ rõ để biết nó đã xảy ra.`,
  };
}

export const reflectionCoverage = Object.freeze({ major: Object.keys(MAJOR), suits: Object.keys(SUITS), ranks: Object.keys(RANKS) });
