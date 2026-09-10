/* Bộ câu chữ cho Lá Bài Hôm Nay — bản dành cho thành viên.

   Bản trước viết theo giọng tự phản tư và mượn nhiều chữ chiêm tinh: "nhịp
   trăng non hợp với việc bắt đầu kín đáo", "hai nguyên tố đang cọ vào nhau".
   Đúng về mặt hệ thống nhưng người đọc phải dịch thêm một lượt trong đầu mới
   hiểu, và phần lớn thì không dịch nổi.

   Bản này nói thẳng: vận ngày, giờ hợp, màu hợp, số hợp, rồi ba mảng đời sống
   và một lời khuyên. Luật viết câu ở đây có ba điều, đừng phá:

   1. Mỗi dòng tối đa 14 chữ. Dài hơn là người đọc bắt đầu lướt.
   2. Chỉ dùng chữ đời thường. Cấm "nhịp", "cộng hưởng", "nguyên tố", "trục",
      "decan", "tự phản tư" — những chữ đó ở lại trong mã, không ra mặt trang.
   3. Không hứa chuyện sẽ xảy ra với người khác, không đụng tới sức khỏe, tiền
      đầu tư hay chuyện kiện tụng. Nói về việc người đọc tự làm được thôi.

   Bộ từ vựng Hán Việt của bói cũ (mệnh, vận số, tiền định, người trên giúp
   theo lối cũ) vẫn bị tests/daily-reading.test.mjs cấm. Giữ nguyên lệnh cấm đó:
   giọng bói ở đây đến từ cách nói thẳng và bố cục, không đến từ chữ cổ. */

const v = (items) => Object.freeze(items);

/* Vận ngày. Điểm do reading-engine tính từ chiều lá, quan hệ lá với Mặt Trời,
   chiều trăng và độ trùng decan; ở đây chỉ còn việc đặt tên cho khoảng điểm. */
export const FORTUNE_LEVELS = Object.freeze([
  Object.freeze({ min: 3, key: "very-good", label: "Ngày tốt" }),
  Object.freeze({ min: 1, key: "good", label: "Ngày khá" }),
  Object.freeze({ min: 0, key: "even", label: "Ngày bình thường" }),
  Object.freeze({ min: -2, key: "slow", label: "Ngày chậm" }),
  Object.freeze({ min: Number.NEGATIVE_INFINITY, key: "careful", label: "Ngày nên giữ mình" }),
]);

/* Hình dáng của ngày: sáng hay chiều dễ thở hơn.
   Khóa là `${chiều trăng}:${chặng của câu chuyện}`. */
export const DAY_SHAPE = Object.freeze({
  "advance:early": v([
    "Sáng còn lơ mơ, chiều mới rõ việc.",
    "Đầu ngày chậm, càng về sau càng chạy.",
    "Sáng dò đường, chiều mới đi được.",
  ]),
  "advance:middle": v([
    "Ngày đi lên đều. Cứ theo đà đang có.",
    "Việc đang chạy thì để cho chạy tiếp.",
    "Ngày thuận. Không cần đổi cách làm.",
  ]),
  "advance:late": v([
    "Sắp xong rồi. Ráng thêm một đoạn nữa.",
    "Chặng cuối. Hôm nay về đích được.",
    "Gần tới nơi. Đừng buông lúc này.",
  ]),
  "hold:early": v([
    "Ngày đứng yên. Chưa vội cũng không sao.",
    "Chưa có gì rõ. Cứ để đó đã.",
    "Đầu việc còn mờ. Chờ thêm tin.",
  ]),
  "hold:middle": v([
    "Cả ngày một nhịp đều. Không nhanh, không chậm.",
    "Mọi thứ giữ nguyên. Đừng cố đẩy.",
    "Ngày phẳng. Làm cho xong phần đang dở.",
  ]),
  "hold:late": v([
    "Việc gần khép nhưng chưa khép. Chờ thêm.",
    "Đến đây là đủ. Đừng thêm gì nữa.",
    "Ngày dừng. Để mọi thứ lắng xuống.",
  ]),
  "retreat:early": v([
    "Sáng nhiều sức nhất. Làm sớm đi.",
    "Đầu ngày còn được. Chiều đuối dần.",
    "Tranh thủ buổi sáng. Chiều nên nhẹ tay.",
  ]),
  "retreat:middle": v([
    "Ngày trôi xuống. Bớt việc là vừa.",
    "Sức có hạn. Chọn một việc thôi.",
    "Đừng ôm thêm. Giữ phần đang có.",
  ]),
  "retreat:late": v([
    "Ngày để dọn dẹp, không phải để mở mang.",
    "Khép lại cho gọn. Mai tính tiếp.",
    "Cuối chặng rồi. Nghỉ tay sớm càng tốt.",
  ]),
});

/* Giờ hợp lấy theo hành tinh của lá. Đây là quy ước biên tập của Hường Đông
   cho nhất quán, không phải giờ tốt theo lịch nào cả. */
export const LUCKY_HOUR = Object.freeze({
  sun: "11–13h",
  moon: "21–23h",
  mars: "13–15h",
  mercury: "9–11h",
  jupiter: "15–17h",
  venus: "17–19h",
  saturn: "5–7h",
});

export const LUCKY_COLOR = Object.freeze({
  fire: v(["đỏ gạch", "cam đất", "vàng nghệ"]),
  earth: v(["vàng đất", "nâu gỗ", "xanh rêu"]),
  air: v(["trắng ngà", "xanh da trời", "ghi sáng"]),
  water: v(["xanh biển", "tím than", "xanh ngọc"]),
});

/* Công việc. Khóa là `${quan hệ lá với Mặt Trời}:${chặng của câu chuyện}`. */
export const WORK_COPY = Object.freeze({
  "same:early": v([
    "Việc mới hợp tay bạn. Cứ nhận.",
    "Đầu việc thuận. Bắt tay vào là chạy.",
    "Thứ vừa tới đúng nghề bạn. Đừng ngại.",
  ]),
  "same:middle": v([
    "Đang đúng hướng. Làm tiếp như đang làm.",
    "Không cần đổi gì. Cứ thế mà đi.",
    "Giữa chặng mà thuận. Cứ yên tâm.",
  ]),
  "same:late": v([
    "Việc cũ sắp có kết quả. Chờ thêm chút.",
    "Khâu cuối nhẹ nhàng. Xong trong nay mai.",
    "Gần xong và xong đẹp. Cứ hoàn tất.",
  ]),
  "supporting:early": v([
    "Có người đỡ bạn đoạn đầu. Cứ hỏi.",
    "Mở lời trước đi. Sẽ có người nhận.",
    "Việc mới cần một người cùng làm.",
  ]),
  "supporting:middle": v([
    "Nhờ được thì nhờ. Đừng ôm một mình.",
    "Chia bớt việc ra. Ai cũng nhẹ hơn.",
    "Giữa chặng có người phụ. Nhận đi.",
  ]),
  "supporting:late": v([
    "Sắp xong. Có người phụ khâu cuối.",
    "Nhờ một tay là kết thúc gọn.",
    "Đoạn cuối dễ hơn nếu có người xem cùng.",
  ]),
  "tension:early": v([
    "Việc mới hơi trái tay. Đừng nhận vội.",
    "Nghe qua thì hay, làm mới biết. Hỏi kỹ.",
    "Chưa hợp lúc này. Hoãn được thì hoãn.",
  ]),
  "tension:middle": v([
    "Có chỗ vướng. Gỡ từng cái một.",
    "Đừng cố đẩy. Càng đẩy càng kẹt.",
    "Giữa chặng gặp đá. Đi vòng cũng được.",
  ]),
  "tension:late": v([
    "Khâu cuối dễ sai. Rà lại một lượt.",
    "Gần xong đừng chủ quan. Kiểm lại đã.",
    "Chốt sổ thì đọc kỹ trước khi ký.",
  ]),
  "cross-current:early": v([
    "Chưa rõ đầu đuôi. Hỏi cho kỹ đã.",
    "Thông tin còn thiếu. Đừng quyết hôm nay.",
    "Việc mới đến từ hướng lạ. Cứ nghe trước.",
  ]),
  "cross-current:middle": v([
    "Việc rẽ sang hướng khác. Để yên xem sao.",
    "Kế hoạch đổi giữa chừng. Không phải lỗi bạn.",
    "Giữa chặng thấy đường khác. Ghi lại đã.",
  ]),
  "cross-current:late": v([
    "Kết quả không như tính. Không sao cả.",
    "Xong theo kiểu khác. Vẫn là xong.",
    "Đoạn cuối lệch một chút. Nhận rồi đi tiếp.",
  ]),
});

/* Tình cảm. Khóa là `${chất của cung Mặt Trăng}:${nhóm pha trăng}`.
   Nhóm pha: new, waxing, full, waning. */
export const LOVE_COPY = Object.freeze({
  "fire:new": v([
    "Muốn nói mà chưa tới lúc. Giữ lại đã.",
    "Trong lòng nóng. Ngoài mặt cứ bình thường.",
    "Chưa phải lúc mở chuyện. Để vài hôm.",
  ]),
  "fire:waxing": v([
    "Nói thẳng được rồi. Người kia đang nghe.",
    "Chủ động một chút là có tin vui.",
    "Rủ đi đâu đó đi. Hợp hôm nay.",
  ]),
  "fire:full": v([
    "Dễ nóng lời. Đếm tới ba rồi hãy nói.",
    "Chuyện cũ dễ bùng. Đừng khơi lại.",
    "Cảm xúc mạnh. Đừng quyết gì lúc đang giận.",
  ]),
  "fire:waning": v([
    "Bớt hỏi lại chuyện cũ. Để nó qua.",
    "Người kia đang mệt. Cho họ yên.",
    "Giận thì giận, đừng nói câu nặng.",
  ]),
  "earth:new": v([
    "Chưa cần nói. Làm cho họ thấy là được.",
    "Một việc nhỏ giúp họ hơn trăm câu hứa.",
    "Bắt đầu lại từ chuyện ăn uống, ngủ nghỉ.",
  ]),
  "earth:waxing": v([
    "Rủ ăn một bữa tử tế. Đủ rồi.",
    "Giữ lời hẹn nhỏ là người ta nhớ.",
    "Đều đặn thắng bất ngờ. Cứ đều thôi.",
  ]),
  "earth:full": v([
    "Cả hai đều mỏi. Nghỉ chung một buổi.",
    "Đừng bàn chuyện lớn khi đang đói.",
    "Nói ít, ngồi cạnh nhiều. Vậy là ổn.",
  ]),
  "earth:waning": v([
    "Dọn bớt việc chung cho nhẹ đầu.",
    "Trả lại thứ đang mượn. Sòng phẳng cho dễ thở.",
    "Bỏ một thói quen làm phiền người kia.",
  ]),
  "air:new": v([
    "Nhắn một câu hỏi thăm. Ngắn thôi.",
    "Chưa hiểu ý nhau. Hỏi cho rõ.",
    "Đừng đoán bụng người ta. Cứ hỏi thẳng.",
  ]),
  "air:waxing": v([
    "Nói chuyện hôm nay dễ vào. Tranh thủ.",
    "Đây là lúc bày tỏ. Nói gọn thôi.",
    "Một câu đùa đúng lúc gỡ được nhiều thứ.",
  ]),
  "air:full": v([
    "Nghe nhiều hơn nói. Đừng cãi lý.",
    "Nói nhiều dễ hớ. Bớt lại một nửa.",
    "Đừng nhắn lúc nửa đêm. Sáng hãy nhắn.",
  ]),
  "air:waning": v([
    "Có hiểu lầm cũ. Nói cho xong đi.",
    "Đừng kể chuyện của mình cho người thứ ba.",
    "Im lặng lúc này không phải là lạnh nhạt.",
  ]),
  "water:new": v([
    "Nhớ ai thì cứ nhắn. Không mất gì.",
    "Lòng đang mềm. Đừng hứa điều quá tay.",
    "Giữ cho mình một khoảng yên.",
  ]),
  "water:waxing": v([
    "Người kia đang cần bạn hỏi một câu.",
    "Nói được câu thật thì nói hôm nay.",
    "Gần lại một chút. Đừng chờ họ trước.",
  ]),
  "water:full": v([
    "Dễ tủi thân. Đừng suy diễn thêm.",
    "Nước mắt hôm nay không có lỗi.",
    "Cảm giác đang phóng to. Ngủ một giấc đã.",
  ]),
  "water:waning": v([
    "Buông một chuyện cũ. Nhẹ được phần nào.",
    "Đừng đọc lại tin nhắn cũ. Không giúp gì.",
    "Cho mình quyền không trả lời ngay.",
  ]),
});

/* Tiền bạc. Chỉ nói về thói quen tiêu và cách giữ sổ sách — không bàn chuyện
   sinh lời, không khuyên bỏ tiền vào đâu. Khóa là
   `${tính chất cung Mặt Trời}:${chiều lá}`. */
export const MONEY_COPY = Object.freeze({
  "starting:upright": v([
    "Khoản mới xuất hiện. Ghi lại cho rõ.",
    "Tiền vào có, nhưng chưa nhiều. Cứ mừng.",
    "Có việc phát sinh chi. Nằm trong dự tính.",
  ]),
  "starting:reversed": v([
    "Dễ tiêu tay hơn thường ngày. Chậm lại.",
    "Đừng chốt khoản lớn trong hôm nay.",
    "Có món phát sinh ngoài ý. Bình tĩnh.",
  ]),
  "steady:upright": v([
    "Sổ sách gọn. Giữ nguyên nếp đang có.",
    "Tiền ổn định. Không cần xoay xở gì.",
    "Một khoản cũ quay lại. Tin tốt.",
  ]),
  "steady:reversed": v([
    "Tiền vào chậm hơn bạn nghĩ. Đừng lo sớm.",
    "Có khoản treo lâu ngày. Hỏi lại một tiếng.",
    "Giữ nguyên là hơn. Đừng xoay hôm nay.",
  ]),
  "changing:upright": v([
    "Thu chi lên xuống. Cuối ngày vẫn hòa.",
    "Có cơ hội nhỏ. Xem kỹ rồi hãy nhận.",
    "Ghi lại từng khoản. Sẽ thấy chỗ rò.",
  ]),
  "changing:reversed": v([
    "Dễ quên một khoản phải trả. Xem lại.",
    "Đừng cho ai vay trong hôm nay.",
    "Con số đang lệch. Cộng lại một lần nữa.",
  ]),
});

/* Lời khuyên chốt. Khóa là `${lá và trời có cùng chiều không}:${chiều chung}`. */
export const ADVICE_COPY = Object.freeze({
  "resonance:advance": v([
    "Việc gì định làm thì làm hôm nay.",
    "Đang thuận thì đi tiếp, đừng dừng lại hỏi.",
    "Chọn một việc và làm cho tới.",
  ]),
  "resonance:hold": v([
    "Giữ nguyên những gì đang có là đủ.",
    "Không cần thêm gì mới hôm nay.",
    "Ở yên một chỗ cũng là một cách đi.",
  ]),
  "resonance:retreat": v([
    "Làm cho xong việc cũ rồi hãy nghỉ.",
    "Dọn bớt đi. Nhẹ tay được chừng nào hay chừng đó.",
    "Kết thúc một việc thay vì mở việc mới.",
  ]),
  "tension:advance": v([
    "Muốn nhanh thì phải chậm một nhịp trước đã.",
    "Đi tiếp được, nhưng xem kỹ chân mình.",
    "Có sức thì dùng, đừng dùng hết.",
  ]),
  "tension:hold": v([
    "Chưa rõ thì đừng quyết. Chờ thêm một ngày.",
    "Đứng lại không phải là thua.",
    "Để đó đã. Mai nhìn sẽ khác.",
  ]),
  "tension:retreat": v([
    "Hôm nay lùi một bước cho đỡ mệt.",
    "Bỏ bớt một việc. Không ai trách bạn.",
    "Đừng ép mình. Ngày mai vẫn còn.",
  ]),
  "mixed:advance": v([
    "Làm phần dễ trước. Phần khó để sau.",
    "Bắt đầu bằng việc nhỏ nhất trong danh sách.",
    "Đi từng bước. Đừng nhìn cả quãng đường.",
  ]),
  "mixed:hold": v([
    "Việc đang dở thì làm cho xong đã.",
    "Không thêm, không bớt. Giữ nguyên hôm nay.",
    "Làm hết phần của mình rồi thôi.",
  ]),
  "mixed:retreat": v([
    "Ngủ sớm một hôm. Việc gì cũng nhẹ hơn.",
    "Cắt bớt một cuộc hẹn cho mình thở.",
    "Về sớm được thì về sớm.",
  ]),
});

/* Khối thời điểm, viết bằng tiếng thường. Đây là phần thay cho bảng
   "Thông tin lần bốc" đầy chữ chiêm tinh của bản trước. */
export const SUN_SIGN_PLAIN = Object.freeze({
  aries: "mùa của việc mở đầu và làm nhanh",
  taurus: "mùa của sự chắc chắn và bền lâu",
  gemini: "mùa của trò chuyện và tin tức",
  cancer: "mùa của nhà cửa và người thân",
  leo: "mùa của tự tin và được nhìn thấy",
  virgo: "mùa của việc tỉ mỉ và sắp xếp",
  libra: "mùa của hòa thuận và cân bằng",
  scorpio: "mùa của chuyện sâu kín và thật lòng",
  sagittarius: "mùa của đi xa và học điều mới",
  capricorn: "mùa của kỷ luật và đường dài",
  aquarius: "mùa của cách nghĩ khác thường",
  pisces: "mùa của mơ mộng và thương người",
});

export const MOON_ELEMENT_PLAIN = Object.freeze({
  fire: "lòng người dễ nóng, muốn làm ngay",
  earth: "lòng người cần chỗ dựa thật",
  air: "lòng người muốn nói ra thành lời",
  water: "lòng người mềm, dễ xúc động",
});

export const MOON_PHASE_PLAIN = Object.freeze({
  new: "lúc gieo, chưa phải lúc gặt",
  "waxing-crescent": "mới nhú, cần nuôi thêm",
  "first-half": "đang lên, gặp cản là thường",
  "waxing-gibbous": "gần đầy, sửa nốt chỗ còn thiếu",
  full: "tròn đầy, mọi thứ lộ hết ra",
  "waning-gibbous": "bắt đầu vơi, chia bớt cho nhẹ",
  "last-half": "đang xuống, bỏ dần thứ không cần",
  "waning-crescent": "sắp hết, để một vòng khép lại",
});

export const HOUR_PLAIN = Object.freeze({
  sun: "hợp việc cần đứng tên, nói trước đám đông",
  moon: "hợp chuyện gia đình, nghỉ ngơi, nấu nướng",
  mars: "hợp việc cần dứt khoát, làm cho xong",
  mercury: "hợp giấy tờ, nhắn tin, tính toán",
  jupiter: "hợp việc lớn, xin xỏ, mở rộng",
  venus: "hợp chuyện tình cảm, làm đẹp, ăn ngon",
  saturn: "hợp việc dọn dẹp, sắp xếp, kết sổ",
});

/* Câu mở đầu chỉ còn phần nghĩa của lá. Tên lá và chiều lá đã đứng ngay trên đó
   ở dòng tiêu đề, nhắc lại lần nữa là tốn chữ mà không thêm gì. */

/**
 * Chọn một biến thể trong bảng theo khóa và chỉ số đã băm.
 * @param {Record<string, readonly string[]>} table bảng câu
 * @param {string} key khóa tra cứu
 * @param {number} index chỉ số đã băm, tự quay vòng
 * @returns {string} câu đã chọn
 */
export function pickVariant(table, key, index) {
  const variants = table[key];
  if (!variants?.length) throw new RangeError(`Thiếu câu cho khóa "${key}".`);
  return variants[index % variants.length];
}
