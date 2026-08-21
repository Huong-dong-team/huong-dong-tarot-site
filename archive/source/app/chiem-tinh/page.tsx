import type { Metadata } from "next";
import { ZodiacWheel } from "@/app/components/knowledge/zodiac-wheel";
import { astrologyFoundations, tarotElementLinks, traditionNote, zodiacSigns } from "@/content/astrology";

export const metadata: Metadata = {
  title: "Chiêm tinh nhập môn",
  description: "Tìm hiểu 12 cung, hành tinh, nhà, nguyên tố và mối liên hệ với Tarot bằng một hệ quy chiếu dễ tra cứu.",
};

export default function AstrologyPage() {
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero knowledge-hero knowledge-hero-brass">
        <div className="shell astrology-hero-grid">
          <div className="page-hero-inner">
            <p className="eyebrow">Chiêm tinh nhập môn</p>
            <h1>Một bản đồ biểu tượng,<br />không phải lời phán định mệnh.</h1>
            <p>Học bốn lớp cơ bản rồi dùng chúng để làm giàu cách đặt câu hỏi với Tarot. Các mô tả là khung tự phản tư, không phải kết luận khoa học về tính cách.</p>
          </div>
          <ZodiacWheel />
        </div>
      </section>

      <section className="section knowledge-section">
        <div className="shell foundation-grid">
          {astrologyFoundations.map((item) => <article key={item.title}><strong>{item.title}</strong><p>{item.description}</p></article>)}
        </div>
        <div className="shell section-heading split-heading knowledge-heading">
          <div><p className="eyebrow">12 cung Hoàng đạo</p><h2>Nguyên tố, chủ tinh<br />và lá Tarot liên hệ.</h2></div>
          <p>{traditionNote.description}</p>
        </div>
        <div className="shell zodiac-grid">
          {zodiacSigns.map((sign) => (
            <article className={`zodiac-card element-${sign.element.toLowerCase()}`} key={sign.slug}>
              <span className="zodiac-symbol" aria-hidden="true">{sign.symbol}</span>
              <div><p className="eyebrow">{sign.englishName} · {sign.dateRange}</p><h3>{sign.name}</h3></div>
              <dl>
                <div><dt>Nguyên tố</dt><dd>{sign.element}</dd></div>
                <div><dt>Tính chất</dt><dd>{sign.modality}</dd></div>
                <div><dt>Chủ tinh</dt><dd>{sign.rulingPlanet}</dd></div>
                <div><dt>Tarot</dt><dd>{sign.tarotCard}</dd></div>
              </dl>
              <p>{sign.overview}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section element-section">
        <div className="shell section-heading centered-heading"><p className="eyebrow">Cầu nối thực hành</p><h2>Bốn nguyên tố trong Tarot</h2><p>Ghép một câu hỏi đơn giản với mỗi chất để tránh học thuộc lòng.</p></div>
        <div className="shell element-grid">
          {tarotElementLinks.map((item) => <article key={item.element}><span>{item.element}</span><h3>{item.suit} · {item.vietnameseSuit}</h3><p>{item.prompt}</p></article>)}
        </div>
        <div className="shell tradition-note"><strong>{traditionNote.name}</strong><p>{traditionNote.description}</p></div>
      </section>
    </main>
  );
}
