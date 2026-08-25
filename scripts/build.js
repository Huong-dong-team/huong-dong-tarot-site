import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { renderString, escapeHtml } from "./lib/render.js";
import { absoluteUrl, analyticsSnippet, breadcrumbSchema, seoHead } from "./lib/seo.js";
import { fillMinorDetails } from "./lib/minor-details-fallback.js";

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

// Mục lục 34 truyện Lĩnh Nam chích quái, chèn vào trang Huyền sử.
function lncqIndexHtml() {
  const rows = lncqChapters.map((c) => {
    const cards = c.cards.length
      ? c.cards.map((k) => `<a class="v2-link" href="/la-bai/${k.slug}/">${escapeHtml(k.roman)}</a>`).join(" · ")
      : '<span class="lncq-nocard">—</span>';
    return `<tr><td>${c.n}</td><td><a class="v2-link" href="/huyen-su/${c.slug}/">${escapeHtml(c.title)}</a></td><td>${cards}</td></tr>`;
  }).join("");
  return `<table class="v2-table lncq-index"><thead><tr><th>Chương</th><th>Truyện</th><th>Lá Ẩn chính</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// Trang toàn văn từng truyện.
function lncqChapterHtml(c, prev, next) {
  const body = c.paras.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  const cards = c.cards.length
    ? `<p class="lncq-cards"><strong>Truyện này ứng với:</strong> ${c.cards.map((k) => `<a class="v2-link" href="/la-bai/${k.slug}/">${escapeHtml(k.roman)}</a>`).join(" · ")}</p>`
    : `<p class="lncq-cards lncq-nocard">Truyện này chưa gắn với lá Ẩn chính nào.</p>`;
  const nav = `<nav class="card-pagination" aria-label="Điều hướng truyện">${prev ? `<a href="/huyen-su/${prev.slug}/">← ${escapeHtml(prev.title)}</a>` : "<span></span>"}<a href="/huyen-su/">Đủ 34 truyện</a>${next ? `<a href="/huyen-su/${next.slug}/">${escapeHtml(next.title)} →</a>` : "<span></span>"}</nav>`;
  return `<main id="noi-dung-chinh"><section class="page-hero drum-watermark"><p class="eyebrow">Lĩnh Nam chích quái · Chương ${c.n}</p><h1>${escapeHtml(c.title)}</h1></section><section class="v2-prose lncq-full">${cards}${body}<p class="lncq-cite"><strong>Dẫn nguồn:</strong> Trần Thế Pháp, <em>Lĩnh Nam chích quái</em>, ${escapeHtml(c.title)} (chương ${c.n}). Nguyên tác thế kỷ XIV, đã thuộc phạm vi công cộng. Trích theo bản tiếng Việt hiệu chỉnh chính tả 2026. <span class="lncq-caveat">Bản này <strong>không phải ấn bản khảo dị/dịch chú học thuật</strong> và <strong>không có số trang</strong>; để trích dẫn theo trang, dùng bản dịch Đinh Gia Khánh – Nguyễn Ngọc San (NXB Văn học).</span></p>${nav}</section></main>`;
}

const templates = Object.fromEntries(await Promise.all(["_layout", "home", "card-list", "card-detail", "post-list", "post-detail", "about", "privacy", "404", "tarot-la-gi", "trai-bai", "huyen-su", "healing", "cua-hang", "development", "daily-card", "spread"].map(async (name) => [name, await readFile(path.join(root, "templates", `${name}.html`), "utf8")])));
// Critical CSS được nhúng thẳng vào MỌI trang, nên mỗi byte ở đây nhân với số
// trang và nằm trên đường tải quan trọng nhất. Chú thích trong tệp nguồn thì
// đáng giữ — chúng ghi lý do của từng luật — nhưng nhúng ra thì vô dụng với
// trình duyệt. Gỡ chú thích khi nhúng: tệp nguồn vẫn đọc được, bản gửi đi gọn
// hơn khoảng 2 KB. Không có chuỗi nào trong ba tệp chứa "/*" nên phép thay
// này an toàn; test critical-css.test.mjs canh cả ngân sách lẫn các mốc bắt buộc.
//
// Sau khi gỡ chú thích thì gộp luôn xuống dòng và thụt lề. Ba tệp nguồn được
// viết dạng dễ đọc — mỗi khai báo một dòng, thụt hai dấu cách — và toàn bộ chỗ
// trắng đó đang được gửi đi kèm MỌI trang. Gộp lại tiết kiệm ~2,7 KB mỗi lượt
// tải đầu, đủ để ngân sách 20 KB từ chỗ chỉ còn ~800 ký tự nới ra gấp đôi.
//
// Cố ý KHÔNG nén sâu hơn. Bỏ khoảng trắng quanh { } : ; , thì gọn thêm ~1,9 KB
// nữa, nhưng ba tệp này có 65 chuỗi trong ngoặc kép (tên font) và 3 selector có
// khoảng trắng trước dấu hai chấm — regex sẽ nuốt nhầm và làm hỏng luật. Muốn
// mức đó thì phải dùng parser CSS thật, tức thêm một phụ thuộc; repo này giữ
// đúng hai phụ thuộc chạy thật nên không đáng đổi.
async function loadCriticalCss() {
  const files = ["fonts.css", "custom-fonts.css", "critical.css"];
  const css = (await Promise.all(files.map((file) => readFile(path.join(root, "public", "assets", "css", file), "utf8")))).join("\n");
  if (/<\/style/i.test(css)) throw new Error("Critical CSS chứa chuỗi đóng thẻ style không an toàn.");
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}
const criticalCss = await loadCriticalCss();
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

function detailCard(title, value, className = "v2-card") {
  const text = cleanText(value);
  return text ? `<article class="${className}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>` : "";
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
const cards = data.cards.map((card) => ({
  ...card,
  nameFolk: card.nameFolk || card.nameVi,
  suitValue: card.suit || "",
  arcanaLabel: arcanaLabel(card),
  displayNumber: card.arcana === "major" ? roman(card.number) : card.nameVi.split(" ")[0],
  folkStyleLabel: folkStyleLabel[card.folkStyle] || "Mỹ thuật Việt",
  artNote: ART_NOTE[card.imageStatus] ?? "",
  minorDetailsHtml: minorDetailsHtml(card),
  searchText: [card.nameVi, card.nameEn, card.nameFolk, ...(card.keywordsUpright || [])].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
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
  criticalCss,
  tagline: data.site.tagline || "",
  contactEmail: data.site.contactEmail || "",
  socialHtml: socialLinks.length
    ? `<br>${socialLinks.map(([label, url]) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow">${label}</a>`).join(" · ")}`
    : "",
};

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
  const bodyFontPreloads = [
    '<link rel="preload" href="/assets/fonts/be-vietnam-pro-700-vietnamese.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/assets/fonts/be-vietnam-pro-700.woff2" as="font" type="font/woff2" crossorigin>',
  ];
  const displayFontPreload = bodyClass === "home-page"
    ? '<link rel="preload" href="/assets/fonts/fontasia-vh.woff2" as="font" type="font/woff2" crossorigin>'
    : '<link rel="preload" href="/assets/fonts/dfvn-tan-harmoni.woff2" as="font" type="font/woff2" crossorigin>';
  return renderString(templates._layout, {
    ...layoutSettings,
    head: seoHead({ site: data.site, title, description, path: routePath, image, type, jsonLd: schemas, robots }),
    content,
    bodyClass,
    pageScripts,
    fontPreloads: [...bodyFontPreloads, displayFontPreload].join("\n  "),
    heroPreloads: bodyClass === "home-page"
      // imagesrcset/imagesizes chứ KHÔNG phải href + media. Preload phải đi qua
      // đúng logic chọn ảnh của <img class="hero-bg">, nếu không hai bên chọn
      // hai bản khác nhau và trình duyệt tải cả hai.
      //
      // Chia theo media không cứu được, vì bản nào được chọn còn phụ thuộc mật
      // độ điểm ảnh của máy: một điện thoại 375px DPR 3 cần tới bản 1200w. Đo
      // được đúng cảnh đó — preload 800w rồi srcset lại lấy 1200w, tổng 106 KB
      // cho một tấm ảnh.
      //
      // href giữ lại làm bản dự phòng cho trình duyệt chưa hiểu imagesrcset;
      // trình duyệt hiểu thì bỏ qua href.
      ? '<link rel="preload" as="image" fetchpriority="high"'
        + ' imagesrcset="/assets/img/hero-800.avif 800w, /assets/img/hero-1200.avif 1200w, /assets/img/hero-1536.avif 1536w"'
        + ' imagesizes="100vw" href="/assets/img/hero-1200.avif">'
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
  // data-astronomy-src cũng phải được đóng dấu: gói thiên văn giờ do
  // daily-card/page.js nạp lúc chạy, nên nó không còn nằm trong một thẻ <script>
  // để regex src= bắt được, mà vẫn cần vân tay nội dung như mọi tệp JS khác.
  const pattern = /(?:src|href|data-astronomy-src)="(\/(?:assets|admin)\/[^"?]+\.(?:css|js))"/g;
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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });
await mkdir(path.join(dist, "assets", "vendor"), { recursive: true });
await cp(
  path.join(root, "node_modules", "astronomy-engine", "astronomy.browser.min.js"),
  path.join(dist, "assets", "vendor", "astronomy.browser.min.js"),
);

const featuredSlugs = ["the-fool", "the-empress", "the-chariot", "the-tower", "the-star", "the-world"];
const featuredCards = featuredSlugs.map((slug) => cards.find((card) => card.slug === slug)).filter(Boolean);

// Tứ Bất Tử: bốn vị dùng chung cho carousel hero và bảng liệt kê phía dưới.
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
const immortals = immortalSpecs.map((spec, index) => {
  const card = cards.find((item) => item.slug === spec.slug);
  if (!card) throw new Error(`Thiếu lá ${spec.slug} cho mục Tứ Bất Tử.`);
  return {
    ...spec,
    image: `/assets/img/immortals/${spec.portrait}-800.avif`,
    alt: `Chân dung ${spec.name} trong bộ tranh Tứ Bất Tử của Hường Đông`,
    href: `/la-bai/${card.slug}/`,
    storyHtml: card.story || "",
    eyebrow: `Tarot ${spec.cardLabel.split(" · ")[0]} · ${card.nameEn} · ${spec.name}`,
    // Dựng sẵn ở đây thay vì lồng {{#if}} trong template: renderString dùng
    // regex non-greedy nên điều kiện lồng nhau sẽ đóng sai thẻ.
    activeClass: index === 0 ? " is-active" : "",
    // Cả bốn chân dung bắt đầu ở trạng thái ẩn nên để lazy; slide hộp bài trong
    // template cũng tải lười vì nằm gần cuối khung mobile. Nhờ vậy carousel
    // không tranh băng thông và decode với tiêu đề LCP.
    imgAttrs: 'loading="lazy" decoding="async"',
  };
});

const homeContent = renderString(templates.home, { featuredCards, latestPosts: posts.slice(0, 3), immortals });
await emit("/", layout({
  title: data.site.siteName,
  description: data.site.description,
  path: "/",
  image: data.site.defaultOgImage,
  schemas: [organizationSchema(), { "@context": "https://schema.org", "@type": "WebSite", name: data.site.siteName, url: data.site.baseUrl, inLanguage: "vi" }],
  content: homeContent,
  bodyClass: "home-page",
}));

const listContent = renderString(templates["card-list"], { cards, cardCount: cards.length });
await emit("/la-bai/", layout({
  title: "Thư viện 78 lá Tarot Hường Đông",
  description: "Tra cứu đủ 78 lá Tarot: 22 Ẩn Chính, 56 Ẩn Phụ, nghĩa xuôi/ngược và lớp liên tưởng Việt hóa.",
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
  const content = renderString(templates["card-detail"], { card, previous, next }).replace("<!--LNCQ-->", lncqBlock(card.slug));
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
  await emit(route, layout({ title: page === 1 ? "Chuyện Hường Đông" : `Chuyện Hường Đông – trang ${page}`, description: "Nhật ký phát triển bộ bài, phương pháp Việt hóa và câu chuyện hậu trường Hường Đông Tarot.", path: route, schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Tin tức", path: "/tin-tuc/" }])], content }));
}

for (const post of posts) {
  const content = renderString(templates["post-detail"], { post });
  const article = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: absoluteUrl(data.site.baseUrl, post.seo.ogImage || post.coverImage?.url || data.site.defaultOgImage), datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Person", name: post.author }, publisher: organizationSchema() };
  await emit(`/tin-tuc/${post.slug}/`, layout({ title: post.seo.title, description: post.seo.description, path: `/tin-tuc/${post.slug}/`, image: post.seo.ogImage, type: "article", schemas: [article, breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Tin tức", path: "/tin-tuc/" }, { name: post.title, path: `/tin-tuc/${post.slug}/` }])], content }));
}

await emit("/gioi-thieu/", layout({ title: "Về dự án Hường Đông", description: "Tìm hiểu định vị, phương pháp Việt hóa và cam kết phân định truyền thuyết với sử liệu của Hường Đông Tarot.", path: "/gioi-thieu/", schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Giới thiệu", path: "/gioi-thieu/" }])], content: templates.about }));
// Bốn mục mới của cơ cấu 7 mục (nội dung trước, ảnh sau).
const newPages = [
  { route: "/tarot-la-gi/", tpl: "tarot-la-gi", title: "Tarot là gì?", crumb: "Tarot là gì", description: "Tarot không nói thay tương lai. Giải thích hệ nghĩa Rider-Waite-Smith nguyên bản và cách Hường Đông Việt hóa mà vẫn giữ chuẩn." },
  { route: "/trai-bai/", tpl: "trai-bai", title: "Trải bài", crumb: "Trải bài", description: "Các kiểu trải bài Hường Đông, nghi thức trước khi rút và hiệu ứng lật bài." },
  { route: "/huyen-su/", tpl: "huyen-su", title: "Huyền sử", crumb: "Huyền sử", description: "Tứ Bất Tử và Tứ đại thiền sư. Những câu chuyện từ Lĩnh Nam chích quái nối vào 22 lá Ẩn chính - mỗi truyện đứng riêng, không gộp thành một cốt truyện tuyến tính." },
  { route: "/healing/", tpl: "healing", title: "Healing", crumb: "Healing", description: "Phản tư, soi chiếu và nhật ký - dùng tarot như một tấm gương, không phải một lời phán." },
  { route: "/cua-hang/", tpl: "cua-hang", title: "Cửa hàng", crumb: "Cửa hàng", description: "Giới thiệu bộ bài Hường Đông Tarot và danh sách chờ. Chưa mở bán, không thu tiền trước." },
];
for (const page of newPages) {
  await emit(page.route, layout({
    title: page.title,
    description: page.description,
    path: page.route,
    schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: page.crumb, path: page.route }])],
    content: templates[page.tpl].replace("<!--LNCQ-INDEX-->", lncqIndexHtml()),
  }));
}

// 1.1 — Chốt URL trước khi viết chức năng. 1.2–1.4 Lớp 2 — khung tương tác.
//
// Ba trang giữ nguyên `noindex,follow` và vẫn nằm ngoài sitemap: khung rút bài
// đã chạy được, nhưng phần nội dung biên tập (Lớp 3) còn chờ ba quyết định của
// người — quy tắc Có/Không, nhãn ba vị trí của Tình Yêu, và 0.7. Mở index khi
// trang mới có nửa nội dung là tự bắn vào chân mình về SEO.
//
// Khung chỉ dùng dữ liệu ĐÃ chốt: 22 Ẩn Chính trong deck-data.js, sinh từ
// content/major-arcana.mjs. Không đụng tới 56 Ẩn Phụ đang chờ 0.7.
const intentPages = [
  {
    route: "/trai-bai/co-khong/",
    title: "Trải bài Có hoặc Không",
    heading: "Có hoặc Không",
    intro: "Một lá bài giúp bạn dừng lại, nhìn rõ điều đang nghiêng về phía nào và tự kiểm tra lý do của mình.",
    howTo: "Giữ câu hỏi trong đầu — dạng câu hỏi có thể trả lời bằng có hoặc không — rồi bấm Xáo và rút. Bấm vào lá úp để lật.",
    spreadSize: 1,
    positions: "",
    verdict: true,
    // §4 của KE-HOACH-1.2-1.4: chưa có quy tắc "lá nào → Có/Không" trong dữ liệu.
    // Khung cố ý KHÔNG tự chế ra quy tắc; khi người chốt thì chỉ thêm một cột dữ
    // liệu và nối vào đúng chỗ này, khung không phải viết lại.
    verdictNote: "Quy tắc phân cực Có/Không chưa được chốt, nên trang chưa đưa ra kết luận. Lá rút được và phần đọc bên dưới đã dùng dữ liệu thật.",
    nextStep: "Hạng mục 1.2 Lớp 3 sẽ bổ sung kết luận Có/Không có điều kiện và chia sẻ kết quả, sau khi quy tắc phân cực được chốt.",
    breadcrumbs: [{ name: "Trang chủ", path: "/" }, { name: "Trải bài", path: "/trai-bai/" }, { name: "Có hoặc Không", path: "/trai-bai/co-khong/" }],
  },
  {
    route: "/trai-bai/ba-la/",
    title: "Trải bài Ba Lá",
    heading: "Ba Lá",
    intro: "Ba vị trí cho quá khứ, hiện tại và hướng đi — một khung đọc ngắn để nhìn sự việc theo dòng thời gian.",
    howTo: "Giữ câu hỏi trong đầu rồi bấm Xáo và rút. Ba lá hiện theo thứ tự Quá khứ, Hiện tại, Hướng đi. Bấm vào từng lá úp để lật.",
    spreadSize: 3,
    positions: "Quá khứ|Hiện tại|Hướng đi",
    nextStep: "Hạng mục 1.3 Lớp 3 sẽ bổ sung phần đọc liền mạch ba lá và nội dung biên tập, sau khi 0.7 được duyệt.",
    breadcrumbs: [{ name: "Trang chủ", path: "/" }, { name: "Trải bài", path: "/trai-bai/" }, { name: "Ba Lá", path: "/trai-bai/ba-la/" }],
  },
  {
    route: "/trai-bai/tinh-yeu/",
    title: "Trải bài Tình Yêu",
    heading: "Tình Yêu",
    intro: "Một khung soi chiếu mối quan hệ bằng câu hỏi rõ ràng, không phán thay cảm xúc hay lựa chọn của bạn.",
    howTo: "Giữ câu hỏi về mối quan hệ trong đầu rồi bấm Xáo và rút. Ba lá hiện theo thứ tự vị trí. Bấm vào từng lá úp để lật.",
    spreadSize: 3,
    // §5.3: nhãn ba vị trí của Tình Yêu là quyết định của người, chưa chốt. Dùng
    // nhãn trung tính để không lá nào thiếu nhãn, và nêu bộ nhãn đang đề nghị ở
    // khối "Bước tiếp theo" để người duyệt trong một lần nhìn.
    positions: "Vị trí 1|Vị trí 2|Vị trí 3",
    nextStep: "Hạng mục 1.4 Lớp 3 chờ bạn chốt tên ba vị trí. Bộ đang đề nghị: Điều bạn mang vào · Điều đối phương mang vào · Điều cả hai đang tạo ra.",
    breadcrumbs: [{ name: "Trang chủ", path: "/" }, { name: "Trải bài", path: "/trai-bai/" }, { name: "Tình Yêu", path: "/trai-bai/tinh-yeu/" }],
  },
];
for (const page of intentPages) {
  const content = renderString(templates.spread, page);
  await emit(page.route, layout({
    title: page.title,
    description: `${page.intro} Tính năng đang được Hường Đông phát triển thêm.`,
    path: page.route,
    robots: "noindex,follow",
    schemas: [breadcrumbSchema(data.site, page.breadcrumbs)],
    content,
  }));
}

// 1.5 — Nội dung và ánh xạ đã được chủ dự án duyệt ngày 24/08/2026.
// Chỉ đưa các trường tối thiểu vào trình duyệt; không để dữ liệu quản trị hoặc
// chuỗi HTML không cần thiết lọt vào gói JSON của trang.
const dailyCards = cards.map((card) => ({
  slug: card.slug,
  nameEn: card.nameEn,
  nameVi: card.nameVi,
  nameFolk: card.nameFolk,
  arcana: card.arcana,
  suit: card.suit,
  image: {
    url: card.image?.url || "/assets/img/default-og.webp",
    alt: card.image?.alt || `Minh họa lá ${card.nameFolk || card.nameVi || card.nameEn}`,
    width: Number(card.image?.width) || 768,
    height: Number(card.image?.height) || 1152,
  },
  keywordsUpright: card.keywordsUpright || [],
  keywordsReversed: card.keywordsReversed || [],
  meaningUpright: card.meaningUpright || "",
  meaningReversed: card.meaningReversed || "",
}));
const dailyCardsJson = JSON.stringify(dailyCards).replaceAll("<", "\\u003c");
const dailyContent = renderString(templates["daily-card"], { dailyCardsJson });
await emit("/la-bai-hom-nay/", layout({
  title: "Lá Bài Hôm Nay",
  description: "Bốc một lá Tarot cố định trong ngày, kết hợp thời điểm bốc bài để nhận một lời đọc ngắn dành cho tự phản tư.",
  path: "/la-bai-hom-nay/",
  schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Lá Bài Hôm Nay", path: "/la-bai-hom-nay/" }])],
  content: dailyContent,
  bodyClass: "daily-card-page",
  // Không nhúng script cứng nữa: page/registry.js đọc <main data-page="daily">
  // rồi tự import module và tự nạp astronomy. Thẻ <script> nằm ngoài container
  // Swup sẽ không bao giờ chạy lại sau một lần chuyển cảnh, nên nhúng cứng là
  // đúng một lần đầu rồi im lặng hỏng từ lần thứ hai trở đi.
}));

// 34 trang toàn văn Lĩnh Nam chích quái.
for (let i = 0; i < lncqChapters.length; i += 1) {
  const c = lncqChapters[i];
  await emit(`/huyen-su/${c.slug}/`, layout({
    title: `${c.title} – Lĩnh Nam chích quái`,
    description: `Toàn văn ${c.title} (chương ${c.n}) trong Lĩnh Nam chích quái của Trần Thế Pháp.`,
    path: `/huyen-su/${c.slug}/`,
    schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Huyền sử", path: "/huyen-su/" }, { name: c.title, path: `/huyen-su/${c.slug}/` }])],
    content: lncqChapterHtml(c, lncqChapters[i - 1], lncqChapters[i + 1]),
  }));
}

await emit("/quyen-rieng-tu/", layout({ title: "Quyền riêng tư", description: "Website Hường Đông lưu những dữ liệu nào, vì sao lưu và cách bạn yêu cầu xóa.", path: "/quyen-rieng-tu/", schemas: [breadcrumbSchema(data.site, [{ name: "Trang chủ", path: "/" }, { name: "Quyền riêng tư", path: "/quyen-rieng-tu/" }])], content: templates.privacy }));
await emit("/404.html", layout({ title: "Không tìm thấy trang", description: "Trang bạn tìm không tồn tại.", path: "/404.html", schemas: [], content: templates["404"] }));

const routes = ["/", "/la-bai/", "/la-bai-hom-nay/", "/tin-tuc/", "/gioi-thieu/", "/quyen-rieng-tu/", ...cards.map((card) => `/la-bai/${card.slug}/`), ...posts.map((post) => `/tin-tuc/${post.slug}/`)];
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
