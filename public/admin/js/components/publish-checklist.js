export function publishChecklist() {
  return `<ul class="checklist" data-checklist><li data-check="title">Tiêu đề SEO từ 1–65 ký tự</li><li data-check="description">Mô tả SEO từ 120–160 ký tự</li><li data-check="slug">Slug hợp lệ</li><li data-check="image">Có ảnh OG</li><li data-check="alt">Mọi ảnh chính có alt text</li><li data-check="link">Tin tức có ít nhất một liên kết nội bộ</li></ul>`;
}
export function bindChecklist(root, { requireInternalLink = false } = {}) {
  const items = Object.fromEntries([...root.querySelectorAll("[data-check]")].map((item) => [item.dataset.check, item]));
  const publish = root.querySelector("[data-publish]");
  const run = () => {
    const value = (name) => root.querySelector(`[name="${name}"]`)?.value.trim() || "";
    const states = { title: value("seo.title").length > 0 && value("seo.title").length <= 65, description: value("seo.description").length >= 120 && value("seo.description").length <= 160, slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value("slug")), image: Boolean(value("seo.ogImage")), alt: Boolean(value("image.alt") || value("coverImage.alt")), link: !requireInternalLink || /href=["']\//.test(value("contentHtml")) };
    Object.entries(states).forEach(([key, ok]) => { if (items[key]) { items[key].dataset.ok = String(ok); items[key].textContent = `${ok ? "✓" : "○"} ${items[key].textContent.replace(/^[✓○]\s*/, "")}`; } });
    if (publish) publish.disabled = !Object.values(states).every(Boolean);
    return states;
  };
  root.addEventListener("input", run); run(); return run;
}
