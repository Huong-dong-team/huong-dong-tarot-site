const routes = [];
export function register(pattern, view) { routes.push({ pattern, view }); }
export function parseRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  for (const route of routes) {
    const keys = [];
    const regex = new RegExp(`^${route.pattern.replace(/:[^/]+/g, (part) => { keys.push(part.slice(1)); return "([^/]+)"; })}$`);
    const match = hash.match(regex);
    if (match) return { view: route.view, params: Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(match[index + 1])])) };
  }
  return null;
}
export async function renderRoute(context) {
  const target = document.querySelector("#admin-main");
  const route = parseRoute();
  if (!route) { target.innerHTML = "<h1>Không tìm thấy màn hình</h1>"; return; }
  target.innerHTML = "<p>Đang tải…</p>";
  await route.view(target, route.params, context);
  document.querySelectorAll("#admin-nav a").forEach((link) => link.toggleAttribute("aria-current", link.hash === location.hash));
  target.focus();
}
