import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { renderString, escapeHtml } from "./lib/render.js";
import { absoluteUrl, analyticsSnippet, breadcrumbSchema, seoHead } from "./lib/seo.js";
import { fillMinorDetails } from "./lib/minor-details-fallback.js";
import { reflectionLens } from "../content/reflection-lenses.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

async function loadEnv() {
  const file = path.join(root, ".env");
  if (!(await access(file).then(() => true).catch(() => false))) return;
  for (const line of (await readFile(file, "utf8")).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

await loadEnv();
const useSeed = process.env.USE_SEED_DATA === "true";
const readJson = async (name) => JSON.parse(await readFile(path.join(root, "seed", name), "utf8"));

/**
 * Đọc dữ liệu site: Firestore là nguồn thật, seed/*.json dùng khi
 * USE_SEED_DATA=true hoặc để bù trường Ẩn Phụ còn trống.
 *
 * @returns {Promise<import("./lib/types.js").SiteData>}
 */
async function loadData() {
  if (useSeed) return { cards: await readJson("cards.json"), posts: await readJson("posts.json"), site: await readJson("settings.json") };
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error("Thiếu GOOGLE_APPLICATION_CREDENTIALS. Dùng npm run build:local để xem dữ liệu mẫu.");
  if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
  const db = getFirestore();
  const [cardSnap, postSnap, siteSnap] = await Promise.all([
    db.collection("cards").where("status", "==", "published").orderBy("order").get(),
    db.collection("posts").where("status", "==", "published").orderBy("publishedAt", "desc").get(),
    db.collection("settings").doc("site").get(),
  ]);
  const normalize = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value?.toDate ? value.toDate().toISOString() : value]));
  // Firestore là nguồn ưu tiên; seed chỉ bù trường chi tiết Ẩn Phụ còn trống,
  // không đè giá trị đang có. Xem lib/minor-details-fallback.js.
  const liveCards = /** @type {import("./lib/types.js").Card[]} */ (cardSnap.docs.map((doc) => normalize(doc.data())));
  const livePosts = /** @type {import("./lib/types.js").Post[]} */ (postSnap.docs.map((doc) => normalize(doc.data())));
  return { cards: fillMinorDetails(liveCards, await readJson("cards.json")), posts: livePosts, site: siteSnap.exists ? normalize(siteSnap.data()) : await readJson("settings.json") };
}

const data = await loadData();
data.site.baseUrl = process.env.SITE_BASE_URL || data.site.baseUrl;
// Giá bộ bài là một quyết định sản phẩm, không phải câu chữ rải rác. Giữ cả
// giá trị máy đọc và hai cách hiển thị ở một chỗ để HTML, FAQ và JSON-LD luôn
// đổi cùng nhau khi chủ dự án chốt giá mới.
const PACK_PRICE = Object.freeze({
  vnd: 690000,
  label: "690.000đ",
  compactLabel: "690k",
});
const PACK_TIERS = Object.freeze([
  Object.freeze({
    id: "standard",
    name: "Standard",
    vnd: 390000,
    label: "390.000đ",
    image: "/assets/img/shop/standard-pack-v1.png",
    alt: "Bộ Standard gồm 78 lá Tarot Hường Đông và hộp giấy",
    featured: false,
    features: Object.freeze(["78 lá bài", "Hộp giấy mỹ thuật", "Thẻ hướng dẫn nhanh"]),
  }),
  Object.freeze({
    id: "premium",
    name: "Premium",
    vnd: PACK_PRICE.vnd,
    label: PACK_PRICE.label,
    image: "/assets/img/shop/premium-pack-v1.png",
    alt: "Bộ Premium gồm bài, hộp giấy và sách Reader Guide",
    featured: true,
    features: Object.freeze(["Toàn bộ gói Standard", "Sách hướng dẫn dành cho reader", "Bookmark Hường Đông"]),
  }),
  Object.freeze({
    id: "signature",
    name: "Signature",
    vnd: 990000,
    label: "990.000đ",
    image: "/assets/img/shop/signature-pack-v1.png",
    alt: "Bộ Signature gồm bài, hộp gỗ sơn mài, sách, túi gấm và chứng nhận đánh số",
    featured: false,
    features: Object.freeze(["Toàn bộ gói Premium", "Hộp gỗ sơn mài khóa đồng", "Túi gấm thêu tay", "Thẻ chứng nhận đánh số"]),
  }),
]);

function priceTiersHtml() {
  return PACK_TIERS.map((tier) => {
    const features = tier.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
    const ribbon = tier.featured ? '<p class="price-tier-ribbon">Được đề xuất</p>' : "";
    return `<article id="${tier.id}" class="price-tier${tier.featured ? " is-featured" : ""}" data-tier="${tier.id}">${ribbon}<div class="price-tier-copy"><h3>${escapeHtml(tier.name)} <span aria-hidden="true">·</span> <strong>${escapeHtml(tier.label)}</strong></h3><ul class="price-tier-features">${features}</ul></div><figure class="price-tier-visual"><img src="${tier.image}" width="1024" height="768" loading="lazy" decoding="async" alt="${escapeHtml(tier.alt)}"></figure><a class="button price-tier-cta" href="/#danh-sach-cho">Vào danh sách chờ</a></article>`;
  }).join("");
}
const lncq22 = JSON.parse(await readFile(path.join(root, "data", "lncq-22.json"), "utf8"));
// Khối Lĩnh Nam chích quái cho lá Ẩn chính. Dẫn nguồn theo CHƯƠNG (bản này không có số trang).
function lncqBlock(slug) {
  const e = lncq22[slug];
  if (!e) return "";
  if (!e.inLNCQ) {
    return `<section class="lncq-block"><p class="eyebrow">Nguồn tư liệu</p><h2>Ngoài Lĩnh Nam chích quái</h2><p class="lncq-warn">${escapeHtml(e.summary)}</p></section>`;
  }
  const quote = e.quote ? `<blockquote class="lncq-quote">${escapeHtml(e.quote)}</blockquote>` : "";
  return `<section class="lncq-block"><p class="eyebrow">Lĩnh Nam chích quái</p><h2>Chương ${e.chapter} · ${escapeHtml(e.chapterTitle)}</h2><p>${escapeHtml(e.summary)}</p>${quote}<p class="lncq-cite"><strong>Dẫn nguồn:</strong> Trần Thế Pháp, <em>Lĩnh Nam chích quái</em>, ${escapeHtml(e.chapterTitle)} (chương ${e.chapter}). Trích theo bản tiếng Việt hiệu chỉnh chính tả 2026, nguồn PDF dilib.vn. <span class="lncq-caveat">Bản dùng ở đây <strong>không phải ấn bản khảo dị/dịch chú học thuật</strong> và <strong>không có số trang</strong>; để trích dẫn học thuật theo trang, dùng bản dịch Đinh Gia Khánh – Nguyễn Ngọc San (NXB Văn học).</span></p></section>`;
}
const lncqChapters = JSON.parse(await readFile(path.join(root, "data", "lncq-chapters.json"), "utf8"));

// Mục lục 34 truyện Lĩnh Nam chích quái, chèn vào phòng tư liệu của Bảo tàng.
function lncqIndexHtml() {
  const rows = lncqChapters.map((c) => {
    const cards = c.cards.length
      ? c.cards.map((k) => `<a class="v2-link" href="/la-bai/${k.slug}/">${escapeHtml(k.roman)}</a>`).join(" · ")
      : '<span class="lncq-nocard">—</span>';
    return `<tr><td>${c.n}</td><td><a class="v2-link" href="/la-bai/huyen-su/${c.slug}/">${escapeHtml(c.title)}</a></td><td>${cards}</td></tr>`;
  }).join("");
  return `<table class="v2-table lncq-index"><thead><tr><th>Chương</th><th>Truyện</th><th>Lá Ẩn chính</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// Trang toàn văn từng truyện.
function lncqChapterHtml(c, prev, next) {
  const body = c.paras.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  const cards = c.cards.length
    ? `<p class="lncq-cards"><strong>Truyện này ứng với:</strong> ${c.cards.map((k) => `<a class="v2-link" href="/la-bai/${k.slug}/">${escapeHtml(k.roman)}</a>`).join(" · ")}</p>`
    : `<p class="lncq-cards lncq-nocard">Truyện này chưa gắn với lá Ẩn chính nào.</p>`;
  const nav = `<nav class="card-pagination" aria-label="Điều hướng truyện">${prev ? `<a href="/la-bai/huyen-su/${prev.slug}/">← ${escapeHtml(prev.title)}</a>` : "<span></span>"}<a href="/la-bai/#phong-huyen-su">Đủ 34 truyện</a>${next ? `<a href="/la-bai/huyen-su/${next.slug}/">${escapeHtml(next.title)} →</a>` : "<span></span>"}</nav>`;
  return `<main id="noi-dung-chinh" class="transition-page" data-page="library-source"><section class="page-hero drum-watermark"><p class="eyebrow">Bảo tàng 78 lá · Lĩnh Nam chích quái · Chương ${c.n}</p><h1>${escapeHtml(c.title)}</h1></section><section class="v2-prose lncq-full">${cards}${body}<p class="lncq-cite"><strong>Dẫn nguồn:</strong> Trần Thế Pháp, <em>Lĩnh Nam chích quái</em>, ${escapeHtml(c.title)} (chương ${c.n}). Nguyên tác thế kỷ XIV, đã thuộc phạm vi công cộng. Trích theo bản tiếng Việt hiệu chỉnh chính tả 2026. <span class="lncq-caveat">Bản này <strong>không phải ấn bản khảo dị/dịch chú học thuật</strong> và <strong>không có số trang</strong>; để trích dẫn theo trang, dùng bản dịch Đinh Gia Khánh – Nguyễn Ngọc San (NXB Văn học).</span></p>${nav}</section></main>`;
}

const templates = Object.fromEntries(await Promise.all(["_layout", "home", "card-list", "card-detail", "post-list", "post-detail", "about", "privacy", "404", "tarot-la-gi", "khoa-hoc", "huyen-su", "cua-hang", "development"].map(async (name) => [name, await readFile(path.join(root, "templates", `${name}.html`), "utf8")])));
// Critical CSS nằm trên đường tải quan trọng nhất. Chú thích trong tệp nguồn
// đáng giữ — chúng ghi lý do của từng luật — nhưng nhúng ra thì vô dụng với
// trình duyệt. Gỡ chú thích khi nhúng: tệp nguồn vẫn đọc được, bản gửi đi gọn.
//
// Sau khi gỡ chú thích thì gộp luôn xuống dòng và thụt lề. Các tệp nguồn được
// viết dạng dễ đọc — mỗi khai báo một dòng, thụt hai dấu cách — và toàn bộ chỗ
// trắng đó đang được gửi đi kèm MỌI trang. Gộp lại tiết kiệm ~2,7 KB mỗi lượt
// tải đầu, đủ để ngân sách 20 KB từ chỗ chỉ còn ~800 ký tự nới ra gấp đôi.
//
// Cố ý KHÔNG nén sâu hơn. Bỏ khoảng trắng quanh { } : ; , thì gọn thêm ~1,9 KB
// nữa, nhưng ba tệp này có 65 chuỗi trong ngoặc kép (tên font) và 3 selector có
// khoảng trắng trước dấu hai chấm — regex sẽ nuốt nhầm và làm hỏng luật. Muốn
// mức đó thì phải dùng parser CSS thật, tức thêm một phụ thuộc; repo này giữ
// đúng hai phụ thuộc chạy thật nên không đáng đổi.
async function loadCriticalCss(files) {
  const css = (await Promise.all(files.map((file) => readFile(path.join(root, "public", "assets", "css", file), "utf8")))).join("\n");
  if (/<\/style/i.test(css)) throw new Error("Critical CSS chứa chuỗi đóng thẻ style không an toàn.");
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}
// Trang chủ và trang trong có hai khung đầu khác nhau. Chỉ phần nền tảng/font
// là dùng chung; critical-inner.css không đi theo trang chủ, tránh gửi các luật
// card-detail/v2-prose không bao giờ dùng ở route `/`.
const criticalBaseCss = await loadCriticalCss(["fonts.css", "custom-fonts.css", "critical.css"]);
// Route trong cần Fontasia cho page hero, Harmoni cho H1 card detail và Be
// Vietnam Pro cho UI. Chỉ gỡ các face dành riêng cho trích dẫn/card khỏi
// critical CSS để giữ ngân sách inline 20 KB.
const criticalInnerBaseCss = criticalBaseCss
  .replace(/@font-face\s*\{[^}]*font-family:\s*"(?:Inter|Ganh|DFVN TAN Mon Cheri)"[^}]*\}/g, "")
  .replace(/\.home-page \.hero h1(?: \.hero-headline-accent)?\s*\{[^}]*\}/g, "")
  .replace(/\.home-page \.hero \.hero-subheadline\s*\{[^}]*\}/g, "")
  .replace(/\.hero-panel\s*\{[^}]*\}/g, "")
  // `.hero` không phải `.page-hero`; route trong không dựng khối trang chủ này.
  .replace(/\.hero\s*\{[^}]*\}/g, "")
  .replace(/\.hero-overlay\s*\{[^}]*\}/g, "");
const criticalInnerCss = `${criticalInnerBaseCss} ${await loadCriticalCss(["critical-inner.css"])}`;
const dateLabel = (value) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value || Date.now()));
const roman = (number) => ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"][number] || String(number);
const arcanaLabel = (card) => card.arcana === "major" ? "Ẩn Chính" : "Ẩn Phụ";
const folkStyleLabel = { "dong-ho": "Đông Hồ", "hang-trong": "Hàng Trống", "kim-hoang": "Kim Hoàng" };

// Chú thích tranh. Bản Art Direction 2.1 đổi nhân vật của 16 lá, nhưng tranh thì
// chưa vẽ lại — bức đang phát hành vẫn là nhân vật cũ. Nói rõ điều đó ngay dưới
// tranh còn hơn để người đọc tự phát hiện tên và hình không khớp. Chuỗi rỗng
// nghĩa là tranh đã chốt, không hiện gì.
const ART_NOTE = {
  REDRAW: "Tranh đang được vẽ lại theo bản Art Direction 2.1; bức hiện tại là bản cũ.",
  NEW_CONCEPT: "Tranh mới đang được phác theo bản Art Direction 2.1; bức hiện tại là bản cũ.",
  EXPERIMENT: "Bố cục đang thử nghiệm; bức hiện tại chưa phải bản chốt.",
  ADJUST: "Tranh đang được chỉnh theo bản Art Direction 2.1.",
  ADJUST_MINOR: "Tranh đang được chỉnh nhẹ theo bản Art Direction 2.1.",
  MISSING: "Chưa có tranh riêng cho lá này; đang dùng phù hiệu của nhà.",
  KEEP: "",
  KEEP_IMAGE_LOCK_NAME: "",
};

const ADAPTATION_LEVEL_LABEL = Object.freeze({
  LNCQ_CORE: "Lĩnh Nam chích quái — phần chính",
  LNCQ_CORE_ADAPTATION: "Dựa trên Lĩnh Nam chích quái, có biên tập khoảnh khắc",
  LNCQ_TUC_BIEN_ADAPTATION: "Dựa trên phần Tục Biên, có chuyển thể",
  VIET_FOLK_EXPANDED_ADAPTATION: "Tín ngưỡng Việt mở rộng ngoài Lĩnh Nam chích quái",
  EDITORIAL_FANTASY_INSPIRED: "Cảnh mới sáng tác, chỉ mượn motif",
});

const cleanText = (value) => String(value ?? "").trim();
const plainTextFromHtml = (value) => String(value ?? "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const truncateWords = (value, maxLength = 360) => {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength + 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > 0 ? boundary : maxLength).trim()}…`;
};

function detailCard(title, value, className = "v2-card") {
  const text = cleanText(value);
  return text ? `<article class="${className}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>` : "";
}

function reflectionHtml(card) {
  const lens = reflectionLens(card);
  return `<section class="v2-prose reflection-lens" data-reflection-lens><p class="eyebrow">Góc soi chiếu</p><h2>Điều lá bài có thể làm hiện ra</h2><p class="lead">${escapeHtml(lens.pattern)}</p><div class="v2-two"><article class="v2-card"><h3>Phần dễ bị bỏ quên</h3><p>${escapeHtml(lens.unseen)}</p></article><article class="v2-card"><h3>Đối thoại với hình ảnh</h3><p>${escapeHtml(lens.dialogue)}</p></article></div><blockquote>${escapeHtml(lens.integration)}</blockquote><p class="v2-note">Đây là gợi ý tự phản tư, không phải kết luận về tính cách, chẩn đoán tâm lý hay bằng chứng về ý định của người khác.</p></section>`;
}

// Dựng sẵn bốn khối cho Ẩn Phụ để template không phải lồng điều kiện. Mỗi
// trường được lọc trước khi sinh thẻ, nhờ vậy dữ liệu thiếu không tạo đoạn rỗng
// và dữ liệu Firestore luôn đi qua escapeHtml trước khi vào HTML.
function minorDetailsHtml(card) {
  if (card.arcana !== "minor") return "";

  const subject = cleanText(card.subject);
  const sceneTitle = cleanText(card.sceneTitle);
  const scene = cleanText(card.scene);
  const shortStory = cleanText(card.shortStory);
  const contextParts = [
    subject ? `<p><strong>Chủ thể:</strong> ${escapeHtml(subject)}</p>` : "",
    scene ? `<p>${escapeHtml(scene)}</p>` : "",
    shortStory ? `<p>${escapeHtml(shortStory)}</p>` : "",
  ].filter(Boolean).join("");
  const context = contextParts
    ? `<section class="v2-prose minor-detail" data-minor-details="context"><p class="eyebrow">Chủ thể và cảnh</p><h2>${escapeHtml(sceneTitle || "Chủ thể và cảnh")}</h2>${contextParts}</section>`
    : "";

  const fields = [
    detailCard("Tình yêu", card.love),
    detailCard("Công việc", card.career),
    detailCard("Tài chính", card.finance),
    detailCard("Sức khỏe", card.health),
  ].filter(Boolean).join("");
  const applications = fields
    ? `<section class="v2-prose minor-detail" data-minor-details="applications"><p class="eyebrow">Theo lĩnh vực</p><h2>Khi soi theo từng lĩnh vực</h2><div class="v2-grid">${fields}</div></section>`
    : "";

  const guidanceCards = [
    detailCard("Lời khuyên", card.advice, "v2-card v2-note"),
    detailCard("Cảnh báo", card.warning, "v2-card v2-warn"),
  ].filter(Boolean).join("");
  const guidance = guidanceCards
    ? `<section class="v2-prose minor-detail" data-minor-details="guidance"><p class="eyebrow">Gợi ý thực hành</p><h2>Lời khuyên và cảnh báo</h2><div class="v2-two">${guidanceCards}</div></section>`
    : "";

  const sources = Array.isArray(card.sources)
    ? card.sources.map((source) => {
      const id = cleanText(source?.id);
      const title = cleanText(source?.title);
      if (!id && !title) return "";
      const sourceName = [id ? `<strong>${escapeHtml(id)}</strong>` : "", title ? escapeHtml(title) : ""].filter(Boolean).join(" · ");
      const corpus = source?.isLNCQ ? " <span>— Lĩnh Nam chích quái</span>" : "";
      return `<li>${sourceName}${corpus}</li>`;
    }).filter(Boolean).join("")
    : "";
  const levelCode = cleanText(card.adaptationLevel);
  const level = ADAPTATION_LEVEL_LABEL[levelCode] || levelCode;
  const sourceParts = [
    level ? `<p><strong>Mức chuyển thể:</strong> ${escapeHtml(level)}</p>` : "",
    sources ? `<ul class="v2-list">${sources}</ul>` : "",
  ].filter(Boolean).join("");
  const citations = sourceParts
    ? `<section class="v2-prose minor-detail" data-minor-details="sources"><p class="eyebrow">Nguồn tư liệu</p><h2>Dẫn nguồn và mức chuyển thể</h2>${sourceParts}</section>`
    : "";

  return `${context}${applications}${guidance}${citations}`;
}

/** @type {import("./lib/types.js").EnrichedCard[]} */
const cards = data.cards.map((card, index) => ({
  ...card,
  nameFolk: card.nameFolk || card.nameVi,
  suitValue: card.suit || "",
  arcanaLabel: arcanaLabel(card),
  displayNumber: card.arcana === "major" ? roman(card.number) : card.nameVi.split(" ")[0],
  folkStyleLabel: folkStyleLabel[card.folkStyle] || "Mỹ thuật Việt",
  artNote: ART_NOTE[card.imageStatus] ?? "",
  minorDetailsHtml: minorDetailsHtml(card),
  reflectionHtml: reflectionHtml(card),
  searchText: [card.nameVi, card.nameEn, card.nameFolk, ...(card.keywordsUpright || [])].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
  museumIndex: String(index + 1).padStart(2, "0"),
  museumAccession: `${arcanaLabel(card)} · ${card.arcana === "major" ? roman(card.number) : card.nameVi.split(" ")[0]}`,
  museumSource: (card.sources || []).map((source) => source.title).filter(Boolean).slice(0, 2).join(" · ") || "Hồ sơ Hường Đông",
  museumSummary: truncateWords(plainTextFromHtml(card.story)),
}));
const posts = data.posts.map((post) => ({ ...post, dateLabel: dateLabel(post.publishedAt) }));

function organizationSchema() {
  return { "@context": "https://schema.org", "@type": "Organization", name: data.site.siteName, url: data.site.baseUrl, logo: absoluteUrl(data.site.baseUrl, "/assets/img/logo-huong-dong-600.png") };
}

// Giá trị dùng chung cho chân trang mọi trang. Đây là dữ liệu build-time:
// đổi trong /admin/ rồi phải xuất bản lại website mới thấy thay đổi.
const social = data.site.social || {};
// Chỉ nhận http(s) để URL do admin nhập không thành javascript: trong href.
const safeUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try { const url = new URL(raw); return /^https?:$/.test(url.protocol) ? url.toString() : ""; } catch { return ""; }
};
// Dựng sẵn HTML mạng xã hội thay vì lồng {{#if}} trong template: renderString
// dùng regex non-greedy nên {{#if}} lồng nhau sẽ đóng sai thẻ.
const socialLinks = [
  ["Facebook", safeUrl(social.facebook)],
  ["Threads", safeUrl(social.threads)],
  ["TikTok", safeUrl(social.tiktok)],
].filter(([, url]) => url);
/* Menu con của "Chuyện Hường Đông" lấy từ bài đã xuất bản, nên phải sinh lúc
   build. Giới hạn 4 bài mới nhất: thanh điều hướng không phải trang lưu trữ, và
   trên di động mọi menu con đều mở sẵn nên danh sách dài sẽ đẩy các mục khác
   xuống dưới màn hình. Hai mục tĩnh luôn đứng cuối để menu không bao giờ rỗng
   khi chưa có bài nào. */
const navPostsHtml = [
  ...posts.slice(0, 4).map((post) => `<li><a href="/tin-tuc/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></li>`),
  '<li><a href="/tin-tuc/">Tất cả bài viết</a></li>',
  '<li><a href="/gioi-thieu/">Giới thiệu Hường Đông</a></li>',
].join("");

const layoutSettings = {
  navPostsHtml,
  analytics: analyticsSnippet(data.site),
  tagline: data.site.tagline || "",
  contactEmail: data.site.contactEmail || "",
  socialHtml: socialLinks.length
    ? `<br>${socialLinks.map(([label, url]) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow">${label}</a>`).join(" · ")}`
    : "",
};

/* Cảnh Kirigami 3D gắn theo route. Năm nhóm nội dung dùng cùng một hệ
   giấy cắt vật lý, bảng màu Hường Đông và entrance/fade animation.
   Trang chủ bàn giao tự quản lý toàn bộ tranh trong templates/home.html.

   Đặt ở đây thay vì rải vào 14 template vì hai lý do. Một: bàn giao đã nói
   dùng data-page-art chứ đừng dò URL trong JS, và build là chỗ duy nhất biết
   chắc route của từng trang. Hai: mọi trang đều đi qua layout(), nên một chỗ
   sửa là cả website đổi theo — không có đường nào để một route lọt lưới.

   Không tự gắn tranh cho route ngoài bảng: /gioi-thieu/, /quyen-rieng-tu/ và
   /404.html giữ nguyên Layer 0 thay vì mượn sai tranh home-content. */
const PAGE_ART = [
  { id: "khoa-hoc",          match: (p) => p.startsWith("/khoa-hoc/") },
  { id: "la-bai",            match: (p) => p.startsWith("/la-bai/") },
  { id: "tarot-la-gi",       match: (p) => p === "/tarot-la-gi/" },
  { id: "chuyen-huong-dong", match: (p) => p.startsWith("/tin-tuc/") },
  { id: "cua-hang",          match: (p) => p === "/cua-hang/" },
];

/**
 * Cảnh Kirigami nào thuộc route này.
 * @param {string} routePath
 * @returns {string} id trong PAGE_ART, hoặc chuỗi rỗng nếu route không có cảnh
 */
function pageArtId(routePath) {
  return PAGE_ART.find((entry) => entry.match(routePath))?.id || "";
}

/**
 * Tạo picture cho cảnh Kirigami 3D của route. PNG được giữ local làm nguồn
 * bàn giao; WebP là bản duy nhất được xuất bản để năm Hero không đội dung lượng.
 * @param {string} artId
 * @param {"hero"|"content"} placement
 * @returns {string}
 */
function pageArtworkPicture(artId, placement) {
  const src = (ext) => `/assets/img/subpage-3d/${artId}-kirigami-3d.${ext}`;
  const isHero = placement === "hero";
  const className = isHero ? "subpage-hero-artwork kirigami-3d-artwork" : "subpage-artwork";
  const loading = isHero
    ? 'loading="eager" decoding="async" fetchpriority="high"'
    : 'loading="lazy" decoding="async" fetchpriority="low"';

  return `<picture class="${className}" aria-hidden="true">`
    + `<source type="image/webp" srcset="${src("webp")}">`
    + `<img src="${src("webp")}" width="1536" height="1024" alt="" ${loading}>`
    + "</picture>";
}

/* V3 biến mỗi trang trong thành một chương trong cùng một cuốn sách Kirigami.
   Dải mục lục dùng anchor đã có trong nội dung nên không tạo route hay thay đổi
   hành vi. Nhãn cuối Hero là bản dịch trực tiếp của component nhãn giấy trong
   mockup hệ năm đường nội dung. */
const KIRIGAMI_PAGE_META = {
  "tarot-la-gi": {
    label: "Tarot là gì?",
    chapter: "Mục 1",
    links: [["#lich-su", "Nguồn gốc"], ["#cau-truc", "Cấu trúc"], ["#vi-sao", "Cách kể Việt"], ["#thu-mot-la", "Thử một lá"]],
  },
  "la-bai": {
    label: "Bảo tàng 78 lá",
    chapter: "Mục 2",
    links: [["#bo-suu-tap", "Đại sảnh"], ["?arcana=major#bo-suu-tap", "Ẩn Chính"], ["?arcana=minor#bo-suu-tap", "Ẩn Phụ"], ["#phong-huyen-su", "Huyền sử"]],
  },
  "khoa-hoc": {
    label: "Khóa học Tarot",
    chapter: "Mục 3",
    links: [["#lo-trinh", "Lộ trình"], ["#nen-tang-rws", "Nền tảng RWS"], ["#bo-cuc-trai-bai", "Đọc bố cục"], ["#huyen-su", "Đọc nguồn Việt"]],
  },
  "chuyen-huong-dong": {
    label: "Bản tin Hường Đông",
    chapter: "Mục 4",
    links: [["/tin-tuc/", "Ghi chép mới"], ["/tarot-la-gi/", "Cách chúng tôi kể"], ["/la-bai/#phong-huyen-su", "Nguồn huyền sử"]],
  },
  "cua-hang": {
    label: "Cửa hàng",
    chapter: "Mục 5",
    links: [["#bo-bai", "Ba phiên bản"], ["#sach-nho", "Reader Guide"], ["#danh-sach-cho-gioi-thieu", "Danh sách chờ"], ["#hoc-qua-email", "Học qua email"]],
  },
};

function kirigamiPageLabel(artId) {
  const meta = KIRIGAMI_PAGE_META[artId];
  if (!meta) return "";
  return `<div class="kirigami-page-label" aria-hidden="true"><span>${meta.chapter}</span><strong>${meta.label}</strong></div>`;
}

function kirigamiChapterNav(artId) {
  const meta = KIRIGAMI_PAGE_META[artId];
  if (!meta) return "";
  const links = meta.links.map(([href, label], index) => (
    `<a href="${href}"><span>${String(index + 1).padStart(2, "0")}</span>${label}</a>`
  )).join("");
  return `<nav class="kirigami-chapter-bar" aria-label="Mục lục ${meta.label}">`
    + `<p><span>${meta.chapter}</span><strong>${meta.label}</strong></p><div>${links}</div></nav>`;
}

function addClass(openTag, className) {
  if (/\bclass="[^"]*"/.test(openTag)) {
    return openTag.replace(/\bclass="([^"]*)"/, (_whole, classes) => {
      const next = new Set(classes.split(/\s+/).filter(Boolean));
      next.add(className);
      return `class="${[...next].join(" ")}"`;
    });
  }
  return openTag.replace(/>$/, ` class="${className}">`);
}

/**
 * Đặt tranh vào khung mở đầu thật sự của route.
 *
 * .page-hero là trường hợp chuẩn. Chi tiết lá dùng .card-detail như Hero mở
 * đầu; bài viết dùng <header> bên trong .post-detail. Nhờ vậy các pattern /*
 * trong bảng route vẫn có tranh mà không cần dựng thêm một Hero giả.
 * Phần nội dung sau Hero giữ Layer 1 nhưng không lặp lại Layer 2.
 *
 * @param {string} content HTML thân trang đã render
 * @param {string} artId   id tranh, rỗng thì trả nguyên content
 * @returns {string}
 */
function withPageArt(content, artId) {
  if (!artId) return content;

  // Tệp template kết thúc bằng một dòng trống; cắt trước khi soi hai đầu chuỗi.
  const trimmed = content.trim();
  const openMain = trimmed.match(/^<main\b[^>]*>/);
  if (!openMain) return content;
  const closeMain = "</main>";
  const closeAt = trimmed.lastIndexOf(closeMain);
  if (closeAt === -1) return content;

  const head = openMain[0].replace(/>$/, ` data-page-art="${artId}">`);
  let body = trimmed.slice(openMain[0].length, closeAt);
  // Giữ nguyên phần đuôi template sau </main>, nếu có.
  const tail = trimmed.slice(closeAt + closeMain.length);

  const heroArt = pageArtworkPicture(artId, "hero");
  const leadingHero = body.match(/^\s*<(section|article)\b[^>]*class="[^"]*\b(page-hero|card-detail)\b[^"]*"[^>]*>/);
  if (leadingHero) {
    const [openTag, tagName] = leadingHero;
    const start = leadingHero.index ?? 0;
    const closeTag = `</${tagName}>`;
    const end = body.indexOf(closeTag, openTag.length);
    if (end !== -1) {
      const leadEnd = end + closeTag.length;
      // lacquer-hero là hook tương thích cho animation cũ; kirigami-hero đánh
      // dấu hệ hình ảnh mới. Không còn asset sơn mài nào được gắn vào Hero.
      const decoratedOpen = addClass(addClass(openTag, "lacquer-hero"), "kirigami-hero");
      const hero = body.slice(0, start)
        + decoratedOpen + heroArt
        + body.slice(start + openTag.length, end)
        + kirigamiPageLabel(artId) + closeTag;
      body = body.slice(leadEnd);
      return `${head}${hero}<div class="subpage-content-frame">${kirigamiChapterNav(artId)}${body}</div>${closeMain}${tail}`;
    }
  }

  // Bài viết giữ nguyên cấu trúc article để schema và chiều rộng bài đọc không
  // đổi; chỉ header đầu bài trở thành bề mặt Hero.
  if (/^\s*<article\b[^>]*class="[^"]*\bpost-detail\b/.test(body)) {
    body = body.replace(/<header\b[^>]*>/, (openTag) => `${addClass(addClass(openTag, "lacquer-hero"), "kirigami-hero")}${heroArt}`);
  }

  return `${head}${body}${closeMain}${tail}`;
}

/* Mục điều hướng cấp một đang đại diện cho route hiện tại. Chỉ mục cấp một
   mang aria-current để trạng thái luôn nhìn thấy và trình đọc màn hình không
   phải thông báo "trang hiện tại" hai lần trong cùng một nhóm menu. */
const NAV_SECTIONS = [
  { href: "/tarot-la-gi/", match: (p) => p === "/tarot-la-gi/" },
  { href: "/la-bai/",      match: (p) => p.startsWith("/la-bai/") },
  { href: "/khoa-hoc/",    match: (p) => p.startsWith("/khoa-hoc/") },
  { href: "/tin-tuc/",     match: (p) => p.startsWith("/tin-tuc/") || p === "/gioi-thieu/" },
  { href: "/cua-hang/",    match: (p) => p.startsWith("/cua-hang/") },
];

/* Dựng sẵn năm biến thể layout và dừng build nếu một mục điều hướng đã bị
   đổi mà bảng route chưa được cập nhật. */
const layoutVariants = new Map(NAV_SECTIONS.map(({ href }) => {
  const anchor = `<a class="nav-group-top" href="${href}">`;
  if (!templates._layout.includes(anchor)) throw new Error(`_layout.html không còn mục điều hướng cấp một ${href}.`);
  return [href, templates._layout.replace(anchor, `<a class="nav-group-top" href="${href}" aria-current="page">`)];
}));

/**
 * Bản layout đã đánh dấu mục điều hướng của route.
 * @param {string} routePath
 * @returns {string}
 */
function layoutTemplate(routePath) {
  const section = NAV_SECTIONS.find((entry) => entry.match(routePath));
  return section ? layoutVariants.get(section.href) : templates._layout;
}

/**
 * Dựng một trang hoàn chỉnh từ template _layout.
 *
 * image và type để trống là chuyện bình thường — seoHead tự lùi về
 * site.defaultOgImage và "website". Phải khai báo optional trong JSDoc, nếu
 * không mọi lời gọi không truyền hai trường đó đều bị báo thiếu tham số.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} options.path            đường dẫn route, ví dụ "/la-bai/"
 * @param {object[]} options.schemas       các khối JSON-LD
 * @param {string} options.content         HTML thân trang, đã render sẵn
 * @param {string} [options.image]         ảnh OG riêng của trang
 * @param {string} [options.type]          og:type, mặc định "website"
 * @param {string} [options.bodyClass]
 * @param {string} [options.robots]
 * @param {string} [options.pageScripts]
 * @returns {string} HTML đầy đủ của trang
 */
function layout({ title, description, path: routePath, image, type, schemas, content, bodyClass = "", robots = "", pageScripts = "" }) {
  const artId = pageArtId(routePath);
  const bodyFontPreloads = bodyClass === "home-page"
    ? [
      '<link rel="preload" href="/assets/fonts/be-vietnam-pro-400-vietnamese.woff2" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="/assets/fonts/be-vietnam-pro-600-vietnamese.woff2" as="font" type="font/woff2" crossorigin>',
    ]
    : [
      '<link rel="preload" href="/assets/fonts/be-vietnam-pro-700-vietnamese.woff2" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="/assets/fonts/be-vietnam-pro-700.woff2" as="font" type="font/woff2" crossorigin>',
    ];
  /* Trang chủ bàn giao dùng Harmoni cho headline. Page hero route trong vẫn
     dùng Fontasia; card detail dùng Harmoni, nên route trong preload cả hai. */
  const displayFontPreloads = bodyClass === "home-page"
    ? [
      '<link rel="preload" href="/assets/fonts/dfvn-tan-harmoni.woff2" as="font" type="font/woff2" crossorigin>',
    ]
    : [
      '<link rel="preload" href="/assets/fonts/fontasia-vh.woff2" as="font" type="font/woff2" crossorigin>',
      '<link rel="preload" href="/assets/fonts/dfvn-tan-harmoni.woff2" as="font" type="font/woff2" crossorigin>',
    ];
  return renderString(layoutTemplate(routePath), {
    ...layoutSettings,
    criticalCss: bodyClass === "home-page" ? criticalBaseCss : criticalInnerCss,
    head: seoHead({ site: data.site, title, description, path: routePath, image, type, jsonLd: schemas, robots }),
    content: withPageArt(content, artId),
    bodyClass,
    pageScripts,
    fontPreloads: [...bodyFontPreloads, ...displayFontPreloads].join("\n  "),
    heroPreloads: bodyClass === "home-page"
      // imagesrcset/imagesizes chứ KHÔNG phải href + media. Preload phải đi qua
      // đúng logic chọn ảnh của Hero bàn giao, nếu không hai bên chọn
      // hai bản khác nhau và trình duyệt tải cả hai.
      //
      // Chia theo media không cứu được, vì bản nào được chọn còn phụ thuộc mật
      // độ điểm ảnh của máy: một điện thoại 375px DPR 3 cần tới bản 1200w. Đo
      // được đúng cảnh đó — preload 800w rồi srcset lại lấy 1200w, tổng 106 KB
      // cho một tấm ảnh.
      //
      // href giữ lại làm bản dự phòng cho trình duyệt chưa hiểu imagesrcset;
      // trình duyệt hiểu thì bỏ qua href.
      ? '<link rel="preload" as="image" type="image/webp" fetchpriority="high"'
        + ' imagesrcset="/assets/img/home-kirigami-480.webp 480w, /assets/img/home-kirigami-960.webp 960w, /assets/img/home-kirigami-1536.webp 1536w"'
        + ' imagesizes="100vw" href="/assets/img/home-kirigami-1536.webp">'
      : artId
        ? '<link rel="preload" as="image" fetchpriority="high"'
          + ` href="/assets/img/subpage-3d/${artId}-kirigami-3d.webp">`
        : "",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "HUONG-DONG-PROJECT-ID",
    firebaseApiKey: process.env.FIREBASE_API_KEY || "",
  });
}

// Tên tệp CSS/JS không đổi giữa các lần xuất bản, nên trình duyệt đã tải một
// lần rồi sẽ dùng lại bản cũ cho tới khi cache hết hạn — bản sửa lỗi không tới
// được người dùng. Gắn ?v=<băm nội dung> để mỗi lần nội dung đổi là URL đổi
// theo; nội dung không đổi thì URL giữ nguyên và cache vẫn phát huy tác dụng.
const assetStamps = new Map();
async function stampAssets(html) {
  const pattern = /(?:src|href)="(\/(?:assets|admin)\/[^"?]+\.(?:css|js))"/g;
  const files = [...new Set([...html.matchAll(pattern)].map((match) => match[1]))];
  for (const file of files) {
    if (!assetStamps.has(file)) {
      const contents = await readFile(path.join(dist, file.replace(/^\//, ""))).catch(() => null);
      assetStamps.set(file, contents ? createHash("sha256").update(contents).digest("hex").slice(0, 8) : "");
    }
  }
  return html.replaceAll(pattern, (whole, file) => {
    const stamp = assetStamps.get(file);
    return stamp ? whole.replace(file, `${file}?v=${stamp}`) : whole;
  });
}

async function emit(route, html) {
  const target = route === "/404.html" ? path.join(dist, "404.html") : route === "/" ? path.join(dist, "index.html") : path.join(dist, route.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await stampAssets(html));
}

function redirectDocument(destination) {
  const url = escapeHtml(destination);
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${escapeHtml(absoluteUrl(data.site.baseUrl, destination))}"><meta http-equiv="refresh" content="0;url=${url}"><title>Đang chuyển trang · Hường Đông</title></head><body><p>Nội dung đã được sắp xếp lại. <a href="${url}">Tiếp tục đến trang mới</a>.</p><script>location.replace(${JSON.stringify(destination)})</script></body></html>`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });

const featuredSlugs = ["the-fool", "the-empress", "the-chariot", "the-tower", "the-star", "the-world"];
const featuredCards = featuredSlugs.map((slug) => cards.find((card) => card.slug === slug)).filter(Boolean);

// Tứ Bất Tử: bốn vị dùng cho bảng liệt kê #tu-bat-tu, và MỘT vị trong số đó
// đứng làm tranh mở đầu Hero trang chủ (xem heroImmortal bên dưới).
// Số La Mã, tên gọi và dòng "lực" lấy nguyên văn bản đã duyệt của chủ dự án;
// ảnh chân dung nằm ở immortals/, khác với tranh lá bài trong cards/.
// Phần truyện đọc từ trường story của chính lá đó, nên biên tập trong /admin/
// là bảng kể chuyện ngoài trang chủ đổi theo, không cần sửa mã.
const immortalSpecs = [
  { slug: "strength", roman: "I", cardLabel: "VIII · STRENGTH", name: "Tản Viên Sơn Thánh", power: "Điều hòa sức mạnh", portrait: "tan-vien" },
  { slug: "the-chariot", roman: "II", cardLabel: "VII · THE CHARIOT", name: "Thánh Gióng", power: "Ý chí bảo hộ", portrait: "thanh-giong" },
  { slug: "the-hermit", roman: "III", cardLabel: "IX · THE HERMIT", name: "Chử Đồng Tử", power: "Khai mở minh triết", portrait: "chu-dong-tu" },
  { slug: "the-star", roman: "IV", cardLabel: "XVII · THE STAR", name: "Mẫu Liễu Hạnh", power: "Hy vọng chỉ đường", portrait: "mau-lieu-hanh" },
];
const immortals = immortalSpecs.map((spec) => {
  const card = cards.find((item) => item.slug === spec.slug);
  if (!card) throw new Error(`Thiếu lá ${spec.slug} cho mục Tứ Bất Tử.`);
  return {
    ...spec,
    image: `/assets/img/immortals/${spec.portrait}-800.avif`,
    alt: `Chân dung ${spec.name} trong bộ tranh Tứ Bất Tử của Hường Đông`,
    href: `/la-bai/${card.slug}/`,
    storyHtml: card.story || "",
    eyebrow: `Tarot ${spec.cardLabel.split(" · ")[0]} · ${card.nameEn} · ${spec.name}`,
  };
});

/* Tranh mở đầu Hero trang chủ. Một bức duy nhất, chọn cố định ở đây thay vì để
   template lấy phần tử đầu của danh sách: thứ tự trong immortalSpecs là thứ tự
   La Mã I–IV của mục #tu-bat-tu, đổi thứ tự đó không được kéo theo việc đổi
   tranh Hero.

   Mẫu Liễu Hạnh được chọn vì bức của bà là bức duy nhất có đủ ba lớp chiều sâu
   — sen ở tiền cảnh, dáng người ở trung cảnh, cổng đền ở hậu cảnh — nên đứng
   một mình vẫn không trống, và vì chòm sao trên đầu bà chính là lá XVII · The
   Star, lá mà dòng eyebrow của Hero vẫn luôn gọi tên. */
const heroImmortal = (() => {
  const chosen = immortals.find((item) => item.slug === "the-star");
  if (!chosen) throw new Error("Thiếu lá the-star cho tranh mở đầu Hero trang chủ.");
  return {
    ...chosen,
    // 400w cho màn hình hẹp, 800w cho khung 460px ở mật độ 2x. Không có bản lớn
    // hơn trong immortals/, và cũng không cần: khung không bao giờ rộng quá 620px.
    srcset: `/assets/img/immortals/${chosen.portrait}-400.avif 400w, /assets/img/immortals/${chosen.portrait}-800.avif 800w`,
  };
})();

/* Câu hỏi thường gặp. MỘT nguồn duy nhất cho cả phần hiển thị lẫn JSON-LD:
   viết hai chỗ thì sớm muộn hai bên lệch nhau, mà FAQPage không khớp nội dung
   người đọc nhìn thấy là vi phạm hướng dẫn dữ liệu có cấu trúc của Google.

   Năm câu này đều là nghi ngại có thật, và câu trả lời phải khớp với lập trường
   đã ghi ở các trang khác — nhất là câu 3: trang này không bán huyền sử như sử
   liệu, nên phần FAQ cũng không được nói khác đi. */
const faqs = [
  {
    q: "Tarot ở đây có phải là bói không?",
    a: "Không. Hường Đông dùng Tarot làm công cụ tự phản tư và học tập. Trang không đưa lời phán, và Tarot không thay thế tư vấn y tế, pháp lý hay tài chính.",
  },
  {
    q: "Tôi đã đọc Rider–Waite–Smith rồi, có phải học lại từ đầu không?",
    a: "Không. Cấu trúc nghĩa của RWS giữ nguyên: vẫn 22 Ẩn Chính và 56 Ẩn Phụ, vẫn bốn chất, vẫn nghĩa xuôi và nghĩa ngược. Chỉ lớp hình ảnh và liên tưởng là Việt, và mỗi lá đều ghi rõ nó ứng với lá RWS nào.",
  },
  {
    q: "Những tích trong bộ bài có phải lịch sử không?",
    a: "Không. Phần lớn rút từ Lĩnh Nam chích quái của Trần Thế Pháp, là sách chép truyện huyền sử chứ không phải sử liệu đã được chứng minh. Mỗi lá đều ghi nguồn và phân loại rõ: truyền thuyết, dã sử, chính sử hay khảo cổ học.",
  },
  {
    q: "Bao giờ mở bán và giá bao nhiêu?",
    a: `Bộ bài chưa mở bán. Ba phiên bản dự kiến từ ${PACK_TIERS[0].label} đến ${PACK_TIERS[2].label}; bản Premium ${PACK_PRICE.label} là lựa chọn được đề xuất. Trang không thu tiền trước, không đặt cọc và không giữ chỗ có phí.`,
  },
  {
    q: "Người mới nên bắt đầu từ đâu?",
    a: "Bắt đầu với 22 lá Ẩn Chính thay vì cả 78 lá: ít lá hơn, chủ đề lớn hơn, dễ nhớ hơn. Trang Tarot là gì có phần thử một lá, và khoá học qua email đi hết 22 lá trong 22 tuần.",
  },
];

/* Bộ bài là hàng chưa mở bán, nên availability phải là PreOrder chứ không phải
   InStock. Ba Offer dùng cùng nguồn PACK_TIERS với giao diện Cửa hàng để giá
   hiển thị, FAQ và dữ liệu có cấu trúc không thể lệch nhau. */
const packSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Hường Đông Tarot — bộ 78 lá",
  description: "Bộ Tarot 78 lá theo hệ Rider–Waite–Smith, kể lại bằng huyền sử và dã sử Việt. In offset trên giấy 350gsm, khổ 70×120mm, cạnh mạ đồng, hộp cứng nắp từ, kèm sách nhỏ 96 trang ghi rõ nguồn từng câu chuyện.",
  image: absoluteUrl(data.site.baseUrl, "/assets/img/product-hop-bai.webp"),
  brand: { "@type": "Brand", name: data.site.siteName },
  inLanguage: "vi",
  offers: PACK_TIERS.map((tier) => ({
    "@type": "Offer",
    name: `${tier.name} — Hường Đông Tarot`,
    price: String(tier.vnd),
    priceCurrency: "VND",
    availability: "https://schema.org/PreOrder",
    url: absoluteUrl(data.site.baseUrl, `/cua-hang/#${tier.id}`),
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const homeContent = renderString(templates.home, { featuredCards, latestPosts: posts.slice(0, 3), immortals, heroImmortal, faqs, packPrice: PACK_PRICE });
await emit("/", layout({
  title: data.site.siteName,
  description: data.site.description,
  path: "/",
  image: data.site.defaultOgImage,
  schemas: [
    organizationSchema(),
    { "@context": "https://schema.org", "@type": "WebSite", name: data.site.siteName, url: data.site.baseUrl, inLanguage: "vi" },
    packSchema,
    faqSchema,
  ],
  content: homeContent,
  bodyClass: "home-page",
}));

const renderedHistoryPage = renderString(
  templates["huyen-su"].replace("<!--LNCQ-INDEX-->", lncqIndexHtml()),
  { packPrice: PACK_PRICE, priceTiersHtml: priceTiersHtml() },
);
const historySectionsStart = renderedHistoryPage.indexOf('<section class="v2-prose" id="nguyen-tac">');
const historySectionsEnd = renderedHistoryPage.lastIndexOf("</main>");
if (historySectionsStart === -1 || historySectionsEnd === -1) {
  throw new Error("Không tách được nội dung Huyền sử để đưa vào Bảo tàng 78 lá.");
}
const museumHistoryHtml = `<section class="museum-history-wing" id="phong-huyen-su" aria-labelledby="museum-history-title"><header class="museum-history-header"><p class="eyebrow">Phòng chuyên đề</p><h2 id="museum-history-title">Huyền sử trong 78 lá bài</h2><p>Tranh, hệ nghĩa RWS và truyện nguồn được đặt cạnh nhau như hồ sơ giám tuyển — để người xem biết điều gì thuộc văn bản, điều gì là chuyển thể.</p></header>${renderedHistoryPage.slice(historySectionsStart, historySectionsEnd)}</section>`;
const listContent = renderString(templates["card-list"], { cards, cardCount: cards.length, museumHistoryHtml });
await emit("/la-bai/", layout({
  title: "Bảo tàng 78 lá Tarot Hường Đông",
  description: "Khám phá 78 lá Tarot Hường Đông như một bảo tàng nghệ thuật: tranh, nghĩa RWS, huyền sử Việt và 34 truyện nguồn trong cùng một hành trình.",
  path: "/la-bai/",
  schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "78 lá bài", path: "/la-bai/" }])],
  content: listContent,
}));

for (let index = 0; index < cards.length; index += 1) {
  const card = cards[index];
  const previous = cards[(index - 1 + cards.length) % cards.length];
  const next = cards[(index + 1) % cards.length];
  const symbols = (card.symbols || []).map((item, symbolIndex) => ({
    ...item,
    domId: `card-symbol-${symbolIndex + 1}`,
    // NFC giữ nguyên dấu tiếng Việt nhưng gom hai cách mã hoá Unicode thành
    // cùng một khoá; không bỏ dấu vì hai cụm gần giống chưa chắc cùng nghĩa.
    meaningKey: String(item.meaning || "").normalize("NFC").trim().toLocaleLowerCase("vi"),
  }));
  card.keywordHtml = [...(card.keywordsUpright || []), ...(card.keywordsReversed || []).slice(0, 2)].map((item) => {
    const keywordKey = String(item || "").normalize("NFC").trim().toLocaleLowerCase("vi");
    const symbol = symbols.find((candidate) => candidate.meaningKey === keywordKey);
    if (!symbol) return `<span>${escapeHtml(item)}</span>`;
    return `<span data-symbol-trigger data-symbol-source="${symbol.domId}" aria-describedby="${symbol.domId}">${escapeHtml(item)}</span>`;
  }).join("");
  card.symbolHtml = symbols.map((item) => `<article id="${item.domId}" data-symbol-source><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.meaning)}</p></article>`).join("");
  const readingGuide = '<section class="v2-prose"><p class="eyebrow">Học có phương pháp</p><h2>Đưa lá bài về đúng hệ nghĩa</h2><p>Phân biệt điều hình ảnh gợi ra với dữ kiện và hệ nghĩa Rider–Waite–Smith. Lá bài được dùng như học liệu để luyện quan sát, đối chiếu biểu tượng và diễn giải có căn cứ.</p><p><a class="v2-link" href="/khoa-hoc/#doc-la-bai">Xem phương pháp đọc một lá →</a></p></section>';
  const content = renderString(templates["card-detail"], { card, previous, next })
    .replace("<!--LNCQ-->", `${card.reflectionHtml}${lncqBlock(card.slug)}${readingGuide}`);
  const creativeWork = { "@context": "https://schema.org", "@type": "CreativeWork", name: `${card.nameFolk} – ${card.nameEn}`, description: card.seo.description, image: absoluteUrl(data.site.baseUrl, card.image.url), inLanguage: "vi", isPartOf: data.site.siteName };
  await emit(`/la-bai/${card.slug}/`, layout({
    title: card.seo.title,
    description: card.seo.description,
    path: `/la-bai/${card.slug}/`,
    image: card.seo.ogImage || card.image.url,
    type: "article",
    schemas: [creativeWork, breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "78 lá bài", path: "/la-bai/" }, { name: card.nameFolk, path: `/la-bai/${card.slug}/` }])],
    content,
  }));
}

const pageCount = Math.max(1, Math.ceil(posts.length / 10));
for (let page = 1; page <= pageCount; page += 1) {
  const pagePosts = posts.slice((page - 1) * 10, page * 10);
  const paginationHtml = pageCount > 1 ? `<nav class="pagination" aria-label="Phân trang">${Array.from({ length: pageCount }, (_, i) => `<a ${i + 1 === page ? 'aria-current="page"' : ""} href="${i === 0 ? "/tin-tuc/" : `/tin-tuc/trang/${i + 1}/`}">${i + 1}</a>`).join("")}</nav>` : "";
  const content = renderString(templates["post-list"], { posts: pagePosts, paginationHtml });
  const route = page === 1 ? "/tin-tuc/" : `/tin-tuc/trang/${page}/`;
  await emit(route, layout({ title: page === 1 ? "Bản tin Hường Đông" : `Bản tin Hường Đông – trang ${page}`, description: "Nhật ký phát triển bộ bài, phương pháp Việt hóa và câu chuyện hậu trường Hường Đông Tarot.", path: route, schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Bản tin Hường Đông", path: "/tin-tuc/" }])], content }));
}

for (const post of posts) {
  const content = renderString(templates["post-detail"], { post });
  const article = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: absoluteUrl(data.site.baseUrl, post.seo.ogImage || post.coverImage?.url || data.site.defaultOgImage), datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Person", name: post.author }, publisher: organizationSchema() };
  await emit(`/tin-tuc/${post.slug}/`, layout({ title: post.seo.title, description: post.seo.description, path: `/tin-tuc/${post.slug}/`, image: post.seo.ogImage, type: "article", schemas: [article, breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Bản tin Hường Đông", path: "/tin-tuc/" }, { name: post.title, path: `/tin-tuc/${post.slug}/` }])], content }));
}

await emit("/gioi-thieu/", layout({ title: "Về dự án Hường Đông", description: "Tìm hiểu định vị, phương pháp Việt hóa và cam kết phân định truyền thuyết với sử liệu của Hường Đông Tarot.", path: "/gioi-thieu/", schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Giới thiệu", path: "/gioi-thieu/" }])], content: templates.about }));
// Ba route nội dung độc lập; Bảo tàng và Bản tin đã được sinh ở phía trên.
const newPages = [
  { route: "/tarot-la-gi/", tpl: "tarot-la-gi", title: "Tarot là gì?", crumb: "Tarot là gì", description: "Tarot không nói thay tương lai. Giải thích hệ nghĩa Rider-Waite-Smith nguyên bản và cách Hường Đông Việt hóa mà vẫn giữ chuẩn." },
  { route: "/khoa-hoc/", tpl: "khoa-hoc", title: "Khóa học Tarot", crumb: "Khóa học", description: "Lộ trình học Tarot bằng hình ảnh và câu chuyện Việt: nền tảng RWS, đọc lá, đọc bố cục, phản tư và kiểm chứng nguồn." },
  { route: "/cua-hang/", tpl: "cua-hang", title: "Cửa hàng", crumb: "Cửa hàng", description: "Giới thiệu bộ bài Hường Đông Tarot và danh sách chờ. Chưa mở bán, không thu tiền trước." },
];
for (const page of newPages) {
  const pageTemplate = page.tpl === "cua-hang"
    ? templates[page.tpl].replace('<section class="v2-prose pricing-gallery" id="bo-bai"', '<section class="v2-prose pricing-gallery price-panel" id="bo-bai" data-price-panel')
    : templates[page.tpl];
  await emit(page.route, layout({
    title: page.title,
    description: page.description,
    path: page.route,
    schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: page.crumb, path: page.route }])],
    content: renderString(pageTemplate, { packPrice: PACK_PRICE, priceTiersHtml: priceTiersHtml() }),
  }));
}

// 34 trang toàn văn là một phòng tư liệu của Bảo tàng 78 lá.
for (let i = 0; i < lncqChapters.length; i += 1) {
  const c = lncqChapters[i];
  const route = `/la-bai/huyen-su/${c.slug}/`;
  await emit(route, layout({
    title: `${c.title} – Lĩnh Nam chích quái`,
    description: `Toàn văn ${c.title} (chương ${c.n}) trong Lĩnh Nam chích quái của Trần Thế Pháp.`,
    path: route,
    schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Bảo tàng 78 lá", path: "/la-bai/" }, { name: "Phòng Huyền sử", path: "/la-bai/#phong-huyen-su" }, { name: c.title, path: route }])],
    content: lncqChapterHtml(c, lncqChapters[i - 1], lncqChapters[i + 1]),
  }));
  await emit(`/huyen-su/${c.slug}/`, redirectDocument(route));
}

// Giữ liên kết cũ hoạt động nhưng không còn xuất bản giao diện bói/rút bài.
const retiredRoutes = [
  "/la-bai-hom-nay/",
  "/trai-bai/",
  "/trai-bai/co-khong/",
  "/trai-bai/ba-la/",
  "/trai-bai/tinh-yeu/",
  "/healing/",
  "/huyen-su/",
  "/huong-dan-tarot/",
  "/huong-dan-tarot/dat-cau-hoi/",
  "/huong-dan-tarot/xao-bai/",
  "/huong-dan-tarot/doc-la-bai/",
];
for (const route of retiredRoutes) await emit(route, redirectDocument("/khoa-hoc/"));

await emit("/quyen-rieng-tu/", layout({ title: "Quyền riêng tư", description: "Website Hường Đông lưu những dữ liệu nào, vì sao lưu và cách bạn yêu cầu xóa.", path: "/quyen-rieng-tu/", schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Quyền riêng tư", path: "/quyen-rieng-tu/" }])], content: templates.privacy }));
await emit("/404.html", layout({ title: "Không tìm thấy trang", description: "Trang bạn tìm không tồn tại.", path: "/404.html", schemas: [], content: templates["404"] }));

const routes = ["/", "/tarot-la-gi/", "/la-bai/", "/khoa-hoc/", "/cua-hang/", "/tin-tuc/", "/gioi-thieu/", "/quyen-rieng-tu/", ...cards.map((card) => `/la-bai/${card.slug}/`), ...lncqChapters.map((chapter) => `/la-bai/huyen-su/${chapter.slug}/`), ...posts.map((post) => `/tin-tuc/${post.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${escapeHtml(absoluteUrl(data.site.baseUrl, route))}</loc></url>`).join("")}</urlset>`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${absoluteUrl(data.site.baseUrl, "/sitemap.xml")}\n`);
const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(data.site.siteName)}</title><link>${escapeHtml(data.site.baseUrl)}</link><description>${escapeHtml(data.site.description)}</description>${posts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${escapeHtml(absoluteUrl(data.site.baseUrl, `/tin-tuc/${post.slug}/`))}</link><description>${escapeHtml(post.excerpt)}</description><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`;
await writeFile(path.join(dist, "rss.xml"), rss);

const adminIndex = path.join(dist, "admin", "index.html");
let adminHtml = await readFile(adminIndex, "utf8");
adminHtml = adminHtml.replace("__FIREBASE_CONFIG__", JSON.stringify({ apiKey: process.env.FIREBASE_API_KEY || "", authDomain: process.env.FIREBASE_AUTH_DOMAIN || "", projectId: process.env.FIREBASE_PROJECT_ID || "HUONG-DONG-PROJECT-ID", storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "" }).replaceAll("<", "\\u003c"));
adminHtml = await stampAssets(adminHtml);
await writeFile(adminIndex, adminHtml);
console.log(`Đã sinh ${cards.length} trang lá, ${posts.length} bài tin và ${routes.length} URL từ ${useSeed ? "dữ liệu mẫu" : "Firestore"}.`);
