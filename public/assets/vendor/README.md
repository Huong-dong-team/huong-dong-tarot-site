# Thư viện bên thứ ba (vendored)

Repo này không dùng bundler — front-end nạp ES module trực tiếp từ `public/`.
Vì vậy 5 thư viện dưới đây được build sẵn thành bundle ESM **tự chứa** (không còn
import bare specifier nào) và commit thẳng vào đây, thay vì khai trong
`package.json` (`dependencies` của repo chỉ dành cho script build chạy bằng Node).

Thư mục này dùng chung đường dẫn `/assets/vendor/` với `astronomy.browser.min.js`
(file đó được `scripts/build.js` copy từ `node_modules` lúc build, còn các bundle
dưới đây nằm sẵn trong `public/` nên được copy sang `dist/` cùng phần còn lại).

Giấy phép: xem [`THIRD-PARTY-NOTICES.md`](../../../THIRD-PARTY-NOTICES.md) ở gốc repo.

| File | Gói npm | Phiên bản | Kích thước |
|---|---|---|---|
| `floating-ui.mjs` | `@floating-ui/dom` | 1.8.0 | ~21 KB |
| `auto-animate.mjs` | `@formkit/auto-animate` | 0.10.0 | ~8 KB |
| `embla-carousel.mjs` | `embla-carousel` | 8.6.0 | ~18 KB |
| `focus-trap.mjs` | `focus-trap` | 8.2.2 | ~20 KB |
| `motion.mjs` | `motion` | 13.1.1 | ~135 KB |
| `motion-mini.mjs` | `motion/mini` | 13.1.1 | ~12 KB |
| `swup.mjs` | `swup` | 4.9.2 | ~27 KB |

Tất cả đã minify. Kích thước là bản chưa nén; qua gzip/brotli của Firebase Hosting
sẽ nhỏ hơn nhiều.

## Cách dùng

```js
import { computePosition, offset, flip, shift } from "/assets/vendor/floating-ui.mjs";
import autoAnimate from "/assets/vendor/auto-animate.mjs";
import EmblaCarousel from "/assets/vendor/embla-carousel.mjs";
import { createFocusTrap } from "/assets/vendor/focus-trap.mjs";
import { animate, scroll, inView, stagger } from "/assets/vendor/motion.mjs";
import Swup from "/assets/vendor/swup.mjs";
```

`swup.mjs` là engine chuyển cảnh giữa các trang. Nó được nạp trễ trong
`assets/js/page-transition/bootstrap.js` và không bao giờ được import tĩnh: nếu
bundle hỏng thì website phải quay về điều hướng trình duyệt bình thường, chứ
không kéo theo phần còn lại của front-end. Không thêm Barba hay bất kỳ engine
chuyển cảnh thứ hai nào — `tests/page-transition.test.mjs` canh điều đó.

**Ưu tiên `motion-mini.mjs`** (`animate`, `animateSequence`) cho hiệu ứng đơn giản:
nó chạy trên Web Animations API của trình duyệt, nhẹ hơn `motion.mjs` hơn 10 lần.
Chỉ dùng `motion.mjs` khi cần `scroll()`, `inView()`, spring, hoặc `motionValue()`.

Nhớ tôn trọng `prefers-reduced-motion` — xem `assets/js/motion-gate.js` đã có sẵn
trong repo.

## Build lại

```bash
mkdir vendor-build && cd vendor-build && npm init -y
npm i @floating-ui/dom@1.8.0 @formkit/auto-animate@0.10.0 embla-carousel@8.6.0 \
      focus-trap@8.2.2 motion@13.1.1 swup@4.9.2
```

Tạo file entry cho từng gói rồi bundle (auto-animate và embla cần re-export cả
`default`, nếu chỉ `export *` sẽ mất default export):

```js
// entries/auto-animate.mjs
export { default } from "@formkit/auto-animate";
export * from "@formkit/auto-animate";
```

```bash
npx esbuild entries/<ten>.mjs --bundle --format=esm --platform=browser \
  --target=es2020 --minify --legal-comments=inline \
  --outfile=public/assets/vendor/<ten>.mjs
```

Cờ `--legal-comments=inline` là bắt buộc: nó giữ banner bản quyền trong file build.
