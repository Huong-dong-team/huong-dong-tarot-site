"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Card, CardArcana, CardSuit } from "./types";
import { MinorArcanaFace } from "./minor-arcana-face";
import { sendTelemetry } from "./telemetry";
import styles from "@/styles/landing.module.css";

interface CardExplorerProps {
  cards: Card[];
}

type ArcanaFilter = "all" | CardArcana;
type SuitFilter = "all" | CardSuit;

const INITIAL_ALL_LIMIT = 22;
const INITIAL_MINOR_LIMIT = 14;

const suitLabels: Record<CardSuit, string> = {
  bamboo: "Tre",
  mulberry: "Dâu tằm",
  lotus: "Hoa sen",
  rice: "Bông lúa",
};

const rankLabels: Record<string, string> = {
  Ace: "Át",
  "2": "Hai",
  "3": "Ba",
  "4": "Bốn",
  "5": "Năm",
  "6": "Sáu",
  "7": "Bảy",
  "8": "Tám",
  "9": "Chín",
  "10": "Mười",
  Page: "Sứ giả",
  Knight: "Kỵ sĩ",
  Queen: "Nữ chủ",
  King: "Gia chủ",
};

function displayName(card: Card): string {
  if (card.narrative) return card.narrative.vietnameseName;
  if (card.arcana === "minor" && card.suit) {
    return `${rankLabels[card.number] ?? card.number} ${suitLabels[card.suit]}`;
  }
  return card.rwsName;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLocaleLowerCase("vi");
}

export function CardExplorer({ cards }: CardExplorerProps) {
  const [arcana, setArcana] = useState<ArcanaFilter>("all");
  const [suit, setSuit] = useState<SuitFilter>("all");
  const [query, setQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_ALL_LIMIT);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target || openedRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || openedRef.current) return;
      openedRef.current = true;
      sendTelemetry({ name: "card_grid_open", source: "card-grid" });
      observer.disconnect();
    }, { threshold: 0.2 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedCard]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    return cards.filter((card) => {
      if (arcana !== "all" && card.arcana !== arcana) return false;
      if (suit !== "all" && card.suit !== suit) return false;
      if (!normalizedQuery) return true;
      const haystack = normalizeSearch([
        card.rwsName,
        displayName(card),
        ...card.keywords,
      ].join(" "));
      return haystack.includes(normalizedQuery);
    });
  }, [arcana, cards, query, suit]);

  const arcanaCounts = useMemo(() => ({
    all: cards.length,
    major: cards.filter((card) => card.arcana === "major").length,
    minor: cards.filter((card) => card.arcana === "minor").length,
  }), [cards]);

  const visibleCards = filteredCards.slice(0, visibleLimit);

  function openCard(card: Card) {
    setSelectedCard(card);
    sendTelemetry({ name: "card_detail_open", source: "card-grid", cardSlug: card.slug });
  }

  function updateArcana(value: ArcanaFilter) {
    setArcana(value);
    setSuit("all");
    setVisibleLimit(value === "minor" ? INITIAL_MINOR_LIMIT : INITIAL_ALL_LIMIT);
    if (value === "minor") {
      sendTelemetry({ name: "minor_collection_open", source: "card-grid" });
    }
  }

  function updateSuit(value: SuitFilter) {
    setSuit(value);
    if (value !== "all") setArcana("minor");
    setVisibleLimit(value === "all" ? INITIAL_ALL_LIMIT : INITIAL_MINOR_LIMIT);
  }

  function updateQuery(value: string) {
    setQuery(value);
    setVisibleLimit(arcana === "minor" ? INITIAL_MINOR_LIMIT : INITIAL_ALL_LIMIT);
  }

  function expandCards() {
    setVisibleLimit((current) => {
      const next = Math.min(current + 16, filteredCards.length);
      if (next === filteredCards.length && arcana === "minor") {
        sendTelemetry({ name: "minor_collection_complete_view", source: "card-grid" });
      }
      return next;
    });
  }

  return (
    <div className={styles.explorer} ref={sectionRef}>
      <div className={styles.filters}>
        <div className={styles.searchField}>
          <label htmlFor="card-search">Tìm lá bài</label>
          <input
            id="card-search"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Ví dụ: au co, hy vọng…"
          />
        </div>
        <div className={styles.filterGroup} aria-label="Lọc theo hệ bài">
          <span>Hệ bài</span>
          {(["all", "major", "minor"] as const).map((value) => (
            <button
              type="button"
              className={arcana === value ? styles.filterActive : ""}
              aria-pressed={arcana === value}
              onClick={() => updateArcana(value)}
              key={value}
            >
              <span>{value === "all" ? "Tất cả" : value === "major" ? "Ẩn Chính" : "Ẩn Phụ"}</span>
              <b className={styles.filterCount}>{arcanaCounts[value]}</b>
            </button>
          ))}
        </div>
        <div className={styles.filterGroup} aria-label="Lọc theo chất bài">
          <span>Chất</span>
          <button type="button" className={suit === "all" ? styles.filterActive : ""} aria-pressed={suit === "all"} onClick={() => updateSuit("all")}>Tất cả</button>
          {(Object.keys(suitLabels) as CardSuit[]).map((value) => (
            <button
              type="button"
              className={suit === value ? styles.filterActive : ""}
              aria-pressed={suit === value}
              onClick={() => updateSuit(value)}
              key={value}
            >{suitLabels[value]}</button>
          ))}
        </div>
      </div>

      <p className={styles.resultCount} role="status">
        Hiển thị {visibleCards.length} trong {filteredCards.length} lá phù hợp
      </p>

      {visibleCards.length > 0 ? (
        <div className={styles.cardGrid}>
          {visibleCards.map((card) => (
            <button className={styles.tarotCard} type="button" onClick={() => openCard(card)} key={card.slug}>
              <span className={styles.cardMedia}>
                {card.imageKey ? (
                  <Image
                    src={card.imageKey}
                    width={640}
                    height={960}
                    unoptimized
                    sizes="(max-width: 608px) 46vw, (max-width: 928px) 31vw, 22vw"
                    alt=""
                  />
                ) : card.arcana === "minor" ? (
                  <MinorArcanaFace card={card} />
                ) : (
                  <span className={styles.cardPlaceholder} aria-hidden="true"><i /><strong>{card.number}</strong><i /></span>
                )}
                <span className={styles.cardNumber}>{card.number}</span>
              </span>
              <span className={styles.cardCopy}>
                <span className={styles.cardMeta}>{card.arcana === "major" ? "Ẩn Chính" : card.suit ? suitLabels[card.suit] : "Ẩn Phụ"}</span>
                <strong>{displayName(card)}</strong>
                {(card.narrative || card.arcana === "minor") && <small>{card.rwsName}</small>}
                <span className={styles.keywordLine}>{card.keywords.slice(0, 3).join(" · ")}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>Không có lá bài phù hợp với bộ lọc hiện tại.</p>
      )}

      {visibleCards.length < filteredCards.length && (
        <button
          className={styles.showMoreCards}
          type="button"
          onClick={expandCards}
        >
          Xem thêm {Math.min(16, filteredCards.length - visibleCards.length)} lá
          <span>{visibleCards.length}/{filteredCards.length}</span>
        </button>
      )}

      {selectedCard && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedCard(null);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="card-modal-title">
            <button ref={closeRef} className={styles.modalClose} type="button" onClick={() => setSelectedCard(null)} aria-label="Đóng chi tiết lá bài">×</button>
            <div className={styles.modalMedia}>
              {selectedCard.imageKey ? (
                <Image
                  src={selectedCard.imageKey}
                  width={1024}
                  height={1536}
                  unoptimized
                  sizes="(max-width: 928px) 70vw, 34vw"
                  alt={`Minh họa ${selectedCard.rwsName}`}
                />
              ) : selectedCard.arcana === "minor" ? (
                <MinorArcanaFace card={selectedCard} expanded />
              ) : (
                <span className={styles.modalPlaceholder}><i /><strong>{selectedCard.number}</strong><i /></span>
              )}
            </div>
            <div className={styles.modalCopy}>
              <p className={styles.eyebrow}>{selectedCard.arcana === "major" ? "Ẩn Chính" : selectedCard.suit ? suitLabels[selectedCard.suit] : "Ẩn Phụ"}</p>
              <h3 id="card-modal-title">{displayName(selectedCard)}</h3>
              {(selectedCard.narrative || selectedCard.arcana === "minor") && <p className={styles.rwsLabel}>{selectedCard.number} · {selectedCard.rwsName}</p>}
              {selectedCard.narrative && (
                <div className={styles.narrativeBlock}>
                  <span className={selectedCard.narrative.classification === "legend" ? styles.legendTag : styles.recordTag}>
                    {selectedCard.narrative.classification === "legend" ? "Truyền thuyết" : "Ghi chép lịch sử – khảo cổ"}
                  </span>
                  <p>{selectedCard.narrative.summary}</p>
                  {selectedCard.narrative.sourceUrl && <a href={selectedCard.narrative.sourceUrl} target="_blank" rel="noreferrer">Đọc nguồn</a>}
                </div>
              )}
              <dl className={styles.meaningList}>
                <div><dt>Nghĩa xuôi</dt><dd>{selectedCard.uprightMeaning}</dd></div>
                <div><dt>Nghĩa ngược</dt><dd>{selectedCard.reversedMeaning}</dd></div>
                <div><dt>Cho người mới</dt><dd>{selectedCard.beginnerNote}</dd></div>
              </dl>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
