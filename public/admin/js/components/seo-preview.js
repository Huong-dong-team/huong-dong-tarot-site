const escape = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export function seoPreview(data = {}) {
  return `<div class="seo-preview"><div class="preview-card"><p class="hint">Xem trước Google</p><div class="google-url" data-preview-url>huongdong.id.vn/${escape(data.slug || "duong-dan")}</div><div class="google-title" data-preview-title>${escape(data.title || "Tiêu đề SEO")}</div><p data-preview-description>${escape(data.description || "Mô tả SEO sẽ hiện ở đây.")}</p></div><div class="preview-card"><p class="hint">Xem trước Facebook</p><img data-preview-image src="${escape(data.image || "/assets/img/default-og.webp")}" width="600" height="315" alt=""><div class="facebook-title" data-preview-title>${escape(data.title || "Tiêu đề SEO")}</div><p data-preview-description>${escape(data.description || "Mô tả SEO sẽ hiện ở đây.")}</p></div></div>`;
}
export function bindSeoPreview(root) {
  const title = root.querySelector("[name='seo.title']"), description = root.querySelector("[name='seo.description']"), slug = root.querySelector("[name='slug']"), image = root.querySelector("[name='seo.ogImage']");
  const update = () => {
    root.querySelectorAll("[data-preview-title]").forEach((item) => item.textContent = title?.value || "Tiêu đề SEO");
    root.querySelectorAll("[data-preview-description]").forEach((item) => item.textContent = description?.value || "Mô tả SEO sẽ hiện ở đây.");
    const url = root.querySelector("[data-preview-url]"); if (url) url.textContent = `huongdong.id.vn/${slug?.value || "duong-dan"}`;
    const previewImage = root.querySelector("[data-preview-image]"); if (previewImage && image?.value) previewImage.src = image.value;
  };
  [title, description, slug, image].filter(Boolean).forEach((field) => field.addEventListener("input", update)); update();
}
