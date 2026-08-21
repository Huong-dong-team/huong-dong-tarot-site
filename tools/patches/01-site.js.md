# Patch · `assets/js/site.js`

Hai thay đổi. Không đụng `initHeroTilt`, `positionHeroSun`, `initReveal`, `initHeroCarousel`.

## 1 · Thêm import ở đầu file

File đang mở đầu bằng `const normalize = …`. Chèn dòng import lên trên cùng —
`site.js` đã nạp bằng `<script type="module">` nên import hoạt động không cần thêm gì.

```js
// TRƯỚC (dòng 1)
const normalize = (value) => String(value || "").normalize("NFD")…

// SAU
import { motionGate } from "./motion-gate.js";

const normalize = (value) => String(value || "").normalize("NFD")…
```

## 2 · `initHeroDust` — thay `tick()` bằng cổng dừng

Chỉ ba chỗ đổi trong hàm; toàn bộ logic vật lý, số hạt, màu `rgba(199,150,78,…)`
giữ nguyên từng chữ.

### 2a · Vòng lặp phải tự biết mình đã dừng

```js
// TRƯỚC
  const tick = () => {
    t += 0.016;
    ctx.clearRect(0, 0, width, height);
    …
    raf = requestAnimationFrame(tick);
  };
  tick();

// SAU
  const tick = () => {
    t += 0.016;
    ctx.clearRect(0, 0, width, height);
    …
    raf = requestAnimationFrame(tick);
  };

  // Không gọi tick() trực tiếp nữa. Vào/ra viewport do motionGate quyết định.
  // Quan trọng: không dựng lại `motes` khi quay lại — hạt phải tiếp tục từ đúng
  // vị trí cũ, nếu khởi tạo lại người dùng sẽ thấy cả đám nhảy chỗ.
  const stopGate = motionGate(canvas, {
    onEnter: () => { if (!raf) raf = requestAnimationFrame(tick); },
    onLeave: () => { cancelAnimationFrame(raf); raf = 0; },
  });
```

### 2b · Dọn dẹp: bỏ `beforeunload`

`beforeunload` làm trang không đủ điều kiện vào back/forward cache của trình duyệt —
người dùng bấm Back sẽ phải tải lại thay vì thấy trang hiện ra tức thì. Mà việc nó làm
cũng không cần: khi trang bị bỏ, listener và rAF tự biến mất cùng document.

```js
// TRƯỚC
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("resize", size);
    cancelAnimationFrame(raf);
  });

// SAU
  // pagehide thay cho beforeunload: beforeunload chặn back/forward cache, còn
  // pagehide vẫn chạy khi trang thật sự bị bỏ. Dừng cả cổng để không còn
  // listener nào treo lại.
  window.addEventListener("pagehide", () => {
    window.removeEventListener("resize", size);
    window.removeEventListener("load", size);
    cancelAnimationFrame(raf);
    stopGate();
  }, { once: true });
```

### 2c · Bỏ lần chặn reduced-motion sớm

Hàm đang `return` ngay nếu người dùng bật giảm chuyển động — nghĩa là nếu họ **tắt**
thiết lập đó giữa phiên thì hiệu ứng không bao giờ chạy lại. `motionGate` đã lo việc này,
nên bỏ dòng chặn để hành vi khớp với `light-journey.js` (file đó phản ứng cả hai chiều).

```js
// TRƯỚC
  const canvas = document.querySelector(".hero-dust");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");

// SAU
  const canvas = document.querySelector(".hero-dust");
  if (!canvas) return;
  // Không chặn ở đây nữa: motionGate không bao giờ gọi onEnter khi người dùng
  // đang bật giảm chuyển động, và biết phản ứng nếu họ tắt giữa phiên.

  const ctx = canvas.getContext("2d");
```

## 3 · Hàm mới: bật/tắt animation CSS của `.hero-sun`

Thêm vào cuối file, cạnh các lời gọi `init…()` khác. Cặp với patch CSS mục 2.3.

```js
// Hai animation trên .hero-sun (quầng sáng và tia) là CSS thuần nên không thể
// cancelAnimationFrame. Cách rẻ nhất để dừng chúng là đổi animation-play-state
// qua một lớp trên .hero — trình duyệt bỏ hẳn lớp composite khi paused.
function initHeroSunGate() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  motionGate(hero, {
    onEnter: () => hero.classList.add("is-visible"),
    onLeave: () => hero.classList.remove("is-visible"),
  });
}
initHeroSunGate();
```

**Lưu ý về progressive enhancement.** CSS ở mục 2.3 đặt `paused` làm mặc định, nên nếu
JS không chạy thì hai hiệu ứng này sẽ nằm im. Đó là đánh đổi có ý thức: hero vẫn hiện
đầy đủ ảnh, chữ và nút — chỉ thiếu chuyển động trang trí. Nếu bạn muốn ngược lại
(JS lỗi thì vẫn quay), xem ghi chú cuối patch CSS.
