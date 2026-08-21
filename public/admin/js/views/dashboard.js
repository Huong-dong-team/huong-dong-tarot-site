import { collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "../firebase.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

// Chỉ nhận link workflow GitHub thật; giá trị này do owner nhập trong Cấu hình
// nên phải kiểm tra trước khi đưa vào href để tránh javascript: hoặc data:.
function publishUrl(site) {
  const raw = String(site.publishWorkflowUrl || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && url.hostname === "github.com" ? url.toString() : "";
  } catch { return ""; }
}

export async function dashboardView(root) {
  const [cards, posts, subscribers, recent, settings] = await Promise.all([
    getCountFromServer(collection(db, "cards")), getCountFromServer(collection(db, "posts")), getCountFromServer(collection(db, "subscribers")), getDocs(query(collection(db, "cards"), orderBy("updatedAt", "desc"), limit(5))).catch(() => ({ docs: [] })), getDoc(doc(db, "settings", "site")).catch(() => null),
  ]);
  const target = publishUrl(settings?.data() || {});
  const publishPanel = target
    ? `<p>Nội dung đã duyệt nằm trong Firestore. Bấm nút dưới đây để mở GitHub, rồi bấm <strong>Run workflow</strong> một lần; website sẽ tự build, chạy kiểm thử và triển khai trong khoảng hai phút.</p><p><a class="button" href="${esc(target)}" target="_blank" rel="noopener noreferrer">Xuất bản website</a></p><p><small class="hint">Nếu kiểm thử thất bại, GitHub sẽ dừng và không triển khai — trang khách vẫn giữ bản cũ.</small></p>`
    : `<p>Trang khách là HTML sinh sẵn để SEO và Open Graph ổn định, nên nội dung mới chỉ lên web sau khi xuất bản lại.</p><p>Chưa cấu hình nút xuất bản. Owner vào <a href="#/settings">Cấu hình</a> và dán link workflow <code>publish-firebase</code> trên GitHub. Trong lúc chờ, người vận hành chạy <code>npm run build &amp;&amp; npm run deploy</code> trên máy.</p>`;
  root.innerHTML = `<h1>Tổng quan</h1><p class="page-lead">Nội dung được lưu vào Firestore. Để cập nhật trang khách và thẻ chia sẻ, hãy xuất bản lại website sau khi biên tập.</p><div class="cards-summary"><article class="metric"><strong>${cards.data().count}</strong><span>Lá bài</span></article><article class="metric"><strong>${posts.data().count}</strong><span>Bài tin</span></article><article class="metric"><strong>${subscribers.data().count}</strong><span>Email chờ</span></article><article class="metric"><strong>78</strong><span>Mục tiêu dữ liệu</span></article></div><section class="panel"><h2>Xuất bản website</h2>${publishPanel}</section><section class="panel"><h2>Năm thay đổi gần nhất</h2><ul>${recent.docs.map((item) => `<li><a href="#/cards/${item.id}">${esc(item.data().nameFolk || item.data().nameVi || item.id)}</a></li>`).join("") || "<li>Chưa có dữ liệu thời gian cập nhật.</li>"}</ul></section>`;
}
