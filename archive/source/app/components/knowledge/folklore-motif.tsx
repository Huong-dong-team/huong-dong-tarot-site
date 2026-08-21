import Image from "next/image";
import { majorArcanaVisualBySlug } from "@/content/major-arcana-visuals";
import type { FolkloreEntry } from "@/content/folklore";

const motifPaths: Record<FolkloreEntry["motif"], React.ReactNode> = {
  egg: <><ellipse cx="50" cy="52" rx="25" ry="34" /><path d="M34 53c9-8 21-8 32 0M40 66c7-4 13-4 20 0" /></>,
  mountain: <><path d="M12 82 44 29l15 23 9-13 20 43Z" /><path d="m34 45 10-16 9 14" /></>,
  horse: <><path d="M22 76c10-25 17-35 35-41l11-19 9 17 10 8-9 15-15-2-7 22M38 57 24 45" /></>,
  rice: <><path d="M50 88V17M50 30c-14-7-20-1-20 8 10 2 16-1 20-8Zm0 18c14-7 20-1 20 8-10 2-16-1-20-8Zm0 17c-14-7-20-1-20 8 10 2 16-1 20-8Z" /></>,
  watermelon: <><ellipse cx="50" cy="54" rx="35" ry="25" /><path d="M31 35c5 9 5 29 0 38M50 29c-5 13-5 37 0 50M69 35c-5 9-5 29 0 38M50 29c0-9 7-14 15-15" /></>,
  lotus: <><path d="M50 78c-24-12-30-33-20-47 10 3 17 10 20 20 3-10 10-17 20-20 10 14 4 35-20 47Z" /><path d="M50 79V50M19 83h62" /></>,
  citadel: <><path d="M14 82h72V37l-12-9-12 9-12-9-12 9-12-9-12 9Z" /><path d="M38 82V61h24v21M14 49h72" /></>,
  crossbow: <><path d="M17 36c20 20 46 20 66 0M50 47v38M39 85h22M50 47 77 75" /><path d="m71 72 9 6-3-10" /></>,
  arrow: <><path d="M20 77 77 20M67 20h10v10M20 77l16-2-14-14Z" /><path d="m41 56 8 8M50 47l8 8" /></>,
};

export function FolkloreMotif({ entry }: { entry: FolkloreEntry }) {
  if (entry.illustrationSrc) {
    return (
      <Image
        className="folklore-illustration"
        src={entry.illustrationSrc}
        alt={entry.illustrationAlt ?? `Minh họa ${entry.title}`}
        width={768}
        height={1152}
        unoptimized
        loading="lazy"
        sizes="(max-width: 720px) 72px, 144px"
      />
    );
  }

  const illustration = entry.illustrationSlug
    ? majorArcanaVisualBySlug.get(entry.illustrationSlug)
    : undefined;

  if (illustration) {
    return (
      <Image
        className="folklore-illustration"
        src={illustration.src}
        alt={illustration.alt}
        width={illustration.width}
        height={illustration.height}
        unoptimized
        loading="eager"
        sizes="(max-width: 720px) 96px, 144px"
      />
    );
  }

  return (
    <svg className="folklore-motif" viewBox="0 0 100 100" role="img" aria-label={`Họa tiết nguyên bản cho ${entry.title}`}>
      <circle cx="50" cy="50" r="46" />
      {motifPaths[entry.motif]}
    </svg>
  );
}
