import type { Metadata } from "next";
import Image from "next/image";
import { pilotCards } from "@/content/cards";
import { siteVisuals } from "@/content/site-visuals";

export const metadata: Metadata = {
  title: "Bộ bài",
  description: "Khám phá các lá mẫu và cách Hường Đông kết nối nghĩa Tarot RWS với câu chuyện Việt.",
};

export default function CardsPage() {
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Thư viện 78 lá</p>
          <h1>Học bằng liên tưởng,<br />không học thuộc lòng.</h1>
          <p>Mỗi lá có hai lớp: nghĩa Tarot thực hành và mạch truyện Việt giúp người mới nhớ lâu hơn. Giai đoạn đầu chỉ công khai 5-7 lá mẫu để bảo vệ giá trị sáng tạo.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell card-library">
          {pilotCards.map((card) => {
            const visual = card.imageKey ? siteVisuals[card.imageKey] : null;
            return (
              <article className={`tarot-card-row${visual ? " tarot-card-row-featured" : ""}`} key={card.number}>
                <div className="tarot-card-media">
                  {visual ? (
                    <Image
                      className="tarot-card-art"
                      src={visual.src}
                      width={visual.width}
                      height={visual.height}
                      unoptimized
                      sizes="(max-width: 720px) 72px, 112px"
                      alt={visual.alt}
                    />
                  ) : <div className="tarot-card-number">{card.number}</div>}
                </div>
                <div>
                  <p className="eyebrow">{card.title}</p>
                  <h2>{card.vietnameseTitle}</h2>
                  <p>{card.summary}</p>
                  <div className="keyword-row">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
                </div>
                <span className="status-chip">{card.status}</span>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
