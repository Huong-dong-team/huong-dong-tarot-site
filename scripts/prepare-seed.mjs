import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { rwsCards } from "../../content/rws-cards.ts";
import { majorArcanaVisualBySlug } from "../../content/major-arcana-visuals.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const suitMap = {
  Wands: { suit: "wands", vi: "Tre", icon: "/assets/img/suits/suit-tre.png" },
  Swords: { suit: "swords", vi: "Dâu tằm", icon: "/assets/img/suits/suit-dau-tam.png" },
  Cups: { suit: "cups", vi: "Sen", icon: "/assets/img/suits/suit-sen.png" },
  Pentacles: { suit: "pentacles", vi: "Lúa", icon: "/assets/img/suits/suit-lua.png" },
};

const rankVi = { Ace: "Át", Page: "Tiểu đồng", Knight: "Hiệp sĩ", Queen: "Nữ vương", King: "Quốc vương" };
const standardMajorVi = ["Kẻ Khờ", "Nhà Pháp Thuật", "Nữ Tư Tế", "Hoàng Hậu", "Hoàng Đế", "Giáo Hoàng", "Tình Nhân", "Cỗ Xe", "Sức Mạnh", "Ẩn Sĩ", "Bánh Xe Số Phận", "Công Lý", "Người Treo Ngược", "Chuyển Hóa", "Tiết Chế", "Quỷ Dữ", "Tòa Tháp", "Ngôi Sao", "Mặt Trăng", "Mặt Trời", "Phán Xét", "Thế Giới"];

const cards = rwsCards.map((card, order) => {
  const major = card.category === "Major Arcana";
  const visual = major ? majorArcanaVisualBySlug.get(card.slug) : null;
  const suit = major ? null : suitMap[card.suit];
  const numeric = major ? order : Number(card.number) || 0;
  const nameVi = major
    ? standardMajorVi[order]
    : `${rankVi[card.number] || card.number} ${suit.vi}`;
  const imageUrl = major
    ? `/assets/img/cards/major-${String(order).padStart(2, "0")}-${card.slug}.webp`
    : suit.icon;
  return {
    number: numeric,
    slug: card.slug,
    nameVi,
    nameEn: card.originalName,
    nameFolk: visual?.vietnameseTitle || suit?.vi || "",
    arcana: major ? "major" : "minor",
    suit: suit?.suit || null,
    folkStyle: major ? "hang-trong" : "dong-ho",
    image: { url: imageUrl, alt: visual?.alt || `Phù hiệu Nhà ${suit.vi} cho lá ${card.originalName}`, width: major ? visual.width : 1024, height: major ? visual.height : 1024, storagePath: "" },
    thumbnail: { url: imageUrl, alt: visual?.alt || `Phù hiệu Nhà ${suit.vi}` },
    keywordsUpright: [...card.keywords, ...(visual ? [visual.inspiration] : [])].slice(0, 5),
    keywordsReversed: ["mất cân bằng", "trì hoãn", "cần xem lại", "bài học", "điều chỉnh"],
    meaningUpright: `<p>${card.uprightMeaning}</p><p>${card.explanation}</p>`,
    meaningReversed: `<p>${card.reversedMeaning}</p>`,
    story: visual ? `<p><strong>${visual.vietnameseTitle}</strong> — ${visual.inspiration}. Đây là lớp liên tưởng Việt hóa đang được biên tập; nghĩa thực hành vẫn theo cấu trúc RWS.</p>` : `<p>Nhà ${suit.vi} chuyển dịch ${card.suit} sang biểu tượng bản địa nhưng giữ nguyên logic RWS.</p>`,
    symbols: major && visual ? [{ name: visual.vietnameseTitle, meaning: visual.inspiration }, { name: "Trống đồng", meaning: "Cội nguồn và ký ức cộng đồng" }] : [{ name: suit.vi, meaning: `Biểu tượng bản địa của chất ${card.suit}` }],
    question: `Thông điệp của ${card.originalName} đang mời bạn nhìn lại điều gì trong hoàn cảnh hiện tại?`,
    seo: { title: `${nameVi} – ${card.originalName}`, description: `${card.originalName}: nghĩa xuôi, nghĩa ngược và lớp liên tưởng ${visual?.vietnameseTitle || suit.vi} trong Hường Đông Tarot.`, ogImage: major ? imageUrl : "/assets/img/default-og.webp", canonical: `/la-bai/${card.slug}/` },
    status: "published",
    order,
    createdAt: null,
    updatedAt: null,
  };
});

await mkdir(path.join(root, "seed"), { recursive: true });
await writeFile(path.join(root, "seed/cards.json"), `${JSON.stringify(cards, null, 2)}\n`);
console.log(`Đã đồng bộ ${cards.length} lá.`);
