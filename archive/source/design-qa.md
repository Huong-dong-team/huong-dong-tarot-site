# Design QA — Trống đồng xuyên suốt landing page

## Evidence

- Source visual truth: `/workspace/scratch/58587ba65ca5/upload/huong_dong_trong_dong.png`
- Source pixels: 1536 × 1536, density 1×.
- Implementation: cloud-browser tab `hdTab`, route `/`, top-viewport and full-page captures inspected inline.
- Implementation screenshot path: `cloud-browser/hdTab/landing-top-viewport` (inline browser capture; not persisted to the checkout).
- Viewport: 1363 × 936 CSS px, device pixel ratio 1; rendered page 1363 × 7925 px.
- State: landing page initial state; library search and card-detail modal also tested.
- Hero measurements: Mẫu Liễu Hạnh artwork 358.39 × 537.58 px; trống đồng display layer 640 × 640 CSS px before rotation. The artwork is 30% smaller than its prior 512 px desktop width.

## Full-view comparison evidence

The source asset and the rendered hero were opened in the same comparison input. The implementation preserves the supplied image, jade–bronze–ivory palette, circular structure, metallic line detail, and central solar focus. The hero uses the drum as a screen-blended ceremonial halo without cropping or redrawing it. The Mẫu Liễu Hạnh card remains legible and subordinate to the larger symbol.

The full-page capture confirms the same asset reappears quietly in the Story, Tứ Bất Tử, Library, Four Houses, Join, header, and footer regions. Light sections use 3.5% multiply opacity; dark sections use 7.5–10% screen opacity. No horizontal overflow was present at the 1363 px viewport.

## Focused-region comparison evidence

Focused hero comparison was required because the drum’s fine concentric detail and the requested 30% artwork reduction were not judgeable from the full-page capture alone. The focused capture confirms the drum remains recognizably identical to the supplied asset, while its black field blends into the jade hero instead of creating a visible square.

## Required fidelity surfaces

- Fonts and typography: existing display/body hierarchy, weights, wrapping, and letter spacing remain unchanged; no text collision with the new hero layers.
- Spacing and layout rhythm: hero card width reduced from 32 rem to 22.4 rem (30%); text/form proportions and proof strip remain stable.
- Colors and visual tokens: the source’s emerald, bronze, and ivory align with the existing Hường Đông tokens; blend modes preserve contrast.
- Image quality and asset fidelity: exact supplied 1536 px PNG is used; no SVG/CSS approximation, stretching, or destructive crop.
- Copy and content: no copy, card data, navigation label, or backend contract changed.

## Primary interactions and console

- Header navigation to Bộ bài: passed.
- Search `mau lieu hanh`: returned 1/1 matching card.
- Open and close Mẫu Liễu Hạnh detail modal: passed.
- All five section watermark layers resolve to the supplied image asset.
- Application console errors: none. Observed messages came only from the cloud-browser extension, not the website.

## Findings

- No actionable P0, P1, or P2 findings.

## Comparison history

- Pass 1: no P0/P1/P2 differences found; no corrective visual iteration required.

## Follow-up polish

- P3: the 90-second hero-drum rotation is intentionally very slow; it can be frozen later if a completely static ceremonial seal is preferred.

final result: passed
