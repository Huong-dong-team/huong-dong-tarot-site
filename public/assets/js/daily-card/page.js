import { createDailyReading } from "./reading-engine.js";
import { vietnamDateKey } from "./time.js";

const root = document.querySelector("[data-daily-card]");

if (root) {
  const drawButton = root.querySelector("[data-daily-draw]");
  const status = root.querySelector("[data-daily-status]");
  const result = root.querySelector("[data-daily-result]");
  const resultTitle = root.querySelector("[data-daily-name]");
  const dataElement = document.querySelector("#daily-card-data");
  let dateKey = vietnamDateKey(new Date());
  let resultKey = `huong-dong-daily-card-v2:${dateKey}`;
  const deviceKey = "huong-dong-device-id-v1";
  let memoryResult = null;
  let storageAvailable = true;

  function readJson(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      storageAvailable = false;
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      storageAvailable = false;
      return false;
    }
  }

  function anonymousDeviceId() {
    const saved = readJson(deviceKey);
    if (typeof saved === "string" && saved.length >= 16) return saved;
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : [...crypto.getRandomValues(new Uint8Array(16))].map((value) => value.toString(16).padStart(2, "0")).join("");
    writeJson(deviceKey, id);
    return id;
  }

  function validSavedReading(value, cards) {
    return value?.version === 2
      && value.dateKey === dateKey
      && typeof value.text === "string"
      && typeof value.traceId === "string"
      && typeof value.orientationLabel === "string"
      && typeof value.card?.image?.url === "string"
      && typeof value.card?.image?.alt === "string"
      && Number(value.card?.image?.width) > 0
      && Number(value.card?.image?.height) > 0
      && typeof value.context?.sunSign === "string"
      && typeof value.context?.moonSign === "string"
      && typeof value.context?.moonPhase === "string"
      && typeof value.context?.planetaryHour === "string"
      && cards.some((card) => card.slug === value.card?.slug);
  }

  function refreshDate(now, cards) {
    const currentDateKey = vietnamDateKey(now);
    if (currentDateKey === dateKey) return;
    dateKey = currentDateKey;
    resultKey = `huong-dong-daily-card-v2:${dateKey}`;
    const savedForCurrentDate = readJson(resultKey);
    memoryResult = validSavedReading(savedForCurrentDate, cards) ? savedForCurrentDate : null;
  }

  function setContext(reading) {
    const list = root.querySelector("[data-daily-context]");
    const rows = [
      ["Cung Mặt Trời", reading.context.sunSign],
      ["Cung Mặt Trăng", reading.context.moonSign],
      ["Pha Trăng", reading.context.moonPhase],
      ["Giờ hành tinh", reading.context.planetaryHour],
    ];
    list.replaceChildren(...rows.map(([label, value]) => {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      item.append(strong, document.createTextNode(value));
      return item;
    }));
  }

  function formatDrawnAt(reading) {
    const value = reading.drawnAt ? new Date(reading.drawnAt) : new Date();
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "long",
      timeStyle: "short",
    }).format(value);
  }

  function renderReading(reading) {
    const image = root.querySelector("[data-daily-image]");
    image.src = reading.card.image.url;
    image.alt = reading.reversed ? `${reading.card.image.alt}, xoay ngược` : reading.card.image.alt;
    image.width = reading.card.image.width;
    image.height = reading.card.image.height;
    image.classList.toggle("is-reversed", reading.reversed);
    root.querySelector("[data-daily-orientation]").textContent = reading.orientationLabel;
    root.querySelector("[data-daily-date]").textContent = formatDrawnAt(reading);
    resultTitle.textContent = reading.card.nameFolk;
    root.querySelector("[data-daily-original]").textContent = [reading.card.nameVi, reading.card.nameEn].filter(Boolean).join(" · ");
    root.querySelector("[data-daily-reading]").textContent = reading.text;
    root.querySelector("[data-daily-trace]").textContent = reading.traceId;
    root.querySelector("[data-daily-card-link]").href = `/la-bai/${encodeURIComponent(reading.card.slug)}/`;
    setContext(reading);
    result.hidden = false;
    drawButton.textContent = "Xem lại lá hôm nay";
    status.textContent = storageAvailable
      ? "Kết quả này được giữ nguyên tới hết ngày theo giờ Việt Nam."
      : "Trình duyệt đang chặn lưu cục bộ; kết quả chỉ được giữ trong lần mở trang này.";
    resultTitle.focus();
  }

  async function shareReading(reading, copyOnly = false) {
    const url = new URL("/la-bai-hom-nay/", location.origin).toString();
    const text = `${reading.card.nameFolk} · ${reading.orientationLabel}\n${reading.text}\n${url}`;
    try {
      if (!copyOnly && typeof navigator.share === "function") {
        await navigator.share({ title: `Lá hôm nay · ${reading.card.nameFolk}`, text: reading.text, url });
        status.textContent = "Đã mở bảng chia sẻ của thiết bị.";
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        status.textContent = "Đã sao chép lời đọc và liên kết.";
      } else {
        status.textContent = "Thiết bị này chưa hỗ trợ chia sẻ hoặc sao chép tự động.";
      }
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = "Chưa chia sẻ được. Bạn có thể thử lại.";
    }
  }

  let cards = [];
  try {
    cards = JSON.parse(dataElement?.textContent || "[]");
    if (cards.length !== 78) throw new Error("invalid-deck");
  } catch {
    status.textContent = "Bộ bài chưa tải đủ. Vui lòng tải lại trang.";
    drawButton.disabled = true;
  }

  const saved = readJson(resultKey);
  if (validSavedReading(saved, cards)) {
    memoryResult = saved;
    drawButton.textContent = "Xem lại lá hôm nay";
    status.textContent = "Thiết bị này đã có một lá cho hôm nay.";
  }

  drawButton?.addEventListener("click", () => {
    drawButton.disabled = true;
    root.setAttribute("aria-busy", "true");
    status.textContent = memoryResult ? "Đang mở lại kết quả đã lưu…" : "Đang đặt thời điểm bốc bài…";
    try {
      const now = new Date();
      refreshDate(now, cards);
      if (!memoryResult) {
        if (!window.Astronomy) throw new Error("astronomy-unavailable");
        memoryResult = createDailyReading({
          cards,
          deviceId: anonymousDeviceId(),
          moment: now,
          astronomy: window.Astronomy,
        });
        writeJson(resultKey, memoryResult);
      }
      renderReading(memoryResult);
    } catch {
      status.textContent = "Chưa bốc được lá. Vui lòng tải lại trang và thử lần nữa.";
    } finally {
      drawButton.disabled = false;
      root.removeAttribute("aria-busy");
    }
  });

  root.querySelector("[data-daily-share]")?.addEventListener("click", () => memoryResult && shareReading(memoryResult));
  root.querySelector("[data-daily-copy]")?.addEventListener("click", () => memoryResult && shareReading(memoryResult, true));
}
