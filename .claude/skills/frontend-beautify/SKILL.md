---
name: frontend-beautify
description: Beautify a page of this site with an advisory AI council. Use when asked to beautify, restyle, or improve the look of a page, or when invoked as /frontend-beautify with a path to a brief. Implements the change first, then gets an independent UI/UX critique and code review from external models before revising.
argument-hint: <absolute path to a .md brief>
---

# Frontend Beautify

You are the **Orchestrator**. You are the only agent that writes to this repo. Two advisory
seats — a **UI/UX Designer** and a **Senior Reviewer** — critique your work but never touch it.

Full design rationale: `doc/prompts_and_plans/3.0_AI_orchestration_system.md`.

## Argument

The argument is an **absolute path to a markdown brief**. Quote it — folder names may contain
spaces. If no path was given, ask for one; do not invent a target.

Briefs live in `doc/briefs/`. `doc/briefs/beautify-home.md` is the annotated template — copy it
when Charles wants a brief for a new page, and keep new briefs in that folder.

Optional YAML frontmatter in the brief overrides config for this run:

```yaml
target: /                    # route, or a view file path
seats:
  designer: { model: gemini-2.5-pro }
  reviewer: { enabled: false }
revisionRounds: 1
```

Everything below the frontmatter is free-form: goals, constraints, out-of-scope.

## Delegation policy

**Always delegate when the seat answers.** There is no task-based routing and no judgment call
about whether an outside opinion is "worth it" — the point of this system is to observe multi-agent
cooperation, so the seats get the work whenever they are reachable.

Self-perform a role **only** when its seat is unavailable, and label it loudly in the report:

```
Designer: SELF - Gemini unreachable (HTTP 429 after retry)
          !! this critique is NOT independent
```

`ask.mjs` exit codes: `0` success · `2` bad call (fix it, don't fall back) · `3` seat
unavailable (self-perform) · `4` seat disabled in the brief or config (self-perform, note it).

## Phase A - Brief

1. Read the brief. Extract target, goals, constraints, out-of-scope.
2. Resolve the target to actual files via `client/src/router/index.js`, then **state the file list
   before editing anything**.

   Watch for the `ContentPage` case: `/movies`, `/games`, and everything under `/about/*` and
   `/workreport/*` have **no dedicated view**. They render through `components/ContentPage.vue`
   fed a content key, with the HTML in `client/src/content/`. "Beautify the movies page" therefore
   means `ContentPage.vue`, `assets/css/theme.css`, and/or `content/movies.html` — not a
   `MoviesView.vue`.

## Phase B - Build

3. Ensure the dev server is up: `npm run dev` (client on Vite, server on 3010). If it is not
   running, start it and say so — never screenshot a connection error.
4. **Baseline capture**, before any edit: `mcp__playwright__browser_navigate` to the target, then
   `browser_resize` + `browser_take_screenshot` at **390**, **768**, and **1440** px wide.
   Save as `.playwright-mcp/baseline-{390,768,1440}.png`. This is a regression reference only —
   **never send baselines to any seat.**

   The Playwright MCP server is sandboxed to the repo root and **cannot write to the scratchpad** —
   an absolute path outside the repo fails with "outside allowed roots", and a bare filename lands
   in the repo root. Always pass a path prefixed `.playwright-mcp/`; that directory is gitignored,
   so the captures never reach a commit.
5. Implement the beautification per the brief. Prefer minimal, targeted changes; keep the existing
   dark alien identity and the `theme.css` custom properties unless the brief says otherwise.
6. Re-navigate and confirm the page renders and `browser_console_messages` is clean.

## Phase C - Convene the council

7. Preflight both seats:

   ```bash
   node tools/ai-council/ask.mjs --seat designer --preflight
   node tools/ai-council/ask.mjs --seat reviewer --preflight
   ```

   Record each result. A seat disabled in the brief's frontmatter is skipped without a preflight.

8. **Only if at least one seat is UP**, capture the after-state: screenshots at the same three
   widths (`.playwright-mcp/after-{390,768,1440}.png`), the a11y tree via `browser_snapshot`,
   console messages, and `git diff`.

9. Write one payload JSON per live seat in your scratchpad, then call both **in parallel**:

   ```bash
   node tools/ai-council/ask.mjs --seat designer --payload designer.json --out designer.md
   node tools/ai-council/ask.mjs --seat reviewer --payload reviewer.json --out reviewer.md
   ```

   - **designer.json** — `prompt` holds the brief's goals, the page route, and the rendered markup;
     `images` lists the three `after-*.png` paths.
   - **reviewer.json** — `prompt` holds the `git diff`, the full text of each changed file, and any
     relevant `server/routes/*.js`. No images; this seat has no vision.

   Never place a raw API key in a payload, a command, or the report.

### Never send to a seat

`.env` · `server/data/` (SQLite db and sessions) · `server/protected-content/` (gated documents).
Delegating publishes content to a third party — treat these as off-limits regardless of relevance.

## Phase D - Judge and revise

10. Give every suggestion a verdict — `ACCEPT`, `REJECT`, or `DEFER` — plus a one-line reason.
    Never assign confidence percentages; they are fabricated precision. Reject anything that
    contradicts the brief's constraints, proposes a redesign or new dependency, or that you judge
    wrong — you are the engineer of record, not a relay.
11. **Revision pass:** apply only the `ACCEPT`ed items. This is a distinct write phase from B —
    do not restart or re-litigate the original build here.
12. Re-capture the same three widths. Confirm the revisions landed, the console is still clean,
    and nothing regressed against the Phase B baselines.

### revisionRounds

Default **1**. The brief may override it:

- **`0`** — implement, capture, consult, judge, report, but apply nothing. A pure second-opinion
  pass: you still record every verdict so Charles can see what was suggested.
- **`1`** — one revision pass applying the `ACCEPT`ed items. The normal case.
- **`2` or `3`** — after each pass, re-capture and re-consult the live seats with the updated
  screenshots and diff, then apply the newly accepted items.

**Stop early** as soon as a round produces no `ACCEPT`ed items — a further round would only burn
free-tier quota. Never exceed **3**; if a brief asks for more, cap it and say so in the report.

## Phase E - Report

13. Write `doc/ai-orchestration/runs/<page>-<YYYY-MM-DD>.md` containing:
    - the brief path and resolved file list
    - seat status per seat: `INDEPENDENT` or `SELF (reason)`
    - every suggestion with its verdict and reason
    - what actually changed, and the before/after check result
14. Show the diff. Leave `git add` / `commit` / `push` to Charles — always.

## Notes

- Debug the transport outside a run: `node tools/ai-council/ask.mjs --seat designer --payload p.json --dry-run`.
  `--dry-run` works without an API key, so wiring can be checked before keys exist.
- Missing keys are not an error — the seat reports DOWN and you self-perform, labelled.
- Swapping providers is a `tools/ai-council/config.json` edit; every seat speaks the
  OpenAI-compatible wire format, so no code changes.
