# Design QA — Hero Fontasia nâu ấm

- Source visual truth: Hero Fontasia đã duyệt trong
  `qa/hero-after-1440x900.png`, với yêu cầu mới đổi headline/subheadline sang
  `#3D2B1A` và tăng thêm riêng subheadline 30% so với preview PR #58.
- Implementation evidence: local build captured at 1440×900 và 390×844 trong
  `qa/hero-warm-brown-*.png`.
- State: Home, top of page, entrance complete, no form submission.

## Comparison result

Ảnh Hero Fontasia trước thay đổi và bản local mới được mở để đối chiếu cùng
viewport desktop. Bản mới chỉ thay typography được yêu cầu: headline và
subheadline cùng nâu ấm, subheadline tăng thêm đúng 30%; bố cục, copy, ảnh, CTA và
stats không thay đổi.

No P0/P1/P2 visual defect remains:

- Headline dùng Fontasia `95.04px` ở 1440px, màu tính toán
  `rgb(61, 43, 26)`, không còn stroke champagne/coral; hai dòng không bị cắt.
- Subheadline dùng Fontasia, màu `rgb(61, 43, 26)`, tăng từ preview
  `20.8–23.4px` lên `27.04–30.42px` đúng 30%, không stroke hoặc bóng.
- Desktop Hero measures 824px below the 76px header and fits the 1440×900
  viewport. The computed 537.6/806.4px columns equal 40/60.
- Mobile 390×844 giữ copy trước ảnh; headline giữ nguyên, subheadline `27.04px`,
  CTA không tràn và overflow ngang bằng `0`.
- Primary coral CTA contrast is 4.84:1; secondary yellow CTA is 8.48:1; body
  copy on cream is 12.72:1. The requested caption brown remains visually clear.
- Browser console returned no errors or warnings during the desktop QA run.
- Hai CTA giữ đúng liên kết `#danh-sach-cho` và `/la-bai-hom-nay/`.

## Evidence

- `qa/hero-before-1440x900.png`
- `qa/hero-after-1440x900.png`
- `qa/hero-after-768x1024.png`
- `qa/hero-after-390x844.png`
- `qa/hero-warm-brown-1440x900.png`
- `qa/hero-warm-brown-390x844.png`

## Subpage Fontasia · 29/08/2026

- Shared selectors `.page-hero > h1` và `.page-hero > p:not(.eyebrow)` áp dụng
  cho mọi page hero route trong; không thay đổi copy, CTA hay Hero trang chủ.
- Headline và subheadline dùng `Fontasia VH` Regular 400, `font-style: normal`,
  giữ màu vàng hiện tại `#FEDB44` (`rgb(254, 219, 68)`), cỡ chữ và bóng nâu đã
  chốt trước đó.
- `/huyen-su/` tại 1440×900: headline `117px`, subheadline `18px`, ảnh route
  `huyen-su-1536.avif`, overflow ngang `0`.
- `/huyen-su/` tại 390×844: headline `63.7px`, subheadline `18px`, nội dung
  không bị cắt hoặc tràn; overflow ngang `0`.
- Console desktop/mobile không có error, warning hoặc lỗi tải font.

Evidence:

- `qa/subpage-fontasia-1440x900.png`
- `qa/subpage-fontasia-390x844.png`

## Subpage label và subheadline · 29/08/2026

- Label page hero dùng Inter/UI, màu nhãn riêng `#8B7355`, cỡ `15.6px` (tăng
  khoảng 30% từ `12px`); không còn trùng màu vàng với subheadline.
- Subheadline giữ Fontasia Regular 400 và vàng `#FEDB44`, cỡ `23.4px` (tăng
  khoảng 30% từ `18px`) trên cả desktop và mobile.
- `/huyen-su/` tại 1440×900: headline `117px`, label `15.6px`, subheadline
  `23.4px`, Hero cao `758.3px`, overflow ngang `0`.
- `/huyen-su/` tại 390×844: headline `63.7px`, label `15.6px`, subheadline
  `23.4px`, Hero cao `528.3px`, overflow ngang `0`; copy không bị cắt/tràn.
- `document.fonts.check()` xác nhận Fontasia đã tải; console không có lỗi hoặc
  cảnh báo ở cả hai viewport.

Evidence:

- `qa/subpage-label-subheadline-1440x900.png`
- `qa/subpage-label-subheadline-390x844.png`

## Automated checks

```text
npm run build:local   PASS — 78 trang lá, 2 bài tin, 95 URL
npm run check:types   PASS
npm test              PASS — 31/31 test files
```

## Design-tool handoff status

- Figma file created: `https://www.figma.com/design/UXMAyAaKaNaEo2fi174zcB`.
- Figma HTML-to-Design capture was blocked by the Starter-plan MCP call limit
  before completion.
- Canva fallback was attempted with the approved desktop capture and blocked by
  the account monthly AI limit. No Canva design was created.
- The temporary Figma capture script was removed from source before final build.

final result: passed
