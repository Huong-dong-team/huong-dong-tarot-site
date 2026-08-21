import type { Metadata } from "next";
import Link from "next/link";
import { TarotSymbol } from "@/app/components/knowledge/tarot-symbol";
import { rwsCards } from "@/content/rws-cards";

export const metadata: Metadata = {
  title: "Tra cứu 78 lá Tarot RWS",
  description: "Tra cứu tên tiếng Anh, nghĩa xuôi, nghĩa ngược và từ khóa của đủ 78 lá Tarot theo cấu trúc RWS.",
};

const groups = ["Major Arcana", "Wands", "Cups", "Swords", "Pentacles"] as const;

export default function RwsReferencePage() {
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero knowledge-hero knowledge-hero-coral">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Nền tảng tra cứu mở</p>
          <h1>78 lá Tarot RWS,<br />giải thích cho người mới.</h1>
          <p>
            Một lớp kiến thức truyền thống độc lập với bộ Hường Đông: đủ tên, số, chất, nghĩa xuôi/ngược và gợi ý đọc thực tế. Đủ hai mươi hai lá Ẩn chính có tranh minh họa nguyên bản lấy cảm hứng từ truyền thuyết Việt.
          </p>
          <div className="knowledge-disclaimer">
            Ba đợt mới, mỗi đợt bốn tranh, hoàn thiện hành trình từ The Fool (0) đến The World (XXI). Tranh không sao chép lá RWS; tên, số và cấu trúc biểu tượng chỉ được dùng như hệ tham chiếu để học và tự phản tư.
          </div>
        </div>
      </section>

      <section className="section knowledge-section">
        <div className="shell jump-links" aria-label="Chuyển nhanh đến nhóm lá">
          {groups.map((group) => <a key={group} href={`#${group.toLowerCase().replaceAll(" ", "-")}`}>{group}</a>)}
        </div>
        {groups.map((group) => {
          const cards = rwsCards.filter((card) => card.category === group || card.suit === group);
          return (
            <div className="shell knowledge-group" id={group.toLowerCase().replaceAll(" ", "-")} key={group}>
              <div className="knowledge-group-heading">
                <p className="eyebrow">{group === "Major Arcana" ? "Hành trình lớn" : "Ẩn Phụ"}</p>
                <h2>{group}</h2>
                <span>{cards.length} lá{group === "Major Arcana" ? " · 22 tranh đã hoàn thiện" : ""}</span>
              </div>
              <div className="reference-grid">
                {cards.map((card) => (
                  <Link className="reference-card" href={`/tarot-rws/${card.slug}`} key={card.id}>
                    <TarotSymbol card={card} compact />
                    <div>
                      <span className="reference-number">{card.number}</span>
                      <h3>{card.originalName}</h3>
                      <p>{card.uprightMeaning}</p>
                      <div className="keyword-row">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
