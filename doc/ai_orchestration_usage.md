# AI Orchestration — Usage

How to run the `/frontend-beautify` workflow. Claude Code orchestrates and is the only agent that
writes code; two advisory seats — a **UI/UX Designer** (Gemini, reads screenshots) and a **Senior
Reviewer** (Poolside, reads the diff) — critique the work but never touch the repo.

Related docs, each with one job:

| File | Covers |
|---|---|
| **this file** | how to run it, and what you'll be asked |
| `tools/ai-council/README.md` | the `ask.mjs` script: flags, exit codes, model config, troubleshooting |
| `.claude/skills/frontend-beautify/SKILL.md` | the authoritative workflow the orchestrator follows |
| `doc/prompts_and_plans/3.0_AI_orchestration_system.md` | why it is built this way |
| `doc/ai-orchestration/runs/` | the record of every run |

## Before a run

1. **API keys in `.env`** — `GEMINI_API_KEY`, `OPENROUTER_API_KEY`. Blank counts as absent; a
   missing key is not an error, the seat just reports DOWN and Claude self-performs that role,
   labelled `NOT INDEPENDENT` in the report.
2. **Dev server running** — `npm run dev`. Screenshots come from the live page.
3. **Check the seats are alive** (optional, one second, costs nothing):
   ```bash
   node tools/ai-council/ask.mjs --seat designer --preflight
   node tools/ai-council/ask.mjs --seat reviewer --preflight
   ```
   A `404` here means the model id went stale, not that your key is bad — see the troubleshooting
   section of `tools/ai-council/README.md`.

## Running it

```
/frontend-beautify "<absolute path to a brief>"
/frontend-beautify "<absolute path to a brief>" --human-decision
```

Quote the path. Briefs live in `doc/briefs/`; copy `doc/briefs/beautify-home.md`, which is an
annotated template with every option documented inline.

## The two modes

Both modes are identical up to the point where the seats report back. Claude implements the change
first, then convenes the council — so both seats critique the **real rendered result**, not a
speculative plan. Neither seat is told what changed, or what Claude thinks is wrong.

### Default — Claude decides

Claude verifies each finding in the browser, marks it `ACCEPT` / `REJECT` / `DEFER`, applies the
accepted ones, re-verifies, and reports. `revisionRounds` in the brief controls how many passes
(default 1, hard cap 3, stops early when a round accepts nothing).

Use it when you want the page improved without supervision.

### `--human-decision` — you decide

Claude still **verifies every finding first** and recommends — it does not hand you raw critiques.
This matters: in the first live run 6 of 14 findings did not survive verification, two resting on
measurably false premises (one seat claimed line-height was "1.1–1.2" when it measured 1.5;
another claimed a set of CSS variables "never take effect" when all three were applied). Raw
findings would hand you that re-derivation.

You get one table, with **nothing applied yet**:

| # | Seat | Finding | What was measured | Recommendation |
|---|---|---|---|---|

Then you're asked what to do. Your answer is not limited to the list:

- **a subset** — "apply 2, 5 and 7"
- **all**, or **none**
- **something else entirely** — a fix neither seat raised, a different page, a change of
  direction. Claude treats it as the new task.
- **stop**

Claude does exactly what you said and nothing more — an item you passed over is recorded as
declined, not quietly applied anyway. If Claude thinks you're wrong it gets a sentence to say so,
then follows your instruction.

After each pass it re-verifies and asks again. **`revisionRounds` is ignored and there is no cap** —
the loop ends when you say stop. Claude will also ask before re-consulting the seats on a revised
page, since each round costs free-tier quota.

Use it when the page matters, when you want to see where your judgement and Claude's diverge, or
when you intend to steer mid-run.

## Writing a brief

Copy `doc/briefs/beautify-home.md`. The frontmatter is all optional overrides — anything omitted
falls back to `tools/ai-council/config.json`:

```yaml
---
target: /                # route, or a view file path
revisionRounds: 1        # ignored with --human-decision
humanDecision: true      # same as passing --human-decision; the flag wins
seats:
  designer: { model: gemini-3.5-flash }
  reviewer: { enabled: false }   # skip a seat to save quota
---
```

Below that, free-form: **Goal**, **Constraints**, **Out of scope**. Be specific about out-of-scope
— it is what stops the run from spreading into pages you did not want touched.

## After a run

- A report lands in `doc/ai-orchestration/runs/<brief-basename>-<date>.md` — named after the brief,
  so `doc/briefs/fix-header.md` produces `runs/fix-header-2026-08-03.md`: seat status, every finding with
  its verdict, what changed, and the before/after checks. In `--human-decision` mode it keeps
  **two columns** — Claude's recommendation and your decision, never merged, so the divergence is
  on record.
- Screenshots go to `.playwright-mcp/` (gitignored).
- Nothing is staged. `git add` / `commit` / `push` stay yours.

> If you commit between phases, the working-tree diff goes empty. The workflow detects this and
> falls back to `git diff HEAD~1 HEAD`, so the reviewer still receives the real change — but if
> both are empty it stops and asks rather than reviewing nothing.
