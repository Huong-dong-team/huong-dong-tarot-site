import Image from "next/image";
import { majorArcanaVisualBySlug } from "@/content/major-arcana-visuals";
import type { RwsCard } from "@/content/rws-cards";

interface TarotSymbolProps {
  card: RwsCard;
  compact?: boolean;
}

const majorGlyphs: Record<string, React.ReactNode> = {
  step: <><path d="M16 71h25V46h24V21h25" /><circle cx="20" cy="25" r="5" /></>,
  spark: <><path d="M52 15v74M25 52h54M34 34l36 36M70 34L34 70" /><circle cx="52" cy="52" r="15" /></>,
  moon: <><path d="M65 18a35 35 0 1 0 0 68A28 28 0 1 1 65 18Z" /><path d="M24 82h56" /></>,
  seed: <><path d="M52 88V43M52 54c-20 0-28-13-28-27 19 0 28 9 28 27Zm0 16c20 0 28-13 28-27-19 0-28 9-28 27Z" /><circle cx="52" cy="24" r="5" /></>,
  throne: <><path d="M28 84V38h48v46M22 84h60M34 38V22h36v16" /><path d="M42 56h20" /></>,
  key: <><circle cx="43" cy="38" r="17" /><path d="M54 50l26 27M66 62l-8 8M75 71l-8 8" /></>,
  pair: <><circle cx="35" cy="35" r="13" /><circle cx="69" cy="35" r="13" /><path d="M22 82c2-21 12-32 30-32s28 11 30 32" /></>,
  wheel: <><circle cx="52" cy="52" r="33" /><circle cx="52" cy="52" r="8" /><path d="M52 19v25M52 60v25M19 52h25M60 52h25" /></>,
  heart: <><path d="M52 84 23 53C4 30 36 14 52 36 68 14 100 30 81 53Z" /><path d="M42 55h20" /></>,
  lamp: <><path d="M52 16v18M35 48h34l-6 22H41Z" /><path d="M43 70v15h18V70M31 48h42" /></>,
  cycle: <><path d="M29 31a30 30 0 0 1 47 7l6-2-3 18-16-9 7-3A23 23 0 0 0 35 37M75 73a30 30 0 0 1-47-7l-6 2 3-18 16 9-7 3a23 23 0 0 0 35 5" /></>,
  balance: <><path d="M52 17v69M28 29h48M34 29 19 61h30Zm36 0L55 61h30Z" /><path d="M31 86h42" /></>,
  pause: <><path d="M24 22h56M52 22v19M36 77l16-36 16 36" /><circle cx="52" cy="82" r="5" /></>,
  gate: <><path d="M25 87V41c0-19 11-29 27-29s27 10 27 29v46M25 87h54" /><path d="M52 34v32M39 50h26" /></>,
  vessel: <><path d="M27 24h31l-7 23H34Zm26 33h31l-7 23H60Z" /><path d="M51 41c16 3 15 17 9 22" /></>,
  chain: <><path d="M44 43 32 31c-13-13-32 6-19 19l12 12c7 7 17 6 23 1M60 61l12 12c13 13 32-6 19-19L79 42c-7-7-17-6-23-1" /><path d="M38 66 66 38" /></>,
  tower: <><path d="M32 87V32h40v55M27 32h50L68 17l-9 10-7-13-8 13-9-10Z" /><path d="m49 47 10 8-12 9 10 8" /></>,
  star: <><path d="m52 14 8 25 26-1-21 15 9 25-22-15-22 15 9-25-21-15 26 1Z" /><path d="M19 88h66" /></>,
  night: <><path d="M68 19a31 31 0 1 0 0 66A25 25 0 1 1 68 19Z" /><path d="M22 84 40 66l12 12 10-10 20 16" /></>,
  sun: <><circle cx="52" cy="52" r="20" /><path d="M52 13v16M52 75v16M13 52h16M75 52h16M24 24l12 12M68 68l12 12M80 24 68 36M36 68 24 80" /></>,
  call: <><path d="M23 79h58M31 79V58h12v21M61 79V58h12v21" /><path d="M52 19v29M40 31l12-12 12 12" /></>,
  world: <><circle cx="52" cy="52" r="34" /><path d="M52 18c17 15 17 53 0 68M52 18c-17 15-17 53 0 68M18 52h68" /></>,
};

function MinorGlyph({ card }: { card: RwsCard }) {
  const count = Number.parseInt(card.number, 10);
  const marks = Number.isNaN(count) ? 1 : Math.min(count, 10);
  const suit = card.suit ?? "Wands";

  return (
    <>
      {Array.from({ length: marks }, (_, index) => {
        const x = 24 + (index % 4) * 19;
        const y = 30 + Math.floor(index / 4) * 23;
        if (suit === "Cups") return <path key={index} d={`M${x - 5} ${y - 7}h10l-2 10h-6Zm5 10v5m-6 0h12`} />;
        if (suit === "Swords") return <path key={index} d={`M${x} ${y - 9}v18m-4-5 4 5 4-5`} />;
        if (suit === "Pentacles") return <circle key={index} cx={x} cy={y} r="6" />;
        return <path key={index} d={`M${x} ${y - 9}v18m-4-13 8 8`} />;
      })}
    </>
  );
}

export function TarotSymbol({ card, compact = false }: TarotSymbolProps) {
  const visual = majorArcanaVisualBySlug.get(card.slug);

  if (visual) {
    return (
      <figure className={compact ? "tarot-illustration tarot-illustration-compact" : "tarot-illustration"}>
        <Image
          src={visual.src}
          alt={visual.alt}
          width={visual.width}
          height={visual.height}
          unoptimized
          sizes={compact ? "(max-width: 720px) 80px, 120px" : "(max-width: 960px) 384px, 420px"}
        />
        {!compact && (
          <figcaption>
            <strong>{visual.vietnameseTitle}</strong>
            <span>{visual.inspiration}</span>
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <svg
      className={compact ? "tarot-symbol tarot-symbol-compact" : "tarot-symbol"}
      viewBox="0 0 104 104"
      role="img"
      aria-label={`Biểu tượng nét nguyên bản cho ${card.originalName}`}
    >
      <rect x="4" y="4" width="96" height="96" rx="16" />
      {card.category === "Major Arcana" ? majorGlyphs[card.visual] : <MinorGlyph card={card} />}
    </svg>
  );
}
