import Image from "next/image";
import { AnimatedStarHero } from "@/components/landing/animated-star-hero";
import { CardExplorer } from "@/components/landing/card-explorer";
import { ImmortalsShowcase } from "@/components/landing/immortals-showcase";
import { LandingTelemetry } from "@/components/landing/landing-telemetry";
import type { Card, CardNarrative, CardSuit } from "@/components/landing/types";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { pilotCards } from "@/content/cards";
import { rwsCards, type RwsCard, type RwsSuit } from "@/content/rws-cards";
import styles from "@/styles/landing.module.css";

const suitMap: Record<RwsSuit, CardSuit> = {
  Wands: "bamboo",
  Swords: "mulberry",
  Cups: "lotus",
  Pentacles: "rice",
};

const narrativeByRwsName = new Map<string, CardNarrative>(
  pilotCards.map((card) => [
    card.title,
    {
      vietnameseName: card.vietnameseTitle,
      summary: card.summary,
      classification: "legend",
      sourceUrl: null,
    },
  ]),
);

function imageKeyFor(card: RwsCard): string | null {
  if (card.category !== "Major Arcana") return null;
  if (card.slug === "the-empress") return "/images/empress-au-co.webp";

  const paddedNumber = card.id.replace("major-", "");
  return `/images/major-${paddedNumber}-${card.slug}.webp`;
}

function toLandingCard(card: RwsCard): Card {
  return {
    slug: card.slug,
    rwsName: card.originalName,
    arcana: card.category === "Major Arcana" ? "major" : "minor",
    suit: card.suit ? suitMap[card.suit] : null,
    number: card.number,
    keywords: [...card.keywords],
    uprightMeaning: card.uprightMeaning,
    reversedMeaning: card.reversedMeaning,
    beginnerNote: card.explanation,
    narrative: narrativeByRwsName.get(card.originalName) ?? null,
    imageKey: imageKeyFor(card),
    status: "published",
  };
}

const cards = rwsCards.map(toLandingCard);

const houses = [
  { symbol: "Tre", rws: "Wands", suit: "bamboo", idea: "Ý chí · khởi sự · quật cường", image: "/images/minor/suit-tre.png" },
  { symbol: "Dâu tằm", rws: "Swords", suit: "mulberry", idea: "Trí tuệ · phân định · quyết đoán", image: "/images/minor/suit-dau-tam.png" },
  { symbol: "Hoa sen", rws: "Cups", suit: "lotus", idea: "Cảm xúc · trực giác · chữa lành", image: "/images/minor/suit-sen.png" },
  { symbol: "Bông lúa", rws: "Pentacles", suit: "rice", idea: "Nguồn lực · vun trồng · bền vững", image: "/images/minor/suit-lua.png" },
] as const;

function LacWatermark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={styles.lacWatermark} data-tone={tone} aria-hidden="true">
      <Image src="/images/chim-lac-dang-hai-canh.png" width={1536} height={1024} unoptimized alt="" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <main className={`${styles.page} waitlist-landing`} id="noi-dung-chinh">
      <LandingTelemetry />

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Về trang chủ">
          <span className={styles.brandSeal} aria-hidden="true">
            <Image src="/images/huong-dong-trong-dong.png" width={44} height={44} unoptimized alt="" />
          </span>
          <span>Hường Đông</span>
        </a>
        <nav className={styles.nav} aria-label="Điều hướng landing page">
          <a href="#cau-chuyen">Câu chuyện</a>
          <a href="#tu-bat-tu">Tứ Bất Tử</a>
          <a href="#bo-bai">Bộ bài</a>
          <a href="#bon-chat">Bốn chất</a>
          <a href="#tham-gia">Tham gia</a>
        </nav>
        <a className={styles.headerCta} href="#tham-gia">Vào danh sách chờ</a>
      </header>

      <section className={styles.hero} id="top" aria-labelledby="hero-title">
        <LacWatermark />
        <span className={styles.srOnly}>Nội dung nổi bật Hường Đông Tarot</span>
        <span className={styles.srOnly}>Xem slide tiếp theo</span>
        <div className={styles.heroMist} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Tarot XVII · The Star · Mẫu Liễu Hạnh</p>
            <h1 id="hero-title">Di sản Việt,<br />soi đường qua 78 lá bài.</h1>
            <p className={styles.heroLead}>
              Một hành trình Tarot nơi Tứ Bất Tử và huyền sử Việt trở thành ký ức dẫn đường — dễ học, dùng được và đáng lưu giữ.
            </p>
            <WaitlistForm source="hero" compact />
            <div className={styles.heroLinks}>
              <a href="#tu-bat-tu">Bước vào điện thờ biểu tượng <span aria-hidden="true">→</span></a>
              <span>Không spam · Có thể rời danh sách bất cứ lúc nào</span>
            </div>
          </div>

          <AnimatedStarHero />
        </div>

        <div className={styles.proofStrip} aria-label="Thông tin chính">
          <div><strong>78</strong><span>Lá bài liên kết</span></div>
          <div><strong>RWS</strong><span>Hệ nghĩa nền tảng</span></div>
          <div><strong>22/22</strong><span>Trạm Ẩn Chính</span></div>
          <div><strong>4</strong><span>Vị trong Tứ Bất Tử</span></div>
        </div>
      </section>

      <section className={styles.story} id="cau-chuyen" aria-labelledby="story-title">
        <LacWatermark tone="light" />
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Storytelling là sản phẩm</p>
            <h2 id="story-title">Một sử thi liên tục,<br />không phải 78 mẩu chuyện rời.</h2>
          </div>
          <p>
            Người mới học bằng liên tưởng; reader giữ được logic truyền thống; collector bước vào một thế giới có chiều sâu và ranh giới chứng cứ rõ ràng.
          </p>
        </div>

        <figure className={styles.storyFigure}>
          <Image
            src="/images/story-dawn.webp"
            width={1536}
            height={1024}
            unoptimized
            sizes="(max-width: 900px) 100vw, 74vw"
            alt="Bình minh trên châu thổ Việt, núi và sông gặp nhau dưới mặt trời đỏ"
          />
          <figcaption>
            <span>Chương mở đầu</span>
            <strong>Bình minh Rồng Tiên</strong>
            <p>Một hành trình đi từ khởi nguyên, qua thử thách, đến lúc con người hiểu phần trách nhiệm của mình với cộng đồng.</p>
          </figcaption>
        </figure>

        <div className={styles.storyRail}>
          <article><span>I</span><h3>Khởi nguyên</h3><p>Mai An Tiêm bước khỏi vùng an toàn và gieo hạt trên miền đất chưa biết.</p></article>
          <article><span>II</span><h3>Trật tự</h3><p>Âu Cơ, Cổ Loa và những lớp ký ức Việt soi lại cấu trúc RWS.</p></article>
          <article><span>III</span><h3>Chuyển hóa</h3><p>Mỗi lá giữ nghĩa thực hành, đồng thời mở thêm một đường liên tưởng bản địa.</p></article>
        </div>
      </section>

      <section className={styles.immortals} id="tu-bat-tu" aria-labelledby="immortals-title">
        <LacWatermark />
        <ImmortalsShowcase />
      </section>

      <section className={styles.library} id="bo-bai" aria-labelledby="library-title">
        <LacWatermark />
        <div className={styles.darkSectionIntro}>
          <div>
            <p className={styles.eyebrow}>Thư viện 78 lá · đủ hệ 56 Ẩn Phụ</p>
            <h2 id="library-title">Hai lớp nghĩa.<br />Một trải nghiệm liền mạch.</h2>
          </div>
          <p>
            Tìm theo tên RWS, tên Việt hoặc từ khóa. Khi một lá chưa có lớp Việt, hệ thống chỉ hiển thị lớp RWS — không tự điền nội dung thay thế.
          </p>
        </div>
        <CardExplorer cards={cards} />
      </section>

      <section className={styles.houses} id="bon-chat" aria-labelledby="houses-title">
        <LacWatermark tone="light" />
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Bốn nhà Ẩn Phụ</p>
            <h2 id="houses-title">Tre · Dâu tằm<br />Sen · Lúa</h2>
          </div>
          <p>
            Bốn biểu tượng bản địa thay lớp hình ảnh phương Tây, nhưng vẫn giữ nguyên logic sử dụng của bốn chất bài RWS.
          </p>
        </div>

        <div className={styles.housesLayout}>
          <figure className={styles.housesFigure}>
            <Image
              src="/images/four-houses.webp"
              width={1536}
              height={1024}
              unoptimized
              sizes="(max-width: 900px) 100vw, 54vw"
              alt="Tre, dâu tằm, hoa sen và bông lúa kết nối quanh một đĩa mặt trời"
            />
          </figure>
          <div className={styles.houseList}>
            {houses.map((house, index) => (
              <article key={house.suit}>
                <span className={styles.houseIndex}>0{index + 1}</span>
                <span className={styles.houseGlyph} aria-hidden="true">
                  <Image src={house.image} width={1024} height={1024} unoptimized alt="" />
                </span>
                <div><p>{house.rws}</p><h3>{house.symbol}</h3><span>{house.idea}</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.join} id="tham-gia" aria-labelledby="join-title">
        <LacWatermark />
        <div className={styles.joinDisc} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.joinContent}>
          <p className={styles.eyebrow}>Từ từ nhưng không từ bỏ</p>
          <h2 id="join-title">Bước vào Hường Đông<br />từ lá thư đầu tiên.</h2>
          <p>Nhận tin về những lá bài mới, câu chuyện hậu trường và thời điểm bộ bài sẵn sàng — không có giỏ hàng, không có thanh toán.</p>
          <WaitlistForm source="footer" />
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top"><span className={styles.brandSeal} aria-hidden="true"><Image src="/images/huong-dong-trong-dong.png" width={44} height={44} unoptimized alt="" /></span><span>Hường Đông</span></a>
        <p>Tarot là công cụ tự phản tư và học tập, không thay thế tư vấn y tế, pháp lý hoặc tài chính.</p>
        <span>© 2026 NguyenHongKhang. All rights reserved.</span>
      </footer>
    </main>
  );
}
