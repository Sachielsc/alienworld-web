# Run: site-wide header — 2026-08-03

Brief: `doc/briefs/fix-header.md` · Target: the global header (verified on `/`)
Mode: **`--human-decision`** — Charles decided what was applied. `revisionRounds` ignored.

Resolved file list: `client/src/assets/css/theme.css` (changed),
`client/src/App.vue` (header markup — read only, not modified)

The target is not a page. `.aw-header-content` lives in `App.vue` and renders on every route, so
this change is site-wide.

## Seat status

| Seat | Status | Model |
|---|---|---|
| UI/UX Designer | **INDEPENDENT** | `gemini-3.5-flash` |
| Senior Reviewer | **INDEPENDENT** | `poolside/laguna-s-2.1:free` |

Both preflighted `UP` (exit 0). Neither was told what changed, that anything had changed, or what
the orchestrator believed was wrong. Payloads leak-checked before sending: no diagnosis terms
(`container`, `max-width`, `position:fixed`, `root cause`…) and no secrets reached either seat.

Designer received four screenshots — 390/768/1440/**1920** — the fourth added because the brief is
specifically about widening the window. Reviewer received the 64-line diff plus full `theme.css`
and `App.vue`.

## The defect

At 1920px the head icon rendered at **x=1612–1932** while the black bar ended at **1320** — the
icon sat entirely outside the header, which is what "div2 and div3 are not close to each other
anymore" looked like in the DOM.

Cause: `.aw-header` carries Bootstrap's `.container` (`max-width: 1320px`) while
`.aw-header-content` was `position: fixed; width: 100%` — 100% of the *viewport*, not the header.
Below 1320px they agree; above it they diverge, and the right-hand column walks off the bar.

## Verdicts

13 items from the seats (4 of the reviewer's were explicit non-findings), plus one the
orchestrator raised itself. Every claim was measured in the browser before being shown to Charles.

| # | Seat | Finding | Recommended | Charles' decision |
|---|---|---|---|---|
| M1 | *orchestrator* | Mobile icon/title overlap regressed 2px → 10px per side (caused by this run's `fixed`→`relative` change) | **Fix** | **Applied** |
| D1 | Designer | Header items drift apart on wide screens; wants a centred `max-width: 1000px` group | Reject — contradicts the brief | **Rejected — keep full width** |
| D2 | Designer | Icons near-invisible at `opacity: 0.4` though the page copy tells users to click them | Charles' call — real usability point | Declined |
| D3 | Designer | Mobile nav tap targets cramped | Reject — measured 44px, at guideline | Declined |
| D4 | Designer | Nav font too small at ≥768px | Reject — measured 16px, standard body size | Declined |
| D5 | Designer | No visual separation between header and content | Charles' call — fair, aesthetic | Declined |
| R1 | Reviewer | Icons' `height: 100%` not overridden in the ≥576 block → could collapse | Reject — a global rule already sets `height: auto`; measured 159.98px | Declined |
| R2 | Reviewer | Title may overlap icons on wide screens; add `min-width: 0` | Reject — measured 0px overlap at 1440 and 1920 | Declined |
| R3 | Reviewer | Icons may paint behind the title (z-index) | Reject — no overlap at ≥576, so no stacking contest | Declined |
| R4 | Reviewer | Mobile `height: 100%` may collapse | Reject — icons render 61×48 / 61×61; reviewer itself said no change needed | Declined |
| R5–R8 | Reviewer | "No fix needed" ×4 | Not findings | — |

Orchestrator and human **agreed on every item**. No divergence this run.

### D1 deserves recording

Gemini independently observed the same symptom Charles reported — the header items not looking
close together — but prescribed the **opposite remedy**: constrain the three to a centred 1000px
group rather than pin them to the viewport edges. Its measurement was correct (242/243px of empty
black at 1440, 482/483px at 1920); it simply disagrees with the brief's chosen solution.

Charles reviewed the trade-off explicitly and kept the full-width spec. Worth remembering if the
empty space ever starts to grate: the alternative was named, measured, and consciously declined.

## What changed

`client/src/assets/css/theme.css` only:

- `.aw-header` — `max-width: none` so the black bar spans the viewport instead of stopping at the
  container's 1320px cap; horizontal padding zeroed, since a full-bleed bar has no use for the
  container gutter (and that gutter was costing the row 24px).
- `.aw-header-content` — `position: fixed` → `relative`, so `width: 100%` measures against the
  header rather than the viewport.
- New `@media (min-width: 576px)` block — icon columns get `flex: 0 0 auto; width: auto` to hug
  their icon, the title column gets `flex: 1 1 auto; max-width: none` to absorb the slack, and the
  icons become `position: static` so their column can size to them. Left untouched below 576px,
  where the fixed 2/8/2 fractions are what keeps the icons small enough to clear the title.

**A bug hit and fixed mid-build:** setting the icons `position: static` made `max-height: 100%`
resolve against a flex parent with no definite height, so it silently became `none` and the egg
rendered at **1000×785**. Capped against `var(--aw-title-height)` instead. The reviewer's R1
described this exact failure mode from first principles — right physics, wrong conclusion about
the current state, because it missed the global `height: auto` rule.

## Before / after

| | 390px | 1440px | 1920px |
|---|---|---|---|
| Head icon inside the bar | — | yes | **yes** — was outside by 588px |
| Header spans viewport | — | yes | **yes** — was 1320 of 1920 |
| Column gaps | — | 0 / 0 | 0 / 0 |
| Title column width | — | 1012px | 1508px (flexes) |
| Icon/title overlap | 2px (unchanged from pre-run) | 0 | 0 |
| Nav | 2 rows, 0 collisions, 44px targets | 1 row, 0 collisions | — |
| Horizontal overflow | none | none | none |

Console clean — 0 errors, 0 warnings.

## Notes for next time

- **Artifact collision is now real.** This run used a `-hdr-` infix to avoid overwriting the
  previous run's `baseline-390.png`. A per-run subfolder under `.playwright-mcp/` would be tidier
  than relying on naming discipline.
- **The reviewer seat was weak this run**: one substantive finding resting on a false premise,
  three speculative ones that did not materialise, four explicit non-findings. The designer was
  the more useful seat here — unsurprising for a purely visual brief.
- D2 (icon visibility) and D5 (header divider) remain open and declined, not rejected. Both are
  legitimate; both are aesthetic calls.
