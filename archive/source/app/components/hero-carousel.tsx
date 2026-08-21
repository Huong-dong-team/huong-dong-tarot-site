"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TrackedLink } from "@/app/components/tracked-link";

type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  badge: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Tarot Việt · 78 lá · Digital-first",
    title: "Di sản Việt, kể lại qua 78 lá bài.",
    description: "Khám phá thần thoại, lịch sử và biểu tượng Việt Nam trong một hành trình Tarot xuyên suốt — dễ học, dùng được và đáng sưu tầm.",
    image: "/hero-product.webp",
    imageAlt: "Hộp và lá bài Hường Đông với họa tiết sen, mặt trời và sắc xanh ngọc",
    badge: "Phiên bản mở bán sớm",
    primary: { label: "Khám phá 78 lá bài", href: "/bo-bai" },
    secondary: { label: "Đặt cọc sớm", href: "/dat-coc" },
  },
  {
    eyebrow: "22 lá Ẩn chính · Đã hoàn thiện",
    title: "Một hành trình anh hùng mang hồn Việt.",
    description: "Từ The Fool đến The World, cấu trúc RWS được kể lại bằng nhân vật, cảnh quan và biểu tượng bản địa.",
    image: "/images/major-21-the-world.webp",
    imageAlt: "Lá The World của Hường Đông Tarot, biểu tượng trăm con chung một cõi",
    badge: "22/22 tranh Ẩn chính",
    primary: { label: "Xem bộ Ẩn chính", href: "/tarot-rws" },
    secondary: { label: "Đọc câu chuyện", href: "/cau-chuyen" },
  },
  {
    eyebrow: "Hồn cốt nước Nam",
    title: "Truyền thuyết được kể rõ, không giả làm lịch sử.",
    description: "Mỗi câu chuyện đều tách biệt mạch kể, giá trị văn hóa và ranh giới chứng cứ để người đọc thưởng thức mà không lẫn kỳ ảo với thực tế.",
    image: "/images/empress-au-co.webp",
    imageAlt: "Minh họa Âu Cơ trong lá The Empress của Hường Đông Tarot",
    badge: "14 hồ sơ truyện – sử",
    primary: { label: "Đọc Hồn cốt nước Nam", href: "/hon-cot-nuoc-nam" },
    secondary: { label: "Khám phá The Empress", href: "/tarot-rws/the-empress" },
  },
  {
    eyebrow: "Ngoại sử về nước Nam",
    title: "Đọc phương Nam qua thư tịch cổ.",
    description: "Tám hồ sơ nguồn được đối chiếu, diễn nghĩa và gắn cảnh báo phạm vi để không đồng nhất địa danh cổ với biên giới Việt Nam hiện đại.",
    image: "/images/story-dawn.webp",
    imageAlt: "Bình minh trên núi sông và biển, mở đầu thế giới biểu tượng Hường Đông",
    badge: "8 nguồn đã hiệu đính",
    primary: { label: "Mở kho Ngoại sử", href: "/ngoai-su" },
    secondary: { label: "Bước vào thế giới", href: "/cau-chuyen" },
  },
];

type HeroCarouselProps = {
  /** Thời gian giữa hai slide, tính bằng mili-giây. */
  autoplayMs?: number;
  /** Giới hạn số slide được dùng, từ 1 đến tổng số slide hiện có. */
  maxSlides?: number;
};

export function HeroCarousel({ autoplayMs = 5_000, maxSlides = heroSlides.length }: HeroCarouselProps) {
  const slides = useMemo(
    () => heroSlides.slice(0, Math.max(1, Math.min(maxSlides, heroSlides.length))),
    [maxSlides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPointerPaused, setIsPointerPaused] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);
  const carouselRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const isPaused = isPointerPaused || isFocusPaused || isPageHidden;

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const previous = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length < 2 || autoplayMs <= 0) return;
    const timer = window.setInterval(next, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, isPaused, next, slides.length]);

  useEffect(() => {
    // Tải trước đúng một ảnh kế tiếp, không buộc trình duyệt tải toàn bộ carousel.
    if (slides.length < 2) return;
    const preload = new window.Image();
    preload.src = slides[(activeIndex + 1) % slides.length].image;
  }, [activeIndex, slides]);

  useEffect(() => {
    const handleVisibility = () => setIsPageHidden(document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // Theo dõi ở document để chắc chắn trạng thái hover được gỡ khi chuột rời hero.
      setIsPointerPaused(Boolean(carouselRef.current?.contains(event.target as Node)));
    };
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const slide = slides[activeIndex];

  return (
    <section
      ref={carouselRef}
      className="hero hero-carousel"
      aria-roledescription="carousel"
      aria-label="Nội dung nổi bật Hường Đông Tarot"
      onFocusCapture={() => setIsFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusPaused(false);
      }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(distance) > 50) {
          if (distance > 0) previous();
          else next();
        }
        touchStartX.current = null;
      }}
    >
      <div className="shell hero-grid hero-slide" key={activeIndex} aria-live="polite">
        <div className="hero-copy">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title}</h1>
          <p className="hero-lead">{slide.description}</p>
          <div className="hero-actions">
            <TrackedLink className="button button-primary" href={slide.primary.href} eventName="story_open" source={`home_carousel_${activeIndex + 1}`}>
              {slide.primary.label}
            </TrackedLink>
            {slide.secondary && (
              <TrackedLink className="button button-secondary" href={slide.secondary.href} eventName="story_open" source={`home_carousel_${activeIndex + 1}`}>
                {slide.secondary.label}
              </TrackedLink>
            )}
          </div>
          <p className="trust-line">Thiết kế tại Việt Nam · Nội dung giữ logic RWS · Phân định truyền thuyết và sử liệu</p>
        </div>

        <div className="hero-visual carousel-visual">
          <span className="launch-pill">{slide.badge}</span>
          <Image
            src={slide.image}
            width={1200}
            height={900}
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            unoptimized
            sizes="(max-width: 800px) calc(100vw - 2rem), 50vw"
            alt={slide.imageAlt}
          />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="shell carousel-controls">
          <div className="carousel-arrows">
            <button type="button" onClick={previous} aria-label="Xem slide trước">←</button>
            <button type="button" onClick={next} aria-label="Xem slide tiếp theo">→</button>
          </div>
          <div className="carousel-dots" role="tablist" aria-label="Chọn nội dung nổi bật">
            {slides.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Slide ${index + 1}: ${item.eyebrow}`}
                key={item.title}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <span className="carousel-status" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        </div>
      )}

      <div className="shell proof-strip" aria-label="Thông tin chính">
        <div><strong>78</strong><span>Lá bài liên kết</span></div>
        <div><strong>RWS</strong><span>Hệ nghĩa nền tảng</span></div>
        <div><strong>22/22</strong><span>Tranh Ẩn chính</span></div>
        <div><strong>99.000đ</strong><span>Đặt cọc thử nghiệm</span></div>
      </div>
    </section>
  );
}
