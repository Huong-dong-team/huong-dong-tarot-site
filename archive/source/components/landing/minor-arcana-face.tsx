import Image from "next/image";
import type { CSSProperties } from "react";
import type { Card, CardSuit } from "./types";
import styles from "@/styles/landing.module.css";

interface MinorArcanaFaceProps {
  card: Card;
  expanded?: boolean;
}

const suitVisuals: Record<CardSuit, {
  label: string;
  rws: string;
  emblem: string;
  guardian: string;
  guardianName: string;
}> = {
  bamboo: {
    label: "Nhà Tre",
    rws: "Wands",
    emblem: "/images/minor/suit-tre.png",
    guardian: "/images/immortals/thanh-giong.webp",
    guardianName: "Phù Đổng Thiên Vương",
  },
  mulberry: {
    label: "Nhà Dâu tằm",
    rws: "Swords",
    emblem: "/images/minor/suit-dau-tam.png",
    guardian: "/images/immortals/mau-lieu-hanh.webp",
    guardianName: "Mẫu Liễu Hạnh",
  },
  lotus: {
    label: "Nhà Sen",
    rws: "Cups",
    emblem: "/images/minor/suit-sen.png",
    guardian: "/images/immortals/chu-dong-tu.webp",
    guardianName: "Chử Đồng Tử",
  },
  rice: {
    label: "Nhà Lúa",
    rws: "Pentacles",
    emblem: "/images/minor/suit-lua.png",
    guardian: "/images/immortals/tan-vien.webp",
    guardianName: "Tản Viên Sơn Thánh",
  },
};

const courtLabels: Record<string, string> = {
  Page: "Sứ giả",
  Knight: "Kỵ sĩ",
  Queen: "Nữ chủ",
  King: "Gia chủ",
};

function pipCount(number: string): number | null {
  if (number === "Ace") return 1;
  const parsed = Number.parseInt(number, 10);
  return Number.isFinite(parsed) && parsed >= 2 && parsed <= 10 ? parsed : null;
}

export function MinorArcanaFace({ card, expanded = false }: MinorArcanaFaceProps) {
  if (!card.suit) return null;
  const visual = suitVisuals[card.suit];
  const count = pipCount(card.number);
  const isCourt = count === null;
  const style = { "--pip-count": count ?? 1 } as CSSProperties;

  return (
    <span
      className={`${styles.minorFace} ${expanded ? styles.minorFaceExpanded : ""}`}
      data-suit={card.suit}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.minorInnerFrame} />
      <Image className={styles.minorLacBird} src="/images/chim-lac-dang-hai-canh.png" width={1536} height={1024} unoptimized alt="" />
      <span className={styles.minorFaceHeader}>
        <strong>{card.number}</strong>
        <span>{visual.label}</span>
      </span>

      {isCourt ? (
        <span className={styles.minorCourt}>
          <Image src={visual.guardian} width={1024} height={1536} unoptimized alt="" />
          <span className={styles.minorCourtVeil} />
          <span className={styles.minorCourtCopy}>
            <small>{visual.guardianName}</small>
            <strong>{courtLabels[card.number] ?? card.number}</strong>
          </span>
        </span>
      ) : (
        <span className={styles.minorPips} data-count={count}>
          <Image
            className={styles.minorPip}
            src={visual.emblem}
            width={1024}
            height={1024}
            unoptimized
            alt=""
          />
          <span className={styles.minorPipMarkers}>
            {Array.from({ length: count }, (_, index) => <i key={`${card.slug}-marker-${index}`} />)}
          </span>
        </span>
      )}

      <span className={styles.minorFaceFooter}>
        <span>{visual.rws}</span>
        <i />
        <span>Hường Đông</span>
      </span>
    </span>
  );
}
