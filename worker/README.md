# Ask Ari worker

Cloudflare Worker that proxies chat requests from the website to the Claude API,
keeping the Anthropic API key server-side. Deployed independently of the static
site (which still deploys to GitHub Pages as before).

## One-time setup (run these yourself — they need your Cloudflare login)

```bash
cd worker
npm install

npx wrangler login

# Creates the KV namespace used for rate limiting and writes its id into
# wrangler.toml automatically.
npx wrangler kv namespace create RATE_LIMIT --binding RATE_LIMIT --update-config

# Stores your Anthropic key as an encrypted Worker secret (prompts for the value).
npx wrangler secret put ANTHROPIC_API_KEY

# Comma-separated list of origins allowed to call this Worker.
npx wrangler secret put ALLOWED_ORIGINS
# when prompted, enter: https://pathwaysthroughcomplexity.com,http://localhost:5173
```

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in your own API key for local testing
npm run dev                      # wrangler dev, defaults to http://localhost:8787
```

Smoke-test it directly:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"message": "What is Pathways Through Complexity about?"}'
```

## Deploy

```bash
npm run deploy
```

This prints the live URL (`https://ask-ari.<your-subdomain>.workers.dev`) — put
that in the frontend's `VITE_ASK_ARI_WORKER_URL` env var.

## What's in here

- `src/index.ts` — request handler: CORS, input validation, rate limiting, the
  Claude API call.
- `src/rateLimit.ts` — KV-backed per-IP (10 requests / 10 min) and global daily
  (200/day) caps. The global cap is a hard spend circuit-breaker independent of
  how traffic is distributed across visitors.
- `src/systemPrompt.ts` — Ari's persona, guardrails, and the book knowledge
  base. The persona and knowledge sections are placeholders pending the real
  content from the author (see the main plan/conversation) — guardrails are
  final.
