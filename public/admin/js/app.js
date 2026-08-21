import { login, logout, observeAdmin } from "./auth.js";
import { register, renderRoute } from "./router.js";
import { dashboardView } from "./views/dashboard.js";
import { cardsView } from "./views/cards.js";
import { cardEditView } from "./views/card-edit.js";
import { postsView } from "./views/posts.js";
import { postEditView } from "./views/post-edit.js";
import { mediaView } from "./views/media.js";
import { subscribersView } from "./views/subscribers.js";
import { settingsView } from "./views/settings.js";
import { usersView } from "./views/users.js";

register("/", dashboardView); register("/cards", cardsView); register("/cards/:slug", cardEditView); register("/posts", postsView); register("/posts/:slug", postEditView); register("/media", mediaView); register("/subscribers", subscribersView); register("/settings", settingsView); register("/users", usersView);

function showLogin(error = "") {
  document.querySelector("#admin-shell").hidden = true;
  const root = document.querySelector("#login-root");
  root.innerHTML = `<section class="login-card"><h1>Quản trị Hường Đông</h1><p>Nội dung chỉ dành cho tài khoản đã được owner cấp quyền.</p>${error ? `<p class="error-message">${error}</p>` : ""}<form id="login-form"><label class="field"><span>Email</span><input name="email" type="email" autocomplete="username" required></label><label class="field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="current-password" required></label><button class="button" type="submit">Đăng nhập</button><p class="error-message" role="alert"></p></form></section>`;
  root.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault(); const message = event.currentTarget.querySelector("[role=alert]"); message.textContent = "Đang kiểm tra…";
    try { await login(event.currentTarget.email.value, event.currentTarget.password.value); }
    catch { message.textContent = "Không đăng nhập được. Kiểm tra email, mật khẩu và quyền quản trị."; }
  });
}

document.querySelector("#sign-out").addEventListener("click", logout);
let context = null;
observeAdmin(async (admin) => {
  if (!admin) { context = null; showLogin(); return; }
  context = admin; document.querySelector("#login-root").innerHTML = ""; document.querySelector("#admin-shell").hidden = false;
  document.querySelector("[data-owner-only]").hidden = admin.profile.role !== "owner";
  await renderRoute(context);
}, (error) => { context = null; showLogin(error.message); });
addEventListener("hashchange", () => context && renderRoute(context));
