import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "../firebase.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export async function cardsView(root) {
  const snapshot = await getDocs(query(collection(db, "cards"), orderBy("order", "asc")));
  const cards = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const major = cards.filter((card) => card.arcana === "major").length, minor = cards.length - major;
  root.innerHTML = `<div class="toolbar"><div><h1>Lá bài</h1><p class="page-lead">Kiểm kê hiện tại: ${cards.length}/78 · ${major}/22 Ẩn Chính · ${minor}/56 Ẩn Phụ.</p></div><a class="button" href="#/cards/new">Thêm lá</a></div><section class="panel"><label class="field"><span>Tìm kiếm</span><input type="search" data-search placeholder="Tên Việt, tên RWS hoặc slug"></label></section><table class="data-table"><thead><tr><th>Thứ tự</th><th>Tên</th><th>Nhóm</th><th>Trạng thái</th><th></th></tr></thead><tbody>${cards.map((card) => `<tr data-row data-search="${esc(`${card.nameVi} ${card.nameEn} ${card.nameFolk} ${card.slug}`.toLowerCase())}"><td>${card.order}</td><td><strong>${esc(card.nameFolk || card.nameVi)}</strong><br><small>${esc(card.nameEn)}</small></td><td>${card.arcana === "major" ? "Ẩn Chính" : `Ẩn Phụ · ${esc(card.suit)}`}</td><td><span class="status ${card.status}">${card.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></td><td><a href="#/cards/${encodeURIComponent(card.id)}">Sửa</a></td></tr>`).join("")}</tbody></table>`;
  const search = root.querySelector("[data-search]"); search.addEventListener("input", () => root.querySelectorAll("[data-row]").forEach((row) => row.hidden = !row.dataset.search.includes(search.value.trim().toLowerCase())));
}
