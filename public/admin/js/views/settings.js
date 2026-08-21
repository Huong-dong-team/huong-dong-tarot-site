import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "../firebase.js";
import { toast } from "../components/toast.js";
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export async function settingsView(root, params, context) {
  if (context.profile.role !== "owner") { root.innerHTML = "<h1>Không đủ quyền</h1><p>Chỉ owner được đổi cấu hình website.</p>"; return; }
  const snapshot = await getDoc(doc(db, "settings", "site")); const site = snapshot.data() || {}; const social = site.social || {};
  root.innerHTML = `<h1>Cấu hình website</h1><p class="page-lead">Các giá trị này được đọc lúc xuất bản. Sau khi lưu, hãy xuất bản lại website mới thấy thay đổi trên trang khách.</p><form class="panel form-grid"><label class="field"><span>Tên site</span><input name="siteName" value="${esc(site.siteName)}"></label><label class="field"><span>Tagline</span><input name="tagline" value="${esc(site.tagline)}"><small class="hint">Hiện ở chân trang mọi trang.</small></label><label class="field full"><span>Mô tả mặc định</span><textarea name="description">${esc(site.description)}</textarea></label><label class="field"><span>Tên miền gốc</span><input name="baseUrl" type="url" value="${esc(site.baseUrl)}"></label><label class="field"><span>Ảnh OG mặc định</span><input name="defaultOgImage" value="${esc(site.defaultOgImage)}"></label><label class="field"><span>GA4 ID</span><input name="ga4Id" value="${esc(site.ga4Id)}" pattern="G-[A-Z0-9]{4,}" placeholder="G-XXXXXXXXXX"><small class="hint">Để trống thì website không nạp Google Analytics. Sai định dạng sẽ bị bỏ qua khi build.</small></label><label class="field"><span>Email liên hệ</span><input name="contactEmail" type="email" value="${esc(site.contactEmail)}"><small class="hint">Hiện ở chân trang và trang quyền riêng tư.</small></label><label class="field"><span>Facebook</span><input name="social.facebook" type="url" value="${esc(social.facebook)}"></label><label class="field"><span>Threads</span><input name="social.threads" type="url" value="${esc(social.threads)}"></label><label class="field"><span>TikTok</span><input name="social.tiktok" type="url" value="${esc(social.tiktok)}"></label><label class="field full"><span>Link xuất bản website</span><input name="publishWorkflowUrl" type="url" value="${esc(site.publishWorkflowUrl)}" placeholder="https://github.com/TAI-KHOAN/TEN-REPO/actions/workflows/publish-firebase.yml"><small class="hint">Dán địa chỉ workflow "publish-firebase" trên GitHub. Khi có link này, trang Tổng quan sẽ hiện nút Xuất bản website.</small></label><button class="button" type="submit">Lưu cấu hình</button></form>`;
  root.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const entries = Object.fromEntries(new FormData(event.currentTarget));
    // Tách các khóa "social.*" thành đối tượng lồng để khớp cấu trúc Firestore
    // mà scripts/build.js đang đọc; nếu ghi phẳng, chân trang sẽ không nhận được.
    const payload = { social: { ...social } };
    for (const [key, value] of Object.entries(entries)) {
      if (key.startsWith("social.")) payload.social[key.slice(7)] = value;
      else payload[key] = value;
    }
    await setDoc(doc(db, "settings", "site"), { ...site, ...payload }, { merge: true });
    toast("Đã lưu cấu hình. Hãy xuất bản lại website để áp dụng.");
  });
}
