import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { renderString, escapeHtml } from "./lib/render.js";
import { absoluteUrl, analyticsSnippet, breadcrumbSchema, seoHead } from "./lib/seo.js";

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
  return { cards: cardSnap.docs.map((doc) => normalize(doc.data())), posts: postSnap.docs.map((doc) => normalize(doc.data())), site: siteSnap.exists ? normalize(siteSnap.data()) : await readJson("settings.json") };
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

const templates = Object.fromEntries(await Promise.all(["_layout", "home", "card-list", "card-detail", "post-list", "post-detail", "about", "privacy", "404", "tarot-la-gi", "trai-bai", "huyen-su", "healing", "cua-hang"].map(async (name) => [name, await readFile(path.join(root, "templates", `${name}.html`), "utf8")])));
const dateLabel = (value) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value || Date.now()));
const roman = (number) => ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"][number] || String(number);
const arcanaLabel = (card) => card.arcana === "major" ? "Ẩn Chính" : "Ẩn Phụ";
const folkStyleLabel = { "dong-ho": "Đông Hồ", "hang-trong": "Hàng Trống", "kim-hoang": "Kim Hoàng" };

const cards = data.cards.map((card) => ({
  ...card,
  nameFolk: card.nameFolk || card.nameVi,
  suitValue: card.suit || "",
  arcanaLabel: arcanaLabel(card),
  displayNumber: card.arcana === "major" ? roman(card.number) : card.nameVi.split(" ")[0],
  folkStyleLabel: folkStyleLabel[card.folkStyle] || "Mỹ thuật Việt",
  searchText: [card.nameVi, card.nameEn, card.nameFolk, ...(card.keywordsUpright || [])].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
}));
const posts = data.posts.map((post) => ({ ...post, dateLabel: dateLabel(post.publishedAt) }));

function organizationSchema() {
  return { "@context": "https://schema.org", "@type": "Organization", name: data.site.siteName, url: data.site.baseUrl, logo: absoluteUrl(data.site.baseUrl, "/assets/img/trong-dong.png") };
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
const layoutSettings = {
  analytics: analyticsSnippet(data.site),
  tagline: data.site.tagline || "",
  contactEmail: data.site.contactEmail || "",
  socialHtml: socialLinks.length
    ? `<br>${socialLinks.map(([label, url]) => `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow">${label}</a>`).join(" · ")}`
    : "",
};

function layout({ title, description, path: routePath, image, type, schemas, content, bodyClass = "" }) {
  return renderString(templates._layout, {
    ...layoutSettings,
    head: seoHead({ site: data.site, title, description, path: routePath, image, type, jsonLd: schemas }),
    content,
    bodyClass,
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

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });

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
    image: `/assets/img/immortals/${spec.portrait}.webp`,
    alt: `Chân dung ${spec.name} trong bộ tranh Tứ Bất Tử của Hường Đông`,
    href: `/la-bai/${card.slug}/`,
    storyHtml: card.story || "",
    eyebrow: `Tarot ${spec.cardLabel.split(" · ")[0]} · ${card.nameEn} · ${spec.name}`,
    // Dựng sẵn ở đây thay vì lồng {{#if}} trong template: renderString dùng
    // regex non-greedy nên điều kiện lồng nhau sẽ đóng sai thẻ.
    activeClass: index === 0 ? " is-active" : "",
    // Lá đầu là ảnh lớn nhất màn hình đầu nên phải tải sớm, ba lá sau thì không.
    imgAttrs: index === 0 ? 'fetchpriority="high"' : 'loading="lazy"',
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
  card.keywordHtml = [...(card.keywordsUpright || []), ...(card.keywordsReversed || []).slice(0, 2)].map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  card.symbolHtml = (card.symbols || []).map((item) => `<article><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.meaning)}</p></article>`).join("");
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
  const article = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: absoluteUrl(data.site.baseUrl, post.seo.ogImage || post.coverImage.url), datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Person", name: post.author }, publisher: organizationSchema() };
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

const routes = ["/", "/la-bai/", "/tin-tuc/", "/gioi-thieu/", "/quyen-rieng-tu/", ...cards.map((card) => `/la-bai/${card.slug}/`), ...posts.map((post) => `/tin-tuc/${post.slug}/`)];
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
