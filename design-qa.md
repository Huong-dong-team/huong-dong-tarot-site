# Museum worlds — design and interaction QA

Date: 2026-09-05. Local implementation: http://localhost:8127/la-bai/.
Branch: feat/museum-worlds-3d-20260904. No production publication performed.

Earlier design history is preserved in [PR 86 QA](docs/design-qa-pr86.md).

## Source visual truth and scope

The user selected all three displayed concepts, each as an independent museum.
The agreed mapping is 01 light/timber → Ẩn Chính, 02 dark jade → Ẩn Phụ,
03 courtyard → Lĩnh Nam chích quái. Four houses are children of Ẩn Phụ.
The user subsequently requested 2D-only mobile with this exact note:
“hãy mở bản desktop để đạt chất lượng phòng 3d cao nhất”.

Source directory:
`C:/Users/admin'/.codex/generated_images/01a06bb8-596d-7a83-943d-90e3ea6a17a3/`

| Museum | Source visual truth | Final implementation screenshot |
|---|---|---|
| Ẩn Chính | `exec-e4630f54-e5dd-41d4-b3d6-4094bde044c8.png` | `output/museum-qa/major-final.jpg` |
| Ẩn Phụ | `exec-79f1ffd9-a0c7-4ba5-9a6d-060e78f7d92d.png` | `output/museum-qa/minor-final.jpg` |
| Lĩnh Nam | `exec-52b79e79-61df-48fa-b79e-1d7568897750.png` | `output/museum-qa/history-final.jpg` |

All final screenshots are browser-rendered at the top of the respective 2D
entrance route, menu closed, desktop theme, CSS viewport 1488 × 1058.
Source and final captures are both 1488 × 1058 pixels, effective 1 pixel per
CSS pixel. Explicit screenshot clipping gives equal dimensions; no density
resampling or surrounding browser chrome is included. Initial diagnostic
screenshots used a 1440 × 1024 viewport but the browser's default capture
returned 1425 × 995 images; those were used to identify wrapping and missing
navigation, not to make pixel-level claims.

The final comparison input contained each source image immediately followed
by its implementation image, all in one tool response. This is a paired
full-view comparison, not a claim of an overlaid pixel diff. Typography,
navigation labels and primary buttons were readable at this size, so no
additional focused crop was needed. Modal and mobile collection states were
also inspected directly in the browser.

## Comparison history and fixes

- [P1, resolved] The portrait Ẩn Chính image initially expanded the hero beyond
  the viewport. Give the desktop hero a definite height and remove the image's
  intrinsic grid contribution. Final evidence: `major-final.jpg`; hero and
  room navigation both fit in the first viewport.
- [P2, resolved] Long headings wrapped to five lines in Ẩn Chính and four lines
  in Lĩnh Nam, changing the selected compositions. Restore the selected major
  and courtyard headlines and tune the display scale. Final evidence: three
  lines in `major-final.jpg`, two in `history-final.jpg`.
- [P2, resolved] The dark museum heading dominated its artwork. Widen the
  title measure and reduce its desktop size; it now occupies two lines in the
  lower-left panel. Final evidence: `minor-final.jpg`.
- [P2, resolved] The selected designs offered direct onward room navigation,
  but the first implementation required returning to the hub. Add the shared
  four-link room rail, with current-page indication and a two-column mobile
  layout. Visible in all three final captures.
- [P2, resolved] A static body class could keep the ordinary site header hidden
  after Swup navigation out of a museum. Scope the header treatment to the
  actual museum main element with `:has`. Browser navigation from a museum to
  Mai An Tiêm now restores the ordinary header (`display: grid`).
- [P2, resolved] The old global article pseudo-label stamped every work as
  unfinished. Remove that blanket stamp only in the new museum, while keeping
  actual per-work editorial notes and the shared-house-art disclosure.
- [P2, resolved] Short landscape viewports inherited a 620px hero floor.
  Remove the floor and reduce typography/padding at the existing height
  breakpoint. At 932 × 430 the major hero is content-sized at 479px, with
  ordinary document scrolling rather than a forced full-screen interaction.
- [P2, resolved] Desktop movement help appeared on the mobile fallback. Show
  this help only during an active 3D session.

## Required fidelity surfaces

- Fonts/typography: locally served Source Serif 4 gives the selected editorial
  serif hierarchy, with Be Vietnam Pro for small UI and prose. Vietnamese
  glyphs, heading wraps, button labels and card plaques were visually checked.
- Spacing/layout: the 37/63 split, dark immersive entrance and courtyard's
  split introduction over a wide scene are preserved. The museum-specific
  breadcrumb and one consistent masthead are intentional functional additions.
- Colors/tokens: warm ivory, forest/jade ink, timber and restrained brass
  remain consistent across the three concepts. The dark room uses a solid
  translucent copy surface for reliable text contrast.
- Image quality: supplied logo and actual card/house artwork are retained.
  Three generated entrance images follow the selected architecture and are
  saved as local WebP assets. They are not CSS/SVG substitutes. Minor artwork
  deliberately shows house emblems because distinct illustrations are absent.
- Copy/content: museum names and counts match the data: 22 majors, 56 minor
  records across four houses, 34 source stories. The selected concept's generic
  labels are adapted to these actual collections. Existing artwork notes and
  original record/story URLs are retained. Mobile note matches the user's text.

Accepted adaptations: the supplied real logo and a labelled “Mục lục” control
replace concept-specific logo/menu sketches; breadcrumbs support the expanded
hierarchy; content and artwork are collection-specific. The real-time 3D rooms
use simplified modeled architecture and materials, while entrance images are
art-directed renders. They are not represented as screenshots of the WebGL
scene, and live 3D is not claimed to be photorealistic.

## Interaction and responsive verification

- Opened all three desktop 3D scenes successfully; actual artwork textures
  loaded upright and details dialogs showed their titles, sources and links.
- Ẩn Chính next/previous navigation crossed the six-item batch boundary to
  item 7/22, and leaving restored the start control.
- Ẩn Phụ displayed four house exhibits; “Mở bảo tàng con” opened Nhà Tre.
  Navigation disposed the old canvas (zero canvases on the 2D destination).
- Lĩnh Nam details opened successfully; resizing an active 3D scene to
  390 × 844 disposed its canvas, hid entry controls and showed the exact note.
- A fresh direct mobile `/3d/` route offered the 2D link with no canvas or
  start button. The executable mobile-gate test and import ordering verify
  that the engine cannot load through the mobile entry handler.
- Mobile 2D anchor navigation scrolled to the collection (`scrollY: 1060`),
  initially showing 12 records. “Au Co” found exactly Âu Cơ; close-up opened
  and closed. Catalogue “Xem thêm” showed 24/78; Nhà Sen filtered to 14; empty
  search results recovered when cleared; the final batch moved focus to its
  first newly exposed work.
- Mobile “Mục lục” opened and navigated to a museum. Existing detail links
  remained usable after internal page transitions.
- Major entrance: no horizontal overflow at 375×812, 430×932, 744×1133,
  768×1024, 900×900, 901×900, 932×430, 1024×768, 1100×900, 1101×900, 1440×900.
- Minor and courtyard entrances: no horizontal overflow at 375×812,
  744×1133, 932×430, 1100×900, 1440×900. Catalogue also checked at 390×844.
- Browser console error/warning inspection after the 3D flows returned no
  errors or warnings. Checks used Codex's in-app browser, not physical iOS
  Safari/Android devices; those remain useful release smoke-test coverage.

Additional evidence: `output/museum-qa/history-3d.jpg`,
`output/museum-qa/major-3d.png`, `output/museum-qa/mobile-3d-fallback.png`,
`output/museum-qa/mobile-collection.png`. Earlier `.png` filenames contain
the browser-returned JPEG bytes and open as images; final captures use `.jpg`.

## Build verification

- `npm run build:local`: passed; 176 URLs, including all existing card/story
  routes and new museum hierarchy.
- `npm test`: 175 passed, 0 failed.
- `npm run check:types`: passed.
- `git diff --check`: passed (Git line-ending notices only).
- The isolated checkout's unchanged page-transition stylesheet was normalized
  to LF to match its committed 7881-byte source and preserve the 8000-byte
  budget. No stylesheet semantics changed; the original checkout was untouched.

## Follow-up polish

P3: richer physically based textures and lighting can refine the real-time
3D rooms later. Distinct minor illustrations can replace shared emblems as
the artwork becomes available. Neither blocks the implemented navigation,
2D collection, mobile gate or functioning 3D tour.

No actionable P0/P1/P2 findings remain in the tested scope.

final result: passed
