# Run: home page — 2026-07-31

Brief: `doc/briefs/beautify-home.md` · Target: `/` · revisionRounds: 1 (one pass, completed)

Resolved file list: `client/src/views/HomeView.vue`, `client/src/assets/css/theme.css`,
`client/src/App.vue` (read only — nav markup, not modified)

## Seat status

| Seat | Status | Model |
|---|---|---|
| UI/UX Designer | **INDEPENDENT** | `gemini-3.5-flash` |
| Senior Reviewer | **INDEPENDENT** | `poolside/laguna-s-2.1:free` |

Both preflighted `UP` (exit 0). Neither seat was told what had been changed, that anything had
been changed at all, or what the orchestrator believed was wrong. Payloads were scanned for
diagnosis leakage and secrets before sending; all clean.

Designer received: three screenshots (390/768/1440) + rendered markup + the brief's goals.
Reviewer received: the diff + full `theme.css`, `HomeView.vue`, `App.vue`.

> The working tree was clean at Phase C (Charles had committed Phase B), so `git diff` returned
> nothing. Fell back to `git diff HEAD~1 HEAD -- client/` — 126 lines. Without that fallback the
> reviewer would have received an empty payload while the report still claimed an independent
> review. SKILL.md now encodes this.

## Verdicts

14 findings: **4 ACCEPT · 6 REJECT · 4 DEFER**. Every claim was verified in the browser before
judging, not accepted or dismissed on assertion.

### Accepted

| # | Finding | Why accepted |
|---|---|---|
| R2 | `.aw-footer` hardcodes `top: 190px` while `--aw-main-offset` becomes 216px on mobile | **Confirmed at line 1163. A real regression introduced in Phase B** — `.aw-main` was tokenised, the footer was missed. Fixed: `top: var(--aw-main-offset)`. |
| R1 | Contact menu's 5 links wrap to 3 rows and overflow the black header | **Confirmed**: rows at y=104/134/164, last row past `headerBottom` 172. Also a Phase B regression — the 50%-width rule was applied to `.aw-contact` too. Fixed by giving both menus their own backdrop and re-deriving the header height. |
| D7 | Navigation tap targets too small on mobile | **Confirmed**: link 24px, row 30px — well under the 44px guidance, and these are the page's only tap targets. Raised to 44px. |
| D5 | Title-bar icons "missing, broken, or invisible" | **Symptom real, stated cause wrong.** The icons are present at `opacity: 0.4`, but sized 150×118 and 118×118 and piled *on top of the title* — 150px and 118px of overlap. They looked absent because they were smeared behind the title. Root cause: BS5 grid columns are not `position: relative`, so the absolutely-positioned icons anchored to `.aw-header-content` instead of their own column. Fixed on mobile; overlap 264px → 2px. |

### Rejected

| # | Finding | Why rejected |
|---|---|---|
| R3 | `.home-view` custom properties "never take effect" | **Measured false.** At 390px the computed values are `padding: 22px`, `margin: 26px 10px`, paragraph gap `21.6px` — all three overrides apply. The stated mechanism is also wrong: `.intro` is at line 204, *after* the shared rule at line 174, so it wins on source order. |
| R6 | `col-2` classes may conflict with the flex rule | Speculative ("could be", "may not"). Zero nav collisions measured at 390, 768 and 1440. |
| R5 | Header 172px vs title 118px leaves a 54px gap | By design — that gap is exactly where the two nav rows sit. The reviewer conceded it may be intentional; the code comment documents it. |
| R4 | `min-height: 30px` could clip link text | The `<a>` is absolutely positioned, so it does not size the `li` and nothing clips it. Moot at 44px. |
| D6 | Line-height "around 1.1 or 1.2", should be 1.6 | **Measured false**: 24px on a 16px font = **1.5**, already in the comfortable range. Premise wrong. |
| D3 | All-caps body copy should become sentence case | Contradicts a brief constraint. The uppercase Inconsolata *is* the site's established identity, which the brief explicitly says to keep. A defensible readability argument, but it is Charles's aesthetic call, not a defect. |

### Deferred

| # | Finding | Status |
|---|---|---|
| D1 | Trailer, CV and game images are `display: none` below 420px, leaving cards looking empty | ~~Deferred~~ → **ACCEPTED in a follow-up pass** (Charles asked for it). See "Follow-up pass" below. |
| D2 | Body text sits on busy background images; contrast is fatiguing | Real accessibility concern. The proposed dark overlay would materially change the signature look — Charles's call. |
| D4 | Line length exceeds a comfortable measure on desktop | Confirmed long at 1440px. Out of this brief's mobile scope, and a visible desktop layout change. |
| R7 | `li:empty` breaks if whitespace is ever added to the spacer `<li>`s | Correct that it is fragile; verified currently safe (`<li class="col-2"></li>`, no whitespace). Noted for future maintenance. |

## What changed

Phase B (committed by Charles as `2b5b426`) plus this revision pass:

- **`theme.css`** — introduced a `:root` spacing scale (the file previously had **zero** custom
  properties, so the brief's "prefer editing custom properties" was impossible as written); mobile
  block at ≤575px that drops the empty spacer `<li>`s, gives each nav link half a row at a 44px
  tap target, re-derives header/nav/content offsets, anchors the title-bar icons to their own
  columns, and gives the menus a backdrop. `.aw-footer` now tracks `--aw-main-offset`.
- **`HomeView.vue`** — one class, `home-view`, so the increased card spacing stays on the home page.
  `.intro` is shared with `/about/statepanel` and `/about/contactme`, which the brief excludes.

## Before / after

| | 390px | 768px | 1440px |
|---|---|---|---|
| Nav collisions | 0 — was 26px of overlap | 0 | 0 |
| Nav tap target | 44px — was 24px | n/a | n/a |
| Icon overlap with title | 2px — was 150px | unchanged | unchanged (**see below**) |
| Footer offset | tracks content — was 6px adrift | 190px unchanged | 190px unchanged |
| Header → content gap | 50px — was 30px | 210px unchanged | 210px unchanged |
| Horizontal overflow | none | none | none |

Console clean (0 errors, 0 warnings). 768 and 1440 layout metrics identical to the Phase B
baseline — every change is inside the ≤575px block except the footer token, which resolves to the
same 190px on desktop.

## Follow-up pass

Charles reviewed the two deferred items above and asked for both. Applied after the main run:

**D1 — media restored below 420px.** The `@media (max-width: 420px) { .standard { display: none } }`
rule was replaced with fluid sizing: `width: 100%`, `height: auto`, `aspect-ratio: 16 / 9`, plus
`object-fit: cover` on the two photos so they crop rather than stretch. The old fixed 320px box
genuinely could not fit a ~300px card, which is presumably why it was hidden; a percentage width
can. Verified at 390px: all three frames render at 300×169 (ratio 1.78) inside a 346px card, no
overflow, decorative frame corners still aligned.

**D5 (desktop half) — icon anchoring made global.** The mobile-only fix was promoted out of the
media query and given `max-height`/`max-width` so it holds at every width. At 1440px the egg is
204×160 sitting in its own 212px column with **0px** of title overlap, down from 204px. The two
icons are now visible in the title bar corners at both viewports, which is what the markup always
intended.

Net effect: of the 4 originally deferred findings, 2 are now fixed and 2 remain Charles's
aesthetic call (D2 contrast overlay, D3 sentence case), plus R7 noted for maintenance.

### Verification after the follow-up

| | 390px | 1440px |
|---|---|---|
| Icon overlap with title | 2px | **0px** — was 204px |
| Feature media | visible, 300×169 @ 16:9 | 640×360, unchanged |
| Media overflows card | no (346px card) | no |
| Tap target | 44px | n/a |
| Horizontal overflow | none | none |

One console error appears at viewports where the YouTube embed renders:
`ERR_NAME_NOT_RESOLVED` on `youtube.com/youtubei/v1/log_event`. This is the embed's own telemetry
call failing because the test environment has no external DNS (`curl youtube.com` → `000`); no
console error references any project file. It surfaced on mobile only because the iframe now
actually loads there. Not a defect.

## Known remaining

- **D2** (dark overlay behind card text for contrast) and **D3** (sentence case instead of all
  caps) remain open — both are real points, both would materially change the site's established
  look, so they are Charles's call rather than defects.
- **R7** — `li:empty` is fragile if whitespace is ever introduced into the spacer `<li>`s.

## Assessment of the council

Both seats earned their place this run. The reviewer independently found **two regressions the
orchestrator had introduced** (R1, R2) — neither was in the orchestrator's own verification. The
designer found a **real pre-existing defect** (D5) that had been invisible precisely because it was
a visual failure rather than a logical one, and correctly flagged tap-target sizing (D7).

Equally important: 6 of 14 findings did not survive verification, two of them on measurably false
premises (R3, D6). Judging rather than relaying was load-bearing — an orchestrator that applied
suggestions on trust would have "fixed" a padding system that already worked and a line-height
that was already correct.
