# ai-council

One OpenAI-compatible client that carries a question to an advisory model and brings the answer
back as text. Used by the `/frontend-beautify` skill, but runnable on its own for debugging.

This file documents **the script and its config only**. The workflow that calls it lives in
`.claude/skills/frontend-beautify/SKILL.md`; the design rationale lives in
`doc/prompts_and_plans/3.0_AI_orchestration_system.md`. Deliberately not repeated here.

## Setup

Add to `.env` in the repo root (already gitignored). A blank value counts as absent.

| Variable | Seat | Free tier |
|---|---|---|
| `GEMINI_API_KEY` | designer | https://aistudio.google.com |
| `OPENROUTER_API_KEY` | reviewer | https://openrouter.ai |

Neither is needed by the running site — these are development-only.

## Commands

```bash
# Is the seat reachable? One token, 10s timeout, costs nothing.
node tools/ai-council/ask.mjs --seat designer --preflight

# What would be sent? Works without an API key.
node tools/ai-council/ask.mjs --seat designer --payload p.json --dry-run

# The real call.
node tools/ai-council/ask.mjs --seat reviewer --payload p.json --out review.md
```

## Options

| Option | Meaning |
|---|---|
| `--seat <name>` | Seat from `config.json`. Required. |
| `--payload <file>` | JSON input. Required unless `--preflight`. |
| `--preflight` | Ping the seat and exit. No payload needed. |
| `--dry-run` | Print the resolved request shape without calling out. No key required. |
| `--out <file>` | Write the response to a file instead of stdout. |
| `--model <id>` | Override the configured model for this call. |
| `--config <file>` | Override `config.json`. |
| `--timeout <ms>` | Request timeout. Default `120000`. |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `2` | Usage or config error — the call is wrong, fix it; **do not** fall back |
| `3` | Seat unavailable after one retry — the caller should self-perform the role |
| `4` | Seat disabled in config |

`2` and `3` are kept distinct so a mistake in the call can never masquerade as a dead seat and
silently trigger the fallback.

## Payload

```json
{
  "prompt": "required - the question, plus any code or markup it needs",
  "images": ["path/to/shot.png"],
  "system": "optional - overrides the seat's systemPrompt"
}
```

`images` are inlined as base64 data URIs and are **ignored for seats with `vision: false`** —
`--dry-run` reports how many were dropped. Supported: `.png`, `.jpg`, `.jpeg`, `.webp`.

## Configuring a seat

Each seat in `config.json` is fully described by its config, so switching providers is an edit
here with no code change — everything speaks the OpenAI-compatible wire format.

| Field | Purpose |
|---|---|
| `baseUrl` | API root; `/chat/completions` is appended |
| `model` | Model id |
| `keyEnv` | **Name** of the env var holding the key — never the key itself |
| `vision` | Whether the seat accepts images |
| `systemPrompt` | The seat's role instructions |
| `temperature`, `maxTokens` | Defaults `0.3` / `4000` |
| `headers` | Extra request headers (e.g. OpenRouter's `X-Title`) |
| `enabled` | `false` skips the seat entirely — exit `4` |

Adding a third advisory seat is a new entry here; no code change.

> Never put a key value in `config.json` — it is committed. Keys belong in `.env`.
