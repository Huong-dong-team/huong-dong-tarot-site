const freezeVariants = (items) => Object.freeze(items);

export const COLLISION_COPY = Object.freeze({
  "resonance:same": "Lá và nhịp trời đang cùng hướng, vì thế điểm đáng giữ là một bước rõ ràng thay vì cố làm mọi thứ cùng lúc.",
  "resonance:supporting": "Hai dòng lực đang nâng nhau, nên một việc nhỏ được làm tới nơi sẽ có ý nghĩa hơn nhiều ý định để ngỏ.",
  "resonance:tension": "Sự đồng nhịp xuất hiện ngay trong một cặp vốn dễ va nhau, nhắc bạn dùng sức vừa đủ và để phần còn lại có chỗ thở.",
  "resonance:cross-current": "Lá và bầu trời gặp nhau ở nhịp đi, dù mỗi bên nhìn về một phía khác; hãy chọn điểm chung trước.",
  "tension:same": "Nền tảng có vẻ quen thuộc nhưng hai nhịp đang kéo ngược nhau, vì vậy cảm giác chắc chắn đầu tiên vẫn cần được kiểm tra.",
  "tension:supporting": "Điều kiện có thể hỗ trợ, còn hướng đi lại chưa đồng lòng; chậm một nhịp giúp bạn nhận ra phần nào đang bị thúc ép.",
  "tension:tension": "Cả chất liệu lẫn nhịp đi đều đang cọ vào nhau, nên hôm nay hợp với việc nhìn thẳng vào điểm khó thay vì phủ lên nó một câu trả lời đẹp.",
  "tension:cross-current": "Một phía muốn tiến còn phía kia muốn lùi, trong khi câu chuyện vẫn rẽ ngang; hãy thu hẹp câu hỏi trước khi chọn hướng.",
  "mixed:same": "Lá và cung Mặt Trời có chung chất liệu nhưng nhịp chưa hẳn trùng nhau, nên điều quen thuộc vẫn có thể cần một cách làm mới.",
  "mixed:supporting": "Các yếu tố đang hỗ trợ nhau theo cách nhẹ, không ép bạn phải đi nhanh; một lựa chọn vừa sức là đủ cho hôm nay.",
  "mixed:tension": "Có một độ căng hữu ích giữa lá và bầu trời, giống như hai ý kiến khác nhau buộc bạn gọi đúng tên điều mình cần.",
  "mixed:cross-current": "Các tín hiệu không đối đầu cũng không nhập làm một, vì thế khoảng trống giữa chúng là nơi thích hợp để bạn tự quan sát.",
});

export const AXIS_COPY = Object.freeze({
  B: Object.freeze({
    same: freezeVariants([
      "Nguyên tố của lá gặp đúng chất của cung Mặt Trời, làm nổi bật điều bạn đã cảm thấy từ trước.",
      "Lá và cung Mặt Trời nói cùng một ngôn ngữ, nên tín hiệu quen thuộc hôm nay đáng được nghe kỹ.",
      "Cùng một nguyên tố đang lặp lại ở lá và bầu trời, giúp trọng tâm hiện ra gọn hơn.",
    ]),
    supporting: freezeVariants([
      "Hai nguyên tố đang nâng đỡ nhau, phù hợp với một hành động nhỏ có điểm bắt đầu và điểm dừng rõ ràng.",
      "Chất của lá được cung Mặt Trời tiếp sức, nhưng phần hữu ích nhất vẫn là việc bạn thật sự làm được.",
      "Lá và cung Mặt Trời đang tạo một thế hỗ trợ, mời bạn dùng thuận lợi này thật có chừng mực.",
    ]),
    tension: freezeVariants([
      "Hai nguyên tố đang cọ vào nhau, làm lộ rõ chỗ bạn vừa muốn giữ vừa muốn thay đổi.",
      "Chất của lá không đứng cùng phía với cung Mặt Trời, nên phản ứng đầu tiên chưa chắc là điều cần làm theo.",
      "Sự khác biệt nguyên tố khiến câu hỏi sắc hơn, đặc biệt ở phần bạn thường né tránh gọi tên.",
    ]),
    "cross-current": freezeVariants([
      "Hai nguyên tố đi ngang qua nhau, gợi ý rằng câu trả lời có thể nằm ngoài lựa chọn quen thuộc.",
      "Lá và cung Mặt Trời không chống nhau nhưng cũng không đẩy nhau đi, để lại một khoảng tự do đáng quý.",
      "Chất của lá và bầu trời đang đứng ở hai mặt khác nhau, mời bạn nối chúng bằng một điều cụ thể.",
    ]),
  }),
  C: Object.freeze({
    starting: freezeVariants([
      "Cung Mặt Trời đang mang nhịp khởi đầu, hợp với việc mở một cánh cửa thay vì đòi thấy cả con đường.",
      "Nhịp khởi của ngày khuyến khích bạn đặt viên đầu tiên, chưa cần ép mọi phần phải hoàn chỉnh.",
      "Bầu trời đang thiên về bắt đầu, nên một lời nói thật hoặc một bước thử nhỏ đã là đủ.",
    ]),
    steady: freezeVariants([
      "Cung Mặt Trời giữ nhịp bền, nhắc bạn ở lại đủ lâu với điều quan trọng để thấy nó rõ hơn.",
      "Nhịp vững của ngày không đòi thay đổi lớn, chỉ cần bạn chăm đúng phần đã chọn.",
      "Bầu trời đang nghiêng về sự ổn định, phù hợp với việc củng cố thay vì mở thêm quá nhiều hướng.",
    ]),
    changing: freezeVariants([
      "Cung Mặt Trời mang nhịp chuyển, vì thế cách tiếp cận linh hoạt có ích hơn một kế hoạch quá cứng.",
      "Ngày đang có chất biến đổi, mời bạn điều chỉnh cách làm mà không bỏ quên mục đích ban đầu.",
      "Nhịp chuyển của cung Mặt Trời mời bạn thử một góc nhìn khác trước khi kết luận.",
    ]),
  }),
  D: Object.freeze({
    sun: freezeVariants([
      "Giờ của Mặt Trời đặt sự rõ ràng lên trước, nên hãy nhìn xem điều gì xứng đáng được bạn đứng tên.",
      "Mặt Trời đang giữ nhịp giờ này, làm nổi bật lòng tự trọng và cách bạn hiện diện trước người khác.",
      "Ánh sáng của Mặt Trời hợp với việc nói một điều đơn giản, thẳng và không phô trương.",
    ]),
    moon: freezeVariants([
      "Giờ của Mặt Trăng đưa cảm nhận lên gần bề mặt, nên một khoảng yên có thể nói nhiều hơn phản ứng vội.",
      "Mặt Trăng đang giữ nhịp giờ này, mời bạn nhận ra cảm xúc trước khi biến nó thành quyết định.",
      "Nhịp của Mặt Trăng hợp với việc lắng nghe điều cơ thể và ký ức nhắc lại.",
    ]),
    mars: freezeVariants([
      "Giờ của Sao Hỏa có nhiều lực đẩy, nhưng sức mạnh hữu ích nhất là sức biết dừng đúng chỗ.",
      "Sao Hỏa đang giữ nhịp giờ này, làm rõ nơi bạn cần can đảm mà không cần gây thêm va chạm.",
      "Năng lượng Sao Hỏa hợp với một việc cần làm ngay, miễn là mục tiêu đã được gọi đúng tên.",
    ]),
    mercury: freezeVariants([
      "Giờ của Sao Thủy làm lời nói và chi tiết nổi bật, thích hợp để hỏi lại điều còn mơ hồ.",
      "Sao Thủy đang giữ nhịp giờ này, nhắc bạn đọc kỹ tín hiệu nhỏ trước khi nối chúng thành câu chuyện.",
      "Nhịp Sao Thủy phù hợp với việc viết xuống, trao đổi hoặc sắp xếp lại một ý nghĩ rối.",
    ]),
    jupiter: freezeVariants([
      "Giờ của Sao Mộc mở rộng tầm nhìn, nhưng điều lớn chỉ có ích khi vẫn chạm được vào thực tế.",
      "Sao Mộc đang giữ nhịp giờ này, mời bạn nhìn rộng hơn mà không hứa quá tay với chính mình.",
      "Nhịp Sao Mộc giúp thấy thêm khả năng, còn lựa chọn nào phù hợp vẫn cần một giới hạn rõ.",
    ]),
    venus: freezeVariants([
      "Giờ của Sao Kim làm giá trị và sự hòa hợp nổi bật, nên hãy để điều đẹp đi cùng điều thật.",
      "Sao Kim đang giữ nhịp giờ này, nhắc bạn xem mình đang trân trọng điều gì bằng hành động cụ thể.",
      "Nhịp Sao Kim hợp với việc làm mềm cách nói mà không làm nhạt nội dung.",
    ]),
    saturn: freezeVariants([
      "Giờ của Sao Thổ đặt ranh giới lên trước, giúp bạn phân biệt trách nhiệm với gánh nặng tự nhận thêm.",
      "Sao Thổ đang giữ nhịp giờ này, phù hợp với một quyết định bền hơn là một lời hứa lớn.",
      "Nhịp Sao Thổ mời bạn thu gọn, sắp thứ tự và giữ lại phần thật sự cần thiết.",
    ]),
  }),
  E: Object.freeze({
    new: freezeVariants([
      "Trăng non giữ mọi thứ ở dạng hạt giống, nên điều chưa rõ chưa cần bị ép thành câu trả lời.",
      "Ánh trăng đang khuất, tạo khoảng yên để ý định mới hình thành, chưa cần công bố.",
      "Nhịp trăng non hợp với việc bắt đầu kín đáo và ấp ủ, kết quả đến sau.",
    ]),
    "waxing-crescent": freezeVariants([
      "Trăng lưỡi liềm đang lớn, gợi bước tiến nhỏ để kiểm tra điều bạn vừa khởi động.",
      "Ánh trăng đang dày thêm từng chút, phù hợp với việc nuôi một ý định bằng hành động đều đặn.",
      "Nhịp trăng đang lớn nhắc rằng sức bền hôm nay quan trọng hơn khởi đầu ồn ào.",
    ]),
    "first-half": freezeVariants([
      "Nửa trăng đang lớn tạo một điểm xoay, nơi lựa chọn cần được thử bằng việc làm cụ thể.",
      "Ánh trăng đang đi lên và gặp lực cản, thích hợp để sửa hướng thay vì bỏ cuộc quá sớm.",
      "Nhịp nửa trăng đặt câu hỏi về cam kết: phần nào đáng được bạn tiếp tục nuôi dưỡng.",
    ]),
    "waxing-gibbous": freezeVariants([
      "Trăng gần tròn làm chi tiết còn thiếu lộ rõ, mời bạn chỉnh lại trước khi khép một vòng.",
      "Ánh trăng đang đầy thêm, nên sự tinh chỉnh quý hơn việc mở một mục tiêu mới.",
      "Nhịp trăng gần tròn nhắc bạn nhìn lại khoảng cách nhỏ giữa gần xong và hoàn tất.",
    ]),
    full: freezeVariants([
      "Trăng tròn đưa cảm xúc và kết quả ra ánh sáng, vì thế điều đã rõ không cần được phóng đại thêm.",
      "Ánh trăng đang đầy, làm phần cao trào dễ thấy nhưng cũng dễ bị nhìn quá lớn.",
      "Nhịp trăng tròn hợp với việc chứng kiến điều đang có, trước khi giữ hay buông.",
    ]),
    "waning-gibbous": freezeVariants([
      "Trăng bắt đầu khuyết, mời bạn chia sẻ điều đã hiểu và bỏ bớt phần thừa.",
      "Ánh trăng rút dần, hợp với việc tiêu hóa trải nghiệm hơn là chạy sang chuyện mới.",
      "Nhịp trăng sau cao trào giúp bạn thấy điều gì đáng giữ sau khi cảm xúc lắng.",
    ]),
    "last-half": freezeVariants([
      "Nửa trăng đang vơi tạo một điểm nhìn lại, nơi thói quen cũ có thể được đặt xuống nhẹ nhàng.",
      "Ánh trăng đang giảm và gặp một khúc rẽ, thích hợp để sửa điều đã biết là không còn hợp.",
      "Nhịp nửa trăng đang vơi mời bạn rút năng lượng khỏi phần chỉ còn do quán tính.",
    ]),
    "waning-crescent": freezeVariants([
      "Trăng lưỡi liềm cuối tháng giữ nhịp nghỉ, nhắc bạn để một vòng thật sự khép trước khi mở vòng khác.",
      "Ánh trăng chỉ còn mảnh nhỏ, phù hợp với việc lắng lại và không ép mình phải có thêm câu trả lời.",
      "Nhịp trăng cuối tháng mời bạn dành chỗ cho nghỉ ngơi, hồi tưởng và một lần thở sâu.",
    ]),
  }),
  F: Object.freeze({
    fire: freezeVariants([
      "Mặt Trăng đang ở cung Lửa, khiến cảm xúc muốn được chuyển thành chuyển động thay vì nằm yên.",
      "Chất Lửa của Mặt Trăng làm phản ứng đến nhanh, nên một nhịp thở giúp bạn chọn đúng việc để làm.",
      "Cảm xúc hôm nay mang sắc Lửa, rõ và trực tiếp nhưng vẫn cần một nơi đặt xuống an toàn.",
    ]),
    earth: freezeVariants([
      "Mặt Trăng đang ở cung Đất, kéo sự chú ý về cơ thể, nhịp sống và những gì có thể chạm tới.",
      "Chất Đất của Mặt Trăng hợp với một việc thực tế, nhỏ và có thể hoàn thành trong tầm tay.",
      "Cảm xúc hôm nay cần nền vững hơn lời giải thích, như một bữa ăn đủ hoặc một khoảng nghỉ thật.",
    ]),
    air: freezeVariants([
      "Mặt Trăng đang ở cung Khí, khiến suy nghĩ và lời nói chạy nhanh hơn cảm giác bên dưới.",
      "Chất Khí của Mặt Trăng mời bạn gọi tên điều đang nghĩ, rồi nghe xem câu nói ấy để lại gì.",
      "Cảm xúc hôm nay đi qua ý tưởng và trò chuyện, nhưng không phải ý nghĩ nào cũng cần được tin ngay.",
    ]),
    water: freezeVariants([
      "Mặt Trăng đang ở cung Nước, làm trực giác và ký ức gần hơn, đồng thời khiến ranh giới dễ mềm đi.",
      "Chất Nước của Mặt Trăng khuyến khích sự dịu dàng, miễn là bạn vẫn nhận ra đâu là phần của mình.",
      "Cảm xúc hôm nay có chiều sâu của Nước, phù hợp với việc lắng nghe mà chưa cần giải thích hết.",
    ]),
  }),
  G: Object.freeze({
    exact: freezeVariants([
      "Lá vừa bốc trùng đúng decan của Mặt Trời, một điểm cộng hưởng hiếm khiến chủ đề của lá đáng được nhìn thật kỹ.",
      "Decan Mặt Trời đang gọi đúng tên lá này, tạo một khoảnh khắc trùng khớp hiếm nhưng không thay bạn đưa ra lựa chọn.",
      "Lá và decan Mặt Trời gặp nhau chính xác, làm thông điệp nổi bật hơn mà vẫn giữ nó trong phạm vi tự phản tư.",
    ]),
    "same-sign": freezeVariants([
      "Lá không trùng decan nhưng cùng cung với Mặt Trời, vì thế hai biểu tượng đang soi vào cùng một vùng trải nghiệm.",
      "Cung của lá và cung Mặt Trời đang gặp nhau, tạo một tiếng vọng vừa đủ để bạn chú ý tới chủ đề lặp lại.",
      "Lá đang cùng cung với Mặt Trời dù khác decan, nên điểm chung quan trọng hơn khác biệt nhỏ giữa chúng.",
    ]),
    none: freezeVariants([
      "Lá và decan Mặt Trời không trùng nhau, để thông điệp đứng độc lập và tránh bị ép vào một dấu hiệu duy nhất.",
      "Không có sự trùng khớp decan, vì vậy giá trị của lá nằm ở điều nó giúp bạn tự nhận ra ngay lúc này.",
      "Lá đi ngoài vùng decan hiện tại, mở một góc nhìn bổ sung thay vì lặp lại điều bầu trời đã nhấn mạnh.",
    ]),
  }),
  H: Object.freeze({
    early: freezeVariants([
      "Câu chuyện còn mới chớm, nên hãy cho nó thêm dữ kiện trước khi gọi tên kết quả cuối.",
      "Việc này vẫn ở đoạn đầu, phù hợp với quan sát và thử nhẹ hơn là tự buộc mình phải biết hết.",
      "Nhịp ẩn cho thấy cánh cửa mới mở, vì vậy bước đầu tiên cần rõ hơn bước cuối cùng.",
    ]),
    middle: freezeVariants([
      "Câu chuyện đang giữa dòng, nơi điều chỉnh cách đi thường hữu ích hơn quay lại vạch xuất phát.",
      "Việc này đã qua đoạn đầu nhưng chưa tới chỗ kết, nên phần đang diễn ra cần được nhìn đúng như nó có.",
      "Nhịp ẩn đặt bạn ở quãng giữa, mời bạn sửa tay lái mà không phủ nhận chặng đường đã đi.",
    ]),
    late: freezeVariants([
      "Câu chuyện đã gần chỗ kết, nên điều cần thiết là hoàn tất tử tế thay vì mở thêm một vòng rối mới.",
      "Việc này đang ở đoạn muộn, phù hợp với thu gọn, xác nhận và để phần đã xong được nằm yên.",
      "Nhịp ẩn cho thấy một vòng sắp khép, mời bạn nhìn lại điều muốn mang theo sau điểm dừng.",
    ]),
  }),
});

export const CARD_INTRO_TEMPLATES = freezeVariants([
  ({ name, orientation, meaning }) => `Hôm nay, ${name} xuất hiện ${orientation}: ${meaning}`,
  ({ name, orientation, meaning }) => `Lá dành cho hôm nay là ${name}, ${orientation}: ${meaning}`,
  ({ name, orientation, meaning }) => `${name} bước vào ngày hôm nay ${orientation}, mang theo lời nhắc này: ${meaning}`,
  ({ name, orientation, meaning }) => `Bạn gặp ${name} ${orientation} trong lần bốc hôm nay: ${meaning}`,
]);

export function copyVariant(axis, value, index) {
  const variants = AXIS_COPY[axis]?.[value];
  if (!variants?.length) throw new RangeError(`Thiếu câu cho trục ${axis}:${value}.`);
  return variants[index % variants.length];
}
