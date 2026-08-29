# Design QA — Hero Watercolor Fontasia

- Source visual truth: production `https://huongdong.id.vn/`, captured at
  1440×900 in `qa/hero-before-1440x900.png`.
- Implementation evidence: local build captured at matching 1440×900 plus
  responsive captures 768×1024 and 390×844 in `qa/`.
- State: Home, top of page, entrance complete, no form submission.

## Comparison result

Production and local captures were opened together at the same desktop viewport.
The redesign intentionally replaces the oversized Ganh block with the approved
Fontasia treatment while preserving every word. The product image remains the
left visual anchor; headline, description, CTAs and stats occupy the right 60%.
The three overlay layers retain visible watercolor scenery at left and protect
text contrast toward the right and lower edge.

No P0/P1/P2 visual defect remains:

- Headline fits two logical lines at desktop, uses pearl fill and champagne
  stroke; only “câu chuyện Việt” receives coral stroke.
- Subheadline is one solid warm-brown color without metallic gradient, stroke or
  shadow. Fontasia and Inter both resolve from self-hosted files.
- Desktop Hero measures 824px below the 76px header and fits the 1440×900
  viewport. The computed 537.6/806.4px columns equal 40/60.
- Tablet and mobile stack copy before the product. No horizontal overflow or
  cropped product imagery is visible at 768×1024 or 390×844.
- Primary coral CTA contrast is 4.84:1; secondary yellow CTA is 8.48:1; body
  copy on cream is 12.72:1. The requested caption brown remains visually clear.
- Browser console returned no errors or warnings during the desktop QA run.

## Evidence

- `qa/hero-before-1440x900.png`
- `qa/hero-after-1440x900.png`
- `qa/hero-after-768x1024.png`
- `qa/hero-after-390x844.png`

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
