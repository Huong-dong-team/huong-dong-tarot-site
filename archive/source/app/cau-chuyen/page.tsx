import type { Metadata } from "next";
import Image from "next/image";
import { storyChapters, tarotHouses } from "@/content/site";
import { siteVisuals } from "@/content/site-visuals";

export const metadata: Metadata = {
  title: "Câu chuyện",
  description: "Cốt truyện xuyên suốt từ Rồng Tiên, Văn Lang đến bốn nhà Ẩn Phụ của Hường Đông Tarot.",
};

export default function StoryPage() {
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero story-page-hero">
        <div className="shell story-page-hero-grid">
          <div className="page-hero-inner">
            <p className="eyebrow">Story world</p>
            <h1>Từ bình minh Rồng Tiên<br />đến bốn nhà huyền sử.</h1>
            <p>Storytelling không phải lớp trang trí sau cùng. Nó là cơ chế giúp người dùng đi từ tò mò văn hóa đến hiểu lá bài, quay lại học và cuối cùng muốn sở hữu bộ vật lý.</p>
          </div>
          <figure className="story-hero-art">
            <Image
              src={siteVisuals.storyDawn.src}
              width={siteVisuals.storyDawn.width}
              height={siteVisuals.storyDawn.height}
              priority
              unoptimized
              sizes="(max-width: 960px) calc(100vw - 2rem), 48vw"
              alt={siteVisuals.storyDawn.alt}
            />
          </figure>
        </div>
      </section>
      <section className="section">
        <div className="shell story-timeline">
          {storyChapters.map((chapter) => (
            <article key={chapter.number}>
              <span>{chapter.number}</span>
              <div>
                <p className="eyebrow">{chapter.card}</p>
                <h2>{chapter.title}</h2>
                <p>{chapter.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section story-character-section">
        <div className="shell story-character-feature">
          <figure className="story-character-art">
            <Image
              src={siteVisuals.empressAuCo.src}
              width={siteVisuals.empressAuCo.width}
              height={siteVisuals.empressAuCo.height}
              unoptimized
              sizes="(max-width: 960px) 70vw, 32vw"
              alt={siteVisuals.empressAuCo.alt}
            />
          </figure>
          <div className="story-character-copy">
            <p className="eyebrow">Lá mẫu đang mở · The Empress</p>
            <h2>Âu Cơ — nguồn sống và năng lực nuôi dưỡng.</h2>
            <p>Hình tượng Âu Cơ được dùng như một cầu nối ghi nhớ cho tinh thần The Empress: sinh sôi, bao bọc và làm cho cộng đồng nảy nở. Đây là diễn giải nghệ thuật của dự án, không phải phục dựng khảo cổ.</p>
            <a className="text-link" href="/bo-bai">Xem lớp nghĩa của lá mẫu <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
      <section className="section houses-detail-section">
        <figure className="shell houses-art houses-art-light">
          <Image
            src={siteVisuals.fourHouses.src}
            width={siteVisuals.fourHouses.width}
            height={siteVisuals.fourHouses.height}
            unoptimized
            sizes="(max-width: 960px) calc(100vw - 2rem), 70vw"
            alt={siteVisuals.fourHouses.alt}
          />
          <figcaption>
            <span>Ẩn Phụ Hường Đông</span>
            <strong>Tre · Dâu tằm · Sen · Lúa</strong>
            <p>Mỗi biểu tượng giúp nhận diện một chất mà không làm thay đổi logic sử dụng RWS.</p>
          </figcaption>
        </figure>
        <div className="shell content-grid">
          {tarotHouses.map((house) => (
            <article className="content-card" key={house.suit}>
              <p className="eyebrow">{house.suit}</p>
              <h2>{house.symbol}</h2>
              <p><strong>{house.guide}</strong> dẫn dắt nhà này qua tinh thần {house.idea.toLowerCase()}.</p>
            </article>
          ))}
        </div>
        <div className="shell section-action"><a className="button button-primary" href="/bo-bai">Xem các lá mẫu</a></div>
      </section>
    </main>
  );
}
