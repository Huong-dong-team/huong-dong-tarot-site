import type { Metadata } from "next";
import Link from "next/link";
import { FolkloreMotif } from "@/app/components/knowledge/folklore-motif";
import { evidenceLabels, folkloreEntries, type FolkloreEntry } from "@/content/folklore";
import { medievalLegendSources } from "@/content/medieval-legend-sources";

export const metadata: Metadata = {
  title: "Hồn cốt nước Nam",
  description: "Kho truyện cổ, truyền thuyết, sử liệu và dấu tích khảo cổ được kể rõ, gắn nhãn nguồn và tách biệt kỳ ảo với bằng chứng.",
};

function StoryEntry({ entry, index }: { entry: FolkloreEntry; index: number }) {
  const isLegend = entry.classification === "legend";

  return (
    <article className={`folklore-entry evidence-${entry.classification}`} id={entry.slug}>
      <div className="timeline-marker"><span>{String(index + 1).padStart(2, "0")}</span></div>
      <FolkloreMotif entry={entry} />
      <div className="folklore-copy">
        <div className="evidence-heading">
          <span className="evidence-chip">{evidenceLabels[entry.classification]}</span>
          <span>{entry.genre}</span>
          <span>{entry.era}</span>
        </div>
        <h2>{entry.title}</h2>
        <p className="folklore-synopsis">{entry.synopsis}</p>

        <div className="folklore-narrative">
          <h3>{isLegend ? "Mạch truyện" : "Dữ kiện được ghi nhận"}</h3>
          {entry.narrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>

        <div className="evidence-boundary-grid">
          <aside className="fact-boundary">
            <strong>Ranh giới sự thật</strong>
            <p>{entry.factBoundary}</p>
          </aside>
          <aside className="cultural-core">
            <strong>Hồn cốt nước Nam</strong>
            <p>{entry.culturalCore}</p>
          </aside>
        </div>

        <blockquote>{entry.tarotPrompt}</blockquote>
        <a className="source-link" href={entry.sourceUrl} target="_blank" rel="noreferrer">Nguồn tham khảo: {entry.sourceLabel} ↗</a>
      </div>
    </article>
  );
}

export default function FolklorePage() {
  const legends = folkloreEntries.filter((entry) => entry.classification === "legend");
  const records = folkloreEntries.filter((entry) => entry.classification !== "legend");

  return (
    <main id="noi-dung-chinh">
      <section className="page-hero knowledge-hero knowledge-hero-jade">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Hồn cốt nước Nam</p>
          <h1>Kể trọn từng câu chuyện,<br />giữ đúng ranh giới sự thật.</h1>
          <p>Truyện cổ và truyền thuyết được kể thành mạch riêng. Sử liệu và khảo cổ đứng ở phần riêng. Mỗi mục đều chỉ rõ chi tiết nào thuộc kỳ ảo, điều gì có bằng chứng và giá trị văn hóa nào còn sống đến hôm nay.</p>
          <div className="evidence-legend" aria-label="Chú giải phân loại">
            <span><i className="legend-dot legend-dot-story" />{evidenceLabels.legend}</span>
            <span><i className="legend-dot legend-dot-history" />{evidenceLabels["historical-record"]}</span>
            <span><i className="legend-dot legend-dot-archaeology" />{evidenceLabels.archaeology}</span>
          </div>
          <Link className="text-link folklore-external-link" href="/ngoai-su">Mở Ngoại sử để đối chiếu thư tịch ngoài Đại Việt <span>→</span></Link>
        </div>
      </section>

      <section className="section medieval-source-section">
        <div className="shell section-heading split-heading">
          <div>
            <p className="eyebrow">Tác phẩm Lý–Trần và truyền bản</p>
            <h2>Bốn lớp văn bản,<br />bốn cách nhớ quá khứ.</h2>
          </div>
          <p>Cùng kể chuyện nguồn cội nhưng sử biên niên, thần tích và truyền kỳ không có cùng chức năng. Nhãn thể loại được giữ ngay trong dữ liệu.</p>
        </div>
        <div className="shell medieval-source-grid">
          {medievalLegendSources.map((source, index) => (
            <article key={source.title}>
              <span>{String(index + 1).padStart(2, "0")} · {source.form}</span>
              <h3>{source.title}</h3>
              <p className="source-period">{source.period}</p>
              <p>{source.contribution}</p>
              <aside><strong>Lưu ý truyền bản</strong>{source.caution}</aside>
              <a className="source-link" href={source.sourceUrl} target="_blank" rel="noreferrer">Đối chiếu nguồn ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section folklore-section">
        <div className="shell section-heading split-heading folklore-section-heading">
          <div>
            <p className="eyebrow">Kho truyện cổ & truyền thuyết</p>
            <h2>Kỳ ảo được kể đúng<br />với tư cách kỳ ảo.</h2>
          </div>
          <p>{legends.length} câu chuyện được viết rõ mạch truyện, lớp biểu tượng và giới hạn kiểm chứng. Phần này không dùng phép màu để thay cho sử liệu.</p>
        </div>
        <div className="shell folklore-timeline">
          {legends.map((entry, index) => <StoryEntry entry={entry} index={index} key={entry.slug} />)}
        </div>
      </section>

      <section className="section folklore-section folklore-record-section">
        <div className="shell section-heading split-heading folklore-section-heading">
          <div>
            <p className="eyebrow">Sử liệu & dấu tích khảo cổ</p>
            <h2>Bằng chứng đứng riêng<br />khỏi truyền thuyết.</h2>
          </div>
          <p>Các mục dưới đây dựa vào văn bản sử hoặc vật chứng. Chúng giúp dựng bối cảnh, nhưng không tự động xác nhận thần tích và phép màu.</p>
        </div>
        <div className="shell folklore-timeline">
          {records.map((entry, index) => <StoryEntry entry={entry} index={legends.length + index} key={entry.slug} />)}
        </div>
      </section>
    </main>
  );
}
