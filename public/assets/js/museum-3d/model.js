/* Pure room navigation rules, shared by the lazy WebGL runtime and tests. */
export const BATCH_SIZE = 6;
export const DESKTOP_ONLY_QUERY = "(max-width: 900px), (pointer: coarse)";
export const MOBILE_NOTE = "hãy mở bản desktop để đạt chất lượng phòng 3d cao nhất";

export function wrapIndex(index, length) {
  return length > 0 ? ((Math.trunc(index) % length) + length) % length : 0;
}

export function batchFor(index, length) {
  const current = wrapIndex(index, length);
  const start = Math.floor(current / BATCH_SIZE) * BATCH_SIZE;
  return { current, start, end: Math.min(start + BATCH_SIZE, length), slot: current - start };
}

/* Keep a visitor inside the outer walls and away from the colonnade pillars.
   The courtyard's sunken central bed is deliberately not a walking surface. */
export function clampPosition(x, z, theme = "light") {
  x = Math.min(3.9, Math.max(-3.9, x));
  z = Math.min(7.5, Math.max(-7.5, z));
  if (theme === "courtyard" && Math.abs(x) < 1.7 && Math.abs(z) < 3.9) {
    if (1.7 - Math.abs(x) < 3.9 - Math.abs(z)) x = x < 0 ? -1.7 : 1.7;
    else z = z < 0 ? -3.9 : 3.9;
  }
  for (const px of [-2.5, 2.5]) {
    for (const pz of [-6, -2, 2, 6]) {
      const dx = x - px;
      const dz = z - pz;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.48) {
        x = px + (distance ? dx / distance : 1) * 0.48;
        z = pz + (distance ? dz / distance : 0) * 0.48;
      }
    }
  }
  return { x, z };
}

export function exhibitPlacement(slot) {
  const side = slot < 3 ? -1 : 1;
  return { x: side * 4.34, y: 2.15, z: [4.2, 0, -4.2][slot % 3], yaw: -side * Math.PI / 2 };
}

export function safeURL(value, base, fallback = "") {
  try {
    const url = new URL(String(value || ""), base);
    return ["http:", "https:"].includes(url.protocol) && value ? url.href : fallback;
  } catch {
    return fallback;
  }
}

export function exhibitLinkLabel(href, base) {
  const url = safeURL(href, base);
  if (url && /^\/la-bai\/an-phu\/(?:tre|dau-tam|sen|lua)\/$/.test(new URL(url).pathname)) {
    return "Mở bảo tàng con";
  }
  return "Mở hồ sơ tác phẩm";
}

export function normalizeData(raw, base) {
  if (!raw || typeof raw !== "object") throw new Error("Thiếu dữ liệu phòng trưng bày.");
  const exhibits = (Array.isArray(raw.exhibits) ? raw.exhibits : []).map((item) => ({
    id: String(item?.id || ""),
    title: String(item?.title || "Hiện vật Hường Đông"),
    subtitle: String(item?.subtitle || ""),
    image: safeURL(item?.image, base),
    href: safeURL(item?.href, base, new URL("/la-bai/", base).href),
    linkLabel: exhibitLinkLabel(item?.href, base),
    source: String(item?.source || "Hồ sơ Hường Đông"),
    note: String(item?.note || ""),
  })).filter((item) => item.image);
  if (!exhibits.length) throw new Error("Phòng này chưa có ảnh hiện vật để mở 3D.");
  return {
    room: String(raw.room || ""),
    title: String(raw.title || "Bảo tàng Hường Đông"),
    theme: ["light", "dark", "courtyard"].includes(raw.theme) ? raw.theme : "light",
    exhibits,
  };
}
