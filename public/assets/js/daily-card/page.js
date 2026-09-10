import { createDailyReading } from "./reading-engine.js";
import { vietnamDateKey } from "./time.js";
import { motionGate } from "../motion-gate.js";
import { animate as animateMini } from "/assets/vendor/motion-mini.mjs";

/* Trang "Lá bài hôm nay".

   Xuất init() thay vì chạy ngay lúc import: Swup thay DOM chứ không tải lại
   trang, nên module phải dựng được nhiều lần trong cùng một phiên và phải trả
   lại mọi thứ nó mượn — cổng chuyển động, animation đang chạy, và script
   astronomy nạp trễ. */

/* astronomy.browser.min.js là script cổ điển gán window.Astronomy. Trước đây nó
   được nhúng cứng vào trang; giờ module tự nạp và nhớ Promise, nên quay lại
   trang này lần thứ hai không tải lại 250 KB thiên văn.

   URL lấy từ data-astronomy-src trên DOM chứ không viết cứng ở đây: build.js
   đóng vân tay nội dung vào thuộc tính đó, nên bản sửa lỗi của gói thiên văn
   tới được người dùng ngay thay vì đợi cache hết hạn. */
let astronomyPromise = null;
function loadAstronomy(src) {
  if (window.Astronomy) return Promise.resolve(window.Astronomy);
  if (!src) return Promise.reject(new Error("astronomy-src-missing"));
  if (astronomyPromise) return astronomyPromise;
  astronomyPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(window.Astronomy);
    script.onerror = () => { astronomyPromise = null; reject(new Error("astronomy-failed")); };
    document.head.append(script);
  });
  return astronomyPromise;
}

export function init() {
  const root = document.querySelector("[data-daily-card]");
  if (!root) return () => {};
  const drawButton = root.querySelector("[data-daily-draw]");
  const status = root.querySelector("[data-daily-status]");
  const result = root.querySelector("[data-daily-result]");
  const resultTitle = root.querySelector("[data-daily-name]");
  const art = root.querySelector(".daily-card-art");
  const flip = root.querySelector("[data-daily-flip]");
  const back = root.querySelector("[data-daily-back]");
  const image = root.querySelector("[data-daily-image]");
  const readingPanel = root.querySelector(".daily-card-reading");
  const dataElement = document.querySelector("#daily-card-data");
  let dateKey = vietnamDateKey(new Date());
  let resultKey = `huong-dong-daily-card-v2:${dateKey}`;
  const deviceKey = "huong-dong-device-id-v1";
  let memoryResult = null;
  let storageAvailable = true;
  let motionAllowed = false;
  let revealGeneration = 0;
  const activeAnimations = new Set();

  function resetRevealStyles() {
    for (const element of [art, flip, back, image, readingPanel]) {
      element?.style.removeProperty("transform");
      element?.style.removeProperty("opacity");
    }
    if (back) back.hidden = true;
  }

  function cancelReveal() {
    revealGeneration += 1;
    // complete() giải phóng Promise `finished`; stop() của Motion Mini có thể
    // để Promise chờ mãi và khiến nút vẫn bị khóa khi tab bị ẩn giữa cú lật.
    for (const animation of activeAnimations) animation.complete();
    activeAnimations.clear();
    resetRevealStyles();
  }

  const closeMotionGate = motionGate(root, {
    onEnter() {
      motionAllowed = true;
    },
    onLeave() {
      motionAllowed = false;
      // Tab ẩn hoặc thiết lập giảm chuyển động có thể đổi giữa một cú lật.
      // Kết thúc ngay giúp nội dung không mắc kẹt ở cạnh 90 độ khi người đọc quay lại.
      cancelReveal();
    },
  });

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

  /* Đường thoát bắt buộc cho mọi lần chờ animation.

     Trình duyệt KHÔNG khởi động animation trên phần tử đang nằm ngoài khung
     nhìn: nó đứng mãi ở playState "running" với currentTime 0, nên `finished`
     không bao giờ giải quyết. Chuyện này xảy ra thật khi người đọc bấm "Bốc lá"
     lúc khối kết quả còn nằm dưới màn hình — cổng chuyển động chỉ theo dõi cả
     section nên vẫn cho phép chạy, trong khi riêng khung lời đọc thì chưa hiện.

     Hệ quả trước bản sửa này: chuỗi lật treo giữa chừng, lời đọc ở lại
     opacity 0 và nút bốc kẹt disabled — kết quả có trong DOM nhưng người dùng
     không đọc được gì. complete(), cancel() và stop() của bản motion-mini đang
     vendor đều KHÔNG giải phóng `finished` (đã đo trong trình duyệt), nên cách
     duy nhất là ngừng chờ sau khi đã quá thời lượng của chính animation đó. */
  function revealDeadline(seconds) {
    let id = 0;
    return {
      promise: new Promise((resolve) => { id = setTimeout(resolve, seconds * 1000 + 250); }),
      clear: () => clearTimeout(id),
    };
  }

  async function playRevealStep(element, keyframes, options, generation) {
    if (!element || generation !== revealGeneration) return false;
    const animation = animateMini(element, keyframes, options);
    activeAnimations.add(animation);
    const deadline = revealDeadline(options.duration ?? 0.3);
    try {
      await Promise.race([animation.finished, deadline.promise]);
    } catch {
      // Lỗi animation không được phép chặn việc hiển thị kết quả tĩnh.
    } finally {
      deadline.clear();
      // Nếu thoát bằng hạn chót thì lá vẫn đang đứng ở khung hình đầu; kéo nó
      // về trạng thái cuối để không có gì mắc kẹt giữa hai tư thế.
      try { animation.complete(); } catch { /* animation chưa chạy thì không có gì để chốt */ }
      activeAnimations.delete(animation);
    }
    return generation === revealGeneration;
  }

  function prepareReveal() {
    back.hidden = false;
    back.style.opacity = "1";
    image.style.opacity = "0";
    art.style.transform = "translateY(0) scale(1)";
    flip.style.transform = "rotateY(0deg)";
    readingPanel.style.opacity = "0";
    readingPanel.style.transform = "translateY(14px)";
  }

  async function revealCard() {
    const generation = ++revealGeneration;

    // Nhấc lá trước khi lật để mắt kịp nhận ra một vật thể đang chuyển động,
    // thay vì đọc cú đổi mặt như một ảnh bị thay đột ngột.
    if (!await playRevealStep(art,
      { transform: ["translateY(0) scale(1)", "translateY(-14px) scale(1.02)"] },
      { duration: 0.22, ease: [0.22, 1, 0.36, 1] }, generation)) return;

    // Hai nửa gặp nhau đúng lúc lá chỉ còn một cạnh. Đổi mặt ở 90 độ tránh
    // để lộ mặt trước sớm, điều khiến chuyển động trông như hai ảnh chồng nhau.
    if (!await playRevealStep(flip,
      { transform: ["rotateY(0deg)", "rotateY(90deg)"] },
      { duration: 0.18, ease: "ease-in" }, generation)) return;
    back.style.opacity = "0";
    image.style.opacity = "1";
    flip.style.transform = "rotateY(-90deg)";
    if (!await playRevealStep(flip,
      { transform: ["rotateY(-90deg)", "rotateY(0deg)"] },
      { duration: 0.18, ease: "ease-out" }, generation)) return;

    await Promise.all([
      playRevealStep(art,
        { transform: ["translateY(-14px) scale(1.02)", "translateY(0) scale(1)"] },
        { duration: 0.24, ease: [0.22, 1, 0.36, 1] }, generation),
      playRevealStep(readingPanel,
        { opacity: [0, 1], transform: ["translateY(14px)", "translateY(0)"] },
        { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, generation),
    ]);
  }

  async function renderReading(reading, { animated = false } = {}) {
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
    const shouldAnimate = animated && motionAllowed;
    if (shouldAnimate) prepareReveal();
    else resetRevealStyles();
    result.hidden = false;
    drawButton.textContent = "Xem lại lá hôm nay";
    if (shouldAnimate) await revealCard();
    resetRevealStyles();
    status.textContent = storageAvailable
      ? "Kết quả này được giữ nguyên tới hết ngày theo giờ Việt Nam."
      : "Trình duyệt đang chặn lưu cục bộ; kết quả chỉ được giữ trong lần mở trang này.";
    // Tên lá chỉ được xướng sau khi mắt đã thấy trọn kết quả. Ở nhánh giảm
    // chuyển động và xem lại, đường await bị bỏ qua nên focus vẫn đến tức thì.
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

  drawButton?.addEventListener("click", async () => {
    drawButton.disabled = true;
    root.setAttribute("aria-busy", "true");
    status.textContent = memoryResult ? "Đang mở lại kết quả đã lưu…" : "Đang đặt thời điểm bốc bài…";
    try {
      const now = new Date();
      refreshDate(now, cards);
      let freshDraw = false;
      if (!memoryResult) {
        const astronomy = await loadAstronomy(root.dataset.astronomySrc);
        if (!astronomy) throw new Error("astronomy-unavailable");
        freshDraw = true;
        memoryResult = createDailyReading({
          cards,
          deviceId: anonymousDeviceId(),
          moment: now,
          astronomy,
        });
        writeJson(resultKey, memoryResult);
      }
      await renderReading(memoryResult, { animated: freshDraw });
    } catch {
      status.textContent = "Chưa bốc được lá. Vui lòng tải lại trang và thử lần nữa.";
    } finally {
      drawButton.disabled = false;
      root.removeAttribute("aria-busy");
    }
  });

  root.querySelector("[data-daily-share]")?.addEventListener("click", () => memoryResult && shareReading(memoryResult));
  root.querySelector("[data-daily-copy]")?.addEventListener("click", () => memoryResult && shareReading(memoryResult, true));

  return () => {
    // cancelReveal() gọi complete() trên mọi animation còn chạy, nếu không thì
    // Promise `finished` của Motion Mini treo mãi và giữ tham chiếu tới một
    // phần tử đã rời khỏi cây DOM.
    cancelReveal();
    closeMotionGate();
  };
}
