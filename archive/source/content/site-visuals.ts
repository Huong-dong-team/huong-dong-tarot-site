export interface SiteVisual {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Nguồn hình ảnh tập trung cho các trang editorial.
 * Developer chỉ cần đổi đường dẫn, alt hoặc kích thước tại đây; component giữ nguyên.
 */
export const siteVisuals = {
  storyDawn: {
    src: "/images/story-dawn.webp",
    alt: "Bình minh trên châu thổ sông Việt, núi và biển nối nhau dưới mặt trời đỏ cùng những dải mây uốn lượn",
    width: 1536,
    height: 1024,
  },
  fourHouses: {
    src: "/images/four-houses.webp",
    alt: "Bốn cụm thực vật tre, dâu tằm, hoa sen và bông lúa kết nối quanh một đĩa mặt trời đỏ",
    width: 1536,
    height: 1024,
  },
  empressAuCo: {
    src: "/images/empress-au-co.webp",
    alt: "Minh họa Âu Cơ trong sắc xanh ngọc giữa hoa sen, bông lúa, mặt trời đỏ và chòm hình trứng tượng trưng nguồn sinh",
    width: 1024,
    height: 1536,
  },
} satisfies Record<string, SiteVisual>;
