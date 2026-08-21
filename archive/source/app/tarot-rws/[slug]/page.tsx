import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TarotSymbol } from "@/app/components/knowledge/tarot-symbol";
import { rwsCardBySlug, rwsCards } from "@/content/rws-cards";

interface CardDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return rwsCards.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: CardDetailPageProps): Promise<Metadata> {
  const card = rwsCardBySlug.get((await params).slug);
  if (!card) return {};
  return {
    title: `${card.originalName} – nghĩa xuôi và ngược`,
    description: `Giải thích ${card.originalName} cho người mới: ${card.uprightMeaning}`,
  };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const card = rwsCardBySlug.get((await params).slug);
  if (!card) notFound();

  return (
    <main id="noi-dung-chinh">
      <section className="section card-detail-section">
        <div className="shell card-detail-grid">
          <div className="card-detail-visual">
            <TarotSymbol card={card} />
            <span>{card.category}{card.suit ? ` · ${card.suit}` : ""}</span>
          </div>
          <article className="card-detail-copy">
            <p className="eyebrow">Lá {card.number}</p>
            <h1>{card.originalName}</h1>
            <div className="keyword-row">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            <div className="meaning-grid">
              <section>
                <h2>Nghĩa xuôi</h2>
                <p>{card.uprightMeaning}</p>
              </section>
              <section>
                <h2>Nghĩa ngược</h2>
                <p>{card.reversedMeaning}</p>
              </section>
            </div>
            <section className="beginner-note">
              <p className="eyebrow">Giải thích cho người mới</p>
              <p>{card.explanation}</p>
            </section>
            <Link className="text-link" href="/tarot-rws">← Trở lại đủ 78 lá</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
