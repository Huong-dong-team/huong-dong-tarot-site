/* Lightweight museum navigation and 2D catalogue. No canvas, scroll listener,
   animation loop or texture loading belongs in the ordinary reading view. */
const normalize = (value) => String(value || "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLocaleLowerCase("vi").trim();

export const HOUSE_PATHS = Object.freeze({
  wands: "/la-bai/an-phu/tre/",
  swords: "/la-bai/an-phu/dau-tam/",
  cups: "/la-bai/an-phu/sen/",
  pentacles: "/la-bai/an-phu/lua/",
});

export function legacyMuseumDestination(search, hash) {
  const params = new URLSearchParams(search);
  const term = params.get("q");
  if (term?.trim()) return `/la-bai/bo-suu-tap/?${params.toString()}#bo-suu-tap`;
  const house = HOUSE_PATHS[params.get("suit")];
  if (house) return house;
  if (params.get("arcana") === "major") return "/la-bai/an-chinh/";
  if (params.get("arcana") === "minor") return "/la-bai/an-phu/";
  if (["#phong-huyen-su", "#nguyen-tac", "#tu-bat-tu", "#tu-dai-thien-su", "#lnc-toan-van", "#ban-do"].includes(hash)) {
    return "/la-bai/linh-nam-chich-quai/#truyen-nguon";
  }
  if (hash === "#bo-suu-tap") return "/la-bai/bo-suu-tap/#bo-suu-tap";
  return "";
}

export function matchesMuseumRecord(record, { arcana = "all", suit = "", term = "" }) {
  return (arcana === "all" || record.arcana === arcana)
    && (!suit || record.suit === suit)
    && (!normalize(term) || normalize(record.search).includes(normalize(term)));
}

export function init() {
  const main = document.querySelector("main[data-museum-world]");
  if (!main) return () => {};
  if (/^\/la-bai\/(?:index\.html)?$/.test(location.pathname)) {
    const destination = legacyMuseumDestination(location.search, location.hash);
    if (destination) {
      location.replace(destination);
      return () => {};
    }
  }

  const controller = new AbortController();
  const { signal } = controller;
  const menu = main.querySelector(".mw-menu");
  const closeMenu = () => { if (menu) menu.open = false; };
  main.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.open) {
      closeMenu();
      menu.querySelector("summary")?.focus();
    }
  }, { signal });
  document.addEventListener("click", (event) => {
    if (menu?.open && !menu.contains(event.target)) closeMenu();
  }, { signal });
  main.querySelectorAll(".mw-masthead-nav a, .mw-menu-panel a").forEach((link) => {
    if (new URL(link.href).pathname === location.pathname) link.setAttribute("aria-current", "page");
  });

  const filters = main.querySelector("[data-card-filters]");
  const grid = main.querySelector("[data-card-grid]");
  if (!filters || !grid) return () => controller.abort();
  const search = filters.elements.namedItem("q");
  const suitSelect = filters.elements.namedItem("suit");
  const buttons = [...filters.querySelectorAll("[data-filter]")];
  const records = [...grid.querySelectorAll("[data-arcana]")].map((element) => ({
    element, arcana: element.dataset.arcana, suit: element.dataset.suit, search: element.dataset.search,
  }));
  const count = filters.querySelector("[data-result-count]");
  const empty = main.querySelector("[data-empty]");
  const more = main.querySelector("[data-museum-more]");
  const status = main.querySelector("[data-museum-page-status]");
  const pageSize = Math.max(1, Number(grid.dataset.pageSize) || 12);
  const params = new URLSearchParams(location.search);
  let limit = pageSize;
  let arcana = buttons.some((button) => button.dataset.filter === params.get("arcana")) ? params.get("arcana") : "all";
  if (search) search.value = params.get("q") || "";
  if (suitSelect && [...suitSelect.options].some((option) => option.value === params.get("suit"))) {
    suitSelect.value = params.get("suit");
    if (suitSelect.value) arcana = "minor";
  }

  const syncUrl = () => {
    const url = new URL(location.href);
    const term = search?.value.trim();
    if (term) url.searchParams.set("q", term); else url.searchParams.delete("q");
    if (arcana !== "all" && buttons.length) url.searchParams.set("arcana", arcana); else url.searchParams.delete("arcana");
    if (suitSelect?.value) url.searchParams.set("suit", suitSelect.value); else url.searchParams.delete("suit");
    history.replaceState(history.state, "", url);
  };
  const render = (save = false) => {
    const query = { arcana, suit: suitSelect?.value || "", term: search?.value || "" };
    let matching = 0;
    for (const record of records) {
      const matches = matchesMuseumRecord(record, query);
      record.element.hidden = !matches || matching >= limit;
      if (matches) matching += 1;
    }
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === arcana)));
    if (count) count.textContent = String(matching);
    if (empty) empty.hidden = matching > 0;
    if (more) more.hidden = matching <= limit;
    if (status) status.textContent = matching ? `Đang xem ${Math.min(limit, matching)} trong ${matching} hồ sơ.` : "Không có kết quả phù hợp.";
    if (save) syncUrl();
  };
  const reset = () => { limit = pageSize; render(true); };
  buttons.forEach((button) => button.addEventListener("click", () => {
    arcana = button.dataset.filter;
    if (arcana !== "minor" && suitSelect) suitSelect.value = "";
    reset();
  }, { signal }));
  search?.addEventListener("input", reset, { signal });
  suitSelect?.addEventListener("change", () => {
    if (suitSelect.value) arcana = "minor";
    reset();
  }, { signal });
  filters.addEventListener("submit", (event) => { event.preventDefault(); reset(); }, { signal });
  more?.addEventListener("click", () => {
    const previousLimit = limit;
    limit += pageSize;
    render();
    // The focused load button disappears on the final batch. Return focus to
    // its first new work, preserving a useful keyboard/screen-reader position.
    if (more.hidden) {
      const visible = records.filter((record) => !record.element.hidden);
      visible[previousLimit]?.element.querySelector("a")?.focus({ preventScroll: true });
    }
  }, { signal });
  render();
  return () => controller.abort();
}
