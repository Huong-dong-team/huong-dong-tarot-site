import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "../firebase.js";
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export async function postsView(root) {
  const snapshot = await getDocs(query(collection(db, "posts"), orderBy("updatedAt", "desc")));
  const posts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  root.innerHTML = `<div class="toolbar"><div><h1>Tin tức</h1><p class="page-lead">${posts.length} bài trong hệ thống.</p></div><a class="button" href="#/posts/new">Thêm bài</a></div><table class="data-table"><thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Tác giả</th><th></th></tr></thead><tbody>${posts.map((post) => `<tr><td><strong>${esc(post.title)}</strong><br><small>${esc(post.slug)}</small></td><td><span class="status ${post.status}">${post.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></td><td>${esc(post.author)}</td><td><a href="#/posts/${encodeURIComponent(post.id)}">Sửa</a></td></tr>`).join("")}</tbody></table>`;
}
