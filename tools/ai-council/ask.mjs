#!/usr/bin/env node
/**
 * ai-council - one OpenAI-compatible client for every advisory seat.
 *
 * Only Claude Code writes to this repo. This script just carries a question to
 * an advisory model and brings the answer back as text.
 *
 * Usage
 *   node tools/ai-council/ask.mjs --seat designer --preflight
 *   node tools/ai-council/ask.mjs --seat designer --payload p.json --dry-run
 *   node tools/ai-council/ask.mjs --seat reviewer --payload p.json --out review.md
 *
 * Options
 *   --seat <name>       seat from config.json (required)
 *   --payload <file>    JSON: { prompt, images?: [path], system?: string }
 *   --preflight         ping the seat and exit; no payload needed
 *   --dry-run           print the resolved request shape without calling out
 *   --out <file>        write the response to a file instead of stdout
 *   --model <id>        override the configured model for this call
 *   --config <file>     override config.json
 *   --timeout <ms>      request timeout, default 120000
 *
 * Exit codes
 *   0  success
 *   2  usage or config error - the caller is wrong, fix the call
 *   3  seat unavailable after one retry - the caller should self-perform the role
 *   4  seat disabled in config
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

// Exits are raised, never taken with process.exit(): on Windows, exiting while an
// undici socket handle is still closing aborts the process with 127, which would
// destroy the very exit code the caller relies on to decide whether to fall back.
class Exit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

const die = (code, msg) => {
  throw new Exit(code, msg);
};

// Load .env without clobbering anything already in the environment.
function loadEnv() {
  const file = resolve(REPO, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out.flags.add(key);
    else out[key] = argv[++i];
  }
  return out;
}

function buildMessages(seat, payload) {
  const messages = [];
  const system = payload.system ?? seat.systemPrompt;
  if (system) messages.push({ role: 'system', content: system });

  const images = payload.images ?? [];
  if (!seat.vision || images.length === 0) {
    messages.push({ role: 'user', content: payload.prompt });
    return messages;
  }

  const content = [{ type: 'text', text: payload.prompt }];
  for (const img of images) {
    const path = resolve(process.cwd(), img);
    if (!existsSync(path)) die(2, `image not found: ${img}`);
    const mime = MIME[extname(path).toLowerCase()];
    if (!mime) die(2, `unsupported image type: ${img}`);
    const url = `data:${mime};base64,${readFileSync(path).toString('base64')}`;
    content.push({ type: 'image_url', image_url: { url } });
  }
  messages.push({ role: 'user', content });
  return messages;
}

async function call(seat, key, body, timeoutMs) {
  // Explicit controller with a cleared timer: AbortSignal.timeout leaves a live libuv
  // handle, and on Windows process.exit() before it fires aborts the process with 127 -
  // which would destroy the exit code the caller relies on to decide whether to fall back.
  const controller = new AbortController();
  const expiry = Object.assign(new Error(`request timed out after ${timeoutMs}ms`), {
    name: 'TimeoutError',
    retryable: true,
  });
  const timer = setTimeout(() => controller.abort(expiry), timeoutMs);
  try {
    const res = await fetch(`${seat.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, ...(seat.headers ?? {}) },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} ${detail.slice(0, 300)}`);
      // 429 is the normal free-tier failure and is worth one retry.
      err.retryable = res.status === 429 || res.status >= 500;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// A seat only counts as unavailable after a retry - free tiers throttle transiently.
async function callWithRetry(name, seat, key, body, timeoutMs) {
  try {
    return await call(seat, key, body, timeoutMs);
  } catch (err) {
    const transient = err.retryable || err.name === 'TimeoutError' || err.name === 'AbortError' || err instanceof TypeError;
    if (!transient) throw err;
    console.error(`ai-council: seat "${name}" ${err.message} - retrying once in 3s`);
    await new Promise((r) => setTimeout(r, 3000));
    return call(seat, key, body, timeoutMs);
  }
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  const name = args.seat;
  if (!name) die(2, 'missing --seat <name>');

  const configPath = args.config ? resolve(process.cwd(), args.config) : resolve(HERE, 'config.json');
  if (!existsSync(configPath)) die(2, `config not found: ${configPath}`);
  const seat = JSON.parse(readFileSync(configPath, 'utf8')).seats?.[name];
  if (!seat) die(2, `unknown seat "${name}" in ${configPath}`);
  if (seat.enabled === false) die(4, `seat "${name}" is disabled in config`);

  const model = args.model ?? seat.model;
  const key = process.env[seat.keyEnv];
  const timeout = Number(args.timeout ?? 120000);

  if (args.flags.has('preflight')) {
    if (!key) die(3, `seat "${name}" DOWN - ${seat.keyEnv} is not set in .env`);
    try {
      // Preflight keeps its own short budget so a dead seat is discovered cheaply, but an
      // explicit --timeout must win: on a slow link Gemini needs >10s even for a 1-token
      // ping, and hardcoding 10000 here reported a reachable seat as DOWN.
      const preflightTimeout = args.timeout ? timeout : 10000;
      await callWithRetry(name, seat, key, { model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 }, preflightTimeout);
    } catch (err) {
      die(3, `seat "${name}" DOWN - ${err.message}`);
    }
    console.log(`seat "${name}" UP - ${model}`);
    return 0;
  }

  if (!args.payload) die(2, 'missing --payload <file.json> (or use --preflight)');
  const payloadPath = resolve(process.cwd(), args.payload);
  if (!existsSync(payloadPath)) die(2, `payload not found: ${args.payload}`);
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  if (!payload.prompt) die(2, 'payload.prompt is required');

  const messages = buildMessages(seat, payload);
  const body = { model, messages, temperature: seat.temperature ?? 0.3, max_tokens: seat.maxTokens ?? 4000 };

  // --dry-run deliberately works without a key, so the wiring can be checked first.
  if (args.flags.has('dry-run')) {
    console.log(JSON.stringify({
      seat: name,
      model,
      baseUrl: seat.baseUrl,
      keyEnv: seat.keyEnv,
      keyPresent: Boolean(key),
      vision: Boolean(seat.vision),
      imagesAttached: seat.vision ? (payload.images?.length ?? 0) : 0,
      imagesIgnoredNoVision: seat.vision ? 0 : (payload.images?.length ?? 0),
      systemChars: messages[0]?.role === 'system' ? messages[0].content.length : 0,
      promptChars: payload.prompt.length,
    }, null, 2));
    return 0;
  }

  if (!key) die(3, `seat "${name}" unavailable - ${seat.keyEnv} is not set in .env`);

  let json;
  try {
    json = await callWithRetry(name, seat, key, body, timeout);
  } catch (err) {
    die(3, `seat "${name}" FAILED - ${err.message}`);
  }

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) die(3, `seat "${name}" returned an empty response`);

  // A seat that runs out of output budget still returns HTTP 200 with a partial answer,
  // and a critique cut off mid-finding reads exactly like a complete one. Reasoning models
  // make this routine - they spend the budget thinking before emitting a single word - so
  // say so loudly rather than let half a review pass for the whole thing.
  const finish = json.choices?.[0]?.finish_reason;
  const truncated = finish === 'length';
  if (truncated) {
    console.error(
      `ai-council: seat "${name}" TRUNCATED - finish_reason "length"; the answer is cut off. ` +
      `Raise maxTokens for this seat in config.json and re-run before trusting it.`,
    );
  }

  if (args.out) {
    writeFileSync(resolve(process.cwd(), args.out), text);
    console.error(`seat "${name}" ${truncated ? 'PARTIAL' : 'OK'} - ${text.length} chars -> ${args.out}`);
  } else {
    process.stdout.write(`${text}\n`);
  }
  return 0;
}

try {
  process.exitCode = await main();
} catch (err) {
  if (err instanceof Exit) {
    console.error(`ai-council: ${err.message}`);
    process.exitCode = err.code;
  } else {
    console.error(`ai-council: unexpected - ${err?.stack ?? err}`);
    process.exitCode = 1;
  }
}
