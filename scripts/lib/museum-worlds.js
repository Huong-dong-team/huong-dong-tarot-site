import { escapeHtml } from "./render.js";

/* Each museum is a real route, not a filter masquerading as a room. The same
   records feed its accessible 2D collection and its opt-in desktop 3D scene. */
export const MUSEUM_ROOMS = Object.freeze([
  { key: "major", path: "/la-bai/an-chinh/", theme: "light", number: "01", title: "Bảo tàng Ẩn Chính", shortTitle: "Ẩn Chính", heading: "Nghệ thuật\nmở lối vào\nhuyền sử.", intro: "22 lá bài, 22 ngưỡng cửa. Trong khoảng sáng tĩnh lặng, hình tượng Việt đối thoại với những câu hỏi lớn của hành trình con người.", description: "Bảo tàng Ẩn Chính Hường Đông: 22 lá Tarot, tranh Việt, hệ nghĩa RWS và hồ sơ nguồn trong một không gian nghệ thuật sáng, tĩnh.", image: "/assets/img/museum/major-gallery.webp", imageAlt: "Không gian bảo tàng sáng màu với tranh Tarot Việt được đặt trong các khung độc lập", count: "22 lá · Hành trình nguyên mẫu", collectionTitle: "22 ngưỡng cửa của Ẩn Chính" },
  { key: "minor", path: "/la-bai/an-phu/", theme: "dark", number: "02", title: "Bảo tàng Ẩn Phụ", shortTitle: "Ẩn Phụ", heading: "Những điều nhỏ.\nMột thế giới sâu.", intro: "Tre, Dâu tằm, Sen và Lúa. Bốn nhà mở ra bốn nếp sống — nơi hành động, suy tưởng, cảm xúc và sự vun bồi được kể bằng hình ảnh Việt.", description: "Bảo tàng Ẩn Phụ Hường Đông: 56 hồ sơ lá bài và bốn bảo tàng con Nhà Tre, Dâu tằm, Sen, Lúa trong không gian trưng bày tối.", image: "/assets/img/museum/minor-gallery.webp", imageAlt: "Phòng trưng bày tối với ánh đèn tập trung và chất liệu gỗ ấm", count: "56 lá · 4 bảo tàng con", collectionTitle: "Bộ sưu tập Ẩn Phụ" },
  { key: "history", path: "/la-bai/linh-nam-chich-quai/", theme: "courtyard", number: "03", title: "Bảo tàng Lĩnh Nam chích quái", shortTitle: "Lĩnh Nam chích quái", heading: "Một bảo tàng.\nNhiều lối trở về.", intro: "Một khoảng sân cho ký ức. Lần theo 34 truyện nguồn, rồi đặt câu chuyện cạnh bức tranh để nhìn rõ ranh giới giữa văn bản, huyền sử và chuyển thể.", description: "Bảo tàng Lĩnh Nam chích quái Hường Đông: 34 truyện nguồn, tranh chuyển thể và hồ sơ giám tuyển trong không gian sân đình Việt.", image: "/assets/img/museum/history-gallery.webp", imageAlt: "Không gian sân đình Việt với hồ nước và các gian trưng bày trong ánh sáng tự nhiên", count: "34 truyện · Văn bản và chuyển thể", collectionTitle: "Từ truyện nguồn đến hình tượng" },
  { key: "wands", path: "/la-bai/an-phu/tre/", parent: "minor", theme: "dark", number: "I", title: "Bảo tàng Nhà Tre", shortTitle: "Nhà Tre", heading: "Tre.\nSức sống vươn lên.", intro: "Mười bốn lát cắt của hành động: từ một ý tưởng vừa nảy đến khả năng dẫn đường. Nhà Tre tiếp nối chất Wands trong hệ Rider–Waite–Smith.", description: "Bảo tàng Nhà Tre: 14 hồ sơ Ẩn Phụ thuộc chất Wands, lời dẫn Việt và hệ nghĩa Rider–Waite–Smith.", image: "/assets/img/museum/minor-gallery.webp", imageAlt: "Không gian trưng bày tối của Bảo tàng Nhà Tre", count: "14 lá · Wands · Hành động", collectionTitle: "14 lá của Nhà Tre" },
  { key: "swords", path: "/la-bai/an-phu/dau-tam/", parent: "minor", theme: "dark", number: "II", title: "Bảo tàng Nhà Dâu tằm", shortTitle: "Nhà Dâu tằm", heading: "Dâu tằm.\nNhững đường tơ ý nghĩ.", intro: "Mười bốn lát cắt của tư duy: nhìn rõ, lựa chọn và đối diện điều khó nói. Nhà Dâu tằm tiếp nối chất Swords trong hệ Rider–Waite–Smith.", description: "Bảo tàng Nhà Dâu tằm: 14 hồ sơ Ẩn Phụ thuộc chất Swords, tư duy, lựa chọn và hệ nghĩa Rider–Waite–Smith.", image: "/assets/img/museum/minor-gallery.webp", imageAlt: "Không gian trưng bày tối của Bảo tàng Nhà Dâu tằm", count: "14 lá · Swords · Suy tưởng", collectionTitle: "14 lá của Nhà Dâu tằm" },
  { key: "cups", path: "/la-bai/an-phu/sen/", parent: "minor", theme: "dark", number: "III", title: "Bảo tàng Nhà Sen", shortTitle: "Nhà Sen", heading: "Sen.\nNhững tầng nước bên trong.", intro: "Mười bốn lát cắt của cảm xúc: kết nối, mất mát và khả năng mở lòng. Nhà Sen tiếp nối chất Cups trong hệ Rider–Waite–Smith.", description: "Bảo tàng Nhà Sen: 14 hồ sơ Ẩn Phụ thuộc chất Cups, cảm xúc, kết nối và hệ nghĩa Rider–Waite–Smith.", image: "/assets/img/museum/minor-gallery.webp", imageAlt: "Không gian trưng bày tối của Bảo tàng Nhà Sen", count: "14 lá · Cups · Cảm xúc", collectionTitle: "14 lá của Nhà Sen" },
  { key: "pentacles", path: "/la-bai/an-phu/lua/", parent: "minor", theme: "dark", number: "IV", title: "Bảo tàng Nhà Lúa", shortTitle: "Nhà Lúa", heading: "Lúa.\nMùa màng từ những bàn tay.", intro: "Mười bốn lát cắt của sự vun bồi: làm việc, học nghề và chăm sóc đời sống. Nhà Lúa tiếp nối chất Pentacles trong hệ Rider–Waite–Smith.", description: "Bảo tàng Nhà Lúa: 14 hồ sơ Ẩn Phụ thuộc chất Pentacles, lao động, vun bồi và hệ nghĩa Rider–Waite–Smith.", image: "/assets/img/museum/minor-gallery.webp", imageAlt: "Không gian trưng bày tối của Bảo tàng Nhà Lúa", count: "14 lá · Pentacles · Vun bồi", collectionTitle: "14 lá của Nhà Lúa" },
]);

const e = escapeHtml;
const majorRoom = MUSEUM_ROOMS[0];
const minorRoom = MUSEUM_ROOMS[1];
const historyRoom = MUSEUM_ROOMS[2];
const mobileNote = "hãy mở bản desktop để đạt chất lượng phòng 3d cao nhất";
const hubCrumb = { name: "Bảo tàng Hường Đông", path: "/la-bai/" };

export function museumRoomForCard(card) {
  return card.arcana === "major" ? majorRoom : MUSEUM_ROOMS.find((room) => room.key === card.suit) || minorRoom;
}

function breadcrumbs(items) {
  return `<nav class="mw-breadcrumb" aria-label="Đường dẫn">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${e(item.name)}</span>` : `<a href="${e(item.path)}">${e(item.name)}</a>`).join('<span aria-hidden="true"> / </span>')}</nav>`;
}

export function museumBreadcrumbForCard(card) {
  const room = museumRoomForCard(card);
  const items = [hubCrumb, ...(room.parent ? [{ name: minorRoom.shortTitle, path: minorRoom.path }] : []), { name: room.shortTitle, path: room.path }, { name: card.nameFolk, path: `/la-bai/${card.slug}/` }];
  return breadcrumbs(items);
}

function roomCrumbs(room) {
  return [hubCrumb, ...(room.parent ? [{ name: minorRoom.shortTitle, path: minorRoom.path }] : []), { name: room.shortTitle, path: room.path }];
}

function masthead(room = majorRoom) {
  const site = [["/tarot-la-gi/", "Tarot là gì"], ["/la-bai/", "Ba bảo tàng"], ["/la-bai/bo-suu-tap/", "Tra cứu 78 lá"], ["/khoa-hoc/", "Khóa học"], ["/tin-tuc/", "Bản tin Hường Đông"], ["/cua-hang/", "Cửa hàng"], ["/gioi-thieu/", "Giới thiệu"]];
  return `<header class="mw-masthead"><a class="mw-brand" href="/" aria-label="Hường Đông — Trang chủ"><img src="/assets/img/logo-huong-dong.webp" width="140" height="70" alt="Hường Đông"></a><nav class="mw-masthead-nav" aria-label="Điều hướng bảo tàng"><a href="/la-bai/">Bảo tàng</a><a href="/la-bai/bo-suu-tap/">Bộ sưu tập</a><a class="mw-desktop-3d" href="${room.path}3d/">Tham quan 3D</a></nav><details class="mw-menu"><summary>Mục lục</summary><nav class="mw-menu-panel" aria-label="Mục lục website">${site.map(([href, title]) => `<a href="${href}">${title}</a>`).join("")}${MUSEUM_ROOMS.map((item) => `<a href="${item.path}">${e(item.title)}</a>`).join("")}</nav></details></header>`;
}

function hero(room) {
  const title = room.heading.split("\n").map(e).join("<br>");
  return `<section class="mw-hero" aria-labelledby="mw-title">
    <div class="mw-hero-copy"><p class="mw-eyebrow">${e(room.title)} · ${e(room.number)}</p><h1 id="mw-title">${title}</h1><p class="mw-intro">${e(room.intro)}</p><p class="mw-meta">${e(room.count)}</p>
      <div class="mw-actions"><a class="mw-button mw-desktop-3d" href="${room.path}3d/">Bước vào phòng 3D</a><a class="mw-link mw-mobile-primary" href="#${room.key === "history" ? "truyen-nguon" : room.key === "minor" ? "cac-nha" : "bo-suu-tap"}">${room.key === "history" ? "Mở 34 truyện nguồn" : room.key === "minor" ? "Chọn một nhà" : "Khám phá bộ sưu tập"}</a></div><p class="mw-3d-mobile-note">${mobileNote}</p>
    </div><figure class="mw-hero-art"><img src="${room.image}" width="1536" height="1024" alt="${e(room.imageAlt)}" loading="eager" decoding="async" fetchpriority="high"><figcaption>Không gian trưng bày số · Hường Đông</figcaption></figure>
  </section><nav class="mw-room-rail" aria-label="Chuyển bảo tàng">${[...MUSEUM_ROOMS.slice(0, 3), { path: "/la-bai/an-phu/#cac-nha", shortTitle: "Các nhà" }].map((item) => `<a href="${item.path}"${item.path === room.path ? ' aria-current="page"' : ""}>${e(item.shortTitle)}</a>`).join("")}</nav>`;
}

function roomDirectory(rooms, house = false) {
  const houseImages = { wands: "tre", swords: "dau-tam", cups: "sen", pentacles: "lua" };
  return `<div class="${house ? "mw-house-index" : "mw-directory"}">${rooms.map((room) => `<a class="mw-room-card" href="${room.path}" data-room-theme="${room.theme}">
    <span class="mw-room-number">${room.number}</span>${house ? `<img class="mw-house-image" src="/assets/img/suits/suit-${houseImages[room.key]}-800.webp" width="800" height="1200" alt="Phù hiệu ${e(room.shortTitle)} — hình ảnh chung của nhà" loading="lazy" decoding="async">` : `<img class="mw-room-image" src="${room.image}" width="768" height="512" alt="${e(room.imageAlt)}" loading="lazy" decoding="async">`}
    <span class="mw-room-title">${e(room.shortTitle)}</span><span class="mw-room-description">${e(room.count)}</span><span class="mw-room-invitation">${house ? "Vào nhà" : "Khám phá bảo tàng"}</span>
  </a>`).join("")}</div>`;
}

function dailyCardInvitation() {
  // Public invitation in the museum hub only. The destination keeps its gate;
  // this link must work without JavaScript and must never carry a password.
  return `<section class="mw-daily-invitation" aria-labelledby="mw-daily-title">
    <div class="mw-daily-copy"><p class="mw-eyebrow">Góc trải nghiệm</p><h2 id="mw-daily-title">Lá bài hôm nay</h2><p>Bạn có thể bốc một lá và đọc lời gợi ý cho ngày hôm nay, trước khi tiếp tục dạo qua ba bảo tàng.</p></div>
    <div class="mw-daily-action"><a class="mw-button" href="/thanh-vien/la-bai-hom-nay/" aria-describedby="mw-daily-note">Khám phá lá bài hôm nay</a><p id="mw-daily-note">Trang trải nghiệm cần mật khẩu thành viên.</p></div>
  </section>`;
}

function artworkNote(card) {
  // Firestore may temporarily omit imageStatus while still publishing the
  // shared house emblem. Never turn that omission into a claim of unique art.
  if (card.artNote) return card.artNote;
  if (card.arcana === "minor" && /\/suits\//.test(card.image?.url || "")) return "Chưa có tranh riêng cho lá này; đang dùng phù hiệu của nhà.";
  return "";
}

function exhibit(card) {
  const note = artworkNote(card);
  const thumbnail = card.thumbnail || card.image;
  return `<article class="tarot-card museum-exhibit mw-exhibit" data-arcana="${e(card.arcana)}" data-suit="${e(card.suitValue || card.suit || "")}" data-search="${e(card.searchText)}" data-museum-slug="${e(card.slug)}">
    <a class="museum-frame mw-frame" href="/la-bai/${e(card.slug)}/" aria-label="Mở hồ sơ đầy đủ của ${e(card.nameFolk)}"><span class="museum-index mw-exhibit-number" aria-hidden="true">${e(card.museumIndex)}</span><img src="${e(thumbnail.url)}" width="400" height="600" loading="lazy" decoding="async" alt="${e(thumbnail.alt)}" data-full-image="${e(card.image.url)}"></a>
    <div class="museum-plaque mw-plaque"><p class="museum-accession">${e(card.museumAccession)}</p><h2>${e(card.nameFolk)}</h2><p class="museum-original">${e(card.nameEn)}</p><p class="museum-source">${e(card.museumSource)}</p><p class="museum-summary" hidden>${e(card.museumSummary)}</p>${note ? `<p class="mw-art-note" data-museum-note>${e(note)}</p>` : ""}<button type="button" data-museum-preview>Ngắm cận cảnh</button></div>
  </article>`;
}

function collection(cards, title, key = "all") {
  const all = key === "all";
  const suitOptions = MUSEUM_ROOMS.filter((room) => room.parent).map((room) => `<option value="${room.key}">${e(room.shortTitle)}</option>`).join("");
  const groupButtons = all ? `<fieldset><legend>Nhóm lá bài</legend><button type="button" data-filter="all" aria-pressed="true">Tất cả <span>${cards.length}</span></button><button type="button" data-filter="major">Ẩn Chính <span>${cards.filter((card) => card.arcana === "major").length}</span></button><button type="button" data-filter="minor">Ẩn Phụ <span>${cards.filter((card) => card.arcana === "minor").length}</span></button></fieldset>` : "";
  const houseSelect = all || key === "minor" ? `<label>Nhà Ẩn Phụ<select name="suit"><option value="">Tất cả bốn nhà</option>${suitOptions}</select></label>` : '<select name="suit" aria-label="Nhà Ẩn Phụ" hidden><option value="">Bộ sưu tập hiện tại</option></select>';
  return `<section class="mw-collection" id="bo-suu-tap" aria-labelledby="mw-collection-title"><header class="mw-section-heading"><p class="mw-eyebrow">Bộ sưu tập thường trực</p><h2 id="mw-collection-title">${e(title)}</h2><p>Ngắm tranh, đọc nhãn và mở hồ sơ để đối chiếu nguồn cùng hệ nghĩa Rider–Waite–Smith.</p></header>
    <form class="filters museum-filters mw-filters" data-card-filters data-collection-room="${e(key)}"><label>Tìm theo tên hoặc từ khóa<input type="search" name="q" placeholder="Tên lá, hình tượng hoặc từ khóa" autocomplete="off"></label>${groupButtons}${houseSelect}<p><strong data-result-count>${cards.length}</strong> hồ sơ</p></form>
    <div class="card-grid library-grid museum-wall mw-wall" data-card-grid data-page-size="12">${cards.map(exhibit).join("")}</div><p class="empty-state" data-empty hidden>Không tìm thấy hồ sơ phù hợp. Hãy thử từ khóa ngắn hơn.</p><div class="mw-pagination"><p data-museum-page-status role="status"></p><button type="button" class="mw-button" data-museum-more hidden>Xem thêm tác phẩm</button></div>
  </section>`;
}

function closeupDialog() {
  return `<dialog class="museum-dialog mw-dialog" data-museum-dialog aria-labelledby="museum-dialog-title"><button class="museum-dialog-close" type="button" data-museum-close aria-label="Đóng chế độ ngắm cận cảnh">Đóng</button><div class="museum-dialog-layout"><figure class="museum-dialog-art"><img data-museum-dialog-image src="/assets/img/default-og.webp" width="768" height="1152" alt=""></figure><div class="museum-dialog-copy"><p class="mw-eyebrow" data-museum-dialog-accession>Hồ sơ</p><h2 id="museum-dialog-title" data-museum-dialog-title></h2><p class="museum-dialog-original" data-museum-dialog-original></p><p data-museum-dialog-summary></p><p class="museum-dialog-source"><strong>Nguồn trưng bày:</strong> <span data-museum-dialog-source></span></p><p class="mw-art-note" data-museum-dialog-note hidden></p><div class="museum-dialog-actions"><button type="button" data-museum-prev>Trước</button><a href="/la-bai/bo-suu-tap/" data-museum-dialog-link>Mở hồ sơ tác phẩm</a><button type="button" data-museum-next>Sau</button></div></div></div></dialog>`;
}

function storyIndex(chapters) {
  return `<section class="mw-stories" id="truyen-nguon" aria-labelledby="mw-stories-title"><header class="mw-section-heading"><p class="mw-eyebrow">Thư viện văn bản</p><h2 id="mw-stories-title">34 truyện, nhiều lối đọc</h2><p>Đọc theo chương, hoặc lần theo một hình tượng quen thuộc. Đây là truyện huyền sử, không phải sử liệu đã được kiểm chứng.</p></header><ol class="mw-story-index">${chapters.map((chapter) => `<li><a href="/la-bai/huyen-su/${e(chapter.slug)}/"><span class="mw-story-number">${String(chapter.n).padStart(2, "0")}</span><span><strong>${e(chapter.title)}</strong><small>${chapter.cards.length ? `Liên hệ ${chapter.cards.map((card) => e(card.roman)).join(" · ")}` : "Văn bản nguồn"}</small></span></a></li>`).join("")}</ol><p class="mw-source-note">Trần Thế Pháp, <em>Lĩnh Nam chích quái</em>. Bản tiếng Việt hiệu chỉnh chính tả 2026 đang dùng không phải ấn bản khảo dị hoặc dịch chú học thuật và không có số trang. Tranh trên website là hình ảnh chuyển thể của Hường Đông, không phải minh họa nguyên bản trong sách.</p></section>`;
}

function roomCards(room, cards, chapters) {
  if (room.key === "major") return cards.filter((card) => card.arcana === "major");
  if (room.key === "minor") return cards.filter((card) => card.arcana === "minor");
  if (room.key === "history") {
    const related = new Set(chapters.flatMap((chapter) => chapter.cards.map((card) => card.slug)));
    return cards.filter((card) => related.has(card.slug));
  }
  return cards.filter((card) => card.suit === room.key);
}

function sceneData(room, cards) {
  // The minor hall leads to four museums. Its house emblems must not inherit
  // a randomly selected card's identity or pretend to be 56 distinct images.
  const exhibits = room.key === "minor"
    ? MUSEUM_ROOMS.filter((house) => house.parent).map((house) => {
      const representative = cards.find((card) => card.suit === house.key);
      return { id: `house-${house.key}`, title: house.shortTitle, subtitle: `${cards.filter((card) => card.suit === house.key).length} hồ sơ · ${house.count.split(" · ")[1]}`, image: representative?.image.url || house.image, href: house.path, source: `Phù hiệu ${house.shortTitle} — Hường Đông. Hệ nghĩa Rider–Waite–Smith.`, note: "Hình ảnh chung của nhà; các lá trong nhà chưa có tranh minh họa riêng.", linkLabel: "Mở bảo tàng con" };
    })
    : cards.map((card) => ({ id: card.slug, title: card.nameFolk, subtitle: card.nameEn, image: card.image.url, href: `/la-bai/${card.slug}/`, source: card.museumSource, note: artworkNote(card), linkLabel: "Mở hồ sơ tác phẩm" }));
  return { room: room.key, title: room.title, theme: room.theme, exhibits };
}

function viewer(room, cards) {
  const scene = JSON.stringify(sceneData(room, cards)).replaceAll("<", "\\u003c");
  return `<main id="noi-dung-chinh" class="transition-page mw-main" data-page="library" data-museum-world="${room.theme}" data-museum-room="${room.key}" data-museum-view="3d">${breadcrumbs([...roomCrumbs(room), { name: "Phòng 3D", path: `${room.path}3d/` }])}
    <div class="mw-viewer" data-museum-viewer data-room="${room.key}" data-theme="${room.theme}"><div class="mw-viewer-cover"><img src="${room.image}" width="1536" height="1024" alt="${e(room.imageAlt)}" decoding="async"><div class="mw-viewer-intro"><p class="mw-eyebrow">Không gian trưng bày 3D · Desktop</p><h1>${e(room.title)}</h1><p>Chủ động bước vào không gian, chọn một khung tranh rồi mở hồ sơ. Phòng 3D chỉ tải khi bạn bắt đầu.</p>${room.key === "minor" || room.parent ? '<p class="mw-art-note">Các lá Ẩn Phụ hiện dùng phù hiệu chung của từng nhà, chưa có 56 tranh riêng.</p>' : ""}<button type="button" class="mw-button mw-desktop-3d" data-3d-start>Bước vào phòng 3D</button><p class="mw-3d-mobile-note">${mobileNote}</p><a class="mw-link mw-mobile-primary" href="${room.path}">Xem bảo tàng 2D</a></div></div>
      <div class="mw-canvas-host" data-3d-canvas hidden></div><p class="mw-3d-status" data-3d-status role="status" aria-live="polite"></p><div class="mw-3d-toolbar" data-3d-toolbar hidden><button type="button" data-3d-exit>Rời phòng 3D</button><button type="button" data-3d-prev>Tranh trước</button><button type="button" data-3d-inspect>Xem tác phẩm</button><button type="button" data-3d-next>Tranh sau</button><button type="button" data-3d-reset>Về vị trí đầu</button><a href="${room.path}">Bảo tàng 2D</a></div><p class="mw-3d-help">Dùng chuột để quan sát; chọn Tranh trước / Tranh sau để di chuyển. Mở tác phẩm bằng nút Xem tác phẩm. Nhấn Escape để rời chế độ xem.</p>
    </div><script type="application/json" data-3d-data data-museum-scene>${scene}</script><dialog class="mw-3d-dialog" data-3d-dialog aria-labelledby="mw-3d-title"><button type="button" data-3d-close aria-label="Đóng hồ sơ tác phẩm">Đóng</button><img data-3d-image width="400" height="600" alt=""><div><h2 id="mw-3d-title" data-3d-title></h2><p data-3d-source></p><p class="mw-art-note" data-3d-note></p><a data-3d-link href="${room.path}">Mở hồ sơ tác phẩm</a></div></dialog>
  </main>`;
}

export function createMuseumPages(cards, chapters, historyHtml = "") {
  const pages = [{
    path: "/la-bai/", title: "Bảo tàng Hường Đông — Ba không gian nghệ thuật", description: "Ba bảo tàng nghệ thuật Hường Đông: Ẩn Chính, Ẩn Phụ và Lĩnh Nam chích quái. Chọn không gian của bạn, khám phá tranh và hồ sơ nguồn.", image: majorRoom.image, crumbs: [hubCrumb],
    content: `<main id="noi-dung-chinh" class="transition-page mw-main" data-page="library" data-museum-world="hub" data-museum-view="entry"><section class="mw-hub-intro"><p class="mw-eyebrow">Hường Đông · Bảo tàng nghệ thuật số</p><h1>Ba bảo tàng.<br>Ba cách bước vào.</h1><p class="mw-intro">Một bộ bài, nhiều thế giới. Chọn khoảng sáng của Ẩn Chính, chiều sâu của Ẩn Phụ hoặc sân đình lưu giữ những truyện xưa.</p></section>${dailyCardInvitation()}${roomDirectory(MUSEUM_ROOMS.slice(0, 3))}<section class="mw-hub-footer"><p>Tranh trước. Câu chuyện sau. Mỗi không gian có nhịp điệu riêng để bạn thong thả khám phá.</p><a class="mw-link" href="/la-bai/bo-suu-tap/">Tra cứu toàn bộ 78 lá</a><p class="mw-3d-mobile-note">${mobileNote}</p></section></main>`,
  }];
  for (const room of MUSEUM_ROOMS) {
    const selected = roomCards(room, cards, chapters);
    const houseIndex = room.key === "minor" ? `<section class="mw-houses" id="cac-nha" aria-labelledby="mw-houses-title"><header class="mw-section-heading"><p class="mw-eyebrow">Bốn bảo tàng con</p><h2 id="mw-houses-title">Mỗi nhà, một nếp sống.</h2><p>Bốn không gian độc lập. Mỗi nhà gìn giữ 14 hồ sơ, từ lá Át đến Quốc Vương.</p></header>${roomDirectory(MUSEUM_ROOMS.filter((item) => item.parent), true)}</section>` : "";
    const disclosure = room.key === "minor" || room.parent ? '<aside class="mw-disclosure"><p><strong>Về hình ảnh đang trưng bày.</strong> 56 lá Ẩn Phụ hiện dùng bốn phù hiệu nhà; chưa có 56 tranh minh họa riêng. Mỗi hồ sơ vẫn giữ nội dung, hệ nghĩa và nguồn chuyển thể của lá tương ứng.</p></aside>' : "";
    const historical = room.key === "history" ? `${storyIndex(chapters)}${historyHtml ? `<details class="mw-curator-notes"><summary>Đọc hồ sơ giám tuyển và nguyên tắc đối chiếu nguồn</summary>${historyHtml}</details>` : ""}` : "";
    pages.push({ path: room.path, title: room.title, description: room.description, image: room.image, crumbs: roomCrumbs(room), content: `<main id="noi-dung-chinh" class="transition-page mw-main" data-page="library" data-museum-world="${room.theme}" data-museum-room="${room.key}" data-museum-view="entry">${breadcrumbs(roomCrumbs(room))}${hero(room)}${houseIndex}${disclosure}${historical}${room.key === "minor" ? '<div id="bo-suu-tap" class="mw-section-heading"><a class="mw-link" href="/la-bai/bo-suu-tap/?arcana=minor">Tra cứu toàn bộ 56 hồ sơ Ẩn Phụ</a></div>' : collection(selected, room.collectionTitle, room.key) + closeupDialog()}<nav class="mw-crosslink" aria-label="Khám phá tiếp"><a class="mw-link" href="/la-bai/">Ba bảo tàng Hường Đông</a><a class="mw-link" href="/la-bai/bo-suu-tap/">Tra cứu toàn bộ 78 lá</a></nav></main>` });
    pages.push({ path: `${room.path}3d/`, title: `Phòng 3D — ${room.title}`, description: `Khám phá ${room.title} trong không gian 3D trên desktop. Có bản 2D đầy đủ cho điện thoại, trình đọc màn hình và khi không dùng WebGL.`, image: room.image, crumbs: [...roomCrumbs(room), { name: "Phòng 3D", path: `${room.path}3d/` }], content: viewer(room, selected) });
  }
  pages.push({ path: "/la-bai/bo-suu-tap/", title: "Tra cứu 78 lá — Bảo tàng Hường Đông", description: "Tìm tên lá, hình tượng và từ khóa trong toàn bộ 78 hồ sơ Tarot Hường Đông. Lọc theo Ẩn Chính, Ẩn Phụ và bốn nhà.", image: majorRoom.image, crumbs: [hubCrumb, { name: "Tra cứu 78 lá", path: "/la-bai/bo-suu-tap/" }], content: `<main id="noi-dung-chinh" class="transition-page mw-main" data-page="library" data-museum-world="light" data-museum-view="catalog">${breadcrumbs([hubCrumb, { name: "Tra cứu 78 lá", path: "/la-bai/bo-suu-tap/" }])}<header class="mw-catalog-intro"><p class="mw-eyebrow">Danh mục toàn bộ</p><h1>Tra cứu 78 lá.</h1><p class="mw-intro">Một nơi để tìm nhanh. Nếu muốn thong thả xem tranh, hãy <a href="/la-bai/">chọn một bảo tàng</a>.</p></header>${collection(cards, "78 hồ sơ Tarot Hường Đông")}${closeupDialog()}</main>` });
  return pages.map((page) => ({ ...page, content: page.content.replace(/(<main\b[^>]*>)/, `$1${masthead(MUSEUM_ROOMS.find((room) => page.path === room.path || page.path === `${room.path}3d/`))}`) }));
}
