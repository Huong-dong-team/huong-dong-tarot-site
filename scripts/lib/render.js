export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

export function renderString(template, data) {
  let result = template;
  const eachPattern = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  result = result.replace(eachPattern, (_, path, block) => {
    const list = getPath(data, path);
    if (!Array.isArray(list)) return "";
    return list.map((item, index) => renderString(block, { ...data, ...item, this: item, index })).join("");
  });
  const ifPattern = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifPattern, (_, path, block) => getPath(data, path) ? renderString(block, data) : "");
  result = result.replace(/{{{\s*([\w.]+)\s*}}}/g, (_, path) => String(getPath(data, path) ?? ""));
  return result.replace(/{{\s*([\w.]+)\s*}}/g, (_, path) => escapeHtml(getPath(data, path) ?? ""));
}
