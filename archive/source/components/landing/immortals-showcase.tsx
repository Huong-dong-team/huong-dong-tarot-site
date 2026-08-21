import Image from "next/image";
import styles from "@/styles/landing.module.css";

const immortals = [
  {
    id: "tan-vien",
    numeral: "I",
    name: "Tản Viên Sơn Thánh",
    tarot: "VIII · Strength",
    image: "/images/immortals/tan-vien.webp",
    alt: "Tản Viên Sơn Thánh đứng giữa núi rừng và mây nước trong tranh in ngọc sẫm",
    theme: "Điều hòa sức mạnh",
  },
  {
    id: "thanh-giong",
    numeral: "II",
    name: "Thánh Gióng",
    tarot: "VII · The Chariot",
    image: "/images/immortals/thanh-giong.webp",
    alt: "Thánh Gióng đứng giữa rừng tre, bên hình tượng ngựa sắt và lửa son tiết chế",
    theme: "Ý chí bảo hộ",
  },
  {
    id: "chu-dong-tu",
    numeral: "III",
    name: "Chử Đồng Tử",
    tarot: "IX · The Hermit",
    image: "/images/immortals/chu-dong-tu.webp",
    alt: "Chử Đồng Tử ngồi bên sông, cạnh hoa sen, lau sậy và một ngọn đèn nhỏ",
    theme: "Khai mở minh triết",
  },
  {
    id: "lieu-hanh",
    numeral: "IV",
    name: "Mẫu Liễu Hạnh",
    tarot: "XVII · The Star",
    image: "/images/immortals/mau-lieu-hanh.webp",
    alt: "Mẫu Liễu Hạnh đứng trước phủ thờ Bắc Bộ, dưới một sao lớn và bảy sao dẫn đường",
    theme: "Hy vọng chỉ đường",
  },
] as const;

export function ImmortalsShowcase() {
  return (
    <div className={styles.immortalsGallery}>
      <header className={styles.immortalsHeading}>
        <div>
          <p className={styles.eyebrow}>Điện thờ biểu tượng Việt · 01 — 04</p>
          <h2 id="immortals-title">Tứ Bất Tử.<br />Một họ hình ảnh.</h2>
        </div>
        <p>
          Bốn vị được trưng bày như một bộ tranh in mỹ thuật thống nhất: nền ngọc sẫm, giấy ngà,
          nét đồng cổ và quầng son — mỗi người giữ một lực riêng trong hệ nghĩa Tarot Hường Đông.
        </p>
      </header>

      <div className={styles.immortalsStrip} role="list" aria-label="Bốn vị trong Tứ Bất Tử">
        {immortals.map((immortal) => (
          <figure className={styles.immortalCard} role="listitem" key={immortal.id}>
            <div className={styles.immortalArtwork}>
              <Image
                src={immortal.image}
                fill
                unoptimized
                sizes="(max-width: 600px) 78vw, (max-width: 920px) 44vw, 24vw"
                alt={immortal.alt}
              />
              <span aria-hidden="true">{immortal.numeral}</span>
            </div>
            <figcaption>
              <small>{immortal.tarot}</small>
              <strong>{immortal.name}</strong>
              <span>{immortal.theme}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className={styles.immortalsNote}>
        <span>Ấn bản Tứ Bất Tử</span>
        Bốn lá đứng cạnh nhau thành một chỉnh thể; Âu Cơ là chuẩn mỹ thuật tham chiếu, không thuộc nhóm Tứ Bất Tử.
      </p>
    </div>
  );
}
