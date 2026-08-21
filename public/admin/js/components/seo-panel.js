import { seoPreview, bindSeoPreview } from "./seo-preview.js";
import { publishChecklist, bindChecklist } from "./publish-checklist.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export function seoPanel(seo = {}, slug = "", { requireInternalLink = false } = {}) {
  return `<section class="panel"><h2>SEO và thẻ chia sẻ</h2><div class="form-grid"><label class="field"><span>Tiêu đề SEO</span><input name="seo.title" maxlength="65" value="${esc(seo.title)}"><small class="hint char-count" data-count-for="seo.title"></small></label><label class="field"><span>Đường dẫn (slug)</span><input name="slug" required value="${esc(slug)}" pattern="[a-z0-9]+(?:-[a-z0-9]+)*"></label><label class="field full"><span>Mô tả SEO</span><textarea name="seo.description" maxlength="160">${esc(seo.description)}</textarea><small class="hint char-count" data-count-for="seo.description"></small></label><label class="field full"><span>Ảnh chia sẻ OG (tối thiểu 1200×630)</span><input name="seo.ogImage" value="${esc(seo.ogImage)}"></label></div>${seoPreview({ title: seo.title, description: seo.description, slug, image: seo.ogImage })}${publishChecklist()}<input type="hidden" data-require-link value="${requireInternalLink}"></section>`;
}
export function bindSeoPanel(root, options = {}) {
  bindSeoPreview(root); bindChecklist(root, options);
  root.querySelectorAll("[data-count-for]").forEach((counter) => {
    const field = root.querySelector(`[name="${counter.dataset.countFor}"]`);
    const update = () => { const length = field.value.length; counter.textContent = `${length} ký tự`; counter.dataset.state = counter.dataset.countFor === "seo.title" ? (length <= 60 ? "good" : length <= 65 ? "warn" : "bad") : (length >= 120 && length <= 160 ? "good" : length > 160 ? "bad" : "warn"); };
    field.addEventListener("input", update); update();
  });
}
