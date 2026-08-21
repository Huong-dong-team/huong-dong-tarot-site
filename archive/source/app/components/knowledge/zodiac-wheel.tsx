import { zodiacSigns } from "@/content/astrology";

export function ZodiacWheel() {
  return (
    <div className="zodiac-wheel" aria-label="Vòng 12 cung Hoàng đạo">
      <svg viewBox="0 0 360 360" role="img" aria-labelledby="zodiac-title zodiac-description">
        <title id="zodiac-title">Vòng Hoàng đạo nguyên bản</title>
        <desc id="zodiac-description">Mười hai cung xếp quanh bốn vòng nguyên tố Lửa, Đất, Khí và Nước.</desc>
        <circle cx="180" cy="180" r="154" className="wheel-ring" />
        <circle cx="180" cy="180" r="92" className="wheel-ring wheel-ring-inner" />
        {zodiacSigns.map((sign, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = 180 + Math.cos(angle) * 124;
          const y = 180 + Math.sin(angle) * 124;
          return <text key={sign.slug} x={x} y={y} textAnchor="middle" dominantBaseline="central">{sign.symbol}</text>;
        })}
        <path d="M180 112 199 161 248 180 199 199 180 248 161 199 112 180 161 161Z" className="wheel-star" />
        <circle cx="180" cy="180" r="22" className="wheel-sun" />
      </svg>
    </div>
  );
}
