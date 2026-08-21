export const navigation = [
  { href: "/bo-bai", label: "Bộ bài" },
  { href: "/tarot-rws", label: "Tarot RWS" },
  { href: "/chiem-tinh", label: "Chiêm tinh" },
  { href: "/hon-cot-nuoc-nam", label: "Hồn cốt nước Nam" },
  { href: "/ngoai-su", label: "Ngoại sử" },
  { href: "/cua-hang", label: "Cửa hàng" },
] as const;

export const storyChapters = [
  {
    number: "I",
    title: "Bình minh Rồng Tiên",
    description: "Ẩn Chính mở ra hành trình từ bọc trăm trứng đến buổi đầu dựng nước.",
    card: "The Fool — Mai An Tiêm",
  },
  {
    number: "II",
    title: "Bốn nhà huyền sử",
    description: "Tre, dâu tằm, sen và lúa dẫn dắt bốn dòng năng lượng của Ẩn Phụ.",
    card: "The Empress — Âu Cơ",
  },
  {
    number: "III",
    title: "Học bằng liên tưởng",
    description: "Mỗi lá nối nghĩa Rider–Waite–Smith với một câu chuyện Việt dễ nhớ và dùng được.",
    card: "Quest 7 ngày",
  },
] as const;

export const tarotHouses = [
  { suit: "Wands", symbol: "Tre", guide: "Thánh Gióng", idea: "Ý chí và quật cường" },
  { suit: "Swords", symbol: "Dâu tằm", guide: "Liễu Hạnh", idea: "Trí tuệ và quyết đoán" },
  { suit: "Cups", symbol: "Hoa sen", guide: "Chử Đồng Tử", idea: "Cảm xúc và chữa lành" },
  { suit: "Pentacles", symbol: "Bông lúa", guide: "Sơn Tinh", idea: "Bền vững và vun trồng" },
] as const;
