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

## Automated checks

```text
npm run build:local   PASS — 86 URL
npm run check:types   PASS
npm test              PASS — 29/29 test files
```

## Design-tool handoff status

- Figma file created: `https://www.figma.com/design/UXMAyAaKaNaEo2fi174zcB`.
- Figma HTML-to-Design capture was blocked by the Starter-plan MCP call limit
  before completion.
- Canva fallback was attempted with the approved desktop capture and blocked by
  the account monthly AI limit. No Canva design was created.
- The temporary Figma capture script was removed from source before final build.

final result: passed
