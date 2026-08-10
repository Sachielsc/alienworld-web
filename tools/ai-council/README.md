# ai-council

One OpenAI-compatible client that carries a question to an advisory model and brings the answer
back as text. Used by the `/frontend-beautify` skill, but runnable on its own for debugging.

This file documents **the script and its config only**. How to run the workflow is in
`docs/ai_orchestration_usage.md`; the workflow itself lives in
`.claude/skills/frontend-beautify/SKILL.md`; the design rationale lives in
`docs/prompts_and_plans/3.0_AI_orchestration_system.md`. Deliberately not repeated here.

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

`2` and `3` are kept distinct so a mistake in the call can never masquerade as a dead seat. The
fallback is always announced loudly in the run report — the risk this guards against is a loud
message that is *wrong*, blaming the provider for what was really a bad invocation. Exit `2`
produces no fallback at all: the run stops, the call gets fixed, and it is retried.

### Retry policy

Transient failures get **one** retry after a 3s backoff: `429`, any `5xx`, timeouts, and network
errors. Everything else fails immediately — a retired model will not un-retire in three seconds.
A retried call logs twice, which is normal:

```
seat "designer" HTTP 429 ... - retrying once in 3s
seat "designer" DOWN - HTTP 429 ...
```

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

## Troubleshooting

**Model ids go stale, and it is the most common failure.** Both default models had to be replaced
on the first real run: `deepseek/deepseek-r1:free` was withdrawn from OpenRouter's free tier
entirely, and `gemini-2.5-flash` became unavailable to newly created keys. Expect this again.

Read the status code first — it tells you whether the problem is the model, the account, or the key:

| Status | Means | Fix |
|---|---|---|
| `404` | Model retired, renamed, or not available to your key | Change `model` in `config.json` |
| `429` | Quota exhausted, or your tier does not include this model | Wait, or pick a model your tier covers |
| `401` / `403` | The key itself is wrong or revoked | Replace the key in `.env` |
| exit `2` | Bad invocation, not a provider problem | Fix the command |

Note that **only `401`/`403` implicate your key**. A `404` or `429` never means you need a new one —
keys are account-level and reach every model the account is allowed to use.

### Finding a model that works

Probe a candidate without editing anything — `--model` overrides config for one call:

```bash
node tools/ai-council/ask.mjs --seat designer --model gemini-3.6-flash --preflight
```

List what is actually available:

```bash
# Gemini - models the API offers to your key
node -e 'const k=require("fs").readFileSync(".env","utf8").match(/GEMINI_API_KEY=(.+)/)[1].trim();
fetch("https://generativelanguage.googleapis.com/v1beta/openai/models",{headers:{authorization:`Bearer ${k}`}})
.then(r=>r.json()).then(j=>console.log(j.data.map(m=>m.id).join("\n")))'

# OpenRouter - current free models, no key needed
node -e 'fetch("https://openrouter.ai/api/v1/models").then(r=>r.json())
.then(j=>console.log(j.data.filter(m=>m.id.endsWith(":free")).map(m=>m.id).join("\n")))'
```

**The Gemini listing is not proof.** `gemini-2.5-flash` appeared in it and still returned `404`.
The listing shows what the API offers; only `--preflight` shows what your key can actually call.

### Choosing a replacement

- Keep the two seats on **different vendors** — independence is the point of the council, and two
  models from one vendor tend to share blind spots.
- The designer seat needs `vision: true` and a model that accepts images; the reviewer does not.
- Verify with `--preflight` before committing the change. A model can return HTTP 200 yet produce
  empty content when a reasoning model spends the whole token budget thinking — preflight uses
  `max_tokens: 1`, so treat a pass as "reachable", and confirm real output with a `--dry-run`
  payload plus one live call before relying on it.
