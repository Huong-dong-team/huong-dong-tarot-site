export function toast(message) {
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  document.querySelector("#toast-root").append(item);
  window.setTimeout(() => item.remove(), 3600);
}
