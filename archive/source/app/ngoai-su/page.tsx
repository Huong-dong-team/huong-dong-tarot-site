import type { Metadata } from "next";
import { externalHistorySources, externalSourceKindLabels } from "@/content/external-histories";

export const metadata: Metadata = {
  title: "Ngoại sử — ghi chép cổ về đất Việt",
  description: "Đọc có kiểm chứng các ghi chép về Giao Hĩnh, Nam Việt, Giao Chỉ, Lạc dân và An Nam trong thư tịch Trung Hoa.",
};

export default function ExternalHistoriesPage() {
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero knowledge-hero external-history-hero">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Ngoại sử về nước Nam</p>
          <h1>Đọc tên đất Việt<br />qua con mắt người xưa.</h1>
          <p>
            Tám hồ sơ nguồn, nhiều loại chứng cứ khác nhau. Nguyên văn được giữ ngắn; phần diễn giải luôn chỉ rõ đâu là địa danh cổ, đâu là suy đoán và đâu là góc nhìn của bộ máy đế chế.
          </p>
          <div className="knowledge-disclaimer">
            Bách Việt, Nam Việt, Giao Chỉ, Giao Châu và An Nam không phải những nhãn có thể thay thế cho nhau. Mỗi tên xuất hiện ở một thời điểm, phạm vi và thể loại văn bản riêng.
          </div>
        </div>
      </section>

      <section className="section external-history-section">
        <div className="shell external-source-nav" aria-label="Chuyển nhanh đến thư tịch">
          {externalHistorySources.map((source, index) => (
            <a href={`#${source.slug}`} key={source.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>{source.title}
            </a>
          ))}
        </div>

        <div className="shell external-source-list">
          {externalHistorySources.map((source, index) => (
            <article className={`external-source source-${source.kind}`} id={source.slug} key={source.slug}>
              <header>
                <span className="source-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="eyebrow">{source.kindLabel}</p>
                  <h2>{source.title}</h2>
                  <p className="han-title" lang="zh-Hant">{source.hanTitle}</p>
                </div>
                <dl>
                  <div><dt>Tác giả</dt><dd>{source.author}</dd></div>
                  <div><dt>Niên đại</dt><dd>{source.period}</dd></div>
                </dl>
              </header>

              <div className="external-source-body">
                <div className="source-reading">
                  <div className="term-row" aria-label="Tên gọi trong văn bản">
                    {source.terms.map((term) => <span key={term}>{term}</span>)}
                  </div>
                  <blockquote>
                    <p lang="zh-Hant">{source.quote}</p>
                    <footer>{source.translation}</footer>
                  </blockquote>
                  <p>{source.reading}</p>
                </div>
                <aside>
                  <strong>{externalSourceKindLabels[source.kind]}</strong>
                  <p>{source.caveat}</p>
                  <a className="source-link" href={source.sourceUrl} target="_blank" rel="noreferrer">Đối chiếu nguyên bản ↗</a>
                </aside>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
