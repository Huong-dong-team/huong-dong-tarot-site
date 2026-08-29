/* Khai kiểu cho dữ liệu 78 lá, bài viết và cấu hình site.
 *
 * Đây là file JSDoc thuần, không có mã chạy — mục đích duy nhất là để
 * `npm run check:types` bắt được lỗi gõ sai tên trường. Không có nó, mọi thứ
 * đọc ra từ Firestore hay seed/*.json đều là `any` và trình kiểm kiểu im lặng
 * cho qua `card.nameFolks` hay `site.baseURL`.
 *
 * Nguồn sự thật của các trường: seed/cards.json, seed/posts.json,
 * seed/settings.json — chúng là bản đầy đủ 78 lá dùng khi USE_SEED_DATA=true.
 */

/**
 * @typedef {object} Seo
 * @property {string} title
 * @property {string} description
 * @property {string} [ogImage]
 */

/**
 * @typedef {object} CardImage
 * @property {string} url
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} CardSymbol
 * @property {string} name       tên mô-típ, ví dụ "Mai An Tiêm"
 * @property {string} meaning    lớp nghĩa gắn với mô-típ đó
 */

/**
 * @typedef {object} Card
 * @property {string} slug
 * @property {"major"|"minor"} arcana
 * @property {number} number
 * @property {number} order
 * @property {string} nameVi
 * @property {string} nameEn
 * @property {string} [nameFolk]        tên dân gian; thiếu thì lùi về nameVi
 * @property {string} [suit]            chỉ Ẩn Phụ mới có
 * @property {string} [rankVi]          cấp bài Ẩn Phụ: Át, Hai… Quốc Vương
 * @property {string} meaningUpright
 * @property {string} meaningReversed
 * @property {string} story
 * @property {string} question
 * @property {string[]} keywordsUpright
 * @property {string[]} keywordsReversed
 * @property {CardSymbol[]} symbols
 * @property {CardImage} image
 * @property {CardImage} thumbnail
 * @property {Seo} seo
 * @property {string} status
 * @property {string} folkStyle            phong cách mỹ thuật, map sang nhãn hiển thị
 * @property {string} imageStatus          quyết định dòng ghi chú "bản thử nghiệm"
 * @property {string} [adaptationLevel]
 * @property {string} [culturalReviewStatus]
 * @property {string[]} [sourceIds]
 * @property {object[]} [sources]
 * @property {string|null} [createdAt]
 * @property {string|null} [updatedAt]
 */

/**
 * Lá bài sau khi build.js bồi thêm các trường dẫn xuất để đổ vào template.
 * Tách riêng khỏi Card vì đây không phải dữ liệu nguồn — Firestore không có
 * các trường này, chúng chỉ tồn tại trong tiến trình build.
 *
 * @typedef {Card & {
 *   nameFolk: string,
 *   suitValue: string,
 *   arcanaLabel: string,
 *   displayNumber: string,
 *   folkStyleLabel: string,
 *   artNote: string,
 *   keywordHtml?: string,
 *   symbolHtml?: string,
 *   minorDetailsHtml?: string,
 *   reflectionHtml: string,
 * }} EnrichedCard
 */

/**
 * @typedef {object} Post
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} contentHtml
 * @property {string} publishedAt
 * @property {string} status
 * @property {Seo} seo
 * @property {string} author
 * @property {{ url: string, alt: string }} [coverImage]
 * @property {string} [updatedAt]
 * @property {string} [createdAt]
 * @property {string[]} [tags]
 */

/**
 * @typedef {object} Site
 * @property {string} siteName
 * @property {string} tagline
 * @property {string} description
 * @property {string} baseUrl
 * @property {string} defaultOgImage
 * @property {string} [ga4Id]
 * @property {string} [contactEmail]
 * @property {Record<string, string>} [social]
 */

/**
 * @typedef {object} SiteData
 * @property {Card[]} cards
 * @property {Post[]} posts
 * @property {Site} site
 */

export {};
